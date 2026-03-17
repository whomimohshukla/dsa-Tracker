// ── FUTURE SECTIONS LOGIC PLACEHOLDER ──
// To add logic for new sections (e.g., System Design),
// create new functions here and link them to your UI as needed.
// Example: function loadSystemDesign() { ... }
/* ═══════════════════════════════════════════════════════════
   DSA MASTER TRACKER — app.js
   Full API integration with MongoDB backend
   Auth (JWT) · Progress sync · Real-time stats
═══════════════════════════════════════════════════════════ */

const API = window.location.origin + '/api';

// ── STATE ─────────────────────────────────────────────────
let token = localStorage.getItem('dsa_token') || null;
let currentUser = null;
let topics = [];          // [{_id, name, emoji, questions:[]}]
let progressMap = {};     // { questionId: { status, solvedAt } }
let expanded = {};
let modalQ = null;
let toastTimer = null;

// ── INIT ──────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
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
    filterAndRender();
    updateAllStats();
  } catch (err) {
    token = null;
    localStorage.removeItem('dsa_token');
    showAuth();
  }
}

// ── AUTH ──────────────────────────────────────────────────
function showAuth() {
  document.getElementById('authOverlay').style.display = 'flex';
}
function hideAuth() {
  document.getElementById('authOverlay').style.display = 'none';
}
function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  clearAuthError();
}
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg; el.style.display = 'block';
}
function clearAuthError() {
  const el = document.getElementById('authError');
  el.textContent = ''; el.style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  btn.disabled = true; btn.textContent = 'Logging in...';
  clearAuthError();
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    token = data.token;
    localStorage.setItem('dsa_token', token);
    await bootstrap();
  } catch (err) {
    showAuthError(err.message || 'Login failed. Check your credentials.');
  } finally {
    btn.disabled = false; btn.textContent = 'Login';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  btn.disabled = true; btn.textContent = 'Creating account...';
  clearAuthError();
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    token = data.token;
    localStorage.setItem('dsa_token', token);
    await bootstrap();
    showToast('🎉 Account created! Welcome aboard!', 'success');
  } catch (err) {
    showAuthError(err.message || 'Registration failed.');
  } finally {
    btn.disabled = false; btn.textContent = 'Create Account';
  }
}

function logout() {
  if (!confirm('Log out?')) return;
  token = null;
  localStorage.removeItem('dsa_token');
  currentUser = null;
  topics = []; progressMap = {};
  document.getElementById('content').innerHTML = '';
  showAuth();
}

