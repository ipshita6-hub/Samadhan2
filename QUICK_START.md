# Quick Start Guide

## 🚀 Start Everything in 3 Steps

### Step 1: Start Backend
```bash
cd backend
python main.py
```
✓ Should see: `Uvicorn running on http://0.0.0.0:8000`

### Step 2: Start Frontend
```bash
cd frontend
npm start
```
✓ Should open: `http://localhost:3000`

### Step 3: Test the App

#### Login as Student
- Email: `student@university.edu`
- Password: Any password
- Role: Select "Student"
- ✓ Should see student dashboard

#### Login as Admin
- Email: `admin@university.edu`
- Password: Any password
- Role: Select "Admin"
- ✓ Should see admin dashboard

---

## ✅ What's Working

### Student Features
- ✓ Dashboard with ticket statistics
- ✓ Create new tickets
- ✓ View ticket details
- ✓ Search and filter tickets
- ✓ Pagination

### Admin Features
- ✓ Admin dashboard with metrics
- ✓ View all tickets
- ✓ Ticket details page with:
  - ✓ View ticket information
  - ✓ See conversation history
  - ✓ Send replies to students
  - ✓ Update ticket status
  - ✓ Assign tickets to admins
  - ✓ Quick actions (Mark Resolved, Send Email, Close Ticket)
- ✓ Analytics page
- ✓ Settings page

---

## 🧪 Test Admin Ticket Details Page

1. Login as admin
2. Go to Admin Dashboard
3. Click on any ticket
4. You should see the ticket details page

### Test Each Button:

**Status Update**
- Click dropdown → Select "Resolved"
- Click "Update Status"
- ✓ Should see: "Status updated successfully!"

**Assign**
- Click dropdown → Select different admin
- Click "Assign"
- ✓ Should see: "Assignment updated successfully!"

**Send Reply**
- Type message in textarea
- Click "Send Reply"
- ✓ Should see: "Reply sent successfully!"
- ✓ Textarea should clear

**Mark as Resolved**
- Click button
- ✓ Should see: "Ticket marked as resolved!"

**Send Email to Student**
- Click button
- ✓ Should see: "Email sent to student successfully!"

**Close Ticket**
- Click button
- ✓ Should see: "Ticket closed successfully!"

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# Kill the process or use different port
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules
cd frontend
npm install
npm start
```

### Can't login
- Check Firebase credentials in `backend/firebase-credentials.json`
- Check `frontend/.env` has correct Firebase config
- Clear browser cache and localStorage

### Admin role not working
- Email must contain "admin" (e.g., admin@university.edu)
- Clear localStorage: DevTools → Application → Storage → Clear All
- Log out and log back in

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/AdminTicketDetails.jsx` | Admin ticket view with all handlers |
| `frontend/src/App.jsx` | Route configuration |
| `frontend/src/context/AuthContext.jsx` | Authentication logic |
| `backend/routes/auth.py` | Auth endpoints |
| `backend/routes/tickets.py` | Ticket endpoints |

---

## 🎯 Next Steps

1. Test all features work
2. Connect to real database (if needed)
3. Add more admin features
4. Deploy to production

---

## 📞 Support

Check `SETUP_AND_VERIFICATION.md` for detailed troubleshooting.
