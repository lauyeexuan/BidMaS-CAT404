<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Data Migration Tool</h2>
    
    <div v-if="!isMigrating && !migrationResult" class="mb-4">
      <p class="text-gray-600 mb-4">
        This tool will migrate your existing submissions to the new data structure.
        This is a one-time operation. Make sure you have a backup of your data before proceeding.
      </p>
      
      <div class="flex flex-col space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">School ID</label>
          <input 
            v-model="schoolId" 
            class="p-2 border rounded w-full" 
            placeholder="Enter school ID" 
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Majors (comma-separated)</label>
          <input 
            v-model="majorsInput" 
            class="p-2 border rounded w-full" 
            placeholder="e.g. CS,EE,ME" 
          />
        </div>
        
        <button 
          @click="startMigration" 
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          :disabled="!isFormValid"
        >
          Start Migration
        </button>
      </div>
    </div>
    
    <div v-else-if="isMigrating" class="text-center py-6">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
      <p class="text-gray-700">Migration in progress... Please wait.</p>
      <p class="text-sm text-gray-500 mt-2">This might take a while depending on your data size.</p>
    </div>
    
    <div v-else-if="migrationResult" class="py-4">
      <div class="mb-4" :class="migrationResult.success ? 'text-green-600' : 'text-red-600'">
        <div class="flex items-center">
          <svg 
            v-if="migrationResult.success" 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg 
            v-else 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h3 class="text-lg font-medium">
            {{ migrationResult.success ? 'Migration Successful' : 'Migration Failed' }}
          </h3>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded mb-3">
        <p class="mb-2">Total documents migrated: <span class="font-semibold">{{ migrationResult.migratedCount }}</span></p>
        <p>Errors encountered: <span class="font-semibold">{{ migrationResult.errors.length }}</span></p>
      </div>
      
      <div v-if="migrationResult.errors.length > 0" class="mt-4">
        <h4 class="font-medium text-red-600 mb-2">Error Details:</h4>
        <ul class="list-disc pl-5 text-sm text-gray-700">
          <li v-for="(error, index) in migrationResult.errors" :key="index">
            {{ typeof error === 'string' ? error : JSON.stringify(error) }}
          </li>
        </ul>
      </div>
      
      <button 
        @click="resetForm" 
        class="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { migrateSubmissions } from '@/utils/migrateSubmissions'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'DataMigration',
  setup() {
    const userStore = useUserStore()
    const schoolId = ref(userStore.currentUser?.school || '')
    const majorsInput = ref(userStore.currentUser?.major?.join(',') || '')
    
    const isMigrating = ref(false)
    const migrationResult = ref(null)
    
    const isFormValid = computed(() => {
      return schoolId.value.trim() !== '' && majorsInput.value.trim() !== ''
    })
    
    const startMigration = async () => {
      if (!isFormValid.value) return
      
      isMigrating.value = true
      migrationResult.value = null
      
      try {
        const majors = majorsInput.value.split(',').map(m => m.trim()).filter(Boolean)
        console.log(`Starting migration for school: ${schoolId.value}, majors: ${majors.join(', ')}`)
        
        const result = await migrateSubmissions(schoolId.value, majors)
        migrationResult.value = result
      } catch (error) {
        console.error('Migration error:', error)
        migrationResult.value = {
          success: false,
          migratedCount: 0,
          errors: [error.message || 'Unknown error occurred']
        }
      } finally {
        isMigrating.value = false
      }
    }
    
    const resetForm = () => {
      migrationResult.value = null
    }
    
    return {
      schoolId,
      majorsInput,
      isMigrating,
      migrationResult,
      isFormValid,
      startMigration,
      resetForm
    }
  }
}
</script> 