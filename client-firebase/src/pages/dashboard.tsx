import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Youtube, Facebook, Settings, Calendar, Clock, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { appUser } = useAuth();

  // Fetch user's connections status
  const { data: connections } = useQuery({
    queryKey: ['/api/firebase/connections'],
    enabled: !!appUser,
  });

  // Fetch user's recent history
  const { data: history } = useQuery({
    queryKey: ['/api/firebase/history'],
    enabled: !!appUser,
  });

  const stats = [
    {
      title: "חשבון",
      value: appUser?.accountTier === 'premium' ? 'פרימיום' : 'חינמי',
      icon: Shield,
      color: appUser?.accountTier === 'premium' ? 'text-yellow-600' : 'text-gray-600'
    },
    {
      title: "פלטפורמות מחוברות",
      value: connections ? Object.values(connections).filter(Boolean).length : 0,
      icon: Settings,
      color: 'text-blue-600'
    },
    {
      title: "פעולות השבוע",
      value: history ? history.filter((h: any) => 
        new Date(h.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length : 0,
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: "עיר שבת",
      value: appUser?.shabbatCity || 'לא הוגדר',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: "YouTube",
      description: connections?.youtube ? "מחובר - נהל סרטונים" : "התחבר לערוץ שלך",
      icon: Youtube,
      link: "/youtube",
      connected: !!connections?.youtube,
      color: "text-red-600"
    },
    {
      title: "Facebook",
      description: connections?.facebook ? "מחובר - נהל פוסטים" : "התחבר לחשבון שלך",
      icon: Facebook,
      link: "/facebook",
      connected: !!connections?.facebook,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold mb-2">
          שלום {appUser?.username || 'משתמש'} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          ברוך הבא לרובוט שבת 2 - גרסת Firebase
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">פעולות מהירות</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.link}>
                <a>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-6 w-6 ${action.color}`} />
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          action.connected ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    </CardHeader>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      {history && history.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">פעילות אחרונה</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {history.slice(0, 5).map((entry: any) => (
                  <div key={entry.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {entry.action === 'hide' ? 'הסתרה' : entry.action === 'restore' ? 'שחזור' : entry.action}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.platform} - {entry.itemCount} פריטים
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* CTA for Free Users */}
      {appUser?.accountTier === 'free' && (
        <section className="bg-firebase-orange/10 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">שדרג לפרימיום</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            קבל גישה להסתרה אוטומטית, יותר פלטפורמות ותמיכה מועדפת
          </p>
          <Link href="/settings">
            <a>
              <Button variant="firebase">שדרג עכשיו</Button>
            </a>
          </Link>
        </section>
      )}
    </div>
  );
}