"use client";

import { useState } from "react";
import { MonthlyPoint } from "@/lib/adminDashboard";

export default function MonthlyLineChart({ title, data }: { title: string; data: MonthlyPoint[] }) {
  const [hovered, setHovered] = useState<{ x: number; y: number; month: string; count: number } | null>(null);

  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 600;
  const h = 140;

  const coords = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.count / max) * (h - 20);
    return { x, y, month: d.month, count: d.count };
  });

  const points = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm relative">
      <p className="text-sm font-medium text-gray-500 mb-3">{title}</p>

      {hovered && (
        <div
          className="absolute z-10 rounded-md bg-gray-900 px-2 py-1 text-xs text-white pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(hovered.x / w) * 100}%`,
            top: `${(hovered.y / h) * 100}%`,
          }}
        >
          {hovered.month}: {hovered.count}
        </div>
      )}

      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="text-indigo-500">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
        {coords.map((c) => (
          <circle
            key={c.month}
            cx={c.x}
            cy={c.y}
            r={9}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHovered(c)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {coords.map((c) => (
          <circle
            key={`dot-${c.month}`}
            cx={c.x}
            cy={c.y}
            r={hovered?.month === c.month ? 4.5 : 3}
            fill="currentColor"
            pointerEvents="none"
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {data.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </div>
  );
}