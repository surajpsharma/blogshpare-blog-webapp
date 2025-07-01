const express = require("express");
const router = express.Router();
const Comments = require("../models/Comments");

// ✅ GET ALL COMMENTS FOR A BLOG
router.post("/commentdata", async (req, res) => {
  try {
    const { id: blogId } = req.body;
    if (!blogId) {
      return res.status(400).json({ message: "Blog ID is required" });
    }

    const comments = await Comments.find({ blogId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error("🔥 Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ ADD A COMMENT
router.post("/addcomment", async (req, res) => {
  try {
    const { blogId, content, email, username, createdAt, updatedAt } = req.body;

    if (!blogId || !content || !email || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = new Comments({
      blogId,
      content,
      email,
      username,
      createdAt: createdAt || new Date(),
      updatedAt: updatedAt || new Date(),
    });

    const savedComment = await newComment.save();
    console.log("✅ Comment Saved:", savedComment);
    res.status(200).json(savedComment); // frontend expects raw comment
  } catch (error) {
    console.error("🔥 Error creating comment:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// ✅ UPDATE A COMMENT
router.post("/updatecomment", async (req, res) => {
  try {
    const { id, data } = req.body;

    if (!id || !data) {
      return res.status(400).json({ message: "'id' and 'data' are required" });
    }

    const { blogId, content, email, username, createdAt, updatedAt } = data;

    const updatedComment = await Comments.findByIdAndUpdate(
      id,
      {
        blogId,
        content,
        email,
        username,
        createdAt,
        updatedAt: updatedAt || new Date(),
      },
      { new: true }
    );

    if (updatedComment) {
      res.status(200).json(updatedComment); // frontend expects raw comment
    } else {
      res.status(404).json({ message: "Comment not found" });
    }
  } catch (error) {
    console.error("🔥 Error updating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ DELETE A COMMENT
router.post("/deletecomment", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Comment ID required" });

    const deletedComment = await Comments.findByIdAndDelete(id);

    if (deletedComment) {
      console.log("✅ Comment Deleted:", deletedComment);
      res
        .status(200)
        .json({
          message: "Comment deleted successfully",
          comment: deletedComment,
        });
    } else {
      res.status(404).json({ message: "Comment not found" });
    }
  } catch (error) {
    console.error("🔥 Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
