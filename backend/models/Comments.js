const mongoose = require('../database/mongoose');
const {Schema} = mongoose
const commentSchema = new Schema({
    email: { 
        type: String, 
        required: true 
        },
        username: { 
            type: String, 
            required: true 
            },
    blogId: { 
        type: String, 
        required: true 
        },
    content: {
        type: String,
        required: true,
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

module.exports = mongoose.model('comments', commentSchema);