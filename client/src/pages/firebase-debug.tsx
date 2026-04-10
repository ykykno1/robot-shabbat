import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from "firebase/auth";

export default function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState('מוכן לבדיקה...');

  const testFirebaseAuth = async () => {
    try {
      setDebugInfo('בודק הגדרות Firebase...');
      
      setDebugInfo(`הגדרות Firebase:
Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}
Auth Domain: ${auth.config.authDomain}
API Key: ${auth.config.apiKey?.substring(0, 20)}...

משתמש ב-Firebase הקיים...`);
      
      setDebugInfo(prev => prev + '\n\nFirebase זמין בהצלחה.\nמנסה להתחבר עם Google...');
      
      const result = await signInWithPopup(auth, googleProvider);
      
      setDebugInfo(`✅ התחברות הצליחה!
User: ${result.user.email}
UID: ${result.user.uid}
Display Name: ${result.user.displayName}
Photo: ${result.user.photoURL}`);
      
    } catch (error: any) {
      let errorDetails = '';
      
      if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        errorDetails = `
🔍 אבחון בעיה:
הבעיה היא שהשירות Authentication לא מופעל ב-Firebase Console.

📋 פתרון:
1. לך ל-Firebase Console
2. בחר את הפרויקט "yk-robot-shabat"
3. לחץ על "Authentication" בתפריט השמאלי
4. אם רואה רשימת "Sign-in providers" - לחץ על "Google" והפעל אותו
5. אם לא רואה כלום - צריך להפעיל את השירות תחילה`;
      } else if (error.code === 'auth/unauthorized-domain') {
        errorDetails = `
🔍 אבחון בעיה:
הדומיין לא מורשה ב-Firebase.

📋 פתרון:
הוסף את הדומיין הזה ב-Firebase Console > Authentication > Settings > Authorized domains:
${window.location.hostname}`;
      }
      
      setDebugInfo(`❌ שגיאה:
Code: ${error.code}
Message: ${error.message}${errorDetails}

פרטים מלאים:
${JSON.stringify(error, null, 2)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Firebase Debug</CardTitle>
          <CardDescription>
            בדיקת אימות Firebase מפורטת
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button onClick={testFirebaseAuth} className="w-full">
            בדוק אימות Firebase
          </Button>
          
          <div className="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-line max-h-60 overflow-y-auto">
            {debugInfo}
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <a href="/firebase-login">חזור לדף התחברות</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}