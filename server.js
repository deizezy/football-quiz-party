const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { LEAGUES, CLUBS, PLAYERS } = require('./data/footballData');
const {
  LINEUPS,
  TOP10_LISTS,
  CAREER_PATHS,
  TRIVIA_QUESTIONS,
  FOOTY_GRIDS
} = require('./data/quizModesData');
const {
  searchPlayersFromApi,
  enrichPlayerClubHistory,
  initializeFootballApiData,
  getFlagUrlFromEmoji,
  getPlayerPhotoByName,
  mapApiTeamNameToClubId
} = require('./services/footballApi');

const PORT = process.env.PORT || 3000;

const rooms = new Map();
const roomStreams = new Map();

const AVATARS = ['⚽', '🦁', '🔥', '⚡', '👑', '🦊', '🐯', '🦅', '🐉', '🌟', '🎯', '🛡️'];
const BOT_NAMES = ['โค้ชเป๊ป (Bot)', 'ป๋าเฟอร์กี้ (Bot)', 'คล็อปป์ (Bot)', 'มูรินโญ่ (Bot)', 'อันเช่ (Bot)'];

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
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

function createInitialStats() {
  return {
    correctCount: 0,
    wrongCount: 0,
    bestStreak: 0,
    fastestTimeMs: null,
    totalCorrectTimeMs: 0,
    namedPlayers: []
  };
}

function matchesNameOrAlias(input, targetName, aliases = []) {
  const norm = normalizeText(input);
  if (!norm || norm.length < 2) return false;
  const targetNorm = normalizeText(targetName);
  if (targetNorm === norm) return true;
  if (aliases && aliases.some((a) => normalizeText(a) === norm)) return true;

  const parts = targetNorm.split(/\s+/);
  if (parts[parts.length - 1] === norm && norm.length >= 3) return true;

  if (norm.length >= 4) {
    if (targetNorm.includes(norm)) return true;
    if (aliases && aliases.some((a) => normalizeText(a).includes(norm))) return true;
  }
  return false;
}

function findPlayerByInput(input, playerId) {
  if (playerId) {
    const byId = PLAYERS.find((p) => p.id === playerId);
    if (byId) return byId;
  }
  const norm = normalizeText(input);
  if (!norm) return null;

  let match = PLAYERS.find(
    (p) =>
      normalizeText(p.name) === norm ||
      (p.aliases && p.aliases.some((a) => normalizeText(a) === norm))
  );
  if (match) return match;

  match = PLAYERS.find((p) => {
    const parts = normalizeText(p.name).split(/\s+/);
    return parts[parts.length - 1] === norm && norm.length >= 3;
  });
  if (match) return match;

  if (norm.length >= 4) {
    match = PLAYERS.find(
      (p) =>
        normalizeText(p.name).includes(norm) ||
        (p.aliases && p.aliases.some((a) => normalizeText(a).includes(norm)))
    );
  }
  return match || null;
}

function findClubByInput(input, clubId) {
  if (clubId) {
    const byId = CLUBS.find((c) => c.id === clubId);
    if (byId) return byId;
  }
  const norm = normalizeText(input);
  if (!norm) return null;

  return (
    CLUBS.find(
      (c) =>
        normalizeText(c.name) === norm ||
        normalizeText(c.nameTh) === norm ||
        normalizeText(c.short) === norm ||
        (c.aliases && c.aliases.some((a) => normalizeText(a).includes(norm))
        )
    ) ||
    CLUBS.find(
      (c) =>
        normalizeText(c.name).includes(norm) ||
        normalizeText(c.nameTh).includes(norm) ||
        (c.aliases && c.aliases.some((a) => normalizeText(a).includes(norm)))
    ) ||
    null
  );
}

function playerMatchesGridCriteria(player, criteria) {
  if (!player || !criteria) return false;
  if (criteria.type === 'club') {
    return player.clubs.includes(criteria.id);
  }
  if (criteria.type === 'flag') {
    return player.flag === criteria.id;
  }
  return false;
}

function checkGridBingo(cells, playerId) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  return lines.some((line) => line.every((idx) => cells[idx] && cells[idx].ownerId === playerId));
}

function computeMatchSummary(room) {
  const sorted = [...room.players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const bCorrect = b.stats?.correctCount || 0;
    const aCorrect = a.stats?.correctCount || 0;
    if (bCorrect !== aCorrect) return bCorrect - aCorrect;
    return (a.stats?.fastestTimeMs || 99999) - (b.stats?.fastestTimeMs || 99999);
  });

  let fastestPlayer = null;
  let bestStreakPlayer = null;
  let mostCorrectPlayer = null;

  sorted.forEach((p) => {
    const st = p.stats || createInitialStats();
    if (st.fastestTimeMs !== null) {
      if (!fastestPlayer || st.fastestTimeMs < fastestPlayer.stats.fastestTimeMs) {
        fastestPlayer = p;
      }
    }
    if (st.bestStreak > 0) {
      if (!bestStreakPlayer || st.bestStreak > bestStreakPlayer.stats.bestStreak) {
        bestStreakPlayer = p;
      }
    }
    if (st.correctCount > 0) {
      if (!mostCorrectPlayer || st.correctCount > mostCorrectPlayer.stats.correctCount) {
        mostCorrectPlayer = p;
      }
    }
  });

  const awards = [];
  if (fastestPlayer) {
    awards.push({
      id: 'speed_demon',
      icon: '⚡',
      title: 'เสือปืนไว (Speed Demon)',
      playerName: fastestPlayer.name,
      playerAvatar: fastestPlayer.avatar,
      detail: `ตอบถูกเร็วที่สุดในแมตช์ (${(fastestPlayer.stats.fastestTimeMs / 1000).toFixed(2)} วินาที)`
    });
  }
  if (bestStreakPlayer) {
    awards.push({
      id: 'unstoppable_streak',
      icon: '🔥',
      title: 'เครื่องจักรทำแต้ม (Hot Streak)',
      playerName: bestStreakPlayer.name,
      playerAvatar: bestStreakPlayer.avatar,
      detail: `ตอบถูกติดต่อกันสูงสุด ${bestStreakPlayer.stats.bestStreak} รอบติด`
    });
  }
  if (mostCorrectPlayer) {
    awards.push({
      id: 'football_professor',
      icon: '🧠',
      title: 'สารานุกรมลูกหนัง (Top Answerer)',
      playerName: mostCorrectPlayer.name,
      playerAvatar: mostCorrectPlayer.avatar,
      detail: `ตอบคำถามลูกหนังถูกต้องรวม ${mostCorrectPlayer.stats.correctCount} ครั้ง`
    });
  }

  return {
    podium: sorted.slice(0, 3).map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      correctCount: p.stats?.correctCount || 0,
      bestStreak: p.stats?.bestStreak || 0,
      fastestTimeMs: p.stats?.fastestTimeMs || null
    })),
    standings: sorted.map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      correctCount: p.stats?.correctCount || 0,
      wrongCount: p.stats?.wrongCount || 0,
      bestStreak: p.stats?.bestStreak || 0,
      fastestTimeMs: p.stats?.fastestTimeMs || null,
      avgTimeMs:
        p.stats?.correctCount > 0
          ? Math.round(p.stats.totalCorrectTimeMs / p.stats.correctCount)
          : null
    })),
    awards,
    totalRoundsPlayed: room.roundNumber,
    totalWavesPlayed: room.totalWavesPlayed || 0
  };
}

