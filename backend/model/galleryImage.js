import mongoose from "mongoose";

// WHY mongoose.Schema: using a plain object instead of new mongoose.Schema()
// means Mongoose treats it as a schemaless document — no automatic _id, no
// timestamps option, and no proper type coercion. Always use new mongoose.Schema().
const gallerySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true }, // WHY: we need publicId to delete from Cloudinary later
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }, // gives us createdAt/updatedAt for free
);

const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery;
