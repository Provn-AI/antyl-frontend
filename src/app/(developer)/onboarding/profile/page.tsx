"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingStepper from "@/components/developer/OnboardingStepper";
import { ONBOARDING_STEPS } from "@/components/developer/OnboardingStepper";
import {
  updateProfile,
  uploadProfilePhoto,
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

interface MascotPhase {
  /** Path to the mascot image for this phase. Drop your PNG in /public
   *  and point this at it, e.g. "/preonboarding_1_image.png".
   *  IMPORTANT: export every phase PNG with a transparent background,
   *  the same way as the first one — no white/colored box baked in. */
  image: string;
  /** Emoji fallback shown if the image above fails to load / isn't added yet */
  fallback: string;
  title: string;
  message: string;
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
const MAX_PHOTO_SIZE = 0.2 * 1024 * 1024; // 200kb
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─────────────────────────────────────────────
// Mascot intro — 4 phases, mascot centered with a
// speech bubble above it carrying the copy.
// Swap the `image` paths for your real artwork.
// ─────────────────────────────────────────────

const MASCOT_PHASES: MascotPhase[] = [
  {
    image: "/preonboarding_image.png",
    fallback: "👋",
    title: "Hi! I'm Ant 👋",
    message: "Can I help you find your next opportunity?",
  },
  {
    image: "/preonboarding_1_image.png",
    fallback: "🙂",
    title: "Finding the right job isn't easy...",
    message: "Every company wants something different, and every application takes time.",
  },
  {
    image: "/preonboarding_2_image.png",
    fallback: "✍️",
    title: "You spend hours tweaking your resume...",
    message: "..only to hear nothing back.",
  },
  {
    image: "/preonboarding_3_image.png",
    fallback: "🎉",
    title: "What if you built your profile just once...",
    message: "...and I do this tedious task for you?",
  },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function OnboardingProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    city: "",
    currentRole: "",
    bio: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof ProfileForm, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // ── Mascot intro state ──────────────────────
  const [mascotOpen, setMascotOpen] = useState(true);
  const [mascotClosing, setMascotClosing] = useState(false);
  const [mascotStep, setMascotStep] = useState(0);
  const [mascotImgFailed, setMascotImgFailed] = useState<Record<number, boolean>>({});

  const isLastMascotPhase = mascotStep === MASCOT_PHASES.length - 1;

  const closeMascot = () => {
    setMascotClosing(true);
    window.setTimeout(() => {
      setMascotOpen(false);
      setMascotClosing(false);
    }, 380);
  };

  const handleMascotNext = () => {
    if (isLastMascotPhase) {
      closeMascot();
    } else {
      setMascotStep((s) => Math.min(s + 1, MASCOT_PHASES.length - 1));
    }
  };

  const handleMascotSkip = () => {
    closeMascot();
  };

  // lock background scroll while the mascot intro is up
  useEffect(() => {
    if (mascotOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mascotOpen]);

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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setAvatarError("Use a JPEG, PNG, or WEBP image");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setAvatarError("Image must be under 200kb");
      return;
    }

    // instant local preview
    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setAvatarUploading(true);

    try {
      const uploadedUrl = await uploadProfilePhoto(file);
      setAvatarPreview(uploadedUrl);
    } catch {
      setAvatarError("Upload failed. Please try again.");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields to show any errors
    setTouched({ name: true, city: true, currentRole: true, bio: true });
    if (!isValid) return;

    setLoading(true);

    try {
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
  const phase = MASCOT_PHASES[mascotStep];

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

        /* wraps the card so the mascot sits centered above it,
           in normal flow — no absolute positioning, no clipping */
        .card-stage {
          position: relative;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .card {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 2.25rem 2rem 2rem;
          width: 100%;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
          transition: filter 0.5s ease, transform 0.5s ease;
        }

        .card.card-blurred {
          filter: blur(6px) saturate(85%);
          transform: scale(0.985);
          pointer-events: none;
          user-select: none;
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

        /* ── Avatar upload ── */
        .avatar-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .avatar-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #F8F5F0;
          border: 1.5px dashed #E8E4DF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          transition: border-color 0.15s;
        }

        .avatar-circle:hover { border-color: #FF6B4D; }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-circle .avatar-placeholder {
          color: #B0A89E;
        }

        .avatar-circle .avatar-spinner {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-meta { display: flex; flex-direction: column; gap: 0.3rem; }

        .avatar-label {
          font-size: 13px;
          font-weight: 600;
          color: #1A1A1A;
        }

        .avatar-hint {
          font-size: 12px;
          color: #B0A89E;
        }

        .avatar-hint.error { color: #FF3B30; }

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

        /* ─────────────────────────────────────
           Mascot intro — normal document flow, centered.
           Layout: speech bubble on top (with a tail
           pointing down), mascot centered directly beneath
           the tail, controls below the mascot.
        ───────────────────────────────────── */

        .mascot-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin-top: 2rem;
          margin-bottom: 1.75rem;
          animation: mascotBlockIn 0.45s ease both;
        }

        .mascot-block.mascot-closing {
          animation: mascotBlockOut 0.38s ease forwards;
        }

        @keyframes mascotBlockIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes mascotBlockOut {
          to { opacity: 0; transform: translateY(-10px); }
        }

        /* ── Speech bubble ── */
        .mascot-bubble-wrap {
          position: relative;
          max-width: 320px;
          margin-bottom: 0.5rem;
          animation: mascotTextIn 0.4s ease both;
        }

        .mascot-bubble {
          position: relative;
          background: #FFFFFF;
          border-radius: 20px;
          padding: 1.1rem 1.4rem;
          box-shadow: 0 2px 20px rgba(0,0,0,0.07);
          text-align: center;
        }

        /* tail: a rotated square clipped to a triangle,
           sitting on the bubble's bottom edge and pointing
           straight down at the mascot's head */
        .mascot-bubble::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -9px;
          transform: translateX(-50%);
          width: 18px;
          height: 10px;
          background: #FFFFFF;
          clip-path: polygon(50% 100%, 0 0, 100% 0);
          filter: drop-shadow(0 3px 2px rgba(0,0,0,0.04));
        }

        .mascot-title {
          font-size: 15.5px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }

        .mascot-message {
          font-size: 13px;
          font-weight: 500;
          color: #5B564F;
          line-height: 1.5;
        }

        @keyframes mascotTextIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* image stage: fixed box so phases don't jump around,
           centered under the bubble's tail. No box/background
           of any kind behind the art — every phase PNG should
           be exported transparent like the first one. */
        .mascot-image-stage {
          position: relative;
          width: 220px;
          height: 220px;
          background: transparent;
          margin-top: 0.25rem;
        }

        .mascot-image-stage img,
        .mascot-image-stage .mascot-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .mascot-image-stage img {
          /* contain (not cover) so the PNG is never cropped */
          object-fit: contain;
          display: block;
          animation: mascotCrossfade 0.5s cubic-bezier(0.34, 1.15, 0.4, 1) both;
        }

        .mascot-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 84px;
          animation: mascotCrossfade 0.5s cubic-bezier(0.34, 1.15, 0.4, 1) both;
        }

        @keyframes mascotCrossfade {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        /* control bar: progress + skip + next */
        .mascot-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 0.5rem;
        }

        .mascot-dots {
          display: flex;
          gap: 6px;
        }

        .mascot-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #E8E4DF;
          transition: width 0.35s ease, background 0.35s ease;
        }

        .mascot-dot.active {
          width: 18px;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
        }

        .mascot-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-left: 8px;
        }

        .mascot-skip {
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          color: #B0A89E;
          cursor: pointer;
          padding: 6px 4px;
          transition: color 0.15s;
        }

        .mascot-skip:hover { color: #5B564F; }

        .mascot-next {
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          color: white;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          padding: 9px 18px;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255,107,77,0.30);
          transition: transform 0.15s, box-shadow 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .mascot-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255,107,77,0.38);
        }

        @media (max-width: 480px) {
          .mascot-block { margin-top: 1rem; }
          .mascot-image-stage { width: 170px; height: 170px; }
          .mascot-bubble-wrap { max-width: 260px; }
          .mascot-message { font-size: 12.5px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mascot-block { animation: none; }
          .mascot-image-stage img,
          .mascot-fallback,
          .mascot-bubble-wrap { animation: none; }
        }
      `}</style>

      <div className="page-wrap">
        <div className="card-stage">

          {mascotOpen && (
            <div className={`mascot-block${mascotClosing ? " mascot-closing" : ""}`}>
              <div className="mascot-bubble-wrap" key={`bubble-${mascotStep}`}>
                <div className="mascot-bubble">
                  <div className="mascot-title">{phase.title}</div>
                  <div className="mascot-message">{phase.message}</div>
                </div>
              </div>

              <div className="mascot-image-stage">
                {!mascotImgFailed[mascotStep] ? (
                  <img
                    key={mascotStep}
                    src={phase.image}
                    alt={phase.title}
                    onError={() =>
                      setMascotImgFailed((prev) => ({ ...prev, [mascotStep]: true }))
                    }
                  />
                ) : (
                  <span key={mascotStep} className="mascot-fallback">
                    {phase.fallback}
                  </span>
                )}
              </div>

              <div className="mascot-controls">
                <div className="mascot-dots">
                  {MASCOT_PHASES.map((_, i) => (
                    <span
                      key={i}
                      className={`mascot-dot${i === mascotStep ? " active" : ""}`}
                    />
                  ))}
                </div>
                <div className="mascot-actions">
                  <button type="button" className="mascot-skip" onClick={handleMascotSkip}>
                    Skip
                  </button>
                  <button type="button" className="mascot-next" onClick={handleMascotNext}>
                    {isLastMascotPhase ? "Let's go" : "Next"}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`card${mascotOpen ? " card-blurred" : ""}`}>
            <Link href="/" className="logo">Antyl</Link>

            {/* ── Stepper ── */}
            <OnboardingStepper currentStep={1} steps={ONBOARDING_STEPS} />

            <h1 className="card-title">Set up your profile</h1>
            <p className="card-sub">Tell companies a little about yourself</p>

            {/* Avatar upload */}
            <div className="avatar-row">
              <div className="avatar-circle" onClick={handlePhotoClick}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile photo" />
                ) : (
                  <svg className="avatar-placeholder" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                {avatarUploading && (
                  <div className="avatar-spinner">
                    <span className="spinner" style={{ borderTopColor: "#FF6B4D", borderColor: "rgba(255,107,77,0.25)" }} />
                  </div>
                )}
              </div>
              <div className="avatar-meta">
                <span className="avatar-label">Profile photo</span>
                <span className={`avatar-hint${avatarError ? " error" : ""}`}>
                  {avatarError || "JPEG, PNG, or WEBP · up to 200kb"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Name */}
              <div className="field">
                <label className="field-label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  className={`field-input${errors.name ? " error" : ""}`}
                  type="text"
                  placeholder="Vanshika Singh"
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
      </div>
    </>
  );
}