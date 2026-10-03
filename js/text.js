/* =========================================================
 *  문장 데이터: 곡/앨범 제목 생성, 평론, 작업 노트, 스토리
 *  플레이스홀더: {key} = 값, {은:key} = 값에 맞는 조사만 출력
 * ========================================================= */

/* ---------- 곡 제목 재료 ---------- */
const TITLE_BANK = {
  '힙합': ['증명', '회색도시', '반지하', 'Bars', '돈다발', '이름값', '왕관', '굶주림', 'Hustle', '도화선', '허물', '청사진', '막차', '흉터', '밑바닥', 'No Cap', '계단', '검은 정장', '첫 계약', '뒷골목', 'Gold Chain', '무대 뒤', '빚', '망원동', '엄마의 기도', '시계태엽', '100 Bars', '한 줄 요약', 'Underdog', '불도저', '체급', '연금술', '맨발', '거울 속 괴물', '사이퍼', '독설', '왕좌의 게임', '현금박치기', '공중전', '고속도로', '마지막 승부', '중독자', '야간작업', '독립선언'],
  'R&B': ['Lavender', 'Slow Dance', '새벽 두 시의 너', 'Velvet Night', '온도차', '숨소리', 'Cherry Wine', '너의 향기', 'Afterglow', 'Pillow Talk', 'Satin', '바닐라 하늘', '파란 새벽', 'Candlelight', 'Late Checkout', 'Honey', '물들어', 'Moonwalk', 'Drunk Text', '체온', '커튼콜', '오늘 밤은 가지 마', 'Blue Hour', '실크', '얼음 녹는 소리', 'Room Service', '무중력', '눈 감으면'],
  '팝': ['Sugar Rush', 'Pop Pop!', 'Butterfly Effect', 'Starlight', 'Lovesick', 'Bubblegum', 'Neon Heart', 'Cosmic Girl', 'Fever Dream', 'Hi-Five', '달콤살벌', 'Run Run Run', 'Glitter', 'Dynamo', '사랑은 롤러코스터', 'Candy Crush', '반짝반짝', 'Lemon Soda', 'Ding Dong', 'Supernova Kiss', 'Jelly Pop', '첫사랑 버튼', 'Holiday', 'Boom Boom Heart'],
  '인디': ['유령 같은 여름', '버스 정류장', '오래된 극장', '라디오 키드', '고양이와 나', '늦은 오후의 산책', '종이배', '사월의 눈', '이불 속 우주', '하품', '망원경', '수요일의 비', '낡은 기타', '여름밤의 꿈', '아무것도 아닌 날', '파란 대문', '빨래', '동물원', '안녕 나의 소년', '옥상에서', '느린 편지', '해질녘 운동장', '비행기 구름', '서랍 속 일기'],
  '록': ['폭주기관차', 'Feedback', '청춘 폭동', '유리 심장', 'Distortion', '불타는 밤', 'Noise Machine', '지하실', 'Static Love', 'Amplifier', '소음 공해', 'Riot Night', '굉음', '록앤롤 유령', '탈주', '번개', '끝나지 않는 노래', '폐허', '전기 양', 'Overdrive'],
  '일렉트로닉': ['Glitch', '808 Heart', 'Pulse', 'Strobe', 'Hyperdrive', 'Bassline', 'Laser Beam', 'Signal', 'Afterhours', 'Synthetica', 'Night Bus', 'Voltage', 'Frequency', '디지털 뽕짝', '전자 나비', 'Loop', 'Reboot', 'Pixel Rain', 'Subway Rave', '0과 1']
};
const TITLE_EN_GLOBAL = ['Paradise Lost', 'Highway Prayer', 'Blue Money', 'Rich Kids Cry', 'Overtime', 'Pink Champagne', 'Ghost Town Love', 'Wasted Youth', 'Pressure Points', 'Golden Hour Blues', 'Neon Psalm', 'Hotel Lobby', 'Burn the Boats', 'Cold Summer', 'Hollywood Hills', 'Diamond Teeth', 'Lonely at the Top', 'Kerosene', 'Cruel Intentions', 'Velvet Rope', 'Silver Linings', 'Backseat Gospel', 'Malibu Nights', 'No Witnesses', 'Glass House', 'Cherry Bomb Theory', 'Last Dance in LA', 'Heartbreak Hotel 2', 'Sweet Disaster', 'Midnight Oil'];
const KR_ADJ = ['차가운', '뜨거운', '잃어버린', '푸른', '낯선', '오래된', '작은', '마지막', '이상한', '투명한', '검은', '하얀', '느린', '빠른', '비밀의', '눈부신', '조용한', '깨진', '희미한', '영원한'];
const KR_NOUN = ['새벽', '서울', '파도', '불면증', '네온', '유리', '그림자', '첫눈', '고백', '열대야', '우주', '편지', '야경', '거울', '청춘', '독백', '모래성', '불꽃', '안개', '한강', '기찻길', '종이비행기', '유성', '빈방', '소나기', '나침반', '옥상', '지하철', '자정', '비상구', '중력', '물결', '낙원', '여름', '겨울', '정원', '바다', '섬', '꿈', '심장'];
const KR_PHRASE = ['{n}{을:n} 걷다', '{n}에게', '{n}의 끝', '{n} 속으로', '안녕, {n}', '{n}{이:n} 지나면', '우리의 {n}', '{n} 같은 너', '{n}에서 만나', '다시, {n}', '나의 {n}', '{n}{은:n} 없다', '{n}{을:n} 위한 노래', '{n}{과:n} 나', '{a} {n}', '{a} {n}', '{n}{으로:n}부터', '너라는 {n}', '{n} 한 잔'];
const EN_WORD = ['Lemonade', 'Phantom', 'Gravity', 'Midnight', 'Velvet', 'Neon', 'Ghost', 'Paradise', 'Fever', 'Gold', 'Ocean', 'Wildfire', 'Mirage', 'Echo', 'Satellite', 'Diamonds', 'Sirens', 'Daylight', 'Static', 'Venom', 'Halo', 'Rodeo', 'Comet', 'Kingdom', 'Outlaw', 'Petals', 'Pressure', 'Cherry', 'Blackout', 'Heaven', 'Riot', 'Lotus', 'Saturn', 'Karma', 'Mercy'];
const EN_PATTERN = ['{w}', '{w} Season', 'Midnight {w}', '{w} Dreams', 'No More {w}', '{w} in Seoul', 'Love & {w}', 'Dear {w}', 'Call Me {w}', '{w} Talk', 'Sweet {w}', '{w} Interlude', 'Seoul {w}', '{w} Freestyle', '{w} (Remix)', 'Pt.2 {w}', '{w} Gang'];
const NUM_TITLES = ['1998', '2AM', '24/7', '03:00', '0.1%', '365', 'Seoul 2049', '99%', '7th Floor', '1:1', '서른', '스물셋', '10년 후', '1004', '#00', 'D-1', '오후 5시 59분'];
const SLANG_TITLES = ['ㅇㅇ', 'ㄹㅇ', 'FLEX', 'YOLO', 'Skrrt', 'ㅋㅋ', 'GG', 'TMI', '킹받네', '갓생', '퇴사각', '알빠노', 'MZ', 'N잡러', '존버'];
const MIX_TITLES = ['서울 Drive', 'Hongdae Nights', '을지로 Blues', '한강 Freestyle', '편의점 Romance', '노래방 Superstar', '야근 Anthem', '택시 Driver', '골목길 Groove', '성수 Vibe'];

