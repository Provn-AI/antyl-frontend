"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  PlayCircle,
  PauseCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  LucideIcon,
  Pencil,
  Eye,                    // ← add this
  X,                      // ← add this (for modal close)
  MapPin,                 // ← add this
  Wifi,                   // ← add this (remote badge)
  IndianRupee,            // ← add this
} from "lucide-react";
import {
  getRecruiterJobs,
  updateJobStatus,
  getJob,                 // ← add this import
} from "@/services/recruiter-job.service";

interface Job {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
}

// ← add this interface for the full preview data
interface JobDetail {
  id: string;
  title: string;
  description: string;
  required_tech_stack: string[];
  experience_level: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  location: string;
  is_remote: boolean;
  min_score: number;
  max_score: number;
  status: string;
  applicant_count: number;
}

interface StatusAction {
  status: string;
  label: string;
  icon: LucideIcon;
  activeColor: string;
}

const tabs = ["active", "paused", "closed"];

const statusActions: StatusAction[] = [
  { status: "active", label: "Active", icon: PlayCircle, activeColor: "#16A34A" },
  { status: "paused", label: "Pause", icon: PauseCircle, activeColor: "#CA8A04" },
  { status: "closed", label: "Close", icon: XCircle, activeColor: "#DC2626" },
];

export default function JobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ← add these three lines
  const [previewJob, setPreviewJob] = useState<JobDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await getRecruiterJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
        setError("We couldn't load your jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function changeStatus(jobId: string, status: string) {
    try {
      setUpdatingId(jobId);
      await updateJobStatus(jobId, status);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status } : job))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  // ← add this handler
  async function openPreview(jobId: string) {
    setPreviewLoading(true);
    setPreviewJob(null);
    try {
      const data = await getJob(jobId);
      setPreviewJob(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  }

  const filteredJobs = jobs.filter((job) => job.status === tab);
  const countFor = (status: string) =>
    jobs.filter((job) => job.status === status).length;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((status) => (
            <button
              key={status}
              onClick={() => setTab(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                tab === status
                  ? "text-white"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}
              style={
                tab === status
                  ? { background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }
                  : undefined
              }
            >
              {status}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === status
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {countFor(status)}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm py-20 text-center">
            <div
              className="w-8 h-8 rounded-full border-[3px] border-gray-200 mx-auto animate-spin"
              style={{ borderTopColor: "#F2754A" }}
            />
            <p className="text-gray-400 text-sm mt-4">Loading your jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
            >
              Try again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-[#F2754A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No {tab} jobs</h2>
            <p className="text-gray-400 text-sm">
              {tab === "active"
                ? "Jobs you publish will show up here."
                : `You don't have any ${tab} jobs right now.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    {/* ← title now calls openPreview, not router.push */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPreview(job.id)}
                        className="font-bold text-gray-900 text-lg hover:text-[#F2754A] transition-colors text-left"
                      >
                        {job.title}
                      </button>

                      {/* Eye — preview */}
                      <button
                        type="button"
                        onClick={() => openPreview(job.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-[#F2754A] hover:bg-orange-50 transition-colors"
                        title="Preview job"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Pencil — edit */}
                      <button
                        type="button"
                        onClick={() => router.push(`/jobs/${job.id}/edit`)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-[#F2754A] hover:bg-orange-50 transition-colors"
                        title="Edit job"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicant_count}{" "}
                      {job.applicant_count === 1 ? "applicant" : "applicants"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {statusActions.map((action) => {
                      const Icon = action.icon;
                      const isCurrent = job.status === action.status;
                      const isUpdating = updatingId === job.id;

                      return (
                        <button
                          key={action.status}
                          onClick={() => changeStatus(job.id, action.status)}
                          disabled={isCurrent || isUpdating}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-colors disabled:cursor-default ${
                            isCurrent
                              ? "text-white border-transparent"
                              : "text-gray-500 border-gray-200 hover:border-gray-300"
                          }`}
                          style={isCurrent ? { background: action.activeColor } : undefined}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ← Job Preview Modal */}
      {(previewJob || previewLoading) && (
        <JobPreviewModal
          job={previewJob}
          loading={previewLoading}
          onClose={() => setPreviewJob(null)}
          onEdit={(id) => {
            setPreviewJob(null);
            router.push(`/jobs/${id}/edit`);
          }}
        />
      )}
    </div>
  );
}

// ─── Job Preview Modal ────────────────────────────────────────────────────────

function JobPreviewModal({
  job,
  loading,
  onClose,
  onEdit,
}: {
  job: JobDetail | null;
  loading: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  // close on backdrop click
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="py-24 text-center">
            <div
              className="w-8 h-8 rounded-full border-[3px] border-gray-200 mx-auto animate-spin"
              style={{ borderTopColor: "#F2754A" }}
            />
            <p className="text-gray-400 text-sm mt-4">Loading preview…</p>
          </div>
        ) : job ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {job.location && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  )}
                  {job.is_remote && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                      <Wifi className="w-3 h-3" />
                      Remote
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#F2754A] capitalize">
                    {job.job_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                    {job.experience_level}
                  </span>
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

            <div className="p-6 space-y-5">
              {/* Salary */}
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <IndianRupee className="w-4 h-4 text-[#F2754A]" />
                {job.salary_min.toLocaleString()} – {job.salary_max.toLocaleString()}
                <span className="font-normal text-gray-400">/ year</span>
              </div>

              {/* Description */}
              {job.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {job.description}
                  </p>
                </div>
              )}

              {/* Tech stack */}
              {job.required_tech_stack?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_tech_stack.map((tech) => (
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

              {/* Antyl Score range */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Antyl Score Range
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
                  >
                    {job.min_score} – {job.max_score}
                  </span>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onEdit(job.id)}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white"
                  style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Job
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full text-gray-500 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}