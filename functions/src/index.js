const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getMajorsWithPassedDeadlines, processPassedDeadlines } = require('../../src/utils/deadlineProcessor');

admin.initializeApp();

