# 🚀 EC2 Deployment Commands - Copy & Paste Ready

## 📋 Prerequisites

Before connecting to EC2, you need:
1. ✅ EC2 instance launched (Ubuntu 22.04 LTS recommended)
2. ✅ Security Group with ports open: 22, 80, 3000, 8000, 27017
3. ✅ SSH key pair (.pem file)
4. ✅ EC2 public IP address

---

## 🔑 STEP 0: From Your Local Machine (Before SSH)

### Upload Firebase Credentials to EC2
```bash
# Replace YOUR_KEY.pem and YOUR_EC2_IP with your actual values
scp -i YOUR_KEY.pem backend/firebase-credentials.json ubuntu@YOUR_EC2_IP:~/
```

**Example**:
```bash
scp -i samadhan-key.pem backend/firebase-credentials.json ubuntu@54.123.45.67:~/
```

---

## 🖥️ STEP 1: Connect to EC2

```bash
# Replace YOUR_KEY.pem and YOUR_EC2_IP
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP
```

**Example**:
```bash
ssh -i samadhan-key.pem ubuntu@54.123.45.67
```

---

## 📦 STEP 2: Install All Dependencies (Copy-Paste All)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Verify installations
echo "=== Checking Installations ==="
node --version
python3 --version
mongod --version
pm2 --version
git --version
```

**⏱️ Time**: ~5-10 minutes

---

## 📥 STEP 3: Clone Your Repository

```bash
# Clone your project
git clone https://github.com/YOUR_USERNAME/samadhan2.git
cd samadhan2

# Verify files
ls -la
```

**Replace `YOUR_USERNAME`** with your GitHub username.

**Example**:
```bash
git clone https://github.com/johnsmith/samadhan2.git
cd samadhan2
```

---

## 🐍 STEP 4: Setup Backend

```bash
# Navigate to backend
cd ~/samadhan2/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Move firebase credentials
mv ~/firebase-credentials.json ./firebase-credentials.json
chmod 600 firebase-credentials.json

# Get EC2 public IP (auto-detect)
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Your EC2 IP: $EC2_IP"

# Create .env file
cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://$EC2_IP:3000,http://$EC2_IP
EOF

# Verify .env file
cat .env

# Test backend (optional - Ctrl+C to stop)
# python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**⏱️ Time**: ~2-3 minutes

---

## ⚛️ STEP 5: Setup Frontend

```bash
# Navigate to frontend
cd ~/samadhan2/frontend

# Install Node dependencies
npm install

# Get EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://$EC2_IP:8000

REACT_APP_FIREBASE_API_KEY=AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
REACT_APP_FIREBASE_AUTH_DOMAIN=samadhan-562bd.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=samadhan-562bd
REACT_APP_FIREBASE_STORAGE_BUCKET=samadhan-562bd.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=159400401099
REACT_APP_FIREBASE_APP_ID=1:159400401099:web:5d22e0dfb81d8fe2e1634e
EOF

# Verify .env file
cat .env

# Build production frontend
npm run build
```

**⏱️ Time**: ~3-5 minutes (npm install takes time)

---

## 🚀 STEP 6: Start Services with PM2

```bash
# Start Backend
cd ~/samadhan2/backend
source venv/bin/activate
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name samadhan-backend --interpreter python3

# Start Frontend
cd ~/samadhan2/frontend
pm2 serve build 3000 --name samadhan-frontend --spa

# Check status
pm2 status

# View logs (optional)
pm2 logs

# Save PM2 configuration
pm2 save

# Enable PM2 to start on system reboot
pm2 startup
# Copy and run the command it outputs
```

**⏱️ Time**: ~1 minute

---

## ✅ STEP 7: Verify Deployment

```bash
# Check if services are running
pm2 status

# Test backend health
curl http://localhost:8000/health

# Get your EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "==================================="
echo "🎉 Deployment Complete!"
echo "==================================="
echo "Frontend: http://$EC2_IP:3000"
echo "Backend:  http://$EC2_IP:8000"
echo "API Docs: http://$EC2_IP:8000/docs"
echo "==================================="
```

