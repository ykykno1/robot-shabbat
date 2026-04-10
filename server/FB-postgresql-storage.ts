// Completely separate storage for Firebase app using PostgreSQL
import { db } from './db.js';
import * as schema from '../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

const JWT_SECRET = process.env.FB_JWT_SECRET || 'firebase-app-secret-2024-separate';

// Firebase app user type
export interface FBUser {
  id: string;
  email: string;
  username: string;
  firebaseUid?: string;
  accountType: 'free' | 'youtube_pro' | 'premium';
  shabbatCity?: string;
  shabbatCityId?: string;
  hideTimingPreference: string;
  restoreTimingPreference: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create separate tables for Firebase app
const createFBTables = async () => {
  try {
    // Create fb_users table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS fb_users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        firebase_uid VARCHAR(255) UNIQUE,
        account_type VARCHAR(50) DEFAULT 'free',
        shabbat_city VARCHAR(255),
        shabbat_city_id VARCHAR(50),
        hide_timing_preference VARCHAR(50) DEFAULT '15min',
        restore_timing_preference VARCHAR(50) DEFAULT '30min',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create fb_auth_tokens table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS fb_auth_tokens (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, platform)
      )
    `);

    // Create fb_history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS fb_history (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        platform VARCHAR(50),
        item_count INTEGER,
        details JSONB,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Firebase app tables created successfully');
  } catch (error) {
    console.error('Error creating FB tables:', error);
  }
};

// Initialize tables on startup
createFBTables();

export class FBPostgreSQLStorage {
  // User Management
  async createUser(userData: {
    email: string;
    username: string;
    password?: string;
    firebaseUid?: string;
  }): Promise<FBUser> {
    const userId = nanoid();
    const passwordHash = userData.password ? await bcrypt.hash(userData.password, 10) : null;
    
    const result = await db.execute(sql`
      INSERT INTO fb_users (
        id, email, username, password_hash, firebase_uid,
        account_type, hide_timing_preference, restore_timing_preference
      ) VALUES (
        ${userId}, ${userData.email}, ${userData.username}, 
        ${passwordHash}, ${userData.firebaseUid},
        'free', '15min', '30min'
      )
      RETURNING *
    `);

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async getUserById(userId: string): Promise<FBUser | null> {
    const result = await db.execute(sql`
      SELECT * FROM fb_users WHERE id = ${userId}
    `);

    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async getUserByEmail(email: string): Promise<FBUser | null> {
    const result = await db.execute(sql`
      SELECT * FROM fb_users WHERE email = ${email}
    `);

    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<FBUser | null> {
    const result = await db.execute(sql`
      SELECT * FROM fb_users WHERE firebase_uid = ${firebaseUid}
    `);

    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async updateUser(userId: string, updates: Partial<FBUser>): Promise<FBUser | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (updates.email) {
      setClause.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.username) {
      setClause.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }
    if (updates.accountType) {
      setClause.push(`account_type = $${paramIndex++}`);
      values.push(updates.accountType);
    }
    if (updates.shabbatCity) {
      setClause.push(`shabbat_city = $${paramIndex++}`);
      values.push(updates.shabbatCity);
    }
    if (updates.shabbatCityId) {
      setClause.push(`shabbat_city_id = $${paramIndex++}`);
      values.push(updates.shabbatCityId);
    }
    if (updates.hideTimingPreference) {
      setClause.push(`hide_timing_preference = $${paramIndex++}`);
      values.push(updates.hideTimingPreference);
    }
    if (updates.restoreTimingPreference) {
      setClause.push(`restore_timing_preference = $${paramIndex++}`);
      values.push(updates.restoreTimingPreference);
    }

    setClause.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE fb_users 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.execute(sql.raw(query, ...values));
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async validatePassword(email: string, password: string): Promise<FBUser | null> {
    const result = await db.execute(sql`
      SELECT * FROM fb_users WHERE email = ${email}
    `);

    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    if (!user.password_hash) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async generateAuthToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  }

  // Platform Token Management
  async saveAuthToken(userId: string, platform: string, tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }): Promise<void> {
    const tokenId = nanoid();
    const expiresAt = tokens.expiresIn 
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null;

    // Delete existing token for this platform
    await db.execute(sql`
      DELETE FROM fb_auth_tokens 
      WHERE user_id = ${userId} AND platform = ${platform}
    `);

    // Insert new token
    await db.execute(sql`
      INSERT INTO fb_auth_tokens (
        id, user_id, platform, access_token, refresh_token, expires_at
      ) VALUES (
        ${tokenId}, ${userId}, ${platform}, 
        ${tokens.accessToken}, ${tokens.refreshToken}, ${expiresAt}
      )
    `);
  }

  async getAuthToken(userId: string, platform: string): Promise<any | null> {
    const result = await db.execute(sql`
      SELECT * FROM fb_auth_tokens 
      WHERE user_id = ${userId} AND platform = ${platform}
    `);

    if (result.rows.length === 0) return null;
    
    const token = result.rows[0];
    return {
      id: token.id,
      userId: token.user_id,
      platform: token.platform,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_at,
      createdAt: token.created_at
    };
  }

  async removeAuthToken(userId: string, platform: string): Promise<void> {
    await db.execute(sql`
      DELETE FROM fb_auth_tokens 
      WHERE user_id = ${userId} AND platform = ${platform}
    `);
  }

  // History Management
  async addHistoryEntry(entry: {
    userId: string;
    action: string;
    platform?: string;
    itemCount?: number;
    details?: any;
    status: 'success' | 'failure';
  }): Promise<void> {
    const historyId = nanoid();
    
    await db.execute(sql`
      INSERT INTO fb_history (
        id, user_id, action, platform, item_count, details, status
      ) VALUES (
        ${historyId}, ${entry.userId}, ${entry.action}, 
        ${entry.platform}, ${entry.itemCount}, 
        ${JSON.stringify(entry.details)}, ${entry.status}
      )
    `);
  }

  async getHistory(userId: string, limit: number = 50): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT * FROM fb_history 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      action: row.action,
      platform: row.platform,
      itemCount: row.item_count,
      details: row.details,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  // Get all premium users for scheduler
  async getPremiumUsers(): Promise<FBUser[]> {
    const result = await db.execute(sql`
      SELECT * FROM fb_users 
      WHERE account_type IN ('youtube_pro', 'premium')
    `);

    return result.rows.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firebaseUid: user.firebase_uid,
      accountType: user.account_type,
      shabbatCity: user.shabbat_city,
      shabbatCityId: user.shabbat_city_id,
      hideTimingPreference: user.hide_timing_preference,
      restoreTimingPreference: user.restore_timing_preference,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }
}

export const fbPostgreSQLStorage = new FBPostgreSQLStorage();