// Frontend Multiplayer Client for 6-in-1 Football Quiz Party Hub

const AVATARS = ['⚽', '🦁', '🔥', '⚡', '👑', '🦊', '🐯', '🦅', '🐉', '🌟', '🎯', '🛡️'];

const MODE_META = {
  multi_club_pool: {
    badge: '🌟 โหมดใหม่: ลงสโมสรคนละทีม ล่าแต้มคูณ (Multi-Club Pool)',
    prompt: '👟 พิมพ์ชื่อนักฟุตบอลที่เคยอยู่สโมสรบนกระดาน! (ตรง 1 สโมสร = +1 แต้ม, ตรง 2 สโมสร = +2 แต้ม, ตรง 3 สโมสร = +3 แต้ม!):'
  },
  club_battle: {
    badge: '🏟️ โหมดคลาสสิก: ทายนักเตะประจำสโมสร (1 ทีม)',
    prompt: '👟 พิมพ์ชื่อนักฟุตบอลที่เคยค้าแข้งกับสโมสรนี้:'
  },
  lineup_quiz: {
    badge: '📋 โหมดที่ 2: ทายผัง 11 ตัวจริงในตำนาน',
    prompt: '👕 พิมพ์ชื่อนักฟุตบอลที่อยู่ในผัง 11 ตัวจริงด้านบน (ดูใบ้ธงชาติ + เบอร์เสื้อ):'
  },
  top10_stats: {
    badge: '📊 โหมดที่ 3: ทายท็อป 10 สถิติลูกหนัง',
    prompt: '🏅 พิมพ์ชื่อนักฟุตบอลที่ติดอยู่ใน Top 10 ของหัวข้อสถิตินี้:'
  },
  career_path: {
    badge: '🕵️‍♂️ โหมดที่ 4: ทายนักเตะจากเส้นทางค้าแข้ง (ฉันคือใคร?)',
    prompt: '🔍 จากตารางการย้ายทีมด้านบน นักเตะปริศนาคนนี้คือใคร?'
  },
  trivia_quiz: {
    badge: '⚡ โหมดที่ 5: ควิซแฟนพันธุ์แท้ 4 ตัวเลือก',
    prompt: '⚡ กดเลือกตัวเลือกที่ถูกต้องที่สุดด้านบน!'
  },
  footy_grid: {
    badge: '🔢 โหมดที่ 6: ตาราง XO ฟุตบอล 3x3',
    prompt: '🎯 คลิกเลือกช่องว่างในตาราง 3x3 ด้านบน แล้วพิมพ์ชื่อนักเตะที่ตรงกับทั้งแนวนอนและแนวตั้ง:'
  }
};

const state = {
  leagues: [],
  clubs: [],
  players: [],
  playerId: localStorage.getItem('fcq_playerId') || 'pl_' + Math.random().toString(36).slice(2, 10),
  playerName: localStorage.getItem('fcq_playerName') || '',
  avatar: localStorage.getItem('fcq_avatar') || '⚽',
  roomCode: null,
  room: null,
  eventSource: null,
  selectedLeagueFilter: 'all',
  clubSearchText: '',
  selectedAutocompletePlayerId: null,
  autocompleteItems: [],
  autocompleteIndex: -1,
  selectedGridCellIndex: 0,
  lastRenderedState: null
};

localStorage.setItem('fcq_playerId', state.playerId);

// Simple Web Audio API Sound Synthesizer
const sfx = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  beep(freq = 440, duration = 0.08, type = 'sine', gainVal = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
  lockIn() {
    this.beep(587.33, 0.09, 'triangle', 0.1);
    setTimeout(() => this.beep(880, 0.14, 'triangle', 0.12), 70);
  },
  success() {
    this.beep(523.25, 0.1, 'triangle', 0.12);
    setTimeout(() => this.beep(659.25, 0.1, 'triangle', 0.12), 90);
    setTimeout(() => this.beep(783.99, 0.2, 'triangle', 0.14), 180);
  },
  championFanfare() {
    const notes = [
      [523.25, 0, 0.14],
      [659.25, 130, 0.14],
      [783.99, 260, 0.14],
      [1046.5, 400, 0.35],
      [783.99, 620, 0.14],
      [1046.5, 760, 0.45]
    ];
    notes.forEach(([freq, delay, dur]) => {
      setTimeout(() => this.beep(freq, dur, 'triangle', 0.15), delay);
    });
  },
  urgentTick() {
    this.beep(720, 0.05, 'sine', 0.06);
  }
};

function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#fbbf24', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

  for (let i = 0; i < 65; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 2.2 + 's';
    piece.style.animationDelay = Math.random() * 0.8 + 's';
    container.appendChild(piece);
  }

  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

function normalizeText(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/ł/g, 'l')
    .replace(/ß/g, 'ss')
    .replace(/đ/g, 'd')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3200);
}

