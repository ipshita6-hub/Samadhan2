import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { ticketsApi } from "../api";
import NotificationBell from "../components/NotificationBell";
import { formatDate } from "../utils/formatDate";
import {
  ChevronLeft, ChevronRight, Search, Filter, Plus,
  CheckCircle, AlertCircle, LogOut, X, Zap, TrendingUp,
  MessageSquare, ArrowRight, Loader, RefreshCw,
} from "lucide-react";

const STATUS_COLORS = {
  open:        "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved:    "bg-green-100 text-green-800",
  closed:      "bg-gray-100 text-gray-800",
};
const PRIORITY_COLORS = {
  low:    "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high:   "bg-red-100 text-red-800",
  urgent: "bg-purple-100 text-purple-800",
};
const URGENCY_BORDER = {
  urgent: "border-l-4 border-l-purple-500",
  high:   "border-l-4 border-l-red-500",
  medium: "border-l-4 border-l-yellow-500",
  low:    "border-l-4 border-l-green-500",
};


function StatSkeleton() {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="px-6 py-5 animate-pulse border-l-4 border-l-gray-200">
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-8 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 5;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: [], priority: [] });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await ticketsApi.getMyStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch tickets (server-side)
  const fetchTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);
      setTicketsError(null);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.status.length === 1 ? { status: filters.status[0] } : {}),
        ...(filters.priority.length === 1 ? { priority: filters.priority[0] } : {}),
      };
      const data = await ticketsApi.getAll(params);
      setTickets(data.tickets || []);
      setTotalTickets(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setTicketsError(err.message);
    } finally {
      setTicketsLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // Reset to page 1 when filters/search change
  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ status: [], priority: [] });
    setSearch("");
  };

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0;

  const userInitials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const statCards = [
    { label: "Open",        key: "open",        icon: AlertCircle,   color: "text-yellow-500", bgColor: "bg-yellow-50",  borderColor: "border-yellow-200" },
    { label: "In Progress", key: "in_progress",  icon: Zap,           color: "text-blue-500",   bgColor: "bg-blue-50",    borderColor: "border-blue-200"   },
    { label: "Resolved",    key: "resolved",     icon: CheckCircle,   color: "text-green-500",  bgColor: "bg-green-50",   borderColor: "border-green-200"  },
    { label: "Total",       key: "total",        icon: MessageSquare, color: "text-purple-500", bgColor: "bg-purple-50",  borderColor: "border-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <button
                onClick={() => navigate("/my-tickets")}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-1 flex items-center gap-1 group"
              >
                View all tickets
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/create-ticket")}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
              >
                <Plus size={16} />
                New Ticket
              </button>
              <NotificationBell />
              <div className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-lg border border-teal-100">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold text-xs">
                  {userInitials}
                </div>
                <div className="text-sm hidden sm:block">
                  <p className="font-semibold text-gray-900 leading-tight">{user?.displayName || "Student"}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading
            ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
            : statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    onClick={() => { setFilters({ status: card.key !== "total" ? [card.key] : [], priority: [] }); setPage(1); }}
                    className={`${card.bgColor} ${card.borderColor} border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.[card.key] ?? 0}</p>
                      </div>
                      <div className={`${card.color} p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Tickets</h2>
              {!ticketsLoading && (
                <p className="text-xs text-gray-500 mt-0.5">{totalTickets} ticket{totalTickets !== 1 ? "s" : ""} total</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition ${
                  showFilters || hasActiveFilters
                    ? "bg-teal-50 border-teal-300 text-teal-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter size={15} />
                Filter
                {hasActiveFilters && (
                  <span className="bg-teal-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {filters.status.length + filters.priority.length}
                  </span>
                )}
              </button>
              <button onClick={fetchTickets} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500" title="Refresh">
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Filter by</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {["open", "in_progress", "resolved", "closed"].map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleFilter("status", s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                          filters.status.includes(s)
                            ? "bg-teal-500 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-teal-300"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</p>
                  <div className="flex flex-wrap gap-2">
                    {["urgent", "high", "medium", "low"].map((p) => (
                      <button
                        key={p}
                        onClick={() => toggleFilter("priority", p)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                          filters.priority.includes(p)
                            ? "bg-teal-500 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-teal-300"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket List */}
          <div className="divide-y divide-gray-100">
            {ticketsLoading ? (
              Array(3).fill(0).map((_, i) => <TicketSkeleton key={i} />)
            ) : ticketsError ? (
              <div className="px-6 py-12 text-center">
                <AlertCircle size={32} className="mx-auto text-red-300 mb-3" />
                <p className="text-red-500 text-sm">{ticketsError}</p>
                <button onClick={fetchTickets} className="mt-2 text-teal-600 hover:underline text-sm">Retry</button>
              </div>
            ) : tickets.length === 0 ? (
              <div className="px-6 py-16 text-center">
                {totalTickets === 0 && !search && !hasActiveFilters ? (
                  <>
                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={28} className="text-teal-500" />
                    </div>
                    <h3 className="text-gray-900 font-semibold mb-1">No tickets yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Submit your first support ticket and we'll get back to you quickly.</p>
                    <button
                      onClick={() => navigate("/create-ticket")}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Create your first ticket
                    </button>
                  </>
                ) : (
                  <>
                    <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No tickets match your search or filters.</p>
                    <button onClick={clearFilters} className="mt-2 text-teal-600 hover:underline text-sm">Clear filters</button>
                  </>
                )}
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`${URGENCY_BORDER[ticket.priority] || "border-l-4 border-l-gray-200"} px-6 py-4 hover:bg-gray-50 transition group`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-teal-700 transition truncate">
                          {ticket.title}
                        </h3>
                        {ticket.has_unread && (
                          <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full mt-1.5" title="New reply" />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-1 mb-2">{ticket.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                          {ticket.category}
                        </span>
                        {ticket.course && <span>📚 {ticket.course.split(" - ")[0]}</span>}
                        <span>⏱ {formatDate(ticket.created_at)}</span>
                        {ticket.comment_count > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={11} />
                            {ticket.comment_count}
                          </span>
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
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        page === p ? "bg-teal-500 text-white" : "hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
