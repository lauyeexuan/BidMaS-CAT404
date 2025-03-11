<template>
    <div v-if="milestone" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
          
          <!-- Additional explanation for lecturers -->
          <div v-if="showLecturerInfo && !isDeadlinePassed" class="mt-2 p-2 bg-white bg-opacity-50 rounded border border-blue-100">
            <p class="text-xs text-blue-800">
              <strong>Note for lecturers:</strong> You can accept bids from multiple students before the deadline. 
              After the deadline passes, students will be assigned to projects based on their bid priorities.
            </p>
          </div>
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
        countdownInterval: null
      };
    },
    
    computed: {
      isDeadlinePassed() {
        if (!this.milestone || !this.milestone.deadline) return false;
        
        // Handle both Date objects and Firestore Timestamps
        const deadlineDate = this.milestone.deadline instanceof Date ? 
          this.milestone.deadline : 
          this.milestone.deadline.toDate();
          
        return new Date() > deadlineDate;
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
        if (this.milestone.completed) {
          return 'bg-green-100 text-green-800';
        } else if (this.isDeadlinePassed) {
          return 'bg-amber-100 text-amber-800';
        } else {
          return 'bg-blue-100 text-blue-800';
        }
      },
      
      getStatusText() {
        if (this.milestone.completed) {
          return 'Completed';
        } else if (this.isDeadlinePassed) {
          return 'Processing';
        } else {
          return 'Pending';
        }
      },
      
      calculateTimeRemaining() {
        if (!this.milestone || !this.milestone.deadline) return null;
        
        const now = new Date();
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
    }
  };
  </script>