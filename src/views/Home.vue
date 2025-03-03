<template>
  <div class="home-container">
    <div class="home-content" v-if="!showLogin">
      <img src="/logo.png" alt="Logo" class="logo" />
      <div class="text-container">
        <h1>Welcome to Our App</h1>
        <p>Experience the best platform with us.</p>
        <button @click="showLogin = true">Get Started</button>
      </div>
    </div>
    <Login v-else />
  </div>
</template>

<script>
import Login from "@/views/Login.vue";

export default {
  data() {
    return {
      showLogin: false,
    };
  },
  components: {
    Login,
  },
};
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #ff7eb3, #ff758c, #ff5e62);
  overflow: hidden;
}

.home-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 80%;
  max-width: 1200px;
  text-align: right;
  padding: 2rem;
}

.logo {
  width: 100px;
  height: auto;
  margin-right: 1rem;
}

.text-container {
  color: #fff;
}

button {
  background: #fff;
  color: #ff5e62;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background: #ff5e62;
  color: #fff;
}
</style>