<!-- ProjectRecommendationChat.vue -->
<template>
  <div 
    v-show="isVisible"
    ref="chatContainer"
    class="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl flex flex-col"
    :style="{ 
      width: '660px',
      height: '480px',
      zIndex: 50
    }"
  >
    <!-- Update header section -->
    <div class="p-3 bg-gradient-to-r from-[#FF8B82] to-[#FFA59E] rounded-t-lg flex justify-between items-center">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <h3 class="text-white font-medium">Project Assistant</h3>
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
      <!-- Mode Indicator -->
      <div v-if="chatMode !== 'welcome'" class="px-4 py-2 bg-gray-50 border-b flex items-center">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">Current Mode:</span>
          <span 
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="chatMode === 'recommendations' 
              ? 'bg-[#FFB347]/20 text-[#FFB347]' 
              : 'bg-[#FF6F61]/20 text-[#FF6F61]'"
          >
            {{ chatMode === 'recommendations' ? 'Project Recommendations' : 'Project Analysis' }}
          </span>
        </div>
      </div>

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
          <p class="text-gray-600">I'm here to help you discover and analyze projects. What would you like to do?</p>
          <div class="flex justify-center gap-4 mt-4">
            <button
              @click="chatMode = 'recommendations'"
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFA533] to-[#FFB347] text-white hover:from-[#FF9720] hover:to-[#FFA533] shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
            >
              Find Project Recommendations
            </button>
            <button
              @click="chatMode = 'analysis'"
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6F61] to-[#FF8B82] text-white hover:from-[#FF5B4D] hover:to-[#FF7A6E] shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
            >
              Project Analysis & Brainstorming
            </button>
          </div>
          <div class="text-xs text-gray-400 mt-2">Powered by Gemini 2.0 Flash</div>
        </div>

        <!-- Chat Messages -->
        <div v-for="(message, index) in messages" :key="index">
          <!-- User Message -->
          <div v-if="message.type === 'user'" class="flex justify-end mb-4">
            <div v-if="message.tags" class="flex flex-row-reverse flex-wrap gap-2">
              <span v-for="tag in message.tags" :key="tag" 
                class="inline-block px-3 py-1.5 rounded-full text-sm font-medium bg-[#F1F5E9] text-[#5B8A3C]"
              >
                {{ tag }}
              </span>
            </div>
            <div v-else-if="message.projectTitle" 
              class="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-[#F1F5E9] text-[#5B8A3C]"
            >
              Analyzing: {{ message.projectTitle }}
            </div>
          </div>

          <!-- Bot Message -->
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
            <div v-else-if="message.analysis" class="prose prose-sm max-w-none">
              <div class="whitespace-pre-wrap text-gray-700 analysis-content" v-html="(message.analysis)"></div>
            </div>
            <div v-else class="text-sm text-gray-700">
              No matching projects found for your interests. Try different tags.
            </div>
          </div>
        </div>

        <!-- Mode Selection After Reply -->
        <div v-if="messages.length > 0 && !isLoading" class="bg-gray-50 rounded-lg p-4 text-center">
          <p class="text-sm text-gray-600 mb-3">Would you like to try something else?</p>
          <div class="flex justify-center gap-3">
            <button
              @click="switchMode('recommendations')"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                chatMode === 'recommendations'
                  ? 'bg-gradient-to-r from-[#FFB347] to-[#FFCD94] text-white shadow-lg transform scale-105'
                  : 'bg-white text-[#FFB347] border border-[#FFB347] hover:bg-[#FFB347] hover:text-white'
              ]"
            >
              Find Project Recommendations
            </button>
            <button
              @click="switchMode('analysis')"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                chatMode === 'analysis'
                  ? 'bg-gradient-to-r from-[#FF6F61] to-[#FF8B82] text-white shadow-lg transform scale-105'
                  : 'bg-white text-[#FF6F61] border border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white'
              ]"
            >
              Analyze Project
            </button>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-4">
          <div class="flex items-center gap-2">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6F61]"></div>
            <span class="text-[#FF6F61] font-medium">
              {{ chatMode === 'analysis' ? 'Analyzing project with AI magic ✨' : 'Finding perfect matches' }}
              <span v-if="chatMode === 'analysis'" class="text-sm text-gray-500">({{ loadingTimer }}s)</span>
            </span>
          </div>
          <div v-if="chatMode === 'analysis'" class="text-sm text-gray-500 animate-pulse">
            Reading project... Brainstorming ideas... Making coffee... ☕
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t">
        <!-- Input Fields -->
        <div v-if="!isLoading">
          <!-- Recommendations Mode -->
          <div v-if="chatMode === 'recommendations'" class="flex items-center gap-3 justify-between">
            <!-- Existing recommendations input UI -->
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

            <div class="flex-1 max-w-[55%]">
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
              
              <input
                v-model="tagInput"
                type="text"
                placeholder="Type and press Enter..."
                class="w-full focus:outline-none text-sm border-b border-gray-200 focus:border-[#FF6F61] pb-0.5 transition-colors"
                @keydown.enter.prevent="addTag"
              >
            </div>

            <button 
              :class="[
                'px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap shadow-lg flex items-center gap-2 overflow-hidden relative group',
                selectedTags.length > 0 
                  ? 'bg-gradient-to-r from-[#FFB347] to-[#FFCD94] text-white hover:from-[#FFA533] hover:to-[#FFB347] hover:shadow-xl transform hover:-translate-y-1 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
              @click="selectedTags.length > 0 && getRecommendations()"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
              <span class="relative font-semibold">Let's try</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 relative animate-pulse group-hover:animate-none" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Analysis Mode -->
          <div v-else-if="chatMode === 'analysis'" class="flex items-center gap-3">
            <div class="flex-1">
              <input
                v-model="projectInput"
                type="text"
                list="project-list"
                placeholder="Enter project title..."
                class="w-full focus:outline-none text-sm border-b border-gray-200 focus:border-[#FF6F61] pb-0.5 transition-colors"
                @keydown.enter.prevent="getProjectAnalysis"
              >
              <datalist id="project-list">
                <option v-for="project in props.projects.filter(p => !p.placeholder && p.Title)" :key="project.id" :value="project.Title" />
              </datalist>
            </div>

            <button 
              :class="[
                'px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap shadow-lg flex items-center gap-2 overflow-hidden relative group',
                projectInput 
                  ? 'bg-gradient-to-r from-[#FF6F61] to-[#FF8B82] text-white hover:from-[#FF5B4D] hover:to-[#FF7A6E] hover:shadow-xl transform hover:-translate-y-1 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
              @click="projectInput && getProjectAnalysis()"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
              <span class="relative font-semibold">Analyze Project</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 relative" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
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
const chatMode = ref('welcome') // 'welcome' | 'recommendations' | 'analysis'
const projectInput = ref('')
const selectedProject = ref(null)
const loadingTimer = ref(10) // Add timer ref

