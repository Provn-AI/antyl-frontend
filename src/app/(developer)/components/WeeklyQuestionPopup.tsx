"use client";

import { useEffect, useState } from "react";
import { X, MessageSquareText } from "lucide-react";
import {
  getActiveQuestion,
  answerQuestion,
  dismissQuestion,
} from "@/services/weeklyQuestion.service";

interface WeeklyQuestion {
  id: string;
  question_text: string;
  options: string[];
}

export default function WeeklyQuestionPopup() {
  const [question, setQuestion] = useState<WeeklyQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [showOther, setShowOther] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissedLocally, setDismissedLocally] = useState(false);

  useEffect(() => {
    getActiveQuestion()
      .then((q) => setQuestion(q))
      .catch(() => {});
  }, []);

  if (!question || dismissedLocally) return null;

  const handleDismiss = async () => {
    setDismissedLocally(true); // hide immediately, don't block on network
    try {
      await dismissQuestion(question.id);
    } catch {
      // fine — it'll just show again tomorrow, no harm done
    }
  };

  const handleSubmit = async () => {
    if (!selected && !otherText.trim()) return;
    setSubmitting(true);
    try {
      await answerQuestion(
        question.id,
        showOther ? null : selected,
        showOther ? otherText.trim() : null
      );
      setDismissedLocally(true);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl p-7">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: "linear-gradient(135deg, #F2754A, #F8B36B)",
          }}
        >
          <MessageSquareText className="w-5 h-5 text-white" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Question of the week
        </h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          {question.question_text}
        </p>

        {!showOther ? (
          <div className="flex flex-col gap-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected(opt)}
                className={`text-left px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-colors ${
                  selected === opt
                    ? "border-[#F2754A] bg-orange-50 text-[#F2754A]"
                    : "border-gray-100 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowOther(true)}
              className="text-left px-4 py-2.5 rounded-2xl text-sm font-semibold border border-dashed border-gray-200 text-gray-400 hover:bg-gray-50"
            >
              Something else…
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Tell us what you think..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-sm text-gray-700 outline-none focus:border-[#F2754A] resize-none"
            />
            <button
              type="button"
              onClick={() => {
                setShowOther(false);
                setOtherText("");
              }}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600 self-start"
            >
              ← Pick from options instead
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (!selected && !otherText.trim())}
          className="mt-6 w-full py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit answer"}
        </button>
      </div>
    </div>
  );
}