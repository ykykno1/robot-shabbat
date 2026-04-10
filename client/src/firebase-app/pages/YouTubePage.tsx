import { useState, useEffect } from 'react';
import { useFirebaseApi } from '../hooks/useFirebaseApi';

interface YouTubePageProps {
  user: any;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  isHidden: boolean;
  isLocked: boolean;
}

export default function YouTubePage({ user }: YouTubePageProps) {
  const { get, post, loading, error } = useFirebaseApi();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connections = await get('/firebase/platforms/connections');
      setIsConnected(connections.youtube?.connected || false);
      
      if (connections.youtube?.connected) {
        loadVideos();
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const loadVideos = async () => {
    try {
      const data = await get('/firebase/youtube/videos');
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Error loading videos:', err);
    }
  };

  const handleConnect = async () => {
    try {
      const data = await post('/firebase/youtube/connect', {});
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Error connecting YouTube:', err);
    }
  };

  const handleToggleSelect = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.filter(v => !v.isLocked).length) {
      setSelectedVideos(new Set());
    } else {
      const allUnlocked = videos.filter(v => !v.isLocked).map(v => v.id);
      setSelectedVideos(new Set(allUnlocked));
    }
  };

  const handleHideVideos = async () => {
    try {
      const videoIds = Array.from(selectedVideos);
      const result = await post('/firebase/youtube/hide', { videoIds });
      
      if (result.success) {
        await loadVideos();
        setSelectedVideos(new Set());
      }
    } catch (err) {
      console.error('Error hiding videos:', err);
    }
  };

  const handleShowVideos = async () => {
    try {
      const videoIds = Array.from(selectedVideos);
      const result = await post('/firebase/youtube/show', { videoIds });
      
      if (result.success) {
        await loadVideos();
        setSelectedVideos(new Set());
      }
    } catch (err) {
      console.error('Error showing videos:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="fb-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📺</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>חבר את חשבון היוטיוב שלך</h2>
        <p style={{ color: 'var(--fb-text-light)', marginBottom: '2rem' }}>
          חבר את הערוץ שלך כדי לנהל את הסרטונים באופן אוטומטי
        </p>
        <button 
          className="fb-btn fb-btn-primary" 
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? <div className="fb-spinner"></div> : '🔗'}
          חבר חשבון יוטיוב
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="fb-card">
        <div className="fb-card-header">
          <h1 className="fb-card-title">ניהול סרטוני יוטיוב</h1>
          <p className="fb-card-description">
            בחר סרטונים להסתרה או הצגה
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="fb-btn fb-btn-outline"
            onClick={handleSelectAll}
          >
            {selectedVideos.size === videos.filter(v => !v.isLocked).length ? 'בטל בחירה' : 'בחר הכל'}
          </button>
          
          <button 
            className="fb-btn fb-btn-primary"
            onClick={handleHideVideos}
            disabled={selectedVideos.size === 0 || loading}
          >
            🙈 הסתר סרטונים ({selectedVideos.size})
          </button>
          
          <button 
            className="fb-btn fb-btn-secondary"
            onClick={handleShowVideos}
            disabled={selectedVideos.size === 0 || loading}
          >
            👁️ הצג סרטונים ({selectedVideos.size})
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="fb-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--fb-text-light)' }}>טוען סרטונים...</p>
        </div>
      )}

      {error && (
        <div className="fb-card" style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          color: '#dc2626' 
        }}>
          <p>שגיאה: {error}</p>
        </div>
      )}

      <div className="fb-grid fb-grid-2">
        {videos.map(video => (
          <div 
            key={video.id} 
            className={`fb-card ${video.isLocked ? 'opacity-60' : ''}`}
            style={{ cursor: video.isLocked ? 'not-allowed' : 'pointer' }}
            onClick={() => !video.isLocked && handleToggleSelect(video.id)}
          >
            <div style={{ display: 'flex', gap: '1rem' }}>
              <img 
                src={video.thumbnail} 
                alt={video.title}
                style={{ 
                  width: '120px', 
                  height: '90px', 
                  objectFit: 'cover',
                  borderRadius: '8px' 
                }}
              />
              
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {video.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {video.isLocked && (
                    <span className="fb-status" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      🔒 נעול
                    </span>
                  )}
                  {video.isHidden && (
                    <span className="fb-status fb-status-disconnected">
                      🙈 מוסתר
                    </span>
                  )}
                  {!video.isHidden && !video.isLocked && (
                    <span className="fb-status fb-status-connected">
                      👁️ גלוי
                    </span>
                  )}
                </div>
              </div>
              
              {!video.isLocked && (
                <div>
                  <input
                    type="checkbox"
                    checked={selectedVideos.has(video.id)}
                    onChange={() => {}}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}