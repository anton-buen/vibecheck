// ========== 8-Bit Web Audio Synthesizer ==========
const SoundFX = {
  audioContext: null,
  isMuted: false,

  init() {
    this.isMuted = localStorage.getItem('vibecheck_sound_muted') === 'true';
    this.updateSoundIcon();
  },

  getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  },

  play(type) {
    if (this.isMuted) return;
    
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'detent':
        // Short 8-bit tick for dial movement
        this.playTone(ctx, 660, now, 0.05, 0.15, 'square');
        break;
      
      case 'click':
        // UI interaction blip
        this.playTone(ctx, 520, now, 0.04, 0.12, 'square');
        break;
      
      case 'submit':
        // 3-note ascending arpeggio chime
        this.playTone(ctx, 523, now, 0.08, 0.2, 'triangle');
        this.playTone(ctx, 659, now + 0.08, 0.08, 0.2, 'triangle');
        this.playTone(ctx, 784, now + 0.16, 0.12, 0.25, 'triangle');
        break;
      
      case 'success':
        // Warm confirmation tone
        this.playTone(ctx, 880, now, 0.1, 0.3, 'sine');
        break;
    }
  },

  playTone(ctx, frequency, startTime, duration, volume = 0.2, waveType = 'square') {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  },

  toggle() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('vibecheck_sound_muted', this.isMuted);
    this.updateSoundIcon();
    if (!this.isMuted) {
      this.play('click');
    }
  },

  updateSoundIcon() {
    const iconOn = document.getElementById('icon-sound-on');
    const iconOff = document.getElementById('icon-sound-off');
    if (this.isMuted) {
      iconOn.classList.add('hidden');
      iconOff.classList.remove('hidden');
    } else {
      iconOn.classList.remove('hidden');
      iconOff.classList.add('hidden');
    }
  }
};

// ========== Configuration ==========
const PROMPTS = [
  "Kumusta ka today, 1–5?",
  "Anong pinakamabigat sa'yo ngayon?",
  'Beyond "Okay lang" — how is your energy right now?',
];

const VIBE_CONFIG = {
  1: {
    color: "#FF3B30",
    dark: "#C81E1E",
    label: "Mabigat",
    sublabel: "Overwhelmed",
    hint: "Heavy day — reach out if you need someone",
  },
  2: {
    color: "#FF8A00",
    dark: "#C25900",
    label: "Pagod",
    sublabel: "Drained",
    hint: "Running low on energy",
  },
  3: {
    color: "#F5B800",
    dark: "#B45309",
    label: "Sakto lang",
    sublabel: "Surviving",
    hint: "Pushing through today",
  },
  4: {
    color: "#34C759",
    dark: "#15803D",
    label: "Maayos",
    sublabel: "Doing Well",
    hint: "Feeling grounded and good",
  },
  5: {
    color: "#00B8A9",
    dark: "#0F766E",
    label: "Masaya",
    sublabel: "Thriving",
    hint: "Great day — ready to support others!",
  },
};

