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
const globalUsedTriviaIds = new Set();
const globalUsedTop10Ids = new Set();
const globalUsedWordleIds = new Set();

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const AVATARS = ['⚽', '🥅', '👟', '🧤', '👕', '🏆', '🥇', '👑', '🐐', '🔥', '⚡', '🦁'];
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
  const targetVal = criteria.id || criteria.value;
  if (criteria.type === 'club') {
    return player.clubs.includes(targetVal);
  }
  if (criteria.type === 'flag') {
    return player.flag === targetVal;
  }
  return false;
}

const GRID_BINGO_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function getGridBingoLines(cells, playerId) {
  if (!playerId || playerId === 'revealed') return [];
  return GRID_BINGO_LINES.filter((line) =>
    line.every((idx) => cells[idx] && cells[idx].ownerId === playerId)
  ).map((line) => line.join('-'));
}

function getAllWinningCellIndices(cells) {
  const winningSet = new Set();
  for (const line of GRID_BINGO_LINES) {
    const first = cells[line[0]];
    if (
      first &&
      first.ownerId &&
      first.ownerId !== 'revealed' &&
      line.every((idx) => cells[idx] && cells[idx].ownerId === first.ownerId)
    ) {
      line.forEach((idx) => winningSet.add(idx));
    }
  }
  return Array.from(winningSet);
}

function checkGridBingo(cells, playerId) {
  return getGridBingoLines(cells, playerId).length > 0;
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
    const hintedMap = room.hintedLineupSlots || {};
    return {
      lineupId: lineup.id,
      title: lineup.title,
      subtitle: lineup.subtitle,
      formation: lineup.formation,
      clubColor: lineup.clubColor,
      availableLineups: LINEUPS.map((l) => ({ id: l.id, title: l.title, subtitle: l.subtitle })),
      slots: lineup.slots.map((s) => {
        const u = unlockedMap[s.slotId];
        const rawHintVal = hintedMap[s.slotId];
        const hintLevel = typeof rawHintVal === 'number' ? rawHintVal : rawHintVal ? 3 : 0;
        const words = (s.playerId || '').trim().split(/\s+/);
        const initialsHint = words
          .map((w) => w.charAt(0).toUpperCase() + '_'.repeat(Math.max(2, w.length - 1)))
          .join(' ');
        const showFlag = !!u || hintLevel >= 1;
        const showNumber = !!u || hintLevel >= 2;
        const showInitials = !u && hintLevel >= 3;
        const slotPoints = hintLevel === 0 ? 3 : hintLevel === 1 ? 2 : 1;
        return {
          slotId: s.slotId,
          pos: s.pos,
          number: showNumber ? s.number : null,
          flag: showFlag ? s.flag : null,
          flagUrl: showFlag ? s.flagUrl || getFlagUrlFromEmoji(s.flag) : null,
          row: s.row,
          col: s.col,
          points: slotPoints,
          pointsEarned: u ? u.pointsEarned || 0 : 0,
          unlocked: !!u,
          revealed: u ? !!u.revealed : false,
          hintLevel,
          hinted: hintLevel > 0,
          hintText: showInitials ? initialsHint : null,
          playerName: u ? s.playerId : null,
          photoUrl: u ? u.photoUrl || s.photoUrl || null : null,
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
        const baseRankPoints = it.rank >= 8 ? 3 : it.rank >= 4 ? 2 : 1;
        const currentPoints = isHinted ? 1 : baseRankPoints;
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
          points: currentPoints,
          pointsEarned: u ? u.pointsEarned || 0 : 0,
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
    const isHintOpened = !!room.careerHintOpened || isRevealed;
    const matchedAnsPlayer = PLAYERS.find((p) => normalizeText(p.name) === normalizeText(cp.answerName));
    const words = (cp.answerName || '').trim().split(/\s+/);
    const initialsHint = words
      .map((w) => w.charAt(0).toUpperCase() + '_'.repeat(Math.max(2, w.length - 1)))
      .join(' ');
    return {
      careerId: cp.id,
      hintOpened: isHintOpened,
      potentialPoints: room.careerHintOpened ? 1 : 3,
      flag: isHintOpened ? cp.flag : '❓',
      flagUrl: isHintOpened ? cp.flagUrl || getFlagUrlFromEmoji(cp.flag) : null,
      position: isHintOpened ? cp.position : '???',
      hint: isHintOpened ? `${cp.hint} • อักษรย่อ: ${initialsHint}` : 'กดปุ่ม "💡 เปิดคำใบ้" หากต้องการดูสัญชาติ ตำแหน่ง และอักษรย่อชื่อ! (ไม่เปิดคำใบ้ได้ +3 แต้ม / เปิดคำใบ้ได้ +1 แต้ม)',
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
    const diff = tr.difficulty || 'medium';
    const basePoints = diff === 'hard' ? 3 : diff === 'medium' ? 2 : 1;
    const selDiff = room.settings.triviaDifficulty || 'all';
    const totalPool =
      selDiff === 'all'
        ? TRIVIA_QUESTIONS.length
        : TRIVIA_QUESTIONS.filter((q) => (q.difficulty || 'medium') === selDiff).length;
    const usedInRoom = Array.isArray(room.usedTriviaIds) ? room.usedTriviaIds.length : 1;
    return {
      triviaId: tr.id,
      difficulty: diff,
      basePoints,
      selectedDifficulty: selDiff,
      totalPoolCount: TRIVIA_QUESTIONS.length,
      filteredPoolCount: totalPool,
      usedInRoomCount: usedInRoom,
      question: tr.question,
      options: tr.options,
      correctIndex: isRevealed ? tr.correctIndex : null,
      explanation: isRevealed ? tr.explanation : null
    };
  }

  if (mode === 'footy_grid') {
    const grid = room.customFootyGrid || FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
    const hintedCells = room.hintedGridCells || {};
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

    const cellMeta = Array.from({ length: 9 }, (_, cellIdx) => {
      const rIdx = Math.floor(cellIdx / 3);
      const cIdx = cellIdx % 3;
      const matches = PLAYERS.filter(
        (p) => playerMatchesGridCriteria(p, grid.rows[rIdx]) && playerMatchesGridCriteria(p, grid.cols[cIdx])
      );
      const isHinted = !!hintedCells[cellIdx];
      const cellPoints = isHinted ? 1 : matches.length <= 5 ? 3 : 2;
      let hintText = null;
      if (isHinted && matches.length > 0) {
        const sample = matches[0];
        const words = sample.name.trim().split(/\s+/);
        const initials = words.map((w) => w.charAt(0).toUpperCase() + '_'.repeat(Math.max(2, w.length - 1))).join(' ');
        hintText = `${sample.flag} ${initials}`;
      }
      return {
        possibleCount: matches.length,
        points: cellPoints,
        hinted: isHinted,
        hintText
      };
    });

    const activePlayers = room.players || [];
    const turnIdx =
      activePlayers.length > 0
        ? ((room.gridTurnIndex || 0) % activePlayers.length + activePlayers.length) % activePlayers.length
        : 0;
    const turnPlayer = activePlayers[turnIdx] || activePlayers[0] || null;
    const cells = room.gridCells || Array(9).fill(null);

    return {
      gridId: grid.id,
      title: grid.title,
      cols: grid.cols.map(enrichHeader),
      rows: grid.rows.map(enrichHeader),
      availableGrids: FOOTY_GRIDS.map((g) => ({ id: g.id, title: g.title })),
      cells,
      winningCellIndices: getAllWinningCellIndices(cells),
      currentTurnPlayerId: turnPlayer ? turnPlayer.id : null,
      currentTurnPlayerName: turnPlayer ? turnPlayer.name : 'ผู้เล่น 1',
      currentTurnPlayerAvatar: turnPlayer ? turnPlayer.avatar : '⚽',
      turnOrder: activePlayers.map((p, idx) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        isCurrentTurn: idx === turnIdx
      })),
      cellMeta
    };
  }

  // MODE 7: FOOTBALL CONNECTIONS (16 Players -> 4 Secret Groups of 4)
  if (mode === 'connections') {
    if (!room.connectionsBoard) {
      room.connectionsBoard = generateConnectionsBoard(room.roundNumber || 1, room);
    }
    const board = room.connectionsBoard;
    if (!board) return null;
    const solvedGroupIds = new Set(board.groups.filter((g) => g.solved).map((g) => g.id));
    return {
      boardId: board.id,
      title: board.title,
      hintText: board.hintText || null,
      solvedGroups: board.groups.filter((g) => g.solved),
      remainingTiles: board.tiles
        .filter((t) => !solvedGroupIds.has(t.groupId))
        .map((t) => ({
          id: t.id,
          name: t.name,
          flag: t.flag,
          flagUrl: t.flagUrl,
          photoUrl: t.photoUrl,
          position: t.position
        }))
    };
  }

  // MODE 8: WHO ARE YA? (Blurred Photo + Wordle Attribute Matrix)
  if (mode === 'who_are_ya_wordle') {
    if (!room.wordleMysteryPlayer) {
      room.wordleMysteryPlayer = pickMysteryWordlePlayer(room);
    }
    const target = room.wordleMysteryPlayer;
    const solved = !!room.wordleSolved;
    const revealed = !!room.wordleRevealed;
    const guesses = room.wordleGuesses || [];
    const hintStep = room.wordleHintStep || 0;
    const blurSteps = [22, 14, 8, 4, 0];
    const effectiveStep = solved || revealed ? 4 : Math.min(4, hintStep + Math.floor(guesses.length / 2));
    const blurPx = blurSteps[effectiveStep];
    const potentialPoints = solved || revealed ? 0 : Math.max(1, 4 - effectiveStep);

    const primaryClubId = target.clubs[0];
    const primaryClub = CLUBS.find((c) => c.id === primaryClubId);
    const words = (target.name || '').trim().split(/\s+/);
    const initialsHint = words
      .map((w) => w.charAt(0).toUpperCase() + '_'.repeat(Math.max(2, w.length - 1)))
      .join(' ');

    return {
      roundNumber: room.roundNumber,
      photoUrl: target.photoUrl || null,
      blurPx,
      effectiveStep,
      potentialPoints,
      solved,
      revealed,
      solvedBy: room.wordleSolvedBy || null,
      pointsAwarded: room.wordlePointsAwarded || 0,
      hintClues: {
        nationality: effectiveStep >= 1 || solved || revealed ? target.flag : null,
        flagUrl: effectiveStep >= 1 || solved || revealed ? target.flagUrl || getFlagUrlFromEmoji(target.flag) : null,
        position: effectiveStep >= 2 || solved || revealed ? target.position : null,
        clubName: effectiveStep >= 3 || solved || revealed ? primaryClub?.name || 'ยุโรป' : null,
        clubBadgeUrl: effectiveStep >= 3 || solved || revealed ? primaryClub?.badgeUrl || null : null,
        initials: effectiveStep >= 4 || solved || revealed ? initialsHint : null
      },
      answerPlayer:
        solved || revealed
          ? {
              id: target.id,
              name: target.name,
              flag: target.flag,
              flagUrl: target.flagUrl || getFlagUrlFromEmoji(target.flag),
              photoUrl: target.photoUrl || null,
              position: target.position,
              clubs: target.clubs.map((cid) => CLUBS.find((c) => c.id === cid)?.name || cid)
            }
          : null,
      guesses
    };
  }

  // MODE 9: CHAIN LINK (Turn-Based Player -> Shared Club -> Teammate -> Shared Club...)
  if (mode === 'chain_link') {
    if (!room.chainLinkHistory || room.chainLinkHistory.length === 0) {
      const starter = pickChainStarterPlayer(room);
      room.chainLinkHistory = [
        {
          step: 1,
          playerId: starter.id,
          playerName: starter.name,
          flag: starter.flag,
          flagUrl: starter.flagUrl || getFlagUrlFromEmoji(starter.flag),
          photoUrl: starter.photoUrl || null,
          position: starter.position,
          viaClubId: null,
          viaClubName: 'จุดเริ่มต้นลูกโซ่ (Starter)',
          viaClubBadgeUrl: null,
          byPlayerName: '🎲 ระบบสุ่ม',
          pointsEarned: 0
        }
      ];
      room.chainUsedClubs = [];
      room.chainHintText = null;
    }
    const hist = room.chainLinkHistory;
    const currentAnchor = hist[hist.length - 1];
    const anchorPlayer = PLAYERS.find((p) => p.id === currentAnchor.playerId) || PLAYERS[0];
    const usedClubSet = new Set(room.chainUsedClubs || []);
    const availableAnchorClubs = (anchorPlayer?.clubs || [])
      .filter((cid) => !usedClubSet.has(cid))
      .map((cid) => {
        const c = CLUBS.find((cl) => cl.id === cid);
        return {
          id: cid,
          name: c?.name || cid,
          badgeUrl: c?.badgeUrl || null
        };
      });

    const activePlayers = room.players || [];
    const turnIdx =
      activePlayers.length > 0
        ? ((room.chainTurnIndex || 0) % activePlayers.length + activePlayers.length) % activePlayers.length
        : 0;
    const turnPlayer = activePlayers[turnIdx] || activePlayers[0] || null;
    const nextIdx = activePlayers.length > 0 ? (turnIdx + 1) % activePlayers.length : 0;
    const nextTurnPlayer = activePlayers[nextIdx] || null;

    return {
      chainLength: hist.length,
      currentTurnPlayerId: turnPlayer ? turnPlayer.id : null,
      currentTurnPlayerName: turnPlayer ? turnPlayer.name : 'ผู้เล่น 1',
      currentTurnPlayerAvatar: turnPlayer ? turnPlayer.avatar : '⚽',
      nextTurnPlayerName: nextTurnPlayer ? nextTurnPlayer.name : '',
      nextTurnPlayerAvatar: nextTurnPlayer ? nextTurnPlayer.avatar : '⚽',
      turnOrder: activePlayers.map((p, idx) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        isCurrentTurn: idx === turnIdx
      })),
      currentAnchor: {
        ...currentAnchor,
        availableClubs: availableAnchorClubs
      },
      usedClubs: (room.chainUsedClubs || []).map((cid) => {
        const c = CLUBS.find((cl) => cl.id === cid);
        return { id: cid, name: c?.name || cid, badgeUrl: c?.badgeUrl || null };
      }),
      hintText: room.chainHintText || null,
      history: hist
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
  const twoClubOverlapCount =
    activeClubIds.length >= 2
      ? PLAYERS.filter((p) => p.clubs.filter((cid) => activeClubIds.includes(cid)).length >= 2).length
      : 0;
  const threeClubOverlapCount =
    activeClubIds.length >= 3
      ? PLAYERS.filter((p) => p.clubs.filter((cid) => activeClubIds.includes(cid)).length >= 3).length
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
    twoClubOverlapCount,
    threeClubOverlapCount,
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
      hasSubmitted:
        room.settings.gameMode === 'career_path'
          ? !!(room.submissions[p.id] && room.submissions[p.id].isCorrect)
          : !!room.submissions[p.id],
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
  if (room.untimedBotInterval) {
    clearInterval(room.untimedBotInterval);
    room.untimedBotInterval = null;
  }
  if (room.chainBotTimeout) {
    clearTimeout(room.chainBotTimeout);
    room.chainBotTimeout = null;
  }
  if (room.gridBotTimeout) {
    clearTimeout(room.gridBotTimeout);
    room.gridBotTimeout = null;
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
  if (room.botTimeouts) {
    room.botTimeouts.forEach((t) => clearTimeout(t));
  }
  room.botTimeouts = [];
  if (room.untimedBotInterval) {
    clearInterval(room.untimedBotInterval);
    room.untimedBotInterval = null;
  }

  const bots = room.players.filter((p) => p.isBot);
  if (bots.length === 0) return;

  const mode = room.settings.gameMode || 'multi_club_pool';
  const isUntimedMode =
    mode === 'top10_stats' ||
    mode === 'lineup_quiz' ||
    mode === 'footy_grid' ||
    mode === 'connections' ||
    mode === 'who_are_ya_wordle' ||
    mode === 'chain_link';

  if (isUntimedMode) {
    room.untimedBotInterval = setInterval(() => {
      if (room.state !== 'PLAYING') return;
      const activeBots = room.players.filter((p) => p.isBot);
      if (activeBots.length === 0) return;
      const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
      const curMode = room.settings.gameMode;

      if (curMode === 'lineup_quiz') {
        const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
        const unlocked = room.unlockedLineupSlots || {};
        const openSlots = lineup.slots.filter((s) => !unlocked[s.slotId]);
        if (openSlots.length > 0 && Math.random() < 0.75) {
          const pick = openSlots[Math.floor(Math.random() * openSlots.length)];
          handlePlayerSubmission(room, bot.id, pick.playerId, null);
        }
      } else if (curMode === 'top10_stats') {
        const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
        const unlocked = room.unlockedTop10Ranks || {};
        const openItems = list.items.filter((it) => !unlocked[it.rank]);
        if (openItems.length > 0 && Math.random() < 0.75) {
          const pick = openItems[Math.floor(Math.random() * openItems.length)];
          handlePlayerSubmission(room, bot.id, pick.name, null);
        }
      } else if (curMode === 'footy_grid') {
        const grid =
          room.customFootyGrid && room.customFootyGrid.id === room.currentGridId
            ? room.customFootyGrid
            : FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
        const cells = room.gridCells || Array(9).fill(null);
        const openIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !cells[i]);
        if (openIndices.length > 0 && Math.random() < 0.75) {
          const cellIdx = openIndices[Math.floor(Math.random() * openIndices.length)];
          const rIdx = Math.floor(cellIdx / 3);
          const cIdx = cellIdx % 3;
          const usedNames = new Set(cells.filter(Boolean).map((c) => normalizeText(c.playerName)));
          const valid = PLAYERS.filter(
            (p) =>
              !usedNames.has(normalizeText(p.name)) &&
              playerMatchesGridCriteria(p, grid.rows[rIdx]) &&
              playerMatchesGridCriteria(p, grid.cols[cIdx])
          );
          if (valid.length > 0) {
            const pick = valid[Math.floor(Math.random() * valid.length)];
            handlePlayerSubmission(room, bot.id, pick.name, pick.id, { cellIndex: cellIdx });
          }
        }
      } else if (curMode === 'connections') {
        if (!room.connectionsBoard) return;
        const board = room.connectionsBoard;
        const openGroups = board.groups.filter((g) => !g.solved);
        if (openGroups.length > 0 && Math.random() < 0.65) {
          const grp = openGroups[0];
          grp.solved = true;
          grp.revealed = false;
          grp.solvedBy = `${bot.avatar} ${bot.name}`;
          const pts = grp.points || 1;
          bot.score += pts;
          recordPlayerResultStats(bot, true, null, grp.title);
          const rem = board.groups.filter((g) => !g.solved);
          if (rem.length === 1) {
            rem[0].solved = true;
            rem[0].revealed = false;
            rem[0].solvedBy = `${bot.avatar} ${bot.name} (ปิดกระดาน!)`;
            bot.score += rem[0].points;
          }
          broadcastRoom(room.code, 'top10_updated', {
            toastMessage: `🤖 ${bot.name} จับกลุ่มสำเร็จ: "${grp.title}" (+${pts} แต้ม)`
          });
        }
      } else if (curMode === 'who_are_ya_wordle') {
        if (room.wordleSolved || room.wordleRevealed || !room.wordleMysteryPlayer) return;
        const target = room.wordleMysteryPlayer;
        const guessedIds = new Set((room.wordleGuesses || []).map((g) => g.playerId));
        const guessCount = (room.wordleGuesses || []).length;
        const solveChance = guessCount >= 2 ? 0.55 : 0.22;
        if (Math.random() < solveChance) {
          handlePlayerSubmission(room, bot.id, target.name, target.id);
        } else {
          const teammates = PLAYERS.filter(
            (p) => p.id !== target.id && !guessedIds.has(p.id) && p.clubs.some((c) => target.clubs.includes(c))
          );
          const pool = teammates.length > 0 ? teammates : PLAYERS.filter((p) => !guessedIds.has(p.id));
          if (pool.length > 0) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            handlePlayerSubmission(room, bot.id, pick.name, pick.id);
          }
        }
      }
    }, 9500);
    return;
  }

  bots.forEach((bot) => {
    const minMs =
      mode === 'career_path'
        ? Math.max(6000, Math.floor(room.settings.timeLimit * 1000 * 0.62))
        : 2300;
    const maxMs =
      mode === 'career_path'
        ? Math.max(minMs + 1500, Math.floor(room.settings.timeLimit * 1000 * 0.88))
        : Math.max(3600, Math.min(room.settings.timeLimit * 1000 * 0.78, 11000));
    const delayMs = Math.floor(minMs + Math.random() * (maxMs - minMs));

    const timeout = setTimeout(() => {
      if (room.state !== 'PLAYING' || room.submissions[bot.id]) return;

      if (mode === 'club_battle' || mode === 'multi_club_pool') {
        const activeClubIds = (room.pickedClubs || []).map((pc) => pc.clubId);
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
      }
    }, delayMs);

    room.botTimeouts.push(timeout);
  });
}

function getActiveGridTurnPlayer(room) {
  const activePlayers = room.players || [];
  if (activePlayers.length === 0) return null;
  const idx = ((room.gridTurnIndex || 0) % activePlayers.length + activePlayers.length) % activePlayers.length;
  room.gridTurnIndex = idx;
  return activePlayers[idx];
}

function scheduleGridBotTurn(room) {
  if (room.gridBotTimeout) {
    clearTimeout(room.gridBotTimeout);
    room.gridBotTimeout = null;
  }
  if (room.state !== 'PLAYING' || room.settings.gameMode !== 'footy_grid') return;
  const cells = room.gridCells || Array(9).fill(null);
  const openIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !cells[i]);
  if (openIndices.length === 0) return;

  const turnPlayer = getActiveGridTurnPlayer(room);
  if (!turnPlayer || !turnPlayer.isBot) return;

  const delayMs = 2400 + Math.floor(Math.random() * 1600);
  room.gridBotTimeout = setTimeout(() => {
    if (room.state !== 'PLAYING' || room.settings.gameMode !== 'footy_grid') return;
    const currentTurn = getActiveGridTurnPlayer(room);
    if (!currentTurn || currentTurn.id !== turnPlayer.id) return;

    const grid =
      room.customFootyGrid && room.customFootyGrid.id === room.currentGridId
        ? room.customFootyGrid
        : FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
    const curCells = room.gridCells || Array(9).fill(null);
    const curOpen = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !curCells[i]);
    if (curOpen.length === 0) return;

    const cellIdx = curOpen[Math.floor(Math.random() * curOpen.length)];
    const rIdx = Math.floor(cellIdx / 3);
    const cIdx = cellIdx % 3;
    const usedNames = new Set(curCells.filter(Boolean).map((c) => normalizeText(c.playerName)));
    const valid = PLAYERS.filter(
      (p) =>
        !usedNames.has(normalizeText(p.name)) &&
        playerMatchesGridCriteria(p, grid.rows[rIdx]) &&
        playerMatchesGridCriteria(p, grid.cols[cIdx])
    );
    if (valid.length > 0) {
      const pick = valid[Math.floor(Math.random() * valid.length)];
      handlePlayerSubmission(room, turnPlayer.id, pick.name, pick.id, { cellIndex: cellIdx });
    } else {
      room.gridTurnIndex = ((room.gridTurnIndex || 0) + 1) % room.players.length;
      broadcastRoom(room.code, 'top10_updated');
      scheduleGridBotTurn(room);
    }
  }, delayMs);
}

