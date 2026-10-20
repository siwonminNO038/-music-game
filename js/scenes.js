/* =========================================================
 *  확장 5: 인터넷 세대 장르(하이퍼팝·디지코어) 등 장르·스타일·주제 추가
 * ========================================================= */

/* ---------- 하이퍼팝은 팝의 하위 스타일이 아니라 독립 장르로 ----------
 * 하이퍼팝은 이름에 '팝'이 들어가지만 실제로는 일렉트로닉·랩·이모·노이즈를
 * 과장되게 뒤섞은 인터넷 기반 씬이다. 디지코어도 같은 뿌리에서 나왔다. */
STYLES['팝'] = STYLES['팝'].filter(s => s.name !== '하이퍼팝');

GENRES.push('하이퍼팝', '디지코어', '앰비언트', '익스페리멘탈', '펑크');
Object.assign(GENRE_PERF, {
  '하이퍼팝': { vocal: 0.6, flow: 0.4 },
  '디지코어': { flow: 0.6, vocal: 0.4 },
  '앰비언트': { vocal: 0.4, flow: 0.6 },
  '익스페리멘탈': { vocal: 0.5, flow: 0.5 },
  '펑크': { vocal: 0.85, flow: 0.15 }
});
Object.assign(STYLES, {
  '하이퍼팝': [
    { name: '하이퍼팝', fx: { originality: 7, hook: 2, lyric: -2 } },
    { name: '버블검 베이스', fx: { hook: 5, originality: 3, lyric: -3 } },
    { name: '글리치코어', fx: { originality: 8, sound: 2, hook: -4 } },
    { name: '디컨스트럭티드 클럽', fx: { sound: 5, originality: 6, hook: -5 } },
    { name: '나이트코어', fx: { hook: 4, originality: 1, sound: -2 } },
    { name: 'PC 뮤직 스타일', fx: { originality: 5, hook: 3, perf: -1 } }
  ],
  '디지코어': [
    { name: '디지코어', fx: { originality: 6, perf: 2, hook: 1, sound: -2 } },
    { name: '디지코어 랩', fx: { perf: 4, originality: 4, lyric: -2 } },
    { name: '사운드클라우드 이모', fx: { lyric: 4, perf: 2, sound: -3 } },
    { name: '플러그앤비', fx: { hook: 4, sound: 2, lyric: -2 } },
    { name: '스크림 랩', fx: { perf: 5, originality: 4, hook: -5 } },
    { name: '디스코드 바이브', fx: { originality: 5, hook: 2, sound: -3 } }
  ],
  '앰비언트': [
    { name: '다크 앰비언트', fx: { originality: 5, sound: 4, hook: -7 } },
    { name: '드론', fx: { originality: 7, sound: 3, hook: -9 } },
    { name: '앰비언트 팝', fx: { hook: 3, sound: 3, lyric: -1 } },
    { name: '필드 레코딩', fx: { originality: 6, lyric: -5 } }
  ],
  '익스페리멘탈': [
    { name: '노이즈', fx: { originality: 9, perf: 2, hook: -9 } },
    { name: '아방가르드', fx: { originality: 8, lyric: 2, hook: -7 } },
    { name: '사운드 콜라주', fx: { originality: 7, sound: 3, hook: -6 } },
    { name: '아트 팝 실험', fx: { originality: 6, hook: 1 } }
  ],
  '펑크': [
    { name: '하드코어 펑크', fx: { perf: 6, lyric: 1, sound: -3, hook: -2 } },
    { name: '팝펑크', fx: { hook: 5, perf: 2, lyric: -1 } },
    { name: '포스트 하드코어', fx: { perf: 4, originality: 3, hook: -2 } },
    { name: '조선 펑크', fx: { perf: 4, originality: 3 } }
  ]
});
// 기존 장르에도 몇 가지 추가
[['힙합', [{ name: '레이지 디지털', fx: { perf: 3, originality: 3, lyric: -3 } }, { name: '저지 드릴', fx: { hook: 4, perf: 2, lyric: -2 } }]],
 ['R&B', [{ name: '얼터너티브 소울', fx: { originality: 4, sound: 2 } }]],
 ['인디', [{ name: '베드룸 하이퍼팝', fx: { originality: 5, hook: 1, sound: -2 } }, { name: '미드웨스트 이모', fx: { lyric: 4, perf: 1, hook: -1 } }]],
 ['일렉트로닉', [{ name: '브레이크코어', fx: { originality: 7, perf: 2, hook: -5 } }, { name: '저지 클럽 리믹스', fx: { hook: 5, lyric: -3 } }, { name: '하드스타일', fx: { perf: 4, hook: 2, lyric: -3 } }]],
 ['록', [{ name: '슈게이즈 리바이벌', fx: { sound: 4, originality: 3, hook: -3 } }]],
 ['J-팝', [{ name: '보카코어', fx: { originality: 5, hook: 2, perf: -2 } }]]
].forEach(([g, list]) => { STYLES[g] = STYLES[g].concat(list); });

