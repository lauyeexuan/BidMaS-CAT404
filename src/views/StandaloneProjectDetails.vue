<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
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

      <!-- Project Details -->
      <div v-else-if="project" class="space-y-8">
        <!-- Project Header -->
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

        <!-- Project Description -->
        <div class="prose max-w-none">
          <h2 class="text-xl font-semibold text-gray-900">Description</h2>
          <div v-if="project.Description" class="text-gray-700 whitespace-pre-line">{{ project.Description }}</div>
          <div v-else class="text-gray-500 italic">No description provided</div>
        </div>

        <!-- Project Details Fields -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(value, key) in projectFields" :key="key" class="border border-gray-200 rounded-md p-4 bg-gray-50">
              <h3 class="text-sm font-medium text-gray-500 mb-1">{{ formatFieldName(key) }}</h3>
              <div class="text-gray-900">{{ formatFieldValue(value) }}</div>
            </div>
          </div>
        </div>

        <!-- Close Print Button -->
        <div class="mt-6 flex justify-between">
          <button
            @click="closeWindow"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
          <button
            @click="printPage"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Project Not Found</h3>
        <p class="mt-1 text-sm text-gray-500">The project you're looking for does not exist or you don't have permission to view it.</p>
        <div class="mt-6">
          <button
            @click="closeWindow"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { collection, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'

// Refs
const route = useRoute()
const loading = ref(true)
const project = ref(null)
const creatorName = ref('Unknown')
const userStore = useUserStore()

// Color palette
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
  const excludedFields = ['id', 'userId', 'isAssigned', 'createdAt', 'Title', 'major', 'Description']
  excludedFields.forEach(field => {
    delete fieldsToDisplay[field]
  })
  
  return fieldsToDisplay
})

// Methods
const closeWindow = () => {
  window.close()
}

const printPage = () => {
  window.print()
}

const getMajorColorClasses = (major) => {
  if (!majorColorMap.value.has(major)) {
    // Assign next available color or cycle back to start
    const colorIndex = majorColorMap.value.size % colorPalette.length
    const baseColor = colorPalette[colorIndex]
    
    majorColorMap.value.set(major, baseColor.bg + ' ' + baseColor.text)
  }
  return majorColorMap.value.get(major)
}

const formatFieldName = (key) => {
  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Uppercase the first letter
}

const formatFieldValue = (value) => {
  if (value === null || value === undefined) return 'Not specified'
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }
  
  if (typeof value === 'object') {
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate().toLocaleDateString()
    }
    return JSON.stringify(value)
  }
  
  return value
}

const fetchProjectDetails = async () => {
  try {
    loading.value = true
    const projectRef = doc(collection(db, 'projects'), projectId.value)
    const projectSnap = await getDoc(projectRef)
    
    if (projectSnap.exists()) {
      project.value = { id: projectSnap.id, ...projectSnap.data() }
      
      // Fetch creator name if we have a userId
      if (project.value.userId) {
        try {
          const userRef = doc(collection(db, 'users'), project.value.userId)
          const userSnap = await getDoc(userRef)
          
          if (userSnap.exists()) {
            const userData = userSnap.data()
            creatorName.value = userData.name || userData.displayName || 'Unknown'
          }
        } catch (error) {
          console.error('Error fetching creator details:', error)
        }
      }
    } else {
      project.value = null
    }
  } catch (error) {
    console.error('Error fetching project details:', error)
    project.value = null
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchProjectDetails()
  // Set the page title
  document.title = 'Project Details'
})
</script>

<style>
@media print {
  button {
    display: none !important;
  }
}
</style> 