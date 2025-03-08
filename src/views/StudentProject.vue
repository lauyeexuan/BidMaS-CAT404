<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Projects</h1>
      <p class="text-gray-600 mb-4">This is the student view of the projects page. Content will be implemented later.</p>
      
      <div class="bg-blue-100 p-4 rounded-lg">
        <p class="text-blue-800">Welcome to your project dashboard! Here you'll be able to view and manage your projects.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

onMounted(() => {
  console.log('Student Project page loaded')
  console.log('Current user role:', userStore.userRole)
})
</script>

<style scoped>
/* No custom styles needed as we're using Tailwind classes */
</style> 