function serializeModeDataForClients(room) {
  const mode = room.settings.gameMode || 'club_battle';

  if (mode === 'lineup_quiz') {
    const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
    const unlockedMap = room.unlockedLineupSlots || {};
    return {
      lineupId: lineup.id,
      title: lineup.title,
      subtitle: lineup.subtitle,
      formation: lineup.formation,
      clubColor: lineup.clubColor,
      availableLineups: LINEUPS.map((l) => ({ id: l.id, title: l.title, subtitle: l.subtitle })),
      slots: lineup.slots.map((s) => {
        const u = unlockedMap[s.slotId];
        return {
          slotId: s.slotId,
          pos: s.pos,
          number: s.number,
          flag: s.flag,
          flagUrl: getFlagUrlFromEmoji(s.flag),
          row: s.row,
          col: s.col,
          unlocked: !!u,
          playerName: u ? s.playerId : null,
          photoUrl: u ? u.photoUrl || null : null,
          answeredBy: u ? u.answeredBy : null
        };
      })
    };
  }

  if (mode === 'top10_stats') {
    const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
    const unlockedRanks = room.unlockedTop10Ranks || {};
    const hintedRanks = room.hintedTop10Ranks || {};

    return {
      listId: list.id,
      title: list.title,
      category: list.category,
      availableLists: TOP10_LISTS.map((l) => ({ id: l.id, title: l.title, category: l.category })),
      items: list.items.map((it) => {
        const u = unlockedRanks[it.rank];
        const isHinted = !!hintedRanks[it.rank];
        const cleanStat = it.rawStat || (it.stat || '').replace(/\s*\([^)]*\)/g, '').trim();
        const parenMatch = (it.stat || '').match(/\(([^)]+)\)/);
        const clubHint = it.teamName || (parenMatch ? parenMatch[1] : '');
        const words = (it.name || '').trim().split(/\s+/);
        const initialsHint = words
          .map((w) => w.charAt(0).toUpperCase() + '_'.repeat(Math.max(2, w.length - 1)))
          .join(' ');
        const hintText = clubHint
          ? `${clubHint} • ชื่อ: ${initialsHint}`
          : `ชื่อ: ${initialsHint} (${words.length} พยางค์)`;

        return {
          rank: it.rank,
          flag: u || isHinted ? it.flag : '❓',
          flagUrl: u || isHinted ? it.flagUrl || getFlagUrlFromEmoji(it.flag) : null,
          stat: u || isHinted ? it.stat : cleanStat,
          points: 1,
          unlocked: !!u,
          revealed: u ? !!u.revealed : false,
          hinted: isHinted,
          hintText: isHinted ? hintText : null,
          name: u ? it.name : null,
          photoUrl: u ? u.photoUrl || null : null,
          answeredBy: u ? u.answeredBy : null
        };
      })
    };
  }

  if (mode === 'career_path') {
    const cp = CAREER_PATHS.find((c) => c.id === room.currentCareerId) || CAREER_PATHS[0];
    const isRevealed = room.state === 'REVEAL';
    const matchedAnsPlayer = PLAYERS.find((p) => normalizeText(p.name) === normalizeText(cp.answerName));
    return {
      careerId: cp.id,
      flag: cp.flag,
      flagUrl: getFlagUrlFromEmoji(cp.flag),
      position: cp.position,
      hint: cp.hint,
      steps: cp.steps.map((st) => {
        const cid = mapApiTeamNameToClubId(st.club);
        const clubObj = cid ? CLUBS.find((c) => c.id === cid) : null;
        return {
          ...st,
          clubBadgeUrl: st.clubBadgeUrl || clubObj?.badgeUrl || null
        };
      }),
      answerName: isRevealed ? cp.answerName : null,
      photoUrl: isRevealed ? matchedAnsPlayer?.photoUrl || room.currentCareerPhotoUrl || null : null
    };
  }

  if (mode === 'trivia_quiz') {
    const tr = TRIVIA_QUESTIONS.find((q) => q.id === room.currentTriviaId) || TRIVIA_QUESTIONS[0];
    const isRevealed = room.state === 'REVEAL';
    return {
      triviaId: tr.id,
      difficulty: tr.difficulty || 'medium',
      selectedDifficulty: room.settings.triviaDifficulty || 'all',
      question: tr.question,
      options: tr.options,
      correctIndex: isRevealed ? tr.correctIndex : null,
      explanation: isRevealed ? tr.explanation : null
    };
  }

  if (mode === 'footy_grid') {
    const grid = FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
    const enrichHeader = (hdr) => {
      const targetVal = hdr.id || hdr.value;
      if (hdr.type === 'club') {
        const clubObj = CLUBS.find((c) => c.id === targetVal);
        return { ...hdr, badgeUrl: clubObj?.badgeUrl || null };
      }
      if (hdr.type === 'flag') {
        return { ...hdr, flagUrl: getFlagUrlFromEmoji(targetVal) };
      }
      return hdr;
    };
    return {
      gridId: grid.id,
      title: grid.title,
      cols: grid.cols.map(enrichHeader),
      rows: grid.rows.map(enrichHeader),
      availableGrids: FOOTY_GRIDS.map((g) => ({ id: g.id, title: g.title })),
      cells: room.gridCells || Array(9).fill(null)
    };
  }

  return null;
}

function getTargetClubPoolSize(room) {
  const isSingleClubMode = room.settings.gameMode === 'club_battle';
  if (isSingleClubMode) return 1;
  if (room.settings.clubPoolSizeRule === 'fixed_3') return 3;
  return Math.max(room.players.length, 3);
}

function serializeRoomForClients(room) {
  const pickedClubs = (room.pickedClubs || []).map((pc) => {
    const clubObj = CLUBS.find((c) => c.id === pc.clubId);
    return {
      ...pc,
      club: clubObj || null
    };
  });

  const activeClubIds = pickedClubs.map((pc) => pc.clubId);
  const totalPossibleForClub =
    activeClubIds.length > 0
      ? PLAYERS.filter((p) => p.clubs.some((cid) => activeClubIds.includes(cid))).length
      : 0;

  const targetScore = room.settings.targetScore || 0;
  const hasReachedTarget =
    targetScore > 0 && room.players.some((p) => p.score >= targetScore);

  const isSingleClubMode = room.settings.gameMode === 'club_battle';
  const maxClubsPerPlayer = isSingleClubMode ? 1 : room.players.length === 1 ? 3 : 1;
  const targetClubPoolSize = getTargetClubPoolSize(room);

  return {
    code: room.code,
    hostId: room.hostId,
    selectorId: room.selectorId,
    state: room.state,
    settings: room.settings,
    roundNumber: room.roundNumber,
    waveNumber: room.waveNumber,
    totalWavesPlayed: room.totalWavesPlayed || 0,
    pickedClubs,
    maxClubsPerPlayer,
    targetClubPoolSize,
    currentClub: pickedClubs[0]?.club || null,
    totalPossibleForClub,
    modeData: serializeModeDataForClients(room),
    timeLeft: room.timeLeft,
    totalTime: room.settings.timeLimit,
    usedPlayers: room.usedPlayers,
    lastWaveResults: room.lastWaveResults || [],
    hasReachedTarget,
    matchSummary: room.state === 'GAME_OVER' ? computeMatchSummary(room) : null,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      streak: p.streak,
      stats: p.stats || createInitialStats(),
      isBot: !!p.isBot,
      connected: p.connected !== false,
      pickedClubCount: (room.pickedClubs || []).filter((pc) => pc.playerId === p.id).length,
      hasSubmitted: !!room.submissions[p.id],
      submittedTimeMs: room.submissions[p.id] ? room.submissions[p.id].timeTakenMs : null
    }))
  };
}

function broadcastRoom(roomCode, eventType = 'room_state', extra = {}) {
  const room = rooms.get(roomCode);
  const streams = roomStreams.get(roomCode);
  if (!room || !streams) return;

  const payload = JSON.stringify({
    type: eventType,
    room: serializeRoomForClients(room),
    ...extra
  });

  for (const [playerId, res] of streams.entries()) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      streams.delete(playerId);
    }
  }
}

function clearRoomTimers(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
  if (room.botTimeouts) {
    room.botTimeouts.forEach((t) => clearTimeout(t));
    room.botTimeouts = [];
  }
}

// Schedule Bots to pick a unique club during SELECTING_CLUB phase
function scheduleBotClubPicks(room) {
  if (!room.botTimeouts) room.botTimeouts = [];
  room.players
    .filter((p) => p.isBot)
    .forEach((bot, idx) => {
      const delayMs = 1200 + idx * 900 + Math.floor(Math.random() * 900);
      const t = setTimeout(() => {
        if (room.state !== 'SELECTING_CLUB') return;
        const targetPoolSize = getTargetClubPoolSize(room);
        if ((room.pickedClubs || []).length >= targetPoolSize) return;
        const alreadyPicked = (room.pickedClubs || []).some((pc) => pc.playerId === bot.id);
        if (alreadyPicked) return;

        const usedClubIds = new Set((room.pickedClubs || []).map((pc) => pc.clubId));
        const available = CLUBS.filter((c) => !usedClubIds.has(c.id));
        if (available.length === 0) return;

        const chosenClub = available[Math.floor(Math.random() * available.length)];
        room.pickedClubs.push({
          playerId: bot.id,
          playerName: bot.name,
          playerAvatar: bot.avatar,
          clubId: chosenClub.id
        });

        broadcastRoom(room.code, 'club_picked');
        checkAllClubsPicked(room);
      }, delayMs);
      room.botTimeouts.push(t);
    });
}

