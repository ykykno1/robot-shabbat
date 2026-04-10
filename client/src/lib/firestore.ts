import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

// User profile in Firestore
export interface FirestoreUser {
  uid: string;
  email: string;
  username: string;
  accountTier: 'free' | 'youtube_pro' | 'premium';
  emailVerified: boolean;
  isActive: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  registrationMethod: 'email' | 'google' | 'facebook';
  shabbatCity?: string;
  shabbatCityId?: string;
  hideTimingPreference: 'immediate' | '15min' | '30min' | '1hour';
  restoreTimingPreference: 'immediate' | '30min' | '1hour' | '2hours';
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

// Auth tokens in Firestore
export interface FirestoreAuthToken {
  id: string;
  userId: string;
  platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType: string;
  createdAt: Date;
  updatedAt: Date;
}

// User operations
export const firestoreOperations = {
  // Create user profile
  async createUser(user: FirestoreUser): Promise<void> {
    await setDoc(doc(db, 'users', user.uid), user);
  },

  // Get user profile
  async getUser(uid: string): Promise<FirestoreUser | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as FirestoreUser : null;
  },

  // Update user profile
  async updateUser(uid: string, updates: Partial<FirestoreUser>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete user profile
  async deleteUser(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid));
  },

  // Auth token operations
  async saveAuthToken(token: FirestoreAuthToken): Promise<void> {
    await setDoc(doc(db, 'auth_tokens', token.id), token);
  },

  async getAuthToken(userId: string, platform: string): Promise<FirestoreAuthToken | null> {
    const q = query(
      collection(db, 'auth_tokens'),
      where('userId', '==', userId),
      where('platform', '==', platform)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data() as FirestoreAuthToken;
  },

  async deleteAuthToken(userId: string, platform: string): Promise<void> {
    const q = query(
      collection(db, 'auth_tokens'),
      where('userId', '==', userId),
      where('platform', '==', platform)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  },

  // Get all auth tokens for user
  async getUserAuthTokens(userId: string): Promise<FirestoreAuthToken[]> {
    const q = query(
      collection(db, 'auth_tokens'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FirestoreAuthToken);
  }
};