/* ---------- 앨범 제목 재료 ---------- */
const ALBUM_PATTERN = ['{w}', '{w}', '{k}', '{k}', 'The {w} Tape', '{w} EP', 'Mixtape Vol.{num}', '{w}: Chapter {num}', 'Before {w}', 'After {w}', '{k}의 기록', '{k} 연대기', '{k} 3부작', 'Songs for {w}', 'Diary of {w}', '{k}, {k2}, 그리고 {k3}', '{w} & {w2}', 'Welcome to {w}', '{a} {k}', '{k}{으로:k} 가는 길', '{name}', 'Season of {w}', '{w} Vol.{num}', '{k}에서 보낸 한철', 'Self-Titled', '{num}'];

/* ---------- 주제 ---------- */
const THEME_KEYWORDS = {
  '자전적 서사': ['나', '내', '이름', '기록', '일기', '고백', '독백', 'diary', 'me', 'story', '증명', '거울'],
  '사랑/이별': ['사랑', '이별', '너', '안녕', 'love', 'heart', 'kiss', '고백', '그대', '첫사랑', 'baby', '향기'],
  '플렉스': ['돈', 'money', 'gold', 'flex', '다이아', 'diamond', 'rich', '롤렉스', 'chain', '현금', '왕관', 'bling'],
  '사회비판': ['도시', '시스템', '뉴스', '세상', '반지하', '청년', 'riot', '혁명', '빚', '굴레', '계단'],
  '우울/불안': ['불면증', '새벽', '그림자', '안개', '우울', 'blue', 'ghost', '유령', '숨', '빈방', '깨진'],
  '파티': ['party', '파티', 'dance', '클럽', 'club', 'tonight', '불꽃', 'fever', 'rave', '밤새'],
  '디스': ['디스', '독설', 'kill', '사형', '왕좌', '체급', '참교육', 'no cap', '전쟁'],
  '실험적': ['0', '1', '#', '?', '…', 'glitch', 'loop', 'signal', '실험', '전자'],
  '청춘': ['청춘', '스물', '여름', 'youth', '학교', '운동장', '소년', '소녀', '사춘기', '옥상'],
  '가족': ['엄마', '아빠', '어머니', '아버지', '가족', '집', '동생', 'mom', 'home', '할머니'],
  '도시의 밤': ['서울', '밤', 'night', 'city', '네온', 'neon', '야경', '지하철', '택시', '자정', '을지로', '한강'],
  '성공담': ['성공', '증명', '정상', 'top', '왕', 'king', '꿈', 'dream', '계단', '첫 계약', 'underdog']
};
const THEME_PHRASE = {
  '자전적 서사': '자신의 지난날을 되짚는 서사', '사랑/이별': '사랑의 시작과 끝', '플렉스': '성공과 과시의 언어',
  '사회비판': '사회를 겨누는 날 선 시선', '우울/불안': '불안과 우울의 내면 풍경', '파티': '밤새 끝나지 않는 파티',
  '디스': '상대를 향한 날 선 공격', '실험적': '정형을 거부하는 실험', '청춘': '흔들리는 청춘의 초상',
  '가족': '가족이라는 가장 가까운 이야기', '도시의 밤': '도시의 밤 풍경', '성공담': '바닥에서 정상으로 오르는 이야기'
};
// [0] = 가사가 좋을 때(긍정), [1] = 가사가 약할 때(부정)
const THEME_LINE = {
  '자전적 서사': ['가사는 일기장을 그대로 펼쳐 놓은 듯 내밀하다.', '자기 고백이 종종 자기 연민으로 흐른다.'],
  '사랑/이별': ['사랑 노래라는 가장 흔한 재료로 흔하지 않은 장면을 만든다.', '사랑 노래의 상투성에서 크게 벗어나지 못한다.'],
  '플렉스': ['과시의 언어가 넘치지만, 그 밑에 깔린 허기가 곡에 긴장감을 준다.', '플렉스는 화려하지만 반복될수록 공허하게 들린다.'],
  '사회비판': ['구호에 그치지 않는 구체적인 장면들이 메시지에 힘을 싣는다.', '분노는 선명하지만 구호 이상의 장면을 보여주지 못한다.'],
  '우울/불안': ['불안을 미화하지 않고 그대로 응시하는 태도가 인상적이다.', '어두운 정서가 반복되며 다소 단조로워진다.'],
  '파티': ['생각 없이 몸을 맡기기 좋은 에너지로 가득하다.', '파티 트랙의 공식에 충실하지만 그 이상을 보여주진 않는다.'],
  '디스': ['펀치라인이 상대의 급소를 정확히 노린다.', '공격성은 충분하지만 디스 이상의 의미를 남기진 못한다.'],
  '실험적': ['익숙한 문법을 비틀어 낯선 감각을 만든다.', '실험이 때로 청자를 밀어내지만 그 고집이 이 작품의 정체성이다.'],
  '청춘': ['흔들리는 시절의 공기를 잘 포착했다.', '청춘을 노래하는 방식이 다소 상투적이지만 진심만은 전해진다.'],
  '가족': ['가장 사적인 이야기가 가장 보편적인 울림을 낳는다.', '가족 이야기가 신파에 기대는 순간이 있다.'],
  '도시의 밤': ['네온사인과 택시 불빛이 가사 사이로 스쳐 지나간다.', '도시의 밤이라는 익숙한 소재를 넘어서는 풍경은 보이지 않는다.'],
  '성공담': ['바닥에서 올라온 사람만 쓸 수 있는 디테일이 있다.', '성공 서사는 설득력 있지만 그다음 이야기가 궁금해진다.']
};

