<template>
  <div class="lecturer-feedback">
    <h1 class="text-2xl font-bold mb-6">Lecturer Feedback</h1>
    
    <!-- Upcoming Milestone Section -->
    <div v-if="allMajorMilestones.length > 0" class="space-y-6">
      <div v-for="(majorData, index) in allMajorMilestones" :key="index" class="bg-white p-5 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Current Milestone - {{ majorData.majorId }}</h2>
        
        <div class="relative">
          <!-- Decorative element -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
          
          <div class="pl-4">
            <h3 class="text-lg font-semibold text-green-800 mb-1">
              {{ majorData.milestone.upcomingMilestone.description }}
            </h3>
            <div class="flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(majorData.milestone.upcomingMilestone.deadline) }}</span>
            </div>
            
            <!-- Days remaining indicator -->
            <div class="mt-3 flex items-center">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full" 
                  :style="`width: ${getDaysRemainingPercentage(majorData.milestone.upcomingMilestone)}%`"
                ></div>
              </div>
              <span class="ml-2 text-xs font-medium" 
                :class="getDaysRemainingClass(majorData.milestone.upcomingMilestone)">
                {{ getDaysRemainingText(majorData.milestone.upcomingMilestone) }}
              </span>
            </div>
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
import { getMilestoneData } from '@/utils/milestones'
import { useUserStore } from '@/stores/userStore'
import { 
  formatDate,
  getDaysRemaining,
  getDaysRemainingText,
  getDaysRemainingClass,
  getDaysRemainingPercentage
} from '@/utils/milestoneHelpers'

export default {
  name: 'LecturerFeedback',
  setup() {
    const userStore = useUserStore()
    const allMajorMilestones = ref([])

    onMounted(() => {
      if (userStore.currentUser?.major) {
        // Get milestone data for each major
        const majors = userStore.currentUser.major // Array of major IDs for lecturer
        const milestonesData = majors.map(majorId => {
          const data = getMilestoneData(userStore.currentUser.uid, majorId)
          return {
            majorId,
            milestone: data
          }
        }).filter(data => data.milestone !== null) // Filter out any null data
        
        allMajorMilestones.value = milestonesData
      }
    })
    
    return {
      allMajorMilestones,
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
.lecturer-feedback {
  padding: 20px;
}
</style> 