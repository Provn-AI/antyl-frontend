"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { exchangeGithubCode, connectGithub } from "@/services/github.service";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.13-.02-2.04-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.07.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

const steps = [
  "Verifying GitHub code",
  "Exchanging access token",
  "Linking your account",
];

export default function GithubCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stepIndex, setStepIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);

    const run = async () => {
      try {
        const code = searchParams.get("code");
        if (!code) throw new Error("No GitHub code received.");

        const exchangeResult = await exchangeGithubCode(code);
        setStepIndex(1);

        await connectGithub(exchangeResult.access_token);
        setStepIndex(2);

        setTimeout(() => {
          router.replace("/onboarding/github");
        }, 500);
      } catch (error) {
        console.error(error);
        clearInterval(stepTimer);
        setFailed(true);
        setErrorMessage(
          "We couldn't connect your GitHub account. Please try again."
        );
      }
    };

    void run();

    return () => clearInterval(stepTimer);
  }, [router, searchParams]);

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
            {/* Icon with orbiting ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full animate-spin"
                style={{ animationDuration: "1.4s" }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="#F3F0EA"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#callbackGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="70 200"
                />
                <defs>
                  <linearGradient
                    id="callbackGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#F2754A" />
                    <stop offset="100%" stopColor="#F8B36B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                  <GithubIcon className="w-6 h-6 text-gray-900" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connecting GitHub
            </h2>

            <p className="text-gray-400 text-sm mb-8">
              Hang tight, this only takes a second.
            </p>

            <div className="text-left space-y-3">
              {steps.map((step, i) => {
                const isDone = i < stepIndex;
                const isActive = i === stepIndex;

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isDone
                          ? "bg-[#F2754A]"
                          : isActive
                          ? "bg-[#F2754A] animate-pulse"
                          : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isDone || isActive
                          ? "text-gray-900 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
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
              Connection failed
            </h2>
            <p className="text-gray-400 mb-8 text-sm">{errorMessage}</p>

            <button
              type="button"
              onClick={() => router.replace("/onboarding/github")}
              className="w-full px-6 py-3.5 rounded-full font-semibold text-white"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              Back to GitHub setup
            </button>
          </>
        )}
      </div>
    </div>
  );
}