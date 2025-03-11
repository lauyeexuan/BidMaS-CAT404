import { db } from '@/firebase';
import { 
  collection, query, where, getDocs, doc, 
  updateDoc, writeBatch, runTransaction, getDoc,
  collectionGroup
} from 'firebase/firestore';

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
    await runTransaction(db, async (transaction) => {
      console.log(`Starting assignment resolution transaction for ${majorId}`);
      
      // Step 1: Get all projects for this major
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

      // Step 2: Get all accepted bids for all projects
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
      
      // Step 4: For each student, find their highest priority accepted bid
      const projectAssignments = new Map(); // Map projectId -> studentId
      const finalStudentAssignments = {}; // studentId -> projectId
      
      // Sort bids by priority (1 = highest priority, 3 = lowest priority)
      Object.keys(studentBids).forEach(studentId => {
        // Sort bids so that priority 1 comes first (most preferred)
        const sortedBids = studentBids[studentId].sort((a, b) => a.priority - b.priority);
        const topBid = sortedBids[0]; // Get the highest priority bid (lowest number)
        
        if (!projectAssignments.has(topBid.projectId)) {
          // Project not assigned yet, assign to this student
          projectAssignments.set(topBid.projectId, {
            studentId,
            bidId: topBid.id,
            priority: topBid.priority
          });
          
          finalStudentAssignments[studentId] = {
            projectId: topBid.projectId,
            bidId: topBid.id,
            priority: topBid.priority
          };
          
          results.assignmentDetails.push({
            studentId,
            projectId: topBid.projectId,
            priority: topBid.priority,
            status: 'assigned'
          });
        } else {
          results.errors.push({
            studentId,
            projectId: topBid.projectId,
            message: "Project already assigned to another student"
          });
        }
      });
      
      // Step 5: Update projects with final assignments
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
      
      // Step 6: Update all bids to show final status
      for (const bid of allBids) {
        const studentId = bid.studentId;
        const isAssigned = finalStudentAssignments[studentId] && 
                          finalStudentAssignments[studentId].bidId === bid.id;
        
        transaction.update(bid.docRef, {
          finalStatus: isAssigned ? "assigned" : "rejected",
          status: isAssigned ? "assigned" : "rejected"
        });
      }
      
      // Step 7: Update the milestone
      const milestoneRef = doc(
        db, 
        'schools', schoolId,
        'projects', year, 
        majorId, majorDocId,
        'milestones', 'Project Bidding Done'
      );
      
      transaction.update(milestoneRef, {
        completed: true,
        completedDate: new Date()
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