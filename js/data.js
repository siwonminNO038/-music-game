/* =========================================================
 *  정적 게임 데이터 (모든 아티스트/레이블/크루/매체는 가상)
 * ========================================================= */

const GENRES = ['힙합', 'R&B', '팝', '인디', '록', '일렉트로닉'];

const THEMES = [
  '자전적 서사', '사랑/이별', '플렉스', '사회비판', '우울/불안',
  '파티', '디스', '실험적', '청춘', '가족', '도시의 밤', '성공담'
];

const SKILL_NAMES = {
  lyric: '작사', flow: '랩/플로우', vocal: '보컬', produce: '프로듀싱', stage: '퍼포먼스'
};

// 장르별로 어떤 스킬이 "퍼포먼스"를 결정하는지
const GENRE_PERF = {
  '힙합': { flow: 0.75, vocal: 0.25 },
  'R&B': { vocal: 0.8, flow: 0.2 },
  '팝': { vocal: 0.7, flow: 0.3 },
  '인디': { vocal: 0.8, flow: 0.2 },
  '록': { vocal: 0.85, flow: 0.15 },
  '일렉트로닉': { vocal: 0.4, flow: 0.6 }
};

const BACKGROUNDS = [
  {
    id: 'underground', name: '언더그라운드 래퍼',
    desc: '사이퍼와 클럽 공연으로 다져진 실력파. 돈은 없지만 평단과 고인물들이 주목한다.',
    skills: { lyric: 34, flow: 36, vocal: 12, produce: 15, stage: 25 },
    money: 3000000, followers: 800, fame: 4, credibility: 8, genre: '힙합'
  },
  {
    id: 'producer', name: '비트메이커 출신',
    desc: '방구석 비트메이커. 사운드는 자신 있지만 마이크 앞은 아직 어색하다.',
    skills: { lyric: 20, flow: 18, vocal: 15, produce: 42, stage: 10 },
    money: 4000000, followers: 500, fame: 3, credibility: 5, genre: '힙합'
  },
  {
    id: 'audition', name: '오디션 프로그램 출신',
    desc: '방송으로 얼굴은 알렸지만 "방송 래퍼"라는 꼬리표가 붙어 있다.',
    skills: { lyric: 18, flow: 28, vocal: 22, produce: 10, stage: 35 },
    money: 6000000, followers: 25000, fame: 14, credibility: -10, genre: '힙합'
  },
  {
    id: 'singer', name: '홍대 싱어송라이터',
    desc: '작은 공연장에서 노래하던 감성 보컬. 인디/R&B 씬에 잘 어울린다.',
    skills: { lyric: 30, flow: 10, vocal: 38, produce: 22, stage: 22 },
    money: 2500000, followers: 1200, fame: 4, credibility: 6, genre: 'R&B'
  },
  {
    id: 'rich', name: '금수저',
    desc: '실력은 평범하지만 장비와 돈은 넉넉하다. "돈으로 음악한다"는 소리를 들을지도.',
    skills: { lyric: 18, flow: 18, vocal: 18, produce: 20, stage: 15 },
    money: 50000000, followers: 2000, fame: 3, credibility: -4, genre: '팝'
  }
];

