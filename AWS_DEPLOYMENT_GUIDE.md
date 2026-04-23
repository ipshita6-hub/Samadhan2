# 🚀 AWS Deployment Guide - University Ticketing System

## Deployment Architecture

- **Frontend**: AWS Amplify (React app)
- **Backend**: AWS EC2 (FastAPI + Python)
- **Database**: MongoDB Atlas (Free tier)
- **Authentication**: Firebase

---

## 📋 Prerequisites

- AWS Account (Free tier eligible)
- GitHub repository (already done ✅)
- MongoDB Atlas account
- Firebase project (already configured ✅)
- Domain name (optional)

---

## 🗄️ Part 1: Setup MongoDB Atlas (5 minutes)

### Create Free MongoDB Cluster

1. **Sign up at MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Choose "Free" tier (M0 Sandbox - 512MB)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0)
   - Select AWS as cloud provider
   - Choose region: **us-east-1** (same as your EC2 for best performance)
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `samadhan_admin`
   - Generate strong password (save it!)
   - Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://samadhan_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/support_tickets?retryWrites=true&w=majority
   ```

6. **Create Database**
   - Click "Browse Collections"
   - Click "Add My Own Data"
   - Database: `support_tickets`
   - Collection: `users`

---

## 🖥️ Part 2: Deploy Backend on AWS EC2 (30 minutes)

### Step 1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to: https://console.aws.amazon.com
   - Navigate to EC2 Dashboard

2. **Launch Instance**
   - Click "Launch Instance"
   - **Name**: `samadhan-backend`
   
3. **Choose AMI**
   - Select: **Ubuntu Server 22.04 LTS (Free tier eligible)**
   - Architecture: 64-bit (x86)

4. **Choose Instance Type**
   - Select: **t2.micro** (Free tier eligible)
   - 1 vCPU, 1 GB RAM

5. **Create Key Pair**
   - Click "Create new key pair"
   - Name: `samadhan-key`
   - Type: RSA
   - Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows/PuTTY)
   - Click "Create key pair"
   - **Save the file securely!**

6. **Configure Network Settings**
   - Click "Edit" on Network settings
   - **Allow SSH traffic from**: My IP (or Anywhere for testing)
   - **Allow HTTPS traffic from the internet**: ✅
   - **Allow HTTP traffic from the internet**: ✅
   - Click "Add security group rule":
     - Type: Custom TCP
     - Port: 8000
     - Source: Anywhere (0.0.0.0/0)
     - Description: FastAPI Backend

7. **Configure Storage**
   - Keep default: 8 GB gp3 (Free tier eligible)

8. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance to be "Running" (2-3 minutes)
   - Note your **Public IPv4 address** (e.g., 3.85.123.45)

### Step 2: Connect to EC2 Instance

#### For Windows (using PowerShell or CMD)

```bash
# Navigate to where you saved the key
cd Downloads

# Connect via SSH
ssh -i samadhan-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

#### For Mac/Linux

```bash
# Set correct permissions
chmod 400 samadhan-key.pem

# Connect via SSH
ssh -i samadhan-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Setup Backend on EC2

Once connected to your EC2 instance, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.9+ and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Git
sudo apt install git -y

# Clone your repository
git clone https://github.com/ipshita6-hub/Samadhan2.git
cd Samadhan2/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install additional production dependencies
pip install gunicorn uvicorn[standard]
```

### Step 4: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Paste this content (replace with your actual values):

```env
MONGODB_URL=mongodb+srv://samadhan_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/support_tickets?retryWrites=true&w=majority
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=https://your-amplify-app.amplifyapp.com,http://YOUR_EC2_PUBLIC_IP:8000

# Email (Optional)
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

Save: `Ctrl + X`, then `Y`, then `Enter`

### Step 5: Add Firebase Credentials

```bash
# Create firebase credentials file
nano firebase-credentials.json
```

Paste your Firebase service account JSON (from your local `backend/firebase-credentials.json`)

Save: `Ctrl + X`, then `Y`, then `Enter`

### Step 6: Test Backend

```bash
# Test if backend starts
python3 main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Press `Ctrl + C` to stop.

Test from your browser:
```
http://YOUR_EC2_PUBLIC_IP:8000/health
```

Should return: `{"status":"healthy"}`

### Step 7: Setup Backend as System Service

Create a systemd service to keep backend running:

```bash
# Exit from venv
deactivate

# Create service file
sudo nano /etc/systemd/system/samadhan-backend.service
```

Paste this content:

```ini
[Unit]
Description=Samadhan Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Samadhan2/backend
Environment="PATH=/home/ubuntu/Samadhan2/backend/venv/bin"
ExecStart=/home/ubuntu/Samadhan2/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save: `Ctrl + X`, then `Y`, then `Enter`

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable samadhan-backend

# Start the service
sudo systemctl start samadhan-backend

# Check status
sudo systemctl status samadhan-backend
```

