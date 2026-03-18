// ── GLOBAL ERROR HANDLER ──
window.addEventListener('error', function(event) {
  showPopup('JS Error: ' + event.message + '<br><small>' + (event.filename || '') + ':' + (event.lineno || '') + '</small>');
});
window.addEventListener('unhandledrejection', function(event) {
  showPopup('Promise Error: ' + (event.reason && event.reason.message ? event.reason.message : event.reason));
});

// ── HASH NAVIGATION FOR TOPICS ──
window.addEventListener('hashchange', handleHashNavigation);
function handleHashNavigation() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#topic-')) {
    const id = hash.replace('#topic-', '');
    expanded[id] = true;
    filterAndRender();
    setTimeout(() => {
      const el = document.getElementById('topic-' + id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
// On page load, handle hash if present
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash && window.location.hash.startsWith('#topic-')) {
    handleHashNavigation();
  }
});
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
let activeView = localStorage.getItem('dsa_active_view') || 'dsa';
let currentUser = null;
let topics = [];          // [{_id, name, emoji, questions:[]}]
let progressMap = {};     // { questionId: { status, solvedAt } }
let expanded = {};
let modalQ = null;
let toastTimer = null;
let sysTopicFilter = 'All';

const SYSTEM_DESIGN_KB = [
  {
    id: 'interview-flow',
    topic: 'Interview',
    title: 'System design interview flow (step-by-step)',
    summary: 'A repeatable 10–15 min structure to avoid getting stuck.',
    answerHtml: `
      <h4>Goal</h4>
      <div>Show structured thinking: requirements → architecture → trade-offs → reliability.</div>
      <h4>Suggested flow</h4>
      <ul>
        <li>Clarify functional requirements (features) + non-functional requirements (latency, QPS, availability).</li>
        <li>Estimate scale (users, requests/sec, storage growth) to justify design choices.</li>
        <li>Define APIs (request/response) and rough data model.</li>
        <li>High-level design: clients → LB → services → DB/cache/queue/CDN.</li>
        <li>Deep dive into the hottest path (read/write path), caching strategy, consistency, and failure modes.</li>
        <li>Wrap with trade-offs + what you would do next with more time (observability, capacity, cost).</li>
      </ul>
    `,
    diagram: diagramBasicWebService(),
  },
  {
    id: 'cap',
    topic: 'Fundamentals',
    title: 'CAP theorem + consistency models (what matters in interviews)',
    summary: 'Pick the right consistency for the product (not just buzzwords).',
    answerHtml: `
      <h4>CAP (simplified)</h4>
      <ul>
        <li><b>Consistency</b>: every read sees the latest write.</li>
        <li><b>Availability</b>: every request gets a non-error response.</li>
        <li><b>Partition tolerance</b>: system continues despite network splits.</li>
      </ul>
      <div>In real distributed systems, partitions can happen, so you usually choose trade-offs between <b>Consistency</b> and <b>Availability</b>.</div>
      <h4>Common models</h4>
      <ul>
        <li><b>Strong consistency</b>: great for money/inventory, higher latency/complexity.</li>
        <li><b>Eventual consistency</b>: great for feeds/likes/views, easier to scale.</li>
        <li><b>Read-your-writes</b>: UX-friendly compromise (users see their own updates quickly).</li>
      </ul>
      <h4>Interview tip</h4>
      <div>Always tie it to product: “We can accept eventual consistency for view counts, but not for payments.”</div>
    `,
    diagram: diagramReplication(),
  },
  {
    id: 'load-balancing',
    topic: 'Networking',
    title: 'Load balancers: L4 vs L7 + sticky sessions',
    summary: 'How traffic enters your system and why L7 matters.',
    answerHtml: `
      <h4>What a load balancer does</h4>
      <ul>
        <li>Distributes traffic across instances.</li>
        <li>Health checks + removes bad nodes.</li>
        <li>Enables horizontal scaling and blue/green deploys.</li>
      </ul>
      <h4>L4 vs L7</h4>
      <ul>
        <li><b>L4</b> (TCP/UDP): faster, less context, good for simple routing.</li>
        <li><b>L7</b> (HTTP): can route by path/header, do auth, rate limiting, A/B routing.</li>
      </ul>
      <h4>Sticky sessions</h4>
      <div>Avoid if you can. Prefer stateless services + centralized session store (Redis) or JWT.</div>
    `,
    diagram: diagramLB(),
  },
  {
    id: 'caching',
    topic: 'Caching',
    title: 'Caching patterns: cache-aside, write-through, write-back',
    summary: 'Caching is usually the fastest win for performance.',
    answerHtml: `
      <h4>Cache-aside (most common)</h4>
      <ul>
        <li>Read: app checks cache → miss → DB → populate cache.</li>
        <li>Write: app writes DB → invalidates/updates cache.</li>
      </ul>
      <h4>Write-through</h4>
      <div>Writes go to cache, cache writes to DB. Consistent but higher write latency.</div>
      <h4>Write-back</h4>
      <div>Writes go to cache and async to DB (fast, but risk of data loss on cache failure).</div>
      <h4>Hard problems</h4>
      <ul>
        <li>Invalidation + TTL selection</li>
        <li>Hot keys (one key hammered by many requests)</li>
        <li>Cache stampede (many clients miss at once)</li>
      </ul>
    `,
    diagram: diagramCacheAside(),
  },
  {
    id: 'rate-limiter',
    topic: 'Networking',
    title: 'Design a rate limiter (token bucket vs leaky bucket)',
    summary: 'Protects APIs and stabilizes downstream systems.',
    answerHtml: `
      <h4>Where to enforce</h4>
      <ul>
        <li>At CDN / API gateway / edge proxy (preferred)</li>
        <li>Inside service (fallback)</li>
      </ul>
      <h4>Algorithms</h4>
      <ul>
        <li><b>Token bucket</b>: smooth bursts up to bucket size; refill rate controls average.</li>
        <li><b>Leaky bucket</b>: outputs at constant rate; bursty input is queued/dropped.</li>
        <li><b>Fixed window</b>: simplest but boundary spikes.</li>
        <li><b>Sliding window</b>: more accurate, more expensive.</li>
      </ul>
      <h4>Distributed implementation</h4>
      <div>Use Redis with atomic increments + TTL (or Lua script) to avoid race conditions.</div>
    `,
    diagram: diagramRateLimiter(),
  },
  {
    id: 'url-shortener',
    topic: 'Designs',
    title: 'Design a URL shortener (bit.ly)',
    summary: 'Classic: hash/ID generation, redirects, analytics, abuse prevention.',
    answerHtml: `
      <h4>Core requirements</h4>
      <ul>
        <li>Create short URL for a long URL</li>
        <li>Redirect quickly (low latency)</li>
        <li>Optional: custom alias, expiry, analytics</li>
      </ul>
      <h4>Data model</h4>
      <ul>
        <li><code>short_code</code> → <code>long_url</code>, createdAt, expiresAt, ownerId</li>
      </ul>
      <h4>Code generation options</h4>
      <ul>
        <li>Auto-increment ID → Base62 encode (simple, scalable with ID service)</li>
        <li>Random string (collision handling needed)</li>
      </ul>
      <h4>Scaling</h4>
      <ul>
        <li>Cache hot redirects in Redis</li>
        <li>Use CDN/edge caching for ultra-hot URLs</li>
      </ul>
    `,
    diagram: diagramUrlShortener(),
  },
  {
    id: 'feed',
    topic: 'Designs',
    title: 'Design a news feed (push vs pull)',
    summary: 'Choosing between fanout-on-write and fanout-on-read.',
    answerHtml: `
      <h4>Two main approaches</h4>
      <ul>
        <li><b>Fanout-on-write (push)</b>: when user posts, write to followers’ timelines. Fast reads, heavy writes.</li>
        <li><b>Fanout-on-read (pull)</b>: compute feed at read time by fetching recent posts from followed users. Cheaper writes, heavier reads.</li>
      </ul>
      <h4>Hybrid (common)</h4>
      <div>Push for normal users; pull for “celebrity” accounts with massive follower count.</div>
      <h4>Storage</h4>
      <ul>
        <li>Posts store + follow graph store</li>
        <li>Timeline store (materialized) if using push/hybrid</li>
      </ul>
    `,
    diagram: diagramFeed(),
  },
  {
    id: 'queues',
    topic: 'Messaging',
    title: 'Queues + stream processing (Kafka vs RabbitMQ mental model)',
    summary: 'When to decouple services and smooth spikes.',
    answerHtml: `
      <h4>Why queues</h4>
      <ul>
        <li>Absorb bursts (protect DB/services)</li>
        <li>Async jobs: emails, notifications, video processing</li>
        <li>Retry + dead letter queues</li>
      </ul>
      <h4>Queue vs log</h4>
      <ul>
        <li><b>Classic queue</b>: messages consumed and removed (work distribution).</li>
        <li><b>Log/stream</b>: durable ordered log with consumer offsets (replay, multiple consumers).</li>
      </ul>
      <h4>Exactly-once?</h4>
      <div>In practice, design for at-least-once + idempotent consumers.</div>
    `,
    diagram: diagramQueue(),
  },
  {
    id: 'sharding',
    topic: 'Databases',
    title: 'Sharding strategies + hot partitions',
    summary: 'How to split data across nodes and avoid hotspots.',
    answerHtml: `
      <h4>Sharding options</h4>
      <ul>
        <li><b>Range-based</b>: easy range queries, risk of hot shard.</li>
        <li><b>Hash-based</b>: even distribution, harder range queries.</li>
        <li><b>Directory-based</b>: lookup table maps key → shard.</li>
      </ul>
      <h4>Hot partitions</h4>
      <div>Common cause: monotonic keys (timestamps) or celebrity users.</div>
      <h4>Mitigations</h4>
      <ul>
        <li>Use hash prefixes / consistent hashing</li>
        <li>Separate hot entities into dedicated partitions</li>
        <li>Cache aggressively for hot reads</li>
      </ul>
    `,
    diagram: diagramSharding(),
  },
  {
    id: 'cdn',
    topic: 'Networking',
    title: 'CDN basics: caching at the edge + invalidation',
    summary: 'Huge latency win for static + cacheable content.',
    answerHtml: `
      <h4>What a CDN helps with</h4>
      <ul>
        <li>Serve static assets close to users (images, JS, CSS)</li>
        <li>Reduce origin load</li>
        <li>Can terminate TLS and do basic protection (WAF)</li>
      </ul>
      <h4>Invalidation strategies</h4>
      <ul>
        <li>Cache-busting URLs (best): <code>app.3f2a9.js</code></li>
        <li>TTL-based caching</li>
        <li>Explicit purge/invalidate (costly at scale)</li>
      </ul>
    `,
    diagram: diagramCDN(),
  },
];

