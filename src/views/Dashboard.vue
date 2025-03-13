<template>
  <!-- Dashboard Content -->
  <div class="relative">
    <!-- Dashboard Cards -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <!-- Milestone Card with Expandable Content -->
      <div 
        class="col-span-6 bg-white p-4 shadow rounded relative transition-all duration-200 overflow-hidden flex flex-col"
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
          enter-to-class="max-h-[300px] opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-[300px] opacity-100"
          leave-to-class="max-h-0 opacity-0 overflow-hidden"
        >
          <div v-if="showAllMilestones && allMilestones && allMilestones.length > 0" class="mt-4 pt-4 border-t border-gray-200 overflow-auto flex-grow">
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
      
      <!-- Assigned Project Card -->
      <div class="col-span-6 bg-white p-4 shadow rounded self-start">
        <h2 class="text-sm font-medium text-gray-500 mb-2">Your Assigned Project</h2>
        
        <div v-if="projectLoading" class="py-4">
          <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
        
        <div v-else-if="projectError" class="py-4">
          <p class="text-red-500">{{ projectError }}</p>
        </div>
        
        <div v-else-if="assignedProject" class="py-2">
          <div class="relative">
            <!-- Decorative element -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
            
            <div class="pl-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ assignedProject.Title }}</h3>
              
              <div class="flex items-center text-gray-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Supervisor: {{ assignedProject.lecturerName || 'Unknown' }}</span>
              </div>
              
              <div class="mt-2">
                <button 
                  @click="openProjectDetailsWindow"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Project Details
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="py-4 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500">No project assigned yet.</p>
          <p class="text-sm text-gray-400 mt-1">Projects will be assigned after the bidding process.</p>
        </div>
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
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getMilestones } from '@/utils/milestones'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { db } from '@/firebase'
import { collection, getDocs, query, limit, where, doc, getDoc } from 'firebase/firestore'
import { createProjectDetailsWindow } from '@/utils/windowUtils'
import '@/assets/styles/dashboard.css'

