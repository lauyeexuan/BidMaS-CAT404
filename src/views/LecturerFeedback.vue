<template>
  <div class="lecturer-feedback">
    <!-- Left Side Content (Main Content) -->
    <div class="w-2/3 mr-6">
      <!-- Submissions Section -->
      <div class="bg-white p-5 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">
          Submissions
          <span v-if="selectedMajor || selectedMilestoneFilter" class="text-lg font-normal text-gray-600">
            {{ getFilterDescription }}
          </span>
        </h2>
        <!-- Submission content will go here -->
        <p class="text-gray-500">Submission content coming soon...</p>
      </div>
    </div>

    <!-- Right Side (Milestone and Filters) -->
    <div class="w-1/3">
      <!-- Current Milestone Display -->
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-sm font-medium text-gray-500">Current Milestone</h2>
          <!-- Major Selection Tabs -->
          <div class="flex space-x-2">
            <button
              v-for="major in userStore.currentUser?.major || []"
              :key="major"
              @click="currentDisplayMajor = major"
              class="px-2 py-1 text-xs rounded-full transition-colors"
              :class="currentDisplayMajor === major ? 
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
            <div class="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(currentMilestoneData.upcomingMilestone.deadline) }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-2">
          <p class="text-gray-500 text-sm">No milestone data available</p>
        </div>
      </div>

      <!-- Submission Filters (Expandable) -->
      <div class="bg-white rounded-lg shadow-md">
        <div 
          class="p-4 flex justify-between items-center cursor-pointer"
          @click="toggleFilters"
        >
          <h2 class="text-lg font-semibold flex items-center">
            Filters
            <span v-if="selectedMajor || selectedMilestoneFilter" 
                  class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {{ (selectedMajor ? 1 : 0) + (selectedMilestoneFilter ? 1 : 0) }}
            </span>
          </h2>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 transition-transform duration-300" 
            :class="{'rotate-180': showFilters}"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Expandable Filter Content -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="max-h-0 opacity-0 overflow-hidden"
          enter-to-class="max-h-[400px] opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-[400px] opacity-100"
          leave-to-class="max-h-0 opacity-0 overflow-hidden"
        >
          <div v-if="showFilters" class="px-4 pb-4 border-t border-gray-200">
            <!-- Major Filter -->
            <div class="mt-4 mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Major</label>
              <div class="flex flex-col space-y-2">
                <button
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="!selectedMajor ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="handleMajorSelect(null)"
                >
                  All Majors
                </button>
                <button
                  v-for="major in userStore.currentUser?.major || []"
                  :key="major"
                  @click="handleMajorSelect(major)"
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="selectedMajor === major ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ major }}
                </button>
              </div>
            </div>

            <!-- Milestone Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Milestone</label>
              <div class="flex flex-col space-y-2">
                <button
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="!selectedMilestoneFilter ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="selectedMilestoneFilter = null"
                >
                  All Milestones
                </button>
                <button
                  v-for="milestone in availableMilestones"
                  :key="milestone.description"
                  @click="selectedMilestoneFilter = milestone"
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="selectedMilestoneFilter?.description === milestone.description ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ milestone.description }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { getMilestoneData } from '@/utils/milestones'
import { useUserStore } from '@/stores/userStore'
import { formatDate } from '@/utils/milestoneHelpers'

export default {
  name: 'LecturerFeedback',
  setup() {
    const userStore = useUserStore()
    const selectedMajor = ref(null)
    const selectedMilestoneFilter = ref(null)
    const milestoneDataMap = ref({})
    const showFilters = ref(false)
    const currentDisplayMajor = ref(null)

    // Computed property for current milestone data
    const currentMilestoneData = computed(() => {
      if (!currentDisplayMajor.value) return null;
      return milestoneDataMap.value[currentDisplayMajor.value] || null;
    })

    // Computed property for available milestones in the selected major
    const availableMilestones = computed(() => {
      if (!selectedMajor.value || !milestoneDataMap.value[selectedMajor.value]) return [];
      return milestoneDataMap.value[selectedMajor.value].allMilestones || [];
    })

    // Computed property for filter description
    const getFilterDescription = computed(() => {
      const parts = [];
      if (selectedMajor.value) parts.push(`for ${selectedMajor.value}`);
      if (selectedMilestoneFilter.value) parts.push(`- ${selectedMilestoneFilter.value.description}`);
      return parts.length ? parts.join(' ') : '';
    })

    // Modified function to handle major selection
    const handleMajorSelect = (major) => {
      selectedMajor.value = major;
      // Always clear milestone filter when major changes or is cleared
      selectedMilestoneFilter.value = null;
    }

    // Function to toggle filters visibility
    const toggleFilters = () => {
      showFilters.value = !showFilters.value;
    }

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
        // Set initial major for milestone display
        if (majors.length > 0) {
          currentDisplayMajor.value = majors[0]
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
      selectedMilestoneFilter,
      currentMilestoneData,
      showFilters,
      availableMilestones,
      getFilterDescription,
      handleMajorSelect,
      toggleFilters,
      formatDate,
      currentDisplayMajor
    }
  }
}
</script>

<style scoped>
.lecturer-feedback {
  padding: 20px;
  display: flex;
}
</style> 