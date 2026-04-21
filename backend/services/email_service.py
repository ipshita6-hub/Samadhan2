"""
Email notification service.
Uses SMTP (Gmail / any provider) to send transactional emails.
Set SMTP_* variables in .env to enable; if not set, emails are silently skipped.
"""

import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)

# ── Config (read once at import time) ─────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
EMAIL_ENABLED = bool(SMTP_HOST and SMTP_USER and SMTP_PASS)


def _send(to: str, subject: str, html: str) -> bool:
    """Low-level send. Returns True on success."""
    if not EMAIL_ENABLED:
        logger.info(f"[email] SMTP not configured — skipping email to {to}: {subject}")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, [to], msg.as_string())
        logger.info(f"[email] Sent '{subject}' to {to}")
        return True
    except Exception as e:
        logger.error(f"[email] Failed to send to {to}: {e}")
        return False


# ── HTML templates ─────────────────────────────────────────────────────────────

def _base_template(title: str, body: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 32px auto; background: #fff;
                  border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }}
    .header {{ background: #0d9488; padding: 24px 32px; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 22px; }}
    .body {{ padding: 28px 32px; color: #374151; line-height: 1.6; }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 999px;
              font-size: 13px; font-weight: 600; }}
    .footer {{ padding: 16px 32px; background: #f9fafb; color: #9ca3af;
               font-size: 12px; border-top: 1px solid #e5e7eb; }}
    .btn {{ display: inline-block; margin-top: 16px; padding: 10px 24px;
            background: #0d9488; color: #fff; border-radius: 6px;
            text-decoration: none; font-weight: 600; font-size: 14px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Samadhan — {title}</h1></div>
    <div class="body">{body}</div>
    <div class="footer">This is an automated message from Samadhan Student Support. Please do not reply.</div>
  </div>
</body>
</html>
"""


STATUS_LABELS = {
    "open": ("Open", "#3b82f6", "#eff6ff"),
    "in_progress": ("In Progress", "#d97706", "#fffbeb"),
    "resolved": ("Resolved", "#16a34a", "#f0fdf4"),
    "closed": ("Closed", "#6b7280", "#f9fafb"),
}


# ── Public API ─────────────────────────────────────────────────────────────────

def send_ticket_created(to: str, student_name: str, ticket_id: str, ticket_title: str) -> bool:
    """Notify student that their ticket was received."""
    short_id = ticket_id[-8:].upper()
    body = f"""
<p>Hi <strong>{student_name}</strong>,</p>
<p>Your support ticket has been received and is now being reviewed by our team.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:8px;color:#6b7280;width:140px;">Ticket ID</td>
      <td style="padding:8px;font-weight:600;">#{short_id}</td></tr>
  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Subject</td>
      <td style="padding:8px;">{ticket_title}</td></tr>
  <tr><td style="padding:8px;color:#6b7280;">Status</td>
      <td style="padding:8px;"><span class="badge" style="background:#eff6ff;color:#3b82f6;">Open</span></td></tr>
</table>
<p>We aim to respond within 24 hours. You can track your ticket status by logging into the portal.</p>
"""
    return _send(to, f"Ticket #{short_id} Received — {ticket_title}", _base_template("Ticket Received", body))


def send_status_update(
    to: str,
    student_name: str,
    ticket_id: str,
    ticket_title: str,
    new_status: str,
    admin_name: Optional[str] = None,
    reply_text: Optional[str] = None,
) -> bool:
    """Notify student when admin changes ticket status."""
    short_id = ticket_id[-8:].upper()
    label, color, bg = STATUS_LABELS.get(new_status, ("Updated", "#6b7280", "#f9fafb"))

    extra = ""
    if reply_text:
        extra = f"""
<div style="margin:16px 0;padding:16px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;">
  <p style="margin:0 0 6px;font-weight:600;color:#374151;">Message from Support:</p>
  <p style="margin:0;color:#374151;">{reply_text}</p>
</div>"""

    by = f" by {admin_name}" if admin_name else ""
    body = f"""
<p>Hi <strong>{student_name}</strong>,</p>
<p>Your ticket status has been updated{by}.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:8px;color:#6b7280;width:140px;">Ticket ID</td>
      <td style="padding:8px;font-weight:600;">#{short_id}</td></tr>
  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Subject</td>
      <td style="padding:8px;">{ticket_title}</td></tr>
  <tr><td style="padding:8px;color:#6b7280;">New Status</td>
      <td style="padding:8px;">
        <span class="badge" style="background:{bg};color:{color};">{label}</span>
      </td></tr>
</table>
{extra}
<p>Log in to the portal to view the full conversation and respond.</p>
"""
    return _send(
        to,
        f"Ticket #{short_id} Status Updated: {label}",
        _base_template("Ticket Status Updated", body),
    )


def send_new_reply(
    to: str,
    recipient_name: str,
    ticket_id: str,
    ticket_title: str,
    author_name: str,
    reply_text: str,
) -> bool:
    """Notify student (or admin) of a new reply on their ticket."""
    short_id = ticket_id[-8:].upper()
    body = f"""
<p>Hi <strong>{recipient_name}</strong>,</p>
<p><strong>{author_name}</strong> has replied to your ticket.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:8px;color:#6b7280;width:140px;">Ticket ID</td>
      <td style="padding:8px;font-weight:600;">#{short_id}</td></tr>
  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Subject</td>
      <td style="padding:8px;">{ticket_title}</td></tr>
</table>
<div style="margin:16px 0;padding:16px;background:#f0fdf4;border-left:4px solid #0d9488;border-radius:4px;">
  <p style="margin:0 0 6px;font-weight:600;color:#374151;">{author_name} wrote:</p>
  <p style="margin:0;color:#374151;">{reply_text[:500]}{'…' if len(reply_text) > 500 else ''}</p>
</div>
<p>Log in to the portal to view the full conversation and respond.</p>
"""
    return _send(
        to,
        f"New Reply on Ticket #{short_id} — {ticket_title}",
        _base_template("New Reply on Your Ticket", body),
    )
