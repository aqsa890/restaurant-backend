const express = require('express');
const router = express.Router();
const RestaurantOrder = require('../models/restaurantOrder.model');
const publisher = require('../rabbitmq/publisher');

// Update order status and publish update to queue
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    const order = await RestaurantOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    // publish back status update for order service
    await publisher.publishStatusUpdate({ orderId: order.orderId || order._id, status });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
