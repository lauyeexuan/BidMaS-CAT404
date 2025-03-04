<template>
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-md">
        <div class="p-4 flex items-center">
          <img src="/logo.png" alt="BidMaS Logo" class="h-10" />
        </div>
        <nav class="mt-4 flex flex-col h-[calc(100%-80px)]">
          <ul>
            <li v-for="item in filteredMenuItems" 
                :key="item.name" 
                class="p-3 hover:bg-gray-200 cursor-pointer" 
                :class="{'bg-blue-100': isActiveRoute(item.route)}"
                @click="navigateToRoute(item)">
              <span class="flex items-center gap-2">
                <i :class="item.icon"></i>
                {{ item.name }}
              </span>
            </li>
          </ul>
          
          <!-- Logout button at the bottom -->
          <div class="mt-auto border-t pt-2">
            <li 
              class="p-3 hover:bg-red-100 cursor-pointer text-red-600 flex items-center gap-2"
              @click="handleLogout"
            >
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </li>
          </div>
        </nav>
      </aside>
  
      <!-- Main Content -->
      <div class="flex-1 p-6">
        <!-- Top Bar -->
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold">{{ currentPageTitle }}</h1>
          <div class="flex items-center gap-4">
            <button class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded">6 Unread Notifications</button>
            <button class="px-4 py-2 bg-green-100 text-green-800 rounded">4 Project Updates</button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded">Create New Project</button>
            <div class="flex items-center gap-2">
              <i class="fas fa-user-circle text-2xl"></i>
              <span>{{ currentUser?.name || 'User' }}</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Content or Router View -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <!-- Default Dashboard Content -->
        <template v-if="$route.name === 'dashboard'">
          <!-- Dashboard Cards -->
          <div class="mt-6 grid grid-cols-12 gap-4">
            <div class="col-span-6 bg-white p-4 shadow rounded">
              <h2 class="text-lg font-semibold">Current Milestones</h2>
              <p>Software Design Report</p>
              <p class="text-gray-500">Deadline: 20/1/2025</p>
            </div>
            <div class="col-span-6 bg-blue-600 text-white p-4 shadow rounded text-center">
              <h2 class="text-lg font-semibold">Manage project in few clicks</h2>
              <button class="mt-2 px-4 py-2 bg-white text-blue-600 rounded">Go Now</button>
            </div>
          </div>

          <!-- Submission Rate -->
          <div class="mt-6 grid grid-cols-12 gap-4">
            <div class="col-span-6 bg-white p-4 shadow rounded">
              <h2 class="text-lg font-semibold">Submission Rate</h2>
              <p>Software Design Report</p>
              <div class="w-32 h-32 mx-auto mt-4">
                <svg class="w-full h-full" viewBox="0 0 36 36">
                  <path class="text-gray-200" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="currentColor" stroke-width="4" />
                  <path class="text-blue-600" d="M18 2a16 16 0 0 1 13 8" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80, 100" />
                </svg>
                <p class="text-center text-xl font-bold mt-2">84%</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </template>
  
<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()

    // All possible menu items with their role requirements
    const allMenuItems = [
      { 
        name: "Dashboard", 
        icon: "fas fa-home", 
        route: 'dashboard',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Project", 
        icon: "fas fa-folder",
        route: 'projects',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Feedback", 
        icon: "fas fa-comment",
        route: 'feedback',
        roles: ['admin', 'lecturer']
      },
      { 
        name: "Track Progress", 
        icon: "fas fa-chart-line",
        route: 'progress',
        roles: ['admin', 'student', 'lecturer']
      },
      { 
        name: "Account Management", 
        icon: "fas fa-user-cog",
        route: 'account-management',
        roles: ['admin']
      },
      { 
        name: "Project Setting", 
        icon: "fas fa-cogs",
        route: 'project-settings',
        roles: ['admin', 'lecturer']
      }
    ]

    // Computed property to filter menu items based on user role
    const filteredMenuItems = computed(() => {
      const userRole = userStore.userRole
      return allMenuItems.filter(item => item.roles.includes(userRole))
    })

    // Get current page title
    const currentPageTitle = computed(() => {
      const currentRoute = route.name
      const menuItem = allMenuItems.find(item => item.route === currentRoute)
      return menuItem ? menuItem.name : 'Dashboard'
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

    // Get current user for display
    const currentUser = computed(() => userStore.currentUser)

    return {
      filteredMenuItems,
      currentPageTitle,
      isActiveRoute,
      navigateToRoute,
      handleLogout,
      currentUser
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
  