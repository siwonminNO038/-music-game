/* =========================================================
 *  확장 2: 장르·래퍼 추가, 해외 크루, 합작 앨범, 비트 판매,
 *          팬덤(팬클럽·스밍 총공), 해외 페스티벌
 *  데이터 부분은 game.js 보다 먼저, 로직은 나중에 쓰이므로
 *  conflict.js 다음에 로드해도 newGame 시점에는 모두 준비되어 있다.
 * ========================================================= */

/* ---------- 장르 추가 ---------- */
GENRES.push('국악 퓨전', '라틴', '아프로비츠', '컨트리', '가스펠', 'J-팝');
Object.assign(GENRE_PERF, {
  '국악 퓨전': { vocal: 0.85, flow: 0.15 },
  '라틴': { vocal: 0.65, flow: 0.35 },
  '아프로비츠': { vocal: 0.6, flow: 0.4 },
  '컨트리': { vocal: 0.85, flow: 0.15 },
  '가스펠': { vocal: 0.95, flow: 0.05 },
  'J-팝': { vocal: 0.8, flow: 0.2 }
});
Object.assign(STYLES, {
  '국악 퓨전': [
    { name: '판소리 펑크', fx: { originality: 7, perf: 3, hook: -2 } }, { name: '민요 일렉트로닉', fx: { originality: 6, hook: 2, lyric: -2 } },
    { name: '국악 재즈', fx: { sound: 4, originality: 4, hook: -3 } }, { name: '사물놀이 록', fx: { perf: 5, originality: 3, sound: -1 } }
  ],
  '라틴': [
    { name: '레게톤', fx: { hook: 6, lyric: -3 } }, { name: '라틴 팝', fx: { hook: 4 } }, { name: '바차타', fx: { perf: 3, hook: 2 } }, { name: '살사', fx: { perf: 4, originality: 1, lyric: -1 } }
  ],
  '아프로비츠': [
    { name: '아프로팝', fx: { hook: 5, lyric: -2 } }, { name: '아마피아노', fx: { sound: 4, originality: 3, lyric: -3 } }, { name: '아프로 퓨전', fx: { originality: 4, hook: 2 } }
  ],
  '컨트리': [
    { name: '정통 컨트리', fx: { lyric: 4, originality: -3 } }, { name: '컨트리 팝', fx: { hook: 5, originality: -1 } }, { name: '아메리카나', fx: { lyric: 5, hook: -2 } }, { name: '컨트리 랩', fx: { originality: 5, hook: 2, lyric: -2 } }
  ],
  '가스펠': [
    { name: '전통 가스펠', fx: { perf: 5, originality: -3 } }, { name: '컨템포러리 CCM', fx: { hook: 3, lyric: 2 } }, { name: '가스펠 힙합', fx: { originality: 5, lyric: 2, hook: -1 } }
  ],
  'J-팝': [
    { name: '애니송', fx: { hook: 5, perf: 2, lyric: -2 } }, { name: '보카로 스타일', fx: { originality: 5, sound: 2, perf: -3 } }, { name: '시티팝 리바이벌', fx: { hook: 3, sound: 2 } }, { name: 'J-록', fx: { perf: 4, hook: 1 } }
  ]
});
Object.assign(TITLE_BANK, {
  '국악 퓨전': ['범 내려온다 2', '수궁가 리믹스', '아리랑 2049', '새타령', '흥타령', '뱃노래', '도깨비 장단', '달아 높이곰', '진도 아리랑 블루스', '한(恨)'],
  '라틴': ['Despacio', 'Corazón', 'Fuego Lento', 'Bailando en Seúl', 'Mi Amor', 'La Noche', 'Tequila Sunrise', 'Calor', 'Bésame Otra Vez', 'Reina'],
  '아프로비츠': ['Lagos to Seoul', 'Wahala', 'Ojuelegba Nights', 'Sunshine Wine', 'Gbedu', 'Soweto Love', 'Afro Gold', 'Komole', 'Ginger Me', 'Ayo'],
  '컨트리': ['Dirt Road Seoul', 'Whiskey Rain', 'Pickup Truck Blues', 'Small Town Heart', 'Cowboy Tears', 'Tennessee Moon', 'Back Porch', 'Honky Tonk Kimchi', 'Long Way Home', 'Boots & Roses'],
  '가스펠': ['Amazing Again', '은혜', 'Hallelujah Seoul', 'Higher Ground', '새벽 기도', 'Glory Road', 'Mercy Me', '빛으로', 'Praise Break', '주일 아침'],
  'J-팝': ['夜に駆ける 2', 'Sakura Drop', '東京 Midnight', 'Summer Rain', '星の約束', 'Kawaii Overdrive', 'Hanabi', '雪の華', 'Neon Tokyo', '青い春']
});

