// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, TwitterAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJNMu8JQfG6Z9AHxwLZ5Ksmf4lLrtkN5k",
  authDomain: "raven-dashboard-bbb32.firebaseapp.com",
  projectId: "raven-dashboard-bbb32",
  storageBucket: "raven-dashboard-bbb32.firebasestorage.app",
  messagingSenderId: "530282402751",
  appId: "1:530282402751:web:35c33923a17488d5dac70a",
  measurementId: "G-MN4BG5QKG3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only if in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Twitter Auth Provider
const twitterProvider = new TwitterAuthProvider();

// Initialize Firestore
const db = getFirestore(app);

export { auth, twitterProvider, db, analytics };