/* ---------- 평론 문장 (한국어) ---------- */
const RV = {
  open: {
    great: ['『{album}』{은:album} 올해의 앨범 논쟁에서 빠질 수 없는 작품이다.', '{stage}{은:stage} 『{album}』으로 자신의 이름을 씬의 역사에 새겼다.', '처음부터 끝까지 흠잡을 곳을 찾기 힘든 걸작이다.', '이런 앨범은 몇 년에 한 번 나온다. 『{album}』이 그렇다.', '{stage}의 커리어는 『{album}』 이전과 이후로 나뉠 것이다.'],
    good: ['『{album}』{은:album} {stage}의 성장을 증명하는 단단한 작품이다.', '몇몇 아쉬움에도 불구하고 충분히 귀 기울일 가치가 있다.', '확실한 개성과 완성도를 갖춘 결과물.', '{stage}{은:stage} 자신이 무엇을 잘하는지 정확히 알고 있다.', '야심과 완성도 사이에서 영리하게 균형을 잡았다.'],
    mid: ['『{album}』에는 좋은 순간들이 있지만 전체적으로는 평이하다.', '가능성과 한계가 동시에 보이는 작품.', '무난함이 미덕이자 약점이 된 결과물.', '{stage}의 이름값을 생각하면 아쉬움이 먼저 든다.', '귀에 걸리는 곡은 있지만 마음에 남는 곡은 적다.'],
    bad: ['안타깝게도 『{album}』{은:album} {stage}의 이름값에 미치지 못한다.', '방향을 잃은 채 표류하는 작품이다.', '급조된 흔적이 곳곳에서 드러난다.', '『{album}』{을:album} 끝까지 듣는 일은 인내심을 요구한다.', '{stage}에게 지금 필요한 건 발매가 아니라 휴식이었을지도 모른다.']
  },
  albumTitle: {
    same: ['앨범명과 같은 이름의 「{same}」{이:same} 작품 전체의 무게중심 역할을 한다.', '동명의 트랙 「{same}」에서 출발해 앨범 전체로 번져가는 구성이 영리하다.'],
    english: ['『{album}』이라는 영문 제목은 이 작품이 지향하는 질감을 정확히 예고한다.', '『{album}』, 제목에서부터 국내 시장 너머를 의식한 태도가 엿보인다.'],
    theme: ['『{album}』이라는 제목처럼, 앨범은 {themePhrase}에 집요하게 매달린다.', '『{album}』{은:album} 제목만으로 {themePhrase}{을:themePhrase} 예고하고, 그 약속을 지킨다.'],
    themeMiss: ['다만 『{album}』이라는 제목이 실제 내용과 어떻게 연결되는지는 끝내 모호하다.', '『{album}』이라는 제목은 근사하지만, 앨범의 이야기와는 따로 논다.'],
    long: ['긴 제목 『{album}』만큼이나 할 말이 많은 앨범이다.'],
    short: ['『{album}』, 짧고 단호한 제목이 앨범의 태도를 대변한다.']
  },
  titleTrack: {
    high: ['타이틀곡 「{title}」{은:title} 첫 소절부터 귀를 사로잡는다.', '「{title}」{은:title} 왜 이 곡이 타이틀인지 단번에 납득시킨다.', '타이틀 「{title}」의 훅은 올해 가장 중독적인 순간 중 하나다.'],
    mid: ['타이틀곡 「{title}」{은:title} 무난하지만, 앨범을 대표하기엔 다소 힘이 부족하다.', '「{title}」{은:title} 안전한 선택이다. 그게 장점이자 한계다.'],
    low: ['타이틀곡으로 「{title}」{을:title} 고른 건 의문이다.', '「{title}」{은:title} 타이틀이라기엔 지나치게 밋밋하다.']
  },
  best: ['앨범의 백미는 단연 「{best}」다.', '「{best}」{은:best} 반복 재생 버튼을 부르는 트랙이다.', '수록곡 「{best}」에서 {stage}{은:stage} 최고의 컨디션을 보여준다.', '「{best}」{은:best} 타이틀보다 더 오래 기억될 곡이다.'],
  bestMeh: ['그나마 귀에 걸리는 곡은 「{best}」 정도다.', '「{best}」에서 겨우 가능성의 흔적이 보인다.'],
  bestWhy: {
    lyric: '가사의 밀도가 압도적이다.', sound: '사운드 디자인이 정교하게 쌓여 있다.', hook: '한 번 들으면 잊히지 않는 훅을 가졌다.',
    originality: '어디서도 들어본 적 없는 구성이다.', perf: '목소리의 표현력이 곡을 한 단계 끌어올린다.'
  },
  worst: ['반면 「{worst}」{은:worst} 앨범의 흐름을 끊는 약한 고리다.', '「{worst}」{은:worst} 트랙리스트에서 빼는 편이 나았다.', '「{worst}」에 이르면 집중력이 급격히 흐트러진다.', '「{worst}」{은:worst} 필러 트랙의 혐의를 벗기 어렵다.'],
  flow: {
    front: ['초반부의 기세가 후반부로 갈수록 힘을 잃는다.', '앞쪽에 좋은 곡을 몰아넣은 탓에 후반부가 헐겁다.'],
    back: ['앨범은 후반부에 이르러서야 진가를 드러낸다.', '천천히 달아오르다 마지막에 폭발하는 구성이다.'],
    even: ['처음부터 끝까지 고른 완성도를 유지한다.', '편차 없이 균일한 트랙들이 안정감을 준다.']
  },
  featGood: ['「{track}」에 참여한 {feat}의 벌스는 앨범의 하이라이트 중 하나다.', '{feat}{과:feat}의 「{track}」{은:track} 예상보다 훨씬 좋은 케미를 보여준다.'],
  featBad: ['「{track}」의 {feat} 피처링은 이름값에 비해 존재감이 약하다.', '{feat}{을:feat} 불러낸 「{track}」{은:track} 굳이 필요했나 싶다.'],
  featOverload: ['피처링 게스트가 지나치게 많아 주인공의 목소리가 희미해진다.', '게스트 명단은 화려하지만 정작 {stage}의 자리가 좁다.'],
  lengthLong: ['{n}곡이라는 러닝타임은 과하다. 절반만 남겼어도 더 좋은 앨범이 됐을 것이다.', '{n}곡을 꽉 채운 욕심이 오히려 집중력을 흩트린다.'],
  lengthShort: ['{n}곡, 짧지만 군더더기 없는 구성이다.', '{n}곡으로 하고 싶은 말을 정확히 끝낸다.'],
  introOutro: ['「{intro}」로 문을 열고 「{outro}」로 닫는 구성이 한 편의 영화 같다.', '인트로 「{intro}」부터 아웃트로 「{outro}」까지 하나의 이야기로 꿰어진다.'],
  intro: ['인트로 「{intro}」{이:intro} 앨범의 세계관을 효과적으로 연다.'],
  mixtape: ['무료 믹스테이프임에도 정규작 못지않은 공이 들어갔다.', '부담 없이 던진 믹스테이프에서 오히려 날것의 매력이 빛난다.'],
  single: ['「{title}」 한 곡으로도 {stage}의 방향성이 분명히 전달된다.', '싱글 「{title}」{은:title} 다음 작품을 기대하게 만드는 예고편이다.'],
  strength: {
    lyric: ['특히 가사가 빛난다. 단어 선택과 서사가 촘촘하다.', '펀치라인 하나하나가 계산되어 있다.', '가사집을 따로 읽고 싶어지는 작품이다.'],
    sound: ['프로덕션이 탁월하다. 사운드의 질감 하나하나에 공들인 티가 난다.', '믹싱과 마스터링까지 빈틈이 없다.', '비트 셀렉의 안목이 남다르다.'],
    hook: ['귀에 꽂히는 훅이 강점이다. 대중적 흡인력이 확실하다.', '라디오에서 흘러나와도 단번에 귀를 잡을 멜로디다.', '떼창을 부르는 후렴이 곳곳에 있다.'],
    originality: ['기존 문법을 비트는 독창적인 시도가 돋보인다.', '장르의 경계를 의식하지 않는 자유로움이 있다.', '익숙한 듯 낯선 감각이 계속해서 귀를 긴장시킨다.'],
    perf: ['랩/보컬 퍼포먼스가 압도적이다. 목소리 자체가 악기처럼 쓰인다.', '톤과 딜리버리만으로 곡의 분위기를 지배한다.', '호흡과 완급 조절이 베테랑의 그것이다.']
  },
  weak: {
    lyric: ['다만 가사는 상투적인 표현에 자주 기댄다.', '가사의 깊이가 사운드의 야심을 따라가지 못한다.'],
    sound: ['하지만 비트와 믹싱이 곡의 잠재력을 받쳐주지 못한다.', '사운드가 다소 저예산의 티를 낸다.'],
    hook: ['훅의 힘이 약해 곡들이 쉽게 기억에 남지 않는다.', '대중적인 귀를 붙잡을 한 방이 부족하다.'],
    originality: ['어디선가 들어본 듯한 익숙함이 발목을 잡는다.', '레퍼런스가 너무 선명하게 들린다.'],
    perf: ['랩/보컬의 표현력이 단조로워 후반부로 갈수록 지친다.', '목소리가 비트에 묻히는 순간이 잦다.']
  },
  coh: { high: ['앨범 전체가 하나의 이야기처럼 유기적으로 흘러간다.', '트랙 순서 하나까지 고민한 흔적이 보인다.'], low: ['트랙 간의 연결이 느슨해 앨범보다는 싱글 모음집처럼 들린다.', '곡들이 저마다 다른 방향을 바라본다.'] },
  close: {
    great: ['올해 반드시 들어야 할 앨범.', '이견 없는 수작이다.', '한국 대중음악의 새로운 기준점.'],
    good: ['다음 작품이 더 기대된다.', '충분히 좋다. 그리고 더 좋아질 것이다.', '{stage}의 디스코그래피에서 중요한 이정표로 남을 것이다.'],
    mid: ['가능성은 확인했다. 이제 증명할 차례다.', '다음엔 조금 더 과감해져도 좋겠다.'],
    bad: ['재정비가 필요하다.', '다음 작품에서 반등을 기대한다.']
  },
  credLow: ['다만 방송과 자본의 그림자가 음악의 진정성을 의심하게 만든다.'],
  credHigh: ['무엇보다 타협하지 않는 태도가 음악 전체에서 느껴진다.']
};

