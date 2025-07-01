const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../models/Profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const clientPromise = require("../database/db");

router.post(
  "/createuser",
  [
    body("email", "Incorrect Email").isEmail(),
    body("name", "Minimum length should be 5").optional().isLength({ min: 5 }),
    body("password", "Incorrect Password").optional().isLength({ min: 5 }),
    body("username", "Invalid Username").optional().isLength({ min: 5 }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    try {
      const mongoClient = await clientPromise;
      const db = mongoClient.db();

      // Check if a user with the same email already exists (using native MongoDB driver)
      let existingUser = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (existingUser) {
        return res.json({
          success: false,
          error: "This email is already registered",
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      let secPassword = await bcrypt.hash(req.body.password, salt);

      // Create the new user using Mongoose
      const user = await User.create({
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
        password: secPassword,
      });

      // Create a new profile for the user using Mongoose
      await Profile.create({
        email: user.email,
        username: user.username,
        bio: "",
        profilePic: `${process.env.FRONTEND_URL}/Image/default_profile.jpeg`,
        blogs: [],
        follower: [],
        following: [],
      });

      // Send success response
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

router.post(
  "/loginuser",
  [
    body("email", "Incorrect Email").isEmail(),
    body("password", "Incorrect Password").optional().isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let email = req.body.email;
    try {
      // Use native MongoDB driver to perform raw operations if needed
      const mongoClient = await clientPromise;
      const db = mongoClient.db();

      // Example of using the native driver to get the user data
      let userData = await db.collection("users").findOne({ email });
      if (!userData) {
        return res
          .status(400)
          .json({
            error:
              "Invalid login. It seems you're not registered. Please sign up to create an account.",
          });
      }

      // Compare password using bcrypt
      const pwdCompare = await bcrypt.compare(
        req.body.password,
        userData.password
      );
      if (!pwdCompare) {
        return res
          .status(400)
          .json({ error: "Try login with correct Password" });
      }

      // Generate JWT token
      const data = {
        user: {
          id: userData._id, // Use _id if working with MongoDB driver
        },
      };
      const authToken = jwt.sign(data, process.env.JWT_SECRET);

      // Send response with token
      res.json({ success: true, authToken: authToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/username", async (req, res) => {
  let email = req.body.email;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    let userData = await User.findOne({ email });
    res.send({ username: userData.username });
  } catch (error) {
    // // console.log(console.log(console.log(error)););
  }
});

module.exports = router;
