const Menu = require("../models/menu.model");


// CREATE MENU
exports.createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE BULK MENUS
exports.createBulkMenus = async (req, res) => {
  try {
    const menus = await Menu.insertMany(req.body);

    res.status(201).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL MENU
exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find();

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET SINGLE MENU
exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE MENU
exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE MENU
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};