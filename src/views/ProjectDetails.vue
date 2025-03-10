<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <!-- Back Button -->
      <div class="mb-6">
        <button 
          @click="goBack" 
          class="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Return to Projects List
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <svg class="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading project details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading project</h3>
            <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
            <button 
              @click="fetchProjectDetails" 
              class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Project Details -->
      <div v-else-if="project" class="space-y-8">
        <!-- Project Header with Bid Button -->
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ project.Title }}</h1>
            <div class="mt-2 flex items-center">
              <span 
                class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getMajorColorClasses(project.major)"
              >
                {{ project.major }}
              </span>
              <span class="mx-2 text-gray-300">•</span>
              <span class="text-sm text-gray-500">Created by {{ creatorName }}</span>
            </div>
          </div>
          
          <!-- Bid Action Button (conditionally shown) -->
          <div v-if="!project.isAssigned && !hasBid && !bidsFinalized">
            <button 
              @click="placeBid"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Bid on this Project
            </button>
          </div>
          <div v-else-if="hasBid" class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <svg class="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Bid Placed
            </span>
          </div>
          <div v-else-if="project.isAssigned" class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Project Assigned
            </span>
          </div>
          <div v-else-if="bidsFinalized" class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Bids Locked
            </span>
          </div>
        </div>

        <!-- Project Details Sections -->
        <div class="border-t border-gray-200 pt-6">
          <div class="prose max-w-none">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            
            <!-- Project Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Display each project field dynamically -->
              <div v-for="(value, key) in projectFields" :key="key" class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-medium text-gray-700 mb-2">{{ formatFieldName(key) }}</h3>
                <div>
                  <!-- Handle different value types -->
                  <template v-if="Array.isArray(value)">
                    <ul class="list-disc list-inside space-y-1 text-gray-600">
                      <li v-for="(item, index) in value" :key="index">{{ item }}</li>
                    </ul>
                  </template>
                  <template v-else-if="typeof value === 'boolean'">
                    <span 
                      :class="value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {{ value ? 'Yes' : 'No' }}
                    </span>
                  </template>
                  <template v-else>
                    <p class="text-gray-600">{{ value || 'Not specified' }}</p>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Project Found -->
      <div v-else class="py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No project found</h3>
        <p class="mt-1 text-sm text-gray-500">The requested project does not exist or you don't have permission to view it.</p>
        <div class="mt-6">
          <button 
            @click="goBack" 
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Projects List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { db } from '@/firebase'
import { doc, getDoc, collection, getDocs, addDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// State
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const project = ref(null)
const creatorName = ref('')
const bidsFinalized = ref(false)
const hasBid = ref(false)
const userBid = ref(null)
const academicYearId = ref('')
const majorDocId = ref('')
// Add unsubscribe ref for cleanup
const unsubscribe = ref(null)

// Color palette for majors
const colorPalette = [
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
  { bg: 'bg-red-100', text: 'text-red-800' },
  { bg: 'bg-lime-100', text: 'text-lime-800' }
]

// Map to store major-color associations
const majorColorMap = ref(new Map())

// Computed
const projectId = computed(() => route.params.projectId)

const projectFields = computed(() => {
  if (!project.value) return {}
  
  // Return a filtered object with only the fields we want to display
  const fieldsToDisplay = {...project.value}
  
  // Remove fields we don't want to display
  const excludedFields = ['id', 'userId', 'isAssigned', 'createdAt', 'Title', 'major']
  excludedFields.forEach(field => {
    delete fieldsToDisplay[field]
  })
  
  return fieldsToDisplay
})

// Methods
const goBack = () => {
  router.back()
}

const fetchProjectDetails = async () => {
  try {
    loading.value = true
    error.value = false
    
    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid
    
    // Get latest academic year
    const latestYear = await getLatestAcademicYear(schoolId)
    if (latestYear) {
      academicYearId.value = latestYear.yearId
    } else {
      throw new Error('No academic year found')
    }
    
    // We need to find the majorDocId first by searching through all majors
    const majors = userStore.currentUser.major ? [userStore.currentUser.major] : []
    
    let foundProject = null
    let foundMajorDocId = null
    
    // Search for the project in each major
    for (const major of majors) {
      const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId.value, major)
      const majorDocs = await getDocs(majorRef)
      
      if (!majorDocs.empty) {
        for (const majorDoc of majorDocs.docs) {
          const projectRef = doc(db, 
            'schools', schoolId, 
            'projects', academicYearId.value, 
            major, majorDoc.id, 
            'projectsPerYear', projectId.value
          )
          
          const projectDoc = await getDoc(projectRef)
          
          if (projectDoc.exists()) {
            foundProject = {
              id: projectDoc.id,
              ...projectDoc.data()
            }
            foundMajorDocId = majorDoc.id
            break
          }
        }
      }
      
      if (foundProject) break
    }
    
    if (foundProject) {
      project.value = foundProject
      majorDocId.value = foundMajorDocId
      
      // Get creator's name
      if (foundProject.userId) {
        const userRef = doc(db, 'schools', schoolId, 'users', foundProject.userId)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          creatorName.value = userData.name || userData.displayName || 'Unknown Creator'
        } else {
          creatorName.value = 'Unknown Creator'
        }
      }
      
      // Check if student has bid on this project
      const studentBidsRef = collection(db, 'schools', schoolId, 'studentBids', studentId, 'bids')
      const studentBidsSnapshot = await getDocs(studentBidsRef)
      
      for (const doc of studentBidsSnapshot.docs) {
        const bidData = doc.data()
        
        if (bidData.projectId === projectId.value) {
          hasBid.value = true
          userBid.value = {
            id: doc.id,
            ...bidData
          }
          
          // Check if bids are finalized
          if (bidData.finalized) {
            bidsFinalized.value = true
          }
          
          break
        }
      }
      
      // If no specific bid found, check if any bids are finalized
      if (!hasBid.value && !studentBidsSnapshot.empty) {
        bidsFinalized.value = studentBidsSnapshot.docs.some(doc => doc.data().finalized)
      }
    } else {
      project.value = null
      error.value = true
      errorMessage.value = 'Project not found or you do not have permission to view it.'
    }
  } catch (err) {
    console.error('Error fetching project details:', err)
    error.value = true
    errorMessage.value = err.message || 'Failed to load project details'
  } finally {
    loading.value = false
  }
}

