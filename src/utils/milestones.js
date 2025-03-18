import { db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

/**
 * Get all milestones for a major
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @returns {Promise<Array>} The milestones array
 */
export const getMilestones = async (schoolId, year, majorId, majorDocId) => {
    try {
      const majorRef = doc(db, 'schools', schoolId, 'projects', year, majorId, majorDocId)
      const majorDoc = await getDoc(majorRef)
      console.log(`Starting majorDocId ${majorDocId}`);
      
      if (!majorDoc.exists()) {
        throw new Error('Major document not found')
      }
  
      return majorDoc.data().milestones || []
    } catch (error) {
      console.error('Error getting milestones:', error)
      throw error
    }
  }
  
  /**
   * Get a specific milestone by description
   * @param {string} schoolId - The school ID
   * @param {string} year - The academic year
   * @param {string} majorId - The major ID
   * @param {string} majorDocId - The major document ID
   * @param {string} description - The milestone description to find
   * @returns {Promise<Object>} The milestone object or null if not found
   */
  export const getMilestone = async (schoolId, year, majorId, majorDocId, description) => {
    try {
      const milestones = await getMilestones(schoolId, year, majorId, majorDocId)
      return milestones.find(m => m.description === description) || null
    } catch (error) {
      console.error(`Error getting milestone "${description}":`, error)
      throw error
    }
  }

  export const getMilestoneData = (userId, majorId = null) => {
    try {
      // If majorId is provided, use lecturer key pattern, otherwise use student pattern
      const userKey = majorId ? 
        `${userId}_${majorId}_milestones` : 
        `${userId}_milestones`
        
      const storedData = localStorage.getItem(userKey)
      
      if (!storedData) return null
      
      const data = JSON.parse(storedData)
      
      // Check if data is stale (older than 1 hour)
      const now = new Date().getTime()
      const isStale = now - data.lastUpdated > 3600000 // 1 hour in milliseconds
      
      if (isStale) {
        localStorage.removeItem(userKey)
        return null
      }
      
      // Convert date strings back to Date objects
      if (data.upcomingMilestone?.deadline) {
        // Check if deadline is a Firestore timestamp format
        if (typeof data.upcomingMilestone.deadline === 'object' && data.upcomingMilestone.deadline.seconds) {
          data.upcomingMilestone.deadline = new Date(data.upcomingMilestone.deadline.seconds * 1000)
        } else {
          // Try to parse as regular date string
          const parsedDate = new Date(data.upcomingMilestone.deadline)
          data.upcomingMilestone.deadline = isNaN(parsedDate.getTime()) ? null : parsedDate
        }
      }
      
      if (data.allMilestones) {
        data.allMilestones = data.allMilestones.map(milestone => {
          if (!milestone.deadline) return milestone
          
          let deadlineDate
          // Check if deadline is a Firestore timestamp format
          if (typeof milestone.deadline === 'object' && milestone.deadline.seconds) {
            deadlineDate = new Date(milestone.deadline.seconds * 1000)
          } else {
            // Try to parse as regular date string
            deadlineDate = new Date(milestone.deadline)
            if (isNaN(deadlineDate.getTime())) {
              deadlineDate = null
            }
          }
          
          return {
            ...milestone,
            deadline: deadlineDate
          }
        })
      }
      
      // Log the converted dates for debugging
      console.log('Converted upcoming milestone deadline:', data.upcomingMilestone?.deadline)
      console.log('Converted all milestones:', data.allMilestones?.map(m => m.deadline))
      
      return data
    } catch (err) {
      console.error('Error retrieving milestone data:', err)
      return null
    }
  }

/**
 * Check if a specific milestone's deadline has passed
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @param {string} description - The description of the milestone to check
 * @returns {Promise<boolean>} True if the deadline has passed, false otherwise
 */
export const hasMilestoneDeadlinePassed = async (schoolId, year, majorId, majorDocId, description, currentDate) => {
  try {
    const milestones = await getMilestones(schoolId, year, majorId, majorDocId)
    const milestone = milestones.find(m => m.description === description)

    if (!milestone) {
      throw new Error(`Milestone with description "${description}" not found`)
    }

    const deadline = milestone.deadline?.toDate() || null
    if (!deadline) {
      return false
    }

    return currentDate > deadline
  } catch (error) {
    console.error('Error checking milestone deadline:', error)
    throw error
  }
}

/**
 * Update the status of a specific milestone
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @param {string} description - The description of the milestone to update
 * @param {Object} updates - The updates to apply to the milestone
 * @returns {Promise<void>}
 */
export const updateMilestone = async (schoolId, year, majorId, majorDocId, description, updates) => {
  try {
    const majorRef = doc(db, 'schools', schoolId, 'projects', year, majorId, majorDocId)
    const majorDoc = await getDoc(majorRef)

    if (!majorDoc.exists()) {
      throw new Error('Major document not found')
    }

    const milestones = majorDoc.data().milestones || []
    const milestoneIndex = milestones.findIndex(m => m.description === description)

    if (milestoneIndex === -1) {
      throw new Error(`Milestone with description "${description}" not found`)
    }

    // Update the milestone with new data while preserving existing fields
    milestones[milestoneIndex] = {
      ...milestones[milestoneIndex],
      ...updates,
      updatedAt: new Date()
    }

    await updateDoc(majorRef, {
      milestones: milestones
    })
  } catch (error) {
    console.error('Error updating milestone status:', error)
    throw error
  }
} 
/**
 * Check if the Project Bidding Done deadline has passed
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @returns {Promise<boolean>} True if the deadline has passed, false otherwise
 */
export const hasBiddingDeadlinePassed = async (schoolId, year, majorId, majorDocId, currentDate) => {
    return hasMilestoneDeadlinePassed(schoolId, year, majorId, majorDocId, "Project Bidding Done", currentDate)
  }
  
  /**
   * Mark a milestone as completed
   * @param {string} schoolId - The school ID
   * @param {string} year - The academic year
   * @param {string} majorId - The major ID
   * @param {string} majorDocId - The major document ID
   * @param {string} description - The milestone description
   * @returns {Promise<void>}
   */
  export const markMilestoneCompleted = async (schoolId, year, majorId, majorDocId, description) => {
    await updateMilestone(schoolId, year, majorId, majorDocId, description, {
      completed: true
    })
  }
  
  /**
   * Ensure the Project Bidding Done milestone has the "completed" field
   * @param {string} schoolId - The school ID
   * @param {string} year - The academic year
   * @param {string} majorId - The major ID
   * @param {string} majorDocId - The major document ID
   * @returns {Promise<void>}
   */
  export const ensureBiddingMilestoneHasCompletedField = async (schoolId, year, majorId, majorDocId) => {
    try {
      const milestone = await getMilestone(schoolId, year, majorId, majorDocId, "Project Bidding Done")
      
      if (milestone && milestone.completed === undefined) {
        await updateMilestone(schoolId, year, majorId, majorDocId, "Project Bidding Done", {
          completed: false
        })
      }
    } catch (error) {
      console.error('Error ensuring bidding milestone has completed field:', error)
    }
  }
  
  /**
   * Check if project assignments have been resolved (milestone completed)
   * @param {string} schoolId - The school ID
   * @param {string} year - The academic year
   * @param {string} majorId - The major ID
   * @param {string} majorDocId - The major document ID
   * @returns {Promise<boolean>}
   */
  export const areAssignmentsResolved = async (schoolId, year, majorId, majorDocId) => {
    try {
      const milestone = await getMilestone(schoolId, year, majorId, majorDocId, "Project Bidding Done")
      return milestone?.completed === true
    } catch (error) {
      console.error('Error checking if assignments resolved:', error)
      return false
    }
  }