/* ---------- 래퍼 · 아티스트 추가 (실제 씬 모티브 패러디) ---------- */
NPC_KR.push(
  { name: '버벌민트', genre: '힙합', fame: 58, skill: 86, trait: '장인', label: null, crew: null, bio: '한국어 라임 이론을 정립한 교수님 래퍼' },
  { name: '타이거 JJ', genre: '힙합', fame: 60, skill: 80, trait: '카리스마', label: null, crew: null, bio: '한국 힙합 1세대의 살아있는 전설' },
  { name: '윤미래야', genre: '힙합', fame: 62, skill: 88, trait: '카리스마', label: null, crew: null, bio: '랩과 노래 모두 정점에 선 원조 여성 MC' },
  { name: '다이내믹 트리오', genre: '힙합', fame: 72, skill: 82, trait: '유쾌함', label: 'aomz', crew: null, bio: '20년째 정상을 지키는 국민 힙합 그룹' },
  { name: '에픽 로우', genre: '힙합', fame: 76, skill: 83, trait: '감성적', label: null, crew: null, bio: '감성 힙합으로 세계 투어까지 해낸 3인조' },
  { name: '팔로알토스', genre: '힙합', fame: 42, skill: 84, trait: '장인', label: null, crew: 'soul', bio: '언더 정신을 지키는 하이라이트의 수장' },
  { name: '허클베리 Q', genre: '힙합', fame: 36, skill: 85, trait: '독설가', label: null, crew: 'soul', bio: '부산 출신 독설의 랩 장인' },
  { name: '매드클라운스', genre: '힙합', fame: 52, skill: 79, trait: '감성적', label: null, crew: null, bio: '발성 하나로 장르가 된 래퍼' },
  { name: '로꼬마', genre: '힙합', fame: 58, skill: 74, trait: '유쾌함', label: 'aomz', crew: null, bio: '서바이벌 초대 우승자 출신 히트메이커' },
  { name: '해시스완', genre: '힙합', fame: 44, skill: 76, trait: '허세', label: null, crew: null, bio: '오토튠 감성의 트랩 스타' },
  { name: 'pH-2', genre: '힙합', fame: 54, skill: 80, trait: '감성적', label: 'lower', crew: null, bio: '부드러운 톤의 영어·한국어 바이링구얼 래퍼' },
  { name: '애쉬 아일랜즈', genre: '힙합', fame: 60, skill: 72, trait: '감성적', label: 'ambitious', crew: null, bio: '아이돌급 인기의 이모 래퍼' },
  { name: '빅너티스', genre: '힙합', fame: 52, skill: 76, trait: '유쾌함', label: null, crew: null, bio: '10대에 서바이벌을 뒤흔든 천재 래퍼' },
  { name: '김하오', genre: '힙합', fame: 48, skill: 78, trait: '신비주의', label: null, crew: null, bio: '명상하는 소년 래퍼' },
  { name: '재키와이드', genre: '힙합', fame: 34, skill: 84, trait: '독설가', label: 'indigo', crew: null, bio: '거친 톤의 하드코어 여성 래퍼' },
  { name: '씨잼잼', genre: '힙합', fame: 46, skill: 86, trait: '독설가', label: null, crew: 'yngbroke', bio: '랩 하나만큼은 누구도 부정 못 하는 테크니션' },
  { name: '릴라마스', genre: '힙합', fame: 46, skill: 74, trait: '유쾌함', label: null, crew: null, bio: '중독적인 훅의 멜로디 래퍼' },
  { name: '오웬스', genre: '힙합', fame: 38, skill: 77, trait: '감성적', label: 'lower', crew: null, bio: '음울한 감성의 신예 싱어 래퍼' },
  { name: '이날치기', genre: '국악 퓨전', fame: 58, skill: 88, trait: '유쾌함', label: 'magicblue', crew: null, bio: '판소리와 베이스로 전국을 들썩인 밴드' },
  { name: '잠비나이스', genre: '국악 퓨전', fame: 32, skill: 90, trait: '장인', label: null, crew: null, bio: '해금과 거문고로 포스트록을 하는 해외 평단의 총아' }
);
NPC_GLOBAL.push(
  { name: 'Nicki Minarj', genre: '힙합', fame: 90, skill: 80, trait: '카리스마', crew: 'youngcash', bio: '바비 군단을 거느린 랩 여왕' },
  { name: 'Cardi C', genre: '힙합', fame: 88, skill: 72, trait: '유쾌함', bio: '솔직함이 무기인 브롱크스 출신 래퍼' },
  { name: 'M&M', genre: '힙합', fame: 92, skill: 92, trait: '독설가', bio: '랩 갓. 디트로이트의 전설' },
  { name: 'Lil Lane', genre: '힙합', fame: 84, skill: 82, trait: '허세', crew: 'youngcash', bio: '뉴올리언스 출신 믹스테이프의 왕' },
  { name: 'Megan Thee Pony', genre: '힙합', fame: 85, skill: 76, trait: '카리스마', bio: '휴스턴의 핫 걸' },
  { name: 'Playboi Kart', genre: '힙합', fame: 86, skill: 66, trait: '신비주의', bio: '레이지 사운드의 뱀파이어' },
  { name: 'Lil Oozy', genre: '힙합', fame: 84, skill: 70, trait: '허세', bio: '록스타 감성의 트랩 아이콘' },
  { name: '22 Savage', genre: '힙합', fame: 85, skill: 74, trait: '까칠함', bio: '나지막한 목소리의 애틀랜타 래퍼' },
  { name: 'Ice Rice', genre: '힙합', fame: 78, skill: 64, trait: '유쾌함', bio: '뉴욕 드릴의 신성' },
  { name: 'Central Bee', genre: '힙합', fame: 80, skill: 74, trait: '신비주의', bio: 'UK 드릴을 세계로 알린 런던 래퍼' },
  { name: 'Snoop Hogg', genre: '힙합', fame: 86, skill: 78, trait: '유쾌함', bio: '웨스트코스트의 영원한 형님' },
  { name: 'JAY-X', genre: '힙합', fame: 88, skill: 90, trait: '카리스마', bio: '힙합 최초의 억만장자' },
  { name: 'Doechi', genre: '힙합', fame: 74, skill: 86, trait: '유쾌함', bio: '연극적인 퍼포먼스의 신예' },
  { name: 'A$AP Rocko', genre: '힙합', fame: 82, skill: 76, trait: '허세', crew: 'asapmop', bio: '패션과 힙합의 아이콘' },
  { name: 'Jojo J', genre: '인디', fame: 74, skill: 84, trait: '신비주의', crew: '99rising', bio: '유튜버에서 감성 싱어송라이터로' },
  { name: 'Poor Brian', genre: '힙합', fame: 66, skill: 76, trait: '유쾌함', crew: '99rising', bio: '인도네시아 출신 바이럴 래퍼' },
  { name: 'Metro Zoomin', genre: '힙합', fame: 80, skill: 88, trait: '장인', role: 'producer', bio: '차트를 지배하는 트랩 프로듀서' },
  { name: 'Rosalina', genre: '라틴', fame: 88, skill: 88, trait: '장인', bio: '플라멩코를 재발명한 스페인 아티스트' },
  { name: 'Burna Girl', genre: '아프로비츠', fame: 82, skill: 84, trait: '카리스마', bio: '아프리칸 자이언트' },
  { name: 'Wizbaby', genre: '아프로비츠', fame: 80, skill: 78, trait: '감성적', bio: '라고스 출신 아프로팝 슈퍼스타' },
  { name: 'Morgan Wallet', genre: '컨트리', fame: 92, skill: 72, trait: '허세', bio: '차트를 점령한 컨트리 스타' },
  { name: 'Zach Brian', genre: '컨트리', fame: 84, skill: 86, trait: '감성적', bio: '어쿠스틱 기타 하나로 스타디움을 채우는 시인' },
  { name: 'Kirk Franklyn', genre: '가스펠', fame: 70, skill: 86, trait: '카리스마', bio: '가스펠을 차트에 올린 거장' },
  { name: '요루소비', genre: 'J-팝', fame: 86, skill: 80, trait: '신비주의', bio: '소설을 노래로 만드는 일본 듀오' },
  { name: 'Hikaru Utata', genre: 'J-팝', fame: 84, skill: 90, trait: '감성적', bio: '일본 팝의 천재 싱어송라이터' }
);
// 해외 아티스트에게 크루 지정 (기존 목록)
[['Tyler, the Inventor', 'oddpast'], ['J. Coal', 'dreamtown'], ['Drakon', 'youngcash'], ['Kendall Lamarr', null]].forEach(([nm, cr]) => {
  const n = NPC_GLOBAL.find(x => x.name === nm); if (n && cr) n.crew = cr;
});
// 해외 크루
CREWS.push(
  { id: 'oddpast', name: 'Odd Past', vibe: '스케이트보드와 반항의 LA 크루', cred: 4, region: 'GLOBAL' },
  { id: 'asapmop', name: 'A$AP Mop', vibe: '패션과 힙합의 할렘 크루', cred: 1, region: 'GLOBAL' },
  { id: 'dreamtown', name: 'Dreamtown', vibe: '가사 중심 노스캐롤라이나 크루', cred: 5, region: 'GLOBAL' },
  { id: 'youngcash', name: 'Young Cash', vibe: '차트를 쓸어 담는 히트메이커 집단', cred: -1, region: 'GLOBAL' },
  { id: '99rising', name: '99 Rising', vibe: '아시아 아티스트를 세계로 보내는 크리에이티브 집단', cred: 3, region: 'GLOBAL' }
);
LABELS.push(
  { id: 'gogoabc', name: '고고 ABC 레코즈', tier: '인디', minFame: 8, promo: 1.15, share: 0.75, advance: 3000000, cred: 6, global: 0.05, quota: 1, weeks: 104, genres: ['국악 퓨전', '재즈', '인디'], desc: '전통과 실험을 잇는 크로스오버 레이블. 해외 페스티벌 연이 깊다.' },
  { id: 'sonidos', name: 'Sonidos Globales (ES)', tier: '글로벌', minFame: 45, minGlobal: 12, promo: 1.6, share: 0.55, advance: 150000000, cred: 2, global: 0.3, quota: 1, weeks: 156, genres: ['라틴', '아프로비츠', '팝', '힙합'], desc: '라틴·아프로 시장을 꽉 잡은 월드뮤직 메이저.' }
);