Object.assign(TITLE_BANK, {
  '하이퍼팝': ['money machine 2', '반짝반짝 붕괴', 'sugar.exe', '♡error♡', 'pls dont go', '00:00 신데렐라', 'glitter grave', 'ringtone heaven', '버블껌 아포칼립스', 'xoxo.zip', 'hyperheart'],
  '디지코어': ['discord at 3am', 'lost signal', '잠수 탐', 'ur so far', 'pixel tears', '로그아웃', 'bedroom static', 'nvm', 'ghost online', '읽씹', 'wifi heartbreak', 'kill the lag'],
  '앰비언트': ['Music for Subways', '안개 낀 저수지', 'Drift 07', '정전된 도시', 'Low Tide', '빛의 입자', 'Airport Hum', '느린 눈'],
  '익스페리멘탈': ['데이터 장례식', 'Untitled (Feedback)', '금속성 기도', 'Broken Radio Choir', '0.0.0.0', '침묵의 지도', 'Tape Hiss Sermon'],
  '펑크': ['말 달리자 2', '3코드 혁명', '반항의 기술', 'Riot Seoul', '교복 찢기', '지하철 폭주족', '우린 아직 젊다']
});
TITLE_BANK['펑크'].push('체제 거부');

/* ---------- 새 장르 아티스트 (패러디 / 가상) ---------- */
NPC_KR.push(
  { name: '에러코어', genre: '하이퍼팝', fame: 30, skill: 80, trait: '신비주의', label: 'banana', crew: null, bio: '버블검 신스와 노이즈를 섞는 국내 하이퍼팝 듀오' },
  { name: '림보키드', genre: '디지코어', fame: 26, skill: 76, trait: '감성적', label: null, crew: 'dps', bio: '디스코드 서버에서 시작된 디지코어 신예' },
  { name: '0과1소녀', genre: '하이퍼팝', fame: 22, skill: 78, trait: '유쾌함', label: null, crew: null, bio: '나이트코어 커버로 뜬 인터넷 아이돌' },
  { name: '크라잉넛츠', genre: '펑크', fame: 54, skill: 78, trait: '유쾌함', label: 'soesori', crew: null, bio: '조선 펑크의 원조, 말 달리는 밴드' },
  { name: '파란안개', genre: '앰비언트', fame: 18, skill: 86, trait: '신비주의', label: 'banana', crew: null, bio: '지하철 소음을 녹음해 앨범을 만드는 앰비언트 작가' },
  { name: '노이즈캔슬링', genre: '익스페리멘탈', fame: 14, skill: 88, trait: '독설가', label: null, crew: null, bio: '평단만 아는 노이즈 실험가' }
);
NPC_GLOBAL.push(
  { name: '99 gecs', genre: '하이퍼팝', fame: 78, skill: 82, trait: '유쾌함', bio: '하이퍼팝을 대중에게 퍼뜨린 괴짜 듀오' },
  { name: 'Charlie ycy', genre: '하이퍼팝', fame: 88, skill: 84, trait: '카리스마', bio: '클럽 팝과 하이퍼팝을 오가는 여름의 여왕' },
  { name: 'gleave', genre: '디지코어', fame: 66, skill: 78, trait: '감성적', bio: '10대에 디지코어 씬을 연 사운드클라우드 스타' },
  { name: 'ericdoe', genre: '디지코어', fame: 62, skill: 76, trait: '감성적', bio: '이모와 디지코어의 경계에 선 싱어' },
  { name: 'Brian Ego', genre: '앰비언트', fame: 70, skill: 94, trait: '장인', role: 'producer', bio: '앰비언트라는 말을 만든 거장 프로듀서' },
  { name: 'Bjorkk', genre: '익스페리멘탈', fame: 76, skill: 93, trait: '신비주의', bio: '아이슬란드의 실험적 디바' },
  { name: 'Green Night', genre: '펑크', fame: 84, skill: 74, trait: '유쾌함', bio: '팝펑크를 스타디움으로 끌고 간 밴드' }
);
(function () {
  const rh = OUTLETS.find(o => o.id === 'rhythmer');
  if (rh && !rh.genres.includes('디지코어')) rh.genres.push('디지코어'); // 디지코어 랩은 리드머도 다룬다
  AWARDS.find(a => a.id === 'kma').cats.push({ name: '최우수 일렉트로닉·인터넷 뮤직 노래', type: 'track', genre: '하이퍼팝', wc: 0.85, wp: 0.15 });
  AWARDS.find(a => a.id === 'grammy').cats.push({ name: 'Best Alternative Dance Recording', type: 'track', genre: '하이퍼팝', wc: 0.55, wp: 0.45 });
})();

