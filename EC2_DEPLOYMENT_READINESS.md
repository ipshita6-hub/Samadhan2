# 🚀 EC2 Deployment Readiness Report

## ✅ Current Status: **READY FOR EC2 DEPLOYMENT**

Your project is running successfully locally and is ready for EC2 deployment with some configuration changes.

---

## 🟢 What's Working Locally

### Backend (Port 8000)
- ✅ FastAPI server running on `http://0.0.0.0:8000`
- ✅ Firebase initialized successfully
- ✅ MongoDB connected (localhost:27017)
- ✅ All API endpoints accessible
- ✅ CORS configured for frontend
- ✅ File upload system ready

### Frontend (Port 3000)
- ✅ React app compiled successfully
- ✅ Running on `http://localhost:3000`
- ✅ Firebase authentication configured
- ✅ API connection to backend working

### Database
- ✅ MongoDB running (Process ID: 4932)
- ✅ Database: `support_tickets`
- ✅ All collections ready

---

## 📋 EC2 Deployment Checklist

### 🔴 CRITICAL - Must Change Before Deployment

#### 1. **Environment Variables**
**Backend `.env`:**
```bash
# ❌ Current (localhost)
MONGODB_URL=mongodb://localhost:27017
CORS_ORIGINS=http://localhost:3000

# ✅ Change to (EC2)
MONGODB_URL=mongodb://localhost:27017  # Or MongoDB Atlas URL
CORS_ORIGINS=http://your-ec2-ip:3000,http://your-domain.com
```

**Frontend `.env`:**
```bash
# ❌ Current
REACT_APP_API_URL=http://localhost:8000

# ✅ Change to
REACT_APP_API_URL=http://your-ec2-ip:8000
# Or better: https://api.yourdomain.com
```

#### 2. **Firebase Credentials**
- ✅ You have `firebase-credentials.json` (DO NOT commit to GitHub!)
- ⚠️ Upload securely to EC2 via SCP/SFTP
- ⚠️ Set proper file permissions: `chmod 600 firebase-credentials.json`

#### 3. **Security Groups (AWS)**
Open these ports in EC2 Security Group:
- **22** - SSH (your IP only)
- **80** - HTTP (0.0.0.0/0)
- **443** - HTTPS (0.0.0.0/0) - for SSL
- **3000** - Frontend (0.0.0.0/0) - temporary, use Nginx later
- **8000** - Backend API (0.0.0.0/0) - temporary, use Nginx later
- **27017** - MongoDB (127.0.0.1 only - localhost)

---

## 🟡 RECOMMENDED - Production Best Practices

### 1. **Use MongoDB Atlas (Cloud Database)**
Instead of running MongoDB on EC2:
```bash
# In backend/.env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/support_tickets?retryWrites=true&w=majority
```

**Benefits:**
- Automatic backups
- Scalability
- No maintenance
- Free tier available (512MB)

**Setup:** https://www.mongodb.com/cloud/atlas/register

### 2. **Use Nginx as Reverse Proxy**
Instead of exposing ports 3000 and 8000:

```nginx
# /etc/nginx/sites-available/samadhan
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. **Use PM2 for Process Management**
Keep backend and frontend running even after SSH disconnect:

```bash
# Install PM2
npm install -g pm2

# Backend
cd backend
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name samadhan-backend

# Frontend (production build)
cd frontend
npm run build
pm2 serve build 3000 --name samadhan-frontend --spa

# Save PM2 config
pm2 save
pm2 startup
```

### 4. **SSL Certificate (HTTPS)**
Use Let's Encrypt (free):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 5. **Environment Variables Security**
Don't use `.env` files in production. Use:
- AWS Systems Manager Parameter Store
- AWS Secrets Manager
- Or export in PM2 ecosystem file

### 6. **Build Frontend for Production**
```bash
cd frontend
npm run build
# Serve the 'build' folder instead of 'npm start'
```

---

## 📦 EC2 Deployment Steps

### Step 1: Launch EC2 Instance
```bash
# Recommended: Ubuntu 22.04 LTS
# Instance Type: t2.medium (2 vCPU, 4GB RAM) or t2.small for testing
# Storage: 20GB minimum
```

### Step 2: Connect and Install Dependencies
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.10+
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB (or use Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 3: Clone and Setup Project
```bash
# Clone repository
git clone https://github.com/yourusername/samadhan2.git
cd samadhan2

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Upload firebase-credentials.json via SCP
# From your local machine:
# scp -i your-key.pem backend/firebase-credentials.json ubuntu@your-ec2-ip:~/samadhan2/backend/

# Create .env file
nano .env
# Paste production environment variables

# Frontend setup
cd ../frontend
npm install
npm run build  # Production build
```

### Step 4: Configure Environment Variables
```bash
# Backend .env
cd ~/samadhan2/backend
nano .env
```
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://your-ec2-ip,http://your-domain.com

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

```bash
# Frontend .env
cd ~/samadhan2/frontend
nano .env
```
```env
REACT_APP_API_URL=http://your-ec2-ip:8000

REACT_APP_FIREBASE_API_KEY=AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
REACT_APP_FIREBASE_AUTH_DOMAIN=samadhan-562bd.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=samadhan-562bd
REACT_APP_FIREBASE_STORAGE_BUCKET=samadhan-562bd.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=159400401099
REACT_APP_FIREBASE_APP_ID=1:159400401099:web:5d22e0dfb81d8fe2e1634e
```

### Step 5: Start Services with PM2
```bash
# Backend
cd ~/samadhan2/backend
source venv/bin/activate
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name samadhan-backend --interpreter python3

