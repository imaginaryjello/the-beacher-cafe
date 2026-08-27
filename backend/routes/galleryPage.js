import express from "express";
import { sendServerError } from "../utils/serverError.js";
import { cloudinary } from "../config/cloudinary.js";
import GalleryPage from "../model/galleryPageImage.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// GET /api/gallery-page
// Public — powers the standalone /gallery page, sorted by order
// ============================================
router.get("/", async (req, res) => {
  try {
    const images = await GalleryPage.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, images });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// POST /api/gallery-page — co-admin or owner only
// Body: { imageUrl, publicId, caption, order }
// ============================================
router.post("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { imageUrl, publicId, caption, order } = req.body;
    if (!imageUrl || !publicId) {
      return res.status(400).json({
        success: false,
        message: "imageUrl and publicId are required",
      });
    }

    const image = await GalleryPage.create({
      imageUrl,
      publicId,
      caption: caption || "",
      order: order || 0,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ success: true, image });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// PATCH /api/gallery-page/:id — co-admin or owner only
// Body: { caption, order }
// ============================================
router.patch("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { caption, order } = req.body;
    const image = await GalleryPage.findByIdAndUpdate(
      req.params.id,
      { caption, order },
      { new: true },
    );
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
    res.json({ success: true, image });
  } catch (error) {
    return sendServerError(res, error);
  }
});

// ============================================
// DELETE /api/gallery-page/:id — co-admin or owner only
// Removes from Cloudinary AND MongoDB so we never orphan a stored file.
// ============================================
router.delete("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const image = await GalleryPage.findById(req.params.id);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    await cloudinary.uploader.destroy(image.publicId);
    await GalleryPage.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    return sendServerError(res, error);
  }
});

export default router;
