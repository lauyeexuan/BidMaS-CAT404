<template>
  <component :is="projectComponent" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Project from '@/views/Project.vue'
import StudentProject from '@/views/StudentProject.vue'
import AdminProject from '@/views/AdminProject.vue'

const userStore = useUserStore()

const projectComponent = computed(() => {
  if (userStore.userRole === 'student') {
    return StudentProject
  } else if (userStore.userRole === 'admin') {
    return AdminProject
  } else {
    return Project
  }
})
</script> 