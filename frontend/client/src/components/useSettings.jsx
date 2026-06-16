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
