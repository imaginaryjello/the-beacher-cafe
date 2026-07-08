// src/pages/Dashboard/Settings.jsx
// Full settings for owner (admin), blocked dates only for co-admin.
import { useState, useEffect, useContext, useRef } from "react";
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

const DEFAULT_DAY = { open: "08:00", close: "20:00", closed: false };

// WHY T12:00:00: "YYYY-MM-DD" parsed at midnight local time can shift to the
// previous day in negative-UTC-offset timezones. Noon is always safe.
const formatDate = (d) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const fmt = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ampm}`;
};

const groupHours = (hours) => {
  const sig = (d) => (d.closed ? "closed" : `${d.open}-${d.close}`);
  const groups = [];
  let start = 0;
  for (let i = 1; i <= DAYS.length; i++) {
    const prev = hours[DAYS[i - 1].key] || DEFAULT_DAY;
    const curr = i < DAYS.length ? hours[DAYS[i].key] || DEFAULT_DAY : null;
    if (!curr || sig(prev) !== sig(curr)) {
      const range =
        start === i - 1
          ? DAYS[start].label.slice(0, 3)
          : `${DAYS[start].label.slice(0, 3)} – ${DAYS[i - 1].label.slice(0, 3)}`;
      const d = hours[DAYS[start].key] || DEFAULT_DAY;
      groups.push({
        days: range,
        time: d.closed ? "Closed" : `${fmt(d.open)} – ${fmt(d.close)}`,
      });
      start = i;
    }
  }
  return groups;
};

// ─────────────────────────────────────────
// BLOCKED DATES SECTION
// Visible to owner AND co-admin.
// Uses dedicated add/remove endpoints so co-admins don't need the full
// settings PUT permission.
// ─────────────────────────────────────────
const BlockedDatesSection = ({ blockedDates, setBlockedDates, token }) => {
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const sorted = [...blockedDates].sort((a, b) => a.date.localeCompare(b.date));

  const inputCls =
    "p-2.5 border border-[#3f2a1d]/20 rounded-lg text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] text-sm";

  const addDate = async () => {
    if (!newDate) {
      setError("Please select a date.");
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const res = await fetch(`${API}/api/settings/blocked-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newDate, reason: newReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setBlockedDates(data.blockedDates);
        setNewDate("");
        setNewReason("");
        setSuccess("Date blocked successfully.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error.");
    } finally {
      setAdding(false);
    }
  };

  const removeDate = async (date) => {
    setRemoving(date);
    setError(null);
    try {
      const res = await fetch(`${API}/api/settings/blocked-dates/${date}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBlockedDates(data.blockedDates);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 shadow-sm">
      <h2
        className="text-lg font-semibold text-[#3f2a1d] mb-1"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Blocked Dates
      </h2>
      <p
        className="text-xs text-[#6b5a47] mb-5"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Dates when no reservations are accepted. Customers will see a message
        asking them to call the café instead.
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2.5 text-sm mb-4">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Add form */}
      <div className="flex flex-wrap gap-2 mb-5">
        <input
          type="date"
          min={today}
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className={inputCls}
        />
        <input
          type="text"
          placeholder="Reason (optional, shown to customers)"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className={`${inputCls} flex-1 min-w-0`}
        />
        <button
          onClick={addDate}
          disabled={adding}
          className="bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
        >
          {adding ? "Blocking..." : "Block Date"}
        </button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <p
          className="text-sm text-[#6b5a47] italic text-center py-4"
          style={{ fontFamily: "Georgia, serif" }}
        >
          No dates are currently blocked.
        </p>
      ) : (
        <ul>
          {sorted.map((b) => (
            <li
              key={b.date}
              className="flex items-center justify-between gap-3 py-3 border-b border-[#3f2a1d]/5 last:border-0"
            >
              <div>
                <p
                  className="text-sm font-medium text-[#3f2a1d]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {formatDate(b.date)}
                </p>
                {b.reason && (
                  <p
                    className="text-xs text-[#6b5a47] mt-0.5"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {b.reason}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeDate(b.date)}
                disabled={removing === b.date}
                className="text-xs text-[#c2410c] hover:text-[#9a3009] font-medium disabled:opacity-40 shrink-0"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {removing === b.date ? "Removing..." : "Unblock"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN SETTINGS PAGE
// ─────────────────────────────────────────
const Settings = () => {
  const { token, user } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);
  const [confirmApplyAll, setConfirmApplyAll] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timeoutRef = useRef(null);

  const isOwner = user?.role === "admin";
  const isCoAdmin = user?.role === "coadmin";

  useEffect(() => {
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSettings(d.settings);
          setBlockedDates(d.settings.blockedDates || []);
        } else {
          setError("Failed to load settings.");
        }
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = (field, value) => {
    setSettings((s) => ({ ...s, [field]: value }));
    setDirty(true);
  };

  const setDayHour = (dayKey, field, value) => {
    setSettings((s) => ({
      ...s,
      hours: {
        ...s.hours,
        [dayKey]: { ...(s.hours[dayKey] || DEFAULT_DAY), [field]: value },
      },
    }));
    setDirty(true);
  };

  const doApplyToAll = () => {
    const mon = settings.hours.mon || DEFAULT_DAY;
    setSettings((s) => ({
      ...s,
      hours: DAYS.reduce((acc, d) => {
        const existing = s.hours[d.key] || DEFAULT_DAY;
        acc[d.key] = { open: mon.open, close: mon.close, closed: existing.closed };
        return acc;
      }, {}),
    }));
    setDirty(true);
    setConfirmApplyAll(false);
  };

  const validateHours = () => {
    for (const d of DAYS) {
      const day = settings.hours[d.key] || DEFAULT_DAY;
      if (!day.closed && day.open >= day.close) {
        return `${d.label}: closing time must be after opening time.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateHours();
    if (validationError) {
      setError(validationError);
      return;
    }
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
        setDirty(false);
        setSuccessMsg("Settings saved.");
        timeoutRef.current = setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  // Employees have no access to this page
  if (!isOwner && !isCoAdmin) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🔒</p>
        <p className="text-[#3f2a1d]" style={{ fontFamily: "Georgia, serif" }}>
          Only the owner can edit settings.
        </p>
      </div>
    );
  }

  if (loading) {
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

  // Settings failed to load — show error inline (skeleton would spin forever)
  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
        {error || "Failed to load settings."}
      </div>
    );
  }

  const label = "block text-xs font-medium text-[#6b5a47] mb-1";
  const input =
    "w-full p-2.5 border border-[#3f2a1d]/20 rounded-lg text-[#3f2a1d] bg-[#fdf8f0] focus:outline-none focus:border-[#c2410c] text-sm";
  const preview = isOwner ? groupHours(settings.hours) : null;

  return (
    <div className="max-w-2xl" style={{ fontFamily: "Georgia, serif" }}>
      <div className="mb-6">
        <h1 className="text-3xl text-[#3f2a1d]">
          {isOwner ? "Café Settings" : "Blocked Dates"}
        </h1>
        <p className="text-sm text-[#6b5a47] mt-1">
          {isOwner
            ? "These control your reservation form and public site."
            : "Mark dates when no reservations should be accepted."}
        </p>
      </div>

      {/* Error banner — shown for all users (covers load + save failures) */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Owner-only banners */}
      {isOwner && successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          ✓ {successMsg}
        </div>
      )}
      {isOwner && dirty && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm mb-4">
          You have unsaved changes.
        </div>
      )}

      {/* ── OWNER-ONLY SECTIONS ── */}
      {isOwner && (
        <>
          {/* PER-DAY HOURS */}
          <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#3f2a1d]">
                Opening Hours
              </h2>
              <button
                onClick={() => setConfirmApplyAll(true)}
                className="text-xs text-[#c2410c] hover:underline"
              >
                Apply Monday's times to all days
              </button>
            </div>

            <div className="space-y-2">
              {DAYS.map((d) => {
                const day = settings.hours[d.key] || DEFAULT_DAY;
                return (
                  <div
                    key={d.key}
                    className="flex items-center gap-3 py-2 border-b border-[#3f2a1d]/5 last:border-0"
                  >
                    <span className="w-24 text-sm text-[#3f2a1d] shrink-0">
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
                          className={input + " w-auto!"}
                          value={day.open}
                          onChange={(e) =>
                            setDayHour(d.key, "open", e.target.value)
                          }
                        />
                        <span className="text-[#6b5a47] text-sm">to</span>
                        <input
                          type="time"
                          className={input + " w-auto!"}
                          value={day.close}
                          onChange={(e) =>
                            setDayHour(d.key, "close", e.target.value)
                          }
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={day.closed}
                        onChange={(e) =>
                          setDayHour(d.key, "closed", e.target.checked)
                        }
                        className="accent-[#c2410c]"
                      />
                      <span className="text-xs text-[#6b5a47]">Closed</span>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[#3f2a1d]/10">
              <p className="text-xs font-medium text-[#6b5a47] mb-2">
                Preview (as shown on your site):
              </p>
              <div className="bg-[#f5e8c7] rounded-lg p-3">
                {preview.map((g, i) => (
                  <p key={i} className="text-sm text-[#3f2a1d]">
                    {g.days}: {g.time}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* RULES */}
          <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[#3f2a1d] mb-4">
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
            <h2 className="text-lg font-semibold text-[#3f2a1d] mb-4">
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
          <div className="bg-white border border-[#3f2a1d]/10 rounded-xl p-6 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#3f2a1d]">
                Announcement Banner
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.announcementActive}
                  onChange={(e) => set("announcementActive", e.target.checked)}
                  className="accent-[#c2410c]"
                />
                <span className="text-sm text-[#6b5a47]">Show on site</span>
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
        </>
      )}

      {/* BLOCKED DATES — visible to owner + co-admin */}
      <BlockedDatesSection
        blockedDates={blockedDates}
        setBlockedDates={setBlockedDates}
        token={token}
      />

      {/* Owner save button sits below blocked dates so layout flows top-to-bottom */}
      {isOwner && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      )}

      {/* Apply-to-all confirm modal */}
      {confirmApplyAll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-[#f5e8c7] border-2 border-[#3f2a1d] rounded-xl max-w-sm w-full p-6 shadow-xl">
            <p className="text-[#3f2a1d] text-base mb-2 font-semibold">
              Apply Monday's times everywhere?
            </p>
            <p className="text-[#6b5a47] text-sm mb-6">
              This copies Monday's open and close times to all 7 days. Each
              day's "closed" status stays as-is.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmApplyAll(false)}
                className="flex-1 py-2 rounded-full border-2 border-[#3f2a1d] text-[#3f2a1d] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={doApplyToAll}
                className="flex-1 py-2 rounded-full bg-[#c2410c] text-white text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
