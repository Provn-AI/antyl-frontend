"use client";

import { CandidateMetrics } from "@/lib/adminDashboard";

export default function CandidateMetricsSection({ data }: { data: CandidateMetrics }) {
  const weeklyDelta = data.weekly_trend.this_week - data.weekly_trend.last_week;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-4">Candidates — platform-wide</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Applications today" value={data.applications_today} />
        <Stat label="Total applications" value={data.applications_total} />
        <Stat label="Shortlist rate" value={`${data.shortlist_rate}%`} />
        <Stat label="Interview rate" value={`${data.interview_rate}%`} />
        <Stat
          label="Interviews scheduled"
          value={data.interviews_scheduled}
          sub={data.next_interview_date ? `Next: ${data.next_interview_date.slice(0, 10)}` : undefined}
        />
        <Stat label="Offers received" value={data.offers_received} />
        <Stat label="Avg skill match" value={`${data.avg_skill_match_score}%`} />
        <Stat
          label="This week vs last"
          value={data.weekly_trend.this_week}
          sub={`${weeklyDelta >= 0 ? "+" : ""}${weeklyDelta} vs last week (${data.weekly_trend.last_week})`}
        />
      </div>

      <p className="text-xs font-medium text-gray-400 mb-2">Top matched roles</p>
      <div className="space-y-1">
        {data.top_matched_roles.map((r) => (
          <div key={r.role} className="flex justify-between text-sm">
            <span className="text-gray-700">{r.role}</span>
            <span className="text-gray-400">{r.count}</span>
          </div>
        ))}
        {data.top_matched_roles.length === 0 && (
          <p className="text-xs text-gray-400">No applications yet.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}