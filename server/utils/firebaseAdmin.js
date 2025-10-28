import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let app;

export function initFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.warn("[firebase-admin] Missing service account env vars. Firebase login will be disabled.");
      return null;
    }

    // Replace escaped newlines
    privateKey = privateKey.replace(/\\n/g, "\n");

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    app = admin.app();
  }
  return app;
}

export function getFirebaseAdmin() {
  if (!admin.apps.length) return initFirebaseAdmin();
  return admin.app();
}

export const db = () => {
  const a = getFirebaseAdmin();
  if (!a) return null;
  return a.firestore();
};

export const auth = () => {
  const a = getFirebaseAdmin();
  if (!a) return null;
  return a.auth();
};

