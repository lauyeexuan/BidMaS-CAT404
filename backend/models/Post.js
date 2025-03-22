// Purpose: Defines the Mongoose schema for a post in MongoDB. 
// It would include fields for the post text, author ID, 
// image/video URL (from Firebase Storage), like count, comment count, and timestamps.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  userId: { type: String, required: true }, // Reference to user ID (from Firestore or your auth system)
  user: { type: String, required: true }, // Store user's name
  text: { type: String, required: true },
  imageUrl: { type: String }, // URL of the image in Firebase Storage
  videoUrl: { type: String }, // URL of the video in Firebase Storage
  likes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // Reference to Comment model
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);