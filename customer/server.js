/*
  server.js
  - Entry point for the `customer` microservice.
  - Sets up Express, loads environment vars, connects to MongoDB,
    and mounts customer-related routes at `/api/customer`.
  - Use: `node server.js` or `npm run dev` from the `customer` folder.
*/

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routes/customer.route");
dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));



app.use("/api/customer", authRoutes);

app.listen(5001, () => {
  console.log("Customer service running on 5001");
});