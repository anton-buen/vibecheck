import { Redis } from '@upstash/redis';

const hasRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const redis = hasRedis
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const STORAGE_KEY = 'vibecheck:pulses';

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
    // GET: Fetch all recent pulses
    if (req.method === 'GET') {
      const pulses = (await redis.get(STORAGE_KEY)) || [];
      return res.status(200).json({ pulses });
    }

    // POST: Save or update a member's daily pulse
    if (req.method === 'POST') {
      const { name, role, level, tags, note, prompt } = req.body;

      if (!name || !level) {
        return res.status(400).json({ error: 'Name and vibe level (1-5) are required.' });
      }

      const existing = (await redis.get(STORAGE_KEY)) || [];

      const newEntry = {
        id: `${name.toLowerCase().trim()}-${Date.now()}`,
        name: name.trim(),
        role: role?.trim() || '3CSC Peer',
        level: Number(level),
        tags: Array.isArray(tags) ? tags : [],
        note: note?.trim() || '',
        prompt: prompt || 'Kumusta ka today, 1-5?',
        updatedAt: new Date().toISOString(),
      };

      // Replace existing entry for the same person today so the board stays clean
      const filtered = existing.filter(
        (item) => item.name.toLowerCase() !== newEntry.name.toLowerCase()
      );
      const updated = [newEntry, ...filtered].slice(0, 50);

      await redis.set(STORAGE_KEY, updated);
      return res.status(200).json({ pulse: newEntry, pulses: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Vercel API Error:', err);
    return res.status(500).json({ error: 'Failed to sync pulse data.' });
  }
}