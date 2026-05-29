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

router.post("/", authController.authCustomer);
// GET /api/customer/get-info - accepts `Authorization: Bearer <token>` OR `?email=`
router.get("/get-info", auth({ required: false }), authController.getCustomerInfo);

// POST /api/customer/logout - invalidates the provided token (requires auth)
router.post("/logout", auth({ required: true }), authController.logoutCustomer);

module.exports = router;