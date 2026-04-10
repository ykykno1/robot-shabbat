import { z } from 'zod';

// Firebase User Schema
export const firebaseUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  username: z.string(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  accountType: z.enum(['free', 'youtube_pro', 'premium']).default('free'),
  createdAt: z.number(), // Firebase timestamp
  updatedAt: z.number(),
  trialEndsAt: z.number().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  
  // Shabbat settings
  shabbatCity: z.string().optional(),
  shabbatCityId: z.string().optional(),
  hideTimingPreference: z.string().default('15min'),
  restoreTimingPreference: z.string().default('30min'),
  
  // Verification
  emailVerified: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  phoneVerified: z.boolean().default(false),
  
  // Auth provider
  authProvider: z.enum(['google', 'facebook', 'email']).default('email'),
});

export type FirebaseUser = z.infer<typeof firebaseUserSchema>;

// Platform Auth Tokens Schema
export const platformTokenSchema = z.object({
  userId: z.string(),
  platform: z.enum(['facebook', 'youtube', 'instagram', 'tiktok']),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  isValid: z.boolean().default(true),
  metadata: z.record(z.any()).optional(), // Platform-specific data
});

export type PlatformToken = z.infer<typeof platformTokenSchema>;

// Video Status Schema
export const videoStatusSchema = z.object({
  videoId: z.string(),
  userId: z.string(),
  platform: z.enum(['youtube', 'facebook', 'instagram', 'tiktok']),
  originalPrivacyStatus: z.string(),
  currentPrivacyStatus: z.string(),
  isLocked: z.boolean().default(false),
  isHiddenByUser: z.boolean().default(false),
  lastModified: z.number(),
  title: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export type VideoStatus = z.infer<typeof videoStatusSchema>;

// History Entry Schema
export const historyEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.number(),
  operation: z.enum(['hide', 'restore', 'exception_add', 'exception_remove']),
  platform: z.enum(['facebook', 'youtube', 'instagram', 'tiktok']),
  success: z.boolean(),
  affectedItems: z.number(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;

// Shabbat Location Schema
export const shabbatLocationSchema = z.object({
  id: z.string(),
  city: z.string(),
  cityEnglish: z.string(),
  isActive: z.boolean().default(true),
  timezone: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export type ShabbatLocation = z.infer<typeof shabbatLocationSchema>;

// Facebook Post Schema (for caching)
export const facebookPostSchema = z.object({
  id: z.string(),
  message: z.string().optional(),
  createdTime: z.number(),
  privacy: z.object({
    value: z.string(),
    description: z.string().optional(),
  }),
  isHidden: z.boolean().default(false),
  attachments: z.any().optional(), // Complex structure
  fullPicture: z.string().optional(),
  picture: z.string().optional(),
  type: z.string().optional(),
  story: z.string().optional(),
});

export type FacebookPost = z.infer<typeof facebookPostSchema>;

// YouTube Video Schema (for caching)
export const youtubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  publishedAt: z.number(),
  thumbnailUrl: z.string().optional(),
  privacyStatus: z.enum(['public', 'private', 'unlisted']),
  originalPrivacyStatus: z.enum(['public', 'private', 'unlisted']).optional(),
  isLocked: z.boolean().default(false),
});

export type YouTubeVideo = z.infer<typeof youtubeVideoSchema>;

// Admin Payment Schema
export const adminPaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  timestamp: z.number(),
  notes: z.string().optional(),
  adminId: z.string(),
});

export type AdminPayment = z.infer<typeof adminPaymentSchema>;

// Firebase Database Paths
export const FIREBASE_PATHS = {
  users: 'users',
  platformTokens: 'platformTokens',
  videoStatus: 'videoStatus',
  history: 'history',
  shabbatLocations: 'shabbatLocations',
  adminPayments: 'adminPayments',
  
  // User-specific paths
  userTokens: (userId: string) => `${FIREBASE_PATHS.platformTokens}/${userId}`,
  userVideos: (userId: string) => `${FIREBASE_PATHS.videoStatus}/${userId}`,
  userHistory: (userId: string) => `${FIREBASE_PATHS.history}/${userId}`,
} as const;