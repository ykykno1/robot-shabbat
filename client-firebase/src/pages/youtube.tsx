import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Youtube, Lock, Unlock, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { youtubeApi } from "@/lib/api";

export default function YouTubePage() {
  const { firebaseUser, appUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  // Check YouTube connection
  const { data: isConnected, isLoading: checkingConnection } = useQuery({
    queryKey: ['/api/firebase/youtube/check'],
    enabled: !!firebaseUser,
  });

  // Fetch YouTube videos
  const { data: videos, isLoading: loadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ['/api/firebase/youtube/videos'],
    enabled: !!isConnected,
  });

  // Connect to YouTube
  const connectMutation = useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      const response = await fetch('/api/firebase/youtube/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect YouTube');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "התחברת בהצלחה ל-YouTube",
        description: "הסרטונים שלך נטענים...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/firebase/youtube/check'] });
      queryClient.invalidateQueries({ queryKey: ['/api/firebase/youtube/videos'] });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בהתחברות",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Hide/Restore videos
  const actionMutation = useMutation({
    mutationFn: async ({ action, videoIds }: { action: 'hide' | 'restore', videoIds: string[] }) => {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`/api/firebase/youtube/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoIds })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} videos`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'hide' ? "הסרטונים הוסתרו" : "הסרטונים שוחזרו",
        description: `${variables.videoIds.length} סרטונים עודכנו בהצלחה`,
      });
      refetchVideos();
      setSelectedVideos(new Set());
    },
    onError: (error, variables) => {
      toast({
        title: `שגיאה ב${variables.action === 'hide' ? 'הסתרת' : 'שחזור'} סרטונים`,
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleToggleVideo = (videoId: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId);
    } else {
      newSelection.add(videoId);
    }
    setSelectedVideos(newSelection);
  };

  const handleSelectAll = () => {
    if (videos && selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos?.map((v: any) => v.id) || []));
    }
  };

  if (!isConnected && !checkingConnection) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <Youtube className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <CardTitle>התחבר ל-YouTube</CardTitle>
            <CardDescription>
              חבר את הערוץ שלך כדי להסתיר ולשחזר סרטונים אוטומטית
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
                <Youtube className="mr-2 h-4 w-4" />
              )}
              התחבר עם YouTube
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
          <Youtube className="h-8 w-8 text-red-600" />
          ניהול YouTube
        </h1>
        <Button
          onClick={() => refetchVideos()}
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
            בחר סרטונים ובצע פעולות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleSelectAll}
              variant="outline"
            >
              {selectedVideos.size === videos?.length ? 'בטל בחירה' : 'בחר הכל'}
            </Button>
            <Button
              onClick={() => actionMutation.mutate({ action: 'hide', videoIds: Array.from(selectedVideos) })}
              disabled={selectedVideos.size === 0 || actionMutation.isPending}
              variant="destructive"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              הסתר נבחרים ({selectedVideos.size})
            </Button>
            <Button
              onClick={() => actionMutation.mutate({ action: 'restore', videoIds: Array.from(selectedVideos) })}
              disabled={selectedVideos.size === 0 || actionMutation.isPending}
            >
              <Eye className="h-4 w-4 mr-2" />
              שחזר נבחרים ({selectedVideos.size})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Videos List */}
      {loadingVideos ? (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>טוען סרטונים...</p>
          </CardContent>
        </Card>
      ) : videos && videos.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>הסרטונים שלך</CardTitle>
            <CardDescription>
              {videos.length} סרטונים בערוץ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {videos.map((video: any) => (
                <div
                  key={video.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVideos.has(video.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''
                  }`}
                  onClick={() => handleToggleVideo(video.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(video.publishedAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {video.locked && (
                        <Lock className="h-4 w-4 text-gray-500" title="נעול" />
                      )}
                      {video.privacyStatus === 'private' ? (
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
            <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">אין סרטונים בערוץ</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}