function getActiveChainTurnPlayer(room) {
  const activePlayers = room.players || [];
  if (activePlayers.length === 0) return null;
  const idx = ((room.chainTurnIndex || 0) % activePlayers.length + activePlayers.length) % activePlayers.length;
  room.chainTurnIndex = idx;
  return activePlayers[idx];
}

function scheduleChainBotTurn(room) {
  if (room.chainBotTimeout) {
    clearTimeout(room.chainBotTimeout);
    room.chainBotTimeout = null;
  }
  if (room.state !== 'PLAYING' || room.settings.gameMode !== 'chain_link') return;
  const turnPlayer = getActiveChainTurnPlayer(room);
  if (!turnPlayer || !turnPlayer.isBot) return;

  const delayMs = 2600 + Math.floor(Math.random() * 1800);
  room.chainBotTimeout = setTimeout(() => {
    if (room.state !== 'PLAYING' || room.settings.gameMode !== 'chain_link') return;
    const currentTurn = getActiveChainTurnPlayer(room);
    if (!currentTurn || currentTurn.id !== turnPlayer.id) return;

    const hist = room.chainLinkHistory || [];
    if (hist.length === 0) return;
    const anchor = hist[hist.length - 1];
    const anchorPlayer = PLAYERS.find((p) => p.id === anchor.playerId);
    if (!anchorPlayer) return;
    const usedPlayerIds = new Set(hist.map((h) => h.playerId));
    const usedClubIds = new Set(room.chainUsedClubs || []);
    const availClubs = (anchorPlayer.clubs || []).filter((cid) => !usedClubIds.has(cid));
    const validNext = PLAYERS.filter(
      (p) =>
        !usedPlayerIds.has(p.id) &&
        p.clubs.length >= 2 &&
        p.clubs.some((cid) => availClubs.includes(cid))
    );
    if (validNext.length > 0 && Math.random() < 0.85) {
      const pick = validNext[Math.floor(Math.random() * validNext.length)];
      handlePlayerSubmission(room, turnPlayer.id, pick.name, pick.id);
    }
  }, delayMs);
}

function handleChainTurnTimeout(room) {
  if (room.state !== 'PLAYING' || room.settings.gameMode !== 'chain_link') return;
  const turnPlayer = getActiveChainTurnPlayer(room);
  const oldChainLen = (room.chainLinkHistory || []).length;

  if (turnPlayer) {
    recordPlayerResultStats(turnPlayer, false, null, null);
  }

  let trapBonusMsg = '';
  if (room.lastChainMoverId && (!turnPlayer || room.lastChainMoverId !== turnPlayer.id)) {
    const prevMover = (room.players || []).find((p) => p.id === room.lastChainMoverId);
    if (prevMover) {
      prevMover.score += 1;
      trapBonusMsg = ` • 🎯 ${prevMover.name} รับโบนัสส่งไม้ต่อชนะ +1 แต้ม!`;
    }
  }

  // Start a fresh chain and pass the turn to the next player!
  const starter = pickChainStarterPlayer(room);
  room.chainLinkHistory = [
    {
      step: 1,
      playerId: starter.id,
      playerName: starter.name,
      flag: starter.flag,
      flagUrl: starter.flagUrl || getFlagUrlFromEmoji(starter.flag),
      photoUrl: starter.photoUrl || null,
      position: starter.position,
      viaClubId: null,
      viaClubName: 'จุดเริ่มต้นลูกโซ่ใหม่ (Starter)',
      viaClubBadgeUrl: null,
      byPlayerName: '🎲 ระบบสุ่มเริ่มโซ่ใหม่',
      pointsEarned: 0
    }
  ];
  room.chainUsedClubs = [];
  room.chainHintText = null;
  room.lastChainMoverId = null;

  if ((room.players || []).length > 0) {
    room.chainTurnIndex = ((room.chainTurnIndex || 0) + 1) % room.players.length;
  }
  const nextTurnPlayer = getActiveChainTurnPlayer(room);

  room.waveStartTime = Date.now();
  room.timeLeft = room.settings.timeLimit || 15;

  broadcastRoom(room.code, 'top10_updated', {
    toastMessage: `💥 หมดเวลา! ${turnPlayer ? turnPlayer.name : 'ผู้เล่น'} ต่อโซ่ไม่ทัน โซ่ขาดที่ ${oldChainLen} คน!${trapBonusMsg} ➔ เริ่มโซ่ใหม่ ตาของ ${nextTurnPlayer ? nextTurnPlayer.name : 'คนถัดไป'}!`
  });

  scheduleChainBotTurn(room);
}