function spawnFloatingReaction(emoji, playerName) {
  const container = document.getElementById('floatingReactions');
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.style.right = Math.floor(Math.random() * 80) + 'px';
  el.innerHTML = `<span>${emoji}</span> <small>${playerName}</small>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

async function apiAction(action, payload = {}) {
  const res = await fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      roomCode: state.roomCode,
      playerId: state.playerId,
      ...payload
    })
  });
  return res.json();
}

async function loadDatabase(isRetry = false) {
  const res = await fetch('/api/data');
  const data = await res.json();
  state.leagues = data.leagues || [];
  state.clubs = data.clubs || [];
  state.players = data.players || [];
  renderLeagueTabs();
  renderClubsGrid();

  // If server is still syncing all 96 live clubs on cold start, re-fetch once after 4s
  if (!isRetry && state.clubs.length <= 35) {
    setTimeout(() => loadDatabase(true), 4000);
  }
}

function initHomeUI() {
  const nameInput = document.getElementById('playerNameInput');
  nameInput.value = state.playerName;
  nameInput.addEventListener('input', () => {
    state.playerName = nameInput.value.trim();
    localStorage.setItem('fcq_playerName', state.playerName);
  });

  const picker = document.getElementById('avatarPicker');
  picker.innerHTML = '';
  AVATARS.forEach((av) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'avatar-option' + (state.avatar === av ? ' selected' : '');
    btn.textContent = av;
    btn.addEventListener('click', () => {
      state.avatar = av;
      localStorage.setItem('fcq_avatar', av);
      picker.querySelectorAll('.avatar-option').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    picker.appendChild(btn);
  });

  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  if (roomParam) {
    document.getElementById('joinCodeInput').value = roomParam.toUpperCase();
  }

  document.getElementById('createRoomBtn').addEventListener('click', async () => {
    sfx.init();
    const playerName = document.getElementById('playerNameInput').value.trim() || 'กัปตันทีม';
    state.playerName = playerName;
    localStorage.setItem('fcq_playerName', playerName);

    const data = await apiAction('create_room', {
      playerName,
      avatar: state.avatar
    });
    if (data.ok) {
      enterRoom(data.roomCode, data.room);
    } else {
      showToast(data.error || 'ไม่สามารถสร้างห้องได้');
    }
  });

  document.getElementById('joinRoomBtn').addEventListener('click', async () => {
    sfx.init();
    const code = document.getElementById('joinCodeInput').value.trim().toUpperCase();
    if (!code) {
      showToast('กรุณากรอกรหัสห้อง 5 ตัวอักษร');
      return;
    }
    const playerName = document.getElementById('playerNameInput').value.trim() || 'นักเตะท้าดวล';
    state.playerName = playerName;
    localStorage.setItem('fcq_playerName', playerName);

    const res = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join_room',
        roomCode: code,
        playerId: state.playerId,
        playerName,
        avatar: state.avatar
      })
    });
    const data = await res.json();
    if (data.ok) {
      enterRoom(data.roomCode, data.room);
    } else {
      showToast(data.error || 'ไม่พบห้องนี้');
    }
  });
}

function enterRoom(roomCode, initialRoom) {
  state.roomCode = roomCode;
  state.room = initialRoom;
  state.lastRenderedState = null;

  window.history.replaceState({}, '', `?room=${roomCode}`);

  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  document.getElementById('displayRoomCode').textContent = roomCode;

  connectStream(roomCode);
  renderRoom();
}

function connectStream(roomCode) {
  if (state.eventSource) {
    state.eventSource.close();
  }
  const es = new EventSource(`/api/stream?roomCode=${encodeURIComponent(roomCode)}&playerId=${encodeURIComponent(state.playerId)}`);
  state.eventSource = es;

  es.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.room) {
        const prevState = state.room ? state.room.state : null;
        const prevTime = state.room ? state.room.timeLeft : null;
        state.room = payload.room;

        if (payload.type === 'timer_tick') {
          updateTimerOnly();
          if (state.room.timeLeft <= 5 && state.room.timeLeft > 0 && state.room.timeLeft !== prevTime) {
            sfx.urgentTick();
          }
          return;
        }

        if (payload.type === 'club_picked') {
          sfx.lockIn();
        }

        if (payload.type === 'top10_updated' && payload.toastMessage) {
          sfx.success();
          showToast(payload.toastMessage);
        }

        if (payload.type === 'wave_revealed' && prevState !== 'REVEAL') {
          const myRes = (state.room.lastWaveResults || []).find((r) => r.playerId === state.playerId);
          if (myRes && myRes.pointsEarned > 0) {
            sfx.success();
          }
        }

        if (state.room.state === 'GAME_OVER' && prevState !== 'GAME_OVER') {
          sfx.championFanfare();
          launchConfetti();
        }

        if (payload.type === 'reaction' && payload.reaction) {
          spawnFloatingReaction(payload.reaction.emoji, payload.reaction.playerName);
        }

        renderRoom();
      }
    } catch (e) {}
  };
}

function updateTimerOnly() {
  if (!state.room) return;
  const mode = state.room.settings?.gameMode || 'multi_club_pool';
  const numEl = document.getElementById('countdownNumber');
  const circleEl = document.getElementById('countdownCircle');
  const barEl = document.getElementById('timerProgressBar');

  if (mode === 'top10_stats') {
    if (numEl) numEl.textContent = '∞';
    if (circleEl) circleEl.classList.remove('urgent');
    if (barEl) {
      barEl.style.width = '100%';
      barEl.classList.remove('urgent');
    }
    return;
  }

  const t = state.room.timeLeft;
  const total = state.room.totalTime || 15;

  if (numEl) numEl.textContent = t;
  if (circleEl) {
    circleEl.classList.toggle('urgent', t <= 5);
  }
  if (barEl) {
    const pct = Math.max(0, Math.min(100, (t / total) * 100));
    barEl.style.width = `${pct}%`;
    barEl.classList.toggle('urgent', t <= 5);
  }
}

function renderRoom() {
  const room = state.room;
  if (!room) return;

  const gameMode = room.settings.gameMode || 'multi_club_pool';

  document.getElementById('headerTimeLimit').textContent = `${room.settings.timeLimit}s`;
  document.getElementById('lobbyTimeValue').textContent = room.settings.timeLimit;
  document.getElementById('duplicateRuleSelect').value = room.settings.duplicateRule || 'strict_unique';
  document.getElementById('clubSelectModeInput').value = room.settings.clubSelectMode || 'random';
  const poolSizeRuleEl = document.getElementById('clubPoolSizeRuleSelect');
  if (poolSizeRuleEl) {
    poolSizeRuleEl.value = room.settings.clubPoolSizeRule || 'fixed_3';
  }
  const diffSelect = document.getElementById('triviaDifficultySelect');
  if (diffSelect) {
    diffSelect.value = room.settings.triviaDifficulty || 'all';
  }

  const targetScore = room.settings.targetScore !== undefined ? room.settings.targetScore : 10;
  document.getElementById('targetScoreSelect').value = String(targetScore);
  document.getElementById('headerTargetScore').textContent =
    targetScore > 0 ? targetScore.toLocaleString() : 'ไม่จำกัด';

  document.querySelectorAll('[data-time-preset]').forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.timePreset, 10) === room.settings.timeLimit);
  });

  document.querySelectorAll('[data-mode]').forEach((card) => {
    card.classList.toggle('active', card.dataset.mode === gameMode);
  });

  renderScoreboard(room);

  const views = {
    LOBBY: 'lobbyView',
    SELECTING_CLUB: 'selectingClubView',
    PLAYING: 'playingView',
    REVEAL: 'revealView',
    GAME_OVER: 'gameOverView'
  };

  Object.entries(views).forEach(([key, viewId]) => {
    const el = document.getElementById(viewId);
    if (el) el.classList.toggle('active', room.state === key);
  });

  if (room.state === 'SELECTING_CLUB') {
    renderPickedClubsPool(room);
    renderClubsGrid();
  } else if (room.state === 'PLAYING') {
    renderPlayingView(room);
  } else if (room.state === 'REVEAL') {
    renderRevealView(room);
  } else if (room.state === 'GAME_OVER') {
    renderGameOverView(room);
  }

  state.lastRenderedState = room.state;
}

function renderScoreboard(room) {
  document.getElementById('playerCountLabel').textContent = room.players.length;
  const listEl = document.getElementById('playersList');
  listEl.innerHTML = '';

  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const targetScore = room.settings.targetScore || 0;

  sorted.forEach((p, idx) => {
    const item = document.createElement('div');
    const isMe = p.id === state.playerId;
    item.className =
      'player-item' +
      (isMe ? ' is-me' : '') +
      (room.state === 'PLAYING' && p.hasSubmitted ? ' submitted' : '');

    let statusHtml = '';
    if (room.state === 'SELECTING_CLUB') {
      if (p.pickedClubCount > 0) {
        statusHtml = `<div class="player-status locked">✅ เลือกสโมสรแล้ว</div>`;
      } else {
        statusHtml = `<div class="player-status">⏳ กำลังเลือกสโมสร...</div>`;
      }
    } else if (room.state === 'PLAYING') {
      if (p.hasSubmitted) {
        const sec = p.submittedTimeMs ? (p.submittedTimeMs / 1000).toFixed(1) : '';
        statusHtml = `<div class="player-status locked">🔒 ตอบแล้ว! (${sec}s)</div>`;
      } else {
        statusHtml = `<div class="player-status">⏳ กำลังคิดคำตอบ...</div>`;
      }
    } else {
      const streakBadge = p.streak >= 2 ? ` 🔥x${p.streak}` : '';
      const targetTag = targetScore > 0 && p.score >= targetScore ? ' 🏆ถึงเป้า!' : '';
      statusHtml = `<div class="player-status">อันดับ #${idx + 1}${streakBadge}${targetTag}</div>`;
    }

    const hostTag = p.id === room.hostId ? ' 👑' : '';
    const meTag = isMe ? ' (คุณ)' : '';
    const removeBtn =
      p.isBot
        ? `<button class="remove-bot-btn" data-remove-id="${p.id}" title="ลบบอท">✖</button>`
        : '';

    item.innerHTML = `
      <div class="player-left">
        <span class="player-avatar">${p.avatar}</span>
        <div class="player-meta">
          <div class="player-name">${p.name}${hostTag}${meTag}</div>
          ${statusHtml}
        </div>
      </div>
      <div class="player-right">
        <span class="player-score">${p.score}</span>
        ${removeBtn}
      </div>
    `;
    listEl.appendChild(item);
  });

  listEl.querySelectorAll('[data-remove-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      apiAction('remove_player', { targetPlayerId: btn.dataset.removeId });
    });
  });
}

function renderFlagHTML(flagEmoji, flagUrl) {
  if (flagUrl) {
    return `<img class="flag-img" src="${flagUrl}" alt="${flagEmoji || ''}" loading="lazy" onerror="this.outerHTML='<span>${flagEmoji || '⚽'}</span>'" />`;
  }
  return `<span>${flagEmoji || '⚽'}</span>`;
}

function renderClubCrestHTML(club, sizePx = 44) {
  const shortText = club?.short || 'FC';
  const c1 = club?.primaryColor || '#10b981';
  const c2 = club?.secondaryColor === '#FFFFFF' ? '#1e293b' : club?.secondaryColor || '#0f172a';
  const fallbackStyle = `width:${sizePx}px;height:${sizePx}px;font-size:${Math.round(sizePx * 0.34)}px;background:linear-gradient(135deg, ${c1}, ${c2});`;

  if (club?.badgeUrl) {
    return `
      <div class="club-crest has-badge" style="width:${sizePx}px;height:${sizePx}px;">
        <img class="club-badge-img" src="${club.badgeUrl}" alt="${club.name || shortText}" loading="lazy" onerror="this.parentElement.classList.remove('has-badge');this.parentElement.style.background='linear-gradient(135deg, ${c1}, ${c2})';this.outerHTML='${shortText}';" />
      </div>
    `;
  }
  return `<div class="club-crest" style="${fallbackStyle}">${shortText}</div>`;
}

