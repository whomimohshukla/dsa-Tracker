/* ═══════════════════════════════════════════════════════
   NEXUSTRACK — app.js
   DSA + AI/ML Tracker | JWT Auth | MongoDB | YouTube
═══════════════════════════════════════════════════════ */

window.addEventListener('error', e => showPopup('JS Error: ' + e.message));
window.addEventListener('unhandledrejection', e => showPopup('Error: ' + (e.reason?.message || e.reason)));

const API = window.location.origin + '/api';

// ── STATE ─────────────────────────────────────────────
let token = localStorage.getItem('dsa_token') || null;
let currentUser = null;
let allTopics = { dsa: [], ai: [] };
let progressMap = {};
let expanded = {};
let currentTrack = localStorage.getItem('nx_track') || 'dsa';
let currentPhase = 'all';
let toastTimer = null;

// ── INIT ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  applyTrack(currentTrack, false);
  if (token) await bootstrap();
  else showAuth();
  buildHeatmap();
  window.addEventListener('hashchange', handleHash);
  if (window.location.hash?.startsWith('#topic-')) setTimeout(handleHash, 200);
});

async function bootstrap() {
  try {
    await verifyToken();
    hideAuth();
    showLoadingBar();
    showSpinner('Syncing your progress…');
    await Promise.all([loadTopics('dsa'), loadTopics('ai'), loadProgress()]);
    hideLoadingBar();
    hideSpinner();
    buildSidebar();
    filterAndRender();
    updateAllStats();
  } catch (err) {
    token = null;
    localStorage.removeItem('dsa_token');
    hideSpinner();
    hideLoadingBar();
    showAuth();
  }
}

// ── TRACK SWITCHING ────────────────────────────────────
function switchTrack(track) {
  currentTrack = track;
  currentPhase = 'all';
  localStorage.setItem('nx_track', track);
  applyTrack(track, true);
  buildSidebar();
  filterAndRender();
  updateAllStats();
}

function applyTrack(track, animate) {
  document.body.classList.toggle('ai-mode', track === 'ai');
  document.getElementById('trackBtnDSA').classList.toggle('active', track === 'dsa');
  document.getElementById('trackBtnAI').classList.toggle('active', track === 'ai');
  const pi = document.getElementById('phaseIndicator');
  pi.classList.toggle('show', track === 'ai');

  const eyebrow = document.getElementById('heroEyebrow');
  const title = document.getElementById('heroTitle');
  const sub = document.getElementById('heroSub');
  const badges = document.getElementById('heroBadges');

  if (track === 'dsa') {
    eyebrow.textContent = 'DSA MASTERY TRACK';
    title.innerHTML = 'Algo<span class="hero-accent">Streaks</span>';
    sub.textContent = '300+ curated questions · FAANG-ready · Hints & Approaches';
    badges.innerHTML = `
      <span class="hbadge amazon">Amazon</span><span class="hbadge google">Google</span>
      <span class="hbadge ms">Microsoft</span><span class="hbadge flip">Flipkart</span>
      <span class="hbadge adobe">Adobe</span><span class="hbadge fb">Meta</span>`;
  } else {
    eyebrow.textContent = 'AI / ML ENGINEER ROADMAP';
    title.innerHTML = 'Nexus<span class="hero-accent">AI</span>';
    sub.textContent = 'From Python basics to GenAI · 7 phases · YouTube resources per topic';
    badges.innerHTML = `
      <span class="hbadge phase1">Phase 1: Foundations</span>
      <span class="hbadge phase2">Phase 2: Core ML</span>
      <span class="hbadge phase3">Phase 3: Deep Learning</span>
      <span class="hbadge phase4">Phase 4: NLP & Transformers</span>`;
    if (animate) buildPhaseTabs();
  }
  if (animate) buildPhaseTabs();
}

function buildPhaseTabs() {
  const topics = allTopics.ai || [];
  const phases = ['all', ...new Set(topics.map(t => t.phase).filter(Boolean))];
  const container = document.getElementById('phaseTabs');
  container.innerHTML = phases.map((p, i) => {
    const label = p === 'all' ? 'All Phases' : p;
    return `<button class="phase-tab ${p === currentPhase ? 'active' : ''}" onclick="filterPhase('${p}')">${label}</button>`;
  }).join('');
}

function filterPhase(phase) {
  currentPhase = phase;
  document.querySelectorAll('.phase-tab').forEach(t => t.classList.toggle('active', t.textContent === (phase === 'all' ? 'All Phases' : phase)));
  filterAndRender();
}

