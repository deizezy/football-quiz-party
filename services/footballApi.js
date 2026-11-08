// 100% Live Football API Data Engine (2026-27 Season)
// Sources (100% Free, No API Key Required):
// 1. ESPN Soccer API v2/v3 -> Live 2026-27 clubs, 500px club logos, full active squad rosters,
//    athlete career teamHistory (/bio), live 2026-27 match Starting XIs (/summary), and live 2026-27 Top 10 stats (/statistics)
// 2. TheSportsDB API (Free Key "123") -> Player cutout/thumb photos, additional player search & former teams
// 3. Wikipedia REST API & Wikidata SPARQL -> High-res player portraits & deep historical club verification
// 4. FlagCDN -> Crisp country flag images for all nationalities

const { LEAGUES, CLUBS, PLAYERS } = require('../data/footballData');
const {
  LINEUPS,
  TOP10_LISTS,
  CAREER_PATHS,
  TRIVIA_QUESTIONS
} = require('../data/quizModesData');

const ESPN_SITE_API = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const ESPN_WEB_API = 'https://site.web.api.espn.com/apis/common/v3/sports/soccer';
const ESPN_SEARCH_API = 'https://site.web.api.espn.com/apis/common/v3/search';
const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const WIKI_SUMMARY_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

const USER_AGENT = 'FootballQuizParty/3.0';

const LEAGUE_ESPN_SLUGS = {
  premier_league: { slug: 'eng.1', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iso: 'gb-eng' },
  la_liga: { slug: 'esp.1', name: 'La Liga', flag: '🇪🇸', iso: 'es' },
  serie_a: { slug: 'ita.1', name: 'Serie A', flag: '🇮🇹', iso: 'it' },
  bundesliga: { slug: 'ger.1', name: 'Bundesliga', flag: '🇩🇪', iso: 'de' },
  ligue_1: { slug: 'fra.1', name: 'Ligue 1', flag: '🇫🇷', iso: 'fr' }
};

// Preserve Thai aliases, legends, and known past club links from initial seed data so Thai/English search & multi-club history work seamlessly
const seedPlayerLookup = new Map();
PLAYERS.forEach((p) => {
  const norm = normalizeText(p.name);
  seedPlayerLookup.set(norm, {
    id: p.id,
    name: p.name,
    position: p.position || 'FW',
    clubs: [...(p.clubs || [])],
    aliases: [...(p.aliases || [])],
    flag: p.flag,
    flagUrl: p.flagUrl || null
  });
});

const WIKIDATA_CLUB_QIDS = {
  Q18656: 'man_utd',
  Q1130849: 'liverpool',
  Q9617: 'arsenal',
  Q9616: 'chelsea',
  Q50602: 'man_city',
  Q18741: 'tottenham',
  Q18716: 'newcastle',
  Q18711: 'aston_villa',
  Q5794: 'everton',
  Q18747: 'west_ham',
  Q8682: 'real_madrid',
  Q7156: 'barcelona',
  Q8701: 'atletico',
  Q10329: 'sevilla',
  Q10333: 'valencia',
  Q12297: 'villarreal',
  Q1422: 'juventus',
  Q1543: 'ac_milan',
  Q631: 'inter_milan',
  Q2739: 'roma',
  Q2641: 'napoli',
  Q2609: 'lazio',
  Q2052: 'fiorentina',
  Q15789: 'bayern',
  Q41420: 'dortmund',
  Q104761: 'leverkusen',
  Q702455: 'leipzig',
  Q483020: 'psg',
  Q180305: 'monaco',
  Q704: 'lyon',
  Q132885: 'marseille',
  Q19516: 'lille'
};

// Verified default API badge URLs for instant startup availability before async refresh finishes
const DEFAULT_CLUB_BADGES = {
  man_utd: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  liverpool: 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
  arsenal: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  chelsea: 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
  man_city: 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  tottenham: 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
  newcastle: 'https://a.espncdn.com/i/teamlogos/soccer/500/361.png',
  aston_villa: 'https://a.espncdn.com/i/teamlogos/soccer/500/362.png',
  everton: 'https://a.espncdn.com/i/teamlogos/soccer/500/368.png',
  west_ham: 'https://a.espncdn.com/i/teamlogos/soccer/500/371.png',
  real_madrid: 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  barcelona: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  atletico: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  sevilla: 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png',
  valencia: 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png',
  villarreal: 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
  juventus: 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
  ac_milan: 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  inter_milan: 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  roma: 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  napoli: 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
  lazio: 'https://a.espncdn.com/i/teamlogos/soccer/500/112.png',
  fiorentina: 'https://a.espncdn.com/i/teamlogos/soccer/500/109.png',
  bayern: 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  dortmund: 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  leverkusen: 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
  leipzig: 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
  psg: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  monaco: 'https://a.espncdn.com/i/teamlogos/soccer/500/174.png',
  lyon: 'https://a.espncdn.com/i/teamlogos/soccer/500/167.png',
  marseille: 'https://a.espncdn.com/i/teamlogos/soccer/500/176.png',
  lille: 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png'
};

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
  'kingdom of the netherlands': { flag: '🇳🇱', iso: 'nl' },
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

