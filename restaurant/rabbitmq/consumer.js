const amqp = require('amqplib');
const connectDB = require('../config/db');
const RestaurantOrder = require('../models/restaurantOrder.model');

async function start() {
  await connectDB();
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const ch = await conn.createChannel();
  const q = 'new_orders';
  await ch.assertQueue(q, { durable: true });
  console.log('Restaurant consumer listening for new_orders...');
  ch.consume(q, async msg => {
    if (!msg) return;
    try {
      const order = JSON.parse(msg.content.toString());
      // create restaurant-side order record
      await RestaurantOrder.create({
        orderId: order._id,
        customerId: order.customerId,
        items: order.items,
        status: 'PENDING'
      });
      console.log('Restaurant saved order', order._id);
      ch.ack(msg);
    } catch (e) {
      console.error('restaurant consumer error', e.message);
      ch.nack(msg, false, false);
    }
  });
}

start().catch(e => console.error('restaurant consumer start error', e.message));
