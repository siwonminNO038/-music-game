/* =========================================================
 *  확장 4: 장르·스타일 추가
 * ========================================================= */

/* ---------- 새 장르 ---------- */
GENRES.push('블루스', '소울', '디스코', '뉴에이지', '클래식 크로스오버', 'OST');
Object.assign(GENRE_PERF, {
  '블루스': { vocal: 0.8, flow: 0.2 },
  '소울': { vocal: 0.9, flow: 0.1 },
  '디스코': { vocal: 0.75, flow: 0.25 },
  '뉴에이지': { vocal: 0.5, flow: 0.5 },
  '클래식 크로스오버': { vocal: 0.95, flow: 0.05 },
  'OST': { vocal: 0.9, flow: 0.1 }
});
Object.assign(STYLES, {
  '블루스': [
    { name: '델타 블루스', fx: { perf: 4, originality: 2, hook: -3 } }, { name: '시카고 블루스', fx: { perf: 3, sound: 2 } },
    { name: '블루스 록', fx: { perf: 4, hook: 2, lyric: -1 } }, { name: '모던 블루스', fx: { lyric: 3, sound: 2 } }
  ],
  '소울': [
    { name: '모타운 소울', fx: { hook: 5, originality: -2 } }, { name: '서던 소울', fx: { perf: 5, hook: -1 } },
    { name: '노던 소울', fx: { perf: 3, hook: 3 } }, { name: '사이키델릭 소울', fx: { originality: 5, sound: 2, hook: -2 } }
  ],
  '디스코': [
    { name: '클래식 디스코', fx: { hook: 5, lyric: -2 } }, { name: '누디스코', fx: { sound: 4, hook: 3 } },
    { name: '이탈로 디스코', fx: { originality: 3, sound: 2 } }, { name: 'K-디스코', fx: { hook: 4, perf: 2, lyric: -1 } }
  ],
  '뉴에이지': [
    { name: '피아노 뉴에이지', fx: { sound: 4, perf: 2, lyric: -4 } }, { name: '명상 음악', fx: { sound: 3, originality: 2, hook: -5 } },
    { name: '앰비언트 뉴에이지', fx: { originality: 5, hook: -5 } }
  ],
  '클래식 크로스오버': [
    { name: '팝페라', fx: { perf: 6, hook: 2, originality: -2 } }, { name: '크로스오버 오케스트라', fx: { sound: 6, hook: -2 } },
    { name: '네오클래시컬', fx: { originality: 5, sound: 3, hook: -4 } }
  ],
  'OST': [
    { name: '드라마 OST 발라드', fx: { hook: 5, perf: 3, originality: -3 } }, { name: '영화 스코어', fx: { sound: 6, originality: 3, lyric: -5 } },
    { name: '게임 OST', fx: { originality: 4, sound: 3, lyric: -3 } }, { name: '애니메이션 OST', fx: { hook: 5, lyric: -1 } }
  ]
});

