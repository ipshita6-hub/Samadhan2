from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

load_dotenv()

app = FastAPI(title="Support Ticketing API")

# Initialize Firebase
try:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print(f"✓ Firebase initialized with credentials from {cred_path}")
    else:
        print(f"⚠ Firebase credentials file not found at {cred_path}")
        print("  Make sure to place your firebase-credentials.json in the backend directory")
except Exception as e:
    print(f"⚠ Firebase initialization warning: {str(e)}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,https://master.d1z4pvdn033yh.amplifyapp.com").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

from routes import tickets, auth, settings as settings_router, faq as faq_router
from routes.websocket import manager
from services.sla_service import start_sla_monitor

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(settings_router.router, prefix="/api/settings", tags=["settings"])
app.include_router(faq_router.router, prefix="/api/faq", tags=["faq"])


@app.on_event("startup")
async def startup_event():
    start_sla_monitor()


# ── WebSocket endpoint ────────────────────────────────────────────────────────

@app.websocket("/ws/ticket/{ticket_id}")
async def ticket_websocket(websocket: WebSocket, ticket_id: str):
    # Authenticate via token query param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return
    try:
        firebase_auth.verify_id_token(token)
    except Exception:
        await websocket.close(code=4001)
        return

    await manager.connect(ticket_id, websocket)
    try:
        while True:
            # Keep connection alive; actual messages are pushed from HTTP endpoints
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ticket_id, websocket)


@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
