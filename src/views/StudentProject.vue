<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Projects</h1>
      
      <div class="bg-blue-100 p-4 rounded-lg ">
        <p class="text-blue-800">Welcome to your project dashboard! Here you'll be able to view and bid on available projects.</p>
      </div>
      
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'projects'"
            :class="[
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
            data-tab="projects"
          >
            Projects
          </button>
          <button
            @click="activeTab = 'mybid'"
            :class="[
              activeTab === 'mybid'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
            data-tab="mybid"
          >
            My Bids
          </button>
        </nav>
      </div>

      <!-- Projects Tab Panel -->
      <div v-show="activeTab === 'projects'">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <p class="text-gray-600">Loading projects...</p>
        </div>
        
        <!-- Projects List with Bid Action -->
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <div class="space-y-2">
              <div class="flex items-center gap-4">
                <h2 class="text-2xl font-semibold text-gray-900">Available Projects in {{ userStore.currentUser?.major || 'Your Major' }}</h2>
                <span class="text-sm text-gray-500">(Total: {{ filteredProjects.length }})</span>
              </div>
            </div>
            
            <!-- Search Input -->
            <div class="relative w-full max-w-md mb-6">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search projects by title..."
                class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Projects Table -->
          <div v-if="projects.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Major
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(project, index) in paginatedProjects" :key="index"
                    class="hover:bg-blue-50 cursor-pointer transition-colors duration-150 hover:shadow-sm"
                    @click="openProjectDetailsWindow(project)">
                  <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" @click.stop>
                    <div class="flex items-center">
                      <span 
                        @click="openProjectDetailsWindow(project)"
                        class="truncate hover:text-blue-600 text-gray-900 transition-colors w-full cursor-pointer"
                      >
                        {{ project.Title }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      class="px-2 py-1 rounded-full text-xs"
                      :class="[
                        getMajorColorClasses(project.major).bg,
                        getMajorColorClasses(project.major).text
                      ]"
                    >
                      {{ project.major }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getUserName(project.userId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" @click.stop>
                    <!-- Show different button based on whether project has been bid on, is assigned, or bids are finalized -->
                    <button 
                      v-if="project.isAssigned"
                      class="inline-flex items-center justify-center w-28 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                      disabled
                    >
                      Taken
                    </button>
                    <button 
                      v-else-if="biddedProjectIds.has(project.id)"
                      class="inline-flex items-center justify-center w-28 px-3 py-1.5 bg-green-100 text-green-700 rounded-md cursor-default"
                      disabled
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Bid Placed
                    </button>
                    <button 
                      v-else-if="bidsFinalized"
                      class="inline-flex items-center justify-center w-28 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                      disabled
                    >
                      Bids Locked
                    </button>
                    <button 
                      v-else
                      @click="handleBid(project.id)"
                      class="inline-flex items-center justify-center w-28 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                      <img 
                        v-if="bidIconLoaded"
                        src="@/assets/bid.png" 
                        alt="Bid" 
                        class="h-4 w-4 mr-1.5 object-contain" 
                        @error="bidIconLoaded = false"
                      />
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Bid
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div class="flex items-center justify-between mt-4 px-4">
              <div class="flex items-center gap-2">
                <button 
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border"
                  :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
                >
                  Previous
                </button>
                <span class="text-sm text-gray-600">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button 
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border"
                  :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- No Projects Message -->
          <div v-else class="text-center py-8 text-gray-500">
            No projects available at this time.
          </div>
        </div>
      </div>

      <!-- My Bid Tab Panel -->
      <div v-show="activeTab === 'mybid'" class="py-4">
        <!-- Loading State -->
        <div v-if="loadingBids" class="flex justify-center items-center py-8">
          <p class="text-gray-600">Loading your bids...</p>
        </div>

        <!-- Bids List -->
        <div v-else>
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-semibold text-gray-900">My Bids</h2>
              <p v-if="bidsFinalized && !allBidsRejected" class="mt-2 text-sm text-green-600">
                Your bids have been finalized and submitted to lecturers
              </p>
              <!-- New message for rejected bids -->
              <div v-if="allBidsRejected" class="mt-2">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-yellow-700">
                        All your bids have been rejected. You can start a new round of bidding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- New congratulatory message for accepted bids -->
              <div v-if="hasAcceptedBid" class="mt-2">
                <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-green-800">
                        Congratulations! Your bid for "{{ acceptedProjectTitle }}" has been accepted.
                      </p>
                      <p class="text-sm text-green-700 mt-1">
                        You can now proceed to work on this project. Good luck!
                      </p>
                      <div class="mt-2">
                        <button 
                          @click="$router.push(`/project-details/${acceptedProjectId}`)"
                          class="inline-flex items-center px-3 py-1.5 border border-green-600 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          View Project Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">
                {{ bidCount }}/3 bids used
              </span>
              <button 
                v-if="!bidsFinalized && myBids.length > 0 && !allBidsRejected"
                @click="finalizeBids"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Finalize Bids
              </button>
              <!-- New Start New Bids button -->
              <button
                v-if="allBidsRejected"
                @click="handleStartNewBids"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
                Start New Bids
              </button>
            </div>
          </div>

          <!-- Modified condition: Show if there are active bids OR reference rejected bids -->
          <div v-if="myBids.length > 0 || rejectedBidsReference.length > 0" class="space-y-4">
            <!-- Add rejected bids section if there are any -->
            <template v-if="hasAnyRejectedBids">
              <div class="border-b border-gray-200 pb-4 mb-4">
                <h3 class="text-sm font-medium text-gray-500 mb-4">Previous Rejected Bids (Reference Only)</h3>
                <div v-for="bid in visibleRejectedBids" 
                  :key="bid.id"
                  class="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm opacity-75 mb-2"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
                        {{ bid.priority || '?' }}
                      </div>
                      <div>
                        <h3 class="text-lg font-medium text-gray-700">{{ bid.project?.Title || 'Unknown Project' }}</h3>
                        <p class="text-sm text-gray-500 mt-1">Created by: {{ getUserName(bid.project?.userId) }}</p>
                        <div class="mt-2 flex items-center gap-2">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                          </span>
                          <span v-if="bid.isReference" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Reference
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Debug info -->
                <div class="text-xs text-gray-400 mt-2">
                  {{ rejectedBidsReference.length }} reference bid(s), {{ myBids.filter(b => b.status === 'rejected').length }} current rejected bid(s)
                </div>
              </div>
            </template>

            <!-- Active bids section only if there are active bids -->
            <div v-if="myBids.filter(b => b.status !== 'rejected').length > 0" class="active-bids">
              <div v-for="bid in myBids.filter(b => b.status !== 'rejected')" :key="bid.id" 
                class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow mb-4"
              >
                <!-- Existing bid card content -->
                <div class="flex justify-between items-start">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {{ bid.priority || '?' }}
                    </div>
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">{{ bid.project.Title }}</h3>
                      <p class="text-sm text-gray-500 mt-1">Created by: {{ getUserName(bid.project.userId) }}</p>
                      <div class="mt-2 flex items-center gap-2">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="{
                            'bg-yellow-100 text-yellow-800': bid.status === 'pending',
                            'bg-green-100 text-green-800': bid.status === 'accepted',
                            'bg-red-100 text-red-800': bid.status === 'rejected',
                            'bg-gray-100 text-gray-600': bid.status === 'invalidated'
                          }"
                        >
                          {{ bid.status.charAt(0).toUpperCase() + bid.status.slice(1) }}
                        </span>
                        <span class="text-xs text-gray-500">
                          Priority: {{ bid.priority || 'Not set' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    v-if="!bidsFinalized && bid.status === 'pending'"
                    @click="cancelBid(bid.id)"
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    Cancel Bid
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State - Only show when there are NO active bids AND NO reference bids -->
          <div v-else class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No bids yet</h3>
            <p class="mt-1 text-sm text-gray-500">Start bidding on projects to see them listed here.</p>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Finalize Confirmation Modal -->
    <div v-if="showFinalizeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirm Bid Finalization</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to finalize your bids? This action cannot be undone.
          Once finalized:
        </p>
        <ul class="list-disc list-inside text-gray-600 mb-6 space-y-1">
          <li>Your bids will be submitted to lecturers</li>
          <li>You won't be able to add or remove bids</li>
          <li>Your priorities will be locked</li>
        </ul>
        <div class="flex justify-end gap-3">
          <button 
            @click="showFinalizeModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="confirmFinalization"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Finalize Bids
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import { doc, collection, getDocs, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { getLatestAcademicYear, formatAcademicYear } from '@/utils/latestAcademicYear'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(true)
const projects = ref([])
const userNamesMap = ref(new Map())
const academicYear = ref('')
const academicYearId = ref('')
const searchQuery = ref('')
const activeTab = ref('projects')
const bidIconLoaded = ref(true)

// Bid related refs
const myBids = ref([])
const loadingBids = ref(false)
const bidCount = ref(0)
// Add ref for unsubscribe function
const unsubscribeBids = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Add a new ref to track bid projects
const biddedProjectIds = ref(new Set())

// Add new ref for finalization status
const bidsFinalized = ref(false)

// Add new computed properties for bid status
const allBidsRejected = computed(() => {
  return myBids.value.length > 0 && myBids.value.every(bid => bid.status === 'rejected')
})

// Add new computed property to check if any bid is accepted
const hasAcceptedBid = computed(() => {
  return myBids.value.some(bid => bid.status === 'accepted')
})

// Get the accepted project title if there is one
const acceptedProjectTitle = computed(() => {
  const acceptedBid = myBids.value.find(bid => bid.status === 'accepted')
  return acceptedBid?.project?.Title || 'your project'
})

// Get the accepted project ID if there is one
const acceptedProjectId = computed(() => {
  const acceptedBid = myBids.value.find(bid => bid.status === 'accepted')
  return acceptedBid?.projectId || ''
})

const hasAnyRejectedBids = computed(() => {
  // Check both current bids and reference bids
  const hasRejectedCurrentBids = myBids.value.some(bid => bid.status === 'rejected')
  const hasReferenceRejectedBids = rejectedBidsReference.value.length > 0
  console.log('Rejected bids check:', { 
    current: hasRejectedCurrentBids, 
    reference: hasReferenceRejectedBids, 
    referenceCount: rejectedBidsReference.value.length 
  })
  return hasRejectedCurrentBids || hasReferenceRejectedBids
})

// Add modal state
const showFinalizeModal = ref(false)

// Add this near the top with other refs
const isUpdatingPriorities = ref(false)

// Color palette for majors
const colorPalette = [
  { bg: 'bg-blue-100', text: 'text-blue-800', selectedBg: 'bg-blue-500'},
  { bg: 'bg-yellow-100', text: 'text-yellow-800', selectedBg: 'bg-yellow-500' },
  { bg: 'bg-pink-100', text: 'text-pink-800', selectedBg: 'bg-pink-500' },
  { bg: 'bg-red-100', text: 'text-red-800', selectedBg: 'bg-red-500' },
  { bg: 'bg-lime-100', text: 'text-lime-800', selectedBg: 'bg-lime-500' }
]

// Map to store major-color associations
const majorColorMap = ref(new Map())

// Computed properties
const uniqueProjectMajors = computed(() => {
  return [...new Set(projects.value.map(project => project.major))]
})

const filteredProjects = computed(() => {
  if (!searchQuery.value.trim()) {
    return projects.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return projects.value.filter(project => 
    project.Title?.toLowerCase().includes(query)
  )
})

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProjects.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredProjects.value.length / itemsPerPage))

// Add new ref for storing reference bids
const rejectedBidsReference = ref([])

// Add new computed property to determine which rejected bids to show
const visibleRejectedBids = computed(() => {
  // If finalized, don't show any rejected bids
  if (bidsFinalized.value) {
    return []
  }
  
  // Show both current rejected bids and reference bids
  const currentRejected = myBids.value.filter(b => b.status === 'rejected')
  
  console.log('Visible rejected bids calculation:', {
    currentRejected: currentRejected.length,
    referenceRejected: rejectedBidsReference.value.length
  })
  
  // Ensure we don't show duplicate bids (same project) from reference
  const referenceWithoutDuplicates = rejectedBidsReference.value.filter(refBid => 
    !currentRejected.some(curBid => curBid.projectId === refBid.projectId)
  )
  
  const combined = [...currentRejected, ...referenceWithoutDuplicates]
  console.log('Combined rejected bids:', combined.length)
  return combined
})

// Methods
const fetchLatestAcademicYear = async () => {
  try {
    const schoolId = userStore.currentUser.school
    if (!schoolId) {
      console.error('Error: No school ID found for current user')
      return
    }
    
    const latestYear = await getLatestAcademicYear(schoolId)
    if (latestYear) {
      academicYear.value = latestYear.academicYear
      academicYearId.value = latestYear.yearId
      console.log('Latest academic year:', academicYear.value, academicYearId.value)
    } else {
      console.error('No academic years found')
    }
  } catch (error) {
    console.error('Error fetching latest academic year:', error)
  }
}

const fetchUserNames = async (userIds) => {
  try {
    if (!userIds.length) return
    
    console.log('Debug - Fetching names for', userIds.length, 'users')
    
    // Clear the map before fetching new data
    userNamesMap.value.clear()
    
    // Get the current user's school ID
    const schoolId = userStore.currentUser.school
    
    if (!schoolId) {
      console.error('Error: No school ID found for current user')
      return
    }
    
    console.log(`Debug - Using school ID: ${schoolId}`)
    
    // Define the collection path using the current user's school
    const collectionPath = `schools/${schoolId}/users`
    
    // Fetch user documents directly
    for (const userId of userIds) {
      try {
        const userDocRef = doc(db, collectionPath, userId)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          
          // Store the user's name in the map using their ID as the key
          if (userData.name || userData.displayName || userData.email) {
            const userName = userData.name || userData.displayName || userData.email.split('@')[0]
            userNamesMap.value.set(userId, userName)
            console.log(`Found user: ${userId} -> ${userName}`)
          }
        }
      } catch (docError) {
        console.error(`Error fetching user: ${userId}`, docError.message)
      }
    }
    
    // If we couldn't find any users, add current user as fallback
    if (userNamesMap.value.size === 0 && userIds.includes(userStore.currentUser.uid)) {
      userNamesMap.value.set(
        userStore.currentUser.uid, 
        userStore.currentUser.name || userStore.currentUser.displayName || 'You'
      )
    }
    
    console.log(`Successfully fetched ${userNamesMap.value.size} user names`)
  } catch (error) {
    console.error('Error fetching user names:', error.message)
  }
}

const fetchProjects = async () => {
  try {
    console.log('Debug - fetchProjects called in StudentProject');
    loading.value = true;
    const schoolId = userStore.currentUser.school;
    const userMajor = userStore.currentUser.major;
    console.log('Debug - Using school ID:', schoolId, 'and major:', userMajor);
    
    if (!academicYearId.value || !userMajor) {
      console.error('Missing academic year or user major')
      return
    }
    
    // Clear existing projects
    projects.value = []
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    // Create a set to track unique user IDs
    const userIds = new Set()
    
    try {
      console.log(`Debug - Fetching projects for major: ${userMajor}`)
      const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId.value, userMajor)
      const majorDocs = await getDocs(majorRef)
      
      console.log(`Debug - Found ${majorDocs.docs.length} docs for major ${userMajor}`)
      
      if (!majorDocs.empty) {
        const majorDoc = majorDocs.docs[0]
        const majorDocId = majorDoc.id
        
        console.log(`Debug - Using majorDocId: ${majorDocId} for major ${userMajor}`)
        
        const projectsRef = collection(
          db, 
          'schools', 
          schoolId, 
          'projects', 
          academicYearId.value, 
          userMajor, 
          majorDocId,
          'projectsPerYear'
        )
        
        // Get all projects without filtering by userId
        const projectsDocs = await getDocs(projectsRef)
        
        console.log(`Debug - Found ${projectsDocs.docs.length} projects for major ${userMajor}`)
        
        for (const doc of projectsDocs.docs) {
          const projectId = doc.id
          const projectData = doc.data()
          
          // Add userId to the set of IDs to fetch
          if (projectData.userId) {
            userIds.add(projectData.userId)
          }
          
          // Check if project has any accepted bids
          const bidsRef = collection(projectsRef, projectId, 'bids')
          const bidsSnapshot = await getDocs(bidsRef)
          const hasAcceptedBid = bidsSnapshot.docs.some(bid => bid.data().status === 'accepted')
          
          // Use Map to ensure uniqueness by project ID
          if (!projectsMap.has(projectId)) {
            projectsMap.set(projectId, {
              id: projectId,
              majorDocId,
              ...projectData,
              isAssigned: projectData.isAssigned || hasAcceptedBid
            })
          }
        }
      }
    } catch (majorError) {
      console.error(`Error fetching projects for major ${userMajor}:`, majorError)
    }
    
    // Convert map values to array
    projects.value = Array.from(projectsMap.values())
    
    console.log('Debug - Total unique loaded projects:', projects.value.length)
    
    // Fetch user names for all projects
    if (userIds.size > 0) {
      await fetchUserNames(Array.from(userIds))
    }
    
  } catch (error) {
    console.error('Error fetching projects:', error)
  } finally {
    loading.value = false
  }
}

const getUserName = (userId) => {
  // If it's the current user, use their name from the userStore
  if (userId === userStore.currentUser.uid) {
    return userStore.currentUser.name || userStore.currentUser.displayName || 'You';
  }
  
  // If we have the name in our map, use it
  const name = userNamesMap.value.get(userId);
  if (name) return name;
  
  // Otherwise, format the user ID to be more readable
  // Show first 4 and last 4 characters of the ID
  if (userId && userId.length > 8) {
    return `User ${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}`;
  }
  
  return 'Unknown User';
}

const getMajorColorClasses = (major) => {
  if (!majorColorMap.value.has(major)) {
    // Assign next available color or cycle back to start
    const colorIndex = majorColorMap.value.size % colorPalette.length
    const baseColor = colorPalette[colorIndex]
    
    // Use explicit selected states or fallback to the pattern
    let selectedClass;
    selectedClass = baseColor.selectedBg + ' text-white shadow-sm'
      
    majorColorMap.value.set(major, {
      ...baseColor,
      selected: selectedClass
    })
  }
  return majorColorMap.value.get(major)
}

const handleBid = async (projectId) => {
  try {
    if (bidsFinalized.value) {
      alert('Your bids have been finalized. No changes allowed.')
      return
    }

    if (bidCount.value >= 3) {
      alert('You have reached the maximum limit of 3 bids')
      return
    }

    if (biddedProjectIds.value.has(projectId)) {
      alert('You have already bid on this project')
      return
    }

    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid
    const userMajor = userStore.currentUser.major
    
    const newBidId = doc(collection(db, 'schools')).id

    const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId.value, userMajor)
    const majorDocs = await getDocs(majorRef)
    
    if (majorDocs.empty) {
      throw new Error('Major document not found')
    }
    
    const majorDocId = majorDocs.docs[0].id
    const nextPriority = bidCount.value + 1
    biddedProjectIds.value.add(projectId)

    const projectRef = doc(db,
      'schools', schoolId,
      'projects', academicYearId.value,
      userMajor, majorDocId,
      'projectsPerYear', projectId
    )
    
    const projectDoc = await getDoc(projectRef)
    if (!projectDoc.exists()) {
      throw new Error('Project not found')
    }
    
    const projectData = projectDoc.data()
    const timestamp = new Date()

    const studentBidData = {
      projectId,
      majorId: userMajor,
      majorDocId,
      year: academicYearId.value,
      status: 'pending',
      priority: nextPriority,
      createdAt: timestamp,
      updatedAt: timestamp,
      finalized: false
    }

    // Only write to student's bids collection
    const studentBidRef = doc(db,
      'schools', schoolId,
      'studentBids', studentId,
      'bids', newBidId
    )

    await setDoc(studentBidRef, studentBidData)

    // Add to local array immediately for responsive UI
    myBids.value.push({
      id: newBidId,
      ...studentBidData,
      project: {
        id: projectId,
        ...projectData
      }
    })
    
    bidCount.value = myBids.value.length
    
    // Sort bids by priority
    myBids.value.sort((a, b) => a.priority - b.priority)
  } catch (error) {
    console.error('Error placing bid:', error)
    biddedProjectIds.value.delete(projectId)
    alert('Failed to place bid. Please try again.')
    await fetchMyBids()
  }
}