/* ---------- 캐주얼 매체(웨이브매거진) 문장 ---------- */
const RV_CASUAL = {
  open: { great: ['이번 {stage} 신보, 진짜 미쳤다.', '『{album}』 듣고 할 말을 잃었다. 무조건 들어라.'], good: ['『{album}』, 기대 이상이다.', '{stage} 이번엔 제대로 했다.'], mid: ['『{album}』, 나쁘진 않은데…', '호불호 갈릴 듯.'], bad: ['솔직히 실망.', '『{album}』, 이건 좀 아니다.'] },
  title: ['타이틀 「{title}」 무한 반복 각.', '「{title}」 훅이 귀에서 안 떠난다.', '「{title}」{은:title} 플레이리스트 필수.'],
  titleBad: ['타이틀 「{title}」{은:title} 좀 심심하다.', '「{title}」, 타이틀치고는 한 방이 없다.', '「{title}」{은:title} 두 번은 안 듣게 된다.'],
  best: ['숨은 명곡은 「{best}」. 꼭 들어볼 것.', '개인적 원픽은 「{best}」.'],
  worst: ['「{worst}」는 스킵해도 될 듯.'],
  close: ['한 줄 평: {verdict}', '총평: {verdict}'],
  verdict: { great: '올해의 앨범감', good: '믿고 듣는 {stage}', mid: '무난한 한 장', bad: '다음을 기약' }
};

/* ---------- Pitchfork (영문) ---------- */
const RV_EN = {
  open: {
    great: ['{album} is the sound of an artist arriving fully formed.', 'Few records this year feel as essential as {album}.', 'With {album}, {stage} has made a quiet masterpiece.'],
    good: ['{album} is a confident, often thrilling step forward for {stage}.', '{stage} sounds hungrier and sharper than ever on {album}.'],
    mid: ['{album} has moments of brilliance buried under too many safe choices.', 'There is a great EP hiding inside {album}.'],
    bad: ['{album} rarely rises above the level of competent background music.', 'For all its ambition, {album} feels strangely hollow.']
  },
  title: ['On the title track, “{title},” the hook lands with surgical precision.', 'Lead single “{title}” is the obvious centerpiece, and for good reason.', '“{title}” stumbles where it should soar.'],
  best: ['The real highlight, though, is “{best},” a song that rewards every replay.', '“{best}” is the album’s emotional peak.'],
  worst: ['“{worst}” feels like filler, and the record would be stronger without it.'],
  theme: ['Thematically, it circles {themePhrase}, rarely losing focus.'],
  feat: ['{feat}’s guest spot on “{track}” adds welcome texture.'],
  close: {
    great: ['A thrilling document of where Korean music is heading.', 'Essential listening.'],
    good: ['It is ambitious, sometimes overwhelming, and often brilliant.', 'An uneven but undeniably personal record.'],
    mid: ['Promising, but not yet the statement it wants to be.'],
    bad: ['A misstep, but an instructive one.']
  }
};
const THEME_PHRASE_EN = {
  '자전적 서사': 'memory and self-mythology', '사랑/이별': 'love and its aftermath', '플렉스': 'wealth and bravado', '사회비판': 'social anger',
  '우울/불안': 'anxiety and depression', '파티': 'the endless party', '디스': 'rivalry and revenge', '실험적': 'formal experimentation',
  '청춘': 'restless youth', '가족': 'family and home', '도시의 밤': 'Seoul after dark', '성공담': 'the long climb to the top'
};

/* ---------- 작업 노트 (곡 완성 직후 판단) ---------- */
const SONG_NOTE = {
  grade: {
    S: ['스튜디오 공기가 바뀌었다. 「{t}」{은:t} 커리어를 바꿀 곡이다.', '「{t}」, 녹음 끝나고 아무도 말을 못 했다. 명곡이다.'],
    A: ['「{t}」{은:t} 확실히 좋다. 타이틀감이다.', '「{t}」, 이 정도면 자신 있게 내놓을 수 있다.'],
    B: ['「{t}」{은:t} 탄탄하다. 앨범에서 제 몫을 할 곡.', '「{t}」, 괜찮다. 다듬으면 더 좋아질 수도.'],
    C: ['「{t}」{은:t} 평범하다. 수록곡으로는 나쁘지 않다.', '「{t}」, 뭔가 2% 부족하다.'],
    D: ['「{t}」{은:t} 아직 데모 수준이다. 다시 써보는 게 어떨까.', '「{t}」, 솔직히 발매하기엔 부끄럽다.']
  },
  best: {
    lyric: ['가사가 특히 좋다. 노트에 쓴 라인들이 살아 있다.', '펜이 날카롭다. 한 줄 한 줄이 꽂힌다.'],
    sound: ['비트가 압도적이다. 스피커가 터질 것 같다.', '사운드 디자인이 이번엔 제대로 나왔다.'],
    hook: ['훅이 미쳤다. 엔지니어가 퇴근길에 흥얼거렸다.', '후렴이 한 번 들으면 안 잊힌다.'],
    originality: ['이런 구성은 처음 시도해 봤다. 낯설지만 신선하다.', '아무도 안 해본 걸 했다.'],
    perf: ['녹음 테이크가 한 번에 나왔다. 목소리가 살아 있다.', '딜리버리가 완벽했다. 원테이크의 마법.']
  },
  weak: {
    lyric: ['가사는 조금 뻔하다.', '가사를 한 번 더 다듬었어야 했다.'],
    sound: ['믹싱이 좀 아쉽다.', '비트가 곡을 못 받쳐준다.'],
    hook: ['훅이 약하다. 귀에 안 남는다.', '후렴이 밋밋하다.'],
    originality: ['어디서 들어본 느낌이 난다.', '레퍼런스 티가 너무 난다.'],
    perf: ['녹음이 좀 불안정하다.', '목소리가 비트에 묻힌다.']
  },
  bestMeh: {
    lyric: '그나마 가사는 들어줄 만하다.', sound: '그나마 비트는 괜찮다.', hook: '후렴은 그럭저럭 귀에 남는다.',
    originality: '시도 자체는 신선했다.', perf: '녹음 톤은 나쁘지 않다.'
  },
  titleMatch: ['제목 「{t}」{이:t} 주제와 딱 맞아떨어져 곡의 인상이 선명해졌다.', '「{t}」, 제목만 봐도 무슨 노래인지 알 것 같다. 좋은 제목이다.'],
  titleEnglish: ['영어 제목이 해외 리스너의 눈길을 끌 것 같다.'],
  titleLong: ['긴 제목이 호기심을 자극한다.'],
  titleShort: ['짧고 강렬한 제목이다.'],
  engineer: {
    S: ['"{sib}… 이거 차트 1위 각이에요."', '"제가 믹스한 곡 중에 최고예요."'],
    A: ['"이거 진짜 좋은데요?"', '"사람들이 좋아할 거예요."'],
    B: ['"괜찮네요. 몇 군데만 손보죠."', '"무난하게 좋아요."'],
    C: ['"음… 나쁘진 않은데요."', '"수록곡으로 쓰면 될 것 같아요."'],
    D: ['"…다른 곡 해볼까요?"', '"오늘 컨디션이 안 좋으셨나 봐요."']
  }
};

