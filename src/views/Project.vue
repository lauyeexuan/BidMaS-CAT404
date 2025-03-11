<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-6 py-8">
      <!-- Header with Academic Year -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Projects</h1>
        <div class="flex items-center gap-4">
          
          <select 
            v-model="selectedAcademicYear"
            class="text-lg bg-blue-100 text-blue-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
            :title="'Current: ' + latestAcademicYear"
          >
          
            <option 
              v-for="year in availableAcademicYears" 
              :key="year.yearId" 
              :value="year.yearId"
            >
             {{ year.academicYear }}
            </option>
          </select>
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
              @click="activeTab = 'bids'"
              class="px-6 py-4 text-sm font-medium border-b-2 focus:outline-none"
              :class="[
                activeTab === 'bids' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Bids
            </button>
            <button 
              @click="activeTab = 'allProjects'"
              class="px-6 py-4 text-sm font-medium border-b-2 focus:outline-none"
              :class="[
                activeTab === 'allProjects' 
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              All Projects
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- My Projects Tab -->
          <div v-if="activeTab === 'myProjects'">
            <div class="flex justify-between items-center mb-6">
              <div class="space-y-2">
                <div class="flex items-center gap-4">
                  <h2 class="text-2xl font-semibold text-gray-900">My Projects</h2>
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
              <div class="flex gap-2">
                <button 
                  @click="showNewProjectForm = true"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Project
                </button>
                <button 
                  @click="showImportModal = true"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                  Import
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="myProjectsLoading" class="text-center py-8">
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
                      Actions
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
                      <div class="flex items-center gap-2">
                        <button 
                          @click="editProject(project)"
                          class="text-blue-600 hover:text-blue-800"
                          title="Edit project"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          v-if="project.hasBids"
                          class="text-gray-400 cursor-not-allowed"
                          title="Cannot delete: Project has active bids"
                          disabled
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          v-else
                          @click="confirmDeleteProject(project)"
                          class="text-red-600 hover:text-red-800"
                          title="Delete project"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
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

          <!-- Bids Tab -->
          <div v-else-if="activeTab === 'bids'">
            <div class="flex justify-between items-center mb-6">
              <div class="space-y-2">
                <div class="flex items-center gap-4">
                  <h2 class="text-2xl font-semibold text-gray-900">Project Bids</h2>
                  <span class="text-sm text-gray-500">(Total: {{ projectBids.length }})</span>
                </div>
                
                <!-- Add Milestone Display -->
                <MilestoneDisplay
                  :milestone="projectBiddingMilestone"
                  :show-lecturer-info="true"
                  :show-countdown="true"
                />
                
                <!-- Add Status Filter -->
                <div class="flex items-center gap-4 mt-4">
                  <span class="text-sm text-gray-600">Status Filter:</span>
                  <div class="flex gap-2">
                    <button
                      @click="bidStatusFilter = 'all'"
                      class="px-3 py-1 text-sm rounded-full"
                      :class="[
                        bidStatusFilter === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      All Bids
                    </button>
                    <button
                      @click="bidStatusFilter = 'active'"
                      class="px-3 py-1 text-sm rounded-full"
                      :class="[
                        bidStatusFilter === 'active'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      Active Only
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Loading State -->
            <div v-if="bidsLoading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p class="text-gray-600">Loading project bids...</p>
            </div>

            <!-- Projects with Bids Table -->
            <div v-else-if="groupedBids.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Title
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Major
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Bids
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <template v-for="(project, index) in paginatedGroupedBids" :key="project.projectId">
                    <!-- Project Row -->
                    <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleProjectBids(project.projectId)">
                      <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {{ (bidCurrentPage - 1) * itemsPerPage + index + 1 }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div class="flex items-center">
                          <svg 
                            class="h-5 w-5 mr-2 transform transition-transform"
                            :class="expandedProjects.has(project.projectId) ? 'rotate-90' : ''"
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                          </svg>
                          {{ project.projectTitle }}
                        </div>
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
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ project.bids.length }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <span 
                            class="px-2 py-1 rounded-full text-xs font-medium"
                            :class="{
                              'bg-yellow-100 text-yellow-800': project.hasPendingBids,
                              //'bg-green-100 text-green-800': project.allBidsProcessed && !project.hasPendingBids,
                            }"
                          >
                            {{ project.hasPendingBids ? 'Pending Review' : '✅' }}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <!-- Expanded Bids -->
                    <tr v-if="expandedProjects.has(project.projectId)" class="bg-gray-50">
                      <td colspan="5" class="px-6">
                        <div 
                          class="overflow-hidden transition-all duration-300 ease-in-out transform"
                          :class="expandedProjects.has(project.projectId) ? 'max-h-[1000px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'"
                        >
                          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                            <!-- Header with summary -->
                            <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                  <span class="text-sm font-medium text-gray-600">
                                    Bids Summary
                                  </span>
                                  <div class="flex items-center gap-2">
                                    <span class="px-2 py-1 bg-stone-100 text-zinc-800 rounded-full text-xs">
                                      Total: {{ project.bids.length }}
                                    </span>
                                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                      Pending: {{ project.bids.filter(b => b.status === 'pending').length }}
                                    </span>
                                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      Accepted: {{ project.bids.filter(b => b.status === 'accepted').length }}
                                    </span>
                                    <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      Rejected: {{ project.bids.filter(b => b.status === 'rejected').length }}
                                    </span>
                                  </div>
                                </div>
                                <button 
                                  @click="toggleProjectBids(project.projectId)"
                                  class="text-gray-500 hover:text-gray-700"
                                  title="Close"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <!-- Bids Table -->
                            <div class="overflow-x-auto">
                              <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                  <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Student
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Priority
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                  <tr 
                                    v-for="bid in project.bids" 
                                    :key="bid.id"
                                    class="hover:bg-gray-50 transition-colors duration-150"
                                  >
                                    <td class="px-6 py-4 whitespace-nowrap">
                                      <div class="flex items-center">
                                        <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                          <span class="text-sm font-medium text-blue-800">
                                            {{ getUserName(bid.studentId).charAt(0).toUpperCase() }}
                                          </span>
                                        </div>
                                        <div class="ml-3">
                                          <div class="text-sm font-medium text-gray-900">
                                            {{ getUserName(bid.studentId) }}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {{ bid.priority }}
                                      </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                      <span 
                                        class="px-2 py-1 rounded-full text-xs font-medium"
                                        :class="{
                                          'bg-yellow-100 text-yellow-800': bid.status === 'pending',
                                          'bg-green-100 text-green-800': bid.status === 'accepted',
                                          'bg-red-100 text-red-800': bid.status === 'rejected',
                                          'bg-gray-100 text-gray-600': bid.status === 'invalidated'
                                        }"
                                      >
                                        {{ bid.status.charAt(0).toUpperCase() + bid.status.slice(1) }}
                                      </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                      <div class="flex items-center gap-2">
                                        <button 
                                          v-if="bid.status === 'pending'"
                                          @click.stop="updateBidStatus(bid, 'accepted')"
                                          class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                          </svg>
                                          Accept
                                        </button>
                                        <button 
                                          v-if="bid.status === 'pending'"
                                          @click.stop="updateBidStatus(bid, 'rejected')"
                                          class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                          </svg>
                                          Reject
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <!-- Pagination -->
              <div class="flex items-center justify-between mt-4 px-4">
                <div class="flex items-center gap-2">
                  <button 
                    @click="bidCurrentPage--"
                    :disabled="bidCurrentPage === 1"
                    class="px-3 py-1 rounded border"
                    :class="bidCurrentPage === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
                  >
                    Previous
                  </button>
                  <span class="text-sm text-gray-600">
                    Page {{ bidCurrentPage }} of {{ bidTotalPages }}
                  </span>
                  <button 
                    @click="bidCurrentPage++"
                    :disabled="bidCurrentPage === bidTotalPages"
                    class="px-3 py-1 rounded border"
                    :class="bidCurrentPage === bidTotalPages ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <!-- No Bids Message -->
            <div v-else class="text-center py-8 text-gray-500">
              No bids found for your projects.
            </div>
          </div>

          <!-- All Projects Tab -->
          <div v-else>
            <div class="flex justify-between items-center mb-6">
              <div class="space-y-2">
                <div class="flex items-center gap-4">
                  <h2 class="text-2xl font-semibold text-gray-900">All Projects</h2>
                  <span class="text-sm text-gray-500">(Total: {{ filteredAllProjects.length }})</span>
                </div>
                
                <!-- Major filter tags -->
                <div v-if="uniqueAllProjectMajors.length > 0" class="flex flex-wrap gap-2">
                  <button
                    v-for="major in uniqueAllProjectMajors"
                    :key="major"
                    @click="toggleAllMajorFilter(major)"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                    :class="[
                      selectedAllMajorFilters.has(major) 
                        ? getMajorColorClasses(major).selected 
                        : [getMajorColorClasses(major).bg, getMajorColorClasses(major).text, 'hover:bg-opacity-75'],
                    ]"
                  >
                    <span v-if="selectedAllMajorFilters.has(major)" class="w-2 h-2 rounded-full bg-white"></span>
                    {{ major }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="allProjectsLoading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p class="text-gray-600">Loading all projects...</p>
            </div>

            <!-- Projects Table -->
            <div v-else-if="allProjects.length > 0" class="overflow-x-auto">
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
                  <tr v-for="(project, index) in paginatedAllProjects" :key="index">
                    <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {{ (allProjectsCurrentPage.value - 1) * itemsPerPage + index + 1 }}
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
                    @click="allProjectsCurrentPage.value--"
                    :disabled="allProjectsCurrentPage.value === 1"
                    class="px-3 py-1 rounded border"
                    :class="allProjectsCurrentPage.value === 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
                  >
                    Previous
                  </button>
                  <span class="text-sm text-gray-600">
                    Page {{ allProjectsCurrentPage.value }} of {{ allProjectsTotalPages.value }}
                  </span>
                  <button 
                    @click="allProjectsCurrentPage.value++"
                    :disabled="allProjectsCurrentPage.value === allProjectsTotalPages.value"
                    class="px-3 py-1 rounded border"
                    :class="allProjectsCurrentPage.value === allProjectsTotalPages.value ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-50'"
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

      <!-- New Project Form Modal -->
      <div v-if="showNewProjectForm || showEditProjectForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">
              {{ isEditMode ? 'Edit Project' : formStep === 1 ? 'Select Major' : formStep === 2 ? 'New Project Details' : 'Project Preview' }}
            </h2>
            <button 
              @click="cancelProjectForm"
              class="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          <!-- Step indicator - only show for new projects -->
          <div v-if="!isEditMode" class="mb-10">
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
          <div v-if="formStep === 1 && !isEditMode" class="space-y-6 mt-6">
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
                  @click="cancelProjectForm"
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
          <div v-else-if="formStep === 2 || isEditMode" class="space-y-6">
            <div v-if="majorProjectSettings">
              <!-- Remove the major display in edit mode -->
              
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
                  v-if="!isEditMode"
                  type="button"
                  @click="goToStep(1)"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Back
                </button>
                <button 
                  type="button"
                  @click="isEditMode ? saveProject() : goToStep(3)"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                  :disabled="!isFormValid"
                >
                  {{ isEditMode ? 'Update Project' : 'Preview' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Preview -->
          <div v-else-if="formStep === 3 && !isEditMode" class="space-y-6">
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
                  {{ isEditMode ? 'Update Project' : 'Save Project' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Confirm Delete</h3>
            <button 
              @click="showDeleteConfirmation = false"
              class="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>
          <p class="mb-4 text-gray-600">Are you sure you want to delete this project? This action cannot be undone.</p>
          <div class="flex justify-end gap-3">
            <button 
              @click="showDeleteConfirmation = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="deleteProject"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Import Projects Modal -->
      <div v-if="showImportModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Import Projects</h2>
            <button 
              @click="cancelImport"
              class="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          <!-- Loading overlay for import operations -->
          <div v-if="importLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <p class="text-gray-600">Loading projects...</p>
          </div>

          <!-- Year Selection Step -->
          <div v-if="importStep === 1" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Select Source Academic Year
              </label>
              <select 
                v-model="sourceAcademicYear"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
              >
                <option value="">Select year</option>
                <option 
                  v-for="year in availableAcademicYears.filter(y => y.yearId !== selectedAcademicYear)" 
                  :key="year.yearId" 
                  :value="year.yearId"
                >
                  {{ year.academicYear }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-3">
              <button 
                @click="cancelImport"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                @click="importStep = 2; fetchSourceProjects()"
                :disabled="!sourceAcademicYear"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <!-- Project Selection Step -->
          <div v-else-if="importStep === 2" class="space-y-6">
            <!-- Reuse the major filter tags -->
            <div v-if="uniqueSourceProjectMajors.length > 0" class="flex flex-wrap gap-2">
              <button
                v-for="major in uniqueSourceProjectMajors"
                :key="major"
                @click="toggleSourceMajorFilter(major)"
                class="px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                :class="[
                  selectedSourceMajorFilters.has(major) 
                    ? getMajorColorClasses(major).selected
                    : [getMajorColorClasses(major).bg, getMajorColorClasses(major).text, 'hover:bg-opacity-75'],
                ]"
              >
                <span v-if="selectedSourceMajorFilters.has(major)" class="w-2 h-2 rounded-full bg-white"></span>
                {{ major }}
              </button>
            </div>

            <!-- Projects Table -->
            <div v-if="sourceProjects.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        v-model="selectAllProjects"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      >
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Major
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="project in filteredSourceProjects" :key="project.id">
                    <td class="w-16 px-3 py-4 whitespace-nowrap text-sm text-center">
                      <input 
                        type="checkbox" 
                        v-model="selectedProjectsToImport"
                        :value="project.id"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      >
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
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              No projects found in the selected academic year.
            </div>

            <div class="flex justify-between gap-3">
              <button 
                @click="importStep = 1"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
              <div class="flex gap-3">
                <button 
                  @click="cancelImport"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  @click="importStep = 3; fetchCurrentYearMajors()"
                  :disabled="selectedProjectsToImport.length === 0"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Major Mapping Step -->
          <div v-else-if="importStep === 3" class="space-y-6">
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">Map Majors</h3>
              <p class="text-sm text-gray-600">Select which major each project should be imported to in the current academic year.</p>
              
              <div class="space-y-4">
                <div v-for="sourceMajor in uniqueSourceProjectMajors" :key="sourceMajor" class="flex items-center gap-4">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-700">From: </span>
                    <span 
                      class="px-2 py-1 rounded-full text-xs ml-2"
                      :class="[
                        getMajorColorClasses(sourceMajor).bg,
                        getMajorColorClasses(sourceMajor).text
                      ]"
                    >
                      {{ sourceMajor }}
                    </span>
                  </div>
                  <span class="text-sm font-medium text-gray-700">To:</span>
                  <div class="w-36">
                    <select 
                      v-model="majorMappings[sourceMajor]"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      :class="{ 'border-red-300': !majorMappings[sourceMajor] }"
                    >
                      <option value="">Select target major</option>
                      <option v-for="targetMajor in currentYearMajors" :key="targetMajor" :value="targetMajor">
                        {{ targetMajor }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between gap-3">
              <button 
                @click="importStep = 2"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
              <div class="flex gap-3">
                <button 
                  @click="cancelImport"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  @click="handleImport"
                  :disabled="!isAllMajorsMapped"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Import Projects
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { db } from '@/firebase'
import { 
  doc, 
  collection, 
  getDocs, 
  query, 
  where, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  limit, 
  writeBatch,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore'
import { useUserStore } from '@/stores/userStore'
import { getLatestAcademicYear, formatAcademicYear } from '@/utils/latestAcademicYear'
import MilestoneDisplay from '@/components/MilestoneDisplay.vue';
import { getMilestone, ensureBiddingMilestoneHasCompletedField, hasBiddingDeadlinePassed } from '@/utils/milestones';

const userStore = useUserStore()
const loading = ref(true)
const importLoading = ref(false)
const showNewProjectForm = ref(false)
const showEditProjectForm = ref(false)
const isEditMode = ref(false)
const editingProjectId = ref(null)
const editingProjectMajorDocId = ref(null)
const projectSettings = ref(null)
const latestAcademicYear = ref('')
const latestAcademicYearId = ref('')
const selectedAcademicYear = ref('')
const availableAcademicYears = ref([])
const selectedMajor = ref('')
const projects = ref([])
const allProjects = ref([]) // New ref for all projects
const newProject = ref({})
const activeTab = ref('myProjects')

// New form step variables
const formStep = ref(1)
const tempSelectedMajor = ref('')
const availableMajors = ref([])
const majorProjectSettings = ref(null)

// Remove predefined major colors and add dynamic color generation
const colorPalette = [
  { bg: 'bg-blue-100', text: 'text-blue-800' ,selectedBg: 'bg-blue-500'},
  { bg: 'bg-lime-100', text: 'text-lime-800',selectedBg: 'bg-lime-500' },
  { bg: 'bg-pink-100', text: 'text-pink-800',selectedBg: 'bg-pink-500' },
  { bg: 'bg-teal-100', text: 'text-teal-800',selectedBg: 'bg-teal-500' },
  { bg: 'bg-orange-100', text: 'text-orange-800',selectedBg: 'bg-orange-500' }
]

// Map to store major-color associations
const majorColorMap = ref(new Map())

// Function to get color classes for a major
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

// Add new state for major filters
const selectedMajorFilters = ref(new Set())
const uniqueProjectMajors = computed(() => {
  return [...new Set(projects.value.map(project => project.major))]
})

// Modify the paginatedProjects computed property to include filtering
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

// Add function to toggle major filter
const toggleMajorFilter = (major) => {
  if (selectedMajorFilters.value.has(major)) {
    selectedMajorFilters.value.delete(major)
  } else {
    selectedMajorFilters.value.add(major)
  }
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(projects.value.length / itemsPerPage))

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

// Fetch available academic years
const fetchAvailableYears = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const projectsRef = collection(db, 'schools', schoolId, 'projects')
    const projectsSnapshot = await getDocs(query(projectsRef))
    
    if (projectsSnapshot.empty) {
      return
    }
    
    // Extract all academic year IDs and convert to readable format
    const years = projectsSnapshot.docs.map(doc => ({
      yearId: doc.id,
      academicYear: formatAcademicYear(doc.id)
    }))
    
    // Sort in descending order
    years.sort((a, b) => b.yearId.localeCompare(a.yearId))
    availableAcademicYears.value = years
    
    // Set the latest year as default if not already selected
    if (!selectedAcademicYear.value) {
      selectedAcademicYear.value = years[0].yearId
      latestAcademicYear.value = years[0].academicYear
      latestAcademicYearId.value = years[0].yearId
    }
  } catch (error) {
    console.error('Error fetching available years:', error)
    showToast('Failed to fetch academic years', 'error')
  }
}

// Fetch project settings for the selected year
const fetchSettings = async () => {
  try {
    loading.value = true
    
    // Get basic settings (majors, etc.)
    await fetchBasicSettings()
    
    // Note: We no longer call these functions here for lazy loading
    // Instead, they will be called selectively based on the active tab
    // - fetchUserProjects() 
    // - fetchAllProjects()
    // - fetchProjectBids()
  } catch (error) {
    console.error('Error fetching settings:', error)
    showToast('Failed to load settings', 'error')
  } finally {
    loading.value = false
  }
}

// Separate function to fetch user projects
const fetchUserProjects = async (schoolId, userId, academicYearId) => {
  try {
    // Clear existing projects
    projects.value = []
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    
    // Fetch projects from all majors
    for (const major of availableMajors.value) {
      try {
        const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId, major)
        const majorDocs = await getDocs(majorRef)
        
        if (!majorDocs.empty) {
          const majorDoc = majorDocs.docs[0]
          const majorDocId = majorDoc.id
          
          const projectsRef = collection(
            db, 
            'schools', 
            schoolId, 
            'projects', 
            academicYearId, 
            major, 
            majorDocId,
            'projectsPerYear'
          )
          
          // Filter by userId
          const projectsQuery = query(projectsRef, where('userId', '==', userId))
          const projectsDocs = await getDocs(projectsQuery)
          
          for (const doc of projectsDocs.docs) {
            const projectId = doc.id
            const projectData = doc.data()
            
            // Check if this project has any bids
            const bidsRef = collection(
              db, 
              'schools', 
              schoolId, 
              'projects', 
              academicYearId, 
              major, 
              majorDocId,
              'projectsPerYear',
              projectId,
              'bids'
            )
            
            const bidsSnapshot = await getDocs(bidsRef)
            const hasBids = !bidsSnapshot.empty
            
            // Use Map to ensure uniqueness by project ID
            if (!projectsMap.has(projectId)) {
              projectsMap.set(projectId, {
                id: projectId,
                hasBids, // Add the hasBids flag
                ...projectData
              })
            }
          }
        }
      } catch (majorError) {
        console.error(`Error fetching projects for major ${major}:`, majorError)
      }
    }
    
    // Convert map values to array
    projects.value = Array.from(projectsMap.values())
    
    console.log('Debug - Total unique loaded projects:', projects.value.length)
    console.log('Debug - Projects by major:', projects.value.reduce((acc, project) => {
      acc[project.major] = (acc[project.major] || 0) + 1;
      return acc;
    }, {}))
  } catch (error) {
    console.error('Error fetching user projects:', error)
  }
}

// Function to fetch projects (used after import and for refreshing)
const fetchProjects = async () => {
  try {
    loading.value = true
    const schoolId = userStore.currentUser.school
    
    let userId = userStore.currentUser.id || 
                 userStore.currentUser.uid || 
                 userStore.currentUser._id || 
                 userStore.currentUser.userId
    
    if (!userId) {
      console.warn('Debug - User ID (uid) is missing, using fallback')
      userId = "unknown-user-" + Date.now()
    }
    
    await fetchUserProjects(schoolId, userId, selectedAcademicYear.value)
    await fetchAllProjects() // Also fetch all projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    showToast('Failed to refresh projects list', 'error')
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
          // Initialize array fields as empty arrays
          if (majorData.headers[headerName].type === 'array' && !majorData.headers[headerName].values) {
            newProject.value[headerName] = []
          } else {
            newProject.value[headerName] = ''
          }
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
const cancelProjectForm = () => {
  formStep.value = 1
  tempSelectedMajor.value = ''
  newProject.value = {}
  majorProjectSettings.value = null
  showNewProjectForm.value = false
  showEditProjectForm.value = false
  isEditMode.value = false
  editingProjectId.value = null
  editingProjectMajorDocId.value = null
}

// Function to edit a project
const editProject = async (project) => {
  try {
    isEditMode.value = true
    editingProjectId.value = project.id
    tempSelectedMajor.value = project.major
    
    // Get the major document ID for the project's major
    const schoolId = userStore.currentUser.school
    const majorRef = collection(db, 'schools', schoolId, 'projects', latestAcademicYearId.value, project.major)
    const majorDocs = await getDocs(majorRef)
    
    if (!majorDocs.empty) {
      editingProjectMajorDocId.value = majorDocs.docs[0].id
      const majorData = majorDocs.docs[0].data()
      majorProjectSettings.value = {
        headers: majorData.headers || {},
        milestones: majorData.milestones || []
      }
      
      // Copy project data to newProject
      newProject.value = { ...project }
      
      // Remove fields that shouldn't be editable
      delete newProject.value.id
      delete newProject.value.createdAt
      delete newProject.value.academicYear
      delete newProject.value.userId
      // Keep the major field but it will be displayed as read-only
      
      // Show the edit form
      showEditProjectForm.value = true
    } else {
      throw new Error('Major document not found')
    }
  } catch (error) {
    console.error('Error preparing project for edit:', error)
    showToast('Failed to load project for editing', 'error')
  }
}

// Save the project to Firestore
const saveProject = async () => {
  try {
    // Show loading state
    loading.value = true
    
    const schoolId = userStore.currentUser.school
    
    // Debug the user object to find the correct ID field
    console.log('Debug - Current user object:', userStore.currentUser)
    
    // Use uid directly since that's what's used in the userStore
    const userId = userStore.currentUser.uid
    
    if (!userId) {
      console.warn('Debug - User ID (uid) is missing, using fallback')
      // If we can't find the ID, use a fallback value
      userId = "unknown-user-" + Date.now() // Generate a unique fallback ID
    }
    
    console.log('Debug - Using userId:', userId)
    
    if (isEditMode.value) {
      // Update existing project
      if (!editingProjectId.value || !editingProjectMajorDocId.value) {
        throw new Error('Missing project ID or major document ID for update')
      }
      
      // Prepare update data
      const updateData = { ...newProject.value }
      
      // Reference to the project document
      const projectRef = doc(
        db, 
        'schools', 
        schoolId, 
        'projects', 
        latestAcademicYearId.value, 
        tempSelectedMajor.value, 
        editingProjectMajorDocId.value,
        'projectsPerYear',
        editingProjectId.value
      )
      
      console.log('Debug - Updating project at:', projectRef.path)
      
      // Update the document in Firestore
      await updateDoc(projectRef, updateData)
      
      // Update the local projects array
      const index = projects.value.findIndex(p => p.id === editingProjectId.value)
      if (index !== -1) {
        // Merge the updated fields with the existing project
        projects.value[index] = {
          ...projects.value[index],
          ...updateData
        }
      }
      
      showToast('Project updated successfully')
    } else {
      // Add the academic year, major, and user ID to the project
      const projectData = {
        ...newProject.value,
        academicYear: latestAcademicYear.value,
        createdAt: new Date(),
        major: tempSelectedMajor.value,
        userId: userId // Using the uid from currentUser
      }
      
      // First, get the major document ID
      const majorRef = collection(db, 'schools', schoolId, 'projects', latestAcademicYearId.value, tempSelectedMajor.value)
      const majorDocs = await getDocs(majorRef)
      
      if (majorDocs.empty) {
        throw new Error('Major document not found')
      }
      
      // Get the major document ID
      const majorDocId = majorDocs.docs[0].id
      console.log('Debug - Major document ID:', majorDocId)
      
      // Fetch user's projects from the projectsPerYear subcollection
      const projectsRef = collection(
        db, 
        'schools', 
        schoolId, 
        'projects', 
        latestAcademicYearId.value, 
        tempSelectedMajor.value, 
        majorDocId,
        'projectsPerYear'
      )
      console.log('Debug - Fetching projects from:', `schools/${schoolId}/projects/${latestAcademicYearId.value}/${tempSelectedMajor.value}/${majorDocId}/projectsPerYear`)
      
      // Add the document to Firestore
      const docRef = await addDoc(projectsRef, projectData)
      
      // Add to the local projects array for immediate UI update
      projects.value.push({
        id: docRef.id,
        ...projectData
      })
      
      showToast('Project saved successfully')
    }
    
    // Reset the form
    formStep.value = 1
    tempSelectedMajor.value = ''
    newProject.value = {}
    majorProjectSettings.value = null
    showNewProjectForm.value = false
    showEditProjectForm.value = false
    isEditMode.value = false
    editingProjectId.value = null
    editingProjectMajorDocId.value = null
  } catch (error) {
    console.error('Error saving project:', error)
    showToast('Failed to save project', 'error')
  } finally {
    loading.value = false
  }
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

// Watch for changes in selected academic year
watch(selectedAcademicYear, async (newYear) => {
  if (newYear) {
    latestAcademicYear.value = formatAcademicYear(newYear)
    latestAcademicYearId.value = newYear
    
    // Reset the loaded flags since we need fresh data for the new year
    myProjectsLoaded.value = false
    allProjectsLoaded.value = false
    bidsLoaded.value = false
    
    // Reload data for the current tab when year changes
    await loadTabData(activeTab.value)
  }
})

// Update onMounted to fetch years and load initial tab data
onMounted(async () => {
  await fetchAvailableYears()
  // Load data for initial tab
  await loadTabData(activeTab.value)
})

const showDeleteConfirmation = ref(false)
const projectToDelete = ref(null)

// Function to show delete confirmation
const confirmDeleteProject = (project) => {
  projectToDelete.value = project
  showDeleteConfirmation.value = true
}

// Function to delete a project
const deleteProject = async () => {
  try {
    if (!projectToDelete.value) return
    
    const schoolId = userStore.currentUser.school
    
    // Get the major document ID for the project's major
    const majorRef = collection(db, 'schools', schoolId, 'projects', latestAcademicYearId.value, projectToDelete.value.major)
    const majorDocs = await getDocs(majorRef)
    
    if (majorDocs.empty) {
      throw new Error('Major document not found')
    }
    
    const majorDocId = majorDocs.docs[0].id
    
    // Reference to the project document
    const projectRef = doc(
      db, 
      'schools', 
      schoolId, 
      'projects', 
      latestAcademicYearId.value, 
      projectToDelete.value.major, 
      majorDocId,
      'projectsPerYear',
      projectToDelete.value.id
    )
    
    // Delete the document from Firestore
    await deleteDoc(projectRef)
    
    // Remove from local projects array
    const index = projects.value.findIndex(p => p.id === projectToDelete.value.id)
    if (index !== -1) {
      projects.value.splice(index, 1)
    }
    
    showToast('Project deleted successfully')
  } catch (error) {
    console.error('Error deleting project:', error)
    showToast('Failed to delete project', 'error')
  } finally {
    showDeleteConfirmation.value = false
    projectToDelete.value = null
  }
}

// Add new refs for import functionality
const showImportModal = ref(false)
const importStep = ref(1)
const sourceAcademicYear = ref('')
const sourceProjects = ref([])
const selectedProjectsToImport = ref([])
const selectedSourceMajorFilters = ref(new Set())
const majorMappings = ref({})
const currentYearMajors = ref([])

// Computed properties for source projects
const uniqueSourceProjectMajors = computed(() => {
  return [...new Set(sourceProjects.value.map(project => project.major))]
})

const filteredSourceProjects = computed(() => {
  if (selectedSourceMajorFilters.value.size === 0) {
    return sourceProjects.value
  }
  return sourceProjects.value.filter(project => selectedSourceMajorFilters.value.has(project.major))
})

const selectAllProjects = computed({
  get: () => {
    return filteredSourceProjects.value.length > 0 && 
           selectedProjectsToImport.value.length === filteredSourceProjects.value.length
  },
  set: (value) => {
    if (value) {
      selectedProjectsToImport.value = filteredSourceProjects.value.map(p => p.id)
    } else {
      selectedProjectsToImport.value = []
    }
  }
})

// Function to toggle source major filter
const toggleSourceMajorFilter = (major) => {
  if (selectedSourceMajorFilters.value.has(major)) {
    selectedSourceMajorFilters.value.delete(major)
  } else {
    selectedSourceMajorFilters.value.add(major)
  }
}

// Function to fetch projects from source year
const fetchSourceProjects = async () => {
  try {
    importLoading.value = true
    const schoolId = userStore.currentUser.school
    sourceProjects.value = []
    
    // Get user ID
    let userId = userStore.currentUser.id || 
                 userStore.currentUser.uid || 
                 userStore.currentUser._id || 
                 userStore.currentUser.userId
    
    if (!userId) {
      console.warn('Debug - User ID (uid) is missing, using fallback')
      userId = "unknown-user-" + Date.now()
    }
    
    // Get the majors for the source year
    const projectsRef = doc(db, 'schools', schoolId, 'projects', sourceAcademicYear.value)
    const projectsDoc = await getDoc(projectsRef)
    
    if (projectsDoc.exists() && projectsDoc.data().majors) {
      const majors = projectsDoc.data().majors
      
      // Fetch projects from each major
      for (const major of majors) {
        const majorRef = collection(db, 'schools', schoolId, 'projects', sourceAcademicYear.value, major)
        const majorDocs = await getDocs(majorRef)
        
        if (!majorDocs.empty) {
          const majorDoc = majorDocs.docs[0]
          const majorDocId = majorDoc.id
          
          const projectsRef = collection(
            db, 
            'schools', 
            schoolId, 
            'projects', 
            sourceAcademicYear.value, 
            major, 
            majorDocId,
            'projectsPerYear'
          )
          
          // Add filter for current user's projects
          const projectsQuery = query(projectsRef, where('userId', '==', userId))
          const projectsDocs = await getDocs(projectsQuery)
          
          projectsDocs.forEach(doc => {
            sourceProjects.value.push({
              id: doc.id,
              majorDocId, // Store majorDocId for later use during import
              ...doc.data()
            })
          })
        }
      }
    }
    
    console.log('Debug - Fetched source projects:', sourceProjects.value.length)
  } catch (error) {
    console.error('Error fetching source projects:', error)
    showToast('Failed to fetch projects from source year', 'error')
  } finally {
    importLoading.value = false
  }
}

// Function to handle import cancellation
const cancelImport = () => {
  showImportModal.value = false
  importStep.value = 1
  sourceAcademicYear.value = ''
  sourceProjects.value = []
  selectedProjectsToImport.value = []
  selectedSourceMajorFilters.value.clear()
  majorMappings.value = {} // Reset mappings
  importLoading.value = false
}

// Update the handleImport function
const handleImport = async () => {
  try {
    importLoading.value = true
    const schoolId = userStore.currentUser.school
    let importedCount = 0
    let errors = 0
    
    // Get selected projects with their details
    const projectsToImport = sourceProjects.value.filter(p => selectedProjectsToImport.value.includes(p.id))
    
    for (const project of projectsToImport) {
      try {
        // Get the target major for this project
        const targetMajor = majorMappings.value[project.major]
        if (!targetMajor) {
          errors++
          continue // Skip if no mapping found
        }
        
        // Get the major document ID and configuration for the target major
        const targetMajorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, targetMajor)
        const targetMajorDocs = await getDocs(targetMajorRef)
        
        if (!targetMajorDocs.empty) {
          const targetMajorDoc = targetMajorDocs.docs[0]
          const targetMajorDocId = targetMajorDoc.id
          const targetMajorConfig = targetMajorDoc.data()
          
          // Get the headers configuration for the target major
          const targetHeaders = targetMajorConfig.headers || {}
          
          // Prepare the project data with only matching headers
          const filteredProjectData = {
            Title: project.Title, // Always keep the Title
            major: targetMajor,
            academicYear: formatAcademicYear(selectedAcademicYear.value),
            createdAt: new Date(),
            userId: userStore.currentUser.uid
          }
          
          // Only copy fields that exist in target major's headers
          Object.keys(project).forEach(field => {
            if (targetHeaders[field]) {
              // Check if the field types match
              if (targetHeaders[field].type === 'array' && Array.isArray(project[field])) {
                // For array fields, check if values are predefined
                if (targetHeaders[field].values && targetHeaders[field].values.length > 0) {
                  // If target has predefined values, only keep the value if it exists in the predefined list
                  if (targetHeaders[field].values.includes(project[field])) {
                    filteredProjectData[field] = project[field]
                  }
                } else {
                  // If no predefined values, keep the array as is
                  filteredProjectData[field] = project[field]
                }
              } else if (targetHeaders[field].type === 'string' && typeof project[field] === 'string') {
                // For string fields, copy directly
                filteredProjectData[field] = project[field]
              }
            }
          })
          
          console.log('Debug - Importing project:', {
            title: filteredProjectData.Title,
            sourceMajor: project.major,
            targetMajor,
            originalFields: Object.keys(project).length,
            filteredFields: Object.keys(filteredProjectData).length,
            path: `schools/${schoolId}/projects/${selectedAcademicYear.value}/${targetMajor}/${targetMajorDocId}/projectsPerYear`
          })
          
          // Add to the target major's projectsPerYear collection
          const projectsRef = collection(
            db, 
            'schools', 
            schoolId, 
            'projects', 
            selectedAcademicYear.value, 
            targetMajor, 
            targetMajorDocId,
            'projectsPerYear'
          )
          
          await addDoc(projectsRef, filteredProjectData)
          importedCount++
        }
      } catch (error) {
        console.error('Error importing project:', project.Title, error)
        errors++
      }
    }
    
    // Refresh the projects list
    await fetchProjects()
    
    // Show appropriate toast message
    if (errors > 0) {
      showToast(`Imported ${importedCount} projects, ${errors} failed`, 'error')
    } else {
      showToast(`Successfully imported ${importedCount} projects`)
    }
    
    // Close modal and reset state
    cancelImport()
  } catch (error) {
    console.error('Error during import:', error)
    showToast('Failed to import projects', 'error')
  } finally {
    importLoading.value = false
  }
}

// Function to fetch current year's majors
const fetchCurrentYearMajors = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const projectsRef = doc(db, 'schools', schoolId, 'projects', selectedAcademicYear.value)
    const projectsDoc = await getDoc(projectsRef)
    
    if (projectsDoc.exists() && projectsDoc.data().majors) {
      currentYearMajors.value = projectsDoc.data().majors
    }
  } catch (error) {
    console.error('Error fetching current year majors:', error)
    showToast('Failed to fetch current year majors', 'error')
  }
}

// Add computed property to check if all majors are mapped
const isAllMajorsMapped = computed(() => {
  return uniqueSourceProjectMajors.value.every(major => majorMappings.value[major])
})

// Add new state for all projects filters
const selectedAllMajorFilters = ref(new Set())
const uniqueAllProjectMajors = computed(() => {
  return [...new Set(allProjects.value.map(project => project.major))]
})

// Map to store user names by ID
const userNamesMap = ref(new Map())

// Filtered all projects
const filteredAllProjects = computed(() => {
  if (selectedAllMajorFilters.value.size === 0) {
    return allProjects.value
  }
  return allProjects.value.filter(project => selectedAllMajorFilters.value.has(project.major))
})

// Pagination for all projects
const allProjectsCurrentPage = ref(1)
const allProjectsTotalPages = computed(() => Math.ceil(filteredAllProjects.value.length / itemsPerPage))
const paginatedAllProjects = computed(() => {
  const start = (allProjectsCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAllProjects.value.slice(start, end)
})

// Function to toggle all projects major filter
const toggleAllMajorFilter = (major) => {
  if (selectedAllMajorFilters.value.has(major)) {
    selectedAllMajorFilters.value.delete(major)
  } else {
    selectedAllMajorFilters.value.add(major)
  }
}

// Watch for all projects length changes to reset page if needed
watch(allProjects, () => {
  if (allProjectsCurrentPage.value > allProjectsTotalPages.value) {
    allProjectsCurrentPage.value = allProjectsTotalPages.value || 1
  }
})

// Fetch all projects regardless of creator
const fetchAllProjects = async () => {
  try {
    const schoolId = userStore.currentUser.school
    
    // Clear existing all projects
    allProjects.value = []
    
    // Create a map to track projects by ID to avoid duplicates
    const projectsMap = new Map()
    // Create a set to track unique user IDs
    const userIds = new Set()
    
    // Fetch projects from all majors
    for (const major of availableMajors.value) {
      try {
        const majorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, major)
        const majorDocs = await getDocs(majorRef)
        
        if (!majorDocs.empty) {
          const majorDoc = majorDocs.docs[0]
          const majorDocId = majorDoc.id
          
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
          
          // Get all projects without filtering by userId
          const projectsDocs = await getDocs(projectsRef)
          
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
    allProjects.value = Array.from(projectsMap.values())
    
    // Fetch user names for all creators
    await fetchUserNames(Array.from(userIds))
    
  } catch (error) {
    console.error('Error fetching all projects:', error)
    showToast('Failed to load all projects', 'error')
  }
}

// Update the fetchUserNames function to handle batch fetching
const fetchUserNames = async (userIds) => {
  try {
    if (!userIds.length) return;
    
    // Get the current user's school ID
    const schoolId = userStore.currentUser.school;
    if (!schoolId) {
      console.error('Error: No school ID found for current user');
      return;
    }
    
    // Filter out IDs we already have
    const idsToFetch = userIds.filter(id => 
      id !== userStore.currentUser.uid && !userNamesMap.value.has(id)
    );
    
    if (idsToFetch.length === 0) return;
    
    // Add current user to the map if not already there
    if (userStore.currentUser && !userNamesMap.value.has(userStore.currentUser.uid)) {
      userNamesMap.value.set(
        userStore.currentUser.uid,
        userStore.currentUser.name || userStore.currentUser.displayName || 'You'
      );
    }
    
    // Fetch user documents in parallel
    const userPromises = idsToFetch.map(async (userId) => {
      try {
        const userDocRef = doc(db, 'schools', schoolId, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userName = userData.name || userData.displayName || userData.email?.split('@')[0] || '...';
          userNamesMap.value.set(userId, userName);
        }
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        userNamesMap.value.set(userId, '...'); // Set loading state on error
      }
    });
    
    await Promise.all(userPromises);
  } catch (error) {
    console.error('Error fetching user names:', error);
  }
}

// Function to get user name by ID
const getUserName = (userId) => {
  // If it's the current user, use their name from the userStore
  if (userId === userStore.currentUser.uid) {
    return userStore.currentUser.name || userStore.currentUser.displayName || 'You';
  }
  
  // If we have the name in our map, use it
  if (userNamesMap.value.has(userId)) {
    return userNamesMap.value.get(userId);
  }
  
  // If we don't have the name yet, trigger a fetch and return loading state
  fetchUserNames([userId]).catch(console.error);
  return '...'; // Show loading indicator instead of formatted ID
}

// Add new state for bids
const projectBids = ref([])
const selectedBidMajorFilters = ref(new Set())
const bidCurrentPage = ref(1)

// Add computed properties for bids
const uniqueBidProjectMajors = computed(() => {
  return [...new Set(projectBids.value.map(bid => bid.major))]
})

// Add new ref for bid status filter after other refs
const bidStatusFilter = ref('all') // possible values: 'all', 'active', 'hide-invalidated'

// Modify the filteredBids computed property
const filteredBids = computed(() => {
  let bids = projectBids.value

  // Apply major filter
  if (selectedBidMajorFilters.value.size > 0) {
    bids = bids.filter(bid => selectedBidMajorFilters.value.has(bid.major))
  }

  // Apply status filter
  switch (bidStatusFilter.value) {
    case 'active':
      return bids.filter(bid => bid.status === 'pending')
    default: // 'all'
      return bids
  }
})

const paginatedBids = computed(() => {
  const start = (bidCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBids.value.slice(start, end)
})

const bidTotalPages = computed(() => 
  Math.ceil(filteredGroupedBids.value.length / itemsPerPage)
)

// Add function to toggle bid major filter
const toggleBidMajorFilter = (major) => {
  if (selectedBidMajorFilters.value.has(major)) {
    selectedBidMajorFilters.value.delete(major)
  } else {
    selectedBidMajorFilters.value.add(major)
  }
}

// Watch for bids length changes to reset page if needed
watch(projectBids, () => {
  if (bidCurrentPage.value > bidTotalPages.value) {
    bidCurrentPage.value = bidTotalPages.value || 1
  }
})

// Function to fetch bids for lecturer's projects
const fetchProjectBids = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const bidsMap = new Map() // Use a map to prevent duplicates
    
    for (const major of availableMajors.value) {
      try {
        const majorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, major)
        const majorDocs = await getDocs(majorRef)
        
        if (!majorDocs.empty) {
          const majorDoc = majorDocs.docs[0]
          const majorDocId = majorDoc.id
          
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
          
          const projectsQuery = query(projectsRef, where('userId', '==', userStore.currentUser.uid))
          const projectsDocs = await getDocs(projectsQuery)
          
          for (const projectDoc of projectsDocs.docs) {
            const projectId = projectDoc.id
            const projectData = projectDoc.data()
            
            const bidsRef = collection(
              db, 
              'schools', 
              schoolId, 
              'projects', 
              selectedAcademicYear.value, 
              major, 
              majorDocId,
              'projectsPerYear',
              projectId,
              'bids'
            )
            
            const bidsSnapshot = await getDocs(bidsRef)
            
            bidsSnapshot.forEach(bidDoc => {
              const bidData = bidDoc.data()
              const bidId = bidDoc.id
              
              // Use composite key to prevent duplicates
              const compositeKey = `${bidId}-${projectId}-${bidData.studentId}`
              
              if (!bidsMap.has(compositeKey)) {
                bidsMap.set(compositeKey, {
                  id: bidId,
                  projectId,
                  projectTitle: projectData.Title,
                  major: projectData.major,
                  ...bidData
                })
              }
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching bids for major ${major}:`, error)
      }
    }
    
    // Convert map to array
    projectBids.value = Array.from(bidsMap.values())
    
    // Fetch student names
    const studentIds = new Set(projectBids.value.map(bid => bid.studentId))
    await fetchUserNames(Array.from(studentIds))
    
  } catch (error) {
    console.error('Error fetching project bids:', error)
    showToast('Failed to load project bids', 'error')
  }
}

// Add helper function to check if student has accepted bid
const checkStudentHasAcceptedBid = async (schoolId, studentId) => {
  try {
    const studentBidsRef = collection(db, 'schools', schoolId, 'studentBids', studentId, 'bids')
    const bidsSnapshot = await getDocs(studentBidsRef)
    return bidsSnapshot.docs.some(doc => doc.data().status === 'accepted')
  } catch (error) {
    console.error('Error checking student accepted bids:', error)
    throw error
  }
}

// Function to update bid status
const updateBidStatus = async (bid, newStatus) => {
  try {
    const schoolId = userStore.currentUser.school
    
    // Get the major document ID
    const majorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, bid.major)
    const majorDocs = await getDocs(majorRef)
    
    if (majorDocs.empty) {
      throw new Error('Major document not found')
    }
    
    const majorDocId = majorDocs.docs[0].id

    // Start a batch write
    const batch = writeBatch(db)
    
    // Update the selected bid in project's collection
    const projectBidRef = doc(
      db, 
      'schools',
      schoolId, 
      'projects', 
      selectedAcademicYear.value, 
      bid.major, 
      majorDocId,
      'projectsPerYear',
      bid.projectId,
      'bids',
      bid.id
    )

    const updateData = {
      status: newStatus,
      updatedAt: new Date()
    }

    // If accepting the bid, add lecturerAccepted flag
    if (newStatus === 'accepted') {
      updateData.lecturerAccepted = true
    }

    batch.update(projectBidRef, updateData)

    // If accepting the bid, update project document to add student to tentativeStudentIds
    if (newStatus === 'accepted') {
      const projectRef = doc(
        db,
        'schools',
        schoolId,
        'projects',
        selectedAcademicYear.value,
        bid.major,
        majorDocId,
        'projectsPerYear',
        bid.projectId
      )
      
      batch.update(projectRef, {
        tentativeStudentIds: arrayUnion(bid.studentId),
        updatedAt: new Date()
      })
    }

    // Commit all the updates
    await batch.commit()
    
    // Update local state
    const bidIndex = projectBids.value.findIndex(b => b.id === bid.id)
    if (bidIndex !== -1) {
      projectBids.value[bidIndex] = {
        ...projectBids.value[bidIndex],
        status: newStatus,
        lecturerAccepted: newStatus === 'accepted'
      }
    }
    
    showToast(`Bid ${newStatus} successfully`)
  } catch (error) {
    console.error('Error updating bid status:', error)
    showToast('Failed to update bid status', 'error')
  }
}

// Add these refs and computed properties after the existing projectBids ref

// Track expanded projects
const expandedProjects = ref(new Set())

// Group bids by project
const groupedBids = computed(() => {
  const groups = new Map()
  
  filteredBids.value.forEach(bid => {
    if (!groups.has(bid.projectId)) {
      groups.set(bid.projectId, {
        projectId: bid.projectId,
        projectTitle: bid.projectTitle,
        major: bid.major,
        bids: [],
        hasPendingBids: false,
        allBidsProcessed: true
      })
    }
    
    const group = groups.get(bid.projectId)
    group.bids.push(bid)
    
    // Update status flags
    if (bid.status === 'pending') {
      group.hasPendingBids = true
    }
    if (bid.status !== 'accepted' && bid.status !== 'rejected') {
      group.allBidsProcessed = false
    }
  })
  
  // Sort bids within each group by priority
  groups.forEach(group => {
    group.bids.sort((a, b) => a.priority - b.priority)
  })
  
  // Convert to array and sort by project title
  return Array.from(groups.values()).sort((a, b) => 
    a.projectTitle.localeCompare(b.projectTitle)
  )
})

// Filter grouped bids by major
const filteredGroupedBids = computed(() => {
  const groups = new Map()
  
  filteredBids.value.forEach(bid => {
    if (!groups.has(bid.projectId)) {
      groups.set(bid.projectId, {
        projectId: bid.projectId,
        projectTitle: bid.projectTitle,
        major: bid.major,
        bids: [],
        hasPendingBids: false,
        allBidsProcessed: true
      })
    }
    
    const group = groups.get(bid.projectId)
    group.bids.push(bid)
    
    // Update status flags
    if (bid.status === 'pending') {
      group.hasPendingBids = true
    }
    if (bid.status !== 'accepted' && bid.status !== 'rejected') {
      group.allBidsProcessed = false
    }
  })
  
  // Sort bids within each group by priority
  groups.forEach(group => {
    group.bids.sort((a, b) => a.priority - b.priority)
  })
  
  // Convert to array and sort by project title
  return Array.from(groups.values()).sort((a, b) => 
    a.projectTitle.localeCompare(b.projectTitle)
  )
})

// Paginate grouped bids
const paginatedGroupedBids = computed(() => {
  const start = (bidCurrentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredGroupedBids.value.slice(start, end)
})

// Toggle project expansion
const toggleProjectBids = (projectId) => {
  if (expandedProjects.value.has(projectId)) {
    // Unsubscribe from listener when collapsing
    const unsubscribe = bidListeners.value.get(projectId)
    if (unsubscribe) {
      unsubscribe()
      bidListeners.value.delete(projectId)
    }
    expandedProjects.value.delete(projectId)
  } else {
    expandedProjects.value.add(projectId)
    // Set up real-time listener for this project's bids
    setupBidListener(projectId)
  }
}

// Watch for filter changes to reset expanded projects
watch(selectedBidMajorFilters, () => {
  // Clean up listeners before clearing expanded projects
  bidListeners.value.forEach(unsubscribe => unsubscribe())
  bidListeners.value.clear()
  expandedProjects.value.clear()
})

// Watch for page changes to reset expanded projects
watch(bidCurrentPage, () => {
  // Clean up listeners before clearing expanded projects
  bidListeners.value.forEach(unsubscribe => unsubscribe())
  bidListeners.value.clear()
  expandedProjects.value.clear()
})

// Add new ref for bid listeners after other refs
const bidListeners = ref(new Map())

// Add new function to set up bid listener
const setupBidListener = (projectId) => {
  const schoolId = userStore.currentUser.school
  const project = groupedBids.value.find(p => p.projectId === projectId)
  
  if (!project) return

  // Get the major document ID
  const majorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, project.major)
  getDocs(majorRef).then(majorDocs => {
    if (!majorDocs.empty) {
      const majorDocId = majorDocs.docs[0].id
      
      const bidsRef = collection(
        db,
        'schools',
        schoolId,
        'projects',
        selectedAcademicYear.value,
        project.major,
        majorDocId,
        'projectsPerYear',
        projectId,
        'bids'
      )

      // Set up real-time listener
      const unsubscribe = onSnapshot(bidsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const bidData = change.doc.data()
          const bidId = change.doc.id
          
          // Update local state
          const bidIndex = projectBids.value.findIndex(b => b.id === bidId)
          if (bidIndex !== -1) {
            projectBids.value[bidIndex] = {
              ...projectBids.value[bidIndex],
              ...bidData
            }
          }
        })
      }, (error) => {
        console.error('Error in bid listener:', error)
      })

      // Store unsubscribe function
      bidListeners.value.set(projectId, unsubscribe)
    }
  }).catch(error => {
    console.error('Error setting up bid listener:', error)
  })
}

// Add cleanup on component unmount
onBeforeUnmount(() => {
  // Unsubscribe from all listeners
  bidListeners.value.forEach(unsubscribe => unsubscribe())
  bidListeners.value.clear()
})

// Add new function to set up listeners for all bids
const setupAllBidsListeners = async () => {
  const schoolId = userStore.currentUser.school
  
  // Clean up existing listeners first
  bidListeners.value.forEach(unsubscribe => unsubscribe())
  bidListeners.value.clear()
  
  for (const major of availableMajors.value) {
    try {
      const majorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, major)
      const majorDocs = await getDocs(majorRef)
      
      if (!majorDocs.empty) {
        const majorDoc = majorDocs.docs[0]
        const majorDocId = majorDoc.id
        
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
        
        const projectsQuery = query(projectsRef, where('userId', '==', userStore.currentUser.uid))
        const projectsDocs = await getDocs(projectsQuery)
        
        for (const projectDoc of projectsDocs.docs) {
          const projectId = projectDoc.id
          const projectData = projectDoc.data()
          
          const bidsRef = collection(
            db, 
            'schools', 
            schoolId, 
            'projects', 
            selectedAcademicYear.value, 
            major, 
            majorDocId,
            'projectsPerYear',
            projectId,
            'bids'
          )
          
          // Set up real-time listener for this project's bids
          const unsubscribe = onSnapshot(bidsRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              const bidData = change.doc.data()
              const bidId = change.doc.id
              
              if (change.type === 'added') {
                // New bid added
                const newBid = {
                  id: bidId,
                  projectId,
                  projectTitle: projectData.Title,
                  major: projectData.major,
                  ...bidData
                }
                
                // Check if bid already exists
                const existingIndex = projectBids.value.findIndex(b => b.id === bidId)
                if (existingIndex === -1) {
                  projectBids.value.push(newBid)
                }
                
                // Fetch student name if needed
                if (bidData.studentId && !userNamesMap.value.has(bidData.studentId)) {
                  fetchUserNames([bidData.studentId])
                }
              } else if (change.type === 'modified') {
                // Bid updated
                const bidIndex = projectBids.value.findIndex(b => b.id === bidId)
                if (bidIndex !== -1) {
                  projectBids.value[bidIndex] = {
                    ...projectBids.value[bidIndex],
                    ...bidData
                  }
                }
              } else if (change.type === 'removed') {
                // Bid removed
                const bidIndex = projectBids.value.findIndex(b => b.id === bidId)
                if (bidIndex !== -1) {
                  projectBids.value.splice(bidIndex, 1)
                }
              }
            })
          }, (error) => {
            console.error('Error in bid listener:', error)
          })
          
          // Store unsubscribe function with a unique key
          const listenerKey = `${major}-${projectId}`
          bidListeners.value.set(listenerKey, unsubscribe)
        }
      }
    } catch (error) {
      console.error(`Error setting up listeners for major ${major}:`, error)
    }
  }
}

// Add watcher for activeTab
watch(activeTab, async (newTab, oldTab) => {
  // First clean up any resources from the old tab
  if (oldTab === 'bids') {
    // Clean up listeners when leaving bids tab
    bidListeners.value.forEach(unsubscribe => unsubscribe())
    bidListeners.value.clear()
  }
  
  // Then load data for the new tab
  await loadTabData(newTab)
})

// Modify watcher for selectedAcademicYear
watch(selectedAcademicYear, async (newYear) => {
  if (newYear) {
    latestAcademicYear.value = formatAcademicYear(newYear)
    latestAcademicYearId.value = newYear
    
    // Reset the loaded flags since we need fresh data for the new year
    myProjectsLoaded.value = false
    allProjectsLoaded.value = false
    bidsLoaded.value = false
    
    // Reload data for the current tab when year changes
    await loadTabData(activeTab.value)
  }
})

// Update onMounted to only fetch years and minimal initial data
onMounted(async () => {
  await fetchAvailableYears()
  // Only load data for the active tab
  await loadTabData(activeTab.value)
})

// Add tab-specific loading states
const myProjectsLoading = ref(false)
const allProjectsLoading = ref(false) 
const bidsLoading = ref(false)

// Add tracking for which tabs have been loaded
const myProjectsLoaded = ref(false)
const allProjectsLoaded = ref(false)
const bidsLoaded = ref(false)

// New function to load data based on active tab
const loadTabData = async (tab) => {
  try {
    const schoolId = userStore.currentUser.school
    
    let userId = userStore.currentUser.id || 
                 userStore.currentUser.uid || 
                 userStore.currentUser._id || 
                 userStore.currentUser.userId
    
    if (!userId) {
      userId = "unknown-user-" + Date.now()
    }
    
    // Call fetchSettings to ensure we load all necessary data
    await fetchSettings()
    
    // Load specific data based on active tab
    if (tab === 'myProjects') {
      // Only load if not already loaded
      if (!myProjectsLoaded.value) {
        myProjectsLoading.value = true
        // Clear current data
        projects.value = []
        await fetchUserProjects(schoolId, userId, selectedAcademicYear.value)
        myProjectsLoaded.value = true
        myProjectsLoading.value = false
      }
    } else if (tab === 'allProjects') {
      // Only load if not already loaded
      if (!allProjectsLoaded.value) {
        allProjectsLoading.value = true
        // Clear current data
        allProjects.value = []
        await fetchAllProjects()
        allProjectsLoaded.value = true
        allProjectsLoading.value = false
      }
    } else if (tab === 'bids') {
      // Only load if not already loaded
      if (!bidsLoaded.value) {
        bidsLoading.value = true
        // Clear current data
        projectBids.value = []
        await fetchProjectBids()
        await setupAllBidsListeners()
        bidsLoaded.value = true
        bidsLoading.value = false
      }
    }
  } catch (error) {
    console.error('Error loading tab data:', error)
    showToast('Failed to load data for this tab', 'error')
    
    // Make sure to reset loading states on error
    myProjectsLoading.value = false
    allProjectsLoading.value = false
    bidsLoading.value = false
  }
}

// New function to fetch only basic settings without all project data
const fetchBasicSettings = async () => {
  try {
    const schoolId = userStore.currentUser.school
    
    const yearData = {
      yearId: selectedAcademicYear.value,
      academicYear: formatAcademicYear(selectedAcademicYear.value)
    }
    
    if (!yearData.yearId) {
      return
    }

    // Clear project settings but not project data (will be loaded per tab)
    projectSettings.value = null
    
    // Get all available majors
    const projectsRef = doc(db, 'schools', schoolId, 'projects', yearData.yearId)
    const projectsDoc = await getDoc(projectsRef)
    
    if (projectsDoc.exists() && projectsDoc.data().majors && projectsDoc.data().majors.length > 0) {
      availableMajors.value = projectsDoc.data().majors
      
      if (userStore.currentUser.role === 'lecturer' && userStore.currentUser.major) {
        selectedMajor.value = userStore.currentUser.major
      } else {
        selectedMajor.value = projectsDoc.data().majors[0]
      }
    }
    
    if (!selectedMajor.value) {
      return
    }
    
    // Get project settings for the selected major
    const majorRef = collection(db, 'schools', schoolId, 'projects', yearData.yearId, selectedMajor.value)
    const majorDocs = await getDocs(majorRef)
    
    if (!majorDocs.empty) {
      const majorDoc = majorDocs.docs[0]
      const majorData = majorDoc.data()
      
      projectSettings.value = {
        headers: majorData.headers || {},
        milestones: majorData.milestones || []
      }
      
      if (majorData.headers) {
        Object.keys(majorData.headers).forEach(headerName => {
          newProject.value[headerName] = ''
        })
      }
    }
    
    // Try to load settings from first project major if needed
    if (!projectSettings.value && projects.value.length > 0) {
      const firstProjectMajor = projects.value[0].major
      const majorRef = collection(db, 'schools', schoolId, 'projects', yearData.yearId, firstProjectMajor)
      const majorDocs = await getDocs(majorRef)
      
      if (!majorDocs.empty) {
        const majorDoc = majorDocs.docs[0]
        const majorData = majorDoc.data()
        
        projectSettings.value = {
          headers: majorData.headers || {},
          milestones: majorData.milestones || []
        }
        
        selectedMajor.value = firstProjectMajor
      }
    }
  } catch (error) {
    console.error('Error fetching basic settings:', error)
    showToast('Failed to load settings', 'error')
  }
}

// Add new state for bids
const projectBiddingMilestone = ref(null)
const milestoneLoading = ref(false)
const currentMajorId = ref(null)
const currentMajorDocId = ref(null)

// Add new method to fetch bidding milestone
const fetchBiddingMilestone = async () => {
  try {
    milestoneLoading.value = true
    const schoolId = userStore.currentUser.school
    
    // Get user's major ID
    currentMajorId.value = userStore.currentUser.major
    
    // Find the major document
    const majorRef = collection(db, 'schools', schoolId, 'projects', selectedAcademicYear.value, currentMajorId.value)
    const majorDocs = await getDocs(majorRef)
    
    if (!majorDocs.empty) {
      currentMajorDocId.value = majorDocs.docs[0].id
      
      // Ensure the milestone has completed field
      await ensureBiddingMilestoneHasCompletedField(
        schoolId,
        selectedAcademicYear.value,
        currentMajorId.value,
        currentMajorDocId.value
      )
      
      // Get the milestone
      const milestone = await getMilestone(
        schoolId,
        selectedAcademicYear.value,
        currentMajorId.value,
        currentMajorDocId.value,
        "Project Bidding Done"
      )
      
      projectBiddingMilestone.value = milestone
    }
  } catch (error) {
    console.error('Error fetching bidding milestone:', error)
  } finally {
    milestoneLoading.value = false
  }
}

// Modify existing onMounted
onMounted(async () => {
  await fetchAvailableYears()
  await loadTabData(activeTab.value)
  await fetchBiddingMilestone()
})

// Add watcher for selectedAcademicYear
watch(selectedAcademicYear, async (newYear) => {
  if (newYear) {
    latestAcademicYear.value = formatAcademicYear(newYear)
    latestAcademicYearId.value = newYear
    
    // Reset the loaded flags
    myProjectsLoaded.value = false
    allProjectsLoaded.value = false
    bidsLoaded.value = false
    
    // Reload data
    await loadTabData(activeTab.value)
    await fetchBiddingMilestone()
  }
})
</script>

<style scoped>
/* No custom styles needed as we're using Tailwind classes */
</style> 