/* ---------- 국내 아티스트 (실제 씬을 모티브로 한 패러디 캐릭터) ---------- */
// fame: 0~100, skill: 평균 음악 퀄리티 성향
const NPC_KR = [
  // 힙합
  { name: '빈치노', genre: '힙합', fame: 80, skill: 87, trait: '장인', label: 'billionaire', crew: null, bio: '세련된 라임과 미술적 감각의 아이콘' },
  { name: '이쎈스', genre: '힙합', fame: 60, skill: 91, trait: '독설가', label: 'bnc', crew: 'soul', bio: '씬이 인정하는 가사의 신. 말 한마디가 칼이다' },
  { name: '지코어', genre: '힙합', fame: 88, skill: 75, trait: '카리스마', label: 'kozy', crew: null, bio: '아이돌과 힙합의 경계를 허문 히트메이커' },
  { name: '사이먼 도밍고', genre: '힙합', fame: 70, skill: 77, trait: '유쾌함', label: 'aomz', crew: null, bio: '예능과 음악을 오가는 씬의 맏형' },
  { name: '제이파크', genre: '힙합', fame: 84, skill: 72, trait: '카리스마', label: 'aomz', crew: null, bio: '레이블 사장님 겸 글로벌 엔터테이너' },
  { name: '비와이즈', genre: '힙합', fame: 60, skill: 83, trait: '장인', label: 'jamaisvu', crew: null, bio: '신념과 테크닉으로 무장한 서바이벌 우승자' },
  { name: '창모아', genre: '힙합', fame: 72, skill: 79, trait: '허세', label: 'ambitious', crew: null, bio: '피아노 치는 트랩 장인. 메테오처럼 떨어진 히트곡' },
  { name: '더 콰이어트', genre: '힙합', fame: 64, skill: 80, trait: '허세', label: 'billionaire', crew: null, bio: '플렉스 문화를 정착시킨 베테랑' },
  { name: '도끼날', genre: '힙합', fame: 55, skill: 72, trait: '허세', label: null, crew: null, bio: '천재 소년에서 플렉스의 상징이 된 래퍼' },
  { name: '키드밀크', genre: '힙합', fame: 58, skill: 77, trait: '신비주의', label: 'indigo', crew: 'yngbroke', bio: '예측 불가능한 플로우의 트렌드세터' },
  { name: '저스디스코', genre: '힙합', fame: 54, skill: 89, trait: '독설가', label: 'indigo', crew: 'soul', bio: '날 선 가사로 씬을 찌르는 리리시스트' },
  { name: '스윙스타', genre: '힙합', fame: 61, skill: 75, trait: '독설가', label: 'justmusical', crew: null, bio: '디스전의 대명사이자 레이블 제국의 사장' },
  { name: '기리보이즈', genre: '힙합', fame: 59, skill: 78, trait: '감성적', label: 'justmusical', crew: null, bio: '다작왕 감성 래퍼 겸 프로듀서' },
  { name: '우원제', genre: '힙합', fame: 52, skill: 81, trait: '신비주의', label: 'aomz', crew: null, bio: '어둠을 노래하는 무표정한 래퍼' },
  { name: '나플라이', genre: '힙합', fame: 50, skill: 83, trait: '장인', label: 'mkitsnow', crew: null, bio: '느긋한 톤과 압도적 그루브의 소유자' },
  { name: '미란다', genre: '힙합', fame: 44, skill: 74, trait: '유쾌함', label: null, crew: 'yngbroke', bio: '거침없는 에너지의 여성 래퍼' },
  { name: '이영디', genre: '힙합', fame: 66, skill: 71, trait: '유쾌함', label: null, crew: null, bio: '고등학생 래퍼 출신 예능 대세' },
  { name: '쿠키몬', genre: '힙합', fame: 48, skill: 72, trait: '유쾌함', label: null, crew: 'yngbroke', bio: '시원한 발성의 파티 래퍼' },
  { name: '넉살좋은', genre: '힙합', fame: 50, skill: 85, trait: '독설가', label: null, crew: 'vnc', bio: '라임 설계의 달인, 생활밀착형 가사' },
  { name: '딥플로어', genre: '힙합', fame: 38, skill: 81, trait: '카리스마', label: null, crew: 'vnc', bio: '언더그라운드의 대부. 붐뱁 수호자' },
  { name: '김새벽', genre: '힙합', fame: 30, skill: 88, trait: '신비주의', label: null, crew: 'dps', bio: '평단이 사랑하는 실험주의자' },
  { name: '식케이크', genre: '힙합', fame: 64, skill: 70, trait: '허세', label: 'lower', crew: null, bio: '중독적인 훅의 트랩 스타' },
  { name: '오르내리기', genre: '힙합', fame: 40, skill: 79, trait: '신비주의', label: null, crew: 'dps', bio: '몽환적인 사운드의 이모 래퍼' },
  { name: '릴보이즈', genre: '힙합', fame: 55, skill: 74, trait: '감성적', label: null, crew: 'yngbroke', bio: '랩 서바이벌 우승 출신 감성 래퍼' },
  // R&B
  { name: '딘트', genre: 'R&B', fame: 70, skill: 88, trait: '신비주의', label: null, crew: 'igloo', bio: '한국 얼터너티브 R&B의 상징. 컴백만 기다리는 팬들' },
  { name: '크러시드', genre: 'R&B', fame: 76, skill: 81, trait: '감성적', label: 'qnation', crew: null, bio: '음색 하나로 차트를 씹어먹는 보컬리스트' },
  { name: '자이언트티', genre: 'R&B', fame: 68, skill: 83, trait: '유쾌함', label: 'white', crew: null, bio: '독특한 음색의 소울 장인' },
  { name: '백예림', genre: 'R&B', fame: 64, skill: 87, trait: '감성적', label: 'redvinyl', crew: null, bio: '천재 싱어송라이터, 영어 가사의 마술사' },
  { name: '조지아', genre: 'R&B', fame: 46, skill: 78, trait: '감성적', label: null, crew: 'igloo', bio: '빈티지한 질감의 소울 보이스' },
  { name: '헤이지', genre: 'R&B', fame: 66, skill: 75, trait: '감성적', label: null, crew: null, bio: '비 오는 날의 음원 강자' },
  { name: '수라', genre: 'R&B', fame: 42, skill: 73, trait: '카리스마', label: null, crew: null, bio: '몽환적인 R&B 디바' },
  // 팝
  { name: 'BTY', genre: '팝', fame: 99, skill: 72, trait: '카리스마', label: 'hybrid', crew: null, bio: '전 세계를 접수한 7인조 보이그룹' },
  { name: '블랙민트', genre: '팝', fame: 96, skill: 67, trait: '카리스마', label: 'yj', crew: null, bio: '걸크러시의 정점, 글로벌 걸그룹' },
  { name: '아이요', genre: '팝', fame: 94, skill: 81, trait: '감성적', label: 'idam', crew: null, bio: '국민 여동생에서 국민 아티스트로' },
  { name: '뉴비즈', genre: '팝', fame: 90, skill: 69, trait: '유쾌함', label: 'hybrid', crew: null, bio: 'Y2K 감성의 신드롬 걸그룹' },
  { name: '빅크런치', genre: '팝', fame: 80, skill: 71, trait: '카리스마', label: 'yj', crew: null, bio: '2세대 아이돌의 전설' },
  // 인디 / 록
  { name: '혁우', genre: '인디', fame: 64, skill: 87, trait: '신비주의', label: 'magicblue', crew: null, bio: '청춘의 불안을 노래하는 밴드' },
  { name: '검정바지', genre: '인디', fame: 56, skill: 85, trait: '신비주의', label: 'bungbung', crew: null, bio: '한국 인디의 낭만주의자' },
  { name: '잔원숭이', genre: '록', fame: 70, skill: 77, trait: '유쾌함', label: null, crew: null, bio: '복고 감성 록밴드, 페스티벌의 왕' },
  { name: '실리콘겔', genre: '록', fame: 54, skill: 89, trait: '장인', label: 'magicblue', crew: null, bio: '평단이 극찬하는 사이키델릭 밴드' },
  { name: '새청년', genre: '록', fame: 50, skill: 85, trait: '카리스마', label: 'magicblue', crew: null, bio: '기타 한 대로 무대를 장악하는 밴드' },
  { name: '장기판과 얼굴들', genre: '록', fame: 52, skill: 80, trait: '유쾌함', label: 'bungbung', crew: null, bio: '능청스러운 가사의 국민 인디밴드' },
  // 일렉트로닉
  { name: '350', genre: '일렉트로닉', fame: 46, skill: 89, trait: '장인', label: 'banana', crew: null, bio: '뽕짝을 전자음악으로 재해석한 프로듀서' },
  { name: '디제이 콜라', genre: '일렉트로닉', fame: 52, skill: 63, trait: '유쾌함', label: null, crew: null, bio: '페스티벌을 뒤흔드는 인기 DJ' },
  // 프로듀서
  { name: '코드쿤스틱', genre: '힙합', fame: 50, skill: 86, trait: '장인', label: 'aomz', crew: null, role: 'producer', bio: '서정적인 붐뱁 비트의 장인' },
  { name: '그레이스케일', genre: 'R&B', fame: 52, skill: 86, trait: '감성적', label: 'aomz', crew: null, role: 'producer', bio: '세련된 R&B 사운드 메이커' },
  { name: '그루비홈', genre: '힙합', fame: 50, skill: 84, trait: '유쾌함', label: 'lower', crew: null, role: 'producer', bio: '트렌디한 히트곡 제조 듀오' },
  { name: '세컨더리', genre: '팝', fame: 46, skill: 84, trait: '유쾌함', label: null, crew: null, role: 'producer', bio: '레트로 팝의 귀재' },
  { name: '피캣', genre: '팝', fame: 45, skill: 83, trait: '장인', label: 'hybrid', crew: null, role: 'producer', bio: '글로벌 보이그룹의 메인 프로듀서' },
  { name: '토일렛페이퍼', genre: '인디', fame: 26, skill: 80, trait: '신비주의', label: null, crew: 'dps', role: 'producer', bio: '로파이 감성 비트메이커' }
];

