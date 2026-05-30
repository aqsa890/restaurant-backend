require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(express.json());

const menuRoutes = require("./routes/menu.route");

app.use("/api/menu", menuRoutes);

app.get("/", (req, res) => {
  res.send("Restaurant Service Running");
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});