const express = require("express");
const router = express.Router();

const {
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  createBulkMenus
} = require("../controllers/menu.controllers");

// Create Menu
router.post("/", createMenu);

// Create Bulk Menus
router.post("/bulk", createBulkMenus);

// Get All Menus
router.get("/get-menu", getMenus);

// Get Single Menu
router.get("/:id", getMenuById);

// Update Menu
router.put("/update-menu/:id", updateMenu);

// Delete Menu
router.delete("/delete-menu/:id", deleteMenu);

module.exports = router;