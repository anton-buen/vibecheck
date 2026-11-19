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

// ========== State ==========
let promptIndex = 0;
let selectedLevel = 3;
let selectedTags = new Set();
let pulses = [];
let currentFilter = 'all';
let secondsLeft = 30;
let timerInterval = null;
let currentIcebreakerIndex = 0;

// ========== Octopus SVG Renderer ==========
function renderAngryOctopusLogo() {
  // Static angry octopus logo (matches favicon)
  return `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <!-- Tentacles -->
      <ellipse cx="22" cy="75" rx="12" ry="6" fill="#FF6B6B" stroke="#D32F2F" stroke-width="1.5"/>
      <ellipse cx="78" cy="75" rx="12" ry="6" fill="#FF6B6B" stroke="#D32F2F" stroke-width="1.5"/>
      <ellipse cx="36" cy="82" rx="11" ry="6" fill="#FF6B6B" stroke="#D32F2F" stroke-width="1.5"/>
      <ellipse cx="64" cy="82" rx="11" ry="6" fill="#FF6B6B" stroke="#D32F2F" stroke-width="1.5"/>
      <ellipse cx="50" cy="85" rx="11" ry="6" fill="#FF6B6B" stroke="#D32F2F" stroke-width="1.5"/>
      
      <!-- Tentacle stripes -->
      <ellipse cx="22" cy="77" rx="9" ry="2.5" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="78" cy="77" rx="9" ry="2.5" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="36" cy="84" rx="8" ry="2.5" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="64" cy="84" rx="8" ry="2.5" fill="#E0E0E0" opacity="0.5"/>
      <ellipse cx="50" cy="87" rx="8" ry="2.5" fill="#E0E0E0" opacity="0.5"/>
      
      <!-- Dome Head -->
      <path d="M24 68 C24 35, 76 35, 76 68 C76 75, 24 75, 24 68 Z" fill="#FF6B6B" stroke="#D32F2F" stroke-width="1.8"/>
      
      <!-- Highlight spiral -->
      <circle cx="42" cy="42" r="5" fill="rgba(255, 255, 255, 0.3)"/>
      <path d="M 42 42 Q 44 40, 46 42 Q 48 44, 46 46" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      
      <!-- Eyes (angry) -->
      <ellipse cx="41" cy="55" rx="6" ry="8" fill="#000000"/>
      <ellipse cx="59" cy="55" rx="6" ry="8" fill="#000000"/>
      
      <!-- Eye whites -->
      <circle cx="42.5" cy="53" r="2" fill="#FFFFFF"/>
      <circle cx="60.5" cy="53" r="2" fill="#FFFFFF"/>
      
      <!-- Angry eyebrows -->
      <path d="M 35 48 L 45 52" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 65 48 L 55 52" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Angry frown -->
      <path d="M 43 64 Q 50 60 57 64" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `;
}

