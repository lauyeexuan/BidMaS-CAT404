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
          
          <button 
            @click="refreshProjects"
            class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2"
            :disabled="loading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" :class="{ 'animate-spin': loading }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
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
                <th class="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th class="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Major
                </th>
                <th class="w-1/6 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th class="w-1/6 px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div class="flex items-center">
                    <select 
                      v-model="assignmentFilter"
                      class="bg-white border border-gray-300 text-gray-800 text-xs uppercase font-medium rounded-md px-2 py-1 hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      @change="currentPage = 1"
                    >
                      <option value="all">All Assignments</option>
                      <option value="assigned">Assigned Only</option>
                      <option value="unassigned">Unassigned Only</option>
                    </select>
                  </div>
                </th>
                <th class="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Examiner
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(project, index) in paginatedProjects" :key="index">
                <td class="w-12 px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
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
                <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getUserName(project.userId) }}
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-sm">
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
                <td class="px-3 py-4 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <select 
                      class="bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded-md px-2 py-1 cursor-not-allowed opacity-70"
                      disabled
                    >
                      <option value="">Select Examiner</option>
                    </select>
                    <button 
                      class="px-3 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-md cursor-not-allowed"
                      disabled
                    >
                      Find
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Background Loading Indicator -->
          <div v-if="loadingMore" class="text-center py-2 mt-2">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span class="text-sm text-gray-600">Loading more projects...</span>
          </div>

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
import { collection, getDocs, doc, getDoc, query, limit, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'

const userStore = useUserStore()

// Session storage keys
const SESSION_STORAGE_KEY_PROJECTS = 'admin_projects_'
const SESSION_STORAGE_KEY_TIMESTAMP = 'admin_projects_timestamp_'
const SESSION_STORAGE_KEY_USERNAMES = 'admin_usernames'

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
const userIdsToFetch = new Set() // Track user IDs that need fetching
const assignmentFilter = ref('all')
// Project cache to avoid redundant queries
const projectCache = ref({}) // Cache by academic year
const userCache = ref({}) // Cache for user data
const initialLoadComplete = ref(false) // Track if initial data load is complete
const loadingMore = ref(false) // Track if we're loading more projects

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
    initialLoadComplete.value = false
    
    const schoolId = userStore.currentUser.school
    
    // Define session storage keys with schoolId to avoid conflicts
    const projectsKey = `${SESSION_STORAGE_KEY_PROJECTS}${schoolId}_${selectedAcademicYear.value}`
    const timestampKey = `${SESSION_STORAGE_KEY_TIMESTAMP}${schoolId}_${selectedAcademicYear.value}`

    // First check memory cache
    const cacheTimestamp = projectCache.value[`${selectedAcademicYear.value}_timestamp`]
    const isRecentCache = cacheTimestamp && (Date.now() - cacheTimestamp < 5 * 60 * 1000) // 5 minutes cache
    
    if (projectCache.value[selectedAcademicYear.value] && isRecentCache) {
      console.log(`Using memory-cached projects for year ${selectedAcademicYear.value}`)
      projects.value = [...projectCache.value[selectedAcademicYear.value]]
      
      // Initialize major filters with all majors from cache
      const uniqueMajors = uniqueProjectMajors.value
      selectedMajorFilters.value = new Set(uniqueMajors)
      
      // Reset to page 1 when switching years
      currentPage.value = 1
      initialLoadComplete.value = true
      
      loading.value = false
      return
    }
    
    // Then check session storage for the latest year
    if (selectedAcademicYear.value === availableAcademicYears.value[0]?.yearId) {
      try {
        const storedTimestampStr = sessionStorage.getItem(timestampKey)
        const storedTimestamp = storedTimestampStr ? parseInt(storedTimestampStr) : null
        const isRecentSessionCache = storedTimestamp && (Date.now() - storedTimestamp < 5 * 60 * 1000) // 5 minutes
        
        if (isRecentSessionCache) {
          const storedProjectsStr = sessionStorage.getItem(projectsKey)
          if (storedProjectsStr) {
            const storedProjects = JSON.parse(storedProjectsStr)
            console.log(`Using session-cached projects for year ${selectedAcademicYear.value}`)
            
            // Restore from session storage
            projects.value = storedProjects
            
            // Cache in memory too
            projectCache.value[selectedAcademicYear.value] = [...storedProjects]
            projectCache.value[`${selectedAcademicYear.value}_timestamp`] = storedTimestamp
            
            // Initialize major filters with all majors from cache
            const uniqueMajors = uniqueProjectMajors.value
            selectedMajorFilters.value = new Set(uniqueMajors)
            
            // Reset to page 1 when switching years
            currentPage.value = 1
            initialLoadComplete.value = true
            
            // Try loading usernames from session too
            loadUserNamesFromSession()
            
            loading.value = false
            return
          }
        }
      } catch (storageError) {
        console.error('Error reading from session storage:', storageError)
        // Continue with normal loading if session storage fails
      }
    }
    
    // If not in cache or session storage, proceed with fetch
    projects.value = [] // Clear projects immediately to show loading state
    userIdsToFetch.clear() // Reset user IDs to fetch
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    
    // Get available majors from the year document
    const yearRef = doc(db, 'schools', schoolId, 'projects', selectedAcademicYear.value)
    const yearDoc = await getDoc(yearRef)
    
    if (yearDoc.exists()) {
      const majors = yearDoc.data().majors || []
      
      // Use Promise.all to fetch only INITIAL_BATCH_SIZE projects from each major
      // This reduces the initial load time
      const INITIAL_BATCH_SIZE = 50 // Increased substantially to ensure most data loads initially
      
      await Promise.all(majors.map(async (major) => {
        try {
          // Get the major collection
          const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, major)
          const majorDocs = await getDocs(majorCollectionRef)
          
          if (!majorDocs.empty) {
            // Get the first document in the major collection (majorDocId)
            const majorDoc = majorDocs.docs[0]
            const majorDocId = majorDoc.id
            
            // Get the projectsPerYear subcollection with limit
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
            
            // Create a query with limit for initial load
            const initialQuery = query(projectsRef, limit(INITIAL_BATCH_SIZE))
            
            // Get initial batch of projects
            const projectsDocs = await getDocs(initialQuery)
            
            // Count the number of documents returned
            const documentsReturned = projectsDocs.size
            
            projectsDocs.forEach(doc => {
              const projectId = doc.id
              const projectData = doc.data()
              
              // Add userId to the set of IDs to fetch
              if (projectData.userId) {
                userIdsToFetch.add(projectData.userId)
              }
              
              // Add assignedTo user ID to the set of IDs to fetch if it exists
              if (projectData.assignedTo) {
                userIdsToFetch.add(projectData.assignedTo)
              }
              
              // Use Map to ensure uniqueness by project ID
              if (!projectsMap.has(projectId)) {
                projectsMap.set(projectId, {
                  id: projectId,
                  ...projectData,
                  major,
                })
              }
            })
            
            // If we got exactly INITIAL_BATCH_SIZE projects, there might be more
            // Set a flag to indicate we should load more for this major later
            if (documentsReturned === INITIAL_BATCH_SIZE) {
              console.log(`Major ${major} hit initial limit, will load more in background`)
            }
          }
        } catch (majorError) {
          console.error(`Error fetching projects for major ${major}:`, majorError)
        }
      }))
    } else {
      console.error(`Year document ${selectedAcademicYear.value} does not exist`)
    }
    
    // Convert map values to array
    projects.value = Array.from(projectsMap.values())
    
    // Cache the projects by academic year
    projectCache.value[selectedAcademicYear.value] = [...projects.value]
    
    // Add timestamp to track when data was last fetched
    const currentTimestamp = Date.now()
    projectCache.value[`${selectedAcademicYear.value}_timestamp`] = currentTimestamp
    
    // Save to session storage if this is the latest year
    if (selectedAcademicYear.value === availableAcademicYears.value[0]?.yearId) {
      try {
        sessionStorage.setItem(projectsKey, JSON.stringify(projects.value))
        sessionStorage.setItem(timestampKey, currentTimestamp.toString())
      } catch (storageError) {
        console.error('Error saving to session storage:', storageError)
        // Continue even if session storage fails
      }
    }
    
    // Only fetch user data for visible projects initially
    const visibleUserIds = new Set()
    paginatedProjects.value.forEach(project => {
      if (project.userId) visibleUserIds.add(project.userId)
      if (project.assignedTo) visibleUserIds.add(project.assignedTo)
    })
    
    // Fetch user names only for visible projects
    if (visibleUserIds.size > 0) {
      await fetchUserNames(Array.from(visibleUserIds))
    }
    
    // Initialize major filters with all majors
    const uniqueMajors = uniqueProjectMajors.value
    selectedMajorFilters.value = new Set(uniqueMajors)
    
    // Reset to page 1 when switching years
    currentPage.value = 1
    initialLoadComplete.value = true
    
    loading.value = false
    
    // Load remaining projects in the background after initial render
    // Create a slight delay to ensure the UI has time to render
    setTimeout(() => {
      if (projects.value.length > 0) {
        loadRemainingProjects(majors, schoolId);
      }
    }, 300);
  } catch (error) {
    console.error('Error fetching projects:', error)
    loading.value = false
  }
}

