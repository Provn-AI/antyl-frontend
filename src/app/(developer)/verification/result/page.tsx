"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, Lightbulb, ChevronRight } from "lucide-react";

import {
  getVerificationScore,
  getVerificationCooldown,
} from "@/services/verification.service";

interface ScoreData {
  overall_score: number;
  tier: string;
  dimensions: {
    technical_depth: number;
    code_quality: number;
    project_complexity: number;
    communication: number;
  };
  improvement_suggestions: string[];
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Elite:    { label: "Elite",    color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
  Senior:   { label: "Senior",   color: "text-[#F2754A]",   bg: "bg-orange-50",  border: "border-orange-100" },
  Mid:      { label: "Mid",      color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"  },
  Junior:   { label: "Junior",   color: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100"    },
};

const DIMENSIONS = [
  { key: "technical_depth",    label: "Technical Depth"     },
  { key: "code_quality",       label: "Code Quality"        },
  { key: "project_complexity", label: "Project Complexity"  },
  { key: "communication",      label: "Communication"       },
] as const;

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={radius} strokeWidth="10" className="fill-none stroke-gray-100" />
        <circle
          cx="68" cy="68" r={radius} strokeWidth="10"
          fill="none"
          stroke="url(#scoreGrad)"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F2754A" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
        <span className="text-xs font-semibold text-gray-400 mt-1">/ 100</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "text-emerald-600" :
    value >= 60 ? "text-[#F2754A]"  :
    value >= 40 ? "text-amber-500"  : "text-rose-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${color}`}>{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            background: "linear-gradient(90deg, #F2754A, #FFB347)",
          }}
        />
      </div>
    </div>
  );
}

export default function VerificationResultPage() {
  const router  = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [score,    setScore]    = useState<ScoreData | null>(null);
  const [cooldown, setCooldown] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const [scoreData, cooldownData] = await Promise.all([
          getVerificationScore(),
          getVerificationCooldown(),
        ]);
        setScore(scoreData);
        setCooldown(cooldownData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Calculating your score…</p>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <p className="text-gray-400 font-medium">No verification score found.</p>
      </div>
    );
  }

  const tier = TIER_CONFIG[score.tier] ?? TIER_CONFIG.Mid;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">

        {/* Logo */}
        <h1
          className="text-2xl font-bold mb-10"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        {/* ── Score hero card ── */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 mb-6">
            <Trophy className="w-3.5 h-3.5 text-[#F2754A]" />
            <span className="text-xs font-bold text-[#F2754A] uppercase tracking-widest">
              Verification Complete
            </span>
          </div>

          <ScoreRing score={score.overall_score} />

          <div className="mt-5">
            <span
              className={`inline-block text-sm font-bold px-4 py-1.5 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}
            >
              {score.tier} Engineer
            </span>
          </div>

          <p className="text-xs text-gray-400 font-medium mt-3">
            Your Antyl Score is now live on your profile.
          </p>
        </div>

        {/* ── Dimension breakdown ── */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
            Score breakdown
          </p>
          <div className="space-y-5">
            {DIMENSIONS.map(({ key, label }) => (
              <DimensionBar
                key={key}
                label={label}
                value={score.dimensions[key]}
              />
            ))}
          </div>
        </div>

        {/* ── Suggestions ── */}
        {score.improvement_suggestions?.length > 0 && (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-[#F2754A]" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                How to improve
              </p>
            </div>
            <div className="space-y-3">
              {score.improvement_suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-orange-50 text-[#F2754A] text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cooldown ── */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Next verification</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Available in{" "}
                  <span className="font-bold text-gray-600">
                    {cooldown.days}d {cooldown.hours}h
                  </span>
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-300 bg-gray-50 px-3 py-1.5 rounded-full">
              Locked
            </span>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
        >
          Go to your profile
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}