import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db } from '@/firebase'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore'

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
            // First get the user's school by checking each school's users collection
            const schools = ['Computer Sciences', 'Art', 'Maths']
            let userDoc = null
            let userSchool = null

            for (const school of schools) {
              const schoolUserRef = doc(db, 'schools', school, 'users', user.uid)
              const schoolUserDoc = await getDoc(schoolUserRef)
              
              if (schoolUserDoc.exists()) {
                userDoc = schoolUserDoc
                userSchool = school
                break
              }
            }

            if (userDoc && userDoc.exists()) {
              const userData = userDoc.data()
              currentUser.value = {
                uid: user.uid,
                email: user.email,
                name: userData.name,
                school: userSchool,
                role: userData.role || 'student',
                lastLogin: userData.lastLogin,
                ...userData
              }
              
              // Update last login time
              const userRef = doc(db, 'schools', userSchool, 'users', user.uid)
              await setDoc(userRef, {
                lastLogin: serverTimestamp()
              }, { merge: true })
            } else {
              console.error('User document not found in any school collection')
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

  // Register new user
  const register = async ({ email, password, name, school }) => {
    try {
      loading.value = true
      error.value = null
      
      // Create auth user
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in the school's users collection
      const userRef = doc(db, 'schools', school, 'users', user.uid)
      await setDoc(userRef, {
        name,
        email,
        school,
        role: 'student',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      })
      
      // Set current user
      currentUser.value = {
        uid: user.uid,
        email,
        name,
        school,
        role: 'student'
      }
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
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
    clearUser,
    register
  }
})