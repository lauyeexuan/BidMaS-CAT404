<template>
  <div class="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-bold text-gray-800">
        {{ isRegistering ? 'Create Account' : 'Welcome Back' }}
      </h2>
      <button 
        v-if="isRegistering"
        @click="toggleAuthMode" 
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        ← Back to Login
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Registration fields -->
      <template v-if="isRegistering">
        <div class="space-y-1">
          <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div class="space-y-1">
          <label for="school" class="block text-sm font-medium text-gray-700">School</label>
          <select 
            id="school" 
            v-model="form.school" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>Select your school</option>
            <option v-for="school in schools" :key="school" :value="school">
              {{ school }}
            </option>
          </select>
        </div>
      </template>
      
      <!-- Common fields -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
        <input 
          id="email" 
          v-model="form.email" 
          type="email" 
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div v-if="error" class="text-red-500 text-sm">
        {{ error }}
      </div>
      
      <div class="space-y-3">
        <button 
          type="submit" 
          class="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg
                 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          :disabled="loading"
        >
          {{ isRegistering ? 'Create Account' : 'Sign In' }}
          <span v-if="loading">...</span>
        </button>
        
        <p class="text-center text-sm text-gray-600">
          {{ isRegistering ? 'Already have an account?' : "Don't have an account?" }}
          <a 
            href="#" 
            @click.prevent="toggleAuthMode"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ isRegistering ? 'Sign In' : 'Create one' }}
          </a>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  emits: ['close', 'login-success'],
  setup(props, { emit }) {
    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()
    
    // State
    const isRegistering = ref(false)
    const loading = ref(false)
    const error = ref('')
    const schools = ref(['Computer Sciences', 'Art', 'Maths'])
    const form = ref({
      email: '',
      password: '',
      name: '',
      school: ''
    })
    
    // Method to toggle between login and registration
    const toggleAuthMode = () => {
      isRegistering.value = !isRegistering.value
      error.value = ''
    }
    
    // Handle form submission for both login and registration
    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      
      try {
        if (isRegistering.value) {
          // Registration
          await userStore.register({
            email: form.value.email,
            password: form.value.password,
            name: form.value.name,
            school: form.value.school
          })
        } else {
          // Login
          await userStore.login(form.value.email, form.value.password)
          
          // Wait for authentication state to be fully initialized
          // This ensures the router guard will recognize the user as authenticated
          if (!userStore.isAuthenticated) {
            // Wait for auth state to update
            await new Promise(resolve => {
              const checkAuth = setInterval(() => {
                if (userStore.isAuthenticated) {
                  clearInterval(checkAuth)
                  resolve()
                }
              }, 100)
            })
          }
        }
        
        // Only emit success event and let parent handle navigation
        emit('login-success')
        
      } catch (err) {
        // Handle common Firebase Auth errors
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            error.value = 'Invalid email or password'
            break
          case 'auth/email-already-in-use':
            error.value = 'Email is already registered'
            break
          case 'auth/weak-password':
            error.value = 'Password should be at least 6 characters'
            break
          case 'auth/invalid-email':
            error.value = 'Invalid email format'
            break
          default:
            error.value = err.message || 'Authentication failed'
        }
      } finally {
        loading.value = false
      }
    }
    
    // Password reset functionality
    const forgotPassword = async () => {
      if (!form.value.email) {
        error.value = 'Please enter your email address'
        return
      }
      
      loading.value = true
      
      try {
        await userStore.resetUserPassword(form.value.email)
        error.value = ''
        alert('Password reset email sent. Please check your inbox.')
      } catch (err) {
        error.value = 'Failed to send password reset email'
      } finally {
        loading.value = false
      }
    }
    
    return {
      isRegistering,
      loading,
      error,
      schools,
      form,
      toggleAuthMode,
      handleSubmit,
      forgotPassword
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
}
</style>