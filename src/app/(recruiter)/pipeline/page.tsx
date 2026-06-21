"use client";

import { useEffect, useState } from "react";
import { getMatches, updatePipelineStage } from "@/services/match.service";
import {
  UserCheck, Phone, CalendarDays, BadgeDollarSign,
  PartyPopper, XCircle, ChevronRight, ChevronLeft,
} from "lucide-react";

interface Match {
  match_id: string;
  name: string;
  trust_score: number;
  job_title: string;
  job_id: string;
  pipeline_stage: string;
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
}: {
  match: Match;
  stages: typeof STAGES;
  onMove: (matchId: string, newStage: string) => Promise<void>;
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 group">
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
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMatches();
        setMatches(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMove = async (matchId: string, newStage: string) => {
    await updatePipelineStage(matchId, newStage);
    setMatches((prev) =>
      prev.map((m) => m.match_id === matchId ? { ...m, pipeline_stage: newStage } : m)
    );
  };

  // Unique jobs from matches for the filter dropdown
  const jobs = Array.from(
    new Map(matches.map((m) => [m.job_id, m.job_title])).entries()
  ).map(([id, title]) => ({ id, title }));

  const visibleMatches =
    selectedJobId === "all"
      ? matches
      : matches.filter((m) => m.job_id === selectedJobId);

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

  const total = matches.length;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-[1200px] mx-auto">

        {/* Logo */}
        <h1
          className="text-2xl font-bold mb-10"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Pipeline</h2>
          <p className="text-sm text-gray-400 mt-1">{total} candidate{total !== 1 ? "s" : ""} across all stages</p>
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
                    <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 py-6">
                      <p className="text-[10px] font-semibold text-gray-300">Empty</p>
                    </div>
                  ) : (
                    cols.map((match) => (
                      <StageCard
                        key={match.match_id}
                        match={match}
                        stages={STAGES}
                        onMove={handleMove}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}