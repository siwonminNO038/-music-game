/* =========================================================
 *  확장 데이터: 장르·스타일·트렌드, 디스전, 범죄/사건
 *  (data.js, text.js 다음에 로드되어 기존 데이터를 확장한다)
 * ========================================================= */

/* ---------- 장르 확장 ---------- */
GENRES.push('발라드', '트로트', '재즈', '포크', '메탈', '레게');
Object.assign(GENRE_PERF, {
  '발라드': { vocal: 0.95, flow: 0.05 },
  '트로트': { vocal: 0.85, flow: 0.15 },
  '재즈': { vocal: 0.75, flow: 0.25 },
  '포크': { vocal: 0.85, flow: 0.15 },
  '메탈': { vocal: 0.8, flow: 0.2 },
  '레게': { vocal: 0.6, flow: 0.4 }
});

/* 장르별 스타일(서브장르): fx = 곡 능력치 보정 */
const STYLES = {
  '힙합': [
    { name: '붐뱁', fx: { lyric: 4, hook: -2 } }, { name: '트랩', fx: { hook: 4, lyric: -3 } }, { name: '드릴', fx: { perf: 3, originality: 2, hook: -1 } },
    { name: '멜로딕 랩', fx: { hook: 5, lyric: -2 } }, { name: '얼터너티브 힙합', fx: { originality: 6, hook: -3 } }, { name: '재즈 힙합', fx: { sound: 4, originality: 2, hook: -2 } },
    { name: '이모 랩', fx: { lyric: 2, hook: 2, perf: -1 } }, { name: '레이지', fx: { perf: 4, lyric: -4, hook: 2 } }, { name: '저지 클럽', fx: { hook: 5, originality: 1, lyric: -2 } },
    { name: '올드스쿨', fx: { lyric: 2, perf: 2, originality: -3 } }, { name: '컨셔스 랩', fx: { lyric: 6, hook: -4 } }
  ],
  'R&B': [
    { name: '컨템포러리 R&B', fx: { hook: 3 } }, { name: '네오소울', fx: { sound: 3, perf: 2, hook: -1 } }, { name: '얼터너티브 R&B', fx: { originality: 5, hook: -2 } },
    { name: 'PBR&B', fx: { sound: 4, originality: 2, lyric: -2 } }, { name: '시티팝', fx: { hook: 4, originality: -1 } }, { name: '펑크(Funk)', fx: { perf: 3, hook: 2 } }
  ],
  '팝': [
    { name: '댄스팝', fx: { hook: 5, lyric: -3 } }, { name: '신스팝', fx: { sound: 3, hook: 2 } }, { name: '하이퍼팝', fx: { originality: 7, hook: -2 } },
    { name: 'Y2K 팝', fx: { hook: 4, originality: -1 } }, { name: '틴팝', fx: { hook: 4, lyric: -2 } }
  ],
  '인디': [
    { name: '인디팝', fx: { hook: 3 } }, { name: '드림팝', fx: { sound: 4, originality: 2, hook: -2 } }, { name: '슈게이징', fx: { sound: 3, originality: 4, hook: -4 } },
    { name: '로파이', fx: { originality: 2, sound: -2, lyric: 2 } }, { name: '베드룸 팝', fx: { lyric: 3, sound: -1 } }
  ],
  '록': [
    { name: '모던록', fx: { hook: 2, lyric: 2 } }, { name: '펑크록', fx: { perf: 4, lyric: -1, sound: -1 } }, { name: '사이키델릭', fx: { originality: 6, hook: -3 } },
    { name: '포스트록', fx: { sound: 5, hook: -5, originality: 3 } }, { name: '개러지록', fx: { perf: 3, originality: 1 } }
  ],
  '일렉트로닉': [
    { name: '하우스', fx: { hook: 3, sound: 2 } }, { name: '테크노', fx: { sound: 4, lyric: -3 } }, { name: 'EDM', fx: { hook: 5, originality: -2 } },
    { name: 'UK 개러지', fx: { originality: 3, hook: 1 } }, { name: '앰비언트', fx: { sound: 4, originality: 3, hook: -6 } }, { name: '뽕짝 일렉트로닉', fx: { originality: 6, hook: 2, lyric: -2 } }
  ],
  '발라드': [
    { name: '정통 발라드', fx: { perf: 4, originality: -3 } }, { name: '어쿠스틱 발라드', fx: { lyric: 3, sound: -1 } }, { name: '파워 발라드', fx: { perf: 5, hook: 2, lyric: -2 } },
    { name: 'R&B 발라드', fx: { hook: 2, sound: 2 } }
  ],
  '트로트': [
    { name: '정통 트로트', fx: { perf: 4, originality: -4 } }, { name: '세미 트로트', fx: { hook: 5, lyric: -1 } }, { name: '뽕짝 댄스', fx: { hook: 6, lyric: -3 } },
    { name: '트로트 발라드', fx: { lyric: 3, perf: 2 } }
  ],
  '재즈': [
    { name: '스윙', fx: { perf: 3, hook: 2 } }, { name: '비밥', fx: { originality: 4, sound: 3, hook: -5 } }, { name: '보컬 재즈', fx: { perf: 4, lyric: 1 } },
    { name: '퓨전 재즈', fx: { originality: 4, sound: 2, hook: -1 } }, { name: '애시드 재즈', fx: { hook: 3, sound: 2 } }
  ],
  '포크': [
    { name: '모던 포크', fx: { lyric: 4, hook: -1 } }, { name: '포크록', fx: { perf: 2, hook: 2 } }, { name: '사이키 포크', fx: { originality: 5, hook: -3 } },
    { name: '어쿠스틱 포크', fx: { lyric: 3, sound: -2 } }
  ],
  '메탈': [
    { name: '헤비메탈', fx: { perf: 4, hook: -1 } }, { name: '스래시 메탈', fx: { perf: 5, hook: -4, sound: 1 } }, { name: '메탈코어', fx: { perf: 4, originality: 2, hook: -2 } },
    { name: '뉴메탈', fx: { hook: 3, originality: 1 } }, { name: '블랙메탈', fx: { originality: 6, hook: -7 } }
  ],
  '레게': [
    { name: '루츠 레게', fx: { lyric: 3, originality: -1 } }, { name: '댄스홀', fx: { hook: 5, lyric: -2 } }, { name: '덥', fx: { sound: 5, originality: 3, hook: -3 } },
    { name: '스카', fx: { perf: 3, hook: 3 } }
  ]
};
function styleOf(genre, name) { return (STYLES[genre] || []).find(s => s.name === name) || null; }