---

## 🌐 STEP 8: Open in Browser

From your local machine, open:
- **Frontend**: `http://YOUR_EC2_IP:3000`
- **Backend API Docs**: `http://YOUR_EC2_IP:8000/docs`
- **Health Check**: `http://YOUR_EC2_IP:8000/health`

---

## 🔧 Useful PM2 Commands

```bash
# View all processes
pm2 status

# View logs (real-time)
pm2 logs

# View backend logs only
pm2 logs samadhan-backend

# View frontend logs only
pm2 logs samadhan-frontend

# Restart services
pm2 restart all
pm2 restart samadhan-backend
pm2 restart samadhan-frontend

# Stop services
pm2 stop all
pm2 stop samadhan-backend
pm2 stop samadhan-frontend

# Delete services
pm2 delete all
pm2 delete samadhan-backend
pm2 delete samadhan-frontend

# Monitor resources
pm2 monit
```

---

## 🐛 Troubleshooting

### Issue 1: Backend won't start
```bash
# Check logs
pm2 logs samadhan-backend

# Common fixes:
cd ~/samadhan2/backend
source venv/bin/activate

# Check if firebase-credentials.json exists
ls -la firebase-credentials.json

# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB if needed
sudo systemctl restart mongod
```

### Issue 2: Frontend won't start
```bash
# Check logs
pm2 logs samadhan-frontend

# Rebuild frontend
cd ~/samadhan2/frontend
npm run build
pm2 restart samadhan-frontend
```

### Issue 3: Can't access from browser
```bash
# Check if services are running
pm2 status

# Check if ports are listening
sudo netstat -tulpn | grep -E '3000|8000'

# Check AWS Security Group:
# - Port 3000 should be open (0.0.0.0/0)
# - Port 8000 should be open (0.0.0.0/0)
```

### Issue 4: MongoDB connection failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart backend after MongoDB is running
pm2 restart samadhan-backend
```

### Issue 5: CORS errors in browser
```bash
# Check backend .env file
cat ~/samadhan2/backend/.env

# Make sure CORS_ORIGINS includes your EC2 IP
# Should look like: CORS_ORIGINS=http://54.123.45.67:3000,http://54.123.45.67

# If wrong, fix it:
cd ~/samadhan2/backend
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
nano .env
# Update CORS_ORIGINS line, then:
pm2 restart samadhan-backend
```

---

## 🔄 Update/Redeploy After Code Changes

```bash
# SSH into EC2
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP

# Pull latest code
cd ~/samadhan2
git pull origin master

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart samadhan-backend

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart samadhan-frontend

# Check status
pm2 status
```

---

## 🛑 Stop Everything

```bash
# Stop all services
pm2 stop all

# Or stop individually
pm2 stop samadhan-backend
pm2 stop samadhan-frontend

# Stop MongoDB (optional)
sudo systemctl stop mongod
```

---

## 🗑️ Complete Cleanup (Start Fresh)

```bash
# Stop and delete PM2 processes
pm2 delete all

# Remove project
rm -rf ~/samadhan2

# Remove firebase credentials
rm -f ~/firebase-credentials.json

# Stop MongoDB (optional)
sudo systemctl stop mongod
```

---

## 📊 Monitor Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check PM2 monitoring
pm2 monit

# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB database
mongosh
> use support_tickets
> show collections
> db.tickets.countDocuments()
> exit
```

---

## 🔒 Security Hardening (Optional but Recommended)

