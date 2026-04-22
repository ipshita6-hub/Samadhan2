# ⚡ Quick Deployment Guide

**5-Minute Setup for Production Deployment**

---

## 🎯 Prerequisites

- [ ] MongoDB Atlas account (free tier)
- [ ] Vercel account (free tier)
- [ ] Render/Railway account (free tier)
- [ ] Firebase project (already configured)

---

## 📦 Step 1: Database (MongoDB Atlas)

**Time: 2 minutes**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster → Choose AWS/GCP → Select region
3. Create database user (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)
5. Connect → Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/support_tickets
   ```

---

## 🔧 Step 2: Backend (Render/Railway)

**Time: 3 minutes**

### Option A: Render
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3

4. Add Environment Variables:
   ```
   MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/support_tickets
   DATABASE_NAME=support_tickets
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   CORS_ORIGINS=https://your-app.vercel.app
   ```

5. Upload `firebase-credentials.json` via Render dashboard

### Option B: Railway
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Select your repo → Add variables (same as above)
3. Railway auto-detects Python and deploys

**Copy your backend URL:** `https://your-app.onrender.com` or `https://your-app.railway.app`

---

## 🎨 Step 3: Frontend (Vercel)

**Time: 2 minutes**

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_FIREBASE_API_KEY=AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
   REACT_APP_FIREBASE_AUTH_DOMAIN=samadhan-562bd.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=samadhan-562bd
   REACT_APP_FIREBASE_STORAGE_BUCKET=samadhan-562bd.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=159400401099
   REACT_APP_FIREBASE_APP_ID=1:159400401099:web:5d22e0dfb81d8fe2e1634e
   ```

5. Deploy!

**Your app is live:** `https://your-app.vercel.app`

---

## 🔄 Step 4: Update CORS

**Time: 1 minute**

1. Go back to your backend (Render/Railway)
2. Update `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
3. Redeploy backend

---

## ✅ Step 5: Test

**Time: 2 minutes**

1. Visit your Vercel URL
2. Sign up with a new account
3. Create a test ticket
4. Check if everything works:
   - [ ] Login/Signup
   - [ ] Create ticket
   - [ ] View tickets
   - [ ] Real-time updates
   - [ ] File uploads
   - [ ] Notifications

---

## 🎉 Done!

Your app is now live and accessible to anyone!

### URLs to Share:
- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-backend.onrender.com`
- **API Docs:** `https://your-backend.onrender.com/docs`

---

## 🔧 Optional: Email Notifications

Add these to backend environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Samadhan Support <your-email@gmail.com>
```

**Gmail App Password:** https://support.google.com/accounts/answer/185833

---

## 📊 Optional: Database Indexes

Connect to MongoDB Atlas and run:

```javascript
use support_tickets

db.tickets.createIndex({ user_id: 1, status: 1 })
db.tickets.createIndex({ created_at: -1 })
db.tickets.createIndex({ status: 1, created_at: -1 })
db.comments.createIndex({ ticket_id: 1, created_at: 1 })
db.notifications.createIndex({ user_id: 1, read: 1, created_at: -1 })
db.users.createIndex({ uid: 1 }, { unique: true })
db.users.createIndex({ email: 1 })
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` in Vercel
- Check `CORS_ORIGINS` in backend
- Redeploy both if needed

### Backend crashes on startup
- Check MongoDB connection string
- Verify `firebase-credentials.json` is uploaded
- Check logs in Render/Railway dashboard

### WebSocket not working
- Ensure your hosting platform supports WebSockets
- Render and Railway both support WebSockets by default

### Email not sending
- Verify SMTP credentials
- Use Gmail App Password (not regular password)
- Check spam folder

---

## 📱 Mobile Testing

Your app is responsive! Test on:
- [ ] iPhone/Android
- [ ] Tablet
- [ ] Desktop

---

## 🎓 Project Info

**Student:** Ipshita Baral  
**Roll No:** 240410700118  
**Project:** Samadhan - AI-Powered Student Support System

---

## 🚀 What's Next?

1. **Custom Domain** (Optional)
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel: Settings → Domains

2. **Monitoring**
   - Set up UptimeRobot for uptime monitoring
   - Add Sentry for error tracking

3. **Analytics**
   - Add Google Analytics
   - Monitor user behavior

4. **Backup**
   - Enable MongoDB Atlas automated backups
   - Export data regularly

---

**Total Deployment Time: ~10 minutes** ⚡

**Status: ✅ PRODUCTION READY**
