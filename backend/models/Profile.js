const mongoose = require('../database/mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String
    },
    bio: {
        type: String,
        default: '',
        maxlength: [200, 'Bio cannot be more than 160 characters'],
    },
    profilePic: {
        type: String,
        default: '', // Default or empty profile picture URL
        require: true
    },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blogs' }],
    follower: {
        type: Array,
        required: true,
      },
    following: {
        type: Array,
        required: true,
      },
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` timestamps
});

module.exports = mongoose.model('Profile', ProfileSchema);
