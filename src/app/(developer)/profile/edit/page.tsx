"use client";

import { useEffect, useState } from "react";
import { Clock, Lightbulb, BarChart3, ShieldCheck } from "lucide-react";

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

// Same thresholds used on the applications page: green, orange, amber, coral red.
function barColor(value: number) {
  return value >= 80 ? "#10b981" : value >= 60 ? "#F2754A" : value >= 40 ? "#f59e0b" : "#E0533D";
}

function BigScoreRing({ score }: { score: number }) {
  const size = 168;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-orange-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="url(#resultGrad)"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - clamped / 100)}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="resultGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F2754A" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-extrabold text-gray-900 tabular-nums leading-none"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {clamped}
        </span>
        <span className="text-xs font-semibold text-gray-400 mt-1.5">out of 100</span>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-7 mb-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#F2754A]" />
        </div>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function VerificationResultPage() {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [cooldown, setCooldown] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const scoreData = await getVerificationScore();
        const cooldownData = await getVerificationCooldown();

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
      <div className="min-h-screen bg-[#FAF6F0] px-4 py-10 sm:py-12">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="bg-white rounded-[28px] border border-gray-100 p-10 mb-4">
            <div className="w-40 h-40 rounded-full bg-gray-100 mx-auto" />
            <div className="h-6 w-28 bg-gray-100 rounded-full mx-auto mt-6" />
          </div>
          <div className="h-56 bg-white rounded-[24px] border border-gray-100 mb-4" />
          <div className="h-40 bg-white rounded-[24px] border border-gray-100" />
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] px-4 py-16 flex items-start justify-center">
        <div className="w-full max-w-md bg-white rounded-[24px] border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-[#F2754A]" />
          </div>
          <p className="text-sm font-bold text-gray-700">No verification score found</p>
          <p className="text-xs text-gray-400 mt-1">
            Complete a verification to see your score and breakdown here.
          </p>
          <a
            href="/verification"
            className="inline-block mt-5 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
          >
            Start verification
          </a>
        </div>
      </div>
    );
  }

  const dimensions = [
    { label: "Technical depth", value: score.dimensions.technical_depth },
    { label: "Code quality", value: score.dimensions.code_quality },
    { label: "Project complexity", value: score.dimensions.project_complexity },
    { label: "Communication", value: score.dimensions.communication },
  ];

  const suggestions = score.improvement_suggestions ?? [];
  const canVerifyNow = cooldown.days === 0 && cooldown.hours === 0;

  return (
    <div className="min-h-screen bg-[#FAF6F0] px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Score hero */}
        <section className="relative bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden px-6 pt-10 pb-8 mb-4 text-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-orange-50 to-transparent"
          />
          <div className="relative">
            <BigScoreRing score={score.overall_score} />
            <span className="inline-flex items-center gap-1.5 mt-6 px-4 py-1.5 rounded-full text-sm font-bold text-[#D9582F] bg-orange-50 border border-orange-100">
              <ShieldCheck className="w-4 h-4" />
              {score.tier}
            </span>
            <p className="text-xs text-gray-400 mt-3">Your latest Antyl verification result</p>
          </div>
        </section>

        {/* Breakdown */}
        <Card icon={BarChart3} title="Score breakdown">
          <div className="space-y-5">
            {dimensions.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: barColor(item.value) }}
                  >
                    {item.value}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(0, Math.min(100, item.value))}%`,
                      background: barColor(item.value),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Suggestions */}
        <Card icon={Lightbulb} title="Improvement suggestions">
          {suggestions.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nothing to improve right now. Keep your repositories active and re-verify when you
              can.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/70"
                >
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#F2754A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-px">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{suggestion}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* Next verification */}
        <Card icon={Clock} title="Next verification">
          {canVerifyNow ? (
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-orange-50">
              <p className="text-sm font-semibold text-[#D9582F]">
                You can verify again now.
              </p>
              <a
                href="/verification"
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors flex-shrink-0"
              >
                Re-verify
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl bg-gray-50/70 py-4 text-center">
                <p
                  className="text-3xl font-bold text-gray-900 tabular-nums"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {cooldown.days}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  day{cooldown.days === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex-1 rounded-2xl bg-gray-50/70 py-4 text-center">
                <p
                  className="text-3xl font-bold text-gray-900 tabular-nums"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {cooldown.hours}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1">
                  hour{cooldown.hours === 1 ? "" : "s"}
                </p>
              </div>
              <p className="flex-[1.4] text-xs text-gray-400 leading-relaxed pl-1">
                until you can run another verification and update your score.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}