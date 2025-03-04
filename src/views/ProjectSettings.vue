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
      <div v-else-if="!showNewSettingsForm" class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Existing Project Settings</h2>
        <div class="space-y-6">
          <div v-for="setting in existingSettings" :key="setting.academicYear" class="border rounded-lg p-6">
            <h3 class="text-xl font-medium text-gray-900 mb-4">Academic Year: 20{{ setting.academicYear.slice(0,2) }}/20{{ setting.academicYear.slice(2) }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="major in setting.majors" :key="major.name" 
                   class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900">{{ major.name }}</h4>
                <p class="text-gray-600">Quota: {{ major.quota }}</p>
                <div class="mt-4">
                  <button 
                    @click="openHeadersModal(major, setting.academicYear)"
                    class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {{ major.docId && major.headers ? 'View Project Headers' : 'Complete Project Headers' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Academic Year</h2>
            <div>
              <label for="academicYear" class="block mb-2 text-sm font-medium text-gray-900">Current Academic Year:</label>
              <div class="flex items-center space-x-2">
                <input 
                  type="number" 
                  id="academicYearStart" 
                  v-model="academicYear.start" 
                  min="2000"
                  max="2100"
                  @input="validateAcademicYear"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5"
                  :class="{'border-red-500': yearError}"
                  placeholder="2022"
                >
                <span class="text-gray-500">/</span>
                <input 
                  type="number" 
                  id="academicYearEnd" 
                  v-model="academicYear.end" 
                  min="2000"
                  max="2100"
                  @input="validateAcademicYear"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5"
                  :class="{'border-red-500': yearError}"
                  placeholder="2023"
                >
              </div>
              <p class="mt-1 text-sm text-gray-500">Format: YYYY/YYYY (e.g., 2022/2023)</p>
              <p v-if="yearError" class="mt-1 text-sm text-red-500">{{ yearError }}</p>
            </div>
          </div>

          <!-- Fields Configuration Section -->
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Configure Project Fields</h2>
            <div>
              <label for="numFields" class="block mb-2 text-sm font-medium text-gray-900">Number of Major Fields:</label>
              <input 
                type="number" 
                id="numFields" 
                v-model="numFields" 
                min="1"
                @change="updateFields"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
            </div>
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
                <div>
                  <label :for="'quota-' + index" class="block mb-2 text-sm font-medium text-gray-900">
                    Project Quota:
                  </label>
                  <input 
                    type="number" 
                    :id="'quota-' + index"
                    v-model="field.quota"
                    min="0"
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
                  {{ isEditMode ? 'Project Headers' : 'Complete Project Headers' }}
                </DialogTitle>

                <!-- Existing Headers List -->
                <div v-if="currentHeaders.length > 0" class="mb-8">
                  <h4 class="font-medium text-gray-700 mb-2">Current Headers</h4>
                  <div class="space-y-4">
                    <div v-for="(header, index) in currentHeaders" :key="index" 
                         class="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p class="font-medium">{{ header.name }}</p>
                        <p class="text-sm text-gray-600">Type: {{ header.type }}</p>
                        <div v-if="header.type === 'array'" class="mt-2">
                          <p class="text-sm text-gray-600">Values:</p>
                          <ul class="list-disc list-inside">
                            <li v-for="value in header.values" :key="value" class="text-sm">
                              {{ value }}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <button 
                        @click="removeHeader(index)"
                        class="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Add New Header Form -->
                <div v-if="!isEditMode || (isEditMode && currentHeaders.length > 0)" class="space-y-4">
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
                      <option value="string">String (Free Text)</option>
                      <option value="array">Predefined Options</option>
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

                <div class="mt-8 flex justify-end gap-4">
                  <button 
                    @click="showHeadersModal = false"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="saveHeaders"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Headers
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
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, collection, setDoc, getDocs, query, getDoc, updateDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/userStore'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const userStore = useUserStore()
const loading = ref(true)
const showNewSettingsForm = ref(false)
const existingSettings = ref([])

// Add these refs after other refs
const showHeadersModal = ref(false)
const currentMajor = ref(null)
const currentHeaders = ref([])
const newHeader = ref({ name: '', type: 'string', values: [] })
const tempValue = ref('')
const isEditMode = ref(false)

// Fetch existing settings
const fetchSettings = async () => {
  try {
    const schoolId = userStore.currentUser.school
    console.log('Fetching settings for school:', schoolId)
    
    const projectsRef = collection(db, 'schools', schoolId, 'projects')
    const projectsSnapshot = await getDocs(query(projectsRef))
    console.log('Found academic years:', projectsSnapshot.docs.map(doc => doc.id))

    const settings = []
    
    // For each academic year document
    for (const projectDoc of projectsSnapshot.docs) {
      const academicYear = projectDoc.id
      console.log('\nProcessing academic year:', academicYear)
      const majors = []

      // Get the document data first
      const yearData = projectDoc.data()
      console.log('Year data:', yearData)

      // Get the list of majors from the document
      const majorNames = yearData.majors || []
      console.log('Found majors:', majorNames)
      
      // For each major name, try to get its quota
      for (const majorName of majorNames) {
        console.log('\nProcessing major:', majorName)
        // Get the quota document from this major collection
        const majorRef = collection(db, 'schools', schoolId, 'projects', academicYear, majorName)
        const quotaSnapshot = await getDocs(majorRef)
        console.log('Quota documents found:', quotaSnapshot.docs.length)
        
        if (quotaSnapshot.docs.length > 0) {
          const quotaDoc = quotaSnapshot.docs[0]
          const quotaData = quotaDoc.data()
          console.log('Quota value:', quotaData.quota)
          
          majors.push({
            name: majorName,
            quota: quotaData.quota,
            docId: quotaDoc.id,
            headers: quotaData.headers || null
          })
        }
      }

      console.log('All majors for year', academicYear, ':', majors)
      settings.push({
        academicYear,
        majors
      })
    }

    console.log('\nFinal settings data:', settings)
    existingSettings.value = settings
  } catch (error) {
    console.error('Error details:', error)
    showToast('Failed to fetch project settings', 'error')
  } finally {
    loading.value = false
  }
}

// Call fetchSettings when component mounts
onMounted(fetchSettings)
  
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
    newFields[i] = fields.value[i] || { name: '', quota: 0 }
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
         fields.value.every(field => 
           field.name.trim() !== '' && 
           field.quota >= 0
         )
})
  
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div')
  toast.className = 'flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow ' + 
    (type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500')
  
  const icon = document.createElement('div')
  icon.className = 'inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ' + 
    (type === 'success' ? 'text-green-500' : 'text-red-500')
  icon.innerHTML = type === 'success' 
    ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0[...]'
    : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.[...]'
  
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
    // Get the current school from user store
    const schoolId = userStore.currentUser.school
    console.log('Saving settings for school:', schoolId)

    // Format academic year for document ID (e.g., "2223" for 2022/2023)
    const yearStart = academicYear.value.start.toString().slice(-2)
    const yearEnd = academicYear.value.end.toString().slice(-2)
    const academicYearId = yearStart + yearEnd
    console.log('Academic Year ID:', academicYearId)

    // Create or update the academic year document in projects subcollection
    const projectsRef = doc(db, 'schools', schoolId, 'projects', academicYearId)
    
    // Create the academic year document with majors list
    await setDoc(projectsRef, {
      createdAt: new Date(),
      academicYear: `${academicYear.value.start}/${academicYear.value.end}`,
      majors: fields.value.map(f => f.name)  // Store the list of majors
    })
    console.log('Created academic year document:', academicYearId)

    // For each major field, create a subcollection and store quota
    for (const field of fields.value) {
      console.log('Creating major:', field.name, 'with quota:', field.quota)
      // Create a document with random ID in the major's subcollection
      const majorRef = collection(db, 'schools', schoolId, 'projects', academicYearId, field.name)
      const docRef = doc(majorRef) // This creates a document with auto-generated ID

      // Set the quota for this major
      await setDoc(docRef, {
        quota: parseInt(field.quota)
      })
      console.log('Created quota document for major:', field.name)
    }
    
    // Refresh the settings list
    await fetchSettings()
    showNewSettingsForm.value = false
    showToast('Project settings saved successfully')
  } catch (error) {
    console.error('Error details:', error)
    showToast('Failed to save project settings', 'error')
  }
}

