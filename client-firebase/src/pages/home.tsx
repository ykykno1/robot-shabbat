import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Youtube, Facebook, Clock, Calendar, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  const { firebaseUser } = useAuth();

  const features = [
    {
      icon: Clock,
      title: "הסתרה אוטומטית",
      description: "התוכן שלך יוסתר אוטומטית לפני כניסת השבת"
    },
    {
      icon: Calendar,
      title: "זמני שבת מדויקים",
      description: "שילוב עם זמני כניסת ויציאת שבת לפי העיר שלך"
    },
    {
      icon: Shield,
      title: "פרטיות מלאה",
      description: "כל הנתונים שלך מאובטחים ומוגנים עם Firebase"
    },
    {
      icon: Sparkles,
      title: "שחזור אוטומטי",
      description: "התוכן שלך יחזור אוטומטית אחרי צאת השבת"
    }
  ];

  const platforms = [
    {
      icon: Youtube,
      name: "YouTube",
      description: "הסתר סרטונים ופלייליסטים",
      link: "/youtube",
      color: "text-red-600"
    },
    {
      icon: Facebook,
      name: "Facebook",
      description: "הסתר פוסטים ועמודים",
      link: "/facebook",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4 text-firebase-orange">
          רובוט שבת 2
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          גרסת Firebase - הסתרה ושחזור אוטומטיים של תוכן ברשתות החברתיות
        </p>
        {!firebaseUser && (
          <Link href="/login">
            <a>
              <Button size="lg" variant="firebase" className="text-lg px-8">
                התחל עכשיו
              </Button>
            </a>
          </Link>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Icon className="h-12 w-12 text-firebase-orange mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          );
        })}
      </section>

      {/* Platforms Section */}
      {firebaseUser && (
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">פלטפורמות נתמכות</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <Link key={index} href={platform.link}>
                  <a>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center mb-4">
                        <Icon className={`h-8 w-8 ${platform.color} mr-3`} />
                        <h3 className="text-xl font-semibold">{platform.name}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{platform.description}</p>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!firebaseUser && (
        <section className="bg-firebase-orange/10 p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">מוכנים להתחיל?</h2>
          <p className="text-lg mb-6">הצטרפו לאלפי משתמשים ששומרים שבת בקלות</p>
          <Link href="/login">
            <a>
              <Button size="lg" variant="firebase">
                הרשמה חינמית
              </Button>
            </a>
          </Link>
        </section>
      )}
    </div>
  );
}