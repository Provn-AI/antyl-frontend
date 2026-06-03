"use client";

import { useEffect, useState } from "react";

interface ResumeParsingLoaderProps {
  onComplete: () => void;
  estimatedSeconds?: number;
}

const STEPS = [
  "Reading your resume...",
  "Extracting work experience...",
  "Identifying education details...",
  "Detecting skills and tech stack...",
  "Almost done...",
];

export default function ResumeParsingLoader({
  onComplete,
  estimatedSeconds = 15,
}: ResumeParsingLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + 100 / (estimatedSeconds * 10);
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) =>
        prev < STEPS.length - 1 ? prev + 1 : prev
      );
    }, (estimatedSeconds * 1000) / STEPS.length);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [estimatedSeconds, onComplete]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .parsing-wrap {
          position: fixed;
          inset: 0;
          background: #F8F5F0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          z-index: 999;
        }

        .parsing-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
          text-align: center;
        }

        .parsing-icon {
          width: 64px;
          height: 64px;
          background: #FFF0ED;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .parsing-icon svg {
          animation: pulse-icon 1.5s ease-in-out infinite;
        }

        @keyframes pulse-icon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.92); }
        }

        .parsing-title {
          font-size: 20px;
          font-weight: 700;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .parsing-step {
          font-size: 14px;
          color: #B0A89E;
          min-height: 20px;
          margin-bottom: 28px;
          transition: opacity 0.3s;
        }

        .progress-track {
          background: #F0EBE3;
          border-radius: 50px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 50px;
          background: linear-gradient(90deg, #FF6B4D, #FFB347);
          transition: width 0.1s linear;
        }

        .progress-pct {
          font-size: 13px;
          color: #B0A89E;
          font-weight: 600;
        }

        .parsing-note {
          font-size: 12px;
          color: #D0C8C0;
          margin-top: 24px;
        }
      `}</style>

      <div className="parsing-wrap">
        <div className="parsing-card">
          <div className="parsing-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#FF6B4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>

          <h2 className="parsing-title">Analysing your resume</h2>
          <p className="parsing-step">{STEPS[stepIndex]}</p>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="progress-pct">{Math.min(Math.round(progress), 100)}%</p>

          <p className="parsing-note">
            Usually takes about {estimatedSeconds} seconds
          </p>
        </div>
      </div>
    </>
  );
}