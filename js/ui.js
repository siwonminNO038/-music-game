/* =========================================================
 *  화면 렌더링 & 입력 처리
 * ========================================================= */

const UI = {
  tab: 'home', chartTab: 'melon', fanFilter: 'all', snsPlatform: 'insta', snsType: 'daily',
  artistRegion: 'KR', artistGenre: 'all', artistRole: 'artist', artistSort: 'fame',
  newBg: 'underground', showWeekly: true, rel: null, awardsYear: null
};
try { UI.showWeekly = localStorage.getItem('utg_weekly') !== '0'; } catch (e) { }

const $ = sel => document.querySelector(sel);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TABS = [
  ['home', '🏠', '홈'], ['story', '📖', '스토리'], ['studio', '🎛️', '작업실'], ['disco', '💿', '디스코그래피'], ['charts', '📊', '차트'],
  ['critics', '📝', '평단'], ['awards', '🏆', '시상식'], ['artists', '🤝', '아티스트'], ['beef', '⚔️', '디스·사건'], ['label', '🏢', '레이블·크루'],
  ['sns', '📱', 'SNS'], ['fans', '💬', '팬 반응'], ['inbox', '📬', '소식함'], ['news', '📰', '뉴스']
];

/* ---------- 공용 위젯 ---------- */
function gradeEl(q) { const g = grade(q); return `<span class="grade ${g}" title="완성도 ${q}">${g}</span>`; }
function bar(v, cls = '', max = 100) { return `<div class="bar ${cls}"><i style="width:${clamp(v / max * 100, 0, 100)}%"></i></div>`; }
function statRow(label, v, cls = '', shown) { return `<div class="stat"><span>${label}</span>${bar(v, cls)}<span class="v">${shown != null ? shown : Math.round(v)}</span></div>`; }
function coverEl(c, title, size = '') {
  return `<div class="cover ${size}" style="background:linear-gradient(135deg,${esc(c.c1)},${esc(c.c2)})"><div class="e">${esc(c.emoji || '🎵')}</div><div class="ct">${esc(title)}</div></div>`;
}
function personaChip(k) { const p = PERSONAS[k]; return `<span class="pill" title="${p.label}">${p.icon} ${p.label}</span>`; }
function reactionEl(r) {
  const p = PERSONAS[r.persona];
  return `<div class="feed-item"><div class="ico" title="${p.label}">${p.icon}</div><div class="grow"><div class="h"><b>@${esc(r.handle)}</b> · ${p.label} · ${dateLabel(r.t)}</div><div class="txt">${esc(r.text)}</div><div class="tiny dim">♥ ${fmtNum(r.likes)}</div></div></div>`;
}
function sentimentLabel(v) { return v >= 80 ? '열광 🔥' : v >= 65 ? '호의적 😊' : v >= 48 ? '보통 😐' : v >= 32 ? '싸늘함 😒' : '최악 🤬'; }
function nextTOfWeek(w) { return S.t + ((w - weekOf(S.t) + 52) % 52); }
function mvEl(e, rank) {
  if (!e.prev) return `<td class="mv new">NEW</td>`;
  const d = e.prev - rank;
  return d > 0 ? `<td class="mv up">▲${d}</td>` : d < 0 ? `<td class="mv dn">▼${-d}</td>` : `<td class="mv dim">–</td>`;
}
function songChartInfo(s) {
  const out = [];
  if (s.peakMelon) out.push(`<span class="pill" title="멜론 최고 순위">🍈 #${s.peakMelon}</span>`);
  if (s.peakHot) out.push(`<span class="pill gold" title="빌보드 HOT 100 최고 순위">🇺🇸 #${s.peakHot}</span>`);
  (s.certs || []).forEach(c => out.push(`<span class="pill gold">💎 ${c}</span>`));
  return out.join(' ');
}

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + type; el.textContent = msg;
  $('#toast-root').appendChild(el);
  setTimeout(() => el.remove(), 3800);
}
function openModal(html, cls = '', keep = false) {
  const cur = keep && document.querySelector('#modal-root .modal');
  if (cur) { const st = cur.scrollTop; cur.className = 'modal ' + cls; cur.style.animation = 'none'; cur.innerHTML = html; cur.scrollTop = st; return; }
  $('#modal-root').innerHTML = `<div class="modal-bg" data-bg="1"><div class="modal ${cls}">${html}</div></div>`;
}
function closeModal() { $('#modal-root').innerHTML = ''; }
function result(res) {
  if (!res) return;
  if (!res.ok) { toast(res.msg, 'bad'); return false; }
  if (res.msg) toast(res.msg, 'good');
  return true;
}

/* =========================================================
 *  렌더
 * ========================================================= */
function render() {
  if (!S) { renderStart(); return; }
  const p = S.player;
  const unread = S.inbox.length;
  const fol = totalFollowers();
  $('#app').innerHTML = `
  <div class="top">
    <span class="brand">언더에서 그래미까지</span>
    <span class="date">📅 ${dateLabel(S.t)}</span>
    <div class="chips">
      <span class="chip" title="행동력">⚡ <span class="ap-dots">${[0, 1, 2].map(i => `<i class="${i < S.ap ? 'on' : ''}"></i>`).join('')}</span></span>
      <span class="chip">💰 <b class="${p.money < 0 ? 'bad-t' : ''}">${fmtMoney(p.money)}</b></span>
      <span class="chip" title="국내 인지도">⭐ <b>${p.fame.toFixed(1)}</b></span>
      <span class="chip" title="해외 인지도">🌎 <b>${p.globalFame.toFixed(1)}</b></span>
      <span class="chip" title="총 팔로워">👥 <b>${fmtNum(fol)}</b></span>
      <span class="chip" title="멘탈">🧠 <b class="${p.mental < 30 ? 'bad-t' : ''}">${Math.round(p.mental)}</b></span>
      <span class="chip" title="팬 여론">💜 <b>${Math.round(p.sentiment)}</b></span>
      ${activeWars().length ? `<span class="chip" title="진행 중인 디스전">⚔️ <b>${activeWars().length}</b></span>` : ''}
      ${S.cases.some(c => c.status === 'investigation') ? '<span class="chip" title="진행 중인 사건" style="border-color:#7f1d1d">⚖️ <b class="bad-t">수사 중</b></span>' : ''}
    </div>
    <button class="btn sm ghost" data-act="menu">☰ 메뉴</button>
    <button class="btn primary" data-act="next-week">다음 주 ▶</button>
  </div>
  <div class="layout">
    <nav class="nav">${TABS.map(([id, ic, name]) => `<button class="${UI.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}">${ic} ${name}${id === 'inbox' && unread ? `<span class="badge">${unread}</span>` : ''}${id === 'studio' && unreleasedSongs().length ? `<span class="badge" style="background:var(--accent)">${unreleasedSongs().length}</span>` : ''}</button>`).join('')}</nav>
    <main class="main">${renderTab()}</main>
  </div>`;
}

function renderTab() {
  switch (UI.tab) {
    case 'home': return viewHome();
    case 'story': return viewStory();
    case 'beef': return viewBeef();
    case 'studio': return viewStudio();
    case 'disco': return viewDisco();
    case 'charts': return viewCharts();
    case 'critics': return viewCritics();
    case 'awards': return viewAwards();
    case 'artists': return viewArtists();
    case 'label': return viewLabel();
    case 'sns': return viewSns();
    case 'fans': return viewFans();
    case 'inbox': return viewInbox();
    case 'news': return viewNews();
  }
  return '';
}

