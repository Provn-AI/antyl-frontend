"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

import {
  startVerification,
  getVerificationCooldown,
} from "@/services/verification.service";

const WHAT_TO_EXPECT = [
  { text: "Questions based on your own repositories" },
  { text: "Architecture decisions & trade-offs" },
  { text: "Implementation details & code choices" },
  { text: "Debugging scenarios & edge cases" },
];

const HEADS_UP = "This session cannot be paused once started. Set aside 5 uninterrupted minutes.";

interface Cooldown {
  days: number;
  hours: number;
}

export default function VerificationIntroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingCooldown, setCheckingCooldown] = useState(true);
  const [cooldown, setCooldown] = useState<Cooldown | null>(null);

  useEffect(() => {
    async function loadCooldown() {
      try {
        const data = await getVerificationCooldown();
        setCooldown(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingCooldown(false);
      }
    }
    loadCooldown();
  }, []);

  const isLocked = !!cooldown && (cooldown.days > 0 || cooldown.hours > 0);

  const handleStartVerification = async () => {
    try {
      setLoading(true);
      const data = await startVerification();
      localStorage.setItem("verification_session_id", data.session_id);
      router.push("/verification/loading");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to start verification.";
      if (message.toLowerCase().includes("cooldown")) {
        // Backend is the source of truth — resync in case local state was
        // stale (e.g. tab left open across the 7-day reset boundary)
        const fresh = await getVerificationCooldown().catch(() => null);
        if (fresh) setCooldown(fresh);
      } else {
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingCooldown) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">

        {/* Logo */}
        <h1
          className="text-2xl font-bold mb-10"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        {isLocked ? (
          <>
            {/* ── Locked state ── */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verification is on cooldown
            </h2>
            <p className="text-gray-400 mb-8">
              You can re-verify once your cooldown ends. Your current Antyl
              Score stays live on your profile until then.
            </p>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Next verification</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Available in{" "}
                      <span className="font-bold text-gray-600">
                        {cooldown!.days}d {cooldown!.hours}h
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-300 bg-gray-50 px-3 py-1.5 rounded-full">
                  Locked
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
            >
              Back to profile
            </button>
          </>
        ) : (
          <>
            {/* ── Normal start flow ── */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Skill verification
            </h2>
            <p className="text-gray-400 mb-8">
              We will ask you questions drawn directly from your repositories —
              no generic leetcode, just your real work.
            </p>

            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2 mb-6">
              <Clock className="w-4 h-4 text-[#F2754A]" />
              <span className="text-sm font-semibold text-[#F2754A]">
                ~5 minutes to complete
              </span>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                What to expect
              </p>
              <div className="space-y-3">
                {WHAT_TO_EXPECT.map(({ text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#F2754A] flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-[20px] px-5 py-4 mb-8">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-700">{HEADS_UP}</p>
            </div>

            <button
              type="button"
              onClick={handleStartVerification}
              disabled={loading}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-100"
            >
              {loading ? "Generating questions…" : "Start verification"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Results are added to your Antyl profile within minutes of completion.
            </p>
          </>
        )}
      </div>
    </div>
  );
}