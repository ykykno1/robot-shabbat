import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Facebook, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { facebookProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function FacebookPage() {
  const { firebaseUser, appUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  // Check Facebook connection
  const { data: isConnected, isLoading: checkingConnection } = useQuery({
    queryKey: ['/api/firebase/facebook/check'],
    enabled: !!firebaseUser,
  });

  // Fetch Facebook posts
  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['/api/firebase/facebook/posts'],
    enabled: !!isConnected,
  });

  // Connect to Facebook
  const connectMutation = useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, facebookProvider);
      const token = await result.user.getIdToken();
      
      const response = await fetch('/api/firebase/facebook/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect Facebook');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "התחברת בהצלחה ל-Facebook",
        description: "הפוסטים שלך נטענים...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/firebase/facebook/check'] });
      queryClient.invalidateQueries({ queryKey: ['/api/firebase/facebook/posts'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהתחברות",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Hide/Restore posts
  const actionMutation = useMutation({
    mutationFn: async ({ action, postIds }: { action: 'hide' | 'restore', postIds: string[] }) => {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`/api/firebase/facebook/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} posts`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'hide' ? "הפוסטים הוסתרו" : "הפוסטים שוחזרו",
        description: `${variables.postIds.length} פוסטים עודכנו בהצלחה`,
      });
      refetchPosts();
      setSelectedPosts(new Set());
    },
    onError: (error, variables) => {
      toast({
        title: `שגיאה ב${variables.action === 'hide' ? 'הסתרת' : 'שחזור'} פוסטים`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTogglePost = (postId: string) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPosts(newSelection);
  };

  const handleSelectAll = () => {
    if (posts && selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts?.map((p: any) => p.id) || []));
    }
  };

  if (!isConnected && !checkingConnection) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Facebook className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <CardTitle>התחבר ל-Facebook</CardTitle>
            <CardDescription>
              חבר את הפרופיל שלך כדי להסתיר ולשחזר פוסטים אוטומטית
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
              variant="firebase"
              size="lg"
            >
              {connectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Facebook className="mr-2 h-4 w-4" />
              )}
              התחבר עם Facebook
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Facebook className="h-8 w-8 text-blue-600" />
          ניהול Facebook
        </h1>
        <Button
          onClick={() => refetchPosts()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          רענן
        </Button>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
          <CardDescription>
            בחר פוסטים ובצע פעולות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleSelectAll}
              variant="outline"
            >
              {selectedPosts.size === posts?.length ? 'בטל בחירה' : 'בחר הכל'}
            </Button>
            <Button
              onClick={() => actionMutation.mutate({ action: 'hide', postIds: Array.from(selectedPosts) })}
              disabled={selectedPosts.size === 0 || actionMutation.isPending}
              variant="destructive"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              הסתר נבחרים ({selectedPosts.size})
            </Button>
            <Button
              onClick={() => actionMutation.mutate({ action: 'restore', postIds: Array.from(selectedPosts) })}
              disabled={selectedPosts.size === 0 || actionMutation.isPending}
            >
              <Eye className="h-4 w-4 mr-2" />
              שחזר נבחרים ({selectedPosts.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {loadingPosts ? (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>טוען פוסטים...</p>
          </CardContent>
        </Card>
      ) : posts && posts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>הפוסטים שלך</CardTitle>
            <CardDescription>
              {posts.length} פוסטים בפרופיל
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPosts.has(post.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''
                  }`}
                  onClick={() => handleTogglePost(post.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        {post.message || post.story || 'פוסט ללא טקסט'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(post.created_time).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.is_hidden ? (
                        <EyeOff className="h-4 w-4 text-red-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">אין פוסטים בפרופיל</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}