// Frontend Multiplayer Client for 9-in-1 Football Quiz Party Hub

const AVATARS = ['⚽', '🦁', '🔥', '⚡', '👑', '🦊', '🐯', '🦅', '🐉', '🌟', '🎯', '🛡️'];

const MODE_META = {
  multi_club_pool: {
    badge: '🌟 โหมดใหม่: ลงสโมสรคนละทีม ล่าแต้มคูณ (Multi-Club Pool)',
    prompt: '👟 พิมพ์ชื่อนักฟุตบอลที่เคยอยู่สโมสรบนกระดาน! (ตรง 1 สโมสร = +1 แต้ม, ตรง 2 สโมสร = +2 แต้ม, ตรง 3 สโมสร = +3 แต้ม!):'
  },
  club_battle: {
    badge: '🏟️ โหมดคลาสสิก: ทายนักเตะประจำสโมสร (1 ทีม)',
    prompt: '👟 พิมพ์ชื่อนักฟุตบอลที่เคยอยู่สโมสรนี้ (ตอบถูก +1 แต้ม • ⚡ไวสุดในรอบ +1 • 🔥คอมโบทุก 3 รอบติด +1):'
  },
  lineup_quiz: {
    badge: '📋 โหมดที่ 2: ทายผัง 11 ตัวจริงในตำนาน',
    prompt: '👕 พิมพ์ชื่อนักฟุตบอลในผัง 11 ตัวจริง (ทายสด +3 แต้ม • ใบ้สัญชาติ +2 • ใบ้เบอร์เสื้อ/ชื่อย่อ +1 • ปิดผังคนที่ 11 โบนัส +1 แต้ม):'
  },
  top10_stats: {
    badge: '📊 โหมดที่ 3: ทายท็อป 10 สถิติลูกหนัง',
    prompt: '🏅 พิมพ์ชื่อนักฟุตบอลใน Top 10 (อันดับ #1-#3 = +1 แต้ม • #4-#7 = +2 แต้ม • #8-#10 = +3 แต้ม • ใช้คำใบ้ = +1 แต้ม):'
  },
  career_path: {
    badge: '🕵️‍♂️ โหมดที่ 4: ทายนักเตะจากเส้นทางค้าแข้ง (ฉันคือใคร?)',
    prompt: '🔍 ทายชื่อนักเตะปริศนา (ทายสดไม่เปิดคำใบ้ = +3 แต้ม • เปิดคำใบ้ 💡 = +1 แต้ม • ⚡ตอบถูกคนแรกโบนัส +1 แต้ม):'
  },
  trivia_quiz: {
    badge: '⚡ โหมดที่ 5: ควิซแฟนพันธุ์แท้ 4 ตัวเลือก',
    prompt: '⚡ กดเลือกคำตอบที่ถูกต้อง (🟢ง่าย +1 • 🟡ปานกลาง +2 • 🔴ยาก +3 • ⚡ตอบถูกคนแรกโบนัส +1 แต้ม):'
  },
  footy_grid: {
    badge: '🔢 โหมดที่ 6: ตาราง XO ฟุตบอล 3x3',
    prompt: '🎯 คลิกเลือกช่องแล้วพิมพ์ชื่อนักเตะ (ช่องทั่วไป +2 • 💎ช่องหายาก +3 • ใช้คำใบ้ +1 • 🔥เรียงครบ 3 ช่อง BINGO โบนัส +3 แต้ม):'
  },
  connections: {
    badge: '🧩 โหมดที่ 7: จับกลุ่ม 16 นักเตะ 4 ความลับ (Football Connections)',
    prompt: '🧩 คลิกเลือกนักเตะบนกระดานให้ครบ 4 คนที่มีความเชื่อมโยงเดียวกัน แล้วกดปุ่ม "✅ ส่งกลุ่ม 4 คน" ด้านบน!'
  },
  who_are_ya_wordle: {
    badge: '🖼️ โหมดที่ 8: ทายนักเตะจากรูปเบลอ + Wordle (Who Are Ya?)',
    prompt: '🔍 พิมพ์ชื่อนักเตะเพื่อทายรูปปริศนา (ทายผิดจะเปิดแถบสีใบ้ 🟢ตรง / 🟡เคยอยู่สโมสรเดียวกัน และรูปชัดขึ้นเรื่อยๆ):'
  },
  chain_link: {
    badge: '🔗 โหมดที่ 9: ต่อโซ่นักเตะเพื่อนร่วมทีม (Chain Link)',
    prompt: '🔗 พิมพ์ชื่อนักเตะคนถัดไปที่เคยค้าแข้งสโมสรเดียวกับนักเตะคนล่าสุด (ห้ามซ้ำนักเตะ & ห้ามซ้ำสโมสรที่ใช้เชื่อมไปแล้ว):'
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
  selectedConnectionIds: [],
  lastConnectionsBoardId: null,
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
  const data = await res.json();
  if (data && data.room && state.roomCode && action !== 'create_room' && action !== 'join_room') {
    state.room = data.room;
    renderRoom();
  }
  return data;
}

const DB_CACHE_KEY = 'fcq_db_cache_v4';
let isDatabaseLoading = false;

function preparePlayerSearchIndex(players) {
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const normName = normalizeText(p.name);
    const nameParts = normName.split(/\s+/).filter(Boolean);
    const normAliases = Array.isArray(p.aliases)
      ? p.aliases.map((a) => normalizeText(a)).filter(Boolean)
      : [];
    p._normName = normName;
    p._nameParts = nameParts;
    p._normAliases = normAliases;
    p._clubCount = Array.isArray(p.clubs) ? p.clubs.length : 0;
    p._searchBlob = [normName, ...normAliases].join(' ');
  }
}

function hydrateDatabaseFromLocalCache() {
  if (state.players.length > 0) return;
  try {
    const raw = localStorage.getItem(DB_CACHE_KEY);
    if (!raw) return;
    const cached = JSON.parse(raw);
    if (cached && Array.isArray(cached.players) && cached.players.length > 0) {
      state.leagues = cached.leagues || state.leagues;
      state.clubs = cached.clubs || state.clubs;
      state.players = cached.players;
      preparePlayerSearchIndex(state.players);
      renderLeagueTabs();
      renderClubsGrid();
    }
  } catch (e) {}
}

async function loadDatabase(isRetry = false) {
  hydrateDatabaseFromLocalCache();
  if (isDatabaseLoading && !isRetry) return;
  isDatabaseLoading = true;
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.leagues = data.leagues || [];
    state.clubs = data.clubs || [];
    state.players = data.players || [];
    preparePlayerSearchIndex(state.players);
    renderLeagueTabs();
    renderClubsGrid();

    try {
      localStorage.setItem(
        DB_CACHE_KEY,
        JSON.stringify({
          leagues: state.leagues,
          clubs: state.clubs,
          players: state.players
        })
      );
    } catch (e) {}

    // If user already typed into guess box while database was loading, immediately refresh dropdown!
    const guessInput = document.getElementById('playerGuessInput');
    if (guessInput && document.activeElement === guessInput && guessInput.value.trim().length > 0) {
      updateAutocomplete(guessInput.value);
    }

    // Re-fetch once after 5s on initial load to pick up background-synced player headshots
    const hasPhotos = state.players.some((p) => !!p.photoUrl);
    if (!isRetry && !hasPhotos) {
      setTimeout(() => loadDatabase(true), 5000);
    }
  } catch (err) {
    if (!isRetry) {
      setTimeout(() => loadDatabase(true), 2000);
    }
  } finally {
    isDatabaseLoading = false;
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

        if (payload.type === 'database_updated') {
          loadDatabase(true);
        }

        renderRoom();
      }
    } catch (e) {}
  };
}

function isUntimedContinuousMode(mode) {
  return (
    mode === 'top10_stats' ||
    mode === 'lineup_quiz' ||
    mode === 'footy_grid' ||
    mode === 'connections' ||
    mode === 'who_are_ya_wordle' ||
    mode === 'chain_link'
  );
}

