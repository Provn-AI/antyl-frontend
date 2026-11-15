"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, refreshAccessToken } from "@/services/auth.services";
import GoogleButton from "@/components/GoogleButton";

// Same helpers the verify-otp page uses, so Google login routes identically
async function fetchDeveloperProfile(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/developer/profile/me`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // If token expired, try to refresh once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return null;
    const retryRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/developer/profile/me`,
      { headers: { Authorization: `Bearer ${newToken}` } }
    );
    if (!retryRes.ok) return null;
    return (await retryRes.json()).profile ?? null;
  }

  if (!res.ok) return null;
  return (await res.json()).profile ?? null;
}

function getOnboardingRoute(profile: {
  onboarding_completed: boolean;
  onboarding_step: number;
}): string {
  if (profile.onboarding_completed) return "/feed";
  const stepMap: Record<number, string> = {
    1: "/onboarding/profile",
    2: "/onboarding/resume",
    3: "/onboarding/github",
    4: "/onboarding/projects",
  };
  return stepMap[profile.onboarding_step] ?? "/feed";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    setLoading(true);
    try {
      await sendOtp(email, "login");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`);
    } catch (err: unknown) {
      let message = "Failed to send OTP";
      if (err instanceof Error) {
        message = err.message;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (result: {
    user: { role: string };
    access_token: string;
  }) => {
    if (result.user.role === "recruiter") {
      router.push("/dashboard");
      return;
    }

    // Developer: send them to wherever they left off in onboarding
    const profile = await fetchDeveloperProfile(result.access_token);
    if (!profile) {
      router.push("/onboarding/profile");
      return;
    }
    router.push(getOnboardingRoute(profile));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page-wrap {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #F8F5F0;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .card {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 2.25rem 2rem 2rem;
          width: 100%;
          max-width: 390px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
        }

        /* ── Logo ── */
        .logo {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 600;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1.75rem;
          letter-spacing: -0.02em;
        }

        /* ── Heading ── */
        .card-title {
          font-size: 26px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 0.375rem;
        }

        .card-sub {
          font-size: 14px;
          color: #B0A89E;
          font-weight: 400;
          margin-bottom: 1.875rem;
        }

        .google-note {
          text-align: center;
          font-size: 12px;
          color: #B0A89E;
          font-weight: 500;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }

        /* ── Divider ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.375rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #E8E4DF;
        }

        .divider-text {
          font-size: 13px;
          color: #B0A89E;
          font-weight: 500;
        }

        /* ── Email field ── */
        .field-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #1A1A1A;
          margin-bottom: 0.5rem;
          display: block;
        }

        .email-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .email-input {
          flex: 1;
          height: 52px;
          border: 1.5px solid #FF6B4D;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 14.5px;
          font-weight: 500;
          color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          background: #FFFFFF;
          transition: border-color 0.15s, box-shadow 0.15s;
          letter-spacing: 0.01em;
        }

        .email-input::placeholder {
          color: #B0A89E;
          font-weight: 400;
        }

        .email-input:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.12);
        }

        /* ── Send OTP button ── */
        .btn-send-otp {
          width: 100%;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white;
          border: none;
          padding: 15px 28px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 20px rgba(255,107,77,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1.375rem;
        }

        .btn-send-otp:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .btn-send-otp:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ── Footer ── */
        .signup-link {
          text-align: center;
          font-size: 13.5px;
          color: #B0A89E;
        }

        .signup-link a {
          color: #FF6B4D;
          font-weight: 700;
          text-decoration: none;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="page-wrap">
        <div className="card">
          <Link href="/" className="logo">
            Antyl
          </Link>

          <h1 className="card-title">Welcome back</h1>
          <p className="card-sub">
            Log in to your verified account
          </p>

          {/* ── Google OAuth ── */}
          <GoogleButton
            mode="login"
            onSuccess={handleGoogleSuccess}
            onError={(message) => alert(message)}
          />
          <p className="google-note">Log in with your Google account</p>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <form onSubmit={handleSendOTP}>
            <label className="field-label" htmlFor="email">
              Email
            </label>

            <div className="email-row">
              <input
                id="email"
                className="email-input"
                type="email"
                placeholder="abc@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="btn-send-otp"
              disabled={
                loading ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              }
            >
              {loading ? <span className="spinner" /> : "Send OTP"}
            </button>
          </form>

          <p className="signup-link">
            Don&apos;t have an account?{" "}
            <Link href="/signup">Sign up free</Link>
          </p>
        </div>
      </div>
    </>
  );
}