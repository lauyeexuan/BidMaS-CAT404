<template>
  <component :is="dashboardComponent" />
</template>

<script>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Dashboard from './Dashboard.vue'
import LecturerDashboard from './LecturerDashboard.vue'

export default {
  name: 'DashboardWrapper',
  components: {
    Dashboard,
    LecturerDashboard
  },
  setup() {
    const userStore = useUserStore()
    
    const dashboardComponent = computed(() => {
      return userStore.userRole === 'lecturer' ? LecturerDashboard : Dashboard
    })

    return {
      dashboardComponent
    }
  }
}
</script> 