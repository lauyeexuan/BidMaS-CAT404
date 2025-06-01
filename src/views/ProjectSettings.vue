<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-6 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Project Settings</h1>
        <button 
          v-if="existingSettings.length > 0"
          @click="showNewSettingsForm = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Project Setting
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-lg p-8 flex justify-center items-center">
        <p class="text-gray-600">Loading project settings...</p>
      </div>

      <!-- No Settings Found -->
      <div v-else-if="existingSettings.length === 0" class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center">
          <p class="text-gray-600 mb-4">No project settings found. Configure your first project setting.</p>
          <button 
            @click="showNewSettingsForm = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Configure Project Setting
          </button>
        </div>
      </div>

      <!-- Existing Settings List -->
      <div v-else-if="!showNewSettingsForm" class="space-y-6" >      
        
          <div v-for="setting in existingSettings" :key="setting.academicYear" class="border rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-medium text-gray-900">Academic Year: 20{{ setting.academicYear.slice(0,2) }}/20{{ setting.academicYear.slice(2) }}</h3>
              <div class="flex gap-2">
                <button 
                  @click="editSetting(setting)"
                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button 
                  @click="() => {
                    selectedAcademicYear = setting.academicYear;
                    showAddMajorModal = true;
                  }"
                  class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Major
                </button>
              </div>
            </div>
            
            <!-- Add checkbox if there are multiple majors -->
            <div v-if="setting.majors.length > 1" class="mb-4">
              <label class="inline-flex items-center">
                <input 
                  type="checkbox" 
                  v-model="applyToAllMajorsMap[setting.academicYear]"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-600">Apply same project settings to all majors</span>
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="major in setting.majors" :key="major.name" 
                   class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-medium text-gray-900">{{ major.name }}</h4>
                  <button 
                    @click="confirmDelete(major.name, setting.academicYear)"
                    class="text-red-600 hover:text-red-800"
                    title="Delete major"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <!-- Configuration Status -->
                <div class="mt-3 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Project Headers:</span>
                    <span 
                      :class="[
                        'text-xs px-2 py-1 rounded-full',
                        major.docId && major.headers && Object.keys(major.headers).length > 2
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ major.docId && major.headers && Object.keys(major.headers).length > 2 ? 'Configured' : 'Not Configured' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Project Milestones:</span>
                    <span 
                      :class="[
                        'text-xs px-2 py-1 rounded-full',
                        major.docId && major.milestones && major.milestones.length > 1
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ major.docId && major.milestones && major.milestones.length > 1 ? 'Configured' : 'Not Configured' }}
                    </span>
                  </div>
                </div>
                
                <div class="mt-4">
                  <button 
                    @click="openHeadersModal(major, setting.academicYear)"
                    :class="[
                      'w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200',
                      isConfigurationComplete(major)
                        ? 'text-white bg-teal-500 hover:bg-teal-600 focus:ring-teal-400 shadow-sm hover:shadow'
                        : 'text-white bg-rose-400 hover:bg-red-100 focus:ring-rose-400 font-semibold shadow-sm hover:shadow'
                    ]"
                  >
                    <span class="flex items-center justify-center gap-2">
                      <svg v-if="isConfigurationComplete(major)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {{ isConfigurationComplete(major) ? 'View Project Settings' : '⚠️ Incomplete Settings' }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        
        
        <!-- Load Previous Years Button -->
        <div v-if="!allYearsLoaded && existingSettings.length > 0" class="mt-6 flex justify-center">
          <button 
            @click="() => {
              console.log('Fetching all settings...');
              fetchSettings(true);
            }"
            class="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loadingPreviousYears"
          >
            <span v-if="loadingPreviousYears">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
            <span v-else>Load Previous Academic Years</span>
          </button>
        </div>
      </div>

      <!-- New Settings Form -->
      <div v-if="showNewSettingsForm" class="bg-white rounded-lg shadow-lg p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900">New Project Setting</h2>
          <button 
            @click="showNewSettingsForm = false"
            class="text-gray-600 hover:text-gray-900"
          >
            ← Back to List
          </button>
        </div>

        <!-- Top Section with Academic Year and Fields Configuration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <!-- Academic Year Section -->
          <div>
            <label class="block mb-4 text-sm font-medium text-gray-900">Current Academic Year:</label>
            
            <!-- Modern Year Selector Component -->
            <div class="relative w-48 mx-auto">
              <!-- Year Display and Format -->
              <div class="mb-3 text-center">
                <span class="text-lg font-medium text-blue-600">{{ academicYear.start }}/{{ academicYear.end }}</span>
              </div>
              
              <!-- Vertical Year Selector -->
              <div 
                class="relative border border-gray-300 rounded-lg bg-white shadow-md overflow-hidden h-32 cursor-ns-resize hover:border-blue-300 transition-all"
                @wheel="handleYearWheel"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              >
                <!-- Gradient overlays for fading effect -->
                <div class="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                <div class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                
                <!-- Selection Indicator - Fixed at center of container -->
                <div class="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-9 bg-blue-100 bg-opacity-50 border-y border-blue-200 pointer-events-none"></div>
                
                <!-- Year elements container -->
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <!-- Previous Year - Above selected -->
                  <div class="py-2 w-full text-center text-gray-500 -translate-y-9 transition-all duration-200"
                       :style="{ transform: `translateY(${-9 + yearSelectorOffset}px)` }">
                    {{ selectedYear - 1 }}
                  </div>
                  
                  <!-- Current Year - In the middle (aligned with highlight) -->
                  <div class="py-2 w-full text-center text-lg font-bold text-blue-600 transition-all duration-200"
                       :style="{ transform: `translateY(${0 + yearSelectorOffset}px)` }">
                    {{ selectedYear }}
                  </div>
                  
                  <!-- Next Year - Below selected -->
                  <div class="py-2 w-full text-center text-gray-500 translate-y-9 transition-all duration-200"
                       :style="{ transform: `translateY(${9 + yearSelectorOffset}px)` }">
                    {{ selectedYear + 1 }}
                  </div>
                </div>
              </div>
              
              <!-- Year Range Information & Controls -->
              <div class="mt-3 flex justify-between items-center">
                <span class="text-xs text-gray-500">2000-2050</span>
                <div class="flex gap-2">
                  <button 
                    @click="decrementYear" 
                    class="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                    :disabled="selectedYear <= MIN_YEAR"
                    :class="{'opacity-50 cursor-not-allowed': selectedYear <= MIN_YEAR}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    @click="incrementYear" 
                    class="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                    :disabled="selectedYear >= MAX_YEAR"
                    :class="{'opacity-50 cursor-not-allowed': selectedYear >= MAX_YEAR}"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="yearError" class="mt-1 text-sm text-red-500">{{ yearError }}</p>
            </div>
          </div>

          <!-- Fields Configuration Section -->
          <div>
            <label for="numFields" class="block mb-4 text-sm font-medium text-gray-900">Number of Major Fields:</label>
            <input 
              type="number" 
              id="numFields" 
              v-model="numFields" 
              min="1"
              @change="updateFields"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2.5"
            >
          </div>
        </div>

        <!-- Field Details Section -->
        <div v-if="numFields > 0" class="mb-12">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Field Details</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            <div v-for="(field, index) in fields" :key="index" 
                 class="p-6 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors bg-gray-50">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Field {{ index + 1 }}</h3>
              <div class="space-y-4">
                <div>
                  <label :for="'name-' + index" class="block mb-2 text-sm font-medium text-gray-900">
                    Field Name:
                  </label>
                  <input 
                    type="text" 
                    :id="'name-' + index"
                    v-model="field.name"
                    placeholder="Enter field name"
                    class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-8 border-t border-gray-200">
          <button 
            @click="saveSettings" 
            :disabled="!isValid"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container" class="fixed top-5 right-5 z-50"></div>

    <!-- Headers Modal -->
    <TransitionRoot appear :show="showHeadersModal" as="template">
      <Dialog as="div" @close="showHeadersModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  <div class="flex space-x-6 border-b border-gray-200">
                    <button 
                      @click="activeTab = 'headers'"
                      class="py-2 px-1 -mb-px flex items-center gap-2"
                      :class="activeTab === 'headers' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                    >
                      Project Headers
                      <span 
                        v-if="currentHeaders.filter(h => !h.required).length > 0" 
                        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        ✓
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                      >
                        !
                      </span>
                    </button>
                    <button 
                      @click="activeTab = 'milestones'"
                      class="py-2 px-1 -mb-px flex items-center gap-2"
                      :class="activeTab === 'milestones' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
                    >
                      Project Milestones
                      <span 
                        v-if="currentMilestones.length > 1 && currentMilestones.find(m => m.description === 'Project Bidding')?.deadline" 
                        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        ✓
                      </span>
                      <span 
                        v-else 
                        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                      >
                        !
                      </span>
                    </button>
                  </div>
                  
                  <!-- Reminder message -->
                  <div 
                    v-if="(currentHeaders.filter(h => !h.required).length === 0) || 
                         (currentMilestones.length <= 1 || !currentMilestones.find(m => m.description === 'Project Bidding')?.deadline)"
                    class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                  >
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">Incomplete Configuration</h3>
                        <div class="mt-2 text-sm text-yellow-700">
                          <p>
                            Please complete both Project Headers and Project Milestones configuration. 
                            {{ currentHeaders.filter(h => !h.required).length === 0 ? 'Additional Project Headers are needed.' : '' }}
                            {{ !currentMilestones.find(m => m.description === 'Project Bidding')?.deadline ? 'Project Bidding milestone requires a deadline date.' : '' }}
                            {{ currentMilestones.length <= 1 && currentMilestones.find(m => m.description === 'Project Bidding')?.deadline ? 'Additional Project Milestones are recommended.' : '' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogTitle>

                <!-- Project Headers Tab Content -->
                <div v-if="activeTab === 'headers'">
                  <!-- Existing Headers List -->
                  <div v-if="currentHeaders.length > 0" class="mb-8 border-b pb-6">
                    <h4 class="font-medium text-gray-700 mb-4 text-lg flex items-center">
                      <span class="mr-2">Current Headers</span>
                      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ currentHeaders.length }}</span>
                    </h4>
                    <div class="space-y-4">
                      <div v-for="(header, index) in currentHeaders" :key="index" 
                           class="flex items-start justify-between p-4 bg-gray-50 rounded-lg border"
                           :class="[header.required ? 'border-blue-200 bg-blue-50' : 'border-gray-200']">
                        <div>
                          <div class="flex items-center gap-2">
                            <p class="font-medium text-gray-900">{{ header.name }}</p>
                            <span v-if="header.required" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Required</span>
                          </div>
                          <div v-if="header.type === 'array'" class="mt-2">
                            <div class="flex flex-wrap gap-2">
                              <span 
                                v-for="value in header.values" 
                                :key="value" 
                                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {{ value }}
                              </span>
                            </div>
                          </div>
                          <div v-else-if="header.type === 'label'" class="mt-1">
                            <span class="text-sm text-gray-500 italic">Label field</span>
                          </div>
                          <div v-else class="mt-1">
                            <span class="text-sm text-gray-500 italic">Free text input</span>
                          </div>
                        </div>
                        <button 
                          v-if="!header.required"
                          @click="removeHeader(index)"
                          class="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Add New Header Form -->
                  <div class="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h4 class="font-medium text-gray-700 mb-4 text-lg">Add New Header</h4>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Header Name</label>
                      <input 
                        type="text" 
                        v-model="newHeader.name"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter header name"
                      >
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Type</label>
                      <select 
                        v-model="newHeader.type"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="string">Text</option>
                        <option value="array">Predefined Options</option>
                        <option value="label">Label</option>
                      </select>
                    </div>

                    <!-- Values input for predefined options -->
                    <div v-if="newHeader.type === 'array'" class="space-y-4">
                      <div class="flex gap-2">
                        <input 
                          type="text" 
                          v-model="tempValue"
                          @keyup.enter="addValue"
                          class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Enter a value"
                        >
                        <button 
                          @click="addValue"
                          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>

                      <div v-if="newHeader.values.length > 0" class="space-y-2">
                        <div v-for="(value, index) in newHeader.values" :key="index"
                             class="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span>{{ value }}</span>
                          <button 
                            @click="removeValue(index)"
                            class="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      @click="addHeader"
                      class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Header
                    </button>
                  </div>
                </div>

                <!-- Project Milestones Tab Content -->
                <div v-if="activeTab === 'milestones'" class="py-4">
                  <!-- Existing Milestones List -->
                  <div v-if="currentMilestones.length > 0" class="mb-8 border-b pb-6">
                    <h4 class="font-medium text-gray-700 mb-4 text-lg flex items-center">
                      <span class="mr-2">Current Milestones</span>
                      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ currentMilestones.length }}</span>
                    </h4>
                    <div class="space-y-4">
                      <div v-for="(milestone, index) in currentMilestones" :key="index" 
                           class="flex items-start justify-between p-4 bg-gray-50 rounded-lg border"
                           :class="[milestone.required ? 'border-blue-200 bg-blue-50' : 'border-gray-200']">
                        <div class="w-full">
                          <div class="flex items-center gap-2">
                            <p class="font-medium text-gray-900">{{ milestone.description }}</p>
                            <span v-if="milestone.required" class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Required</span>
                          </div>
                          
                          <!-- Date input and weightage for all milestones -->
                          <div class="mt-3 flex items-center flex-wrap gap-4">
                            <div class="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                              </svg>
                              <input 
                                type="date" 
                                v-model="milestone.deadline"
                                @change="(e) => console.log('Date changed for', milestone.description, '- New value:', e.target.value, 'v-model value:', milestone.deadline)"
                                class="ml-1 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                :class="{'border-red-500 bg-red-50': milestone.required && !milestone.deadline}"
                              >
                              <span v-if="milestone.required && !milestone.deadline" class="ml-2 text-red-500 text-xs font-medium">
                                Date required
                              </span>
                              <span v-else-if="milestone.deadline" class="ml-2 text-xs text-gray-500">
                                {{ formatDate(milestone.deadline) }}
                              </span>
                            </div>
                            
                            <!-- Only show weightage if not Project Bidding -->
                            <div v-if="milestone.description !== 'Project Bidding'" class="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                <path d="M12 2.252A8 8 0 0112 18.251v-8H4.252a8 8 0 018-8z" />
                              </svg>
                              <input 
                                type="number" 
                                v-model="milestone.weightage"
                                min="1"
                                max="100"
                                class="ml-1 w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                :class="{'border-red-500 bg-red-50': !isWeightageValid(milestone.weightage)}"
                              >
                              <span class="ml-1 text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          v-if="!milestone.required"
                          @click="removeMilestone(index)"
                          class="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Add New Milestone Form -->
                  <div class="space-y-4 bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h4 class="font-medium text-gray-700 mb-4 text-lg">Add New Milestone</h4>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Milestone Description</label>
                      <input 
                        type="text" 
                        v-model="newMilestone.description"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., Submit Proposal"
                      >
                    </div>
                    
                    <div class="flex gap-4">
                      <div class="w-48">
                        <label class="block text-sm font-medium text-gray-700">Deadline</label>
                        <div class="relative w-full">
                          <input 
                            type="date" 
                            v-model="newMilestone.deadline"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-2"
                            placeholder="mm/dd/yyyy"
                          >
                        </div>
                      </div>

                      <div class="w-32">
                        <label class="block text-sm font-medium text-gray-700">Weightage</label>
                        <div class="relative w-full flex items-center mt-1">
                          <input 
                            type="number" 
                            v-model="newMilestone.weightage"
                            min="1"
                            max="100"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-8"
                            placeholder="1-100"
                          >
                          <span class="absolute right-3 text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      @click="addMilestone"
                      class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      :disabled="!newMilestone.description || !newMilestone.deadline || !newMilestone.weightage || newMilestone.weightage < 1 || newMilestone.weightage > 100"
                    >
                      Add Milestone
                    </button>
                  </div>
                </div>

                <div class="mt-8 flex justify-end gap-4">
                  <button 
                    @click="showHeadersModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="activeTab === 'headers' ? saveHeaders() : saveMilestones()"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {{ activeTab === 'headers' ? 'Save Headers' : 'Save Milestones' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Add Major Modal -->
    <TransitionRoot appear :show="showAddMajorModal" as="template">
      <Dialog as="div" @close="showAddMajorModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Add New Major Field
                </DialogTitle>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Major Name</label>
                    <input 
                      type="text" 
                      v-model="newMajorName"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter major name"
                    >
                  </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button 
                    @click="showAddMajorModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="addMajorToExisting(selectedAcademicYear)"
                    :disabled="!newMajorName"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Major
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Delete Confirmation Modal -->
    <TransitionRoot appear :show="showDeleteConfirmModal" as="template">
      <Dialog as="div" @close="showDeleteConfirmModal = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Confirm Deletion
                </DialogTitle>

                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete the major "{{ majorToDelete?.name }}"? This action cannot be undone.
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    All project headers and settings for this major will be permanently deleted.
                  </p>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                  <button 
                    @click="showDeleteConfirmModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="handleDeleteConfirm"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete Major
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted, defineAsyncComponent, watch } from 'vue'
import { db } from '@/firebase'
import { doc, collection, setDoc, getDocs, query, getDoc, updateDoc, deleteDoc, Timestamp, where, limit, addDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/userStore'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import notificationService from '@/services/notificationService'

// Lazy load the modals using defineAsyncComponent
const Dialog = defineAsyncComponent(() => import('@headlessui/vue').then(module => module.Dialog))
const DialogPanel = defineAsyncComponent(() => import('@headlessui/vue').then(module => module.DialogPanel))
const DialogTitle = defineAsyncComponent(() => import('@headlessui/vue').then(module => module.DialogTitle))
const TransitionChild = defineAsyncComponent(() => import('@headlessui/vue').then(module => module.TransitionChild))
const TransitionRoot = defineAsyncComponent(() => import('@headlessui/vue').then(module => module.TransitionRoot))

const userStore = useUserStore()
const loading = ref(true)
const loadingPreviousYears = ref(false)
const showNewSettingsForm = ref(false)
const existingSettings = ref([])
const allYearsLoaded = ref(false)

// Helper function to format dates consistently
const formatDate = (dateString) => {
  if (!dateString) return 'No date set';
  
  try {
    // Parse the date string (YYYY-MM-DD) into parts
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create a date object with UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Format the date using toLocaleDateString with explicit options
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Use UTC to avoid timezone shifts
    });
  } catch (error) {
    return dateString || 'No date set';
  }
};

