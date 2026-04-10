export default function FirebaseDirectPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Heebo, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          textAlign: 'center',
          color: '#333'
        }}>
          🚀 רובוט שבת 2 - Firebase
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#666'
        }}>
          אפליקציית Firebase נמצאת בפיתוח
        </p>

        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>המצב הנוכחי:</h3>
          <ul style={{ marginRight: '1.5rem', color: '#555' }}>
            <li>✅ הגדרת Firebase בוצעה</li>
            <li>✅ מפתחות API קיימים</li>
            <li>✅ אבל צריך להפעיל את Firebase Authentication ב-Console</li>
            <li>🔄 האפליקציה מוכנה לשימוש ברגע שתפעיל את השירותים</li>
          </ul>
        </div>

        <div style={{
          background: '#e3f2fd',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#1976d2' }}>איך להפעיל את Firebase?</h3>
          <ol style={{ marginRight: '1.5rem', color: '#555' }}>
            <li>היכנס ל-<a href="https://console.firebase.google.com/" target="_blank" style={{color: '#1976d2'}}>Firebase Console</a></li>
            <li>בחר בפרויקט <strong>yk-robot-shabat</strong></li>
            <li>הפעל את <strong>Authentication</strong></li>
            <li>הפעל את <strong>Firestore Database</strong></li>
            <li>הוסף את הדומיין שלנו ל-Authorized domains</li>
          </ol>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <a href="/firebase-app" style={{
            background: '#ff6b6b',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'inline-block',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
          }}>
            כניסה לאפליקציה
          </a>
          
          <a href="/" style={{
            background: '#f8f9fa',
            color: '#333',
            padding: '1rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'inline-block',
            border: '2px solid #dee2e6'
          }}>
            חזרה לרובוט שבת 1
          </a>
        </div>
      </div>
    </div>
  );
}