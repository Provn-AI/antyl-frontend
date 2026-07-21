"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { X, Rocket, CheckCircle2, Clock, EyeOff } from "lucide-react";

import JobCard from "@/components/jobs/JobCard";
import DeveloperNavbar from "../components/DeveloperNavbar";
import { swipeJob, getSwipeStatus } from "@/services/swipe.service";
import { getJobFeed } from "@/services/job.service";
import { getMyProfile } from "@/services/developer.service";

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

type ToastState = "applied" | "skipped" | "limit_reached" | null;

function SwipeCard({
  job,
  onSwipe,
  applyDisabled,
}: {
  job: Job;
  onSwipe: (direction: "left" | "right") => void;
  applyDisabled: boolean;
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
        if (info.offset.x > 120 && !applyDisabled) onSwipe("right");
        else if (info.offset.x < -120) onSwipe("left");
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full cursor-grab active:cursor-grabbing"
    >
      {!applyDisabled && (
        <motion.div
          style={{ opacity: applyOpacity }}
          className="absolute top-6 left-6 z-10 rotate-[-12deg] border-3 border-green-500 text-green-500 font-extrabold text-2xl px-4 py-1 rounded-xl pointer-events-none"
        >
          APPLY
        </motion.div>
      )}

      <motion.div
        style={{ opacity: skipOpacity }}
        className="absolute top-6 right-6 z-10 rotate-[12deg] border-3 border-red-500 text-red-500 font-extrabold text-2xl px-4 py-1 rounded-xl pointer-events-none"
      >
        SKIP
      </motion.div>

      <JobCard
        job={job}
        onApply={() => {
          if (!applyDisabled) onSwipe("right");
        }}
      />
    </motion.div>
  );
}

