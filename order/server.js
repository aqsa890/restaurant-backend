require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/order.route');

const app = express();
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant';
mongoose.connect(MONGO)
  .then(() => console.log('Order Service DB Connected'))
  .catch(err => console.error('Order DB connect error', err.message));

// Try connecting to RabbitMQ and report status
const amqp = require('amqplib');
amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
  .then(() => console.log('RabbitMQ connected (order service)'))
  .catch((e) => console.warn('RabbitMQ connection failed (order service):', e.message));

app.use('/api/order', orderRoutes);

app.get('/', (req, res) => res.send('Order service running'));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Order service running on ${PORT}`));