// Add these refs after other refs
const showHeadersModal = ref(false)
const currentMajor = ref(null)
const currentHeaders = ref([])
const newHeader = ref({ name: '', type: 'string', values: [] })
const tempValue = ref('')
const isEditMode = ref(false)

// Replace the single applyToAllMajors ref with a map
const applyToAllMajorsMap = ref({})

// Add these refs after other modal refs
const showDeleteConfirmModal = ref(false)
const majorToDelete = ref(null)

// Add new refs for managing majors
const showAddMajorModal = ref(false)
const newMajorName = ref('')
const selectedAcademicYear = ref('')

// Add new refs for managing active tab
const activeTab = ref('headers')

// Add new refs for managing milestones
const currentMilestones = ref([])
const newMilestone = ref({
  description: '',
  deadline: '',
  weightage: 50 // Default weightage of 50%
})
const milestoneCount = ref(0)

// Year selector refs
const selectedYear = ref(new Date().getFullYear());
const yearSelectorOffset = ref(0);
const touchStartY = ref(0);
const MIN_YEAR = 2000;
const MAX_YEAR = 2050;

// Update academicYear whenever selectedYear changes
watch(selectedYear, (newYear) => {
  academicYear.value = {
    start: newYear,
    end: newYear + 1
  };
  validateAcademicYear();
});

