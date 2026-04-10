export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="fb-spinner" style={{ 
          width: '50px', 
          height: '50px', 
          borderWidth: '5px',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderTopColor: 'white',
          margin: '0 auto 1.5rem'
        }}></div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>רובוט שבת 2.0</h2>
        <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>טוען את האפליקציה...</p>
      </div>
    </div>
  );
}