const fetchMyBids = async () => {
  try {
    loadingBids.value = true
    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid

    // Clear existing unsubscribe if it exists
    if (unsubscribeBids.value) {
      unsubscribeBids.value()
    }

    const tempBiddedProjectIds = new Set()
    const bidsRef = collection(db,
      'schools', schoolId,
      'studentBids', studentId,
      'bids'
    )

    // Initial fetch to get all bids
    const bidsSnapshot = await getDocs(bidsRef)
    const bids = []
    
    let hasFinalized = false

    for (const bidDoc of bidsSnapshot.docs) {
      const bidData = bidDoc.data()
      
      if (bidData.finalized) {
        hasFinalized = true
      }

      if (bidData.projectId) {
        tempBiddedProjectIds.add(bidData.projectId)
      }
      
      try {
        const projectRef = doc(db,
          'schools', schoolId,
          'projects', bidData.year,
          bidData.majorId, bidData.majorDocId,
          'projectsPerYear', bidData.projectId
        )
        
        const projectDoc = await getDoc(projectRef)
        if (projectDoc.exists()) {
          const projectData = projectDoc.data()
          bids.push({
            id: bidDoc.id,
            ...bidData,
            project: {
              id: projectDoc.id,
              ...projectData
            }
          })
        }
      } catch (projectError) {
        console.error('Error fetching project for bid:', projectError)
      }
    }

    bids.sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority
      }
      const timeA = a.createdAt?.seconds || 0
      const timeB = b.createdAt?.seconds || 0
      return timeA - timeB
    })

    biddedProjectIds.value = tempBiddedProjectIds
    myBids.value = bids
    bidCount.value = bids.length
    bidsFinalized.value = hasFinalized
    
    // Set up real-time listener for bid updates
    unsubscribeBids.value = onSnapshot(bidsRef, async (snapshot) => {
      // Skip processing if we're currently updating priorities
      if (isUpdatingPriorities.value) return;
      
      let needsReordering = false;
      let statusChanged = false;
      
      for (const change of snapshot.docChanges()) {
        const bidData = change.doc.data()
        const bidId = change.doc.id
        
        if (change.type === 'modified') {
          // Find the bid in our array
          const bidIndex = myBids.value.findIndex(b => b.id === bidId)
          
          if (bidIndex !== -1) {
            const oldStatus = myBids.value[bidIndex].status
            // Update the bid with new data
            myBids.value[bidIndex] = {
              ...myBids.value[bidIndex],
              ...bidData
            }
            
            // Check if status changed
            if (bidData.status && oldStatus !== bidData.status) {
              statusChanged = true;
              const statusText = bidData.status.charAt(0).toUpperCase() + bidData.status.slice(1)
              const projectTitle = myBids.value[bidIndex].project?.Title || 'a project'
              
              // Create notification with enhanced styling and content for accepted bids
              const notification = document.createElement('div')
              notification.className = `fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0 ${
                bidData.status === 'accepted' ? 'bg-green-500 text-white' : 
                bidData.status === 'rejected' ? 'bg-red-500 text-white' : 
                'bg-blue-500 text-white'
              }`

              // Enhanced content for accepted bids
              if (bidData.status === 'accepted') {
                notification.innerHTML = `
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-bold">Congratulations!</span>
                    </div>
                    <p>Your bid for "${projectTitle}" has been accepted!</p>
                    <p class="text-sm mt-1">You can now proceed to work on this project.</p>
                    <div class="flex gap-2 mt-2">
                      <button onclick="window.location.href='/project-details/${myBids.value[bidIndex].projectId}'" 
                              class="text-sm bg-white text-green-600 px-3 py-1 rounded hover:bg-green-50 transition-colors">
                        View Project Details
                      </button>
                    </div>
                  </div>
                `
              } else {
                notification.textContent = `Your bid for "${projectTitle}" has been ${statusText}`
              }
              
              document.body.appendChild(notification)
              
              // Remove notification after 5 seconds for accepted bids, 3 seconds for others
              const timeout = bidData.status === 'accepted' ? 5000 : 3000
              setTimeout(() => {
                notification.style.transform = 'translateY(150%)'
                setTimeout(() => {
                  document.body.removeChild(notification)
                }, 300)
              }, timeout)
            }
          }
        } else if (change.type === 'removed') {
          // Remove the bid from our array
          const bidIndex = myBids.value.findIndex(b => b.id === bidId)
          if (bidIndex !== -1) {
            myBids.value.splice(bidIndex, 1)
            bidCount.value = myBids.value.length
            
            // Update biddedProjectIds
            if (bidData.projectId) {
              biddedProjectIds.value.delete(bidData.projectId)
            }
          }
        }
      }

      // After processing all changes, check if all bids are now rejected
      if (statusChanged && allBidsRejected.value) {
        // Reset finalization state since all bids were rejected
        bidsFinalized.value = false
        
        // Show notification about starting new bids
        const notification = document.createElement('div')
        notification.className = 'fixed bottom-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0'
        notification.textContent = 'All your bids have been rejected. You can start a new round of bidding.'
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.style.transform = 'translateY(150%)'
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 3000)
        }, 3000)
      }
      
      // Check if any bid was just accepted
      const newlyAcceptedBid = myBids.value.find(bid => 
        bid.status === 'accepted' && 
        snapshot.docChanges().some(change => 
          change.doc.id === bid.id && 
          change.type === 'modified' && 
          change.doc.data().status === 'accepted'
        )
      )
      
      if (newlyAcceptedBid) {
        // Show a more prominent notification for accepted bid
        const projectTitle = newlyAcceptedBid.project?.Title || 'your project'
        
        // This notification is in addition to the individual bid notification
        // and focuses on next steps
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl transform transition-transform duration-500 translate-y-0 max-w-md'
        notification.innerHTML = `
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <svg class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="font-bold text-lg">Project Assigned!</span>
            </div>
            <p>Great news! Your bid for "${projectTitle}" has been accepted.</p>
            <p class="text-sm">You should now:</p>
            <ul class="text-sm list-disc list-inside pl-2">
              <li>Review the project details</li>
              <li>Contact your project supervisor</li>
              <li>Begin planning your approach</li>
            </ul>
            <div class="flex justify-end mt-2">
              <button 
                onclick="document.querySelector('[data-tab=mybid]')?.click()"
                class="px-4 py-2 bg-white text-green-700 rounded-md hover:bg-green-50 transition-colors text-sm font-medium"
              >
                View My Bids
              </button>
            </div>
          </div>
        `
        document.body.appendChild(notification)
        
        // Keep this notification visible longer (8 seconds)
        setTimeout(() => {
          notification.style.transform = 'translateY(-150%)'
          setTimeout(() => {
            document.body.removeChild(notification)
          }, 500)
        }, 8000)
      }
    })
  } catch (error) {
    console.error('Error fetching bids:', error)
  } finally {
    loadingBids.value = false
  }
}

