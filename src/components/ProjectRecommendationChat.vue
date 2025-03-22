<!-- ProjectRecommendationChat.vue -->
<template>
  <div 
    v-show="isVisible"
    ref="chatContainer"
    class="fixed transform transition-all duration-300 ease-bounce"
    :class="{
      'top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl flex flex-col': isExpanded,
      'bottom-4 right-4 w-14 h-14 rounded-full bg-blue-600 shadow-xl cursor-pointer hover:scale-110': !isExpanded
    }"
    :style="{ 
      transform: isExpanded ? `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)` : `translate(${position.x}px, ${position.y}px)`,
      width: isExpanded ? '560px' : '56px',
      height: isExpanded ? '420px' : '56px',
      zIndex: 50
    }"
  >
    <!-- Collapsed State - Circle Button -->
    <div 
      v-if="!isExpanded"
      class="w-full h-full flex items-center justify-center text-white"
      @click="toggleExpand"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Expanded State -->
    <template v-else>
      <!-- Chat Header -->
      <div 
        class="p-3 bg-blue-600 rounded-t-lg cursor-move flex justify-between items-center"
        @mousedown="startDragging"
        @touchstart="startDragging"
      >
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 class="text-white font-medium">Project Recommendations</h3>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="toggleExpand"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <button 
            @click="close"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Messages Container -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center text-gray-500 mt-4">
            <p>Enter your interests or skills to get personalized project recommendations.</p>
            <p class="text-sm mt-2">Example: "html", "blockchain", "ai"</p>
          </div>

          <!-- Chat Messages -->
          <div v-for="(message, index) in messages" :key="index" 
            :class="[
              'max-w-[90%] rounded-lg p-3',
              message.type === 'user' 
                ? 'bg-blue-100 text-blue-900 ml-auto' 
                : 'bg-gray-100 text-gray-900'
            ]"
          >
            <!-- User Message -->
            <div v-if="message.type === 'user'" class="flex items-center gap-2">
              <div class="space-x-1">
                <span v-for="tag in message.tags" :key="tag" 
                  class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Bot Message with Recommendations -->
            <div v-else>
              <div v-if="message.error" class="bg-red-50 p-3 rounded text-red-700 text-sm">
                {{ message.text }}
              </div>
              <div v-else-if="message.recommendations && message.recommendations.length > 0">
                <div v-for="rec in message.recommendations" :key="rec.title" 
                  class="mb-3 last:mb-0 p-2 bg-white rounded hover:bg-gray-50 transition-colors"
                  :class="rec.project ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'"
                  @click="rec.project && $emit('view-project', rec.project)"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                      {{ rec.ranking }}
                    </span>
                    <h4 class="font-medium text-sm">{{ rec.title }}</h4>
                  </div>
                  <p class="text-xs text-gray-600">{{ rec.reason }}</p>
                  <div v-if="!rec.project" class="text-xs text-red-500 mt-1">
                    This project is no longer available.
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-700">
                No matching projects found for your interests. Try different tags.
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex justify-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t">
          <div class="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 min-h-[45px]">
            <!-- Selected Tags -->
            <span 
              v-for="tag in selectedTags" 
              :key="tag"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ tag }}
              <button
                type="button"
                class="ml-1 inline-flex items-center justify-center text-blue-400 hover:text-blue-500"
                @click="removeTag(tag)"
              >
                <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </span>
            
            <!-- Input Field -->
            <input
              v-model="tagInput"
              type="text"
              placeholder="Type and press Enter..."
              class="flex-1 min-w-[120px] bg-transparent focus:outline-none text-sm"
              @keydown.enter.prevent="addTag"
            >
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-between mt-2">
            <button 
              v-if="selectedTags.length > 0"
              @click="clearTags"
              class="text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
            <button 
              v-if="selectedTags.length > 0"
              @click="getRecommendations"
              class="ml-auto px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Get Recommendations
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  projects: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['view-project'])

