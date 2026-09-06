"use client";

import { MonthlyPoint } from "@/lib/adminDashboard";

export default function MonthlyLineChart({ title, data }: { title: string; data: MonthlyPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 600;
  const h = 140;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (d.count / max) * (h - 20);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-3">{title}</p>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="text-indigo-500">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {data.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </div>
  );
}