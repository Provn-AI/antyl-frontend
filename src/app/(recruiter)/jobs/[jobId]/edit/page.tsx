"use client";

import { useEffect, useState } from "react";
import { getJob, updateJob } from "@/services/recruiter-job.service";

export default function EditJobPage({
  params,
}: {
  params: {
    jobId: string;
  };
}) {
  const [saving, setSaving] = useState(false);

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
          job_type: job.job_type || "",
          location: job.location || "",
          is_remote: job.is_remote || false,
          min_score: job.min_score || 0,
          max_score: job.max_score || 100,
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadJob();
  }, [params.jobId]);

  async function handleSubmit() {
    try {
      setSaving(true);

      await updateJob(params.jobId, {
        ...form,
        required_tech_stack: form.required_tech_stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      alert("Job updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update job.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>

      <div className="space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Job Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          rows={6}
          className="w-full border p-3 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="React, Node, Python"
          value={form.required_tech_stack}
          onChange={(e) => setForm({ ...form, required_tech_stack: e.target.value })}
        />

        <input
          type="number"
          className="w-full border p-3 rounded"
          placeholder="Experience"
          value={form.experience_level}
          onChange={(e) => setForm({ ...form, experience_level: Number(e.target.value) })}
        />

        <input
          type="number"
          className="w-full border p-3 rounded"
          placeholder="Min Salary"
          value={form.salary_min}
          onChange={(e) => setForm({ ...form, salary_min: Number(e.target.value) })}
        />

        <input
          type="number"
          className="w-full border p-3 rounded"
          placeholder="Max Salary"
          value={form.salary_max}
          onChange={(e) => setForm({ ...form, salary_max: Number(e.target.value) })}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-3 rounded bg-orange-500 text-white"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}