function updateTimerOnly() {
  if (!state.room) return;
  const mode = state.room.settings?.gameMode || 'multi_club_pool';
  const numEl = document.getElementById('countdownNumber');
  const circleEl = document.getElementById('countdownCircle');
  const barEl = document.getElementById('timerProgressBar');

  if (isUntimedContinuousMode(mode) && mode !== 'chain_link') {
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
    const isActive = card.dataset.mode === gameMode;
    card.classList.toggle('active', isActive);
    if (isActive) {
      const iconEl = card.querySelector('.mode-icon');
      const titleEl = card.querySelector('.mode-info h4');
      const bannerIcon = document.getElementById('selectedModeIconLabel');
      const bannerTitle = document.getElementById('selectedModeTitleLabel');
      if (bannerIcon && iconEl) bannerIcon.textContent = iconEl.textContent.trim();
      if (bannerTitle && titleEl) bannerTitle.textContent = titleEl.textContent.trim();
    }
  });

  // Show/hide Lobby settings dynamically based on selected gameMode
  const isUntimed = isUntimedContinuousMode(gameMode) && gameMode !== 'chain_link';
  const isClubMode = gameMode === 'multi_club_pool' || gameMode === 'club_battle';
  const isMultiClub = gameMode === 'multi_club_pool';
  const isTrivia = gameMode === 'trivia_quiz';
  const showModeInfo = !isClubMode && !isTrivia;

  const timerGroup = document.getElementById('settingGroupTimer');
  const untimedNotice = document.getElementById('settingGroupUntimedNotice');
  const clubRulesGroup = document.getElementById('settingGroupClubRules');
  const poolSizeGroup = document.getElementById('settingGroupPoolSize');
  const triviaDiffGroup = document.getElementById('settingGroupTriviaDiff');
  const modeInfoGroup = document.getElementById('settingGroupModeInfo');
  const modeInfoTitle = document.getElementById('settingModeInfoTitle');
  const modeInfoDesc = document.getElementById('settingModeInfoDesc');

  if (timerGroup) timerGroup.classList.toggle('hidden', isUntimed);
  if (untimedNotice) untimedNotice.classList.toggle('hidden', !isUntimed);
  if (clubRulesGroup) clubRulesGroup.classList.toggle('hidden', !isClubMode);
  if (poolSizeGroup) poolSizeGroup.classList.toggle('hidden', !isMultiClub);
  if (triviaDiffGroup) triviaDiffGroup.classList.toggle('hidden', !isTrivia);
  if (modeInfoGroup) {
    modeInfoGroup.classList.toggle('hidden', !showModeInfo);
    if (showModeInfo && modeInfoTitle && modeInfoDesc) {
      if (gameMode === 'lineup_quiz') {
        modeInfoTitle.textContent = '📋 กติกาโหมดทายผัง 11 ตัวจริง (Missing 11)';
        modeInfoDesc.innerHTML = '• เลือกแมตช์ที่ต้องการทายได้บนกระดาน (40 แมตช์ระดับตำนาน สุ่มไม่ซ้ำ!)<br>• ทายสดโดยไม่เปิดคำใบ้ได้ <strong>+3 แต้ม</strong> / กดใบ้ทีละขั้น: สัญชาติ <strong>+2 แต้ม</strong> • เบอร์เสื้อ & ชื่อย่อ <strong>+1 แต้ม</strong><br>• คนที่เปิดตำแหน่งสุดท้าย (คนที่ 11) สำเร็จ รับโบนัสปิดผัง <strong>+1 แต้ม</strong>!';
      } else if (gameMode === 'top10_stats') {
        modeInfoTitle.textContent = '📊 กติกาโหมดทายท็อป 10 สถิติลูกหนัง';
        modeInfoDesc.innerHTML = '• เลือกเปลี่ยนหัวข้อสถิติบนกระดานได้ตลอดเวลา (32 หัวข้อ All-Time & 2026-27 สุ่มไม่ซ้ำ!)<br>• อันดับ <strong>#1–#3 ได้ +1 แต้ม</strong> • <strong>#4–#7 ได้ +2 แต้ม</strong> • <strong>#8–#10 ได้ +3 แต้ม</strong><br>• หากกดดูคำใบ้ (💡) ข้อนั้นจะได้ <strong>+1 แต้ม</strong>';
      } else if (gameMode === 'career_path') {
        modeInfoTitle.textContent = '🕵️‍♂️ กติกาโหมดเส้นทางค้าแข้ง (ฉันคือใคร?)';
        modeInfoDesc.innerHTML = '• ทายชื่อนักเตะจากตารางสโมสรที่เคยย้ายทีม จำนวนนัด และประตู (65 ตำนาน & สตาร์ดัง สุ่มไม่ซ้ำ!)<br>• ทายถูกโดยไม่เปิดคำใบ้ได้ <strong>+3 แต้ม</strong> / กดเปิดคำใบ้ (💡) ได้ <strong>+1 แต้ม</strong><br>• คนที่ตอบถูกเป็นคนแรกสุดของข้อ รับโบนัสความไว <strong>+1 แต้ม</strong>!';
      } else if (gameMode === 'footy_grid') {
        modeInfoTitle.textContent = '🔢 กติกาโหมดตาราง XO ฟุตบอล 3x3';
        modeInfoDesc.innerHTML = '• ผลัดกันลงทีละเทิร์น (Turn-Based XO) คลิกเลือกช่องแล้วพิมพ์ชื่อนักเตะที่ตรงทั้งแนวนอนและแนวตั้ง<br>• ช่องทั่วไป <strong>+2 แต้ม</strong> • 💎ช่องหายาก (มีคำตอบ ≤5 คน) <strong>+3 แต้ม</strong> • ใช้คำใบ้ <strong>+1 แต้ม</strong><br>• 🏆 เรียงครบ 3 ช่องแนวใดก็ได้ (BINGO) รับโบนัสเส้นละ <strong>+3 แต้ม</strong>!';
      } else if (gameMode === 'connections') {
        modeInfoTitle.textContent = '🧩 กติกาโหมดจับกลุ่ม 16 นักเตะ 4 ความลับ (Connections)';
        modeInfoDesc.innerHTML = '• คลิกเลือกนักเตะบนกระดานทีละ 4 คนที่มีความเชื่อมโยงลับเดียวกัน (สุ่มหมวดไม่ซ้ำ!)<br>• 🟢 หมวดง่าย <strong>+1 แต้ม</strong> • 🟡 หมวดกลาง <strong>+2 แต้ม</strong> • 🔵 หมวดยาก <strong>+3 แต้ม</strong> • 🟣 หมวดแฟนพันธุ์แท้ (2 สโมสร) <strong>+4 แต้ม</strong><br>• เมื่อเปิดครบ 3 หมวด ระบบจะเฉลยหมวดที่ 4 ให้อัตโนมัติ!';
      } else if (gameMode === 'who_are_ya_wordle') {
        modeInfoTitle.textContent = '🖼️ กติกาโหมดทายนักเตะจากรูปเบลอ + Wordle (Who Are Ya?)';
        modeInfoDesc.innerHTML = '• ทายชื่อนักเตะปริศนาจากรูปเบลอ! ทุกครั้งที่ทายจะแสดงแถบสีใบ้ (🟢ตรงเป๊ะ / 🟡เคยอยู่ร่วมสโมสรหรือลีกเดียวกัน) และรูปจะชัดขึ้นเรื่อยๆ<br>• ทายถูกตั้งแต่เบลอจัดได้ <strong>+4 แต้ม</strong> และลดหลั่นลงมาตามจำนวนคำใบ้ (+3 / +2 / +1 แต้ม)!';
      } else if (gameMode === 'chain_link') {
        modeInfoTitle.textContent = '🔗 กติกาโหมดต่อโซ่นักเตะเพื่อนร่วมทีม (Chain Link)';
        modeInfoDesc.innerHTML = '• ผลัดกันตอบทีละคนตามเวลาต่อเทิร์น! พิมพ์ชื่อนักเตะที่เคยอยู่สโมสรเดียวกับคนล่าสุดในโซ่ (ห้ามซ้ำนักเตะ & ห้ามซ้ำสโมสรเชื่อม)<br>• เชื่อมสำเร็จรับ <strong>+2 แต้ม</strong> (โบนัสทุก 5 ลิงก์ +1 แต้ม)<br>• ใครตอบไม่ทันเวลาทำโซ่ขาด คนส่งไม้ต่อก่อนหน้ารับโบนัส <strong>+1 แต้ม</strong> แล้วเริ่มโซ่ใหม่แข่งสะสมแต้มต่อเนื่อง!';
      }
    }
  }

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

  // MODE 2: STARTING XI PITCH (Missing 11 - Untimed Continuous Board with Hint & Reveal)
  if (mode === 'lineup_quiz') {
    const slots = md.slots || [];
    const unlockedCount = slots.filter((s) => s.unlocked).length;
    const matchOptionsHtml = (md.availableLineups || [])
      .map(
        (l) =>
          `<option value="${l.id}" ${l.id === md.lineupId ? 'selected' : ''}>${l.title} (${l.subtitle})</option>`
      )
      .join('');

    const toolbarHtml = !isReveal
      ? `
        <div class="top10-toolbar">
          <div class="top10-toolbar-left">
            <select id="lineupMatchSelect" class="select-input" style="max-width:520px;padding:8px 14px;font-size:0.95rem;">
              ${matchOptionsHtml}
            </select>
            <span class="top10-progress-pill" style="font-size:0.88rem;padding:6px 14px;">เปิดแล้ว <strong>${unlockedCount}/11</strong> คน</span>
          </div>
          <div class="top10-toolbar-actions">
            <button type="button" class="btn btn-outline btn-sm" data-lineup-reveal-all="1">👁️ เฉลยทั้งทีม</button>
            <button type="button" class="btn btn-accent btn-sm" data-lineup-next="1">🔄 เปลี่ยนแมตช์ถัดไป</button>
          </div>
        </div>
      `
      : '';

    const slotsHtml = slots
      .map((s) => {
        const hintLevel = Number(s.hintLevel || 0);
        const photoHtml =
          s.unlocked && s.photoUrl
            ? `<img src="${s.photoUrl}" alt="${s.playerName}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #fbbf24;margin:4px auto;display:block;" onerror="this.style.display='none'" />`
            : '';

        const hintOrName = s.unlocked
          ? s.playerName
          : hintLevel >= 3 && s.hintText
          ? `💡 ${s.hintText}`
          : '❓ ???';

        const nextHintLabel =
          hintLevel === 0 ? '💡 ใบ้ชาติ' : hintLevel === 1 ? '💡 ใบ้เบอร์' : '💡 ใบ้ชื่อย่อ';

        const miniActions =
          !s.unlocked && !isReveal
            ? `
              <div style="display:flex;justify-content:center;gap:6px;margin-top:6px;">
                ${hintLevel < 3 ? `<button type="button" class="btn-mini-action hint-btn" style="padding:5px 10px;font-size:0.78rem;border-radius:8px;" data-lineup-hint="${s.slotId}" title="เปิดคำใบ้ทีละขั้น (${hintLevel}/3)">${nextHintLabel}</button>` : ''}
                <button type="button" class="btn-mini-action reveal-btn" style="padding:5px 10px;font-size:0.78rem;border-radius:8px;" data-lineup-reveal="${s.slotId}" title="เปิดเฉลยตำแหน่งนี้">👁️ เฉลย</button>
              </div>
            `
            : '';

        const byLabel = s.unlocked
          ? s.revealed
            ? `<div class="slot-by" style="color:#fbbf24;">👁️ เฉลยแล้ว (0 แต้ม)</div>`
            : `<div class="slot-by">✅ ${s.answeredBy} (+${s.pointsEarned || 3} แต้ม)</div>`
          : `<div class="slot-by" style="color:#94a3b8;">🎯 +${s.points || 3} แต้ม</div>`;

        const flagDisplay =
          (s.unlocked || hintLevel >= 1) && s.flag
            ? renderFlagHTML(s.flag, s.flagUrl)
            : `<span style="opacity:0.45;" title="กดใบ้เพื่อดูสัญชาติ">🏳️</span>`;

        const numberDisplay =
          (s.unlocked || hintLevel >= 2) && s.number !== null && s.number !== undefined
            ? `<span>#${s.number}</span>`
            : `<span style="opacity:0.45;" title="กดใบ้เพื่อดูเบอร์เสื้อ">#?</span>`;

        return `
          <div class="pitch-slot ${s.unlocked ? 'unlocked' : ''}" style="grid-row:${s.row}; grid-column:${s.col};">
            <div class="slot-top">
              ${flagDisplay}
              <span>${s.pos}</span>
              ${numberDisplay}
            </div>
            ${photoHtml}
            <div class="slot-name">${hintOrName}</div>
            ${byLabel}
            ${miniActions}
          </div>
        `;
      })
      .join('');

    const clearedBannerHtml =
      !isReveal && slots.length > 0 && unlockedCount === slots.length
        ? `
          <div style="padding:12px 16px;margin-bottom:12px;border-radius:12px;background:rgba(16,185,129,0.18);border:1px solid #10b981;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <strong style="color:#fff;font-size:0.96rem;">🎉 เคลียร์ผัง 11 ตัวจริงแมตช์นี้ครบ 100% แล้ว!</strong>
            <button type="button" class="btn btn-primary btn-sm" data-lineup-next="1">➡️ ไปแมตช์ถัดไปเลย!</button>
          </div>
        `
        : '';

    return `
      ${toolbarHtml}
      ${clearedBannerHtml}
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
            <select id="top10TopicSelect" class="select-input" style="max-width:520px;padding:8px 14px;font-size:0.95rem;">
              ${listOptionsHtml}
            </select>
            <span class="top10-progress-pill" style="font-size:0.88rem;padding:6px 14px;">เปิดแล้ว <strong>${unlockedCount}/10</strong> อันดับ</span>
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
            : `<small style="color:#6ee7b7;">✅ ตอบถูกโดย ${it.answeredBy} (+${it.pointsEarned || it.points || 1} คะแนน)</small>`;
        } else if (it.hinted && it.hintText) {
          statusSubHtml = `<small style="color:#fde68a;font-weight:600;">💡 คำใบ้: ${it.hintText} (ตอบถูกได้ +1 คะแนน)</small>`;
        } else {
          statusSubHtml = `<small style="color:#94a3b8;">🎯 ตอบถูกรับ <strong>+${it.points || 1} คะแนน</strong></small>`;
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

    const clearedBannerHtml =
      !isReveal && items.length > 0 && unlockedCount === items.length
        ? `
          <div style="padding:12px 16px;margin-bottom:12px;border-radius:12px;background:rgba(16,185,129,0.18);border:1px solid #10b981;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <strong style="color:#fff;font-size:0.96rem;">🎉 เปิดครบทั้ง 10 อันดับในหัวข้อนี้เรียบร้อยแล้ว!</strong>
            <button type="button" class="btn btn-primary btn-sm" data-top10-next-list="1">➡️ เปลี่ยนหัวข้อถัดไปเลย!</button>
          </div>
        `
        : '';

    return `${toolbarHtml}${clearedBannerHtml}<div class="top10-grid">${rowsHtml}</div>`;
  }

  // MODE 4: CAREER PATH (Who Are Ya - Hid nationality/position until Hint clicked)
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

    const careerActionsHtml = !isReveal
      ? `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <span class="top10-progress-pill">🎯 คะแนนข้อนี้: <strong>+${md.potentialPoints || (md.hintOpened ? 1 : 3)} แต้ม</strong> (+1 โบนัสคนแรก)</span>
            ${
              !md.hintOpened
                ? `<button type="button" class="btn btn-outline btn-sm" data-career-hint="1">💡 เปิดคำใบ้ (เหลือ +1 แต้ม)</button>`
                : `<span class="top10-progress-pill">💡 เปิดคำใบ้แล้ว</span>`
            }
            <button type="button" class="btn btn-outline btn-sm" data-career-reveal="1">👁️ ดูเฉลย / ข้ามข้อนี้</button>
          </div>
        </div>
      `
      : '';

    return `
      <div class="career-card">
        ${revealedHero}
        ${careerActionsHtml}
        <div class="career-hint-bar">
          <span>💡 <strong>คำใบ้:</strong> ${md.hint}</span>
          <span>สัญชาติ: ${md.hintOpened || isReveal ? renderFlagHTML(md.flag, md.flagUrl) : '❓ ซ่อนอยู่'} • ตำแหน่ง: <strong>${md.position}</strong></span>
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
      easy: { text: '🟢 ระดับง่าย (+1 แต้ม • ตอบคนแรก +2 แต้ม)', color: '#10b981' },
      medium: { text: '🟡 ระดับปานกลาง (+2 แต้ม • ตอบคนแรก +3 แต้ม)', color: '#f59e0b' },
      hard: { text: '🔴 ระดับยาก แฟนพันธุ์แท้ (+3 แต้ม • ตอบคนแรก +4 แต้ม)', color: '#ef4444' }
    };
    const qDiff = diffLabels[md.difficulty] || diffLabels.medium;
    const selDiff = md.selectedDifficulty || room.settings?.triviaDifficulty || 'all';

    const totalPoolCount = md.totalPoolCount || 165;
    const diffFilterBar = !isReveal
      ? `
        <div class="trivia-diff-bar">
          <span>🎚️ ความยากคำถาม (${totalPoolCount} ข้อไม่ซ้ำ):</span>
          <div class="trivia-diff-pills">
            <button type="button" class="diff-pill ${selDiff === 'all' ? 'active' : ''}" data-trivia-diff="all">🎲 รวมทุกระดับ</button>
            <button type="button" class="diff-pill ${selDiff === 'easy' ? 'active' : ''}" data-trivia-diff="easy">🟢 ง่าย (+1)</button>
            <button type="button" class="diff-pill ${selDiff === 'medium' ? 'active' : ''}" data-trivia-diff="medium">🟡 ปานกลาง (+2)</button>
            <button type="button" class="diff-pill ${selDiff === 'hard' ? 'active' : ''}" data-trivia-diff="hard">🔴 ยาก (+3)</button>
            <button type="button" class="diff-pill" data-trivia-diff="${selDiff}" title="สุ่มคำถามใหม่ที่ไม่ซ้ำทันที">🔄 เปลี่ยนข้อใหม่</button>
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

  // MODE 6: 3x3 FOOTY TIC-TAC-TOE GRID (Turn-Based XO + Bingo Bonus + Random Generator)
  if (mode === 'footy_grid') {
    const cells = md.cells || Array(9).fill(null);
    const cellMeta = md.cellMeta || [];
    const winningSet = new Set(md.winningCellIndices || []);
    const filledCount = cells.filter(Boolean).length;
    const isMultiplayer = (md.turnOrder || []).length > 1;
    const isMyTurn = !isMultiplayer || md.currentTurnPlayerId === state.playerId;

    if (cells[state.selectedGridCellIndex]) {
      const firstOpen = cells.findIndex((c) => !c);
      if (firstOpen >= 0) state.selectedGridCellIndex = firstOpen;
    }

    const turnQueuePillsHtml = (md.turnOrder || [])
      .map((tp) => {
        const activeStyle = tp.isCurrentTurn
          ? 'background:rgba(16,185,129,0.25);border:2px solid #10b981;color:#fff;font-weight:800;box-shadow:0 0 12px rgba(16,185,129,0.35);'
          : 'background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.25);color:#cbd5e1;';
        return `<span style="padding:5px 12px;border-radius:999px;font-size:0.82rem;display:inline-flex;align-items:center;gap:6px;${activeStyle}">
          ${tp.isCurrentTurn ? '🟢' : '⚪'} ${tp.avatar} ${tp.name} <small style="opacity:0.85;">(${tp.score} แต้ม)</small>
        </span>`;
      })
      .join('<span style="color:#64748b;font-weight:700;">➔</span>');

    const turnBannerHtml =
      !isReveal && isMultiplayer && filledCount < 9
        ? `
          <div style="padding:10px 14px;margin-bottom:10px;border-radius:12px;background:${isMyTurn ? 'rgba(16,185,129,0.16)' : 'rgba(30,41,59,0.85)'};border:1px solid ${isMyTurn ? '#10b981' : 'rgba(148,163,184,0.3)'};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:0.82rem;color:#94a3b8;font-weight:700;">🔄 ลำดับเทิร์นวาง XO:</span>
              ${turnQueuePillsHtml}
            </div>
            <div style="font-size:0.78rem;color:#fde68a;font-weight:600;">
              🏆 เรียงครบ 3 ช่อง (แนวนอน / แนวตั้ง / แนวทแยง) รับโบนัส BINGO +3 แต้ม!
            </div>
          </div>
        `
        : '';

    const toolbarHtml = !isReveal
      ? `
        <div class="top10-toolbar">
          <div class="top10-toolbar-left">
            <span class="top10-progress-pill">ยึดแล้ว <strong>${filledCount}/9</strong> ช่อง (เรียง 3 ช่องรับโบนัส <strong>BINGO +3</strong>)</span>
            <button type="button" class="btn btn-outline btn-sm" data-grid-hint="${state.selectedGridCellIndex}">💡 คำใบ้ช่องที่เลือก</button>
            <button type="button" class="btn btn-outline btn-sm" data-grid-reveal="${state.selectedGridCellIndex}">👁️ เฉลยช่องที่เลือก</button>
            ${
              isMultiplayer && filledCount < 9
                ? `<button type="button" class="btn btn-outline btn-sm" data-grid-skip="1">🏳️ ข้ามตานี้</button>`
                : ''
            }
          </div>
          <div class="top10-toolbar-actions">
            <button type="button" class="btn btn-accent btn-sm" data-grid-random="1">🎲 สุ่มตาราง XO 3x3 ใหม่</button>
          </div>
        </div>
      `
      : '';

    const renderHdrIcon = (hdr) => {
      if (hdr.badgeUrl) {
        return `<img src="${hdr.badgeUrl}" alt="${hdr.label}" style="width:26px;height:26px;object-fit:contain;margin:0 auto 4px;" onerror="this.style.display='none'" />`;
      }
      if (hdr.flagUrl) {
        return `<div style="margin-bottom:4px;">${renderFlagHTML(hdr.value, hdr.flagUrl)}</div>`;
      }
      return '';
    };

    const allCellsClaimed = cells.length === 9 && cells.every(Boolean);
    const clearedBannerHtml =
      !isReveal && allCellsClaimed
        ? `
          <div style="padding:12px 16px;margin-bottom:12px;border-radius:12px;background:rgba(16,185,129,0.18);border:1px solid #10b981;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <strong style="color:#fff;font-size:0.96rem;">🎉 ยึดตาราง XO ครบทั้ง 9 ช่องแล้ว!</strong>
            <button type="button" class="btn btn-primary btn-sm" data-grid-random="1">🎲 สุ่มตาราง XO ชุดใหม่เลย!</button>
          </div>
        `
        : '';

    let html = `${turnBannerHtml}${toolbarHtml}${clearedBannerHtml}<div class="footy-grid-wrapper"><div class="footy-grid-board">`;
    html += `<div class="grid-header-cell"><strong>XO 3x3</strong><small>คลิกเลือกช่อง</small></div>`;
    (md.cols || []).forEach((col) => {
      html += `<div class="grid-header-cell">${renderHdrIcon(col)}<strong>${col.label}</strong><small>${col.sub}</small></div>`;
    });

    (md.rows || []).forEach((row, rIdx) => {
      html += `<div class="grid-header-cell">${renderHdrIcon(row)}<strong>${row.label}</strong><small>${row.sub}</small></div>`;
      for (let cIdx = 0; cIdx < 3; cIdx++) {
        const cellIdx = rIdx * 3 + cIdx;
        const claimed = cells[cellIdx];
        const metaInfo = cellMeta[cellIdx] || {};
        const isSelected = !isReveal && !claimed && state.selectedGridCellIndex === cellIdx;
        const isBingoCell = winningSet.has(cellIdx);
        if (claimed) {
          const bingoStyle = isBingoCell
            ? 'border:2px solid #fbbf24;box-shadow:0 0 16px rgba(251,191,36,0.45);background:linear-gradient(135deg, rgba(245,158,11,0.28), rgba(16,185,129,0.22));'
            : '';
          const cellPhoto = claimed.photoUrl
            ? `<img src="${claimed.photoUrl}" class="player-photo-avatar" style="width:32px;height:32px;margin-bottom:3px;" onerror="this.style.display='none'" />`
            : `<div style="font-size:1.1rem;">${claimed.ownerAvatar}</div>`;
          html += `
            <div class="grid-play-cell claimed" style="${bingoStyle}">
              ${cellPhoto}
              <strong style="font-size:0.82rem;color:#fde68a;display:flex;align-items:center;gap:4px;">
                ${renderFlagHTML(claimed.playerFlag, claimed.flagUrl)} ${claimed.playerName}
              </strong>
              <small style="font-size:0.7rem;color:${claimed.revealed ? '#fbbf24' : '#6ee7b7'};">
                ${claimed.revealed ? '👁️ เฉลยระบบ (0 แต้ม)' : `✅ ยึดโดย ${claimed.ownerName} (+${claimed.pointsEarned || 2} แต้ม)${isBingoCell ? ' 🏆BINGO!' : ''}`}
              </small>
            </div>
          `;
        } else {
          const isRare = (metaInfo.possibleCount || 99) <= 5;
          const ptsLabel = metaInfo.points || (isRare ? 3 : 2);
          const hintLine =
            metaInfo.hinted && metaInfo.hintText
              ? `<small style="color:#fde68a;font-weight:700;">💡 ${metaInfo.hintText} (+1 แต้ม)</small>`
              : `<small style="opacity:0.8;font-size:0.68rem;color:${isRare ? '#f472b6' : '#cbd5e1'};">${isRare ? '💎 ช่องหายาก' : 'มีคำตอบ'} (${metaInfo.possibleCount || '?'} คน) • <strong>+${ptsLabel} แต้ม</strong></small>`;

          html += `
            <div class="grid-play-cell ${isSelected ? 'selected-target' : ''}" data-grid-cell="${cellIdx}">
              <span style="font-size:0.78rem;color:#cbd5e1;">${row.label}</span>
              <strong style="font-size:0.82rem;color:#fbbf24;">✕ ${md.cols[cIdx].label}</strong>
              ${hintLine}
              ${isSelected ? '<small style="color:#34d399;font-weight:700;">🎯 เลือกช่องนี้อยู่</small>' : ''}
            </div>
          `;
        }
      }
    });

    html += `</div></div>`;
    return html;
  }

  // MODE 7: FOOTBALL CONNECTIONS (16 Players -> 4 Secret Groups of 4)
  if (mode === 'connections') {
    if (md.boardId && state.lastConnectionsBoardId !== md.boardId) {
      state.selectedConnectionIds = [];
      state.lastConnectionsBoardId = md.boardId;
    }
    const remainingIds = new Set((md.remainingTiles || []).map((t) => t.id));
    state.selectedConnectionIds = (state.selectedConnectionIds || []).filter((id) => remainingIds.has(id));
    const selSet = new Set(state.selectedConnectionIds);

    const solvedCount = (md.solvedGroups || []).length;
    const hintBannerHtml = md.hintText
      ? `<div style="padding:8px 12px;margin-bottom:10px;border-radius:10px;background:rgba(245,158,11,0.16);border:1px solid rgba(251,191,36,0.45);color:#fde68a;font-size:0.84rem;font-weight:600;">${md.hintText}</div>`
      : '';

    const toolbarHtml = !isReveal
      ? `
        <div class="top10-toolbar">
          <div class="top10-toolbar-left">
            <span class="top10-progress-pill">เปิดแล้ว <strong>${solvedCount}/4</strong> กลุ่ม • เลือกอยู่ <strong>${selSet.size}/4</strong> คน</span>
            <button type="button" class="btn btn-primary btn-sm" data-conn-submit="1" ${selSet.size !== 4 ? 'disabled' : ''}>✅ ส่งกลุ่ม 4 คน</button>
            <button type="button" class="btn btn-ghost btn-sm" data-conn-clear="1" ${selSet.size === 0 ? 'disabled' : ''}>✖ ล้างที่เลือก</button>
          </div>
          <div class="top10-toolbar-actions">
            <button type="button" class="btn btn-outline btn-sm" data-conn-hint="1">💡 คำใบ้คู่หู</button>
            <button type="button" class="btn btn-outline btn-sm" data-conn-reveal-one="1">👁️ เฉลย 1 กลุ่ม</button>
            <button type="button" class="btn btn-outline btn-sm" data-conn-reveal-all="1">👁️ เฉลยทั้งหมด</button>
            <button type="button" class="btn btn-accent btn-sm" data-conn-next="1">🎲 สุ่มกระดานใหม่</button>
          </div>
        </div>
      `
      : '';

    const solvedHtml = (md.solvedGroups || [])
      .map((g) => {
        const namesStr = (g.players || []).map((p) => `${p.flag} ${p.name}`).join('  •  ');
        return `
          <div class="connections-group-banner" style="border-color:${g.color};background:linear-gradient(135deg, ${g.color}28, rgba(15,23,42,0.94));">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
              <strong style="font-size:0.96rem;color:#fff;">${g.tierLabel} — ${g.title}</strong>
              <span style="font-size:0.78rem;color:${g.revealed ? '#fbbf24' : '#6ee7b7'};font-weight:700;">
                ${g.revealed ? '👁️ เปิดเฉลย (0 แต้ม)' : `✅ แก้ได้โดย ${g.solvedBy} (+${g.points} แต้ม)`}
              </span>
            </div>
            <div style="font-size:0.84rem;color:#e2e8f0;">${namesStr}</div>
          </div>
        `;
      })
      .join('');

    const tilesHtml = (md.remainingTiles || [])
      .map((t) => {
        const isSel = selSet.has(t.id);
        return `
          <div class="conn-tile ${isSel ? 'selected' : ''}" data-conn-tile="${t.id}">
            ${renderPlayerPhotoHTML(t.photoUrl, '⚽', 'player-photo-avatar')}
            <div style="font-weight:700;font-size:0.84rem;line-height:1.25;">${t.name}</div>
            <div style="font-size:0.72rem;color:#94a3b8;display:flex;align-items:center;gap:4px;">
              ${renderFlagHTML(t.flag, t.flagUrl)} <span>${t.position}</span>
            </div>
          </div>
        `;
      })
      .join('');

    const clearedBannerHtml =
      !isReveal && solvedCount === 4
        ? `
          <div style="padding:12px 16px;margin-bottom:12px;border-radius:12px;background:rgba(16,185,129,0.18);border:1px solid #10b981;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <strong style="color:#fff;font-size:0.96rem;">🎉 ไขความลับครบทั้ง 4 หมวดหมู่แล้ว!</strong>
            <button type="button" class="btn btn-primary btn-sm" data-conn-next="1">🎲 สุ่มกระดานชุดต่อไปเลย!</button>
          </div>
        `
        : '';

    return `
      ${toolbarHtml}
      ${clearedBannerHtml}
      ${hintBannerHtml}
      <div class="connections-solved-list">${solvedHtml}</div>
      <div class="connections-grid-16">${tilesHtml}</div>
    `;
  }

  // MODE 8: WHO ARE YA? (BLURRED PHOTO + WORDLE ATTRIBUTE MATRIX)
  if (mode === 'who_are_ya_wordle') {
    const clues = md.hintClues || {};
    const toolbarHtml = !isReveal
      ? `
        <div class="top10-toolbar">
          <div class="top10-toolbar-left">
            <span class="top10-progress-pill">🎯 คะแนนปัจจุบัน: <strong>+${md.potentialPoints || 1} แต้ม</strong></span>
            ${
              !md.solved && !md.revealed
                ? `
                  <button type="button" class="btn btn-outline btn-sm" data-wordle-hint="1">💡 ลดความเบลอ & เปิดคำใบ้ถัดไป</button>
                  <button type="button" class="btn btn-outline btn-sm" data-wordle-reveal="1">👁️ เฉลยนักเตะคนนี้</button>
                `
                : ''
            }
          </div>
          <div class="top10-toolbar-actions">
            <button type="button" class="btn btn-accent btn-sm" data-wordle-next="1">🔄 สุ่มนักเตะปริศนาคนต่อไป</button>
          </div>
        </div>
      `
      : '';

    const photoElem = md.photoUrl
      ? `<img src="${md.photoUrl}" alt="Mystery Player" style="filter:blur(${md.blurPx || 0}px);" onerror="this.outerHTML='<span style=\\'font-size:2.8rem;\\'>🕵️‍♂️</span>'" />`
      : `<span style="font-size:2.8rem;">🕵️‍♂️</span>`;

    const solvedBanner =
      md.solved || md.revealed
        ? `
          <div style="padding:12px 16px;margin-bottom:12px;border-radius:12px;background:${md.solved ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.16)'};border:1px solid ${md.solved ? '#10b981' : '#f59e0b'};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:0.78rem;color:#cbd5e1;">${md.solved ? `🎉 ทายถูกโดย ${md.solvedBy} (+${md.pointsAwarded} แต้ม!)` : '👁️ เฉลยนักเตะปริศนา (0 แต้ม)'}</div>
              <div style="font-size:1.15rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;">
                ${renderFlagHTML(md.answerPlayer?.flag, md.answerPlayer?.flagUrl)} ${md.answerPlayer?.name || ''} (${md.answerPlayer?.position || ''})
              </div>
              <div style="font-size:0.78rem;color:#a7f3d0;">สโมสร: ${(md.answerPlayer?.clubs || []).join(', ')}</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" data-wordle-next="1">➡️ ไปข้อต่อไปเลย!</button>
          </div>
        `
        : '';

    const guessesHtml = (md.guesses || [])
      .map((g) => {
        const clubSub =
          g.clubMatch === 'partial' && g.sharedClubNames && g.sharedClubNames.length > 0
            ? `<div style="font-size:0.66rem;font-weight:400;">(เคยอยู่ ${g.sharedClubNames[0]})</div>`
            : '';
        return `
          <div class="wordle-guess-row">
            <div style="display:flex;align-items:center;gap:8px;">
              ${renderPlayerPhotoHTML(g.photoUrl, '⚽', 'player-photo-avatar')}
              <div>
                <div style="font-weight:700;font-size:0.86rem;">${g.playerName}</div>
                <div style="font-size:0.7rem;color:#94a3b8;">ทายโดย ${g.byPlayerAvatar} ${g.byPlayerName}</div>
              </div>
            </div>
            <div class="wordle-attr-cell match-${g.natMatch}">
              <div>🌍 สัญชาติ</div>
              <div>${renderFlagHTML(g.flag, g.flagUrl)}</div>
            </div>
            <div class="wordle-attr-cell match-${g.leagueMatch}">
              <div>🏆 ลีก</div>
              <div>${g.leagueName}</div>
            </div>
            <div class="wordle-attr-cell match-${g.clubMatch}">
              <div>🏟️ สโมสร</div>
              <div>${g.clubName}</div>
              ${clubSub}
            </div>
            <div class="wordle-attr-cell match-${g.posMatch}">
              <div>👕 ตำแหน่ง</div>
              <div>${g.position}</div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      ${toolbarHtml}
      ${solvedBanner}
      <div class="wordle-hero-box">
        <div class="wordle-photo-frame">${photoElem}</div>
        <div class="wordle-clues-grid">
          <div class="wordle-clue-pill">🌍 สัญชาติ: <strong>${clues.nationality ? renderFlagHTML(clues.nationality, clues.flagUrl) : '🔒 ซ่อนอยู่'}</strong></div>
          <div class="wordle-clue-pill">👕 ตำแหน่ง: <strong>${clues.position || '🔒 ซ่อนอยู่'}</strong></div>
          <div class="wordle-clue-pill">🏟️ สโมสรหลัก: <strong>${clues.clubName || '🔒 ซ่อนอยู่'}</strong></div>
          <div class="wordle-clue-pill">🔤 อักษรย่อ: <strong>${clues.initials || '🔒 ซ่อนอยู่'}</strong></div>
        </div>
      </div>
      <div class="wordle-guesses-list">
        ${guessesHtml || '<div class="muted-text" style="text-align:center;padding:10px;font-size:0.84rem;">พิมพ์ทายชื่อนักเตะคนแรกด้านล่างเพื่อดูแถบสีคำใบ้ (🟢ตรงเป๊ะ / 🟡เคยอยู่สโมสรหรือลีกเดียวกัน)!</div>'}
      </div>
    `;
  }

  // MODE 9: CHAIN LINK (Turn-Based Player -> Shared Club -> Teammate -> Shared Club...)
  if (mode === 'chain_link') {
    const anchor = md.currentAnchor || {};
    const isMyTurn = md.currentTurnPlayerId === state.playerId;
    const availClubsHtml = (anchor.availableClubs || [])
      .map((c) => {
        const bImg = c.badgeUrl ? `<img src="${c.badgeUrl}" alt="${c.name}" style="width:15px;height:15px;object-fit:contain;" onerror="this.style.display='none'" />` : '';
        return `<span class="mini-club-chip">${bImg} ${c.name}</span>`;
      })
      .join('');

    const usedClubsHtml = (md.usedClubs || [])
      .map((c) => `<span class="used-chip" style="font-size:0.74rem;border-color:rgba(239,68,68,0.4);color:#fca5a5;">🔒 ${c.name}</span>`)
      .join('');

    const turnQueuePillsHtml = (md.turnOrder || [])
      .map((tp) => {
        const activeStyle = tp.isCurrentTurn
          ? 'background:rgba(16,185,129,0.25);border:2px solid #10b981;color:#fff;font-weight:800;box-shadow:0 0 12px rgba(16,185,129,0.35);'
          : 'background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.25);color:#cbd5e1;';
        return `<span style="padding:5px 12px;border-radius:999px;font-size:0.82rem;display:inline-flex;align-items:center;gap:6px;${activeStyle}">
          ${tp.isCurrentTurn ? '🟢' : '⚪'} ${tp.avatar} ${tp.name} <small style="opacity:0.85;">(${tp.score} แต้ม)</small>
        </span>`;
      })
      .join('<span style="color:#64748b;font-weight:700;">➔</span>');

    const turnBannerHtml = !isReveal
      ? `
        <div style="padding:10px 14px;margin-bottom:10px;border-radius:12px;background:${isMyTurn ? 'rgba(16,185,129,0.16)' : 'rgba(30,41,59,0.85)'};border:1px solid ${isMyTurn ? '#10b981' : 'rgba(148,163,184,0.3)'};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:0.82rem;color:#94a3b8;font-weight:700;">🔄 ลำดับเทิร์น:</span>
            ${turnQueuePillsHtml}
          </div>
          <div style="font-size:0.78rem;color:#fde68a;font-weight:600;">
            ⏱️ ตอบไม่ทันเวลา = โซ่ขาด! (คนส่งไม้ต่อก่อนหน้ารับโบนัส +1 แต้ม)
          </div>
        </div>
      `
      : '';

    const toolbarHtml = !isReveal
      ? `
        <div class="top10-toolbar">
          <div class="top10-toolbar-left">
            <span class="top10-progress-pill">🔗 ความยาวลูกโซ่: <strong>${md.chainLength || 1}</strong> คน (ต่อสำเร็จรับ <strong>+2 แต้ม</strong>)</span>
            <button type="button" class="btn btn-outline btn-sm" data-chain-hint="1">💡 คำใบ้คนถัดไป</button>
            <button type="button" class="btn btn-outline btn-sm" data-chain-auto="1">🏳️ ข้ามตานี้ (ให้ระบบต่อให้ 1 ก้าว)</button>
          </div>
          <div class="top10-toolbar-actions">
            <button type="button" class="btn btn-accent btn-sm" data-chain-reset="1">🔄 เริ่มลูกโซ่ใหม่</button>
          </div>
        </div>
      `
      : '';

    const hintBannerHtml = md.hintText
      ? `<div style="padding:8px 12px;margin-bottom:10px;border-radius:10px;background:rgba(245,158,11,0.16);border:1px solid rgba(251,191,36,0.45);color:#fde68a;font-size:0.84rem;font-weight:600;">${md.hintText}</div>`
      : '';

    const chainTimelineHtml = (md.history || [])
      .map((node, idx) => {
        const bridgeHtml =
          idx > 0
            ? `<span class="chain-bridge-badge">➔ 🏟️ ${node.viaClubName} ➔</span>`
            : '';
        return `
          ${bridgeHtml}
          <div class="chain-node">
            ${renderPlayerPhotoHTML(node.photoUrl, '⚽', 'player-photo-avatar')}
            <div>
              <div style="font-weight:700;">#${node.step} ${renderFlagHTML(node.flag, node.flagUrl)} ${node.playerName}</div>
              <div style="font-size:0.7rem;color:#94a3b8;">${node.byPlayerName}${node.pointsEarned > 0 ? ` (+${node.pointsEarned} แต้ม)` : ''}</div>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      ${turnBannerHtml}
      ${toolbarHtml}
      ${hintBannerHtml}
      <div class="chain-anchor-card">
        <div style="font-size:0.78rem;color:#6ee7b7;font-weight:700;margin-bottom:6px;">🎯 นักเตะคนล่าสุดในโซ่ (พิมพ์ชื่อนักเตะที่เคยอยู่สโมสรเดียวกับเขา):</div>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          ${renderPlayerPhotoHTML(anchor.photoUrl, '⚽', 'reveal-player-photo')}
          <div>
            <div style="font-size:1.2rem;font-weight:800;display:flex;align-items:center;gap:6px;">
              ${renderFlagHTML(anchor.flag, anchor.flagUrl)} ${anchor.playerName || ''} <small style="font-weight:500;color:#94a3b8;">(${anchor.position || ''})</small>
            </div>
            <div style="margin-top:6px;font-size:0.8rem;color:#cbd5e1;">
              🏟️ สโมสรที่ยังใช้เชื่อมต่อได้: ${availClubsHtml || '<span style="color:#f87171;">ไม่มีสโมสรว่างเหลือแล้ว! กด "🔄 เริ่มลูกโซ่ใหม่" ได้เลย</span>'}
            </div>
          </div>
        </div>
        ${usedClubsHtml ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;"><small style="color:#94a3b8;">สโมสรที่ใช้เชื่อมไปแล้ว (ห้ามใช้ซ้ำ):</small> ${usedClubsHtml}</div>` : ''}
      </div>
      <div class="chain-timeline">${chainTimelineHtml}</div>
    `;
  }

  return '';
}

function bindDynamicStageEvents(container, room) {
  if (!container) return;
  const mode = room.settings.gameMode || 'club_battle';

  if (mode === 'lineup_quiz') {
    container.querySelectorAll('[data-lineup-hint]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const slotId = btn.dataset.lineupHint;
        sfx.beep(520, 0.08);
        await apiAction('lineup_hint_slot', { slotId });
      });
    });

    container.querySelectorAll('[data-lineup-reveal]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const slotId = btn.dataset.lineupReveal;
        sfx.beep(360, 0.09);
        await apiAction('lineup_reveal_slot', { slotId });
      });
    });

    const revealAllBtn = container.querySelector('[data-lineup-reveal-all]');
    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', async () => {
        sfx.beep(330, 0.12);
        await apiAction('lineup_reveal_all');
      });
    }

    container.querySelectorAll('[data-lineup-next]').forEach((nextBtn) => {
      nextBtn.addEventListener('click', async () => {
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    });

    const matchSelect = container.querySelector('#lineupMatchSelect');
    if (matchSelect) {
      matchSelect.addEventListener('change', async (e) => {
        sfx.lockIn();
        await apiAction('start_mode_round', { lineupId: e.target.value });
      });
    }
  }

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

    container.querySelectorAll('[data-top10-next-list]').forEach((nextListBtn) => {
      nextListBtn.addEventListener('click', async () => {
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    });

    const topicSelect = container.querySelector('#top10TopicSelect');
    if (topicSelect) {
      topicSelect.addEventListener('change', async (e) => {
        sfx.lockIn();
        await apiAction('start_mode_round', { listId: e.target.value });
      });
    }
  }

  if (mode === 'career_path') {
    const hintBtn = container.querySelector('[data-career-hint]');
    if (hintBtn) {
      hintBtn.addEventListener('click', async () => {
        sfx.beep(520, 0.08);
        await apiAction('career_toggle_hint');
      });
    }

    const revealBtn = container.querySelector('[data-career-reveal]');
    if (revealBtn) {
      revealBtn.addEventListener('click', async () => {
        sfx.beep(340, 0.1);
        await apiAction('career_reveal_now');
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

    const hintBtn = container.querySelector('[data-grid-hint]');
    if (hintBtn) {
      hintBtn.addEventListener('click', async () => {
        sfx.beep(520, 0.08);
        await apiAction('grid_hint_cell', { cellIndex: state.selectedGridCellIndex });
      });
    }

    const revealBtn = container.querySelector('[data-grid-reveal]');
    if (revealBtn) {
      revealBtn.addEventListener('click', async () => {
        sfx.beep(360, 0.09);
        await apiAction('grid_reveal_cell', { cellIndex: state.selectedGridCellIndex });
      });
    }

    const skipBtn = container.querySelector('[data-grid-skip]');
    if (skipBtn) {
      skipBtn.addEventListener('click', async () => {
        sfx.beep(420, 0.08);
        await apiAction('grid_skip_turn');
      });
    }

    container.querySelectorAll('[data-grid-random]').forEach((randomGridBtn) => {
      randomGridBtn.addEventListener('click', async () => {
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    });
  }

  if (mode === 'connections') {
    container.querySelectorAll('[data-conn-tile]').forEach((tileEl) => {
      tileEl.addEventListener('click', () => {
        const pid = tileEl.dataset.connTile;
        if (!Array.isArray(state.selectedConnectionIds)) {
          state.selectedConnectionIds = [];
        }
        const idx = state.selectedConnectionIds.indexOf(pid);
        if (idx >= 0) {
          state.selectedConnectionIds.splice(idx, 1);
          sfx.beep(420, 0.06);
        } else {
          if (state.selectedConnectionIds.length >= 4) {
            showToast('เลือกได้สูงสุด 4 คนต่อกลุ่มครับ');
            return;
          }
          state.selectedConnectionIds.push(pid);
          sfx.beep(580, 0.06);
        }
        renderPlayingView(state.room);
      });
    });

    const clearBtn = container.querySelector('[data-conn-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.selectedConnectionIds = [];
        sfx.beep(360, 0.06);
        renderPlayingView(state.room);
      });
    }

    const submitBtn = container.querySelector('[data-conn-submit]');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        if (!Array.isArray(state.selectedConnectionIds) || state.selectedConnectionIds.length !== 4) {
          showToast('กรุณาคลิกเลือกนักเตะให้ครบ 4 คนก่อนกดส่งครับ');
          return;
        }
        sfx.lockIn();
        const res = await apiAction('connections_submit_group', {
          playerIds: state.selectedConnectionIds
        });
        if (res && res.connectionsFeedback) {
          if (res.connectionsFeedback.correct || res.connectionsFeedback.ok) {
            state.selectedConnectionIds = [];
            sfx.success();
          } else {
            sfx.beep(260, 0.14);
          }
          if (res.connectionsFeedback.message) {
            showToast(res.connectionsFeedback.message);
          }
        }
      });
    }

    const hintBtn = container.querySelector('[data-conn-hint]');
    if (hintBtn) {
      hintBtn.addEventListener('click', async () => {
        sfx.beep(520, 0.08);
        await apiAction('connections_hint');
      });
    }

    const revealOneBtn = container.querySelector('[data-conn-reveal-one]');
    if (revealOneBtn) {
      revealOneBtn.addEventListener('click', async () => {
        state.selectedConnectionIds = [];
        sfx.beep(360, 0.09);
        await apiAction('connections_reveal_one');
      });
    }

    const revealAllBtn = container.querySelector('[data-conn-reveal-all]');
    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', async () => {
        state.selectedConnectionIds = [];
        sfx.beep(330, 0.12);
        await apiAction('connections_reveal_all');
      });
    }

    container.querySelectorAll('[data-conn-next]').forEach((nextBtn) => {
      nextBtn.addEventListener('click', async () => {
        state.selectedConnectionIds = [];
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    });
  }

  if (mode === 'who_are_ya_wordle') {
    const hintBtn = container.querySelector('[data-wordle-hint]');
    if (hintBtn) {
      hintBtn.addEventListener('click', async () => {
        sfx.beep(520, 0.08);
        await apiAction('wordle_hint_unblur');
      });
    }

    const revealBtn = container.querySelector('[data-wordle-reveal]');
    if (revealBtn) {
      revealBtn.addEventListener('click', async () => {
        sfx.beep(340, 0.1);
        await apiAction('wordle_reveal_answer');
      });
    }

    container.querySelectorAll('[data-wordle-next]').forEach((nextBtn) => {
      nextBtn.addEventListener('click', async () => {
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    });
  }

  if (mode === 'chain_link') {
    const hintBtn = container.querySelector('[data-chain-hint]');
    if (hintBtn) {
      hintBtn.addEventListener('click', async () => {
        sfx.beep(520, 0.08);
        await apiAction('chain_hint');
      });
    }

    const autoBtn = container.querySelector('[data-chain-auto]');
    if (autoBtn) {
      autoBtn.addEventListener('click', async () => {
        sfx.beep(440, 0.09);
        await apiAction('chain_auto_step');
      });
    }

    const resetBtn = container.querySelector('[data-chain-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        sfx.lockIn();
        await apiAction('start_mode_round');
      });
    }
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
    if (mode === 'club_battle') {
      document.getElementById('playingClubSub').innerHTML = `ตอบถูก = <strong>+1 แต้ม</strong> • ⚡ตอบไวสุดในรอบ = <strong>+1 โบนัส</strong> • 🔥คอมโบทุก 3 รอบติด = <strong>+1 โบนัส</strong> • รอบย่อยที่ <span id="playingWaveNum">${room.waveNumber}</span>`;
    } else {
      const x2Count = room.twoClubOverlapCount || 0;
      const x3Count = room.threeClubOverlapCount || 0;
      const overlapBadge = ` • 🔥 มีนักเตะคูณ <strong>x2 (${x2Count} คน)</strong> / <strong>x3 (${x3Count} คน)</strong>`;
      document.getElementById('playingClubSub').innerHTML = `ตรง 1 สโมสร = 1 แต้ม, ตรง 2 สโมสร = 2 แต้ม, ตรง 3 สโมสร = 3 แต้ม!${overlapBadge} • รอบย่อยที่ <span id="playingWaveNum">${room.waveNumber}</span>`;
    }
  } else if (mode === 'lineup_quiz') {
    banner.style.background = `linear-gradient(135deg, ${room.modeData?.clubColor || '#059669'}, #0f172a)`;
    document.getElementById('playingClubName').textContent = room.modeData?.title || 'Guess the Lineup';
    document.getElementById('playingClubSub').textContent = `${room.modeData?.subtitle || ''} • ไม่จำกัดเวลา พิมพ์ทาย 11 ตัวจริงได้ต่อเนื่อง!`;
  } else if (mode === 'top10_stats') {
    banner.style.background = `linear-gradient(135deg, #2563eb, #0f172a)`;
    document.getElementById('playingClubName').textContent = room.modeData?.title || 'Top 10 Stats';
    document.getElementById('playingClubSub').textContent = `${room.modeData?.category || ''} • ไม่จำกัดเวลา ตอบได้ทุกข้อ!`;
  } else if (mode === 'career_path') {
    banner.style.background = `linear-gradient(135deg, #7c3aed, #0f172a)`;
    document.getElementById('playingClubName').textContent = 'นักเตะปริศนาคนนี้คือใคร? (Who Are Ya?)';
    document.getElementById('playingClubSub').textContent = `ดูประวัติสโมสรที่เคยค้าแข้งด้านล่างแล้วพิมพ์ชื่อนักเตะ! (กดเปิดคำใบ้ได้หากนึกไม่ออก)`;
  } else if (mode === 'trivia_quiz') {
    banner.style.background = `linear-gradient(135deg, #d97706, #0f172a)`;
    document.getElementById('playingClubName').textContent = `คำถามแฟนพันธุ์แท้ลูกหนัง ข้อที่ ${room.roundNumber}`;
    document.getElementById('playingClubSub').textContent = `กดเลือกคำตอบที่ถูกต้องให้ไวที่สุด!`;
  } else if (mode === 'footy_grid') {
    const turnName = room.modeData?.currentTurnPlayerName || 'ผู้เล่น 1';
    const turnAvatar = room.modeData?.currentTurnPlayerAvatar || '⚽';
    const isMulti = (room.modeData?.turnOrder || []).length > 1;
    banner.style.background = `linear-gradient(135deg, #0d9488, #0f172a)`;
    document.getElementById('playingClubName').textContent = isMulti
      ? `${room.modeData?.title || 'Footy Tic-Tac-Toe 3x3'} • ตาของ ${turnAvatar} ${turnName}`
      : room.modeData?.title || 'Footy Tic-Tac-Toe 3x3';
    document.getElementById('playingClubSub').innerHTML = `คลิกเลือกช่องในตาราง แล้วพิมพ์ชื่อนักเตะเพื่อยึดช่อง! • 🏆 เรียงครบ 3 ช่องรับโบนัส <strong>BINGO +3 แต้ม</strong> (ห้ามใช้ชื่อซ้ำในตารางเดียวกัน)`;
  } else if (mode === 'connections') {
    banner.style.background = `linear-gradient(135deg, #8b5cf6, #0f172a)`;
    document.getElementById('playingClubName').textContent = room.modeData?.title || `Football Connections ชุดที่ #${room.roundNumber}`;
    document.getElementById('playingClubSub').innerHTML = `คลิกเลือกนักเตะทีละ <strong>4 คน</strong> ที่มีความลับร่วมกัน (🟢+1 / 🟡+2 / 🔵+3 / 🟣+4 แต้ม • หากตรง 3/4 ระบบจะเตือนว่า "เฉียดมาก!")`;
  } else if (mode === 'who_are_ya_wordle') {
    banner.style.background = `linear-gradient(135deg, #ec4899, #0f172a)`;
    document.getElementById('playingClubName').textContent = `Who Are Ya? Wordle ข้อที่ #${room.roundNumber}`;
    document.getElementById('playingClubSub').innerHTML = `พิมพ์ชื่อนักเตะเพื่อเทียบ <strong>สัญชาติ / ลีก / สโมสร / ตำแหน่ง</strong> (🟢ตรงเป๊ะ / 🟡เคยอยู่ร่วมทีมหรือลีกร่วม / ⚪ไม่ตรง) ยิ่งทายตอนภาพเบลอยิ่งได้แต้มเยอะ (+4 ถึง +1)!`;
  } else if (mode === 'chain_link') {
    const turnName = room.modeData?.currentTurnPlayerName || 'ผู้เล่น 1';
    const turnAvatar = room.modeData?.currentTurnPlayerAvatar || '⚽';
    banner.style.background = `linear-gradient(135deg, #06b6d4, #0f172a)`;
    document.getElementById('playingClubName').textContent = `Chain Link ต่อโซ่เพื่อนร่วมทีม • ตาของ ${turnAvatar} ${turnName}`;
    document.getElementById('playingClubSub').innerHTML = `ผลัดกันตอบทีละคน! ต่อโซ่สำเร็จรับ <strong>+2 แต้ม</strong> (โบนัสทุก 5 ลิงก์) • หากหมดเวลาโซ่ขาด คนส่งไม้ต่อก่อนหน้ารับโบนัส <strong>+1 แต้ม</strong>!`;
    if (room.modeData?.currentTurnPlayerId === state.playerId) {
      document.getElementById('answerPromptLabel').textContent = `🟢 ถึงตาของคุณแล้ว! พิมพ์ชื่อเพื่อนร่วมทีมต่อจาก "${room.modeData?.currentAnchor?.playerName || ''}" ก่อนหมดเวลา:`;
    }
  }

  const playingTargetBanner = document.getElementById('playingTargetReachedBanner');
  if (playingTargetBanner) {
    playingTargetBanner.classList.toggle('hidden', !room.hasReachedTarget);
  }

  updateTimerOnly();

  const stageEl = document.getElementById('modeDynamicStage');
  stageEl.innerHTML = buildModeStageHTML(room, false);
  bindDynamicStageEvents(stageEl, room);

  const me = room.players.find((p) => p.id === state.playerId);
  const hasSubmitted = !isUntimedContinuousMode(mode) && me && me.hasSubmitted;
  const isWaitingForOtherTurnInChain =
    mode === 'chain_link' &&
    room.modeData?.currentTurnPlayerId &&
    room.modeData.currentTurnPlayerId !== state.playerId;
  const isWaitingForOtherTurnInGrid =
    mode === 'footy_grid' &&
    (room.modeData?.turnOrder || []).length > 1 &&
    (room.modeData?.cells || []).some((c) => !c) &&
    room.modeData?.currentTurnPlayerId &&
    room.modeData.currentTurnPlayerId !== state.playerId;

  const inputZone = document.getElementById('answerInputZone');
  const lockedZone = document.getElementById('answerLockedZone');
  const guessInput = document.getElementById('playerGuessInput');

  if (isWaitingForOtherTurnInChain) {
    inputZone.classList.add('hidden');
    stageEl.classList.remove('hidden');
    lockedZone.classList.remove('hidden');
    document.getElementById('lockedAnswerText').textContent = `⏳ ตอนนี้เป็นตาของ ${room.modeData.currentTurnPlayerAvatar || '⚽'} ${room.modeData.currentTurnPlayerName} กำลังคิดต่อโซ่... (คิวถัดไป: ${room.modeData.nextTurnPlayerAvatar || '⚽'} ${room.modeData.nextTurnPlayerName || ''})`;
  } else if (isWaitingForOtherTurnInGrid) {
    inputZone.classList.add('hidden');
    stageEl.classList.remove('hidden');
    lockedZone.classList.remove('hidden');
    document.getElementById('lockedAnswerText').textContent = `⏳ ตอนนี้เป็นตาของ ${room.modeData.currentTurnPlayerAvatar || '⚽'} ${room.modeData.currentTurnPlayerName} กำลังเลือกช่องวาง XO...`;
  } else if (hasSubmitted) {
    inputZone.classList.add('hidden');
    stageEl.classList.toggle('hidden', mode === 'trivia_quiz');
    lockedZone.classList.remove('hidden');
  } else {
    lockedZone.classList.add('hidden');
    stageEl.classList.remove('hidden');
    if (mode === 'trivia_quiz' || mode === 'connections') {
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

function updateAutocomplete(query) {
  const dropdown = document.getElementById('playerAutocompleteList');
  const norm = normalizeText(query);

  if (!norm || norm.length < 1) {
    hideAutocomplete();
    return;
  }

  // If database has not loaded yet, trigger load immediately & show status row
  if (!state.players || state.players.length === 0) {
    loadDatabase();
    dropdown.innerHTML = `
      <div class="autocomplete-item" style="pointer-events:none;opacity:0.85;">
        <div class="ac-left">
          <span>⏳ กำลังโหลดฐานข้อมูลนักเตะ... กรุณารอสักครู่</span>
        </div>
      </div>
    `;
    dropdown.classList.remove('hidden');
    return;
  }

  const usedIds = new Set((state.room?.usedPlayers || []).map((u) => u.id));
  const usedNames = new Set();
  const curMode = state.room?.settings?.gameMode;
  const md = state.room?.modeData;
  if (curMode === 'footy_grid' && md && Array.isArray(md.cells)) {
    md.cells.forEach((c) => {
      if (c && c.playerName) usedNames.add(normalizeText(c.playerName));
    });
  } else if (curMode === 'who_are_ya_wordle' && md && Array.isArray(md.guesses)) {
    md.guesses.forEach((g) => {
      if (g && g.playerId) usedIds.add(g.playerId);
    });
  } else if (curMode === 'chain_link' && md && Array.isArray(md.history)) {
    md.history.forEach((h) => {
      if (h && h.playerId) usedIds.add(h.playerId);
    });
  }

  const matches = [];
  const playersList = state.players;
  for (let i = 0; i < playersList.length; i++) {
    const p = playersList[i];
    // Fast-path filter using pre-indexed searchBlob (0ms per keystroke!)
    if (p._searchBlob && !p._searchBlob.includes(norm)) continue;

    const pNameNorm = p._normName || normalizeText(p.name);
    const nameParts = p._nameParts || pNameNorm.split(/\s+/);
    const normAliases = p._normAliases || (p.aliases || []).map((a) => normalizeText(a));

    const exactMatch =
      pNameNorm === norm ||
      nameParts.some((part) => part === norm) ||
      normAliases.some((a) => a === norm);
    const startsWith = pNameNorm.startsWith(norm) || nameParts.some((part) => part.startsWith(norm));
    const aliasMatch = normAliases.some((a) => a.includes(norm));
    const includesMatch = pNameNorm.includes(norm);

    if (exactMatch || startsWith || aliasMatch || includesMatch) {
      matches.push({
        player: p,
        alreadyUsed: usedIds.has(p.id) || usedNames.has(pNameNorm),
        clubCount: p._clubCount !== undefined ? p._clubCount : Array.isArray(p.clubs) ? p.clubs.length : 0,
        priority: exactMatch ? 0 : startsWith ? 1 : aliasMatch ? 2 : 3
      });
    }
  }

  // Sort by match priority first, then by number of major clubs (most famous multi-club stars on top!), then alphabetically
  matches.sort(
    (a, b) =>
      a.priority - b.priority ||
      b.clubCount - a.clubCount ||
      a.player.name.localeCompare(b.player.name)
  );
  const topMatches = matches.slice(0, 8);

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

    const chainClubsBadge =
      curMode === 'chain_link' && !m.alreadyUsed && Array.isArray(p.clubs)
        ? p.clubs.length >= 2
          ? `<span class="ac-pos" style="background:rgba(6,182,212,0.2);color:#67e8f9;margin-right:4px;">🔗 ${p.clubs.length} สโมสร</span>`
          : `<span class="ac-pos" style="background:rgba(245,158,11,0.2);color:#fde68a;margin-right:4px;">1 สโมสร</span>`
        : '';

    row.innerHTML = `
      <div class="ac-left">
        ${renderPlayerPhotoHTML(p.photoUrl, '⚽', 'player-photo-avatar')}
        ${renderFlagHTML(p.flag, p.flagUrl)}
        <span class="ac-name">${p.name}</span>
      </div>
      <div>
        ${chainClubsBadge}${m.alreadyUsed ? '<span class="ac-pos" style="background:#ef4444;color:#fff;">ถูกใช้แล้ว</span>' : `<span class="ac-pos">${p.position}</span>`}
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
  if (isUntimedContinuousMode(mode) || mode === 'career_path') {
    input.value = '';
    state.selectedAutocompletePlayerId = null;
    setTimeout(() => input.focus(), 40);
  }

  const res = await apiAction('submit_answer', {
    playerInput: submittedText,
    selectedPlayerId: chosenId,
    cellIndex: state.selectedGridCellIndex
  });

  if ((isUntimedContinuousMode(mode) || mode === 'career_path') && res) {
    const fb = res.top10Feedback || res.lineupFeedback || res.gridFeedback;
    if (fb) {
      if (fb.correct) {
        sfx.success();
      } else {
        sfx.beep(220, 0.14, 'sawtooth', 0.08);
      }
      showToast(fb.message);
    }
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
  const celebratePlayingBtn = document.getElementById('celebrateChampionPlayingBtn');
  if (celebratePlayingBtn) {
    celebratePlayingBtn.addEventListener('click', triggerEndMatch);
  }

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
  guessInput.addEventListener('focus', () => {
    if (!state.players || state.players.length === 0) {
      loadDatabase();
    } else if (guessInput.value.trim().length > 0) {
      updateAutocomplete(guessInput.value);
    }
  });

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