const OCTO_MOOD_THEMES = {
  1: {
    bodyMain: '#F44336',
    bodyDark: '#D32F2F',
    bodyLight: '#FF7961',
    rimColor: '#B0BEC5',
    brows: `<path d="M92,102 L122,113" stroke="#111111" stroke-width="5.5" stroke-linecap="round"/>
            <path d="M188,101 L162,113" stroke="#111111" stroke-width="5.5" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13.5" fill="#111111"/>
           <circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/>
           <ellipse cx="174" cy="120" rx="10" ry="13" fill="#111111"/>
           <circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<path d="M136,144 C138,133 149,133 151,144" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: ''
  },
  2: {
    bodyMain: '#FB8C00',
    bodyDark: '#E65100',
    bodyLight: '#FFB74D',
    rimColor: '#CFD8DC',
    brows: `<path d="M93,109 L121,102" stroke="#111111" stroke-width="5" stroke-linecap="round"/>
            <path d="M187,108 L163,102" stroke="#111111" stroke-width="5" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13" fill="#111111"/>
           <circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/>
           <ellipse cx="174" cy="120" rx="10" ry="12.5" fill="#111111"/>
           <circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<path d="M135,143 Q143.5,136 152,143" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: ''
  },
  3: {
    bodyMain: '#FBC02D',
    bodyDark: '#F57F17',
    bodyLight: '#FFF176',
    rimColor: '#CFD8DC',
    brows: `<path d="M95,104 Q108,102 120,104" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>
            <path d="M164,104 Q175,102 186,104" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13" fill="#111111"/>
           <circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/>
           <ellipse cx="174" cy="120" rx="10" ry="12.5" fill="#111111"/>
           <circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<line x1="136" y1="140" x2="152" y2="140" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: `<ellipse cx="90" cy="134" rx="8" ry="4.5" fill="#F43F5E" opacity="0.22"/>
             <ellipse cx="189" cy="132" rx="7.5" ry="4.2" fill="#F43F5E" opacity="0.22"/>`
  },
  4: {
    bodyMain: '#2EBD59',
    bodyDark: '#1B8A3D',
    bodyLight: '#69F0AE',
    rimColor: '#CFD8DC',
    brows: `<path d="M95,102 Q108,97 120,102" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>
            <path d="M164,102 Q175,97 186,102" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13" fill="#111111"/>
           <circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/>
           <ellipse cx="174" cy="120" rx="10" ry="12.5" fill="#111111"/>
           <circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<path d="M134,137 Q143.5,147 153,137" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: `<ellipse cx="90" cy="134" rx="8.5" ry="4.8" fill="#F43F5E" opacity="0.35"/>
             <ellipse cx="189" cy="132" rx="8" ry="4.5" fill="#F43F5E" opacity="0.35"/>`
  },
  5: {
    bodyMain: '#14B8A6',
    bodyDark: '#0F766E',
    bodyLight: '#5EEAD4',
    rimColor: '#CFD8DC',
    brows: `<path d="M94,99 Q108,93 120,99" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>
            <path d="M164,99 Q175,93 186,99" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="120" rx="11.5" ry="13.5" fill="#111111"/>
           <circle cx="112" cy="114" r="4" fill="#FFFFFF"/>
           <ellipse cx="174" cy="119" rx="10.5" ry="13" fill="#111111"/>
           <circle cx="177" cy="113" r="3.8" fill="#FFFFFF"/>`,
    mouth: `<path d="M132,135 Q143.5,152 155,135 Z" fill="#111111" stroke="#111111" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M137,142 Q143.5,148 150,142" fill="#FF6B8B"/>`,
    cheeks: `<ellipse cx="90" cy="134" rx="9.5" ry="5.2" fill="#F43F5E" opacity="0.5"/>
             <ellipse cx="189" cy="132" rx="9" ry="5" fill="#F43F5E" opacity="0.5"/>`
  }
};

function renderBrandOctopusSvg(level = 1, sizeClass = 'w-28 h-24') {
  const t = OCTO_MOOD_THEMES[level] || OCTO_MOOD_THEMES[1];
  const uid = `octo-${level}-${Math.random().toString(36).slice(2, 6)}`;

  return `
    <svg viewBox="0 0 260 220" class="${sizeClass} select-none" aria-label="vibecheck mascot level ${level}">
      <defs>
        <radialGradient id="${uid}-dome" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stop-color="${t.bodyLight}" />
          <stop offset="45%" stop-color="${t.bodyMain}" />
          <stop offset="100%" stop-color="${t.bodyDark}" />
        </radialGradient>
      </defs>
      <path d="M52,142 C18,144 10,162 24,171 C38,179 62,171 76,161 Z" fill="${t.bodyDark}"/>
      <path d="M16,163 C22,173 46,174 68,163 L64,157 C45,166 25,165 18,158 Z" fill="${t.rimColor}"/>
      <path d="M196,138 C232,140 246,156 232,167 C218,177 192,169 178,158 Z" fill="${t.bodyDark}"/>
      <path d="M238,159 C232,169 208,171 186,160 L190,154 C209,163 229,162 236,154 Z" fill="${t.rimColor}"/>
      <path d="M46,144 C44,72 82,34 134,34 C186,34 212,74 208,140 C206,156 174,164 132,164 C86,164 48,158 46,144 Z" fill="url(#${uid}-dome)"/>
      <path d="M56,134 C54,82 80,48 122,44" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.28"/>
      <path d="M134,47 C138,44 146,46 146,51 C146,56 136,58 129,55 C121,52 122,43 133,41 C145,39 156,45 154,53" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.45"/>
      <path d="M74,152 C52,168 58,187 78,186 C95,185 104,171 108,159 Z" fill="${t.bodyMain}"/>
      <path d="M58,176 C64,187 86,188 102,174 L97,169 C84,180 67,180 61,171 Z" fill="${t.rimColor}"/>
      <path d="M168,151 C192,166 196,184 176,185 C158,186 146,172 142,159 Z" fill="${t.bodyMain}"/>
      <path d="M192,175 C186,186 164,187 148,173 L153,168 C166,179 183,179 189,170 Z" fill="${t.rimColor}"/>
      <path d="M107,158 C96,181 106,199 127,199 C148,199 156,181 144,158 Z" fill="${t.bodyMain}"/>
      <path d="M101,185 C108,199 144,199 151,185 L145,181 C139,192 113,192 107,181 Z" fill="${t.rimColor}"/>
      ${t.cheeks}
      ${t.eyes}
      ${t.brows}
      ${t.mouth}
    </svg>
  `;
}