function normalizeText(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

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

function mapNationalityToFlagAndUrl(nat, espnFlagHref = null) {
  if (nat) {
    const key = nat.toString().trim().toLowerCase();
    const matched = NATIONALITY_MAP[key];
    if (matched) {
      return {
        flag: matched.flag,
        flagUrl: `https://flagcdn.com/w40/${matched.iso}.png`
      };
    }
  }
  if (espnFlagHref) {
    return {
      flag: '🏳️',
      flagUrl: espnFlagHref
    };
  }
  return { flag: '⚽', flagUrl: null };
}

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
  if (p === 'g' || p === 'gk' || p.includes('goal') || p.includes('keeper')) return 'GK';
  if (p === 'd' || p === 'df' || p.includes('defen') || p.includes('back') || p.includes('cb') || p.includes('lb') || p.includes('rb')) return 'DF';
  if (p === 'm' || p === 'mf' || p.includes('midfield') || p.includes('cm') || p.includes('dm') || p.includes('am') || p.includes('wing')) return 'MF';
  return 'FW';
}

function mapApiTeamNameToClubId(teamName, espnTeamId = null) {
  if (espnTeamId) {
    const byEspn = CLUBS.find((c) => String(c.espnTeamId) === String(espnTeamId));
    if (byEspn) return byEspn.id;
  }
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
  if (norm === 'paris fc') return null;
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

  // Fallback fuzzy match for newly added 2026-27 clubs in CLUBS
  for (const club of CLUBS) {
    const cName = normalizeText(club.name);
    if (norm.length >= 5 && (cName.includes(norm) || norm.includes(cName))) {
      return club.id;
    }
  }

  return null;
}

