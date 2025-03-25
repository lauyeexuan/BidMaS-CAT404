<template>
  <div class="relative" @click="togglePanel">
    <div class="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors relative">
      <svg xmlns="http://www.w3.org/2000/svg" 
        :class="unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'" 
        class="h-6 w-6" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      <Transition name="bounce">
        <span 
          v-if="unreadCount > 0" 
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm"
          :class="{'w-6 h-6': unreadCount > 9, 'w-5 h-5': unreadCount <= 9}"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { db } from '@/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  schoolId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['toggle-panel']);

const userStore = useUserStore();
const unreadCount = ref(0);
const previousCount = ref(0);
let unsubscribe = null;

// Toggle notification panel
const togglePanel = () => {
  emit('toggle-panel');
};

// Watch for count changes to animate the badge
watch(unreadCount, (newCount, oldCount) => {
  previousCount.value = oldCount;
});

// Listen for notifications and count unread ones
onMounted(() => {
  if (!userStore.currentUser?.uid) return;
  
  const userId = userStore.currentUser.uid;
  const notificationsRef = collection(db, 'schools', props.schoolId, 'notifications');
  
  // Query for notifications that affect this user
  const q = query(
    notificationsRef,
    where('affectedUsers', 'array-contains', userId)
  );
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    let count = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const readBy = data.readBy || {};
      
      // If this notification hasn't been read by the current user, count it
      if (!readBy[userId]) {
        count++;
      }
    });
    
    unreadCount.value = count;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
/* Animation for notification count badge */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Pulse animation when new notifications arrive */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style> 