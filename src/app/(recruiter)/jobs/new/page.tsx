"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  MapPin,
  Briefcase,
  X,
  IndianRupee,
  Zap,
} from "lucide-react";
import { createJob, autofillJob } from "@/services/recruiter-job.service";
import { getBalance } from "@/services/billing.service";
import TrustScoreSlider from "@/components/jobs/TrustScoreSlider";
import { isValidCity } from "@/lib/cities";
import CitySelect from "@/components/citySelect";
import OnboardingTour from "@/components/OnboardingTour";
import { jobFormTourSteps, JOB_FORM_TOUR_KEY } from "@/lib/tourSteps";

interface JobForm {
  title: string;
  description: string;
  required_tech_stack: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  location: string;
  is_remote: boolean;
  min_score: number;
  max_score: number;
}

const DRAFT_KEY = "antyl_new_job_draft";

// Salary is stored on `form` (and sent to the backend) in raw rupees, but
// the UI always shows/accepts LPA (lakhs per annum). These two helpers are
// the single place that conversion happens.
const RUPEES_PER_LPA = 100000;

function lpaToRupees(lpa: number): number {
  if (Number.isNaN(lpa)) return 0;
  return Math.round(lpa * RUPEES_PER_LPA);
}

function rupeesToLpaString(rupees: number): string {
  if (!rupees) return "";
  const lpa = rupees / RUPEES_PER_LPA;
  // Trim floating point noise (e.g. 14.999999999) without forcing
  // trailing zeros on whole numbers.
  return String(Number(lpa.toFixed(2)));
}

const EMPTY_FORM: JobForm = {
  title: "",
  description: "",
  required_tech_stack: "",
  experience_level: "entry",
  salary_min: 0,
  salary_max: 0,
  job_type: "full_time",
  location: "",
  is_remote: false,
  min_score: 0,
  max_score: 100,
};

const inputClass =
  "w-full border border-gray-200 rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors";

const textareaClass =
  "w-full border border-gray-200 rounded-2xl px-5 py-3 min-h-[140px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors resize-none";

function mapExperienceLevel(years: number): string {
  if (years <= 1) return "entry";
  if (years <= 4) return "mid";
  if (years <= 8) return "senior";
  return "lead";
}

