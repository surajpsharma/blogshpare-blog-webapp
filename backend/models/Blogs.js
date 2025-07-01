const mongoose = require('../database/mongoose');
const {Schema} = mongoose
const blogSchema = new Schema({
  title: { 
    type: String, 
    required: true 
    },
  categoryName: { 
    type: String, 
    required: true 
    },
  desc: { 
    type: String, 
    required: true 
    },
  img: { 
    type: String, 
    required: true 
    },
  contents: {
    type: Array,
    required: true,
  },
  email: { 
    type: String, 
    required: true 
    },
  createdAt: { 
    type: Date, 
    default: Date.now 
    },
  updatedAt: { 
    type: Date, 
    default: Date.now 
    }
});

module.exports = mongoose.model('Blogs', blogSchema);