function startWave(room) {
  clearRoomTimers(room);
  room.state = 'PLAYING';
  room.submissions = {};
  room.lastWaveResults = [];
  room.waveStartTime = Date.now();
  const mode = room.settings.gameMode || 'multi_club_pool';
  const isUntimedMode =
    mode === 'top10_stats' ||
    mode === 'lineup_quiz' ||
    mode === 'footy_grid' ||
    mode === 'connections' ||
    mode === 'who_are_ya_wordle';
  room.timeLeft = isUntimedMode ? 0 : room.settings.timeLimit;
  room.totalWavesPlayed = (room.totalWavesPlayed || 0) + 1;

  broadcastRoom(room.code, 'wave_started');
  if (mode === 'chain_link') {
    scheduleChainBotTurn(room);
  } else if (mode === 'footy_grid') {
    scheduleGridBotTurn(room);
  } else {
    scheduleBotActions(room);
  }

  if (!isUntimedMode) {
    room.timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - room.waveStartTime) / 1000);
      const remaining = Math.max(0, room.settings.timeLimit - elapsedSec);
      room.timeLeft = remaining;

      broadcastRoom(room.code, 'timer_tick', { timeLeft: remaining });

      if (remaining <= 0) {
        if (room.settings.gameMode === 'chain_link') {
          handleChainTurnTimeout(room);
        } else {
          finishWave(room);
        }
      }
    }, 250);
  }
}

