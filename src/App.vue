<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { onMounted, computed } from 'vue'
import AppLayout from './components/AppLayout.vue'

const userStore = useUserStore()
const route = useRoute()

onMounted(async () => {
  await userStore.initializeAuth()
})

// Determine if we should show the layout with navigation
const showLayout = computed(() => {
  // Don't show layout for home and login pages
  return !['home', 'login'].includes(route.name) && userStore.isAuthenticated
})
</script>

<template>
  <AppLayout v-if="showLayout">
    <RouterView />
  </AppLayout>
  <RouterView v-else />
</template>

<style>
/* Global styles can go here if needed */
</style>