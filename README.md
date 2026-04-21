# Samadhan — AI-Powered Student Support Management System

A full-stack EdTech support ticketing platform built with React, FastAPI, MongoDB, and Firebase.

**Student:** Ipshita Baral | Roll No: 240410700118 | Year & Section: 2024-4A

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TailwindCSS, React Router v6 |
| Backend | FastAPI (Python), MongoDB, PyMongo |
| Auth | Firebase Authentication (Email + Google OAuth) |
| AI Module | Rule-based NLP (sentiment analysis + auto-categorization) |
| Real-time | WebSockets (FastAPI) |
| Email | SMTP (configurable — Gmail / any provider) |
| Deployment | Vercel (frontend), Render/Railway (backend), MongoDB Atlas |

---

## Features

### Student
- Register / Login (Email + Google OAuth)
- Create support tickets with title, description, category, priority, course
- **AI sentiment analysis** shown live while typing
- **FAQ suggestions** — knowledge base searched as you type, may resolve issue without a ticket
- File attachments (PNG, JPG, PDF, DOCX — up to 10MB)
- Track ticket status: Open → In Progress → Resolved → Closed
- Reply to tickets, close or reopen tickets
- Emoji reactions on comments
- Real-time updates via WebSocket (live indicator)
- In-app notification bell with unread count
- Email notifications on ticket creation, status changes, and admin replies

### Admin
- Admin dashboard with stats (total, open, resolution rate, avg resolution time)
- Full ticket list with filters: Status, Priority, Category + search + pagination
- Ticket detail view: update status, assign to agent, reply, internal notes
- Quick actions: Mark Resolved / In Progress / Closed
- Analytics page: status breakdown, category breakdown, priority breakdown, resolution time distribution
- Most active students leaderboard
- SLA tracking: warning (20h) and breach (48h) alerts via in-app notifications + email
- Settings: site config, email toggle, SLA thresholds, admin user list

### AI Module
- **Auto-categorization**: keyword/NLP matching → Technical Support / Academic / Financial / Administrative
- **Sentiment-driven priority**: negative + urgent signals → escalates priority automatically
- **FAQ suggestions**: 14 pre-built FAQs matched by keyword scoring before ticket submission

### SLA Tracking
- Background thread checks every 5 minutes
- Warning alert at 20h (configurable in Settings)
- Breach alert at 48h (configurable in Settings)
- In-app + email alerts to all admins
- Thresholds configurable live from Admin Settings — no restart needed

---

## Project Structure

```
├── frontend/                  # React app
│   └── src/
│       ├── pages/             # Login, Signup, Dashboard, CreateTicket,
│       │                      # TicketDetails, MyTickets, AdminDashboard,
│       │                      # AdminTickets, AdminTicketDetails,
│       │                      # AdminAnalytics, AdminSettings
│       ├── components/        # AdminNav, NotificationBell, ProtectedRoute,
│       │                      # ThemeToggle, CreateTicketModal
│       ├── context/           # AuthContext, ThemeContext
│       └── api.js             # All API calls (ticketsApi, notificationsApi,
│                              # settingsApi, faqApi)
│
└── backend/                   # FastAPI app
    ├── main.py                # App entry point, CORS, startup
    ├── models.py              # Pydantic models
    ├── database.py            # MongoDB connection
    ├── config.py              # Settings via pydantic-settings
    ├── seed.py                # Demo data seeder
    ├── routes/
    │   ├── auth.py            # Register, /me
    │   ├── tickets.py         # Full ticket CRUD, comments, attachments,
    │   │                      # notifications, reactions, stats
    │   ├── faq.py             # FAQ search endpoint
    │   ├── settings.py        # Admin settings CRUD
    │   └── websocket.py       # WebSocket connection manager
    └── services/
        ├── ai_service.py      # Sentiment analysis + auto-categorization
        ├── email_service.py   # SMTP email (ticket created, status update, reply)
        ├── faq_service.py     # FAQ knowledge base + keyword search
        └── sla_service.py     # Background SLA monitor thread
```

---

## Setup

### Prerequisites
- Node.js 16+
- Python 3.9+
- MongoDB (local or Atlas)
- Firebase project

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
cp .env.example .env         # fill in your values
python main.py               # runs on http://localhost:8000
```

**Seed demo data:**
```bash
python seed.py
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # fill in Firebase config
npm start                    # runs on http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://localhost:3000

# Email (optional — leave blank to disable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Samadhan Support <your@gmail.com>

# SLA defaults (overridable in Admin Settings UI)
SLA_WARN_HOURS=20
SLA_BREACH_HOURS=48
SLA_CHECK_MINUTES=5
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/tickets/` | Create ticket (AI analysis runs here) |
| GET | `/api/tickets/` | List tickets (student: own; admin: all) |
| GET | `/api/tickets/my/stats` | Student dashboard stats |
| GET | `/api/tickets/admin/stats` | Admin analytics stats |
| GET | `/api/tickets/{id}` | Get ticket + comments |
| PATCH | `/api/tickets/{id}` | Update ticket (admin) |
| PATCH | `/api/tickets/{id}/close` | Student closes own ticket |
| PATCH | `/api/tickets/{id}/reopen` | Student reopens ticket |
| POST | `/api/tickets/{id}/comments` | Add comment / reply |
| POST | `/api/tickets/{id}/comments/{cid}/react` | Emoji reaction |
| POST | `/api/tickets/{id}/attachments` | Upload files |
| DELETE | `/api/tickets/{id}/attachments/{fid}` | Delete attachment |
| GET | `/api/tickets/notifications/all` | Get notifications |
| PATCH | `/api/tickets/notifications/read` | Mark read |
| PATCH | `/api/tickets/notifications/read-all` | Mark all read |
| GET | `/api/faq/search?q=...&category=...` | FAQ search (no auth) |
| GET | `/api/settings/` | Get settings (admin) |
| PATCH | `/api/settings/` | Update settings (admin) |
| GET | `/api/settings/admins` | List admin users |
| WS | `/ws/ticket/{id}?token=...` | Real-time ticket WebSocket |
| GET | `/health` | Health check |

---

## Deployment

**Frontend → Vercel**
```bash
cd frontend
npm run build
# deploy build/ to Vercel
```

**Backend → Render / Railway**
- Set all env vars in the platform dashboard
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- MongoDB: use MongoDB Atlas connection string

---

## Success Metrics (PRD §9.2)

| Metric | Status |
|---|---|
| Fully functional ticket lifecycle | ✅ |
| ≥ 80% logical AI categorization accuracy | ✅ Rule-based NLP |
| Zero data loss after refresh | ✅ MongoDB persistent |
| Secure role-based access control | ✅ Firebase + backend role check |
| Seamless end-to-end workflow | ✅ |
| Analytics dashboard with resolution time | ✅ |
| Email notifications | ✅ SMTP service |
| FAQ suggestions before submission | ✅ |
| SLA tracking with alerts | ✅ Background thread |
| File attachments | ✅ |
