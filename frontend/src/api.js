import { auth } from "./firebase";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function request(path, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// ── Tickets ───────────────────────────────────────────────────────────────────

export const ticketsApi = {
  // Returns { tickets, total, page, limit, pages }
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== "" && v !== "all"))
    ).toString();
    return request(`/api/tickets${qs ? `?${qs}` : ""}`);
  },

  getById: (id) => request(`/api/tickets/${id}`),

  create: (data) =>
    request("/api/tickets/", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/api/tickets/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  close: (id) =>
    request(`/api/tickets/${id}/close`, { method: "PATCH" }),

  reopen: (id) =>
    request(`/api/tickets/${id}/reopen`, { method: "PATCH" }),

  addComment: (ticketId, text, is_internal = false) =>
    request(`/api/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text, is_internal }),
    }),

  getStats: () => request("/api/tickets/admin/stats"),

  getMyStats: () => request("/api/tickets/my/stats"),

  uploadAttachments: async (ticketId, files) => {
    const token = await getAuthToken();
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await fetch(`${BASE_URL}/api/tickets/${ticketId}/attachments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },

  deleteAttachment: (ticketId, fileId) =>
    request(`/api/tickets/${ticketId}/attachments/${fileId}`, { method: "DELETE" }),

  reactToComment: (ticketId, commentId, emoji) =>
    request(`/api/tickets/${ticketId}/comments/${commentId}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: () => request("/api/tickets/notifications/all"),

  markRead: (ids) =>
    request("/api/tickets/notifications/read", {
      method: "PATCH",
      body: JSON.stringify({ notification_ids: ids }),
    }),

  markAllRead: () =>
    request("/api/tickets/notifications/read-all", { method: "PATCH" }),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsApi = {
  get: () => request("/api/settings/"),
  update: (data) => request("/api/settings/", { method: "PATCH", body: JSON.stringify(data) }),
  getAdmins: () => request("/api/settings/admins"),
};

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const faqApi = {
  search: (q, category = null) => {
    const params = new URLSearchParams({ q, limit: 3 });
    if (category) params.append("category", category);
    return fetch(`${BASE_URL}/api/faq/search?${params}`)
      .then((r) => r.json())
      .catch(() => ({ faqs: [] }));
  },
};

// ── WebSocket helper ──────────────────────────────────────────────────────────

const WS_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8000")
  .replace(/^http/, "ws");

export function createTicketSocket(ticketId, token, onMessage) {
  const url = `${WS_BASE}/ws/ticket/${ticketId}?token=${encodeURIComponent(token)}`;
  const ws = new WebSocket(url);
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)); } catch { /* ignore */ }
  };
  ws.onerror = () => {};
  return ws;
}
