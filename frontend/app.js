/* ═══════════════════════════════════════════════════════════
   NexusTrack v2 — app.js
   Dual-track: DSA 💻 + AI/ML 🤖
   Auth · Progress sync · Phase tabs · Topic docs modal
═══════════════════════════════════════════════════════════ */

const API = window.location.origin + '/api';

// ── STATE ──────────────────────────────────────────────────
let token       = localStorage.getItem('dsa_token') || null;
let currentUser = null;
let topics      = [];
let progressMap = {};
let expanded    = {};
let modalQ      = null;
let toastTimer  = null;
let currentTrack= localStorage.getItem('nexus_track') || 'dsa';
let currentPhase= 0; // 0 = all phases
let allPhases   = [];

function getQuestionProgress(questionId) {
  return progressMap[questionId] || null;
}

function isQuestionSolved(questionId) {
  return getQuestionProgress(questionId)?.status === 'solved';
}

function isQuestionRevised(questionId) {
  return !!getQuestionProgress(questionId)?.revisionMarked;
}

function refreshModalIfOpen(questionId) {
  if (modalQ?.questionId === questionId) {
    openModal(modalQ.topicId, questionId);
  }
}

function toLocalDateKey(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── INIT ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  applyTrackTheme(currentTrack);
  if (token) {
    await bootstrap();
  } else {
    showAuth();
  }
});

async function bootstrap() {
  try {
    await verifyToken();
    hideAuth();
    await Promise.all([loadTopics(), loadProgress()]);
    buildSidebar();
    updateHeroForTrack();
    renderPhaseTabs();
    filterAndRender();
    updateAllStats();
  } catch (err) {
    token = null;
    localStorage.removeItem('dsa_token');
    showAuth();
  }
}

// ── TRACK SWITCHING ────────────────────────────────────────
function switchTrack(track) {
  currentTrack = track;
  currentPhase = 0;
  localStorage.setItem('nexus_track', track);
  applyTrackTheme(track);
  document.getElementById('trackDsa').classList.toggle('active', track === 'dsa');
  document.getElementById('trackAi').classList.toggle('active', track === 'ai');
  topics = [];
  loadTopics().then(() => {
    buildSidebar();
    updateHeroForTrack();
    renderPhaseTabs();
    filterAndRender();
    updateAllStats();
  });
}

function applyTrackTheme(track) {
  document.body.classList.toggle('ai-mode', track === 'ai');
}

function updateHeroForTrack() {
  const isDsa = currentTrack === 'dsa';
  document.getElementById('heroTitle').innerHTML = isDsa
    ? 'Algo<span class="hero-accent">Streaks</span>'
    : 'AI/ML <span class="hero-accent">Roadmap</span>';
  document.getElementById('heroSub').textContent = isDsa
    ? '300+ curated DSA questions · Striver · NeetCode · FAANG-ready'
    : '7-phase AI Engineer roadmap · Foundations → GenAI → Deployment';
  document.getElementById('heroBadges').innerHTML = isDsa
    ? '<span class="hbadge">Amazon</span><span class="hbadge">Google</span><span class="hbadge">Microsoft</span><span class="hbadge">Meta</span><span class="hbadge">Apple</span><span class="hbadge">Adobe</span>'
    : '<span class="hbadge">Python</span><span class="hbadge">PyTorch</span><span class="hbadge">LLMs</span><span class="hbadge">RAG</span><span class="hbadge">MLOps</span><span class="hbadge">GenAI</span>';
}

// Phase tabs (AI mode only)
function renderPhaseTabs() {
  const tabBar = document.getElementById('phaseTabs');
  const filters = document.getElementById('topbarFilters');
  const isAi = currentTrack === 'ai';
  tabBar.style.display = isAi ? 'flex' : 'none';
  filters.style.display = isAi ? 'none' : 'flex';
  if (!isAi) return;

  // Gather unique phases
  const phaseMap = {};
  topics.forEach(t => {
    if (t.phaseIndex !== undefined) {
      phaseMap[t.phaseIndex] = t.phase || `Phase ${t.phaseIndex}`;
    }
  });
  allPhases = Object.entries(phaseMap).sort((a,b) => +a[0] - +b[0]);

  tabBar.innerHTML = `<button class="phase-tab ${currentPhase === 0 ? 'active' : ''}" onclick="setPhase(0)">All Phases</button>`;
  allPhases.forEach(([idx, name]) => {
    const short = name.replace('Phase ','').split(':')[0].trim();
    tabBar.innerHTML += `<button class="phase-tab ${currentPhase === +idx ? 'active' : ''}" onclick="setPhase(${idx})">${short}</button>`;
  });
}

