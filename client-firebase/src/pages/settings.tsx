import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Crown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function SettingsPage() {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();
  const { toast } = useToast();
  
  const [shabbatCity, setShabbatCity] = useState(appUser?.shabbatCity || "");
  const [shabbatCityId, setShabbatCityId] = useState(appUser?.shabbatCityId || "");
  const [hideTimingPreference, setHideTimingPreference] = useState(
    appUser?.hideTimingPreference || "15min"
  );
  const [restoreTimingPreference, setRestoreTimingPreference] = useState(
    appUser?.restoreTimingPreference || "30min"
  );

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch('/api/firebase/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ההגדרות נשמרו בהצלחה",
        description: "השינויים שלך עודכנו",
      });
      refreshAppUser();
    },
    onError: () => {
      toast({
        title: "שגיאה בשמירת ההגדרות",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      shabbatCity,
      shabbatCityId,
      hideTimingPreference,
      restoreTimingPreference
    });
  };

  const timingOptions = [
    { value: "immediate", label: "מיד" },
    { value: "15min", label: "15 דקות" },
    { value: "30min", label: "30 דקות" },
    { value: "1hour", label: "שעה" }
  ];

  const cities = [
    { id: "281", name: "ירושלים" },
    { id: "293397", name: "תל אביב" },
    { id: "294801", name: "חיפה" },
    { id: "295530", name: "באר שבע" },
    { id: "293690", name: "רמת גן" },
    { id: "293962", name: "פתח תקווה" },
    { id: "293918", name: "נתניה" },
    { id: "294117", name: "אשדוד" },
    { id: "293825", name: "בני ברק" },
    { id: "293783", name: "חולון" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">הגדרות</h1>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>פרטי חשבון</CardTitle>
          <CardDescription>מידע על החשבון שלך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>אימייל</Label>
            <p className="text-gray-600 dark:text-gray-300">{appUser?.email}</p>
          </div>
          <div>
            <Label>שם משתמש</Label>
            <p className="text-gray-600 dark:text-gray-300">{appUser?.username}</p>
          </div>
          <div>
            <Label>סוג חשבון</Label>
            <div className="flex items-center gap-2">
              {appUser?.accountTier === 'premium' ? (
                <>
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">פרימיום</span>
                </>
              ) : (
                <span className="text-gray-600 dark:text-gray-300">חינמי</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shabbat Settings */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות שבת</CardTitle>
          <CardDescription>התאם את זמני ההסתרה והשחזור</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="city">עיר</Label>
            <Select value={shabbatCityId} onValueChange={(value) => {
              setShabbatCityId(value);
              const city = cities.find(c => c.id === value);
              if (city) setShabbatCity(city.name);
            }}>
              <SelectTrigger id="city">
                <SelectValue placeholder="בחר עיר" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hide-timing">זמן הסתרה לפני כניסת שבת</Label>
            <Select value={hideTimingPreference} onValueChange={setHideTimingPreference}>
              <SelectTrigger id="hide-timing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="restore-timing">זמן שחזור אחרי צאת שבת</Label>
            <Select value={restoreTimingPreference} onValueChange={setRestoreTimingPreference}>
              <SelectTrigger id="restore-timing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={updateSettingsMutation.isPending}
            variant="firebase"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            שמור הגדרות
          </Button>
        </CardContent>
      </Card>

      {/* Premium Upgrade */}
      {appUser?.accountTier !== 'premium' && (
        <Card className="border-firebase-orange">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-firebase-orange" />
              שדרג לפרימיום
            </CardTitle>
            <CardDescription>
              קבל גישה לכל התכונות המתקדמות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                הסתרה אוטומטית מלאה
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                תמיכה בכל הפלטפורמות
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                אין הגבלה על מספר פריטים
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                תמיכה מועדפת
              </li>
            </ul>
            <Button variant="firebase" className="w-full">
              שדרג עכשיו - ₪19.90 לחודש
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}