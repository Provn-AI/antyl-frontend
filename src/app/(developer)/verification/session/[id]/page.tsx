"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";

import {
  getVerificationSession,
  saveAnswer,
  completeVerification,
} from "@/services/verification.service";

interface Question {
  question_text: string;
  question_type: string;
  expected_answer_criteria: string;
  difficulty_level: string;
}

interface SessionData {
  id: string;
  questions: Question[];
  answers: string[];
  time_remaining: number;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: "Easy",   color: "text-emerald-600", bg: "bg-emerald-50" },
  medium: { label: "Medium", color: "text-amber-600",   bg: "bg-amber-50"   },
  hard:   { label: "Hard",   color: "text-rose-600",    bg: "bg-rose-50"    },
};

export default function VerificationSessionPage() {
  const params   = useParams();
  const router   = useRouter();
  const sessionId = params.id as string;

  const [loading,          setLoading]          = useState(true);
  const [submitting,       setSubmitting]        = useState(false);
  const [session,          setSession]           = useState<SessionData | null>(null);
  const [currentQuestion,  setCurrentQuestion]   = useState(0);
  const [answers,          setAnswers]           = useState<string[]>([]);
  const [timeRemaining,    setTimeRemaining]     = useState(1800);
  const [answerTimes,      setAnswerTimes]       = useState<number[]>([]);
  const [autoSaveFlash,    setAutoSaveFlash]     = useState(false);

  const questionStartTimeRef  = useRef(0);
  const hasAutoSubmittedRef   = useRef(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { questionStartTimeRef.current = Date.now(); }, []);

  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      try {
        const data = await getVerificationSession(sessionId);
        if (mounted) {
          setSession(data);
          setAnswers(data.answers || []);
          setTimeRemaining(data.time_remaining || 1800);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (sessionId) loadSession();
    return () => { mounted = false; };
  }, [sessionId]);

  // Focus textarea whenever question changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const finalTimes = [...answerTimes];
      finalTimes[currentQuestion] = Math.floor(
        (Date.now() - questionStartTimeRef.current) / 1000
      );
      for (let i = 0; i < answers.length; i++) {
        if (answers[i]?.trim()) {
          await saveAnswer(sessionId, i, answers[i], finalTimes[i] || 0);
        }
      }
      await completeVerification(sessionId);
      router.push("/verification/result");
    } catch (error) {
      console.error(error);
      alert("Failed to submit verification.");
    } finally {
      setSubmitting(false);
    }
  }, [answers, answerTimes, currentQuestion, sessionId, submitting, router]);

  // Countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => setTimeRemaining((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeRemaining !== 0 || hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    const t = setTimeout(() => void handleSubmit(), 0);
    return () => clearTimeout(t);
  }, [timeRemaining, handleSubmit]);

  // Auto-save every 10s
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      const answer = answers[currentQuestion];
      if (!answer?.trim()) return;
      saveAnswer(
        sessionId,
        currentQuestion,
        answer,
        Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
      )
        .then(() => {
          setAutoSaveFlash(true);
          setTimeout(() => setAutoSaveFlash(false), 2000);
        })
        .catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [answers, currentQuestion, sessionId]);

  const goToNext = () => {
    const elapsed = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    setAnswerTimes((prev) => {
      const copy = [...prev];
      copy[currentQuestion] = elapsed;
      return copy;
    });
    questionStartTimeRef.current = Date.now();
    setCurrentQuestion((p) => p + 1);
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading session…</p>
        </div>
      </div>
    );
  }

  if (!session || !session.questions?.length) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <p className="text-gray-400 font-medium">Session not found.</p>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const question       = session.questions[currentQuestion];
  const currentAnswer  = answers[currentQuestion] || "";
  const totalQuestions = session.questions.length;
  const isLast         = currentQuestion === totalQuestions - 1;
  const isTimeDanger   = timeRemaining < 100;
  const minutes        = Math.floor(timeRemaining / 60);
  const seconds        = timeRemaining % 60;
  const formattedTime  = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const difficulty     = DIFFICULTY_CONFIG[question.difficulty_level?.toLowerCase()] ?? DIFFICULTY_CONFIG.medium;
  const answeredCount  = answers.filter((a) => a?.trim()).length;

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-8">
      <div className="w-full max-w-3xl mx-auto">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
          >
            Antyl
          </h1>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border transition-colors ${
              isTimeDanger
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-orange-50 border-orange-100 text-[#F2754A]"
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeDanger ? "animate-pulse" : ""}`} />
            {formattedTime}
          </div>
        </div>

        {/* ── Progress bar + meta ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>

          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                background: "linear-gradient(90deg, #F2754A, #FFB347)",
              }}
            />
          </div>

          {/* Question dot nav */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {session.questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentQuestion(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  i === currentQuestion
                    ? "bg-[#F2754A] text-white scale-110"
                    : answers[i]?.trim()
                    ? "bg-orange-100 text-[#F2754A]"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* ── Question card ── */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${difficulty.bg} ${difficulty.color}`}
            >
              {difficulty.label}
            </span>
            {question.question_type && (
              <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-50 text-gray-400">
                {question.question_type.replace(/_/g, " ")}
              </span>
            )}
          </div>

          <p className="text-gray-900 font-semibold text-lg leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {/* ── Answer textarea ── */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden mb-4">
          <textarea
            ref={textareaRef}
            maxLength={1000}
            value={currentAnswer}
            onChange={(e) => {
              const copy = [...answers];
              copy[currentQuestion] = e.target.value;
              setAnswers(copy);
            }}
            placeholder="Write your answer here…"
            className="w-full min-h-[220px] px-6 pt-5 pb-3 text-sm text-gray-800 placeholder:text-gray-300 resize-none outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between px-6 pb-4">
            <span
              className={`text-xs font-semibold transition-colors ${
                autoSaveFlash ? "text-emerald-500" : "text-gray-300"
              }`}
            >
              {autoSaveFlash ? "✓ Auto-saved" : "Auto-saves every 30s"}
            </span>
            <span
              className={`text-xs font-semibold ${
                currentAnswer.length > 900 ? "text-amber-500" : "text-gray-300"
              }`}
            >
              {1000 - currentAnswer.length} chars left
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((p) => p - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-gray-500 bg-white border border-gray-100 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-100"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting…" : "Submit verification"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNext}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {isTimeDanger && (
          <p className="text-center text-xs font-semibold text-red-500 mt-5 animate-pulse">
            ⚠ Less than 5 minutes remaining — your answers will auto-submit when time runs out.
          </p>
        )}
      </div>
    </div>
  );
}