/* 장르별 곡 제목 단어장 */
Object.assign(TITLE_BANK, {
  '발라드': ['기억의 습작', '그대라는 계절', '안녕이란 말', '눈의 꽃', '마지막 인사', '가을 편지', '하루의 끝', '보고 싶다는 말', '너를 보내고', '첫눈처럼 너에게', '이 밤이 지나면', '그리움만 쌓이네', '잊혀진 계절', '사랑했지만', '너의 뒷모습', '흩어진 날들'],
  '트로트': ['인생은 짠짜라', '사랑의 배터리', '어머나 세상에', '내 나이가 어때서', '찐이야', '막걸리 한 잔', '고향역 블루스', '당신이 최고야', '무조건 사랑', '아모르 인생', '보릿고개 연가', '십오야 밝은 달', '뽕짝 인생', '님아 내 님아', '울긴 왜 울어'],
  '재즈': ['Blue Monday', 'Autumn in Seoul', 'Smoke & Mirrors', '새벽의 즉흥', 'Midnight Standard', 'Rainy Bebop', 'Coffee & Cigarettes', '을지로 스윙', 'Moonlight Serenade 2', 'Bluesette', 'Late Night Trio', '한남동 블루스'],
  '포크': ['통기타와 나', '시골 버스', '할머니의 밭', '강물처럼', '들꽃', '바람이 분다', '나무의 노래', '작은 방의 노래', '골목길 가로등', '우리 동네 이야기', '오래된 사진', '먼 길'],
  '메탈': ['Iron Will', '지옥문', '강철 심장', 'Blood Oath', '폭풍 전야', 'Chaos Reign', '사자후', 'Black Thunder', '철의 장막', 'Hellfire', '파멸의 노래', 'Wargod'],
  '레게': ['One Love Seoul', '제주 바이브', 'Island Breeze', '평화의 리듬', 'Rastaman Blues', '해변의 오후', 'Sun Is Shining Again', '느긋하게', 'Roots & Culture', '바나나 보트']
});