function setPhase(idx) {
  currentPhase = idx;
  document.querySelectorAll('.phase-tab').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  filterAndRender();
}

// ── AUTH ───────────────────────────────────────────────────
function showAuth() { document.getElementById('authOverlay').style.display = 'flex'; }
function hideAuth() { document.getElementById('authOverlay').style.display = 'none'; }
function switchTab(tab) {
  document.getElementById('loginForm').style.display   = tab === 'login'    ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  clearAuthError();
}
function showAuthError(msg) { const el = document.getElementById('authError'); el.textContent = msg; el.style.display = 'block'; }
function clearAuthError()   { const el = document.getElementById('authError'); el.textContent = ''; el.style.display = 'none'; }

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = 'Logging in…';
  clearAuthError();
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email: loginEmail.value, password: loginPassword.value }),
    });
    token = data.token; localStorage.setItem('dsa_token', token);
    await bootstrap();
  } catch (err) {
    showAuthError(err.message || 'Login failed.');
  } finally { btn.disabled = false; btn.textContent = 'Login'; }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.textContent = 'Creating…';
  clearAuthError();
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: regUsername.value, email: regEmail.value, password: regPassword.value }),
    });
    token = data.token; localStorage.setItem('dsa_token', token);
    await bootstrap();
    showToast('🎉 Welcome to NexusTrack!', 'success');
  } catch (err) {
    showAuthError(err.message || 'Registration failed.');
  } finally { btn.disabled = false; btn.textContent = 'Create Account'; }
}

function logout() {
  showConfirmPopup('Log out?', '⏻', () => {
    token = null; localStorage.removeItem('dsa_token');
    currentUser = null; topics = []; progressMap = {};
    document.getElementById('content').innerHTML = '';
    showAuth();
  });
}

// ── API ────────────────────────────────────────────────────
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }; }

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  const text = await res.text();
  let data = {};
  if (text) { try { data = JSON.parse(text); } catch { throw new Error(`Invalid JSON from ${path}`); } }
  if (!res.ok) throw new Error(data.message || `API error (${res.status})`);
  return data;
}

async function verifyToken() {
  const data = await apiFetch('/auth/me');
  currentUser = data.user;
  document.getElementById('userName').textContent   = currentUser.username;
  document.getElementById('userAvatar').textContent = currentUser.username[0].toUpperCase();
  const streak  = currentUser.streak?.current || 0;
  const longest = currentUser.streak?.longest || 0;
  let s = `🔥 <b>${streak}</b> day streak`;
  if (longest > 0) s += ` <span style="color:var(--blue);font-size:11px">(best: ${longest})</span>`;
  document.getElementById('userStreak').innerHTML = s;
  renderStreakHeatmap();
}

// ── LOADING ────────────────────────────────────────────────
function showLoading() { const b = document.getElementById('topBar'); b.classList.add('active'); document.getElementById('topBarFill').style.width = '60%'; }
function hideLoading() { const f = document.getElementById('topBarFill'); f.style.width = '100%'; setTimeout(() => { document.getElementById('topBar').classList.remove('active'); f.style.width = '0'; }, 300); }
function showSpinner() { document.getElementById('spinnerOverlay').style.display = 'flex'; }
function hideSpinner() { document.getElementById('spinnerOverlay').style.display = 'none'; }

// ── DATA LOADING ───────────────────────────────────────────
async function loadTopics() {
  showLoading();
  try {
    const data = await apiFetch(`/questions/topics?track=${currentTrack}`);
    topics = data.topics || [];
  } catch (err) {
    showPopup('Failed to load topics.', '⚠️');
  } finally { hideLoading(); }
}

async function loadProgress() {
  try {
    const data = await apiFetch('/progress');
    progressMap = data.progressMap || {};
    renderStreakHeatmap();
  } catch { /* silent */ }
}

// ── HEATMAP ────────────────────────────────────────────────
function renderStreakHeatmap() {
  const container = document.getElementById('streakHeatmap');
  if (!container) return;
  const solvedDates = {};
  Object.values(progressMap).forEach(p => {
    if (p.status === 'solved' && p.solvedAt) {
      const key = toLocalDateKey(p.solvedAt);
      solvedDates[key] = (solvedDates[key] || 0) + 1;
    }
  });
  const today  = new Date();
  const todayKey = toLocalDateKey(today);
  const weeks  = 53;
  const start  = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(today.getDate() - (weeks * 7 - (today.getDay() + 1)));
  container.innerHTML = '';
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key   = toLocalDateKey(date);
      const count = solvedDates[key] || 0;
      const dot   = document.createElement('div');
      dot.className = 'streak-dot';
      const level = count >= 4 ? 4 : count;
      dot.classList.add('level-' + level);
      if (key === todayKey) dot.classList.add('today');
      dot.title = `${key}: ${count ? count + ' solved' : 'No activity'}`;
      container.appendChild(dot);
    }
  }
}

