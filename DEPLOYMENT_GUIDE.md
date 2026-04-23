# 🚀 Deployment Guide - University Ticketing System

## Quick Deployment Overview

Your application is **production-ready**! Here's how to deploy it:

### Recommended Stack (All Free Tier Available)
- **Frontend**: Vercel or Netlify
- **Backend**: Render or Railway
- **Database**: MongoDB Atlas (Free 512MB)
- **Authentication**: Firebase (Already configured)

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Code is on GitHub
- [x] No sensitive data in repository
- [x] .gitignore properly configured
- [x] Environment variables documented
- [x] Application tested locally
- [x] Documentation complete

### 🔧 Before Deploying
- [ ] Create MongoDB Atlas account
- [ ] Set up production database
- [ ] Configure Firebase for production domain
- [ ] Prepare environment variables

---

## 🗄️ Step 1: Deploy Database (MongoDB Atlas)

### Create Free MongoDB Cluster

1. **Sign up at MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Choose "Free" tier (M0 Sandbox - 512MB)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0)
   - Select a cloud provider (AWS recommended)
   - Choose a region close to your users
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `samadhan_admin`
   - Generate a strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://samadhan_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/support_tickets?retryWrites=true&w=majority`

6. **Create Database**
   - Click "Browse Collections"
   - Click "Add My Own Data"
   - Database name: `support_tickets`
   - Collection name: `users`
   - Click "Create"

---

## 🔥 Step 2: Configure Firebase for Production

### Update Firebase Settings

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Add Production Domain**
   - Go to "Authentication" → "Settings" → "Authorized domains"
   - Add your production domains:
     - Your Vercel domain (e.g., `your-app.vercel.app`)
     - Your custom domain (if any)

3. **Update CORS Settings**
   - The Firebase config in your frontend will work automatically
   - No changes needed to the existing configuration

---

## 🖥️ Step 3: Deploy Backend (Render)

### Option A: Deploy to Render (Recommended)

1. **Sign up at Render**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `Samadhan2` repository

3. **Configure Service**
   ```
   Name: samadhan-backend
   Region: Choose closest to your users
   Branch: master
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   ```env
   MONGODB_URL=mongodb+srv://samadhan_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/support_tickets?retryWrites=true&w=majority
   DATABASE_NAME=support_tickets
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   CORS_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
   
   # Email (Optional - leave blank to disable)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=Samadhan Support <your@gmail.com>
   
   # SLA Settings
   SLA_WARN_HOURS=20
   SLA_BREACH_HOURS=48
   SLA_CHECK_MINUTES=5
   ```

5. **Add Firebase Credentials**
   - In Render dashboard, go to "Environment" → "Secret Files"
   - Add file: `firebase-credentials.json`
   - Paste your Firebase service account JSON content

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://samadhan-backend.onrender.com`)

### Option B: Deploy to Railway

1. **Sign up at Railway**
   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select `Samadhan2` repository

3. **Configure Service**
   - Select the `backend` folder as root
   - Railway will auto-detect Python

4. **Add Environment Variables**
   - Same as Render (see above)

5. **Deploy**
   - Railway will automatically deploy
   - Copy your backend URL

---

## 🌐 Step 4: Deploy Frontend (Vercel)

### Deploy to Vercel (Recommended)

1. **Sign up at Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import `Samadhan2` repository
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```env
   REACT_APP_API_URL=https://your-backend.onrender.com
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Your app will be live at `https://your-app.vercel.app`

6. **Update Backend CORS**
   - Go back to Render/Railway
   - Update `CORS_ORIGINS` environment variable
   - Add your Vercel URL: `https://your-app.vercel.app`
   - Redeploy backend

### Alternative: Deploy to Netlify

1. **Sign up at Netlify**
   - Visit: https://netlify.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select `Samadhan2` repository

3. **Configure Build**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```

4. **Add Environment Variables**
   - Same as Vercel (see above)

5. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-app.netlify.app`

---

## 🔄 Step 5: Seed Production Database (Optional)

### Add Demo Data