/* ---------- 새 장르 아티스트 (실제 씬 모티브 패러디) ---------- */
NPC_KR.push(
  { name: '성시겸', genre: '발라드', fame: 72, skill: 83, trait: '유쾌함', label: 'mystichistory', crew: null, bio: '발라드의 왕자, 감미로운 목소리' },
  { name: '박효심', genre: '발라드', fame: 74, skill: 91, trait: '신비주의', label: null, crew: null, bio: '압도적 가창력의 은둔형 보컬리스트' },
  { name: '폴킴스', genre: '발라드', fame: 62, skill: 78, trait: '감성적', label: null, crew: null, bio: '따뜻한 음색의 국민 축가 장인' },
  { name: '임영원', genre: '트로트', fame: 93, skill: 79, trait: '카리스마', label: 'gogimusic', crew: null, bio: '트로트 경연 우승 후 전 세대를 사로잡은 영웅' },
  { name: '송가윤', genre: '트로트', fame: 76, skill: 80, trait: '유쾌함', label: 'gogimusic', crew: null, bio: '정통 트로트의 계보를 잇는 국악 전공 가수' },
  { name: '영탁구', genre: '트로트', fame: 66, skill: 72, trait: '유쾌함', label: null, crew: null, bio: '흥 폭발 세미 트로트 히트메이커' },
  { name: '나윤수', genre: '재즈', fame: 40, skill: 93, trait: '장인', label: null, crew: null, bio: '유럽이 먼저 알아본 재즈 보컬리스트' },
  { name: '윈터플레이어', genre: '재즈', fame: 30, skill: 81, trait: '감성적', label: null, crew: null, bio: '세련된 팝 재즈 밴드' },
  { name: '김사월이', genre: '포크', fame: 28, skill: 86, trait: '신비주의', label: 'bungbung', crew: null, bio: '쓸쓸하고 아름다운 포크 싱어송라이터' },
  { name: '이랑랑', genre: '포크', fame: 26, skill: 87, trait: '독설가', label: null, crew: null, bio: '시상식 무대에서 트로피를 경매에 부친 포크 뮤지션' },
  { name: '크래시스', genre: '메탈', fame: 32, skill: 85, trait: '독설가', label: 'soesori', crew: null, bio: '한국 스래시 메탈의 살아있는 전설' },
  { name: '화이트홀', genre: '메탈', fame: 28, skill: 81, trait: '장인', label: 'soesori', crew: null, bio: '30년 넘게 달려온 헤비메탈 밴드' },
  { name: '스컬앤호호', genre: '레게', fame: 38, skill: 71, trait: '유쾌함', label: null, crew: null, bio: '레게를 대중에게 알린 유쾌한 듀오' }
);
LABELS.push(
  { id: 'gogimusic', name: '고기뮤직', tier: '중형', minFame: 15, promo: 1.5, share: 0.6, advance: 15000000, cred: -2, global: 0, quota: 2, weeks: 104, genres: ['트로트'], desc: '트로트 경연 스타들의 둥지. 행사와 방송 출연이 끊이지 않는다.' },
  { id: 'mystichistory', name: '미스틱 히스토리', tier: '중형', minFame: 25, promo: 1.5, share: 0.6, advance: 18000000, cred: 3, global: 0.02, quota: 1, weeks: 104, genres: ['발라드', '팝', '인디', '재즈'], desc: '발라드 명가. 오래 들을 수 있는 노래를 만든다.' },
  { id: 'soesori', name: '쇠소리 레코드', tier: '인디', minFame: 5, promo: 1.05, share: 0.8, advance: 1000000, cred: 7, global: 0, quota: 1, weeks: 104, genres: ['메탈', '록', '포크', '레게'], desc: '헤비니스 음악의 마지막 보루. 돈은 없고 의리는 있다.' }
);
BACKGROUNDS.push(
  { id: 'trot', name: '트로트 경연 출신', desc: '트로트 경연 프로그램 예선에서 화제가 됐다. 어르신 팬덤이 든든하지만 힙합 씬은 낯설다.', skills: { lyric: 16, flow: 12, vocal: 40, produce: 8, stage: 38 }, money: 5000000, followers: 15000, fame: 10, credibility: -6, genre: '트로트' },
  { id: 'jazzbar', name: '재즈 바 연주자', desc: '을지로 재즈 바에서 밤마다 연주하던 음악가. 평단이 좋아할 귀를 가졌다.', skills: { lyric: 22, flow: 14, vocal: 30, produce: 34, stage: 24 }, money: 3500000, followers: 900, fame: 3, credibility: 10, genre: '재즈' }
);
PROLOGUE.trot = '경연 무대의 조명이 꺼지고, 예선 탈락의 아쉬움 속에서도 영상은 수십만 회를 넘겼다. 어르신들은 "그 노래 잘하는 젊은이"라며 {stage}{을:stage} 알아본다. 이제 방송이 아니라 내 노래로 무대에 설 시간이다.';
PROLOGUE.jazzbar = '을지로 골목 지하의 재즈 바. 담배 연기와 위스키 향 사이에서 {stage}{은:stage} 매일 밤 남의 곡을 연주했다. 손님 하나가 말했다. "당신 곡은 없어요?" 그날 밤, 처음으로 자기 곡을 쓰기 시작했다.';

