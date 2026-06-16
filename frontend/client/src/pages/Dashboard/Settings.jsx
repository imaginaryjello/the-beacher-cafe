// src/pages/Dashboard/Settings.jsx
// OWNER ONLY — edit per-day café hours, rules, info
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

const Settings = () => {
  const { token, user } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const isOwner = user?.role === "admin";

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.settings);
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => setSettings((s) => ({ ...s, [field]: value }));

  // Update a specific day's hours
  const setDayHour = (dayKey, field, value) => {
    setSettings((s) => ({
      ...s,
      hours: {
        ...s.hours,
        [dayKey]: { ...s.hours[dayKey], [field]: value },
      },
    }));
  };

  // Copy Monday's hours to all weekdays — handy shortcut
  const applyToAll = () => {
    const mon = settings.hours.mon;
    setSettings((s) => ({
      ...s,
      hours: DAYS.reduce((acc, d) => {
        acc[d.key] = { ...mon };
        return acc;
      }, {}),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSuccessMsg("Settings saved.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else setError(data.message);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-[#3f2a1d]" style={{ fontFamily: "Georgia, serif" }}>
          Only the owner can edit settings.
        </p>
      </div>
    );
  }

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-white rounded-xl animate-pulse border border-[#3f2a1d]/10"
          />
        ))}
      </div>
    );
  }

  const label = "block text-xs font-medium text-[#6b5a47] mb-1";
  const input =
    "w-full p-2.5 border border-[#3f2a1d]/20 rounded-lg text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] text-sm";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1
          className="text-3xl text-[#3f2a1d]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Café Settings
        </h1>
        <p
          className="text-sm text-[#6b5a47] mt-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          These control your reservation form and public site.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* PER-DAY HOURS */}
      <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Opening Hours
          </h2>
          <button
            onClick={applyToAll}
            className="text-xs text-[#c2410c] hover:underline"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Apply Monday to all days
          </button>
        </div>

        <div className="space-y-2">
          {DAYS.map((d) => {
            const day = settings.hours[d.key];
            return (
              <div
                key={d.key}
                className="flex items-center gap-3 py-2 border-b border-[#3f2a1d]/5 last:border-0"
              >
                <span
                  className="w-24 text-sm text-[#3f2a1d] flex-shrink-0"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {d.label}
                </span>

                {day.closed ? (
                  <span className="flex-1 text-sm text-gray-400 italic">
                    Closed
                  </span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      className={input + " !w-auto"}
                      value={day.open}
                      onChange={(e) =>
                        setDayHour(d.key, "open", e.target.value)
                      }
                    />
                    <span className="text-[#6b5a47] text-sm">to</span>
                    <input
                      type="time"
                      className={input + " !w-auto"}
                      value={day.close}
                      onChange={(e) =>
                        setDayHour(d.key, "close", e.target.value)
                      }
                    />
                  </div>
                )}

                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={day.closed}
                    onChange={(e) =>
                      setDayHour(d.key, "closed", e.target.checked)
                    }
                    className="accent-[#c2410c]"
                  />
                  <span
                    className="text-xs text-[#6b5a47]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Closed
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* RULES */}
      <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-4 shadow-sm">
        <h2
          className="text-lg font-semibold text-[#3f2a1d] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Reservation Rules
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Max party size</label>
            <input
              type="number"
              min="1"
              className={input}
              value={settings.maxPartySize}
              onChange={(e) => set("maxPartySize", Number(e.target.value))}
            />
          </div>
          <div>
            <label className={label}>Max days ahead</label>
            <input
              type="number"
              min="1"
              className={input}
              value={settings.maxDaysAhead}
              onChange={(e) => set("maxDaysAhead", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-4 shadow-sm">
        <h2
          className="text-lg font-semibold text-[#3f2a1d] mb-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Café Info
        </h2>
        <div className="space-y-4">
          <div>
            <label className={label}>Phone</label>
            <input
              type="text"
              className={input}
              value={settings.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Address</label>
            <input
              type="text"
              className={input}
              value={settings.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT */}
      <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold text-[#3f2a1d]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Announcement Banner
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcementActive}
              onChange={(e) => set("announcementActive", e.target.checked)}
              className="accent-[#c2410c]"
            />
            <span
              className="text-sm text-[#6b5a47]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Show on site
            </span>
          </label>
        </div>
        <input
          type="text"
          className={input}
          placeholder="e.g. Closed Dec 25 for the holidays"
          value={settings.announcement}
          onChange={(e) => set("announcement", e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default Settings;
