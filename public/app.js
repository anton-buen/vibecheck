// ========== 8-Bit Sound Engine ==========
const SoundFX = {
  ctx: null,
  enabled: true,
  
  init() {
    this.enabled = localStorage.getItem('vibecheck_sound') !== 'false';
    this.updateUI();
  },
  
  createContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  },
  
  play(type) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.createContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      
      switch(type) {
        case 'tap':
          // Crisp high blip for UI interactions
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.05);
          break;
          
        case 'vibe1':
          oscillator.frequency.setValueAtTime(220, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.08);
          break;
          
        case 'vibe2':
          oscillator.frequency.setValueAtTime(293, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.08);
          break;
          
        case 'vibe3':
          oscillator.frequency.setValueAtTime(349, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.08);
          break;
          
        case 'vibe4':
          oscillator.frequency.setValueAtTime(440, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.08);
          break;
          
        case 'vibe5':
          oscillator.frequency.setValueAtTime(523, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.08);
          break;
          
        case 'submit':
          // 3-note confirmation arpeggio
          const notes = [440, 554, 659]; // A, C#, E
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.12);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.12);
          });
          break;
      }
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  },
  
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('vibecheck_sound', this.enabled);
    this.updateUI();
    if (this.enabled) this.play('tap');
  },
  
  updateUI() {
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.classList.toggle('sound-off', !this.enabled);
      btn.title = this.enabled ? 'Mute Sound' : 'Unmute Sound';
    }
  }
};

