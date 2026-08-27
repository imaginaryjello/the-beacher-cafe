import mongoose from "mongoose";

// Images for the standalone public /gallery page — a separate collection from
// the home-page grid (model "Gallery") and the specials, so each surface is
// managed independently in its own dashboard section.
const galleryPageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true }, // needed to delete from Cloudinary
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true },
);

const GalleryPage = mongoose.model("GalleryPage", galleryPageSchema);
export default GalleryPage;
