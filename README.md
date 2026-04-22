# 🎓 University Ticketing System

**Best Open Source University Ticketing System**

A modern, AI-powered support ticketing platform built for universities and educational institutions. Free, self-hosted, and feature-rich with real-time updates, advanced analytics, and intelligent automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)

---

## ✨ Why Choose This System?

- 🤖 **AI-Powered**: Auto-categorization, sentiment analysis, and duplicate detection
- ⚡ **Real-time**: WebSocket integration for instant updates
- 📊 **Analytics**: Comprehensive dashboards with heatmaps and insights
- 🎨 **Modern UI**: Beautiful dark mode, responsive design, rich text editing
- 🔒 **Secure**: Firebase authentication, role-based access control
- 📧 **Notifications**: Email alerts and in-app notifications
- 🚀 **Production Ready**: Scalable, tested, and documented

---

## 🖼️ Screenshots

### Student Portal
- Clean dashboard with ticket statistics
- Easy ticket creation with AI assistance
- Real-time status tracking

### Admin Dashboard
- Comprehensive analytics and metrics
- Bulk actions for efficiency
- Advanced filtering and search

---

## 🛠️ Tech Stack

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

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- MongoDB (local or Atlas)
- Firebase project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/university-ticketing-system.git
cd university-ticketing-system
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Backend

```bash
cp .env.example .env
# Edit .env with your MongoDB and Firebase credentials
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase configuration
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
# Runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### 6. Seed Demo Data (Optional)

```bash
cd backend
python seed.py
```

**Demo Accounts:**
- **Admin**: admin@university.edu / admin123
- **Student**: student@university.edu / student123

---

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Detailed setup instructions
- **[Features Overview](FEATURES_OVERVIEW.md)** - Complete feature list
- **[Deployment Guide](DEPLOYMENT_CHECKLIST.md)** - Production deployment
- **[API Documentation](API_DOCS.md)** - API endpoints reference

---

## 🎯 Key Features

### For Students
- 📝 Create and track support tickets
- 🤖 AI-powered sentiment analysis while typing
- 💡 Smart FAQ suggestions to resolve issues instantly
- 📎 File attachments (images, PDFs, documents)
- 💬 Real-time comments and updates
- 😊 Emoji reactions on responses
- ⭐ Rate support experience
- 🔔 In-app and email notifications
- 🌓 Dark mode support

### For Administrators
- 📊 Comprehensive analytics dashboard
- 📈 Heatmap visualizations (by hour and day)
- 🎯 Bulk actions (resolve, close, delete multiple tickets)
- 📝 Rich text editor for responses
- 📌 Internal notes (admin-only)
- 👥 Ticket assignment to agents
- ⚡ Quick status updates
- 🔍 Advanced search and filtering
- 📧 SLA tracking with alerts
- ⚙️ Configurable settings

### AI & Automation
- 🤖 **Auto-categorization**: Automatically categorizes tickets based on content
- 🔍 **Duplicate Detection**: Finds similar existing tickets to prevent duplicates
- 💭 **Sentiment Analysis**: Analyzes ticket sentiment and adjusts priority
- 📚 **FAQ Suggestions**: Suggests relevant FAQs before ticket submission
- ⏱️ **Response Time Estimation**: Shows expected response time

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │  FastAPI Backend│
│  (Port 3000)    │  REST   │  (Port 8000)    │
└─────────────────┘  WebSocket└─────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
              │  MongoDB  │    │  Firebase │    │   SMTP    │
              │  Database │    │    Auth   │    │   Email   │
              └───────────┘    └───────────┘    └───────────┘
```

---

## 📁 Project Structure

```
university-ticketing-system/
├── backend/                    # FastAPI backend
│   ├── main.py                # Application entry point
│   ├── models.py              # Pydantic models
│   ├── database.py            # MongoDB connection
│   ├── config.py              # Configuration
│   ├── routes/                # API routes
│   │   ├── auth.py           # Authentication
│   │   ├── tickets.py        # Ticket management
│   │   ├── faq.py            # FAQ search
│   │   └── settings.py       # Admin settings
│   ├── services/              # Business logic
│   │   ├── ai_service.py     # AI features
│   │   ├── email_service.py  # Email notifications
│   │   ├── faq_service.py    # FAQ knowledge base
│   │   └── sla_service.py    # SLA tracking
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context
│   │   ├── api.js            # API client
│   │   └── firebase.js       # Firebase config
│   └── package.json          # Node dependencies
│
└── docs/                      # Documentation
    ├── QUICK_START.md
    ├── FEATURES_OVERVIEW.md
    └── DEPLOYMENT_CHECKLIST.md
```

---

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

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

### Frontend Environment Variables (`frontend/.env`)

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

## 🧪 Testing

### Manual Testing
```bash
# Backend tests
cd backend
python test_endpoints.py

# Check API health
curl http://localhost:8000/health
```

### Test User Accounts
After running `python seed.py`:
- **Admin**: admin@university.edu / admin123
- **Student**: student@university.edu / student123

---

## 🚀 Deployment

### Recommended Stack
- **Frontend**: Vercel / Netlify (free tier available)
- **Backend**: Railway / Render / Heroku
- **Database**: MongoDB Atlas (free tier available)
- **Storage**: AWS S3 / Cloudinary (optional)

### Quick Deploy

**Frontend (Vercel):**
```bash
cd frontend
npm run build
vercel deploy
```

**Backend (Railway):**
```bash
# Connect your GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically on push
```

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed instructions.

---

## 📊 API Endpoints

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **React** - UI library
- **MongoDB** - NoSQL database
- **Firebase** - Authentication service
- **Tailwind CSS** - Utility-first CSS framework
- **React Quill** - Rich text editor
- **Recharts** - Chart library

---

## 📞 Support

- 📧 Email: support@yourdomain.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/university-ticketing-system/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/university-ticketing-system/wiki)

---

## 🗺️ Roadmap

### Phase 2
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile app (React Native)
- [ ] Advanced search with Elasticsearch
- [ ] Ticket templates
- [ ] Knowledge base articles
- [ ] AI chatbot

### Phase 3
- [ ] Multi-language support
- [ ] Predictive analytics
- [ ] Integration hub (Slack, Teams, Discord)
- [ ] API documentation (Swagger)
- [ ] Automated testing suite
- [ ] CI/CD pipeline

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/university-ticketing-system?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/university-ticketing-system?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/university-ticketing-system)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/university-ticketing-system)

---

**Made with ❤️ for universities and educational institutions worldwide**

---

## 🎓 Perfect For

- 🏫 Universities and colleges
- 🎒 K-12 schools
- 📚 Online learning platforms
- 🎯 Training institutes
- 🏢 Educational departments

---

**Ready to revolutionize your university's support system? Get started now!** 🚀


