<template>
  <!-- Dashboard Content -->
  <div class="relative">
    <!-- Dashboard Cards -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <!-- Milestone Card with Expandable Content -->
      <div 
        class="col-span-6 bg-white p-4 shadow rounded relative transition-all duration-200 overflow-hidden"
        :class="{'shadow-lg': showAllMilestones}"
      >
        <!-- Card Header -->
        <div @click="toggleAllMilestones" class="cursor-pointer">
          <h2 class="text-sm font-medium text-gray-500 flex items-center mb-2">
            Current Milestone
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 ml-2 transition-transform duration-300" 
              :class="{'rotate-180': showAllMilestones}"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </h2>
        
          <div v-if="loading" class="py-2">
            <div class="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
          <div v-else-if="error" class="py-2">
            <p class="text-red-500">{{ error }}</p>
          </div>
          <div v-else-if="upcomingMilestone" class="cursor-pointer">
            <!-- Milestone content with enhanced styling -->
            <div class="relative">
              <!-- Decorative element -->
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
              
              <div class="pl-4">
                <h3 class="text-lg font-semibold text-blue-800 mb-1">{{ upcomingMilestone.description }}</h3>
                <div class="flex items-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatDate(upcomingMilestone.deadline) }}</span>
                </div>
                
                <!-- Days remaining indicator -->
                <div class="mt-3 flex items-center">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="`width: ${getDaysRemainingPercentage(upcomingMilestone)}%`"
                    ></div>
                  </div>
                  <span class="ml-2 text-xs font-medium" :class="getDaysRemainingClass(upcomingMilestone)">
                    {{ getDaysRemainingText(upcomingMilestone) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-2">
            <p class="text-gray-500">No upcoming milestones found.</p>
          </div>
        </div>
        
        <!-- Expandable Milestone List -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="max-h-0 opacity-0 overflow-hidden"
          enter-to-class="max-h-[1000px] opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-[1000px] opacity-100"
          leave-to-class="max-h-0 opacity-0 overflow-hidden"
        >
          <div v-if="showAllMilestones && allMilestones && allMilestones.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-medium text-gray-800">All Milestones</h3>
              <button 
                @click="toggleAllMilestones" 
                class="text-gray-400 hover:text-gray-600"
                aria-label="Close milestones panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="milestone-list-container">
              <transition-group 
                name="milestone-list" 
                tag="div"
                class="space-y-3"
              >
                <div 
                  v-for="(milestone, index) in otherMilestones" 
                  :key="index"
                  class="p-3 rounded-md transition-all duration-200 relative overflow-hidden"
                  :class="isMilestonePast(milestone) ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'"
                >
                  <!-- Decorative element -->
                  <div 
                    class="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                    :class="isMilestonePast(milestone) ? 'bg-gray-400' : 'bg-blue-500'"
                  ></div>
                  
                  <div class="flex justify-between items-start pl-3">
                    <div>
                      <p class="font-medium" :class="isMilestonePast(milestone) ? 'text-gray-600' : 'text-blue-700'">
                        {{ milestone.description }}
                      </p>
                      <p class="text-sm flex items-center mt-1" :class="isMilestonePast(milestone) ? 'text-gray-500' : 'text-blue-600'">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDate(milestone.deadline) }}
                      </p>
                    </div>
                    <div 
                      class="text-xs px-2 py-1 rounded-full"
                      :class="isMilestonePast(milestone) ? 'bg-gray-200 text-gray-700' : 'bg-blue-200 text-blue-800'"
                    >
                      {{ isMilestonePast(milestone) ? 'Past' : 'Upcoming' }}
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>
        </transition>
      </div>
      
      <div class="col-span-6 bg-blue-600 text-white p-4 shadow rounded text-center">
        <h2 class="text-lg font-semibold">Manage project in few clicks</h2>
        <button class="mt-2 px-4 py-2 bg-white text-blue-600 rounded">Go Now</button>
      </div>
    </div>

    <!-- Submission Rate -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <div class="col-span-6 bg-white p-4 shadow rounded">
        <h2 class="text-lg font-semibold">Submission Rate</h2>
        <p>Software Design Report</p>
        <div class="w-32 h-32 mx-auto mt-4">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <path class="text-gray-200" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="currentColor" stroke-width="4" />
            <path class="text-blue-600" d="M18 2a16 16 0 0 1 13 8" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80, 100" />
          </svg>
          <p class="text-center text-xl font-bold mt-2">84%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getMilestones } from '@/utils/milestones'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { db } from '@/firebase'
