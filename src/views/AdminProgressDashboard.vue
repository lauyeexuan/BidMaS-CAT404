<template>
    <div class="p-6 bg-gray-50 min-h-screen">
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Student Progress Dashboard</h1>
        <div class="flex items-center gap-6 bg-white px-6 py-3 rounded-lg shadow-sm">
          <!-- Major Selector -->
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-500 mr-3">Major:</span>
            <select 
              v-model="selectedMajor" 
              class="rounded-full px-4 py-1.5 text-sm font-medium border-2 border-blue-200 text-blue-700 bg-blue-50 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
              :class="{'opacity-50 cursor-not-allowed': availableMajors.length === 0}"
              :disabled="availableMajors.length === 0"
            >
              <option 
                v-for="major in availableMajors" 
                :key="major" 
                :value="major"
              >
                {{ major }}
              </option>
            </select>
          </div>

          <!-- Academic Year Display -->
          <div class="flex items-center border-l border-gray-200 pl-6">
            <span class="text-sm font-medium text-gray-500 mr-3">Academic Year:</span>
            <span class="px-4 py-1.5 bg-green-50 text-green-700 font-medium rounded-full border-2 border-green-200">
              {{ academicYear }}
            </span>
          </div>
        </div>
      </div>
  
      <!-- Dashboard Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ studentStats.onTrack }}%</div>
          <div class="text-sm text-gray-600">Students On Track</div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-green-600 h-2.5 rounded-full" :style="{ width: studentStats.onTrack + '%' }"></div>
          </div>
        </div>
  
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-yellow-500 mb-2">{{ studentStats.missingCurrent }}%</div>
          <div class="text-sm text-gray-600">Pending Current Milestone</div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-yellow-500 h-2.5 rounded-full" :style="{ width: studentStats.missingCurrent + '%' }"></div>
          </div>
        </div>
  
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-red-500 mb-2">{{ studentStats.multipleOverdue }}%</div>
          <div class="text-sm text-gray-600">Missed Milestone</div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-red-500 h-2.5 rounded-full" :style="{ width: studentStats.multipleOverdue + '%' }"></div>
          </div>
        </div>
      </div>
  
      <!-- Milestone Timeline Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Program Milestones</h2>
          <div v-if="selectedMajor" class="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
            Major: {{ selectedMajor }}
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="!majorMilestones.length" class="py-8 text-center">
          <div class="animate-pulse flex flex-col items-center">
            <div class="h-2 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div class="flex justify-between w-full">
              <div v-for="n in 6" :key="n" class="flex flex-col items-center">
                <div class="w-4 h-4 bg-gray-200 rounded-full mb-2"></div>
                <div class="h-2 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Milestone Timeline -->
        <div class="w-full px-24">
          <div class="relative py-12">
            <!-- Timeline lines -->
            <div class="absolute h-1 bg-gray-200 w-full top-1/2 transform -translate-y-1/2 z-0">
              <!-- Completed portion of the line -->
              <div 
                class="absolute h-full bg-green-500 transition-all duration-500" 
                :style="`width: ${milestoneCompletionPercentage}%`"
              ></div>
              <!-- Current portion of the line -->
              <div 
                class="absolute h-full bg-yellow-500 transition-all duration-500" 
                :style="`left: ${getLastCompletedPosition()}%; width: ${getCurrentSegmentWidth()}%`"
              ></div>
            </div>
            
            <!-- Milestones -->
            <div class="relative flex">
              <div v-for="(milestone, index) in majorMilestones" 
                   :key="milestone.id" 
                   class="absolute flex flex-col items-center"
                   :style="{ 
                     left: `${index * (100 / (majorMilestones.length - 1))}%`,
                     transform: 'translateX(-50%)',
                     top: '50%',
                     marginTop: '-12px'
                   }">
                <!-- Circle -->
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
                     :class="{
                       'bg-green-500 border-green-500 text-white': getMilestoneStatus(milestone) === 'completed',
                       'bg-white border-yellow-500': getMilestoneStatus(milestone) === 'current',
                       'bg-white border-gray-300': getMilestoneStatus(milestone) === 'upcoming'
                     }">
                  <svg v-if="getMilestoneStatus(milestone) === 'completed'" 
                       class="w-4 h-4 text-white" 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24">
                    <path stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M5 13l4 4L19 7">
                    </path>
                  </svg>
                </div>
                
                <!-- Label above -->
                <div class="absolute w-40 text-center" style="top: -36px; left: -5rem">
                  <div class="text-xs font-medium text-gray-600 whitespace-nowrap">{{ milestone.description }}</div>
                </div>
                
                <!-- Date and Status below -->
                <div class="absolute w-40 text-center flex flex-col items-center gap-1" style="top: 36px; left: -5rem">
                  <div class="text-xs text-gray-500">{{ milestone.deadline.toLocaleDateString() }}</div>
                  <div v-if="getMilestoneStatus(milestone) !== 'completed'" 
                       class="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                       :class="{
                         'bg-yellow-100 text-yellow-600': getMilestoneStatus(milestone) === 'current',
                         'bg-gray-100 text-gray-500': getMilestoneStatus(milestone) === 'upcoming'
                       }">
                    {{ getMilestoneStatus(milestone) === 'current' ? 'Current' : 'Upcoming' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between mt-12 mb-2 text-sm">
          <div class="flex items-center">
            <span class="font-semibold mr-2">Current Milestone:</span> 
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              {{ majorMilestones.every(m => getMilestoneStatus(m) === 'completed') ? 'All Milestones Completed' : getCurrentMilestoneName() }}
            </span>
          </div>
          <div v-if="loading" class="text-gray-600">
            Loading data...
          </div>
        </div>
      </div>
  
      <!-- View Selector Tabs -->
      <div class="flex border-b border-gray-200 mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="py-2 px-4 text-sm font-medium"
          :class="activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-600'"
        >
          {{ tab.name }}
        </button>
      </div>
  
      <!-- Student Table View -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examiner</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
            </tr>
            <template v-else>
              <tr v-for="student in displayData" :key="student.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">{{ student.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.project }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.supervisor }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.examiner }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex justify-center space-x-2">
                    <div v-for="(milestone, index) in majorMilestones" 
                         :key="milestone.id" 
                         class="w-3 h-3 rounded-full"
                         :class="{
                           'bg-green-500': index === 0 ? student.project !== '-' : hasSubmittedMilestone(student.id, milestone.description),
                           'bg-red-500': index === 0 ? student.project === '-' && milestone.deadline < currentDate : !hasSubmittedMilestone(student.id, milestone.description) && milestone.deadline < currentDate,
                           'bg-yellow-500': index !== 0 && getMilestoneStatus(milestone) === 'current' && !hasSubmittedMilestone(student.id, milestone.description),
                           'bg-gray-300': getMilestoneStatus(milestone) === 'upcoming'
                         }"
                         :title="index === 0 ? 
                           (student.project !== '-' ? 'Project Assigned' : 'No Project Assigned') : 
                           `${milestone.description} - ${getMilestoneStatus(milestone) === 'current' && !hasSubmittedMilestone(student.id, milestone.description) ? 'Pending Submission' : 
                           getMilestoneStatus(milestone) === 'upcoming' ? 'Upcoming' : 
                           hasSubmittedMilestone(student.id, milestone.description) ? 'Submitted' : 'Missing Submission'}`">
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="isMajorCompleted" class="font-medium">
                    <span class="text-gray-900 font-normal">S: </span>
                    <span :class="{
                      'text-red-600': student.supervisorMark < 40,
                      'text-yellow-600': student.supervisorMark >= 40 && student.supervisorMark < 60,
                      'text-blue-600': student.supervisorMark >= 60 && student.supervisorMark < 80,
                      'text-green-600': student.supervisorMark >= 80
                    }" class="font-bold">{{ student.supervisorMark }}%</span>
                    <span class="text-gray-900 font-normal"> E: </span>
                    <span :class="{
                      'text-red-600': student.examinerMark < 40,
                      'text-yellow-600': student.examinerMark >= 40 && student.examinerMark < 60,
                      'text-blue-600': student.examinerMark >= 60 && student.examinerMark < 80,
                      'text-green-600': student.examinerMark >= 80
                    }" class="font-bold">{{ student.examinerMark }}%</span>
                    <button 
                      @click="showMarkDetails(student)"
                      class="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                      Detail
                    </button>
                  </div>
                  <div v-else class="text-gray-500">-</div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
  
      <!-- Examiner Assignment Modal -->
      <div v-if="showExaminerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Select Examiner</h3>
            <button @click="showExaminerModal = false" class="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <div class="text-sm text-gray-600 mb-2">Project: AI-Powered Educational Assessment</div>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">AI</span>
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Machine Learning</span>
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Education</span>
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Assessment</span>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 relative overflow-hidden">
              <div class="absolute right-0 top-0 bg-blue-500 text-white px-2 py-1 text-xs">
                92% Match
              </div>
              <div class="flex items-start mb-3">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  LP
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">Dr. Lisa Park</h3>
                  <p class="text-xs text-gray-500">Computer Science</p>
                </div>
              </div>
              <div class="space-y-2">
                <div>
                  <h4 class="text-xs font-medium text-gray-500 mb-1">Specializations:</h4>
                  <div class="flex flex-wrap gap-1">
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">AI</span>
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Data Science</span>
                    <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Assessment</span>
                  </div>
                </div>
              </div>
              <div class="flex justify-end mt-3">
                <button @click="assignExaminer('Dr. Lisa Park'); showExaminerModal = false" 
                        class="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                  Select as Examiner
                </button>
              </div>
            </div>
            
            <!-- Other examiner options... -->
          </div>
        </div>
      </div>

      <!-- Mark Details Modal -->
      <div v-if="showMarkDetailsModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           @click.self="showMarkDetailsModal = false">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Mark Distribution - {{ selectedStudent?.name }}</h3>
            <button @click="showMarkDetailsModal = false" class="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <template v-for="milestone in majorMilestones" :key="milestone.description">
              <div v-if="getMarksByMilestone(selectedStudent?.id, milestone.description).length > 0" 
                   class="border rounded-lg p-4">
                <h4 class="font-medium text-gray-800 mb-3">{{ milestone.description }}</h4>
                
                <!-- Supervisor Marks -->
                <div v-if="getMarksByRole(selectedStudent?.id, milestone.description, 'supervisor').length > 0" 
                     class="mb-4">
                  <h5 class="text-sm font-medium text-gray-600 mb-2">Supervisor Marks:</h5>
                  <div class="bg-gray-50 rounded p-3">
                    <div v-for="mark in getMarksByRole(selectedStudent?.id, milestone.description, 'supervisor')" 
                         :key="mark.id"
                         class="flex justify-between items-center text-sm">
                      <span>Original Mark: <span class="font-medium">{{ mark.mark }}%</span></span>
                      <span>Weighted Mark: <span class="font-medium">{{ mark.weightedMark }}%</span></span>
                    </div>
                  </div>
                </div>

                <!-- Examiner Marks -->
                <div v-if="getMarksByRole(selectedStudent?.id, milestone.description, 'examiner').length > 0">
                  <h5 class="text-sm font-medium text-gray-600 mb-2">Examiner Marks:</h5>
                  <div class="bg-gray-50 rounded p-3">
                    <div v-for="mark in getMarksByRole(selectedStudent?.id, milestone.description, 'examiner')" 
                         :key="mark.id"
                         class="flex justify-between items-center text-sm">
                      <span>Original Mark: <span class="font-medium">{{ mark.mark }}%</span></span>
                      <span>Weighted Mark: <span class="font-medium">{{ mark.weightedMark }}%</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Total Weighted Marks -->
            <div class="border-t pt-4 mt-6">
              <h4 class="font-medium text-gray-800 mb-3">Total Weighted Marks</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded p-4">
                  <div class="text-sm font-medium text-gray-600 mb-1">Supervisor Total:</div>
                  <div class="text-2xl font-bold text-blue-700">{{ getTotalWeightedMark(selectedStudent?.id, 'supervisor') }}%</div>
                </div>
                <div class="bg-green-50 rounded p-4">
                  <div class="text-sm font-medium text-gray-600 mb-1">Examiner Total:</div>
                  <div class="text-2xl font-bold text-green-700">{{ getTotalWeightedMark(selectedStudent?.id, 'examiner') }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
  import { db } from '@/firebase'
  import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
  
  export default {
    name: 'AdminProgressDashboard',
    setup() {
      const userStore = useUserStore()
      const activeTab = ref('milestone')
      const expandedStudentId = ref(null)
      const showExaminerModal = ref(false)
      const selectedMajor = ref('')
      const availableMajors = ref([])
      const academicYear = ref('')
      const majorMilestones = ref([])
      const currentDate = new Date()
      
      // New state variables for real data
      const students = ref([])
      const projectsMap = ref(new Map())
      const usersMap = ref(new Map())
      const loading = ref(false)
      const submissionsMap = ref(new Map())
      const feedbackMap = ref(new Map())
      
      const tabs = [
        { id: 'milestone', name: 'Students' },
      ]
      
      // Function to fetch students by major
      const fetchStudentsByMajor = async (major) => {
        try {
          if (!userStore.currentUser?.school) return

          const studentsRef = collection(db, 'schools', userStore.currentUser.school, 'users')
          const q = query(
            studentsRef,
            where('role', '==', 'student'),
            where('major', '==', major)
          )
          const querySnapshot = await getDocs(q)
          students.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        } catch (error) {
          console.error('Error fetching students:', error)
        }
      }

      // Function to fetch projects for major
      const fetchProjectsForMajor = async (major, yearId, majorDocId) => {
        try {
          if (!userStore.currentUser?.school) return
          console.log('Fetching projects with params:', { major, yearId, majorDocId, schoolId: userStore.currentUser.school })

          // Log the full path we're querying
          const path = `schools/${userStore.currentUser.school}/projects/${yearId}/${major}/${majorDocId}/projectsPerYear`
          console.log('Querying path:', path)

          const projectsRef = collection(
            db, 
            'schools', 
            userStore.currentUser.school,
            'projects',
            yearId,
            major,
            majorDocId,
            'projectsPerYear'
          )

          // Query using the composite index
          const q = query(
            projectsRef,
            where('assignedTo', '!=', null),
            orderBy('assignedTo'),
            orderBy('Title')
          )

          // Get all projects that are assigned
          const querySnapshot = await getDocs(q)
          console.log('Raw projects found:', querySnapshot.size)
          
          // Log all projects for debugging
          querySnapshot.docs.forEach(doc => {
            console.log('Project document:', {
              id: doc.id,
              data: doc.data()
            })
          })
          
          // Clear existing projects map
          projectsMap.value = new Map()
          
          // Create set of user IDs to fetch
          const userIdsToFetch = new Set()
          
          // Process each project
          querySnapshot.docs.forEach(doc => {
            const projectData = doc.data()
            console.log('Processing project:', {
              id: doc.id,
              assignedTo: projectData.assignedTo,
              Title: projectData.Title,
              userId: projectData.userId,
              examinerId: projectData.examinerId
            })

            // Store project by assignedTo
            projectsMap.value.set(projectData.assignedTo, {
              id: doc.id,
              ...projectData
            })
            if (projectData.userId) userIdsToFetch.add(projectData.userId)
            if (projectData.examinerId) userIdsToFetch.add(projectData.examinerId)
          })

          console.log('Final projects map:', {
            size: projectsMap.value.size,
            entries: Array.from(projectsMap.value.entries()).map(([key, value]) => ({
              studentId: key,
              projectTitle: value.Title,
              supervisorId: value.userId,
              examinerId: value.examinerId
            }))
          })

          // Fetch user names for supervisors and examiners
          if (userIdsToFetch.size > 0) {
            console.log('Fetching names for users:', Array.from(userIdsToFetch))
            await fetchUserNames(Array.from(userIdsToFetch))
          }
        } catch (error) {
          console.error('Error fetching projects:', error)
        }
      }

      // Function to batch fetch user names
      const fetchUserNames = async (userIds) => {
        try {
          if (!userStore.currentUser?.school || !userIds.length) return

          // Clear existing users map
          usersMap.value = new Map()

          // Batch fetch users
          const promises = userIds.map(userId => 
            getDoc(doc(db, 'schools', userStore.currentUser.school, 'users', userId))
          )
          const userDocs = await Promise.all(promises)
          
          userDocs.forEach(userDoc => {
            if (userDoc.exists()) {
              usersMap.value.set(userDoc.id, userDoc.data().name)
            }
          })
        } catch (error) {
          console.error('Error fetching user names:', error)
        }
      }

      // Function to format academic year
      const formatAcademicYear = (year) => {
        if (!year) return ''
        // Convert something like "2023/2024" to "2324"
        const years = year.split('/')
        if (years.length === 2) {
          return years[0].slice(-2) + years[1].slice(-2)
        }
        return year
      }

      // Function to fetch submissions for the selected major
      const fetchSubmissions = async (major) => {
        try {
          if (!userStore.currentUser?.school) return
          
          const submissionsRef = collection(db, 'schools', userStore.currentUser.school, 'submissions')
          const q = query(
            submissionsRef,
            where('majorId', '==', major)
          )
          
          const querySnapshot = await getDocs(q)
          
          // Clear existing submissions map
          submissionsMap.value = new Map()
          
          // Group submissions by student ID
          querySnapshot.docs.forEach(doc => {
            const submission = doc.data()
            const studentId = submission.submittedBy
            
            if (!submissionsMap.value.has(studentId)) {
              submissionsMap.value.set(studentId, [])
            }
            
            submissionsMap.value.get(studentId).push({
              id: doc.id,
              ...submission
            })
          })
          
          console.log('Submissions loaded:', Array.from(submissionsMap.value.entries()))
        } catch (error) {
          console.error('Error fetching submissions:', error)
        }
      }

      // Function to check if a student has submitted for a milestone
      const hasSubmittedMilestone = (studentId, milestoneDescription) => {
        const studentSubmissions = submissionsMap.value.get(studentId) || []
        return studentSubmissions.some(submission => 
          submission.milestoneDescription === milestoneDescription
        )
      }

      // Load all data when major changes
      const loadData = async (major) => {
        loading.value = true
        try {
          console.log('Loading data for major:', major)
          await fetchStudentsByMajor(major)
          await fetchSubmissions(major)
          console.log('Students loaded:', students.value.map(s => ({
            id: s.id,
            name: s.name,
            major: s.major
          })))
          
          // Format the academic year to match Firestore format
          const formattedYear = formatAcademicYear(academicYear.value)
          console.log('Formatted academic year:', { original: academicYear.value, formatted: formattedYear })
          
          // Get the major document ID
          if (!userStore.currentUser?.school) return
          const yearRef = doc(db, 'schools', userStore.currentUser.school, 'projects', formattedYear)
          console.log('Checking year document:', formattedYear)
          
          const yearDoc = await getDoc(yearRef)
          if (yearDoc.exists()) {
            console.log('Year document found:', yearDoc.data())
            const majorCollection = collection(yearRef, major)
            console.log('Querying major collection:', major)
            
            const majorDocs = await getDocs(majorCollection)
            console.log('Major docs found:', majorDocs.size)
            
            if (!majorDocs.empty) {
              const majorDocId = majorDocs.docs[0].id
              console.log('Using major doc:', {
                id: majorDocId,
                data: majorDocs.docs[0].data()
              })
              await fetchProjectsForMajor(major, formattedYear, majorDocId)
            } else {
              console.warn('No major documents found for major:', major)
            }
          } else {
            console.warn('Year document not found:', formattedYear)
          }
        } catch (error) {
          console.error('Error loading data:', error)
        } finally {
          loading.value = false
        }
      }

      // Watch for major changes
      watch([selectedMajor, academicYear], async ([newMajor, newYear]) => {
        console.log('Major or year changed:', { major: newMajor, year: newYear })
        if (newMajor && newYear) {
          await loadData(newMajor)
          if (isMajorCompleted.value) {
            await fetchFeedback()
          }
        }
      })

      // Function to check if all milestones are completed
      const hasCompletedAllMilestones = (studentId) => {
        // Check if all milestones are completed for this student
        return majorMilestones.value.every(milestone => {
          if (milestone.deadline > currentDate) {
            return true; // Future milestones don't count
          }
          return hasSubmittedMilestone(studentId, milestone.description);
        });
      }

      // Function to generate a dummy final grade
      const generateDummyGrade = () => {
        // Generate a random grade between 65 and 95 for demonstration
        return Math.floor(Math.random() * (95 - 65 + 1)) + 65;
      }

      // Computed property for display data
      const displayData = computed(() => {
        const data = students.value.map(student => {
          const project = projectsMap.value.get(student.id)
          const feedback = feedbackMap.value.get(student.id) || { supervisorMark: 0, examinerMark: 0 }
          console.log('Mapping student:', student.id, 'Project:', project)
          return {
            id: student.id,
            name: student.name,
            project: project?.Title || '-',
            supervisor: project?.userId ? usersMap.value.get(project.userId) || '-' : '-',
            examiner: project?.examinerId ? usersMap.value.get(project.examinerId) || '-' : '-',
            supervisorMark: feedback.supervisorMark,
            examinerMark: feedback.examinerMark
          }
        })
        console.log('Display data:', data)
        return data
      })
      
      // Get milestones from session storage
      const getMilestonesFromSessionStorage = (majorId) => {
        try {
          if (!userStore.currentUser?.uid) return null
          
          // Create user and major specific key
          const userMajorKey = `${userStore.currentUser.uid}_${majorId}_milestones`
          const storedData = sessionStorage.getItem(userMajorKey)
          
          if (!storedData) return null
          
          const parsedData = JSON.parse(storedData)
          
          // Convert ISO strings back to Date objects and sort by deadline
          const sortedMilestones = parsedData.milestones
            .map(milestone => ({
              ...milestone,
              deadline: new Date(milestone.deadline)
            }))
            .sort((a, b) => a.deadline - b.deadline)

          return sortedMilestones
        } catch (err) {
          console.error('Error retrieving milestone data from session storage:', err)
          return null
        }
      }

      // Watch for changes in selected major
      watch(selectedMajor, (newMajor) => {
        if (newMajor) {
          const storedMilestones = getMilestonesFromSessionStorage(newMajor)
          if (storedMilestones) {
            console.log('Sorted milestones by deadline:', storedMilestones.map(m => ({
              description: m.description,
              deadline: m.deadline.toLocaleString()
            })))
            majorMilestones.value = storedMilestones
          }
        }
      })

      // Function to initialize the dashboard data
      const initializeDashboard = async () => {
        try {
          if (!userStore.currentUser?.school) {
            throw new Error('School information not found')
          }

          const school = userStore.currentUser.school
          
          // Get latest academic year
          const yearData = await getLatestAcademicYear(school)
          if (!yearData) {
            throw new Error('Failed to get latest academic year')
          }

          // Set the academic year display
          academicYear.value = yearData.academicYear

          // Get available majors from the year document
          const yearRef = doc(db, 'schools', school, 'projects', yearData.yearId)
          const yearDoc = await getDoc(yearRef)
          
          if (!yearDoc.exists()) {
            throw new Error('Year document not found')
          }

          // Set available majors
          availableMajors.value = yearDoc.data().majors || []
          
          // Set initial selected major
          if (availableMajors.value.length > 0) {
            selectedMajor.value = availableMajors.value[0]
          }
        } catch (err) {
          console.error('Error initializing dashboard:', err)
        }
      }

      // Computed property to get milestone completion percentage
      const milestoneCompletionPercentage = computed(() => {
        if (!majorMilestones.value.length) return 0
        const completedMilestones = majorMilestones.value.filter(m => m.deadline < currentDate).length
        return (completedMilestones / majorMilestones.value.length) * 100
      })

      // Initialize on component mount
      onMounted(() => {
        initializeDashboard()
      })
      
      // Filter students based on selected major
      const filteredStudents = computed(() => {
        // Always return all students regardless of major
        return students.value
      })
      
      // Get milestone name by ID
      const getMilestoneName = (milestoneId) => {
        const milestone = majorMilestones.value.find(m => m.id === milestoneId)
        return milestone ? milestone.name : 'Unknown'
      }
      
      // Check if a student has completed a specific milestone
      const hasCompletedMilestone = (student, milestoneId) => {
        const submission = student.submissions.find(s => s.milestoneId === milestoneId)
        return submission && (submission.status === 'on-time' || submission.status === 'late')
      }
      
      // Check if a milestone is the current active one
      const isMilestoneCurrent = (milestone) => {
        // Current milestone is the first one whose due date is in the future
        for (let i = 0; i < majorMilestones.value.length; i++) {
          if (majorMilestones.value[i].deadline > currentDate) {
            return majorMilestones.value[i].id === milestone.id
          }
        }
        return false
      }
      
      // Check if a milestone is in the past
      const isPastMilestone = (milestone) => {
        const isPast = milestone.deadline < currentDate
        console.log('isPastMilestone check:', {
          description: milestone.description,
          deadline: milestone.deadline,
          currentDate: currentDate,
          isPast: isPast
        })
        return isPast
      }
      
      // Get the name of the current milestone
      const getCurrentMilestoneName = () => {
        const currentMilestone = majorMilestones.value.find(m => getMilestoneStatus(m) === 'current')
        return currentMilestone ? currentMilestone.description : 'All milestones completed'
      }
      
      // Get the date of the next milestone
      const getNextMilestoneDate = () => {
        const currentMilestone = majorMilestones.value.find(m => getMilestoneStatus(m) === 'current')
        return currentMilestone ? currentMilestone.deadline.toLocaleDateString() : 'No upcoming deadlines'
      }
      
      // Get CSS class for milestone status in the timeline
      const getMilestoneStatusClass = (milestone, index) => {
        if (milestone.deadline < currentDate) {
          return 'bg-gray-400' // Past milestone
        } else if (isMilestoneCurrent(milestone)) {
          return 'bg-blue-500' // Current milestone
        } else {
          return 'bg-gray-200' // Future milestone
        }
      }
      
      // Get CSS class for student milestone status indicator dots
      const getStudentMilestoneClass = (student, milestoneId) => {
        const milestone = majorMilestones.value.find(m => m.id === milestoneId)
        
        if (hasCompletedMilestone(student, milestoneId)) {
          return 'bg-green-500' // Completed
        } else if (milestone.deadline < currentDate) {
          return 'bg-red-500' // Missed
        } else if (isMilestoneCurrent(milestone)) {
          return 'bg-blue-500' // Current
        } else {
          return 'bg-gray-300' // Future
        }
      }
      
      // Calculate student progress percentage
      const getStudentProgressPercentage = (student) => {
        let completedMilestones = 0
        let totalPastMilestones = 0
        
        // Count completed milestones and total past milestones
        majorMilestones.value.forEach(milestone => {
          if (milestone.deadline <= currentDate) {
            totalPastMilestones++
            if (hasCompletedMilestone(student, milestone.id)) {
              completedMilestones++
            }
          }
        })
        
        // If no past milestones, return 0
        if (totalPastMilestones === 0) return 0
        
        // Calculate percentage based on past milestones
        return (completedMilestones / majorMilestones.value.length) * 100
      }
      
      // Check if student has missed the current milestone
      const hasMissedCurrentMilestone = (student) => {
        let currentMilestoneId = null
        
        // Find the current milestone
        for (let i = 0; i < majorMilestones.value.length; i++) {
          if (majorMilestones.value[i].deadline > currentDate) {
            // If this is the first milestone, then there's no previous one to miss
            if (i === 0) return false
            
            // Check if the previous milestone was completed
            return !hasCompletedMilestone(student, majorMilestones.value[i-1].id)
          }
        }
        
        return false
      }
      
      // Check if student has missed multiple milestones
      const hasMissedMultipleMilestones = (student) => {
        let missedCount = 0
        
        majorMilestones.value.forEach(milestone => {
          if (milestone.deadline < currentDate && !hasCompletedMilestone(student, milestone.id)) {
            missedCount++
          }
        })
        
        return missedCount >= 2
      }
      
      // Function to expand student details
      const expandStudentDetails = (studentId) => {
        if (expandedStudentId.value === studentId) {
          expandedStudentId.value = null
        } else {
          expandedStudentId.value = studentId
        }
      }
      
      // Function to assign an examiner
      const assignExaminer = (examinerName) => {
        // In a real app, this would make an API call
        // For this demo, we'll just show a console log
        console.log(`Assigned ${examinerName} as an examiner`)
      }
      
      // Update milestone status logic
      const getMilestoneStatus = (milestone) => {
        // Find index of current milestone in the array
        const currentIndex = majorMilestones.value.findIndex(m => 
          m.deadline.getTime() === milestone.deadline.getTime() && 
          m.description === milestone.description
        )
        
        console.log('Checking milestone:', {
          description: milestone.description,
          deadline: milestone.deadline,
          currentDate: currentDate,
          currentIndex: currentIndex
        })
        
        // First check if the milestone is already past
        if (isPastMilestone(milestone)) {
          console.log('Milestone is completed:', milestone.description)
          return 'completed'
        }
        
        // Find the first future milestone index
        const nextMilestoneIndex = majorMilestones.value.findIndex(m => m.deadline > currentDate)
        console.log('Next milestone index:', nextMilestoneIndex)
        
        // If this is the first future milestone, it's current
        if (nextMilestoneIndex !== -1 && currentIndex === nextMilestoneIndex) {
          console.log('Milestone is current:', milestone.description)
          return 'current'
        }
        
        // If we get here, the milestone is in the future but not the next one
        console.log('Milestone is upcoming:', milestone.description)
        return 'upcoming'
      }
      
      // Update these functions in the setup() return statement
      const getLastCompletedPosition = () => {
        const completedCount = majorMilestones.value.filter(m => isPastMilestone(m)).length
        if (completedCount === 0) return 0
        if (completedCount === majorMilestones.value.length) return 100
        return (completedCount / (majorMilestones.value.length - 1)) * 100
      }
      
      const getCurrentSegmentWidth = () => {
        const totalMilestones = majorMilestones.value.length
        if (totalMilestones <= 1) return 0
        
        const segmentWidth = 100 / (totalMilestones - 1)
        const lastCompletedPos = getLastCompletedPosition()
        const currentIndex = majorMilestones.value.findIndex(m => getMilestoneStatus(m) === 'current')
        
        if (currentIndex === -1) return 0
        
        const currentPosition = (currentIndex / (totalMilestones - 1)) * 100
        return currentPosition - lastCompletedPos
      }
      
      // Add these computed properties for statistics
      const studentStats = computed(() => {
        if (!displayData.value.length) return { onTrack: 0, missingCurrent: 0, multipleOverdue: 0 }
        
        let onTrackCount = 0
        let missingCurrentCount = 0
        let multipleOverdueCount = 0
        
        displayData.value.forEach(student => {
          let redCount = 0
          let hasYellow = false
          let allGreen = true
          
          majorMilestones.value.forEach((milestone, index) => {
            // For first milestone (Project Bidding)
            if (index === 0) {
              if (student.project === '-' && milestone.deadline < currentDate) {
                redCount++
                allGreen = false
              }
            } 
            // For other milestones
            else {
              const status = getMilestoneStatus(milestone)
              const hasSubmitted = hasSubmittedMilestone(student.id, milestone.description)
              
              if (!hasSubmitted && milestone.deadline < currentDate) {
                redCount++
                allGreen = false
              }
              if (status === 'current' && !hasSubmitted) {
                hasYellow = true
                allGreen = false
              }
            }
          })
          
          if (allGreen) onTrackCount++
          if (hasYellow) missingCurrentCount++
          if (redCount > 0) multipleOverdueCount++
        })
        
        const total = displayData.value.length
        return {
          onTrack: Math.round((onTrackCount / total) * 100),
          missingCurrent: Math.round((missingCurrentCount / total) * 100),
          multipleOverdue: Math.round((multipleOverdueCount / total) * 100)
        }
      })
      
      // Add these new refs and computed properties in setup()
      const isMajorCompleted = computed(() => {
        return majorMilestones.value.every(milestone => milestone.deadline < currentDate)
      })

      // Function to fetch feedback for all students
      const fetchFeedback = async () => {
        try {
          if (!userStore.currentUser?.school || !students.value.length) return

          // Clear existing maps
          feedbackMap.value = new Map()

          // Create a batch of promises for each student
          const promises = students.value.map(async student => {
            const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
            const q = query(
              feedbackRef,
              where('studentId', '==', student.id)
            )
            
            const querySnapshot = await getDocs(q)
            
            // Initialize marks
            let supervisorTotal = 0
            let examinerTotal = 0
            let studentFeedback = []

            // Process each feedback document
            querySnapshot.forEach(doc => {
              const feedback = doc.data()
              
              // Add to total marks by role
              if (feedback.role === 'supervisor') {
                supervisorTotal += feedback.weightedMark
              } else if (feedback.role === 'examiner') {
                examinerTotal += feedback.weightedMark
              }

              // Store detailed feedback
              studentFeedback.push({
                id: doc.id,
                ...feedback
              })
            })

            // Store total marks in feedbackMap
            feedbackMap.value.set(student.id, {
              supervisorMark: supervisorTotal,
              examinerMark: examinerTotal
            })

            // Store detailed feedback in detailedFeedbackMap
            detailedFeedbackMap.value.set(student.id, studentFeedback)
          })

          // Wait for all feedback queries to complete
          await Promise.all(promises)
          console.log('Detailed feedback loaded:', Array.from(detailedFeedbackMap.value.entries()))
        } catch (error) {
          console.error('Error fetching feedback:', error)
        }
      }
      
      const showMarkDetailsModal = ref(false)
      const selectedStudent = ref(null)
      const detailedFeedbackMap = ref(new Map())

      // Function to show mark details modal
      const showMarkDetails = (student) => {
        selectedStudent.value = student
        showMarkDetailsModal.value = true
      }

      // Function to get marks by milestone
      const getMarksByMilestone = (studentId, milestoneDescription) => {
        if (!studentId) return []
        const feedback = detailedFeedbackMap.value.get(studentId) || []
        return feedback.filter(f => f.milestoneDescription === milestoneDescription)
      }

      // Function to get marks by role for a specific milestone
      const getMarksByRole = (studentId, milestoneDescription, role) => {
        if (!studentId) return []
        const milestoneFeedback = getMarksByMilestone(studentId, milestoneDescription)
        return milestoneFeedback.filter(f => f.role === role)
      }
      
      // Add this new function in the setup() section
      const getTotalWeightedMark = (studentId, role) => {
        if (!studentId) return 0
        const feedback = detailedFeedbackMap.value.get(studentId) || []
        const roleFeedback = feedback.filter(f => f.role === role)
        const total = roleFeedback.reduce((sum, f) => sum + (f.weightedMark || 0), 0)
        return total
      }

      return {
        activeTab,
        tabs,
        majorMilestones,
        displayData,
        expandedStudentId,
        showExaminerModal,
        selectedMajor,
        availableMajors,
        academicYear,
        loading,
        studentStats,
        // Functions
        expandStudentDetails,
        assignExaminer,
        milestoneCompletionPercentage,
        currentDate,
        getMilestoneStatus,
        getLastCompletedPosition,
        getCurrentSegmentWidth,
        hasSubmittedMilestone,
        submissionsMap,
        getCurrentMilestoneName,
        hasCompletedAllMilestones,
        isMajorCompleted,
        feedbackMap,
        showMarkDetailsModal,
        selectedStudent,
        showMarkDetails,
        getMarksByMilestone,
        getMarksByRole,
        getTotalWeightedMark,
      }
    }
  }
  </script>
  
  <style scoped>
  /* Timeline connector styles */
  .milestone-line {
    position: relative;
  }
  
  .milestone-line::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #e5e7eb;
    transform: translateY(-50%);
    z-index: 0;
  }
  </style>