1. **Update seed.py for production**
   ```bash
   # Locally, update backend/.env with production MongoDB URL temporarily
   cd backend
   python seed.py
   ```

2. **Or use MongoDB Compass**
   - Download MongoDB Compass
   - Connect using your Atlas connection string
   - Manually add demo users and tickets

---

## ✅ Step 6: Verify Deployment

### Test Your Deployed App

1. **Visit Frontend URL**
   - Open `https://your-app.vercel.app`
   - Landing page should load

2. **Test Registration**
   - Click "Get Started"
   - Create a new account
   - Should redirect to dashboard

3. **Test Ticket Creation**
   - Create a test ticket
   - Check if it appears in "My Tickets"

4. **Test Admin Features**
   - Create an admin account (or update role in database)
   - Access admin dashboard
   - Test ticket management

5. **Test Real-time Updates**
   - Open ticket in two browser windows
   - Add comment in one
   - Should appear in other (WebSocket)

---

## 🔒 Step 7: Security Checklist

### Production Security

- [ ] All environment variables set correctly
- [ ] Firebase authorized domains updated
- [ ] MongoDB network access configured
- [ ] CORS origins properly set
- [ ] No sensitive data in logs
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Rate limiting configured (if needed)

---

## 🎯 Step 8: Custom Domain (Optional)

### Add Your Own Domain

#### On Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `support.university.edu`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

#### On Render
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. SSL certificate auto-generated

#### Update Firebase
- Add custom domain to Firebase authorized domains

---

## 📊 Step 9: Monitoring & Maintenance

### Set Up Monitoring

1. **Render/Railway Dashboard**
   - Monitor CPU, memory, and bandwidth
   - Check logs for errors
   - Set up alerts

2. **MongoDB Atlas**
   - Monitor database size
   - Check query performance
   - Set up backup schedule

3. **Vercel Analytics**
   - Enable Vercel Analytics (free)
   - Monitor page views and performance

### Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Review database size and performance
- **Quarterly**: Update dependencies
- **As needed**: Scale resources if traffic increases

---

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check logs in Render/Railway dashboard
# Verify all environment variables are set
# Check MongoDB connection string
```

#### Frontend Can't Connect to Backend
```bash
# Verify REACT_APP_API_URL is correct
# Check CORS_ORIGINS in backend includes frontend URL
# Ensure backend is running (check Render/Railway status)
```

#### Firebase Authentication Fails
```bash
# Verify Firebase config in frontend/.env
# Check authorized domains in Firebase console
# Ensure Firebase credentials are correct in backend
```

#### Database Connection Fails
```bash
# Verify MongoDB connection string
# Check network access in MongoDB Atlas (0.0.0.0/0)
# Verify database user credentials
```

---

## 💰 Cost Breakdown (Free Tier)

### Monthly Costs (Free Tier)
- **Vercel**: Free (100GB bandwidth, unlimited projects)
- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)
- **MongoDB Atlas**: Free (512MB storage, shared cluster)
- **Firebase**: Free (50K reads/day, 20K writes/day)

**Total: $0/month** for moderate usage

### When to Upgrade
- **Vercel**: Upgrade if you need >100GB bandwidth
- **Render**: Upgrade ($7/month) to prevent sleep and get more resources
- **MongoDB**: Upgrade when you exceed 512MB storage
- **Firebase**: Upgrade if you exceed free tier limits

---

## 🎉 Deployment Complete!

### Your Live URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://samadhan-backend.onrender.com`
- **Database**: MongoDB Atlas (managed)

### Next Steps
1. Share your app with users
2. Monitor performance and errors
3. Gather feedback
4. Iterate and improve

---

## 📞 Support

### Need Help?
- **Documentation**: Check README.md and API_DOCS.md
- **Issues**: Open an issue on GitHub
- **Community**: Join discussions on GitHub

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Firebase Console**: https://console.firebase.google.com
- **GitHub Repository**: https://github.com/ipshita6-hub/Samadhan2

---

**Deployment Guide Version**: 1.0  
**Last Updated**: April 22, 2026  
**Status**: Production Ready ✅

🎊 **Congratulations on deploying your application!** 🎊