function fillRemainingBonusClubs(room, minClubs = 3) {
  const isSingleClubMode = room.settings.gameMode === 'club_battle';
  if (isSingleClubMode) return;
  if (!room.pickedClubs) room.pickedClubs = [];
  const usedClubIds = new Set(room.pickedClubs.map((pc) => pc.clubId));
  const primaryPool = CLUBS.slice(0, 32).filter((c) => !usedClubIds.has(c.id));
  const fallbackPool = CLUBS.filter((c) => !usedClubIds.has(c.id));
  const pool = primaryPool.length >= minClubs ? primaryPool : fallbackPool;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  let idx = 0;
  while (room.pickedClubs.length < minClubs && idx < shuffled.length) {
    const bonusClub = shuffled[idx++];
    if (!usedClubIds.has(bonusClub.id)) {
      usedClubIds.add(bonusClub.id);
      room.pickedClubs.push({
        playerId: 'bonus_club_' + room.pickedClubs.length,
        playerName: 'สโมสรโบนัสกลางกระดาน',
        playerAvatar: '🎲',
        clubId: bonusClub.id
      });
    }
  }
}

function checkAllClubsPicked(room) {
  if (room.state !== 'SELECTING_CLUB') return;
  const isSingleClubMode = room.settings.gameMode === 'club_battle';
  const targetPoolSize = getTargetClubPoolSize(room);
  const requiredPlayerPicks = isSingleClubMode
    ? 1
    : room.players.length === 1
      ? 3
      : Math.min(room.players.length, targetPoolSize);
  if ((room.pickedClubs || []).length >= requiredPlayerPicks) {
    if (!isSingleClubMode && room.pickedClubs.length < 3) {
      fillRemainingBonusClubs(room, 3);
      broadcastRoom(room.code, 'club_picked');
    }
    setTimeout(() => {
      if (room.state === 'SELECTING_CLUB' && (room.pickedClubs || []).length > 0) {
        room.roundNumber += 1;
        room.waveNumber = 1;
        room.usedPlayers = [];
        startWave(room);
      }
    }, 550);
  }
}

function scheduleBotActions(room) {
  room.botTimeouts = [];
  const mode = room.settings.gameMode || 'multi_club_pool';

  room.players
    .filter((p) => p.isBot)
    .forEach((bot) => {
      const minMs = 2300;
      const maxMs = Math.max(3600, Math.min(room.settings.timeLimit * 1000 * 0.78, 11000));
      const delayMs = Math.floor(minMs + Math.random() * (maxMs - minMs));

      const timeout = setTimeout(() => {
        if (room.state !== 'PLAYING' || room.submissions[bot.id]) return;

        if (mode === 'club_battle' || mode === 'multi_club_pool') {
          const activeClubIds = (room.pickedClubs || []).map((pc) => pc.clubId);
          // Prefer players who match 2+ clubs if possible, or at least 1 club!
          const unusedPlayers = PLAYERS.filter(
            (p) => !room.usedPlayers.some((u) => u.id === p.id)
          );
          const multiClubMatches = unusedPlayers.filter(
            (p) => p.clubs.filter((cid) => activeClubIds.includes(cid)).length >= 2
          );
          const singleClubMatches = unusedPlayers.filter(
            (p) => p.clubs.filter((cid) => activeClubIds.includes(cid)).length >= 1
          );
          const wrongPlayers = unusedPlayers.filter(
            (p) => !p.clubs.some((cid) => activeClubIds.includes(cid))
          );

          let chosen = null;
          if (multiClubMatches.length > 0 && Math.random() < 0.45) {
            chosen = multiClubMatches[Math.floor(Math.random() * multiClubMatches.length)];
          } else if (singleClubMatches.length > 0 && Math.random() < 0.82) {
            chosen = singleClubMatches[Math.floor(Math.random() * singleClubMatches.length)];
          } else if (wrongPlayers.length > 0) {
            chosen = wrongPlayers[Math.floor(Math.random() * wrongPlayers.length)];
          }
          if (chosen) handlePlayerSubmission(room, bot.id, chosen.name, chosen.id);
        } else if (mode === 'lineup_quiz') {
          const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
          const unlocked = room.unlockedLineupSlots || {};
          const openSlots = lineup.slots.filter((s) => !unlocked[s.slotId]);
          if (openSlots.length > 0 && Math.random() < 0.78) {
            const pick = openSlots[Math.floor(Math.random() * openSlots.length)];
            handlePlayerSubmission(room, bot.id, pick.playerId, null);
          } else {
            const rand = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
            handlePlayerSubmission(room, bot.id, rand.name, rand.id);
          }
        } else if (mode === 'top10_stats') {
          const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
          const unlocked = room.unlockedTop10Ranks || {};
          const openItems = list.items.filter((it) => !unlocked[it.rank]);
          if (openItems.length > 0 && Math.random() < 0.78) {
            const pick = openItems[Math.floor(Math.random() * openItems.length)];
            handlePlayerSubmission(room, bot.id, pick.name, null);
          } else {
            const rand = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
            handlePlayerSubmission(room, bot.id, rand.name, rand.id);
          }
        } else if (mode === 'career_path') {
          const cp = CAREER_PATHS.find((c) => c.id === room.currentCareerId) || CAREER_PATHS[0];
          if (Math.random() < 0.72) {
            handlePlayerSubmission(room, bot.id, cp.answerName, null);
          } else {
            const rand = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
            handlePlayerSubmission(room, bot.id, rand.name, rand.id);
          }
        } else if (mode === 'trivia_quiz') {
          const tr = TRIVIA_QUESTIONS.find((q) => q.id === room.currentTriviaId) || TRIVIA_QUESTIONS[0];
          const choiceIdx =
            Math.random() < 0.72 ? tr.correctIndex : Math.floor(Math.random() * tr.options.length);
          handlePlayerSubmission(room, bot.id, String(choiceIdx), null, { choiceIndex: choiceIdx });
        } else if (mode === 'footy_grid') {
          const grid = FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
          const cells = room.gridCells || Array(9).fill(null);
          const openIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !cells[i]);
          if (openIndices.length > 0) {
            const cellIdx = openIndices[Math.floor(Math.random() * openIndices.length)];
            const rIdx = Math.floor(cellIdx / 3);
            const cIdx = cellIdx % 3;
            const valid = PLAYERS.filter(
              (p) =>
                playerMatchesGridCriteria(p, grid.rows[rIdx]) &&
                playerMatchesGridCriteria(p, grid.cols[cIdx])
            );
            const pick =
              valid.length > 0 && Math.random() < 0.8
                ? valid[Math.floor(Math.random() * valid.length)]
                : PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
            handlePlayerSubmission(room, bot.id, pick.name, pick.id, { cellIndex: cellIdx });
          }
        }
      }, delayMs);

      room.botTimeouts.push(timeout);
    });
}

function startWave(room) {
  clearRoomTimers(room);
  room.state = 'PLAYING';
  room.submissions = {};
  room.lastWaveResults = [];
  room.waveStartTime = Date.now();
  const mode = room.settings.gameMode || 'multi_club_pool';
  const isUntimedMode = mode === 'top10_stats';
  room.timeLeft = isUntimedMode ? 0 : room.settings.timeLimit;
  room.totalWavesPlayed = (room.totalWavesPlayed || 0) + 1;

  broadcastRoom(room.code, 'wave_started');
  if (!isUntimedMode) {
    scheduleBotActions(room);

    room.timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - room.waveStartTime) / 1000);
      const remaining = Math.max(0, room.settings.timeLimit - elapsedSec);
      room.timeLeft = remaining;

      broadcastRoom(room.code, 'timer_tick', { timeLeft: remaining });

      if (remaining <= 0) {
        finishWave(room);
      }
    }, 250);
  }
}

