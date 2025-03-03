import { auth, db } from '@/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

export const useAuthService = () => {
  /**
   * Register a new user with email and password
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Firebase user object
   */
  const register = async (userData) => {
    try {
      const { email, password, name, phone, year } = userData
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Optional: Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: name
      })
      
      // Create user profile document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        phone,
        year,
        createdAt: new Date(),
        role: 'student', // Default role
        lastLogin: new Date()
      })
      
      return user
    } catch (error) {
      console.error('Registration error:', error.code, error.message)
      throw error
    }
  }
  
  /**
   * Sign in existing user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Firebase user object
   */
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Update last login timestamp
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: new Date()
      })
      
      return userCredential.user
    } catch (error) {
      console.error('Login error:', error.code, error.message)
      throw error
    }
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  const logOut = async () => {
    return signOut(auth)
  }
  
  /**
   * Get current user profile data from Firestore
   * @param {string} uid - User ID
   * @returns {Promise<Object|null>} - User profile or null
   */
  const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid)
      const userDoc = await getDoc(docRef)
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email)
  }
  
  /**
   * Listen for authentication state changes
   * @param {Function} callback - Function to call on auth state change
   * @returns {Function} - Unsubscribe function
   */
  const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback)
  }
  
  return {
    register,
    signIn,
    logOut,
    getUserProfile,
    resetPassword,
    onAuthStateChange,
    auth // Expose auth object for direct usage if needed
  }
}