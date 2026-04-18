from fastapi import APIRouter, Depends, HTTPException, Header
from database import get_db
from models import TicketCreate
import firebase_admin
from firebase_admin import auth as firebase_auth
from bson.objectid import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def verify_firebase_token(authorization: str = Header(None)):
    if not authorization:
        logger.error("Missing authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        # Extract token from "Bearer <token>"
        parts = authorization.split(" ")
        if len(parts) != 2 or parts[0] != "Bearer":
            logger.error(f"Invalid authorization format: {authorization[:20]}...")
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        token = parts[1]
        decoded_token = firebase_auth.verify_id_token(token)
        logger.info(f"Token verified for user: {decoded_token.get('email')}")
        return decoded_token
    except firebase_auth.InvalidIdTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

@router.post("/register")
async def register(
    data: dict,
    decoded_token: dict = Depends(verify_firebase_token),
    db = Depends(get_db)
):
    """Register a new user"""
    try:
        email = data.get("email")
        role = data.get("role", "student")
        
        logger.info(f"Registering user: {email} with role: {role}")
        
        user_doc = {
            "uid": decoded_token["uid"],
            "email": email,
            "full_name": data.get("full_name"),
            "role": role,
            "created_at": datetime.utcnow(),
        }
        
        result = db.users.insert_one(user_doc)
        logger.info(f"User registered successfully: {email} with role: {role}")
        
        return {
            "id": str(result.inserted_id),
            "message": "User registered successfully",
            "role": role
        }
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_current_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db = Depends(get_db)
):
    """Get current user info"""
    try:
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        
        logger.info(f"Fetching user info for: {email}")
        
        user = db.users.find_one({"uid": uid})
        
        # If user doesn't exist, create them
        if not user:
            logger.info(f"User not found in DB, creating new user: {email}")
            # Determine role based on email (you can customize this logic)
            role = "admin" if "admin" in email.lower() else "student"
            
            user_doc = {
                "uid": uid,
                "email": email,
                "full_name": decoded_token.get("name", ""),
                "role": role,
                "created_at": datetime.utcnow(),
            }
            
            result = db.users.insert_one(user_doc)
            user = user_doc
            user["_id"] = result.inserted_id
            logger.info(f"New user created with role: {role}")
        else:
            logger.info(f"User found in DB with role: {user.get('role')}")
        
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
        }
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
