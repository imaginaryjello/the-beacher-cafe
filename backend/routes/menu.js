// backend/routes/menu.js
import express from "express";
import Menu from "../model/menuSchema.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────
// GET all menu items
// PUBLIC — the live menu page reads this
// Optional query: ?category=breakfast&available=true
// ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = {};

    // WHY: lets the frontend filter by category without a separate route
    // Usage: GET /api/menu?category=breakfast
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // WHY: public menu page should only show available items
    // Dashboard editor shows everything (including unavailable)
    // Usage: GET /api/menu?available=true
    if (req.query.available === "true") {
      filter.available = true;
    }

    const menuItems = await Menu.find(filter).sort({
      category: 1,
      displayOrder: 1, // WHY: respect owner-set order within each category
      name: 1,
    });

    res.json({ success: true, count: menuItems.length, menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// GET single menu item by ID
// PUBLIC — useful for edit form pre-population
// ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, menuItem: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────
// POST — add new menu item
// PROTECTED: co-admin or owner only
// FIX: was completely unprotected
// FIX: now validates required fields instead of saving raw req.body
// ─────────────────────────────────────────
router.post("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    // WHY: destructure only the fields we allow — never spread req.body directly
    // This prevents someone from injecting __v, _id, or internal fields
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

    // Manual validation for clear error messages
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Item name is required." });
    }
    if (price === undefined || price === null || price === "") {
      return res
        .status(400)
        .json({ success: false, message: "Price is required." });
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a positive number." });
    }
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category is required." });
    }

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
    res.status(201).json({ success: true, menuItem: newItem });
  } catch (error) {
    // WHY: Mongoose validation errors come back as error.name === "ValidationError"
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
// PUT — update full menu item
// PROTECTED: co-admin or owner only
// FIX: was unprotected + used raw req.body
// ─────────────────────────────────────────
router.put("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    // WHY: only pick the fields we allow to be updated
    // Prevents overwriting _id, __v, createdAt via req.body
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
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number.",
        });
      }
      updateData.price = Number(price);
    }
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (isSpecial !== undefined) updateData.isSpecial = isSpecial;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (available !== undefined) updateData.available = available;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }, // WHY runValidators: enforces schema rules on update too
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, menuItem: updated });
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
// PATCH /:id/availability — toggle available on/off
// PROTECTED: co-admin or owner only
// WHY: quick "86 this item" without a full edit form
// Usage: PATCH /api/menu/123/availability  body: { available: false }
// ─────────────────────────────────────────
router.patch(
  "/:id/availability",
  verifyToken,
  requireCoAdminOrAdmin,
  async (req, res) => {
    try {
      const { available } = req.body;
      if (typeof available !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "available must be true or false.",
        });
      }

      const updated = await Menu.findByIdAndUpdate(
        req.params.id,
        { available },
        { new: true },
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      res.json({
        success: true,
        message: `${updated.name} is now ${available ? "available" : "unavailable"}.`,
        menuItem: updated,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// ─────────────────────────────────────────
// DELETE — remove menu item
// PROTECTED: co-admin or owner only
// FIX: was unprotected
// ─────────────────────────────────────────
router.delete("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    res.json({
      success: true,
      message: `"${deleted.name}" has been removed from the menu.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const menuRouter = router;
export default menuRouter;
