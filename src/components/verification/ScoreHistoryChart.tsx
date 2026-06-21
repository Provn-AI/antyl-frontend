"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface HistoryItem {
  score: number;
  date: string;
}

interface Props {
  data: HistoryItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const score = payload[0].value;
  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#F2754A" :
    score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 text-left">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black" style={{ color }}>
        {score}
        <span className="text-sm font-semibold text-gray-400 ml-1">/ 100</span>
      </p>
    </div>
  );
}

export default function ScoreHistoryChart({ data }: Props) {
  const formatted = data.map((item) => ({
    score: item.score,
    date: new Date(item.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
  }));

  const scores = formatted.map((d) => d.score);
  const latest = scores[scores.length - 1] ?? 0;
  const earliest = scores[0] ?? 0;
  const delta = latest - earliest;
  const peak = Math.max(...scores);

  const deltaColor = delta >= 0 ? "text-emerald-600" : "text-red-500";
  const deltaLabel = delta >= 0 ? "+" + delta : String(delta);

  return (
    <div>
      {/* Mini stat row */}
      <div className="flex items-center gap-6 mb-6">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
            Latest
          </p>
          <p className="text-2xl font-black text-gray-900">{latest}</p>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
            Peak
          </p>
          <p className="text-2xl font-black text-gray-900">{peak}</p>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
            Change
          </p>
          <p className={"text-2xl font-black " + deltaColor}>{deltaLabel}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formatted}
            margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F2754A" />
                <stop offset="100%" stopColor="#FFB347" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />

            <ReferenceLine
              y={70}
              stroke="#F2754A"
              strokeDasharray="4 4"
              strokeOpacity={0.3}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#F2754A",
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.4,
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#F2754A", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#F2754A", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-gray-300 font-semibold text-center mt-3">
        Dashed line at 70 — target threshold
      </p>
    </div>
  );
}