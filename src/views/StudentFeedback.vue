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
        <div class="flex gap-8">
          <div class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-1">{{ submissions.length }}</div>
            <p class="text-gray-600">submissions</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-green-600 mb-1">{{ feedbackList.length }}</div>
            <p class="text-gray-600">reviewed</p>
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
          <div class="flex items-center mb-4">
            <h3 class="text-lg font-semibold mr-4">Rating</h3>
            <div class="flex">
              <template v-for="n in 5" :key="n">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  :class="[n <= selectedFeedback.rating ? 'text-yellow-400' : 'text-gray-300']"
                  class="h-5 w-5"
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </template>
            </div>
          </div>

          <div v-if="selectedFeedback.comment" class="bg-gray-50 p-4 rounded">
            <h4 class="font-medium text-gray-700 mb-2">Comment</h4>
            <div class="text-gray-600 feedback-content" v-html="selectedFeedback.comment"></div>
          </div>
          
          <div v-if="selectedFeedback.advice" class="bg-blue-50 p-4 rounded">
            <h4 class="font-medium text-blue-700 mb-2">Advice</h4>
            <div class="text-blue-600 feedback-content" v-html="selectedFeedback.advice"></div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <p>This submission is pending review.</p>
        </div>
      </div>

      <!-- Submissions Grid View -->
      <div v-else>
        <h2 class="text-xl font-semibold mb-6">Your Submissions</h2>
        
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
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getMilestoneData } from '@/utils/milestones'
import { formatDate } from '@/utils/milestoneHelpers'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default {
  name: 'StudentFeedback',
  setup() {
    const userStore = useUserStore()
    const milestoneData = ref(null)
    const submissions = ref([])
    const feedbackList = ref([])
    const selectedSubmission = ref(null)
    
    // Helper function to safely format dates
    const safeFormatDate = (timestamp) => {
      if (!timestamp) return ''
      // Handle both Firestore Timestamp and Date objects
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)
      return formatDate(date)
    }
    
    // Create a map of feedback by submission ID
    const feedbackMap = computed(() => {
      return new Map(
        feedbackList.value.map(feedback => [feedback.submissionId, feedback])
      )
    })

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
    
    const fetchSubmissions = async () => {
      if (!userStore.currentUser?.school || !userStore.currentUser?.uid) return
      
      try {
        const submissionsRef = collection(db, 'schools', userStore.currentUser.school, 'submissions')
        const q = query(submissionsRef, where('submittedBy', '==', userStore.currentUser.uid))
        const querySnapshot = await getDocs(q)
        
        submissions.value = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure submittedAt is a proper date object
            submittedAt: doc.data().submittedAt instanceof Timestamp ? 
              doc.data().submittedAt : 
              Timestamp.fromDate(new Date(doc.data().submittedAt))
          }))
          .sort((a, b) => b.submittedAt.seconds - a.submittedAt.seconds)
      } catch (error) {
        console.error('Error fetching submissions:', error)
      }
    }

    const fetchFeedback = async () => {
      if (!userStore.currentUser?.school) return

      try {
        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const submissionIds = submissions.value.map(sub => sub.id)
        
        if (submissionIds.length === 0) return

        const q = query(feedbackRef, where('submissionId', 'in', submissionIds))
        const feedbackSnapshot = await getDocs(q)

        feedbackList.value = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching feedback:', error)
      }
    }
    
    onMounted(async () => {
      if (userStore.currentUser) {
        const data = getMilestoneData(userStore.currentUser.uid)
        if (data) {
          milestoneData.value = data
        }
        await fetchSubmissions()
        await fetchFeedback()
      }
    })

    return {
      milestoneData,
      submissions,
      feedbackList,
      selectedSubmission,
      selectedFeedback,
      formatDate: safeFormatDate,
      getFeedback,
      selectSubmission
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