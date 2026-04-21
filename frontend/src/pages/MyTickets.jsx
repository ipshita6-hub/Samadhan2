import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ticketsApi } from "../api";
import ThemeToggle from "../components/ThemeToggle";
import {
  ArrowLeft, Plus, Filter, X, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight, Search, Download, RefreshCw,
} from "lucide-react";
import { formatDate, formatDateOnly } from "../utils/formatDate";

const STATUS_COLORS = {
  open:        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  resolved:    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  closed:      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};
const PRIORITY_COLORS = {
  low:    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  high:   "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  urgent: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};
const STATUS_BG = {
  open:        "bg-yellow-50 dark:bg-gray-800",
  in_progress: "bg-blue-50 dark:bg-gray-800",
  resolved:    "bg-green-50 dark:bg-gray-800",
  closed:      "bg-gray-50 dark:bg-gray-800",
};


function TicketRowSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse bg-white">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-3" />
          <div className="flex gap-2">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-8 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 8;

export default function MyTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({ status: "", priority: "", category: "" });
  const [showFilters, setShowFilters] = useState(false);

  // All tickets (for export + category list) — fetched once without pagination
  const [allTickets, setAllTickets] = useState([]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.category ? { category: filters.category } : {}),
      };
      const data = await ticketsApi.getAll(params);
      setTickets(data.tickets || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  // Fetch all tickets once for export + category list
  const fetchAll = useCallback(async () => {
    try {
      const data = await ticketsApi.getAll({ limit: 500 });
      setAllTickets(data.tickets || []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchPage(); }, [fetchPage]);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  const categories = [...new Set(allTickets.map((t) => t.category).filter(Boolean))];

  const hasActiveFilters = filters.status || filters.priority || filters.category;

  const clearFilters = () => {
    setFilters({ status: "", priority: "", category: "" });
    setSearch("");
    setPage(1);
  };

  // Sort client-side within the current page (server already sorts by created_at desc)
  const sorted = [...tickets].sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === "priority") {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    }
    return 0; // "newest" — already sorted by server
  });

  // Export to CSV
  const handleExport = () => {
    const rows = allTickets.map((t) => ({
      ID: t.id.slice(-6).toUpperCase(),
      Title: `"${t.title.replace(/"/g, '""')}"`,
      Status: t.status,
      Priority: t.priority,
      Category: t.category,
      Course: t.course || "",
      Created: formatDateOnly(t.created_at),
    }));
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <p className="text-sm text-teal-600 font-medium">Dashboard</p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tickets</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleExport}
                disabled={allTickets.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm disabled:opacity-40"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => navigate("/create-ticket")}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
              >
                <Plus size={16} />
                New Ticket
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-14">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Loading…" : `${total} ticket${total !== 1 ? "s" : ""} total`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search + Filter bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, ID, or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">By priority</option>
            </select>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition ${
                showFilters || hasActiveFilters
                  ? "bg-teal-50 dark:bg-teal-900/30 border-teal-300 text-teal-700 dark:text-teal-400"
                  : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Filter size={15} />
              Filters
              {hasActiveFilters && (
                <span className="bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {[filters.status, filters.priority, filters.category].filter(Boolean).length}
                </span>
              )}
            </button>
            <button onClick={fetchPage} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500" title="Refresh">
              <RefreshCw size={15} />
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All statuses</option>
                  {["open", "in_progress", "resolved", "closed"].map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All priorities</option>
                  {["urgent", "high", "medium", "low"].map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.status && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                  {filters.status.replace("_", " ")}
                  <button onClick={() => setFilters((p) => ({ ...p, status: "" }))}><X size={12} /></button>
                </span>
              )}
              {filters.priority && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  {filters.priority}
                  <button onClick={() => setFilters((p) => ({ ...p, priority: "" }))}><X size={12} /></button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {filters.category}
                  <button onClick={() => setFilters((p) => ({ ...p, category: "" }))}><X size={12} /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && total > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total} tickets
          </p>
        )}

        {/* Ticket list */}
        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => <TicketRowSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <AlertCircle size={36} className="mx-auto text-red-400 mb-3" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button onClick={fetchPage} className="mt-3 text-teal-600 hover:underline text-sm">Retry</button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            {total === 0 && !search && !hasActiveFilters ? (
              <>
                <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-teal-500" />
                </div>
                <p className="text-gray-700 dark:text-white font-semibold mb-1">No tickets yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Submit your first support request.</p>
                <button
                  onClick={() => navigate("/create-ticket")}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  Create a ticket
                </button>
              </>
            ) : (
              <>
                <CheckCircle size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No tickets match your filters.</p>
                <button onClick={clearFilters} className="mt-2 text-teal-600 hover:underline text-sm">Clear filters</button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((ticket) => (
              <div
                key={ticket.id}
                className={`${STATUS_BG[ticket.status] || "bg-white dark:bg-gray-800"} border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{ticket.title}</h3>
                      {ticket.has_unread && (
                        <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full" title="New reply" />
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 mb-2">{ticket.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                        {ticket.category}
                      </span>
                      {ticket.course && <span>📚 {ticket.course.split(" - ")[0]}</span>}
                      <span>⏱ {formatDate(ticket.created_at)}</span>
                      {ticket.comment_count > 0 && (
                        <span>{ticket.comment_count} repl{ticket.comment_count === 1 ? "y" : "ies"}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-40"
              >
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      page === p ? "bg-teal-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-40"
              >
                <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
