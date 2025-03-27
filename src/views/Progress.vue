<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Student Progress Tracking</h2>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-green-500"></span>
        <span class="text-sm text-gray-600">On Track</span>
        <span class="w-3 h-3 rounded-full bg-yellow-500 ml-4"></span>
        <span class="text-sm text-gray-600">At Risk</span>
        <span class="w-3 h-3 rounded-full bg-red-500 ml-4"></span>
        <span class="text-sm text-gray-600">Behind Schedule</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="flex items-center">
        <label class="mr-2 text-sm font-medium text-gray-700">Major:</label>
        <select 
          v-model="filters.major" 
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">All Majors</option>
          <option v-for="major in availableMajors" :key="major" :value="major">{{ major }}</option>
        </select>
      </div>
      
      <div class="flex items-center">
        <label class="mr-2 text-sm font-medium text-gray-700">Search:</label>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search by student or project name"
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProgressData.length === 0" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-gray-500">No student progress data found matching your filters.</p>
    </div>

    <!-- Progress Table -->
    <div v-else>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Major
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Project
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supervisor
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Examiner
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in paginatedProgressData" :key="item.id">
              <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.studentName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-medium shadow-sm"
                  :class="getMajorColorClasses(item.major)"
                >
                  {{ item.major }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.projectName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.lecturerName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center justify-between">
                  <span>-</span>
                  <button 
                    class="ml-2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Find
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between text-sm text-gray-700">
        <div>
          Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredProgressData.length) }} of {{ filteredProgressData.length }} entries
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
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

    <!-- Lecturer Specifications Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Lecturer Specifications</h2>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          <div v-for="lecturer in lecturerSpecs" :key="lecturer.id" class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center mb-3">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {{ getInitials(lecturer.name) }}
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-gray-900">{{ lecturer.name }}</h3>
                <p class="text-xs text-gray-500">{{ lecturer.major }}</p>
              </div>
            </div>
            <div class="space-y-2">
              <div v-if="lecturer.specifications && lecturer.specifications.length > 0">
                <h4 class="text-xs font-medium text-gray-500 mb-1">Specifications:</h4>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="spec in lecturer.specifications" 
                    :key="spec"
                    class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                  >
                    {{ spec }}
                  </span>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500 italic">
                No specifications listed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'

