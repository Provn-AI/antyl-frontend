"use client";

import { useEffect, useState } from "react";
import { getApplications, withdrawApplication } from "@/services/application.service";
import DeveloperNavbar from "../components/DeveloperNavbar";
import { AlertTriangle, Zap, MousePointer, Clock, Eye, CheckCircle2, XCircle, Calendar } from "lucide-react";

interface Application {
  application_id: string;
  job_id: string;
  job_title: string;
  status: string;
  applied_via: string;
  similarity_score: number;
  applied_at: string;
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[24px] border border-gray-100 shadow-xl p-6">
        <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Withdraw application?</h3>
        <p className="text-sm text-gray-400 mb-6">
          This will remove your application from the recruiter view. You can re-apply later.
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
              try { await onConfirm(); } finally { setBusy(false); onClose(); }
            }}
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {busy ? "…" : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  sent:      { label: "Sent",       color: "text-gray-600",    bg: "bg-gray-100",    icon: <Clock className="w-3 h-3" /> },
  viewed:    { label: "Viewed",     color: "text-blue-600",    bg: "bg-blue-50",     icon: <Eye className="w-3 h-3" /> },
  matched:   { label: "Matched",    color: "text-emerald-600", bg: "bg-emerald-50",  icon: <CheckCircle2 className="w-3 h-3" /> },
  interview: { label: "Interview",  color: "text-violet-600",  bg: "bg-violet-50",   icon: <Calendar className="w-3 h-3" /> },
  rejected:  { label: "Rejected",   color: "text-red-500",     bg: "bg-red-50",      icon: <XCircle className="w-3 h-3" /> },
};

const FILTERS = ["all", "active", "matched", "rejected"] as const;
type Filter = typeof FILTERS[number];

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#F2754A" :
    score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {score}% match
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

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
    return () => { mounted = false; };
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    await withdrawApplication(withdrawId);
    setApplications((prev) => prev.filter((app) => app.application_id !== withdrawId));
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all")      return true;
    if (filter === "active")   return ["sent", "viewed"].includes(app.status);
    if (filter === "matched")  return app.status === "matched";
    if (filter === "rejected") return app.status === "rejected";
    return true;
  });

  // Tab counts
  const counts: Record<Filter, number> = {
    all:      applications.length,
    active:   applications.filter((a) => ["sent", "viewed"].includes(a.status)).length,
    matched:  applications.filter((a) => a.status === "matched").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading applications…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0]">
      <DeveloperNavbar />

      <ConfirmModal
        open={withdrawId !== null}
        onConfirm={handleWithdraw}
        onClose={() => setWithdrawId(null)}
      />

      <div className="px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Applications</h1>
            <p className="text-gray-400 text-sm">
              {applications.length} total application{applications.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
                  filter === tab
                    ? "bg-[#F2754A] text-white shadow-md shadow-orange-100"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                }`}
              >
                {tab}
                <span
                  className={`text-xs font-black px-1.5 py-0.5 rounded-full ${
                    filter === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No applications here yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => {
                const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.sent;
                const canWithdraw = app.status === "sent" || app.status === "viewed";

                return (
                  <div
                    key={app.application_id}
                    className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{app.job_title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(app.applied_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${status.bg} ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    {/* Score bar */}
                    <ScoreBar score={app.similarity_score} />

                    <div className="flex items-center justify-between mt-4">
                      {/* Via pill */}
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                        {app.applied_via === "manual" ? (
                          <MousePointer className="w-3 h-3" />
                        ) : (
                          <Zap className="w-3 h-3 text-[#F2754A]" />
                        )}
                        {app.applied_via === "manual" ? "Manual" : "Auto Apply"}
                      </span>

                      {/* Withdraw */}
                      {canWithdraw && (
                        <button
                          type="button"
                          onClick={() => setWithdrawId(app.application_id)}
                          className="text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
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