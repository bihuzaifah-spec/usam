import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Helper to determine if we are inside the AI Studio sandbox preview
const isAiStudioPreview = typeof window !== "undefined" && (
  window.location.hostname.includes("run.app") ||
  window.location.hostname.includes("aistudio") ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
);

// Your web app's Firebase configuration
const firebaseConfig = isAiStudioPreview ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "AIzaSyBq44XxM_9T0wq1s1ckH82Jyq7eBn4EyXA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "independent-furnace-mn50x.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "independent-furnace-mn50x",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || "independent-furnace-mn50x.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || "189315026601",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || "1:189315026601:web:691d97f5caa86b396b23b8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId || ""
} : {
  // Production / Deployed custom project fallback (e.g., Vercel)
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyARGzlP87VLnyj8lohxM8T12dLvNZmqtlY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "start-up-b2b6a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "start-up-b2b6a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "start-up-b2b6a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "314888008869",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:314888008869:web:e455c3419c04fa5a8d094c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1Y0DSJ9K8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore & Auth for future product usage
// For custom project, the database ID is normally empty (the "(default)" database) unless VITE_FIREBASE_FIRESTORE_DATABASE_ID is specified.
const dbId = isAiStudioPreview 
  ? (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "ai-studio-masdaralriyadh-4b6f2b33-9b09-4263-a852-9ba5f6d8b233")
  : (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "");

export const db = dbId 
  ? getFirestore(app, dbId)
  : getFirestore(app);

export const auth = getAuth(app);

// Initialize Analytics safely (checking environment support to prevent crashes inside sandboxed iframes)
export let analytics: any = null;

// Only initialize Analytics in real non-sandbox/non-dev production environments to prevent fetch/blocked network errors
const isDevEnvironment = typeof window !== "undefined" && (
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.includes("run.app") ||
  window.location.hostname.includes("aistudio")
);

if (!isDevEnvironment) {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch (err) {
          console.warn("Firebase Analytics initialization failed:", err);
        }
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics is not supported in this environment:", err);
    });
}

export { app, firebaseConfig };
