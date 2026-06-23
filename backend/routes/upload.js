import express from "express";
import {
  cloudinary,
  upload,
  uploadToCloudinary,
} from "../config/cloudinary.js";
import { verifyToken, requireCoAdminOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// ============================================
//POST /api/upload
// upload a single image to cloydinary and return the URL
//
//query param ?type=menu|gallery|specials|hero (optional, defaults to "general")
// Determines which cloudinary folder it goes into
//
// usage from frontend:
// const formData = new FormData();
// formData.append("image", file);
// fetch("/api/upload?type=menu", {method: "POST", headers:{Authorization: ...}, body:formData})
// ============================================
router.post(
  "/",
  verifyToken,
  requireCoAdminOrAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Stream the in-memory buffer to Cloudinary, routing by ?type=
      const result = await uploadToCloudinary(req.file.buffer, req.query.type);

      res.status(200).json({
        success: true,
        imageUrl: result.secure_url, // full Cloudinary URL — save in MongoDB
        publicId: result.public_id, // used for deletion later
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while uploading image",
      });
    }
  },
);

// WHY this error handler exists: multer calls next(err) when a file is rejected
// (wrong type, too large). Without this, Express returns an HTML 500 page instead
// of JSON, which confuses the frontend into showing "network error".
router.use((err, req, res, next) => {
  res.status(400).json({
    success: false,
    message: err.message || "File upload error",
  });
});

// ============================================
// DELETE /API/UPLOAD/:publicId
// DELETE AN IMAGE FROM CLOUDINARY BY publicid
//PROTECTED : co-admin or owner only
// Body: {publicId: "beacher-cafe/menu/abc123"}
// WHY: when a menu item is deleted, we  should also
// clean up its image cloudinary
// ============================================
router.delete("/", verifyToken, requireCoAdminOrAdmin, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is requied to delete an image",
      });
    }
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