// Load initial data and set up the component
onMounted(() => {
  // Fetch settings data
  fetchSettings(false);
  
  // Initialize year selector with current year
  const currentYear = new Date().getFullYear();
  selectedYear.value = currentYear;
  academicYear.value = {
    start: currentYear,
    end: currentYear + 1
  };
});

// Year selector interaction methods
const handleYearWheel = (event) => {
  // Prevent default to avoid page scrolling
  event.preventDefault();
  
  // Scroll up (negative deltaY) increases the year
  // Scroll down (positive deltaY) decreases the year
  if (event.deltaY < 0) {
    incrementYear();
  } else {
    decrementYear();
  }
};

const handleTouchStart = (event) => {
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchMove = (event) => {
  const currentY = event.touches[0].clientY;
  const diffY = currentY - touchStartY.value;
  
  // Create a dragging effect while moving
  yearSelectorOffset.value = diffY * 0.5;
};

const handleTouchEnd = (event) => {
  const currentY = event.changedTouches[0].clientY;
  const diffY = currentY - touchStartY.value;
  
  // Reset the offset animation
  yearSelectorOffset.value = 0;
  
  // If the swipe was significant enough, change the year
  if (Math.abs(diffY) > 20) {
    if (diffY > 0) {
      // Swiped down, decrease year
      decrementYear();
    } else {
      // Swiped up, increase year
      incrementYear();
    }
  }
};

const incrementYear = () => {
  if (selectedYear.value < MAX_YEAR) {
    selectedYear.value++;
  }
};

const decrementYear = () => {
  if (selectedYear.value > MIN_YEAR) {
    selectedYear.value--;
  }
};

// Modified function to fetch only the most recent academic year initially
const fetchSettings = async (fetchAll = false) => {
  try {
    console.log('fetchSettings called with fetchAll:', fetchAll);
    console.log('Current state:', {
      allYearsLoaded: allYearsLoaded.value,
      existingSettingsLength: existingSettings.value.length
    });

    if (!fetchAll && !allYearsLoaded.value && existingSettings.value.length > 0) {
      console.log('Skipping fetch - already have current year data');
      return;
    }
    
    if (!fetchAll || existingSettings.value.length === 0) {
      loading.value = true;
    } else {
      loadingPreviousYears.value = true;
    }
    
    const schoolId = userStore.currentUser.school;
    const projectsRef = collection(db, 'schools', schoolId, 'projects');
    
    if (fetchAll && existingSettings.value.length > 0) {
      console.log('Loading previous years only');
      const projectsSnapshot = await getDocs(query(projectsRef));
      
      const existingYearIds = existingSettings.value.map(s => s.academicYear);
      const additionalYearDocs = projectsSnapshot.docs.filter(doc => 
        !existingYearIds.includes(doc.id)
      );
      
      if (additionalYearDocs.length === 0) {
        console.log('No additional years found');
        allYearsLoaded.value = true;
        loadingPreviousYears.value = false;
        return;
      }
      
      const additionalYearsPromises = additionalYearDocs.map(async (projectDoc) => {
        const academicYear = projectDoc.id;
        const yearData = projectDoc.data();
        const majorNames = yearData.majors || [];
        
        const majorsPromises = majorNames.map(async (majorName) => {
          const majorRef = collection(db, 'schools', schoolId, 'projects', academicYear, majorName);
          const majorDocs = await getDocs(majorRef);
          
          if (majorDocs.docs.length > 0) {
            const majorDoc = majorDocs.docs[0];
            const majorData = majorDoc.data();
            
            return {
              name: majorName,
              docId: majorDoc.id,
              headers: majorData.headers || null,
              milestones: majorData.milestones || null
            };
          }
          return null;
        });
        
        const majors = (await Promise.all(majorsPromises)).filter(Boolean);
        
        return {
          academicYear,
          majors
        };
      });
      
      const additionalYears = await Promise.all(additionalYearsPromises);
      additionalYears.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
      
      const combinedSettings = [...existingSettings.value, ...additionalYears];
      combinedSettings.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
      existingSettings.value = combinedSettings;
      
      allYearsLoaded.value = true;
      loadingPreviousYears.value = false;
      return;
    }
    
    if (!fetchAll && !allYearsLoaded.value) {
      const latestYear = await getLatestAcademicYear(schoolId);
      console.log('Fetching latest academic year:', latestYear?.yearId);
      
      if (latestYear) {
        const latestYearDoc = await getDoc(doc(projectsRef, latestYear.yearId));
        
        if (latestYearDoc.exists()) {
          console.log('Found latest year document');
          const academicYear = latestYearDoc.id;
          const yearData = latestYearDoc.data();
          const majorNames = yearData.majors || [];
          
          const majorsPromises = majorNames.map(async (majorName) => {
            const majorRef = collection(db, 'schools', schoolId, 'projects', academicYear, majorName);
            const majorDocs = await getDocs(majorRef);
            
            if (majorDocs.docs.length > 0) {
              const majorDoc = majorDocs.docs[0];
              const majorData = majorDoc.data();
              
              return {
                name: majorName,
                docId: majorDoc.id,
                headers: majorData.headers || null,
                milestones: majorData.milestones || null
              };
            }
            return null;
          });
          
          const majors = (await Promise.all(majorsPromises)).filter(Boolean);
          
          existingSettings.value = [{
            academicYear,
            majors
          }];
          
          allYearsLoaded.value = false;
          console.log('Latest year loaded, allYearsLoaded set to false');
          loading.value = false;
          return;
        }
      }
      console.log('Latest year document not found or no academic years exist');
    }
    
    console.log('Fetching all academic years');
    const projectsSnapshot = await getDocs(query(projectsRef));
    
    const academicYearsPromises = projectsSnapshot.docs.map(async (projectDoc) => {
      const academicYear = projectDoc.id;
      const yearData = projectDoc.data();
      const majorNames = yearData.majors || [];
      
      const majorsPromises = majorNames.map(async (majorName) => {
        const majorRef = collection(db, 'schools', schoolId, 'projects', academicYear, majorName);
        const majorDocs = await getDocs(majorRef);
        
        if (majorDocs.docs.length > 0) {
          const majorDoc = majorDocs.docs[0];
          const majorData = majorDoc.data();
          
          return {
            name: majorName,
            docId: majorDoc.id,
            headers: majorData.headers || null,
            milestones: majorData.milestones || null
          };
        }
        return null;
      });
      
      const majors = (await Promise.all(majorsPromises)).filter(Boolean);
      
      return {
        academicYear,
        majors
      };
    });
    
    const settings = await Promise.all(academicYearsPromises);
    settings.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
    existingSettings.value = settings;
    allYearsLoaded.value = true;
  } catch (error) {
    console.error('Error fetching project settings:', error);
    showToast('Failed to fetch project settings', 'error');
  } finally {
    loading.value = false;
    loadingPreviousYears.value = false;
  }
};

const academicYear = ref({
  start: '',
  end: ''
})
  
const yearError = ref('')
  
const validateAcademicYear = () => {
  const start = parseInt(academicYear.value.start)
  const end = parseInt(academicYear.value.end)
  
  if (!start || !end) {
    yearError.value = ''
    return
  }

  if (end !== start + 1) {
    yearError.value = 'End year must be one year after start year'
  } else {
    yearError.value = ''
  }
}
  
const numFields = ref(0)
const fields = ref([])
  
const updateFields = () => {
  const newFields = []
  for (let i = 0; i < numFields.value; i++) {
    newFields[i] = fields.value[i] || { name: '' }
  }
  fields.value = newFields
}
  
const isValid = computed(() => {
  const isAcademicYearValid = 
    academicYear.value.start && 
    academicYear.value.end && 
    parseInt(academicYear.value.end) === parseInt(academicYear.value.start) + 1 &&
    !yearError.value

  return isAcademicYearValid &&
         numFields.value > 0 && 
         fields.value.length === numFields.value &&
         fields.value.every(field => field.name.trim() !== '')
})
  
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div')
  toast.className = 'flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow ' + 
    (type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500')
  
  const icon = document.createElement('div')
  icon.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ' + 
    (type === 'success' ? 'text-green-500' : 'text-red-500')
  
  // Use simpler SVG icons to avoid string escaping issues
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
  
const saveSettings = async () => {
  try {
    const schoolId = userStore.currentUser.school;
    
    // Format academic year for document ID
    const yearStart = academicYear.value.start.toString().slice(-2);
    const yearEnd = academicYear.value.end.toString().slice(-2);
    const academicYearId = yearStart + yearEnd;
    
    // Get existing settings for this academic year if any
    const projectsRef = doc(db, 'schools', schoolId, 'projects', academicYearId);
    const existingDoc = await getDoc(projectsRef);
    const existingMajors = existingDoc.exists() ? existingDoc.data().majors : [];

    // Create or update the academic year document
    await setDoc(projectsRef, {
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : new Date(),
      academicYear: `${academicYear.value.start}/${academicYear.value.end}`,
      majors: fields.value.map(f => f.name)
    }, { merge: true });

    // Handle majors that need to be removed (in case of edit)
    if (existingDoc.exists()) {
      const removedMajors = existingMajors.filter(
        existingMajor => !fields.value.find(f => f.name === existingMajor)
      );
      
      // Delete removed majors' subcollections in parallel
      if (removedMajors.length > 0) {
        const deletePromises = removedMajors.map(async (majorName) => {
          const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId, majorName);
          const majorDocs = await getDocs(majorRef);
          const docDeletePromises = majorDocs.docs.map(doc => deleteDoc(doc.ref));
          return Promise.all(docDeletePromises);
        });
        
        await Promise.all(deletePromises);
      }
    }

    // Create each major's document in parallel
    const updatePromises = fields.value.map(async (field) => {
      const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId, field.name);
      
      // Check if major already has documents
      const existingMajorDocs = await getDocs(majorRef);
      
      if (existingMajorDocs.empty) {
        // Create new document for new major
        const docRef = doc(majorRef);
        return setDoc(docRef, {});
      }
    });
    
    await Promise.all(updatePromises);
    
    // Refresh the settings data
    await fetchSettings(allYearsLoaded.value);
    showNewSettingsForm.value = false;
    showToast('Project settings saved successfully');
  } catch (error) {
    console.error('Error saving project settings:', error);
    showToast('Failed to save project settings', 'error');
  }
};