const cancelBid = async (bidId) => {
  try {
    if (bidsFinalized.value) {
      alert('Your bids have been finalized. No changes allowed.')
      return
    }

    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid

    // Set the flag to prevent listener interference
    isUpdatingPriorities.value = true

    const studentBidRef = doc(db,
      'schools', schoolId,
      'studentBids', studentId,
      'bids', bidId
    )
    
    const bidDoc = await getDoc(studentBidRef)
    if (!bidDoc.exists()) {
      throw new Error('Bid not found')
    }
    
    const bidData = bidDoc.data()
    const projectId = bidData.projectId

    // Find the bid index before any modifications
    const bidIndex = myBids.value.findIndex(bid => bid.id === bidId)
    if (bidIndex === -1) {
      throw new Error('Bid not found in local array')
    }

    // Create a copy of bids array without the bid to be removed
    const updatedBids = myBids.value.filter(bid => bid.id !== bidId)
    
    // Update priorities for remaining bids
    const priorityUpdates = updatedBids.map((bid, index) => ({
      ...bid,
      priority: index + 1,
      updatedAt: new Date()
    }))

    try {
      // First, update all remaining bids with new priorities
      if (priorityUpdates.length > 0) {
        const updatePromises = priorityUpdates.map(bid => {
          const bidRef = doc(db,
            'schools', schoolId,
            'studentBids', studentId,
            'bids', bid.id
          )
          
          // Only update necessary fields
          return setDoc(bidRef, {
            priority: bid.priority,
            updatedAt: bid.updatedAt
          }, { merge: true })
        })
        
        await Promise.all(updatePromises)
      }

      // Then delete the bid
      await deleteDoc(studentBidRef)

      // Update local state after successful Firestore updates
      if (projectId) {
        biddedProjectIds.value.delete(projectId)
      }
      
      // Update local array with new priorities
      myBids.value = priorityUpdates.map(bid => ({
        ...bid,
        project: myBids.value.find(b => b.id === bid.id)?.project
      }))
      bidCount.value = myBids.value.length

    } catch (error) {
      console.error('Error updating priorities:', error)
      // If there's an error, refresh the bids to ensure consistency
      await fetchMyBids()
    }
  } catch (error) {
    console.error('Error canceling bid:', error)
    alert('Failed to cancel bid. Please try again.')
    await fetchMyBids()
  } finally {
    // Reset the flag after all operations are complete
    isUpdatingPriorities.value = false
  }
}

