<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-6 py-8">
      <!-- Header with Academic Year -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Projects</h1>
        <div class="text-lg bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
          Academic Year: {{ latestAcademicYear }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-lg p-8 flex justify-center items-center">
        <p class="text-gray-600">Loading project settings...</p>
      </div>

      <!-- No Settings Found -->
      <div v-else-if="!projectSettings" class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center">
          <p class="text-gray-600 mb-4">No project settings found for the current academic year. Please contact an administrator to configure project settings.</p>
        </div>
      </div>

      <!-- Main Content with Tabs -->
      <div v-else class="bg-white rounded-lg shadow-lg">
        <!-- Tab Headers -->
        <div class="border-b border-gray-200">
          <div class="flex">
            <button 
              @click="activeTab = 'myProjects'"
              class="px-6 py-4 text-sm font-medium border-b-2 focus:outline-none"
              :class="[
                activeTab === 'myProjects' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              My Projects
            </button>
            <button 
              @click="activeTab = 'summary'"
              class="px-6 py-4 text-sm font-medium border-b-2 focus:outline-none"
              :class="[
                activeTab === 'summary' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Project Summary
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- My Projects Tab -->
          <div v-if="activeTab === 'myProjects'">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-4">
                <h2 class="text-2xl font-semibold text-gray-900">My Projects</h2>
                <span class="text-sm text-gray-500">(Total: {{ projects.length }})</span>
              </div>
              <button 
                @click="showNewProjectForm = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Project
              </button>
            </div>

            <!-- Projects Table -->
            <div v-if="projects.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th v-for="(config, headerName) in projectSettings.headers" 
                        :key="headerName"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {{ headerName }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(project, index) in paginatedProjects" :key="index">
                    <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </td>
                    <td v-for="(config, headerName) in projectSettings.headers" 
                        :key="headerName"
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {{ project[headerName] }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(project.createdAt) }}
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
              No projects created yet. Click "Add New Project" to get started.
            </div>
          </div>

          <!-- Project Summary Tab -->
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Headers Section -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Project Headers</h3>
                <div class="space-y-3">
                  <div v-for="(config, headerName) in projectSettings.headers" :key="headerName" 
                       class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="font-medium text-gray-900">{{ headerName }}</p>
                    <div v-if="config.type === 'array' && config.values && config.values.length > 0" class="mt-2">
                      <div class="flex flex-wrap gap-1">
                        <span 
                          v-for="value in config.values" 
                          :key="value" 
                          class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {{ value }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Milestones Section -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
                <div class="space-y-3">
                  <div v-for="(milestone, index) in projectSettings.milestones" :key="index" 
                       class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="font-medium text-gray-900">{{ milestone.description }}</p>
                    <p class="text-sm text-gray-500 flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      {{ formatDate(milestone.deadline) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Project Form Modal -->
      <div v-if="showNewProjectForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">
              {{ formStep === 1 ? 'Select Major' : formStep === 2 ? 'New Project Details' : 'Project Preview' }}
            </h2>
            <button 
              @click="cancelNewProject"
              class="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          <!-- Step indicator -->
          <div class="mb-10">
            <div class="flex items-center">
              <div class="flex items-center text-blue-600 relative">
                <div class="rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 border-blue-600 text-center">
                  <span class="text-blue-600 font-bold">1</span>
                </div>
                <div class="absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase" :class="formStep >= 1 ? 'text-blue-600' : 'text-gray-500'">
                  Select Major
                </div>
              </div>
              <div class="flex-auto border-t-2 transition duration-500 ease-in-out" :class="formStep > 1 ? 'border-blue-600' : 'border-gray-300'"></div>
              <div class="flex items-center text-white relative">
                <div class="rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 text-center" :class="formStep >= 2 ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-500'">
                  <span class="font-bold">2</span>
                </div>
                <div class="absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase" :class="formStep >= 2 ? 'text-blue-600' : 'text-gray-500'">
                  Project Details
                </div>
              </div>
              <div class="flex-auto border-t-2 transition duration-500 ease-in-out" :class="formStep > 2 ? 'border-blue-600' : 'border-gray-300'"></div>
              <div class="flex items-center text-white relative">
                <div class="rounded-full transition duration-500 ease-in-out h-12 w-12 py-3 border-2 text-center" :class="formStep >= 3 ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-500'">
                  <span class="font-bold">3</span>
                </div>
                <div class="absolute top-0 -ml-10 text-center mt-16 w-32 text-xs font-medium uppercase" :class="formStep >= 3 ? 'text-blue-600' : 'text-gray-500'">
                  Preview
                </div>
              </div>
            </div>
          </div>

          <!-- Step 1: Major Selection -->
          <div v-if="formStep === 1" class="space-y-6 mt-6">
            <div class="space-y-2">              
              <div v-if="availableMajors.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  v-for="major in availableMajors" 
                  :key="major"
                  @click="selectMajorForProject(major)"
                  class="p-4 border rounded-lg cursor-pointer transition-colors"
                  :class="tempSelectedMajor === major ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
                >
                  <div class="font-medium">{{ major }}</div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500">
                No majors available. Please contact an administrator.
              </div>
            </div>

            <div class="pt-5 border-t border-gray-200">
              <div class="flex justify-end gap-3">
                <button 
                  type="button"
                  @click="cancelNewProject"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  @click="goToStep(2)"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                  :disabled="!tempSelectedMajor"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Project Details Form -->
          <div v-else-if="formStep === 2" class="space-y-6">
            <div v-if="majorProjectSettings">
              <!-- Dynamic form fields based on project headers -->
              <div v-for="(config, headerName) in sortedHeaders" :key="headerName" class="space-y-2 mb-6">
                <label :for="headerName" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ headerName }}
                  <span v-if="config.required" class="text-red-500">*</span>
                </label>
                
                <!-- String input -->
                <input 
                  v-if="config.type === 'string'"
                  :id="headerName"
                  v-model="newProject[headerName]"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                  :placeholder="`Enter ${headerName.toLowerCase()}`"
                >
                
                <!-- Array/Select input -->
                <div v-else-if="config.type === 'array'" class="space-y-3">
                  <!-- Dropdown for fields with predefined values -->
                  <select
                    v-if="config.values && config.values.length > 0"
                    :id="headerName"
                    v-model="newProject[headerName]"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                  >
                    <option value="" disabled>Select {{ headerName.toLowerCase() }}</option>
                    <option v-for="value in config.values" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </select>

                  <!-- Text input + Add button for fields without predefined values -->
                  <template v-else>
                    <div class="flex gap-2">
                      <input 
                        type="text"
                        :id="`${headerName}-input`"
                        v-model="tempArrayValue"
                        @keyup.enter="addArrayValue(headerName)"
                        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
                        :placeholder="`Enter value for ${headerName.toLowerCase()}`"
                      >
                      <button 
                        @click="addArrayValue(headerName)"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    
                    <!-- Display added values as tags -->
                    <div v-if="newProject[headerName]?.length > 0" class="flex flex-wrap gap-2">
                      <div 
                        v-for="(value, index) in newProject[headerName]" 
                        :key="index"
                        class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {{ value }}
                        <button 
                          @click="removeArrayValue(headerName, index)"
                          class="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
                
                <!-- Label field (read-only) -->
                <div v-else-if="config.type === 'label'" class="mt-1 p-3 bg-gray-100 rounded-md text-sm text-gray-700">
                  This is a label field (no input required)
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">
              No project settings found for this major. Please contact an administrator.
            </div>

            <div class="pt-5 border-t border-gray-200">
              <div class="flex justify-between gap-3">
                <button 
                  type="button"
                  @click="goToStep(1)"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Back
                </button>
                <button 
                  type="button"
                  @click="goToStep(3)"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                  :disabled="!isFormValid"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Preview -->
          <div v-else-if="formStep === 3" class="space-y-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Project Preview</h3>
              
              <div class="space-y-4">
                <div class="flex border-b border-gray-200 pb-2">
                  <div class="w-1/3 font-medium text-gray-700">Major:</div>
                  <div class="w-2/3">{{ tempSelectedMajor }}</div>
                </div>
                
                <div v-for="(config, headerName) in sortedHeaders" :key="headerName" 
                     class="flex border-b border-gray-200 pb-2">
                  <div class="w-1/3 font-medium text-gray-700">{{ headerName }}:</div>
                  <div class="w-2/3">
                    <!-- Array values displayed as tags -->
                    <div v-if="config.type === 'array'" class="flex flex-wrap gap-2">
                      <!-- Single value for predefined arrays -->
                      <span 
                        v-if="config.values && config.values.length > 0"
                        class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {{ newProject[headerName] || 'N/A' }}
                      </span>
                      <!-- Multiple values for custom arrays -->
                      <template v-else>
                        <span 
                          v-for="(value, index) in newProject[headerName]" 
                          :key="index"
                          class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {{ value }}
                        </span>
                      </template>
                    </div>
                    <!-- Regular value display -->
                    <template v-else>
                      {{ newProject[headerName] || 'N/A' }}
                    </template>
                  </div>
                </div>
                
                <div class="flex border-b border-gray-200 pb-2">
                  <div class="w-1/3 font-medium text-gray-700">Academic Year:</div>
                  <div class="w-2/3">{{ latestAcademicYear }}</div>
                </div>
                
                <div class="flex">
                  <div class="w-1/3 font-medium text-gray-700">Created At:</div>
                  <div class="w-2/3">{{ formatDate(new Date()) }}</div>
                </div>
              </div>
            </div>

            <div class="pt-5 border-t border-gray-200">
              <div class="flex justify-between gap-3">
                <button 
                  type="button"
                  @click="goToStep(2)"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Back
                </button>
                <button 
                  type="button"
                  @click="saveProject"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="fixed top-5 right-5 z-50"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { db } from '@/firebase'