// ── TOGGLE SOLVED ──────────────────────────────────────────
async function toggleSolved(questionId, fromModal = false) {
  const previous = getQuestionProgress(questionId);
  const wasSolved = isQuestionSolved(questionId);

  if (wasSolved) {
    if (previous?.revisionMarked) {
      progressMap[questionId] = {
        ...previous,
        status: 'attempted',
        solvedAt: null,
      };
    } else {
      delete progressMap[questionId];
    }
  } else {
    progressMap[questionId] = {
      ...previous,
      status: 'solved',
      solvedAt: new Date().toISOString(),
    };
  }

  updateRowUI(questionId);
  updateAllStats();
  renderStreakHeatmap();
  try {
    await apiFetch('/progress/toggle', { method: 'POST', body: JSON.stringify({ questionId }) });
    refreshModalIfOpen(questionId);
    showToast(wasSolved ? '↩ Unmarked' : '✅ Marked solved!', wasSolved ? '' : 'success');
    if (fromModal) renderModalActions();
  } catch {
    if (previous) progressMap[questionId] = previous;
    else delete progressMap[questionId];
    updateRowUI(questionId);
    updateAllStats();
    renderStreakHeatmap();
    showToast('Error saving', 'error');
  }
}

async function toggleRevision(questionId, fromModal = false) {
  const previous = getQuestionProgress(questionId);
  const wasRevised = isQuestionRevised(questionId);

  if (previous) {
    const nextRevisionMarked = !wasRevised;
    if (nextRevisionMarked || previous.status === 'solved') {
      progressMap[questionId] = {
        ...previous,
        revisionMarked: nextRevisionMarked,
        revisionMarkedAt: nextRevisionMarked ? new Date().toISOString() : null,
      };
    } else {
      delete progressMap[questionId];
    }
  } else {
    progressMap[questionId] = {
      status: 'attempted',
      solvedAt: null,
      revisionMarked: true,
      revisionMarkedAt: new Date().toISOString(),
    };
  }

  updateRowUI(questionId);
  updateAllStats();
  try {
    await apiFetch('/progress/revision', { method: 'POST', body: JSON.stringify({ questionId }) });
    refreshModalIfOpen(questionId);
    showToast(wasRevised ? 'Revision removed' : 'Revision marked', 'success');
    if (fromModal) renderModalActions();
  } catch {
    if (previous) progressMap[questionId] = previous;
    else delete progressMap[questionId];
    updateRowUI(questionId);
    updateAllStats();
    showToast('Error saving revision', 'error');
  }
}

function updateRowUI(questionId) {
  const isSolved = isQuestionSolved(questionId);
  const isRevised = isQuestionRevised(questionId);
  // DSA row
  const row = document.getElementById('row_' + questionId);
  if (row) {
    row.classList.toggle('solved', isSolved);
    row.classList.toggle('revised', isRevised);
    const cb = row.querySelector('.q-check'); if (cb) cb.checked = isSolved;
    const revBtn = row.querySelector('.revision-btn');
    if (revBtn) {
      revBtn.classList.toggle('active', isRevised);
      revBtn.textContent = isRevised ? 'Revised' : 'Revise';
      revBtn.title = isRevised ? 'Remove revision mark' : 'Mark for revision';
    }
    const numEl = row.querySelector('.q-num');
    if (numEl) numEl.textContent = isSolved ? '✓' : (numEl.dataset.idx || '');
    if (isSolved) { row.classList.add('just-solved'); setTimeout(() => row.classList.remove('just-solved'), 400); }
    const topicId = row.dataset.topicId;
    if (topicId) updateTopicBar(topicId);
  }
  // AI card
  const btn = document.getElementById('aibtn_' + questionId);
  if (btn) {
    btn.classList.toggle('done', isSolved);
    btn.textContent = isSolved ? '✓' : '○';
    const card = document.getElementById('aicard_' + questionId);
    if (card) card.classList.toggle('done', isSolved);
    const topicId = btn.dataset.topicId;
    if (topicId) updateTopicBar(topicId);
  }
}

