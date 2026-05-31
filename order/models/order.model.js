const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  items: { type: Array, default: [] },
  total: { type: Number, default: 0 },
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
