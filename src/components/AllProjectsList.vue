<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div class="space-y-2">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-semibold text-gray-900">All Projects</h2>
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
      Projects are loading...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { db } from '@/firebase'
import { doc, collection, getDocs, getDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  academicYear: {
    type: String,
    required: true
  },
  availableMajors: {
    type: Array,
    required: true
  }
})

const userStore = useUserStore()
const projects = ref([])
const loading = ref(false)
const userNamesMap = ref(new Map())

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
    console.log('Debug - fetchProjects called in AllProjectsList')
    loading.value = true
    const schoolId = userStore.currentUser.school
    console.log('Debug - Using school ID:', schoolId)
    
    // Clear existing projects
    projects.value = []
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    // Create a set to track unique user IDs
    const userIds = new Set()
    
    console.log('Debug - Fetching projects for majors:', props.availableMajors)
    
    // Fetch projects from all majors
    for (const major of props.availableMajors) {
      try {
        console.log(`Debug - Fetching projects for major: ${major}`)
        const majorRef = collection(db, 'schools', schoolId, 'projects', props.academicYear, major)
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
            props.academicYear, 
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

// Watch for projects length changes to reset page if needed
watch(projects, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1
  }
})

// Watch for academic year changes
watch(() => props.academicYear, (newYear) => {
  console.log('Debug - Academic year changed in AllProjectsList:', newYear)
  console.log('Debug - Available majors:', props.availableMajors)
  if (newYear) {
    fetchProjects()
  }
}, { immediate: true })
</script> 