/* 시상식 부문 */
(function () {
  const g = AWARDS.find(a => a.id === 'grammy');
  g.cats.push(
    { name: 'Best Latin Pop Album', type: 'album', genre: '라틴', wc: 0.55, wp: 0.45 },
    { name: 'Best African Music Performance', type: 'track', genre: '아프로비츠', wc: 0.5, wp: 0.5 },
    { name: 'Best Country Album', type: 'album', genre: '컨트리', wc: 0.55, wp: 0.45 },
    { name: 'Best Gospel Performance/Song', type: 'track', genre: '가스펠', wc: 0.6, wp: 0.4 },
    { name: 'Best Global Music Album', type: 'album', genre: '국악 퓨전', wc: 0.7, wp: 0.3 }
  );
  AWARDS.find(a => a.id === 'kma').cats.push({ name: '최우수 크로스오버 음반', type: 'album', genre: '국악 퓨전', wc: 0.92, wp: 0.08 });
})();

/* 팬덤 반응 */
Object.assign(REACTIONS, {
  fandom_born: {
    core: ['우리 이름 생겼다!!! {fandom} 영원히 💜', '{fandom}로서 자부심 느낀다', '공식 팬덤명 너무 찰떡이다'],
    casual: ['팬덤 이름 귀엽네'],
    meme: ['[공식] {stage} 팬덤명 확정 "{fandom}"', '{fandom} 가입 신청서 어디서 씀?'],
    hater: ['팬덤명 오글거려 ㅋㅋ']
  },
  stream_party: {
    core: ['{fandom} 총공 시작!!! 「{title}」 스밍 돌려', '알람 맞춰놓고 스밍 중 💪', '「{title}」 차트 올리자!!!'],
    casual: ['요즘 「{title}」 왜 이렇게 많이 들리지?'],
    hater: ['팬덤 총공으로 만든 순위 ㅋㅋ'],
    critic: ['총공으로 만든 순위는 오래가지 않는다'],
    meme: ['{fandom}, 오늘도 스밍 노동 중 ⛏️']
  },
  global_crew: {
    global: ['WAIT {stage} JOINED {crew}??? 🔥🔥', 'this is the crossover we needed', 'korea x {crew} is crazy'],
    core: ['해외 크루 합류 실화냐 ㄷㄷ', '국힙의 세계화'],
    critic: ['해외 크루 합류는 상징적이다. 결과물로 증명할 차례'],
    hater: ['해외 물 먹더니 변하겠네'],
    meme: ['[속보] {stage}, {crew} 단톡방 입성']
  },
  festival_global: {
    global: ['{stage} at the festival was THE moment', 'the crowd knew every word 😭', 'who is this korean artist?? new fan'],
    core: ['해외 페스티벌 무대라니 ㅠㅠㅠ', '국뽕 차오른다'],
    meme: ['[현장] {stage}, 사막 한복판에서 떼창 유도 성공']
  },
  collab_album: {
    core: ['{stage} x {npc} 합작이라니 꿈인가', '이 조합 무조건 명반'],
    critic: ['두 사람의 색이 어떻게 섞일지가 관건', '합작 앨범은 보통 한쪽이 잡아먹히던데'],
    rival: ['우리 {npc} 덕분에 묻어가네'],
    meme: ['{stage} & {npc} 합작 발표에 커뮤니티 폭발']
  }
});

