"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, CheckCircle2 } from "lucide-react";

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
}

const emptyProfile: RecruiterProfile = {
  company_name: "",
  industry: "",
  company_size: "",
  website: "",
  about: "",
  location: "",
  remote_policy: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors";

const textareaClass =
  "w-full border border-gray-200 rounded-2xl px-5 py-3 min-h-[120px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors resize-none";

export default function RecruiterProfilePage() {
  const router = useRouter();

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<RecruiterProfile>(emptyProfile);

  const isValid =
    form.company_name.trim() !== "" &&
    form.industry.trim() !== "" &&
    form.company_size.trim() !== "";

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

        setForm({ ...emptyProfile, ...data.profile });
      } catch (err) {
        console.error(err);
        setError("We couldn't load your profile. Please refresh.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleSave() {
    if (!isValid) return;

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/recruiter/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save profile");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError("We couldn't save your profile. Please try again.");
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-[#F2754A]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Company Profile
            </h2>
          </div>
          <p className="text-gray-400 mb-8 ml-[52px]">
            Keep your company details up to date
          </p>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-2xl px-5 py-3 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-2xl px-5 py-3 mb-6">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Profile saved.</span>
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
                About Company
              </label>
              <textarea
                className={textareaClass}
                value={form.about}
                onChange={(e) =>
                  setForm({ ...form, about: e.target.value })
                }
                placeholder="Tell developers about your company, culture, mission and what makes it unique..."
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || saving}
              className="w-full rounded-full py-3.5 font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {!isValid && (
              <p className="text-xs text-gray-400 text-center">
                Company name, industry, and company size are required.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}