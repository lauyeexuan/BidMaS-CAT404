import { db } from '@/firebase';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';

/**
 * Format date for notification display
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} Formatted date string
 */
const formatDateForNotification = (timestamp) => {
  if (!timestamp) return 'No date set';
  
  try {
    const date = new Date(0);
    date.setUTCSeconds(timestamp.seconds);
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get all users affected by a change to a specific major
 * @param {string} schoolId - School ID
 * @param {string} majorId - Major ID
 * @returns {Promise<Array>} Array of user IDs
 */
const getAffectedUsers = async (schoolId, majorId) => {
  try {
    // Correct collection path: schools/{schoolId}/users
    const usersRef = collection(db, 'schools', schoolId, 'users');
    
    // 1. Students - only those in the specific major
    // 2. Lecturers - regardless of major (excluding admins)
    
    // Students from the specific major
    const studentQuery = query(usersRef, 
      where('role', '==', 'student'),
      where('major', '==', majorId)
    );
    
    // Only lecturers (no admins)
    const lecturerQuery = query(usersRef, 
      where('role', '==', 'lecturer')
    );
    
    // Run queries in parallel for efficiency
    const [studentSnapshot, lecturerSnapshot] = await Promise.all([
      getDocs(studentQuery),
      getDocs(lecturerQuery)
    ]);
    
    // Combine all affected user IDs
    const affectedUserIds = [
      ...studentSnapshot.docs.map(doc => doc.id),
      ...lecturerSnapshot.docs.map(doc => doc.id)
    ];
    
    // Remove duplicates (just in case)
    return [...new Set(affectedUserIds)];
  } catch (error) {
    console.error('Error getting affected users:', error);
    return [];
  }
};

/**
 * Get only lecturer users from a school
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} Array of lecturer user IDs
 */
const getLecturerUsers = async (schoolId) => {
  try {
    const usersRef = collection(db, 'schools', schoolId, 'users');
    const lecturerQuery = query(usersRef, where('role', '==', 'lecturer'));
    const lecturerSnapshot = await getDocs(lecturerQuery);
    return lecturerSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting lecturer users:', error);
    return [];
  }
};

/**
 * Create a notification for users
 * @param {string} schoolId - School ID
 * @param {string} academicYear - Academic year
 * @param {string} majorId - Major ID
 * @param {string} changeType - Type of change
 * @param {string} details - Description of the change
 * @returns {Promise<void>}
 */
const createNotification = async (schoolId, academicYear, majorId, changeType, details) => {
  try {
    const notificationsRef = collection(db, 'schools', schoolId, 'notifications');
    
    // Get all affected users
    const affectedUsers = await getAffectedUsers(schoolId, majorId);
    
    // Create the notification document
    await addDoc(notificationsRef, {
      type: "project_settings_change",
      createdAt: Timestamp.now(),
      readBy: {}, // Empty object to track which users have read this notification
      academicYear,
      majorId,
      changeType,
      details,
      affectedUsers, // Populated with affected user IDs
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Create a readable milestone description for notifications
 * @param {Object} milestone - Milestone object
 * @param {Object} originalMilestone - Original milestone for comparison (optional)
 * @returns {string} Formatted milestone description
 */
const formatMilestoneForNotification = (milestone, originalMilestone = null) => {
  if (!milestone) return '';
  
  if (originalMilestone) {
    // For modified milestones
    return `"${milestone.description}" from ${formatDateForNotification(originalMilestone.deadline)} to ${formatDateForNotification(milestone.deadline)}`;
  } else {
    // For added milestones
    return `"${milestone.description}" (Due: ${formatDateForNotification(milestone.deadline)})`;
  }
};

/**
 * Create milestone notifications - multiple types in one function
 * @param {string} schoolId - School ID
 * @param {string} academicYear - Academic year
 * @param {string} majorName - Major name
 * @param {Array} addedMilestones - Array of added milestones
 * @param {Array} removedMilestones - Array of removed milestones
 * @param {Array} modifiedMilestones - Array of modified milestones
 * @param {Map} originalMap - Map of original milestones for reference
 * @returns {Promise<void>}
 */
const createMilestoneNotifications = async (
  schoolId,
  academicYear, 
  majorName, 
  addedMilestones, 
  removedMilestones, 
  modifiedMilestones, 
  originalMap
) => {
  // Create notifications for added milestones
  if (addedMilestones.length > 0) {
    await createNotification(
      schoolId,
      academicYear,
      majorName,
      'milestone_added',
      `${addedMilestones.length} new milestone(s) added for ${majorName}:\n${addedMilestones.map(m => 
        formatMilestoneForNotification(m)
      ).join('\n')}`
    );
  }

  // Create notifications for removed milestones
  if (removedMilestones.length > 0) {
    await createNotification(
      schoolId,
      academicYear,
      majorName,
      'milestone_removed',
      `${removedMilestones.length} milestone(s) removed for ${majorName}:\n${removedMilestones.map(m => m.description).join('\n')}`
    );
  }

  // Create notifications for modified milestones
  if (modifiedMilestones.length > 0) {
    await createNotification(
      schoolId,
      academicYear,
      majorName,
      'milestone_modified',
      `Milestone deadlines updated for ${majorName}:\n${modifiedMilestones.map(m => {
        const original = originalMap.get(m.description);
        return formatMilestoneForNotification(m, original);
      }).join('\n')}`
    );
  }
};

/**
 * Create notification for header changes
 * @param {string} schoolId - School ID
 * @param {string} academicYear - Academic year
 * @param {string} majorName - Major name
 * @param {string} action - Action performed (added, updated, removed)
 * @param {Array} newHeaders - Array of new headers
 * @returns {Promise<void>}
 */
const createHeaderNotification = async (schoolId, academicYear, majorName, action, newHeaders) => {
  try {
    const notificationsRef = collection(db, 'schools', schoolId, 'notifications');
    
    // Get only lecturer users for header notifications
    const affectedUsers = await getLecturerUsers(schoolId);
    
    // Format the header details for the notification
    const headerDetails = newHeaders.map(header => {
      let details = `${header.name}, `;
      return details;
    });

    // Create the notification document
    await addDoc(notificationsRef, {
      type: "project_settings_change",
      createdAt: Timestamp.now(),
      readBy: {}, // Empty object to track which users have read this notification
      academicYear,
      majorId: majorName,
      changeType: 'header_added',
      details: `New project headers added for ${majorName}:\n${headerDetails.join('\n')}`,
      affectedUsers, // Only lecturers will be notified
      newHeaders // Store the full header data for reference
    });
  } catch (error) {
    console.error('Error creating header notification:', error);
  }
};

/**
 * Create notification for examiner assignment
 * @param {string} schoolId - School ID
 * @param {string} academicYear - Academic year
 * @param {string} projectId - Project ID
 * @param {string} projectTitle - Project title
 * @param {string} examinerId - Examiner's user ID
 * @returns {Promise<void>}
 */
const createExaminerNotification = async (schoolId, academicYear, projectId, projectTitle, examinerId) => {
  try {
    const notificationsRef = collection(db, 'schools', schoolId, 'notifications');
    
    // Create the notification document
    await addDoc(notificationsRef, {
      type: "examiner_assignment",
      createdAt: Timestamp.now(),
      readBy: {}, // Empty object to track which users have read this notification
      academicYear,
      projectId,
      changeType: 'examiner_assigned',
      details: `You have been assigned as an examiner for the project "${projectTitle}"`,
      affectedUsers: [examinerId], // Only notify the assigned examiner
    });
  } catch (error) {
    console.error('Error creating examiner notification:', error);
  }
};

/**
 * Process milestone notifications in a non-blocking way
 * @param {string} schoolId - School ID
 * @param {string} academicYear - Academic year
 * @param {string} majorName - Major name
 * @param {Array} addedMilestones - Array of added milestones
 * @param {Array} removedMilestones - Array of removed milestones
 * @param {Array} modifiedMilestones - Array of modified milestones
 * @param {Map} originalMap - Map of original milestones for reference
 */
const processNotificationsAsync = (
  schoolId,
  academicYear,
  majorName,
  addedMilestones,
  removedMilestones,
  modifiedMilestones,
  originalMap
) => {
  setTimeout(() => {
    createMilestoneNotifications(
      schoolId,
      academicYear,
      majorName,
      addedMilestones,
      removedMilestones,
      modifiedMilestones,
      originalMap
    ).catch(error => {
      console.error('Error creating notifications:', error);
    });
  }, 0);
};

export default {
  createNotification,
  createMilestoneNotifications,
  createHeaderNotification,
  createExaminerNotification,
  processNotificationsAsync,
  formatDateForNotification,
  formatMilestoneForNotification,
  getAffectedUsers,
  getLecturerUsers
}; 