// src/components/NotificationBell.jsx
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../pages/context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────
// TIME AGO helper
// ─────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

// ─────────────────────────────────────────
// TYPE CONFIG — icon + label per type
// ─────────────────────────────────────────
const TYPE_CONFIG = {
  new_member: { icon: "👤", label: "New Member", color: "text-[#c2410c]" },
  reservation: { icon: "📅", label: "Reservation", color: "text-blue-600" },
  system: { icon: "⚙️", label: "System", color: "text-gray-500" },
  menu_update: { icon: "📋", label: "Menu Update", color: "text-green-600" },
};

const NotificationBell = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  // ── CLOSE ON OUTSIDE CLICK ──
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── POLL UNREAD COUNT every 30s ──
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUnreadCount(data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // ── FETCH FULL LIST when bell is opened ──
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications(); // load list fresh every time bell opens
  };

  // ── MARK SINGLE AS READ ──
  const markRead = async (notification) => {
    if (notification.read) {
      // Already read — just navigate
      handleNavigate(notification);
      return;
    }
    try {
      await fetch(`${API}/api/notifications/${notification._id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state immediately — don't wait for re-fetch
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      handleNavigate(notification);
    } catch (_) {}
  };

  // ── NAVIGATE based on notification type ──
  const handleNavigate = (notification) => {
    setOpen(false);
    if (notification.type === "new_member") {
      navigate("/dashboard/members");
    } else if (notification.type === "reservation") {
      navigate("/dashboard/reservations");
    }
  };

  // ── MARK ALL READ ──
  const markAllRead = async () => {
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── BELL BUTTON ── */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-[#f5e8c7] transition-colors"
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#c2410c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── DROPDOWN ──
          WHY fixed at base: a 320px panel anchored to the bell clips past the
          left edge of a 375px screen; on phones it pins to the viewport with
          16px gutters instead, and returns to bell-anchored from sm+ */}
      {open && (
        <div className="fixed inset-x-4 top-20 w-auto sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80 bg-white border border-[#3f2a1d]/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3f2a1d]/10">
            <h3
              className="text-sm font-semibold text-[#3f2a1d]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-[#c2410c] text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#c2410c] hover:underline"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 bg-[#f5e8c7] rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-[#f5e8c7] rounded w-3/4" />
                      <div className="h-3 bg-[#f5e8c7] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p
                  className="text-sm text-[#6b5a47]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                return (
                  <button
                    key={n._id}
                    onClick={() => markRead(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-[#f5e8c7] transition-colors border-b border-[#3f2a1d]/5 last:border-0 ${
                      !n.read ? "bg-[#fdf8f0]" : "bg-white"
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full bg-[#f5e8c7] flex items-center justify-center shrink-0 text-base">
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-xs font-medium ${config.color}`}
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {config.label}
                        </span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 bg-[#c2410c] rounded-full shrink-0" />
                        )}
                      </div>
                      <p
                        className="text-xs text-[#3f2a1d] leading-relaxed line-clamp-2"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {n.message}
                      </p>
                      <p className="text-xs text-[#999] mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-[#3f2a1d]/10 text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard/members");
                }}
                className="text-xs text-[#c2410c] hover:underline"
                style={{ fontFamily: "Georgia, serif" }}
              >
                View all members →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
