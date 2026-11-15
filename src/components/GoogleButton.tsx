"use client";

import { useEffect, useRef, useState } from "react";
import { googleAuth, type AuthUser } from "@/services/auth.services";

type Role = "developer" | "recruiter";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
    }
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

// Load Google's script once, no matter how many times the component mounts
let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Not in a browser"));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Google sign-in. Check your connection."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

interface GoogleButtonProps {
  mode: "login" | "signup";
  role?: Role | null;          // required when mode is "signup"
  disabled?: boolean;          // e.g. signup with no role chosen yet
  onDisabledClick?: () => void;
  onSuccess: (result: {
    user: AuthUser;
    access_token: string;
    is_new: boolean;
  }) => void | Promise<void>;
  onError?: (message: string) => void;
}

export default function GoogleButton({
  mode,
  role,
  disabled = false,
  onDisabledClick,
  onSuccess,
  onError,
}: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Google's callback is registered once, so keep the latest props in a ref
  // to make sure it always sees the current role and handlers.
  const latest = useRef({ mode, role, onSuccess, onError });
  useEffect(() => {
    latest.current = { mode, role, onSuccess, onError };
  }, [mode, role, onSuccess, onError]);

  useEffect(() => {
    let cancelled = false;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      latest.current.onError?.("Google sign-in is not configured.");
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            const { mode, role, onSuccess, onError } = latest.current;

            if (mode === "signup" && !role) {
              onError?.("Please choose Developer or Recruiter first.");
              return;
            }

            setBusy(true);
            try {
              const result = await googleAuth(
                response.credential,
                mode,
                role ?? undefined
              );
              await onSuccess(result);
            } catch (err: unknown) {
              onError?.(
                err instanceof Error
                  ? err.message
                  : "Google sign-in failed. Please try again."
              );
            } finally {
              setBusy(false);
            }
          },
        });

        // Google needs a pixel width, 400 is its maximum
        const width = Math.min(Math.floor(containerRef.current.offsetWidth), 400);

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width,
        });

        setReady(true);
      })
      .catch((err: unknown) => {
        latest.current.onError?.(
          err instanceof Error ? err.message : "Could not load Google sign-in."
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const blocked = disabled || busy;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 44,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Google renders its official button inside this div */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      />

      {/* Placeholder so the layout doesn't jump while the script loads */}
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "1.5px solid #E8E4DF",
            borderRadius: 50,
            background: "#FFFFFF",
          }}
        />
      )}

      {/* Overlay: blocks clicks when disabled or while signing in */}
      {blocked && (
        <div
          onClick={() => {
            if (disabled && !busy) onDisabledClick?.();
          }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            borderRadius: 50,
            background: "rgba(255,255,255,0.7)",
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1A1A",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {busy ? "Signing in..." : null}
        </div>
      )}
    </div>
  );
}