// ── INIT ──────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  setView(activeView);
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
    // Ensure hash navigation works after login
    if (window.location.hash && window.location.hash.startsWith('#topic-')) {
      setTimeout(handleHashNavigation, 200);
    }
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
  showConfirmPopup('Log out?', () => {
    token = null;
    localStorage.removeItem('dsa_token');
    currentUser = null;
    topics = []; progressMap = {};
    document.getElementById('content').innerHTML = '';
    showAuth();
  });
}

function setView(view) {
  activeView = view === 'system' ? 'system' : 'dsa';
  localStorage.setItem('dsa_active_view', activeView);

  const btnDsa = document.getElementById('viewBtnDsa');
  const btnSys = document.getElementById('viewBtnSystem');
  if (btnDsa) btnDsa.classList.toggle('active', activeView === 'dsa');
  if (btnSys) btnSys.classList.toggle('active', activeView === 'system');

  const hero = document.getElementById('heroSection');
  const content = document.getElementById('content');
  const sys = document.getElementById('systemDesignSection');

  if (hero) hero.style.display = activeView === 'dsa' ? '' : 'none';
  if (content) content.style.display = activeView === 'dsa' ? '' : 'none';
  if (sys) sys.style.display = activeView === 'system' ? '' : 'none';

  const searchWrap = document.querySelector('.topbar-filters');
  if (searchWrap) searchWrap.style.display = activeView === 'dsa' ? '' : 'none';

  const pills = document.querySelectorAll('.topbar-right .pill-btn');
  pills.forEach(p => { p.style.display = activeView === 'dsa' ? '' : 'none'; });

  if (activeView === 'system') {
    ensureSystemDesignTopics();
    renderSystemDesign();
  }
}

