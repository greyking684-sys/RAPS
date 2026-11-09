import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserRole } from './types/oee';

// Initialize Firebase App and Services
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_BOOTSTRAP_EMAIL = 'shaemachaka@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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

// Test Connection on boot as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing in local buffer mode.');
    }
    return false;
  }
}
testConnection();

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
}

// Format username into standard email for Firebase Auth if username is provided
export function formatUsernameToEmail(usernameOrEmail: string): string {
  const trimmed = usernameOrEmail.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Sanitize username (alphanumeric, dots, dashes, underscores)
  const cleanUser = trimmed.replace(/[^a-z0-9._-]/g, '');
  return `${cleanUser || 'user'}@rigplant.internal`;
}

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Sync profile to /users/{uid}
  try {
    const isAdminUser = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);

    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        role: isAdminUser ? 'admin' : 'viewer',
        createdAt: new Date().toISOString()
      });
    }

    // If bootstrap admin, ensure /admins document exists
    if (isAdminUser) {
      try {
        await setDoc(doc(db, 'admins', user.uid), {
          email: user.email,
          assignedAt: new Date().toISOString()
        }, { merge: true });
      } catch (adminErr) {
        console.warn('Admin record sync notice:', adminErr);
      }
    }
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
  }

  return user;
}

// Sign in with Username or Email & Password
export async function signInWithCredentials(usernameOrEmail: string, pass: string): Promise<User> {
  const email = formatUsernameToEmail(usernameOrEmail);
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

// Register with Username or Email & Password
export async function registerWithCredentials(
  usernameOrEmail: string,
  pass: string,
  displayName: string,
  requestedRole: UserRole = 'operator'
): Promise<User> {
  const email = formatUsernameToEmail(usernameOrEmail);
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;

  const isAdminUser = email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const effectiveRole = isAdminUser ? 'admin' : requestedRole;

  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName || usernameOrEmail.split('@')[0],
      role: effectiveRole,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Profile creation error:', err);
  }

  return user;
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Check role for current user
export async function fetchUserRole(user: User): Promise<UserRole> {
  if (user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) {
    return 'admin';
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    if (adminSnap.exists()) {
      return 'admin';
    }

    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.role === 'admin') return 'admin';
      if (data.role === 'managing_director') return 'managing_director';
      if (data.role === 'supervisor') return 'supervisor';
      if (data.role === 'operator') return 'operator';
      return 'viewer';
    }
  } catch {
    // Fallback if rules or network delay
  }
  return 'viewer';
}