/* ---------- 해외 페스티벌 ---------- */
const GLOBAL_FESTS = [
  { name: '코첼로 페스티벌 (미국)', minG: 25, pay: 80000000, gl: 4 },
  { name: '롤라팔루치 (시카고)', minG: 22, pay: 50000000, gl: 3 },
  { name: '글래스톤베리 (영국)', minG: 30, pay: 70000000, gl: 4 },
  { name: '서머소니코 (일본)', minG: 15, pay: 30000000, gl: 2 },
  { name: '롤링 라우더 (마이애미)', minG: 20, pay: 40000000, gl: 3 }
];

/* =========================================================
 *  로직
 * ========================================================= */

/* 세이브/새 게임 보정: 새 아티스트·크루를 기존 세이브에도 추가 */
function ensureExpansion() {
  CREWS.forEach(c => { if (!S.crews.find(x => x.id === c.id)) S.crews.push(Object.assign({ own: false }, c)); });
  const have = new Set(S.npcs.map(n => n.name));
  NPC_KR.forEach(n => { if (!have.has(n.name)) { const x = mkNpc(n, 'KR'); x.parody = true; S.npcs.push(x); } });
  NPC_GLOBAL.forEach(n => { if (!have.has(n.name)) { const x = mkNpc(n, 'GLOBAL'); x.parody = true; S.npcs.push(x); } });
  // 기존 해외 아티스트 크루 지정
  NPC_GLOBAL.forEach(d => { const n = S.npcs.find(x => x.name === d.name); if (n && d.crew && !n.crew) n.crew = d.crew; });
  if (S.fandom === undefined) S.fandom = null;
  if (!S.beatCredits) S.beatCredits = [];
}

