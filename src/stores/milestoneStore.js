import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMilestoneStore = defineStore('milestone', () => {
  const upcomingMilestone = ref(null)
  const allMilestones = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Set milestone data
  const setMilestoneData = (upcoming, all) => {
    upcomingMilestone.value = upcoming
    allMilestones.value = all || []
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return ''
    
    try {
      // Convert from timestamp if needed
      const dateObj = date instanceof Date ? date : date.toDate()
      
      return dateObj.toLocaleString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    } catch (err) {
      return 'Invalid date'
    }
  }

  // Function to calculate days remaining until deadline
  const getDaysRemaining = (milestone) => {
    if (!milestone || !milestone.deadline) return 0
    
    const deadlineDate = milestone.deadline instanceof Date ? 
      milestone.deadline : 
      milestone.deadline.toDate()
    
    const now = new Date()
    
    // If deadline has passed, return 0
    if (now > deadlineDate) return 0
    
    // Calculate days remaining
    const diffTime = Math.abs(deadlineDate - now)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }
  
  // Function to get text for days remaining
  const getDaysRemainingText = (milestone) => {
    const days = getDaysRemaining(milestone)
    
    if (days === 0) {
      return 'Due today'
    } else if (days === 1) {
      return '1 day left'
    } else {
      return `${days} days left`
    }
  }
  
  // Function to get class for days remaining text
  const getDaysRemainingClass = (milestone) => {
    const days = getDaysRemaining(milestone)
    
    if (days < 3) {
      return 'text-red-600'
    } else if (days < 7) {
      return 'text-orange-500'
    } else {
      return 'text-green-600'
    }
  }

  return {
    upcomingMilestone,
    allMilestones,
    loading,
    error,
    setMilestoneData,
    formatDate,
    getDaysRemaining,
    getDaysRemainingText,
    getDaysRemainingClass
  }
}) 