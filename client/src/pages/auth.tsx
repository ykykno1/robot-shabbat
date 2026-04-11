import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({ title: "שגיאה", description: "נא למלא את כל השדות", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("auth_token", userData.token);
        const { token, ...userWithoutToken } = userData;
        queryClient.setQueryData(["/api/user"], userWithoutToken);
        toast({ title: "התחברת בהצלחה", description: `ברוך הבא, ${userData.username || userData.email}` });
        setLocation("/");
      } else {
        const err = await response.json();
        toast({ title: "שגיאה בהתחברות", description: err.error || "נסה שוב", variant: "destructive" });
      }
    } catch {
      toast({ title: "שגיאה", description: "בדוק את החיבור לאינטרנט", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, username, password, confirmPassword } = registerData;
    if (!email || !username || !password || !confirmPassword) {
      toast({ title: "שגיאה", description: "נא למלא את כל השדות", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "שגיאה", description: "הסיסמאות אינן תואמות", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "שגיאה", description: "הסיסמה חייבת להכיל לפחות 6 תווים", variant: "destructive" });
      return;
    }
    if (username.length < 3) {
      toast({ title: "שגיאה", description: "שם המשתמש חייב להכיל לפחות 3 תווים", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("auth_token", userData.token);
        const { token, ...userWithoutToken } = userData;
        queryClient.setQueryData(["/api/user"], userWithoutToken);
        toast({ title: "נרשמת בהצלחה!", description: `ברוך הבא, ${userData.username}` });
        setLocation("/");
      } else {
        const err = await response.json();
        toast({ title: "שגיאה ברישום", description: err.error || "נסה שוב", variant: "destructive" });
      }
    } catch {
      toast({ title: "שגיאה", description: "בדוק את החיבור לאינטרנט", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🤖 רובוט שבת</CardTitle>
          <CardDescription className="text-center">התחבר או הרשם כדי להתחיל</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">התחברות</TabsTrigger>
              <TabsTrigger value="register">הרשמה</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">אימייל</Label>
                  <Input id="login-email" type="email" value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">סיסמה</Label>
                  <Input id="login-password" type="password" value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="הכנס את הסיסמה שלך" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <LogIn className="ml-2 h-4 w-4" />
                  {isLoading ? "מתחבר..." : "התחבר"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">אימייל</Label>
                  <Input id="register-email" type="email" value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-username">שם משתמש</Label>
                  <Input id="register-username" type="text" value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="לפחות 3 תווים" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">סיסמה</Label>
                  <Input id="register-password" type="password" value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="לפחות 6 תווים" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">אימות סיסמה</Label>
                  <Input id="register-confirm" type="password" value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="חזור על הסיסמה" required />
                  {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                    <p className="text-red-500 text-sm">הסיסמאות אינן תואמות</p>
                  )}
                </div>
                <Button type="submit" className="w-full"
                  disabled={isLoading || (!!registerData.confirmPassword && registerData.password !== registerData.confirmPassword)}>
                  <UserPlus className="ml-2 h-4 w-4" />
                  {isLoading ? "נרשם..." : "הרשם"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