/* 시상식 부문 확장 */
(function () {
  const kma = AWARDS.find(a => a.id === 'kma');
  kma.cats.push(
    { name: '최우수 재즈&크로스오버 음반', type: 'album', genre: '재즈', wc: 0.92, wp: 0.08 },
    { name: '최우수 메탈&하드코어 음반', type: 'album', genre: '메탈', wc: 0.92, wp: 0.08 },
    { name: '최우수 포크 음반', type: 'album', genre: '포크', wc: 0.9, wp: 0.1 }
  );
  const sma = AWARDS.find(a => a.id === 'sma');
  sma.cats.push(
    { name: '베스트 발라드', type: 'track', genre: '발라드', wc: 0.2, wp: 0.8 },
    { name: '베스트 트로트', type: 'track', genre: '트로트', wc: 0.15, wp: 0.85 }
  );
  const izm = OUTLETS.find(o => o.id === 'izm');
  if (izm) izm.genres = null;
})();

/* ---------- 디스전 ---------- */
const DISS_LEVELS = {
  light: { name: '라이트', desc: '장난스러운 견제. 리스크 없음', score: 0, buzz: 1, sentiment: 0, sue: 0 },
  hard: { name: '하드', desc: '실명 저격과 날 선 공격', score: 5, buzz: 1.6, sentiment: -1, sue: 0.05 },
  taboo: { name: '금기', desc: '가족·과거·사생활까지 건드린다. 화제성 최강, 명예훼손 고소 위험', score: 10, buzz: 2.6, sentiment: -5, sue: 0.4 }
};
const DISS_TARGET_TYPES = {
  artist: '특정 아티스트', label: '레이블 전체', crew: '크루 전체', scene: '씬 전체 (컨트롤 비트)',
  critics: '평론가·웹진', tv: '방송·오디션 프로그램'
};
const DISS_TRACK_TITLES = ['참교육', '사형선고', '부고', 'Real Talk', '체급 차이', '팩트폭행', '거품', '가면무도회', '이름값', 'No Mercy', '조문', '답장', '판결문', '청구서', '장례식', 'Control 2', '사망신고', '마지막 경고', '해명 요구', '부검'];
const DISS_NPC_LINES = ['"{stage}{은:stage} 방송용 래퍼일 뿐"', '"네 가사는 남의 일기장"', '"차트 순위가 실력은 아니지"', '"내 이름 빼면 할 얘기도 없는 놈"', '"레이블 덕에 숨 쉬는 중"', '"{stage}, 너 고스트라이터 누구야?"', '"뉴스 보고 랩 배운 티 난다"', '"올해의 거품상 수상자 {stage}"'];
const DISS_TRUCE_LINES = ['"서로 할 말 다 했다. 이제 음악으로만 보자."', '"리스펙. 다음엔 같은 비트 위에서 만나자."', '"이걸로 끝. 서로 성장했으면 됐다."'];

