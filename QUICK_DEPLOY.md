# ⚡ Quick Deploy (10 Minutes)

## **TL;DR - Follow These Steps Exactly**

### **1️⃣ Push to GitHub (1 min)**
```bash
git add .
git commit -m "Deploy: Vercel + Render"
git push origin main
```

### **2️⃣ Deploy Frontend to Vercel (3 min)**
1. Go to https://vercel.com/new
2. Login with GitHub
3. Select your repository
4. Click Import
5. Add environment variables:
   ```
   REACT_APP_API_URL = https://samadhan-backend.onrender.com
   REACT_APP_FIREBASE_API_KEY = AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
   REACT_APP_FIREBASE_AUTH_DOMAIN = samadhan-562bd.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID = samadhan-562bd
   REACT_APP_FIREBASE_STORAGE_BUCKET = samadhan-562bd.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 159400401099
   REACT_APP_FIREBASE_APP_ID = 1:159400401099:web:5d22e0dfb81d8fe2e1634e
   ```
6. Click "Deploy"
7. Wait 2-3 minutes
8. Copy your frontend URL (e.g., `samadhan-frontend.vercel.app`)

### **3️⃣ Deploy Backend to Render (5 min)**
1. Go to https://render.com/new-web-service
2. Login with GitHub
3. Select your repository
4. Fill in:
   - **Name:** `samadhan-backend`
   - **Runtime:** `Python 3.10`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker main:app`
5. Click "Create Web Service"
6. Add environment variables:
   ```
   MONGODB_URL = [your-mongodb-connection-string]
   FIREBASE_CREDENTIALS_PATH = /etc/secrets/firebase-credentials.json
   CORS_ORIGINS = https://[your-vercel-url].vercel.app
   PORT = 8000
   ```
7. Add Secret File:
   - Click "Environment" → "Secret Files"
   - **Filename:** `/etc/secrets/firebase-credentials.json`
   - **Contents:** Paste entire contents of `backend/firebase-credentials.json`
8. Wait 5-10 minutes
9. Copy your backend URL (e.g., `samadhan-backend.onrender.com`)

### **4️⃣ Test (1 min)**
- Visit your Vercel frontend URL
- Open DevTools (F12)
- Try to sign up
- Create a ticket
- Check if it works!

---

## **Environment Variables Needed**

### **Vercel (Frontend)**
```
REACT_APP_API_URL=https://samadhan-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
REACT_APP_FIREBASE_AUTH_DOMAIN=samadhan-562bd.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=samadhan-562bd
REACT_APP_FIREBASE_STORAGE_BUCKET=samadhan-562bd.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=159400401099
REACT_APP_FIREBASE_APP_ID=1:159400401099:web:5d22e0dfb81d8fe2e1634e
```

### **Render (Backend)**
```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/database
FIREBASE_CREDENTIALS_PATH=/etc/secrets/firebase-credentials.json
CORS_ORIGINS=https://samadhan-frontend.vercel.app
PORT=8000
```

---

## **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Backend not connecting | Wait 30 sec (Render cold start), check CORS_ORIGINS |
| Build fails | Check Render logs for errors, verify Python version |
| Firebase error | Verify credentials file in Secret Files, check path |
| Slow first request | Normal for free Render tier (spins up from sleep) |
| CORS error | Update CORS_ORIGINS in Render to match Vercel URL |

---

## **Get Your URLs**

After both deploy:

**Frontend:** `https://samadhan-frontend.vercel.app`  
**Backend:** `https://samadhan-backend.onrender.com`  
**Health Check:** `https://samadhan-backend.onrender.com/health`

---

## **Costs**
- Vercel: **Free** (unlimited deployments)
- Render: **Free** (750 hours/month, spins down after 15 min)
- Total: **$0** (Free tier works great for learning!)

---

## **Next: Upgrade to Production (Optional)**
- Upgrade Render to Paid: $7/month (always-on)
- Upgrade Vercel if needed: $20/month (more bandwidth)

---

**Status:** 🚀 Ready to deploy!

Need help? Check the detailed guide in `DEPLOYMENT_STEPS.md`
