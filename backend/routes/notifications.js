// backend/routes/notifications.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Notification from "../model/notificationSchema.js";

const router = express.Router();

// ── HELPER: build visibleTo filter based on role ──
// Owner sees everything
// Co-admin sees "coadmin" + "all"
// Employee sees only "all"
const visibilityFilter = (role) => {
  if (role === "admin") return {};
  if (role === "coadmin") return { visibleTo: { $in: ["coadmin", "all"] } };
  return { visibleTo: "all" };
};

// ─────────────────────────────────────────
// GET /api/notifications/unread-count
// Returns count of notifications the current
// user can see AND hasn't read yet
// ─────────────────────────────────────────
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const count = await Notification.countDocuments({
      ...visibilityFilter(role),
      // WHY $nin: count where my id is NOT in the readBy array = unread for me
      readBy: { $nin: [userId] },
    });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// GET /api/notifications
// Returns notifications visible to current user
// with a computed isRead field per user
// ─────────────────────────────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const notifications = await Notification.find(visibilityFilter(role))
      .sort({ createdAt: -1 })
      .limit(50);

    // WHY computed isRead: we don't send the full readBy array to frontend
    // (privacy — no need to expose who else has read it)
    // Instead we compute a simple boolean for this user only
    const formatted = notifications.map((n) => ({
      _id: n._id,
      type: n.type,
      message: n.message,
      relatedId: n.relatedId,
      visibleTo: n.visibleTo,
      createdAt: n.createdAt,
      isRead: n.readBy.some((id) => id.toString() === userId.toString()),
    }));

    res.json({
      success: true,
      count: formatted.length,
      notifications: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/notifications/read-all
// MUST be before /:id/read — Express matches top to bottom
// Adds current user's id to readBy on ALL visible notifications
// ─────────────────────────────────────────
router.patch("/read-all", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // WHY $addToSet: prevents duplicate ids if called multiple times
    await Notification.updateMany(visibilityFilter(role), {
      $addToSet: { readBy: userId },
    });

    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/notifications/:id/read
// Adds current user's id to readBy array
// ─────────────────────────────────────────
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: userId } }, // WHY $addToSet: safe — no duplicates
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      // Return computed isRead for this user
      notification: {
        ...updated.toObject(),
        isRead: updated.readBy.some(
          (id) => id.toString() === userId.toString(),
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