function renderPlayerPhotoHTML(photoUrl, fallbackIcon = '⚽', className = 'player-photo-avatar') {
  if (photoUrl) {
    return `<img class="${className}" src="${photoUrl}" alt="Player" loading="lazy" onerror="this.outerHTML='<span class=\\'player-photo-fallback\\'>${fallbackIcon}</span>'" />`;
  }
  return `<span class="player-photo-fallback">${fallbackIcon}</span>`;
}

function renderPickedClubsPool(room) {
  const picked = room.pickedClubs || [];
  const targetSize = room.targetClubPoolSize || Math.max(room.players.length, 3);
  document.getElementById('pickedPoolCount').textContent = picked.length;
  document.getElementById('pickedPoolTarget').textContent = targetSize;

  const myPicks = picked.filter((pc) => pc.playerId === state.playerId);
  const maxPerPlayer = room.maxClubsPerPlayer || 1;
  const heading = document.getElementById('clubSelectHeading');

  if (myPicks.length >= maxPerPlayer) {
    heading.textContent = '✅ คุณเลือกสโมสรเรียบร้อยแล้ว! กำลังรอเพื่อนคนอื่นเลือกสโมสร...';
  } else if (maxPerPlayer > 1) {
    heading.textContent = `เลือกสโมสรลงกระดานได้สูงสุด ${maxPerPlayer} ทีม (เลือกแล้ว ${myPicks.length}/${maxPerPlayer})`;
  } else {
    heading.textContent = 'พิมพ์หรือคลิกเลือกสโมสรของคุณ 1 ทีม (เปิดโชว์ทันที ห้ามซ้ำกับเพื่อน!)';
  }

  const listEl = document.getElementById('pickedClubsPoolList');
  listEl.innerHTML = '';

  picked.forEach((pc) => {
    const c = pc.club;
    const pill = document.createElement('div');
    pill.className = 'picked-club-pill';
    pill.innerHTML = `
      ${renderClubCrestHTML(c, 38)}
      <div>
        <div style="font-weight:700;font-size:0.95rem;">${c?.name || pc.clubId}</div>
        <div style="font-size:0.74rem;color:#34d399;">เลือกโดย ${pc.playerAvatar} ${pc.playerName}</div>
      </div>
    `;
    listEl.appendChild(pill);
  });

  // Render waiting slots
  const remaining = Math.max(0, targetSize - picked.length);
  for (let i = 0; i < remaining; i++) {
    const slotNum = picked.length + i + 1;
    const isAutoBonusSlot = room.players.length === 2 && slotNum === 3;
    const waitPill = document.createElement('div');
    waitPill.className = 'picked-club-pill waiting';
    waitPill.innerHTML = `
      <span>${isAutoBonusSlot ? '🎲' : '⏳'}</span>
      <div>
        <div style="font-weight:600;font-size:0.88rem;">${isAutoBonusSlot ? 'สโมสรโบนัสทีมที่ 3 (สุ่มให้อัตโนมัติ)' : `รอเลือกสโมสรที่ ${slotNum}...`}</div>
        <div style="font-size:0.72rem;color:#94a3b8;">${isAutoBonusSlot ? 'เพื่อให้มีอย่างน้อย 3 สโมสรบนกระดานล่าแต้มคูณ x3!' : 'ห้ามซ้ำกับทีมบนกระดาน'}</div>
      </div>
    `;
    listEl.appendChild(waitPill);
  }
}

function renderLeagueTabs() {
  const container = document.getElementById('leagueFilterTabs');
  if (!container) return;
  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'league-tab' + (state.selectedLeagueFilter === 'all' ? ' active' : '');
  allBtn.innerHTML = '🌍 ทั้งหมด (5 ลีกใหญ่)';
  allBtn.addEventListener('click', () => {
    state.selectedLeagueFilter = 'all';
    renderLeagueTabs();
    renderClubsGrid();
  });
  container.appendChild(allBtn);

  state.leagues.forEach((lg) => {
    const btn = document.createElement('button');
    btn.className = 'league-tab' + (state.selectedLeagueFilter === lg.id ? ' active' : '');
    btn.innerHTML = `${renderFlagHTML(lg.flag, lg.flagUrl)} <span style="margin-left:4px;">${lg.name}</span>`;
    btn.addEventListener('click', () => {
      state.selectedLeagueFilter = lg.id;
      renderLeagueTabs();
      renderClubsGrid();
    });
    container.appendChild(btn);
  });
}

function renderClubsGrid() {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const pickedMap = new Map();
  (state.room?.pickedClubs || []).forEach((pc) => {
    pickedMap.set(pc.clubId, pc);
  });

  const q = normalizeText(state.clubSearchText);
  const filtered = state.clubs.filter((c) => {
    if (state.selectedLeagueFilter !== 'all' && c.league !== state.selectedLeagueFilter) {
      return false;
    }
    if (!q) return true;
    return (
      normalizeText(c.name).includes(q) ||
      normalizeText(c.nameTh).includes(q) ||
      normalizeText(c.short).includes(q) ||
      (c.aliases && c.aliases.some((a) => normalizeText(a).includes(q)))
    );
  });

  filtered.forEach((club) => {
    const pickedInfo = pickedMap.get(club.id);
    const card = document.createElement('div');
    card.className = 'club-card' + (pickedInfo ? ' already-picked' : '');
    card.innerHTML = `
      ${renderClubCrestHTML(club, 44)}
      <div class="club-card-info">
        <h4>${club.name}</h4>
        <p>${pickedInfo ? `🔒 เลือกโดย ${pickedInfo.playerName}` : club.nameTh}</p>
      </div>
    `;
    card.addEventListener('click', async () => {
      const res = await apiAction('select_club', { clubId: club.id });
      if (!res.ok) {
        showToast(res.error);
      } else {
        document.getElementById('clubSearchInput').value = '';
        state.clubSearchText = '';
      }
    });
    grid.appendChild(card);
  });
}

