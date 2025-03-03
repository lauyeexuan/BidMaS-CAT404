import { createRouter, createWebHistory } from 'vue-router'
//import HomeView from '../views/HomeView.vue'
import Login from '@/views/Login.vue' // Assuming this exists
import Home from '@/views/Home.vue'

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
    // {
    //   path: '/dashboard',
    //   name: 'dashboard',
    //   component: () => import('../views/DashboardView.vue'), // You'll need to create this
    //   meta: { requiresAuth: true } // Protected route
    // },
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
  // This assumes you'll implement a user store as described in Step 3
  // Import it at the top of the file when you create it
  // import { useUserStore } from '../stores/userStore'
  
  // For now, we'll use localStorage as a simple way to check authentication
  const isAuthenticated = localStorage.getItem('authToken') !== null
  
  // Once you implement the user store, replace the above with:
  // const userStore = useUserStore()
  // const isAuthenticated = userStore.isAuthenticated
  
  // Route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
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