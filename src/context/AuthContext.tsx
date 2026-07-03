"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

import {
  AuthUser,
  getStoredUser,
  getStoredToken,
  logout,
} from "@/services/auth.services";

import { initFetchInterceptor } from "@/services/fetchInterceptor";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  refreshUser: () => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Patch fetch globally so any 401 from our backend
  // triggers logout + redirect to /login automatically
  useEffect(() => {
    initFetchInterceptor();
  }, []);

  // Initialize directly from localStorage
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    return token && storedUser ? storedUser : null;
  });

  // No async auth check needed
  const loading = false;

  // Keep auth state synced across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "access_token" ||
        e.key === "refresh_token" ||
        e.key === "user"
      ) {
        const token = getStoredToken();
        const storedUser = getStoredUser();

        setUser(token && storedUser ? storedUser : null);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const signOut = useCallback(() => {
    logout();
  }, []);

  const refreshUser = useCallback(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    setUser(token && storedUser ? storedUser : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>"
    );
  }

  return ctx;
}