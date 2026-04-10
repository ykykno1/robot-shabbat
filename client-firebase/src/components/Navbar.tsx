import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Home, Settings, Youtube, Facebook, LogOut, LogIn } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Navbar() {
  const { firebaseUser, signOut } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { path: "/", label: "בית", icon: Home },
    { path: "/youtube", label: "YouTube", icon: Youtube },
    { path: "/facebook", label: "Facebook", icon: Facebook },
    { path: "/settings", label: "הגדרות", icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2 space-x-reverse">
              <img src="/logo.png" alt="רובוט שבת 2" className="h-8 w-8" />
              <span className="font-bold text-xl text-firebase-orange">רובוט שבת 2</span>
            </a>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {firebaseUser && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a>
                    <Button
                      variant={isActive ? "firebase" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  </a>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Auth Button */}
            {firebaseUser ? (
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">התנתק</span>
              </Button>
            ) : (
              <Link href="/login">
                <a>
                  <Button
                    variant="firebase"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">התחבר</span>
                  </Button>
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}