// Update finalize bids function
const finalizeBids = () => {
  if (myBids.value.length === 0) {
    alert('Please place at least one bid before finalizing')
    return
  }
  showFinalizeModal.value = true
}

// Modify confirmFinalization to clear reference bids
const confirmFinalization = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid

    console.log('Before finalization: Reference bids count:', rejectedBidsReference.value.length)
    
    // Clear reference bids when finalizing
    rejectedBidsReference.value = []
    
    console.log('After clearing reference bids:', rejectedBidsReference.value.length)

    // Update all bids in both collections
    const updatePromises = myBids.value.map(async (bid) => {
      // Update in student collection
      const studentBidRef = doc(db,
        'schools', schoolId,
        'studentBids', studentId,
        'bids', bid.id
      )

      // Create in project collection
      const projectBidRef = doc(db,
        'schools', schoolId,
        'projects', bid.year,
        bid.majorId, bid.majorDocId,
        'projectsPerYear', bid.projectId,
        'bids', bid.id
      )

      const bidData = {
        studentId,
        status: 'pending',
        priority: bid.priority,
        createdAt: bid.createdAt,
        updatedAt: new Date(),
        finalized: true
      }

      return Promise.all([
        setDoc(studentBidRef, { finalized: true }, { merge: true }),
        setDoc(projectBidRef, bidData)
      ])
    })

    await Promise.all(updatePromises.flat())
    bidsFinalized.value = true
    showFinalizeModal.value = false
    
    console.log('After finalization:', { 
      finalized: bidsFinalized.value,
      referenceBidsCount: rejectedBidsReference.value.length,
      hasAnyRejected: hasAnyRejectedBids.value
    })
    
    // Show success message
    const successMessage = document.createElement('div')
    successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0'
    successMessage.textContent = 'Your bids have been finalized successfully'
    document.body.appendChild(successMessage)
    
    // Remove success message after 3 seconds
    setTimeout(() => {
      successMessage.style.transform = 'translateY(150%)'
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 300)
    }, 3000)
  } catch (error) {
    console.error('Error finalizing bids:', error)
    showFinalizeModal.value = false
    
    // Show error message
    const errorMessage = document.createElement('div')
    errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0'
    errorMessage.textContent = 'Failed to finalize bids. Please try again.'
    document.body.appendChild(errorMessage)
    
    // Remove error message after 3 seconds
    setTimeout(() => {
      errorMessage.style.transform = 'translateY(150%)'
      setTimeout(() => {
        document.body.removeChild(errorMessage)
      }, 300)
    }, 3000)
  }
}

