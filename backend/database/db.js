const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/blogsphare";

const options = {
  serverSelectionTimeoutMS: 50000, // Increase the timeout to 50 seconds
  socketTimeoutMS: 50000, // Increase the socket timeout to 50 seconds
  retryWrites: true,
  w: "majority",
  // Modified SSL/TLS settings to fix connection issues
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true, // Allow invalid certificates for troubleshooting
};

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

// Create a new MongoClient
const createClient = () => {
  console.log("Creating new MongoDB client...");
  client = new MongoClient(uri, options);
  return client
    .connect()
    .then((client) => {
      console.log("✅ Connected to MongoDB via MongoClient");
      return client;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      console.log("Retrying connection in 5 seconds...");
      return new Promise((resolve) => {
        setTimeout(() => resolve(createClient()), 5000);
      });
    });
};

// Initialize client based on environment
if (process.env.NODE_ENV === "development") {
  // Check if there's already a client promise for reuse
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // For production, create a new client and connect
  clientPromise = createClient();
}

module.exports = clientPromise;
