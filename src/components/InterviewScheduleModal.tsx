"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";

interface Props {
  candidateName: string;
  onConfirm: (scheduledAt: string) => Promise<void>;
  onCancel: () => void;
}

export default function InterviewScheduleModal({
  candidateName,
  onConfirm,
  onCancel,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!date || !time) {
      setError("Please pick both a date and time.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const iso = new Date(`${date}T${time}`).toISOString();
      await onConfirm(iso);
    } catch (err) {
      console.error(err);
      setError("Couldn't schedule the interview. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-[24px] shadow-lg p-6 sm:p-8 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#F2754A]" />
            <h2 className="font-bold text-gray-900 text-lg">
              Schedule Interview
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-300 hover:text-gray-500"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          When is the interview with <strong className="text-gray-700">{candidateName}</strong>?
        </p>

        {/*
          BUG-FIX: native <input type="date"/"time"> text picks up the
          browser's default form-control color, which reads as a very
          light gray and is hard to see against the white card. Explicit
          text-gray-900 + font-semibold darkens the entered value, and
          `colorScheme: "light"` stops some browsers (Chrome on dark-mode
          OS) from swapping in a low-contrast dark-theme date/time widget.
          Labels above each field were also missing, so it wasn't obvious
          at a glance which control was which.
        */}
        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="interview-date"
              className="block text-xs font-semibold text-gray-500 mb-1.5"
            >
              Date
            </label>
            <input
              id="interview-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: "light" }}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-gray-900 font-semibold outline-none focus:border-[#F2754A] focus:ring-2 focus:ring-orange-100 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="interview-time"
              className="block text-xs font-semibold text-gray-500 mb-1.5"
            >
              Time
            </label>
            <input
              id="interview-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ colorScheme: "light" }}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-gray-900 font-semibold outline-none focus:border-[#F2754A] focus:ring-2 focus:ring-orange-100 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-3">{error}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-full font-semibold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-full font-semibold text-sm text-white disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
            }}
          >
            {submitting ? "Scheduling…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}