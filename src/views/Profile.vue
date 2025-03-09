<template>
    <div class="container mx-auto px-4 py-8">
      <!-- Student Layout (Two-column) -->
      <div v-if="userStore.userRole === 'student'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column (Introduction & Skills) -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Introduction Section -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">Introduction / Internship Experience</h2>
              <button 
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                @click="editIntroduction = true"
                v-if="!editIntroduction"
              >
                <i class="fas fa-edit mr-1"></i> Edit
              </button>
            </div>
            
            <!-- Introduction Display -->
            <div v-if="!editIntroduction" class="border border-dashed border-gray-300 rounded-md p-4 bg-gray-50 text-center" :class="{'text-center': !userStore.currentUser?.introduction}">
              <p v-if="userStore.currentUser?.introduction" class="text-gray-700 whitespace-pre-line">
                {{ userStore.currentUser.introduction }}
              </p>
              <p v-else class="text-gray-500">
                Share your internship experience or introduce yourself
              </p>
            </div>
            
            <!-- Introduction Edit Form -->
            <div v-else>
              <div class="mb-2">
                <textarea 
                  v-model="introductionText" 
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Share your internship experience or introduce yourself (max 300 characters)"
                  maxlength="300"
                ></textarea>
                <div class="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{{ introductionText.length }}/300 characters</span>
                </div>
              </div>
              <div class="flex justify-end space-x-2">
                <button 
                  @click="editIntroduction = false" 
                  class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  @click="saveIntroduction" 
                  class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  :disabled="savingIntroduction"
                >
                  <span v-if="savingIntroduction">Saving...</span>
                  <span v-else>Save</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Knowledge & Skills Section -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800">Knowledge &amp; Skills</h2>
              <button 
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                @click="editSkills = true"
                v-if="!editSkills"
              >
                <i class="fas fa-edit mr-1"></i> Edit
              </button>
            </div>
            
            <!-- Skills Display -->
            <div v-if="!editSkills" class="border border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p class="text-sm text-gray-500">CGPA</p>
                  <p v-if="userStore.currentUser?.cgpa" class="text-lg font-medium">{{ userStore.currentUser.cgpa }}</p>
                  <p v-else class="text-gray-500 italic">Not specified</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-sm text-gray-500">Skills</p>
                  <div v-if="userStore.currentUser?.skills && userStore.currentUser.skills.length > 0" class="flex flex-wrap gap-2 mt-1">
                    <span 
                      v-for="skill in userStore.currentUser.skills" 
                      :key="skill"
                      class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {{ skill }}
                    </span>
                  </div>
                  <p v-else class="text-gray-500 italic">Add your technical and soft skills</p>
                </div>
              </div>
            </div>
            
            <!-- Skills Edit Form -->
            <div v-else>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label class="block text-sm text-gray-500 mb-1">CGPA</label>
                  <input 
                    v-model="cgpaValue" 
                    type="number" 
                    min="0" 
                    max="4.0" 
                    step="0.01"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your CGPA (e.g. 3.75)"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm text-gray-500 mb-1">Skills</label>
                  <div class="flex flex-wrap gap-2 mb-2">
                    <span 
                      v-for="(skill, index) in skillsList" 
                      :key="index"
                      class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                    >
                      {{ skill }}
                      <button @click="removeSkill(index)" class="ml-1 text-blue-600 hover:text-blue-800">
                        <i class="fas fa-times"></i>
                      </button>
                    </span>
                  </div>
                  <div class="flex">
                    <input 
                      v-model="newSkill" 
                      type="text" 
                      class="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a skill (e.g. JavaScript, Team Work)"
                      @keyup.enter="addSkill"
                    />
                    <button 
                      @click="addSkill" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex justify-end space-x-2">
                <button 
                  @click="editSkills = false" 
                  class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  @click="saveSkills" 
                  class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  :disabled="savingSkills"
                >
                  <span v-if="savingSkills">Saving...</span>
                  <span v-else>Save</span>
                </button>
              </div>
            </div>
            
            <p class="text-sm text-gray-500 mt-3">
              Complete your profile to help lecturers match you with appropriate projects.
            </p>
          </div>
        </div>
        
        <!-- Right Column (Profile Card) -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
            
            <!-- Loading State -->
            <div v-if="userStore.loading" class="flex justify-center my-8">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            
            <!-- User Profile Content -->
            <div v-else-if="userStore.currentUser" class="space-y-6">
              <!-- Profile Picture Section -->
              <div class="flex flex-col items-center justify-center mb-8">
                <!-- Profile Picture Display -->
                <div class="relative group">
                  <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                  
                  <!-- If there's a profile URL, show the image -->
                  <div v-if="profileUrl" 
                       class="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer"
                       @click="triggerFileInput">
                    <img :src="profileUrl" alt="Profile Picture" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Otherwise, show initials -->
                  <div v-else 
                       class="bg-blue-100 text-blue-800 rounded-full h-24 w-24 flex items-center justify-center text-3xl font-bold cursor-pointer group relative"
                       @click="triggerFileInput">
                    {{ userInitials }}
                    <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref="fileInput" 
                    class="hidden" 
                    accept="image/*"
                    @change="handleFileUpload"
                  />
                </div>
                
                <p class="text-sm text-gray-500 mt-2">Click to change profile picture</p>
                
                <!-- Error message -->
                <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
              </div>
              
              <!-- Basic User Info -->
              <div class="grid grid-cols-1 gap-4">
                <div class="space-y-2">
                  <p class="text-sm text-gray-500">Full Name</p>
                  <p class="text-lg font-medium">{{ userStore.currentUser.name }}</p>
                </div>
                
                <div class="space-y-2">
                  <p class="text-sm text-gray-500">Email Address</p>
                  <p class="text-lg font-medium">{{ userStore.currentUser.email }}</p>
                </div>
                
                <div class="space-y-2">
                  <p class="text-sm text-gray-500">Role</p>
                  <p class="text-lg font-medium capitalize">{{ userStore.currentUser.role }}</p>
                </div>
                
                <div class="space-y-2">
                  <p class="text-sm text-gray-500">School</p>
                  <p class="text-lg font-medium">{{ userStore.currentUser.school }}</p>
                </div>
              </div>
            </div>
            
            <!-- No User Data -->
            <div v-else class="text-center py-8 text-gray-500">
              <p>User information not available</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Admin/Lecturer Layout (Single column) -->
      <div v-else class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <!-- Loading State -->
          <div v-if="userStore.loading" class="flex justify-center my-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          
          <!-- User Profile Content -->
          <div v-else-if="userStore.currentUser" class="space-y-6">
            <!-- Profile Picture Section -->
            <div class="flex flex-col items-center justify-center mb-8">
              <!-- Profile Picture Display -->
              <div class="relative group">
                <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
                
                <!-- If there's a profile URL, show the image -->
                <div v-if="profileUrl" 
                     class="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer"
                     @click="triggerFileInput">
                  <img :src="profileUrl" alt="Profile Picture" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <!-- Otherwise, show initials -->
                <div v-else 
                     class="bg-blue-100 text-blue-800 rounded-full h-24 w-24 flex items-center justify-center text-3xl font-bold cursor-pointer group relative"
                     @click="triggerFileInput">
                  {{ userInitials }}
                  <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref="fileInput" 
                  class="hidden" 
                  accept="image/*"
                  @change="handleFileUpload"
                />
              </div>
              
              <p class="text-sm text-gray-500 mt-2">Click to change profile picture</p>
              
              <!-- Error message -->
              <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
            </div>
            
            <!-- Basic User Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <p class="text-sm text-gray-500">Full Name</p>
                <p class="text-lg font-medium">{{ userStore.currentUser.name }}</p>
              </div>
              
              <div class="space-y-2">
                <p class="text-sm text-gray-500">Email Address</p>
                <p class="text-lg font-medium">{{ userStore.currentUser.email }}</p>
              </div>
              
              <div class="space-y-2">
                <p class="text-sm text-gray-500">Role</p>
                <p class="text-lg font-medium capitalize">{{ userStore.currentUser.role }}</p>
              </div>
              
              <div class="space-y-2">
                <p class="text-sm text-gray-500">School</p>
                <p class="text-lg font-medium">{{ userStore.currentUser.school }}</p>
              </div>
            </div>
          </div>
          
          <!-- No User Data -->
          <div v-else class="text-center py-8 text-gray-500">
            <p>User information not available</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { storage, db } from '@/firebase'
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
  import { doc, updateDoc } from 'firebase/firestore'
  
  export default {
    name: 'ProfileView',
    setup() {
      const userStore = useUserStore()
      const fileInput = ref(null)
      const uploading = ref(false)
      const error = ref(null)
      const profileUrl = ref(null)
      
      // Introduction editing
      const editIntroduction = ref(false)
      const introductionText = ref('')
      const savingIntroduction = ref(false)
      
      // Skills editing
      const editSkills = ref(false)
      const skillsList = ref([])
      const newSkill = ref('')
      const cgpaValue = ref('')
      const savingSkills = ref(false)
      
      // Compute user initials for the avatar
      const userInitials = computed(() => {
        if (!userStore.currentUser || !userStore.currentUser.name) return '?'
        return userStore.currentUser.name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2)
      })
      
      // Load profile picture and user data on mount
      onMounted(async () => {
        if (userStore.currentUser?.profilePicture) {
          try {
            const url = await getDownloadURL(storageRef(storage, userStore.currentUser.profilePicture))
            profileUrl.value = url
          } catch (err) {
            console.error('Error loading profile picture:', err)
          }
        }
        
        // Initialize introduction text
        if (userStore.currentUser?.introduction) {
          introductionText.value = userStore.currentUser.introduction
        }
        
        // Initialize skills list
        if (userStore.currentUser?.skills && Array.isArray(userStore.currentUser.skills)) {
          skillsList.value = [...userStore.currentUser.skills]
        }
        
        // Initialize CGPA
        if (userStore.currentUser?.cgpa) {
          cgpaValue.value = userStore.currentUser.cgpa
        }
      })
      
      // Profile picture functions
      const triggerFileInput = () => {
        fileInput.value.click()
      }
      
      const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          error.value = 'Please upload an image file'
          return
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          error.value = 'File size should be less than 5MB'
          return
        }
        
        try {
          uploading.value = true
          error.value = null
          
          // Create storage reference
          const storageReference = storageRef(storage, `profile/${userStore.currentUser.uid}/${file.name}`)
          
          // Upload file
          await uploadBytes(storageReference, file)
          
          // Get download URL
          const downloadURL = await getDownloadURL(storageReference)
          
          // Update user document in Firestore
          const userRef = doc(db, 'schools', userStore.currentUser.school, 'users', userStore.currentUser.uid)
          await updateDoc(userRef, {
            profilePicture: `profile/${userStore.currentUser.uid}/${file.name}`
          })
          
          // Update local state
          profileUrl.value = downloadURL
          userStore.currentUser.profilePicture = `profile/${userStore.currentUser.uid}/${file.name}`
          
        } catch (err) {
          console.error('Error uploading file:', err)
          error.value = 'Failed to upload profile picture. Please try again.'
        } finally {
          uploading.value = false
        }
      }
      
      // Introduction functions
      const saveIntroduction = async () => {
        if (!userStore.currentUser) return
        
        try {
          savingIntroduction.value = true
          
          // Update user document in Firestore
          const userRef = doc(db, 'schools', userStore.currentUser.school, 'users', userStore.currentUser.uid)
          await updateDoc(userRef, {
            introduction: introductionText.value.trim()
          })
          
          // Update local state
          userStore.currentUser.introduction = introductionText.value.trim()
          
          // Close edit mode
          editIntroduction.value = false
        } catch (err) {
          console.error('Error saving introduction:', err)
          error.value = 'Failed to save introduction. Please try again.'
        } finally {
          savingIntroduction.value = false
        }
      }
      
      // Skills functions
      const addSkill = () => {
        if (!newSkill.value.trim()) return
        
        // Check if skill already exists
        if (skillsList.value.includes(newSkill.value.trim())) {
          error.value = 'This skill is already added'
          setTimeout(() => {
            error.value = null
          }, 3000)
          return
        }
        
        // Add skill to list
        skillsList.value.push(newSkill.value.trim())
        newSkill.value = ''
      }
      
      const removeSkill = (index) => {
        skillsList.value.splice(index, 1)
      }
      
      const saveSkills = async () => {
        if (!userStore.currentUser) return
        
        try {
          savingSkills.value = true
          
          // Prepare data to update
          const updateData = {
            skills: skillsList.value
          }
          
          // Add CGPA if provided
          if (cgpaValue.value) {
            updateData.cgpa = cgpaValue.value
          }
          
          // Update user document in Firestore
          const userRef = doc(db, 'schools', userStore.currentUser.school, 'users', userStore.currentUser.uid)
          await updateDoc(userRef, updateData)
          
          // Update local state
          userStore.currentUser.skills = [...skillsList.value]
          if (cgpaValue.value) {
            userStore.currentUser.cgpa = cgpaValue.value
          }
          
          // Close edit mode
          editSkills.value = false
        } catch (err) {
          console.error('Error saving skills:', err)
          error.value = 'Failed to save skills. Please try again.'
        } finally {
          savingSkills.value = false
        }
      }
      
      return {
        userStore,
        userInitials,
        fileInput,
        uploading,
        error,
        profileUrl,
        triggerFileInput,
        handleFileUpload,
        
        // Introduction
        editIntroduction,
        introductionText,
        savingIntroduction,
        saveIntroduction,
        
        // Skills
        editSkills,
        skillsList,
        newSkill,
        cgpaValue,
        savingSkills,
        addSkill,
        removeSkill,
        saveSkills
      }
    }
  }
  </script>
  
  <style scoped>
  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  </style>
  