import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase-client';
import './styles/globals.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import YouTubePage from './pages/YouTubePage';
import FacebookPage from './pages/FacebookPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import PricingPage from './pages/PricingPage';

// Components
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';

// Types
interface FirebaseAppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  token?: string;
}

type AppPage = 'dashboard' | 'youtube' | 'facebook' | 'settings' | 'history' | 'pricing';

export default function FirebaseApp() {
  const [user, setUser] = useState<FirebaseAppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');

  useEffect(() => {
    console.log('Firebase App loaded!');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Authenticate with our backend
          console.log('Sending auth request to backend for:', firebaseUser.email);
          const response = await fetch('/api/firebase/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken,
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              }
            })
          });

          console.log('Backend response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Auth successful, token received');
            localStorage.setItem('firebase_app_token', data.token);
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              token: data.token,
            });
          } else {
            const error = await response.json();
            console.error('Backend auth failed:', error);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebase_app_token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} />;
      case 'youtube':
        return <YouTubePage user={user} />;
      case 'facebook':
        return <FacebookPage user={user} />;
      case 'settings':
        return <SettingsPage user={user} />;
      case 'history':
        return <HistoryPage user={user} />;
      case 'pricing':
        return <PricingPage user={user} />;
      default:
        return <DashboardPage user={user} />;
    }
  };

  return (
    <div className="firebase-app">
      <Header 
        user={user} 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      <main className="fb-main">
        {renderPage()}
      </main>
    </div>
  );
}