Should show: `Active: active (running)`

### Step 8: Setup Nginx as Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/samadhan
```

Paste this content:

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Save and enable:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/samadhan /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

Now your backend is accessible at:
- `http://YOUR_EC2_PUBLIC_IP` (via Nginx)
- `http://YOUR_EC2_PUBLIC_IP:8000` (direct)

### Step 9: Setup SSL with Let's Encrypt (If you have a domain)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d api.yourdomain.com

# Follow prompts
# Certificate will auto-renew
```

---

## 🌐 Part 3: Deploy Frontend on AWS Amplify (15 minutes)

### Step 1: Prepare Frontend for Amplify

1. **Update Frontend Environment Variables**
   
   Your frontend needs to know the backend URL. We'll set this in Amplify.

### Step 2: Login to AWS Amplify

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify
   - Or search "Amplify" in AWS Console

2. **Create New App**
   - Click "New app" → "Host web app"
   - Choose "GitHub"
   - Click "Continue"

### Step 3: Authorize GitHub

1. **Connect GitHub**
   - Click "Authorize AWS Amplify"
   - Grant access to your repositories

2. **Select Repository**
   - Repository: `Samadhan2`
   - Branch: `master`
   - Click "Next"

### Step 4: Configure Build Settings

1. **App name**: `samadhan-frontend`

2. **Monorepo Configuration**
   - Check "Connecting a monorepo? Pick a folder"
   - Root directory: `frontend`

3. **Build Settings** (Auto-detected, verify it looks like this):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

4. **Advanced Settings**
   - Click "Advanced settings"
   - Add Environment Variables:

```
REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

**Important**: Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP!

5. **Click "Next"**

### Step 5: Review and Deploy

1. **Review Settings**
   - Verify everything is correct
   - Click "Save and deploy"

2. **Wait for Deployment**
   - Provision (1 min)
   - Build (3-5 mins)
   - Deploy (1 min)
   - Verify (30 sec)

3. **Get Your URL**
   - Once deployed, you'll get a URL like:
   - `https://master.d1a2b3c4d5e6f7.amplifyapp.com`

### Step 6: Update Backend CORS

1. **SSH back to EC2**
   ```bash
   ssh -i samadhan-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

2. **Update .env file**
   ```bash
   cd Samadhan2/backend
   nano .env
   ```

3. **Update CORS_ORIGINS**
   ```env
   CORS_ORIGINS=https://master.d1a2b3c4d5e6f7.amplifyapp.com,http://YOUR_EC2_PUBLIC_IP
   ```

4. **Restart backend**
   ```bash
   sudo systemctl restart samadhan-backend
   ```

### Step 7: Update Firebase Authorized Domains

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Add Amplify Domain**
   - Go to "Authentication" → "Settings" → "Authorized domains"
   - Click "Add domain"
   - Add: `master.d1a2b3c4d5e6f7.amplifyapp.com` (your Amplify URL)
   - Click "Add"

---

## ✅ Part 4: Verify Deployment

### Test Your Application

1. **Visit Frontend**
   - Open: `https://your-amplify-url.amplifyapp.com`
   - Landing page should load

2. **Test Backend Connection**
   - Open browser console (F12)
   - Should see no CORS errors

3. **Test Registration**
   - Click "Get Started"
   - Create account
   - Should redirect to dashboard

4. **Test Ticket Creation**
   - Create a test ticket
   - Should appear in "My Tickets"

5. **Test Real-time Updates**
   - Open ticket in two tabs
   - Add comment in one
   - Should appear in other

---

## 🔒 Part 5: Security Hardening

### EC2 Security

1. **Update Security Group**
   - Go to EC2 → Security Groups
   - Edit inbound rules:
     - SSH (22): Only from your IP
     - HTTP (80): Anywhere
     - HTTPS (443): Anywhere
     - Remove port 8000 if using Nginx

2. **Setup Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Disable Root Login**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart sshd
   ```

### MongoDB Security

- ✅ Already configured with username/password
- ✅ Network access restricted
- Consider: Enable IP whitelist (add EC2 IP only)

---

## 📊 Part 6: Monitoring & Logs

### EC2 Monitoring

```bash
# View backend logs
sudo journalctl -u samadhan-backend -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
```

### Amplify Monitoring

- Go to Amplify Console
- Click on your app
- View "Monitoring" tab for:
  - Build history
  - Traffic metrics
  - Error rates

### CloudWatch (Optional)

- Enable CloudWatch for EC2
- Monitor CPU, memory, network
- Set up alarms for high usage

---

## 🔄 Part 7: Updates & Maintenance

### Update Backend Code

```bash
# SSH to EC2
ssh -i samadhan-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Navigate to project
cd Samadhan2

# Pull latest changes
git pull origin master

