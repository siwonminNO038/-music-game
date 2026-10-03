/* =========================================================
 *  자유도 확장: 트렌드, 디스전, 범죄·재판, 세금, 개명/장르 전향
 *  (game.js 다음에 로드)
 * ========================================================= */

/* ---------- 트렌드 ---------- */
function rollTrends(y) {
  const all = [];
  Object.keys(STYLES).forEach(g => STYLES[g].forEach(s => all.push({ genre: g, style: s.name })));
  const sh = shuffle(all);
  const hot = [], cold = [];
  sh.forEach(x => { if (hot.length < 4 && (x.genre === '힙합' ? R() < 0.7 : R() < 0.35)) hot.push(x); });
  sh.filter(x => !hot.includes(x)).slice(0, 3).forEach(x => cold.push(x));
  S.trends = { year: y, hot, cold };
  addNews(`🔥 ${y} 트렌드: ${hot.map(h => h.style).join(', ')} 강세 · ${cold.map(c => c.style).join(', ')} 침체`, 'info');
}
function isHot(style) { return !!(S.trends && S.trends.hot.some(h => h.style === style)); }
function isCold(style) { return !!(S.trends && S.trends.cold.some(h => h.style === style)); }

/* ---------- 상태 헬퍼 ---------- */
function onHiatus() { const p = S.player; return !!(p.military || p.prison); }
function isBanned() { return (S.player.banUntil || 0) > S.t; }
function isBoycotted() { return (S.player.boycottUntil || 0) > S.t; }
function inReflection() { return (S.player.reflectUntil || 0) > S.t; }
function activeWars() { return (S.wars || []).filter(w => w.status === 'active'); }
function inWar(npcId) { return activeWars().find(w => w.npcId === npcId) || null; }

/* =========================================================
 *  디스전
 * ========================================================= */
// 디스곡의 대상(유형+ID)을 실제 상대 아티스트 목록으로 바꾼다
function dissTargets(type, id) {
  const p = S.player;
  const krArtists = S.npcs.filter(n => n.region === 'KR' && n.role === 'artist' && n.debutYear <= yearOf(S.t));
  switch (type) {
    case 'artist': return npc(id) ? [npc(id)] : [];
    case 'label': return krArtists.filter(n => n.label === id).sort((a, b) => b.fame - a.fame).slice(0, 3);
    case 'crew': return krArtists.filter(n => n.crew === id).sort((a, b) => b.fame - a.fame).slice(0, 3);
    case 'scene': return krArtists.filter(n => n.genre === '힙합' && n.crew !== p.crew && n.label !== 'mylabel').sort((a, b) => b.fame - a.fame).slice(0, 5);
  }
  return [];
}
function dissTargetName(d) {
  if (d.type === 'artist') return artistName(d.id);
  if (d.type === 'label') return (labelOf(d.id) || {}).name || '레이블';
  if (d.type === 'crew') return (crewOf(d.id) || {}).name || '크루';
  return DISS_TARGET_TYPES[d.type];
}

function npcDissScore(n) {
  const tb = { '독설가': 7, '장인': 4, '카리스마': 3, '허세': -2, '감성적': -3, '유쾌함': 0, '신비주의': 1, '까칠함': 3 }[n.trait] || 0;
  return clamp(n.skill * 0.92 + tb + rnd(-9, 9) + (R() < 0.25 ? 6 : 0), 20, 99);
}
function playerDissScore(s, d, targetName) {
  const a = s.attrs, lv = DISS_LEVELS[d.level] || DISS_LEVELS.light;
  let sc = a.lyric * 0.42 + a.perf * 0.3 + a.hook * 0.13 + a.originality * 0.15 + lv.score + rnd(-8, 8);
  const punch = (d.punch || '').trim();
  if (punch.length >= 8) sc += 3;
  if (targetName && punch.includes(targetName)) sc += 3;
  return clamp(sc, 10, 99);
}

function newWar(n, source) {
  const w = { id: uid('w'), npcId: n.id, startT: S.t, rounds: [], momentum: 0, status: 'active', awaiting: 'npc', deadline: S.t + 6, source };
  S.wars.unshift(w);
  return w;
}

