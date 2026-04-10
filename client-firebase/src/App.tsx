import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

// Pages
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import SettingsPage from "@/pages/settings";
import YouTubePage from "@/pages/youtube";
import FacebookPage from "@/pages/facebook";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="robot-shabbat-2-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/login" component={LoginPage} />
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route path="/settings" component={SettingsPage} />
                  <Route path="/youtube" component={YouTubePage} />
                  <Route path="/facebook" component={FacebookPage} />
                  <Route>
                    <div className="text-center py-12">
                      <h1 className="text-4xl font-bold text-gray-800">404</h1>
                      <p className="text-gray-600 mt-2">הדף לא נמצא</p>
                    </div>
                  </Route>
                </Switch>
              </main>
            </div>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;