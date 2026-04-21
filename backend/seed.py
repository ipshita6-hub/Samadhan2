"""
Seed script — populates MongoDB with sample tickets and comments.

Strategy:
  - Preserves any REAL Firebase users already in the DB (uid not starting with *-uid-*)
  - Removes old placeholder seeded users and replaces them
  - Links seeded tickets to real users where email matches, otherwise uses placeholder users
  - Safe to re-run at any time

Run:  python seed.py
"""
from database import get_db
from datetime import datetime, timedelta
import random

db = get_db()
now = datetime.utcnow()

# ── Preserve real Firebase users, wipe placeholder seed users ─────────────────
real_users = list(db.users.find({"uid": {"$not": {"$regex": "^(admin|student)-uid-"}}}))
print(f"Found {len(real_users)} real Firebase user(s) — preserving them.")

# Remove duplicate real users (keep the most recent per email)
seen_emails = {}
for u in real_users:
    email = u.get("email", "")
    if email not in seen_emails:
        seen_emails[email] = u
    else:
        # Keep the one with the real-looking UID (longer)
        existing = seen_emails[email]
        if len(u.get("uid", "")) > len(existing.get("uid", "")):
            db.users.delete_one({"_id": existing["_id"]})
            seen_emails[email] = u
        else:
            db.users.delete_one({"_id": u["_id"]})

real_users = list(db.users.find({"uid": {"$not": {"$regex": "^(admin|student)-uid-"}}}))
real_emails = {u["email"]: u for u in real_users}
print(f"After dedup: {len(real_users)} real user(s): {[u['email'] for u in real_users]}")

# Wipe placeholder seed data
db.users.delete_many({"uid": {"$regex": "^(admin|student)-uid-"}})
db.tickets.delete_many({})
db.comments.delete_many({})
db.notifications.delete_many({})
print("Cleared placeholder users, tickets, comments, notifications.")

# ── Seed users (placeholders for anyone not already signed up) ────────────────
seed_users = [
    {"uid": "admin-uid-001",   "email": "admin@university.edu",            "full_name": "John Admin",       "role": "admin",   "created_at": now - timedelta(days=90)},
    {"uid": "admin-uid-002",   "email": "sarah.admin@university.edu",      "full_name": "Sarah Support",    "role": "admin",   "created_at": now - timedelta(days=90)},
    {"uid": "student-uid-001", "email": "sarah.johnson@university.edu",    "full_name": "Sarah Johnson",    "role": "student", "created_at": now - timedelta(days=30)},
    {"uid": "student-uid-002", "email": "michael.chen@university.edu",     "full_name": "Michael Chen",     "role": "student", "created_at": now - timedelta(days=25)},
    {"uid": "student-uid-003", "email": "emily.rodriguez@university.edu",  "full_name": "Emily Rodriguez",  "role": "student", "created_at": now - timedelta(days=20)},
    {"uid": "student-uid-004", "email": "david.kim@university.edu",        "full_name": "David Kim",        "role": "student", "created_at": now - timedelta(days=15)},
    {"uid": "student-uid-005", "email": "lisa.wang@university.edu",        "full_name": "Lisa Wang",        "role": "student", "created_at": now - timedelta(days=10)},
    {"uid": "student-uid-006", "email": "james.patel@university.edu",      "full_name": "James Patel",      "role": "student", "created_at": now - timedelta(days=8)},
    {"uid": "student-uid-007", "email": "priya.sharma@university.edu",     "full_name": "Priya Sharma",     "role": "student", "created_at": now - timedelta(days=5)},
]

# Only insert placeholder if no real user exists with that email
inserted_users = []
for su in seed_users:
    if su["email"] in real_emails:
        # Use the real Firebase user instead
        inserted_users.append(real_emails[su["email"]])
        print(f"  Using real user for {su['email']}")
    else:
        result = db.users.insert_one(su)
        su["_id"] = result.inserted_id
        inserted_users.append(su)

# Build email → ObjectId map
email_to_oid = {u["email"]: str(u["_id"]) for u in inserted_users}
print(f"User map ready for {len(email_to_oid)} accounts.")