/* ---------- 해외 아티스트 (패러디) ---------- */
const NPC_GLOBAL = [
  { name: 'Kendall Lamarr', genre: '힙합', fame: 95, skill: 93, trait: '장인', bio: '퓰리처급 가사의 컴튼 출신 리리시스트' },
  { name: 'Drakon', genre: '힙합', fame: 97, skill: 70, trait: '허세', bio: '차트를 지배하는 토론토의 6God' },
  { name: 'Travis Scotch', genre: '힙합', fame: 90, skill: 73, trait: '허세', bio: '오토튠과 레이지의 테마파크' },
  { name: 'Kanye East', genre: '힙합', fame: 86, skill: 84, trait: '독설가', bio: '천재와 논란 사이를 오가는 프로듀서-래퍼' },
  { name: 'Tyler, the Inventor', genre: '힙합', fame: 86, skill: 87, trait: '유쾌함', bio: '컬러풀한 상상력의 작가주의 래퍼' },
  { name: 'J. Coal', genre: '힙합', fame: 87, skill: 82, trait: '장인', bio: '노 피처링 플래티넘의 사나이' },
  { name: 'Taylor Quick', genre: '팝', fame: 99, skill: 79, trait: '카리스마', bio: '시대를 기록하는 팝의 여왕' },
  { name: 'The Weekday', genre: 'R&B', fame: 95, skill: 81, trait: '신비주의', bio: '80년대 신스와 어둠의 R&B' },
  { name: 'SZE', genre: 'R&B', fame: 88, skill: 85, trait: '감성적', bio: '솔직한 가사의 얼터너티브 R&B 퀸' },
  { name: 'Frank Lake', genre: 'R&B', fame: 80, skill: 93, trait: '신비주의', bio: '몇 년에 한 번 나타나는 전설의 은둔자' },
  { name: 'Lily Eilish', genre: '팝', fame: 92, skill: 85, trait: '감성적', bio: '속삭이는 보컬의 Z세대 아이콘' },
  { name: 'Doja Dog', genre: '팝', fame: 88, skill: 74, trait: '유쾌함', bio: '밈과 랩을 자유자재로 다루는 팝스타' },
  { name: 'Bad Rabbit', genre: '팝', fame: 93, skill: 73, trait: '카리스마', bio: '라틴 음악의 글로벌 제왕' },
  { name: 'Olivia Rodrigues', genre: '록', fame: 89, skill: 77, trait: '감성적', bio: '팝펑크로 돌아온 하이틴 스타' },
  { name: 'Tame Impalo', genre: '인디', fame: 75, skill: 87, trait: '장인', bio: '1인 사이키델릭 밴드' },
  { name: 'Daft Funk', genre: '일렉트로닉', fame: 78, skill: 89, trait: '신비주의', bio: '헬멧을 쓴 프렌치 하우스 듀오' },
  { name: 'Pre Malone', genre: '팝', fame: 85, skill: 69, trait: '유쾌함', bio: '장르를 가리지 않는 문신투성이 히트메이커' }
];

