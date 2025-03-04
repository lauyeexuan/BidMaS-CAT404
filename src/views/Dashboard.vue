<template>
  <!-- Dashboard Content -->
  <div>
    <!-- Dashboard Cards -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <div class="col-span-6 bg-white p-4 shadow rounded">
        <h2 class="text-lg font-semibold">Current Milestones</h2>
        <p>Software Design Report</p>
        <p class="text-gray-500">Deadline: 20/1/2025</p>
      </div>
      <div class="col-span-6 bg-blue-600 text-white p-4 shadow rounded text-center">
        <h2 class="text-lg font-semibold">Manage project in few clicks</h2>
        <button class="mt-2 px-4 py-2 bg-white text-blue-600 rounded">Go Now</button>
      </div>
    </div>

    <!-- Submission Rate -->
    <div class="mt-6 grid grid-cols-12 gap-4">
      <div class="col-span-6 bg-white p-4 shadow rounded">
        <h2 class="text-lg font-semibold">Submission Rate</h2>
        <p>Software Design Report</p>
        <div class="w-32 h-32 mx-auto mt-4">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <path class="text-gray-200" d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="currentColor" stroke-width="4" />
            <path class="text-blue-600" d="M18 2a16 16 0 0 1 13 8" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80, 100" />
          </svg>
          <p class="text-center text-xl font-bold mt-2">84%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  setup() {
    return {}
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
  