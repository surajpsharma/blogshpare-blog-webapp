const express = require("express");
const router = express.Router();
const Blogs = require("../models/Blogs");
const Profile = require("../models/Profile");
const Comments = require("../models/Comments");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;
const clientPromise = require("../database/db");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fetch blog and category data
router.post("/blogdata", async (req, res) => {
  try {
    const [blogs, blogsCat] = await Promise.all([
      Blogs.find().exec(),
      Category.find().exec(),
    ]);
    res.json([blogs, blogsCat]);
  } catch (error) {
    console.error(error.message);
    res.json("Server Error");
  }
});

// Fetch user's blogs
router.post("/myblogs", async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [allBlogs, blogsCat] = await Promise.all([
      Blogs.find().exec(),
      Category.find().exec(),
    ]);

    const userBlogs = allBlogs.filter((blog) => blog.email === req.body.email);
    res.json([userBlogs, blogsCat]);
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
});

// Create a new blog
router.post("/createblog", async (req, res) => {
  try {
    const {
      title,
      categoryName,
      desc,
      img,
      contents,
      email,
      createdAt,
      updatedAt,
    } = req.body;
    const newBlog = new Blogs({
      title,
      categoryName,
      desc,
      img, // Save Cloudinary URL
      contents,
      email,
      createdAt,
      updatedAt,
    });

    const savedBlog = await newBlog.save();

    const profile = await Profile.findOne({ email });
    if (profile) {
      profile.blogs.push(savedBlog._id);
      await profile.save();
    }

    res
      .status(200)
      .json({ message: "Blog created successfully", blog: savedBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a blog
router.post("/updateblog", async (req, res) => {
  try {
    const { id, data } = req.body;
    const { title, categoryName, desc, img, contents, email } = data;

    const existingBlog = await Blogs.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Update blog with the new information
    const updatedBlog = await Blogs.findByIdAndUpdate(
      id,
      {
        title,
        categoryName,
        desc,
        img,
        contents, // Use the updated contents array
        email,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a blog
router.post("/deleteblog", async (req, res) => {
  try {
    const blogToDelete = await Blogs.findById(req.body.id);
    if (!blogToDelete) {
      return res.status(404).json({ message: "Blog not found" });
    }

    await Blogs.findByIdAndDelete(req.body.id);
    await Comments.deleteMany({ blogId: req.body.id });

    const profile = await Profile.findOne({ email: blogToDelete.email });
    if (profile) {
      profile.blogs = profile.blogs.filter(
        (blogId) => blogId.toString() !== req.body.id
      );
      await profile.save();
    }

    res
      .status(200)
      .json({
        message: "Blog, related comments, and images deleted successfully",
      });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
