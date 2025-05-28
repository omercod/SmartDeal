const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(
  path.resolve(__dirname, "serviceAccountKey.json")
);

// אתחול Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// גישה למסד הנתונים
const db = admin.firestore();

// פונקציה ליצירת תאריך רנדומלי בטווח של 30 הימים האחרונים
const getRandomDateLastMonth = () => {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 30);
  const randomTime =
    past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
};

// ביקורות פיקטיביות
const fakeReviews = [
  {
    providerEmail: "talelzam97@gmail.com",
    reviewerEmail: "liat.perez@gmail.com",
    stars: 5,
    text: "טל פשוט הציל אותנו! הגור שלנו היה היפראקטיבי וקפץ על כל אחד שנכנס הביתה. אחרי סדרת מפגשים, ההתנהגות שלו השתפרה פלאים. ממליצה עליו בלב שלם!",
  },
  {
    providerEmail: "talelzam97@gmail.com",
    reviewerEmail: "shai.katz12@gmail.com",
    stars: 4,
    text: "טל סופר מקצועי והסביר לי בדיוק איך לתקשר עם הכלב שלי בצורה נכונה. יש לו גישה רגועה וסבלנית. חווית האילוף הייתה טובה מאוד.",
  },
  {
    providerEmail: "talelzam97@gmail.com",
    reviewerEmail: "vered23@gmail.com",
    stars: 5,
    text: "הגעתי לטל עם כלבה שמפחדת מכל רעש פתאומי. בעזרת כלים פשוטים ותמיכה רציפה, היא התחילה לצאת מהקונכייה שלה. תודה על הכל!",
  },
  {
    providerEmail: "talelzam97@gmail.com",
    reviewerEmail: "david.mor93@gmail.com",
    stars: 3,
    text: "האילוף עזר בחלק מהבעיות, אבל הרגשתי שהיה חסר קצת יותר התאמה אישית. טל היה נחמד ומקצועי, אולי פשוט לא הסגנון שחיפשתי.",
  },
];

// פונקציה להעלאת הביקורות
const uploadFakeReviews = async () => {
  for (const review of fakeReviews) {
    await db.collection("Reviews").add({
      ...review,
      createdAt: getRandomDateLastMonth(),
    });
  }
  console.log("✅ ביקורות פיקטיביות הוזנו בהצלחה");
};

uploadFakeReviews();
