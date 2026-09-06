"use client";

import { CompanyCount } from "@/lib/adminDashboard";

export default function CompanyBarChart({ data }: { data: CompanyCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-4">Jobs per company</p>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.company} className="flex items-center gap-3">
            <span className="w-32 truncate text-xs text-gray-600">{d.company}</span>
            <div className="flex-1 h-4 rounded bg-gray-100">
              <div
                className="h-4 rounded bg-indigo-500"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-gray-500">{d.count}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-gray-400">No jobs posted yet.</p>}
      </div>
    </div>
  );
}