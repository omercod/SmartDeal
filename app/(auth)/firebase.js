import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGElkEZVHlBnfTw_cTHkNj3-W1c7oZf7I",
  authDomain: "smartdealnew.firebaseapp.com",
  projectId: "smartdealnew",
  storageBucket: "smartdealnew.firebasestorage.app",
  messagingSenderId: "204079439771",
  appId: "1:204079439771:web:4cc3880e15b959862fcb3e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and configure persistence with AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

// // Optionally, initialize Analytics if supported
// let analytics;
// if (isSupported()) {
//   analytics = getAnalytics(app);
// }

// export { analytics };
export default app;
