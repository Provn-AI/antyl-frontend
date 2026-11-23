"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@/services/auth.services";
import GoogleButton from "@/components/GoogleButton";
import { isPersonalEmail } from "@/lib/emailDomains";

type Role = "developer" | "recruiter" | null;

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isRecruiter = role === "recruiter";
  // Recruiters must use a company email. Developers are unaffected, and this
  // page is signup-only, so login with personal emails keeps working.
  const personalEmailBlocked = isRecruiter && emailValid && isPersonalEmail(email);
  const canSubmit = !!role && emailValid && !personalEmailBlocked && !loading;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !role) return;

    setLoading(true);
    try {
      // Pass role here so backend stores it in Supabase user metadata
      await sendOtp(email, "signup", role);
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&mode=signup&role=${role}`
      );
    } catch (err: unknown) {
      let message = "Failed to send OTP";
      if (err instanceof Error) message = err.message;
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Google signup always creates a fresh account, so go straight to onboarding
  const handleGoogleSuccess = async (result: { user: { role: string } }) => {
    router.push(
      result.user.role === "developer"
        ? "/onboarding/profile"
        : "/onboarding/recruiter"
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
          margin-bottom: 1.625rem;
        }

        .google-note {
          text-align: center;
          font-size: 12px;
          color: #B0A89E;
          font-weight: 500;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.25rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: #E8E4DF; }
        .divider-text { font-size: 13px; color: #B0A89E; font-weight: 500; }

        .field-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #1A1A1A;
          margin-bottom: 0.625rem;
          display: block;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
          margin-bottom: 1.25rem;
        }

        .role-card {
          position: relative;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DF;
          border-radius: 14px;
          padding: 1rem 0.75rem 0.875rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.15s;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .role-card:hover {
          border-color: #FFB347;
          box-shadow: 0 4px 16px rgba(255,107,77,0.08);
          transform: translateY(-1px);
        }
        .role-card.selected {
          border-color: #FF6B4D;
          background: #FFF5F2;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.12);
          transform: translateY(-1px);
        }

        .check-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B4D, #FFB347);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.6);
          transition: opacity 0.15s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .role-card.selected .check-badge {
          opacity: 1;
          transform: scale(1);
        }

        .role-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .role-card:not(.selected) .role-icon { background: #F5F3F0; color: #B0A89E; }
        .role-card.selected .role-icon { background: #FFE8E3; color: #FF6B4D; }

        .role-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.02em;
        }
        .role-desc {
          font-size: 11.5px;
          color: #B0A89E;
          font-weight: 400;
          line-height: 1.35;
        }
        .role-card.selected .role-desc { color: #C97B60; }

        .email-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #1A1A1A;
          margin-bottom: 0.5rem;
          display: block;
        }

        .email-input {
          width: 100%;
          height: 52px;
          border: 1.5px solid #E8E4DF;
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
          margin-bottom: 1.125rem;
        }
        .email-input::placeholder { color: #B0A89E; font-weight: 400; }
        .email-input:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.12);
        }
        .email-input.role-chosen { border-color: #FF6B4D; }
        .email-input.has-error { border-color: #E5484D; margin-bottom: 0.5rem; }
        .email-input.has-error:focus { box-shadow: 0 0 0 3px rgba(229,72,77,0.12); }

        .field-error {
          font-size: 12.5px;
          color: #E5484D;
          font-weight: 500;
          line-height: 1.4;
          margin-bottom: 1.125rem;
        }

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
        .btn-send-otp:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-link { text-align: center; font-size: 13.5px; color: #B0A89E; }
        .login-link a { color: #FF6B4D; font-weight: 700; text-decoration: none; }
        .login-link a:hover { text-decoration: underline; }
      `}</style>

      <div className="page-wrap">
        <div className="card">
          <Link href="/" className="logo">Antyl</Link>

          <h1 className="card-title">Create your account</h1>
          <p className="card-sub">Start your verified dev journey</p>

          {/* ── Google OAuth ──
              Disabled for recruiters: Google returns whatever account the
              user picks (including Gmail), so recruiters use the work-email
              form below instead. */}
          <GoogleButton
            mode="signup"
            role={role}
            disabled={!role || isRecruiter}
            onDisabledClick={() =>
              alert(
                !role
                  ? "Please choose Developer or Recruiter below first."
                  : "Recruiters sign up with their work email. Please use the email option below."
              )
            }
            onSuccess={handleGoogleSuccess}
            onError={(message) => alert(message)}
          />
          <p className="google-note">
            {!role
              ? "Choose your role below to use Google"
              : isRecruiter
              ? "Recruiters sign up with a work email below"
              : "Sign up with your Google account"}
          </p>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          <form onSubmit={handleSendOTP}>
            <label className="field-label">I am a…</label>
            <div className="roles-grid">
              <button
                type="button"
                className={`role-card${role === "developer" ? " selected" : ""}`}
                onClick={() => setRole("developer")}
                aria-pressed={role === "developer"}
              >
                <div className="check-badge">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="role-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
                <div>
                  <div className="role-name">Developer</div>
                  <div className="role-desc">Get verified &amp; find jobs</div>
                </div>
              </button>

              <button
                type="button"
                className={`role-card${role === "recruiter" ? " selected" : ""}`}
                onClick={() => setRole("recruiter")}
                aria-pressed={role === "recruiter"}
              >
                <div className="check-badge">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="role-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <div>
                  <div className="role-name">Recruiter</div>
                  <div className="role-desc">Hire verified talent</div>
                </div>
              </button>
            </div>

            <label className="email-label" htmlFor="email">
              {isRecruiter ? "Work email" : "Email"}
            </label>
            <input
              id="email"
              className={`email-input${role ? " role-chosen" : ""}${
                personalEmailBlocked ? " has-error" : ""
              }`}
              type="email"
              placeholder={isRecruiter ? "you@yourcompany.com" : "abc@gmail.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-invalid={personalEmailBlocked}
            />
            {personalEmailBlocked && (
              <p className="field-error">
                Please use your work email. Personal addresses like Gmail or
                Yahoo can&apos;t be used for recruiter accounts.
              </p>
            )}

            <button type="submit" className="btn-send-otp" disabled={!canSubmit}>
              {loading ? <span className="spinner" /> : "Send OTP"}
            </button>
          </form>

          <p className="login-link">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}