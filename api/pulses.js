import { Redis } from '@upstash/redis';

const hasRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const redis = hasRedis
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

// Sanitize room ID to lowercase alphanumeric + hyphens only
function sanitizeRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') return 'general';
  return roomId.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 50) || 'general';
}

export default async function handler(req, res) {
  // Enable CORS for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!redis) {
    return res.status(503).json({
      error: 'Database not connected yet. Add Upstash Redis in Vercel Storage.',
      fallback: true,
    });
  }

  try {
    // GET: Fetch room pulses and members
    if (req.method === 'GET') {
      const roomId = sanitizeRoomId(req.query.room);
      const pulsesKey = `vibecheck:room:${roomId}:pulses`;
      const membersKey = `vibecheck:room:${roomId}:members`;
      
      const pulses = (await redis.get(pulsesKey)) || [];
      const members = (await redis.get(membersKey)) || [];
      
      return res.status(200).json({ 
        room: roomId,
        pulses,
        members 
      });
    }

    // POST: Handle different actions
    if (req.method === 'POST') {
      const { action, room, name, role, level, tags, note, prompt } = req.body;
      const roomId = sanitizeRoomId(room);
      const pulsesKey = `vibecheck:room:${roomId}:pulses`;
      const membersKey = `vibecheck:room:${roomId}:members`;

      // Action: Join room (add member profile)
      if (action === 'join') {
        if (!name) {
          return res.status(400).json({ error: 'Name is required to join a room.' });
        }

        const existingMembers = (await redis.get(membersKey)) || [];
        const memberExists = existingMembers.some(
          m => m.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (!memberExists) {
          const newMember = {
            name: name.trim(),
            role: role?.trim() || 'Peer',
            joinedAt: new Date().toISOString()
          };
          const updatedMembers = [...existingMembers, newMember];
          await redis.set(membersKey, updatedMembers);
        }

        const members = (await redis.get(membersKey)) || [];
        return res.status(200).json({ 
          room: roomId, 
          members,
          message: 'Joined room successfully' 
        });
      }

      // Action: Submit pulse (default)
      if (!name || !level) {
        return res.status(400).json({ error: 'Name and vibe level (1-5) are required.' });
      }

      const existingPulses = (await redis.get(pulsesKey)) || [];
      const existingMembers = (await redis.get(membersKey)) || [];

      // Auto-add member if not exists
      const memberExists = existingMembers.some(
        m => m.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (!memberExists) {
        const newMember = {
          name: name.trim(),
          role: role?.trim() || 'Peer',
          joinedAt: new Date().toISOString()
        };
        await redis.set(membersKey, [...existingMembers, newMember]);
      }

      const newEntry = {
        id: `${name.toLowerCase().trim()}-${Date.now()}`,
        name: name.trim(),
        role: role?.trim() || 'Peer',
        level: Number(level),
        tags: Array.isArray(tags) ? tags : [],
        note: note?.trim() || '',
        prompt: prompt || 'Kumusta ka today, 1-5?',
        updatedAt: new Date().toISOString(),
      };

      // Replace existing entry for the same person today
      const filtered = existingPulses.filter(
        (item) => item.name.toLowerCase() !== newEntry.name.toLowerCase()
      );
      const updated = [newEntry, ...filtered].slice(0, 50);

      await redis.set(pulsesKey, updated);
      
      return res.status(200).json({ 
        room: roomId,
        pulse: newEntry, 
        pulses: updated 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Vercel API Error:', err);
    return res.status(500).json({ error: 'Failed to sync pulse data.' });
  }
}