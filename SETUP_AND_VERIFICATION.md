# Setup and Verification Guide

## System Overview

This is a support ticketing system with:
- **Frontend**: React with Tailwind CSS and Lucide icons
- **Backend**: FastAPI with MongoDB and Firebase authentication
- **Authentication**: Firebase with role-based access (Student/Admin)

---

## Prerequisites

### Required Software
- Node.js (v16+) and npm
- Python 3.8+
- MongoDB (running locally on port 27017)
- Firebase project with credentials

### Demo Credentials
- **Student**: `student@university.edu`
- **Admin**: `admin@university.edu`

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://localhost:3000
```

### 3. Add Firebase Credentials
- Download your Firebase service account key from Firebase Console
- Save it as `backend/firebase-credentials.json`

### 4. Start Backend
```bash
cd backend
python main.py
```

Expected output:
```
✓ Firebase initialized with credentials from firebase-credentials.json
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Verify `.env` file
The file `frontend/.env` should already contain Firebase config:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
REACT_APP_FIREBASE_AUTH_DOMAIN=samadhan-562bd.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=samadhan-562bd
REACT_APP_FIREBASE_STORAGE_BUCKET=samadhan-562bd.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=159400401099
REACT_APP_FIREBASE_APP_ID=1:159400401099:web:5d22e0dfb81d8fe2e1634e
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

---

## Verification Checklist

### Backend Health Check
```bash
curl http://localhost:8000/health
```
Expected response: `{"status":"ok"}`

### MongoDB Connection
Verify MongoDB is running:
```bash
mongosh
```

### Firebase Authentication
1. Go to Firebase Console
2. Verify your project is selected
3. Check Authentication > Users section

---

## Testing the Application

### Test 1: Student Login and Dashboard
1. Go to `http://localhost:3000/login`
2. Click "Sign up" to create account
3. Enter: `student@university.edu` and password
4. Select "Student" role
5. Should redirect to `/dashboard`
6. Verify you see: Open, In Progress, Resolved, Closed ticket cards

### Test 2: Create a Ticket
1. From student dashboard, click "Create Ticket"
2. Fill in:
   - Title: "Test ticket"
   - Description: "This is a test"
   - Course: Select any course
   - Category: "Technical Support"
3. Click "Create Ticket"
4. Should see success message

### Test 3: Admin Login
1. Go to `http://localhost:3000/login`
2. Click "Sign up"
3. Enter: `admin@university.edu` and password
4. Select "Admin" role
5. Should redirect to `/admin/dashboard`
6. Verify you see admin navigation and all admin pages

### Test 4: Admin Ticket Details Page
1. From admin dashboard, click on any ticket
2. Should see `/admin/ticket/:ticketId` page
3. Verify all sections load:
   - Ticket title and description
   - Student information
   - Conversation history
   - Reply form

### Test 5: Admin Ticket Details - Button Functionality

#### Status Update Button
1. Click the "Status" dropdown
2. Select a different status (e.g., "Resolved")
3. Click "Update Status"
4. Should see: "Status updated successfully!"
5. Button should show loading state while processing

#### Assign Button
1. Click the "Admin" dropdown in "Assign To" section
2. Select a different admin
3. Click "Assign"
4. Should see: "Assignment updated successfully!"

#### Send Reply Button
1. Type a message in the reply textarea
2. Click "Send Reply"
3. Should see: "Reply sent successfully!"
4. Textarea should clear after sending

#### Quick Action Buttons
1. **Mark as Resolved**: Click button → "Ticket marked as resolved!"
2. **Send Email to Student**: Click button → "Email sent to student successfully!"
3. **Close Ticket**: Click button → "Ticket closed successfully!"

All buttons should:
- Show loading state while processing
- Display success message
- Be disabled while processing

---

## Troubleshooting

### Issue: "Backend unavailable" message
**Solution**: 
- Verify backend is running on port 8000
- Check MongoDB is running
- Check CORS_ORIGINS in backend/.env includes `http://localhost:3000`

### Issue: Firebase authentication fails
**Solution**:
- Verify firebase-credentials.json exists in backend folder
- Check Firebase project ID matches in frontend/.env
- Verify Firebase Authentication is enabled in Firebase Console

### Issue: Admin role not working
**Solution**:
- Email must contain "admin" (e.g., admin@university.edu)
- Clear browser localStorage: Open DevTools → Application → Storage → Clear All
- Log out and log back in

### Issue: Buttons not responding
**Solution**:
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Verify all handlers are properly defined in AdminTicketDetails.jsx

### Issue: MongoDB connection error
**Solution**:
- Verify MongoDB is running: `mongosh`
- Check MONGODB_URL in backend/.env
- Default should be: `mongodb://localhost:27017`

---

## File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx (Student dashboard)
│   │   ├── MyTickets.jsx (Student tickets list)
│   │   ├── CreateTicket.jsx (Create ticket form)
│   │   ├── TicketDetails.jsx (Student ticket view)
│   │   ├── AdminDashboard.jsx (Admin dashboard)
│   │   ├── AdminTickets.jsx (Admin tickets list)
│   │   ├── AdminTicketDetails.jsx (Admin ticket view) ✓ FIXED
│   │   ├── AdminAnalytics.jsx (Admin analytics)
│   │   ├── AdminSettings.jsx (Admin settings)
│   │   ├── Login.jsx (Login page)
│   │   └── Signup.jsx (Signup page)
│   ├── components/
│   │   ├── AdminNav.jsx (Admin navigation)
│   │   ├── ProtectedRoute.jsx (Role-based routing)
│   │   └── CreateTicketModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx (Authentication context)
│   └── App.jsx (Routes configuration)

backend/
├── routes/
│   ├── auth.py (Authentication endpoints)
│   └── tickets.py (Ticket endpoints)
├── main.py (FastAPI app)
├── database.py (MongoDB connection)
├── models.py (Pydantic models)
├── config.py (Configuration)
└── requirements.txt (Dependencies)
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### Tickets
- `GET /api/tickets/` - Get all tickets (admin) or user's tickets (student)
- `GET /api/tickets/{ticket_id}` - Get ticket details
- `POST /api/tickets/` - Create new ticket
- `PATCH /api/tickets/{ticket_id}` - Update ticket (admin only)

---

## Recent Changes

### AdminTicketDetails.jsx - FIXED ✓
Added missing button handlers:
- `handleMarkResolved()` - Marks ticket as resolved
- `handleSendEmail()` - Sends email to student
- `handleCloseTicket()` - Closes the ticket

All quick action buttons now:
- Have proper click handlers
- Show loading states
- Display success messages
- Are properly disabled while processing

---

## Next Steps

1. ✓ Verify backend is running
2. ✓ Verify MongoDB is running
3. ✓ Verify Firebase credentials are set up
4. ✓ Test student login and dashboard
5. ✓ Test admin login and dashboard
6. ✓ Test admin ticket details page
7. ✓ Test all button functionality
8. Ready for production deployment

---

## Support

If you encounter any issues:
1. Check the browser console (F12) for JavaScript errors
2. Check the backend terminal for Python errors
3. Verify all services are running (Backend, MongoDB, Frontend)
4. Check the troubleshooting section above
