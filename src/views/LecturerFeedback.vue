<template>
  <div class="lecturer-feedback">
    <!-- Left Side Content (Main Content) -->
    <div class="w-3/4 mr-6">
      <!-- Submissions Section -->
      <div class="bg-white p-5 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">
          <template v-if="!showFeedbackView">
            <div class="flex justify-between items-center">
              <div>
                Submissions
                <span v-if="selectedMajor || selectedMilestoneFilter" class="text-lg font-normal text-gray-600">
                  {{ getFilterDescription }}
                </span>
              </div>
              <div class="relative">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search for filename, student or project"
                  class="w-96 px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </template>
          <template v-else>
            <button 
              @click="returnToSubmissions"
              class="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Submissions
            </button>
          </template>
        </h2>

        <!-- Feedback View -->
        <div v-if="showFeedbackView" class="space-y-6">
          <!-- Submission Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-medium text-gray-900">{{ selectedSubmission.fileName }}</h3>
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {{ selectedSubmission.major }}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              Submitted by {{ selectedSubmission.studentName }}
            </p>
            <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <p class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ selectedSubmission.projectTitle }}
              </p>
              <p class="flex items-center" v-if="selectedSubmission.submittedAt">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDate(selectedSubmission.submittedAt.toDate()) }}
              </p>
            </div>
            <a 
              :href="selectedSubmission.downloadUrl"
              target="_blank"
              class="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Submission
            </a>
          </div>

          <!-- Feedback Form -->
          <form @submit.prevent="saveFeedback" class="space-y-6">
            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div class="flex items-center gap-2">
                <template v-for="i in 5" :key="i">
                  <button
                    type="button"
                    @click="feedbackData.rating = i"
                    class="focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-8 w-8"
                      :class="i <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- Comment -->
            <div>
              <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <textarea
                id="comment"
                v-model="feedbackData.comment"
                rows="4"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your feedback comment..."
              ></textarea>
            </div>

            <!-- Advice -->
            <div>
              <label for="advice" class="block text-sm font-medium text-gray-700 mb-2">Advice for Improvement</label>
              <textarea
                id="advice"
                v-model="feedbackData.advice"
                rows="4"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your advice for improvement..."
              ></textarea>
            </div>

            <!-- Error Message -->
            <p v-if="feedbackError" class="text-red-600 text-sm">{{ feedbackError }}</p>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                :disabled="feedbackLoading"
              >
                {{ feedbackLoading ? 'Saving...' : 'Save Feedback' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Submissions List (Original Content) -->
        <template v-else>
          <!-- Initial Loading State -->
          <div v-if="submissionsLoading && !submissions.length" class="py-4">
            <div class="animate-pulse space-y-4">
              <div class="h-24 bg-gray-200 rounded"></div>
              <div class="h-24 bg-gray-200 rounded"></div>
              <div class="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="submissionsError" class="text-red-500 py-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{{ submissionsError }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!submissions.length" class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-500">No submissions found</p>
            <p class="text-sm text-gray-400">
              {{ selectedMajor || selectedMilestoneFilter ? 'Try adjusting your filters' : 'Waiting for student submissions' }}
            </p>
          </div>

          <!-- Submission Cards with Virtual Scrolling -->
          <div v-else class="relative" style="height: calc(100vh - 250px)" ref="containerRef" v-bind="containerProps">
            <div v-bind="wrapperProps" class="grid grid-cols-2 gap-3">
              <div
                v-for="item in list"
                :key="item.data.id"
                class="border rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                @click="handleSubmissionClick(item.data)"
              >
                <div class="flex flex-col space-y-2">
                  <!-- Top row: Filename, Major, and Review Status -->
                  <div class="flex items-start justify-between">
                    <div class="flex flex-col gap-1.5 max-w-[70%]">
                      <div class="flex items-center gap-2">
                        <h3 class="font-medium text-gray-900 leading-tight line-clamp-2">{{ item.data.fileName }}</h3>
                        <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                          {{ item.data.major }}
                        </span>
                      </div>
                      <span class="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-fit">{{ item.data.studentName }}</span>
                    </div>
                    <span 
                      class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      :class="item.data.hasBeenReviewed ? 
                        'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'"
                    >
                      {{ item.data.hasBeenReviewed ? 'Reviewed' : 'Pending' }}
                    </span>
                  </div>

                  <!-- Bottom section: Project Title, Milestone, and Date -->
                  <div class="flex flex-col gap-1.5">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p class="text-sm text-gray-700 font-medium truncate">{{ item.data.projectTitle }}</p>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <p class="text-xs text-gray-400 truncate">{{ item.data.milestoneDescription }}</p>
                      </div>
                      <div class="flex items-center gap-1" v-if="item.data.submittedAt">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="text-xs text-gray-400">
                          {{ item.data.submittedAt?.toDate?.() ? formatDate(item.data.submittedAt.toDate()) : 'Date not available' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Background Loading Indicator -->
            <div 
              v-if="isBackgroundLoading"
              class="absolute bottom-0 left-0 right-0 p-2 bg-gray-50 text-center text-sm text-gray-600"
            >
              Loading more submissions...
            </div>

            <!-- Intersection Observer Target -->
            <div 
              ref="submissionsContainer"
              class="h-4"
            ></div>
          </div>
        </template>
      </div>
    </div>

    <!-- Right Side (Milestone and Filters) -->
    <div class="w-1/4">
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
import { collection, query, where, getDocs, getDoc, doc, limit, startAfter, orderBy, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { useVirtualList } from '@vueuse/core'
import { debounce } from 'lodash'

export default {
  name: 'LecturerFeedback',
  setup() {
    const userStore = useUserStore()
    const selectedMajor = ref(null)
    const selectedMilestoneFilter = ref(null)
    const milestoneDataMap = ref({})
    const showFilters = ref(false)
    const currentDisplayMajor = ref(null)
    const submissions = ref([])
    const submissionsLoading = ref(false)
    const submissionsError = ref(null)
    const pageSize = ref(10)
    const lastDoc = ref(null)
    const hasMore = ref(true)
    const studentNameCache = ref({})
    const isBackgroundLoading = ref(false)
    const submissionsContainer = ref(null)

    // New state variables for feedback
    const showFeedbackView = ref(false)
    const selectedSubmission = ref(null)
    const feedbackLoading = ref(false)
    const feedbackError = ref(null)
    const feedbackData = ref({
      comment: '',
      rating: 0,
      advice: ''
    })

    // Virtual list setup
    const containerRef = ref(null)
    // Add search functionality
    const searchQuery = ref('')
    
    // Modified computed property for filtered submissions
    const filteredSubmissions = computed(() => {
      if (!searchQuery.value) return submissions.value
      
      const query = searchQuery.value.toLowerCase()
      return submissions.value.filter(submission => {
        return submission.fileName.toLowerCase().includes(query) ||
               submission.studentName.toLowerCase().includes(query) ||
               submission.projectTitle.toLowerCase().includes(query)
      })
    })

    // Virtual list using filtered submissions
    const { list, containerProps, wrapperProps } = useVirtualList(filteredSubmissions, {
      itemHeight: 60,
      overscan: 10,
    })

    // Define the submission card component
    const submissionCard = {
      props: {
        source: {
          type: Object,
          required: true
        }
      },
      template: `
        <div class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 mx-2">
          <div class="flex justify-between items-start">
            <div class="flex-grow">
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-gray-900">{{ source.fileName }}</h3>
                <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {{ source.major }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Submitted by {{ source.studentName }}
              </p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <p class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {{ source.projectTitle }}
                </p>
                <p class="flex items-center" v-if="source.submittedAt">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ source.submittedAt?.toDate?.() ? formatDate(source.submittedAt.toDate()) : 'Date not available' }}
                </p>
              </div>
            </div>
            <a 
              :href="source.downloadUrl"
              target="_blank"
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      `
    }

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

    // Function to handle major selection
    const handleMajorSelect = (major) => {
      selectedMajor.value = major;
      selectedMilestoneFilter.value = null;
      fetchSubmissions(); // Fetch submissions when major changes
    }

    // Function to toggle filters visibility
    const toggleFilters = () => {
      showFilters.value = !showFilters.value;
    }

    // Debounced fetch function
    const debouncedFetch = debounce(() => {
      fetchSubmissions()
    }, 300)

    // Get student name with caching
    const getStudentName = async (schoolId, studentId) => {
      if (studentNameCache.value[studentId]) {
        return studentNameCache.value[studentId]
      }

      try {
        const studentRef = doc(db, 'schools', schoolId, 'users', studentId)
        const studentDoc = await getDoc(studentRef)
        const studentData = studentDoc.data()
        const name = studentData?.name || 'Unknown Student'
        studentNameCache.value[studentId] = name
        return name
      } catch (err) {
        console.error('Error fetching student name:', err)
        return 'Unknown Student'
      }
    }

    // Modified fetchSubmissions with composite queries
    const fetchSubmissions = async (loadMore = false) => {
      if (!loadMore) {
        submissions.value = []
        lastDoc.value = null
        hasMore.value = true
      }
      
      if (!hasMore.value && loadMore) return

      submissionsLoading.value = true
      submissionsError.value = null

      try {
        if (!userStore.currentUser?.school || !userStore.currentUser?.uid) {
          throw new Error('User information not available')
        }

        const schoolId = userStore.currentUser.school
        const userId = userStore.currentUser.uid
        
        const academicYearData = await getLatestAcademicYear(schoolId)
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }
        const yearId = academicYearData.yearId

        const majorsToFetch = selectedMajor.value ? [selectedMajor.value] : userStore.currentUser.major || []
        const newSubmissions = []

        // Create a batch to get all submissions at once
        const submissionPromises = majorsToFetch.map(async (majorId) => {
          const submissionsRef = collection(
            db, 
            'schools', schoolId,
            'submissions' // New collection to store all submissions
          )

          let submissionQuery = query(
            submissionsRef,
            where('yearId', '==', yearId),
            where('majorId', '==', majorId),
            where('lecturerId', '==', userId),
            orderBy('submittedAt', 'desc'),
            limit(pageSize.value)
          )

          if (loadMore && lastDoc.value) {
            submissionQuery = query(submissionQuery, startAfter(lastDoc.value))
          }

          if (selectedMilestoneFilter.value) {
            submissionQuery = query(
              submissionQuery,
              where('milestoneDescription', '==', selectedMilestoneFilter.value.description)
            )
          }

          const submissionsSnapshot = await getDocs(submissionQuery)
          
          if (submissionsSnapshot.empty) {
            hasMore.value = false
            return []
          }

          lastDoc.value = submissionsSnapshot.docs[submissionsSnapshot.docs.length - 1]

          // Process submissions in parallel
          const processedSubmissions = await Promise.all(
            submissionsSnapshot.docs.map(async (doc) => {
              const submissionData = doc.data()
              const studentName = await getStudentName(schoolId, submissionData.submittedBy)
              
              // Check if feedback exists for this submission
              const feedbackRef = collection(db, 'schools', schoolId, 'feedback')
              const feedbackQuery = query(
                feedbackRef,
                where('submissionId', '==', doc.id),
                where('lecturerId', '==', userId),
                limit(1)
              )
              const feedbackSnapshot = await getDocs(feedbackQuery)
              const hasBeenReviewed = !feedbackSnapshot.empty
              
              return {
                id: doc.id,
                projectId: submissionData.projectId,
                projectTitle: submissionData.projectTitle,
                major: majorId,
                studentName,
                hasBeenReviewed,
                ...submissionData
              }
            })
          )

          return processedSubmissions
        })

        const submissionResults = await Promise.all(submissionPromises)
        newSubmissions.push(...submissionResults.flat())

        // Sort and update submissions
        const sortedSubmissions = newSubmissions.sort((a, b) => {
          const dateA = a.submittedAt?.toDate?.() || new Date(0)
          const dateB = b.submittedAt?.toDate?.() || new Date(0)
          return dateB - dateA
        })

        if (loadMore) {
          submissions.value = [...submissions.value, ...sortedSubmissions]
        } else {
          submissions.value = sortedSubmissions
        }

      } catch (error) {
        console.error('Error fetching submissions:', error)
        submissionsError.value = 'Failed to load submissions'
      } finally {
        submissionsLoading.value = false
      }
    }

    // Background loading function
    const preloadNextPage = async () => {
      if (isBackgroundLoading.value || !hasMore.value) return
      
      isBackgroundLoading.value = true
      try {
        await fetchSubmissions(true)
      } finally {
        isBackgroundLoading.value = false
      }
    }

    // Function to load milestone data for a specific major
    const loadMilestoneData = (majorId) => {
      if (!userStore.currentUser?.uid) return;
      const data = getMilestoneData(userStore.currentUser.uid, majorId)
      if (data) {
        milestoneDataMap.value[majorId] = data
      }
    }

    // Add click handler for submission card
    const handleSubmissionClick = (submission) => {
      selectedSubmission.value = submission
      showFeedbackView.value = true
      loadExistingFeedback(submission)
    }

    // Function to load existing feedback
    const loadExistingFeedback = async (submission) => {
      if (!submission || !userStore.currentUser?.school) return

      feedbackLoading.value = true
      feedbackError.value = null

      try {
        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const q = query(
          feedbackRef,
          where('submissionId', '==', submission.id),
          where('lecturerId', '==', userStore.currentUser.uid),
          limit(1)
        )

        const feedbackSnapshot = await getDocs(q)
        
        if (!feedbackSnapshot.empty) {
          const feedbackDoc = feedbackSnapshot.docs[0]
          const data = feedbackDoc.data()
          feedbackData.value = {
            comment: data.comment || '',
            rating: data.rating || 0,
            advice: data.advice || '',
            id: feedbackDoc.id
          }
        } else {
          // Reset form if no existing feedback
          feedbackData.value = {
            comment: '',
            rating: 0,
            advice: ''
          }
        }
      } catch (error) {
        console.error('Error loading feedback:', error)
        feedbackError.value = 'Failed to load feedback'
      } finally {
        feedbackLoading.value = false
      }
    }

    // Function to save feedback
    const saveFeedback = async () => {
      if (!selectedSubmission.value || !userStore.currentUser?.school) return

      feedbackLoading.value = true
      feedbackError.value = null

      try {
        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const feedbackPayload = {
          submissionId: selectedSubmission.value.id,
          lecturerId: userStore.currentUser.uid,
          studentId: selectedSubmission.value.submittedBy,
          yearId: selectedSubmission.value.yearId,
          majorId: selectedSubmission.value.majorId,
          milestoneDescription: selectedSubmission.value.milestoneDescription,
          projectId: selectedSubmission.value.projectId,
          comment: feedbackData.value.comment,
          rating: feedbackData.value.rating,
          advice: feedbackData.value.advice,
          updatedAt: new Date()
        }

        if (feedbackData.value.id) {
          // Update existing feedback
          await updateDoc(doc(feedbackRef, feedbackData.value.id), feedbackPayload)
        } else {
          // Create new feedback
          feedbackPayload.createdAt = new Date()
          await addDoc(feedbackRef, feedbackPayload)
        }

        // Update the submission's review status in the local state
        const submissionIndex = submissions.value.findIndex(s => s.id === selectedSubmission.value.id)
        if (submissionIndex !== -1) {
          submissions.value[submissionIndex].hasBeenReviewed = true
        }

        // Return to submissions view
        showFeedbackView.value = false
        selectedSubmission.value = null
      } catch (error) {
        console.error('Error saving feedback:', error)
        feedbackError.value = 'Failed to save feedback'
      } finally {
        feedbackLoading.value = false
      }
    }

    // Function to return to submissions view
    const returnToSubmissions = () => {
      showFeedbackView.value = false
      selectedSubmission.value = null
      feedbackData.value = {
        comment: '',
        rating: 0,
        advice: ''
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
        // Initial submissions fetch
        fetchSubmissions()
      }

      // Add intersection observer for infinite scroll
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          preloadNextPage()
        }
      }, { threshold: 0.5 })

      if (submissionsContainer.value) {
        observer.observe(submissionsContainer.value)
      }

      return () => {
        if (submissionsContainer.value) {
          observer.unobserve(submissionsContainer.value)
        }
      }
    })

    // Modified watchers
    watch([selectedMajor, selectedMilestoneFilter], () => {
      debouncedFetch()
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
      currentDisplayMajor,
      submissions,
      submissionsLoading,
      submissionsError,
      submissionsContainer,
      hasMore,
      isBackgroundLoading,
      submissionCard,
      containerRef,
      containerProps,
      wrapperProps,
      list,
      // Add new return values
      showFeedbackView,
      selectedSubmission,
      feedbackLoading,
      feedbackError,
      feedbackData,
      handleSubmissionClick,
      saveFeedback,
      returnToSubmissions,
      searchQuery
    }
  }
}
</script>

<style scoped>
.lecturer-feedback {
  padding: 20px;
  display: flex;
}

[data-virtual-list] {
  height: 100%;
  overflow-y: auto;
}

[data-virtual-list]::-webkit-scrollbar {
  width: 8px;
}

[data-virtual-list]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

[data-virtual-list]::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

[data-virtual-list]::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 