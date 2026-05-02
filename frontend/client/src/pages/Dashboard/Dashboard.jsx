// src/pages/Dashboard/Dashboard.jsx
import { useState, useEffect, useContext } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isOwner = user?.role === "admin";

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Poll for unread notifications (owner only)
  // WHY polling not websocket: simpler for now, we'll upgrade later
  useEffect(() => {
    if (!isOwner) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUnreadCount(data.count);
      } catch (_) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [isOwner, token]);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard Home", icon: "🏠" },
    { to: "/dashboard/members", label: "Members", icon: "👥" },
    { to: "/dashboard/menu", label: "Menu Editor", icon: "📋" },
    { to: "/dashboard/specials", label: "Specials Editor", icon: "⭐" },
    { to: "/dashboard/gallery", label: "Gallery Manager", icon: "🖼️" },
    { to: "/dashboard/reservations", label: "Reservations", icon: "📅" },
  ];

  return (
    <div className="min-h-screen bg-[#f5e8c7] flex">
      {/* ====================== SIDEBAR ====================== */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#3f2a1d] shadow-xl transition-transform duration-300 
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#3f2a1d]">
          <h1 className="font-[Pacifico] text-3xl text-[#3f2a1d]">
            The Beacher Café
          </h1>
          <p className="text-sm text-[#6b5a47] mt-1">Management Dashboard</p>
          {/* Role indicator */}
          <span
            className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
              isOwner
                ? "bg-[#3f2a1d] text-[#f5e8c7]"
                : "bg-[#c2410c] text-white"
            }`}
            style={{ fontFamily: "Georgia, serif" }}
          >
            {isOwner ? "Owner" : "Co-Admin"}
          </span>
        </div>

        {/* Nav */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors text-sm
                    ${
                      isActive(link.to)
                        ? "bg-[#f5e8c7] text-[#3f2a1d] border border-[#c2410c]/30"
                        : "hover:bg-[#f5e8c7] text-[#3f2a1d]"
                    }`}
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  {/* Pending badge on Members link */}
                  {link.to === "/dashboard/members" && unreadCount > 0 && (
                    <span className="ml-auto bg-[#c2410c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: user info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3f2a1d]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3f2a1d] flex items-center justify-center flex-shrink-0">
              <span className="text-[#f5e8c7] font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-medium text-[#3f2a1d] truncate"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {user?.name}
              </p>
              <p className="text-xs text-[#6b5a47] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================== MAIN CONTENT ====================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#3f2a1d] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-2xl text-[#3f2a1d]"
            >
              ☰
            </button>
            <h2
              className="text-xl font-semibold text-[#3f2a1d]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {/* Dynamic page title based on route */}
              {location.pathname === "/dashboard" && "Home"}
              {location.pathname === "/dashboard/members" && "Team Members"}
              {location.pathname === "/dashboard/menu" && "Menu Editor"}
              {location.pathname === "/dashboard/specials" && "Specials Editor"}
              {location.pathname === "/dashboard/gallery" && "Gallery Manager"}
              {location.pathname === "/dashboard/reservations" &&
                "Reservations"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell — owner only */}
            {isOwner && (
              <Link
                to="/dashboard/members"
                className="relative p-2 rounded-full hover:bg-[#f5e8c7] transition-colors"
                title="Pending approvals"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c2410c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <span
              className="text-[#6b5a47] text-sm hidden sm:block"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {user?.name}
            </span>

            <button
              onClick={logout}
              className="bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-10">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
