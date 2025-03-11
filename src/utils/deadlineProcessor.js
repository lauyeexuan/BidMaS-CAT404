import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, 
  Timestamp, doc, getDoc, updateDoc,
  runTransaction, serverTimestamp
} from 'firebase/firestore';
import { resolveProjectAssignments } from './assignmentResolver';

// Milestone states
const MILESTONE_STATES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Checks if a deadline has passed
 * @param {Timestamp} deadline - Firestore timestamp of the deadline
 * @returns {boolean} - Whether the deadline has passed
 */
const hasDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  const now = Timestamp.now();
  return now.toMillis() > deadline.toMillis();
};

/**
 * Gets the milestone document reference
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @returns {DocumentReference} Firestore document reference
 */
const getMilestoneRef = (schoolId, year, majorId, majorDocId) => {
  return doc(
    db,
    'schools', schoolId,
    'projects', year,
    majorId, majorDocId,
    'milestones', 'Project Bidding Done'
  );
};

/**
 * Gets all majors with passed bidding deadlines that need processing
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @returns {Promise<Array>} Array of majors with passed deadlines
 */
export async function getMajorsWithPassedDeadlines(schoolId, year) {
  try {
    // Get the year document which contains the majors array
    const yearRef = doc(db, 'schools', schoolId, 'projects', year);
    const yearDoc = await getDoc(yearRef);
    
    if (!yearDoc.exists()) {
      throw new Error(`No document found for year ${year}`);
    }

    const yearData = yearDoc.data();
    const majors = yearData.majors || [];
    const majorsWithPassedDeadlines = [];

    // Check each major listed in the year document
    for (const majorId of majors) {
      // Get all major documents in the majorId subcollection
      const majorDocsRef = collection(db, 'schools', schoolId, 'projects', year, majorId);
      const majorDocsSnap = await getDocs(majorDocsRef);

      for (const majorDoc of majorDocsSnap.docs) {
        const majorData = majorDoc.data();
        
        // Get milestone status
        const milestoneRef = getMilestoneRef(schoolId, year, majorId, majorDoc.id);
        const milestoneSnap = await getDoc(milestoneRef);
        const milestoneData = milestoneSnap.data() || {};
        
        // Check if milestone needs processing
        if (
          hasDeadlinePassed(majorData.biddingDeadline) && 
          (!milestoneData.state || 
           milestoneData.state === MILESTONE_STATES.PENDING ||
           (milestoneData.state === MILESTONE_STATES.PROCESSING && 
            Date.now() - milestoneData.lastUpdated?.toMillis() > 5 * 60 * 1000)) // Reset if processing for > 5 minutes
        ) {
          // Check if any unassigned projects with accepted bids exist
          const projectsRef = collection(majorDoc.ref, 'projectsPerYear');
          const projectsQuery = query(projectsRef, where('isAssigned', '==', false));
          const projectsSnap = await getDocs(projectsQuery);

          if (!projectsSnap.empty) {
            let hasUnprocessedBids = false;
            for (const projectDoc of projectsSnap.docs) {
              const bidsRef = collection(projectDoc.ref, 'bids');
              const acceptedBidsQuery = query(bidsRef, where('status', '==', 'accepted'));
              const acceptedBidsSnap = await getDocs(acceptedBidsQuery);
              
              if (!acceptedBidsSnap.empty) {
                hasUnprocessedBids = true;
                break;
              }
            }

            if (hasUnprocessedBids) {
              majorsWithPassedDeadlines.push({
                id: majorId,
                docId: majorDoc.id,
                name: majorData.name,
                deadline: majorData.biddingDeadline,
                milestoneState: milestoneData.state || MILESTONE_STATES.PENDING
              });
            }
          }
        }
      }
    }

    return majorsWithPassedDeadlines;
  } catch (error) {
    console.error("Error checking for passed deadlines:", error);
    throw error;
  }
}

/**
 * Processes all passed deadlines and triggers assignment resolution
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @returns {Promise<Object>} Results of processing
 */
