<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Account Management</h2>
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span class="text-sm text-gray-600">Admin</span>
          <span class="w-3 h-3 rounded-full bg-green-500 ml-4"></span>
          <span class="text-sm text-gray-600">Lecturer</span>
          <span class="w-3 h-3 rounded-full bg-purple-500 ml-4"></span>
          <span class="text-sm text-gray-600">Student</span>
        </div>
        <button 
          @click="showAddUserModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New User
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="flex items-center">
        <label class="mr-2 text-sm font-medium text-gray-700">Role:</label>
        <select 
          v-model="filters.role" 
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="student">Students</option>
          <option value="lecturer">Lecturers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      
      <div class="flex items-center">
        <label class="mr-2 text-sm font-medium text-gray-700">Search:</label>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search by name or email"
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-gray-500">No users found matching your filters.</p>
    </div>

    <!-- Users Table -->
    <div v-else>
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {{ getInitials(user.name) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user.role)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.lastLogin) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button 
                  @click="confirmDelete(user)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Info -->
      <div class="mt-4 flex items-center justify-between text-sm text-gray-700">
        <div>
          Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredUsers.length) }} of {{ filteredUsers.length }} users
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input 
                v-model="userForm.name"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input 
                v-model="userForm.email"
                type="email"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <!-- School selection - only visible for non-admin users -->
            <div v-if="userStore.userRole !== 'admin'">
              <label class="block text-sm font-medium text-gray-700">School</label>
              <select 
                v-model="userForm.school"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option v-for="school in schools" :key="school" :value="school">{{ school }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select 
                v-model="userForm.role"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="lecturer">Lecturer</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div v-if="!editingUser">
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input 
                v-model="userForm.password"
                type="password"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button 
              type="button"
              @click="showAddUserModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="loading"
            >
              {{ editingUser ? 'Update' : 'Add' }} User
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p class="text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deleteUser"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db, auth } from '@/firebase'
import { useUserStore } from '@/stores/userStore'

