"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  IndianRupee,
  MapPin,
  Briefcase,
  Sparkles,
  Target,
  X,
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
  min_experience_years: number;
  max_experience_years: number;
  salary_min: number;
  salary_max: number;
  job_type: string;
  location: string;
  is_remote: boolean;
  min_score: number;
  max_score: number;
  max_notice_period_days: number;
}

const DRAFT_KEY = "antyl_new_job_draft";

const GRADIENT = "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)";

const RUPEES_PER_LPA = 100000;

function lpaToRupees(lpa: number): number {
  if (Number.isNaN(lpa)) return 0;
  return Math.round(lpa * RUPEES_PER_LPA);
}

function rupeesToLpaString(rupees: number): string {
  if (!rupees) return "";
  const lpa = rupees / RUPEES_PER_LPA;
  return String(Number(lpa.toFixed(2)));
}

const EMPTY_FORM: JobForm = {
  title: "",
  description: "",
  required_tech_stack: "",
  experience_level: "entry",
  min_experience_years: 0,
  max_experience_years: 0,
  salary_min: 0,
  salary_max: 0,
  job_type: "full_time",
  location: "",
  is_remote: false,
  min_score: 0,
  max_score: 100,
  max_notice_period_days: 0,
};

const inputClass =
  "w-full border border-gray-200 bg-white rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition";

const textareaClass =
  "w-full border border-gray-200 bg-white rounded-2xl px-5 py-3 min-h-[140px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition resize-none";

const summaryTextareaClass =
  "w-full border border-gray-200 bg-white rounded-2xl px-5 py-3 min-h-[110px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition resize-none";

function mapExperienceLevel(years: number): string {
  if (years <= 1) return "entry";
  if (years <= 4) return "mid";
  if (years <= 8) return "senior";
  return "lead";
}

function toTechStackString(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
}

const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-gray-900 mb-2">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-2 px-1">{children}</p>;
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-500 font-semibold mt-1.5 px-1">{children}</p>;
}