const openHeadersModal = async (major, academicYear) => {
  currentMajor.value = { ...major, academicYear }
  
  try {
    const majorRef = doc(db, 'schools', userStore.currentUser.school, 'projects', academicYear, major.name, major.docId || 'default')
    const majorDoc = await getDoc(majorRef)
    
    if (majorDoc.exists()) {
      const data = majorDoc.data()
      
      // Load headers if they exist
      if (data.headers) {
        currentHeaders.value = Object.entries(data.headers).map(([name, config]) => ({
          name,
          type: config.type,
          values: config.values || [],
          required: name === 'Title' || name === 'Description' // Mark both Title and Description as required
        }))
        // Add Title and Description headers if they don't exist
        if (!currentHeaders.value.find(h => h.name === 'Title')) {
          currentHeaders.value.unshift({
            name: 'Title',
            type: 'string',
            values: null,
            required: true
          })
        }
        if (!currentHeaders.value.find(h => h.name === 'Description')) {
          currentHeaders.value.push({
            name: 'Description',
            type: 'string',
            values: null,
            required: true
          })
        }
        isEditMode.value = true
      } else {
        // Initialize with mandatory Title and Description headers
        currentHeaders.value = [
          {
            name: 'Title',
            type: 'string',
            values: null,
            required: true
          },
          {
            name: 'Description',
            type: 'string',
            values: null,
            required: true
          }
        ]
        isEditMode.value = false
      }
      
      // Load milestones if they exist
      if (data.milestones && Array.isArray(data.milestones)) {
        currentMilestones.value = data.milestones.map(m => {
          // Handle different types of date objects that might come from Firestore
          let dateString = '';
          
          if (m.deadline) {
            // Convert any Firestore timestamp to YYYY-MM-DD format
            if (m.deadline instanceof Date) {
              const year = m.deadline.getFullYear();
              const month = String(m.deadline.getMonth() + 1).padStart(2, '0');
              const day = String(m.deadline.getDate()).padStart(2, '0');
              dateString = `${year}-${month}-${day}`;
            } else if (m.deadline.seconds !== undefined) {
              // If it's a Firestore Timestamp
              const date = new Date(0); // Start with epoch
              date.setUTCSeconds(m.deadline.seconds);
              
              // Format as YYYY-MM-DD using UTC to avoid timezone issues
              const year = date.getUTCFullYear();
              const month = String(date.getUTCMonth() + 1).padStart(2, '0');
              const day = String(date.getUTCDate()).padStart(2, '0');
              dateString = `${year}-${month}-${day}`;
            } else if (typeof m.deadline === 'string') {
              dateString = m.deadline;
            }
          }
          
          return {
            description: m.description,
            deadline: dateString,
            required: m.description === 'Project Bidding', // Mark Project Bidding as required
            completed: m.completed || false,
            weightage: m.weightage || 50 // Default weightage of 50% for existing milestones
          };
        });
        
        // Add Project Bidding milestone if it doesn't exist
        if (!currentMilestones.value.find(m => m.description === 'Project Bidding')) {
          currentMilestones.value.unshift({
            description: 'Project Bidding',
            deadline: '',
            required: true,
            completed: false,
            weightage: 50 // Default weightage for Project Bidding
          });
        }
      } else {
        // Initialize with mandatory Project Bidding milestone
        currentMilestones.value = [{
          description: 'Project Bidding',
          deadline: '',
          required: true,
          completed: false,
          weightage: 50 // Default weightage for Project Bidding
        }];
      }
      
      // Set active tab based on configuration state
      const hasConfiguredHeaders = currentHeaders.value.length > 2 // More than just Title and Description
      const hasConfiguredMilestones = currentMilestones.value.length > 1 && // More than just Project Bidding
                                     currentMilestones.value.find(m => m.description === 'Project Bidding')?.deadline

      // If neither is configured or only milestones are configured, show headers tab
      if (!hasConfiguredHeaders) {
        activeTab.value = 'headers'
      }
      // If headers are configured but milestones aren't, show milestones tab
      else if (hasConfiguredHeaders && !hasConfiguredMilestones) {
        activeTab.value = 'milestones'
      }
      // If both are configured, keep current tab or default to headers
      else {
        activeTab.value = activeTab.value || 'headers'
      }
    } else {
      // For new/unconfigured majors, always start with headers tab
      // Always ensure both Title and Description are initialized
      currentHeaders.value = [
        {
          name: 'Title',
          type: 'string',
          values: null,
          required: true
        },
        {
          name: 'Description',
          type: 'string',
          values: null,
          required: true
        }
      ]
      currentMilestones.value = [{
        description: 'Project Bidding',
        deadline: '',
        required: true,
        completed: false,
        weightage: 50 // Default weightage for Project Bidding
      }]
      isEditMode.value = false
      activeTab.value = 'headers'
    }
    showHeadersModal.value = true
  } catch (error) {
    console.error('Error opening headers modal:', error)
    showToast('Failed to load project settings', 'error')
  }
}

