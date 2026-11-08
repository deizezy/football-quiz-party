// Live Football API Integration (TheSportsDB v1 Key "123" + Smart In-Memory Cache)
// Automatically fetches up-to-date players, current clubs, and complete former club histories!

const { CLUBS, PLAYERS } = require('../data/footballData');

const API_BASE = 'https://www.thesportsdb.com/api/v1/json/123';

const NATIONALITY_FLAGS = {
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'northern ireland': '🇬🇧',
  ireland: '🇮🇪',
  france: '🇫🇷',
  spain: '🇪🇸',
  germany: '🇩🇪',
  italy: '🇮🇹',
  portugal: '🇵🇹',
  brazil: '🇧🇷',
  argentina: '🇦🇷',
  netherlands: '🇳🇱',
  holland: '🇳🇱',
  belgium: '🇧🇪',
  croatia: '🇭🇷',
  uruguay: '🇺🇾',
  colombia: '🇨🇴',
  chile: '🇨🇱',
  mexico: '🇲🇽',
  usa: '🇺🇸',
  'united states': '🇺🇸',
  canada: '🇨🇦',
  norway: '🇳🇴',
  sweden: '🇸🇪',
  denmark: '🇩🇰',
  poland: '🇵🇱',
  switzerland: '🇨🇭',
  austria: '🇦🇹',
  serbia: '🇷🇸',
  ukraine: '🇺🇦',
  turkey: '🇹🇷',
  morocco: '🇲🇦',
  egypt: '🇪🇬',
  senegal: '🇸🇳',
  'ivory coast': '🇨🇮',
  'cote d\'ivoire': '🇨🇮',
  ghana: '🇬🇭',
  nigeria: '🇳🇬',
  cameroon: '🇨🇲',
  algeria: '🇩🇿',
  japan: '🇯🇵',
  'south korea': '🇰🇷',
  'korea republic': '🇰🇷',
  australia: '🇦🇺',
  ecuador: '🇪🇨',
  paraguay: '🇵🇾',
  slovenia: '🇸🇮',
  slovakia: '🇸🇰',
  'czech republic': '🇨🇿',
  czechia: '🇨🇿',
  hungary: '🇭🇺',
  georgia: '🇬🇪'
};

function mapNationalityToFlag(nat) {
  if (!nat) return '⚽';
  const key = nat.toString().trim().toLowerCase();
  return NATIONALITY_FLAGS[key] || '🌐';
}

function mapPositionShort(pos) {
  if (!pos) return 'FW';
  const p = pos.toString().toLowerCase();
  if (p.includes('goal') || p === 'gk') return 'GK';
  if (p.includes('defen') || p.includes('back') || p.includes('cb') || p.includes('lb') || p.includes('rb')) return 'DF';
  if (p.includes('midfield') || p.includes('cm') || p.includes('dm') || p.includes('am')) return 'MF';
  return 'FW';
}