function PreviewModal({
  form,
  techTags,
  onClose,
}: {
  form: JobForm;
  techTags: string[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-[#F2754A]" />
            </div>
            <div className="min-w-0">
              <h2
                className="text-xl sm:text-2xl font-bold text-gray-900"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                {form.title || "Untitled role"}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {(form.location || form.is_remote) && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {form.is_remote ? "Remote" : form.location}
                  </span>
                )}
                {form.is_remote && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                    Remote
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#F2754A] capitalize">
                  {form.job_type.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                  {form.experience_level}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-[#F2754A]" />
            </div>
            <span className="tabular-nums">
              {rupeesToLpaString(form.salary_min) || "0"} –{" "}
              {rupeesToLpaString(form.salary_max) || "0"} LPA
            </span>
            <span className="font-normal text-gray-400">/ year</span>
          </div>

          {form.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Description
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {form.description}
              </p>
            </div>
          )}

          {techTags.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Antyl Score Range
            </p>
            <span
              className="inline-block text-sm font-bold px-3 py-1.5 rounded-full text-white tabular-nums"
              style={{ background: GRADIENT }}
            >
              {form.min_score} – {form.max_score}
            </span>
          </div>

          {(form.min_experience_years > 0 || form.max_experience_years > 0) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase className="w-4 h-4" />
              {form.min_experience_years}–{form.max_experience_years} years ·{" "}
              <span className="capitalize">{form.experience_level} level</span>
            </div>
          )}

          {form.max_notice_period_days > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock3 className="w-4 h-4" />
              Needs to join within {form.max_notice_period_days} day
              {form.max_notice_period_days !== 1 ? "s" : ""}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [showAutofillModal, setShowAutofillModal] = useState(false);
  const [autofillSummary, setAutofillSummary] = useState("");
  const [autofillSummaryError, setAutofillSummaryError] = useState("");

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

  const [form, setForm] = useState<JobForm>(() => {
    if (typeof window === "undefined") return EMPTY_FORM;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return EMPTY_FORM;
      const parsed = JSON.parse(saved).form ?? EMPTY_FORM;
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

  // Raw strings backing the min/max experience inputs so they can be
  // temporarily empty while typing, same pattern as the salary inputs below.
  const [minExpInput, setMinExpInput] = useState<string>(() =>
    form.min_experience_years ? String(form.min_experience_years) : ""
  );
  const [maxExpInput, setMaxExpInput] = useState<string>(() =>
    form.max_experience_years ? String(form.max_experience_years) : ""
  );

  const [noticePeriodInput, setNoticePeriodInput] = useState<string>(() =>
    form.max_notice_period_days ? String(form.max_notice_period_days) : ""
  );

  const [salaryMinInput, setSalaryMinInput] = useState<string>(() =>
    rupeesToLpaString(form.salary_min)
  );
  const [salaryMaxInput, setSalaryMaxInput] = useState<string>(() =>
    rupeesToLpaString(form.salary_max)
  );

  const hasDraft = JSON.stringify(form) !== JSON.stringify(EMPTY_FORM);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form }));
  }, [form]);

  const techTags = toTechStackString(form.required_tech_stack)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setForm(EMPTY_FORM);
    setMinExpInput("");
    setMaxExpInput("");
    setNoticePeriodInput("");
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
    if (
      form.max_experience_years &&
      form.min_experience_years > form.max_experience_years
    )
      return "Minimum experience can't be greater than maximum experience.";

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

  function normalizeAutofillLocation(raw: string): string {
    if (!raw) return "";
    const city = raw.split(",")[0].trim();
    return isValidCity(city) ? city : "";
  }

  function openAutofillModal() {
    if (!form.title.trim()) {
      setError("Enter a job title first so AI knows what to fill.");
      return;
    }
    setError("");
    setAutofillSummaryError("");
    setShowAutofillModal(true);
  }

  function closeAutofillModal() {
    setShowAutofillModal(false);
    setAutofillSummaryError("");
  }

  async function handleAutofill() {
    const summary = autofillSummary.trim();
    if (!summary) {
      setAutofillSummaryError(
        "Add a quick 3-4 line summary so the AI has something to go on."
      );
      return;
    }

    try {
      setAutofilling(true);
      setError("");
      setShowAutofillModal(false);

      const result = await autofillJob(form.title, summary);

      // The AI only returns a single experience_years figure, not a
      // range — use it as a starting point for both min and max; the
      // recruiter can widen it manually afterwards.
      const years = result.experience_years ?? 0;
      setMinExpInput(years ? String(years) : "");
      setMaxExpInput(years ? String(years) : "");

      const techStackStr = toTechStackString(result.required_tech_stack);
      setSalaryMinInput(rupeesToLpaString(result.salary_min));
      setSalaryMaxInput(rupeesToLpaString(result.salary_max));
      setForm((prev) => ({
        ...prev,
        description: result.description,
        required_tech_stack: techStackStr,
        experience_level: result.experience_level,
        min_experience_years: years,
        max_experience_years: years,
        salary_min: result.salary_min,
        salary_max: result.salary_max,
        job_type: result.job_type,
        location: normalizeAutofillLocation(result.location),
        is_remote: result.is_remote,
      }));
      setAutofillSummary("");
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
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-2xl sm:text-3xl font-bold text-gray-900"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                Create Job
              </h1>
              {hasDraft && (
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-orange-50 text-[#F2754A]">
                  Draft saved
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Describe the role and set who you want to reach. Each posting uses one credit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasDraft && (
              <button
                type="button"
                onClick={discardDraft}
className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Discard draft
              </button>
            )}
            {/* <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to jobs
            </button> */}
          </div>
        </div>

        {/* Credits */}
        <div
          className={`flex items-center justify-between gap-3 rounded-[20px] px-5 py-4 mb-6 border ${
            outOfCredits
              ? "bg-red-50 border-red-100"
              : "bg-white border-gray-100 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                outOfCredits ? "bg-red-100" : "bg-orange-50"
              }`}
            >
              <Zap className={`w-[18px] h-[18px] ${outOfCredits ? "text-red-500" : "text-[#F2754A]"}`} />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {balanceLoading ? (
                "Checking your credits…"
              ) : outOfCredits ? (
                <span className="text-red-600">You are out of job posting credits.</span>
              ) : (
                <>
                  <span className="font-black tabular-nums">{balance}</span> job posting credit
                  {balance !== 1 ? "s" : ""} remaining
                </>
              )}
            </p>
          </div>
          {(outOfCredits || (balance !== null && balance <= 2)) && (
            <button
              type="button"
              onClick={() => router.push("/billing")}
              className="text-xs font-bold px-4 py-2 rounded-full text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 flex-shrink-0"
              style={{ background: GRADIENT }}
            >
              Buy credits
            </button>
          )}
        </div>

        {/* Banners */}
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

        <div className="space-y-6">
          {/* ── Role basics ── */}
          <SectionCard
            title="Role basics"
            subtitle="Start with a title, then let AI help with the rest"
            icon={FileText}
          >
            <div className="space-y-5">
              <div data-tour="job-title">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="text-sm font-bold text-gray-900">
                    Job Title<span className="ml-1 text-[#F2754A]">*</span>
                  </label>
                  <button
                    type="button"
                    data-tour="job-autofill"
                    onClick={openAutofillModal}
                    disabled={autofilling || !form.title.trim()}
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#F2754A] text-[#F2754A] hover:bg-orange-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {autofilling ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-[#F2754A] border-t-transparent rounded-full" />
                        Filling…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Auto-fill with AI
                      </>
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
                  <Hint>Type a title above, then click Auto-fill to generate details.</Hint>
                )}
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className={textareaClass}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div data-tour="job-tech-stack">
                <Label>Required Tech Stack</Label>
                <input
                  className={inputClass}
                  placeholder="React, Node, Python"
                  value={form.required_tech_stack}
                  onChange={(e) =>
                    setForm({ ...form, required_tech_stack: e.target.value })
                  }
                />
                <Hint>Separate each skill with a comma.</Hint>
                {techTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {techTags.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-orange-50 text-[#F2754A] text-xs font-bold rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Requirements ── */}
          <SectionCard
            title="Requirements"
            subtitle="Experience and how soon someone needs to join"
            icon={Clock3}
          >
            <div className="space-y-5">
              {/* Experience range — stored as min_experience_years and
                  max_experience_years so the backend/preview can show a
                  real "X–Y years" range instead of a single number. */}
              <div data-tour="job-experience">
                <Label>Experience Range (years)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="Min e.g. 3"
                    value={minExpInput}
                    onWheel={preventWheelChange}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setMinExpInput(raw);
                      if (raw === "") return;
                      const min = Number(raw);
                      if (!Number.isNaN(min)) {
                        setForm((prev) => ({
                          ...prev,
                          min_experience_years: min,
                          experience_level: mapExperienceLevel(
                            prev.max_experience_years || min
                          ),
                        }));
                      }
                    }}
                    onBlur={() => {
                      if (minExpInput === "") {
                        setMinExpInput(
                          form.min_experience_years
                            ? String(form.min_experience_years)
                            : ""
                        );
                      }
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="Max e.g. 5"
                    value={maxExpInput}
                    onWheel={preventWheelChange}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setMaxExpInput(raw);
                      if (raw === "") return;
                      const max = Number(raw);
                      if (!Number.isNaN(max)) {
                        setForm((prev) => ({
                          ...prev,
                          max_experience_years: max,
                          experience_level: mapExperienceLevel(
                            max || prev.min_experience_years
                          ),
                        }));
                      }
                    }}
                    onBlur={() => {
                      if (maxExpInput === "") {
                        setMaxExpInput(
                          form.max_experience_years
                            ? String(form.max_experience_years)
                            : ""
                        );
                      }
                    }}
                  />
                </div>
                {(minExpInput !== "" || maxExpInput !== "") && (
                  <p className="text-xs text-[#F2754A] font-bold mt-2 px-1 capitalize">
                    Maps to: {form.experience_level} level
                  </p>
                )}
                {form.max_experience_years > 0 &&
                  form.min_experience_years > form.max_experience_years && (
                    <FieldError>Max experience must be greater than min experience.</FieldError>
                  )}
              </div>

              {/* Notice period — how quickly a candidate must be able to join.
                  Feeds the notice_period match score on the backend; candidates
                  needing longer than this score proportionally lower instead of
                  being hard-excluded. */}
              <div data-tour="job-notice-period">
                <Label>Max Notice Period (days)</Label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="e.g. 7"
                  value={noticePeriodInput}
                  onWheel={preventWheelChange}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setNoticePeriodInput(raw);
                    if (raw === "") {
                      setForm((prev) => ({ ...prev, max_notice_period_days: 0 }));
                      return;
                    }
                    const days = Number(raw);
                    if (!Number.isNaN(days)) {
                      setForm((prev) => ({ ...prev, max_notice_period_days: days }));
                    }
                  }}
                  onBlur={() => {
                    if (noticePeriodInput === "") {
                      setNoticePeriodInput(
                        form.max_notice_period_days
                          ? String(form.max_notice_period_days)
                          : ""
                      );
                    }
                  }}
                />
                <Hint>
                  How soon a candidate needs to be able to join. Leave blank if flexible.
                </Hint>
              </div>
            </div>
          </SectionCard>

          {/* ── Compensation & location ── */}
          <SectionCard
            title="Compensation & location"
            subtitle="Job type, salary range and where the role is based"
            icon={IndianRupee}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Label>Job Type</Label>
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
                  <Label>Min Salary (LPA)</Label>
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
                      setForm((prev) => ({
                        ...prev,
                        salary_min: raw === "" ? 0 : lpaToRupees(Number(raw)),
                      }));
                    }}
                  />
                </div>

                <div>
                  <Label>Max Salary (LPA)</Label>
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
                      setForm((prev) => ({
                        ...prev,
                        salary_max: raw === "" ? 0 : lpaToRupees(Number(raw)),
                      }));
                    }}
                  />
                  {form.salary_max > 0 && form.salary_min > form.salary_max && (
                    <FieldError>Max salary must be greater than min salary.</FieldError>
                  )}
                </div>
              </div>

              <div data-tour="job-location">
                <Label>Location</Label>
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
                role="switch"
                aria-checked={form.is_remote}
                onClick={() => setForm({ ...form, is_remote: !form.is_remote })}
                className="flex items-center justify-between w-full rounded-2xl border border-gray-100 bg-[#FAF6F0] px-5 py-4 transition hover:border-gray-200"
              >
                <span className="text-sm font-bold text-gray-900">Remote Position</span>
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    form.is_remote ? "bg-[#F2754A]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      form.is_remote ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </SectionCard>

          {/* ── Antyl score ── */}
          <SectionCard
            title="Antyl Score Range"
            subtitle="Only match developers whose verified score falls in this range"
            icon={Target}
          >
            <div data-tour="job-score-slider">
              <TrustScoreSlider
                minScore={form.min_score}
                maxScore={form.max_score}
                onMinChange={(value) => setForm({ ...form, min_score: value })}
                onMaxChange={(value) => setForm({ ...form, max_score: value })}
              />
            </div>
          </SectionCard>

          {/* ── Actions ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors"
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
                className="flex-1 px-6 py-3.5 rounded-full text-sm font-bold text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                style={{ background: GRADIENT }}
              >
                {saving ? "Creating..." : outOfCredits ? "Out of credits" : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Autofill modal */}
      {showAutofillModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
          onClick={closeAutofillModal}
        >
          <div
            className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#F2754A]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Tell us a bit more</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Give a quick 3-4 line summary of the role for{" "}
                    <span className="font-semibold text-gray-700">
                      {form.title || "this role"}
                    </span>
                    , and AI will fill in the rest.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAutofillModal}
                aria-label="Close"
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <textarea
                autoFocus
                className={summaryTextareaClass}
                placeholder={
                  "e.g. Backend-heavy role on our payments team, mostly Node and Postgres. Needs someone comfortable owning services end-to-end. Hybrid, 3 days in office. Ideally 3-5 years experience."
                }
                value={autofillSummary}
                onChange={(e) => {
                  setAutofillSummary(e.target.value);
                  if (autofillSummaryError) setAutofillSummaryError("");
                }}
              />
              {autofillSummaryError && <FieldError>{autofillSummaryError}</FieldError>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAutofillModal}
                  className="flex-1 px-6 py-3 rounded-full text-sm font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAutofill}
                  disabled={autofilling}
                  className="flex-1 px-6 py-3 rounded-full text-sm font-bold text-white shadow-md shadow-orange-100 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{ background: GRADIENT }}
                >
                  {autofilling ? "Filling…" : "Generate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          form={form}
          techTags={techTags}
          onClose={() => setShowPreview(false)}
        />
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