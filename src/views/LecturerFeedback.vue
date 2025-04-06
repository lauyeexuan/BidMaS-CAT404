<template>
  <div class="lecturer-feedback">
    <!-- Left Side Content (Main Content) -->
    <div class="w-3/4 mr-6">
      <!-- Role Tabs -->
      <div class="mb-4">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex" aria-label="Tabs">
            <button
              @click="currentRole = 'supervisor'"
              class="w-1/2 py-3 px-1 text-center border-b-2 font-medium text-sm"
              :class="currentRole === 'supervisor' ? 
                'border-blue-500 text-blue-600' : 
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              As Supervisor
            </button>
            <button
              @click="currentRole = 'examiner'"
              class="w-1/2 py-3 px-1 text-center border-b-2 font-medium text-sm"
              :class="currentRole === 'examiner' ? 
                'border-blue-500 text-blue-600' : 
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              As Examiner
            </button>
          </nav>
        </div>
      </div>

      <!-- Submissions Section - Used for both roles -->
      <div class="bg-white p-4 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4">
          <template v-if="!showFeedbackView">
            <div class="flex justify-between items-center">
              <div>
                {{ currentRole === 'supervisor' ? 'Supervisor' : 'Examiner' }} Submissions
                <span v-if="selectedMajor || selectedMilestoneFilter" class="text-lg font-normal text-gray-600">
                  {{ getFilterDescription }}
                </span>
                <!-- Status Filter Labels -->
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-sm text-gray-500">Filter by:</span>
                  <div 
                    @click="toggleStatusFilter('all')" 
                    class="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
                    :class="statusFilter === 'all' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    All
                  </div>
                  <div 
                    @click="toggleStatusFilter('draft')" 
                    class="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
                    :class="statusFilter === 'draft' ? 'bg-gray-600 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    Draft
                  </div>
                  <div 
                    @click="toggleStatusFilter('pending')" 
                    class="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
                    :class="statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    Pending
                  </div>
                  <div 
                    @click="toggleStatusFilter('reviewed')" 
                    class="px-3 py-1 rounded-full text-xs cursor-pointer transition-colors"
                    :class="statusFilter === 'reviewed' ? 'bg-green-100 text-green-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  >
                    Reviewed
                  </div>
                </div>
              </div>
              <div class="relative">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search for filename, student or project"
                  class="w-96 px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </template>
          <template v-else>
            <button 
              @click="returnToSubmissions"
              class="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Submissions
            </button>
          </template>
        </h2>

        <!-- Feedback View -->
        <div v-if="showFeedbackView" class="space-y-6">
          <!-- Submission Info -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-medium text-gray-900">{{ selectedSubmission.fileName }}</h3>
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {{ selectedSubmission.major }}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              Submitted by {{ selectedSubmission.studentName }}
            </p>
            <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <p class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {{ selectedSubmission.projectTitle }}
              </p>
              <p class="flex items-center" v-if="selectedSubmission.submittedAt">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDate(selectedSubmission.submittedAt.toDate()) }}
              </p>
            </div>
            <a 
              :href="selectedSubmission.downloadUrl"
              target="_blank"
              class="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Submission
            </a>
          </div>

          <!-- Feedback Form -->
          <form @submit.prevent="saveFeedback" class="space-y-6">
            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div class="flex items-center gap-2">
                <template v-for="i in 5" :key="i">
                  <button
                    type="button"
                    @click="feedbackData.rating = i"
                    class="focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-8 w-8"
                      :class="i <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- Comment -->
            <div>
              <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <QuillEditor
                id="comment"
                v-model:content="feedbackData.comment"
                theme="snow"
                :toolbar="editorToolbar"
                contentType="html"
                class="bg-white rounded-md border-gray-300 h-40 feedback-editor"
                placeholder="Enter your feedback comment..."
              />
            </div>

            <!-- Advice -->
            <div>
              <label for="advice" class="block text-sm font-medium text-gray-700 mb-2">Advice for Improvement</label>
              <QuillEditor
                id="advice"
                v-model:content="feedbackData.advice"
                theme="snow"
                :toolbar="editorToolbar"
                contentType="html"
                class="bg-white rounded-md border-gray-300 h-40 feedback-editor"
                placeholder="Enter your advice for improvement..."
              />
            </div>

            <!-- File Attachment -->
            <div>
              <label for="attachment" class="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
              <div class="flex items-start">
                <div class="w-full">
                  <div 
                    class="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    @click="$refs.fileInput.click()"
                    @dragover.prevent="dragover = true"
                    @dragleave.prevent="dragover = false"
                    @drop.prevent="handleFileDrop"
                    :class="{'border-blue-300 bg-blue-50': dragover}"
                  >
                    <input 
                      ref="fileInput"
                      type="file"
                      id="attachment"
                      class="hidden"
                      @change="handleFileChange"
                    />
                    <div class="text-center" v-if="!feedbackData.attachment">
                      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="mt-1 text-sm text-gray-500">Click to upload a file or drag and drop</p>
                      <p class="text-xs text-gray-400">PDF, Word, Excel, PowerPoint, or Images</p>
                    </div>
                    <div v-else class="flex items-center justify-between w-full">
                      <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p class="text-sm font-medium text-gray-700 truncate">{{ feedbackData.attachment.name }}</p>
                          <p class="text-xs text-gray-500">{{ formatFileSize(feedbackData.attachment.size) }}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        @click.stop="removeAttachment" 
                        class="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="feedbackData.attachmentUrl && !feedbackData.attachment" class="mt-2 flex items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Previous attachment will be replaced if you upload a new file</span>
              </div>
              
              <!-- Show existing attachment -->
              <div v-if="feedbackData.attachmentUrl && !feedbackData.attachment" class="mt-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-700">{{ feedbackData.attachmentName }}</p>
                      <p class="text-xs text-gray-500" v-if="feedbackData.attachmentSize">
                        {{ formatFileSize(feedbackData.attachmentSize) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <a 
                      :href="feedbackData.attachmentUrl" 
                      target="_blank" 
                      download 
                      class="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    <button 
                      type="button" 
                      @click="removeExistingAttachment" 
                      class="px-2 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="feedbackSuccess" class="mb-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feedbackSuccess }}
            </div>

            <!-- Error Message -->
            <p v-if="feedbackError" class="text-red-600 text-sm">{{ feedbackError }}</p>

            <!-- Submit Button -->
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="saveDraft"
                class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center gap-2 shadow-sm"
                :disabled="feedbackLoading"
              >
                <svg v-if="!feedbackLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <svg v-else class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ feedbackLoading ? 'Saving...' : 'Save Draft' }}
              </button>
              <button
                type="submit"
                class="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center gap-2 shadow-md hover:shadow-lg"
                :disabled="feedbackLoading"
              >
                <svg v-if="!feedbackLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ feedbackLoading ? 'Saving...' : 'Send Feedback' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Submissions List (Original Content) -->
        <template v-else>
          <transition
            name="fade"
            mode="out-in"
          >
            <!-- Initial Loading State -->
            <div v-if="submissionsLoading && !submissions.length" class="py-4" key="loading">
              <div class="animate-pulse space-y-4">
                <div class="h-24 bg-gray-200 rounded"></div>
                <div class="h-24 bg-gray-200 rounded"></div>
                <div class="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="submissionsError" class="text-red-500 py-4 text-center" key="error">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{{ submissionsError }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!submissions.length" class="text-center py-8" key="empty">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-500">No submissions found</p>
              <p class="text-sm text-gray-400">
                {{ selectedMajor || selectedMilestoneFilter ? 'Try adjusting your filters' : 'Waiting for student submissions' }}
              </p>
            </div>

            <!-- Submission Cards with Virtual Scrolling -->
            <div v-else class="relative" key="submissions">
              <!-- Submission Grid -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div
                  v-for="submission in paginatedSubmissions"
                  :key="submission.id"
                  class="border rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  @click="handleSubmissionClick(submission)"
                >
                  <div class="flex flex-col space-y-2">
                    <!-- Top row: Filename, Major, and Review Status -->
                    <div class="flex items-start justify-between">
                      <div class="flex flex-col gap-1.5 max-w-[70%]">
                        <div class="flex items-center gap-2">
                          <h3 class="font-medium text-gray-900 leading-tight line-clamp-2">{{ submission.fileName }}</h3>
                          <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                            {{ submission.major }}
                          </span>
                        </div>
                        <span class="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-fit">{{ submission.studentName }}</span>
                      </div>
                      <span 
                        class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        :class="{
                          'bg-green-100 text-green-800': submission.hasBeenReviewed && !submission.isDraft,
                          'bg-yellow-100 text-yellow-800': !submission.hasBeenReviewed,
                          'bg-gray-100 text-gray-600': submission.hasBeenReviewed && submission.isDraft
                        }"
                      >
                        {{ submission.hasBeenReviewed ? (submission.isDraft ? 'Draft' : 'Reviewed') : 'Pending' }}
                      </span>
                    </div>

                    <!-- Bottom section: Project Title, Milestone, and Date -->
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p class="text-sm text-gray-700 font-medium truncate">{{ submission.projectTitle }}</p>
                      </div>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <p class="text-xs text-gray-400 truncate">{{ submission.milestoneDescription }}</p>
                        </div>
                        <div class="flex items-center gap-1" v-if="submission.submittedAt">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p class="text-xs text-gray-400">
                            {{ submission.submittedAt?.toDate?.() ? formatDate(submission.submittedAt.toDate()) : 'Date not available' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination Controls -->
              <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 py-3">
                <button 
                  @click="currentPage > 1 && (currentPage--)"
                  class="px-2 py-1 rounded transition-colors"
                  :class="currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'"
                  :disabled="currentPage === 1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <template v-if="totalPages <= 7">
                  <button 
                    v-for="page in totalPages" 
                    :key="page"
                    @click="currentPage = page"
                    class="px-3 py-1 rounded transition-colors"
                    :class="currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'"
                  >
                    {{ page }}
                  </button>
                </template>
                
                <template v-else>
                  <!-- First page -->
                  <button 
                    @click="currentPage = 1"
                    class="px-3 py-1 rounded transition-colors"
                    :class="currentPage === 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'"
                  >
                    1
                  </button>
                  
                  <!-- Ellipsis if needed -->
                  <span v-if="currentPage > 3" class="px-2">...</span>
                  
                  <!-- Pages around current -->
                  <template v-for="page in paginationRange" :key="page">
                    <button 
                      v-if="page > 1 && page < totalPages"
                      @click="currentPage = page"
                      class="px-3 py-1 rounded transition-colors"
                      :class="currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'"
                    >
                      {{ page }}
                    </button>
                  </template>
                  
                  <!-- Ellipsis if needed -->
                  <span v-if="currentPage < totalPages - 2" class="px-2">...</span>
                  
                  <!-- Last page -->
                  <button 
                    @click="currentPage = totalPages"
                    class="px-3 py-1 rounded transition-colors"
                    :class="currentPage === totalPages ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'"
                  >
                    {{ totalPages }}
                  </button>
                </template>
                
                <button 
                  @click="currentPage < totalPages && (currentPage++)"
                  class="px-2 py-1 rounded transition-colors"
                  :class="currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'"
                  :disabled="currentPage === totalPages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <!-- Items per page selector -->
              <div class="flex justify-end items-center text-sm text-gray-500 mt-2">
                <span class="mr-2">Items per page:</span>
                <select 
                  v-model="itemsPerPage" 
                  class="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
              </div>
            </div>
          </transition>
        </template>
      </div>
    </div>

    <!-- Right Side (Milestone and Filters) -->
    <div class="w-1/4">
      <!-- Current Milestone Display -->
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-sm font-medium text-gray-500">Current Milestone</h2>
          <!-- Major Selection Tabs -->
          <div class="flex space-x-2">
            <button
              v-for="major in userStore.currentUser?.major || []"
              :key="major"
              @click="currentDisplayMajor = major"
              class="px-2 py-1 text-xs rounded-full transition-colors"
              :class="currentDisplayMajor === major ? 
                'bg-blue-100 text-blue-800 font-medium' : 
                'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              {{ major }}
            </button>
          </div>
        </div>
        
        <div v-if="currentMilestoneData && currentMilestoneData.upcomingMilestone" class="relative">
          <!-- Decorative element -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-full"></div>
          
          <div class="pl-4">
            <h3 class="text-lg font-semibold text-green-800 mb-1">
              {{ currentMilestoneData.upcomingMilestone.description }}
            </h3>
            <div class="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(currentMilestoneData.upcomingMilestone.deadline) }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 text-sm">No milestone data available</p>
          <p class="text-xs text-gray-400">Please check the selected major or try again later</p>
        </div>
      </div>
      
      <!-- Submission Statistics Card -->
      <div class="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 class="text-sm font-medium text-gray-500 mb-3">
          Current Milestone Submissions ({{ currentRole === 'supervisor' ? 'Supervisor' : 'Examiner' }})
        </h2>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-gray-600">Total Submissions:</span>
          </div>
          <span class="text-lg font-semibold text-blue-600">{{ currentMilestoneSubmissionCount }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-gray-600">Reviewed:</span>
          </div>
          <span class="text-lg font-semibold text-green-600">{{ currentMilestoneReviewedCount }}</span>
        </div>
      </div>
      
      <!-- Submission Filters (Expandable) -->
      <div class="bg-white rounded-lg shadow-md">
        <div 
          class="p-4 flex justify-between items-center cursor-pointer"
          @click="toggleFilters"
        >
          <h2 class="text-lg font-semibold flex items-center">
            Filters
            <span v-if="selectedMajor || selectedMilestoneFilter" 
                  class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {{ (selectedMajor ? 1 : 0) + (selectedMilestoneFilter ? 1 : 0) }}
            </span>
          </h2>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5 transition-transform duration-300" 
            :class="{'rotate-180': showFilters}"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Expandable Filter Content -->
        <transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="max-h-0 opacity-0 overflow-hidden"
          enter-to-class="max-h-[400px] opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="max-h-[400px] opacity-100"
          leave-to-class="max-h-0 opacity-0 overflow-hidden"
        >
          <div v-if="showFilters" class="px-4 pb-4 border-t border-gray-200">
            <!-- Major Filter -->
            <div class="mt-4 mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Major</label>
              <div class="flex flex-col space-y-2">
                <button
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="!selectedMajor ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="handleMajorSelect(null)"
                >
                  All Majors
                </button>
                <button
                  v-for="major in userStore.currentUser?.major || []"
                  :key="major"
                  @click="handleMajorSelect(major)"
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="selectedMajor === major ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ major }}
                </button>
              </div>
            </div>

            <!-- Milestone Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Milestone</label>
              <div class="flex flex-col space-y-2">
                <button
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="!selectedMilestoneFilter ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="selectedMilestoneFilter = null"
                >
                  All Milestones
                </button>
                <button
                  v-for="milestone in availableMilestones"
                  :key="milestone.description"
                  @click="selectedMilestoneFilter = milestone"
                  class="text-left px-3 py-2 rounded-md text-sm transition-colors"
                  :class="selectedMilestoneFilter?.description === milestone.description ? 
                    'bg-blue-100 text-blue-800 font-medium' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ milestone.description }}
                  <span v-if="milestone.deadline" class="block text-xs text-gray-500">
                    Due: {{ formatDate(milestone.deadline) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { getMilestoneData } from '@/utils/milestones'
import { useUserStore } from '@/stores/userStore'
import { formatDate } from '@/utils/milestoneHelpers'
import { collection, query, where, getDocs, getDoc, doc, limit, startAfter, orderBy, updateDoc, addDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { getLatestAcademicYear } from '@/utils/latestAcademicYear'
import { useVirtualList } from '@vueuse/core'
import { debounce } from 'lodash'
// Import QuillEditor correctly
import { QuillEditor } from '@vueup/vue-quill'
// Import Quill styles
import '@vueup/vue-quill/dist/vue-quill.snow.css'
// Import Firebase storage
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/firebase'

export default {
  name: 'LecturerFeedback',
  components: {
    QuillEditor
  },
  setup() {
    const userStore = useUserStore()
    const selectedMajor = ref(null)
    const selectedMilestoneFilter = ref(null)
    const milestoneDataMap = ref({})
    const showFilters = ref(false)
    const currentDisplayMajor = ref(null)
    const submissions = ref([])
    const submissionsLoading = ref(false)
    const submissionsError = ref(null)
    const pageSize = ref(10)
    const lastDoc = ref(null)
    const hasMore = ref(true)
    const studentNameCache = ref({})
    const isBackgroundLoading = ref(false)
    const submissionsContainer = ref(null)
    const statusFilter = ref('all')
    const currentRole = ref('supervisor') // Add current role state

    // New state variables for feedback
    const showFeedbackView = ref(false)
    const selectedSubmission = ref(null)
    const feedbackLoading = ref(false)
    const feedbackError = ref(null)
    const feedbackSuccess = ref('')
    const feedbackData = ref({
      comment: '',
      rating: 0,
      advice: '',
      attachment: null,
      attachmentUrl: null,
      isDraft: false
    })

    // Virtual list setup
    const containerRef = ref(null)
    // Add search functionality
    const searchQuery = ref('')
    
    // Add pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    
    // Add new ref for all submissions - make it an object for role-based storage
    const allSubmissions = ref({
      supervisor: [],
      examiner: []
    })
    
    const paginatedSubmissions = computed(() => {
      const startIdx = (currentPage.value - 1) * itemsPerPage.value
      return filteredSubmissions.value.slice(startIdx, startIdx + itemsPerPage.value)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredSubmissions.value.length / itemsPerPage.value)
    })
    
    // Create page range for smart pagination
    const paginationRange = computed(() => {
      const range = []
      const currentPageVal = currentPage.value
      
      // Always include current page and 1 page on each side when possible
      for (let i = Math.max(2, currentPageVal - 1); i <= Math.min(totalPages.value - 1, currentPageVal + 1); i++) {
        range.push(i)
      }
      
      return range
    })
    
    // Modified computed property for filtered submissions
    const filteredSubmissions = computed(() => {
      if (!searchQuery.value) return submissions.value
      
      const query = searchQuery.value.toLowerCase()
      return submissions.value.filter(submission => {
        return submission.fileName.toLowerCase().includes(query) ||
               submission.studentName.toLowerCase().includes(query) ||
               submission.projectTitle.toLowerCase().includes(query)
      })
    })

    // Reset to page 1 when filters change
    watch([searchQuery, selectedMajor, selectedMilestoneFilter, statusFilter], () => {
      currentPage.value = 1
    })
    
    // Watch for page size changes
    watch(itemsPerPage, () => {
      // Make sure current page is still valid with new page size
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value || 1
      }
    })

    // Legacy virtual list - can be removed since we're using pagination
    // const { list, containerProps, wrapperProps } = useVirtualList(filteredSubmissions, {
    //   itemHeight: 60,
    //   overscan: 10,
    // })

    // Add a custom toolbar configuration for the QuillEditor
    const editorToolbar = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]

    // Function to handle major selection
    const handleMajorSelect = (major) => {
      selectedMajor.value = major;
      selectedMilestoneFilter.value = null;
      fetchSubmissions(); // Fetch submissions when major changes
    }

    // Function to toggle filters visibility
    const toggleFilters = () => {
      showFilters.value = !showFilters.value;
    }

    // Debounced fetch function
    const debouncedFetch = debounce(() => {
      fetchSubmissions()
    }, 300)

    // Get student name with caching
    const getStudentName = async (schoolId, studentId) => {
      if (studentNameCache.value[studentId]) {
        return studentNameCache.value[studentId]
      }

      try {
        const studentRef = doc(db, 'schools', schoolId, 'users', studentId)
        const studentDoc = await getDoc(studentRef)
        const studentData = studentDoc.data()
        const name = studentData?.name || 'Unknown Student'
        studentNameCache.value[studentId] = name
        return name
      } catch (err) {
        console.error('Error fetching student name:', err)
        return 'Unknown Student'
      }
    }
    
    // Optimized batch fetching of student names
    const fetchStudentNamesInBatch = async (schoolId, studentIds) => {
      // Filter out IDs that are already in cache
      const uncachedIds = studentIds.filter(id => !studentNameCache.value[id])
      
      if (uncachedIds.length === 0) return
      
      try {
        // Process in batches of 10 to avoid overwhelming Firestore
        const batchSize = 10
        const batches = []
        
        for (let i = 0; i < uncachedIds.length; i += batchSize) {
          batches.push(uncachedIds.slice(i, i + batchSize))
        }
        
        // Process each batch
        for (const batch of batches) {
          const promises = batch.map(studentId => {
            const studentRef = doc(db, 'schools', schoolId, 'users', studentId)
            return getDoc(studentRef)
          })
          
          const docs = await Promise.all(promises)
          
          docs.forEach((doc, index) => {
            if (doc.exists()) {
              const data = doc.data()
              studentNameCache.value[batch[index]] = data?.name || 'Unknown Student'
            } else {
              studentNameCache.value[batch[index]] = 'Unknown Student'
            }
          })
        }
      } catch (err) {
        console.error('Error batch fetching student names:', err)
      }
    }

    // Modified fetchSubmissions function
    const fetchSubmissions = async (loadMore = false) => {
      if (!loadMore) {
        submissions.value = []
        lastDoc.value = null
        hasMore.value = true
      }
      
      if (!hasMore.value && loadMore) return

      submissionsLoading.value = true
      submissionsError.value = null

      try {
        if (!userStore.currentUser?.school || !userStore.currentUser?.uid) {
          throw new Error('User information not available')
        }

        const schoolId = userStore.currentUser.school
        const userId = userStore.currentUser.uid
        
        const academicYearData = await getLatestAcademicYear(schoolId)
        if (!academicYearData?.yearId) {
          throw new Error('Failed to determine academic year')
        }
        const yearId = academicYearData.yearId

        const majorsToFetch = selectedMajor.value ? [selectedMajor.value] : userStore.currentUser.major || []
        
        // Set up real-time listeners instead of one-time queries
        setupSubmissionsListeners(schoolId, userId, yearId, majorsToFetch)
        
      } catch (error) {
        console.error('Error fetching submissions:', error)
        submissionsError.value = 'Failed to load submissions'
        submissionsLoading.value = false
      }
    }

    // New function to set up real-time listeners
    const submissionsUnsubscribers = ref([])
    
    const setupSubmissionsListeners = (schoolId, userId, yearId, majorsToFetch) => {
      // Clear any existing listeners
      submissionsUnsubscribers.value.forEach(unsubscribe => unsubscribe())
      submissionsUnsubscribers.value = []
      
      // Only listen to selected major if one is selected (performance optimization)
      const majorsToListen = selectedMajor.value ? [selectedMajor.value] : majorsToFetch
      
      const listeners = majorsToListen.map(majorId => {
        const submissionsRef = collection(db, 'schools', schoolId, 'submissions')
        
        let submissionQuery = query(
          submissionsRef,
          where('yearId', '==', yearId),
          where('majorId', '==', majorId),
          where(currentRole.value === 'supervisor' ? 'lecturerId' : 'examinerId', '==', userId),
          orderBy('submittedAt', 'desc'),
          limit(50)
        )
        
        if (selectedMilestoneFilter.value) {
          submissionQuery = query(
            submissionQuery,
            where('milestoneDescription', '==', selectedMilestoneFilter.value.description)
          )
        }
        
        // Set up the listener
        const unsubscribe = onSnapshot(submissionQuery, async (snapshot) => {
          submissionsLoading.value = true
          
          try {
            // Step 1: Extract all student IDs first
            const studentIds = snapshot.docs.map(doc => doc.data().submittedBy)
            
            // Step 2: Batch fetch all student names at once
            await fetchStudentNamesInBatch(schoolId, studentIds)
            
            // Step 3: Process documents with cached student names
            const processPromises = snapshot.docs.map(async (doc) => {
              const submissionData = doc.data()
              // Now student name should be in cache from batch fetch
              const studentName = studentNameCache.value[submissionData.submittedBy] || 'Unknown Student'
              
              // Check if feedback exists for this submission
              const feedbackRef = collection(db, 'schools', schoolId, 'feedback')
              const feedbackQuery = query(
                feedbackRef,
                where('submissionId', '==', doc.id),
                where('lecturerId', '==', userId),
                limit(1)
              )
              const feedbackSnapshot = await getDocs(feedbackQuery)
              const hasBeenReviewed = !feedbackSnapshot.empty
              const isDraft = hasBeenReviewed ? feedbackSnapshot.docs[0].data().isDraft : false
              
              return {
                id: doc.id,
                projectId: submissionData.projectId,
                projectTitle: submissionData.projectTitle,
                major: majorId,
                studentName,
                hasBeenReviewed,
                isDraft,
                ...submissionData
              }
            })
            
            const processedDocs = await Promise.all(processPromises)
            
            // Create a role-specific key for storage
            const roleKey = currentRole.value
            
            // Update role-specific submissions data
            if (!allSubmissions.value[roleKey]) {
              allSubmissions.value[roleKey] = []
            }
            
            // Merge new submissions with existing ones for this role
            const existingSubmissions = allSubmissions.value[roleKey] || []
            const updatedSubmissions = [...existingSubmissions]
            
            processedDocs.forEach(newDoc => {
              const existingIndex = updatedSubmissions.findIndex(s => s.id === newDoc.id)
              if (existingIndex !== -1) {
                updatedSubmissions[existingIndex] = newDoc
              } else {
                updatedSubmissions.push(newDoc)
              }
            })
            
            allSubmissions.value[roleKey] = updatedSubmissions
            
            // Update filtered submissions based on search and filters
            updateFilteredSubmissions()
          } catch (error) {
            console.error('Error processing submissions:', error)
            submissionsError.value = 'Error processing submissions'
          } finally {
            submissionsLoading.value = false
          }
        }, error => {
          console.error('Error in real-time listener:', error)
          submissionsError.value = 'Failed to establish real-time connection'
          submissionsLoading.value = false
        })
        
        submissionsUnsubscribers.value.push(unsubscribe)
        return unsubscribe
      })
      
      return listeners
    }
    
    // Function to update filtered submissions
    const updateFilteredSubmissions = () => {
      const query = searchQuery.value.toLowerCase()
      const roleKey = currentRole.value
      
      // Get submissions for the current role
      const roleSubmissions = allSubmissions.value[roleKey] || []
      
      // Apply filters client-side
      let filtered = [...roleSubmissions]
      
      // Apply major filter
      if (selectedMajor.value) {
        filtered = filtered.filter(sub => sub.major === selectedMajor.value)
      }
      
      // Apply milestone filter
      if (selectedMilestoneFilter.value) {
        filtered = filtered.filter(sub => sub.milestoneDescription === selectedMilestoneFilter.value.description)
      }
      
      // Apply status filter
      if (statusFilter.value !== 'all') {
        if (statusFilter.value === 'draft') {
          filtered = filtered.filter(sub => sub.hasBeenReviewed && sub.isDraft)
        } else if (statusFilter.value === 'pending') {
          filtered = filtered.filter(sub => !sub.hasBeenReviewed)
        } else if (statusFilter.value === 'reviewed') {
          filtered = filtered.filter(sub => sub.hasBeenReviewed && !sub.isDraft)
        }
      }
      
      // Apply search filter
      if (query) {
        filtered = filtered.filter(sub => 
          sub.fileName.toLowerCase().includes(query) ||
          sub.studentName.toLowerCase().includes(query) ||
          sub.projectTitle.toLowerCase().includes(query)
        )
      }
      
      // Sort by submission date
      filtered.sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() || new Date(0)
        const dateB = b.submittedAt?.toDate?.() || new Date(0)
        return dateB - dateA
      })
      
      submissions.value = filtered
    }

    // Cleanup function for component unmount
    const cleanupListeners = () => {
      submissionsUnsubscribers.value.forEach(unsubscribe => unsubscribe())
      submissionsUnsubscribers.value = []
    }

    // Modified watchers for search and filters
    watch(searchQuery, () => {
      updateFilteredSubmissions()
    })
    
    // Watch for role changes to update the view
    watch(currentRole, () => {
      // Don't clear submissions immediately
      submissionsLoading.value = true
      
      // Use setTimeout to allow the transition to happen
      setTimeout(() => {
        // Update submissions from the cached role data
        submissions.value = allSubmissions.value[currentRole.value] || []
        
        // If we don't have data for this role yet, fetch it
        if (!allSubmissions.value[currentRole.value]?.length) {
          fetchSubmissions()
        } else {
          submissionsLoading.value = false
          // Still fetch in background to ensure data is fresh
          fetchSubmissions()
        }
      }, 200) // Match this with the transition duration
    })
    
    // Add status filter toggle function
    const toggleStatusFilter = (status) => {
      statusFilter.value = status
      updateFilteredSubmissions()
      currentPage.value = 1 // Reset to first page on filter change
    }
    
    watch([selectedMajor, selectedMilestoneFilter], () => {
      const roleKey = currentRole.value
      if (allSubmissions.value[roleKey]?.length > 0) {
        // If we already have data, just apply filters client-side
        updateFilteredSubmissions()
      } else {
        // Otherwise fetch data
        fetchSubmissions()
      }
    })
    
    onMounted(() => {
      if (userStore.currentUser?.major) {
        const majors = userStore.currentUser.major;
        console.log('User majors:', majors); // Debug log
        
        // Set initial major for milestone display
        if (majors.length > 0) {
          currentDisplayMajor.value = majors[0];
          console.log('Set initial display major to:', majors[0]); // Debug log
        }
        
        // Load data for all majors
        majors.forEach(majorId => {
          loadMilestoneData(majorId);
        });
        
        // Initial submissions fetch
        fetchSubmissions();
      }

      // Add intersection observer for infinite scroll
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          preloadNextPage()
        }
      }, { threshold: 0.5 })

      if (submissionsContainer.value) {
        observer.observe(submissionsContainer.value)
      }

      return () => {
        if (submissionsContainer.value) {
          observer.unobserve(submissionsContainer.value)
        }
        // Clean up Firestore listeners when component unmounts
        cleanupListeners()
      }
    })
    
    // Background loading function
    const preloadNextPage = async () => {
      if (isBackgroundLoading.value || !hasMore.value) return
      
      isBackgroundLoading.value = true
      try {
        await fetchSubmissions(true)
      } finally {
        isBackgroundLoading.value = false
      }
    }

    // Function to load milestone data for a specific major
    const loadMilestoneData = (majorId) => {
      if (!userStore.currentUser?.uid) return;
      
      console.log('Loading milestone data for major:', majorId); // Debug log
      const data = getMilestoneData(userStore.currentUser.uid, majorId);
      console.log('Loaded milestone data:', data); // Debug log
      
      if (data) {
        milestoneDataMap.value[majorId] = data;
      } else {
        console.warn(`No milestone data found for major: ${majorId}`);
      }
    }

    // Computed property for current milestone data
    const currentMilestoneData = computed(() => {
      if (!currentDisplayMajor.value || !milestoneDataMap.value) {
        console.log('No current display major or milestone map'); // Debug log
        return null;
      }
      const data = milestoneDataMap.value[currentDisplayMajor.value];
      console.log('Current milestone data:', data); // Debug log
      return data || null;
    });

    // Computed property for available milestones
    const availableMilestones = computed(() => {
      if (!selectedMajor.value || !milestoneDataMap.value[selectedMajor.value]) {
        console.log('No selected major or milestone data for major'); // Debug log
        return [];
      }
      const milestones = milestoneDataMap.value[selectedMajor.value].allMilestones || [];
      console.log('Available milestones:', milestones); // Debug log
      return milestones;
    });

    // Computed property for filter description
    const getFilterDescription = computed(() => {
      const parts = [];
      if (selectedMajor.value) parts.push(`for ${selectedMajor.value}`);
      if (selectedMilestoneFilter.value) parts.push(`- ${selectedMilestoneFilter.value.description}`);
      return parts.length ? parts.join(' ') : '';
    });

    // Watch for changes in currentDisplayMajor
    watch(currentDisplayMajor, (newMajor) => {
      if (newMajor) {
        console.log('Current display major changed to:', newMajor); // Debug log
        loadMilestoneData(newMajor);
      }
    });

    // Add click handler for submission card
    const handleSubmissionClick = (submission) => {
      selectedSubmission.value = submission
      showFeedbackView.value = true
      loadExistingFeedback(submission)
    }

    // Add file handling methods
    const dragover = ref(false);

    const handleFileDrop = (event) => {
      dragover.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        feedbackData.value.attachment = files[0];
      }
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        feedbackData.value.attachment = file;
      }
    };

    const removeAttachment = () => {
      feedbackData.value.attachment = null;
    };

    const removeExistingAttachment = () => {
      feedbackData.value.attachmentUrl = null;
      feedbackData.value.attachmentName = null;
      feedbackData.value.attachmentSize = null;
      feedbackData.value.attachmentType = null;
      feedbackData.value.attachmentPath = null;
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const uploadAttachment = async () => {
      if (!feedbackData.value.attachment) return null;
      
      const file = feedbackData.value.attachment;
      const timestamp = Date.now();
      const schoolId = userStore.currentUser.school;
      const submissionId = selectedSubmission.value.id;
      
      // Create a unique path for the file
      const filePath = `schools/${schoolId}/feedback-attachments/${submissionId}/${timestamp}_${file.name}`;
      const fileRef = storageRef(storage, filePath);
      
      // Upload the file
      await uploadBytes(fileRef, file);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);
      
      return {
        url: downloadUrl,
        path: filePath,
        name: file.name,
        size: file.size,
        type: file.type
      };
    };

    const deleteAttachment = async (filePath) => {
      if (!filePath) return;
      
      try {
        const fileRef = storageRef(storage, filePath);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting attachment:', error);
        // Continue anyway as we want to update the feedback record
      }
    };

    // Modified loadExistingFeedback function
    const loadExistingFeedback = async (submission) => {
      if (!submission || !userStore.currentUser?.school) return

      feedbackLoading.value = true
      feedbackError.value = null

      try {
        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const q = query(
          feedbackRef,
          where('submissionId', '==', submission.id),
          where('lecturerId', '==', userStore.currentUser.uid),
          limit(1)
        )

        const feedbackSnapshot = await getDocs(q)
        
        if (!feedbackSnapshot.empty) {
          const feedbackDoc = feedbackSnapshot.docs[0]
          const data = feedbackDoc.data()
          feedbackData.value = {
            comment: data.comment || '',
            rating: data.rating || 0,
            advice: data.advice || '',
            id: feedbackDoc.id,
            attachment: null,
            attachmentUrl: data.attachmentUrl || null,
            attachmentName: data.attachmentName || null,
            attachmentSize: data.attachmentSize || null,
            attachmentType: data.attachmentType || null,
            attachmentPath: data.attachmentPath || null,
            isDraft: data.isDraft || false
          }
        } else {
          // Reset form if no existing feedback
          feedbackData.value = {
            comment: '',
            rating: 0,
            advice: '',
            attachment: null,
            attachmentUrl: null,
            attachmentName: null,
            attachmentSize: null,
            attachmentType: null,
            attachmentPath: null,
            isDraft: false
          }
        }
      } catch (error) {
        console.error('Error loading feedback:', error)
        feedbackError.value = 'Failed to load feedback'
      } finally {
        feedbackLoading.value = false
      }
    }

    // Modified saveFeedback function
    const saveFeedback = async () => {
      if (!selectedSubmission.value || !userStore.currentUser?.school) return

      feedbackLoading.value = true
      feedbackError.value = null
      feedbackSuccess.value = ''

      try {
        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const feedbackPayload = {
          submissionId: selectedSubmission.value.id,
          lecturerId: userStore.currentUser.uid,
          studentId: selectedSubmission.value.submittedBy,
          yearId: selectedSubmission.value.yearId,
          majorId: selectedSubmission.value.majorId,
          milestoneDescription: selectedSubmission.value.milestoneDescription,
          projectId: selectedSubmission.value.projectId,
          comment: feedbackData.value.comment || '',
          rating: feedbackData.value.rating,
          advice: feedbackData.value.advice || '',
          updatedAt: new Date(),
          isDraft: false,
          role: currentRole.value  // Add role field
        }

        // Handle file attachment
        let attachmentData = null;
        
        if (feedbackData.value.attachment) {
          if (feedbackData.value.attachmentPath) {
            await deleteAttachment(feedbackData.value.attachmentPath);
          }
          attachmentData = await uploadAttachment();
          
          if (attachmentData) {
            feedbackPayload.attachmentUrl = attachmentData.url;
            feedbackPayload.attachmentName = attachmentData.name;
            feedbackPayload.attachmentSize = attachmentData.size;
            feedbackPayload.attachmentType = attachmentData.type;
            feedbackPayload.attachmentPath = attachmentData.path;
          }
        } else if (feedbackData.value.attachmentUrl) {
          feedbackPayload.attachmentUrl = feedbackData.value.attachmentUrl;
          feedbackPayload.attachmentName = feedbackData.value.attachmentName;
          feedbackPayload.attachmentSize = feedbackData.value.attachmentSize;
          feedbackPayload.attachmentType = feedbackData.value.attachmentType;
          feedbackPayload.attachmentPath = feedbackData.value.attachmentPath;
        }

        if (feedbackData.value.id) {
          await updateDoc(doc(feedbackRef, feedbackData.value.id), feedbackPayload)
        } else {
          feedbackPayload.createdAt = new Date()
          await addDoc(feedbackRef, feedbackPayload)
        }

        // Update the submission's review status in the local state
        const submissionIndex = submissions.value.findIndex(s => s.id === selectedSubmission.value.id)
        if (submissionIndex !== -1) {
          submissions.value[submissionIndex].hasBeenReviewed = true
          submissions.value[submissionIndex].isDraft = false
        }
        
        // Also update in allSubmissions
        const roleKey = currentRole.value
        const roleSubmissions = allSubmissions.value[roleKey]
        if (roleSubmissions) {
          const allSubmissionIndex = roleSubmissions.findIndex(s => s.id === selectedSubmission.value.id)
          if (allSubmissionIndex !== -1) {
            roleSubmissions[allSubmissionIndex].hasBeenReviewed = true
            roleSubmissions[allSubmissionIndex].isDraft = false
          }
        }

        // Show success message and don't navigate away
        feedbackSuccess.value = 'Feedback saved successfully!'
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          feedbackSuccess.value = '';
        }, 5000);

        
          try {
            const notificationsRef = collection(db, 'schools', userStore.currentUser.school, 'notifications')
            const notificationData = {
              type: 'submission_reviewed',
              changeType: 'submission_reviewed',
              affectedUsers: [selectedSubmission.value.submittedBy],
              details: `You have new ${currentRole.value} feedback update for your "${selectedSubmission.value.milestoneDescription}" milestone submission.`,
              projectId: selectedSubmission.value.projectId,
              majorId: selectedSubmission.value.majorId,
              yearId: selectedSubmission.value.yearId,
              reviewedBy: userStore.currentUser.uid,
              reviewerName: userStore.currentUser.displayName || 'Your lecturer',
              readBy: {},
              createdAt: new Date()
            }

            await addDoc(notificationsRef, notificationData)          
          } catch (notificationError) {
            // Just log the error but don't show to user since main functionality succeeded
            console.error('Error creating notification:', notificationError)
          }
       

      } catch (error) {
        console.error('Error saving feedback:', error)
        feedbackError.value = 'Failed to save feedback'
      } finally {
        feedbackLoading.value = false
      }
    }

    // Add saveDraft function
    const saveDraft = async () => {
      if (!selectedSubmission.value || !userStore.currentUser?.school) return

      feedbackLoading.value = true
      feedbackError.value = null
      feedbackSuccess.value = ''

      try {
        const feedbackRef = collection(db, 'schools', userStore.currentUser.school, 'feedback')
        const feedbackPayload = {
          submissionId: selectedSubmission.value.id,
          lecturerId: userStore.currentUser.uid,
          studentId: selectedSubmission.value.submittedBy,
          yearId: selectedSubmission.value.yearId,
          majorId: selectedSubmission.value.majorId,
          milestoneDescription: selectedSubmission.value.milestoneDescription,
          projectId: selectedSubmission.value.projectId,
          comment: feedbackData.value.comment || '',
          rating: feedbackData.value.rating,
          advice: feedbackData.value.advice || '',
          updatedAt: new Date(),
          isDraft: true,
          role: currentRole.value  // Add role field
        }

        // Handle file attachment
        let attachmentData = null;
        
        if (feedbackData.value.attachment) {
          if (feedbackData.value.attachmentPath) {
            await deleteAttachment(feedbackData.value.attachmentPath);
          }
          attachmentData = await uploadAttachment();
          
          if (attachmentData) {
            feedbackPayload.attachmentUrl = attachmentData.url;
            feedbackPayload.attachmentName = attachmentData.name;
            feedbackPayload.attachmentSize = attachmentData.size;
            feedbackPayload.attachmentType = attachmentData.type;
            feedbackPayload.attachmentPath = attachmentData.path;
          }
        } else if (feedbackData.value.attachmentUrl) {
          feedbackPayload.attachmentUrl = feedbackData.value.attachmentUrl;
          feedbackPayload.attachmentName = feedbackData.value.attachmentName;
          feedbackPayload.attachmentSize = feedbackData.value.attachmentSize;
          feedbackPayload.attachmentType = feedbackData.value.attachmentType;
          feedbackPayload.attachmentPath = feedbackData.value.attachmentPath;
        }

        if (feedbackData.value.id) {
          await updateDoc(doc(feedbackRef, feedbackData.value.id), feedbackPayload)
        } else {
          feedbackPayload.createdAt = new Date()
          await addDoc(feedbackRef, feedbackPayload)
        }

        feedbackSuccess.value = 'Draft saved successfully!'
        setTimeout(() => {
          feedbackSuccess.value = '';
        }, 5000);

      } catch (error) {
        console.error('Error saving draft:', error)
        feedbackError.value = 'Failed to save draft'
      } finally {
        feedbackLoading.value = false
      }
    }

    // Function to return to submissions view
    const returnToSubmissions = () => {
      showFeedbackView.value = false
      selectedSubmission.value = null
      feedbackSuccess.value = ''
      // Reset feedback form
      feedbackData.value = {
        comment: '',
        rating: 0,
        advice: '',
        id: undefined,
        attachment: null,
        attachmentUrl: null,
        attachmentName: null,
        attachmentSize: null,
        attachmentType: null,
        attachmentPath: null
      }
    }

    // Modified computed properties for submission counts
    const currentMilestoneSubmissionCount = computed(() => {
      if (!currentMilestoneData.value?.upcomingMilestone?.description || !currentDisplayMajor.value) {
        return 0;
      }
      const currentMilestoneDesc = currentMilestoneData.value.upcomingMilestone.description;
      const roleKey = currentRole.value;
      const roleSubmissions = allSubmissions.value[roleKey] || [];
      
      return roleSubmissions.filter(submission => 
        submission.milestoneDescription === currentMilestoneDesc &&
        submission.major === currentDisplayMajor.value
      ).length;
    });

    const currentMilestoneReviewedCount = computed(() => {
      if (!currentMilestoneData.value?.upcomingMilestone?.description || !currentDisplayMajor.value) {
        return 0;
      }
      const currentMilestoneDesc = currentMilestoneData.value.upcomingMilestone.description;
      const roleKey = currentRole.value;
      const roleSubmissions = allSubmissions.value[roleKey] || [];
      
      return roleSubmissions.filter(submission => 
        submission.milestoneDescription === currentMilestoneDesc &&
        submission.major === currentDisplayMajor.value &&
        submission.hasBeenReviewed &&
        !submission.isDraft
      ).length;
    });

    // Define the submission card component
    const submissionCard = {
      props: {
        source: {
          type: Object,
          required: true
        }
      },
      template: `
        <div class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 mx-2">
          <div class="flex justify-between items-start">
            <div class="flex-grow">
              <div class="flex items-center gap-2">
                <h3 class="font-medium text-gray-900">{{ source.fileName }}</h3>
                <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {{ source.major }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Submitted by {{ source.studentName }}
              </p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <p class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {{ source.projectTitle }}
                </p>
                <p class="flex items-center" v-if="source.submittedAt">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ source.submittedAt?.toDate?.() ? formatDate(source.submittedAt.toDate()) : 'Date not available' }}
                </p>
              </div>
            </div>
            <a 
              :href="source.downloadUrl"
              target="_blank"
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      `
    }

    return {
      userStore,
      selectedMajor,
      selectedMilestoneFilter,
      currentMilestoneData,
      showFilters,
      availableMilestones,
      getFilterDescription,
      handleMajorSelect,
      toggleFilters,
      formatDate,
      currentDisplayMajor,
      submissions,
      submissionsLoading,
      submissionsError,
      hasMore,
      isBackgroundLoading,
      submissionCard,
      containerRef,
      currentRole, // Add currentRole to returned object
      // Pagination
      paginatedSubmissions,
      currentPage,
      totalPages,
      itemsPerPage,
      paginationRange,
      // Status filtering
      statusFilter,
      toggleStatusFilter,
      // Add new return values
      showFeedbackView,
      selectedSubmission,
      feedbackLoading,
      feedbackError,
      feedbackSuccess,
      feedbackData,
      handleSubmissionClick,
      saveFeedback,
      saveDraft,
      returnToSubmissions,
      searchQuery,
      currentMilestoneSubmissionCount,
      currentMilestoneReviewedCount,
      updateFilteredSubmissions,
      editorToolbar,
      // File handling methods
      handleFileChange,
      handleFileDrop,
      dragover,
      removeAttachment,
      removeExistingAttachment,
      formatFileSize
    }
  }
}
</script>

<style scoped>
.lecturer-feedback {
  padding: 20px;
  display: flex;
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

[data-virtual-list] {
  height: 100%;
  overflow-y: auto;
}

[data-virtual-list]::-webkit-scrollbar {
  width: 8px;
}

[data-virtual-list]::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

[data-virtual-list]::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

[data-virtual-list]::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Rich text editor styles */
.feedback-editor {
  margin-bottom: 1rem;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  background-color: #f9fafb;
  border-color: #d1d5db;
}

:deep(.ql-container) {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-color: #d1d5db;
  font-family: inherit;
}

:deep(.ql-editor) {
  min-height: 120px;
  font-size: 0.875rem;
}

:deep(.ql-snow .ql-picker) {
  font-size: 0.875rem;
}
</style> 