// 디스곡 발매 처리 (releaseWork에서 호출)
function processDissRelease(tracks, notes) {
  const p = S.player;
  tracks.filter(s => s.diss).forEach(s => {
    const d = s.diss, lv = DISS_LEVELS[d.level] || DISS_LEVELS.light;
    const tname = dissTargetName(d);
    p.buzz += 6 * lv.buzz;
    p.sentiment = clamp(p.sentiment + lv.sentiment, 0, 100);
    if (d.punch) addNews(`🔥 ${p.stage} 「${s.title}」 속 펀치라인 화제: "${d.punch.slice(0, 40)}"`, 'info');
    if (d.type === 'critics') {
      S.flags.criticGrudge = S.t + 52; p.cred += 1; p.buzz += 6;
      addNews(`🗞️ ${p.stage}, 신곡 「${s.title}」으로 평론가들 정면 저격`, 'info');
      react('post_diss', 4, { npc: '리드머' }, { weights: { critic: 3, meme: 2 } });
      notes.push('🗞️ 평론가들을 저격했습니다. 1년간 리드머·IZM의 점수가 짜지지만, 고인물들은 열광합니다.');
      return;
    }
    if (d.type === 'tv') {
      S.flags.tvGrudge = true; p.cred += 1.5; p.buzz += 8;
      addNews(`📺 ${p.stage}, 「${s.title}」에서 오디션 프로그램 직격`, 'info');
      react('post_diss', 4, { npc: '방송국' }, { weights: { old: 3, critic: 2 } });
      notes.push('📺 방송가를 저격했습니다. 오디션·방송 섭외가 끊기지만 언더 신뢰도가 오릅니다.');
      return;
    }
    const targets = dissTargets(d.type, d.id);
    if (!targets.length) return;
    if (d.type === 'scene') { react('diss_scene', 6, {}, {}); addMilestone('control', `씬 전체 저격곡 「${s.title}」`); }
    targets.forEach(n => {
      let w = inWar(n.id);
      if (!w) { w = newWar(n, 'player'); w.multi = targets.length > 1; }
      const sc = playerDissScore(s, d, n.name);
      const last = w.rounds.filter(r => r.by === 'npc').slice(-1)[0];
      w.rounds.push({ by: 'player', title: s.title, score: Math.round(sc), t: S.t, punch: d.punch || '', level: d.level });
      w.momentum = clamp(w.momentum + (sc - (last ? last.score : 62)) * 0.9 + 6, -100, 100);
      w.awaiting = 'npc'; w.deadline = S.t + 6;
      n.rel = clamp(n.rel - 20, 0, 100);
      addNews(`⚔️ ${p.stage}, 디스곡 「${s.title}」으로 ${n.name} 저격 (커뮤니티 투표 ${pollOf(w)}% 우세)`, 'info');
      react('diss_round', 3, { npc: n.name }, { weights: { meme: 2, rival: 2 } });
      // 금기 수위는 명예훼손 고소 위험
      if (R() < lv.sue * (n.trait === '까칠함' || n.trait === '독설가' ? 1.4 : 1)) {
        commitCrime('defamation', { npcId: n.id, songId: s.id }, true);
        notes.push(`⚖️ ${n.name} 측이 「${s.title}」 가사를 문제 삼아 명예훼손 소송을 예고했습니다.`);
      }
      checkWarEnd(w);
    });
    notes.push(`⚔️ 디스곡 「${s.title}」 발매! 대상: ${tname}`);
  });
}
function pollOf(w) { return Math.round(clamp(50 + w.momentum / 2, 3, 97)); }

function npcRound(w, opening) {
  const p = S.player, n = npc(w.npcId);
  const sc = npcDissScore(n);
  const last = w.rounds.filter(r => r.by === 'player').slice(-1)[0];
  const used = new Set(w.rounds.map(r => r.title));
  const title = pick(DISS_TRACK_TITLES.filter(x => !used.has(x)));
  const line = fill(pick(DISS_NPC_LINES), { stage: p.stage });
  w.rounds.push({ by: 'npc', title, score: Math.round(sc), t: S.t, punch: line });
  w.momentum = clamp(w.momentum - (sc - (last ? last.score : 62)) * 0.9 - 6, -100, 100);
  w.awaiting = 'player'; w.deadline = S.t + 6;
  p.buzz += 5;
  addNews(`⚔️ ${n.name}, ${opening ? `${p.stage} 저격곡` : '답디스'} 「${title}」 공개 — 가사 ${line}`, 'bad');
  react('diss_npc_round', 3, { npc: n.name }, { weights: { meme: 2, rival: 2 } });
  addInbox({
    type: 'diss', title: `⚔️ ${n.name}의 ${opening ? '디스곡' : '답디스'} 「${title}」`,
    text: `${n.name}${josa(n.name, '이')} ${opening ? '당신을 저격하는 곡을' : '답장을'} 냈습니다. 화제의 가사: ${line}\n커뮤니티 투표: ${p.stage} ${pollOf(w)}% vs ${n.name} ${100 - pollOf(w)}%\n6주 안에 응수하지 않으면 패배로 간주됩니다.`,
    data: { npcId: n.id, npcName: n.name, warId: w.id }, expires: S.t + 6
  });
  checkWarEnd(w);
}

function npcStartsWar(n) {
  const w = newWar(n, 'npc');
  n.rel = clamp(n.rel - 20, 0, 100);
  npcRound(w, true);
}

