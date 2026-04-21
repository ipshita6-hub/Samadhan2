import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AdminNav from "../components/AdminNav";
import { ticketsApi } from "../api";
import { BarChart3, Clock, CheckCircle, AlertCircle, Users, RefreshCw, Timer } from "lucide-react";

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

function formatResolutionTime(hours) {
  if (hours === null || hours === undefined) return "N/A";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = (hours / 24).toFixed(1);
  return `${days}d`;
}

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
        {
          label: "Avg Resolution Time",
          value: formatResolutionTime(stats.avg_resolution_hours),
          icon: Timer,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          sub: stats.avg_resolution_hours !== null ? "per ticket" : "no data yet",
        },
      ]
    : [];

  // Resolution time distribution data
  const resolutionDist = stats?.resolution_time_distribution
    ? [
        { label: "Under 1 hour", value: stats.resolution_time_distribution.under_1h, color: "bg-green-500" },
        { label: "1 – 24 hours", value: stats.resolution_time_distribution["1_to_24h"], color: "bg-teal-500" },
        { label: "1 – 3 days", value: stats.resolution_time_distribution["1_to_3d"], color: "bg-yellow-400" },
        { label: "Over 3 days", value: stats.resolution_time_distribution.over_3d, color: "bg-red-400" },
      ]
    : [];
  const resolutionTotal = resolutionDist.reduce((s, r) => s + r.value, 0);

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
                <div key={i} className={`${m.bgColor} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{m.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{m.value}</p>
                      {m.sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.sub}</p>}
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
            {/* Status breakdown */}
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

            {/* Category breakdown */}
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

            {/* Priority breakdown */}
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

            {/* Resolution time distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Timer size={20} className="text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resolution Time</h2>
              </div>
              {resolutionTotal === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Timer size={32} className="text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">No resolved tickets yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Data will appear once tickets are resolved.</p>
                </div>
              ) : (
                <>
                  {/* Avg highlight */}
                  <div className="flex items-center justify-between mb-5 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-800">
                    <span className="text-sm font-medium text-teal-800 dark:text-teal-300">Average resolution time</span>
                    <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                      {formatResolutionTime(stats.avg_resolution_hours)}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {resolutionDist.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.value}
                            <span className="text-gray-400 font-normal ml-1 text-xs">
                              ({resolutionTotal > 0 ? Math.round((item.value / resolutionTotal) * 100) : 0}%)
                            </span>
                          </span>
                        </div>
                        <ProgressBar value={item.value} max={resolutionTotal} color={item.color} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Most active students */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                <Users size={20} className="inline mr-2 text-teal-600" />
                Most Active Students
              </h2>
              {stats.top_students.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stats.top_students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-full flex items-center justify-center font-semibold text-sm">
                          {s.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.email}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                        {s.tickets} tickets
                      </span>
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
