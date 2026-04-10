import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useFirebaseToApp() {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token from Firebase
          const idToken = await firebaseUser.getIdToken();
          
          // Send to our backend to create/login user
          const response = await apiRequest('POST', '/api/firebase-auth', {
            idToken,
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }
          });

          // Store our JWT token
          localStorage.setItem('auth_token', response.token);
          
          // Update query cache
          queryClient.setQueryData(["/api/user"], response.user);
          
          // Force refresh
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          
          toast({
            title: "התחברות הצליחה",
            description: "ברוך הבא!"
          });
        } catch (error) {
          console.error('Failed to sync Firebase auth:', error);
          toast({
            title: "שגיאה בהתחברות",
            description: "לא הצלחנו לסנכרן את החשבון",
            variant: "destructive"
          });
        }
      } else {
        // User signed out
        localStorage.removeItem('auth_token');
        queryClient.setQueryData(["/api/user"], null);
      }
    });

    return () => unsubscribe();
  }, [toast]);
}