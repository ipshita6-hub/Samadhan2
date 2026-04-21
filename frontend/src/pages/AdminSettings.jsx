import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AdminNav from "../components/AdminNav";
import { settingsApi } from "../api";
import { Settings, Bell, Lock, Users, Save, Loader, CheckCircle, AlertCircle, Mail, Timer } from "lucide-react";

const DEFAULT = {
  siteName: "Samadhan",
  siteDescription: "Student Support System",
  emailNotifications: true,
  autoAssign: true,
  maxResponseTime: 24,
  maintenanceMode: false,
  slaWarnHours: 20,
  slaBreachHours: 48,
};

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([settingsApi.get(), settingsApi.getAdmins()]);
        setSettings({ ...DEFAULT, ...s });
        setAdmins(a);
      } catch (e) {
        setMsg({ type: "error", text: "Failed to load settings: " + e.message });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const updated = await settingsApi.update(settings);
      setSettings({ ...DEFAULT, ...updated });
      setMsg({ type: "success", text: "Settings saved successfully." });
    } catch (e) {
      setMsg({ type: "error", text: "Failed to save: " + e.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNav user={user} />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings size={32} className="text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage system configuration and preferences</p>
        </div>

        {msg && (
          <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${
            msg.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          }`}>
            {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={32} className="animate-spin text-teal-500" />
          </div>
        ) : (
          <>
            {/* General */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
                  <input type="text" name="siteName" value={settings.siteName} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Description</label>
                  <textarea name="siteDescription" value={settings.siteDescription} onChange={handleChange} rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Response Time (hours)</label>
                  <input type="number" name="maxResponseTime" value={settings.maxResponseTime} onChange={handleChange} min="1" max="168"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Bell size={24} className="text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Email notifications require SMTP credentials in the backend{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file
                (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">SMTP_HOST</code>,{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">SMTP_USER</code>,{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">SMTP_PASS</code>).
              </p>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail size={15} className="text-teal-600" />
                      Email notifications for ticket events
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Sends emails to students on ticket creation, status changes, new replies, and SLA alerts to admins.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="autoAssign" checked={settings.autoAssign} onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-assign tickets to available admins</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Automatically routes new tickets to the first available admin.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* SLA Tracking */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Timer size={24} className="text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">SLA Tracking</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                The SLA monitor runs in the background and alerts admins when tickets are taking too long to resolve.
                Alerts appear as in-app notifications and emails (if SMTP is configured).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warning threshold (hours)
                  </label>
                  <input type="number" name="slaWarnHours" value={settings.slaWarnHours} onChange={handleChange}
                    min="1" max="168"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-400 mt-1">
                    Admins get a ⏰ warning notification after this many hours with no resolution.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Breach threshold (hours)
                  </label>
                  <input type="number" name="slaBreachHours" value={settings.slaBreachHours} onChange={handleChange}
                    min="1" max="720"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <p className="text-xs text-gray-400 mt-1">
                    Admins get a ⚠️ breach alert after this many hours — SLA is considered violated.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle size={15} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  Changes take effect on the next check cycle (every 5 minutes).
                  Tickets that already triggered an alert won't re-alert unless they are re-opened.
                </p>
              </div>
            </div>

            {/* System */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock size={24} className="text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">System</h2>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable maintenance mode</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Students will see a maintenance notice when this is on.
                  </p>
                </div>
              </label>
              {settings.maintenanceMode && (
                <div className="mt-3 ml-7 flex items-center gap-2 text-xs text-orange-600 font-medium bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                  <AlertCircle size={14} />
                  Maintenance mode is ON — students will see a maintenance page.
                </div>
              )}
            </div>

            {/* Admin Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Users size={24} className="text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Users</h2>
              </div>
              {admins.length === 0 ? (
                <p className="text-gray-400 text-sm">No admins found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {["Name", "Email", "Role", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {admins.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{a.name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{a.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{a.role}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 rounded-full text-xs font-semibold">{a.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition disabled:opacity-60">
              {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
