/* =========================================================
 *  발매 리워크: 발매 캠페인(날짜·경쟁작·선공개·뮤비·피지컬·쇼케이스),
 *  A&R 예측, 첫 주 성적 리포트, 써클 앨범 차트, 커버 디자이너
 * ========================================================= */

/* ---------- 데이터 ---------- */
const PHYSICAL = [
  { id: 'none', name: '디지털 전용', qty: 0, unit: 0, price: 0, desc: '음원만 발매합니다.' },
  { id: 'cd', name: 'CD 1,000장', qty: 1000, unit: 7000, price: 16000, desc: '소량 한정반. 찐팬용.' },
  { id: 'cdbook', name: 'CD 5,000장 + 포토북', qty: 5000, unit: 9000, price: 23000, desc: '팬덤을 위한 정규 사양.' },
  { id: 'lp', name: '한정판 LP 2,000장', qty: 2000, unit: 28000, price: 48000, desc: '마니아와 평단이 좋아하는 바이닐. 평단 신뢰도 소폭 상승.' },
  { id: 'mass', name: '대량 50,000장 + 랜덤 포토카드', qty: 50000, unit: 6000, price: 19000, desc: '아이돌식 대량 생산. 다 못 팔면 재고 폭탄.' }
];
const PHYS_CURVE = [0.55, 0.2, 0.1, 0.07, 0.05, 0.03];
function showcaseCost() { return Math.round((2000000 + S.player.fame * S.player.fame * 1500) / 100000) * 100000; }

const COVER_PATTERNS = { gradient: '그라데이션', solid: '단색', stripes: '스트라이프', dots: '도트', grid: '그리드', sunset: '선셋', split: '분할' };
const COVER_FONTS = { sans: '고딕', serif: '명조', hand: '손글씨', mono: '타자기' };
const COVER_LAYOUTS = { bottom: '아래', center: '가운데', top: '위', none: '글자 없음' };
function coverBackground(c) {
  const a = c.c1 || '#7c3aed', b = c.c2 || '#ec4899';
  switch (c.pattern) {
    case 'solid': return a;
    case 'stripes': return `repeating-linear-gradient(45deg, ${a} 0 12px, ${b} 12px 24px)`;
    case 'dots': return `radial-gradient(${b} 22%, transparent 23%) 0 0/14px 14px, ${a}`;
    case 'grid': return `linear-gradient(${b} 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, ${b} 1px, transparent 1px) 0 0/12px 12px, ${a}`;
    case 'sunset': return `radial-gradient(circle at 50% 115%, ${b} 0 38%, ${a} 39%)`;
    case 'split': return `linear-gradient(90deg, ${a} 50%, ${b} 50%)`;
    default: return `linear-gradient(135deg, ${a}, ${b})`;
  }
}
const COVER_FONT_CSS = { sans: 'inherit', serif: '"Nanum Myeongjo","Noto Serif KR",Georgia,serif', hand: '"Nanum Pen Script","Comic Sans MS",cursive', mono: '"Courier New",monospace' };

/* ---------- 대형 컴백 예고 (발매일 경쟁) ---------- */
function scheduleNpcComebacks(t) {
  S.npcs.forEach(n => {
    if (n.role !== 'artist' || n.scheduledT || n.fame < 68 || n.debutYear > yearOf(t)) return;
    if (t - n.lastRelT < 8 || (n.banUntil || 0) > t) return;
    if (R() < (n.region === 'GLOBAL' ? 0.02 : 0.03)) {
      n.scheduledT = t + rint(3, 9);
      if (n.region === 'KR' || n.fame >= 88) addNews(`📅 ${n.name}, ${n.scheduledT - t}주 뒤 컴백 예고`, 'npc');
    }
  });
}
// 해당 주에 발매하면 겹치는 대형 아티스트들
function competitionAt(weekT) {
  const rivals = S.npcs.filter(n => n.role === 'artist' && n.fame >= 62 &&
    ((n.scheduledT && Math.abs(n.scheduledT - weekT) <= 1) || (!n.scheduledT && n.lastRelT >= weekT - 1 && n.lastRelT <= weekT)));
  const kr = rivals.filter(n => n.region === 'KR'), gl = rivals.filter(n => n.region === 'GLOBAL');
  const dom = clamp(1 / (1 + sum(kr.map(n => Math.max(0, n.fame - 60) / 110))), 0.6, 1);
  const glob = clamp(1 / (1 + sum(gl.map(n => Math.max(0, n.fame - 70) / 110))), 0.6, 1);
  return { rivals: rivals.sort((a, b) => b.fame - a.fame), dom, glob };
}

