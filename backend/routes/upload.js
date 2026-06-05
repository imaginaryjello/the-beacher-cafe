import express from "express";
import { cloudinary, upload } from "../config/cloudinary.js";
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
  // WHY: upload.single("image") is multer middleware that processes the file upload.
  // It looks for a file field named "image" in the multipart/form-data request.
  // After processing, it attaches the file info to req.file and calls next().
  //multer processes it and puts cloudinary result in req.file
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      //Why req.file.path: CLoudinaryStorage puts the uploaded image's URL in req.file.path, so we return that to the frontend
      // req.file.filename is the public_id (used if you want to delete later)
      res.status(200).json({
        success: true,
        imageUrl: req.file.path, //full cloudinary URL -save this in mongodb
        publicId: req.file.filename,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while uploading image",
      });
    }
  },
);

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
