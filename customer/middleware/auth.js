const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/revokedToken.model");

/*
  middleware/auth.js
  - Factory that returns an express middleware enforcing JWT auth when `required:true`.
  - Usage:
    - `auth()` or `auth({ required: false })` -> optional: verifies token if present, otherwise continues
    - `auth({ required: true })` -> required: rejects requests without a valid token
*/

module.exports = ({ required = false } = {}) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      if (required) return res.status(401).json({ message: "No token provided" });
      return next();
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];
    req.token = token;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      // check blacklist
      const revoked = await RevokedToken.findOne({ token }).lean();
      if (revoked) return res.status(401).json({ message: "Token revoked" });

      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