/* ---------- 비용 ---------- */
function releasePlanCost(o) {
  const n = Math.max(1, (o.trackIds || []).length);
  const prod = productionCost(o.type, n);
  const ph = PHYSICAL.find(x => x.id === (o.physical || 'none')) || PHYSICAL[0];
  const c = {
    prod: prod.pay, prodFull: prod.full, prodWho: prod.who,
    promo: o.type === 'mixtape' ? 0 : PROMO_OPTIONS[o.promo || 0].cost,
    mv: o.mv != null && o.mv >= 0 ? MV_BUDGETS[o.mv].cost : 0,
    phys: ph.qty * ph.unit,
    show: o.showcase ? showcaseCost() : 0,
    saj: o.sajaegi ? 30000000 : 0
  };
  c.total = c.prod + c.promo + c.mv + c.phys + c.show + c.saj;
  return c;
}

/* ---------- A&R 예측 ---------- */
function arForecast(o) {
  const p = S.player;
  const tracks = (o.trackIds || []).map(song).filter(Boolean);
  if (!tracks.length) return null;
  const titleT = tracks.find(t => t.id === o.titleTrackId) || tracks[0];
  const ws = tracks.map(t => t === titleT ? 2 : 1);
  const q = sum(tracks.map((t, i) => t.quality * ws[i])) / sum(ws);
  const coh = computeCohesion(tracks, o.concept || '', o.type);
  const single = o.type === 'single';
  let est = (single ? q : q * 0.74 + coh * 0.26) + D().critic + p.cred * 0.3 - 2;
  const mq = avg(tracks.map(t => t.quality));
  const fillers = tracks.length >= 4 ? tracks.filter(t => t.quality < mq - 15) : [];
  est -= Math.min(6, fillers.length * 1.5);
  const weekT = S.t + (o.weekOffset != null ? o.weekOffset : prepWeeks(o.type));
  const comp = competitionAt(weekT);
  const lab = myActiveLabel();
  const promo = PROMO_OPTIONS[o.promo || 0];
  const reach = (1500 + Math.pow(p.fame, 2.25) * 32 + Math.sqrt(totalFollowers()) * 25) * D().stream * promo.mult * (lab ? lab.promo : 1) * comp.dom * (1 + p.hype / 100);
  const fw = reach * (0.3 + titleT.attrs.hook / 100 * 1.1 + titleT.quality / 100 * 0.4) * (o.type === 'album' ? 1.15 : 1) * (o.showcase ? 1.12 : 1);
  const melon = S.charts.melon || [];
  const v100 = melon.length >= 100 ? melon[99].value : 30000, v10 = melon[9] ? melon[9].value : 400000, v1 = melon[0] ? melon[0].value : 1e6;
  const chart = fw >= v1 ? '멜론 1위 도전' : fw >= v10 ? '멜론 TOP 10 유력' : fw >= v100 ? '멜론 TOP 100 진입 가능' : '차트인은 어려움';
  const notes = [];
  const best = tracks.slice().sort((a, b) => b.quality - a.quality)[0];
  if (best !== titleT && best.quality - titleT.quality >= 8) notes.push(`타이틀로는 「${best.title}」이(가) 더 낫다는 의견이 많습니다.`.replace('이(가)', josa(best.title, '이')));
  if (titleT.attrs.hook >= 78) notes.push(`「${titleT.title}」 훅이 강력합니다. 바이럴 가능성이 있어요.`);
  if (!single && coh < 55) notes.push('곡들이 따로 놉니다. 장르·주제·스타일을 맞추면 응집력이 오릅니다.');
  if (fillers.length) notes.push(`필러로 보이는 곡이 있습니다: ${fillers.map(f => `「${f.title}」`).join(', ')}`);
  if (tracks.filter(t => t.feats.length).length / tracks.length > 0.5 && tracks.length > 2) notes.push('피처링이 너무 많습니다. 평단이 싫어할 수 있어요.');
  if (titleT.style && isHot(titleT.style)) notes.push(`${titleT.style}은(는) 올해 트렌드라 스트리밍엔 유리하지만, 평단은 편승을 꼬집을 겁니다.`.replace('은(는)', josa(titleT.style, '은')));
  if (comp.rivals.length) notes.push(`같은 시기 ${comp.rivals.slice(0, 3).map(n => n.name).join(', ')} 컴백과 겹칩니다. 관심이 분산될 수 있어요.`);
  if (!notes.length) notes.push('특별한 약점이 보이지 않습니다. 자신 있게 내보내세요.');
  return { low: Math.round(clamp(est - 7, 5, 99)), high: Math.round(clamp(est + 6, 5, 99)), est: Math.round(est), coh, firstWeek: Math.round(fw), chart, notes, comp };
}

