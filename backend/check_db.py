from database import get_db
db = get_db()

print("=== Users with sarah.johnson email ===")
users = list(db.users.find({"email": "sarah.johnson@university.edu"}))
for u in users:
    oid = str(u["_id"])
    uid = u.get("uid", "")
    tickets = db.tickets.count_documents({"user_id": oid})
    print(f"  _id={oid}  uid={uid[:30]}  tickets_linked={tickets}")

print()
print("=== All tickets and their user_id ===")
for t in db.tickets.find({}, {"user_id": 1, "title": 1}):
    print(f"  user_id={t['user_id']}  |  {t['title'][:50]}")
