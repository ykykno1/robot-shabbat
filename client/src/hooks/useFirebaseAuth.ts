import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "התחברות הצליחה",
        description: "ברוך הבא!"
      });
    } catch (error: any) {
      console.error('Email sign in error:', error);
      toast({
        title: "שגיאת התחברות",
        description: error.message || "שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "הרשמה הצליחה",
        description: "החשבון נוצר בהצלחה!"
      });
    } catch (error: any) {
      console.error('Email sign up error:', error);
      toast({
        title: "שגיאת הרשמה",
        description: error.message || "שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Extract YouTube access token if available
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (accessToken) {
        // Store YouTube token for API calls
        console.log('YouTube access token received:', accessToken);
        // TODO: Save to Firestore
      }
      
      toast({
        title: "התחברות עם Google הצליחה",
        description: "ברוך הבא!"
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "שגיאת התחברות Google",
        description: error.message || "שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Extract Facebook access token if available
      const credential = FacebookAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      
      if (accessToken) {
        // Store Facebook token for API calls
        console.log('Facebook access token received:', accessToken);
        // TODO: Save to Firestore
      }
      
      toast({
        title: "התחברות עם Facebook הצליחה",
        description: "ברוך הבא!"
      });
    } catch (error: any) {
      console.error('Facebook sign in error:', error);
      toast({
        title: "שגיאת התחברות Facebook",
        description: error.message || "שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "התנתקות הצליחה",
        description: "להתראות!"
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "שגיאת התנתקות",
        description: error.message || "שגיאה לא צפויה",
        variant: "destructive"
      });
    }
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    isAuthenticated: !!user
  };
}