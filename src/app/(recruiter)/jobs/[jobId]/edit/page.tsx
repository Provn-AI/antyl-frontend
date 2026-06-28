"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Code2, Star, Save } from "lucide-react";
import { getJob, updateJob } from "@/services/recruiter-job.service";

export default function EditJobPage({
  params,
}: {
  params: {
    jobId: string;
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    required_tech_stack: "",
    experience_level: 0,
    salary_min: 0,
    salary_max: 0,
    job_type: "full_time",
    location: "",
    is_remote: false,
    min_score: 0,
    max_score: 100,
  });

  useEffect(() => {
    async function loadJob() {
      try {
        const job = await getJob(params.jobId);
        setForm({
          title: job.title || "",
          description: job.description || "",
          required_tech_stack: (job.required_tech_stack || []).join(", "),
          experience_level: job.experience_level || 0,
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
  }, [params.jobId]);

  async function handleSubmit() {
    try {
      setSaving(true);
      setSuccess(false);
      await updateJob(params.jobId, {
        ...form,
        required_tech_stack: form.required_tech_stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F2754A]/30 focus:border-[#F2754A] transition";

  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white disabled:opacity-60 transition"
            style={{
              background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
            }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-700 text-sm font-medium px-5 py-3 rounded-2xl">
            ✓ Job updated successfully.
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-5 py-3 rounded-2xl">
            {error}
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
          <div className="space-y-4">

            {/* Basic Info */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-[#F2754A]" />
                <span className="text-sm font-semibold text-gray-700">Basic Info</span>
              </div>

              <div>
                <label className={labelClass}>Job Title</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Senior Frontend Engineer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={6}
                  className={inputClass}
                  placeholder="Describe the role, responsibilities, and what success looks like..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>Job Type</label>
                <select
                  className={inputClass}
                  value={form.job_type}
                  onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Tech & Experience */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-4 h-4 text-[#F2754A]" />
                <span className="text-sm font-semibold text-gray-700">Tech & Experience</span>
              </div>

              <div>
                <label className={labelClass}>Tech Stack</label>
                <input
                  className={inputClass}
                  placeholder="React, Node.js, PostgreSQL"
                  value={form.required_tech_stack}
                  onChange={(e) => setForm({ ...form, required_tech_stack: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1.5 ml-1">Separate with commas</p>
              </div>

              <div>
                <label className={labelClass}>Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="3"
                  value={form.experience_level}
                  onChange={(e) => setForm({ ...form, experience_level: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-[#F2754A]" />
                <span className="text-sm font-semibold text-gray-700">Location</span>
              </div>

              <div>
                <label className={labelClass}>City / Region</label>
                <input
                  className={inputClass}
                  placeholder="San Francisco, CA"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, is_remote: !form.is_remote })}
                  className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    form.is_remote ? "bg-[#F2754A]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.is_remote ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">Remote OK</span>
              </label>
            </div>

            {/* Salary */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[#F2754A]" />
                <span className="text-sm font-semibold text-gray-700">Salary Range</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Minimum</label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="60000"
                    value={form.salary_min}
                    onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Maximum</label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="120000"
                    value={form.salary_max}
                    onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-[#F2754A]" />
                <span className="text-sm font-semibold text-gray-700">Applicant Score Range</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Min Score</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    value={form.min_score}
                    onChange={(e) => setForm({ ...form, min_score: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max Score</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Bottom save button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3.5 rounded-full text-white font-semibold text-sm disabled:opacity-60 transition"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}