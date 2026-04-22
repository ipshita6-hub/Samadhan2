# 🚀 Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All features implemented
- [x] No console errors
- [x] No TypeScript/ESLint warnings
- [x] Code follows consistent style
- [x] Comments added where needed
- [x] No hardcoded credentials

### ✅ Testing
- [x] All 7 features tested manually
- [x] Dark mode tested
- [x] Mobile responsive tested
- [x] Cross-browser tested
- [x] API endpoints tested
- [x] Database queries optimized

### ✅ Security
- [x] Authentication required for all endpoints
- [x] Authorization checks implemented
- [x] Input validation in place
- [x] SQL injection prevention
- [x] XSS prevention (HTML sanitization)
- [x] CORS configured correctly
- [x] Environment variables used for secrets

### ✅ Performance
- [x] Database indexes added
- [x] API responses optimized
- [x] Frontend bundle size acceptable
- [x] Images optimized
- [x] Lazy loading implemented
- [x] Caching strategies in place

---

## Environment Setup

### Backend Environment Variables
Create `backend/.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/ticketing_db

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# App Settings
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
DEBUG=False
```

### Frontend Environment Variables
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Database Setup

### 1. Create Database
```bash
# PostgreSQL
createdb ticketing_db

# Or using psql
psql -U postgres
CREATE DATABASE ticketing_db;
```

### 2. Run Migrations
```bash
cd backend
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### 3. Seed Initial Data (Optional)
```bash
python seed.py
```

---

## Backend Deployment

### Option 1: Traditional Server (Ubuntu/Debian)

**1. Install Dependencies**:
```bash
sudo apt update
sudo apt install python3-pip python3-venv postgresql nginx
```

**2. Setup Application**:
```bash
cd /var/www/ticketing-system
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**3. Configure Systemd Service**:
Create `/etc/systemd/system/ticketing-backend.service`:
```ini
[Unit]
Description=Ticketing System Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/ticketing-system/backend
Environment="PATH=/var/www/ticketing-system/venv/bin"
ExecStart=/var/www/ticketing-system/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**4. Start Service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ticketing-backend
sudo systemctl start ticketing-backend
```

**5. Configure Nginx**:
Create `/etc/nginx/sites-available/ticketing-backend`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ticketing-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 2: Docker

**1. Create Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**2. Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/ticketing_db
    depends_on:
      - db
    volumes:
      - ./backend:/app
      - ./backend/uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ticketing_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**3. Deploy**:
```bash
docker-compose up -d
```

---

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
heroku login
heroku create ticketing-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

#### Railway
1. Connect GitHub repo
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

#### Render
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add PostgreSQL database
6. Deploy

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**1. Install Vercel CLI**:
```bash
npm install -g vercel
```

**2. Deploy**:
```bash
cd frontend
vercel
```

**3. Configure**:
- Set environment variables in Vercel dashboard
- Configure custom domain
- Enable automatic deployments from GitHub

---

### Option 2: Netlify

**1. Build**:
```bash
cd frontend
npm run build
```

**2. Deploy**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

---

### Option 3: Traditional Server (Nginx)

**1. Build**:
```bash
cd frontend
npm run build
```

**2. Copy to Server**:
```bash
scp -r build/* user@server:/var/www/ticketing-frontend/
```

**3. Configure Nginx**:
Create `/etc/nginx/sites-available/ticketing-frontend`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/ticketing-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://api.yourdomain.com;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ticketing-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
sudo certbot renew --dry-run
```

---

## Post-Deployment Verification

### Backend Health Check
```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

### Frontend Check
1. Visit https://yourdomain.com
2. Verify all pages load
3. Test login/signup
4. Create a test ticket
5. Test all 7 advanced features

### Database Check
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tickets;"
```

---

## Monitoring & Logging

### Backend Logs
```bash
# Systemd
sudo journalctl -u ticketing-backend -f

# Docker
docker-compose logs -f backend

# Heroku
heroku logs --tail
```

### Frontend Logs
- Check browser console
- Use Sentry for error tracking
- Monitor Vercel/Netlify logs

### Database Monitoring
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## Backup Strategy

### Database Backups
```bash
# Daily backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Automated with cron
0 2 * * * pg_dump $DATABASE_URL > /backups/ticketing_$(date +\%Y\%m\%d).sql
```

### File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session storage
- Use CDN for static assets

### Database Scaling
- Enable connection pooling
- Add read replicas
- Implement caching (Redis)
- Optimize queries with indexes

### Performance Optimization
- Enable gzip compression
- Minify CSS/JS
- Optimize images
- Use lazy loading
- Implement CDN

---

## Rollback Plan

### Backend Rollback
```bash
# Systemd
sudo systemctl stop ticketing-backend
cd /var/www/ticketing-system
git checkout previous-version
sudo systemctl start ticketing-backend

# Docker
docker-compose down
git checkout previous-version
docker-compose up -d

# Heroku
heroku rollback
```

### Frontend Rollback
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
cd /var/www/ticketing-frontend
git checkout previous-version
npm run build
```

---

## Support & Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check database performance weekly
- [ ] Review security updates monthly
- [ ] Backup database daily
- [ ] Test disaster recovery quarterly

### Update Process
1. Test updates in staging environment
2. Create database backup
3. Deploy backend updates
4. Deploy frontend updates
5. Verify all features working
6. Monitor for errors

---

## Emergency Contacts

- **System Admin**: admin@university.edu
- **Database Admin**: dba@university.edu
- **Security Team**: security@university.edu
- **On-Call Support**: +1-555-123-4567

---

## Success Criteria

Deployment is successful when:
- ✅ All pages load without errors
- ✅ Users can login/signup
- ✅ Tickets can be created
- ✅ All 7 advanced features work
- ✅ Dark mode works
- ✅ Mobile responsive
- ✅ SSL certificate valid
- ✅ Database backups configured
- ✅ Monitoring in place
- ✅ Error tracking enabled

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: 2.0.0
**Status**: ✅ READY FOR PRODUCTION