# Restart service
sudo systemctl restart samadhan-backend
```

### Update Frontend Code

- Just push to GitHub
- Amplify will auto-deploy on push to master branch
- Or manually trigger build in Amplify Console

### Database Backup

```bash
# Install MongoDB tools on EC2
sudo apt install mongodb-database-tools -y

# Backup database
mongodump --uri="YOUR_MONGODB_CONNECTION_STRING" --out=/home/ubuntu/backups/$(date +%Y%m%d)

# Setup cron job for daily backups
crontab -e
# Add: 0 2 * * * mongodump --uri="YOUR_MONGODB_CONNECTION_STRING" --out=/home/ubuntu/backups/$(date +\%Y\%m\%d)
```

---

## 💰 Cost Estimate

### AWS Free Tier (First 12 months)
- **EC2 t2.micro**: 750 hours/month (FREE)
- **Amplify**: 1000 build minutes/month (FREE)
- **Data Transfer**: 15 GB/month (FREE)

### After Free Tier
- **EC2 t2.micro**: ~$8-10/month
- **Amplify**: ~$0.01 per build minute
- **Data Transfer**: ~$0.09/GB

### MongoDB Atlas
- **Free Tier**: $0/month (512MB)
- **Upgrade**: $9/month (2GB)

### Firebase
- **Free Tier**: $0/month
- **Upgrade**: Pay as you go

**Estimated Total**: $0-20/month depending on usage

---

## 🎯 Part 8: Custom Domain (Optional)

### Add Custom Domain to Amplify

1. **In Amplify Console**
   - Go to "Domain management"
   - Click "Add domain"
   - Enter your domain: `support.youruniversity.edu`

2. **Configure DNS**
   - Add CNAME records as shown by Amplify
   - Wait for SSL certificate (automatic)

### Add Custom Domain to EC2

1. **Create A Record**
   - Point `api.youruniversity.edu` to EC2 IP

2. **Update Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/samadhan
   # Change server_name to: api.youruniversity.edu
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Get SSL Certificate**
   ```bash
   sudo certbot --nginx -d api.youruniversity.edu
   ```

---

## 🚨 Troubleshooting

### Backend Issues

**Service won't start:**
```bash
sudo systemctl status samadhan-backend
sudo journalctl -u samadhan-backend -n 50
```

**Can't connect to MongoDB:**
- Check connection string in .env
- Verify network access in MongoDB Atlas
- Test connection: `python3 -c "from database import db; print(db.list_collection_names())"`

**Port 8000 not accessible:**
- Check security group allows port 8000
- Check if service is running: `sudo systemctl status samadhan-backend`

### Frontend Issues

**Build fails in Amplify:**
- Check build logs in Amplify Console
- Verify environment variables are set
- Check if `frontend/` directory structure is correct

**Can't connect to backend:**
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Check EC2 security group allows HTTP/HTTPS

**Firebase auth fails:**
- Verify Firebase config in environment variables
- Check authorized domains in Firebase Console

---

## 📞 Quick Reference

### Important URLs
- **Frontend**: `https://your-app.amplifyapp.com`
- **Backend**: `http://YOUR_EC2_PUBLIC_IP`
- **Backend Health**: `http://YOUR_EC2_PUBLIC_IP/health`
- **MongoDB**: MongoDB Atlas Dashboard
- **Firebase**: Firebase Console

### SSH Command
```bash
ssh -i samadhan-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Useful Commands
```bash
# Restart backend
sudo systemctl restart samadhan-backend

# View logs
sudo journalctl -u samadhan-backend -f

# Check status
sudo systemctl status samadhan-backend

# Update code
cd Samadhan2 && git pull && sudo systemctl restart samadhan-backend
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Code on GitHub
- [x] MongoDB Atlas account created
- [x] AWS account ready
- [x] Firebase configured

### EC2 Backend
- [ ] EC2 instance launched
- [ ] Backend code deployed
- [ ] Environment variables configured
- [ ] Service running
- [ ] Health check passing
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)

### Amplify Frontend
- [ ] App created in Amplify
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible
- [ ] Backend connection working

### Final Steps
- [ ] Firebase domains updated
- [ ] CORS configured
- [ ] Test registration
- [ ] Test ticket creation
- [ ] Test real-time updates
- [ ] Security hardening complete

---

## 🎉 Deployment Complete!

Your application is now live on AWS!

- **Frontend**: AWS Amplify (Auto-scaling, CDN, SSL)
- **Backend**: AWS EC2 (Full control, customizable)
- **Database**: MongoDB Atlas (Managed, backed up)

### Next Steps
1. Monitor application performance
2. Set up automated backups
3. Configure CloudWatch alarms
4. Add custom domain
5. Share with users!

---

**Guide Version**: 1.0  
**Last Updated**: April 22, 2026  
**Status**: Production Ready ✅

🎊 **Congratulations on your AWS deployment!** 🎊
