import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, doc, 
  updateDoc, writeBatch, runTransaction, getDoc,
  collectionGroup, arrayRemove, arrayUnion
} from 'firebase/firestore';
import { auth } from '@/firebase';

/**
 * Resolves project assignments after bidding deadline has passed.
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @returns {Promise<Object>} - Results of the resolution process
 */
export async function resolveProjectAssignments(
  schoolId,
  year,
  majorId, 
  majorDocId
) {
  const results = {
    success: false,
    assignedStudents: 0,
    errors: [],
    assignmentDetails: []
  };

  try {
    
    console.log('Parameters:', {
      schoolId,
      year,
      majorId,
      majorDocId
    });
    await runTransaction(db, async (transaction) => {
      console.log(`Starting assignment resolution transaction for ${majorId}`);
      console.log('Full path:', `schools/${schoolId}/projects/${year}/${majorId}/${majorDocId}/projectsPerYear`);
      
      // READS SECTION - Gather all data first
      // 1. Read projects
      const projectsRef = collection(
        db, 
        'schools', schoolId,
        'projects', year,
        majorId, majorDocId,
        'projectsPerYear'
      );
      
      const projectsSnap = await getDocs(projectsRef);
      const projects = [];
      projectsSnap.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data(),
          docRef: doc.ref
        });
      });

      // 2. Read all accepted bids
      const allBids = [];
      const studentBids = {};

      // Iterate through each project to get its bids
      for (const project of projects) {
        const projectBidsRef = collection(project.docRef, 'bids');
        const acceptedBidsQuery = query(projectBidsRef, where("status", "==", "accepted"));
        const acceptedBidsSnap = await getDocs(acceptedBidsQuery);
        
        acceptedBidsSnap.forEach(bidDoc => {
          const bid = { 
            id: bidDoc.id, 
            ...bidDoc.data(), 
            docRef: bidDoc.ref,
            projectId: project.id 
          };
          
          // Validate that this bid's student is in the project's tentativeStudentIds
          if (project.tentativeStudentIds?.includes(bid.studentId)) {
            allBids.push(bid);
            
            if (!studentBids[bid.studentId]) {
              studentBids[bid.studentId] = [];
            }
            studentBids[bid.studentId].push(bid);
          }
        });
      }
      
      // 3. Read milestone data
      const majorDocRef = doc(
        db, 
        'schools', schoolId,
        'projects', year, 
        majorId, majorDocId
      );
      
      // First get the current milestone data
      const majorDoc = await transaction.get(majorDocRef);
      const milestones = majorDoc.data().milestones;
      const targetMilestone = milestones.find(m => m.description === 'Project Bidding Done');

      // PROCESS SECTION - Do all computations
      // 4. Sort students and determine assignments
      const sortedStudentIds = Object.keys(studentBids).sort((studentA, studentB) => {
        const studentABids = studentBids[studentA];
        const studentAEarliestTime = studentABids.reduce((earliest, bid) => {
          const bidTime = bid.createdAt.toMillis();
          return bidTime < earliest ? bidTime : earliest;
        }, studentABids[0].createdAt.toMillis());

        const studentBBids = studentBids[studentB];
        const studentBEarliestTime = studentBBids.reduce((earliest, bid) => {
          const bidTime = bid.createdAt.toMillis();
          return bidTime < earliest ? bidTime : earliest;
        }, studentBBids[0].createdAt.toMillis());

        return studentAEarliestTime - studentBEarliestTime;
      });

      const projectAssignments = new Map();
      const finalStudentAssignments = {};

      sortedStudentIds.forEach(studentId => {
        const sortedBids = studentBids[studentId].sort((a, b) => a.priority - b.priority);
        
        // Try each bid in priority order until one succeeds
        let assigned = false;
        for (const bid of sortedBids) {
          if (!projectAssignments.has(bid.projectId)) {
            projectAssignments.set(bid.projectId, {
              studentId,
              bidId: bid.id,
              priority: bid.priority
            });
            
            finalStudentAssignments[studentId] = {
              projectId: bid.projectId,
              bidId: bid.id,
              priority: bid.priority
            };
            
            results.assignmentDetails.push({
              studentId,
              projectId: bid.projectId,
              priority: bid.priority,
              status: 'assigned'
            });
            
            assigned = true;
            break;
          }
        }
        
        if (!assigned) {
          results.errors.push({
            studentId,
            message: "Could not assign any of student's project choices"
          });
        }
      });
      
      // WRITES SECTION - Do all updates
      // 5. Update projects
      for (const [projectId, assignment] of projectAssignments.entries()) {
        const projectDoc = projects.find(p => p.id === projectId);
        if (!projectDoc) continue;
        
        transaction.update(projectDoc.docRef, {
          isAssigned: true,
          assignedTo: assignment.studentId,
          assignmentDate: new Date(),
          tentativeStudentIds: [], // Clear tentative assignments
          status: 'assigned'
        });
      }
      
      // 6. Update all bids to show final status
      for (const bid of allBids) {
        const studentId = bid.studentId;
        const isAssigned = finalStudentAssignments[studentId] && 
                          finalStudentAssignments[studentId].bidId === bid.id;
        
        // Update bid in project's bids collection
        transaction.update(bid.docRef, {
          finalStatus: isAssigned ? "accepted" : "rejected",
          status: isAssigned ? "accepted" : "rejected"
        });
        
        // NEW: Update bid in student's bids collection
        const studentBidRef = doc(
          db,
          'schools', schoolId,
          'studentBids', studentId,
          'bids', bid.id
        );
        
        transaction.update(studentBidRef, {
          status: isAssigned ? "accepted" : "rejected",
        });
      }
      
      // 7. Update the milestone
      transaction.update(majorDocRef, {
        milestones: arrayRemove({
          deadline: targetMilestone.deadline,
          description: 'Project Bidding Done',
          required: targetMilestone.required
        })
      });

      transaction.update(majorDocRef, {
        milestones: arrayUnion({
          deadline: targetMilestone.deadline,
          description: 'Project Bidding Done',
          required: targetMilestone.required,
          completed: true,
          completedDate: new Date()
        })
      });
      
      results.assignedStudents = Object.keys(finalStudentAssignments).length;
    });
    
    results.success = true;
    return results;
  } catch (error) {
    console.error("Error resolving project assignments:", error);
    results.errors.push({
      message: error.message,
      code: error.code
    });
    return results;
  }
}

/**
 * Gets the assignment results for reporting
 * @param {string} schoolId - The school ID
 * @param {string} year - The academic year
 * @param {string} majorId - The major ID
 * @param {string} majorDocId - The major document ID
 * @returns {Promise<Array>} - Array of assignment results
 */
export async function getAssignmentResults(
  schoolId,
  year,
  majorId,
  majorDocId
) {
  try {
    const projectsRef = collection(
      db, 
      'schools', schoolId,
      'projects', year,
      majorId, majorDocId,
      'projectsPerYear'
    );
    
    const assignedProjectsQuery = query(projectsRef, where("isAssigned", "==", true));
    const assignedProjectsSnap = await getDocs(assignedProjectsQuery);
    
    const assignmentResults = [];
    
    for (const projectDoc of assignedProjectsSnap.docs) {
      const project = projectDoc.data();
      
      assignmentResults.push({
        projectId: projectDoc.id,
        projectTitle: project.Title,
        studentId: project.assignedTo,
        assignmentDate: project.assignmentDate?.toDate() || null,
        status: project.status
      });
    }
    
    return assignmentResults;
  } catch (error) {
    console.error("Error getting assignment results:", error);
    throw error;
  }
} 