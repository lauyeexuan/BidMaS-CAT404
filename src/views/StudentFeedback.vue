<template>
  <div class="student-feedback">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-6 mb-6">
      <!-- Upcoming Milestone Section -->
      <div v-if="milestoneData && milestoneData.upcomingMilestone" class="bg-white p-5 rounded-lg shadow-md h-[150px]">
        <h2 class="text-lg font-semibold mb-4">Current Milestone</h2>
        
        <div class="relative">
          <!-- Decorative element -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
          
          <div class="pl-4">
            <h3 class="text-lg font-semibold text-blue-800 mb-1">{{ milestoneData.upcomingMilestone.description }}</h3>
            <div class="flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Due: {{ formatDate(milestoneData.upcomingMilestone.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="bg-white p-5 rounded-lg shadow-md text-center h-[150px]">
        <p class="text-gray-500">No upcoming milestones found.</p>
      </div>

      <!-- Submissions Section -->
      <div class="bg-white p-5 rounded-lg shadow-md h-[150px] flex flex-col items-center justify-center">
        <div class="flex gap-6">
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-1">{{ submissions.length }}</div>
            <p class="text-gray-600">submissions</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-green-600 mb-1">
              {{ supervisorFeedbackCount }}
            </div>
            <p class="text-gray-600">supervisor reviewed</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-purple-600 mb-1">
              {{ examinerFeedbackCount }}
            </div>
            <p class="text-gray-600">examiner reviewed</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Submissions Grid / Feedback Detail View -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <!-- Back button for feedback detail view -->
      <div v-if="selectedSubmission" class="mb-6">
        <button 
          @click="selectedSubmission = null"
          class="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Submissions
        </button>
      </div>

      <!-- Submission Detail View -->
      <div v-if="selectedSubmission" class="space-y-6">
        <div class="border-b pb-4">
          <h2 class="text-xl font-semibold mb-2">{{ selectedSubmission.milestoneDescription }}</h2>
          <p class="text-gray-500">Submitted: {{ formatDate(selectedSubmission.submittedAt) }}</p>
          <div class="flex items-center mt-2">
            <p class="text-gray-500 mr-2">File:</p>
            <a 
              v-if="selectedSubmission.downloadUrl" 
              :href="selectedSubmission.downloadUrl"
              target="_blank"
              class="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
            >
              {{ selectedSubmission.fileName }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <span v-else class="text-gray-500">{{ selectedSubmission.fileName }}</span>
          </div>
        </div>

        <div v-if="selectedFeedback" class="space-y-4">
          <div v-if="selectedFeedback.comment" class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium text-gray-700 mb-2">Comment</h4>
            <div class="text-gray-600 feedback-content" v-html="selectedFeedback.comment"></div>
          </div>
          
          <div v-if="selectedFeedback.advice" class="bg-blue-50 p-4 rounded">
            <h4 class="font-medium text-blue-700 mb-2">Advice</h4>
            <div class="text-blue-600 feedback-content" v-html="selectedFeedback.advice"></div>
          </div>
          
          <!-- Attachment Section -->
          <div v-if="selectedFeedback.attachmentUrl" class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium text-gray-700 mb-2">Attachment</h4>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">{{ selectedFeedback.attachmentName }}</p>
                <p class="text-xs text-gray-500" v-if="selectedFeedback.attachmentSize">
                  {{ formatFileSize(selectedFeedback.attachmentSize) }}
                </p>
              </div>
              <a 
                :href="selectedFeedback.attachmentUrl" 
                target="_blank" 
                download
                class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <p>This submission is pending review.</p>
        </div>
      </div>

      <!-- Submissions Grid View -->
      <div v-else>
        <h2 class="text-xl font-semibold mb-4">Your Submissions</h2>
        
        <!-- Role Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex" aria-label="Tabs">
              <button
                @click="currentRole = 'supervisor'"
                class="w-1/2 py-3 px-1 text-center border-b-2 font-medium text-sm"
                :class="currentRole === 'supervisor' ? 
                  'border-blue-500 text-blue-600' : 
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Supervisor Feedback
              </button>
              <button
                @click="currentRole = 'examiner'"
                class="w-1/2 py-3 px-1 text-center border-b-2 font-medium text-sm"
                :class="currentRole === 'examiner' ? 
                  'border-blue-500 text-blue-600' : 
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Examiner Feedback
              </button>
            </nav>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="submission in submissions" 
            :key="submission.id"
            @click="selectSubmission(submission)"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium text-gray-800 truncate flex-1">{{ submission.fileName }}</h3>
              <span 
                :class="[
                  'text-xs px-2 py-1 rounded-full ml-2',
                  getFeedback(submission.id) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ getFeedback(submission.id) ? 'Reviewed' : 'Pending Review' }}
              </span>
            </div>
            <p class="text-sm text-gray-500 truncate">{{ submission.milestoneDescription }}</p>
            <p class="text-xs text-gray-400 mt-2">{{ formatDate(submission.submittedAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getMilestoneData } from '@/utils/milestones'
import { formatDate } from '@/utils/milestoneHelpers'
import { collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'StudentFeedback',
  setup() {
    const userStore = useUserStore()
    const milestoneData = ref(null)
    const submissions = ref([])
    const feedbackList = ref([])
    const allFeedbackList = ref([])
    const selectedSubmission = ref(null)
    const unsubscribers = ref([])
    const currentRole = ref('supervisor')
    
    // Update computed properties to use allFeedbackList
    const supervisorFeedbackCount = computed(() => {
      return allFeedbackList.value.filter(f => f.role === 'supervisor').length
    })
    
    const examinerFeedbackCount = computed(() => {
      return allFeedbackList.value.filter(f => f.role === 'examiner').length
    })

    // Create a map of feedback by submission ID using filtered feedback
    const feedbackMap = computed(() => {
      return new Map(
        feedbackList.value.map(feedback => [feedback.submissionId, feedback])
      )
    })

    // Helper function to safely format dates
    const safeFormatDate = (timestamp) => {
      if (!timestamp) return ''
      // Handle both Firestore Timestamp and Date objects
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)
      return formatDate(date)
    }
    
    // Get feedback for a submission
    const getFeedback = (submissionId) => {
      return feedbackMap.value.get(submissionId)
    }

    // Computed property for selected submission's feedback
    const selectedFeedback = computed(() => {
      if (!selectedSubmission.value) return null
      return getFeedback(selectedSubmission.value.id)
    })

    const selectSubmission = (submission) => {
      selectedSubmission.value = submission
    }
    
    const setupSubmissionsListener = () => {
      if (!userStore.currentUser?.school || !userStore.currentUser?.uid) return
      
      try {
        const submissionsRef = collection(db, 'schools', userStore.currentUser.school, 'submissions')
        const q = query(submissionsRef, where('submittedBy', '==', userStore.currentUser.uid))
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          submissions.value = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              submittedAt: doc.data().submittedAt instanceof Timestamp ? 
                doc.data().submittedAt : 
                Timestamp.fromDate(new Date(doc.data().submittedAt))
            }))
            .sort((a, b) => b.submittedAt.seconds - a.submittedAt.seconds)
            
          // After submissions are updated, setup feedback listener
          setupFeedbackListener()
        }, (error) => {
          console.error('Error in submissions listener:', error)
        })
        
        unsubscribers.value.push(unsubscribe)
      } catch (error) {
        console.error('Error setting up submissions listener:', error)
      }
    }

    const setupFeedbackListener = () => {
      if (!userStore.currentUser?.school) return

      try {
        // Clear any existing feedback listeners
        unsubscribers.value.forEach(unsubscribe => {
          if (unsubscribe._feedbackListener) {
            unsubscribe()
            const index = unsubscribers.value.indexOf(unsubscribe)
            if (index > -1) {
              unsubscribers.value.splice(index, 1)
            }
          }
        })

        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const submissionIds = submissions.value.map(sub => sub.id)
        
        if (submissionIds.length === 0) return

        // Query for all feedback (for stats)
        const allFeedbackQuery = query(
          feedbackRef,
          where('submissionId', 'in', submissionIds)
        )
        
        // Query for role-specific feedback (for display)
        const roleFeedbackQuery = query(
          feedbackRef,
          where('submissionId', 'in', submissionIds),
          where('role', '==', currentRole.value)
        )
        
        // Listener for all feedback (stats)
        const allFeedbackUnsubscribe = onSnapshot(allFeedbackQuery, (snapshot) => {
          allFeedbackList.value = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(feedback => !feedback.isDraft)
        }, (error) => {
          console.error('Error in all feedback listener:', error)
        })
        
        // Listener for role-specific feedback (display)
        const roleFeedbackUnsubscribe = onSnapshot(roleFeedbackQuery, (snapshot) => {
          feedbackList.value = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(feedback => !feedback.isDraft)
        }, (error) => {
          console.error('Error in role feedback listener:', error)
        })
        
        // Mark both unsubscribe functions as feedback listeners
        allFeedbackUnsubscribe._feedbackListener = true
        roleFeedbackUnsubscribe._feedbackListener = true
        unsubscribers.value.push(allFeedbackUnsubscribe, roleFeedbackUnsubscribe)
      } catch (error) {
        console.error('Error setting up feedback listener:', error)
      }
    }

    // Watch for role changes
    watch(currentRole, () => {
      setupFeedbackListener()
    })
    
    // Helper function to format file size
    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    onMounted(() => {
      if (userStore.currentUser) {
        const data = getMilestoneData(userStore.currentUser.uid)
        if (data) {
          milestoneData.value = data
        }
        setupSubmissionsListener()
      }
    })

    // Cleanup listeners when component unmounts
    onUnmounted(() => {
      unsubscribers.value.forEach(unsubscribe => unsubscribe())
      unsubscribers.value = []
    })

    return {
      milestoneData,
      submissions,
      feedbackList,
      selectedSubmission,
      selectedFeedback,
      formatDate: safeFormatDate,
      getFeedback,
      selectSubmission,
      formatFileSize,
      currentRole,
      supervisorFeedbackCount,
      examinerFeedbackCount,
    }
  }
}
</script>