// Reset pagination when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Watch for projects length changes to reset page if needed
watch(projects, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
})

// Modify handleStartNewBids function
const handleStartNewBids = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid

    // Store current rejected bids in reference array with full project data
    const rejectedBids = myBids.value.filter(bid => bid.status === 'rejected')
    console.log('Rejected bids before storing as reference:', rejectedBids.length)
    
    // Make sure we create a new array with full copies, not references
    rejectedBidsReference.value = rejectedBids.map(bid => ({
      ...bid,
      isReference: true,  // Add flag to identify reference bids
      project: { ...bid.project }  // Make sure to copy project data properly
    }))
    
    console.log('Reference bids after storing:', rejectedBidsReference.value.length)

    // Only delete rejected bids from the student's bids collection
    // We keep them in the project's collection for record-keeping
    const updatePromises = rejectedBids.map(bid => {
      // Delete from student's bids collection only
      const studentBidRef = doc(db,
        'schools', schoolId,
        'studentBids', studentId,
        'bids', bid.id
      )

      return deleteDoc(studentBidRef)
    })

    await Promise.all(updatePromises)
    
    // Reset local state
    bidsFinalized.value = false
    biddedProjectIds.value.clear()
    
    // Update myBids to remove rejected bids
    myBids.value = myBids.value.filter(bid => bid.status !== 'rejected')
    bidCount.value = myBids.value.length
    
    console.log('After removing rejected bids:', { 
      myBidsCount: myBids.value.length, 
      referenceCount: rejectedBidsReference.value.length,
      hasAnyRejected: hasAnyRejectedBids.value
    })

    // Show success message
    const successMessage = document.createElement('div')
    successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0'
    successMessage.textContent = 'Previous bids cleared. You can now start bidding again!'
    document.body.appendChild(successMessage)
    
    setTimeout(() => {
      successMessage.style.transform = 'translateY(150%)'
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 300)
    }, 3000)

  } catch (error) {
    console.error('Error starting new bids:', error)
    alert('Failed to clear previous bids. Please try again.')
  }
}

