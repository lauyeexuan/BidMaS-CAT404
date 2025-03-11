const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getMajorsWithPassedDeadlines, processPassedDeadlines } = require('../../src/utils/deadlineProcessor');

admin.initializeApp();

// Scheduled function that runs every hour to check and process deadlines
exports.processDeadlinesScheduled = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    try {
      const result = await processPassedDeadlines(
        // You might want to process for all schools or specific ones
        process.env.DEFAULT_SCHOOL_ID,  // Configure this in your environment
        new Date().getFullYear().toString()
      );
      
      console.log('Scheduled processing completed:', result);
      return result;
    } catch (error) {
      console.error('Error in scheduled deadline processing:', error);
      throw error;
    }
  });

// HTTP function to manually trigger deadline processing
exports.processDeadlineManually = functions.https.onCall(
  async (data, context) => {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Check user role (using your existing Firestore structure)
    const userDoc = await admin.firestore()
      .collection('schools')
      .doc(data.schoolId)
      .collection('users')
      .doc(context.auth.uid)
      .get();

    const userData = userDoc.data();
    if (!userData || userData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User must be an admin'
      );
    }

    // Validate required parameters
    const { schoolId, year } = data;
    if (!schoolId || !year) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters'
      );
    }

    try {
      const result = await processPassedDeadlines(schoolId, year);
      return result;
    } catch (error) {
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
); 