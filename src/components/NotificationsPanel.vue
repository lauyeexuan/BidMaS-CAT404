<template>
  <Transition 
    name="slide" 
    @after-leave="$emit('animation-complete')"
  >
    <div 
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col rounded-l-2xl overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-gray-50">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <h2 class="text-lg font-semibold">Notifications</h2>
        </div>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full p-1 hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Notification List -->
      <div class="flex-grow overflow-y-auto p-2 custom-scrollbar">
        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center items-center h-20">
          <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <!-- No notifications message -->
        <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center text-gray-500 p-6 h-32">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
          </svg>
          <p>No notifications to display</p>
        </div>
        
        <!-- Notifications -->
        <TransitionGroup 
          name="list" 
          tag="div" 
          v-else
        >
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="mb-3 p-3 bg-white rounded-xl border shadow-sm transform transition-all duration-200 hover:shadow"
            :class="{ 
              'border-blue-300 bg-blue-100 shadow-md': !isRead(notification), 
              'border-gray-200': isRead(notification),
              'opacity-60': isRead(notification)
            }"
          >
            <!-- Notification content -->
            <div class="flex justify-between items-start">
              <!-- Type icon -->
              <div class="mr-3 mt-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="{
                    'bg-green-300': notification.changeType.includes('added'),
                    'bg-red-200': notification.changeType.includes('removed'),
                    'bg-blue-200': notification.changeType.includes('modified'),
                    'bg-gray-100': !notification.changeType
                  }">
                  <!-- Added icon -->
                  <svg v-if="notification.changeType.includes('added')" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  
                  <!-- Removed icon -->
                  <svg v-else-if="notification.changeType.includes('removed')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  
                  <!-- Modified icon -->
                  <svg v-else-if="notification.changeType.includes('modified')" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  
                  <!-- Reviewed icon -->
                  <svg v-else-if="notification.changeType.includes('reviewed')" xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>

                  <!-- Default icon -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-grow">
                <!-- Title based on change type -->
                <div class="font-medium" :class="{ 'text-blue-800 font-semibold': !isRead(notification) }">
                  {{ getNotificationTitle(notification) }}
                </div>
                
                <!-- Details -->
                <div class="text-sm mt-1 text-gray-600 whitespace-pre-line">
                  {{ notification.details }}
                </div>
                
                <!-- Timestamp -->
                <div class="text-xs text-gray-500 mt-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatTimestamp(notification.createdAt) }}
                </div>
              </div>
              
              <!-- Mark as read button -->
              <div v-if="!isRead(notification)" class="ml-2">
                <button 
                  @click="markAsRead(notification)" 
                  class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none p-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Mark read
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
      
      <!-- Footer -->
      <div class="p-3 border-t border-gray-200 bg-gray-50">
        <button
          v-if="notifications.length > 0 && hasUnread"
          @click="markAllAsRead"
          class="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Mark all as read
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { db } from '@/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  schoolId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'animation-complete']);

const userStore = useUserStore();
const notifications = ref([]);
const loading = ref(true);
let unsubscribe = null;

// Check if notification is read by current user
const isRead = (notification) => {
  return notification.readBy && notification.readBy[userStore.currentUser?.uid];
};

// Computed property to check if there are unread notifications
const hasUnread = computed(() => {
  return notifications.value.some(notification => !isRead(notification));
});

// Format the timestamp for display
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp.seconds * 1000);
    
    // If today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown date';
  }
};

// Get user-friendly title based on notification type
const getNotificationTitle = (notification) => {
  switch (notification.changeType) {
    case 'milestone_added':
      return 'New Milestones Added';
    case 'milestone_removed':
      return 'Milestones Removed';
    case 'milestone_modified':
      return 'Milestone Deadlines Updated';
    case 'header_added':
      return 'Project Headers Updated';
    case 'submission_reviewed':
      return 'Submission Reviewed';
    default:
      return 'Project Settings Changed';
  }
};

// Mark a single notification as read
const markAsRead = async (notification) => {
  try {
    const notificationRef = doc(db, 'schools', props.schoolId, 'notifications', notification.id);
    const userId = userStore.currentUser.uid;
    
    // Using dot notation to update specific field in map
    await updateDoc(notificationRef, {
      [`readBy.${userId}`]: true
    });
    
    // Update local state
    notification.readBy = { ...notification.readBy, [userId]: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const userId = userStore.currentUser.uid;
    const unreadNotifications = notifications.value.filter(n => !isRead(n));
    
    // Update all unread notifications
    await Promise.all(unreadNotifications.map(notification => {
      const notificationRef = doc(db, 'schools', props.schoolId, 'notifications', notification.id);
      return updateDoc(notificationRef, {
        [`readBy.${userId}`]: true
      });
    }));
    
    // Update local state
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      readBy: { ...notification.readBy, [userId]: true }
    }));
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Set up Firestore listener
onMounted(() => {
  if (!userStore.currentUser?.uid || !props.schoolId) return;
  
  const userId = userStore.currentUser.uid;
  const notificationsRef = collection(db, 'schools', props.schoolId, 'notifications');
  
  // Query for notifications that affect this user
  const q = query(
    notificationsRef,
    where('affectedUsers', 'array-contains', userId)
  );
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    const newNotifications = [];
    
    snapshot.forEach(doc => {
      newNotifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by creation time, newest first
    notifications.value = newNotifications.sort((a, b) => {
      return b.createdAt.seconds - a.createdAt.seconds;
    });
    
    loading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
/* Transition for the slide-in panel */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Transitions for the list items */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) rgba(229, 231, 235, 0.5);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style> 