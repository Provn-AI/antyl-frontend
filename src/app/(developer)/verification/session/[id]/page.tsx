"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import { useParams, useRouter } from "next/navigation";

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

export default function VerificationSessionPage() {
  const params = useParams();
  const router = useRouter();

  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800);

  const hasAutoSubmittedRef = useRef(false);

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
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      loadSession();
    }

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // FIX 1: Removed the double {{ and moved the dependency array outside the function body
  const handleSubmit = useCallback(async () => {
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      for (let i = 0; i < answers.length; i++) {
        if (answers[i]?.trim()) {
          await saveAnswer(sessionId, i, answers[i]);
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
  }, [answers, sessionId, submitting, router]); // FIX 2: dependency array is now the second arg to useCallback

  useEffect(() => {
    if (timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  useEffect(() => {
    if (timeRemaining !== 0 || hasAutoSubmittedRef.current) {
      return;
    }

    hasAutoSubmittedRef.current = true;

    const timer = setTimeout(() => {
      void handleSubmit();
    }, 0);

    return () => clearTimeout(timer);
  }, [timeRemaining, handleSubmit]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const interval = setInterval(() => {
      const answer = answers[currentQuestion];

      if (!answer || !answer.trim()) {
        return;
      }

      saveAnswer(sessionId, currentQuestion, answer).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [answers, currentQuestion, sessionId]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!session || !session.questions?.length) {
    return <div className="p-8">Session not found</div>;
  }

  const question = session.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion] || "";
  const progress = ((currentQuestion + 1) / session.questions.length) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime =
    `${minutes}`.padStart(2, "0") + ":" + `${seconds}`.padStart(2, "0");

  return (
    <>
      <style>{`
        .page {
          min-height:100vh;
          background:#FAF8F5;
          padding:32px;
        }

        .container {
          max-width:900px;
          margin:0 auto;
        }

        .header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:24px;
        }

        .title {
          font-size:28px;
          font-weight:700;
          font-family:'DM Sans',sans-serif;
        }

        .timer {
          font-size:22px;
          font-weight:700;
          color:#FF6B4D;
          font-family:'DM Sans',sans-serif;
        }

        .timer-danger {
          color:#DC2626;
        }

        .progress-bg {
          height:12px;
          border-radius:999px;
          background:#E8E4DF;
          overflow:hidden;
          margin-bottom:24px;
        }

        .progress-fill {
          height:100%;
          background:linear-gradient(90deg, #FF6B4D, #FFB347);
          transition:width .3s ease;
        }

        .counter {
          margin-bottom:20px;
          color:#B0A89E;
          font-weight:600;
          font-family:'DM Sans',sans-serif;
        }

        .question-card {
          background:white;
          border:1.5px solid #E8E4DF;
          border-radius:20px;
          padding:24px;
          margin-bottom:20px;
        }

        .question {
          font-size:18px;
          font-weight:600;
          color:#1A1A1A;
          line-height:1.6;
          font-family:'DM Sans',sans-serif;
        }

        .textarea {
          width:100%;
          min-height:260px;
          border:1.5px solid #E8E4DF;
          border-radius:18px;
          padding:18px;
          resize:none;
          font-family:'DM Sans',sans-serif;
          outline:none;
        }

        .textarea:focus {
          border-color:#FF6B4D;
        }

        .char-count {
          text-align:right;
          margin-top:8px;
          color:#B0A89E;
          font-size:13px;
        }

        .actions {
          display:flex;
          justify-content:space-between;
          margin-top:24px;
        }

        .btn {
          padding:12px 24px;
          border-radius:999px;
          border:none;
          cursor:pointer;
          font-weight:700;
        }

        .btn-secondary {
          background:#EFEAE4;
        }

        .btn-primary {
          color:white;
          background:linear-gradient(90deg, #FF6B4D, #FFB347);
        }

        .btn:disabled {
          opacity:.4;
          cursor:not-allowed;
        }
      `}</style>

      <div className="page">
        <div className="container">
          <div className="header">
            <div className="title">Verification Session</div>

            <div className={`timer ${timeRemaining < 300 ? "timer-danger" : ""}`}>
              {formattedTime}
            </div>
          </div>

          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="counter">
            Question {currentQuestion + 1} {" / "} {session.questions.length}
          </div>

          <div className="question-card">
            <div className="question">{question.question_text}</div>
          </div>

          <textarea
            className="textarea"
            maxLength={1000}
            value={currentAnswer}
            onChange={(e) => {
              const copy = [...answers];
              copy[currentQuestion] = e.target.value;
              setAnswers(copy);
            }}
            placeholder="Write your answer here..."
          />

          <div className="char-count">
            {1000 - currentAnswer.length} characters remaining
          </div>

          <div className="actions">
            <button
              className="btn btn-secondary"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
            >
              Previous
            </button>

            {currentQuestion === session.questions.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Verification"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}