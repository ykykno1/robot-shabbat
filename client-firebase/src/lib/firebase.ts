import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Robot Shabbat 2
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDBBDdKj0HUtqOnJnH4zRscwtGAuYhkRBw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yk-robot-shabat.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yk-robot-shabat",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yk-robot-shabat.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "700126700357",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:700126700357:web:4dd03070bf918c2821942c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K196PR9DZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Configure Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube');
googleProvider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');

// Configure Facebook provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('user_posts');
facebookProvider.addScope('pages_show_list');
facebookProvider.addScope('pages_read_engagement');

export default app;