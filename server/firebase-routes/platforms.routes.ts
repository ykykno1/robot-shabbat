import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { FBFirebaseStorage } from '../FB-firebase-storage';

const router = Router();
const storage = new FBFirebaseStorage();

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'firebase-secret-key') as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all platform connections
router.get('/connections', verifyToken, async (req, res) => {
  try {
    const connections = await storage.getUserPlatformConnections(req.userId);
    res.json(connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
});

// YouTube routes
router.get('/youtube/check', verifyToken, async (req, res) => {
  try {
    const token = await storage.getPlatformToken(req.userId, 'youtube');
    res.json({ connected: !!token });
  } catch (error) {
    console.error('YouTube check error:', error);
    res.status(500).json({ error: 'Failed to check YouTube connection' });
  }
});

router.post('/youtube/connect', verifyToken, async (req, res) => {
  try {
    // In a real implementation, we would exchange OAuth tokens here
    // For now, we'll save a placeholder token
    await storage.savePlatformToken({
      userId: req.userId,
      platform: 'youtube',
      accessToken: 'youtube_access_token_placeholder',
      refreshToken: 'youtube_refresh_token_placeholder',
      scopes: ['youtube.readonly', 'youtube.force-ssl'],
      expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour
    });

    res.json({ success: true });
  } catch (error) {
    console.error('YouTube connect error:', error);
    res.status(500).json({ error: 'Failed to connect YouTube' });
  }
});

router.get('/youtube/videos', verifyToken, async (req, res) => {
  try {
    // In a real implementation, we would fetch videos from YouTube API
    // For now, return mock data
    const mockVideos = [
      {
        id: '1',
        title: 'סרטון לדוגמה 1',
        publishedAt: new Date().toISOString(),
        privacyStatus: 'public',
        locked: false
      },
      {
        id: '2',
        title: 'סרטון לדוגמה 2',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        privacyStatus: 'public',
        locked: true
      }
    ];

    res.json(mockVideos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

router.post('/youtube/hide', verifyToken, async (req, res) => {
  try {
    const { videoIds } = req.body;
    
    // Record history
    await storage.addHistoryEntry({
      userId: req.userId,
      action: 'hide',
      platform: 'youtube',
      itemCount: videoIds.length,
      success: true,
      details: { videoIds }
    });

    res.json({ success: true, count: videoIds.length });
  } catch (error) {
    console.error('Hide videos error:', error);
    res.status(500).json({ error: 'Failed to hide videos' });
  }
});

router.post('/youtube/restore', verifyToken, async (req, res) => {
  try {
    const { videoIds } = req.body;
    
    // Record history
    await storage.addHistoryEntry({
      userId: req.userId,
      action: 'restore',
      platform: 'youtube',
      itemCount: videoIds.length,
      success: true,
      details: { videoIds }
    });

    res.json({ success: true, count: videoIds.length });
  } catch (error) {
    console.error('Restore videos error:', error);
    res.status(500).json({ error: 'Failed to restore videos' });
  }
});

// Facebook routes
router.get('/facebook/check', verifyToken, async (req, res) => {
  try {
    const token = await storage.getPlatformToken(req.userId, 'facebook');
    res.json({ connected: !!token });
  } catch (error) {
    console.error('Facebook check error:', error);
    res.status(500).json({ error: 'Failed to check Facebook connection' });
  }
});

router.post('/facebook/connect', verifyToken, async (req, res) => {
  try {
    // In a real implementation, we would exchange OAuth tokens here
    await storage.savePlatformToken({
      userId: req.userId,
      platform: 'facebook',
      accessToken: 'facebook_access_token_placeholder',
      scopes: ['user_posts', 'pages_show_list'],
      expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Facebook connect error:', error);
    res.status(500).json({ error: 'Failed to connect Facebook' });
  }
});

router.get('/facebook/posts', verifyToken, async (req, res) => {
  try {
    // In a real implementation, we would fetch posts from Facebook API
    const mockPosts = [
      {
        id: '1',
        message: 'פוסט לדוגמה 1',
        created_time: new Date().toISOString(),
        is_hidden: false
      },
      {
        id: '2',
        message: 'פוסט לדוגמה 2',
        created_time: new Date(Date.now() - 86400000).toISOString(),
        is_hidden: false
      }
    ];

    res.json(mockPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

router.post('/facebook/hide', verifyToken, async (req, res) => {
  try {
    const { postIds } = req.body;
    
    // Record history
    await storage.addHistoryEntry({
      userId: req.userId,
      action: 'hide',
      platform: 'facebook',
      itemCount: postIds.length,
      success: true,
      details: { postIds }
    });

    res.json({ success: true, count: postIds.length });
  } catch (error) {
    console.error('Hide posts error:', error);
    res.status(500).json({ error: 'Failed to hide posts' });
  }
});

router.post('/facebook/restore', verifyToken, async (req, res) => {
  try {
    const { postIds } = req.body;
    
    // Record history
    await storage.addHistoryEntry({
      userId: req.userId,
      action: 'restore',
      platform: 'facebook',
      itemCount: postIds.length,
      success: true,
      details: { postIds }
    });

    res.json({ success: true, count: postIds.length });
  } catch (error) {
    console.error('Restore posts error:', error);
    res.status(500).json({ error: 'Failed to restore posts' });
  }
});

// Get user history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const history = await storage.getUserHistory(req.userId);
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;