function warSns(n, text) {
  // SNS 장외전: 진행 중인 디스전이면 여론만 살짝 움직이고, 아니면 상대가 디스곡으로 응수할 수 있다
  let w = inWar(n.id);
  if (w) {
    const delta = rnd(-6, 10) + (text && text.length > 30 ? 3 : 0);
    w.momentum = clamp(w.momentum + delta, -100, 100);
    return delta >= 0 ? `📱 장외전에서 여론이 조금 유리해졌습니다. (투표 ${pollOf(w)}%)` : `📱 장외전 발언이 역풍을 맞았습니다. (투표 ${pollOf(w)}%)`;
  }
  if (R() < 0.45 + (n.trait === '독설가' || n.trait === '허세' ? 0.25 : 0)) {
    npcStartsWar(n);
    return `🔥 ${n.name}${josa(n.name, '이')} 디스곡으로 응수했습니다! 디스전이 시작됐습니다.`;
  }
  return `${n.name}${josa(n.name, '은')} 아직 반응이 없습니다.`;
}

function warsWeekly(summary) {
  const p = S.player;
  if (onHiatus()) { activeWars().forEach(w => w.deadline++); return; }
  activeWars().forEach(w => {
    const n = npc(w.npcId);
    if (!n) { w.status = 'truce'; return; }
    if (w.awaiting === 'npc') {
      const tm = { '독설가': 1.6, '허세': 1.3, '까칠함': 1.3, '카리스마': 1, '장인': 0.8, '유쾌함': 0.7, '감성적': 0.5, '신비주의': 0.4 }[n.trait] || 1;
      const ignoreBig = (n.fame > p.fame + 30 ? 0.35 : 1) * (w.multi ? 0.45 : 1);
      if (S.t - (w.rounds.slice(-1)[0] || { t: S.t }).t >= 1 && R() < 0.3 * tm * ignoreBig) { npcRound(w, false); return; }
      if (S.t > w.deadline) {
        if (w.rounds.some(r => r.by === 'player')) {
          summary.events.push(`🤐 ${n.name}${josa(n.name, '이')} 끝내 답하지 않았습니다. 디스전 승리!`);
          endWar(w, 'won', '상대의 무응답');
        } else endWar(w, 'truce', '흐지부지');
      }
    } else if (w.awaiting === 'player' && S.t > w.deadline) {
      summary.events.push(`🏳️ ${n.name}의 디스에 응수하지 않아 디스전에서 패배했습니다.`);
      endWar(w, 'lost', '무응답');
    }
    // 오래 끈 전쟁은 화해 제안이 오기도 한다
    if (w.status === 'active' && w.rounds.length >= 3 && R() < 0.06 && !S.inbox.some(m => m.type === 'truce' && m.data.warId === w.id)) {
      addInbox({ type: 'truce', title: `🤝 ${n.name}의 화해 제안`, text: `${n.name}: ${pick(DISS_TRUCE_LINES)}`, data: { warId: w.id, npcId: n.id }, expires: S.t + 3 });
    }
  });
}

function checkWarEnd(w) {
  if (w.status !== 'active') return;
  if (Math.abs(w.momentum) >= 70 || w.rounds.length >= 6) endWar(w, w.momentum >= 0 ? 'won' : 'lost', Math.abs(w.momentum) >= 70 ? 'KO' : '판정');
}

function endWar(w, result, how) {
  const p = S.player, n = npc(w.npcId);
  w.status = result; w.endT = S.t; w.how = how;
  S.inbox = S.inbox.filter(m => !(m.data && m.data.warId === w.id));
  const k = w.multi ? 0.4 : 1; // 씬 전체/단체 저격은 한 명당 보상이 작다
  if (result === 'won') {
    p.buzz += (14 + n.fame / 5) * k; p.legacy += 1.5 * k; p.cred += 1.5 * k;
    p.followers.x += Math.round((4000 + n.fame * 400) * k); p.followers.insta += Math.round((2000 + n.fame * 200) * k);
    n.fame = clamp(n.fame - 3, 4, 99);
    addNews(`🏆 디스전 종결: ${p.stage} 승리 vs ${n.name} (${how})`, 'good');
    addStory(`${n.name}${josa(n.name, '과')}의 디스전. 결과는 ${how === 'KO' ? 'KO 승' : '승리'}였다. 커뮤니티는 한동안 이 얘기뿐이었다.`, 'story');
    react('diss_war', 5, { npc: n.name }, { weights: { meme: 2, critic: 2 } });
    addMilestone('diss_win', `디스전 승리 (vs ${n.name})`);
  } else if (result === 'lost') {
    p.buzz += 5; p.sentiment = clamp(p.sentiment - 5, 0, 100); p.cred -= 1;
    n.fame = clamp(n.fame + 2, 4, 99);
    addNews(`😓 디스전 종결: ${n.name} 승리, ${p.stage} 체면 구겨 (${how})`, 'bad');
    addStory(`${n.name}${josa(n.name, '과')}의 디스전에서 졌다. 쓰라렸지만, 더 날카로워져야 할 이유가 생겼다.`, 'story');
    react('diss_lose', 4, { npc: n.name });
    p.inspiration = (p.inspiration || []).filter(x => x.theme !== '디스');
    p.inspiration.push({ theme: '디스', bonus: 10, until: S.t + 20 });
  } else if (result === 'truce') {
    n.rel = clamp(n.rel + 30, 0, 100); p.sentiment = clamp(p.sentiment + 3, 0, 100); p.cred += 0.5;
    if (how !== '흐지부지') { addNews(`🤝 ${p.stage} & ${n.name}, 디스전 끝에 화해`, 'good'); react('diss_truce', 4, { npc: n.name }); addStory(`${n.name}${josa(n.name, '과')}의 디스전은 화해로 끝났다.`, 'story'); }
  } else if (result === 'ignored') {
    p.sentiment = clamp(p.sentiment - 3, 0, 100);
    addNews(`😶 ${p.stage}, ${n.name}의 디스에 무대응`, 'info');
  }
}

