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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-green-600 mb-2">82%</div>
          <div class="text-sm text-gray-600">Students On Track</div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-green-600 h-2.5 rounded-full" style="width: 82%"></div>
          </div>
        </div>
  
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-yellow-500 mb-2">12%</div>
          <div class="text-sm text-gray-600">Missing Current Milestone</div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-yellow-500 h-2.5 rounded-full" style="width: 12%"></div>
          </div>
        </div>
  
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-red-500 mb-2">6%</div>
          <div class="text-sm text-gray-600">Multiple Milestones Missing</div>
          <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-red-500 h-2.5 rounded-full" style="width: 6%"></div>
          </div>
        </div>
  
        <div class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">8</div>
          <div class="text-sm text-gray-600">Pending Examiner Assignments</div>
          <button @click="showExaminerModal = true" class="mt-3 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
            Assign Now
          </button>
        </div>
      </div>
  
      <!-- Milestone Timeline Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Program Milestones</h2>
          <div v-if="selectedMajor" class="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
            {{ selectedMajor }}
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
            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
              {{ getCurrentMilestoneName() }}
            </span>
          </div>
          <div class="text-yellow-600">
            Next Deadline: {{ getNextMilestoneDate() }}
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
  
      <!-- Milestone Submission View -->
      <div v-if="activeTab === 'milestone'" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Milestone Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examiner</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in filteredStudents" :key="student.id" 
                :class="{'bg-yellow-50': hasMissedCurrentMilestone(student), 'bg-red-50': hasMissedMultipleMilestones(student)}">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ student.name }}</div>
                <div class="text-sm text-gray-500">{{ student.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ student.major === 'cs' ? 'Computer Science' : student.major === 'ee' ? 'Electrical Engineering' : 'Mechanical Engineering' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ student.project }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="flex justify-center space-x-1">
                  <div v-for="(milestone, index) in majorMilestones" :key="index" 
                       class="w-3 h-3 rounded-full" 
                       :class="getStudentMilestoneClass(student, milestone.id)"
                       :title="milestone.name + ': ' + (hasCompletedMilestone(student, milestone.id) ? 'Completed' : 'Not Completed')">
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ student.examiner || 'Not Assigned' }}
                <button v-if="!student.examiner" @click="showExaminerModal = true" class="ml-2 text-xs text-blue-600 hover:text-blue-800">
                  Assign
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="expandStudentDetails(student.id)" class="text-blue-600 hover:text-blue-900 mr-3">
                  Details
                </button>
                <button class="text-gray-600 hover:text-gray-900">
                  Message
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Student Cards View -->
      <div v-if="activeTab === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="student in filteredStudents" :key="student.id" 
             class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
             :class="{
               'border-l-4 border-green-500': !hasMissedCurrentMilestone(student) && !hasMissedMultipleMilestones(student),
               'border-l-4 border-yellow-500': hasMissedCurrentMilestone(student) && !hasMissedMultipleMilestones(student),
               'border-l-4 border-red-500': hasMissedMultipleMilestones(student)
             }">
          <div class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium text-lg">{{ student.name }}</div>
                <div class="text-sm text-gray-600 mb-1">
                  {{ student.major === 'cs' ? 'Computer Science' : student.major === 'ee' ? 'Electrical Engineering' : 'Mechanical Engineering' }}
                </div>
                <div class="text-sm">Project: {{ student.project }}</div>
              </div>
              <button @click="expandedStudentId = expandedStudentId === student.id ? null : student.id" 
                      class="text-blue-600 hover:text-blue-800 focus:outline-none">
                <span v-if="expandedStudentId !== student.id">Expand ▼</span>
                <span v-else>Collapse ▲</span>
              </button>
            </div>
            
            <!-- Milestone Status Bar -->
            <div class="mt-4">
              <div class="flex items-center w-full">
                <div v-for="milestone in majorMilestones" :key="milestone.id" class="flex-1 flex flex-col items-center">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center"
                       :class="hasCompletedMilestone(student, milestone.id) ? 'bg-green-500 text-white' : isMilestoneCurrent(milestone) ? 'border-2 border-blue-500' : isPastMilestone(milestone) ? 'border-2 border-red-500 bg-red-100' : 'border-2 border-gray-300'">
                    <svg v-if="hasCompletedMilestone(student, milestone.id)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="isPastMilestone(milestone) && !hasCompletedMilestone(student, milestone.id)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="text-xs mt-1 text-center">{{ milestone.name }}</div>
                  <div class="text-xs text-gray-500">{{ milestone.dueDate }}</div>
                </div>
              </div>
              <div class="relative mt-1">
                <div class="absolute top-0 left-0 w-full h-0.5 bg-gray-200"></div>
                <div class="absolute top-0 left-0 h-0.5 bg-green-500" :style="`width: ${getStudentProgressPercentage(student)}%`"></div>
              </div>
            </div>
            
            <!-- Expanded Section -->
            <div v-if="expandedStudentId === student.id" class="mt-4 pt-4 border-t border-gray-200">
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div class="text-xs text-gray-500">Supervisor</div>
                  <div class="text-sm">{{ student.supervisor }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500">Examiner</div>
                  <div class="text-sm">{{ student.examiner || 'Not assigned' }}</div>
                  <button v-if="!student.examiner" @click="showExaminerModal = true"
                          class="mt-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                    Assign Examiner
                  </button>
                </div>
              </div>
              
              <!-- Milestone Submission History -->
              <div class="mt-3">
                <div class="text-xs text-gray-500 mb-2 font-medium">Milestone Submission History</div>
                <div class="space-y-2">
                  <div v-for="submission in student.submissions" :key="submission.milestoneId" 
                       class="p-2 rounded" 
                       :class="submission.status === 'on-time' ? 'bg-green-50 border border-green-100' : submission.status === 'late' ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50 border border-gray-100'">
                    <div class="flex justify-between">
                      <div class="text-sm font-medium">{{ getMilestoneName(submission.milestoneId) }}</div>
                      <div class="text-xs" :class="submission.status === 'on-time' ? 'text-green-600' : submission.status === 'late' ? 'text-yellow-600' : 'text-gray-500'">
                        {{ submission.status === 'on-time' ? 'On Time' : submission.status === 'late' ? 'Late' : 'Not Submitted' }}
                      </div>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ submission.submittedDate ? `Submitted: ${submission.submittedDate}` : 'No submission' }}
                    </div>
                    <div v-if="submission.feedback" class="mt-1 text-xs text-gray-600 italic">
                      "{{ submission.feedback }}"
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex justify-end gap-2 mt-3">
                <button class="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                  View Full Details
                </button>
                <button class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
  import { db } from '@/firebase'
  import { doc, getDoc } from 'firebase/firestore'
  
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
      
      const tabs = [
        { id: 'milestone', name: 'Milestone View' },
        { id: 'cards', name: 'Student Cards' },
        { id: 'analytics', name: 'Analytics' },
      ]
      
      // Get milestones from session storage
      const getMilestonesFromSessionStorage = (majorId) => {
        try {
          if (!userStore.currentUser?.uid) return null
          
          // Create user and major specific key
          const userMajorKey = `${userStore.currentUser.uid}_${majorId}_milestones`
          const storedData = sessionStorage.getItem(userMajorKey)
          
          if (!storedData) return null
          
          const parsedData = JSON.parse(storedData)
          
          // Convert ISO strings back to Date objects
          return parsedData.milestones.map(milestone => ({
            ...milestone,
            deadline: new Date(milestone.deadline)
          }))
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
      
      // Student data with milestone submissions
      const students = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@university.edu',
          major: 'cs',
          project: 'Blockchain-Based Supply Chain Tracking',
          supervisor: 'Dr. Robert Johnson',
          examiner: 'Dr. Emma Wilson',
          submissions: [
            { milestoneId: 'proposal', status: 'on-time', submittedDate: 'Sept 28, 2023', feedback: 'Well-structured proposal.' },
            { milestoneId: 'literature', status: 'on-time', submittedDate: 'Oct 29, 2023', feedback: 'Good review, but could include more recent papers.' },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        },
        {
          id: 2,
          name: 'Amy Brown',
          email: 'amy.brown@university.edu',
          major: 'ee',
          project: 'Smart Grid Optimization with IoT',
          supervisor: 'Dr. Tasha Rivera',
          examiner: 'Dr. Henry Zhang',
          submissions: [
            { milestoneId: 'proposal', status: 'on-time', submittedDate: 'Sept 25, 2023', feedback: 'Excellent proposal, very clear objectives.' },
            { milestoneId: 'literature', status: 'on-time', submittedDate: 'Oct 30, 2023', feedback: 'Comprehensive review.' },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        },
        {
          id: 3,
          name: 'Michael Chen',
          email: 'michael.chen@university.edu',
          major: 'me',
          project: 'Autonomous Drone Navigation System',
          supervisor: 'Dr. James Wilson',
          examiner: null,
          submissions: [
            { milestoneId: 'proposal', status: 'late', submittedDate: 'Oct 5, 2023', feedback: 'Good content but submitted late. Please adhere to deadlines.' },
            { milestoneId: 'literature', status: 'late', submittedDate: 'Nov 10, 2023', feedback: 'Review needs more depth.' },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        },
        {
          id: 4,
          name: 'Eric Lee',
          email: 'eric.lee@university.edu',
          major: 'cs',
          project: 'Neural Networks for Image Recognition',
          supervisor: 'Dr. James Chen',
          examiner: null,
          submissions: [
            { milestoneId: 'proposal', status: 'on-time', submittedDate: 'Sept 29, 2023', feedback: 'Very innovative approach.' },
            { milestoneId: 'literature', status: 'on-time', submittedDate: 'Oct 25, 2023', feedback: 'Excellent literature review.' },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        },
        {
          id: 5,
          name: 'Tim Garcia',
          email: 'tim.garcia@university.edu',
          major: 'cs',
          project: 'Secure Cloud Authentication Methods',
          supervisor: 'Dr. Alicia Moore',
          examiner: 'Dr. Jason Clark',
          submissions: [
            { milestoneId: 'proposal', status: 'on-time', submittedDate: 'Sept 27, 2023', feedback: 'Good proposal, but objectives could be clearer.' },
            { milestoneId: 'literature', status: 'not-submitted', submittedDate: null, feedback: null },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        },
        {
          id: 6,
          name: 'Sophia Williams',
          email: 'sophia.williams@university.edu',
          major: 'ee',
          project: 'Renewable Energy Integration Systems',
          supervisor: 'Dr. Martin Rodriguez',
          examiner: 'Dr. Laura Kim',
          submissions: [
            { milestoneId: 'proposal', status: 'not-submitted', submittedDate: null, feedback: null },
            { milestoneId: 'literature', status: 'not-submitted', submittedDate: null, feedback: null },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        },
        {
          id: 7,
          name: 'Sarah Wong',
          email: 'sarah.wong@university.edu',
          major: 'cs',
          project: 'AI-Powered Educational Assessment',
          supervisor: 'Dr. James Chen',
          examiner: null,
          submissions: [
            { milestoneId: 'proposal', status: 'on-time', submittedDate: 'Sept 20, 2023', feedback: 'Outstanding proposal, clearly defined scope.' },
            { milestoneId: 'literature', status: 'on-time', submittedDate: 'Oct 15, 2023', feedback: 'Excellent literature review with comprehensive analysis.' },
            { milestoneId: 'methodology', status: 'on-time', submittedDate: 'Nov 10, 2023', feedback: 'Very well-designed methodology with clear approach.' }
          ]
        },
        {
          id: 8,
          name: 'David Park',
          email: 'david.park@university.edu',
          major: 'cs',
          project: 'Quantum Computing Algorithms',
          supervisor: 'Dr. Lisa Wang',
          examiner: 'Dr. Mark Johnson',
          submissions: [
            { milestoneId: 'proposal', status: 'on-time', submittedDate: 'Sept 29, 2023', feedback: 'Excellent proposal.' },
            { milestoneId: 'literature', status: 'on-time', submittedDate: 'Oct 28, 2023', feedback: 'Very thorough literature review.' },
            { milestoneId: 'methodology', status: 'not-submitted', submittedDate: null, feedback: null }
          ]
        }
      ]
      
      // Filter students based on selected major
      const filteredStudents = computed(() => {
        if (selectedMajor.value === 'all') {
          return students
        } else {
          return students.filter(student => student.major === selectedMajor.value)
        }
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
      
      return {
        activeTab,
        tabs,
        majorMilestones,
        students,
        filteredStudents,
        expandedStudentId,
        showExaminerModal,
        selectedMajor,
        availableMajors,
        academicYear,
        // Functions
        getMilestoneName,
        hasCompletedMilestone,
        isMilestoneCurrent,
        isPastMilestone,
        getCurrentMilestoneName,
        getNextMilestoneDate,
        getMilestoneStatusClass,
        getStudentMilestoneClass,
        getStudentProgressPercentage,
        hasMissedCurrentMilestone,
        hasMissedMultipleMilestones,
        expandStudentDetails,
        assignExaminer,
        milestoneCompletionPercentage,
        currentDate,
        getMilestoneStatus,
        getLastCompletedPosition,
        getCurrentSegmentWidth
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