function normalizeText(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Match an API team name (e.g. "Arsenal", "Paris SG", "Inter", "Bayern München", "Tottenham") to our CLUBS id
function mapApiTeamNameToClubId(teamName) {
  const norm = normalizeText(teamName);
  if (!norm || norm.includes('retired') || norm.includes('free agent')) return null;

  for (const club of CLUBS) {
    const cName = normalizeText(club.name);
    const cShort = normalizeText(club.short);
    if (cName === norm || cShort === norm) return club.id;
    if (club.aliases && club.aliases.some((a) => normalizeText(a) === norm)) return club.id;
  }

  // Fuzzy match for common API variations
  for (const club of CLUBS) {
    const cName = normalizeText(club.name);
    if (norm.length >= 4 && (cName.includes(norm) || norm.includes(cName))) {
      // Avoid confusing "Manchester" between Man Utd and Man City, or "Milan" between AC Milan and Inter Milan
      if (norm.includes('manchester')) {
        if (norm.includes('city')) return 'man_city';
        if (norm.includes('united') || norm.includes('utd')) return 'man_utd';
        continue;
      }
      if (norm.includes('milan')) {
        if (norm.includes('inter')) return 'inter_milan';
        if (norm.includes('ac')) return 'ac_milan';
        continue;
      }
      if (norm.includes('madrid')) {
        if (norm.includes('atletico') || norm.includes('atl')) return 'atletico';
        if (norm.includes('real')) return 'real_madrid';
        continue;
      }
      return club.id;
    }
  }

  // Specific common API names
  if (norm.includes('paris sg') || norm.includes('paris saint')) return 'psg';
  if (norm === 'inter' || norm === 'internazionale') return 'inter_milan';
  if (norm === 'milan') return 'ac_milan';
  if (norm.includes('bayern')) return 'bayern';
  if (norm.includes('dortmund')) return 'dortmund';
  if (norm.includes('leverkusen')) return 'leverkusen';
  if (norm.includes('leipzig')) return 'leipzig';
  if (norm.includes('lyon')) return 'lyon';
  if (norm.includes('marseille')) return 'marseille';
  if (norm.includes('monaco')) return 'monaco';
  if (norm.includes('lille')) return 'lille';
  if (norm.includes('tottenham') || norm.includes('spurs')) return 'tottenham';
  if (norm.includes('newcastle')) return 'newcastle';
  if (norm.includes('west ham')) return 'west_ham';
  if (norm.includes('aston villa')) return 'aston_villa';

  return null;
}

async function fetchWithTimeout(url, timeoutMs = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const searchCache = new Map(); // query -> results[]

async function searchPlayersFromApi(query) {
  const cleanQ = (query || '').trim();
  if (cleanQ.length < 3) return [];

  const cacheKey = normalizeText(cleanQ);
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const apiQuery = cleanQ.replace(/\s+/g, '_');
  const data = await fetchWithTimeout(`${API_BASE}/searchplayers.php?p=${encodeURIComponent(apiQuery)}`, 3000);
  if (!data || !Array.isArray(data.player)) {
    return [];
  }

  const soccerPlayers = data.player
    .filter((p) => p.strSport === 'Soccer')
    .slice(0, 8)
    .map((p) => {
      const existing = PLAYERS.find(
        (loc) => normalizeText(loc.name) === normalizeText(p.strPlayer) || loc.apiId === p.idPlayer
      );
      if (existing) {
        existing.apiId = p.idPlayer;
        const currentClubId = mapApiTeamNameToClubId(p.strTeam);
        if (currentClubId && !existing.clubs.includes(currentClubId)) {
          existing.clubs.push(currentClubId);
        }
        return existing;
      }

      const currentClubId = mapApiTeamNameToClubId(p.strTeam);
      const newPlayer = {
        id: 'api_' + p.idPlayer,
        apiId: p.idPlayer,
        name: p.strPlayer.trim(),
        flag: mapNationalityToFlag(p.strNationality),
        position: mapPositionShort(p.strPosition),
        clubs: currentClubId ? [currentClubId] : [],
        rawTeams: p.strTeam && !p.strTeam.includes('Retired') ? [p.strTeam] : [],
        aliases: [],
        fromLiveApi: true,
        apiSynced: false
      };
      PLAYERS.push(newPlayer);
      return newPlayer;
    });

  searchCache.set(cacheKey, soccerPlayers);
  return soccerPlayers;
}

// Fetch complete former teams from TheSportsDB and enrich player object
async function enrichPlayerClubHistory(playerObj, rawNameQuery) {
  try {
    let targetApiId = playerObj?.apiId || null;
    let apiPlayerRecord = null;

    if (!targetApiId) {
      const q = (playerObj ? playerObj.name : rawNameQuery || '').trim().replace(/\s+/g, '_');
      if (!q) return playerObj;
      const searchData = await fetchWithTimeout(`${API_BASE}/searchplayers.php?p=${encodeURIComponent(q)}`, 3200);
      if (searchData && Array.isArray(searchData.player)) {
        apiPlayerRecord = searchData.player.find((p) => p.strSport === 'Soccer');
        if (apiPlayerRecord) {
          targetApiId = apiPlayerRecord.idPlayer;
        }
      }
    }

    if (!playerObj && apiPlayerRecord) {
      const currentClubId = mapApiTeamNameToClubId(apiPlayerRecord.strTeam);
      playerObj = {
        id: 'api_' + apiPlayerRecord.idPlayer,
        apiId: apiPlayerRecord.idPlayer,
        name: apiPlayerRecord.strPlayer.trim(),
        flag: mapNationalityToFlag(apiPlayerRecord.strNationality),
        position: mapPositionShort(apiPlayerRecord.strPosition),
        clubs: currentClubId ? [currentClubId] : [],
        rawTeams: apiPlayerRecord.strTeam && !apiPlayerRecord.strTeam.includes('Retired') ? [apiPlayerRecord.strTeam] : [],
        aliases: [],
        fromLiveApi: true,
        apiSynced: false
      };
      PLAYERS.push(playerObj);
    }

    if (!playerObj || !targetApiId) return playerObj;

    playerObj.apiId = targetApiId;
    if (apiPlayerRecord && apiPlayerRecord.strTeam) {
      const curId = mapApiTeamNameToClubId(apiPlayerRecord.strTeam);
      if (curId && !playerObj.clubs.includes(curId)) {
        playerObj.clubs.push(curId);
      }
    }

    if (!playerObj.apiSynced) {
      const formerData = await fetchWithTimeout(`${API_BASE}/lookupformerteams.php?id=${encodeURIComponent(targetApiId)}`, 3200);
      if (formerData && Array.isArray(formerData.formerteams)) {
        if (!playerObj.rawTeams) playerObj.rawTeams = [];
        formerData.formerteams.forEach((ft) => {
          const teamName = ft.strFormerTeam;
          if (teamName && !playerObj.rawTeams.includes(teamName)) {
            playerObj.rawTeams.push(teamName);
          }
          const cid = mapApiTeamNameToClubId(teamName);
          if (cid && !playerObj.clubs.includes(cid)) {
            playerObj.clubs.push(cid);
          }
        });
      }
      playerObj.apiSynced = true;
    }

    return playerObj;
  } catch (err) {
    return playerObj;
  }
}

module.exports = {
  searchPlayersFromApi,
  enrichPlayerClubHistory
};