# Frontend (serve production build)
cd ~/samadhan2/frontend
pm2 serve build 3000 --name samadhan-frontend --spa

# Save PM2 configuration
pm2 save
pm2 startup  # Follow the instructions to enable auto-start on reboot
```

### Step 6: Configure Nginx (Optional but Recommended)
```bash
sudo nano /etc/nginx/sites-available/samadhan
```
Paste the Nginx config from above, then:
```bash
sudo ln -s /etc/nginx/sites-available/samadhan /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 7: Configure Firewall
```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 🧪 Testing Deployment

### 1. **Health Check**
```bash
# Backend
curl http://your-ec2-ip:8000/health
# Should return: {"status":"ok"}

# Frontend
curl http://your-ec2-ip:3000
# Should return HTML
```

### 2. **API Test**
```bash
# Test API docs
http://your-ec2-ip:8000/docs
```

### 3. **Frontend Test**
Open browser: `http://your-ec2-ip:3000`

---

## 📊 Cost Estimation (AWS)

### Option 1: Basic Setup
- **EC2 t2.small** (1 vCPU, 2GB RAM): ~$17/month
- **MongoDB on EC2**: Included
- **20GB Storage**: ~$2/month
- **Data Transfer**: ~$5/month (first 1GB free)
- **Total**: ~$24/month

### Option 2: Recommended Setup
- **EC2 t2.medium** (2 vCPU, 4GB RAM): ~$34/month
- **MongoDB Atlas** (Free tier 512MB): $0
- **30GB Storage**: ~$3/month
- **Data Transfer**: ~$5/month
- **Total**: ~$42/month

### Option 3: Production-Ready
- **EC2 t3.medium** (2 vCPU, 4GB RAM): ~$30/month
- **MongoDB Atlas M10** (2GB RAM): ~$57/month
- **Application Load Balancer**: ~$16/month
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$103/month

---

## 🔒 Security Checklist

- [ ] Change default SSH port (optional)
- [ ] Use SSH keys only (disable password auth)
- [ ] Set up firewall (UFW)
- [ ] Install fail2ban for brute-force protection
- [ ] Enable HTTPS with SSL certificate
- [ ] Set proper file permissions (chmod 600 for .env)
- [ ] Don't commit secrets to GitHub
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`

---

## 📝 Monitoring & Maintenance

### PM2 Monitoring
```bash
pm2 status          # Check process status
pm2 logs            # View logs
pm2 monit           # Real-time monitoring
pm2 restart all     # Restart all processes
```

### MongoDB Monitoring
```bash
mongosh
> use support_tickets
> db.stats()
> db.tickets.countDocuments()
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Disk Space
```bash
df -h
du -sh ~/samadhan2/*
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Port Already in Use
```bash
# Find process using port
sudo lsof -i :8000
# Kill process
sudo kill -9 <PID>
```

### Issue 2: MongoDB Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod
# Restart MongoDB
sudo systemctl restart mongod
```

### Issue 3: Frontend Can't Connect to Backend
- Check CORS_ORIGINS in backend/.env
- Check REACT_APP_API_URL in frontend/.env
- Verify Security Group allows port 8000

### Issue 4: Firebase Authentication Error
- Verify firebase-credentials.json is uploaded
- Check file path in FIREBASE_CREDENTIALS_PATH
- Ensure file permissions: `chmod 600 firebase-credentials.json`

---

## 🎯 Quick Deployment Script

Save this as `deploy.sh` on EC2:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Samadhan..."

# Pull latest code
cd ~/samadhan2
git pull origin master

# Backend
echo "📦 Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart samadhan-backend

# Frontend
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build
pm2 restart samadhan-frontend

echo "✅ Deployment complete!"
pm2 status
```

Make executable: `chmod +x deploy.sh`

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/getting-started/)

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables updated for production
- [ ] Firebase credentials uploaded securely
- [ ] MongoDB running (local or Atlas)
- [ ] Backend running on PM2
- [ ] Frontend built and served
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Security groups configured
- [ ] Firewall enabled
- [ ] DNS configured (if using domain)
- [ ] Tested all major features
- [ ] Backup strategy in place

---

## 🎓 Your Project Status

### ✅ Strengths
1. **Complete Full-Stack Application** - Frontend + Backend + Database
2. **Modern Tech Stack** - React, FastAPI, MongoDB, Firebase
3. **Production-Ready Features** - Authentication, real-time updates, file uploads
4. **Well-Documented** - Comprehensive README and guides
5. **Clean Code** - Modular, type-safe, follows best practices

### 🟡 Improvements for Production
1. Use MongoDB Atlas instead of local MongoDB
2. Implement Nginx reverse proxy
3. Add SSL certificate for HTTPS
4. Use PM2 for process management
5. Set up monitoring and logging
6. Implement rate limiting
7. Add automated backups

### 💡 Estimated Deployment Time
- **Basic Setup**: 1-2 hours
- **With Nginx + SSL**: 2-3 hours
- **Full Production Setup**: 3-4 hours

---

**Your project is READY for EC2 deployment! Follow the steps above and you'll have it running in production. Good luck! 🚀**