/* ---------- 프롤로그 (출신 배경별) ---------- */
const PROLOGUE = {
  underground: '열아홉, 처음 사이퍼에 나갔던 밤을 {stage}{은:stage} 잊지 못한다. 마이크를 쥔 손이 떨렸지만 첫 마디를 내뱉는 순간 모든 게 조용해졌다. 그 후로 몇 년, 홍대 지하 클럽과 공원 사이퍼를 전전하며 가사를 썼다. 통장 잔고는 바닥이지만 노트는 빼곡하다. 이제, 세상이 들어볼 차례다.',
  producer: '{stage}의 방에는 침대보다 모니터 스피커가 더 크게 자리 잡고 있다. 밤새 쪼갠 드럼 루프가 하드디스크에 수천 개. 남의 랩을 위해 비트를 만들던 날들은 끝났다. 이번엔 내 목소리로, 내 이야기를 할 것이다.',
  audition: '카메라 불빛 아래에서 {stage}{은:stage} 전국에 얼굴을 알렸다. 하지만 방송이 끝나자 남은 건 "방송 래퍼"라는 꼬리표뿐. 사람들은 이름은 알아도 음악은 모른다. 진짜 음악으로 증명해야 한다.',
  singer: '작은 라이브바, 관객 다섯 명 앞에서 {stage}{은:stage} 기타를 치며 노래했다. 박수 소리는 작았지만 맨 앞자리 한 사람이 울고 있었다. 그 눈물이 {stage}{을:stage} 여기까지 데려왔다.',
  rich: '좋은 장비, 넓은 작업실, 부족함 없는 지원. {stage}에게 없는 건 단 하나, "진짜"라는 인정이다. 사람들은 말한다. 돈으로 음악 한다고. 그 말이 틀렸다는 걸 보여줄 시간이다.'
};

/* ---------- 챕터 ---------- */
const CHAPTERS = [
  { title: '1장. 방구석의 꿈', text: '아직 세상은 {stage}{을:stage} 모른다. 첫 곡을 만들고, 첫 작품을 세상에 내놓는 것부터 시작이다.' },
  { title: '2장. 첫 발자국', text: '데뷔작이 세상에 나왔다. 듣는 사람은 많지 않지만, 누군가는 분명 듣고 있다.' },
  { title: '3장. 언더그라운드의 별', text: '씬이 {stage}의 이름을 기억하기 시작했다. 공연장 앞줄의 얼굴들이 익숙해진다.' },
  { title: '4장. 메인스트림', text: '이제 {stage}의 노래가 카페와 편의점에서 흘러나온다. 대중의 사랑과 함께 무게도 커졌다.' },
  { title: '5장. 씬의 정점', text: '평단과 대중 모두가 {stage}{을:stage} 인정한다. 정상에서 내려다보는 풍경은 생각보다 외롭다.' },
  { title: '6장. 세계로', text: '바다 건너에서도 {stage}의 노래를 따라 부른다. 꿈꾸던 무대가 손에 잡힐 듯하다.' },
  { title: '7장. 레전드', text: '{stage}{은:stage} 이제 하나의 장르가 되었다. 다음 세대가 {stage}의 음악을 듣고 꿈을 꾼다.' }
];

/* ---------- 커리어 목표 ---------- */
const GOALS = [
  { id: 'song', text: '첫 곡 완성하기' },
  { id: 'debut', text: '데뷔작 발매하기' },
  { id: 'ep', text: 'EP 또는 정규 앨범 발매하기' },
  { id: 'melon', text: '멜론 TOP 100 진입' },
  { id: 'star4', text: '리드머 ★4.0 이상 받기' },
  { id: 'fol100k', text: '팔로워 10만 명' },
  { id: 'label', text: '레이블 계약 또는 내 레이블 설립' },
  { id: 'award', text: '첫 트로피 수상' },
  { id: 'top10', text: '멜론 TOP 10 진입' },
  { id: 'tour', text: '전국 투어 이상 개최' },
  { id: 'melon1', text: '멜론 차트 1위' },
  { id: 'kma', text: '한국대중음악상 수상' },
  { id: 'hot100', text: '빌보드 HOT 100 진입' },
  { id: 'grammyNom', text: '그래미 노미네이트' },
  { id: 'grammy', text: '그래미 수상' }
];

/* ---------- 투어 ---------- */
const TOURS = [
  { id: 'club', name: '소극장 단독공연', minFame: 8, minGlobal: 0, cost: 5000000, cap: 800, price: 44000, glob: 0 },
  { id: 'small', name: '소극장 투어 (5개 도시)', minFame: 18, minGlobal: 0, cost: 60000000, cap: 6000, price: 55000, glob: 0 },
  { id: 'national', name: '전국 투어', minFame: 35, minGlobal: 0, cost: 500000000, cap: 40000, price: 99000, glob: 0 },
  { id: 'arena', name: '체조경기장 아레나 투어', minFame: 55, minGlobal: 0, cost: 1800000000, cap: 120000, price: 132000, glob: 0.5 },
  { id: 'asia', name: '아시아 투어', minFame: 60, minGlobal: 15, cost: 5000000000, cap: 300000, price: 150000, glob: 2.5 },
  { id: 'world', name: '월드 투어', minFame: 70, minGlobal: 35, cost: 20000000000, cap: 1200000, price: 180000, glob: 6 }
];