function buildModeStageHTML(room, isReveal = false) {
  const mode = room.settings.gameMode || 'multi_club_pool';

  // MODE 1: MULTI-CLUB POOL STAGE
  if (mode === 'club_battle' || mode === 'multi_club_pool') {
    const picked = room.pickedClubs || [];
    if (picked.length === 0) return '';

    const cardsHtml = picked
      .map((pc) => {
        const c = pc.club;
        return `
          <div class="picked-club-pill">
            ${renderClubCrestHTML(c, 42)}
            <div>
              <div style="font-weight:700;font-size:1rem;">${c?.name || pc.clubId}</div>
              <div style="font-size:0.75rem;color:#94a3b8;">${c?.nameTh || ''} • เลือกโดย ${pc.playerAvatar} ${pc.playerName}</div>
            </div>
          </div>
        `;
      })
      .join('<span style="font-size:1.3rem;font-weight:800;color:#fbbf24;">+</span>');

    return `
      <div class="multi-clubs-stage">
        <div style="width:100%;font-size:0.85rem;color:#fde68a;font-weight:600;margin-bottom:4px;">
          🎯 สโมสรโจทย์ประจำรอบนี้ (นักเตะเคยอยู่กี่สโมสรในรายการนี้ ได้คะแนนตามจำนวนสโมสรที่ตรง!):
        </div>
        ${cardsHtml}
      </div>
    `;
  }

  const md = room.modeData;
  if (!md) return '';

  // MODE 2: STARTING XI PITCH
  if (mode === 'lineup_quiz') {
    const slotsHtml = (md.slots || [])
      .map((s) => {
        const photoHtml =
          s.unlocked && s.photoUrl
            ? `<img src="${s.photoUrl}" alt="${s.playerName}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid #fbbf24;margin:2px auto;display:block;" onerror="this.style.display='none'" />`
            : '';
        return `
          <div class="pitch-slot ${s.unlocked ? 'unlocked' : ''}" style="grid-row:${s.row}; grid-column:${s.col};">
            <div class="slot-top">
              ${renderFlagHTML(s.flag, s.flagUrl)}
              <span>${s.pos}</span>
              <span>#${s.number}</span>
            </div>
            ${photoHtml}
            <div class="slot-name">${s.unlocked ? s.playerName : '❓ ???'}</div>
            ${s.unlocked ? `<div class="slot-by">เปิดโดย ${s.answeredBy}</div>` : ''}
          </div>
        `;
      })
      .join('');

    return `
      <div class="pitch-board">
        <div class="pitch-grid">${slotsHtml}</div>
      </div>
    `;
  }

  // MODE 3: TOP 10 STATS (Untimed Continuous Board with Per-Item Hint & Reveal!)
  if (mode === 'top10_stats') {
    const items = md.items || [];
    const unlockedCount = items.filter((it) => it.unlocked).length;
    const listOptionsHtml = (md.availableLists || [])
      .map(
        (l) =>
          `<option value="${l.id}" ${l.id === md.listId ? 'selected' : ''}>${l.title}</option>`
      )
      .join('');

    const toolbarHtml = !isReveal
      ? `
        <div class="top10-toolbar">
          <div class="top10-toolbar-left">
            <select id="top10TopicSelect" class="select-input" style="max-width:340px;padding:6px 10px;font-size:0.84rem;">
              ${listOptionsHtml}
            </select>
            <span class="top10-progress-pill">เปิดแล้ว <strong>${unlockedCount}/10</strong> อันดับ</span>
          </div>
          <div class="top10-toolbar-actions">
            <button type="button" class="btn btn-outline btn-sm" data-top10-reveal-all="1">👁️ เฉลยทั้งหมด</button>
            <button type="button" class="btn btn-accent btn-sm" data-top10-next-list="1">🔄 เปลี่ยนหัวข้อถัดไป</button>
          </div>
        </div>
      `
      : '';

    const rowsHtml = items
      .map((it) => {
        const photoHtml =
          it.unlocked && it.photoUrl
            ? `<img src="${it.photoUrl}" alt="${it.name}" class="player-photo-avatar" style="width:32px;height:32px;" onerror="this.style.display='none'" />`
            : '';

        let statusSubHtml = '';
        if (it.unlocked) {
          statusSubHtml = it.revealed
            ? `<small style="color:#fbbf24;">👁️ เปิดเฉลยแล้ว (0 คะแนน)</small>`
            : `<small style="color:#6ee7b7;">✅ ตอบถูกโดย ${it.answeredBy} (+1 คะแนน)</small>`;
        } else if (it.hinted && it.hintText) {
          statusSubHtml = `<small style="color:#fde68a;font-weight:600;">💡 คำใบ้: ${it.hintText}</small>`;
        }

        const rowActionsHtml =
          !it.unlocked && !isReveal
            ? `
              <div class="top10-row-actions">
                ${
                  !it.hinted
                    ? `<button type="button" class="btn-mini-action hint-btn" data-top10-hint="${it.rank}" title="ดูคำใบ้ข้อนี้">💡 คำใบ้</button>`
                    : ''
                }
                <button type="button" class="btn-mini-action reveal-btn" data-top10-reveal="${it.rank}" title="กดเปิดเฉลยข้อนี้">👁️ เฉลย</button>
              </div>
            `
            : '';

        return `
          <div class="top10-row ${it.unlocked ? (it.revealed ? 'unlocked revealed-only' : 'unlocked') : it.hinted ? 'hinted' : ''}">
            <div class="top10-left">
              <div class="top10-rank">#${it.rank}</div>
              ${photoHtml}
              <div>
                <div style="font-weight:700;display:flex;align-items:center;gap:6px;">
                  ${it.unlocked || it.hinted ? renderFlagHTML(it.flag, it.flagUrl) : '<span>🔒</span>'}
                  <span>${it.unlocked ? it.name : '❓ ??? (พิมพ์ทายได้เลย)'}</span>
                </div>
                ${statusSubHtml}
              </div>
            </div>
            <div class="top10-right">
              <div class="top10-stat">${it.stat}</div>
              ${rowActionsHtml}
            </div>
          </div>
        `;
      })
      .join('');

    return `${toolbarHtml}<div class="top10-grid">${rowsHtml}</div>`;
  }

  // MODE 4: CAREER PATH
  if (mode === 'career_path') {
    const trHtml = (md.steps || [])
      .map((st) => {
        const badgeImg = st.clubBadgeUrl
          ? `<img src="${st.clubBadgeUrl}" alt="${st.club}" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;margin-right:6px;" onerror="this.style.display='none'" />`
          : '';
        return `
          <tr>
            <td>${st.years}</td>
            <td>${badgeImg}<strong>${st.club}</strong></td>
            <td>${st.apps} นัด</td>
            <td>⚽ ${st.goals} ประตู</td>
          </tr>
        `;
      })
      .join('');

    const revealedHero =
      isReveal && md.answerName
        ? `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;margin-bottom:10px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:12px;">
            ${md.photoUrl ? `<img src="${md.photoUrl}" class="reveal-player-photo" alt="${md.answerName}" onerror="this.style.display='none'" />` : ''}
            <div>
              <div style="font-size:0.78rem;color:#6ee7b7;">เฉลยนักเตะปริศนา:</div>
              <div style="font-size:1.15rem;font-weight:800;display:flex;align-items:center;gap:6px;">
                ${renderFlagHTML(md.flag, md.flagUrl)} ${md.answerName}
              </div>
            </div>
          </div>
        `
        : '';

    return `
      <div class="career-card">
        ${revealedHero}
        <div class="career-hint-bar">
          <span>💡 <strong>คำใบ้:</strong> ${md.hint}</span>
          <span>สัญชาติ: ${renderFlagHTML(md.flag, md.flagUrl)} • ตำแหน่ง: <strong>${md.position}</strong></span>
        </div>
        <div class="table-responsive">
          <table class="standings-table">
            <thead>
              <tr>
                <th>ช่วงปี</th>
                <th>สโมสรที่ค้าแข้ง</th>
                <th>ลงสนาม</th>
                <th>ประตู</th>
              </tr>
            </thead>
            <tbody>${trHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  // MODE 5: 4-CHOICE TRIVIA
  if (mode === 'trivia_quiz') {
    const letters = ['A', 'B', 'C', 'D'];
    const diffLabels = {
      easy: { text: '🟢 ระดับง่าย (Easy)', color: '#10b981' },
      medium: { text: '🟡 ระดับปานกลาง (Medium)', color: '#f59e0b' },
      hard: { text: '🔴 ระดับยาก (Hard - แฟนพันธุ์แท้)', color: '#ef4444' }
    };
    const qDiff = diffLabels[md.difficulty] || diffLabels.medium;
    const selDiff = md.selectedDifficulty || room.settings?.triviaDifficulty || 'all';

    const diffFilterBar = !isReveal
      ? `
        <div class="trivia-diff-bar">
          <span>🎚️ ความยากคำถาม:</span>
          <div class="trivia-diff-pills">
            <button type="button" class="diff-pill ${selDiff === 'all' ? 'active' : ''}" data-trivia-diff="all">🎲 รวมทุกระดับ</button>
            <button type="button" class="diff-pill ${selDiff === 'easy' ? 'active' : ''}" data-trivia-diff="easy">🟢 ง่าย</button>
            <button type="button" class="diff-pill ${selDiff === 'medium' ? 'active' : ''}" data-trivia-diff="medium">🟡 ปานกลาง</button>
            <button type="button" class="diff-pill ${selDiff === 'hard' ? 'active' : ''}" data-trivia-diff="hard">🔴 ยาก</button>
          </div>
        </div>
      `
      : '';

    const optsHtml = (md.options || [])
      .map((opt, idx) => {
        const isCorrectClass = isReveal && md.correctIndex === idx ? 'correct' : '';
        return `
          <button type="button" class="trivia-option-btn ${isCorrectClass}" data-trivia-choice="${idx}" ${isReveal ? 'disabled' : ''}>
            <span class="opt-letter">${letters[idx] || idx + 1}</span>
            <span>${opt}</span>
          </button>
        `;
      })
      .join('');

    return `
      <div class="trivia-box">
        ${diffFilterBar}
        <div style="margin-bottom:8px;">
          <span class="trivia-diff-tag" style="border-color:${qDiff.color};color:${qDiff.color};">${qDiff.text}</span>
        </div>
        <div class="trivia-question-text">❓ ${md.question}</div>
        <div class="trivia-options-grid">${optsHtml}</div>
      </div>
    `;
  }

  // MODE 6: 3x3 FOOTY TIC-TAC-TOE GRID
  if (mode === 'footy_grid') {
    const cells = md.cells || Array(9).fill(null);
    if (cells[state.selectedGridCellIndex]) {
      const firstOpen = cells.findIndex((c) => !c);
      if (firstOpen >= 0) state.selectedGridCellIndex = firstOpen;
    }

    const renderHdrIcon = (hdr) => {
      if (hdr.badgeUrl) {
        return `<img src="${hdr.badgeUrl}" alt="${hdr.label}" style="width:26px;height:26px;object-fit:contain;margin:0 auto 4px;" onerror="this.style.display='none'" />`;
      }
      if (hdr.flagUrl) {
        return `<div style="margin-bottom:4px;">${renderFlagHTML(hdr.value, hdr.flagUrl)}</div>`;
      }
      return '';
    };

    let html = `<div class="footy-grid-wrapper"><div class="footy-grid-board">`;
    html += `<div class="grid-header-cell"><strong>XO 3x3</strong><small>คลิกเลือกช่อง</small></div>`;
    (md.cols || []).forEach((col) => {
      html += `<div class="grid-header-cell">${renderHdrIcon(col)}<strong>${col.label}</strong><small>${col.sub}</small></div>`;
    });

    (md.rows || []).forEach((row, rIdx) => {
      html += `<div class="grid-header-cell">${renderHdrIcon(row)}<strong>${row.label}</strong><small>${row.sub}</small></div>`;
      for (let cIdx = 0; cIdx < 3; cIdx++) {
        const cellIdx = rIdx * 3 + cIdx;
        const claimed = cells[cellIdx];
        const isSelected = !isReveal && !claimed && state.selectedGridCellIndex === cellIdx;
        if (claimed) {
          const cellPhoto = claimed.photoUrl
            ? `<img src="${claimed.photoUrl}" class="player-photo-avatar" style="width:32px;height:32px;margin-bottom:3px;" onerror="this.style.display='none'" />`
            : `<div style="font-size:1.1rem;">${claimed.ownerAvatar}</div>`;
          html += `
            <div class="grid-play-cell claimed">
              ${cellPhoto}
              <strong style="font-size:0.82rem;color:#fde68a;display:flex;align-items:center;gap:4px;">
                ${renderFlagHTML(claimed.playerFlag, claimed.flagUrl)} ${claimed.playerName}
              </strong>
              <small style="font-size:0.7rem;color:#6ee7b7;">ยึดโดย ${claimed.ownerName}</small>
            </div>
          `;
        } else {
          html += `
            <div class="grid-play-cell ${isSelected ? 'selected-target' : ''}" data-grid-cell="${cellIdx}">
              <span style="font-size:0.78rem;color:#cbd5e1;">${row.label}</span>
              <strong style="font-size:0.82rem;color:#fbbf24;">✕ ${md.cols[cIdx].label}</strong>
              ${isSelected ? '<small style="color:#34d399;font-weight:700;">🎯 เลือกช่องนี้อยู่</small>' : '<small style="opacity:0.6;">คลิกเพื่อเล็งช่องนี้</small>'}
            </div>
          `;
        }
      }
    });

    html += `</div></div>`;
    return html;
  }

  return '';
}

function bindDynamicStageEvents(container, room) {
  if (!container) return;
  const mode = room.settings.gameMode || 'club_battle';

  if (mode === 'top10_stats') {
    container.querySelectorAll('[data-top10-hint]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const rank = parseInt(btn.dataset.top10Hint, 10);
        sfx.beep(520, 0.08);
        await apiAction('top10_hint_rank', { rank });
      });
    });

    container.querySelectorAll('[data-top10-reveal]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const rank = parseInt(btn.dataset.top10Reveal, 10);
        sfx.beep(360, 0.09);
        await apiAction('top10_reveal_rank', { rank });
      });
    });

    const revealAllBtn = container.querySelector('[data-top10-reveal-all]');
    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', async () => {
        sfx.beep(330, 0.12);
        await apiAction('top10_reveal_all');
      });
    }

    const nextListBtn = container.querySelector('[data-top10-next-list]');
    if (nextListBtn) {
      nextListBtn.addEventListener('click', async () => {
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    }

    const topicSelect = container.querySelector('#top10TopicSelect');
    if (topicSelect) {
      topicSelect.addEventListener('change', async (e) => {
        sfx.lockIn();
        await apiAction('start_mode_round', { listId: e.target.value });
      });
    }
  }

  if (mode === 'trivia_quiz') {
    container.querySelectorAll('[data-trivia-diff]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const diff = btn.dataset.triviaDiff;
        sfx.lockIn();
        await apiAction('start_mode_round', { triviaDifficulty: diff });
      });
    });

    container.querySelectorAll('[data-trivia-choice]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.triviaChoice, 10);
        const optText = room.modeData?.options?.[idx] || `ตัวเลือก ${idx + 1}`;
        sfx.lockIn();
        document.getElementById('lockedAnswerText').textContent = `⚡ เลือก: "${optText}"`;
        await apiAction('submit_answer', {
          playerInput: String(idx),
          choiceIndex: idx
        });
      });
    });
  }

  if (mode === 'footy_grid') {
    container.querySelectorAll('[data-grid-cell]').forEach((cellEl) => {
      cellEl.addEventListener('click', () => {
        state.selectedGridCellIndex = parseInt(cellEl.dataset.gridCell, 10);
        renderPlayingView(state.room);
      });
    });
  }
}

function renderPlayingView(room) {
  const mode = room.settings.gameMode || 'multi_club_pool';
  const meta = MODE_META[mode] || MODE_META.multi_club_pool;
  const banner = document.getElementById('activeClubBanner');

  document.getElementById('playingLeagueBadge').textContent = meta.badge;
  document.getElementById('answerPromptLabel').textContent = meta.prompt;

  if (mode === 'club_battle' || mode === 'multi_club_pool') {
    const picked = room.pickedClubs || [];
    const firstClub = picked[0]?.club;
    banner.style.background = `linear-gradient(135deg, ${firstClub?.primaryColor || '#059669'}, #0f172a)`;
    const clubNamesStr = picked.map((pc) => pc.club?.name || pc.clubId).join('  •  ');
    document.getElementById('playingClubName').textContent = clubNamesStr || 'สโมสรบนกระดาน';
    document.getElementById('playingClubSub').innerHTML = `ตรง 1 สโมสร = 1 แต้ม, ตรง 2 สโมสร = 2 แต้ม, ตรง 3 สโมสร = 3 แต้ม! • รอบย่อยที่ <span id="playingWaveNum">${room.waveNumber}</span>`;
  } else if (mode === 'lineup_quiz') {
    banner.style.background = `linear-gradient(135deg, ${room.modeData?.clubColor || '#059669'}, #0f172a)`;
    document.getElementById('playingClubName').textContent = room.modeData?.title || 'Guess the Lineup';
    document.getElementById('playingClubSub').textContent = `${room.modeData?.subtitle || ''} • รอบย่อยที่ ${room.waveNumber}`;
  } else if (mode === 'top10_stats') {
    banner.style.background = `linear-gradient(135deg, #2563eb, #0f172a)`;
    document.getElementById('playingClubName').textContent = room.modeData?.title || 'Top 10 Stats';
    document.getElementById('playingClubSub').textContent = `${room.modeData?.category || ''} • ไม่จำกัดเวลา ตอบได้ทุกข้อ!`;
  } else if (mode === 'career_path') {
    banner.style.background = `linear-gradient(135deg, #7c3aed, #0f172a)`;
    document.getElementById('playingClubName').textContent = 'นักเตะปริศนาคนนี้คือใคร? (Who Am I?)';
    document.getElementById('playingClubSub').textContent = `ดูประวัติสโมสรที่เคยค้าแข้งด้านล่างแล้วพิมพ์ชื่อนักเตะ!`;
  } else if (mode === 'trivia_quiz') {
    banner.style.background = `linear-gradient(135deg, #d97706, #0f172a)`;
    document.getElementById('playingClubName').textContent = `คำถามแฟนพันธุ์แท้ลูกหนัง ข้อที่ ${room.roundNumber}`;
    document.getElementById('playingClubSub').textContent = `กดเลือกคำตอบที่ถูกต้องให้ไวที่สุด!`;
  } else if (mode === 'footy_grid') {
    banner.style.background = `linear-gradient(135deg, #0d9488, #0f172a)`;
    document.getElementById('playingClubName').textContent = room.modeData?.title || 'Footy Tic-Tac-Toe 3x3';
    document.getElementById('playingClubSub').textContent = `คลิกเลือกช่องในตาราง แล้วพิมพ์ชื่อนักเตะเพื่อยึดช่อง!`;
  }

  updateTimerOnly();

  const stageEl = document.getElementById('modeDynamicStage');
  stageEl.innerHTML = buildModeStageHTML(room, false);
  bindDynamicStageEvents(stageEl, room);

  const me = room.players.find((p) => p.id === state.playerId);
  const hasSubmitted = mode !== 'top10_stats' && me && me.hasSubmitted;

  const inputZone = document.getElementById('answerInputZone');
  const lockedZone = document.getElementById('answerLockedZone');
  const guessInput = document.getElementById('playerGuessInput');

  if (hasSubmitted) {
    inputZone.classList.add('hidden');
    stageEl.classList.toggle('hidden', mode === 'trivia_quiz');
    lockedZone.classList.remove('hidden');
  } else {
    lockedZone.classList.add('hidden');
    stageEl.classList.remove('hidden');
    if (mode === 'trivia_quiz') {
      inputZone.classList.add('hidden');
    } else {
      inputZone.classList.remove('hidden');
      if (state.lastRenderedState !== 'PLAYING') {
        guessInput.value = '';
        state.selectedAutocompletePlayerId = null;
        hideAutocomplete();
        setTimeout(() => guessInput.focus(), 80);
      }
    }
  }

  const usedBoard = document.getElementById('clubUsedBoard');
  if (mode === 'club_battle' || mode === 'multi_club_pool') {
    usedBoard.classList.remove('hidden');
    document.getElementById('usedCountLabel').textContent = room.usedPlayers.length;
    document.getElementById('totalClubPlayersLabel').textContent = room.totalPossibleForClub || 0;
    renderUsedPlayersChips('usedPlayersList', room.usedPlayers);
  } else {
    usedBoard.classList.add('hidden');
  }
}

function renderUsedPlayersChips(containerId, usedPlayers) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!usedPlayers || usedPlayers.length === 0) {
    container.innerHTML = `<span class="muted-text" style="font-size:0.82rem;">ยังไม่มีชื่อที่ถูกใช้ในรอบสโมสรนี้ ทุกคนสามารถตอบได้ทุกชื่อ!</span>`;
    return;
  }

  usedPlayers.forEach((u) => {
    const chip = document.createElement('div');
    chip.className = 'used-chip';
    const miniPhoto = u.photoUrl
      ? `<img src="${u.photoUrl}" alt="${u.name}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:1px solid #34d399;" onerror="this.style.display='none'" />`
      : '';
    chip.innerHTML = `${miniPhoto} ${renderFlagHTML(u.flag, u.flagUrl)} <strong>${u.name}</strong> <small>(${u.position} • โดย ${u.answeredBy})</small>`;
    container.appendChild(chip);
  });
}

