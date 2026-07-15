// src/pages/reservation.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./navbar";
import Footer from "./footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Map a date string to the settings day key
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// Format "08:00" → "8:00 AM"
const fmt = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  const ampm = hr >= 12 ? "PM" : "AM";
  return `${hr % 12 || 12}:${m} ${ampm}`;
};

// Shared warm-paper input style for the redesigned form
const inputStyle =
  "w-full p-3 bg-white border border-[#3f2a1d]/20 rounded-lg focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20 transition-colors";

// Full-bleed backdrop: the café corner at golden hour, under a warm
// espresso gradient so the card stays readable at any width
const Backdrop = () => (
  <div className="absolute inset-0 z-0">
    <img
      src="/beacherfront.webp"
      alt=""
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-linear-to-b from-[#1f1209]/80 via-[#1f1209]/55 to-[#1f1209]/85" />
  </div>
);

export default function Reservations() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    date: "",
    time: "",
    notes: "",
    website: "", // website = honeypot
  });
  const [settings, setSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/api/settings`)
      .then((res) => {
        if (res.data.success) setSettings(res.data.settings);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  // FIX: derive the SELECTED day's hours from per-day settings.hours
  // (replaces the old flat settings.openTime / settings.closeTime)
  const selectedDayHours = (() => {
    if (!settings?.hours || !form.date) return null;
    const dayKey = DAY_KEYS[new Date(form.date + "T00:00").getDay()];
    return settings.hours[dayKey] || null;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/api/reservations`, form);
      if (res.data.success) setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = settings
    ? new Date(Date.now() + settings.maxDaysAhead * 86400000)
        .toISOString()
        .split("T")[0]
    : "";

  // ── SUCCESS STATE ──
  if (success) {
    return (
      <>
        <Navbar />
        {/* WHY -mb-16: Footer has mt-16, which shows a white band between our
          dark backdrop and the dark footer. Negative margin makes them flush. */}
      <div className="min-h-screen relative pt-24 sm:pt-28 px-4 sm:px-6 pb-16 -mb-16">
          <Backdrop />
          <div className="relative z-10 max-w-xl mx-auto bg-[#fdf8f0] rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#f5e8c7]/30 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1
              className="text-3xl font-bold text-[#3f2a1d] mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Reservation Received!
            </h1>
            <p
              className="text-[#6b5a47] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Thank you, {form.name}. We've got your request for {form.guests}{" "}
              on {form.date} at {fmt(form.time)}.
            </p>
            <p
              className="text-[#6b5a47] mb-8 text-sm"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Check your email — we've sent a confirmation, and you'll hear from
              us once it's accepted.
            </p>
            <a
              href="/"
              className="inline-block bg-[#c2410c] text-white px-10 py-3 rounded-full font-semibold hover:bg-[#9a3410] transition-colors"
            >
              Back to Home
            </a>

            {/* The community tile wall — a little story while they wait */}
            <figure className="mt-8">
              <img
                src="/wallart2.webp"
                alt="Tile mural at The Beacher Café, each square hand-painted by a regular"
                className="w-full h-24 object-cover rounded-xl border-2 border-[#3f2a1d]/15"
              />
              <figcaption
                className="text-xs text-[#6b5a47] italic mt-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                While you wait — come find your story on our tile wall.
              </figcaption>
            </figure>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ── FORM ──
  return (
    <>
      <Navbar />
      {/* WHY -mb-16: Footer has mt-16, which shows a white band between our
          dark backdrop and the dark footer. Negative margin makes them flush. */}
      <div className="min-h-screen relative pt-24 sm:pt-28 px-4 sm:px-6 pb-16 -mb-16">
        <Backdrop />

        {/* Postcard layout: story panel + form panel */}
        <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl border border-[#f5e8c7]/30">
          {/* ── STORY PANEL ──
              The café at night + the tile wall painted by regulars.
              Banner on phones, full-height column from md+. */}
          <div className="relative md:col-span-2 h-72 sm:h-80 md:h-auto">
            <img
              src="/frontbeacher.webp"
              alt="The Beacher Café storefront glowing at night"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#1f1209]/90 via-[#1f1209]/40 to-[#1f1209]/20" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 text-[#f5e8c7]">
              <p className="text-xs tracking-[3px] text-[#e8a87c] mb-2">
                EST. 1986 • QUEEN ST E, TORONTO
              </p>
              <h2
                className="text-2xl sm:text-3xl font-bold leading-snug mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Every table has a story.
              </h2>
              <p
                className="text-sm text-[#f5e8c7]/85 leading-relaxed mb-5"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Four decades of first dates, family brunches and slow Sunday
                mornings — painted onto our walls by the neighbours who lived
                them. Come add yours.
              </p>
              <figure>
                <img
                  src="/wallart2.webp"
                  alt="Tile mural, each square hand-painted by a café regular"
                  className="w-full h-16 sm:h-24 object-cover rounded-xl border-2 border-[#f5e8c7]/30"
                />
                <figcaption className="text-xs text-[#f5e8c7]/70 italic mt-2">
                  The tile wall — every square painted by one of our regulars.
                </figcaption>
              </figure>
            </div>
          </div>

          {/* ── FORM PANEL ── */}
          <div className="md:col-span-3 bg-[#fdf8f0] p-6 sm:p-10">
            <h1
              className="text-3xl font-bold text-center text-[#3f2a1d]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Reserve a Table
            </h1>
            <div className="h-1 w-16 bg-[#c2410c] mx-auto mt-3 mb-4" />
            <p
              className="text-center text-[#6b5a47] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              A seat will be waiting for you.
            </p>

            {/* FIX: per-day hours hint instead of the old flat openTime/closeTime */}
            <p
              className="text-center text-[#c2410c] text-sm mb-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {form.date && selectedDayHours
                ? selectedDayHours.closed
                  ? "We're closed on the selected day"
                  : `Open ${fmt(selectedDayHours.open)} – ${fmt(selectedDayHours.close)} on this day`
                : "Hours vary by day · Est. 1986"}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                value={form.name}
                placeholder="Your Name"
                onChange={handleChange}
                required
                className={inputStyle}
              />

              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="Email Address"
                onChange={handleChange}
                required
                className={inputStyle}
              />

              <input
                type="tel"
                name="phone"
                value={form.phone}
                placeholder="Phone Number (+1...)"
                onChange={handleChange}
                required
                className={inputStyle}
              />

              {/* HONEYPOT — hidden from humans */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  height: 0,
                  width: 0,
                }}
              />

              <div>
                <label className="block text-sm text-[#6b5a47] mb-1">
                  Number of guests
                </label>
                <input
                  type="number"
                  name="guests"
                  value={form.guests}
                  min="1"
                  max={settings?.maxPartySize || 20}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6b5a47] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    min={today}
                    max={maxDate}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6b5a47] mb-1">
                    Time
                  </label>
                  {/* FIX: min/max from the selected day's hours, disabled if closed */}
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                    min={selectedDayHours?.open}
                    max={selectedDayHours?.close}
                    disabled={selectedDayHours?.closed}
                    className={`${inputStyle} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  />
                </div>
              </div>

              {/* Helpful inline note when the chosen day is closed */}
              {form.date && selectedDayHours?.closed && (
                <p className="text-sm text-red-600 text-center">
                  We're closed that day — please pick another date.
                </p>
              )}

              <textarea
                name="notes"
                value={form.notes}
                placeholder="Special requests (optional)"
                onChange={handleChange}
                rows={3}
                className={`${inputStyle} resize-none`}
              />

              <button
                type="submit"
                disabled={submitting || selectedDayHours?.closed}
                className="w-full bg-[#c2410c] text-white py-3.5 rounded-full font-semibold tracking-wide hover:bg-[#9a3410] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Confirm Reservation"}
              </button>
            </form>

            <p
              className="text-center text-xs text-[#c2410c] tracking-widest mt-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "A TABLE IS ALWAYS READY FOR YOU"
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
