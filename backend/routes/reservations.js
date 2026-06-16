// backend/routes/reservations.js
import express from "express";
import rateLimit from "express-rate-limit";
import Reservation from "../model/ReservationSchema.js";
import Notification from "../model/notificationSchema.js";
import Settings from "../model/settingSchema.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";
import {
  sendReservationReceived,
  sendReservationConfirmed,
  sendReservationDeclined,
} from "../config/email.js";

const router = express.Router();

const fireNotification = (data) => {
  Notification.create(data).catch((err) =>
    console.error("[Notification] Failed:", err.message),
  );
};

// ─────────────────────────────────────────
// SECURITY LAYER 1: RATE LIMIT
// Max 3 reservation submissions per IP per hour
// ─────────────────────────────────────────
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message:
      "Too many reservation attempts. Please try again later or call us directly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────
// POST /api/reservations
// PUBLIC — with all security layers
// ─────────────────────────────────────────
router.post("/", reservationLimiter, async (req, res) => {
  try {
    const { name, email, phone, guests, date, time, notes, website } = req.body;
    // WHY "website": this is the HONEYPOT field (Layer 4)
    // Real users never see/fill it. Bots fill every field.

    // ── SECURITY LAYER 4: HONEYPOT ──
    if (website) {
      // Silently pretend success so the bot doesn't know it was caught
      return res
        .status(201)
        .json({ success: true, message: "Reservation received." });
    }

    // ── BASIC VALIDATION ──
    if (!name || !name.trim())
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    if (!email || !email.trim())
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    if (!phone || !phone.trim())
      return res
        .status(400)
        .json({ success: false, message: "Phone is required." });
    if (!date)
      return res
        .status(400)
        .json({ success: false, message: "Date is required." });
    if (!time)
      return res
        .status(400)
        .json({ success: false, message: "Time is required." });

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    // ── LOAD SETTINGS for validation ──
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    // ─────────────────────────────────────────
    // REPLACEMENT for the date/time validation block in reservations.js
    // (Security Layer 2). Swap the old global-hours block with this.
    // ─────────────────────────────────────────

    // Map JS getDay() number to our settings keys
    // 0=Sunday ... 6=Saturday
    const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    // ── SECURITY LAYER 2: DATE & TIME VALIDATION (per-day) ──
    const bookingDate = new Date(`${date}T${time}`);
    const now = new Date();

    // Not in the past
    if (bookingDate < now) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot book a time in the past." });
    }

    // Not too far ahead
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + settings.maxDaysAhead);
    if (bookingDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: `Reservations can only be made up to ${settings.maxDaysAhead} days in advance.`,
      });
    }

    // Look up THIS day's specific hours
    const dayKey = DAY_KEYS[bookingDate.getDay()];
    const dayHours = settings.hours[dayKey];

    // Closed that day?
    if (dayHours.closed) {
      return res
        .status(400)
        .json({ success: false, message: "We're closed on that day." });
    }

    // Within that day's open hours?
    if (time < dayHours.open || time > dayHours.close) {
      return res.status(400).json({
        success: false,
        message: `On that day we're open ${dayHours.open}–${dayHours.close}.`,
      });
    }

    // Party size check
    if (Number(guests) > settings.maxPartySize) {
      return res.status(400).json({
        success: false,
        message: `For parties over ${settings.maxPartySize}, please call us directly.`,
      });
    }

    // ── SECURITY LAYER 3: DUPLICATE PREVENTION ──
    const duplicate = await Reservation.findOne({
      phone: phone.trim(),
      date,
      time,
      status: { $in: ["pending", "confirmed"] },
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a reservation request for this date and time.",
      });
    }

    // ── SAVE ──
    const reservation = new Reservation({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      guests: guests || 2,
      date,
      time,
      notes: notes?.trim() || "",
      status: "pending",
    });

    await reservation.save();

    // ── NOTIFICATION to owner + coadmin ──
    fireNotification({
      type: "reservation",
      message: `New reservation: ${name}, party of ${guests || 2} on ${date} at ${time}.`,
      relatedId: reservation._id,
      visibleTo: "coadmin",
      metadata: { name, guests, date, time, phone, email },
    });

    // ── EMAIL: confirmation that we received it ──
    sendReservationReceived(reservation.email, {
      name,
      date,
      time,
      guests: guests || 2,
    });

    res.status(201).json({
      success: true,
      message:
        "Reservation received. Check your email — we'll confirm shortly.",
      reservation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/reservations — owner + coadmin
// ─────────────────────────────────────────
router.get("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reservations.length, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/reservations/:id/status — owner + coadmin
// Sends customer email on confirm/decline
// ─────────────────────────────────────────
router.patch(
  "/:id/status",
  verifyToken,
  requireCoAdminOrAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!["confirmed", "cancelled", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be "confirmed", "cancelled", or "completed".',
        });
      }

      const updated = await Reservation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true },
      );
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Reservation not found" });
      }

      // ── EMAIL the customer about the decision ──
      if (status === "confirmed") {
        sendReservationConfirmed(updated.email, {
          name: updated.name,
          date: updated.date,
          time: updated.time,
          guests: updated.guests,
        });
      } else if (status === "cancelled") {
        sendReservationDeclined(updated.email, {
          name: updated.name,
          date: updated.date,
          time: updated.time,
        });
      }

      fireNotification({
        type: "reservation",
        message: `Reservation for ${updated.name} (${updated.date}) was ${status} by ${req.user.email}.`,
        relatedId: updated._id,
        triggeredBy: req.user.id,
        visibleTo: "coadmin",
        metadata: { name: updated.name, status },
      });

      res.json({
        success: true,
        message: `Reservation ${status}.`,
        reservation: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ─────────────────────────────────────────
// DELETE /api/reservations/:id — owner + coadmin
// ─────────────────────────────────────────
router.delete("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    }
    res.json({ success: true, message: "Reservation deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