// ========== State ==========
let promptIndex = 0;
let selectedLevel = 3;
let selectedTags = new Set();
let pulses = [];
let roomMembers = [];
let currentRoom = 'general';
let userProfile = null;
let currentFilter = 'all';
let currentView = 'checkin';
let currentIcebreakerIndex = 0;

// ========== Radial Dial Controller ==========
const RadialDial = {
  svg: null,
  handle: null,
  progressArc: null,
  detentNodes: null,
  isDragging: false,
  currentLevel: 3,
  centerX: 150,
  centerY: 150,
  radius: 120,

  init() {
    this.svg = document.getElementById('radial-dial');
    this.handle = document.getElementById('dial-handle');
    this.progressArc = document.getElementById('progress-arc');
    this.detentNodes = document.querySelectorAll('.detent-node');

    // Touch and mouse events
    this.svg.addEventListener('mousedown', this.onPointerDown.bind(this));
    this.svg.addEventListener('touchstart', this.onPointerDown.bind(this), { passive: false });
    document.addEventListener('mousemove', this.onPointerMove.bind(this));
    document.addEventListener('touchmove', this.onPointerMove.bind(this), { passive: false });
    document.addEventListener('mouseup', this.onPointerUp.bind(this));
    document.addEventListener('touchend', this.onPointerUp.bind(this));

    // Click detent nodes
    this.detentNodes.forEach(node => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const level = parseInt(node.dataset.level);
        this.setLevel(level, true);
      });
    });

    this.setLevel(3, false);
  },

  onPointerDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.handle.classList.add('dragging');
    this.updateFromEvent(e);
  },

  onPointerMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.updateFromEvent(e);
  },

  onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.handle.classList.remove('dragging');
  },

  updateFromEvent(e) {
    const rect = this.svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    
    // Calculate angle (0 = top, clockwise)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    // Map angle to level 1-5
    // Level 1: 0°, Level 2: 72°, Level 3: 144°, Level 4: 216°, Level 5: 288°
    const segmentSize = 360 / 5;
    let level = Math.round(angle / segmentSize) + 1;
    if (level > 5) level = 1;
    
    if (level !== this.currentLevel) {
      this.setLevel(level, true);
    }
  },

  setLevel(level, playSound = true) {
    if (level < 1 || level > 5 || level === this.currentLevel) return;
    
    this.currentLevel = level;
    selectedLevel = level;
    
    if (playSound) {
      SoundFX.play('detent');
    }
    
    this.updateVisuals();
    updateVibeLabel(level);
  },

  updateVisuals() {
    const level = this.currentLevel;
    const config = VIBE_CONFIG[level];
    
    // Update progress arc
    const circumference = 2 * Math.PI * this.radius;
    const progress = level / 5;
    const dashOffset = circumference * (1 - progress);
    this.progressArc.style.strokeDashoffset = dashOffset;
    this.progressArc.style.stroke = config.color;
    
    // Update handle position and color
    // Level positions (degrees from top): 1=0, 2=72, 3=144, 4=216, 5=288
    const angles = { 1: 0, 2: 72, 3: 144, 4: 216, 5: 288 };
    const angle = angles[level];
    const radians = (angle - 90) * (Math.PI / 180);
    const handleX = this.centerX + this.radius * Math.cos(radians);
    const handleY = this.centerY + this.radius * Math.sin(radians);
    
    this.handle.setAttribute('cx', handleX);
    this.handle.setAttribute('cy', handleY);
    this.handle.style.fill = config.color;
    
    // Update detent nodes
    this.detentNodes.forEach(node => {
      const nodeLevel = parseInt(node.dataset.level);
      if (nodeLevel === level) {
        node.classList.add('active');
        node.style.fill = config.color;
      } else {
        node.classList.remove('active');
        node.style.fill = '#FFF';
      }
    });
  }
};