const addValue = () => {
  if (tempValue.value.trim()) {
    newHeader.value.values.push(tempValue.value.trim())
    tempValue.value = ''
  }
}

const removeValue = (index) => {
  newHeader.value.values.splice(index, 1)
}

const addHeader = () => {
  if (newHeader.value.name.trim()) {
    currentHeaders.value.push({
      name: newHeader.value.name,
      type: newHeader.value.type,
      values: newHeader.value.type === 'array' ? [...newHeader.value.values] : 
              newHeader.value.type === 'label' ? [] : null
    })
    newHeader.value = { name: '', type: 'string', values: [] }
    tempValue.value = ''
  }
}

const removeHeader = (index) => {
  currentHeaders.value.splice(index, 1)
}

// After imports, add this helper function to update session storage for AdminDashboard
const updateSessionStorageForMilestones = (schoolId, userId, majorId, milestones) => {
  try {
    if (!userId) return;
    
    console.log(`Updating session storage for major ${majorId}`);
    
    // Create user and major specific key (same format as in AdminDashboard)
    const userMajorKey = `${userId}_${majorId}_milestones`;
    
    // Convert Firestore timestamps to ISO strings before storage
    const processedMilestones = milestones.map(milestone => {
      let deadlineDate;
      
      // Handle all possible date formats
      if (milestone.deadline instanceof Date) {
        deadlineDate = milestone.deadline;
      } else if (milestone.deadline?.toDate) {
        // Firestore Timestamp with toDate method
        deadlineDate = milestone.deadline.toDate();
      } else if (milestone.deadline?.seconds !== undefined) {
        // Firestore Timestamp object as plain object
        deadlineDate = new Date(milestone.deadline.seconds * 1000);
      } else if (typeof milestone.deadline === 'string') {
        // ISO string
        deadlineDate = new Date(milestone.deadline);
      } else {
        // Fallback
        deadlineDate = new Date();
        console.warn('Unknown date format, using current date as fallback');
      }
      
      // Process the milestone to match the AdminDashboard format
      return {
        ...milestone,
        major: majorId,
        deadline: deadlineDate.toISOString(),
        weightage: milestone.weightage || 50 // Ensure weightage is included in session storage
      };
    });
    
    const storageData = {
      milestones: processedMilestones,
      lastUpdated: new Date().getTime()
    };
    
    // First clear any existing data
    sessionStorage.removeItem(userMajorKey);
    
    // Then store the new data
    sessionStorage.setItem(userMajorKey, JSON.stringify(storageData));
    
    console.log(`Session storage updated for major ${majorId} with ${processedMilestones.length} milestones`);
  } catch (err) {
    console.error('Error updating session storage:', err);
  }
};

