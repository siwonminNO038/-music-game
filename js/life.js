/* =========================================================
 *  확장 3: 난이도, 발매 제작비·준비 기간, 음악방송, 디럭스 에디션,
 *          라이프(집·플렉스·투자), 수상 소감
 * ========================================================= */

/* ---------- 난이도 ---------- */
// cost: 생활비 배수, prod: 제작비 배수, skill: 성장 배수, critic: 평론 보정, stream: 스트리밍 배수,
// feat: 피처링 수락률 보정, mental: 멘탈 소모 배수, fame/gfame: 인지도 목표치 감소, expect: 팬 기대치, prep: 발매 준비 기간 적용, gate: 정규 앨범 조건
const DIFFICULTY = {
  easy: { name: '쉬움', desc: '여유롭게 즐기는 난이도. 제작비와 준비 기간이 거의 없습니다.', cost: 1.0, prod: 0.3, skill: 1.0, critic: 0, stream: 1.0, feat: 0, mental: 1.0, fame: 0, gfame: 0, expect: 0, prep: 0, gate: false },
  normal: { name: '보통', desc: '기본 난이도. 앨범 제작비·준비 기간이 있고 팬들의 기대치가 있습니다.', cost: 1.15, prod: 1.0, skill: 0.88, critic: -2, stream: 0.92, feat: -0.04, mental: 1.12, fame: 2, gfame: 1, expect: 4, prep: 1, gate: true },
  hard: { name: '어려움', desc: '돈과 시간이 빠듯하고 평단이 짭니다.', cost: 1.35, prod: 1.4, skill: 0.76, critic: -4, stream: 0.82, feat: -0.09, mental: 1.25, fame: 5, gfame: 3, expect: 8, prep: 1, gate: true },
  hardcore: { name: '하드코어', desc: '현실의 음악 시장. 성공은 정말 소수의 몫입니다.', cost: 1.6, prod: 1.8, skill: 0.64, critic: -6, stream: 0.72, feat: -0.14, mental: 1.4, fame: 9, gfame: 6, expect: 12, prep: 1, gate: true }
};
function D() { return DIFFICULTY[(S && S.difficulty) || 'normal'] || DIFFICULTY.normal; }
function setDifficulty(k) {
  if (!DIFFICULTY[k]) return { ok: false, msg: '난이도 오류' };
  S.difficulty = k; save();
  return { ok: true, msg: `난이도를 '${DIFFICULTY[k].name}'${josa(DIFFICULTY[k].name, '으로')} 바꿨습니다.` };
}

/* ---------- 발매 제작비 · 준비 기간 ---------- */
const PRODUCTION = {
  single: { base: 200000, perTrack: 100000, prep: 0 },
  EP: { base: 1000000, perTrack: 250000, prep: 2 },
  album: { base: 3000000, perTrack: 350000, prep: 4 },
  mixtape: { base: 0, perTrack: 0, prep: 0 },
  compilation: { base: 0, perTrack: 0, prep: 0 }
};
// 레이블과 계약 중이면 레이블이, 내 레이블이면 일부를 레이블 스튜디오가 부담
function productionCost(type, n) {
  const pr = PRODUCTION[type] || PRODUCTION.single;
  // 무명일 땐 DIY로 싸게, 유명해질수록 스튜디오·엔지니어 단가가 오른다
  const scale = clamp(0.4 + S.player.fame / 80, 0.4, 1.3);
  const full = Math.round((pr.base + pr.perTrack * n) * D().prod * scale / 10000) * 10000;
  const p = S.player;
  if (p.label) return { full, pay: 0, who: labelOf(p.label).name };
  if (S.myLabel) return { full, pay: Math.round(full * (0.7 - 0.1 * S.myLabel.lv.studio) / 10000) * 10000, who: S.myLabel.name };
  return { full, pay: full, who: null };
}
function prepWeeks(type) { return D().prep ? (PRODUCTION[type] || {}).prep || 0 : 0; }
function albumUnlocked() {
  if (!D().gate) return true;
  return S.releases.some(r => r.type === 'EP' || r.type === 'album') || S.player.fame >= 25;
}

