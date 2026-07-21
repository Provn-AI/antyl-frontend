"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  PartyPopper,
} from "lucide-react";
import { getMatches } from "@/services/match.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
  created_at?: string;
}

// BUG-FIX: the dashboard previously only fetched /recruiter/jobs, which
// never touches the matches table or pipeline_stage — so a candidate
// reaching "hired" had no effect anywhere on this page. Pulling matches in
// alongside jobs lets us surface hires here too.
interface Match {
  match_id: string;
  name: string;
  trust_score: number;
  job_title: string;
  job_id: string;
  pipeline_stage: string;
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
        isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

export default function RecruiterDashboard() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const token = localStorage.getItem("access_token");

        // BUG-FIX: fetch jobs and matches together so hires (which only
        // live in the matches/pipeline data) are reflected on this page.
        const [jobsRes, matchesData] = await Promise.all([
          fetch(`${API_URL}/recruiter/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getMatches(),
        ]);

        if (!jobsRes.ok) {
          throw new Error("Failed to load jobs");
        }

        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
        setMatches(matchesData || []);
      } catch (err) {
        console.error(err);
        setError("We couldn't load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const totalApplicants = jobs.reduce(
    (sum, job) => sum + (job.applicant_count || 0),
    0
  );

  // BUG-FIX: this is the actual source of truth for hires — pipeline_stage
  // on the matches table, not anything derived from jobs/applications.
  const hiredMatches = matches.filter((m) => m.pipeline_stage === "hired");
  const hiredCount = hiredMatches.length;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Recruiter Dashboard
          </h1>

          <button
            type="button"
            onClick={() => router.push("/jobs/new")}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white"
            style={{
              background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
            }}
          >
            <PlusCircle className="w-4 h-4" />
            New Job
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm py-20 text-center">
            <div
              className="w-8 h-8 rounded-full border-[3px] border-gray-200 mx-auto animate-spin"
              style={{ borderTopColor: "#F2754A" }}
            />
            <p className="text-gray-400 text-sm mt-4">
              Loading your dashboard...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            {/* BUG-FIX: grid widened to 4 columns to fit the new Hires card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5 text-[#F2754A]" />
                  </div>
                  <span className="text-sm text-gray-400">Total Jobs</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {jobs.length}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-[#F2754A]" />
                  </div>
                  <span className="text-sm text-gray-400">Active Jobs</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {activeJobs}
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-[#F2754A]" />
                  </div>
                  <span className="text-sm text-gray-400">Applicants</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {totalApplicants}
                </div>
              </div>

              {/* BUG-FIX: new Hires stat card, driven by matches.pipeline_stage */}
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <PartyPopper className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-400">Hires</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {hiredCount}
                </div>
              </div>
            </div>

            {/* BUG-FIX: Recently Hired section — this is the part that was
                completely missing. Without it, a hire was invisible anywhere
                on the dashboard even though the pipeline stage updated. */}
            {hiredCount > 0 && (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-2 mb-5">
                  <PartyPopper className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-gray-900 text-lg">
                    Recently Hired
                  </h2>
                </div>
                <div className="space-y-2">
                  {hiredMatches.map((m) => (
                    <button
                      key={m.match_id}
                      type="button"
                      onClick={() => router.push("/pipeline")}
                      className="w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-3 hover:bg-emerald-50/60 transition-colors text-left"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-black text-xs">
                            {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{m.name}</p>
                          <p className="text-sm text-gray-400 truncate">{m.job_title}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0">
                        Hired
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                Recent Activity
              </h2>

              {jobs.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-6 h-6 text-[#F2754A]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    No jobs posted yet
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Create your first job listing to start receiving
                    applicants.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/jobs/new")}
                    className="px-6 py-2.5 rounded-full font-semibold text-white text-sm"
                    style={{
                      background:
                        "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                    }}
                  >
                    Post a Job
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => {
                    // BUG-FIX: flag jobs that have at least one hire so it's
                    // visible even without opening the Recently Hired list.
                    const jobHires = hiredMatches.filter((m) => m.job_id === job.id).length;
                    return (
                      <button
                        key={job.id}
                        type="button"
                        // BUG-FIX: this previously always pushed to `/jobs`
                        // regardless of which job was clicked, so there was
                        // no way to reach a specific job's candidates from
                        // the dashboard. Routes to that job's candidates
                        // page now — confirm this path matches your actual
                        // route structure (assumed /candidates/[jobId]).
                        onClick={() => router.push(`/candidates/${job.id}`)}
className="w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-4 border border-transparent hover:border-[#F2754A] hover:shadow-[0_0_0_3px_rgba(242,117,74,0.12)] transition-all duration-300 text-left">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-gray-900 truncate">
                              {job.title}
                            </p>
                            <StatusBadge status={job.status} />
                            {jobHires > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                <PartyPopper className="w-3 h-3" />
                                {jobHires} hired
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {job.applicant_count}{" "}
                            {job.applicant_count === 1
                              ? "applicant"
                              : "applicants"}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}