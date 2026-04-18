import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AdminNav from "../components/AdminNav";
import { ticketsApi } from "../api";
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Users, RefreshCw } from "lucide-react";

function ProgressBar({ value, max, color = "bg-teal-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const CATEGORY_COLORS = ["bg-teal-500", "bg-purple-500", "bg-blue-500", "bg-orange-500", "bg-pink-500"];
const PRIORITY_COLORS = { urgent: "bg-red-600", high: "bg-red-400", medium: "bg-yellow-400", low: "bg-blue-400" };

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getStats();
      setStats(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStats(); }, []);

  const metricCards = stats
    ? [
        { label: "Total Tickets", value: stats.total, icon: AlertCircle, color: "text-blue-600", bgColor: "bg-blue-50" },
        { label: "Open", value: stats.open, icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
        { label: "Resolution Rate", value: `${stats.resolution_rate}%`, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
        { label: "In Progress", value: stats.in_progress, icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav user={user} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-teal-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Live ticket insights</p>
            </div>
          </div>
          <button onClick={loadStats} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className={`${m.bgColor} border border-gray-200 dark:border-gray-700 rounded-xl p-6`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{m.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{m.value}</p>
                    </div>
                    <Icon className={m.color} size={24} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tickets by Status</h2>
              <div className="space-y-4">
                {[
                  { label: "Open", value: stats.open },
                  { label: "In Progress", value: stats.in_progress },
                  { label: "Resolved", value: stats.resolved },
                  { label: "Closed", value: stats.closed },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <ProgressBar value={item.value} max={stats.total} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tickets by Category</h2>
              {Object.keys(stats.by_category).length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats.by_category).map(([cat, count], i) => (
                    <div key={cat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                      </div>
                      <ProgressBar value={count} max={stats.total} color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tickets by Priority</h2>
              {Object.keys(stats.by_priority).length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats.by_priority).map(([p, count]) => (
                    <div key={p}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{p}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                      </div>
                      <ProgressBar value={count} max={stats.total} color={PRIORITY_COLORS[p] || "bg-gray-400"} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                <Users size={20} className="inline mr-2 text-teal-600" />
                Most Active Students
              </h2>
              {stats.top_students.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.top_students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center font-semibold text-sm">
                          {s.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.tickets} tickets</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
