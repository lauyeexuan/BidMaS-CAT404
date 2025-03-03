<template>
  <div class="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-lg max-w-md mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ isRegistering ? 'Create Account' : 'Welcome Back' }}
      </h2>
      <button 
        @click="$emit('close')" 
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        ← Back
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Registration fields -->
      <template v-if="isRegistering">
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
          <input 
            id="phone" 
            v-model="form.phone" 
            type="tel" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="year" class="block text-sm font-medium text-gray-700">Year</label>
          <input 
            id="year" 
            v-model="form.year" 
            type="number" 
            min="1" 
            max="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </template>
      
      <!-- Common fields -->
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
        <input 
          id="email" 
          v-model="form.email" 
          type="email" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="space-y-4">
        <button 
          type="submit" 
          class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg
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
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()
    
    // State
    const isRegistering = ref(false)
    const loading = ref(false)
    const error = ref('')
    const form = ref({
      email: '',
      password: '',
      name: '',
      phone: '',
      year: ''
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
            phone: form.value.phone,
            year: form.value.year
          })
        } else {
          // Login
          await userStore.login(form.value.email, form.value.password)
        }
        
        // Redirect after successful authentication
        const redirectPath = route.query.redirect || '/dashboard'
        router.push(redirectPath)
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