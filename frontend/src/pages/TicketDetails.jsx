import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketsApi, createTicketSocket } from "../api";
import { formatDate, formatDateTime, formatDateOnly } from "../utils/formatDate";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  XCircle,
  RotateCcw,
  RefreshCw,
  Paperclip,
  Download,
  Trash2,
  FileText,
  Image,
  Smile,
  Wifi,
  WifiOff,
} from "lucide-react";

const STATUS_COLORS = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800",
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [helpful, setHelpful] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // "close" | "reopen"
  const [actionMsg, setActionMsg] = useState(null);
  // Optimistic comments — shown immediately before server refresh
  const [optimisticComments, setOptimisticComments] = useState([]);
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  const bottomRef = useRef(null);

  // reactions: { [commentId]: { emoji: [uid, ...] } }
  const [reactions, setReactions] = useState({});
  const [emojiPickerFor, setEmojiPickerFor] = useState(null); // commentId
  const emojiPickerRef = useRef(null);
  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

  // WebSocket
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketsApi.getById(ticketId);
      setTicket(data);
      setOptimisticComments([]); // clear optimistic once real data arrives
      // Seed reactions from comments
      const r = {};
      (data.comments || []).forEach((c) => { if (c.reactions) r[c.id] = c.reactions; });
      setReactions(r);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  // Scroll to bottom when new comments appear
  useEffect(() => {
    if (optimisticComments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [optimisticComments]);

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

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!ticketId || !user) return;
    let ws = null;
    let reconnectTimer = null;

    const connect = async () => {
      try {
        const token = await user.getIdToken();
        ws = createTicketSocket(ticketId, token, (msg) => {
          if (msg.type === "new_comment") {
            // Only add if not already present (avoid duplicate from own send)
            setTicket((prev) => {
              if (!prev) return prev;
              const exists = prev.comments?.some((c) => c.id === msg.comment.id);
              if (exists) return prev;
              return {
                ...prev,
                comments: [...(prev.comments || []), msg.comment],
                comment_count: (prev.comment_count || 0) + 1,
              };
            });
            setOptimisticComments([]);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
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
          // Reconnect after 3s
          reconnectTimer = setTimeout(connect, 3000);
        };
        wsRef.current = ws;
      } catch { /* ignore auth errors */ }
    };

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [ticketId, user]);

  const handleReact = async (commentId, emoji) => {
    setEmojiPickerFor(null);
    const uid = user?.uid;
    if (!uid) return;
    // Optimistic update
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
      // revert on error by re-fetching
      fetchTicket();
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const text = reply.trim();
    // Optimistic update
    const tempComment = {
      id: `temp-${Date.now()}`,
      author_name: "You",
      author_role: "student",
      text,
      created_at: new Date().toISOString(),
      is_internal: false,
    };
    setOptimisticComments((prev) => [...prev, tempComment]);
    setReply("");
    try {
      setSubmitting(true);
      setSubmitError(null);
      await ticketsApi.addComment(ticketId, text);
      await fetchTicket();
    } catch (err) {
      setSubmitError(err.message);
      setOptimisticComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setReply(text);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    try {
      setActionLoading("close");
      setActionMsg(null);
      await ticketsApi.close(ticketId);
      setTicket((prev) => ({ ...prev, status: "closed" }));
      setActionMsg({ type: "success", text: "Ticket closed successfully." });
    } catch (err) {
      setActionMsg({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopen = async () => {
    try {
      setActionLoading("reopen");
      setActionMsg(null);
      await ticketsApi.reopen(ticketId);
      setTicket((prev) => ({ ...prev, status: "open" }));
      setActionMsg({ type: "success", text: "Ticket reopened. We'll look into it again." });
    } catch (err) {
      setActionMsg({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    try {
      setDeletingAttachment(fileId);
      await ticketsApi.deleteAttachment(ticketId, fileId);
      setTicket((prev) => ({
        ...prev,
        attachments: (prev.attachments || []).filter((a) => a.file_id !== fileId),
      }));
    } catch (err) {
      setActionMsg({ type: "error", text: err.message });
    } finally {
      setDeletingAttachment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="mx-auto animate-spin text-teal-500 mb-3" />
          <p className="text-gray-500">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
          <p className="text-red-600 font-medium">{error || "Ticket not found"}</p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 text-teal-600 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Separate admin replies from student comments
  const adminComments = (ticket.comments || []).filter((c) => c.author_role === "admin");
  const allComments = [...(ticket.comments || []), ...optimisticComments];

  // Build a simple timeline from ticket data
  const timeline = [
    { type: "created", title: "Ticket created", description: `Submitted by ${ticket.student_name || "you"}`, time: ticket.created_at },
    ...(ticket.assigned_to ? [{ type: "assigned", title: "Ticket assigned", description: `Assigned to ${ticket.assigned_to}`, time: ticket.updated_at }] : []),
    ...(ticket.comments || []).map((c) => ({
      type: c.author_role === "admin" ? "admin" : "student",
      title: c.author_role === "admin" ? `${c.author_name} replied` : "You replied",
      description: c.text.slice(0, 60) + (c.text.length > 60 ? "…" : ""),
      time: c.created_at,
    })),
  ].sort((a, b) => new Date(a.time) - new Date(b.time));

  const canClose = !["closed"].includes(ticket.status);
  const canReopen = ["resolved", "closed"].includes(ticket.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/my-tickets")} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <p className="text-sm text-teal-600 font-medium">
                  Dashboard / My Tickets / #{ticket.id.slice(-6).toUpperCase()}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">Ticket Details</h1>
              </div>
            </div>
            {/* Close / Reopen actions */}
            <div className="flex items-center gap-2">
              {canReopen && (
                <button
                  onClick={handleReopen}
                  disabled={actionLoading === "reopen"}
                  className="flex items-center gap-2 px-4 py-2 border border-teal-300 text-teal-700 hover:bg-teal-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {actionLoading === "reopen"
                    ? <Loader size={15} className="animate-spin" />
                    : <RotateCcw size={15} />}
                  Reopen Ticket
                </button>
              )}
              {canClose && (
                <button
                  onClick={handleClose}
                  disabled={actionLoading === "close"}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {actionLoading === "close"
                    ? <Loader size={15} className="animate-spin" />
                    : <XCircle size={15} />}
                  Close Ticket
                </button>
              )}
            </div>
          </div>
          {/* Action feedback */}
          {actionMsg && (
            <div className={`ml-14 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              actionMsg.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {actionMsg.type === "success"
                ? <CheckCircle size={15} />
                : <AlertCircle size={15} />}
              {actionMsg.text}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    #{ticket.id.slice(-6).toUpperCase()} · Submitted {formatDate(ticket.created_at)}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_COLORS[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-sm text-gray-600">📂 {ticket.category}</span>
                {ticket.course && <span className="text-sm text-gray-600">📚 {ticket.course.split(" - ")[0]}</span>}
                {ticket.assigned_to && (
                  <span className="text-sm text-gray-600">👤 {ticket.assigned_to}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{ticket.description}</p>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip size={18} />
                  Attachments ({ticket.attachments.length})
                </h3>
                <div className="space-y-2">
                  {ticket.attachments.map((att) => {
                    const isImage = att.content_type?.startsWith("image/");
                    const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
                    return (
                      <div key={att.file_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group">
                        <div className="flex items-center gap-3 min-w-0">
                          {isImage
                            ? <Image size={18} className="text-teal-500 flex-shrink-0" />
                            : <FileText size={18} className="text-gray-400 flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{att.filename}</p>
                            <p className="text-xs text-gray-400">{att.size ? `${(att.size / 1024).toFixed(1)} KB` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={`${BASE_URL}${att.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={att.filename}
                            className="p-1.5 hover:bg-teal-100 rounded text-teal-600 transition"
                            title="Download"
                          >
                            <Download size={15} />
                          </a>
                          {ticket.user_id === ticket.student_id && ticket.status !== "closed" && (
                            <button
                              onClick={() => handleDeleteAttachment(att.file_id)}
                              disabled={deletingAttachment === att.file_id}
                              className="p-1.5 hover:bg-red-100 rounded text-red-500 transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingAttachment === att.file_id
                                ? <Loader size={15} className="animate-spin" />
                                : <Trash2 size={15} />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversation */}
            {allComments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Conversation ({(ticket.comments || []).length})
                  </h3>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${wsConnected ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                    {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {wsConnected ? "Live" : "Offline"}
                  </span>
                </div>
                <div className="space-y-6">
                  {allComments.map((comment) => {
                    const isTemp = comment.id.startsWith("temp-");
                    const commentReactions = reactions[comment.id] || {};
                    const uid = user?.uid;
                    return (
                      <div key={comment.id} className={`flex gap-4 group/msg ${isTemp ? "opacity-60" : ""}`}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                            comment.author_role === "admin"
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {getInitials(comment.author_name)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-semibold text-gray-900 text-sm">{comment.author_name}</span>
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                comment.author_role === "admin" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                              }`}>
                                {isTemp ? "sending…" : comment.author_role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                              {/* Emoji picker trigger */}
                              {!isTemp && (
                                <div className="relative">
                                  <button
                                    onClick={() => setEmojiPickerFor(emojiPickerFor === comment.id ? null : comment.id)}
                                    className="opacity-0 group-hover/msg:opacity-100 transition p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                    title="React"
                                  >
                                    <Smile size={14} />
                                  </button>
                                  {emojiPickerFor === comment.id && (
                                    <div
                                      ref={emojiPickerRef}
                                      className="absolute right-0 top-7 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex gap-1"
                                    >
                                      {EMOJIS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => handleReact(comment.id, emoji)}
                                          className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-100"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{comment.text}</p>

                          {/* Reaction bubbles */}
                          {Object.keys(commentReactions).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Object.entries(commentReactions).map(([emoji, users]) =>
                                users.length > 0 ? (
                                  <button
                                    key={emoji}
                                    onClick={() => !isTemp && handleReact(comment.id, emoji)}
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
                  <div ref={bottomRef} />
                </div>
              </div>
            )}

            {/* Reply Box / Status Banner */}
            {ticket.status === "closed" ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
                <XCircle size={28} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">This ticket is closed.</p>
                <p className="text-gray-500 text-sm mt-1">If your issue persists, reopen it or create a new ticket.</p>
                <button
                  onClick={handleReopen}
                  disabled={actionLoading === "reopen"}
                  className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 border border-teal-300 text-teal-700 hover:bg-teal-50 rounded-lg text-sm font-medium transition"
                >
                  {actionLoading === "reopen" ? <Loader size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  Reopen Ticket
                </button>
              </div>
            ) : ticket.status === "resolved" ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">This ticket has been resolved.</p>
                    <p className="text-green-700 text-xs mt-0.5">Still having issues? Add a reply below and we'll reopen it.</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Still need help?</h3>
                  <form onSubmit={handleSubmitReply}>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Describe the ongoing issue..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                      disabled={submitting}
                    />
                    {submitError && <p className="text-red-600 text-xs mt-1">{submitError}</p>}
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={submitting || !reply.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                        {submitting ? "Sending…" : "Send Reply"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Reply</h3>
                <form onSubmit={handleSubmitReply}>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your message here..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    disabled={submitting}
                  />
                  {submitError && <p className="text-red-600 text-sm mt-2">{submitError}</p>}
                  <div className="flex items-center justify-end mt-4">
                    <button
                      type="submit"
                      disabled={submitting || !reply.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                      {submitting ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Ticket Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ticket Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="text-gray-900">{ticket.category}</span>
                </div>
                {ticket.course && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Course</span>
                    <span className="text-gray-900">{ticket.course.split(" - ")[0]}</span>
                  </div>
                )}
                {ticket.assigned_to && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned to</span>
                    <span className="text-gray-900">{ticket.assigned_to}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Replies</span>
                  <span className="text-gray-900">{allComments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900">{formatDate(ticket.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-gray-900">{formatDate(ticket.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        event.type === "admin" ? "bg-teal-500"
                        : event.type === "assigned" ? "bg-orange-500"
                        : event.type === "student" ? "bg-blue-400"
                        : "bg-green-500"
                      }`} />
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Account</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {getInitials(ticket.student_name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{ticket.student_name || "You"}</p>
                  <p className="text-xs text-gray-500">{ticket.student_email}</p>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-200 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tickets</span>
                  <span className="font-semibold text-gray-900">{ticket.student_total_tickets ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Open Tickets</span>
                  <span className="font-semibold text-gray-900">{ticket.student_open_tickets ?? "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
