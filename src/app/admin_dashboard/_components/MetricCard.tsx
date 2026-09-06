"use client";

import { useState } from "react";
import { RecruiterFunnel } from "@/lib/adminDashboard";

interface MetricCardProps {
  label: string;
  today: number;
  total: number;
  trend: { date: string; count: number }[];
  funnel?: RecruiterFunnel;
}

export default function MetricCard({ label, today, total, trend, funnel }: MetricCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const max = Math.max(...trend.map((t) => t.count), 1);

  const buildCoords = (w: number, h: number) =>
    trend.map((t, i) => {
      const x = (i / (trend.length - 1)) * w;
      const y = h - (t.count / max) * (h - 4);
      return { x, y, date: t.date, count: t.count };
    });

  const smallCoords = buildCoords(100, 40);
  const bigCoords = buildCoords(300, 110);
  const bigW = 300;
  const bigH = 120;

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold text-gray-900">{total.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">+{today} today</p>
        </div>
        {!expanded && (
          <svg width="100" height="40" viewBox="0 0 100 40" className="text-indigo-500">
            <polyline
              points={smallCoords.map((c) => `${c.x},${c.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4 relative" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-medium text-gray-400 mb-2">Last 7 days</p>

          {hovered && (
            <div
              className="absolute z-10 rounded-md bg-gray-900 px-2 py-1 text-xs text-white pointer-events-none -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hovered.x / bigW) * 100}%`,
                top: `${(hovered.y / bigH) * 100 * (120 / bigH) + 20}%`,
              }}
            >
              {hovered.date}: {hovered.count}
            </div>
          )}

          <svg width="100%" height="120" viewBox="0 0 300 120" className="text-indigo-500 mb-3">
            <polyline
              points={bigCoords.map((c) => `${c.x},${c.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            {bigCoords.map((c) => (
              <circle
                key={c.date}
                cx={c.x}
                cy={c.y}
                r={9}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
            {bigCoords.map((c) => (
              <circle
                key={`dot-${c.date}`}
                cx={c.x}
                cy={c.y}
                r={hovered?.date === c.date ? 4.5 : 3}
                fill="currentColor"
                pointerEvents="none"
              />
            ))}
          </svg>
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            {trend.map((t) => (
              <span key={t.date}>{t.date.slice(5)}</span>
            ))}
          </div>

          {funnel && (
            <div className="grid grid-cols-2 gap-3">
              <FunnelStat label="Applications" value={funnel.total_applications} />
              <FunnelStat label="Shortlisted" value={funnel.shortlisted} sub={`${funnel.shortlist_rate}%`} />
              <FunnelStat label="Interviews" value={funnel.interviews} sub={`${funnel.interview_rate}% of shortlisted`} />
              <FunnelStat label="Hired" value={funnel.hired} sub={`${funnel.hire_rate}% of interviews`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FunnelStat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}