// ========== Chaotic Loading Screen Physics ==========
function initChaoticLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const octopus = document.getElementById('loadingOctopus');
  const progressBar = document.getElementById('loadingProgress');
  
  if (!octopus) return;

  // Progress animation
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

  // SUPER BOUNCY physics parameters
  const octopusSize = 120;
  
  // Start in center of viewport
  let x = (window.innerWidth - octopusSize) / 2;
  let y = (window.innerHeight - octopusSize) / 2;
  let velocityX = (Math.random() - 0.5) * 25;
  let velocityY = (Math.random() - 0.5) * 25;
  let rotation = 0;
  let rotationSpeed = (Math.random() - 0.5) * 15;
  
  const gravity = 0.8;
  const bounce = 1.15; // Gain energy on bounce
  const friction = 0.995;
  const chaosWobble = 0.08;
  const maxSpeed = 30;

  function animateOctopus() {
    // Get current viewport bounds
    const maxX = window.innerWidth - octopusSize;
    const maxY = window.innerHeight - octopusSize;
    
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
    
    // Left wall collision
    if (x < 0) {
      x = 0;
      velocityX = Math.abs(velocityX) * bounce;
      velocityY += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.8 + (Math.random() - 0.5) * 10;
    }
    
    // Right wall collision
    if (x > maxX) {
      x = maxX;
      velocityX = -Math.abs(velocityX) * bounce;
      velocityY += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.8 + (Math.random() - 0.5) * 10;
    }
    
    // Top wall collision
    if (y < 0) {
      y = 0;
      velocityY = Math.abs(velocityY) * bounce;
      velocityX += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.6 + (Math.random() - 0.5) * 12;
    }
    
    // Bottom wall collision
    if (y > maxY) {
      y = maxY;
      velocityY = -Math.abs(velocityY) * bounce;
      velocityX += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.6 + (Math.random() - 0.5) * 12;
      velocityY -= Math.random() * 8;
      velocityX += (Math.random() - 0.5) * 6;
    }
    
    // Safety clamp - ensure within bounds
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    const scale = 1 + Math.sin(Date.now() / 200) * 0.08;
    octopus.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
    
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

// ========== Configuration ==========
const PROMPTS = [
  "Kumusta ka today?",
  "What's weighing on you right now?",
  "Beyond 'okay lang' — how are you really?"
];

// Auto-refresh interval
let autoRefreshInterval = null;

// ========== Dark Mode System ==========
const DarkMode = {
  init() {
    // Only apply dark mode if explicitly saved by user
    // Default to light mode, ignore system preference
    const saved = localStorage.getItem('vibecheck_theme');
    
    if (saved === 'dark') {
      document.documentElement.classList.add('dark-mode');
    }
    // Light mode is the default, no need to add a class
    
    this.updateUI();
  },
  
  toggle() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    
    if (isDark) {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('vibecheck_theme', 'light');
    } else {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('vibecheck_theme', 'dark');
    }
    
    this.updateUI();
    SoundFX.play('tap');
  },
  
  updateUI() {
    const btn = document.getElementById('btn-theme-toggle');
    const isDark = document.documentElement.classList.contains('dark-mode');
    if (btn) {
      btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }
};

// ========== State ==========
let promptIndex = 0;
let selectedLevel = 3;
let selectedTags = new Set();
let pulses = [];
let roomMembers = [];
let currentRoom = 'general';
let userProfile = null;
let currentFilter = 'all';
let currentIcebreakerIndex = 0;

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
  document.getElementById('topnav-room-code').textContent = currentRoom;
  
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

// ========== Unified Brand Octopus System ==========
const OCTO_MOOD_THEMES = {
  1: {
    bodyMain: '#F44336',
    bodyDark: '#D32F2F',
    bodyLight: '#FF7961',
    rimColor: '#B0BEC5',
    brows: `<path d="M92,102 L122,113" stroke="#111111" stroke-width="5.5" stroke-linecap="round"/><path d="M188,101 L162,113" stroke="#111111" stroke-width="5.5" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13.5" fill="#111111"/><circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/><ellipse cx="174" cy="120" rx="10" ry="13" fill="#111111"/><circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<path d="M136,144 C138,133 149,133 151,144" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: ''
  },
  2: {
    bodyMain: '#FB8C00',
    bodyDark: '#E65100',
    bodyLight: '#FFB74D',
    rimColor: '#CFD8DC',
    brows: `<path d="M93,109 L121,102" stroke="#111111" stroke-width="5" stroke-linecap="round"/><path d="M187,108 L163,102" stroke="#111111" stroke-width="5" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13" fill="#111111"/><circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/><ellipse cx="174" cy="120" rx="10" ry="12.5" fill="#111111"/><circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<path d="M135,143 Q143.5,136 152,143" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: ''
  },
  3: {
    bodyMain: '#FBC02D',
    bodyDark: '#F57F17',
    bodyLight: '#FFF176',
    rimColor: '#CFD8DC',
    brows: `<path d="M95,104 Q108,102 120,104" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/><path d="M164,104 Q175,102 186,104" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13" fill="#111111"/><circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/><ellipse cx="174" cy="120" rx="10" ry="12.5" fill="#111111"/><circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<line x1="136" y1="140" x2="152" y2="140" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: `<ellipse cx="90" cy="134" rx="8" ry="4.5" fill="#F43F5E" opacity="0.22"/><ellipse cx="189" cy="132" rx="7.5" ry="4.2" fill="#F43F5E" opacity="0.22"/>`
  },
  4: {
    bodyMain: '#2EBD59',
    bodyDark: '#1B8A3D',
    bodyLight: '#69F0AE',
    rimColor: '#CFD8DC',
    brows: `<path d="M95,102 Q108,97 120,102" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/><path d="M164,102 Q175,97 186,102" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="121" rx="11" ry="13" fill="#111111"/><circle cx="112" cy="115" r="3.8" fill="#FFFFFF"/><ellipse cx="174" cy="120" rx="10" ry="12.5" fill="#111111"/><circle cx="177" cy="114" r="3.5" fill="#FFFFFF"/>`,
    mouth: `<path d="M134,137 Q143.5,147 153,137" fill="none" stroke="#111111" stroke-width="4.5" stroke-linecap="round"/>`,
    cheeks: `<ellipse cx="90" cy="134" rx="8.5" ry="4.8" fill="#F43F5E" opacity="0.35"/><ellipse cx="189" cy="132" rx="8" ry="4.5" fill="#F43F5E" opacity="0.35"/>`
  },
  5: {
    bodyMain: '#14B8A6',
    bodyDark: '#0F766E',
    bodyLight: '#5EEAD4',
    rimColor: '#CFD8DC',
    brows: `<path d="M94,99 Q108,93 120,99" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/><path d="M164,99 Q175,93 186,99" fill="none" stroke="#111111" stroke-width="4.8" stroke-linecap="round"/>`,
    eyes: `<ellipse cx="108" cy="120" rx="11.5" ry="13.5" fill="#111111"/><circle cx="112" cy="114" r="4" fill="#FFFFFF"/><ellipse cx="174" cy="119" rx="10.5" ry="13" fill="#111111"/><circle cx="177" cy="113" r="3.8" fill="#FFFFFF"/>`,
    mouth: `<path d="M132,135 Q143.5,152 155,135 Z" fill="#111111" stroke="#111111" stroke-width="2.5" stroke-linejoin="round"/><path d="M137,142 Q143.5,148 150,142" fill="#FF6B8B"/>`,
    cheeks: `<ellipse cx="90" cy="134" rx="9.5" ry="5.2" fill="#F43F5E" opacity="0.5"/><ellipse cx="189" cy="132" rx="9" ry="5" fill="#F43F5E" opacity="0.5"/>`
  }
};

function renderBrandOctopusSvg(level = 3, sizeClass = 'w-28 h-24') {
  const t = OCTO_MOOD_THEMES[level] || OCTO_MOOD_THEMES[3];
  const uid = `octo-${level}-${Math.random().toString(36).slice(2, 6)}`;

  return `
    <svg viewBox="0 0 260 220" class="${sizeClass}" aria-label="vibecheck mascot level ${level}">
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

const VIBE_CONFIG = {
  1: { label: "Heavy", color: "#F44336" },
  2: { label: "Drained", color: "#FB8C00" },
  3: { label: "Steady", color: "#FBC02D" },
  4: { label: "Good", color: "#2EBD59" },
  5: { label: "Great", color: "#14B8A6" }
};

// ========== API Integration ==========
async function loadPulses() {
  const syncBadge = document.getElementById("sync-status");
  try {
    const res = await fetch(`/api/pulses?room=${currentRoom}`);
    const data = await res.json();
    
    if (res.ok && data.room) {
      pulses = data.pulses || [];
      roomMembers = data.members || [];
      localStorage.setItem(`vibecheck_backup_${currentRoom}`, JSON.stringify(pulses));
      
      // Update sync status to Live
      syncBadge.textContent = "Live";
      syncBadge.classList.add("live");
      syncBadge.classList.remove("offline");
      syncBadge.title = "Synced across all devices";
    } else {
      throw new Error("Fallback to local");
    }
  } catch (err) {
    pulses = JSON.parse(localStorage.getItem(`vibecheck_backup_${currentRoom}`) || "[]");
    roomMembers = [];
    
    // Update sync status to Offline
    syncBadge.textContent = "Offline (Local)";
    syncBadge.classList.add("offline");
    syncBadge.classList.remove("live");
    syncBadge.title = "Using local storage only";
  }
  
  renderBoard();
  updatePriorityNotice();
  renderMemberPills();
  updateBoardBadge();
}

// Start auto-refresh polling (15 seconds)
function startAutoRefresh() {
  if (autoRefreshInterval) return;
  
  autoRefreshInterval = setInterval(() => {
    // Only refresh if tab is visible
    if (!document.hidden) {
      loadPulses();
    }
  }, 15000); // 15 seconds
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});

async function savePulse(payload) {
  const btn = document.getElementById("btn-submit");
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<svg class="icon icon-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Posting...';

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
      ...pulses.filter((p) => p.name.toLowerCase() !== payload.name.toLowerCase()),
    ];
    localStorage.setItem(`vibecheck_backup_${currentRoom}`, JSON.stringify(pulses));
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="20 6 9 17 4 12"/></svg> Posted!';
    SoundFX.play('submit');
    showToast("Check-in posted");
    setTimeout(() => (btn.innerHTML = originalHTML), 2000);
    await loadPulses();
    resetForm();
  }
}