function handlePlayerSubmission(room, playerId, rawInput, selectedPlayerId, extra = {}) {
  if (room.state !== 'PLAYING') return false;
  const mode = room.settings.gameMode || 'multi_club_pool';
  const cleanInput = (rawInput || '').toString().trim();
  const player = room.players.find((p) => p.id === playerId);

  // Continuous untimed mode for Mode 2 (Guess the Lineup - Missing 11)
  if (mode === 'lineup_quiz') {
    if (!cleanInput) return { ok: false, top10Feedback: { correct: false, message: 'กรุณาพิมพ์ชื่อนักเตะก่อนกดส่ง' } };
    const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
    if (!room.unlockedLineupSlots) room.unlockedLineupSlots = {};

    const matchedSlots = lineup.slots.filter((s) => matchesNameOrAlias(cleanInput, s.playerId, s.aliases));
    if (matchedSlots.length === 0) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ "${cleanInput}" ไม่ได้อยู่ใน 11 ตัวจริงของแมตช์นี้ ลองทายคนอื่นต่อได้เลย!`
        }
      };
    }

    const unrevealedSlot = matchedSlots.find((s) => !room.unlockedLineupSlots[s.slotId]) || matchedSlots[0];
    if (room.unlockedLineupSlots[unrevealedSlot.slotId]) {
      const prevOwner = room.unlockedLineupSlots[unrevealedSlot.slotId].answeredBy;
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ ${unrevealedSlot.playerId} ถูกเปิดไปแล้ว (${prevOwner})`
        }
      };
    }

    const knownPlayer = findPlayerByInput(unrevealedSlot.playerId, selectedPlayerId);
    const slotPhoto = unrevealedSlot.photoUrl || knownPlayer?.photoUrl || null;
    const rawHintVal = room.hintedLineupSlots && room.hintedLineupSlots[unrevealedSlot.slotId];
    const hintLevel = typeof rawHintVal === 'number' ? rawHintVal : rawHintVal ? 3 : 0;
    const basePts = hintLevel === 0 ? 3 : hintLevel === 1 ? 2 : 1;
    const totalUnlockedAfter = Object.keys(room.unlockedLineupSlots).length + 1;
    const finalSlotBonus = totalUnlockedAfter === lineup.slots.length ? 1 : 0;
    const pts = basePts + finalSlotBonus;

    room.unlockedLineupSlots[unrevealedSlot.slotId] = {
      answeredBy: player ? player.name : 'ผู้เล่น',
      playerId: unrevealedSlot.playerId,
      revealed: false,
      pointsEarned: pts,
      photoUrl: slotPhoto
    };

    if (player) {
      player.score += pts;
      recordPlayerResultStats(player, true, null, unrevealedSlot.playerId);
    }

    if (!slotPhoto) {
      getPlayerPhotoByName(unrevealedSlot.playerId).then((photo) => {
        if (photo && room.unlockedLineupSlots && room.unlockedLineupSlots[unrevealedSlot.slotId]) {
          room.unlockedLineupSlots[unrevealedSlot.slotId].photoUrl = photo;
          broadcastRoom(room.code, 'top10_updated');
        }
      });
    }

    const bonusText = finalSlotBonus > 0 ? ' (🎉 โบนัสปิดผังคนที่ 11 +1 แต้ม!)' : '';
    broadcastRoom(room.code, 'top10_updated', {
      toastMessage: `🎉 ${player ? player.name : 'ผู้เล่น'} เปิดตำแหน่ง ${unrevealedSlot.pos} #${unrevealedSlot.number}: ${unrevealedSlot.playerId} (+${pts} คะแนน${bonusText})`
    });

    return {
      ok: true,
      top10Feedback: {
        correct: true,
        message: `✅ ถูกต้อง! ${unrevealedSlot.playerId} (${unrevealedSlot.pos} #${unrevealedSlot.number}) +${pts} คะแนน${bonusText}`
      }
    };
  }

  // Continuous untimed mode for Mode 3 (Top 10 Stats): anyone can answer all 10 ranks!
  if (mode === 'top10_stats') {
    if (!cleanInput) return { ok: false, feedback: 'กรุณาพิมพ์ชื่อนักเตะก่อนกดส่ง' };
    const list = TOP10_LISTS.find((l) => l.id === room.currentTop10Id) || TOP10_LISTS[0];
    if (!room.unlockedTop10Ranks) room.unlockedTop10Ranks = {};

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
    const isHinted = !!(room.hintedTop10Ranks && room.hintedTop10Ranks[matchedItem.rank]);
    const baseRankPts = matchedItem.rank >= 8 ? 3 : matchedItem.rank >= 4 ? 2 : 1;
    const pts = isHinted ? 1 : baseRankPts;

    room.unlockedTop10Ranks[matchedItem.rank] = {
      answeredBy: player ? player.name : 'ผู้เล่น',
      playerId: player ? player.id : null,
      revealed: false,
      pointsEarned: pts,
      photoUrl: itemPhoto
    };

    if (player) {
      player.score += pts;
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
      toastMessage: `🎉 ${player ? player.name : 'ผู้เล่น'} ตอบถูก! อันดับ #${matchedItem.rank}: ${matchedItem.name} (+${pts} คะแนน)`
    });

    return {
      ok: true,
      top10Feedback: {
        correct: true,
        rank: matchedItem.rank,
        name: matchedItem.name,
        message: `✅ ถูกต้อง! อันดับ #${matchedItem.rank}: ${matchedItem.name} (+${pts} คะแนน)`
      }
    };
  }

  // Turn-Based XO & Bingo Bonus mode for Mode 6 (Footy Tic-Tac-Toe 3x3 Grid)
  if (mode === 'footy_grid') {
    const currentTurnPlayer = getActiveGridTurnPlayer(room);
    if ((room.players || []).length > 1 && currentTurnPlayer && player && player.id !== currentTurnPlayer.id) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⏳ ยังไม่ถึงตาของคุณวาง XO! ตอนนี้เป็นตาของ ${currentTurnPlayer.avatar} ${currentTurnPlayer.name}`
        }
      };
    }

    const grid = room.customFootyGrid || FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
    if (!room.gridCells) room.gridCells = Array(9).fill(null);
    const cellIdx = Math.max(0, Math.min(8, extra.cellIndex || 0));
    const rIdx = Math.floor(cellIdx / 3);
    const cIdx = cellIdx % 3;
    const rowCrit = grid.rows[rIdx];
    const colCrit = grid.cols[cIdx];

    if (room.gridCells[cellIdx]) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ ช่อง [${rowCrit.label} x ${colCrit.label}] ถูกยึดไปแล้ว คลิกเลือกช่องว่างอื่นได้เลย!`
        }
      };
    }

    const footballer = findPlayerByInput(cleanInput, selectedPlayerId);
    if (!footballer) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ ไม่พบชื่อนักเตะ "${cleanInput}" ในฐานข้อมูล`
        }
      };
    }

    const alreadyUsedInGrid = room.gridCells.some(
      (c) => c && normalizeText(c.playerName) === normalizeText(footballer.name)
    );
    if (alreadyUsedInGrid) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ ${footballer.name} ถูกใช้ในช่องอื่นของตารางนี้ไปแล้ว ห้ามใช้ชื่อซ้ำในตารางเดียวกัน!`
        }
      };
    }

    if (!playerMatchesGridCriteria(footballer, rowCrit) || !playerMatchesGridCriteria(footballer, colCrit)) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ ${footballer.name} ไม่ตรงเงื่อนไขช่อง [${rowCrit.label} x ${colCrit.label}]`
        }
      };
    }

    const possibleForCell = PLAYERS.filter(
      (p) => playerMatchesGridCriteria(p, rowCrit) && playerMatchesGridCriteria(p, colCrit)
    ).length;
    const isHintedCell = !!(room.hintedGridCells && room.hintedGridCells[cellIdx]);
    const isRareCell = possibleForCell <= 5;
    const baseCellPts = isHintedCell ? 1 : isRareCell ? 3 : 2;

    room.gridCells[cellIdx] = {
      ownerId: player ? player.id : 'p',
      ownerName: player ? player.name : 'ผู้เล่น',
      ownerAvatar: player ? player.avatar : '⚽',
      playerName: footballer.name,
      playerFlag: footballer.flag,
      flagUrl: footballer.flagUrl || getFlagUrlFromEmoji(footballer.flag),
      photoUrl: footballer.photoUrl || null
    };

    if (!footballer.photoUrl) {
      getPlayerPhotoByName(footballer.name).then((photo) => {
        if (photo && room.gridCells && room.gridCells[cellIdx]) {
          room.gridCells[cellIdx].photoUrl = photo;
          broadcastRoom(room.code, 'top10_updated');
        }
      });
    }

    if (!Array.isArray(room.awardedBingoLines)) room.awardedBingoLines = [];
    const completedLines = player ? getGridBingoLines(room.gridCells, player.id) : [];
    const newBingoLines = completedLines.filter((lineKey) => {
      const token = `${player.id}:${lineKey}`;
      if (!room.awardedBingoLines.includes(token)) {
        room.awardedBingoLines.push(token);
        return true;
      }
      return false;
    });
    const gotBingo = newBingoLines.length > 0;
    const bingoBonus = newBingoLines.length * 3;
    const pts = baseCellPts + bingoBonus;
    room.gridCells[cellIdx].pointsEarned = pts;

    if (player) {
      player.score += pts;
      recordPlayerResultStats(player, true, null, footballer.name);
    }

    if ((room.players || []).length > 0) {
      room.gridTurnIndex = ((room.gridTurnIndex || 0) + 1) % room.players.length;
    }
    const nextTurnPlayer = getActiveGridTurnPlayer(room);
    const hasOpenCells = room.gridCells.some((c) => !c);
    const nextTurnTxt =
      hasOpenCells && (room.players || []).length > 1 && nextTurnPlayer
        ? ` ➔ 🟢 ตาต่อไป: ${nextTurnPlayer.avatar} ${nextTurnPlayer.name}!`
        : '';

    const rareTag = !isHintedCell && isRareCell ? ' 💎ช่องหายาก!' : '';
    const msg = `🎉 ${player ? player.name : 'ผู้เล่น'} ยึดช่อง [${rowCrit.label} x ${colCrit.label}] ด้วย ${footballer.name}${rareTag} (+${pts} แต้ม${gotBingo ? ` 🔥BINGO +${bingoBonus}!` : ''})${nextTurnTxt}`;
    broadcastRoom(room.code, 'top10_updated', { toastMessage: msg });

    if (hasOpenCells) {
      scheduleGridBotTurn(room);
    }

    return {
      ok: true,
      top10Feedback: {
        correct: true,
        message: `✅ ยึดช่องสำเร็จ! ${footballer.name}${rareTag} (+${pts} คะแนน${gotBingo ? ` รวมโบนัส BINGO +${bingoBonus}!` : ''})${nextTurnTxt}`
      }
    };
  }

  // Continuous untimed mode for Mode 8 (Who Are Ya? Blurred Photo + Wordle Matrix)
  if (mode === 'who_are_ya_wordle') {
    if (!cleanInput) {
      return {
        ok: false,
        top10Feedback: { correct: false, message: 'กรุณาพิมพ์ชื่อนักเตะก่อนกดส่ง' }
      };
    }
    if (!room.wordleMysteryPlayer) {
      room.wordleMysteryPlayer = pickMysteryWordlePlayer(room);
    }
    if (room.wordleSolved || room.wordleRevealed) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ ข้อนี้ถูกเปิดเฉลยไปแล้ว (${room.wordleMysteryPlayer.name}) กดปุ่ม "🔄 สุ่มนักเตะคนต่อไป" ได้เลย!`
        }
      };
    }

    const guessedPlayer = findPlayerByInput(cleanInput, selectedPlayerId);
    if (!guessedPlayer) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ ไม่พบชื่อนักเตะ "${cleanInput}" ในฐานข้อมูล 5 ลีกใหญ่`
        }
      };
    }

    if (!room.wordleGuesses) room.wordleGuesses = [];
    if (room.wordleGuesses.some((g) => g.playerId === guessedPlayer.id)) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ ${guessedPlayer.name} ถูกทายไปแล้วในข้อนี้ ลองทายคนอื่นดู!`
        }
      };
    }

    const target = room.wordleMysteryPlayer;
    const isCorrect = guessedPlayer.id === target.id || normalizeText(guessedPlayer.name) === normalizeText(target.name);

    const targetPrimaryClubObj = CLUBS.find((c) => c.id === target.clubs[0]);
    const guessPrimaryClubObj = CLUBS.find((c) => c.id === guessedPlayer.clubs[0]);

    const natMatch = guessedPlayer.flag === target.flag ? 'exact' : 'wrong';
    const posMatch = guessedPlayer.position === target.position ? 'exact' : 'wrong';

    const targetLeagues = new Set(target.clubs.map((cid) => CLUBS.find((c) => c.id === cid)?.league).filter(Boolean));
    const guessLeagues = new Set(guessedPlayer.clubs.map((cid) => CLUBS.find((c) => c.id === cid)?.league).filter(Boolean));
    const samePrimaryLeague =
      targetPrimaryClubObj && guessPrimaryClubObj && targetPrimaryClubObj.league === guessPrimaryClubObj.league;
    const anySharedLeague = [...guessLeagues].some((lg) => targetLeagues.has(lg));
    const leagueMatch = samePrimaryLeague ? 'exact' : anySharedLeague ? 'partial' : 'wrong';

    const sharedClubs = guessedPlayer.clubs.filter((cid) => target.clubs.includes(cid));
    const samePrimaryClub = guessedPlayer.clubs[0] && guessedPlayer.clubs[0] === target.clubs[0];
    const clubMatch = isCorrect || samePrimaryClub ? 'exact' : sharedClubs.length > 0 ? 'partial' : 'wrong';
    const sharedClubNames = sharedClubs.map((cid) => CLUBS.find((c) => c.id === cid)?.name || cid);

    const hintStep = room.wordleHintStep || 0;
    const effectiveStep = Math.min(4, hintStep + Math.floor(room.wordleGuesses.length / 2));
    const pts = isCorrect ? Math.max(1, 4 - effectiveStep) : 0;

    room.wordleGuesses.unshift({
      guessNumber: room.wordleGuesses.length + 1,
      byPlayerName: player ? player.name : 'ผู้เล่น',
      byPlayerAvatar: player ? player.avatar : '⚽',
      playerId: guessedPlayer.id,
      playerName: guessedPlayer.name,
      flag: guessedPlayer.flag,
      flagUrl: guessedPlayer.flagUrl || getFlagUrlFromEmoji(guessedPlayer.flag),
      photoUrl: guessedPlayer.photoUrl || null,
      position: guessedPlayer.position,
      clubName: guessPrimaryClubObj?.name || guessedPlayer.clubs[0] || '-',
      clubBadgeUrl: guessPrimaryClubObj?.badgeUrl || null,
      leagueName: guessPrimaryClubObj?.leagueName || guessPrimaryClubObj?.league || '-',
      natMatch,
      leagueMatch,
      clubMatch,
      posMatch,
      sharedClubNames,
      isCorrect
    });

    if (isCorrect) {
      room.wordleSolved = true;
      room.wordleSolvedBy = player ? player.name : 'ผู้เล่น';
      room.wordlePointsAwarded = pts;
      if (player) {
        player.score += pts;
        recordPlayerResultStats(player, true, null, target.name);
      }
      broadcastRoom(room.code, 'top10_updated', {
        toastMessage: `🎉 ${player ? player.name : 'ผู้เล่น'} ทายถูกรูปปริศนา! เขาคือ ${target.name} (+${pts} คะแนน)`
      });
      return {
        ok: true,
        top10Feedback: {
          correct: true,
          message: `✅ ถูกต้อง! นักเตะปริศนาคือ ${target.name} (+${pts} คะแนน)`
        }
      };
    }

    broadcastRoom(room.code, 'top10_updated');
    return {
      ok: true,
      top10Feedback: {
        correct: false,
        message: `🔍 "${guessedPlayer.name}" ยังไม่ใช่! ดูแถบสีคำใบ้ (🟢ตรง / 🟡เคยอยู่สโมสรเดียวกัน) ด้านล่างได้เลย`
      }
    };
  }

  // Turn-Based mode for Mode 9 (Chain Link: Player -> Shared Club -> Teammate)
  if (mode === 'chain_link') {
    const currentTurnPlayer = getActiveChainTurnPlayer(room);
    if (currentTurnPlayer && player && player.id !== currentTurnPlayer.id) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⏳ ยังไม่ถึงตาของคุณ! ตอนนี้เป็นตาของ ${currentTurnPlayer.avatar} ${currentTurnPlayer.name}`
        }
      };
    }

    if (!cleanInput) {
      return {
        ok: false,
        top10Feedback: { correct: false, message: 'กรุณาพิมพ์ชื่อนักเตะก่อนกดส่ง' }
      };
    }
    if (!room.chainLinkHistory || room.chainLinkHistory.length === 0) {
      serializeModeDataForClients(room);
    }
    const hist = room.chainLinkHistory;
    const anchor = hist[hist.length - 1];
    const anchorPlayer = PLAYERS.find((p) => p.id === anchor.playerId) || PLAYERS[0];
    const guessedPlayer = findPlayerByInput(cleanInput, selectedPlayerId);

    if (!guessedPlayer) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ ไม่พบชื่อนักเตะ "${cleanInput}" ในฐานข้อมูล`
        }
      };
    }

    if (hist.some((h) => h.playerId === guessedPlayer.id)) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ ${guessedPlayer.name} ถูกใช้ในลูกโซ่รอบนี้ไปแล้ว ห้ามใช้ชื่อนักเตะซ้ำ!`
        }
      };
    }

    const sharedClubs = (guessedPlayer.clubs || []).filter((cid) => (anchorPlayer.clubs || []).includes(cid));
    if (sharedClubs.length === 0) {
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `❌ ${guessedPlayer.name} ไม่เคยอยู่สโมสรเดียวกับ ${anchorPlayer.name}!`
        }
      };
    }

    const usedClubSet = new Set(room.chainUsedClubs || []);
    const unusedSharedClubs = sharedClubs.filter((cid) => !usedClubSet.has(cid));
    if (unusedSharedClubs.length === 0) {
      const usedNames = sharedClubs.map((cid) => CLUBS.find((c) => c.id === cid)?.name || cid).join(', ');
      return {
        ok: true,
        top10Feedback: {
          correct: false,
          message: `⚠️ สโมสรเชื่อมโยง (${usedNames}) ถูกใช้เชื่อมในโซ่นี้ไปแล้ว ต้องเชื่อมผ่านสโมสรอื่นที่ยังไม่ถูกใช้!`
        }
      };
    }

    const chosenBridgeClubId = unusedSharedClubs[0];
    const bridgeClubObj = CLUBS.find((c) => c.id === chosenBridgeClubId);
    if (!room.chainUsedClubs) room.chainUsedClubs = [];
    room.chainUsedClubs.push(chosenBridgeClubId);
    room.chainHintText = null;

    const newStepNum = hist.length + 1;
    const milestoneBonus = newStepNum > 1 && (newStepNum - 1) % 5 === 0 ? 1 : 0;
    const pts = 2 + milestoneBonus;

    hist.push({
      step: newStepNum,
      playerId: guessedPlayer.id,
      playerName: guessedPlayer.name,
      flag: guessedPlayer.flag,
      flagUrl: guessedPlayer.flagUrl || getFlagUrlFromEmoji(guessedPlayer.flag),
      photoUrl: guessedPlayer.photoUrl || null,
      position: guessedPlayer.position,
      viaClubId: chosenBridgeClubId,
      viaClubName: bridgeClubObj?.name || chosenBridgeClubId,
      viaClubBadgeUrl: bridgeClubObj?.badgeUrl || null,
      byPlayerName: player ? player.name : 'ผู้เล่น',
      pointsEarned: pts
    });

    if (player) {
      player.score += pts;
      recordPlayerResultStats(player, true, null, guessedPlayer.name);
      room.lastChainMoverId = player.id;
    }

    // Advance turn to the next player & reset per-turn countdown clock!
    if ((room.players || []).length > 0) {
      room.chainTurnIndex = ((room.chainTurnIndex || 0) + 1) % room.players.length;
    }
    const nextTurnPlayer = getActiveChainTurnPlayer(room);
    room.waveStartTime = Date.now();
    room.timeLeft = room.settings.timeLimit || 15;

    if (!guessedPlayer.photoUrl) {
      getPlayerPhotoByName(guessedPlayer.name).then((photo) => {
        if (photo) {
          guessedPlayer.photoUrl = photo;
          const node = (room.chainLinkHistory || []).find((h) => h.playerId === guessedPlayer.id);
          if (node) node.photoUrl = photo;
          broadcastRoom(room.code, 'top10_updated');
        }
      });
    }

    // Check if the newly added player has any remaining unused clubs with available teammates; if dead-end, auto-pivot to a multi-club teammate!
    const usedIdsNow = new Set(hist.map((h) => h.playerId));
    const usedClubsNow = new Set(room.chainUsedClubs || []);
    const remainingClubsOfGuessed = (guessedPlayer.clubs || []).filter((cid) => !usedClubsNow.has(cid));
    const hasNextValidTeammate = remainingClubsOfGuessed.some((cid) =>
      PLAYERS.some((p) => !usedIdsNow.has(p.id) && p.clubs.includes(cid))
    );

    let autoPivotMsg = '';
    if (!hasNextValidTeammate) {
      // Find a multi-club teammate from the same bridge club (or starter pool) who has unused clubs to keep the chain alive!
      const pivotCandidates = PLAYERS.filter(
        (p) =>
          !usedIdsNow.has(p.id) &&
          p.clubs.includes(chosenBridgeClubId) &&
          p.clubs.some((cid) => !usedClubsNow.has(cid))
      );
      const pivotPlayer =
        pivotCandidates.length > 0
          ? pivotCandidates[Math.floor(Math.random() * pivotCandidates.length)]
          : pickChainStarterPlayer(room);
      if (pivotPlayer) {
        hist.push({
          step: hist.length + 1,
          playerId: pivotPlayer.id,
          playerName: pivotPlayer.name,
          flag: pivotPlayer.flag,
          flagUrl: pivotPlayer.flagUrl || getFlagUrlFromEmoji(pivotPlayer.flag),
          photoUrl: pivotPlayer.photoUrl || null,
          position: pivotPlayer.position,
          viaClubId: chosenBridgeClubId,
          viaClubName: `${bridgeClubObj?.name || chosenBridgeClubId} (🔄 ระบบช่วยต่อสายพานกันทางตัน)`,
          viaClubBadgeUrl: bridgeClubObj?.badgeUrl || null,
          byPlayerName: '🔄 ระบบต่อสายพานอัตโนมัติ',
          pointsEarned: 0
        });
        autoPivotMsg = ` • 🔄 เนื่องจาก ${guessedPlayer.name} ไม่มีสโมสรอื่นไปต่อ ระบบจึงดึงเพื่อนร่วมทีม ${pivotPlayer.name} มาต่อสายพานให้อัตโนมัติ!`;
      }
    }

    const bonusTxt = milestoneBonus > 0 ? ' (🔥 โบนัสโซ่ยาวครบ 5 ข้อ +1 แต้ม!)' : '';
    const nextTurnTxt = nextTurnPlayer ? ` ➔ 🟢 ตาต่อไป: ${nextTurnPlayer.avatar} ${nextTurnPlayer.name}!` : '';
    broadcastRoom(room.code, 'top10_updated', {
      toastMessage: `🔗 ${player ? player.name : 'ผู้เล่น'} เชื่อม ${anchorPlayer.name} ➔ [${bridgeClubObj?.name || chosenBridgeClubId}] ➔ ${guessedPlayer.name} (+${pts} แต้ม${bonusTxt})${autoPivotMsg}${nextTurnTxt}`
    });

    scheduleChainBotTurn(room);

    return {
      ok: true,
      top10Feedback: {
        correct: true,
        message: `✅ เชื่อมสำเร็จผ่าน [${bridgeClubObj?.name || chosenBridgeClubId}] ➔ ${guessedPlayer.name} (+${pts} คะแนน${bonusTxt})${nextTurnTxt}`
      }
    };
  }

  // Mode 4: Career Path (First player to answer correctly immediately ends the turn!)
  if (mode === 'career_path') {
    if (!cleanInput) {
      return {
        ok: false,
        top10Feedback: { correct: false, message: 'กรุณาพิมพ์ชื่อนักเตะก่อนกดส่ง' }
      };
    }
    const cp = CAREER_PATHS.find((c) => c.id === room.currentCareerId) || CAREER_PATHS[0];
    const timeTakenMs = Math.max(100, Date.now() - room.waveStartTime);
    const isCorrect = matchesNameOrAlias(cleanInput, cp.answerName, cp.aliases);

    room.submissions[playerId] = {
      playerId,
      rawInput: cleanInput,
      selectedPlayerId: selectedPlayerId || null,
      timeTakenMs,
      timestamp: Date.now(),
      isCorrect
    };

    if (isCorrect) {
      finishWave(room);
      return {
        ok: true,
        top10Feedback: {
          correct: true,
          message: `🎉 ถูกต้อง! เขาคือ ${cp.answerName} — จบเทิร์นทันที!`
        }
      };
    }

    return {
      ok: true,
      top10Feedback: {
        correct: false,
        message: `❌ "${cleanInput}" ยังไม่ใช่คนนี้! ลองทายใหม่ก่อนหมดเวลา!`
      }
    };
  }

  if (room.submissions[playerId]) return false;

  const timeTakenMs = Math.max(100, Date.now() - room.waveStartTime);
  let resolvedPlayerId = selectedPlayerId || null;
  let enrichPromise = Promise.resolve(null);
  if (mode !== 'trivia_quiz') {
    const initialMatch = findPlayerByInput(cleanInput, selectedPlayerId);
    if (initialMatch) {
      resolvedPlayerId = initialMatch.id;
    } else if (cleanInput && cleanInput.length >= 3) {
      enrichPromise = Promise.race([
        enrichPlayerClubHistory(null, cleanInput),
        new Promise((resolve) => setTimeout(() => resolve(null), 1200))
      ]);
    }
  }

  room.submissions[playerId] = {
    playerId,
    rawInput: cleanInput,
    selectedPlayerId: resolvedPlayerId,
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

  const isSingleClubMode = room.settings.gameMode === 'club_battle';
  let fastestSingleClubPlayerId = null;
  let fastestSingleClubTime = Infinity;
  if (isSingleClubMode) {
    resolved.forEach((r) => {
      if (r.status === 'PENDING_DUPLICATE_CHECK' && r.timeTakenMs && r.timeTakenMs < fastestSingleClubTime) {
        const claims = claimedInThisWave.get(r.footballer.id);
        const rule = room.settings.duplicateRule || 'strict_unique';
        const winsClaim = claims.length === 1 || (rule !== 'both_cancel' && claims[0].playerId === r.playerId);
        if (winsClaim) {
          fastestSingleClubTime = r.timeTakenMs;
          fastestSingleClubPlayerId = r.playerId;
        }
      }
    });
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

    const awardClubBattlePoints = (basePts, prefixMsg = '') => {
      const speedBonus = isSingleClubMode && fastestSingleClubPlayerId === res.playerId ? 1 : 0;
      const nextStreak = pl ? (pl.streak || 0) + 1 : 1;
      const streakBonus = isSingleClubMode && nextStreak >= 3 && nextStreak % 3 === 0 ? 1 : 0;
      const totalPts = basePts + speedBonus + streakBonus;

      res.status = 'CORRECT';
      res.pointsEarned = totalPts;
      const bonusTags = [];
      if (speedBonus > 0) bonusTags.push('⚡ไวสุดในรอบ +1');
      if (streakBonus > 0) bonusTags.push(`🔥คอมโบ ${nextStreak} รอบติด +1`);
      const bonusText = bonusTags.length > 0 ? ` (${bonusTags.join(' • ')})` : '';

      res.message = isSingleClubMode
        ? `${prefixMsg}ถูกต้อง! เคยอยู่ ${clubsText}${bonusText} ➔ รับ +${totalPts} คะแนน!`
        : `${prefixMsg}เคยอยู่ ${matchedCount} สโมสรบนกระดาน (${clubsText}) ➔ รับ +${totalPts} คะแนน!`;

      if (pl) {
        pl.score += totalPts;
        recordPlayerResultStats(pl, true, res.timeTakenMs, res.footballer.name);
      }
    };

    if (claims.length === 1) {
      awardClubBattlePoints(matchedCount);
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
        awardClubBattlePoints(matchedCount);
        res.status = isFastest ? 'CORRECT' : 'DUPLICATE_PARTIAL';
      } else {
        if (isFastest) {
          awardClubBattlePoints(matchedCount, 'ไวกว่า! ');
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

// MODE 4: CAREER PATH (WHO AM I? - First Correct Answer Immediately Ends Turn)
function finishCareerPathWave(room) {
  const cp = CAREER_PATHS.find((c) => c.id === room.currentCareerId) || CAREER_PATHS[0];
  const ansPlayer = findPlayerByInput(cp.answerName, null);
  const ansPhoto = ansPlayer?.photoUrl || room.currentCareerPhotoUrl || null;
  const ansFlagUrl = getFlagUrlFromEmoji(cp.flag);

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  const winningEntry = subs.find(
    ({ sub }) => sub && sub.rawInput && matchesNameOrAlias(sub.rawInput, cp.answerName, cp.aliases)
  );
  const winnerName = winningEntry ? winningEntry.player.name : null;
  let firstCorrectAwarded = false;

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
        message: winnerName
          ? `⚡ ${winnerName} ชิงตอบถูกไปก่อน! คำตอบคือ ${cp.flag} ${cp.answerName}`
          : `หมดเวลา! คำตอบที่ถูกคือ ${cp.flag} ${cp.answerName}`
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
        message: winnerName
          ? `ผิด! (${winnerName} ชิงตอบถูกไปก่อน: ${cp.flag} ${cp.answerName})`
          : `ผิด! นักเตะปริศนาคนนี้คือ ${cp.flag} ${cp.answerName}`
      };
    }

    const basePts = room.careerHintOpened ? 1 : 3;
    const speedBonus = !firstCorrectAwarded ? 1 : 0;
    firstCorrectAwarded = true;
    const pts = basePts + speedBonus;

    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, cp.answerName);

    const modeBonusText = !room.careerHintOpened ? ' (ทายสดไม่ใช้คำใบ้ +3)' : ' (เปิดคำใบ้ +1)';
    const fastBonusText = speedBonus > 0 ? ' + ⚡ตอบถูกคนแรก +1' : '';

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: cp.answerName,
      footballer: { name: cp.answerName, flag: cp.flag, flagUrl: ansFlagUrl, photoUrl: ansPhoto, position: cp.position },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `ทายถูกคนแรก จบเทิร์นทันที! เขาคือ ${cp.answerName}${modeBonusText}${fastBonusText} ➔ รับ +${pts} คะแนน`
    };
  });

  results.sort((a, b) => b.pointsEarned - a.pointsEarned || (a.timeTakenMs || 99999) - (b.timeTakenMs || 99999));
  room.lastWaveResults = results;
}

// MODE 5: 4-CHOICE FOOTBALL TRIVIA QUIZ
function finishTriviaWave(room) {
  const tr = TRIVIA_QUESTIONS.find((q) => q.id === room.currentTriviaId) || TRIVIA_QUESTIONS[0];
  const diff = tr.difficulty || 'medium';
  const baseDiffPts = diff === 'hard' ? 3 : diff === 'medium' ? 2 : 1;
  const diffLabel = diff === 'hard' ? 'ระดับยาก +3' : diff === 'medium' ? 'ระดับปานกลาง +2' : 'ระดับง่าย +1';

  const subs = room.players
    .map((pl) => ({ player: pl, sub: room.submissions[pl.id] || null }))
    .sort((a, b) => (a.sub?.timeTakenMs || 999999) - (b.sub?.timeTakenMs || 999999));

  let firstCorrectAwarded = false;

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

    const speedBonus = !firstCorrectAwarded ? 1 : 0;
    firstCorrectAwarded = true;
    const pts = baseDiffPts + speedBonus;

    player.score += pts;
    recordPlayerResultStats(player, true, sub.timeTakenMs, chosenText);

    const fastTag = speedBonus > 0 ? ' + ⚡มือไวคนแรก +1' : '';

    return {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      rawInput: chosenText,
      footballer: { name: chosenText, flag: '✅', position: `${diffLabel}${fastTag}` },
      status: 'CORRECT',
      pointsEarned: pts,
      timeTakenMs: sub.timeTakenMs,
      message: `ถูกต้อง! (${diffLabel}${fastTag}) ${tr.explanation}`
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

// Pick a smart set of clubs that guarantees rich 2-club and 3-club player overlaps!
function pickSmartClubPool(count) {
  const clubOverlapWeight = new Map();
  for (const p of PLAYERS) {
    if (Array.isArray(p.clubs) && p.clubs.length >= 2) {
      for (const cid of p.clubs) {
        clubOverlapWeight.set(cid, (clubOverlapWeight.get(cid) || 0) + 1);
      }
    }
  }
  const rankedClubs = [...CLUBS]
    .sort((a, b) => (clubOverlapWeight.get(b.id) || 0) - (clubOverlapWeight.get(a.id) || 0))
    .slice(0, 26);
  const sourceClubs = rankedClubs.length >= 10 ? rankedClubs : CLUBS;
  if (count <= 1) {
    return [sourceClubs[Math.floor(Math.random() * sourceClubs.length)]];
  }

  let bestCombo = null;
  let bestScore = -1;

  for (let attempt = 0; attempt < 45; attempt++) {
    const shuffled = [...sourceClubs].sort(() => Math.random() - 0.5);
    const candidate = shuffled.slice(0, count);
    const cids = candidate.map((c) => c.id);
    let twoPlus = 0;
    let threePlus = 0;
    for (const p of PLAYERS) {
      const m = p.clubs.filter((cid) => cids.includes(cid)).length;
      if (m >= 2) twoPlus++;
      if (m >= 3) threePlus++;
    }
    const score = (threePlus > 0 ? 500 : 0) + threePlus * 15 + twoPlus;
    if (score > bestScore) {
      bestScore = score;
      bestCombo = candidate;
      if (threePlus >= 5 && twoPlus >= 22) break;
    }
  }
  return bestCombo || sourceClubs.slice(0, count);
}

// Generate a dynamic 4x4 Football Connections board (4 secret categories of 4 players each)
function generateConnectionsBoard(roundNum, room = null) {
  if (room && !Array.isArray(room.usedConnectionCategoryIds)) {
    room.usedConnectionCategoryIds = [];
  }
  const usedCatSet = new Set(room && room.usedConnectionCategoryIds ? room.usedConnectionCategoryIds : []);

  const clubOverlapWeight = new Map();
  for (const p of PLAYERS) {
    if (Array.isArray(p.clubs) && p.clubs.length >= 2) {
      for (const cid of p.clubs) {
        clubOverlapWeight.set(cid, (clubOverlapWeight.get(cid) || 0) + 1);
      }
    }
  }
  const topClubIds = [...CLUBS]
    .sort((a, b) => (clubOverlapWeight.get(b.id) || 0) - (clubOverlapWeight.get(a.id) || 0))
    .slice(0, 26)
    .map((c) => c.id);

  const flagNames = {
    '🇫🇷': 'ทีมชาติฝรั่งเศส',
    '🇧🇷': 'ทีมชาติบราซิล',
    '🇪🇸': 'ทีมชาติสเปน',
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿': 'ทีมชาติอังกฤษ',
    '🇦🇷': 'ทีมชาติอาร์เจนตินา',
    '🇵🇹': 'ทีมชาติโปรตุเกส',
    '🇩🇪': 'ทีมชาติเยอรมนี',
    '🇮🇹': 'ทีมชาติอิตาลี',
    '🇳🇱': 'ทีมชาติเนเธอร์แลนด์',
    '🇧🇪': 'ทีมชาติเบลเยียม'
  };
  const posNames = {
    FW: 'กองหน้า / ตัวรุก (FW)',
    MF: 'กองกลาง (MF)',
    DF: 'กองหลัง (DF)',
    GK: 'ผู้รักษาประตู (GK)'
  };

  const tier1Pool = []; // Easy (+1 pt): Played for Club X
  const tier2Pool = []; // Medium (+2 pts): Nationality + Position OR Club + Position
  const tier3Pool = []; // Hard (+3 pts): Nationality + Club X
  const tier4Pool = []; // Expert (+4 pts): Played for BOTH Club X and Club Y

  for (const cid of topClubIds.slice(0, 18)) {
    const club = CLUBS.find((c) => c.id === cid);
    if (!club) continue;
    const clubPlayers = PLAYERS.filter((p) => p.clubs.includes(cid));
    if (clubPlayers.length >= 8) {
      tier1Pool.push({
        id: `c1_${cid}`,
        tier: 1,
        points: 1,
        color: '#10b981',
        tierLabel: '🟢 ระดับง่าย (+1 แต้ม)',
        title: `เคยค้าแข้งกับ ${club.name}`,
        clubIds: [cid],
        matches: (p) => p.clubs.includes(cid),
        candidates: clubPlayers
      });
    }
    for (const [posKey, posTitle] of Object.entries(posNames)) {
      const cp = clubPlayers.filter((p) => p.position === posKey);
      if (cp.length >= 5) {
        tier2Pool.push({
          id: `c2_${cid}_${posKey}`,
          tier: 2,
          points: 2,
          color: '#f59e0b',
          tierLabel: '🟡 ระดับปานกลาง (+2 แต้ม)',
          title: `${posTitle} ที่เคยอยู่ ${club.name}`,
          clubIds: [cid],
          matches: (p) => p.clubs.includes(cid) && p.position === posKey,
          candidates: cp
        });
      }
    }
    for (const [flagEmoji, flagLabel] of Object.entries(flagNames)) {
      const fp = clubPlayers.filter((p) => p.flag === flagEmoji);
      if (fp.length >= 4) {
        tier3Pool.push({
          id: `c3_${cid}_${flagEmoji}`,
          tier: 3,
          points: 3,
          color: '#3b82f6',
          tierLabel: '🔵 ระดับยาก (+3 แต้ม)',
          title: `นักเตะ${flagLabel} ที่เคยอยู่ ${club.name}`,
          clubIds: [cid],
          matches: (p) => p.clubs.includes(cid) && p.flag === flagEmoji,
          candidates: fp
        });
      }
    }
  }

  for (let i = 0; i < topClubIds.length; i++) {
    for (let j = i + 1; j < topClubIds.length; j++) {
      const c1 = CLUBS.find((c) => c.id === topClubIds[i]);
      const c2 = CLUBS.find((c) => c.id === topClubIds[j]);
      if (!c1 || !c2) continue;
      const both = PLAYERS.filter((p) => p.clubs.includes(c1.id) && p.clubs.includes(c2.id));
      if (both.length >= 4) {
        tier4Pool.push({
          id: `c4_${c1.id}_${c2.id}`,
          tier: 4,
          points: 4,
          color: '#a855f7',
          tierLabel: '🟣 ระดับแฟนพันธุ์แท้ (+4 แต้ม)',
          title: `เคยค้าแข้งทั้ง ${c1.name} และ ${c2.name}`,
          clubIds: [c1.id, c2.id],
          matches: (p) => p.clubs.includes(c1.id) && p.clubs.includes(c2.id),
          candidates: both
        });
      }
    }
  }

  const pickFromTier = (pool, ignoreUsed) => {
    const fresh = ignoreUsed ? pool : pool.filter((g) => !usedCatSet.has(g.id));
    const list = fresh.length > 0 ? fresh : pool;
    return list[Math.floor(Math.random() * list.length)];
  };

  for (let attempt = 0; attempt < 150; attempt++) {
    const ignoreUsed = attempt >= 90;
    const g4 = pickFromTier(tier4Pool, ignoreUsed);
    const g3 = pickFromTier(tier3Pool, ignoreUsed);
    const g2 = pickFromTier(tier2Pool, ignoreUsed);
    const g1 = pickFromTier(tier1Pool, ignoreUsed);
    const chosenGroups = [g4, g3, g2, g1].filter(Boolean);
    if (chosenGroups.length < 4) continue;

    // Ensure no two groups use the same club ID in their category definition
    const usedCategoryClubs = new Set();
    let clubCollision = false;
    for (const grp of chosenGroups) {
      for (const cid of grp.clubIds || []) {
        if (usedCategoryClubs.has(cid)) {
          clubCollision = true;
          break;
        }
        usedCategoryClubs.add(cid);
      }
      if (clubCollision) break;
    }
    if (clubCollision) continue;

    const usedPlayerIds = new Set();
    const groupsOut = [];
    let ok = true;

    for (const grp of chosenGroups) {
      const otherGroups = chosenGroups.filter((og) => og.id !== grp.id);
      // Strict Disjoint Filter: player must NOT satisfy any of the other 3 groups' rules!
      const strictAvail = [...grp.candidates]
        .filter((p) => !usedPlayerIds.has(p.id) && !otherGroups.some((og) => og.matches && og.matches(p)))
        .sort(() => Math.random() - 0.5);
      const avail =
        strictAvail.length >= 4
          ? strictAvail
          : [...grp.candidates].filter((p) => !usedPlayerIds.has(p.id)).sort(() => Math.random() - 0.5);
      if (avail.length < 4) {
        ok = false;
        break;
      }
      const picked4 = avail.slice(0, 4);
      picked4.forEach((p) => usedPlayerIds.add(p.id));
      groupsOut.push({
        id: grp.id,
        tier: grp.tier,
        points: grp.points,
        color: grp.color,
        tierLabel: grp.tierLabel,
        title: grp.title,
        solved: false,
        solvedBy: null,
        revealed: false,
        playerIds: picked4.map((p) => p.id),
        players: picked4.map((p) => ({
          id: p.id,
          name: p.name,
          flag: p.flag,
          flagUrl: p.flagUrl || getFlagUrlFromEmoji(p.flag),
          photoUrl: p.photoUrl || null,
          position: p.position
        }))
      });
    }

    if (ok && groupsOut.length === 4) {
      if (room && Array.isArray(room.usedConnectionCategoryIds)) {
        groupsOut.forEach((g) => {
          if (!room.usedConnectionCategoryIds.includes(g.id)) {
            room.usedConnectionCategoryIds.push(g.id);
          }
        });
      }
      groupsOut.sort((a, b) => a.tier - b.tier);
      const allTiles = groupsOut
        .flatMap((g) =>
          g.players.map((p) => ({
            ...p,
            groupId: g.id
          }))
        )
        .sort(() => Math.random() - 0.5);

      return {
        id: 'conn_' + Date.now(),
        title: `จับกลุ่ม 16 นักเตะ 4 ความลับ ชุดที่ #${roundNum}`,
        groups: groupsOut,
        tiles: allTiles,
        hintText: null
      };
    }
  }

  return null;
}

