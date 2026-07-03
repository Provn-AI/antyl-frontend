"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, Plus, Briefcase, Circle, CheckCircle2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
  created_at?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "Active",   color: "text-emerald-600", bg: "bg-emerald-50" },
  paused:   { label: "Paused",   color: "text-amber-600",   bg: "bg-amber-50"   },
  closed:   { label: "Closed",   color: "text-gray-400",    bg: "bg-gray-100"   },
  draft:    { label: "Draft",    color: "text-blue-500",    bg: "bg-blue-50"    },
  filled:   { label: "Filled",   color: "text-violet-600",  bg: "bg-violet-50"  },
};

export default function CandidatesIndexPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/recruiter/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicant_count, 0);
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const filledJobs = jobs.filter((j) => j.status === "filled").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading jobs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">

        

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Candidates</h2>
            <p className="text-gray-400 text-sm mt-1">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/jobs/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
          >
            <Plus className="w-4 h-4" />
            New job
          </button>
        </div>

        {/* Stat pills — only show when there are jobs */}
        {jobs.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
              <Users className="w-4 h-4 text-[#F2754A]" />
              <span className="text-sm font-bold text-gray-800">{totalApplicants}</span>
              <span className="text-xs font-semibold text-gray-400">total applicants</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
              <Circle className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              <span className="text-sm font-bold text-gray-800">{activeJobs}</span>
              <span className="text-xs font-semibold text-gray-400">active</span>
            </div>
            {filledJobs > 0 && (
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-bold text-gray-800">{filledJobs}</span>
                <span className="text-xs font-semibold text-gray-400">filled</span>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <Briefcase className="w-7 h-7 text-[#F2754A]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Create your first job posting to start receiving verified candidates.
            </p>
            <button
              type="button"
              onClick={() => router.push("/jobs/new")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
            >
              <Plus className="w-4 h-4" />
              Create job
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const status = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;

              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => router.push(`/candidates/${job.id}`)}
                  className="w-full text-left bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6 hover:border-[#F2754A] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{job.title}</p>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Date */}
                      {job.created_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Posted{" "}
                          {new Date(job.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      {/* Applicant bar */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-1">
                          {Array.from({ length: Math.min(job.applicant_count, 4) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F2754A] to-[#FFB347] border-2 border-white"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          {job.applicant_count}{" "}
                          applicant{job.applicant_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Right: count + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-2xl font-black text-[#F2754A] leading-none">
                          {job.applicant_count}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                          Applied
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F2754A] transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}