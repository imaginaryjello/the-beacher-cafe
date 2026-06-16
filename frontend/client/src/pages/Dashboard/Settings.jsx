// src/pages/Dashboard/Settings.jsx
// OWNER ONLY — edit per-day café hours, rules, info
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

// FIX 3: a safe default so we never crash on a missing day
const DEFAULT_DAY = { open: "08:00", close: "20:00", closed: false };

// Helper: 08:00 → 8:00 AM (for live preview)
const fmt = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ampm}`;
};

// Helper: group consecutive days with same hours for preview
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

const Settings = () => {
  const { token, user } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);
  const [confirmApplyAll, setConfirmApplyAll] = useState(false); // FIX 1: confirm modal
  const [dirty, setDirty] = useState(false); // SMELL: track unsaved changes
  const timeoutRef = useRef(null);

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

  // SMELL FIX: clean up the success timeout on unmount
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // SMELL: warn before leaving with unsaved changes
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
        // FIX 3: fall back to DEFAULT_DAY if this day is missing
        [dayKey]: { ...(s.hours[dayKey] || DEFAULT_DAY), [field]: value },
      },
    }));
    setDirty(true);
  };

  // FIX 1: apply-to-all now copies only open/close (NOT the closed flag)
  // and goes through a confirmation
  const doApplyToAll = () => {
    const mon = settings.hours.mon || DEFAULT_DAY;
    setSettings((s) => ({
      ...s,
      hours: DAYS.reduce((acc, d) => {
        // Keep each day's existing closed flag, only copy the times
        const existing = s.hours[d.key] || DEFAULT_DAY;
        acc[d.key] = {
          open: mon.open,
          close: mon.close,
          closed: existing.closed,
        };
        return acc;
      }, {}),
    }));
    setDirty(true);
    setConfirmApplyAll(false);
  };

  // FIX 2: validate open < close for every open day before saving
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
    // FIX 2: block save if hours are invalid
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

  const preview = groupHours(settings.hours);

  return (
    <div className="max-w-2xl" style={{ fontFamily: "Georgia, serif" }}>
      <div className="mb-6">
        <h1 className="text-3xl text-[#3f2a1d]">Café Settings</h1>
        <p className="text-sm text-[#6b5a47] mt-1">
          These control your reservation form and public site.
        </p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">
            ×
          </button>
        </div>
      )}
      {dirty && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm mb-4">
          You have unsaved changes.
        </div>
      )}

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
            const day = settings.hours[d.key] || DEFAULT_DAY; // FIX 3: safe fallback
            return (
              <div
                key={d.key}
                className="flex items-center gap-3 py-2 border-b border-[#3f2a1d]/5 last:border-0"
              >
                <span className="w-24 text-sm text-[#3f2a1d] flex-shrink-0">
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
                  <span className="text-xs text-[#6b5a47]">Closed</span>
                </label>
              </div>
            );
          })}
        </div>

        {/* LIVE PREVIEW — how it shows on the public site */}
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
        <h2 className="text-lg font-semibold text-[#3f2a1d] mb-4">Café Info</h2>
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

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#3f2a1d] hover:bg-[#5a3e2b] text-[#f5e8c7] px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>

      {/* FIX 1: confirm modal for apply-to-all */}
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