// ========== Room Management ==========
function getRoomFromURL() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  return room ? room.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 50) : 'general';
}

function setRoomInURL(roomId) {
  const url = new URL(window.location);
  url.searchParams.set('room', roomId);
  window.history.pushState({}, '', url);
}

function getUserProfile() {
  const saved = localStorage.getItem('vibecheck_profile');
  return saved ? JSON.parse(saved) : null;
}

function saveUserProfile(name, role) {
  const profile = { name, role, savedAt: new Date().toISOString() };
  localStorage.setItem('vibecheck_profile', JSON.stringify(profile));
  return profile;
}

async function switchRoom(newRoomId) {
  if (!newRoomId) return;
  
  currentRoom = newRoomId.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 50) || 'general';
  setRoomInURL(currentRoom);
  document.getElementById('room-label').textContent = currentRoom;
  document.getElementById('current-room-code').textContent = currentRoom;
  
  await loadPulses();
  renderMemberPills();
}

async function joinRoom(name, role) {
  try {
    const res = await fetch("/api/pulses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        action: 'join',
        room: currentRoom,
        name,
        role 
      }),
    });
    const data = await res.json();
    if (res.ok && data.members) {
      roomMembers = data.members;
      renderMemberPills();
    }
  } catch (err) {
    console.error('Failed to join room:', err);
  }
}

// ========== API Integration ==========
async function loadPulses() {
  const syncText = document.getElementById("sync-status");
  try {
    const res = await fetch(`/api/pulses?room=${currentRoom}`);
    const data = await res.json();
    if (res.ok && data.room) {
      pulses = data.pulses || [];
      roomMembers = data.members || [];
      localStorage.setItem(`vibecheck_backup_${currentRoom}`, JSON.stringify(pulses));
      syncText.textContent = "Live on Vercel";
      syncText.classList.add("live");
    } else {
      throw new Error("Fallback to local");
    }
  } catch {
    pulses = JSON.parse(localStorage.getItem(`vibecheck_backup_${currentRoom}`) || "[]");
    roomMembers = [];
    syncText.textContent = "Local Preview";
    syncText.classList.remove("live");
  }
  renderBoard();
  updatePriorityBanner();
  renderMemberPills();
  updateBoardBadge();
}

async function savePulse(payload) {
  const btn = document.getElementById("btn-submit");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Sending...';

  try {
    const res = await fetch("/api/pulses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, room: currentRoom }),
    });
    const data = await res.json();
    if (res.ok && data.pulses) {
      pulses = data.pulses;
      localStorage.setItem(`vibecheck_backup_${currentRoom}`, JSON.stringify(pulses));
    } else {
      throw new Error("API unavailable");
    }
  } catch {
    const localEntry = {
      ...payload,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString(),
    };
    pulses = [
      localEntry,
      ...pulses.filter(
        (p) => p.name.toLowerCase() !== payload.name.toLowerCase(),
      ),
    ];
    localStorage.setItem(`vibecheck_backup_${currentRoom}`, JSON.stringify(pulses));
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Check-in sent';
    SoundFX.play('submit');
    showToast("Check-in shared successfully");
    setTimeout(() => (btn.innerHTML = originalText), 2000);
    await loadPulses();
    resetForm();
  }
}

// ========== UI Rendering ==========
function timeAgo(iso) {
  const diffMins = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (diffMins < 60) return `${diffMins}m ago`;
  const hrs = Math.floor(diffMins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function renderMemberPills() {
  const container = document.getElementById("member-pills");
  const section = document.getElementById("member-pills-container");
  if (!container) return;

  if (roomMembers.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  container.innerHTML = roomMembers
    .map((member) => `
      <button type="button" class="pill-choice" data-name="${escapeHtml(member.name)}" data-role="${escapeHtml(member.role)}">
        ${escapeHtml(member.name)}
      </button>
    `)
    .join("");

  container.querySelectorAll(".pill-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      SoundFX.play('click');
      container.querySelectorAll(".pill-choice").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("input-name").value = btn.dataset.name;
      document.getElementById("input-role").value = btn.dataset.role;
    });
  });
}

