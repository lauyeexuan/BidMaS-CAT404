<template>
    <!-- Dashboard Content -->
    <div class="relative">
      <!-- Dashboard Cards -->
      <div class="mt-6 grid grid-cols-12 gap-4">
        <!-- Milestone Card with Expandable Content -->
        <div 
          class="col-span-6 bg-white p-4 shadow rounded relative transition-all duration-200 overflow-hidden flex flex-col min-h-[160px]"
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
          
            <div v-if="loading" class="py-2">
              <div class="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
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
        
        <!-- Assigned Project Card -->
        <div class="col-span-6 bg-white p-4 shadow rounded self-start min-h-[160px] relative">
          <div class="flex justify-between items-start">
            <h2 class="text-sm font-medium text-gray-500 mb-2">Your Assigned Project</h2>
          </div>
          
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
  
      <!-- Submission Portal -->
      <div v-if="currentUpcomingMilestone && assignedProject" class="mt-6 grid grid-cols-12 gap-4">
        <div class="col-span-8 bg-white p-5 shadow rounded">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Submit Your Work</h2>
            <div class="text-sm text-gray-500">
              Due: {{ formatDate(currentUpcomingMilestone.deadline) }}
            </div>
          </div>
  
          <!-- Submission Form -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700">{{ currentUpcomingMilestone.description }}</h3>
              </div>
              <div class="text-xs" :class="getDaysRemainingClass(currentUpcomingMilestone)">
                {{ getDaysRemainingText(currentUpcomingMilestone) }}
              </div>
            </div>
  
            <!-- File Upload Area -->
            <div 
              class="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-blue-500 transition-colors cursor-pointer"
              @click="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                @change="handleFileSelect"
                :accept="acceptedFileTypes"
              />
              
              <div v-if="!selectedFile && !uploading" class="space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-xs text-gray-600">Drag and drop your file here, or click to select</p>
                <div class="text-xs text-gray-500 flex flex-wrap gap-1 justify-center">
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">PDF</span>
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Word</span>
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">PPT</span>
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Excel</span>
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Text</span>
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">ZIP</span>
                  <span class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Images</span>
                </div>
                <p class="text-[10px] text-gray-500">Maximum file size: 10MB</p>
              </div>
              
              <div v-else-if="selectedFile && !uploading" class="text-left">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-700">{{ selectedFile.name }}</span>
                  </div>
                  <button 
                    @click.stop="removeSelectedFile"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div v-else class="text-center py-2">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p class="text-xs text-gray-600 mt-1">Uploading...</p>
              </div>
            </div>
  
            <!-- Submit Button -->
            <div class="flex justify-end space-x-2 items-center">
              <div>
                <!-- Error Message -->
                <div v-if="submissionError" class="text-red-500 text-xs">
                  {{ submissionError }}
                </div>
                <!-- Success Message -->
                <div v-if="submissionSuccess" class="text-green-500 text-xs">
                  File submitted successfully!
                </div>
              </div>
              <button
                @click="submitFile"
                :disabled="!selectedFile || uploading"
                class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ uploading ? 'Uploading...' : 'Submit' }}
              </button>
            </div>
  
            <!-- Previous Submissions -->
            <div v-if="previousSubmissions.length > 0" class="mt-4">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Previous Submissions</h3>
              <div class="space-y-1.5">
                <div 
                  v-for="submission in previousSubmissions" 
                  :key="submission.id"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-xs text-gray-700">{{ submission.fileName }}</span>
                    <span class="text-[10px] text-gray-500">{{ formatDate(submission.submittedAt) }}</span>
                  </div>
                  <a 
                    :href="submission.downloadUrl" 
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
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
  import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { getMilestones } from '@/utils/milestones'
  import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
  import { db, storage } from '@/firebase'
  import { collection, getDocs, query, limit, where, doc, getDoc, addDoc, orderBy, onSnapshot } from 'firebase/firestore'
  import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
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
      const lecturerMajors = ref([])
      const selectedMajor = ref(null)  // Will be set to first major after fetching
      
      // Assigned project data
      const assignedProject = ref(null)
      const projectLoading = ref(true)
      const projectError = ref(null)
  
      // File upload related refs
      const fileInput = ref(null)
      const selectedFile = ref(null)
      const uploading = ref(false)
      const submissionError = ref(null)
      const submissionSuccess = ref(false)
      const previousSubmissions = ref([])
      const acceptedFileTypes = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z,.png,.jpg,.jpeg'
      const unsubscribeSubmissions = ref(null)
  
      // Computed property to filter milestones based on selected major
      const filteredMilestones = computed(() => {
        if (!allMilestones.value) return []
        if (!selectedMajor.value) return []
        
        return allMilestones.value.filter(milestone => 
          milestone.major === selectedMajor.value
        )
      })

      // Watch for selectedMajor changes
      watch(selectedMajor, (newMajor) => {
        console.log('Selected major changed to:', newMajor)
      })

      // Computed property for the upcoming milestone, filtered by selected major
      const currentUpcomingMilestone = computed(() => {
        if (!filteredMilestones.value || filteredMilestones.value.length === 0) return null
        
        const now = new Date()
        const sortedMilestones = [...filteredMilestones.value].sort((a, b) => {
          const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate()
          const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate()
          return dateA - dateB
        })
        
        // Find the first upcoming milestone for the selected major
        const upcoming = sortedMilestones.find(milestone => {
          const deadlineDate = milestone.deadline instanceof Date ? 
            milestone.deadline : 
            milestone.deadline.toDate()
          return deadlineDate > now
        })
        
        // If no upcoming milestone, use the most recent one
        return upcoming || sortedMilestones[sortedMilestones.length - 1]
      })

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
          const { school, uid } = userStore.currentUser
          
          if (!school) {
            error.value = 'Missing school information'
            return
          }
          
          // Get latest academic year
          const academicYearData = await getLatestAcademicYear(school)
          
          if (!academicYearData?.yearId) {
            error.value = 'Failed to determine academic year'
            return
          }
          
          const yearId = academicYearData.yearId
  
          // Get lecturer's majors from their user document
          const lecturerRef = doc(db, 'schools', school, 'users', uid)
          const lecturerDoc = await getDoc(lecturerRef)
          
          if (!lecturerDoc.exists()) {
            error.value = 'Lecturer information not found'
            return
          }
  
          const lecturerData = lecturerDoc.data()
          const majorIds = lecturerData.major || [] // Array of majorIds
          
          // Store the lecturer's majors
          lecturerMajors.value = majorIds
          
          // Set the default selected major if not already set
          if (!selectedMajor.value && majorIds.length > 0) {
            selectedMajor.value = majorIds[0]
          }
  
          if (!majorIds.length) {
            error.value = 'No majors assigned to lecturer'
            return
          }
  
          // Fetch milestones for all majors the lecturer is responsible for
          const allMilestonesPromises = majorIds.map(async majorId => {
            try {
              // Get the majorDocId
              const majorDocId = await getMajorDocId(school, yearId, majorId)
              if (!majorDocId) return []
              
              // Get milestones for this major
              const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId)
              return majorMilestones.map(milestone => ({
                ...milestone,
                major: majorId // Add major information to each milestone
              }))
            } catch (err) {
              console.error(`Error fetching milestones for major ${majorId}:`, err)
              return []
            }
          })
  
          const milestonesArrays = await Promise.all(allMilestonesPromises)
          const combinedMilestones = milestonesArrays.flat()
  
          if (combinedMilestones.length > 0) {
            // Store all milestones
            allMilestones.value = combinedMilestones
            console.log('Milestones loaded:', combinedMilestones.length, 'Selected major:', selectedMajor.value)
          }
        } catch (err) {
          error.value = `Failed to load milestone data: ${err.message}`
          console.error('Error loading milestones:', err)
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
  
      // Function to trigger file input
      const triggerFileUpload = () => {
        fileInput.value.click()
      }
  
      // Function to handle file selection
      const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (file) {
          validateAndSetFile(file)
        }
      }
  
      // Function to handle file drop
      const handleFileDrop = (event) => {
        const file = event.dataTransfer.files[0]
        if (file) {
          validateAndSetFile(file)
        }
      }
  
      // Function to validate and set file
      const validateAndSetFile = (file) => {
        // Check file type
        const allowedTypes = [
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          // Presentations
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          // Spreadsheets
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          // Text files
          'text/plain',
          // Archives
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          // Images
          'image/png',
          'image/jpeg',
          'image/jpg'
        ]
  
        if (!allowedTypes.includes(file.type)) {
          submissionError.value = 'Invalid file type. Please upload one of the following formats: PDF, Word, PowerPoint, Excel, Text, ZIP, RAR, 7Z, or Images (PNG/JPG).'
          return
        }
  
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          submissionError.value = 'File size exceeds 10MB limit.'
          return
        }
  
        selectedFile.value = file
        submissionError.value = null
      }
  
      // Function to remove selected file
      const removeSelectedFile = () => {
        selectedFile.value = null
        fileInput.value.value = ''
      }
  
      // Function to submit file
      const submitFile = async () => {
        if (!selectedFile.value || !currentUpcomingMilestone.value || !assignedProject.value) return
  
        try {
          uploading.value = true
          submissionError.value = null
          submissionSuccess.value = false
  
          const file = selectedFile.value
          const timestamp = Date.now()
          const fileName = `${timestamp}_${file.name}`
          const filePath = `submission/${assignedProject.value.id}/${fileName}`
  
          // Upload file to Firebase Storage
          const fileRef = storageRef(storage, filePath)
          await uploadBytes(fileRef, file)
          const downloadURL = await getDownloadURL(fileRef)
  
          // Find the index of the upcoming milestone in the original milestones array
          const milestoneIndex = allMilestones.value.findIndex(m => 
            m.description === currentUpcomingMilestone.value.description && 
            m.deadline.isEqual(currentUpcomingMilestone.value.deadline)
          )
  
          // Add submission record to Firestore with milestone index
          const submissionData = {
            fileName: file.name,
            filePath,
            downloadUrl: downloadURL,
            milestoneIndex: milestoneIndex,
            milestoneDescription: currentUpcomingMilestone.value.description || '',
            submittedAt: new Date(),
            submittedBy: userStore.currentUser.uid
          }
  
          // Create the submissions collection reference
          const projectRef = doc(
            db,
            'schools',
            userStore.currentUser.school,
            'projects',
            assignedProject.value.year,
            assignedProject.value.major,
            assignedProject.value.majorDocId,
            'projectsPerYear',
            assignedProject.value.id
          )
  
          // First, ensure the project document exists
          const projectDoc = await getDoc(projectRef)
          if (!projectDoc.exists()) {
            throw new Error('Project document not found')
          }
  
          // Create the submissions collection reference
          const submissionsRef = collection(projectRef, 'submissions')
  
          // Add the submission document
          const submissionRef = await addDoc(submissionsRef, submissionData)
  
          // Reset form and fetch updated submissions
          selectedFile.value = null
          fileInput.value.value = ''
          submissionSuccess.value = true
          await fetchPreviousSubmissions()
  
        } catch (error) {
          console.error('Error in submission process:', error)
          // More detailed error message based on the error type
          if (error.code === 'permission-denied') {
            submissionError.value = 'Permission denied. Please check if you have access to submit files.'
          } else if (error.message === 'Project document not found') {
            submissionError.value = 'Could not find the project to submit to. Please refresh and try again.'
          } else {
            submissionError.value = `Failed to submit file: ${error.message}`
          }
          
          // If the file was uploaded but Firestore failed, we should clean up the uploaded file
          if (selectedFile.value) {
            try {
              const timestamp = Date.now()
              const fileName = `${timestamp}_${selectedFile.value.name}`
              const filePath = `submission/${assignedProject.value.id}/${fileName}`
              const fileRef = storageRef(storage, filePath)
              await deleteObject(fileRef)
              console.log('Cleaned up orphaned file from storage')
            } catch (cleanupError) {
              console.error('Failed to clean up orphaned file:', cleanupError)
            }
          }
        } finally {
          uploading.value = false
        }
      }
  
      // Function to fetch previous submissions
      const fetchPreviousSubmissions = async () => {
        if (!assignedProject.value) return
  
        try {
          // Clean up existing listener if any
          if (unsubscribeSubmissions.value) {
            unsubscribeSubmissions.value()
          }
  
          const submissionsRef = collection(
            db,
            'schools',
            userStore.currentUser.school,
            'projects',
            assignedProject.value.year,
            assignedProject.value.major,
            assignedProject.value.majorDocId,
            'projectsPerYear',
            assignedProject.value.id,
            'submissions'
          )
  
          // Set up real-time listener
          const q = query(
            submissionsRef,
            where('submittedBy', '==', userStore.currentUser.uid)
          )
  
          unsubscribeSubmissions.value = onSnapshot(q, (snapshot) => {
            previousSubmissions.value = snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate())
          }, (error) => {
            console.error('Error in submissions listener:', error)
          })
  
        } catch (error) {
          console.error('Error setting up submissions listener:', error)
        }
      }
  
      // Add watcher for assignedProject
      watch(assignedProject, (newProject) => {
        if (newProject) {
          fetchPreviousSubmissions()
        } else {
          // Clean up listener when project becomes null
          if (unsubscribeSubmissions.value) {
            unsubscribeSubmissions.value()
            unsubscribeSubmissions.value = null
          }
          previousSubmissions.value = []
        }
      })
  
      // Fetch data when component is mounted
      onMounted(() => {
        if (userStore.initialized) {
          fetchUpcomingMilestone()
          fetchAssignedProject()
        } else {
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
        openProjectDetailsWindow,
        fileInput,
        selectedFile,
        uploading,
        submissionError,
        submissionSuccess,
        previousSubmissions,
        acceptedFileTypes,
        triggerFileUpload,
        handleFileSelect,
        handleFileDrop,
        removeSelectedFile,
        submitFile,
        lecturerMajors,
        selectedMajor,
        currentUpcomingMilestone,
        filteredMilestones
      }
    }
  }
  </script>
  
  <style scoped>
  /* Dashboard styles imported from assets/styles/dashboard.css */
  </style>
    
    