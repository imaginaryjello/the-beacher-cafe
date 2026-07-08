import express from "express";
import { cloudinary } from "../config/cloudinary.js";
import Gallery from "../model/galleryImage.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
// GET /api/gallery
// Public — returns all gallery images sorted by order field
// WHY public: the home page grid needs to fetch these without a login token
// ============================================
router.get("/", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// POST /api/gallery
// Protected: co-admin or owner only
// Body: { imageUrl, publicId, caption, order }
// WHY separate from /api/upload: upload puts the file on Cloudinary and returns
// a URL. This endpoint saves that URL into MongoDB. Keeping them separate means
// one upload endpoint serves gallery, specials, and menu uniformly.
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

    const image = await Gallery.create({
      imageUrl,
      publicId,
      caption: caption || "",
      order: order || 0,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ success: true, image });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PATCH /api/gallery/:id
// Protected: co-admin or owner only
// Body: { caption, order }
// WHY PATCH not PUT: we only ever update caption/order, not the image itself.
// To change the image you delete and re-upload.
// ============================================
router.patch("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { caption, order } = req.body;
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      { caption, order },
      { new: true } // WHY new:true — return the updated doc, not the old one
    );
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    res.json({ success: true, image });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DELETE /api/gallery/:id
// Protected: co-admin or owner only
// WHY we delete from both Cloudinary AND MongoDB: if we only remove the DB record,
// the image stays on Cloudinary forever and we keep paying for storage.
// ============================================
router.delete("/:id", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Delete from Cloudinary first — if this fails we want to know before
    // we lose the DB record that points to it
    await cloudinary.uploader.destroy(image.publicId);

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
