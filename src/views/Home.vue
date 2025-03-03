<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 relative overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-100/30 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-100/30 rounded-full blur-3xl"></div>
    </div>

    <div class="container mx-auto px-4 py-16 relative">
      <div class="flex flex-col md:flex-row items-center justify-center gap-12">
        <!-- Logo section (always visible) -->
        <div class="md:w-1/4 flex-shrink-0">
          <img src="/logo.png" alt="Logo" class="w-16 h-16 object-contain" />
        </div>

        <!-- Content section (switches between welcome and login) -->
        <div class="md:w-2/3 relative min-h-[500px]">
          <!-- Welcome content -->
          <div class="transition-all duration-500 absolute inset-0"
               :class="{ 'opacity-0 translate-x-full invisible': showLogin, 'opacity-100 translate-x-0': !showLogin }">
            <h1 class="text-4xl font-bold text-gray-800 mb-6">
              Welcome to FYP Management System
            </h1>
            <p class="text-xl text-gray-600 mb-12 max-w-2xl">
              Streamline your Final Year Project journey with our comprehensive management platform
            </p>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-2 gap-6 mb-12">
              <div class="p-6 bg-white/80 backdrop-blur rounded-xl shadow-sm hover:shadow-md transition-all">
                <div class="flex items-start gap-4">
                  <div class="text-blue-600 text-2xl">📝</div>
                  <div>
                    <h3 class="text-lg font-semibold mb-2">Project Tracking</h3>
                    <p class="text-gray-600 text-sm">Track progress and milestones effortlessly</p>
                  </div>
                </div>
              </div>
              
              <div class="p-6 bg-white/80 backdrop-blur rounded-xl shadow-sm hover:shadow-md transition-all">
                <div class="flex items-start gap-4">
                  <div class="text-green-600 text-2xl">👥</div>
                  <div>
                    <h3 class="text-lg font-semibold mb-2">Supervision</h3>
                    <p class="text-gray-600 text-sm">Direct communication with supervisors</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <button 
              @click="toggleLogin"
              class="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
                     text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Get Started 
              <span class="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>

          <!-- Login form -->
          <div class="transition-all duration-500 absolute inset-0"
               :class="{ 'opacity-100 translate-x-0': showLogin, 'opacity-0 -translate-x-full invisible': !showLogin }">
            <Login v-if="showLogin" @close="showLogin = false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Login from '@/views/Login.vue'

const showLogin = ref(false)

const toggleLogin = () => {
  showLogin.value = true
}
</script>

<style scoped>
/* Optional: Add any custom animations or transitions here */
</style>
