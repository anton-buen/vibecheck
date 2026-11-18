const PROMPTS = [
  "Kumusta ka today, 1–5?",
  "Anong pinakamabigat sa'yo ngayon?",
  'Beyond "Okay lang" — how is your energy right now?',
  "What do you need most from your circle today?",
];

const VIBE_CONFIG = {
  1: {
    color: "#FF3B30",
    dark: "#C81E1E",
    label: "Mabigat",
    caption:
      'Heavy day. Your circle is here—no need to hide behind "Okay lang."',
  },
  2: {
    color: "#FF8A00",
    dark: "#C25900",
    label: "Pagod",
    caption: "Running low. Let someone check in on you today.",
  },
  3: {
    color: "#F5B800",
    dark: "#B45309",
    label: "Sakto lang",
    caption: "Steady, taking things one step at a time.",
  },
  4: {
    color: "#34C759",
    dark: "#15803D",
    label: "Maayos",
    caption: "Doing well and grounded today!",
  },
  5: {
    color: "#00B8A9",
    dark: "#0F766E",
    label: "Masaya",
    caption: "Thriving! Ready to hold space for a friend.",
  },
};

let promptIndex = 0;
let selectedLevel = 3;
let selectedTags = new Set();
let pulses = [];
let secondsLeft = 30;

