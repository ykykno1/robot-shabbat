import { useState } from 'react';
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithEmail,
  signUpWithEmail 
} from '../lib/firebase-client';

export default function LoginPage() {
  console.log('Firebase LoginPage loaded!');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Starting ${provider} authentication...`);
      
      if (provider === 'google') {
        const result = await signInWithGoogle();
        console.log('Google sign-in successful:', result.user.email);
      } else {
        const result = await signInWithFacebook();
        console.log('Facebook sign-in successful:', result.user.email);
      }
    } catch (err: any) {
      console.error(`${provider} authentication error:`, err);
      
      // הוסף הסבר מפורט לשגיאות נפוצות
      if (err.code === 'auth/invalid-credential') {
        setError('שגיאת הגדרות: יש להפעיל את Google Authentication ב-Firebase Console');
      } else if (err.code === 'auth/popup-blocked') {
        setError('הדפדפן חסם את חלון ההתחברות. אנא אפשר חלונות קופצים לאתר זה');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('הדומיין הנוכחי לא מורשה. יש להוסיף אותו ב-Firebase Console');
      } else {
        setError(err.message || 'שגיאה בהתחברות');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      padding: '1rem'
    }}>
      <div className="fb-card" style={{ 
        maxWidth: '400px', 
        width: '100%',
        padding: '2.5rem',
        borderRadius: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
          }}>
            🤖
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--fb-text)' }}>
            רובוט שבת 2.0
          </h1>
          <p style={{ color: 'var(--fb-text-light)', marginTop: '0.5rem' }}>
            מעכשיו אפשר לשמור שבת גם בדיגיטל
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            color: '#dc2626',
            fontSize: '0.875rem'
          }}>
            {error}
            {error.includes('auth/invalid-credential') && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', textAlign: 'right' }}>
                <strong>כדי לתקן את השגיאה:</strong>
                <ol style={{ marginTop: '0.25rem', marginRight: '1.5rem' }}>
                  <li>היכנס ל-<a href="https://console.firebase.google.com/" target="_blank" style={{color: 'inherit'}}>Firebase Console</a></li>
                  <li>בחר בפרויקט <strong>yk-robot-shabat</strong></li>
                  <li>לך ל-<strong>Authentication</strong> → <strong>Sign-in method</strong></li>
                  <li>לחץ על <strong>Google</strong> ולחץ <strong>Enable</strong></li>
                  <li>הזן את האימייל שלך ב-<strong>Project support email</strong></li>
                  <li>לחץ <strong>Save</strong></li>
                  <li>גלול למטה ל-<strong>Authorized domains</strong></li>
                  <li>הוסף: <strong>{window.location.hostname}</strong></li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            className="fb-btn fb-btn-primary"
            style={{ width: '100%', marginBottom: '0.75rem', justifyContent: 'center' }}
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '16px' }} />
            התחבר עם Google
          </button>
          
          <button
            className="fb-btn fb-btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
          >
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" style={{ width: '16px' }} />
            התחבר עם Facebook
          </button>
        </div>

        <div style={{ 
          textAlign: 'center', 
          margin: '1.5rem 0',
          position: 'relative'
        }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--fb-border)' }} />
          <span style={{
            background: 'white',
            padding: '0 1rem',
            position: 'absolute',
            top: '50%',
            right: '50%',
            transform: 'translate(50%, -50%)',
            color: 'var(--fb-text-light)',
            fontSize: '0.875rem'
          }}>
            או
          </span>
        </div>

        <form onSubmit={handleEmailAuth}>
          <div className="fb-form-group">
            <label className="fb-label">אימייל</label>
            <input
              type="email"
              className="fb-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="fb-form-group">
            <label className="fb-label">סיסמה</label>
            <input
              type="password"
              className="fb-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="fb-btn fb-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="fb-spinner" style={{ width: '16px', height: '16px' }}></div>
                {isSignUp ? 'נרשם...' : 'מתחבר...'}
              </>
            ) : (
              isSignUp ? 'הרשמה' : 'כניסה'
            )}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          color: 'var(--fb-text-light)',
          fontSize: '0.875rem'
        }}>
          {isSignUp ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}{' '}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{ 
              color: 'var(--fb-primary)', 
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          >
            {isSignUp ? 'התחבר' : 'הרשם עכשיו'}
          </button>
        </p>
      </div>
    </div>
  );
}