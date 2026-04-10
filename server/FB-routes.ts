import type { Express, Request, Response } from "express";
import { fbPostgreSQLStorage } from "./FB-postgresql-storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.FB_JWT_SECRET || 'firebase-app-secret-2024-separate';

// Extend Request type for userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Middleware for Firebase app authentication
export function fbAuthMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function registerFBRoutes(app: Express) {
  // Firebase Authentication
  app.post("/api/firebase/auth", async (req: Request, res: Response) => {
    try {
      console.log('Firebase auth request received:', { 
        hasIdToken: !!req.body.idToken, 
        hasUser: !!req.body.user,
        userEmail: req.body.user?.email 
      });
      
      const { idToken, user } = req.body;
      
      if (!user || !user.uid || !user.email) {
        console.error('Invalid user data:', user);
        return res.status(400).json({ error: 'Invalid user data' });
      }

      // Check if user exists in Firebase app database
      let fbUser = await fbPostgreSQLStorage.getUserByFirebaseUid(user.uid);
      console.log('Existing FB user found:', !!fbUser);
      
      if (!fbUser) {
        // Create new user in Firebase app database
        console.log('Creating new FB user for:', user.email);
        fbUser = await fbPostgreSQLStorage.createUser({
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          firebaseUid: user.uid
        });
        console.log('New FB user created:', fbUser.id);
      }

      // Generate auth token for Firebase app
      const token = await fbPostgreSQLStorage.generateAuthToken(fbUser.id);
      console.log('FB token generated successfully');
      
      res.json({
        token,
        user: {
          id: fbUser.id,
          email: fbUser.email,
          username: fbUser.username,
          accountType: fbUser.accountType
        }
      });
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user (protected route)
  app.get("/api/firebase/user", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await fbPostgreSQLStorage.getUserById(req.userId!);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        accountType: user.accountType,
        shabbatCity: user.shabbatCity,
        shabbatCityId: user.shabbatCityId,
        hideTimingPreference: user.hideTimingPreference,
        restoreTimingPreference: user.restoreTimingPreference
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update user settings
  app.patch("/api/firebase/user", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const updates = req.body;
      const updatedUser = await fbPostgreSQLStorage.updateUser(req.userId!, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get platform connections
  app.get("/api/firebase/connections", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      // For now, return empty connections since we haven't implemented platform connections yet
      res.json({
        youtube: null,
        facebook: null,
        instagram: null,
        tiktok: null
      });
    } catch (error: any) {
      console.error('Get connections error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user history
  app.get("/api/firebase/history", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const history = await fbPostgreSQLStorage.getHistory(req.userId!);
      res.json(history);
    } catch (error: any) {
      console.error('Get history error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Platform disconnection
  app.post("/api/firebase/disconnect/:platform", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      
      await fbPostgreSQLStorage.removeAuthToken(req.userId!, platform);
      
      // Add history entry
      await fbPostgreSQLStorage.addHistoryEntry({
        userId: req.userId!,
        action: 'platform_disconnected',
        platform,
        status: 'success'
      });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Disconnect error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // YouTube OAuth callback (placeholder for future implementation)
  app.post("/api/firebase/youtube/auth", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
      }
      
      // TODO: Implement YouTube OAuth token exchange
      // For now, return success
      res.json({ 
        success: true,
        message: 'YouTube OAuth not yet implemented in Firebase app'
      });
    } catch (error: any) {
      console.error('YouTube auth error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Facebook OAuth callback (placeholder for future implementation)
  app.post("/api/firebase/facebook/auth", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ error: 'Access token required' });
      }
      
      // TODO: Implement Facebook token validation
      // For now, return success
      res.json({ 
        success: true,
        message: 'Facebook OAuth not yet implemented in Firebase app'
      });
    } catch (error: any) {
      console.error('Facebook auth error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log('✅ Firebase App routes registered successfully');
}