// src/hooks/useSettings.js
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: no module-level cache — always fetch fresh on mount.
    // WHY: the old version cached forever, so public pages never
    // saw owner changes until a full server restart.
    fetch(`${API}/api/settings`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.settings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
};

// Is the café open right now, per its schedule, in TORONTO time?
// WHY Toronto: a visitor in another timezone must see the café's real status,
// not their own clock. Intl gives us the current weekday + HH:MM there.
export const isOpenNow = (hours) => {
  if (!hours) return false;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const val = (t) => parts.find((p) => p.type === t)?.value;
  const dayKey = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
  }[val("weekday")];
  const day = hours[dayKey];
  if (!day || day.closed) return false;
  const toMin = (s) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const nowMin = Number(val("hour")) * 60 + Number(val("minute"));
  // Assumes close > open on the same day — fine for café hours.
  return nowMin >= toMin(day.open) && nowMin < toMin(day.close);
};

// Resolve the neon sign state from the owner's mode + schedule.
// "auto" (default) follows the hours; "on"/"off" force it. null = not loaded.
export const signIsOpen = (settings) => {
  if (!settings) return null;
  const mode = settings.openSignMode || "auto";
  if (mode === "on") return true;
  if (mode === "off") return false;
  return isOpenNow(settings.hours);
};

export const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  const h12 = hr % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

export const formatHoursDisplay = (hours) => {
  if (!hours) return [];
  const order = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" },
  ];
  const sig = (d) => (d.closed ? "closed" : `${d.open}-${d.close}`);
  const groups = [];
  let start = 0;
  for (let i = 1; i <= order.length; i++) {
    const prev = hours[order[i - 1].key];
    const curr = i < order.length ? hours[order[i].key] : null;
    if (!curr || sig(prev) !== sig(curr)) {
      const startLabel = order[start].label;
      const endLabel = order[i - 1].label;
      const dayRange =
        start === i - 1 ? startLabel : `${startLabel} – ${endLabel}`;
      const d = hours[order[start].key];
      const timeText = d.closed
        ? "Closed"
        : `${formatTime(d.open)} – ${formatTime(d.close)}`;
      groups.push({ days: dayRange, time: timeText });
      start = i;
    }
  }
  return groups;
};
