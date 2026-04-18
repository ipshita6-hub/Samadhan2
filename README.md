# Samadhan - Student Support System

A modern customer support ticketing application built with React, FastAPI, MongoDB, and Firebase.

## Project Structure

```
├── frontend/          # React + Tailwind CSS frontend
├── backend/           # FastAPI backend
└── README.md
```

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS, Firebase Auth
- **Backend**: FastAPI, MongoDB, Firebase Admin SDK
- **Database**: MongoDB
- **Authentication**: Firebase

## Setup Instructions

### Prerequisites

- Node.js 16+
- Python 3.9+
- MongoDB running locally or connection string
- Firebase project setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Download Firebase credentials JSON and place in backend directory

6. Initialize Firebase Admin SDK in `main.py`:
```python
import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
```

7. Run backend:
```bash
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Add your Firebase credentials to `.env`

5. Run frontend:
```bash
npm start
```

Frontend runs on `http://localhost:3000`

## Features

### Current
- User authentication (Login/Signup)
- Role-based access (Student/Admin)
- Protected routes

### Coming Soon
- Student Dashboard
- Admin Dashboard
- Ticket creation and management
- AI-powered ticket categorization
- Real-time status updates
- Ticket filtering and search

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### Tickets
- `POST /api/tickets/` - Create ticket
- `GET /api/tickets/` - Get user's tickets
- `GET /api/tickets/{id}` - Get ticket details
- `PATCH /api/tickets/{id}` - Update ticket (admin only)

## Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

## Development

- Frontend uses Tailwind CSS for styling with a custom primary color palette
- Backend uses FastAPI with MongoDB for data persistence
- Firebase handles authentication across both frontend and backend
