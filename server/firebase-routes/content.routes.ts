import { Router } from 'express';
import { authenticateFirebaseApp } from './auth.routes';
import { firebaseDb } from '../../client/src/firebase-app/lib/firebase-db';
import { getYouTubeVideos, hideYouTubeVideos, restoreYouTubeVideos } from '../services/youtube.service';
import { getFacebookPosts, hideFacebookPosts, restoreFacebookPosts } from '../services/facebook.service';

const router = Router();

// YouTube content operations
router.get('/firebase/youtube/videos', authenticateFirebaseApp, async (req, res) => {
  try {
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'youtube');
    if (!token) {
      return res.status(404).json({ error: 'YouTube not connected' });
    }

    const videos = await getYouTubeVideos(token.accessToken);
    
    // Get lock status for each video
    const videosWithLockStatus = await Promise.all(
      videos.map(async (video) => {
        const status = await firebaseDb.getVideoStatus(req.user.uid, 'youtube', video.id);
        return {
          ...video,
          isLocked: status?.isLocked || false,
          originalPrivacyStatus: status?.originalPrivacyStatus || video.privacyStatus,
        };
      })
    );

    res.json(videosWithLockStatus);
  } catch (error) {
    console.error('Failed to get YouTube videos:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

router.post('/firebase/youtube/hide', authenticateFirebaseApp, async (req, res) => {
  try {
    const { videoIds } = req.body;
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'youtube');
    
    if (!token) {
      return res.status(404).json({ error: 'YouTube not connected' });
    }

    // Get videos to check lock status
    const videos = await getYouTubeVideos(token.accessToken);
    const unlockedVideoIds = [];
    
    for (const videoId of videoIds) {
      const video = videos.find(v => v.id === videoId);
      if (!video) continue;
      
      const status = await firebaseDb.getVideoStatus(req.user.uid, 'youtube', videoId);
      if (!status?.isLocked) {
        unlockedVideoIds.push(videoId);
        
        // Save original status before hiding
        await firebaseDb.saveVideoStatus(req.user.uid, {
          videoId,
          platform: 'youtube',
          originalPrivacyStatus: video.privacyStatus,
          currentPrivacyStatus: 'private',
          isLocked: false,
          isHiddenByUser: true,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
        });
      }
    }

    const result = await hideYouTubeVideos(token.accessToken, unlockedVideoIds);
    
    await firebaseDb.addHistoryEntry(req.user.uid, {
      operation: 'hide',
      platform: 'youtube',
      success: result.success,
      affectedItems: result.affectedCount,
      error: result.error,
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to hide YouTube videos:', error);
    res.status(500).json({ error: 'Failed to hide videos' });
  }
});

router.post('/firebase/youtube/restore', authenticateFirebaseApp, async (req, res) => {
  try {
    const { videoIds } = req.body;
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'youtube');
    
    if (!token) {
      return res.status(404).json({ error: 'YouTube not connected' });
    }

    // Get original privacy status for each video
    const videoStatusMap = new Map();
    
    for (const videoId of videoIds) {
      const status = await firebaseDb.getVideoStatus(req.user.uid, 'youtube', videoId);
      if (status && !status.isLocked) {
        videoStatusMap.set(videoId, status.originalPrivacyStatus || 'public');
      }
    }

    const result = await restoreYouTubeVideos(token.accessToken, Array.from(videoStatusMap.entries()));
    
    // Update status after restore
    for (const [videoId, privacyStatus] of videoStatusMap) {
      await firebaseDb.saveVideoStatus(req.user.uid, {
        videoId,
        platform: 'youtube',
        originalPrivacyStatus: privacyStatus,
        currentPrivacyStatus: privacyStatus,
        isLocked: false,
        isHiddenByUser: false,
      });
    }

    await firebaseDb.addHistoryEntry(req.user.uid, {
      operation: 'restore',
      platform: 'youtube',
      success: result.success,
      affectedItems: result.affectedCount,
      error: result.error,
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to restore YouTube videos:', error);
    res.status(500).json({ error: 'Failed to restore videos' });
  }
});

router.post('/firebase/youtube/lock', authenticateFirebaseApp, async (req, res) => {
  try {
    const { videoId, isLocked } = req.body;
    
    const status = await firebaseDb.getVideoStatus(req.user.uid, 'youtube', videoId);
    if (status) {
      await firebaseDb.saveVideoStatus(req.user.uid, {
        ...status,
        isLocked,
      });
    } else {
      // Create new status entry
      await firebaseDb.saveVideoStatus(req.user.uid, {
        videoId,
        platform: 'youtube',
        originalPrivacyStatus: 'public',
        currentPrivacyStatus: 'public',
        isLocked,
        isHiddenByUser: false,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update lock status:', error);
    res.status(500).json({ error: 'Failed to update lock status' });
  }
});

// Facebook content operations
router.get('/firebase/facebook/posts', authenticateFirebaseApp, async (req, res) => {
  try {
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'facebook');
    if (!token) {
      return res.status(404).json({ error: 'Facebook not connected' });
    }

    const posts = await getFacebookPosts(token.accessToken);
    res.json(posts);
  } catch (error) {
    console.error('Failed to get Facebook posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

router.post('/firebase/facebook/hide', authenticateFirebaseApp, async (req, res) => {
  try {
    const { postIds } = req.body;
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'facebook');
    
    if (!token) {
      return res.status(404).json({ error: 'Facebook not connected' });
    }

    const result = await hideFacebookPosts(token.accessToken, postIds);
    
    await firebaseDb.addHistoryEntry(req.user.uid, {
      operation: 'hide',
      platform: 'facebook',
      success: result.success,
      affectedItems: result.affectedCount,
      error: result.error,
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to hide Facebook posts:', error);
    res.status(500).json({ error: 'Failed to hide posts' });
  }
});

router.post('/firebase/facebook/restore', authenticateFirebaseApp, async (req, res) => {
  try {
    const { postIds } = req.body;
    const token = await firebaseDb.getPlatformToken(req.user.uid, 'facebook');
    
    if (!token) {
      return res.status(404).json({ error: 'Facebook not connected' });
    }

    const result = await restoreFacebookPosts(token.accessToken, postIds);
    
    await firebaseDb.addHistoryEntry(req.user.uid, {
      operation: 'restore',
      platform: 'facebook',
      success: result.success,
      affectedItems: result.affectedCount,
      error: result.error,
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to restore Facebook posts:', error);
    res.status(500).json({ error: 'Failed to restore posts' });
  }
});

export default router;