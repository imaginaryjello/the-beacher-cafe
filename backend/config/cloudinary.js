// backend/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hold the file in memory; we stream it to Cloudinary ourselves.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only jpg, png, and webp images are allowed."), false);
  },
});

// Same folder map you had, now resolved here instead of in storage params.
const FOLDERS = {
  menu: "beacher-cafe/menu",
  gallery: "beacher-cafe/gallery",
  specials: "beacher-cafe/specials",
  hero: "beacher-cafe/hero",
};

// Stream a buffer to Cloudinary, preserving your transformations.
export const uploadToCloudinary = (buffer, type = "general") =>
  new Promise((resolve, reject) => {
    const folder = FOLDERS[type] || "beacher-cafe/general";
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1200, crop: "limit" },
        ],
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });

export { cloudinary, upload };
