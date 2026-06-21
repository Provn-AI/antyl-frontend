"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp } from "@/services/auth.services";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
  e.preventDefault()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return

  setLoading(true)
  try {
    await sendOtp(email, "login")
    router.push(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`)
  } catch (err: unknown) {
    let message = "Failed to send OTP"
    if (err instanceof Error) {
      message = err.message;
    }
    alert(message)
  } finally {
    setLoading(false)
  }
}

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

        /* ── Google button ── */
        .btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DF;
          border-radius: 50px;
          padding: 13px 20px;
          font-size: 14.5px;
          font-weight: 600;
          color: #1A1A1A;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
          text-decoration: none;
          letter-spacing: -0.01em;
        }

        .btn-google:hover {
          border-color: #B0A89E;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
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
            Log in to your verified dev account
          </p>

          {/* ── Google OAuth ── */}
          <a href="/api/auth/google" className="btn-google">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8055.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5832-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71C3.7841 10.17 3.6818 9.5931 3.6818 9s.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
                fill="#EA4335"
              />
            </svg>

            Continue with Google
          </a>

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