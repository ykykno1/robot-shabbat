import { Router } from 'express';
import { authenticateFirebaseApp } from './auth.routes';
import { firebaseDb } from '../../client/src/firebase-app/lib/firebase-db';
import fetch from 'node-fetch';

const router = Router();

// Facebook OAuth configuration
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '1176249107048528';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FACEBOOK_REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://social-media-scheduler-ykykyair.replit.app/api/firebase/oauth/facebook/callback'
  : 'http://localhost:5000/api/firebase/oauth/facebook/callback';

// YouTube OAuth configuration  
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '169491902267-jvnsm8e68e0ndp40mkj1ecqto6mhb23n.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const YOUTUBE_REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://social-media-scheduler-ykykyair.replit.app/api/firebase/oauth/youtube/callback'
  : 'http://localhost:5000/api/firebase/oauth/youtube/callback';

// Facebook OAuth flow
router.get('/firebase/oauth/facebook/start', authenticateFirebaseApp, (req, res) => {
  const state = Buffer.from(JSON.stringify({
    userId: req.user.uid,
    timestamp: Date.now(),
  })).toString('base64');
  
  const authUrl = `https://www.facebook.com/v22.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&` +
    `state=${state}&` +
    `scope=email,public_profile,user_posts&` +
    `response_type=code`;
  
  res.json({ authUrl });
});

router.get('/firebase/oauth/facebook/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.redirect('/firebase-app?error=missing_params');
    }
    
    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    
    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v22.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `code=${code}`;
    
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('Facebook token error:', tokenData.error);
      return res.redirect('/firebase-app?error=token_exchange_failed');
    }
    
    // Get long-lived token
    const longLivedUrl = `https://graph.facebook.com/v22.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${tokenData.access_token}`;
    
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();
    
    // Save token to Firebase
    await firebaseDb.savePlatformToken(stateData.userId, {
      platform: 'facebook',
      accessToken: longLivedData.access_token || tokenData.access_token,
      expiresAt: Date.now() + ((longLivedData.expires_in || tokenData.expires_in || 3600) * 1000),
      isValid: true,
      metadata: {
        tokenType: longLivedData.token_type || tokenData.token_type,
      },
    });
    
    // Redirect back to app
    res.redirect('/firebase-app/facebook?connected=true');
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.redirect('/firebase-app?error=oauth_error');
  }
});

// YouTube OAuth flow
router.get('/firebase/oauth/youtube/start', authenticateFirebaseApp, (req, res) => {
  const state = Buffer.from(JSON.stringify({
    userId: req.user.uid,
    timestamp: Date.now(),
  })).toString('base64');
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(YOUTUBE_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.force-ssl')}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${state}`;
  
  res.json({ authUrl });
});

router.get('/firebase/oauth/youtube/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.redirect('/firebase-app?error=missing_params');
    }
    
    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('YouTube token error:', tokenData.error);
      return res.redirect('/firebase-app?error=token_exchange_failed');
    }
    
    // Save tokens to Firebase
    await firebaseDb.savePlatformToken(stateData.userId, {
      platform: 'youtube',
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      isValid: true,
      metadata: {
        tokenType: tokenData.token_type,
        scope: tokenData.scope,
      },
    });
    
    // Redirect back to app
    res.redirect('/firebase-app/youtube?connected=true');
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    res.redirect('/firebase-app?error=oauth_error');
  }
});

// Refresh YouTube token
router.post('/firebase/oauth/youtube/refresh', authenticateFirebaseApp, async (req, res) => {
  try {
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'youtube');
    
    if (!token || !token.refreshToken) {
      return res.status(404).json({ error: 'No refresh token available' });
    }
    
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: token.refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    });
    
    const refreshData = await refreshResponse.json();
    
    if (refreshData.error) {
      console.error('Token refresh error:', refreshData.error);
      return res.status(500).json({ error: 'Failed to refresh token' });
    }
    
    // Update token
    await firebaseDb.savePlatformToken(req.user.uid, {
      platform: 'youtube',
      accessToken: refreshData.access_token,
      refreshToken: token.refreshToken, // Keep the same refresh token
      expiresAt: Date.now() + (refreshData.expires_in * 1000),
      isValid: true,
      metadata: token.metadata,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to refresh token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;