function renderRevealView(room) {
  const mode = room.settings.gameMode || 'multi_club_pool';
  const picked = room.pickedClubs || [];

  const nextWaveBtn = document.getElementById('nextWaveSameClubBtn');
  const changeBtn = document.getElementById('changeClubBtn');

  if (mode === 'club_battle' || mode === 'multi_club_pool') {
    const clubNamesStr = picked.map((pc) => pc.club?.name || pc.clubId).join(' + ');
    document.getElementById('revealClubTitle').textContent = clubNamesStr
      ? `กระดานสโมสร: ${clubNamesStr} • รอบย่อยที่ ${room.waveNumber}`
      : 'เฉลยคำตอบ';
    nextWaveBtn.textContent = '🔥 เล่นชุดสโมสรเดิมต่อ (ห้ามซ้ำชื่อเดิม!)';
    changeBtn.textContent =
      room.settings.clubSelectMode === 'random'
        ? '🎲 สุ่มชุดสโมสรใหม่ทันที!'
        : '🔄 ให้ทุกคนเลือกสโมสรชุดใหม่!';
    changeBtn.classList.remove('hidden');
  } else if (mode === 'lineup_quiz') {
    document.getElementById('revealClubTitle').textContent = `${room.modeData?.title || ''} • รอบย่อยที่ ${room.waveNumber}`;
    nextWaveBtn.textContent = '🔥 ทายผัง 11 ตัวจริงนี้ต่อ!';
    changeBtn.textContent = '🔄 เปลี่ยนแมตช์ผัง 11 ตัวจริงใหม่';
    changeBtn.classList.remove('hidden');
  } else if (mode === 'top10_stats') {
    document.getElementById('revealClubTitle').textContent = `${room.modeData?.title || ''} • รอบย่อยที่ ${room.waveNumber}`;
    nextWaveBtn.textContent = '🔥 ทาย Top 10 หัวข้อนี้ต่อ!';
    changeBtn.textContent = '🔄 เปลี่ยนหัวข้อ Top 10 ใหม่';
    changeBtn.classList.remove('hidden');
  } else if (mode === 'career_path') {
    document.getElementById('revealClubTitle').textContent = `เฉลยนักเตะปริศนา: ${room.modeData?.answerName || ''}`;
    nextWaveBtn.textContent = '🕵️‍♂️ ไปข้อต่อไป (สุ่มนักเตะปริศนาคนใหม่!)';
    changeBtn.classList.add('hidden');
  } else if (mode === 'trivia_quiz') {
    document.getElementById('revealClubTitle').textContent = `เฉลยคำถามแฟนพันธุ์แท้ ข้อที่ ${room.roundNumber}`;
    nextWaveBtn.textContent = '⚡ คำถามข้อต่อไป!';
    changeBtn.classList.add('hidden');
  } else if (mode === 'footy_grid') {
    document.getElementById('revealClubTitle').textContent = `${room.modeData?.title || 'ตาราง XO'} • รอบย่อยที่ ${room.waveNumber}`;
    nextWaveBtn.textContent = '🔥 เล่นตาราง XO นี้ต่อ (ชิงช่องที่เหลือ!)';
    changeBtn.textContent = '🔄 เปลี่ยนกระดาน XO ใหม่';
    changeBtn.classList.remove('hidden');
  }

  const targetBanner = document.getElementById('targetReachedBanner');
  if (targetBanner) {
    targetBanner.classList.toggle('hidden', !room.hasReachedTarget);
  }

  const revealStage = document.getElementById('revealDynamicStage');
  revealStage.innerHTML = buildModeStageHTML(room, true);

  const listEl = document.getElementById('revealResultsList');
  listEl.innerHTML = '';

  (room.lastWaveResults || []).forEach((res) => {
    const item = document.createElement('div');
    item.className = `reveal-item status-${res.status}`;

    const timeTag = res.timeTakenMs ? `⏱️ ${(res.timeTakenMs / 1000).toFixed(1)} วิ` : '⏱️ หมดเวลา';
    const fb = res.footballer;
    const playerPhotoHtml =
      fb && fb.photoUrl
        ? `<img src="${fb.photoUrl}" alt="${fb.name}" class="reveal-player-photo" loading="lazy" onerror="this.style.display='none'" />`
        : '';

    const answerTitle = fb
      ? `<span style="display:inline-flex;align-items:center;gap:6px;">${renderFlagHTML(fb.flag, fb.flagUrl)} ${fb.name} <small style="font-weight:400;opacity:0.75;">(${fb.position})</small></span>`
      : res.rawInput
      ? `"${res.rawInput}"`
      : '— ไม่ได้ตอบ —';

    let matchedBadgesHtml = '';
    if (Array.isArray(res.matchedClubObjs) && res.matchedClubObjs.length > 0) {
      const chips = res.matchedClubObjs
        .map((mc) => {
          const bImg = mc.badgeUrl ? `<img src="${mc.badgeUrl}" alt="${mc.name}" onerror="this.style.display='none'" />` : '';
          return `<span class="mini-club-chip">${bImg} ${mc.name}</span>`;
        })
        .join('');
      matchedBadgesHtml = `<div class="matched-clubs-badges">${chips}</div>`;
    }

    const ptsText = res.pointsEarned > 0 ? `+${res.pointsEarned}` : '0';

    item.innerHTML = `
      <div class="reveal-main">
        <div class="reveal-player-row">
          <span>${res.playerAvatar} <strong>${res.playerName}</strong></span>
          <span>• ${timeTag}</span>
        </div>
        <div class="reveal-answer-card">
          ${playerPhotoHtml}
          <div>
            <div class="reveal-answer-name">${answerTitle}</div>
            ${matchedBadgesHtml}
            <div class="reveal-msg">${res.message}</div>
          </div>
        </div>
      </div>
      <div class="reveal-points ${res.pointsEarned === 0 ? 'zero' : ''}">
        ${ptsText} <small style="font-size:0.75rem;">คะแนน</small>
      </div>
    `;
    listEl.appendChild(item);
  });

  const revealClubBoard = document.getElementById('revealClubUsedBoard');
  if (mode === 'club_battle' || mode === 'multi_club_pool') {
    revealClubBoard.classList.remove('hidden');
    document.getElementById('revealUsedCount').textContent = room.usedPlayers.length;
    document.getElementById('revealTotalClubPlayers').textContent = room.totalPossibleForClub || 0;
    renderUsedPlayersChips('revealUsedPlayersList', room.usedPlayers);
  } else {
    revealClubBoard.classList.add('hidden');
  }
}

