"""
Lightweight AI service for ticket analysis.
Uses keyword/rule-based NLP — no heavy ML dependencies required.
"""

import re
from typing import Dict, Tuple

# ── Sentiment keywords ────────────────────────────────────────────────────────

POSITIVE_WORDS = {
    "thank", "thanks", "great", "good", "excellent", "awesome", "helpful",
    "resolved", "fixed", "working", "perfect", "appreciate", "wonderful",
    "fantastic", "brilliant", "pleased", "happy", "satisfied", "love",
}

NEGATIVE_WORDS = {
    "urgent", "broken", "error", "fail", "failed", "crash", "bug", "issue",
    "problem", "wrong", "bad", "terrible", "horrible", "awful", "worst",
    "angry", "frustrated", "disappointed", "useless", "hate", "cannot",
    "unable", "stuck", "lost", "missing", "not working", "doesn't work",
    "won't work", "still broken", "still not", "never", "always fails",
    "critical", "emergency", "asap", "immediately", "deadline",
}

URGENT_PHRASES = {
    "asap", "urgent", "emergency", "critical", "immediately", "right now",
    "deadline", "exam", "tomorrow", "today", "can't access", "cannot access",
    "locked out", "lost access", "payment failed", "grade wrong",
}

# ── Category keyword map ──────────────────────────────────────────────────────

CATEGORY_KEYWORDS: Dict[str, list] = {
    "Technical Support": [
        "login", "password", "access", "error", "crash", "bug", "slow",
        "loading", "broken", "website", "app", "portal", "system", "server",
        "network", "wifi", "internet", "download", "upload", "install",
        "software", "hardware", "computer", "laptop", "browser", "link",
        "video", "stream", "lecture", "zoom", "teams", "email", "account",
    ],
    "Academic": [
        "grade", "assignment", "exam", "quiz", "course", "class", "professor",
        "instructor", "lecture", "syllabus", "deadline", "submission", "marks",
        "transcript", "certificate", "degree", "module", "curriculum",
        "attendance", "project", "thesis", "dissertation", "research",
        "library", "book", "study", "tutor", "feedback", "result",
    ],
    "Financial": [
        "payment", "fee", "tuition", "invoice", "refund", "scholarship",
        "financial", "billing", "charge", "transaction", "bank", "card",
        "money", "cost", "price", "paid", "unpaid", "overdue", "receipt",
        "bursary", "loan", "grant", "stipend", "salary", "reimbursement",
    ],
    "Administrative": [
        "enroll", "enrollment", "registration", "form", "document", "id",
        "card", "letter", "certificate", "admission", "application", "visa",
        "accommodation", "housing", "dorm", "schedule", "timetable", "room",
        "office", "staff", "department", "policy", "rule", "regulation",
        "transfer", "withdrawal", "deferral", "leave", "absence",
    ],
}


def analyze_sentiment(title: str, description: str) -> Dict:
    """
    Returns sentiment score (-1.0 to 1.0) and label.
    """
    text = f"{title} {description}".lower()
    words = set(re.findall(r"\b\w+\b", text))

    pos_hits = len(words & POSITIVE_WORDS)
    neg_hits = len(words & NEGATIVE_WORDS)

    # Check urgent phrases (multi-word)
    urgent_hits = sum(1 for phrase in URGENT_PHRASES if phrase in text)

    total = pos_hits + neg_hits + urgent_hits
    if total == 0:
        score = 0.0
    else:
        score = round((pos_hits - neg_hits - urgent_hits) / total, 2)

    if score > 0.2:
        label = "positive"
    elif score < -0.3:
        label = "negative"
    else:
        label = "neutral"

    return {
        "score": score,
        "label": label,
        "urgent": urgent_hits > 0,
    }


def suggest_category(title: str, description: str) -> Tuple[str, float]:
    """
    Returns (suggested_category, confidence 0-1).
    """
    text = f"{title} {description}".lower()
    words = re.findall(r"\b\w+\b", text)
    word_set = set(words)

    scores: Dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in word_set or kw in text)
        scores[category] = hits

    best_cat = max(scores, key=lambda c: scores[c])
    best_score = scores[best_cat]

    if best_score == 0:
        return "Other", 0.0

    total_hits = sum(scores.values())
    confidence = round(best_score / total_hits, 2) if total_hits > 0 else 0.0

    return best_cat, confidence


def suggest_priority(sentiment: Dict, category: str, title: str, description: str) -> str:
    """
    Returns suggested priority: low | medium | high | urgent
    """
    text = f"{title} {description}".lower()

    # Urgent signals
    if sentiment["urgent"] or any(p in text for p in ["asap", "emergency", "critical", "immediately"]):
        return "urgent"

    # Negative sentiment + financial = high
    if sentiment["label"] == "negative" and category == "Financial":
        return "high"

    # Category-based defaults
    category_defaults = {
        "Financial": "high",
        "Technical Support": "medium",
        "Academic": "medium",
        "Administrative": "low",
        "Other": "low",
    }

    base = category_defaults.get(category, "medium")

    # Boost if very negative
    if sentiment["score"] < -0.5 and base == "medium":
        return "high"

    return base


def analyze_ticket(title: str, description: str, user_category: str = None) -> Dict:
    """
    Full analysis: sentiment + category suggestion + priority suggestion.
    Returns a dict to be stored on the ticket and returned to the frontend.
    """
    sentiment = analyze_sentiment(title, description)
    suggested_cat, confidence = suggest_category(title, description)
    suggested_priority = suggest_priority(sentiment, user_category or suggested_cat, title, description)

    return {
        "sentiment": sentiment,
        "suggested_category": suggested_cat,
        "category_confidence": confidence,
        "suggested_priority": suggested_priority,
    }