```bash
# Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw enable

# Check firewall status
sudo ufw status

# Install fail2ban (prevents brute force)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📝 Quick Reference Card

### Essential Commands
| Task | Command |
|------|---------|
| SSH to EC2 | `ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP` |
| Check services | `pm2 status` |
| View logs | `pm2 logs` |
| Restart all | `pm2 restart all` |
| Stop all | `pm2 stop all` |
| Check MongoDB | `sudo systemctl status mongod` |
| Get EC2 IP | `curl http://169.254.169.254/latest/meta-data/public-ipv4` |

### Important Paths
| Item | Path |
|------|------|
| Project root | `~/samadhan2/` |
| Backend | `~/samadhan2/backend/` |
| Frontend | `~/samadhan2/frontend/` |
| Backend .env | `~/samadhan2/backend/.env` |
| Frontend .env | `~/samadhan2/frontend/.env` |
| Firebase creds | `~/samadhan2/backend/firebase-credentials.json` |

### URLs (Replace with your EC2 IP)
| Service | URL |
|---------|-----|
| Frontend | `http://YOUR_EC2_IP:3000` |
| Backend | `http://YOUR_EC2_IP:8000` |
| API Docs | `http://YOUR_EC2_IP:8000/docs` |
| Health Check | `http://YOUR_EC2_IP:8000/health` |

---

## 🎯 Complete Deployment Script (All-in-One)

Save this as `deploy.sh` on EC2:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Samadhan Deployment..."

# Get EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 IP: $EC2_IP"

# Backend
echo "📦 Setting up backend..."
cd ~/samadhan2/backend
source venv/bin/activate
pip install -r requirements.txt

cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=support_tickets
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
CORS_ORIGINS=http://$EC2_IP:3000,http://$EC2_IP
EOF

pm2 restart samadhan-backend || pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name samadhan-backend --interpreter python3

# Frontend
echo "🎨 Setting up frontend..."
cd ~/samadhan2/frontend
npm install

cat > .env << EOF
REACT_APP_API_URL=http://$EC2_IP:8000
REACT_APP_FIREBASE_API_KEY=AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c
REACT_APP_FIREBASE_AUTH_DOMAIN=samadhan-562bd.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=samadhan-562bd
REACT_APP_FIREBASE_STORAGE_BUCKET=samadhan-562bd.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=159400401099
REACT_APP_FIREBASE_APP_ID=1:159400401099:web:5d22e0dfb81d8fe2e1634e
EOF

npm run build
pm2 restart samadhan-frontend || pm2 serve build 3000 --name samadhan-frontend --spa

# Save PM2
pm2 save

echo "✅ Deployment complete!"
echo "==================================="
echo "Frontend: http://$EC2_IP:3000"
echo "Backend:  http://$EC2_IP:8000"
echo "API Docs: http://$EC2_IP:8000/docs"
echo "==================================="
pm2 status
```

**Usage**:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ⏱️ Total Deployment Time

| Step | Time |
|------|------|
| Install dependencies | 5-10 min |
| Clone repository | 1 min |
| Setup backend | 2-3 min |
| Setup frontend | 3-5 min |
| Start services | 1 min |
| **Total** | **12-20 minutes** |

---

## ✅ Success Checklist

After deployment, verify:
- [ ] `pm2 status` shows both services running
- [ ] `curl http://localhost:8000/health` returns `{"status":"ok"}`
- [ ] Frontend loads in browser at `http://YOUR_EC2_IP:3000`
- [ ] Backend API docs accessible at `http://YOUR_EC2_IP:8000/docs`
- [ ] Can create an account and login
- [ ] Can create a ticket
- [ ] MongoDB is running: `sudo systemctl status mongod`

---

## 🎓 For Your Viva

**Mentor**: "Show me your deployed application."

**You**: 
1. Open browser to `http://YOUR_EC2_IP:3000`
2. Show the landing page
3. Create an account
4. Create a ticket
5. Show API docs at `http://YOUR_EC2_IP:8000/docs`
6. SSH into EC2 and run `pm2 status` to show services
7. Run `pm2 logs` to show real-time logs

**Impressive!** 🎯

---

**Good luck with your deployment! 🚀**