function proposeTruce(warId) {
  const w = S.wars.find(x => x.id === warId);
  if (!w || w.status !== 'active') return { ok: false, msg: '진행 중인 디스전이 아닙니다.' };
  const n = npc(w.npcId);
  const ch = clamp(0.25 + n.rel / 150 + (n.trait === '유쾌함' || n.trait === '감성적' ? 0.2 : 0) - (n.trait === '독설가' ? 0.2 : 0) + (w.rounds.length >= 3 ? 0.15 : 0), 0.05, 0.85);
  if (R() < ch) { endWar(w, 'truce', '화해'); save(); return { ok: true, msg: `${n.name}${josa(n.name, '이')} 화해를 받아들였습니다. ${pick(DISS_TRUCE_LINES)}` }; }
  w.momentum = clamp(w.momentum - 8, -100, 100); save();
  return { ok: true, msg: `${n.name}: "이제 와서? ㅋㅋ" 화해 제안이 거절당하고 여론이 불리해졌습니다.` };
}

/* =========================================================
 *  범죄 & 재판
 * ========================================================= */
function priors() { return (S.player.record || []).filter(r => r.verdict !== 'cleared').length; }

// detectNow: 즉시 사건화 (명예훼손 고소 등)
function commitCrime(type, extra = {}, detectNow = false) {
  const c = CRIMES[type];
  const cr = { id: uid('cr'), crime: type, t: S.t, until: S.t + (c.weeks || 0), detected: false, extra };
  S.crimes.push(cr);
  if (detectNow) { detectCrime(cr); return cr; }
  if (type === 'dui') {
    if (R() < 0.06) { cr.extra.accident = true; detectCrime(cr); }
    else if (R() < 0.3) detectCrime(cr);
  }
  if (type === 'assault' && R() < 0.55) detectCrime(cr);
  return cr;
}