function renderGameOverView(room) {
  const summary = room.matchSummary;
  if (!summary) return;

  document.getElementById('matchMetaSummary').textContent =
    `ดวลกันทั้งหมด ${summary.totalRoundsPlayed} โจทย์ • รวม ${summary.totalWavesPlayed} รอบย่อย`;

  const podiumEl = document.getElementById('podiumStage');
  podiumEl.innerHTML = '';
  const medals = { 1: '👑', 2: '🥈', 3: '🥉' };

  (summary.podium || []).forEach((p) => {
    const spot = document.createElement('div');
    spot.className = `podium-spot rank-${p.rank}`;
    const fastStr = p.fastestTimeMs ? `⚡ ${(p.fastestTimeMs / 1000).toFixed(1)}s` : '';

    spot.innerHTML = `
      <div class="podium-avatar-wrap">
        <div class="podium-avatar">${p.avatar}</div>
        <span class="podium-medal">${medals[p.rank] || '🏅'}</span>
      </div>
      <div class="podium-name">${p.name}</div>
      <div class="podium-score">${p.score.toLocaleString()} <small style="font-size:0.7rem;">แต้ม</small></div>
      <div class="podium-pillar">
        <span class="pillar-rank-num">#${p.rank}</span>
        <div class="pillar-sub">ตอบถูก ${p.correctCount} ครั้ง ${fastStr ? '• ' + fastStr : ''}</div>
      </div>
    `;
    podiumEl.appendChild(spot);
  });

  const mvpSection = document.getElementById('mvpSection');
  const mvpGrid = document.getElementById('mvpAwardsGrid');
  mvpGrid.innerHTML = '';

  if (!summary.awards || summary.awards.length === 0) {
    mvpSection.classList.add('hidden');
  } else {
    mvpSection.classList.remove('hidden');
    summary.awards.forEach((aw) => {
      const card = document.createElement('div');
      card.className = 'mvp-card';
      card.innerHTML = `
        <div class="mvp-icon">${aw.icon}</div>
        <div class="mvp-info">
          <h4>${aw.title}</h4>
          <strong>${aw.playerAvatar} ${aw.playerName}</strong>
          <p>${aw.detail}</p>
        </div>
      `;
      mvpGrid.appendChild(card);
    });
  }

  const tbody = document.getElementById('standingsTableBody');
  tbody.innerHTML = '';
  (summary.standings || []).forEach((st) => {
    const tr = document.createElement('tr');
    const rankIcon = st.rank === 1 ? '🥇 1' : st.rank === 2 ? '🥈 2' : st.rank === 3 ? '🥉 3' : `#${st.rank}`;
    const fastestStr = st.fastestTimeMs ? `${(st.fastestTimeMs / 1000).toFixed(2)}s` : '-';
    const avgStr = st.avgTimeMs ? `${(st.avgTimeMs / 1000).toFixed(2)}s` : '-';

    tr.innerHTML = `
      <td><strong>${rankIcon}</strong></td>
      <td>${st.avatar} <strong>${st.name}</strong></td>
      <td>${st.correctCount} ครั้ง</td>
      <td>🔥 ${st.bestStreak}</td>
      <td>${fastestStr}</td>
      <td>${avgStr}</td>
      <td><strong style="color:#fbbf24;">${st.score.toLocaleString()}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

// AUTOCOMPLETE SEARCH LOGIC (WITH LIVE API FALLBACK)
let liveSearchTimeout = null;
const liveSearchFetchedQueries = new Set();

function updateAutocomplete(query, skipLiveFetch = false) {
  const dropdown = document.getElementById('playerAutocompleteList');
  const norm = normalizeText(query);

  if (!norm || norm.length < 1) {
    hideAutocomplete();
    return;
  }

  const usedIds = new Set((state.room?.usedPlayers || []).map((u) => u.id));

  const matches = [];
  for (const p of state.players) {
    const pNameNorm = normalizeText(p.name);
    const startsWith = pNameNorm.startsWith(norm) || pNameNorm.split(/\s+/).some((part) => part.startsWith(norm));
    const aliasMatch = p.aliases && p.aliases.some((a) => normalizeText(a).includes(norm));
    const includesMatch = pNameNorm.includes(norm);

    if (startsWith || aliasMatch || includesMatch) {
      matches.push({
        player: p,
        alreadyUsed: usedIds.has(p.id),
        priority: startsWith ? 1 : aliasMatch ? 2 : 3
      });
    }
  }

  matches.sort((a, b) => a.priority - b.priority || a.player.name.localeCompare(b.player.name));
  const topMatches = matches.slice(0, 8);

  if (!skipLiveFetch && norm.length >= 2 && !liveSearchFetchedQueries.has(norm)) {
    if (liveSearchTimeout) clearTimeout(liveSearchTimeout);
    liveSearchTimeout = setTimeout(async () => {
      try {
        liveSearchFetchedQueries.add(norm);
        const res = await fetch(`/api/live-search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.players) && data.players.length > 0) {
          let updatedAny = false;
          for (const lp of data.players) {
            const existing = state.players.find(
              (ex) => ex.id === lp.id || normalizeText(ex.name) === normalizeText(lp.name)
            );
            if (!existing) {
              state.players.push(lp);
              updatedAny = true;
            } else {
              if (lp.photoUrl && !existing.photoUrl) {
                existing.photoUrl = lp.photoUrl;
                updatedAny = true;
              }
              if (lp.flagUrl && !existing.flagUrl) {
                existing.flagUrl = lp.flagUrl;
                updatedAny = true;
              }
            }
          }
          const currentInput = document.getElementById('playerGuessInput')?.value || '';
          if (updatedAny && normalizeText(currentInput) === norm) {
            updateAutocomplete(currentInput, true);
          }
        }
      } catch (e) {
        // Ignore offline/network errors gracefully
      }
    }, 200);
  }

  if (topMatches.length === 0) {
    hideAutocomplete();
    return;
  }

  state.autocompleteItems = topMatches.map((m) => m.player);
  state.autocompleteIndex = 0;

  dropdown.innerHTML = '';
  topMatches.forEach((m, idx) => {
    const p = m.player;
    const row = document.createElement('div');
    row.className =
      'autocomplete-item' +
      (idx === state.autocompleteIndex ? ' active' : '') +
      (m.alreadyUsed ? ' already-used' : '');

    const liveBadge = p.fromLiveApi
      ? '<span class="ac-pos" style="background:rgba(16,185,129,0.2);color:#34d399;margin-right:4px;">🌐 API</span>'
      : '';

    row.innerHTML = `
      <div class="ac-left">
        ${renderPlayerPhotoHTML(p.photoUrl, '⚽', 'player-photo-avatar')}
        ${renderFlagHTML(p.flag, p.flagUrl)}
        <span class="ac-name">${p.name}</span>
      </div>
      <div>
        ${liveBadge}${m.alreadyUsed ? '<span class="ac-pos" style="background:#ef4444;color:#fff;">ถูกใช้แล้ว</span>' : `<span class="ac-pos">${p.position}</span>`}
      </div>
    `;

    row.addEventListener('mousedown', (e) => {
      e.preventDefault();
      selectAutocompletePlayer(p);
    });
    dropdown.appendChild(row);
  });

  dropdown.classList.remove('hidden');
}

