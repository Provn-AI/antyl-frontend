"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lock, Plus, Trash2 } from "lucide-react";
import {
  getWeekStatus,
  postWeeklyQuestion,
} from "@/services/weeklyQuestion.service";

type Audience = "developer" | "recruiter";

interface WeeklyQuestionUser {
  email?: string;
  name?: string;
}

interface WeeklyQuestion {
  id: string;
  audience: Audience;
  week_start: string;
  question_text: string;
  options: string[];
  created_by: string;
  created_at: string;
  users?: WeeklyQuestionUser;
}

interface WeekStatus {
  posted: boolean;
  question: WeeklyQuestion | null;
}

interface PostQuestionResult extends Partial<WeeklyQuestion> {
  detail?: string;
}

function AudiencePanel({ audience }: { audience: Audience }) {
  const [status, setStatus] = useState<WeekStatus | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeekStatus(audience)
      .then((res: WeekStatus) => setStatus(res))
      .finally(() => setLoading(false));
  }, [audience]);

  const updateOption = (i: number, value: string) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  };

  const addOption = () => {
    if (options.length < 6) setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setError("");
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (questionText.trim().length < 5) {
      setError("Question needs to be a bit more descriptive.");
      return;
    }
    if (cleanOptions.length < 2) {
      setError("Add at least 2 options.");
      return;
    }
    setSubmitting(true);
    try {
      const result: PostQuestionResult = await postWeeklyQuestion(
        audience,
        questionText.trim(),
        cleanOptions
      );
      if (result.detail) {
        setError(result.detail);
      } else {
        setStatus({ posted: true, question: result as WeeklyQuestion });
      }
    } catch {
      setError("Something went wrong posting the question.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 py-16 text-center">
        <div
          className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin mx-auto"
          style={{ borderTopColor: "#F2754A" }}
        />
      </div>
    );
  }

  if (status?.posted && status.question) {
    const q = status.question;
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-gray-900">
            This week {audience} question is locked in
          </p>
        </div>
        <p className="text-sm text-gray-700 font-semibold mb-3">{q.question_text}</p>
        <div className="flex flex-col gap-1.5">
          {(q.options || []).map((opt: string) => (
            <span
              key={opt}
              className="px-3 py-2 rounded-xl bg-gray-50 text-xs text-gray-500 font-medium"
            >
              {opt}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Posted by {q.users?.email ?? q.users?.name ?? "another admin"} - locked for this week
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 p-6">
      <p className="text-sm font-bold text-gray-900 mb-4 capitalize">
        {audience} question
      </p>

      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder={`What do you want to ask ${audience}s this week?`}
        rows={2}
        className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm text-gray-700 outline-none focus:border-[#F2754A] resize-none mb-3"
      />

      <div className="flex flex-col gap-2 mb-3">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-100 text-sm text-gray-700 outline-none focus:border-[#F2754A]"
            />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(i)}>
                <Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 6 && (
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 text-xs font-bold text-[#F2754A] mb-4"
        >
          <Plus className="w-3.5 h-3.5" />
          Add option
        </button>
      )}

      {error && <p className="text-xs text-red-500 font-semibold mb-3">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Post this week's question"}
      </button>
    </div>
  );
}

export default function AdminWeeklyQuestionPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-bold text-gray-900 mb-1"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          Weekly Question Admin
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          First admin to post for the week locks it in - no take-backs.
        </p>

        <div className="flex flex-col gap-5">
          <AudiencePanel audience="developer" />
          <AudiencePanel audience="recruiter" />
        </div>
      </div>
    </div>
  );
}