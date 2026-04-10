import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Database, Shield, Cloud } from "lucide-react";
import { Link } from "wouter";

export default function FirebaseApp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 p-4 rounded-full">
                <Rocket className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">רובוט שבת 2 - Firebase Edition</CardTitle>
            <CardDescription className="text-lg mt-2">
              גרסה מתקדמת עם Firebase Authentication ו-Firestore Database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                מה זה רובוט שבת 2?
              </h3>
              <p className="text-gray-700">
                זו גרסה נפרדת לגמרי של רובוט שבת, בנויה מאפס עם טכנולוגיות Firebase מתקדמות. 
                האפליקציה משתמשת ב-Firebase Authentication להזדהות מאובטחת ו-Firestore לאחסון נתונים בענן.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  יתרונות Firebase
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• התחברות עם Google ו-Facebook מובנית</li>
                  <li>• סנכרון נתונים בזמן אמת</li>
                  <li>• אבטחה ברמה גבוהה</li>
                  <li>• ללא צורך בשרת SQL</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-purple-600" />
                  תכונות חדשות
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• ממשק משתמש מחודש</li>
                  <li>• ביצועים משופרים</li>
                  <li>• גיבוי אוטומטי בענן</li>
                  <li>• תמיכה בכמה משתמשים במקביל</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">הערה חשובה</h3>
              <p className="text-gray-700 mb-3">
                אפליקציית Firebase היא נפרדת לגמרי מהאפליקציה הראשית. 
                המשתמשים, ההגדרות והנתונים לא משותפים בין שתי האפליקציות.
              </p>
              <p className="text-sm text-gray-600">
                כדי להשתמש באפליקציית Firebase, צריך להגדיר פרויקט Firebase עם המפתחות המתאימים.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-center text-gray-600">
                <p className="mb-2">סטטוס: האפליקציה מוכנה לשימוש אבל דורשת הגדרת Firebase</p>
              </div>
              
              <div className="space-y-3">
                <Link href="/firebase-app">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    כניסה לרובוט שבת 2 - Firebase
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    חזרה לרובוט שבת הרגיל
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}