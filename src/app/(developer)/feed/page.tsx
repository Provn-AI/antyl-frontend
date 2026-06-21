"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Heart, X, Rocket, CheckCircle2 } from "lucide-react";

import JobCard from "@/components/jobs/JobCard";
import DeveloperNavbar from "../components/DeveloperNavbar";
import { swipeJob } from "@/services/swipe.service";
import { getJobFeed } from "@/services/job.service";

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
  is_remote: boolean;
  salary_min: number;
  salary_max: number;
  required_tech_stack: string[];
  similarity_score: number;
}

type ToastState = "applied" | "skipped" | null;

function SwipeCard({
  job,
  onSwipe,
}: {
  job: Job;
  onSwipe: (direction: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const applyOpacity = useTransform(x, [0, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, 0], [1, 0]);

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      whileDrag={{ scale: 1.03 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("right");
        else if (info.offset.x < -120) onSwipe("left");
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full cursor-grab active:cursor-grabbing"
    >
      <motion.div
        style={{ opacity: applyOpacity }}
        className="absolute top-6 left-6 z-10 rotate-[-12deg] border-3 border-green-500 text-green-500 font-extrabold text-2xl px-4 py-1 rounded-xl pointer-events-none"
      >
        APPLY
      </motion.div>

      <motion.div
        style={{ opacity: skipOpacity }}
        className="absolute top-6 right-6 z-10 rotate-[12deg] border-3 border-red-500 text-red-500 font-extrabold text-2xl px-4 py-1 rounded-xl pointer-events-none"
      >
        SKIP
      </motion.div>

      <JobCard job={job} onApply={() => onSwipe("right")} />
    </motion.div>
  );
}

export default function FeedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobFeed();
        setJobs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const showToast = (type: ToastState) => {
    setToast(type);
    setTimeout(() => setToast(null), 1500);
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const job = jobs[currentIndex];
    if (!job || swiping) return;

    try {
      setSwiping(true);
      await swipeJob(job.id, direction);
      showToast(direction === "right" ? "applied" : "skipped");
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setSwiping(false);
    }
  };

  const currentJob = jobs[currentIndex];
  const hasFinishedFeed = !loading && jobs.length > 0 && !currentJob;

  return (
    <>
      <DeveloperNavbar />

      <div className="min-h-screen w-full bg-[#FAF8F5] px-4 py-10">
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm shadow-sm ${
                  toast === "applied"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {toast === "applied" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Applied
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Skipped
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Find your next role
          </h1>

          {loading ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm py-24 text-center">
              <div
                className="w-8 h-8 rounded-full border-[3px] border-gray-200 mx-auto animate-spin"
                style={{ borderTopColor: "#F2754A" }}
              />
              <p className="text-gray-400 text-sm mt-4">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
                <Rocket className="w-7 h-7 text-[#F2754A]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No jobs available
              </h2>
              <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
                Improve your Antyl score, update your preferences, or check
                back tomorrow for new opportunities.
              </p>
            </div>
          ) : hasFinishedFeed ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-[#F2754A]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You are all caught up
              </h2>
              <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
                You have gone through every role we have right now. Check
                back soon for new matches.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full" style={{ minHeight: 420 }}>
                <AnimatePresence>
                  <SwipeCard
                    key={currentJob.id}
                    job={currentJob}
                    onSwipe={handleSwipe}
                  />
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-5 mt-8">
                <button
                  type="button"
                  onClick={() => handleSwipe("left")}
                  disabled={swiping}
                  aria-label="Skip"
                  className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSwipe("right")}
                  disabled={swiping}
                  aria-label="Apply"
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
                  }}
                >
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-400 mt-5">
                {jobs.length - currentIndex - 1} more roles after this one
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}