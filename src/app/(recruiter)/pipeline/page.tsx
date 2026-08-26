"use client";

import { useEffect, useMemo, useState } from "react";
import { getMatches, updatePipelineStage, scheduleInterview } from "@/services/match.service";
import InterviewScheduleModal from "@/components/InterviewScheduleModal";
import {
  UserCheck, Phone, CalendarDays, BadgeDollarSign,
  PartyPopper, XCircle, ChevronRight, ChevronLeft, Briefcase,
} from "lucide-react";

import ConfettiBurst from "@/components/ConfettiBurst";




const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Match {
  match_id: string;
  name: string;
  trust_score: number;
  job_title: string;
  job_id: string;
  pipeline_stage: string;
  interview_scheduled_at: string | null;
}

interface JobOption {
  id: string;
  title: string;
}

const STAGES: {
  key: string;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: "matched",     label: "Matched",   Icon: UserCheck,       color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"    },
  { key: "contacted",   label: "Contacted", Icon: Phone,           color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100"  },
  { key: "interviewing",label: "Interview", Icon: CalendarDays,    color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
  { key: "offered",     label: "Offered",   Icon: BadgeDollarSign, color: "text-[#F2754A]",   bg: "bg-orange-50",  border: "border-orange-100"  },
  { key: "hired",       label: "Hired",     Icon: PartyPopper,     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { key: "rejected",    label: "Rejected",  Icon: XCircle,         color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100"     },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#F2754A" :
    score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

function StageCard({
  match,
  stages,
  onMove,
  celebrating,
}: {
  match: Match;
  stages: typeof STAGES;
  onMove: (matchId: string, newStage: string) => Promise<void>;
  celebrating?: boolean;
}) {
  const [movingForward, setMovingForward] = useState(false);
  const [movingBack,    setMovingBack]    = useState(false);
  const currentIdx = stages.findIndex((s) => s.key === match.pipeline_stage);
  const nextStage = stages[currentIdx + 1];
  const prevStage = stages[currentIdx - 1];

  const handleMoveForward = async () => {
    if (!nextStage || movingForward) return;
    setMovingForward(true);
    try { await onMove(match.match_id, nextStage.key); }
    finally { setMovingForward(false); }
  };

  const handleMoveBack = async () => {
    if (!prevStage || movingBack) return;
    setMovingBack(true);
    try { await onMove(match.match_id, prevStage.key); }
    finally { setMovingBack(false); }
  };

  return (
    
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-3 group overflow-hidden">
      
      {celebrating && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <ConfettiBurst />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-100">
          <span className="text-white font-black text-[10px]">{getInitials(match.name)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-900 truncate">{match.name}</p>
          <p className="text-[10px] text-gray-400 truncate">{match.job_title}</p>
        </div>
      </div>

      <ScoreBar score={match.trust_score} />

      {/* Scheduled interview time, if this match is in the Interview stage */}
      {match.pipeline_stage === "interviewing" && match.interview_scheduled_at && (
        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-1 w-fit">
          <CalendarDays className="w-3 h-3" />
          {new Date(match.interview_scheduled_at).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Move forward */}
      {nextStage && (
        <button
          type="button"
          onClick={handleMoveForward}
          disabled={movingForward}
          className={`mt-2.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-colors disabled:opacity-40 ${nextStage.bg} ${nextStage.color}`}
        >
          <span>Move to {nextStage.label}</span>
          {movingForward
            ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
            : <ChevronRight className="w-3 h-3" />
          }
        </button>
      )}

      {/* Move back */}
      {prevStage && (
        <button
          type="button"
          onClick={handleMoveBack}
          disabled={movingBack}
          className="mt-1.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Back to {prevStage.label}</span>
        </button>
      )}
    </div>
  );
}

export default function PipelinePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [loading, setLoading] = useState(true);
  // Filtering by TITLE, not id — job_id casing/shape didn't line up
  // between /recruiter/jobs and getMatches(), so id-based comparisons
  // always came up empty and the filter silently no-op'd to "all".
  // job_title is confirmed consistent across both, so we join on that.
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("all");
  const [pendingInterviewMatch, setPendingInterviewMatch] = useState<Match | null>(null);
  const [celebratingMatchId, setCelebratingMatchId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("access_token");

        const [matchesData, jobsRes] = await Promise.all([
          getMatches(),
          fetch(`${API_URL}/recruiter/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const normalized: Match[] = (matchesData || []).map((m: any) => ({
          match_id: m.match_id ?? m.matchId ?? m.id,
          name: m.name ?? m.candidate_name ?? m.candidateName ?? "",
          trust_score: m.trust_score ?? m.trustScore ?? 0,
          job_title: m.job_title ?? m.jobTitle ?? m.job?.title ?? "",
          job_id: String(m.job_id ?? m.jobId ?? m.job?.id ?? ""),
          pipeline_stage: m.pipeline_stage ?? m.pipelineStage ?? m.stage ?? "matched",
          interview_scheduled_at:
            m.interview_scheduled_at ?? m.interviewScheduledAt ?? null,
        }));
        setMatches(normalized);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const options: JobOption[] = (jobsData.jobs || []).map((j: { id: string; title: string }) => ({
            id: String(j.id),
            title: j.title,
          }));
          setJobOptions(options);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMove = async (matchId: string, newStage: string) => {
    if (newStage === "interviewing") {
      const match = matches.find((m) => m.match_id === matchId);
      if (match) {
        setPendingInterviewMatch(match);
        return;
      }
    }
    await updatePipelineStage(matchId, newStage);
    setMatches((prev) =>
      prev.map((m) => m.match_id === matchId ? { ...m, pipeline_stage: newStage } : m)
    );

    if (newStage === "hired") {
    setCelebratingMatchId(matchId);
    window.setTimeout(() => setCelebratingMatchId(null), 1300);
  }
  };

  const handleConfirmInterview = async (scheduledAt: string) => {
    if (!pendingInterviewMatch) return;
    const matchId = pendingInterviewMatch.match_id;

    await updatePipelineStage(matchId, "interviewing");
    await scheduleInterview(matchId, scheduledAt);

    setMatches((prev) =>
      prev.map((m) =>
        m.match_id === matchId
          ? { ...m, pipeline_stage: "interviewing", interview_scheduled_at: scheduledAt }
          : m
      )
    );
    setPendingInterviewMatch(null);
  };

  // Unique job titles, preferring the /recruiter/jobs list (so jobs with
  // zero matches still show up), falling back to titles derived from
  // matches if that call failed or returned nothing.
  const jobs = useMemo(() => {
    const source: JobOption[] =
      jobOptions.length > 0
        ? jobOptions
        : matches.map((m) => ({ id: m.job_id, title: m.job_title }));

    const seen = new Map<string, JobOption>();
    for (const j of source) {
      if (j.title && !seen.has(j.title)) seen.set(j.title, j);
    }
    return Array.from(seen.values());
  }, [jobOptions, matches]);

  const visibleMatches =
    selectedJobTitle === "all"
      ? matches
      : matches.filter((m) => m.job_title === selectedJobTitle);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading pipeline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pipeline</h2>
            <p className="text-sm text-gray-400 mt-1">
              {visibleMatches.length} candidate{visibleMatches.length !== 1 ? "s" : ""}
              {selectedJobTitle === "all"
                ? " across all jobs"
                : ` for ${selectedJobTitle}`}
            </p>
          </div>

          {/* Job filter */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
                className="text-sm font-semibold text-gray-700 bg-transparent outline-none pr-2 py-1.5 cursor-pointer"
              >
                <option value="all">All jobs</option>
                {jobs.map((job) => (
                  <option key={job.title} value={job.title}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map(({ key, label, Icon, bg, border, color }) => {
            const cols = visibleMatches.filter((m) => m.pipeline_stage === key);
            return (
              <div key={key} className="flex flex-col gap-2">
                {/* Column header */}
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border ${bg} ${border}`}>
                  <span className={color}><Icon className="w-3.5 h-3.5" /></span>
                  <span className={`text-xs font-bold flex-1 ${color}`}>{label}</span>
                  <span className={`text-xs font-black tabular-nums ${color}`}>{cols.length}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 min-h-[120px]">
                  {cols.length === 0 ? (
                    <div className={`flex-1 flex items-center justify-center rounded-2xl border border-dashed ${border} bg-white/70 py-6 transition-all duration-200 hover:bg-opacity-80 hover:shadow-sm hover:-translate-y-0.5`}>
                      <p className={`text-[10px] font-semibold ${color}`}>Empty</p>
                    </div>
                  ) : (
                    cols.map((match) => (
                      <StageCard
                        key={match.match_id}
                        match={match}
                        stages={STAGES}
                        onMove={handleMove}
                        celebrating={celebratingMatchId === match.match_id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Interview scheduling modal — blocks the "interviewing" stage
          change until a date/time is confirmed. */}
      {pendingInterviewMatch && (
        <InterviewScheduleModal
          candidateName={pendingInterviewMatch.name}
          onConfirm={handleConfirmInterview}
          onCancel={() => setPendingInterviewMatch(null)}
        />
      )}
    </div>
  );
}