const openHeadersModal = async (major, academicYear) => {
  currentMajor.value = { ...major, academicYear }
  // Try to fetch existing headers
  try {
    console.log('Opening modal for major:', major.name, 'academicYear:', academicYear)
    const majorRef = doc(db, 'schools', userStore.currentUser.school, 'projects', academicYear, major.name, major.docId || 'default')
    const majorDoc = await getDoc(majorRef)
    console.log('Major doc exists:', majorDoc.exists(), 'data:', majorDoc.data())
    
    if (majorDoc.exists() && majorDoc.data().headers) {
      currentHeaders.value = Object.entries(majorDoc.data().headers).map(([name, config]) => ({
        name,
        type: config.type,
        values: config.values || []
      }))
      isEditMode.value = true
    } else {
      currentHeaders.value = []
      isEditMode.value = false
    }
    showHeadersModal.value = true
  } catch (error) {
    console.error('Error opening headers modal:', error)
    showToast('Failed to load project headers', 'error')
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
      values: newHeader.value.type === 'array' ? [...newHeader.value.values] : null
    })
    newHeader.value = { name: '', type: 'string', values: [] }
    tempValue.value = ''
  }
}

const removeHeader = (index) => {
  currentHeaders.value.splice(index, 1)
}

const saveHeaders = async () => {
  try {
    const headers = {}
    currentHeaders.value.forEach(header => {
      headers[header.name] = {
        type: header.type,
        values: header.type === 'array' ? header.values : null
      }
    })

    // If this is the first time saving headers, we need to create the document
    const docId = currentMajor.value.docId || 'default'
    const majorRef = doc(
      db, 
      'schools', 
      userStore.currentUser.school, 
      'projects', 
      currentMajor.value.academicYear, 
      currentMajor.value.name, 
      docId
    )

    // Use setDoc instead of updateDoc to ensure document creation
    await setDoc(majorRef, { 
      headers,
      quota: currentMajor.value.quota || 0
    }, { merge: true })
    
    showHeadersModal.value = false
    showToast('Project headers saved successfully')
    await fetchSettings() // Refresh the data
  } catch (error) {
    console.error('Error saving headers:', error)
    showToast('Failed to save project headers', 'error')
  }
}
</script>
  
<style scoped>
/* Remove all custom styles as we're using Tailwind classes */
</style>