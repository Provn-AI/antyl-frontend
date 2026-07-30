"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  evaluateResume,
  submitWaitlist,
  getWaitlistCount,
  type ResumeEvaluation,
} from "@/services/waitlist.service";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Step = "idle" | "scoring" | "gated" | "revealed";

interface LeadForm {
  name: string;
  email: string;
  mobile: string;
}

const BREAKDOWN_LABELS: Record<
  keyof ResumeEvaluation["breakdown"],
  string
> = {
  skills_clarity: "Skills clarity",
  project_depth: "Project depth",
  verifiability: "Verifiability",
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function WaitlistPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [evalResult, setEvalResult] = useState<ResumeEvaluation | null>(
    null
  );
  const [evalError, setEvalError] = useState("");

  const [form, setForm] = useState<LeadForm>({
    name: "",
    email: "",
    mobile: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof LeadForm, boolean>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    getWaitlistCount().then((c) => {
      if (c > 0) setWaitlistCount(c);
    });
  }, []);

  // ── Validation ──────────────────────────────

  const errors: Partial<Record<keyof LeadForm, string>> = {};
  if (touched.name && !form.name.trim()) errors.name = "Name is required";
  if (touched.email && !/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "Enter a valid email";
  if (touched.mobile && !/^[0-9+\-\s]{7,15}$/.test(form.mobile))
    errors.mobile = "Enter a valid mobile number";

  const isFormValid =
    form.name.trim() &&
    /^\S+@\S+\.\S+$/.test(form.email) &&
    /^[0-9+\-\s]{7,15}$/.test(form.mobile);

  // ── Handlers ────────────────────────────────

  const runEvaluation = async (file: File) => {
    setEvalError("");
    setStep("scoring");

    // small artificial delay so the "analyzing" state actually reads —
    // the real request usually resolves near-instantly since it's mocked
    const [result] = await Promise.all([
      evaluateResume(file).catch((err: Error) => {
        setEvalError(err.message || "Couldn't evaluate that file. Try again.");
        return null;
      }),
      new Promise((r) => setTimeout(r, 1400)),
    ]);

    if (result) {
      setEvalResult(result);
      setStep("gated");
    } else {
      setStep("idle");
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    runEvaluation(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file || null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormBlur = (field: keyof LeadForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, mobile: true });
    if (!isFormValid || !evalResult) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitWaitlist({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        score: evalResult.score,
        resume_filename: evalResult.resume_filename,
      });
      setStep("revealed");
      setWaitlistCount((c) => (c !== null ? c + 1 : c));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep("idle");
    setEvalResult(null);
    setEvalError("");
    setForm({ name: "", email: "", mobile: "" });
    setTouched({});
    setSubmitError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wl-page {
          min-height: 100vh;
          width: 100%;
          background: #F8F5F0;
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          padding: 3rem 1.5rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .wl-logo {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 600;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          letter-spacing: -0.02em;
          margin-bottom: 2rem;
        }

        .wl-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid #E8E4DF;
          border-radius: 50px;
          padding: 7px 16px;
          font-size: 12.5px;
          font-weight: 600;
          color: #5B564F;
          margin-bottom: 1.25rem;
        }

        .wl-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4CAF6D;
          flex-shrink: 0;
        }

        .wl-hero {
          text-align: center;
          max-width: 560px;
          margin-bottom: 2.25rem;
        }

        .wl-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 4.5vw, 40px);
          font-weight: 600;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin-bottom: 0.75rem;
        }

        .wl-hero h1 span {
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wl-hero p {
          font-size: 15.5px;
          color: #7A7369;
          line-height: 1.55;
        }

        .wl-card {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 2.25rem 2rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
        }

        /* ── Dropzone ── */
        .wl-dropzone {
          border: 1.5px dashed #E8E4DF;
          border-radius: 16px;
          padding: 2.75rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }

        .wl-dropzone:hover,
        .wl-dropzone.drag-active {
          border-color: #FF6B4D;
          background: rgba(255,107,77,0.03);
        }

        .wl-dropzone-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #FFF3EE;
          color: #FF6B4D;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .wl-dropzone-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 0.3rem;
        }

        .wl-dropzone-sub {
          font-size: 12.5px;
          color: #B0A89E;
        }

        .wl-error {
          font-size: 12.5px;
          color: #FF3B30;
          font-weight: 500;
          margin-top: 0.75rem;
          text-align: center;
        }

        /* ── Scoring / loading state ── */
        .wl-scoring {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 0;
        }

        .wl-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid #F8F5F0;
          border-top-color: #FF6B4D;
          animation: wl-spin 0.8s linear infinite;
          margin-bottom: 1.25rem;
        }

        @keyframes wl-spin { to { transform: rotate(360deg); } }

        .wl-scoring-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 0.3rem;
        }

        .wl-scoring-sub {
          font-size: 12.5px;
          color: #B0A89E;
        }

        /* ── Score display ── */
        .wl-score-block {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .wl-score-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #B0A89E;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.5rem;
        }

        .wl-score-number {
          font-family: 'Fraunces', serif;
          font-size: 56px;
          font-weight: 600;
          line-height: 1;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .wl-score-number.blurred {
          filter: blur(10px);
          user-select: none;
        }

        .wl-score-outof {
          font-size: 14px;
          font-weight: 600;
          color: #B0A89E;
        }

        .wl-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-bottom: 1.5rem;
        }

        .wl-breakdown-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wl-breakdown-label {
          font-size: 12px;
          font-weight: 600;
          color: #5B564F;
          width: 96px;
          flex-shrink: 0;
        }

        .wl-breakdown-track {
          flex: 1;
          height: 6px;
          border-radius: 10px;
          background: #F0ECE6;
          overflow: hidden;
        }

        .wl-breakdown-fill {
          height: 100%;
          border-radius: 10px;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          transition: width 0.6s ease;
        }

        .wl-breakdown-fill.blurred {
          filter: blur(4px);
        }

        .wl-gate-copy {
          text-align: center;
          font-size: 13px;
          color: #7A7369;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .wl-gate-copy strong { color: #1A1A1A; }

        /* ── Form ── */
        .wl-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .wl-field-label {
          font-size: 12.5px;
          font-weight: 600;
          color: #1A1A1A;
        }

        .wl-field-input {
          width: 100%;
          height: 50px;
          border: 1.5px solid #E8E4DF;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          background: #FFFFFF;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .wl-field-input::placeholder { color: #B0A89E; font-weight: 400; }

        .wl-field-input:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }

        .wl-field-input.error {
          border-color: #FF3B30;
          box-shadow: 0 0 0 3px rgba(255,59,48,0.08);
        }

        .wl-field-error {
          font-size: 11.5px;
          color: #FF3B30;
          font-weight: 500;
        }

        .wl-btn {
          width: 100%;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white;
          border: none;
          padding: 15px 28px;
          border-radius: 50px;
          font-size: 14.5px;
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
          margin-top: 0.25rem;
        }

        .wl-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .wl-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

        .wl-spinner-sm {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: wl-spin 0.7s linear infinite;
        }

        /* ── Revealed state ── */
        .wl-revealed-title {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 0.3rem;
        }

        .wl-revealed-sub {
          text-align: center;
          font-size: 12.5px;
          color: #7A7369;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .wl-again {
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          color: #B0A89E;
          cursor: pointer;
          text-decoration: underline;
          display: block;
          margin: 1rem auto 0;
        }

        .wl-again:hover { color: #5B564F; }

        .wl-count {
          font-size: 12px;
          font-weight: 600;
          color: #B0A89E;
          margin-top: 1.75rem;
        }

        .wl-count strong { color: #5B564F; }
      `}</style>

      <div className="wl-page">
        <Link href="/" className="wl-logo">Antyl</Link>

        <div className="wl-hero">
          <div className="wl-badge">
            <span className="wl-badge-dot" />
            Free · takes 30 seconds
          </div>
          <h1>What is your <span>Antyl Score</span>?</h1>
          <p>
            Upload your resume and get an instant score on how well it
            actually proves what you can do — the same standard recruiters
            will hold you to on Antyl.
          </p>
        </div>

        <div className="wl-card">
          {step === "idle" && (
            <>
              <div
                className={`wl-dropzone${dragActive ? " drag-active" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <div className="wl-dropzone-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="wl-dropzone-title">
                  Drop your resume here, or click to upload
                </div>
                <div className="wl-dropzone-sub">PDF or Word · up to 5MB</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: "none" }}
                onChange={(e) =>
                  handleFileSelect(e.target.files?.[0] || null)
                }
              />
              {evalError && <div className="wl-error">{evalError}</div>}
            </>
          )}

          {step === "scoring" && (
            <div className="wl-scoring">
              <div className="wl-ring" />
              <div className="wl-scoring-title">Analyzing your resume…</div>
              <div className="wl-scoring-sub">Scoring clarity, depth, and verifiability</div>
            </div>
          )}

          {(step === "gated" || step === "revealed") && evalResult && (
            <>
              <div className="wl-score-block">
                <div className="wl-score-label">Your Developer Score</div>
                <span className={`wl-score-number${step === "gated" ? " blurred" : ""}`}>
                  {evalResult.score}
                </span>
                <span className="wl-score-outof">/100</span>
              </div>

              <div className="wl-breakdown">
                {(Object.keys(evalResult.breakdown) as Array<
                  keyof ResumeEvaluation["breakdown"]
                >).map((key) => (
                  <div className="wl-breakdown-row" key={key}>
                    <span className="wl-breakdown-label">
                      {BREAKDOWN_LABELS[key]}
                    </span>
                    <div className="wl-breakdown-track">
                      <div
                        className={`wl-breakdown-fill${
                          step === "gated" ? " blurred" : ""
                        }`}
                        style={{ width: `${evalResult.breakdown[key]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {step === "gated" && (
                <>
                  <p className="wl-gate-copy">
                    Enter your details to <strong>unlock your full score</strong> and
                    join the Antyl waitlist — first to get verified, first to get seen.
                  </p>

                  <form onSubmit={handleUnlock} noValidate>
                    <div className="wl-field">
                      <label className="wl-field-label" htmlFor="wl-name">Full name</label>
                      <input
                        id="wl-name"
                        name="name"
                        className={`wl-field-input${errors.name ? " error" : ""}`}
                        type="text"
                        placeholder="Vanshika Singh"
                        value={form.name}
                        onChange={handleFormChange}
                        onBlur={() => handleFormBlur("name")}
                        autoComplete="name"
                      />
                      {errors.name && <span className="wl-field-error">{errors.name}</span>}
                    </div>

                    <div className="wl-field">
                      <label className="wl-field-label" htmlFor="wl-email">Email</label>
                      <input
                        id="wl-email"
                        name="email"
                        className={`wl-field-input${errors.email ? " error" : ""}`}
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleFormChange}
                        onBlur={() => handleFormBlur("email")}
                        autoComplete="email"
                      />
                      {errors.email && <span className="wl-field-error">{errors.email}</span>}
                    </div>

                    <div className="wl-field">
                      <label className="wl-field-label" htmlFor="wl-mobile">Mobile number</label>
                      <input
                        id="wl-mobile"
                        name="mobile"
                        className={`wl-field-input${errors.mobile ? " error" : ""}`}
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.mobile}
                        onChange={handleFormChange}
                        onBlur={() => handleFormBlur("mobile")}
                        autoComplete="tel"
                      />
                      {errors.mobile && <span className="wl-field-error">{errors.mobile}</span>}
                    </div>

                    {submitError && <div className="wl-error">{submitError}</div>}

                    <button type="submit" className="wl-btn" disabled={submitting}>
                      {submitting ? (
                        <span className="wl-spinner-sm" />
                      ) : (
                        <>
                          Unlock my score
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {step === "revealed" && (
                <>
                  <div className="wl-revealed-title">You are on the waitlist 🎉</div>
                  <p className="wl-revealed-sub">
                    We will email <strong>{form.email}</strong> the moment Antyl
                    opens up. Keep building — your verifiability score is the
                    one worth working on.
                  </p>
                  <button type="button" className="wl-again" onClick={resetFlow}>
                    Score another resume
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {waitlistCount !== null && (
          <div className="wl-count">
            <strong>{waitlistCount.toLocaleString()}</strong> developers already on the list
          </div>
        )}
      </div>
    </>
  );
}