/* ---------- 스토리 이벤트 ---------- */
// cond(p, S): 발생 조건, w: 주간 확률, once: 한 번만
const STORY_EVENTS = [
  {
    id: 'parents_oppose', once: true, w: 0.08, cond: (p, S) => S.t > 2 && S.t < 40,
    title: '👪 부모님의 전화', text: '"언제까지 음악만 할 거니? 이제 취업 준비라도 해야지." 수화기 너머 목소리가 무겁다.',
    choices: [
      { id: 'persuade', label: '진심으로 설득한다', fx: { mental: -5, flag: 'parents_persuaded', insp: ['가족', 6] }, res: '긴 통화 끝에 어머니가 말했다. "…그래도 밥은 챙겨 먹어." 마음 한구석이 따뜻해졌다.' },
      { id: 'leave', label: '독립을 선언한다', fx: { money: -500000, mental: 5, insp: ['자전적 서사', 8] }, res: '짐을 싸서 반지하 원룸으로 나왔다. 무섭지만 자유롭다. 이 감정은 가사가 될 것이다.' },
      { id: 'ignore', label: '대충 둘러댄다', fx: { mental: -2 }, res: '"응, 알아서 할게." 전화를 끊고 한참을 천장만 바라봤다.' }
    ]
  },
  {
    id: 'parents_proud', once: true, w: 0.15, cond: (p, S) => S.flags.parents_persuaded && p.fame >= 40,
    title: '👪 객석의 부모님', text: '공연 날, 맨 뒷줄에 낯익은 두 얼굴이 보인다. 반대하던 부모님이 몰래 공연을 보러 왔다.',
    choices: [
      { id: 'song', label: '무대에서 감사 인사를 한다', fx: { mental: 20, sentiment: 5, core: 1, insp: ['가족', 12] }, res: '"오늘 저희 부모님이 오셨어요." 객석에서 박수가 터졌다. 어머니가 우는 게 보였다.' },
      { id: 'hug', label: '공연 후 조용히 안아드린다', fx: { mental: 25, insp: ['가족', 8] }, res: '"잘했다, 우리 {child}." 그 한마디에 지난 몇 년이 보상받는 기분이었다.' }
    ]
  },
  {
    id: 'fan_letter', once: true, w: 0.12, cond: (p, S) => p.debutT && p.fame >= 5,
    title: '💌 첫 팬레터', text: '공연장에서 누군가 쪽지를 건넸다. "당신 노래 덕분에 힘든 시간을 버텼어요."',
    choices: [
      { id: 'reply', label: '정성껏 답장한다', fx: { core: 1.5, sentiment: 3, mental: 5 }, res: '밤새 답장을 썼다. 다음 공연에서 그 팬이 답장을 들고 웃고 있었다.' },
      { id: 'post', label: 'SNS에 감사 글을 올린다', fx: { followers: 800, sentiment: 2 }, res: '"이런 편지 받으면 음악 못 그만둬요." 게시물에 따뜻한 댓글이 달렸다.' },
      { id: 'keep', label: '작업실 벽에 붙여둔다', fx: { mental: 12, insp: ['성공담', 6] }, res: '지칠 때마다 그 쪽지를 본다. 오늘도 한 줄 더 쓸 수 있다.' }
    ]
  },
  {
    id: 'old_friend', once: true, w: 0.06, cond: (p, S) => p.debutT && S.t - p.debutT > 8,
    title: '🍺 동네 친구의 연락', text: '중학교 때 같이 랩하던 친구에게서 연락이 왔다. "야, 너 노래 들었어. 진짜 하는구나."',
    choices: [
      { id: 'drink', label: '오랜만에 술 한잔', fx: { money: -100000, mental: 10, insp: ['청춘', 8] }, res: '포장마차에서 옛날 얘기를 하다 보니 새벽이 됐다. 그 시절 노트 이야기에 웃음이 터졌다.' },
      { id: 'busy', label: '바쁘다고 미룬다', fx: { mental: -3 }, res: '"다음에 꼭 보자." 그 다음은 언제 올까.' }
    ]
  },
  {
    id: 'romance', once: true, w: 0.05, cond: (p, S) => p.fame >= 8 && p.age <= 34,
    title: '💕 설레는 만남', text: '작업실 근처 카페에서 자주 마주치던 사람이 먼저 말을 걸어왔다. "혹시… 음악 하세요?"',
    choices: [
      { id: 'date', label: '연애를 시작한다', fx: { mental: 15, flag: 'dating', insp: ['사랑/이별', 8] }, res: '세상이 갑자기 다른 색으로 보인다. 요즘 쓰는 가사는 온통 그 사람 이야기다.' },
      { id: 'music', label: '지금은 음악에 집중한다', fx: { mental: -3, insp: ['우울/불안', 5] }, res: '"미안해요, 지금은…" 돌아서는 뒷모습이 오래 남았다.' }
    ]
  },
  {
    id: 'breakup', once: true, w: 0.04, cond: (p, S) => S.flags.dating && S.t - (S.flagT.dating || 0) > 20,
    title: '💔 이별', text: '"너는 나보다 음악이 더 중요하잖아." 그 말에 아무 대답도 할 수 없었다.',
    choices: [
      { id: 'write', label: '모든 감정을 곡에 쏟는다', fx: { mental: -12, insp: ['사랑/이별', 15] }, res: '그날 밤 가사 노트 세 장을 채웠다. 아픈 만큼 좋은 곡이 나올 것 같다.' },
      { id: 'catch', label: '붙잡는다', fx: { mental: -6, chance: [0.4, { mental: 20, flag: 'dating', res: '다시 손을 잡았다. 이번엔 조금 더 잘해보기로 했다.' }, { mental: -10, insp: ['사랑/이별', 12], res: '"이미 늦었어." 문이 닫혔다.' }] }, res: '' }
    ]
  },
  {
    id: 'dating_news', once: true, w: 0.05, cond: (p, S) => S.flags.dating && p.fame >= 40,
    title: '📸 열애설 보도', text: '연예 매체에 데이트 사진이 찍혔다. 기사 제목: "{stage}, 일반인과 열애 중"',
    choices: [
      { id: 'admit', label: '쿨하게 인정한다', fx: { sentiment: 2, core: -1, buzz: 6, react: 'post_mood' }, res: '"좋은 만남 이어가고 있습니다." 대부분은 축하했지만 일부 팬들은 아쉬워했다.' },
      { id: 'deny', label: '사생활이라며 선을 긋는다', fx: { sentiment: -2, buzz: 3 }, res: '"아티스트의 사생활입니다." 추측성 기사가 며칠 더 이어졌다.' }
    ]
  },
  {
    id: 'mentor_advice', once: true, w: 0.07, cond: (p, S) => p.debutT && S.mentorId,
    title: '🧔 선배의 조언', text: '{mentor}{이:mentor} 작업실에 놀러 왔다. "네 음악 들어봤어. 하나만 말해줄게. 남들 따라 하지 마."',
    choices: [
      { id: 'listen', label: '조언을 새겨듣는다', fx: { skill: ['lyric', 2.5], mentorRel: 15, insp: ['자전적 서사', 6] }, res: '그날 밤, 처음으로 남의 플로우를 흉내 내지 않은 벌스를 썼다.' },
      { id: 'beat', label: '같이 작업하자고 제안한다', fx: { mentorRel: 10, skill: ['produce', 2] }, res: '"좋아, 한 곡 해보자." 선배의 작업 방식을 옆에서 지켜본 것만으로 배운 게 많다.' },
      { id: 'own', label: '"제 방식대로 할게요"', fx: { cred: 1, mentorRel: -5, insp: ['실험적', 8] }, res: '선배가 씩 웃었다. "그래, 그 고집이면 됐다."' }
    ]
  },
  {
    id: 'mentor_feature', once: true, w: 0.08, cond: (p, S) => S.mentorId && npc(S.mentorId) && npc(S.mentorId).rel >= 50 && p.fame >= 20,
    title: '🧔 선배의 선물', text: '{mentor}에게서 메시지가 왔다. "네 다음 곡, 피처링 공짜로 해줄게. 대신 좋은 곡이어야 한다."',
    choices: [
      { id: 'yes', label: '감사히 받는다', fx: { flag: 'mentor_free', mentorRel: 5 }, res: '다음 곡 작업에서 선배를 피처링으로 고르면 무조건, 무료로 참여한다.' }
    ]
  },
  {
    id: 'rival_ahead', once: false, w: 0.05, cond: (p, S) => S.rivalId && npc(S.rivalId) && npc(S.rivalId).fame > p.fame + 5 && S.t > 20,
    title: '⚔️ 앞서가는 라이벌', text: '같은 해 데뷔한 {rival}의 신곡이 차트에 올랐다. 커뮤니티엔 "{rival} > {stage}" 같은 글이 돌아다닌다.',
    choices: [
      { id: 'congrats', label: '축하 메시지를 보낸다', fx: { rivalRel: 12, mental: -3, sentiment: 2 }, res: '"축하해. 금방 따라잡을게." 답장이 왔다. "기다릴게 ㅋㅋ"' },
      { id: 'fuel', label: '질투를 연료로 삼는다', fx: { insp: ['성공담', 10], mental: -4 }, res: '그 곡을 열 번 들었다. 그리고 작업실 불을 켰다.' },
      { id: 'diss', label: '디스곡을 예고한다', fx: { diss: true, buzz: 8, rivalRel: -30 }, res: '"곧 보여줄게." SNS에 올린 한 줄에 커뮤니티가 들끓는다. 6주 안에 디스곡을 발매하자.' }
    ]
  },
  {
    id: 'rival_behind', once: true, w: 0.06, cond: (p, S) => S.rivalId && npc(S.rivalId) && p.fame > npc(S.rivalId).fame + 15 && S.t > 30,
    title: '🤝 라이벌의 연락', text: '{rival}에게서 DM이 왔다. "요즘 너 진짜 잘 나가더라. 인정. 언제 한 곡 같이 할래?"',
    choices: [
      { id: 'collab', label: '함께 작업한다', fx: { rivalRel: 30, insp: ['청춘', 6] }, res: '라이벌에서 동료로. 둘이 함께한 작업실의 밤은 길고 즐거웠다. (라이벌 친밀도 대폭 상승)' },
      { id: 'cold', label: '정중히 거절한다', fx: { rivalRel: -10, cred: 0.5 }, res: '"아직은 각자의 길을 가자." 경쟁은 계속된다.' }
    ]
  },
  {
    id: 'laptop', once: true, w: 0.03, cond: (p, S) => S.songs.some(s => !s.releaseId),
    title: '💻 작업용 노트북 고장', text: '밤샘 작업 중 노트북이 꺼지더니 다시 켜지지 않는다. 미발매 데모들이 그 안에 있다.',
    choices: [
      { id: 'fix', label: '복구 업체에 맡긴다 (150만원)', fx: { money: -1500000, mental: -2 }, res: '다행히 모든 파일을 살렸다. 이번 기회에 백업 습관을 들이기로 했다.' },
      { id: 'cry', label: '포기하고 새로 시작한다', fx: { loseDemo: true, mental: -8, insp: ['우울/불안', 10] }, res: '데모 하나를 영영 잃었다. 하지만 그 상실감으로 더 좋은 곡을 쓸 수 있을지도.' }
    ]
  },
  {
    id: 'busking', once: true, w: 0.05, cond: (p, S) => p.fame < 30 && S.t > 4,
    title: '🎸 즉흥 버스킹', text: '한강 공원에서 친구가 즉석 버스킹을 하자고 한다. 휴대폰 카메라가 켜졌다.',
    choices: [
      { id: 'go', label: '해보자!', fx: { chance: [0.35, { followers: 15000, buzz: 10, res: '영상이 숏폼에서 수십만 회 조회됐다! "이 사람 누구야?"' }, { followers: 300, mental: 5, res: '지나가던 몇몇이 박수를 쳐줬다. 그걸로 충분했다.' }] }, res: '' },
      { id: 'no', label: '쑥스러워서 거절', fx: {}, res: '친구 혼자 노래했다. 생각보다 잘하더라.' }
    ]
  },
  {
    id: 'slump', once: false, w: 0.3, cond: (p, S) => S.lastRelCritic && S.lastRelCritic < 52 && S.t - p.lastReleaseT < 4 && !S.flags.slumpNow,
    title: '🌧️ 슬럼프', text: '혹평이 쏟아진 뒤로 펜이 움직이지 않는다. "나 진짜 재능 없는 건가?"',
    choices: [
      { id: 'travel', label: '혼자 여행을 떠난다 (200만원)', fx: { money: -2000000, mental: 22, insp: ['청춘', 10], ap: -1 }, res: '제주도 바닷가에서 사흘을 보냈다. 돌아오는 비행기에서 첫 줄이 떠올랐다.' },
      { id: 'grind', label: '작업실에 칩거한다', fx: { mental: -6, insp: ['우울/불안', 14], skill: ['lyric', 1.5] }, res: '일주일 동안 밖에 나가지 않았다. 어두운 곡들이 쏟아졌다.' },
      { id: 'counsel', label: '상담을 받는다 (30만원)', fx: { money: -300000, mental: 18 }, res: '"실패는 당신이 아니에요. 그냥 한 장의 앨범일 뿐이죠." 조금 숨이 쉬어진다.' }
    ]
  },
  {
    id: 'sellout_offer', once: true, w: 0.05, cond: (p, S) => p.fame >= 45,
    title: '💼 대기업 행사 섭외', text: '대기업 행사에서 거액을 제안했다. 조건은 "가사 중 자극적인 부분을 바꿔 달라"는 것.',
    choices: [
      { id: 'accept', label: '가사를 바꾸고 무대에 선다', fx: { money: 30000000, cred: -2, react: 'brand' }, res: '통장은 두둑해졌다. 그런데 무대 위에서 그 가사를 부르는 내 목소리가 낯설었다.' },
      { id: 'refuse', label: '정중히 거절한다', fx: { cred: 2, sentiment: 3 }, res: '"제 가사는 제 거라서요." 이 일화가 커뮤니티에 알려지며 "참 아티스트"라는 말을 들었다.' }
    ]
  },
  {
    id: 'young_fan', once: true, w: 0.06, cond: (p, S) => p.fame >= 35,
    title: '🧒 어린 팬의 고백', text: '팬사인회에서 열다섯 살쯤 된 팬이 말했다. "저 {stage} 님 때문에 음악 시작했어요."',
    choices: [
      { id: 'advice', label: '진심 어린 조언을 해준다', fx: { mental: 12, core: 1, sentiment: 3 }, res: '"남들 따라 하지 마. 네 얘기를 해." 언젠가 들었던 말을 그대로 돌려줬다.' },
      { id: 'gift', label: '쓰던 마이크를 선물한다', fx: { mental: 10, sentiment: 5, buzz: 4 }, res: '이 장면이 영상으로 퍼지며 훈훈한 화제가 됐다.' }
    ]
  },
  {
    id: 'charity', once: true, w: 0.05, cond: (p, S) => p.fame >= 40 && p.money > 50000000,
    title: '🤲 기부 제안', text: '재난 피해 지역 돕기 캠페인 참여 요청이 왔다.',
    choices: [
      { id: 'big', label: '조용히 3천만원 기부', fx: { money: -30000000, sentiment: 8, cred: 1 }, res: '나중에 기부 사실이 알려지며 "선한 영향력"이라는 말이 따라붙었다.' },
      { id: 'song', label: '자선 공연을 연다', fx: { ap: -1, sentiment: 5, followers: 5000 }, res: '공연 수익 전액을 기부했다. 관객들의 떼창이 유난히 컸다.' },
      { id: 'pass', label: '이번엔 넘어간다', fx: {}, res: '조용히 지나갔다.' }
    ]
  },
  {
    id: 'social_issue', once: false, w: 0.025, cond: (p, S) => p.fame >= 20,
    title: '📢 사회적 사건', text: '사회를 뒤흔든 사건이 일어났다. 동료 아티스트들이 하나둘 목소리를 내고 있다.',
    choices: [
      { id: 'speak', label: '목소리를 낸다', fx: { insp: ['사회비판', 12], cred: 1, chance: [0.6, { sentiment: 4, res: '많은 팬들이 지지를 보냈다.' }, { sentiment: -5, res: '일부 팬들이 "음악이나 하라"며 등을 돌렸다.' }] }, res: '' },
      { id: 'song', label: '말 대신 곡으로 쓴다', fx: { insp: ['사회비판', 16] }, res: '분노를 노트에 옮겼다. 다음 곡의 주제는 정해졌다.' },
      { id: 'silent', label: '침묵한다', fx: { mental: -2 }, res: '조용히 뉴스를 껐다.' }
    ]
  },
  {
    id: 'anniversary', once: false, w: 1, cond: (p, S) => p.debutT && S.t - p.debutT > 0 && (S.t - p.debutT) % 52 === 0,
    title: '🎂 데뷔 기념일', text: '오늘은 데뷔 {years}주년. 팬들이 SNS에 축하 해시태그를 달고 있다.',
    choices: [
      { id: 'meet', label: '팬미팅을 연다', fx: { ap: -1, core: 2, sentiment: 5, money: 3000000 }, res: '작은 공연장을 가득 채운 팬들과 함께 데뷔곡을 불렀다.' },
      { id: 'single', label: '기념 곡을 쓰기로 한다', fx: { insp: ['자전적 서사', 12] }, res: '지난 시간을 돌아보는 곡을 쓰기로 했다. 영감이 차오른다.' },
      { id: 'post', label: '감사 글만 올린다', fx: { sentiment: 3 }, res: '"함께해줘서 고마워요. 앞으로도." 짧은 글에 수천 개의 하트가 달렸다.' }
    ]
  },
  {
    id: 'doubt', once: false, w: 0.15, cond: (p, S) => p.lastReleaseT && S.t - p.lastReleaseT > 30 && !S.flags.doubtNow,
    title: '🌫️ 긴 공백', text: '마지막 발매 후 30주가 넘었다. 새벽 세 시, 빈 노트를 앞에 두고 생각한다. "나 아직 음악 할 수 있을까?"',
    choices: [
      { id: 'write', label: '그 질문 자체를 곡으로 쓴다', fx: { insp: ['자전적 서사', 14], mental: 4 }, res: '"아직 할 수 있을까"라는 첫 줄로 시작하는 곡을 쓰기 시작했다.' },
      { id: 'rest', label: '조급해하지 않기로 한다', fx: { mental: 12 }, res: '음악은 도망가지 않는다. 오늘은 그냥 잠을 자기로 했다.' }
    ]
  },
  {
    id: 'military', once: true, w: 1, cond: (p, S) => p.gender === 'm' && p.age >= 28 && !S.flags.militaryDelayed2,
    title: '🪖 입영 통지서', text: '우편함에 입영 통지서가 와 있다. 피할 수 없는 시간이 다가왔다.',
    choices: [
      { id: 'go', label: '입대한다 (78주 공백)', fx: { military: true }, res: '' },
      { id: 'delay', label: '1년 연기한다', fx: { flag: 'militaryDelay', mental: -5 }, res: '1년의 시간을 벌었다. 그동안 할 수 있는 만큼 해두자.' }
    ]
  },
  {
    id: 'military2', once: true, w: 1, cond: (p, S) => p.gender === 'm' && S.flags.militaryDelay && S.t - S.flagT.militaryDelay >= 52,
    title: '🪖 더는 미룰 수 없다', text: '연기했던 시간이 끝났다. 이번엔 정말 가야 한다.',
    choices: [{ id: 'go', label: '입대한다 (78주 공백)', fx: { military: true }, res: '' }]
  }
];

