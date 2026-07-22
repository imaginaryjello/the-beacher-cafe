import express from "express";
import { sendServerError } from "../utils/serverError.js";
import { cloudinary } from "../config/cloudinary.js";
import Special from "../model/specialSchema.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// GET /api/specials
// Public — returns all specials, active ones first
// WHY public: the home page needs these without a token
// ============================================
router.get("/", async (req, res) => {
  try {
    // WHY sort active:-1 first: active specials appear on the home page,
    // so we want them at the top of the list in the dashboard too
    const specials = await Special.find().sort({ active: -1, displayOrder: 1, createdAt: -1 });
    res.json({ success: true, specials });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// POST /api/specials
// Protected: co-admin or owner only
// Body: { title, price, description, imageUrl, publicId, displayOrder }
// ============================================
router.post("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { title, price, description, imageUrl, publicId, displayOrder } = req.body;

    if (!title || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "title and price are required",
      });
    }

    const special = await Special.create({
      title,
      price: Number(price),
      description: description || "",
      imageUrl: imageUrl || "",
      publicId: publicId || "",
      displayOrder: displayOrder || 0,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, special });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// PUT /api/specials/:id
// Protected: co-admin or owner only
// Full update — replaces all editable fields
// ============================================
router.put("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { title, price, description, imageUrl, publicId, displayOrder, active } = req.body;

    if (!title || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "title and price are required",
      });
    }

    // WHY we fetch before updating: we need the OLD publicId so we can delete
    // the previous image from Cloudinary when a new one is uploaded.
    // findByIdAndUpdate alone would overwrite it before we ever see the old value.
    const existing = await Special.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Special not found" });
    }

    // If a new image was uploaded (publicId changed), delete the old one from Cloudinary
    // WHY guard with existing.publicId: the special might have had no image before
    if (existing.publicId && publicId && existing.publicId !== publicId) {
      await cloudinary.uploader.destroy(existing.publicId);
    }

    const special = await Special.findByIdAndUpdate(
      req.params.id,
      { title, price: Number(price), description, imageUrl, publicId, displayOrder, active },
      { new: true, runValidators: true }
    );

    res.json({ success: true, special });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// PATCH /api/specials/:id/active
// Protected: co-admin or owner only
// Body: { active: true|false }
// WHY a dedicated PATCH route: toggling active is a one-click action in the UI.
// A full PUT would require sending all fields just to flip one boolean — wasteful.
// ============================================
router.patch("/:id/active", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { active } = req.body;
    const special = await Special.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    );
    if (!special) {
      return res.status(404).json({ success: false, message: "Special not found" });
    }
    res.json({
      success: true,
      special,
      message: `"${special.title}" is now ${active ? "active" : "inactive"}`,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// DELETE /api/specials/:id
// Protected: co-admin or owner only
// WHY we only delete from Cloudinary if publicId exists: a special might have
// been created without an image, so we guard against destroying an empty string.
// ============================================
router.delete("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const special = await Special.findById(req.params.id);
    if (!special) {
      return res.status(404).json({ success: false, message: "Special not found" });
    }

    if (special.publicId) {
      await cloudinary.uploader.destroy(special.publicId);
    }

    await Special.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `"${special.title}" deleted` });
  } catch (error) {
    return sendServerError(res, error);
  }
});

export default router;