function handlePlayerSubmission(room, playerId, rawInput, selectedPlayerId, extra = {}) {
  if (room.state !== 'PLAYING') return false;
  const mode = room.settings.gameMode || 'multi_club_pool';
  const cleanInput = (rawInput || '').toString().trim();

  // Continuous untimed mode for Mode 3 (Top 10 Stats): anyone can answer all 10 ranks!
  if (mode === 'top10_stats') {
    if (!cleanInput) return { ok: false, feedback: 'กรุณาพิมพ์ชื่อนักเตะก่อนกดส่ง' };
    const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
    if (!room.unlockedTop10Ranks) room.unlockedTop10Ranks = {};
    const player = room.players.find((p) => p.id === playerId);

    const matchedItem = list.items.find((it) =>
      matchesNameOrAlias(cleanInput, it.name, it.aliases)
    );

    if (!matchedItem) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ "${cleanInput}" ไม่ได้อยู่ใน Top 10 ของหัวข้อนี้ ลองทายคนอื่นต่อได้เลย!`
        }
      };
    }

    if (room.unlockedTop10Ranks[matchedItem.rank]) {
      const owner = room.unlockedTop10Ranks[matchedItem.rank].answeredBy;
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ อันดับ #${matchedItem.rank} (${matchedItem.name}) ถูกเปิดไปแล้ว (${owner})`
        }
      };
    }

    const knownPlayer = findPlayerByInput(matchedItem.name, selectedPlayerId);
    const itemPhoto = knownPlayer?.photoUrl || null;

    room.unlockedTop10Ranks[matchedItem.rank] = {
      answeredBy: player ? player.name : 'ผู้เล่น',
      playerId: player ? player.id : null,
      revealed: false,
      photoUrl: itemPhoto
    };

    if (player) {
      player.score += 1;
      recordPlayerResultStats(player, true, null, matchedItem.name);
    }

    if (!itemPhoto) {
      getPlayerPhotoByName(matchedItem.name).then((photo) => {
        if (photo && room.unlockedTop10Ranks && room.unlockedTop10Ranks[matchedItem.rank]) {
          room.unlockedTop10Ranks[matchedItem.rank].photoUrl = photo;
          broadcastRoom(room.code, 'top10_updated');
        }
      });
    }

    broadcastRoom(room.code, 'top10_updated', {
      toastMessage: `🎉 ${player ? player.name : 'ผู้เล่น'} ตอบถูก! อันดับ #${matchedItem.rank}: ${matchedItem.name} (+1 คะแนน)`
    });

    return {
      ok: true,
      top10Feedback: {
        correct: true,
        rank: matchedItem.rank,
        name: matchedItem.name,
        message: `✅ ถูกต้อง! อันดับ #${matchedItem.rank}: ${matchedItem.name} (+1 คะแนน)`
      }
    };
  }

  if (room.submissions[playerId]) return false;

  const timeTakenMs = Math.max(100, Date.now() - room.waveStartTime);
  let enrichPromise = Promise.resolve(null);
  if (mode !== 'trivia_quiz') {
    const initialMatch = findPlayerByInput(cleanInput, selectedPlayerId);
    enrichPromise = enrichPlayerClubHistory(initialMatch, cleanInput);
  }

  room.submissions[playerId] = {
    playerId,
    rawInput: cleanInput,
    selectedPlayerId: selectedPlayerId || null,
    choiceIndex: extra.choiceIndex !== undefined ? Number(extra.choiceIndex) : null,
    cellIndex: extra.cellIndex !== undefined ? Number(extra.cellIndex) : 0,
    timeTakenMs,
    timestamp: Date.now(),
    enrichPromise
  };

  broadcastRoom(room.code, 'player_submitted', { submittedPlayerId: playerId });

  const allSubmitted = room.players.every((p) => !!room.submissions[p.id]);
  if (allSubmitted) {
    setTimeout(() => {
      if (room.state === 'PLAYING') {
        finishWave(room);
      }
    }, 450);
  }
  return true;
}

function recordPlayerResultStats(player, isCorrect, timeTakenMs, footballerName) {
  if (!player) return;
  if (!player.stats) player.stats = createInitialStats();

  if (isCorrect) {
    player.streak = (player.streak || 0) + 1;
    player.stats.correctCount += 1;
    if (player.streak > player.stats.bestStreak) {
      player.stats.bestStreak = player.streak;
    }
    if (timeTakenMs) {
      player.stats.totalCorrectTimeMs += timeTakenMs;
      if (player.stats.fastestTimeMs === null || timeTakenMs < player.stats.fastestTimeMs) {
        player.stats.fastestTimeMs = timeTakenMs;
      }
    }
    if (footballerName) {
      player.stats.namedPlayers.push(footballerName);
    }
  } else {
    player.streak = 0;
    player.stats.wrongCount += 1;
  }
}

async function finishWave(room) {
  if (room.state !== 'PLAYING') return;
  clearRoomTimers(room);
  room.state = 'REVEAL';
  room.timeLeft = 0;

  // Wait for any live API player club-history lookups to finish
  const subsList = Object.values(room.submissions || {});
  await Promise.all(
    subsList.map(async (sub) => {
      if (sub.enrichPromise) {
        try {
          const enriched = await sub.enrichPromise;
          if (enriched && enriched.id) {
            sub.selectedPlayerId = enriched.id;
          }
        } catch (e) {}
      }
    })
  );

  const mode = room.settings.gameMode || 'multi_club_pool';
  if (mode === 'lineup_quiz') {
    finishLineupWave(room);
  } else if (mode === 'top10_stats') {
    finishTop10Wave(room);
  } else if (mode === 'career_path') {
    finishCareerPathWave(room);
  } else if (mode === 'trivia_quiz') {
    finishTriviaWave(room);
  } else if (mode === 'footy_grid') {
    finishFootyGridWave(room);
  } else {
    finishClubBattleWave(room);
  }

  broadcastRoom(room.code, 'wave_revealed');
}

