import { useState, useEffect } from 'react';
import { useFirebaseApi } from '../hooks/useFirebaseApi';

interface FacebookPageProps {
  user: any;
}

export default function FacebookPage({ user }: FacebookPageProps) {
  const { get, post, loading, error } = useFirebaseApi();
  const [isConnected, setIsConnected] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connections = await get('/firebase/platforms/connections');
      setIsConnected(connections.facebook?.connected || false);
      
      if (connections.facebook?.connected) {
        // TODO: Load posts when API is ready
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const handleConnect = async () => {
    try {
      const data = await post('/firebase/facebook/connect', {});
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Error connecting Facebook:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="fb-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>חבר את חשבון הפייסבוק שלך</h2>
        <p style={{ color: 'var(--fb-text-light)', marginBottom: '2rem' }}>
          חבר את החשבון שלך כדי לנהל את הפוסטים באופן אוטומטי
        </p>
        <button 
          className="fb-btn fb-btn-primary" 
          onClick={handleConnect}
          disabled={loading}
          style={{ background: '#1877f2' }}
        >
          {loading ? <div className="fb-spinner"></div> : '🔗'}
          חבר חשבון פייסבוק
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="fb-card">
        <div className="fb-card-header">
          <h1 className="fb-card-title">ניהול פוסטים בפייסבוק</h1>
          <p className="fb-card-description">
            בחר פוסטים להסתרה או הצגה
          </p>
        </div>

        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#856404', fontSize: '0.875rem' }}>
            ⚠️ שים לב: ניהול פוסטים בפייסבוק מוגבל בגלל מגבלות API של פייסבוק.
            כרגע ניתן לנהל רק פוסטים אישיים ולא פוסטים של דפים עסקיים.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="fb-btn fb-btn-outline"
            disabled={posts.length === 0}
          >
            בחר הכל
          </button>
          
          <button 
            className="fb-btn fb-btn-primary"
            style={{ background: '#1877f2' }}
            disabled={selectedPosts.size === 0}
          >
            🙈 הסתר פוסטים ({selectedPosts.size})
          </button>
          
          <button 
            className="fb-btn fb-btn-secondary"
            disabled={selectedPosts.size === 0}
          >
            👁️ הצג פוסטים ({selectedPosts.size})
          </button>
        </div>
      </div>

      {posts.length === 0 && !loading && (
        <div className="fb-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--fb-text-light)' }}>
            אין פוסטים זמינים לניהול
          </p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="fb-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--fb-text-light)' }}>טוען פוסטים...</p>
        </div>
      )}
    </div>
  );
}