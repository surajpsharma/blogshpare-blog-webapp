const express = require("express");
require("dotenv").config();
const app = express();

// ✅ CORS Middleware
app.use((req, res, next) => {
  // Allow requests from the Vercel-deployed frontend and local development
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000", // Allow local development
  ];
  const origin = req.headers.origin;

  // Only set the header if origin exists and is in allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "production") {
    // In production, if origin doesn't match, use the FRONTEND_URL from env
    // This ensures we always have a valid value
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.FRONTEND_URL || "https://your-production-domain.com"
    );
  } else {
    // In development, default to localhost if no match
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Body Parser (with limit for large image/file uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// No need to serve local uploads as we're using Cloudinary

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// ✅ API Routes (Modular)
app.use("/api", require("./Routes/CreateUser"));
app.use("/api", require("./Routes/DisplayBlogs"));
app.use("/api", require("./Routes/DisplayComment"));
app.use("/api", require("./Routes/DisplayProfiles")); // Includes `/usersprofile` route
app.use("/api", require("./Routes/Categories"));
app.use("/api", require("./middleware/uploads")); // If handling file uploads via multer or similar

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).send("Something broke!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
