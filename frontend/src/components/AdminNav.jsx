import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Ticket, BarChart3, Settings, Bell, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import ThemeToggle from "./ThemeToggle";

export default function AdminNav({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Tickets", icon: Ticket, path: "/admin/tickets" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const userInitials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "A";

  return (
    <div className="bg-gray-900 dark:bg-gray-950 text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center font-bold">
              📋
            </div>
            <div>
              <p className="text-sm text-gray-400">Samadhan</p>
              <p className="text-lg font-bold">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-teal-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 hover:bg-gray-800 rounded-lg transition relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center font-semibold text-sm">
                {userInitials}
              </div>
              <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-lg transition" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
