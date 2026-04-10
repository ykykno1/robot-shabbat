import { useState, useEffect } from 'react';
import { useFirebaseApi } from '../hooks/useFirebaseApi';

interface SettingsPageProps {
  user: any;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const { get, put, loading } = useFirebaseApi();
  const [settings, setSettings] = useState({
    shabbatCity: '',
    shabbatCityId: 0,
    hideTimingPreference: '15min',
    restoreTimingPreference: '30min'
  });
  const [locations, setLocations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserSettings();
    loadLocations();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userInfo = await get('/firebase/user/info');
      setSettings({
        shabbatCity: userInfo.shabbatCity || '',
        shabbatCityId: userInfo.shabbatCityId || 0,
        hideTimingPreference: userInfo.hideTimingPreference || '15min',
        restoreTimingPreference: userInfo.restoreTimingPreference || '30min'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await get('/firebase/shabbat-locations');
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await put('/firebase/user/settings', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const timingOptions = [
    { value: 'immediate', label: 'מיידית' },
    { value: '5min', label: '5 דקות' },
    { value: '10min', label: '10 דקות' },
    { value: '15min', label: '15 דקות' },
    { value: '30min', label: '30 דקות' },
    { value: '1hour', label: 'שעה' },
  ];

  return (
    <div>
      <div className="fb-card">
        <div className="fb-card-header">
          <h1 className="fb-card-title">הגדרות</h1>
          <p className="fb-card-description">
            הגדר את העדפות השבת שלך
          </p>
        </div>

        <div className="fb-form-group">
          <label className="fb-label">עיר</label>
          <select
            className="fb-input"
            value={settings.shabbatCityId}
            onChange={(e) => {
              const cityId = Number(e.target.value);
              const city = locations.find(l => l.id === cityId);
              setSettings({
                ...settings,
                shabbatCityId: cityId,
                shabbatCity: city?.name || ''
              });
            }}
          >
            <option value={0}>בחר עיר</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="fb-form-group">
          <label className="fb-label">כמה זמן לפני כניסת שבת להסתיר תוכן?</label>
          <select
            className="fb-input"
            value={settings.hideTimingPreference}
            onChange={(e) => setSettings({ ...settings, hideTimingPreference: e.target.value })}
          >
            {timingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="fb-form-group">
          <label className="fb-label">כמה זמן אחרי צאת שבת להחזיר תוכן?</label>
          <select
            className="fb-input"
            value={settings.restoreTimingPreference}
            onChange={(e) => setSettings({ ...settings, restoreTimingPreference: e.target.value })}
          >
            {timingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="fb-btn fb-btn-primary"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <>
              <div className="fb-spinner"></div>
              שומר...
            </>
          ) : (
            <>
              💾 שמור הגדרות
            </>
          )}
        </button>
      </div>

      <div className="fb-card" style={{ marginTop: '1.5rem' }}>
        <div className="fb-card-header">
          <h2 className="fb-card-title">אזור מסוכן ⚠️</h2>
        </div>
        
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
            פעולות אלו הן בלתי הפיכות. אנא היה בטוח לפני ביצוען.
          </p>
        </div>

        <button className="fb-btn fb-btn-danger">
          🗑️ מחק את כל הנתונים שלי
        </button>
      </div>
    </div>
  );
}