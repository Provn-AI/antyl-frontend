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