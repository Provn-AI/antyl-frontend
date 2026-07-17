import { TourStep } from "@/components/OnboardingTour";

export const DEVELOPER_TOUR_KEY = "antyl_tour_seen_developer";

export const developerTourSteps: TourStep[] = [
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
    id: "bell",
    target: '[data-tour="nav-bell"]',
    title: "Notifications",
    content: "Matches, profile views, and streak milestones show up here first.",
  },
];

export const RECRUITER_TOUR_KEY = "antyl_tour_seen_recruiter";

export const recruiterTourSteps: TourStep[] = [
  {
    id: "dashboard",
    target: '[data-tour="nav-dashboard"]',
    title: "Dashboard",
    content: "Your hiring activity and pipeline health at a glance.",
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
    id: "pipeline",
    target: '[data-tour="nav-pipeline"]',
    title: "Pipeline",
    content: "Drag candidates through your hiring stages on the Kanban board.",
  },
];