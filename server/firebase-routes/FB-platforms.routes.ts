import type { Express, Request, Response } from "express";
import { fbPostgreSQLStorage } from "../FB-postgresql-storage";
import { fbAuthMiddleware } from "./FB-auth.routes";

export function registerFBPlatformRoutes(app: Express) {
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

  // YouTube connect - returns OAuth URL
  app.post("/api/firebase/youtube/connect", fbAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const REDIRECT_URI = process.env.NODE_ENV === 'production' 
        ? 'https://social-media-scheduler-ykykyair.replit.app/api/youtube/auth-callback'
        : 'http://localhost:5000/api/youtube/auth-callback';
      
      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'YouTube OAuth not configured' });
      }
      
      const state = Buffer.from(JSON.stringify({
        userId: req.userId,
        source: 'firebase-app',
        timestamp: Date.now()
      })).toString('base64');
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.force-ssl')}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;
      
      res.json({ authUrl });
    } catch (error: any) {
      console.error('YouTube connect error:', error);
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
}