/* ---------- 시작 화면 ---------- */
function renderStart() {
  const bg = BACKGROUNDS.find(b => b.id === UI.newBg);
  $('#app').innerHTML = `
  <div class="start">
    <div class="logo">언더에서<br>그래미까지</div>
    <div class="tagline">방구석 무명 뮤지션에서 그래미 시상대까지. 곡을 쓰고, 앨범을 내고, 평단과 대중을 사로잡아라.</div>
    ${hasSave() ? `<div class="card mb row"><div class="grow"><b>저장된 게임이 있습니다.</b><div class="small muted">이어서 플레이할 수 있어요.</div></div><button class="btn primary" data-act="continue">이어하기 ▶</button></div>` : ''}
    <div class="card">
      <h3>🎤 새 커리어 시작</h3>
      <div class="grid g2">
        <label class="f"><span>본명</span><input id="ng-name" maxlength="12" placeholder="예: 김민수" value="김민수"></label>
        <label class="f"><span>활동명 (아티스트 이름)</span><input id="ng-stage" maxlength="16" placeholder="예: 리버스" value=""></label>
      </div>
      <div class="mt small muted bold">출신 배경</div>
      <div class="grid gauto mt">${BACKGROUNDS.map(b => `<button class="bg-opt ${b.id === UI.newBg ? 'on' : ''}" data-act="pick-bg" data-id="${b.id}"><b>${b.name}</b><span class="small muted">${b.desc}</span><div class="tiny dim mt">시작 자금 ${fmtMoney(b.money)} · 팔로워 ${fmtNum(b.followers)}</div></button>`).join('')}</div>
      <div class="grid g2 mt">
        <label class="f"><span>성별 <span class="dim">(스토리 이벤트에 영향)</span></span><select id="ng-gender"><option value="m">남성</option><option value="f">여성</option><option value="x">선택 안 함</option></select></label>
        <label class="f"><span>주력 장르</span><select id="ng-genre">${GENRES.map(g => `<option ${g === bg.genre ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
        <div class="col"><span class="small muted bold">시작 능력치</span>${Object.keys(SKILL_NAMES).map(k => statRow(SKILL_NAMES[k], bg.skills[k])).join('')}</div>
      </div>
      <div class="row mt"><div class="grow"></div><button class="btn" data-act="import">📂 세이브 불러오기</button><button class="btn primary" data-act="start">커리어 시작 🚀</button></div>
    </div>
    <div class="feature-list">
      <div>🏆 <b>시상식</b> — 그래미, 리드머 어워즈, 한국대중음악상, 한국힙합어워즈, 연말 스트리밍 어워즈</div>
      <div>📝 <b>평단</b> — 리드머, IZM, Pitchfork, 웨이브매거진의 별점과 리뷰</div>
      <div>💿 <b>작업물</b> — 곡 제목/트랙리스트/커버를 직접 정하는 싱글·EP·정규</div>
      <div>🤝 <b>협업</b> — 50여 명의 가상 아티스트와 피처링, 프로듀싱, 컴필레이션</div>
      <div>🏢 <b>레이블·크루</b> — 인디부터 미국 메이저까지, 크루 가입·창설</div>
      <div>📱 <b>SNS</b> — 인스타·X·유튜브 게시물과 팔로워</div>
      <div>💬 <b>팬 반응</b> — 찐팬, 고인물, 악플러, 올드팬, 해외팬 등 다양한 반응</div>
      <div>📊 <b>차트</b> — 멜론 TOP 100, 빌보드 HOT 100, 빌보드 200</div>
    </div>
  </div>`;
}

/* ---------- 홈 ---------- */
function viewHome() {
  const p = S.player;
  const lab = p.label ? labelOf(p.label) : null;
  const crew = p.crew ? crewOf(p.crew) : null;
  const bg = BACKGROUNDS.find(b => b.id === p.bg);
  const myCharts = [];
  S.charts.melon.forEach((e, i) => { if (e.isPlayer || e.featPlayer) myCharts.push({ chart: '🍈 멜론', rank: i + 1, e }); });
  S.charts.hot100.forEach((e, i) => { if (e.isPlayer || e.featPlayer) myCharts.push({ chart: '🇺🇸 HOT 100', rank: i + 1, e }); });
  S.charts.bb200.forEach((e, i) => { if (e.isPlayer) myCharts.push({ chart: '💿 빌보드 200', rank: i + 1, e }); });
  const upcoming = [];
  AWARDS.forEach(a => {
    upcoming.push({ t: nextTOfWeek(a.nomWeek), txt: `${a.icon} ${a.name} 후보 발표` });
    upcoming.push({ t: nextTOfWeek(a.week), txt: `${a.icon} ${a.name} 시상식` });
  });
  upcoming.push({ t: nextTOfWeek(51), txt: '📝 평단 연말 결산 리스트' });
  upcoming.sort((a, b) => a.t - b.t);
  const hist = S.history.slice(-52);
  const spark = (key, color) => {
    if (hist.length < 2) return '<div class="empty small">다음 주부터 기록됩니다</div>';
    const vals = hist.map(h => h[key]); const mx = Math.max(...vals, 1), mn = Math.min(...vals, 0);
    const pts = vals.map((v, i) => `${(i / (vals.length - 1) * 300).toFixed(1)},${(66 - (v - mn) / (mx - mn || 1) * 60).toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 300 70" preserveAspectRatio="none"><polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"/></svg>`;
  };
  const ap = S.ap;
  const ch = CHAPTERS[S.chapter];
  return `
  ${p.military ? `<div class="card mb" style="border-color:#4d7c0f;background:#15200d"><h3>🪖 군 복무 중 <span class="sub">전역까지 ${p.military.endT - S.t}주</span></h3><div class="small muted">복무 중에는 활동할 수 없습니다. 차트와 시상식, 씬은 계속 돌아갑니다.</div><div class="row mt"><button class="btn primary" data-act="ff-military">⏩ 전역까지 넘기기</button></div></div>` : ''}
  ${p.prison ? `<div class="card mb" style="border-color:#7f1d1d;background:#200d0d"><h3>🔒 수감 중 <span class="sub">출소까지 ${p.prison.endT - S.t}주</span></h3><div class="small muted">교도소에서는 활동할 수 없습니다. 바깥세상은 계속 돌아갑니다.</div><div class="row mt"><button class="btn primary" data-act="ff-military">⏩ 출소까지 넘기기</button></div></div>` : ''}
  ${statusPills()}
  <div class="card mb" style="background:linear-gradient(135deg,#1d1530,#171724)"><div class="row"><span class="pill acc">📖 ${esc(ch.title)}</span><span class="small muted grow">${esc(fill(ch.text, storyVars()))}</span><button class="btn sm" data-act="tab" data-tab="story">스토리 ▶</button></div>
  ${(p.inspiration || []).filter(x => x.until >= S.t).length ? `<div class="row mt">${p.inspiration.filter(x => x.until >= S.t).map(x => `<span class="pill gold" title="${x.until - S.t}주 남음">💡 ${esc(x.theme)} 영감 +${x.bonus}</span>`).join('')}<span class="tiny dim">같은 주제로 곡을 쓰면 반영됩니다</span></div>` : ''}</div>
  <div class="grid g2">
    <div class="card">
      <div class="profile">
        <div class="avatar">${esc(p.stage.slice(0, 1))}</div>
        <div class="grow">
          <div class="name">${esc(p.stage)}</div>
          <div class="small muted">${esc(p.name)} · ${p.age}세 · ${p.genre} · ${bg ? bg.name : ''}</div>
          <div class="row mt">
            <span class="pill acc">🏢 ${lab ? esc(lab.name) : '무소속'}</span>
            <span class="pill">🤜 ${crew ? esc(crew.name) : '크루 없음'}</span>
            <span class="pill ${p.cred >= 5 ? 'good' : p.cred <= -5 ? 'bad' : ''}" title="평단 신뢰도: 평론가 점수와 평단 시상식에 영향">🧐 평단 신뢰도 ${p.cred >= 0 ? '+' : ''}${Math.round(p.cred)}</span>
          </div>
        </div>
      </div>
      <div class="hr"></div>
      <div class="col">
        ${statRow('국내 인지도', p.fame, '', p.fame.toFixed(1))}
        ${statRow('해외 인지도', p.globalFame, 'b', p.globalFame.toFixed(1))}
        ${statRow('멘탈', p.mental, p.mental < 30 ? 'r' : 'g')}
        ${statRow('팬 여론', p.sentiment, 'y')}
      </div>
      <div class="hr"></div>
      <div class="col">${Object.keys(SKILL_NAMES).map(k => statRow(SKILL_NAMES[k], p.skills[k], 'b', p.skills[k].toFixed(1))).join('')}</div>
    </div>
    <div class="col" style="gap:14px">
      <div class="card">
        <h3>⚡ 이번 주 행동 <span class="sub">남은 행동력 ${ap}/3 · 다음 주가 되면 회복</span></h3>
        <div class="actions">
          <button class="act" data-act="song-form" ${ap < 1 ? 'disabled' : ''}><b>🎼 곡 작업</b><span>새 곡 만들기 (1~2)</span></button>
          <button class="act" data-act="practice-menu" ${ap < 1 ? 'disabled' : ''}><b>📚 연습</b><span>능력치 향상 (1)</span></button>
          <button class="act" data-act="gig" ${ap < 1 ? 'disabled' : ''}><b>🎤 공연</b><span>돈 + 팬 + 무대 경험 (1)</span></button>
          <button class="act" data-act="rest" ${ap < 1 ? 'disabled' : ''}><b>🛌 휴식</b><span>멘탈 회복 (1)</span></button>
          <button class="act" data-act="parttime" ${ap < 1 ? 'disabled' : ''}><b>🏪 아르바이트</b><span>+40만원 (1)</span></button>
          <button class="act" data-act="global-promo" ${ap < 2 || p.fame < 35 ? 'disabled' : ''}><b>✈️ 해외 프로모션</b><span>인지도 35+, 500만원 (2)</span></button>
          <button class="act" data-act="release-form" ${unreleasedSongs().length ? '' : 'disabled'}><b>💿 발매하기</b><span>미발매 ${unreleasedSongs().length}곡</span></button>
          <button class="act" data-act="tab" data-tab="sns"><b>📱 SNS 게시</b><span>이번 주 ${S.postsLeft}회 남음</span></button>
          <button class="act" data-act="sell-beat" ${ap < 1 || p.skills.produce < 35 || onHiatus() ? 'disabled' : ''}><b>🎛️ 비트 판매</b><span>${p.skills.produce < 35 ? '프로듀싱 35+ 필요' : '다른 아티스트 곡 프로듀싱 (1)'}</span></button>
          <button class="act" data-act="night-menu" ${onHiatus() ? 'disabled' : ''}><b>🌃 밤의 유혹</b><span>위험한 선택들</span></button>
          <button class="act" data-act="tour-menu" ${onHiatus() ? 'disabled' : ''}><b>🎫 투어·굿즈</b><span>${tourCooldown() ? `투어 ${tourCooldown()}주 후` : '공연 기획 (3)'}</span></button>
        </div>
      </div>
      <div class="card">
        <h3>📊 내 차트 현황</h3>
        ${myCharts.length ? `<div class="list">${myCharts.map(c => `<div class="row"><span class="rank">${c.rank}</span><span class="pill">${c.chart}</span><span class="grow">${esc(c.e.title)} <span class="small muted">${esc(c.e.artist)}</span></span></div>`).join('')}</div>` : '<div class="empty">아직 차트에 오른 곡이 없습니다.</div>'}
      </div>
    </div>
  </div>
  <div class="grid g3 mt">
    <div class="card"><h3>📈 인지도 추이 <span class="sub">최근 1년</span></h3>${spark('fame', '#c084fc')}<div class="tiny dim">보라: 국내</div>${spark('gfame', '#38bdf8')}<div class="tiny dim">파랑: 해외</div></div>
    <div class="card"><h3>👥 팔로워</h3>
      <div class="kpis">
        <div class="kpi"><div class="l">📸 인스타그램</div><div class="big-num">${fmtNum(p.followers.insta)}</div></div>
        <div class="kpi"><div class="l">✖️ X</div><div class="big-num">${fmtNum(p.followers.x)}</div></div>
        <div class="kpi"><div class="l">▶️ 유튜브</div><div class="big-num">${fmtNum(p.followers.youtube)}</div></div>
        <div class="kpi"><div class="l">🎧 주간 스트리밍</div><div class="big-num">${fmtNum(p.weeklyDom + p.weeklyGlob)}</div></div>
      </div>
      ${spark('followers', '#f472b6')}
    </div>
    <div class="card"><h3>🗓️ 다가오는 일정</h3><div class="list">${upcoming.slice(0, 6).map(u => `<div class="row"><span class="grow">${u.txt}</span><span class="small muted">${u.t === S.t ? '이번 주' : `${u.t - S.t}주 후`}</span></div>`).join('')}</div></div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h3>📰 최근 소식 <span class="sub"><button class="btn sm" data-act="tab" data-tab="news">전체</button></span></h3><div class="list">${S.news.slice(0, 7).map(newsEl).join('') || '<div class="empty">소식 없음</div>'}</div></div>
    <div class="card"><h3>💬 팬 반응 <span class="sub"><button class="btn sm" data-act="tab" data-tab="fans">전체</button></span></h3><div class="list">${S.reactions.slice(0, 5).map(reactionEl).join('') || '<div class="empty">아직 반응이 없습니다</div>'}</div></div>
  </div>
  ${S.milestones.length ? `<div class="card mt"><h3>🏁 커리어 하이라이트</h3><div class="row">${S.milestones.slice().reverse().map(m => `<span class="pill gold" title="${dateLabel(m.t)}">${esc(m.text)}</span>`).join('')}</div></div>` : ''}`;
}
function newsEl(n) { return `<div class="news-item ${n.type}"><span class="d">${dateLabel(n.t)}</span><span class="x">${esc(n.text)}</span></div>`; }

/* ---------- 작업실 ---------- */
function songCard(s, opts = {}) {
  const a = s.attrs;
  const names = { lyric: '가사', sound: '사운드', hook: '훅/대중성', originality: '독창성', perf: '퍼포먼스' };
  return `<div class="song">
    <div class="row">${gradeEl(s.quality)}<div class="grow"><div class="t">${esc(s.title)}</div>
    <div class="small muted">${s.genre} · ${s.theme}${s.producer ? ` · prod. ${esc(artistName(s.producer))}` : ' · 셀프 프로듀싱'}${s.feats.length ? ` · Feat. ${s.feats.map(f => esc(artistName(f))).join(', ')}` : ''}</div></div>
    ${opts.actions ? `<button class="btn sm" data-act="rename-song" data-id="${s.id}">✏️</button><button class="btn sm bad" data-act="delete-song" data-id="${s.id}">🗑️</button>` : ''}</div>
    <div class="attrs">${Object.keys(names).map(k => `<span>${names[k]}</span>${bar(a[k], k === 'hook' ? 'y' : k === 'originality' ? 'b' : '')}<span class="v">${a[k]}</span>`).join('')}</div>
    ${s.note && s.note.length ? `<details class="mt" ${opts.openNote ? 'open' : ''}><summary class="tiny muted" style="cursor:pointer">📝 작업 노트 — ${esc(s.note[0])}</summary><div class="small" style="color:#cfcfe0;margin-top:4px">${s.note.slice(1).map(esc).join(' ')}</div></details>` : ''}
    ${s.releaseId ? `<div class="row mt small">${songChartInfo(s)}<span class="muted">누적 ${fmtNum(s.totalDom + s.totalGlob)}회</span></div>` : `<div class="tiny dim mt">작업일 ${dateLabel(s.createdT)}</div>`}
  </div>`;
}
function viewStudio() {
  const un = unreleasedSongs();
  const crew = S.player.crew ? crewOf(S.player.crew) : null;
  return `<div class="page-title">🎛️ 작업실
    <button class="btn primary" data-act="song-form" ${S.ap < 1 ? 'disabled' : ''}>🎼 새 곡 작업</button>
    <button class="btn" data-act="release-form" ${un.length ? '' : 'disabled'}>💿 발매하기</button>
    ${crew ? `<button class="btn" data-act="comp-form" ${un.length ? '' : 'disabled'}>📀 크루 컴필레이션</button>` : ''}
    ${S.myLabel ? `<button class="btn" data-act="lcomp-form" ${un.length && labelRoster().length ? '' : 'disabled'}>🏷️ 레이블 컴필레이션</button>` : ''}</div>
  ${(S.player.inspiration || []).filter(x => x.until >= S.t).length ? `<div class="card mb row"><b>💡 지금 가진 영감</b>${S.player.inspiration.filter(x => x.until >= S.t).map(x => `<span class="pill gold">${esc(x.theme)} +${x.bonus} · ${x.until - S.t}주 남음</span>`).join('')}</div>` : ''}
  <div class="card mb small muted">💡 곡 완성도는 능력치·멘탈·주제·프로듀서·피처링에 따라 달라집니다. 같은 장르/주제로 앨범을 구성하면 <b>앨범 응집력</b>이 올라 평단 점수가 좋아집니다. 첫 곡 제목에 "Intro", 마지막 곡에 "Outro"를 넣으면 보너스! 너무 자주 발매하면 관심이 분산됩니다.</div>
  <h3 class="mb">미발매 곡 (${un.length})</h3>
  ${un.length ? `<div class="grid gauto">${un.map(s => songCard(s, { actions: true })).join('')}</div>` : '<div class="card empty">미발매 곡이 없습니다. 곡 작업을 시작해 보세요!</div>'}
  <h3 class="mb mt">발매된 곡 (${releasedSongs().length})</h3>
  ${releasedSongs().length ? `<div class="grid gauto">${releasedSongs().slice().reverse().slice(0, 30).map(s => songCard(s)).join('')}</div>` : '<div class="card empty">아직 발매한 곡이 없습니다.</div>'}`;
}

function songFormHtml() {
  const p = S.player;
  const prods = S.npcs.filter(n => n.role === 'producer').sort((a, b) => b.skill - a.skill);
  const arts = S.npcs.filter(n => n.role === 'artist' && n.debutYear <= yearOf(S.t)).sort((a, b) => (a.region === b.region ? b.fame - a.fame : a.region === 'KR' ? -1 : 1));
  const optA = n => { const c = featChance(n); return `<option value="${n.id}" ${c <= 0 ? 'disabled' : ''}>${n.region === 'GLOBAL' ? '🌎 ' : ''}${esc(n.name)} (${n.genre}, ⭐${Math.round(n.fame)}) — ${fmtMoney(npcFee(n))} · 수락 ${Math.round(c * 100)}%</option>`; };
  return `<h2>🎼 새 곡 작업</h2>
  <div class="grid g2">
    <label class="f"><span>곡 제목 *</span><input id="sf-title" maxlength="40" placeholder="예: 서울의 밤"></label>
    <label class="f"><span>장르</span><select id="sf-genre" data-act-change="sf-genre">${GENRES.map(g => `<option ${g === p.genre ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
    <label class="f"><span>스타일 <span class="dim">🔥 = 올해 트렌드</span></span><select id="sf-style">${styleOptions(p.genre)}</select></label>
    <label class="f"><span>샘플링</span><select id="sf-sample"><option value="none">샘플 없음</option><option value="clear">정식 클리어 (300만원, 훅·독창성↑)</option><option value="steal">🚨 무단 샘플링 (무료, 훅·독창성↑↑, 소송 위험)</option></select></label>
    <label class="f"><span>주제</span><select id="sf-theme" data-act-change="sf-theme">${THEMES.map(t => { const i = (p.inspiration || []).find(x => x.theme === t && x.until >= S.t); return `<option value="${t}" ${i ? 'selected' : ''}>${i ? `💡 ${t} (영감 +${i.bonus})` : t}</option>`; }).join('')}</select></label>
    <label class="f"><span>작업 방식</span><select id="sf-deep"><option value="0">일반 작업 (행동력 1)</option><option value="1" ${S.ap < 2 ? 'disabled' : ''}>공들여 작업 (행동력 2, 완성도↑)</option></select></label>
    <label class="f"><span>프로듀서</span><select id="sf-prod" data-act-change="sf-cost"><option value="">셀프 프로듀싱 (무료, 내 프로듀싱 능력 ${Math.round(p.skills.produce)})</option>${prods.map(n => `<option value="${n.id}">${esc(n.name)} (실력 ${n.skill}) — ${fmtMoney(Math.round(npcFee(n) * 0.7 / 10000) * 10000)} · 수락 ${Math.round(Math.min(1, featChance(n) + 0.15) * 100)}%</option>`).join('')}</select></label>
    <label class="f"><span>피처링 1</span><select id="sf-f1" data-act-change="sf-cost"><option value="">없음</option>${arts.map(optA).join('')}</select></label>
    <label class="f"><span>피처링 2</span><select id="sf-f2" data-act-change="sf-cost"><option value="">없음</option>${arts.map(optA).join('')}</select></label>
    <div class="col"><span class="small muted bold">예상 비용</span><div class="big-num" id="sf-cost">0원</div><div class="tiny dim">거절당하면 비용이 들지 않습니다. 보유 ${fmtMoney(p.money)}</div></div>
  </div>
  <div id="sf-diss" class="review mt" style="display:none;border-color:#7f1d1d">
    <div class="bold mb">⚔️ 디스곡 설정</div>
    <div class="grid g2">
      <label class="f"><span>디스 대상</span><select id="sf-dtype" data-act-change="sf-dtype">${Object.keys(DISS_TARGET_TYPES).map(k => `<option value="${k}">${DISS_TARGET_TYPES[k]}</option>`).join('')}</select></label>
      <label class="f"><span>상대</span><select id="sf-dtarget">${dissTargetOptions('artist')}</select></label>
      <label class="f"><span>수위</span><select id="sf-dlevel">${Object.keys(DISS_LEVELS).map(k => `<option value="${k}">${DISS_LEVELS[k].name} — ${DISS_LEVELS[k].desc}</option>`).join('')}</select></label>
      <label class="f"><span>대표 펀치라인 (뉴스·커뮤니티에 인용됨, 상대 이름을 넣으면 효과↑)</span><input id="sf-dpunch" maxlength="80" placeholder="예: 네 커리어는 리메이크, 내 건 오리지널"></label>
    </div>
    <div class="tiny dim mt">발매하면 디스전이 시작됩니다. 상대가 답디스를 내면 6주 안에 응수해야 합니다. 씬 전체를 저격하면 여러 명과 동시에 싸우게 됩니다.</div>
  </div>
  <div class="tiny dim mt">주제 효과 — 플렉스/파티: 훅↑ 가사↓ · 사회비판/자전적 서사/가족: 가사↑ · 실험적: 독창성↑↑ 훅↓ · 사랑/청춘: 훅↑ · 디스: 디스전용 · 우울/불안: 가사·독창성↑</div>
  <div class="foot"><button class="btn" data-act="close">취소</button><button class="btn primary" data-act="make-song">작업 시작 🎧</button></div>`;
}

/* ---------- 발매 ---------- */
function releaseFormHtml(comp) {
  const r = UI.rel;
  const un = unreleasedSongs();
  const [mn, mx] = releaseRules(comp ? 'compilation' : r.type);
  const sel = r.ids.map(song).filter(Boolean);
  return `<h2>${comp ? (r.source === 'label' ? '🏷️ 레이블 컴필레이션 발매' : '📀 크루 컴필레이션 발매') : '💿 작품 발매'}</h2>
  <div class="rel">
    <div class="col" style="align-items:center">${coverEl(r.cover, r.title || '제목 없음', 'lg')}
      <div class="row"><input type="color" id="rf-c1" value="${r.cover.c1}" data-act-input="rf-cover"><input type="color" id="rf-c2" value="${r.cover.c2}" data-act-input="rf-cover"></div>
      <label class="f" style="width:150px"><span>커버 이모지</span><input id="rf-emoji" maxlength="4" value="${esc(r.cover.emoji)}" data-act-input="rf-cover"></label>
    </div>
    <div class="col grow">
      ${comp ? '' : `<div class="tabs">${['single', 'EP', 'album', 'mixtape'].map(t => `<button class="tab ${r.type === t ? 'on' : ''}" data-act="rf-type" data-type="${t}">${typeName(t)} (${releaseRules(t).join('~')}곡)</button>`).join('')}</div>`}
      <label class="f"><span>${comp ? '컴필레이션' : '작품'} 제목 *</span><input id="rf-title" maxlength="40" value="${esc(r.title)}" data-act-input="rf-title" placeholder="예: 서울, 새벽 세 시"></label>
      ${comp ? '' : `<label class="f"><span>앨범 소개 / 컨셉 (20자 이상이면 응집력 보너스)</span><textarea id="rf-concept" maxlength="300" data-act-input="rf-concept" placeholder="이 앨범은 ...">${esc(r.concept)}</textarea></label>`}
      ${r.type === 'mixtape' ? '<div class="small muted">🎁 믹스테이프는 사운드클라우드에 무료 공개됩니다. 수익·멜론/빌보드 차트는 없지만 평단 신뢰도와 찐팬이 늘고, 리드머가 리뷰합니다.</div>' : ''}
      ${r.type !== 'mixtape' && !comp ? `<label class="f"><span>🤝 합작 파트너 (친밀도 60+ · 모든 곡에 참여, 스트리밍↑)</span><select data-act-change="rf-partner"><option value="">없음 (단독 작품)</option>${collabPartners().map(n => `<option value="${n.id}" ${r.partner === n.id ? 'selected' : ''}>${n.region === 'GLOBAL' ? '🌎 ' : ''}${esc(n.name)} (${n.genre}, ⭐${Math.round(n.fame)})</option>`).join('')}</select></label>` : ''}
      ${r.type !== 'mixtape' && !comp ? `<label class="row small" style="cursor:pointer"><input type="checkbox" data-act-change="rf-sajaegi" ${r.sajaegi ? 'checked' : ''}> 🕶️ <span class="bad-t">브로커를 통한 음원 사재기 (3,000만원)</span> <span class="tiny dim">— 스트리밍 대폭↑, 적발 시 형사 처벌·차트 기록 박탈</span></label>` : ''}
      <label class="f" ${r.type === 'mixtape' ? 'style="display:none"' : ''}><span>홍보 예산</span><select id="rf-promo" data-act-change="rf-promo">${PROMO_OPTIONS.map((o, i) => `<option value="${i}" ${r.promo === i ? 'selected' : ''} ${o.cost > S.player.money ? 'disabled' : ''}>${o.label} — 노출 x${o.mult}</option>`).join('')}</select></label>
    </div>
  </div>
  <div class="grid g2 mt">
    <div class="card">
      <h3>🎵 곡 선택 <span class="sub">클릭해서 추가 (${comp ? '내 곡 1~3곡' : `${mn}~${mx}곡`})</span></h3>
      <div class="list scroll" style="max-height:300px">${un.map(s => `<label class="row" style="cursor:pointer"><input type="checkbox" data-act="rf-toggle" data-id="${s.id}" ${r.ids.includes(s.id) ? 'checked' : ''}>${gradeEl(s.quality)}<span class="grow">${esc(s.title)} <span class="tiny muted">${s.genre} · ${s.theme}${s.feats.length ? ' · feat' : ''}</span></span></label>`).join('') || '<div class="empty">미발매 곡이 없습니다</div>'}</div>
    </div>
    <div class="card">
      <h3>📋 트랙리스트 <span class="sub">${sel.length}곡 · 제목 수정 가능 · ◉ = 타이틀곡</span></h3>
      ${sel.length ? sel.map((s, i) => `<div class="trk"><span class="bold center">${i + 1}</span>
        <input value="${esc(s.title)}" data-act-change="rf-rename" data-id="${s.id}" maxlength="40">
        <div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm ${r.titleId === s.id ? 'primary' : ''}" data-act="rf-title-track" data-id="${s.id}" title="타이틀곡 지정">${r.titleId === s.id ? '◉' : '○'}</button><button class="btn sm" data-act="rf-move" data-id="${s.id}" data-d="-1">↑</button><button class="btn sm" data-act="rf-move" data-id="${s.id}" data-d="1">↓</button></div></div>`).join('') : '<div class="empty">왼쪽에서 곡을 선택하세요</div>'}
      ${sel.length > 1 && !comp ? `<div class="tiny dim mt">예상 응집력: <b>${computeCohesion(sel, r.concept, r.type)}</b> / 100</div>` : ''}
      ${comp ? `<div class="tiny dim mt">${r.source === 'label' ? '소속 아티스트' : '크루 멤버'}들(${(r.source === 'label' ? labelRoster() : crewMembers(S.player.crew)).map(n => esc(n.name)).join(', ') || '없음'})이 각자 1곡씩 참여합니다.</div>` : ''}
    </div>
  </div>
  <div class="foot"><button class="btn" data-act="close">취소</button><button class="btn primary" data-act="${comp ? 'do-comp' : 'do-release'}">발매하기 🚀</button></div>`;
}
function rerenderRelease() { openModal(releaseFormHtml(UI.rel.comp), 'wide', true); }

function releaseResultHtml(rel, notes) {
  const tr = rel.trackIds.map(song);
  const reacts = S.reactions.filter(r => r.src === rel.id).slice(0, 8);
  return `<h2>🎉 「${esc(rel.title)}」 발매!</h2>
  <div class="rel">${coverEl(rel.cover, rel.title, 'lg')}
    <div class="grow col">
      <div class="row"><span class="pill acc">${typeName(rel.type)}</span><span class="pill">${rel.genre}</span><span class="pill">${tr.length}곡</span>${rel.type !== 'single' ? `<span class="pill">응집력 ${rel.cohesion}</span>` : ''}</div>
      <div class="row"><div><div class="small muted">평단 지수</div><div class="score-big ${rel.critic >= 75 ? 'gold-t' : rel.critic < 50 ? 'bad-t' : ''}">${rel.critic}</div></div></div>
      ${notes && notes.length ? `<div class="col small">${notes.map(n => `<div>${esc(n)}</div>`).join('')}</div>` : ''}
    </div>
  </div>
  <h3 class="mt mb">📝 평론</h3>
  <div class="col">${rel.reviews.map(reviewEl).join('')}</div>
  <h3 class="mt mb">💬 팬 반응</h3>
  <div class="list">${reacts.map(reactionEl).join('')}</div>
  <div class="foot"><button class="btn primary" data-act="close">확인</button></div>`;
}
function reviewEl(r) {
  return `<div class="review"><div class="row"><span class="o">${esc(r.name)}</span><span class="s">${esc(r.display)}</span>${r.badge ? `<span class="pill gold">🏅 ${esc(r.badge)}</span>` : ''}</div><p>${esc(r.text)}</p></div>`;
}

/* ---------- 디스코그래피 ---------- */
function viewDisco() {
  const rels = S.releases.slice().reverse();
  const feats = S.npcReleases.filter(r => r.feats.includes('player')).slice().reverse();
  return `<div class="page-title">💿 디스코그래피 <span class="pill">${S.releases.length}개 작품</span><span class="pill">누적 ${fmtNum(sum(S.songs.map(s => s.totalDom + s.totalGlob)))} 스트리밍</span></div>
  ${rels.length ? rels.map(r => {
    const tr = r.trackIds.map(song);
    const tot = sum(tr.map(s => s.totalDom + s.totalGlob));
    return `<div class="card mb"><div class="rel">${coverEl(r.cover, r.title)}
      <div class="grow col" style="gap:6px">
        <div class="row"><b style="font-size:17px">${esc(r.title)}</b><span class="pill acc">${typeName(r.type)}</span><span class="pill">${r.genre}</span><span class="small muted">${dateLabel(r.t)}${r.label ? ' · ' + esc(labelOf(r.label).name) : ''}</span></div>
        ${r.concept ? `<div class="small muted">“${esc(r.concept)}”</div>` : ''}
        <div class="row"><span>평단 지수 <b class="${r.critic >= 75 ? 'gold-t' : ''}">${r.critic}</b></span>${r.type !== 'single' ? `<span class="muted">· 응집력 ${r.cohesion}</span>` : ''}<span class="muted">· 누적 ${fmtNum(tot)}회</span>${r.peakBB200 ? `<span class="pill gold">빌보드 200 최고 #${r.peakBB200}</span>` : ''}</div>
        <div class="row">${r.reviews.map(v => `<span class="pill" title="${esc(v.text)}">${esc(v.name)} <b class="gold-t">${esc(v.display)}</b>${v.badge ? ' 🏅' : ''}</span>`).join('')}<button class="btn sm" data-act="show-reviews" data-id="${r.id}">리뷰 전문</button></div>
      </div></div>
      <div class="tbl-wrap mt"><table><tr><th>#</th><th>곡</th><th>완성도</th><th>누적 스트리밍</th><th>이번 주</th><th>최고 순위</th></tr>
      ${tr.map((s, i) => `<tr><td>${i + 1}</td><td>${s.id === r.titleTrackId ? '<span class="pill acc">타이틀</span> ' : ''}${esc(s.title)}${s.feats.length ? ` <span class="small muted">(Feat. ${s.feats.map(f => esc(artistName(f))).join(', ')})</span>` : ''}</td><td>${gradeEl(s.quality)}</td><td>${fmtNum(s.totalDom + s.totalGlob)}</td><td>${fmtNum(s.dom + s.glob)}</td><td>${songChartInfo(s) || '<span class="dim">-</span>'}</td></tr>`).join('')}
      ${(r.extraTracks || []).map((x, i) => `<tr><td>${tr.length + i + 1}</td><td>${esc(x.title)} <span class="small muted">— ${esc(x.artist)}</span></td><td>${gradeEl(x.quality)}</td><td class="dim" colspan="3">크루 멤버 트랙</td></tr>`).join('')}
      </table></div></div>`;
  }).join('') : '<div class="card empty">아직 발매한 작품이 없습니다. 작업실에서 곡을 만들고 발매해 보세요.</div>'}
  ${(S.beatCredits || []).length ? `<h3 class="mt mb">🎛️ 프로듀싱 크레딧</h3><div class="card mb"><div class="list">${S.beatCredits.slice().reverse().map(b => { const r = S.npcReleases.find(x => x.id === b.relId); return `<div class="row"><span class="grow">「${esc(b.title)}」 — ${esc(artistName(b.npcId))} (prod. ${esc(S.player.stage)})</span><span class="small muted">${dateLabel(b.t)} · ${fmtMoney(b.price)}${r ? ` · 평단 ${r.critic} · 누적 ${fmtNum(r.total + r.totalGlob)}` : ''}</span></div>`; }).join('')}</div></div>` : ''}
  ${feats.length ? `<h3 class="mt mb">🎙️ 피처링 참여곡</h3><div class="card"><div class="list">${feats.map(r => `<div class="row"><span class="grow">「${esc(r.trackTitle)}」 — ${esc(artistName(r.artistId))} (Feat. ${esc(S.player.stage)})</span><span class="small muted">${dateLabel(r.t)} · 누적 ${fmtNum(r.total + r.totalGlob)}</span></div>`).join('')}</div></div>` : ''}`;
}

/* ---------- 차트 ---------- */
function viewCharts() {
  const c = UI.chartTab;
  const list = S.charts[c] || [];
  const meta = {
    melon: ['🍈 멜론 TOP 100', '국내 주간 스트리밍 기준', '주간 스트리밍'],
    hot100: ['🇺🇸 Billboard HOT 100', '글로벌 주간 스트리밍 기준', 'Weekly Streams'],
    bb200: ['💿 Billboard 200', '앨범 환산 판매량(유닛) 기준', 'Units']
  }[c];
  return `<div class="page-title">📊 차트 <span class="small muted">${dateLabel(S.charts.t || S.t)} 기준</span></div>
  ${S.trends ? `<div class="card mb row"><b>🔥 ${S.trends.year} 트렌드</b>${S.trends.hot.map(h => `<span class="pill gold">${esc(h.style)} <span class="dim">${h.genre}</span></span>`).join('')}<b class="mt" style="margin-left:8px">🧊 침체</b>${S.trends.cold.map(h => `<span class="pill">${esc(h.style)}</span>`).join('')}<span class="tiny dim">트렌드 스타일은 스트리밍↑, 평단은 편승을 싫어하고 침체 장르의 고집을 좋아합니다.</span></div>` : ''}
  <div class="tabs">${[['melon', '🍈 멜론 TOP 100'], ['hot100', '🇺🇸 HOT 100'], ['bb200', '💿 빌보드 200']].map(([id, n]) => `<button class="tab ${c === id ? 'on' : ''}" data-act="chart-tab" data-c="${id}">${n}</button>`).join('')}</div>
  <div class="card"><h3>${meta[0]} <span class="sub">${meta[1]}</span></h3>
  ${list.length ? `<div class="tbl-wrap"><table><tr><th>순위</th><th></th><th>${c === 'bb200' ? '앨범' : '곡'}</th><th>아티스트</th><th class="right">${meta[2]}</th><th class="right">최고</th><th class="right">주</th></tr>
  ${list.map((e, i) => `<tr class="${e.isPlayer || e.featPlayer ? 'me' : ''}"><td class="rank">${i + 1}</td>${mvEl(e, i + 1)}<td>${esc(e.title)}</td><td class="muted">${esc(e.artist)}</td><td class="right">${fmtNum(e.value)}</td><td class="right">${e.peak}</td><td class="right">${e.weeks}</td></tr>`).join('')}
  </table></div>` : '<div class="empty">차트 데이터가 없습니다.</div>'}</div>`;
}

/* ---------- 평단 ---------- */
function viewCritics() {
  const mine = S.releases.slice().reverse();
  const scene = S.npcReleases.filter(r => r.region === 'KR' && r.t <= S.t).slice(-20).reverse();
  const star = v => { const s = clamp(Math.round(v / 20 * 2) / 2, 0.5, 5); return '★'.repeat(Math.floor(s)) + (s % 1 ? '☆' : '') + ' ' + s.toFixed(1); };
  return `<div class="page-title">📝 평단</div>
  <div class="grid gauto mb">${OUTLETS.map(o => `<div class="card"><h3>${esc(o.name)}</h3><div class="small muted">${esc(o.desc)}</div><div class="tiny dim mt">${o.genres ? '다루는 장르: ' + o.genres.join(', ') : '전 장르'}${o.minGlobal ? ` · 해외 인지도 ${o.minGlobal}+ (또는 매우 실험적인 작품)` : ''}</div></div>`).join('')}</div>
  <div class="grid g2">
    <div class="card"><h3>📰 내 작품 리뷰</h3>
      ${mine.length ? `<div class="col">${mine.map(r => `<div><div class="row mb"><b>「${esc(r.title)}」</b><span class="small muted">${typeName(r.type)} · ${dateLabel(r.t)} · 평단 지수 ${r.critic}</span></div><div class="col">${r.reviews.map(reviewEl).join('')}</div></div>`).join('<div class="hr"></div>')}</div>` : '<div class="empty">아직 리뷰된 작품이 없습니다.</div>'}
    </div>
    <div class="col" style="gap:14px">
      <div class="card"><h3>🗂️ 연말 결산 리스트</h3>
        ${S.yearLists.length ? S.yearLists.slice(0, 6).map(l => `<details ${l.list.some(x => x.isPlayer) ? 'open' : ''}><summary class="bold" style="cursor:pointer;margin:6px 0">${esc(l.name)}${l.list.some(x => x.isPlayer) ? ' ⭐' : ''}</summary><ol class="small">${l.list.map(x => `<li class="${x.isPlayer ? 'gold-t bold' : ''}">${esc(x.label)}</li>`).join('')}</ol></details>`).join('') : '<div class="empty">매년 12월 말에 발표됩니다.</div>'}
      </div>
      <div class="card"><h3>🎧 씬의 최근 발매작 <span class="sub">평단 평균</span></h3>
        <div class="list">${scene.map(r => `<div class="row"><span class="grow">${esc(artistName(r.artistId))} 「${esc(r.title)}」 <span class="tiny muted">${typeName(r.type)} · ${r.genre}</span></span><span class="gold-t small">${star(r.critic - 5)}</span></div>`).join('') || '<div class="empty">없음</div>'}</div>
      </div>
    </div>
  </div>`;
}

/* ---------- 시상식 ---------- */
function viewAwards() {
  const cers = Object.values(S.awards).sort((a, b) => (b.year - a.year) || (AWARDS.find(x => x.id === b.awardId).week - AWARDS.find(x => x.id === a.awardId).week));
  return `<div class="page-title">🏆 시상식 <span class="pill gold">🏆 트로피 ${S.trophies.length}개</span><span class="pill">노미네이트 ${S.nominations.length}회</span></div>
  <div class="grid gauto mb">${AWARDS.map(a => {
    const nt = nextTOfWeek(a.week);
    return `<div class="card"><h3>${a.icon} ${a.name}</h3><div class="small muted">${a.desc}</div><div class="tiny dim mt">후보 발표 ${monthOf(a.nomWeek)}월 · 시상식 ${monthOf(a.week)}월 · ${a.currentYear ? '당해' : '전년도'} 발매작 대상${a.minGlobal ? ` · 해외 인지도 ${a.minGlobal}+ 필요` : ''}</div><div class="small mt">⏳ ${nt === S.t ? '이번 주 시상식!' : `시상식까지 ${nt - S.t}주`}</div></div>`;
  }).join('')}</div>
  ${S.trophies.length ? `<div class="card mb"><h3>🏛️ 트로피 진열장</h3><div class="grid gauto">${S.trophies.slice().reverse().map(t => `<div class="trophy"><div class="row"><span class="i">${t.icon}</span><div class="grow"><div class="bold gold-t">${esc(t.award)} ${t.year}</div><div class="small">${esc(t.cat)}${t.major ? ' <span class="pill gold">종합</span>' : ''}</div><div class="tiny muted">${esc(t.work)}</div></div></div></div>`).join('')}</div></div>` : ''}
  ${cers.length ? cers.map(c => {
    const a = AWARDS.find(x => x.id === c.awardId);
    const mine = c.cats.some(cat => cat.nominees.some(n => n.isPlayer));
    return `<details class="card mb" ${mine && (!c.done || S.t - nextTOfWeek(a.week) < 8) ? 'open' : ''}><summary style="cursor:pointer"><b>${a.icon} ${a.name} ${c.year}</b> <span class="small muted">(${c.eligYear}년 발매작) · ${c.done ? '시상 완료' : `시상식 ${nextTOfWeek(a.week) - S.t}주 후`}</span>${mine ? ' <span class="pill acc">내 노미네이트</span>' : ''}</summary>
      <div class="grid gauto mt">${c.cats.map(cat => `<div class="review"><div class="bold mb">${esc(cat.name)}${cat.major ? ' <span class="pill gold">종합</span>' : ''}</div>${cat.nominees.map(n => `<div class="nom ${cat.winner === n.label ? 'win' : ''} ${n.isPlayer ? 'me' : ''}">${cat.winner === n.label ? '🏆' : '•'} <span>${esc(n.label)}</span></div>`).join('')}</div>`).join('')}</div></details>`;
  }).join('') : '<div class="card empty">아직 열린 시상식이 없습니다. 1월부터 시상식 시즌이 시작됩니다.</div>'}`;
}

/* ---------- 아티스트 ---------- */
function viewArtists() {
  const p = S.player;
  let list = S.npcs.filter(n => n.region === UI.artistRegion && n.role === UI.artistRole && n.debutYear <= yearOf(S.t));
  if (UI.artistGenre !== 'all') list = list.filter(n => n.genre === UI.artistGenre);
  list.sort((a, b) => UI.artistSort === 'rel' ? b.rel - a.rel : UI.artistSort === 'skill' ? b.skill - a.skill : b.fame - a.fame);
  const myCrew = p.crew && crewOf(p.crew);
  return `<div class="page-title">🤝 아티스트 <span class="small muted">친해지면 피처링 수락률↑ · 크루 영입 가능</span></div>
  <div class="row mb">
    <div class="tabs" style="margin:0">${[['KR', '🇰🇷 국내'], ['GLOBAL', '🌎 해외']].map(([v, n]) => `<button class="tab ${UI.artistRegion === v ? 'on' : ''}" data-act="af" data-k="artistRegion" data-v="${v}">${n}</button>`).join('')}</div>
    <div class="tabs" style="margin:0">${[['artist', '🎤 아티스트'], ['producer', '🎛️ 프로듀서']].map(([v, n]) => `<button class="tab ${UI.artistRole === v ? 'on' : ''}" data-act="af" data-k="artistRole" data-v="${v}">${n}</button>`).join('')}</div>
    <select style="width:auto" data-act-change="af-genre"><option value="all">모든 장르</option>${GENRES.map(g => `<option ${UI.artistGenre === g ? 'selected' : ''}>${g}</option>`).join('')}</select>
    <select style="width:auto" data-act-change="af-sort">${[['fame', '인지도순'], ['rel', '친밀도순'], ['skill', '실력순']].map(([v, n]) => `<option value="${v}" ${UI.artistSort === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
  </div>
  <div class="grid gauto">${list.map(n => {
    const lab = n.label && labelOf(n.label), crew = n.crew && crewOf(n.crew);
    const last = S.npcReleases.filter(r => r.artistId === n.id).slice(-1)[0];
    const ch = featChance(n);
    return `<div class="card">
      <div class="row"><div class="avatar" style="width:42px;height:42px;font-size:17px;background:linear-gradient(135deg,hsl(${(n.name.charCodeAt(0) * 37) % 360},60%,45%),hsl(${(n.name.charCodeAt(1 % n.name.length) * 53) % 360},60%,35%))">${esc(n.name.slice(0, 1))}</div>
      <div class="grow"><div class="bold">${esc(n.name)} ${n.debutYear === yearOf(S.t) ? '<span class="pill good">신인</span>' : ''}${inWar(n.id) ? '<span class="pill bad">⚔️ 디스전</span>' : ''}${(n.banUntil || 0) > S.t ? '<span class="pill bad">🚨 활동 중단</span>' : ''}</div><div class="tiny muted">${n.genre} · ${n.trait}${lab ? ' · ' + esc(lab.name) : ''}${crew ? ' · ' + esc(crew.name) : ''}</div></div></div>
      ${n.rival || n.mentor ? `<div class="row mt">${n.rival ? '<span class="pill bad">⚔️ 라이벌</span>' : ''}${n.mentor ? '<span class="pill good">🧔 멘토</span>' : ''}</div>` : ''}
      ${n.bio ? `<div class="small muted mt">${esc(n.bio)}</div>` : ''}
      <div class="col mt" style="gap:4px">${statRow('인지도', n.fame)}${statRow('실력', n.skill, 'b')}${statRow('친밀도', n.rel, n.rel >= 60 ? 'g' : n.rel < 20 ? 'r' : 'y')}</div>
      <div class="tiny muted mt">${n.role === 'producer' ? '프로듀싱' : '피처링'} 비용 ${fmtMoney(n.role === 'producer' ? Math.round(npcFee(n) * 0.7 / 10000) * 10000 : npcFee(n))} · 수락 확률 ${Math.round(Math.min(1, ch + (n.role === 'producer' ? 0.15 : 0)) * 100)}%</div>
      ${last ? `<div class="tiny dim">최근작: 「${esc(last.title)}」 (${dateLabel(last.t)})</div>` : ''}
      <div class="row mt"><button class="btn sm" data-act="bond" data-id="${n.id}" ${S.ap < 1 ? 'disabled' : ''}>🍻 친분 쌓기 (1)</button>
      ${n.region === 'KR' && n.role === 'artist' ? `<button class="btn sm bad" data-act="diss-song" data-id="${n.id}" ${S.ap < 1 ? 'disabled' : ''}>⚔️ 디스곡</button>` : ''}
      ${S.myLabel && n.region === 'KR' && n.label !== 'mylabel' ? `<button class="btn sm" data-act="sign" data-id="${n.id}" ${S.ap < 1 ? 'disabled' : ''} title="계약금 ${fmtMoney(signCost(n))}">🏷️ 영입 (${Math.round(signChance(n) * 100)}%)</button>` : ''}
      ${myCrew && myCrew.own && n.crew !== myCrew.id && n.role === 'artist' ? `<button class="btn sm" data-act="recruit" data-id="${n.id}" ${n.rel < 55 || S.ap < 1 || recruitChance(n) <= 0 ? 'disabled' : ''} title="${n.region === 'GLOBAL' ? '해외 아티스트는 해외 인지도 15+, 친밀도 55+ 필요' : '친밀도 55+ 필요'}">${n.region === 'GLOBAL' ? '🌎' : '🚩'} 크루 초대 (${Math.round(recruitChance(n) * 100)}%)</button>` : ''}
      ${n.role === 'artist' && p.skills.produce >= 35 && (n.region === 'KR' || p.globalFame >= 20) ? `<button class="btn sm" data-act="sell-beat" data-id="${n.id}" ${S.ap < 1 || inWar(n.id) ? 'disabled' : ''}>🎛️ 비트 제안</button>` : ''}</div>
    </div>`;
  }).join('') || '<div class="card empty">해당하는 아티스트가 없습니다.</div>'}</div>`;
}

/* ---------- 레이블 / 크루 ---------- */
function viewLabel() {
  const p = S.player;
  const lab = p.label && labelOf(p.label);
  const crew = p.crew && crewOf(p.crew);
  return `<div class="page-title">🏢 레이블 · 크루</div>
  ${viewMyLabel()}
  <div class="grid g2">
    <div class="card"><h3>📝 현재 계약</h3>
      ${S.myLabel ? `<div class="empty">자체 레이블 '${esc(S.myLabel.name)}' 소속 (수익 100%)</div>` : lab ? `<div class="bold" style="font-size:18px">${esc(lab.name)} <span class="pill acc">${lab.tier}</span></div>
        <div class="small muted mt">${esc(lab.desc)}</div>
        <div class="kpis mt">
          <div class="kpi"><div class="l">수익 배분</div><div class="big-num">${Math.round(lab.share * 100)}%</div></div>
          <div class="kpi"><div class="l">홍보력</div><div class="big-num">x${lab.promo}</div></div>
          <div class="kpi"><div class="l">남은 기간</div><div class="big-num">${Math.max(0, p.contract.endT - S.t)}주</div></div>
          <div class="kpi"><div class="l">올해 발매 / 의무</div><div class="big-num">${p.contract.released} / ${lab.quota}</div></div>
        </div>
        <div class="row mt"><button class="btn bad sm" data-act="leave-label">🚪 계약 해지 (위약금 ${fmtMoney(buyoutCost())})</button></div>` :
      `<div class="empty">무소속 (자체 유통, 수익 배분 90%)<div class="small mt">인지도가 오르면 레이블에서 계약 제안이 소식함으로 옵니다.</div></div>`}
    </div>
    <div class="card"><h3>🤜 크루</h3>
      ${crew ? `<div class="bold" style="font-size:18px">${esc(crew.name)} ${crew.own ? '<span class="pill gold">리더</span>' : ''}</div>
        <div class="small muted">${esc(crew.vibe)}</div>
        <div class="list mt">${crewMembers(crew.id).map(n => `<div class="row"><span class="grow">${esc(n.name)} <span class="tiny muted">${n.genre} · ⭐${Math.round(n.fame)}</span></span><span class="small">친밀도 ${Math.round(n.rel)}</span></div>`).join('') || '<div class="empty small">아직 멤버가 없습니다. 아티스트 탭에서 친밀도 55 이상인 아티스트를 영입하세요.</div>'}</div>
        <div class="row mt"><button class="btn sm" data-act="comp-form" ${unreleasedSongs().length ? '' : 'disabled'}>📀 크루 컴필레이션</button>${crew.own ? '<button class="btn sm bad" data-act="disband-crew">💥 크루 해체</button>' : '<button class="btn sm bad" data-act="leave-crew">🚪 크루 탈퇴</button>'}</div>
        <div class="tiny dim mt">크루 효과: 멤버와 친밀도 자동 상승, 피처링 수락률 +25%, 컴필레이션 앨범 발매 가능${globalCrewMates().length ? ` · 🌎 해외 멤버 ${globalCrewMates().length}명: 매주 해외 인지도 상승, 컴필레이션이 해외 차트를 노림` : ''}</div>` :
      `<div class="small muted mb">크루에 소속되어 있지 않습니다. 기존 크루의 초대를 받거나 직접 만들 수 있습니다.</div>
        <div class="row"><input id="crew-name" maxlength="16" placeholder="크루 이름" style="flex:1;min-width:140px"><button class="btn primary" data-act="found-crew">🚩 크루 창설 (300만원, 인지도 15+)</button></div>`}
    </div>
  </div>
  <h3 class="mt mb">🏢 레이블 목록</h3>
  <div class="grid gauto">${LABELS.map(l => {
    const ok = labelEligible(l);
    return `<div class="card" style="${p.label === l.id ? 'border-color:var(--accent)' : ''}"><h3>${esc(l.name)} <span class="pill ${l.tier === '인디' ? 'good' : l.tier === '글로벌' ? 'gold' : 'acc'}">${l.tier}</span></h3>
      <div class="small muted">${esc(l.desc)}</div>
      <div class="tiny mt">계약금 ~${fmtMoney(offerAmount(l))} · 배분 ${Math.round(l.share * 100)}% · 홍보 x${l.promo} · 평단 신뢰도 ${l.cred >= 0 ? '+' : ''}${l.cred}${l.global ? ` · 해외 진출 지원` : ''}</div>
      <div class="tiny dim">주력: ${l.genres.join(', ')} · ${Math.round(l.weeks / 52)}년 계약 · 연 ${l.quota}장 발매 의무</div>
      <div class="small mt ${ok ? 'good-t' : 'muted'}">${ok ? '✅ 계약 제안 가능 조건 충족' : `🔒 인지도 ${l.minFame}+${l.minGlobal ? `, 해외 인지도 ${l.minGlobal}+` : ''} 필요`}</div>
      ${ok && !p.label && !S.myLabel ? `<button class="btn sm mt" data-act="contact-label" data-id="${l.id}" ${S.ap < 1 ? 'disabled' : ''}>📞 데모 보내기 (1)</button>` : ''}
    </div>`;
  }).join('')}</div>
  ${!crew ? `<h3 class="mt mb">🤜 씬의 크루들 <span class="small muted">🌎 해외 크루는 해외 인지도 20+부터 초대가 옵니다</span></h3><div class="grid gauto">${S.crews.filter(c => !c.own).map(c => `<div class="card" ${c.region === 'GLOBAL' ? 'style="border-color:#0369a1"' : ''}><h3>${c.region === 'GLOBAL' ? '🌎 ' : ''}${esc(c.name)}</h3><div class="small muted">${esc(c.vibe)}</div><div class="tiny mt">멤버: ${crewMembers(c.id).map(n => `${esc(n.name)}(${Math.round(n.rel)})`).join(', ')}</div><div class="tiny dim">괄호 안은 나와의 친밀도. 멤버들과 친해지면 초대가 옵니다.</div></div>`).join('')}</div>` : ''}`;
}

/* ---------- SNS ---------- */
function viewSns() {
  const p = S.player;
  const pf = UI.snsPlatform;
  const types = POST_TYPES[pf];
  if (!types.find(t => t.id === UI.snsType)) UI.snsType = types[0].id;
  const pt = types.find(t => t.id === UI.snsType);
  const icons = { insta: '📸', x: '✖️', youtube: '▶️' };
  const rel = releasedSongs();
  const targets = S.npcs.filter(n => n.region === 'KR' && n.role === 'artist' && n.debutYear <= yearOf(S.t)).sort((a, b) => b.fame - a.fame);
  return `<div class="page-title">📱 SNS <span class="pill">이번 주 남은 게시 ${S.postsLeft}/3</span></div>
  <div class="grid g3 mb">${['insta', 'x', 'youtube'].map(k => `<div class="kpi"><div class="l">${icons[k]} ${PLATFORM_NAMES[k]}</div><div class="big-num">${fmtNum(p.followers[k])}</div></div>`).join('')}</div>
  <div class="grid g2">
    <div class="card"><h3>✍️ 새 게시물</h3>
      <div class="tabs">${['insta', 'x', 'youtube'].map(k => `<button class="tab ${pf === k ? 'on' : ''}" data-act="sns-pf" data-v="${k}">${icons[k]} ${PLATFORM_NAMES[k]}</button>`).join('')}</div>
      <div class="tabs">${types.map(t => `<button class="tab ${UI.snsType === t.id ? 'on' : ''}" data-act="sns-type" data-v="${t.id}">${t.name}</button>`).join('')}</div>
      <div class="col">
        ${pt.needSong ? `<label class="f"><span>곡 선택</span><select id="sns-song">${rel.length ? rel.slice().reverse().map(s => `<option value="${s.id}">${esc(s.title)}</option>`).join('') : '<option value="">발매된 곡이 없습니다</option>'}</select></label>` : ''}
        ${pt.needBudget ? `<label class="f"><span>뮤직비디오 예산</span><select id="sns-budget">${MV_BUDGETS.map((b, i) => `<option value="${i}" ${b.cost > p.money ? 'disabled' : ''}>${b.label}</option>`).join('')}</select></label>` : ''}
        ${pt.needTarget ? `<label class="f"><span>저격 대상</span><select id="sns-target">${targets.map(n => `<option value="${n.id}">${esc(n.name)} (⭐${Math.round(n.fame)}, ${n.trait})</option>`).join('')}</select></label><div class="tiny warn-t">⚠️ 저격하면 상대와 친밀도가 크게 떨어지고, 디스곡으로 응수할 수 있습니다.</div>` : ''}
        ${pt.needUnreleased ? `<div class="tiny muted">미발매 곡 티저를 공개해 기대감(하입)을 올립니다. 하입은 다음 발매 첫 주 스트리밍에 반영됩니다. 현재 하입: ${Math.round(p.hype)}</div>` : ''}
        <label class="f"><span>내용 (비워두면 기본 문구)</span><textarea id="sns-text" maxlength="280" placeholder="${esc(defaultPostText(pt.id, { title: rel.length ? rel[rel.length - 1].title : '신곡', npc: targets[0] ? targets[0].name : '' }))}"></textarea></label>
        <div class="tiny dim">감사/사랑 같은 따뜻한 말은 여론에 도움이 되고, 욕설은 논란을 부릅니다.</div>
        <button class="btn primary" data-act="post" ${S.postsLeft <= 0 ? 'disabled' : ''}>게시하기</button>
      </div>
    </div>
    <div class="col" style="gap:12px">
      ${S.posts.length ? S.posts.slice(0, 15).map(postEl).join('') : '<div class="card empty">아직 게시물이 없습니다.</div>'}
    </div>
  </div>`;
}
function postEl(po) {
  const icons = { insta: '📸', x: '✖️', youtube: '▶️' };
  return `<div class="post"><div class="row small"><b>${icons[po.platform]} ${esc(S.player.stage)}</b><span class="muted">· ${po.typeName} · ${dateLabel(po.t)}</span>${po.viral ? '<span class="pill gold">🚀 바이럴</span>' : ''}</div>
  <div class="ptxt">${esc(po.text)}</div>
  <div class="small muted">${po.platform === 'youtube' ? '👁️ 조회수' : '♥ 좋아요'} ${fmtNum(po.likes)} · 팔로워 +${fmtNum(po.newF)}</div>
  <div class="cm">${po.comments.map(c => `<div class="small"><b>@${esc(c.handle)}</b> <span class="tiny muted">${PERSONAS[c.persona].icon}</span> ${esc(c.text)}</div>`).join('')}</div></div>`;
}

/* ---------- 팬 반응 ---------- */
function viewFans() {
  const p = S.player;
  const fol = totalFollowers();
  const core = p.coreRatio, anti = p.antiRatio, casual = Math.max(0, 100 - core - anti);
  let list = S.reactions;
  if (UI.fanFilter !== 'all') list = list.filter(r => r.persona === UI.fanFilter);
  const counts = {}; S.reactions.slice(0, 200).forEach(r => counts[r.persona] = (counts[r.persona] || 0) + 1);
  const rel = releasedSongs().filter(x => !x.free);
  return `<div class="page-title">💬 팬 반응</div>
  <div class="card mb" ${S.fandom ? `style="border-color:${esc(S.fandom.color)}"` : ''}>
    ${S.fandom ? `<h3>💜 공식 팬덤 '${esc(S.fandom.name)}' <span class="sub">${dateLabel(S.fandom.foundedT)} 창단 · 찐팬 약 ${fmtNum(coreFans())}명 · 총공 ${S.fandom.parties}회</span></h3>
      <div class="row"><select id="party-song" style="flex:1;min-width:160px">${rel.slice().reverse().map(x => `<option value="${x.id}">${esc(x.title)}</option>`).join('') || '<option value="">발매곡 없음</option>'}</select>
      <button class="btn primary" data-act="stream-party" ${streamPartyCooldown() || !rel.length ? 'disabled' : ''}>📢 스밍 총공 ${streamPartyCooldown() ? `(${streamPartyCooldown()}주 후)` : ''}</button></div>
      <div class="tiny dim mt">찐팬이 많을수록 효과가 큽니다. 6주에 한 번. 안티가 조금 늘 수 있어요.</div>` :
    `<h3>💜 팬덤 만들기 <span class="sub">찐팬 ${fmtNum(coreFans())} / 1,000명</span></h3>
      <div class="row"><input id="fd-name" maxlength="12" placeholder="팬덤 이름 (예: 새벽단)" style="flex:1;min-width:140px"><input type="color" id="fd-color" value="#a855f7"><button class="btn primary" data-act="make-fandom" ${coreFans() < 1000 ? 'disabled' : ''}>창단</button></div>
      <div class="tiny dim mt">팬덤이 생기면 찐팬 댓글에 팬덤명이 등장하고, '스밍 총공'으로 원하는 곡을 밀어 올릴 수 있어요.</div>`}
  </div>
  <div class="grid g2 mb">
    <div class="card"><h3>💜 팬덤 분위기 <span class="sub">${sentimentLabel(p.sentiment)}</span></h3>
      <div class="gauge"><i style="left:${clamp(p.sentiment, 1, 99)}%"></i></div>
      <div class="row small muted mt"><span>최악</span><span class="grow"></span><span>열광</span></div>
      <div class="small muted mt">발매작의 완성도, SNS 활동, 논란, 수상 등에 따라 움직입니다. 여론이 나쁘면 팔로워가 빠집니다.</div>
    </div>
    <div class="card"><h3>👥 팬 구성 <span class="sub">총 ${fmtNum(fol)}명</span></h3>
      <div class="stack"><div style="width:${core}%;background:#7c3aed">찐팬 ${Math.round(core)}%</div><div style="width:${casual}%;background:#334155">라이트팬 ${Math.round(casual)}%</div><div style="width:${anti}%;background:#991b1b">${anti > 6 ? `안티 ${Math.round(anti)}%` : ''}</div></div>
      <div class="small muted mt">찐팬 약 ${fmtNum(fol * core / 100)}명 · 안티 약 ${fmtNum(fol * anti / 100)}명. 찐팬은 좋은 작품과 팬 소통으로, 안티는 유명해질수록·논란이 생길수록 늘어납니다.</div>
    </div>
  </div>
  <div class="tabs"><button class="tab ${UI.fanFilter === 'all' ? 'on' : ''}" data-act="fan-filter" data-v="all">전체</button>${Object.keys(PERSONAS).map(k => `<button class="tab ${UI.fanFilter === k ? 'on' : ''}" data-act="fan-filter" data-v="${k}">${PERSONAS[k].icon} ${PERSONAS[k].label} ${counts[k] ? `<span class="dim">${counts[k]}</span>` : ''}</button>`).join('')}</div>
  <div class="card"><div class="list">${list.slice(0, 80).map(reactionEl).join('') || '<div class="empty">반응이 없습니다.</div>'}</div></div>`;
}

/* ---------- 소식함 ---------- */
function viewInbox() {
  return `<div class="page-title">📬 소식함 <span class="small muted">제안은 기한이 지나면 사라집니다</span></div>
  ${S.inbox.length ? `<div class="col">${S.inbox.map(inboxEl).join('')}</div>` : '<div class="card empty">새 소식이 없습니다. 다음 주로 넘어가 보세요.</div>'}`;
}
function inboxEl(m) {
  const b = (choice, label, cls = '') => `<button class="btn sm ${cls}" data-act="inbox" data-id="${m.id}" data-c="${choice}">${label}</button>`;
  let btns = '';
  switch (m.type) {
    case 'feature': case 'gig': btns = b('accept', '수락 (행동력 1)', 'good') + b('decline', '거절'); break;
    case 'label': case 'renew': btns = b('accept', '계약하기', 'good') + b('decline', '거절'); break;
    case 'crew': btns = b('accept', '합류', 'good') + b('decline', '거절'); break;
    case 'comp': btns = `<select id="comp-song-${m.id}" style="width:auto">${unreleasedSongs().map(s => `<option value="${s.id}">${esc(s.title)} (${grade(s.quality)})</option>`).join('')}</select>` + b('accept', '이 곡으로 참여', 'good') + b('decline', '거절'); break;
    case 'tv': btns = b('accept', '출연한다', 'good') + b('decline', '거절'); break;
    case 'gfest': btns = b('accept', '🎡 출연 (행동력 2)', 'good') + b('decline', '거절'); break;
    case 'brand': btns = b('accept', '광고 촬영', 'good') + b('decline', '거절'); break;
    case 'diss': btns = b('song', '🔥 답디스 작업하기', 'good') + b('sns', '✖️ SNS 장외전') + b('decline', '무시 (패배 처리)'); break;
    case 'case': { const cs = S.cases.find(c => c.id === m.data.caseId); btns = cs && !cs.plea ? b('admit', '🙇 혐의 인정·사과') + b('deny', '🗣️ 혐의 부인') : ''; btns += cs && cs.lawyer < 1 ? b('lawyer1', '⚖️ 변호사 선임 (5천만원)') : ''; btns += cs && cs.lawyer < 2 ? b('lawyer2', '🏛️ 대형 로펌 (2억원)') : ''; break; }
    case 'civil': btns = b('settle', '🤝 합의') + b('fight', '⚖️ 법정 다툼'); break;
    case 'tax': btns = b('honest', '성실 신고', 'good') + b('trick', '🚨 "절세" 꼼수 (40% 누락)') + b('evade', '🚨 신고 누락'); break;
    case 'truce': btns = b('accept', '🤝 화해', 'good') + b('decline', '거절'); break;
    case 'scandal': btns = b('apologize', '🙇 사과문 게시') + b('legal', '⚖️ 법적 대응') + b('decline', '무대응'); break;
    case 'story': { const ev = STORY_EVENTS.find(e => e.id === m.data.eventId); btns = ev ? ev.choices.map(c => b(c.id, esc(c.label), 'good')).join('') : ''; break; }
  }
  return `<div class="inbox-item"><div class="row"><span class="tt grow">${esc(m.title)}</span><span class="tiny muted">${dateLabel(m.t)}${m.expires ? ` · ${Math.max(0, m.expires - S.t)}주 남음` : ''}</span></div><div class="tx">${esc(m.text)}</div><div class="row">${btns}</div></div>`;
}

/* ---------- 뉴스 ---------- */
function viewNews() {
  return `<div class="page-title">📰 뉴스</div><div class="card"><div class="list">${S.news.slice(0, 200).map(newsEl).join('') || '<div class="empty">없음</div>'}</div></div>`;
}

/* ---------- 주간 리포트 ---------- */
function weeklyHtml(sm) {
  const p = S.player;
  const myRanks = [];
  S.charts.melon.forEach((e, i) => { if (e.isPlayer || e.featPlayer) myRanks.push(`🍈 ${i + 1}위 ${e.title}`); });
  S.charts.hot100.forEach((e, i) => { if (e.isPlayer || e.featPlayer) myRanks.push(`🇺🇸 HOT100 ${i + 1}위 ${e.title}`); });
  const delta = (v, d = 0) => `<span class="${v >= 0 ? 'good-t' : 'bad-t'}">${v >= 0 ? '+' : ''}${d ? v.toFixed(d) : fmtNum(v)}</span>`;
  return `<h2>📅 ${dateLabel(S.t)} 주간 리포트</h2>
  ${sm.chapter ? `<div class="review mb" style="border-color:var(--accent)"><div class="bold" style="font-size:16px">📖 ${esc(sm.chapter.title)}</div><div class="small muted mt">${esc(sm.chapter.text)}</div></div>` : ''}
  <div class="summary-kpis">
    <div class="kpi"><div class="l">🎧 국내 스트리밍</div><div class="big-num">${fmtNum(sm.dom || 0)}</div></div>
    <div class="kpi"><div class="l">🌎 해외 스트리밍</div><div class="big-num">${fmtNum(sm.glob || 0)}</div></div>
    <div class="kpi"><div class="l">💰 수입 / 지출</div><div class="bold">${fmtMoney(sm.income)} / <span class="bad-t">${fmtMoney(sm.expense)}</span></div></div>
    <div class="kpi"><div class="l">👥 팔로워</div><div class="bold">${delta(sm.followersDelta)}</div></div>
    <div class="kpi"><div class="l">⭐ 국내 인지도</div><div class="bold">${p.fame.toFixed(1)} (${delta(sm.fameDelta, 1)})</div></div>
    <div class="kpi"><div class="l">🌎 해외 인지도</div><div class="bold">${p.globalFame.toFixed(1)} (${delta(sm.globalDelta, 1)})</div></div>
  </div>
  ${myRanks.length ? `<div class="row mt">${myRanks.slice(0, 8).map(r => `<span class="pill acc">${esc(r)}</span>`).join('')}</div>` : ''}
  ${(sm.chart.length || sm.events.length) ? `<div class="ev-list">${sm.chart.concat(sm.events).map(e => `<div>${esc(e)}</div>`).join('')}</div>` : '<div class="muted mt">조용한 한 주였습니다.</div>'}
  ${S.inbox.filter(m => m.t === S.t).length ? `<div class="mt"><span class="pill acc">📬 새 제안 ${S.inbox.filter(m => m.t === S.t).length}건</span></div>` : ''}
  <div class="foot"><label class="row small muted" style="margin-right:auto"><input type="checkbox" data-act="toggle-weekly" ${UI.showWeekly ? 'checked' : ''}> 매주 리포트 보기</label>
  ${S.inbox.filter(m => m.t === S.t).length ? '<button class="btn" data-act="goto-inbox">소식함 열기</button>' : ''}<button class="btn primary" data-act="close">확인</button></div>`;
}

function careerHtml() {
  const p = S.player;
  const total = sum(S.songs.map(s => s.totalDom + s.totalGlob));
  return `<h2>🎬 ${esc(p.stage)}의 커리어</h2>
  <p style="font-size:15px;line-height:1.8">${esc(epilogue())}</p>
  <div class="summary-kpis">
    <div class="kpi"><div class="l">활동 기간</div><div class="big-num">${Math.floor((S.t - 1) / 52)}년 ${(S.t - 1) % 52}주</div></div>
    <div class="kpi"><div class="l">발매 작품</div><div class="big-num">${S.releases.length}</div></div>
    <div class="kpi"><div class="l">누적 스트리밍</div><div class="big-num">${fmtNum(total)}</div></div>
    <div class="kpi"><div class="l">트로피</div><div class="big-num">${S.trophies.length}</div></div>
    <div class="kpi"><div class="l">팔로워</div><div class="big-num">${fmtNum(totalFollowers())}</div></div>
    <div class="kpi"><div class="l">총 수입</div><div class="big-num">${fmtMoney(p.totalEarned)}</div></div>
  </div>
  <h3 class="mt mb">🏁 하이라이트</h3>
  <div class="row">${S.milestones.map(m => `<span class="pill gold">${esc(m.text)}</span>`).join('') || '<span class="muted">아직 없음</span>'}</div>
  <h3 class="mt mb">🏆 수상</h3>
  <div class="list">${S.trophies.map(t => `<div>${t.icon} ${esc(t.award)} ${t.year} — ${esc(t.cat)}</div>`).join('') || '<div class="muted">없음</div>'}</div>`;
}

/* ---------- 스토리 ---------- */
function viewStory() {
  const p = S.player;
  const r = S.rivalId && npc(S.rivalId), m = S.mentorId && npc(S.mentorId);
  const myWins = S.trophies.length, rWins = r ? (S.npcWins[r.id] || 0) : 0;
  const rRels = r ? S.npcReleases.filter(x => x.artistId === r.id).length : 0;
  const kindIcon = { prologue: '🌅', chapter: '📖', release: '💿', choice: '🔀', goal: '🎯', label: '🏷️', tour: '🎫', military: '🪖', story: '✏️' };
  const cmp = (label, a, b, fmt = v => Math.round(v)) => `<div class="stat" style="grid-template-columns:90px 1fr 1fr"><span>${label}</span><span class="${a >= b ? 'good-t bold' : ''}">${esc(p.stage)} ${fmt(a)}</span><span class="${b > a ? 'bad-t bold' : ''}">${esc(r.name)} ${fmt(b)}</span></div>`;
  const done = Object.keys(S.goalsDone).length;
  return `<div class="page-title">📖 스토리</div>
  <div class="card mb">
    <h3>챕터</h3>
    <div class="col">${CHAPTERS.map((c, i) => `<div class="row" style="opacity:${i <= S.chapter ? 1 : .35}"><span class="pill ${i === S.chapter ? 'acc' : i < S.chapter ? 'good' : ''}">${i < S.chapter ? '✓' : i === S.chapter ? '▶' : '🔒'}</span><b>${esc(c.title)}</b>${i <= S.chapter ? `<span class="small muted">${esc(fill(c.text, storyVars()))}</span>` : ''}</div>`).join('')}</div>
  </div>
  <div class="grid g2 mb">
    ${r ? `<div class="card"><h3>⚔️ 라이벌 — ${esc(r.name)} <span class="sub">친밀도 ${Math.round(r.rel)}</span></h3>
      <div class="small muted mb">${esc(r.bio)} · ${r.genre} · ${r.label ? esc(labelOf(r.label).name) : '무소속'}</div>
      <div class="col">${cmp('국내 인지도', p.fame, r.fame, v => v.toFixed(1))}${cmp('발매 작품', S.releases.length, rRels)}${cmp('트로피', myWins, rWins)}</div>
      <div class="small mt ${p.fame >= r.fame ? 'good-t' : 'warn-t'}">${p.fame >= r.fame + 10 ? '이제 라이벌이 당신을 쫓고 있다.' : p.fame >= r.fame ? '근소하게 앞서고 있다. 방심은 금물.' : '아직 라이벌이 한 발 앞서 있다.'}</div></div>` : ''}
    ${m ? `<div class="card"><h3>🧔 멘토 — ${esc(m.name)} <span class="sub">친밀도 ${Math.round(m.rel)}</span></h3>
      <div class="small muted">${esc(m.bio)}</div>
      <div class="col mt">${statRow('친밀도', m.rel, 'g')}</div>
      <div class="tiny dim mt">친해지면 조언과 무료 피처링 기회를 얻을 수 있습니다. ${S.flags.mentor_free ? '<b class="gold-t">🎁 다음 곡 무료 피처링 약속 있음</b>' : ''}</div></div>` : ''}
  </div>
  <div class="grid g2">
    <div class="card"><h3>🎯 커리어 목표 <span class="sub">${done}/${GOALS.length}</span></h3>
      <div class="list">${GOALS.map(g => { const t = S.goalsDone[g.id]; return `<div class="row"><span>${t ? '✅' : '⬜'}</span><span class="grow ${t ? '' : 'muted'}">${esc(g.text)}</span>${t ? `<span class="tiny dim">${dateLabel(t)}</span>` : ''}</div>`; }).join('')}</div>
    </div>
    <div class="card"><h3>📜 자서전 <span class="sub">${S.story.length}개의 기록</span></h3>
      <div class="list scroll" style="max-height:560px">${S.story.slice().reverse().map(x => `<div class="feed-item"><div class="ico">${kindIcon[x.kind] || '✏️'}</div><div class="grow"><div class="h">${dateLabel(x.t)}</div><div class="txt" style="line-height:1.7">${esc(x.text)}</div></div></div>`).join('')}</div>
    </div>
  </div>`;
}

/* ---------- 내 레이블 ---------- */
function viewMyLabel() {
  const p = S.player, L = S.myLabel;
  if (!L) {
    const can = p.fame >= 30 && !p.label;
    return `<div class="card mb"><h3>🏷️ 내 레이블 만들기</h3>
      <div class="small muted mb">직접 레이블을 세우면 내 음악 수익을 100% 가져가고, 아티스트를 영입해 그들의 수익 35%를 받습니다. 스튜디오·홍보팀·A&R팀을 키워 레이블을 성장시키세요. 조건: 국내 인지도 30+, 설립 자금 5,000만원, 다른 레이블과 계약이 없을 것.</div>
      <div class="row"><input id="lb-name" maxlength="20" placeholder="레이블 이름 (예: 새벽 레코즈)" style="flex:2;min-width:160px"><input id="lb-emoji" maxlength="4" value="🏷️" style="width:70px"><input type="color" id="lb-color" value="#a855f7">
      <button class="btn primary" data-act="found-label" ${can ? '' : 'disabled'}>설립하기 (5,000만원)</button></div>
      ${can ? '' : `<div class="tiny warn-t mt">${p.label ? '현재 다른 레이블과 계약 중입니다.' : `국내 인지도 30 필요 (현재 ${p.fame.toFixed(1)})`}</div>`}</div>`;
  }
  const lab = myLabelObj();
  const roster = labelRoster();
  return `<div class="card mb" style="border-color:${esc(L.color)}">
    <div class="row"><div class="avatar" style="background:${esc(L.color)}">${esc(L.emoji)}</div><div class="grow"><div class="name" style="font-size:20px;font-weight:800">${esc(L.name)}</div><div class="small muted">대표 ${esc(p.stage)} · ${dateLabel(L.foundedT)} 설립 · 홍보력 x${lab.promo}</div></div>
    <button class="btn sm bad" data-act="close-label">폐업</button></div>
    <div class="kpis mt">
      <div class="kpi"><div class="l">이번 주 순이익</div><div class="big-num ${L.weekly < 0 ? 'bad-t' : 'good-t'}">${fmtMoney(L.weekly)}</div></div>
      <div class="kpi"><div class="l">누적 매출</div><div class="big-num">${fmtMoney(L.revTotal)}</div></div>
      <div class="kpi"><div class="l">소속 아티스트</div><div class="big-num">${roster.length} / ${rosterCap()}</div></div>
      <div class="kpi"><div class="l">소속 작품</div><div class="big-num">${S.npcReleases.filter(r => npc(r.artistId) && npc(r.artistId).label === 'mylabel').length}</div></div>
    </div>
    <h3 class="mt">🏗️ 레이블 시설</h3>
    <div class="grid g3">${Object.keys(LABEL_UPGRADES).map(k => `<div class="review"><div class="bold">${LABEL_UPGRADES[k]} Lv.${L.lv[k]}</div><div class="tiny muted">${k === 'studio' ? '내 곡 사운드 +2/Lv, 소속 아티스트 평단 점수↑' : k === 'promo' ? '내 발매작·소속 아티스트 홍보력↑, 해외 노출↑' : '소속 정원 +2/Lv, 영입 성공률↑'}</div>${L.lv[k] < 3 ? `<button class="btn sm mt" data-act="upgrade-label" data-k="${k}">업그레이드 (${fmtMoney(LABEL_UPGRADE_COST[L.lv[k]])})</button>` : '<div class="small gold-t mt">MAX</div>'}</div>`).join('')}</div>
    <h3 class="mt">👥 소속 아티스트 <span class="sub">아티스트 탭에서 🏷️ 영입</span></h3>
    ${roster.length ? `<div class="list">${roster.map(n => { const last = S.npcReleases.filter(r => r.artistId === n.id).slice(-1)[0]; return `<div class="row"><b>${esc(n.name)}</b><span class="small muted grow">${n.genre} · ⭐${Math.round(n.fame)} · 실력 ${n.skill}${last ? ` · 최근작 「${esc(last.title)}」 평단 ${last.critic}` : ''}</span><button class="btn sm" data-act="drop-artist" data-id="${n.id}">계약 종료</button></div>`; }).join('')}</div>` : '<div class="empty small">아직 소속 아티스트가 없습니다. 신인일수록, 친할수록 영입하기 쉽습니다.</div>'}
    <div class="row mt"><button class="btn sm" data-act="lcomp-form" ${roster.length && unreleasedSongs().length ? '' : 'disabled'}>📀 레이블 컴필레이션 발매</button><span class="tiny dim">운영비: 주 ${fmtMoney(500000 + roster.length * 300000 + (L.lv.studio + L.lv.promo + L.lv.ar) * 200000)}</span></div>
  </div>`;
}

/* ---------- 투어 ---------- */
function tourHtml() {
  const p = S.player;
  const cd = tourCooldown(), md = merchCooldown();
  return `<h2>🎫 투어 · 굿즈</h2>
  <div class="small muted mb">투어는 행동력 3을 모두 쓰고 멘탈 -15. 관객 수는 팔로워·찐팬 비율·인지도·여론에 따라 정해집니다. 매진이 안 되면 적자가 날 수도 있어요.${cd ? ` <b class="warn-t">다음 투어까지 ${cd}주</b>` : ''}</div>
  <div class="col">${TOURS.map(tr => { const ok = p.fame >= tr.minFame && p.globalFame >= tr.minGlobal; return `<div class="review row"><div class="grow"><div class="bold">${tr.name}</div><div class="tiny muted">최대 ${fmtNum(tr.cap)}명 · 티켓 ${fmtMoney(tr.price)} · 제작비 ${fmtMoney(tr.cost)} · 인지도 ${tr.minFame}+${tr.minGlobal ? ` · 해외 ${tr.minGlobal}+` : ''}</div></div><button class="btn sm ${ok ? 'good' : ''}" data-act="tour" data-id="${tr.id}" ${ok && !cd && S.ap >= 3 && p.money >= tr.cost ? '' : 'disabled'}>개최</button></div>`; }).join('')}</div>
  <div class="hr"></div>
  <div class="review row"><div class="grow"><div class="bold">🛍️ 공식 굿즈 출시</div><div class="tiny muted">제작비 500만원 · 찐팬이 많을수록 잘 팔립니다 · 12주마다 가능${md ? ` (${md}주 후)` : ''}</div></div><button class="btn sm" data-act="merch" ${md || p.fame < 10 ? 'disabled' : ''}>출시</button></div>
  <div class="foot"><button class="btn" data-act="close">닫기</button></div>`;
}


/* ---------- 디스·사건 헬퍼 ---------- */
function styleOptions(genre) {
  return (STYLES[genre] || []).map(st => `<option value="${esc(st.name)}">${isHot(st.name) ? '🔥 ' : isCold(st.name) ? '🧊 ' : ''}${esc(st.name)}</option>`).join('');
}
function dissTargetOptions(type) {
  const kr = S.npcs.filter(n => n.region === 'KR' && n.role === 'artist' && n.debutYear <= yearOf(S.t));
  if (type === 'artist') return kr.sort((a, b) => b.fame - a.fame).map(n => `<option value="${n.id}">${esc(n.name)} (⭐${Math.round(n.fame)}, ${n.trait}${n.rival ? ', 라이벌' : ''}${inWar(n.id) ? ', 디스전 중' : ''})</option>`).join('');
  if (type === 'label') return LABELS.filter(l => kr.some(n => n.label === l.id)).map(l => `<option value="${l.id}">${esc(l.name)} (${kr.filter(n => n.label === l.id).length}명)</option>`).join('');
  if (type === 'crew') return S.crews.filter(c => !c.own && c.id !== S.player.crew).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  return '';
}
function presetDiss(npcId) {
  const th = $('#sf-theme'); if (!th) return;
  th.value = '디스'; $('#sf-diss').style.display = '';
  $('#sf-dtype').value = 'artist'; $('#sf-dtarget').innerHTML = dissTargetOptions('artist'); $('#sf-dtarget').value = npcId;
  $('#sf-dlevel').value = 'hard';
  const n = npc(npcId); if (n) $('#sf-title').value = pick(DISS_TRACK_TITLES);
}
function statusPills() {
  const p = S.player, out = [];
  if (isBanned()) out.push(`<span class="pill bad" title="시상식 후보·방송·광고에서 제외">🚫 퇴출 ${p.banUntil - S.t}주</span>`);
  if (isBoycotted()) out.push(`<span class="pill bad" title="스트리밍 -40%">📉 불매 ${p.boycottUntil - S.t}주</span>`);
  if (inReflection()) out.push(`<span class="pill" title="발매·SNS 시 역풍">🕯️ 자숙 ${p.reflectUntil - S.t}주</span>`);
  if ((p.notoriety || 0) >= 5) out.push(`<span class="pill bad" title="악명: 화제성↑, 광고·방송↓">😈 악명 ${Math.round(p.notoriety)}</span>`);
  if ((p.record || []).length) out.push(`<span class="pill bad">📁 전과 ${p.record.filter(r => r.verdict !== 'cleared').length}범</span>`);
  activeWars().forEach(w => out.push(`<span class="pill bad">⚔️ vs ${esc(artistName(w.npcId))} ${pollOf(w)}%</span>`));
  return out.length ? `<div class="row mb">${out.join('')}<button class="btn sm" data-act="tab" data-tab="beef">자세히</button></div>` : '';
}
function nightHtml() {
  return `<h2>🌃 밤의 유혹</h2>
  <div class="small muted mb">자유에는 대가가 따릅니다. 아래 선택은 언제든 수사·재판으로 이어질 수 있고, 걸리면 레이블 해지·불매·시상식 퇴출·수감까지 갈 수 있습니다.</div>
  <div class="col">
    <div class="review row"><div class="grow"><div class="bold">💊 위험한 애프터파티</div><div class="tiny muted">멘탈 +15, '실험적' 영감 +10 · 40주 동안 적발 위험 (마약 투약)</div></div><button class="btn sm bad" data-act="drug" ${S.ap < 1 ? 'disabled' : ''}>간다 (1)</button></div>
    <div class="review row"><div class="grow"><div class="bold">🎰 불법 도박장</div><div class="tiny muted">42% 확률로 판돈 2배 · 20주 동안 적발 위험</div></div>${[1000000, 10000000, 100000000].map(v => `<button class="btn sm bad" data-act="gamble" data-v="${v}" ${S.ap < 1 || S.player.money < v ? 'disabled' : ''}>${fmtMoney(v)}</button>`).join('')}</div>
  </div>
  <div class="tiny dim mt">그 밖에: 곡 작업의 '무단 샘플링', 발매의 '음원 사재기', 연초 세금 신고, 디스곡의 '금기' 수위, 그리고 예고 없이 찾아오는 유혹들(음주운전, 클럽 시비…)</div>
  <div class="foot"><button class="btn" data-act="close">돌아가기</button></div>`;
}

/* ---------- 디스·사건 탭 ---------- */
function viewBeef() {
  const p = S.player;
  const act = activeWars(), past = S.wars.filter(w => w.status !== 'active');
  const resName = { won: '🏆 승리', lost: '😓 패배', truce: '🤝 화해', ignored: '😶 무대응' };
  const warCard = w => {
    const n = npc(w.npcId), poll = pollOf(w);
    return `<div class="card"><h3>⚔️ vs ${esc(n.name)} <span class="sub">${dateLabel(w.startT)} 시작 · ${w.rounds.length}라운드</span></h3>
      <div class="row small"><b>${esc(p.stage)} ${poll}%</b><div class="grow bar" style="height:12px"><i style="width:${poll}%"></i></div><b>${100 - poll}% ${esc(n.name)}</b></div>
      <div class="list mt">${w.rounds.map(r => `<div class="row small"><span class="pill ${r.by === 'player' ? 'acc' : 'bad'}">${r.by === 'player' ? esc(p.stage) : esc(n.name)}</span><span class="grow">「${esc(r.title)}」 <span class="muted">${esc(r.punch || '')}</span></span><span class="gold-t">${r.score}점</span></div>`).join('') || '<div class="small muted">아직 아무도 곡을 내지 않았습니다.</div>'}</div>
      <div class="small mt ${w.awaiting === 'player' ? 'warn-t' : 'muted'}">${w.awaiting === 'player' ? `⏳ 당신의 차례 — ${Math.max(0, w.deadline - S.t)}주 안에 답디스를 내지 않으면 패배` : `⏳ ${esc(n.name)}의 답장을 기다리는 중 (${Math.max(0, w.deadline - S.t)}주 안에 답이 없으면 승리)`}</div>
      <div class="row mt"><button class="btn sm bad" data-act="diss-song" data-id="${n.id}" ${S.ap < 1 ? 'disabled' : ''}>🔥 답디스 작업</button><button class="btn sm" data-act="war-sns" data-id="${n.id}">✖️ SNS 장외전</button><button class="btn sm" data-act="truce" data-id="${w.id}">🤝 화해 제안</button></div></div>`;
  };
  const cases = S.cases.filter(c => c.status === 'investigation');
  return `<div class="page-title">⚔️ 디스·사건</div>
  <div class="card mb small muted">디스곡은 <b>작업실 → 주제 '디스'</b>에서 대상과 수위를 정해 만들고, 발매하면 디스전이 시작됩니다. 아티스트 탭의 ⚔️ 버튼으로 바로 겨냥할 수도 있어요. 상대가 답하지 못하면 승리, 6주 안에 응수하지 못하면 패배입니다. 커뮤니티 투표가 70%p 이상 벌어지면 KO.</div>
  ${statusPills()}
  <h3 class="mb">🔥 진행 중인 디스전 (${act.length})</h3>
  ${act.length ? `<div class="grid g2">${act.map(warCard).join('')}</div>` : '<div class="card empty">진행 중인 디스전이 없습니다.</div>'}
  <h3 class="mb mt">⚖️ 진행 중인 사건 (${cases.length})</h3>
  ${cases.length ? `<div class="grid g2">${cases.map(cs => { const c = CRIMES[cs.crime]; return `<div class="card" style="border-color:#7f1d1d"><h3>🚨 ${esc(c.name)} <span class="sub">${c.civil ? '민사' : '형사'} · 결과까지 ${Math.max(0, cs.trialT - S.t)}주</span></h3>
      <div class="small">입장: <b>${cs.plea === 'admit' ? '혐의 인정' : cs.plea === 'deny' ? '혐의 부인' : '미정'}</b> · 변호인: <b>${['없음', '형사 전문 변호사', '대형 로펌'][cs.lawyer]}</b> · 전과 ${priors()}범${c.civil ? ` · 청구액 ${fmtMoney(cs.amount || 0)}` : ''}</div>
      ${c.civil ? '<div class="tiny dim mt">소식함에서 합의하거나 법정 다툼을 선택하세요. 기한이 지나면 자동으로 재판이 열립니다.</div>' : `<div class="row mt">${!cs.plea ? `<button class="btn sm" data-act="case-act" data-id="${cs.id}" data-c="admit">🙇 혐의 인정</button><button class="btn sm" data-act="case-act" data-id="${cs.id}" data-c="deny">🗣️ 혐의 부인</button>` : ''}${cs.lawyer < 1 ? `<button class="btn sm" data-act="case-act" data-id="${cs.id}" data-c="lawyer1">⚖️ 변호사 (5천만원)</button>` : ''}${cs.lawyer < 2 ? `<button class="btn sm" data-act="case-act" data-id="${cs.id}" data-c="lawyer2">🏛️ 대형 로펌 (2억원)</button>` : ''}</div>
      <div class="tiny dim mt">인정하면 형이 가벼워지고, 부인하면 무혐의를 노릴 수 있지만 실패 시 더 무거워집니다. 전과가 있으면 불리합니다.</div>`}</div>`; }).join('')}</div>` : '<div class="card empty">진행 중인 사건이 없습니다. 깨끗하네요.</div>'}
  <div class="grid g2 mt">
    <div class="card"><h3>🕯️ 자숙</h3><div class="small muted mb">논란 후 활동을 멈추면 여론이 서서히 회복되고, 끝나면 불매가 풀립니다. 기간 중에 발매하면 역풍.</div>
      <div class="row">${[12, 26, 52].map(w => `<button class="btn sm" data-act="reflect" data-v="${w}" ${inReflection() ? 'disabled' : ''}>${w}주 자숙</button>`).join('')}</div></div>
    <div class="card"><h3>📁 전과 기록</h3>${(p.record || []).length ? `<div class="list">${p.record.map(r => `<div class="row small"><span class="grow">${esc(r.crime)}</span><span class="${r.verdict === 'cleared' ? 'good-t' : 'bad-t'}">${VERDICTS[r.verdict]}</span><span class="dim">${dateLabel(r.t)}</span></div>`).join('')}</div>` : '<div class="empty small">없음</div>'}</div>
  </div>
  <h3 class="mb mt">📜 지난 디스전</h3>
  ${past.length ? `<div class="card"><div class="list">${past.map(w => `<div class="row small"><span class="grow">vs ${esc(artistName(w.npcId))} · ${w.rounds.length}라운드</span><span>${resName[w.status] || w.status}${w.how ? ` (${esc(w.how)})` : ''}</span><span class="dim">${dateLabel(w.endT || w.startT)}</span></div>`).join('')}</div></div>` : '<div class="card empty">아직 없습니다.</div>'}`;
}

/* =========================================================
 *  이벤트 처리
 * ========================================================= */
document.addEventListener('click', e => {
  const bgEl = e.target.closest('[data-bg]');
  if (bgEl && e.target === bgEl) { closeModal(); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.tagName === 'INPUT' && el.type === 'checkbox' && el.dataset.act !== 'rf-toggle' && el.dataset.act !== 'toggle-weekly') return;
  handle(el.dataset.act, el);
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-act-change]');
  if (el) handleChange(el.dataset.actChange, el);
});
document.addEventListener('input', e => {
  const el = e.target.closest('[data-act-input]');
  if (el) handleInput(el.dataset.actInput, el);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#modal-root').innerHTML) closeModal();
});

function handle(act, el) {
  const d = el.dataset;
  switch (act) {
    // 시작 화면
    case 'pick-bg': UI.newBg = d.id; { const n = $('#ng-name').value, s = $('#ng-stage').value; renderStart(); $('#ng-name').value = n; $('#ng-stage').value = s; } return;
    case 'start': {
      const name = $('#ng-name').value.trim() || '김민수';
      const stage = $('#ng-stage').value.trim();
      if (!stage) { toast('활동명을 입력하세요!', 'bad'); return; }
      newGame({ name, stage, bgId: UI.newBg, genre: $('#ng-genre').value, gender: $('#ng-gender').value });
      UI.tab = 'home'; render();
      openModal(`<h2>📖 프롤로그</h2><p style="font-size:15px;line-height:1.8">${esc(S.story[0].text)}</p>
        <div class="review mt"><div class="bold">⚔️ 라이벌: ${esc(npc(S.rivalId).name)}</div><div class="small muted">같은 해에 데뷔하는 동갑내기. 앞으로 계속 마주치게 될 것이다.</div></div>
        <div class="review mt"><div class="bold">🧔 멘토: ${esc(npc(S.mentorId).name)}</div><div class="small muted">${esc(npc(S.mentorId).bio)}. 언젠가 조언을 건넬지도 모른다.</div></div>
        <div class="foot"><button class="btn primary" data-act="show-tutorial">다음 ▶</button></div>`);
      return;
    }
    case 'show-tutorial': {
      const stage = S.player.stage;
      openModal(`<h2>🎤 ${esc(stage)}의 이야기가 시작됩니다</h2>
        <div class="col small">
          <div>• 매주 <b>행동력 3</b>으로 곡 작업, 연습, 공연, 휴식 등을 할 수 있어요.</div>
          <div>• <b>작업실</b>에서 곡을 만들고 싱글/EP/정규 앨범으로 발매하세요. 제목과 트랙리스트는 직접 정합니다.</div>
          <div>• 발매하면 <b>리드머·IZM·Pitchfork</b> 등이 평가하고, 팬들이 다양한 반응을 보입니다.</div>
          <div>• 스트리밍이 쌓이면 <b>멜론 차트</b>에, 해외 인지도가 오르면 <b>빌보드</b>에 오를 수 있어요.</div>
          <div>• 매년 1~3월은 <b>시상식 시즌</b>(리드머 어워즈 → 그래미 → 한국힙합어워즈 → 한국대중음악상), 12월엔 연말 시상식.</div>
          <div>• <b>아티스트</b> 탭에서 친분을 쌓으면 피처링과 크루 영입이 쉬워집니다.</div>
          <div>• <b>📖 스토리</b>: 소식함으로 오는 인생 이벤트에서 선택하면 <b>영감</b>이 생기고, 같은 주제로 곡을 쓰면 완성도가 오릅니다.</div>
          <div>• 곡을 완성하면 <b>작업 노트</b>가, 발매하면 평론가들이 앨범 제목·타이틀곡·수록곡을 직접 언급하는 리뷰를 씁니다.</div>
          <div>• 인지도 30이 되면 <b>내 레이블</b>을 세워 아티스트를 영입할 수 있어요. 투어와 굿즈로 돈을 벌 수도 있습니다.</div>
          <div>• <b>⚔️ 디스·사건</b>: 디스곡의 대상(아티스트·레이블·크루·씬 전체·평론가·방송)과 수위를 직접 정하고, 답디스가 오가는 디스전을 벌일 수 있어요. 위험한 선택(무단 샘플링, 사재기, 탈세, 마약…)은 수사와 재판으로 이어질 수 있습니다.</div>
          <div>• 멘탈 관리 필수! 멘탈이 바닥나면 번아웃이 옵니다.</div>
          <div>• 준비됐으면 오른쪽 위 <b>다음 주 ▶</b>로 시간을 진행하세요.</div>
        </div><div class="foot"><button class="btn primary" data-act="close">시작하기</button></div>`);
      return;
    }
    case 'continue': if (load()) { UI.tab = 'home'; render(); } else toast('불러오기 실패', 'bad'); return;
    case 'import': {
      openModal(`<h2>📂 세이브 불러오기</h2><textarea id="imp" style="min-height:160px" placeholder="내보낸 세이브 코드를 붙여넣으세요"></textarea><div class="foot"><button class="btn" data-act="close">취소</button><button class="btn primary" data-act="do-import">불러오기</button></div>`);
      return;
    }
    case 'do-import': try { importSave($('#imp').value.trim()); closeModal(); UI.tab = 'home'; render(); toast('불러왔습니다', 'good'); } catch (err) { toast('올바르지 않은 세이브 코드입니다', 'bad'); } return;
    case 'close': closeModal(); render(); return;
    case 'tab': UI.tab = d.tab; closeModal(); render(); window.scrollTo(0, 0); return;
    case 'menu':
      openModal(`<h2>☰ 메뉴</h2><div class="col">
        <button class="btn" data-act="save-now">💾 지금 저장 (자동 저장도 됩니다)</button>
        <button class="btn" data-act="export">📤 세이브 코드 내보내기</button>
        <button class="btn" data-act="career">🎬 커리어 요약 보기</button>
        <button class="btn" data-act="identity">🪪 활동명 변경 · 장르 전향</button>
        <button class="btn bad" data-act="retire">🎤 은퇴하고 새 게임 시작</button>
      </div><div class="foot"><button class="btn" data-act="close">닫기</button></div>`);
      return;
    case 'save-now': save(); toast('저장했습니다', 'good'); return;
    case 'identity':
      openModal(`<h2>🪪 아이덴티티</h2>
        <label class="f"><span>새 활동명 (1년에 한 번, 인지도 약간 하락)</span><div class="row"><input id="id-name" maxlength="16" value="${esc(S.player.stage)}" style="flex:1"><button class="btn" data-act="do-stage-rename">변경</button></div></label>
        <label class="f mt"><span>주력 장르 전향 (26주에 한 번, 찐팬 일부 이탈)</span><div class="row"><select id="id-genre" style="flex:1">${GENRES.map(g => `<option ${g === S.player.genre ? 'selected' : ''}>${g}</option>`).join('')}</select><button class="btn" data-act="do-genre">전향</button></div></label>
        <div class="foot"><button class="btn" data-act="close">닫기</button></div>`);
      return;
    case 'do-stage-rename': { const nm = $('#id-name').value; closeModal(); result(renameStage(nm)); render(); return; }
    case 'do-genre': { const g = $('#id-genre').value; closeModal(); result(changeGenre(g)); render(); return; }
    case 'night-menu': openModal(nightHtml()); return;
    case 'sell-beat': result(sellBeat(d.id || null)); render(); return;
    case 'make-fandom': result(createFandom($('#fd-name').value, $('#fd-color').value)); render(); return;
    case 'stream-party': result(streamParty($('#party-song').value)); render(); return;
    case 'drug': closeModal(); result(actDrugParty()); render(); return;
    case 'gamble': closeModal(); result(actGamble(Number(d.v))); render(); return;
    case 'reflect': if (confirm(`${d.v}주간 자숙하시겠습니까?`)) { result(startReflection(Number(d.v))); render(); } return;
    case 'truce': result(proposeTruce(d.id)); render(); return;
    case 'war-sns': UI.tab = 'sns'; UI.snsPlatform = 'x'; UI.snsType = 'diss'; render(); { const sel = $('#sns-target'); if (sel) sel.value = d.id; } return;
    case 'case-act': { const r = d.c === 'lawyer1' ? hireLawyer(d.id, 1) : d.c === 'lawyer2' ? hireLawyer(d.id, 2) : setPlea(d.id, d.c); result(r); render(); return; }
    case 'export':
      openModal(`<h2>📤 세이브 코드</h2><div class="small muted mb">아래 코드를 복사해 두었다가 시작 화면의 '세이브 불러오기'에 붙여넣으면 됩니다.</div><textarea style="min-height:200px" readonly onclick="this.select()">${esc(exportSave())}</textarea><div class="foot"><button class="btn primary" data-act="close">닫기</button></div>`);
      return;
    case 'career': openModal(careerHtml() + `<div class="foot"><button class="btn primary" data-act="close">닫기</button></div>`); return;
    case 'retire':
      openModal(careerHtml() + `<div class="small warn-t mt">은퇴하면 현재 세이브가 삭제됩니다.</div><div class="foot"><button class="btn" data-act="close">취소</button><button class="btn bad" data-act="do-retire">은퇴하기</button></div>`);
      return;
    case 'do-retire': deleteSave(); S = null; closeModal(); render(); return;

    // 주간 진행
    case 'next-week': {
      if (S.ap > 0 && !el.dataset.confirm) {
        el.dataset.confirm = '1'; el.textContent = `행동력 ${S.ap} 남음 · 진행?`;
        setTimeout(() => { if (el.isConnected) { delete el.dataset.confirm; el.textContent = '다음 주 ▶'; } }, 2500);
        return;
      }
      const sm = nextWeek();
      render();
      if (UI.showWeekly || sm.events.length || sm.chart.length) openModal(weeklyHtml(sm));
      return;
    }
    case 'toggle-weekly': UI.showWeekly = el.checked; try { localStorage.setItem('utg_weekly', el.checked ? '1' : '0'); } catch (err) { } return;
    case 'goto-inbox': UI.tab = 'inbox'; closeModal(); render(); return;

    // 행동
    case 'practice-menu':
      openModal(`<h2>📚 연습 (행동력 1)</h2><div class="actions">${Object.keys(SKILL_NAMES).map(k => `<button class="act" data-act="practice" data-k="${k}"><b>${SKILL_NAMES[k]}</b><span>현재 ${S.player.skills[k].toFixed(1)}${k === 'vocal' ? ' · 레슨비 30만원' : k === 'produce' ? ' · 장비비 20만원' : ''}</span></button>`).join('')}</div><div class="foot"><button class="btn" data-act="close">취소</button></div>`);
      return;
    case 'practice': closeModal(); result(actPractice(d.k)); render(); return;
    case 'gig': result(actGig()); render(); return;
    case 'rest': result(actRest()); render(); return;
    case 'parttime': result(actPartTime()); render(); return;
    case 'global-promo': result(actGlobalPromo()); render(); return;
    case 'bond': result(actBond(d.id)); render(); return;
    case 'recruit': result(recruit(d.id)); render(); return;

    // 곡 작업
    case 'song-form': case 'diss-song': {
      if (S.ap < 1) { toast('행동력이 부족합니다', 'bad'); return; }
      openModal(songFormHtml());
      if (act === 'diss-song') presetDiss(d.id);
      return;
    }
    case 'make-song': {
      const theme = $('#sf-theme').value;
      const diss = theme === '디스' ? { type: $('#sf-dtype').value, id: $('#sf-dtarget') ? $('#sf-dtarget').value : null, level: $('#sf-dlevel').value, punch: $('#sf-dpunch').value } : null;
      const res = makeSong({ title: $('#sf-title').value, genre: $('#sf-genre').value, style: $('#sf-style').value, sample: $('#sf-sample').value, theme, diss, deep: $('#sf-deep').value === '1', producer: $('#sf-prod').value || null, feats: [$('#sf-f1').value, $('#sf-f2').value].filter((v, i, a) => v && a.indexOf(v) === i) });
      if (!res.ok) { toast(res.msg, 'bad'); return; }
      render();
      openModal(`<h2>🎧 곡 완성!</h2>${songCard(res.song, { openNote: true })}${res.notes.length ? `<div class="col small mt">${res.notes.map(n => `<div>${esc(n)}</div>`).join('')}</div>` : ''}<div class="foot"><button class="btn" data-act="tab" data-tab="studio">작업실로</button><button class="btn primary" data-act="close">확인</button></div>`);
      return;
    }
    case 'rename-song': {
      const s = song(d.id);
      openModal(`<h2>✏️ 곡 제목 변경</h2><input id="rn" maxlength="40" value="${esc(s.title)}"><div class="foot"><button class="btn" data-act="close">취소</button><button class="btn primary" data-act="do-rename" data-id="${s.id}">변경</button></div>`);
      return;
    }
    case 'do-rename': renameSong(d.id, $('#rn').value); closeModal(); render(); return;
    case 'delete-song': if (confirm('이 곡을 폐기할까요?')) { deleteSong(d.id); render(); } return;

    // 발매
    case 'release-form': case 'comp-form': case 'lcomp-form': {
      if (!unreleasedSongs().length) { toast('미발매 곡이 없습니다', 'bad'); return; }
      const comp = act !== 'release-form';
      UI.rel = { comp, source: act === 'lcomp-form' ? 'label' : 'crew', type: comp ? 'compilation' : 'EP', title: '', ids: [], titleId: null, concept: '', promo: 0, cover: { c1: '#7c3aed', c2: '#ec4899', emoji: comp ? '📀' : '🎵' } };
      if (!comp && unreleasedSongs().length < 3) UI.rel.type = 'single';
      rerenderRelease(); return;
    }
    case 'rf-type': UI.rel.type = d.type; rerenderRelease(); return;
    case 'rf-toggle': {
      const r = UI.rel;
      if (r.ids.includes(d.id)) { r.ids = r.ids.filter(x => x !== d.id); if (r.titleId === d.id) r.titleId = r.ids[0] || null; }
      else { r.ids.push(d.id); if (!r.titleId) r.titleId = d.id; }
      rerenderRelease(); return;
    }
    case 'rf-title-track': UI.rel.titleId = d.id; rerenderRelease(); return;
    case 'rf-move': {
      const ids = UI.rel.ids; const i = ids.indexOf(d.id); const j = i + Number(d.d);
      if (j >= 0 && j < ids.length) { [ids[i], ids[j]] = [ids[j], ids[i]]; }
      rerenderRelease(); return;
    }
    case 'do-release': case 'do-comp': {
      const r = UI.rel;
      const res = act === 'do-comp'
        ? releaseCompilation({ title: r.title, songIds: r.ids, cover: r.cover, promo: r.promo, source: r.source })
        : releaseWork({ type: r.type, title: r.title, trackIds: r.ids, titleTrackId: r.titleId, cover: r.cover, concept: r.concept, promo: r.promo, sajaegi: !!r.sajaegi, partner: r.partner || null });
      if (!res.ok) { toast(res.msg, 'bad'); return; }
      render();
      openModal(releaseResultHtml(res.release, res.notes), 'wide');
      return;
    }
    case 'show-reviews': {
      const r = release(d.id);
      openModal(`<h2>📝 「${esc(r.title)}」 리뷰</h2><div class="col">${r.reviews.map(reviewEl).join('')}</div><div class="foot"><button class="btn primary" data-act="close">닫기</button></div>`);
      return;
    }

    // 차트 / 필터
    case 'chart-tab': UI.chartTab = d.c; render(); return;
    case 'af': UI[d.k] = d.v; render(); return;
    case 'fan-filter': UI.fanFilter = d.v; render(); return;

    // 레이블 / 크루
    case 'leave-label': if (confirm(`위약금 ${fmtMoney(buyoutCost())}을 내고 계약을 해지할까요?`)) { result(leaveLabel()); render(); } return;
    case 'contact-label': {
      if (!useAP(1)) { toast('행동력이 부족합니다', 'bad'); return; }
      const lab = labelOf(d.id);
      const chance = 0.35 + S.player.fame / 200 + (lab.genres.includes(S.player.genre) ? 0.15 : 0);
      if (Math.random() < chance && !S.inbox.some(m => m.type === 'label')) {
        const adv = offerAmount(lab);
        addInbox({ type: 'label', title: `✍️ ${lab.name} 계약 제안`, text: `[${lab.tier}] 보내준 데모 잘 들었습니다!\n계약금 ${fmtMoney(adv)} · 수익 배분 ${Math.round(lab.share * 100)}% · 홍보력 x${lab.promo} · 기간 ${Math.round(lab.weeks / 52)}년 · 연간 발매 의무 ${lab.quota}장`, data: { labelId: lab.id, advance: adv }, expires: S.t + 4 });
        toast(`${lab.name}에서 답장이 왔습니다! 소식함을 확인하세요.`, 'good');
      } else toast(`${lab.name}: "아쉽지만 지금은 함께하기 어렵겠습니다."`, 'bad');
      save(); render(); return;
    }
    case 'found-crew': result(foundCrew($('#crew-name').value)); render(); return;
    case 'leave-crew': if (confirm('크루를 탈퇴할까요?')) { result(leaveCrew()); render(); } return;
    case 'disband-crew': if (confirm('크루를 해체할까요?')) { result(disbandCrew()); render(); } return;

    // SNS
    case 'sns-pf': UI.snsPlatform = d.v; UI.snsType = POST_TYPES[d.v][0].id; render(); return;
    case 'sns-type': UI.snsType = d.v; render(); return;
    case 'post': {
      const res = makePost({
        platform: UI.snsPlatform, type: UI.snsType, text: $('#sns-text').value,
        songId: $('#sns-song') ? $('#sns-song').value : null, targetId: $('#sns-target') ? $('#sns-target').value : null,
        budget: $('#sns-budget') ? Number($('#sns-budget').value) : 0
      });
      if (!res.ok) { toast(res.msg, 'bad'); return; }
      (res.notes || []).forEach(n => toast(n));
      toast(`게시 완료! ${res.post.platform === 'youtube' ? '조회수' : '좋아요'} ${fmtNum(res.post.likes)}, 팔로워 +${fmtNum(res.post.newF)}`, 'good');
      render(); return;
    }

    // 소식함
    case 'inbox': {
      const extra = {};
      const sel = $('#comp-song-' + d.id);
      if (sel) extra.songId = sel.value;
      const res = resolveInbox(d.id, d.c, extra);
      if (!res.ok) { toast(res.msg, 'bad'); return; }
      toast(res.msg, 'good');
      render();
      if (res.release) openModal(releaseResultHtml(res.release, []), 'wide');
      if (res.openDiss) { openModal(songFormHtml()); presetDiss(res.openDiss); }
      if (res.story) openModal(`<h2>📖 ${esc(res.story.title)}</h2><div class="small muted">선택: ${esc(res.story.choice)}</div><p style="font-size:15px;line-height:1.8">${esc(res.story.res)}</p>${res.story.notes.map(n => `<div class="small">${esc(n)}</div>`).join('')}<div class="foot"><button class="btn primary" data-act="close">계속</button></div>`);
      return;
    }
    case 'ff-military': {
      const wasPrison = !!S.player.prison;
      const ev = fastForwardHiatus();
      render();
      openModal(`<h2>${wasPrison ? '🔓 출소!' : '🎖️ 전역!'}</h2><p>${wasPrison ? '수감 생활을 마쳤습니다.' : '78주의 군 복무를 마쳤습니다.'} 그동안의 주요 소식:</p><div class="ev-list scroll">${ev.map(e => `<div>${esc(e)}</div>`).join('') || '<div>조용한 시간이었다.</div>'}</div><div class="foot"><button class="btn primary" data-act="close">복귀하기</button></div>`);
      return;
    }
    case 'tour-menu': openModal(tourHtml()); return;
    case 'tour': closeModal(); result(actTour(d.id)); render(); return;
    case 'merch': closeModal(); result(actMerch()); render(); return;
    case 'found-label': result(foundLabel({ name: $('#lb-name').value, emoji: $('#lb-emoji').value, color: $('#lb-color').value })); render(); return;
    case 'upgrade-label': result(upgradeLabel(d.k)); render(); return;
    case 'sign': result(signArtist(d.id)); render(); return;
    case 'drop-artist': if (confirm('계약을 종료할까요?')) { result(dropArtist(d.id)); render(); } return;
    case 'close-label': if (confirm('레이블을 폐업할까요? 소속 아티스트와의 계약이 모두 끝납니다.')) { result(closeLabel()); render(); } return;
  }
}

function handleChange(act, el) {
  switch (act) {
    case 'sf-cost': {
      const c = songCost({ producer: $('#sf-prod').value || null, feats: [$('#sf-f1').value, $('#sf-f2').value] });
      $('#sf-cost').textContent = fmtMoney(c);
      return;
    }
    case 'rf-promo': UI.rel.promo = Number(el.value); return;
    case 'rf-sajaegi': UI.rel.sajaegi = el.checked; return;
    case 'rf-partner': UI.rel.partner = el.value || null; return;
    case 'sf-genre': $('#sf-style').innerHTML = styleOptions(el.value); return;
    case 'sf-theme': $('#sf-diss').style.display = el.value === '디스' ? '' : 'none'; return;
    case 'sf-dtype': { const t = $('#sf-dtarget'); t.innerHTML = dissTargetOptions(el.value); t.disabled = !t.options.length; t.parentElement.style.opacity = t.options.length ? 1 : .4; return; }
    case 'rf-rename': renameSong(el.dataset.id, el.value); return;
    case 'af-genre': UI.artistGenre = el.value; render(); return;
    case 'af-sort': UI.artistSort = el.value; render(); return;
  }
}
function handleInput(act, el) {
  const r = UI.rel;
  switch (act) {
    case 'rf-title': r.title = el.value; { const ct = document.querySelector('.modal .cover .ct'); if (ct) ct.textContent = el.value || '제목 없음'; } return;
    case 'rf-concept': r.concept = el.value; return;
    case 'rf-cover': {
      r.cover = { c1: $('#rf-c1').value, c2: $('#rf-c2').value, emoji: $('#rf-emoji').value || '🎵' };
      const cv = document.querySelector('.modal .cover');
      if (cv) { cv.style.background = `linear-gradient(135deg,${r.cover.c1},${r.cover.c2})`; cv.querySelector('.e').textContent = r.cover.emoji; }
      return;
    }
  }
}

/* ---------- 시작 ---------- */
S = null;
render();
