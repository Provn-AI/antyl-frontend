"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MESSAGES = [
  "Analysing your repositories…",
  "Understanding architecture decisions…",
  "Generating verification questions…",
  "Preparing your session…",
];

export default function VerificationLoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const sessionId = localStorage.getItem("verification_session_id");
    if (!sessionId) {
      router.replace("/verification");
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 250);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 3000);

    const redirectTimer = setTimeout(() => {
      router.push(`/verification/session/${sessionId}`);
    }, 12000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">

        

        {/* Animated orb */}
        <div className="flex justify-center mb-10">
          <div className="relative w-20 h-20">
            {/* Outer pulse rings */}
            <span className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-40" />
            <span className="absolute inset-2 rounded-full bg-orange-100 animate-ping opacity-30 [animation-delay:300ms]" />
            {/* Core */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center shadow-lg shadow-orange-200">
              <svg
                className="w-8 h-8 text-white animate-spin [animation-duration:3s]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </span>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Preparing your session
        </h2>

        {/* Animated message */}
        <p
          key={messageIndex}
          className="text-gray-400 text-center mb-10 transition-all duration-500 animate-pulse"
        >
          {MESSAGES[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Progress
            </span>
            <span className="text-sm font-bold text-[#F2754A]">
              {progress}%
            </span>
          </div>

          {/* Track */}
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #F2754A, #FFB347)",
              }}
            />
          </div>

          {/* Step dots */}
          <div className="flex justify-between mt-5">
            {MESSAGES.map((msg, i) => (
              <div key={msg} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    i <= messageIndex ? "bg-[#F2754A]" : "bg-gray-200"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold text-center leading-tight transition-colors duration-500 hidden sm:block ${
                    i <= messageIndex ? "text-[#F2754A]" : "text-gray-300"
                  }`}
                >
                  {msg.replace("…", "")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          This usually takes about 30 seconds. Please do not close this tab.
        </p>
      </div>
    </div>
  );
}