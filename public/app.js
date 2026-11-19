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
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let velocityX = (Math.random() - 0.5) * 25; // Much faster initial velocity!
  let velocityY = (Math.random() - 0.5) * 25;
  let rotation = 0;
  let rotationSpeed = (Math.random() - 0.5) * 15; // Faster spins!
  
  const gravity = 0.8; // Stronger gravity for more dramatic bounces
  const bounce = 1.15; // GAIN energy on bounce! (>1.0 = super bouncy)
  const friction = 0.995; // Less air resistance = stays fast longer
  const chaosWobble = 0.08; // MUCH more chaos!
  const maxSpeed = 30; // Cap maximum speed to keep it visible

  function animateOctopus() {
    // INTENSE chaos injection every frame!
    velocityX += (Math.random() - 0.5) * chaosWobble * 20;
    velocityY += (Math.random() - 0.5) * chaosWobble * 20;
    
    // Apply stronger gravity
    velocityY += gravity;
    
    // Update position
    x += velocityX;
    y += velocityY;
    
    // Minimal friction to keep energy high
    velocityX *= friction;
    velocityY *= friction;
    
    // Cap speed to prevent octopus from teleporting
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed > maxSpeed) {
      velocityX = (velocityX / speed) * maxSpeed;
      velocityY = (velocityY / speed) * maxSpeed;
    }
    
    // WILD rotation with more chaos
    rotation += rotationSpeed;
    rotationSpeed *= 0.985; // Slower decay = longer spins
    rotationSpeed += (Math.random() - 0.5) * 1.5; // More random spin changes
    
    // Bounce off walls with SUPER BOUNCY physics
    const octopusSize = 120;
    
    // Left/Right walls - CHAOTIC BOUNCES!
    if (x <= octopusSize / 2) {
      x = octopusSize / 2;
      velocityX = Math.abs(velocityX) * bounce; // Gain energy!
      velocityY += (Math.random() - 0.5) * 8; // Random Y velocity change
      rotationSpeed = -rotationSpeed * 1.8 + (Math.random() - 0.5) * 10;
    } else if (x >= window.innerWidth - octopusSize / 2) {
      x = window.innerWidth - octopusSize / 2;
      velocityX = -Math.abs(velocityX) * bounce;
      velocityY += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.8 + (Math.random() - 0.5) * 10;
    }
    
    // Top/Bottom walls - EVEN MORE CHAOTIC!
    if (y <= octopusSize / 2) {
      y = octopusSize / 2;
      velocityY = Math.abs(velocityY) * bounce;
      velocityX += (Math.random() - 0.5) * 8; // Random X velocity change
      rotationSpeed = -rotationSpeed * 1.6 + (Math.random() - 0.5) * 12;
    } else if (y >= window.innerHeight - octopusSize / 2) {
      y = window.innerHeight - octopusSize / 2;
      velocityY = -Math.abs(velocityY) * bounce;
      velocityX += (Math.random() - 0.5) * 8;
      rotationSpeed = -rotationSpeed * 1.6 + (Math.random() - 0.5) * 12;
      // BIG random kick upward from floor!
      velocityY -= Math.random() * 8;
      velocityX += (Math.random() - 0.5) * 6;
    }
    
    // Apply transform with slight scale variation for extra chaos
    const scale = 1 + Math.sin(Date.now() / 200) * 0.08;
    octopus.style.transform = `translate(${x - octopusSize / 2}px, ${y - octopusSize / 2}px) rotate(${rotation}deg) scale(${scale})`;
    
    // Continue animation
    if (!loadingScreen.classList.contains('hidden')) {
      requestAnimationFrame(animateOctopus);
    }
  }
  
  // Start animation
  animateOctopus();
  
  // Hide loading screen after minimum 5 seconds
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    clearInterval(progressInterval);
  }, 5000);
}

// ========== Configuration ==========
const PROMPTS = [
  "Kumusta ka today, 1–5?",
  "Anong pinakamabigat sa'yo ngayon?",
  'Beyond "Okay lang" — how is your energy right now?',
];

// ========== State ==========
let promptIndex = 0;
let selectedLevel = 3;
let selectedTags = new Set();
let pulses = [];
let roomMembers = [];
let currentRoom = 'general';
let userProfile = null;
let currentFilter = 'all';
let secondsLeft = 30;
let timerInterval = null;
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
  document.getElementById('currentRoomCode').textContent = currentRoom;
  
  await loadPulses();
  renderMemberPills();
}

