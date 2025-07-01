const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile"); // Ensure your Mongoose Profile model is correctly imported
const clientPromise = require("../database/db"); // Only needed if you use mongoClient directly, not if you use Mongoose Profile model
const cloudinary = require("cloudinary").v2; // Only needed if you perform cloudinary operations here

// Cloudinary config is usually done once globally, e.g., in index.js or a config file,
// but if you have operations specific to this router, it can be here.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get("/usersprofile", async (req, res) => {
  try {
    // If you are using Mongoose, you can simplify this:
    const profiles = await Profile.find({});
    return res.status(200).json(profiles);
  } catch (error) {
    console.error("❌ Error in /usersprofile:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/myprofiledata", async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const profile = await Profile.find({ email: email });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/updateprofile", async (req, res) => {
  try {
    const { email, data } = req.body;
    if (!email || !data) {
      return res.status(400).json({ message: "Email and data are required" });
    }
    const existingProfile = await Profile.findOne({ email });
    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const updatedFields = {};
    if (data.username) updatedFields.username = data.username;
    if (data.bio) updatedFields.bio = data.bio;
    if (data.profilePic) updatedFields.profilePic = data.profilePic;

    const updatedProfile = await Profile.findOneAndUpdate(
      { email: email },
      { $set: updatedFields },
      { new: true, runValidators: true } // Added runValidators for consistency
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile update failed" });
    }
    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Error in updateprofile:", error);
    res.status(500).send("Server Error");
  }
});

// --- THE CRITICAL FOLLOW/UNFOLLOW ROUTE ---
router.post("/followfollowing", async (req, res) => {
  // --- IMPORTANT DEBUGGING LOGS ---
  console.log("-------------------------------------------------");
  console.log("Received POST request to /api/followfollowing");
  console.log("Request Body Received:", req.body); // <<< Pay attention to this output in your backend terminal!
  console.log("-------------------------------------------------");
  // --- End of IMPORTANT DEBUGGING LOGS ---

  try {
    // This line MUST correctly destructure 'action'
    const { currentUserEmail, profileUserEmail, action } = req.body;

    if (!currentUserEmail || !profileUserEmail || !action) {
      return res.status(400).json({
        error:
          "Missing required fields: currentUserEmail, profileUserEmail, and action (follow/unfollow).",
      });
    }

    // Determine the update operations based on the action
    let currentUserUpdate;
    let profileUserUpdate;
    let isFollowingStatus; // What the status will be AFTER the operation

    if (action === "follow") {
      currentUserUpdate = { $addToSet: { following: profileUserEmail } };
      profileUserUpdate = { $addToSet: { follower: currentUserEmail } };
      isFollowingStatus = true; // After successful 'follow'
    } else if (action === "unfollow") {
      currentUserUpdate = { $pull: { following: profileUserEmail } };
      profileUserUpdate = { $pull: { follower: currentUserEmail } };
      isFollowingStatus = false; // After successful 'unfollow'
    } else {
      return res
        .status(400)
        .json({ error: "Invalid action. Must be 'follow' or 'unfollow'." });
    }

    // Perform updates atomically using findOneAndUpdate
    const updatedCurrentUser = await Profile.findOneAndUpdate(
      { email: currentUserEmail },
      currentUserUpdate,
      { new: true, runValidators: true } // `new: true` returns the modified document
    );

    const updatedProfileUser = await Profile.findOneAndUpdate(
      { email: profileUserEmail },
      profileUserUpdate,
      { new: true, runValidators: true }
    );

    if (!updatedCurrentUser) {
      return res.status(404).json({
        error: `Current user profile with email ${currentUserEmail} not found.`,
      });
    }
    if (!updatedProfileUser) {
      return res.status(404).json({
        error: `Target profile with email ${profileUserEmail} not found.`,
      });
    }

    // Respond with the new following status
    return res.status(200).json({
      message: `Successfully ${action}ed user.`,
      isFollowing: isFollowingStatus, // Send the final status back to frontend
      currentUserProfile: updatedCurrentUser, // Optionally send updated profiles
      targetProfile: updatedProfileUser,
    });
  } catch (error) {
    console.error("Error in follow/unfollow logic:", error);
    res
      .status(500)
      .json({ error: "Server Error during follow/unfollow operation." });
  }
});
// --- END OF THE CRITICAL FOLLOW/UNFOLLOW ROUTE ---

router.post("/followingProfiles", async (req, res) => {
  const { emails } = req.body;
  try {
    const profiles = await Profile.find({ email: { $in: emails } });
    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/followerProfiles", async (req, res) => {
  const { emails } = req.body;
  try {
    const profiles = await Profile.find({ email: { $in: emails } });
    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
