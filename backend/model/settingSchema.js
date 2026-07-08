// backend/model/settingsSchema.js
import mongoose from "mongoose";

// WHY a sub-schema for a day:
// each day has its own open time, close time, and a "closed" flag
const dayHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: "08:00" },
    close: { type: String, default: "20:00" },
    closed: { type: Boolean, default: false }, // true = café shut that day
  },
  { _id: false }, // WHY _id: false — these are embedded, don't need their own ids
);

const settingsSchema = new mongoose.Schema(
  {
    // ── PER-DAY HOURS ──
    // Each day independent. Keys match day names for readability.
    hours: {
      mon: { type: dayHoursSchema, default: () => ({}) },
      tue: { type: dayHoursSchema, default: () => ({}) },
      wed: { type: dayHoursSchema, default: () => ({}) },
      thu: { type: dayHoursSchema, default: () => ({}) },
      fri: { type: dayHoursSchema, default: () => ({}) },
      sat: { type: dayHoursSchema, default: () => ({}) },
      sun: { type: dayHoursSchema, default: () => ({}) },
    },

    // ── RESERVATION RULES ──
    maxPartySize: { type: Number, default: 20 },
    maxDaysAhead: { type: Number, default: 60 },

    // ── CAFE INFO ──
    phone: { type: String, default: "416-699-3874" },
    address: { type: String, default: "2162 Queen St. E, Toronto" },

    // ── ANNOUNCEMENT ──
    announcement: { type: String, default: "" },
    announcementActive: { type: Boolean, default: false },

    // ── BLOCKED DATES ──
    // Specific calendar dates where reservations are turned off entirely.
    // Managed via /api/settings/blocked-dates (admin or co-admin).
    blockedDates: [
      {
        _id: false,                              // embedded, no separate id needed
        date: { type: String, required: true },  // "YYYY-MM-DD"
        reason: { type: String, default: "" },   // optional note shown to customers
      },
    ],
  },
  { timestamps: true },
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