// FIX: the AI autofill endpoint returns required_tech_stack as an array
// (to match the string[] shape createJob() sends to the backend), but this
// form's internal state — and the comma-separated text <input> — treat it
// as a single string. Anything that reads form.required_tech_stack needs to
// go through this so a stray array (from a fresh autofill response, or an
// old corrupted localStorage draft saved before this fix) never reaches
// .split() directly.
function toTechStackString(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

export default function NewJobPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // One-time "how this form works" tour. We check localStorage ourselves
  // (rather than always passing active=true) because OnboardingTour only
  // *writes* the storageKey on finish — it doesn't gate its own activation.
  const [tourActive, setTourActive] = useState<boolean>(() => {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(JOB_FORM_TOUR_KEY);
});

  useEffect(() => {
    async function loadBalance() {
      try {
        const bal = await getBalance();
        setBalance(bal);
      } catch (err) {
        console.error(err);
      } finally {
        setBalanceLoading(false);
      }
    }
    loadBalance();
  }, []);

  const outOfCredits = balance !== null && balance <= 0;

  const [experienceYears, setExperienceYears] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return 0;
      return JSON.parse(saved).experienceYears ?? 0;
    } catch {
      return 0;
    }
  });

  // Raw string backing the experience-years input so the field can be
  // temporarily empty while typing (e.g. clearing it to type "0"). Without
  // this, `value={experienceYears || ""}` collapses 0 and "" into the same
  // display, and the field can never show/hold a typed 0.
  const [experienceYearsInput, setExperienceYearsInput] = useState<string>(
    () => (experienceYears ? String(experienceYears) : "")
  );

  const [form, setForm] = useState<JobForm>(() => {
    if (typeof window === "undefined") return EMPTY_FORM;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return EMPTY_FORM;
      const parsed = JSON.parse(saved).form ?? EMPTY_FORM;
      // FIX: normalize on load, in case a draft was saved before this
      // fix with required_tech_stack already corrupted into an array,
      // or with a free-text location that's no longer valid against the
      // canonical city list.
      return {
        ...EMPTY_FORM,
        ...parsed,
        required_tech_stack: toTechStackString(parsed.required_tech_stack),
        location: isValidCity(parsed.location) ? parsed.location : "",
      };
    } catch {
      return EMPTY_FORM;
    }
  });

  // Raw string backing the two salary inputs, expressed in LPA (lakhs per
  // annum) — what the recruiter types and sees. `form.salary_min` /
  // `form.salary_max` stay in rupees underneath, since that's what the
  // backend expects.
  const [salaryMinInput, setSalaryMinInput] = useState<string>(() =>
    rupeesToLpaString(form.salary_min)
  );
  const [salaryMaxInput, setSalaryMaxInput] = useState<string>(() =>
    rupeesToLpaString(form.salary_max)
  );

  const hasDraft =
    JSON.stringify(form) !== JSON.stringify(EMPTY_FORM) || experienceYears !== 0;

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, experienceYears }));
  }, [form, experienceYears]);

  const techTags = toTechStackString(form.required_tech_stack)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setForm(EMPTY_FORM);
    setExperienceYears(0);
    setExperienceYearsInput("");
    setSalaryMinInput("");
    setSalaryMaxInput("");
  }

  const validate = () => {
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Job description is required.";
    if (!form.location.trim() && !form.is_remote)
      return "Add a location, or mark this as remote.";
    if (form.salary_max && form.salary_min > form.salary_max)
      return "Minimum salary can't be greater than maximum salary.";

    const techStack = toTechStackString(form.required_tech_stack).trim();
    if (techStack) {
      const hasComma = techStack.includes(",");
      const tokenCount = techStack.split(/\s+/).filter(Boolean).length;
      if (!hasComma && tokenCount > 1) {
        return "Please separate each skill with a comma (e.g. React, Node, Python).";
      }
    }

    return "";
  };

  // FIX: the AI autofill endpoint returns a free-text location string
  // (e.g. "Bangalore, India") — that's exactly the kind of un-canonical
  // spelling this whole change is meant to eliminate. Rather than trust
  // it directly, only keep the AI's location if it happens to match a
  // canonical city; otherwise leave the field blank so the recruiter
  // has to pick one explicitly from the dropdown.
  function normalizeAutofillLocation(raw: string): string {
    if (!raw) return "";
    const city = raw.split(",")[0].trim();
    return isValidCity(city) ? city : "";
  }

  async function handleAutofill() {
    if (!form.title.trim()) {
      setError("Enter a job title first so AI knows what to fill.");
      return;
    }
    try {
      setAutofilling(true);
      setError("");
      const result = await autofillJob(form.title);
      const years = result.experience_years ?? 0;
      setExperienceYears(years);
      setExperienceYearsInput(years ? String(years) : "");
      const techStackStr = toTechStackString(result.required_tech_stack);
      setSalaryMinInput(rupeesToLpaString(result.salary_min));
      setSalaryMaxInput(rupeesToLpaString(result.salary_max));
      setForm((prev) => ({
        ...prev,
        description: result.description,
        required_tech_stack: techStackStr,
        experience_level: result.experience_level,
        salary_min: result.salary_min,
        salary_max: result.salary_max,
        job_type: result.job_type,
        location: normalizeAutofillLocation(result.location),
        is_remote: result.is_remote,
      }));
    } catch {
      setError("Auto-fill failed. You can fill in the details manually.");
    } finally {
      setAutofilling(false);
    }
  }

  async function handleSubmit() {
    if (outOfCredits) {
      setError("You're out of job posting credits. Buy more to continue.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createJob({
        ...form,
        required_tech_stack: techTags,
      });

      localStorage.removeItem(DRAFT_KEY);
      setSuccess(true);
      setTimeout(() => router.push("/jobs"), 1200);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("credit")) {
        setError(message);
        setBalance(0);
      } else {
        setError("We couldn't create this job. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Create Job</h1>
            {hasDraft && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#F2754A] border border-orange-100">
                Draft saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasDraft && (
              <button
                type="button"
                onClick={discardDraft}
                className="text-xs font-semibold text-gray-400 hover:text-red-400 transition-colors"
              >
                Discard draft
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Back to jobs
            </button>
          </div>
        </div>

        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-5 py-3.5 mb-6 border ${
            outOfCredits
              ? "bg-red-50 border-red-100"
              : "bg-white border-gray-100 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                outOfCredits ? "bg-red-100" : "bg-orange-50"
              }`}
            >
              <Zap className={`w-4 h-4 ${outOfCredits ? "text-red-500" : "text-[#F2754A]"}`} />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {balanceLoading ? (
                "Checking your credits…"
              ) : outOfCredits ? (
                <span className="text-red-600">You are out of job posting credits.</span>
              ) : (
                <>
                  <span className="font-black">{balance}</span> job posting credit{balance !== 1 ? "s" : ""} remaining
                </>
              )}
            </p>
          </div>
          {(outOfCredits || (balance !== null && balance <= 2)) && (
            <button
              type="button"
              onClick={() => router.push("/billing")}
              className="text-xs font-bold px-3.5 py-2 rounded-full text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors flex-shrink-0"
            >
              Buy credits
            </button>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-2xl px-5 py-3 mb-6">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Job created successfully. Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-2xl px-5 py-3 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

          <div data-tour="job-title">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">
                Job Title<span className="ml-1 text-red-500">*</span>
              </label>
              <button
                type="button"
                data-tour="job-autofill"
                onClick={handleAutofill}
                disabled={autofilling || !form.title.trim()}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#F2754A] text-[#F2754A] hover:bg-orange-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {autofilling ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border border-[#F2754A] border-t-transparent rounded-full" />
                    Filling…
                  </>
                ) : (
                  <>✦ Auto-fill with AI</>
                )}
              </button>
            </div>
            <input
              className={inputClass}
              placeholder="e.g. Senior Backend Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {!autofilling && !form.title.trim() && (
              <p className="text-xs text-gray-400 mt-1.5 px-1">
                Type a title above, then click Auto-fill to generate details.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              className={textareaClass}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div data-tour="job-tech-stack">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Required Tech Stack
            </label>
            <input
              className={inputClass}
              placeholder="React, Node, Python"
              value={form.required_tech_stack}
              onChange={(e) =>
                setForm({ ...form, required_tech_stack: e.target.value })
              }
            />
            <p className="text-xs text-gray-400 mt-2">
              Separate each skill with a comma.
            </p>
            {techTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {techTags.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-orange-50 text-[#F2754A] text-xs font-semibold rounded-full border border-orange-100"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Experience (years)
              </label>
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="e.g. 3"
                value={experienceYearsInput}
                onWheel={preventWheelChange}
                onChange={(e) => {
                  const raw = e.target.value;
                  setExperienceYearsInput(raw);

                  if (raw === "") {
                    // Let the field be blank while editing; don't touch
                    // experienceYears/form until there's a real number.
                    return;
                  }

                  const years = Number(raw);
                  if (!Number.isNaN(years)) {
                    setExperienceYears(years);
                    setForm({ ...form, experience_level: mapExperienceLevel(years) });
                  }
                }}
                onBlur={() => {
                  // If left blank, snap back to a valid numeric value.
                  if (experienceYearsInput === "") {
                    setExperienceYearsInput(
                      experienceYears ? String(experienceYears) : ""
                    );
                  }
                }}
              />
              {experienceYearsInput !== "" && (
                <p className="text-xs text-[#F2754A] font-semibold mt-1.5 px-1">
                  Maps to: {mapExperienceLevel(experienceYears)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Job Type
              </label>
              <select
                className={inputClass}
                value={form.job_type}
                onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Min Salary (LPA)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                className={inputClass}
                placeholder="e.g. 8"
                value={salaryMinInput}
                onWheel={preventWheelChange}
                onChange={(e) => {
                  const raw = e.target.value;
                  setSalaryMinInput(raw);
                  setForm({
                    ...form,
                    salary_min: raw === "" ? 0 : lpaToRupees(Number(raw)),
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Max Salary (LPA)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                className={inputClass}
                placeholder="e.g. 15"
                value={salaryMaxInput}
                onWheel={preventWheelChange}
                onChange={(e) => {
                  const raw = e.target.value;
                  setSalaryMaxInput(raw);
                  setForm({
                    ...form,
                    salary_max: raw === "" ? 0 : lpaToRupees(Number(raw)),
                  });
                }}
              />
              {form.salary_max > 0 && form.salary_min > form.salary_max && (
                <p className="text-xs text-red-500 font-semibold mt-1.5 px-1">
                  Max salary must be greater than min salary.
                </p>
              )}
            </div>
          </div>

          {/* Location — was a free-text <input>, now a canonical CitySelect
              so recruiters can't introduce spelling variants (e.g.
              "Bangalore" vs "Bengaluru") that break exact-match filtering
              against developer preferred_locations. */}
          <div data-tour="job-location">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Location
            </label>
            <CitySelect
              mode="single"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v as string })}
              placeholder="Select a city"
              disabled={form.is_remote}
            />
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, is_remote: !form.is_remote })}
            className="flex items-center justify-between w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4"
          >
            <span className="text-sm font-medium text-gray-900">
              Remote Position
            </span>
            <div
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                form.is_remote ? "bg-[#F2754A]" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  form.is_remote ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          <div data-tour="job-score-slider">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Antyl Score Range
            </label>
            <TrustScoreSlider
              minScore={form.min_score}
              maxScore={form.max_score}
              onMinChange={(value) => setForm({ ...form, min_score: value })}
              onMaxChange={(value) => setForm({ ...form, max_score: value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>

            <button
              type="button"
              data-tour="job-submit"
              onClick={handleSubmit}
              disabled={saving || outOfCredits}
              title={outOfCredits ? "Buy more credits to post a job" : undefined}
              className="flex-1 px-6 py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
            >
              {saving ? "Creating..." : outOfCredits ? "Out of credits" : "Create Job"}
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {form.title || "Untitled role"}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {(form.location || form.is_remote) && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {form.is_remote ? "Remote" : form.location}
                    </span>
                  )}
                  {form.is_remote && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                      Remote
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#F2754A] capitalize">
                    {form.job_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    {form.experience_level}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <IndianRupee className="w-4 h-4 text-[#F2754A]" />
                {rupeesToLpaString(form.salary_min) || "0"} – {rupeesToLpaString(form.salary_max) || "0"} LPA
                <span className="font-normal text-gray-400">/ year</span>
              </div>

              {form.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {form.description}
                  </p>
                </div>
              )}

              {techTags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {techTags.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF6F0] text-gray-700 border border-gray-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Antyl Score Range
                </p>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
                >
                  {form.min_score} – {form.max_score}
                </span>
              </div>

              {experienceYears > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Briefcase className="w-4 h-4" />
                  {experienceYears}+ years ·{" "}
                  <span className="capitalize">{form.experience_level} level</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-sm font-semibold px-5 py-2.5 rounded-full text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <OnboardingTour
        steps={jobFormTourSteps}
        storageKey={JOB_FORM_TOUR_KEY}
        active={tourActive}
        onFinish={() => setTourActive(false)}
      />
    </div>
  );
}