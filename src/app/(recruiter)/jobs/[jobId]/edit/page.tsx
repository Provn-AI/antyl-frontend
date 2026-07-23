"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { getJob, updateJob } from "@/services/recruiter-job.service";
import TrustScoreSlider from "@/components/jobs/TrustScoreSlider";

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

function experienceLevelToYears(level: string): number {
  switch (level) {
    case "entry": return 0;
    case "mid": return 3;
    case "senior": return 6;
    case "lead": return 9;
    default: return 0;
  }
}

const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

export default function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = React.use(params);
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  // Raw string backing the experience-years input so the field can be
  // temporarily empty while typing (e.g. clearing it to type "0").
  const [experienceYearsInput, setExperienceYearsInput] = useState<string>("0");

  const [form, setForm] = useState<JobForm>({
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
  });

  const techTags = form.required_tech_stack
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  useEffect(() => {
    async function loadJob() {
      try {
        const job = await getJob(jobId);
        const years = experienceLevelToYears(job.experience_level);
        setExperienceYears(years);
        setExperienceYearsInput(String(years));
        setForm({
          title: job.title || "",
          description: job.description || "",
          required_tech_stack: (job.required_tech_stack || []).join(", "),
          experience_level: job.experience_level || "entry",
          salary_min: job.salary_min || 0,
          salary_max: job.salary_max || 0,
          job_type: job.job_type || "full_time",
          location: job.location || "",
          is_remote: job.is_remote || false,
          min_score: job.min_score || 0,
          max_score: job.max_score || 100,
        });
      } catch (err) {
        console.error(err);
        setError("We couldn't load this job. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  const validate = () => {
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Job description is required.";
    if (!form.location.trim() && !form.is_remote)
      return "Add a location, or mark this as remote.";
    if (form.salary_max && form.salary_min > form.salary_max)
      return "Minimum salary can't be greater than maximum salary.";
    const techStack = form.required_tech_stack.trim();
    if (techStack) {
      const hasComma = techStack.includes(",");
      const tokenCount = techStack.split(/\s+/).filter(Boolean).length;
      if (!hasComma && tokenCount > 1)
        return "Please separate each skill with a comma (e.g. React, Node, Python).";
    }
    return "";
  };

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      setError("");
      await updateJob(jobId, {
        ...form,
        required_tech_stack: techTags,
      });
      setSuccess(true);
      setTimeout(() => router.push("/jobs"), 1200);
    } catch (err) {
      console.error(err);
      setError("We couldn't save this job. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Back to jobs
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-2xl px-5 py-3 mb-6">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Job updated successfully. Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-2xl px-5 py-3 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm py-20 text-center">
            <div
              className="w-8 h-8 rounded-full border-[3px] border-gray-200 mx-auto animate-spin"
              style={{ borderTopColor: "#F2754A" }}
            />
            <p className="text-gray-400 text-sm mt-4">Loading job details...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Job Title
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Senior Backend Engineer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
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

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Required Tech Stack
              </label>
              <input
                className={inputClass}
                placeholder="React, Node, Python"
                value={form.required_tech_stack}
                onChange={(e) => setForm({ ...form, required_tech_stack: e.target.value })}
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

            {/* Experience + Job Type + Salary */}
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
                      setExperienceYearsInput(String(experienceYears));
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
                  Min Salary (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="e.g. 800000"
                  value={form.salary_min || ""}
                  onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })}
                  onWheel={preventWheelChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Max Salary (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="e.g. 1500000"
                  value={form.salary_max || ""}
                  onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })}
                  onWheel={preventWheelChange}
                />
                {form.salary_max > 0 && form.salary_min > form.salary_max && (
                  <p className="text-xs text-red-500 font-semibold mt-1.5 px-1">
                    Max salary must be greater than min salary.
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Location
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Mumbai, India"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                disabled={form.is_remote}
              />
            </div>

            {/* Remote toggle */}
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

            {/* Antyl Score */}
            <div>
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

            {/* Save button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full px-6 py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}