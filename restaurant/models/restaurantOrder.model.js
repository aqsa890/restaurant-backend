const mongoose = require('mongoose');

const RestaurantOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: String },
  items: { type: Array, default: [] },
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RestaurantOrder', RestaurantOrderSchema);
