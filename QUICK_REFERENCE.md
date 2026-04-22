# 🚀 Quick Reference Guide

## Start the Application

### Backend
```bash
cd backend
python main.py
```
**URL**: http://localhost:8000

### Frontend
```bash
cd frontend
npm start
```
**URL**: http://localhost:3000

---

## Default Credentials

### Admin Account
- **Email**: admin@university.edu
- **Password**: admin123

### Student Account
- **Email**: student@university.edu
- **Password**: student123

---

## 7 Advanced Features - Quick Access

### 1. Auto-categorization
**Where**: Create Ticket page  
**How**: Type ticket description, category auto-selects  
**Test**: "My laptop won't turn on" → Technical Support

### 2. Duplicate Detection
**Where**: After ticket submission  
**How**: System finds similar tickets automatically  
**Test**: Create 2 tickets with similar titles

### 3. Heatmap
**Where**: Admin → Analytics page  
**How**: Scroll down to see charts  
**Test**: Create tickets at different times

### 4. Satisfaction Rating
**Where**: Ticket Details (after resolution)  
**How**: Modal appears automatically  
**Test**: Resolve a ticket, refresh page

### 5. Estimated Response Time
**Where**: Create Ticket page (top banner)  
**How**: Shows automatically on page load  
**Test**: Visit create ticket page

### 6. Rich Text Editor
**Where**: All reply boxes  
**How**: Use toolbar to format text  
**Test**: Bold, italic, lists, code blocks

### 7. Bulk Actions
**Where**: Admin → All Tickets  
**How**: Select checkboxes, use bottom bar  
**Test**: Select 2+ tickets, click Resolve

---

## Common Tasks

### Create a Ticket
1. Login as student
2. Click "Create Ticket"
3. Fill form
4. Submit

### Respond to Ticket
1. Login as admin
2. Go to "All Tickets"
3. Click ticket
4. Type reply
5. Send

### Bulk Close Tickets
1. Login as admin
2. Go to "All Tickets"
3. Check multiple tickets
4. Click "Close" in bottom bar
5. Confirm

### View Analytics
1. Login as admin
2. Click "Analytics"
3. See metrics and charts

### Rate Support
1. Login as student
2. Open resolved ticket
3. Modal appears
4. Select emoji rating
5. Submit

---

## API Endpoints

### Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/{id}` - Get ticket details
- `PATCH /api/tickets/{id}` - Update ticket
- `POST /api/tickets/{id}/comments` - Add comment

### Advanced Features
- `GET /api/tickets/estimated-response-time` - Get avg response time
- `GET /api/tickets/admin/heatmap` - Get heatmap data
- `POST /api/tickets/{id}/satisfaction` - Submit rating
- `POST /api/tickets/bulk-action` - Bulk actions

### Stats
- `GET /api/tickets/admin/stats` - Admin statistics
- `GET /api/tickets/my/stats` - Student statistics

---

## File Locations

### Backend
- **Main App**: `backend/main.py`
- **Models**: `backend/models.py`
- **Routes**: `backend/routes/tickets.py`
- **AI Service**: `backend/services/ai_service.py`

### Frontend
- **Create Ticket**: `frontend/src/pages/CreateTicket.jsx`
- **Ticket Details**: `frontend/src/pages/TicketDetails.jsx`
- **Admin Tickets**: `frontend/src/pages/AdminTickets.jsx`
- **Analytics**: `frontend/src/pages/AdminAnalytics.jsx`
- **Rich Text Editor**: `frontend/src/components/RichTextEditor.jsx`

---

## Troubleshooting

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend won't start
```bash
cd frontend
npm install
npm start
```

### Database errors
```bash
# Check if PostgreSQL is running
psql -U postgres

# Recreate tables
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### Missing dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install react-quill recharts
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost/ticketing_db
FIREBASE_PROJECT_ID=your-project-id
OPENAI_API_KEY=sk-...
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

---

## Quick Commands

### Backend
```bash
# Start server
python main.py

# Run migrations
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"

# Seed data
python seed.py

# Check API
curl http://localhost:8000/health
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check for errors
npm run lint
```

---

## Feature Status

| Feature | Status | Location |
|---------|--------|----------|
| Auto-categorization | ✅ | CreateTicket.jsx |
| Duplicate Detection | ✅ | CreateTicket.jsx |
| Heatmap | ✅ | AdminAnalytics.jsx |
| Satisfaction Rating | ✅ | TicketDetails.jsx |
| Response Time | ✅ | CreateTicket.jsx |
| Rich Text Editor | ✅ | All reply boxes |
| Bulk Actions | ✅ | AdminTickets.jsx |

---

## Support

### Documentation
- `README.md` - Project overview
- `QUICK_START.md` - Getting started
- `FEATURES_OVERVIEW.md` - Feature list
- `TEST_ADVANCED_FEATURES.md` - Testing guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `PROJECT_COMPLETE.md` - Project summary

### Need Help?
1. Check documentation
2. Review code comments
3. Check browser console
4. Check backend logs
5. Search error messages

---

## Keyboard Shortcuts

### General
- `Ctrl/Cmd + K` - Search
- `Ctrl/Cmd + /` - Toggle theme
- `Esc` - Close modals

### Rich Text Editor
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + K` - Insert link

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

---

## Mobile Support

- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Responsive design
- ✅ Touch-friendly

---

## Performance Tips

### Backend
- Use database indexes
- Enable connection pooling
- Cache frequent queries
- Optimize slow queries

### Frontend
- Lazy load components
- Debounce API calls
- Use optimistic updates
- Minimize re-renders

---

## Security Checklist

- ✅ Authentication required
- ✅ Authorization checks
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CORS configured
- ✅ Environment variables

---

## Deployment URLs

### Development
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Production (Example)
- Backend: https://api.yourdomain.com
- Frontend: https://yourdomain.com

---

## Version Info

- **Version**: 2.0.0
- **Last Updated**: April 21, 2026
- **Status**: Production Ready
- **Features**: 21 total (14 core + 7 advanced)

---

**Quick Tip**: Bookmark this page for fast reference! 📌