function NotLookingModal({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-[24px] border border-gray-100 shadow-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <EyeOff className="w-6 h-6 text-[#F2754A]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              You&apos;re set to &quot;Not looking&quot;
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
  Jobs won&apos;t show up in your feed while your status is set to Not Looking,
  update your status in profile by clicking on{" "}
  <span className="text-[#F2754A] font-medium">
    Edit Profile
  </span>.
</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onDismiss}
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
              <a
                href="/profile"
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors flex items-center justify-center"
              >
                Update status
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function FeedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);
  const [swiping, setSwiping] = useState(false);

  const [applyLimit, setApplyLimit] = useState(10);
  const [applyRemaining, setApplyRemaining] = useState(10);
  const [statusLoaded, setStatusLoaded] = useState(false);

  const [showNotLookingModal, setShowNotLookingModal] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const [jobsData, statusData, profileData] = await Promise.all([
          getJobFeed(),
          getSwipeStatus(),
          getMyProfile(),
        ]);
        setJobs(jobsData);
        setApplyLimit(statusData.limit);
        setApplyRemaining(statusData.remaining);

        if (profileData.job_status === "not_looking") {
          setShowNotLookingModal(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setStatusLoaded(true);
      }
    }

    loadJobs();
  }, []);

  const showToast = (type: ToastState) => {
    setToast(type);
    setTimeout(() => setToast(null), 1800);
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const job = jobs[currentIndex];
    if (!job || swiping) return;

    if (direction === "right" && applyRemaining <= 0) {
      showToast("limit_reached");
      return;
    }

    try {
      setSwiping(true);
      await swipeJob(job.id, direction);

      if (direction === "right") {
        setApplyRemaining((prev) => Math.max(prev - 1, 0));
        showToast("applied");
      } else {
        showToast("skipped");
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      const err = error as Error & { status?: number };

      if (err.status === 429) {
        setApplyRemaining(0);
        showToast("limit_reached");
      } else if (err.status === 409) {
        // Already swiped/applied — just move past it, no need to alarm the user
        setCurrentIndex((prev) => prev + 1);
      } else {
        console.error(error);
      }
    } finally {
      setSwiping(false);
    }
  };

  const currentJob = jobs[currentIndex];
  const hasFinishedFeed = !loading && jobs.length > 0 && !currentJob;
  const applyDisabled = applyRemaining <= 0;

  return (
    <>
      <DeveloperNavbar />
      <NotLookingModal
        open={showNotLookingModal}
        onDismiss={() => setShowNotLookingModal(false)}
      />

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
                    : toast === "skipped"
                    ? "bg-red-50 text-red-500"
                    : "bg-orange-50 text-[#F2754A]"
                }`}
              >
                {toast === "applied" && (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Applied
                  </>
                )}
                {toast === "skipped" && (
                  <>
                    <X className="w-4 h-4" />
                    Skipped
                  </>
                )}
                {toast === "limit_reached" && (
                  <>
                    <Clock className="w-4 h-4" />
                    Daily apply limit reached
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Find your next role
            </h1>

            {statusLoaded && (
              <span
                className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                  applyDisabled
                    ? "bg-gray-100 text-gray-400"
                    : "bg-orange-50 text-[#F2754A]"
                }`}
              >
                {applyRemaining}/{applyLimit} applies left today
              </span>
            )}
          </div>

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
              {applyDisabled && (
                <div className="w-full bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 mb-5 flex items-center gap-2 text-sm text-[#F2754A] font-medium">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  You have used all {applyLimit} applies today. You can still
                  skip through roles — applying resumes at midnight IST.
                </div>
              )}

              <div className="relative w-full" style={{ minHeight: 420 }}>
                <AnimatePresence>
                  <SwipeCard
                    key={currentJob.id}
                    job={currentJob}
                    onSwipe={handleSwipe}
                    applyDisabled={applyDisabled}
                  />
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-5 mt-8">
                <button
                  type="button"
                  onClick={() => handleSwipe("left")}
                  disabled={swiping}
                  aria-label="Skip"
                  className="butn butn__new butn--small butn--skip"
                >
                  <span>Skip</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwipe("right")}
                  disabled={swiping || applyDisabled}
                  aria-label="Apply"
                  className="butn butn__new butn--small butn--apply"
                  style={
                    applyDisabled
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : undefined
                  }
                >
                  <span>Apply</span>
                </button>

                <style jsx>{`
                  .butn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    text-transform: none;
                    text-decoration: none;
                    padding: 0 16px;
                    height: 48px;
                    min-width: 84px;
                    width: auto;
                    margin-right: 0;
                    border-radius: 8px;
                    border: none;
                    color: #111827;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.25s ease-in-out;
                    cursor: pointer;
                  }

                  .butn span {
                    z-index: 20;
                    pointer-events: none;
                    font-weight: 600;
                  }

                  .butn::before {
                    background: #fff;
                    content: "";
                    height: 120px;
                    opacity: 0;
                    position: absolute;
                    top: -40px;
                    transform: rotate(35deg);
                    width: 60px;
                    transition: all 600ms cubic-bezier(0.19, 1, 0.22, 1);
                    z-index: 10;
                  }

                  .butn::after {
                    background: #fff;
                    content: "";
                    height: 200px;
                    opacity: 0;
                    position: absolute;
                    top: -60px;
                    transform: rotate(35deg);
                    transition: all 600ms cubic-bezier(0.19, 1, 0.22, 1);
                    width: 100px;
                    z-index: 9;
                  }

                  .butn__new::before {
                    left: -50%;
                  }

                  .butn__new::after {
                    left: -100%;
                  }

                  .butn:hover,
                  .butn:active {
                    transform: translateY(-3px);
                    color: #fff;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
                  }

                  .butn__new:hover::before {
                    left: 120%;
                    opacity: 0.6;
                  }

                  .butn__new:hover::after {
                    left: 220%;
                    opacity: 0.65;
                  }

                  .butn--skip {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    color: #6b7280;
                  }

                  .butn--skip::before,
                  .butn--skip::after {
                    background: rgba(0, 0, 0, 0.06);
                  }

                  .butn--skip:hover {
                    color: #fff;
                    background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);
                  }

                  .butn--apply {
                    background: linear-gradient(90deg, #F2754A 0%, #F8B36B 100%);
                    color: #ffffff;
                  }

                  .butn--apply::before,
                  .butn--apply::after {
                    background: rgba(255, 255, 255, 0.22);
                  }
                `}</style>
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