// Save usernames to session storage
const saveUserNamesToSession = () => {
  try {
    if (Object.keys(userNames.value).length > 0) {
      sessionStorage.setItem(SESSION_STORAGE_KEY_USERNAMES, JSON.stringify(userNames.value))
    }
  } catch (error) {
    console.error('Error saving usernames to session storage:', error)
  }
}

// Load usernames from session storage
const loadUserNamesFromSession = () => {
  try {
    const storedUserNamesStr = sessionStorage.getItem(SESSION_STORAGE_KEY_USERNAMES)
    if (storedUserNamesStr) {
      const storedUserNames = JSON.parse(storedUserNamesStr)
      // Merge with existing usernames
      userNames.value = { ...userNames.value, ...storedUserNames }
      console.log(`Loaded ${Object.keys(storedUserNames).length} usernames from session storage`)
    }
  } catch (error) {
    console.error('Error loading usernames from session storage:', error)
  }
}

// Load remaining projects in the background
const loadRemainingProjects = async (majors, schoolId) => {
  try {
    loadingMore.value = true
    
    // Get a count of projects before loading more
    const initialProjectCount = projects.value.length
    console.log(`Starting background load with ${initialProjectCount} projects`)
    
    // Create a new map for all projects (including existing ones)
    const completeProjectsMap = new Map()
    
    // Add existing projects to the map
    projects.value.forEach(project => {
      completeProjectsMap.set(project.id, project)
    })
    
    // Track new user IDs to fetch
    const newUserIdsToFetch = new Set()
    
    // Instead of trying to append, we'll get ALL projects and merge with what we have
    await Promise.all(majors.map(async (major) => {
      try {
        // Get the major collection
        const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, major)
        const majorDocs = await getDocs(majorCollectionRef)
        
        if (!majorDocs.empty) {
          // Get the first document in the major collection (majorDocId)
          const majorDoc = majorDocs.docs[0]
          const majorDocId = majorDoc.id
          
          // Get ALL projects for this major without any limit
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
          
          // Get all projects without limit
          const projectsDocs = await getDocs(projectsRef)
          console.log(`Fetched ${projectsDocs.size} total projects for major ${major}`)
          
          projectsDocs.forEach(doc => {
            const projectId = doc.id
            const projectData = doc.data()
            
            // Add user IDs to fetch if not already known
            if (projectData.userId && !userNames.value[projectData.userId]) {
              newUserIdsToFetch.add(projectData.userId)
            }
            
            if (projectData.assignedTo && !userNames.value[projectData.assignedTo]) {
              newUserIdsToFetch.add(projectData.assignedTo)
            }
            
            // Add to complete projects map
            completeProjectsMap.set(projectId, {
              id: projectId,
              ...projectData,
              major,
            })
          })
        }
      } catch (majorError) {
        console.error(`Error fetching all projects for major ${major}:`, majorError)
      }
    }))
    
    // Update the projects array with the complete set
    const allProjects = Array.from(completeProjectsMap.values())
    
    // Only update if we have more projects than before
    if (allProjects.length > initialProjectCount) {
      console.log(`Added ${allProjects.length - initialProjectCount} additional projects. Total now: ${allProjects.length}`)
      
      // Update the projects array
      projects.value = allProjects
      
      // Update the cache with the complete data
      projectCache.value[selectedAcademicYear.value] = [...allProjects]
      
      // Save to session storage if this is the latest year
      if (selectedAcademicYear.value === availableAcademicYears.value[0]?.yearId) {
        try {
          const projectsKey = `${SESSION_STORAGE_KEY_PROJECTS}${schoolId}_${selectedAcademicYear.value}`
          const timestampKey = `${SESSION_STORAGE_KEY_TIMESTAMP}${schoolId}_${selectedAcademicYear.value}`
          sessionStorage.setItem(projectsKey, JSON.stringify(allProjects))
          sessionStorage.setItem(timestampKey, Date.now().toString())
        } catch (storageError) {
          console.error('Error saving complete data to session storage:', storageError)
        }
      }
      
      // Fetch user data for newly visible projects
      if (newUserIdsToFetch.size > 0) {
        await fetchUserNames(Array.from(newUserIdsToFetch))
      }
    } else {
      console.log('No additional projects found beyond initial load')
    }
    
    loadingMore.value = false
  } catch (error) {
    console.error('Error loading remaining projects:', error)
    loadingMore.value = false
  }
}

