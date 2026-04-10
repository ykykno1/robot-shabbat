import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState('בדיקה...');

  const testFirebaseConfig = () => {
    try {
      // Test if environment variables are available
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const appId = import.meta.env.VITE_FIREBASE_APP_ID;

      if (!apiKey || !projectId || !appId) {
        setFirebaseStatus('❌ חסרים מפתחות Firebase');
        return;
      }

      setFirebaseStatus(`✅ Firebase config נמצא:
      Project ID: ${projectId}
      App ID: ${appId}
      API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'חסר'}`);
    } catch (error) {
      setFirebaseStatus(`❌ שגיאה: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/logo.png" 
              alt="רובוט שבת" 
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold">רובוט שבת</h1>
          </div>
          <CardTitle className="text-2xl">בדיקת Firebase</CardTitle>
          <CardDescription>
            בודק את הגדרות Firebase
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button onClick={testFirebaseConfig} className="w-full">
            בדוק הגדרות Firebase
          </Button>
          
          <div className="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-line">
            {firebaseStatus}
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