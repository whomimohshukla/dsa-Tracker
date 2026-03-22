# ⬡ NexusTrack — DSA + AI/ML Mastery Tracker

> **Dual-track learning platform**: 300+ DSA questions + Complete AI/ML Engineer Roadmap with YouTube resources per topic.

---

## 🚀 What's New

- **🧠 AI/ML Track** — 7 phases, 80+ topics from Python basics → GenAI agents
- **📺 YouTube Resources** — CampusX, Krish Naik, Andrej Karpathy, StatQuest per topic
- **⬡ Track Switcher** — Instantly switch between DSA and AI/ML modes
- **🎨 New UI** — Space Grotesk + Unbounded typography, dark theme, phase indicators
- **💡 Rich Modals** — Hints, approach, pro tip, complexity + YouTube links in one place

---

## 📦 Project Structure

```
nexustrack/
├── backend/
│   ├── server.js              # Express app
│   ├── seed.js                # DSA seed (300+ questions)
│   ├── seed-ai.js             # AI/ML seed (80+ topics with YouTube)
│   ├── models/
│   │   ├── Question.js        # Extended schema (track, phase, tag, youtubeResources)
│   │   └── UserProgress.js    # User + Progress schemas
│   └── routes/
│       ├── auth.js            # JWT auth
│       ├── questions.js       # Questions (supports ?track=dsa|ai)
│       └── progress.js        # Progress toggle + stats
└── frontend/
    ├── index.html             # Track switcher, phase tabs, AI hero
    ├── style.css              # Full dark theme (Space Grotesk + Unbounded)
    └── app.js                 # Dual-track state, phase filter, YouTube modal
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 2. Install
```bash
cd backend
npm install
```

### 3. Configure `.env`
```env
MONGODB_URI=mongodb://localhost:27017/dsa_tracker
PORT=5000
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5000
```

### 4. Seed the database
```bash
# Seed DSA questions (300+)
npm run seed

# Seed AI/ML roadmap (80+ topics with YouTube resources)
npm run seed:ai

# Or seed both at once
npm run seed:all
```

### 5. Start
```bash
npm start        # production
npm run dev      # development (nodemon)
```

Open http://localhost:5000 🎉

---

## 🧠 AI/ML Roadmap — 7 Phases

| Phase | Topics | Tag |
|-------|--------|-----|
| Phase 1: Foundations | Python, NumPy, Pandas, Math, EDA, SQL | `core` |
| Phase 2: Core ML | Regression, Trees, SVM, XGBoost, KNN, Clustering, PCA | `ml` |
| Phase 3: Deep Learning | Neural Nets, Backprop, PyTorch, TF, CNNs, Object Detection | `dl` |
| Phase 4: NLP & Transformers | BERT, GPT, Attention, HuggingFace, LoRA/QLoRA | `dl` |
| Phase 5: Generative AI | LLMs, RAG, Agents, LangChain, Diffusion, Multimodal | `genai` |
| Phase 6: MLOps | FastAPI, Docker, MLflow, LLMOps, AWS/GCP | `deploy` |
| Phase 7: Projects | 6 portfolio projects with guides | `project` |

Each topic includes:
- 💡 Key insight / hint
- 🎯 Practical approach to study it
- ⭐ Pro tip
- 📺 2–3 YouTube resources (CampusX, Krish Naik, StatQuest, 3Blue1Brown, Andrej Karpathy…)

---

## 📡 API

### Questions
```
GET  /api/questions/topics?track=dsa   → DSA topics grouped
GET  /api/questions/topics?track=ai    → AI/ML topics grouped by phase
GET  /api/questions?track=ai           → All AI questions
```

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Progress
```
GET    /api/progress
POST   /api/progress/toggle  { questionId }
DELETE /api/progress/reset
```

---

## 🌐 Deploy

### Railway (Recommended)
1. Push to GitHub
2. New project → Connect repo
3. Add MongoDB plugin OR set `MONGODB_URI` to Atlas
4. After deploy: `railway run npm run seed:all`

### Render
1. New Web Service → your repo
2. Build: `npm install`  Start: `node server.js`
3. Add env vars → Deploy
4. Open shell → `node seed.js && node seed-ai.js`