// 발매 예약·준비 기간 처리는 release.js 참고

/* ---------- 음악방송 ---------- */
const MUSIC_SHOWS = ['엠카운트업', '뮤직뱅커', '쇼! 음악변두리', '인기가사'];
function musicShowTarget() {
  const rel = S.releases.filter(r => r.type !== 'mixtape' && S.t - r.t <= 6 && S.t - r.t >= 0).slice(-1)[0];
  return rel ? song(rel.titleTrackId) : null;
}
function actMusicShow() {
  const p = S.player;
  if (onHiatus()) return { ok: false, msg: '지금은 출연할 수 없습니다.' };
  if (p.fame < 10) return { ok: false, msg: '국내 인지도 10 이상부터 섭외됩니다.' };
  if (isBanned() || S.flags.tvGrudge) return { ok: false, msg: '방송국이 당신을 부르지 않습니다.' };
  const s = musicShowTarget();
  if (!s) return { ok: false, msg: '최근 6주 안에 발매한 곡이 있어야 합니다.' };
  if ((S.cooldowns.mshow || 0) > S.t) return { ok: false, msg: '이번 주는 이미 출연했습니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  S.cooldowns.mshow = S.t + 1;
  const show = pick(MUSIC_SHOWS);
  const perf = p.skills.stage * 0.6 + perfSkill(s.genre) * 0.4 + rnd(-10, 12);
  s.boost += 0.08 + perf / 600;
  p.skills.stage = clamp(p.skills.stage + 0.4 * D().skill * (105 - p.skills.stage) / 100, 0, 100);
  p.mental = clamp(p.mental - 4 * D().mental, 0, 100);
  const fol = Math.round((300 + p.fame * 60) * (perf / 55));
  p.followers.youtube += Math.round(fol * 0.5); p.followers.insta += Math.round(fol * 0.5);
  const rank = S.charts.melon.findIndex(e => e.key === s.id) + 1;
  let msg = `${show}에서 「${s.title}」 무대를 했다. ${perf > 62 ? '직캠이 퍼지고 있다! 🔥' : perf > 45 ? '무난한 무대였다.' : '라이브가 흔들렸다…'}`;
  if (perf > 62) react('music_show', 3, { title: s.title });
  if (rank && rank <= 5) {
    const winP = [0, 0.7, 0.45, 0.3, 0.18, 0.1][rank] + p.coreRatio / 200;
    if (R() < winP) {
      S.musicShowWins = (S.musicShowWins || 0) + 1;
      p.buzz += 6; p.legacy += 0.3; p.sentiment = clamp(p.sentiment + 3, 0, 100);
      addNews(`🥇 ${p.stage}, ${show} 1위! 「${s.title}」`, 'chart');
      if (addMilestone('mshow1', `음악방송 첫 1위 (${show}, 「${s.title}」)`)) addStory(`${show} 1위. 앵콜 무대에서 목이 메어 노래를 끝까지 부르지 못했다.`, 'story');
      react('music_show_win', 5, { title: s.title });
      msg += ` 그리고… 1위!! 🏆 (통산 ${S.musicShowWins}회)`;
    } else msg += ` 1위 후보에 올랐지만 아쉽게 2위.`;
  }
  save();
  return { ok: true, msg };
}

/* ---------- 디럭스 에디션 ---------- */
function canDeluxe(r) { return r && (r.type === 'EP' || r.type === 'album') && !r.deluxe && S.t - r.t >= 8; }
function makeDeluxe(relId, songIds) {
  const p = S.player, rel = release(relId);
  if (!canDeluxe(rel)) return { ok: false, msg: 'EP·정규 발매 8주 뒤부터, 한 번만 낼 수 있습니다.' };
  const tracks = songIds.map(song).filter(s => s && !s.releaseId && !s.reserved);
  if (!tracks.length || tracks.length > 4) return { ok: false, msg: '추가할 미발매 곡을 1~4곡 고르세요.' };
  if (onHiatus()) return { ok: false, msg: '지금은 발매할 수 없습니다.' };
  const cost = productionCost(rel.type, tracks.length);
  const pay = Math.round(cost.pay * 0.4 / 10000) * 10000;
  if (p.money < pay) return { ok: false, msg: `제작비 ${fmtMoney(pay)}이 부족합니다.` };
  p.money -= pay;
  const lab = myActiveLabel();
  const reach = (1500 + Math.pow(p.fame, 2.25) * 32 + Math.sqrt(totalFollowers()) * 25) * (lab ? lab.promo : 1) * D().stream;
  const glob = (300 + Math.pow(p.globalFame, 2.4) * 350 + Math.sqrt(p.followers.youtube) * 40) * D().stream;
  tracks.forEach(s => {
    const tm = 0.3 + s.attrs.hook / 100 * 1.1 + s.quality / 100 * 0.4;
    s.domBase = reach * tm * 0.35; s.globBase = glob * tm * 0.35;
    s.decay = clamp(0.76 + s.attrs.hook * 0.0012 + s.quality * 0.0007, 0.72, 0.93);
    s.startT = S.t + 1; s.releaseId = rel.id; s.role = 'bside';
    s.critic = Math.round(clamp(s.attrs.lyric * 0.25 + s.attrs.sound * 0.25 + s.attrs.originality * 0.2 + s.attrs.perf * 0.18 + s.attrs.hook * 0.12 + p.cred * 0.2 - 3 + D().critic + rnd(-4, 4), 5, 99));
    rel.trackIds.push(s.id);
  });
  rel.trackIds.map(song).forEach(s => { if (!tracks.includes(s)) s.boost += 0.35; });
  rel.deluxe = S.t;
  p.buzz += 4;
  addNews(`💽 ${p.stage} 『${rel.title}』 디럭스 에디션 발매 (+${tracks.length}곡)`, 'release');
  react('deluxe', 4, { title: rel.title, best: tracks[0].title });
  save();
  return { ok: true, msg: `『${rel.title} (Deluxe)』 발매! 신곡 ${tracks.length}곡 추가, 기존 수록곡도 다시 주목받습니다.${pay ? ` (제작비 ${fmtMoney(pay)})` : ''}` };
}

/* ---------- 라이프: 집 ---------- */
const HOMES = [
  { id: 'banjiha', name: '반지하 원룸', price: 0, weekly: 0, mental: 0, studio: 0, desc: '습기 찬 벽, 창문 너머로 행인의 발목이 보인다.' },
  { id: 'officetel', name: '신축 오피스텔', price: 20000000, weekly: 300000, mental: 1, studio: 1, desc: '방음은 아쉽지만 처음 가져보는 내 공간.' },
  { id: 'apt', name: '한강뷰 아파트', price: 300000000, weekly: 1000000, mental: 2, studio: 2, desc: '창밖 야경이 가사가 된다.' },
  { id: 'house', name: '단독주택 + 개인 스튜디오', price: 1500000000, weekly: 2500000, mental: 3, studio: 4, desc: '지하에 꿈에 그리던 녹음실을 만들었다.' },
  { id: 'penthouse', name: '한남동 펜트하우스', price: 6000000000, weekly: 7000000, mental: 4, studio: 5, desc: '성공의 상징. 커뮤니티는 이미 "플렉스 끝판왕"이라 부른다.' }
];
function homeOf() { return HOMES.find(h => h.id === S.player.home) || HOMES[0]; }
function moveHome(id) {
  const p = S.player, cur = homeOf(), next = HOMES.find(h => h.id === id);
  if (!next || next === cur) return { ok: false, msg: '이미 살고 있는 곳입니다.' };
  const refund = Math.round(cur.price * 0.7);
  if (p.money + refund < next.price) return { ok: false, msg: `${fmtMoney(next.price - refund)}이 더 필요합니다.` };
  p.money += refund - next.price;
  p.home = next.id;
  const up = HOMES.indexOf(next) > HOMES.indexOf(cur);
  if (up) { p.mental = clamp(p.mental + 8, 0, 100); p.buzz += HOMES.indexOf(next) * 2; }
  addNews(`🏠 ${p.stage}, ${next.name}${josa(next.name, '으로')} 이사`, 'info');
  addStory(`${cur.name}${josa(cur.name, '을')} 떠나 ${next.name}${josa(next.name, '으로')} 옮겼다. ${next.desc}`, 'story');
  if (next.id === 'penthouse') { react('flex_buy', 4, { item: next.name }); addMilestone('penthouse', '한남동 펜트하우스 입성'); }
  save();
  return { ok: true, msg: `${next.name}${josa(next.name, '으로')} 이사했습니다.${refund ? ` (이전 집 정리 ${fmtMoney(refund)} 회수)` : ''}` };
}

/* ---------- 라이프: 플렉스 ---------- */
const FLEX_ITEMS = [
  { id: 'sneakers', name: '한정판 스니커즈 컬렉션', price: 10000000, buzz: 3, anti: 0.5, cred: 0 },
  { id: 'chain', name: '커스텀 다이아 체인', price: 30000000, buzz: 6, anti: 1, cred: -0.5 },
  { id: 'watch', name: '명품 시계', price: 80000000, buzz: 8, anti: 1.5, cred: -0.5 },
  { id: 'art', name: '현대미술 작품', price: 200000000, buzz: 5, anti: 0.5, cred: 1 },
  { id: 'car', name: '슈퍼카', price: 400000000, buzz: 14, anti: 2.5, cred: -1 },
  { id: 'yacht', name: '요트', price: 3000000000, buzz: 20, anti: 4, cred: -1.5 }
];
function buyFlex(id) {
  const p = S.player, it = FLEX_ITEMS.find(x => x.id === id);
  S.flexOwned = S.flexOwned || [];
  if (!it || S.flexOwned.includes(id)) return { ok: false, msg: '이미 가지고 있습니다.' };
  if (p.money < it.price) return { ok: false, msg: '돈이 부족합니다.' };
  p.money -= it.price; S.flexOwned.push(id);
  p.buzz += it.buzz; p.antiRatio = clamp(p.antiRatio + it.anti, 0, 45); p.cred += it.cred;
  p.inspiration = (p.inspiration || []).filter(x => x.theme !== '플렉스');
  p.inspiration.push({ theme: '플렉스', bonus: 6 + Math.round(it.buzz / 3), until: S.t + 16 });
  react('flex_buy', 4, { item: it.name });
  addNews(`💎 ${p.stage}, ${it.name} 인증샷 공개`, 'info');
  save();
  return { ok: true, msg: `${it.name} 구매! 화제성↑, '플렉스' 영감↑ … 안티도 조금 늘었습니다.` };
}

/* ---------- 라이프: 투자 ---------- */
const INVESTS = {
  deposit: { name: '정기예금', desc: '연 3% 안전 자산', mu: 0.00057, sd: 0 },
  stock: { name: '주식', desc: '주간 ±3% 변동, 장기적으로 우상향', mu: 0.0015, sd: 0.03 },
  coin: { name: '코인', desc: '주간 ±15% 변동, 가끔 폭락', mu: 0.002, sd: 0.13 }
};
function investAmount(kind) { return Math.round(((S.invest || {})[kind] || {}).value || 0); }
function invest(kind, amount) {
  const p = S.player;
  S.invest = S.invest || {};
  amount = Math.round(amount);
  if (!INVESTS[kind] || !(amount > 0)) return { ok: false, msg: '금액을 확인하세요.' };
  if (p.money < amount) return { ok: false, msg: '돈이 부족합니다.' };
  const a = S.invest[kind] || (S.invest[kind] = { value: 0, principal: 0 });
  p.money -= amount; a.value += amount; a.principal += amount;
  save();
  return { ok: true, msg: `${INVESTS[kind].name}에 ${fmtMoney(amount)} 투자했습니다.` };
}
function withdraw(kind) {
  const a = (S.invest || {})[kind];
  if (!a || a.value < 1) return { ok: false, msg: '찾을 돈이 없습니다.' };
  const v = Math.round(a.value), pl = v - a.principal;
  S.player.money += v; a.value = 0; a.principal = 0;
  save();
  return { ok: true, msg: `${INVESTS[kind].name} ${fmtMoney(v)} 회수 (${pl >= 0 ? '수익' : '손실'} ${fmtMoney(pl)})` };
}
function investWeekly(summary) {
  if (!S.invest) return;
  const crash = R() < 0.012, boom = !crash && R() < 0.015;
  Object.keys(S.invest).forEach(k => {
    const a = S.invest[k], c = INVESTS[k];
    if (!a || a.value <= 0) return;
    let r = c.mu + c.sd * (R() + R() + R() - 1.5) * 1.4;
    if (k === 'coin' && crash) r = -rnd(0.35, 0.6);
    if (k === 'coin' && boom) r = rnd(0.3, 0.8);
    a.value = Math.max(0, a.value * (1 + r));
  });
  if (crash && investAmount('coin') > 0) summary.events.push('📉 코인 시장 폭락! 투자금이 크게 줄었습니다.');
  if (boom && investAmount('coin') > 0) summary.events.push('🚀 코인 급등! 투자금이 크게 불었습니다.');
}

/* ---------- 수상 소감 ---------- */
const SPEECHES = [
  { id: 'fans', label: '💜 팬들에게 공을 돌린다' },
  { id: 'family', label: '👪 가족에게 감사를 전한다' },
  { id: 'diss', label: '🔥 무대 위에서 씬을 저격한다' },
  { id: 'social', label: '📢 사회적 메시지를 던진다' },
  { id: 'auction', label: '🔨 트로피를 그 자리에서 경매에 부친다' }
];
function speechInbox(a, cats) {
  addInbox({ type: 'speech', title: `🎤 ${a.name} 수상 소감`, text: `${cats.join(', ')} 수상! 무대에 올라 마이크를 잡았습니다. 어떤 소감을 남길까요?`, data: { award: a.name, prestige: a.prestige }, expires: S.t + 1 });
}
function giveSpeech(m, choice) {
  const p = S.player, d = m.data;
  S.inbox = S.inbox.filter(x => x.id !== m.id);
  let msg = '';
  switch (choice) {
    case 'fans': p.sentiment = clamp(p.sentiment + 4, 0, 100); p.coreRatio = clamp(p.coreRatio + 1, 3, 60); react('award_win', 3, { award: d.award }, { weights: { core: 3 } }); msg = '"이 상은 여러분 거예요." 팬들이 울었다.'; break;
    case 'family': p.mental = clamp(p.mental + 10, 0, 100); p.sentiment = clamp(p.sentiment + 2, 0, 100); msg = '"엄마, 아빠, 저 해냈어요." 객석 어딘가에서 박수가 터졌다.'; break;
    case 'diss': {
      p.buzz += 10; p.cred += 1; p.antiRatio = clamp(p.antiRatio + 1, 0, 45);
      react('post_diss', 4, {}, { weights: { meme: 3 } });
      msg = '"여기 앉아 있는 몇몇은 내 이름 듣고 배 아플 거야." 객석이 술렁였다.';
      const pool = S.npcs.filter(n => n.region === 'KR' && n.role === 'artist' && ['독설가', '허세', '까칠함'].includes(n.trait) && !inWar(n.id) && n.crew !== p.crew);
      if (pool.length && R() < 0.35) { npcStartsWar(pick(pool)); msg += ' …그리고 누군가 바로 디스곡으로 받아쳤다.'; }
      break;
    }
    case 'social': { const sw = rnd(-5, 6); p.cred += 1.5; p.sentiment = clamp(p.sentiment + sw, 0, 100); react('post_social', 4); msg = sw >= 0 ? '소신 발언이 큰 지지를 받았다.' : '발언을 두고 여론이 갈렸다.'; break; }
    case 'auction': {
      if (S.flags.auctioned) { msg = '두 번은 안 통한다. 사회자가 웃으며 넘어갔다.'; break; }
      const price = Math.round(d.prestige * rnd(2, 5) * 1e6 / 1e5) * 1e5;
      S.flags.auctioned = true; p.money += price; p.buzz += 12; p.cred += 2;
      react('speech_auction', 5, { award: d.award });
      addMilestone('auction', '시상식에서 트로피 경매');
      msg = `"이번 달 월세가 필요해서요." 트로피는 ${fmtMoney(price)}에 낙찰됐다. 전설이 됐다.`;
      break;
    }
    default: return { ok: false, msg: '선택 오류' };
  }
  addNews(`🎤 ${p.stage} ${d.award} 수상 소감 화제: ${msg.slice(0, 40)}`, 'info');
  addStory(`${d.award} 수상 소감. ${msg}`, 'story');
  save();
  return { ok: true, msg };
}

/* ---------- 매주 처리 ---------- */
function lifeWeekly(summary) {
  const p = S.player, h = homeOf();
  if (h.mental) p.mental = clamp(p.mental + h.mental * 0.5, 0, 100);
  pendingReleaseWeekly(summary);
  investWeekly(summary);
}
function lifeLivingCost() { return homeOf().weekly; }

/* ---------- 반응 문장 ---------- */
Object.assign(REACTIONS, {
  music_show: {
    core: ['「{title}」 직캠 미쳤다 ㅠㅠ', '음방 무대 찢었다!!', '라이브 실력 실화냐'],
    casual: ['음방 보다가 처음 알았는데 무대 잘하네'],
    old: ['음방까지 나가는구나… 신기하다', '언더 시절엔 상상도 못 했던 무대'],
    hater: ['립싱크 아님?', '음방용 가수 다 됐네']
  },
  music_show_win: {
    core: ['1위!!!!! 앵콜 무대에서 울컥했어 ㅠㅠ', '「{title}」 1위 축하해!!! 우리가 해냈다', '앵콜 직캠 무한 반복 중'],
    casual: ['오 1위했네 축하'],
    meme: ['[속보] {stage}, 음방 1위 후 앵콜 무대서 오열'],
    hater: ['팬덤 투표빨 ㅋ'],
    rival: ['우리 {npc} 1위 뺏어갔네']
  },
  deluxe: {
    core: ['디럭스 신곡 「{best}」 미쳤다', '선물 받은 기분이야 ㅠㅠ'],
    critic: ['디럭스로 앨범 서사가 오히려 흐려졌다', '추가곡 퀄리티가 본편 못지않다'],
    hater: ['우려먹기 ㅋㅋ', '스트리밍 늘리려는 꼼수'],
    casual: ['디럭스 나왔길래 다시 듣는 중']
  },
  flex_buy: {
    core: ['{item} 실화냐 ㄷㄷ 성공했네 우리 애', '플렉스 미쳤다 🔥'],
    old: ['반지하 시절이 그립다… 변했어', '돈 자랑할 시간에 음악이나'],
    hater: ['돈 자랑 ㅋㅋ', '세금은 내냐?'],
    meme: ['[인증] {stage}, {item} 공개… 커뮤니티 "부럽다"'],
    critic: ['플렉스도 가사로 쓰면 예술이다. 쓰기만 한다면']
  },
  speech_auction: {
    core: ['수상소감 레전드 ㅋㅋㅋㅋ', '이게 진짜 힙합이지'],
    critic: ['시상식의 권위에 대한 가장 우아한 질문', '퍼포먼스로서 완벽했다'],
    meme: ['[속보] {stage}, 시상식서 트로피 즉석 경매… 낙찰자 정체는?'],
    hater: ['관종 끝판왕']
  }
});
