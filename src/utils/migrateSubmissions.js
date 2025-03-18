import { db } from '@/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  writeBatch, 
  doc,
  getDoc,
  limit
} from 'firebase/firestore'
import { getLatestAcademicYear } from './latestAcademicYear'

/**
 * Migrates existing submissions data to the new flattened structure
 * This function should be run once to migrate all existing data
 * @param {string} schoolId - The school ID
 * @param {Array<string>} majorIds - Array of major IDs to migrate
 * @returns {Promise<{success: boolean, migratedCount: number, errors: Array}>}
 */
export async function migrateSubmissions(schoolId, majorIds) {
  try {
    // Get the latest academic year
    const academicYearData = await getLatestAcademicYear(schoolId)
    if (!academicYearData?.yearId) {
      throw new Error('Failed to determine academic year')
    }
    const yearId = academicYearData.yearId
    
    let migratedCount = 0
    const errors = []
    const batchSize = 400 // Firestore batch limit is 500
    
    // Process each major
    for (const majorId of majorIds) {
      console.log(`Migrating submissions for major: ${majorId}`)
      
      // Get the major document
      const majorRef = collection(db, 'schools', schoolId, 'projects', yearId, majorId)
      const majorSnapshot = await getDocs(query(majorRef, where('milestones', '!=', null), limit(1)))
      
      if (majorSnapshot.empty) {
        console.log(`No milestones found for major: ${majorId}`)
        continue
      }
      
      const majorDocId = majorSnapshot.docs[0].id
      
      // Get all projects for this major
      const projectsRef = collection(
        db, 
        'schools', schoolId,
        'projects', yearId,
        majorId, majorDocId,
        'projectsPerYear'
      )
      
      const projectsSnapshot = await getDocs(projectsRef)
      
      // Process each project
      for (const projectDoc of projectsSnapshot.docs) {
        const projectData = projectDoc.data()
        const projectId = projectDoc.id
        const projectTitle = projectData.Title || 'Unknown Project'
        const lecturerId = projectData.userId
        
        if (!lecturerId) {
          console.log(`No lecturer ID found for project: ${projectId}`)
          errors.push({
            projectId,
            error: 'No lecturer ID found'
          })
          continue
        }
        
        // Get submissions for this project
        const submissionsRef = collection(projectDoc.ref, 'submissions')
        const submissionsSnapshot = await getDocs(submissionsRef)
        
        if (submissionsSnapshot.empty) {
          console.log(`No submissions found for project: ${projectId}`)
          continue
        }
        
        // Create batches for writing (Firebase has a 500 document limit per batch)
        let batch = writeBatch(db)
        let batchCount = 0
        
        // Process each submission
        for (const submissionDoc of submissionsSnapshot.docs) {
          const submissionData = submissionDoc.data()
          const submissionId = submissionDoc.id
          
          // Create the new submission document with the required fields
          const newSubmissionData = {
            yearId,
            majorId,
            lecturerId,
            projectId,
            projectTitle,
            submittedBy: submissionData.submittedBy,
            submittedAt: submissionData.submittedAt,
            milestoneDescription: submissionData.milestoneDescription || 'Unknown Milestone',
            fileName: submissionData.fileName || `submission_${submissionId}`,
            downloadUrl: submissionData.downloadUrl || '',
            migratedAt: new Date(),
            originalSubmissionPath: `schools/${schoolId}/projects/${yearId}/${majorId}/${majorDocId}/projectsPerYear/${projectId}/submissions/${submissionId}`
          }
          
          // Add the new document to the submissions collection
          const newSubmissionRef = doc(collection(db, 'schools', schoolId, 'submissions'))
          batch.set(newSubmissionRef, newSubmissionData)
          
          batchCount++
          migratedCount++
          
          // Commit the batch when it reaches the limit
          if (batchCount >= batchSize) {
            await batch.commit()
            console.log(`Committed batch of ${batchCount} submissions`)
            batch = writeBatch(db)
            batchCount = 0
          }
        }
        
        // Commit any remaining documents in the batch
        if (batchCount > 0) {
          await batch.commit()
          console.log(`Committed remaining ${batchCount} submissions for project: ${projectId}`)
        }
      }
    }
    
    console.log(`Migration completed. Migrated ${migratedCount} submissions with ${errors.length} errors.`)
    return {
      success: true,
      migratedCount,
      errors
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      migratedCount: 0,
      errors: [error.message]
    }
  }
} 