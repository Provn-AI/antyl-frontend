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
  Clock3,
  CalendarClock,
  X,
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
import { getApplicationsToday, TodayApplication } from "@/services/application.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Shown once per browser session — reset on next login/tab close, so a
// recruiter isn't re-nagged every time they click back to the dashboard,
// but does see it again on their next session while jobs are still expiring.
const EXPIRY_MODAL_SEEN_KEY = "antyl_expiry_modal_seen";

interface Job {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
  created_at?: string;
  expires_at?: string;
}

interface Match {
  match_id: string;
  name: string;
  trust_score: number;
  job_title: string;
  job_id: string;
  pipeline_stage: string;
  interview_scheduled_at: string | null;
}

// Brand-ish palette for chart slices/bars.
const CHART_COLORS = ["#F2754A", "#F8B36B", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];

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

function ReminderRow({
  icon: Icon,
  iconClassName,
  iconBg,
  title,
  children,
}: {
  icon: React.ElementType;
  iconClassName: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2.5 flex-shrink-0 sm:w-52">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconClassName}`} />
        </div>
        <span className="font-bold text-gray-900 text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto flex-1 pb-0.5 -mx-1 px-1">
        {children}
      </div>
    </div>
  );
}

// One-time popup on login when jobs are within 7 days of expiring. Lists
// each job with days remaining and a direct link to edit/renew it.
function ExpiryModal({
  jobs,
  onClose,
  onEdit,
}: {
  jobs: Job[];
  onClose: () => void;
  onEdit: (jobId: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {jobs.length === 1 ? "A job is expiring soon" : "Jobs expiring soon"}
              </h2>
              <p className="text-sm text-gray-400">
                Postings run for 30 days — renew before they close.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          {jobs.map((job) => {
            const daysLeft = Math.ceil(
              (new Date(job.expires_at!).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => onEdit(job.id)}
                className="w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 truncate">{job.title}</span>
                <span className="text-xs font-black px-2 py-1 rounded-full bg-amber-50 text-amber-600 flex-shrink-0">
                  {daysLeft <= 0 ? "Today" : `${daysLeft}d left`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm font-semibold px-5 py-2.5 rounded-full text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [appsToday, setAppsToday] = useState<TodayApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");
        const token = localStorage.getItem("access_token");

        const [jobsRes, matchesData, appsTodayData] = await Promise.all([
          fetch(`${API_URL}/recruiter/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getMatches(),
          getApplicationsToday(),
        ]);

        if (!jobsRes.ok) {
          throw new Error("Failed to load jobs");
        }

        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
        setMatches(matchesData || []);
        setAppsToday(appsTodayData || []);
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

  const hiredMatches = matches.filter((m) => m.pipeline_stage === "hired");
  const hiredCount = hiredMatches.length;

  // ── Reminder widgets ────────────────────────────────────────────────

  const expiringJobs = useMemo(() => {
    const now = Date.now();
    const soonThreshold = now + 7 * 24 * 60 * 60 * 1000;
    return jobs
      .filter((j) => j.status === "active" && j.expires_at)
      .filter((j) => new Date(j.expires_at!).getTime() <= soonThreshold)
      .sort(
        (a, b) =>
          new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime()
      );
  }, [jobs]);

  // Once loading finishes, decide whether to pop the modal: only if there
  // are jobs expiring soon and this session hasn't seen it yet.
  useEffect(() => {
    if (loading) return;
    if (expiringJobs.length === 0) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(EXPIRY_MODAL_SEEN_KEY)) return;

    setShowExpiryModal(true);
  }, [loading, expiringJobs]);

  function dismissExpiryModal() {
    setShowExpiryModal(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(EXPIRY_MODAL_SEEN_KEY, "1");
    }
  }

  const interviewsToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return matches
      .filter((m) => m.interview_scheduled_at)
      .filter((m) => {
        const t = new Date(m.interview_scheduled_at!).getTime();
        return t >= start.getTime() && t <= end.getTime();
      })
      .sort(
        (a, b) =>
          new Date(a.interview_scheduled_at!).getTime() -
          new Date(b.interview_scheduled_at!).getTime()
      );
  }, [matches]);

  const hasReminders =
    expiringJobs.length > 0 || appsToday.length > 0 || interviewsToday.length > 0;

  // ── Chart data ──────────────────────────────────────────────────────

  const applicantsByJobData = useMemo(() => {
    return [...jobs]
      .sort((a, b) => (b.applicant_count || 0) - (a.applicant_count || 0))
      .slice(0, 8)
      .map((j) => ({
        name: j.title.length > 18 ? `${j.title.slice(0, 18)}…` : j.title,
        applicants: j.applicant_count || 0,
      }));
  }, [jobs]);

  const jobStatusData = useMemo(() => {
    const closed = jobs.length - activeJobs;
    return [
      { name: "Active", value: activeJobs },
      { name: "Closed", value: closed },
    ].filter((d) => d.value > 0);
  }, [jobs, activeJobs]);

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

            {/* Reminder rows — expiring jobs, today's applications, today's
                interviews. Each is a full-width row so the layout reads
                the same whether one, two, or all three have data. */}
            {hasReminders && (
              <div className="flex flex-col gap-3 mb-6">
                {expiringJobs.length > 0 && (
                  <ReminderRow
                    title="Jobs expiring soon"
                    icon={Clock3}
                    iconClassName="text-amber-600"
                    iconBg="bg-amber-50"
                  >
                    {expiringJobs.map((job) => {
                      const daysLeft = Math.ceil(
                        (new Date(job.expires_at!).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => router.push(`/jobs/${job.id}/edit`)}
                          className="flex-shrink-0 flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 transition-colors whitespace-nowrap"
                        >
                          <span className="text-xs font-semibold text-amber-900">
                            {job.title}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white text-amber-600">
                            {daysLeft <= 0 ? "Today" : `${daysLeft}d`}
                          </span>
                        </button>
                      );
                    })}
                  </ReminderRow>
                )}

                {appsToday.length > 0 && (
                  <ReminderRow
                    title="New applications today"
                    icon={Users}
                    iconClassName="text-[#F2754A]"
                    iconBg="bg-orange-50"
                  >
                    {appsToday.map((app) => (
                      <div
                        key={app.application_id}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full bg-orange-50 whitespace-nowrap"
                      >
                        <span className="text-xs font-semibold text-orange-900">
                          {app.developer_name || "Candidate"}
                        </span>
                        <span className="text-xs text-orange-400"> · {app.job_title}</span>
                      </div>
                    ))}
                  </ReminderRow>
                )}

                {interviewsToday.length > 0 && (
                  <ReminderRow
                    title="Interviews today"
                    icon={CalendarClock}
                    iconClassName="text-violet-600"
                    iconBg="bg-violet-50"
                  >
                    {interviewsToday.map((m) => (
                      <button
                        key={m.match_id}
                        type="button"
                        onClick={() => router.push("/dashboard/pipeline")}
                        className="flex-shrink-0 flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 transition-colors whitespace-nowrap"
                      >
                        <span className="text-xs font-semibold text-violet-900">
                          {m.name}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white text-violet-600">
                          {new Date(m.interview_scheduled_at!).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </button>
                    ))}
                  </ReminderRow>
                )}
              </div>
            )}

            {/* Recently Hired */}
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
                      onClick={() => router.push("/dashboard/pipeline")}
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
                  applicants - your stats will show up here.
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

      {showExpiryModal && (
        <ExpiryModal
          jobs={expiringJobs}
          onClose={dismissExpiryModal}
          onEdit={(jobId) => {
            dismissExpiryModal();
            router.push(`/jobs/${jobId}/edit`);
          }}
        />
      )}
    </div>
  );
}