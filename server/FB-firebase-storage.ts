import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { FBUser, FBPlatformToken, FBHistoryEntry, FBSettings } from '../shared-firebase/types';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

import { getServiceAccountConfig } from './FB-firebase-admin-config';

// Initialize Firebase Admin
let isFirebaseInitialized = false;

if (!getApps().length) {
  const config = getServiceAccountConfig();
  if (config) {
    try {
      initializeApp({
        credential: cert(config)
      });
      isFirebaseInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
    }
  } else {
    console.log('Firebase Admin SDK not initialized - running in development mode');
  }
}

const db = isFirebaseInitialized ? getFirestore() : null as any;
const auth = isFirebaseInitialized ? getAuth() : null as any;

// Collections
const USERS_COLLECTION = 'fb_users';
const TOKENS_COLLECTION = 'fb_platform_tokens';
const HISTORY_COLLECTION = 'fb_history';
const SETTINGS_COLLECTION = 'fb_settings';
const VIDEO_LOCKS_COLLECTION = 'fb_video_locks';
const VIDEO_STATUS_COLLECTION = 'fb_video_status';

export class FBFirebaseStorage {
  // Check if Firebase is initialized
  private checkFirebase() {
    if (!isFirebaseInitialized || !db) {
      console.warn('Firebase Admin SDK not initialized - using mock data');
      return false;
    }
    return true;
  }
  // User Management
  async createUser(data: {
    email: string;
    username: string;
    password?: string;
    firebaseUid?: string;
  }): Promise<FBUser> {
    if (!this.checkFirebase()) {
      // Return mock user for development
      const userId = nanoid();
      const now = new Date();
      return {
        id: userId,
        email: data.email,
        username: data.username,
        firebaseUid: data.firebaseUid,
        accountTier: 'free',
        hideTimingPreference: '15min',
        restoreTimingPreference: '30min',
        createdAt: now,
        updatedAt: now,
      };
    }
    const userId = nanoid();
    const now = new Date();
    
    const userData: FBUser = {
      id: userId,
      email: data.email,
      username: data.username,
      firebaseUid: data.firebaseUid,
      accountTier: 'free',
      hideTimingPreference: '15min',
      restoreTimingPreference: '30min',
      createdAt: now,
      updatedAt: now,
    };

    // Hash password if provided
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      await db.collection('fb_user_passwords').doc(userId).set({
        passwordHash,
        createdAt: Timestamp.now()
      });
    }