import { doc, collection, getDocs, query, where, getDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/userStore'
import { getLatestAcademicYear, formatAcademicYear } from '@/utils/latestAcademicYear'

const userStore = useUserStore()
const loading = ref(true)
const showNewProjectForm = ref(false)
const projectSettings = ref(null)
const latestAcademicYear = ref('')
const latestAcademicYearId = ref('')
const selectedMajor = ref('')
const projects = ref([])
const newProject = ref({})
const activeTab = ref('myProjects')

// New form step variables
const formStep = ref(1)
const tempSelectedMajor = ref('')
const availableMajors = ref([])
const majorProjectSettings = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(projects.value.length / itemsPerPage))
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return projects.value.slice(start, end)
})

// Watch for projects length changes to reset page if needed
watch(projects, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
})

// Computed property to sort headers with Title first, keep original order for others
const sortedHeaders = computed(() => {
  if (!majorProjectSettings.value?.headers) return {}
  
  // Get all headers
  const headers = majorProjectSettings.value.headers
  
  // Create new object with Title first
  const ordered = {}
  
  // Add Title if it exists
  if ('Title' in headers) {
    ordered['Title'] = headers['Title']
  }
  
  // Add all other headers in their original order
  Object.entries(headers).forEach(([key, value]) => {
    if (key !== 'Title') {
      ordered[key] = value
    }
  })
  
  return ordered
})

