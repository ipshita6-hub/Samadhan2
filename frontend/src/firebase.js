import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBfysJZPUtCsFPA8gE8giiW92xPcwnw19c",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "samadhan-562bd.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "samadhan-562bd",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "samadhan-562bd.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "159400401099",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:159400401099:web:5d22e0dfb81d8fe2e1634e",
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  app = initializeApp(firebaseConfig, "fallback");
}
export const auth = getAuth(app);
