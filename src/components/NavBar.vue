<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <aside 
      class="bg-gradient-to-b from-blue-50 to-gray-50 shadow-md transition-all duration-300 overflow-hidden relative rounded-r-2xl border-r border-blue-100"
      :class="{ 'w-64': isOpen, 'w-16': !isOpen }"
    >
      <div class="h-[72px] flex items-center justify-center">
        <div class="relative" :style="{ width: isOpen ? '56px' : '40px', height: '40px' }">
          <img 
            :src="isOpen ? '/standinglogo.png' : '/logo.png'" 
            :alt="isOpen ? 'BidMaS Standing Logo' : 'BidMaS Logo'" 
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            :style="{ 
              width: isOpen ? '56px' : '40px',
              height: isOpen ? '56px' : '40px',
              objectFit: 'contain'
            }" 
          />
        </div>
        <span v-if="isOpen" class="ml-2 font-semibold text-blue-700">BidMaS</span>
      </div>
      
      <!-- Toggle button - positioned on the right edge -->
      <button 
        @click="toggleSidebar" 
        class="absolute top-4 -right-3 bg-blue-100 text-blue-600 rounded-full w-6 h-20 flex items-center justify-center shadow-md hover:bg-blue-200 transition-colors z-10 border border-blue-200"
        aria-label="Toggle sidebar"
      >
        <i :class="isOpen ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'" class="text-sm"></i>
      </button>
      
      <nav class="mt-4 flex flex-col h-[calc(100%-80px)]">
        <ul>
          <li v-for="item in filteredMenuItems" 
              :key="item.name" 
              class="px-4 py-3 hover:bg-blue-100 transition-all duration-200 mx-2 my-1 rounded-xl" 
              :class="{
                'bg-blue-200 text-blue-800': isActiveRoute(item.route),
                'cursor-pointer': isMenuItemEnabled(item),
                'cursor-not-allowed opacity-50': !isMenuItemEnabled(item)
              }"
              @click="navigateToRoute(item)">
            <div class="flex items-center" :class="{ 'justify-center': !isOpen }">
              <span v-html="item.icon" :class="[isOpen ? 'w-6' : 'text-xl', isActiveRoute(item.route) ? 'text-blue-700' : 'text-gray-600']" :title="!isOpen ? item.name : ''"></span>
              <span v-if="isOpen" class="ml-3">{{ item.name }}</span>
              
              <!-- Profile completion indicator for students -->
              <span 
                v-if="isOpen && userStore.userRole === 'student' && !userStore.isProfileComplete && item.name === 'Profile'"
                class="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                Required
              </span>
            </div>
          </li>
        </ul>
        
        <!-- Logout button at the bottom -->
        <div 
          class="mt-auto px-4 py-4 cursor-pointer transition-all duration-200 bg-red-100 hover:bg-red-200 group flex items-center"
          :class="{ 'justify-center': !isOpen }"
          @click="handleLogout"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 text-red-500 group-hover:text-red-600 transition-colors" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fill-rule="evenodd" 
              d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zM2 4a2 2 0 012-2h6.586a1 1 0 01.707.293l5 5a1 1 0 01.293.707V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm10.707 9.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 15H5a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 111.414-1.414l3 3z" 
              clip-rule="evenodd" 
            />
          </svg>
          <span 
            v-if="isOpen" 
            class="ml-3 text-red-500 group-hover:text-red-600 text-lg transition-colors"
          >
            Logout
          </span>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  props: {
    navState: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const isOpen = ref(true)

    // Toggle sidebar
    const toggleSidebar = () => {
      isOpen.value = !isOpen.value
      emit('update:navState', isOpen.value)  // Emit the new state
    }

    // Watch for changes in isOpen
    watch(isOpen, (newValue) => {
      emit('update:navState', newValue)  // Emit whenever the state changes
    })

    // All possible menu items with their role requirements
    const allMenuItems = [
      { 
        name: "Dashboard", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>`,
        route: 'dashboard',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Projects", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>`,
        route: 'Projects',
        roles: ['lecturer','admin','student']
      },
      { 
        name: "Feedback", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>`,
        route: 'feedback',
        roles: ['student', 'lecturer']
      },
      { 
        name: "Progress", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>`,
        route: 'progress',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Accounts", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>`,
        route: 'account-management',
        roles: ['admin']
      },
      { 
        name: "Settings", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>`,
        route: 'project-settings',
        roles: ['admin']
      },
      { 
        name: "Community", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>`,
        route: 'community',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Profile", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>`,
        route: 'profile',
        roles: ['admin', 'student', 'lecturer']
      }
    ]

    // Computed property to filter menu items based on user role
    const filteredMenuItems = computed(() => {
      const userRole = userStore.userRole
      return allMenuItems.filter(item => item.roles.includes(userRole))
    })

    // Check if route is active
    const isActiveRoute = (routeName) => {
      // Check for exact name match
      if (route.name === routeName) return true;
      
      // For feedback pages, check if the path starts with /feedback
      if (routeName === 'feedback' && route.path.startsWith('/feedback')) {
        return true;
      }
      
      return false;
    }
    
    // Check if menu item should be enabled
    const isMenuItemEnabled = (item) => {
      // If not a student or profile is complete, all items are enabled
      if (userStore.userRole !== 'student' || userStore.isProfileComplete) {
        return true
      }
      
      // For students with incomplete profiles, only enable the Profile item
      return item.route === 'profile'
    }

    // Navigation handler
    const navigateToRoute = (item) => {
      // Don't navigate if item is disabled
      if (!isMenuItemEnabled(item)) {
        return
      }
      
      console.log('Navigating to route:', item.route)
      console.log('Current user role:', userStore.userRole)
      console.log('Menu item roles:', item.roles)
      if (item.route) {
        router.push({ name: item.route }).catch(err => {
          console.error('Navigation error:', err)
        })
      }
    }
    
    // Logout handler
    const handleLogout = async () => {
      try {
        await userStore.logout()
        router.push('/')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }

    return {
      isOpen,
      toggleSidebar,
      filteredMenuItems,
      isActiveRoute,
      isMenuItemEnabled,
      navigateToRoute,
      handleLogout,
      userStore
    }
  }
}
</script>

<style scoped>
ul li { 
  padding: 10px; 
  cursor: pointer; 
  transition: background 0.3s; 
}
ul li:hover { 
  background: #f3f4f6; 
}
</style> 