/* ---------- 범죄 / 사건 ---------- */
// weekly: 매주 적발 확률, weeks: 적발 위험 기간, sev: 심각도(1~4), prison: 실형 시 주(min,max), ban: 시상식·방송 퇴출 주
const CRIMES = {
  drug: { name: '마약 투약', sev: 3, weekly: 0.035, weeks: 40, prison: [26, 78], ban: 104, fine: 30000000, sentiment: -18, labelDrop: 0.7 },
  dui: { name: '음주운전', sev: 2, weekly: 0, weeks: 0, prison: [16, 52], ban: 52, fine: 15000000, sentiment: -14, labelDrop: 0.45 },
  assault: { name: '폭행', sev: 2, weekly: 0, weeks: 0, prison: [12, 40], ban: 52, fine: 10000000, sentiment: -10, labelDrop: 0.35 },
  gambling: { name: '불법 도박', sev: 2, weekly: 0.03, weeks: 20, prison: [12, 26], ban: 52, fine: 20000000, sentiment: -10, labelDrop: 0.35 },
  tax: { name: '탈세', sev: 2, weekly: 0, weeks: 0, prison: [26, 52], ban: 52, fine: 0, sentiment: -12, labelDrop: 0.3 },
  sajaegi: { name: '음원 사재기', sev: 2, weekly: 0.05, weeks: 26, prison: [12, 26], ban: 52, fine: 30000000, sentiment: -20, labelDrop: 0.5 },
  copyright: { name: '저작권 침해(무단 샘플링)', sev: 1, weekly: 0, weeks: 0, prison: [0, 0], ban: 0, fine: 0, sentiment: -6, labelDrop: 0.05, civil: true },
  defamation: { name: '명예훼손', sev: 1, weekly: 0, weeks: 0, prison: [0, 0], ban: 0, fine: 5000000, sentiment: -3, labelDrop: 0.02, civil: true }
};
const VERDICTS = { cleared: '무혐의', fine: '벌금형', probation: '집행유예', prison: '실형' };