<style>
/* Global styles for this component */
.student-feedback {
  padding: 20px;
}

/* Rich text content styling */
.feedback-content {
  line-height: 1.5;
  overflow: hidden; /* Prevent margin collapse */
}

/* Quill specific size classes */
.feedback-content .ql-size-small {
  font-size: 0.75em;
}

.feedback-content .ql-size-large {
  font-size: 1.5em;
}

.feedback-content .ql-size-huge {
  font-size: 2.5em;
}

.feedback-content ol,
.feedback-content ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.feedback-content ol {
  list-style-type: decimal !important;
}

.feedback-content ul {
  list-style-type: disc !important;
}

.feedback-content li {
  margin-bottom: 0.25rem;
  display: list-item !important;
}

.feedback-content p {
  margin-bottom: 0.75rem;
}

.feedback-content strong {
  font-weight: 600;
}

.feedback-content em {
  font-style: italic;
}

.feedback-content u {
  text-decoration: underline;
}

.feedback-content blockquote {
  border-left: 3px solid #e2e8f0;
  padding-left: 1rem;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #4a5568;
}

.feedback-content h1,
.feedback-content h2,
.feedback-content h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feedback-content h1 {
  font-size: 1.5rem;
}

.feedback-content h2 {
  font-size: 1.25rem;
}

.feedback-content h3 {
  font-size: 1.125rem;
}

.feedback-content img {
  max-width: 100%;
  height: auto;
}

.feedback-content a {
  color: #3182ce;
  text-decoration: underline;
}

.feedback-content a:hover {
  color: #2c5282;
}

/* Support for superscript and subscript */
.feedback-content sup {
  vertical-align: super;
  font-size: smaller;
}

.feedback-content sub {
  vertical-align: sub;
  font-size: smaller;
}

/* Support for code blocks */
.feedback-content pre {
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.feedback-content code {
  font-family: monospace;
  background-color: #f7fafc;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
</style> 