# ── Tickets ───────────────────────────────────────────────────────────────────
tickets_raw = [
    {
        "email": "sarah.johnson@university.edu",
        "title": "Unable to access course materials for CS101",
        "description": "I'm trying to download the lecture slides for Week 5 but keep getting an 'Access Denied' error. I've tried Chrome, Firefox, and Safari. Other students seem to be able to access them fine. This is urgent as I have an exam tomorrow.",
        "priority": "high", "category": "Technical Support", "course": "CS101 - Introduction to Programming",
        "status": "in_progress", "assigned_to": "John Admin", "days_ago": 2,
    },
    {
        "email": "sarah.johnson@university.edu",
        "title": "Duplicate charge on semester tuition payment",
        "description": "My bank statement shows I was charged twice for the semester tuition on the 1st. Both charges are $4,250. I need a refund for the duplicate charge as soon as possible.",
        "priority": "urgent", "category": "Financial", "course": None,
        "status": "in_progress", "assigned_to": "Sarah Support", "days_ago": 4,
    },
    {
        "email": "michael.chen@university.edu",
        "title": "Assignment deadline extension request — MAT201",
        "description": "I have a family emergency and need to request a deadline extension for the MAT201 midterm assignment due this Friday. I have documentation from the hospital and can provide it upon request.",
        "priority": "medium", "category": "Academic", "course": "MAT201 - Calculus II",
        "status": "open", "assigned_to": None, "days_ago": 1,
    },
    {
        "email": "michael.chen@university.edu",
        "title": "CS202 Zoom lecture link not working",
        "description": "The Zoom link provided for CS202 online lectures gives a 'meeting not found' error. This has happened for the last two sessions and I'm missing class content.",
        "priority": "high", "category": "Technical Support", "course": "CS202 - Data Structures",
        "status": "resolved", "assigned_to": "John Admin", "days_ago": 7,
    },
    {
        "email": "emily.rodriguez@university.edu",
        "title": "Student portal login keeps locking my account",
        "description": "My account gets locked after a single login attempt. I've reset my password three times this week but the issue happens every morning. I'm unable to access any of my course materials.",
        "priority": "high", "category": "Technical Support", "course": None,
        "status": "resolved", "assigned_to": "Sarah Support", "days_ago": 5,
    },
    {
        "email": "emily.rodriguez@university.edu",
        "title": "Official transcript request — urgent for job application",
        "description": "I need an official transcript sent to Google by end of this week for a job offer. I submitted the request 10 days ago but haven't received any confirmation or update.",
        "priority": "urgent", "category": "Administrative", "course": None,
        "status": "closed", "assigned_to": "Sarah Support", "days_ago": 10,
    },
    {
        "email": "david.kim@university.edu",
        "title": "Grade inquiry — PHYS301 midterm exam",
        "description": "I believe there may be an error in my exam grading. Question 4 on the midterm — my answer matches the textbook solution on page 312 but was marked incorrect. I'd appreciate a review.",
        "priority": "medium", "category": "Academic", "course": "PHY201 - Physics I",
        "status": "open", "assigned_to": None, "days_ago": 3,
    },
    {
        "email": "david.kim@university.edu",
        "title": "CHEM401 lab equipment booking portal showing 500 error",
        "description": "The online lab booking portal has been showing a 500 Internal Server Error since Monday. I need to book time for my CHEM401 project which is due next week.",
        "priority": "medium", "category": "Technical Support", "course": "CHEM401 - Organic Chemistry",
        "status": "open", "assigned_to": None, "days_ago": 2,
    },
    {
        "email": "lisa.wang@university.edu",
        "title": "Merit scholarship application form timing out",
        "description": "The online scholarship application form keeps timing out before I can submit. I've been trying for 3 days and the deadline is next week. I've tried on multiple devices and networks.",
        "priority": "low", "category": "Financial", "course": None,
        "status": "open", "assigned_to": None, "days_ago": 6,
    },
    {
        "email": "lisa.wang@university.edu",
        "title": "Financial aid disbursement delayed — rent due",
        "description": "My financial aid was supposed to be disbursed on the 15th but I still haven't received it. My rent is due and I'm in a difficult financial situation. Please advise on the status.",
        "priority": "urgent", "category": "Financial", "course": None,
        "status": "in_progress", "assigned_to": "John Admin", "days_ago": 3,
    },
    {
        "email": "james.patel@university.edu",
        "title": "Course enrollment error — ENG301 missing from my schedule",
        "description": "I registered for ENG301 during open enrollment but it's not appearing in my course list. I have the confirmation email with the registration number but the class doesn't show up in my portal.",
        "priority": "high", "category": "Administrative", "course": "ENG102 - English Composition",
        "status": "in_progress", "assigned_to": "John Admin", "days_ago": 1,
    },
    {
        "email": "james.patel@university.edu",
        "title": "Cannot submit ENG301 assignment — upload button disabled",
        "description": "The assignment submission portal for ENG301 has the upload button greyed out. The deadline is tomorrow and I cannot submit my paper. I've tried on Chrome and Edge.",
        "priority": "high", "category": "Technical Support", "course": "ENG102 - English Composition",
        "status": "open", "assigned_to": None, "days_ago": 0,
    },
    {
        "email": "priya.sharma@university.edu",
        "title": "Off-campus library database access not working",
        "description": "I cannot access JSTOR or any library databases from off-campus. The VPN connects fine but the databases say my institution credentials are invalid. I need access for my research paper due next week.",
        "priority": "medium", "category": "Technical Support", "course": None,
        "status": "open", "assigned_to": None, "days_ago": 0,
    },
    {
        "email": "priya.sharma@university.edu",
        "title": "Request for accommodation letter — learning disability",
        "description": "I need an official accommodation letter for my learning disability to present to my professors for extended exam time. I registered with the disability office last semester but haven't received the letter yet.",
        "priority": "medium", "category": "Administrative", "course": None,
        "status": "open", "assigned_to": None, "days_ago": 4,
    },
]