// Add new ref for temporary array value input
const tempArrayValue = ref('')

// Add new functions for array value management
const addArrayValue = (headerName) => {
  const value = tempArrayValue.value.trim()
  if (!value) return
  
  // Initialize array if it doesn't exist
  if (!newProject.value[headerName]) {
    newProject.value[headerName] = []
  }
  
  // Add new value
  newProject.value[headerName].push(value)
  
  // Clear input
  tempArrayValue.value = ''
}

const removeArrayValue = (headerName, index) => {
  newProject.value[headerName].splice(index, 1)
}

// Modify isFormValid to handle array fields
const isFormValid = computed(() => {
  if (!majorProjectSettings.value || !majorProjectSettings.value.headers) return false
  
  // Check if all required fields are filled
  for (const [headerName, config] of Object.entries(majorProjectSettings.value.headers)) {
    // Skip label fields
    if (config.type === 'label') continue
    
    // For array fields, check if there's at least one value when required
    if (config.type === 'array') {
      if (config.required && (!newProject.value[headerName] || newProject.value[headerName].length === 0)) {
        return false
      }
    } else if (config.required && !newProject.value[headerName]) {
      return false
    }
  }
  
  return true
})

// Fetch project settings for the latest academic year
const fetchProjectSettings = async () => {
  try {
    loading.value = true
    const schoolId = userStore.currentUser.school
    
    // Get the latest academic year
    const yearData = await getLatestAcademicYear(schoolId)
    if (!yearData) {
      loading.value = false
      return
    }
    
    latestAcademicYear.value = yearData.academicYear
    latestAcademicYearId.value = yearData.yearId
    
    // Get the user's major if they are a lecturer
    if (userStore.currentUser.role === 'lecturer' && userStore.currentUser.major) {
      selectedMajor.value = userStore.currentUser.major
    } else {
      // For demo purposes, get the first major
      const projectsRef = doc(db, 'schools', schoolId, 'projects', yearData.yearId)
      const projectsDoc = await getDoc(projectsRef)
      if (projectsDoc.exists() && projectsDoc.data().majors && projectsDoc.data().majors.length > 0) {
        selectedMajor.value = projectsDoc.data().majors[0]
        
        // Store all available majors
        availableMajors.value = projectsDoc.data().majors
      }
    }
    
    if (!selectedMajor.value) {
      loading.value = false
      return
    }
    
    // Get the project settings for the selected major
    const majorRef = collection(db, 'schools', schoolId, 'projects', yearData.yearId, selectedMajor.value)
    const majorDocs = await getDocs(majorRef)
    
    if (!majorDocs.empty) {
      const majorData = majorDocs.docs[0].data()
      projectSettings.value = {
        headers: majorData.headers || {},
        milestones: majorData.milestones || []
      }
      
      // Initialize newProject with empty values for each header
      if (majorData.headers) {
        Object.keys(majorData.headers).forEach(headerName => {
          newProject.value[headerName] = ''
        })
      }
    }
  } catch (error) {
    console.error('Error fetching project settings:', error)
    showToast('Failed to load project settings', 'error')
  } finally {
    loading.value = false
  }
}