function updateTopicBar(topicId) {
  const t = topics.find(t => t._id === topicId);
  if (!t) return;
  const done = t.questions.filter(q => isQuestionSolved(q._id)).length;
  const pct  = Math.round(done / t.questions.length * 100);
  const bar = document.querySelector(`.topic-bar-fill[data-id="${topicId}"]`);
  if (bar) bar.style.width = pct + '%';
  const cnt = document.querySelector(`.topic-count[data-id="${topicId}"]`);
  if (cnt) cnt.textContent = `${done}/${t.questions.length}`;
  const navProg = document.querySelector(`.nav-item[data-id="${topicId}"] .nav-prog`);
  if (navProg) navProg.textContent = `${done}/${t.questions.length}`;
  const navItem = document.querySelector(`.nav-item[data-id="${topicId}"]`);
  if (navItem) navItem.classList.toggle('all-done', done === t.questions.length);
}

// ── STATS ──────────────────────────────────────────────────
function computeStats() {
  let total=0, done=0, easy=0, med=0, hard=0, eD=0, mD=0, hD=0;
  topics.forEach(t => t.questions.forEach(q => {
    total++;
    if (q.difficulty === 'Easy') easy++; else if (q.difficulty === 'Medium') med++; else hard++;
    if (isQuestionSolved(q._id)) {
      done++;
      if (q.difficulty === 'Easy') eD++; else if (q.difficulty === 'Medium') mD++; else hD++;
    }
  }));
  return { total, done, easy, med, hard, eD, mD, hD };
}

function updateAllStats() {
  const s = computeStats();
  const pct    = s.total ? Math.round(s.done / s.total * 100) : 0;
  const offset = 213.6 - (pct / 100) * 213.6;
  document.getElementById('circleNum').textContent   = s.done;
  document.getElementById('circleTotal').textContent = s.total;
  document.getElementById('circleRing').style.strokeDashoffset = offset;
  document.getElementById('overallPct').textContent  = pct + '% Complete';
  document.getElementById('mEasy').textContent = `${s.eD}/${s.easy}`;
  document.getElementById('mMed').textContent  = `${s.mD}/${s.med}`;
  document.getElementById('mHard').textContent = `${s.hD}/${s.hard}`;
  document.getElementById('hTotal').textContent  = s.total;
  document.getElementById('hDone').textContent   = s.done;
  document.getElementById('hLeft').textContent   = s.total - s.done;
  document.getElementById('hTopics').textContent = topics.length;
}

// ── SIDEBAR ─────────────────────────────────────────────────
function buildSidebar() {
  const nav = document.getElementById('topicNav');
  nav.innerHTML = '';
  // For AI mode, group by phase
  if (currentTrack === 'ai') {
    const phaseGroups = {};
    topics.forEach(t => {
      const key = t.phaseIndex || 0;
      if (!phaseGroups[key]) phaseGroups[key] = { label: t.phase || 'Phase', items: [] };
      phaseGroups[key].items.push(t);
    });
    Object.entries(phaseGroups).sort((a,b) => +a[0] - +b[0]).forEach(([idx, group]) => {
      const ph = document.createElement('div');
      ph.style.cssText = 'padding: 10px 16px 4px; font-size: .65rem; text-transform: uppercase; letter-spacing: .08em; color: var(--text-dim); font-weight: 700;';
      ph.textContent = (group.label || '').replace(/^Phase \d+:\s*/, '') || `Phase ${idx}`;
      nav.appendChild(ph);
      group.items.forEach(t => addNavItem(nav, t));
    });
  } else {
    topics.forEach(t => addNavItem(nav, t));
  }
}