// Render Reversible Plushie Octopus SVG dynamically by mood (1-5)
function renderOctopusSVG(level = 1) {
  const cfg = VIBE_CONFIG[level] || VIBE_CONFIG[1];
  let brows = "";
  let mouth = "";

  if (level === 1) {
    brows =
      '<path d="M36 42 L45 46 M64 42 L55 46" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>';
    mouth =
      '<path d="M46 58 Q50 53 54 58" stroke="#18181B" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  } else if (level === 2) {
    brows =
      '<path d="M36 45 L44 43 M64 45 L56 43" stroke="#18181B" stroke-width="2.6" stroke-linecap="round"/>';
    mouth =
      '<path d="M46 57 Q50 55 54 57" stroke="#18181B" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  } else if (level === 3) {
    mouth =
      '<line x1="46" y1="56" x2="54" y2="56" stroke="#18181B" stroke-width="2.6" stroke-linecap="round"/>';
  } else if (level === 4) {
    mouth =
      '<path d="M45 54 Q50 59 55 54" stroke="#18181B" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  } else {
    brows =
      '<path d="M37 42 Q41 39 44 42 M56 42 Q59 39 63 42" stroke="#18181B" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    mouth = '<path d="M44 53 Q50 62 56 53 Z" fill="#18181B"/>';
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
      <ellipse cx="42" cy="36" rx="7" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-18 42 36)"/>
      <!-- Eyes -->
      <circle cx="41" cy="50" r="3.5" fill="#18181B"/>
      <circle cx="59" cy="50" r="3.5" fill="#18181B"/>
      <circle cx="40" cy="49" r="1.1" fill="#FFF"/>
      <circle cx="58" cy="49" r="1.1" fill="#FFF"/>
      ${brows}
      ${mouth}
    </svg>
  `;
}

// Fetch shared pulses from Vercel API (with localStorage fallback)
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
}

// Save pulse to Vercel API
async function savePulse(payload) {
  const btn = document.getElementById("btn-submit");
  btn.disabled = true;
  btn.textContent = "Sharing pulse...";

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
    // Fallback if testing offline before connecting Vercel Redis
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
    btn.textContent = "Pulse Shared ✓";
    setTimeout(() => (btn.textContent = "Share Honest Pulse"), 1800);
    renderBoard();
  }
}

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
  const banner = document.getElementById("priority-banner");
  const priorityNames = document.getElementById("priority-names");

  const struggling = pulses.filter((p) => Number(p.level) <= 2);
  if (struggling.length > 0) {
    banner.classList.remove("hidden");
    priorityNames.textContent = `${struggling.map((s) => s.name).join(", ")} indicated a heavy day—reach out for a genuine 1-on-1 kumustahan.`;
  } else {
    banner.classList.add("hidden");
  }

  if (pulses.length === 0) {
    list.innerHTML = `<p style="color:#71717A;font-size:0.88rem;">No check-ins yet today. Be the first in your circle to break past "Okay lang."</p>`;
    return;
  }

  // Sort struggling peers (1-2) to the top for ethical sensitivity
  const sorted = [...pulses].sort((a, b) => a.level - b.level);

  list.innerHTML = sorted
    .map((p) => {
      const cfg = VIBE_CONFIG[p.level] || VIBE_CONFIG[3];
      const needsCare = Number(p.level) <= 2;
      const tagsHtml = (p.tags || [])
        .map((t) => `<span class="mini-tag">${t}</span>`)
        .join("");
      return `
        <div class="pulse-item ${needsCare ? "needs-care" : ""}">
          <div class="pulse-left">
            <div class="pulse-avatar">${renderOctopusSVG(p.level)}</div>
            <div class="pulse-meta">
              <h3>
                ${p.name}
                <span class="role-tag">${p.role || "Peer"}</span>
                <span class="role-tag" style="color:${cfg.dark};background:#FFF;border:1px solid ${cfg.color};">
                  ${p.level}/5 · ${cfg.label}
                </span>
              </h3>
              ${p.note ? `<p class="pulse-note">"${p.note}"</p>` : ""}
              ${tagsHtml ? `<div class="pulse-tags">${tagsHtml}</div>` : ""}
              <div class="pulse-time">Updated ${timeAgo(p.updatedAt)}</div>
            </div>
          </div>
          <button
            type="button"
            class="btn-kumusta ${needsCare ? "" : "gentle"}"
            onclick="openReachOut('${p.name.replace(/'/g, "\\'")}', ${p.level}, '${(p.note || "").replace(/'/g, "\\'")}')"
          >
            ${needsCare ? "Kumustahin ❤️" : "Say Hi"}
          </button>
        </div>
      `;
    })
    .join("");
}

window.openReachOut = function (name, level, note) {
  const modal = document.getElementById("reachout-modal");
  document.getElementById("modal-peer-title").textContent =
    `Kumustahin si ${name}`;
  document.getElementById("modal-peer-context").textContent = note
    ? `${name} checked in at ${level}/5 and shared: "${note}"`
    : `${name} checked in at ${level}/5 (${VIBE_CONFIG[level].label}).`;

  const messages = [
    `Hey ${name}, saw your vibecheck today. No pressure to reply fast—nandito lang ako if you want someone to listen.`,
    `Kumusta ${name}? Free ka ba for a quick 5-min call or tambay later? Kwentuhan lang, no acads talk.`,
    `Thinking of you today, ${name}. Let me know if you need company or pahinga lang.`,
  ];

  const box = document.getElementById("icebreaker-list");
  box.innerHTML = messages
    .map(
      (msg) => `
      <button type="button" class="icebreaker-btn" onclick="copyMsg(this, '${msg.replace(/'/g, "\\'")}')">
        📋 "${msg}"
      </button>
    `,
    )
    .join("");

  modal.classList.remove("hidden");
};

window.copyMsg = function (btn, text) {
  navigator.clipboard.writeText(text);
  const original = btn.innerHTML;
  btn.innerHTML = "✅ Copied! Ready to paste in Messenger / SMS";
  setTimeout(() => (btn.innerHTML = original), 2000);
};

// Initialize UI events
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("header-mascot").innerHTML = renderOctopusSVG(1);
  document.getElementById("main-mascot").innerHTML =
    renderOctopusSVG(selectedLevel);

  // Subtle 30-second timer
  const timerEl = document.getElementById("timer-badge");
  setInterval(() => {
    if (secondsLeft > 0) {
      secondsLeft--;
      timerEl.textContent = `00:${String(secondsLeft).padStart(2, "0")}`;
    }
  }, 1000);

  // Cycle daily prompts
  document.getElementById("btn-cycle-prompt").addEventListener("click", () => {
    promptIndex = (promptIndex + 1) % PROMPTS.length;
    document.getElementById("daily-prompt").textContent = PROMPTS[promptIndex];
  });

  // Quick name pills
  document.querySelectorAll(".pill-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".pill-choice")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("input-name").value = btn.dataset.name;
      document.getElementById("input-role").value = btn.dataset.role;
    });
  });

  // Vibe level 1-5 buttons
  document.querySelectorAll(".vibe-btn").forEach((btn) => {
    if (Number(btn.dataset.level) === selectedLevel)
      btn.classList.add("active");
    btn.addEventListener("click", () => {
      selectedLevel = Number(btn.dataset.level);
      document
        .querySelectorAll(".vibe-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("main-mascot").innerHTML =
        renderOctopusSVG(selectedLevel);
      document.getElementById("mascot-caption").textContent =
        VIBE_CONFIG[selectedLevel].caption;
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

  // Submit form
  document.getElementById("checkin-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("input-name").value.trim();
    const role = document.getElementById("input-role").value.trim();
    const note = document.getElementById("input-note").value.trim();
    if (!name) return;

    savePulse({
      name,
      role: role || "3CSC Peer",
      level: selectedLevel,
      tags: Array.from(selectedTags),
      note,
      prompt: PROMPTS[promptIndex],
    });
  });

  // Modals & Refresh
  document.getElementById("btn-refresh").addEventListener("click", loadPulses);
  document
    .getElementById("close-reachout")
    .addEventListener("click", () =>
      document.getElementById("reachout-modal").classList.add("hidden"),
    );
  document
    .getElementById("btn-ethics")
    .addEventListener("click", () =>
      document.getElementById("ethics-modal").classList.remove("hidden"),
    );
  document
    .getElementById("close-ethics")
    .addEventListener("click", () =>
      document.getElementById("ethics-modal").classList.add("hidden"),
    );

  loadPulses();
});
