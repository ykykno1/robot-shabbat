import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, update, remove, push, onValue, off, DataSnapshot } from 'firebase/database';
import { 
  FirebaseUser, 
  PlatformToken, 
  VideoStatus, 
  HistoryEntry,
  ShabbatLocation,
  AdminPayment,
  FIREBASE_PATHS 
} from './firebase-schema';

// Firebase configuration
// This file should only be imported from client-side code
const firebaseConfig = {
  apiKey: 'AIzaSyDBBDdKj0HUtqOnJnH4zRscwtGAuYhkRBw',
  authDomain: 'yk-robot-shabat.firebaseapp.com',
  projectId: 'yk-robot-shabat',
  storageBucket: 'yk-robot-shabat.firebasestorage.app',
  appId: '1:169491902267:web:5a5e6c6e5a5e6c6e5a5e6c',
  databaseURL: 'https://yk-robot-shabat-default-rtdb.firebaseio.com',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// User operations
export const firebaseDb = {
  // User CRUD operations
  async createUser(user: Omit<FirebaseUser, 'createdAt' | 'updatedAt'>): Promise<FirebaseUser> {
    const timestamp = Date.now();
    const newUser: FirebaseUser = {
      ...user,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await set(ref(database, `${FIREBASE_PATHS.users}/${user.uid}`), newUser);
    return newUser;
  },

  async getUser(uid: string): Promise<FirebaseUser | null> {
    const snapshot = await get(ref(database, `${FIREBASE_PATHS.users}/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  async updateUser(uid: string, updates: Partial<FirebaseUser>): Promise<void> {
    await update(ref(database, `${FIREBASE_PATHS.users}/${uid}`), {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async deleteUser(uid: string): Promise<void> {
    await remove(ref(database, `${FIREBASE_PATHS.users}/${uid}`));
    // Also delete related data
    await remove(ref(database, FIREBASE_PATHS.userTokens(uid)));
    await remove(ref(database, FIREBASE_PATHS.userVideos(uid)));
    await remove(ref(database, FIREBASE_PATHS.userHistory(uid)));
  },

  // Platform token operations
  async savePlatformToken(userId: string, token: Omit<PlatformToken, 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const timestamp = Date.now();
    const tokenData: PlatformToken = {
      ...token,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await set(
      ref(database, `${FIREBASE_PATHS.userTokens(userId)}/${token.platform}`), 
      tokenData
    );
  },

  async getPlatformToken(userId: string, platform: string): Promise<PlatformToken | null> {
    const snapshot = await get(
      ref(database, `${FIREBASE_PATHS.userTokens(userId)}/${platform}`)
    );
    return snapshot.exists() ? snapshot.val() : null;
  },

  async getAllUserTokens(userId: string): Promise<PlatformToken[]> {
    const snapshot = await get(ref(database, FIREBASE_PATHS.userTokens(userId)));
    if (!snapshot.exists()) return [];
    
    const tokens = snapshot.val();
    return Object.values(tokens);
  },

  async removePlatformToken(userId: string, platform: string): Promise<void> {
    await remove(ref(database, `${FIREBASE_PATHS.userTokens(userId)}/${platform}`));
  },

  // Video status operations
  async saveVideoStatus(userId: string, videoStatus: Omit<VideoStatus, 'userId' | 'lastModified'>): Promise<void> {
    const statusData: VideoStatus = {
      ...videoStatus,
      userId,
      lastModified: Date.now(),
    };
    
    await set(
      ref(database, `${FIREBASE_PATHS.userVideos(userId)}/${videoStatus.platform}/${videoStatus.videoId}`),
      statusData
    );
  },

  async getVideoStatus(userId: string, platform: string, videoId: string): Promise<VideoStatus | null> {
    const snapshot = await get(
      ref(database, `${FIREBASE_PATHS.userVideos(userId)}/${platform}/${videoId}`)
    );
    return snapshot.exists() ? snapshot.val() : null;
  },

  async getAllUserVideos(userId: string, platform?: string): Promise<VideoStatus[]> {
    let snapshot: DataSnapshot;
    
    if (platform) {
      snapshot = await get(ref(database, `${FIREBASE_PATHS.userVideos(userId)}/${platform}`));
    } else {
      snapshot = await get(ref(database, FIREBASE_PATHS.userVideos(userId)));
    }
    
    if (!snapshot.exists()) return [];
    
    const videos: VideoStatus[] = [];
    const data = snapshot.val();
    
    if (platform) {
      // Single platform
      Object.values(data).forEach(video => videos.push(video as VideoStatus));
    } else {
      // All platforms
      Object.values(data).forEach(platformData => {
        Object.values(platformData as any).forEach(video => videos.push(video as VideoStatus));
      });
    }
    
    return videos;
  },

  // History operations
  async addHistoryEntry(userId: string, entry: Omit<HistoryEntry, 'id' | 'userId' | 'timestamp'>): Promise<string> {
    const historyRef = push(ref(database, FIREBASE_PATHS.userHistory(userId)));
    const historyData: HistoryEntry = {
      ...entry,
      id: historyRef.key!,
      userId,
      timestamp: Date.now(),
    };
    
    await set(historyRef, historyData);
    return historyRef.key!;
  },

  async getUserHistory(userId: string, limit?: number): Promise<HistoryEntry[]> {
    const snapshot = await get(ref(database, FIREBASE_PATHS.userHistory(userId)));
    if (!snapshot.exists()) return [];
    
    const history = Object.values(snapshot.val()) as HistoryEntry[];
    history.sort((a, b) => b.timestamp - a.timestamp);
    
    return limit ? history.slice(0, limit) : history;
  },

  // Shabbat locations
  async getAllShabbatLocations(): Promise<ShabbatLocation[]> {
    const snapshot = await get(ref(database, FIREBASE_PATHS.shabbatLocations));
    if (!snapshot.exists()) return [];
    
    return Object.values(snapshot.val());
  },

  async getShabbatLocation(locationId: string): Promise<ShabbatLocation | null> {
    const snapshot = await get(ref(database, `${FIREBASE_PATHS.shabbatLocations}/${locationId}`));
    return snapshot.exists() ? snapshot.val() : null;
  },

  // Admin operations
  async getAllUsers(): Promise<FirebaseUser[]> {
    const snapshot = await get(ref(database, FIREBASE_PATHS.users));
    if (!snapshot.exists()) return [];
    
    return Object.values(snapshot.val());
  },

  async addAdminPayment(payment: Omit<AdminPayment, 'id' | 'timestamp'>): Promise<string> {
    const paymentRef = push(ref(database, FIREBASE_PATHS.adminPayments));
    const paymentData: AdminPayment = {
      ...payment,
      id: paymentRef.key!,
      timestamp: Date.now(),
    };
    
    await set(paymentRef, paymentData);
    
    // Also upgrade user
    await update(ref(database, `${FIREBASE_PATHS.users}/${payment.userId}`), {
      accountType: 'premium',
      updatedAt: Date.now(),
    });
    
    return paymentRef.key!;
  },

  async getUserPayments(userId: string): Promise<AdminPayment[]> {
    const snapshot = await get(ref(database, FIREBASE_PATHS.adminPayments));
    if (!snapshot.exists()) return [];
    
    const allPayments = Object.values(snapshot.val()) as AdminPayment[];
    return allPayments.filter(p => p.userId === userId);
  },

  // Real-time listeners
  subscribeToUser(uid: string, callback: (user: FirebaseUser | null) => void): () => void {
    const userRef = ref(database, `${FIREBASE_PATHS.users}/${uid}`);
    const listener = onValue(userRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
    
    return () => off(userRef, 'value', listener);
  },

  subscribeToUserHistory(userId: string, callback: (history: HistoryEntry[]) => void): () => void {
    const historyRef = ref(database, FIREBASE_PATHS.userHistory(userId));
    const listener = onValue(historyRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const history = Object.values(snapshot.val()) as HistoryEntry[];
      history.sort((a, b) => b.timestamp - a.timestamp);
      callback(history);
    });
    
    return () => off(historyRef, 'value', listener);
  },
};