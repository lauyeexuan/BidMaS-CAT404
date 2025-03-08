<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Projects</h1>
      
      <div class="bg-blue-100 p-4 rounded-lg mb-6">
        <p class="text-blue-800">Welcome to your project dashboard! Here you'll be able to view and bid on available projects.</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <p class="text-gray-600">Loading projects...</p>
      </div>
      
      <!-- Projects List with Bid Action -->
      <div v-else>
        <div class="flex justify-between items-center mb-6">
          <div class="space-y-2">
            <div class="flex items-center gap-4">
              <h2 class="text-2xl font-semibold text-gray-900">Available Projects</h2>
              <span class="text-sm text-gray-500">(Total: {{ filteredProjects.length }})</span>
            </div>
            
            <!-- Major filter tags -->
            <div v-if="uniqueProjectMajors.length > 0" class="flex flex-wrap gap-2">
              <button
                v-for="major in uniqueProjectMajors"
                :key="major"
                @click="toggleMajorFilter(major)"
                class="px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                :class="[
                  selectedMajorFilters.has(major) 
                    ? getMajorColorClasses(major).selected 
                    : [getMajorColorClasses(major).bg, getMajorColorClasses(major).text, 'hover:bg-opacity-75'],
                ]"
              >
                <span v-if="selectedMajorFilters.has(major)" class="w-2 h-2 rounded-full bg-white"></span>
                {{ major }}
              </button>
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
                  <button 
                    @click="handleBid(project.id)"
                    class="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    <img src="@/assets/bid.png" alt="" class="h-4 w-4 mr-1.5 object-contain" />
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { db } from '@/firebase'
import { doc, collection, getDocs, getDoc } from 'firebase/firestore'
import { getLatestAcademicYear, formatAcademicYear } from '@/utils/latestAcademicYear'

const userStore = useUserStore()
const loading = ref(true)
const projects = ref([])
const userNamesMap = ref(new Map())
const academicYear = ref('')
const academicYearId = ref('')
const availableMajors = ref([])

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Major filters
const selectedMajorFilters = ref(new Set())

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
  if (selectedMajorFilters.value.size === 0) {
    return projects.value
  }
  return projects.value.filter(project => selectedMajorFilters.value.has(project.major))
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

const fetchAvailableMajors = async () => {
  try {
    const schoolId = userStore.currentUser.school
    if (!schoolId || !academicYearId.value) {
      console.error('Error: Missing school ID or academic year')
      return
    }
    
    // Fetch available majors from the academic year document
    const projectsRef = doc(db, 'schools', schoolId, 'projects', academicYearId.value)
    const projectsDoc = await getDoc(projectsRef)
    
    if (projectsDoc.exists()) {
      const projectsData = projectsDoc.data()
      if (projectsData.majors && Array.isArray(projectsData.majors)) {
        availableMajors.value = projectsData.majors
        console.log('Available majors:', availableMajors.value)
      }
    }
  } catch (error) {
    console.error('Error fetching available majors:', error)
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
    console.log('Debug - Using school ID:', schoolId)
    
    if (!academicYearId.value || !availableMajors.value.length) {
      console.error('Missing academic year or majors')
      return
    }
    
    // Clear existing projects
    projects.value = []
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    // Create a set to track unique user IDs
    const userIds = new Set()
    
    console.log('Debug - Fetching projects for majors:', availableMajors.value)
    
    // Fetch projects from all majors
    for (const major of availableMajors.value) {
      try {
        console.log(`Debug - Fetching projects for major: ${major}`)
        const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId.value, major)
        const majorDocs = await getDocs(majorRef)
        
        console.log(`Debug - Found ${majorDocs.docs.length} docs for major ${major}`)
        
        if (!majorDocs.empty) {
          const majorDoc = majorDocs.docs[0]
          const majorDocId = majorDoc.id
          
          console.log(`Debug - Using majorDocId: ${majorDocId} for major ${major}`)
          
          const projectsRef = collection(
            db, 
            'schools', 
            schoolId, 
            'projects', 
            academicYearId.value, 
            major, 
            majorDocId,
            'projectsPerYear'
          )
          
          // Get all projects without filtering by userId
          const projectsDocs = await getDocs(projectsRef)
          
          console.log(`Debug - Found ${projectsDocs.docs.length} projects for major ${major}`)
          
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
        console.error(`Error fetching all projects for major ${major}:`, majorError)
      }
    }
    
    // Convert map values to array
    projects.value = Array.from(projectsMap.values())
    
    console.log('Debug - Total unique loaded all projects:', projects.value.length)
    
    // Fetch user names for all projects
    if (userIds.size > 0) {
      await fetchUserNames(Array.from(userIds))
    }
    
  } catch (error) {
    console.error('Error fetching all projects:', error)
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

const toggleMajorFilter = (major) => {
  if (selectedMajorFilters.value.has(major)) {
    selectedMajorFilters.value.delete(major)
  } else {
    selectedMajorFilters.value.add(major)
  }
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

const handleBid = (projectId) => {
  console.log('Bid placed on project:', projectId)
  // This function will be implemented later
}

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
    await fetchAvailableMajors()
    if (availableMajors.value.length > 0) {
      await fetchProjects()
    } else {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
/* No custom styles needed as we're using Tailwind classes */
</style> 