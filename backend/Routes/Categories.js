const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// @route   POST /api/init-categories
// @desc    Initialize default blog categories (runs only once)
// @access  Public or Admin (based on your use-case)
router.post("/init-categories", async (req, res) => {
  try {
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      return res.json({
        message: "Categories already exist",
        categories: existingCategories,
      });
    }

    // Default category list
    const defaultCategories = [
      {
        categoryName: "Technology",
        description: "Posts about technology, coding, and software development",
      },
      {
        categoryName: "Travel",
        description: "Travel experiences, tips, and destinations",
      },
      {
        categoryName: "Food",
        description: "Recipes, restaurant reviews, and culinary experiences",
      },
      {
        categoryName: "Lifestyle",
        description: "Lifestyle tips, habits, and personal development",
      },
      {
        categoryName: "Health",
        description: "Health tips, fitness, and wellness",
      },
      {
        categoryName: "Business",
        description: "Business insights, entrepreneurship, and finance",
      },
      {
        categoryName: "Education",
        description: "Learning resources, tutorials, and educational content",
      },
      {
        categoryName: "Entertainment",
        description: "Movies, music, games, and entertainment",
      },
      {
        categoryName: "Politics",
        description: "Political news, analysis, and current events",
      },
      {
        categoryName: "Science",
        description: "Science news, research, and discoveries",
      },
      {
        categoryName: "Sports",
        description: "Sports news, highlights, and competitions",
      },
      {
        categoryName: "Spirituality",
        description:
          "All content related to God, worship, prayer, meditation, and spiritual growth",
      },
      {
        categoryName: "Environment",
        description:
          "Posts about climate change, sustainability, and nature conservation",
      },
      {
        categoryName: "History",
        description: "Historical events, cultures, and stories from the past",
      },
      {
        categoryName: "Parenting",
        description:
          "Tips, experiences, and guides for parenting and family life",
      },
      {
        categoryName: "Fashion",
        description: "Trends, style tips, and clothing inspiration",
      },
      {
        categoryName: "Finance",
        description: "Personal finance, saving, investing, and budgeting",
      },
      {
        categoryName: "SelfHelp",
        description: "Motivational and self-improvement articles",
      },
      {
        categoryName: "Philosophy",
        description:
          "Deep thoughts, ideas, and discussions about life and existence",
      },
      {
        categoryName: "Relationships",
        description:
          "Advice and experiences on love, friendships, and human connection",
      },
      {
        categoryName: "Culture",
        description:
          "Cultural traditions, festivals, customs, and societal topics",
      },
      {
        categoryName: "Art",
        description:
          "Painting, digital art, photography, and visual creativity",
      },
    ];

    const createdCategories = await Category.insertMany(defaultCategories);

    res.json({
      message: "Categories initialized successfully",
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Error initializing categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/add-category
// @desc    Add a new category
// @access  Public or Admin (based on your use-case)
router.post("/add-category", async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    // Validate input
    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create new category
    const newCategory = new Category({
      categoryName,
      description: description || "",
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: savedCategory,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/add-multiple-categories
// @desc    Add multiple new categories at once
// @access  Public or Admin (based on your use-case)
router.post("/add-multiple-categories", async (req, res) => {
  try {
    const { categories } = req.body;

    // Validate input
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: "Categories array is required" });
    }

    // Validate each category has a name
    for (const category of categories) {
      if (!category.categoryName) {
        return res
          .status(400)
          .json({ message: "Each category must have a name" });
      }
    }

    // Filter out categories that already exist
    const existingCategoryNames = (await Category.find({}, "categoryName")).map(
      (cat) => cat.categoryName
    );
    const newCategories = categories.filter(
      (cat) => !existingCategoryNames.includes(cat.categoryName)
    );

    if (newCategories.length === 0) {
      return res.status(400).json({ message: "All categories already exist" });
    }

    // Insert new categories
    const createdCategories = await Category.insertMany(newCategories);

    res.status(201).json({
      message: `${createdCategories.length} categories added successfully`,
      categories: createdCategories,
    });
  } catch (error) {
    console.error("Error adding multiple categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/categories
// @desc    Get all blog categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ categoryName: 1 }); // sorted alphabetically
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
