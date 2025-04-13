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
          
          <div class="grid grid-cols-2 gap-4">
            <!-- Creator Projects Indicator -->
            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-2">Projects Supervised</h3>
              <div v-if="submissionLoading" class="animate-pulse">
                <!-- Existing loading skeleton -->
              </div>
              <div v-else-if="submissionError" class="py-3">
                <p class="text-red-500">{{ submissionError }}</p>
              </div>
              <div v-else-if="currentMilestoneSubmissionStats" class="py-1">
                <div class="relative">
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
                  <div class="pl-4">
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
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#22C55E"
                            stroke-width="8"
                            stroke-linecap="round"
                            :stroke-dasharray="`${currentMilestoneSubmissionStats.submissionRate * 2.83} 283`"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-2xl font-bold text-gray-800">
                            {{ currentMilestoneSubmissionStats.projectsWithSubmissions }}/{{ currentMilestoneSubmissionStats.totalAssigned }}
                          </span>
                        </div>
                      </div>
                      <p class="mt-3 text-center text-sm text-gray-600">
                        {{ currentMilestoneSubmissionStats.projectsWithSubmissions }} out of {{ currentMilestoneSubmissionStats.totalAssigned }} 
                        {{ currentMilestoneSubmissionStats.totalAssigned === 1 ? 'project has' : 'projects have' }} submissions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Examiner Projects Indicator -->
            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-2">Projects Examined</h3>
              <div v-if="examinerSubmissionLoading" class="animate-pulse">
                <!-- Skeleton loading UI -->
                <div class="relative pl-4">
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
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
              <div v-else-if="examinerSubmissionError" class="py-3">
                <p class="text-red-500">{{ examinerSubmissionError }}</p>
              </div>
              <div v-else-if="examinerSubmissionStats" class="py-1">
                <div class="relative">
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></div>
                  <div class="pl-4">
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
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#9333EA"
                            stroke-width="8"
                            stroke-linecap="round"
                            :stroke-dasharray="`${examinerSubmissionStats.submissionRate * 2.83} 283`"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-2xl font-bold text-gray-800">
                            {{ examinerSubmissionStats.projectsWithSubmissions }}/{{ examinerSubmissionStats.totalAssigned }}
                          </span>
                        </div>
                      </div>
                      <p class="mt-3 text-center text-sm text-gray-600">
                        {{ examinerSubmissionStats.projectsWithSubmissions }} out of {{ examinerSubmissionStats.totalAssigned }} 
                        {{ examinerSubmissionStats.totalAssigned === 1 ? 'project has' : 'projects have' }} submissions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="col-span-6">
        <!-- Project Cards Container -->
        <div class="grid grid-cols-12 gap-4">
          <!-- Assigned Project Card -->
          <div class="col-span-8 bg-white p-4 shadow rounded relative h-[195px]">
            <div class="flex justify-between items-start">
              <h2 class="text-sm font-medium text-gray-500 mb-2">Your Projects Overview</h2>
            </div>
            
            <div v-if="projectLoading" class="animate-pulse">
              <!-- Project Stats Skeleton -->
              <div class="relative pl-4">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <!-- Stats Grid Skeleton -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
                  <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
                  </div>
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
                  <div class="grid grid-cols-2 gap-4 mb-3">
                    <!-- Assigned Projects -->
                    <div class="bg-green-50 p-2.5 rounded-lg text-center">
                      <p class="text-2xl font-bold text-green-700">{{ lecturerProjectStats.assigned }}</p>
                      <p class="text-sm text-green-600">Supervised</p>
                    </div>
                    
                    <!-- Unassigned Projects -->
                    <div class="bg-amber-50 p-2.5 rounded-lg text-center">
                      <p class="text-2xl font-bold text-amber-700">{{ lecturerProjectStats.unassigned }}</p>
                      <p class="text-sm text-amber-600">Unassigned</p>
                    </div>
                  </div>
                  
                  <!-- Assignment Rate Progress Bar -->
                  <div class="mt-3">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm font-medium text-gray-700">Assignment Rate</span>
                      <span class="text-sm font-medium text-gray-700">{{ lecturerProjectStats.assignmentRate }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        :style="`width: ${lecturerProjectStats.assignmentRate}%`"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Examined Projects Card -->
          <div class="col-span-4 bg-white p-4 shadow rounded relative h-[195px]">
            <div class="relative h-full flex flex-col items-center justify-center">
              <div v-if="examinedProjectsLoading" class="text-center animate-pulse">
                <div class="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div class="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
              <div v-else-if="examinedProjectsError" class="text-center text-red-500">
                <p>{{ examinedProjectsError }}</p>
              </div>
              <div v-else class="text-center">
                <p class="text-5xl font-bold mb-3" style="color: #c75284">{{ examinedProjectsCount }}</p>
                <p class="text-sm" style="color: #c3447a">Examined Projects</p>
              </div>
            </div>
          </div>
        </div>

          <!-- Feedback Overview Card -->
          <div class="bg-white p-4 shadow rounded relative mt-4 h-[280px]">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-sm font-medium text-gray-500">Feedback Overview</h2>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <!-- Supervisor Feedback Indicator -->
              <div>
                <h3 class="text-sm font-medium text-gray-600 mb-2">As Supervisor</h3>
                <div v-if="supervisorFeedbackLoading" class="animate-pulse">
                  <!-- Skeleton loading UI -->
                  <div class="relative pl-4">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
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
                <div v-else-if="supervisorFeedbackError" class="py-3">
                  <p class="text-red-500">{{ supervisorFeedbackError }}</p>
                </div>
                <div v-else class="relative">
                  <div class="absolute left-0 top-0 bottom-3 w-1 bg-blue-500 rounded-full"></div>
                  <div class="pl-4">
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
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#3B82F6"
                            stroke-width="8"
                            stroke-linecap="round"
                            :stroke-dasharray="`${supervisorFeedbackStats?.reviewRate * 2.83 || 0} 283`"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-2xl font-bold text-gray-800">
                            {{ supervisorFeedbackStats?.reviewedSubmissions || 0 }}/{{ supervisorFeedbackStats?.totalSubmissions || 0 }}
                          </span>
                        </div>
                      </div>
                      <p class="mt-3 text-center text-sm text-gray-600">
                        {{ supervisorFeedbackStats?.reviewedSubmissions || 0 }} out of {{ supervisorFeedbackStats?.totalSubmissions || 0 }}
                        {{ (supervisorFeedbackStats?.totalSubmissions || 0) === 1 ? 'submission has' : 'submissions have' }} been reviewed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Examiner Feedback Indicator -->
              <div>
                <h3 class="text-sm font-medium text-gray-600 mb-2">As Examiner</h3>
                <div v-if="examinerFeedbackLoading" class="animate-pulse">
                  <!-- Skeleton loading UI -->
                  <div class="relative pl-4">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
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
                <div v-else-if="examinerFeedbackError" class="py-3">
                  <p class="text-red-500">{{ examinerFeedbackError }}</p>
                </div>
                <div v-else class="relative">
                  <div class="absolute left-0 top-0 bottom-3 w-1 bg-indigo-500 rounded-full"></div>
                  <div class="pl-4">
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
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#6366F1"
                            stroke-width="8"
                            stroke-linecap="round"
                            :stroke-dasharray="`${examinerFeedbackStats?.reviewRate * 2.83 || 0} 283`"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-2xl font-bold text-gray-800">
                            {{ examinerFeedbackStats?.reviewedSubmissions || 0 }}/{{ examinerFeedbackStats?.totalSubmissions || 0 }}
                          </span>
                        </div>
                      </div>
                      <p class="mt-3 text-center text-sm text-gray-600">
                        {{ examinerFeedbackStats?.reviewedSubmissions || 0 }} out of {{ examinerFeedbackStats?.totalSubmissions || 0 }}
                        {{ (examinerFeedbackStats?.totalSubmissions || 0) === 1 ? 'submission has' : 'submissions have' }} been reviewed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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

    // Cache timeout in milliseconds (30 minutes)
    const CACHE_TIMEOUT = 30 * 60 * 1000

    // Add timestamps for last data fetch operations
    const lastFetchTimes = ref({
      milestones: 0,
      submissions: 0,
      projects: 0,
      examined: 0,
      feedback: 0,
      examinerFeedback: 0
    })

    // Add these refs after the other refs in the setup function
    const examinedProjectsLoading = ref(true)
    const examinedProjectsError = ref(null)
    const examinedProjectsCount = ref(0)
    const examinedProjectsUnsubscribers = ref([])

    // Add new state for examiner submissions
    const examinerSubmissionStats = ref(null)
    const examinerSubmissionLoading = ref(true)
    const examinerSubmissionError = ref(null)
    const examinerSubmissionStatsCache = ref({})

    // Add feedback tracking state variables
    const supervisorFeedbackLoading = ref(true)
    const supervisorFeedbackError = ref(null)
    const supervisorFeedbackStats = ref(null)
    const examinerFeedbackLoading = ref(true)
    const examinerFeedbackError = ref(null)
    const examinerFeedbackStats = ref(null)
    const feedbackUnsubscribers = ref({
      supervisor: null,
      examiner: null
    })

    // Add a flag to track initial load
    const initialLoadDone = ref(false)

    // Add unsubscriber arrays for real-time listeners
    const supervisorSubmissionUnsubscribers = ref([])
    const examinerSubmissionUnsubscribers = ref([])

    // Modify storeMilestoneData to include a last changed timestamp
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
        
        // Get existing data to check last substantive change
        const existingData = localStorage.getItem(userMajorKey);
        const timestamp = Date.now();
        
        let lastChanged = timestamp;
        if (existingData) {
          try {
            const parsed = JSON.parse(existingData);
            // Keep the last substantive change timestamp if it exists
            lastChanged = parsed.lastChanged || timestamp;
          } catch (e) {
            // Error parsing existing milestone data
          }
        }
        
        localStorage.setItem(userMajorKey, JSON.stringify({
          upcomingMilestone,
          allMilestones: majorMilestones,
          lastUpdated: timestamp,
          lastChanged: lastChanged
        }));
      } catch (err) {
        // Error storing milestone data
      }
    }

    // Function to get cached milestones
    const getCachedMilestones = (majorId) => {
      try {
        if (!userStore.currentUser?.uid || !majorId) return null;
        
        const userMajorKey = `${userStore.currentUser.uid}_${majorId}_milestones`;
        const cached = localStorage.getItem(userMajorKey);
        
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        
        // Check if cache is still valid
        if (Date.now() - data.lastUpdated < CACHE_TIMEOUT) {
          return data.allMilestones;
        }
        
        return null;
      } catch (err) {
        return null;
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
        if (!school || !yearId || !majorId) return;

        // If majorDocId is not provided, try to fetch it
        if (!majorDocId) {
          try {
            majorDocId = await getMajorDocId(school, yearId, majorId);
            if (!majorDocId) return;
          } catch (err) {
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
          if (!docSnapshot.exists()) return;

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

            // Check if data has actually changed before updating store and cache
            const currentMilestones = allMilestones.value[majorId] || []
            
            // Compare milestones to see if they've changed
            const hasChanged = !areMilestonesEqual(currentMilestones, updatedMilestones)
            
            if (hasChanged) {
              // Update state
              allMilestones.value = {
                ...allMilestones.value,
                [majorId]: updatedMilestones
              }
              
              // Only update cache if data has changed
              storeMilestoneData(majorId, updatedMilestones)
            }
          }, 100) // 100ms debounce
        }, (err) => {
          error.value = `Error receiving milestone updates: ${err.message}`
        })

        // Store the unsubscribe function
        milestoneUnsubscribers.value.push(unsubscribe)
      } catch (err) {
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

    // Watch for changes in selectedMajor that handles both initial load and subsequent changes
    watch(selectedMajor, async (newMajor) => {
      if (!newMajor) return;
      
      // Update selectedSubmissionMajor to match the selected major
      selectedSubmissionMajor.value = newMajor;
      
      // Fetch both types of submission stats
      await Promise.all([
        fetchSubmissionStats(newMajor, false, true),
        fetchExaminerSubmissionStats(newMajor, false, true)
      ]);
    });

    // Computed property to filter out the current milestone from the list
    const otherMilestones = computed(() => {
      if (!filteredMilestones.value || !currentUpcomingMilestone.value) return []
      
      return filteredMilestones.value.filter(milestone => 
        milestone.description !== currentUpcomingMilestone.value.description ||
        milestone.major !== currentUpcomingMilestone.value.major
      )
    })

    // Function to toggle showing all milestones - optimized
    const toggleAllMilestones = (event) => {
      // Prevent event bubbling
      if (event) event.stopPropagation();
      showAllMilestones.value = !showAllMilestones.value;
    }

    // Function to check if a milestone is in the past
    const isMilestonePast = (milestone) => {
      if (!milestone || !milestone.deadline) return false;
      
      // Safely convert deadline to Date object
      const deadlineDate = getDateFromDeadline(milestone.deadline);
      
      return new Date() > deadlineDate;
    };
    
    // Helper function to safely convert various deadline formats to Date
    const getDateFromDeadline = (deadline) => {
      if (!deadline) return new Date();
      
      // If already a Date object
      if (deadline instanceof Date) return deadline;
      
      // If it's a Firestore Timestamp with toDate method
      if (deadline.toDate && typeof deadline.toDate === 'function') {
        return deadline.toDate();
      }
      
      // If it's an ISO string or timestamp number
      try {
        return new Date(deadline);
      } catch {
        return new Date();
      }
    };
    
    // Function to calculate days remaining until deadline
    const getDaysRemaining = (milestone) => {
      if (!milestone || !milestone.deadline) return 0;
      
      // Safely convert deadline to Date object
      const deadlineDate = getDateFromDeadline(milestone.deadline);
      const now = new Date();
      
      // If deadline has passed, return 0
      if (now > deadlineDate) return 0;
      
      // Calculate days remaining
      const diffTime = Math.abs(deadlineDate - now);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    };
    
    // Function to get percentage for progress bar
    const getDaysRemainingPercentage = (milestone) => {
      const daysRemaining = getDaysRemaining(milestone);
      
      // If less than 30 days remaining, show percentage based on days left
      // 30 days = 100%, 0 days = 0%
      if (daysRemaining <= 30) {
        return (daysRemaining / 30) * 100;
      }
      
      return 100; // If more than 30 days, show full bar
    };
    
    // Function to get text for days remaining
    const getDaysRemainingText = (milestone) => {
      const days = getDaysRemaining(milestone);
      
      if (days === 0) {
        return 'Due today';
      } else if (days === 1) {
        return '1 day left';
      } else {
        return `${days} days left`;
      }
    };
    
    // Function to get class for days remaining text
    const getDaysRemainingClass = (milestone) => {
      const days = getDaysRemaining(milestone);
      
      if (days < 3) {
        return 'text-red-600';
      } else if (days < 7) {
        return 'text-orange-500';
      } else {
        return 'text-green-600';
      }
    };

    // Function to get the majorDocId for a specific major
    const getMajorDocId = async (schoolId, yearId, majorId) => {
      try {
        const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', yearId, majorId);
        const majorDocsQuery = query(majorCollectionRef, limit(1));
        const majorDocsSnapshot = await getDocs(majorDocsQuery);
        
        if (majorDocsSnapshot.empty) return null;
        
        // Get the first (and likely only) document ID
        return majorDocsSnapshot.docs[0].id;
      } catch {
        return null;
      }
    };

    // Format date for display - optimized
    const formatDate = (date) => {
      if (!date) return '';
      
      try {
        // Convert from timestamp if needed using our helper
        const dateObj = getDateFromDeadline(date);
        
        return dateObj.toLocaleString('en-US', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        });
      } catch {
        return 'Invalid date';
      }
    };

    // Add a function to clear the cache if needed
    const clearSubmissionStatsCache = () => {
      submissionStatsCache.value = {};
    };

    // Function to fetch lecturer projects and count assigned/unassigned
    const fetchLecturerProjects = async (force = false) => {
      // Skip if recently loaded (within 10 seconds) unless forced
      const now = Date.now();
      if (!force && now - lastFetchTimes.value.projects < 10000) return;
      
      // Only show loading if no data is currently available
      if (!lecturerProjectStats.value.total) {
        projectLoading.value = true;
      }
      projectError.value = null;

      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          projectError.value = 'User not authenticated';
          return;
        }

        // Get user data
        const { school, uid } = userStore.currentUser;
        
        if (!school) {
          projectError.value = 'Missing school information';
          return;
        }
        
        // Get latest academic year
        const academicYearData = await getLatestAcademicYear(school);
        
        if (!academicYearData?.yearId) {
          projectError.value = 'Failed to determine academic year';
          return;
        }
        
        const yearId = academicYearData.yearId;
        
        // Check if we have lecturer majors
        if (!lecturerMajors.value || lecturerMajors.value.length === 0) {
          projectError.value = 'No majors assigned to lecturer';
          return;
        }
        
        // Create an array to store all major document ID fetch promises
        const majorDocIdPromises = lecturerMajors.value.map(majorId => 
          getMajorDocId(school, yearId, majorId)
        );
        
        // Fetch all major document IDs in parallel
        const majorDocIds = await Promise.all(majorDocIdPromises);
        
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
          const { snapshot } = result;
          
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
          assignmentRate: totalProjects > 0 ? Math.round((assignedProjects / totalProjects) * 100) : 0,
          timestamp: Date.now() // Add timestamp for cache invalidation
        };
        
        // Update last fetch time
        lastFetchTimes.value.projects = now;
        
      } catch (err) {
        projectError.value = `Failed to load project data: ${err.message}`;
      } finally {
        projectLoading.value = false;
      }
    };

    // Function to fetch just the lecturer majors - this is a prerequisite for other data
    const fetchLecturerMajors = async () => {
      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          error.value = 'User not authenticated';
          return;
        }

        const { school, major } = userStore.currentUser;
        
        if (!major || !Array.isArray(major) || major.length === 0) {
          error.value = 'No majors assigned to lecturer';
          return;
        }

        // Get latest academic year
        const academicYearData = await getLatestAcademicYear(school);
        if (!academicYearData?.yearId) {
          error.value = 'Failed to determine academic year';
          return;
        }

        // Get the academic year document which contains the majors array
        const yearDocRef = doc(db, 'schools', school, 'projects', academicYearData.yearId);
        const yearDocSnapshot = await getDoc(yearDocRef);

        if (!yearDocSnapshot.exists() || !yearDocSnapshot.data().majors) {
          error.value = 'No majors found in current academic year';
          return;
        }

        // Get the list of majors available in the current academic year
        const currentYearMajors = yearDocSnapshot.data().majors;

        // Filter lecturer's majors to only include those in the current academic year
        const filteredMajors = major.filter(m => currentYearMajors.includes(m));
        
        // Store the filtered lecturer's majors
        lecturerMajors.value = filteredMajors;
        
        // Set the default selected major if not already set
        if (!selectedMajor.value && filteredMajors.length > 0) {
          selectedMajor.value = filteredMajors[0];
          selectedSubmissionMajor.value = filteredMajors[0];
        }
        
        return filteredMajors;
      } catch (err) {
        error.value = `Failed to load lecturer majors: ${err.message}`;
        throw err;
      }
    };
    
    // Optimize fetchMilestonesData to avoid unnecessary refreshes
    const fetchMilestonesData = async (force = false) => {
      // Skip if recently loaded (within 10 seconds) unless forced
      const now = Date.now();
      if (!force && now - lastFetchTimes.value.milestones < 10000) return;
      
      loading.value = true

      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          error.value = 'User not authenticated';
          return;
        }

        const { school } = userStore.currentUser;

        if (!school) {
          error.value = 'Missing school information';
          return;
        }

        const academicYearData = await getLatestAcademicYear(school);

        if (!academicYearData?.yearId) {
          error.value = 'Failed to determine academic year';
          return;
        }

        const yearId = academicYearData.yearId;

        if (!lecturerMajors.value || lecturerMajors.value.length === 0) {
          error.value = 'No majors assigned to lecturer';
          return;
        }

        // Clear existing listeners
        milestoneUnsubscribers.value.forEach(unsubscribe => unsubscribe());
        milestoneUnsubscribers.value = [];

        // First, handle the primary major (selected or first major)
        const primaryMajor = selectedMajor.value || lecturerMajors.value[0];

        // Try to get cached data for primary major
        const cachedPrimaryData = getCachedMilestones(primaryMajor);
        if (cachedPrimaryData) {
          allMilestones.value = {
            [primaryMajor]: cachedPrimaryData
          };
        }

        // Get majorDocId for primary major
        const primaryMajorDocId = await getMajorDocId(school, yearId, primaryMajor);
        if (primaryMajorDocId) {
          await setupMilestoneListener(school, yearId, primaryMajor, primaryMajorDocId);
        }

        // After primary major is loaded, load others in background
        const otherMajors = lecturerMajors.value.filter(majorId => majorId !== primaryMajor);

        // Load other majors in background with limited concurrency
        const loadMajorsConcurrently = async (majors, concurrency = 2) => {
          const chunks = [];
          for (let i = 0; i < majors.length; i += concurrency) {
            chunks.push(majors.slice(i, i + concurrency));
          }
          
          for (const chunk of chunks) {
            await Promise.all(chunk.map(async majorId => {
              try {
                const majorDocId = await getMajorDocId(school, yearId, majorId);
                if (majorDocId) {
                  setupMilestoneListener(school, yearId, majorId, majorDocId);
                }
              } catch (err) {
                // Error ignored
              }
            }));
          }
        };
        
        // Load other majors with controlled concurrency
        setTimeout(() => {
          loadMajorsConcurrently(otherMajors);
        }, 100);

        // Update last fetch time
        lastFetchTimes.value.milestones = now;
      } catch (err) {
        error.value = `Failed to load milestone data: ${err.message}`;
      } finally {
        loading.value = false;
      }
    }

    // Function to pre-load submission statistics for all majors
    const preloadAllSubmissionStats = async () => {
      if (!lecturerMajors.value || lecturerMajors.value.length === 0) return;
      
      // Create an array of promises to fetch stats for all majors EXCEPT the currently selected one
      const fetchPromises = lecturerMajors.value
        .filter(majorId => majorId !== selectedMajor.value) // Skip the currently displayed major
        .map(majorId => {
          // Only fetch if not already in cache
          if (!submissionStatsCache.value[majorId]) {
            return fetchSubmissionStats(majorId, true); // Pass true to indicate this is background loading
          }
          return Promise.resolve();
        });
      
      // Don't await the promises - let them run in the background
      // This allows the dashboard to be interactive while preloading happens
      Promise.all(fetchPromises).catch(() => {});
      
      // Return immediately without waiting
      return;
    };

    // Function to fetch submission statistics for the current milestone
    const fetchSubmissionStats = async (majorId, isBackgroundLoad = false, force = false) => {
      if (!majorId) return;
      
      // Clear existing listeners for this major
      if (supervisorSubmissionUnsubscribers.value[majorId]) {
        supervisorSubmissionUnsubscribers.value[majorId]();
        delete supervisorSubmissionUnsubscribers.value[majorId];
      }

      if (!isBackgroundLoad && !submissionStatsCache.value[majorId]) {
        submissionLoading.value = true;
        submissionError.value = null;
        currentMilestoneSubmissionStats.value = null;
      }
      
      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          submissionError.value = 'User not authenticated';
          return;
        }
        
        const { school, uid } = userStore.currentUser;
        
        if (!school) {
          submissionError.value = 'Missing school information';
          return;
        }
        
        const academicYearData = await getLatestAcademicYear(school);
        
        if (!academicYearData?.yearId) {
          submissionError.value = 'Failed to determine academic year';
          return;
        }
        
        const yearId = academicYearData.yearId;
        
        const majorDocId = await getMajorDocId(school, yearId, majorId);
        
        if (!majorDocId) {
          submissionError.value = 'Major document not found';
          return;
        }
        
        const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId);
        
        if (!majorMilestones || majorMilestones.length === 0) {
          submissionError.value = 'No milestones found for this major';
          return;
        }
        
        const now = new Date();
        const sortedMilestones = [...majorMilestones].sort((a, b) => {
          const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate();
          const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate();
          return dateA - dateB;
        });
        
        let currentMilestone = sortedMilestones.find(milestone => {
          const deadlineDate = milestone.deadline instanceof Date ? 
            milestone.deadline : 
            milestone.deadline.toDate();
          return deadlineDate > now;
        });
        
        if (!currentMilestone && sortedMilestones.length > 0) {
          currentMilestone = sortedMilestones[sortedMilestones.length - 1];
        }
        
        if (!currentMilestone) {
          submissionError.value = 'No current milestone found';
          return;
        }
        
        const milestoneIndex = majorMilestones.findIndex(m => 
          m.description === currentMilestone.description
        );
        
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
        
        // Set up real-time listener for projects
        const unsubscribe = onSnapshot(projectsQuery, async (projectsSnapshot) => {
          try {
            let totalAssigned = 0;
            const submissionQueries = [];
            
            projectsSnapshot.docs.forEach(projectDoc => {
              const projectData = projectDoc.data();
              
              if (projectData.assignedTo) {
                totalAssigned++;
                
                const submissionsRef = collection(projectDoc.ref, 'submissions');
                const submissionsQuery = query(
                  submissionsRef,
                  where('milestoneIndex', '==', milestoneIndex)
                );
                
                submissionQueries.push({
                  projectId: projectDoc.id,
                  query: submissionsQuery
                });
              }
            });
            
            const submissionResults = await Promise.all(
              submissionQueries.map(item => 
                getDocs(item.query).then(snapshot => ({
                  projectId: item.projectId,
                  hasSubmission: !snapshot.empty
                }))
              )
            );
            
            const projectsWithSubmissions = submissionResults.filter(result => result.hasSubmission).length;
            const submissionRate = totalAssigned > 0 ? 
              Math.round((projectsWithSubmissions / totalAssigned) * 100) : 0;
            
            const statsObject = {
              milestoneName: currentMilestone.description,
              milestoneIndex: milestoneIndex,
              totalAssigned: totalAssigned,
              projectsWithSubmissions: projectsWithSubmissions,
              projectsWithoutSubmissions: totalAssigned - projectsWithSubmissions,
              submissionRate: submissionRate,
              timestamp: Date.now()
            };
            
            submissionStatsCache.value[majorId] = statsObject;
            
            if (!isBackgroundLoad) {
              currentMilestoneSubmissionStats.value = statsObject;
              submissionLoading.value = false;
            }
          } catch (err) {
            if (!isBackgroundLoad) {
              submissionError.value = `Failed to process submission data: ${err.message}`;
              submissionLoading.value = false;
            }
          }
        }, (err) => {
          if (!isBackgroundLoad) {
            submissionError.value = `Failed to listen to project updates: ${err.message}`;
            submissionLoading.value = false;
          }
        });
        
        // Store the unsubscribe function
        supervisorSubmissionUnsubscribers.value[majorId] = unsubscribe;
        
      } catch (err) {
        if (!isBackgroundLoad) {
          submissionError.value = `Failed to set up submission tracking: ${err.message}`;
          submissionLoading.value = false;
        }
      }
    };

    // Function to fetch examiner submission statistics
    const fetchExaminerSubmissionStats = async (majorId, isBackgroundLoad = false, force = false) => {
      if (!majorId) return;
      
      // Clear existing listeners for this major
      if (examinerSubmissionUnsubscribers.value[majorId]) {
        examinerSubmissionUnsubscribers.value[majorId]();
        delete examinerSubmissionUnsubscribers.value[majorId];
      }

      if (!isBackgroundLoad && !examinerSubmissionStatsCache.value[majorId]) {
        examinerSubmissionLoading.value = true;
        examinerSubmissionError.value = null;
        examinerSubmissionStats.value = null;
      }
      
      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          examinerSubmissionError.value = 'User not authenticated';
          return;
        }
        
        const { school, uid } = userStore.currentUser;
        
        if (!school) {
          examinerSubmissionError.value = 'Missing school information';
          return;
        }
        
        const academicYearData = await getLatestAcademicYear(school);
        
        if (!academicYearData?.yearId) {
          examinerSubmissionError.value = 'Failed to determine academic year';
          return;
        }
        
        const yearId = academicYearData.yearId;
        
        const majorDocId = await getMajorDocId(school, yearId, majorId);
        
        if (!majorDocId) {
          examinerSubmissionError.value = 'Major document not found';
          return;
        }
        
        const majorMilestones = await getMilestones(school, yearId, majorId, majorDocId);
        
        if (!majorMilestones || majorMilestones.length === 0) {
          examinerSubmissionError.value = 'No milestones found for this major';
          return;
        }
        
        const now = new Date();
        const sortedMilestones = [...majorMilestones].sort((a, b) => {
          const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate();
          const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate();
          return dateA - dateB;
        });
        
        let currentMilestone = sortedMilestones.find(milestone => {
          const deadlineDate = milestone.deadline instanceof Date ? 
            milestone.deadline : 
            milestone.deadline.toDate();
          return deadlineDate > now;
        });
        
        if (!currentMilestone && sortedMilestones.length > 0) {
          currentMilestone = sortedMilestones[sortedMilestones.length - 1];
        }
        
        if (!currentMilestone) {
          examinerSubmissionError.value = 'No current milestone found';
          return;
        }
        
        const milestoneIndex = majorMilestones.findIndex(m => 
          m.description === currentMilestone.description
        );
        
        const projectsRef = collection(
          db,
          'schools', school,
          'projects', yearId,
          majorId, majorDocId,
          'projectsPerYear'
        );
        
        const projectsQuery = query(
          projectsRef,
          where('examinerId', '==', uid)
        );
        
        // Set up real-time listener for projects
        const unsubscribe = onSnapshot(projectsQuery, async (projectsSnapshot) => {
          try {
            const totalAssigned = projectsSnapshot.size;
            const submissionQueries = [];
            
            projectsSnapshot.docs.forEach(projectDoc => {
              const submissionsRef = collection(projectDoc.ref, 'submissions');
              const submissionsQuery = query(
                submissionsRef,
                where('milestoneIndex', '==', milestoneIndex)
              );
              
              submissionQueries.push({
                projectId: projectDoc.id,
                query: submissionsQuery
              });
            });
            
            const submissionResults = await Promise.all(
              submissionQueries.map(item => 
                getDocs(item.query).then(snapshot => ({
                  projectId: item.projectId,
                  hasSubmission: !snapshot.empty
                }))
              )
            );
            
            const projectsWithSubmissions = submissionResults.filter(result => result.hasSubmission).length;
            const submissionRate = totalAssigned > 0 ? 
              Math.round((projectsWithSubmissions / totalAssigned) * 100) : 0;
            
            const statsObject = {
              milestoneName: currentMilestone.description,
              milestoneIndex: milestoneIndex,
              totalAssigned: totalAssigned,
              projectsWithSubmissions: projectsWithSubmissions,
              projectsWithoutSubmissions: totalAssigned - projectsWithSubmissions,
              submissionRate: submissionRate,
              timestamp: Date.now()
            };
            
            examinerSubmissionStatsCache.value[majorId] = statsObject;
            
            if (!isBackgroundLoad) {
              examinerSubmissionStats.value = statsObject;
              examinerSubmissionLoading.value = false;
            }
          } catch (err) {
            if (!isBackgroundLoad) {
              examinerSubmissionError.value = `Failed to process submission data: ${err.message}`;
              examinerSubmissionLoading.value = false;
            }
          }
        }, (err) => {
          if (!isBackgroundLoad) {
            examinerSubmissionError.value = `Failed to listen to project updates: ${err.message}`;
            examinerSubmissionLoading.value = false;
          }
        });
        
        // Store the unsubscribe function
        examinerSubmissionUnsubscribers.value[majorId] = unsubscribe;
        
      } catch (err) {
        if (!isBackgroundLoad) {
          examinerSubmissionError.value = `Failed to set up submission tracking: ${err.message}`;
          examinerSubmissionLoading.value = false;
        }
      }
    };

    // Watch for changes in lecturerMajors to set default selectedSubmissionMajor
    watch(lecturerMajors, async (newMajors) => {
      if (newMajors && newMajors.length > 0 && !initialLoadDone.value) {
        // Only set if not already set
        if (!selectedMajor.value) {
          // Explicitly set to first major
          const firstMajor = newMajors[0];
          selectedMajor.value = firstMajor;
          selectedSubmissionMajor.value = firstMajor;
        }
      }
    }, { immediate: true });

    // Function to get session storage key for examined projects
    const getExaminedProjectsStorageKey = (uid) => {
      return `examined_projects_${uid}`;
    };

    // Function to store examined projects data in session storage
    const storeExaminedProjectsData = (uid, data) => {
      if (!uid) return;
      try {
        const key = getExaminedProjectsStorageKey(uid);
        sessionStorage.setItem(key, JSON.stringify({
          count: data.count,
          projectIds: data.projectIds,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error storing examined projects data:', err);
      }
    };

    // Function to get examined projects data from session storage
    const getStoredExaminedProjectsData = (uid) => {
      if (!uid) return null;
      try {
        const key = getExaminedProjectsStorageKey(uid);
        const stored = sessionStorage.getItem(key);
        if (!stored) return null;
        
        const data = JSON.parse(stored);
        // Check if data is less than 30 minutes old
        if (Date.now() - data.timestamp < 30 * 60 * 1000) {
          return {
            count: data.count,
            projectIds: data.projectIds || []
          };
        }
        return null;
      } catch (err) {
        console.error('Error getting examined projects data:', err);
        return null;
      }
    };

    // Function to set up real-time listeners for examined projects
    const setupExaminedProjectsListeners = async (force = false) => {
      // Skip if recently loaded (within 10 seconds) unless forced
      const now = Date.now();
      if (!force && now - lastFetchTimes.value.examined < 10000) return;

      // Only show loading if no data is currently available
      if (examinedProjectsCount.value === 0) {
        examinedProjectsLoading.value = true;
      }
      examinedProjectsError.value = null;

      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          examinedProjectsError.value = 'User not authenticated';
          return;
        }

        // Get user data
        const { school, uid } = userStore.currentUser;
        
        if (!school) {
          examinedProjectsError.value = 'Missing school information';
          return;
        }

        // Try to get data from session storage first
        const storedData = getStoredExaminedProjectsData(uid);
        if (storedData !== null && !force) {
          examinedProjectsCount.value = storedData.count;
          examinedProjectsLoading.value = false;
        }
        
        // Get latest academic year
        const academicYearData = await getLatestAcademicYear(school);
        
        if (!academicYearData?.yearId) {
          examinedProjectsError.value = 'Failed to determine academic year';
          return;
        }
        
        const yearId = academicYearData.yearId;
        
        // Check if we have lecturer majors
        if (!lecturerMajors.value || lecturerMajors.value.length === 0) {
          examinedProjectsError.value = 'No majors assigned to lecturer';
          return;
        }

        // Clear existing listeners
        examinedProjectsUnsubscribers.value.forEach(unsubscribe => unsubscribe());
        examinedProjectsUnsubscribers.value = [];
        
        // Create an array to store all major document ID fetch promises
        const majorDocIdPromises = lecturerMajors.value.map(majorId => 
          getMajorDocId(school, yearId, majorId)
        );
        
        // Fetch all major document IDs in parallel
        const majorDocIds = await Promise.all(majorDocIdPromises);

        // Object to store counts and project IDs per major
        const majorData = {};
        
        // Set up listeners for each major
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
            where('examinerId', '==', uid)
          );
          
          // Set up real-time listener
          const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
            // Update the data for this major
            majorData[majorId] = {
              count: snapshot.size,
              projectIds: snapshot.docs.map(doc => ({
                id: doc.id,
                majorId,
                majorDocId
              }))
            };
            
            // Calculate total count and collect all project IDs
            const totalExaminedCount = Object.values(majorData).reduce((sum, data) => sum + data.count, 0);
            const allProjectIds = Object.values(majorData).reduce((ids, data) => [...ids, ...data.projectIds], []);
            
            // Update the examined projects count
            examinedProjectsCount.value = totalExaminedCount;

            // Store the updated data in session storage
            storeExaminedProjectsData(uid, {
              count: totalExaminedCount,
              projectIds: allProjectIds
            });
            
            // Update last fetch time
            lastFetchTimes.value.examined = Date.now();

            // Once we have data, turn off loading
            examinedProjectsLoading.value = false;
          }, (error) => {
            console.error('Error in examined projects listener:', error);
            examinedProjectsError.value = `Error receiving updates: ${error.message}`;
            examinedProjectsLoading.value = false;
          });
          
          // Store the unsubscribe function
          examinedProjectsUnsubscribers.value.push(unsubscribe);
        });
        
      } catch (err) {
        examinedProjectsError.value = `Failed to set up examined projects listeners: ${err.message}`;
        examinedProjectsLoading.value = false;
      }
    };

    // Function to fetch supervisorFeedback stats
    const fetchSupervisorFeedbackStats = async (force = false) => {
      console.log('Starting fetchSupervisorFeedbackStats');
      const now = Date.now();
      
      if (!force && lastFetchTimes.value.feedback && (now - lastFetchTimes.value.feedback < 10000)) {
        console.log('Skipping fetch due to recent update');
        return;
      }
      
      // Check if we have a selected major and current milestone
      if (!selectedMajor.value) {
        console.log('No major selected, skipping feedback fetch');
        return;
      }

      const currentMilestone = currentUpcomingMilestone.value;
      if (!currentMilestone) {
        console.log('No current milestone found, skipping feedback fetch');
        return;
      }

      console.log('Fetching feedback for major:', selectedMajor.value, 'milestone:', currentMilestone.description);
      
      supervisorFeedbackLoading.value = true;
      supervisorFeedbackError.value = null;

      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          console.error('User not authenticated');
          supervisorFeedbackError.value = 'User not authenticated';
          return;
        }

        const { school, uid } = userStore.currentUser;
        console.log('User data:', { school, uid });
        
        if (!school) {
          console.error('Missing school information');
          supervisorFeedbackError.value = 'Missing school information';
          return;
        }

        // Clear previous listener if exists
        if (feedbackUnsubscribers.value.supervisor) {
          feedbackUnsubscribers.value.supervisor();
          feedbackUnsubscribers.value.supervisor = null;
        }

        // Create default stats
        supervisorFeedbackStats.value = {
          totalSubmissions: 0,
          reviewedSubmissions: 0,
          reviewRate: 0,
          majorId: selectedMajor.value,
          milestoneDescription: currentMilestone.description
        };

        // Query submissions with major and milestone filters
        const submissionsRef = collection(db, 'schools', school, 'submissions');
        const submissionsQuery = query(
          submissionsRef,
          where('lecturerId', '==', uid),
          where('majorId', '==', selectedMajor.value),
          where('milestoneDescription', '==', currentMilestone.description)
        );
        
        console.log('Querying submissions for major:', selectedMajor.value, 'milestone:', currentMilestone.description);

        const unsubscribe = onSnapshot(submissionsQuery, (submissionsSnapshot) => {
          const totalSubmissions = submissionsSnapshot.size;
          console.log('Total supervisor submissions found:', totalSubmissions);
          
          let reviewedSubmissions = 0;
          
          submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            if (
              data.reviewedBySupervisor === true || 
              (data.isReviewed === true && data.role === 'supervisor') ||
              (data.feedback && data.feedback.supervisor && data.feedback.supervisor.submitted === true)
            ) {
              reviewedSubmissions++;
            }
          });
          
          const reviewRate = totalSubmissions > 0 ? 
            Math.round((reviewedSubmissions / totalSubmissions) * 100) : 0;
          
          console.log('Supervisor feedback stats calculated:', {
            totalSubmissions,
            reviewedSubmissions,
            reviewRate,
            majorId: selectedMajor.value,
            milestone: currentMilestone.description
          });
          
          supervisorFeedbackStats.value = {
            totalSubmissions,
            reviewedSubmissions,
            reviewRate,
            majorId: selectedMajor.value,
            milestoneDescription: currentMilestone.description
          };
          
          supervisorFeedbackLoading.value = false;
          lastFetchTimes.value.feedback = Date.now();
        }, (err) => {
          console.error('Error in supervisor feedback listener:', err);
          supervisorFeedbackError.value = `Error fetching feedback data: ${err.message}`;
          supervisorFeedbackLoading.value = false;
        });
        
        feedbackUnsubscribers.value.supervisor = unsubscribe;
        
      } catch (err) {
        console.error('Error in fetchSupervisorFeedbackStats:', err);
        supervisorFeedbackError.value = `Failed to load feedback data: ${err.message}`;
        supervisorFeedbackLoading.value = false;
      }
    };
    
    // Function to fetch examinerFeedback stats
    const fetchExaminerFeedbackStats = async (force = false) => {
      console.log('Starting fetchExaminerFeedbackStats');
      const now = Date.now();
      
      if (!force && lastFetchTimes.value.examinerFeedback && (now - lastFetchTimes.value.examinerFeedback < 10000)) {
        console.log('Skipping fetch due to recent update');
        return;
      }
      
      // Check if we have a selected major and current milestone
      if (!selectedMajor.value) {
        console.log('No major selected, skipping feedback fetch');
        return;
      }

      const currentMilestone = currentUpcomingMilestone.value;
      if (!currentMilestone) {
        console.log('No current milestone found, skipping feedback fetch');
        return;
      }

      console.log('Fetching feedback for major:', selectedMajor.value, 'milestone:', currentMilestone.description);
      
      examinerFeedbackLoading.value = true;
      examinerFeedbackError.value = null;

      try {
        if (!userStore.isAuthenticated || !userStore.currentUser) {
          console.error('User not authenticated');
          examinerFeedbackError.value = 'User not authenticated';
          return;
        }

        const { school, uid } = userStore.currentUser;
        console.log('User data:', { school, uid });
        
        if (!school) {
          console.error('Missing school information');
          examinerFeedbackError.value = 'Missing school information';
          return;
        }

        // Clear previous listener if exists
        if (feedbackUnsubscribers.value.examiner) {
          feedbackUnsubscribers.value.examiner();
          feedbackUnsubscribers.value.examiner = null;
        }

        // Create default stats
        examinerFeedbackStats.value = {
          totalSubmissions: 0,
          reviewedSubmissions: 0,
          reviewRate: 0,
          majorId: selectedMajor.value,
          milestoneDescription: currentMilestone.description
        };

        // Query submissions with major and milestone filters
        const submissionsRef = collection(db, 'schools', school, 'submissions');
        const submissionsQuery = query(
          submissionsRef,
          where('examinerId', '==', uid),
          where('majorId', '==', selectedMajor.value),
          where('milestoneDescription', '==', currentMilestone.description)
        );
        
        console.log('Querying submissions for major:', selectedMajor.value, 'milestone:', currentMilestone.description);

        const unsubscribe = onSnapshot(submissionsQuery, (submissionsSnapshot) => {
          const totalSubmissions = submissionsSnapshot.size;
          console.log('Total examiner submissions found:', totalSubmissions);
          
          let reviewedSubmissions = 0;
          
          submissionsSnapshot.forEach(doc => {
            const data = doc.data();
            if (
              data.reviewedByExaminer === true || 
              (data.isReviewed === true && data.role === 'examiner') ||
              (data.feedback && data.feedback.examiner && data.feedback.examiner.submitted === true)
            ) {
              reviewedSubmissions++;
            }
          });
          
          const reviewRate = totalSubmissions > 0 ? 
            Math.round((reviewedSubmissions / totalSubmissions) * 100) : 0;
          
          console.log('Examiner feedback stats calculated:', {
            totalSubmissions,
            reviewedSubmissions,
            reviewRate,
            majorId: selectedMajor.value,
            milestone: currentMilestone.description
          });
          
          examinerFeedbackStats.value = {
            totalSubmissions,
            reviewedSubmissions,
            reviewRate,
            majorId: selectedMajor.value,
            milestoneDescription: currentMilestone.description
          };
          
          examinerFeedbackLoading.value = false;
          lastFetchTimes.value.examinerFeedback = Date.now();
        }, (err) => {
          console.error('Error in examiner feedback listener:', err);
          examinerFeedbackError.value = `Error fetching feedback data: ${err.message}`;
          examinerFeedbackLoading.value = false;
        });
        
        feedbackUnsubscribers.value.examiner = unsubscribe;
        
      } catch (err) {
        console.error('Error in fetchExaminerFeedbackStats:', err);
        examinerFeedbackError.value = `Failed to load feedback data: ${err.message}`;
        examinerFeedbackLoading.value = false;
      }
    };

    // Add a watch effect to refresh feedback stats when major or milestone changes
    watch([selectedMajor, currentUpcomingMilestone], ([newMajor, newMilestone], [oldMajor, oldMilestone]) => {
      if (newMajor !== oldMajor || 
          (newMilestone && oldMilestone && newMilestone.description !== oldMilestone.description)) {
        console.log('Major or milestone changed, refreshing feedback stats');
        // Force refresh both feedback stats
        fetchSupervisorFeedbackStats(true);
        fetchExaminerFeedbackStats(true);
      }
    });

    // Modify the onMounted hook to force refresh the first time
    onMounted(async () => {
      const startTime = Date.now();
      
      try {
        // Step 1: Initialize auth if not already done
        if (!userStore.initialized) {
          console.log('Initializing auth...');
          await userStore.initializeAuth();
        }

        // Verify userStore.currentUser exists
        console.log('Auth initialized, current user:', userStore.currentUser ? 'exists' : 'null');

        if (!userStore.currentUser) {
          throw new Error('User not initialized');
        }

        const { school, major } = userStore.currentUser;
        console.log('User data loaded:', { school, hasMajor: !!major });

        // Step 2: Set majors directly from userStore (much faster than fetching from Firestore)
        await fetchLecturerMajors();

        // Get academic year data in parallel with UI rendering
        const academicYearPromise = getLatestAcademicYear(school);

        // Step 2: Use cached data immediately to show content faster
        const primaryMajor = selectedMajor.value || lecturerMajors.value[0];
        
        // Try to get cached data for immediate display
        const cachedMilestones = getCachedMilestones(primaryMajor);
        if (cachedMilestones) {
          allMilestones.value = {
            [primaryMajor]: cachedMilestones
          };
          loading.value = false;
        }

        // Check submission stats cache
        if (submissionStatsCache.value[primaryMajor]) {
          currentMilestoneSubmissionStats.value = submissionStatsCache.value[primaryMajor];
          submissionLoading.value = false;
        }

        // Await academic year in parallel with UI rendering
        const academicYearData = await academicYearPromise;
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year');
        }

        // Step 3: Start all data fetches in parallel
        const fetchPromises = [
          // Primary major's data first
          fetchMilestonesData(),
          fetchSubmissionStats(primaryMajor, false),
          fetchLecturerProjects(),
          setupExaminedProjectsListeners(),
          // Add feedback stats fetching
          fetchSupervisorFeedbackStats(),
          fetchExaminerFeedbackStats()
        ];

        // Mark initial load as complete once any data is available
        Promise.race(fetchPromises).then(() => {
          initialLoadDone.value = true;
        });

        // Handle all promises completion
        Promise.allSettled(fetchPromises).then(results => {
          // Step 4: Load background data
          // Preload other majors' data
          if (lecturerMajors.value.length > 1) {
            setTimeout(() => {
              const otherMajors = lecturerMajors.value.filter(m => m !== primaryMajor);
              
              // Preload submission stats
              preloadAllSubmissionStats();
              
              // Preload milestones for other majors
              otherMajors.forEach(majorId => {
                const cachedData = getCachedMilestones(majorId);
                if (!cachedData) {
                  setupMilestoneListener(
                    school,
                    academicYearData.yearId,
                    majorId,
                    null // Will be fetched in the setup function
                  ).catch(() => {});
                }
              });
            }, 1000); // Delay background loading to prioritize main content
          }
        });

        // Force refresh feedback stats on initial load
        await Promise.all([
          fetchSupervisorFeedbackStats(true),  // Force refresh
          fetchExaminerFeedbackStats(true)     // Force refresh
        ]);

      } catch (err) {
        console.error('Error in onMounted:', err);
        error.value = 'Failed to initialize dashboard data';
      }
    });

    // Add cleanup on component unmount
    onUnmounted(() => {
      // Clean up all milestone listeners
      milestoneUnsubscribers.value.forEach(unsubscribe => unsubscribe());
      milestoneUnsubscribers.value = [];
      
      // Clean up examined projects listeners
      examinedProjectsUnsubscribers.value.forEach(unsubscribe => unsubscribe());
      examinedProjectsUnsubscribers.value = [];
      
      // Clean up supervisor submission listeners
      Object.values(supervisorSubmissionUnsubscribers.value).forEach(unsubscribe => unsubscribe());
      supervisorSubmissionUnsubscribers.value = {};
      
      // Clean up examiner submission listeners
      Object.values(examinerSubmissionUnsubscribers.value).forEach(unsubscribe => unsubscribe());
      examinerSubmissionUnsubscribers.value = {};
      
      // Clean up feedback listeners
      if (feedbackUnsubscribers.value.supervisor) {
        feedbackUnsubscribers.value.supervisor();
      }
      if (feedbackUnsubscribers.value.examiner) {
        feedbackUnsubscribers.value.examiner();
      }
    });

    // Optimized helper function to compare milestone arrays
    const areMilestonesEqual = (oldMilestones, newMilestones) => {
      if (oldMilestones.length !== newMilestones.length) return false;
      
      // Simple hash/fingerprint of milestone data for comparison
      const getMilestoneFingerprint = (milestone) => {
        return `${milestone.description}|${milestone.deadline instanceof Date ? 
          milestone.deadline.getTime() : 
          milestone.deadline}`;
      };
      
      // Create fingerprints for old milestones
      const oldFingerprints = new Set();
      for (let i = 0; i < oldMilestones.length; i++) {
        oldFingerprints.add(getMilestoneFingerprint(oldMilestones[i]));
      }
      
      // Check if any new milestone has a fingerprint not in the old set
      for (let i = 0; i < newMilestones.length; i++) {
        if (!oldFingerprints.has(getMilestoneFingerprint(newMilestones[i]))) {
          return false;
        }
      }
      
      return true;
    }

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
      storeMilestoneData,
      lastFetchTimes,
      examinedProjectsLoading,
      examinedProjectsError,
      examinedProjectsCount,
      examinedProjectsUnsubscribers,
      examinerSubmissionStats,
      examinerSubmissionLoading,
      examinerSubmissionError,
      fetchExaminerSubmissionStats,
      supervisorFeedbackLoading,
      supervisorFeedbackError,
      supervisorFeedbackStats,
      examinerFeedbackLoading,
      examinerFeedbackError,
      examinerFeedbackStats,
      fetchSupervisorFeedbackStats,
      fetchExaminerFeedbackStats
    }
  }
}
</script>

<style scoped>
/* Dashboard styles imported from assets/styles/dashboard.css */
</style>
  
  