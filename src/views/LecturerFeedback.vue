<template>
  <div class="lecturer-feedback">
    <!-- Upcoming Milestone Section -->
    <div class="bg-white p-5 rounded-lg shadow-md w-1/2">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Current Milestone</h2>
        <!-- Major Selection Tabs -->
        <div class="flex space-x-2">
          <button
            v-for="major in userStore.currentUser?.major || []"
            :key="major"
            @click="selectedMajor = major"
            class="px-3 py-1 text-xs rounded-full transition-colors"
            :class="selectedMajor === major ? 
              'bg-blue-100 text-blue-800 font-medium' : 
              'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ major }}
          </button>
        </div>
      </div>
      
      <div v-if="currentMilestoneData" class="relative">
        <!-- Decorative element -->
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
        
        <div class="pl-4">
          <h3 class="text-lg font-semibold text-green-800 mb-1">
            {{ currentMilestoneData.upcomingMilestone.description }}
          </h3>
          <div class="flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDate(currentMilestoneData.upcomingMilestone.deadline) }}</span>
          </div>
          
          <!-- Days remaining indicator -->
          <div class="mt-3 flex items-center">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full" 
                :style="`width: ${getDaysRemainingPercentage(currentMilestoneData.upcomingMilestone)}%`"
              ></div>
            </div>
            <span class="ml-2 text-xs font-medium" 
              :class="getDaysRemainingClass(currentMilestoneData.upcomingMilestone)">
              {{ getDaysRemainingText(currentMilestoneData.upcomingMilestone) }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-4">
        <p class="text-gray-500">No upcoming milestones found for selected major.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
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
    const selectedMajor = ref(null)
    const milestoneDataMap = ref({})

    // Computed property for current milestone data
    const currentMilestoneData = computed(() => {
      if (!selectedMajor.value) return null;
      return milestoneDataMap.value[selectedMajor.value] || null;
    })

    // Function to load milestone data for a specific major
    const loadMilestoneData = (majorId) => {
      if (!userStore.currentUser?.uid) return;
      const data = getMilestoneData(userStore.currentUser.uid, majorId)
      if (data) {
        milestoneDataMap.value[majorId] = data
      }
    }

    onMounted(() => {
      if (userStore.currentUser?.major) {
        const majors = userStore.currentUser.major
        // Set initial selected major
        if (majors.length > 0) {
          selectedMajor.value = majors[0]
        }
        // Load data for all majors
        majors.forEach(majorId => {
          loadMilestoneData(majorId)
        })
      }
    })
    
    return {
      userStore,
      selectedMajor,
      currentMilestoneData,
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
  display: flex;
  justify-content: center;
}
</style> 