/* ---------- 레이블 (실제 레이블 모티브) ---------- */
const LABELS = [
  { id: 'bungbung', name: '붕붕레코드', tier: '인디', minFame: 5, promo: 1.1, share: 0.78, advance: 1500000, cred: 6, global: 0, quota: 1, weeks: 104, genres: ['인디', '록'], desc: '"싼 마이너스" 정신의 인디 레이블. 돈은 없어도 자유는 있다.' },
  { id: 'magicblue', name: '매직블루베리', tier: '인디', minFame: 8, promo: 1.15, share: 0.75, advance: 2500000, cred: 6, global: 0, quota: 1, weeks: 104, genres: ['인디', '록', 'R&B'], desc: '감성 인디 음악의 산실. 밴드들의 꿈의 레이블.' },
  { id: 'banana', name: 'BANANA', tier: '인디', minFame: 10, promo: 1.15, share: 0.75, advance: 3000000, cred: 7, global: 0.02, quota: 1, weeks: 104, genres: ['일렉트로닉', '인디', '힙합'], desc: '실험적인 전자음악과 아트팝의 집합소.' },
  { id: 'indigo', name: '인디고블루 뮤직', tier: '인디', minFame: 12, promo: 1.2, share: 0.72, advance: 5000000, cred: 6, global: 0, quota: 1, weeks: 104, genres: ['힙합'], desc: '실력파 래퍼들이 모인 독립 레이블. 평단의 신뢰가 두텁다.' },
  { id: 'bnc', name: 'BNC 레코즈', tier: '인디', minFame: 12, promo: 1.15, share: 0.75, advance: 4000000, cred: 8, global: 0, quota: 1, weeks: 104, genres: ['힙합'], desc: '래퍼가 직접 세운 아티스트 중심 레이블. 진정성의 상징.' },
  { id: 'jamaisvu', name: '자메뷰 그룹', tier: '인디', minFame: 12, promo: 1.2, share: 0.72, advance: 4000000, cred: 4, global: 0, quota: 1, weeks: 104, genres: ['힙합'], desc: '신념 있는 음악을 추구하는 크리에이티브 그룹.' },
  { id: 'justmusical', name: '저스트뮤지컬', tier: '중형', minFame: 18, promo: 1.35, share: 0.65, advance: 9000000, cred: 2, global: 0, quota: 2, weeks: 104, genres: ['힙합'], desc: '다작과 크루 문화로 유명한 힙합 레이블. 발매 의무가 빡빡하다.' },
  { id: 'mkitsnow', name: 'MKIT SNOW', tier: '중형', minFame: 22, promo: 1.4, share: 0.62, advance: 12000000, cred: 3, global: 0.02, quota: 1, weeks: 104, genres: ['힙합', 'R&B'], desc: '감각적인 비주얼과 음악의 힙합 레이블.' },
  { id: 'ambitious', name: '앰비셔스 뮤직', tier: '중형', minFame: 25, promo: 1.45, share: 0.6, advance: 15000000, cred: 2, global: 0.02, quota: 1, weeks: 104, genres: ['힙합', 'R&B'], desc: '트렌디한 트랩 사운드의 메카.' },
  { id: 'redvinyl', name: '레드바이닐', tier: '중형', minFame: 22, promo: 1.4, share: 0.62, advance: 12000000, cred: 4, global: 0.02, quota: 1, weeks: 104, genres: ['R&B', '인디', '팝'], desc: '싱어송라이터를 존중하는 감성 레이블.' },
  { id: 'lower', name: 'L0WER MUSIC', tier: '중형', minFame: 28, promo: 1.55, share: 0.58, advance: 20000000, cred: 1, global: 0.08, quota: 1, weeks: 104, genres: ['힙합', 'R&B'], desc: '해외 진출을 노리는 글로벌 지향 힙합 레이블.' },
  { id: 'billionaire', name: '빌리어네어 레코즈', tier: '메이저', minFame: 35, promo: 1.7, share: 0.55, advance: 40000000, cred: 1, global: 0.03, quota: 1, weeks: 156, genres: ['힙합'], desc: '"돈과 실력" — 플렉스 문화를 연 전설의 레이블.' },
  { id: 'aomz', name: 'AOMZ', tier: '메이저', minFame: 38, promo: 1.9, share: 0.5, advance: 60000000, cred: -2, global: 0.06, quota: 2, weeks: 156, genres: ['힙합', 'R&B'], desc: '힙합/R&B 최대 레이블. 막강한 홍보력과 스타 군단.' },
  { id: 'white', name: '더 화이트 레이블', tier: '메이저', minFame: 40, promo: 1.9, share: 0.5, advance: 50000000, cred: 0, global: 0.06, quota: 1, weeks: 156, genres: ['R&B', '팝', '힙합'], desc: '세련된 프로듀싱의 프리미엄 레이블.' },
  { id: 'qnation', name: 'Q NATION', tier: '대형기획사', minFame: 48, promo: 2.3, share: 0.45, advance: 100000000, cred: -5, global: 0.08, quota: 2, weeks: 156, genres: ['팝', 'R&B', '힙합'], desc: '월드스타 출신 대표의 대형 기획사.' },
  { id: 'kozy', name: 'KOZY 엔터', tier: '대형기획사', minFame: 50, promo: 2.4, share: 0.45, advance: 120000000, cred: -4, global: 0.1, quota: 2, weeks: 156, genres: ['힙합', '팝'], desc: '히트메이커 래퍼가 세운 대형 기획사.' },
  { id: 'yj', name: 'YJ 엔터', tier: '대형기획사', minFame: 55, promo: 2.6, share: 0.4, advance: 150000000, cred: -8, global: 0.12, quota: 2, weeks: 156, genres: ['팝', '힙합'], desc: '힙합 DNA의 3대 기획사. 홍보는 최강, 평단 신뢰도는 최하.' },
  { id: 'hybrid', name: '하이브리드 엔터', tier: '대형기획사', minFame: 60, promo: 2.8, share: 0.4, advance: 200000000, cred: -8, global: 0.15, quota: 2, weeks: 156, genres: ['팝', 'R&B', '힙합'], desc: '전 세계를 정복한 보이그룹의 기획사.' },
  { id: 'idam', name: '이담 엔터', tier: '중형', minFame: 45, promo: 1.8, share: 0.55, advance: 40000000, cred: 2, global: 0.04, quota: 1, weeks: 156, genres: ['팝', '인디', 'R&B'], desc: '솔로 아티스트 한 명을 위해 모든 걸 거는 소속사.' },
  { id: 'interscoop', name: 'Interscoop Records (US)', tier: '글로벌', minFame: 62, minGlobal: 15, promo: 1.8, share: 0.5, advance: 400000000, cred: 0, global: 0.35, quota: 1, weeks: 156, genres: ['힙합', 'R&B', '팝', '인디', '록', '일렉트로닉'], desc: '미국 메이저. 빌보드와 그래미로 가는 지름길.' },
  { id: 'colombo', name: 'Colombo Records (US)', tier: '글로벌', minFame: 65, minGlobal: 20, promo: 1.9, share: 0.5, advance: 500000000, cred: 1, global: 0.4, quota: 1, weeks: 156, genres: ['팝', 'R&B', '록', '힙합'], desc: '100년 역사의 미국 레이블. 월드 투어 지원.' }
];

/* ---------- 크루 (실제 크루 모티브) ---------- */
const CREWS = [
  { id: 'vnc', name: 'VNC (비스마이너 컴퍼니)', vibe: '정통 붐뱁, 생활 밀착형 가사', cred: 5 },
  { id: 'soul', name: '소울컴퍼니 리턴즈', vibe: '2000년대 언더 정신의 계승자들', cred: 6 },
  { id: 'yngbroke', name: 'YNG & BROKE', vibe: '트랩, 패션, 젊음, 그리고 텅 빈 통장', cred: -1 },
  { id: 'dps', name: 'DPS (드림 퍼펙트 시즌)', vibe: '영상과 음악을 함께 만드는 크리에이티브 크루', cred: 3 },
  { id: 'igloo', name: '클럽 이글루', vibe: '감성 R&B와 얼터너티브의 교차점', cred: 4 }
];