function renderBoard() {
  const list = document.getElementById("pulse-list");
  const boardCount = document.getElementById("board-count");

  let filteredPulses = pulses;
  if (currentFilter === 'needs') {
    filteredPulses = pulses.filter(p => Number(p.level) <= 2);
  } else if (currentFilter === 'doing-well') {
    filteredPulses = pulses.filter(p => Number(p.level) >= 4);
  }

  boardCount.textContent = `${pulses.length} today`;

  if (filteredPulses.length === 0) {
    if (pulses.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">${renderBrandOctopusSvg(3, 'w-20 h-20')}</div>
          <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.1rem;">No check-ins yet today</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 320px; margin: 0 auto;">
            Be the first in <strong>${currentRoom}</strong> to share your honest vibe.
          </p>
        </div>
      `;
    } else {
      list.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem;text-align:center;padding:2rem 1rem;">No check-ins matching this filter.</p>`;
    }
    return;
  }

  const sorted = [...filteredPulses].sort((a, b) => a.level - b.level);

  list.innerHTML = sorted
    .map((p) => {
      const cfg = VIBE_CONFIG[p.level] || VIBE_CONFIG[3];
      const needsCare = Number(p.level) <= 2;
      const tagsHtml = (p.tags || [])
        .map((t) => `<span class="mini-tag">${escapeHtml(t)}</span>`)
        .join("");
      return `
        <div class="pulse-item ${needsCare ? "needs-care" : ""}" data-level="${p.level}">
          <div class="pulse-left">
            <div class="pulse-avatar">${renderBrandOctopusSvg(p.level, 'w-12 h-12')}</div>
            <div class="pulse-meta">
              <h3>
                ${escapeHtml(p.name)}
                <span class="role-tag">${escapeHtml(p.role || "Peer")}</span>
                <span class="role-tag" style="color:${cfg.dark};background:rgba(${hexToRgb(cfg.color)}, 0.15);border:1px solid ${cfg.color};">
                  ${p.level}/5 · ${cfg.label}
                </span>
              </h3>
              ${p.note ? `<p class="pulse-note">"${escapeHtml(p.note)}"</p>` : ""}
              ${tagsHtml ? `<div class="pulse-tags">${tagsHtml}</div>` : ""}
              <div class="pulse-time">Updated ${timeAgo(p.updatedAt)}</div>
            </div>
          </div>
          <button
            type="button"
            class="btn-kumusta ${needsCare ? "" : "gentle"}"
            onclick="openReachOut('${escapeHtml(p.name).replace(/'/g, "\\'")}', ${p.level}, '${escapeHtml(p.note || "").replace(/'/g, "\\'")}')"
          >
            ${needsCare ? "Kumusta" : "Send Support"}
          </button>
        </div>
      `;
    })
    .join("");
}

function updatePriorityBanner() {
  const banner = document.getElementById("priority-banner");
  const priorityCount = document.getElementById("priority-count");
  const priorityText = document.getElementById("priority-text");

  const struggling = pulses.filter((p) => Number(p.level) <= 2);
  if (struggling.length > 0) {
    banner.classList.remove("hidden");
    priorityCount.textContent = `${struggling.length} ${struggling.length === 1 ? 'peer needs' : 'peers need'} support`;
    priorityText.textContent = `Practice pakikipagkapwa-tao: reach out without unsolicited advice.`;
  } else {
    banner.classList.add("hidden");
  }
}

