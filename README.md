# ⚡ DSA Master Tracker — Full Stack

**300+ DSA questions · MongoDB · JWT Auth · Progress sync across devices**

---

## 🗂️ Project Structure

```
dsa-fullstack/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── seed.js            # Seed 300+ questions to MongoDB
│   ├── package.json
│   ├── .env.example       # Copy to .env and fill in values
│   ├── models/
│   │   ├── Question.js    # Question schema (title, hint, approach, etc.)
│   │   └── UserProgress.js # User + Progress schemas
│   ├── routes/
│   │   ├── auth.js        # /api/auth/* (register, login, me)
│   │   ├── questions.js   # /api/questions/* (CRUD + grouped by topic)
│   │   └── progress.js    # /api/progress/* (toggle, stats, reset)
│   └── middleware/
│       └── auth.js        # JWT verification middleware
└── frontend/
    ├── index.html         # Main HTML
    ├── style.css          # Dark theme styles
    └── app.js             # API-integrated JavaScript
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas) cloud)

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/dsa_tracker

# OR MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dsa_tracker

PORT=5000
JWT_SECRET=your_random_secret_key_here_make_it_long
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5000
```

### 4. Seed the Database (300+ Questions)

```bash
npm run seed
```

Output:
```
✅  MongoDB connected
🗑️   Cleared existing questions
✅  Inserted 300 questions
   arrays          → 25 questions (E:6 M:14 H:5)
   strings         → 20 questions (E:6 M:11 H:3)
   linkedlists     → 18 questions ...
   ...
📊  Total: 300 questions across 13 topics
```

### 5. Start the Server

```bash
npm start           # Production
npm run dev         # Development (with nodemon auto-reload)
```

Open **http://localhost:5000** 🎉

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT token |
| GET  | `/api/auth/me` | Get current user (auth required) |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/questions/topics` | All questions grouped by topic |
| GET  | `/api/questions?difficulty=Easy&topic=arrays` | Filtered list |
| GET  | `/api/questions/:id` | Single question |

### Progress (all require JWT auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/progress` | Your progress map |
| GET    | `/api/progress/stats` | Detailed stats |
| POST   | `/api/progress/toggle` | Mark/unmark a question `{ questionId }` |
| DELETE | `/api/progress/reset` | Reset all your progress |

---

## 🌐 Deploy to Production

### Option A: Railway (Recommended — Free)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → GitHub repo
3. Add MongoDB plugin OR set `MONGODB_URI` to Atlas connection string
4. Set environment variables in Railway dashboard
5. Deploy! Railway auto-detects Node.js

### Option B: Render

1. Push to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables
6. Create a free PostgreSQL → use MongoDB Atlas instead

### Option C: Heroku

```bash
heroku create dsa-tracker-yourname
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your_secret"
heroku config:set NODE_ENV=production
git push heroku main
heroku run npm run seed
```

### Option D: VPS (DigitalOcean, Linode, etc.)

```bash
# On server
git clone your-repo
cd backend && npm install
cp .env.example .env   # fill in values
npm run seed
pm2 start server.js --name dsa-tracker
pm2 save && pm2 startup
```

---

## 🗄️ MongoDB Atlas Setup (Free Cloud DB)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster (M0 — 512MB, free forever)
3. Create database user (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all) or your server IP
5. Connect → Drivers → Copy connection string
6. Replace `<password>` in the string and set as `MONGODB_URI`

---

## 📊 Topics & Question Count

| Topic | Questions | Easy | Medium | Hard |
|-------|-----------|------|--------|------|
| 📊 Arrays | 25 | 6 | 14 | 5 |
| 🔤 Strings | 20 | 6 | 11 | 3 |
| 🔗 Linked Lists | 18 | 6 | 10 | 2 |
| 🔍 Binary Search | 15 | 3 | 9 | 3 |
| ⚡ Dynamic Programming | 25 | 2 | 18 | 5 |
| 🕸️ Graphs | 18 | 3 | 11 | 4 |
| 🌳 Trees & BST | 20 | 6 | 12 | 2 |
| 📚 Stacks & Queues | 15 | 4 | 9 | 2 |
| ⛰️ Heaps | 12 | 0 | 9 | 3 |
| 🔄 Backtracking | 12 | 0 | 9 | 3 |
| 💡 Greedy | 12 | 4 | 7 | 1 |
| ⚙️ Bit Manipulation | 10 | 5 | 4 | 1 |
| 🌲 Trie | 8 | 1 | 5 | 2 |
| **Total** | **210+** | | | |

---

## ✨ Features

- 🔐 **JWT Authentication** — register/login, progress synced per user
- 🗄️ **MongoDB** — questions and progress stored in database  
- ✅ **Mark/Unmark** — toggle questions solved with optimistic UI updates
- 🔍 **Filter** — by difficulty, status (solved/unsolved), or search
- 💡 **Hints & Approach** — modal with hint, approach, time/space complexity
- 📊 **Progress Ring** — circular progress indicator in sidebar
- 🔥 **Streak Tracking** — daily solving streak
- 📱 **Responsive** — works on mobile
- ⚡ **Fast** — optimistic updates, no reload needed

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Mongoose, JWT, bcrypt
- **Database**: MongoDB (local or Atlas)
- **Frontend**: Vanilla JS, HTML, CSS (no frameworks)
- **Fonts**: JetBrains Mono + Syne (Google Fonts)
