import { db } from '@/firebase'
import { collection, getDocs, query } from 'firebase/firestore'

/**
 * Get the latest academic year from Firestore
 * @param {string} schoolId - The school ID
 * @returns {Promise<{academicYear: string, yearId: string}>} - The latest academic year in format "2023/2024" and its ID "2324"
 */
export const getLatestAcademicYear = async (schoolId) => {
  try {
    // Get all academic years from the projects collection
    const projectsRef = collection(db, 'schools', schoolId, 'projects')
    const projectsSnapshot = await getDocs(query(projectsRef))
    
    if (projectsSnapshot.empty) {
      return null
    }
    
    // Extract all academic year IDs (e.g., "2324")
    const academicYearIds = projectsSnapshot.docs.map(doc => doc.id)
    
    // Sort in descending order to get the latest year
    academicYearIds.sort((a, b) => b.localeCompare(a))
    
    const latestYearId = academicYearIds[0]
    
    // Convert to readable format (e.g., "2023/2024")
    const startYear = `20${latestYearId.slice(0, 2)}`
    const endYear = `20${latestYearId.slice(2)}`
    
    return {
      academicYear: `${startYear}/${endYear}`,
      yearId: latestYearId
    }
  } catch (error) {
    console.error('Error getting latest academic year:', error)
    return null
  }
}

/**
 * Format academic year ID to readable format
 * @param {string} yearId - The academic year ID (e.g., "2324")
 * @returns {string} - Formatted academic year (e.g., "2023/2024")
 */
export const formatAcademicYear = (yearId) => {
  if (!yearId || yearId.length !== 4) return ''
  
  const startYear = `20${yearId.slice(0, 2)}`
  const endYear = `20${yearId.slice(2)}`
  
  return `${startYear}/${endYear}`
}

/**
 * Convert readable academic year to ID format
 * @param {string} academicYear - The academic year in format "2023/2024"
 * @returns {string} - Academic year ID (e.g., "2324")
 */
export const academicYearToId = (academicYear) => {
  if (!academicYear || !academicYear.includes('/')) return ''
  
  const [startYear, endYear] = academicYear.split('/')
  
  return `${startYear.slice(-2)}${endYear.slice(-2)}`
} 