function addNavItem(nav, t) {
  const done = t.questions.filter(q => isQuestionSolved(q._id)).length;
  const el = document.createElement('a');
  el.className = 'nav-item';
  el.dataset.id = t._id;
  if (done === t.questions.length && done > 0) el.classList.add('all-done');
  el.innerHTML = `<span class="nav-emoji">${t.emoji}</span><span class="nav-name">${t.name}</span><span class="nav-prog">${done}/${t.questions.length}</span>`;
  el.addEventListener('click', (e) => {
    e.preventDefault();
    expanded[t._id] = true;
    filterAndRender();
    setTimeout(() => {
      const el = document.getElementById('topic-' + t._id) || document.getElementById('aicard-group-' + t._id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    if (window.innerWidth <= 768) closeSidebar();
  });
  nav.appendChild(el);
}

function toggleSidebar()  { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarBackdrop').classList.toggle('open'); }
function closeSidebar()   { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarBackdrop').classList.remove('open'); }

// ── FILTER & RENDER ────────────────────────────────────────
function filterAndRender() {
  if (currentTrack === 'ai') {
    renderAiTopics();
  } else {
    renderDsaTopics();
  }
}

function renderDsaTopics() {
  const diff   = document.getElementById('diffFilter').value;
  const status = document.getElementById('statusFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const content = document.getElementById('content');
  content.innerHTML = '';
  let anyVisible = false;

  topics.forEach((t, ti) => {
    const filtered = t.questions.filter(q => {
      if (diff && q.difficulty !== diff) return false;
      const solved = isQuestionSolved(q._id);
      if (status === 'done' && !solved) return false;
      if (status === 'todo' &&  solved) return false;
      if (search) {
        const hay = [q.title, q.pattern, (q.companies||[]).join(' '), q.lcNumber, t.name].join(' ').toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
    if (!filtered.length) return;
    anyVisible = true;

    const done = t.questions.filter(q => isQuestionSolved(q._id)).length;
    const pct  = Math.round(done / t.questions.length * 100);
    const isOpen = expanded[t._id] !== false;
    const section = document.createElement('div');
    section.className = `topic-section${isOpen ? ' open' : ''}`;
    section.id = 'topic-' + t._id;
    section.style.animationDelay = ti * 0.03 + 's';
    section.innerHTML = `
      <div class="topic-header" onclick="toggleTopic('${t._id}')">
        <span class="topic-emoji">${t.emoji}</span>
        <div class="topic-name-wrap">
          <span class="topic-name">${t.name}</span>
          <span class="topic-sub">${t.count} questions · E:${t.easyCount} M:${t.mediumCount} H:${t.hardCount}</span>
        </div>
        <div class="topic-right">
          <span class="topic-count" data-id="${t._id}">${done}/${t.questions.length}</span>
          <div class="topic-bar-wrap"><div class="topic-bar-bg"><div class="topic-bar-fill" data-id="${t._id}" style="width:${pct}%"></div></div></div>
          <span class="topic-chevron ${isOpen ? 'open' : ''}" id="chev-${t._id}">▼</span>
        </div>
      </div>
      <div class="topic-body${isOpen ? ' open' : ''}" id="tbody-${t._id}">
        <table class="q-table">
          <thead><tr>
            <th class="col-check">✓</th><th class="col-num">#</th>
            <th class="col-name">Problem</th><th class="col-diff">Level</th>
            <th class="col-pat">Pattern</th><th class="col-co">Companies</th>
            <th class="col-lc">Link</th><th class="col-revision">Revision</th><th class="col-info">Info</th>
          </tr></thead>
          <tbody id="qbody-${t._id}"></tbody>
        </table>
      </div>`;
    content.appendChild(section);
    const tbody = document.getElementById('qbody-' + t._id);
    filtered.forEach((q, i) => {
      const isSolved = isQuestionSolved(q._id);
      const isRevised = isQuestionRevised(q._id);
      const isGFG = (q.lcNumber||'').includes('GFG') || (q.lcNumber||'').includes('SPOJ');
      const tr = document.createElement('tr');
      tr.id = 'row_' + q._id; tr.dataset.topicId = t._id;
      tr.className = `${isSolved ? 'solved' : ''}${isRevised ? ' revised' : ''}`.trim();
      tr.innerHTML = `
        <td class="col-check"><input type="checkbox" class="q-check" ${isSolved?'checked':''} onchange="toggleSolved('${q._id}')"/></td>
        <td class="col-num"><div class="q-num" data-idx="${i+1}">${isSolved?'✓':i+1}</div></td>
        <td class="col-name q-name">${q.title}</td>
        <td class="col-diff"><span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
        <td class="col-pat">${q.pattern||''}</td>
        <td class="col-co">${(q.companies||[]).slice(0,3).join(' · ')}</td>
        <td class="col-lc"><a href="${q.lcLink}" target="_blank" class="lc-link${isGFG?' gfg-link':''}" onclick="event.stopPropagation()">${q.lcNumber} ↗</a></td>
        <td class="col-revision"><button class="revision-btn${isRevised?' active':''}" onclick="event.stopPropagation();toggleRevision('${q._id}')" title="${isRevised ? 'Remove revision mark' : 'Mark for revision'}">${isRevised ? 'Revised' : 'Revise'}</button></td>
        <td class="col-info"><button class="info-btn" onclick="openModal('${t._id}','${q._id}')">?</button></td>`;
      tbody.appendChild(tr);
    });
  });

  if (!anyVisible) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No questions match your filters.<br>Try adjusting the filters above.</p></div>`;
  }
}

function renderAiTopics() {
  const content = document.getElementById('content');
  content.innerHTML = '';
  let anyVisible = false;

  // Filter by current phase
  const visibleTopics = currentPhase === 0
    ? topics
    : topics.filter(t => (t.phaseIndex || 0) === currentPhase);

  // Group by phase
  const phaseGroups = {};
  visibleTopics.forEach(t => {
    const key = t.phaseIndex || 0;
    if (!phaseGroups[key]) phaseGroups[key] = { label: t.phase || '', items: [] };
    phaseGroups[key].items.push(t);
  });

  Object.entries(phaseGroups).sort((a,b) => +a[0] - +b[0]).forEach(([idx, group], gi) => {
    if (!group.items.length) return;
    anyVisible = true;

    const phDiv = document.createElement('div');
    phDiv.id = 'aicard-group-' + idx;
    if (currentPhase === 0) {
      phDiv.innerHTML = `<div class="ai-phase-header">📌 ${group.label || 'Phase '+idx} <span class="phase-count">(${group.items.length} topics)</span></div>`;
    }

    group.items.forEach((t, ti) => {
      const done    = t.questions.filter(q => isQuestionSolved(q._id)).length;
      const total   = t.questions.length;
      const pct     = Math.round(done / total * 100);
      const isOpen  = expanded[t._id] !== false;
      const isDone  = done === total && total > 0;
      const q       = t.questions[0]; // main topic doc

      const tagClass = `ai-tag-${(q?.tag || 'core').toLowerCase()}`;

      const cardEl = document.createElement('div');
      cardEl.className = `ai-topic-card${isDone ? ' done' : ''}`;
      cardEl.id = 'topic-' + t._id;
      cardEl.style.animationDelay = (gi * 0.05 + ti * 0.03) + 's';

      const descHtml = q?.description
        ? `<div class="ai-card-desc">${q.description}</div>` : '';

      const tasksHtml = q?.practiceTasks?.length
        ? `<div class="ai-section-label">✅ Practice Tasks</div><ul class="ai-tasks">${q.practiceTasks.map(t => `<li>${t}</li>`).join('')}</ul>` : '';

      const ytHtml = q?.youtubeResources?.length
        ? `<div class="ai-section-label">▶ YouTube Resources</div><div class="ai-resources">${q.youtubeResources.map(r => `<a href="${r.url}" target="_blank" class="ai-res-link ai-res-yt">🎬 ${r.title}${r.duration ? ` <span style="opacity:.6">(${r.duration})</span>` : ''}</a>`).join('')}</div>` : '';

      const docHtml = q?.docResources?.length
        ? `<div class="ai-section-label">📖 Documentation & Papers</div><div class="ai-resources">${q.docResources.map(r => `<a href="${r.url}" target="_blank" class="ai-res-link">📄 ${r.title}</a>`).join('')}</div>` : '';

      const prereqHtml = q?.prerequisites?.length
        ? `<div class="ai-section-label">🔗 Prerequisites</div><div class="ai-prereqs">${q.prerequisites.map(p => `<span class="ai-prereq-chip">${p}</span>`).join('')}</div>` : '';

      const projectHtml = q?.isProject ? `
        <div class="project-banner">
          <strong>🚀 Project</strong>${q.problemStatement ? ` — ${q.problemStatement}` : ''}
          ${q.expectedOutcome ? `<br><strong>Goal:</strong> ${q.expectedOutcome}` : ''}
        </div>
        ${q.techStack?.length ? `<div class="ai-section-label">⚙️ Tech Stack</div><div class="ai-tech-stack">${q.techStack.map(s => `<span class="ai-tech-chip">${s}</span>`).join('')}</div>` : ''}
        ${q.features?.length ? `<div class="ai-section-label">✨ Features</div><ul class="ai-tasks">${q.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
      ` : '';

      const hintHtml = q?.hint
        ? `<div class="ai-section-label">💡 Key Insight</div><div class="modal-hint-box">${q.hint}</div>` : '';
      const proTipHtml = q?.proTip
        ? `<div class="modal-tip">⭐ <strong>Pro Tip:</strong> ${q.proTip}</div>` : '';

      const multiQ = total > 1
        ? `<div class="ai-section-label">📋 All ${total} sub-topics</div><ul class="ai-tasks">${t.questions.map(q2 => `<li style="display:flex;align-items:center;gap:8px"><input type="checkbox" style="accent-color:var(--accent);flex-shrink:0" ${isQuestionSolved(q2._id)?'checked':''} onchange="toggleSolved('${q2._id}')"> ${q2.title} <span class="badge badge-${q2.difficulty.toLowerCase()}" style="font-size:.63rem">${q2.difficulty}</span></li>`).join('')}</ul>` : '';

      cardEl.innerHTML = `
        <div class="ai-card-header" onclick="toggleAiCard('${t._id}')">
          <span class="ai-card-emoji">${t.emoji}</span>
          <div class="ai-card-info">
            <div class="ai-card-title">${t.name}</div>
            <div class="ai-card-meta">
              <span class="ai-tag ${tagClass}">${q?.tag || 'core'}</span>
              <span class="badge badge-${(q?.difficulty||'Easy').toLowerCase()}">${q?.difficulty||'Easy'}</span>
              ${q?.estimatedTime ? `<span class="ai-card-time">⏱ ${q.estimatedTime}</span>` : ''}
              ${total > 1 ? `<span class="ai-card-time">📦 ${total} topics</span>` : ''}
            </div>
          </div>
          <div class="ai-card-right">
            <button id="aibtn_${q?._id}" data-topic-id="${t._id}" class="ai-check-btn${isDone?' done':''}" onclick="event.stopPropagation();toggleSolved('${q?._id}')" title="${isDone?'Mark incomplete':'Mark complete'}">${isDone?'✓':'○'}</button>
            <div class="topic-bar-bg" style="width:60px"><div class="topic-bar-fill" data-id="${t._id}" style="width:${pct}%"></div></div>
            <span class="topic-count" data-id="${t._id}" style="font-size:.7rem">${done}/${total}</span>
          </div>
        </div>
        <div class="ai-card-body${isOpen?' open':''}" id="tbody-${t._id}">
          ${projectHtml}
          ${descHtml}
          ${prereqHtml}
          ${tasksHtml}
          ${hintHtml}
          ${proTipHtml}
          ${ytHtml}
          ${docHtml}
          ${multiQ}
        </div>`;

      // Set card id for scroll
      cardEl.querySelector('.ai-card-header').id = 'aicard-group-' + t._id;
      phDiv.appendChild(cardEl);
    });

    content.appendChild(phDiv);
  });

  if (!anyVisible) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">🤖</div><p>No AI/ML topics found.<br>Run <code style="background:var(--bg-raised);padding:2px 6px;border-radius:4px">node seed-ai.js</code> to seed the roadmap.</p></div>`;
  }
}

function toggleTopic(id) {
  expanded[id] = !(expanded[id] !== false);
  const body = document.getElementById('tbody-' + id);
  const chev = document.getElementById('chev-' + id);
  if (body) body.classList.toggle('open', expanded[id]);
  if (chev) chev.classList.toggle('open', expanded[id]);
  const section = document.getElementById('topic-' + id);
  if (section) section.classList.toggle('open', expanded[id]);
}

function toggleAiCard(id) {
  expanded[id] = !(expanded[id] !== false);
  const body = document.getElementById('tbody-' + id);
  if (body) body.classList.toggle('open', expanded[id]);
}

function expandAll()  { topics.forEach(t => { expanded[t._id] = true;  }); filterAndRender(); }
function collapseAll(){ topics.forEach(t => { expanded[t._id] = false; }); filterAndRender(); }

// ── DSA MODAL ──────────────────────────────────────────────
function openModal(topicId, questionId) {
  const t = topics.find(t => t._id === topicId); if (!t) return;
  const q = t.questions.find(q => q._id === questionId); if (!q) return;
  modalQ = { topicId, questionId, q };
  const isSolved = isQuestionSolved(questionId);
  const isRevised = isQuestionRevised(questionId);
  const isGFG = (q.lcNumber||'').includes('GFG') || (q.lcNumber||'').includes('SPOJ');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-title">${q.title}</div>
    <div class="modal-meta">
      <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
      <span class="badge" style="background:var(--bg-active);color:var(--text-secondary)">${t.emoji} ${t.name}</span>
      ${isSolved ? '<span class="badge" style="background:var(--green-dim);color:var(--green)">✓ Solved</span>' : ''}
      ${isRevised ? '<span class="badge revision-badge">⟳ Revision</span>' : ''}
    </div>
    <div class="modal-grid">
      <div class="modal-info-box"><div class="modal-info-label">Companies</div><div class="modal-info-val" style="font-size:.78rem">${(q.companies||[]).join(' · ')||'—'}</div></div>
      <div class="modal-info-box"><div class="modal-info-label">Pattern</div><div class="modal-info-val" style="font-size:.82rem">${q.pattern||'—'}</div></div>
      <div class="modal-info-box"><div class="modal-info-label">Platform</div><div class="modal-info-val">${q.lcNumber||'—'}</div></div>
      <div class="modal-info-box"><div class="modal-info-label">Tags</div><div class="modal-info-val" style="font-size:.78rem">${(q.tags||[]).join(', ')||'—'}</div></div>
    </div>
    ${q.timeComplexity||q.spaceComplexity ? `<div class="modal-complexity">${q.timeComplexity?`<div class="complexity-chip">⏱ ${q.timeComplexity}</div>`:''} ${q.spaceComplexity?`<div class="complexity-chip">💾 ${q.spaceComplexity}</div>`:''}</div>` : ''}
    <div class="modal-section-title">💡 Hint</div>
    <div class="modal-hint-box">${q.hint||'No hint available.'}</div>
    <div class="modal-section-title">🧩 Approach</div>
    <div class="modal-approach">${q.approach||'No approach details available.'}</div>
    <div class="modal-tip">⭐ <strong>Pro Tip:</strong> ${q.proTip||q.tip||'Study the pattern carefully.'}</div>
    <div class="modal-actions" id="modalActions"></div>`;
  renderModalActions();
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalActions() {
  if (!modalQ) return;
  const { questionId, q } = modalQ;
  const isGFG    = (q.lcNumber||'').includes('GFG');
  const isSolved = isQuestionSolved(questionId);
  const isRevised = isQuestionRevised(questionId);
  const el = document.getElementById('modalActions');
  if (el) el.innerHTML = `
    <a href="${q.lcLink}" target="_blank" class="modal-lc-btn">Open ${isGFG?'GFG':'LeetCode'} ↗</a>
    <button class="modal-revision-btn${isRevised ? ' active' : ''}" onclick="toggleRevision('${questionId}',true)">${isRevised ? 'Remove Revision' : 'Mark Revision'}</button>
    ${isSolved
      ? `<button class="modal-unsolve-btn" onclick="toggleSolved('${questionId}',true)">Unmark ✗</button>`
      : `<button class="modal-solve-btn" onclick="toggleSolved('${questionId}',true)">Mark Solved ✓</button>`}`;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
  modalQ = null;
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── RESET ──────────────────────────────────────────────────
async function resetAll() {
  showConfirmPopup('Reset ALL progress? This cannot be undone.', '🗑️', async () => {
    try {
      await apiFetch('/progress/reset', { method: 'DELETE' });
      progressMap = {};
      updateAllStats();
      filterAndRender();
      showToast('🔄 All progress reset', '');
    } catch { showToast('Error resetting', 'error'); }
  }, true);
}

// ── POPUP SYSTEM ───────────────────────────────────────────
function showPopup(msg, icon='ℹ️') {
  document.getElementById('popupIcon').textContent = icon;
  document.getElementById('popupTitle').textContent = 'Notice';
  document.getElementById('popupMsg').textContent   = msg;
  document.getElementById('popupActions').innerHTML = `<button class="popup-btn popup-btn-ok" onclick="closePopup()">Got it</button>`;
  document.getElementById('popupBackdrop').style.display = 'flex';
}
function showConfirmPopup(msg, icon='❓', onConfirm, isDanger=false) {
  document.getElementById('popupIcon').textContent  = icon;
  document.getElementById('popupTitle').textContent = 'Confirm';
  document.getElementById('popupMsg').textContent   = msg;
  const cls = isDanger ? 'popup-btn-danger' : 'popup-btn-ok';
  document.getElementById('popupActions').innerHTML = `
    <button class="popup-btn popup-btn-cancel" onclick="closePopup()">Cancel</button>
    <button class="popup-btn ${cls}" onclick="closePopup();(${onConfirm.toString()})()">Confirm</button>`;
  document.getElementById('popupBackdrop').style.display = 'flex';
}
function closePopup() { document.getElementById('popupBackdrop').style.display = 'none'; }

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast visible ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2800);
}

// ── HASH NAVIGATION ────────────────────────────────────────
window.addEventListener('hashchange', handleHash);
function handleHash() {
  const hash = window.location.hash;
  if (hash?.startsWith('#topic-')) {
    const id = hash.replace('#topic-', '');
    expanded[id] = true;
    filterAndRender();
    setTimeout(() => {
      const el = document.getElementById('topic-' + id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
