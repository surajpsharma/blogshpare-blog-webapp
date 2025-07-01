const express = require("express");
const router = express.Router();
const path = require("path");
const { upload, cloudinary } = require("../config/cloudinary");

// Define the upload route
router.post("/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Check for specific multer error codes
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size exceeds limit of 10MB" });
      }
      // Handle other multer errors
      console.error("Upload error:", err);
      return res.status(500).json({
        error: "File upload failed due to server error",
        details: err.message,
      });
    }

    // If no file is uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "File upload failed: No file provided" });
    }

    // Successful upload response with Cloudinary URL
    res.status(200).json({
      message: "File uploaded successfully to Cloudinary",
      filename: req.file.filename,
      path: req.file.path, // Cloudinary URL
      secure_url: req.file.secure_url, // HTTPS URL
    });
  });
});

module.exports = router;