const userStore = useUserStore()
const isVisible = ref(false)
const isExpanded = ref(true)
const isLoading = ref(false)
const tagInput = ref('')
const messages = ref([])
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const chatContainer = ref(null)
const messagesContainer = ref(null)

// Storage key for tags
const getStorageKey = computed(() => `student_interest_tags_${userStore.currentUser?.uid}`)

// Initialize selectedTags from localStorage
const selectedTags = ref(JSON.parse(localStorage.getItem(getStorageKey.value) || '[]'))

// Methods for tag management
const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    localStorage.setItem(getStorageKey.value, JSON.stringify(selectedTags.value))
  }
  tagInput.value = ''
}

const removeTag = (tagToRemove) => {
  selectedTags.value = selectedTags.value.filter(tag => tag !== tagToRemove)
  localStorage.setItem(getStorageKey.value, JSON.stringify(selectedTags.value))
}

const clearTags = () => {
  selectedTags.value = []
  localStorage.removeItem(getStorageKey.value)
  messages.value = []
}

// Fix dragging functionality
const startDragging = (event) => {
  if (event.target.closest('button')) return
  
  isDragging.value = true
  
  // Get touch or mouse position
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  
  const rect = chatContainer.value.getBoundingClientRect()
  
  // Store the initial offset from cursor to element corner
  dragOffset.value = {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
  
  // Add event listeners with correct options
  if (event.type === 'mousedown') {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDragging)
  } else {
    document.addEventListener('touchmove', onDrag, { passive: false })
    document.addEventListener('touchend', stopDragging)
  }
  
  // Prevent text selection during dragging
  event.preventDefault()
}

const onDrag = (event) => {
  if (!isDragging.value) return
  
  // Prevent default browser behavior
  event.preventDefault()
  
  // Get current client position
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  
  // Calculate new position
  let newX = clientX - dragOffset.value.x
  let newY = clientY - dragOffset.value.y
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Get element dimensions
  const rect = chatContainer.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  
  // Calculate strict boundaries to keep the element fully visible
  const maxX = viewportWidth - width
  const maxY = viewportHeight - height
  
  // Enforce boundaries
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))
  
  // Update position value directly
  position.value = { 
    x: newX, 
    y: newY 
  }
}

const stopDragging = () => {
  // Only clean up if we were actually dragging
  if (!isDragging.value) return
  
  isDragging.value = false
  
  // Remove event listeners
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDragging)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDragging)
}

