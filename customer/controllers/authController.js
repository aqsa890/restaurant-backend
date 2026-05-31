/*
  controllers/authController.js
  - Holds authentication-related controller functions for customers.
  - `authCustomer(req, res)` handles simple email-based login/registration:
    - expects `{ name, email }` in `req.body`.
    - creates a Customer if not found, signs a JWT and returns it.
  - Use from routes with: `router.post('/auth', authController.authCustomer)`.
*/

const Customer = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RevokedToken = require("../models/revokedToken.model");
const { publishNewOrder } = require('../rabbitmq/publisher');


// helper: hash email (input should be normalized: trimmed + lowercase)
const hashEmail = (email) => {
  const normalized = (email || "").toString().trim().toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

exports.logoutCustomer = async (req, res) => {
  // authMiddleware sets req.token and req.user
  const token = req.token;
  if (!token) return res.status(400).json({ message: "No token provided" });

  // derive expiry from token payload if present, otherwise set a default (7 days)
  let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (req.user && req.user.exp) {
    expiresAt = new Date(req.user.exp * 1000);
  }

  try {
    await RevokedToken.create({ token, expiresAt });
    return res.json({ message: "Logged out" });
  } catch (err) {
    // if already revoked, respond success to make logout idempotent
    if (err && err.code === 11000) return res.json({ message: "Logged out" });
    return res.status(500).json({ error: err.message });
  }
};

exports.authCustomer = async (req, res) => {
  const { name, email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required" });

  const normalizedEmail = email.toString().trim().toLowerCase();
  const normalizedName = (name || "").toString().trim();

  try {
    // compute hashed email and prefer it for lookups
    const hashedEmail = hashEmail(normalizedEmail);

    // try find by emailHash first
    let customer = await Customer.findOne({ emailHash: hashedEmail });

    // legacy fallback: if a document still has plaintext `email`, migrate it
    if (!customer) {
      const legacy = await Customer.findOne({ email: normalizedEmail }).select('+email');
      if (legacy) {
        legacy.emailHash = hashedEmail;
        legacy.email = undefined;
        await legacy.save();
        customer = legacy;
      }
    }

    // register if not exists (store only emailHash)
    let created = false;
    if (!customer) {
      try {
        console.log('[authCustomer] creating customer payload:', { name: normalizedName, emailHash: hashedEmail });
        // To avoid duplicate-key issues on any existing `email` unique index,
        // store the hashed email into the legacy `email` field as well (it's not
        // plaintext and will not be returned in responses).
        customer = await Customer.create({ name: normalizedName, emailHash: hashedEmail, email: hashedEmail });
        created = true;
      } catch (createErr) {
        // handle rare race or index issues by re-querying the record
        if (createErr && createErr.code === 11000) {
          customer = await Customer.findOne({ emailHash: hashedEmail }) || await Customer.findOne({ email: normalizedEmail }).select('+email');
          if (!customer) throw createErr;
        } else {
          throw createErr;
        }
      }
    }

    const token = jwt.sign({ id: customer._id, emailHash: hashedEmail, role: customer.role }, process.env.JWT_SECRET);

    // If the user already existed, return only message + token.
    if (!created) {
      return res.json({ message: "LoginSuccessful", token });
    }

    // For newly created users include the customer object (without identifying fields)
    const out = customer.toObject ? customer.toObject() : customer;
    delete out.email;
    delete out.emailHash;
    delete out.__v;

    res.json({ message: "LoginSuccessful", customer: out, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerInfo = async (req, res) => {
  // Prefer id from verified token; fallback to `email` query param if present.
  const idFromToken = req.user && req.user.id;
  const { email } = req.query || {};
  const normalizedQueryEmail = email ? email.toString().trim().toLowerCase() : null;

  try {
    let customer;
    if (idFromToken) {
      customer = await Customer.findById(idFromToken).select("-__v -email -emailHash");
    } else if (normalizedQueryEmail) {
      const hashedQuery = hashEmail(normalizedQueryEmail);
      customer = await Customer.findOne({ emailHash: hashedQuery }).select("-__v -email -emailHash");
      if (!customer) {
        // legacy fallback: maybe a record still stored with plaintext email
        const legacy = await Customer.findOne({ email: normalizedQueryEmail }).select('+email');
        if (legacy) {
          // migrate
          legacy.emailHash = hashedQuery;
          legacy.email = undefined;
          await legacy.save();
          customer = await Customer.findById(legacy._id).select("-__v -email -emailHash");
        }
      }
    } else {
      return res.status(400).json({ message: "Missing identifier: provide token or email query" });
    }

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.placeOrder = async (req, res) => {
  // This is a placeholder implementation. In a real application, you would:
  // 1. Validate the order details in req.body (e.g., items, quantities, payment info).
  // 2. Create an Order record in the database linked to req.user.id.
  // 3. Possibly interact with a payment gateway.
  // 4. Return order confirmation details.

  const customerId = req.user && req.user.id;
  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized: no customer ID" });
  }

  // Echo back the received order details and include customer id.
  const orderDetails = req.body || {};

  const resp = {
    message: "Order placed successfully",
    order: orderDetails,
    customerId,
  };

  // Publish to RabbitMQ (best-effort, do not fail the request if broker is down)
  (async () => {
    try {
      const payload = { customerId, order: orderDetails, createdAt: new Date().toISOString() };
      await publishNewOrder(payload);
      console.log('Published new order to RabbitMQ (customer service)');
    } catch (e) {
      console.warn('Failed to publish new order (customer service):', e && (e.message || e));
    }
  })();

  // If request content type isn't JSON, include a hint (clients like Postman
  // sometimes omit the `Content-Type: application/json` header which leaves
  // `req.body` empty when `express.json()` doesn't run).
  try {
    if (!req.is || !req.is('application/json')) {
      resp.note = 'Request Content-Type is not application/json; body may be empty.';
    }
  } catch (e) {
    // ignore
  }

  res.json(resp);
  
}

// Ensure explicit export on module.exports in case of runtime require quirks
module.exports.placeOrder = exports.placeOrder;