/* ---------- 기존 장르 스타일 추가 ---------- */
const MORE_STYLES = {
  '힙합': [
    { name: '사우스 힙합', fx: { hook: 4, perf: 2, lyric: -2 } }, { name: 'G-펑크', fx: { sound: 4, hook: 2, originality: -1 } },
    { name: '클라우드 랩', fx: { originality: 4, sound: 2, lyric: -3 } }, { name: '익스페리멘탈 힙합', fx: { originality: 8, hook: -5 } },
    { name: '호러코어', fx: { originality: 5, perf: 2, hook: -4 } }, { name: '플러그', fx: { hook: 3, sound: 2, lyric: -3 } },
    { name: '그라임', fx: { perf: 4, originality: 3, hook: -2 } }
  ],
  'R&B': [{ name: '슬로우잼', fx: { perf: 3, hook: 2 } }, { name: 'R&B 팝', fx: { hook: 5, originality: -2 } }, { name: '뉴잭스윙', fx: { perf: 3, hook: 3, originality: -1 } }],
  '팝': [{ name: 'K-팝 아이돌', fx: { hook: 6, perf: 2, lyric: -4 } }, { name: '아트팝', fx: { originality: 6, hook: -2 } }, { name: '버블검 팝', fx: { hook: 5, lyric: -4 } }, { name: '발라드 팝', fx: { hook: 3, lyric: 2 } }],
  '인디': [{ name: '시티팝', fx: { hook: 4, sound: 2 } }, { name: '포스트펑크', fx: { originality: 4, perf: 2, hook: -2 } }, { name: '매스록', fx: { sound: 4, originality: 4, hook: -5 } }],
  '록': [{ name: '그런지', fx: { perf: 4, lyric: 2, sound: -2 } }, { name: '이모', fx: { lyric: 4, hook: 1 } }, { name: '얼터너티브 록', fx: { hook: 2, originality: 2 } }, { name: '하드록', fx: { perf: 5, hook: 1, lyric: -2 } }],
  '일렉트로닉': [
    { name: '드럼앤베이스', fx: { perf: 3, sound: 3, lyric: -3 } }, { name: '덥스텝', fx: { sound: 5, hook: 1, lyric: -4 } },
    { name: '신스웨이브', fx: { sound: 4, originality: 2 } }, { name: '퓨처 베이스', fx: { hook: 4, sound: 2 } }, { name: '트랜스', fx: { hook: 3, sound: 3, lyric: -3 } }
  ],
  '발라드': [{ name: '이별 발라드', fx: { lyric: 3, hook: 2, originality: -2 } }, { name: '인디 발라드', fx: { originality: 3, lyric: 2, hook: -1 } }],
  '트로트': [{ name: '트로트 EDM', fx: { hook: 5, originality: 3, lyric: -2 } }],
  '재즈': [{ name: '쿨 재즈', fx: { sound: 4, hook: -1 } }, { name: '재즈 펑크', fx: { perf: 4, hook: 2 } }, { name: '프리 재즈', fx: { originality: 9, hook: -8 } }],
  '포크': [{ name: '인디 포크', fx: { lyric: 3, hook: 1 } }, { name: '프로테스트 포크', fx: { lyric: 6, hook: -3 } }],
  '메탈': [{ name: '프로그레시브 메탈', fx: { sound: 4, originality: 4, hook: -5 } }, { name: '데스메탈', fx: { perf: 5, originality: 3, hook: -8 } }, { name: '파워메탈', fx: { perf: 4, hook: 2 } }],
  '레게': [{ name: '레게 팝', fx: { hook: 5, lyric: -1 } }],
  '라틴': [{ name: '라틴 트랩', fx: { hook: 4, originality: 2, lyric: -2 } }, { name: '보사노바', fx: { sound: 4, perf: 2, hook: -1 } }],
  '아프로비츠': [{ name: '알테', fx: { originality: 5, hook: -1 } }],
  '컨트리': [{ name: '블루그래스', fx: { perf: 4, originality: 2, hook: -2 } }],
  '가스펠': [{ name: '흑인 영가', fx: { perf: 5, lyric: 2, hook: -2 } }],
  'J-팝': [{ name: '시부야계', fx: { originality: 4, sound: 3, hook: -1 } }]
};
Object.keys(MORE_STYLES).forEach(g => { STYLES[g] = (STYLES[g] || []).concat(MORE_STYLES[g]); });

/* ---------- 제목 단어장 ---------- */
Object.assign(TITLE_BANK, {
  '블루스': ['Crossroad Blues', '새벽 3시의 블루스', 'Whiskey & Rain', '낡은 하모니카', 'Mississippi Seoul', 'Broke Again', '비 내리는 영동교 블루스', 'Muddy Water', 'Midnight Train'],
  '소울': ['Ain\'t No Sunshine', 'Soul Kitchen', '마음의 소리', 'Sweet Soul Music', 'Feeling Good Again', 'Brother', '눈물 젖은 소울', 'Higher Love', 'Stand By Me'],
  '디스코': ['Dancing Queen 2', 'Mirror Ball', '토요일 밤의 열기', 'Funky Town', 'Disco Inferno', 'Boogie Wonderland', '반짝이는 밤', 'Le Freak', 'Roller Skate'],
  '뉴에이지': ['River Flows', '바람의 기억', 'Kiss the Rain', 'Spring Waltz', '달빛 정원', 'Morning Mist', '숲의 소리', 'May Be', 'Snow Dream'],
  '클래식 크로스오버': ['Time to Say Goodbye', 'Nella Fantasia', '그대를 위한 아리아', 'Con te Partirò', 'Il Mondo', '오페라의 유령', 'Nessun Dorma Pop', 'Caruso'],
  'OST': ['Stay With Me', '시간을 거슬러', 'Beautiful', '너를 위해', 'Everytime', '그날', 'Main Theme', '운명', 'Love Theme', '꿈의 왕국']
});
TITLE_BANK['힙합'] = TITLE_BANK['힙합'].concat(['Westside Story', 'Cloud 9', 'Plugged In', 'Grime Time', '악몽', 'South Seoul', '롤스로이스', '진짜와 가짜', '언더그라운드 킹']);