function detectCrime(cr) {
  const p = S.player, c = CRIMES[cr.crime];
  cr.detected = true;
  const sev = c.sev + (cr.extra.accident ? 1 : 0);
  const cs = { id: uid('case'), crime: cr.crime, crId: cr.id, startT: S.t, trialT: S.t + (c.civil ? rint(3, 5) : rint(5, 9)), lawyer: 0, plea: null, status: 'investigation', sev, extra: cr.extra };
  S.cases.unshift(cs);
  const what = c.name + (cr.extra.accident ? ' (인명 사고)' : '');
  if (c.civil) {
    const who = cr.extra.npcId ? artistName(cr.extra.npcId) : '원작자';
    const amount = cr.crime === 'copyright' ? Math.round(Math.max(20000000, (cr.extra.streams || 0) * 3) / 1e6) * 1e6 : c.fine;
    cs.amount = amount;
    addNews(`⚖️ ${who} 측, ${p.stage} 상대로 ${what} 소송 제기`, 'bad');
    addInbox({ type: 'civil', title: `⚖️ ${what} 소송`, text: `${who} 측이 소송을 냈습니다. 청구액 ${fmtMoney(amount)}.\n합의하면 조용히 끝나지만, 법정에서 다투면 이길 수도, 두 배로 물어줄 수도 있습니다.`, data: { caseId: cs.id }, expires: cs.trialT });
    p.sentiment = clamp(p.sentiment + c.sentiment * 0.5, 0, 100);
    if (cr.crime === 'copyright' && cr.extra.songId) { const s = song(cr.extra.songId); if (s) { s.removed = true; s.domBase *= 0.1; s.globBase *= 0.1; } }
    save(); return;
  }
  p.sentiment = clamp(p.sentiment + c.sentiment * 0.6, 0, 100);
  p.antiRatio = clamp(p.antiRatio + 3 * sev, 0, 45);
  p.notoriety = (p.notoriety || 0) + sev * 4;
  p.buzz += 8; p.mental = clamp(p.mental - 12, 0, 100);
  p.boycottUntil = S.t + 8 * sev;
  addNews(`🚨 ${p.stage}, ${what} 혐의로 ${cr.crime === 'tax' ? '국세청 세무조사' : '경찰 조사'}`, 'bad');
  addStory(`${what} 혐의가 세상에 알려졌다. 휴대폰 알림이 멈추지 않는다.`, 'crime');
  react('crime_caught', 7);
  if (cr.crime === 'sajaegi') {
    react('chart_fraud', 4); p.cred -= 5;
    const rel = cr.extra.releaseId && release(cr.extra.releaseId);
    if (rel) rel.trackIds.map(song).forEach(s => { s.domBase *= 0.4; s.globBase *= 0.6; s.chartFraud = true; });
  }
  // 소속사·크루의 대응
  if (p.label) {
    const lab = labelOf(p.label);
    const tm = { '대형기획사': 1.3, '글로벌': 1.3, '메이저': 1.1, '중형': 0.9, '인디': 0.6 }[lab.tier] || 1;
    if (R() < c.labelDrop * tm) {
      addNews(`📉 ${lab.name}, "${p.stage}${josa(p.stage, '과')}의 전속 계약 해지"`, 'bad');
      addStory(`${lab.name}${josa(lab.name, '이')} 계약 해지를 통보했다.`, 'crime');
      p.label = null; p.contract = null;
    }
  }
  const crew = p.crew && crewOf(p.crew);
  if (crew && !crew.own && R() < 0.25 * sev) {
    addNews(`💔 크루 '${crew.name}', ${p.stage} 퇴출 결정`, 'bad');
    crewMembers(crew.id).forEach(n => n.rel = clamp(n.rel - 15, 0, 100));
    p.crew = null;
  }
  addInbox({ type: 'case', title: `🚨 ${what} 혐의 수사`, text: `${what} 혐의로 수사가 시작됐습니다. ${cs.trialT - S.t}주 뒤 결과가 나옵니다.\n혐의를 인정하고 사과하면 형량이 줄어들 수 있고, 부인하면 무혐의를 노려볼 수 있지만 실패하면 더 무거워집니다. 변호사를 선임할 수도 있습니다.`, data: { caseId: cs.id } });
  save();
}

function hireLawyer(caseId, tier) {
  const cs = S.cases.find(c => c.id === caseId);
  if (!cs || cs.status !== 'investigation') return { ok: false, msg: '진행 중인 사건이 아닙니다.' };
  const cost = tier === 2 ? 200000000 : 50000000;
  if (cs.lawyer >= tier) return { ok: false, msg: '이미 그 이상의 변호인을 선임했습니다.' };
  if (S.player.money < cost) return { ok: false, msg: `수임료 ${fmtMoney(cost)}이 부족합니다.` };
  S.player.money -= cost; cs.lawyer = tier; save();
  return { ok: true, msg: tier === 2 ? '⚖️ 대형 로펌 전관 변호인단을 선임했습니다.' : '⚖️ 형사 전문 변호사를 선임했습니다.' };
}
function setPlea(caseId, plea) {
  const cs = S.cases.find(c => c.id === caseId);
  if (!cs || cs.status !== 'investigation') return { ok: false, msg: '진행 중인 사건이 아닙니다.' };
  if (cs.plea) return { ok: false, msg: '이미 입장을 밝혔습니다.' };
  cs.plea = plea;
  const p = S.player;
  if (plea === 'admit') {
    p.sentiment = clamp(p.sentiment + 4, 0, 100);
    addNews(`🙇 ${p.stage}, 자필 사과문 "모든 혐의 인정, 깊이 반성"`, 'info');
    react('self_reflect', 3);
  } else {
    p.sentiment = clamp(p.sentiment - 2, 0, 100);
    addNews(`🗣️ ${p.stage} 측 "혐의 사실과 다르다, 법적 절차로 소명할 것"`, 'info');
  }
  save();
  return { ok: true, msg: plea === 'admit' ? '혐의를 인정하고 사과했습니다.' : '혐의를 부인했습니다.' };
}

