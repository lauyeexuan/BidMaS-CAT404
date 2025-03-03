import { createRouter, createWebHistory } from 'vue-router'
//import HomeView from '../views/HomeView.vue'
import Login from '@/views/Login.vue' // Assuming this exists
import Home from '@/views/Home.vue'
import Dashboard from '@/views/Dashboard.vue'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true } // Only accessible when logged out
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard, // You'll need to create this
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/account-management',
      name: 'account-management',
      component: () => import('@/views/AccountManagement.vue'),
      meta: { 
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    // {
    //   path: '/projects',
    //   name: 'projects',
    //   component: () => import('@/views/Projects.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/feedback',
    //   name: 'feedback',
    //   component: () => import('@/views/Feedback.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/progress',
    //   name: 'progress',
    //   component: () => import('@/views/Progress.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/project-settings',
    //   name: 'project-settings',
    //   component: () => import('@/views/ProjectSettings.vue'),
    //   meta: { requiresAuth: true }
    // }
    // {
    //   path: '/profile',
    //   name: 'profile',
    //   component: () => import('../views/ProfileView.vue'), // You'll need to create this
    //   meta: { requiresAuth: true } // Protected route
    // },
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'notFound',
    //   component: () => import('../views/NotFoundView.vue') // Optional 404 page
    // }
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Initialize auth if not already done
  if (!userStore.initialized) {
    await userStore.initializeAuth()
  }
  
  const isAuthenticated = userStore.isAuthenticated
  const userRole = userStore.userRole
  
  // Route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // Route requires admin role
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ name: 'dashboard' }) // Redirect to dashboard if not admin
    return
  }
  
  // Route is for guests only (login, register)
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  // Allow navigation
  next()
})

export default router