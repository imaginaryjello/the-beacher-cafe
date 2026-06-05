// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// WHY: Configure cloudinary with your env credentials
// These come from your .env file — never hardcode them
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// WHY CloudinaryStorage: instead of saving the file to disk first,
// multer streams it directly to Cloudinary — no temp files on server
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // WHY: separate folder per type keeps Cloudinary dashboard organized
    folder: (req) => {
      const type = req.query.type || "general";
      const folders = {
        menu: "beacher-cafe/menu",
        gallery: "beacher-cafe/gallery",
        specials: "beacher-cafe/specials",
        hero: "beacher-cafe/hero",
      };
      return folders[type] || "beacher-cafe/general";
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // WHY transformation: auto-optimize quality and format on upload
    // This means images load faster on the public menu page
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 1200, crop: "limit" }, // max width 1200px — no giant images
    ],
  },
});

// WHY limits: prevent someone uploading a 50MB file and crashing the server
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, png, and webp images are allowed."), false);
    }
  },
});

export { cloudinary, upload };
