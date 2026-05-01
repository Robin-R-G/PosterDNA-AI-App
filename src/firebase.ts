/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with long polling to ensure better connectivity in restricted iFrame environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  console.log(`[Analytics] ${eventName}`, params);
  // Future: Integration with Firebase Analytics or similar
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
  }
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    // Attempt to read a dummy document to test connectivity
    // Using getDocFromServer ensures we aren't just reading from cache
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connectivity: OK");
  } catch (error: any) {
    // A 'not-found' error is actually GOOD because it means we reached the server
    if (error.code === 'not-found') {
      console.log("Firebase connectivity: OK (Service reached)");
      return;
    }
    
    if (error.message && (error.message.includes('the client is offline') || error.message.includes('Could not reach'))) {
      console.warn("Firestore connectivity warning: The backend is currently unreachable. This often happens during initial provisioning or due to network restrictions. Retrying in background...");
    } else {
      console.log("Firebase connection test result:", error.code || error.message);
    }
  }
}

testConnection();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
