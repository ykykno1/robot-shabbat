import { Express } from 'express';
import authRoutes from './auth.routes';
import platformRoutes from './platforms.routes';
import { registerFBAuthRoutes } from './FB-auth.routes';

export function registerFirebaseRoutes(app: Express) {
  // Legacy FB auth routes
  registerFBAuthRoutes(app);
  
  // New auth routes
  app.use('/api/firebase/user', authRoutes);
  
  // Platform routes - all platform operations
  app.use('/api/firebase', platformRoutes);

  console.log('✅ Firebase routes registered successfully');
}