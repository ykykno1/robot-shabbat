import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBBDdKj0HUtqOnJnH4zRscwtGAuYhkRBw",
  authDomain: "yk-robot-shabat.firebaseapp.com",
  projectId: "yk-robot-shabat",
  storageBucket: "yk-robot-shabat.firebasestorage.app",
  messagingSenderId: "700126700357",
  appId: "1:700126700357:web:4dd03070bf918c2821942c",
  measurementId: "G-K196PR9DZQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google provider for OAuth
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube');
googleProvider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');

// Facebook provider for OAuth
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('user_posts');
facebookProvider.addScope('pages_show_list');
facebookProvider.addScope('pages_read_engagement');

export default app;