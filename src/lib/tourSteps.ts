import { TourStep } from "@/components/OnboardingTour";

export const DEVELOPER_TOUR_KEY = "antyl_tour_seen_developer";

// ── Feed page steps ─────────────────────────────────────────────────────────
// These anchors live in the page body (not the hidden sidebar), so desktop and
// mobile share them. The navbar only includes them when the user is on /feed.
export const developerFeedSteps: TourStep[] = [
  {
    id: "page-card",
    target: '[data-tour="feed-card"]',
    title: "Swipe to decide",
    content: "Swipe a job right to apply, left to skip. Tap the card to open the full details.",
  },
  {
    id: "page-actions",
    target: '[data-tour="feed-actions"]',
    title: "Or use the buttons",
    content: "Apply sends your application. Skip removes the job from your feed for good, so we ask you to confirm first.",
  },
  {
    id: "page-browse",
    target: '[data-tour="feed-browse"]',
    title: "Take your time",
    content: "Back and Next let you look through roles without applying to or skipping any of them.",
  },
  {
    id: "page-quota",
    target: '[data-tour="feed-quota"]',
    title: "Daily applies",
    content: "This shows how many applies you have left today. The counter resets at midnight IST.",
  },
  {
    id: "page-auto",
    target: '[data-tour="feed-quota"]',
    title: "Auto-apply",
    content: "Short on time? Turn on auto-apply in your profile preferences and Antyl applies to matching roles for you. It needs your tech stack filled in on your profile.",
  },
];

// ── Navigation steps (desktop sidebar) ──────────────────────────────────────
export const developerNavSteps: TourStep[] = [
  {
    id: "feed",
    target: '[data-tour="nav-feed"]',
    title: "Your feed",
    content: "Swipe through roles matched to your Antyl Score — right to apply, left to pass.",
  },
  {
    id: "dashboard",
    target: '[data-tour="nav-dashboard"]',
    title: "Dashboard",
    content: "Track your Antyl Score, verification status, and profile strength at a glance.",
  },
  {
    id: "leaderboard",
    target: '[data-tour="nav-leaderboard"]',
    title: "Leaderboard",
    content: "See how you rank against other verified developers.",
  },
  {
    id: "applications",
    target: '[data-tour="nav-applications"]',
    title: "Applications",
    content: "Every role you've applied to, and where it stands, lives here.",
  },
  {
    id: "bookmarks",
    target: '[data-tour="nav-bookmarks"]',
    title: "Bookmarks",
    content: "Save roles you're interested in and come back to apply later.",
  },
  {
    id: "messages",
    target: '[data-tour="nav-messages"]',
    title: "Messages",
    content: "Chat directly with recruiters once a match is made.",
  },
  {
    id: "blog",
    target: '[data-tour="nav-blog"]',
    title: "Blog",
    content: "Career tips and product updates from the Antyl team.",
  },
  {
    id: "profile",
    target: '[data-tour="nav-profile"]',
    title: "Your profile",
    content: "What recruiters see — GitHub verification, tech stack, and experience.",
  },
  {
    id: "bell",
    target: '[data-tour="nav-bell"]',
    title: "Notifications",
    content: "Matches, profile views, and streak milestones show up here first.",
  },
];

// Mobile version of the navigation steps. The desktop sidebar (which owns the
// plain data-tour="nav-*" anchors) is hidden below md, so the mobile menu and
// mobile bell use "m-" prefixed anchors, e.g. data-tour="m-nav-feed".
export const developerNavStepsMobile: TourStep[] = developerNavSteps.map((s) => ({
  ...s,
  target: s.target.replace('data-tour="', 'data-tour="m-'),
}));

// Backwards-compatible aliases for any file still importing the old names.
export const developerTourSteps = developerNavSteps;
export const developerTourStepsMobile = developerNavStepsMobile;

export const RECRUITER_TOUR_KEY = "antyl_tour_seen_recruiter";

export const recruiterTourSteps: TourStep[] = [
  {
    id: "dashboard",
    target: '[data-tour="nav-dashboard"]',
    title: "Dashboard",
    content: "Your hiring activity and pipeline health at a glance.",
  },
  {
    id: "jobs",
    target: '[data-tour="nav-jobs"]',
    title: "Jobs",
    content: "All your postings in one place — track status and applicants for each.",
  },
  {
    id: "create-job",
    target: '[data-tour="nav-jobs-new"]',
    title: "Post a role",
    content: "Create a job in a couple minutes — Antyl auto-matches verified candidates to it.",
  },
  {
    id: "candidates",
    target: '[data-tour="nav-candidates"]',
    title: "Candidates",
    content: "Review candidates with GitHub-verified Antyl Scores, not just resumes.",
  },
  {
    id: "messages",
    target: '[data-tour="nav-messages"]',
    title: "Messages",
    content: "Chat directly with candidates once you've shown interest.",
  },
  {
    id: "billing",
    target: '[data-tour="nav-billing"]',
    title: "Billing",
    content: "Manage your credits and payment details — every job post uses one.",
  },
  {
    id: "pipeline",
    target: '[data-tour="nav-pipeline"]',
    title: "Pipeline",
    content: "Drag candidates through your hiring stages on the Kanban board.",
  },
  {
    id: "blog",
    target: '[data-tour="nav-blog"]',
    title: "Blog",
    content: "Hiring tips and product updates from the Antyl team.",
  },
  {
    id: "profile",
    target: '[data-tour="nav-profile"]',
    title: "Company profile",
    content: "Your company details, visible to every developer you match with — keep it current.",
  },
];

export const JOB_FORM_TOUR_KEY = "antyl_tour_seen_job_form";

export const jobFormTourSteps: TourStep[] = [
  {
    id: "title",
    target: '[data-tour="job-title"]',
    title: "Start with a title",
    content: "Give the role a clear title — you'll be able to auto-fill the rest with AI once you do.",
  },
  {
    id: "autofill",
    target: '[data-tour="job-autofill"]',
    title: "Auto-fill with AI",
    content: "Let AI draft the description, tech stack, salary range, and experience level from just the title.",
  },
  {
    id: "tech-stack",
    target: '[data-tour="job-tech-stack"]',
    title: "Tech stack",
    content: "List the required skills, comma-separated — this feeds straight into candidate matching.",
  },
  {
    id: "score",
    target: '[data-tour="job-score-slider"]',
    title: "Antyl Score range",
    content: "The Antyl Score is a 0–100 GitHub-verified trust score for every developer. Set a range here and you'll only match candidates who clear your bar — no more sifting resumes to check.",
  },
  {
    id: "location",
    target: '[data-tour="job-location"]',
    title: "Location",
    content: "Pick from the city list so your job matches candidates' preferred locations exactly.",
  },
  {
    id: "submit",
    target: '[data-tour="job-submit"]',
    title: "You're set",
    content: "Preview how candidates will see this role, then post it — Antyl starts matching right away.",
  },
];