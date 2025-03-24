Adding Real-Time Notifications for Project Setting Changes - Implementation Steps
Step 1: Create Firestore Notifications Collection
Summary: Create a dedicated collection in Firestore to store notification data when admins update project settings.

Step 2: Create NotificationBadge.vue Component
Summary: Build a reusable component that displays an unread notification count badge and listens to real-time updates from Firestore.

Step 3: Create NotificationsPanel.vue Component
Summary: Implement a dropdown panel that shows notification details, allows marking as read, and displays timestamps.

Step 4: Update ProjectSettings.vue
Summary: Add functions to create notifications whenever project settings are modified and determine affected users.

Step 5: Add Notification UI to Navigation Bar
Summary: Incorporate notification badge and panel components into the site navigation layout.

Step 6: Implement Email Notification
Summary: Use a free email service (SendGrid, Nodemailer, or EmailJS) to send notification emails to affected users.

Step 7: Testing
Summary: Test the notification system by making project setting changes and verifying real-time updates and emails.