// Pre-seeded verified player photos so Mode 8 (Who Are Ya? Wordle) always has real photos even on cold start
const VERIFIED_STAR_PHOTOS = {
  'Cristiano Ronaldo': 'https://www.thesportsdb.com/images/media/player/cutout/a276871718193122.png',
  'Lionel Messi': 'https://www.thesportsdb.com/images/media/player/cutout/r6374r1718191192.png',
  'Kylian Mbappé': 'https://a.espncdn.com/i/headshots/soccer/players/full/231388.png',
  'Erling Haaland': 'https://a.espncdn.com/i/headshots/soccer/players/full/253989.png',
  'Mohamed Salah': 'https://a.espncdn.com/i/headshots/soccer/players/full/173896.png',
  'Kevin De Bruyne': 'https://a.espncdn.com/i/headshots/soccer/players/full/134909.png',
  'Jude Bellingham': 'https://a.espncdn.com/i/headshots/soccer/players/full/291285.png',
  'Harry Kane': 'https://a.espncdn.com/i/headshots/soccer/players/full/142200.png',
  'Robert Lewandowski': 'https://a.espncdn.com/i/headshots/soccer/players/full/125824.png',
  'Luka Modrić': 'https://a.espncdn.com/i/headshots/soccer/players/full/80494.png',
  'Antoine Griezmann': 'https://a.espncdn.com/i/headshots/soccer/players/full/139567.png',
  'Bukayo Saka': 'https://a.espncdn.com/i/headshots/soccer/players/full/280555.png',
  'Bruno Fernandes': 'https://a.espncdn.com/i/headshots/soccer/players/full/182383.png',
  'Cole Palmer': 'https://a.espncdn.com/i/headshots/soccer/players/full/305089.png',
  'Son Heung-min': 'https://a.espncdn.com/i/headshots/soccer/players/full/149945.png',
  'Virgil van Dijk': 'https://a.espncdn.com/i/headshots/soccer/players/full/159512.png',
  'Alisson Becker': 'https://a.espncdn.com/i/headshots/soccer/players/full/194391.png',
  'Thibaut Courtois': 'https://a.espncdn.com/i/headshots/soccer/players/full/134912.png'
};

