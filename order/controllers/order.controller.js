const Order = require('../models/order.model');
const publish = require('../rabbitmq/publisher');

exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, total } = req.body || {};
    if (!customerId) return res.status(400).json({ message: 'customerId required' });

    const order = await Order.create({ customerId, items, total, status: 'PENDING' });

    // publish to RabbitMQ so restaurant can consume
    try { await publish.publishNewOrder(order); } catch (e) { console.error('publish error', e.message); }

    res.status(201).json({ message: 'Order saved', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
