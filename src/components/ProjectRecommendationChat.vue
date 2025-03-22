<!-- ProjectRecommendationChat.vue -->
<template>
  <div 
    v-show="isVisible"
    ref="chatContainer"
    class="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl flex flex-col"
    :style="{ 
      width: '560px',
      height: '420px',
      zIndex: 50
    }"
  >
    <!-- Update header section -->
    <div class="p-3 bg-gradient-to-r from-[#FF6F61] to-[#FF8B82] rounded-t-lg flex justify-between items-center">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h3 class="text-white font-medium">Project Recommendations</h3>
      </div>
      <button 
        @click="close"
        class="text-white hover:text-gray-200 transition-colors"
      >
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Chat Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Messages Container -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="text-center text-gray-500 mt-4 space-y-3">
          <div class="flex items-center justify-center gap-3 text-[#FF6F61] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Hi, I'm Gemini! 👋</span>
          </div>
          <p class="text-gray-600">I'm here to help you discover the perfect project based on your interests and skills.</p>
          <p class="text-sm text-gray-500">Try entering tags like "NLP"  "Mobile app" or "Agile"</p>
          <div class="text-xs text-gray-400 mt-2">Powered by Gemini 2.0 Flash</div>
        </div>

        <!-- Chat Messages -->
        <div v-for="(message, index) in messages" :key="index">
          <!-- User Message - just show tags -->
          <div v-if="message.type === 'user'" class="flex justify-end mb-4">
            <div class="flex flex-row-reverse flex-wrap gap-2">
              <span v-for="tag in message.tags" :key="tag" 
                class="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-[#F1F5E9] text-[#5B8A3C]"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Bot Message with Recommendations -->
          <div v-else class="bg-gray-100 rounded-lg p-3 max-w-[90%] mb-4">
            <div v-if="message.error" class="bg-red-50 p-3 rounded text-red-700 text-sm">
              {{ message.text }}
            </div>
            <div v-else-if="message.recommendations && message.recommendations.length > 0">
              <div v-for="rec in message.recommendations" :key="rec.title" 
                class="mb-3 last:mb-0 p-3 bg-white rounded hover:bg-gray-50 transition-colors"
                :class="rec.project ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'"
                @click="rec.project && $emit('view-project', rec.project)"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="flex-shrink-0 w-7 h-7 rounded-full bg-[#FFB168] text-white flex items-center justify-center text-sm font-bold">
                    {{ rec.ranking }}
                  </span>
                  <h4 class="font-medium text-base">{{ rec.title }}</h4>
                </div>
                <p class="text-sm text-gray-600">{{ rec.reason }}</p>
                <div v-if="!rec.project" class="text-sm text-red-500 mt-1">
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
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6F61]"></div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t" :class="selectedTags.length === 0 ? 'py-2' : 'py-4'">
        <div class="flex items-center gap-3 justify-between">
          <!-- Clear All Button -->
          <button 
            :class="[
              'text-xs transition-colors whitespace-nowrap',
              selectedTags.length > 0 
                ? 'text-[#E05252] hover:text-[#CC4444]' 
                : 'text-gray-300 cursor-not-allowed'
            ]"
            @click="selectedTags.length > 0 && clearTags()"
          >
            Clear All
          </button>

          <!-- Tags and Input container -->
          <div class="flex-1 max-w-[55%]">
            <!-- Selected Tags - only show if there are tags -->
            <div 
              v-if="selectedTags.length > 0"
              class="flex flex-wrap gap-2 mb-2 min-h-[28px]"
            >
              <span 
                v-for="tag in selectedTags" 
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F1F5E9] text-[#5B8A3C] shadow-sm"
              >
                {{ tag }}
                <button
                  type="button"
                  class="ml-1 inline-flex items-center justify-center text-[#5B8A3C] hover:text-[#4A7230]"
                  @click="removeTag(tag)"
                >
                  <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </span>
            </div>
            
            <!-- Input Field -->
            <input
              v-model="tagInput"
              type="text"
              placeholder="Type and press Enter..."
              class="w-full focus:outline-none text-sm border-b border-gray-200 focus:border-[#FF6F61] pb-0.5 transition-colors"
              @keydown.enter.prevent="addTag"
            >
          </div>

          <!-- Get Recommendations Button -->
          <button 
            :class="[
              'px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap shadow-lg flex items-center gap-2 overflow-hidden relative group',
              selectedTags.length > 0 
                ? 'bg-gradient-to-r from-[#FFB347] to-[#FFCD94] text-white hover:from-[#FFA533] hover:to-[#FFB347] hover:shadow-xl transform hover:-translate-y-1 hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
            @click="selectedTags.length > 0 && getRecommendations()"
          >
            <!-- Glowing effect overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
            
            <!-- Button content -->
            <span class="relative font-semibold">Let's try</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 relative animate-pulse group-hover:animate-none" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
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
const isLoading = ref(false)
const tagInput = ref('')
const messages = ref([])
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

// Chat functionality
const getRecommendations = async () => {
  if (selectedTags.value.length === 0) return
  
  isLoading.value = true
  
  // Store tags before clearing them
  const tagsToUse = [...selectedTags.value]
  
  // Add user message with the stored tags
  messages.value.push({
    type: 'user',
    tags: tagsToUse
  })

  // Clear the tags immediately
  selectedTags.value = []
  localStorage.removeItem(getStorageKey.value)
  
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
    const prompt = `Find projects that match these interests: ${tagsToUse.join(', ')}

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
const open = () => {
  isVisible.value = true
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