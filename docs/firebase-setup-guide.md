# Firebase Setup Guide for Shabbat Robot 2.0

## הגדרת Firebase Console

### שלב 1: הפעלת Google Authentication

1. היכנס ל-[Firebase Console](https://console.firebase.google.com/)
2. בחר בפרויקט שלך (yk-robot-shabat)
3. עבור ל-**Authentication** → **Sign-in method**
4. לחץ על **Google** ובחר **Enable**
5. הזן את האימייל שלך כ-Project support email
6. לחץ **Save**

### שלב 2: הוספת דומיינים מורשים

1. באותו עמוד, גלול למטה ל-**Authorized domains**
2. לחץ על **Add domain**
3. הוסף את הדומיינים הבאים:
   - `localhost`
   - `127.0.0.1`
   - `*.replit.app`
   - `*.replit.dev`
   - הדומיין הספציפי שלך (למשל: `social-media-scheduler-ykykyair.replit.app`)

### שלב 3: הפעלת Facebook Authentication (אופציונלי)

1. חזור ל-**Sign-in method**
2. לחץ על **Facebook** ובחר **Enable**
3. תצטרך להזין:
   - **App ID** מ-Facebook Developer Console
   - **App Secret** מ-Facebook Developer Console
4. העתק את ה-OAuth redirect URI שמוצג
5. הוסף אותו ב-Facebook Developer Console תחת **Valid OAuth Redirect URIs**

### שלב 4: בדיקת הגדרות

1. עבור ל-**Project settings** (גלגל שיניים)
2. בחר ב-**General** tab
3. וודא שה-Web app שלך מוגדר נכון
4. בדוק שכל ה-API keys תואמים למה שיש לך בסביבת הפיתוח

## פתרון בעיות נפוצות

### שגיאת "auth/invalid-credential"
- וודא שהפעלת את Google provider
- בדוק שהדומיין שלך נמצא ב-Authorized domains
- נסה לנקות cache של הדפדפן

### שגיאת "auth/popup-blocked"
- הדפדפן חוסם חלונות קופצים
- בקש מהמשתמש לאפשר pop-ups לאתר שלך

### שגיאת "auth/unauthorized-domain"
- הדומיין הנוכחי לא מורשה
- הוסף את הדומיין ל-Authorized domains ב-Firebase Console

## הגדרות נוספות (מתקדם)

### הגבלת דומיינים
כדי להגביל את השימוש באפליקציה רק לדומיינים מסוימים:
1. עבור ל-**Authentication** → **Settings**
2. תחת **Authorized domains**, הסר דומיינים לא רצויים
3. השאר רק את הדומיינים שאתה סומך עליהם

### הפעלת Multi-factor Authentication
1. עבור ל-**Authentication** → **Sign-in method**
2. לחץ על **Advanced** → **Multi-factor authentication**
3. בחר **Enable** והגדר לפי הצורך