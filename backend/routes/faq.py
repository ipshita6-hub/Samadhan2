from fastapi import APIRouter, Query
from typing import Optional
from services.faq_service import search_faqs

router = APIRouter()


@router.get("/search")
async def faq_search(
    q: str = Query(..., min_length=2, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(default=3, ge=1, le=5),
):
    """
    Returns up to `limit` FAQ entries matching the query.
    Called client-side as the student types their ticket title/description.
    No auth required — FAQs are public knowledge.
    """
    results = search_faqs(q, category=category, limit=limit)
    return {"faqs": results, "count": len(results)}