/* 범죄 관련 스토리 이벤트 */
STORY_EVENTS.push(
  {
    id: 'dui_temptation', once: false, w: 0.035, cond: (p, S) => p.age >= 21 && p.money > 1000000 && !p.prison,
    title: '🍻 회식 후 귀갓길', text: '레이블 회식이 끝났다. 새벽 두 시, 차는 주차장에 있고 대리운전은 40분 대기.',
    choices: [
      { id: 'taxi', label: '대리운전을 기다린다', fx: { mental: -1 }, res: '40분을 기다렸다. 지루했지만 아무 일도 없었다. 그게 가장 좋은 결말이다.' },
      { id: 'walk', label: '차를 두고 걸어간다', fx: { mental: 3, insp: ['도시의 밤', 5] }, res: '새벽 공기를 마시며 한 시간을 걸었다. 걷는 동안 가사 몇 줄이 떠올랐다.' },
      { id: 'drive', label: '"가까우니까 괜찮겠지" 직접 운전한다', fx: { crime: 'dui' }, res: '' }
    ]
  },
  {
    id: 'club_fight', once: false, w: 0.03, cond: (p, S) => p.fame >= 10 && !p.prison,
    title: '🥊 클럽에서의 시비', text: '클럽 VIP 룸 앞에서 취한 남자가 시비를 건다. "너 그 거품 래퍼 맞지?" 주변에서 휴대폰 카메라가 올라간다.',
    choices: [
      { id: 'ignore', label: '웃고 지나간다', fx: { mental: -3, cred: 0.5 }, res: '뒤에서 욕설이 들렸지만 돌아보지 않았다. 다음 날 "의외로 젠틀" 영상이 돌았다.' },
      { id: 'argue', label: '말로 받아친다', fx: { buzz: 4, sentiment: -1 }, res: '랩하듯 쏘아붙였다. 영상이 퍼지며 "프리스타일 참교육" 밈이 됐다.' },
      { id: 'punch', label: '주먹을 날린다', fx: { crime: 'assault', mental: 5 }, res: '' }
    ]
  },
  {
    id: 'drug_offer', once: false, w: 0.025, cond: (p, S) => p.fame >= 15 && !p.prison,
    title: '💊 위험한 파티 초대', text: '해외 프로듀서가 연 애프터파티. 테이블 위에 낯선 것들이 놓여 있다. "영감에 도움 될 거야."',
    choices: [
      { id: 'leave', label: '조용히 자리를 뜬다', fx: { mental: -2, cred: 0.5 }, res: '택시 안에서 숨을 내쉬었다. 몇 달 뒤 그 파티 참석자들이 줄줄이 입건됐다는 뉴스를 봤다.' },
      { id: 'report', label: '대충 둘러대고 나와 작업실로 간다', fx: { insp: ['우울/불안', 6] }, res: '그 밤의 불편한 공기를 가사로 옮겼다.' },
      { id: 'take', label: '"한 번쯤은…" 손을 뻗는다', fx: { crime: 'drug', mental: 15, insp: ['실험적', 10] }, res: '' }
    ]
  }
);