    await db.collection(USERS_COLLECTION).doc(userId).set({
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return userData;
  }

  async getUserById(userId: string): Promise<FBUser | null> {
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
    if (!userDoc.exists) return null;
    
    const data = userDoc.data();
    if (!data) return null;
    
    return {
      ...data,
      id: userDoc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as FBUser;
  }

  async getUserByEmail(email: string): Promise<FBUser | null> {
    const snapshot = await db.collection(USERS_COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as FBUser;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<FBUser | null> {
    const snapshot = await db.collection(USERS_COLLECTION)
      .where('firebaseUid', '==', firebaseUid)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as FBUser;
  }

  async updateUser(userId: string, updates: Partial<FBUser>): Promise<boolean> {
    try {
      await db.collection(USERS_COLLECTION).doc(userId).update({
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async validateUserPassword(userId: string, password: string): Promise<boolean> {
    const passwordDoc = await getDoc(doc(db, 'fb_user_passwords', userId));
    if (!passwordDoc.exists()) return false;
    
    const { passwordHash } = passwordDoc.data();
    return bcrypt.compare(password, passwordHash);
  }

  // Platform Token Management
  async savePlatformToken(data: {
    userId: string;
    platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok';
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes?: string[];
    metadata?: Record<string, any>;
  }): Promise<void> {
    const tokenId = `${data.userId}_${data.platform}`;
    
    await setDoc(doc(db, TOKENS_COLLECTION, tokenId), {
      ...data,
      expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  async getPlatformToken(userId: string, platform: string): Promise<FBPlatformToken | null> {
    const tokenId = `${userId}_${platform}`;
    const tokenDoc = await getDoc(doc(db, TOKENS_COLLECTION, tokenId));
    
    if (!tokenDoc.exists()) return null;
    
    const data = tokenDoc.data();
    return {
      ...data,
      id: tokenDoc.id,
      expiresAt: data.expiresAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as FBPlatformToken;
  }

  async removePlatformToken(userId: string, platform: string): Promise<void> {
    const tokenId = `${userId}_${platform}`;
    await deleteDoc(doc(db, TOKENS_COLLECTION, tokenId));
  }

  async getUserPlatformConnections(userId: string): Promise<Record<string, boolean>> {
    const platforms = ['youtube', 'facebook', 'instagram', 'tiktok'];
    const connections: Record<string, boolean> = {};
    
    for (const platform of platforms) {
      const token = await this.getPlatformToken(userId, platform);
      connections[platform] = !!token;
    }
    
    return connections;
  }

  // History Management
  async addHistoryEntry(data: {
    userId: string;
    action: 'hide' | 'restore' | 'auth' | 'schedule';
    platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'all';
    itemCount: number;
    success: boolean;
    error?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const historyId = nanoid();
    
    await setDoc(doc(db, HISTORY_COLLECTION, historyId), {
      ...data,
      id: historyId,
      createdAt: serverTimestamp()
    });
  }

  async getUserHistory(userId: string, limit: number = 50): Promise<FBHistoryEntry[]> {
    const q = query(
      collection(db, HISTORY_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      ...(limit ? [limit] : [])
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as FBHistoryEntry;
    });
  }

  // Video Lock Management
  async setVideoLockStatus(userId: string, videoId: string, locked: boolean): Promise<void> {
    const lockId = `${userId}_${videoId}`;
    
    await setDoc(doc(db, VIDEO_LOCKS_COLLECTION, lockId), {
      userId,
      videoId,
      locked,
      updatedAt: serverTimestamp()
    });
  }

  async getVideoLockStatus(userId: string, videoId: string): Promise<boolean> {
    const lockId = `${userId}_${videoId}`;
    const lockDoc = await getDoc(doc(db, VIDEO_LOCKS_COLLECTION, lockId));
    
    if (!lockDoc.exists()) return false;
    
    return lockDoc.data().locked || false;
  }

  async getUserVideoLocks(userId: string): Promise<Record<string, boolean>> {
    const q = query(collection(db, VIDEO_LOCKS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const locks: Record<string, boolean> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      locks[data.videoId] = data.locked;
    });
    
    return locks;
  }

  // Video Status Management  
  async saveVideoOriginalStatus(userId: string, videoId: string, originalStatus: string): Promise<void> {
    const statusId = `${userId}_${videoId}`;
    
    await setDoc(doc(db, VIDEO_STATUS_COLLECTION, statusId), {
      userId,
      videoId,
      originalStatus,
      savedAt: serverTimestamp()
    });
  }

  async getVideoOriginalStatus(userId: string, videoId: string): Promise<string | null> {
    const statusId = `${userId}_${videoId}`;
    const statusDoc = await getDoc(doc(db, VIDEO_STATUS_COLLECTION, statusId));
    
    if (!statusDoc.exists()) return null;
    
    return statusDoc.data().originalStatus || null;
  }

  // Settings Management
  async getUserSettings(userId: string): Promise<FBSettings> {
    const settingsDoc = await getDoc(doc(db, SETTINGS_COLLECTION, userId));
    
    if (!settingsDoc.exists()) {
      // Return default settings
      return {
        autoSchedule: true,
        enabledPlatforms: ['youtube', 'facebook'],
        timeZone: 'Asia/Jerusalem',
        excludedContentIds: {}
      };
    }
    
    return settingsDoc.data() as FBSettings;
  }

  async updateUserSettings(userId: string, settings: Partial<FBSettings>): Promise<void> {
    await setDoc(doc(db, SETTINGS_COLLECTION, userId), {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // Premium User Management
  async getAllPremiumUsers(): Promise<FBUser[]> {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('accountTier', 'in', ['premium', 'youtube_pro'])
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as FBUser;
    });
  }

  // Firebase Auth Integration
  async verifyFirebaseToken(token: string): Promise<{ uid: string; email?: string } | null> {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return null;
    }
  }
}