"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Gift,
  Globe,
  Info,
  MapPin,
  Pencil,
  Rocket,
  Target,
  Users,
  Wifi,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const GRADIENT = "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)";
const CURRENT_YEAR = new Date().getFullYear();

interface RecruiterProfile {
  company_name: string;
  industry: string;
  company_size: string;
  website: string;
  about: string;
  location: string;
  remote_policy: string;
  logo_url?: string;
  company_vision: string;
  founded_year: string;
  funding_stage: string;
  linkedin_url: string;
  perks_benefits: string;
}

const emptyProfile: RecruiterProfile = {
  company_name: "",
  industry: "",
  company_size: "",
  website: "",
  about: "",
  location: "",
  remote_policy: "",
  logo_url: "",
  company_vision: "",
  founded_year: "",
  funding_stage: "",
  linkedin_url: "",
  perks_benefits: "",
};

// Ensures every field is a safe string ("" instead of null/undefined) so
// that .trim() calls on form fields never crash, regardless of what the
// backend returns.
function sanitizeProfile(raw: Partial<RecruiterProfile>): RecruiterProfile {
  const merged: RecruiterProfile = { ...emptyProfile, ...raw };
  const result = { ...emptyProfile };
  (Object.keys(emptyProfile) as (keyof RecruiterProfile)[]).forEach((key) => {
    const value = merged[key];
    result[key] = value === null || value === undefined ? "" : value;
  });
  return result;
}

const remotePolicyLabels: Record<string, string> = {
  onsite: "Onsite",
  hybrid: "Hybrid",
  remote: "Remote",
};

const fundingStageLabels: Record<string, string> = {
  bootstrapped: "Bootstrapped",
  "pre-seed": "Pre-seed",
  seed: "Seed",
  "series-a": "Series A",
  "series-b-plus": "Series B+",
  public: "Public",
};

const inputClass =
  "w-full border border-gray-200 bg-white rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition";

const textareaClass =
  "w-full border border-gray-200 bg-white rounded-2xl px-5 py-3 min-h-[120px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition resize-none";

const MAX_LOGO_SIZE = 0.2 * 1024 * 1024; // 200kb
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// lucide-react no longer ships brand icons, so LinkedIn's logo is inlined.
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Small building blocks ────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#F2754A]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// Long-form text block (vision, about, perks) in view mode.
function TextBlock({ value, emptyText }: { value: string; emptyText: string }) {
  return value ? (
    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{value}</p>
  ) : (
    <p className="text-sm text-gray-300">{emptyText}</p>
  );
}