// ── AUTH ──────────────────────────────────────────────
function showAuth() { document.getElementById('authOverlay').style.display = 'flex'; }
function hideAuth() { document.getElementById('authOverlay').style.display = 'none'; }
function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  clearAuthError();
}
function showAuthError(msg) { const el = document.getElementById('authError'); el.textContent = msg; el.style.display = 'block'; }
function clearAuthError() { const el = document.getElementById('authError'); el.textContent = ''; el.style.display = 'none'; }

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span>Signing in…';
  clearAuthError();
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value }),
    });
    token = data.token; localStorage.setItem('dsa_token', token);
    await bootstrap();
  } catch (err) { showAuthError(err.message || 'Login failed.'); }
  finally { btn.disabled = false; btn.innerHTML = 'Sign In'; }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span>Creating…';
  clearAuthError();
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: document.getElementById('regUsername').value, email: document.getElementById('regEmail').value, password: document.getElementById('regPassword').value }),
    });
    token = data.token; localStorage.setItem('dsa_token', token);
    await bootstrap();
    showToast('🎉 Welcome! Account created.', 'success');
  } catch (err) { showAuthError(err.message || 'Registration failed.'); }
  finally { btn.disabled = false; btn.innerHTML = 'Create Account'; }
}

function logout() {
  showConfirmPopup('You will be signed out of your account.', () => {
    token = null; localStorage.removeItem('dsa_token');
    currentUser = null; allTopics = { dsa: [], ai: [] }; progressMap = {};
    document.getElementById('content').innerHTML = '';
    showAuth();
  }, { icon: '🚪', title: 'Log out?', confirmLabel: 'Log out' });
}

// ── API HELPERS ───────────────────────────────────────
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }; }

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  const text = await res.text();
  let data = {};
  if (text) { try { data = JSON.parse(text); } catch { throw new Error(`Invalid response from ${path}`); } }
  if (!res.ok) throw new Error(data.message || `API error (${res.status})`);
  return data;
}

async function verifyToken() {
  const data = await apiFetch('/auth/me');
  currentUser = data.user;
  document.getElementById('userName').textContent = currentUser.username;
  document.getElementById('userAvatar').textContent = currentUser.username[0].toUpperCase();
  const streak = currentUser.streak?.current || 0;
  document.getElementById('userStreak').innerHTML = `🔥 <b>${streak}</b> day streak`;
}

// ── DATA LOADING ──────────────────────────────────────
async function loadTopics(track) {
  try {
    const data = await apiFetch(`/questions/topics?track=${track}`);
    allTopics[track] = data.topics || [];
    if (track === 'ai') buildPhaseTabs();
  } catch (err) { console.error('loadTopics error', err); }
}

async function loadProgress() {
  if (!token) return;
  try {
    const data = await apiFetch('/progress');
    progressMap = data.progressMap || {};
  } catch (err) { console.error('loadProgress error', err); }
}

// ── SIDEBAR ───────────────────────────────────────────
function buildSidebar() {
  const nav = document.getElementById('topicNav');
  const topics = allTopics[currentTrack] || [];
  let html = '';

  if (currentTrack === 'ai') {
    let lastPhase = '';
    topics.forEach(t => {
      if (t.phase && t.phase !== lastPhase) {
        html += `<div class="nav-phase-header">${t.phase}</div>`;
        lastPhase = t.phase;
      }
      const solved = (t.questions || []).filter(q => progressMap[q._id]).length;
      const total = (t.questions || []).length;
      html += `<a class="topic-nav-item" href="#topic-${t._id}" onclick="scrollToTopic('${t._id}')">
        <span class="nav-emoji">${t.emoji}</span>
        <span class="nav-label">${t.name}</span>
        <span class="nav-count">${solved}/${total}</span>
      </a>`;
    });
  } else {
    topics.forEach(t => {
      const solved = (t.questions || []).filter(q => progressMap[q._id]).length;
      const total = (t.questions || []).length;
      html += `<a class="topic-nav-item" href="#topic-${t._id}" onclick="scrollToTopic('${t._id}')">
        <span class="nav-emoji">${t.emoji}</span>
        <span class="nav-label">${t.name}</span>
        <span class="nav-count">${solved}/${total}</span>
      </a>`;
    });
  }

  nav.innerHTML = html || '<div style="color:var(--text-muted);font-size:13px;padding:12px">No topics loaded</div>';
}

