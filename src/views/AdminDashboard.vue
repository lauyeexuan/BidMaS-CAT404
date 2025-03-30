<template>
  <!-- Dashboard Content -->
  <div class="relative">
    <!-- Dashboard Cards -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <!-- Loading state with skeleton loaders for all cards -->
      <template v-if="showPlaceholders">
        <!-- Left Column Skeleton Loaders -->
        <div class="col-span-6 flex flex-col gap-4">
          <!-- Milestone Card Skeleton -->
          <div class="bg-white p-4 shadow rounded min-h-[160px]">
            <div class="flex justify-between items-center mb-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div class="flex space-x-2">
                <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
            </div>
            <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-3"></div>
            <div class="w-full bg-gray-200 rounded-full h-2 animate-pulse mb-3"></div>
          </div>
          
          <!-- Submission Info Card Skeleton -->
          <div class="bg-white p-4 shadow rounded min-h-[160px]">
            <div class="flex justify-between items-center mb-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
            </div>
            <div class="flex flex-col items-center justify-center py-6">
              <div class="relative w-32 h-32">
                <div class="rounded-full bg-gray-200 animate-pulse w-32 h-32"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="h-8 bg-gray-300 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto mt-4"></div>
            </div>
          </div>
        </div>
        
        <!-- Right Column Skeleton - Project Overview Card -->
        <div class="col-span-6">
          <div class="bg-white p-4 shadow rounded min-h-[160px]">
            <div class="flex justify-between items-center mb-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div class="flex space-x-2">
                <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                <div class="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
            </div>
            <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="bg-gray-100 p-3 rounded-lg">
                <div class="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-2"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
              </div>
              <div class="bg-gray-100 p-3 rounded-lg">
                <div class="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-2"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
              </div>
              <div class="bg-gray-100 p-3 rounded-lg">
                <div class="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-2"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
              </div>
            </div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
          </div>
        </div>
      </template>
      
      <!-- Actual content (only shown when all data is ready) -->
      <template v-else>
        <!-- Left Column -->
        <div class="col-span-6 flex flex-col gap-4">
          <!-- Milestone Card with Expandable Content -->
          <div 
            class="bg-white p-4 shadow rounded relative transition-all duration-200 overflow-hidden flex flex-col min-h-[160px]"
            :class="{'shadow-lg': showAllMilestones}"
          >
            <!-- Card Header -->
            <div>
              <!-- Major selector will be here -->
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
                    v-for="major in schoolMajors"
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
              
              <div v-if="error" class="py-2">
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

          <!-- Submission Info Card (Now below milestone card) -->
          <div class="bg-white p-4 shadow rounded relative">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-sm font-medium text-gray-500">Milestone Submissions</h2>
            </div>
            
            <div v-if="submissionError" class="py-4">
              <p class="text-red-500">{{ submissionError }}</p>
            </div>
            
            <div v-else-if="currentMilestoneSubmissionStats" class="py-2">
              <div class="relative">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></div>
                
                <div class="pl-4">
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">
                    {{ currentMilestoneSubmissionStats.milestoneName }}
                  </h3>
                  
                  <!-- Circular Progress Display -->
                  <div class="flex flex-col items-center justify-center py-6">
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
                    <p class="mt-4 text-center text-gray-600">
                      {{ currentMilestoneSubmissionStats.projectsWithSubmissions }} out of {{ currentMilestoneSubmissionStats.totalAssigned }} 
                      {{ currentMilestoneSubmissionStats.totalAssigned === 1 ? 'student' : 'students' }}
                      {{ currentMilestoneSubmissionStats.projectsWithSubmissions < 2 ? 'has' : 'have' }} submitted their work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="py-4 text-center">
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

        <!-- Right Column - Project Assignment Card -->
        <div class="col-span-6">
          <div class="bg-white p-4 shadow rounded self-start min-h-[160px] relative">
            <div class="flex justify-between items-start">
              <h2 class="text-sm font-medium text-gray-500 mb-2">Projects Overview</h2>
              
              <!-- Major Selector Tabs for Projects -->
              <div class="flex space-x-2">
                <button
                  v-for="major in schoolMajors"
                  :key="major"
                  @click="selectedProjectMajor = major"
                  class="px-3 py-1 text-xs rounded-full transition-colors"
                  :class="selectedProjectMajor === major ? 
                    'bg-green-100 text-green-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ major }}
                </button>
              </div>
            </div>
            
            <div v-if="projectError" class="py-4">
              <p class="text-red-500">{{ projectError }}</p>
            </div>
            
            <div v-else-if="currentMajorProjectStats && currentMajorProjectStats.total > 0" class="py-2">
              <div class="relative">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
                
                <div class="pl-4">
                  <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ selectedProjectMajor }} Projects</h3>
                  
                  <div class="grid grid-cols-3 gap-4 mb-4">
                    <!-- Total Projects -->
                    <div class="bg-blue-50 p-3 rounded-lg text-center">
                      <p class="text-2xl font-bold text-blue-700">{{ currentMajorProjectStats.total }}</p>
                      <p class="text-sm text-blue-600">Total Projects</p>
                    </div>
                    
                    <!-- Assigned Projects -->
                    <div class="bg-green-50 p-3 rounded-lg text-center">
                      <p class="text-2xl font-bold text-green-700">{{ currentMajorProjectStats.assigned }}</p>
                      <p class="text-sm text-green-600">Assigned</p>
                    </div>
                    
                    <!-- Unassigned Projects -->
                    <div class="bg-amber-50 p-3 rounded-lg text-center">
                      <p class="text-2xl font-bold text-amber-700">{{ currentMajorProjectStats.unassigned }}</p>
                      <p class="text-sm text-amber-600">Unassigned</p>
                    </div>
                  </div>
                  
                  <!-- Assignment Rate Progress Bar -->
                  <div class="mt-2">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm font-medium text-gray-700">Assignment Rate</span>
                      <span class="text-sm font-medium text-gray-700">{{ currentMajorProjectStats.assignmentRate }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        class="bg-blue-600 h-2.5 rounded-full" 
                        :style="`width: ${currentMajorProjectStats.assignmentRate}%`"
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
              <p class="text-gray-500">No projects data available for {{ selectedProjectMajor }}.</p>
              <p class="text-sm text-gray-400 mt-1">Projects may not have been created yet.</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getMilestones } from '@/utils/milestones'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { db } from '@/firebase'