/* ---------- 추가 팬 반응 (트랙명을 직접 언급) ---------- */
const REACTIONS_EXTRA = {
  release_great: {
    core: ['{best} 듣고 소름 돋아서 잠 못 잤음', '타이틀 {titleTrack}도 좋은데 {best}가 진짜 명곡임', '『{album}』 트랙리스트 순서 짠 사람 상 줘라', '{album} 실물 앨범 나오면 10장 산다'],
    critic: ['{best}의 마지막 벌스는 올해의 벌스 후보', '{album}은 앨범 단위로 들어야 진가가 보임. 셔플 금지', '{titleTrack} 훅 설계가 교과서적'],
    casual: ['{titleTrack} 출근길 BGM 확정', '{best} 플리에 박제함'],
    global: ['“{best}” is on repeat rn', '{album} is a masterpiece and nobody can tell me otherwise']
  },
  release_good: {
    core: ['{best} 진짜 좋다 이거 타이틀 했어도 됐을 듯', '{titleTrack} 뮤비 언제 나와요?'],
    critic: ['{best} > {titleTrack}. 타이틀 선정 미스', '{worst}만 빼면 거의 완벽했는데'],
    casual: ['{titleTrack} 중독성 있네', '{best} 나만 알고 싶은 노래']
  },
  release_mid: {
    critic: ['{worst}는 왜 넣은 거임?', '{titleTrack} 말고는 기억나는 곡이 없음', '{album}, 제목은 멋진데 내용이 못 따라감'],
    core: ['그래도 {best}는 좋잖아…', '{titleTrack} 라이브로 들으면 다를 거야'],
    hater: ['{album} 듣다가 {worst}에서 껐음 ㅋㅋ']
  },
  release_bad: {
    hater: ['{worst} 이게 노래냐', '{album} 제목 보고 기대했는데 ㅋㅋㅋ'],
    critic: ['{titleTrack}마저 이 정도면 할 말 없음'],
    core: ['{best} 하나 건졌다… 그걸로 버틴다']
  },
  diss_war: { meme: ['{npc} 답디스 마감 D-7', '오늘 저녁 메뉴는 {npc} 구이입니다 🔥'] },
  military_out: {
    core: ['드디어 전역!!!! 기다린 보람 있다 ㅠㅠ', '충성! 전역 축하해요!!', '{stage} 없는 1년 반 너무 길었다'],
    casual: ['벌써 전역했네 시간 빠르다'],
    meme: ['[속보] {stage}, 전역 후 첫 마디 "음악 하고 싶어서 미치는 줄"'],
    hater: ['군대 다녀오면 감 떨어지던데 ㅋ']
  },
  military_in: {
    core: ['몸 건강히 다녀와요ㅠㅠ 기다릴게', '1년 반 금방 간다! 충성!'],
    meme: ['{stage} 입대 전 마지막 셀카.jpg'],
    old: ['다녀오면 더 단단해져 있겠지']
  },
  tour: {
    core: ['투어 막콘 다녀옴 ㅠㅠ 떼창 때 울었다', '{stage} 라이브는 무조건 가야 함', '티켓팅 실패해서 울면서 직캠 봄'],
    casual: ['친구 따라 공연 갔다가 입덕함'],
    global: ['the crowd was INSANE 🔥', 'please come back to my city!!'],
    hater: ['티켓값 너무 비싼 거 아님?']
  },
  label_own: {
    core: ['사장님 {stage} 탄생ㅋㅋㅋ 축하해요!', '이제 레이블 수장이라니 감격'],
    critic: ['레이블 운영은 음악과 또 다른 문제. 지켜볼 일', '어떤 아티스트를 영입할지가 관건'],
    old: ['언더에서 사장님까지… 감회가 새롭다'],
    meme: ['[오피셜] {stage}, 사장님 됐다 "직원 복지는 비트"']
  }
};