const getMajorColorClasses = (major) => {
  if (!majorColorMap.value.has(major)) {
    // Assign next available color or cycle back to start
    const colorIndex = majorColorMap.value.size % colorPalette.length
    majorColorMap.value.set(major, colorPalette[colorIndex])
  }
  return majorColorMap.value.get(major)
}

const formatFieldName = (key) => {
  // Convert camelCase or snake_case to Title Case with spaces
  return key
    // Add space before capital letters and uppercase the first character
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores with spaces
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase())
    // Trim any leading spaces
    .trim()
}

const placeBid = async () => {
  try {
    if (bidsFinalized.value) {
      alert('Your bids have been finalized. No changes allowed.')
      return
    }
    
    const schoolId = userStore.currentUser.school
    const studentId = userStore.currentUser.uid
    const userMajor = userStore.currentUser.major
    
    // First, check if the student already has 3 bids
    const studentBidsRef = collection(db, 'schools', schoolId, 'studentBids', studentId, 'bids')
    const studentBidsSnapshot = await getDocs(studentBidsRef)
    
    if (studentBidsSnapshot.size >= 3) {
      alert('You have reached the maximum limit of 3 bids')
      return
    }
    
    // Create a new bid
    const newBidId = doc(collection(db, 'schools')).id
    const nextPriority = studentBidsSnapshot.size + 1
    const timestamp = new Date()
    
    const bidData = {
      projectId: projectId.value,
      majorId: userMajor,
      majorDocId: majorDocId.value,
      year: academicYearId.value,
      status: 'pending',
      priority: nextPriority,
      createdAt: timestamp,
      updatedAt: timestamp,
      finalized: false
    }
    
    // Add the bid to the student's bids collection
    const studentBidRef = doc(db, 'schools', schoolId, 'studentBids', studentId, 'bids', newBidId)
    await setDoc(studentBidRef, bidData)
    
    // Update local state
    hasBid.value = true
    userBid.value = {
      id: newBidId,
      ...bidData
    }
    
    // Remove the alert message and redirection
    // alert('Bid placed successfully!')
    
    // Stay on the current page instead of redirecting
    // router.push('/projects')
  } catch (error) {
    console.error('Error placing bid:', error)
    alert('Failed to place bid. Please try again.')
  }
}

// Add a function to set up a real-time listener for bid status updates
const setupBidStatusListener = async () => {
  if (!userStore.currentUser) return;
  
  const schoolId = userStore.currentUser.school;
  const studentId = userStore.currentUser.uid;
  
  // Clean up previous listener if exists
  if (unsubscribe.value) {
    unsubscribe.value();
  }
  
  // Set up real-time listener for the student's bids
  const studentBidsRef = collection(db, 'schools', schoolId, 'studentBids', studentId, 'bids');
  unsubscribe.value = onSnapshot(studentBidsRef, async (snapshot) => {
    // Only process if we have a project loaded
    if (!project.value) return;
    
    // Check for bid on current project
    let foundBid = false;
    let bidData = null;
    let isBidsFinalized = false;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if any bid is finalized
      if (data.finalized) {
        isBidsFinalized = true;
      }
      
      // Check if this bid is for current project
      if (data.projectId === projectId.value) {
        foundBid = true;
        bidData = {
          id: doc.id,
          ...data
        };
        break;
      }
    }
    
    // Update local state
    hasBid.value = foundBid;
    userBid.value = bidData;
    bidsFinalized.value = isBidsFinalized;
  });
}

// Lifecycle hooks
onMounted(() => {
  fetchProjectDetails();
  setupBidStatusListener();
})

// Add cleanup on unmount
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
})

// Add logic to handle navigation events
const handleRouteChange = () => {
  // Only refetch if the component is already mounted (not initial load)
  if (project.value !== null) {
    loading.value = true;
    fetchProjectDetails();
  }
}

// Watch for route changes to reload data when navigating back
router.beforeResolve((to, from, next) => {
  if (to.name === 'project-details' && from.name !== to.name) {
    next();
    // Small delay to ensure component is updated after navigation
    setTimeout(() => {
      if (to.params.projectId === projectId.value) {
        handleRouteChange();
      }
    }, 100);
  } else {
    next();
  }
});
</script> 