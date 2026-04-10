import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // For development, we'll use the client credentials
  // In production, you should use a service account
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'yk-robot-shabat',
    // For production, add service account credentials here
  });
}

export { admin };