function crewRegion(c) { return c && c.region === 'GLOBAL' ? 'GLOBAL' : 'KR'; }
function globalCrewMates() { const p = S.player; return p.crew ? crewMembers(p.crew).filter(n => n.region === 'GLOBAL') : []; }

/* 해외 아티스트 영입 확률 (내 크루) */
function globalRecruitChance(n) {
  const p = S.player;
  if (p.globalFame < 15) return 0;
  let c = (n.rel - 55) / 50 + (p.globalFame - n.fame) / 160 + 0.15;
  if (n.crew) c -= 0.25;
  return clamp(c, 0, 0.75);
}

/* 매주: 해외 크루 효과 · 해외 크루 초대 · 해외 페스티벌 */
function expansionWeekly(summary) {
  const p = S.player, t = S.t;
  const gm = globalCrewMates();
  if (gm.length) { p.gLegacy += Math.min(0.12, 0.03 * gm.length); gm.forEach(n => n.rel = clamp(n.rel + 0.3, 0, 100)); }
  if (onHiatus()) return;
  const pending = type => S.inbox.some(m => m.type === type);
  // 해외 크루 초대
  if (!p.crew && p.globalFame >= 20 && R() < 0.03 && !pending('crew')) {
    const cand = S.crews.filter(c => c.region === 'GLOBAL').filter(c => avg(crewMembers(c.id).map(n => n.rel)) > 12 || p.globalFame > 35);
    if (cand.length) {
      const c = pick(cand);
      addInbox({ type: 'crew', title: `🌎 해외 크루 '${c.name}' 합류 제안`, text: `'${c.name}'(${c.vibe})에서 연락이 왔습니다. "We've been watching. Wanna roll with us?"\n멤버: ${crewMembers(c.id).map(n => n.name).join(', ')}\n합류하면 해외 인지도가 꾸준히 오르고, 멤버들과 협업하기 쉬워집니다.`, data: { crewId: c.id }, expires: t + 4 });
    }
  }
  // 해외 페스티벌
  const fests = GLOBAL_FESTS.filter(f => p.globalFame >= f.minG);
  if (fests.length && R() < 0.035 && !pending('gfest')) {
    const f = pick(fests);
    addInbox({ type: 'gfest', title: `🎡 ${f.name} 섭외`, text: `${f.name} 라인업에 초청받았습니다! 출연료 ${fmtMoney(f.pay)}. 해외 인지도가 크게 오릅니다. (행동력 2 소모)`, data: { name: f.name, pay: f.pay, gl: f.gl }, expires: t + 3 });
  }
}

