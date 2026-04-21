"""
Quick endpoint smoke test — run with: python test_endpoints.py
Tests all public routes and verifies auth protection on private ones.
"""
import urllib.request
import json
import sys

BASE = "http://localhost:8000"

passed = 0
failed = 0

def check(label, path, expect_status=200, method="GET"):
    global passed, failed
    try:
        req = urllib.request.Request(BASE + path, method=method)
        r = urllib.request.urlopen(req, timeout=5)
        status = r.status
        data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            data = json.loads(e.read())
        except Exception:
            data = {}
    except Exception as e:
        print(f"  ✗ {label}: ERROR — {e}")
        failed += 1
        return None, 0

    ok = status == expect_status
    icon = "✓" if ok else "✗"
    print(f"  {icon} {label}: HTTP {status} (expected {expect_status})")
    if ok:
        passed += 1
    else:
        failed += 1
    return data, status


print("=" * 55)
print("SAMADHAN BACKEND SMOKE TEST")
print("=" * 55)

# ── Health ────────────────────────────────────────────────────────────────────
print("\n[1] Health Check")
d, _ = check("GET /health", "/health")
if d:
    print(f"      status={d.get('status')}")

# ── OpenAPI ───────────────────────────────────────────────────────────────────
print("\n[2] OpenAPI Docs")
check("GET /openapi.json", "/openapi.json")

# ── FAQ (public, no auth) ─────────────────────────────────────────────────────
print("\n[3] FAQ Search (public endpoint)")
d, _ = check("login/password query", "/api/faq/search?q=cannot+login+password")
if d:
    faqs = d.get("faqs", [])
    print(f"      {len(faqs)} FAQ(s) returned")
    if faqs:
        print(f"      First match: {faqs[0]['question'][:65]}")

d, _ = check("financial/payment query", "/api/faq/search?q=payment+duplicate+charge&category=Financial")
if d:
    print(f"      {len(d.get('faqs', []))} FAQ(s) returned")

d, _ = check("zoom/online class query", "/api/faq/search?q=zoom+link+not+working")
if d:
    print(f"      {len(d.get('faqs', []))} FAQ(s) returned")

d, _ = check("grade/exam query", "/api/faq/search?q=grade+wrong+exam")
if d:
    print(f"      {len(d.get('faqs', []))} FAQ(s) returned")

d, _ = check("transcript/certificate query", "/api/faq/search?q=official+transcript+certificate")
if d:
    print(f"      {len(d.get('faqs', []))} FAQ(s) returned")

d, _ = check("short query (< 2 chars)", "/api/faq/search?q=a", expect_status=422)

# ── Auth protection (no token → 422 missing header) ───────────────────────────
print("\n[4] Auth Protection (no token → 401)")
check("GET /api/auth/me", "/api/auth/me", expect_status=401)
check("GET /api/tickets/", "/api/tickets/", expect_status=401)
check("GET /api/tickets/admin/stats", "/api/tickets/admin/stats", expect_status=401)
check("GET /api/settings/", "/api/settings/", expect_status=401)
check("GET /api/settings/admins", "/api/settings/admins", expect_status=401)

# ── MongoDB collections ───────────────────────────────────────────────────────
print("\n[5] MongoDB Collections")
try:
    import sys, os
    sys.path.insert(0, os.path.dirname(__file__))
    from database import get_db
    db = get_db()
    collections = db.list_collection_names()
    for col in ["users", "tickets", "comments", "notifications", "settings", "sla_alerts"]:
        exists = col in collections
        icon = "✓" if exists else "○"
        count = db[col].count_documents({}) if exists else 0
        print(f"  {icon} {col}: {count} documents")
except Exception as e:
    print(f"  ✗ DB check failed: {e}")

# ── Route registration check ──────────────────────────────────────────────────
print("\n[6] Route Registration (via OpenAPI)")
try:
    req = urllib.request.Request(BASE + "/openapi.json")
    r = urllib.request.urlopen(req, timeout=5)
    spec = json.loads(r.read())
    paths = list(spec.get("paths", {}).keys())
    expected_routes = [
        "/health",
        "/api/auth/register",
        "/api/auth/me",
        "/api/tickets/",
        "/api/tickets/my/stats",
        "/api/tickets/admin/stats",
        "/api/tickets/notifications/all",
        "/api/tickets/notifications/read",
        "/api/tickets/notifications/read-all",
        "/api/tickets/{ticket_id}",
        "/api/tickets/{ticket_id}/close",
        "/api/tickets/{ticket_id}/reopen",
        "/api/tickets/{ticket_id}/comments",
        "/api/tickets/{ticket_id}/attachments",
        "/api/faq/search",
        "/api/settings/",
        "/api/settings/admins",
    ]
    for route in expected_routes:
        found = route in paths
        icon = "✓" if found else "✗"
        if not found:
            failed += 1
        else:
            passed += 1
        print(f"  {icon} {route}")
except Exception as e:
    print(f"  ✗ Could not fetch OpenAPI spec: {e}")

# ── Summary ───────────────────────────────────────────────────────────────────
print()
print("=" * 55)
print(f"RESULT: {passed} passed, {failed} failed")
print("=" * 55)
sys.exit(0 if failed == 0 else 1)
