import { useState, useEffect } from 'react';
import { useFirebaseApi } from '../hooks/useFirebaseApi';

interface DashboardPageProps {
  user: {
    email: string | null;
    displayName: string | null;
  };
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const { get } = useFirebaseApi();
  const [stats, setStats] = useState({
    youtube: { connected: false, videos: 0 },
    facebook: { connected: false, posts: 0 },
    nextHide: null as Date | null,
    accountType: 'free'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('Loading Firebase dashboard data...');
      const [userInfo, connections] = await Promise.all([
        get('/firebase/user/info'),
        get('/firebase/platforms/connections')
      ]);
      console.log('Dashboard data loaded:', { userInfo, connections });

      setStats({
        youtube: connections.youtube || { connected: false, videos: 0 },
        facebook: connections.facebook || { connected: false, posts: 0 },
        nextHide: userInfo.nextHideTime ? new Date(userInfo.nextHideTime) : null,
        accountType: userInfo.accountType || 'free'
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default stats if API call fails
      setStats({
        youtube: { connected: false, videos: 0 },
        facebook: { connected: false, posts: 0 },
        nextHide: null,
        accountType: 'free'
      });
    }
  };

  const platforms = [
    {
      id: 'youtube',
      name: 'יוטיוב',
      icon: '📺',
      color: '#ff0000',
      connected: stats.youtube.connected,
      items: stats.youtube.videos,
      itemType: 'סרטונים'
    },
    {
      id: 'facebook',
      name: 'פייסבוק',
      icon: '👥',
      color: '#1877f2',
      connected: stats.facebook.connected,
      items: stats.facebook.posts,
      itemType: 'פוסטים'
    },
    {
      id: 'instagram',
      name: 'אינסטגרם',
      icon: '📷',
      color: '#e4405f',
      connected: false,
      items: 0,
      itemType: 'תמונות',
      comingSoon: true
    },
    {
      id: 'tiktok',
      name: 'טיקטוק',
      icon: '🎵',
      color: '#000000',
      connected: false,
      items: 0,
      itemType: 'סרטונים',
      comingSoon: true
    }
  ];

  return (
    <div>
      <div className="fb-card">
        <div className="fb-card-header">
          <h1 className="fb-card-title">שלום {user.displayName || user.email} 👋</h1>
          <p className="fb-card-description">
            ברוך הבא לרובוט שבת 2.0 - כאן תוכל לנהל את התוכן שלך ברשתות החברתיות
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--fb-background)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>👤</span>
              <span style={{ fontWeight: '600' }}>סוג חשבון</span>
            </div>
            <span className={`fb-status ${stats.accountType === 'premium' ? 'fb-status-connected' : 'fb-status-disconnected'}`}>
              {stats.accountType === 'premium' ? 'פרימיום' : 'חינמי'}
            </span>
          </div>
          
          {stats.nextHide && (
            <div style={{ background: 'var(--fb-background)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⏰</span>
                <span style={{ fontWeight: '600' }}>הסתרה הבאה</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--fb-text-light)' }}>
                {stats.nextHide.toLocaleDateString('he-IL')} בשעה {stats.nextHide.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>הרשתות החברתיות שלך</h2>
      
      <div className="fb-grid fb-grid-2">
        {platforms.map(platform => (
          <div key={platform.id} className={`fb-platform-card ${platform.id}`}>
            <div className="fb-platform-icon" style={{ backgroundColor: platform.color + '20' }}>
              <span style={{ fontSize: '2.5rem' }}>{platform.icon}</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '700' }}>
              {platform.name}
            </h3>
            
            {platform.comingSoon ? (
              <div>
                <span className="fb-status" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                  בקרוב
                </span>
              </div>
            ) : (
              <div>
                <span className={`fb-status ${platform.connected ? 'fb-status-connected' : 'fb-status-disconnected'}`}>
                  {platform.connected ? 'מחובר' : 'לא מחובר'}
                </span>
                {platform.connected && (
                  <p style={{ marginTop: '0.5rem', color: 'var(--fb-text-light)', fontSize: '0.875rem' }}>
                    {platform.items} {platform.itemType}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fb-card" style={{ marginTop: '2rem' }}>
        <div className="fb-card-header">
          <h2 className="fb-card-title">איך זה עובד? 🤔</h2>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>1️⃣</span>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>חבר את הרשתות החברתיות</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--fb-text-light)' }}>
                חבר את חשבונות היוטיוב והפייסבוק שלך לרובוט שבת
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>2️⃣</span>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>הגדר את ההעדפות שלך</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--fb-text-light)' }}>
                בחר איזה תוכן להסתיר ומתי - לפני כניסת שבת או חג
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>3️⃣</span>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>הרובוט עושה את העבודה</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--fb-text-light)' }}>
                הרובוט יסתיר ויחזיר את התוכן באופן אוטומטי בזמנים שהגדרת
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}