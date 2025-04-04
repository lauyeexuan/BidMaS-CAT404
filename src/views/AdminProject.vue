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
          
          <!-- Major Filters and Scoring Method -->
          <div class="flex justify-between items-center gap-4 mb-4">
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
            <div class="flex items-center gap-2">
              <div class="relative inline-flex items-center">
                <div class="relative mr-2 group">
                  <div class="cursor-help">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                    <div class="relative">
                      <div class="space-y-1">
                        <p><span class="font-semibold">Best Match:</span> Uses the highest matching score between project and examiner's expertise</p>
                        <p><span class="font-semibold">Weighted Top-3:</span> Combines scores from top 3 matches (60%-30%-10% weights)</p>
                      </div>
                      <div class="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
                    </div>
                  </div>
                </div>
                <span class="mr-3 text-sm" :class="!useWeightedScoring ? 'font-semibold text-blue-600' : 'text-gray-400'">
                  Best Match
                </span>
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="useWeightedScoring" class="sr-only peer" :disabled="showExaminerModal">
                  <div class="relative w-14 h-7 bg-gray-100 border border-gray-200 rounded-full transition-colors duration-200" :class="{'bg-blue-50 border-blue-200': useWeightedScoring, 'bg-blue-50 border-blue-200': !useWeightedScoring}">
                    <div class="absolute top-1 left-1 w-5 h-5 bg-blue-500 rounded-full transition-transform duration-200" :class="useWeightedScoring ? 'translate-x-7' : 'translate-x-0'"></div>
                  </div>
                </label>
                <span class="ml-3 text-sm" :class="useWeightedScoring ? 'font-semibold text-blue-600' : 'text-gray-400'">
                  Weighted Top-3
                </span>
              </div>
            </div>
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
                      <option value="all">All</option>
                      <option value="assigned">Assigned</option>
                      <option value="unassigned">Unassigned</option>
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
                  <div v-if="project.examinerId" class="flex items-center gap-2 w-full relative">
                    <div class="relative w-28">
                      <span class="px-2.5 py-1 rounded-full text-xs font-medium shadow-sm bg-gray-100 text-gray-800 inline-block overflow-hidden text-ellipsis">
                        {{ project.examinerName || getUserName(project.examinerId) }}
                      </span>
                    </div>
                    <button 
                      class="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                      @click="resetExaminer(project)"
                    >
                      Reset
                    </button>
                  </div>
                  <div v-else-if="project.assignedTo" class="flex items-center gap-2 w-full relative">
                    <!-- Custom Searchable Dropdown -->
                    <div class="relative w-28" :class="`dropdown-container-${project.id}`">
                      <div 
                        class="bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded-md px-2 py-1 w-full flex justify-between cursor-pointer"
                        @click="toggleExaminerDropdown(project)"
                        :class="{'border-blue-500': openExaminerDropdown === project.id}"
                      >
                        <span>{{ getSelectedExaminerName(project) }}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      <!-- Dropdown Panel -->
                      <div 
                        v-if="openExaminerDropdown === project.id" 
                        class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-56 max-h-48 overflow-y-auto"
                      >
                        <!-- Search Input -->
                        <div class="p-1 border-b border-gray-200">
                          <input 
                            type="text" 
                            class="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Search examiner..."
                            v-model="examinerSearchQueries[project.id]"
                            @input="filterExaminers($event, project)"
                            @click.stop
                            ref="searchInput"
                          />
                        </div>
                        
                        <!-- Dropdown Items -->
                        <div class="py-1">
                          <div 
                            v-for="examiner in getFilteredExaminers(project.id)" 
                            :key="examiner.id"
                            @click="selectExaminer(examiner, project)"
                            class="px-2 py-1 text-xs cursor-pointer hover:bg-blue-50"
                          >
                            {{ examiner.name }}
                          </div>
                          <div v-if="loadingExaminers[project.id]" class="px-2 py-1 text-xs text-gray-500">
                            Loading...
                          </div>
                          <div v-else-if="getFilteredExaminers(project.id).length === 0" class="px-2 py-1 text-xs text-gray-500">
                            No matching examiners
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
                      :disabled="loadingExaminers[project.id]"
                      @click="findExaminers(project)"
                    >
                      Find
                    </button>
                  </div>
                  <div v-else class="text-gray-500 text-xs italic">
                    Not assigned to student
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

      <!-- Lecturers Section with Deferred Loading -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Lecturers</h2>
          <div v-if="loadingLecturers" class="flex items-center">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span class="text-sm text-gray-600">Loading lecturers...</span>
          </div>
        </div>
        
        <div v-if="!lecturersLoaded && !loadingLecturers" class="text-center py-4">
          <button 
            @click="loadLecturers" 
            class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Load Lecturers
          </button>
        </div>
        
        <div v-else-if="lecturers.length === 0 && !loadingLecturers" class="text-center py-4 text-gray-500">
          No lecturers found.
        </div>
        
        <div v-else-if="lecturers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="lecturer in lecturers" 
            :key="lecturer.id" 
            class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 relative"
          >
            <!-- Project Count Badge -->
            <div class="absolute top-3 right-3 text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ projects.filter(p => p.examinerId === lecturer.id).length }}
              </div>
              <div class="text-xs text-gray-500 font-medium">
                Examinations
              </div>
            </div>

            <h3 class="font-medium text-lg text-gray-800 mb-1 pr-16">{{ lecturer.name }}</h3>
            <div class="mb-2">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {{ lecturer.major ? lecturer.major.join(', ') : 'Unknown' }}
              </span>
            </div>
            <div v-if="lecturer.specifications && lecturer.specifications.length > 0" class="mt-2">
              <p class="text-xs text-gray-500 mb-1">Specializations:</p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(spec, index) in lecturer.specifications" 
                  :key="index"
                  class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ spec }}
                </span>
              </div>
            </div>
            <div v-else class="mt-2 text-xs text-gray-400 italic">
              No specializations listed
            </div>
          </div>
        </div>
      </div>

      <!-- Examiner Matching Modal -->
      <div v-if="showExaminerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">Recommended Examiners</h3>
            <button 
              @click="showExaminerModal = false"
              class="text-gray-500 hover:text-gray-700 focus:outline-none rounded-full p-1 hover:bg-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Project Information - Always visible -->
          <div class="mb-6 bg-gray-50 p-4 rounded-lg">
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500 mb-1">Title</p>
                  <p class="text-md font-medium">{{ currentProject?.Title || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 mb-1">Major</p>
                  <p class="text-md font-medium">{{ currentProject?.major || 'N/A' }}</p>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-2">Project Description</p>
                <div class="min-h-[100px] max-h-[200px] overflow-y-auto pr-2">
                  <p class="text-md whitespace-pre-wrap">{{ currentProject?.Description || 'No description available.' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Examiner Results Section -->
          <div class="space-y-4">
            <!-- Controls Section -->
            <div class="flex items-center justify-end mb-4">
              <!-- New Result button -->
              <button 
                @click="forceNewExaminerSearch" 
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                :disabled="examinerModalLoading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" :class="{ 'animate-spin': examinerModalLoading }">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Results
              </button>
            </div>

            <!-- Loading State for Recommendations Only -->
            <div v-if="examinerModalLoading" class="flex flex-col items-center justify-center py-8 space-y-3 bg-gray-50 rounded-lg">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p class="text-gray-600">Finding the best examiner matches...</p>
              <p class="text-sm text-gray-500">This may take a few seconds</p>
            </div>
            
            <div v-else>
              <!-- Examiner Results Content -->
              <div v-if="rankedExaminers.length === 0" class="text-center py-6 text-gray-500">
                No matching examiners found. Please try again.
              </div>
              
              <div v-for="(examiner, index) in rankedExaminers" :key="examiner.id" 
                class="border rounded-lg p-4 transition-all hover:shadow-md"
                :class="[index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200']">
                
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center">
                    <span v-if="index === 0" class="mr-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Top Match</span>
                    <h4 class="font-medium text-gray-900">{{ examiner.name }}</h4>
                  </div>
                  <div class="text-sm font-semibold text-blue-600">
                    {{ Math.round(examiner.finalScore * 100) }}% Match
                  </div>
                </div>
                
                <div class="mt-3">
                  <p class="text-xs text-gray-500 mb-1">Best matching specification:</p>
                  <div v-if="examiner.bestMatch" class="text-sm">
                    <span class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {{ examiner.bestMatch.spec }} ({{ Math.round(examiner.bestMatch.score * 100) }}%)
                    </span>
                  </div>
                </div>
                
                <div v-if="examiner.specScores && examiner.specScores.length > 1" class="mt-3">
                  <p class="text-xs text-gray-500 mb-1">Other Specifications:</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span 
                      v-for="spec in examiner.specScores
                        .filter(s => s.spec !== examiner.bestMatch?.spec)
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)" 
                      :key="spec.spec"
                      class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs"
                    >
                      {{ spec.spec }} ({{ Math.round(spec.score * 100) }}%)
                    </span>
                  </div>
                </div>
                
                <div class="mt-4">
                  <button 
                    @click="assignExaminer(examiner, currentProject)"
                    class="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Assign as Examiner
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Last updated info -->
          <div v-if="examinerResultsTimestamp[currentProject?.id]" class="mt-2 text-xs text-gray-500 text-right">
            Last updated: {{ new Date(examinerResultsTimestamp[currentProject?.id]).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { collection, getDocs, doc, getDoc, query, limit, where, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/stores/userStore'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { zeroShotClassification } from '@/services/huggingFaceService'

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

// Data for lecturers section
const lecturers = ref([])
const loadingLecturers = ref(false)
const lecturersLoaded = ref(false)

// Data for examiners
const loadingExaminers = ref({}) // Track loading state per project
const availableExaminers = ref({}) // Available examiners per project

// Modal state and examiner matching
const showExaminerModal = ref(false)
const examinerModalLoading = ref(false)
const currentProject = ref(null)
const rankedExaminers = ref([])
const useWeightedScoring = ref(true)
// Add new refs for caching examiner results
const examinerResultsCache = ref({}) // Cache for examiner results by project ID
const examinerResultsTimestamp = ref({}) // Timestamps for cache freshness

// Add these new refs for filtering
const examinerSearchQueries = ref({});  // Store search query for each project
const filteredExaminers = ref({});      // Store filtered results for each project

// Define color palette
const colorPalette = [
  { bg: 'bg-pink-100', text: 'text-pink-800', selected: 'bg-pink-400 text-white' },
  { bg: 'bg-lime-100', text: 'text-lime-800', selected: 'bg-lime-500 text-white' },
  { bg: 'bg-orange-100', text: 'text-orange-800', selected: 'bg-orange-400 text-white' },
  { bg: 'bg-purple-100', text: 'text-purple-800', selected: 'bg-purple-400 text-white' },
  { bg: 'bg-amber-100', text: 'text-amber-800', selected: 'bg-amber-400 text-white' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', selected: 'bg-emerald-400 text-white' }
]

// Map to store major-color associations
const majorColorMap = ref(new Map())

// Add the shared filtering function
const filterEligibleLecturers = (lecturersList, project) => {
  const projectMajor = project.major || '';
  const supervisorId = project.userId;

  // First try: Exact case-insensitive match
  let matchingExaminers = lecturersList.filter(lecturer => {
    // Skip the supervisor
    if (lecturer.id === supervisorId) return false;
    
    // Skip if no majors
    if (!Array.isArray(lecturer.major) || !projectMajor) return false;
    
    // Case-insensitive exact match with any of the lecturer's majors
    const projectMajorLower = String(projectMajor).toLowerCase();
    return lecturer.major.some(m => String(m).toLowerCase() === projectMajorLower);
  });
  
  // Second try: If no exact matches, try partial match
  if (matchingExaminers.length === 0 && projectMajor) {
    matchingExaminers = lecturersList.filter(lecturer => {
      // Skip the supervisor
      if (lecturer.id === supervisorId) return false;
      
      // Skip if no majors
      if (!Array.isArray(lecturer.major)) return false;
      
      // Check if any major contains project major or vice versa (case insensitive)
      const projectMajorLower = String(projectMajor).toLowerCase();
      return lecturer.major.some(m => {
        const lecturerMajorLower = String(m).toLowerCase();
        return lecturerMajorLower.includes(projectMajorLower) || 
               projectMajorLower.includes(lecturerMajorLower);
      });
    });
  }
  
  // If still no matches, include all lecturers except the supervisor as a fallback
  if (matchingExaminers.length === 0) {
    matchingExaminers = lecturersList.filter(lecturer => lecturer.id !== supervisorId);
  }

  return matchingExaminers;
};

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

// Extract the projects loading code to separate function to use in both initial load and refresh
const loadProjects = async () => {
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
    
    let majors = [];
    
    if (yearDoc.exists()) {
      majors = yearDoc.data().majors || []
      
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
              
              // Use Map to ensure uniqueness by project ID
              if (!projectsMap.has(projectId)) {
                // Explicitly include all examiner data
                projectsMap.set(projectId, {
                  id: projectId,
                  ...projectData,
                  major,
                  majorDocId: majorDocId,
                  // Ensure examiner data is explicitly included and preserved
                  examinerId: projectData.examinerId || null,
                  examinerName: projectData.examinerName || null,
                  examinerAssignedAt: projectData.examinerAssignedAt || null
                })
              }
              
              // Add user IDs to fetch if not already known
              if (projectData.userId && !userNames.value[projectData.userId]) {
                userIdsToFetch.add(projectData.userId)
              }
              
              if (projectData.assignedTo && !userNames.value[projectData.assignedTo]) {
                userIdsToFetch.add(projectData.assignedTo)
              }
              
              // Also add examiner to fetch if not already known
              if (projectData.examinerId && !userNames.value[projectData.examinerId]) {
                userIdsToFetch.add(projectData.examinerId)
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
    
    // Store majors for later use
    const savedMajors = [...majors];
    
    // Load remaining projects in the background after initial render
    // Create a slight delay to ensure the UI has time to render
    setTimeout(() => {
      if (projects.value.length > 0) {
        loadRemainingProjects(savedMajors, schoolId);
      }
    }, 300);
  } catch (error) {
    console.error('Error fetching projects:', error)
    loading.value = false
  }
}

// Fetch all projects - now simply calls the new loadProjects function
const fetchProjects = async () => {
  await loadProjects();
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
            
            // Add to complete projects map
            completeProjectsMap.set(projectId, {
              id: projectId,
              ...projectData,
              major,
              majorDocId: majorDocId,
              // Ensure examiner data is explicitly included
              examinerId: projectData.examinerId || null,
              examinerName: projectData.examinerName || null,
              examinerAssignedAt: projectData.examinerAssignedAt || null
            })
            
            // Add user IDs to fetch if not already known
            if (projectData.userId && !userNames.value[projectData.userId]) {
              newUserIdsToFetch.add(projectData.userId)
            }
            
            if (projectData.assignedTo && !userNames.value[projectData.assignedTo]) {
              newUserIdsToFetch.add(projectData.assignedTo)
            }
            
            if (projectData.examinerId && !userNames.value[projectData.examinerId]) {
              newUserIdsToFetch.add(projectData.examinerId)
            }
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

// Add watch for scoring method changes
watch(useWeightedScoring, () => {
  // If modal is open and we have a current project, refresh the results
  if (showExaminerModal.value && currentProject.value) {
    findExaminersWithScoring(currentProject.value, true)
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

// Function to load lecturers data
const loadLecturers = async () => {
  try {
    loadingLecturers.value = true
    const schoolId = userStore.currentUser.school
    
    // First check if we have cached lecturers in session storage
    try {
      const cachedLecturers = sessionStorage.getItem(`lecturers_${schoolId}`)
      const cachedTimestamp = sessionStorage.getItem(`lecturers_timestamp_${schoolId}`)
      
      // Use cache if it's less than 10 minutes old
      if (cachedLecturers && cachedTimestamp) {
        const isRecent = (Date.now() - parseInt(cachedTimestamp)) < 10 * 60 * 1000 // 10 minutes
        if (isRecent) {
          lecturers.value = JSON.parse(cachedLecturers)
          lecturersLoaded.value = true
          loadingLecturers.value = false
          return
        }
      }
    } catch (storageError) {
      console.error('Error reading lecturers from session storage:', storageError)
    }
    
    // If no cache or expired, fetch from Firestore
    const usersRef = collection(db, 'schools', schoolId, 'users')
    
    // Query for users with role 'lecturer'
    const q = query(usersRef, where('role', '==', 'lecturer'))
    const querySnapshot = await getDocs(q)
    
    // Process results
    const lecturersList = []
    querySnapshot.forEach(doc => {
      const userData = doc.data()
      lecturersList.push({
        id: doc.id,
        name: userData.name || userData.email || 'Unknown',
        major: userData.major || [],
        specifications: userData.specifications || []
      })
    })
    
    // Sort by name
    lecturersList.sort((a, b) => a.name.localeCompare(b.name))
    
    // Update state
    lecturers.value = lecturersList
    lecturersLoaded.value = true
    
    // Cache in session storage
    try {
      sessionStorage.setItem(`lecturers_${schoolId}`, JSON.stringify(lecturersList))
      sessionStorage.setItem(`lecturers_timestamp_${schoolId}`, Date.now().toString())
    } catch (storageError) {
      console.error('Error caching lecturers to session storage:', storageError)
    }
  } catch (error) {
    console.error('Error loading lecturers:', error)
  } finally {
    loadingLecturers.value = false
  }
}

// Modified lifecycle hook to separate the lecturer loading
onMounted(async () => {
  // Try to load usernames from session storage on mount
  loadUserNamesFromSession()
  
  // Load core data first
  await fetchAcademicYears()
  if (selectedAcademicYear.value) {
    await fetchProjects()
    
    // After projects are loaded and UI is updated, load lecturers in the background
    nextTick(() => {
      // Add a small delay to ensure project data is fully processed first
      setTimeout(() => {
        // Auto-load lecturers if we have a fast connection or cached data
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')
        
        // Auto-load only on fast connections
        if (!isSlowConnection) {
          loadLecturers()
        }
      }, 500)
    })
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
      
      // Also clear lecturer data cache
      sessionStorage.removeItem(`lecturers_${schoolId}`)
      sessionStorage.removeItem(`lecturers_timestamp_${schoolId}`)
      
      // Reset lecturer state to trigger reload
      lecturers.value = []
      lecturersLoaded.value = false

      // Clear examiner data as well since lecturer data is refreshed
      availableExaminers.value = {}
      loadingExaminers.value = {}
    } catch (storageError) {
      console.error('Error clearing session storage:', storageError)
    }
    
    // Re-fetch projects using our new loadProjects function
    await loadProjects()
    
    // If lecturers were previously loaded, reload them in the background
    if (document.visibilityState !== 'hidden') {
      setTimeout(() => {
        loadLecturers()
      }, 300)
    }
    
    // Show notification or feedback (optional)
    console.log('Projects and lecturer data refreshed from Firestore')
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

// Update loadExaminersForProject to use the shared function
const loadExaminersForProject = async (project) => {
  // Skip if already loaded or loading
  if (availableExaminers.value[project.id] || loadingExaminers.value[project.id]) {
    return;
  }
  
  try {
    loadingExaminers.value = { ...loadingExaminers.value, [project.id]: true };
    
    if (lecturers.value.length === 0) {
      console.log('No lecturers loaded yet, loading them now');
      await loadLecturers();
    }
    
    console.log(`Total lecturers available: ${lecturers.value.length}`);
    
    // Use the shared filtering function
    const matchingExaminers = filterEligibleLecturers(lecturers.value, project);
    
    console.log(`Found ${matchingExaminers.length} matching examiners for project ${project.id}`);
    
    // Store the result without the header
    availableExaminers.value = { 
      ...availableExaminers.value, 
      [project.id]: matchingExaminers 
    };
  } catch (error) {
    console.error('Error loading examiners:', error);
  } finally {
    loadingExaminers.value = { ...loadingExaminers.value, [project.id]: false };
  }
};

// Update findExaminersWithScoring to use the shared function
const findExaminersWithScoring = async (project, forceNew = false) => {
  try {
    examinerModalLoading.value = true;
    
    // Clear results if forcing new search
    if (forceNew) {
      rankedExaminers.value = [];
    }
    
    // Check if we have project description
    const projectDescription = project.Description || '';
    
    if (!projectDescription && !project.Title) {
      console.warn("No project description or title available for classification");
      examinerModalLoading.value = false;
      return;
    }
    
    // Use title as fallback if description is empty
    const textToAnalyze = projectDescription || project.Title;
    
    console.log("\nProject Details:");
    console.log("---------------");
    console.log(`Project Name: ${project.Title}`);
    console.log(`Project Description: ${projectDescription}`);
    console.log(`Project Major: ${project.major}`);
    console.log("---------------\n");
    
    // Use the shared filtering function
    const eligibleLecturers = filterEligibleLecturers(lecturers.value, project);
    console.log(`Found ${eligibleLecturers.length} eligible lecturers based on major`);
    
    // Prepare labels from filtered lecturer specifications
    const lecturerLabels = eligibleLecturers.map(lecturer => {
      // Get individual specifications
      const specs = lecturer.specifications && lecturer.specifications.length 
        ? lecturer.specifications
        : ["general academic expertise"];
        
      return {
        id: lecturer.id,
        name: lecturer.name,
        specs: specs
      };
    });

    // Collect all unique specifications
    const allSpecs = [...new Set(lecturerLabels.flatMap(lecturer => lecturer.specs))];
    
    console.log("Making API call with all specifications:", allSpecs);
    
    // Make API call with all specifications using multi-label = true
    const result = await zeroShotClassification(
      textToAnalyze,
      allSpecs,
      true // Enable multi-label classification
    );
    
    console.log("API Response:", result);
    
    // Create a map of specification scores directly from the response
    const specScoresMap = {};
    if (result.labels && result.scores) {
      result.labels.forEach((label, index) => {
        specScoresMap[label] = result.scores[index];
      });
    }
    
    // Calculate scores for each lecturer using the score map
    const detailedResults = lecturerLabels.map(lecturer => {
      const specScores = lecturer.specs.map(spec => ({
        spec,
        score: specScoresMap[spec] || 0 // Default to 0 if not found
      }));
      
      // Find highest single score (Best Match approach)
      const highestScore = specScores.length > 0 
        ? Math.max(...specScores.map(item => item.score)) 
        : 0;
      
      // Calculate weighted score
      // Sort specifications by score (highest first)
      const sortedScores = [...specScores].sort((a, b) => b.score - a.score);
      
      // Apply weights: 60% to top score, 30% to second, 10% to third
      let weightedScore = 0;
      if (sortedScores.length > 0) {
        weightedScore += sortedScores[0].score * 0.6; // Top score gets 60% weight
        
        if (sortedScores.length > 1) {
          weightedScore += sortedScores[1].score * 0.3; // Second score gets 30% weight
          
          if (sortedScores.length > 2) {
            weightedScore += sortedScores[2].score * 0.1; // Third score gets 10% weight
          } else {
            weightedScore += sortedScores[0].score * 0.1; // If only 1 spec, it gets full weight
          }
        } else {
          weightedScore += sortedScores[0].score * 0.4; // If only 1 spec, it gets full weight
        }
      }
      
      // Find the specification with the highest score
      const bestMatch = sortedScores.length > 0 ? sortedScores[0] : null;
      
      return {
        ...lecturer,
        specScores,
        highestScore,
        weightedScore,
        bestMatch,
        // Use either weighted or highest score based on the toggle
        finalScore: useWeightedScoring.value ? weightedScore : highestScore
      };
    });
    
    // Sort by final score (either weighted or highest based on toggle)
    const results = detailedResults.sort((a, b) => b.finalScore - a.finalScore);
    
    // Update the ranked examiners
    rankedExaminers.value = results;
    
    // Cache the results in memory
    const projectId = project.id;
    examinerResultsCache.value[projectId] = results;
    examinerResultsTimestamp.value[projectId] = Date.now();
    
    // Also cache in session storage for persistence
    try {
      sessionStorage.setItem(`examiner_results_${projectId}`, JSON.stringify(results));
      sessionStorage.setItem(`examiner_results_timestamp_${projectId}`, Date.now().toString());
    } catch (storageError) {
      console.error('Error caching examiner results to session storage:', storageError);
    }
    
  } catch (error) {
    console.error("Error finding examiners:", error);
  } finally {
    examinerModalLoading.value = false;
  }
}

// Function to assign an examiner to a project
const assignExaminer = async (examiner, project) => {
  try {
    const schoolId = userStore.currentUser.school
    
    // Show loading state
    loadingExaminers.value = { ...loadingExaminers.value, [project.id]: true }
    
    console.log(`Assigning examiner ${examiner.name} to project ${project.Title}`)
    
    // Build the path to the project document
    const projectDocPath = `schools/${schoolId}/projects/${selectedAcademicYear.value}/${project.major}/${project.majorDocId}/projectsPerYear/${project.id}`
    const projectRef = doc(db, projectDocPath)
    
    // Update the project document with the examiner ID
    await updateDoc(projectRef, {
      examinerId: examiner.id,
      examinerName: examiner.name,
      examinerAssignedAt: serverTimestamp()
    })
    
    // Update the local project object with examiner data
    const updatedProject = {
      ...project,
      examinerId: examiner.id,
      examinerName: examiner.name,
      examinerAssignedAt: new Date().toISOString() // Use client-side timestamp since server timestamp isn't available immediately
    }
    
    // Update the projects array
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = updatedProject
      
      // Also update the project cache to ensure persistence
      if (projectCache.value[selectedAcademicYear.value]) {
        const cacheIndex = projectCache.value[selectedAcademicYear.value].findIndex(p => p.id === project.id)
        if (cacheIndex !== -1) {
          projectCache.value[selectedAcademicYear.value][cacheIndex] = updatedProject
        }
      }
      
      // Update session storage if this is the latest year
      if (selectedAcademicYear.value === availableAcademicYears.value[0]?.yearId) {
        try {
          const projectsKey = `${SESSION_STORAGE_KEY_PROJECTS}${schoolId}_${selectedAcademicYear.value}`
          const storedProjectsStr = sessionStorage.getItem(projectsKey)
          if (storedProjectsStr) {
            const storedProjects = JSON.parse(storedProjectsStr)
            const storageIndex = storedProjects.findIndex(p => p.id === project.id)
            if (storageIndex !== -1) {
              storedProjects[storageIndex] = updatedProject
              sessionStorage.setItem(projectsKey, JSON.stringify(storedProjects))
            }
          }
        } catch (storageError) {
          console.error('Error updating projects in session storage:', storageError)
        }
      }
    }
    
    console.log(`Successfully assigned examiner ${examiner.name} to project ${project.Title}`)
    
    // Close the modal after successful assignment
    showExaminerModal.value = false
  } catch (error) {
    console.error('Error assigning examiner:', error)
  } finally {
    // Clear loading state
    loadingExaminers.value = { ...loadingExaminers.value, [project.id]: false }
  }
}

// Add examiner selection handler
const onExaminerSelected = async (event, project) => {
  const examinerId = event.target.value
  
  // Skip if no selection or header item
  if (!examinerId || examinerId.includes('header')) {
    return
  }
  
  // Find the selected examiner from the available examiners
  const examiner = availableExaminers.value[project.id]?.find(e => e.id === examinerId)
  
  if (!examiner) {
    console.warn('Selected examiner not found in available examiners')
    return
  }
  
  // Assign the selected examiner
  await assignExaminer(examiner, project)
}

// Add the resetExaminer function in the script section, after the assignExaminer function
const resetExaminer = async (project) => {
  try {
    const schoolId = userStore.currentUser.school
    
    // Show loading state
    loadingExaminers.value = { ...loadingExaminers.value, [project.id]: true }
    
    console.log(`Resetting examiner for project ${project.Title}`)
    
    // Build the path to the project document
    const projectDocPath = `schools/${schoolId}/projects/${selectedAcademicYear.value}/${project.major}/${project.majorDocId}/projectsPerYear/${project.id}`
    const projectRef = doc(db, projectDocPath)
    
    // Update the project document to remove examiner data
    await updateDoc(projectRef, {
      examinerId: null,
      examinerName: null,
      examinerAssignedAt: null
    })
    
    // Create updated project object
    const updatedProject = { ...project }
    updatedProject.examinerId = null
    updatedProject.examinerName = null
    updatedProject.examinerAssignedAt = null
    
    // Update the projects array
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = updatedProject
      
      // Also update the project cache to ensure persistence
      if (projectCache.value[selectedAcademicYear.value]) {
        const cacheIndex = projectCache.value[selectedAcademicYear.value].findIndex(p => p.id === project.id)
        if (cacheIndex !== -1) {
          projectCache.value[selectedAcademicYear.value][cacheIndex] = updatedProject
        }
      }
      
      // Update session storage if this is the latest year
      if (selectedAcademicYear.value === availableAcademicYears.value[0]?.yearId) {
        try {
          const projectsKey = `${SESSION_STORAGE_KEY_PROJECTS}${schoolId}_${selectedAcademicYear.value}`
          const storedProjectsStr = sessionStorage.getItem(projectsKey)
          if (storedProjectsStr) {
            const storedProjects = JSON.parse(storedProjectsStr)
            const storageIndex = storedProjects.findIndex(p => p.id === project.id)
            if (storageIndex !== -1) {
              storedProjects[storageIndex] = updatedProject
              sessionStorage.setItem(projectsKey, JSON.stringify(storedProjects))
            }
          }
        } catch (storageError) {
          console.error('Error updating projects in session storage:', storageError)
        }
      }
    }
    
    console.log(`Successfully reset examiner for project ${project.Title}`)
  } catch (error) {
    console.error('Error resetting examiner:', error)
  } finally {
    // Clear loading state
    loadingExaminers.value = { ...loadingExaminers.value, [project.id]: false }
  }
}

// Find examiners button handler - opens the modal
const findExaminers = async (project) => {
  try {
    // Store the current project
    currentProject.value = project;
    
    // Show the modal
    showExaminerModal.value = true;
    examinerModalLoading.value = true;
    
    // Load lecturers if not already loaded
    if (lecturers.value.length === 0) {
      await loadLecturers();
    }
    
    // Check if we have cached results for this project
    const projectId = project.id;
    const cachedResults = examinerResultsCache.value[projectId];
    const cachedTimestamp = examinerResultsTimestamp.value[projectId];
    const isRecentCache = cachedTimestamp && (Date.now() - cachedTimestamp < 30 * 60 * 1000); // 30 minute cache
    
    // Also check session storage for persistence across refreshes
    let sessionCachedResults = null;
    let sessionCachedTimestamp = null;
    try {
      const sessionResults = sessionStorage.getItem(`examiner_results_${projectId}`);
      const sessionTimestamp = sessionStorage.getItem(`examiner_results_timestamp_${projectId}`);
      
      if (sessionResults && sessionTimestamp) {
        sessionCachedResults = JSON.parse(sessionResults);
        sessionCachedTimestamp = parseInt(sessionTimestamp);
          }
        } catch (storageError) {
      console.error('Error reading cached examiner results from session storage:', storageError);
    }
    
    const useSessionCache = sessionCachedTimestamp && 
      (Date.now() - sessionCachedTimestamp < 30 * 60 * 1000) && // 30 minute cache
      sessionCachedResults;
    
    // Use memory cache first, then session storage cache if available and recent
    if (cachedResults && isRecentCache) {
      console.log(`Using memory-cached examiner results for project ${projectId}`);
      rankedExaminers.value = cachedResults;
      examinerModalLoading.value = false;
    } else if (useSessionCache) {
      console.log(`Using session-cached examiner results for project ${projectId}`);
      rankedExaminers.value = sessionCachedResults;
      // Also update memory cache
      examinerResultsCache.value[projectId] = sessionCachedResults;
      examinerResultsTimestamp.value[projectId] = sessionCachedTimestamp;
      examinerModalLoading.value = false;
    } else {
      // No cache or expired, find examiners with API call
      await findExaminersWithScoring(project);
    }
  } catch (error) {
    console.error('Error finding examiners:', error);
    examinerModalLoading.value = false;
  }
}

// Function to force a new search ignoring cache
const forceNewExaminerSearch = async () => {
  if (!currentProject.value) return;
  
  try {
    examinerModalLoading.value = true;
    
    // Clear the cache for this project
    const projectId = currentProject.value.id;
    
    // Remove from memory cache
    if (examinerResultsCache.value[projectId]) {
      delete examinerResultsCache.value[projectId];
    }
    if (examinerResultsTimestamp.value[projectId]) {
      delete examinerResultsTimestamp.value[projectId];
    }
    
    // Remove from session storage
    try {
      sessionStorage.removeItem(`examiner_results_${projectId}`);
      sessionStorage.removeItem(`examiner_results_timestamp_${projectId}`);
    } catch (storageError) {
      console.error('Error removing cached examiner results from session storage:', storageError);
    }
    
    // Force new search
    await findExaminersWithScoring(currentProject.value, true);
  } catch (error) {
    console.error('Error finding new examiner matches:', error);
    examinerModalLoading.value = false;
  }
}

// Add this new function to filter examiners
const filterExaminers = (event, project) => {
  const query = event.target.value.toLowerCase();
  examinerSearchQueries.value[project.id] = query;
  
  // Update filtered results
  if (availableExaminers.value[project.id]) {
    const filtered = availableExaminers.value[project.id].filter(examiner => 
      examiner.name.toLowerCase().includes(query)
    );
    filteredExaminers.value[project.id] = filtered;
  }
};

// Add this new function to get filtered examiners
const getFilteredExaminers = (projectId) => {
  if (!availableExaminers.value[projectId]) return [];
  
  const query = examinerSearchQueries.value[projectId];
  if (!query) return availableExaminers.value[projectId];
  
  return filteredExaminers.value[projectId] || availableExaminers.value[projectId];
};

// Add this for dropdown control
const openExaminerDropdown = ref(null)

// Toggle dropdown visibility
const toggleExaminerDropdown = (project) => {
  // Load examiners if not loaded
  if (!availableExaminers.value[project.id]) {
    loadExaminersForProject(project)
  }
  
  // Toggle dropdown
  if (openExaminerDropdown.value === project.id) {
    openExaminerDropdown.value = null
  } else {
    openExaminerDropdown.value = project.id
    // Reset search query when opening
    if (!examinerSearchQueries.value[project.id]) {
      examinerSearchQueries.value[project.id] = ''
    }
    // Focus the search input (using nextTick to ensure the DOM has updated)
    nextTick(() => {
      const searchInput = document.querySelector(`input[placeholder="Search examiner..."]`)
      if (searchInput) searchInput.focus()
    })
  }
}

// Add this click outside listener to close dropdown when clicking elsewhere
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (openExaminerDropdown.value !== null) {
      // Check if click is inside any dropdown container
      const openDropdownContainer = document.querySelector(`.dropdown-container-${openExaminerDropdown.value}`)
      if (openDropdownContainer && !openDropdownContainer.contains(event.target)) {
        openExaminerDropdown.value = null
      }
    }
  })
})

// Function to get the displayed name for the selected examiner dropdown
const getSelectedExaminerName = (project) => {
  // If dropdown is open, show the search query
  if (openExaminerDropdown.value === project.id) {
    return examinerSearchQueries.value[project.id] || '-'
  }
  
  // If an examiner is selected in the dropdown but not saved yet
  if (selectedExaminers.value[project.id]) {
    return selectedExaminers.value[project.id].name
  }
  
  // If project already has an assigned examiner (this shouldn't happen in this section, 
  // but keeping for completeness)
  if (project.examinerId) {
    return project.examinerName || getUserName(project.examinerId) || '-'
  }
  
  // Default state
  return '-'
}

// Add ref for temporary selected examiners (before saving)
const selectedExaminers = ref({})

// Update selectExaminer function to store selection
const selectExaminer = (examiner, project) => {
  // Store the selected examiner
  selectedExaminers.value[project.id] = examiner
  // Close dropdown
  openExaminerDropdown.value = null
  // Assign the examiner to the project
  assignExaminer(examiner, project)
}

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
</script> 