function ensureSystemDesignTopics() {
  const el = document.getElementById('sysTopics');
  if (!el) return;
  if (el.dataset.ready === '1') return;

  const topics = Array.from(new Set(SYSTEM_DESIGN_KB.map(x => x.topic))).sort();
  const all = ['All', ...topics];
  el.innerHTML = '';

  all.forEach(t => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sys-topic-chip';
    chip.textContent = t;
    chip.onclick = () => {
      sysTopicFilter = t;
      el.querySelectorAll('.sys-topic-chip').forEach(c => c.classList.toggle('active', c.textContent === t));
      renderSystemDesign();
    };
    if (t === sysTopicFilter) chip.classList.add('active');
    el.appendChild(chip);
  });

  el.dataset.ready = '1';
}

function renderSystemDesign() {
  const acc = document.getElementById('sysAccordion');
  if (!acc) return;

  const q = (document.getElementById('sysSearch')?.value || '').toLowerCase().trim();

  const filtered = SYSTEM_DESIGN_KB.filter(item => {
    if (sysTopicFilter !== 'All' && item.topic !== sysTopicFilter) return false;
    if (!q) return true;
    const hay = `${item.topic} ${item.title} ${item.summary} ${item.answerHtml}`.toLowerCase();
    return hay.includes(q);
  });

  acc.innerHTML = '';
  if (!filtered.length) {
    acc.innerHTML = `<div class="sys-item"><div class="sys-item-header"><div class="sys-item-title"><strong>No matches</strong><div class="sys-item-meta">Try another keyword or switch topics.</div></div><div class="sys-chevron">▼</div></div></div>`;
    return;
  }

  filtered.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'sys-item';
    wrap.id = `sys_${item.id}`;
    wrap.innerHTML = `
      <div class="sys-item-header">
        <div class="sys-item-title">
          <strong>${escapeHtml(item.title)}</strong>
          <div class="sys-item-meta">${escapeHtml(item.topic)} · ${escapeHtml(item.summary || '')}</div>
        </div>
        <div class="sys-chevron">▼</div>
      </div>
      <div class="sys-item-body">
        <div class="sys-answer">${item.answerHtml || ''}</div>
        ${item.diagram ? `<div class="sys-diagram">${item.diagram}</div>` : ''}
      </div>
    `;

    const header = wrap.querySelector('.sys-item-header');
    header.addEventListener('click', () => {
      wrap.classList.toggle('open');
    });
    acc.appendChild(wrap);
  });
}

