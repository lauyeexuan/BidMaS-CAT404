# Firestore Database Structure

This document outlines the structure of the Firestore database used in the BidMaS (Bidding Management System) application.

## Collections and Documents
Each school has its own document in the “schools” collection. Inside each school document, there’s a “users” subcollection for storing all user records, and a “projects” subcollection that holds documents indexed by academic year. Within each year document, you keep a “majors” subcollection, which further separates projects by major. Finally, each major has a “projectsPerYear” subcollection containing individual project documents.

Below is a restatement of your current Firestore hierarchy:

schools (collection)
 └─ {schoolId} (document)
     └─ users (subcollection)
         └─ {userId} (document)
     └─ projects (subcollection)
         └─ {year} (document)
             └─ majors (subcollection)
                 └─ {majorId} (document)
                     └─ projectsPerYear (subcollection)
                         └─ {projectId} (document)
                             ├─ title: string
                             ├─ description: string
                             ├─ userId: string (owner/lecturer that create it)


### Schools Collection
Describe the schools collection structure here...

### Users Collection
Describe the users collection structure here...

### Projects Collection
Describe the projects collection structure here...

### Academic Years
Describe how academic years are structured...

### Majors
Describe how majors are organized...

### Bids
Describe how bids are structured...

## Relationships and References
Describe how different collections are related to each other...

## Access Patterns
Document common access patterns and queries...

## Security Rules
Document important security rules and access controls...

## Notes
- Add any additional notes or considerations
- Document any specific constraints or limitations
- Add examples of important queries or operations 