function updateBoardBadge() {
  const badge = document.getElementById('board-badge');
  const alert = document.getElementById('board-alert');
  
  if (pulses.length > 0) {
    badge.textContent = pulses.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
  
  const hasStrugglingPeers = pulses.some(p => Number(p.level) <= 2);
  if (hasStrugglingPeers) {
    alert.classList.remove('hidden');
  } else {
    alert.classList.add('hidden');
  }
}

function updateVibeLabel(level) {
  const cfg = VIBE_CONFIG[level];
  document.getElementById("vibe-level-num").textContent = level;
  document.getElementById("vibe-level-name").textContent = cfg.label;
  document.getElementById("vibe-level-hint").textContent = cfg.hint;
  
  // Update central mascot
  document.getElementById("central-mascot").innerHTML = renderBrandOctopusSvg(level, 'w-full h-full');
}

// ========== View Switching ==========
function switchView(viewName) {
  SoundFX.play('click');
  currentView = viewName;
  
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  
  document.getElementById(`view-${viewName}`).classList.add('active');
  const tab = document.getElementById(`tab-${viewName}`);
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
}

// ========== Modal Handlers ==========
window.openReachOut = function (name, level, note) {
  SoundFX.play('click');
  const modal = document.getElementById("reachout-modal");
  const cfg = VIBE_CONFIG[level];
  
  document.getElementById("modal-peer-title").textContent = `Kumusta si ${name}`;
  document.getElementById("modal-peer-level").textContent = `Level ${level} · ${cfg.label} / ${cfg.sublabel}`;
  document.getElementById("modal-peer-context").textContent = note
    ? `"${note}"`
    : `${name} checked in at ${level}/5 but didn't leave a note.`;

  currentIcebreakerIndex = 0;
  renderIcebreakers(name);
  modal.classList.remove("hidden");
};

function renderIcebreakers(name) {
  const messages = [
    [
      `Hey ${name}, saw your vibecheck today. No pressure to reply fast—nandito lang ako if you want someone to listen.`,
      `Kumusta ${name}? Free ka ba for a quick 5-min call or tambay later? Kwentuhan lang, no acads talk.`,
      `Thinking of you today, ${name}. Let me know if you need company or pahinga lang.`,
    ],
    [
      `${name}, I noticed you're going through something. Want to grab coffee or just sit together?`,
      `No need to explain everything, ${name}. Just checking in—are you okay?`,
      `${name}, you don't have to be "Okay lang" with me. What's really on your mind?`,
    ],
    [
      `Sending good vibes your way, ${name}! Laban lang, one day at a time.`,
      `${name}, remember you're not alone in this. We're all here for you.`,
      `Proud of you for showing up today, ${name}. That takes courage.`,
    ],
  ];

  const selectedSet = messages[currentIcebreakerIndex % messages.length];
  const box = document.getElementById("icebreaker-list");
  box.innerHTML = selectedSet
    .map(
      (msg) => `
      <button type="button" class="icebreaker-btn" onclick="selectIcebreaker('${escapeHtml(msg).replace(/'/g, "\\'")}')">
        ${msg}
      </button>
    `,
    )
    .join("");
}

window.selectIcebreaker = function(text) {
  SoundFX.play('click');
  document.querySelectorAll('.icebreaker-btn').forEach(btn => {
    btn.style.borderColor = btn.textContent.includes(text.substring(0, 20)) ? 'var(--coral-primary)' : 'var(--border-color)';
  });
  document.getElementById('btn-copy-message').dataset.message = text;
};

// ========== Event Handlers ==========
function showToast(message) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-message").textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function resetForm() {
  document.getElementById("input-name").value = "";
  document.getElementById("input-note").value = "";
  document.getElementById("note-counter").textContent = "0/110";
  selectedTags.clear();
  document.querySelectorAll(".pill-choice").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tag-chip").forEach((c) => c.classList.remove("active"));
  selectedLevel = 3;
  RadialDial.setLevel(3, false);
}

function cyclePrompt() {
  SoundFX.play('click');
  promptIndex = (promptIndex + 1) % PROMPTS.length;
  document.getElementById("daily-prompt").textContent = PROMPTS[promptIndex];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 0, 0";
}

