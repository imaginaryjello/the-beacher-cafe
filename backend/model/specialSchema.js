import mongoose from "mongoose";

// WHY a separate schema from the menu: specials are managed differently —
// they appear as featured cards on the home page, have an active toggle
// independent of the menu's "available" field, and don't belong to a category.
// Mixing them into menuSchema would add conditional fields that don't apply
// to regular menu items.
const specialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    publicId: { type: String, default: "" }, // WHY: needed to delete from Cloudinary on removal
    active: { type: Boolean, default: true }, // WHY "active" not "available": signals "featured on home page today"
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Special = mongoose.model("Special", specialSchema);
export default Special;
