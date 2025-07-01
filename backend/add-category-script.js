require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

// Connect to MongoDB
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/blogsphare";
mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 50000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Function to add a new category
async function addCategory(categoryName, description) {
  try {
    // Check if category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      console.log(`Category "${categoryName}" already exists.`);
      return null;
    }

    // Create new category
    const newCategory = new Category({
      categoryName,
      description: description || "",
    });

    const savedCategory = await newCategory.save();
    console.log(`Category "${categoryName}" added successfully.`);
    return savedCategory;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
}

// Function to add multiple categories
async function addMultipleCategories(categories) {
  try {
    // Get existing category names
    const existingCategoryNames = (await Category.find({}, "categoryName")).map(
      (cat) => cat.categoryName
    );

    // Filter out categories that already exist
    const newCategories = categories.filter(
      (cat) => !existingCategoryNames.includes(cat.categoryName)
    );

    if (newCategories.length === 0) {
      console.log("All categories already exist.");
      return [];
    }

    // Insert new categories
    const createdCategories = await Category.insertMany(newCategories);
    console.log(`${createdCategories.length} categories added successfully.`);
    return createdCategories;
  } catch (error) {
    console.error("Error adding multiple categories:", error);
    return [];
  }
}

// Add a single category
async function addSingleCategory() {
  const result = await addCategory(
    "Artificial Intelligence",
    "Content about AI, machine learning, and neural networks"
  );
  console.log(result);
}

// Add multiple categories
async function addMultipleCats() {
  const newCategories = [
    {
      categoryName: "Cybersecurity",
      description:
        "Information about security, hacking, and protecting digital assets",
    },
    {
      categoryName: "Blockchain",
      description:
        "Content about blockchain technology, cryptocurrencies, and NFTs",
    },
    {
      categoryName: "Virtual Reality",
      description: "Discussions about VR, AR, and immersive technologies",
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
      description: "Painting, digital art, photography, and visual creativity",
    },
  ];

  const results = await addMultipleCategories(newCategories);
  console.log(results);
}

// Run both functions
async function run() {
  await addSingleCategory();
  await addMultipleCats();

  // Close the connection when done
  mongoose.connection.close();
}

run();