/* ---------- 평론 매체 ---------- */
const OUTLETS = [
  {
    id: 'rhythmer', voice: 'formal', name: '리드머', scale: 'star5', genres: ['힙합', 'R&B'],
    w: { lyric: 0.34, sound: 0.2, hook: 0.06, originality: 0.2, perf: 0.2 }, coh: 0.3,
    bias: -6, credWeight: 0.6, minFame: 0,
    desc: '국내 힙합/R&B 전문 웹진. 짜게 주기로 유명하다.'
  },
  {
    id: 'izm', voice: 'formal', name: 'IZM', scale: 'star5', genres: null,
    w: { lyric: 0.2, sound: 0.3, hook: 0.1, originality: 0.3, perf: 0.1 }, coh: 0.25,
    bias: -4, credWeight: 0.3, minFame: 6,
    desc: '전 장르를 다루는 음악 웹진. 독창성을 중시한다.'
  },
  {
    id: 'wave', voice: 'casual', name: '웨이브매거진', scale: 'ten', genres: null,
    w: { lyric: 0.12, sound: 0.28, hook: 0.35, originality: 0.1, perf: 0.15 }, coh: 0.15,
    bias: 4, credWeight: 0.1, minFame: 0,
    desc: '트렌디한 대중음악 매거진. 대중성에 후한 편.'
  },
  {
    id: 'pitchfork', voice: 'en', name: 'Pitchfork', scale: 'pf', genres: null,
    w: { lyric: 0.18, sound: 0.3, hook: 0.07, originality: 0.35, perf: 0.1 }, coh: 0.35,
    bias: -8, credWeight: 0.2, minFame: 0, minGlobal: 18,
    desc: '미국의 영향력 있는 음악 웹진. 8.0 이상은 대단한 영예.'
  }
];

/* ---------- 시상식 ---------- */
// type: album / track / artist / rookie / collab / producer
// wc: 평단 가중치, wp: 대중성 가중치
const AWARDS = [
  {
    id: 'rhythmer', name: '리드머 어워즈', icon: '🎧', nomWeek: 1, week: 3, region: 'KR',
    genres: ['힙합', 'R&B'], outlet: 'rhythmer', prestige: 6,
    desc: '힙합/R&B 웹진 리드머가 선정하는 평단 중심 시상식',
    cats: [
      { name: '올해의 랩 앨범', type: 'album', genre: '힙합', wc: 0.9, wp: 0.1 },
      { name: '올해의 R&B 앨범', type: 'album', genre: 'R&B', wc: 0.9, wp: 0.1 },
      { name: '올해의 랩 트랙', type: 'track', genre: '힙합', wc: 0.8, wp: 0.2 },
      { name: '올해의 R&B 트랙', type: 'track', genre: 'R&B', wc: 0.8, wp: 0.2 },
      { name: '올해의 아티스트', type: 'artist', wc: 0.8, wp: 0.2 },
      { name: '올해의 신인', type: 'rookie', wc: 0.8, wp: 0.2 }
    ]
  },
  {
    id: 'grammy', name: '그래미 어워즈', icon: '🏆', nomWeek: 2, week: 6, region: 'GLOBAL',
    genres: null, prestige: 30, minGlobal: 20,
    desc: '전 세계 음악인의 꿈. 해외 인지도가 있어야 후보에 오를 수 있다.',
    cats: [
      { name: 'Album of the Year', type: 'album', wc: 0.6, wp: 0.4, major: true },
      { name: 'Record of the Year', type: 'track', wc: 0.5, wp: 0.5, major: true },
      { name: 'Best New Artist', type: 'rookie', wc: 0.5, wp: 0.5, major: true },
      { name: 'Best Rap Album', type: 'album', genre: '힙합', wc: 0.6, wp: 0.4 },
      { name: 'Best Rap Song', type: 'track', genre: '힙합', wc: 0.6, wp: 0.4 },
      { name: 'Best Melodic Rap Performance', type: 'collab', wc: 0.5, wp: 0.5 },
      { name: 'Best Progressive R&B Album', type: 'album', genre: 'R&B', wc: 0.65, wp: 0.35 },
      { name: 'Best Pop Vocal Album', type: 'album', genre: '팝', wc: 0.5, wp: 0.5 },
      { name: 'Best Alternative Music Album', type: 'album', genre: '인디', wc: 0.7, wp: 0.3 },
      { name: 'Best Dance/Electronic Album', type: 'album', genre: '일렉트로닉', wc: 0.6, wp: 0.4 }
    ]
  },
  {
    id: 'kha', name: '한국힙합어워즈', icon: '🎤', nomWeek: 4, week: 7, region: 'KR',
    genres: ['힙합', 'R&B'], outlet: 'rhythmer', prestige: 7,
    desc: '힙합 씬의 한 해를 결산하는 시상식. 평단과 대중성을 함께 본다.',
    cats: [
      { name: '올해의 아티스트', type: 'artist', wc: 0.55, wp: 0.45 },
      { name: '올해의 힙합 앨범', type: 'album', genre: '힙합', wc: 0.65, wp: 0.35 },
      { name: '올해의 힙합 트랙', type: 'track', genre: '힙합', wc: 0.55, wp: 0.45 },
      { name: '올해의 R&B 앨범', type: 'album', genre: 'R&B', wc: 0.65, wp: 0.35 },
      { name: '올해의 R&B 트랙', type: 'track', genre: 'R&B', wc: 0.55, wp: 0.45 },
      { name: '올해의 신인', type: 'rookie', wc: 0.6, wp: 0.4 },
      { name: '올해의 콜라보레이션', type: 'collab', wc: 0.5, wp: 0.5 },
      { name: '올해의 프로듀서', type: 'producer', wc: 0.7, wp: 0.3 }
    ]
  },
  {
    id: 'kma', name: '한국대중음악상', icon: '🏅', nomWeek: 8, week: 10, region: 'KR',
    genres: null, outlet: 'izm', prestige: 9,
    desc: '선정위원회가 뽑는 국내 대표 평단 시상식. 일명 "한대음".',
    cats: [
      { name: '올해의 음반', type: 'album', wc: 0.92, wp: 0.08, major: true },
      { name: '올해의 노래', type: 'track', wc: 0.8, wp: 0.2, major: true },
      { name: '올해의 음악인', type: 'artist', wc: 0.85, wp: 0.15, major: true },
      { name: '올해의 신인', type: 'rookie', wc: 0.85, wp: 0.15 },
      { name: '최우수 랩&힙합 음반', type: 'album', genre: '힙합', wc: 0.9, wp: 0.1 },
      { name: '최우수 랩&힙합 노래', type: 'track', genre: '힙합', wc: 0.85, wp: 0.15 },
      { name: '최우수 R&B&소울 음반', type: 'album', genre: 'R&B', wc: 0.9, wp: 0.1 },
      { name: '최우수 모던록 음반', type: 'album', genre: '록', wc: 0.9, wp: 0.1 },
      { name: '최우수 팝 음반', type: 'album', genre: '팝', wc: 0.85, wp: 0.15 },
      { name: '최우수 일렉트로닉 음반', type: 'album', genre: '일렉트로닉', wc: 0.9, wp: 0.1 },
      { name: '최우수 포크/인디 음반', type: 'album', genre: '인디', wc: 0.9, wp: 0.1 }
    ]
  },
  {
    id: 'sma', name: '서울 스트리밍 어워즈', icon: '💿', nomWeek: 47, week: 50, region: 'KR',
    genres: null, prestige: 5, currentYear: true,
    desc: '음원 성적 중심의 연말 대중 시상식.',
    cats: [
      { name: '대상 - 올해의 아티스트', type: 'artist', wc: 0.15, wp: 0.85, major: true },
      { name: '대상 - 올해의 노래', type: 'track', wc: 0.1, wp: 0.9, major: true },
      { name: '올해의 앨범', type: 'album', wc: 0.25, wp: 0.75 },
      { name: '신인상', type: 'rookie', wc: 0.2, wp: 0.8 },
      { name: '베스트 힙합', type: 'track', genre: '힙합', wc: 0.2, wp: 0.8 },
      { name: '베스트 R&B', type: 'track', genre: 'R&B', wc: 0.2, wp: 0.8 },
      { name: '베스트 콜라보', type: 'collab', wc: 0.15, wp: 0.85 }
    ]
  }
];

