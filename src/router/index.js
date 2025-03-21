import { createRouter, createWebHistory } from 'vue-router'
//import HomeView from '../views/HomeView.vue'
import Login from '@/views/Login.vue' // Assuming this exists
import Home from '@/views/Home.vue'
import DashboardWrapper from '@/views/DashboardWrapper.vue'
import { useUserStore } from '@/stores/userStore'
import ProjectSettings from '@/views/ProjectSettings.vue'
import ProjectWrapper from '@/views/ProjectWrapper.vue'
import Profile from '@/views/Profile.vue'
import FeedbackWrapper from '@/views/FeedbackWrapper.vue'
import StudentFeedback from '@/views/StudentFeedback.vue'
import LecturerFeedback from '@/views/LecturerFeedback.vue'
import DataMigration from '@/components/DataMigration.vue'
import AccountManagement from '@/views/AccountManagement.vue'

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
      component: DashboardWrapper,
      meta: { requiresAuth: true }, // Protected route
    },
    {
      path: '/account-management',
      name: 'account-management',
      component: AccountManagement,
      meta: { 
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/project-settings',
      name: 'project-settings',
      component: ProjectSettings,
      meta: { requiresAuth: true, roles: ['admin'] }
    },
    {
      path: '/projects',
      name: 'Projects',
      component: ProjectWrapper,
      meta: { requiresAuth: true, roles: ['lecturer','student','admin'] }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true } // Protected route accessible to all authenticated users
    },
    {
      path: '/feedback',
      component: FeedbackWrapper,
      meta: { requiresAuth: true, roles: ['student', 'lecturer'] },
      children: [
        {
          path: '',
          name: 'feedback',
          redirect: to => {
            const userStore = useUserStore();
            return userStore.userRole === 'student' ? '/feedback/student' : '/feedback/lecturer';
          }
        },
        {
          path: 'student',
          name: 'student-feedback',
          component: StudentFeedback,
          meta: { requiresAuth: true, roles: ['student'] }
        },
        {
          path: 'lecturer',
          name: 'lecturer-feedback',
          component: LecturerFeedback,
          meta: { requiresAuth: true, roles: ['lecturer'] }
        }
      ]
    },
    {
      path: '/data-migration',
      name: 'data-migration',
      component: DataMigration,
      meta: { 
        requiresAuth: true,
        requiresAdmin: true  // Restrict to admin only for safety
      }
    },
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'notFound',
    //   component: () => import('../views/NotFoundView.vue') // Optional 404 page
    // }
  ],
  scrollBehavior() {
    // Always scroll to top when changing routes
    return { top: 0 }
  }
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
  
  console.log('Navigation guard - Route:', to.name)
  console.log('Navigation guard - User role:', userRole)
  console.log('Navigation guard - Is authenticated:', isAuthenticated)
  console.log('Navigation guard - Route meta:', to.meta)
  
  // If coming from home page with authentication, go directly to dashboard
  if (from.path === '/' && isAuthenticated && to.path === '/login') {
    console.log('Redirecting from home to dashboard')
    next({ name: 'dashboard' })
    return
  }
  
  // If user is authenticated and tries to access login page, redirect to dashboard
  if (to.name === 'login' && isAuthenticated) {
    console.log('Redirecting from login to dashboard')
    next({ name: 'dashboard' })
    return
  }

  // Route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Route requires auth but user is not authenticated')
    // If we're on the home page, don't redirect to login
    if (from.path === '/') {
      return
    }
    next({ name: 'login' })
    return
  }
  
  // Check for admin role requirement
  if (to.meta.requiresAdmin && userRole !== 'admin') {
    console.log('Route requires admin but user is not admin')
    next({ name: 'dashboard' })
    return
  }
  
  // Check for specific role requirements
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    console.log('Route requires specific roles but user does not have them')
    console.log('Required roles:', to.meta.roles)
    console.log('User role:', userRole)
    next({ name: 'dashboard' })
    return
  }
  
  // Route is for guests only (login, register)
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('Route is for guests but user is authenticated')
    next({ name: 'dashboard' })
    return
  }
  
  // Redirect new users to profile page
  if (isAuthenticated && userStore.currentUser?.isNewUser && to.name !== 'profile') {
    console.log('New user detected, redirecting to profile page')
    next({ name: 'profile' })
    return
  }
  
  // Check if student profile is complete
  if (isAuthenticated && userRole === 'student' && !userStore.isProfileComplete && to.name !== 'profile') {
    console.log('Student profile is incomplete, redirecting to profile page')
    next({ name: 'profile' })
    return
  }
  
  // Allow navigation
  console.log('Navigation allowed')
  next()
})

export default router