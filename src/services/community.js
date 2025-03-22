// Purpose: A service file to encapsulate the API calls to your backend. 
// It would include functions for fetching posts, creating posts, adding comments, liking posts, etc. (using axios or fetch).

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:4000/api/community',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Service object to handle all community-related API calls
const communityService = {
    // Fetch all posts
    getAllPosts: async () => {
        try {
            const response = await api.get('/posts');
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
    addComment: async (postId, userId, user, text) => {
        try {
            const response = await api.post(`/posts/${postId}/comments`, {
                userId,
                user,
                text
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
    }
};

export default communityService;


