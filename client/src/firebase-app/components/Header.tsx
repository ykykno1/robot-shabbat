import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase-client';

interface HeaderProps {
  user: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
  currentPage: string;
  onNavigate: (page: any) => void;
}

export default function Header({ user, currentPage, onNavigate }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('firebase_app_token');
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: '🏠' },
    { id: 'youtube', label: 'יוטיוב', icon: '📺' },
    { id: 'facebook', label: 'פייסבוק', icon: '👥' },
    { id: 'settings', label: 'הגדרות', icon: '⚙️' },
    { id: 'history', label: 'היסטוריה', icon: '📜' },
    { id: 'pricing', label: 'מחירים', icon: '💳' },
  ];

  return (
    <header className="fb-header">
      <div className="fb-header-content">
        <div className="fb-logo">
          <div className="fb-logo-icon">🤖</div>
          <span>רובוט שבת 2.0</span>
        </div>
        
        <nav className="fb-nav">
          {navItems.map(item => (
            <a
              key={item.id}
              href="#"
              className={`fb-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
              <span style={{ marginLeft: '0.5rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
          
          <div style={{ marginRight: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            )}
            <span>{user.displayName || user.email}</span>
            <button className="fb-btn fb-btn-outline" onClick={handleLogout}>
              יציאה
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}