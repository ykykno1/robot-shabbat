// Firebase Admin SDK Service Account Configuration
// This file contains the structure for Firebase Admin service account
// The actual credentials should be stored as environment variables

export const getServiceAccountConfig = () => {
  // Check if we have individual environment variables
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // Fallback to parsed service account JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      };
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', error);
    }
  }

  // Development mode - no real credentials needed
  console.warn('⚠️  Firebase Admin SDK running in development mode - no credentials configured');
  return null;
}