/* ---------- NPC 뉴스 ---------- */
const NPC_NEWS = [
  '🎤 {a}, 단독 콘서트 전석 매진', '📱 {a}, 인스타 라이브서 "신보 작업 중" 언급', '🤝 {a}, 해외 프로듀서와 작업 중',
  '🌴 {a}, 휴식기 돌입 "곧 돌아올게요"', '🔥 {a} 무대 영상 조회수 폭발', '👔 {a}, 명품 브랜드 앰버서더 발탁', '📺 {a}, 예능 출연 화제',
  '💬 {a}, SNS에 의미심장한 글 게재', '🎫 {a}, 팬미팅 티켓 1분 만에 매진', '🎙️ {a}, 팟캐스트서 "요즘 씬에 할 말 많다"',
  '🏟️ {a}, 대형 페스티벌 헤드라이너 확정', '🧢 {a}, 패션 브랜드와 협업 컬렉션 출시', '📀 {a}, 정규 앨범 LP 재발매 결정',
  '🤝 {a} & {b}, 합작 앨범 작업설', '👀 {a}, {b}와 스튜디오 목격담', '⚔️ {a}, 신곡에서 {b} 저격?… 커뮤니티 술렁', '🎉 {a}, {b} 콘서트 깜짝 게스트 출연'
];

/* 추가 반응을 기본 반응 템플릿에 합친다 */
Object.keys(REACTIONS_EXTRA).forEach(ctx => {
  const base = REACTIONS[ctx] || (REACTIONS[ctx] = {});
  Object.keys(REACTIONS_EXTRA[ctx]).forEach(k => { base[k] = (base[k] || []).concat(REACTIONS_EXTRA[ctx][k]); });
});
