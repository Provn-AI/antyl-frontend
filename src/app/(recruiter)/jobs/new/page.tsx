"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  MapPin,
  Briefcase,
} from "lucide-react";
import { createJob } from "@/services/recruiter-job.service";
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

export default function NewJobPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Separate numeric state just for the years input field
  const [experienceYears, setExperienceYears] = useState<number>(0);

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

  const validate = () => {
    if (!form.title.trim()) return "Job title is required.";
    if (!form.description.trim()) return "Job description is required.";
    if (!form.location.trim() && !form.is_remote)
      return "Add a location, or mark this as remote.";
    if (form.salary_max && form.salary_min > form.salary_max)
      return "Minimum salary can't be greater than maximum salary.";
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

      await createJob({
        ...form,
        required_tech_stack: techTags,
      });

      setSuccess(true);
      setTimeout(() => router.push("/jobs"), 1200);
    } catch (err) {
      console.error(err);
      setError("We couldn't create this job. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Job</h1>
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
                value={experienceYears || ""}
                onChange={(e) => {
                  const years = Number(e.target.value);
                  setExperienceYears(years);
                  setForm({ ...form, experience_level: mapExperienceLevel(years) });
                }}
              />
              {experienceYears > 0 && (
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
              />
            </div>
          </div>

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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Hide Preview" : "Preview"}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-6 py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
            >
              {saving ? "Creating..." : "Create Job"}
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mt-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Job Preview</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {form.title || "Untitled role"}
                </h3>

                <div className="flex items-center gap-3 text-sm text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {form.is_remote ? "Remote" : form.location || "Location not set"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {form.job_type.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-gray-50 rounded-full px-3 py-1.5 font-medium text-gray-700">
                  ₹{form.salary_min.toLocaleString()} – ₹{form.salary_max.toLocaleString()}
                </span>
                <span className="bg-gray-50 rounded-full px-3 py-1.5 font-medium text-gray-700">
                  {experienceYears}+ years
                </span>
                <span className="bg-orange-50 rounded-full px-3 py-1.5 font-medium text-[#F2754A] capitalize">
                  {form.experience_level} level
                </span>
                <span className="bg-orange-50 rounded-full px-3 py-1.5 font-medium text-[#F2754A]">
                  Antyl Score {form.min_score}–{form.max_score}
                </span>
              </div>

              {form.description && (
                <p className="text-gray-600 leading-relaxed">{form.description}</p>
              )}

              {techTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techTags.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}