/* ---------- 발매 예약 ---------- */
function computeSingleBases(s, roleMult, comp) {
  const p = S.player, lab = myActiveLabel();
  const reach = (1500 + Math.pow(p.fame, 2.25) * 32 + Math.sqrt(totalFollowers()) * 25) * (lab ? lab.promo : 1) * D().stream * comp.dom;
  const glob = (300 + Math.pow(p.globalFame, 2.4) * 350 + Math.sqrt(p.followers.youtube) * 40) * D().stream * comp.glob;
  const tm = 0.3 + s.attrs.hook / 100 * 1.1 + s.quality / 100 * 0.4;
  s.domBase = reach * tm * roleMult; s.globBase = glob * tm * roleMult;
  s.decay = clamp(0.78 + s.attrs.hook * 0.0012 + s.quality * 0.0007, 0.74, 0.935);
}
function preReleaseSong(s, albumTitle) {
  computeSingleBases(s, 0.8, competitionAt(S.t + 1));
  s.startT = S.t + 1; s.releaseId = 'pre'; s.preRelease = true; s.role = 'title';
  S.player.hype = clamp(S.player.hype + 5, 0, 60);
  addNews(`🎧 ${S.player.stage}, 『${albumTitle}』 선공개곡 「${s.title}」 공개`, 'release');
  react('pre_release', 4, { title: s.title, album: albumTitle });
}

