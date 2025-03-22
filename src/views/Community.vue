<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Community</h1>
      
      <!-- Create Post Form -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <textarea 
          v-model="newPostText" 
          class="w-full p-4 border rounded-lg mb-4 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          rows="3"
          placeholder="What's on your mind?"
        ></textarea>
        
        <!-- Media Upload Inputs -->
        <div class="mb-4 flex gap-4">
          <input 
            type="file" 
            ref="imageInput"
            accept="image/*"
            class="hidden"
            @change="handleImageSelect"
          >
          <input 
            type="file" 
            ref="videoInput"
            accept="video/*"
            class="hidden"
            @change="handleVideoSelect"
          >
          
          <button 
            @click="$refs.imageInput.click()"
            class="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-blue-500 transition-colors"
          >
            <i class="fas fa-image mr-2"></i>
            Add Image
          </button>
          
          <button 
            @click="$refs.videoInput.click()"
            class="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 hover:text-blue-500 transition-colors"
          >
            <i class="fas fa-video mr-2"></i>
            Add Video
          </button>
        </div>

        <!-- Selected Media Preview -->
        <div v-if="selectedImage || selectedVideo" class="mb-4">
          <p class="text-sm text-gray-600">Selected: 
            {{ selectedImage ? selectedImage.name : '' }}
            {{ selectedVideo ? selectedVideo.name : '' }}
          </p>
        </div>

        <button 
          @click="createPost"
          :disabled="!newPostText.trim()"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50 transition-colors"
        >
          <i class="fas fa-paper-plane mr-2"></i>
          Create Post
        </button>
      </div>

      <!-- Posts Feed -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="posts.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="post in posts" :key="post._id" class="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg">
          <!-- Post and Comments Layout -->
          <div class="flex gap-6">
            <!-- Left side: Post Content -->
            <div class="flex-1">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-800 font-semibold">{{ getUserInitials(post.user) }}</span>
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold">{{ post.user }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
                </div>
              </div>
              
              <div class="mb-4">
                <p class="text-gray-800 whitespace-pre-wrap">{{ post.text }}</p>
              </div>

              <!-- Media Content -->
              <div v-if="post.imageUrl" class="mb-4">
                <img :src="post.imageUrl" alt="Post image" class="rounded-lg max-h-96 w-auto">
              </div>
              <div v-if="post.videoUrl" class="mb-4">
                <video 
                  :src="post.videoUrl" 
                  controls 
                  class="rounded-lg max-h-96 w-auto"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div class="flex items-center space-x-4 text-gray-500">
                <button 
                  @click="togglePostLike(post)"
                  class="flex items-center hover:text-pink-500 transition-colors"
                  :class="{ 'text-pink-500': Array.isArray(post.likedBy) && post.likedBy.includes(userStore.currentUser.uid) }"
                >
                  <i class="fa-heart mr-2" :class="[
                    Array.isArray(post.likedBy) && post.likedBy.includes(userStore.currentUser.uid) 
                      ? 'fas text-pink-500' 
                      : 'far'
                  ]"></i>
                  <span>{{ post.likes || 0 }} {{ post.likes === 1 ? 'Like' : 'Likes' }}</span>
                </button>
                <div class="flex items-center text-gray-500">
                  <i class="fas fa-comment mr-2"></i>
                  <span>{{ post.comments?.length || 0 }} {{ post.comments?.length === 1 ? 'Comment' : 'Comments' }}</span>
                </div>
              </div>
            </div>

            <!-- Right side: Comments Section - Always visible -->
            <div class="w-96 border-l pl-6">
              <div class="flex flex-col h-full">
                <!-- Comments List -->
                <div class="space-y-4 max-h-[600px] overflow-y-auto mb-4">
                  <div v-if="post.comments && post.comments.length === 0" class="text-center py-4 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                  <div v-for="comment in post.comments" :key="comment._id" class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span class="text-blue-800 font-semibold text-sm">{{ getUserInitials(comment.user) }}</span>
                        </div>
                        <div class="ml-2">
                          <h4 class="font-semibold text-sm">{{ comment.user }}</h4>
                          <p class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</p>
                        </div>
                      </div>
                      
                      <!-- Delete Comment Button (only for comment owner) -->
                      <button 
                        v-if="comment.userId === userStore.currentUser.uid"
                        @click="deleteComment(post._id, comment._id)"
                        class="text-red-500 hover:text-red-600"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    
                    <p class="mt-2 text-gray-800">{{ comment.text }}</p>
                    
                    <!-- Comment Like Button -->
                    <button 
                      @click="toggleCommentLike(post._id, comment)"
                      class="mt-2 text-sm flex items-center hover:text-pink-500 transition-colors"
                      :class="{ 'text-pink-500': Array.isArray(comment.likedBy) && comment.likedBy.includes(userStore.currentUser.uid) }"
                    >
                      <i class="fa-heart mr-1" :class="[
                        Array.isArray(comment.likedBy) && comment.likedBy.includes(userStore.currentUser.uid) 
                          ? 'fas text-pink-500' 
                          : 'far'
                      ]"></i>
                      <span>{{ comment.likes || 0 }}</span>
                    </button>
                  </div>
                </div>

                <!-- Add Comment Form - moved to look like caption level -->
                <div class="flex gap-2 mt-auto pt-2 border-t">
                  <input 
                    v-model="post.newComment" 
                    class="flex-1 p-2 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Write a comment..."
                    @keyup.enter="addComment(post)"
                  >
                  <button 
                    @click="addComment(post)"
                    :disabled="!post.newComment?.trim()"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import communityService from '@/services/community';

