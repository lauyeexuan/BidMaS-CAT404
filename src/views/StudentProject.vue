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
                <tr v-for="(project, index) in paginatedProjects" :key="index">
                  <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ project.Title }}
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <!-- Show different button based on whether project has been bid on or bids are finalized -->
                    <button 
                      v-if="biddedProjectIds.has(project.id)"
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
                      <svg v-if="!bidIconLoaded" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      <img 
                        v-if="bidIconLoaded"
                        src="@/assets/bid.png" 
                        alt="Bid" 
                        class="h-4 w-4 mr-1.5 object-contain" 
                        @error="bidIconLoaded = false"
                      />
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
              <p v-if="bidsFinalized" class="mt-2 text-sm text-green-600">
                Your bids have been finalized and submitted to lecturers
              </p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">
                {{ bidCount }}/3 bids used
              </span>
              <button 
                v-if="!bidsFinalized && myBids.length > 0"
                @click="finalizeBids"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Finalize Bids
              </button>
            </div>
          </div>

          <div v-if="myBids.length > 0" class="space-y-4">
            <div v-for="bid in myBids" :key="bid.id" 
              class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
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
                          'bg-red-100 text-red-800': bid.status === 'rejected'
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
                  v-if="!bidsFinalized"
                  @click="cancelBid(bid.id)"
                  class="text-sm text-red-600 hover:text-red-800"
                >
                  Cancel Bid
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
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
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { db } from '@/firebase'
import { doc, collection, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { getLatestAcademicYear, formatAcademicYear } from '@/utils/latestAcademicYear'

const userStore = useUserStore()
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

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Add a new ref to track bid projects
const biddedProjectIds = ref(new Set())

// Add new ref for finalization status
const bidsFinalized = ref(false)

// Add modal state
const showFinalizeModal = ref(false)

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
    console.log('Debug - fetchProjects called in StudentProject')
    loading.value = true
    const schoolId = userStore.currentUser.school
    const userMajor = userStore.currentUser.major
    console.log('Debug - Using school ID:', schoolId, 'and major:', userMajor)
    
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
        
        projectsDocs.forEach(doc => {
          const projectId = doc.id
          const projectData = doc.data()
          
          // Add userId to the set of IDs to fetch
          if (projectData.userId) {
            userIds.add(projectData.userId)
          }
          
          // Use Map to ensure uniqueness by project ID
          if (!projectsMap.has(projectId)) {
            projectsMap.set(projectId, {
              id: projectId,
              ...projectData
            })
          }
        })
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

    myBids.value.push({
      id: newBidId,
      ...studentBidData,
      project: {
        id: projectId,
        ...projectData
      }
    })
    
    bidCount.value = myBids.value.length
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

    const tempBiddedProjectIds = new Set()
    const bidsRef = collection(db,
      'schools', schoolId,
      'studentBids', studentId,
      'bids'
    )

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

    if (projectId) {
      biddedProjectIds.value.delete(projectId)
    }

    // Only delete from student's collection
    await deleteDoc(studentBidRef)

    const bidIndex = myBids.value.findIndex(bid => bid.id === bidId)
    if (bidIndex !== -1) {
      myBids.value.splice(bidIndex, 1)
      bidCount.value = myBids.value.length
      
      myBids.value.forEach((bid, index) => {
        bid.priority = index + 1
      })
      
      // Update priorities in student collection only
      if (myBids.value.length > 0) {
        const updatePromises = myBids.value.map(bid => {
          const studentBidRef = doc(db,
            'schools', schoolId,
            'studentBids', studentId,
            'bids', bid.id
          )
          return setDoc(studentBidRef, { priority: bid.priority }, { merge: true })
        })
        
        await Promise.all(updatePromises)
      }
    }
  } catch (error) {
    console.error('Error canceling bid:', error)
    alert('Failed to cancel bid. Please try again.')
    await fetchMyBids()
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

// Add new confirmation function
const confirmFinalization = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid

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
</script>

<style scoped>
/* No custom styles needed as we're using Tailwind classes */
</style> 