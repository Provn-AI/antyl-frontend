"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const IST_OFFSET_MINUTES = 330; // UTC+5:30

function getNextMondayIST(): Date {
  // Shift the real absolute time forward by the IST offset, then read it
  // back using UTC getters/setters. This gives IST wall-clock fields
  // without ever depending on the browser's own system timezone.
  const now = new Date();
  const istMs = now.getTime() + IST_OFFSET_MINUTES * 60000;
  const istDate = new Date(istMs);

  const day = istDate.getUTCDay(); // 0 = Sun ... 6 = Sat, in IST wall-clock terms
  const daysUntilMonday = (8 - day) % 7 || 7;

  const nextMondayIST = new Date(istDate);
  nextMondayIST.setUTCDate(istDate.getUTCDate() + daysUntilMonday);
  nextMondayIST.setUTCHours(0, 0, 0, 0);

  // Convert the IST-wall-clock-as-UTC value back to a real absolute instant.
  return new Date(nextMondayIST.getTime() - IST_OFFSET_MINUTES * 60000);
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "resetting…";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function WeekTimer() {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const target = getNextMondayIST();
      setRemaining(formatRemaining(target.getTime() - Date.now()));
    }
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1.5 flex-shrink-0">
      <Clock className="w-3.5 h-3.5 text-[#F2754A]" />
      Resets in {remaining}
    </div>
  );
}