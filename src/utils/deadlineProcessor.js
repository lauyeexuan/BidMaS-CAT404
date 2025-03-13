import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, 
  Timestamp, doc, getDoc, updateDoc,
  runTransaction, serverTimestamp
} from 'firebase/firestore';
import { resolveProjectAssignments } from './assignmentResolver';
import { compileScript } from 'vue/compiler-sfc';
import { testDateManager } from './testDateManager';

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
  const now = testDateManager.getCurrentTime();
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
    console.log("majors:", majors)

    // Check each major listed in the year document
    for (const majorId of majors) {
      // Get all major documents in the majorId subcollection
      const majorDocsRef = collection(db, 'schools', schoolId, 'projects', year, majorId);
      const majorDocsSnap = await getDocs(majorDocsRef);
      console.log("majorId:", majorId)

      for (const majorDoc of majorDocsSnap.docs) {
        console.log("Major document path:", majorDoc.ref.path);
        const majorData = majorDoc.data();
        console.log("majorDoc.id:", majorDoc.id)
        console.log("majorData.name:", majorData.name)

        // Get milestone information directly from the majorData
        const milestones = majorData.milestones || [];
        // Find the "Project Bidding Done" milestone
        const milestoneData = milestones.find(m => m.description === "Project Bidding Done") || {};
        console.log("milestoneData", milestoneData);
        console.log("milestoneData.status", milestoneData.status)

        // Check if milestone needs processing
        if (
          hasDeadlinePassed(milestoneData.deadline) &&
          (!milestoneData.status || 
           milestoneData.status === MILESTONE_STATES.PENDING ||
           (milestoneData.status === MILESTONE_STATES.PROCESSING && 
            Date.now() - (milestoneData.lastUpdated?.seconds * 1000) > 5 * 60 * 1000))
        ) {
          // Check if any unassigned projects with accepted bids exist
          const projectsRef = collection(majorDoc.ref, 'projectsPerYear');
          
          const projectsSnap = await getDocs(projectsRef);
          const unassignedProjects = projectsSnap.docs.filter(
            doc => doc.data().isAssigned !== true
          );

          if (unassignedProjects.length > 0) {
            let hasUnprocessedBids = false;
            for (const projectDoc of unassignedProjects) {
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
                deadline: milestoneData.deadline,
              });
            }
          }
        }
        else {
          //console.log("No milestone found for major:", majorId);
          //console.log("milestone status", milestoneData.status);
          //console.log("milestone deadline", new Date(milestoneData.deadline.seconds * 1000));
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
    console.log("majorsWithPassedDeadlines", majorsWithPassedDeadlines);

    for (const major of majorsWithPassedDeadlines) {
      let milestones;
      let milestoneIndex;
      const majorDocRef = doc(db, 'schools', schoolId, 'projects', year, major.id, major.docId);

      try {
        await runTransaction(db, async (transaction) => {
          const majorDoc = await transaction.get(majorDocRef);
          const majorData = majorDoc.data();
          
          milestones = majorData.milestones || [];
          milestoneIndex = milestones.findIndex(m => m.description === "Project Bidding Done");
          console.log("milestoneIndex:", milestoneIndex);

          if (milestoneIndex === -1) {
            throw new Error('Bidding milestone not found');
          }
        
          milestones[milestoneIndex] = {
            ...milestones[milestoneIndex],
            processing: true,
            lastUpdated: new Date()
          };

          transaction.update(majorDoc.ref, {
            milestones: milestones
          });
          console.log("update milestones array successfully");
        });

        const assignmentResults = await resolveProjectAssignments(
          schoolId,
          year,
          major.id,
          major.docId
        );
        console.log("assignmentResults after resolveProjectAssignments:", assignmentResults);

        results.processedMajors++;

        if (assignmentResults.success) {
          results.successfulAssignments++;
          const now = new Date();
          milestones[milestoneIndex] = {
            ...milestones[milestoneIndex],
            processing: false,
            completed: true,
            lastUpdated: now,
            completedAt: now,
            assignmentResults: {
              assignedStudents: assignmentResults.assignedStudents,
              completedDate: now
            }
          };
        } else {
          milestones[milestoneIndex] = {
            ...milestones[milestoneIndex],
            processing: false,
            failed: true,
            lastUpdated: new Date(),
            errors: assignmentResults.errors
          };
          
          results.errors.push({
            majorId: major.id,
            errors: assignmentResults.errors
          });
        }

        await updateDoc(majorDocRef, {
          milestones: milestones
        });

      } catch (error) {
        if (milestones && milestoneIndex !== undefined && milestoneIndex !== -1) {
          milestones[milestoneIndex] = {
            ...milestones[milestoneIndex],
            processing: false,
            failed: true,
            lastUpdated: new Date(),
            error: error.message
          };

          await updateDoc(majorDocRef, {
            milestones: milestones
          });
        }

        results.errors.push({
          majorId: major.id,
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