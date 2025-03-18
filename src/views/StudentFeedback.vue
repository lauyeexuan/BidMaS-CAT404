<template>
  <div class="student-feedback">
    <h1 class="text-2xl font-bold mb-6">Student Feedback</h1>
    
    <!-- Upcoming Milestone Section -->
    <div v-if="milestoneData && milestoneData.upcomingMilestone" class="bg-white p-5 rounded-lg shadow-md mb-6">
      <h2 class="text-lg font-semibold mb-4">Current Milestone</h2>
      
      <div class="relative">
        <!-- Decorative element -->
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
        
        <div class="pl-4">
          <h3 class="text-lg font-semibold text-blue-800 mb-1">{{ milestoneData.upcomingMilestone.description }}</h3>
          <div class="flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Due: {{ formatDate(milestoneData.upcomingMilestone.deadline) }}</span>
          </div>
          
          <!-- Days remaining indicator -->
          <div class="mt-3 flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full" 
                :style="`width: ${getDaysRemainingPercentage(milestoneData.upcomingMilestone)}%`"
              ></div>
            </div>
            <span class="ml-2 text-xs font-medium" :class="getDaysRemainingClass(milestoneData.upcomingMilestone)">
              {{ getDaysRemainingText(milestoneData.upcomingMilestone) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="bg-white p-5 rounded-lg shadow-md mb-6 text-center">
      <p class="text-gray-500">No upcoming milestones found.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getMilestoneData } from '@/utils/milestones'
import { 
  formatDate,
  getDaysRemaining,
  getDaysRemainingText,
  getDaysRemainingClass,
  getDaysRemainingPercentage
} from '@/utils/milestoneHelpers'

export default {
  name: 'StudentFeedback',
  setup() {
    const userStore = useUserStore()
    const milestoneData = ref(null)
    
    onMounted(() => {
      if (userStore.currentUser) {
        const data = getMilestoneData(userStore.currentUser.uid)
        if (data) {
          milestoneData.value = data
        }
      }
    })

    return {
      milestoneData,
      formatDate,
      getDaysRemaining,
      getDaysRemainingText,
      getDaysRemainingClass,
      getDaysRemainingPercentage
    }
  }
}
</script>

<style scoped>
.student-feedback {
  padding: 20px;
}
</style> 