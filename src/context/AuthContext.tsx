import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signInWithCredentials,
  registerWithCredentials,
  logoutUser,
  fetchUserRole,
  AppUserProfile,
  ADMIN_BOOTSTRAP_EMAIL
} from '../firebase';
import { UserRole } from '../types/oee';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isDirector: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithUsernameOrEmail: (userOrEmail: string, pass: string) => Promise<void>;
  registerAccount: (userOrEmail: string, pass: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRole = await fetchUserRole(currentUser);
          setRole(userRole);
        } catch {
          if (currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) {
            setRole('admin');
          } else {
            setRole('viewer');
          }
        }
      } else {
        setRole('viewer');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const loggedUser = await signInWithGoogle();
      const userRole = await fetchUserRole(loggedUser);
      setRole(userRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      console.error('Google sign in error:', err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSignIn = async (userOrEmail: string, pass: string) => {
    try {
      setError(null);
      setLoading(true);
      const loggedUser = await signInWithCredentials(userOrEmail, pass);
      const userRole = await fetchUserRole(loggedUser);
      setRole(userRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    userOrEmail: string,
    pass: string,
    displayName: string,
    requestedRole: UserRole = 'operator'
  ) => {
    try {
      setError(null);
      setLoading(true);
      const loggedUser = await registerWithCredentials(userOrEmail, pass, displayName, requestedRole);
      const userRole = await fetchUserRole(loggedUser);
      setRole(userRole);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setRole('viewer');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      setError(msg);
    }
  };

  const isAdmin = role === 'admin' || user?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const isDirector = role === 'managing_director' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: isAdmin ? 'admin' : role,
        isAdmin,
        isDirector,
        loading,
        error,
        signInWithGoogle: handleGoogleSignIn,
        signInWithUsernameOrEmail: handleCredentialsSignIn,
        registerAccount: handleRegister,
        signOut: handleSignOut,
        clearError: () => setError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