// ── API HELPERS ───────────────────────────────────────────
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });

  // Some responses (e.g. 204 or server errors without body) may return an empty body.
  // Avoid crashing with "Unexpected end of JSON input" by parsing safely.
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response from ${path}: ${text}`);
    }
  }

  if (!res.ok) throw new Error(data.message || `API error (${res.status})`);
  return data;
}

async function verifyToken() {
  const data = await apiFetch('/auth/me');
  currentUser = data.user;
  document.getElementById('userName').textContent = currentUser.username;
  document.getElementById('userAvatar').textContent = currentUser.username[0].toUpperCase();
  const streak = currentUser.streak?.current || 0;
  document.getElementById('userStreak').textContent = `🔥 ${streak} day${streak !== 1 ? 's' : ''} streak`;
}


// ── MODERN SPINNER LOADER ──
function showSpinner() {
  document.getElementById('spinnerOverlay').style.display = 'flex';
}
function hideSpinner() {
  document.getElementById('spinnerOverlay').style.display = 'none';
}

// ── CUSTOM POPUP ──
function showPopup(message) {
  document.getElementById('popupContent').innerHTML = message;
  document.getElementById('customPopup').style.display = 'block';
}
function closePopup() {
  document.getElementById('customPopup').style.display = 'none';
}

async function loadTopics() {
  showSpinner();
  try {
    const data = await apiFetch('/questions/topics');
    // data.topics is array of { _id, name, emoji, questions, count, ... }
    topics = data.topics.sort((a, b) => {
      const order = ['arrays','strings','linkedlists','binarysearch','dp','graphs','trees','stacks','heaps','backtracking','greedy','bit','trie'];
      return order.indexOf(a._id) - order.indexOf(b._id);
    });
  } catch (err) {
    showPopup('Failed to load questions. Please check your connection or reseed your database.');
  } finally {
    hideSpinner();
  }
}

async function loadProgress() {
  showSpinner();
  try {
    const data = await apiFetch('/progress');
    progressMap = data.progressMap || {};
  } catch (err) {
    showPopup('Failed to load progress. Please log in again.');
  } finally {
    hideSpinner();
  }
}

// ── TOGGLE SOLVED ─────────────────────────────────────────
// Use showPopup for error/info messages instead of alert.
async function toggleSolved(questionId, fromModal = false) {
  const wasSolved = !!progressMap[questionId];
  // Optimistic update
  if (wasSolved) {
    delete progressMap[questionId];
  } else {
    progressMap[questionId] = { status: 'solved', solvedAt: new Date().toISOString() };
  }
  updateRowUI(questionId);
  updateAllStats();

  try {
    await apiFetch('/progress/toggle', {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    });
    showToast(wasSolved ? '↩ Unmarked' : '✅ Marked as solved!', wasSolved ? '' : 'success');
    if (fromModal) renderModalActions();
  } catch (err) {
    // Rollback on error
    if (wasSolved) {
      progressMap[questionId] = { status: 'solved' };
    } else {
      delete progressMap[questionId];
    }
    updateRowUI(questionId);
    updateAllStats();
    showToast('Error saving progress', 'error');
  }
}

function updateRowUI(questionId) {
  const isSolved = !!progressMap[questionId];
  const row = document.getElementById('row_' + questionId);
  if (!row) return;
  row.classList.toggle('solved', isSolved);
  const cb = row.querySelector('.q-check');
  if (cb) cb.checked = isSolved;
  const numEl = row.querySelector('.q-num');
  const idx = numEl?.dataset.idx;
  if (numEl) numEl.textContent = isSolved ? '✓' : (idx || '');
  if (isSolved) { row.classList.add('just-solved'); setTimeout(() => row.classList.remove('just-solved'), 400); }
  // Update topic bar
  const topicId = row.dataset.topicId;
  if (topicId) updateTopicBar(topicId);
}

function updateTopicBar(topicId) {
  const t = topics.find(t => t._id === topicId);
  if (!t) return;
  const done = t.questions.filter(q => progressMap[q._id]).length;
  const pct = Math.round(done / t.questions.length * 100);
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
  let total = 0, done = 0, easy = 0, med = 0, hard = 0;
  let easyDone = 0, medDone = 0, hardDone = 0;
  topics.forEach(t => {
    t.questions.forEach(q => {
      total++;
      if (q.difficulty === 'Easy') easy++;
      else if (q.difficulty === 'Medium') med++;
      else hard++;
      if (progressMap[q._id]) {
        done++;
        if (q.difficulty === 'Easy') easyDone++;
        else if (q.difficulty === 'Medium') medDone++;
        else hardDone++;
      }
    });
  });
  return { total, done, easy, med, hard, easyDone, medDone, hardDone };
}

function updateAllStats() {
  const s = computeStats();
  const pct = s.total ? Math.round(s.done / s.total * 100) : 0;
  const offset = 213.6 - (pct / 100) * 213.6;
  document.getElementById('circleNum').textContent = s.done;
  document.getElementById('circleTotal').textContent = s.total;
  document.getElementById('circleRing').style.strokeDashoffset = offset;
  document.getElementById('overallPct').textContent = pct + '% Complete';
  document.getElementById('mEasy').textContent = `${s.easyDone}/${s.easy}`;
  document.getElementById('mMed').textContent = `${s.medDone}/${s.med}`;
  document.getElementById('mHard').textContent = `${s.hardDone}/${s.hard}`;
  document.getElementById('hTotal').textContent = s.total;
  document.getElementById('hDone').textContent = s.done;
  document.getElementById('hLeft').textContent = s.total - s.done;
  document.getElementById('hTopics').textContent = topics.length;
}

// ── SIDEBAR ────────────────────────────────────────────────
function buildSidebar() {
  const nav = document.getElementById('topicNav');
  nav.innerHTML = '';
  topics.forEach(t => {
    const done = t.questions.filter(q => progressMap[q._id]).length;
    const el = document.createElement('a');
    el.href = '#topic-' + t._id;
    el.className = 'nav-item';
    el.dataset.id = t._id;
    if (done === t.questions.length && done > 0) el.classList.add('all-done');
    el.innerHTML = `
      <span class="nav-emoji">${t.emoji}</span>
      <span class="nav-name">${t.name}</span>
      <span class="nav-prog">${done}/${t.questions.length}</span>
      <span class="nav-dot"></span>
    `;
    el.addEventListener('click', () => { if (window.innerWidth <= 768) toggleSidebar(); });
    nav.appendChild(el);
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── FILTER & RENDER ────────────────────────────────────────
function filterAndRender() {
  const diff = document.getElementById('diffFilter').value;
  const status = document.getElementById('statusFilter').value;
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const content = document.getElementById('content');
  content.innerHTML = '';
  let anyVisible = false;

  topics.forEach((t, ti) => {
    const filtered = t.questions.filter(q => {
      if (diff && q.difficulty !== diff) return false;
      const solved = !!progressMap[q._id];
      if (status === 'done' && !solved) return false;
      if (status === 'todo' && solved) return false;
      if (search) {
        const hay = [q.title, q.pattern, (q.companies||[]).join(' '), q.lcNumber, t.name].join(' ').toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
    if (!filtered.length) return;
    anyVisible = true;

    const done = t.questions.filter(q => progressMap[q._id]).length;
    const pct = Math.round(done / t.questions.length * 100);
    const isOpen = expanded[t._id] !== false;

    const section = document.createElement('div');
    section.className = 'topic-section';
    section.id = 'topic-' + t._id;
    section.style.animationDelay = ti * 0.04 + 's';
    section.innerHTML = `
      <div class="topic-header" onclick="toggleTopic('${t._id}')">
        <span class="topic-emoji">${t.emoji}</span>
        <div class="topic-name-wrap">
          <span class="topic-name">${t.name}</span>
          <span class="topic-sub">${t.count} questions · Easy:${t.easyCount} Med:${t.mediumCount} Hard:${t.hardCount}</span>
        </div>
        <div class="topic-right">
          <span class="topic-count" data-id="${t._id}">${done}/${t.questions.length}</span>
          <div class="topic-bar-wrap">
            <div class="topic-bar-bg">
              <div class="topic-bar-fill" data-id="${t._id}" style="width:${pct}%"></div>
            </div>
          </div>
          <span class="topic-chevron ${isOpen ? 'open' : ''}" id="chev-${t._id}">▼</span>
        </div>
      </div>
      <div class="topic-body ${isOpen ? 'open' : ''}" id="tbody-${t._id}">
        <table class="q-table">
          <thead>
            <tr>
              <th class="col-check">✓</th>
              <th class="col-num">#</th>
              <th class="col-name">Problem</th>
              <th class="col-diff">Difficulty</th>
              <th class="col-pat">Pattern</th>
              <th class="col-co">Companies</th>
              <th class="col-lc">Link</th>
              <th class="col-info">Info</th>
            </tr>
          </thead>
          <tbody id="qbody-${t._id}"></tbody>
        </table>
      </div>
    `;
    content.appendChild(section);

    const tbody = document.getElementById('qbody-' + t._id);
    filtered.forEach((q, i) => {
      const isSolved = !!progressMap[q._id];
      const isGFG = (q.lcNumber || '').includes('GFG') || (q.lcNumber || '').includes('SPOJ');
      const tr = document.createElement('tr');
      tr.id = 'row_' + q._id;
      tr.dataset.topicId = t._id;
      tr.className = isSolved ? 'solved' : '';
      tr.innerHTML = `
        <td class="col-check">
          <input type="checkbox" class="q-check" ${isSolved ? 'checked' : ''}
            onchange="toggleSolved('${q._id}')" />
        </td>
        <td class="col-num">
          <div class="q-num" data-idx="${i+1}">${isSolved ? '✓' : i+1}</div>
        </td>
        <td class="col-name q-name">${q.title}</td>
        <td class="col-diff">
          <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
        </td>
        <td class="col-pat">${q.pattern || ''}</td>
        <td class="col-co">${(q.companies||[]).join(' · ')}</td>
        <td class="col-lc">
          <a href="${q.lcLink}" target="_blank" class="lc-link${isGFG ? ' gfg-link' : ''}" onclick="event.stopPropagation()">
            ${q.lcNumber} ↗
          </a>
        </td>
        <td class="col-info">
          <button class="info-btn" onclick="openModal('${t._id}','${q._id}')" title="View hints">?</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });

  if (!anyVisible) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No questions match your filters.<br>Try adjusting difficulty, status, or search term.</p>
      </div>
    `;
  }
}

function toggleTopic(id) {
  expanded[id] = !(expanded[id] !== false);
  const body = document.getElementById('tbody-' + id);
  const chev = document.getElementById('chev-' + id);
  if (body) body.classList.toggle('open', expanded[id]);
  if (chev) chev.classList.toggle('open', expanded[id]);
}

function expandAll() {
  topics.forEach(t => { expanded[t._id] = true; });
  filterAndRender();
}
function collapseAll() {
  topics.forEach(t => { expanded[t._id] = false; });
  filterAndRender();
}

// ── MODAL ──────────────────────────────────────────────────
function openModal(topicId, questionId) {
  const t = topics.find(t => t._id === topicId);
  if (!t) return;
  const q = t.questions.find(q => q._id === questionId);
  if (!q) return;
  modalQ = { topicId, questionId, q };

  const isGFG = (q.lcNumber||'').includes('GFG') || (q.lcNumber||'').includes('SPOJ');
  const isSolved = !!progressMap[questionId];

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-title">${q.title}</div>
    <div class="modal-meta">
      <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
      <span class="badge" style="background:var(--bg-active);color:var(--text-secondary)">${t.emoji} ${t.name}</span>
      ${isSolved ? '<span class="badge" style="background:var(--green-dim);color:var(--green)">✓ Solved</span>' : ''}
    </div>
    <div class="modal-grid">
      <div class="modal-info-box">
        <div class="modal-info-label">Companies</div>
        <div class="modal-info-val" style="font-size:11px">${(q.companies||[]).join(' · ')}</div>
      </div>
      <div class="modal-info-box">
        <div class="modal-info-label">Pattern</div>
        <div class="modal-info-val" style="font-size:11.5px">${q.pattern || '—'}</div>
      </div>
      <div class="modal-info-box">
        <div class="modal-info-label">Platform</div>
        <div class="modal-info-val">${q.lcNumber}</div>
      </div>
    </div>

    ${q.timeComplexity || q.spaceComplexity ? `
    <div class="modal-complexity">
      ${q.timeComplexity ? `<div class="complexity-chip">⏱ Time: ${q.timeComplexity}</div>` : ''}
      ${q.spaceComplexity ? `<div class="complexity-chip">💾 Space: ${q.spaceComplexity}</div>` : ''}
    </div>` : ''}

    <div class="modal-section-title">💡 Hint</div>
    <div class="modal-hint-box">${q.hint || 'No hint available.'}</div>

    <div class="modal-section-title">🧩 Approach</div>
    <div class="modal-approach">${q.approach || 'No approach details available.'}</div>

    <div class="modal-tip">⭐ <strong>Pro Tip:</strong> ${q.proTip || q.tip || 'Study the pattern carefully.'}</div>

    <div class="modal-actions" id="modalActions">
      <a href="${q.lcLink}" target="_blank" class="modal-lc-btn">Open ${isGFG ? 'GFG' : 'LeetCode'} ↗</a>
      ${isSolved
        ? `<button class="modal-unsolve-btn" onclick="toggleSolved('${questionId}', true)">Unmark ✗</button>`
        : `<button class="modal-solve-btn" onclick="toggleSolved('${questionId}', true)">Mark Solved ✓</button>`
      }
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalActions() {
  if (!modalQ) return;
  const { questionId, q } = modalQ;
  const isGFG = (q.lcNumber||'').includes('GFG') || (q.lcNumber||'').includes('SPOJ');
  const isSolved = !!progressMap[questionId];
  const el = document.getElementById('modalActions');
  if (el) el.innerHTML = `
    <a href="${q.lcLink}" target="_blank" class="modal-lc-btn">Open ${isGFG ? 'GFG' : 'LeetCode'} ↗</a>
    ${isSolved
      ? `<button class="modal-unsolve-btn" onclick="toggleSolved('${questionId}', true)">Unmark ✗</button>`
      : `<button class="modal-solve-btn" onclick="toggleSolved('${questionId}', true)">Mark Solved ✓</button>`
    }
  `;
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
  if (!confirm('Reset ALL your progress? This cannot be undone.')) return;
  try {
    await apiFetch('/progress/reset', { method: 'DELETE' });
    progressMap = {};
    updateAllStats();
    filterAndRender();
    showToast('🔄 All progress reset', '');
  } catch (err) {
    showToast('Error resetting progress', 'error');
  }
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast visible ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('visible'); }, 2500);
}
