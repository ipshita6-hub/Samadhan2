# API Documentation

Complete API reference for the University Ticketing System backend.

**Base URL**: `http://localhost:8000`

---

## Authentication

All authenticated endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

---

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-22T10:30:00Z"
}
```

---

## Authentication Routes

### Register User

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "uid": "firebase-user-id",
  "email": "user@university.edu",
  "name": "John Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@university.edu",
  "name": "John Doe",
  "role": "student",
  "created_at": "2026-04-22T10:30:00Z"
}
```

### Get Current User

#### GET /api/auth/me
Get the currently authenticated user's information.

**Headers:** Requires authentication

**Response:**
```json
{
  "id": "user-id",
  "uid": "firebase-user-id",
  "email": "user@university.edu",
  "name": "John Doe",
  "role": "student",
  "created_at": "2026-04-22T10:30:00Z"
}
```

---

## Ticket Routes

### Create Ticket

#### POST /api/tickets/
Create a new support ticket.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "title": "Cannot access course materials",
  "description": "I'm unable to download the lecture slides",
  "category": "Technical Support",
  "priority": "medium",
  "course": "CS101"
}
```

**Response:**
```json
{
  "id": "ticket-id",
  "title": "Cannot access course materials",
  "description": "I'm unable to download the lecture slides",
  "category": "Technical Support",
  "priority": "medium",
  "status": "open",
  "student_id": "user-id",
  "ai_analysis": {
    "sentiment": "negative",
    "confidence": 0.85,
    "suggested_category": "Technical Support"
  },
  "created_at": "2026-04-22T10:30:00Z"
}
```

### List Tickets

#### GET /api/tickets/
Get list of tickets (filtered by role).

**Headers:** Requires authentication

**Query Parameters:**
- `status` (optional): Filter by status (open, in_progress, resolved, closed)
- `category` (optional): Filter by category
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `search` (optional): Search in title and description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "tickets": [
    {
      "id": "ticket-id",
      "title": "Cannot access course materials",
      "status": "open",
      "priority": "medium",
      "category": "Technical Support",
      "created_at": "2026-04-22T10:30:00Z",
      "student": {
        "name": "John Doe",
        "email": "john@university.edu"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 5
}
```

### Get Ticket Details

#### GET /api/tickets/{ticket_id}
Get detailed information about a specific ticket.

**Headers:** Requires authentication

**Response:**
```json
{
  "id": "ticket-id",
  "title": "Cannot access course materials",
  "description": "I'm unable to download the lecture slides",
  "category": "Technical Support",
  "priority": "medium",
  "status": "open",
  "student_id": "user-id",
  "assigned_to": "admin-id",
  "comments": [
    {
      "id": "comment-id",
      "content": "We're looking into this issue",
      "author": {
        "name": "Admin User",
        "role": "admin"
      },
      "is_internal": false,
      "reactions": {
        "👍": 2,
        "❤️": 1
      },
      "created_at": "2026-04-22T11:00:00Z"
    }
  ],
  "attachments": [
    {
      "id": "file-id",
      "filename": "screenshot.png",
      "url": "/uploads/screenshot.png",
      "size": 102400
    }
  ],
  "created_at": "2026-04-22T10:30:00Z",
  "updated_at": "2026-04-22T11:00:00Z"
}
```

### Update Ticket

#### PATCH /api/tickets/{ticket_id}
Update ticket details (admin only).

**Headers:** Requires authentication (admin)

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "assigned_to": "admin-id"
}
```

**Response:**
```json
{
  "id": "ticket-id",
  "status": "in_progress",
  "priority": "high",
  "assigned_to": "admin-id",
  "updated_at": "2026-04-22T11:30:00Z"
}
```

### Close Ticket

#### PATCH /api/tickets/{ticket_id}/close
Close a ticket (student can close their own tickets).

**Headers:** Requires authentication

**Response:**
```json
{
  "id": "ticket-id",
  "status": "closed",
  "closed_at": "2026-04-22T12:00:00Z"
}
```

### Reopen Ticket

#### PATCH /api/tickets/{ticket_id}/reopen
Reopen a closed ticket.

**Headers:** Requires authentication

**Response:**
```json
{
  "id": "ticket-id",
  "status": "open",
  "reopened_at": "2026-04-22T12:30:00Z"
}
```

### Add Comment

#### POST /api/tickets/{ticket_id}/comments
Add a comment to a ticket.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "content": "<p>This is a <strong>rich text</strong> comment</p>",
  "is_internal": false
}
```

