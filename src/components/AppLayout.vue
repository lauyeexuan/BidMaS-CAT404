<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <NavBar />
    
    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <!-- Top Bar -->
      <div class="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 class="text-2xl font-semibold">{{ currentPageTitle }}</h1>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <i class="fas fa-user-circle text-2xl"></i>
            <span>{{ currentUser?.name || 'User' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Page Content -->
      <div class="p-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import NavBar from './NavBar.vue'

export default {
  components: {
    NavBar
  },
  setup() {
    const route = useRoute()
    const userStore = useUserStore()

    // All possible menu items with their titles
    const allMenuItems = [
      { name: "Dashboard", route: 'dashboard' },
      { name: "Project", route: 'Projects' },
      { name: "Feedback", route: 'feedback' },
      { name: "Track Progress", route: 'progress' },
      { name: "Account Management", route: 'account-management' },
      { name: "Project Setting", route: 'project-settings' },
      { name: "Profile", route: 'profile' }
    ]

    // Get current page title
    const currentPageTitle = computed(() => {
      const currentRoute = route.name
      const menuItem = allMenuItems.find(item => item.route === currentRoute)
      return menuItem ? menuItem.name : 'Dashboard'
    })

    // Get current user for display
    const currentUser = computed(() => userStore.currentUser)

    return {
      currentPageTitle,
      currentUser
    }
  }
}
</script>

<style scoped>
/* Add any layout-specific styles here */
</style> 