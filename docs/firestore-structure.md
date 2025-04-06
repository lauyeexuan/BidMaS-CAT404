# Firestore Database Structure

This document outlines the structure of the Firestore database used in the BidMaS (Bidding Management System) application.

## Collections and Documents
Each school has its own document in the "schools" collection. Inside each school document, there are several subcollections for organizing users, projects, and bids.

Below is the current Firestore hierarchy:

schools (collection)
└─ {schoolId} (document)
├─ users (subcollection)
│ └─ {userId} (document)
│ ├─ name: string
│ ├─ email: string
│ ├─ role: string ('student', 'lecturer', 'admin')
│ ├─ major: string
│ ├─ school: string (reference to school ID)
│ ├─ specifications: array (for lecturers)
│ ├─ skills: array (for students)
│ ├─ cgpa: number (for students)
│ ├─ introduction: string (for students)
│ └─ profilePicture: string (path to storage)
│
├─ projects (subcollection)
│ └─ {year} (document)
│ ├─ majors: array (list of available majors)
│ │
│ └─ {majorId} (subcollection)
│ └─ {majorDocId} (document)
│ ├─ milestones: array [
│ │ {
│ │ deadline: timestamp,
│ │ description: string
│ │ }
│ │ ]
│ └─ projectsPerYear (subcollection)
│ └─ {projectId} (document)
│ ├─ Title: string
│ ├─ tentativeStudentIds: array
│ ├─ userId: string (owner/lecturer)
│ ├─ major: string
│ ├─ isAssigned: boolean
│ ├─ assignedTo: string
│ ├─ assignedAt: timestamp
│ ├─ examinerAssignedAt: timestamp
│ ├─ examinerId: string
│ ├─ examinerName: string
│ ├─ bids (subcollection)
│ │ └─ {bidId} (document)
│ │ ├─ studentId: string
│ │ ├─ status: string
│ │ ├─ priority: number
│ │ ├─ createdAt: timestamp
│ │ └─ lecturerAccepted: boolean
│ │
│ └─ submissions (subcollection)
│ └─ {submissionId} (document)
│ ├─ fileName: string
│ ├─ filePath: string
│ ├─ downloadUrl: string
│ ├─ milestoneIndex: number
│ ├─ milestoneDescription: string
│ ├─ submittedAt: timestamp
│ └─ submittedBy: string
│
├─ submissions (subcollection - flattened structure)
│ └─ {submissionId} (document)
│ ├─ fileName: string
│ ├─ filePath: string
│ ├─ downloadUrl: string
│ ├─ milestoneIndex: number
│ ├─ milestoneDescription: string
│ ├─ submittedAt: timestamp
│ ├─ submittedBy: string
│ ├─ yearId: string
│ ├─ majorId: string
│ ├─ lecturerId: string
│ ├─ projectId: string
│ ├─ projectTitle: string
│ └─ migratedAt: timestamp
│
├─ feedback (subcollection)
│ └─ {feedbackId} (document)
│ ├─ submissionId: string
│ ├─ lecturerId: string
│ ├─ comment: string
│ ├─ advice: string (optional)
│ ├─ rating: number
│ ├─ attachmentUrl: string (optional)
│ ├─ attachmentName: string (optional)
│ ├─ attachmentSize: number (optional)
│ ├─ isDraft: boolean
│ └─ createdAt: timestamp
│
└─ studentBids (subcollection)
└─ {studentId} (document)
└─ bids (subcollection)
└─ {bidId} (document)
├─ projectId: string
├─ majorId: string
├─ majorDocId: string
├─ year: string
├─ status: string
├─ priority: number
├─ createdAt: timestamp
└─ updatedAt: timestamp

### Schools Collection
The root collection that contains all school-specific data. Each school is represented by a document with a unique ID.

### Users Collection
A subcollection under each school document that stores user information:
- **name**: User's display name
- **email**: User's email address
- **role**: User's role in the system (student, lecturer, admin)
- **major**: The academic major the user belongs to (especially important for students)
- **school**: Reference to the school the user belongs to

### Projects Collection
A subcollection under each school document that organizes projects by academic year:
- Each **{year}** document contains:
  - **majors**: An array of available majors for that academic year
  - A subcollection for each major containing project documents

### Project Structure
Projects are organized hierarchically:
- **{majorId}**: The major subcollection (e.g., "Computer Science", "Electrical Engineering")
  - **{majorDocId}**: A document ID for the major (typically auto-generated)
    - **projectsPerYear**: A subcollection containing individual project documents
      - **{projectId}**: Individual project document with details and bids

### Bids
Bids are stored in two places to enable efficient querying:

1. **Under each project**:
   - Each project has a **bids** subcollection
   - Each bid document contains the student ID, status, priority, and timestamps

2. **Under each student**:
   - The **studentBids** subcollection organizes bids by student
   - Each student has their own document containing a **bids** subcollection
   - Each bid document contains project references, status, priority, and timestamps

## Bid Priority System
The bidding system allows students to place up to 3 bids with priority rankings:
- **priority**: A number (1, 2, 3) indicating the student's preference order
- When a student places bids, they are automatically assigned priorities based on the order of bidding
- If a bid is canceled, the priorities of remaining bids are automatically adjusted
- The priority is stored in both the project's bid record and the student's bid record

## Bid Status Tracking
Bids can have one of three statuses:
- **pending**: Initial state when a bid is placed
- **accepted**: When a lecturer/admin accepts the bid
- **rejected**: When a lecturer/admin rejects the bid

## Access Patterns
Common access patterns supported by this structure:
- Fetching all projects for a specific major in a given academic year
- Retrieving all bids placed by a specific student
- Listing all bids received for a specific project
- Tracking the priority order of a student's bids

## Security Rules
Important security considerations:
- Students should only be able to view and bid on projects in their major
- Students should only be able to place up to 3 bids
- Students should only be able to view and manage their own bids
- Lecturers should only be able to view and manage projects they created
- Admins should have access to all projects and bids

## Notes
- The dual storage of bid information (in both project and student collections) enables quick access from either perspective while maintaining data consistency
- The majorDocId field is stored in the student's bid record to help with lookups between the major document and its projects
- Timestamps are used to track when bids are created and updated

### Submissions Collections
Submissions are stored in two locations for different query optimization purposes:

1. **Project-level Submissions** (Nested Structure)
   - Location: `schools/{schoolId}/projects/{year}/{majorId}/{majorDocId}/projectsPerYear/{projectId}/submissions/{submissionId}`
   - Fields:
     - **fileName**: string - Original name of the uploaded file
     - **filePath**: string - Storage path where the file is saved
     - **downloadUrl**: string - Direct URL to download the file
     - **milestoneIndex**: number - Index of the milestone this submission is for
     - **milestoneDescription**: string - Description of the milestone
     - **submittedAt**: timestamp - When the submission was made
     - **submittedBy**: string - Student ID who made the submission

2. **School-level Submissions** (Flattened Structure)
   - Location: `schools/{schoolId}/submissions/{submissionId}`
   - Purpose: Optimized for querying submissions across projects
   - Fields:
     - **fileName**: string - Original name of the uploaded file
     - **filePath**: string - Storage path where the file is saved
     - **downloadUrl**: string - Direct URL to download the file
     - **milestoneIndex**: number - Index of the milestone this submission is for
     - **milestoneDescription**: string - Description of the milestone
     - **submittedAt**: timestamp - When the submission was made
     - **submittedBy**: string - Student ID who made the submission
     - **yearId**: string - Academic year ID
     - **majorId**: string - Major ID
     - **lecturerId**: string - ID of the lecturer supervising the project
     - **projectId**: string - ID of the project
     - **projectTitle**: string - Title of the project
     - **migratedAt**: timestamp - When the submission was copied to flattened structure

### Feedback Collection
- Location: `schools/{schoolId}/feedback/{feedbackId}`
- Purpose: Store lecturer feedback on student submissions
- Fields:
  - **submissionId**: string - Reference to the submission this feedback is for
  - **lecturerId**: string - ID of the lecturer providing feedback
  - **comment**: string - Main feedback text (supports rich text formatting)
  - **advice**: string (optional) - Additional advice or suggestions
  - **rating**: number - Numerical rating of the submission
  - **attachmentUrl**: string (optional) - URL to any attached feedback file
  - **attachmentName**: string (optional) - Name of the attachment file
  - **attachmentSize**: number (optional) - Size of the attachment in bytes
  - **isDraft**: boolean - Whether this feedback is a draft or finalized
  - **createdAt**: timestamp - When the feedback was created

### Usage Notes
1. **Submission Storage Strategy**:
   - The nested structure (under projects) maintains data hierarchy and relationships
   - The flattened structure enables efficient querying for:
     - All submissions by a student
     - All submissions for a lecturer to review
     - Submissions by milestone or date range

2. **Feedback Features**:
   - Supports draft mode for lecturers to save feedback before finalizing
   - Includes both structured (rating) and unstructured (comment) feedback
   - Allows file attachments for detailed feedback documents
   - Links directly to submissions via submissionId

3. **Security Considerations**:
   - Students should only access their own submissions
   - Lecturers should only access submissions and provide feedback for their assigned projects
   - Draft feedback should only be visible to the authoring lecturer 