window.renderSystemDesign = renderSystemDesign;
window.setView = setView;

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function svgBox(label, x, y, w, h, accent = 'var(--green)') {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${accent}" opacity="0.45" />
      <text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="14" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial">${label}</text>
    </g>
  `;
}

function svgArrow(x1, y1, x2, y2) {
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.45)" stroke-width="2" marker-end="url(#arrow)" />
  `;
}

function svgWrap(inner, width = 980, height = 220) {
  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="system design diagram">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.55)" />
        </marker>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.0)" />
      ${inner}
    </svg>
  `;
}

function diagramBasicWebService() {
  const inner = `
    ${svgBox('Client', 50, 75, 130, 70, 'var(--blue)')}
    ${svgBox('API', 250, 75, 150, 70, 'var(--green)')}
    ${svgBox('DB', 470, 40, 150, 70, 'var(--red)')}
    ${svgBox('Cache', 470, 120, 150, 70, 'var(--green)')}
    ${svgArrow(180, 110, 250, 110)}
    ${svgArrow(400, 110, 470, 75)}
    ${svgArrow(400, 110, 470, 155)}
  `;
  return svgWrap(inner);
}

function diagramReplication() {
  const inner = `
    ${svgBox('Primary', 260, 55, 160, 70, 'var(--green)')}
    ${svgBox('Replica 1', 500, 25, 160, 70, 'var(--blue)')}
    ${svgBox('Replica 2', 500, 115, 160, 70, 'var(--blue)')}
    ${svgArrow(420, 90, 500, 60)}
    ${svgArrow(420, 90, 500, 150)}
    <text x="340" y="44" text-anchor="middle" fill="rgba(226,232,240,0.78)" font-size="12" font-family="Inter, system-ui">replication</text>
  `;
  return svgWrap(inner, 980, 210);
}

function diagramLB() {
  const inner = `
    ${svgBox('Client', 60, 75, 140, 70, 'var(--blue)')}
    ${svgBox('Load Balancer', 260, 75, 190, 70, 'var(--green)')}
    ${svgBox('Service A', 540, 30, 160, 70, 'var(--green)')}
    ${svgBox('Service B', 540, 120, 160, 70, 'var(--green)')}
    ${svgBox('Service C', 740, 75, 160, 70, 'var(--green)')}
    ${svgArrow(200, 110, 260, 110)}
    ${svgArrow(450, 110, 540, 65)}
    ${svgArrow(450, 110, 540, 155)}
    ${svgArrow(700, 65, 740, 110)}
  `;
  return svgWrap(inner);
}

function diagramCacheAside() {
  const inner = `
    ${svgBox('App', 120, 75, 160, 70, 'var(--green)')}
    ${svgBox('Cache', 360, 40, 170, 70, 'var(--blue)')}
    ${svgBox('DB', 360, 120, 170, 70, 'var(--red)')}
    ${svgArrow(280, 110, 360, 75)}
    ${svgArrow(280, 110, 360, 155)}
    <text x="445" y="30" text-anchor="middle" fill="rgba(226,232,240,0.78)" font-size="12" font-family="Inter, system-ui">read → cache miss → db → fill</text>
  `;
  return svgWrap(inner);
}

function diagramRateLimiter() {
  const inner = `
    ${svgBox('Clients', 60, 75, 150, 70, 'var(--blue)')}
    ${svgBox('API Gateway', 260, 75, 190, 70, 'var(--green)')}
    ${svgBox('Rate Limiter', 500, 75, 190, 70, 'var(--red)')}
    ${svgBox('Services', 740, 75, 170, 70, 'var(--green)')}
    ${svgArrow(210, 110, 260, 110)}
    ${svgArrow(450, 110, 500, 110)}
    ${svgArrow(690, 110, 740, 110)}
  `;
  return svgWrap(inner);
}

function diagramUrlShortener() {
  const inner = `
    ${svgBox('Client', 60, 75, 140, 70, 'var(--blue)')}
    ${svgBox('Shorten API', 240, 75, 170, 70, 'var(--green)')}
    ${svgBox('ID / Base62', 450, 35, 170, 70, 'var(--blue)')}
    ${svgBox('URL Store', 450, 125, 170, 70, 'var(--red)')}
    ${svgBox('Redirect', 680, 75, 170, 70, 'var(--green)')}
    ${svgArrow(200, 110, 240, 110)}
    ${svgArrow(410, 110, 450, 70)}
    ${svgArrow(410, 110, 450, 160)}
    ${svgArrow(620, 110, 680, 110)}
  `;
  return svgWrap(inner);
}

function diagramFeed() {
  const inner = `
    ${svgBox('User', 50, 75, 140, 70, 'var(--blue)')}
    ${svgBox('Feed Service', 230, 75, 180, 70, 'var(--green)')}
    ${svgBox('Posts Store', 450, 35, 180, 70, 'var(--red)')}
    ${svgBox('Timeline Store', 450, 125, 180, 70, 'var(--blue)')}
    ${svgBox('Cache', 690, 75, 180, 70, 'var(--green)')}
    ${svgArrow(190, 110, 230, 110)}
    ${svgArrow(410, 110, 450, 70)}
    ${svgArrow(410, 110, 450, 160)}
    ${svgArrow(630, 110, 690, 110)}
  `;
  return svgWrap(inner);
}

function diagramQueue() {
  const inner = `
    ${svgBox('Service A', 90, 75, 170, 70, 'var(--green)')}
    ${svgBox('Queue', 310, 75, 160, 70, 'var(--blue)')}
    ${svgBox('Workers', 520, 75, 170, 70, 'var(--green)')}
    ${svgBox('DB', 740, 75, 150, 70, 'var(--red)')}
    ${svgArrow(260, 110, 310, 110)}
    ${svgArrow(470, 110, 520, 110)}
    ${svgArrow(690, 110, 740, 110)}
  `;
  return svgWrap(inner);
}

function diagramSharding() {
  const inner = `
    ${svgBox('Router', 120, 75, 160, 70, 'var(--green)')}
    ${svgBox('Shard 1', 340, 25, 160, 70, 'var(--blue)')}
    ${svgBox('Shard 2', 340, 115, 160, 70, 'var(--blue)')}
    ${svgBox('Shard 3', 540, 75, 160, 70, 'var(--blue)')}
    ${svgArrow(280, 110, 340, 60)}
    ${svgArrow(280, 110, 340, 150)}
    ${svgArrow(500, 60, 540, 110)}
  `;
  return svgWrap(inner, 980, 210);
}

function diagramCDN() {
  const inner = `
    ${svgBox('User', 60, 75, 150, 70, 'var(--blue)')}
    ${svgBox('CDN (Edge)', 260, 75, 180, 70, 'var(--green)')}
    ${svgBox('Origin', 500, 75, 180, 70, 'var(--red)')}
    ${svgArrow(210, 110, 260, 110)}
    ${svgArrow(440, 110, 500, 110)}
    <text x="350" y="55" text-anchor="middle" fill="rgba(226,232,240,0.78)" font-size="12" font-family="Inter, system-ui">cache hits</text>
  `;
  return svgWrap(inner);
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
  const longest = currentUser.streak?.longest || 0;
  const lastSolved = currentUser.streak?.lastSolvedDate ? new Date(currentUser.streak.lastSolvedDate) : null;
  let streakText = `🔥 <b>${streak}</b> day${streak !== 1 ? 's' : ''} streak`;
  if (longest > 0) streakText += ` <span style="color:var(--blue);font-size:12px;">(Longest: ${longest})</span>`;
  if (lastSolved) {
    const dateStr = lastSolved.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    streakText += `<br><span style="color:var(--text-secondary);font-size:11px;">Last solved: ${dateStr}</span>`;
  }
  document.getElementById('userStreak').innerHTML = streakText;
  updateStreakRing(streak);
  renderStreakHeatmap();
}

function updateStreakRing(streakDays) {
  const ring = document.getElementById('streakRing');
  const num = document.getElementById('streakRingNum');
  const label = document.getElementById('streakRingLabel');
  if (!ring || !num || !label) return;

  const cap = 30;
  const v = Math.max(0, Number(streakDays) || 0);
  const pct = Math.min(1, v / cap);
  const circumference = 213.6;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference - pct * circumference}`;

  num.textContent = String(v);
  label.textContent = v === 1 ? 'day' : 'days';
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
    renderStreakHeatmap();
  } catch (err) {
    showPopup('Failed to load progress. Please log in again.');
  } finally {
    hideSpinner();
  }
}