function trialVerdict(cs, summary) {
  const p = S.player, c = CRIMES[cs.crime];
  let sc = cs.sev * 22 + priors() * 15 + (cs.plea === 'admit' ? -8 : cs.plea === 'deny' ? 6 : 0) - cs.lawyer * 13 + rnd(-18, 18);
  let v;
  if (cs.plea === 'deny' && sc < 22) v = 'cleared';
  else if (cs.plea !== 'deny' && cs.lawyer >= 1 && sc < 12) v = 'cleared';
  else if (sc < 34) v = 'fine';
  else if (sc < 58) v = 'probation';
  else v = 'prison';
  cs.status = 'done'; cs.verdict = v;
  S.player.record = S.player.record || [];
  S.player.record.push({ crime: c.name, verdict: v, t: S.t });
  const vname = VERDICTS[v];
  if (v === 'cleared') {
    p.sentiment = clamp(p.sentiment + 8, 0, 100); p.buzz += 6; p.boycottUntil = S.t;
    addNews(`⚖️ ${p.stage}, ${c.name} 혐의 무혐의 처분`, 'good');
    addStory(`${c.name} 혐의는 무혐의로 끝났다. 하지만 사람들의 기억까지 지워지진 않는다.`, 'crime');
    summary.events.push(`⚖️ ${c.name}: 무혐의!`);
    return;
  }
  const fine = v === 'fine' ? c.fine : Math.round(c.fine * 0.6);
  const extraFine = cs.crime === 'tax' ? Math.round((cs.extra.evaded || 0) * 2) : 0;
  p.money -= fine + extraFine;
  if (v !== 'fine') p.banUntil = Math.max(p.banUntil || 0, S.t + c.ban);
  if (v === 'prison') {
    const weeks = rint(c.prison[0], c.prison[1]) + (cs.extra.accident ? 26 : 0);
    p.prison = { startT: S.t, endT: S.t + weeks };
    p.boycottUntil = S.t + weeks + 26;
    S.ap = 0; S.postsLeft = 0;
    if (p.label && R() < 0.85) { addNews(`📉 ${labelOf(p.label).name}, ${p.stage}${josa(p.stage, '과')} 계약 해지`, 'bad'); p.label = null; p.contract = null; }
    S.inbox = S.inbox.filter(m => m.type === 'case' || m.type === 'civil');
    addStory(`징역 ${weeks}주. 철문이 닫히는 소리를 오래 잊지 못할 것이다.`, 'crime');
    addMilestone('prison', '수감 생활');
  } else {
    p.boycottUntil = S.t + (v === 'probation' ? 26 : 8);
    addStory(`${c.name} 사건은 ${vname}${fine + extraFine ? ` (${fmtMoney(fine + extraFine)})` : ''}으로 끝났다.`, 'crime');
  }
  S.flags.comebackPending = true;
  p.sentiment = clamp(p.sentiment + (v === 'prison' ? -10 : v === 'probation' ? -6 : -2) + (cs.plea === 'deny' ? -4 : 0), 0, 100);
  addNews(`⚖️ ${p.stage}, ${c.name} 혐의 ${vname}${v === 'prison' ? ` (징역 ${p.prison.endT - S.t}주)` : ''}${fine + extraFine ? ` · ${fmtMoney(fine + extraFine)}` : ''}`, 'bad');
  react('crime_verdict', 5);
  summary.events.push(`⚖️ ${c.name} 판결: ${vname}${v === 'prison' ? ` — 징역 ${p.prison.endT - S.t}주` : ''}`);
}

function resolveCivil(caseId, choice) {
  const p = S.player, cs = S.cases.find(c => c.id === caseId);
  if (!cs || cs.status === 'done') return { ok: false, msg: '종결된 사건입니다.' };
  const c = CRIMES[cs.crime];
  cs.status = 'done';
  if (choice === 'settle') {
    p.money -= cs.amount; cs.verdict = 'fine';
    if (cs.extra.npcId) { const n = npc(cs.extra.npcId); if (n) n.rel = clamp(n.rel + 5, 0, 100); }
    addNews(`🤝 ${p.stage}, ${c.name} 소송 합의 (${fmtMoney(cs.amount)})`, 'info');
    save(); return { ok: true, msg: `합의금 ${fmtMoney(cs.amount)}을 지급하고 사건을 끝냈습니다.` };
  }
  if (R() < 0.45) {
    cs.verdict = 'cleared'; p.cred += 1;
    addNews(`⚖️ ${p.stage}, ${c.name} 소송 승소`, 'good');
    save(); return { ok: true, msg: '법정 다툼에서 승소했습니다! 한 푼도 물어주지 않았습니다.' };
  }
  cs.verdict = 'fine'; p.money -= cs.amount * 2; p.sentiment = clamp(p.sentiment - 4, 0, 100);
  (p.record = p.record || []).push({ crime: c.name, verdict: 'fine', t: S.t });
  addNews(`⚖️ ${p.stage}, ${c.name} 소송 패소… 배상액 ${fmtMoney(cs.amount * 2)}`, 'bad');
  save(); return { ok: true, msg: `패소했습니다. 배상액 ${fmtMoney(cs.amount * 2)}을 물어주게 됐습니다.` };
}

