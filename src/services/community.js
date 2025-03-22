// Purpose: A service file to encapsulate the API calls to your backend. 
// It would include functions for fetching posts, creating posts, adding comments, liking posts, etc. (using axios or fetch).

import axios from 'axios';
import websocketService from './websocket';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:4000/api/community',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Service object to handle all community-related API calls
const communityService = {
    // Store for posts data that can be updated by WebSocket
    _postsData: [],
    _postsListeners: [],
    
    // Method to get current posts data
    getPosts: () => {
        return communityService._postsData;
    },
    
    // Subscribe to posts updates
    subscribeToPosts: (callback) => {
        communityService._postsListeners.push(callback);
        // Immediately call with current data
        callback(communityService._postsData);
        
        // Return unsubscribe function
        return () => {
            communityService._postsListeners = 
                communityService._postsListeners.filter(cb => cb !== callback);
        };
    },
    
    // Update posts data and notify listeners
    _updatePosts: (posts) => {
        communityService._postsData = posts;
        communityService._postsListeners.forEach(cb => cb(posts));
    },
    
    // Initialize WebSocket connection and listeners
    initWebSocket: () => {
        websocketService.connect().then(() => {
            console.log('WebSocket connected for community service');
            
            // Listen for posts updates
            websocketService.on('posts_updated', (posts) => {
                communityService._updatePosts(posts);
            });
        }).catch(error => {
            console.error('WebSocket connection failed:', error);
        });
    },
    
    // Fetch all posts
    getAllPosts: async () => {
        try {
            const response = await api.get('/posts');
            communityService._updatePosts(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    },

    // Create a new post with optional media
    createPost: async (userId, user, text, image = null, video = null) => {
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('user', user);
            formData.append('text', text);
            
            if (image) {
                formData.append('image', image);
            }
            if (video) {
                formData.append('video', video);
            }

            console.log('FormData contents:', {
                userId,
                user,
                text,
                hasImage: !!image,
                hasVideo: !!video
            });

            const response = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    // Get a specific post by ID
    getPostById: async (postId) => {
        try {
            const response = await api.get(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    },

    // Add a comment to a post
    addComment: async (postId, userId, user, text, gifUrl) => {
        try {
            const response = await api.post(`/posts/${postId}/comments`, {
                userId,
                user,
                text,
                gifUrl
            });
            return response.data;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // Delete a comment
    deleteComment: async (postId, commentId, userId) => {
        try {
            const response = await api.delete(`/posts/${postId}/comments/${commentId}`, {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // Like a post
    likePost: async (postId, userId) => {
        try {
            const response = await api.post(`/posts/${postId}/likes`, { userId });
            return response.data;
        } catch (error) {
            console.error('Error liking post:', error);
            throw error;
        }
    },

    // Unlike a post
    unlikePost: async (postId, userId) => {
        try {
            const response = await api.delete(`/posts/${postId}/likes`, {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error unliking post:', error);
            throw error;
        }
    },

    // Like a comment
    likeComment: async (postId, commentId, userId) => {
        try {
            const response = await api.post(`/posts/${postId}/comments/${commentId}/likes`, { userId });
            return response.data;
        } catch (error) {
            console.error('Error liking comment:', error);
            throw error;
        }
    },

    // Unlike a comment
    unlikeComment: async (postId, commentId, userId) => {
        try {
            const response = await api.delete(`/posts/${postId}/comments/${commentId}/likes`, {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error unliking comment:', error);
            throw error;
        }
    },

    // Edit a post
    editPost: async (postId, userId, text) => {
        try {
            const response = await api.put(`/posts/${postId}`, {
                userId,
                text
            });
            return response.data;
        } catch (error) {
            console.error('Error editing post:', error);
            throw error;
        }
    },

    // Delete a post
    deletePost: async (postId, userId) => {
        try {
            const response = await api.delete(`/posts/${postId}`, {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
};

export default communityService;