// ========== Chaotic Loading Screen ==========
function initChaoticLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const octopus = document.getElementById('loadingOctopus');
  const progressBar = document.getElementById('loadingProgress');
  
  if (!octopus) return;

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 3 + 1;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
    }
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }, 100);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let velocityX = (Math.random() - 0.5) * 25;
  let velocityY = (Math.random() - 0.5) * 25;
  let rotation = 0;
  let rotationSpeed = (Math.random() - 0.5) * 15;
  
  const gravity = 0.8;
  const bounce = 1.15;
  const friction = 0.995;
  const chaosWobble = 0.08;
  const maxSpeed = 30;

  function animateOctopus() {
    velocityX += (Math.random() - 0.5) * chaosWobble * 20;
    velocityY += (Math.random() - 0.5) * chaosWobble * 20;
    velocityY += gravity;
    x += velocityX;
    y += velocityY;
    velocityX *= friction;
    velocityY *= friction;
    
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed > maxSpeed) {
      velocityX = (velocityX / speed) * maxSpeed;
      velocityY = (velocityY / speed) * maxSpeed;
    }
    
    rotation += rotationSpeed;
    rotationSpeed *= 0.985;
    rotationSpeed += (Math.random() - 0.5) * 1.5;
    
    const octopusSize = 120;
    
    if (x <= octopusSize / 2) {
      x = octopusSize / 2;
      velocityX = Math.abs(velocityX) * bounce;
      velocityY += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.8 + (Math.random() - 0.5) * 10;
    } else if (x >= window.innerWidth - octopusSize / 2) {
      x = window.innerWidth - octopusSize / 2;
      velocityX = -Math.abs(velocityX) * bounce;
      velocityY += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.8 + (Math.random() - 0.5) * 10;
    }
    
    if (y <= octopusSize / 2) {
      y = octopusSize / 2;
      velocityY = Math.abs(velocityY) * bounce;
      velocityX += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.6 + (Math.random() - 0.5) * 12;
    } else if (y >= window.innerHeight - octopusSize / 2) {
      y = window.innerHeight - octopusSize / 2;
      velocityY = -Math.abs(velocityY) * bounce;
      velocityX += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.6 + (Math.random() - 0.5) * 12;
      velocityY -= Math.random() * 8;
      velocityX += (Math.random() - 0.5) * 6;
    }
    
    const scale = 1 + Math.sin(Date.now() / 200) * 0.08;
    octopus.style.transform = `translate(${x - octopusSize / 2}px, ${y - octopusSize / 2}px) rotate(${rotation}deg) scale(${scale})`;
    
    if (!loadingScreen.classList.contains('hidden')) {
      requestAnimationFrame(animateOctopus);
    }
  }
  
  animateOctopus();
  
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    clearInterval(progressInterval);
  }, 5000);
}

