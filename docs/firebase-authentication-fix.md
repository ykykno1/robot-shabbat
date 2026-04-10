# תיקון בעיית Firebase Authentication

## הבעיה שזוהתה
שגיאה: `auth/api-key-not-valid.-please-pass-a-valid-api-key`

זה לא אומר שה-API Key שגוי, אלא שהשירות Authentication לא הופעל ב-Firebase Console.

## הפתרון - שלבים להפעלת Authentication

### שלב 1: הכנס ל-Firebase Console
1. לך לכתובת: https://console.firebase.google.com/
2. בחר בפרויקט "yk-robot-shabat"

### שלב 2: הפעל את שירות Authentication
1. בתפריט הצד השמאלי, לחץ על "Authentication"
2. אם רואה הודעה "Get started" - לחץ עליה
3. זה יפעיל את שירות Authentication לפרויקט

### שלב 3: הוסף Google Sign-In Provider
1. לחץ על טאב "Sign-in method" בחלק העליון
2. מצא "Google" ברשימת הספקים
3. לחץ על "Google" ואז על "Enable"
4. במייל התמיכה הכנס: support@robotshabat.com
5. לחץ "Save"

### שלב 4: הוסף Facebook Sign-In Provider (אופציונלי)
1. לחץ על "Facebook" ברשימת הספקים
2. לחץ על "Enable"
3. הכנס:
   - App ID: 1598261231562840
   - App secret: 1b188831e7febcaa0d75ae256b41366c
4. לחץ "Save"

### שלב 5: הוסף Domain מורשה
1. ב-Firebase Console, לך ל-Authentication > Settings
2. גלול למטה לחלק "Authorized domains"
3. לחץ על "Add domain"
4. הוסף את הכתובת הנוכחית:
   `6866a7b9-e37b-4ce0-b193-e54ab5171d02-00-1hjnl20rbozcm.janeway.replit.dev`
5. לחץ "Done"

### אלטרנטיבה - הוספה דרך Google Console:
1. לך ל-Google Cloud Console: https://console.cloud.google.com/
2. בחר את הפרויקט "project-700126700357"
3. לך ל-APIs & Services > Credentials
4. לחץ על OAuth 2.0 Client ID
5. הוסף ל-"Authorized JavaScript origins":
   - https://6866a7b9-e37b-4ce0-b193-e54ab5171d02-00-1hjnl20rbozcm.janeway.replit.dev
6. לחץ "Save"

## אחרי ההגדרה
חזור לדף Firebase Debug ונסה שוב - השגיאה צריכה להיעלם והאימות צריך לעבוד.

## ההסבר הטכני
Firebase דורש הפעלה מפורשת של כל שירות. גם אם ה-API Key נכון, אם השירות לא הופעל ב-Console, האימות לא יעבוד.