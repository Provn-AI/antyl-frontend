"use client";

import { useEffect, useMemo, useState } from "react";
import { getApplications, withdrawApplication } from "@/services/application.service";
import DeveloperNavbar from "../components/DeveloperNavbar";
import {
  AlertTriangle,
  Zap,
  MousePointer,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  X,
  Briefcase,
  Send,
  Check,
  Building2,
} from "lucide-react";

interface Application {
  application_id: string;
  job_id: string;
  job_title: string;
  status: string;
  applied_via: string;
  similarity_score: number;
  applied_at: string;
  company_name?: string;
}

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; hex: string; icon: React.ReactNode; hint: string }
> = {
  sent: {
    label: "Sent", color: "text-gray-600", bg: "bg-gray-100", hex: "#d1d5db",
    icon: <Clock className="w-3 h-3" />,
    hint: "Waiting for a recruiter to open your profile.",
  },
  viewed: {
    label: "Viewed", color: "text-blue-600", bg: "bg-blue-50", hex: "#60a5fa",
    icon: <Eye className="w-3 h-3" />,
    hint: "A recruiter has looked at your profile.",
  },
  matched: {
    label: "Matched", color: "text-emerald-600", bg: "bg-emerald-50", hex: "#10b981",
    icon: <CheckCircle2 className="w-3 h-3" />,
    hint: "You have been shortlisted. Keep your profile up to date.",
  },
  interview: {
    label: "Interview", color: "text-violet-600", bg: "bg-violet-50", hex: "#8b5cf6",
    icon: <Calendar className="w-3 h-3" />,
    hint: "You are in the interview stage. Good luck.",
  },
  rejected: {
    label: "Rejected", color: "text-[#D8452F]", bg: "bg-[#E0533D]/10", hex: "#E0533D",
    icon: <XCircle className="w-3 h-3" />,
    hint: "This application is closed. You can apply to similar roles.",
  },
};

const FILTERS = ["all", "active", "matched", "rejected"] as const;
type Filter = typeof FILTERS[number];
type SortKey = "recent" | "match";

const ACTIVE_STATUSES = ["sent", "viewed", "interview"];

const PIPELINE_STAGES = [
  { key: "sent", label: "Sent", Icon: Send },
  { key: "viewed", label: "Viewed", Icon: Eye },
  { key: "matched", label: "Matched", Icon: CheckCircle2 },
  { key: "interview", label: "Interview", Icon: Calendar },
];

const FUNNEL_SEGMENTS = ["sent", "viewed", "matched", "interview", "rejected"] as const;

