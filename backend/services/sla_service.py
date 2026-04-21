"""
SLA (Service Level Agreement) tracking service.

Runs as a background thread. Checks tickets periodically and:
  - Fires a WARNING notification + email at slaWarnHours (default 20h, configurable in Settings)
  - Fires a BREACH notification + email at slaBreachHours (default 48h, configurable in Settings)

Tracks which alerts have already been sent via a `sla_alerts` MongoDB collection
so alerts are never duplicated across restarts.

SLA clock starts at ticket creation and stops when status becomes resolved or closed.
"""

import threading
import logging
import os
from datetime import datetime, timedelta
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

# ── Env-var fallback defaults ─────────────────────────────────────────────────
SLA_WARN_HOURS    = int(os.getenv("SLA_WARN_HOURS",    "20"))
SLA_BREACH_HOURS  = int(os.getenv("SLA_BREACH_HOURS",  "48"))
SLA_CHECK_MINUTES = int(os.getenv("SLA_CHECK_MINUTES", "5"))


def _get_db():
    from database import get_db
    return get_db()


def _already_alerted(db, ticket_id: str, alert_type: str) -> bool:
    return db.sla_alerts.find_one({"ticket_id": ticket_id, "type": alert_type}) is not None


def _record_alert(db, ticket_id: str, alert_type: str):
    db.sla_alerts.insert_one({
        "ticket_id": ticket_id,
        "type": alert_type,
        "created_at": datetime.utcnow(),
    })


def _create_notification(db, user_id: str, ticket_id: str, ticket_title: str,
                          message: str, notif_type: str):
    db.notifications.insert_one({
        "user_id": user_id,
        "ticket_id": ticket_id,
        "ticket_title": ticket_title,
        "message": message,
        "type": notif_type,
        "read": False,
        "created_at": datetime.utcnow(),
    })


def _send_sla_email(to: str, name: str, ticket_id: str, ticket_title: str,
                    age_hours: float, level: str, sla_hours: int):
    from services.email_service import _send, _base_template
    short_id = ticket_id[-8:].upper()
    color = "#dc2626" if level == "BREACH" else "#d97706"
    bg    = "#fef2f2" if level == "BREACH" else "#fffbeb"
    icon  = "⚠️" if level == "BREACH" else "⏰"
    body = f"""
<p>Hi <strong>{name}</strong>,</p>
<p>An SLA alert has been triggered for the following ticket:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:8px;color:#6b7280;width:160px;">Ticket ID</td>
      <td style="padding:8px;font-weight:600;">#{short_id}</td></tr>
  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Subject</td>
      <td style="padding:8px;">{ticket_title}</td></tr>
  <tr><td style="padding:8px;color:#6b7280;">Open for</td>
      <td style="padding:8px;font-weight:600;">{int(age_hours)} hours</td></tr>
  <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">SLA Limit</td>
      <td style="padding:8px;">{sla_hours} hours</td></tr>
  <tr><td style="padding:8px;color:#6b7280;">Alert Level</td>
      <td style="padding:8px;">
        <span style="display:inline-block;padding:4px 12px;border-radius:999px;
                     background:{bg};color:{color};font-weight:600;font-size:13px;">
          {icon} {level}
        </span>
      </td></tr>
</table>
<p>Please review and respond to this ticket as soon as possible to meet the SLA commitment.</p>
"""
    _send(to, f"{icon} SLA {level}: Ticket #{short_id} — {ticket_title}",
          _base_template(f"SLA {level}", body))