export default {
  setup() {
    const userStore = useUserStore()
    const progressData = ref([])
    const lecturerSpecs = ref([])
    const loading = ref(true)
    const error = ref(null)
    const currentPage = ref(1)
    const perPage = ref(10)
    const filters = ref({
      major: 'all',
      search: ''
    })
    const userNames = ref({})
    const userIdsToFetch = new Set()
    const availableMajors = ref([])

    // Fetch lecturer specifications
    const fetchLecturerSpecs = async () => {
      try {
        const schoolId = userStore.currentUser.school
        const lecturersQuery = query(
          collection(db, 'schools', schoolId, 'users'),
          where('role', '==', 'lecturer')
        )
        const lecturersSnapshot = await getDocs(lecturersQuery)
        
        const specs = []
        lecturersSnapshot.forEach(doc => {
          const lecturerData = doc.data()
          specs.push({
            id: doc.id,
            name: lecturerData.name || 'Unknown',
            major: lecturerData.major || 'N/A',
            specifications: lecturerData.specifications || [] // Array of specializations
          })
        })
        
        lecturerSpecs.value = specs
      } catch (error) {
        console.error('Error fetching lecturer specifications:', error)
      }
    }

    // Modified fetchProgressData to remove progress and status calculations
    const fetchProgressData = async () => {
      try {
        loading.value = true
        error.value = null
        progressData.value = []
        userIdsToFetch.clear()
        
        const schoolId = userStore.currentUser.school
        const tempData = []
        const majorsSet = new Set()
        
        // Get the latest academic year
        const projectsRef = collection(db, 'schools', schoolId, 'projects')
        const projectsSnapshot = await getDocs(projectsRef)
        
        if (projectsSnapshot.empty) {
          console.error('No academic years found')
          loading.value = false
          return
        }
        
        // Extract all academic year IDs and sort in descending order
        const academicYearIds = projectsSnapshot.docs.map(doc => doc.id)
        academicYearIds.sort((a, b) => b.localeCompare(a))
        
        // Get the latest year
        const selectedAcademicYear = academicYearIds[0]
        
        // Get available majors from the year document
        const yearRef = doc(db, 'schools', schoolId, 'projects', selectedAcademicYear)
        const yearDoc = await getDoc(yearRef)
        
        if (!yearDoc.exists()) {
          console.error('Year document does not exist')
          loading.value = false
          return
        }
        
        const majors = yearDoc.data().majors || []
        majorsSet.clear()
        majors.forEach(major => majorsSet.add(major))
        
        // Fetch all student users
        const studentsQuery = query(
          collection(db, 'schools', schoolId, 'users'),
          where('role', '==', 'student')
        )
        const studentsSnapshot = await getDocs(studentsQuery)
        
        // Create a map of all students
        const studentsMap = new Map()
        studentsSnapshot.forEach(doc => {
          const studentData = doc.data()
          
          // Add to users to fetch
          userIdsToFetch.add(doc.id)
          
          if (studentData.major) {
            majorsSet.add(studentData.major)
          }
          
          studentsMap.set(doc.id, {
            id: doc.id,
            name: studentData.name || 'Unknown',
            email: studentData.email || '',
            major: studentData.major || 'Unknown'
          })
        })
        
        // Get all projects with assignments 
        // Following the structure: schools/{schoolId}/projects/{year}/{majorId}/{majorDocId}/projectsPerYear/{projectId}
        const assignedProjects = []
        
        await Promise.all(majors.map(async (major) => {
          try {
            // Get the major collection - first level under year
            const majorCollectionRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear, major)
            const majorDocs = await getDocs(majorCollectionRef)
            
            if (majorDocs.empty) return
            
            // Process each major document (usually just one)
            await Promise.all(majorDocs.docs.map(async (majorDoc) => {
              const majorDocId = majorDoc.id
              
              // Access projectsPerYear subcollection
              const projectsRef = collection(
                db, 
                'schools', 
                schoolId, 
                'projects', 
                selectedAcademicYear, 
                major, 
                majorDocId,
                'projectsPerYear'
              )
              
              // Get all projects
              const projectsDocs = await getDocs(projectsRef)
              
              projectsDocs.forEach(projectDoc => {
                const projectData = projectDoc.data()
                
                // Add the lecturer to users we need to fetch
                if (projectData.userId) {
                  userIdsToFetch.add(projectData.userId)
                }
                
                // Only include projects that are assigned
                if (projectData.isAssigned && projectData.assignedTo) {
                  assignedProjects.push({
                    id: projectDoc.id,
                    title: projectData.Title || 'Unknown Project',
                    major,
                    lecturerId: projectData.userId,
                    assignedTo: projectData.assignedTo,
                    assignedAt: projectData.assignedAt
                  })
                }
              })
            }))
          } catch (error) {
            console.error(`Error fetching projects for major ${major}:`, error)
          }
        }))
        
        // Fetch user names for all users we need
        if (userIdsToFetch.size > 0) {
          await fetchUserNames(Array.from(userIdsToFetch))
        }
        
        // Create progress data for assigned students
        assignedProjects.forEach(project => {
          const student = studentsMap.get(project.assignedTo)
          
          if (student) {
            tempData.push({
              id: `${student.id}-${project.id}`,
              studentName: student.name,
              studentEmail: student.email,
              major: student.major,
              projectId: project.id,
              projectName: project.title,
              projectType: project.type,
              lecturerId: project.lecturerId,
              lecturerName: userNames.value[project.lecturerId]?.name || 'Unknown'
            })
            
            // Remove this student from the map so we don't add them again as unassigned
            studentsMap.delete(student.id)
          }
        })
        
        // Add unassigned students
        studentsMap.forEach(student => {
          tempData.push({
            id: student.id,
            studentName: student.name,
            studentEmail: student.email,
            major: student.major,
            projectId: null,
            projectName: 'Not Assigned',
            projectType: 'N/A',
            lecturerId: null,
            lecturerName: 'N/A'
          })
        })
        
        // Update available majors
        availableMajors.value = Array.from(majorsSet)
        
        // Set progress data
        progressData.value = tempData
      } catch (err) {
        console.error('Error fetching progress data:', err)
        error.value = 'Failed to load progress data. Please try again later.'
      } finally {
        loading.value = false
      }
    }

    // Fetch user names - optimized to fetch in batches
    const fetchUserNames = async (userIds) => {
      try {
        const schoolId = userStore.currentUser.school
        
        // Process in batches of 10 users at a time
        const batchSize = 10;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (userId) => {
            if (!userNames.value[userId]) {
              // According to the Firestore structure, users are in a subcollection of the school
              const userRef = doc(db, 'schools', schoolId, 'users', userId)
              const userDoc = await getDoc(userRef)
              
              if (userDoc.exists()) {
                const userData = userDoc.data()
                userNames.value[userId] = {
                  name: userData.name || userData.email || 'Unknown',
                  email: userData.email || ''
                }
              } else {
                userNames.value[userId] = {
                  name: 'Unknown',
                  email: ''
                }
              }
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching user names:', error)
      }
    }
    
    // Filtered and paginated data
    const filteredProgressData = computed(() => {
      let result = progressData.value

      // Filter by major
      if (filters.value.major !== 'all') {
        result = result.filter(item => item.major === filters.value.major)
      }

      // Filter by search term
      if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        result = result.filter(item => 
          item.studentName.toLowerCase().includes(searchTerm) ||
          item.projectName.toLowerCase().includes(searchTerm) ||
          item.lecturerName.toLowerCase().includes(searchTerm)
        )
      }

      return result
    })

    // Reset to first page when filters change
    watch(filters, () => {
      currentPage.value = 1
    })

    // Pagination
    const totalPages = computed(() => {
      return Math.ceil(filteredProgressData.value.length / perPage.value)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * perPage.value
    })

    const endIndex = computed(() => {
      return startIndex.value + perPage.value
    })

    const paginatedProgressData = computed(() => {
      return filteredProgressData.value.slice(startIndex.value, endIndex.value)
    })

    // Utility functions
    const getInitials = (name) => {
      if (!name || name === 'Unknown' || name === 'N/A') return 'N/A'
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
    }

    const getMajorColorClasses = (major) => {
      switch (major) {
        case 'Computer Science':
          return 'bg-blue-100 text-blue-800'
        case 'Mathematics':
          return 'bg-green-100 text-green-800'
        case 'Physics':
          return 'bg-yellow-100 text-yellow-800'
        case 'Chemistry':
          return 'bg-pink-100 text-pink-800'
        case 'Biology':
          return 'bg-teal-100 text-teal-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    // Fetch data on component mount
    onMounted(async () => {
      await Promise.all([
        fetchProgressData(),
        fetchLecturerSpecs()
      ])
    })

    return {
      progressData,
      lecturerSpecs,
      loading,
      error,
      filters,
      availableMajors,
      filteredProgressData,
      currentPage,
      perPage,
      totalPages,
      startIndex,
      endIndex,
      paginatedProgressData,
      getInitials,
      getMajorColorClasses
    }
  }
}
</script> 