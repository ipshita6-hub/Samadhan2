# 📋 Step-by-Step Deployment (With Screenshots Guide)

## **STEP 1: Prepare GitHub (2 minutes)**

```bash
# In your project root
git add .
git commit -m "Deploy: Ready for Vercel + Render"
git push origin main
```

✅ Now your latest code is on GitHub

---

## **STEP 2: Deploy Frontend on Vercel (3 minutes)**

### 2.1 Go to Vercel
- Open https://vercel.com
- Click "Sign Up"
- Select "Continue with GitHub"
- Authorize and login

### 2.2 Import Project
- Click "Add New..." → "Project"
- Click "Import Git Repository"
- Search for "samadhan" or your repo name
- Select it
- Click "Import"

### 2.3 Configure Project
- **Project Name:** `samadhan-frontend` (auto-filled)
- **Framework:** `Create React App` (should auto-detect)
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `build` (auto-filled)
- Root Directory: `frontend` (IMPORTANT!)

### 2.4 Add Environment Variables
Click "Environment Variables" and add these 6 variables:

```
Name: REACT_APP_API_URL
Value: https://samadhan-backend.onrender.com

Name: REACT_APP_FIREBASE_API_KEY
Value: AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c

Name: REACT_APP_FIREBASE_AUTH_DOMAIN
Value: samadhan-562bd.firebaseapp.com

Name: REACT_APP_FIREBASE_PROJECT_ID
Value: samadhan-562bd

Name: REACT_APP_FIREBASE_STORAGE_BUCKET
Value: samadhan-562bd.firebasestorage.app

Name: REACT_APP_FIREBASE_MESSAGING_SENDER_ID
Value: 159400401099

Name: REACT_APP_FIREBASE_APP_ID
Value: 1:159400401099:web:5d22e0dfb81d8fe2e1634e
```

### 2.5 Deploy
- Click "Deploy"
- Wait 2-3 minutes
- See green checkmark? ✅ You're done!

### 2.6 Get Your URL
- Copy the deployment URL (e.g., `samadhan-frontend.vercel.app`)
- Test it: Visit the URL in browser
- You should see login page

---

## **STEP 3: Deploy Backend on Render (5 minutes)**

### 3.1 Go to Render
- Open https://render.com
- Click "Sign Up"
- Select "Continue with GitHub"
- Authorize and login

### 3.2 Create Web Service
- Click "New" → "Web Service"
- Search for your repository
- Select it
- Click "Connect"

### 3.3 Configure Service
Fill in these fields:

```
Name: samadhan-backend
Environment: Python 3.10
Build Command: pip install -r backend/requirements.txt

Start Command:
cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker main:app

Root Directory: /
```

### 3.4 Add Environment Variables
Click "Environment" and add these 4 variables:

```
MONGODB_URL = [PASTE YOUR MONGODB CONNECTION STRING]
FIREBASE_CREDENTIALS_PATH = /etc/secrets/firebase-credentials.json
CORS_ORIGINS = https://samadhan-frontend.vercel.app
PORT = 8000
```

**⚠️ MONGODB_URL: Where to get it?**
1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Click "Connect"
3. Choose "Connection String"
4. Copy the string
5. Replace `<password>` with your password
6. Replace `myFirstDatabase` with `samadhan`
7. Paste in MONGODB_URL

### 3.5 Add Firebase Credentials (Important!)
1. Click "Environment" tab again
2. Scroll down to "Secret Files"
3. Click "Add Secret File"
4. **Filename:** `/etc/secrets/firebase-credentials.json`
5. **Contents:** 
   - Open `backend/firebase-credentials.json` from your computer
   - Copy ALL the text
   - Paste it in the "Contents" field
6. Click "Save"

### 3.6 Create Service
- Click "Create Web Service"
- Wait 5-10 minutes for build
- See "Live" status? ✅ You're done!

### 3.7 Get Your URL
- Copy the deployment URL (e.g., `samadhan-backend.onrender.com`)
- Test it: Visit `samadhan-backend.onrender.com/health` in browser
- You should see: `{"status":"ok"}`

---

## **STEP 4: Update Frontend with Backend URL (1 minute)**

Now that you have your Render backend URL, update frontend:

### 4.1 Update Vercel Environment
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Find `REACT_APP_API_URL`
5. Change value from placeholder to: `https://samadhan-backend.onrender.com`
6. Vercel will auto-redeploy

Or manually redeploy:
1. Go to "Deployments"
2. Click latest deployment
3. Click "Redeploy"

---

## **STEP 5: Test Everything (2 minutes)**

### 5.1 Test Frontend
1. Visit your Vercel URL: `https://samadhan-frontend.vercel.app`
2. Try to sign up:
   - Email: `test@university.edu`
   - Password: `Test123!`
   - Role: `Student`
3. Click "Sign Up"
4. Should redirect to dashboard

### 5.2 Test Backend
1. Visit: `https://samadhan-backend.onrender.com/health`
2. Should show: `{"status":"ok"}`

### 5.3 Test Connection
1. Back to frontend dashboard
2. Click "New Ticket"
3. Fill in:
   - Title: "Test ticket"
   - Description: "This is a test"
   - Category: "Technical Support"
4. Click "Create Ticket"
5. Should show success message ✅

### 5.4 Test Full Flow
1. Try creating another ticket
2. Try viewing tickets
3. Try admin features (if admin)
4. Check browser console (F12) for errors

---

## **Troubleshooting**

### **Problem: "Failed to fetch"**
- Wait 30 seconds (Render cold start)
- Refresh page
- Check backend URL is correct

### **Problem: "Cannot connect to database"**
- Check MONGODB_URL is correct
- Make sure MongoDB cluster is running
- Verify username/password

### **Problem: "Firebase error"**
- Check credentials file is uploaded
- Check path: `/etc/secrets/firebase-credentials.json`
- Test with fresh credentials file

### **Problem: Vercel build fails**
- Check Vercel logs
- Go to Settings → Environment Variables
- Add all 6 required variables
- Redeploy

### **Problem: Render build fails**
- Check Render logs
- Verify all 4 environment variables added
- Verify Start Command copied exactly
- Check Firebase credentials file uploaded

---

## **After Deployment**

✅ **Optional but recommended:**
1. Set up monitoring (Sentry free tier)
2. Enable database backups
3. Share URLs with team
4. Test on mobile
5. Plan for upgrade to paid tiers

✅ **Free tier limitations:**
- Render: Spins down after 15 min (takes 30 sec to wake)
- Vercel: 100GB bandwidth/month
- MongoDB: 512MB storage
- Fine for learning, upgrade for production!

---

## **Your Live URLs**

After completing all steps:

**Frontend:** `https://samadhan-frontend.vercel.app`  
**Backend:** `https://samadhan-backend.onrender.com`  
**API Health:** `https://samadhan-backend.onrender.com/health`

---

**Done! 🎉 Your app is now live on the internet!**

Share these URLs with your team!
