"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, Pencil } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RecruiterForm {
  company_name: string;
  industry: string;
  company_size: string;
  website: string;
  about: string;
  location: string;
  remote_policy: string;
  company_vision: string;
  founded_year: string;
  funding_stage: string;
  linkedin_url: string;
  perks_benefits: string;
}

const inputClass =
  "w-full border border-gray-200 rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors";

const textareaClass =
  "w-full border border-gray-200 rounded-2xl px-5 py-3 min-h-[120px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors resize-none";

const MAX_LOGO_SIZE = 0.2 * 1024 * 1024; // 200kb
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const initialForm: RecruiterForm = {
  company_name: "",
  industry: "",
  company_size: "",
  website: "",
  about: "",
  location: "",
  remote_policy: "",
  company_vision: "",
  founded_year: "",
  funding_stage: "",
  linkedin_url: "",
  perks_benefits: "",
};

export default function RecruiterOnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<RecruiterForm>(initialForm);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
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
    form.company_name.trim().length >= 2 &&
    form.industry.trim() !== "" &&
    form.company_size.trim() !== "" &&
    websiteValid &&
    linkedinValid &&
    foundedYearValid;

  const handleLogoClick = () => {
    if (logoUploading) return;
    fileInputRef.current?.click();
  };

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
      setLogoUrl(data.profile.logo_url);
    } catch (err) {
      console.error(err);
      setLogoError("Upload failed. Please try again.");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit() {
    if (!isValid) return;

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const payload = {
        company_name: form.company_name.trim(),
        industry: form.industry.trim(),
        company_size: form.company_size,
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
        // Pydantic 422 errors come back as data.detail = [{ msg, loc, ... }]
        const message = Array.isArray(data.detail)
          ? data.detail[0]?.msg || "Please check your inputs."
          : data.detail || "We couldn't save your profile. Please try again.";
        throw new Error(message);
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center relative overflow-hidden cursor-pointer group flex-shrink-0"
              onClick={handleLogoClick}
              title="Upload company logo"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
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
              Recruiter Profile
            </h2>
          </div>
          <p className="text-gray-400 mb-2 ml-[52px]">
            Tell developers about your company
          </p>
          {logoError && (
            <p className="text-xs font-semibold text-red-500 mb-6 ml-[52px]">{logoError}</p>
          )}
          {!logoError && <div className="mb-6" />}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-2xl px-5 py-3 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="w-full rounded-full py-3.5 font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              {loading ? "Saving..." : "Continue to Dashboard"}
            </button>

            {!isValid && (
              <p className="text-xs text-gray-400 text-center">
                Company name, industry, and company size are required to
                continue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}