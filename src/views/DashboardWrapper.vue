<template>
  <component :is="dashboardComponent" />
</template>

<script>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import Dashboard from './Dashboard.vue'
import LecturerDashboard from './LecturerDashboard.vue'
import AdminDashboard from './AdminDashboard.vue'

export default {
  name: 'DashboardWrapper',
  components: {
    Dashboard,
    LecturerDashboard,
    AdminDashboard
  },
  setup() {
    const userStore = useUserStore()
    
    const dashboardComponent = computed(() => {
      return userStore.userRole === 'lecturer' ? LecturerDashboard : userStore.userRole === 'admin' ? AdminDashboard : Dashboard
    })

    return {
      dashboardComponent
    }
  }
}
</script> 