// UI에서 부르는 발매: 준비 기간이 있으면 예약, 없으면 즉시 발매
function scheduleRelease(opts) {
  const p = S.player;
  if (S.pendingRelease) return { ok: false, msg: `이미 『${S.pendingRelease.opts.title}』 발매를 준비 중입니다.` };
  if (onHiatus()) return { ok: false, msg: '지금은 발매할 수 없습니다.' };
  if (opts.type === 'album' && !albumUnlocked()) return { ok: false, msg: '정규 앨범은 EP를 한 장 이상 내거나 국내 인지도 25 이상이 되어야 낼 수 있습니다.' };
  const [mn, mx] = releaseRules(opts.type);
  const tracks = opts.trackIds.map(song).filter(Boolean);
  if (!opts.title || !opts.title.trim()) return { ok: false, msg: '작품 제목을 입력하세요.' };
  if (tracks.length < mn || tracks.length > mx) return { ok: false, msg: `${typeName(opts.type)}${josa(typeName(opts.type), '은')} ${mn}~${mx}곡이어야 합니다.` };
  if (opts.type === 'mixtape') { opts.promo = 0; opts.physical = 'none'; opts.mv = -1; opts.showcase = false; opts.sajaegi = false; }
  const minW = prepWeeks(opts.type);
  const offset = Math.max(minW, opts.weekOffset != null ? Math.round(opts.weekOffset) : minW);
  if (opts.preId && (offset < 2 || !opts.trackIds.includes(opts.preId) || tracks.length < 2)) opts.preId = null;
  const cost = releasePlanCost(opts);
  if (p.money < cost.total) return { ok: false, msg: `발매 비용 ${fmtMoney(cost.total)}이 필요합니다. (보유 ${fmtMoney(p.money)})` };
  p.money -= cost.total;
  opts.prepaid = true;
  opts.weekOffset = offset;
  if (!offset) {
    const res = releaseWork(opts);
    if (!res.ok) { p.money += cost.total; return res; }
    if (cost.prodFull) res.notes.unshift(cost.prod ? `💸 제작비(믹싱·마스터링·유통) ${fmtMoney(cost.prod)}` : `🏢 제작비 ${fmtMoney(cost.prodFull)}${josa(fmtMoney(cost.prodFull), '은')} ${cost.prodWho}에서 부담했습니다.`);
    save();
    return res;
  }
  tracks.forEach(s => { if (s.id !== opts.preId) s.reserved = true; });
  S.pendingRelease = { opts, releaseT: S.t + offset, startT: S.t, cost: cost.total };
  if (opts.preId) preReleaseSong(song(opts.preId), opts.title.trim());
  p.hype = clamp(p.hype + 6, 0, 60);
  addNews(`📅 ${p.stage}, ${typeName(opts.type)} 『${opts.title.trim()}』 ${offset}주 뒤 발매 예고`, 'release');
  react('post_teaser', 4, { title: opts.title.trim() });
  save();
  return { ok: true, scheduled: true, msg: `『${opts.title.trim()}』 발매를 ${offset}주 뒤로 예약했습니다. 총 비용 ${fmtMoney(cost.total)}.${opts.preId ? ` 선공개곡 「${song(opts.preId).title}」${josa(song(opts.preId).title, '이')} 다음 주부터 스트리밍됩니다.` : ''}` };
}
function cancelPendingRelease() {
  const pr = S.pendingRelease;
  if (!pr) return { ok: false, msg: '예약된 발매가 없습니다.' };
  pr.opts.trackIds.map(song).filter(Boolean).forEach(s => { s.reserved = false; });
  S.pendingRelease = null;
  S.player.sentiment = clamp(S.player.sentiment - 4, 0, 100);
  addNews(`😢 ${S.player.stage}, 『${pr.opts.title}』 발매 연기… 팬들 실망`, 'bad');
  // 선공개곡은 싱글로 남는다
  const pre = pr.opts.preId && song(pr.opts.preId);
  if (pre && pre.preRelease) releaseWork({ type: 'single', title: pre.title, trackIds: [pre.id], titleTrackId: pre.id, cover: pr.opts.cover, prepaid: true });
  save();
  return { ok: true, msg: '발매를 취소했습니다. 이미 쓴 비용은 돌아오지 않고, 팬들이 실망했습니다.' };
}
function pendingReleaseWeekly(summary) {
  const pr = S.pendingRelease;
  if (!pr) return;
  const p = S.player;
  if (S.t < pr.releaseT) { p.hype = clamp(p.hype + 3, 0, 60); return; }
  if (onHiatus()) { pr.releaseT = S.t + 1; return; }
  pr.opts.trackIds.map(song).filter(Boolean).forEach(s => { s.reserved = false; });
  S.pendingRelease = null;
  const res = releaseWork(pr.opts);
  if (!res.ok) { summary.events.push(`⚠️ 예약된 발매가 실패했습니다: ${res.msg}`); return; }
  summary.release = { id: res.release.id, notes: res.notes };
  summary.events.push(`💿 『${res.release.title}』 발매! 평단 지수 ${res.release.critic}`);
}