// ── STREAK HEATMAP RENDER ──
function renderStreakHeatmap() {
  const container = document.getElementById('streakHeatmap');
  if (!container) return;
  // Build a map: date (YYYY-MM-DD) -> count
  const solvedDates = {};
  Object.values(progressMap).forEach(p => {
    if (p.solvedAt) {
      const d = new Date(p.solvedAt);
      const key = d.toISOString().slice(0, 10);
      solvedDates[key] = (solvedDates[key] || 0) + 1;
    }
  });
  // GitHub-style: last 26 weeks, aligned to week start (Sun)
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const weeks = 26;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - start.getDay());

  const grid = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = date.toISOString().slice(0, 10);
      grid.push({ key, count: solvedDates[key] || 0, isToday: key === todayKey });
    }
  }
  // Render
  container.innerHTML = '';
  grid.forEach(cell => {
    const dot = document.createElement('div');
    dot.className = 'streak-dot';
    let level = 0;
    if (cell.count >= 4) level = 4;
    else if (cell.count === 3) level = 3;
    else if (cell.count === 2) level = 2;
    else if (cell.count === 1) level = 1;
    dot.classList.add('level-' + level);
    if (cell.isToday) dot.classList.add('today');
    dot.title = `${cell.key}: ${cell.count ? cell.count + ' solved' : 'No activity'}`;
    container.appendChild(dot);
  });
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
        <td class="col-check" data-label="Solved">
          <input type="checkbox" class="q-check" ${isSolved ? 'checked' : ''}
            onchange="toggleSolved('${q._id}')" />
        </td>
        <td class="col-num" data-label="#">
          <div class="q-num" data-idx="${i+1}">${isSolved ? '✓' : i+1}</div>
        </td>
        <td class="col-name q-name" data-label="Problem">${q.title}</td>
        <td class="col-diff" data-label="Difficulty">
          <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
        </td>
        <td class="col-pat" data-label="Pattern">${q.pattern || ''}</td>
        <td class="col-co" data-label="Companies">${(q.companies||[]).join(' · ')}</td>
        <td class="col-lc" data-label="Link">
          <a href="${q.lcLink}" target="_blank" class="lc-link${isGFG ? ' gfg-link' : ''}" onclick="event.stopPropagation()">
            ${q.lcNumber} ↗
          </a>
        </td>
        <td class="col-info" data-label="Info">
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
  showConfirmPopup('Reset ALL your progress? This cannot be undone.', async () => {
    try {
      await apiFetch('/progress/reset', { method: 'DELETE' });
      progressMap = {};
      updateAllStats();
      filterAndRender();
      showToast('🔄 All progress reset', '');
    } catch (err) {
      showToast('Error resetting progress', 'error');
    }
  });
}
// ── CUSTOM CONFIRM POPUP ──
function showConfirmPopup(message, onConfirm) {
  const popup = document.getElementById('customPopup');
  const content = document.getElementById('popupContent');
  content.innerHTML = message;
  // Remove old buttons if any
  let btns = popup.querySelectorAll('.popup-btn');
  btns.forEach(b => b.remove());
  // Add confirm/cancel buttons
  const okBtn = document.createElement('button');
  okBtn.textContent = 'OK';
  okBtn.className = 'popup-btn popup-close';
  okBtn.onclick = () => { popup.style.display = 'none'; onConfirm(); };
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'popup-btn';
  cancelBtn.onclick = () => { popup.style.display = 'none'; };
  content.appendChild(document.createElement('br'));
  content.appendChild(okBtn);
  content.appendChild(cancelBtn);
  popup.style.display = 'block';
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast visible ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('visible'); }, 2500);
}