function playGlobalFest(m) {
  const p = S.player, d = m.data;
  if (S.ap < 2) return { ok: false, msg: '행동력 2가 필요합니다.' };
  S.ap -= 2;
  const q = p.skills.stage * 0.6 + perfSkill(p.genre) * 0.4 + rnd(-10, 12);
  const gl = d.gl * (q > 60 ? 1.3 : q > 45 ? 1 : 0.6);
  p.money += d.pay; p.gLegacy += gl; p.buzz += 8;
  const yt = Math.round((20000 + p.globalFame * 3000) * (q / 55));
  p.followers.youtube += yt; p.followers.insta += Math.round(yt * 0.6);
  p.mental = clamp(p.mental - 8, 0, 100);
  addNews(`🎡 ${p.stage}, ${d.name} 무대 ${q > 60 ? '찢었다' : '마쳐'}`, 'good');
  addStory(`${d.name}. 수만 명의 외국인 관객이 한국어 가사를 따라 불렀다.`, 'tour');
  addMilestone('global_fest', `해외 페스티벌 출연 (${d.name})`);
  react('festival_global', 5, {}, { weights: { global: 5 } });
  S.inbox = S.inbox.filter(x => x.id !== m.id);
  save();
  return { ok: true, msg: `${d.name} 공연 완료! ${q > 60 ? '역대급 무대라는 평!' : '무난했다.'} 출연료 ${fmtMoney(d.pay)}, 유튜브 +${fmtNum(yt)}` };
}

