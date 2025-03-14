<template>
    <div v-if="milestone" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <!-- Major Selector (if multiple majors available) -->
      <div v-if="availableMajors && availableMajors.length > 1" class="mb-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Viewing milestone for:</span>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="major in availableMajors" 
              :key="major"
              @click="changeMajor(major)"
              class="px-3 py-1 text-xs rounded-full transition-colors"
              :class="major === selectedMajor ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              {{ major }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Development testing date picker -->
      <div class="flex items-center gap-4 mb-3 text-sm">
        <div class="text-gray-600">Current Time: 
          <span class="font-medium">{{ testDate ? formatDate(new Date(testDate)) : formatDate(new Date()) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-gray-500">(Dev Testing)</span>
          <input 
            type="datetime-local" 
            v-model="formattedTestDate"
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
            <template v-if="!isDeadlinePassedComputed">
              Bidding period ends on <strong>{{ formatDate(milestone.deadline) }}</strong>.
              <br>
              <span class="text-xs italic">
                After this deadline, final project assignments will be determined based on bid priorities.
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
      <div v-if="!isDeadlinePassedComputed && timeRemaining && showCountdown" class="mt-3 text-center">
        <p class="text-sm font-medium text-blue-800">Time Remaining:</p>
        <p class="text-lg font-bold text-blue-900">
          {{ timeRemaining.days }}d {{ timeRemaining.hours }}h {{ timeRemaining.minutes }}m {{ timeRemaining.seconds }}s
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import { testDateManager } from '@/utils/testDateManager';

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
      },
      // Add new props for major selection
      availableMajors: {
        type: Array,
        default: () => []
      },
      selectedMajor: {
        type: String,
        default: ''
      }
    },
    
    data() {
      const savedDate = localStorage.getItem('bidmas_test_date');
      return {
        timeRemaining: null,
        countdownInterval: null,
        testDate: savedDate || null,
        formattedTestDate: null,
        // Add a reactive property to force updates
        testDateVersion: 0
      };
    },
    
    computed: {
      // Create a computed property that depends on testDateVersion to force reactivity
      isDeadlinePassedComputed() {
        // Using testDateVersion to ensure this is recalculated when testDate changes
        this.testDateVersion; // Just reference it to create dependency
        return this.isDeadlinePassed();
      }
    },
    
    methods: {
      // Add new method to handle major change
      changeMajor(major) {
        if (major !== this.selectedMajor) {
          this.$emit('major-change', major);
        }
      },
      
      isDeadlinePassed() {
        if (!this.milestone || !this.milestone.deadline) return false;
        
        const deadlineDate = this.milestone.deadline instanceof Date ? 
          this.milestone.deadline : 
          this.milestone.deadline.toDate();
          
        const compareDate = this.testDate ? new Date(this.testDate) : new Date();
        return compareDate > deadlineDate;
      },
      
      // Format date for datetime-local input
      formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        // Format as YYYY-MM-DDThh:mm
        return d.getFullYear() + '-' + 
               String(d.getMonth() + 1).padStart(2, '0') + '-' + 
               String(d.getDate()).padStart(2, '0') + 'T' + 
               String(d.getHours()).padStart(2, '0') + ':' + 
               String(d.getMinutes()).padStart(2, '0');
      },
      
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
        if (!this.isDeadlinePassedComputed) {
          return 'bg-amber-100 text-amber-800';
        } else {
          return 'bg-green-100 text-green-800';
        }
      },
      
      getStatusText() {
        if (!this.isDeadlinePassedComputed) {
          return 'Pending';
        } else {
          return 'Completed';
        }
      },
      
      updateTestDate() {
        if (this.formattedTestDate) {
          // Convert from formatted string to date
          const newDate = new Date(this.formattedTestDate);
          this.testDate = newDate.toISOString();
          localStorage.setItem('bidmas_test_date', this.testDate);
          
          // Force update the test date manager
          testDateManager.setTestDate(newDate);
          
          // Increment version to trigger reactivity
          this.testDateVersion++;
          
          // Emit the change
          this.$emit('test-date-change', newDate);
          
          // Update countdown
          this.updateCountdown();
        }
      },
      
      resetTestDate() {
        this.testDate = null;
        this.formattedTestDate = null;
        localStorage.removeItem('bidmas_test_date');
        
        // Reset test date manager
        testDateManager.setTestDate(null);
        
        // Increment version to trigger reactivity
        this.testDateVersion++;
        
        // Emit the change
        this.$emit('test-date-change', null);
        
        // Update countdown
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
        if (this.showCountdown && !this.isDeadlinePassedComputed) {
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
      // Initialize with the saved date if available
      if (this.testDate) {
        this.formattedTestDate = this.formatDateForInput(new Date(this.testDate));
      }
      
      this.startCountdown();
    },
    
    beforeUnmount() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
    },

    watch: {
      // Watch for milestone changes and update countdown
      milestone: {
        handler() {
          this.updateCountdown();
        },
        deep: true
      },
      
      // Watch for testDate changes coming from other components
      testDate: {
        handler(newVal) {
          if (newVal) {
            this.formattedTestDate = this.formatDateForInput(new Date(newVal));
          } else {
            this.formattedTestDate = null;
          }
          // Increment version to trigger reactivity
          this.testDateVersion++;
          this.updateCountdown();
        }
      }
    }
  };
  </script>