from fastapi import APIRouter, Depends, HTTPException, Header
from database import get_db
from firebase_admin import auth as firebase_auth
from datetime import datetime

router = APIRouter()

DEFAULT_SETTINGS = {
    "siteName": "Samadhan",
    "siteDescription": "Student Support System",
    "emailNotifications": True,
    "autoAssign": True,
    "maxResponseTime": 24,
    "maintenanceMode": False,
}


def verify_firebase_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        token = authorization.split(" ")[1]
        return firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin(decoded_token: dict, db):
    user = db.users.find_one({"uid": decoded_token["uid"]})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/")
async def get_settings(
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    require_admin(decoded_token, db)
    doc = db.settings.find_one({"_id": "global"})
    if not doc:
        return DEFAULT_SETTINGS
    doc.pop("_id", None)
    return doc


@router.patch("/")
async def update_settings(
    data: dict,
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    require_admin(decoded_token, db)

    allowed = set(DEFAULT_SETTINGS.keys())
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        raise HTTPException(status_code=400, detail="No valid fields provided")

    update["updated_at"] = datetime.utcnow().isoformat()

    db.settings.update_one(
        {"_id": "global"},
        {"$set": update},
        upsert=True,
    )
    doc = db.settings.find_one({"_id": "global"})
    doc.pop("_id", None)
    doc.pop("updated_at", None)
    return doc


@router.get("/admins")
async def get_admins(
    decoded_token: dict = Depends(verify_firebase_token),
    db=Depends(get_db),
):
    require_admin(decoded_token, db)
    admins = list(db.users.find({"role": "admin"}, {"uid": 0}))
    return [
        {
            "id": str(a["_id"]),
            "name": a.get("full_name", ""),
            "email": a.get("email", ""),
            "role": "Admin",
            "status": "Active",
            "created_at": a.get("created_at", "").isoformat() + "Z" if hasattr(a.get("created_at", ""), "isoformat") else "",
        }
        for a in admins
    ]
