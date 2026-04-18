import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, CheckCheck, MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { notificationsApi } from "../api";
import { formatDate } from "../utils/formatDate";

const TYPE_ICON = {
  reply:         { icon: MessageSquare, color: "text-teal-500",  bg: "bg-teal-50"  },
  status_change: { icon: RefreshCw,     color: "text-blue-500",  bg: "bg-blue-50"  },
  new_ticket:    { icon: AlertCircle,   color: "text-orange-500",bg: "bg-orange-50"},
  student_reply: { icon: MessageSquare, color: "text-purple-500",bg: "bg-purple-50"},
  reopened:      { icon: RefreshCw,     color: "text-yellow-500",bg: "bg-yellow-50"},
};


export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // silently fail — bell is non-critical
    }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClickNotification = async (notif) => {
    if (!notif.read) {
      await notificationsApi.markRead([notif.id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (notif.ticket_id) {
      navigate(`/ticket/${notif.ticket_id}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-600" />
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = TYPE_ICON[notif.type] || TYPE_ICON.reply;
                const Icon = meta.icon;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClickNotification(notif)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition flex gap-3 items-start ${
                      !notif.read ? "bg-teal-50/40" : ""
                    }`}
                  >
                    <div className={`${meta.bg} p-2 rounded-lg flex-shrink-0 mt-0.5`}>
                      <Icon size={14} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
