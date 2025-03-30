<template>
  <div class="fixed inset-0 overflow-hidden bg-gradient-to-br from-fuchsia-400 via-purple-400 to-pink-400">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-pink-300/40 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
      <div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-300/40 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 animate-blob delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-fuchsia-300/40 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob delay-4000"></div>
    </div>

    <!-- Main content -->
    <div class="absolute inset-0 flex items-center">
      <!-- Left side - Home content -->
      <div class="w-1/2 p-12 animate-fade-in">
        <div class="max-w-2xl ml-auto mr-0">
          <div class="relative group mb-12">
            <!-- Glowing cloud effect -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none">
              <div class="absolute inset-0 bg-white/40 rounded-full blur-[100px] animate-pulse-slow"></div>
              <div class="absolute inset-[25%] bg-white/30 rounded-full blur-[50px] animate-pulse-slow animation-delay-1000"></div>
            </div>
            <!-- Logo container -->
            <div class="relative min-h-[288px] flex flex-col justify-end">
              <template v-if="!showAnimation">
                <img 
                  src="/welcomelogo.png" 
                  alt="Welcome to BidMaS" 
                  class="relative w-72 h-auto transform animate-pulse-welcome transition-transform duration-500 -ml-8"
                />
              </template>
              <template v-else>
                <div class="relative w-full mb-4 pl-0">
                  <h1 class="text-5xl font-bold text-white drop-shadow-lg">
                    Welcome to
                    <span class="block mt-1 bg-gradient-to-r from-pink-200 via-white to-purple-200 bg-clip-text text-transparent">
                      BidMaS
                    </span>
                  </h1>
                </div>
                <!-- Running logo appears to the right of welcome logo -->
                <img 
                  src="/runninglogo.png" 
                  alt="Running BidMaS Logo" 
                  class="fixed top-1/4 left-1/3 w-72 h-auto animate-run-and-hide z-10 pointer-events-none"
                />
              </template>
            </div>
          </div>
          
          <div class="mt-8">
            <p class="text-2xl text-white/90 mb-12 font-light tracking-wide leading-relaxed">
              Experience the best platform with us.
              <span class="block mt-2 text-pink-200">Manage your projects efficiently.</span>
            </p>
            <button 
              @click="startLoginAnimation"
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
        <div class="max-w-md mx-auto relative z-50">
          <!-- Waving logo at the left edge of login form -->
          <img 
            v-if="showLogin"
            src="/wavinglogo.png" 
            alt="Waving Logo" 
            class="absolute right-full top-0 h-28 w-auto animate-fade-in animate-wave pointer-events-none"
          />
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
    const showAnimation = ref(false);
    
    const startLoginAnimation = () => {
      showAnimation.value = true;
      
      // Show the login form sooner
      setTimeout(() => {
        showLogin.value = true;
      }, 700); // Reduced from 700ms to 400ms
    };
    
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
      showAnimation,
      startLoginAnimation,
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

@keyframes pulse-slow {
  0% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 0.7; transform: scale(1.05); }
  100% { opacity: 0.5; transform: scale(0.95); }
}

@keyframes drop-down {
  0% { transform: translateY(0) rotate(0); }
  100% { transform: translateY(150%) rotate(5deg); }
}

@keyframes run-and-hide {
  0% { opacity: 0; transform: translate(-150px, 0) scale(0.8); }
  30% { opacity: 1; transform: translate(0, 0) scale(1.1); }
  70% { opacity: 1; transform: translate(150px, 0) scale(1.1); }
  100% { opacity: 0; transform: translate(300px, 0) scale(0.8); }
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

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-drop-down {
  animation: drop-down 0.6s ease-in forwards;
}

.animate-run-and-hide {
  animation: run-and-hide 1.0s ease-in-out forwards;
}

.animation-delay-1000 {
  animation-delay: 1s;
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

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(8deg); }
  20% { transform: rotate(-4deg); }
  30% { transform: rotate(8deg); }
  40% { transform: rotate(-2deg); }
  50% { transform: rotate(6deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-wave {
  animation: wave 1.6s ease-in-out infinite;
  transform-origin: 70% 70%;
}

@keyframes pulse-welcome {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.animate-pulse-welcome {
  animation: pulse-welcome 2s ease-in-out infinite;
}
</style>