const EMPTY_COPY: Record<Filter, { title: string; body: string }> = {
  all:      { title: "No applications yet",    body: "Jobs you apply to will show up here with live status updates." },
  active:   { title: "Nothing in progress",    body: "Applications waiting on a recruiter will appear here." },
  matched:  { title: "No matches yet",         body: "When a recruiter shortlists you, the application moves here." },
  rejected: { title: "No closed applications", body: "Applications that did not move forward will appear here." },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_TINTS = ["#F2754A", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

function tintFor(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

// First visible letter or digit of the title; skips spaces and stray symbols
// so the avatar never renders blank. Returns null if there is none.
function initialOf(title?: string) {
  const match = title?.match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function scoreColor(score: number) {
  return score >= 80 ? "#10b981" : score >= 60 ? "#F2754A" : score >= 40 ? "#f59e0b" : "#E0533D";
}

function fitLabel(score: number) {
  return score >= 80 ? "Strong fit" : score >= 60 ? "Good fit" : score >= 40 ? "Fair fit" : "Low fit";
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  open,
  jobTitle,
  onConfirm,
  onClose,
}: {
  open: boolean;
  jobTitle?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[24px] border border-gray-100 shadow-xl p-6">
        <div className="w-10 h-10 rounded-2xl bg-[#E0533D]/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5 text-[#E0533D]" />
        </div>
        <h3 id="withdraw-title" className="text-base font-bold text-gray-900 mb-1">
          Withdraw application?
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          {jobTitle ? (
            <>
              Your application for <span className="font-semibold text-gray-600">{jobTitle}</span>{" "}
              will be removed from the recruiter view. You can re-apply later.
            </>
          ) : (
            "This will remove your application from the recruiter view. You can re-apply later."
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
                onClose();
              }
            }}
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-white bg-[#E0533D] hover:bg-[#C9442F] transition-colors disabled:opacity-50"
          >
            {busy ? "Withdrawing…" : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({
  toast,
  onDone,
}: {
  toast: { message: string; tone: "ok" | "error" } | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-xl"
    >
      {toast.tone === "ok" ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-[#E0533D]" />
      )}
      {toast.message}
    </div>
  );
}

// ── Overview card: key numbers + stage distribution bar ───────────────────────
function Overview({
  applications,
  counts,
}: {
  applications: Application[];
  counts: Record<string, number>;
}) {
  const total = applications.length;
  const active = applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length;
  const seen = applications.filter((a) => a.status !== "sent").length;
  const seenPct = total ? Math.round((seen / total) * 100) : 0;
  const avgMatch = total
    ? Math.round(applications.reduce((sum, a) => sum + a.similarity_score, 0) / total)
    : 0;

  const metrics = [
    { label: "In progress", value: String(active) },
    { label: "Seen by recruiters", value: `${seenPct}%` },
    { label: "Average match", value: `${avgMatch}%` },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6 mb-5">
      <div className="grid grid-cols-3">
        {metrics.map((m, i) => (
          <div key={m.label} className={i > 0 ? "pl-4 sm:pl-6 border-l border-gray-100" : ""}>
            <p
              className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              {m.value}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-gray-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Stage distribution */}
      <div className="flex gap-1 h-2.5 mt-6" role="img" aria-label="Applications by stage">
        {FUNNEL_SEGMENTS.filter((k) => counts[k] > 0).map((k) => (
          <div
            key={k}
            className="rounded-full transition-all duration-500"
            style={{ flexGrow: counts[k], background: STATUS_CONFIG[k].hex }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3.5">
        {FUNNEL_SEGMENTS.map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_CONFIG[k].hex }} />
            {STATUS_CONFIG[k].label}
            <span className="font-bold text-gray-800 tabular-nums">{counts[k]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, muted }: { score: number; muted?: boolean }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const color = muted ? "#d1d5db" : scoreColor(clamped);

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            className="transition-all duration-700"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums"
          style={{ color: muted ? "#9ca3af" : "#111827" }}
        >
          {clamped}
          <span className="text-[9px] font-semibold ml-px mt-0.5 text-gray-400">%</span>
        </span>
      </div>
      <span
        className="text-[10px] font-bold mt-1.5"
        style={{ color: muted ? "#9ca3af" : color }}
      >
        {fitLabel(clamped)}
      </span>
    </div>
  );
}

// ── Pipeline stepper ──────────────────────────────────────────────────────────
function Pipeline({ status }: { status: string }) {
  const current = Math.max(0, PIPELINE_STAGES.findIndex((s) => s.key === status));

  return (
    <div className="flex items-start mt-6" aria-label={`Stage: ${status}`}>
      {PIPELINE_STAGES.map((stage, i) => {
        const done = i < current;
        const isCurrent = i === current;
        const isLast = i === PIPELINE_STAGES.length - 1;
        const Icon = stage.Icon;

        return (
          <div key={stage.key} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5 w-12 sm:w-14">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  done
                    ? "bg-[#F2754A] text-white"
                    : isCurrent
                    ? "bg-[#F2754A] text-white ring-4 ring-orange-100"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Icon className="w-3.5 h-3.5" />}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold ${
                  isCurrent ? "text-gray-900" : done ? "text-gray-500" : "text-gray-300"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`flex-1 h-0.5 mt-[13px] -mx-3 sm:-mx-4 rounded-full ${
                  i < current ? "bg-[#F2754A]" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 p-5 sm:p-6 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-3.5 w-2/3 bg-gray-100 rounded-full" />
          <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
        </div>
        <div className="w-14 h-14 rounded-full bg-gray-100" />
      </div>
      <div className="h-7 w-full bg-gray-100 rounded-full mt-6" />
      <div className="h-7 w-24 bg-gray-100 rounded-full mt-5" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getApplications();
        if (mounted) setApplications(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    try {
      await withdrawApplication(withdrawId);
      setApplications((prev) => prev.filter((app) => app.application_id !== withdrawId));
      setToast({ message: "Application withdrawn", tone: "ok" });
    } catch (error) {
      console.error(error);
      setToast({ message: "Could not withdraw. Please try again.", tone: "error" });
    }
  };

  const filteredApplications = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...applications]
      .sort((a, b) =>
        sort === "match"
          ? b.similarity_score - a.similarity_score
          : new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
      )
      .filter((app) => {
        if (q && !app.job_title.toLowerCase().includes(q)) return false;
        if (filter === "all")      return true;
        if (filter === "active")   return ACTIVE_STATUSES.includes(app.status);
        if (filter === "matched")  return app.status === "matched";
        if (filter === "rejected") return app.status === "rejected";
        return true;
      })
      // On the "All" tab, rejected applications sink to the bottom — they're
      // closed out, so they shouldn't compete for attention at the top.
      .sort((a, b) => {
        if (filter !== "all") return 0;
        const aRejected = a.status === "rejected" ? 1 : 0;
        const bRejected = b.status === "rejected" ? 1 : 0;
        return aRejected - bRejected;
      });
  }, [applications, filter, sort, query]);

  // Per-status counts (drive the overview card) and tab counts. Both ignore the search box.
  const statusCounts: Record<string, number> = {};
  FUNNEL_SEGMENTS.forEach((k) => {
    statusCounts[k] = applications.filter((a) => a.status === k).length;
  });

  const counts: Record<Filter, number> = {
    all:      applications.length,
    active:   applications.filter((a) => ACTIVE_STATUSES.includes(a.status)).length,
    matched:  statusCounts.matched,
    rejected: statusCounts.rejected,
  };

  const withdrawTarget = applications.find((a) => a.application_id === withdrawId);

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0]">
      <style>{`
        @keyframes appFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .app-card { animation: appFadeUp 0.4s ease both; }
        @media (prefers-reduced-motion: reduce) { .app-card { animation: none; } }
      `}</style>

      <DeveloperNavbar />

      <ConfirmModal
        open={withdrawId !== null}
        jobTitle={withdrawTarget?.job_title}
        onConfirm={handleWithdraw}
        onClose={() => setWithdrawId(null)}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />

      <div className="px-4 py-10 sm:py-12 md:ml-56">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-1"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Applications
            </h1>
            <p className="text-gray-400 text-sm">
              Track every job you have applied to, from sent to interview.
            </p>
          </div>

          {/* Search — sits right under the header so it stays prominent */}
          <div className="relative mb-5">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your applications by job title"
              aria-label="Search applications by job title"
              className="w-full h-12 sm:h-14 pl-12 pr-12 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm sm:text-base font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Overview */}
          {!loading && applications.length > 0 && (
            <Overview applications={applications} counts={statusCounts} />
          )}

          {/* Filter tabs — equal-width on mobile so all 4 fit in one row */}
          <div className="flex gap-1.5 sm:gap-2 mb-5">
            {FILTERS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold capitalize transition-colors whitespace-nowrap ${
                  filter === tab
                    ? "bg-[#F2754A] text-white shadow-md shadow-orange-100"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                }`}
              >
                {tab}
                <span
                  className={`text-[10px] sm:text-xs font-black px-1 sm:px-1.5 py-0.5 rounded-full ${
                    filter === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {loading ? "–" : counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Result count + sort */}
          {!loading && applications.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-semibold text-gray-400">
                {filteredApplications.length} application{filteredApplications.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-full p-0.5">
                {([
                  { key: "recent", label: "Newest" },
                  { key: "match", label: "Best match" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSort(opt.key)}
                    aria-pressed={sort === opt.key}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      sort === opt.key ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-[#F2754A]" />
              </div>
              {query ? (
                <>
                  <p className="text-sm font-bold text-gray-700">No matching applications</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Nothing in this tab matches &ldquo;{query}&rdquo;.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-700">{EMPTY_COPY[filter].title}</p>
                  <p className="text-xs text-gray-400 mt-1">{EMPTY_COPY[filter].body}</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app, index) => {
                const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.sent;
                const canWithdraw = app.status === "sent" || app.status === "viewed";
                const isRejected = app.status === "rejected";
                const tint = isRejected ? "#9ca3af" : tintFor(app.job_title);

                // Divider before the first rejected card when they trail
                // behind active/matched ones on the "All" tab.
                const prevApp = filteredApplications[index - 1];
                const showRejectedDivider =
                  filter === "all" && isRejected && (!prevApp || prevApp.status !== "rejected");

                return (
                  <div
                    key={app.application_id}
                    className="app-card"
                    style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
                  >
                    {showRejectedDivider && (
                      <div className="flex items-center gap-3 pt-2 pb-3">
                        <span className="text-xs font-bold text-gray-300 whitespace-nowrap">
                          Not moving forward
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}

                    <div
                      className={`relative bg-white rounded-[24px] border border-gray-100 p-5 sm:p-6 overflow-hidden transition ${
                        isRejected ? "opacity-60" : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Status accent along the left edge */}
                      <span
                        aria-hidden
                        className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
                        style={{ background: status.hex }}
                      />

                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Initial avatar */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold"
                          style={{ background: `${tint}1A`, color: tint }}
                        >
                          {initialOf(app.job_title) ?? <Briefcase className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-bold truncate ${
                              isRejected ? "text-gray-500" : "text-gray-900"
                            }`}
                          >
                            {app.job_title}
                          </p>
                          {app.company_name && (
                            <p
                              className={`flex items-center gap-1 text-xs font-medium truncate mt-0.5 ${
                                isRejected ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{app.company_name}</span>
                            </p>
                          )}
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5 mt-1.5">
                            <span
                              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                            <span
                              className="text-xs text-gray-400"
                              title={new Date(app.applied_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            >
                              Applied {timeAgo(app.applied_at)}
                            </span>
                          </div>
                        </div>

                        <ScoreRing score={app.similarity_score} muted={isRejected} />
                      </div>

                      {/* Stage tracker (hidden for closed applications) */}
                      {!isRejected && <Pipeline status={app.status} />}

                      {/* Next-step hint */}
                      <p
                        className={`text-xs rounded-xl px-3.5 py-2.5 mt-5 ${
                          isRejected ? "bg-gray-50 text-gray-400" : `${status.bg} ${status.color}`
                        }`}
                      >
                        {status.hint}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        {/* Via pill */}
                        <span className="flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 border text-gray-500 bg-gray-50 border-gray-100">
                          {app.applied_via === "manual" ? (
                            <MousePointer className="w-3 h-3" />
                          ) : (
                            <Zap
                              className={`w-3 h-3 ${isRejected ? "text-gray-300" : "text-[#F2754A]"}`}
                            />
                          )}
                          {app.applied_via === "manual" ? "Manual" : "Auto Apply"}
                        </span>

                        {/* Withdraw */}
                        {canWithdraw && (
                          <button
                            type="button"
                            onClick={() => setWithdrawId(app.application_id)}
                            className="text-xs font-bold text-[#D8452F] hover:text-[#B8371F] bg-[#E0533D]/10 hover:bg-[#E0533D]/20 px-3 py-1.5 rounded-full transition-colors"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}