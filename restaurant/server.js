require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json());

const menuRoutes = require("./routes/menu.route");
const statusRoutes = require("./routes/status.route");

app.use("/api/menu", menuRoutes);
app.use('/api/restaurant-order', statusRoutes);

app.get("/", (req, res) => {
  res.send("Restaurant Service Running");
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});

// Try connecting to RabbitMQ and report status
const amqp = require('amqplib');
amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost')
  .then(() => console.log('RabbitMQ connected (restaurant service)'))
  .catch((e) => console.warn('RabbitMQ connection failed (restaurant service):', e.message));