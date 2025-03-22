// Purpose: Defines the API routes for the community feature. Examples:
// GET /api/community/posts: Get all posts.
// POST /api/community/posts: Create a new post.
// GET /api/community/posts/:postId: Get a specific post.
// POST /api/community/posts/:postId/comments: Add a comment to a post.
// POST /api/community/posts/:postId/likes: Like a post.

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { storage } = require('../config/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const mongoose = require('mongoose');

// GET all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('comments');
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST - Create a new post
router.post('/posts', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        const { userId, user, text } = req.body;
        
        // Add this debug log
        console.log('Data being saved:', {
            userId,
            user,
            text
        });

        let imageUrl = null;
        let videoUrl = null;

        // Handle image upload
        if (req.files && req.files.image) {
            console.log('Processing image:', req.files.image);
            const imageFile = req.files.image;
            const imageRef = ref(storage, `posts/images/${Date.now()}_${imageFile.name}`);
            await uploadBytes(imageRef, imageFile.data);
            imageUrl = await getDownloadURL(imageRef);
            console.log('Image uploaded, URL:', imageUrl);
        }

        // Handle video upload
        if (req.files && req.files.video) {
            const videoFile = req.files.video;
            const videoRef = ref(storage, `posts/videos/${Date.now()}_${videoFile.name}`);
            await uploadBytes(videoRef, videoFile.data);
            videoUrl = await getDownloadURL(videoRef);
        }
        console.log('MongoDB connection state:', mongoose.connection.readyState);
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

        const newPost = new Post({
            userId,
            user,
            text,
            imageUrl,
            videoUrl,
            likes: 0,
            likedBy: [],
            comments: []
        });
        
        // Add this debug log
        console.log('Post object before saving:', newPost);
        
        const savedPost = await newPost.save();
        
        // Add this debug log
        console.log('Saved post:', savedPost);
        
        res.status(201).json(savedPost);
    } catch (err) {
        console.error('Detailed error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET - Get a specific post by ID
router.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('comments');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST - Add a comment to a post
router.post('/posts/:postId/comments', async (req, res) => {
    try {
        const { userId, user, text, gifUrl } = req.body;
        const postId = req.params.postId;

        // First check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Validate that either text or gifUrl is provided
        if (!text && !gifUrl) {
            return res.status(400).json({ message: 'Comment must contain either text or a GIF' });
        }

        // Create new comment
        const newComment = new Comment({
            postId,
            userId,
            user,
            text,
            gifUrl
        });
        const savedComment = await newComment.save();

        // Add comment reference to post
        post.comments.push(savedComment._id);
        await post.save();

        // Return updated post with populated comments
        const updatedPost = await Post.findById(postId).populate('comments');
        res.status(201).json(updatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST - Like a post
router.post('/posts/:postId/likes', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Initialize likedBy array if it doesn't exist
        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }

        // Check if user already liked the post
        if (!post.likedBy.includes(userId)) {
            post.likedBy.push(userId);
            post.likes = post.likedBy.length; // Update likes count
            await post.save();
        }

        const updatedPost = await Post.findById(post._id).populate('comments');
        res.json(updatedPost);
    } catch (err) {
        console.error('Error in like post route:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE - Unlike a post
router.delete('/posts/:postId/likes', async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Initialize likedBy array if it doesn't exist
        if (!Array.isArray(post.likedBy)) {
            post.likedBy = [];
        }

        // Remove user from likedBy array
        post.likedBy = post.likedBy.filter(id => id !== userId);
        post.likes = post.likedBy.length; // Update likes count
        await post.save();

        const updatedPost = await Post.findById(post._id).populate('comments');
        res.json(updatedPost);
    } catch (err) {
        console.error('Error in unlike post route:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE - Delete a comment
router.delete('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId, commentId } = req.params;

        // Find the comment and check ownership
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Remove comment reference from post
        const post = await Post.findById(postId);
        if (post) {
            post.comments = post.comments.filter(id => id.toString() !== commentId);
            await post.save();
        }

        const updatedPost = await Post.findById(postId).populate('comments');
        res.json(updatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST - Like a comment
router.post('/posts/:postId/comments/:commentId/likes', async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId, commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Initialize likedBy array if it doesn't exist
        if (!Array.isArray(comment.likedBy)) {
            comment.likedBy = [];
        }

        // Check if user already liked the comment
        if (!comment.likedBy.includes(userId)) {
            comment.likedBy.push(userId);
            comment.likes = comment.likedBy.length; // Update likes count
            await comment.save();
        }

        const updatedPost = await Post.findById(postId).populate('comments');
        res.json(updatedPost);
    } catch (err) {
        console.error('Error in like comment route:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE - Unlike a comment
router.delete('/posts/:postId/comments/:commentId/likes', async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId, commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Initialize likedBy array if it doesn't exist
        if (!Array.isArray(comment.likedBy)) {
            comment.likedBy = [];
        }

        // Remove user from likedBy array
        comment.likedBy = comment.likedBy.filter(id => id !== userId);
        comment.likes = comment.likedBy.length; // Update likes count
        await comment.save();

        const updatedPost = await Post.findById(postId).populate('comments');
        res.json(updatedPost);
    } catch (err) {
        console.error('Error in unlike comment route:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;