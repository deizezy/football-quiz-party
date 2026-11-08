// Multi-Source Free Football API Engine:
// 1. TheSportsDB API (Free key "123") -> Live player search, cutout photos, team badges, former teams
// 2. Wikipedia REST API -> High-res club crests, player portrait thumbnails, Wikidata QID resolution
// 3. Wikidata SPARQL API -> Complete career club history (P54), appearances (P1350), goals (P1351)
// 4. FlagCDN -> Crisp country flag images (PNG) for all nationalities and leagues

const { LEAGUES, CLUBS, PLAYERS } = require('../data/footballData');

const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const WIKI_SUMMARY_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

const USER_AGENT = 'FootballQuizParty/2.0 (https://football-quiz-party.onrender.com)';

// Verified default API badge URLs from TheSportsDB & Wikimedia Commons for instant startup availability
const DEFAULT_CLUB_BADGES = {
  man_utd: 'https://thumb.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/330px-Manchester_United_FC_crest.svg.png',
  liverpool: 'https://thumb.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/330px-Liverpool_FC.svg.png',
  arsenal: 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png',
  chelsea: 'https://r2.thesportsdb.com/images/media/team/badge/pbf4ul1782638263.png',
  man_city: 'https://thumb.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/330px-Manchester_City_FC_badge.svg.png',
  tottenham: 'https://thumb.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/330px-Tottenham_Hotspur.svg.png',
  newcastle: 'https://thumb.wikimedia.org/wikipedia/en/thumb/8/87/Newcastle_United_FC_2026_crest.svg/330px-Newcastle_United_FC_2026_crest.svg.png',
  aston_villa: 'https://r2.thesportsdb.com/images/media/team/badge/uwzw561787679026.png',
  everton: 'https://r2.thesportsdb.com/images/media/team/badge/eqayrf1523184794.png',
  west_ham: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/330px-West_Ham_United_FC_logo.svg.png',
  real_madrid: 'https://thumb.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/330px-Real_Madrid_CF.svg.png',
  barcelona: 'https://r2.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png',
  atletico: 'https://r2.thesportsdb.com/images/media/team/badge/0ulh3q1719984315.png',
  sevilla: 'https://thumb.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/330px-Sevilla_FC_logo.svg.png',
  valencia: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/330px-Valenciacf.svg.png',
  villarreal: 'https://thumb.wikimedia.org/wikipedia/en/thumb/b/b9/Villarreal_CF_logo-en.svg/330px-Villarreal_CF_logo-en.svg.png',
  juventus: 'https://r2.thesportsdb.com/images/media/team/badge/uxf0gr1742983727.png',
  ac_milan: 'https://r2.thesportsdb.com/images/media/team/badge/wvspur1448806617.png',
  inter_milan: 'https://r2.thesportsdb.com/images/media/team/badge/ryhu6d1617113103.png',
  roma: 'https://thumb.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/330px-AS_Roma_logo_%282017%29.svg.png',
  napoli: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/SSC_Napoli_2025_%28white_and_azure%29.svg/330px-SSC_Napoli_2025_%28white_and_azure%29.svg.png',
  lazio: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/330px-S.S._Lazio_badge.svg.png',
  fiorentina: 'https://r2.thesportsdb.com/images/media/team/badge/hc8nhu1656098030.png',
  bayern: 'https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png',
  dortmund: 'https://r2.thesportsdb.com/images/media/team/badge/tqo8ge1716960353.png',
  leverkusen: 'https://r2.thesportsdb.com/images/media/team/badge/3x9k851726760113.png',
  leipzig: 'https://thumb.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/330px-RB_Leipzig_2014_logo.svg.png',
  psg: 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/330px-Paris_Saint-Germain_F.C..svg.png',
  monaco: 'https://thumb.wikimedia.org/wikipedia/en/thumb/c/cf/LogoASMonacoFC2021.svg/330px-LogoASMonacoFC2021.svg.png',
  lyon: 'https://r2.thesportsdb.com/images/media/team/badge/blk9771656932845.png',
  marseille: 'https://r2.thesportsdb.com/images/media/team/badge/c6bazh1779212287.png',
  lille: 'https://r2.thesportsdb.com/images/media/team/badge/2giize1534005340.png'
};

