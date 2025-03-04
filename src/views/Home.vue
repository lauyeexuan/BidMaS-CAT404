<template>
  <div class="fixed inset-0 overflow-hidden bg-gradient-to-br from-fuchsia-500 via-purple-600 to-pink-500">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-400/30 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
      <div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-400/30 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 animate-blob delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-fuchsia-400/30 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob delay-4000"></div>
    </div>

    <!-- Main content -->
    <div class="absolute inset-0 flex items-center">
      <!-- Left side - Home content -->
      <div class="w-1/2 p-12 animate-fade-in" :class="{ 'opacity-70': showLogin }">
        <div class="max-w-2xl ml-auto mr-0">
          <div class="relative group mb-12">
            <div class="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img src="/logo.png" alt="Logo" class="relative w-32 h-auto transform group-hover:scale-110 transition-transform duration-500" />
          </div>
          
          <div>
            <h1 class="text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Welcome to
              <span class="block mt-4 bg-gradient-to-r from-pink-200 via-white to-purple-200 bg-clip-text text-transparent">
                Our App
              </span>
            </h1>
            <p class="text-2xl text-white/90 mb-12 font-light tracking-wide leading-relaxed">
              Experience the best platform with us.
              <span class="block mt-2 text-pink-200">Manage your projects efficiently.</span>
            </p>
            <button 
              @click="showLogin = true"
              class="group relative px-10 py-5 bg-white/90 backdrop-blur-sm text-fuchsia-600 rounded-2xl text-xl font-medium
                     hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white 
                     transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl
                     shadow-lg shadow-white/10"
              :class="{ 'opacity-0 pointer-events-none': showLogin }"
            >
              Get Started
              <span class="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right side - Login form -->
      <div class="w-1/2 p-12 transform transition-all duration-500"
           :class="showLogin ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'">
        <div class="max-w-md mx-auto">
          <Login 
            v-if="showLogin" 
            class="w-full animate-slide-in bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20"
            @close="showLogin = false"
            @login-success="handleLoginSuccess"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Login from "@/views/Login.vue";
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

export default {
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const showLogin = ref(false);
    
    const handleLoginSuccess = async () => {
      // Wait for authentication state to be fully initialized
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
      
      // Navigate to dashboard after successful login
      router.push('/dashboard');
    };
    
    return {
      showLogin,
      handleLoginSuccess
    };
  },
  components: {
    Login,
  },
};
</script>

<style scoped>
@keyframes blob {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.2); }
  66% { transform: translate(-20px, 20px) scale(0.8); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-blob {
  animation: blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out;
}
</style>