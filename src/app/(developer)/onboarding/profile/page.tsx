"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingStepper from "@/components/developer/OnboardingStepper";
import { ONBOARDING_STEPS } from "@/components/developer/OnboardingStepper";
import {
  updateProfile,
} from "@/services/developer.service";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ProfileForm {
  name: string;
  city: string;
  currentRole: string;
  bio: string;
}

// ─────────────────────────────────────────────
// Indian cities — extend as needed
// ─────────────────────────────────────────────

const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Noida",
  "Gurgaon",
  "Kochi",
  "Chandigarh",
  "Indore",
  "Coimbatore",
  "Remote",
  "Other",
];

const BIO_LIMIT = 150;

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function OnboardingProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    city: "",
    currentRole: "",
    bio: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof ProfileForm, boolean>>>({});
  const [loading, setLoading] = useState(false);

  // ── Validation ──────────────────────────────

  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (touched.name && !form.name.trim()) errors.name = "Name is required";
  if (touched.city && !form.city) errors.city = "Please select a city";
  if (touched.currentRole && !form.currentRole.trim())
    errors.currentRole = "Current role is required";
  if (touched.bio && form.bio.length > BIO_LIMIT)
    errors.bio = `Keep it under ${BIO_LIMIT} characters`;

  const isValid =
    form.name.trim() &&
    form.city &&
    form.currentRole.trim() &&
    form.bio.length <= BIO_LIMIT;

  // ── Handlers ────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: keyof ProfileForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields to show any errors
    setTouched({ name: true, city: true, currentRole: true, bio: true });
    if (!isValid) return;

    setLoading(true);

    try {
      // TODO: replace with → import { saveProfile } from "@/services/developer.service";
      // await saveProfile(form);
    await updateProfile({
      name: form.name,
      city: form.city,
      current_role: form.currentRole,
      bio: form.bio,
    });

    router.push("/onboarding/resume");
    } catch {
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bioRemaining = BIO_LIMIT - form.bio.length;

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
          max-width: 440px;
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
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        /* ── Heading ── */
        .card-title {
          font-size: 22px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 0.3rem;
        }

        .card-sub {
          font-size: 13.5px;
          color: #B0A89E;
          font-weight: 400;
          margin-bottom: 1.75rem;
        }

        /* ── Field ── */
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 1.125rem;
        }

        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #1A1A1A;
          letter-spacing: -0.01em;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
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
          letter-spacing: 0.01em;
          -webkit-appearance: none;
          appearance: none;
        }

        .field-input,
        .field-select { height: 52px; }

        .field-textarea {
          height: 100px;
          padding: 14px 16px;
          resize: none;
          line-height: 1.55;
        }

        .field-input::placeholder,
        .field-textarea::placeholder { color: #B0A89E; font-weight: 400; }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: #FF6B4D;
          box-shadow: 0 0 0 3px rgba(255,107,77,0.10);
        }

        .field-input.error,
        .field-select.error,
        .field-textarea.error {
          border-color: #FF3B30;
          box-shadow: 0 0 0 3px rgba(255,59,48,0.08);
        }

        /* ── Select arrow ── */
        .select-wrap { position: relative; }
        .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #B0A89E;
        }

        .field-select { padding-right: 40px; cursor: pointer; }
        .field-select option[value=""] { color: #B0A89E; }

        /* ── Error message ── */
        .field-error {
          font-size: 12px;
          color: #FF3B30;
          font-weight: 500;
          margin-top: -0.2rem;
        }

        /* ── Bio counter ── */
        .bio-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.3rem;
        }

        .bio-counter {
          font-size: 11.5px;
          font-weight: 600;
          color: #B0A89E;
        }

        .bio-counter.warn { color: #FF6B4D; }
        .bio-counter.over { color: #FF3B30; }

        /* ── Submit button ── */
        .btn-next {
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
          margin-top: 0.5rem;
        }

        .btn-next:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,77,0.36);
        }

        .btn-next:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-wrap">
        <div className="card">
          <Link href="/" className="logo">Antyl</Link>

          {/* ── Stepper ── */}
          <OnboardingStepper currentStep={1} steps={ONBOARDING_STEPS} />

          <h1 className="card-title">Set up your profile</h1>
          <p className="card-sub">Tell companies a little about yourself</p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Name */}
            <div className="field">
              <label className="field-label" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                className={`field-input${errors.name ? " error" : ""}`}
                type="text"
                placeholder="Aditya Singh"
                value={form.name}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                autoComplete="name"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* City */}
            <div className="field">
              <label className="field-label" htmlFor="city">City</label>
              <div className="select-wrap">
                <select
                  id="city"
                  name="city"
                  className={`field-select${errors.city ? " error" : ""}`}
                  value={form.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur("city")}
                >
                  <option value="">Select your city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="select-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>

            {/* Current Role */}
            <div className="field">
              <label className="field-label" htmlFor="currentRole">Current role</label>
              <input
                id="currentRole"
                name="currentRole"
                className={`field-input${errors.currentRole ? " error" : ""}`}
                type="text"
                placeholder="e.g. Frontend Engineer, Fullstack Dev"
                value={form.currentRole}
                onChange={handleChange}
                onBlur={() => handleBlur("currentRole")}
              />
              {errors.currentRole && (
                <span className="field-error">{errors.currentRole}</span>
              )}
            </div>

            {/* Bio */}
            <div className="field">
              <label className="field-label" htmlFor="bio">
                Bio <span style={{ color: "#B0A89E", fontWeight: 400 }}></span>
              </label>
              <textarea
                id="bio"
                name="bio"
                className={`field-textarea${errors.bio ? " error" : ""}`}
                placeholder="A short intro — what you build, what you care about…"
                value={form.bio}
                onChange={handleChange}
                onBlur={() => handleBlur("bio")}
              />
              <div className="bio-footer">
                <span
                  className={`bio-counter${
                    bioRemaining < 0
                      ? " over"
                      : bioRemaining <= 20
                      ? " warn"
                      : ""
                  }`}
                >
                  {bioRemaining < 0
                    ? `${Math.abs(bioRemaining)} over limit`
                    : `${bioRemaining} left`}
                </span>
              </div>
              {errors.bio && <span className="field-error">{errors.bio}</span>}
            </div>

            <button
              type="submit"
              className="btn-next"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  Next step
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}