import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

// Replace the placeholder values with your own from the config snippet
const firebaseConfig = {
    apiKey: "AIzaSyDnX71Q3Xidha9TO0NZ_hCDANnwxB7wbLE",
    authDomain: "cat404-bidmas.firebaseapp.com",
    projectId: "cat404-bidmas",
    storageBucket: "cat404-bidmas.firebasestorage.app",
    messagingSenderId: "984259946388",
    appId: "1:984259946388:web:31f745b73983e7576f5181",
    measurementId: "G-5JCT3N0F9R"
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialize the Vertex AI service
const vertexAI = getVertexAI(firebaseApp);

// Initialize the generative model with a model that supports your use case
const model = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });

// Initialize Firestore
const db = getFirestore(firebaseApp)

// Auth
const auth = getAuth(firebaseApp)

// Initialize Storage
const storage = getStorage(firebaseApp)

// Export the Firestore instance to use it elsewhere
export { db, auth, storage }