// Pick a non-repeating mystery player for Mode 8 (Who Are Ya? Blurred Photo + Wordle Attribute Matrix)
function pickMysteryWordlePlayer(roomOrPrevId = null) {
  for (const p of PLAYERS) {
    if (!p.photoUrl && VERIFIED_STAR_PHOTOS[p.name]) {
      p.photoUrl = VERIFIED_STAR_PHOTOS[p.name];
    }
  }
  const roomObj = roomOrPrevId && typeof roomOrPrevId === 'object' ? roomOrPrevId : null;
  const previousId =
    typeof roomOrPrevId === 'string'
      ? roomOrPrevId
      : roomObj && roomObj.wordleMysteryPlayer
        ? roomObj.wordleMysteryPlayer.id
        : null;

  if (roomObj && !Array.isArray(roomObj.usedWordleIds)) {
    roomObj.usedWordleIds = previousId ? [previousId] : [];
  }
  const usedRoomSet = new Set(roomObj ? roomObj.usedWordleIds : previousId ? [previousId] : []);

  const clubOverlapWeight = new Map();
  for (const p of PLAYERS) {
    if (Array.isArray(p.clubs) && p.clubs.length >= 2) {
      for (const cid of p.clubs) {
        clubOverlapWeight.set(cid, (clubOverlapWeight.get(cid) || 0) + 1);
      }
    }
  }
  const famousClubIds = new Set(
    [...CLUBS]
      .sort((a, b) => (clubOverlapWeight.get(b.id) || 0) - (clubOverlapWeight.get(a.id) || 0))
      .slice(0, 24)
      .map((c) => c.id)
  );

  const baseFamous = PLAYERS.filter((p) => p.clubs.some((cid) => famousClubIds.has(cid)));
  const withPhotos = baseFamous.filter((p) => !!p.photoUrl);
  const candidatePool = withPhotos.length >= 10 ? withPhotos : baseFamous;

  let pool = candidatePool.filter((p) => !usedRoomSet.has(p.id) && !globalUsedWordleIds.has(p.id));
  if (pool.length === 0) {
    globalUsedWordleIds.clear();
    if (previousId) globalUsedWordleIds.add(previousId);
    pool = candidatePool.filter((p) => !usedRoomSet.has(p.id));
  }
  if (pool.length === 0) {
    if (roomObj) roomObj.usedWordleIds = previousId ? [previousId] : [];
    pool = candidatePool.filter((p) => p.id !== previousId);
  }

  const shuffled = shuffleArray(pool);
  const chosen = shuffled[0] || candidatePool[0] || PLAYERS[0];
  if (roomObj && chosen) {
    if (!roomObj.usedWordleIds.includes(chosen.id)) roomObj.usedWordleIds.push(chosen.id);
  }
  if (chosen) {
    globalUsedWordleIds.add(chosen.id);
  }
  return chosen;
}

// Pick a well-connected starting player for Mode 9 (Chain Link: Player -> Club -> Teammate) without repeating
const globalUsedChainStarterIds = new Set();

function pickChainStarterPlayer(room = null) {
  const multiClubStars = PLAYERS.filter((p) => Array.isArray(p.clubs) && p.clubs.length >= 3);
  const basePool = multiClubStars.length > 0 ? multiClubStars : PLAYERS;
  if (!room) {
    return basePool[Math.floor(Math.random() * basePool.length)] || PLAYERS[0];
  }
  if (!Array.isArray(room.usedChainStarterIds)) room.usedChainStarterIds = [];
  const usedSet = new Set(room.usedChainStarterIds);

  let pool = basePool.filter((p) => !usedSet.has(p.id) && !globalUsedChainStarterIds.has(p.id));
  if (pool.length === 0) {
    globalUsedChainStarterIds.clear();
    pool = basePool.filter((p) => !usedSet.has(p.id));
  }
  if (pool.length === 0) {
    const lastId = room.usedChainStarterIds[room.usedChainStarterIds.length - 1];
    room.usedChainStarterIds = lastId ? [lastId] : [];
    pool = basePool.filter((p) => p.id !== lastId);
  }
  const shuffled = shuffleArray(pool.length > 0 ? pool : basePool);
  const chosen = shuffled[0] || basePool[0] || PLAYERS[0];
  if (chosen && !room.usedChainStarterIds.includes(chosen.id)) {
    room.usedChainStarterIds.push(chosen.id);
  }
  if (chosen) {
    globalUsedChainStarterIds.add(chosen.id);
  }
  return chosen;
}
function generateRandomValidFootyGrid(roundNum) {
  const clubOverlapWeight = new Map();
  for (const p of PLAYERS) {
    if (Array.isArray(p.clubs) && p.clubs.length >= 2) {
      for (const cid of p.clubs) {
        clubOverlapWeight.set(cid, (clubOverlapWeight.get(cid) || 0) + 1);
      }
    }
  }
  const topClubs = [...CLUBS]
    .sort((a, b) => (clubOverlapWeight.get(b.id) || 0) - (clubOverlapWeight.get(a.id) || 0))
    .slice(0, 22)
    .map((c) => ({
      type: 'club',
      id: c.id,
      label: c.name,
      sub: c.nameTh || c.short
    }));
  const topFlags = [
    { type: 'flag', id: '🇫🇷', label: 'ฝรั่งเศส', sub: 'ทีมชาติฝรั่งเศส' },
    { type: 'flag', id: '🇧🇷', label: 'บราซิล', sub: 'ทีมชาติบราซิล' },
    { type: 'flag', id: '🇪🇸', label: 'สเปน', sub: 'ทีมชาติสเปน' },
    { type: 'flag', id: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', label: 'อังกฤษ', sub: 'ทีมชาติอังกฤษ' },
    { type: 'flag', id: '🇦🇷', label: 'อาร์เจนตินา', sub: 'ทีมชาติอาร์เจนตินา' },
    { type: 'flag', id: '🇵🇹', label: 'โปรตุเกส', sub: 'ทีมชาติโปรตุเกส' },
    { type: 'flag', id: '🇩🇪', label: 'เยอรมนี', sub: 'ทีมชาติเยอรมนี' },
    { type: 'flag', id: '🇮🇹', label: 'อิตาลี', sub: 'ทีมชาติอิตาลี' },
    { type: 'flag', id: '🇳🇱', label: 'เนเธอร์แลนด์', sub: 'ทีมชาติเนเธอร์แลนด์' }
  ];

  for (let attempt = 0; attempt < 40; attempt++) {
    const shuffledClubs = [...topClubs].sort(() => Math.random() - 0.5);
    const cols = shuffledClubs.slice(0, 3);
    const useFlagsInRows = Math.random() < 0.4;
    const rows = useFlagsInRows
      ? [...topFlags].sort(() => Math.random() - 0.5).slice(0, 3)
      : shuffledClubs.slice(3, 6);

    let allCellsValid = true;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const count = PLAYERS.filter(
          (p) => playerMatchesGridCriteria(p, rows[r]) && playerMatchesGridCriteria(p, cols[c])
        ).length;
        if (count < 2) {
          allCellsValid = false;
          break;
        }
      }
      if (!allCellsValid) break;
    }

    if (allCellsValid) {
      return {
        id: 'random_grid_' + Date.now(),
        title: `ตาราง XO ฟุตบอล 3x3 ชุดที่ #${roundNum} (สุ่มสด ครบทุกช่อง!)`,
        cols,
        rows
      };
    }
  }
  return FOOTY_GRIDS[(roundNum - 1) % FOOTY_GRIDS.length] || FOOTY_GRIDS[0];
}

