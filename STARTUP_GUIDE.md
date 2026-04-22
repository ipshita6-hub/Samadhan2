# 🚀 Startup Guide - Samadhan Ticketing System

## Quick Start (Fresh Session)

### 1. Start Backend
```bash
cd backend
python main.py
```
**Expected Output**:
```
✓ Firebase initialized with credentials from ./firebase-credentials.json
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 2. Start Frontend
```bash
cd frontend
npm start
```
**Expected Output**:
```
Compiled successfully!
You can now view the app in the browser.
Local:            http://localhost:3000
```

### 3. Access the Application
Open your browser and go to: **http://localhost:3000**

You should see the **Login Page** first! ✅

---

## 🔐 Test Accounts

### Admin Account
- **Email**: `admin@university.edu`
- **Password**: `admin123`
- **Access**: Admin Dashboard, All Tickets, Analytics, Settings

### Student Account
- **Email**: `student@university.edu`
- **Password**: `student123`
- **Access**: Student Dashboard, My Tickets, Create Ticket

---

## ✅ What's Running

### Backend (Port 8000)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Database**: PostgreSQL (configured in backend/.env)

### Frontend (Port 3000)
- **URL**: http://localhost:3000
- **Default Route**: `/login` (Login page)
- **API Connection**: http://localhost:8000

---

## 🎯 User Flow

### First Visit
1. User visits `http://localhost:3000/`
2. **Redirected to Login page** ✅
3. User can choose to Login or Sign Up

### After Login (Student)
1. Login with student credentials
2. Redirected to **Student Dashboard**
3. Can create tickets, view tickets, track status

### After Login (Admin)
1. Login with admin credentials
2. Redirected to **Admin Dashboard**
3. Can manage tickets, view analytics, bulk actions

---

## 🧪 Testing the 7 Advanced Features

### 1. Auto-categorization
- Go to Create Ticket
- Type: "My laptop won't turn on"
- **Expected**: Category auto-selects "Technical Support"

### 2. Duplicate Detection
- Create ticket: "Login issues"
- Create another: "Can't login"
- **Expected**: See similar tickets warning

### 3. Heatmap
- Login as admin
- Go to Analytics
- **Expected**: See bar charts for tickets by hour/day

### 4. Satisfaction Rating
- Create ticket as student
- Admin marks as resolved
- Refresh student ticket page
- **Expected**: Modal with emoji ratings appears

### 5. Estimated Response Time
- Go to Create Ticket page
- **Expected**: See teal banner with avg response time

### 6. Rich Text Editor
- Open any ticket
- Type reply with formatting
- **Expected**: Toolbar with bold, italic, lists, etc.

### 7. Bulk Actions
- Login as admin
- Go to All Tickets
- Select multiple tickets
- **Expected**: Bottom bar with Resolve/Close/Delete

---

## 🔧 Troubleshooting

### "Failed to fetch" Error
**Problem**: Frontend can't connect to backend

**Solution**:
1. Check if backend is running on port 8000
2. Verify `frontend/.env` has `REACT_APP_API_URL=http://localhost:8000`
3. Restart frontend after changing .env

### Backend Won't Start
**Problem**: Port 8000 already in use

**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Then restart
cd backend
python main.py
```

### Frontend Shows Blank Page
**Problem**: JavaScript errors or build issues

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database Connection Error
**Problem**: PostgreSQL not running or wrong credentials

**Solution**:
1. Check if PostgreSQL is running
2. Verify `backend/.env` has correct `DATABASE_URL`
3. Create database if needed:
   ```bash
   psql -U postgres
   CREATE DATABASE ticketing_db;
   ```

---

## 📊 Current Status

### Backend ✅
- **Status**: Running on port 8000
- **Process ID**: Check with `netstat -ano | findstr :8000`
- **Logs**: Check terminal output

### Frontend ✅
- **Status**: Should be running on port 3000
- **Default Route**: `/login` (Login page first)
- **API Connection**: Configured to http://localhost:8000

### Features ✅
- All 7 advanced features implemented
- Dark mode working
- Real-time updates enabled
- Rich text editor integrated

---

## 🎉 Success Checklist

After starting the app, verify:
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Opening app shows **Login page** (not dashboard)
- [ ] Can sign up new account
- [ ] Can login with test accounts
- [ ] Student sees Student Dashboard after login
- [ ] Admin sees Admin Dashboard after login
- [ ] Can create tickets
- [ ] Can view tickets
- [ ] All 7 advanced features work

---

## 🔄 Restart Instructions

### Stop Everything
```bash
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal
```

### Start Fresh
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 📝 Important Notes

1. **Always start backend first**, then frontend
2. **Backend must be running** for frontend to work
3. **Restart frontend** after changing `.env` file
4. **Clear browser cache** if you see old data
5. **Check browser console** for JavaScript errors
6. **Check backend terminal** for API errors

---

## 🎯 Quick Commands

### Check if Backend is Running
```bash
curl http://localhost:8000/health
```

### Check if Frontend is Running
```bash
curl http://localhost:3000
```

### View Backend Logs
Check the terminal where you ran `python main.py`

### View Frontend Logs
Check the terminal where you ran `npm start`

---

## 🆘 Need Help?

1. Check this guide first
2. Review error messages in terminal
3. Check browser console (F12)
4. Verify all environment variables are set
5. Ensure all dependencies are installed

---

**Last Updated**: April 21, 2026  
**Version**: 2.0.0  
**Status**: ✅ Ready to Run

🎉 **Enjoy your Ticketing System!** 🎉