const saveMilestones = async () => {
  try {
    // Check if Project Bidding milestone has a date
    const biddingMilestone = currentMilestones.value.find(m => m.description === 'Project Bidding')
    if (!biddingMilestone || !biddingMilestone.deadline) {
      showToast('Project Bidding milestone must have a deadline', 'error')
      return
    }

    // Validate weightage for all non-Project Bidding milestones
    const invalidWeightage = currentMilestones.value.find(m => 
      m.description !== 'Project Bidding' && !isWeightageValid(m.weightage)
    )
    if (invalidWeightage) {
      showToast(`Invalid weightage for milestone "${invalidWeightage.description}". Must be between 1 and 100.`, 'error')
      return
    }

    // Get the original milestones for comparison
    let originalMilestones = []
    if (currentMajor.value.docId) {
      const majorRef = doc(
        db, 
        'schools', 
        userStore.currentUser.school, 
        'projects', 
        currentMajor.value.academicYear, 
        currentMajor.value.name, 
        currentMajor.value.docId
      )
      const majorDoc = await getDoc(majorRef)
      if (majorDoc.exists()) {
        originalMilestones = majorDoc.data().milestones || []
      }
    }
    
    // Filter out empty milestones but keep required ones
    const milestones = currentMilestones.value
      .filter(m => m.required || (m.description.trim() !== '' && m.deadline))
      .map(m => {
        // Parse the date string (YYYY-MM-DD) into parts
        const [year, month, day] = m.deadline.split('-').map(Number)
        
        // Create a JavaScript Date object with time set to 11:59 PM
        const jsDate = new Date(year, month - 1, day, 23, 59, 59)
        
        return {
          description: m.description.trim(),
          deadline: Timestamp.fromDate(jsDate),
          required: m.required || false,
          completed: m.completed || false,
          // Only include weightage for non-Project Bidding milestones
          ...(m.description !== 'Project Bidding' && { weightage: parseInt(m.weightage) })
        }
      })

    // Use Maps for efficient change detection
    const originalMap = new Map(originalMilestones.map(m => [m.description, m]));
    const newMap = new Map(milestones.map(m => [m.description, m]));
    
    // Added: items in new map but not in original map
    const addedMilestones = milestones.filter(m => !originalMap.has(m.description));
    
    // Removed: items in original map but not in new map
    const removedMilestones = originalMilestones.filter(m => !newMap.has(m.description));
    
    // Modified: items in both maps but with different values
    const modifiedMilestones = milestones.filter(m => {
      const original = originalMap.get(m.description);
      return original && 
             original.deadline && 
             m.deadline && 
             original.deadline.seconds !== m.deadline.seconds;
    });

    // If applying to all majors is checked for this academic year
    if (applyToAllMajorsMap.value[currentMajor.value.academicYear]) {
      const currentSetting = existingSettings.value.find(s => s.academicYear === currentMajor.value.academicYear)
      if (currentSetting) {
        // Save milestones to all majors in parallel
        const savePromises = currentSetting.majors.map(async (major) => {
          const majorRef = doc(
            db, 
            'schools', 
            userStore.currentUser.school, 
            'projects', 
            currentMajor.value.academicYear, 
            major.name, 
            major.docId || 'default'
          )

          // Get existing document data
          const majorDoc = await getDoc(majorRef)
          const existingData = majorDoc.exists() ? majorDoc.data() : {}

          // Update with milestones
          await setDoc(majorRef, { 
            ...existingData,
            milestones
          });

          // Update local state immediately
          const majorIndex = currentSetting.majors.findIndex(m => m.name === major.name)
          if (majorIndex !== -1) {
            currentSetting.majors[majorIndex].milestones = milestones
          }
          
          // Update session storage for AdminDashboard.vue
          updateSessionStorageForMilestones(
            userStore.currentUser.school,
            userStore.currentUser.uid,
            major.name,
            milestones
          );
        });
        
        // Wait for all save operations to complete
        await Promise.all(savePromises);
        
        // Close the modal
        showHeadersModal.value = false;
        
        // Show success message
        showToast('Project milestones saved to all majors successfully');
        
        // Create notifications in the background (non-blocking)
        setTimeout(() => {
          // Handle notifications after UI updates
          currentSetting.majors.forEach(major => {
            notificationService.processNotificationsAsync(
              userStore.currentUser.school,
              currentMajor.value.academicYear,
              major.name,
              addedMilestones,
              removedMilestones,
              modifiedMilestones,
              originalMap
            );
          });
        }, 0);
      }
    } else {
      // Save milestones to just the current major
      const majorRef = doc(
        db, 
        'schools', 
        userStore.currentUser.school, 
        'projects', 
        currentMajor.value.academicYear, 
        currentMajor.value.name, 
        currentMajor.value.docId || 'default'
      )

      // Get existing document data
      const majorDoc = await getDoc(majorRef)
      const existingData = majorDoc.exists() ? majorDoc.data() : {}

      // Update with milestones
      await setDoc(majorRef, { 
        ...existingData,
        milestones
      });

      // Update local state immediately
      const currentSetting = existingSettings.value.find(s => s.academicYear === currentMajor.value.academicYear)
      if (currentSetting) {
        const majorIndex = currentSetting.majors.findIndex(m => m.name === currentMajor.value.name)
        if (majorIndex !== -1) {
          currentSetting.majors[majorIndex].milestones = milestones
        }
      }
      
      // Update session storage for AdminDashboard.vue
      updateSessionStorageForMilestones(
        userStore.currentUser.school,
        userStore.currentUser.uid,
        currentMajor.value.name,
        milestones
      );

      // Close the modal
      showHeadersModal.value = false;
      
      // Show success message
      showToast('Project milestones saved successfully');
      
      // Create notifications in the background (non-blocking)
      setTimeout(() => {
        notificationService.processNotificationsAsync(
          userStore.currentUser.school,
          currentMajor.value.academicYear,
          currentMajor.value.name,
          addedMilestones,
          removedMilestones,
          modifiedMilestones,
          originalMap
        );
      }, 0);
    }
  } catch (error) {
    console.error('Error saving milestones:', error)
    showToast('Failed to save project milestones', 'error')
  }
};

