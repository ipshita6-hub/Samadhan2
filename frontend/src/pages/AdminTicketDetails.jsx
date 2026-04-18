import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminNav from "../components/AdminNav";
import { ticketsApi, createTicketSocket } from "../api";
import { formatDate, formatDateTime, formatDateOnly } from "../utils/formatDate";
import {
  ArrowLeft, Send, CheckCircle, User, Paperclip, Lock, Smile, Wifi, WifiOff,
} from "lucide-react";

const STATUS_COLOR = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};
const PRIORITY_COLOR = {
  high: "bg-red-100 text-red-800",
  urgent: "bg-red-200 text-red-900",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
};

export default function AdminTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [reactions, setReactions] = useState({});
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);
  const emojiPickerRef = useRef(null);
  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

  // WebSocket
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  async function loadTicket() {
    try {
      const data = await ticketsApi.getById(ticketId);
      setTicket(data);
      setNewStatus(data.status);
      setAssignedTo(data.assigned_to || "");
      const r = {};
      (data.comments || []).forEach((c) => { if (c.reactions) r[c.id] = c.reactions; });
      setReactions(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTicket(); }, [ticketId]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!ticketId || !user) return;
    let reconnectTimer = null;
    const connect = async () => {
      try {
        const token = await user.getIdToken();
        const ws = createTicketSocket(ticketId, token, (msg) => {
          if (msg.type === "new_comment") {
            setTicket((prev) => {
              if (!prev) return prev;
              const exists = prev.comments?.some((c) => c.id === msg.comment.id);
              if (exists) return prev;
              return { ...prev, comments: [...(prev.comments || []), msg.comment] };
            });
          } else if (msg.type === "ticket_updated") {
            setTicket((prev) => prev ? {
              ...prev,
              ...(msg.status && { status: msg.status }),
              ...(msg.assigned_to !== undefined && { assigned_to: msg.assigned_to }),
            } : prev);
          }
        });
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };
        wsRef.current = ws;
      } catch { /* ignore */ }
    };
    connect();
    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [ticketId, user]);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClick(e) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setEmojiPickerFor(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleReact = async (commentId, emoji) => {
    setEmojiPickerFor(null);
    const uid = user?.uid;
    if (!uid) return;
    setReactions((prev) => {
      const cur = { ...(prev[commentId] || {}) };
      const users = cur[emoji] ? [...cur[emoji]] : [];
      if (users.includes(uid)) {
        const next = users.filter((u) => u !== uid);
        if (next.length) cur[emoji] = next; else delete cur[emoji];
      } else {
        cur[emoji] = [...users, uid];
      }
      return { ...prev, [commentId]: cur };
    });
    try {
      const result = await ticketsApi.reactToComment(ticketId, commentId, emoji);
      setReactions((prev) => ({ ...prev, [commentId]: result.reactions }));
    } catch {
      loadTicket();
    }
  };

  async function handleStatusUpdate() {
    setSaving(true);
    setSaveMsg(null);
    try {
      await ticketsApi.update(ticketId, { status: newStatus, assigned_to: assignedTo || null });
      setSaveMsg({ type: "success", text: "Ticket updated successfully" });
      await loadTicket();
    } catch (e) {
      setSaveMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketsApi.addComment(ticketId, reply, isInternal);
      setReply("");
      setIsInternal(false);
      await loadTicket();
    } catch (e) {
      alert("Failed to send reply: " + e.message);
    } finally {
      setSending(false);
    }
  }

  async function handleQuickAction(status) {
    setSaving(true);
    try {
      await ticketsApi.update(ticketId, { status });
      await loadTicket();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-gray-500">Loading ticket...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-red-600">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/admin/tickets")} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <p className="text-sm text-teal-600 font-medium">Admin / Tickets / {ticket.id.slice(-10).toUpperCase()}</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Ticket Details</h1>
          </div>
        </div>

        {saveMsg && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${saveMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {saveMsg.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Main */}
          <div className="col-span-2 space-y-6">
            {/* Ticket header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">{ticket.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${STATUS_COLOR[ticket.status] || "bg-gray-100 text-gray-800"}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLOR[ticket.priority] || "bg-gray-100 text-gray-800"}`}>
                  {ticket.priority}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{ticket.category}</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-mono">{ticket.id.slice(-10).toUpperCase()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{ticket.description}</p>
            </div>

            {/* Conversation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Conversation ({ticket.comments?.length || 0})
                </h3>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${wsConnected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {wsConnected ? "Live" : "Offline"}
                </span>
              </div>
              <div className="space-y-4 mb-6">
                {ticket.comments?.length === 0 && (
                  <p className="text-gray-400 text-sm">No replies yet.</p>
                )}
                {ticket.comments?.map((c) => {
                  const commentReactions = reactions[c.id] || {};
                  const uid = user?.uid;
                  return (
                    <div key={c.id} className={`flex gap-4 group/msg ${c.is_internal ? "opacity-80" : ""}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${c.author_role === "admin" ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-700"}`}>
                        {c.author_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{c.author_name}</p>
                            <span className="text-xs text-gray-500 capitalize">{c.author_role}</span>
                            {c.is_internal && (
                              <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                <Lock size={10} /> Internal note
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                            {/* Emoji picker trigger */}
                            <div className="relative">
                              <button
                                onClick={() => setEmojiPickerFor(emojiPickerFor === c.id ? null : c.id)}
                                className="opacity-0 group-hover/msg:opacity-100 transition p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                title="React"
                              >
                                <Smile size={14} />
                              </button>
                              {emojiPickerFor === c.id && (
                                <div
                                  ref={emojiPickerRef}
                                  className="absolute right-0 top-7 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex gap-1"
                                >
                                  {EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReact(c.id, emoji)}
                                      className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg text-sm text-gray-700 ${c.is_internal ? "bg-yellow-50 border border-yellow-200" : c.author_role === "admin" ? "bg-teal-50 border border-teal-200" : "bg-gray-50 border border-gray-200"}`}>
                          {c.text}
                        </div>
                        {/* Reaction bubbles */}
                        {Object.keys(commentReactions).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(commentReactions).map(([emoji, users]) =>
                              users.length > 0 ? (
                                <button
                                  key={emoji}
                                  onClick={() => handleReact(c.id, emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition ${
                                    users.includes(uid)
                                      ? "bg-teal-50 border-teal-300 text-teal-700"
                                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-teal-300"
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="font-medium">{users.length}</span>
                                </button>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply form */}
              <form onSubmit={handleSendReply} className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4 mb-3">
                  <label className="text-sm font-medium text-gray-700">Add Reply</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                    />
                    <Lock size={14} className="text-yellow-600" />
                    Internal note (admin only)
                  </label>
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={isInternal ? "Write an internal note (not visible to student)..." : "Type your response here..."}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${isInternal ? "border-yellow-300 focus:ring-yellow-400 bg-yellow-50" : "border-gray-300 focus:ring-teal-500"}`}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition disabled:opacity-50"
                  >
                    <Send size={16} />
                    {sending ? "Sending..." : isInternal ? "Save Note" : "Send Reply"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Student info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {ticket.student_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{ticket.student_name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{ticket.student_email || ""}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tickets</span>
                  <span className="font-semibold">{ticket.student_total_tickets ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Open Tickets</span>
                  <span className="font-semibold">{ticket.student_open_tickets ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span className="font-semibold">{formatDateOnly(ticket.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Update status & assignment */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Admin name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuickAction("resolved")}
                  disabled={saving || ticket.status === "resolved"}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition text-sm font-medium disabled:opacity-40"
                >
                  <CheckCircle size={16} /> Mark as Resolved
                </button>
                <button
                  onClick={() => handleQuickAction("in_progress")}
                  disabled={saving || ticket.status === "in_progress"}
                  className="w-full px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition text-sm font-medium disabled:opacity-40"
                >
                  Set In Progress
                </button>
                <button
                  onClick={() => handleQuickAction("closed")}
                  disabled={saving || ticket.status === "closed"}
                  className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-medium disabled:opacity-40"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
