from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM
    category: str
    course: Optional[str] = None          # ← added

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[str] = None
    category: Optional[str] = None
    course: Optional[str] = None          # ← added

class StudentTicketClose(BaseModel):
    """Students can only close their own tickets."""
    status: TicketStatus = TicketStatus.CLOSED

class Ticket(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    category: str
    course: Optional[str] = None
    assigned_to: Optional[str] = None
    attachments: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class CommentCreate(BaseModel):
    text: str
    is_internal: bool = False

class Comment(BaseModel):
    id: str = Field(alias="_id")
    ticket_id: str
    user_id: str
    author_name: str
    author_role: str
    text: str
    is_internal: bool = False
    created_at: datetime

    class Config:
        populate_by_name = True

class NotificationRead(BaseModel):
    notification_ids: List[str]

class ReactionToggle(BaseModel):
    emoji: str