const OCTO_MOOD_THEMES = {
  1: {
    // Exact match to favicon_vibecheck.jpg (Coral Red, Angry/Heavy)
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
    // Warm Orange, Tired/Drained
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
    // Golden Amber, Neutral / Sakto lang
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
    // Fresh Green, Calm / Maayos
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
    // Vibrant Teal, Happy / Masaya
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

      <!-- Back-Left Tentacle + Grey Underside Rim -->
      <path d="M52,142 C18,144 10,162 24,171 C38,179 62,171 76,161 Z" fill="${t.bodyDark}"/>
      <path d="M16,163 C22,173 46,174 68,163 L64,157 C45,166 25,165 18,158 Z" fill="${t.rimColor}"/>

      <!-- Back-Right Tentacle + Grey Underside Rim -->
      <path d="M196,138 C232,140 246,156 232,167 C218,177 192,169 178,158 Z" fill="${t.bodyDark}"/>
      <path d="M238,159 C232,169 208,171 186,160 L190,154 C209,163 229,162 236,154 Z" fill="${t.rimColor}"/>

      <!-- Main Smooth Dome Head -->
      <path d="M46,144 C44,72 82,34 134,34 C186,34 212,74 208,140 C206,156 174,164 132,164 C86,164 48,158 46,144 Z" fill="url(#${uid}-dome)"/>

      <!-- Left Gloss Highlight Arc -->
      <path d="M56,134 C54,82 80,48 122,44" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.28"/>

      <!-- Top Swirl Spiral -->
      <path d="M134,47 C138,44 146,46 146,51 C146,56 136,58 129,55 C121,52 122,43 133,41 C145,39 156,45 154,53" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.45"/>

      <!-- Front-Left Tentacle + Grey Underside Rim -->
      <path d="M74,152 C52,168 58,187 78,186 C95,185 104,171 108,159 Z" fill="${t.bodyMain}"/>
      <path d="M58,176 C64,187 86,188 102,174 L97,169 C84,180 67,180 61,171 Z" fill="${t.rimColor}"/>

      <!-- Front-Right Tentacle + Grey Underside Rim -->
      <path d="M168,151 C192,166 196,184 176,185 C158,186 146,172 142,159 Z" fill="${t.bodyMain}"/>
      <path d="M192,175 C186,186 164,187 148,173 L153,168 C166,179 183,179 189,170 Z" fill="${t.rimColor}"/>

      <!-- Front-Center Tentacle + Grey Underside Rim -->
      <path d="M107,158 C96,181 106,199 127,199 C148,199 156,181 144,158 Z" fill="${t.bodyMain}"/>
      <path d="M101,185 C108,199 144,199 151,185 L145,181 C139,192 113,192 107,181 Z" fill="${t.rimColor}"/>

      <!-- Facial Features (Cheeks, Eyes, Brows, Mouth) -->
      ${t.cheeks}
      ${t.eyes}
      ${t.brows}
      ${t.mouth}
    </svg>
  `;
}

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

// ========== State ==========
let promptIndex = 0;
let selectedLevel = 3;
let selectedTags = new Set();
let pulses = [];
let currentFilter = 'all';
let secondsLeft = 30;
let timerInterval = null;
let currentIcebreakerIndex = 0;

// ========== Unified Brand Octopus (Already defined above with OCTO_MOOD_THEMES) ==========

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
      syncBadge.textContent = "● Live on Vercel";
      syncBadge.classList.add("live");
    } else {
      throw new Error("Fallback to local");
    }
  } catch {
    pulses = JSON.parse(localStorage.getItem(`vibecheck_backup_${currentRoom}`) || "[]");
    roomMembers = [];
    syncBadge.textContent = "Local Preview";
    syncBadge.classList.remove("live");
  }
  renderBoard();
  updatePriorityBanner();
  renderMemberPills();
}

async function savePulse(payload) {
  const btn = document.getElementById("btn-submit");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Sharing pulse...';

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
    // Fallback to localStorage
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
    btn.innerHTML = '<span class="btn-icon">✅</span> Pulse Shared!';
    showToast("Sent Apir!");
    setTimeout(() => (btn.innerHTML = originalText), 2000);
    await loadPulses();
    resetForm();
  }
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
  if (!container) return;

  if (roomMembers.length === 0) {
    container.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.5rem 0;">No members yet. Be the first to join!</p>';
    return;
  }

  container.innerHTML = roomMembers
    .map((member) => `
      <button type="button" class="pill-choice" data-name="${escapeHtml(member.name)}" data-role="${escapeHtml(member.role)}">
        ${escapeHtml(member.name)}
      </button>
    `)
    .join("");

  // Re-attach event listeners
  container.querySelectorAll(".pill-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
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

  // Filter pulses based on current filter
  let filteredPulses = pulses;
  if (currentFilter === 'needs') {
    filteredPulses = pulses.filter(p => Number(p.level) <= 2);
  } else if (currentFilter === 'doing-well') {
    filteredPulses = pulses.filter(p => Number(p.level) >= 3);
  }

  boardCount.textContent = `${pulses.length} today`;

  if (filteredPulses.length === 0) {
    if (pulses.length === 0) {
      // Empty room - encouraging message
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🐙</div>
          <h3 style="color: var(--text-main); margin-bottom: 0.5rem; font-size: 1.1rem;">No check-ins yet today</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 320px; margin: 0 auto;">
            Be the first in <strong>${currentRoom}</strong> to break past "Okay lang" and share your honest vibe!
          </p>
        </div>
      `;
    } else {
      // Filter returned no results
      list.innerHTML = `<p style="color:#71717A;font-size:0.88rem;text-align:center;padding:2rem 1rem;">No check-ins matching this filter.</p>`;
    }
    return;
  }

  // Sort struggling peers (1-2) to the top
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
            <div class="pulse-avatar">${renderBrandOctopusSvg(p.level, 'w-10 h-9')}</div>
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
            ${needsCare ? "🤝 Kumustahin" : "👋 Send Apir"}
          </button>
        </div>
      `;
    })
    .join("");
}

function updatePriorityBanner() {
  const banner = document.getElementById("priority-banner");
  const priorityCount = document.getElementById("priority-count");
  const priorityNames = document.getElementById("priority-names");

  const struggling = pulses.filter((p) => Number(p.level) <= 2);
  if (struggling.length > 0) {
    banner.classList.remove("hidden");
    priorityCount.textContent = `${struggling.length} ${struggling.length === 1 ? 'peer needs' : 'peers need'} a kumustahan right now`;
    priorityNames.textContent = `Practice Pakikipagkapwa-tao & Buber's Personal Making Present—reach out without unsolicited advice.`;
  } else {
    banner.classList.add("hidden");
  }
}

