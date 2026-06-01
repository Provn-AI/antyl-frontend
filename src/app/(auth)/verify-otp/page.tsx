"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, verifyOtp } from "@/services/auth.services";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const mode = searchParams.get("mode") ?? "login";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
  const code = otp.join("")
  if (code.length < OTP_LENGTH) return

  setLoading(true)
  try {
    const { user } = await verifyOtp(email, code)

    if (mode === "signup") {
      router.push("/select-role")
    } else {
      router.push(
        user.role === "developer" ? "/feed" : "/recruiter/dashboard"
      )
    }
  } catch (err: unknown) {
    let message = "Failed to verify OTP";

    if (err instanceof Error) {
      message = err.message;
    }
    alert(message)
    setOtp(Array(OTP_LENGTH).fill(""))
    inputRefs.current[0]?.focus()
  } finally {
    setLoading(false)
  }
}

  const handleResend = async () => {
  if (timer > 0) return;

  try {
    await sendOtp(email, mode as "signup" | "login");

    // Only update UI after successful resend
    setTimer(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  } catch (err: unknown) {
    let message = "Failed to resend OTP";

    if (err instanceof Error) {
      message = err.message;
    }

    alert(message);
    console.error("Resend OTP error:", err);
  }
};

  const filled = otp.filter(Boolean).length;

  return (
    <div className="card">
      <div className="icon-wrap">
        <svg
          width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="#FF6B4D" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M4 4h16v16H4z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      </div>

      <h1 className="card-title">Enter OTP</h1>

      <p className="card-sub">
        We sent a verification code to{" "}
        <strong>{email}</strong>
      </p>

      <div className="otp-row" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            className={`otp-box${digit ? " filled" : ""}`}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button
        className="btn-verify"
        onClick={handleVerify}
        disabled={filled < OTP_LENGTH || loading}
      >
        {loading ? <span className="spinner" /> : "Verify OTP"}
      </button>

      <div className="resend-row">
        {timer > 0 ? (
          <>Resend in <span className="resend-timer">{timer}s</span></>
        ) : (
          <button className="resend-btn" onClick={handleResend}>
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&display=swap');

        :root {
          --coral: #FF6B4D;
          --amber: #FFB347;
          --ink: #1A1A1A;
          --white: #FFFFFF;
          --gray1: #F8F5F0;
          --gray2: #E8E4DF;
          --gray3: #B0A89E;
          --font: 'DM Sans', sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: var(--gray1);
          font-family: var(--font);
          -webkit-font-smoothing: antialiased;
        }

        .card {
          background: var(--white);
          border-radius: 24px;
          padding: 2.25rem 2rem 2rem;
          width: 100%;
          max-width: 430px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
        }

        .icon-wrap {
          width: 52px;
          height: 52px;
          background: #FFF0ED;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 0.375rem;
        }

        .card-sub {
          font-size: 13.5px;
          color: var(--gray3);
          font-weight: 400;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .card-sub strong { color: var(--ink); font-weight: 600; word-break: break-word; }

        .otp-row {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .otp-box {
          width: 52px;
          height: 56px;
          border: 1.5px solid var(--gray2);
          border-radius: 14px;
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          text-align: center;
          font-family: var(--font);
          background: var(--white);
          outline: none;
          caret-color: var(--coral);
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          flex: 0 0 auto;
        }

        .otp-box.filled {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }

        .otp-box:focus {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgba(255,107,77,0.14);
          transform: translateY(-1px);
        }

        .otp-box::-webkit-outer-spin-button,
        .otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }

        .btn-verify {
          width: 100%;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white;
          border: none;
          padding: 15px 28px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font);
          letter-spacing: -0.01em;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 20px rgba(255,107,77,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.4rem;
        }

        .btn-verify:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .btn-verify:disabled { opacity: 0.55; cursor: not-allowed; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .resend-row { font-size: 13.5px; color: var(--gray3); }
        .resend-timer { color: var(--coral); font-weight: 700; }

        .resend-btn {
          background: none;
          border: none;
          padding: 0;
          color: var(--coral);
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          font-family: var(--font);
        }

        .resend-btn:hover { opacity: 0.85; }

        @media (max-width: 480px) {
          .card { padding: 2rem 1.25rem; }
          .otp-row { gap: 8px; }
          .otp-box { width: 44px; height: 50px; font-size: 18px; }
        }
      `}</style>

      <div className="page-wrap">
        <Suspense fallback={
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
            <span style={{ color: "var(--gray3)", fontSize: 14 }}>Loading…</span>
          </div>
        }>
          <VerifyOtpForm />
        </Suspense>
      </div>
    </>
  );
}