// Map nationality names to Flag Emoji + FlagCDN ISO code
const NATIONALITY_MAP = {
  england: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iso: 'gb-eng' },
  scotland: { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', iso: 'gb-sct' },
  wales: { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', iso: 'gb-wls' },
  'northern ireland': { flag: '🇬🇧', iso: 'gb-nir' },
  'united kingdom': { flag: '🇬🇧', iso: 'gb' },
  ireland: { flag: '🇮🇪', iso: 'ie' },
  'republic of ireland': { flag: '🇮🇪', iso: 'ie' },
  france: { flag: '🇫🇷', iso: 'fr' },
  spain: { flag: '🇪🇸', iso: 'es' },
  germany: { flag: '🇩🇪', iso: 'de' },
  italy: { flag: '🇮🇹', iso: 'it' },
  portugal: { flag: '🇵🇹', iso: 'pt' },
  brazil: { flag: '🇧🇷', iso: 'br' },
  argentina: { flag: '🇦🇷', iso: 'ar' },
  netherlands: { flag: '🇳🇱', iso: 'nl' },
  holland: { flag: '🇳🇱', iso: 'nl' },
  belgium: { flag: '🇧🇪', iso: 'be' },
  croatia: { flag: '🇭🇷', iso: 'hr' },
  uruguay: { flag: '🇺🇾', iso: 'uy' },
  colombia: { flag: '🇨🇴', iso: 'co' },
  chile: { flag: '🇨🇱', iso: 'cl' },
  mexico: { flag: '🇲🇽', iso: 'mx' },
  usa: { flag: '🇺🇸', iso: 'us' },
  'united states': { flag: '🇺🇸', iso: 'us' },
  canada: { flag: '🇨🇦', iso: 'ca' },
  norway: { flag: '🇳🇴', iso: 'no' },
  sweden: { flag: '🇸🇪', iso: 'se' },
  denmark: { flag: '🇩🇰', iso: 'dk' },
  poland: { flag: '🇵🇱', iso: 'pl' },
  switzerland: { flag: '🇨🇭', iso: 'ch' },
  austria: { flag: '🇦🇹', iso: 'at' },
  serbia: { flag: '🇷🇸', iso: 'rs' },
  ukraine: { flag: '🇺🇦', iso: 'ua' },
  turkey: { flag: '🇹🇷', iso: 'tr' },
  turkiye: { flag: '🇹🇷', iso: 'tr' },
  morocco: { flag: '🇲🇦', iso: 'ma' },
  egypt: { flag: '🇪🇬', iso: 'eg' },
  senegal: { flag: '🇸🇳', iso: 'sn' },
  'ivory coast': { flag: '🇨🇮', iso: 'ci' },
  "cote d'ivoire": { flag: '🇨🇮', iso: 'ci' },
  ghana: { flag: '🇬🇭', iso: 'gh' },
  nigeria: { flag: '🇳🇬', iso: 'ng' },
  cameroon: { flag: '🇨🇲', iso: 'cm' },
  algeria: { flag: '🇩🇿', iso: 'dz' },
  gabon: { flag: '🇬🇦', iso: 'ga' },
  guinea: { flag: '🇬🇳', iso: 'gn' },
  mali: { flag: '🇲🇱', iso: 'ml' },
  japan: { flag: '🇯🇵', iso: 'jp' },
  'south korea': { flag: '🇰🇷', iso: 'kr' },
  'korea republic': { flag: '🇰🇷', iso: 'kr' },
  australia: { flag: '🇦🇺', iso: 'au' },
  ecuador: { flag: '🇪🇨', iso: 'ec' },
  paraguay: { flag: '🇵🇾', iso: 'py' },
  peru: { flag: '🇵🇪', iso: 'pe' },
  venezuela: { flag: '🇻🇪', iso: 've' },
  'costa rica': { flag: '🇨🇷', iso: 'cr' },
  slovenia: { flag: '🇸🇮', iso: 'si' },
  slovakia: { flag: '🇸🇰', iso: 'sk' },
  'czech republic': { flag: '🇨🇿', iso: 'cz' },
  czechia: { flag: '🇨🇿', iso: 'cz' },
  hungary: { flag: '🇭🇺', iso: 'hu' },
  georgia: { flag: '🇬🇪', iso: 'ge' },
  armenia: { flag: '🇦🇲', iso: 'am' },
  russia: { flag: '🇷🇺', iso: 'ru' },
  greece: { flag: '🇬🇷', iso: 'gr' },
  romania: { flag: '🇷🇴', iso: 'ro' },
  bulgaria: { flag: '🇧🇬', iso: 'bg' },
  finland: { flag: '🇫🇮', iso: 'fi' },
  iceland: { flag: '🇮🇸', iso: 'is' },
  bosnia: { flag: '🇧🇦', iso: 'ba' },
  'bosnia and herzegovina': { flag: '🇧🇦', iso: 'ba' },
  montenegro: { flag: '🇲🇪', iso: 'me' },
  'north macedonia': { flag: '🇲🇰', iso: 'mk' },
  albania: { flag: '🇦🇱', iso: 'al' },
  kosovo: { flag: '🇽🇰', iso: 'xk' }
};

const EMOJI_TO_ISO = {};
Object.values(NATIONALITY_MAP).forEach((entry) => {
  EMOJI_TO_ISO[entry.flag] = entry.iso;
});

function flagEmojiToIso(flagEmoji) {
  if (!flagEmoji) return null;
  const trimmed = flagEmoji.trim();
  if (EMOJI_TO_ISO[trimmed]) return EMOJI_TO_ISO[trimmed];

  const codePoints = Array.from(trimmed).map((c) => c.codePointAt(0));
  if (
    codePoints.length === 2 &&
    codePoints[0] >= 0x1f1e6 &&
    codePoints[0] <= 0x1f1ff &&
    codePoints[1] >= 0x1f1e6 &&
    codePoints[1] <= 0x1f1ff
  ) {
    const c1 = String.fromCharCode(codePoints[0] - 0x1f1e6 + 97);
    const c2 = String.fromCharCode(codePoints[1] - 0x1f1e6 + 97);
    return `${c1}${c2}`;
  }
  return null;
}

function getFlagUrlFromEmoji(flagEmoji) {
  const iso = flagEmojiToIso(flagEmoji);
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null;
}

function mapNationalityToFlagAndUrl(nat) {
  if (!nat) return { flag: '⚽', flagUrl: null };
  const key = nat.toString().trim().toLowerCase();
  const matched = NATIONALITY_MAP[key];
  if (matched) {
    return {
      flag: matched.flag,
      flagUrl: `https://flagcdn.com/w40/${matched.iso}.png`
    };
  }
  return { flag: '🌐', flagUrl: null };
}

// Synchronously initialize default badges & flagUrls so they are ready immediately
CLUBS.forEach((c) => {
  if (!c.badgeUrl && DEFAULT_CLUB_BADGES[c.id]) {
    c.badgeUrl = DEFAULT_CLUB_BADGES[c.id];
  }
});
LEAGUES.forEach((lg) => {
  if (!lg.flagUrl) {
    lg.flagUrl = getFlagUrlFromEmoji(lg.flag);
  }
});
PLAYERS.forEach((p) => {
  if (!p.flagUrl) {
    p.flagUrl = getFlagUrlFromEmoji(p.flag);
  }
});

function mapPositionShort(pos) {
  if (!pos) return 'FW';
  const p = pos.toString().toLowerCase();
  if (p.includes('goal') || p === 'gk' || p.includes('keeper')) return 'GK';
  if (p.includes('defen') || p.includes('back') || p.includes('cb') || p.includes('lb') || p.includes('rb')) return 'DF';
  if (p.includes('midfield') || p.includes('cm') || p.includes('dm') || p.includes('am') || p.includes('wing')) return 'MF';
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

function mapApiTeamNameToClubId(teamName) {
  const norm = normalizeText(teamName);
  if (!norm || norm.includes('retired') || norm.includes('free agent')) return null;
  if (norm.includes('national') || norm.includes('under-') || norm.includes('u21') || norm.includes('u19') || norm.includes('u23')) {
    return null;
  }

  for (const club of CLUBS) {
    const cName = normalizeText(club.name);
    const cShort = normalizeText(club.short);
    if (cName === norm || cShort === norm) return club.id;
    if (club.aliases && club.aliases.some((a) => normalizeText(a) === norm)) return club.id;
  }

  if (norm.includes('manchester')) {
    if (norm.includes('city')) return 'man_city';
    if (norm.includes('united') || norm.includes('utd')) return 'man_utd';
    return null;
  }
  if (norm.includes('milan')) {
    if (norm.includes('inter') || norm.includes('internazionale')) return 'inter_milan';
    if (norm.includes('ac ') || norm === 'milan' || norm === 'a.c. milan') return 'ac_milan';
    return null;
  }
  if (norm.includes('madrid')) {
    if (norm.includes('atletico') || norm.includes('atl')) return 'atletico';
    if (norm.includes('real')) return 'real_madrid';
    return null;
  }

  if (norm.includes('paris sg') || norm.includes('paris saint')) return 'psg';
  if (norm === 'inter' || norm.includes('internazionale')) return 'inter_milan';
  if (norm.includes('bayern')) return 'bayern';
  if (norm.includes('dortmund')) return 'dortmund';
  if (norm.includes('leverkusen')) return 'leverkusen';
  if (norm.includes('leipzig')) return 'leipzig';
  if (norm.includes('lyon') || norm.includes('olympique lyonnais')) return 'lyon';
  if (norm.includes('marseille')) return 'marseille';
  if (norm.includes('monaco')) return 'monaco';
  if (norm.includes('lille')) return 'lille';
  if (norm.includes('tottenham') || norm.includes('spurs')) return 'tottenham';
  if (norm.includes('newcastle')) return 'newcastle';
  if (norm.includes('west ham')) return 'west_ham';
  if (norm.includes('aston villa')) return 'aston_villa';
  if (norm.includes('arsenal')) return 'arsenal';
  if (norm.includes('chelsea')) return 'chelsea';
  if (norm.includes('liverpool')) return 'liverpool';
  if (norm.includes('everton')) return 'everton';
  if (norm.includes('barcelona')) return 'barcelona';
  if (norm.includes('sevilla')) return 'sevilla';
  if (norm.includes('valencia')) return 'valencia';
  if (norm.includes('villarreal')) return 'villarreal';
  if (norm.includes('juventus')) return 'juventus';
  if (norm.includes('roma') && !norm.includes('romania')) return 'roma';
  if (norm.includes('napoli')) return 'napoli';
  if (norm.includes('lazio')) return 'lazio';
  if (norm.includes('fiorentina')) return 'fiorentina';

  return null;
}

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWikipediaSummary(title) {
  if (!title) return null;
  const encoded = encodeURIComponent(title.trim().replace(/\s+/g, '_'));
  return fetchJsonWithTimeout(`${WIKI_SUMMARY_BASE}/${encoded}`, 2800);
}

async function fetchWikidataCareerClubs(qid) {
  if (!qid || !/^Q\d+$/.test(qid)) return [];
  const sparql = `
    SELECT ?clubLabel ?start ?end ?apps ?goals WHERE {
      wd:${qid} p:P54 ?st.
      ?st ps:P54 ?club.
      OPTIONAL { ?st pq:P580 ?start. }
      OPTIONAL { ?st pq:P582 ?end. }
      OPTIONAL { ?st pq:P1350 ?apps. }
      OPTIONAL { ?st pq:P1351 ?goals. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY ?start
  `;
  const url = `${WIKIDATA_SPARQL_URL}?format=json&query=${encodeURIComponent(sparql)}`;
  const data = await fetchJsonWithTimeout(url, 3500);
  if (!data || !data.results || !Array.isArray(data.results.bindings)) return [];

  return data.results.bindings.map((b) => ({
    clubName: b.clubLabel?.value || '',
    startYear: b.start?.value ? b.start.value.slice(0, 4) : null,
    endYear: b.end?.value ? b.end.value.slice(0, 4) : null,
    apps: b.apps?.value ? parseInt(b.apps.value, 10) : null,
    goals: b.goals?.value ? parseInt(b.goals.value, 10) : null
  }));
}

const searchCache = new Map();
const photoCache = new Map(); // normalized player name -> photoUrl

async function getPlayerPhotoByName(playerName) {
  if (!playerName) return null;
  const norm = normalizeText(playerName);
  if (photoCache.has(norm)) return photoCache.get(norm);

  const localPlayer = PLAYERS.find((p) => normalizeText(p.name) === norm);
  if (localPlayer && localPlayer.photoUrl) {
    photoCache.set(norm, localPlayer.photoUrl);
    return localPlayer.photoUrl;
  }

  const wiki = await fetchWikipediaSummary(playerName);
  const photo = wiki?.thumbnail?.source || null;
  if (photo) {
    photoCache.set(norm, photo);
    if (localPlayer && !localPlayer.photoUrl) {
      localPlayer.photoUrl = photo;
    }
  }
  return photo;
}

async function searchPlayersFromApi(query) {
  const cleanQ = (query || '').trim();
  if (cleanQ.length < 2) return [];

  const cacheKey = normalizeText(cleanQ);
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const apiQuery = cleanQ.replace(/\s+/g, '_');
  const data = await fetchJsonWithTimeout(
    `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(apiQuery)}`,
    3000
  );

  const results = [];

  if (data && Array.isArray(data.player)) {
    const soccerPlayers = data.player.filter((p) => p.strSport === 'Soccer').slice(0, 8);
    for (const p of soccerPlayers) {
      const photoUrl = p.strCutout || p.strThumb || p.strRender || null;
      const natInfo = mapNationalityToFlagAndUrl(p.strNationality);
      const currentClubId = mapApiTeamNameToClubId(p.strTeam);

      const existing = PLAYERS.find(
        (loc) => normalizeText(loc.name) === normalizeText(p.strPlayer) || loc.apiId === p.idPlayer
      );

      if (existing) {
        existing.apiId = p.idPlayer;
        if (photoUrl) existing.photoUrl = photoUrl;
        if (natInfo.flagUrl && !existing.flagUrl) existing.flagUrl = natInfo.flagUrl;
        if (currentClubId && !existing.clubs.includes(currentClubId)) {
          existing.clubs.push(currentClubId);
        }
        if (photoUrl) photoCache.set(normalizeText(existing.name), photoUrl);
        results.push(existing);
      } else {
        const newPlayer = {
          id: 'api_' + p.idPlayer,
          apiId: p.idPlayer,
          name: p.strPlayer.trim(),
          flag: natInfo.flag,
          flagUrl: natInfo.flagUrl,
          photoUrl,
          position: mapPositionShort(p.strPosition),
          clubs: currentClubId ? [currentClubId] : [],
          rawTeams: p.strTeam && !p.strTeam.includes('Retired') ? [p.strTeam] : [],
          aliases: [],
          fromLiveApi: true,
          apiSynced: false
        };
        if (photoUrl) photoCache.set(normalizeText(newPlayer.name), photoUrl);
        PLAYERS.push(newPlayer);
        results.push(newPlayer);
      }
    }
  }

  // Also enrich matching local players with photos via Wikipedia REST API
  const localMatches = PLAYERS.filter((p) => {
    const n = normalizeText(p.name);
    const aliasMatch = p.aliases && p.aliases.some((a) => normalizeText(a).includes(cacheKey));
    return (n.startsWith(cacheKey) || n.includes(cacheKey) || aliasMatch) && !p.photoUrl;
  }).slice(0, 4);

  await Promise.allSettled(
    localMatches.map(async (loc) => {
      const wiki = await fetchWikipediaSummary(loc.name);
      if (wiki) {
        if (wiki.thumbnail?.source && !loc.photoUrl) {
          loc.photoUrl = wiki.thumbnail.source;
          photoCache.set(normalizeText(loc.name), loc.photoUrl);
        }
        if (wiki.wikibase_item && !loc.wikidataId) {
          loc.wikidataId = wiki.wikibase_item;
        }
      }
      if (!results.some((r) => r.id === loc.id)) {
        results.push(loc);
      }
    })
  );

  searchCache.set(cacheKey, results);
  return results;
}

async function enrichPlayerClubHistory(playerObj, rawNameQuery) {
  try {
    let targetApiId = playerObj?.apiId || null;
    let apiPlayerRecord = null;
    const queryName = (playerObj ? playerObj.name : rawNameQuery || '').trim();

    if (!targetApiId && queryName) {
      const q = queryName.replace(/\s+/g, '_');
      const searchData = await fetchJsonWithTimeout(
        `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(q)}`,
        2800
      );
      if (searchData && Array.isArray(searchData.player)) {
        apiPlayerRecord = searchData.player.find((p) => p.strSport === 'Soccer');
        if (apiPlayerRecord) {
          targetApiId = apiPlayerRecord.idPlayer;
        }
      }
    }

    if (!playerObj && apiPlayerRecord) {
      const currentClubId = mapApiTeamNameToClubId(apiPlayerRecord.strTeam);
      const natInfo = mapNationalityToFlagAndUrl(apiPlayerRecord.strNationality);
      playerObj = {
        id: 'api_' + apiPlayerRecord.idPlayer,
        apiId: apiPlayerRecord.idPlayer,
        name: apiPlayerRecord.strPlayer.trim(),
        flag: natInfo.flag,
        flagUrl: natInfo.flagUrl,
        photoUrl: apiPlayerRecord.strCutout || apiPlayerRecord.strThumb || null,
        position: mapPositionShort(apiPlayerRecord.strPosition),
        clubs: currentClubId ? [currentClubId] : [],
        rawTeams:
          apiPlayerRecord.strTeam && !apiPlayerRecord.strTeam.includes('Retired')
            ? [apiPlayerRecord.strTeam]
            : [],
        aliases: [],
        fromLiveApi: true,
        apiSynced: false
      };
      PLAYERS.push(playerObj);
    }

    if (!playerObj) {
      if (queryName) {
        await getPlayerPhotoByName(queryName);
      }
      return null;
    }

    if (!playerObj.flagUrl) {
      playerObj.flagUrl = getFlagUrlFromEmoji(playerObj.flag);
    }

    if (apiPlayerRecord) {
      playerObj.apiId = targetApiId;
      const photo = apiPlayerRecord.strCutout || apiPlayerRecord.strThumb || apiPlayerRecord.strRender;
      if (photo) {
        playerObj.photoUrl = photo;
        photoCache.set(normalizeText(playerObj.name), photo);
      }
      if (apiPlayerRecord.strTeam) {
        const curId = mapApiTeamNameToClubId(apiPlayerRecord.strTeam);
        if (curId && !playerObj.clubs.includes(curId)) {
          playerObj.clubs.push(curId);
        }
      }
    }

    if (!playerObj.apiSynced) {
      const tasks = [];

      if (targetApiId) {
        tasks.push(
          fetchJsonWithTimeout(
            `${SPORTSDB_BASE}/lookupformerteams.php?id=${encodeURIComponent(targetApiId)}`,
            2800
          ).then((formerData) => {
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
          })
        );
      }

      tasks.push(
        (async () => {
          const wiki = await fetchWikipediaSummary(playerObj.name);
          if (wiki) {
            if (wiki.thumbnail?.source && !playerObj.photoUrl) {
              playerObj.photoUrl = wiki.thumbnail.source;
              photoCache.set(normalizeText(playerObj.name), playerObj.photoUrl);
            }
            if (wiki.wikibase_item) {
              playerObj.wikidataId = wiki.wikibase_item;
              const wdClubs = await fetchWikidataCareerClubs(wiki.wikibase_item);
              if (!playerObj.rawTeams) playerObj.rawTeams = [];
              wdClubs.forEach((entry) => {
                if (entry.clubName && !playerObj.rawTeams.includes(entry.clubName)) {
                  playerObj.rawTeams.push(entry.clubName);
                }
                const cid = mapApiTeamNameToClubId(entry.clubName);
                if (cid && !playerObj.clubs.includes(cid)) {
                  playerObj.clubs.push(cid);
                }
              });
            }
          }
        })()
      );

      await Promise.allSettled(tasks);
      playerObj.apiSynced = true;
    }

    return playerObj;
  } catch (err) {
    return playerObj;
  }
}

async function initializeFootballApiData() {
  // Refresh club badges from TheSportsDB in background
  const leagueMap = {
    premier_league: 'English Premier League',
    la_liga: 'Spanish La Liga',
    serie_a: 'Italian Serie A',
    bundesliga: 'German Bundesliga',
    ligue_1: 'French Ligue 1'
  };

  for (const [, apiLeagueName] of Object.entries(leagueMap)) {
    const data = await fetchJsonWithTimeout(
      `${SPORTSDB_BASE}/search_all_teams.php?l=${encodeURIComponent(apiLeagueName)}`,
      3500
    );
    if (data && Array.isArray(data.teams)) {
      data.teams.forEach((t) => {
        const cid = mapApiTeamNameToClubId(t.strTeam) || mapApiTeamNameToClubId(t.strTeamAlternate);
        if (cid) {
          const clubObj = CLUBS.find((c) => c.id === cid);
          if (clubObj && t.strBadge) {
            clubObj.badgeUrl = t.strBadge;
          }
        }
      });
    }
  }

  // Pre-warm photos for top 50 players in background
  const topStars = PLAYERS.slice(0, 50);
  for (const star of topStars) {
    if (!star.photoUrl) {
      const wiki = await fetchWikipediaSummary(star.name);
      if (wiki && wiki.thumbnail?.source) {
        star.photoUrl = wiki.thumbnail.source;
        photoCache.set(normalizeText(star.name), star.photoUrl);
      }
    }
  }
}

module.exports = {
  searchPlayersFromApi,
  enrichPlayerClubHistory,
  initializeFootballApiData,
  getFlagUrlFromEmoji,
  getPlayerPhotoByName,
  mapApiTeamNameToClubId
};
