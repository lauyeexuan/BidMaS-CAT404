<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-6 py-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Project Settings</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-8">
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
  </div>
</template>
  
<script setup>
import { ref, computed } from 'vue'
  
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
    // TODO: Implement API call to save settings
    const settings = {
      academicYear: academicYear.value.start + '/' + academicYear.value.end,
      numFields: numFields.value,
      fields: fields.value
    }
    
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showToast('Project settings saved successfully')
  } catch (error) {
    showToast('Failed to save project settings', 'error')
    console.error('Error saving settings:', error)
  }
}
</script>
  
<style scoped>
/* Remove all custom styles as we're using Tailwind classes */
</style>