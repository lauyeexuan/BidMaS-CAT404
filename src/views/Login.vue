<template>
    <div class="login-container">
      <div class="login-form">
        <h1 class="title">{{ isRegistering ? 'Create Account' : 'Login' }}</h1>
        
        <form @submit.prevent="handleSubmit">
          <!-- Registration fields -->
          <template v-if="isRegistering">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                id="name" 
                v-model="form.name" 
                type="text" 
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                id="phone" 
                v-model="form.phone" 
                type="tel" 
                class="form-control"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="year">Year</label>
              <input 
                id="year" 
                v-model="form.year" 
                type="number" 
                min="1" 
                max="4"
                class="form-control"
                required
              />
            </div>
          </template>
          
          <!-- Common fields for both login and registration -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              id="email" 
              v-model="form.email" 
              type="email" 
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password" 
              v-model="form.password" 
              type="password" 
              class="form-control"
              required
            />
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading"
            >
              {{ isRegistering ? 'Register' : 'Login' }}
              <span v-if="loading"> ...</span>
            </button>
            
            <div class="toggle-auth">
              {{ isRegistering ? 'Already have an account?' : 'Need an account?' }}
              <a href="#" @click.prevent="toggleAuthMode">
                {{ isRegistering ? 'Login' : 'Register' }}
              </a>
            </div>
            
            <div v-if="!isRegistering" class="forgot-password">
              <a href="#" @click.prevent="forgotPassword">Forgot Password?</a>
            </div>
          </div>
        </form>
      </div>
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