function renderOctopusSVG(level = 3) {
  const cfg = VIBE_CONFIG[level] || VIBE_CONFIG[3];
  let brows = "";
  let mouth = "";
  let cheeks = "";

  if (level === 1) {
    // Sad/overwhelmed: angled down eyebrows, frown
    brows = '<path d="M36 42 L45 46 M64 42 L55 46" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>';
    mouth = '<path d="M46 58 Q50 53 54 58" stroke="#18181B" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    cheeks = '<ellipse cx="35" cy="54" rx="4" ry="2.5" fill="rgba(255, 59, 48, 0.2)"/><ellipse cx="65" cy="54" rx="4" ry="2.5" fill="rgba(255, 59, 48, 0.2)"/>';
  } else if (level === 2) {
    // Tired: slightly worried brows, flat mouth
    brows = '<path d="M36 45 L44 43 M64 45 L56 43" stroke="#18181B" stroke-width="2.6" stroke-linecap="round"/>';
    mouth = '<path d="M46 57 Q50 55 54 57" stroke="#18181B" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    cheeks = '<ellipse cx="35" cy="54" rx="3.5" ry="2" fill="rgba(255, 138, 0, 0.15)"/><ellipse cx="65" cy="54" rx="3.5" ry="2" fill="rgba(255, 138, 0, 0.15)"/>';
  } else if (level === 3) {
    // Neutral: straight line mouth
    mouth = '<line x1="46" y1="56" x2="54" y2="56" stroke="#18181B" stroke-width="2.6" stroke-linecap="round"/>';
  } else if (level === 4) {
    // Happy: gentle smile
    mouth = '<path d="M45 54 Q50 59 55 54" stroke="#18181B" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    cheeks = '<ellipse cx="35" cy="54" rx="4" ry="2.5" fill="rgba(52, 199, 89, 0.2)"/><ellipse cx="65" cy="54" rx="4" ry="2.5" fill="rgba(52, 199, 89, 0.2)"/>';
  } else {
    // Very happy: excited brows, big smile
    brows = '<path d="M37 42 Q41 39 44 42 M56 42 Q59 39 63 42" stroke="#18181B" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    mouth = '<path d="M44 53 Q50 62 56 53" stroke="#18181B" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
    cheeks = '<ellipse cx="34" cy="54" rx="5" ry="3" fill="rgba(0, 184, 169, 0.25)"/><ellipse cx="66" cy="54" rx="5" ry="3" fill="rgba(0, 184, 169, 0.25)"/>';
  }

  return `
    <svg viewBox="0 0 100 86" width="100%" height="100%">
      <!-- Tentacles -->
      <ellipse cx="22" cy="68" rx="12" ry="6" fill="${cfg.color}" stroke="${cfg.dark}" stroke-width="2"/>
      <ellipse cx="78" cy="68" rx="12" ry="6" fill="${cfg.color}" stroke="${cfg.dark}" stroke-width="2"/>
      <ellipse cx="36" cy="74" rx="11" ry="6" fill="${cfg.color}" stroke="${cfg.dark}" stroke-width="2"/>
      <ellipse cx="64" cy="74" rx="11" ry="6" fill="${cfg.color}" stroke="${cfg.dark}" stroke-width="2"/>
      <ellipse cx="50" cy="76" rx="11" ry="6" fill="${cfg.color}" stroke="${cfg.dark}" stroke-width="2"/>
      <!-- Dome Head -->
      <path d="M24 62 C24 30, 76 30, 76 62 C76 68, 24 68, 24 62 Z" fill="${cfg.color}" stroke="${cfg.dark}" stroke-width="2.2"/>
      <!-- Highlight -->
      <ellipse cx="42" cy="36" rx="8" ry="3.5" fill="rgba(255,255,255,0.4)" transform="rotate(-18 42 36)"/>
      <!-- Eyes -->
      <circle cx="41" cy="50" r="3.8" fill="#18181B"/>
      <circle cx="59" cy="50" r="3.8" fill="#18181B"/>
      <circle cx="40" cy="49" r="1.3" fill="#FFF"/>
      <circle cx="58" cy="49" r="1.3" fill="#FFF"/>
      ${brows}
      ${cheeks}
      ${mouth}
    </svg>
  `;
}

// ========== API Integration ==========
async function loadPulses() {
  const syncBadge = document.getElementById("sync-status");
  try {
    const res = await fetch("/api/pulses");
    const data = await res.json();
    if (res.ok && Array.isArray(data.pulses)) {
      pulses = data.pulses;
      localStorage.setItem("vibecheck_backup", JSON.stringify(pulses));
      syncBadge.textContent = "● Live on Vercel";
      syncBadge.classList.add("live");
    } else {
      throw new Error("Fallback to local");
    }
  } catch {
    pulses = JSON.parse(localStorage.getItem("vibecheck_backup") || "[]");
    syncBadge.textContent = "Local Preview";
    syncBadge.classList.remove("live");
  }
  renderBoard();
  updatePriorityBanner();
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
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.pulses) {
      pulses = data.pulses;
      localStorage.setItem("vibecheck_backup", JSON.stringify(pulses));
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
    localStorage.setItem("vibecheck_backup", JSON.stringify(pulses));
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">✅</span> Pulse Shared!';
    showToast("Sent Apir!");
    setTimeout(() => (btn.innerHTML = originalText), 2000);
    renderBoard();
    updatePriorityBanner();
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
    list.innerHTML = `<p style="color:#71717A;font-size:0.88rem;text-align:center;padding:2rem 1rem;">No check-ins matching this filter yet.</p>`;
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
            <div class="pulse-avatar">${renderOctopusSVG(p.level)}</div>
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
  document.getElementById("main-mascot").innerHTML = renderOctopusSVG(level);
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
  // Render initial mascots
  document.getElementById("header-mascot").innerHTML = renderAngryOctopusLogo();
  document.getElementById("main-mascot").innerHTML = renderOctopusSVG(selectedLevel);

  // Start timer on first interaction
  document.getElementById("checkin-form").addEventListener("focus", startTimer, { once: true, capture: true });

  // Prompt cycling
  document.getElementById("btn-cycle-prompt").addEventListener("click", cyclePrompt);

  // Quick name pills
  document.querySelectorAll(".pill-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pill-choice").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.name) {
        document.getElementById("input-name").value = btn.dataset.name;
      }
      document.getElementById("input-role").value = btn.dataset.role;
    });
  });

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
  document.getElementById("checkin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("input-name").value.trim();
    const role = document.getElementById("input-role").value.trim();
    const note = document.getElementById("input-note").value.trim();
    if (!name) {
      alert("Please enter your name!");
      return;
    }

    savePulse({
      name,
      role: role || "3CSC · Group 2",
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

  // Initialize default vibe selection
  updateVibeSelection(3);

  // Load pulses
  loadPulses();
});