const saveHeaders = async () => {
  try {
    // Convert headers array to object format for Firestore
    const headers = {}
    currentHeaders.value.forEach(header => {
      headers[header.name] = {
        type: header.type === 'label' ? 'array' : header.type,
        values: header.type === 'array' || header.type === 'label' ? header.values || [] : null
      }
    })

    // If applying to all majors is checked for this academic year
    if (applyToAllMajorsMap.value[currentMajor.value.academicYear]) {
      const currentSetting = existingSettings.value.find(s => s.academicYear === currentMajor.value.academicYear)
      if (currentSetting) {
        // Save headers to all majors in parallel
        const savePromises = currentSetting.majors.map(async (major) => {
          const majorRef = doc(
            db, 
            'schools', 
            userStore.currentUser.school, 
            'projects', 
            currentMajor.value.academicYear, 
            major.name, 
            major.docId || 'default'
          )

          // Get existing document data
          const majorDoc = await getDoc(majorRef)
          const existingData = majorDoc.exists() ? majorDoc.data() : {}
          const existingHeaders = existingData.headers || {}

          // Find new headers by comparing with existing headers
          const newHeaders = Object.keys(headers).filter(headerName => 
            !existingHeaders[headerName] && 
            headerName !== 'Title' && 
            headerName !== 'Description'
          )

          // Update with headers
          await setDoc(majorRef, { 
            ...existingData,
            headers
          })

          // Update local state immediately
          const majorIndex = currentSetting.majors.findIndex(m => m.name === major.name)
          if (majorIndex !== -1) {
            currentSetting.majors[majorIndex].headers = headers
          }

          // Only create notification if there are new headers
          if (newHeaders.length > 0) {
            notificationService.createHeaderNotification(
              userStore.currentUser.school,
              currentMajor.value.academicYear,
              major.name,
              'added',
              newHeaders.map(name => ({
                name,
                type: headers[name].type,
                values: headers[name].values
              }))
            ).catch(error => {
              console.error('Error creating header notification:', error);
            });
          }
        })

        // Wait for all save operations to complete
        await Promise.all(savePromises)
        showToast('Project headers saved to all majors successfully')
      }
    } else {
      // Save headers to just the current major
      const majorRef = doc(
        db, 
        'schools', 
        userStore.currentUser.school, 
        'projects', 
        currentMajor.value.academicYear, 
        currentMajor.value.name, 
        currentMajor.value.docId || 'default'
      )

      // Get existing document data
      const majorDoc = await getDoc(majorRef)
      const existingData = majorDoc.exists() ? majorDoc.data() : {}
      const existingHeaders = existingData.headers || {}

      // Find new headers by comparing with existing headers
      const newHeaders = Object.keys(headers).filter(headerName => 
        !existingHeaders[headerName] && 
        headerName !== 'Title' && 
        headerName !== 'Description'
      )

      // Update with headers
      await setDoc(majorRef, { 
        ...existingData,
        headers
      })

      // Update local state immediately
      const currentSetting = existingSettings.value.find(s => s.academicYear === currentMajor.value.academicYear)
      if (currentSetting) {
        const majorIndex = currentSetting.majors.findIndex(m => m.name === currentMajor.value.name)
        if (majorIndex !== -1) {
          currentSetting.majors[majorIndex].headers = headers
        }
      }

      // Only create notification if there are new headers
      if (newHeaders.length > 0) {
        notificationService.createHeaderNotification(
          userStore.currentUser.school,
          currentMajor.value.academicYear,
          currentMajor.value.name,
          'added',
          newHeaders.map(name => ({
            name,
            type: headers[name].type,
            values: headers[name].values
          }))
        );
      }

      showToast('Project headers saved successfully')
    }
    
    // Don't close modal, just switch to milestones tab if headers are saved successfully
    if (currentMilestones.value.length <= 1 || !currentMilestones.value.find(m => m.description === 'Project Bidding')?.deadline) {
      activeTab.value = 'milestones'
      showToast('Please configure project milestones next', 'success')
    } else {
      showHeadersModal.value = false
    }
  } catch (error) {
    console.error('Error saving headers:', error)
    showToast('Failed to save project headers', 'error')
  }
}

