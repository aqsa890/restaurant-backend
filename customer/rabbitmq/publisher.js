const amqp = require('amqplib');

async function publishNewOrder(order) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const ch = await conn.createChannel();
  const q = 'new_orders';
  await ch.assertQueue(q, { durable: true });
  ch.sendToQueue(q, Buffer.from(JSON.stringify(order)), { persistent: true });
  setTimeout(() => { ch.close(); conn.close(); }, 500);
}

module.exports = { publishNewOrder };
