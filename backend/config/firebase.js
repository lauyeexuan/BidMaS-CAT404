const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
    apiKey: "AIzaSyDnX71Q3Xidha9TO0NZ_hCDANnwxB7wbLE",
    authDomain: "cat404-bidmas.firebaseapp.com",
    projectId: "cat404-bidmas",
    storageBucket: "cat404-bidmas.firebasestorage.app",
    messagingSenderId: "984259946388",
    appId: "1:984259946388:web:31f745b73983e7576f5181",
    measurementId: "G-5JCT3N0F9R"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports = { storage }; 