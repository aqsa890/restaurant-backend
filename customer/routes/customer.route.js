/*
	routes/customer.route.js
	- Defines customer-related HTTP routes and maps them to controllers.
	- Mount this router in the server with: `app.use('/api/customer', router)`.
	- Example: POST `/api/customer/auth` -> `authController.authCustomer`.
*/

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const menuController = require("../controllers/menuController");

router.post("/", authController.authCustomer);
// GET /api/customer/get-info - accepts `Authorization: Bearer <token>` OR `?email=`
router.get("/get-info", auth({ required: false }), authController.getCustomerInfo);

// POST /api/customer/logout - invalidates the provided token (requires auth)
router.post("/logout", auth({ required: true }), authController.logoutCustomer);

module.exports = router;

// Menu routes merged here so `/api/customer/menu` is available
// Public endpoint: GET /api/customer/menu/ -> proxies to restaurant service
router.get("/menu/", menuController.getAllMenusPublic);

// NOTE: `placeOrder` is implemented in `authController` in this project.
// Route should reference the existing handler to avoid undefined errors.
// Use a safe wrapper to avoid crashing if the handler isn't exported correctly.
router.post(
	"/place-order",
	auth({ required: true }),
	(req, res, next) => {
		if (authController && typeof authController.placeOrder === 'function') {
			return authController.placeOrder(req, res, next);
		}
		return res.status(500).json({ message: "placeOrder handler not available" });
	}
);