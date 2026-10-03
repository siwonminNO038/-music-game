/* =========================================================
 *  게임 로직 (DOM 의존 없음)
 * ========================================================= */

let S = null;                       // 전체 게임 상태
const SAVE_KEY = 'underToGrammy_save_v1';
const START_YEAR = 2026;

/* ---------- 유틸 ---------- */
const R = () => Math.random();
const rnd = (a, b) => a + R() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(R() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sum = arr => arr.reduce((a, b) => a + b, 0);
const avg = arr => arr.length ? sum(arr) / arr.length : 0;
function uid(p) { S.uid = (S.uid || 0) + 1; return p + S.uid; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function weightedPick(items, wf) {
  const ws = items.map(wf); const tot = sum(ws); if (tot <= 0) return items[0];
  let r = R() * tot; for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

const yearOf = t => START_YEAR + Math.floor((t - 1) / 52);
const weekOf = t => (((t - 1) % 52) + 52) % 52 + 1;
const monthOf = w => Math.min(12, Math.floor((w - 1) * 12 / 52) + 1);
const monthStart = m => Math.floor((m - 1) * 52 / 12) + 1;
function dateLabel(t) {
  const w = weekOf(t), m = monthOf(w);
  return `${yearOf(t)}년 ${m}월 ${w - monthStart(m) + 1}주`;
}

function fmtNum(n) {
  n = Math.round(n);
  if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 0 : 1).replace(/\.0$/, '') + '억';
  if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + '만';
  return n.toLocaleString('ko-KR');
}
function fmtMoney(n) {
  const neg = n < 0; n = Math.abs(Math.round(n));
  let s;
  if (n >= 1e8) { const e = Math.floor(n / 1e8), m = Math.floor((n % 1e8) / 1e4); s = e + '억' + (m ? ' ' + m.toLocaleString() + '만' : ''); }
  else if (n >= 1e4) s = Math.floor(n / 1e4).toLocaleString() + '만';
  else s = n.toLocaleString();
  return (neg ? '-' : '') + s + '원';
}

/* ---------- 조회 헬퍼 ---------- */
const npc = id => S.npcs.find(n => n.id === id);
const song = id => S.songs.find(s => s.id === id);
const release = id => S.releases.find(r => r.id === id);
const labelOf = id => id === 'mylabel' ? (S && S.myLabel ? myLabelObj() : null) : LABELS.find(l => l.id === id);
function myLabelObj() {
  const L = S.myLabel;
  return {
    id: 'mylabel', name: L.name, tier: '내 레이블', minFame: 0, promo: +(1.1 + 0.2 * L.lv.promo).toFixed(2), share: 1, advance: 0,
    cred: 2 + L.lv.studio, global: 0.03 * L.lv.promo, quota: 0, weeks: 0, genres: GENRES, own: true,
    desc: `${S.player.stage}${josa(S.player.stage, '이')} ${dateLabel(L.foundedT)}에 설립한 레이블`
  };
}
/* 내 노래에 적용되는 레이블 (계약 레이블 또는 내 레이블) */
function myActiveLabel() { const p = S.player; return p.label ? labelOf(p.label) : S.myLabel ? myLabelObj() : null; }
const crewOf = id => S.crews.find(c => c.id === id);
const P = () => S.player;
function totalFollowers() { const f = S.player.followers; return f.insta + f.x + f.youtube; }
function artistName(id) { return id === 'player' ? S.player.stage : (npc(id) ? npc(id).name : '???'); }
function crewMembers(cid) { return S.npcs.filter(n => n.crew === cid); }
function unreleasedSongs() { return S.songs.filter(s => !s.releaseId); }
function releasedSongs() { return S.songs.filter(s => s.releaseId); }

/* ---------- 로그 ---------- */
function addNews(text, type = 'info') {
  S.news.unshift({ t: S.t, text, type });
  if (S.news.length > 400) S.news.length = 400;
}
function addMilestone(key, text) {
  if (S.milestones.find(m => m.key === key)) return false;
  S.milestones.push({ key, text, t: S.t });
  addNews('🏁 커리어 마일스톤: ' + text, 'good');
  return true;
}
/* 한국어 조사: 마지막 글자 받침 여부로 은/는, 이/가 등을 고른다 */
const JOSA = { '은': ['은', '는'], '이': ['이', '가'], '을': ['을', '를'], '과': ['과', '와'], '으로': ['으로', '로'], '아': ['아', '야'] };
function hasBatchim(word) {
  const w = String(word).replace(/[\s」』)\]"'.!?~]+$/, '');
  const c = w.charCodeAt(w.length - 1);
  if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28;
  return /[lmnrLMNR0136789]$/.test(w) ? 1 : 0;
}
function josa(word, key) {
  const pair = JOSA[key]; if (!pair) return '';
  const b = hasBatchim(word);
  if (key === '으로' && b === 8) return '로'; // ㄹ 받침
  return b ? pair[0] : pair[1];
}
function fill(str, vars) {
  return str.replace(/\{(?:([^:{}]+):)?(\w+)\}/g, (_, j, k) => {
    const v = vars[k] !== undefined ? vars[k] : '';
    return j ? josa(v, j) : v;
  });
}

/* ---------- 팬 반응 생성 ---------- */
function react(context, n, vars = {}, opts = {}) {
  const tpl = REACTIONS[context];
  if (!tpl) return [];
  const p = S.player;
  const v = Object.assign({ stage: p.stage }, vars);
  if (!v.npc) {
    const rivals = S.npcs.filter(x => x.region === 'KR' && x.role === 'artist' && x.genre === p.genre);
    v.npc = rivals.length ? pick(rivals.sort((a, b) => b.fame - a.fame).slice(0, 6)).name : '누군가';
  }
  const base = {
    core: 1 + p.coreRatio / 8,
    casual: 1.5,
    critic: 1,
    hater: 0.3 + p.antiRatio / 6 + p.fame / 90,
    old: p.debutT && S.t - p.debutT > 52 ? 1 : 0.25,
    global: 0.05 + p.globalFame / 15,
    meme: 0.4 + p.fame / 100,
    rival: vars.npc ? 0.7 : 0.25
  };
  const mult = opts.weights || {};
  const keys = Object.keys(tpl);
  const out = [];
  const used = new Set();
  for (let i = 0; i < n; i++) {
    const k = weightedPick(keys, k => (base[k] || 0.5) * (mult[k] !== undefined ? mult[k] : 1));
    let text = fill(pick(tpl[k]), v);
    if (used.has(text)) text = fill(pick(tpl[k]), v);
    used.add(text);
    const handle = fill(pick(PERSONAS[k].handles), { s: p.stage.replace(/\s/g, ''), n: v.npc.replace(/\s/g, '') });
    const likes = Math.max(0, Math.round(rnd(0, 1) ** 2 * (20 + Math.sqrt(totalFollowers()) * 4)));
    const r = { t: S.t, ctx: context, persona: k, handle, text, likes, src: opts.src || '' };
    out.push(r);
    S.reactions.unshift(r);
  }
  if (S.reactions.length > 500) S.reactions.length = 500;
  return out;
}

/* =========================================================
 *  새 게임
 * ========================================================= */
function newGame({ name, stage, bgId, genre, gender }) {
  const bg = BACKGROUNDS.find(b => b.id === bgId) || BACKGROUNDS[0];
  S = {
    v: 1, uid: 0, t: 1,
    player: {
      name, stage, gender: gender || '', bg: bg.id, genre: genre || bg.genre, age: 20,
      skills: Object.assign({}, bg.skills),
      money: bg.money, mental: 80, fame: bg.fame, globalFame: 0,
      legacy: bg.fame * 0.6, gLegacy: 0, buzz: 0, hype: 0, cred: bg.credibility,
      followers: { insta: Math.round(bg.followers * 0.55), x: Math.round(bg.followers * 0.25), youtube: Math.round(bg.followers * 0.2) },
      coreRatio: 15, antiRatio: 2, sentiment: 60,
      label: null, contract: null, crew: null,
      debutT: null, lastReleaseT: null, dissTarget: null, dissDeadline: 0,
      tvDoneYear: 0, burnout: false, totalEarned: 0,
      weeklyDom: 0, weeklyGlob: 0, inspiration: [], military: null
    },
    ap: 3, postsLeft: 3,
    npcs: [], crews: CREWS.map(c => Object.assign({ own: false }, c)),
    songs: [], releases: [], npcReleases: [], chartSongs: [],
    charts: { melon: [], hot100: [], bb200: [] }, chartMeta: {},
    posts: [], reactions: [], news: [], inbox: [],
    awards: {}, trophies: [], nominations: [], yearLists: [], milestones: [],
    history: [], lastSummary: null, cooldowns: {},
    flags: {}, flagT: {}, story: [], npcWins: {}, goalsDone: {}, chapter: 0,
    myLabel: null, rivalId: null, mentorId: null, lastRelCritic: null
  };
  // NPC
  NPC_KR.forEach(n => S.npcs.push(mkNpc(n, 'KR')));
  NPC_GLOBAL.forEach(n => S.npcs.push(mkNpc(n, 'GLOBAL')));
  // 작년 데뷔한 신인들 (첫 시상식 신인상 후보)
  spawnRookies(START_YEAR - 1, 3, 1);
  // 라이벌: 나와 같은 해에 데뷔하는 동갑내기
  const rival = mkNpc({
    name: genArtistName('KR'), genre: genre || bg.genre, fame: Math.max(4, bg.fame + 2), skill: rint(64, 74),
    trait: pick(['허세', '카리스마', '독설가']), bio: `${stage}${josa(stage, '과')} 같은 해에 데뷔한 라이벌`
  }, 'KR');
  rival.debutYear = START_YEAR; rival.forceRelT = rint(5, 12); rival.rival = true; rival.rel = 20;
  S.npcs.push(rival); S.rivalId = rival.id;
  // 멘토: 같은 장르의 베테랑
  const vets = S.npcs.filter(n => n.region === 'KR' && n.role === 'artist' && !n.rival && n.genre === (genre || bg.genre)).sort((a, b) => b.skill - a.skill);
  const mentor = vets[0] || S.npcs.find(n => n.region === 'KR' && n.role === 'artist');
  mentor.rel = 30; mentor.mentor = true; S.mentorId = mentor.id;
  // 작년(2025) 씬 시뮬레이션: 시상식/차트에 필요한 데이터
  S.npcs.filter(n => n.debutYear === START_YEAR - 1).forEach(n => n.forceRelT = rint(-40, -5));
  for (let t = -51; t <= 0; t++) {
    S.t = t;
    npcWeeklyReleases(t, true);
    spawnBackgroundSongs(t);
    tickChartSongs(t);
  }
  S.t = 1;
  computeCharts(true);
  addNews(`${stage}, 음악 인생을 시작하다. "언젠가 그래미 무대에 설 거야."`, 'good');
  addStory(fill(PROLOGUE[bg.id] || PROLOGUE.underground, storyVars()), 'prologue');
  addStory(`${CHAPTERS[0].title} — ${fill(CHAPTERS[0].text, storyVars())}`, 'chapter');
  react('post_daily', 2, {}, { weights: { hater: 0, meme: 0 } });
  save();
  return S;
}

function mkNpc(n, region) {
  return {
    id: uid('a'), name: n.name, genre: n.genre, fame: n.fame, skill: n.skill, trait: n.trait,
    label: n.label || null, crew: n.crew || null, role: n.role || 'artist', region,
    rel: rint(0, 22), debutYear: 2016 + rint(0, 7), lastRelT: -999, forceRelT: null, bio: n.bio || ''
  };
}

function spawnRookies(y, nk, ng) {
  const out = [];
  for (let i = 0; i < nk + ng; i++) {
    const region = i < nk ? 'KR' : 'GLOBAL';
    const n = mkNpc({
      name: genArtistName(region),
      genre: pick(region === 'KR' ? ['힙합', '힙합', '힙합', 'R&B', 'R&B', '인디', '팝', '록', '일렉트로닉'] : ['힙합', 'R&B', '팝', '인디']),
      fame: region === 'KR' ? rint(5, 25) : rint(40, 70), skill: rint(55, 88),
      trait: pick(['감성적', '유쾌함', '허세', '장인', '신비주의', '독설가']), bio: `${y}년 데뷔한 신인`
    }, region);
    n.name = n.name.trim();
    while (S.npcs.find(x => x.name === n.name)) n.name += ' ' + pick(['K', 'J', 'Z', '2', 'Jr.']);
    n.debutYear = y;
    n.forceRelT = (y - START_YEAR) * 52 + rint(2, 40);
    S.npcs.push(n); out.push(n);
  }
  return out;
}

/* ---------- 스토리 ---------- */
function storyVars(extra) {
  const p = S.player;
  const r = S.rivalId && npc(S.rivalId), m = S.mentorId && npc(S.mentorId);
  return Object.assign({
    stage: p.stage, name: p.name, rival: r ? r.name : '라이벌', mentor: m ? m.name : '선배',
    child: p.gender === 'm' ? '아들' : p.gender === 'f' ? '딸' : '우리 애',
    sib: p.gender === 'm' ? '형' : p.gender === 'f' ? '누나' : '선배님',
    years: p.debutT ? Math.max(1, Math.round((S.t - p.debutT) / 52)) : 1
  }, extra || {});
}
function addStory(text, kind = 'story') {
  S.story.push({ t: S.t, text, kind });
  if (S.story.length > 400) S.story.shift();
}

/* 곡 제목 생성: 장르별 단어장 + 다양한 패턴 */
function genTitle(region, genre) {
  const r = R();
  if (region === 'GLOBAL') {
    if (r < 0.45) return pick(TITLE_EN_GLOBAL);
    if (r < 0.85) return fill(pick(EN_PATTERN), { w: pick(EN_WORD) });
    return pick(NUM_TITLES.filter(x => /^[\x00-\x7F]+$/.test(x)));
  }
  const bank = TITLE_BANK[genre] || TITLE_BANK['힙합'];
  if (r < 0.38) return pick(bank);
  if (r < 0.62) return fill(pick(KR_PHRASE), { n: pick(KR_NOUN), a: pick(KR_ADJ) });
  if (r < 0.78) return fill(pick(EN_PATTERN), { w: pick(EN_WORD) });
  if (r < 0.86) return pick(NUM_TITLES);
  if (r < 0.93) return pick(genre === '힙합' ? SLANG_TITLES : MIX_TITLES);
  return pick(MIX_TITLES);
}
function genAlbumTitle(region, genre, artist) {
  const pat = pick(ALBUM_PATTERN);
  const k = pick(KR_NOUN);
  const v = { w: pick(EN_WORD), w2: pick(EN_WORD), k, k2: pick(KR_NOUN), k3: pick(KR_NOUN), a: pick(KR_ADJ), num: rint(1, 4), name: artist || 'Self' };
  if (region === 'GLOBAL' && /[가-힣]/.test(fill(pat, v))) return R() < 0.5 ? pick(TITLE_EN_GLOBAL) : fill(pick(EN_PATTERN), { w: pick(EN_WORD) });
  if (R() < 0.25) return genTitle(region, genre);
  return fill(pat, v);
}
function genArtistName(region) {
  if (region === 'GLOBAL') return pick(['Lil ', 'Young ', 'DJ ', '', '', 'MC ', 'The ']) + pick(['Nova', 'Drift', 'Kane', 'Echo', 'Rome', 'Juno', 'Blaze', 'Indigo', 'Vex', 'Sable', 'Onyx', 'Wren', 'Cass', 'Reign', 'Halo']) + pick(['', '', ' Jones', ' Kid', 'X', ' Grey', ' Lane']);
  return pick(ROOKIE_PREFIX) + pick(ROOKIE_CORE);
}

/* =========================================================
 *  NPC 활동 / 차트용 배경곡
 * ========================================================= */
function npcWeeklyReleases(t, pre) {
  S.npcs.forEach(n => {
    if (n.role !== 'artist') return;
    if (n.debutYear > yearOf(t)) return;
    if (n.forceRelT === t) { npcRelease(n, t); n.forceRelT = null; return; }
    if (t - n.lastRelT < 10) return;
    const p = n.region === 'GLOBAL' ? 0.032 : n.label === 'mylabel' ? 0.045 : n.rival ? 0.04 : 0.026;
    if (R() < p) {
      const rel = npcRelease(n, t);
      if (!pre && rel) {
        if (n.label === 'mylabel') addNews(`🏷️ [${S.myLabel.name}] 소속 ${n.name}, ${typeName(rel.type)} 「${rel.title}」 발매 (평단 ${rel.critic})`, 'release');
        else if (n.rival) addNews(`⚔️ 라이벌 ${n.name}, 새 ${typeName(rel.type)} 「${rel.title}」 발매`, 'npc');
        else if (n.fame >= 55) addNews(`🆕 ${n.name}, 새 ${typeName(rel.type)} 「${rel.title}」 발매`, 'npc');
      }
    }
  });
}

function npcFee(n) {
  return Math.round((300000 + n.fame * n.fame * 2500) * (n.region === 'GLOBAL' ? 6 : 1) / 10000) * 10000;
}
function playerFee() {
  const p = S.player;
  return Math.round((300000 + p.fame * p.fame * 2500 + p.globalFame * p.globalFame * 6000) / 10000) * 10000;
}

function npcRelease(n, t, opts = {}) {
  const r = R();
  const type = opts.type || (r < 0.5 ? 'single' : r < 0.78 ? 'EP' : 'album');
  const lab = n.label ? labelOf(n.label) : null;
  const critic = clamp(n.skill + rnd(-16, 12) + (lab ? lab.cred * 0.5 : 0) + (n.label === 'mylabel' ? S.myLabel.lv.studio * 2 : 0), 25, 97);
  const songTitle = genTitle(n.region, n.genre);
  const title = type === 'single' ? songTitle : genAlbumTitle(n.region, n.genre, n.name);
  const feats = [];
  if (opts.featPlayer) feats.push('player');
  else if (R() < 0.3) {
    const pool = S.npcs.filter(x => x.region === n.region && x.id !== n.id && x.role === 'artist' && x.debutYear <= yearOf(t));
    if (pool.length) feats.push(weightedPick(pool, x => (x.crew && x.crew === n.crew ? 4 : 1) * (x.genre === n.genre ? 2 : 1)).id);
  }
  let producer = null;
  if (n.region === 'KR' && R() < 0.5) {
    const prods = S.npcs.filter(x => x.role === 'producer');
    producer = weightedPick(prods, x => x.genre === n.genre ? 3 : 1).id;
  }
  const hook = rnd(30, 95);
  const rel = {
    id: uid('nr'), artistId: n.id, type, title, t, genre: n.genre, critic: Math.round(critic),
    region: n.region, feats, producer,
    trackTitle: songTitle,
    trackCritic: Math.round(clamp(critic + rnd(-7, 7), 20, 99)),
    songId: null, total: 0, totalGlob: 0, rookie: n.debutYear === yearOf(t)
  };
  const reach = n.region === 'KR' ? 2500 + Math.pow(n.fame, 2.25) * 32 : 3000 + Math.pow(n.fame, 2.2) * 14;
  const gReach = n.region === 'GLOBAL' ? 20000 + Math.pow(n.fame, 2.4) * 600 : Math.pow(n.fame, 2.25) * 32 * 0.06;
  let mult = (0.35 + hook / 100 * 1.1 + critic / 100 * 0.35) * rnd(0.6, 1.35) * (lab ? Math.sqrt(lab.promo) : 1);
  let featDom = 0, featGlob = 0;
  feats.forEach(fid => {
    if (fid === 'player') { featDom += Math.pow(S.player.fame, 2.25) * 32 * 0.35; featGlob += Math.pow(S.player.globalFame, 2.4) * 600 * 0.3; }
    else { const f = npc(fid); featDom += Math.pow(f.fame, 2.25) * 32 * 0.3; if (f.region === 'GLOBAL') featGlob += Math.pow(f.fame, 2.4) * 600 * 0.25; }
  });
  const s = {
    id: uid('cs'), artistId: n.id, artist: null, title: rel.trackTitle, releaseId: rel.id,
    domBase: (reach + featDom) * mult, globBase: (gReach + featGlob) * mult,
    decay: clamp(0.8 + hook * 0.0011 + critic * 0.0005 + rnd(-0.03, 0.03), 0.72, 0.955),
    startT: t, dom: 0, glob: 0, total: 0, totalGlob: 0, feats, albumMult: type === 'album' ? 2.4 : type === 'EP' ? 1.6 : 1
  };
  rel.songId = s.id;
  S.chartSongs.push(s);
  S.npcReleases.push(rel);
  n.lastRelT = t;
  n.fame = clamp(n.fame + (critic - 68) / 18 + rnd(-1.2, 1.2) + (n.rival ? 1.5 : 0), 4, 99);
  return rel;
}

function spawnBackgroundSongs(t) {
  // 차트를 채우는 이름 없는(배경) 아티스트들의 곡
  const kr = rint(5, 8), gl = rint(8, 12);
  for (let i = 0; i < kr; i++) {
    const base = Math.exp(rnd(Math.log(40000), Math.log(1200000)));
    S.chartSongs.push({ id: uid('cs'), artistId: null, artist: genArtistName('KR'), title: genTitle('KR', pick(GENRES)), domBase: base, globBase: base * 0.04, decay: rnd(0.78, 0.93), startT: t, dom: 0, glob: 0, total: 0, totalGlob: 0, feats: [], bg: true });
  }
  for (let i = 0; i < gl; i++) {
    const base = Math.exp(rnd(Math.log(2e6), Math.log(3.5e7)));
    S.chartSongs.push({ id: uid('cs'), artistId: null, artist: genArtistName('GLOBAL'), title: genTitle('GLOBAL'), domBase: base * 0.004, globBase: base, decay: rnd(0.84, 0.95), startT: t, dom: 0, glob: 0, total: 0, totalGlob: 0, feats: [], bg: true, albumMult: R() < 0.5 ? 2 : 0 });
  }
}

function tickChartSongs(t) {
  S.chartSongs.forEach(s => {
    const age = t - s.startT;
    if (age < 0) { s.dom = 0; s.glob = 0; return; }
    const d = Math.pow(s.decay, age) * rnd(0.88, 1.12);
    s.dom = s.domBase * d; s.glob = s.globBase * d;
    s.total += s.dom; s.totalGlob += s.glob;
    if (s.releaseId) {
      const r = S.npcReleases.find(x => x.id === s.releaseId);
      if (r) { r.total = s.total * (s.albumMult || 1); r.totalGlob = s.totalGlob * (s.albumMult || 1); }
    }
  });
  S.chartSongs = S.chartSongs.filter(s => {
    const age = t - s.startT;
    if (age < 3) return true;
    if (s.bg) return s.dom > 30000 || s.glob > 2e6;
    return s.dom > 6000 || s.glob > 300000 || age < 10;
  });
}

/* =========================================================
 *  곡 작업
 * ========================================================= */
function perfSkill(genre) {
  const m = GENRE_PERF[genre] || GENRE_PERF['힙합'];
  const sk = S.player.skills;
  return (m.flow || 0) * sk.flow + (m.vocal || 0) * sk.vocal;
}

function featChance(n) {
  const p = S.player;
  if (n.region === 'GLOBAL' && p.globalFame < 8) return 0;
  const f = n.region === 'GLOBAL' ? p.globalFame + p.fame * 0.25 : p.fame;
  let c = 0.3 + n.rel / 140 + (f - n.fame) / 90;
  if (p.label && p.label === n.label) c += 0.2;
  if (p.crew && p.crew === n.crew) c += 0.25;
  if (n.trait === '까칠함' || n.trait === '신비주의') c -= 0.08;
  if (n.trait === '유쾌함') c += 0.06;
  if (p.dissTarget === n.id) return 0;
  return clamp(c, 0.02, 0.96);
}

function songCost(opts) {
  let c = 0;
  if (opts.producer) c += Math.round(npcFee(npc(opts.producer)) * 0.7 / 10000) * 10000;
  (opts.feats || []).forEach(f => { if (f) c += npcFee(npc(f)); });
  return c;
}

// opts: {title, genre, theme, deep, producer, feats:[id,id]}
function makeSong(opts) {
  const p = S.player;
  const apCost = opts.deep ? 2 : 1;
  if (S.ap < apCost) return { ok: false, msg: '행동력이 부족합니다.' };
  if (!opts.title || !opts.title.trim()) return { ok: false, msg: '곡 제목을 입력하세요.' };
  const notes = [];
  let money = 0;
  // 프로듀서
  let prod = null;
  if (opts.producer) {
    const pr = npc(opts.producer);
    const fee = Math.round(npcFee(pr) * 0.7 / 10000) * 10000;
    if (R() < featChance(pr) + 0.15 && p.money >= fee) { prod = pr; money += fee; notes.push(`🎛️ ${pr.name}${josa(pr.name, '이')} 프로듀싱을 맡았습니다. (${fmtMoney(fee)})`); pr.rel = clamp(pr.rel + 6, 0, 100); }
    else notes.push(`🙅 ${pr.name}${josa(pr.name, '이')} 프로듀싱 제안을 거절했습니다. 셀프 프로듀싱으로 진행합니다.`);
  }
  // 피처링
  const feats = [];
  (opts.feats || []).filter(Boolean).slice(0, 2).forEach(fid => {
    const f = npc(fid);
    const free = S.flags.mentor_free && fid === S.mentorId;
    const fee = free ? 0 : npcFee(f);
    if (p.money - money < fee) { notes.push(`💸 ${f.name}의 피처링 비용(${fmtMoney(fee)})이 부족합니다.`); return; }
    if (free) { S.flags.mentor_free = false; feats.push(fid); f.rel = clamp(f.rel + 10, 0, 100); notes.push(`🧔 약속대로 ${f.name}${josa(f.name, '이')} 무료로 피처링했습니다. "실망시키지 마라."`); return; }
    if (R() < featChance(f)) {
      feats.push(fid); money += fee; f.rel = clamp(f.rel + 10, 0, 100);
      notes.push(`🤝 ${f.name}${josa(f.name, '이')} 피처링을 수락했습니다! (${fmtMoney(fee)})`);
    } else {
      f.rel = clamp(f.rel - 2, 0, 100);
      notes.push(`🙅 ${f.name}${josa(f.name, '이')} 피처링을 거절했습니다. "${pick(['요즘 스케줄이 꽉 차서요', '음악 색깔이 좀 안 맞는 것 같아요', '다음에 기회 되면 해요', '...(읽씹)', '좀 더 유명해지면 연락 주세요 ㅎ'])}"`);
    }
  });
  const sk = p.skills;
  const mentalMod = (p.mental - 55) / 7;
  const deep = opts.deep ? 9 : 0;
  const roll = (base) => clamp(base * 0.78 + 14 + rnd(-11, 14) + deep + mentalMod, 3, 100);
  let a = {
    lyric: roll(sk.lyric),
    sound: prod ? clamp(prod.skill * 0.85 + 12 + rnd(-6, 8) + deep * 0.5, 5, 100) : roll(sk.produce),
    hook: roll(perfSkill(opts.genre) * 0.5 + sk.produce * 0.25 + sk.lyric * 0.25),
    originality: clamp(avg(Object.values(sk)) * 0.55 + rnd(5, 45) + deep * 0.6 + mentalMod * 0.5, 3, 100),
    perf: roll(perfSkill(opts.genre) * 0.85 + sk.stage * 0.15)
  };
  const th = opts.theme;
  if (th === '플렉스' || th === '파티') { a.hook += 6; a.lyric -= 4; }
  if (th === '사회비판' || th === '자전적 서사' || th === '가족') { a.lyric += 5; a.hook -= 3; }
  if (th === '실험적') { a.originality += 12; a.hook -= 8; }
  if (th === '사랑/이별' || th === '청춘') { a.hook += 4; }
  if (th === '디스') { a.lyric += 3; a.perf += 3; }
  if (th === '우울/불안') { a.lyric += 3; a.originality += 3; a.hook -= 2; }
  if (prod) a.hook += 3;
  feats.forEach(fid => { const f = npc(fid); a.hook += 3 + f.skill * 0.05; a.perf += 2 + f.skill * 0.03; a.originality += 1; });
  if (opts.genre !== p.genre) a.originality += 3;
  if (S.myLabel) { a.sound += S.myLabel.lv.studio * 2; }
  // 영감: 스토리에서 얻은 감정이 같은 주제의 곡에 녹아든다
  const insp = (p.inspiration || []).find(x => x.theme === th && x.until >= S.t);
  if (insp) {
    a.lyric += insp.bonus; a.originality += insp.bonus * 0.5; a.perf += insp.bonus * 0.3; a.hook += insp.bonus * 0.4;
    p.inspiration = p.inspiration.filter(x => x !== insp);
    notes.push(`💡 '${th}' 영감이 곡에 녹아들었습니다. (+${insp.bonus})`);
  }
  // 제목과 주제가 맞으면 곡의 인상이 선명해진다
  const titleMatch = titleFitsTheme(opts.title, th);
  if (titleMatch) { a.hook += 2; a.originality += 1; }
  Object.keys(a).forEach(k => a[k] = Math.round(clamp(a[k], 1, 100)));
  const quality = Math.round(a.lyric * 0.24 + a.sound * 0.24 + a.hook * 0.2 + a.originality * 0.14 + a.perf * 0.18);
  const s = {
    id: uid('s'), title: opts.title.trim(), genre: opts.genre, theme: opts.theme, attrs: a, quality,
    feats, producer: prod ? prod.id : null, createdT: S.t, releaseId: null,
    startT: null, domBase: 0, globBase: 0, decay: 0.85, boost: 0,
    dom: 0, glob: 0, totalDom: 0, totalGlob: 0, peakMelon: null, peakHot: null, critic: null, role: null
  };
  s.note = songNote(s, titleMatch);
  S.songs.push(s);
  p.money -= money;
  S.ap -= apCost;
  p.mental = clamp(p.mental - (opts.deep ? 8 : 5), 0, 100);
  // 작업하면서 성장
  const gain = (k, g) => { sk[k] = clamp(sk[k] + g * (105 - sk[k]) / 100, 0, 100); };
  gain('lyric', 0.35); if (!prod) gain('produce', 0.35);
  Object.keys(GENRE_PERF[opts.genre]).forEach(k => gain(k, 0.3 * GENRE_PERF[opts.genre][k]));
  if (opts.deep) notes.push('⏳ 공들여 작업한 만큼 완성도가 올라갔습니다.');
  if (p.mental < 30) notes.push('😵 멘탈이 불안정해 작업 퀄리티에 영향을 받았습니다.');
  save();
  return { ok: true, song: s, notes };
}

function renameSong(id, title) {
  const s = song(id); if (!s || !title.trim()) return;
  s.title = title.trim(); s.note = songNote(s, titleFitsTheme(s.title, s.theme)); save();
}

function titleFitsTheme(title, theme) {
  const t = String(title).toLowerCase();
  return (THEME_KEYWORDS[theme] || []).some(k => t.includes(k.toLowerCase()));
}

/* 완성된 곡을 직접 판단해 작업 노트를 쓴다 */
function songNote(s, titleMatch) {
  const g = grade(s.quality);
  const v = Object.assign(storyVars(), { t: s.title });
  const ks = Object.keys(s.attrs);
  const best = ks.reduce((a, b) => s.attrs[a] >= s.attrs[b] ? a : b);
  const worst = ks.reduce((a, b) => s.attrs[a] <= s.attrs[b] ? a : b);
  const out = [fill(pick(SONG_NOTE.grade[g]), v), s.attrs[best] >= 62 ? pick(SONG_NOTE.best[best]) : SONG_NOTE.bestMeh[best]];
  if (s.attrs[worst] < 60 && worst !== best) out.push(pick(SONG_NOTE.weak[worst]));
  if (titleMatch) out.push(fill(pick(SONG_NOTE.titleMatch), v));
  else if (/^[\x00-\x7F]+$/.test(s.title)) out.push(pick(SONG_NOTE.titleEnglish));
  else if (s.title.length > 14) out.push(pick(SONG_NOTE.titleLong));
  else if (s.title.length <= 2) out.push(pick(SONG_NOTE.titleShort));
  if (s.feats.length) out.push(`${s.feats.map(artistName).join(', ')}의 참여로 곡에 새로운 색이 더해졌다.`);
  out.push('엔지니어: ' + fill(pick(SONG_NOTE.engineer[g]), v));
  return out;
}
function grade(q) { return q >= 85 ? 'S' : q >= 75 ? 'A' : q >= 63 ? 'B' : q >= 50 ? 'C' : 'D'; }
function deleteSong(id) {
  const s = song(id); if (!s || s.releaseId) return;
  S.songs = S.songs.filter(x => x.id !== id); save();
}

/* =========================================================
 *  발매 & 평단
 * ========================================================= */
const PROMO_OPTIONS = [
  { cost: 0, mult: 1, label: '홍보 없음' },
  { cost: 1000000, mult: 1.2, label: 'SNS 광고 (100만원)' },
  { cost: 5000000, mult: 1.5, label: '플레이리스트 마케팅 (500만원)' },
  { cost: 20000000, mult: 2.0, label: '옥외광고 + 방송 (2,000만원)' },
  { cost: 100000000, mult: 2.8, label: '대규모 캠페인 (1억원)' }
];

function typeName(t) { return { single: '싱글', EP: 'EP', album: '정규 앨범', compilation: '컴필레이션', mixtape: '믹스테이프' }[t] || t; }

function releaseRules(type) {
  return { single: [1, 3], EP: [3, 7], album: [8, 25], compilation: [1, 3], mixtape: [1, 15] }[type];
}

function computeCohesion(tracks, concept, type) {
  if (type === 'single') return avg(tracks.map(s => s.quality));
  const n = tracks.length;
  const countBy = key => { const m = {}; tracks.forEach(s => m[s[key]] = (m[s[key]] || 0) + 1); return Math.max(...Object.values(m)) / n; };
  const qs = tracks.map(s => s.quality);
  const mean = avg(qs);
  const std = Math.sqrt(avg(qs.map(q => (q - mean) ** 2)));
  let c = 20 + 25 * countBy('genre') + 20 * countBy('theme') + mean * 0.35 - std * 0.6;
  if (type === 'album') { if (n > 16) c -= (n - 16) * 3; if (n >= 10 && n <= 14) c += 4; }
  if (type === 'EP' && n >= 5) c += 2;
  const titles = tracks.map(s => s.title.toLowerCase());
  if (/intro|인트로/.test(titles[0])) c += 3;
  if (/outro|아웃트로/.test(titles[n - 1])) c += 3;
  const featRatio = tracks.filter(s => s.feats.length).length / n;
  if (featRatio > 0.5) c -= 10;
  if (concept && concept.trim().length >= 20) c += 4;
  return clamp(Math.round(c), 0, 100);
}

function displayScore(outlet, s100) {
  if (outlet.scale === 'star5') {
    const st = clamp(Math.round(s100 / 20 * 2) / 2, 0.5, 5);
    return { text: '★'.repeat(Math.floor(st)) + (st % 1 ? '☆' : '') + ` ${st.toFixed(1)}`, value: st };
  }
  if (outlet.scale === 'pf') { const v = clamp(Math.round(s100) / 10, 0.5, 10); return { text: v.toFixed(1), value: v }; }
  const v = clamp(Math.round(s100 / 10), 1, 10);
  return { text: `${v}/10`, value: v };
}

function writeReview(outlet, s100, attrs, coh, tracks, rel) {
  const p = S.player;
  const tier = s100 >= 82 ? 'great' : s100 >= 68 ? 'good' : s100 >= 52 ? 'mid' : 'bad';
  const titleT = tracks.find(t => t.id === rel.titleTrackId) || tracks[0];
  const sorted = tracks.slice().sort((x, y) => y.quality - x.quality);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  const n = tracks.length;
  const tc = {}; tracks.forEach(t => tc[t.theme] = (tc[t.theme] || 0) + 1);
  const theme = Object.keys(tc).sort((x, y) => tc[y] - tc[x])[0];
  const themeShare = tc[theme] / n;
  const ks = Object.keys(attrs);
  const strong = ks.reduce((x, y) => attrs[x] * (outlet.w[x] + 0.1) >= attrs[y] * (outlet.w[y] + 0.1) ? x : y);
  const weak = ks.reduce((x, y) => attrs[x] <= attrs[y] ? x : y);
  const bestAttr = Object.keys(best.attrs).reduce((x, y) => best.attrs[x] >= best.attrs[y] ? x : y);
  const featTrack = tracks.find(t => t.feats.length);
  const v = { stage: p.stage, album: rel.title, title: titleT.title, best: best.title, worst: worst.title, n, themePhrase: THEME_PHRASE[theme] };
  const F = arr => fill(pick(arr), v);
  const multi = n > 1;

  if (outlet.voice === 'en') {
    const out = [F(RV_EN.open[tier])];
    out.push(fill(RV_EN.title[titleT.quality >= 72 ? rint(0, 1) : 2], v));
    if (multi && best !== titleT && best.quality >= 65) out.push(F(RV_EN.best));
    if (n >= 4 && best.quality - worst.quality >= 10) out.push(F(RV_EN.worst));
    if (themeShare >= 0.5) out.push(fill(pick(RV_EN.theme), { themePhrase: THEME_PHRASE_EN[theme] }));
    if (featTrack) out.push(fill(pick(RV_EN.feat), { feat: artistName(featTrack.feats[0]), track: featTrack.title }));
    out.push(F(RV_EN.close[tier]));
    return out.join(' ');
  }
  if (outlet.voice === 'casual') {
    const out = [F(RV_CASUAL.open[tier]), F(titleT.quality >= 60 && titleT.attrs.hook >= 55 ? RV_CASUAL.title : RV_CASUAL.titleBad)];
    if (multi && best !== titleT && best.quality >= 62) out.push(F(RV_CASUAL.best));
    if (n >= 4 && best.quality - worst.quality >= 12) out.push(F(RV_CASUAL.worst));
    out.push(fill(pick(RV_CASUAL.close), { verdict: fill(RV_CASUAL.verdict[tier], v) }));
    return out.join(' ');
  }

  // 정식 평론: 후보 문장을 우선순위와 함께 모은 뒤 5~7문장으로 엮는다
  const mid = [];
  const add = (prio, text) => { if (text) mid.push({ prio: prio + R() * 0.5, text }); };
  if (rel.type === 'single') add(3, F(RV.single));
  if (multi) {
    const same = tracks.find(t => t.title.trim() === rel.title.trim());
    if (same) add(3, fill(pick(RV.albumTitle.same), Object.assign({ same: same.title }, v)));
    else if (titleFitsTheme(rel.title, theme)) add(2.5, F(RV.albumTitle.theme));
    else if (/^[\x00-\x7F]+$/.test(rel.title)) add(1.5, F(RV.albumTitle.english));
    else if (rel.title.length > 14) add(1.2, F(RV.albumTitle.long));
    else if (rel.title.length <= 3) add(1.2, F(RV.albumTitle.short));
    else if (R() < 0.35) add(1, F(RV.albumTitle.themeMiss));
    const tq = titleT.quality >= 75 ? 'high' : titleT.quality >= 58 || best === titleT ? 'mid' : 'low';
    add(3, F(RV.titleTrack[tq]));
    if (n >= 3 && best !== titleT) add(2.6, best.quality >= 65 ? F(RV.best) + ' ' + RV.bestWhy[bestAttr] : F(RV.bestMeh));
    if (n >= 4 && best.quality - worst.quality >= 10) add(2.4, F(RV.worst));
    if (n >= 5) {
      const h = Math.floor(n / 2);
      const f = avg(tracks.slice(0, h).map(t => t.quality)), b = avg(tracks.slice(h).map(t => t.quality));
      add(1.6, F(f - b > 5 ? RV.flow.front : b - f > 5 ? RV.flow.back : RV.flow.even));
    }
    add(1.4, coh >= 72 ? F(RV.coh.high) : coh < 55 ? F(RV.coh.low) : '');
    if (rel.type === 'album' && n > 16) add(2.2, F(RV.lengthLong));
    if (rel.type === 'EP' && n <= 4) add(1, F(RV.lengthShort));
    const intro = /intro|인트로/i.test(tracks[0].title) ? tracks[0].title : null;
    const outro = /outro|아웃트로/i.test(tracks[n - 1].title) ? tracks[n - 1].title : null;
    if (intro && outro) add(2, fill(pick(RV.introOutro), { intro, outro }));
    else if (intro) add(1.2, fill(pick(RV.intro), { intro }));
    const fr = tracks.filter(t => t.feats.length).length / n;
    if (fr > 0.5) add(2.3, F(RV.featOverload));
  }
  if (featTrack && (!multi || tracks.filter(t => t.feats.length).length / n <= 0.5)) {
    const fa = npc(featTrack.feats[0]);
    const good = fa.skill >= 74 && featTrack.quality >= 62;
    add(1.5, fill(pick(good ? RV.featGood : RV.featBad), { feat: fa.name, track: featTrack.title }));
  }
  if (themeShare >= 0.5) add(1.8, THEME_LINE[theme][attrs.lyric >= 68 ? 0 : 1]);
  if (attrs[strong] >= 62) add(2, pick(RV.strength[strong]));
  if (attrs[weak] < 65 && weak !== strong) add(2, pick(RV.weak[weak]));
  if (rel.type === 'mixtape') add(2.5, F(RV.mixtape));
  if (outlet.credWeight >= 0.5 && p.cred < -5) add(2.2, pick(RV.credLow));
  if (outlet.credWeight >= 0.5 && p.cred > 10) add(1.2, pick(RV.credHigh));
  const body = mid.sort((x, y) => y.prio - x.prio).slice(0, outlet.id === 'izm' ? 4 : 5).map(x => x.text);
  return [F(RV.open[tier])].concat(body, [F(RV.close[tier])]).join(' ');
}

function reviewRelease(rel, tracks) {
  const p = S.player;
  const titleT = tracks.find(s => s.id === rel.titleTrackId) || tracks[0];
  const ws = tracks.map(s => s.id === titleT.id ? 2 : 1);
  const attrs = {};
  ['lyric', 'sound', 'hook', 'originality', 'perf'].forEach(k => {
    attrs[k] = sum(tracks.map((s, i) => s.attrs[k] * ws[i])) / sum(ws);
  });
  const coh = rel.cohesion;
  const reviews = [];
  OUTLETS.forEach(o => {
    if (o.genres && !o.genres.includes(rel.genre)) return;
    if (o.minGlobal) {
      const exp = attrs.originality >= 78 && R() < 0.35;
      if (p.globalFame < o.minGlobal && !exp) return;
    }
    if (o.minFame && p.fame < o.minFame && R() < 0.6) return;
    if (rel.type === 'single' && o.id !== 'wave' && R() < 0.35) return; // 싱글은 종종 리뷰 안 함
    if (rel.type === 'mixtape' && (o.id === 'wave' || o.id === 'pitchfork' || (o.id === 'izm' && R() < 0.5))) return; // 믹스테이프는 웹진 위주
    let raw = sum(Object.keys(o.w).map(k => o.w[k] * attrs[k]));
    const cw = rel.type === 'single' ? o.coh * 0.4 : o.coh;
    let s = raw * (1 - cw) + coh * cw + o.bias + p.cred * o.credWeight + rnd(-6, 6);
    if (rel.type === 'album' && tracks.length > 18) s -= 3;
    if (tracks.length > 2 && tracks.filter(x => x.feats.length).length / tracks.length > 0.5) s -= 3;
    s = clamp(s, 5, 99);
    const d = displayScore(o, s);
    let badge = null;
    if (o.id === 'pitchfork' && d.value >= 8.3) badge = 'Best New Music';
    if (o.id === 'rhythmer' && d.value >= 4) badge = '리드머 추천';
    if (o.id === 'izm' && d.value >= 4) badge = 'IZM 추천';
    reviews.push({ outlet: o.id, name: o.name, s100: Math.round(s), display: d.text, value: d.value, badge, text: writeReview(o, s, attrs, coh, tracks, rel) });
  });
  if (!reviews.length) {
    const o = OUTLETS.find(x => x.id === 'wave');
    const s = clamp(sum(Object.keys(o.w).map(k => o.w[k] * attrs[k])) + o.bias + rnd(-5, 5), 5, 99);
    const d = displayScore(o, s);
    reviews.push({ outlet: o.id, name: o.name, s100: Math.round(s), display: d.text, value: d.value, badge: null, text: writeReview(o, s, attrs, coh, tracks, rel) });
  }
  rel.reviews = reviews;
  rel.critic = Math.round(avg(reviews.map(r => r.s100)));
  // 곡 단위 평가
  tracks.forEach(s => {
    s.critic = Math.round(clamp(s.attrs.lyric * 0.25 + s.attrs.sound * 0.25 + s.attrs.originality * 0.2 + s.attrs.perf * 0.18 + s.attrs.hook * 0.12 + p.cred * 0.2 - 3 + rnd(-4, 4), 5, 99));
  });
}

// opts: {type, title, trackIds(순서), titleTrackId, cover:{c1,c2,emoji}, concept, promo(index)}
function releaseWork(opts) {
  const p = S.player;
  const [mn, mx] = releaseRules(opts.type);
  const tracks = opts.trackIds.map(song).filter(Boolean);
  if (!opts.title || !opts.title.trim()) return { ok: false, msg: '작품 제목을 입력하세요.' };
  if (tracks.length < mn || tracks.length > mx) return { ok: false, msg: `${typeName(opts.type)}${josa(typeName(opts.type), '은')} ${mn}~${mx}곡이어야 합니다.` };
  if (tracks.some(s => s.releaseId)) return { ok: false, msg: '이미 발매된 곡이 포함되어 있습니다.' };
  if (opts.type === 'mixtape') opts.promo = 0;
  const promo = PROMO_OPTIONS[opts.promo || 0];
  if (p.money < promo.cost) return { ok: false, msg: '홍보 예산이 부족합니다.' };
  p.money -= promo.cost;

  const gcount = {}; tracks.forEach(s => gcount[s.genre] = (gcount[s.genre] || 0) + 1);
  const genre = Object.keys(gcount).sort((a, b) => gcount[b] - gcount[a])[0];
  const prevRel = S.releases[S.releases.length - 1];
  const rel = {
    id: uid('r'), type: opts.type, title: opts.title.trim(), trackIds: tracks.map(s => s.id),
    titleTrackId: opts.titleTrackId && opts.trackIds.includes(opts.titleTrackId) ? opts.titleTrackId : tracks[0].id,
    t: S.t, cover: opts.cover || { c1: '#7c3aed', c2: '#ec4899', emoji: '🎵' }, concept: opts.concept || '',
    genre, label: p.label || (S.myLabel ? 'mylabel' : null), promo: opts.promo || 0, cohesion: 0, reviews: [], critic: 0,
    peakBB200: null, compMembers: opts.compMembers || null, extraTracks: opts.extraTracks || []
  };
  rel.cohesion = computeCohesion(tracks, rel.concept, opts.type);
  reviewRelease(rel, tracks);
  S.releases.push(rel);

  // 스트리밍 기반값 설정
  const lab = myActiveLabel();
  const labPromo = lab ? lab.promo : 1;
  const hype = (1 + p.hype / 100) * (opts.type === 'mixtape' ? 0.45 : 1);
  // 너무 자주 발매하면 관심이 분산된다
  const recent = S.releases.filter(r => r.id !== rel.id && S.t - r.t < 10 && r.type !== 'compilation').length;
  const fatigue = 1 / (1 + 0.45 * recent);
  const domReach = (1500 + Math.pow(p.fame, 2.25) * 32 + Math.sqrt(totalFollowers()) * 25) * promo.mult * labPromo * hype * fatigue;
  const globReach = (300 + Math.pow(p.globalFame, 2.4) * 350 + Math.sqrt(p.followers.youtube) * 40 + Math.pow(p.fame, 2.25) * 32 * 0.06)
    * Math.sqrt(promo.mult) * (1 + (lab ? lab.global : 0) * 3) * hype * fatigue;
  const notes = [];
  if (recent >= 2) notes.push('😮‍💨 최근 발매가 잦아 리스너들의 관심이 분산되었습니다.');
  tracks.forEach((s, i) => {
    const isTitle = s.id === rel.titleTrackId;
    s.role = isTitle ? 'title' : 'bside';
    const roleMult = isTitle ? (opts.type === 'album' ? 1.15 : 1) : opts.type === 'single' ? 0.45 : opts.type === 'EP' ? 0.3 : opts.type === 'compilation' ? 0.4 : 0.22;
    const trackMult = 0.3 + s.attrs.hook / 100 * 1.1 + s.quality / 100 * 0.4;
    let featDom = 0, featGlob = 0;
    s.feats.forEach(fid => {
      const f = npc(fid);
      if (f.region === 'GLOBAL') { featGlob += Math.pow(f.fame, 2.4) * 600 * 0.3; featDom += Math.pow(f.fame, 2) * 40; }
      else { featDom += Math.pow(f.fame, 2.25) * 32 * 0.35; featGlob += Math.pow(f.fame, 2.25) * 32 * 0.03; }
    });
    s.domBase = (domReach + featDom * promo.mult) * trackMult * roleMult;
    s.globBase = (globReach + featGlob) * trackMult * roleMult;
    // 바이럴
    if (R() < 0.025 + s.attrs.hook / 2500 + (isTitle ? 0.01 : 0)) {
      const m = rnd(2.2, 5);
      s.domBase *= m; s.globBase *= m * 1.2;
      notes.push(`🔥 「${s.title}」${josa(s.title, '이')} 숏폼 챌린지로 바이럴되고 있습니다!`);
      addNews(`🔥 ${p.stage}의 「${s.title}」, 숏폼 챌린지 열풍`, 'good');
      p.buzz += 12;
    }
    s.decay = clamp(0.78 + s.attrs.hook * 0.0012 + s.quality * 0.0007 - (isTitle ? 0 : 0.03), 0.72, 0.935);
    s.startT = S.t + 1;
    s.releaseId = rel.id;
    if (opts.type === 'mixtape') s.free = true; // 무료 공개: 수익/차트 없음
  });
  p.hype = 0;
  if (!p.debutT) {
    p.debutT = S.t; addMilestone('debut', `데뷔작 「${rel.title}」 발매`);
    addStory(`${p.stage}의 데뷔작 『${rel.title}』${josa(rel.title, '이')} 세상에 나왔다. 타이틀곡은 「${song(rel.titleTrackId).title}」. 평단 지수 ${rel.critic}.`, 'release');
  } else if (opts.type === 'album' || opts.type === 'EP') {
    addStory(`${typeName(opts.type)} 『${rel.title}』 발매. ${rel.critic >= 80 ? '평단의 찬사가 쏟아졌다.' : rel.critic >= 67 ? '좋은 평가를 받았다.' : rel.critic >= 52 ? '반응은 미지근했다.' : '혹평이 쏟아졌다.'}`, 'release');
  }
  p.lastReleaseT = S.t;
  if (p.contract) p.contract.released += opts.type === 'single' || opts.type === 'compilation' ? 0.5 : 1;

  // 평단/팬 반응 & 영향
  const c = rel.critic;
  const tier = c >= 80 ? 'release_great' : c >= 67 ? 'release_good' : c >= 52 ? 'release_mid' : 'release_bad';
  const titleSong = song(rel.titleTrackId);
  const sortedQ = tracks.slice().sort((a, b) => b.quality - a.quality);
  const vars = { title: rel.title, album: rel.title, titleTrack: titleSong.title, best: sortedQ[0].title, worst: sortedQ[sortedQ.length - 1].title };
  S.lastRelCritic = rel.critic;
  react(tier, rint(6, 9), vars, { src: rel.id });
  if (prevRel && prevRel.genre !== genre) react('genre_change', 3, vars, { src: rel.id });
  const feats = [...new Set(tracks.flatMap(s => s.feats))];
  if (feats.length) react('collab', 2, { title: rel.title, npc: npc(feats[0]).name }, { src: rel.id });
  p.sentiment = clamp(p.sentiment + (c - 62) / 4 + (titleSong.attrs.hook - 60) / 10, 0, 100);
  p.coreRatio = clamp(p.coreRatio + (c - 65) / 10, 3, 60);
  p.buzz += 4 + (opts.type === 'album' ? 6 : opts.type === 'EP' ? 3 : 0) + Math.max(0, c - 70) / 3;
  if (c >= 76) p.cred += 1;
  if (c >= 85) p.legacy += 1.5;
  if (opts.type === 'mixtape') { p.cred += 1.5; p.coreRatio = clamp(p.coreRatio + 1.5, 3, 60); notes.push('🎁 무료 믹스테이프: 수익과 차트는 없지만 평단 신뢰도와 찐팬이 늘었습니다.'); }
  rel.reviews.forEach(r => { if (r.badge) addNews(`⭐ ${r.name}: ${p.stage} 「${rel.title}」 — ${r.display} (${r.badge})`, 'good'); });
  addNews(`💿 ${p.stage}, ${typeName(opts.type)} 「${rel.title}」 발매 (평단 지수 ${c})`, 'release');

  // 디스전 해결
  if (p.dissTarget && S.t <= p.dissDeadline) {
    const ds = tracks.find(s => s.theme === '디스');
    if (ds) notes.push(resolveDiss(ds));
  }
  // 레이블 할당량
  save();
  return { ok: true, release: rel, notes };
}

/* =========================================================
 *  주간 진행
 * ========================================================= */
function nextWeek() {
  const p = S.player;
  const before = { followers: totalFollowers(), money: p.money, fame: p.fame, globalFame: p.globalFame };
  const summary = { events: [], chart: [], income: 0, expense: 0 };
  S.t++;
  const t = S.t, w = weekOf(t), y = yearOf(t);
  if (w === 1) yearStart(y, summary);
  if (p.military && t >= p.military.endT) discharge(summary);

  // 생활비
  const living = 250000 + Math.round(p.fame * 8000);
  p.money -= living; summary.expense += living;

  // NPC 활동
  npcWeeklyReleases(t, false);
  spawnBackgroundSongs(t);
  tickChartSongs(t);

  // 내 곡 스트리밍
  let dom = 0, glob = 0, paidDom = 0, paidGlob = 0;
  // 활동 중인 곡이 너무 많으면 서로 스트리밍을 갉아먹는다
  const active = S.songs.filter(s => s.releaseId && s.startT <= t && t - s.startT < 30).length;
  const cannibal = active > 12 ? Math.pow(12 / active, 0.6) : 1;
  S.songs.forEach(s => {
    if (!s.releaseId || s.startT > t) { s.dom = 0; s.glob = 0; return; }
    const age = t - s.startT;
    const d = Math.pow(s.decay, age) * rnd(0.9, 1.1) * (1 + s.boost) * cannibal;
    s.dom = s.domBase * d; s.glob = s.globBase * d;
    s.totalDom += s.dom; s.totalGlob += s.glob;
    s.boost *= 0.82;
    dom += s.dom; glob += s.glob;
    if (!s.free) { paidDom += s.dom; paidGlob += s.glob; }
    // 역주행
    if (age > 12 && s.quality >= 68 && R() < 0.003) {
      s.boost += rnd(1.5, 4);
      summary.events.push(`📈 「${s.title}」${josa(s.title, '이')} 역주행을 시작했습니다!`);
      addNews(`📈 ${p.stage}의 「${s.title}」, 발매 ${age}주 만에 역주행`, 'good');
      p.buzz += 8;
    }
  });
  // 피처링 참여곡
  let featDom = 0, featGlob = 0;
  S.chartSongs.forEach(cs => { if (cs.feats && cs.feats.includes('player')) { featDom += cs.dom; featGlob += cs.glob; } });
  p.weeklyDom = dom; p.weeklyGlob = glob;
  const share = p.label ? labelOf(p.label).share : S.myLabel ? 1 : 0.9;
  const income = Math.round((paidDom * 4.5 + paidGlob * 5) * share);
  p.money += income; summary.income += income; p.totalEarned += income;
  if (S.myLabel) myLabelWeekly(summary);
  summary.dom = dom; summary.glob = glob; summary.featDom = featDom;

  // 인지도 / 팔로워
  const f = totalFollowers();
  const streamFame = clamp(15 * Math.log10(1 + dom + featDom * 0.3) - 50, 0, 55);
  const followerFame = clamp(9 * Math.log10(1 + f) - 25, 0, 40);
  const target = clamp(streamFame * 0.6 + followerFame * 0.6 + 32 * (1 - Math.exp(-p.legacy / 30)) + Math.min(p.buzz, 30) * 0.5, 0, 100);
  p.fame = clamp(p.fame + (target - p.fame) * 0.2, 0, 100);
  const gStream = clamp(16 * Math.log10(1 + glob + featGlob * 0.3) - 85, 0, 60);
  const gFollow = clamp(6 * Math.log10(1 + p.followers.youtube) - 30, 0, 15);
  const gTarget = clamp(gStream * 0.7 + gFollow * 0.6 + 45 * (1 - Math.exp(-p.gLegacy / 25)), 0, 100);
  p.globalFame = clamp(p.globalFame + (gTarget - p.globalFame) * 0.12, 0, 100);
  p.buzz = Math.min(p.buzz * 0.85, 80); p.hype *= 0.9;

  const sentF = 0.4 + p.sentiment / 100;
  let gain = ((dom + featDom * 0.4) / 90 + (glob + featGlob * 0.4) / 220 + p.buzz * 25 + p.fame * 4) * rnd(0.7, 1.3) * sentF * Math.max(0.02, 1 - f / 3e8);
  p.followers.insta += Math.round(gain * 0.5);
  p.followers.x += Math.round(gain * 0.2);
  p.followers.youtube += Math.round(gain * 0.3 + glob / 400);
  if (p.sentiment < 35) {
    const loss = (35 - p.sentiment) / 10 * 0.002;
    ['insta', 'x', 'youtube'].forEach(k => p.followers[k] = Math.max(0, Math.round(p.followers[k] * (1 - loss))));
  }
  // 팬 구성
  p.sentiment += (60 - p.sentiment) * 0.04;
  p.antiRatio = clamp(p.antiRatio + (p.fame / 8 - p.antiRatio) * 0.05, 0, 45);
  if (p.lastReleaseT && t - p.lastReleaseT > 40 && R() < 0.12) {
    react('hiatus', 2);
    p.coreRatio = clamp(p.coreRatio - 0.5, 3, 60);
  }

  // 멘탈
  p.mental = clamp(p.mental + 4 - p.antiRatio * 0.12 * (p.fame / 50) - (p.money < 0 ? 6 : 0), 0, 100);

  // 라이벌은 늘 비슷한 위치에서 경쟁한다
  const rv = S.rivalId && npc(S.rivalId);
  if (rv && rv.debutYear <= y) rv.fame = clamp(rv.fame + (p.fame * rnd(0.85, 1.12) - rv.fame) * 0.03, 4, 97);

  // 레이블 계약
  labelWeekly(summary);
  // 크루 친밀도
  if (p.crew) crewMembers(p.crew).forEach(n => n.rel = clamp(n.rel + 0.5, 0, 100));

  // 차트
  const chartEv = computeCharts(false);
  summary.chart = chartEv;

  // 시상식
  AWARDS.forEach(a => {
    if (a.nomWeek === w) announceNominations(a, y, summary);
    if (a.week === w) holdCeremony(a, y, summary);
  });
  if (w === 51) yearEndLists(y, summary);

  // 랜덤 이벤트 & 스토리
  if (!p.military) { randomEvents(summary); storyEvents(summary); }
  checkChapter(summary);
  checkGoals(summary);
  // 소식함 만료
  S.inbox = S.inbox.filter(m => {
    if (m.expires && m.expires < t && m.type === 'story') { S.flags.doubtNow = false; S.flags.slumpNow = false; return false; }
    if (m.expires && m.expires < t) { if (m.type === 'diss') { p.sentiment -= 3; addNews(`😶 ${p.stage}, ${m.data.npcName}의 디스에 침묵… 커뮤니티 "쫄았네"`, 'bad'); } return false; }
    return true;
  });
  if (p.dissTarget && t > p.dissDeadline) { p.dissTarget = null; }

  // 행동력
  S.ap = p.military ? 0 : p.burnout ? 1 : 3;
  if (p.burnout) { summary.events.push('🥀 번아웃으로 이번 주는 행동력이 1밖에 없습니다.'); p.burnout = false; }
  if (p.mental < 12) {
    p.burnout = true; p.mental = 35;
    summary.events.push('😵 번아웃이 왔습니다… 다음 주는 거의 쉬어야 합니다.');
    addNews(`${p.stage}, 건강 문제로 활동 잠정 중단설`, 'bad');
  }
  S.postsLeft = p.military ? 0 : 3;
  if (p.military) p.mental = clamp(p.mental + 2, 0, 100);
  if (p.money < -10000000 && R() < 0.3) summary.events.push('💳 빚이 쌓이고 있습니다. 공연이나 아르바이트로 돈을 벌어야 합니다.');

  summary.followersDelta = totalFollowers() - before.followers;
  summary.moneyDelta = p.money - before.money;
  summary.fameDelta = p.fame - before.fame;
  summary.globalDelta = p.globalFame - before.globalFame;
  S.history.push({ t, fame: +p.fame.toFixed(1), gfame: +p.globalFame.toFixed(1), followers: totalFollowers(), dom: Math.round(dom), glob: Math.round(glob), money: p.money });
  if (S.history.length > 520) S.history.shift();
  S.lastSummary = summary;
  // 스트리밍 마일스톤 / 인증
  certifications(summary);
  save();
  return summary;
}

function yearStart(y, summary) {
  const p = S.player;
  p.age++;
  summary.events.push(`🎆 ${y}년이 밝았습니다. ${p.stage}, ${p.age}세.`);
  // 신인 생성
  spawnRookies(y, rint(3, 4), rint(1, 2));
  addNews(`🌱 ${y}년, 주목할 신인들: ${S.npcs.filter(n => n.debutYear === y && n.region === 'KR').map(n => n.name).join(', ')}`, 'npc');
  // 레이블 할당량 체크
  if (p.contract && S.t - p.contract.startT > 40) {
    const lab = labelOf(p.label);
    if (p.contract.released < lab.quota) {
      p.contract.misses++;
      if (p.contract.misses >= 2) {
        addNews(`📉 ${lab.name}, 작업물 부족을 이유로 ${p.stage}와 계약 해지`, 'bad');
        summary.events.push(`📉 ${lab.name}${josa(lab.name, '이')} 계약을 해지했습니다. (연간 발매 의무 미달)`);
        p.label = null; p.contract = null; p.sentiment -= 4;
      } else {
        summary.events.push(`⚠️ ${lab.name}: "작년 발매량이 계약 조건(${lab.quota}장)에 못 미칩니다. 올해도 이러면 계약을 해지합니다."`);
      }
    }
    if (p.contract) p.contract.released = 0;
  }
  // 오래된 데이터 정리
  S.npcReleases = S.npcReleases.filter(r => yearOf(r.t) >= y - 3);
}

/* ---------- 인증 & 스트리밍 마일스톤 ---------- */
function certifications(summary) {
  const p = S.player;
  S.songs.forEach(s => {
    if (!s.releaseId) return;
    const tot = s.totalDom + s.totalGlob;
    const levels = [[5e8, '다이아몬드'], [1e8, '플래티넘'], [5e7, '골드']];
    for (const [v, name] of levels) {
      if (tot >= v && !(s.certs || []).includes(name)) {
        s.certs = (s.certs || []).concat(name);
        summary.events.push(`💎 「${s.title}」 누적 ${fmtNum(v)} 스트리밍 돌파! ${name} 인증`);
        addNews(`💎 ${p.stage} 「${s.title}」, 스트리밍 ${name} 인증 획득`, 'good');
        p.legacy += v >= 5e8 ? 1 : v >= 1e8 ? 0.5 : 0.1;
        break;
      }
    }
  });
  const total = sum(S.songs.map(s => s.totalDom + s.totalGlob));
  [[1e6, '누적 스트리밍 100만'], [1e7, '누적 스트리밍 1,000만'], [1e8, '누적 스트리밍 1억'], [1e9, '누적 스트리밍 10억']].forEach(([v, txt]) => {
    if (total >= v) addMilestone('streams' + v, txt);
  });
  const fo = totalFollowers();
  [[1e4, '팔로워 1만'], [1e5, '팔로워 10만'], [1e6, '팔로워 100만'], [1e7, '팔로워 1,000만']].forEach(([v, txt]) => {
    if (fo >= v) addMilestone('fol' + v, txt);
  });
}

/* =========================================================
 *  차트
 * ========================================================= */
function songArtistLabel(s, isPlayer) {
  if (isPlayer) {
    const f = s.feats.length ? ` (Feat. ${s.feats.map(artistName).join(', ')})` : '';
    return S.player.stage + f;
  }
  const main = s.artistId ? artistName(s.artistId) : s.artist;
  const f = s.feats && s.feats.length ? ` (Feat. ${s.feats.map(artistName).join(', ')})` : '';
  return main + f;
}

function computeCharts(silent) {
  const p = S.player;
  const events = [];
  const meta = S.chartMeta;
  const entries = [];
  S.chartSongs.forEach(s => entries.push({ key: s.id, title: s.title, artist: songArtistLabel(s, false), dom: s.dom, glob: s.glob, isPlayer: false, featPlayer: s.feats && s.feats.includes('player'), ref: s }));
  S.songs.forEach(s => { if (s.releaseId && !s.free && s.startT <= S.t) entries.push({ key: s.id, title: s.title, artist: songArtistLabel(s, true), dom: s.dom, glob: s.glob, isPlayer: true, ref: s }); });

  const build = (name, field, limit, floor) => {
    const list = entries.filter(e => e[field] >= floor).sort((a, b) => b[field] - a[field]).slice(0, limit);
    const prevMap = {};
    (S.charts[name] || []).forEach((e, i) => prevMap[e.key] = i + 1);
    return list.map((e, i) => {
      const mk = name + ':' + e.key;
      const m = meta[mk] || (meta[mk] = { weeks: 0, peak: 999 });
      m.weeks++; m.peak = Math.min(m.peak, i + 1);
      return { key: e.key, title: e.title, artist: e.artist, value: e[field], isPlayer: e.isPlayer, featPlayer: e.featPlayer, prev: prevMap[e.key] || null, peak: m.peak, weeks: m.weeks, ref: e.ref };
    });
  };
  const melon = build('melon', 'dom', 100, 30000);
  const hot = build('hot100', 'glob', 100, 2500000);

  // Billboard 200 (앨범)
  const albums = [];
  S.npcReleases.forEach(r => {
    if (r.type === 'single') return;
    const cs = S.chartSongs.find(x => x.id === r.songId);
    if (!cs) return;
    const units = (cs.glob * (cs.albumMult || 1.6) + cs.dom * 0.4) / 1250;
    if (units > 0) albums.push({ key: r.id, title: r.title, artist: artistName(r.artistId), value: units, isPlayer: false });
  });
  S.chartSongs.forEach(cs => {
    if (cs.bg && cs.albumMult) albums.push({ key: 'bga' + cs.id, title: cs.title + (cs.albumMult > 1.5 ? '' : ' (Deluxe)'), artist: cs.artist, value: cs.glob * cs.albumMult / 1250, isPlayer: false });
  });
  S.releases.forEach(r => {
    if (r.type === 'single' || r.type === 'mixtape') return;
    const tr = r.trackIds.map(song);
    if (tr[0].startT > S.t) return;
    const age = S.t - tr[0].startT;
    const sales = age === 0 ? (Math.pow(p.globalFame, 2) * 25 + p.coreRatio * Math.sqrt(totalFollowers()) * 0.6) : 0;
    const units = sum(tr.map(s => s.glob + s.dom * 0.4)) / 1250 + sales;
    albums.push({ key: r.id, title: r.title, artist: r.type === 'compilation' && r.compName ? r.compName : p.stage, value: units, isPlayer: true, ref: r });
  });
  const prevB = {}; (S.charts.bb200 || []).forEach((e, i) => prevB[e.key] = i + 1);
  const bb = albums.filter(a => a.value >= 3000).sort((a, b) => b.value - a.value).slice(0, 200).map((e, i) => {
    const mk = 'bb200:' + e.key; const m = meta[mk] || (meta[mk] = { weeks: 0, peak: 999 });
    m.weeks++; m.peak = Math.min(m.peak, i + 1);
    return Object.assign({}, e, { prev: prevB[e.key] || null, peak: m.peak, weeks: m.weeks });
  });

  S.charts = { melon: melon.map(stripRef), hot100: hot.map(stripRef), bb200: bb.map(stripRef), t: S.t };
  if (silent) return events;

  // 플레이어 관련 차트 이벤트
  melon.forEach((e, i) => {
    const rank = i + 1;
    if (!(e.isPlayer || e.featPlayer)) return;
    if (e.isPlayer) {
      const s = e.ref;
      const firstEntry = !s.peakMelon;
      s.peakMelon = Math.min(s.peakMelon || 999, rank);
      if (firstEntry) {
        events.push(`📊 「${s.title}」 멜론 TOP 100 ${rank}위 진입!`);
        addMilestone('melon_in', `멜론 TOP 100 첫 진입 (「${s.title}」)`);
        p.buzz += 3; react('chart_entry', 2, { title: s.title });
      }
      if (rank === 1 && !s.melonNo1) {
        s.melonNo1 = true; p.buzz += 15;
        events.push(`👑 「${s.title}」 멜론 차트 1위 달성!!`);
        addNews(`👑 ${p.stage} 「${s.title}」, 멜론 차트 정상 등극`, 'chart');
        p.legacy += addMilestone('melon1', `멜론 차트 1위 (「${s.title}」)`) ? 3 : 0.8;
        react('chart_top', 6, { title: s.title });
      } else if (rank <= 10 && !s.melonTop10) {
        s.melonTop10 = true; p.legacy += addMilestone('melon10', `멜론 TOP 10 진입 (「${s.title}」)`) ? 1.5 : 0.3; p.buzz += 6;
        events.push(`🔟 「${s.title}」 멜론 TOP 10 진입 (${rank}위)`);
        addNews(`📊 ${p.stage} 「${s.title}」, 멜론 TOP 10 진입`, 'chart');
      }
    } else if (e.featPlayer && !e.ref.notifiedP) {
      e.ref.notifiedP = true;
      events.push(`📊 피처링 참여곡 「${e.title}」 멜론 ${rank}위 진입`);
    }
  });
  hot.forEach((e, i) => {
    const rank = i + 1;
    if (!(e.isPlayer || e.featPlayer)) return;
    const s = e.ref;
    if (e.isPlayer) {
      const first = !s.peakHot;
      s.peakHot = Math.min(s.peakHot || 999, rank);
      if (first) {
        events.push(`🇺🇸 「${s.title}」 빌보드 HOT 100 ${rank}위 진입!!`);
        addNews(`🇺🇸 ${p.stage} 「${s.title}」, 빌보드 HOT 100 ${rank}위 진입`, 'chart');
        if (addMilestone('hot100', `빌보드 HOT 100 첫 진입 (「${s.title}」)`)) { p.legacy += 4; p.gLegacy += 4; }
        p.gLegacy += 1.5; p.buzz += 10;
        react('billboard', 6, { title: s.title }, { weights: { global: 4 } });
      }
      if (rank <= 10 && !s.hotTop10) { s.hotTop10 = true; p.gLegacy += 3; events.push(`🔥 「${s.title}」 빌보드 HOT 100 TOP 10!`); addMilestone('hot10', '빌보드 HOT 100 TOP 10'); }
      if (rank === 1 && !s.hotNo1) { s.hotNo1 = true; p.gLegacy += 6; p.legacy += 5; events.push(`🌎 「${s.title}」 빌보드 HOT 100 1위!!! 역사적인 순간`); addMilestone('hot1', `빌보드 HOT 100 1위 (「${s.title}」)`); react('billboard', 8, { title: s.title }, { weights: { global: 4 } }); }
    } else if (!s.notifiedHot) {
      s.notifiedHot = true;
      events.push(`🇺🇸 피처링 참여곡 「${e.title}」 빌보드 HOT 100 ${rank}위 진입!`);
      p.gLegacy += 2;
      addMilestone('hot100feat', '피처링으로 빌보드 HOT 100 진입');
    }
  });
  bb.forEach((e, i) => {
    if (!e.isPlayer) return;
    const r = e.ref; const rank = i + 1;
    const first = !r.peakBB200;
    r.peakBB200 = Math.min(r.peakBB200 || 999, rank);
    if (first) {
      events.push(`💿 「${r.title}」 빌보드 200 ${rank}위 진입!`);
      addNews(`💿 ${p.stage} 「${r.title}」, 빌보드 200 ${rank}위`, 'chart');
      if (addMilestone('bb200', `빌보드 200 첫 진입 (「${r.title}」)`)) p.gLegacy += 3;
      p.gLegacy += 1;
    }
    if (rank === 1 && !r.bbNo1) { r.bbNo1 = true; p.gLegacy += 6; p.legacy += 4; addMilestone('bb1', `빌보드 200 1위 (「${r.title}」)`); events.push(`🌎 「${r.title}」 빌보드 200 1위!!!`); }
  });
  return events;
}
function stripRef(e) { const o = Object.assign({}, e); delete o.ref; return o; }

/* =========================================================
 *  시상식
 * ========================================================= */
function popNorm(streams) { return clamp((Math.log10(streams + 1) - 4) * 20, 0, 100); }

function playerRelStreams(r, region) {
  const tr = r.trackIds.map(song);
  return sum(tr.map(s => region === 'GLOBAL' ? s.totalGlob + s.totalDom * 0.1 : s.totalDom));
}

function awardCandidates(a, cat, eligYear) {
  const p = S.player;
  const region = a.region;
  const genreOk = g => cat.genre ? g === cat.genre : (!a.genres || a.genres.includes(g));
  const playerEligible = region === 'KR' || p.globalFame >= (a.minGlobal || 0);
  const out = [];
  const npcRels = S.npcReleases.filter(r => yearOf(r.t) === eligYear && r.region === region);
  const myRels = playerEligible ? S.releases.filter(r => yearOf(r.t) === eligYear) : [];
  const outlet = a.outlet;
  const myCritic = r => {
    const rv = outlet && r.reviews.find(x => x.outlet === outlet);
    let c = rv ? rv.s100 : r.critic;
    if (region === 'KR') c += p.cred * 0.35;
    return c;
  };
  const playerAdj = () => region === 'GLOBAL' ? (p.globalFame - 55) * 0.3 + (p.label === 'orbit' ? 4 : 0) : 0;
  const pop = (v) => popNorm(v);
  const score = (c, pp, isP) => cat.wc * c + cat.wp * pp + rnd(-5, 5) + (isP ? playerAdj() : 0);

  if (cat.type === 'album') {
    npcRels.filter(r => r.type !== 'single' && genreOk(r.genre)).forEach(r => {
      out.push({ label: `「${r.title}」 — ${artistName(r.artistId)}`, score: score(r.critic, pop(region === 'GLOBAL' ? r.totalGlob : r.total), false), isPlayer: false, artist: r.artistId });
    });
    myRels.filter(r => r.type !== 'single' && (r.type !== 'mixtape' || a.outlet === 'rhythmer') && genreOk(r.genre)).forEach(r => {
      out.push({ label: `「${r.title}」 — ${p.stage}`, score: score(myCritic(r), pop(playerRelStreams(r, region)), true), isPlayer: true, title: r.title });
    });
  } else if (cat.type === 'track' || cat.type === 'collab') {
    npcRels.filter(r => genreOk(r.genre) && (cat.type === 'track' || r.feats.length)).forEach(r => {
      const isP = r.feats.includes('player');
      const fl = r.feats.length ? ` (Feat. ${r.feats.map(artistName).join(', ')})` : '';
      out.push({ label: `「${r.trackTitle}」 — ${artistName(r.artistId)}${fl}`, score: score(r.trackCritic, pop(region === 'GLOBAL' ? r.totalGlob / (r.type === 'single' ? 1 : 1.8) : r.total / (r.type === 'single' ? 1 : 1.8)), isP && cat.type === 'collab'), isPlayer: isP && cat.type === 'collab', title: r.trackTitle, artist: r.artistId });
    });
    const mySongs = myRels.flatMap(r => r.trackIds.map(song)).filter(s => genreOk(s.genre) && (cat.type === 'track' || s.feats.length));
    mySongs.map(s => ({ s, sc: score(s.critic + (region === 'KR' ? p.cred * 0.3 : 0), pop(region === 'GLOBAL' ? s.totalGlob + s.totalDom * 0.1 : s.totalDom), true) }))
      .sort((a, b) => b.sc - a.sc).slice(0, 2)
      .forEach(({ s, sc }) => out.push({ label: `「${s.title}」 — ${songArtistLabel(s, true)}`, score: sc, isPlayer: true, title: s.title }));
  } else if (cat.type === 'artist' || cat.type === 'rookie') {
    const by = {};
    npcRels.forEach(r => { (by[r.artistId] = by[r.artistId] || []).push(r); });
    Object.keys(by).forEach(id => {
      const n = npc(id);
      if (!genreOk(n.genre)) return;
      if (cat.type === 'rookie' && n.debutYear !== eligYear) return;
      const rs = by[id];
      const c = Math.max(...rs.map(r => r.critic)) + Math.min(6, rs.length * 2);
      const st = sum(rs.map(r => region === 'GLOBAL' ? r.totalGlob : r.total));
      out.push({ label: n.name, score: score(c, pop(st), false), isPlayer: false, artist: id });
    });
    if (myRels.length && (cat.type !== 'rookie' || (p.debutT && yearOf(p.debutT) === eligYear))) {
      const g = myRels[myRels.length - 1].genre;
      if (genreOk(g) || genreOk(p.genre)) {
        const c = Math.max(...myRels.map(myCritic)) + Math.min(6, myRels.length * 2);
        const st = sum(myRels.map(r => playerRelStreams(r, region)));
        out.push({ label: p.stage, score: score(c, pop(st), true), isPlayer: true, title: '' });
      }
    }
  } else if (cat.type === 'producer') {
    const by = {};
    npcRels.forEach(r => { if (r.producer) (by[r.producer] = by[r.producer] || []).push(r); });
    Object.keys(by).forEach(id => {
      const rs = by[id];
      out.push({ label: artistName(id), score: score(avg(rs.map(r => r.critic)) + Math.min(8, rs.length * 2), pop(sum(rs.map(r => r.total))), false), isPlayer: false, artist: id });
    });
    const self = myRels.flatMap(r => r.trackIds.map(song)).filter(s => !s.producer);
    if (self.length >= 2) out.push({ label: p.stage, score: score(avg(self.map(s => s.attrs.sound)) + Math.min(8, self.length), pop(sum(self.map(s => s.totalDom))), true), isPlayer: true, title: '' });
  }
  return out;
}

function announceNominations(a, y, summary) {
  const eligYear = a.currentYear ? y : y - 1;
  const key = a.id + '_' + y;
  const ceremony = { id: key, awardId: a.id, year: y, eligYear, cats: [], done: false };
  let myNoms = 0;
  a.cats.forEach(cat => {
    const all = awardCandidates(a, cat, eligYear).sort((x, z) => z.score - x.score);
    // 한 아티스트는 부문당 한 번만 후보에 오른다
    const seen = new Set();
    const cands = all.filter(c => { const k = c.isPlayer ? '__player' : c.artist; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5);
    if (cands.length < 2) return;
    ceremony.cats.push({ name: cat.name, major: !!cat.major, nominees: cands, winner: null });
    cands.filter(c => c.isPlayer).forEach(c => {
      myNoms++;
      S.nominations.push({ t: S.t, award: a.name, year: y, cat: cat.name, label: c.label, won: null });
    });
  });
  S.awards[key] = ceremony;
  if (myNoms) {
    S.player.buzz += myNoms * 2 + a.prestige * 0.3;
    summary.events.push(`${a.icon} ${a.name} 후보 발표! ${S.player.stage}, ${myNoms}개 부문 노미네이트!`);
    addNews(`${a.icon} ${a.name}, ${S.player.stage} ${myNoms}개 부문 후보 지명`, 'award');
    if (a.id === 'grammy') addMilestone('grammy_nom', '그래미 어워즈 노미네이트');
  } else {
    addNews(`${a.icon} ${a.name} ${y} 후보 발표`, 'award');
  }
}

function holdCeremony(a, y, summary) {
  const key = a.id + '_' + y;
  const c = S.awards[key];
  if (!c || c.done) return;
  const p = S.player;
  let wins = 0, losses = 0;
  c.cats.forEach(cat => {
    const w = cat.nominees.map(n => ({ n, v: n.score + rnd(-4, 4) })).sort((x, z) => z.v - x.v)[0].n;
    cat.winner = w.label;
    if (w.artist) S.npcWins[w.artist] = (S.npcWins[w.artist] || 0) + 1;
    const mine = cat.nominees.filter(n => n.isPlayer);
    mine.forEach(n => {
      const nom = S.nominations.find(x => x.award === a.name && x.year === y && x.cat === cat.name && x.label === n.label);
      const won = n === w;
      if (nom) nom.won = won;
      if (won) {
        wins++;
        S.trophies.push({ award: a.name, icon: a.icon, cat: cat.name, year: y, work: n.label, t: S.t, major: cat.major });
        p.legacy += a.prestige * (cat.major ? 0.55 : 0.3);
        if (a.region === 'GLOBAL') p.gLegacy += a.prestige * (cat.major ? 0.4 : 0.25);
        p.buzz += a.prestige * 0.8;
        p.mental = clamp(p.mental + 10, 0, 100);
        if (a.region === 'KR' && a.id !== 'sma') p.cred += 1;
        summary.events.push(`${a.icon} ${a.name} [${cat.name}] 수상!! — ${n.label}`);
        addNews(`${a.icon} ${p.stage}, ${a.name} '${cat.name}' 수상`, 'award');
        if (a.id === 'grammy') addMilestone('grammy_win', `그래미 어워즈 수상 (${cat.name})`);
        if (a.id === 'kma' && cat.major) addMilestone('kma_major', `한국대중음악상 종합분야 수상 (${cat.name})`);
      } else losses++;
    });
  });
  c.done = true;
  if (wins) react('award_win', 4 + wins, { award: a.name }, { weights: a.region === 'GLOBAL' ? { global: 3 } : {} });
  else if (losses) { react('award_lose', 3, { award: a.name }); p.mental = clamp(p.mental - 3, 0, 100); }
  if (!wins && !losses) {
    const big = c.cats.find(x => x.major) || c.cats[0];
    if (big) addNews(`${a.icon} ${a.name} ${y}: '${big.name}' — ${big.winner}`, 'award');
  }
}

function yearEndLists(y, summary) {
  const p = S.player;
  const mk = (id, name, region, filterGenre, outletId, size) => {
    const items = [];
    S.npcReleases.filter(r => yearOf(r.t) === y && r.type !== 'single' && r.region === region && (!filterGenre || filterGenre.includes(r.genre)))
      .forEach(r => items.push({ label: `${artistName(r.artistId)} 「${r.title}」`, score: r.critic + rnd(-4, 4), isPlayer: false }));
    S.releases.filter(r => yearOf(r.t) === y && r.type !== 'single' && (!filterGenre || filterGenre.includes(r.genre))).forEach(r => {
      const rv = r.reviews.find(x => x.outlet === outletId);
      if (region === 'GLOBAL' && !rv) return;
      items.push({ label: `${p.stage} 「${r.title}」`, score: (rv ? rv.s100 : r.critic - 4) + rnd(-3, 3), isPlayer: true });
    });
    const list = items.sort((a, b) => b.score - a.score).slice(0, size);
    S.yearLists.unshift({ year: y, name, list: list.map(x => ({ label: x.label, isPlayer: x.isPlayer })) });
    const idx = list.findIndex(x => x.isPlayer);
    if (idx >= 0) {
      p.legacy += idx === 0 ? 3 : 1; if (region === 'GLOBAL') p.gLegacy += idx < 10 ? 4 : 2;
      summary.events.push(`📝 ${name}에 ${idx + 1}위로 선정!`);
      addNews(`📝 ${name}: ${p.stage} ${idx + 1}위`, 'good');
    }
  };
  mk('rhythmer', `리드머 선정 ${y} 올해의 국내 힙합/R&B 앨범 TOP 10`, 'KR', ['힙합', 'R&B'], 'rhythmer', 10);
  mk('izm', `IZM 선정 ${y} 올해의 국내 앨범 TOP 10`, 'KR', null, 'izm', 10);
  mk('pitchfork', `Pitchfork: The 20 Best Albums of ${y}`, 'GLOBAL', null, 'pitchfork', 20);
}

/* =========================================================
 *  행동
 * ========================================================= */
function useAP(n) { if (S.ap < n) return false; S.ap -= n; return true; }

function actPractice(skill) {
  const p = S.player;
  const cost = skill === 'vocal' ? 300000 : skill === 'produce' ? 200000 : 0;
  if (p.money < cost) return { ok: false, msg: '돈이 부족합니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  p.money -= cost;
  const v = p.skills[skill];
  const g = rnd(0.9, 2.3) * (105 - v) / 100 * (p.mental < 30 ? 0.6 : 1) * (skill === 'vocal' || skill === 'produce' ? 1.2 : 1);
  p.skills[skill] = clamp(v + g, 0, 100);
  p.mental = clamp(p.mental - 3, 0, 100);
  const msgs = { lyric: '노트에 라인을 빼곡히 채웠다', flow: '메트로놈 앞에서 플로우를 갈고닦았다', vocal: '보컬 레슨을 받았다', produce: '새 플러그인으로 비트를 쪼갰다', stage: '거울 앞에서 무대 연습을 했다' };
  save();
  return { ok: true, msg: `${msgs[skill]}. ${SKILL_NAMES[skill]} +${g.toFixed(1)}` + (cost ? ` (${fmtMoney(cost)})` : '') };
}

function actGig() {
  const p = S.player;
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  const venue = p.fame < 15 ? pick(['홍대 소규모 클럽', '동네 펍', '대학가 라이브바']) : p.fame < 35 ? pick(['롤링홀', '클럽 공연장', '대학 축제']) : p.fame < 60 ? pick(['단독 콘서트 (1천석)', '음악 페스티벌', '대학 축제 헤드라이너']) : pick(['체조경기장 단독 콘서트', '대형 페스티벌 헤드라이너', '전국 투어']);
  const perfQ = (p.skills.stage * 0.6 + perfSkill(p.genre) * 0.4 + rnd(-10, 10));
  const pay = Math.round((100000 + p.fame * p.fame * 400 + p.fame * 20000) * rnd(0.8, 1.2) / 10000) * 10000;
  const fol = Math.round((20 + p.fame * 30) * rnd(0.6, 1.4) * (perfQ / 50));
  p.money += pay; p.followers.insta += Math.round(fol * 0.6); p.followers.youtube += Math.round(fol * 0.4);
  p.skills.stage = clamp(p.skills.stage + 0.5 * (105 - p.skills.stage) / 100, 0, 100);
  p.mental = clamp(p.mental - 4, 0, 100);
  p.coreRatio = clamp(p.coreRatio + 0.2, 3, 60);
  p.sentiment = clamp(p.sentiment + (perfQ > 55 ? 1.5 : -0.5), 0, 100);
  if (p.fame >= 30 && R() < 0.3) react('post_live', 2);
  save();
  return { ok: true, msg: `${venue}에서 공연했다. ${perfQ > 60 ? '관객 반응이 뜨거웠다! 🔥' : perfQ > 40 ? '무난한 무대였다.' : '실수가 좀 있었다…'} 수입 ${fmtMoney(pay)}, 팔로워 +${fmtNum(fol)}` };
}

function actRest() {
  const p = S.player;
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  const g = rint(16, 24);
  p.mental = clamp(p.mental + g, 0, 100);
  save();
  return { ok: true, msg: pick(['푹 자고 일어났다.', '한강에서 산책을 했다.', '친구들과 맛있는 걸 먹었다.', '게임하면서 머리를 식혔다.', '본가에 다녀왔다.']) + ` 멘탈 +${g}` };
}

function actPartTime() {
  const p = S.player;
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  const pay = 400000;
  p.money += pay; p.mental = clamp(p.mental - 3, 0, 100);
  let msg = `${pick(['편의점', '물류센터', '카페', '배달', '학원 보조'])} 아르바이트를 했다. +${fmtMoney(pay)}`;
  if (p.fame >= 30 && R() < 0.4) {
    msg += ' …손님이 알아봤다! "혹시 그 래퍼 아니세요?"';
    react('post_daily', 2, {}, { weights: { meme: 5, core: 2 } });
    addNews(`🏪 "${p.stage}, 아르바이트 중 목격" 커뮤니티 화제`, 'info');
    p.buzz += 2;
  }
  save();
  return { ok: true, msg };
}

function actGlobalPromo() {
  const p = S.player;
  const cost = 5000000;
  if (p.fame < 35) return { ok: false, msg: '국내 인지도 35 이상이 필요합니다.' };
  if (p.money < cost) return { ok: false, msg: '비용(500만원)이 부족합니다.' };
  if (!useAP(2)) return { ok: false, msg: '행동력이 2 필요합니다.' };
  p.money -= cost;
  const g = rnd(1.2, 2.8) * (1 + p.skills.stage / 200);
  p.gLegacy += g;
  const yt = Math.round(rnd(3000, 30000) * (1 + p.fame / 50));
  p.followers.youtube += yt;
  p.mental = clamp(p.mental - 8, 0, 100);
  const city = pick(['LA', '뉴욕', '런던', '도쿄', '파리', '애틀랜타', '베를린', '방콕']);
  react('post_daily', 2, {}, { weights: { global: 6 } });
  addNews(`✈️ ${p.stage}, ${city} 프로모션 투어 진행`, 'info');
  save();
  return { ok: true, msg: `${city}에서 해외 프로모션(라디오, 팟캐스트, 쇼케이스)을 진행했다. 해외 인지도 기반 +${g.toFixed(1)}, 유튜브 +${fmtNum(yt)}` };
}

function actBond(id) {
  const n = npc(id);
  if (!n) return { ok: false, msg: '아티스트를 찾을 수 없습니다.' };
  if (n.region === 'GLOBAL' && S.player.globalFame < 8) return { ok: false, msg: '해외 아티스트와 교류하려면 해외 인지도가 필요합니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  let g = rnd(5, 12);
  if (n.trait === '까칠함') g *= 0.6; if (n.trait === '유쾌함') g *= 1.3; if (n.trait === '신비주의') g *= 0.75;
  if (S.player.dissTarget === n.id) g = -2;
  n.rel = clamp(n.rel + g, 0, 100);
  const how = pick(['작업실에 놀러 갔다', 'DM으로 대화를 나눴다', '같이 술 한잔했다', '공연 뒤풀이에서 만났다', '같이 비트를 들으며 밤을 새웠다']);
  save();
  return { ok: true, msg: `${n.name}${josa(n.name, '과')} ${how}. 친밀도 ${g >= 0 ? '+' : ''}${g.toFixed(0)} (현재 ${Math.round(n.rel)})` };
}

/* =========================================================
 *  SNS
 * ========================================================= */
const POST_TYPES = {
  insta: [
    { id: 'daily', name: '일상/셀카', ctx: 'post_daily', eng: 0.08 },
    { id: 'work', name: '작업 근황', ctx: 'post_work', eng: 0.06, hype: 5 },
    { id: 'teaser', name: '신곡 티저', ctx: 'post_teaser', eng: 0.07, hype: 12, needUnreleased: true },
    { id: 'mood', name: '감성 글귀', ctx: 'post_mood', eng: 0.05 },
    { id: 'fan', name: '팬 소통 (라이브 방송)', ctx: 'post_fan', eng: 0.09 }
  ],
  x: [
    { id: 'thought', name: '생각 공유', ctx: 'post_mood', eng: 0.04 },
    { id: 'fan', name: '팬들과 소통', ctx: 'post_fan', eng: 0.07 },
    { id: 'meme', name: '밈/드립', ctx: 'post_meme', eng: 0.11 },
    { id: 'diss', name: '저격 (특정 아티스트)', ctx: 'post_diss', eng: 0.14, needTarget: true },
    { id: 'social', name: '사회적 발언', ctx: 'post_social', eng: 0.1 }
  ],
  youtube: [
    { id: 'mv', name: '뮤직비디오', ctx: 'post_mv', eng: 0.15, needSong: true, needBudget: true },
    { id: 'live', name: '라이브 클립', ctx: 'post_live', eng: 0.1, needSong: true },
    { id: 'vlog', name: '브이로그', ctx: 'post_daily', eng: 0.07 },
    { id: 'behind', name: '앨범 비하인드', ctx: 'post_work', eng: 0.06, hype: 6 }
  ]
};
const MV_BUDGETS = [{ cost: 1000000, boost: 0.15, label: '저예산 (100만원)' }, { cost: 5000000, boost: 0.4, label: '일반 (500만원)' }, { cost: 20000000, boost: 0.8, label: '고퀄리티 (2,000만원)' }, { cost: 80000000, boost: 1.4, label: '블록버스터 (8,000만원)' }];
const PLATFORM_NAMES = { insta: '인스타그램', x: 'X (트위터)', youtube: '유튜브' };

function makePost({ platform, type, text, songId, targetId, budget }) {
  const p = S.player;
  if (S.postsLeft <= 0) return { ok: false, msg: '이번 주 게시물 한도(3개)를 다 썼습니다.' };
  const pt = POST_TYPES[platform].find(x => x.id === type);
  if (!pt) return { ok: false, msg: '게시물 유형 오류' };
  if (pt.needUnreleased && !unreleasedSongs().length) return { ok: false, msg: '티저로 쓸 미발매 곡이 없습니다.' };
  if (pt.needSong && !songId) return { ok: false, msg: '곡을 선택하세요.' };
  if (pt.needTarget && !targetId) return { ok: false, msg: '대상을 선택하세요.' };
  let cost = 0, mvb = null;
  if (pt.needBudget) { mvb = MV_BUDGETS[budget || 0]; cost = mvb.cost; if (p.money < cost) return { ok: false, msg: '뮤직비디오 예산이 부족합니다.' }; }
  p.money -= cost;
  S.postsLeft--;
  const fol = p.followers[platform];
  let eng = pt.eng * rnd(0.6, 1.4) * (0.6 + p.sentiment / 100);
  const notes = [];
  // 글 내용 분석
  const body = (text || '').trim();
  let viral = R() < (type === 'meme' ? 0.1 : 0.035);
  if (/감사|고마|사랑|행복|응원|덕분/.test(body)) { p.sentiment = clamp(p.sentiment + 1.5, 0, 100); }
  if (/시발|씨발|좆|병신|꺼져|닥쳐/.test(body)) { p.sentiment -= 4; p.antiRatio = clamp(p.antiRatio + 1.5, 0, 45); p.buzz += 4; eng *= 1.4; notes.push('🤬 거친 표현 때문에 논란이 일었습니다.'); }
  if (body.length > 80) eng *= 1.1;
  if (viral) { eng *= rnd(4, 10); notes.push('🚀 게시물이 바이럴됐습니다!'); p.buzz += 6; }
  const likes = Math.round((fol * eng + rnd(3, 30)) * (platform === 'youtube' ? 3 : 1));
  let newF = Math.round(likes * (viral ? 0.25 : 0.05));
  const vars = {};
  let ctx = pt.ctx;
  // 유형별 효과
  if (pt.hype) p.hype = clamp(p.hype + pt.hype, 0, 60);
  if (type === 'fan') { p.coreRatio = clamp(p.coreRatio + 0.8, 3, 60); p.sentiment = clamp(p.sentiment + 3, 0, 100); }
  if (type === 'daily' || type === 'vlog') { p.sentiment = clamp(p.sentiment + 1.5, 0, 100); newF = Math.round(newF * 1.3); }
  if (type === 'mood' || type === 'thought') { p.sentiment = clamp(p.sentiment + 0.5, 0, 100); }
  if (type === 'meme') { newF = Math.round(newF * 1.5); }
  if (type === 'social') {
    const sw = rnd(-6, 6); p.sentiment = clamp(p.sentiment + sw, 0, 100); p.buzz += 5; p.antiRatio = clamp(p.antiRatio + 1, 0, 45); p.cred += 0.5;
    notes.push(sw >= 0 ? '🗣️ 소신 발언이 지지를 받았습니다.' : '🗣️ 발언이 논란이 되었습니다.');
  }
  if (type === 'diss') {
    const n = npc(targetId); vars.npc = n.name;
    n.rel = clamp(n.rel - 30, 0, 100); p.buzz += 8 + n.fame / 10; p.antiRatio = clamp(p.antiRatio + 1, 0, 45);
    addNews(`⚔️ ${p.stage}, SNS로 ${n.name} 저격 "${body.slice(0, 30) || '…'}"`, 'bad');
    if (R() < 0.45 + (n.trait === '독설가' || n.trait === '허세' ? 0.25 : 0)) {
      notes.push(`🔥 ${n.name}${josa(n.name, '이')} 디스곡으로 응수할 예정이라는 소문이 돕니다…`);
      scheduleDiss(n, 'response');
    }
  }
  let songName = '';
  if (pt.needSong) {
    const s = song(songId); songName = s.title; vars.title = s.title;
    if (type === 'mv') {
      s.boost += mvb.boost * (0.7 + s.attrs.hook / 100);
      s.globBase *= 1 + mvb.boost * 0.15;
      p.gLegacy += mvb.boost * 0.4;
      newF = Math.round(newF * 1.5 + mvb.boost * 2000);
      notes.push(`🎬 「${s.title}」 뮤직비디오 공개! 스트리밍이 증가합니다.`);
    } else {
      s.boost += 0.08 + p.skills.stage / 600;
      p.skills.stage = clamp(p.skills.stage + 0.2 * (105 - p.skills.stage) / 100, 0, 100);
    }
  }
  if (type === 'teaser') { vars.title = unreleasedSongs().slice(-1)[0].title; }
  p.followers[platform] += newF;
  if (type === 'mv' || type === 'live') p.followers.insta += Math.round(newF * 0.2);
  const comments = react(ctx, rint(3, 6), vars, { src: 'post', weights: platform === 'youtube' ? { global: 2 } : {} });
  const post = { id: uid('p'), t: S.t, platform, type, typeName: pt.name, text: body || defaultPostText(type, vars), likes, newF, comments, songName, viral };
  S.posts.unshift(post);
  if (S.posts.length > 200) S.posts.length = 200;
  save();
  return { ok: true, post, notes };
}

function defaultPostText(type, v) {
  const d = {
    daily: '오늘 날씨 좋다 ☀️', work: '작업 중… 곧 들려줄게 🎧', teaser: `${v.title || '신곡'} coming soon 🔥`, mood: '새벽 세 시, 생각이 많아지는 시간',
    fan: '오늘 라이브 와줘서 고마워요 💜', thought: '음악은 결국 진심이다', meme: 'ㅋㅋㅋㅋㅋ 이거 나임', diss: `@${v.npc} 랩 그만하고 유튜버 해라`,
    social: '우리 모두 목소리를 내야 할 때', mv: `「${v.title}」 Official MV`, live: `「${v.title}」 LIVE CLIP`, vlog: '스튜디오 브이로그 🎬', behind: '앨범 작업 비하인드'
  };
  return d[type] || '';
}

/* =========================================================
 *  레이블 / 크루
 * ========================================================= */
function labelWeekly(summary) {
  const p = S.player;
  if (p.contract && S.t >= p.contract.endT) {
    const lab = labelOf(p.label);
    addInbox({
      type: 'renew', title: `📝 ${lab.name} 재계약 제안`, text: `계약 기간이 끝났습니다. ${lab.name}${josa(lab.name, '이')} 재계약을 제안합니다. 계약금 ${fmtMoney(Math.round(lab.advance * (0.4 + p.fame / 120)))}.`,
      data: { labelId: lab.id }, expires: S.t + 3
    });
    summary.events.push(`📝 ${lab.name}${josa(lab.name, '과')}의 계약이 만료되었습니다.`);
    p.label = null; p.contract = null;
  }
}

function offerAmount(lab) {
  const p = S.player;
  return Math.round(lab.advance * (0.4 + p.fame / 120 + p.globalFame / 150) / 100000) * 100000;
}
function labelEligible(lab) {
  const p = S.player;
  return p.fame >= lab.minFame && (!lab.minGlobal || p.globalFame >= lab.minGlobal);
}

function signLabel(labelId, advance) {
  const p = S.player;
  const lab = labelOf(labelId);
  if (p.label) return { ok: false, msg: '이미 계약된 레이블이 있습니다.' };
  p.label = lab.id;
  p.contract = { startT: S.t, endT: S.t + lab.weeks, advance, released: 0, misses: 0 };
  p.money += advance;
  p.cred += lab.cred;
  if (lab.global) p.gLegacy += lab.global * 15;
  // 같은 레이블 아티스트와 친밀도
  S.npcs.filter(n => n.label === lab.id).forEach(n => n.rel = clamp(n.rel + 8, 0, 100));
  addNews(`✍️ ${p.stage}, ${lab.name}${josa(lab.name, '과')} 전속 계약 체결 (계약금 ${fmtMoney(advance)})`, 'good');
  react(['메이저', '대형기획사', '글로벌'].includes(lab.tier) ? 'label_major' : 'label_indie', 5, { npc: lab.name });
  addMilestone('label_' + lab.tier, `${lab.tier} 레이블 계약 (${lab.name})`);
  save();
  return { ok: true, msg: `${lab.name}${josa(lab.name, '과')} 계약했습니다! 계약금 ${fmtMoney(advance)} 입금.` };
}

function buyoutCost() {
  const p = S.player; if (!p.contract) return 0;
  const lab = labelOf(p.label);
  const remain = Math.max(0, p.contract.endT - S.t) / lab.weeks;
  return Math.round(p.contract.advance * remain * 0.8 / 10000) * 10000;
}
function leaveLabel() {
  const p = S.player;
  if (!p.label) return { ok: false, msg: '소속 레이블이 없습니다.' };
  const cost = buyoutCost();
  if (p.money < cost) return { ok: false, msg: `위약금 ${fmtMoney(cost)}이 부족합니다.` };
  const lab = labelOf(p.label);
  p.money -= cost; p.label = null; p.contract = null;
  addNews(`🚪 ${p.stage}, ${lab.name}${josa(lab.name, '과')} 결별 (위약금 ${fmtMoney(cost)})`, 'bad');
  react('label_indie', 3, { npc: lab.name }, { weights: { old: 2 } });
  save();
  return { ok: true, msg: `${lab.name}${josa(lab.name, '을')} 떠났습니다. 위약금 ${fmtMoney(cost)}` };
}

function joinCrew(cid) {
  const p = S.player;
  const c = crewOf(cid);
  if (p.crew) return { ok: false, msg: '이미 크루에 소속되어 있습니다.' };
  p.crew = cid; p.cred += c.cred * 0.5;
  crewMembers(cid).forEach(n => n.rel = clamp(n.rel + 12, 0, 100));
  addNews(`🤜🤛 ${p.stage}, 크루 '${c.name}' 합류`, 'good');
  react('crew_join', 4, { npc: c.name });
  save();
  return { ok: true, msg: `'${c.name}'에 합류했습니다!` };
}
function leaveCrew() {
  const p = S.player;
  if (!p.crew) return { ok: false, msg: '소속 크루가 없습니다.' };
  const c = crewOf(p.crew);
  if (c.own) return { ok: false, msg: '직접 만든 크루는 해체만 가능합니다.' };
  crewMembers(p.crew).forEach(n => n.rel = clamp(n.rel - 15, 0, 100));
  addNews(`💔 ${p.stage}, 크루 '${c.name}' 탈퇴`, 'bad');
  p.crew = null; save();
  return { ok: true, msg: `'${c.name}'${josa(c.name, '을')} 탈퇴했습니다.` };
}
function foundCrew(name) {
  const p = S.player;
  if (p.crew) return { ok: false, msg: '이미 크루에 소속되어 있습니다.' };
  if (p.fame < 15) return { ok: false, msg: '인지도 15 이상이 필요합니다.' };
  if (p.money < 3000000) return { ok: false, msg: '크루 설립 비용 300만원이 필요합니다.' };
  if (!name || !name.trim()) return { ok: false, msg: '크루 이름을 입력하세요.' };
  p.money -= 3000000;
  const c = { id: uid('crew'), name: name.trim(), vibe: `${p.stage}${josa(p.stage, '이')} 이끄는 크루`, cred: 2, own: true };
  S.crews.push(c); p.crew = c.id;
  addNews(`🚩 ${p.stage}, 새 크루 '${c.name}' 설립`, 'good');
  react('crew_join', 3, { npc: c.name });
  addMilestone('own_crew', `크루 '${c.name}' 설립`);
  save();
  return { ok: true, msg: `크루 '${c.name}'${josa(c.name, '을')} 만들었습니다! 친밀도 55 이상의 아티스트를 영입해 보세요.` };
}
function disbandCrew() {
  const p = S.player; const c = p.crew && crewOf(p.crew);
  if (!c || !c.own) return { ok: false, msg: '해체할 크루가 없습니다.' };
  crewMembers(c.id).forEach(n => { n.crew = null; n.rel = clamp(n.rel - 10, 0, 100); });
  S.crews = S.crews.filter(x => x.id !== c.id); p.crew = null;
  addNews(`💥 ${p.stage}의 크루 '${c.name}' 해체`, 'bad'); save();
  return { ok: true, msg: '크루를 해체했습니다.' };
}
function recruitChance(n) {
  if (n.region === 'GLOBAL') return 0;
  let c = (n.rel - 50) / 50 + (S.player.fame - n.fame) / 100;
  if (n.crew) c -= 0.35;
  if (n.label && n.label === S.player.label) c += 0.1;
  return clamp(c, 0, 0.9);
}
function recruit(id) {
  const p = S.player; const c = p.crew && crewOf(p.crew);
  const n = npc(id);
  if (!c || !c.own) return { ok: false, msg: '직접 만든 크루가 있어야 영입할 수 있습니다.' };
  if (n.rel < 55) return { ok: false, msg: '친밀도 55 이상이 필요합니다.' };
  if (n.crew === c.id) return { ok: false, msg: '이미 크루 멤버입니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  if (R() < recruitChance(n)) {
    const old = n.crew && crewOf(n.crew);
    n.crew = c.id; n.rel = clamp(n.rel + 10, 0, 100);
    addNews(`🤝 ${n.name}, ${old ? `'${old.name}' 떠나 ` : ''}'${c.name}' 합류`, 'good');
    react('crew_join', 3, { npc: n.name });
    save();
    return { ok: true, msg: `${n.name}${josa(n.name, '이')} '${c.name}'에 합류했습니다!` };
  }
  n.rel = clamp(n.rel - 3, 0, 100); save();
  return { ok: true, msg: `${n.name}: "${pick(['지금 크루에 의리가 있어서…', '조금만 더 생각해볼게', '아직은 솔로가 편해', '좋은 제안인데 미안'])}" (영입 실패)` };
}

// 크루 컴필레이션
function releaseCompilation({ title, songIds, cover, promo, source }) {
  const p = S.player;
  const isLabel = source === 'label';
  const c = isLabel ? (S.myLabel ? { id: 'mylabel', name: S.myLabel.name } : null) : p.crew && crewOf(p.crew);
  if (!c) return { ok: false, msg: isLabel ? '레이블이 필요합니다.' : '크루가 필요합니다.' };
  const mem = isLabel ? labelRoster() : crewMembers(c.id).filter(n => n.role === 'artist' || n.role === 'producer');
  if (mem.length < (isLabel ? 1 : 2)) return { ok: false, msg: isLabel ? '소속 아티스트가 1명 이상 필요합니다.' : '크루 멤버가 2명 이상 필요합니다.' };
  if (!songIds.length || songIds.length > 3) return { ok: false, msg: '내 곡을 1~3곡 선택하세요.' };
  const parts = mem.slice(0, 6);
  const extra = parts.map(n => ({ title: genTitle('KR', n.genre), artist: n.name, quality: Math.round(clamp(n.skill + rnd(-10, 6), 20, 98)) }));
  const res = releaseWork({ type: 'compilation', title, trackIds: songIds, titleTrackId: songIds[0], cover, promo, concept: `${c.name} ${isLabel ? '레이블' : '크루'} 컴필레이션`, extraTracks: extra });
  if (!res.ok) return res;
  const rel = res.release;
  rel.compName = c.name;
  // 크루 퀄리티 반영해서 평점 보정
  const q = avg(extra.map(e => e.quality));
  rel.reviews.forEach(r => { r.s100 = Math.round(clamp(r.s100 * 0.6 + q * 0.4, 5, 99)); const o = OUTLETS.find(x => x.id === r.outlet); const d = displayScore(o, r.s100); r.display = d.text; r.value = d.value; });
  rel.critic = Math.round(avg(rel.reviews.map(r => r.s100)));
  // 크루원 곡을 차트에 올림
  parts.forEach((n, i) => {
    const cs = { id: uid('cs'), artistId: n.id, title: extra[i].title, releaseId: null, domBase: (2000 + Math.pow(n.fame, 2.25) * 32 * 0.5 + Math.pow(p.fame, 2.25) * 32 * 0.2) * rnd(0.5, 1.2), globBase: 100, decay: rnd(0.78, 0.88), startT: S.t + 1, dom: 0, glob: 0, total: 0, totalGlob: 0, feats: [] };
    S.chartSongs.push(cs);
    n.rel = clamp(n.rel + 8, 0, 100);
  });
  p.coreRatio = clamp(p.coreRatio + 1, 3, 60);
  addNews(`📀 ${c.name} ${isLabel ? '레이블' : '크루'} 컴필레이션 「${rel.title}」 발매`, 'release');
  save();
  return res;
}

/* =========================================================
 *  디스전
 * ========================================================= */
function scheduleDiss(n, kind) {
  const p = S.player;
  addInbox({
    type: 'diss', title: `⚔️ ${n.name}의 디스곡 「${pick(['참교육', '사형선고', '부고', 'Real Talk', '체급 차이', '팩트폭행', '거품', '가면무도회', '이름값', 'No Mercy'])}」 공개`,
    text: kind === 'response' ? `${n.name}${josa(n.name, '이')} 당신의 저격에 디스곡으로 응수했습니다. 커뮤니티가 들끓고 있습니다.` : `${n.name}${josa(n.name, '이')} 신곡에서 당신을 공개적으로 저격했습니다. "${pick(['방송 래퍼', '가사 대필 의혹', '거품 래퍼', '실력 없는 인싸', '돈만 아는 놈'])}"이라는 가사가 화제입니다.`,
    data: { npcId: n.id, npcName: n.name }, expires: S.t + 3
  });
  p.buzz += 6;
  n.rel = clamp(n.rel - 20, 0, 100);
  addNews(`⚔️ ${n.name}, 디스곡으로 ${p.stage} 저격`, 'bad');
  react('post_diss', 3, { npc: n.name }, { weights: { meme: 3, rival: 3 } });
}

function resolveDiss(ds) {
  const p = S.player; const n = npc(p.dissTarget);
  const my = ds.attrs.lyric * 0.45 + ds.attrs.perf * 0.35 + ds.attrs.hook * 0.2 + rnd(-8, 8);
  const their = n.skill * 0.9 + rnd(-10, 10);
  p.dissTarget = null;
  if (my >= their) {
    p.buzz += 20 + n.fame / 5; p.legacy += 2; p.cred += 2;
    p.followers.x += Math.round(5000 + n.fame * 500);
    n.fame = clamp(n.fame - 3, 4, 99);
    addNews(`🏆 디스전 결과: 커뮤니티 "${p.stage} 완승" vs ${n.name}`, 'good');
    react('diss_war', 6, { npc: n.name }, { weights: { meme: 2, critic: 2 } });
    addMilestone('diss_win', `디스전 승리 (vs ${n.name})`);
    return `⚔️ 디스곡 「${ds.title}」${josa(ds.title, '이')} ${n.name}${josa(n.name, '을')} 압도했습니다! 디스전 승리!`;
  }
  p.buzz += 8; p.sentiment -= 4; n.fame = clamp(n.fame + 2, 4, 99);
  addNews(`😓 디스전 결과: ${n.name} 판정승, ${p.stage} 체면 구겨`, 'bad');
  react('diss_lose', 5, { npc: n.name });
  return `😓 디스곡 「${ds.title}」${josa(ds.title, '이')} ${n.name}의 공격을 넘어서지 못했습니다… 디스전 패배.`;
}

/* =========================================================
 *  소식함 (제안/이벤트)
 * ========================================================= */
function addInbox(m) {
  m.id = uid('m'); m.t = S.t;
  S.inbox.unshift(m);
}

function randomEvents(summary) {
  const p = S.player;
  const t = S.t;
  const cd = (k, w) => { if ((S.cooldowns[k] || -999) > t) return false; S.cooldowns[k] = t + w; return true; };
  const pending = type => S.inbox.some(m => m.type === type);

  // 피처링 요청
  if (p.debutT && R() < 0.04 + p.fame / 250 && !pending('feature')) {
    const pool = S.npcs.filter(n => n.role === 'artist' && n.debutYear <= yearOf(t) && (n.region === 'KR' || p.globalFame > 25) && p.dissTarget !== n.id);
    const n = weightedPick(pool, x => (1 + x.rel / 20) * (Math.abs(x.fame - p.fame) < 25 ? 3 : 1) * (x.crew && x.crew === p.crew ? 3 : 1));
    if (n) addInbox({ type: 'feature', title: `🎙️ ${n.name}의 피처링 요청`, text: `${n.name}(${n.genre}, 인지도 ${Math.round(n.fame)})${josa(n.name, '이')} 신곡 피처링을 요청했습니다. 보수 ${fmtMoney(Math.round(playerFee() * 0.6 / 10000) * 10000)}. (행동력 1 소모)`, data: { npcId: n.id, fee: Math.round(playerFee() * 0.6 / 10000) * 10000 }, expires: t + 2 });
  }
  // 공연 제안
  if (R() < 0.07 + p.fame / 220 && !pending('gig')) {
    const name = p.fame < 20 ? pick(['○○대학교 축제', '홍대 힙합 파티', '지역 문화행사']) : p.fame < 50 ? pick(['서울 힙합 페스티벌', '썸머 뮤직 페스타', '대학 축제 연합 투어']) : pick(['국내 최대 음악 페스티벌 헤드라이너', '아시아 투어 게스트', '연말 대형 콘서트']);
    const pay = Math.round((500000 + p.fame * p.fame * 1500) * rnd(0.8, 1.3) / 100000) * 100000;
    addInbox({ type: 'gig', title: `🎪 공연 섭외: ${name}`, text: `${name}에서 섭외가 왔습니다. 출연료 ${fmtMoney(pay)}. (행동력 1 소모)`, data: { name, pay }, expires: t + 2 });
  }
  // 레이블 제안
  if (!p.label && !S.myLabel && R() < 0.1 && !pending('label')) {
    const cand = LABELS.filter(l => labelEligible(l) && !(S.cooldowns['lab_' + l.id] > t));
    if (cand.length) {
      const lab = weightedPick(cand, l => (l.genres.includes(p.genre) ? 3 : 1) * (1 + l.minFame / 30));
      S.cooldowns['lab_' + lab.id] = t + 26;
      const adv = offerAmount(lab);
      addInbox({ type: 'label', title: `✍️ ${lab.name} 계약 제안`, text: `[${lab.tier}] ${lab.desc}\n계약금 ${fmtMoney(adv)} · 수익 배분 ${Math.round(lab.share * 100)}% · 홍보력 x${lab.promo} · 기간 ${Math.round(lab.weeks / 52)}년 · 연간 발매 의무 ${lab.quota}장`, data: { labelId: lab.id, advance: adv }, expires: t + 4 });
    }
  }
  // 크루 초대
  if (!p.crew && p.fame >= 8 && R() < 0.035 && !pending('crew')) {
    const cand = S.crews.filter(c => !c.own).map(c => ({ c, rel: avg(crewMembers(c.id).map(n => n.rel)) })).filter(x => x.rel > 15 || p.fame > 25);
    if (cand.length) {
      const { c } = pick(cand);
      addInbox({ type: 'crew', title: `🤜 크루 '${c.name}' 합류 제안`, text: `'${c.name}'(${c.vibe}) 멤버들이 당신을 크루에 초대했습니다. 멤버: ${crewMembers(c.id).map(n => n.name).join(', ')}`, data: { crewId: c.id }, expires: t + 3 });
    }
  }
  // 컴필레이션 참여 제안
  if (p.fame >= 10 && R() < 0.025 && !pending('comp') && unreleasedSongs().length) {
    const host = pick(['브랜드 협업 컴필레이션', '레이블 연합 컴필레이션', 'OST 컴필레이션', '자선 컴필레이션 앨범']);
    addInbox({ type: 'comp', title: `📀 ${host} 참여 제안`, text: `${host}에 미발매 곡 1곡을 실어달라는 제안입니다. 참여료 ${fmtMoney(Math.round((1000000 + p.fame * 60000) / 10000) * 10000)}, 노출 효과가 있습니다.`, data: { host, fee: Math.round((1000000 + p.fame * 60000) / 10000) * 10000 }, expires: t + 3 });
  }
  // 오디션 프로그램
  if (p.genre === '힙합' && p.fame >= 4 && p.fame <= 55 && p.tvDoneYear !== yearOf(t) && R() < 0.02 && !pending('tv')) {
    addInbox({ type: 'tv', title: '📺 랩 서바이벌 「더 마이크」 출연 제안', text: '국내 최대 랩 서바이벌 프로그램에서 출연 제안이 왔습니다. 인지도가 폭발할 수도, 망신을 당할 수도 있습니다. 평단 신뢰도는 하락합니다. (이번 주 행동력 전부 소모)', data: {}, expires: t + 2 });
  }
  // 광고
  if (p.fame >= 35 && R() < p.fame / 1400 && !pending('brand')) {
    const brand = pick(['스포츠 브랜드', '이동통신사', '편의점 음료', '치킨 프랜차이즈', '패션 브랜드', '게임 회사']);
    const pay = Math.round((p.fame * p.fame * 8000 + p.globalFame * p.globalFame * 20000) / 1000000) * 1000000;
    addInbox({ type: 'brand', title: `💼 ${brand} 광고 모델 제안`, text: `${brand}에서 광고 모델 제안. 모델료 ${fmtMoney(pay)}. 올드팬들은 싫어할 수도 있습니다.`, data: { brand, pay }, expires: t + 3 });
  }
  // 인터뷰
  if (p.fame >= 15 && R() < 0.04 && cd('interview', 6)) {
    const media = pick(['힙합 데일리', '뮤직 투데이', '사운드 매거진', '월간 리듬', 'Hypebeat Korea']);
    p.buzz += 3;
    addNews(`🗞️ [인터뷰] ${p.stage} "${pick(['다음 앨범은 제 인생을 담을 겁니다', '차트보다 중요한 건 진심', '언젠간 그래미 무대에 서고 싶어요', '요즘 씬에 할 말이 많습니다', '팬들 덕분에 버팁니다'])}" — ${media}`, 'info');
  }
  // 디스
  if (p.fame >= 15 && !p.dissTarget && !pending('diss') && R() < 0.012) {
    const pool = S.npcs.filter(n => n.region === 'KR' && n.role === 'artist' && n.rel < 40 && ['독설가', '허세', '까칠함'].includes(n.trait) && n.crew !== p.crew);
    if (pool.length) scheduleDiss(pick(pool), 'attack');
  }
  // 스캔들
  if (p.fame >= 30 && R() < 0.004 && !pending('scandal')) {
    const what = pick(['과거 SNS 발언', '공연 지각 논란', '가사 표절 의혹', '열애설', '태도 논란']);
    p.sentiment -= 8; p.antiRatio = clamp(p.antiRatio + 3, 0, 45); p.mental -= 10;
    addNews(`🚨 ${p.stage}, ${what} 휩싸여`, 'bad');
    react('scandal', 5);
    addInbox({ type: 'scandal', title: `🚨 논란 발생: ${what}`, text: `${what}${josa(what, '이')} 커뮤니티에서 확산 중입니다. 어떻게 대응할까요?`, data: { what }, expires: t + 2 });
  }
  // NPC 끼리 소식
  if (R() < 0.12) {
    const pool = S.npcs.filter(x => x.region === 'KR' && x.role === 'artist' && x.debutYear <= yearOf(t));
    const a = pick(pool), b = pick(pool.filter(x => x !== a));
    addNews(fill(pick(NPC_NEWS), { a: a.name, b: b.name }), 'npc');
  }
}

function resolveInbox(id, choice, extra = {}) {
  const p = S.player;
  const m = S.inbox.find(x => x.id === id);
  if (!m) return { ok: false, msg: '만료된 제안입니다.' };
  const done = (res) => { S.inbox = S.inbox.filter(x => x.id !== id); save(); return res; };
  const d = m.data;
  if (m.type === 'story') return resolveStory(m, choice);
  if (choice === 'decline') {
    if (m.type === 'feature') { const n = npc(d.npcId); n.rel = clamp(n.rel - 4, 0, 100); }
    if (m.type === 'diss') { p.sentiment -= 3; addNews(`😶 ${p.stage}, ${d.npcName}의 디스에 무대응`, 'info'); }
    if (m.type === 'scandal') { p.sentiment -= 5; addNews(`🤐 ${p.stage}, 논란에 침묵… 비판 거세져`, 'bad'); react('scandal', 2); }
    return done({ ok: true, msg: '거절했습니다.' });
  }
  switch (m.type) {
    case 'feature': {
      if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
      const n = npc(d.npcId);
      p.money += d.fee; n.rel = clamp(n.rel + 14, 0, 100);
      const rel = npcRelease(n, S.t + 1, { featPlayer: true, type: 'single' });
      p.mental = clamp(p.mental - 3, 0, 100);
      addNews(`🎙️ ${n.name} 「${rel.title}」 (Feat. ${p.stage}) 발매 예정`, 'release');
      react('collab', 3, { npc: n.name });
      addMilestone('first_feat', `첫 피처링 참여 (${n.name})`);
      if (n.region === 'GLOBAL') addMilestone('global_feat', `해외 아티스트 곡 피처링 (${n.name})`);
      return done({ ok: true, msg: `${n.name}의 「${rel.title}」에 피처링으로 참여했습니다! 보수 ${fmtMoney(d.fee)}` });
    }
    case 'gig': {
      if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
      const q = p.skills.stage * 0.6 + perfSkill(p.genre) * 0.4 + rnd(-10, 10);
      const fol = Math.round((200 + p.fame * 120) * rnd(0.6, 1.4) * q / 50);
      p.money += d.pay; p.followers.insta += Math.round(fol * 0.6); p.followers.youtube += Math.round(fol * 0.4);
      p.skills.stage = clamp(p.skills.stage + 0.8 * (105 - p.skills.stage) / 100, 0, 100);
      p.buzz += 2; p.mental = clamp(p.mental - 4, 0, 100);
      if (q > 60) { react('post_live', 2); p.sentiment += 2; }
      return done({ ok: true, msg: `${d.name} 무대를 마쳤습니다. ${q > 60 ? '역대급 무대였다는 평!' : '무난했다.'} 출연료 ${fmtMoney(d.pay)}, 팔로워 +${fmtNum(fol)}` });
    }
    case 'label': return done(signLabel(d.labelId, d.advance));
    case 'renew': {
      const lab = labelOf(d.labelId);
      return done(signLabel(lab.id, Math.round(lab.advance * (0.4 + p.fame / 120))));
    }
    case 'crew': return done(joinCrew(d.crewId));
    case 'comp': {
      const s = song(extra.songId);
      if (!s || s.releaseId) return { ok: false, msg: '참여할 미발매 곡을 선택하세요.' };
      p.money += d.fee;
      const res = releaseWork({ type: 'single', title: `${d.host} (${s.title})`, trackIds: [s.id], titleTrackId: s.id, cover: { c1: '#0ea5e9', c2: '#22c55e', emoji: '📀' }, promo: 0 });
      if (!res.ok) { p.money -= d.fee; return res; }
      res.release.type = 'compilation'; res.release.title = d.host; res.release.compName = d.host;
      song(s.id).domBase *= 1.2;
      return done({ ok: true, msg: `「${s.title}」${josa(s.title, '이')} ${d.host}에 수록되었습니다. 참여료 ${fmtMoney(d.fee)}`, release: res.release });
    }
    case 'tv': {
      S.ap = 0;
      p.tvDoneYear = yearOf(S.t);
      const sc = p.skills.flow * 0.45 + p.skills.stage * 0.35 + p.skills.lyric * 0.2 + rnd(-15, 15);
      let rank, msg;
      if (sc > 62) { rank = '우승'; p.buzz += 35; p.legacy += 4; p.followers.insta += 150000 + rint(0, 150000); p.followers.youtube += 80000; }
      else if (sc > 50) { rank = '준우승'; p.buzz += 22; p.legacy += 2; p.followers.insta += 70000 + rint(0, 60000); p.followers.youtube += 30000; }
      else if (sc > 38) { rank = '본선 진출'; p.buzz += 12; p.legacy += 1; p.followers.insta += 20000 + rint(0, 20000); }
      else { rank = '예선 탈락'; p.buzz += 4; p.followers.insta += 3000; p.sentiment -= 3; }
      p.cred -= 4; p.mental = clamp(p.mental - 10, 0, 100);
      addNews(`📺 「더 마이크」 ${p.stage}, ${rank}!`, rank === '예선 탈락' ? 'bad' : 'good');
      react('tv_show', 6);
      if (rank === '우승') addMilestone('tv_win', '랩 서바이벌 「더 마이크」 우승');
      msg = `「더 마이크」 결과: ${rank}! ${rank === '우승' ? '전국구 스타가 되었습니다!' : ''}`;
      return done({ ok: true, msg });
    }
    case 'brand': {
      p.money += d.pay; p.cred -= 1.5; p.buzz += 4; p.followers.insta += Math.round(p.fame * 500);
      addNews(`💼 ${p.stage}, ${d.brand} 광고 모델 발탁`, 'info');
      react('brand', 4);
      return done({ ok: true, msg: `${d.brand} 광고를 촬영했습니다. 모델료 ${fmtMoney(d.pay)}` });
    }
    case 'diss': {
      if (choice === 'song') {
        p.dissTarget = d.npcId; p.dissDeadline = S.t + 6;
        return done({ ok: true, msg: `6주 안에 주제가 '디스'인 곡을 발매하면 디스전이 성사됩니다. (${d.npcName} 대상)` });
      }
      if (choice === 'sns') {
        S.postsLeft = Math.max(1, S.postsLeft);
        const r = makePost({ platform: 'x', type: 'diss', targetId: d.npcId, text: extra.text || '' });
        return done({ ok: true, msg: 'X(트위터)로 응수했습니다.' + (r.notes ? ' ' + r.notes.join(' ') : '') });
      }
      break;
    }
    case 'scandal': {
      if (choice === 'apologize') {
        p.sentiment = clamp(p.sentiment + 5, 0, 100); p.antiRatio = clamp(p.antiRatio - 1, 0, 45);
        addNews(`🙇 ${p.stage}, 자필 사과문 게재`, 'info');
        react('scandal', 2, {}, { weights: { core: 3 } });
        return done({ ok: true, msg: '사과문을 올렸습니다. 여론이 조금 누그러졌습니다.' });
      }
      if (choice === 'legal') {
        const ok = R() < 0.55;
        p.sentiment = clamp(p.sentiment + (ok ? 8 : -6), 0, 100);
        addNews(ok ? `⚖️ ${p.stage} 측 "사실무근, 법적 대응" → 루머 해명 성공` : `⚖️ ${p.stage} 법적 대응 예고했으나 추가 폭로로 역풍`, ok ? 'good' : 'bad');
        return done({ ok: true, msg: ok ? '루머였음이 밝혀졌습니다! 여론 반전.' : '추가 폭로로 역풍을 맞았습니다…' });
      }
      break;
    }
  }
  return { ok: false, msg: '처리할 수 없는 선택입니다.' };
}

/* =========================================================
 *  저장 / 불러오기
 * ========================================================= */
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 저장 불가 환경 무시 */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    S = JSON.parse(raw);
    migrate();
    return true;
  } catch (e) { return false; }
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function deleteSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }
function exportSave() { return JSON.stringify(S); }
function importSave(str) { const o = JSON.parse(str); if (!o.player || !o.npcs) throw new Error('bad'); S = o; migrate(); save(); }

if (typeof module !== 'undefined') module.exports = { newGame, nextWeek, makeSong, releaseWork, getS: () => S };

/* =========================================================
 *  내 레이블
 * ========================================================= */
const LABEL_UPGRADE_COST = [20000000, 60000000, 150000000];
const LABEL_UPGRADES = { studio: '🎚️ 스튜디오', promo: '📣 홍보팀', ar: '🔍 A&R팀' };

function foundLabel({ name, emoji, color }) {
  const p = S.player;
  if (S.myLabel) return { ok: false, msg: '이미 레이블을 운영 중입니다.' };
  if (p.label) return { ok: false, msg: '다른 레이블과 계약 중에는 설립할 수 없습니다. 먼저 계약을 끝내세요.' };
  if (p.fame < 30) return { ok: false, msg: '국내 인지도 30 이상이 필요합니다.' };
  if (p.money < 50000000) return { ok: false, msg: '설립 자금 5,000만원이 필요합니다.' };
  if (!name || !name.trim()) return { ok: false, msg: '레이블 이름을 입력하세요.' };
  p.money -= 50000000;
  S.myLabel = { name: name.trim(), emoji: emoji || '🏷️', color: color || '#a855f7', foundedT: S.t, lv: { studio: 0, promo: 0, ar: 0 }, revTotal: 0, weekly: 0, releases: 0 };
  S.inbox = S.inbox.filter(m => m.type !== 'label');
  addNews(`🏷️ ${p.stage}, 자체 레이블 '${S.myLabel.name}' 설립`, 'good');
  addStory(`${p.stage}${josa(p.stage, '은')} 자신의 레이블 '${S.myLabel.name}'${josa(S.myLabel.name, '을')} 세웠다. 이제 누군가의 소속 아티스트가 아니라, 누군가의 꿈을 책임지는 사람이 되었다.`, 'label');
  addMilestone('own_label', `자체 레이블 '${S.myLabel.name}' 설립`);
  react('label_own', 5);
  save();
  return { ok: true, msg: `레이블 '${S.myLabel.name}'${josa(S.myLabel.name, '을')} 설립했습니다! 아티스트 탭에서 소속 아티스트를 영입하세요.` };
}
function labelRoster() { return S.npcs.filter(n => n.label === 'mylabel'); }
function rosterCap() { return S.myLabel ? 2 + S.myLabel.lv.ar * 2 : 0; }
function upgradeLabel(kind) {
  const L = S.myLabel; if (!L) return { ok: false, msg: '레이블이 없습니다.' };
  const lv = L.lv[kind]; if (lv >= 3) return { ok: false, msg: '이미 최대 레벨입니다.' };
  const cost = LABEL_UPGRADE_COST[lv];
  if (S.player.money < cost) return { ok: false, msg: `비용 ${fmtMoney(cost)}이 부족합니다.` };
  S.player.money -= cost; L.lv[kind]++;
  addNews(`🏷️ ${L.name}, ${LABEL_UPGRADES[kind]} 확장 (Lv.${L.lv[kind]})`, 'info');
  save();
  return { ok: true, msg: `${LABEL_UPGRADES[kind]} Lv.${L.lv[kind]} 업그레이드 완료!` };
}
function signCost(n) {
  const lab = n.label && labelOf(n.label);
  return Math.round((npcFee(n) * 2 + (lab ? npcFee(n) * 3 : 0)) / 100000) * 100000;
}
function signChance(n) {
  if (!S.myLabel || n.region !== 'KR' || n.label === 'mylabel') return 0;
  const lab = n.label && labelOf(n.label);
  let c = 0.15 + n.rel / 120 + (S.player.fame - n.fame) / 80 + S.myLabel.lv.ar * 0.1 + labelRoster().length * 0.02;
  if (lab) c -= lab.tier === '대형기획사' || lab.tier === '글로벌' ? 0.5 : lab.tier === '메이저' ? 0.3 : 0.15;
  if (n.rival) c -= 0.2;
  if (n.debutYear >= yearOf(S.t) - 1) c += 0.15; // 신인은 영입이 쉽다
  return clamp(c, 0.02, 0.9);
}
function signArtist(id) {
  const n = npc(id), L = S.myLabel;
  if (!L) return { ok: false, msg: '먼저 레이블을 설립하세요.' };
  if (labelRoster().length >= rosterCap()) return { ok: false, msg: `소속 아티스트 정원(${rosterCap()}명)이 찼습니다. A&R팀을 확장하세요.` };
  const cost = signCost(n);
  if (S.player.money < cost) return { ok: false, msg: `계약금 ${fmtMoney(cost)}이 부족합니다.` };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  if (R() < signChance(n)) {
    const old = n.label && labelOf(n.label);
    S.player.money -= cost; n.label = 'mylabel'; n.rel = clamp(n.rel + 10, 0, 100);
    addNews(`✍️ ${n.name}, ${old ? `${old.name} 떠나 ` : ''}${L.name}${josa(L.name, '과')} 전속 계약`, 'good');
    addStory(`${n.name}${josa(n.name, '이')} ${L.name}의 식구가 되었다.`, 'label');
    react('label_own', 2, { npc: n.name });
    save();
    return { ok: true, msg: `${n.name}${josa(n.name, '이')} ${L.name}${josa(L.name, '과')} 계약했습니다! (계약금 ${fmtMoney(cost)})` };
  }
  n.rel = clamp(n.rel - 2, 0, 100); save();
  return { ok: true, msg: `${n.name}: "${pick(['좋은 제안이지만 지금 소속사에 의리가 있어서요.', '조금 더 생각해볼게요.', '조건이 좀 아쉽네요.', '아직은 혼자가 편해요.'])}" (영입 실패)` };
}
function dropArtist(id) {
  const n = npc(id); if (!n || n.label !== 'mylabel') return { ok: false, msg: '소속 아티스트가 아닙니다.' };
  n.label = null; n.rel = clamp(n.rel - 15, 0, 100);
  addNews(`📤 ${n.name}, ${S.myLabel.name}${josa(S.myLabel.name, '과')} 계약 종료`, 'info'); save();
  return { ok: true, msg: `${n.name}${josa(n.name, '과')} 계약을 종료했습니다.` };
}
function closeLabel() {
  const L = S.myLabel; if (!L) return { ok: false, msg: '레이블이 없습니다.' };
  labelRoster().forEach(n => { n.label = null; n.rel = clamp(n.rel - 10, 0, 100); });
  addNews(`🏚️ ${S.player.stage}의 레이블 '${L.name}' 폐업`, 'bad');
  addStory(`'${L.name}'의 간판을 내렸다. 꿈은 끝나지 않았지만, 한 시절이 끝났다.`, 'label');
  S.myLabel = null; save();
  return { ok: true, msg: '레이블을 정리했습니다.' };
}
function myLabelWeekly(summary) {
  const L = S.myLabel;
  const roster = labelRoster();
  let rev = 0;
  S.chartSongs.forEach(cs => { const n = cs.artistId && npc(cs.artistId); if (n && n.label === 'mylabel') rev += (cs.dom * 4.5 + cs.glob * 5) * 0.35; });
  // 소속 아티스트 곡에 홍보 효과
  const ops = 500000 + roster.length * 300000 + (L.lv.studio + L.lv.promo + L.lv.ar) * 200000;
  L.weekly = Math.round(rev - ops); L.revTotal += Math.round(rev);
  S.player.money += L.weekly;
  summary.income += Math.max(0, Math.round(rev)); summary.expense += ops;
  roster.forEach(n => { n.rel = clamp(n.rel + 0.3, 0, 100); if (R() < 0.02 + L.lv.studio * 0.01) n.skill = clamp(n.skill + 1, 0, 95); });
}

/* =========================================================
 *  투어 & 굿즈
 * ========================================================= */
function tourCooldown() { return Math.max(0, (S.cooldowns.tour || 0) - S.t); }
function actTour(id) {
  const p = S.player, tr = TOURS.find(x => x.id === id);
  if (!tr) return { ok: false, msg: '투어 정보 오류' };
  if (p.fame < tr.minFame || p.globalFame < tr.minGlobal) return { ok: false, msg: `인지도 ${tr.minFame}+${tr.minGlobal ? `, 해외 인지도 ${tr.minGlobal}+` : ''}가 필요합니다.` };
  if (tourCooldown()) return { ok: false, msg: `지난 투어 후 회복 중입니다. (${tourCooldown()}주 후 가능)` };
  if (p.money < tr.cost) return { ok: false, msg: `제작비 ${fmtMoney(tr.cost)}이 부족합니다.` };
  if (S.ap < 3) return { ok: false, msg: '투어는 행동력 3이 모두 필요합니다.' };
  S.ap = 0;
  const fans = totalFollowers();
  let demand = fans * (p.coreRatio / 100) * 0.3 + fans * 0.015 + p.fame * p.fame * 6;
  if (tr.minGlobal) demand += p.globalFame * p.globalFame * 260;
  const perf = p.skills.stage * 0.6 + perfSkill(p.genre) * 0.4;
  demand *= (0.6 + p.sentiment / 150) * rnd(0.75, 1.2);
  const tickets = Math.round(Math.min(tr.cap, demand));
  const rate = tickets / tr.cap;
  const revenue = Math.round(tickets * tr.price * 0.3 + tickets * rnd(3000, 9000));
  p.money += revenue - tr.cost;
  p.skills.stage = clamp(p.skills.stage + 1.5 * (105 - p.skills.stage) / 100, 0, 100);
  const fol = Math.round(tickets * (0.3 + perf / 200));
  p.followers.insta += Math.round(fol * 0.5); p.followers.youtube += Math.round(fol * 0.3); p.followers.x += Math.round(fol * 0.2);
  p.buzz += 4 + rate * 10; p.gLegacy += tr.glob * rate;
  p.coreRatio = clamp(p.coreRatio + rate * 2, 3, 60);
  p.sentiment = clamp(p.sentiment + (perf > 55 ? 3 : -1), 0, 100);
  p.mental = clamp(p.mental - 15, 0, 100);
  S.cooldowns.tour = S.t + 16;
  if (['national', 'arena', 'asia', 'world'].includes(tr.id)) S.flags.tourNational = true;
  if (tr.id === 'world') { S.flags.worldTour = true; addMilestone('world_tour', '월드 투어 개최'); }
  if (rate >= 0.99) addMilestone('soldout_' + tr.id, `${tr.name} 전석 매진`);
  react('tour', 5, {}, { weights: tr.glob ? { global: 3 } : {} });
  addNews(`🎫 ${p.stage} ${tr.name}, 관객 ${fmtNum(tickets)}명 (${Math.round(rate * 100)}%)`, rate > 0.9 ? 'good' : 'info');
  addStory(`${tr.name}. ${rate >= 0.99 ? '전석 매진이었다. 마지막 곡에서 떼창이 터졌다.' : rate > 0.6 ? `${Math.round(rate * 100)}%의 객석이 찼다. 충분히 뜨거웠다.` : '빈자리가 눈에 밟혔지만, 와준 사람들을 위해 끝까지 노래했다.'}`, 'tour');
  save();
  const profit = revenue - tr.cost;
  return { ok: true, msg: `${tr.name} 종료! 관객 ${fmtNum(tickets)}명 (판매율 ${Math.round(rate * 100)}%) · ${profit >= 0 ? '순수익' : '적자'} ${fmtMoney(profit)}` };
}
function merchCooldown() { return Math.max(0, (S.cooldowns.merch || 0) - S.t); }
function actMerch() {
  const p = S.player;
  if (p.fame < 10) return { ok: false, msg: '인지도 10 이상이 필요합니다.' };
  if (merchCooldown()) return { ok: false, msg: `다음 굿즈는 ${merchCooldown()}주 후에 낼 수 있습니다.` };
  const cost = 5000000;
  if (p.money < cost) return { ok: false, msg: '제작비 500만원이 필요합니다.' };
  const buyers = Math.round(totalFollowers() * (p.coreRatio / 100) * rnd(0.02, 0.06) * (0.5 + p.sentiment / 100));
  const revenue = buyers * 32000;
  p.money += revenue - cost; p.sentiment = clamp(p.sentiment + 1, 0, 100);
  S.cooldowns.merch = S.t + 12;
  const item = pick(['후드티', '키링 세트', '한정판 LP', '포토북', '응원봉', '볼캡', '티셔츠']);
  addNews(`🛍️ ${p.stage} 공식 ${item} 출시`, 'info');
  save();
  return { ok: true, msg: `${item} 출시! 구매자 ${fmtNum(buyers)}명 · ${revenue - cost >= 0 ? '순수익' : '손실'} ${fmtMoney(revenue - cost)}` };
}

/* =========================================================
 *  군 복무
 * ========================================================= */
function enlist() {
  const p = S.player;
  p.military = { startT: S.t, endT: S.t + 78 };
  S.ap = 0; S.postsLeft = 0;
  if (p.contract) p.contract.endT += 78;
  S.inbox = S.inbox.filter(m => m.type === 'story');
  p.coreRatio = clamp(p.coreRatio + 2, 3, 60);
  react('military_in', 5);
  addNews(`🪖 ${p.stage}, 오늘 입대… "다녀오겠습니다"`, 'info');
  addStory(`${p.stage}${josa(p.stage, '은')} 머리를 짧게 자르고 훈련소로 향했다. 1년 반 동안 마이크 대신 총을 든다.`, 'military');
}
function discharge(summary) {
  const p = S.player;
  p.military = null;
  p.buzz += 15; p.sentiment = clamp(p.sentiment + 6, 0, 100); p.coreRatio = clamp(p.coreRatio + 2, 3, 60); p.hype += 25;
  react('military_out', 6);
  addNews(`🎖️ ${p.stage}, 만기 전역! 복귀 신호탄`, 'good');
  addStory(`전역. 부대 정문을 나서며 가장 먼저 한 일은 휴대폰 메모장에 가사 한 줄을 적는 것이었다.`, 'military');
  addMilestone('discharge', '군 복무 완료');
  summary.events.push('🎖️ 전역했습니다! 복귀작에 대한 기대감(하입)이 높습니다.');
}
// 전역까지 빠르게 진행: 주요 이벤트만 모아서 돌려준다
function fastForwardMilitary() {
  const ev = [];
  let guard = 0;
  while (S.player.military && guard++ < 90) {
    const sm = nextWeek();
    sm.chart.concat(sm.events).forEach(e => { if (/수상|후보|전역|🎆|💎|📝/.test(e)) ev.push(`[${dateLabel(S.t)}] ${e}`); });
  }
  return ev;
}

/* =========================================================
 *  스토리 이벤트
 * ========================================================= */
function storyEvents(summary) {
  const p = S.player;
  if (S.inbox.some(m => m.type === 'story')) return;
  S.storyDone = S.storyDone || {};
  for (const ev of shuffle(STORY_EVENTS)) {
    if (ev.once && S.storyDone[ev.id]) continue;
    if ((S.cooldowns['st_' + ev.id] || 0) > S.t) continue;
    let ok = false;
    try { ok = ev.cond(p, S); } catch (e) { ok = false; }
    if (!ok || R() >= ev.w) continue;
    const v = storyVars();
    S.storyDone[ev.id] = S.t;
    S.cooldowns['st_' + ev.id] = S.t + 20;
    addInbox({ type: 'story', title: fill(ev.title, v), text: fill(ev.text, v), data: { eventId: ev.id }, expires: S.t + 3 });
    summary.events.push(`📖 ${fill(ev.title, v)} — 소식함에서 선택하세요.`);
    if (ev.id === 'doubt') S.flags.doubtNow = true;
    if (ev.id === 'slump') S.flags.slumpNow = true;
    return;
  }
}

function applyFx(fx, out) {
  const p = S.player;
  if (fx.chance) {
    const [pr, a, b] = fx.chance;
    const pickFx = R() < pr ? a : b;
    applyFx(pickFx, out);
    if (pickFx.res) out.res = pickFx.res;
  }
  if (fx.ap && S.ap < -fx.ap) throw new Error('행동력이 부족합니다.');
  if (fx.ap) S.ap += fx.ap;
  if (fx.mental) p.mental = clamp(p.mental + fx.mental, 0, 100);
  if (fx.money) p.money += fx.money;
  if (fx.sentiment) p.sentiment = clamp(p.sentiment + fx.sentiment, 0, 100);
  if (fx.core) p.coreRatio = clamp(p.coreRatio + fx.core, 3, 60);
  if (fx.cred) p.cred += fx.cred;
  if (fx.buzz) p.buzz += fx.buzz;
  if (fx.followers) { p.followers.insta += Math.round(fx.followers * 0.6); p.followers.youtube += Math.round(fx.followers * 0.25); p.followers.x += Math.round(fx.followers * 0.15); }
  if (fx.flag) { S.flags[fx.flag] = true; S.flagT[fx.flag] = S.t; }
  if (fx.insp) { p.inspiration = (p.inspiration || []).filter(x => x.theme !== fx.insp[0]); p.inspiration.push({ theme: fx.insp[0], bonus: fx.insp[1], until: S.t + 20 }); out.notes.push(`💡 '${fx.insp[0]}' 영감 +${fx.insp[1]} (20주 안에 이 주제로 곡을 쓰면 반영)`); }
  if (fx.skill) { const [k, g] = fx.skill; p.skills[k] = clamp(p.skills[k] + g, 0, 100); out.notes.push(`📈 ${SKILL_NAMES[k]} +${g}`); }
  if (fx.mentorRel && S.mentorId) { const m = npc(S.mentorId); m.rel = clamp(m.rel + fx.mentorRel, 0, 100); }
  if (fx.rivalRel && S.rivalId) { const r = npc(S.rivalId); r.rel = clamp(r.rel + fx.rivalRel, 0, 100); }
  if (fx.react) react(fx.react, 3);
  if (fx.diss && S.rivalId) { p.dissTarget = S.rivalId; p.dissDeadline = S.t + 6; out.notes.push('⚔️ 6주 안에 주제가 \'디스\'인 곡을 발매하세요.'); }
  if (fx.loseDemo) { const un = unreleasedSongs(); if (un.length) { const lost = pick(un); S.songs = S.songs.filter(x => x !== lost); out.notes.push(`💾 데모 「${lost.title}」${josa(lost.title, '을')} 잃었습니다.`); } }
  if (fx.military) { enlist(); out.notes.push('🪖 78주 동안 활동할 수 없습니다. 홈 화면에서 전역까지 빠르게 넘길 수 있습니다.'); }
}

function resolveStory(m, choiceId) {
  const ev = STORY_EVENTS.find(e => e.id === m.data.eventId);
  const ch = ev && ev.choices.find(c => c.id === choiceId);
  if (!ch) return { ok: false, msg: '선택지를 찾을 수 없습니다.' };
  const out = { res: ch.res, notes: [] };
  try { applyFx(ch.fx, out); } catch (e) { return { ok: false, msg: e.message }; }
  if (ev.id === 'doubt') S.flags.doubtNow = false;
  if (ev.id === 'slump') S.flags.slumpNow = false;
  const res = fill(out.res || '', storyVars());
  addStory(`${m.title} — ${ch.label}. ${res}`, 'choice');
  S.inbox = S.inbox.filter(x => x.id !== m.id);
  save();
  return { ok: true, msg: res || ch.label, story: { title: m.title, choice: ch.label, res, notes: out.notes } };
}

/* =========================================================
 *  챕터 & 목표
 * ========================================================= */
function hasMs(k) { return S.milestones.some(m => m.key === k); }
function chapterIndex() {
  const p = S.player;
  let c = 0;
  if (p.debutT) c = 1;
  if (c >= 1 && (p.fame >= 20 || hasMs('melon_in'))) c = 2;
  if (c >= 2 && (p.fame >= 45 || hasMs('melon10'))) c = 3;
  if (c >= 3 && (p.fame >= 70 || S.trophies.some(t => t.major && t.award !== '서울 스트리밍 어워즈'))) c = 4;
  if (c >= 3 && (p.globalFame >= 30 || hasMs('hot100'))) c = Math.max(c, 5);
  if (c >= 4 && (hasMs('grammy_win') || (p.fame >= 95 && p.globalFame >= 70))) c = 6;
  return c;
}
function checkChapter(summary) {
  const c = chapterIndex();
  if (c > S.chapter) {
    S.chapter = c;
    const ch = CHAPTERS[c];
    const text = fill(ch.text, storyVars());
    addStory(`${ch.title} — ${text}`, 'chapter');
    summary.events.push(`📖 새 챕터: ${ch.title}`);
    summary.chapter = { title: ch.title, text };
  }
}
function goalDone(id) {
  const p = S.player;
  switch (id) {
    case 'song': return S.songs.length > 0;
    case 'debut': return !!p.debutT;
    case 'ep': return S.releases.some(r => r.type === 'EP' || r.type === 'album');
    case 'melon': return hasMs('melon_in');
    case 'star4': return S.releases.some(r => r.reviews.some(v => v.outlet === 'rhythmer' && v.value >= 4));
    case 'fol100k': return totalFollowers() >= 1e5;
    case 'label': return !!(p.label || S.myLabel || S.milestones.some(m => m.key.startsWith('label_')));
    case 'award': return S.trophies.length > 0;
    case 'top10': return hasMs('melon10');
    case 'tour': return !!S.flags.tourNational;
    case 'melon1': return hasMs('melon1');
    case 'kma': return S.trophies.some(t => t.award === '한국대중음악상');
    case 'hot100': return hasMs('hot100') || hasMs('hot100feat');
    case 'grammyNom': return hasMs('grammy_nom');
    case 'grammy': return hasMs('grammy_win');
  }
  return false;
}
function checkGoals(summary) {
  GOALS.forEach(g => {
    if (S.goalsDone[g.id] || !goalDone(g.id)) return;
    S.goalsDone[g.id] = S.t;
    summary.events.push(`🎯 목표 달성: ${g.text}`);
    addStory(`목표 달성 — ${g.text}.`, 'goal');
  });
}

/* ---------- 은퇴 에필로그 ---------- */
function epilogue() {
  const p = S.player;
  const years = Math.max(1, Math.round((S.t - (p.debutT || S.t)) / 52));
  const wins = S.trophies.length, grammy = hasMs('grammy_win');
  const best = S.releases.slice().sort((a, b) => b.critic - a.critic)[0];
  const top = S.songs.slice().sort((a, b) => (b.totalDom + b.totalGlob) - (a.totalDom + a.totalGlob))[0];
  let arch;
  if (grammy) arch = `${p.stage}${josa(p.stage, '은')} 한국 음악사에서 가장 먼 곳까지 간 이름 중 하나로 기억된다.`;
  else if (wins >= 10 && p.fame >= 70) arch = `${p.stage}${josa(p.stage, '은')} 한 시대를 정의한 아티스트였다. 시상식 무대는 늘 ${p.stage}의 차지였다.`;
  else if (p.cred >= 12 && best && best.critic >= 80) arch = `대중적 성공과는 별개로, ${p.stage}${josa(p.stage, '은')} 평단과 음악가들이 가장 존경하는 이름으로 남았다.`;
  else if (p.fame >= 60) arch = `${p.stage}의 노래는 한 세대의 플레이리스트를 채웠다.`;
  else if (S.releases.length) arch = `큰 빛을 보진 못했지만, ${p.stage}의 음악을 인생곡으로 꼽는 사람들이 분명히 있다.`;
  else arch = `${p.stage}의 이야기는 시작도 하기 전에 끝났다. 하지만 꿈을 꿨다는 사실만은 남았다.`;
  const lines = [`${years}년의 활동.`, arch];
  if (best) lines.push(`평단이 꼽은 최고작은 『${best.title}』(평단 지수 ${best.critic}).`);
  if (top && top.totalDom + top.totalGlob > 0) lines.push(`가장 많이 들린 노래는 「${top.title}」, 누적 ${fmtNum(top.totalDom + top.totalGlob)}회.`);
  if (S.myLabel) lines.push(`${p.stage}${josa(p.stage, '이')} 세운 레이블 '${S.myLabel.name}'${josa(S.myLabel.name, '은')} 다음 세대를 키워내고 있다.`);
  const r = S.rivalId && npc(S.rivalId);
  if (r) lines.push(`평생의 라이벌 ${r.name}${r.fame > p.fame ? josa(r.name, '은') + ' 끝내 한 발 앞서 있었다.' : josa(r.name, '을') + ' 결국 넘어섰다.'}`);
  return lines.join(' ');
}

/* ---------- 이전 버전 세이브 보정 ---------- */
function migrate() {
  const d = { flags: {}, flagT: {}, story: [], npcWins: {}, goalsDone: {}, chapter: 0, myLabel: null, rivalId: null, mentorId: null, lastRelCritic: null, storyDone: {} };
  Object.keys(d).forEach(k => { if (S[k] === undefined) S[k] = d[k]; });
  if (!S.player.inspiration) S.player.inspiration = [];
  if (S.player.military === undefined) S.player.military = null;
  S.songs.forEach(s => { if (!s.note) s.note = songNote(s, titleFitsTheme(s.title, s.theme)); });
}
