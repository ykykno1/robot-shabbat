import { Router } from 'express';
import { authenticateFirebaseApp } from './auth.routes';
import { firebaseDb } from '../../client/src/firebase-app/lib/firebase-db';
import fetch from 'node-fetch';

const router = Router();

// Get Shabbat locations
router.get('/firebase/shabbat/locations', async (req, res) => {
  try {
    const locations = await firebaseDb.getAllShabbatLocations();
    res.json(locations);
  } catch (error) {
    console.error('Failed to get locations:', error);
    res.status(500).json({ error: 'Failed to get locations' });
  }
});

// Get user's Shabbat location
router.get('/firebase/shabbat/user-location', authenticateFirebaseApp, async (req, res) => {
  try {
    const user = await firebaseDb.getUser(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.shabbatCityId) {
      const location = await firebaseDb.getShabbatLocation(user.shabbatCityId);
      res.json(location);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Failed to get user location:', error);
    res.status(500).json({ error: 'Failed to get user location' });
  }
});

// Update user's Shabbat location
router.put('/firebase/shabbat/user-location', authenticateFirebaseApp, async (req, res) => {
  try {
    const { cityId, city } = req.body;
    
    await firebaseDb.updateUser(req.user.uid, {
      shabbatCityId: cityId,
      shabbatCity: city,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get Shabbat times
router.get('/firebase/shabbat/times/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { date } = req.query;
    
    // Map Chabad city IDs to HebCal geoname IDs
    const cityToGeoname: Record<string, string> = {
      '531': '293397', // Tel Aviv
      '3000': '281184', // Jerusalem
      '675': '294801', // Haifa
      '803': '295530', // Beersheva
      '9': '293725', // Eilat
      // Add more mappings as needed
    };
    
    const geonameId = cityToGeoname[cityId] || '293397'; // Default to Tel Aviv
    
    const hebcalUrl = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${geonameId}${date ? `&date=${date}` : ''}`;
    
    const response = await fetch(hebcalUrl);
    const data = await response.json();
    
    // Extract candle lighting and havdalah times
    const candleLighting = data.items.find((item: any) => item.category === 'candles');
    const havdalah = data.items.find((item: any) => item.category === 'havdalah');
    
    res.json({
      cityId,
      date: data.date,
      parasha: data.items.find((item: any) => item.category === 'parashat')?.title,
      candleLighting: candleLighting ? {
        time: candleLighting.date,
        title: candleLighting.title,
      } : null,
      havdalah: havdalah ? {
        time: havdalah.date,
        title: havdalah.title,
      } : null,
    });
  } catch (error) {
    console.error('Failed to get Shabbat times:', error);
    res.status(500).json({ error: 'Failed to get Shabbat times' });
  }
});

// Update timing preferences
router.put('/firebase/shabbat/timing-preferences', authenticateFirebaseApp, async (req, res) => {
  try {
    const { hideTimingPreference, restoreTimingPreference } = req.body;
    
    await firebaseDb.updateUser(req.user.uid, {
      hideTimingPreference,
      restoreTimingPreference,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update timing preferences:', error);
    res.status(500).json({ error: 'Failed to update timing preferences' });
  }
});

export default router;