export default {
  setup() {
    const userStore = useUserStore()
    const users = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showAddUserModal = ref(false)
    const showDeleteModal = ref(false)
    const editingUser = ref(null)
    const userToDelete = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 10
    const schools = computed(() => {
      // If admin, only show their school
      if (userStore.userRole === 'admin') {
        return [userStore.currentUser.school]
      }
      // For super admin or other roles, show all schools
      return ['Computer Sciences', 'Art', 'Maths']
    })
    
    const filters = ref({
      role: 'student', // Default to show students
      search: ''
    })
    
    const userForm = ref({
      name: '',
      email: '',
      school: userStore.userRole === 'admin' ? userStore.currentUser.school : 'Computer Sciences',
      role: 'student',
      password: ''
    })

    // Filtered users based on selected filters
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        // For admin, only show users from their school
        if (userStore.userRole === 'admin' && user.school !== userStore.currentUser.school) {
          return false
        }
        
        // Filter by role
        if (filters.value.role && user.role !== filters.value.role) {
          return false
        }
        
        // Filter by search term
        if (filters.value.search) {
          const searchTerm = filters.value.search.toLowerCase()
          return (
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
          )
        }
        
        return true
      })
    })

    // Pagination computed properties
    const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
    const endIndex = computed(() => startIndex.value + itemsPerPage)
    const paginatedUsers = computed(() => {
      return filteredUsers.value.slice(startIndex.value, endIndex.value)
    })

    // Watch for filter changes to reset pagination
    watch([() => filters.value.role, () => filters.value.search], () => {
      currentPage.value = 1
    })

    // Fetch users from all schools
    const fetchUsers = async () => {
      try {
        loading.value = true
        error.value = null
        users.value = []
        
        // For admin, only fetch users from their school
        if (userStore.userRole === 'admin') {
          const querySnapshot = await getDocs(collection(db, 'schools', userStore.currentUser.school, 'users'))
          users.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            school: userStore.currentUser.school,
            ...doc.data()
          }))
        } else {
          // For super admin or other roles, fetch from all schools
          for (const school of schools.value) {
            const querySnapshot = await getDocs(collection(db, 'schools', school, 'users'))
            const schoolUsers = querySnapshot.docs.map(doc => ({
              id: doc.id,
              school: school,
              ...doc.data()
            }))
            users.value = [...users.value, ...schoolUsers]
          }
        }
      } catch (err) {
        error.value = 'Failed to fetch users'
        console.error('Error fetching users:', err)
      } finally {
        loading.value = false
      }
    }

    // Get user initials for avatar
    const getInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return 'Never'
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString()
      }
      return new Date(date).toLocaleDateString()
    }

    // Get role badge styling
    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-blue-100 text-blue-800',
        lecturer: 'bg-green-100 text-green-800',
        student: 'bg-purple-100 text-purple-800'
      }
      return classes[role] || 'bg-gray-100 text-gray-800'
    }

    // Handle edit user
    const editUser = (user) => {
      // Check if admin has permission to edit this user
      if (userStore.userRole === 'admin' && user.school !== userStore.currentUser.school) {
        error.value = 'You do not have permission to edit users from other schools'
        return
      }
      
      editingUser.value = user
      userForm.value = {
        name: user.name,
        email: user.email,
        school: user.school,
        role: user.role
      }
      showAddUserModal.value = true
    }

    // Handle delete confirmation
    const confirmDelete = (user) => {
      // Check if admin has permission to delete this user
      if (userStore.userRole === 'admin' && user.school !== userStore.currentUser.school) {
        error.value = 'You do not have permission to delete users from other schools'
        return
      }
      
      userToDelete.value = user
      showDeleteModal.value = true
    }

    // Handle user deletion
    const deleteUser = async () => {
      if (!userToDelete.value) return

      try {
        loading.value = true
        // Delete from the correct school collection
        await deleteDoc(doc(db, 'schools', userToDelete.value.school, 'users', userToDelete.value.id))
        await fetchUsers()
        showDeleteModal.value = false
        userToDelete.value = null
      } catch (err) {
        error.value = 'Failed to delete user'
        console.error('Error deleting user:', err)
      } finally {
        loading.value = false
      }
    }

    // Handle form submission
    const handleSubmit = async () => {
      try {
        // Check if admin has permission for the selected school
        if (userStore.userRole === 'admin' && userForm.value.school !== userStore.currentUser.school) {
          error.value = 'You can only create/edit users in your own school'
          return
        }
        
        loading.value = true
        
        if (editingUser.value) {
          // Check if school has changed and if admin has permission
          if (editingUser.value.school !== userForm.value.school) {
            if (userStore.userRole === 'admin') {
              error.value = 'You cannot change a user\'s school'
              return
            }
            
            // Delete from old school collection
            await deleteDoc(doc(db, 'schools', editingUser.value.school, 'users', editingUser.value.id))
            
            // Create in new school collection
            await setDoc(doc(db, 'schools', userForm.value.school, 'users', editingUser.value.id), {
              name: userForm.value.name,
              email: userForm.value.email,
              role: userForm.value.role,
              lastLogin: editingUser.value.lastLogin || null,
              createdAt: editingUser.value.createdAt || serverTimestamp()
            })
          } else {
            // Update in same school collection
            await updateDoc(doc(db, 'schools', userForm.value.school, 'users', editingUser.value.id), {
              name: userForm.value.name,
              email: userForm.value.email,
              role: userForm.value.role
            })
          }
        } else {
          // Create new user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            userForm.value.email,
            userForm.value.password
          )
          
          await updateProfile(userCredential.user, {
            displayName: userForm.value.name
          })
          
          // Create in selected school collection
          await setDoc(doc(db, 'schools', userForm.value.school, 'users', userCredential.user.uid), {
            name: userForm.value.name,
            email: userForm.value.email,
            role: userForm.value.role,
            createdAt: serverTimestamp(),
            lastLogin: null
          })
        }
        
        await fetchUsers()
        showAddUserModal.value = false
        editingUser.value = null
        userForm.value = {
          name: '',
          email: '',
          school: userStore.userRole === 'admin' ? userStore.currentUser.school : 'Computer Sciences',
          role: 'student',
          password: ''
        }
      } catch (err) {
        error.value = 'Failed to save user: ' + (err.message || 'Unknown error')
        console.error('Error saving user:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchUsers)

    return {
      users,
      filteredUsers,
      paginatedUsers,
      loading,
      error,
      showAddUserModal,
      showDeleteModal,
      editingUser,
      userForm,
      schools,
      filters,
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      getInitials,
      formatDate,
      getRoleBadgeClass,
      editUser,
      confirmDelete,
      deleteUser,
      handleSubmit
    }
  }
}
</script> 