async function fetchJsonWithTimeout(url, timeoutMs = 4000) {
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

// Fetch ESPN Athlete Bio (returns teamHistory across entire career!)
async function fetchEspnAthleteBio(espnId) {
  if (!espnId) return null;
  return fetchJsonWithTimeout(`${ESPN_WEB_API}/athletes/${encodeURIComponent(espnId)}/bio`, 3000);
}

const searchCache = new Map();
const photoCache = new Map();

async function getPlayerPhotoByName(playerName) {
  if (!playerName) return null;
  const norm = normalizeText(playerName);
  if (photoCache.has(norm)) return photoCache.get(norm);

  const localPlayer = PLAYERS.find((p) => normalizeText(p.name) === norm);
  if (localPlayer && localPlayer.photoUrl) {
    photoCache.set(norm, localPlayer.photoUrl);
    return localPlayer.photoUrl;
  }

  // Try TheSportsDB cutout first, then Wikipedia portrait
  const q = playerName.trim().replace(/\s+/g, '_');
  const sdb = await fetchJsonWithTimeout(`${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(q)}`, 2500);
  if (sdb && Array.isArray(sdb.player)) {
    const sp = sdb.player.find((x) => x.strSport === 'Soccer');
    const photo = sp?.strCutout || sp?.strThumb || sp?.strRender || null;
    if (photo) {
      photoCache.set(norm, photo);
      if (localPlayer) localPlayer.photoUrl = photo;
      return photo;
    }
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

// Live player search (ESPN Search API + TheSportsDB + Wikipedia photo enrichment)
async function searchPlayersFromApi(query) {
  const cleanQ = (query || '').trim();
  if (cleanQ.length < 2) return [];

  const cacheKey = normalizeText(cleanQ);
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const results = [];

  // 1. Search ESPN Live Soccer Player API + TheSportsDB in parallel
  const apiQuery = cleanQ.replace(/\s+/g, '_');
  const [espnSearch, sdbData] = await Promise.all([
    fetchJsonWithTimeout(
      `${ESPN_SEARCH_API}?query=${encodeURIComponent(cleanQ)}&limit=8&type=player`,
      2800
    ),
    fetchJsonWithTimeout(
      `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(apiQuery)}`,
      2800
    )
  ]);

  if (espnSearch && Array.isArray(espnSearch.items)) {
    const soccerItems = espnSearch.items.filter((it) => it.sport === 'soccer' && !it.isRetired).slice(0, 6);
    for (const item of soccerItems) {
      const espnId = String(item.id);
      const natInfo = mapNationalityToFlagAndUrl(item.flag?.alt, item.flag?.href);
      const teamLabel = (item.label || '').split(' - ')[1] || '';
      const currentClubId = mapApiTeamNameToClubId(teamLabel);

      let existing = PLAYERS.find(
        (loc) => String(loc.espnId) === espnId || normalizeText(loc.name) === normalizeText(item.displayName)
      );

      if (existing) {
        existing.espnId = espnId;
        if (natInfo.flagUrl && !existing.flagUrl) existing.flagUrl = natInfo.flagUrl;
        if (currentClubId && !existing.clubs.includes(currentClubId)) {
          existing.clubs.push(currentClubId);
        }
        results.push(existing);
      } else {
        const seed = seedPlayerLookup.get(normalizeText(item.displayName));
        const clubs = Array.from(new Set([...(currentClubId ? [currentClubId] : []), ...(seed?.clubs || [])]));
        const newPlayer = {
          id: 'espn_' + espnId,
          espnId,
          name: item.displayName.trim(),
          flag: seed?.flag || natInfo.flag,
          flagUrl: natInfo.flagUrl,
          photoUrl: null,
          position: 'FW',
          clubs,
          rawTeams: teamLabel ? [teamLabel] : [],
          aliases: seed?.aliases || (item.shortName ? [item.shortName] : []),
          fromLiveApi: true,
          apiSynced: false
        };
        PLAYERS.push(newPlayer);
        results.push(newPlayer);
      }
    }
  }

  if (sdbData && Array.isArray(sdbData.player)) {
    const soccerPlayers = sdbData.player.filter((p) => p.strSport === 'Soccer').slice(0, 6);
    for (const p of soccerPlayers) {
      const photoUrl = p.strCutout || p.strThumb || p.strRender || null;
      const natInfo = mapNationalityToFlagAndUrl(p.strNationality);
      const currentClubId = mapApiTeamNameToClubId(p.strTeam);

      const existing = PLAYERS.find(
        (loc) => normalizeText(loc.name) === normalizeText(p.strPlayer) || loc.apiId === p.idPlayer
      );

      if (existing) {
        existing.apiId = p.idPlayer;
        if (photoUrl) {
          existing.photoUrl = photoUrl;
          photoCache.set(normalizeText(existing.name), photoUrl);
        }
        if (natInfo.flagUrl && !existing.flagUrl) existing.flagUrl = natInfo.flagUrl;
        if (currentClubId && !existing.clubs.includes(currentClubId)) {
          existing.clubs.push(currentClubId);
        }
        if (!results.some((r) => r.id === existing.id)) {
          results.push(existing);
        }
      } else {
        const seed = seedPlayerLookup.get(normalizeText(p.strPlayer));
        const newPlayer = {
          id: 'api_' + p.idPlayer,
          apiId: p.idPlayer,
          name: p.strPlayer.trim(),
          flag: seed?.flag || natInfo.flag,
          flagUrl: natInfo.flagUrl,
          photoUrl,
          position: mapPositionShort(p.strPosition),
          clubs: Array.from(new Set([...(currentClubId ? [currentClubId] : []), ...(seed?.clubs || [])])),
          rawTeams: p.strTeam && !p.strTeam.includes('Retired') ? [p.strTeam] : [],
          aliases: seed?.aliases || [],
          fromLiveApi: true,
          apiSynced: false
        };
        if (photoUrl) photoCache.set(normalizeText(newPlayer.name), photoUrl);
        PLAYERS.push(newPlayer);
        results.push(newPlayer);
      }
    }
  }

  // Enrich top local/live matches missing photos via Wikipedia REST API
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

// Enrich a player's full club history (ESPN /bio teamHistory + TheSportsDB + Wikidata) and photoUrl
async function enrichPlayerClubHistory(playerObj, rawNameQuery) {
  try {
    const queryName = (playerObj ? playerObj.name : rawNameQuery || '').trim();

    // If player not yet in memory, search live APIs first
    if (!playerObj && queryName) {
      const found = await searchPlayersFromApi(queryName);
      if (found.length > 0) {
        playerObj =
          found.find((p) => normalizeText(p.name) === normalizeText(queryName)) || found[0];
      }
    }

    if (!playerObj) return null;

    if (!playerObj.flagUrl) {
      playerObj.flagUrl = getFlagUrlFromEmoji(playerObj.flag);
    }

    if (!playerObj.apiSynced) {
      const tasks = [];

      // 1. ESPN Bio teamHistory (fastest & most accurate 2026-27 career club list!)
      tasks.push(
        (async () => {
          let espnId = playerObj.espnId;
          if (!espnId) {
            const sData = await fetchJsonWithTimeout(
              `${ESPN_SEARCH_API}?query=${encodeURIComponent(playerObj.name)}&limit=3&type=player`,
              2400
            );
            const matchItem = sData?.items?.find((it) => it.sport === 'soccer');
            if (matchItem) {
              espnId = String(matchItem.id);
              playerObj.espnId = espnId;
              if (matchItem.flag?.href && !playerObj.flagUrl) {
                playerObj.flagUrl = matchItem.flag.href;
              }
            }
          }
          if (espnId) {
            const bio = await fetchEspnAthleteBio(espnId);
            if (bio && Array.isArray(bio.teamHistory)) {
              if (!playerObj.rawTeams) playerObj.rawTeams = [];
              bio.teamHistory.forEach((th) => {
                // Skip national teams (slugs without a dot like 'esp', 'eng', 'fra') unless club
                const isNational = th.slug && !th.slug.includes('.');
                if (isNational) return;
                if (th.displayName && !playerObj.rawTeams.includes(th.displayName)) {
                  playerObj.rawTeams.push(th.displayName);
                }
                const cid = mapApiTeamNameToClubId(th.displayName, th.id);
                if (cid && !playerObj.clubs.includes(cid)) {
                  playerObj.clubs.push(cid);
                }
              });
            }
          }
        })()
      );

      // 2. TheSportsDB photo + former teams
      tasks.push(
        (async () => {
          let targetApiId = playerObj.apiId;
          if (!targetApiId) {
            const q = playerObj.name.replace(/\s+/g, '_');
            const sdb = await fetchJsonWithTimeout(
              `${SPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(q)}`,
              2500
            );
            const rec = sdb?.player?.find((p) => p.strSport === 'Soccer');
            if (rec) {
              targetApiId = rec.idPlayer;
              playerObj.apiId = targetApiId;
              const photo = rec.strCutout || rec.strThumb || rec.strRender;
              if (photo) {
                playerObj.photoUrl = photo;
                photoCache.set(normalizeText(playerObj.name), photo);
              }
              const curCid = mapApiTeamNameToClubId(rec.strTeam);
              if (curCid && !playerObj.clubs.includes(curCid)) {
                playerObj.clubs.push(curCid);
              }
            }
          }
          if (targetApiId) {
            const formerData = await fetchJsonWithTimeout(
              `${SPORTSDB_BASE}/lookupformerteams.php?id=${encodeURIComponent(targetApiId)}`,
              2500
            );
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
          }
        })()
      );

      // 3. Wikipedia photo + Wikidata SPARQL career clubs
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

// Convert 11 ESPN starters into visual pitch slots (row 1..4, col 1..5)
function buildPitchSlotsFromEspnStarters(starters) {
  const gk = [];
  const df = [];
  const mf = [];
  const fw = [];

  starters.slice(0, 11).forEach((s) => {
    const pos = mapPositionShort(s.position?.abbreviation || s.position?.name);
    if (pos === 'GK' && gk.length === 0) gk.push(s);
    else if (pos === 'DF') df.push(s);
    else if (pos === 'MF') mf.push(s);
    else fw.push(s);
  });

  // Balance rows if needed
  const assignCols = (count) => {
    if (count === 1) return [3];
    if (count === 2) return [2, 4];
    if (count === 3) return [1, 3, 5];
    if (count === 4) return [1, 2, 4, 5];
    return [1, 2, 3, 4, 5].slice(0, count);
  };

  const slots = [];
  const pushRow = (group, rowNum) => {
    const cols = assignCols(group.length);
    group.forEach((item, idx) => {
      const ath = item.athlete || {};
      const name = ath.displayName || ath.fullName || 'Unknown';
      const lastName = ath.lastName || name.split(' ').slice(-1)[0];
      const seed = seedPlayerLookup.get(normalizeText(name));
      const flagUrl = ath.flag?.href || (seed?.flag ? getFlagUrlFromEmoji(seed.flag) : null);
      slots.push({
        slotId: `s_${rowNum}_${idx + 1}`,
        pos: item.position?.abbreviation || mapPositionShort(item.position?.name),
        number: item.jersey || idx + 1,
        flag: seed?.flag || '⚽',
        flagUrl,
        row: rowNum,
        col: cols[idx] || idx + 1,
        playerId: name,
        aliases: Array.from(new Set([lastName.toLowerCase(), ...(seed?.aliases || [])]))
      });
    });
  };

  pushRow(gk.length ? gk : starters.slice(0, 1), 4);
  pushRow(df, 3);
  pushRow(mf, 2);
  pushRow(fw, 1);

  return slots;
}

// Master Startup Loader: Replaces static datasets with 100% Live 2026-27 Season Data from ESPN + TheSportsDB + Wikipedia
async function initializeFootballApiData() {
  console.log('🌐 Syncing 100% Live 2026-27 Season Data from ESPN Soccer API & TheSportsDB...');

  // 1. Fetch all 2026-27 Clubs across the 5 Major European Leagues from ESPN
  const leagueEntries = Object.entries(LEAGUE_ESPN_SLUGS);
  const leagueTeamResponses = await Promise.all(
    leagueEntries.map(async ([leagueId, meta]) => {
      const data = await fetchJsonWithTimeout(`${ESPN_SITE_API}/${meta.slug}/teams`, 5000);
      return { leagueId, meta, teams: data?.sports?.[0]?.leagues?.[0]?.teams || [] };
    })
  );

  const espnTeamsToFetchRosters = [];

  for (const { leagueId, teams } of leagueTeamResponses) {
    for (const wrapper of teams) {
      const t = wrapper.team;
      if (!t) continue;
      const logo = t.logos?.[0]?.href || null;
      const cid = mapApiTeamNameToClubId(t.displayName || t.name);

      if (cid) {
        const clubObj = CLUBS.find((c) => c.id === cid);
        if (clubObj) {
          clubObj.espnTeamId = t.id;
          clubObj.espnLeagueSlug = LEAGUE_ESPN_SLUGS[leagueId].slug;
          if (logo) clubObj.badgeUrl = logo;
          if (t.color) clubObj.primaryColor = '#' + t.color;
          espnTeamsToFetchRosters.push({ clubObj, espnTeamId: t.id, slug: LEAGUE_ESPN_SLUGS[leagueId].slug });
        }
      } else {
        // Add any additional 2026-27 club from the Top 5 Leagues so all current clubs are playable!
        const newId = 'club_' + t.id;
        if (!CLUBS.some((c) => c.id === newId)) {
          const newClub = {
            id: newId,
            espnTeamId: t.id,
            espnLeagueSlug: LEAGUE_ESPN_SLUGS[leagueId].slug,
            name: t.displayName || t.name,
            nameTh: t.shortDisplayName || t.name,
            short: t.abbreviation || t.name.slice(0, 3).toUpperCase(),
            league: leagueId,
            primaryColor: t.color ? '#' + t.color : '#10b981',
            secondaryColor: t.alternateColor ? '#' + t.alternateColor : '#1e293b',
            badgeUrl: logo,
            aliases: [t.name.toLowerCase(), (t.shortDisplayName || '').toLowerCase(), (t.abbreviation || '').toLowerCase()].filter(Boolean)
          };
          CLUBS.push(newClub);
          espnTeamsToFetchRosters.push({ clubObj: newClub, espnTeamId: t.id, slug: LEAGUE_ESPN_SLUGS[leagueId].slug });
        }
      }
    }
  }

  // 2. Fetch Live 2026-27 Active Squad Rosters for all clubs across the 5 leagues
  const livePlayerMap = new Map();
  const batchSize = 12;
  for (let i = 0; i < espnTeamsToFetchRosters.length; i += batchSize) {
    const batch = espnTeamsToFetchRosters.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async ({ clubObj, espnTeamId, slug }) => {
        const rosterData = await fetchJsonWithTimeout(
          `${ESPN_SITE_API}/${slug}/teams/${espnTeamId}/roster`,
          5000
        );
        if (!rosterData || !Array.isArray(rosterData.athletes)) return;

        for (const ath of rosterData.athletes) {
          const espnId = String(ath.id);
          const fullName = (ath.displayName || ath.fullName || '').trim();
          if (!fullName) continue;

          const normName = normalizeText(fullName);
          const seed = seedPlayerLookup.get(normName);
          const natInfo = mapNationalityToFlagAndUrl(ath.flag?.alt || ath.citizenship, ath.flag?.href);
          const pos = mapPositionShort(ath.position?.abbreviation || ath.position?.name);

          if (!livePlayerMap.has(normName)) {
            const clubs = Array.from(new Set([clubObj.id, ...(seed?.clubs || [])]));
            const aliases = Array.from(
              new Set([
                ...(seed?.aliases || []),
                ...(ath.lastName ? [ath.lastName.toLowerCase()] : []),
                ...(ath.shortName ? [ath.shortName.toLowerCase()] : [])
              ])
            );
            livePlayerMap.set(normName, {
              id: 'espn_' + espnId,
              espnId,
              name: fullName,
              flag: seed?.flag || natInfo.flag,
              flagUrl: natInfo.flagUrl || (seed?.flag ? getFlagUrlFromEmoji(seed.flag) : null),
              photoUrl: ath.headshot?.href || null,
              position: pos,
              clubs,
              rawTeams: [clubObj.name],
              aliases,
              fromLiveApi: true,
              apiSynced: false
            });
          } else {
            const existing = livePlayerMap.get(normName);
            if (!existing.clubs.includes(clubObj.id)) {
              existing.clubs.push(clubObj.id);
            }
          }
        }
      })
    );
  }

  // 2B. Merge curated Legends & Former Multi-Club Stars from seedPlayerLookup
  seedPlayerLookup.forEach((seed, normName) => {
    const flagUrl = seed.flagUrl || getFlagUrlFromEmoji(seed.flag);
    if (!livePlayerMap.has(normName)) {
      const nameParts = seed.name.split(/\s+/);
      const lastName = nameParts[nameParts.length - 1].toLowerCase();
      livePlayerMap.set(normName, {
        id: seed.id || 'legend_' + normName.replace(/[^a-z0-9]/g, '_'),
        name: seed.name,
        flag: seed.flag || '⚽',
        flagUrl,
        photoUrl: null,
        position: seed.position || 'FW',
        clubs: [...seed.clubs],
        rawTeams: [],
        aliases: Array.from(new Set([lastName, normName, ...(seed.aliases || [])].filter(Boolean))),
        fromLiveApi: true,
        isLegend: true,
        apiSynced: false
      });
    } else {
      const existing = livePlayerMap.get(normName);
      seed.clubs.forEach((cid) => {
        if (!existing.clubs.includes(cid)) existing.clubs.push(cid);
      });
    }
  });

  // 2C. Fetch 1,700+ Historical & Multi-Club Legends across all 32 Major European Clubs via Wikidata SPARQL
  try {
    const allQids = Object.keys(WIKIDATA_CLUB_QIDS);
    const qidBatches = [allQids.slice(0, 16), allQids.slice(16)];
    let legendsAdded = 0;
    let historiesEnriched = 0;

    await Promise.allSettled(
      qidBatches.map(async (qids) => {
        const valuesStr = qids.map((q) => 'wd:' + q).join(' ');
        const sparql = `SELECT ?player ?playerLabel ?club ?countryLabel WHERE { VALUES ?club { ${valuesStr} } ?player wdt:P31 wd:Q5 ; wdt:P106 wd:Q937857 ; wdt:P54 ?club ; wikibase:sitelinks ?sitelinks . FILTER(?sitelinks >= 38) OPTIONAL { ?player wdt:P27 ?country . } SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. } } LIMIT 3500`;
        const url = `${WIKIDATA_SPARQL_URL}?format=json&query=${encodeURIComponent(sparql)}`;
        const data = await fetchJsonWithTimeout(url, 8000);
        const bindings = data?.results?.bindings || [];

        for (const b of bindings) {
          const fullName = (b.playerLabel?.value || '').trim();
          if (!fullName || /^Q\d+$/.test(fullName)) continue;

          const clubUri = b.club?.value || '';
          const clubQid = clubUri.split('/').pop();
          const cid = WIKIDATA_CLUB_QIDS[clubQid];
          if (!cid) continue;

          const normName = normalizeText(fullName);
          const natName = b.countryLabel?.value || '';
          const natInfo = mapNationalityToFlagAndUrl(natName);

          if (!livePlayerMap.has(normName)) {
            const parts = fullName.split(/\s+/);
            const lastName = normalizeText(parts[parts.length - 1]);
            const qid = (b.player?.value || '').split('/').pop() || normName.replace(/[^a-z0-9]/g, '_');
            livePlayerMap.set(normName, {
              id: 'wd_' + qid,
              name: fullName,
              flag: natInfo.flag,
              flagUrl: natInfo.flagUrl || getFlagUrlFromEmoji(natInfo.flag),
              photoUrl: null,
              position: 'FW',
              clubs: [cid],
              rawTeams: [],
              aliases: Array.from(new Set([lastName, normName, fullName.toLowerCase()].filter(Boolean))),
              fromLiveApi: true,
              isLegend: true,
              apiSynced: false
            });
            legendsAdded++;
          } else {
            const existing = livePlayerMap.get(normName);
            if (!existing.clubs.includes(cid)) {
              existing.clubs.push(cid);
              historiesEnriched++;
            }
            if ((existing.flag === '⚽' || !existing.flagUrl) && natInfo.flagUrl) {
              existing.flag = natInfo.flag;
              existing.flagUrl = natInfo.flagUrl;
            }
          }
        }
      })
    );
    console.log(
      `🌟 Wikidata Legends Sync: Added ${legendsAdded} former/legend players & enriched ${historiesEnriched} historical club transfers!`
    );
  } catch (err) {
    // Non-fatal if Wikidata is slow
  }

  if (livePlayerMap.size > 100) {
    PLAYERS.length = 0;
    livePlayerMap.forEach((p) => PLAYERS.push(p));
    console.log(
      `✅ Total Ready Players in Memory: ${PLAYERS.length} (Active 2026-27 + Legends/Former Players across ${CLUBS.length} clubs)!`
    );
  }

  // 3. Fetch Live 2026-27 Season Top 10 Leaderboards (Goals & Assists) from ESPN Statistics API
  const statLeagues = [
    { slug: 'eng.1', titlePrefix: 'พรีเมียร์ลีก อังกฤษ', badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
    { slug: 'esp.1', titlePrefix: 'ลาลีกา สเปน', badge: '🇪🇸 La Liga' },
    { slug: 'ita.1', titlePrefix: 'กัลโช่ เซเรียอา อิตาลี', badge: '🇮🇹 Serie A' },
    { slug: 'ger.1', titlePrefix: 'บุนเดสลีกา เยอรมนี', badge: '🇩🇪 Bundesliga' },
    { slug: 'fra.1', titlePrefix: 'ลีกเอิง ฝรั่งเศส', badge: '🇫🇷 Ligue 1' },
    { slug: 'uefa.champions', titlePrefix: 'ยูฟ่า แชมเปียนส์ลีก (UCL)', badge: '🏆 UEFA Champions League' }
  ];

  const liveTop10Lists = [];
  await Promise.allSettled(
    statLeagues.map(async (lg) => {
      const stData = await fetchJsonWithTimeout(`${ESPN_SITE_API}/${lg.slug}/statistics`, 5000);
      if (!stData || !Array.isArray(stData.stats)) return;
      const seasonLabel = stData.season?.abbreviation || '2026-27';

      const goalsCat = stData.stats.find((s) => s.name === 'goalsLeaders');
      if (goalsCat && Array.isArray(goalsCat.leaders) && goalsCat.leaders.length >= 10) {
        liveTop10Lists.push({
          id: `live_goals_${lg.slug.replace('.', '_')}`,
          title: `10 อันดับดาวซัลโว ${lg.titlePrefix} ฤดูกาลล่าสุด (${seasonLabel})`,
          category: `${lg.badge} ${seasonLabel} Top Goalscorers (Live API)`,
          items: goalsCat.leaders.slice(0, 10).map((ldr, idx) => {
            const ath = ldr.athlete || {};
            const name = ath.displayName || 'Unknown';
            const seed = seedPlayerLookup.get(normalizeText(name));
            const natInfo = mapNationalityToFlagAndUrl(ath.flag?.alt, ath.flag?.href);
            const teamName = ath.team?.shortDisplayName || ath.team?.name || '';
            return {
              rank: idx + 1,
              name,
              flag: seed?.flag || natInfo.flag,
              flagUrl: natInfo.flagUrl,
              stat: `${ldr.value} ประตู (${teamName})`,
              points: 1,
              aliases: Array.from(new Set([ath.lastName?.toLowerCase() || '', ...(seed?.aliases || [])].filter(Boolean)))
            };
          })
        });
      }

      const assistsCat = stData.stats.find((s) => s.name === 'assistsLeaders');
      if (assistsCat && Array.isArray(assistsCat.leaders) && assistsCat.leaders.length >= 10) {
        liveTop10Lists.push({
          id: `live_assists_${lg.slug.replace('.', '_')}`,
          title: `10 อันดับจอมแอสซิสต์ ${lg.titlePrefix} ฤดูกาลล่าสุด (${seasonLabel})`,
          category: `${lg.badge} ${seasonLabel} Top Assists (Live API)`,
          items: assistsCat.leaders.slice(0, 10).map((ldr, idx) => {
            const ath = ldr.athlete || {};
            const name = ath.displayName || 'Unknown';
            const seed = seedPlayerLookup.get(normalizeText(name));
            const natInfo = mapNationalityToFlagAndUrl(ath.flag?.alt, ath.flag?.href);
            const teamName = ath.team?.shortDisplayName || ath.team?.name || '';
            return {
              rank: idx + 1,
              name,
              flag: seed?.flag || natInfo.flag,
              flagUrl: natInfo.flagUrl,
              stat: `${ldr.value} แอสซิสต์ (${teamName})`,
              points: 1,
              aliases: Array.from(new Set([ath.lastName?.toLowerCase() || '', ...(seed?.aliases || [])].filter(Boolean)))
            };
          })
        });
      }
    })
  );

  if (liveTop10Lists.length > 0) {
    TOP10_LISTS.length = 0;
    liveTop10Lists.forEach((l) => TOP10_LISTS.push(l));
    console.log(`✅ Replaced TOP10_LISTS with ${TOP10_LISTS.length} live 2026-27 leaderboards!`);
  }

  // 4. Fetch Live 2026-27 Match Lineups (11 Starting XI) from ESPN Scoreboard + Summary API
  const liveLineups = [];
  for (const lg of statLeagues.slice(0, 5)) {
    const sb = await fetchJsonWithTimeout(`${ESPN_SITE_API}/${lg.slug}/scoreboard`, 4500);
    const events = (sb?.events || []).slice(0, 2);
    for (const ev of events) {
      const sum = await fetchJsonWithTimeout(`${ESPN_SITE_API}/${lg.slug}/summary?event=${ev.id}`, 4500);
      if (!sum || !Array.isArray(sum.rosters)) continue;
      for (const r of sum.rosters) {
        const starters = (r.roster || []).filter((x) => x.starter);
        if (starters.length === 11) {
          const teamName = r.team?.displayName || 'Team';
          const oppTeam = sum.rosters.find((o) => o !== r)?.team?.displayName || '';
          const formation = r.formation || '4-3-3';
          const slots = buildPitchSlotsFromEspnStarters(starters);
          liveLineups.push({
            id: `live_xi_${ev.id}_${r.team?.id}`,
            title: `${teamName} - 11 ตัวจริงชุดล่าสุด (พบ ${oppTeam})`,
            subtitle: `ระบบ ${formation} • ${lg.titlePrefix} (Live API 2026-27)`,
            formation,
            clubColor: r.team?.color ? '#' + r.team.color : '#059669',
            slots
          });
        }
      }
    }
  }

  if (liveLineups.length > 0) {
    LINEUPS.length = 0;
    liveLineups.forEach((l) => LINEUPS.push(l));
    console.log(`✅ Replaced LINEUPS with ${LINEUPS.length} live 2026-27 match Starting XIs!`);
  }

  // 5. Enrich Career Histories (teamHistory) for Top Active Multi-Club Players & Build Live Career Path Puzzles
  const featuredStars = PLAYERS.filter((p) => seedPlayerLookup.has(normalizeText(p.name))).slice(0, 24);
  const liveCareerPaths = [];

  await Promise.allSettled(
    featuredStars.map(async (star) => {
      if (!star.espnId) return;
      const bio = await fetchEspnAthleteBio(star.espnId);
      if (bio && Array.isArray(bio.teamHistory)) {
        const clubSteps = [];
        bio.teamHistory.forEach((th) => {
          const isNational = th.slug && !th.slug.includes('.');
          if (isNational) return;
          const cid = mapApiTeamNameToClubId(th.displayName, th.id);
          if (cid && !star.clubs.includes(cid)) {
            star.clubs.push(cid);
          }
          clubSteps.push({
            years: th.seasons || '-',
            club: th.displayName,
            clubBadgeUrl: th.logo || null,
            apps: `${th.seasonCount || 1} ฤดูกาล`,
            goals: 'ชุดใหญ่'
          });
        });

        if (clubSteps.length >= 2 && liveCareerPaths.length < 15) {
          liveCareerPaths.push({
            id: `live_cp_${star.espnId}`,
            answerName: star.name,
            flag: star.flag,
            flagUrl: star.flagUrl,
            position: star.position,
            aliases: star.aliases || [],
            hint: `นักเตะชุดปัจจุบันในศึก 5 ลีกใหญ่ยุโรป ฤดูกาล 2026-27 (ข้อมูลสดจาก Live API)`,
            steps: [...clubSteps].reverse()
          });
        }
      }
    })
  );

  if (liveCareerPaths.length >= 4) {
    CAREER_PATHS.length = 0;
    liveCareerPaths.forEach((cp) => CAREER_PATHS.push(cp));
    console.log(`✅ Replaced CAREER_PATHS with ${CAREER_PATHS.length} live 2026-27 player career timelines!`);
  }

  // 6. Build Live 2026-27 Trivia Questions from the live leaderboards
  if (liveTop10Lists.length >= 2) {
    const liveTrivia = [];
    liveTop10Lists.forEach((list, idx) => {
      if (list.items.length >= 4) {
        const top1 = list.items[0];
        const opts = [top1.name, list.items[1].name, list.items[2].name, list.items[3].name];
        const correctName = top1.name;
        const shuffled = [...opts].sort((a, b) => a.localeCompare(b));
        const correctIdx = shuffled.indexOf(correctName);
        liveTrivia.push({
          id: `live_tr_${idx + 1}`,
          question: `[Live 2026-27] ใครคือผู้นำอันดับ 1 ในหัวข้อ "${list.title}" ณ ปัจจุบันด้วยสถิติ ${top1.stat}?`,
          options: shuffled,
          correctIndex: correctIdx,
          explanation: `${top1.name} นำเป็นอันดับ 1 ในฤดูกาลล่าสุดด้วยสถิติ ${top1.stat}`
        });
      }
    });
    if (liveTrivia.length >= 4) {
      TRIVIA_QUESTIONS.length = 0;
      liveTrivia.forEach((q) => TRIVIA_QUESTIONS.push(q));
      console.log(`✅ Replaced TRIVIA_QUESTIONS with ${TRIVIA_QUESTIONS.length} live 2026-27 season trivia questions!`);
    }
  }

  // 7. Pre-warm photos for top 24 players in background (non-blocking)
  (async () => {
    const topPhotoTargets = PLAYERS.slice(0, 24);
    for (const p of topPhotoTargets) {
      if (!p.photoUrl) {
        await getPlayerPhotoByName(p.name);
      }
    }
  })();
}

module.exports = {
  searchPlayersFromApi,
  enrichPlayerClubHistory,
  initializeFootballApiData,
  getFlagUrlFromEmoji,
  getPlayerPhotoByName,
  mapApiTeamNameToClubId
};