/* ---------- 새 장르 아티스트 (패러디) ---------- */
NPC_KR.push(
  { name: '신촌블루즈', genre: '블루스', fame: 34, skill: 84, trait: '장인', label: 'soesori', crew: null, bio: '한국 블루스의 뿌리를 지켜온 밴드' },
  { name: '김목경경', genre: '블루스', fame: 22, skill: 86, trait: '신비주의', label: null, crew: null, bio: '기타 하나로 블루스를 노래하는 장인' },
  { name: '소울다이브', genre: '소울', fame: 40, skill: 80, trait: '카리스마', label: null, crew: null, bio: '파워풀한 보컬의 레트로 소울 밴드' },
  { name: '디스코왕 진영', genre: '디스코', fame: 70, skill: 74, trait: '유쾌함', label: null, crew: null, bio: '반짝이 의상과 복고 댄스의 대명사' },
  { name: '이루미', genre: '뉴에이지', fame: 58, skill: 85, trait: '감성적', label: null, crew: null, bio: '전 세계 피아노 학원에서 연주되는 곡의 주인' },
  { name: '포레스트라', genre: '클래식 크로스오버', fame: 52, skill: 84, trait: '카리스마', label: 'mystichistory', crew: null, bio: '경연 우승 출신 크로스오버 4중창단' },
  { name: '거미줄', genre: 'OST', fame: 62, skill: 86, trait: '감성적', label: null, crew: null, bio: '드라마 OST만 나오면 차트를 휩쓰는 OST 여왕' },
  { name: '백지윤', genre: 'OST', fame: 58, skill: 80, trait: '감성적', label: null, crew: null, bio: '사극 OST의 대명사' }
);
NPC_GLOBAL.push(
  { name: 'Bruno Marz', genre: '소울', fame: 94, skill: 86, trait: '카리스마', bio: '레트로 소울과 펑크의 쇼맨' },
  { name: 'Adelle', genre: '소울', fame: 95, skill: 92, trait: '감성적', bio: '한 장 낼 때마다 기록을 갈아치우는 디바' },
  { name: 'Dua Leap', genre: '디스코', fame: 90, skill: 76, trait: '카리스마', bio: '누디스코 붐을 이끈 팝스타' },
  { name: 'B.B. Kingdom', genre: '블루스', fame: 66, skill: 92, trait: '장인', bio: '블루스 기타의 왕' },
  { name: 'Lang Lung', genre: '클래식 크로스오버', fame: 72, skill: 90, trait: '카리스마', bio: '클래식을 대중에게 끌고 온 피아니스트' },
  { name: 'Hans Zimmerman', genre: 'OST', fame: 80, skill: 90, trait: '장인', role: 'producer', bio: '할리우드 블록버스터 사운드트랙의 거장' }
);
LABELS.push(
  { id: 'soundscape', name: '사운드스케이프 뮤직', tier: '중형', minFame: 15, promo: 1.4, share: 0.62, advance: 10000000, cred: 3, global: 0.04, quota: 1, weeks: 104, genres: ['OST', '뉴에이지', '클래식 크로스오버', '발라드'], desc: '드라마·영화 OST 제작사와 연결된 레이블. OST 섭외가 잦다.' }
);
BACKGROUNDS.push(
  { id: 'ostsinger', name: 'OST 가이드 보컬', desc: '남의 OST 가이드를 수백 곡 불러온 실력파. 목소리는 유명한데 얼굴은 아무도 모른다.', skills: { lyric: 18, flow: 10, vocal: 46, produce: 16, stage: 20 }, money: 4500000, followers: 1500, fame: 5, credibility: 2, genre: 'OST' }
);
PROLOGUE.ostsinger = '{stage}의 목소리는 드라마 엔딩마다 흘러나왔다. 다만 크레딧에는 다른 이름이 적혀 있었다. 가이드 보컬 수백 곡, 이제는 내 이름으로 부를 차례다.';

/* 시상식 부문 */
(function () {
  AWARDS.find(a => a.id === 'grammy').cats.push(
    { name: 'Best Traditional Blues Album', type: 'album', genre: '블루스', wc: 0.7, wp: 0.3 },
    { name: 'Best Dance Pop Recording', type: 'track', genre: '디스코', wc: 0.45, wp: 0.55 },
    { name: 'Best New Age Album', type: 'album', genre: '뉴에이지', wc: 0.7, wp: 0.3 },
    { name: 'Best Score Soundtrack', type: 'album', genre: 'OST', wc: 0.65, wp: 0.35 },
    { name: 'Best R&B Performance (Soul)', type: 'track', genre: '소울', wc: 0.55, wp: 0.45 }
  );
  AWARDS.find(a => a.id === 'kma').cats.push({ name: '최우수 소울&블루스 음반', type: 'album', genre: '소울', wc: 0.9, wp: 0.1 });
  AWARDS.find(a => a.id === 'sma').cats.push({ name: '베스트 OST', type: 'track', genre: 'OST', wc: 0.15, wp: 0.85 });
})();
