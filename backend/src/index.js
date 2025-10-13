// Load environment variables early
require("dotenv").config();

// Core dependencies
const express = require("express");
const cors = require("cors");

// Firebase Admin SDK
const admin = require("../config/firebase");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test env load
console.log("FIREBASE PROJECT ID:", process.env.FIREBASE_PROJECT_ID);

// Health check
app.get("/", (req, res) => {
  res.send("GymPlify API is running");
});

// Firebase test route
app.get("/test/firebase", async (req, res) => {
  try {
    const time = new Date();
    res.status(200).json({
      firebase: "connected",
      time: time.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Firebase failed" });
  }
});

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const qrRoutes = require("./routes/qr");
app.use("/qr", qrRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