import { collection, getDocs, query, where, doc, getDoc, limit, onSnapshot } from 'firebase/firestore'

export default {
  setup() {
    const userStore = useUserStore()
    const allMilestones = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showAllMilestones = ref(false)
    const schoolMajors = ref([])
    const selectedMajor = ref(null)
    
    // Unified loading state
    const showPlaceholders = ref(true)
    const allContentLoaded = ref(false)
    
    // Submission data
    const submissionLoading = ref(true)
    const submissionError = ref(null)
    const selectedSubmissionMajor = ref(null)
    const currentMilestoneSubmissionStats = ref(null)
    const submissionStatsCache = ref({})
    const initialLoadDone = ref(false)

    // Project data
    const projectLoading = ref(true)
    const projectError = ref(null)
    const selectedProjectMajor = ref(null)
    const currentMajorProjectStats = ref(null)

    // In the setup function, add a projectStatsCache ref
    const projectStatsCache = ref({})

    // Replace single unsubscribe with a map of unsubscribe functions
    const unsubscribeMilestonesMap = ref({})

    // Add new functions for session storage handling
    const storeMilestoneData = (majorId, milestones) => {
      try {
        if (!userStore.currentUser?.uid) {
          console.warn('No user ID available for storing milestone data');
          return;
        }
        
        console.log(`Storing milestone data for major ${majorId}`, {
          milestonesCount: milestones.length
        });
        
        // Create user and major specific key
        const userMajorKey = `${userStore.currentUser.uid}_${majorId}_milestones`;
        
        // Convert Firestore timestamps to ISO strings before storage
        const processedMilestones = milestones.map(milestone => {
          const deadlineDate = milestone.deadline instanceof Date ? 
            milestone.deadline : 
            (milestone.deadline?.toDate ? milestone.deadline.toDate() : new Date(milestone.deadline));
          
          return {
            ...milestone,
            deadline: deadlineDate.toISOString()
          };
        });
        
        const storageData = {
          milestones: processedMilestones,
          lastUpdated: new Date().getTime()
        };
        
        sessionStorage.setItem(userMajorKey, JSON.stringify(storageData));
      } catch (err) {
        console.error('Error storing milestone data:', err);
      }
    }

    const getMilestonesFromSessionStorage = (majorId) => {
      try {
        if (!userStore.currentUser?.uid) return null;
        
        // Create user and major specific key
        const userMajorKey = `${userStore.currentUser.uid}_${majorId}_milestones`;
        const storedData = sessionStorage.getItem(userMajorKey);
        
        if (!storedData) return null;
        
        const parsedData = JSON.parse(storedData);
        
        // Convert ISO strings back to Date objects
        return parsedData.milestones.map(milestone => ({
          ...milestone,
          deadline: new Date(milestone.deadline)
        }));
      } catch (err) {
        console.error('Error retrieving milestone data from session storage:', err);
        return null;
      }
    }

    // Computed property to filter milestones based on selected major
    const filteredMilestones = computed(() => {
      if (!allMilestones.value) return []
      if (!selectedMajor.value) return []
      
      return allMilestones.value.filter(milestone => 
        milestone.major === selectedMajor.value
      )
    })

    // Computed property for the upcoming milestone
    const currentUpcomingMilestone = computed(() => {
      console.log('Computing currentUpcomingMilestone')
      console.log('filteredMilestones.value:', filteredMilestones.value)
      
      if (!filteredMilestones.value || filteredMilestones.value.length === 0) {
        console.log('No filtered milestones available')
        return null
      }
      
      const now = new Date()
      console.log('Current time:', now)
      
      const sortedMilestones = [...filteredMilestones.value].sort((a, b) => {
        const dateA = a.deadline instanceof Date ? 
          a.deadline : 
          (a.deadline?.toDate ? a.deadline.toDate() : new Date(a.deadline))
        const dateB = b.deadline instanceof Date ? 
          b.deadline : 
          (b.deadline?.toDate ? b.deadline.toDate() : new Date(b.deadline))
        return dateA - dateB
      })
      console.log('Sorted milestones:', sortedMilestones)
      
      // Find the first upcoming milestone for the selected major
      const upcoming = sortedMilestones.find(milestone => {
        const deadlineDate = milestone.deadline instanceof Date ? 
          milestone.deadline : 
          (milestone.deadline?.toDate ? milestone.deadline.toDate() : new Date(milestone.deadline))
        console.log('Checking milestone:', milestone.description, 'deadline:', deadlineDate)
        const isUpcoming = deadlineDate > now
        console.log('Is upcoming:', isUpcoming)
        return isUpcoming
      })
      
      console.log('Found upcoming milestone:', upcoming)
      
      // If no upcoming milestone, use the most recent one
      const result = upcoming || sortedMilestones[sortedMilestones.length - 1]
      console.log('Final selected milestone:', result)
      return result
    })

    // Computed property to filter out the current milestone from the list
    const otherMilestones = computed(() => {
      if (!filteredMilestones.value || !currentUpcomingMilestone.value) return []
      
      return filteredMilestones.value.filter(milestone => 
        milestone.description !== currentUpcomingMilestone.value.description ||
        milestone.major !== currentUpcomingMilestone.value.major
      )
    })

    // Helper functions
    const toggleAllMilestones = () => {
      showAllMilestones.value = !showAllMilestones.value
    }

    const isMilestonePast = (milestone) => {
      if (!milestone || !milestone.deadline) return false
      
      const deadlineDate = milestone.deadline instanceof Date ? 
        milestone.deadline : 
        (milestone.deadline?.toDate ? milestone.deadline.toDate() : new Date(milestone.deadline))
      
      return new Date() > deadlineDate
    }

    const getDaysRemaining = (milestone) => {
      if (!milestone || !milestone.deadline) return 0
      
      const deadlineDate = milestone.deadline instanceof Date ? 
        milestone.deadline : 
        (milestone.deadline?.toDate ? milestone.deadline.toDate() : new Date(milestone.deadline))
      
      const now = new Date()
      
      // If deadline has passed, return 0
      if (now > deadlineDate) return 0
      
      // Calculate days remaining
      const diffTime = Math.abs(deadlineDate - now)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    }

    const getDaysRemainingPercentage = (milestone) => {
      const daysRemaining = getDaysRemaining(milestone)
      return daysRemaining <= 30 ? (daysRemaining / 30) * 100 : 100
    }

    const getDaysRemainingText = (milestone) => {
      const days = getDaysRemaining(milestone)
      if (days === 0) return 'Due today'
      if (days === 1) return '1 day left'
      return `${days} days left`
    }

    const getDaysRemainingClass = (milestone) => {
      const days = getDaysRemaining(milestone)
      if (days < 3) return 'text-red-600'
      if (days < 7) return 'text-orange-500'
      return 'text-green-600'
    }

    const formatDate = (date) => {
      if (!date) return ''
      try {
        const dateObj = date instanceof Date ? 
          date : 
          (date?.toDate ? date.toDate() : new Date(date))
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

    // Helper function to get major document ID
    const getMajorDocId = async (schoolId, yearId, majorId) => {
      try {
        console.log(`Getting major doc ID for ${majorId} in year ${yearId}`)
        const majorRef = collection(db, 'schools', schoolId, 'projects', yearId, majorId)
        const majorDocsQuery = query(majorRef, limit(1))
        const majorDocsSnapshot = await getDocs(majorDocsQuery)
        
        if (majorDocsSnapshot.empty) {
          console.log(`No documents found for major ${majorId}`)
          return null
        }
        
        const docId = majorDocsSnapshot.docs[0].id
        console.log(`Found major doc ID for ${majorId}:`, docId)
        return docId
      } catch (err) {
        console.error(`Error getting major doc ID for ${majorId}:`, err)
        return null
      }
    }

    // Simplified fetchMilestonesData function
    const fetchMilestonesData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        if (!userStore.currentUser?.school) {
          throw new Error('School information not found');
        }

        const school = userStore.currentUser.school;
        const academicYearData = await getLatestAcademicYear(school);
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year');
        }

        const yearId = academicYearData.yearId;

        // Get all majors first if not already loaded
        if (schoolMajors.value.length === 0) {
          await fetchSchoolMajors();
        }

        // If no majors found, return early
        if (schoolMajors.value.length === 0) {
          console.log('No majors found');
          return;
        }

        // First, try to get the selected major's data (or first major if none selected)
        const primaryMajor = selectedMajor.value || schoolMajors.value[0];
        console.log('Loading primary major first:', primaryMajor);

        // Check session storage for primary major
        const cachedPrimaryMilestones = getMilestonesFromSessionStorage(primaryMajor);
        if (cachedPrimaryMilestones) {
          console.log(`Using cached milestones for primary major: ${primaryMajor}`);
          allMilestones.value = cachedPrimaryMilestones.map(milestone => ({
            ...milestone,
            major: primaryMajor
          }));
        } else {
          // Fetch from Firestore for primary major
          console.log(`Fetching milestones for primary major: ${primaryMajor}`);
          const majorCollectionRef = collection(db, 'schools', school, 'projects', yearId, primaryMajor);
          const majorDocsQuery = query(majorCollectionRef, limit(1));
          const majorDocsSnapshot = await getDocs(majorDocsQuery);
          
          if (!majorDocsSnapshot.empty) {
            const majorDoc = majorDocsSnapshot.docs[0];
            const majorData = majorDoc.data();
            const milestones = majorData.milestones || [];
            const processedMilestones = milestones.map(milestone => ({
              ...milestone,
              major: primaryMajor
            }));
            
            // Store in session storage and update state
            storeMilestoneData(primaryMajor, processedMilestones);
            allMilestones.value = processedMilestones;
          }
        }

        // After loading primary major, load others in background
        const otherMajors = schoolMajors.value.filter(majorId => majorId !== primaryMajor);
        console.log('Loading other majors in background:', otherMajors);

        // Load other majors in the background
        setTimeout(() => {
          otherMajors.forEach(async majorId => {
            try {
              const cachedMilestones = getMilestonesFromSessionStorage(majorId);
              if (cachedMilestones) {
                console.log(`Using cached milestones for major: ${majorId}`);
                allMilestones.value = [...allMilestones.value, ...cachedMilestones.map(milestone => ({
                  ...milestone,
                  major: majorId
                }))];
                return;
              }

              console.log(`Background fetching milestones for major: ${majorId}`);
              const majorCollectionRef = collection(db, 'schools', school, 'projects', yearId, majorId);
              const majorDocsQuery = query(majorCollectionRef, limit(1));
              const majorDocsSnapshot = await getDocs(majorDocsQuery);
              
              if (!majorDocsSnapshot.empty) {
                const majorDoc = majorDocsSnapshot.docs[0];
                const majorData = majorDoc.data();
                const milestones = majorData.milestones || [];
                const processedMilestones = milestones.map(milestone => ({
                  ...milestone,
                  major: majorId
                }));
                
                storeMilestoneData(majorId, processedMilestones);
                allMilestones.value = [...allMilestones.value, ...processedMilestones];
              }
            } catch (err) {
              console.error(`Error loading background milestones for major ${majorId}:`, err);
            }
          });
        }, 0);

      } catch (err) {
        console.error('Error in fetchMilestonesData:', err);
        error.value = `Failed to load milestone data: ${err.message}`;
      } finally {
        loading.value = false;
      }
    }

    // Fetch all majors for the school
    const fetchSchoolMajors = async () => {
      try {
        if (!userStore.currentUser?.school) {
          throw new Error('School information not found')
        }

        const school = userStore.currentUser.school
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }

        // Get the academic year document which contains the majors array
        const yearRef = doc(db, 'schools', school, 'projects', academicYearData.yearId)
        const yearDoc = await getDoc(yearRef)
        
        if (!yearDoc.exists()) {
          throw new Error('Academic year document not found')
        }

        const yearData = yearDoc.data()
        const majors = yearData.majors || []
        console.log('Found majors in academic year document:', majors)
        
        schoolMajors.value = majors

        // Set default selected major
        if (majors.length > 0 && !selectedMajor.value) {
          selectedMajor.value = majors[0]
          selectedSubmissionMajor.value = majors[0]
        }

        return majors
      } catch (err) {
        console.error('Error fetching school majors:', err)
        error.value = 'Failed to load school majors'
        throw err
      }
    }

    // Function to fetch submission statistics for the current milestone
    const fetchSubmissionStats = async (majorId, isBackgroundLoad = false, force = false) => {
      if (!majorId) return
      
      console.log('Starting fetchSubmissionStats for major:', majorId, 'background:', isBackgroundLoad)
      
      if (!isBackgroundLoad) {
        selectedSubmissionMajor.value = majorId
      }
      
      // Skip if recently loaded (within 30 seconds) unless forced
      const now = Date.now()
      
      // Check cache with better timestamp expiration logic
      if (submissionStatsCache.value[majorId]) {
        console.log('Found cached submission stats for major:', majorId)
        
        // Use cached data immediately
        if (!isBackgroundLoad) {
          currentMilestoneSubmissionStats.value = submissionStatsCache.value[majorId]
        }
        
        // If not forced and cache is fresh (less than 30 seconds), don't refresh
        const cacheAge = now - (submissionStatsCache.value[majorId].timestamp || 0)
        if (!force && cacheAge < 30000) {
          console.log('Using fresh cache for submission stats, age:', cacheAge, 'ms')
          return
        }
      }
      
      // Also check session storage (provides persistence between page loads)
      const sessionStorageKey = `${userStore.currentUser?.uid}_${majorId}_submissionStats`
      try {
        const storedStats = sessionStorage.getItem(sessionStorageKey)
        if (storedStats) {
          const parsedStats = JSON.parse(storedStats)
          const storageAge = now - (parsedStats.timestamp || 0)
          
          // Use session storage if fresh (less than 2 minutes)
          if (!force && storageAge < 120000) {
            console.log('Using submission stats from session storage, age:', storageAge, 'ms')
            submissionStatsCache.value[majorId] = parsedStats
            if (!isBackgroundLoad) {
              currentMilestoneSubmissionStats.value = parsedStats
            }
            return
          }
        }
      } catch (err) {
        console.error('Error reading submission stats from session storage:', err)
      }
      
      if (!isBackgroundLoad) {
        submissionLoading.value = true
        submissionError.value = null
        currentMilestoneSubmissionStats.value = null
      }
      
      try {
        if (!userStore.currentUser?.school) {
          throw new Error('School information not found')
        }
        
        const school = userStore.currentUser.school
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }
        
        const yearId = academicYearData.yearId
        const majorDocId = await getMajorDocId(school, yearId, majorId)
        
        if (!majorDocId) {
          throw new Error('Major document not found')
        }
        
        // Get current milestone index first to avoid loading unnecessary data
        const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId)
        const now = new Date()
        const sortedMilestones = [...majorMilestones].sort((a, b) => {
          const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate()
          const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate()
          return dateA - dateB
        })
        
        let currentMilestone = sortedMilestones.find(milestone => {
          const deadlineDate = milestone.deadline instanceof Date ? 
            milestone.deadline : 
            milestone.deadline.toDate()
          return deadlineDate > now
        })
        
        if (!currentMilestone && sortedMilestones.length > 0) {
          currentMilestone = sortedMilestones[sortedMilestones.length - 1]
        }
        
        if (!currentMilestone) {
          throw new Error('No current milestone found')
        }
        
        const milestoneIndex = majorMilestones.findIndex(m => 
          m.description === currentMilestone.description
        )
        
        // OPTIMIZATION: Use a more efficient approach - get all submissions for this milestone first
        // This is faster than querying each project's submissions separately
        const projectsRef = collection(
          db,
          'schools', school,
          'projects', yearId,
          majorId, majorDocId,
          'projectsPerYear'
        )
        
        // Use limit to improve performance - we only need the assignment info
        const projectsQuery = query(projectsRef, limit(100))
        const projectsSnapshot = await getDocs(projectsQuery)
        
        // Build a map of project IDs to make lookups faster
        const assignedProjectIds = new Set()
        projectsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.assignedTo) {
            assignedProjectIds.add(doc.id)
          }
        })
        
        const totalAssigned = assignedProjectIds.size
        
        // If no assigned projects, return early with zero stats
        if (totalAssigned === 0) {
          const emptyStats = {
            milestoneName: currentMilestone.description,
            milestoneIndex: milestoneIndex,
            totalAssigned: 0,
            projectsWithSubmissions: 0,
            projectsWithoutSubmissions: 0,
            submissionRate: 0,
            timestamp: Date.now()
          }
          
          submissionStatsCache.value[majorId] = emptyStats
          
          // Store in session storage
          try {
            sessionStorage.setItem(sessionStorageKey, JSON.stringify(emptyStats))
          } catch (err) {
            console.error('Error storing submission stats in session storage:', err)
          }
          
          if (!isBackgroundLoad) {
            currentMilestoneSubmissionStats.value = emptyStats
          }
          
          return
        }
        
        // OPTIMIZATION: Use a batched approach with a single query for all submissions
        // by querying the "milestoneIndex" across all projects
        // This is a significant performance improvement over the original approach
        let projectsWithSubmissions = 0
        
        // Use Promise.all for concurrent requests with a limit on batch size
        const batchSize = 10 // Process 10 projects at a time to avoid overwhelming Firestore
        const batches = []
        const projectIds = Array.from(assignedProjectIds)
        
        for (let i = 0; i < projectIds.length; i += batchSize) {
          const batch = projectIds.slice(i, i + batchSize)
          batches.push(batch)
        }
        
        // Process batches sequentially to avoid too many parallel requests
        for (const batch of batches) {
          const batchQueries = batch.map(projectId => {
            const projectRef = doc(projectsRef, projectId)
            const submissionsRef = collection(projectRef, 'submissions')
            // OPTIMIZATION: Limit to 1 result, we only need to know if any exist
            const submissionsQuery = query(
              submissionsRef,
              where('milestoneIndex', '==', milestoneIndex),
              limit(1)
            )
            return getDocs(submissionsQuery).then(snapshot => !snapshot.empty)
          })
          
          const batchResults = await Promise.all(batchQueries)
          projectsWithSubmissions += batchResults.filter(Boolean).length
        }
        
        const submissionRate = Math.round((projectsWithSubmissions / totalAssigned) * 100)
        
        const statsObject = {
          milestoneName: currentMilestone.description,
          milestoneIndex: milestoneIndex,
          totalAssigned: totalAssigned,
          projectsWithSubmissions: projectsWithSubmissions,
          projectsWithoutSubmissions: totalAssigned - projectsWithSubmissions,
          submissionRate: submissionRate,
          timestamp: Date.now()
        }
        
        // Cache in memory
        submissionStatsCache.value[majorId] = statsObject
        
        // Store in session storage
        try {
          sessionStorage.setItem(sessionStorageKey, JSON.stringify(statsObject))
        } catch (err) {
          console.error('Error storing submission stats in session storage:', err)
        }
        
        if (!isBackgroundLoad) {
          currentMilestoneSubmissionStats.value = statsObject
        }
        
      } catch (err) {
        if (!isBackgroundLoad) {
          submissionError.value = `Failed to load submission data: ${err.message}`
        }
        console.error(`Error loading submission stats for major ${majorId}:`, err)
      } finally {
        if (!isBackgroundLoad) {
          submissionLoading.value = false
        }
      }
    }

    // Function to pre-load submission statistics for all majors
    const preloadAllSubmissionStats = async () => {
      if (!schoolMajors.value || schoolMajors.value.length === 0) return
      
      console.log('Pre-loading submission statistics for all majors')
      
      // Prioritize majors without cached data
      const majorsToLoad = schoolMajors.value
        .filter(majorId => majorId !== selectedMajor.value)
        .sort((a, b) => {
          // Sort by cache status - uncached majors first
          const aIsCached = !!submissionStatsCache.value[a];
          const bIsCached = !!submissionStatsCache.value[b];
          if (aIsCached !== bIsCached) return aIsCached ? 1 : -1;
          return 0;
        });
      
      // Process in batches to avoid overwhelming the browser/Firestore
      const processBatch = async (startIndex) => {
        if (startIndex >= majorsToLoad.length) return;
        
        // Process maximum 2 majors at a time
        const batchSize = 2;
        const endIndex = Math.min(startIndex + batchSize, majorsToLoad.length);
        const currentBatch = majorsToLoad.slice(startIndex, endIndex);
        
        // Process this batch
        await Promise.all(
          currentBatch.map(majorId => fetchSubmissionStats(majorId, true))
        );
        
        // Schedule next batch with a small delay to avoid UI blocking
        setTimeout(() => {
          processBatch(endIndex);
        }, 100);
      };
      
      // Start processing the first batch
      processBatch(0);
    }

    // Add watcher for selectedMajor
    watch(selectedMajor, async (newMajor, oldMajor) => {
      if (!newMajor) return
      
      if (!initialLoadDone.value) {
        return
      }

      console.log('Selected major changed to:', newMajor)
      await fetchSubmissionStats(newMajor)
    })

    // Function to fetch project statistics for a specific major
    const fetchProjectStats = async (majorId, isBackgroundLoad = false, force = false) => {
      if (!majorId) return
      
      console.log('Starting fetchProjectStats for major:', majorId, 'background:', isBackgroundLoad)
      
      // Set selected major (only for foreground loads)
      if (!isBackgroundLoad) {
        selectedProjectMajor.value = majorId
      }
      
      // Skip if recently loaded (within 30 seconds) unless forced
      const now = Date.now()
      
      // Check memory cache with expiration logic
      if (projectStatsCache.value[majorId]) {
        console.log('Found cached project stats for major:', majorId)
        
        // Use cached data immediately
        if (!isBackgroundLoad) {
          currentMajorProjectStats.value = projectStatsCache.value[majorId]
        }
        
        // If not forced and cache is fresh (less than 30 seconds), don't refresh
        const cacheAge = now - (projectStatsCache.value[majorId].timestamp || 0)
        if (!force && cacheAge < 30000) {
          console.log('Using fresh memory cache for project stats, age:', cacheAge, 'ms')
          return
        }
      }
      
      // Check session storage for cached data
      const sessionStorageKey = `${userStore.currentUser?.uid}_${majorId}_projectStats`
      try {
        const storedStats = sessionStorage.getItem(sessionStorageKey)
        if (storedStats) {
          const parsedStats = JSON.parse(storedStats)
          const storageAge = now - (parsedStats.timestamp || 0)
          
          // Use session storage if fresh (less than 2 minutes)
          if (!force && storageAge < 120000) {
            console.log('Using project stats from session storage, age:', storageAge, 'ms')
            projectStatsCache.value[majorId] = parsedStats
            if (!isBackgroundLoad) {
              currentMajorProjectStats.value = parsedStats
            }
            return
          }
        }
      } catch (err) {
        console.error('Error reading project stats from session storage:', err)
      }
      
      if (!isBackgroundLoad) {
        projectLoading.value = true
        projectError.value = null
      }
      
      try {
        if (!userStore.currentUser?.school) {
          throw new Error('School information not found')
        }
        
        const school = userStore.currentUser.school
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }
        
        const yearId = academicYearData.yearId
        const majorDocId = await getMajorDocId(school, yearId, majorId)
        
        if (!majorDocId) {
          throw new Error('Major document not found')
        }
        
        // Get all projects for this major
        const projectsRef = collection(
          db,
          'schools', school,
          'projects', yearId,
          majorId, majorDocId,
          'projectsPerYear'
        )
        
        // OPTIMIZATION: Use limit and only fetch necessary fields
        const projectsQuery = query(projectsRef, limit(100))
        const projectsSnapshot = await getDocs(projectsQuery)
        
        // Count total, assigned and unassigned projects
        let totalProjects = projectsSnapshot.size
        let assignedProjects = 0
        
        projectsSnapshot.forEach(doc => {
          const projectData = doc.data()
          if (projectData.assignedTo) {
            assignedProjects++
          }
        })
        
        const unassignedProjects = totalProjects - assignedProjects
        const assignmentRate = totalProjects > 0 ? Math.round((assignedProjects / totalProjects) * 100) : 0
        
        // Create stats object
        const statsObject = {
          total: totalProjects,
          assigned: assignedProjects,
          unassigned: unassignedProjects,
          assignmentRate: assignmentRate,
          timestamp: Date.now()
        }
        
        // Store in memory cache
        projectStatsCache.value[majorId] = statsObject
        
        // Store in session storage for persistence
        try {
          sessionStorage.setItem(sessionStorageKey, JSON.stringify(statsObject))
        } catch (err) {
          console.error('Error storing project stats in session storage:', err)
        }
        
        // Update current stats
        if (!isBackgroundLoad) {
          currentMajorProjectStats.value = statsObject
        }
        
        console.log(`Project stats for ${majorId}:`, statsObject)
        return statsObject
        
      } catch (err) {
        if (!isBackgroundLoad) {
          projectError.value = `Failed to load project data: ${err.message}`
        }
        console.error(`Error loading project stats for major ${majorId}:`, err)
        return null
      } finally {
        if (!isBackgroundLoad) {
          projectLoading.value = false
        }
      }
    }

    // Function to preload project stats for all majors
    const preloadAllProjectStats = async () => {
      if (!schoolMajors.value || schoolMajors.value.length === 0) return
      
      console.log('Pre-loading project statistics for all majors')
      
      // Prioritize majors without cached data
      const majorsToLoad = schoolMajors.value
        .filter(majorId => majorId !== selectedProjectMajor.value)
        .sort((a, b) => {
          // Sort by cache status - uncached majors first
          const aIsCached = !!projectStatsCache.value[a];
          const bIsCached = !!projectStatsCache.value[b];
          if (aIsCached !== bIsCached) return aIsCached ? 1 : -1;
          return 0;
        });
      
      // Process in batches to avoid overwhelming the browser/Firestore
      const processBatch = async (startIndex) => {
        if (startIndex >= majorsToLoad.length) return;
        
        // Process maximum 2 majors at a time
        const batchSize = 2;
        const endIndex = Math.min(startIndex + batchSize, majorsToLoad.length);
        const currentBatch = majorsToLoad.slice(startIndex, endIndex);
        
        // Process this batch
        await Promise.all(
          currentBatch.map(majorId => fetchProjectStats(majorId, true))
        );
        
        // Schedule next batch without blocking the main thread
        setTimeout(() => {
          processBatch(endIndex);
        }, 100);
      };
      
      // Start processing the first batch
      processBatch(0);
    }

    // Update the watcher for selectedProjectMajor to use the cache
    watch(selectedProjectMajor, async (newMajor, oldMajor) => {
      if (!newMajor) return
      
      console.log('Selected project major changed to:', newMajor)
      
      // Check if we have cached data
      if (projectStatsCache.value[newMajor]) {
        console.log('Using cached project stats for major:', newMajor)
        currentMajorProjectStats.value = projectStatsCache.value[newMajor]
      } else {
        // Fetch if not in cache
        await fetchProjectStats(newMajor)
      }
    })

    // Modified onMounted function for instant loading with cached data
    onMounted(async () => {
      console.log('AdminDashboard mounted')
      const startTime = Date.now()
      
      try {
        if (!userStore.initialized) {
          await userStore.initializeAuth()
        }

        // First fetch all majors for the school
        await fetchSchoolMajors()

        // Set default selected majors if not already set
        if (schoolMajors.value.length > 0) {
          if (!selectedMajor.value) {
            selectedMajor.value = schoolMajors.value[0]
          }
          if (!selectedProjectMajor.value) {
            selectedProjectMajor.value = schoolMajors.value[0]
          }
        }

        // STEP 1: Load cached data immediately and show UI
        let hasAnyCache = false;
        
        // Check for cached milestone data
        if (selectedMajor.value) {
          const cachedMilestones = getMilestonesFromSessionStorage(selectedMajor.value);
          if (cachedMilestones) {
            console.log(`Using cached milestones for instant display: ${selectedMajor.value}`);
            allMilestones.value = cachedMilestones.map(milestone => ({
              ...milestone,
              major: selectedMajor.value
            }));
            hasAnyCache = true;
          }
        }
        
        // Check for cached submission data
        if (selectedMajor.value) {
          const sessionStorageKey = `${userStore.currentUser?.uid}_${selectedMajor.value}_submissionStats`;
          try {
            const storedStats = sessionStorage.getItem(sessionStorageKey);
            if (storedStats) {
              const parsedStats = JSON.parse(storedStats);
              submissionStatsCache.value[selectedMajor.value] = parsedStats;
              currentMilestoneSubmissionStats.value = parsedStats;
              hasAnyCache = true;
              submissionLoading.value = false;
              console.log('Using cached submission stats for instant display');
            }
          } catch (err) {
            console.error('Error reading submission stats from session storage:', err);
          }
        }
        
        // Check for cached project data
        if (selectedProjectMajor.value) {
          const projectStorageKey = `${userStore.currentUser?.uid}_${selectedProjectMajor.value}_projectStats`;
          try {
            const storedProjectStats = sessionStorage.getItem(projectStorageKey);
            if (storedProjectStats) {
              const parsedProjectStats = JSON.parse(storedProjectStats);
              projectStatsCache.value[selectedProjectMajor.value] = parsedProjectStats;
              currentMajorProjectStats.value = parsedProjectStats;
              hasAnyCache = true;
              projectLoading.value = false;
              console.log('Using cached project stats for instant display');
            }
          } catch (err) {
            console.error('Error reading project stats from session storage:', err);
          }
        }
        
        // If we have any cached data, show the UI immediately
        if (hasAnyCache) {
          console.log('Found cached data, showing UI immediately');
          showPlaceholders.value = false;
          initialLoadDone.value = true;
        }
        
        // STEP 2: Load fresh data in background and update UI incrementally
        
        // Function to update UI with fresh milestone data
        const updateMilestoneData = async () => {
          try {
            console.log('Loading fresh milestone data');
            await fetchMilestonesData();
            console.log('Milestone data refreshed');
          } catch (err) {
            console.error('Error updating milestone data:', err);
          } finally {
            loading.value = false;
          }
        };
        
        // Function to update UI with fresh submission data
        const updateSubmissionData = async () => {
          if (!selectedMajor.value) return;
          try {
            console.log('Loading fresh submission data');
            await fetchSubmissionStats(selectedMajor.value, false, true); // Force refresh
            console.log('Submission data refreshed');
          } catch (err) {
            console.error('Error updating submission data:', err);
          } finally {
            submissionLoading.value = false;
          }
        };
        
        // Function to update UI with fresh project data
        const updateProjectData = async () => {
          if (!selectedProjectMajor.value) return;
          try {
            console.log('Loading fresh project data');
            await fetchProjectStats(selectedProjectMajor.value, false, true); // Force refresh
            console.log('Project data refreshed');
          } catch (err) {
            console.error('Error updating project data:', err);
          } finally {
            projectLoading.value = false;
          }
        };
        
        // Load data in background and update UI as each piece becomes available
        Promise.all([
          updateMilestoneData(),
          updateSubmissionData(),
          updateProjectData()
        ]).then(() => {
          // All data is now fresh
          console.log('All dashboard data refreshed');
          // Always ensure UI is visible after all data is loaded
          showPlaceholders.value = false;
          initialLoadDone.value = true;
          
          // Preload other majors in background
          if (selectedMajor.value) {
            preloadAllSubmissionStats();
          }
          preloadAllProjectStats();
          
          const totalLoadTime = Date.now() - startTime;
          console.log(`Total dashboard refresh time: ${totalLoadTime}ms`);
        }).catch(err => {
          console.error('Error refreshing dashboard data:', err);
        });
        
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
        error.value = 'Failed to initialize dashboard data';
        
        // Ensure UI is shown even in case of errors
        showPlaceholders.value = false;
      } finally {
        // If we had no cache, we need to wait for the first data load
        if (showPlaceholders.value) {
          setTimeout(() => {
            // Safety fallback - if after 2 seconds we still have placeholders, hide them anyway
            showPlaceholders.value = false;
            initialLoadDone.value = true;
          }, 2000);
        }
      }
    })

    return {
      allMilestones,
      loading,
      error,
      showAllMilestones,
      schoolMajors,
      selectedMajor,
      submissionLoading,
      submissionError,
      currentMilestoneSubmissionStats,
      currentUpcomingMilestone,
      filteredMilestones,
      otherMilestones,
      toggleAllMilestones,
      isMilestonePast,
      getDaysRemaining,
      getDaysRemainingPercentage,
      getDaysRemainingText,
      getDaysRemainingClass,
      formatDate,
      selectedSubmissionMajor,
      preloadAllSubmissionStats,
      fetchSubmissionStats,
      projectLoading,
      projectError,
      selectedProjectMajor,
      currentMajorProjectStats,
      fetchProjectStats,
      // Add new reactive variables to the return object
      showPlaceholders,
      allContentLoaded
    }
  }
}
</script>

<style scoped>
/* Dashboard styles imported from assets/styles/dashboard.css */
</style>


