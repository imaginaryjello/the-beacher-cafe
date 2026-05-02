// backend/routes/menu.js
import express from "express";
import Menu from "../model/menuSchema.js";

const router = express.Router();

// GET all menu items
router.get("/", async (req, res) => {
  try {
    const menuItems = await Menu.find().sort({ category: 1, name: 1 });
    res.json({ success: true, menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADD new menu item
router.post("/", async (req, res) => {
  try {
    const newItem = new Menu(req.body);
    await newItem.save();
    res.status(201).json({ success: true, menuItem: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE menu item
router.put("/:id", async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, menuItem: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE menu item
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