// MODE 1: MULTI-CLUB POOL BATTLE (1 point per matched club in the pool!)
function finishClubBattleWave(room) {
  const pickedClubs = (room.pickedClubs || []).map((pc) => ({
    ...pc,
    club: CLUBS.find((c) => c.id === pc.clubId)
  }));

  const orderedEntries = room.players.map((pl) => ({
    player: pl,
    sub: room.submissions[pl.id] || null
  }));

  const claimedInThisWave = new Map();

  const resolved = orderedEntries.map(({ player, sub }) => {
    if (!sub || !sub.rawInput) {
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: '',
        footballer: null,
        matchedClubs: [],
        status: 'TIMEOUT',
        pointsEarned: 0,
        timeTakenMs: null,
        message: 'หมดเวลา! ไม่ได้ส่งคำตอบ'
      };
    }

    const footballer = findPlayerByInput(sub.rawInput, sub.selectedPlayerId);
    if (!footballer) {
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer: null,
        matchedClubs: [],
        status: 'NOT_FOUND',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `ไม่พบนักเตะ "${sub.rawInput}" ในฐานข้อมูล 5 ลีกใหญ่`
      };
    }

    const alreadyUsed = room.usedPlayers.find((u) => u.id === footballer.id);
    if (alreadyUsed) {
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer,
        matchedClubs: [],
        status: 'ALREADY_USED',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `ชื่อของ ${footballer.name} ถูกตอบไปแล้วในรอบก่อนหน้า (โดย ${alreadyUsed.answeredBy})`
      };
    }

    // Check how many picked clubs on the board this footballer played for!
    const matched = pickedClubs.filter((pc) => footballer.clubs.includes(pc.clubId));

    if (matched.length === 0) {
      const actualClubNames =
        footballer.clubs
          .map((cid) => CLUBS.find((c) => c.id === cid)?.name)
          .filter(Boolean)
          .slice(0, 4)
          .join(', ') ||
        (footballer.rawTeams || []).slice(0, 4).join(', ');
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer,
        matchedClubs: [],
        status: 'WRONG_CLUB',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `${footballer.name} ไม่เคยอยู่สโมสรใดเลยบนกระดานรอบนี้ (เคยอยู่: ${actualClubNames || '-'})`
      };
    }

    if (!claimedInThisWave.has(footballer.id)) {
      claimedInThisWave.set(footballer.id, []);
    }
    claimedInThisWave.get(footballer.id).push({
      playerId: player.id,
      playerName: player.name,
      timeTakenMs: sub.timeTakenMs
    });

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: sub.rawInput,
      footballer,
      matchedClubs: matched.map((m) => m.club?.name || m.clubId),
      matchedClubObjs: matched.map((m) => ({
        id: m.clubId,
        name: m.club?.name || m.clubId,
        short: m.club?.short || 'FC',
        badgeUrl: m.club?.badgeUrl || null,
        primaryColor: m.club?.primaryColor || '#10b981'
      })),
      status: 'PENDING_DUPLICATE_CHECK',
      pointsEarned: 0,
      timeTakenMs: sub.timeTakenMs,
      message: ''
    };
  });

  for (const claims of claimedInThisWave.values()) {
    claims.sort((a, b) => a.timeTakenMs - b.timeTakenMs);
  }

  resolved.forEach((res) => {
    const pl = room.players.find((p) => p.id === res.playerId);
    if (res.status !== 'PENDING_DUPLICATE_CHECK') {
      recordPlayerResultStats(pl, false, null, null);
      return;
    }

    const claims = claimedInThisWave.get(res.footballer.id);
    const matchedCount = res.matchedClubs.length;
    const clubsText = res.matchedClubs.join(' + ');

    if (claims.length === 1) {
      const pts = matchedCount;
      res.status = 'CORRECT';
      res.pointsEarned = pts;
      res.message = `เคยอยู่ ${matchedCount} สโมสรบนกระดาน (${clubsText}) ➔ รับ +${pts} คะแนน!`;
      if (pl) {
        pl.score += pts;
        recordPlayerResultStats(pl, true, res.timeTakenMs, res.footballer.name);
      }
      room.usedPlayers.push({
        id: res.footballer.id,
        name: res.footballer.name,
        flag: res.footballer.flag,
        flagUrl: res.footballer.flagUrl || getFlagUrlFromEmoji(res.footballer.flag),
        photoUrl: res.footballer.photoUrl || null,
        position: `${matchedCount} สโมสร`,
        answeredBy: res.playerName,
        wave: room.waveNumber
      });
    } else {
      const isFastest = claims[0].playerId === res.playerId;
      const rule = room.settings.duplicateRule || 'strict_unique';

      if (rule === 'both_cancel') {
        res.status = 'DUPLICATE_WAVE';
        res.pointsEarned = 0;
        res.message = `ใจตรงกัน! ตอบ ${res.footballer.name} ซ้ำกับเพื่อนในรอบเดียวกัน จึงไม่ได้คะแนน`;
        recordPlayerResultStats(pl, false, null, null);
      } else if (rule === 'speed_split') {
        const pts = matchedCount;
        res.status = isFastest ? 'CORRECT' : 'DUPLICATE_PARTIAL';
        res.pointsEarned = pts;
        res.message = `เคยอยู่ ${matchedCount} สโมสร (${clubsText}) ➔ รับ +${pts} คะแนน!`;
        if (pl) {
          pl.score += pts;
          recordPlayerResultStats(pl, true, res.timeTakenMs, res.footballer.name);
        }
      } else {
        if (isFastest) {
          const pts = matchedCount;
          res.status = 'CORRECT';
          res.pointsEarned = pts;
          res.message = `ไวกว่า! เคยอยู่ ${matchedCount} สโมสร (${clubsText}) ➔ รับ +${pts} คะแนน!`;
          if (pl) {
            pl.score += pts;
            recordPlayerResultStats(pl, true, res.timeTakenMs, res.footballer.name);
          }
        } else {
          res.status = 'DUPLICATE_WAVE';
          res.pointsEarned = 0;
          res.message = `ช้าไปนิดเดียว! ${claims[0].playerName} ชิงตอบ ${res.footballer.name} ไปก่อน`;
          recordPlayerResultStats(pl, false, null, null);
        }
      }

      if (isFastest && rule !== 'both_cancel') {
        room.usedPlayers.push({
          id: res.footballer.id,
          name: res.footballer.name,
          flag: res.footballer.flag,
          flagUrl: res.footballer.flagUrl || getFlagUrlFromEmoji(res.footballer.flag),
          photoUrl: res.footballer.photoUrl || null,
          position: `${matchedCount} สโมสร`,
          answeredBy: claims[0].playerName,
          wave: room.waveNumber
        });
      }
    }
  });

  resolved.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = resolved;
}

// MODE 2: GUESS THE LINEUP (11 STARTING XI)
function finishLineupWave(room) {
  const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
  if (!room.unlockedLineupSlots) room.unlockedLineupSlots = {};

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  const results = subs.map(({ player, sub }) => {
    if (!sub || !sub.rawInput) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: '',
        footballer: null,
        status: 'TIMEOUT',
        pointsEarned: 0,
        timeTakenMs: null,
        message: 'หมดเวลา! ไม่ได้ส่งคำตอบ'
      };
    }

    const matchedSlot = lineup.slots.find((s) =>
      matchesNameOrAlias(sub.rawInput, s.playerId, s.aliases)
    );

    if (!matchedSlot) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer: null,
        status: 'WRONG_CLUB',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `"${sub.rawInput}" ไม่ได้อยู่ใน 11 ตัวจริงของแมตช์นี้`
      };
    }

    const knownPlayer = findPlayerByInput(matchedSlot.playerId, sub.selectedPlayerId);
    const slotPhoto = knownPlayer?.photoUrl || null;
    const slotFlagUrl = getFlagUrlFromEmoji(matchedSlot.flag);

    if (room.unlockedLineupSlots[matchedSlot.slotId]) {
      const prevOwner = room.unlockedLineupSlots[matchedSlot.slotId].answeredBy;
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: matchedSlot.playerId,
        footballer: { name: matchedSlot.playerId, flag: matchedSlot.flag, flagUrl: slotFlagUrl, photoUrl: slotPhoto, position: matchedSlot.pos },
        status: 'ALREADY_USED',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `ตำแหน่งของ ${matchedSlot.playerId} ถูกเปิดไปแล้วโดย ${prevOwner}!`
      };
    }

    room.unlockedLineupSlots[matchedSlot.slotId] = {
      answeredBy: player.name,
      playerId: matchedSlot.playerId,
      photoUrl: slotPhoto
    };

    const pts = 1;
    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, matchedSlot.playerId);

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: matchedSlot.playerId,
      footballer: { name: matchedSlot.playerId, flag: matchedSlot.flag, flagUrl: slotFlagUrl, photoUrl: slotPhoto, position: `${matchedSlot.pos} #${matchedSlot.number}` },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `เปิดป้ายสำเร็จ! ${matchedSlot.playerId} (${matchedSlot.pos} เบอร์ ${matchedSlot.number}) +${pts} คะแนน`
    };
  });

  results.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = results;
}

// MODE 3: TOP 10 STATS (FAMILY FEUD)
function finishTop10Wave(room) {
  const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
  if (!room.unlockedTop10Ranks) room.unlockedTop10Ranks = {};

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  const results = subs.map(({ player, sub }) => {
    if (!sub || !sub.rawInput) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: '',
        footballer: null,
        status: 'TIMEOUT',
        pointsEarned: 0,
        timeTakenMs: null,
        message: 'หมดเวลา! ไม่ได้ส่งคำตอบ'
      };
    }

    const matchedItem = list.items.find((it) =>
      matchesNameOrAlias(sub.rawInput, it.name, it.aliases)
    );

    if (!matchedItem) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer: null,
        status: 'WRONG_CLUB',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `"${sub.rawInput}" ไม่ติดอยู่ใน Top 10 ของหัวข้อนี้`
      };
    }

    const knownPlayer = findPlayerByInput(matchedItem.name, sub.selectedPlayerId);
    const itemPhoto = knownPlayer?.photoUrl || null;
    const itemFlagUrl = getFlagUrlFromEmoji(matchedItem.flag);

    if (room.unlockedTop10Ranks[matchedItem.rank]) {
      const prevOwner = room.unlockedTop10Ranks[matchedItem.rank].answeredBy;
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: matchedItem.name,
        footballer: { name: matchedItem.name, flag: matchedItem.flag, flagUrl: itemFlagUrl, photoUrl: itemPhoto, position: `อันดับ #${matchedItem.rank}` },
        status: 'ALREADY_USED',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `อันดับ #${matchedItem.rank} (${matchedItem.name}) ถูกเปิดไปแล้วโดย ${prevOwner}`
      };
    }

    room.unlockedTop10Ranks[matchedItem.rank] = {
      answeredBy: player.name,
      photoUrl: itemPhoto
    };

    const pts = 1;
    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, matchedItem.name);

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: matchedItem.name,
      footballer: { name: matchedItem.name, flag: matchedItem.flag, flagUrl: itemFlagUrl, photoUrl: itemPhoto, position: `อันดับ #${matchedItem.rank}` },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `ถูกต้อง! อันดับ #${matchedItem.rank} (${matchedItem.stat}) รับ +${pts} คะแนน`
    };
  });

  results.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = results;
}