/* ---------- 비트 판매 (다른 아티스트 곡 프로듀싱) ---------- */
function sellBeat(buyerId) {
  const p = S.player;
  if (p.skills.produce < 35) return { ok: false, msg: '프로듀싱 능력 35 이상이 필요합니다.' };
  if (onHiatus()) return { ok: false, msg: '지금은 할 수 없습니다.' };
  const pool = S.npcs.filter(n => n.role === 'artist' && n.debutYear <= yearOf(S.t) && !inWar(n.id) && (n.region === 'KR' || p.globalFame >= 20) && !((n.banUntil || 0) > S.t));
  const n = buyerId ? npc(buyerId) : weightedPick(pool, x => (1 + x.rel / 15) * (Math.abs(x.fame - p.fame) < 30 ? 2 : 0.5) * (x.genre === p.genre ? 2 : 1));
  if (!n) return { ok: false, msg: '살 사람이 없습니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  const price = Math.round((p.skills.produce ** 2 * 1500 + p.fame * p.fame * 600) * rnd(0.7, 1.3) * (n.region === 'GLOBAL' ? 3 : 1) / 10000) * 10000;
  p.money += price;
  p.skills.produce = clamp(p.skills.produce + 0.6 * (105 - p.skills.produce) / 100, 0, 100);
  n.rel = clamp(n.rel + 6, 0, 100);
  const rel = npcRelease(n, S.t + 1, { type: 'single', producer: 'player' });
  rel.critic = Math.round(clamp(rel.critic * 0.5 + (p.skills.produce * 0.8 + rnd(0, 20)) * 0.5, 20, 98));
  rel.trackCritic = rel.critic;
  S.beatCredits.push({ t: S.t, npcId: n.id, relId: rel.id, title: rel.trackTitle, price });
  addNews(`🎛️ ${n.name} 신곡 「${rel.trackTitle}」 (prod. ${p.stage})`, 'release');
  if (S.beatCredits.length === 1) addMilestone('first_beat', `첫 프로듀싱 크레딧 (${n.name})`);
  save();
  return { ok: true, msg: `${n.name}에게 비트를 팔았습니다! 「${rel.trackTitle}」 (prod. ${p.stage}) · ${fmtMoney(price)}` };
}

/* ---------- 합작 앨범 파트너 ---------- */
function collabPartners() {
  return S.npcs.filter(n => n.role === 'artist' && n.rel >= 60 && !inWar(n.id) && (n.region === 'KR' || S.player.globalFame >= 15) && n.debutYear <= yearOf(S.t));
}
function applyPartner(rel, tracks, partnerId) {
  const n = npc(partnerId); if (!n) return null;
  rel.partner = n.id;
  tracks.forEach(s => { if (!s.feats.includes(n.id) && s.feats.length < 2) s.feats.push(n.id); });
  n.rel = clamp(n.rel + 10, 0, 100);
  const nj = n.name + josa(n.name, '과');
  const line = rel.critic >= 70 ? `${nj}의 합작은 서로의 색을 지우지 않고 겹쳐 놓는 데 성공했다.` : `${nj}의 합작이지만, 두 사람이 한 앨범에 있어야 할 이유는 끝내 설득되지 않는다.`;
  rel.reviews.forEach(r => { r.text += ' ' + (r.outlet === 'pitchfork' ? `The collaboration with ${n.name} ${rel.critic >= 70 ? 'feels genuinely mutual.' : 'never quite justifies itself.'}` : line); });
  react('collab_album', 4, { npc: n.name });
  addNews(`🤝 ${S.player.stage} & ${n.name} 합작 『${rel.title}』 발매`, 'release');
  addMilestone('collab_album', `합작 앨범 (with ${n.name})`);
  return n;
}

/* ---------- 팬덤 ---------- */
function coreFans() { return Math.round(totalFollowers() * S.player.coreRatio / 100); }
function createFandom(name, color) {
  if (S.fandom) return { ok: false, msg: '이미 팬덤이 있습니다.' };
  if (coreFans() < 1000) return { ok: false, msg: '찐팬이 1,000명 이상이어야 팬덤을 만들 수 있습니다.' };
  name = (name || '').trim();
  if (!name) return { ok: false, msg: '팬덤 이름을 입력하세요.' };
  S.fandom = { name, color: color || '#a855f7', foundedT: S.t, parties: 0 };
  const p = S.player;
  p.coreRatio = clamp(p.coreRatio + 2, 3, 60); p.sentiment = clamp(p.sentiment + 4, 0, 100);
  react('fandom_born', 5, { fandom: name });
  addNews(`💜 ${p.stage} 공식 팬덤명 '${name}' 발표`, 'good');
  addStory(`팬들에게 이름이 생겼다. '${name}'. 이제 그들은 그냥 리스너가 아니다.`, 'story');
  save();
  return { ok: true, msg: `팬덤 '${name}' 탄생! 찐팬 비율과 여론이 올랐습니다.` };
}
function streamPartyCooldown() { return Math.max(0, (S.cooldowns.party || 0) - S.t); }
function streamParty(songId) {
  if (!S.fandom) return { ok: false, msg: '먼저 팬덤을 만드세요.' };
  if (streamPartyCooldown()) return { ok: false, msg: `팬들이 지쳐 있습니다. ${streamPartyCooldown()}주 후에 가능합니다.` };
  const s = song(songId);
  if (!s || !s.releaseId || s.free) return { ok: false, msg: '발매된 유료 음원을 선택하세요.' };
  const boost = Math.min(2, coreFans() / 150000 + 0.25);
  s.boost += boost;
  S.cooldowns.party = S.t + 6; S.fandom.parties++;
  S.player.antiRatio = clamp(S.player.antiRatio + 0.5, 0, 45);
  react('stream_party', 4, { fandom: S.fandom.name, title: s.title });
  addNews(`📢 ${S.fandom.name}, 「${s.title}」 스밍 총공 돌입`, 'info');
  save();
  return { ok: true, msg: `${S.fandom.name}${josa(S.fandom.name, '이')} 「${s.title}」 총공을 시작했습니다! 이번 주부터 스트리밍 +${Math.round(boost * 100)}%` };
}