ticket_ids = []
for t in tickets_raw:
    user_oid = email_to_oid.get(t["email"])
    if not user_oid:
        print(f"  WARNING: no user found for {t['email']}, skipping ticket.")
        ticket_ids.append(None)
        continue
    hrs = random.randint(0, 8)
    created = now - timedelta(days=t["days_ago"], hours=hrs)
    updated = created + timedelta(hours=random.randint(1, 6))
    # Set resolved_at for resolved/closed tickets (used by resolution time analytics)
    resolved_at = None
    if t["status"] in ("resolved", "closed"):
        resolved_at = created + timedelta(hours=random.randint(4, 36))
    doc = {
        "user_id": user_oid,
        "title": t["title"],
        "description": t["description"],
        "priority": t["priority"],
        "category": t["category"],
        "course": t.get("course"),
        "status": t["status"],
        "assigned_to": t["assigned_to"],
        "comment_count": 0,
        "resolved_at": resolved_at,
        "created_at": created,
        "updated_at": updated,
    }
    res = db.tickets.insert_one(doc)
    ticket_ids.append(str(res.inserted_id))

valid_ticket_ids = [tid for tid in ticket_ids if tid]
print(f"Inserted {len(valid_ticket_ids)} tickets.")

# ── Comments ──────────────────────────────────────────────────────────────────
def tid(idx):
    return ticket_ids[idx] if idx < len(ticket_ids) else None

admin1_oid = email_to_oid.get("admin@university.edu")
admin2_oid = email_to_oid.get("sarah.admin@university.edu")
sarah_oid  = email_to_oid.get("sarah.johnson@university.edu")
michael_oid = email_to_oid.get("michael.chen@university.edu")
emily_oid  = email_to_oid.get("emily.rodriguez@university.edu")

comments_raw = []

# Ticket 0 — sarah CS101 access (in_progress)
if tid(0) and admin1_oid and sarah_oid:
    comments_raw += [
        {"ticket_id": tid(0), "user_id": admin1_oid, "author_name": "John Admin", "author_role": "admin", "is_internal": False,
         "text": "Hi Sarah,\n\nI've received your ticket and I'm looking into the access permissions for CS101. I'll have an update for you within the hour.",
         "created_at": now - timedelta(hours=3)},
        {"ticket_id": tid(0), "user_id": sarah_oid, "author_name": "Sarah Johnson", "author_role": "student", "is_internal": False,
         "text": "Thank you for the quick response! Please let me know if you need any additional information from my end.",
         "created_at": now - timedelta(hours=2)},
        {"ticket_id": tid(0), "user_id": admin1_oid, "author_name": "John Admin", "author_role": "admin", "is_internal": True,
         "text": "Checked with IT — her account was accidentally removed from the CS101 group during the batch update. Re-adding now.",
         "created_at": now - timedelta(hours=1)},
    ]