/* ---------- 신인 이름 생성용 ---------- */
const ROOKIE_PREFIX = ['리틀', '영', '빅', '미스터', '올드', '쿨', '릴', '퓨어', '', '', ''];
const ROOKIE_CORE = [
  '타이거', '스톤', '레인', '노바', '제로', '쿠키', '모스', '플랜B', '루키', '헤일',
  '버터', '체리', '오션', '블랭크', '정글', '카피', '덱스', '보울', '피치', '해치',
  '윤슬', '이든', '키라', '소코', '마야', '로운', '하울', '도담', '시온', '레오'
];

/* ---------- 팬 페르소나 & 반응 템플릿 ---------- */
// {stage}: 플레이어 활동명, {title}: 작품명, {npc}: 관련 아티스트, {award}: 시상식/부문
const PERSONAS = {
  core: { label: '찐팬', icon: '💜', handles: ['찐팬_{s}러버', '{s}만본다', '{s}_forever', '1집부터찐', '앨범깡_전문'] },
  casual: { label: '라이트팬', icon: '🎧', handles: ['출근길리스너', '플리수집가', 'music_lover', '그냥듣는사람', '알고리즘이데려옴'] },
  critic: { label: '고인물', icon: '🧐', handles: ['힙합고인물_93', '리드머정독러', 'bars_only', '라임분석가', '음악평론가병'] },
  hater: { label: '악플러', icon: '👿', handles: ['ㅇㅇ', 'anon_1123', '그냥지나가다', '팩트폭격기', '익명의제보자'] },
  old: { label: '올드팬', icon: '📼', handles: ['믹테시절팬', '언더때부터', '초창기_리스너', 'OG_fan', '사클시절'] },
  global: { label: '해외팬', icon: '🌏', handles: ['kpop_hiphop_stan', 'seoul_beats', 'krnb_daily', 'hallyu_bars', 'intl_listener'] },
  meme: { label: '밈계정', icon: '🤡', handles: ['힙합밈공장', '음악계_찌라시', '오늘의짤', '실시간힙합'] },
  rival: { label: '타팬덤', icon: '⚔️', handles: ['{n}팬클럽', '{n}_지킴이', '우리{n}최고'] }
};