function updateMascotDisplay(level) {
  const cfg = VIBE_CONFIG[level];
  document.getElementById("main-mascot").innerHTML = renderBrandOctopusSvg(level, 'w-28 h-24 octo-float');
  document.getElementById("mascot-level").textContent = `Level ${level} · ${cfg.label}`;
  document.getElementById("vibe-hint").textContent = cfg.hint;
}

// ========== Modal Handlers ==========
window.openReachOut = function (name, level, note) {
  const modal = document.getElementById("reachout-modal");
  const cfg = VIBE_CONFIG[level];
  
  document.getElementById("modal-peer-title").textContent = `Kumustahin si ${name}`;
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
        "${msg}"
      </button>
    `,
    )
    .join("");
}

window.selectIcebreaker = function(text) {
  // Highlight selected icebreaker
  document.querySelectorAll('.icebreaker-btn').forEach(btn => {
    btn.style.borderColor = btn.textContent.includes(text.substring(0, 20)) ? 'var(--brand-coral)' : 'var(--border)';
  });
  
  // Store for copy action
  document.getElementById('btn-copy-message').dataset.message = text;
};

// ========== Event Handlers ==========
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  document.querySelector(".toast-message").textContent = message;
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
  updateVibeSelection(3);
}

function updateVibeSelection(level) {
  selectedLevel = level;
  document.querySelectorAll(".vibe-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.vibe-btn[data-level="${level}"]`).classList.add("active");
  updateMascotDisplay(level);
}

function cyclePrompt() {
  promptIndex = (promptIndex + 1) % PROMPTS.length;
  document.getElementById("daily-prompt").textContent = PROMPTS[promptIndex];
  document.getElementById("prompt-box-text").textContent = `"${PROMPTS[promptIndex]}"`;
  document.getElementById("prompt-indicator").textContent = `${promptIndex + 1}/${PROMPTS.length}`;
}

function startTimer() {
  if (timerInterval) return;
  secondsLeft = 30;
  const timerBar = document.getElementById("timer-bar");
  timerBar.style.width = "100%";
  
  timerInterval = setInterval(() => {
    if (secondsLeft > 0) {
      secondsLeft--;
      const percentage = (secondsLeft / 30) * 100;
      timerBar.style.width = `${percentage}%`;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      timerBar.style.width = "0%";
    }
  }, 1000);
}

// ========== Utility Functions ==========
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