function selectAutocompletePlayer(player) {
  const input = document.getElementById('playerGuessInput');
  input.value = player.name;
  state.selectedAutocompletePlayerId = player.id;
  hideAutocomplete();
  submitCurrentGuess();
}

function hideAutocomplete() {
  const dropdown = document.getElementById('playerAutocompleteList');
  if (dropdown) dropdown.classList.add('hidden');
  state.autocompleteItems = [];
  state.autocompleteIndex = -1;
}

async function submitCurrentGuess() {
  const input = document.getElementById('playerGuessInput');
  const val = input.value.trim();
  if (!val) {
    showToast('กรุณาพิมพ์ชื่อนักฟุตบอลก่อนส่งคำตอบ');
    return;
  }

  let chosenId = state.selectedAutocompletePlayerId;
  if (!chosenId && state.autocompleteItems.length > 0 && state.autocompleteIndex >= 0) {
    const activeItem = state.autocompleteItems[state.autocompleteIndex];
    if (activeItem && normalizeText(activeItem.name).includes(normalizeText(val))) {
      chosenId = activeItem.id;
      input.value = activeItem.name;
    }
  }

  sfx.lockIn();
  document.getElementById('lockedAnswerText').textContent = `👟 "${input.value}"`;
  hideAutocomplete();

  const submittedText = input.value;
  const mode = state.room?.settings?.gameMode || 'multi_club_pool';
  if (mode === 'top10_stats') {
    input.value = '';
    state.selectedAutocompletePlayerId = null;
    setTimeout(() => input.focus(), 40);
  }

  const res = await apiAction('submit_answer', {
    playerInput: submittedText,
    selectedPlayerId: chosenId,
    cellIndex: state.selectedGridCellIndex
  });

  if (mode === 'top10_stats' && res && res.top10Feedback) {
    if (res.top10Feedback.correct) {
      sfx.success();
    } else {
      sfx.beep(220, 0.14, 'sawtooth', 0.08);
    }
    showToast(res.top10Feedback.message);
  }
}