const openProjectDetailsWindow = async (project) => {
  try {
    // First show a loading window
    const newWindow = window.open('', '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loading...</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading project details...</p>
          </div>
        </div>
      </body>
      </html>
    `);
    
    // Get user name for creator
    let creatorName = getUserName(project.userId) || 'Unknown';
    
    // Get project headers from the majorDocId document
    const schoolId = userStore.currentUser.school;
    const majorId = project.major;
    const majorDocId = project.majorDocId;
    const year = academicYearId.value;
    
    console.log('Debug - Fetching headers with:', { schoolId, year, majorId, majorDocId });
    
    let headers = {};
    
    // Fetch the headers map from the majorDocId document
    if (schoolId && year && majorId && majorDocId) {
      try {
        const majorDocRef = doc(db, 
          'schools', schoolId, 
          'projects', year, 
          majorId, majorDocId // Use correct path based on Firestore structure
        );
        
        const majorDoc = await getDoc(majorDocRef);
        if (majorDoc.exists()) {
          const majorData = majorDoc.data();
          if (majorData.headers && typeof majorData.headers === 'object') {
            headers = majorData.headers;
            console.log('Found headers:', Object.keys(headers));
          } else {
            console.log('No headers found in major document');
          }
        } else {
          console.log('Major document not found');
        }
      } catch (error) {
        console.error('Error fetching headers:', error);
      }
    } else {
      console.log('Missing data for headers fetch:', { schoolId, year, majorId, majorDocId });
    }
    
    // Create color class for major
    const majorColorClass = getMajorColorClasses(project.major);
    const [bgClass, textClass] = majorColorClass ? [majorColorClass.bg, majorColorClass.text] : ['bg-blue-100', 'text-blue-800'];
    
    // Get only the fields that are in the headers
    const projectFields = {};
    
    // If we have headers, use them to filter fields
    if (Object.keys(headers).length > 0) {
      for (const [key, value] of Object.entries(project)) {
        if (headers[key] && key !== 'Title') { // Skip Title field
          projectFields[key] = value;
        }
      }
    } else {
      // Fallback: exclude some standard fields if no headers found
      const excludedFields = ['id', 'userId', 'isAssigned', 'createdAt', 'Title', 'major', 'Description', 'majorDocId'];
      for (const [key, value] of Object.entries(project)) {
        if (!excludedFields.includes(key)) {
          projectFields[key] = value;
        }
      }
    }
    
    // Helper function to format field names
    const formatFieldName = (key) => {
      // If we have a header label, use it
      if (headers[key] && headers[key].label) {
        return headers[key].label;
      }
      
      // Otherwise format the key
      return key
        .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
        .replace(/^./, (str) => str.toUpperCase()); // Uppercase the first letter
    };
    
    // Helper function to format field values
    const formatFieldValue = (value) => {
      if (value === null || value === undefined) return 'Not specified';
      
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      
      if (Array.isArray(value)) {
        return value.map(item => 
          `<span class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">${item}</span>`
        ).join('');
      }
      
      if (typeof value === 'object') {
        if (value.toDate && typeof value.toDate === 'function') {
          return value.toDate().toLocaleDateString();
        }
        // Handle other objects by converting to string but removing brackets and quotes
        return JSON.stringify(value).replace(/[[\]"]/g, '');
      }
      
      return value;
    };
    
    // Generate fields HTML
    let fieldsHtml = '';
    for (const [key, value] of Object.entries(projectFields)) {
      fieldsHtml += `
        <div class="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 class="text-sm font-medium text-gray-500 mb-1">${formatFieldName(key)}</h3>
          <div class="text-gray-900">${formatFieldValue(value)}</div>
        </div>
      `;
    }
    
    // Create HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.Title} - Project Details</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen p-8">
          <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <!-- Project Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900">${project.Title}</h1>
              <div class="mt-2 flex items-center">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${textClass}">
                  ${project.major}
                </span>
                <span class="mx-2 text-gray-300">•</span>
                <span class="text-sm text-gray-500">Created by ${creatorName}</span>
              </div>
            </div>

            <!-- Project Description -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              ${project.Description 
                ? `<div class="text-gray-700 whitespace-pre-line">${project.Description}</div>`
                : `<div class="text-gray-500 italic">No description provided</div>`
              }
            </div>

            <!-- Project Details Fields -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
              ${Object.keys(projectFields).length > 0 ? 
                `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${fieldsHtml}
                </div>` : 
                `<div class="text-gray-500 italic">No additional details available</div>`
              }
            </div>

            <!-- Close Print Button -->
            <div class="mt-10 flex justify-end">
              <button
                onclick="window.close()"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  } catch (error) {
    console.error('Error opening project details window:', error);
    alert('There was an error opening the project details. Please try again.');
  }
}

onMounted(async () => {
  console.log('Student Project page loaded')
  console.log('Current user role:', userStore.userRole)
  
  await fetchLatestAcademicYear()
  if (academicYearId.value) {
    await Promise.all([
      fetchProjects(),
      fetchMyBids()
    ])
  } else {
    loading.value = false
  }
})

onUnmounted(() => {
  // Clean up function on component unmount
  if (unsubscribeBids.value) {
    unsubscribeBids.value()
  }
})
</script>

<style scoped>
/* No custom styles needed as we're using Tailwind classes */
</style> 