function crimesWeekly(summary) {
  const p = S.player;
  S.crimes.forEach(cr => {
    if (cr.detected) return;
    const c = CRIMES[cr.crime];
    if (cr.crime === 'copyright') {
      const s = song(cr.extra.songId);
      const tot = s ? s.totalDom + s.totalGlob : 0;
      if (s && s.releaseId && tot > 2e6 && R() < 0.04) { cr.extra.streams = tot; detectCrime(cr); summary.events.push(`⚖️ 「${s.title}」의 무단 샘플링이 발각됐습니다!`); }
      return;
    }
    const weekly = cr.crime === 'tax' ? (cr.extra.evaded > 0 ? 0.006 + (cr.extra.full ? 0.01 : 0) : 0) : c.weekly;
    const until = cr.crime === 'tax' ? cr.t + 156 : cr.until;
    if (S.t <= until && R() < weekly) { detectCrime(cr); summary.events.push(`🚨 ${c.name} 혐의가 드러났습니다!`); }
  });
  S.cases.forEach(cs => {
    if (cs.status !== 'investigation' || S.t < cs.trialT) return;
    if (!CRIMES[cs.crime].civil) { trialVerdict(cs, summary); return; }
    // 대응하지 않은 민사 소송은 법정으로 간다
    S.inbox = S.inbox.filter(m => !(m.type === 'civil' && m.data.caseId === cs.id));
    summary.events.push('⚖️ ' + resolveCivil(cs.id, 'fight').msg);
  });
  // 자숙 종료
  if (p.reflectUntil && p.reflectUntil === S.t) {
    p.sentiment = clamp(p.sentiment + 6, 0, 100); p.antiRatio = clamp(p.antiRatio - 3, 0, 45); p.boycottUntil = Math.min(p.boycottUntil || 0, S.t);
    summary.events.push('🕯️ 자숙 기간이 끝났습니다. 여론이 한결 누그러졌습니다.');
    addStory('자숙 기간이 끝났다. 다시 마이크 앞에 설 자격이 있는지, 스스로에게 물었다.', 'crime');
  }
  if (inReflection()) p.sentiment = clamp(p.sentiment + 0.5, 0, 100);
  p.notoriety = Math.max(0, (p.notoriety || 0) * 0.995);
  // 출소
  if (p.prison && S.t >= p.prison.endT) {
    p.prison = null;
    p.buzz += 10; p.hype += 15;
    addNews(`🔓 ${p.stage}, 만기 출소`, 'info');
    addStory('출소. 바깥 공기가 낯설었다. 노트 한 권이 가득 차 있었다.', 'crime');
    p.inspiration = (p.inspiration || []).filter(x => x.theme !== '자전적 서사');
    p.inspiration.push({ theme: '자전적 서사', bonus: 16, until: S.t + 26 });
    summary.events.push('🔓 출소했습니다. 수감 중 쓴 가사가 있습니다 (자전적 서사 영감 +16).');
  }
}

/* 씬의 다른(생성된) 아티스트 사건 */
function npcCrimeNews() {
  if (R() > 0.007) return;
  const pool = S.npcs.filter(n => !n.parody && n.region === 'KR' && n.role === 'artist' && n.debutYear <= yearOf(S.t) && !((n.banUntil || 0) > S.t));
  if (!pool.length) return;
  const n = pick(pool);
  n.banUntil = S.t + 52; n.fame = clamp(n.fame - 12, 3, 99);
  addNews(fill(pick(NPC_CRIME_NEWS), { a: n.name }), 'bad');
  if (S.songs.some(s => s.feats.includes(n.id) && s.releaseId)) {
    S.player.sentiment = clamp(S.player.sentiment - 2, 0, 100);
    addNews(`😬 ${S.player.stage}, 피처링 참여자 ${n.name} 논란에 곤혹`, 'info');
  }
}

/* =========================================================
 *  밤의 유혹 (일탈 행동)
 * ========================================================= */