// Storage key for tags
const getStorageKey = computed(() => `student_interest_tags_${userStore.currentUser?.uid}`)

// Initialize selectedTags from localStorage
const selectedTags = ref(JSON.parse(localStorage.getItem(getStorageKey.value) || '[]'))

// Add timer logic
const startLoadingTimer = () => {
  loadingTimer.value = 10
  const timer = setInterval(() => {
    if (loadingTimer.value > 0) {
      loadingTimer.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
  return timer
}

// Methods for tag management
const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  // Add validation for meaningful input
  if (tag.length < 3 || /^\d+$/.test(tag) || /[^a-z0-9\s-]/.test(tag)) {
    messages.value.push({
      type: 'bot',
      error: true,
      text: 'Please enter meaningful tags related to your interests (e.g., "NLP", "Mobile app", "Machine learning", "Web development").'
    })
    tagInput.value = ''
    return
  }
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
      text: 'I couldn\'t find relevant project matches. Try using more specific tags related to technologies, domains, or skills (e.g., "Python", "Web development", "Data science").'
    })
  } finally {
    isLoading.value = false
  }
}

// Add new getProjectAnalysis function
const getProjectAnalysis = async () => {
  if (!projectInput.value) return
  
  isLoading.value = true
  const timer = startLoadingTimer() // Start the timer
  const projectTitle = projectInput.value
  
  try {
    const project = props.projects.find(p => 
      p.Title.toLowerCase() === projectTitle.toLowerCase()
    )
    
    if (!project) {
      throw new Error('Project not found')
    }

    // Add user message showing selected project
    messages.value.push({
      type: 'user',
      projectTitle: project.Title
    })

    // Clear input
    projectInput.value = ''

    // Create the analysis prompt
    const prompt = `Analyze this project concisely:
Title: ${project.Title}
Description: ${project.Description || 'No description provided'}
Major: ${project.major || 'Not specified'}

Return a focused HTML analysis with this structure:
<div class="text-xl font-bold text-[#FF6F61] mt-6 mb-4 border-b border-[#FF6F61]/20 pb-2">{Section Title}</div>
<div class="text-lg font-semibold text-gray-700 mt-4 mb-3"><strong>{Subsection}</strong></div>
<div class="ml-6 mb-2 flex items-start gap-2">
  <span class="text-[#FFB168] mt-1.5">•</span>
  <span class="flex-1 text-gray-600">{Point}</span>
</div>

Please analyze and provide:

1. Technical Feasibility Analysis
   - Required technical skills and technologies
   - Potential technical challenges

2. Innovative Enhancement Ideas
   - Potential features and improvements
   - Unique selling points

3. Learning Opportunities
   - Key skills to be gained
   - Growth areas

4. Risk Assessment
   - Potential obstacles
   - Mitigation strategies
   - Critical success factors

 Use the exact HTML structure provided
 Keep each section focused and concise.2 to 3 points per subsection in each section
 No markdown
`

    // Get AI response
    const result = await props.model.generateContent(prompt)
    const analysis = result.response.text()

    // Add bot message with analysis (no need for formatting since AI returns formatted HTML)
    messages.value.push({
      type: 'bot',
      analysis: analysis
    })

  } catch (error) {
    messages.value.push({
      type: 'bot',
      error: true,
      text: error.message === 'Project not found' 
        ? 'Please enter a valid project title from the list.'
        : 'Sorry, I encountered an error analyzing the project. Please try again.'
    })
  } finally {
    clearInterval(timer) // Clear the timer
    isLoading.value = false
    loadingTimer.value = 10 // Reset timer
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

// Add switchMode function in script
const switchMode = (mode) => {
  chatMode.value = mode
  if (mode === 'recommendations') {
    selectedTags.value = []
  } else {
    projectInput.value = ''
  }
}
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