# Ticket 1 — sarah duplicate charge (in_progress)
if tid(1) and admin2_oid and sarah_oid:
    comments_raw += [
        {"ticket_id": tid(1), "user_id": admin2_oid, "author_name": "Sarah Support", "author_role": "admin", "is_internal": False,
         "text": "Hi Sarah,\n\nI've confirmed the duplicate charge on our end. I've raised a refund request with the finance team. You should see the reversal within 3–5 business days.",
         "created_at": now - timedelta(days=3)},
        {"ticket_id": tid(1), "user_id": admin2_oid, "author_name": "Sarah Support", "author_role": "admin", "is_internal": True,
         "text": "Finance team confirmed — payment gateway glitch on the 1st affected ~12 students. Bulk refund being processed.",
         "created_at": now - timedelta(days=2)},
    ]

# Ticket 3 — michael Zoom resolved
if tid(3) and admin1_oid and michael_oid:
    comments_raw += [
        {"ticket_id": tid(3), "user_id": admin1_oid, "author_name": "John Admin", "author_role": "admin", "is_internal": False,
         "text": "Hi Michael,\n\nThe Zoom link has been updated. The professor accidentally shared an expired recurring link. The new link has been posted in the course portal.",
         "created_at": now - timedelta(days=6)},
        {"ticket_id": tid(3), "user_id": michael_oid, "author_name": "Michael Chen", "author_role": "student", "is_internal": False,
         "text": "Confirmed — the new link works. Thanks for sorting this out quickly!",
         "created_at": now - timedelta(days=6, hours=-3)},
    ]

# Ticket 4 — emily login resolved
if tid(4) and admin2_oid and emily_oid:
    comments_raw += [
        {"ticket_id": tid(4), "user_id": admin2_oid, "author_name": "Sarah Support", "author_role": "admin", "is_internal": False,
         "text": "Hi Emily,\n\nI've reset your account and disabled the auto-lock feature that was incorrectly triggering. Please try logging in now.",
         "created_at": now - timedelta(days=4)},
        {"ticket_id": tid(4), "user_id": emily_oid, "author_name": "Emily Rodriguez", "author_role": "student", "is_internal": False,
         "text": "It's working now! Thank you so much, I was really stressed about this.",
         "created_at": now - timedelta(days=3, hours=22)},
    ]

# Ticket 5 — emily transcript closed
if tid(5) and admin2_oid and emily_oid:
    comments_raw += [
        {"ticket_id": tid(5), "user_id": admin2_oid, "author_name": "Sarah Support", "author_role": "admin", "is_internal": False,
         "text": "Hi Emily,\n\nYour official transcript has been sent to Google via secure email. Please allow 1 business day for them to receive it. Tracking number: TRK-2024-8821.",
         "created_at": now - timedelta(days=8)},
        {"ticket_id": tid(5), "user_id": emily_oid, "author_name": "Emily Rodriguez", "author_role": "student", "is_internal": False,
         "text": "Google confirmed receipt. Thank you so much — you saved my job offer!",
         "created_at": now - timedelta(days=7)},
    ]

if comments_raw:
    db.comments.insert_many(comments_raw)
    # Update comment_count on tickets
    from collections import Counter
    counts = Counter(c["ticket_id"] for c in comments_raw if not c.get("is_internal"))
    from bson.objectid import ObjectId
    for ticket_id_str, count in counts.items():
        db.tickets.update_one({"_id": ObjectId(ticket_id_str)}, {"$set": {"comment_count": count}})

print(f"Inserted {len(comments_raw)} comments.")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n── Seed complete ──────────────────────────────────────────")
print(f"  Users:    {db.users.count_documents({})}")
print(f"  Tickets:  {db.tickets.count_documents({})}")
print(f"  Comments: {db.comments.count_documents({})}")
print(f"\n  Status breakdown:")
for s in ["open", "in_progress", "resolved", "closed"]:
    print(f"    {s:12s}: {db.tickets.count_documents({'status': s})}")

print(f"\n  Tickets per real user:")
for u in real_users:
    count = db.tickets.count_documents({"user_id": str(u["_id"])})
    print(f"    {u['email']}: {count} tickets")

print(f"\n  To see data: log in with any of these emails (sign up if not yet registered):")
print(f"    sarah.johnson@university.edu")
print(f"    michael.chen@university.edu")
print(f"    emily.rodriguez@university.edu")
print(f"    david.kim@university.edu")
print(f"    lisa.wang@university.edu")
