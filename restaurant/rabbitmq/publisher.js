const amqp = require('amqplib');

async function publishStatusUpdate(update) {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const ch = await conn.createChannel();
  const q = 'order_status_updates';
  await ch.assertQueue(q, { durable: true });
  ch.sendToQueue(q, Buffer.from(JSON.stringify(update)), { persistent: true });
  setTimeout(() => { ch.close(); conn.close(); }, 500);
}

module.exports = { publishStatusUpdate };
