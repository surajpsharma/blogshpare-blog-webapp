// mongoose.js (Mongoose connection)
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB URI is not defined in environment variables");
  process.exit(1); // Exit the application if MongoDB URI is not defined
}

const mongooseOptions = {
  serverSelectionTimeoutMS: 50000, // Increase timeout
  socketTimeoutMS: 45000, // Increase socket timeout
  retryWrites: true,
  w: "majority",
  // Modified SSL/TLS settings to fix connection issues
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true, // Allow invalid certificates for troubleshooting
};

// Connection with retry logic
const connectWithRetry = () => {
  console.log("Attempting to connect to MongoDB...");

  mongoose
    .connect(uri, mongooseOptions)
    .then(() => {
      console.log("✅ Connected to MongoDB via Mongoose");
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    });
};

// Initial connection attempt
connectWithRetry();

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected, attempting to reconnect...");
  connectWithRetry();
});

module.exports = mongoose; // Export the Mongoose instance for schemas and models