function actDrugParty() {
  const p = S.player;
  if (onHiatus()) return { ok: false, msg: '지금은 할 수 없습니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  p.mental = clamp(p.mental + 15, 0, 100);
  p.inspiration = (p.inspiration || []).filter(x => x.theme !== '실험적');
  p.inspiration.push({ theme: '실험적', bonus: 10, until: S.t + 12 });
  commitCrime('drug');
  addStory('그날 밤의 기억은 군데군데 비어 있다. 남은 건 낯선 멜로디 몇 개와 불안감이었다.', 'crime');
  save();
  return { ok: true, msg: '위험한 파티에서 밤을 보냈다. 멘탈 +15, 실험적 영감 +10… 하지만 언제 드러날지 모른다.' };
}
function actGamble(stake) {
  const p = S.player;
  if (onHiatus()) return { ok: false, msg: '지금은 할 수 없습니다.' };
  if (p.money < stake) return { ok: false, msg: '판돈이 부족합니다.' };
  if (!useAP(1)) return { ok: false, msg: '행동력이 부족합니다.' };
  const win = R() < 0.42;
  p.money += win ? stake : -stake;
  p.mental = clamp(p.mental + (win ? 6 : -8), 0, 100);
  commitCrime('gambling', { stake });
  save();
  return { ok: true, msg: win ? `불법 도박장에서 ${fmtMoney(stake)}을 땄다! …찜찜하다.` : `불법 도박장에서 ${fmtMoney(stake)}을 잃었다.` };
}
function startReflection(weeks) {
  const p = S.player;
  if (inReflection()) return { ok: false, msg: '이미 자숙 중입니다.' };
  p.reflectUntil = S.t + weeks;
  p.sentiment = clamp(p.sentiment + 3, 0, 100);
  addNews(`🕯️ ${p.stage}, "${weeks}주간 모든 활동을 중단하고 자숙하겠다"`, 'info');
  react('self_reflect', 4);
  addStory(`${weeks}주간의 자숙을 선언했다.`, 'crime');
  save();
  return { ok: true, msg: `${weeks}주간 자숙을 시작합니다. 이 기간에 발매·SNS를 하면 역풍을 맞습니다.` };
}

/* =========================================================
 *  세금
 * ========================================================= */
function taxInbox(y) {
  const p = S.player;
  const income = (S.yearIncome || {})[y - 1] || 0;
  if (income < 30000000) return;
  const tax = Math.round((income - 30000000) * 0.25 / 10000) * 10000;
  addInbox({ type: 'tax', title: `🧾 ${y - 1}년 종합소득세 신고`, text: `작년 음악 수입 ${fmtMoney(income)}에 대한 세금 ${fmtMoney(tax)}${josa(fmtMoney(tax), '을')} 신고해야 합니다.\n세무사가 은근히 "방법이 있다"고 귀띔합니다.`, data: { tax }, expires: S.t + 6 });
}
function resolveTax(m, choice) {
  const p = S.player, tax = m.data.tax;
  if (choice === 'honest') { p.money -= tax; p.cred += 0.2; return { ok: true, msg: `세금 ${fmtMoney(tax)}을 성실하게 납부했습니다.` }; }
  if (choice === 'trick') { p.money -= Math.round(tax * 0.6); commitCrime('tax', { evaded: Math.round(tax * 0.4) }); return { ok: true, msg: `"절세" 명목으로 ${fmtMoney(Math.round(tax * 0.4))}을 아꼈습니다. …정말 괜찮을까요?` }; }
  if (choice === 'evade') { commitCrime('tax', { evaded: tax, full: true }); return { ok: true, msg: `수입을 신고하지 않았습니다. ${fmtMoney(tax)}을 아꼈지만 세무조사 위험이 큽니다.` }; }
  return { ok: false, msg: '선택 오류' };
}

/* =========================================================
 *  개명 · 장르 전향
 * ========================================================= */
function renameStage(name) {
  const p = S.player; name = (name || '').trim();
  if (!name) return { ok: false, msg: '새 활동명을 입력하세요.' };
  if ((S.cooldowns.rename || 0) > S.t) return { ok: false, msg: '활동명은 1년에 한 번만 바꿀 수 있습니다.' };
  const old = p.stage;
  p.stage = name; S.cooldowns.rename = S.t + 52;
  p.fame = Math.max(0, p.fame * 0.92); p.buzz += 6;
  addNews(`🪪 ${old}, 활동명을 '${name}'${josa(name, '으로')} 변경`, 'info');
  addStory(`'${old}'라는 이름을 내려놓고 '${name}'${josa(name, '으로')} 다시 시작했다.`, 'story');
  react('name_change', 4);
  save();
  return { ok: true, msg: `이제부터 '${name}'입니다. 인지도가 조금 떨어졌지만 화제가 됐습니다.` };
}
function changeGenre(g) {
  const p = S.player;
  if (!GENRES.includes(g) || g === p.genre) return { ok: false, msg: '다른 장르를 선택하세요.' };
  if ((S.cooldowns.genre || 0) > S.t) return { ok: false, msg: `장르 전향은 ${S.cooldowns.genre - S.t}주 후에 가능합니다.` };
  const old = p.genre;
  p.genre = g; S.cooldowns.genre = S.t + 26;
  p.coreRatio = clamp(p.coreRatio - 3, 3, 60); p.buzz += 5;
  addNews(`🔀 ${p.stage}, ${old}에서 ${g}${josa(g, '으로')} 장르 전향 선언`, 'info');
  addStory(`${old}를 떠나 ${g}의 세계로 발을 디뎠다.`, 'story');
  react('genre_change', 4);
  save();
  return { ok: true, msg: `주력 장르를 ${g}${josa(g, '으로')} 바꿨습니다. 일부 팬이 떠났지만 새로운 팬층이 기대됩니다.` };
}

/* ---------- 공백기 빠르게 넘기기 (군 복무·수감) ---------- */
function fastForwardHiatus() {
  const ev = [];
  let guard = 0;
  while (onHiatus() && guard++ < 160) {
    const sm = nextWeek();
    sm.chart.concat(sm.events).forEach(e => { if (/수상|후보|전역|출소|🎆|💎|📝|⚖️|⚔️/.test(e)) ev.push(`[${dateLabel(S.t)}] ${e}`); });
  }
  return ev;
}
