<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-6 py-8">
      <!-- Header with Academic Year -->
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center">
          <h1 class="text-4xl font-bold text-gray-900">All Projects</h1>
          <span 
            v-if="selectedAcademicYear !== availableAcademicYears[0]?.yearId" 
            class="ml-3 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
          >
            Viewing historical data
          </span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <span class="mr-2 text-gray-700 font-medium">Academic Year:</span>
            <div class="relative">
              <select 
                v-model="selectedAcademicYear"
                class="text-lg bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="yearLoading"
              >
                <option 
                  v-for="year in availableAcademicYears" 
                  :key="year.yearId" 
                  :value="year.yearId"
                >
                  {{ year.academicYear }}
                </option>
              </select>
              <div v-if="yearLoading" class="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-lg shadow p-6">
        <!-- Filter Section -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Projects by Major</h2>
            <span class="text-sm text-gray-500">(Total: {{ filteredProjects.length }})</span>
          </div>
          
          <!-- Major Filters -->
          <div v-if="uniqueProjectMajors.length > 0" class="flex flex-wrap gap-2">
            <button
              v-for="major in uniqueProjectMajors"
              :key="major"
              @click="toggleMajorFilter(major)"
              class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow"
              :class="[
                selectedMajorFilters.has(major) 
                  ? getMajorColorClasses(major).selected 
                  : [getMajorColorClasses(major).bg, getMajorColorClasses(major).text, 'hover:bg-opacity-80'],
              ]"
            >
              <span v-if="selectedMajorFilters.has(major)" class="w-2 h-2 rounded-full bg-white"></span>
              {{ major }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p class="text-gray-600">Loading projects...</p>
        </div>

        <!-- Projects Table -->
        <div v-else-if="projects.length > 0" class="overflow-x-auto">
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
                  Supervisor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
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
                    class="px-2.5 py-1 rounded-full text-xs font-medium shadow-sm"
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
                  <span 
                    v-if="project.assignedTo" 
                    class="px-2.5 py-1 rounded-full text-xs font-medium shadow-sm bg-blue-100 text-blue-800"
                  >
                    {{ getUserName(project.assignedTo) }}
                  </span>
                  <span 
                    v-else 
                    class="px-2.5 py-1 rounded-full text-xs font-medium shadow-sm bg-gray-100 text-gray-600"
                  >
                    Not assigned
                  </span>
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
          No projects available for the selected academic year.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'

const userStore = useUserStore()

// Data
const projects = ref([])
const loading = ref(true)
const yearLoading = ref(true)
const availableAcademicYears = ref([])
const selectedAcademicYear = ref('')
const latestAcademicYear = ref('')
const selectedMajorFilters = ref(new Set())
const userNames = ref({}) // Map of userId to name
const itemsPerPage = 10
const currentPage = ref(1)

// Define color palette
const colorPalette = [
  { bg: 'bg-pink-100', text: 'text-pink-800', selected: 'bg-pink-500 text-white' },
  { bg: 'bg-teal-100', text: 'text-teal-800', selected: 'bg-teal-500 text-white' },
  { bg: 'bg-orange-100', text: 'text-orange-800', selected: 'bg-orange-500 text-white' },
  { bg: 'bg-purple-100', text: 'text-purple-800', selected: 'bg-purple-500 text-white' },
  { bg: 'bg-amber-100', text: 'text-amber-800', selected: 'bg-amber-500 text-white' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', selected: 'bg-emerald-500 text-white' }
]

// Map to store major-color associations
const majorColorMap = ref(new Map())

// Fetch academic years
const fetchAcademicYears = async () => {
  try {
    yearLoading.value = true
    const schoolId = userStore.currentUser.school
    
    // Get all academic years from the projects collection
    const projectsRef = collection(db, 'schools', schoolId, 'projects')
    const projectsSnapshot = await getDocs(projectsRef)
    
    if (!projectsSnapshot.empty) {
      // Extract all academic year IDs (e.g., "2324")
      const academicYearIds = projectsSnapshot.docs.map(doc => doc.id)
      
      // Sort in descending order to get the latest year first
      academicYearIds.sort((a, b) => b.localeCompare(a))
      
      // Format each year ID to readable format
      const years = academicYearIds.map(yearId => {
        const startYear = `20${yearId.slice(0, 2)}`
        const endYear = `20${yearId.slice(2)}`
        
        return {
          yearId: yearId,
          academicYear: `${startYear}/${endYear}`
        }
      })
      
      availableAcademicYears.value = years
      
      // Set latest year as default
      if (years.length > 0) {
        selectedAcademicYear.value = years[0].yearId
        latestAcademicYear.value = years[0].academicYear
      }
    } else {
      console.error('No academic years found')
    }
    
    // Also get the latest year using the utility function as a fallback
    if (availableAcademicYears.value.length === 0) {
      const latestYear = await getLatestAcademicYear(schoolId)
      if (latestYear) {
        availableAcademicYears.value = [latestYear]
        selectedAcademicYear.value = latestYear.yearId
        latestAcademicYear.value = latestYear.academicYear
      }
    }
    yearLoading.value = false
  } catch (error) {
    console.error('Error fetching academic years:', error)
    yearLoading.value = false
  }
}

// Fetch all projects
const fetchProjects = async () => {
  try {
    loading.value = true
    projects.value = [] // Clear projects immediately to show loading state
    
    const schoolId = userStore.currentUser.school
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    // Create a set to track unique user IDs
    const userIds = new Set()
    
    // According to the Firestore structure, we need to:
    // 1. Get the year document from the projects subcollection
    // 2. For each major, get the majorDocId and then the projectsPerYear subcollection
    
    // Get available majors from the year document
    const yearRef = doc(db, 'schools', schoolId, 'projects', selectedAcademicYear.value)
    const yearDoc = await getDoc(yearRef)
    
    if (yearDoc.exists()) {
      const majors = yearDoc.data().majors || []
      
      // Fetch projects from all majors
      for (const major of majors) {
        try {
          // Get the major collection
          const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, major)
          const majorDocs = await getDocs(majorCollectionRef)
          
          if (!majorDocs.empty) {
            // Get the first document in the major collection (majorDocId)
            const majorDoc = majorDocs.docs[0]
            const majorDocId = majorDoc.id
            
            // Get the projectsPerYear subcollection
            const projectsRef = collection(
              db, 
              'schools', 
              schoolId, 
              'projects', 
              selectedAcademicYear.value, 
              major, 
              majorDocId,
              'projectsPerYear'
            )
            
            // Get all projects
            const projectsDocs = await getDocs(projectsRef)
            
            projectsDocs.forEach(doc => {
              const projectId = doc.id
              const projectData = doc.data()
              
              // Add userId to the set of IDs to fetch
              if (projectData.userId) {
                userIds.add(projectData.userId)
              }
              
              // Add assignedTo user ID to the set of IDs to fetch if it exists
              if (projectData.assignedTo) {
                userIds.add(projectData.assignedTo)
              }
              
              // Use Map to ensure uniqueness by project ID
              if (!projectsMap.has(projectId)) {
                // Always use the major from the current loop iteration
                // This ensures the major is correctly set regardless of what's in projectData
                projectsMap.set(projectId, {
                  id: projectId,
                  ...projectData,
                  major, // Explicitly set major from the current loop iteration
                })
              }
            })
          }
        } catch (majorError) {
          console.error(`Error fetching projects for major ${major}:`, majorError)
        }
      }
    } else {
      console.error(`Year document ${selectedAcademicYear.value} does not exist`)
    }
    
    // Convert map values to array
    projects.value = Array.from(projectsMap.values())

    // Debug log to verify majors
    console.log('Loaded projects with majors:', projects.value.map(p => p.major))
    
    // Fetch user names for all creators
    await fetchUserNames(Array.from(userIds))
    
    // Initialize major filters with all majors
    const uniqueMajors = uniqueProjectMajors.value
    console.log('Unique majors found:', uniqueMajors)

    // Ensure each major has a color assigned
    uniqueMajors.forEach(major => {
      const color = getMajorColorClasses(major)
      console.log(`Major ${major} assigned color:`, color)
    })

    selectedMajorFilters.value = new Set(uniqueMajors)
    
    // Reset to page 1 when switching years
    currentPage.value = 1
    
    loading.value = false
  } catch (error) {
    console.error('Error fetching projects:', error)
    loading.value = false
  }
}

// Fetch user names
const fetchUserNames = async (userIds) => {
  try {
    const schoolId = userStore.currentUser.school
    
    for (const userId of userIds) {
      if (!userNames.value[userId]) {
        // According to the Firestore structure, users are in a subcollection of the school
        const userRef = doc(db, 'schools', schoolId, 'users', userId)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          userNames.value[userId] = userData.name || userData.email || 'Unknown'
        } else {
          userNames.value[userId] = 'Unknown'
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user names:', error)
  }
}

// Get user name by ID
const getUserName = (userId) => {
  return userNames.value[userId] || 'Unknown'
}

// Toggle major filter
const toggleMajorFilter = (major) => {
  if (selectedMajorFilters.value.has(major)) {
    selectedMajorFilters.value.delete(major)
  } else {
    selectedMajorFilters.value.add(major)
  }
  
  // Reset to page 1 when filters change
  currentPage.value = 1
}

// Get major color classes
const getMajorColorClasses = (major) => {
  if (!majorColorMap.value.has(major)) {
    // Assign next available color or cycle back to start
    const colorIndex = majorColorMap.value.size % colorPalette.length
    const baseColor = colorPalette[colorIndex]
    
    majorColorMap.value.set(major, baseColor)
  }
  
  return majorColorMap.value.get(major)
}

// Computed properties
const uniqueProjectMajors = computed(() => {
  return [...new Set(projects.value.map(project => project.major))]
})

const filteredProjects = computed(() => {
  if (selectedMajorFilters.value.size === 0) {
    return projects.value
  }
  return projects.value.filter(project => selectedMajorFilters.value.has(project.major))
})

const totalPages = computed(() => Math.ceil(filteredProjects.value.length / itemsPerPage))

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProjects.value.slice(start, end)
})

// Watch for changes
watch(selectedAcademicYear, () => {
  if (selectedAcademicYear.value) {
    // Clear existing filters before fetching new projects
    selectedMajorFilters.value = new Set()
    // Reset major color map to ensure consistent color assignments for each year
    majorColorMap.value = new Map()
    fetchProjects()
  }
})

watch(filteredProjects, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
})

// Lifecycle hooks
onMounted(async () => {
  await fetchAcademicYears()
  await fetchProjects()
})
</script> 