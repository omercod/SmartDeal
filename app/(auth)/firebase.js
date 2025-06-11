// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// קונפיגורציית Firebase שלך
const firebaseConfig = {
  apiKey: "AIzaSyBGElkEZVHlBnfTw_cTHkNj3-W1c7oZf7I",
  authDomain: "smartdealnew.firebaseapp.com",
  projectId: "smartdealnew",
  storageBucket: "smartdealnew.firebasestorage.app",
  messagingSenderId: "204079439771",
  appId: "1:204079439771:web:4cc3880e15b959862fcb3e",
};

const app = initializeApp(firebaseConfig);

let auth;

if (process.env.JEST_WORKER_ID) {
  // אם רץ ב-Jest, אל תשתמש ב־initializeAuth כי זה לא זמין, פשוט מחזיר אובייקט ריק
  auth = {};
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const db = getFirestore(app);

export { auth, db };
export default app;