/* ---------- releaseWork 훅 ---------- */
// 리뷰 직후: 쇼케이스는 언론 노출로 일부 매체 점수를 조금 올린다
function releaseExtrasPre(rel, tracks, opts) {
  rel.plan = { physical: opts.physical || 'none', mv: opts.mv != null ? opts.mv : -1, showcase: !!opts.showcase, pre: opts.preId || null, weekOffset: opts.weekOffset || 0 };
  if (!opts.showcase) return;
  rel.reviews.forEach(r => {
    if (r.outlet !== 'wave' && r.outlet !== 'izm') return;
    const o = OUTLETS.find(x => x.id === r.outlet);
    r.s100 = Math.min(99, r.s100 + 2);
    const d = displayScore(o, r.s100); r.display = d.text; r.value = d.value;
    if (r.outlet === 'izm' && d.value >= 4) r.badge = 'IZM 추천';
  });
  rel.critic = Math.round(avg(rel.reviews.map(r => r.s100)));
}
// 스트리밍 기반값이 정해진 뒤: 경쟁작, 뮤비, 피지컬, 쇼케이스
function releaseExtrasPost(rel, tracks, opts, notes) {
  const p = S.player;
  const fresh = tracks.filter(s => s.startT === S.t + 1);
  const comp = competitionAt(S.t);
  if (comp.dom < 0.97 || comp.glob < 0.97) {
    fresh.forEach(s => { s.domBase *= comp.dom; s.globBase *= comp.glob; });
    notes.push(`⚔️ 같은 시기 ${comp.rivals.slice(0, 3).map(n => n.name).join(', ')} 컴백과 겹쳐 관심이 분산됐습니다. (국내 -${Math.round((1 - comp.dom) * 100)}%)`);
  }
  if (opts.showcase) { fresh.forEach(s => { s.domBase *= 1.12; }); p.buzz += 5; addNews(`🎤 ${p.stage} 『${rel.title}』 발매 기념 쇼케이스 성료`, 'info'); notes.push('🎤 쇼케이스로 언론 노출이 늘었습니다.'); }
  if (opts.mv != null && opts.mv >= 0 && rel.type !== 'mixtape') {
    const mvb = MV_BUDGETS[opts.mv], s = song(rel.titleTrackId);
    s.boost += mvb.boost * (0.7 + s.attrs.hook / 100);
    s.globBase *= 1 + mvb.boost * 0.15;
    p.gLegacy += mvb.boost * 0.4;
    const yt = Math.round(mvb.boost * (8000 + p.fame * 600));
    p.followers.youtube += yt;
    const comments = react('post_mv', 4, { title: s.title }, { src: 'post', weights: { global: 2 } });
    S.posts.unshift({ id: uid('p'), t: S.t, platform: 'youtube', type: 'mv', typeName: '뮤직비디오', text: `「${s.title}」 Official MV`, likes: Math.round(p.followers.youtube * rnd(0.3, 0.9) * (1 + mvb.boost)), newF: yt, comments, songName: s.title, viral: false });
    notes.push(`🎬 「${s.title}」 뮤직비디오 공개 (${mvb.label})`);
  }
  const ph = PHYSICAL.find(x => x.id === (opts.physical || 'none'));
  if (ph && ph.qty) {
    let demand = (coreFans() * 0.25 + totalFollowers() * 0.008 + Math.pow(p.fame, 2.2) * 4) * (1 + p.hype / 100);
    demand *= rel.type === 'album' ? 1.25 : rel.type === 'single' ? 0.6 : 1;
    if (ph.id === 'lp') demand *= 0.5;
    if (ph.id === 'mass' && (rel.genre === '팝' || tracks.some(t => t.style === 'K-팝 아이돌'))) demand *= 1.6;
    if (S.fandom) demand *= 1.2;
    const sold = Math.round(Math.min(ph.qty, demand * rnd(0.75, 1.25)));
    rel.physical = { id: ph.id, name: ph.name, qty: ph.qty, price: ph.price, total: sold, sold: 0, plan: PHYS_CURVE.map(f => Math.round(sold * f)) };
    if (ph.id === 'lp') p.cred += 0.5;
    notes.push(`💿 ${ph.name} 제작 — 예상 판매 ${fmtNum(sold)}장${sold < ph.qty * 0.6 ? ` (재고 ${fmtNum(ph.qty - sold)}장 남을 듯)` : sold >= ph.qty ? ' (완판 예상!)' : ''}`);
  }
}

