"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  PartyPopper,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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

// Brand-ish palette for chart slices/bars.
const CHART_COLORS = ["#F2754A", "#F8B36B", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];

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

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-5 h-5 text-[#F2754A]" />
        <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
      </div>
      {children}
    </div>
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

  // ── Chart data ──────────────────────────────────────────────────────

  // Applicants by job, top 8 by applicant count, longest titles truncated
  // so the axis labels don't collide.
  const applicantsByJobData = useMemo(() => {
    return [...jobs]
      .sort((a, b) => (b.applicant_count || 0) - (a.applicant_count || 0))
      .slice(0, 8)
      .map((j) => ({
        name: j.title.length > 18 ? `${j.title.slice(0, 18)}…` : j.title,
        applicants: j.applicant_count || 0,
      }));
  }, [jobs]);

  // Active vs closed job split.
  const jobStatusData = useMemo(() => {
    const closed = jobs.length - activeJobs;
    return [
      { name: "Active", value: activeJobs },
      { name: "Closed", value: closed },
    ].filter((d) => d.value > 0);
  }, [jobs, activeJobs]);

  // Pipeline funnel — grouped from whatever pipeline_stage values are
  // actually present in the matches data, so this doesn't assume a fixed
  // set of stage names.
  const pipelineData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of matches) {
      const stage = m.pipeline_stage || "unknown";
      counts.set(stage, (counts.get(stage) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([stage, count]) => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1).replace(/_/g, " "),
      count,
    }));
  }, [matches]);

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
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

            {/* Recently Hired — kept as-is */}
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

            {/* Charts — replaces the old Recent Activity job list */}
            {jobs.length === 0 ? (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-[#F2754A]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  No jobs posted yet
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Create your first job listing to start receiving
                  applicants — your stats will show up here.
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Applicants by job */}
                <div className="lg:col-span-2">
                  <ChartCard title="Applicants by Job" icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={applicantsByJobData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1EF" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#9CA3AF" }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <Tooltip
                          cursor={{ fill: "rgba(242,117,74,0.06)" }}
                          contentStyle={{ borderRadius: 12, border: "1px solid #F1F1EF", fontSize: 12 }}
                        />
                        <Bar dataKey="applicants" radius={[8, 8, 0, 0]}>
                          {applicantsByJobData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                {/* Job status split */}
                <ChartCard title="Job Status" icon={Briefcase}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {jobStatusData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#F2754A" : "#E5E7EB"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1F1EF", fontSize: 12 }} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, color: "#6B7280" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Pipeline funnel */}
                {pipelineData.length > 0 && (
                  <div className="lg:col-span-3">
                    <ChartCard title="Candidate Pipeline" icon={Users}>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={pipelineData}
                          layout="vertical"
                          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F1EF" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fontSize: 12, fill: "#374151" }}
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(242,117,74,0.06)" }}
                            contentStyle={{ borderRadius: 12, border: "1px solid #F1F1EF", fontSize: 12 }}
                          />
                          <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#F8B36B" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}