const editSetting = (setting) => {
  // Populate the form with existing setting data
  const startYear = parseInt('20' + setting.academicYear.slice(0, 2));
  const endYear = parseInt('20' + setting.academicYear.slice(2));
  
  // Set the selected year in the year selector
  selectedYear.value = startYear;
  
  // This will be automatically updated by the watcher
  academicYear.value = {
    start: startYear,
    end: endYear
  }
  
  numFields.value = setting.majors.length
  fields.value = setting.majors.map(major => ({
    name: major.name
  }))
  showNewSettingsForm.value = true
}

const confirmDelete = (major, academicYear) => {
  majorToDelete.value = { name: major, academicYear }
  showDeleteConfirmModal.value = true
}

const handleDeleteConfirm = async () => {
  try {
    const schoolId = userStore.currentUser.school
    const { name: majorName, academicYear } = majorToDelete.value
    
    // Delete the major's subcollection
    const majorRef = collection(db, 'schools', schoolId, 'projects', academicYear, majorName)
    const majorDocs = await getDocs(majorRef)
    
    // Delete all documents in the major's subcollection
    for (const doc of majorDocs.docs) {
      await deleteDoc(doc.ref)
    }

    // Update the majors list in the academic year document
    const projectRef = doc(db, 'schools', schoolId, 'projects', academicYear)
    const projectDoc = await getDoc(projectRef)
    if (projectDoc.exists()) {
      const data = projectDoc.data()
      const updatedMajors = data.majors.filter(m => m !== majorName)
      await updateDoc(projectRef, { majors: updatedMajors })

      // Update local state immediately
      const settingIndex = existingSettings.value.findIndex(s => s.academicYear === academicYear)
      if (settingIndex !== -1) {
        existingSettings.value[settingIndex].majors = existingSettings.value[settingIndex].majors.filter(
          m => m.name !== majorName
        )
      }
    }

    showDeleteConfirmModal.value = false
    showToast('Major field deleted successfully')
  } catch (error) {
    console.error('Error deleting major:', error)
    showToast('Failed to delete major field', 'error')
  }
}

const addMajorToExisting = async (academicYear) => {
  try {
    const schoolId = userStore.currentUser.school;
    const projectRef = doc(db, 'schools', schoolId, 'projects', academicYear);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const data = projectDoc.data();
      
      // Create major subcollection
      const majorRef = collection(db, 'schools', schoolId, 'projects', academicYear, newMajorName.value);
      // Let Firebase generate a document ID
      const docRef = doc(majorRef);
      const docId = docRef.id;
      
      // Save the empty document
      await setDoc(docRef, {});
      
      const newMajor = {
        name: newMajorName.value,
        docId: docId,
        headers: null,
        milestones: null
      };

      // Update majors list in academic year document
      await updateDoc(projectRef, {
        majors: [...data.majors, newMajor.name]
      });

      // Update local state immediately
      const settingIndex = existingSettings.value.findIndex(s => s.academicYear === academicYear)
      if (settingIndex !== -1) {
        existingSettings.value[settingIndex].majors.push(newMajor)
      }

      // Reset form
      newMajorName.value = '';
      showAddMajorModal.value = false;
      
      showToast('New major field added successfully');
    }
  } catch (error) {
    console.error('Error adding new major:', error);
    showToast('Failed to add new major field', 'error');
  }
};

const getMilestoneAtIndex = (index) => {
  // Ensure the array has enough elements
  while (currentMilestones.value.length <= index) {
    currentMilestones.value.push({ description: '', deadline: '' })
  }
  return currentMilestones.value[index]
}

const removeMilestone = (index) => {
  // Don't remove if it's a required milestone
  if (currentMilestones.value[index].required) {
    showToast('Cannot remove required milestone', 'error')
    return
  }
  
  currentMilestones.value.splice(index, 1)
  // Update milestone count if needed
  if (milestoneCount.value > currentMilestones.value.length) {
    milestoneCount.value = currentMilestones.value.length
  }
}

const addMilestone = () => {
  if (newMilestone.value.description.trim() && newMilestone.value.deadline) {
    if (!isWeightageValid(newMilestone.value.weightage)) {
      showToast('Weightage must be between 1 and 100', 'error')
      return
    }
    currentMilestones.value.push({
      description: newMilestone.value.description.trim(),
      deadline: newMilestone.value.deadline,
      weightage: parseInt(newMilestone.value.weightage),
      completed: false
    })
    newMilestone.value = { 
      description: '', 
      deadline: '', 
      weightage: '', 
      completed: false 
    }
  }
}

// Add helper function to validate weightage
const isWeightageValid = (weightage) => {
  const weight = parseInt(weightage)
  return !isNaN(weight) && weight >= 1 && weight <= 100
}

// Helper function to check if a major has complete configuration
const isConfigurationComplete = (major) => {
  // Check if headers are configured
  const headersConfigured = major.docId && 
                           major.headers && 
                           Object.keys(major.headers).length > 2;
  
  // Check if milestones are configured, including the required Project Bidding
  const milestonesConfigured = major.docId && 
                              major.milestones && 
                              Array.isArray(major.milestones) && 
                              major.milestones.length > 1 &&
                              major.milestones.some(m => m.description === 'Project Bidding');
  
  return headersConfigured && milestonesConfigured;
}
</script>
  
<style scoped>
/* Remove all custom styles as we're using Tailwind classes */
</style>