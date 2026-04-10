import { useState } from 'react';

interface PricingPageProps {
  user: any;
}

export default function PricingPage({ user }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'חינמי',
      price: '₪0',
      period: 'לחודש',
      features: [
        '✓ ניהול סרטוני יוטיוב',
        '✓ עד 10 סרטונים',
        '✓ הסתרה ידנית בלבד',
        '✗ ללא תמיכה בפייסבוק',
        '✗ ללא אוטומציה'
      ],
      buttonText: 'התחל בחינם',
      buttonStyle: 'fb-btn-outline',
      current: user?.accountType === 'free'
    },
    {
      id: 'youtube_pro',
      name: 'יוטיוב פרו',
      price: selectedPlan === 'monthly' ? '₪29' : '₪290',
      period: selectedPlan === 'monthly' ? 'לחודש' : 'לשנה',
      popular: true,
      features: [
        '✓ ניהול סרטוני יוטיוב ללא הגבלה',
        '✓ הסתרה אוטומטית לפי זמני שבת',
        '✓ החזרה אוטומטית אחרי שבת',
        '✓ נעילת סרטונים חשובים',
        '✗ ללא תמיכה בפייסבוק'
      ],
      buttonText: 'שדרג עכשיו',
      buttonStyle: 'fb-btn-primary',
      current: user?.accountType === 'youtube_pro'
    },
    {
      id: 'premium',
      name: 'פרימיום',
      price: selectedPlan === 'monthly' ? '₪49' : '₪490',
      period: selectedPlan === 'monthly' ? 'לחודש' : 'לשנה',
      features: [
        '✓ כל התכונות של יוטיוב פרו',
        '✓ ניהול פוסטים בפייסבוק',
        '✓ תמיכה באינסטגרם (בקרוב)',
        '✓ תמיכה בטיקטוק (בקרוב)',
        '✓ תמיכה מועדפת'
      ],
      buttonText: 'שדרג לפרימיום',
      buttonStyle: 'fb-btn-secondary',
      current: user?.accountType === 'premium'
    }
  ];

  return (
    <div>
      <div className="fb-card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          בחר את התוכנית המתאימה לך
        </h1>
        <p style={{ color: 'var(--fb-text-light)', marginBottom: '2rem' }}>
          התחל בחינם או שדרג לתכונות מתקדמות
        </p>

        <div style={{ 
          display: 'inline-flex',
          background: 'var(--fb-background)',
          borderRadius: '8px',
          padding: '0.25rem',
          marginBottom: '2rem'
        }}>
          <button
            className={`fb-btn ${selectedPlan === 'monthly' ? 'fb-btn-primary' : 'fb-btn-outline'}`}
            style={{ marginLeft: '0.25rem' }}
            onClick={() => setSelectedPlan('monthly')}
          >
            תשלום חודשי
          </button>
          <button
            className={`fb-btn ${selectedPlan === 'yearly' ? 'fb-btn-primary' : 'fb-btn-outline'}`}
            onClick={() => setSelectedPlan('yearly')}
          >
            תשלום שנתי (חסוך 20%)
          </button>
        </div>
      </div>

      <div className="fb-grid fb-grid-3">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className="fb-card"
            style={{
              position: 'relative',
              border: plan.popular ? '2px solid var(--fb-primary)' : undefined,
              transform: plan.popular ? 'scale(1.05)' : undefined
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '50%',
                transform: 'translateX(50%)',
                background: 'var(--fb-primary)',
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                הכי פופולרי
              </div>
            )}

            {plan.current && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'var(--fb-success)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                התוכנית שלך
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {plan.name}
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--fb-primary)' }}>
                {plan.price}
                <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--fb-text-light)' }}>
                  /{plan.period}
                </span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
              {plan.features.map((feature, index) => (
                <li 
                  key={index}
                  style={{ 
                    padding: '0.5rem 0',
                    fontSize: '0.875rem',
                    color: feature.startsWith('✗') ? 'var(--fb-text-light)' : 'var(--fb-text)'
                  }}
                >
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`fb-btn ${plan.buttonStyle}`}
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={plan.current}
            >
              {plan.current ? 'התוכנית הנוכחית' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="fb-card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>שאלות נפוצות</h2>
        
        <div style={{ textAlign: 'right', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              האם אוכל לבטל בכל עת?
            </h4>
            <p style={{ color: 'var(--fb-text-light)', fontSize: '0.875rem' }}>
              כן! אתה יכול לבטל את המנוי שלך בכל עת ללא התחייבות.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              האם יש תקופת ניסיון?
            </h4>
            <p style={{ color: 'var(--fb-text-light)', fontSize: '0.875rem' }}>
              כן! אנו מציעים 7 ימי ניסיון בחינם לכל התוכניות בתשלום.
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              מה ההבדל בין יוטיוב פרו לפרימיום?
            </h4>
            <p style={{ color: 'var(--fb-text-light)', fontSize: '0.875rem' }}>
              יוטיוב פרו מיועד למי שמנהל רק ערוץ יוטיוב. פרימיום כולל תמיכה בכל הרשתות החברתיות.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}