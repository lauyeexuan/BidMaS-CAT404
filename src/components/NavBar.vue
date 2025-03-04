<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <aside 
      class="bg-white shadow-md transition-all duration-300 overflow-hidden relative"
      :class="{ 'w-64': isOpen, 'w-16': !isOpen }"
    >
      <div class="p-4 flex items-center justify-center">
        <div class="w-10 h-10 flex-shrink-0">
          <img src="/logo.png" alt="BidMaS Logo" class="h-full w-full object-contain" />
        </div>
        <span v-if="isOpen" class="ml-2 font-semibold">BidMaS</span>
      </div>
      
      <!-- Toggle button - positioned on the right edge -->
      <button 
        @click="toggleSidebar" 
        class="absolute top-4 -right-3 bg-gray-100 text-gray-600 rounded-lg w-6 h-20 flex items-center justify-center shadow-md hover:bg-gray-200 transition-colors z-10 border border-gray-200"
        aria-label="Toggle sidebar"
      >
        <i :class="isOpen ? 'fas fa-angle-double-left' : 'fas fa-angle-double-right'" class="text-sm"></i>
      </button>
      
      <nav class="mt-4 flex flex-col h-[calc(100%-80px)]">
        <ul>
          <li v-for="item in filteredMenuItems" 
              :key="item.name" 
              class="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-all duration-200" 
              :class="{'bg-blue-100': isActiveRoute(item.route)}"
              @click="navigateToRoute(item)">
            <div class="flex items-center" :class="{ 'justify-center': !isOpen }">
              <span v-html="item.icon" :class="[isOpen ? 'w-6' : 'text-xl']" :title="!isOpen ? item.name : ''"></span>
              <span v-if="isOpen" class="ml-3">{{ item.name }}</span>
            </div>
          </li>
        </ul>
        
        <!-- Logout button at the bottom -->
        <div class="mt-auto border-t pt-2">
          <li 
            class="px-4 py-3 hover:bg-red-100 cursor-pointer text-red-600 transition-all duration-200"
            @click="handleLogout"
          >
            <div class="flex items-center" :class="{ 'justify-center': !isOpen }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zM2 4a2 2 0 012-2h6.586a1 1 0 01.707.293l5 5a1 1 0 01.293.707V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm10.707 9.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 15H5a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 111.414-1.414l3 3z" clip-rule="evenodd" />
              </svg>
              <span v-if="isOpen" class="ml-3">Logout</span>
            </div>
          </li>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const isOpen = ref(true)

    // Toggle sidebar
    const toggleSidebar = () => {
      isOpen.value = !isOpen.value
    }

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
        name: "Project", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>`,
        route: 'projects',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Feedback", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>`,
        route: 'feedback',
        roles: ['admin', 'lecturer']
      },
      { 
        name: "Track Progress", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>`,
        route: 'progress',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Account Management", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>`,
        route: 'account-management',
        roles: ['admin']
      },
      { 
        name: "Project Setting", 
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>`,
        route: 'project-settings',
        roles: ['admin', 'lecturer']
      }
    ]

    // Computed property to filter menu items based on user role
    const filteredMenuItems = computed(() => {
      const userRole = userStore.userRole
      return allMenuItems.filter(item => item.roles.includes(userRole))
    })

    // Check if route is active
    const isActiveRoute = (routeName) => {
      return route.name === routeName
    }

    // Navigation handler
    const navigateToRoute = (item) => {
      if (item.route) {
        router.push({ name: item.route })
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
      navigateToRoute,
      handleLogout
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