/* ---------- 매주: 피지컬 판매 · 첫 주 리포트 ---------- */
function physicalWeekly(summary) {
  const p = S.player;
  S.releases.forEach(r => {
    r.physWeek = 0;
    if (!r.physical) return;
    const start = Math.max(...r.trackIds.map(song).map(s => s.startT || 0));
    const age = S.t - start;
    if (age < 0 || age >= r.physical.plan.length) return;
    const n = r.physical.plan[age];
    r.physWeek = n; r.physical.sold += n;
    const lab = p.label ? labelOf(p.label) : null;
    const rev = Math.round(n * r.physical.price * 0.45 * (lab ? lab.share : 1));
    p.money += rev; summary.income += rev; S.yearIncome[yearOf(S.t)] = (S.yearIncome[yearOf(S.t)] || 0) + rev;
    if (age === r.physical.plan.length - 1 && r.physical.sold >= r.physical.qty) addMilestone('sold_out_' + r.id, `『${r.title}』 ${r.physical.name} 완판`);
  });
}
function npcSales(r) {
  if (r.salesBase === undefined) {
    const n = npc(r.artistId);
    const f = n ? n.fame : 40;
    r.salesBase = Math.round(Math.pow(f, 2.6) * 0.08 * (r.genre === '팝' ? 18 : 1) * (r.type === 'album' ? 1.3 : 1) * rnd(0.6, 1.3));
  }
  const age = S.t - r.t;
  return age < 0 || age > 14 ? 0 : Math.round(r.salesBase * (r.type === 'single' ? 0.15 : 1) * Math.pow(0.5, age));
}
function buildCircleChart(meta) {
  const p = S.player;
  const list = [];
  S.npcReleases.forEach(r => { if (r.region === 'KR' && (r.type !== 'single' || r.genre === '팝')) { const v = npcSales(r); if (v >= 30) list.push({ key: r.id, title: r.title, artist: artistName(r.artistId), value: v, isPlayer: false }); } });
  S.releases.forEach(r => { if (r.physWeek > 0) list.push({ key: r.id, title: r.title, artist: r.compName || p.stage, value: r.physWeek, isPlayer: true, ref: r }); });
  const prev = {}; ((S.charts && S.charts.circle) || []).forEach((e, i) => prev[e.key] = i + 1);
  return list.sort((a, b) => b.value - a.value).slice(0, 50).map((e, i) => {
    const mk = 'circle:' + e.key; const m = meta[mk] || (meta[mk] = { weeks: 0, peak: 999 });
    m.weeks++; m.peak = Math.min(m.peak, i + 1);
    if (e.isPlayer) {
      e.ref.peakCircle = Math.min(e.ref.peakCircle || 999, i + 1);
      if (i === 0) addMilestone('circle1', `써클 앨범 차트 1위 (『${e.title}』)`);
    }
    const o = Object.assign({}, e, { prev: prev[e.key] || null, peak: m.peak, weeks: m.weeks }); delete o.ref; return o;
  });
}
function firstWeekReports(summary) {
  const p = S.player;
  S.releases.forEach(r => {
    if (r.firstWeek) return;
    const tr = r.trackIds.map(song).filter(Boolean);
    if (!tr.length) return;
    const start = Math.max(...tr.map(s => s.startT || 0));
    if (start !== S.t) return;
    const rankIn = (list, keys) => { let best = null; (list || []).forEach((e, i) => { if (keys.includes(e.key) && (best === null || i + 1 < best)) best = i + 1; }); return best; };
    const keys = tr.map(s => s.id);
    const fw = {
      dom: Math.round(sum(tr.map(s => s.dom))), glob: Math.round(sum(tr.map(s => s.glob))),
      melon: rankIn(S.charts.melon, keys), hot: rankIn(S.charts.hot100, keys),
      bb: rankIn(S.charts.bb200, [r.id]), circle: rankIn(S.charts.circle, [r.id]), phys: r.physWeek || 0,
      top: tr.slice().sort((a, b) => (b.dom + b.glob) - (a.dom + a.glob))[0].title
    };
    r.firstWeek = fw;
    (summary.firstWeek = summary.firstWeek || []).push(r.id);
    addNews(`📊 ${p.stage} 『${r.title}』 첫 주: 스트리밍 ${fmtNum(fw.dom + fw.glob)}${fw.melon ? ` · 멜론 최고 ${fw.melon}위` : ''}${fw.phys ? ` · 음반 ${fmtNum(fw.phys)}장` : ''}`, 'chart');
  });
}

/* ---------- 반응 ---------- */
Object.assign(REACTIONS, {
  pre_release: {
    core: ['선공개 「{title}」부터 이 정도면 『{album}』 명반 확정', '「{title}」 무한 반복하면서 앨범 기다리는 중', '선공개곡 미쳤다 ㅠㅠ 발매일 언제 와'],
    casual: ['「{title}」 좋네 앨범 나오면 들어봐야지'],
    critic: ['선공개곡이 앨범 전체의 방향을 예고한다', '「{title}」만으로 앨범을 판단하긴 이르다'],
    hater: ['선공개곡이 별로면 앨범도 뻔하지 ㅋ']
  }
});
