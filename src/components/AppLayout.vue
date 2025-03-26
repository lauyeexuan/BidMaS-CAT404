<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Navigation Bar -->
    <NavBar @update:navState="updateNavbarState" />
    
    <!-- Main Content -->
    <div ref="mainContent" class="flex-1 overflow-auto relative">
      <!-- Top Bar -->
      <div 
        class="bg-white shadow-sm p-4 flex justify-between items-center fixed top-0 right-0 z-10 transition-all duration-300"
        :style="{ left: navbarWidth }"
      >
        <h1 class="text-2xl font-semibold">{{ currentPageTitle }}</h1>
        <div class="flex items-center gap-4">
          <!-- Notification Badge -->
          <NotificationBadge 
            :school-id="userStore.currentUser?.school" 
            @toggle-panel="toggleNotificationPanel" 
          />
          
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ currentUser?.name || 'User' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Notification Panel -->
      <NotificationsPanel 
        :is-open="showNotificationPanel" 
        :school-id="userStore.currentUser?.school"
        @close="closeNotificationPanel" 
        @animation-complete="notificationAnimationComplete"
      />
      
      <!-- Background Overlay -->
      <Transition name="fade">
        <div 
          v-if="showNotificationPanel" 
          class="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          @click="closeNotificationPanel"
        ></div>
      </Transition>
      
      <!-- Page Content -->
      <div class="p-6 mt-[72px]">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import NavBar from './NavBar.vue'
import NotificationBadge from './NotificationBadge.vue'
import NotificationsPanel from './NotificationsPanel.vue'

export default {
  components: {
    NavBar,
    NotificationBadge,
    NotificationsPanel
  },
  setup() {
    const route = useRoute()
    const userStore = useUserStore()
    const mainContent = ref(null)
    const showNotificationPanel = ref(false)
    const isAnimatingOut = ref(false)
    const isNavbarOpen = ref(true)

    // Computed property for navbar width
    const navbarWidth = computed(() => {
      return isNavbarOpen.value ? '256px' : '64px'
    })

    // Method to update navbar state
    const updateNavbarState = (isOpen) => {
      isNavbarOpen.value = isOpen
    }

    // Toggle notification panel
    const toggleNotificationPanel = () => {
      if (isAnimatingOut.value) return;
      showNotificationPanel.value = !showNotificationPanel.value
      
      // Add body class to prevent scrolling when panel is open
      if (showNotificationPanel.value) {
        document.body.classList.add('overflow-hidden')
      }
    }
    
    // Close notification panel
    const closeNotificationPanel = () => {
      if (isAnimatingOut.value) return;
      isAnimatingOut.value = true
      showNotificationPanel.value = false
    }
    
    // Handle animation complete
    const notificationAnimationComplete = () => {
      isAnimatingOut.value = false
      document.body.classList.remove('overflow-hidden')
    }

    // Listen for escape key to close panel
    onMounted(() => {
      const handleEscKey = (event) => {
        if (event.key === 'Escape' && showNotificationPanel.value) {
          closeNotificationPanel()
        }
      }
      
      window.addEventListener('keydown', handleEscKey)
      
      // Clean up event listener
      return () => {
        window.removeEventListener('keydown', handleEscKey)
      }
    })

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
      const parentRoute = route.meta.parentRoute
      
      // If there's a parent route defined in meta, use that for the title
      if (parentRoute) {
        const parentMenuItem = allMenuItems.find(item => item.route === parentRoute)
        return parentMenuItem ? parentMenuItem.name : 'Dashboard'
      }
      
      // Otherwise use the current route
      const menuItem = allMenuItems.find(item => item.route === currentRoute)
      return menuItem ? menuItem.name : 'Dashboard'
    })

    // Get current user for display
    const currentUser = computed(() => userStore.currentUser)

    // Watch for route changes to scroll to top
    watch(() => route.path, () => {
      if (mainContent.value) {
        mainContent.value.scrollTop = 0
      }
    })

    return {
      currentPageTitle,
      currentUser,
      mainContent,
      userStore,
      showNotificationPanel,
      isAnimatingOut,
      toggleNotificationPanel,
      closeNotificationPanel,
      notificationAnimationComplete,
      navbarWidth,
      updateNavbarState
    }
  }
}
</script>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-leave-to,
.fade-enter-from {
  opacity: 0;
}

/* Add CSS variable for navbar width */

</style> 