// MODE 4: CAREER PATH (WHO AM I?)
function finishCareerPathWave(room) {
  const cp = CAREER_PATHS.find((c) => c.id === room.currentCareerId) || CAREER_PATHS[0];
  const ansPlayer = findPlayerByInput(cp.answerName, null);
  const ansPhoto = ansPlayer?.photoUrl || room.currentCareerPhotoUrl || null;
  const ansFlagUrl = getFlagUrlFromEmoji(cp.flag);

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  const results = subs.map(({ player, sub }) => {
    if (!sub || !sub.rawInput) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: '',
        footballer: null,
        status: 'TIMEOUT',
        pointsEarned: 0,
        timeTakenMs: null,
        message: `หมดเวลา! คำตอบที่ถูกคือ ${cp.answerName}`
      };
    }

    const isCorrect = matchesNameOrAlias(sub.rawInput, cp.answerName, cp.aliases);
    if (!isCorrect) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer: null,
        status: 'WRONG_CLUB',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `ผิด! นักเตะปริศนาคนนี้คือ ${cp.flag} ${cp.answerName}`
      };
    }

    const pts = 2;
    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, cp.answerName);

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: cp.answerName,
      footballer: { name: cp.answerName, flag: cp.flag, flagUrl: ansFlagUrl, photoUrl: ansPhoto, position: cp.position },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `ทายถูกเผง! เขาคือ ${cp.answerName} รับ +${pts} คะแนน`
    };
  });

  results.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = results;
}

// MODE 5: 4-CHOICE FOOTBALL TRIVIA QUIZ
function finishTriviaWave(room) {
  const tr = TRIVIA_QUESTIONS.find((q) => q.id === room.currentTriviaId) || TRIVIA_QUESTIONS[0];

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  const results = subs.map(({ player, sub }) => {
    if (!sub || (sub.choiceIndex === null && sub.rawInput === '')) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: '',
        footballer: null,
        status: 'TIMEOUT',
        pointsEarned: 0,
        timeTakenMs: null,
        message: `หมดเวลา! คำตอบที่ถูกคือ "${tr.options[tr.correctIndex]}"`
      };
    }

    const chosenIdx = sub.choiceIndex !== null ? sub.choiceIndex : parseInt(sub.rawInput, 10);
    const chosenText = tr.options[chosenIdx] || sub.rawInput;
    const isCorrect = chosenIdx === tr.correctIndex;

    if (!isCorrect) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: chosenText,
        footballer: null,
        status: 'WRONG_CLUB',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `ตอบผิด! เฉลย: ${tr.explanation}`
      };
    }

    const pts = 1;
    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, chosenText);

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: chosenText,
      footballer: { name: chosenText, flag: '✅', position: 'Trivia' },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `ถูกต้อง! ${tr.explanation}`
    };
  });

  results.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = results;
}

// MODE 6: 3x3 FOOTY TIC-TAC-TOE GRID
function finishFootyGridWave(room) {
  const grid = FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
  if (!room.gridCells) room.gridCells = Array(9).fill(null);

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  const results = subs.map(({ player, sub }) => {
    if (!sub || !sub.rawInput) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: '',
        footballer: null,
        status: 'TIMEOUT',
        pointsEarned: 0,
        timeTakenMs: null,
        message: 'หมดเวลา! ไม่ได้ส่งคำตอบ'
      };
    }

    const cellIdx = Math.max(0, Math.min(8, sub.cellIndex || 0));
    const rIdx = Math.floor(cellIdx / 3);
    const cIdx = cellIdx % 3;
    const rowCrit = grid.rows[rIdx];
    const colCrit = grid.cols[cIdx];

    if (room.gridCells[cellIdx]) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer: null,
        status: 'ALREADY_USED',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `ช่อง [${rowCrit.label} x ${colCrit.label}] ถูกยึดไปแล้วโดย ${room.gridCells[cellIdx].ownerName}!`
      };
    }

    const footballer = findPlayerByInput(sub.rawInput, sub.selectedPlayerId);
    if (
      !footballer ||
      !playerMatchesGridCriteria(footballer, rowCrit) ||
      !playerMatchesGridCriteria(footballer, colCrit)
    ) {
      recordPlayerResultStats(player, false, null, null);
      return {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        rawInput: sub.rawInput,
        footballer: footballer || null,
        status: 'WRONG_CLUB',
        pointsEarned: 0,
        timeTakenMs: sub.timeTakenMs,
        message: `"${sub.rawInput}" ไม่ตรงเงื่อนไขช่อง [${rowCrit.label} + ${colCrit.label}]`
      };
    }

    room.gridCells[cellIdx] = {
      ownerId: player.id,
      ownerName: player.name,
      ownerAvatar: player.avatar,
      playerName: footballer.name,
      playerFlag: footballer.flag,
      flagUrl: footballer.flagUrl || getFlagUrlFromEmoji(footballer.flag),
      photoUrl: footballer.photoUrl || null
    };

    const gotBingo = checkGridBingo(room.gridCells, player.id);
    const bingoBonus = gotBingo ? 2 : 0;
    const pts = 2 + bingoBonus;

    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, footballer.name);

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: footballer.name,
      footballer: {
        name: footballer.name,
        flag: footballer.flag,
        flagUrl: footballer.flagUrl || getFlagUrlFromEmoji(footballer.flag),
        photoUrl: footballer.photoUrl || null,
        position: `${rowCrit.label} x ${colCrit.label}`
      },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `ยึดช่อง [${rowCrit.label} x ${colCrit.label}] สำเร็จ!${gotBingo ? ' 🎉 เรียงครบ 3 ช่อง BINGO โบนัส +2 แต้ม!' : ''}`
    };
  });

  results.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = results;
}