// ========== UI Rendering ==========
function timeAgo(iso) {
  const diffMins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMins < 60) return `${diffMins}m ago`;
  const hrs = Math.floor(diffMins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function renderMemberPills() {
  const container = document.getElementById("member-pills");
  if (!container) return;

  if (roomMembers.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = roomMembers
    .map((member) => `
      <button type="button" class="member-pill" data-name="${escapeHtml(member.name)}" data-role="${escapeHtml(member.role)}">
        ${escapeHtml(member.name)}
      </button>
    `)
    .join("");

  container.querySelectorAll(".member-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      SoundFX.play('tap');
      container.querySelectorAll(".member-pill").forEach((b) => b.classList.remove("active"));
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
    filteredPulses = pulses.filter(p => Number(p.level) >= 3);
  }

  boardCount.textContent = `${pulses.length} today`;

  if (filteredPulses.length === 0) {
    if (pulses.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🐙</div>
          <h3>No check-ins yet</h3>
          <p>Be the first in <strong>${currentRoom}</strong> to share your honest vibe</p>
        </div>
      `;
    } else {
      list.innerHTML = `<div class="empty-state"><p>No check-ins matching this filter</p></div>`;
    }
    return;
  }

  const sorted = [...filteredPulses].sort((a, b) => a.level - b.level);

  list.innerHTML = sorted
    .map((p) => {
      const cfg = VIBE_CONFIG[p.level] || VIBE_CONFIG[3];
      const needsSupport = Number(p.level) <= 2;
      const tagsHtml = (p.tags || [])
        .map((t) => `<span class="pulse-tag">${escapeHtml(t)}</span>`)
        .join("");
      return `
        <div class="pulse-card ${needsSupport ? "needs-support" : ""}" data-level="${p.level}">
          <div class="pulse-header">
            <div class="pulse-identity">
              <div class="pulse-name">${escapeHtml(p.name)}</div>
              <div class="pulse-meta">
                <span class="pulse-role">${escapeHtml(p.role || "Peer")}</span>
                <span class="pulse-level" data-level="${p.level}">${p.level} — ${cfg.label}</span>
                <span class="pulse-time">${timeAgo(p.updatedAt)}</span>
              </div>
            </div>
            <button type="button" class="pulse-action" onclick="openReachOut('${escapeHtml(p.name).replace(/'/g, "\\'")}', ${p.level}, '${escapeHtml(p.note || "").replace(/'/g, "\\'")}', '${escapeHtml(p.role || "Peer").replace(/'/g, "\\'")}')">
              Reach Out
            </button>
          </div>
          ${p.note ? `<p class="pulse-note">"${escapeHtml(p.note)}"</p>` : ""}
          ${tagsHtml ? `<div class="pulse-tags">${tagsHtml}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

function updatePriorityNotice() {
  const notice = document.getElementById("priority-notice");
  const priorityCount = document.getElementById("priority-count");

  const struggling = pulses.filter((p) => Number(p.level) <= 2);
  if (struggling.length > 0) {
    notice.classList.remove("hidden");
    priorityCount.textContent = `${struggling.length} ${struggling.length === 1 ? 'peer needs' : 'peers need'} support`;
  } else {
    notice.classList.add("hidden");
  }
}

function updateBoardBadge() {
  const badge = document.getElementById("board-badge");
  const needsSupport = pulses.filter((p) => Number(p.level) <= 2).length;
  
  if (needsSupport > 0) {
    badge.textContent = needsSupport;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function updateMascotDisplay(level) {
  const cfg = VIBE_CONFIG[level];
  const mascotContainer = document.getElementById("main-mascot");
  
  // Update inner HTML while preserving the octo-float class on the container
  mascotContainer.innerHTML = renderBrandOctopusSvg(level);
  
  document.getElementById("mascot-level").textContent = `Level ${level} — ${cfg.label}`;
}

// ========== Modal Handlers ==========
window.openReachOut = function (name, level, note, role) {
  SoundFX.play('tap');
  const modal = document.getElementById("reachout-modal");
  const cfg = VIBE_CONFIG[level];
  
  document.getElementById("modal-peer-title").textContent = `Reach Out to ${name}`;
  document.getElementById("modal-peer-level").textContent = `Level ${level} — ${cfg.label}`;
  document.getElementById("modal-peer-context").textContent = note || `${name} checked in at ${level}/5 but didn't leave a note.`;

  currentIcebreakerIndex = 0;
  renderIcebreakers(name);
  modal.classList.remove("hidden");
};

function renderIcebreakers(name) {
  const messages = [
    [
      `Hey ${name}, saw your check-in today. No pressure to reply fast—I'm here if you want someone to listen.`,
      `Kumusta ${name}? Free for a quick call or coffee later? Just to check in, no pressure.`,
      `Thinking of you today, ${name}. Let me know if you need company or just want to talk.`,
    ],
    [
      `${name}, I noticed you're going through something. Want to grab coffee or just sit together?`,
      `No need to explain everything, ${name}. Just checking in—are you okay?`,
      `${name}, you don't have to be "okay lang" with me. What's really on your mind?`,
    ],
    [
      `Sending good vibes your way, ${name}. One day at a time, we're all in this together.`,
      `${name}, remember you're not alone in this. We're all here for you.`,
      `Proud of you for showing up today, ${name}. That takes real courage.`,
    ],
  ];

  const selectedSet = messages[currentIcebreakerIndex % messages.length];
  const box = document.getElementById("icebreaker-list");
  box.innerHTML = selectedSet
    .map((msg) => `
      <button type="button" class="icebreaker-btn" onclick="selectIcebreaker(this, '${escapeHtml(msg).replace(/'/g, "\\'")}')">
        ${msg}
      </button>
    `)
    .join("");
}

window.selectIcebreaker = function(btn, text) {
  SoundFX.play('tap');
  document.querySelectorAll('.icebreaker-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('btn-copy-message').dataset.message = text;
};

// ========== Event Handlers ==========
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  document.getElementById("toast-message").textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

function resetForm() {
  selectedTags.clear();
  document.getElementById("input-note").value = "";
  document.getElementById("note-counter").textContent = "0/110";
  document.querySelectorAll(".member-pill").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".tag-pill").forEach((c) => c.classList.remove("active"));
  selectedLevel = 3;
  updateVibeSelection(3);
}

function updateVibeSelection(level) {
  selectedLevel = level;
  document.querySelectorAll(".vibe-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.vibe-btn[data-level="${level}"]`).classList.add("active");
  updateMascotDisplay(level);
  SoundFX.play(`vibe${level}`);
}

function cyclePrompt() {
  SoundFX.play('tap');
  promptIndex = (promptIndex + 1) % PROMPTS.length;
  document.getElementById("daily-prompt").textContent = PROMPTS[promptIndex];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== Tab Navigation ==========
function switchTab(tabName) {
  SoundFX.play('tap');
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabName}`);
  });
}

// ========== Initialization ==========
document.addEventListener("DOMContentLoaded", () => {
  // Initialize dark mode
  DarkMode.init();
  
  // Initialize sound engine
  SoundFX.init();
  
  // Initialize room from URL
  currentRoom = getRoomFromURL();
  document.getElementById('topnav-room-code').textContent = currentRoom;
  
  // Load user profile
  userProfile = getUserProfile();
  if (userProfile) {
    document.getElementById("input-name").value = userProfile.name;
    document.getElementById("input-role").value = userProfile.role;
    
    // Show saved profile chip
    const savedProfileDisplay = document.getElementById("saved-profile-display");
    if (savedProfileDisplay) {
      savedProfileDisplay.querySelector('.profile-name').textContent = userProfile.name;
      savedProfileDisplay.querySelector('.profile-role').textContent = userProfile.role;
      savedProfileDisplay.classList.remove('hidden');
      document.getElementById('identity-inputs').style.display = 'none';
      document.getElementById('btn-edit-profile').classList.remove('hidden');
    }
  }
  
  // Start chaotic loading screen
  initChaoticLoadingScreen();
  
  // Render initial mascots
  document.getElementById("header-mascot").innerHTML = renderBrandOctopusSvg(1, 'w-8 h-7');
  document.getElementById("main-mascot").innerHTML = renderBrandOctopusSvg(selectedLevel);

  // Tab navigation
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Dark mode toggle
  document.getElementById("btn-theme-toggle").addEventListener("click", () => {
    DarkMode.toggle();
  });

  // Sound toggle
  document.getElementById("btn-sound-toggle").addEventListener("click", () => {
    SoundFX.toggle();
  });

  // Room actions
  document.getElementById("btn-room-info").addEventListener("click", () => {
    SoundFX.play('tap');
    document.getElementById("room-modal").classList.remove("hidden");
  });

  document.getElementById("close-room-modal").addEventListener("click", () => {
    SoundFX.play('tap');
    document.getElementById("room-modal").classList.add("hidden");
  });

  document.getElementById("btn-join-room").addEventListener("click", async () => {
    SoundFX.play('tap');
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

  document.getElementById("btn-copy-invite").addEventListener("click", () => {
    SoundFX.play('tap');
    const inviteLink = `${window.location.origin}/?room=${currentRoom}`;
    navigator.clipboard.writeText(inviteLink);
    showToast("Invite link copied!");
  });

  // Prompt cycling
  document.getElementById("btn-cycle-prompt").addEventListener("click", cyclePrompt);

  // Vibe level buttons
  document.querySelectorAll(".vibe-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateVibeSelection(Number(btn.dataset.level));
    });
  });

  // Tag toggles
  document.querySelectorAll(".tag-pill").forEach((chip) => {
    chip.addEventListener("click", () => {
      SoundFX.play('tap');
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

  // Filter tabs
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      SoundFX.play('tap');
      currentFilter = tab.dataset.filter;
      document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderBoard();
    });
  });

  // Profile edit toggle
  document.getElementById("btn-edit-profile")?.addEventListener("click", () => {
    SoundFX.play('tap');
    document.getElementById("saved-profile-display").classList.add("hidden");
    document.getElementById("identity-inputs").style.display = 'grid';
    document.getElementById("btn-edit-profile").classList.add("hidden");
  });

  // Submit form
  document.getElementById("checkin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("input-name").value.trim();
    const role = document.getElementById("input-role").value.trim();
    const note = document.getElementById("input-note").value.trim();
    
    if (!name) {
      showToast("Please enter your name");
      return;
    }

    // Save profile
    userProfile = saveUserProfile(name, role || "Student");
    
    // Check if new member
    const isNewMember = !roomMembers.some(m => m.name.toLowerCase() === name.toLowerCase());
    if (isNewMember) {
      await joinRoom(name, role || "Student");
    }

    // Save pulse
    savePulse({
      name,
      role: role || "Student",
      level: selectedLevel,
      tags: Array.from(selectedTags),
      note,
      prompt: PROMPTS[promptIndex],
    });
  });

  // Modal handlers
  document.getElementById("btn-refresh").addEventListener("click", () => {
    SoundFX.play('tap');
    loadPulses();
  });
  
  document.getElementById("close-reachout").addEventListener("click", () => {
    SoundFX.play('tap');
    document.getElementById("reachout-modal").classList.add("hidden");
  });
  
  document.getElementById("btn-about").addEventListener("click", () => {
    SoundFX.play('tap');
    document.getElementById("ethics-modal").classList.remove("hidden");
  });
  
  document.getElementById("close-ethics").addEventListener("click", () => {
    SoundFX.play('tap');
    document.getElementById("ethics-modal").classList.add("hidden");
  });

  // Icebreaker switching
  document.getElementById("btn-switch-icebreaker")?.addEventListener("click", () => {
    SoundFX.play('tap');
    currentIcebreakerIndex++;
    const name = document.getElementById("modal-peer-title").textContent.replace("Reach Out to ", "");
    renderIcebreakers(name);
  });

  // Copy message button
  document.getElementById("btn-copy-message")?.addEventListener("click", () => {
    SoundFX.play('submit');
    const message = document.getElementById("btn-copy-message").dataset.message || 
      document.querySelector('.icebreaker-btn.selected')?.textContent.trim() || '';
    
    if (message) {
      navigator.clipboard.writeText(message);
      const btn = document.getElementById("btn-copy-message");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      setTimeout(() => (btn.innerHTML = originalHTML), 2000);
    }
  });

  // Log reach-out button
  document.getElementById("btn-log-kumustahan")?.addEventListener("click", () => {
    SoundFX.play('submit');
    const btn = document.getElementById("btn-log-kumustahan");
    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="20 6 9 17 4 12"/></svg> Logged!';
    btn.disabled = true;
    showToast("Outreach logged");
    setTimeout(() => {
      document.getElementById("reachout-modal").classList.add("hidden");
      btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="20 6 9 17 4 12"/></svg> Log Outreach';
      btn.disabled = false;
    }, 1500);
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        SoundFX.play('tap');
        backdrop.classList.add('hidden');
      }
    });
  });

  // Initialize default vibe selection
  updateVibeSelection(3);

  // Load pulses and start auto-refresh
  loadPulses().then(() => {
    startAutoRefresh();
  });
});
