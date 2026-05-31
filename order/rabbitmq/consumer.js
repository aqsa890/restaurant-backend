const amqp = require('amqplib');
const mongoose = require('mongoose');
const Order = require('../models/order.model');

async function start() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const ch = await conn.createChannel();

  const q = 'order_status_updates';
  await ch.assertQueue(q, { durable: true });
  console.log('Order service consumer listening for status updates...');
  ch.consume(q, async msg => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      const { orderId, status } = data;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        console.log('Order', orderId, 'updated to', status);
      }
      ch.ack(msg);
    } catch (e) {
      console.error('consumer error', e.message);
      ch.nack(msg, false, false);
    }
  });
}

start().catch(e => console.error('consumer start error', e.message));