export default {
  setup() {
    const userStore = useUserStore()
    const upcomingMilestone = ref(null)
    const allMilestones = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showAllMilestones = ref(false)
    
    // Assigned project data
    const assignedProject = ref(null)
    const projectLoading = ref(true)
    const projectError = ref(null)

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
        const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', yearId, majorId)
        const majorDocsQuery = query(majorCollectionRef, limit(1))
        const majorDocsSnapshot = await getDocs(majorDocsQuery)
        
        if (majorDocsSnapshot.empty) {
          return null
        }
        
        // Get the first (and likely only) document ID
        return majorDocsSnapshot.docs[0].id
      } catch (err) {
        throw err
      }
    }

    // Function to fetch the upcoming milestone
    const fetchUpcomingMilestone = async () => {
      loading.value = true
      error.value = null

      try {
        // Check if user is authenticated and has necessary data
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          error.value = 'User not authenticated'
          return
        }

        // Get user data
        const { school, major } = userStore.currentUser
        
        if (!school || !major) {
          error.value = 'Missing school or major information'
          return
        }
        
        // Get latest academic year using the utility function
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData || !academicYearData.yearId) {
          error.value = 'Failed to determine academic year'
          return
        }
        
        const yearId = academicYearData.yearId
        
        // Get the majorDocId by querying the collection
        const majorDocId = await getMajorDocId(school, yearId, major)
        
        if (!majorDocId) {
          error.value = 'Major information not found'
          return
        }
        
        // Fetch milestones for the user's major
        const milestones = await getMilestones(school, yearId, major, majorDocId)
        
        if (milestones && milestones.length > 0) {
          // Store all milestones
          allMilestones.value = [...milestones]
          
          // Sort milestones by deadline
          const sortedMilestones = [...milestones].sort((a, b) => {
            const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate()
            const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate()
            return dateA - dateB
          })
          
          // Find the first upcoming milestone (deadline is in the future)
          const now = new Date()
          upcomingMilestone.value = sortedMilestones.find(milestone => {
            const deadlineDate = milestone.deadline instanceof Date ? 
              milestone.deadline : 
              milestone.deadline.toDate()
            return deadlineDate > now
          })
          
          // If no upcoming milestone, use the most recent one
          if (!upcomingMilestone.value && sortedMilestones.length > 0) {
            upcomingMilestone.value = sortedMilestones[sortedMilestones.length - 1]
          }
        }
      } catch (err) {
        error.value = `Failed to load milestone data: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    // Function to fetch the student's assigned project
    const fetchAssignedProject = async () => {
      projectLoading.value = true
      projectError.value = null

      try {
        // Check if user is authenticated and has necessary data
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          projectError.value = 'User not authenticated'
          return
        }

        const { school, uid: studentId } = userStore.currentUser
        
        if (!school || !studentId) {
          projectError.value = 'Missing user information'
          return
        }
        
        // Get latest academic year
        const academicYearData = await getLatestAcademicYear(school)
        if (!academicYearData || !academicYearData.yearId) {
          projectError.value = 'Failed to determine academic year'
          return
        }
        
        const yearId = academicYearData.yearId
        
        // Query the student's bids to find an accepted bid
        const studentBidsRef = collection(db, 'schools', school, 'studentBids', studentId, 'bids')
        const acceptedBidQuery = query(studentBidsRef, where('status', '==', 'accepted'))
        const acceptedBidSnapshot = await getDocs(acceptedBidQuery)
        
        if (acceptedBidSnapshot.empty) {
          // No accepted bids found
          return
        }
        
        // Get the first accepted bid
        const acceptedBid = acceptedBidSnapshot.docs[0].data()
        const { projectId, majorId, majorDocId } = acceptedBid
        
        if (!projectId || !majorId || !majorDocId) {
          projectError.value = 'Invalid bid data'
          return
        }
        
        // Get the project document
        const projectRef = doc(
          db, 
          'schools', 
          school, 
          'projects', 
          yearId, 
          majorId, 
          majorDocId, 
          'projectsPerYear', 
          projectId
        )
        
        const projectDoc = await getDoc(projectRef)
        
        if (!projectDoc.exists()) {
          projectError.value = 'Project not found'
          return
        }
        
        // Get project data
        const projectData = projectDoc.data()
        
        // If there's a lecturer ID, get their name
        if (projectData.userId) {
          try {
            const lecturerRef = doc(db, 'schools', school, 'users', projectData.userId)
            const lecturerDoc = await getDoc(lecturerRef)
            
            if (lecturerDoc.exists()) {
              projectData.lecturerName = lecturerDoc.data().name
            }
          } catch (err) {
            // If we can't get the lecturer name, just continue
          }
        }
        
        // Set the assigned project with additional metadata needed for the details window
        assignedProject.value = {
          ...projectData,
          id: projectId,
          majorDocId: majorDocId,
          major: majorId,
          year: yearId
        }
        
      } catch (err) {
        projectError.value = `Failed to load project data: ${err.message}`
      } finally {
        projectLoading.value = false
      }
    }

    // Function to open project details window
    const openProjectDetailsWindow = async () => {
      if (!assignedProject.value) return
      
      try {
        const { school } = userStore.currentUser
        
        // Get lecturer name
        let creatorName = assignedProject.value.lecturerName || 'Unknown'
        
        // Get project headers from the majorDocId document
        let headers = {}
        
        // Fetch the headers map from the majorDocId document
        if (school && assignedProject.value.year && assignedProject.value.major && assignedProject.value.majorDocId) {
          try {
            const majorDocRef = doc(
              db, 
              'schools', school, 
              'projects', assignedProject.value.year, 
              assignedProject.value.major, assignedProject.value.majorDocId
            )
            
            const majorDoc = await getDoc(majorDocRef)
            if (majorDoc.exists()) {
              const majorData = majorDoc.data()
              if (majorData.headers && typeof majorData.headers === 'object') {
                headers = majorData.headers
              }
            }
          } catch (error) {
            // If we can't get the headers, just continue
          }
        }
        
        // Create color class for major
        const colorClasses = { bg: 'bg-blue-100', text: 'text-blue-800' }
        
        // Open the project details window with the component
        createProjectDetailsWindow({
          project: assignedProject.value,
          creatorName,
          headers,
          majorColorClass: colorClasses
        })
      } catch (error) {
        alert('There was an error opening the project details. Please try again.')
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
        return 'Invalid date'
      }
    }

    // Fetch data when component is mounted
    onMounted(() => {
      if (userStore.initialized) {
        fetchUpcomingMilestone()
        fetchAssignedProject()
      } else {
        // Wait for user store to initialize
        userStore.initializeAuth().then(() => {
          fetchUpcomingMilestone()
          fetchAssignedProject()
        }).catch(err => {
          error.value = 'Failed to initialize user data'
          loading.value = false
          projectLoading.value = false
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
      getDaysRemainingClass,
      assignedProject,
      projectLoading,
      projectError,
      openProjectDetailsWindow
    }
  }
}
</script>

<style scoped>
/* Dashboard styles imported from assets/styles/dashboard.css */
</style>
  