/* 범죄·디스전 팬 반응 */
Object.assign(REACTIONS, {
  crime_caught: {
    core: ['아니겠지… 공식 입장 기다릴게', '제발 오보였으면 좋겠다', '믿고 싶은데 너무 힘들다'],
    casual: ['헐 이 사람 그런 사람이었어?', '플리에서 지웠다'],
    hater: ['역시 힙합 하는 놈들은 ㅋㅋ', '영구 퇴출해라', '음원 사이트에서 내려라'],
    old: ['언더 시절엔 이런 사람 아니었는데…', '실망을 넘어 배신감'],
    critic: ['음악과 사람은 분리해야 하나, 고민되는 밤', '작품은 작품, 죄는 죄'],
    meme: ['[속보] {stage} 입건… 커뮤니티 서버 터짐', '{stage} 팬들 지금 표정.jpg'],
    global: ['what happened?? is this true?', 'not them getting arrested 😭']
  },
  crime_verdict: {
    core: ['죗값 치르고 돌아와… 기다릴게', '반성하는 모습 보여줘'],
    hater: ['형량 너무 가볍다', '복귀하면 불매한다'],
    critic: ['법의 판단은 끝났다. 대중의 판단은 이제 시작', '복귀작이 진짜 시험대'],
    meme: ['{stage} 판결 소식에 커뮤니티 갑론을박'],
    casual: ['그래도 노래는 좋았는데 아쉽다']
  },
  comeback_crime: {
    core: ['돌아와줘서 고마워. 이번엔 잘하자', '음악으로 보답해줘'],
    hater: ['범죄자 음악 안 들음', '복귀 너무 빠른 거 아님?', '자숙 기간 실화냐'],
    critic: ['이 앨범이 반성문인지 변명인지는 각자 판단할 몫', '사과의 진정성은 가사에서 드러난다'],
    old: ['그래도 음악은 진심이네'],
    meme: ['[복귀] {stage}, 논란 후 첫 신곡… 댓글창 전쟁터']
  },
  chart_fraud: {
    hater: ['사재기였네 ㅋㅋㅋ 차트 1위 반납해라', '이래서 차트 못 믿음'],
    core: ['소속사가 한 거겠지… 그렇지?', '진짜 실망이다'],
    critic: ['차트의 신뢰를 무너뜨린 대가는 크다'],
    meme: ['[단독] {stage} 스트리밍 공장 위치 공개.jpg']
  },
  diss_round: {
    core: ['{stage} 답디스 미쳤다 ㄷㄷ', '이건 KO다'],
    critic: ['이번 라운드는 {stage} 우세. 펀치라인 밀도가 다르다', '라임은 좋은데 팩트가 약하다'],
    meme: ['{npc} 지금 비트 찾는 중 ㅋㅋ', '디스전 직관 중 🍿🍿'],
    rival: ['{npc}가 다음 곡으로 끝낸다 ㅋㅋ'],
    hater: ['둘 다 관종이네']
  },
  diss_npc_round: {
    core: ['{npc} 디스 별거 없던데? {stage} 기다린다', '빨리 답장해줘!!'],
    critic: ['{npc}의 이번 벌스는 꽤 아프다', '{stage} 입장에선 반박하기 어려운 라인이 있다'],
    meme: ['[속보] {npc}, {stage}에게 답장 발송 📮', '{stage} 지금 가사 쓰는 중 ㅋㅋ'],
    rival: ['{npc}가 이겼다 ㅋㅋㅋ 끝']
  },
  diss_truce: {
    core: ['둘 다 멋있다 진짜', '이런 엔딩 좋다'],
    critic: ['건강한 디스전의 교과서적 결말'],
    meme: ['디스전 끝나고 합작곡 나오는 엔딩 기원'],
    hater: ['결국 짜고 친 거 아님?']
  },
  diss_scene: {
    core: ['씬 전체를 상대로? 미쳤다 ㄷㄷ', '{stage} 진짜 겁이 없네'],
    critic: ['컨트롤 비트 이후 이런 판은 처음', '이름 불린 래퍼들 답장 기대된다'],
    meme: ['오늘 힙합 커뮤니티 서버 터진 이유.jpg', '이름 안 불려서 서운한 래퍼들 단톡방'],
    hater: ['관심병 말기']
  },
  name_change: {
    core: ['새 이름도 좋아요!', '이름 바뀌어도 난 영원히 팬'],
    old: ['예전 이름이 더 좋았는데…'],
    meme: ['{stage} 개명 소식에 팬들 "적응 안 됨"'],
    hater: ['이름 바꾼다고 실력이 바뀌냐']
  },
  self_reflect: {
    core: ['충분히 쉬고 와요', '기다리는 것도 팬의 몫이죠'],
    hater: ['어차피 금방 나오겠지', '자숙 쇼 ㅋ'],
    critic: ['진짜 반성은 시간이 증명한다']
  }
});

/* 생성된(패러디가 아닌) 신인들에게만 일어나는 씬 사건 뉴스 */
const NPC_CRIME_NEWS = ['🚨 신인 {a}, 대마 혐의로 입건', '🚨 {a}, 음주운전 적발… 활동 중단', '🚨 {a}, 클럽 폭행 시비로 경찰 조사', '🚨 {a}, 불법 도박 의혹… 소속사 "사실 확인 중"', '🚨 {a}, 신곡 표절 의혹… 원작자 측 "법적 대응"'];

/* 스타일·트렌드에 대한 평론 문장 */
const RV_STYLE = {
  normal: ['{style}의 문법을 충실히 따르면서도 자기 색을 놓치지 않는다.', '{style} 사운드를 능숙하게 다룬다.', '{style}라는 틀 안에서 할 수 있는 것을 대부분 해낸다.'],
  hot: ['요즘 유행하는 {style}에 편승했다는 인상을 지우기 어렵다.', '{style} 열풍에 올라탄 작품. 시의성은 있지만 수명은 의문이다.'],
  cold: ['모두가 외면하는 {style}{을:style} 붙든 고집이 오히려 신선하다.', '한물갔다는 {style}에서 새로운 가능성을 길어 올렸다.'],
  comeback: ['논란 이후 첫 작품이라는 사실을 지우고 듣기는 어렵다.', '음악이 반성문이 될 수 있는지, 이 작품은 시험대에 올랐다.'],
  grudge: ['평단을 겨냥했던 {stage}의 가사를 떠올리면, 이 작품을 너그럽게 듣기는 어렵다.']
};
