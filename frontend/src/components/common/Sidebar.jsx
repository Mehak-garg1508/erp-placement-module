import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = {
  admin: [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/students", icon: "👨‍🎓", label: "Students" },
    { path: "/companies", icon: "🏢", label: "Companies" },
    { path: "/jobs", icon: "💼", label: "Jobs" },
    { path: "/applications", icon: "📋", label: "Applications" },
  ],
  placement_officer: [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/students", icon: "👨‍🎓", label: "Students" },
    { path: "/companies", icon: "🏢", label: "Companies" },
    { path: "/jobs", icon: "💼", label: "Jobs" },
    { path: "/applications", icon: "📋", label: "Applications" },
  ],
  student: [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/jobs", icon: "💼", label: "Browse Jobs" },
    { path: "/my-applications", icon: "📋", label: "My Applications" },
    { path: "/profile", icon: "👤", label: "My Profile" },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-10">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">🎓 ERP Placement</h1>
        <p className="text-xs text-gray-400 mt-1">Management System</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
        >
          <span>🚪</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