function startModeRound(room, options = {}) {
  const mode = room.settings.gameMode || 'club_battle';

  if (mode === 'lineup_quiz') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    const chosen = options.lineupId
      ? LINEUPS.find((l) => l.id === options.lineupId)
      : LINEUPS[(room.roundNumber - 1) % LINEUPS.length];
    room.currentLineupId = (chosen || LINEUPS[0]).id;
    room.unlockedLineupSlots = {};
    startWave(room);
  } else if (mode === 'top10_stats') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    const chosen = options.listId
      ? TOP10_LISTS.find((l) => l.id === options.listId)
      : TOP10_LISTS[(room.roundNumber - 1) % TOP10_LISTS.length];
    room.currentTop10Id = (chosen || TOP10_LISTS[0]).id;
    room.unlockedTop10Ranks = {};
    room.hintedTop10Ranks = {};
    startWave(room);
  } else if (mode === 'career_path') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    const pool = CAREER_PATHS.filter((c) => c.id !== room.currentCareerId);
    const nextCp = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CAREER_PATHS[0];
    room.currentCareerId = nextCp.id;
    room.currentCareerPhotoUrl = null;
    getPlayerPhotoByName(nextCp.answerName).then((photo) => {
      if (photo) room.currentCareerPhotoUrl = photo;
    });
    startWave(room);
  } else if (mode === 'trivia_quiz') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    if (options.triviaDifficulty) {
      room.settings.triviaDifficulty = options.triviaDifficulty;
    }
    const diff = room.settings.triviaDifficulty || 'all';
    const byDiff =
      diff === 'all'
        ? TRIVIA_QUESTIONS
        : TRIVIA_QUESTIONS.filter((q) => (q.difficulty || 'medium') === diff);
    const basePool = byDiff.length > 0 ? byDiff : TRIVIA_QUESTIONS;
    const pool = basePool.filter((q) => q.id !== room.currentTriviaId);
    const nextTr = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : basePool[0];
    room.currentTriviaId = nextTr.id;
    startWave(room);
  } else if (mode === 'footy_grid') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    const chosen = options.gridId
      ? FOOTY_GRIDS.find((g) => g.id === options.gridId)
      : FOOTY_GRIDS[(room.roundNumber - 1) % FOOTY_GRIDS.length];
    room.currentGridId = (chosen || FOOTY_GRIDS[0]).id;
    room.gridCells = Array(9).fill(null);
    startWave(room);
  } else {
    // club_battle: Multi-Club Pool!
    room.pickedClubs = [];
    room.usedPlayers = [];
    room.lastWaveResults = [];

    if (room.settings.clubSelectMode === 'random') {
      const isSingleClubMode = mode === 'club_battle';
      // Prefer top major European clubs for random pool so there are rich multi-club player overlaps
      const primaryPool = CLUBS.slice(0, 32);
      const sourceClubs = primaryPool.length >= 10 ? primaryPool : CLUBS;
      const shuffled = [...sourceClubs].sort(() => Math.random() - 0.5);
      const count = getTargetClubPoolSize(room);
      for (let i = 0; i < count; i++) {
        const isBonusClub = !isSingleClubMode && room.players.length === 2 && i >= room.players.length;
        const p = room.players[(room.roundNumber + i) % room.players.length];
        room.pickedClubs.push({
          playerId: isBonusClub ? 'bonus_club_' + i : p.id,
          playerName: isBonusClub ? 'สโมสรโบนัสกลางกระดาน' : p.name,
          playerAvatar: isBonusClub ? '🎲' : p.avatar,
          clubId: shuffled[i % shuffled.length].id
        });
      }
      room.roundNumber += 1;
      room.waveNumber = 1;
      startWave(room);
    } else {
      room.state = 'SELECTING_CLUB';
      broadcastRoom(room.code, 'selecting_club');
      scheduleBotClubPicks(room);
    }
  }
}