function bindRoomEvents() {
  document.getElementById('leaveRoomBtn').addEventListener('click', () => {
    if (state.eventSource) state.eventSource.close();
    window.history.replaceState({}, '', window.location.pathname);
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('homeScreen').classList.add('active');
  });

  document.getElementById('switchModeTopBtn').addEventListener('click', () => {
    apiAction('back_to_lobby');
  });

  document.querySelectorAll('[data-mode]').forEach((card) => {
    card.addEventListener('click', () => {
      apiAction('update_settings', { gameMode: card.dataset.mode });
    });
  });

  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    if (!state.roomCode) return;
    navigator.clipboard.writeText(state.roomCode);
    showToast(`คัดลอกรหัสห้อง ${state.roomCode} แล้ว!`);
  });

  document.getElementById('copyLinkBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('คัดลอกลิงก์ชวนเพื่อนเรียบร้อย! ส่งให้เพื่อนเปิดเข้าห้องได้เลย');
  });

  document.querySelectorAll('[data-time-delta]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!state.room) return;
      const delta = parseInt(btn.dataset.timeDelta, 10);
      const nextTime = Math.max(5, Math.min(60, state.room.settings.timeLimit + delta));
      apiAction('update_settings', { timeLimit: nextTime });
    });
  });

  document.querySelectorAll('[data-time-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = parseInt(btn.dataset.timePreset, 10);
      apiAction('update_settings', { timeLimit: preset });
    });
  });

  document.getElementById('decTimeQuickBtn').addEventListener('click', () => {
    if (!state.room) return;
    apiAction('update_settings', { timeLimit: Math.max(5, state.room.settings.timeLimit - 5) });
  });

  document.getElementById('incTimeQuickBtn').addEventListener('click', () => {
    if (!state.room) return;
    apiAction('update_settings', { timeLimit: Math.min(60, state.room.settings.timeLimit + 5) });
  });

  document.getElementById('targetScoreSelect').addEventListener('change', (e) => {
    apiAction('update_settings', { targetScore: parseInt(e.target.value, 10) });
  });

  document.getElementById('duplicateRuleSelect').addEventListener('change', (e) => {
    apiAction('update_settings', { duplicateRule: e.target.value });
  });

  document.getElementById('clubSelectModeInput').addEventListener('change', (e) => {
    apiAction('update_settings', { clubSelectMode: e.target.value });
  });

  const clubPoolSizeEl = document.getElementById('clubPoolSizeRuleSelect');
  if (clubPoolSizeEl) {
    clubPoolSizeEl.addEventListener('change', (e) => {
      apiAction('update_settings', { clubPoolSizeRule: e.target.value });
    });
  }

  const triviaDiffEl = document.getElementById('triviaDifficultySelect');
  if (triviaDiffEl) {
    triviaDiffEl.addEventListener('change', (e) => {
      apiAction('update_settings', { triviaDifficulty: e.target.value });
    });
  }

  document.getElementById('addBotBtn').addEventListener('click', async () => {
    const res = await apiAction('add_bot');
    if (!res.ok) showToast(res.error);
  });

  document.getElementById('resetScoresBtn').addEventListener('click', () => {
    apiAction('reset_scores');
  });

  document.getElementById('playAgainBtn').addEventListener('click', () => {
    apiAction('reset_scores');
  });

  const triggerEndMatch = () => {
    sfx.init();
    apiAction('end_match');
  };
  document.getElementById('endMatchSidebarBtn').addEventListener('click', triggerEndMatch);
  document.getElementById('endMatchRevealBtn').addEventListener('click', triggerEndMatch);
  document.getElementById('celebrateChampionBtn').addEventListener('click', triggerEndMatch);

  document.getElementById('startClubSelectBtn').addEventListener('click', () => {
    sfx.init();
    apiAction('start_mode_round');
  });

  document.getElementById('randomClubBtn').addEventListener('click', async () => {
    const res = await apiAction('select_club', {
      random: true,
      leagueFilter: state.selectedLeagueFilter === 'all' ? null : state.selectedLeagueFilter
    });
    if (!res.ok) showToast(res.error);
  });

  document.getElementById('forceStartWaveBtn').addEventListener('click', async () => {
    const res = await apiAction('force_start_club_wave');
    if (!res.ok) showToast(res.error);
  });

  const clubSearchEl = document.getElementById('clubSearchInput');
  clubSearchEl.addEventListener('input', (e) => {
    state.clubSearchText = e.target.value;
    renderClubsGrid();
  });

  clubSearchEl.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = clubSearchEl.value.trim();
      if (!val) return;
      const res = await apiAction('select_club', { clubInput: val });
      if (!res.ok) {
        showToast(res.error);
      } else {
        clubSearchEl.value = '';
        state.clubSearchText = '';
        renderClubsGrid();
      }
    }
  });

  const guessInput = document.getElementById('playerGuessInput');
  guessInput.addEventListener('input', (e) => {
    state.selectedAutocompletePlayerId = null;
    updateAutocomplete(e.target.value);
  });

  guessInput.addEventListener('keydown', (e) => {
    const dropdown = document.getElementById('playerAutocompleteList');
    const isVisible = !dropdown.classList.contains('hidden') && state.autocompleteItems.length > 0;

    if (e.key === 'ArrowDown' && isVisible) {
      e.preventDefault();
      state.autocompleteIndex = (state.autocompleteIndex + 1) % state.autocompleteItems.length;
      highlightAutocompleteRow();
    } else if (e.key === 'ArrowUp' && isVisible) {
      e.preventDefault();
      state.autocompleteIndex =
        (state.autocompleteIndex - 1 + state.autocompleteItems.length) %
        state.autocompleteItems.length;
      highlightAutocompleteRow();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isVisible && state.autocompleteIndex >= 0) {
        selectAutocompletePlayer(state.autocompleteItems[state.autocompleteIndex]);
      } else {
        submitCurrentGuess();
      }
    } else if (e.key === 'Escape') {
      hideAutocomplete();
    }
  });

  document.getElementById('submitGuessBtn').addEventListener('click', () => {
    submitCurrentGuess();
  });

  document.getElementById('nextWaveSameClubBtn').addEventListener('click', () => {
    apiAction('next_wave_same_club');
  });

  document.getElementById('changeClubBtn').addEventListener('click', () => {
    apiAction('start_mode_round');
  });

  document.querySelectorAll('.emoji-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      apiAction('send_reaction', { emoji: btn.dataset.emoji });
    });
  });
}

function highlightAutocompleteRow() {
  const dropdown = document.getElementById('playerAutocompleteList');
  const rows = dropdown.querySelectorAll('.autocomplete-item');
  rows.forEach((r, idx) => {
    r.classList.toggle('active', idx === state.autocompleteIndex);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initHomeUI();
  bindRoomEvents();
  loadDatabase();
});
