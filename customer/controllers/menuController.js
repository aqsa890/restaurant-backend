const RESTAURANT_URL = process.env.RESTAURANT_URL || "http://localhost:5002";

// GET All Menus (public, no auth required)
exports.getAllMenusPublic = async (req, res) => {
  try {
    const resp = await fetch(`${RESTAURANT_URL}/api/menu/get-menu`);

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ success: false, message: text });
    }

    const body = await resp.json();
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
