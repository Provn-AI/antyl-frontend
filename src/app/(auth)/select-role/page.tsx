"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "developer" | "recruiter" | null;

export default function SelectRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);

    // TODO: replace with → import { setUserRole } from "@/services/auth.service";
    // await setUserRole(selected);

    setTimeout(() => {
      setLoading(false);
      if (selected === "developer") {
        router.push("/onboarding/profile");
      } else {
        router.push("/dashboard");
      }
    }, 700);
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

        /* ── Role cards grid ── */
        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .role-card {
          position: relative;
          background: #FFFFFF;
          border: 1.5px solid #E8E4DF;
          border-radius: 16px;
          padding: 1.5rem 1rem 1.25rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
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

        /* ── Selected checkmark badge ── */
        .check-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 18px;
          height: 18px;
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

        /* ── Icon wrapper ── */
        .role-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .role-card:not(.selected) .role-icon {
          background: #F5F3F0;
          color: #B0A89E;
        }

        .role-card.selected .role-icon {
          background: #FFE8E3;
          color: #FF6B4D;
        }

        /* ── Card text ── */
        .role-name {
          font-size: 15px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .role-desc {
          font-size: 12.5px;
          color: #B0A89E;
          font-weight: 400;
          line-height: 1.4;
        }

        .role-card.selected .role-desc {
          color: #C97B60;
        }

        /* ── Continue button ── */
        .btn-continue {
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

        .btn-continue:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .btn-continue:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
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
          to { transform: rotate(360deg); }
        }

        /* ── Footer ── */
        .footer-note {
          text-align: center;
          font-size: 12px;
          color: #B0A89E;
          line-height: 1.5;
        }

        .footer-note a {
          color: #FF6B4D;
          font-weight: 600;
          text-decoration: none;
        }

        .footer-note a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="page-wrap">
        <div className="card">
          <Link href="/" className="logo">
            Antyl
          </Link>

          <h1 className="card-title">I am a…</h1>
          <p className="card-sub">Choose how you want to use Antyl</p>

          <div className="roles-grid">
            {/* Developer card */}
            <button
              className={`role-card${selected === "developer" ? " selected" : ""}`}
              onClick={() => setSelected("developer")}
              aria-pressed={selected === "developer"}
              type="button"
            >
              <div className="check-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="role-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>

              <div>
                <div className="role-name">Developer</div>
                <div className="role-desc">Get verified &amp; find jobs</div>
              </div>
            </button>

            {/* Recruiter card */}
            <button
              className={`role-card${selected === "recruiter" ? " selected" : ""}`}
              onClick={() => setSelected("recruiter")}
              aria-pressed={selected === "recruiter"}
              type="button"
            >
              <div className="check-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="role-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>

              <div>
                <div className="role-name">Recruiter</div>
                <div className="role-desc">Hire verified talent</div>
              </div>
            </button>
          </div>

          <button
            className="btn-continue"
            onClick={handleContinue}
            disabled={!selected || loading}
            type="button"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                Continue
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>

          <p className="footer-note">
            You can change this later in{" "}
            <Link href="/settings">Settings</Link>
          </p>
        </div>
      </div>
    </>
  );
}