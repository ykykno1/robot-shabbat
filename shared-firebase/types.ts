import { z } from "zod";

// Firebase User Schema
export const FBUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  firebaseUid: z.string().optional(),
  accountTier: z.enum(['free', 'youtube_pro', 'premium']).default('free'),
  shabbatCity: z.string().optional(),
  shabbatCityId: z.string().optional(),
  hideTimingPreference: z.enum(['immediate', '15min', '30min', '1hour']).default('15min'),
  restoreTimingPreference: z.enum(['immediate', '15min', '30min', '1hour']).default('30min'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FBUser = z.infer<typeof FBUserSchema>;

// Platform Token Schema
export const FBPlatformTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: z.enum(['youtube', 'facebook', 'instagram', 'tiktok']),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  scopes: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FBPlatformToken = z.infer<typeof FBPlatformTokenSchema>;

// History Entry Schema
export const FBHistoryEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.enum(['hide', 'restore', 'auth', 'schedule']),
  platform: z.enum(['youtube', 'facebook', 'instagram', 'tiktok', 'all']),
  itemCount: z.number(),
  success: z.boolean(),
  error: z.string().optional(),
  details: z.record(z.any()).optional(),
  createdAt: z.date(),
});

export type FBHistoryEntry = z.infer<typeof FBHistoryEntrySchema>;

// Settings Schema
export const FBSettingsSchema = z.object({
  autoSchedule: z.boolean().default(true),
  enabledPlatforms: z.array(z.enum(['youtube', 'facebook', 'instagram', 'tiktok'])).default(['youtube', 'facebook']),
  timeZone: z.string().default('Asia/Jerusalem'),
  excludedContentIds: z.record(z.array(z.string())).default({}),
});

export type FBSettings = z.infer<typeof FBSettingsSchema>;

// Shabbat Times Schema
export const FBShabbatTimesSchema = z.object({
  cityId: z.string(),
  cityName: z.string(),
  entryTime: z.string(),
  exitTime: z.string(),
  date: z.string(),
});

export type FBShabbatTimes = z.infer<typeof FBShabbatTimesSchema>;