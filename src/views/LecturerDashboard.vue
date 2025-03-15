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
            <h2 class="text-sm font-medium text-gray-500 mb-2">Your Projects Overview</h2>
          </div>
          
          <div v-if="projectLoading" class="py-4">
            <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
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
        
        <!-- Submission Info Card -->
        <div class="col-span-12 bg-white p-4 shadow rounded mt-4 relative">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-sm font-medium text-gray-500">Milestone Submissions</h2>
            
            <!-- Major Selector Tabs -->
            <div class="flex space-x-2">
              <button
                v-for="major in lecturerMajors"
                :key="major"
                @click="selectedSubmissionMajor = major"
                class="px-3 py-1 text-xs rounded-full transition-colors"
                :class="selectedSubmissionMajor === major ? 
                  'bg-blue-100 text-blue-800 font-medium' : 
                  'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              >
                {{ major }}
              </button>
            </div>
          </div>
          
          <div v-if="submissionLoading" class="py-4">
            <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
          
          <div v-else-if="submissionError" class="py-4">
            <p class="text-red-500">{{ submissionError }}</p>
          </div>
          
          <div v-else-if="currentMilestoneSubmissionStats" class="py-2">
            <div class="relative">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></div>
              
              <div class="pl-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">
                  {{ currentMilestoneSubmissionStats.milestoneName }} Submissions
                </h3>
                
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <!-- Total Assigned Projects -->
                  <div class="bg-blue-50 p-3 rounded-lg text-center">
                    <p class="text-2xl font-bold text-blue-700">{{ currentMilestoneSubmissionStats.totalAssigned }}</p>
                    <p class="text-sm text-blue-600">Assigned Projects</p>
                  </div>
                  
                  <!-- Projects with Submissions -->
                  <div class="bg-green-50 p-3 rounded-lg text-center">
                    <p class="text-2xl font-bold text-green-700">{{ currentMilestoneSubmissionStats.projectsWithSubmissions }}</p>
                    <p class="text-sm text-green-600">With Submissions</p>
                  </div>
                  
                  <!-- Projects without Submissions -->
                  <div class="bg-amber-50 p-3 rounded-lg text-center">
                    <p class="text-2xl font-bold text-amber-700">{{ currentMilestoneSubmissionStats.projectsWithoutSubmissions }}</p>
                    <p class="text-sm text-amber-600">Without Submissions</p>
                  </div>
                </div>
                
                <!-- Submission Rate -->
                <div class="mt-2">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-700">Submission Rate</span>
                    <span class="text-sm font-medium text-gray-700">
                      {{ currentMilestoneSubmissionStats.projectsWithSubmissions }}/{{ currentMilestoneSubmissionStats.totalAssigned }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      class="bg-purple-600 h-2.5 rounded-full" 
                      :style="`width: ${currentMilestoneSubmissionStats.submissionRate}%`"
                    ></div>
                  </div>
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
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed, watch } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { getMilestones } from '@/utils/milestones'
  import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
  import { db } from '@/firebase'
  import { collection, getDocs, query, limit, where, doc, getDoc } from 'firebase/firestore'
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

      // Watch for selectedSubmissionMajor changes
      watch(selectedSubmissionMajor, (newMajor) => {
        console.log('Selected submission major changed to:', newMajor)
        if (newMajor) {
          fetchSubmissionStats(newMajor)
        }
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
          
          // Get all projects created by this lecturer across all their majors
          let totalProjects = 0;
          let assignedProjects = 0;
          
          console.log('Lecturer majors:', lecturerMajors.value)
          
          // For each major the lecturer is responsible for
          for (const majorId of lecturerMajors.value) {
            try {
              // Get the majorDocId
              const majorDocId = await getMajorDocId(school, yearId, majorId);
              console.log(`Major ${majorId} docId:`, majorDocId)
              if (!majorDocId) continue;
              
              // Query projects created by this lecturer
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
              
              const projectsSnapshot = await getDocs(projectsQuery);
              console.log(`Found ${projectsSnapshot.size} projects for major ${majorId}`)
              
              // Count total and assigned projects
              projectsSnapshot.forEach(doc => {
                totalProjects++;
                const projectData = doc.data();
                // Check if project is assigned (has an assignedTo field)
                if (projectData.assignedTo) {
                  assignedProjects++;
                }
              });
            } catch (err) {
              console.error(`Error fetching projects for major ${majorId}:`, err);
            }
          }
          
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
  
      // Function to fetch the upcoming milestone
      const fetchUpcomingMilestone = async () => {
        console.log('Starting fetchUpcomingMilestone')
        loading.value = true
        error.value = null

        try {
          // Check if user is authenticated and has necessary data
          if (!userStore.isAuthenticated || !userStore.currentUser) {
            console.log('User not authenticated in fetchUpcomingMilestone')
            error.value = 'User not authenticated'
            return
          }

          // Get user data
          const { school, uid } = userStore.currentUser
          console.log('User data in fetchUpcomingMilestone:', { school, uid })
          
          if (!school) {
            console.log('Missing school information in fetchUpcomingMilestone')
            error.value = 'Missing school information'
            return
          }
          
          // Get latest academic year
          const academicYearData = await getLatestAcademicYear(school)
          console.log('Academic year data in fetchUpcomingMilestone:', academicYearData)
          
          if (!academicYearData?.yearId) {
            console.log('Failed to determine academic year in fetchUpcomingMilestone')
            error.value = 'Failed to determine academic year'
            return
          }
          
          const yearId = academicYearData.yearId

          // Get lecturer's majors from their user document
          const lecturerRef = doc(db, 'schools', school, 'users', uid)
          const lecturerDoc = await getDoc(lecturerRef)
          
          if (!lecturerDoc.exists()) {
            console.log('Lecturer information not found')
            error.value = 'Lecturer information not found'
            return
          }

          const lecturerData = lecturerDoc.data()
          console.log('Lecturer data:', lecturerData)
          const majorIds = lecturerData.major || [] // Array of majorIds
          
          // Store the lecturer's majors
          lecturerMajors.value = majorIds
          console.log('Set lecturer majors:', lecturerMajors.value)
          
          // Set the default selected major if not already set
          if (!selectedMajor.value && majorIds.length > 0) {
            selectedMajor.value = majorIds[0]
            console.log('Set default selected major:', selectedMajor.value)
          }

          if (!majorIds.length) {
            console.log('No majors assigned to lecturer')
            error.value = 'No majors assigned to lecturer'
            return
          }

          // Fetch milestones for all majors the lecturer is responsible for
          const allMilestonesPromises = majorIds.map(async majorId => {
            try {
              // Get the majorDocId
              const majorDocId = await getMajorDocId(school, yearId, majorId)
              console.log(`Major ${majorId} docId in fetchUpcomingMilestone:`, majorDocId)
              if (!majorDocId) return []
              
              // Get milestones for this major
              const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId)
              console.log(`Found ${majorMilestones.length} milestones for major ${majorId}`)
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
          } else {
            console.log('No milestones found')
          }
          
          // After fetching milestones, fetch lecturer projects
          console.log('Calling fetchLecturerProjects from fetchUpcomingMilestone')
          await fetchLecturerProjects()
          
        } catch (err) {
          console.error('Error in fetchUpcomingMilestone:', err)
          error.value = `Failed to load milestone data: ${err.message}`
          console.error('Error loading milestones:', err)
        } finally {
          loading.value = false
          console.log('fetchUpcomingMilestone completed')
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
  
      // Function to fetch submission statistics for the current milestone
      const fetchSubmissionStats = async (majorId) => {
        console.log('Starting fetchSubmissionStats for major:', majorId)
        submissionLoading.value = true
        submissionError.value = null
        // Reset current stats when changing majors
        currentMilestoneSubmissionStats.value = null
        
        try {
          // Check if user is authenticated and has necessary data
          if (!userStore.isAuthenticated || !userStore.currentUser) {
            console.log('User not authenticated in fetchSubmissionStats')
            submissionError.value = 'User not authenticated'
            return
          }
          
          // Get user data
          const { school, uid } = userStore.currentUser
          console.log('User data in fetchSubmissionStats:', { school, uid })
          
          if (!school) {
            console.log('Missing school information in fetchSubmissionStats')
            submissionError.value = 'Missing school information'
            return
          }
          
          // Get latest academic year
          const academicYearData = await getLatestAcademicYear(school)
          console.log('Academic year data in fetchSubmissionStats:', academicYearData)
          
          if (!academicYearData?.yearId) {
            console.log('Failed to determine academic year in fetchSubmissionStats')
            submissionError.value = 'Failed to determine academic year'
            return
          }
          
          const yearId = academicYearData.yearId
          
          // Get the majorDocId
          const majorDocId = await getMajorDocId(school, yearId, majorId)
          console.log(`Major ${majorId} docId in fetchSubmissionStats:`, majorDocId)
          
          if (!majorDocId) {
            console.log('Major document not found')
            submissionError.value = 'Major document not found'
            return
          }
          
          // Get the current milestone for this major
          const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId)
          console.log(`Found ${majorMilestones.length} milestones for major ${majorId}`)
          
          if (!majorMilestones || majorMilestones.length === 0) {
            console.log('No milestones found for this major')
            submissionError.value = 'No milestones found for this major'
            return
          }
          
          // Find the current milestone (same logic as currentUpcomingMilestone computed property)
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
            console.log('No current milestone found')
            submissionError.value = 'No current milestone found'
            return
          }
          
          console.log('Current milestone:', currentMilestone)
          
          // Find the index of the current milestone in the array
          const milestoneIndex = majorMilestones.findIndex(m => 
            m.deadline instanceof Date ? 
              m.deadline.getTime() === currentMilestone.deadline.getTime() : 
              m.deadline.toDate().getTime() === currentMilestone.deadline.toDate().getTime()
          )
          
          console.log('Current milestone index:', milestoneIndex)
          
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
          console.log(`Found ${projectsSnapshot.size} projects for major ${majorId}`)
          
          // Count assigned projects and projects with submissions
          let totalAssigned = 0
          let projectsWithSubmissions = 0
          
          // Process each project
          const projectPromises = projectsSnapshot.docs.map(async (projectDoc) => {
            const projectData = projectDoc.data()
            
            // Check if project is assigned
            if (projectData.assignedTo) {
              totalAssigned++
              console.log(`Checking submissions for project ${projectDoc.id}, assigned to ${projectData.assignedTo}`)
              
              // Check for submissions for this milestone by index only
              const submissionsRef = collection(projectDoc.ref, 'submissions')
              const submissionsQuery = query(
                submissionsRef,
                where('milestoneIndex', '==', milestoneIndex)
              )
              
              const submissionsSnapshot = await getDocs(submissionsQuery)
              console.log(`Found ${submissionsSnapshot.size} submissions for project ${projectDoc.id} at milestone index ${milestoneIndex}`)
              
              if (!submissionsSnapshot.empty) {
                projectsWithSubmissions++
              }
            }
          })
          
          // Wait for all project checks to complete
          await Promise.all(projectPromises)
          
          // Calculate submission rate
          const submissionRate = totalAssigned > 0 ? 
            Math.round((projectsWithSubmissions / totalAssigned) * 100) : 0
          
          // Store the results
          currentMilestoneSubmissionStats.value = {
            milestoneName: currentMilestone.description,
            milestoneIndex: milestoneIndex,
            totalAssigned: totalAssigned,
            projectsWithSubmissions: projectsWithSubmissions,
            projectsWithoutSubmissions: totalAssigned - projectsWithSubmissions,
            submissionRate: submissionRate
          }
          
          console.log('Submission stats:', currentMilestoneSubmissionStats.value)
          
        } catch (err) {
          console.error('Error in fetchSubmissionStats:', err)
          submissionError.value = `Failed to load submission data: ${err.message}`
        } finally {
          submissionLoading.value = false
        }
      }
  
      // Fetch data when component is mounted
      onMounted(() => {
        console.log('LecturerDashboard mounted')
        if (userStore.initialized) {
          console.log('UserStore already initialized')
          fetchUpcomingMilestone()
        } else {
          console.log('Initializing UserStore')
          userStore.initializeAuth().then(() => {
            console.log('UserStore initialized, fetching milestone')
            fetchUpcomingMilestone()
          }).catch(err => {
            console.error('Failed to initialize user data:', err)
            error.value = 'Failed to initialize user data'
            loading.value = false
            projectLoading.value = false
            submissionLoading.value = false
          })
        }
      })
  
      // Watch for changes in lecturerMajors to set default selectedSubmissionMajor
      watch(lecturerMajors, (newMajors) => {
        if (newMajors && newMajors.length > 0 && !selectedSubmissionMajor.value) {
          selectedSubmissionMajor.value = newMajors[0]
          fetchSubmissionStats(selectedSubmissionMajor.value)
        }
      }, { immediate: true })
  
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
        currentMilestoneSubmissionStats
      }
    }
  }
  </script>
  
  <style scoped>
  /* Dashboard styles imported from assets/styles/dashboard.css */
  </style>
    
    