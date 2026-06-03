"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────
// Spinner shown while auth state is resolving
// ─────────────────────────────────────────────

function AuthLoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8F5F0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "3px solid #E8E4DF",
          borderTopColor: "#FF6B4D",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// withAuth — wraps pages that require login
// Redirects unauthenticated users → /login
// ─────────────────────────────────────────────

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedPage(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login");
      }
    }, [user, loading, router]);

    if (loading) return <AuthLoadingScreen />;
    if (!user) return null; // redirect in progress

    return <Component {...props} />;
  };
}

// ─────────────────────────────────────────────
// withGuest — wraps auth pages (login, signup)
// Redirects already-logged-in users to their dashboard
// ─────────────────────────────────────────────

export function withGuest<P extends object>(
  Component: React.ComponentType<P>
) {
  return function GuestOnlyPage(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        // Send them to the right place based on their role
        if (user.role === "developer") {
          router.replace("/feed");
        } else if (user.role === "recruiter") {
          router.replace("/recruiter/dashboard");
        } else {
          router.replace("/select-role");
        }
      }
    }, [user, loading, router]);

    if (loading) return <AuthLoadingScreen />;
    if (user) return null; // redirect in progress

    return <Component {...props} />;
  };
}