function startModeRound(room, options = {}) {
  const mode = room.settings.gameMode || 'club_battle';

  if (mode === 'lineup_quiz') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    if (!Array.isArray(room.usedLineupIds)) room.usedLineupIds = [];
    let chosen = options.lineupId ? LINEUPS.find((l) => l.id === options.lineupId) : null;
    if (!chosen) {
      const usedSet = new Set(room.usedLineupIds);
      let pool = LINEUPS.filter((l) => !usedSet.has(l.id));
      if (pool.length === 0) {
        room.usedLineupIds = room.currentLineupId ? [room.currentLineupId] : [];
        pool = LINEUPS.filter((l) => l.id !== room.currentLineupId);
      }
      chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : LINEUPS[0];
    }
    room.currentLineupId = (chosen || LINEUPS[0]).id;
    if (!room.usedLineupIds.includes(room.currentLineupId)) {
      room.usedLineupIds.push(room.currentLineupId);
    }
    room.unlockedLineupSlots = {};
    room.hintedLineupSlots = {};
    startWave(room);
  } else if (mode === 'top10_stats') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    if (!Array.isArray(room.usedTop10Ids)) room.usedTop10Ids = [];
    let chosen = options.listId ? TOP10_LISTS.find((l) => l.id === options.listId) : null;
    if (!chosen) {
      const usedSet = new Set(room.usedTop10Ids);
      let pool = TOP10_LISTS.filter((l) => !usedSet.has(l.id) && !globalUsedTop10Ids.has(l.id));
      if (pool.length === 0) {
        globalUsedTop10Ids.clear();
        if (room.currentTop10Id) globalUsedTop10Ids.add(room.currentTop10Id);
        pool = TOP10_LISTS.filter((l) => !usedSet.has(l.id));
      }
      if (pool.length === 0) {
        room.usedTop10Ids = room.currentTop10Id ? [room.currentTop10Id] : [];
        pool = TOP10_LISTS.filter((l) => l.id !== room.currentTop10Id);
      }
      const shuffled = shuffleArray(pool);
      chosen = shuffled[0] || TOP10_LISTS[0];
    }
    room.currentTop10Id = (chosen || TOP10_LISTS[0]).id;
    if (!room.usedTop10Ids.includes(room.currentTop10Id)) {
      room.usedTop10Ids.push(room.currentTop10Id);
    }
    globalUsedTop10Ids.add(room.currentTop10Id);
    room.unlockedTop10Ranks = {};
    room.hintedTop10Ranks = {};
    startWave(room);
  } else if (mode === 'career_path') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    if (!Array.isArray(room.usedCareerIds)) room.usedCareerIds = [];
    if (!Array.isArray(room.usedCareerNames)) room.usedCareerNames = [];

    const usedIdSet = new Set(room.usedCareerIds);
    const usedNameSet = new Set(room.usedCareerNames);

    let pool = CAREER_PATHS.filter(
      (c) => !usedIdSet.has(c.id) && !usedNameSet.has(normalizeText(c.answerName))
    );
    if (pool.length === 0) {
      room.usedCareerIds = room.currentCareerId ? [room.currentCareerId] : [];
      const prevCp = CAREER_PATHS.find((c) => c.id === room.currentCareerId);
      room.usedCareerNames = prevCp ? [normalizeText(prevCp.answerName)] : [];
      pool = CAREER_PATHS.filter((c) => c.id !== room.currentCareerId);
    }
    const nextCp = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CAREER_PATHS[0];
    room.currentCareerId = nextCp.id;
    room.usedCareerIds.push(nextCp.id);
    room.usedCareerNames.push(normalizeText(nextCp.answerName));
    room.careerHintOpened = false;
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
    if (!Array.isArray(room.usedTriviaIds)) room.usedTriviaIds = [];
    if (!Array.isArray(room.usedTriviaTexts)) room.usedTriviaTexts = [];

    const diff = room.settings.triviaDifficulty || 'all';
    const byDiff =
      diff === 'all'
        ? TRIVIA_QUESTIONS
        : TRIVIA_QUESTIONS.filter((q) => (q.difficulty || 'medium') === diff);
    const basePool = byDiff.length > 0 ? byDiff : TRIVIA_QUESTIONS;

    const usedIdSet = new Set(room.usedTriviaIds);
    const usedTextSet = new Set(room.usedTriviaTexts);

    // 1. Prefer questions never used in this room AND never used globally across recent rooms
    let pool = basePool.filter(
      (q) =>
        !usedIdSet.has(q.id) &&
        !usedTextSet.has(normalizeText(q.question)) &&
        !globalUsedTriviaIds.has(q.id)
    );

    // 2. If global pool for this difficulty is exhausted, fall back to questions never used in this room
    if (pool.length === 0) {
      basePool.forEach((q) => globalUsedTriviaIds.delete(q.id));
      if (room.currentTriviaId) globalUsedTriviaIds.add(room.currentTriviaId);
      pool = basePool.filter(
        (q) => !usedIdSet.has(q.id) && !usedTextSet.has(normalizeText(q.question))
      );
    }

    // 3. Only if all questions in this difficulty have been played in this room, reset room cycle
    if (pool.length === 0) {
      room.usedTriviaIds = room.currentTriviaId ? [room.currentTriviaId] : [];
      const prevTr = basePool.find((q) => q.id === room.currentTriviaId);
      room.usedTriviaTexts = prevTr ? [normalizeText(prevTr.question)] : [];
      pool = basePool.filter((q) => q.id !== room.currentTriviaId);
    }

    const shuffled = shuffleArray(pool);
    const nextTr = shuffled.length > 0 ? shuffled[0] : basePool[0];
    room.currentTriviaId = nextTr.id;
    room.usedTriviaIds.push(nextTr.id);
    room.usedTriviaTexts.push(normalizeText(nextTr.question));
    globalUsedTriviaIds.add(nextTr.id);
    startWave(room);
  } else if (mode === 'footy_grid') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    room.gridTurnIndex =
      (room.players || []).length > 0 ? (room.roundNumber - 1) % room.players.length : 0;
    if (options.gridId && options.gridId !== 'random') {
      const chosen = FOOTY_GRIDS.find((g) => g.id === options.gridId) || FOOTY_GRIDS[0];
      room.currentGridId = chosen.id;
      room.customFootyGrid = null;
    } else {
      const randGrid = generateRandomValidFootyGrid(room.roundNumber);
      room.currentGridId = randGrid.id;
      room.customFootyGrid = randGrid;
    }
    room.gridCells = Array(9).fill(null);
    room.hintedGridCells = {};
    room.awardedBingoLines = [];
    startWave(room);
  } else if (mode === 'connections') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    room.connectionsBoard = generateConnectionsBoard(room.roundNumber, room);
    startWave(room);
  } else if (mode === 'who_are_ya_wordle') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    const nextMystery = pickMysteryWordlePlayer(room);
    room.wordleMysteryPlayer = nextMystery;
    room.wordleGuesses = [];
    room.wordleHintStep = 0;
    room.wordleSolved = false;
    room.wordleRevealed = false;
    room.wordleSolvedBy = null;
    room.wordlePointsAwarded = 0;
    if (!nextMystery.photoUrl) {
      getPlayerPhotoByName(nextMystery.name).then((photo) => {
        if (photo && room.wordleMysteryPlayer && room.wordleMysteryPlayer.id === nextMystery.id) {
          room.wordleMysteryPlayer.photoUrl = photo;
          broadcastRoom(room.code, 'top10_updated');
        }
      });
    }
    startWave(room);
  } else if (mode === 'chain_link') {
    room.roundNumber += 1;
    room.waveNumber = 1;
    room.chainTurnIndex =
      (room.players || []).length > 0 ? (room.roundNumber - 1) % room.players.length : 0;
    room.lastChainMoverId = null;
    const starter = pickChainStarterPlayer(room);
    room.chainLinkHistory = [
      {
        step: 1,
        playerId: starter.id,
        playerName: starter.name,
        flag: starter.flag,
        flagUrl: starter.flagUrl || getFlagUrlFromEmoji(starter.flag),
        photoUrl: starter.photoUrl || null,
        position: starter.position,
        viaClubId: null,
        viaClubName: 'จุดเริ่มต้นลูกโซ่ (Starter)',
        viaClubBadgeUrl: null,
        byPlayerName: '🎲 ระบบสุ่ม',
        pointsEarned: 0
      }
    ];
    room.chainUsedClubs = [];
    room.chainHintText = null;
    if (!starter.photoUrl) {
      getPlayerPhotoByName(starter.name).then((photo) => {
        if (photo && room.chainLinkHistory && room.chainLinkHistory[0]?.playerId === starter.id) {
          room.chainLinkHistory[0].photoUrl = photo;
          starter.photoUrl = photo;
          broadcastRoom(room.code, 'top10_updated');
        }
      });
    }
    startWave(room);
  } else {
    // club_battle: Multi-Club Pool!
    room.pickedClubs = [];
    room.usedPlayers = [];
    room.lastWaveResults = [];

    if (room.settings.clubSelectMode === 'random') {
      const isSingleClubMode = mode === 'club_battle';
      const count = getTargetClubPoolSize(room);
      const chosenClubs = pickSmartClubPool(count);
      for (let i = 0; i < count; i++) {
        const isBonusClub = !isSingleClubMode && room.players.length === 2 && i >= room.players.length;
        const p = room.players[(room.roundNumber + i) % room.players.length];
        room.pickedClubs.push({
          playerId: isBonusClub ? 'bonus_club_' + i : p.id,
          playerName: isBonusClub ? 'สโมสรโบนัสกลางกระดาน' : p.name,
          playerAvatar: isBonusClub ? '🎲' : p.avatar,
          clubId: chosenClubs[i % chosenClubs.length].id
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
    } else if (room.state === 'PLAYING') {
      scheduleBotActions(room);
      if (room.settings.gameMode === 'chain_link') {
        scheduleChainBotTurn(room);
      } else if (room.settings.gameMode === 'footy_grid') {
        scheduleGridBotTurn(room);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'remove_player') {
    const targetId = body.targetPlayerId;
    room.players = room.players.filter((p) => p.id !== targetId);
    room.pickedClubs = (room.pickedClubs || []).filter((pc) => pc.playerId !== targetId);
    if (room.players.length > 0) {
      room.gridTurnIndex = (room.gridTurnIndex || 0) % room.players.length;
      room.chainTurnIndex = (room.chainTurnIndex || 0) % room.players.length;
    } else {
      room.gridTurnIndex = 0;
      room.chainTurnIndex = 0;
    }
    if (room.state === 'PLAYING') {
      if (room.settings.gameMode === 'chain_link') {
        scheduleChainBotTurn(room);
      } else if (room.settings.gameMode === 'footy_grid') {
        scheduleGridBotTurn(room);
      }
    }
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

  if (action === 'lineup_hint_slot') {
    const slotId = body.slotId;
    if (!room.hintedLineupSlots) room.hintedLineupSlots = {};
    if (slotId) {
      const cur = room.hintedLineupSlots[slotId];
      const curLevel = typeof cur === 'number' ? cur : cur ? 3 : 0;
      room.hintedLineupSlots[slotId] = Math.min(3, curLevel + 1);
      broadcastRoom(code, 'top10_updated');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'lineup_reveal_slot') {
    const slotId = body.slotId;
    const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
    const slot = lineup.slots.find((s) => s.slotId === slotId);
    if (!room.unlockedLineupSlots) room.unlockedLineupSlots = {};
    if (slot && !room.unlockedLineupSlots[slotId]) {
      const knownPlayer = findPlayerByInput(slot.playerId, null);
      const slotPhoto = slot.photoUrl || knownPlayer?.photoUrl || null;
      room.unlockedLineupSlots[slotId] = {
        answeredBy: '👁️ เปิดเฉลย',
        playerId: slot.playerId,
        revealed: true,
        photoUrl: slotPhoto
      };
      if (!slotPhoto) {
        getPlayerPhotoByName(slot.playerId).then((photo) => {
          if (photo && room.unlockedLineupSlots && room.unlockedLineupSlots[slotId]) {
            room.unlockedLineupSlots[slotId].photoUrl = photo;
            broadcastRoom(code, 'top10_updated');
          }
        });
      }
      broadcastRoom(code, 'top10_updated');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'lineup_reveal_all') {
    const lineup = LINEUPS.find((l) => l.id === room.currentLineupId) || LINEUPS[0];
    if (!room.unlockedLineupSlots) room.unlockedLineupSlots = {};
    lineup.slots.forEach((slot) => {
      if (!room.unlockedLineupSlots[slot.slotId]) {
        const knownPlayer = findPlayerByInput(slot.playerId, null);
        room.unlockedLineupSlots[slot.slotId] = {
          answeredBy: '👁️ เปิดเฉลย',
          playerId: slot.playerId,
          revealed: true,
          photoUrl: slot.photoUrl || knownPlayer?.photoUrl || null
        };
      }
    });
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'career_toggle_hint') {
    room.careerHintOpened = true;
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'career_reveal_now') {
    finishWave(room);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'grid_hint_cell') {
    const cellIdx = Math.max(0, Math.min(8, parseInt(body.cellIndex, 10) || 0));
    if (!room.hintedGridCells) room.hintedGridCells = {};
    room.hintedGridCells[cellIdx] = true;
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'grid_reveal_cell') {
    const cellIdx = Math.max(0, Math.min(8, parseInt(body.cellIndex, 10) || 0));
    const grid = room.customFootyGrid || FOOTY_GRIDS.find((g) => g.id === room.currentGridId) || FOOTY_GRIDS[0];
    if (!room.gridCells) room.gridCells = Array(9).fill(null);
    if (!room.gridCells[cellIdx]) {
      const rIdx = Math.floor(cellIdx / 3);
      const cIdx = cellIdx % 3;
      const usedNames = new Set(
        room.gridCells.filter(Boolean).map((c) => normalizeText(c.playerName))
      );
      const matches = PLAYERS.filter(
        (p) =>
          !usedNames.has(normalizeText(p.name)) &&
          playerMatchesGridCriteria(p, grid.rows[rIdx]) &&
          playerMatchesGridCriteria(p, grid.cols[cIdx])
      );
      const sample = matches[0];
      if (sample) {
        room.gridCells[cellIdx] = {
          ownerId: 'revealed',
          ownerName: '👁️ เฉลย (0 แต้ม)',
          ownerAvatar: '👁️',
          revealed: true,
          playerName: sample.name,
          playerFlag: sample.flag,
          flagUrl: sample.flagUrl || getFlagUrlFromEmoji(sample.flag),
          photoUrl: sample.photoUrl || null
        };
        if ((room.players || []).length > 0) {
          room.gridTurnIndex = ((room.gridTurnIndex || 0) + 1) % room.players.length;
        }
        broadcastRoom(code, 'top10_updated');
        scheduleGridBotTurn(room);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'grid_skip_turn') {
    if ((room.players || []).length > 0) {
      room.gridTurnIndex = ((room.gridTurnIndex || 0) + 1) % room.players.length;
    }
    const nextTurnPlayer = getActiveGridTurnPlayer(room);
    broadcastRoom(code, 'top10_updated', {
      toastMessage: `🏳️ ข้ามเทิร์นวาง XO ➔ 🟢 ตาต่อไปของ ${nextTurnPlayer ? `${nextTurnPlayer.avatar} ${nextTurnPlayer.name}` : 'ผู้เล่นถัดไป'}!`
    });
    scheduleGridBotTurn(room);
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

  // MODE 7 ACTIONS: FOOTBALL CONNECTIONS
  if (action === 'connections_submit_group') {
    const selectedIds = Array.isArray(body.playerIds) ? body.playerIds : [];
    const player = room.players.find((p) => p.id === playerId);
    if (!room.connectionsBoard) {
      room.connectionsBoard = generateConnectionsBoard(room.roundNumber || 1);
    }
    const board = room.connectionsBoard;
    if (selectedIds.length !== 4) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          ok: true,
          connectionsFeedback: { correct: false, message: 'กรุณาคลิกเลือกนักเตะให้ครบ 4 คนก่อนกดส่งกลุ่ม!' },
          room: serializeRoomForClients(room)
        })
      );
    }

    const openGroups = board.groups.filter((g) => !g.solved);
    let exactGroup = null;
    let bestOverlap = 0;

    for (const grp of openGroups) {
      const overlap = selectedIds.filter((id) => grp.playerIds.includes(id)).length;
      if (overlap === 4) {
        exactGroup = grp;
        break;
      }
      if (overlap > bestOverlap) bestOverlap = overlap;
    }

    if (exactGroup) {
      exactGroup.solved = true;
      exactGroup.revealed = false;
      exactGroup.solvedBy = player ? player.name : 'ผู้เล่น';
      const pts = exactGroup.points || 2;
      if (player) {
        player.score += pts;
        recordPlayerResultStats(player, true, null, exactGroup.title);
      }

      // If 3 groups are solved, automatically unlock the last remaining group for +1 bonus to the solver!
      const remainingUnsolved = board.groups.filter((g) => !g.solved);
      let bonusLastMsg = '';
      if (remainingUnsolved.length === 1) {
        const lastGrp = remainingUnsolved[0];
        lastGrp.solved = true;
        lastGrp.revealed = false;
        lastGrp.solvedBy = `${player ? player.name : 'ผู้เล่น'} (ปิดกระดาน!)`;
        if (player) player.score += lastGrp.points;
        bonusLastMsg = ` 🎉 และเปิดกลุ่มสุดท้าย "${lastGrp.title}" สำเร็จ (+${lastGrp.points} แต้ม)!`;
      }

      broadcastRoom(code, 'top10_updated', {
        toastMessage: `🧩 ${player ? player.name : 'ผู้เล่น'} จับกลุ่มสำเร็จ: "${exactGroup.title}" (+${pts} แต้ม)${bonusLastMsg}`
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          ok: true,
          connectionsFeedback: {
            correct: true,
            message: `✅ ถูกต้อง! กลุ่ม "${exactGroup.title}" รับ +${pts} คะแนน${bonusLastMsg}`
          },
          room: serializeRoomForClients(room)
        })
      );
    }

    const oneAwayMsg =
      bestOverlap === 3
        ? '🔥 เฉียดมาก! มี 3 คนในกลุ่มเดียวกันแล้ว (ขาดอีกแค่ 1 คน!)'
        : '❌ ทั้ง 4 คนนี้ยังไม่ได้อยู่ในหมวดความลับเดียวกัน ลองจับคู่ใหม่!';
    if (player) recordPlayerResultStats(player, false, null, null);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        ok: true,
        connectionsFeedback: { correct: false, oneAway: bestOverlap === 3, message: oneAwayMsg },
        room: serializeRoomForClients(room)
      })
    );
  }

  if (action === 'connections_hint') {
    if (!room.connectionsBoard) room.connectionsBoard = generateConnectionsBoard(room.roundNumber || 1);
    const board = room.connectionsBoard;
    const openGrp = board.groups.find((g) => !g.solved);
    if (openGrp) {
      const samplePair = openGrp.players.slice(0, 2).map((p) => p.name).join(' + ');
      board.hintText = `💡 ใบ้หมวด "${openGrp.title}": มี ${samplePair} อยู่ในกลุ่มเดียวกัน!`;
      broadcastRoom(code, 'top10_updated');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'connections_reveal_one') {
    if (!room.connectionsBoard) room.connectionsBoard = generateConnectionsBoard(room.roundNumber || 1, room);
    const board = room.connectionsBoard;
    const openGrp = board.groups.find((g) => !g.solved);
    if (openGrp) {
      openGrp.solved = true;
      openGrp.revealed = true;
      openGrp.solvedBy = '👁️ เปิดเฉลย (0 แต้ม)';
      const rem = board.groups.filter((g) => !g.solved);
      if (rem.length === 1) {
        rem[0].solved = true;
        rem[0].revealed = true;
        rem[0].solvedBy = '👁️ เปิดเฉลยกลุ่มสุดท้าย (0 แต้ม)';
      }
      broadcastRoom(code, 'top10_updated');
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'connections_reveal_all') {
    if (!room.connectionsBoard) room.connectionsBoard = generateConnectionsBoard(room.roundNumber || 1);
    const board = room.connectionsBoard;
    board.groups.forEach((g) => {
      if (!g.solved) {
        g.solved = true;
        g.revealed = true;
        g.solvedBy = '👁️ เปิดเฉลย (0 แต้ม)';
      }
    });
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  // MODE 8 ACTIONS: WHO ARE YA? (BLURRED PHOTO + WORDLE)
  if (action === 'wordle_hint_unblur') {
    room.wordleHintStep = Math.min(4, (room.wordleHintStep || 0) + 1);
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'wordle_reveal_answer') {
    room.wordleRevealed = true;
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  // MODE 9 ACTIONS: CHAIN LINK (TEAMMATE CHAIN)
  if (action === 'chain_hint') {
    if (!room.chainLinkHistory || room.chainLinkHistory.length === 0) {
      serializeModeDataForClients(room);
    }
    const hist = room.chainLinkHistory;
    const anchor = hist[hist.length - 1];
    const anchorPlayer = PLAYERS.find((p) => p.id === anchor.playerId) || PLAYERS[0];
    const usedPlayerIds = new Set(hist.map((h) => h.playerId));
    const usedClubIds = new Set(room.chainUsedClubs || []);
    const availClubs = (anchorPlayer.clubs || []).filter((cid) => !usedClubIds.has(cid));

    let sampleCandidate = null;
    let sampleClubName = '';
    for (const cid of availClubs) {
      const clubObj = CLUBS.find((c) => c.id === cid);
      const mate = PLAYERS.find((p) => !usedPlayerIds.has(p.id) && p.clubs.includes(cid));
      if (mate) {
        sampleCandidate = mate;
        sampleClubName = clubObj?.name || cid;
        break;
      }
    }

    if (sampleCandidate) {
      const words = sampleCandidate.name.trim().split(/\s+/);
      const initials = words.map((w) => w.charAt(0).toUpperCase() + '_'.repeat(Math.max(2, w.length - 1))).join(' ');
      room.chainHintText = `💡 เชื่อมผ่านสโมสร [${sampleClubName}] ➔ ${sampleCandidate.flag} ${initials} (${sampleCandidate.position})`;
    } else {
      room.chainHintText = `⚠️ นักเตะคนนี้ไม่มีสโมสรว่างให้เชื่อมต่อแล้ว กดปุ่ม "🔄 เริ่มโซ่ใหม่" ได้เลย!`;
    }
    broadcastRoom(code, 'top10_updated');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, room: serializeRoomForClients(room) }));
  }

  if (action === 'chain_auto_step') {
    if (!room.chainLinkHistory || room.chainLinkHistory.length === 0) {
      serializeModeDataForClients(room);
    }
    const hist = room.chainLinkHistory;
    const anchor = hist[hist.length - 1];
    const anchorPlayer = PLAYERS.find((p) => p.id === anchor.playerId) || PLAYERS[0];
    const usedPlayerIds = new Set(hist.map((h) => h.playerId));
    const usedClubIds = new Set(room.chainUsedClubs || []);
    const availClubs = (anchorPlayer.clubs || []).filter((cid) => !usedClubIds.has(cid));

    let nextPlayer = null;
    let chosenCid = null;
    for (const cid of availClubs) {
      const candidates = PLAYERS.filter(
        (p) => !usedPlayerIds.has(p.id) && p.clubs.includes(cid) && p.clubs.length >= 2
      );
      if (candidates.length > 0) {
        nextPlayer = candidates[Math.floor(Math.random() * candidates.length)];
        chosenCid = cid;
        break;
      }
    }

    if (nextPlayer && chosenCid) {
      const clubObj = CLUBS.find((c) => c.id === chosenCid);
      if (!room.chainUsedClubs) room.chainUsedClubs = [];
      room.chainUsedClubs.push(chosenCid);
      room.chainHintText = null;
      hist.push({
        step: hist.length + 1,
        playerId: nextPlayer.id,
        playerName: nextPlayer.name,
        flag: nextPlayer.flag,
        flagUrl: nextPlayer.flagUrl || getFlagUrlFromEmoji(nextPlayer.flag),
        photoUrl: nextPlayer.photoUrl || null,
        position: nextPlayer.position,
        viaClubId: chosenCid,
        viaClubName: clubObj?.name || chosenCid,
        viaClubBadgeUrl: clubObj?.badgeUrl || null,
        byPlayerName: '👁️ ระบบช่วยเชื่อม (ข้ามตา 0 แต้ม)',
        pointsEarned: 0
      });
      if ((room.players || []).length > 0) {
        room.chainTurnIndex = ((room.chainTurnIndex || 0) + 1) % room.players.length;
      }
      room.waveStartTime = Date.now();
      room.timeLeft = room.settings.timeLimit || 15;
      scheduleChainBotTurn(room);
    } else {
      startModeRound(room);
    }
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
    const lineupFeedback = typeof result === 'object' ? result.lineupFeedback || null : null;
    const gridFeedback = typeof result === 'object' ? result.gridFeedback || null : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        ok,
        top10Feedback,
        lineupFeedback,
        gridFeedback,
        room: serializeRoomForClients(room)
      })
    );
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
    room.hintedLineupSlots = {};
    room.unlockedTop10Ranks = {};
    room.hintedTop10Ranks = {};
    room.careerHintOpened = false;
    room.gridCells = Array(9).fill(null);
    room.hintedGridCells = {};
    room.awardedBingoLines = [];
    room.gridTurnIndex = 0;
    room.connectionsBoard = null;
    room.wordleMysteryPlayer = null;
    room.wordleGuesses = [];
    room.wordleHintStep = 0;
    room.wordleSolved = false;
    room.wordleRevealed = false;
    room.wordleSolvedBy = null;
    room.wordlePointsAwarded = 0;
    room.chainLinkHistory = [];
    room.chainUsedClubs = [];
    room.chainHintText = null;
    room.chainTurnIndex = 0;
    room.lastChainMoverId = null;
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

function buildApiDataPayloadJson() {
  const playerMap = new Map();
  for (const p of PLAYERS) {
    playerMap.set(normalizeText(p.name), {
      id: p.id,
      name: p.name,
      flag: p.flag,
      flagUrl: p.flagUrl || getFlagUrlFromEmoji(p.flag),
      photoUrl: p.photoUrl || null,
      position: p.position,
      clubs: p.clubs || [],
      aliases: Array.isArray(p.aliases) ? [...p.aliases] : [],
      fromLiveApi: Boolean(p.fromLiveApi)
    });
  }
  for (const lineup of LINEUPS) {
    for (const s of lineup.slots || []) {
      const key = normalizeText(s.playerId);
      const existing = playerMap.get(key);
      if (existing) {
        for (const al of s.aliases || []) {
          if (!existing.aliases.includes(al)) existing.aliases.push(al);
        }
      } else {
        playerMap.set(key, {
          id: 'lu_' + key.replace(/\s+/g, '_'),
          name: s.playerId,
          flag: s.flag || '⚽',
          flagUrl: getFlagUrlFromEmoji(s.flag),
          photoUrl: s.photoUrl || null,
          position: s.pos || 'FW',
          clubs: [],
          aliases: Array.isArray(s.aliases) ? [...s.aliases] : [],
          fromLiveApi: false
        });
      }
    }
  }
  for (const list of TOP10_LISTS) {
    for (const it of list.items || []) {
      const key = normalizeText(it.name);
      const existing = playerMap.get(key);
      if (existing) {
        for (const al of it.aliases || []) {
          if (!existing.aliases.includes(al)) existing.aliases.push(al);
        }
      } else {
        playerMap.set(key, {
          id: 't10_' + key.replace(/\s+/g, '_'),
          name: it.name,
          flag: it.flag || '⚽',
          flagUrl: getFlagUrlFromEmoji(it.flag),
          photoUrl: null,
          position: 'Legend',
          clubs: [],
          aliases: Array.isArray(it.aliases) ? [...it.aliases] : [],
          fromLiveApi: false
        });
      }
    }
  }

  return JSON.stringify({
    leagues: LEAGUES,
    clubs: CLUBS,
    players: Array.from(playerMap.values())
  });
}

let cachedApiDataJson = buildApiDataPayloadJson();

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
    if (!cachedApiDataJson) {
      cachedApiDataJson = buildApiDataPayloadJson();
    }
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=30'
    });
    return res.end(cachedApiDataJson);
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
  initializeFootballApiData()
    .then(() => {
      cachedApiDataJson = buildApiDataPayloadJson();
      for (const [roomCode] of rooms.entries()) {
        broadcastRoom(roomCode, 'database_updated');
      }
      // Refresh cache again once background photo pre-warming completes
      setTimeout(() => {
        cachedApiDataJson = buildApiDataPayloadJson();
        for (const [roomCode] of rooms.entries()) {
          broadcastRoom(roomCode, 'database_updated');
        }
      }, 12000);
    })
    .catch(() => {});
});
