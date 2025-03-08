<template>
  <component :is="projectComponent" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Project from '@/views/Project.vue'
import StudentProject from '@/views/StudentProject.vue'

const userStore = useUserStore()

const projectComponent = computed(() => {
  return userStore.userRole === 'student' ? StudentProject : Project
})
</script> 