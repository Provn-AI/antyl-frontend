"use client";

import { useState } from "react";
import { CalendarDays, Link2, X } from "lucide-react";

interface Props {
  candidateName: string;
  /**
   * Pass these when the interview has already been scheduled and you want
   * the modal to open in "edit" mode with the fields pre-filled.
   * `initialScheduledAt` should be an ISO string (e.g. what you previously
   * passed to onConfirm).
   */
  initialScheduledAt?: string;
  initialMeetingLink?: string;
  onConfirm: (scheduledAt: string, meetingLink: string) => Promise<void>;
  onCancel: () => void;
}

function splitIsoIntoDateAndTime(iso?: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };

  // Build local-time date/time strings (yyyy-mm-dd / HH:mm) so the native
  // <input type="date"/"time"> pickers show the value the user originally
  // picked, rather than shifting it via toISOString()'s UTC conversion.
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

export default function InterviewScheduleModal({
  candidateName,
  initialScheduledAt,
  initialMeetingLink = "",
  onConfirm,
  onCancel,
}: Props) {
  const isEditing = Boolean(initialScheduledAt);
  const initial = splitIsoIntoDateAndTime(initialScheduledAt);

  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [meetingLink, setMeetingLink] = useState(initialMeetingLink);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Track whether anything has actually changed so "Update" can be a no-op
  // guard against accidental submits with no edits, in edit mode only.
  const hasChanges =
    !isEditing ||
    date !== initial.date ||
    time !== initial.time ||
    meetingLink.trim() !== (initialMeetingLink || "").trim();

  const handleConfirm = async () => {
    if (!date || !time) {
      setError("Please pick both a date and time.");
      return;
    }
    if (meetingLink && !/^https?:\/\//i.test(meetingLink.trim())) {
      setError("Meeting link should start with http:// or https://");
      return;
    }
    if (isEditing && !hasChanges) {
      setError("Change the date, time, or link before updating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const iso = new Date(`${date}T${time}`).toISOString();
      await onConfirm(iso, meetingLink.trim());
    } catch (err) {
      console.error(err);
      setError(
        isEditing
          ? "Couldn't update the interview. Please try again."
          : "Couldn't schedule the interview. Please try again."
      );
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
              {isEditing ? "Edit Interview" : "Schedule Interview"}
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
          {isEditing ? (
            <>
              Update the interview time with{" "}
              <strong className="text-gray-700">{candidateName}</strong>
            </>
          ) : (
            <>
              When is the interview with{" "}
              <strong className="text-gray-700">{candidateName}</strong>?
            </>
          )}
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
          <div>
            <label
              htmlFor="interview-link"
              className="block text-xs font-semibold text-gray-500 mb-1.5"
            >
              Meeting link <span className="text-gray-300 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="interview-link"
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm text-gray-900 font-semibold outline-none focus:border-[#F2754A] focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
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
            {submitting
              ? isEditing
                ? "Updating…"
                : "Scheduling…"
              : isEditing
              ? "Update"
              : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}