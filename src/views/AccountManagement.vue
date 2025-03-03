<template>
  <div class="p-6">
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

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
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
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
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
import { ref, onMounted } from 'vue'
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db, auth } from '@/firebase'

export default {
  setup() {
    const users = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showAddUserModal = ref(false)
    const showDeleteModal = ref(false)
    const editingUser = ref(null)
    const userToDelete = ref(null)
    const userForm = ref({
      name: '',
      email: '',
      role: 'student',
      password: ''
    })

    // Fetch users from Firestore
    const fetchUsers = async () => {
      try {
        loading.value = true
        const querySnapshot = await getDocs(collection(db, 'users'))
        users.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (err) {
        error.value = 'Failed to fetch users'
        console.error('Error fetching users:', err)
      } finally {
        loading.value = false
      }
    }

    // Get user initials for avatar
    const getInitials = (name) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    }

    // Format date
    const formatDate = (date) => {
      if (!date) return 'Never'
      return new Date(date.seconds * 1000).toLocaleDateString()
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
      editingUser.value = user
      userForm.value = {
        name: user.name,
        email: user.email,
        role: user.role
      }
      showAddUserModal.value = true
    }

    // Handle delete confirmation
    const confirmDelete = (user) => {
      userToDelete.value = user
      showDeleteModal.value = true
    }

    // Handle user deletion
    const deleteUser = async () => {
      if (!userToDelete.value) return

      try {
        loading.value = true
        await deleteDoc(doc(db, 'users', userToDelete.value.id))
        await fetchUsers()
        showDeleteModal.value = false
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
        loading.value = true
        
        if (editingUser.value) {
          // Update existing user
          await updateDoc(doc(db, 'users', editingUser.value.id), {
            name: userForm.value.name,
            email: userForm.value.email,
            role: userForm.value.role
          })
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
          
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: userForm.value.name,
            email: userForm.value.email,
            role: userForm.value.role,
            createdAt: new Date(),
            lastLogin: null
          })
        }
        
        await fetchUsers()
        showAddUserModal.value = false
        editingUser.value = null
        userForm.value = {
          name: '',
          email: '',
          role: 'student',
          password: ''
        }
      } catch (err) {
        error.value = 'Failed to save user'
        console.error('Error saving user:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchUsers)

    return {
      users,
      loading,
      error,
      showAddUserModal,
      showDeleteModal,
      editingUser,
      userForm,
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