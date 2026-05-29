/*
  models/customer.model.js
  - Mongoose model for Customer documents.
  - Emails are stored only as a hash (`emailHash`) to avoid persisting plaintext emails.
  - Fields: `name`, `emailHash` (unique), and `role`.
  - For backward compatibility this schema allows an optional `email` field
    but application code will migrate and remove plaintext `email` on first access.
  - Use by importing: `const Customer = require('../models/customer.model')`.
*/

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  // hashed email (sha256 hex). Use this field for lookups and uniqueness.
  emailHash: { type: String, unique: true, sparse: true },
  // legacy plaintext field (optional). Will be removed from records when migrated.
  email: { type: String, select: false },
  role: { type: String, default: "customer" }
});

module.exports = mongoose.model("Customer", customerSchema);