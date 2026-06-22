import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase configuration
// FUTURE IMPLEMENTATION: Move these values to .env.local and use NEXT_PUBLIC_ prefix
const firebaseConfig = {
  apiKey: "AIzaSyDJBt1xh3_2-0HT2HJ34I7fXpIkaNl_DMs",
  authDomain: "election-campaign-system-9a484.firebaseapp.com",
  projectId: "election-campaign-system-9a484",
  storageBucket: "election-campaign-system-9a484.firebasestorage.app",
  messagingSenderId: "918391362729",
  appId: "1:918391362729:web:51a10e39c794171467c5b8",
  measurementId: "G-DRQFLY7LBK",
};

// Prevent re-initialization on hot reload (Next.js dev mode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export default app;