import { collection, getDocs, query, limit } from 'firebase/firestore'

export default {
  setup() {
    const userStore = useUserStore()
    const upcomingMilestone = ref(null)
    const allMilestones = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showAllMilestones = ref(false)

    // Computed property to filter out the upcoming milestone
    const otherMilestones = computed(() => {
      if (!allMilestones.value || !upcomingMilestone.value) return []
      
      return allMilestones.value.filter(milestone => 
        milestone.description !== upcomingMilestone.value.description
      )
    })

    // Function to toggle showing all milestones
    const toggleAllMilestones = (event) => {
      // Prevent event bubbling
      if (event) {
        event.stopPropagation()
      }
      showAllMilestones.value = !showAllMilestones.value
      
      // Log for debugging
      console.log('Toggled milestone dropdown:', showAllMilestones.value)
      console.log('Number of milestones:', allMilestones.value.length)
      console.log('Number of other milestones:', otherMilestones.value.length)
      if (allMilestones.value.length > 0) {
        console.log('First milestone:', allMilestones.value[0].description)
      }
    }

    // Function to check if a milestone is in the past
    const isMilestonePast = (milestone) => {
      if (!milestone || !milestone.deadline) return false
      
      const deadlineDate = milestone.deadline instanceof Date ? 
        milestone.deadline : 
        milestone.deadline.toDate()
      
      return new Date() > deadlineDate
    }
    
    // Function to calculate days remaining until deadline
    const getDaysRemaining = (milestone) => {
      if (!milestone || !milestone.deadline) return 0
      
      const deadlineDate = milestone.deadline instanceof Date ? 
        milestone.deadline : 
        milestone.deadline.toDate()
      
      const now = new Date()
      
      // If deadline has passed, return 0
      if (now > deadlineDate) return 0
      
      // Calculate days remaining
      const diffTime = Math.abs(deadlineDate - now)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    }
    
    // Function to get percentage for progress bar
    const getDaysRemainingPercentage = (milestone) => {
      const daysRemaining = getDaysRemaining(milestone)
      
      // If less than 30 days remaining, show percentage based on days left
      // 30 days = 100%, 0 days = 0%
      if (daysRemaining <= 30) {
        return (daysRemaining / 30) * 100
      }
      
      return 100 // If more than 30 days, show full bar
    }
    
    // Function to get text for days remaining
    const getDaysRemainingText = (milestone) => {
      const days = getDaysRemaining(milestone)
      
      if (days === 0) {
        return 'Due today'
      } else if (days === 1) {
        return '1 day left'
      } else {
        return `${days} days left`
      }
    }
    
    // Function to get class for days remaining text
    const getDaysRemainingClass = (milestone) => {
      const days = getDaysRemaining(milestone)
      
      if (days < 3) {
        return 'text-red-600'
      } else if (days < 7) {
        return 'text-orange-500'
      } else {
        return 'text-green-600'
      }
    }

    // Function to get the majorDocId for a specific major
    const getMajorDocId = async (schoolId, yearId, majorId) => {
      try {
        console.log(`Getting majorDocId for school: ${schoolId}, year: ${yearId}, major: ${majorId}`)
        const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', yearId, majorId)
        const majorDocsQuery = query(majorCollectionRef, limit(1))
        const majorDocsSnapshot = await getDocs(majorDocsQuery)
        
        if (majorDocsSnapshot.empty) {
          console.error('No major documents found')
          return null
        }
        
        // Get the first (and likely only) document ID
        const majorDocId = majorDocsSnapshot.docs[0].id
        console.log(`Found majorDocId: ${majorDocId}`)
        return majorDocId
      } catch (err) {
        console.error('Error getting majorDocId:', err)
        throw err
      }
    }

    // Function to fetch the upcoming milestone
    const fetchUpcomingMilestone = async () => {
      loading.value = true
      error.value = null

      try {
        console.log('Starting milestone fetch process')
        
        // Check if user is authenticated and has necessary data
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          console.error('User not authenticated or user data missing', {
            isAuthenticated: userStore.isAuthenticated,
            currentUser: userStore.currentUser
          })
          error.value = 'User not authenticated'
          return
        }

        // Get user data
        const { school, major } = userStore.currentUser
        console.log('User data retrieved:', { school, major })
        
        if (!school || !major) {
          console.error('Missing required user data', { school, major })
          error.value = 'Missing school or major information'
          return
        }
        
        // Get latest academic year using the utility function
        const academicYearData = await getLatestAcademicYear(school)
        console.log('Academic year data:', academicYearData)
        
        if (!academicYearData || !academicYearData.yearId) {
          console.error('Failed to get latest academic year')
          error.value = 'Failed to determine academic year'
          return
        }
        
        const yearId = academicYearData.yearId
        console.log('Using academic year ID:', yearId)
        
        // Get the majorDocId by querying the collection
        const majorDocId = await getMajorDocId(school, yearId, major)
        
        if (!majorDocId) {
          console.error('Could not find majorDocId')
          error.value = 'Major information not found'
          return
        }
        
        console.log('Using majorDocId:', majorDocId)
        
        // Fetch milestones for the user's major
        console.log('Fetching milestones with params:', { school, yearId, major, majorDocId })
        const milestones = await getMilestones(school, yearId, major, majorDocId)
        console.log('Milestones fetched:', milestones)
        
        if (milestones && milestones.length > 0) {
          console.log(`Found ${milestones.length} milestones`)
          
          // Store all milestones
          allMilestones.value = [...milestones]
          
          // Sort milestones by deadline
          const sortedMilestones = [...milestones].sort((a, b) => {
            const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate()
            const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate()
            return dateA - dateB
          })
          console.log('Sorted milestones:', sortedMilestones)
          
          // Find the first upcoming milestone (deadline is in the future)
          const now = new Date()
          upcomingMilestone.value = sortedMilestones.find(milestone => {
            const deadlineDate = milestone.deadline instanceof Date ? 
              milestone.deadline : 
              milestone.deadline.toDate()
            return deadlineDate > now
          })
          
          console.log('Found upcoming milestone:', upcomingMilestone.value)
          
          // If no upcoming milestone, use the most recent one
          if (!upcomingMilestone.value && sortedMilestones.length > 0) {
            upcomingMilestone.value = sortedMilestones[sortedMilestones.length - 1]
            console.log('No upcoming milestone found, using most recent:', upcomingMilestone.value)
          }
        } else {
          console.log('No milestones found or empty array returned')
        }
      } catch (err) {
        console.error('Error fetching milestone:', err)
        console.error('Error details:', { 
          message: err.message, 
          stack: err.stack,
          name: err.name
        })
        error.value = `Failed to load milestone data: ${err.message}`
      } finally {
        loading.value = false
        console.log('Milestone fetch process completed')
      }
    }

    // Format date for display
    const formatDate = (date) => {
      if (!date) return ''
      
      try {
        // Convert from timestamp if needed
        const dateObj = date instanceof Date ? date : date.toDate()
        
        return dateObj.toLocaleString('en-US', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })
      } catch (err) {
        console.error('Error formatting date:', err, { date })
        return 'Invalid date'
      }
    }

    // Watch for changes to showAllMilestones for debugging
    watch(showAllMilestones, (newValue) => {
      console.log('showAllMilestones changed to:', newValue)
    })

    // Fetch milestone when component is mounted
    onMounted(() => {
      console.log('Dashboard component mounted')
      console.log('User store initialized:', userStore.initialized)
      
      if (userStore.initialized) {
        console.log('User store already initialized, fetching milestones')
        fetchUpcomingMilestone()
      } else {
        console.log('Waiting for user store to initialize')
        // Wait for user store to initialize
        userStore.initializeAuth().then(() => {
          console.log('User store initialized, now fetching milestones')
          fetchUpcomingMilestone()
        }).catch(err => {
          console.error('Error initializing user store:', err)
          error.value = 'Failed to initialize user data'
          loading.value = false
        })
      }
    })

    return {
      upcomingMilestone,
      allMilestones,
      otherMilestones,
      loading,
      error,
      formatDate,
      showAllMilestones,
      toggleAllMilestones,
      isMilestonePast,
      getDaysRemaining,
      getDaysRemainingPercentage,
      getDaysRemainingText,
      getDaysRemainingClass
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Milestone list transition */
.milestone-list-enter-active,
.milestone-list-leave-active {
  transition: all 0.3s;
}
.milestone-list-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}
.milestone-list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

/* Staggered list effect */
.milestone-list-move {
  transition: transform 0.5s;
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Max height animation for smooth height transitions */
.milestone-list-container {
  overflow-y: auto;
  max-height: 300px;
}
</style>
  