"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getMatches, updatePipelineStage, scheduleInterview } from "@/services/match.service";
import InterviewScheduleModal from "@/components/InterviewScheduleModal";
import {
  UserCheck, Phone, CalendarDays, BadgeDollarSign,
  PartyPopper, XCircle, ChevronRight, ChevronLeft, Briefcase,
  AlertTriangle, Pencil,
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
  meeting_link: string | null;
}

interface JobOption {
  id: string;
  title: string;
}

// Drives the interview modal: "schedule" is the original flow (moving a
// match into the Interview stage for the first time, which also changes
// pipeline_stage). "edit" reopens the modal pre-filled for a match that's
// already in the Interview stage, and only updates the date/time/link —
// it never touches pipeline_stage.
interface InterviewModalState {
  match: Match;
  mode: "schedule" | "edit";
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

/** Small centered confirmation modal for destructive actions like rejecting a candidate. */
function ConfirmRejectModal({
  candidateName,
  onConfirm,
  onCancel,
}: {
  candidateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Reject candidate?</h3>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to reject <span className="font-semibold text-gray-700">{candidateName}</span>?
          This will move them to the Rejected stage.
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              "Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StageCard({
  match,
  stages,
  onMove,
  onRejectRequest,
  onEditInterviewRequest,
  celebrating,
  size = "compact",
}: {
  match: Match;
  stages: typeof STAGES;
  onMove: (matchId: string, newStage: string) => Promise<void>;
  onRejectRequest: (match: Match) => void;
  onEditInterviewRequest: (match: Match) => void;
  celebrating?: boolean;
  size?: "compact" | "comfortable";
}) {
  const [movingForward, setMovingForward] = useState(false);
  const [movingBack,    setMovingBack]    = useState(false);
  const currentIdx = stages.findIndex((s) => s.key === match.pipeline_stage);
  const nextStage = stages[currentIdx + 1];
  const prevStage = stages[currentIdx - 1];
  const isRejected = match.pipeline_stage === "rejected";
  const comfy = size === "comfortable";

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
    
    <div className={`relative bg-white rounded-2xl border border-gray-100 shadow-sm group overflow-hidden ${comfy ? "p-4" : "p-3"}`}>
      
      {celebrating && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <ConfettiBurst />
        </div>
      )}
      {/* Header */}
      <div className={`flex items-center gap-2 ${comfy ? "mb-2.5" : "mb-2"}`}>
        <div className={`rounded-xl bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-100 ${comfy ? "w-10 h-10" : "w-8 h-8"}`}>
          <span className={`text-white font-black ${comfy ? "text-xs" : "text-[10px]"}`}>{getInitials(match.name)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-bold text-gray-900 truncate ${comfy ? "text-sm" : "text-xs"}`}>{match.name}</p>
          <p className={`text-gray-400 truncate ${comfy ? "text-xs" : "text-[10px]"}`}>{match.job_title}</p>
        </div>
      </div>

      <ScoreBar score={match.trust_score} />

      {/* Scheduled interview time + meeting link, if this match is in the Interview stage */}
      {match.pipeline_stage === "interviewing" && match.interview_scheduled_at && (
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-1 w-fit ${comfy ? "text-xs" : "text-[10px]"}`}>
              <CalendarDays className="w-3 h-3" />
              {new Date(match.interview_scheduled_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <button
              type="button"
              onClick={() => onEditInterviewRequest(match)}
              className={`flex items-center justify-center rounded-full text-amber-500 bg-amber-50 hover:bg-amber-100 transition-colors flex-shrink-0 ${comfy ? "w-7 h-7" : "w-6 h-6"}`}
              aria-label="Edit interview time"
              title="Edit interview time"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          {match.meeting_link && (
            
            <a  href={match.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold text-blue-600 hover:underline w-fit ${comfy ? "text-xs" : "text-[10px]"}`}
            >
              Join meeting →
            </a>
          )}
        </div>
      )}

      {/* Move forward */}
      {nextStage && (
        <button
          type="button"
          onClick={handleMoveForward}
          disabled={movingForward}
          className={`mt-2.5 w-full flex items-center justify-between rounded-xl font-bold transition-colors disabled:opacity-40 ${nextStage.bg} ${nextStage.color} ${comfy ? "px-3.5 py-2.5 text-sm" : "px-2.5 py-2 text-[11px]"}`}
        >
          <span>Move to {nextStage.label}</span>
          {movingForward
            ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
            : <ChevronRight className="w-3.5 h-3.5" />
          }
        </button>
      )}

      {/* Move back */}
      {prevStage && (
        <button
          type="button"
          onClick={handleMoveBack}
          disabled={movingBack}
          className={`mt-1.5 w-full flex items-center justify-between rounded-xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-40 ${comfy ? "px-3.5 py-2.5 text-sm" : "px-2.5 py-2 text-[11px]"}`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to {prevStage.label}</span>
        </button>
      )}

      {/* Reject — available at any stage except when already rejected */}
      {!isRejected && (
        <button
          type="button"
          onClick={() => onRejectRequest(match)}
          className={`mt-1.5 w-full flex items-center justify-between rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors ${comfy ? "px-3.5 py-2.5 text-sm" : "px-2.5 py-2 text-[11px]"}`}
        >
          <span>Reject</span>
          <XCircle className="w-3.5 h-3.5" />
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
  const [interviewModalState, setInterviewModalState] = useState<InterviewModalState | null>(null);
  const [pendingRejectMatch, setPendingRejectMatch] = useState<Match | null>(null);
  const [celebratingMatchId, setCelebratingMatchId] = useState<string | null>(null);
  // Which single stage is shown on mobile — the six-column board doesn't
  // fit a phone screen, so mobile shows one stage at a time with
  // left/right paging (arrows, quick-jump tabs, and swipe) instead.
  const [mobileStageIndex, setMobileStageIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

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
          meeting_link: m.meeting_link ?? m.meetingLink ?? null,
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
        setInterviewModalState({ match, mode: "schedule" });
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

  // Opens the interview modal pre-filled for a match that's already in
  // the Interview stage, so the recruiter can change the date/time/link
  // without re-triggering the pipeline_stage transition.
  const handleEditInterviewRequest = (match: Match) => {
    setInterviewModalState({ match, mode: "edit" });
  };

  const handleConfirmInterview = async (scheduledAt: string, meetingLink: string) => {
    if (!interviewModalState) return;
    const { match, mode } = interviewModalState;
    const matchId = match.match_id;

    if (mode === "schedule") {
      await updatePipelineStage(matchId, "interviewing");
    }
    await scheduleInterview(matchId, scheduledAt, meetingLink);

    setMatches((prev) =>
      prev.map((m) =>
        m.match_id === matchId
          ? {
              ...m,
              pipeline_stage: "interviewing",
              interview_scheduled_at: scheduledAt,
              meeting_link: meetingLink || null,
            }
          : m
      )
    );
    setInterviewModalState(null);
  };

  // Reject flow — opens a confirmation modal; only commits the stage
  // change if the recruiter confirms.
  const handleRejectRequest = (match: Match) => {
    setPendingRejectMatch(match);
  };

  const handleConfirmReject = async () => {
    if (!pendingRejectMatch) return;
    const matchId = pendingRejectMatch.match_id;

    await updatePipelineStage(matchId, "rejected");
    setMatches((prev) =>
      prev.map((m) =>
        m.match_id === matchId ? { ...m, pipeline_stage: "rejected" } : m
      )
    );
    setPendingRejectMatch(null);
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

  const activeStage = STAGES[mobileStageIndex];
  const activeStageMatches = visibleMatches.filter((m) => m.pipeline_stage === activeStage.key);

  const goPrevStage = () => setMobileStageIndex((i) => Math.max(0, i - 1));
  const goNextStage = () => setMobileStageIndex((i) => Math.min(STAGES.length - 1, i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    const SWIPE_THRESHOLD = 45;
    if (diff > SWIPE_THRESHOLD) goPrevStage();
    else if (diff < -SWIPE_THRESHOLD) goNextStage();
    touchStartXRef.current = null;
  };

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
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pipeline</h2>
            <p className="text-sm text-gray-400 mt-1">
              {visibleMatches.length} candidate{visibleMatches.length !== 1 ? "s" : ""}
              {selectedJobTitle === "all"
                ? " across all jobs"
                : ` for ${selectedJobTitle}`}
            </p>
          </div>

          {/* Job filter */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm w-full sm:w-auto">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
                className="text-sm font-semibold text-gray-700 bg-transparent outline-none pr-2 py-1.5 cursor-pointer w-full sm:w-auto"
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

        {/* Kanban columns — full six-across grid from lg up. */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-3">
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
                        onRejectRequest={handleRejectRequest}
                        onEditInterviewRequest={handleEditInterviewRequest}
                        celebrating={celebratingMatchId === match.match_id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile pipeline — one stage on screen at a time. Six columns
            never fit a phone width without turning into unreadable
            slivers, so instead: quick-jump stage tabs, big left/right
            arrows, and swipe left/right on the card list itself. */}
        <div className="lg:hidden">
          {/* Quick-jump stage tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 -mx-4 px-4">
            {STAGES.map((s, i) => {
              const count = visibleMatches.filter((m) => m.pipeline_stage === s.key).length;
              const active = i === mobileStageIndex;
              const TabIcon = s.Icon;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setMobileStageIndex(i)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                    active ? `${s.bg} ${s.color} ${s.border}` : "bg-white text-gray-400 border-gray-100"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {s.label}
                  <span className="text-[10px] font-black tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Stage header with left/right paging arrows */}
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={goPrevStage}
              disabled={mobileStageIndex === 0}
              aria-label="Previous stage"
              className="w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 disabled:opacity-30 disabled:pointer-events-none hover:text-[#F2754A] hover:border-[#F2754A] transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border ${activeStage.bg} ${activeStage.border}`}>
              <activeStage.Icon className={`w-4 h-4 ${activeStage.color}`} />
              <span className={`text-sm font-bold ${activeStage.color}`}>{activeStage.label}</span>
              <span className={`text-xs font-black tabular-nums ${activeStage.color}`}>{activeStageMatches.length}</span>
            </div>

            <button
              type="button"
              onClick={goNextStage}
              disabled={mobileStageIndex === STAGES.length - 1}
              aria-label="Next stage"
              className="w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 disabled:opacity-30 disabled:pointer-events-none hover:text-[#F2754A] hover:border-[#F2754A] transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Card list for the active stage — full width, swipeable left/right to change stage */}
          <div
            className="flex flex-col gap-2.5 min-h-[220px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeStageMatches.length === 0 ? (
              <div className={`flex items-center justify-center rounded-2xl border border-dashed ${activeStage.border} bg-white/70 py-16`}>
                <p className={`text-sm font-semibold ${activeStage.color}`}>No candidates here yet</p>
              </div>
            ) : (
              activeStageMatches.map((match) => (
                <StageCard
                  key={match.match_id}
                  match={match}
                  stages={STAGES}
                  onMove={handleMove}
                  onRejectRequest={handleRejectRequest}
                  onEditInterviewRequest={handleEditInterviewRequest}
                  celebrating={celebratingMatchId === match.match_id}
                  size="comfortable"
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Interview scheduling / editing modal — "schedule" mode blocks the
          "interviewing" stage change until a date/time is confirmed;
          "edit" mode reopens pre-filled for a match already in that stage
          and only updates the date/time/link. */}
      {interviewModalState && (
        <InterviewScheduleModal
          candidateName={interviewModalState.match.name}
          initialScheduledAt={
            interviewModalState.mode === "edit"
              ? interviewModalState.match.interview_scheduled_at ?? undefined
              : undefined
          }
          initialMeetingLink={
            interviewModalState.mode === "edit"
              ? interviewModalState.match.meeting_link ?? undefined
              : undefined
          }
          onConfirm={handleConfirmInterview}
          onCancel={() => setInterviewModalState(null)}
        />
      )}

      {/* Reject confirmation modal — blocks the "rejected" stage change
          until the recruiter explicitly confirms. */}
      {pendingRejectMatch && (
        <ConfirmRejectModal
          candidateName={pendingRejectMatch.name}
          onConfirm={handleConfirmReject}
          onCancel={() => setPendingRejectMatch(null)}
        />
      )}
    </div>
  );
}