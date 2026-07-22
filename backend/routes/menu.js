// backend/routes/menu.js
import express from "express";
import { sendServerError } from "../utils/serverError.js";
import Menu from "../model/menuSchema.js";
import Notification from "../model/notificationSchema.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────
// NOTIFICATION HELPER
// WHY: .catch(() => {}) means notification failure
// NEVER blocks the menu operation from succeeding
// ─────────────────────────────────────────
const fireNotification = (data) => {
  Notification.create(data).catch((err) =>
    console.error("[Notification] Failed to create:", err.message),
  );
};

// ── GET all — PUBLIC ──
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available === "true") filter.available = true;
    const menuItems = await Menu.find(filter).sort({
      category: 1,
      displayOrder: 1,
      name: 1,
    });
    res.json({ success: true, count: menuItems.length, menuItems });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ── GET single — PUBLIC ──
router.get("/:id", async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, menuItem: item });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ── POST — add item — PROTECTED ──
router.post("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      isSpecial,
      imageUrl,
      available,
      displayOrder,
    } = req.body;

    if (!name || !name.trim())
      return res
        .status(400)
        .json({ success: false, message: "Item name is required." });
    if (price === undefined || price === null || price === "")
      return res
        .status(400)
        .json({ success: false, message: "Price is required." });
    if (isNaN(Number(price)) || Number(price) < 0)
      return res
        .status(400)
        .json({ success: false, message: "Price must be a positive number." });
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Category is required." });

    const newItem = new Menu({
      name: name.trim(),
      price: Number(price),
      description: description?.trim() || "",
      category,
      isSpecial: isSpecial || false,
      imageUrl: imageUrl || "",
      available: available !== undefined ? available : true,
      displayOrder: displayOrder || 0,
    });

    await newItem.save();

    fireNotification({
      type: "menu_change",
      message: `${req.user.email} added "${newItem.name}" to the ${newItem.category} menu.`,
      relatedId: newItem._id,
      triggeredBy: req.user.id,
      visibleTo: "all",
      metadata: {
        action: "added",
        itemName: newItem.name,
        category: newItem.category,
        price: newItem.price,
      },
    });

    res.status(201).json({ success: true, menuItem: newItem });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    return sendServerError(res, error);
  }
});

// ── PUT — update item — PROTECTED ──
router.put("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      isSpecial,
      imageUrl,
      available,
      displayOrder,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0)
        return res
          .status(400)
          .json({
            success: false,
            message: "Price must be a positive number.",
          });
      updateData.price = Number(price);
    }
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (isSpecial !== undefined) updateData.isSpecial = isSpecial;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (available !== undefined) updateData.available = available;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    // Fetch before so we can show what changed in the notification
    const before = await Menu.findById(req.params.id);
    const updated = await Menu.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    // Build human-readable change summary
    const changes = [];
    if (before && updateData.name && updateData.name !== before.name)
      changes.push(`name: "${before.name}" → "${updateData.name}"`);
    if (
      before &&
      updateData.price !== undefined &&
      updateData.price !== before.price
    )
      changes.push(`price: $${before.price} → $${updateData.price}`);
    if (
      before &&
      updateData.category &&
      updateData.category !== before.category
    )
      changes.push(`category: ${before.category} → ${updateData.category}`);
    if (
      before &&
      updateData.description !== undefined &&
      updateData.description !== before.description
    )
      changes.push(`description updated`);
    const changeSummary = changes.length > 0 ? ` (${changes.join(", ")})` : "";

    fireNotification({
      type: "menu_change",
      message: `${req.user.email} updated "${updated.name}"${changeSummary}.`,
      relatedId: updated._id,
      triggeredBy: req.user.id,
      visibleTo: "all",
      metadata: {
        action: "updated",
        itemName: updated.name,
        changes: updateData,
      },
    });

    res.json({ success: true, menuItem: updated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    return sendServerError(res, error);
  }
});

// ── PATCH availability — PROTECTED ──
router.patch(
  "/:id/availability",
  verifyToken,
  requireCoAdminOrAdmin,
  async (req, res) => {
    try {
      const { available } = req.body;
      if (typeof available !== "boolean")
        return res
          .status(400)
          .json({
            success: false,
            message: "available must be true or false.",
          });

      const updated = await Menu.findByIdAndUpdate(
        req.params.id,
        { available },
        { new: true },
      );
      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });

      fireNotification({
        type: "menu_change",
        message: available
          ? `"${updated.name}" is back on the menu (available).`
          : `"${updated.name}" has been 86'd (unavailable) by ${req.user.email}.`,
        relatedId: updated._id,
        triggeredBy: req.user.id,
        visibleTo: "all",
        metadata: {
          action: available ? "restored" : "86d",
          itemName: updated.name,
          available,
        },
      });

      res.json({
        success: true,
        message: `${updated.name} is now ${available ? "available" : "unavailable"}.`,
        menuItem: updated,
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  },
);

// ── DELETE — PROTECTED ──
router.delete("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    fireNotification({
      type: "menu_change",
      message: `${req.user.email} removed "${deleted.name}" from the ${deleted.category} menu.`,
      triggeredBy: req.user.id,
      visibleTo: "all",
      metadata: {
        action: "deleted",
        itemName: deleted.name,
        category: deleted.category,
        price: deleted.price,
      },
    });

    res.json({
      success: true,
      message: `"${deleted.name}" has been removed from the menu.`,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

const menuRouter = router;
export default menuRouter;
