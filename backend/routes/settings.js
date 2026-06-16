// backend/routes/settings.js
import express from "express";
import Settings from "../model/settingSchema.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

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
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      hours,
      maxPartySize,
      maxDaysAhead,
      phone,
      address,
      announcement,
      announcementActive,
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

    await settings.save();

    res.json({ success: true, message: "Settings updated.", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