**Response:**
```json
{
  "id": "comment-id",
  "ticket_id": "ticket-id",
  "content": "<p>This is a <strong>rich text</strong> comment</p>",
  "author_id": "user-id",
  "is_internal": false,
  "created_at": "2026-04-22T13:00:00Z"
}
```

### Add Reaction

#### POST /api/tickets/{ticket_id}/comments/{comment_id}/react
Add an emoji reaction to a comment.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "comment_id": "comment-id",
  "emoji": "👍",
  "count": 3
}
```

### Upload Attachment

#### POST /api/tickets/{ticket_id}/attachments
Upload a file attachment to a ticket.

**Headers:** Requires authentication

**Request:** Multipart form data
- `file`: File to upload (max 10MB)

**Response:**
```json
{
  "id": "file-id",
  "filename": "document.pdf",
  "url": "/uploads/document.pdf",
  "size": 204800,
  "uploaded_at": "2026-04-22T13:30:00Z"
}
```

### Delete Attachment

#### DELETE /api/tickets/{ticket_id}/attachments/{file_id}
Delete a file attachment.

**Headers:** Requires authentication

**Response:**
```json
{
  "message": "Attachment deleted successfully"
}
```

### Student Dashboard Stats

#### GET /api/tickets/my/stats
Get statistics for the current student's tickets.

**Headers:** Requires authentication (student)

**Response:**
```json
{
  "total": 15,
  "open": 3,
  "in_progress": 2,
  "resolved": 8,
  "closed": 2,
  "avg_resolution_time": "2.5 days"
}
```

### Admin Dashboard Stats

#### GET /api/tickets/admin/stats
Get system-wide statistics (admin only).

**Headers:** Requires authentication (admin)

**Response:**
```json
{
  "total_tickets": 150,
  "open_tickets": 25,
  "in_progress_tickets": 30,
  "resolved_tickets": 80,
  "closed_tickets": 15,
  "resolution_rate": 85.5,
  "avg_resolution_time": "1.8 days",
  "tickets_by_category": {
    "Technical Support": 60,
    "Academic": 45,
    "Financial": 25,
    "Administrative": 20
  },
  "tickets_by_priority": {
    "low": 40,
    "medium": 70,
    "high": 30,
    "urgent": 10
  }
}
```

### Admin Heatmap Data

#### GET /api/tickets/admin/heatmap
Get heatmap data for ticket creation patterns.

**Headers:** Requires authentication (admin)

**Response:**
```json
{
  "by_hour": [
    {"hour": 0, "count": 2},
    {"hour": 1, "count": 1},
    {"hour": 9, "count": 15},
    {"hour": 14, "count": 20}
  ],
  "by_day": [
    {"day": "Monday", "count": 25},
    {"day": "Tuesday", "count": 30},
    {"day": "Wednesday", "count": 28}
  ]
}
```

### Estimated Response Time

#### GET /api/tickets/estimated-response-time
Get estimated response time based on historical data.

**Response:**
```json
{
  "estimated_hours": 4.5,
  "estimated_text": "~4-5 hours"
}
```

### Bulk Actions

#### POST /api/tickets/bulk-action
Perform bulk actions on multiple tickets (admin only).

**Headers:** Requires authentication (admin)

**Request Body:**
```json
{
  "ticket_ids": ["ticket-id-1", "ticket-id-2", "ticket-id-3"],
  "action": "resolve"
}
```

**Actions:** `resolve`, `close`, `delete`

**Response:**
```json
{
  "success": true,
  "affected": 3,
  "message": "3 tickets resolved successfully"
}
```

### Submit Satisfaction Rating

#### POST /api/tickets/{ticket_id}/satisfaction
Submit a satisfaction rating for a resolved ticket.

**Headers:** Requires authentication (student)

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Great support, issue resolved quickly!"
}
```