/* ---------- 주제 추가 ---------- */
const NEW_THEMES = {
  '인터넷/디지털': { fx: { originality: 4, hook: 2, lyric: -2 }, kw: ['wifi', '로그', 'online', '디스코드', 'discord', 'exe', 'zip', '알림', '폰', 'pixel', 'error', '스크롤'], phrase: '화면 너머의 인터넷 세대 감각', en: 'life lived through screens',
    line: ['온라인 세대의 고립과 연결을 정확한 언어로 옮겼다.', '인터넷 밈과 은어에 기대다 보니 메시지가 얕게 흩어진다.'] },
  '정체성': { fx: { lyric: 5, hook: -2 }, kw: ['나', '정체', '이름', '거울', 'who', 'identity', '진짜'], phrase: '나는 누구인가라는 질문', en: 'questions of identity',
    line: ['자신이 누구인지 묻는 가사가 앨범의 척추가 된다.', '정체성에 대한 질문이 구체적인 장면 없이 맴돈다.'] },
  '죽음/상실': { fx: { lyric: 5, originality: 2, hook: -4 }, kw: ['장례', '안녕', '죽', '별', 'grave', 'ghost', '부고', '떠난'], phrase: '떠난 사람과 남은 사람의 이야기', en: 'grief and loss',
    line: ['상실을 다루는 방식이 조심스럽고 정직해서 더 아프다.', '슬픔을 너무 직접적으로 설명해 여운이 남지 않는다.'] },
  '우정': { fx: { hook: 3, lyric: 1 }, kw: ['친구', '우리', 'friend', '크루', '동네', '형', '같이'], phrase: '오래된 친구들의 이야기', en: 'friendship',
    line: ['친구들과의 시간을 담은 가사가 따뜻한 공기를 만든다.', '우정 이야기가 내부 농담에 머물러 바깥 사람에겐 닿지 않는다.'] },
  '여행/방랑': { fx: { originality: 2, hook: 1, sound: 1 }, kw: ['여행', '비행', '바다', '길', 'road', '공항', '기차', '떠나'], phrase: '떠남과 방랑의 감각', en: 'travel and restlessness',
    line: ['장소를 옮겨 다니는 사운드가 여행의 감각을 실감 나게 만든다.', '여행지 풍경을 나열할 뿐, 그곳에 간 이유는 들리지 않는다.'] },
  '꿈/판타지': { fx: { originality: 5, hook: -1 }, kw: ['꿈', 'dream', '우주', '마법', '요정', '별', '판타지'], phrase: '현실을 벗어난 상상의 세계', en: 'dreams and fantasy',
    line: ['몽환적인 세계를 소리로 짓는 상상력이 돋보인다.', '판타지가 현실과 연결되지 않아 공허하게 떠다닌다.'] },
  '가난/생존': { fx: { lyric: 4, perf: 1, hook: -2 }, kw: ['월세', '빚', '반지하', '알바', '라면', 'broke', '통장', '편의점'], phrase: '먹고사는 문제의 생생한 현실', en: 'poverty and survival',
    line: ['통장 잔고와 월세 같은 구체적 디테일이 진짜 생활의 무게를 전한다.', '가난을 서사가 아닌 배경으로만 소비한다.'] },
  '중독/유혹': { fx: { perf: 3, originality: 2, hook: -1 }, kw: ['중독', '술', '밤', '유혹', 'high', '담배', '한 잔', 'addict'], phrase: '빠져나오지 못하는 유혹', en: 'addiction and temptation',
    line: ['유혹에 끌려가는 자신을 미화하지 않고 응시한다.', '위험한 소재를 멋으로만 소비하는 인상이 짙다.'] },
  '신앙/구원': { fx: { perf: 3, lyric: 2, hook: -2 }, kw: ['기도', '신', '구원', '은혜', 'pray', 'heaven', 'amen', '빛'], phrase: '믿음과 구원에 대한 고백', en: 'faith and redemption',
    line: ['구원을 갈구하는 목소리가 앨범에 절실함을 더한다.', '신앙 고백이 설교처럼 들려 듣는 이를 밀어낸다.'] },
  '자연/계절': { fx: { sound: 2, lyric: 2 }, kw: ['봄', '여름', '가을', '겨울', '바람', '꽃', '숲', '비', '눈'], phrase: '계절과 자연의 풍경', en: 'nature and the seasons',
    line: ['계절의 온도가 사운드와 가사에 고르게 배어 있다.', '자연 묘사가 엽서처럼 예쁘기만 하고 깊이가 없다.'] }
};
Object.keys(NEW_THEMES).forEach(t => {
  const d = NEW_THEMES[t];
  if (!THEMES.includes(t)) THEMES.push(t);
  THEME_KEYWORDS[t] = d.kw; THEME_PHRASE[t] = d.phrase; THEME_PHRASE_EN[t] = d.en; THEME_LINE[t] = d.line;
});
function themeFx(theme) { return (NEW_THEMES[theme] || {}).fx || null; }
