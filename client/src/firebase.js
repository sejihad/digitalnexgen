// Firebase client initialization
// Make sure to define the following env vars in your client environment:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_APP_ID, VITE_FIREBASE_MESSAGING_SENDER_ID (optional), VITE_FIREBASE_STORAGE_BUCKET (optional)

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA92WYt6O1sysGZtlz9cLs06Gz-HldI7q0",
  authDomain: "digital-nexgen-74106.firebaseapp.com",
  projectId: "digital-nexgen-74106",
  appId: "1:966021879857:web:ef558a4e71409cdf95dd10",
  storageBucket: "digital-nexgen-74106.firebasestorage.app",
  messagingSenderId: "966021879857",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const providers = {
  google: new GoogleAuthProvider(),
  facebook: new FacebookAuthProvider(),
  github: new GithubAuthProvider(),
  twitter: new TwitterAuthProvider(),
};

export default app;
