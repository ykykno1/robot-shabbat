import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { FBUser } from "@shared/types";

interface AuthContextType {
  firebaseUser: User | null;
  appUser: FBUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<FBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppUser = async (uid: string) => {
    try {
      const token = await firebaseUser?.getIdToken();
      
      // First authenticate with backend
      const authResponse = await fetch('/api/firebase/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idToken: token,
          user: {
            uid: firebaseUser?.uid,
            email: firebaseUser?.email,
            displayName: firebaseUser?.displayName
          }
        })
      });

      if (authResponse.ok) {
        const { token: jwtToken, user } = await authResponse.json();
        localStorage.setItem('firebase-auth-token', jwtToken);
        setAppUser(user);
      } else {
        console.error('Failed to authenticate with backend');
      }
    } catch (error) {
      console.error('Error fetching app user:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        await fetchAppUser(user.uid);
      } else {
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setAppUser(null);
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
    } catch (error) {
      toast({
        title: "שגיאה בהתנתקות",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const refreshAppUser = async () => {
    if (firebaseUser) {
      await fetchAppUser(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, signOut, refreshAppUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}