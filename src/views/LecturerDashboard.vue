<template>
    <!-- Dashboard Content -->
    <div class="relative">
      <!-- Dashboard Cards -->
      <div class="mt-6 grid grid-cols-12 gap-4">
        <!-- Left Column -->
        <div class="col-span-6 flex flex-col gap-4">
          <!-- Milestone Card with Expandable Content -->
          <div 
            class="bg-white p-4 shadow rounded relative transition-all duration-200 overflow-hidden flex flex-col"
            :class="{'shadow-lg': showAllMilestones}"
          >
            <!-- Card Header -->
            <div>
              <!-- Remove the first Current Milestone and major selector -->
            </div>
            
            <div @click="toggleAllMilestones" class="cursor-pointer">
              <div class="flex justify-between items-center mb-2">
                <h2 class="text-sm font-medium text-gray-500 flex items-center">
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
                <!-- Major Selector Tabs -->
                <div class="flex space-x-2" @click.stop>
                  <button
                    v-for="major in lecturerMajors"
                    :key="major"
                    @click.stop="selectedMajor = major"
                    class="px-3 py-1 text-xs rounded-full transition-colors"
                    :class="selectedMajor === major ? 
                      'bg-blue-100 text-blue-800 font-medium' : 
                      'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    {{ major }}
                  </button>
                </div>
              </div>
            
              <div v-if="loading" class="animate-pulse">
                <!-- Milestone Card Skeleton -->
                <div class="relative pl-4">
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                  <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2"></div>
                    <div class="flex justify-between mt-1">
                      <div class="h-3 bg-gray-200 rounded w-20"></div>
                      <div class="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="error" class="py-2">
                <p class="text-red-500">{{ error }}</p>
              </div>
              <div v-else-if="currentUpcomingMilestone" class="cursor-pointer">
                <!-- Milestone content with enhanced styling -->
                <div class="relative">
                  <!-- Decorative element -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                  
                  <div class="pl-4">
                    <h3 class="text-lg font-semibold text-blue-800 mb-1">{{ currentUpcomingMilestone.description }}</h3>
                    <div class="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDate(currentUpcomingMilestone.deadline) }}</span>
                    </div>
                    
                    <!-- Days remaining indicator -->
                    <div class="mt-3 flex items-center">
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full" 
                          :style="`width: ${getDaysRemainingPercentage(currentUpcomingMilestone)}%`"
                        ></div>
                      </div>
                      <span class="ml-2 text-xs font-medium" :class="getDaysRemainingClass(currentUpcomingMilestone)">
                        {{ getDaysRemainingText(currentUpcomingMilestone) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="py-2">
                <p class="text-gray-500">No upcoming milestones found.</p>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div v-if="currentUpcomingMilestone" class="flex gap-2 mt-2">
              <button class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Template
                </span>
              </button>
              <button class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Guidelines
                </span>
              </button>
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
              <div v-if="showAllMilestones && filteredMilestones && filteredMilestones.length > 0" class="mt-4 pt-4 border-t border-gray-200 overflow-auto flex-grow">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="font-medium text-gray-800">All Milestones</h3>
                  <button 
                    @click="toggleAllMilestones" 
                    class="text-gray-400 hover:text-gray-600"
                    aria-label="Close milestones panel"
                  >
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
          
          <!-- Submission Info Card -->
          <div class="bg-white p-4 shadow rounded relative">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-sm font-medium text-gray-500">Milestone Submissions</h2>
            </div>
            
            <div v-if="submissionLoading" class="animate-pulse">
              <!-- Submission Stats Skeleton -->
              <div class="relative pl-4">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                <div class="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                <!-- Circular Progress Skeleton -->
                <div class="flex flex-col items-center justify-center py-3">
                  <div class="relative w-32 h-32">
                    <svg class="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#E2E8F0"
                        stroke-width="8"
                      />
                    </svg>
                  </div>
                  <div class="h-4 bg-gray-200 rounded w-32 mt-3"></div>
                </div>
              </div>
            </div>
            
            <div v-else-if="submissionError" class="py-3">
              <p class="text-red-500">{{ submissionError }}</p>
            </div>
            
            <div v-else-if="currentMilestoneSubmissionStats" class="py-1">
              <div class="relative">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></div>
                
                <div class="pl-4">
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    {{ currentMilestoneSubmissionStats.milestoneName }}
                  </h3>
                  
                  <!-- Circular Progress Display -->
                  <div class="flex flex-col items-center justify-center py-3">
                    <div class="relative w-32 h-32">
                      <!-- Background Circle -->
                      <svg class="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#E2E8F0"
                          stroke-width="8"
                        />
                        <!-- Progress Circle -->
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#7C3AED"
                          stroke-width="8"
                          stroke-linecap="round"
                          :stroke-dasharray="`${currentMilestoneSubmissionStats.submissionRate * 2.83} 283`"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <!-- Fraction Display -->
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-2xl font-bold text-gray-800">
                          {{ currentMilestoneSubmissionStats.projectsWithSubmissions }}/{{ currentMilestoneSubmissionStats.totalAssigned }}
                        </span>
                      </div>
                    </div>
                    <!-- Submission Status Text -->
                    <p class="mt-3 text-center text-gray-600">
                      {{ currentMilestoneSubmissionStats.projectsWithSubmissions }} out of {{ currentMilestoneSubmissionStats.totalAssigned }} 
                      {{ currentMilestoneSubmissionStats.totalAssigned === 1 ? 'student' : 'students' }}
                      {{ currentMilestoneSubmissionStats.projectsWithSubmissions < 2 ? 'has' : 'have' }} submitted their work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="py-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-gray-500">No submission data available.</p>
              <p class="text-sm text-gray-400 mt-1">
                {{ currentUpcomingMilestone ? 'No assigned projects for this milestone yet.' : 'No current milestone found.' }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Right Column -->
        <div class="col-span-6">
          <!-- Assigned Project Card -->
          <div class="bg-white p-4 shadow rounded relative">
            <div class="flex justify-between items-start">
              <h2 class="text-sm font-medium text-gray-500 mb-2">Your Projects Overview</h2>
            </div>
            
            <div v-if="projectLoading" class="animate-pulse">
              <!-- Project Stats Skeleton -->
              <div class="relative pl-4">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <!-- Stats Grid Skeleton -->
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                </div>
                <!-- Progress Bar Skeleton -->
                <div class="mt-2">
                  <div class="flex justify-between mb-1">
                    <div class="h-3 bg-gray-200 rounded w-24"></div>
                    <div class="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5"></div>
                </div>
              </div>
            </div>
            
            <div v-else-if="projectError" class="py-4">
              <p class="text-red-500">{{ projectError }}</p>
            </div>
            
            <div v-else-if="lecturerProjectStats.total > 0" class="py-2">
              <div class="relative">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
                
                <div class="pl-4">
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">Project Statistics</h3>
                  
                  <div class="grid grid-cols-3 gap-4 mb-4">
                    <!-- Total Projects -->
                    <div class="bg-blue-50 p-3 rounded-lg text-center">
                      <p class="text-2xl font-bold text-blue-700">{{ lecturerProjectStats.total }}</p>
                      <p class="text-sm text-blue-600">Total Projects</p>
                    </div>
                    
                    <!-- Assigned Projects -->
                    <div class="bg-green-50 p-3 rounded-lg text-center">
                      <p class="text-2xl font-bold text-green-700">{{ lecturerProjectStats.assigned }}</p>
                      <p class="text-sm text-green-600">Assigned</p>
                    </div>
                    
                    <!-- Unassigned Projects -->
                    <div class="bg-amber-50 p-3 rounded-lg text-center">
                      <p class="text-2xl font-bold text-amber-700">{{ lecturerProjectStats.unassigned }}</p>
                      <p class="text-sm text-amber-600">Unassigned</p>
                    </div>
                  </div>
                  
                  <!-- Assignment Rate Progress Bar -->
                  <div class="mt-2">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm font-medium text-gray-700">Assignment Rate</span>
                      <span class="text-sm font-medium text-gray-700">{{ lecturerProjectStats.assignmentRate }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        class="bg-blue-600 h-2.5 rounded-full" 
                        :style="`width: ${lecturerProjectStats.assignmentRate}%`"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="py-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-500">No projects created yet.</p>
              <p class="text-sm text-gray-400 mt-1">Create projects for students to bid on.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed, watch, onUnmounted, shallowRef } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { getMilestones } from '@/utils/milestones'
  import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
  import { db } from '@/firebase'
  import { collection, getDocs, query, limit, where, doc, getDoc, onSnapshot } from 'firebase/firestore'
  import '@/assets/styles/dashboard.css'
  
  export default {
    setup() {
      const userStore = useUserStore()
      const upcomingMilestone = ref(null)
      const allMilestones = shallowRef({})
      const loading = ref(true)
      const error = ref(null)
      const showAllMilestones = ref(false)
      const lecturerMajors = ref([])
      const selectedMajor = ref(null)
      const milestoneUnsubscribers = ref([])

      // Cache timeout in milliseconds (5 minutes)
      const CACHE_TIMEOUT = 5 * 60 * 1000

      // Modify storeMilestoneData for better caching
      const storeMilestoneData = (majorId, majorMilestones) => {
        try {
          if (!userStore.currentUser?.uid) return;
          
          // Find upcoming milestone for this major
          const now = new Date();
          const sortedMilestones = [...majorMilestones].sort((a, b) => {
            const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate();
            const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate();
            return dateA - dateB;
          });
          
          const upcomingMilestone = sortedMilestones.find(milestone => {
            const deadlineDate = milestone.deadline instanceof Date ? 
              milestone.deadline : 
              milestone.deadline.toDate();
            return deadlineDate > now;
          }) || sortedMilestones[sortedMilestones.length - 1];

          // Create user and major specific key
          const userMajorKey = `${userStore.currentUser.uid}_${majorId}_milestones`;
          
          localStorage.setItem(userMajorKey, JSON.stringify({
            upcomingMilestone,
            allMilestones: majorMilestones,
            lastUpdated: new Date().getTime()
          }));
        } catch (err) {
          console.error('Error storing milestone data:', err);
        }
      }

      // Function to get cached milestones
      const getCachedMilestones = (majorId) => {
        try {
          const userMajorKey = `${userStore.currentUser?.uid}_${majorId}_milestones`
          const cached = localStorage.getItem(userMajorKey)
          if (cached) {
            const data = JSON.parse(cached)
            // Check if cache is still valid (less than 5 minutes old)
            if (Date.now() - data.lastUpdated < CACHE_TIMEOUT) {
              console.log(`Using cached milestones for ${majorId}`)
              return data.milestones
            }
          }
          return null
        } catch {
          return null
        }
      }

      // Optimize the computed properties
      const filteredMilestones = computed(() => {
        if (!selectedMajor.value) return []
        return allMilestones.value[selectedMajor.value] || []
      })

      // Optimize currentUpcomingMilestone computation
      const currentUpcomingMilestone = computed(() => {
        const milestones = filteredMilestones.value
        if (!milestones.length) {
          console.log('No filtered milestones available')
          return null
        }

        const now = new Date()
        // Since list is small, use simple loop
        let upcoming = null
        let mostRecent = milestones[0]

        for (const milestone of milestones) {
          const deadline = milestone.deadline instanceof Date ? 
            milestone.deadline : new Date(milestone.deadline)
          
          // Track most recent milestone
          if (!mostRecent || deadline > mostRecent.deadline) {
            mostRecent = milestone
          }

          // Find first upcoming milestone
          if (deadline > now && (!upcoming || deadline < upcoming.deadline)) {
            upcoming = milestone
          }
        }

        return upcoming || mostRecent
      })

      // Function to set up real-time milestone listeners for a major
      const setupMilestoneListener = async (school, yearId, majorId, majorDocId) => {
        try {
          if (!school || !yearId || !majorId) {
            console.error('Missing required parameters:', { school, yearId, majorId });
            throw new Error('Missing required parameters for milestone listener setup');
          }

          // If majorDocId is not provided, try to fetch it
          if (!majorDocId) {
            try {
              majorDocId = await getMajorDocId(school, yearId, majorId);
              if (!majorDocId) {
                console.error(`No document found for major ${majorId}`);
                return;
              }
            } catch (err) {
              console.error(`Error getting majorDocId for ${majorId}:`, err);
              return;
            }
          }

          // Get reference to the major document that contains the milestones array
          const majorRef = doc(
            db,
            'schools', school,
            'projects', yearId,
            majorId, majorDocId
          );

          console.log(`Setting up milestone listener for major ${majorId} with docId ${majorDocId}`);

          // First try to get cached data
          const cachedData = getCachedMilestones(majorId)
          if (cachedData) {
            // Update state with cached data immediately
            allMilestones.value = {
              ...allMilestones.value,
              [majorId]: cachedData
            }
          }

          let updateTimeout
          // Create the listener on the document
          const unsubscribe = onSnapshot(majorRef, (docSnapshot) => {
            if (!docSnapshot.exists()) {
              console.log(`No document found for major ${majorId}`)
              return
            }

            // Debounce updates to prevent rapid re-renders
            clearTimeout(updateTimeout)
            updateTimeout = setTimeout(() => {
              const data = docSnapshot.data()
              // Get the milestones array from the document
              const milestones = data.milestones || []
              
              // Transform the milestones data
              const updatedMilestones = milestones.map((milestone, index) => {
                // Ensure deadline is properly handled using our helper function
                const deadline = getDateFromDeadline(milestone.deadline)
                
                return {
                  ...milestone,
                  id: `${majorId}_milestone_${index}`, // Create a unique ID
                  major: majorId,
                  deadline: deadline // Ensure deadline is a Date object
                }
              })

              console.log(`Received ${updatedMilestones.length} milestones for ${majorId}:`, 
                updatedMilestones.map(m => ({
                  description: m.description,
                  deadline: m.deadline,
                  major: m.major
                }))
              )

              // Direct assignment to avoid unnecessary array operations
              allMilestones.value = {
                ...allMilestones.value,
                [majorId]: updatedMilestones
              }

              // Log the current state after update
              console.log(`Total milestones after update: ${updatedMilestones.length}`)
              console.log(`Current selected major: ${selectedMajor.value}`)
              console.log(`Filtered milestones for current major:`, 
                filteredMilestones.value
              )

              // Store in cache with timestamp
              storeMilestoneData(majorId, updatedMilestones)
            }, 100) // 100ms debounce
          }, (err) => {
            console.error(`Error in milestone listener for ${majorId}:`, err)
            error.value = `Error receiving milestone updates: ${err.message}`
          })

          // Store the unsubscribe function
          milestoneUnsubscribers.value.push(unsubscribe)
          console.log(`Successfully set up listener for major ${majorId}`)
        } catch (err) {
          console.error(`Error setting up milestone listener for ${majorId}:`, err)
          error.value = `Failed to set up milestone updates: ${err.message}`
        }
      }

      // Assigned project data
      const projectLoading = ref(true)
      const projectError = ref(null)
      
      // Lecturer project stats
      const lecturerProjectStats = ref({
        total: 0,
        assigned: 0,
        unassigned: 0,
        assignmentRate: 0
      })
      
      // Submission data
      const submissionLoading = ref(true)
      const submissionError = ref(null)
      const selectedSubmissionMajor = ref(null)
      const currentMilestoneSubmissionStats = ref(null)
      // Add a cache object to store submission stats by major
      const submissionStatsCache = ref({})
      // Add a flag to track initial load
      const initialLoadDone = ref(false)
  
      // Single watcher for selectedMajor that handles both initial load and subsequent changes
      watch(selectedMajor, async (newMajor, oldMajor) => {
        if (!newMajor) return;
        
        // Skip if this is triggered during the initial load
        if (!initialLoadDone.value) {
          return;
        }

        console.log('Selected major changed to:', newMajor);
        await fetchSubmissionStats(newMajor);
      });

      // Computed property to filter out the current milestone from the list
      const otherMilestones = computed(() => {
        if (!filteredMilestones.value || !currentUpcomingMilestone.value) return []
        
        return filteredMilestones.value.filter(milestone => 
          milestone.description !== currentUpcomingMilestone.value.description ||
          milestone.major !== currentUpcomingMilestone.value.major
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
        
        // Safely convert deadline to Date object
        const deadlineDate = getDateFromDeadline(milestone.deadline)
        
        return new Date() > deadlineDate
      }
      
      // Helper function to safely convert various deadline formats to Date
      const getDateFromDeadline = (deadline) => {
        if (!deadline) return new Date()
        
        // If already a Date object
        if (deadline instanceof Date) return deadline
        
        // If it's a Firestore Timestamp with toDate method
        if (deadline.toDate && typeof deadline.toDate === 'function') {
          return deadline.toDate()
        }
        
        // If it's an ISO string or timestamp number
        try {
          return new Date(deadline)
        } catch (e) {
          console.error('Invalid date format:', deadline)
          return new Date()
        }
      }
      
      // Function to calculate days remaining until deadline
      const getDaysRemaining = (milestone) => {
        if (!milestone || !milestone.deadline) return 0
        
        // Safely convert deadline to Date object
        const deadlineDate = getDateFromDeadline(milestone.deadline)
        const now = new Date()
        
        // If deadline has passed, return 0
        if (now > deadlineDate) return 0
        
        // Calculate days remaining
        const diffTime = Math.abs(deadlineDate - now)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
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
  
      // Function to fetch lecturer projects and count assigned/unassigned
      const fetchLecturerProjects = async () => {
        console.log('Starting fetchLecturerProjects')
        projectLoading.value = true;
        projectError.value = null;

        try {
          // Check if user is authenticated and has necessary data
          if (!userStore.isAuthenticated || !userStore.currentUser) {
            console.log('User not authenticated in fetchLecturerProjects')
            projectError.value = 'User not authenticated';
            return;
          }

          // Get user data
          const { school, uid } = userStore.currentUser;
          console.log('User data:', { school, uid })
          
          if (!school) {
            console.log('Missing school information')
            projectError.value = 'Missing school information';
            return;
          }
          
          // Get latest academic year
          const academicYearData = await getLatestAcademicYear(school);
          console.log('Academic year data:', academicYearData)
          
          if (!academicYearData?.yearId) {
            console.log('Failed to determine academic year')
            projectError.value = 'Failed to determine academic year';
            return;
          }
          
          const yearId = academicYearData.yearId;
          
          // Check if we have lecturer majors
          if (!lecturerMajors.value || lecturerMajors.value.length === 0) {
            console.log('No lecturer majors found, cannot fetch projects')
            projectError.value = 'No majors assigned to lecturer';
            return;
          }
          
          console.log('Lecturer majors:', lecturerMajors.value)
          
          // Create an array to store all major document ID fetch promises
          const majorDocIdPromises = lecturerMajors.value.map(majorId => 
            getMajorDocId(school, yearId, majorId)
          );
          
          // Fetch all major document IDs in parallel
          const majorDocIds = await Promise.all(majorDocIdPromises);
          console.log('Fetched all major document IDs in parallel');
          
          // Create an array to store all project query promises
          const projectQueryPromises = [];
          
          // For each major with a valid docId, create a query promise
          lecturerMajors.value.forEach((majorId, index) => {
            const majorDocId = majorDocIds[index];
            if (!majorDocId) return; // Skip if no docId found
            
            const projectsRef = collection(
              db,
              'schools', school,
              'projects', yearId,
              majorId, majorDocId,
              'projectsPerYear'
            );
            
            const projectsQuery = query(
              projectsRef,
              where('userId', '==', uid)
            );
            
            // Add the query promise to our array
            projectQueryPromises.push({
              majorId,
              promise: getDocs(projectsQuery)
            });
          });
          
          // Execute all project queries in parallel
          const projectResults = await Promise.all(
            projectQueryPromises.map(item => item.promise.then(result => ({
              majorId: item.majorId,
              snapshot: result
            })))
          );
          
          // Process all results to count projects
          let totalProjects = 0;
          let assignedProjects = 0;
          
          projectResults.forEach(result => {
            const { majorId, snapshot } = result;
            console.log(`Found ${snapshot.size} projects for major ${majorId}`);
            
            snapshot.forEach(doc => {
              totalProjects++;
              const projectData = doc.data();
              // Check if project is assigned (has an assignedTo field)
              if (projectData.assignedTo) {
                assignedProjects++;
              }
            });
          });
          
          // Store the results
          lecturerProjectStats.value = {
            total: totalProjects,
            assigned: assignedProjects,
            unassigned: totalProjects - assignedProjects,
            assignmentRate: totalProjects > 0 ? Math.round((assignedProjects / totalProjects) * 100) : 0
          };
          
          console.log('Lecturer project stats:', lecturerProjectStats.value)
          
        } catch (err) {
          console.error('Error in fetchLecturerProjects:', err)
          projectError.value = `Failed to load project data: ${err.message}`;
          console.error('Error loading lecturer projects:', err);
        } finally {
          projectLoading.value = false;
        }
      };
  
      // Function to fetch just the lecturer majors - this is a prerequisite for other data
      const fetchLecturerMajors = async () => {
        try {
          // Check if user is authenticated and has necessary data
          if (!userStore.isAuthenticated || !userStore.currentUser) {
            console.log('User not authenticated in fetchLecturerMajors');
            error.value = 'User not authenticated';
            return;
          }

          // Get user data
          const { school, uid } = userStore.currentUser;
          console.log('User data in fetchLecturerMajors:', { school, uid });
          
          if (!school) {
            console.log('Missing school information in fetchLecturerMajors');
            error.value = 'Missing school information';
            return;
          }
          
          // Get lecturer's majors from their user document - this can't be batched as we need it first
          const lecturerRef = doc(db, 'schools', school, 'users', uid);
          const lecturerDoc = await getDoc(lecturerRef);
          
          if (!lecturerDoc.exists()) {
            console.log('Lecturer information not found');
            error.value = 'Lecturer information not found';
            return;
          }

          const lecturerData = lecturerDoc.data();
          console.log('Lecturer data:', lecturerData);
          const majorIds = lecturerData.major || []; // Array of majorIds
          
          // Store the lecturer's majors
          lecturerMajors.value = majorIds;
          console.log('Set lecturer majors:', lecturerMajors.value);
          
          // Set the default selected major if not already set
          if (!selectedMajor.value && majorIds.length > 0) {
            selectedMajor.value = majorIds[0];
            selectedSubmissionMajor.value = majorIds[0];
            console.log('Set default selected major:', selectedMajor.value);
          }

          if (!majorIds.length) {
            console.log('No majors assigned to lecturer');
            error.value = 'No majors assigned to lecturer';
          }
          
          return majorIds;
        } catch (err) {
          console.error('Error in fetchLecturerMajors:', err);
          error.value = `Failed to load lecturer majors: ${err.message}`;
          throw err;
        }
      };
      
      // Modify fetchMilestonesData to prioritize first major
      const fetchMilestonesData = async () => {
        console.log('Starting fetchMilestonesData')
        loading.value = true

        try {
          if (!userStore.isAuthenticated || !userStore.currentUser) {
            console.log('User not authenticated in fetchMilestonesData')
            error.value = 'User not authenticated'
            return
          }

          const { school, uid } = userStore.currentUser

          if (!school) {
            console.log('Missing school information in fetchMilestonesData')
            error.value = 'Missing school information'
            return
          }

          const academicYearData = await getLatestAcademicYear(school)

          if (!academicYearData?.yearId) {
            console.log('Failed to determine academic year in fetchMilestonesData')
            error.value = 'Failed to determine academic year'
            return
          }

          const yearId = academicYearData.yearId

          if (!lecturerMajors.value || lecturerMajors.value.length === 0) {
            console.log('No lecturer majors available in fetchMilestonesData')
            error.value = 'No majors assigned to lecturer'
            return
          }

          // Clear existing listeners
          milestoneUnsubscribers.value.forEach(unsubscribe => unsubscribe())
          milestoneUnsubscribers.value = []

          // First, handle the primary major (selected or first major)
          const primaryMajor = selectedMajor.value || lecturerMajors.value[0]
          console.log('Loading primary major first:', primaryMajor)

          // Try to get cached data for primary major
          const cachedPrimaryData = getCachedMilestones(primaryMajor)
          if (cachedPrimaryData) {
            console.log('Using cached data for primary major')
            allMilestones.value = {
              [primaryMajor]: cachedPrimaryData
            }
          }

          // Get majorDocId for primary major
          const primaryMajorDocId = await getMajorDocId(school, yearId, primaryMajor)
          if (primaryMajorDocId) {
            await setupMilestoneListener(school, yearId, primaryMajor, primaryMajorDocId)
          }

          // After primary major is loaded, load others in background
          const otherMajors = lecturerMajors.value.filter(majorId => majorId !== primaryMajor)
          console.log('Loading other majors in background:', otherMajors)

          // Load other majors in background
          setTimeout(() => {
            otherMajors.forEach(async majorId => {
              try {
                const majorDocId = await getMajorDocId(school, yearId, majorId)
                if (majorDocId) {
                  setupMilestoneListener(school, yearId, majorId, majorDocId)
                }
              } catch (err) {
                console.error(`Error loading background data for major ${majorId}:`, err)
              }
            })
          }, 0)

        } catch (err) {
          console.error('Error in fetchMilestonesData:', err)
          error.value = `Failed to load milestone data: ${err.message}`
        } finally {
          loading.value = false
          console.log('fetchMilestonesData completed')
        }
      }
  
      // Format date for display
      const formatDate = (date) => {
        if (!date) return ''
        
        try {
          // Convert from timestamp if needed using our helper
          const dateObj = getDateFromDeadline(date)
          
          return dateObj.toLocaleString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })
        } catch (err) {
          console.error('Error formatting date:', err)
          return 'Invalid date'
        }
      }
  
      // Function to pre-load submission statistics for all majors
      const preloadAllSubmissionStats = async () => {
        if (!lecturerMajors.value || lecturerMajors.value.length === 0) return;
        
        console.log('Pre-loading submission statistics for all majors, skipping current major:', selectedMajor.value);
        
        // Create an array of promises to fetch stats for all majors EXCEPT the currently selected one
        const fetchPromises = lecturerMajors.value
          .filter(majorId => majorId !== selectedMajor.value) // Skip the currently displayed major
          .map(majorId => {
            // Only fetch if not already in cache
            if (!submissionStatsCache.value[majorId]) {
              console.log('Preloading stats for major:', majorId);
              return fetchSubmissionStats(majorId, true); // Pass true to indicate this is background loading
            }
            return Promise.resolve();
          });
        
        // Don't await the promises - let them run in the background
        // This allows the dashboard to be interactive while preloading happens
        Promise.all(fetchPromises)
          .then(() => console.log('Finished pre-loading submission statistics'))
          .catch(err => console.error('Error during background preloading:', err));
        
        // Return immediately without waiting
        return;
      };
  
      // Function to fetch submission statistics for the current milestone
      const fetchSubmissionStats = async (majorId, isBackgroundLoad = false) => {
        if (!majorId) return;
        
        console.log('Starting fetchSubmissionStats for major:', majorId, 'background:', isBackgroundLoad);
        
        // Only update the selectedSubmissionMajor if this is not a background load
        if (!isBackgroundLoad) {
          selectedSubmissionMajor.value = majorId;
        }
        
        // Check if we already have cached data for this major
        if (submissionStatsCache.value[majorId]) {
          console.log('Using cached submission stats for major:', majorId);
          
          // Only update the displayed stats if this is not a background load
          if (!isBackgroundLoad) {
            currentMilestoneSubmissionStats.value = submissionStatsCache.value[majorId];
          }
          return;
        }
        
        // Only show loading state for non-background loads
        if (!isBackgroundLoad) {
          submissionLoading.value = true;
          submissionError.value = null;
          // Reset current stats when changing majors to a non-cached major
          currentMilestoneSubmissionStats.value = null;
        }
        
        try {
          // Check if user is authenticated and has necessary data
          if (!userStore.isAuthenticated || !userStore.currentUser) {
            submissionError.value = 'User not authenticated'
            return
          }
          
          // Get user data
          const { school, uid } = userStore.currentUser
          
          if (!school) {
            submissionError.value = 'Missing school information'
            return
          }
          
          // Get latest academic year - this can't be batched
          const academicYearData = await getLatestAcademicYear(school)
          
          if (!academicYearData?.yearId) {
            submissionError.value = 'Failed to determine academic year'
            return
          }
          
          const yearId = academicYearData.yearId
          
          // OPTIMIZATION: Combine majorDocId and milestones fetch
          // First get the majorDocId
          const majorDocId = await getMajorDocId(school, yearId, majorId)
          
          if (!majorDocId) {
            submissionError.value = 'Major document not found'
            return
          }
          
          // Get the current milestone for this major
          const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId)
          
          if (!majorMilestones || majorMilestones.length === 0) {
            submissionError.value = 'No milestones found for this major'
            return
          }
          
          // Find the current milestone
          const now = new Date()
          const sortedMilestones = [...majorMilestones].sort((a, b) => {
            const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate()
            const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate()
            return dateA - dateB
          })
          
          // Find the first upcoming milestone for the selected major
          let currentMilestone = sortedMilestones.find(milestone => {
            const deadlineDate = milestone.deadline instanceof Date ? 
              milestone.deadline : 
              milestone.deadline.toDate()
            return deadlineDate > now
          })
          
          // If no upcoming milestone, use the most recent one
          if (!currentMilestone && sortedMilestones.length > 0) {
            currentMilestone = sortedMilestones[sortedMilestones.length - 1]
          }
          
          if (!currentMilestone) {
            submissionError.value = 'No current milestone found'
            return
          }
          
          // Find the index of the current milestone in the array - simplified
          const milestoneIndex = majorMilestones.findIndex(m => 
            m.description === currentMilestone.description
          )
          
          // Query projects created by this lecturer
          const projectsRef = collection(
            db,
            'schools', school,
            'projects', yearId,
            majorId, majorDocId,
            'projectsPerYear'
          )
          
          const projectsQuery = query(
            projectsRef,
            where('userId', '==', uid)
          )
          
          const projectsSnapshot = await getDocs(projectsQuery)
          
          // Count assigned projects and projects with submissions
          let totalAssigned = 0
          
          // OPTIMIZATION: Create a batch of submission queries
          const submissionQueries = [];
          const assignedProjects = [];
          
          // First pass: count assigned projects and prepare submission queries
          projectsSnapshot.docs.forEach(projectDoc => {
            const projectData = projectDoc.data();
            
            // Check if project is assigned
            if (projectData.assignedTo) {
              totalAssigned++;
              
              // Store the project doc for later use
              assignedProjects.push(projectDoc);
              
              // Prepare submission query
              const submissionsRef = collection(projectDoc.ref, 'submissions');
              const submissionsQuery = query(
                submissionsRef,
                where('milestoneIndex', '==', milestoneIndex)
              );
              
              // Add to our batch of queries
              submissionQueries.push({
                projectId: projectDoc.id,
                query: submissionsQuery
              });
            }
          });
          
          // OPTIMIZATION: Execute all submission queries in parallel
          const submissionResults = await Promise.all(
            submissionQueries.map(item => 
              getDocs(item.query).then(snapshot => ({
                projectId: item.projectId,
                hasSubmission: !snapshot.empty
              }))
            )
          );
          
          // Count projects with submissions
          const projectsWithSubmissions = submissionResults.filter(result => result.hasSubmission).length;
          
          // Calculate submission rate
          const submissionRate = totalAssigned > 0 ? 
            Math.round((projectsWithSubmissions / totalAssigned) * 100) : 0
          
          // Create the stats object
          const statsObject = {
            milestoneName: currentMilestone.description,
            milestoneIndex: milestoneIndex,
            totalAssigned: totalAssigned,
            projectsWithSubmissions: projectsWithSubmissions,
            projectsWithoutSubmissions: totalAssigned - projectsWithSubmissions,
            submissionRate: submissionRate,
            timestamp: Date.now() // Add timestamp for potential cache invalidation
          }
          
          // Store the results in the cache
          submissionStatsCache.value[majorId] = statsObject
          
          // When setting the results, only update currentMilestoneSubmissionStats if not a background load
          if (!isBackgroundLoad) {
            currentMilestoneSubmissionStats.value = statsObject
          }
          
        } catch (err) {
          if (!isBackgroundLoad) {
            submissionError.value = `Failed to load submission data: ${err.message}`;
          } else {
            console.error(`Background load failed for major ${majorId}:`, err);
          }
        } finally {
          if (!isBackgroundLoad) {
            submissionLoading.value = false;
          }
        }
      }
  
      // Watch for changes in lecturerMajors to set default selectedSubmissionMajor
      watch(lecturerMajors, async (newMajors) => {
        if (newMajors && newMajors.length > 0 && !initialLoadDone.value) {
          console.log('Lecturer majors changed, setting initial major');
          // Only set if not already set
          if (!selectedMajor.value) {
            // Explicitly set to first major
            const firstMajor = newMajors[0];
            selectedMajor.value = firstMajor;
            selectedSubmissionMajor.value = firstMajor;
            console.log('Setting initial selectedMajor and selectedSubmissionMajor:', firstMajor);
          }
        }
      }, { immediate: true });
  
      // Modify the onMounted hook to ensure proper initialization order
      onMounted(async () => {
        console.log('LecturerDashboard mounted');
        const startTime = Date.now();
        
        try {
          // Step 1: Initialize auth and get lecturer majors (blocking operations)
          if (!userStore.initialized) {
            console.log('Initializing UserStore');
            await userStore.initializeAuth();
          }

          // Verify userStore.currentUser and school exist
          if (!userStore.currentUser) {
            throw new Error('User not initialized');
          }

          const { school } = userStore.currentUser;
          if (!school) {
            throw new Error('School information not available');
          }

          // Get academic year data early as we'll need it throughout
          const academicYearData = await getLatestAcademicYear(school);
          if (!academicYearData?.yearId) {
            throw new Error('Failed to determine academic year');
          }
          
          // Get lecturer majors first as it's required for everything else
          await fetchLecturerMajors();
          
          if (!lecturerMajors.value || lecturerMajors.value.length === 0) {
            throw new Error('No majors assigned to lecturer');
          }

          // Step 2: Check cache and show cached data immediately
          const primaryMajor = selectedMajor.value || lecturerMajors.value[0];
          
          // Try to get cached data for all components
          const cachedMilestones = getCachedMilestones(primaryMajor);
          if (cachedMilestones) {
            console.log('Using cached milestone data');
            allMilestones.value = {
              [primaryMajor]: cachedMilestones
            };
            loading.value = false;
          }

          // Check submission stats cache
          if (submissionStatsCache.value[primaryMajor]) {
            console.log('Using cached submission stats');
            currentMilestoneSubmissionStats.value = submissionStatsCache.value[primaryMajor];
            submissionLoading.value = false;
          }

          // Step 3: Start all data fetches in parallel
          console.log('Starting parallel data fetches');
          
          // Create an array of promises for all data fetches
          const fetchPromises = [
            // Primary major's data first
            fetchMilestonesData(),
            fetchSubmissionStats(primaryMajor, false),
            fetchLecturerProjects()
          ];

          // Use Promise.race to update UI as soon as any data is available
          Promise.race(fetchPromises).then(() => {
            console.log('First data fetch completed');
          });

          // Handle all promises completion
          Promise.allSettled(fetchPromises).then(results => {
            const totalLoadTime = Date.now() - startTime;
            console.log(`🚀 Total initial load time: ${totalLoadTime}ms`);
            
            // Log any errors that occurred
            results.forEach((result, index) => {
              if (result.status === 'rejected') {
                console.error(`Failed to fetch data for promise ${index}:`, result.reason);
              }
            });

            // Mark initial load as complete
            initialLoadDone.value = true;

            // Step 4: Load background data
            console.log('Starting background data loads');
            
            // Preload other majors' data
            if (lecturerMajors.value.length > 1) {
              setTimeout(() => {
                const otherMajors = lecturerMajors.value.filter(m => m !== primaryMajor);
                console.log('Preloading data for other majors:', otherMajors);
                
                // Preload submission stats
                preloadAllSubmissionStats();
                
                // Preload milestones for other majors
                otherMajors.forEach(majorId => {
                  const cachedData = getCachedMilestones(majorId);
                  if (!cachedData) {
                    console.log(`Preloading milestones for major: ${majorId}`);
                    setupMilestoneListener(
                      school,
                      academicYearData.yearId,
                      majorId,
                      null // Will be fetched in the setup function
                    ).catch(err => {
                      console.error(`Error preloading data for major ${majorId}:`, err);
                    });
                  }
                });
              }, 1000); // Delay background loading to prioritize main content
            }
          });

        } catch (err) {
          console.error('Failed to initialize dashboard:', err);
          error.value = 'Failed to initialize dashboard data';
        }
      });
  
      // Add a function to clear the cache if needed
      const clearSubmissionStatsCache = () => {
        submissionStatsCache.value = {};
      };
  
      // Add cleanup on component unmount
      onUnmounted(() => {
        // Clean up all milestone listeners
        milestoneUnsubscribers.value.forEach(unsubscribe => unsubscribe())
        milestoneUnsubscribers.value = []
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
        projectLoading,
        projectError,
        lecturerMajors,
        selectedMajor,
        currentUpcomingMilestone,
        filteredMilestones,
        lecturerProjectStats,
        submissionLoading,
        submissionError,
        selectedSubmissionMajor,
        currentMilestoneSubmissionStats,
        preloadAllSubmissionStats,
        clearSubmissionStatsCache,
        storeMilestoneData
      }
    }
  }
  </script>
  
  <style scoped>
  /* Dashboard styles imported from assets/styles/dashboard.css */
  </style>
    
    