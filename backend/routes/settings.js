// backend/routes/settings.js
import express from "express";
import { sendServerError } from "../utils/serverError.js";
import Settings from "../model/settingSchema.js";
import Notification from "../model/notificationSchema.js";
import Employee from "../model/employeeSchema.js";
import {
  verifyToken,
  requireAdmin,
  requireCoAdminOrAdmin,
} from "../middleware/auth.js";

const router = express.Router();

// Best-effort notification — settings save must succeed even if this fails
const fireNotification = (data) => {
  Notification.create(data).catch((err) =>
    console.error("[Notification] Failed:", err.message),
  );
};

// Resolve the actor's display name for "changed by X" messages.
// JWT only carries the email, so we look the name up (email as fallback).
const actorName = async (req) => {
  try {
    const emp = await Employee.findById(req.user.id).select("name");
    return emp?.name || req.user.email;
  } catch {
    return req.user.email;
  }
};

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

router.get("/", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    return sendServerError(res, error);
  }
});

router.put("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const {
      hours,
      maxPartySize,
      maxDaysAhead,
      phone,
      address,
      announcement,
      announcementActive,
      openSignMode,
    } = req.body;

    const settings = await getSettings();

    // FIX: nested object — assign the whole hours object at once
    // and mark it modified so Mongoose definitely saves it.
    // WHY: Mongoose doesn't always detect deep nested mutations.
    if (hours !== undefined) {
      settings.hours = hours;
      settings.markModified("hours"); // CRITICAL for nested objects
    }
    if (maxPartySize !== undefined) settings.maxPartySize = maxPartySize;
    if (maxDaysAhead !== undefined) settings.maxDaysAhead = maxDaysAhead;
    if (phone !== undefined) settings.phone = phone;
    if (address !== undefined) settings.address = address;
    if (announcement !== undefined) settings.announcement = announcement;
    if (announcementActive !== undefined)
      settings.announcementActive = announcementActive;
    if (openSignMode !== undefined) settings.openSignMode = openSignMode;

    await settings.save();

    // Everyone on the team sees who changed the café settings
    const who = await actorName(req);
    fireNotification({
      type: "system",
      message: `Café settings were updated by ${who}.`,
      triggeredBy: req.user.id,
      visibleTo: "all",
      metadata: { action: "settings_updated", by: who },
    });

    res.json({ success: true, message: "Settings updated.", settings });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ─────────────────────────────────────────
// POST /api/settings/blocked-dates — add one blocked date
// Admin OR co-admin (co-admins manage day-to-day date blocks)
// ─────────────────────────────────────────
router.post(
  "/blocked-dates",
  verifyToken,
  requireCoAdminOrAdmin,
  async (req, res) => {
    try {
      const { date, reason = "" } = req.body;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: "A valid date in YYYY-MM-DD format is required.",
        });
      }

      const settings = await getSettings();

      if (settings.blockedDates.some((b) => b.date === date)) {
        return res.status(400).json({
          success: false,
          message: "That date is already blocked.",
        });
      }

      settings.blockedDates.push({ date, reason: reason.trim() });
      settings.markModified("blockedDates");
      await settings.save();

      const who = await actorName(req);
      fireNotification({
        type: "system",
        message: `Reservations blocked for ${date}${reason.trim() ? ` (${reason.trim()})` : ""} by ${who}.`,
        triggeredBy: req.user.id,
        visibleTo: "all",
        metadata: { action: "date_blocked", date, by: who },
      });

      res.json({
        success: true,
        message: "Date blocked.",
        blockedDates: settings.blockedDates,
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  },
);

// ─────────────────────────────────────────
// DELETE /api/settings/blocked-dates/:date — unblock a date
// Admin OR co-admin
// ─────────────────────────────────────────
router.delete(
  "/blocked-dates/:date",
  verifyToken,
  requireCoAdminOrAdmin,
  async (req, res) => {
    try {
      const { date } = req.params;
      const settings = await getSettings();
      const before = settings.blockedDates.length;

      settings.blockedDates = settings.blockedDates.filter(
        (b) => b.date !== date,
      );

      if (settings.blockedDates.length === before) {
        return res
          .status(404)
          .json({ success: false, message: "Date not found in blocked list." });
      }

      settings.markModified("blockedDates");
      await settings.save();

      const who = await actorName(req);
      fireNotification({
        type: "system",
        message: `Reservations re-opened for ${date} by ${who}.`,
        triggeredBy: req.user.id,
        visibleTo: "all",
        metadata: { action: "date_unblocked", date, by: who },
      });

      res.json({
        success: true,
        message: "Date unblocked.",
        blockedDates: settings.blockedDates,
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  },
);

export default router;
