"""Quick test: simulate what get_tickets does for sarah's uid"""
from database import get_db
db = get_db()

# Find sarah by her real Firebase uid
uid = "EFECOHZKZwVmunwhSEqBoYjO0U03"
user = db.users.find_one({"uid": uid})
if not user:
    print("ERROR: user not found by uid")
else:
    print(f"Found user: {user['email']}  _id={str(user['_id'])}")
    query = {"user_id": str(user["_id"])}
    tickets = list(db.tickets.find(query))
    print(f"Tickets found with query {query}: {len(tickets)}")
    for t in tickets:
        print(f"  - {t['title'][:50]}  status={t['status']}")
