// backend/model/menuSchema.js
import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true, // WHY: removes accidental leading/trailing spaces
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      // FIX: was String — Number allows sorting, math, and min validation
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["breakfast", "lunch", "dessert", "drinks", "specials"],
        // WHY: added "specials" — needed for the specials editor
        message: "{VALUE} is not a valid category",
      },
    },

    isSpecial: {
      type: Boolean,
      default: false,
      // WHY: separate from category — an item can be in "breakfast"
      // but also marked as today's special (shows on homepage specials section)
    },

    imageUrl: {
      type: String,
      default: "",
      // Will store Cloudinary URL once image upload is wired in
    },

    available: {
      type: Boolean,
      default: true,
      // FIX: was false — new items should show on the menu immediately
      // Set to false to "86" an item (sold out / temporarily removed)
    },

    displayOrder: {
      type: Number,
      default: 0,
      // WHY: lets the owner control the order items appear within a category
      // Lower number = appears first
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  },
);

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