// State
const userStore = useUserStore();
const newPostText = ref('');
const selectedImage = ref(null);
const selectedVideo = ref(null);
const posts = ref([]);
const loading = ref(true);

// Get user initials helper function
const getUserInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Fetch posts on component mount
onMounted(async () => {
  try {
    const fetchedPosts = await communityService.getAllPosts();
    posts.value = fetchedPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
  } finally {
    loading.value = false;
  }
});

// Media handlers
const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    selectedVideo.value = null;
  }
};

const handleVideoSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedVideo.value = file;
    selectedImage.value = null;
  }
};

// Create post function
const createPost = async () => {
  try {
    if (!newPostText.value.trim()) return;

    const userId = userStore.currentUser.uid;
    const userName = userStore.currentUser.name;
    
    console.log('User data:', {
      userId,
      userName,
      fullUserData: userStore.currentUser
    });

    if (!userName) {
      alert('Error: User name not found');
      return;
    }

    await communityService.createPost(
      userId,
      userName,
      newPostText.value,
      selectedImage.value,
      selectedVideo.value
    );

    // Refresh posts after creating new one
    const fetchedPosts = await communityService.getAllPosts();
    posts.value = fetchedPosts;

    // Reset form
    newPostText.value = '';
    selectedImage.value = null;
    selectedVideo.value = null;

    // Show success message
    alert('Post created successfully!');
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post. Please try again.');
  }
};

// Toggle post like
const togglePostLike = async (post) => {
  try {
    const userId = userStore.currentUser.uid;
    const isLiked = Array.isArray(post.likedBy) && post.likedBy.includes(userId);
    
    if (isLiked) {
      await communityService.unlikePost(post._id, userId);
    } else {
      await communityService.likePost(post._id, userId);
    }
    
    // Refresh posts to update like status
    const fetchedPosts = await communityService.getAllPosts();
    posts.value = fetchedPosts;
  } catch (error) {
    console.error('Error toggling post like:', error);
  }
};

// Toggle comment like
const toggleCommentLike = async (postId, comment) => {
  try {
    const userId = userStore.currentUser.uid;
    const isLiked = Array.isArray(comment.likedBy) && comment.likedBy.includes(userId);
    
    if (isLiked) {
      await communityService.unlikeComment(postId, comment._id, userId);
    } else {
      await communityService.likeComment(postId, comment._id, userId);
    }
    
    // Refresh posts to update comment like status
    const fetchedPosts = await communityService.getAllPosts();
    posts.value = fetchedPosts;
  } catch (error) {
    console.error('Error toggling comment like:', error);
  }
};

// Add comment
const addComment = async (post) => {
  try {
    if (!post.newComment?.trim()) return;
    
    const userId = userStore.currentUser.uid;
    const userName = userStore.currentUser.name;
    
    await communityService.addComment(
      post._id,
      userId,
      userName,
      post.newComment.trim()
    );
    
    // Clear comment input
    post.newComment = '';
    
    // Refresh posts to show new comment
    const fetchedPosts = await communityService.getAllPosts();
    posts.value = fetchedPosts;
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

// Delete comment
const deleteComment = async (postId, commentId) => {
  try {
    const userId = userStore.currentUser.uid;
    await communityService.deleteComment(postId, commentId, userId);
    
    // Refresh posts to update comments
    const fetchedPosts = await communityService.getAllPosts();
    posts.value = fetchedPosts;
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

// Date formatter
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  // Otherwise, return formatted date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
/* Add this to ensure icons display properly */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style> 