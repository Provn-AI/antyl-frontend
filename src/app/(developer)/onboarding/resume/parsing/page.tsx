"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { getResumeStatus } from "@/services/resume.service";

const stages = [
  "Uploading resume",
  "Extracting work history",
  "Extracting education",
  "Analyzing skills",
  "Preparing your profile",
];

export default function ResumeParsingPage() {
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 2));
    }, 400);

    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 3000);

    const pollInterval = setInterval(async () => {
      try {
        const status = await getResumeStatus();

        if (status.status === "completed") {
          setProgress(100);
          setStageIndex(stages.length - 1);

          clearInterval(progressInterval);
          clearInterval(stageInterval);
          clearInterval(pollInterval);

          router.push("/onboarding/resume/review");
        }

        if (status.status === "failed") {
          clearInterval(progressInterval);
          clearInterval(stageInterval);
          clearInterval(pollInterval);

          setFailed(true);
        }
      } catch (error) {
        console.error(error);
      }
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(pollInterval);
    };
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-sm p-10 text-center">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        {!failed ? (
          <>
            {/* Progress ring */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#F3F0EA"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F2754A" />
                    <stop offset="100%" stopColor="#F8B36B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">
                  {progress}%
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Parsing your resume
            </h2>
            <p className="text-gray-400 mb-8 text-sm">
              This usually takes less than a minute.
            </p>

            {/* Stage checklist */}
            <div className="text-left space-y-3">
              {stages.map((stage, i) => {
                const isDone = i < stageIndex;
                const isActive = i === stageIndex;

                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone
                          ? "bg-[#F2754A]"
                          : isActive
                          ? "bg-orange-50"
                          : "bg-gray-100"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : isActive ? (
                        <Loader2 className="w-3.5 h-3.5 text-[#F2754A] animate-spin" />
                      ) : null}
                    </div>
                    <span
                      className={`text-sm ${
                        isDone || isActive
                          ? "text-gray-900 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              We could not parse your resume
            </h2>
            <p className="text-gray-400 mb-8 text-sm">
              Something went wrong while reading your file. Try uploading it
              again, or use a different file format.
            </p>

            <button
              type="button"
              onClick={() => router.push("/onboarding/resume")}
              className="w-full px-6 py-3.5 rounded-full font-semibold text-white"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}