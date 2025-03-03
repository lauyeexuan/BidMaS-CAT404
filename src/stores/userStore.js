import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '@/firebase'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const initialized = ref(false)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || 'student')

  // Initialize auth state
  const initializeAuth = () => {
    return new Promise((resolve) => {
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        loading.value = true
        
        if (user) {
          try {
            // Get additional user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (userDoc.exists()) {
              currentUser.value = {
                uid: user.uid,
                email: user.email,
                name: userDoc.data().name,
                role: userDoc.data().role,
                lastLogin: userDoc.data().lastLogin,
                ...userDoc.data()
              }
              
              // Update last login time
              await setDoc(doc(db, 'users', user.uid), {
                lastLogin: serverTimestamp()
              }, { merge: true })
            } else {
              console.error('User document not found in Firestore')
              currentUser.value = null
            }
          } catch (error) {
            console.error('Error fetching user data:', error)
            currentUser.value = null
          }
        } else {
          currentUser.value = null
        }
        
        loading.value = false
        initialized.value = true
        resolve()
      })

      // Clean up subscription on store disposal
      if (import.meta.hot) {
        import.meta.hot.dispose(() => {
          unsubscribe()
        })
      }
    })
  }

  // Login
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await signOut(auth)
      currentUser.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear user data
  const clearUser = () => {
    currentUser.value = null
    error.value = null
  }

  return {
    currentUser,
    isAuthenticated,
    userRole,
    loading,
    error,
    initialized,
    initializeAuth,
    login,
    logout,
    resetPassword,
    clearUser
  }
})