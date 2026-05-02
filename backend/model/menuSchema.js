import mongoose from "mongoose";

const menuSchema = {
  name: String,
  price: String,
  description: String,
  category: { type: String, enum: ["breakfast", "lunch", "dessert", "drinks"] },
  isSpecial: { type: Boolean, default: false },
  imageUrl: String,
  available: { type: Boolean, default: false },
};
const menu = mongoose.model("Menu", menuSchema);
export default menu;