// ========== Initialization ==========
document.addEventListener("DOMContentLoaded", () => {
  // Initialize room from URL
  currentRoom = getRoomFromURL();
  document.getElementById('currentRoomCode').textContent = currentRoom;
  
  // Load user profile
  userProfile = getUserProfile();
  if (userProfile) {
    document.getElementById("input-name").value = userProfile.name;
    document.getElementById("input-role").value = userProfile.role;
  }
  
  // Start chaotic loading screen immediately
  initChaoticLoadingScreen();
  
  // Render initial mascots with unified brand octopus
  document.getElementById("header-mascot").innerHTML = renderBrandOctopusSvg(1, 'w-9 h-8');
  document.getElementById("main-mascot").innerHTML = renderBrandOctopusSvg(selectedLevel, 'w-28 h-24 octo-float');

  // Room actions
  document.getElementById("btn-switch-room").addEventListener("click", () => {
    document.getElementById("room-modal").classList.remove("hidden");
  });

  document.getElementById("btn-copy-invite").addEventListener("click", () => {
    const inviteLink = `${window.location.origin}/?room=${currentRoom}`;
    navigator.clipboard.writeText(inviteLink);
    showToast("📋 Link copied! Paste in your GC");
  });

  document.getElementById("close-room-modal").addEventListener("click", () => {
    document.getElementById("room-modal").classList.add("hidden");
  });

  document.getElementById("btn-join-room").addEventListener("click", async () => {
    const roomInput = document.getElementById("input-room-code");
    const newRoom = roomInput.value.trim();
    if (newRoom) {
      await switchRoom(newRoom);
      document.getElementById("room-modal").classList.add("hidden");
      roomInput.value = "";
      showToast(`🚪 Switched to room: ${currentRoom}`);
    }
  });

  // Handle Enter key in room input
  document.getElementById("input-room-code").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("btn-join-room").click();
    }
  });

  // Start timer on first interaction
  document.getElementById("checkin-form").addEventListener("focus", startTimer, { once: true, capture: true });

  // Prompt cycling
  document.getElementById("btn-cycle-prompt").addEventListener("click", cyclePrompt);

  // Vibe level 1-5 buttons
  document.querySelectorAll(".vibe-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateVibeSelection(Number(btn.dataset.level));
    });
  });

  // Tag toggles
  document.querySelectorAll(".tag-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
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

    // Save profile for auto-fill
    userProfile = saveUserProfile(name, role || "Student");
    
    // Check if this user is new to the room
    const isNewMember = !roomMembers.some(m => m.name.toLowerCase() === name.toLowerCase());
    
    // Join room if new member
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
  document.getElementById("btn-refresh").addEventListener("click", loadPulses);
  
  document.getElementById("close-reachout").addEventListener("click", () =>
    document.getElementById("reachout-modal").classList.add("hidden"),
  );
  
  document.getElementById("btn-ethics").addEventListener("click", () =>
    document.getElementById("ethics-modal").classList.remove("hidden"),
  );
  
  document.getElementById("close-ethics").addEventListener("click", () =>
    document.getElementById("ethics-modal").classList.add("hidden"),
  );
  
  document.getElementById("btn-back-ethics")?.addEventListener("click", () =>
    document.getElementById("ethics-modal").classList.add("hidden"),
  );

  // Priority banner button
  document.getElementById("btn-view-priority")?.addEventListener("click", () => {
    currentFilter = 'needs';
    document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    document.querySelector('.filter-pill[data-filter="needs"]').classList.add("active");
    renderBoard();
    window.scrollTo({ top: document.querySelector('.board-card').offsetTop - 100, behavior: 'smooth' });
  });

  // Icebreaker switching
  document.getElementById("btn-switch-icebreaker")?.addEventListener("click", () => {
    currentIcebreakerIndex++;
    const name = document.getElementById("modal-peer-title").textContent.replace("Kumustahin si ", "");
    renderIcebreakers(name);
  });

  // Copy message button
  document.getElementById("btn-copy-message")?.addEventListener("click", () => {
    const message = document.getElementById("btn-copy-message").dataset.message || 
      document.querySelector('.icebreaker-btn')?.textContent.replace(/"/g, '').trim() || '';
    
    if (message) {
      navigator.clipboard.writeText(message);
      const btn = document.getElementById("btn-copy-message");
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
      setTimeout(() => (btn.innerHTML = originalHtml), 2000);
    }
  });

  // Log kumustahan button
  document.getElementById("btn-log-kumustahan")?.addEventListener("click", () => {
    const btn = document.getElementById("btn-log-kumustahan");
    btn.innerHTML = '✅ Logged! Keep being present';
    btn.disabled = true;
    showToast("Kumustahan logged — practicing pakikipagkapwa-tao!");
    setTimeout(() => {
      document.getElementById("reachout-modal").classList.add("hidden");
      btn.innerHTML = '✓ Log Kumustahan Initiated';
      btn.disabled = false;
    }, 1500);
  });

  // Reset sample board
  document.getElementById("btn-reset-sample")?.addEventListener("click", () => {
    if (confirm("Reset the sample board? This will clear all check-ins.")) {
      pulses = [];
      localStorage.removeItem("vibecheck_backup");
      renderBoard();
      updatePriorityBanner();
      showToast("Board reset successfully");
    }
  });

  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.add('hidden');
      }
    });
  });

  // Close room modal on backdrop click
  document.getElementById("room-modal")?.addEventListener('click', (e) => {
    if (e.target.id === 'room-modal') {
      document.getElementById("room-modal").classList.add("hidden");
    }
  });

  // Initialize default vibe selection
  updateVibeSelection(3);

  // Load pulses
  loadPulses();
});