function handleApiAction(req, res, body) {
  const { action, roomCode, playerId } = body;

  if (action === 'create_room') {
    const code = generateRoomCode();
    const pId = playerId || 'pl_' + crypto.randomBytes(4).toString('hex');
    const name = (body.playerName || 'ผู้เล่น 1').trim().slice(0, 24);
    const avatar = body.avatar || AVATARS[0];

    const room = {
      code,
      hostId: pId,
      selectorId: pId,
      state: 'LOBBY',
      roundNumber: 0,
      waveNumber: 0,
      totalWavesPlayed: 0,
      pickedClubs: [],
      currentLineupId: LINEUPS[0].id,
      currentTop10Id: TOP10_LISTS[0].id,
      currentCareerId: CAREER_PATHS[0].id,
      currentTriviaId: TRIVIA_QUESTIONS[0].id,
      currentGridId: FOOTY_GRIDS[0].id,
      unlockedLineupSlots: {},
      unlockedTop10Ranks: {},
      hintedTop10Ranks: {},
      gridCells: Array(9).fill(null),
      timeLeft: 15,
      usedPlayers: [],
      submissions: {},
      lastWaveResults: [],
      settings: {
        gameMode: 'multi_club_pool',
        timeLimit: 15,
        duplicateRule: 'strict_unique',
        clubSelectMode: 'random',
        clubPoolSizeRule: 'fixed_3',
        triviaDifficulty: 'all',
        targetScore: 10 // Default 10 points for 1/2/3 point scoring!
      },
      players: [
        {
          id: pId,
          name,
          avatar,
          score: 0,
          streak: 0,
          stats: createInitialStats(),
          isBot: false,
          connected: true
        }
      ]
    };

    rooms.set(code, room);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, roomCode: code, playerId: pId, room: serializeRoomForClients(room) }));
  }

  if (action === 'join_room') {
    const code = (roomCode || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'ไม่พบห้องรหัส ' + code + ' กรุณาตรวจสอบรหัสห้องอีกครั้ง' }));
    }

    const pId = playerId || 'pl_' + crypto.randomBytes(4).toString('hex');
    const existing = room.players.find((p) => p.id === pId);
    if (existing) {
      existing.connected = true;
      if (body.playerName) existing.name = body.playerName.trim().slice(0, 24);
      if (body.avatar) existing.avatar = body.avatar;
    } else {
      const name = (body.playerName || `ผู้เล่น ${room.players.length + 1}`).trim().slice(0, 24);
      const avatar = body.avatar || AVATARS[room.players.length % AVATARS.length];
      room.players.push({
        id: pId,
        name,
        avatar,
        score: 0,
        streak: 0,
        stats: createInitialStats(),
        isBot: false,
        connected: true
      });
    }

    broadcastRoom(code, 'player_joined');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, roomCode: code, playerId: pId, room: serializeRoomForClients(room) }));
  }

  const code = (roomCode || '').trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: false, error: 'ไม่พบห้องนี้ในระบบ' }));
  }

  if (action === 'update_settings') {
    if (body.gameMode) {
      room.settings.gameMode = body.gameMode;
    }
    if (body.timeLimit !== undefined) {
      const t = parseInt(body.timeLimit, 10);
      if (!isNaN(t)) {
        room.settings.timeLimit = Math.max(5, Math.min(60, t));
      }
    }
    if (body.duplicateRule) {
      room.settings.duplicateRule = body.duplicateRule;
    }
    if (body.clubSelectMode) {
      room.settings.clubSelectMode = body.clubSelectMode;
    }
    if (body.clubPoolSizeRule) {
      room.settings.clubPoolSizeRule = body.clubPoolSizeRule;
    }
    if (body.triviaDifficulty) {
      room.settings.triviaDifficulty = body.triviaDifficulty;
    }
    if (body.targetScore !== undefined) {
      const ts = parseInt(body.targetScore, 10);
      if (!isNaN(ts)) {
        room.settings.targetScore = Math.max(0, ts);
      }
    }
    broadcastRoom(code, 'settings_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'back_to_lobby') {
    clearRoomTimers(room);
    room.state = 'LOBBY';
    broadcastRoom(code, 'room_state');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'add_bot') {
    const botCount = room.players.filter((p) => p.isBot).length;
    if (botCount >= 5) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'เพิ่มบอทได้สูงสุด 5 ตัวต่อห้อง' }));
    }
    const botId = 'bot_' + crypto.randomBytes(3).toString('hex');
    const botName = BOT_NAMES[botCount % BOT_NAMES.length];
    room.players.push({
      id: botId,
      name: botName,
      avatar: '🤖',
      score: 0,
      streak: 0,
      stats: createInitialStats(),
      isBot: true,
      connected: true
    });
    broadcastRoom(code, 'player_joined');
    if (room.state === 'SELECTING_CLUB') {
      scheduleBotClubPicks(room);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'remove_player') {
    const targetId = body.targetPlayerId;
    room.players = room.players.filter((p) => p.id !== targetId);
    room.pickedClubs = (room.pickedClubs || []).filter((pc) => pc.playerId !== targetId);
    broadcastRoom(code, 'player_removed');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'go_to_club_select' || action === 'start_mode_round') {
    clearRoomTimers(room);
    startModeRound(room, body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'select_club') {
    if (!room.pickedClubs) room.pickedClubs = [];
    const player = room.players.find((p) => p.id === playerId);
    const isSingleClubMode = room.settings.gameMode === 'club_battle';
    const targetPoolSize = getTargetClubPoolSize(room);
    if (room.pickedClubs.length >= targetPoolSize) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          ok: false,
          error: `เลือกสโมสรครบ ${targetPoolSize} ทีมบนกระดานแล้ว กำลังเริ่มเกม...`
        })
      );
    }
    const maxAllowed = isSingleClubMode ? 1 : room.players.length === 1 ? 3 : 1;
    const myCurrentPicks = room.pickedClubs.filter((pc) => pc.playerId === playerId);

    if (myCurrentPicks.length >= maxAllowed) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          ok: false,
          error: 'คุณได้เลือกสโมสรของรอบนี้ครบแล้ว กำลังรอเพื่อนคนอื่นเลือกสโมสร...'
        })
      );
    }

    const usedClubIds = new Set(room.pickedClubs.map((pc) => pc.clubId));
    let chosenClub = null;

    if (body.random) {
      const pool = (body.leagueFilter
        ? CLUBS.filter((c) => c.league === body.leagueFilter)
        : CLUBS
      ).filter((c) => !usedClubIds.has(c.id));
      const fallback = CLUBS.filter((c) => !usedClubIds.has(c.id));
      const list = pool.length > 0 ? pool : fallback;
      if (list.length > 0) {
        chosenClub = list[Math.floor(Math.random() * list.length)];
      }
    } else {
      chosenClub = findClubByInput(body.clubInput, body.clubId);
    }

    if (!chosenClub) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'ไม่พบสโมสรที่ระบุ กรุณาเลือกจากรายการ 5 ลีกใหญ่ยุโรป' }));
    }

    if (usedClubIds.has(chosenClub.id)) {
      const owner = room.pickedClubs.find((pc) => pc.clubId === chosenClub.id);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          ok: false,
          error: `ห้ามซ้ำ! สโมสร ${chosenClub.name} ถูกเลือกไปแล้วโดย ${owner ? owner.playerName : 'ผู้เล่นอื่น'}`
        })
      );
    }

    room.pickedClubs.push({
      playerId,
      playerName: player ? player.name : 'ผู้เล่น',
      playerAvatar: player ? player.avatar : '⚽',
      clubId: chosenClub.id
    });

    broadcastRoom(code, 'club_picked');
    checkAllClubsPicked(room);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'force_start_club_wave') {
    if ((room.pickedClubs || []).length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'กรุณาเลือกอย่างน้อย 1 สโมสรก่อนเริ่มรอบ' }));
    }
    if (room.settings.gameMode !== 'club_battle' && room.pickedClubs.length < 3) {
      fillRemainingBonusClubs(room, 3);
    }
    room.roundNumber += 1;
    room.waveNumber = 1;
    room.usedPlayers = [];
    startWave(room);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'next_wave_same_club') {
    const mode = room.settings.gameMode || 'club_battle';
    if (mode === 'career_path' || mode === 'trivia_quiz') {
      startModeRound(room);
    } else {
      room.waveNumber += 1;
      startWave(room);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'top10_hint_rank') {
    const rank = parseInt(body.rank, 10);
    if (!room.hintedTop10Ranks) room.hintedTop10Ranks = {};
    if (rank >= 1 && rank <= 10) {
      room.hintedTop10Ranks[rank] = true;
      broadcastRoom(code, 'top10_updated');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'top10_reveal_rank') {
    const rank = parseInt(body.rank, 10);
    const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
    const item = list.items.find((it) => it.rank === rank);
    if (!room.unlockedTop10Ranks) room.unlockedTop10Ranks = {};
    if (item && !room.unlockedTop10Ranks[rank]) {
      const knownPlayer = findPlayerByInput(item.name, null);
      const itemPhoto = knownPlayer?.photoUrl || null;
      room.unlockedTop10Ranks[rank] = {
        answeredBy: '👁️ เปิดเฉลย',
        revealed: true,
        photoUrl: itemPhoto
      };
      if (!itemPhoto) {
        getPlayerPhotoByName(item.name).then((photo) => {
          if (photo && room.unlockedTop10Ranks && room.unlockedTop10Ranks[rank]) {
            room.unlockedTop10Ranks[rank].photoUrl = photo;
            broadcastRoom(code, 'top10_updated');
          }
        });
      }
      broadcastRoom(code, 'top10_updated');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'top10_reveal_all') {
    const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
    if (!room.unlockedTop10Ranks) room.unlockedTop10Ranks = {};
    list.items.forEach((item) => {
      if (!room.unlockedTop10Ranks[item.rank]) {
        const knownPlayer = findPlayerByInput(item.name, null);
        room.unlockedTop10Ranks[item.rank] = {
          answeredBy: '👁️ เปิดเฉลย',
          revealed: true,
          photoUrl: knownPlayer?.photoUrl || null
        };
      }
    });
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'submit_answer') {
    const result = handlePlayerSubmission(room, playerId, body.playerInput, body.selectedPlayerId, {
      choiceIndex: body.choiceIndex,
      cellIndex: body.cellIndex
    });
    const ok = typeof result === 'object' ? result.ok : Boolean(result);
    const top10Feedback = typeof result === 'object' ? result.top10Feedback || null : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok, top10Feedback, room: serializeRoomForClients(room) }));
  }

  if (action === 'end_match') {
    clearRoomTimers(room);
    room.state = 'GAME_OVER';
    broadcastRoom(code, 'match_ended');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'reset_scores') {
    clearRoomTimers(room);
    room.players.forEach((p) => {
      p.score = 0;
      p.streak = 0;
      p.stats = createInitialStats();
    });
    room.roundNumber = 0;
    room.waveNumber = 0;
    room.totalWavesPlayed = 0;
    room.pickedClubs = [];
    room.usedPlayers = [];
    room.unlockedLineupSlots = {};
    room.unlockedTop10Ranks = {};
    room.gridCells = Array(9).fill(null);
    room.lastWaveResults = [];
    room.state = 'LOBBY';
    broadcastRoom(code, 'scores_reset');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'send_reaction') {
    const sender = room.players.find((p) => p.id === playerId);
    broadcastRoom(code, 'reaction', {
      reaction: {
        playerId,
        playerName: sender ? sender.name : 'ผู้เล่น',
        emoji: body.emoji || '⚽'
      }
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Unknown action' }));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  if (pathname === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(
      JSON.stringify({
        leagues: LEAGUES,
        clubs: CLUBS,
        players: PLAYERS.map((p) => ({
          id: p.id,
          name: p.name,
          flag: p.flag,
          flagUrl: p.flagUrl || getFlagUrlFromEmoji(p.flag),
          photoUrl: p.photoUrl || null,
          position: p.position,
          aliases: p.aliases,
          fromLiveApi: Boolean(p.fromLiveApi)
        }))
      })
    );
  }

  if (pathname === '/api/live-search' && req.method === 'GET') {
    const q = (parsedUrl.searchParams.get('q') || '').trim();
    searchPlayersFromApi(q)
      .then((found) => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            ok: true,
            players: found.map((p) => ({
              id: p.id,
              name: p.name,
              flag: p.flag,
              flagUrl: p.flagUrl || getFlagUrlFromEmoji(p.flag),
              photoUrl: p.photoUrl || null,
              position: p.position,
              aliases: p.aliases,
              fromLiveApi: Boolean(p.fromLiveApi)
            }))
          })
        );
      })
      .catch(() => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, players: [] }));
      });
    return;
  }

  if (pathname === '/api/stream' && req.method === 'GET') {
    const roomCode = (parsedUrl.searchParams.get('roomCode') || '').toUpperCase();
    const playerId = parsedUrl.searchParams.get('playerId') || '';
    const room = rooms.get(roomCode);

    if (!room) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Room not found' }));
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    if (!roomStreams.has(roomCode)) {
      roomStreams.set(roomCode, new Map());
    }
    roomStreams.get(roomCode).set(playerId, res);

    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = true;
    }

    res.write(
      `data: ${JSON.stringify({ type: 'room_state', room: serializeRoomForClients(room) })}\n\n`
    );

    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      const streams = roomStreams.get(roomCode);
      if (streams) {
        streams.delete(playerId);
      }
      if (player) {
        player.connected = false;
        broadcastRoom(roomCode, 'player_status');
      }
    });
    return;
  }

  if (pathname === '/api/action' && req.method === 'POST') {
    let rawData = '';
    req.on('data', (chunk) => {
      rawData += chunk;
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(rawData || '{}');
        handleApiAction(req, res, body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  let filePath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(__dirname, 'public', safePath);

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`⚽ Football Club Quiz Server running at http://localhost:${PORT}`);
  initializeFootballApiData().catch(() => {});
});