// Fetch user names - optimized with batch query
const fetchUserNames = async (userIds) => {
  try {
    const schoolId = userStore.currentUser.school
    
    // Filter out already cached users
    const uncachedUserIds = userIds.filter(id => !userNames.value[id])
    if (uncachedUserIds.length === 0) return
    
    console.log(`Fetching ${uncachedUserIds.length} new user(s) with batch query`)
    
    // Due to Firestore limitations, we can only query up to 10 items at a time with 'in' operator
    const batchSize = 10
    
    // Process in batches
    for (let i = 0; i < uncachedUserIds.length; i += batchSize) {
      const batchIds = uncachedUserIds.slice(i, i + batchSize)
      
      // Create a query to fetch multiple users at once
      const usersRef = collection(db, 'schools', schoolId, 'users')
      const q = query(usersRef, where('__name__', 'in', batchIds))
      
      // Execute the batch query
      const querySnapshot = await getDocs(q)
      
      // Process the results
      querySnapshot.forEach(doc => {
        const userData = doc.data()
        userNames.value[doc.id] = userData.name || userData.email || 'Unknown'
      })
      
      // Check for any users that didn't return in the query and set them as Unknown
      batchIds.forEach(userId => {
        if (!userNames.value[userId]) {
          userNames.value[userId] = 'Unknown'
        }
      })
    }
    
    // Save usernames to session storage after successful fetch
    saveUserNamesToSession()
  } catch (error) {
    console.error('Error batch fetching user names:', error)
    
    // Fallback to individual fetches if the batch method fails
    console.log('Falling back to individual user fetches')
    try {
      const schoolId = userStore.currentUser.school
      
      await Promise.all(userIds.filter(id => !userNames.value[id]).map(async (userId) => {
        if (!userNames.value[userId]) {
          const userRef = doc(db, 'schools', schoolId, 'users', userId)
          const userDoc = await getDoc(userRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            userNames.value[userId] = userData.name || userData.email || 'Unknown'
          } else {
            userNames.value[userId] = 'Unknown'
          }
        }
      }))
      
      // Save usernames to session storage after successful fallback fetch
      saveUserNamesToSession()
    } catch (fallbackError) {
      console.error('Error in fallback fetch:', fallbackError)
    }
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

// Get major color classes - memoized
const getMajorColorClasses = (major) => {
  if (!majorColorMap.value.has(major)) {
    // Assign next available color or cycle back to start
    const colorIndex = majorColorMap.value.size % colorPalette.length
    majorColorMap.value.set(major, colorPalette[colorIndex])
  }
  
  return majorColorMap.value.get(major)
}

// Computed properties
const uniqueProjectMajors = computed(() => {
  return [...new Set(projects.value.map(project => project.major))]
})

const filteredProjects = computed(() => {
  let filtered = projects.value

  // Filter by major if any majors are selected
  if (selectedMajorFilters.value.size > 0) {
    filtered = filtered.filter(project => selectedMajorFilters.value.has(project.major))
  }

  // Filter by assignment status
  if (assignmentFilter.value !== 'all') {
    filtered = filtered.filter(project => {
      if (assignmentFilter.value === 'assigned') {
        return !!project.assignedTo
      } else {
        return !project.assignedTo
      }
    })
  }

  return filtered
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

// Add lazy loading for user data when page changes
watch([currentPage, filteredProjects], () => {
  if (initialLoadComplete.value) {
    lazyLoadUserNames()
  }
})

// Lifecycle hooks
onMounted(async () => {
  // Try to load usernames from session storage on mount
  loadUserNamesFromSession()
  
  await fetchAcademicYears()
  if (selectedAcademicYear.value) {
    await fetchProjects()
  }
})

// Update the refreshProjects function to clear session storage
const refreshProjects = async () => {
  try {
    const schoolId = userStore.currentUser.school
    
    // Clear the cache for the current academic year
    if (projectCache.value[selectedAcademicYear.value]) {
      delete projectCache.value[selectedAcademicYear.value]
      delete projectCache.value[`${selectedAcademicYear.value}_timestamp`]
    }
    
    // Clear session storage for the current year
    try {
      const projectsKey = `${SESSION_STORAGE_KEY_PROJECTS}${schoolId}_${selectedAcademicYear.value}`
      const timestampKey = `${SESSION_STORAGE_KEY_TIMESTAMP}${schoolId}_${selectedAcademicYear.value}`
      sessionStorage.removeItem(projectsKey)
      sessionStorage.removeItem(timestampKey)
    } catch (storageError) {
      console.error('Error clearing session storage:', storageError)
    }
    
    // Re-fetch projects from Firestore
    await fetchProjects()
    
    // Show notification or feedback (optional)
    console.log('Projects refreshed from Firestore')
  } catch (error) {
    console.error('Error refreshing projects:', error)
  }
}

// Add lazy user loading function
const lazyLoadUserNames = async () => {
  const visibleProjects = paginatedProjects.value
  const visibleUserIds = new Set()
  
  // Collect user IDs only from currently visible projects
  visibleProjects.forEach(project => {
    if (project.userId) visibleUserIds.add(project.userId)
    if (project.assignedTo) visibleUserIds.add(project.assignedTo)
  })
  
  // Filter out already cached users
  const idsToFetch = Array.from(visibleUserIds).filter(id => !userNames.value[id])
  if (idsToFetch.length > 0) {
    await fetchUserNames(idsToFetch)
  }
}
</script> 