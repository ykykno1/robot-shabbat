import { Router } from 'express';
import { authenticateFirebaseApp } from './auth.routes';
import { firebaseDb } from '../../client/src/firebase-app/lib/firebase-db';

const router = Router();

// Admin middleware - check if user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  // For now, we'll use a simple check - in production, use Firebase Admin SDK
  const adminEmails = ['admin@robotshabat.com', 'yk@gmail.com'];
  
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Get all users
router.get('/firebase/admin/users', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const users = await firebaseDb.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user statistics
router.get('/firebase/admin/stats', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const users = await firebaseDb.getAllUsers();
    const now = Date.now();
    
    const stats = {
      totalUsers: users.length,
      freeUsers: users.filter(u => u.accountType === 'free').length,
      youtubePro: users.filter(u => u.accountType === 'youtube_pro').length,
      premiumUsers: users.filter(u => u.accountType === 'premium').length,
      activeTrials: users.filter(u => u.trialEndsAt && u.trialEndsAt > now).length,
      totalRevenue: 0, // Would need payment tracking
      platformConnections: {
        youtube: 0,
        facebook: 0,
        instagram: 0,
        tiktok: 0,
      },
    };
    
    // Count platform connections
    for (const user of users) {
      const tokens = await firebaseDb.getAllUserTokens(user.uid);
      for (const token of tokens) {
        if (token.isValid) {
          stats.platformConnections[token.platform as keyof typeof stats.platformConnections]++;
        }
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Update user
router.put('/firebase/admin/users/:uid', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.uid;
    delete updates.createdAt;
    delete updates.email;
    
    await firebaseDb.updateUser(uid, updates);
    const updatedUser = await firebaseDb.getUser(uid);
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Add manual payment
router.post('/firebase/admin/payments', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const { userId, amount, notes } = req.body;
    
    const paymentId = await firebaseDb.addAdminPayment({
      userId,
      amount,
      notes,
      adminId: req.user.uid,
    });
    
    res.json({ success: true, paymentId });
  } catch (error) {
    console.error('Failed to add payment:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// Get user payments
router.get('/firebase/admin/payments/:userId', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await firebaseDb.getUserPayments(userId);
    res.json(payments);
  } catch (error) {
    console.error('Failed to get payments:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// Delete user
router.delete('/firebase/admin/users/:uid', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    await firebaseDb.deleteUser(uid);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all history entries
router.get('/firebase/admin/history', authenticateFirebaseApp, isAdmin, async (req, res) => {
  try {
    const users = await firebaseDb.getAllUsers();
    const allHistory = [];
    
    for (const user of users) {
      const userHistory = await firebaseDb.getUserHistory(user.uid);
      allHistory.push(...userHistory.map(h => ({
        ...h,
        userEmail: user.email,
        username: user.username,
      })));
    }
    
    // Sort by timestamp
    allHistory.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(allHistory.slice(0, 100)); // Return latest 100 entries
  } catch (error) {
    console.error('Failed to get history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;