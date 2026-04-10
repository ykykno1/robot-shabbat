import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function FirebaseSimpleTest() {
  const [status, setStatus] = useState('מוכן לבדיקה...');
  const [user, setUser] = useState<any>(null);

  const testGoogleAuth = async () => {
    try {
      setStatus('פותח popup של Google...');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      setStatus('התחברות הצליחה!');
      setUser(result.user);
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      let errorMessage = '';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'המשתמש סגר את החלון';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'דומיין לא מורשה - צריך להוסיף את הדומיין ב-Firebase Console';
      } else if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        errorMessage = 'API Key לא תקין או שירות Authentication לא מופעל';
      } else {
        errorMessage = `שגיאה: ${error.code} - ${error.message}`;
      }
      
      setStatus(`❌ ${errorMessage}`);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setStatus('התנתקות הושלמה');
    } catch (error) {
      console.error('Logout error:', error);
      setStatus('שגיאה בהתנתקות');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">בדיקת Firebase פשוטה</CardTitle>
          <CardDescription>
            בדיקה ישירה של Google Authentication
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!user ? (
            <Button onClick={testGoogleAuth} className="w-full" size="lg">
              התחבר עם Google
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">התחברות הצליחה!</h3>
                <div className="text-sm text-green-700">
                  <p><strong>שם:</strong> {user.displayName}</p>
                  <p><strong>אימייל:</strong> {user.email}</p>
                  <p><strong>UID:</strong> {user.uid}</p>
                </div>
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="תמונת פרופיל" 
                    className="w-12 h-12 rounded-full mt-2"
                  />
                )}
              </div>
              <Button onClick={logout} variant="outline" className="w-full">
                התנתק
              </Button>
            </div>
          )}
          
          <div className="bg-gray-100 p-4 rounded-lg text-sm">
            <strong>סטטוס:</strong> {status}
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