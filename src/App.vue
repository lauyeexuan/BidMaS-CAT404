<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(async () => {
  await userStore.initializeAuth()
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles can go here if needed */
</style>