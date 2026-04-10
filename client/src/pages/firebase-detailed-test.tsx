import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FirebaseDetailedTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDetailedTests = async () => {
    setTestResults([]);
    addResult('🚀 מתחיל בדיקות מפורטות');

    // Test 1: Environment variables
    addResult('📋 בודק משתני סביבה...');
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;

    addResult(`API Key: ${apiKey ? `${apiKey.substring(0, 25)}...` : 'חסר'}`);
    addResult(`Project ID: ${projectId || 'חסר'}`);
    addResult(`App ID: ${appId ? `${appId.substring(0, 30)}...` : 'חסר'}`);

    if (!apiKey || !projectId || !appId) {
      addResult('❌ חסרים משתני סביבה קריטיים');
      return;
    }

    // Test 2: Firebase config validation
    addResult('🔧 בודק תצורת Firebase...');
    const config = {
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
      messagingSenderId: "700126700357",
      appId,
      measurementId: "G-K196PR9DZQ"
    };
    addResult(`Auth Domain: ${config.authDomain}`);
    addResult(`Storage Bucket: ${config.storageBucket}`);

    // Test 3: Current domain check
    addResult('🌐 בודק דומיין נוכחי...');
    addResult(`Current domain: ${window.location.hostname}`);
    addResult(`Full URL: ${window.location.origin}`);
    addResult(`Protocol: ${window.location.protocol}`);

    // Test 4: Try different Firebase initialization
    try {
      addResult('🔥 מנסה לאתחל Firebase...');
      
      // Dynamic import to avoid issues
      const { initializeApp } = await import('firebase/app');
      const { getAuth, connectAuthEmulator } = await import('firebase/auth');
      
      const app = initializeApp(config);
      addResult('✅ Firebase app אותחל בהצלחה');
      
      const auth = getAuth(app);
      addResult('✅ Auth service נוצר בהצלחה');
      addResult(`Auth domain: ${auth.config.authDomain}`);
      addResult(`Auth API key: ${auth.config.apiKey?.substring(0, 25)}...`);
      
      // Test 5: Check if we can access Firebase services
      try {
        addResult('🔍 בודק זמינות שירותי Firebase...');
        
        // Try to get current user (should be null but shouldn't error)
        const currentUser = auth.currentUser;
        addResult(`Current user: ${currentUser ? 'מחובר' : 'לא מחובר'}`);
        
        addResult('✅ שירותי Firebase זמינים');
        
        // Test 6: Test Google provider creation
        const { GoogleAuthProvider } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        addResult('✅ Google Auth Provider נוצר בהצלחה');
        
        addResult('🎯 כל הבדיקות הבסיסיות עברו בהצלחה');
        addResult('💡 הבעיה כנראה בהרשאות הדומיין או הגדרות Firebase Console');
        
      } catch (serviceError: any) {
        addResult(`❌ שגיאה בשירותי Firebase: ${serviceError.message}`);
        addResult(`Code: ${serviceError.code || 'לא ידוע'}`);
      }
      
    } catch (initError: any) {
      addResult(`❌ שגיאה באתחול Firebase: ${initError.message}`);
      addResult(`Code: ${initError.code || 'לא ידוע'}`);
      addResult(`Details: ${JSON.stringify(initError, null, 2)}`);
    }
  };

  const testSimpleAuth = async () => {
    addResult('🔐 מנסה אימות Google פשוט...');
    
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      
      const app = initializeApp(config);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      addResult('🚀 מפעיל popup לאימות Google...');
      const result = await signInWithPopup(auth, provider);
      
      addResult(`✅ התחברות הצליחה!`);
      addResult(`User: ${result.user.email}`);
      addResult(`UID: ${result.user.uid}`);
      
    } catch (authError: any) {
      addResult(`❌ שגיאת אימות: ${authError.code}`);
      addResult(`Message: ${authError.message}`);
      
      if (authError.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        addResult('🔍 הבעיה: API Key לא תקין או שירות Authentication לא מופעל');
        addResult('💡 פתרון: בדוק ב-Firebase Console שהשירות Authentication מופעל');
      } else if (authError.code === 'auth/unauthorized-domain') {
        addResult('🔍 הבעיה: דומיין לא מורשה');
        addResult(`💡 פתרון: הוסף את ${window.location.hostname} לדומיינים מורשים`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">בדיקות Firebase מפורטות</CardTitle>
          <CardDescription>
            אבחון מקיף של בעיות Firebase Authentication
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDetailedTests} className="flex-1">
              בדיקות מפורטות
            </Button>
            <Button onClick={testSimpleAuth} variant="outline" className="flex-1">
              נסה אימות Google
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-sm font-mono whitespace-pre-wrap">
              {testResults.length === 0 
                ? 'מוכן לבדיקה...' 
                : testResults.join('\n')
              }
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <a href="/">חזור לעמוד הראשי</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}