def _run_check():
    """Single SLA check pass — called by the background thread."""
    try:
        db = _get_db()
        now = datetime.utcnow()

        # Read thresholds from DB settings (admin-configurable), fall back to env vars
        try:
            from routes.settings import get_settings_doc
            s = get_settings_doc(db)
            warn_hours   = int(s.get("slaWarnHours",   SLA_WARN_HOURS))
            breach_hours = int(s.get("slaBreachHours", SLA_BREACH_HOURS))
        except Exception:
            warn_hours   = SLA_WARN_HOURS
            breach_hours = SLA_BREACH_HOURS

        warn_threshold   = now - timedelta(hours=warn_hours)
        breach_threshold = now - timedelta(hours=breach_hours)

        # Only check open / in_progress tickets
        active_tickets = list(db.tickets.find(
            {"status": {"$in": ["open", "in_progress"]}},
            {"_id": 1, "title": 1, "user_id": 1, "created_at": 1, "assigned_to": 1}
        ))

        for ticket in active_tickets:
            ticket_id    = str(ticket["_id"])
            ticket_title = ticket.get("title", "Untitled")
            created_at   = ticket.get("created_at")

            if not created_at:
                continue

            age_hours_val = (now - created_at).total_seconds() / 3600

            # ── BREACH alert ──────────────────────────────────────────────────
            if created_at <= breach_threshold:
                if not _already_alerted(db, ticket_id, "breach"):
                    _record_alert(db, ticket_id, "breach")
                    msg = (
                        f"⚠️ SLA BREACH: Ticket \"{ticket_title}\" has been open for "
                        f"{int(age_hours_val)}h — exceeds the {breach_hours}h SLA."
                    )
                    admins = list(db.users.find({"role": "admin"}, {"_id": 1, "email": 1, "full_name": 1}))
                    for admin in admins:
                        _create_notification(db, str(admin["_id"]), ticket_id, ticket_title, msg, "sla_breach")
                    try:
                        from routes.settings import email_notifications_enabled
                        if email_notifications_enabled(db):
                            for admin in admins:
                                if admin.get("email"):
                                    _send_sla_email(admin["email"], admin.get("full_name", "Admin"),
                                                    ticket_id, ticket_title, age_hours_val, "BREACH", breach_hours)
                    except Exception as e:
                        logger.warning(f"SLA breach email failed: {e}")
                    logger.warning(f"[SLA] BREACH — ticket {ticket_id} ({int(age_hours_val)}h old)")

            # ── WARNING alert ─────────────────────────────────────────────────
            elif created_at <= warn_threshold:
                if not _already_alerted(db, ticket_id, "warning"):
                    _record_alert(db, ticket_id, "warning")
                    msg = (
                        f"⏰ SLA Warning: Ticket \"{ticket_title}\" has been open for "
                        f"{int(age_hours_val)}h — approaching the {breach_hours}h SLA limit."
                    )
                    admins = list(db.users.find({"role": "admin"}, {"_id": 1, "email": 1, "full_name": 1}))
                    for admin in admins:
                        _create_notification(db, str(admin["_id"]), ticket_id, ticket_title, msg, "sla_warning")
                    try:
                        from routes.settings import email_notifications_enabled
                        if email_notifications_enabled(db):
                            for admin in admins:
                                if admin.get("email"):
                                    _send_sla_email(admin["email"], admin.get("full_name", "Admin"),
                                                    ticket_id, ticket_title, age_hours_val, "WARNING", breach_hours)
                    except Exception as e:
                        logger.warning(f"SLA warning email failed: {e}")
                    logger.info(f"[SLA] WARNING — ticket {ticket_id} ({int(age_hours_val)}h old)")

        # Clear resolved alerts so re-opened tickets can be alerted again
        resolved_ids = [
            str(t["_id"]) for t in db.tickets.find(
                {"status": {"$in": ["resolved", "closed"]}}, {"_id": 1}
            )
        ]
        if resolved_ids:
            db.sla_alerts.delete_many({"ticket_id": {"$in": resolved_ids}})

    except Exception as e:
        logger.error(f"[SLA] Check failed: {e}")


# ── Background thread ─────────────────────────────────────────────────────────

_stop_event = threading.Event()
_thread: threading.Thread = None


def _loop():
    logger.info(f"[SLA] Monitor started — checking every {SLA_CHECK_MINUTES} min "
                f"(warn={SLA_WARN_HOURS}h, breach={SLA_BREACH_HOURS}h)")
    while not _stop_event.wait(timeout=SLA_CHECK_MINUTES * 60):
        _run_check()
    logger.info("[SLA] Monitor stopped.")


def start_sla_monitor():
    """Start the background SLA monitor thread. Safe to call multiple times."""
    global _thread
    if _thread and _thread.is_alive():
        return
    _stop_event.clear()
    _thread = threading.Thread(target=_loop, name="sla-monitor", daemon=True)
    _thread.start()


def stop_sla_monitor():
    """Gracefully stop the SLA monitor."""
    _stop_event.set()
