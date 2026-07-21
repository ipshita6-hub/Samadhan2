# 🚀 Quick Deployment Guide: Vercel + Render

## **Frontend Deployment (Vercel) - 5 minutes**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Connect to Vercel**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Click "Import"

### **Step 3: Configure Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:
```
REACT_APP_API_URL = https://samadhan-backend.onrender.com
REACT_APP_FIREBASE_API_KEY = AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
REACT_APP_FIREBASE_AUTH_DOMAIN = samadhan-562bd.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = samadhan-562bd
REACT_APP_FIREBASE_STORAGE_BUCKET = samadhan-562bd.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 159400401099
REACT_APP_FIREBASE_APP_ID = 1:159400401099:web:5d22e0dfb81d8fe2e1634e
```

### **Step 4: Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your app is live! ✅

---

## **Backend Deployment (Render) - 10 minutes**

### **Step 1: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub

### **Step 2: Create Web Service**
1. Click "New" → "Web Service"
2. Select your GitHub repository
3. Choose branch: `main`

### **Step 3: Configure Settings**
- **Name:** `samadhan-backend`
- **Runtime:** `Python 3.10`
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker main:app`
- **Environment:** `Production`
- **Plan:** `Free` (or paid if needed)

### **Step 4: Add Environment Variables**
Click "Environment" and add:
```
MONGODB_URL = mongodb+srv://username:password@cluster.mongodb.net/database
FIREBASE_CREDENTIALS_PATH = /etc/secrets/firebase-credentials.json
CORS_ORIGINS = https://samadhan-frontend.vercel.app
PORT = 8000
```

### **Step 5: Add Firebase Credentials Secret File**
1. In Render Dashboard → Settings → Environment
2. Scroll to "Secret Files"
3. Click "Add Secret File"
4. **Filename:** `/etc/secrets/firebase-credentials.json`
5. **Contents:** Copy entire contents of `backend/firebase-credentials.json`

### **Step 6: Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes
- Check deployment logs
- Get your backend URL: `https://samadhan-backend.onrender.com`

---

## **Connect Frontend to Backend**

### **Update Frontend .env**
After backend is deployed, update `frontend/.env`:
```
REACT_APP_API_URL=https://samadhan-backend.onrender.com
```

Vercel will auto-redeploy, or manually trigger:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → Latest
4. Click "Redeploy"

---

## **Verify Deployment**

### **Test Frontend**
- Visit: `https://samadhan-frontend.vercel.app`
- Sign up with test account
- Create a ticket

### **Test Backend**
- Visit: `https://samadhan-backend.onrender.com/health`
- Should return: `{"status": "ok"}`

### **Check Connection**
- Open DevTools (F12) → Console
- Create a ticket
- If successful, you're connected! ✅

---

## **Troubleshooting**

### **Frontend Errors**
- Check Vercel logs: Dashboard → Select project → Deployments → View logs
- Verify environment variables are set
- Clear browser cache (Ctrl+Shift+Del)

### **Backend Errors**
- Check Render logs: Dashboard → Select service → Logs
- Verify MongoDB connection string
- Verify Firebase credentials file is set correctly
- Check CORS_ORIGINS includes your frontend URL

### **Connection Issues**
- Backend might be "spinning down" on free tier (takes 30 sec to wake up)
- Refresh page if first request is slow
- Verify `REACT_APP_API_URL` matches your Render backend URL

---

## **Cost**

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | Unlimited deployments, 100GB bandwidth | $20+/mo |
| **Render** | 750 hours/month (stops after), PostgreSQL included | $7+/month per service |
| **MongoDB Atlas** | 512MB storage, 50k MAU | $57+/month |
| **Firebase** | 50k MAU, 20k reads/writes | Pay per use |
| **Total** | Free | $60-100/month |

---

## **Important Notes**

⚠️ **Free Tier Limitations:**
- Render spins down after 15 min of inactivity (takes 30 sec to wake)
- 750 hours/month means max ~31 hours/day
- Not suitable for production with heavy traffic
- Upgrade to paid when you reach limits

✅ **Recommended for Production:**
- **Frontend:** Vercel Pro ($20/mo) - unlimited bandwidth
- **Backend:** Render Pro ($7/mo) - always-on service
- **Database:** MongoDB Atlas M10 ($57/mo) - production-ready

---

## **Next Steps After Deployment**

1. ✅ Test all features in production
2. ✅ Share link with users
3. ✅ Monitor error logs (Sentry)
4. ✅ Scale when needed
5. ✅ Upgrade to paid tiers for reliability

---

**Deployed URLs:**
- **Frontend:** https://samadhan-frontend.vercel.app
- **Backend:** https://samadhan-backend.onrender.com
- **Status:** ✅ Live

---

For questions or issues, check the logs in each platform's dashboard!
