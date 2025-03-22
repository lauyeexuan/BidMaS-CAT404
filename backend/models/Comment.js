// Purpose: Defines the Mongoose schema for a comment 
// in MongoDB. It would include fields for 
// the comment text, author ID, post ID, and timestamps.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }, // Reference to Post model
  userId: { type: String, required: true }, // Reference to user ID
  user: { type: String, required: true }, // Store user's name
  text: { type: String, required: true },
  likes: { type: Number, default: 0 }, // Number of likes
  likedBy: [{ type: String }] // Array of user IDs who liked the comment
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', CommentSchema);