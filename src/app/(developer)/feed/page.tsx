"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  X,
  CheckCircle2,
  Clock,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

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
type ExitDirection = "left" | "right";

function SwipeCard({
  job,
  onSwipeRight,
  onRequestSkip,
  applyDisabled,
  exitDirection,
}: {
  job: Job;
  onSwipeRight: () => void;
  onRequestSkip: () => void;
  applyDisabled: boolean;
  exitDirection: ExitDirection;
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
        if (info.offset.x > 120 && !applyDisabled) onSwipeRight();
        else if (info.offset.x < -120) onRequestSkip();
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      exit={{
        x: exitDirection === "right" ? 400 : -400,
        opacity: 0,
        rotate: exitDirection === "right" ? 15 : -15,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className="absolute top-0 left-0 right-0 cursor-grab active:cursor-grabbing"
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
          if (!applyDisabled) onSwipeRight();
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
              <Link
                href="/profile"
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors flex items-center justify-center"
              >
                Update status
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SkipConfirmModal({
  open,
  jobTitle,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  jobTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
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
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-[24px] border border-gray-100 shadow-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Skip this job?
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {jobTitle ? `"${jobTitle}" ` : "This job "}
              will be removed from your feed for good - this can&apos;t be
              undone. If you just want to look at other jobs first, use{" "}
              <span className="text-gray-600 font-medium">Next</span> instead.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-full text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Yes, skip
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Mascot-driven empty state — used when there are no jobs in the feed */
/* at all. Fully responsive: sizes/spacing/decoration scale down       */
/* step-by-step from mobile → tablet → desktop.                        */
/* ------------------------------------------------------------------ */
function NoJobsState() {
  return (
    <div className="relative bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden min-h-[420px] sm:min-h-[500px] md:min-h-[62vh] flex items-center justify-center px-5 sm:px-8 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute -left-10 sm:-left-20 top-1/3 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-full bg-orange-50 blur-3xl opacity-60"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-10 sm:-right-20 bottom-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-full bg-orange-50 blur-3xl opacity-60"
        aria-hidden="true"
      />

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 max-w-3xl w-full mx-auto">
        <img
          src="/no_jobs_pose.png"
          alt=""
          className="w-32 h-32 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain shrink-0 select-none"
          draggable={false}
        />

        <div className="text-center md:text-left">
          <h2 className="font-sans text-xl sm:text-2xl md:text-[28px] font-bold text-gray-900 mb-2">
            No jobs available right now
          </h2>
          <p className="font-sans text-sm sm:text-base text-gray-400 leading-relaxed mb-6 sm:mb-7 max-w-md">
            Your feed is empty for the moment. Improve your Antyl score,
            widen your preferences, or check back tomorrow, new roles get
            added every day.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-center md:justify-start gap-3">
            <Link
              href="/profile"
              className="font-sans w-full sm:w-auto text-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors"
            >
              Update preferences
            </Link>
            <Link
              href="/profile#antyl-score"
              className="font-sans w-full sm:w-auto text-center px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Improve my score
            </Link>
          </div>
        </div>
      </div>
    </div>
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

  // Jobs the user has permanently decided on (applied or skipped).
  // Used so Back/Next browsing can't accidentally re-trigger a decision.
  const [decidedIds, setDecidedIds] = useState<Set<string>>(new Set());
  const [pendingSkipJob, setPendingSkipJob] = useState<Job | null>(null);

  // Which way the current card should fly out on its next exit.
  // Defaults to "right" (Apply); Skip/Back explicitly set "left".
  const [exitDirection, setExitDirection] = useState<ExitDirection>("right");

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

  // Moves the view forward without recording any decision on the current job.
  const handleNext = () => {
    setExitDirection("left");
    setCurrentIndex((prev) => Math.min(prev + 1, jobs.length));
  };

  // Moves the view back to a previously browsed job (only relevant after Next).
  const handleBack = () => {
    setExitDirection("right");
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleApply = async () => {
    const job = jobs[currentIndex];
    if (!job || swiping) return;

    if (applyRemaining <= 0) {
      showToast("limit_reached");
      return;
    }

    if (decidedIds.has(job.id)) {
      // Already decided on this one while browsing back/forward — just move on.
      handleNext();
      return;
    }

    try {
      setSwiping(true);
      setExitDirection("right");
      await swipeJob(job.id, "right");
      setApplyRemaining((prev) => Math.max(prev - 1, 0));
      setDecidedIds((prev) => new Set(prev).add(job.id));
      showToast("applied");
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 429) {
        setApplyRemaining(0);
        showToast("limit_reached");
      } else if (err.status === 409) {
        setDecidedIds((prev) => new Set(prev).add(job.id));
        setCurrentIndex((prev) => prev + 1);
      } else {
        console.error(error);
      }
    } finally {
      setSwiping(false);
    }
  };

  // Opens the confirm modal instead of skipping immediately.
  const handleRequestSkip = () => {
    const job = jobs[currentIndex];
    if (!job || swiping) return;

    if (decidedIds.has(job.id)) {
      handleNext();
      return;
    }

    setPendingSkipJob(job);
  };

  const cancelSkip = () => setPendingSkipJob(null);

  const confirmSkip = async () => {
    const job = pendingSkipJob;
    if (!job) return;
    setPendingSkipJob(null);

    try {
      setSwiping(true);
      setExitDirection("left");
      await swipeJob(job.id, "left");
      setDecidedIds((prev) => new Set(prev).add(job.id));
      showToast("skipped");
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err.status === 409) {
        setDecidedIds((prev) => new Set(prev).add(job.id));
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
  const canGoBack = currentIndex > 0;

  // Only the "no jobs" state gets extra width — the swipe deck and the
  // "all caught up" card stay at the page's normal max-w-2xl.
  const isEmptyState = !loading && jobs.length === 0;

  return (
    <div className="md:flex">
      <DeveloperNavbar />

      <main className="flex-1 min-w-0">
        <NotLookingModal
          open={showNotLookingModal}
          onDismiss={() => setShowNotLookingModal(false)}
        />
        <SkipConfirmModal
          open={!!pendingSkipJob}
          jobTitle={pendingSkipJob?.title}
          onCancel={cancelSkip}
          onConfirm={confirmSkip}
        />

        <div className="min-h-screen w-full bg-[#FAF8F5] px-4 py-10">
          <div
            className={`w-full mx-auto transition-[max-width] duration-200 ${
              isEmptyState ? "max-w-4xl" : "max-w-2xl"
            }`}
          >
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <h1 className="font-sans text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                Find your next role
              </h1>

              {statusLoaded && (
                <span
                  className={`font-sans text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto whitespace-nowrap ${
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
              <NoJobsState />
            ) : hasFinishedFeed ? (
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-[#F2754A]" />
                </div>
                <h2 className="font-sans text-2xl font-bold text-gray-900 mb-2">
                  You are all caught up
                </h2>
                <p className="font-sans text-gray-400 max-w-sm mx-auto leading-relaxed">
                  You have gone through every role we have right now. Check
                  back soon for new matches.
                </p>
                {canGoBack && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="font-sans mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#F2754A] hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Go back to previous roles
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {applyDisabled && (
                  <div className="w-full bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 mb-5 flex items-center gap-2 text-sm text-[#F2754A] font-medium">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    You have used all {applyLimit} applies today. You can still
                    skip through roles - applying resumes at midnight IST.
                  </div>
                )}

                {decidedIds.has(currentJob.id) && (
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 mb-5 text-sm text-gray-500 font-medium text-center">
                    You already decided on this one - use Next to keep browsing.
                  </div>
                )}

                <div className="relative w-full" style={{ minHeight: 420 }}>
                  <AnimatePresence mode="popLayout">
                    <SwipeCard
                      key={currentJob.id}
                      job={currentJob}
                      onSwipeRight={handleApply}
                      onRequestSkip={handleRequestSkip}
                      applyDisabled={applyDisabled}
                      exitDirection={exitDirection}
                    />
                  </AnimatePresence>
                </div>

                {/* Back / Next browsing row */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={!canGoBack || swiping}
                    aria-label="Back"
                    className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                  <span className="text-gray-200">•</span>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={swiping}
                    aria-label="Next"
                    className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-5 mt-5">
                  <button
                    type="button"
                    onClick={handleRequestSkip}
                    disabled={swiping}
                    aria-label="Skip"
                    className="butn butn__new butn--small butn--skip"
                  >
                    <span>Skip</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApply}
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
      </main>
    </div>
  );
}