**Response:**
```json
{
  "ticket_id": "ticket-id",
  "rating": 5,
  "feedback": "Great support, issue resolved quickly!",
  "submitted_at": "2026-04-22T14:00:00Z"
}
```

---

## Notification Routes

### Get All Notifications

#### GET /api/tickets/notifications/all
Get all notifications for the current user.

**Headers:** Requires authentication

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif-id",
      "type": "ticket_update",
      "title": "Ticket Updated",
      "message": "Your ticket status changed to In Progress",
      "ticket_id": "ticket-id",
      "is_read": false,
      "created_at": "2026-04-22T14:30:00Z"
    }
  ],
  "unread_count": 3
}
```

### Mark Notification as Read

#### PATCH /api/tickets/notifications/read
Mark a specific notification as read.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "notification_id": "notif-id"
}
```

**Response:**
```json
{
  "success": true
}
```

### Mark All Notifications as Read

#### PATCH /api/tickets/notifications/read-all
Mark all notifications as read.

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "marked": 5
}
```

---

## FAQ Routes

### Search FAQs

#### GET /api/faq/search
Search the FAQ knowledge base.

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category

**Response:**
```json
{
  "results": [
    {
      "question": "How do I reset my password?",
      "answer": "Click on 'Forgot Password' on the login page...",
      "category": "Account",
      "relevance_score": 0.95
    }
  ]
}
```

---

## Settings Routes

### Get Settings

#### GET /api/settings/
Get system settings (admin only).

**Headers:** Requires authentication (admin)

**Response:**
```json
{
  "site_name": "University Support",
  "email_notifications": true,
  "sla_warning_hours": 20,
  "sla_breach_hours": 48,
  "auto_close_days": 7
}
```

### Update Settings

#### PATCH /api/settings/
Update system settings (admin only).

**Headers:** Requires authentication (admin)

**Request Body:**
```json
{
  "email_notifications": false,
  "sla_warning_hours": 24
}
```

**Response:**
```json
{
  "site_name": "University Support",
  "email_notifications": false,
  "sla_warning_hours": 24,
  "sla_breach_hours": 48,
  "updated_at": "2026-04-22T15:00:00Z"
}
```

### Get Admin Users

#### GET /api/settings/admins
Get list of admin users.

**Headers:** Requires authentication (admin)

**Response:**
```json
{
  "admins": [
    {
      "id": "admin-id",
      "name": "Admin User",
      "email": "admin@university.edu",
      "role": "admin"
    }
  ]
}
```

---

## WebSocket

### Connect to Ticket Updates

#### WS /ws/ticket/{ticket_id}?token={firebase-token}
Connect to real-time updates for a specific ticket.

**Messages Received:**
```json
{
  "type": "comment_added",
  "data": {
    "comment_id": "comment-id",
    "content": "New comment",
    "author": "Admin User"
  }
}
```

```json
{
  "type": "status_changed",
  "data": {
    "old_status": "open",
    "new_status": "in_progress"
  }
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **WebSocket connections**: 5 concurrent connections per user

---

## Data Models

### Ticket Status
- `open` - Newly created ticket
- `in_progress` - Admin is working on it
- `resolved` - Issue resolved, awaiting confirmation
- `closed` - Ticket closed

### Priority Levels
- `low` - Non-urgent issues
- `medium` - Standard priority
- `high` - Important issues
- `urgent` - Critical issues requiring immediate attention

### Categories
- `Technical Support` - Technical issues
- `Academic` - Course-related questions
- `Financial` - Billing and payments
- `Administrative` - General admin queries

---

For more information, see the [README.md](README.md) file.
