import { useState, useEffect } from 'react';
import { useFirebaseApi } from '../hooks/useFirebaseApi';

interface HistoryPageProps {
  user: any;
}

interface HistoryEntry {
  id: string;
  action: string;
  platform: string;
  itemCount?: number;
  status: 'success' | 'failure';
  timestamp: any;
  details?: any;
}

export default function HistoryPage({ user }: HistoryPageProps) {
  const { get, loading } = useFirebaseApi();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await get('/firebase/history');
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'hide_videos': 'הסתרת סרטונים',
      'restore_videos': 'החזרת סרטונים',
      'hide_posts': 'הסתרת פוסטים',
      'restore_posts': 'החזרת פוסטים',
    };
    return labels[action] || action;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'youtube': '📺',
      'facebook': '👥',
      'instagram': '📷',
      'tiktok': '🎵',
    };
    return icons[platform] || '📱';
  };

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('he-IL') + ' ' + date.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="fb-card">
        <div className="fb-card-header">
          <h1 className="fb-card-title">היסטוריית פעולות</h1>
          <p className="fb-card-description">
            כל הפעולות שבוצעו בחשבון שלך
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="fb-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--fb-text-light)' }}>טוען היסטוריה...</p>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="fb-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--fb-text-light)' }}>
            אין פעולות בהיסטוריה עדיין
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {history.map((entry) => (
          <div key={entry.id} className="fb-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                fontSize: '2rem',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--fb-background)',
                borderRadius: '8px'
              }}>
                {getPlatformIcon(entry.platform)}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {getActionLabel(entry.action)}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--fb-text-light)' }}>
                  {entry.itemCount !== undefined && `${entry.itemCount} פריטים • `}
                  {formatDate(entry.timestamp)}
                </p>
              </div>
              
              <span className={`fb-status ${entry.status === 'success' ? 'fb-status-connected' : 'fb-status-disconnected'}`}>
                {entry.status === 'success' ? '✓ הצליח' : '✗ נכשל'}
              </span>
            </div>
            
            {entry.details?.errors && entry.details.errors.length > 0 && (
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#dc2626'
              }}>
                {entry.details.errors.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}