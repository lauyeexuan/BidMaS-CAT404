<template>
    <div v-if="milestone" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <!-- Development testing date picker -->
      <div class="flex items-center gap-4 mb-3 text-sm">
        <div class="text-gray-600">Current Time:</div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">(Dev Testing)</span>
          <input 
            type="datetime-local" 
            v-model="testDate"
            class="border rounded px-2 py-1"
            @change="updateTestDate"
          >
          <button 
            @click="resetTestDate" 
            class="text-blue-500 hover:text-blue-700"
          >
            Reset
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium text-blue-800">{{ milestone.description }}</h3>
          <p class="text-sm text-blue-600 mt-1">
            <template v-if="!isDeadlinePassed">
              Bidding period ends on <strong>{{ formatDate(milestone.deadline) }}</strong>.
              <br>
              <span class="text-xs italic">
                After this deadline, final project assignments will be determined based on bid priorities.
              </span>
            </template>
            <template v-else-if="!milestone.completed">
              <span class="text-amber-700">
                Bidding period has ended. Final assignments are being processed.
              </span>
            </template>
            <template v-else>
              <span class="text-green-700">
                Project assignments have been finalized based on bid priorities.
              </span>
            </template>
          </p>
        </div>
        <div class="text-sm px-3 py-1 rounded-full" 
             :class="getStatusClasses()">
          {{ getStatusText() }}
        </div>
      </div>
      
      <!-- Countdown timer if deadline is approaching -->
      <div v-if="!isDeadlinePassed && timeRemaining && showCountdown" class="mt-3 text-center">
        <p class="text-sm font-medium text-blue-800">Time Remaining:</p>
        <p class="text-lg font-bold text-blue-900">
          {{ timeRemaining.days }}d {{ timeRemaining.hours }}h {{ timeRemaining.minutes }}m {{ timeRemaining.seconds }}s
        </p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      milestone: {
        type: Object,
        default: () => null
      },
      showLecturerInfo: {
        type: Boolean,
        default: false
      },
      showCountdown: {
        type: Boolean,
        default: false
      }
    },
    
    data() {
      return {
        timeRemaining: null,
        countdownInterval: null,
        testDate: localStorage.getItem('bidmas_test_date') || null
      };
    },
    
    computed: {
      isDeadlinePassed() {
        if (!this.milestone || !this.milestone.deadline) return false;
        
        // Handle both Date objects and Firestore Timestamps
        const deadlineDate = this.milestone.deadline instanceof Date ? 
          this.milestone.deadline : 
          this.milestone.deadline.toDate();
          
        // Use test date if set, otherwise use current date
        const compareDate = this.testDate ? new Date(this.testDate) : new Date();
        return compareDate > deadlineDate;
      }
    },
    
    methods: {
      formatDate(date) {
        if (!date) return '';
        
        // Convert from timestamp if needed
        const dateObj = date instanceof Date ? date : date.toDate();
        
        return dateObj.toLocaleString('en-US', {
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      
      getStatusClasses() {
        if (!this.isDeadlinePassed) {
          return 'bg-red-100 text-red-800';
        } else if (this.isDeadlinePassed && !this.milestone.completed) {
          return 'bg-amber-100 text-amber-800';
        } else {
          return 'bg-green-100 text-green-800';
        }
      },
      
      getStatusText() {
        if (!this.isDeadlinePassed) {
          return 'Pending';
        } else if (this.isDeadlinePassed && !this.milestone.completed) {
          return 'Processing';
        } else {
          return 'Completed';
        }
      },
      
      updateTestDate() {
        // Store in localStorage when date is updated
        if (this.testDate) {
          localStorage.setItem('bidmas_test_date', this.testDate);
        }
        this.updateCountdown();
      },
      
      resetTestDate() {
        this.testDate = null;
        localStorage.removeItem('bidmas_test_date');
        this.updateCountdown();
      },

      calculateTimeRemaining() {
        if (!this.milestone || !this.milestone.deadline) return null;
        
        const now = this.testDate ? new Date(this.testDate) : new Date();
        const deadline = this.milestone.deadline instanceof Date ? 
          this.milestone.deadline : 
          this.milestone.deadline.toDate();
          
        if (now > deadline) return null;
        
        const diffMs = deadline - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return {
          days: diffDays,
          hours: diffHours,
          minutes: diffMinutes,
          seconds: diffSeconds
        };
      },
      
      startCountdown() {
        if (this.showCountdown && !this.isDeadlinePassed) {
          this.updateCountdown();
          this.countdownInterval = setInterval(this.updateCountdown, 1000);
        }
      },
      
      updateCountdown() {
        this.timeRemaining = this.calculateTimeRemaining();
        if (!this.timeRemaining) {
          clearInterval(this.countdownInterval);
        }
      }
    },
    
    mounted() {
      this.startCountdown();
    },
    
    beforeUnmount() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    },

    // Add watcher for testDate to emit changes
    watch: {
      testDate(newValue) {
        this.$emit('test-date-change', newValue);
      }
    }
  };
  </script>