export async function processPassedDeadlines(schoolId, year) {
  const results = {
    processedMajors: 0,
    successfulAssignments: 0,
    errors: []
  };

  try {
    const majorsWithPassedDeadlines = await getMajorsWithPassedDeadlines(schoolId, year);
    
    for (const major of majorsWithPassedDeadlines) {
      const milestoneRef = getMilestoneRef(schoolId, year, major.id, major.docId);
      
      try {
        // Use transaction to safely update milestone state
        await runTransaction(db, async (transaction) => {
          const milestoneDoc = await transaction.get(milestoneRef);
          const milestoneData = milestoneDoc.data() || {};
          
          // Check if milestone is already being processed
          if (milestoneData.state === MILESTONE_STATES.PROCESSING &&
              Date.now() - milestoneData.lastUpdated?.toMillis() <= 5 * 60 * 1000) {
            throw new Error('Milestone is already being processed');
          }

          // Set processing state
          transaction.update(milestoneRef, {
            state: MILESTONE_STATES.PROCESSING,
            lastUpdated: serverTimestamp(),
            processingStarted: serverTimestamp()
          });
        });

        // Process assignments
        const assignmentResults = await resolveProjectAssignments(
          schoolId,
          year,
          major.id,
          major.docId
        );

        results.processedMajors++;

        // Update milestone state based on results
        if (assignmentResults.success) {
          results.successfulAssignments++;
          await updateDoc(milestoneRef, {
            state: MILESTONE_STATES.COMPLETED,
            lastUpdated: serverTimestamp(),
            completedAt: serverTimestamp(),
            assignmentResults: {
              assignedStudents: assignmentResults.assignedStudents,
              completedDate: new Date()
            }
          });
        } else {
          await updateDoc(milestoneRef, {
            state: MILESTONE_STATES.FAILED,
            lastUpdated: serverTimestamp(),
            errors: assignmentResults.errors
          });
          
          results.errors.push({
            majorId: major.id,
            majorName: major.name,
            errors: assignmentResults.errors
          });
        }
      } catch (error) {
        // Update milestone state to failed
        await updateDoc(milestoneRef, {
          state: MILESTONE_STATES.FAILED,
          lastUpdated: serverTimestamp(),
          error: error.message
        });

        results.errors.push({
          majorId: major.id,
          majorName: major.name,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error processing passed deadlines:", error);
    throw error;
  }
}

/**
 * Gets the processing status for a specific major
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @returns {Promise<Object>} Status of deadline processing
 */
export async function getDeadlineProcessingStatus(
  schoolId,
  year,
  majorId,
  majorDocId
) {
  try {
    // Get the major document and milestone status
    const [majorRef, milestoneRef] = [
      doc(db, 'schools', schoolId, 'projects', year, majorId, majorDocId),
      getMilestoneRef(schoolId, year, majorId, majorDocId)
    ];
    
    const [majorSnap, milestoneSnap] = await Promise.all([
      getDoc(majorRef),
      getDoc(milestoneRef)
    ]);

    if (!majorSnap.exists()) {
      throw new Error(`Major document not found: ${majorId}`);
    }

    const majorData = majorSnap.data();
    const milestoneData = milestoneSnap.data() || {};

    // Get all projects to check assignment status
    const projectsRef = collection(majorRef, 'projectsPerYear');
    const projectsSnap = await getDocs(projectsRef);
    
    const totalProjects = projectsSnap.size;
    const assignedProjects = projectsSnap.docs.filter(doc => doc.data().isAssigned).length;

    return {
      majorId,
      majorName: majorData.name,
      biddingDeadline: majorData.biddingDeadline,
      hasDeadlinePassed: hasDeadlinePassed(majorData.biddingDeadline),
      totalProjects,
      assignedProjects,
      isFullyProcessed: milestoneData.state === MILESTONE_STATES.COMPLETED,
      processingState: milestoneData.state || MILESTONE_STATES.PENDING,
      lastUpdated: milestoneData.lastUpdated || null,
      processingStarted: milestoneData.processingStarted || null,
      completedAt: milestoneData.completedAt || null,
      errors: milestoneData.errors || [],
      assignmentResults: milestoneData.assignmentResults || null
    };
  } catch (error) {
    console.error("Error getting deadline processing status:", error);
    throw error;
  }
} 