// Format date for display
const formatDate = (date) => {
  if (!date) return ''
  
  // Handle Firestore timestamp
  const timestamp = date.seconds ? new Date(date.seconds * 1000) : new Date(date)
  return timestamp.toLocaleDateString()
}

// New function to handle major selection
const selectMajorForProject = async (major) => {
  tempSelectedMajor.value = major
  
  try {
    const schoolId = userStore.currentUser.school
    
    // Get the project settings for the selected major
    const majorRef = collection(db, 'schools', schoolId, 'projects', latestAcademicYearId.value, major)
    const majorDocs = await getDocs(majorRef)
    
    if (!majorDocs.empty) {
      const majorData = majorDocs.docs[0].data()
      majorProjectSettings.value = {
        headers: majorData.headers || {},
        milestones: majorData.milestones || []
      }
      
      // Initialize newProject with empty values for each header
      newProject.value = {}
      if (majorData.headers) {
        Object.keys(majorData.headers).forEach(headerName => {
          newProject.value[headerName] = ''
        })
      }
    } else {
      majorProjectSettings.value = null
      newProject.value = {}
    }
  } catch (error) {
    console.error('Error fetching major project settings:', error)
    showToast('Failed to load major settings', 'error')
  }
}

// Function to navigate between form steps
const goToStep = (step) => {
  if (step === 2 && !tempSelectedMajor.value) {
    showToast('Please select a major first', 'error')
    return
  }
  
  if (step === 3 && !isFormValid.value) {
    showToast('Please fill in all required fields', 'error')
    return
  }
  
  formStep.value = step
}

// Function to cancel and reset the form
const cancelNewProject = () => {
  formStep.value = 1
  tempSelectedMajor.value = ''
  newProject.value = {}
  majorProjectSettings.value = null
  showNewProjectForm.value = false
}

// Save the project (dummy implementation)
const saveProject = () => {
  // Add the academic year and major to the project
  const projectWithYear = {
    ...newProject.value,
    academicYear: latestAcademicYear.value,
    createdAt: new Date(),
    major: tempSelectedMajor.value
  }
  
  // Add to the projects array (dummy implementation)
  projects.value.push(projectWithYear)
  
  // Reset the form
  formStep.value = 1
  tempSelectedMajor.value = ''
  newProject.value = {}
  majorProjectSettings.value = null
  
  showNewProjectForm.value = false
  showToast('Project saved successfully')
}

// Show toast message
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div')
  toast.className = 'flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow ' + 
    (type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500')
  
  const icon = document.createElement('div')
  icon.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ' + 
    (type === 'success' ? 'text-green-500' : 'text-red-500')
  
  if (type === 'success') {
    icon.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
  } else {
    icon.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
  }
  
  const messageDiv = document.createElement('div')
  messageDiv.className = 'ml-3 text-sm font-normal'
  messageDiv.textContent = message
  
  toast.appendChild(icon)
  toast.appendChild(messageDiv)
  
  const container = document.getElementById('toast-container')
  container.appendChild(toast)
  
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

// Fetch project settings when component mounts
onMounted(fetchProjectSettings)
</script>

<style scoped>
/* No custom styles needed as we're using Tailwind classes */
</style> 