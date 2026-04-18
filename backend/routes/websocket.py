"""
WebSocket manager for real-time ticket chat.
Clients join a "room" per ticket_id.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json


class ConnectionManager:
    def __init__(self):
        # ticket_id -> list of active WebSocket connections
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, ticket_id: str, websocket: WebSocket):
        await websocket.accept()
        if ticket_id not in self.rooms:
            self.rooms[ticket_id] = []
        self.rooms[ticket_id].append(websocket)

    def disconnect(self, ticket_id: str, websocket: WebSocket):
        if ticket_id in self.rooms:
            self.rooms[ticket_id] = [
                ws for ws in self.rooms[ticket_id] if ws != websocket
            ]
            if not self.rooms[ticket_id]:
                del self.rooms[ticket_id]

    async def broadcast(self, ticket_id: str, message: dict, exclude: WebSocket = None):
        """Send a message to all connections in a ticket room."""
        if ticket_id not in self.rooms:
            return
        dead = []
        for ws in self.rooms[ticket_id]:
            if ws == exclude:
                continue
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ticket_id, ws)

    async def broadcast_all(self, ticket_id: str, message: dict):
        """Send to ALL connections including sender (e.g. ticket status updates)."""
        await self.broadcast(ticket_id, message, exclude=None)


manager = ConnectionManager()
