"""
FAQ knowledge base with keyword-based matching.
Returns relevant FAQs before a student submits a ticket,
potentially resolving the issue without creating a ticket.
"""

from typing import List, Dict

# ── FAQ Bank ──────────────────────────────────────────────────────────────────
# Each entry: id, category, question, answer, keywords (for matching), tags

FAQ_BANK: List[Dict] = [
    # ── Technical Support ─────────────────────────────────────────────────────
    {
        "id": "tech-001",
        "category": "Technical Support",
        "question": "I can't log in to the student portal. What should I do?",
        "answer": (
            "1. Make sure you're using your university email (e.g. student@university.edu).\n"
            "2. Clear your browser cache and cookies, then try again.\n"
            "3. Try a different browser (Chrome, Firefox, Edge).\n"
            "4. Use the 'Forgot Password' link on the login page to reset your password.\n"
            "5. If your account is locked, wait 15 minutes before retrying.\n"
            "If none of these work, submit a ticket and we'll unlock your account manually."
        ),
        "keywords": ["login", "log in", "sign in", "password", "locked", "access", "portal", "account", "cannot login", "can't login"],
        "tags": ["login", "password", "access"],
    },
    {
        "id": "tech-002",
        "category": "Technical Support",
        "question": "Course videos or lecture materials won't load / show 'Access Denied'.",
        "answer": (
            "1. Confirm you are enrolled in the course — check your course list in the portal.\n"
            "2. Try disabling browser extensions (especially ad-blockers).\n"
            "3. Clear your browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac).\n"
            "4. Try opening the video in an Incognito/Private window.\n"
            "5. Check if the content has a release date — some materials unlock on a schedule.\n"
            "If you're enrolled and still can't access, submit a ticket with your student ID and course code."
        ),
        "keywords": ["video", "lecture", "material", "access denied", "course content", "slides", "download", "watch", "stream", "load"],
        "tags": ["course", "video", "access"],
    },
    {
        "id": "tech-003",
        "category": "Technical Support",
        "question": "The assignment submission portal is not working / upload button is greyed out.",
        "answer": (
            "1. Check the assignment deadline — submissions may be locked after the due date.\n"
            "2. Ensure your file is in an accepted format (PDF, DOCX, ZIP — check the assignment instructions).\n"
            "3. File size limit is usually 50MB. Compress large files before uploading.\n"
            "4. Try a different browser. Chrome is recommended.\n"
            "5. Disable browser extensions and try again.\n"
            "If the deadline hasn't passed and the button is still greyed out, submit a ticket immediately with a screenshot."
        ),
        "keywords": ["submit", "submission", "upload", "assignment", "greyed", "disabled", "button", "portal", "file", "attach"],
        "tags": ["assignment", "submission", "upload"],
    },
    {
        "id": "tech-004",
        "category": "Technical Support",
        "question": "Zoom / online class link is not working or shows 'meeting not found'.",
        "answer": (
            "1. Check the course portal for an updated link — professors sometimes regenerate links.\n"
            "2. Make sure your Zoom app is up to date.\n"
            "3. Try joining via browser instead of the app: click 'Join from Browser' on the Zoom page.\n"
            "4. The meeting may not have started yet — check the scheduled time.\n"
            "5. Contact your professor directly via email if the class is about to start.\n"
            "Submit a ticket if the link has been broken for multiple sessions."
        ),
        "keywords": ["zoom", "meeting", "online class", "link", "not found", "join", "virtual", "teams", "webinar", "live"],
        "tags": ["zoom", "online", "class"],
    },
    {
        "id": "tech-005",
        "category": "Technical Support",
        "question": "I can't access library databases (JSTOR, ScienceDirect, etc.) from off-campus.",
        "answer": (
            "1. You must use the university VPN to access library databases off-campus.\n"
            "2. Download the VPN client from the IT portal: go to portal → IT Services → VPN.\n"
            "3. Connect to the VPN before opening the library database.\n"
            "4. If you're already on VPN and still can't access, try clearing cookies for that site.\n"
            "5. Some databases require you to log in with your university credentials after connecting.\n"
            "Contact the library helpdesk or submit a ticket if VPN access is not resolving the issue."
        ),
        "keywords": ["library", "database", "jstor", "off-campus", "vpn", "research", "journal", "sciencedirect", "access", "remote"],
        "tags": ["library", "vpn", "database"],
    },

    # ── Financial ─────────────────────────────────────────────────────────────
    {
        "id": "fin-001",
        "category": "Financial",
        "question": "I was charged twice / there's a duplicate payment on my account.",
        "answer": (
            "1. First, verify the duplicate charge on your bank statement (allow 1–2 business days for transactions to settle).\n"
            "2. Log in to the student portal → Finances → Payment History to confirm both charges appear.\n"
            "3. Do NOT make another payment — this could result in a third charge.\n"
            "4. Submit a ticket with: your student ID, the transaction dates, and the amounts charged.\n"
            "Refunds for duplicate charges are typically processed within 5–7 business days."
        ),
        "keywords": ["duplicate", "charged twice", "double charge", "refund", "payment", "billing", "overcharged", "extra charge"],
        "tags": ["payment", "duplicate", "refund"],
    },
    {
        "id": "fin-002",
        "category": "Financial",
        "question": "My financial aid / scholarship has not been disbursed.",
        "answer": (
            "1. Check the disbursement schedule in the portal — aid is typically released 1–2 weeks after the semester starts.\n"
            "2. Ensure all required documents have been submitted (enrollment verification, tax forms, etc.).\n"
            "3. Verify your bank account details are correct in the portal under Finances → Bank Details.\n"
            "4. Check your university email for any requests for additional documentation.\n"
            "5. Financial aid holds can occur if you have outstanding fees — check Finances → Account Balance.\n"
            "If disbursement is more than 5 business days late, submit a ticket with your aid award letter."
        ),
        "keywords": ["financial aid", "scholarship", "disbursement", "grant", "bursary", "stipend", "not received", "delayed", "aid"],
        "tags": ["financial aid", "scholarship", "disbursement"],
    },
    {
        "id": "fin-003",
        "category": "Financial",
        "question": "How do I get a fee receipt or payment confirmation?",
        "answer": (
            "1. Log in to the student portal → Finances → Payment History.\n"
            "2. Click on any payment to download a PDF receipt.\n"
            "3. For official fee receipts (stamped), visit the Finance Office in person or email finance@university.edu.\n"
            "4. Receipts are usually available within 24 hours of payment processing."
        ),
        "keywords": ["receipt", "invoice", "confirmation", "proof of payment", "fee receipt", "payment confirmation", "document"],
        "tags": ["receipt", "payment", "document"],
    },

    # ── Academic ──────────────────────────────────────────────────────────────
    {
        "id": "acad-001",
        "category": "Academic",
        "question": "I think my exam / assignment grade is incorrect.",
        "answer": (
            "1. Review the marking rubric and model answers (usually posted after grades are released).\n"
            "2. Contact your professor directly via email first — most grade disputes are resolved this way.\n"
            "3. If the professor is unresponsive after 5 business days, escalate to the department head.\n"
            "4. For formal re-marking requests, submit a Grade Review form from the Academic Office.\n"
            "5. Note: re-marking can result in a grade going up or down.\n"
            "Submit a support ticket only if the academic channels are unresponsive."
        ),
        "keywords": ["grade", "marks", "exam", "wrong grade", "incorrect", "re-mark", "review", "score", "result", "grading"],
        "tags": ["grade", "exam", "academic"],
    },
    {
        "id": "acad-002",
        "category": "Academic",
        "question": "How do I request a deadline extension for an assignment?",
        "answer": (
            "1. Contact your professor as early as possible — ideally before the deadline.\n"
            "2. Provide a valid reason (medical, family emergency, etc.) with supporting documentation.\n"
            "3. Most departments have a formal Extension Request Form — check the Academic Office portal.\n"
            "4. Medical extensions require a doctor's certificate dated before the deadline.\n"
            "5. Extensions are not guaranteed and are at the professor's discretion.\n"
            "If your professor is unresponsive and the deadline is imminent, submit a ticket immediately."
        ),
        "keywords": ["extension", "deadline", "late submission", "extra time", "postpone", "defer", "assignment due"],
        "tags": ["extension", "deadline", "assignment"],
    },
    {
        "id": "acad-003",
        "category": "Academic",
        "question": "How do I get my degree certificate or official transcript?",
        "answer": (
            "1. Log in to the student portal → Academic Records → Request Documents.\n"
            "2. Select 'Official Transcript' or 'Degree Certificate' and fill in the recipient details.\n"
            "3. Processing time: 3–5 business days for digital, 7–10 days for physical copies.\n"
            "4. Urgent requests (within 24 hours) can be made in person at the Academic Records Office.\n"
            "5. There may be a small fee for official documents — check the fee schedule in the portal.\n"
            "Track your request status in the portal under Academic Records → My Requests."
        ),
        "keywords": ["transcript", "certificate", "degree", "official document", "records", "graduation", "attestation", "verification"],
        "tags": ["transcript", "certificate", "records"],
    },

    # ── Administrative ────────────────────────────────────────────────────────
    {
        "id": "admin-001",
        "category": "Administrative",
        "question": "A course I registered for is not showing in my schedule.",
        "answer": (
            "1. Check your registration confirmation email for the course code and section.\n"
            "2. Log in to the portal → My Courses → All Registered Courses (not just 'Current Semester').\n"
            "3. Some courses take up to 24 hours to appear after registration.\n"
            "4. Verify the course wasn't dropped due to a payment hold or prerequisite issue.\n"
            "5. Check if the course has a waitlist — you may have been placed on it instead of enrolled.\n"
            "If the course still doesn't appear after 24 hours, submit a ticket with your registration confirmation."
        ),
        "keywords": ["enrollment", "registered", "course missing", "schedule", "not showing", "registration", "enroll", "class list"],
        "tags": ["enrollment", "registration", "course"],
    },
    {
        "id": "admin-002",
        "category": "Administrative",
        "question": "How do I get an accommodation letter for a disability or medical condition?",
        "answer": (
            "1. Register with the Disability Services Office (DSO) — this is required before any accommodation can be issued.\n"
            "2. Submit medical documentation to the DSO (doctor's letter, diagnosis report, etc.).\n"
            "3. Once approved, accommodation letters are generated and sent to your professors automatically.\n"
            "4. Processing typically takes 5–10 business days after documentation is received.\n"
            "5. Renew your accommodation each semester — letters don't carry over automatically.\n"
            "Contact the DSO directly at dso@university.edu or submit a ticket if your letter is overdue."
        ),
        "keywords": ["accommodation", "disability", "learning disability", "medical", "letter", "extended time", "special needs", "dso"],
        "tags": ["accommodation", "disability", "letter"],
    },
    {
        "id": "admin-003",
        "category": "Administrative",
        "question": "How do I apply for a leave of absence or course withdrawal?",
        "answer": (
            "1. Log in to the portal → Academic Records → Leave of Absence / Withdrawal.\n"
            "2. Review the withdrawal deadlines — partial refunds apply within the first few weeks.\n"
            "3. Medical withdrawals require documentation and may qualify for a full fee refund.\n"
            "4. Notify your professors and academic advisor before submitting the form.\n"
            "5. International students: check visa implications with the International Office before withdrawing.\n"
            "Submit a ticket if the online form is unavailable or you need urgent processing."
        ),
        "keywords": ["leave", "withdrawal", "drop course", "defer", "absence", "withdraw", "unenroll", "drop out"],
        "tags": ["leave", "withdrawal", "administrative"],
    },
]


def search_faqs(query: str, category: str = None, limit: int = 3) -> List[Dict]:
    """
    Returns up to `limit` FAQs matching the query text.
    Scoring: keyword hits + category bonus.
    """
    if not query or len(query.strip()) < 3:
        return []

    text = query.lower()
    words = set(text.split())
    scored = []

    for faq in FAQ_BANK:
        score = 0

        # Category filter / bonus
        if category and faq["category"] == category:
            score += 3
        elif category and faq["category"] != category:
            score -= 1  # slight penalty for wrong category

        # Keyword matching
        for kw in faq["keywords"]:
            if kw in text:
                score += 2 if " " in kw else 1  # multi-word phrases score higher

        # Question word overlap
        q_words = set(faq["question"].lower().split())
        overlap = len(words & q_words)
        score += overlap

        if score > 0:
            scored.append((score, faq))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [f for _, f in scored[:limit]]
