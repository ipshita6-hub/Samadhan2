from fastapi import APIRouter, Depends, HTTPException, Header, Query, UploadFile, File
from database import get_db
from models import TicketCreate, TicketUpdate, CommentCreate, StudentTicketClose, NotificationRead, ReactionToggle
from datetime import datetime
from bson.objectid import ObjectId
import firebase_admin
from firebase_admin import auth as firebase_auth
from typing import Optional, List
import os
import uuid
import shutil
from services.ai_service import analyze_ticket

router = APIRouter()

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".doc", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# ─── Auth helpers ─────────────────────────────────────────────────────────────

def verify_firebase_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        token = authorization.split(" ")[1]
        return firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(decoded_token: dict, db):
    user = db.users.find_one({"uid": decoded_token["uid"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_admin(decoded_token: dict, db):
    user = get_current_user(decoded_token, db)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ─── Serializers ──────────────────────────────────────────────────────────────

def serialize_ticket(t, db=None):
    user_info = {}
    if db is not None and t.get("user_id"):
        try:
            u = db.users.find_one({"_id": ObjectId(t["user_id"])})
            if u:
                user_info = {
                    "student_name": u.get("full_name", ""),
                    "student_email": u.get("email", ""),
                }
        except Exception:
            pass

    return {
        "id": str(t["_id"]),
        "user_id": t.get("user_id", ""),
        "title": t.get("title", ""),
        "description": t.get("description", ""),
        "status": t.get("status", "open"),
        "priority": t.get("priority", "medium"),
        "category": t.get("category", ""),
        "course": t.get("course"),
        "assigned_to": t.get("assigned_to"),
        "comment_count": t.get("comment_count", 0),
        "has_unread": t.get("has_unread", False),
        "attachments": t.get("attachments", []),
        "ai_analysis": t.get("ai_analysis"),
        "created_at": t.get("created_at", datetime.utcnow()).isoformat() + "Z",
        "updated_at": t.get("updated_at", datetime.utcnow()).isoformat() + "Z",
        **user_info,
    }

def serialize_comment(c):
    return {
        "id": str(c["_id"]),
        "ticket_id": c.get("ticket_id", ""),
        "user_id": c.get("user_id", ""),
        "author_name": c.get("author_name", ""),
        "author_role": c.get("author_role", "student"),
        "text": c.get("text", ""),
        "is_internal": c.get("is_internal", False),
        "reactions": c.get("reactions", {}),
        "created_at": c.get("created_at", datetime.utcnow()).isoformat() + "Z",
    }

def serialize_notification(n):
    return {
        "id": str(n["_id"]),
        "user_id": n.get("user_id", ""),
        "ticket_id": n.get("ticket_id", ""),
        "ticket_title": n.get("ticket_title", ""),
        "message": n.get("message", ""),
        "type": n.get("type", "reply"),
        "read": n.get("read", False),
        "created_at": n.get("created_at", datetime.utcnow()).isoformat() + "Z",
    }

# ─── Notification helper ──────────────────────────────────────────────────────

def create_notification(db, user_id: str, ticket_id: str, ticket_title: str, message: str, notif_type: str = "reply"):
    """Insert a notification document for a user."""
    db.notifications.insert_one({
        "user_id": user_id,
        "ticket_id": ticket_id,
        "ticket_title": ticket_title,
        "message": message,
        "type": notif_type,
        "read": False,
        "created_at": datetime.utcnow(),
    })

# ─── Student: create ticket ───────────────────────────────────────────────────

@router.post("/")
async def create_ticket(
    ticket: TicketCreate,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)

    # ── AI analysis ──────────────────────────────────────────────────────────
    ai = analyze_ticket(ticket.title, ticket.description, ticket.category)
    # Use AI-suggested priority only if user left it at default "medium"
    final_priority = ticket.priority
    if ticket.priority == "medium" and ai["suggested_priority"] != "medium":
        final_priority = ai["suggested_priority"]

    ticket_doc = {
        "user_id": str(user["_id"]),
        "title": ticket.title,
        "description": ticket.description,
        "priority": final_priority,
        "category": ticket.category,
        "course": ticket.course or None,
        "status": "open",
        "assigned_to": None,
        "comment_count": 0,
        "attachments": [],
        "ai_analysis": ai,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = db.tickets.insert_one(ticket_doc)
    ticket_id = str(result.inserted_id)

    # Notify admins of new ticket
    admins = list(db.users.find({"role": "admin"}, {"_id": 1}))
    for admin in admins:
        create_notification(
            db,
            user_id=str(admin["_id"]),
            ticket_id=ticket_id,
            ticket_title=ticket.title,
            message=f"New ticket submitted by {user.get('full_name') or user.get('email')}: \"{ticket.title}\"",
            notif_type="new_ticket",
        )

    return {"id": ticket_id, "message": "Ticket created successfully", "ai_analysis": ai}

# ─── Get tickets (student sees own; admin sees all) with server-side pagination

@router.get("/")
async def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)

    query = {}
    if user["role"] != "admin":
        query["user_id"] = str(user["_id"])
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority
    if category and category != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]

    total = db.tickets.count_documents(query)
    skip = (page - 1) * limit
    tickets = list(db.tickets.find(query).sort("created_at", -1).skip(skip).limit(limit))

    # Attach comment counts
    for t in tickets:
        t["comment_count"] = db.comments.count_documents({"ticket_id": str(t["_id"]), "is_internal": {"$ne": True}})

    return {
        "tickets": [serialize_ticket(t, db) for t in tickets],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),  # ceiling division
    }

# ─── Student stats (for dashboard stat cards) ─────────────────────────────────

@router.get("/my/stats")
async def get_my_stats(
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    uid = str(user["_id"])

    return {
        "open":        db.tickets.count_documents({"user_id": uid, "status": "open"}),
        "in_progress": db.tickets.count_documents({"user_id": uid, "status": "in_progress"}),
        "resolved":    db.tickets.count_documents({"user_id": uid, "status": "resolved"}),
        "closed":      db.tickets.count_documents({"user_id": uid, "status": "closed"}),
        "total":       db.tickets.count_documents({"user_id": uid}),
        "unread":      db.notifications.count_documents({"user_id": uid, "read": False}),
    }

# ─── Admin: analytics stats ───────────────────────────────────────────────────

@router.get("/admin/stats")
async def get_admin_stats(
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    require_admin(decoded_token, db)

    total       = db.tickets.count_documents({})
    open_count  = db.tickets.count_documents({"status": "open"})
    in_progress = db.tickets.count_documents({"status": "in_progress"})
    resolved    = db.tickets.count_documents({"status": "resolved"})
    closed      = db.tickets.count_documents({"status": "closed"})

    categories = {}
    for t in db.tickets.find({}, {"category": 1}):
        cat = t.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1

    priorities = {}
    for t in db.tickets.find({}, {"priority": 1}):
        p = t.get("priority", "medium")
        priorities[p] = priorities.get(p, 0) + 1

    pipeline = [
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_students = []
    for entry in list(db.tickets.aggregate(pipeline)):
        try:
            u = db.users.find_one({"_id": ObjectId(entry["_id"])})
            if u:
                top_students.append({
                    "name": u.get("full_name", u.get("email", "Unknown")),
                    "email": u.get("email", ""),
                    "tickets": entry["count"],
                })
        except Exception:
            pass

    resolution_rate = round((resolved / total * 100) if total > 0 else 0, 1)

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "closed": closed,
        "resolution_rate": resolution_rate,
        "by_category": categories,
        "by_priority": priorities,
        "top_students": top_students,
    }

# ─── Notifications (must be before /{ticket_id} to avoid route conflict) ──────

@router.get("/notifications/all")
async def get_notifications(
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    notifs = list(
        db.notifications.find({"user_id": str(user["_id"])})
        .sort("created_at", -1)
        .limit(50)
    )
    unread_count = db.notifications.count_documents({"user_id": str(user["_id"]), "read": False})
    return {
        "notifications": [serialize_notification(n) for n in notifs],
        "unread_count": unread_count,
    }

@router.patch("/notifications/read")
async def mark_notifications_read(
    body: NotificationRead,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    ids = [ObjectId(nid) for nid in body.notification_ids if ObjectId.is_valid(nid)]
    if ids:
        db.notifications.update_many(
            {"_id": {"$in": ids}, "user_id": str(user["_id"])},
            {"$set": {"read": True}},
        )
    return {"message": "Marked as read"}

@router.patch("/notifications/read-all")
async def mark_all_notifications_read(
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    db.notifications.update_many(
        {"user_id": str(user["_id"]), "read": False},
        {"$set": {"read": True}},
    )
    return {"message": "All notifications marked as read"}

# ─── Upload attachments to a ticket ──────────────────────────────────────────

@router.post("/{ticket_id}/attachments")
async def upload_attachments(
    ticket_id: str,
    files: List[UploadFile] = File(...),
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if user["role"] != "admin" and ticket["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    os.makedirs(UPLOADS_DIR, exist_ok=True)
    saved = []
    for file in files:
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed")
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File '{file.filename}' exceeds 10 MB limit")
        file_id = str(uuid.uuid4())
        stored_name = f"{file_id}{ext}"
        dest = os.path.join(UPLOADS_DIR, stored_name)
        with open(dest, "wb") as f:
            f.write(content)
        saved.append({
            "file_id": file_id,
            "filename": file.filename,
            "stored_name": stored_name,
            "content_type": file.content_type or "application/octet-stream",
            "size": len(content),
            "url": f"/uploads/{stored_name}",
            "uploaded_at": datetime.utcnow().isoformat() + "Z",
        })

    db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$push": {"attachments": {"$each": saved}}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return {"attachments": saved}


@router.delete("/{ticket_id}/attachments/{file_id}")
async def delete_attachment(
    ticket_id: str,
    file_id: str,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if user["role"] != "admin" and ticket["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    attachment = next((a for a in ticket.get("attachments", []) if a["file_id"] == file_id), None)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Remove file from disk
    dest = os.path.join(UPLOADS_DIR, attachment["stored_name"])
    if os.path.exists(dest):
        os.remove(dest)

    db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$pull": {"attachments": {"file_id": file_id}}, "$set": {"updated_at": datetime.utcnow()}},
    )
    return {"message": "Attachment deleted"}


# ─── Get single ticket ────────────────────────────────────────────────────────

@router.get("/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    user = get_current_user(decoded_token, db)

    if user["role"] != "admin" and ticket["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    # Mark notifications for this ticket as read
    db.notifications.update_many(
        {"user_id": str(user["_id"]), "ticket_id": ticket_id, "read": False},
        {"$set": {"read": True}},
    )

    comment_query = {"ticket_id": ticket_id}
    if user["role"] != "admin":
        comment_query["is_internal"] = {"$ne": True}
    comments = list(db.comments.find(comment_query).sort("created_at", 1))

    student_info = {}
    try:
        student = db.users.find_one({"_id": ObjectId(ticket["user_id"])})
        if student:
            student_info = {
                "student_name": student.get("full_name", ""),
                "student_email": student.get("email", ""),
                "student_id": str(student["_id"]),
                "student_total_tickets": db.tickets.count_documents({"user_id": ticket["user_id"]}),
                "student_open_tickets": db.tickets.count_documents({"user_id": ticket["user_id"], "status": "open"}),
            }
    except Exception:
        pass

    return {
        **serialize_ticket(ticket),
        **student_info,
        "comments": [serialize_comment(c) for c in comments],
    }

# ─── Student: close own ticket ────────────────────────────────────────────────

@router.patch("/{ticket_id}/close")
async def close_ticket(
    ticket_id: str,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    if ticket["status"] == "closed":
        raise HTTPException(status_code=400, detail="Ticket is already closed")

    db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": "closed", "updated_at": datetime.utcnow()}},
    )
    return {"message": "Ticket closed"}

# ─── Student: reopen own resolved/closed ticket ───────────────────────────────

@router.patch("/{ticket_id}/reopen")
async def reopen_ticket(
    ticket_id: str,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    if ticket["status"] not in ("resolved", "closed"):
        raise HTTPException(status_code=400, detail="Only resolved or closed tickets can be reopened")

    db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"status": "open", "updated_at": datetime.utcnow()}},
    )

    # Notify admins
    admins = list(db.users.find({"role": "admin"}, {"_id": 1}))
    for admin in admins:
        create_notification(
            db,
            user_id=str(admin["_id"]),
            ticket_id=ticket_id,
            ticket_title=ticket.get("title", ""),
            message=f"{user.get('full_name') or user.get('email')} reopened ticket: \"{ticket.get('title', '')}\"",
            notif_type="reopened",
        )

    return {"message": "Ticket reopened"}

# ─── Admin: update ticket ─────────────────────────────────────────────────────

@router.patch("/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    update: TicketUpdate,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    admin = require_admin(decoded_token, db)
    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    db.tickets.update_one({"_id": ObjectId(ticket_id)}, {"$set": update_data})

    # Notify student if status changed
    if update.status and update.status != ticket.get("status"):
        status_label = update.status.replace("_", " ").title()
        create_notification(
            db,
            user_id=ticket["user_id"],
            ticket_id=ticket_id,
            ticket_title=ticket.get("title", ""),
            message=f"Your ticket \"{ticket.get('title', '')}\" status changed to {status_label}.",
            notif_type="status_change",
        )
        # Broadcast status change via WebSocket
        from routes.websocket import manager
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(manager.broadcast_all(ticket_id, {
                    "type": "ticket_updated",
                    "status": update.status,
                    "assigned_to": update.assigned_to,
                }))
        except Exception:
            pass

    return {"message": "Ticket updated successfully"}

# ─── Add comment / reply ──────────────────────────────────────────────────────

@router.post("/{ticket_id}/comments")
async def add_comment(
    ticket_id: str,
    comment: CommentCreate,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)

    try:
        ticket = db.tickets.find_one({"_id": ObjectId(ticket_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Students can only comment on their own tickets
    if user["role"] != "admin" and ticket["user_id"] != str(user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    is_internal = comment.is_internal and user.get("role") == "admin"

    comment_doc = {
        "ticket_id": ticket_id,
        "user_id": str(user["_id"]),
        "author_name": user.get("full_name") or user.get("email", ""),
        "author_role": user.get("role", "student"),
        "text": comment.text,
        "is_internal": is_internal,
        "created_at": datetime.utcnow(),
    }
    result = db.comments.insert_one(comment_doc)

    # Increment comment_count on ticket
    db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": {"updated_at": datetime.utcnow()}, "$inc": {"comment_count": 1}},
    )

    # Notify the other party
    if user["role"] == "admin" and not is_internal:
        # Admin replied → notify student
        create_notification(
            db,
            user_id=ticket["user_id"],
            ticket_id=ticket_id,
            ticket_title=ticket.get("title", ""),
            message=f"{user.get('full_name') or 'Support'} replied to your ticket: \"{ticket.get('title', '')}\"",
            notif_type="reply",
        )
    elif user["role"] == "student":
        # Student replied → notify assigned admin or all admins
        notify_uid = None
        if ticket.get("assigned_to"):
            admin_user = db.users.find_one({"full_name": ticket["assigned_to"], "role": "admin"})
            if admin_user:
                notify_uid = str(admin_user["_id"])
        if not notify_uid:
            admin_user = db.users.find_one({"role": "admin"})
            if admin_user:
                notify_uid = str(admin_user["_id"])
        if notify_uid:
            create_notification(
                db,
                user_id=notify_uid,
                ticket_id=ticket_id,
                ticket_title=ticket.get("title", ""),
                message=f"{user.get('full_name') or user.get('email')} replied on ticket: \"{ticket.get('title', '')}\"",
                notif_type="student_reply",
            )

    # ── Broadcast via WebSocket ───────────────────────────────────────────────
    from routes.websocket import manager
    new_comment = {
        "id": str(result.inserted_id),
        "ticket_id": ticket_id,
        "user_id": str(user["_id"]),
        "author_name": comment_doc["author_name"],
        "author_role": comment_doc["author_role"],
        "text": comment_doc["text"],
        "is_internal": is_internal,
        "reactions": {},
        "created_at": comment_doc["created_at"].isoformat() + "Z",
    }
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(manager.broadcast_all(ticket_id, {
                "type": "new_comment",
                "comment": new_comment,
            }))
    except Exception:
        pass

    return {"id": str(result.inserted_id), "message": "Comment added", "comment": new_comment}

# ─── React to a comment ───────────────────────────────────────────────────────

@router.post("/{ticket_id}/comments/{comment_id}/react")
async def react_to_comment(
    ticket_id: str,
    comment_id: str,
    body: ReactionToggle,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    user = get_current_user(decoded_token, db)
    uid = decoded_token["uid"]  # Firebase UID — consistent with frontend user.uid

    ALLOWED_EMOJIS = {"👍", "❤️", "😂", "😮", "😢", "🎉", "❤"}
    # Normalize: strip variation selector
    emoji = body.emoji.replace("\ufe0f", "")
    normalized_allowed = {e.replace("\ufe0f", "") for e in ALLOWED_EMOJIS}
    if emoji not in normalized_allowed:
        raise HTTPException(status_code=400, detail="Emoji not allowed")

    try:
        comment = db.comments.find_one({"_id": ObjectId(comment_id), "ticket_id": ticket_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid comment ID")
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    reactions = comment.get("reactions", {})
    users_for_emoji = reactions.get(emoji, [])

    if uid in users_for_emoji:
        users_for_emoji.remove(uid)
    else:
        users_for_emoji.append(uid)

    if users_for_emoji:
        reactions[emoji] = users_for_emoji
    else:
        reactions.pop(emoji, None)

    db.comments.update_one(
        {"_id": ObjectId(comment_id)},
        {"$set": {"reactions": reactions}},
    )

    return {"reactions": reactions}