// Label + value row with an icon tile. Renders as a link when href is given.
function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#F2754A] hover:underline block truncate"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
          )
        ) : (
          <p className="text-sm text-gray-300">Not set</p>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {label} {required && <span className="text-[#F2754A]">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#F2754A]">
      {children}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-5xl mx-auto animate-pulse">
        <div className="h-40 bg-white rounded-[24px] border border-gray-100 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-white rounded-[24px] border border-gray-100" />
            <div className="h-48 bg-white rounded-[24px] border border-gray-100" />
          </div>
          <div className="h-80 bg-white rounded-[24px] border border-gray-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function RecruiterProfilePage() {
  const router = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [savedProfile, setSavedProfile] =
    useState<RecruiterProfile>(emptyProfile);
  const [form, setForm] = useState<RecruiterProfile>(emptyProfile);

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const websiteValid =
    form.website.trim() === "" || URL_REGEX.test(form.website.trim());
  const linkedinValid =
    form.linkedin_url.trim() === "" || URL_REGEX.test(form.linkedin_url.trim());
  const foundedYearValid =
    form.founded_year.trim() === "" ||
    (Number(form.founded_year) >= 1900 && Number(form.founded_year) <= CURRENT_YEAR);

  const isValid =
    form.company_name.trim() !== "" &&
    form.industry.trim() !== "" &&
    form.company_size.trim() !== "" &&
    websiteValid &&
    linkedinValid &&
    foundedYearValid;

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_URL}/recruiter/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          // No profile yet — send them through onboarding instead.
          router.push("/recruiter/onboarding");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to load profile");
        }

        const merged = sanitizeProfile({
          ...data.profile,
          founded_year: data.profile.founded_year
            ? String(data.profile.founded_year)
            : "",
        });
        setSavedProfile(merged);
        setForm(merged);
      } catch (err) {
        console.error(err);
        setError("We couldn't load your profile. Please refresh.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleStartEdit() {
    setForm(savedProfile);
    setError("");
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setForm(savedProfile);
    setError("");
    setIsEditing(false);
  }

  function handleLogoClick() {
    if (logoUploading) return;
    fileInputRef.current?.click();
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError("");

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Use a JPEG, PNG, or WEBP image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Image must be under 200kb");
      e.target.value = "";
      return;
    }

    setLogoUploading(true);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/recruiter/profile/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload logo");
      }

      const data = await res.json();
      const newLogoUrl = (data.profile.logo_url as string) || "";

      setSavedProfile((prev) => ({ ...prev, logo_url: newLogoUrl }));
      setForm((prev) => ({ ...prev, logo_url: newLogoUrl }));
    } catch (err) {
      console.error(err);
      setLogoError("Upload failed. Please try again.");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    if (!isValid) return;

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const token = localStorage.getItem("access_token");

      const payload = {
        ...form,
        company_name: form.company_name.trim(),
        industry: form.industry.trim(),
        website: form.website.trim() || null,
        about: form.about.trim() || null,
        location: form.location.trim() || null,
        remote_policy: form.remote_policy || null,
        company_vision: form.company_vision.trim() || null,
        founded_year: form.founded_year.trim()
          ? parseInt(form.founded_year, 10)
          : null,
        funding_stage: form.funding_stage || null,
        linkedin_url: form.linkedin_url.trim() || null,
        perks_benefits: form.perks_benefits.trim() || null,
      };

      const res = await fetch(`${API_URL}/recruiter/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail[0]?.msg || "Please check your inputs."
          : data.detail || "We couldn't save your profile. Please try again.";
        throw new Error(message);
      }

      const merged = sanitizeProfile({
        ...form,
        founded_year: form.founded_year ? String(form.founded_year) : "",
      });
      setSavedProfile(merged);
      setIsEditing(false);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (initialLoading) {
    return <ProfileSkeleton />;
  }

  const p = savedProfile;
  const companySizeLabel = p.company_size
    ? p.company_size === "500+"
      ? "500+ employees"
      : `${p.company_size} employees`
    : "";
  const remoteLabel = p.remote_policy
    ? remotePolicyLabels[p.remote_policy] ?? p.remote_policy
    : "";
  const fundingLabel = p.funding_stage
    ? fundingStageLabels[p.funding_stage] ?? p.funding_stage
    : "";

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-5xl mx-auto">
        {/* Hero card */}
        <div className="bg-white rounded-[24px] border-2 border-[#F2754A]/25 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Logo */}
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] bg-orange-50 flex items-center justify-center overflow-hidden cursor-pointer group flex-shrink-0"
              onClick={handleLogoClick}
              title="Change company logo"
            >
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logo_url}
                  alt="Company logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-[#F2754A]" />
              )}

              {logoUploading ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            {/* Title + chips */}
            <div className="min-w-0 flex-1">
              <h1
                className="text-2xl sm:text-3xl font-bold text-gray-900 truncate"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                {p.company_name || "Company Profile"}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {isEditing
                  ? "Update your company details"
                  : "Your company details, visible to developers"}
              </p>
              {!isEditing && (p.industry || companySizeLabel || fundingLabel || remoteLabel) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.industry && <Chip>{p.industry}</Chip>}
                  {companySizeLabel && <Chip>{companySizeLabel}</Chip>}
                  {fundingLabel && <Chip>{fundingLabel}</Chip>}
                  {remoteLabel && <Chip>{remoteLabel}</Chip>}
                </div>
              )}
              {logoError && (
                <p className="text-xs font-semibold text-red-500 mt-2">{logoError}</p>
              )}
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 sm:py-2.5 rounded-full text-white w-full sm:w-auto shadow-md shadow-orange-100 transition hover:-translate-y-0.5 hover:shadow-lg flex-shrink-0"
                style={{ background: GRADIENT }}
              >
                <Pencil className="w-4 h-4" />
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Banners */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-2xl px-5 py-3 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {saved && !isEditing && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-2xl px-5 py-3 mb-6">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Profile saved.</span>
          </div>
        )}

        {!isEditing ? (
          /* ── View mode ─────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="About company" subtitle="Who you are and what makes you unique" icon={Info}>
                <TextBlock value={p.about} emptyText="Add a short description so developers know who you are." />
              </SectionCard>

              <SectionCard title="Company vision" subtitle="What you're building towards" icon={Target}>
                <TextBlock value={p.company_vision} emptyText="Share your mission and where the company is headed." />
              </SectionCard>

              <SectionCard title="Perks & benefits" subtitle="Why developers will want to join" icon={Gift}>
                <TextBlock value={p.perks_benefits} emptyText="List the perks that set you apart." />
              </SectionCard>
            </div>

            <div className="h-fit">
              <SectionCard title="Company details" icon={Building2}>
                <div className="space-y-4">
                  <InfoRow icon={Users} label="Company size" value={companySizeLabel} />
                  <InfoRow icon={CalendarDays} label="Founded" value={p.founded_year} />
                  <InfoRow icon={Rocket} label="Funding stage" value={fundingLabel} />
                  <InfoRow icon={MapPin} label="Location" value={p.location} />
                  <InfoRow icon={Wifi} label="Remote policy" value={remoteLabel} />
                  <InfoRow icon={Globe} label="Website" value={p.website} href={p.website || undefined} />
                  <InfoRow
                    icon={LinkedInIcon}
                    label="LinkedIn"
                    value={p.linkedin_url}
                    href={p.linkedin_url || undefined}
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        ) : (
          /* ── Edit mode ─────────────────────────────────────────── */
          <div className="space-y-6">
            <SectionCard title="Basics" subtitle="The essentials developers see first" icon={Building2}>
              <div className="space-y-5">
                <FormField label="Company Name" required>
                  <input
                    className={inputClass}
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="Acme Inc."
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Industry" required>
                    <input
                      className={inputClass}
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      placeholder="Fintech"
                    />
                  </FormField>

                  <FormField label="Company Size" required>
                    <select
                      className={inputClass}
                      value={form.company_size}
                      onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="500+">500+</option>
                    </select>
                  </FormField>

                  <FormField label="Founded Year" error={!foundedYearValid ? "Enter a valid year" : undefined}>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.founded_year}
                      onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                      placeholder="2021"
                      min={1900}
                      max={CURRENT_YEAR}
                    />
                  </FormField>

                  <FormField label="Funding Stage">
                    <select
                      className={inputClass}
                      value={form.funding_stage}
                      onChange={(e) => setForm({ ...form, funding_stage: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="bootstrapped">Bootstrapped</option>
                      <option value="pre-seed">Pre-seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b-plus">Series B+</option>
                      <option value="public">Public</option>
                    </select>
                  </FormField>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Location & links" subtitle="Where you work and where to find you" icon={MapPin}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Location">
                  <input
                    className={inputClass}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Bangalore, India"
                  />
                </FormField>

                <FormField label="Remote Policy">
                  <select
                    className={inputClass}
                    value={form.remote_policy}
                    onChange={(e) => setForm({ ...form, remote_policy: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </FormField>

                <FormField
                  label="Website"
                  error={!websiteValid ? "Enter a valid URL starting with http:// or https://" : undefined}
                >
                  <input
                    className={inputClass}
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://company.com"
                  />
                </FormField>

                <FormField
                  label="LinkedIn URL"
                  error={!linkedinValid ? "Enter a valid URL starting with http:// or https://" : undefined}
                >
                  <input
                    className={inputClass}
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/company/acme"
                  />
                </FormField>
              </div>
            </SectionCard>

            <SectionCard title="Your story" subtitle="Help developers get excited about joining" icon={Info}>
              <div className="space-y-5">
                <FormField label="About Company">
                  <textarea
                    className={textareaClass}
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    placeholder="Tell developers about your company, culture, mission and what makes it unique..."
                    maxLength={2000}
                  />
                </FormField>

                <FormField label="Company Vision">
                  <textarea
                    className={textareaClass}
                    value={form.company_vision}
                    onChange={(e) => setForm({ ...form, company_vision: e.target.value })}
                    placeholder="What is your company building towards? What's the mission?"
                    maxLength={2000}
                  />
                </FormField>

                <FormField label="Perks & Benefits">
                  <textarea
                    className={textareaClass}
                    value={form.perks_benefits}
                    onChange={(e) => setForm({ ...form, perks_benefits: e.target.value })}
                    placeholder="Health insurance, equity, remote stipend, learning budget..."
                    maxLength={2000}
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* Action bar */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 rounded-full py-3.5 text-sm font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isValid || saving}
                  className="flex-1 rounded-full py-3.5 text-sm font-bold text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                  style={{ background: GRADIENT }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {!isValid && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Company name, industry, and company size are required.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}