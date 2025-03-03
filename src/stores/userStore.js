import { defineStore } from 'pinia'
import { useAuthService } from '@/services/AuthService'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const authService = useAuthService()
  
  // State
  const currentUser = ref(null)
  const loading = ref(true)
  const error = ref(null)
  
  // Getters
  const isAuthenticated = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || null)
  const isAdmin = computed(() => userRole.value === 'admin')
  
  // Actions
  const initializeAuth = () => {
    return new Promise((resolve) => {
      const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
        loading.value = true
        
        try {
          if (firebaseUser) {
            const userProfile = await authService.getUserProfile(firebaseUser.uid)
            currentUser.value = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              ...userProfile
            }
          } else {
            currentUser.value = null
          }
          error.value = null
        } catch (err) {
          error.value = err.message
          currentUser.value = null
        } finally {
          loading.value = false
          resolve()
        }
      })
      
      // Return unsubscribe function to prevent memory leaks
      return unsubscribe
    })
  }
  
  const register = async (userData) => {
    try {
      await authService.register(userData)
      error.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  const login = async (email, password) => {
    try {
      await authService.signIn(email, password)
      error.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  const logout = async () => {
    try {
      await authService.logOut()
      currentUser.value = null
      error.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  const resetUserPassword = async (email) => {
    try {
      await authService.resetPassword(email)
      error.value = null
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  return {
    currentUser,
    loading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    initializeAuth,
    register,
    login,
    logout,
    resetUserPassword
  }
})