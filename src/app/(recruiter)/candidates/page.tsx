"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ChevronRight,
  Plus,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
  created_at?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const GRADIENT = "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:  { label: "Active",  color: "text-emerald-600", bg: "bg-emerald-50" },
  paused:  { label: "Paused",  color: "text-amber-600",  bg: "bg-amber-50"  },
  closed:  { label: "Closed",  color: "text-red-500",    bg: "bg-red-50"    },
  expired: { label: "Expired", color: "text-gray-500",   bg: "bg-gray-100"  },
  draft:   { label: "Draft",   color: "text-blue-500",   bg: "bg-blue-50"   },
  filled:  { label: "Filled",  color: "text-violet-600", bg: "bg-violet-50" },
};

const FALLBACK_STATUS = { label: "", color: "text-gray-500", bg: "bg-gray-100" };

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "orange",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  tone?: "orange" | "green" | "violet";
}) {
  const tiles = {
    orange: { bg: "bg-orange-50", text: "text-[#F2754A]" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
  }[tone];

  return (
    <div className="bg-white rounded-[24px] border-2 border-[#F2754A]/25 shadow-sm p-5 sm:p-6 transition hover:border-[#F2754A]/60 hover:shadow-md hover:-translate-y-0.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tiles.bg}`}>
        <Icon className={`w-[18px] h-[18px] ${tiles.text}`} />
      </div>
      <div
        className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums leading-none"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        {value}
      </div>
      <p className="text-sm font-semibold text-gray-500 mt-2">{label}</p>
    </div>
  );
}

function CandidatesSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 bg-white rounded-[24px] border border-gray-100" />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-white rounded-[24px] border border-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default function CandidatesIndexPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        setError("");
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/recruiter/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load jobs");
        }
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error(err);
        setError("We couldn't load your jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const filledJobs = jobs.filter((j) => j.status === "filled").length;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Candidates
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Pick a job to review its applicants.
              {!loading && !error && (
                <>
                  {" "}
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted.
                </>
              )}
            </p>
          </div>

          {/* <button
            type="button"
            onClick={() => router.push("/jobs/new")}
            className="flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 sm:py-2.5 rounded-full text-white w-full sm:w-auto shadow-md shadow-orange-100 transition hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: GRADIENT }}
          >
            <Plus className="w-4 h-4" />
            New job
          </button> */}
        </div>

        {loading ? (
          <CandidatesSkeleton />
        ) : error ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E0533D]/10 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-6 h-6 text-[#E0533D]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full font-bold text-sm text-white shadow-md shadow-orange-100"
              style={{ background: GRADIENT }}
            >
              Try again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-[#F2754A]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No jobs posted yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Create your first job posting to start receiving verified candidates.
            </p>
            <button
              type="button"
              onClick={() => router.push("/jobs/new")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white text-sm shadow-md shadow-orange-100"
              style={{ background: GRADIENT }}
            >
              <Plus className="w-4 h-4" />
              Create job
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div
              className={`grid grid-cols-2 ${
                filledJobs > 0 ? "md:grid-cols-3" : "md:grid-cols-2"
              } gap-3 sm:gap-4 mb-8`}
            >
              <StatCard icon={Users} label="Total applicants" value={totalApplicants} />
              <StatCard icon={TrendingUp} label="Active jobs" value={activeJobs} tone="green" />
              {filledJobs > 0 && (
                <StatCard icon={CheckCircle2} label="Filled jobs" value={filledJobs} tone="violet" />
              )}
            </div>

            {/* Job list */}
            <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">Your jobs</h2>
            <div className="space-y-3">
              {jobs.map((job) => {
                const status =
                  STATUS_CONFIG[job.status] ?? { ...FALLBACK_STATUS, label: job.status };
                const count = job.applicant_count || 0;

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => router.push(`/candidates/${job.id}`)}
                    className="group w-full text-left bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6 transition hover:border-[#F2754A]/60 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-[18px] h-[18px] text-[#F2754A]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title + status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-base sm:text-lg truncate">
                              {job.title}
                            </p>
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-full capitalize ${status.bg} ${status.color}`}
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

                          {/* Applicant avatars */}
                          <div className="flex items-center gap-2 mt-3">
                            {count > 0 && (
                              <div className="flex -space-x-1.5">
                                {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-5 h-5 rounded-full border-2 border-white"
                                    style={{ background: GRADIENT }}
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-gray-500">
                              <span className="tabular-nums">{count}</span>{" "}
                              applicant{count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: count + arrow */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center">
                          <p
                            className="text-2xl sm:text-3xl font-bold text-[#F2754A] leading-none tabular-nums"
                            style={{ fontFamily: "var(--font-fraunces, serif)" }}
                          >
                            {count}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
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
          </>
        )}
      </div>
    </div>
  );
}