import { Request, Response } from 'express';
import { auth } from 'firebase-admin';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
let adminAuth: any;
try {
  // For now, we'll use client-side verification
  // In production, you'd use Firebase Admin SDK with service account
  adminAuth = null;
} catch (error) {
  console.log('Firebase Admin not initialized - using client verification');
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function handleFirebaseAuth(req: Request, res: Response) {
  try {
    const { idToken, user: firebaseUser } = req.body;
    
    if (!idToken || !firebaseUser) {
      return res.status(400).json({ error: 'Missing Firebase credentials' });
    }

    // Check if user exists in our database
    let user = await storage.getUserByEmail(firebaseUser.email);
    
    if (!user) {
      // Create new user from Firebase data
      const newUser = await storage.createUser({
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        password: '' // No password for OAuth users
      });
      user = newUser;
    }

    // Create JWT token for our system
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        accountType: user.accountType 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        accountType: user.accountType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}