const REACTIONS = {
  release_great: {
    core: ['이번 {title} 진짜 인생앨범 확정이다 ㅠㅠ', '{stage} 믿고 듣는 이유가 있지', '첫 트랙부터 소름... 미쳤다 진짜', '트랙리스트 순서까지 완벽함. 앨범은 이렇게 만드는 거다', '이거 듣고 출근하다 울었음'],
    casual: ['알고리즘에 떠서 들었는데 이거 뭐야? 너무 좋은데', '{title} 하루 종일 반복재생 중', '이 사람 노래 처음 듣는데 팬 될 듯'],
    critic: ['올해 국내 앨범 중 원탑 후보. 서사 구성이 탁월함', '라인 하나하나가 다 의미 있음. 가사집 정독 추천', '이건 리드머 4개 이상 나온다에 한 표', '비트 셀렉, 랩 디자인, 앨범 흐름 전부 수준급'],
    hater: ['솔직히 좀 과대평가 아님?', '좋긴 한데 다들 너무 빨아주는 듯'],
    old: ['드디어 초심 찾았다... 이게 내가 알던 {stage}', '믹테 시절 감성 + 지금의 내공, 완벽함'],
    global: ['THIS IS INSANE 🔥🔥 K-hiphop is so underrated', 'no english lyrics but i feel every word', 'album of the year, no debate'],
    meme: ['[속보] {stage}, 또 해냄 ㄷㄷ', '{title} 안 들은 사람 = 오늘 손해 본 사람'],
    rival: ['인정할 건 인정함. 이번 건 잘 만들었네']
  },
  release_good: {
    core: ['역시 {stage}... 이번에도 기대 이상', '타이틀 미쳤고 수록곡도 다 좋음', '앨범 잘 들었어요! 공연 언제 해요?'],
    casual: ['노래 괜찮네 플리에 추가함', '드라이브할 때 듣기 좋다', '중독성 있어서 계속 흥얼거리게 됨'],
    critic: ['준수함. 다만 중반부가 약간 늘어지는 느낌', '전작보다 확실히 성장했다', '훅은 좋은데 벌스가 조금 평이'],
    hater: ['그냥 무난무난. 뭐가 좋은지 모르겠음', '이 정도로 화제될 건 아닌데'],
    old: ['예전이 더 좋았지만 이것도 나쁘진 않네'],
    global: ['the production on this is so clean', 'someone translate the lyrics pls 🙏'],
    meme: ['{title} 듣고 갑자기 운동 가고 싶어짐'],
    rival: ['나쁘진 않은데 우리 {npc} 신보가 더 좋던데']
  },
  release_mid: {
    core: ['나는 좋던데... 다들 왜 그래ㅠ', '{stage}의 새로운 시도라고 생각함', '반복해서 들으니까 좋아지는 앨범'],
    casual: ['음... 한 번 듣고 말 듯', '타이틀 말고는 기억이 안 남'],
    critic: ['전작 대비 확실히 아쉬움. 방향성을 잃은 느낌', '트랙들이 따로 노는 느낌. 앨범으로서 응집력이 부족', '좋은 재료로 평범한 요리를 함'],
    hater: ['이제 한물갔네', '이거 돈 주고 들으라고?', '{stage} 거품 꺼지는 중'],
    old: ['초심 잃음... 예전 {stage} 돌려줘', '이럴 거면 믹테 다시 들을래'],
    global: ['not their best but still vibing'],
    meme: ['{stage} 신보 듣고 무표정해진 리스너들.jpg'],
    rival: ['ㅋㅋ 이번 건 좀 아니지 않냐']
  },
  release_bad: {
    core: ['그래도 응원해요... 다음엔 더 좋은 거 들려줘', '좀 쉬었다 와도 돼요 {stage}'],
    casual: ['이건 좀...', '나만 별로인가?'],
    critic: ['급하게 만든 티가 너무 남', '가사도 사운드도 기본기가 흔들린다', '이번 작은 커리어의 오점으로 남을 듯'],
    hater: ['ㅋㅋㅋㅋ 은퇴각', '음원 사이트 돈 아깝다', '이걸 들으라고 만든 거냐', '역대급 망작 축하드립니다'],
    old: ['진짜 많이 변했다... 실망', '언더 시절 {stage}는 어디 갔냐'],
    global: ['hmm this ain\'t it chief'],
    meme: ['[단독] {stage} 신보, 리스너들 단체로 귀 막아 ㄷㄷ'],
    rival: ['역시 우리 {npc}가 진짜다']
  },
  genre_change: {
    core: ['장르 바꿔도 {stage}는 {stage}다', '새로운 모습도 좋아요!'],
    old: ['갑자기 장르를 왜 바꿈? 적응 안 됨', '이건 내가 알던 {stage}가 아니야'],
    critic: ['과감한 장르 전환. 결과물은 반반', '음악적 스펙트럼 확장은 긍정적'],
    hater: ['돈 되는 장르로 갈아탔네 ㅋㅋ']
  },
  label_major: {
    core: ['축하해요!! 드디어 큰물로 간다 ㅠㅠ', '이제 홍보 빵빵하게 받겠다!'],
    old: ['결국 돈 따라갔네...', '언더의 자존심이었는데 아쉽다'],
    critic: ['메이저행 이후 음악적 색깔을 지킬 수 있을지 지켜볼 일', '자본의 맛을 본 래퍼는 대체로...'],
    hater: ['셀아웃 ㅋㅋㅋ', '이제 차트용 노래만 내겠네'],
    meme: ['[오피셜] {stage}, {npc} 합류 "here we go"']
  },
  label_indie: {
    core: ['레이블 계약 축하해요!', '좋은 사람들이랑 음악하길!'],
    critic: ['좋은 선택. 이 레이블이면 음악적 자유는 보장됨', '레이블 색깔이랑 잘 맞는다'],
    old: ['지조 있다 {stage}!']
  },
  crew_join: {
    core: ['크루 합류 축하해요! 단체곡 기대된다', '{npc} 라인업 미쳤네'],
    critic: ['크루 색깔이랑 잘 어울린다', '크루 컴필 나오면 무조건 들을 듯'],
    hater: ['크루빨 받으려고 들어갔네'],
    meme: ['{npc} 단톡방 근황.jpg']
  },
  award_win: {
    core: ['울 애기 상 받았다 ㅠㅠㅠㅠ 고생 많았어', '받을 사람이 받았다', '수상소감 듣고 울었음'],
    casual: ['오 이 사람 상 받았네? 노래 들어봐야지'],
    critic: ['이견 없는 수상', '올해 가장 정당한 결과'],
    hater: ['상 받을 정도는 아닌데', '심사위원 누구냐 ㅋㅋ'],
    old: ['언더 시절부터 봤는데 감격이다'],
    global: ['CONGRATS!!! deserved 🏆', 'the world is finally noticing'],
    meme: ['[속보] {stage}, {award} 수상 "어머니 보고 계세요?"'],
    rival: ['이번엔 인정한다']
  },
  award_lose: {
    core: ['상은 못 받았어도 우리 마음 속 1등', '후보 오른 것만으로도 대단해요!'],
    critic: ['솔직히 수상 가능성 있었는데 아쉽다', '후보에 오른 것만으로 커리어 하이'],
    hater: ['ㅋㅋㅋ 들러리', '그럼 그렇지'],
    meme: ['{stage} 수상 실패 후 표정.gif']
  },
  chart_top: {
    core: ['1위 실화냐!!! ㅠㅠㅠ 스밍 열심히 한 보람 있다', '우리가 해냈다!!!!', '{stage} 정상 등극 축하해!!'],
    casual: ['요즘 어딜 가나 이 노래 나옴', '차트 1위길래 들어봤는데 왜 1위인지 알겠네'],
    critic: ['대중성과 음악성 두 마리 토끼', '이 곡이 1위하는 시대라니 반갑다'],
    hater: ['차트 조작 아님?', '사재기 의혹 제기합니다'],
    meme: ['[속보] {title}, 음원차트 점령 "피할 곳이 없다"'],
    rival: ['우리 {npc} 밀어낸 거 용서 못 함']
  },
  chart_entry: {
    core: ['차트인 축하해요!! 계속 올라가자', '스밍 돌리러 갑니다'],
    casual: ['차트에서 보고 들어옴'],
    meme: ['{stage} 차트인, 리스너들 "드디어"'],
    hater: ['차트인 했다고 대단한 줄']
  },
  billboard: {
    core: ['빌보드라니...... 꿈이야 생시야', '한국 힙합의 역사를 쓰는 중', '빌보드 진입 축하해요 ㅠㅠㅠ'],
    global: ['BILLBOARD BABY 🇰🇷🔥', 'they deserve this so much', 'from seoul to the world'],
    critic: ['국내 힙합의 새 이정표', '이게 되는구나'],
    meme: ['[속보] {stage}, 빌보드 진입 "국뽕 차오른다"'],
    hater: ['해외 스밍 총공 아님?']
  },
  post_daily: {
    core: ['오늘도 잘생김/예쁨 담당 ❤️', '셀카 맛집', '일상 공유 감사해요!'],
    casual: ['오 분위기 좋다'],
    hater: ['음악이나 해라', '관종'],
    meme: ['{stage} 인스타 근황 ㅋㅋ']
  },
  post_work: {
    core: ['작업 중이라니!!! 앨범 언제 나와요?', '스튜디오 사진만 봐도 설렌다', '빨리 듣고 싶다ㅠ'],
    critic: ['이번엔 어떤 방향일지 궁금', '모니터 화면에 비친 BPM 보니까 트랩인 듯'],
    hater: ['또 작업 중 사진만 올리고 안 내겠지']
  },
  post_teaser: {
    core: ['티저 미쳤다 ㄷㄷ 발매일 알려줘', '10초 듣고 이미 명곡인 거 앎', '알람 맞춰놓음'],
    casual: ['오 이거 뭔데 궁금하다'],
    global: ['RELEASE DATE WHEN 😭'],
    meme: ['티저만으로 리스너들 잠 못 이뤄']
  },
  post_fan: {
    core: ['답장 받았어요 ㅠㅠㅠ 평생 팬할게요', '{stage}는 팬서비스까지 완벽해', '소통해줘서 고마워요!'],
    casual: ['팬들이랑 친하네 보기 좋다'],
    old: ['이런 거 예전부터 잘했지']
  },
  post_mood: {
    core: ['무슨 일 있어요? 힘내요 ㅠ', '이 감성 그대로 가사로 써주세요'],
    casual: ['글 분위기 좋다'],
    hater: ['감성팔이 ㅋ'],
    critic: ['이 글이 다음 앨범 가사에 나올 듯']
  },
  post_diss: {
    core: ['{stage} 화났다 ㄷㄷ 디스곡 기대함', '할 말은 해야지!'],
    critic: ['디스전 개막? 실력으로 증명해라', '가사로 하면 좋을 걸 SNS로 하네'],
    hater: ['관심 끌려고 저격하네 ㅋㅋ', '찐따같이 SNS 저격이냐'],
    meme: ['[속보] {stage} vs {npc} 전쟁 발발 🍿', '팝콘 각 🍿🍿🍿'],
    rival: ['감히 우리 {npc}를? 체급 차이 모름?']
  },
  post_social: {
    core: ['소신 발언 멋있다', '이런 아티스트라서 좋아함'],
    casual: ['오... 용기 있다'],
    hater: ['연예인이 정치 얘기를 왜 함', '음악이나 하세요', '언팔합니다'],
    critic: ['힙합의 본질은 결국 메시지'],
    meme: ['{stage} 발언에 커뮤니티 둘로 갈라짐']
  },
  post_meme: {
    core: ['ㅋㅋㅋㅋㅋ {stage} 웃긴 거 왜 이렇게 귀엽냐', '드립력 미쳤다'],
    casual: ['ㅋㅋㅋ 이 사람 웃기네', '팔로우함'],
    meme: ['{stage} 밈 무단 도용합니다'],
    hater: ['음악보다 드립이 낫네']
  },
  post_mv: {
    core: ['뮤비 퀄리티 미쳤다', '이거 영화임?', '스트리밍 + 뮤비 무한재생 중'],
    casual: ['뮤비 보고 노래 찾아 들음'],
    global: ['the visuals are UNREAL', 'cinematography goes hard'],
    critic: ['뮤비가 곡의 서사를 완벽하게 확장']
  },
  post_live: {
    core: ['라이브 실력 실화? 음원보다 잘함', '라이브 클립 맛집'],
    casual: ['라이브 이 정도면 공연 가봐야겠다'],
    critic: ['호흡 안정적. 무대 체력 좋음'],
    hater: ['AR 깔았네']
  },
  scandal: {
    core: ['일단 공식 입장 기다려요', '믿고 기다릴게요...'],
    casual: ['헐 무슨 일이야'],
    hater: ['역시 그럴 줄 알았다', '탈덕합니다', '은퇴해라'],
    old: ['실망이다 진짜'],
    meme: ['[속보] {stage} 논란 "커뮤니티 폭발"']
  },
  diss_war: {
    core: ['{stage} 디스곡 미쳤다 ㄷㄷ 완승', '{npc} 이제 답장 못 할 듯 ㅋㅋ'],
    critic: ['라인 하나하나가 칼날. 디스전 승자는 확실함', '디스곡의 정석'],
    hater: ['디스곡 수준 처참 ㅋㅋ'],
    meme: ['{npc} 지금 가사 쓰는 중 ㅋㅋㅋ', '[현장] {stage} vs {npc}, 커뮤니티 실시간 반응'],
    rival: ['우리 {npc}가 진짜 이겼음. 답장 기다려라']
  },
  diss_lose: {
    core: ['그래도 {stage} 응원함...'],
    critic: ['이번 디스전은 {npc} 판정승', '디스곡이 너무 감정적이었다'],
    hater: ['참교육 당했네 ㅋㅋㅋㅋ'],
    meme: ['{stage} 디스전 패배 후 SNS 비활성화?']
  },
  tv_show: {
    core: ['방송 나온 거 너무 멋있었어요!', '무대 찢었다'],
    casual: ['방송 보고 처음 알았는데 랩 잘하네'],
    old: ['방송 나가더니 변했네...', '언더의 자존심은 어디 갔냐'],
    critic: ['방송용 랩과 앨범용 랩은 다르다'],
    hater: ['방송 래퍼 ㅋㅋ'],
    meme: ['[짤] {stage} 방송 레전드 무대']
  },
  hiatus: {
    core: ['{stage} 신곡 언제 나와요 ㅠㅠ 기다리다 지침', '공백기 너무 길다...'],
    hater: ['잠수탔네 ㅋ 은퇴함?'],
    meme: ['{stage} 신곡 발매 기다리는 팬들.jpg (해골)']
  },
  collab: {
    core: ['{npc} 조합 미쳤다 이건 무조건 듣는다', '꿈의 콜라보 성사!!'],
    casual: ['{npc} 때문에 들었다가 {stage}한테 빠짐'],
    critic: ['두 사람의 케미가 기대 이상'],
    rival: ['우리 {npc} 피처링 빨 ㅋㅋ']
  },
  brand: {
    core: ['광고 찍은 거 봤어요 너무 멋있다!', '이제 CF 스타 ㄷㄷ'],
    old: ['광고까지... 진짜 변했다', '음악보다 광고가 먼저냐'],
    hater: ['돈독 올랐네']
  }
};
