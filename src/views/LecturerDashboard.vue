<template>
  <!-- Lecturer Dashboard Content -->
  <div class="relative">
    <!-- Dashboard Cards -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <!-- Projects Overview Card -->
      <div class="col-span-6 bg-white p-4 shadow rounded relative">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-medium text-gray-500">Projects Overview</h2>
          <router-link 
            to="/projects" 
            class="text-blue-600 hover:text-blue-800 text-xs"
          >
            View All Projects
          </router-link>
        </div>

        <div v-if="projectsLoading" class="py-4">
          <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
        </div>

        <div v-else-if="projectsError" class="py-4">
          <p class="text-red-500">{{ projectsError }}</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Projects Statistics -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-3 rounded-lg">
              <p class="text-sm text-gray-600">Total Projects</p>
              <p class="text-2xl font-semibold text-blue-700">{{ totalProjects }}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <p class="text-sm text-gray-600">Assigned Students</p>
              <p class="text-2xl font-semibold text-green-700">{{ totalAssignedStudents }}</p>
            </div>
          </div>

          <!-- Recent Projects List -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">Recent Projects</h3>
            <div class="space-y-2">
              <div 
                v-for="project in recentProjects" 
                :key="project.id"
                class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                @click="openProjectDetails(project)"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-800">{{ project.Title }}</h4>
                    <p class="text-sm text-gray-500">{{ project.major }}</p>
                  </div>
                  <span 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusClass(project.status)"
                  >
                    {{ project.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Submissions Card -->
      <div class="col-span-6 bg-white p-4 shadow rounded relative">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-medium text-gray-500">Recent Submissions</h2>
        </div>

        <div v-if="submissionsLoading" class="py-4">
          <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
        </div>

        <div v-else-if="submissionsError" class="py-4">
          <p class="text-red-500">{{ submissionsError }}</p>
        </div>

        <div v-else-if="recentSubmissions.length > 0" class="space-y-3">
          <div 
            v-for="submission in recentSubmissions" 
            :key="submission.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-800">{{ submission.studentName }}</p>
                <p class="text-sm text-gray-500">{{ submission.projectTitle }}</p>
                <div class="flex items-center mt-1 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(submission.submittedAt) }}
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <a 
                  :href="submission.downloadUrl" 
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-4 text-center text-gray-500">
          No recent submissions
        </div>
      </div>
    </div>

    <!-- Timeline and Calendar Section -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <!-- Milestones Timeline -->
      <div class="col-span-8 bg-white p-4 shadow rounded">
        <h2 class="text-lg font-semibold mb-4">Project Milestones</h2>
        
        <div v-if="milestonesLoading" class="py-4">
          <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
        </div>

        <div v-else-if="milestonesError" class="py-4">
          <p class="text-red-500">{{ milestonesError }}</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="milestone in milestones" 
            :key="milestone.id"
            class="relative pl-8 pb-8 last:pb-0"
          >
            <!-- Timeline line -->
            <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-blue-200"></div>
            
            <!-- Timeline dot -->
            <div 
              class="absolute left-2 top-0 w-2 h-2 rounded-full"
              :class="isMilestonePast(milestone) ? 'bg-gray-400' : 'bg-blue-500'"
            ></div>
            
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-800">{{ milestone.description }}</h3>
                <p class="text-sm text-gray-500">{{ formatDate(milestone.deadline) }}</p>
              </div>
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="isMilestonePast(milestone) ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'"
              >
                {{ isMilestonePast(milestone) ? 'Past' : 'Upcoming' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Card -->
      <div class="col-span-4 bg-white p-4 shadow rounded">
        <h2 class="text-lg font-semibold mb-4">Project Statistics</h2>
        
        <div class="space-y-4">
          <!-- Submission Rate -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <p class="text-sm text-gray-600">Overall Submission Rate</p>
              <p class="text-sm font-medium text-gray-800">{{ submissionRate }}%</p>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full" 
                :style="`width: ${submissionRate}%`"
              ></div>
            </div>
          </div>

          <!-- Project Distribution -->
          <div>
            <p class="text-sm text-gray-600 mb-2">Projects by Major</p>
            <div class="space-y-2">
              <div 
                v-for="(count, major) in projectsByMajor" 
                :key="major"
                class="flex justify-between items-center"
              >
                <span class="text-sm text-gray-700">{{ major }}</span>
                <span class="text-sm font-medium text-gray-800">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { db } from '@/firebase'
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { getMilestones } from '@/utils/milestones'
import { createProjectDetailsWindow } from '@/utils/windowUtils'

export default {
  setup() {
    const userStore = useUserStore()
    
    // Projects data
    const totalProjects = ref(0)
    const totalAssignedStudents = ref(0)
    const recentProjects = ref([])
    const projectsLoading = ref(true)
    const projectsError = ref(null)
    
    // Submissions data
    const recentSubmissions = ref([])
    const submissionsLoading = ref(true)
    const submissionsError = ref(null)
    
    // Milestones data
    const milestones = ref([])
    const milestonesLoading = ref(true)
    const milestonesError = ref(null)
    
    // Statistics
    const submissionRate = ref(0)
    const projectsByMajor = ref({})

    // Function to fetch lecturer's projects
    const fetchProjects = async () => {
      projectsLoading.value = true
      projectsError.value = null

      try {
        const { school, uid } = userStore.currentUser
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }

        // Query all projects created by this lecturer
        const projectsQuery = query(
          collection(db, 'schools', school, 'projects', academicYearData.yearId, 'allProjects'),
          where('userId', '==', uid),
          orderBy('createdAt', 'desc')
        )

        const projectsSnapshot = await getDocs(projectsQuery)
        
        // Process projects data
        const projects = []
        let assignedCount = 0
        const majorCounts = {}

        projectsSnapshot.forEach(doc => {
          const projectData = doc.data()
          projects.push({
            id: doc.id,
            ...projectData
          })

          // Count assigned students
          if (projectData.assignedStudent) assignedCount++
          
          // Count projects by major
          if (projectData.major) {
            majorCounts[projectData.major] = (majorCounts[projectData.major] || 0) + 1
          }
        })

        // Update refs
        totalProjects.value = projects.length
        totalAssignedStudents.value = assignedCount
        recentProjects.value = projects.slice(0, 5) // Show only 5 most recent
        projectsByMajor.value = majorCounts

      } catch (error) {
        projectsError.value = `Failed to load projects: ${error.message}`
      } finally {
        projectsLoading.value = false
      }
    }

    // Function to fetch recent submissions
    const fetchSubmissions = async () => {
      submissionsLoading.value = true
      submissionsError.value = null

      try {
        const { school, uid } = userStore.currentUser
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }

        // Get all projects first
        const projectsQuery = query(
          collection(db, 'schools', school, 'projects', academicYearData.yearId, 'allProjects'),
          where('userId', '==', uid)
        )

        const projectsSnapshot = await getDocs(projectsQuery)
        const projectIds = projectsSnapshot.docs.map(doc => doc.id)

        // For each project, get recent submissions
        const submissions = []
        let totalExpectedSubmissions = 0
        let totalActualSubmissions = 0

        for (const projectId of projectIds) {
          const submissionsRef = collection(db, 'schools', school, 'projects', academicYearData.yearId, 'submissions')
          const submissionsQuery = query(
            submissionsRef,
            where('projectId', '==', projectId),
            orderBy('submittedAt', 'desc'),
            limit(5)
          )

          const submissionsSnapshot = await getDocs(submissionsQuery)
          
          submissionsSnapshot.forEach(doc => {
            submissions.push({
              id: doc.id,
              ...doc.data()
            })
          })

          // Calculate submission rates
          if (projectsSnapshot.docs.find(p => p.id === projectId)?.data()?.assignedStudent) {
            totalExpectedSubmissions++
            if (submissionsSnapshot.size > 0) totalActualSubmissions++
          }
        }

        // Update refs
        recentSubmissions.value = submissions
          .sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate())
          .slice(0, 5)

        // Calculate submission rate
        submissionRate.value = totalExpectedSubmissions > 0
          ? Math.round((totalActualSubmissions / totalExpectedSubmissions) * 100)
          : 0

      } catch (error) {
        submissionsError.value = `Failed to load submissions: ${error.message}`
      } finally {
        submissionsLoading.value = false
      }
    }

    // Function to fetch milestones
    const fetchMilestones = async () => {
      milestonesLoading.value = true
      milestonesError.value = null

      try {
        const { school } = userStore.currentUser
        const academicYearData = await getLatestAcademicYear(school)
        
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }

        // Get milestones for all majors the lecturer has projects in
        const uniqueMajors = Object.keys(projectsByMajor.value)
        const allMilestones = []

        for (const major of uniqueMajors) {
          const majorMilestones = await getMilestones(school, academicYearData.yearId, major)
          allMilestones.push(...majorMilestones)
        }

        // Sort milestones by deadline
        milestones.value = allMilestones.sort((a, b) => {
          const dateA = a.deadline instanceof Date ? a.deadline : a.deadline.toDate()
          const dateB = b.deadline instanceof Date ? b.deadline : b.deadline.toDate()
          return dateA - dateB
        })

      } catch (error) {
        milestonesError.value = `Failed to load milestones: ${error.message}`
      } finally {
        milestonesLoading.value = false
      }
    }

    // Helper function to format dates
    const formatDate = (date) => {
      if (!date) return ''
      
      try {
        const dateObj = date instanceof Date ? date : date.toDate()
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (err) {
        return 'Invalid date'
      }
    }

    // Helper function to check if milestone is past
    const isMilestonePast = (milestone) => {
      if (!milestone || !milestone.deadline) return false
      
      const deadlineDate = milestone.deadline instanceof Date ? 
        milestone.deadline : 
        milestone.deadline.toDate()
      
      return new Date() > deadlineDate
    }

    // Helper function to get status class
    const getStatusClass = (status) => {
      switch (status?.toLowerCase()) {
        case 'assigned':
          return 'bg-green-100 text-green-800'
        case 'available':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    // Function to open project details
    const openProjectDetails = (project) => {
      if (!project) return
      
      try {
        // Get project headers from the majorDocId document
        const headers = {}
        const colorClasses = { bg: 'bg-blue-100', text: 'text-blue-800' }
        
        createProjectDetailsWindow({
          project,
          creatorName: userStore.currentUser.name,
          headers,
          majorColorClass: colorClasses
        })
      } catch (error) {
        console.error('Error opening project details:', error)
      }
    }

    // Initialize dashboard data
    onMounted(async () => {
      if (userStore.initialized) {
        await fetchProjects()
        await fetchSubmissions()
        await fetchMilestones()
      } else {
        await userStore.initializeAuth()
        await fetchProjects()
        await fetchSubmissions()
        await fetchMilestones()
      }
    })

    return {
      // Projects
      totalProjects,
      totalAssignedStudents,
      recentProjects,
      projectsLoading,
      projectsError,
      
      // Submissions
      recentSubmissions,
      submissionsLoading,
      submissionsError,
      
      // Milestones
      milestones,
      milestonesLoading,
      milestonesError,
      
      // Statistics
      submissionRate,
      projectsByMajor,
      
      // Helper functions
      formatDate,
      isMilestonePast,
      getStatusClass,
      openProjectDetails
    }
  }
}
</script>

<style scoped>
/* Add any specific styles here */
.milestone-list-enter-active,
.milestone-list-leave-active {
  transition: all 0.3s ease;
}

.milestone-list-enter-from,
.milestone-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 