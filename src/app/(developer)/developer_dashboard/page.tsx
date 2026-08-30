"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Flame, Target, TrendingUp, Zap, CalendarClock } from "lucide-react";

import DeveloperNavbar from "../components/DeveloperNavbar";
import { getMyStreak, StreakSummary } from "@/services/streak.service";
import { getMyBadges, Badge } from "@/services/badge.service";
import { getAutoApplyStatus, AutoApplyStatus } from "@/services/developer.service";
import { getApplicationDashboard, ApplicationDashboard } from "@/services/dashboard.service";
import { getMyInterviews, DeveloperMatch } from "@/services/match.service";

type ViewMode = "weekly" | "monthly";

function StatCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-300 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<ApplicationDashboard | null>(null);
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [autoApply, setAutoApply] = useState<AutoApplyStatus | null>(null);
  const [interviews, setInterviews] = useState<DeveloperMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("weekly");

  useEffect(() => {
    async function load() {
      try {
        const [dashboardData, streakData, badgeData, autoApplyData, interviewsData] =
          await Promise.all([
            getApplicationDashboard(),
            getMyStreak(),
            getMyBadges(),
            getAutoApplyStatus(),
            getMyInterviews(),
          ]);
        setDashboard(dashboardData);
        setStreak(streakData);
        setBadges(badgeData.badges);
        setAutoApply(autoApplyData);
        setInterviews(
          interviewsData.filter(
            (m) =>
              m.interview_scheduled_at &&
              new Date(m.interview_scheduled_at) >= new Date()
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <p className="text-gray-400 font-medium">Could not load your dashboard.</p>
        </div>
      </div>
    );
  }

  const chartData = view === "weekly" ? dashboard.weekly_trend : dashboard.monthly_trend;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0]">
      <DeveloperNavbar />

      <div className="px-4 py-12">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your progress</h1>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard
              icon={<Target className="w-5 h-5 text-[#F2754A]" />}
              label="This week"
              value={dashboard.total_applications_this_week}
              sublabel="applications sent"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-[#F2754A]" />}
              label="This month"
              value={dashboard.total_applications_this_month}
              sublabel="applications sent"
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-[#F2754A]" />}
              label="Auto-apply today"
              value={autoApply ? `${autoApply.used}/${autoApply.limit}` : "—"}
              sublabel={autoApply?.is_enabled ? "Active" : "Off"}
            />
            <StatCard
              icon={<Flame className="w-5 h-5 text-[#F2754A]" />}
              label="Streak"
              value={streak?.current_streak_days ?? 0}
              sublabel={`Best: ${streak?.longest_streak_days ?? 0} days`}
            />
          </div>

          {/* ── Upcoming interviews ── */}
          {interviews.length > 0 && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-5 h-5 text-[#F2754A]" />
                <h2 className="font-bold text-gray-900 text-lg">Upcoming Interviews</h2>
              </div>
              <div className="space-y-2">
                {interviews.map((m) => (
                  <div
                    key={m.match_id}
                    className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3 bg-orange-50/40"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{m.job_title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(m.interview_scheduled_at!).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {m.meeting_link && (
                      
                       <a href={m.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold px-4 py-2 rounded-full text-white flex-shrink-0"
                        style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
                      >
                        Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Trend chart ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Applications over time
              </p>
              <div className="flex bg-gray-50 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setView("weekly")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                    view === "weekly" ? "bg-white text-[#F2754A] shadow-sm" : "text-gray-400"
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setView("monthly")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                    view === "monthly" ? "bg-white text-[#F2754A] shadow-sm" : "text-gray-400"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #F3F4F6",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => (value === "auto" ? "Auto-applied" : "Manual")}
                />
                <Bar dataKey="manual" stackId="a" fill="#FFB347" radius={[0, 0, 0, 0]} />
                <Bar dataKey="auto" stackId="a" fill="#F2754A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Match quality + badges ── */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Average match score
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900">
                  {dashboard.avg_match_score}
                </span>
                <span className="text-sm text-gray-400 mb-1">/ 100</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Across all applications in the last 30 days
              </p>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Badges earned
              </p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-gray-900">{badges.length}</span>
                <span className="text-sm text-gray-400 mb-1">total</span>
              </div>

              
               <a href="/profile"
                className="inline-block mt-2 text-xs font-bold text-[#F2754A] hover:underline"
              >
                View on profile →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}