function scrollToTopic(id) {
  expanded[id] = true;
  closeSidebar();
  filterAndRender();
  setTimeout(() => {
    const el = document.getElementById('topic-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

// ── RENDER ────────────────────────────────────────────
function filterAndRender() {
  const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
  const diff = document.getElementById('diffFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';

  let topics = (allTopics[currentTrack] || []).filter(t => {
    if (currentTrack === 'ai' && currentPhase !== 'all' && t.phase !== currentPhase) return false;
    return true;
  });

  const content = document.getElementById('content');
  if (!topics.length) {
    content.innerHTML = `<div class="empty-state"><div style="font-size:48px">📭</div><p>No topics found. Run <code>npm run seed:ai</code> to load AI topics.</p></div>`;
    updateAllStats();
    return;
  }

  let totalQ = 0, totalShown = 0;
  const html = topics.map(topic => {
    let questions = topic.questions || [];

    if (search) questions = questions.filter(q =>
      q.title?.toLowerCase().includes(search) ||
      q.pattern?.toLowerCase().includes(search) ||
      (q.tags || []).some(t => t.toLowerCase().includes(search)) ||
      (q.companies || []).some(c => c.toLowerCase().includes(search))
    );
    if (diff) questions = questions.filter(q => q.difficulty === diff);
    if (status === 'done') questions = questions.filter(q => progressMap[q._id]);
    if (status === 'todo') questions = questions.filter(q => !progressMap[q._id]);

    if (!questions.length && (search || diff || status)) return '';

    const solved = (topic.questions || []).filter(q => progressMap[q._id]).length;
    const total = (topic.questions || []).length;
    const pct = total > 0 ? Math.round(solved / total * 100) : 0;
    totalQ += total; totalShown += solved;

    const isOpen = expanded[topic._id];

    const qRows = questions.map(q => {
      const done = !!progressMap[q._id];
      const tagHtml = q.tag ? `<span class="q-tag-pill qtag-${q.tag}">${q.tag.toUpperCase()}</span>` : '';
      const diffClass = `diff-${(q.difficulty || '').toLowerCase()}`;
      const links = [];
      if (q.lcLink) links.push(`<a class="q-link" href="${q.lcLink}" target="_blank" onclick="e?.stopPropagation()">🔗 ${q.platform || 'Link'}</a>`);

      return `<div class="q-row" onclick="toggleProgress('${q._id}', '${escHtml(q.topicId)}')">
        <div class="q-check ${done ? 'solved' : ''}"></div>
        <div class="q-title-wrap" style="flex:1">
          <div class="q-title ${done ? 'solved-title' : ''}">${escHtml(q.title)}</div>
          ${q.pattern ? `<div class="q-desc">${escHtml(q.pattern)}</div>` : ''}
        </div>
        <div class="q-right">
          ${tagHtml}
          <span class="diff-badge ${diffClass}">${q.difficulty}</span>
          ${links.join('')}
          <button class="q-info-btn" onclick="event.stopPropagation(); openModal('${q._id}')">ℹ</button>
        </div>
      </div>`;
    }).join('');

    const phaseTag = currentTrack === 'ai' && topic.phase
      ? `<span class="topic-phase-tag">${topic.phase.replace('Phase ', 'Ph ')}</span>` : '';

    return `<div class="topic-group" id="topic-${topic._id}" style="animation-delay:${Math.random()*0.1}s">
      <div class="topic-header" onclick="toggleTopic('${topic._id}')">
        <span class="topic-emoji">${topic.emoji}</span>
        <div class="topic-title-wrap">
          <div class="topic-name">${topic.name}${phaseTag}</div>
          <div class="topic-meta">${topic.easyCount || 0} Easy · ${topic.mediumCount || 0} Medium · ${topic.hardCount || 0} Hard</div>
        </div>
        <div class="topic-progress-wrap">
          <div class="topic-mini-bar"><div class="topic-mini-fill" style="width:${pct}%"></div></div>
          <span class="topic-count">${solved}/${total}</span>
        </div>
        <span class="topic-chevron ${isOpen ? 'open' : ''}">▶</span>
      </div>
      <div class="questions-table ${isOpen ? 'open' : ''}">${qRows}</div>
    </div>`;
  }).join('');

  content.innerHTML = html || `<div class="empty-state"><div style="font-size:48px">🔍</div><p>No results for your filters.</p></div>`;
  updateAllStats(totalQ, totalShown);
}

function toggleTopic(id) {
  expanded[id] = !expanded[id];
  filterAndRender();
}
function expandAll() { (allTopics[currentTrack] || []).forEach(t => expanded[t._id] = true); filterAndRender(); }
function collapseAll() { expanded = {}; filterAndRender(); }

// ── PROGRESS TOGGLE ───────────────────────────────────
async function toggleProgress(questionId, topicId) {
  const wasActive = !!progressMap[questionId];
  if (wasActive) { delete progressMap[questionId]; } 
  else { progressMap[questionId] = { status: 'solved', solvedAt: new Date().toISOString() }; }
  filterAndRender();
  updateAllStats();
  try {
    const data = await apiFetch('/progress/toggle', {
      method: 'POST', body: JSON.stringify({ questionId }),
    });
    if (data.action === 'added') {
      showToast(currentTrack === 'ai' ? '✅ Topic completed!' : '⚡ Solved!', 'success');
    } else {
      showToast('↩ Marked incomplete', '');
    }
    buildSidebar();
  } catch (err) {
    if (wasActive) progressMap[questionId] = { status: 'solved' };
    else delete progressMap[questionId];
    filterAndRender(); updateAllStats();
    showToast('Error saving progress', 'error');
  }
}

// ── MODAL ─────────────────────────────────────────────
function openModal(qId) {
  const topics = allTopics[currentTrack] || [];
  let q = null;
  for (const t of topics) {
    q = (t.questions || []).find(x => x._id === qId);
    if (q) break;
  }
  if (!q) return;

  const ytHtml = (q.youtubeResources || []).length > 0
    ? `<div class="modal-section">
        <div class="modal-section-title">📺 YouTube Resources</div>
        <div class="yt-resources">
          ${(q.youtubeResources || []).map(yt => `
            <a class="yt-item" href="${yt.url}" target="_blank" rel="noopener">
              <span class="yt-icon">▶️</span>
              <div class="yt-info">
                <div class="yt-title">${escHtml(yt.title)}</div>
                <div class="yt-meta">${escHtml(yt.channel)}</div>
              </div>
              ${yt.duration ? `<span class="yt-duration">${escHtml(yt.duration)}</span>` : ''}
            </a>`).join('')}
        </div>
      </div>` : '';

  const diffClass = `diff-${(q.difficulty || '').toLowerCase()}`;
  const tagHtml = q.tag ? `<span class="q-tag-pill qtag-${q.tag}" style="margin-right:8px">${q.tag.toUpperCase()}</span>` : '';

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-title">${escHtml(q.title)}</div>
    <div class="modal-sub">
      ${tagHtml}
      <span class="diff-badge ${diffClass}">${q.difficulty}</span>
      ${q.topicName ? ` · ${escHtml(q.topicName)}` : ''}
      ${q.lcNumber ? ` · LC #${q.lcNumber}` : ''}
    </div>
    ${q.hint ? `<div class="modal-section">
      <div class="modal-section-title">💡 Hint / Key Insight</div>
      <div class="modal-section-body">${escHtml(q.hint)}</div>
    </div>` : ''}
    ${q.approach ? `<div class="modal-section">
      <div class="modal-section-title">🎯 Approach / How to Study</div>
      <div class="modal-section-body">${escHtml(q.approach)}</div>
    </div>` : ''}
    ${q.proTip ? `<div class="modal-section">
      <div class="modal-section-title">⭐ Pro Tip</div>
      <div class="modal-tip">${escHtml(q.proTip)}</div>
    </div>` : ''}
    ${(q.timeComplexity || q.spaceComplexity) ? `<div class="modal-section">
      <div class="modal-section-title">📊 Complexity</div>
      <div class="complexity-row">
        ${q.timeComplexity ? `<span class="complexity-pill">⏱ Time: ${escHtml(q.timeComplexity)}</span>` : ''}
        ${q.spaceComplexity ? `<span class="complexity-pill">🗄 Space: ${escHtml(q.spaceComplexity)}</span>` : ''}
      </div>
    </div>` : ''}
    ${ytHtml}
    ${q.lcLink ? `<div class="modal-section">
      <a class="q-link" href="${q.lcLink}" target="_blank" style="font-size:13px; display:inline-flex; align-items:center; gap:6px">
        🔗 Open on ${q.platform || 'Link'}
      </a>
    </div>` : ''}
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
}

// ── STATS ─────────────────────────────────────────────
function updateAllStats(totalQ, totalDone) {
  const topics = allTopics[currentTrack] || [];
  let allQ = 0, allDone = 0, easy = 0, med = 0, hard = 0;
  topics.forEach(t => {
    (t.questions || []).forEach(q => {
      allQ++;
      if (progressMap[q._id]) {
        allDone++;
        const d = (q.difficulty || '').toLowerCase();
        if (d === 'easy' || d === 'beginner') easy++;
        else if (d === 'medium' || d === 'intermediate') med++;
        else hard++;
      }
    });
  });
  const pct = allQ > 0 ? Math.round(allDone / allQ * 100) : 0;
  const circ = 213.6 * (1 - pct / 100);

  document.getElementById('circleNum').textContent = allDone;
  document.getElementById('circleTotal').textContent = allQ;
  document.getElementById('circleRing').style.strokeDashoffset = circ;
  document.getElementById('overallPct').textContent = pct + '% Complete';
  document.getElementById('mEasy').textContent = easy;
  document.getElementById('mMed').textContent = med;
  document.getElementById('mHard').textContent = hard;
  document.getElementById('hTotal').textContent = allDone;
  document.getElementById('hDone').textContent = allDone;
  document.getElementById('hLeft').textContent = allQ - allDone;
  document.getElementById('hTopics').textContent = topics.length;
}

// ── HEATMAP ───────────────────────────────────────────
function buildHeatmap() {
  const container = document.getElementById('streakHeatmap');
  const today = new Date(); today.setHours(0,0,0,0);
  const days = 53 * 7;
  let html = '';
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const isToday = i === 0;
    html += `<div class="streak-dot level-0 ${isToday ? 'today' : ''}"></div>`;
  }
  container.innerHTML = html;
}

// ── SIDEBAR TOGGLE ────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarBackdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');
  document.body.style.overflow = '';
}
function toggleSidebar() { const o = document.getElementById('sidebar').classList.contains('open'); o ? closeSidebar() : openSidebar(); }

// ── LOADING BAR ───────────────────────────────────────
function showLoadingBar() {
  const bar = document.getElementById('loadingBar');
  bar.style.display = 'block';
  let w = 0;
  const iv = setInterval(() => { w = Math.min(w + 8, 88); document.getElementById('loadingBarFill').style.width = w + '%'; }, 100);
  bar._iv = iv;
}
function hideLoadingBar() {
  const bar = document.getElementById('loadingBar');
  clearInterval(bar._iv);
  document.getElementById('loadingBarFill').style.width = '100%';
  setTimeout(() => { bar.style.display = 'none'; document.getElementById('loadingBarFill').style.width = '0'; }, 400);
}

// ── RESET ─────────────────────────────────────────────
async function resetAll() {
  showConfirmPopup('All your progress will be permanently deleted. This cannot be undone.', async () => {
    try {
      await apiFetch('/progress/reset', { method: 'DELETE' });
      progressMap = {};
      filterAndRender(); updateAllStats();
      showToast('Progress reset', '');
    } catch (err) { showToast(err.message, 'error'); }
  }, { icon: '🗑️', title: 'Reset all progress?', confirmLabel: 'Reset', danger: true });
}

// ── HASH NAV ──────────────────────────────────────────
function handleHash() {
  const hash = window.location.hash;
  if (hash?.startsWith('#topic-')) scrollToTopic(hash.replace('#topic-', ''));
}

// ── POPUP ─────────────────────────────────────────────
function showPopup(msg) {
  document.getElementById('popupIcon').textContent = '⚠️';
  document.getElementById('popupTitle').textContent = 'Notice';
  document.getElementById('popupContent').textContent = msg;
  document.getElementById('popupActions').innerHTML =
    `<button class="popup-btn confirm-ok" onclick="closePopup()">Got it</button>`;
  document.getElementById('customPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('customPopup').style.display = 'none';
}

function showConfirmPopup(msg, onConfirm, opts = {}) {
  const icon = opts.icon || '🚪';
  const title = opts.title || 'Are you sure?';
  const confirmLabel = opts.confirmLabel || 'Confirm';
  const confirmClass = opts.danger ? 'confirm-danger' : 'confirm-ok';

  document.getElementById('popupIcon').textContent = icon;
  document.getElementById('popupTitle').textContent = title;
  document.getElementById('popupContent').textContent = msg;
  document.getElementById('popupActions').innerHTML = `
    <button class="popup-btn cancel" onclick="closePopup()">Cancel</button>
    <button class="popup-btn ${confirmClass}" id="popupConfirmBtn">${confirmLabel}</button>
  `;
  document.getElementById('popupConfirmBtn').onclick = () => { closePopup(); onConfirm(); };
  document.getElementById('customPopup').style.display = 'flex';
}

// ── TOAST ─────────────────────────────────────────────
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── SPINNER HELPERS ──────────────────────────────────
function showSpinner(label = 'Loading…') {
  const el = document.getElementById('spinnerOverlay');
  const lb = document.getElementById('spinnerLabel');
  if (lb) lb.textContent = label;
  el.style.display = 'flex';
}
function hideSpinner() {
  document.getElementById('spinnerOverlay').style.display = 'none';
}

// ── UTILS ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}