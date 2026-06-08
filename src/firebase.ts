import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Read from localStorage if custom config exists to honor user API Key input intent
let activeConfig: any = firebaseConfig;
try {
  const customConfigStr = localStorage.getItem("silks_custom_firebase_config");
  if (customConfigStr) {
    const parsed = JSON.parse(customConfigStr);
    if (parsed && parsed.apiKey && parsed.projectId) {
      activeConfig = { ...firebaseConfig, ...parsed };
    }
  }
} catch (e) {
  console.error("Failed to parse custom firebase config:", e);
}

// Ensure the Firebase App is initialized safely
let app;
if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(activeConfig);
}

export const db = getFirestore(app, activeConfig.firestoreDatabaseId || (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");

let googleAccessToken: string | null = null;

export function getActiveFirebaseConfig() {
  return activeConfig;
}

export function saveCustomFirebaseConfig(config: any) {
  localStorage.setItem("silks_custom_firebase_config", JSON.stringify(config));
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem("silks_custom_firebase_config");
}

export function getGoogleAccessToken() {
  return googleAccessToken;
}

export function setGoogleAccessToken(token: string | null) {
  googleAccessToken = token;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential && credential.accessToken) {
      googleAccessToken = credential.accessToken;
    }
    return result.user;
  } catch (error) {
    console.error("Auth Login Error:", error);
    throw error;
  }
}

export async function loginAnonymously() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous Auth Login Error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    googleAccessToken = null;
  } catch (error) {
    console.error("Auth Logout Error:", error);
    throw error;
  }
}
