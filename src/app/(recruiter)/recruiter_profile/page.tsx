"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, CheckCircle2, Pencil, X } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  "w-full border border-gray-200 rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors";

const textareaClass =
  "w-full border border-gray-200 rounded-2xl px-5 py-3 min-h-[120px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors resize-none";

const MAX_LOGO_SIZE = 0.2 * 1024 * 1024; // 200kb
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      <p className="text-gray-600">
        {value ? value : <span className="text-gray-300">Not set</span>}
      </p>
    </div>
  );
}

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
    (Number(form.founded_year) >= 1900 && Number(form.founded_year) <= 2026);

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
    return (
      <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center relative overflow-hidden cursor-pointer group flex-shrink-0"
                onClick={handleLogoClick}
                title="Change company logo"
              >
                {savedProfile.logo_url ? (
                  <img
                    src={savedProfile.logo_url}
                    alt="Company logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-4.5 h-4.5 text-[#F2754A]" />
                )}

                {logoUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </div>
                )}

                {!logoUploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Pencil className="w-3.5 h-3.5 text-white" />
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {savedProfile.company_name
                  ? `${savedProfile.company_name} Profile`
                  : "Company Profile"}
              </h2>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                aria-label="Edit profile"
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#F2754A] hover:border-[#F2754A] transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-gray-400 mb-1 ml-[52px]">
            {isEditing
              ? "Update your company details"
              : "Your company details, visible to developers"}
          </p>
          {logoError && (
            <p className="text-xs font-semibold text-red-500 mb-6 ml-[52px]">{logoError}</p>
          )}
          {!logoError && <div className="mb-8" />}

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
            <div className="space-y-5">
              <Field label="Company Name" value={savedProfile.company_name} />
              <Field label="Industry" value={savedProfile.industry} />
              <Field
                label="Company Size"
                value={
                  savedProfile.company_size
                    ? `${savedProfile.company_size} Employees`
                    : ""
                }
              />
              <Field label="Website" value={savedProfile.website} />
              <Field label="Location" value={savedProfile.location} />
              <Field
                label="Remote Policy"
                value={
                  savedProfile.remote_policy
                    ? remotePolicyLabels[savedProfile.remote_policy] ??
                      savedProfile.remote_policy
                    : ""
                }
              />
              <Field label="Company Vision" value={savedProfile.company_vision} />
              <Field label="Founded Year" value={savedProfile.founded_year} />
              <Field
                label="Funding Stage"
                value={
                  savedProfile.funding_stage
                    ? fundingStageLabels[savedProfile.funding_stage] ??
                      savedProfile.funding_stage
                    : ""
                }
              />
              <Field label="LinkedIn" value={savedProfile.linkedin_url} />
              <Field label="Perks & Benefits" value={savedProfile.perks_benefits} />
              <Field label="About Company" value={savedProfile.about} />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Name <span className="text-[#F2754A]">*</span>
                </label>
                <input
                  className={inputClass}
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Industry <span className="text-[#F2754A]">*</span>
                </label>
                <input
                  className={inputClass}
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                  placeholder="Fintech"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Size <span className="text-[#F2754A]">*</span>
                </label>
                <select
                  className={inputClass}
                  value={form.company_size}
                  onChange={(e) =>
                    setForm({ ...form, company_size: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website
                </label>
                <input
                  className={inputClass}
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://company.com"
                />
                {!websiteValid && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    Enter a valid URL starting with http:// or https://
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Location
                </label>
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="Mumbai, India"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Remote Policy
                </label>
                <select
                  className={inputClass}
                  value={form.remote_policy}
                  onChange={(e) =>
                    setForm({ ...form, remote_policy: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Company Vision
                </label>
                <textarea
                  className={textareaClass}
                  value={form.company_vision}
                  onChange={(e) =>
                    setForm({ ...form, company_vision: e.target.value })
                  }
                  placeholder="What is your company building towards? What's the mission?"
                  maxLength={2000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.founded_year}
                    onChange={(e) =>
                      setForm({ ...form, founded_year: e.target.value })
                    }
                    placeholder="2021"
                    min={1900}
                    max={2026}
                  />
                  {!foundedYearValid && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      Enter a valid year
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Funding Stage
                  </label>
                  <select
                    className={inputClass}
                    value={form.funding_stage}
                    onChange={(e) =>
                      setForm({ ...form, funding_stage: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="bootstrapped">Bootstrapped</option>
                    <option value="pre-seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b-plus">Series B+</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  LinkedIn URL
                </label>
                <input
                  className={inputClass}
                  value={form.linkedin_url}
                  onChange={(e) =>
                    setForm({ ...form, linkedin_url: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/acme"
                />
                {!linkedinValid && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    Enter a valid URL starting with http:// or https://
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Perks & Benefits
                </label>
                <textarea
                  className={textareaClass}
                  value={form.perks_benefits}
                  onChange={(e) =>
                    setForm({ ...form, perks_benefits: e.target.value })
                  }
                  placeholder="Health insurance, equity, remote stipend, learning budget..."
                  maxLength={2000}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  About Company
                </label>
                <textarea
                  className={textareaClass}
                  value={form.about}
                  onChange={(e) =>
                    setForm({ ...form, about: e.target.value })
                  }
                  placeholder="Tell developers about your company, culture, mission and what makes it unique..."
                  maxLength={2000}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 rounded-full py-3.5 font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isValid || saving}
                  className="flex-1 rounded-full py-3.5 font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {!isValid && (
                <p className="text-xs text-gray-400 text-center">
                  Company name, industry, and company size are required.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}