// ========== Initialization ==========
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sound
  SoundFX.init();
  
  // Initialize room from URL
  currentRoom = getRoomFromURL();
  document.getElementById('room-label').textContent = currentRoom;
  document.getElementById('current-room-code').textContent = currentRoom;
  
  // Load user profile
  userProfile = getUserProfile();
  if (userProfile) {
    document.getElementById("input-name").value = userProfile.name;
    document.getElementById("input-role").value = userProfile.role;
    document.getElementById("profile-name").value = userProfile.name;
    document.getElementById("profile-role").value = userProfile.role;
  }
  
  // Start chaotic loading screen
  initChaoticLoadingScreen();
  
  // Initialize radial dial
  RadialDial.init();
  
  // Render header mascot
  document.getElementById("header-mascot").innerHTML = renderBrandOctopusSvg(1, 'w-8 h-8');

  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchView(tab.dataset.view);
    });
  });

  // Sound toggle
  document.getElementById('btn-sound-toggle').addEventListener('click', () => {
    SoundFX.toggle();
  });

  // Room menu
  document.getElementById("btn-room-menu").addEventListener("click", () => {
    SoundFX.play('click');
    document.getElementById("room-modal").classList.remove("hidden");
  });

  document.getElementById("close-room-modal").addEventListener("click", () => {
    document.getElementById("room-modal").classList.add("hidden");
  });

  document.getElementById("btn-copy-invite").addEventListener("click", () => {
    SoundFX.play('click');
    const inviteLink = `${window.location.origin}/?room=${currentRoom}`;
    navigator.clipboard.writeText(inviteLink);
    showToast("Invite link copied to clipboard");
  });

  document.getElementById("btn-join-room").addEventListener("click", async () => {
    const roomInput = document.getElementById("input-room-code");
    const newRoom = roomInput.value.trim();
    if (newRoom) {
      await switchRoom(newRoom);
      document.getElementById("room-modal").classList.add("hidden");
      roomInput.value = "";
      showToast(`Switched to room: ${currentRoom}`);
    }
  });

  document.getElementById("input-room-code").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("btn-join-room").click();
    }
  });

  // Profile menu
  document.getElementById("btn-profile-menu").addEventListener("click", () => {
    SoundFX.play('click');
    document.getElementById("profile-modal").classList.remove("hidden");
  });

  document.getElementById("close-profile-modal").addEventListener("click", () => {
    document.getElementById("profile-modal").classList.add("hidden");
  });

  document.getElementById("btn-save-profile").addEventListener("click", () => {
    SoundFX.play('click');
    const name = document.getElementById("profile-name").value.trim();
    const role = document.getElementById("profile-role").value.trim();
    if (name) {
      userProfile = saveUserProfile(name, role || "Student");
      document.getElementById("input-name").value = name;
      document.getElementById("input-role").value = role || "Student";
      document.getElementById("profile-modal").classList.add("hidden");
      showToast("Profile saved");
    }
  });

  // About modal
  document.getElementById("btn-about").addEventListener("click", () => {
    SoundFX.play('click');
    document.getElementById("ethics-modal").classList.remove("hidden");
  });

  document.getElementById("close-ethics").addEventListener("click", () => {
    document.getElementById("ethics-modal").classList.add("hidden");
  });

  // Prompt cycling
  document.getElementById("btn-cycle-prompt").addEventListener("click", cyclePrompt);

  // Tag toggles
  document.querySelectorAll(".tag-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      SoundFX.play('click');
      const tag = chip.dataset.tag;
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        chip.classList.remove("active");
      } else {
        selectedTags.add(tag);
        chip.classList.add("active");
      }
    });
  });

  // Note character counter
  document.getElementById("input-note").addEventListener("input", (e) => {
    const count = e.target.value.length;
    document.getElementById("note-counter").textContent = `${count}/110`;
  });

  // Filter pills
  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      SoundFX.play('click');
      currentFilter = pill.dataset.filter;
      document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      renderBoard();
    });
  });

  // Submit form
  document.getElementById("checkin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("input-name").value.trim();
    const role = document.getElementById("input-role").value.trim();
    const note = document.getElementById("input-note").value.trim();
    if (!name) {
      alert("Please enter your name!");
      return;
    }

    userProfile = saveUserProfile(name, role || "Student");
    
    const isNewMember = !roomMembers.some(m => m.name.toLowerCase() === name.toLowerCase());
    if (isNewMember) {
      await joinRoom(name, role || "Student");
    }

    savePulse({
      name,
      role: role || "Student",
      level: selectedLevel,
      tags: Array.from(selectedTags),
      note,
      prompt: PROMPTS[promptIndex],
    });
  });

  // Board controls
  document.getElementById("btn-refresh").addEventListener("click", () => {
    SoundFX.play('click');
    loadPulses();
  });
  
  document.getElementById("btn-view-priority")?.addEventListener("click", () => {
    SoundFX.play('click');
    currentFilter = 'needs';
    document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    document.querySelector('.filter-pill[data-filter="needs"]').classList.add("active");
    renderBoard();
  });

  // Reachout modal
  document.getElementById("close-reachout").addEventListener("click", () => {
    document.getElementById("reachout-modal").classList.add("hidden");
  });

  document.getElementById("btn-switch-icebreaker")?.addEventListener("click", () => {
    SoundFX.play('click');
    currentIcebreakerIndex++;
    const name = document.getElementById("modal-peer-title").textContent.replace("Kumusta si ", "");
    renderIcebreakers(name);
  });

  document.getElementById("btn-copy-message")?.addEventListener("click", () => {
    SoundFX.play('click');
    const message = document.getElementById("btn-copy-message").dataset.message || 
      document.querySelector('.icebreaker-btn')?.textContent.trim() || '';
    
    if (message) {
      navigator.clipboard.writeText(message);
      const btn = document.getElementById("btn-copy-message");
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied`;
      setTimeout(() => (btn.innerHTML = originalHtml), 2000);
    }
  });

  document.getElementById("btn-log-kumustahan")?.addEventListener("click", () => {
    SoundFX.play('success');
    const btn = document.getElementById("btn-log-kumustahan");
    btn.innerHTML = 'Logged — keep being present';
    btn.disabled = true;
    showToast("Kumustahan logged — practicing pakikipagkapwa-tao");
    setTimeout(() => {
      document.getElementById("reachout-modal").classList.add("hidden");
      btn.innerHTML = 'Log Kumustahan';
      btn.disabled = false;
    }, 1500);
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  // Load pulses
  loadPulses();
});