// Chat functionality
const getRecommendations = async () => {
  if (selectedTags.value.length === 0) return
  
  isLoading.value = true
  
  // Add user message
  messages.value.push({
    type: 'user',
    tags: [...selectedTags.value]
  })

  try {
    // Ensure we use all projects, not just paginated ones
    const allProjects = props.projects

    // Prepare project data for the AI, filtering out placeholders and projects without titles
    const projectsData = allProjects
      .filter(project => !project.placeholder && project.Title)
      .map(project => ({
        id: project.id,
        title: project.Title || '',
        description: project.Description || '',
        major: project.major || ''
      }))

    // Create the prompt for the AI
    const prompt = `Find projects that match these interests: ${selectedTags.value.join(', ')}

Projects:
${JSON.stringify(projectsData, null, 2)}

Return exactly 3 projects in this JSON format:
{
  "recommendations": [
    {
      "title": "exact project title",
      "ranking": 1,
      "reason": "Brief explanation of match"
    }
  ]
}

Rules:
1. Return EXACTLY 3 recommendations
2. Use exact project titles
3. For projects that don't match interests well, explain what skills they could learn`

    // Call Vertex AI
    const result = await props.model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // Clean the response text and parse JSON
    const cleanText = text.replace(/```json|```/g, '').trim()
    const recommendations = JSON.parse(cleanText)
    
    // Check if we have 3 recommendations, if not, fill with random projects
    if (recommendations.recommendations.length < 3) {
      console.warn(`AI only returned ${recommendations.recommendations.length} recommendations, adding random projects to make 3`)
      
      // Get titles of already recommended projects
      const recommendedTitles = new Set(recommendations.recommendations.map(rec => rec.title))
      
      // Get projects that haven't been recommended yet
      const unrecommendedProjects = projectsData.filter(p => !recommendedTitles.has(p.title))
      
      // Shuffle to randomize
      const shuffled = [...unrecommendedProjects].sort(() => 0.5 - Math.random())
      
      // Add more recommendations until we have 3
      let nextRank = recommendations.recommendations.length + 1
      while (recommendations.recommendations.length < 3 && shuffled.length > 0) {
        const nextProject = shuffled.pop()
        recommendations.recommendations.push({
          title: nextProject.title,
          ranking: nextRank++,
          reason: "This project was included to provide additional options."
        })
      }
    }

    // Map recommendations to full project objects
    const detailedRecommendations = recommendations.recommendations.map(rec => {
      // First try to find the exact match by title
      const project = allProjects.find(p => p.Title.toLowerCase() === rec.title.toLowerCase())
      
      if (project) {
        return {
          ...rec,
          project: project
        }
      } else {
        console.warn(`Project with title "${rec.title}" not found. Searching with partial match...`)
        // Fall back to partial match if exact match fails
        const fuzzyMatch = allProjects.find(p => 
          p.Title && p.Title.toLowerCase().includes(rec.title.toLowerCase())
        )
        
        if (fuzzyMatch) {
          // If we found a fuzzy match, use the actual title in the recommendation too
          return {
            ...rec,
            title: fuzzyMatch.Title, // Replace AI title with actual title
            project: fuzzyMatch
          }
        } else {
          console.error(`No match found for project "${rec.title}"`)
          return {
            ...rec,
            project: null
          }
        }
      }
    }).filter(rec => rec.project !== null) // Filter out any recommendations without matching projects
    
    // If we still don't have 3 projects after mapping (due to filtering), add random ones
    if (detailedRecommendations.length < 3) {
      console.warn(`After mapping, only ${detailedRecommendations.length} valid projects found, adding random ones`)
      
      // Get IDs of already recommended projects
      const recommendedIds = new Set(detailedRecommendations.map(rec => rec.project.id))
      
      // Get projects that haven't been recommended yet
      const availableProjects = allProjects.filter(p => 
        !p.placeholder && p.Title && !recommendedIds.has(p.id)
      )
      
      // Shuffle to randomize
      const shuffled = [...availableProjects].sort(() => 0.5 - Math.random())
      
      // Add more recommendations until we have 3
      let nextRank = detailedRecommendations.length + 1
      while (detailedRecommendations.length < 3 && shuffled.length > 0) {
        const nextProject = shuffled.pop()
        detailedRecommendations.push({
          title: nextProject.Title,
          ranking: nextRank++,
          reason: "This project was included as an additional option you might want to explore.",
          project: nextProject
        })
      }
    }
    
    // Sort by ranking to ensure correct order
    detailedRecommendations.sort((a, b) => a.ranking - b.ranking)

    // Add bot message with recommendations
    messages.value.push({
      type: 'bot',
      recommendations: detailedRecommendations
    })

    // Scroll to bottom after message is added
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }

  } catch (error) {
    console.error('Error getting recommendations:', error)
    messages.value.push({
      type: 'bot',
      error: true,
      text: 'Sorry, I encountered an error while getting recommendations. Please try again.'
    })
  } finally {
    isLoading.value = false
  }
}

// UI Controls
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const open = () => {
  isVisible.value = true
  isExpanded.value = true
}

const close = () => {
  isVisible.value = false
}

// Watch for user changes
watch(() => userStore.currentUser?.uid, (newUserId) => {
  if (newUserId) {
    selectedTags.value = JSON.parse(localStorage.getItem(getStorageKey.value) || '[]')
  } else {
    selectedTags.value = []
    messages.value = []
  }
})

// Expose necessary methods
defineExpose({
  open,
  close
})
</script>

<style scoped>
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style> 