import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminNav from "../components/AdminNav";
import { ticketsApi } from "../api";
import {
  BarChart3, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Search, List, Grid3x3, Zap, User, MessageSquare,
} from "lucide-react";

const STATUS_COLOR = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};
const PRIORITY_COLOR = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  urgent: "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [ticketData, statsData] = await Promise.all([
          ticketsApi.getAll(),
          ticketsApi.getStats(),
        ]);
        setTickets(ticketData.tickets ?? ticketData);
        setStats(statsData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = tickets.filter((t) =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = stats
    ? [
        { label: "Total Tickets", value: stats.total, icon: MessageSquare, color: "text-blue-500", bgColor: "bg-blue-50", trend: `${stats.resolution_rate}% resolution rate`, trendUp: true },
        { label: "Open Tickets", value: stats.open, icon: AlertCircle, color: "text-orange-500", bgColor: "bg-orange-50", trend: `${stats.in_progress} in progress`, trendUp: false },
        { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-50", trend: `${stats.closed} closed`, trendUp: true },
        { label: "Categories", value: Object.keys(stats.by_category).length, icon: Clock, color: "text-purple-500", bgColor: "bg-purple-50", trend: "active categories", trendUp: true },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav user={user} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={32} className="text-teal-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage and respond to student tickets</p>
          </div>
          <button
            onClick={() => navigate("/admin/tickets")}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition shadow-md"
          >
            <Zap size={18} />
            All Tickets
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            Failed to load data: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`${stat.bgColor} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg bg-white dark:bg-gray-800`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trendUp ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                    <p className={`text-sm font-medium ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>{stat.trend}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 dark:from-gray-800 to-white dark:to-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Tickets</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-teal-100 text-teal-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <List size={20} />
                </button>
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-teal-100 text-teal-600" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <Grid3x3 size={20} />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading tickets...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No tickets found.</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.slice(0, 10).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/admin/ticket/${ticket.id}`)}
                  className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer border-l-4 border-l-transparent hover:border-l-teal-400"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><User size={14} />{ticket.student_name || "Unknown"}</span>
                        <span>📚 {ticket.category}</span>
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{ticket.id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLOR[ticket.priority] || "bg-gray-100 text-gray-800"}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[ticket.status] || "bg-gray-100 text-gray-800"}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > 10 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <button onClick={() => navigate("/admin/tickets")} className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                View all {filtered.length} tickets →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
