"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  MapPin,
  Briefcase,
  Trash2,
  Shield,
  AlertTriangle,
  AlertCircle,
  Code2,
  Pencil,
  Save,
  X,
  FileText,
  Flame,
  Zap,
  ChevronDown,
  Upload,
  Share2,
  Clock,
  Camera,
  Award,
  TrendingUp,
  GraduationCap,
  Link2,
  Plus,
  Lock,
  Info,
} from "lucide-react";

import {
  getMyProfile,
  getVerificationHistory,
  disconnectGithub,
  deleteAccount,
  updateProfile,
  uploadProfilePhoto,
  uploadResume,
  getAutoApplyStatus,
  toggleAutoApply,
  getAutoApplyPreferences,
  saveAutoApplyPreferences,
  AutoApplyStatus,
} from "@/services/developer.service";
import { getVerificationCooldown } from "@/services/verification.service";
import { getMyBadges, Badge, BadgeCatalogEntry } from "@/services/badge.service";
import { getMyStreak, StreakSummary } from "@/services/streak.service";
import ScoreHistoryChart from "@/components/verification/ScoreHistoryChart";
import DeveloperNavbar from "../components/DeveloperNavbar";
import { ShareBadgeModal, ShareBadgeData } from "@/components/ShareBadgeModal";
import CitySelect from "@/components/citySelect";
// Shared skill catalog + helpers (save the skills.ts file as src/lib/skills.ts)
import {
  findCatalogSkill,
  getSkillSuggestions,
  normalizeSkillList,
  resolveSkill,
} from "@/lib/skills";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  name?: string;
  bio?: string;
  city?: string;
  current_role?: string;
  years_experience?: number;
  tech_stack?: string[];
  // Staged by the backend after the 7-day lock opens. Goes live only when the
  // next verification is completed.
  pending_tech_stack?: string[] | null;
  pending_resume_url?: string | null;
  trust_score?: number;
  github_username?: string;
  linkedin_url?: string;
  resume_url?: string;
  avatar_url?: string;
  job_status?: string;
  remote_ok?: boolean;
  notice_period_days?: number;
  resume_parsed_data?: {
    work_history?: { company: string; role: string; duration: string }[];
    education?: { degree: string; institution: string; year: string }[];
  };
}

interface SalaryRange {
  min: number;
  max: number;
}

type SkillOption = { label: string; value: string; custom?: boolean };

const JOB_STATUS_OPTIONS = [
  { value: "actively_looking", label: "Actively looking" },
  // { value: "open_to_opportunities", label: "Open to opportunities" },
  { value: "not_looking", label: "Not looking" },
];

const JOB_TYPES = ["full_time", "part_time", "contract", "internship"];

function jobStatusLabel(value: string | undefined) {
  return JOB_STATUS_OPTIONS.find((o) => o.value === value)?.label || "Not set";
}

function formatSalary(n: number) {
  return `₹${n.toLocaleString("en-IN")} LPA`;
}

function noticePeriodLabel(days: number | undefined) {
  if (days == null) return null;
  return days === 0 ? "Available immediately" : `${days}d notice period`;
}

function resolveBadgeRank(metadata?: Record<string, unknown>) {
  if (!metadata) return null;
  const rankValue = metadata.rank ?? metadata.position;
  return typeof rankValue === "number" ? rankValue : null;
}

function resolveBadgeFieldLabel(metadata?: Record<string, unknown>) {
  if (!metadata) return undefined;
  const fieldValue = metadata.field_label ?? metadata.field_of_work ?? metadata.field;
  return typeof fieldValue === "string" ? fieldValue : undefined;
}

// Number inputs change value when the mouse wheel scrolls over them while focused.
// Blurring on wheel stops accidental changes (e.g. notice period jumping to 0)
// and lets the page keep scrolling normally.
const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
  e.currentTarget.blur();
};

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 76 }: { score: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.max(0, Math.min(100, score)) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            className="stroke-orange-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F2754A" />
              <stop offset="100%" stopColor="#FFB347" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-gray-900 tabular-nums">{score}</span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-gray-400">Antyl Score</span>
    </div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────

type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  cta: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
};

const CONFIRM_CLOSED: ConfirmState = {
  open: false,
  title: "",
  description: "",
  cta: "",
  onConfirm: async () => {},
};

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.open, onClose]);

  if (!state.open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[24px] border border-gray-100 shadow-xl p-6">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${
            state.danger ? "bg-[#E0533D]/10" : "bg-orange-50"
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${state.danger ? "text-[#E0533D]" : "text-[#F2754A]"}`}
          />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{state.title}</h3>
        <p className="text-sm text-gray-400 mb-6">{state.description}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await state.onConfirm();
              } finally {
                setBusy(false);
                onClose();
              }
            }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-50 ${
              state.danger ? "bg-[#E0533D] hover:bg-[#C9442F]" : "bg-[#F2754A] hover:bg-[#e0623a]"
            }`}
          >
            {busy ? "Working…" : state.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Brand icons ───────────────────────────────────────────────────────────────

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.555v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.414v1.561h.049c.476-.9 1.637-1.851 3.369-1.851 3.602 0 4.268 2.37 4.268 5.451v6.291zm-14.692-11.9c-1.146 0-2.075-.931-2.075-2.078 0-1.15.929-2.08 2.075-2.08 1.146 0 2.075.93 2.075 2.08 0 1.147-.929 2.078-2.075 2.078zm1.777 11.9H4.0V9h3.532v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.202 24 24 23.226 24 22.271V1.729C24 .774 23.202 0 22.225 0z" />
    </svg>
  );
}

function LinkedInLink({ url }: { url: string | undefined }) {
  if (!url) return <p className="text-sm font-semibold text-gray-800">Not added</p>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-semibold text-gray-800 hover:text-[#F2754A]"
    >
      View profile
    </a>
  );
}

function GitHubLink({ username }: { username?: string }) {
  if (!username) return <p className="text-sm font-semibold text-gray-800">Not connected</p>;
  return (
    <a
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-semibold text-gray-800 hover:text-[#F2754A]"
    >
      @{username}
    </a>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  sectionRef,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  // Used to scroll a specific section into view (e.g. when a required field is missing).
  sectionRef?: React.Ref<HTMLElement>;
  // Draws a red outline around the card to flag a problem inside it.
  highlight?: boolean;
}) {
  return (
    <section
      ref={sectionRef}
      className={`bg-white rounded-[24px] border shadow-sm p-6 sm:p-7 mb-4 transition-all duration-300 ${
        highlight
          ? "border-[#E0533D] ring-4 ring-[#E0533D]/15 bg-red-50/30"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-[#F2754A]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-[#F2754A]" />
      </div>
      <p
        className="text-2xl font-bold text-gray-900 tabular-nums leading-none"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        {value}
      </p>
      <p className="text-xs font-semibold text-gray-500 mt-1.5">{label}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{hint}</p>}
    </div>
  );
}

function Pill({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "orange";
}) {
  return (
    <span
      className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${
        tone === "orange" ? "text-[#F2754A] bg-orange-50" : "text-gray-500 bg-gray-50"
      }`}
    >
      {children}
    </span>
  );
}

// Section header used inside the unified edit form
function EditSectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-bold text-gray-800">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
        checked ? "bg-[#F2754A]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Input style ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition bg-white placeholder:font-normal placeholder:text-gray-300";

const MAX_PHOTO_SIZE = 0.2 * 1024 * 1024; // 200kb
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_RESUME_SIZE = 0.1 * 1024 * 1024; // 100kb, matches backend limit
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<{ score: number; date: string }[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeCatalog, setBadgeCatalog] = useState<Record<string, BadgeCatalogEntry>>({});
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Time left until the next verification opens. While > 0, tech stack and
  // resume are locked (the backend enforces this too and answers 423).
  const [cooldown, setCooldown] = useState<{
    days: number;
    hours: number;
    locked: boolean;
    unlocks_at: string | null;
  }>({ days: 0, hours: 0, locked: false, unlocks_at: null });

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    city: "",
    current_role: "",
    years_experience: 0,
    linkedin_url: "",
    job_status: "",
    tech_stack: [] as string[],
    remote_ok: false,
    notice_period_days: 0,
  });

  // Auto-apply / match preferences — edited inline alongside the rest
  // of the profile instead of on a separate /settings/auto-apply page.
  const [autoApplyForm, setAutoApplyForm] = useState({
    min_similarity_score: 70,
    preferred_tech_stack: "", // comma-separated string while editing
    job_type: [] as string[],
    preferred_locations: [] as string[],
    salary_min: 0,
    salary_max: 0,
  });

  // Text box for adding a new skill to the tech stack while editing.
  const [skillInput, setSkillInput] = useState("");
  // Autocomplete dropdown state for the skill input.
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [skillActiveIndex, setSkillActiveIndex] = useState(0);
  const skillBoxRef = useRef<HTMLDivElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Tech stack is required: saving with no skills is blocked, the card is
  // highlighted and the page scrolls to it.
  const [techStackError, setTechStackError] = useState("");
  const techStackSectionRef = useRef<HTMLElement>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [autoApply, setAutoApply] = useState<AutoApplyStatus | null>(null);
  const [autoApplyToggling, setAutoApplyToggling] = useState(false);
  const [salaryRange, setSalaryRange] = useState<SalaryRange | null>(null);
  const [matchPrefsSummary, setMatchPrefsSummary] = useState<{
    minScore: number;
    techStack: string[];
    jobTypes: string[];
    locations: string[];
  } | null>(null);
  const [sharedBadge, setSharedBadge] = useState<ShareBadgeData | null>(null);

  // Danger zone starts collapsed so destructive actions aren't front-and-center.
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);

  // Derived lock state (plain values, no hooks, so safe before the early returns).
  const locked = cooldown.locked || cooldown.days > 0 || cooldown.hours > 0;
  const lockLabel =
    cooldown.days > 0
      ? `${cooldown.days}d ${cooldown.hours}h`
      : cooldown.hours > 0
      ? `${cooldown.hours}h`
      : "under 1h";
  const unlockDateLabel = cooldown.unlocks_at
    ? new Date(cooldown.unlocks_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileData, historyData, badgeData, streakData] = await Promise.all([
          getMyProfile(),
          getVerificationHistory(),
          getMyBadges(),
          getMyStreak(),
        ]);
        setProfile(profileData);
        setHistory(historyData);
        setBadges(badgeData.badges);
        setBadgeCatalog(badgeData.catalog);
        setStreak(streakData);
        setFormData({
          name: profileData.name || "",
          bio: profileData.bio || "",
          city: profileData.city || "",
          current_role: profileData.current_role || "",
          years_experience: profileData.years_experience || 0,
          linkedin_url: profileData.linkedin_url || "",
          job_status: profileData.job_status || "not_looking",
          // If a change is already staged, edit that instead of the live stack.
          tech_stack: profileData.pending_tech_stack ?? profileData.tech_stack ?? [],
          remote_ok: profileData.remote_ok || false,
          notice_period_days: profileData.notice_period_days ?? 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

      // Own try/catch so a cooldown failure doesn't break the rest of the page.
      try {
        const c = await getVerificationCooldown();
        setCooldown({
          days: c.days ?? 0,
          hours: c.hours ?? 0,
          locked: !!c.locked,
          unlocks_at: c.unlocks_at ?? null,
        });
      } catch (error) {
        console.error(error);
      }

      try {
        const status = await getAutoApplyStatus();
        setAutoApply(status);
      } catch (error) {
        console.error(error);
      }

      // Separate try/catch: a brand-new user may not have saved
      // preferences yet, and that shouldn't break the rest of the page.
      try {
        const prefs = await getAutoApplyPreferences();
        if (prefs.salary_min || prefs.salary_max) {
          setSalaryRange({ min: prefs.salary_min, max: prefs.salary_max });
        }
        setMatchPrefsSummary({
          minScore: prefs.min_similarity_score ?? 70,
          techStack: prefs.preferred_tech_stack || [],
          jobTypes: prefs.job_type || [],
          locations: prefs.preferred_locations || [],
        });
        setAutoApplyForm({
          min_similarity_score: prefs.min_similarity_score ?? 70,
          preferred_tech_stack: (prefs.preferred_tech_stack || []).join(", "),
          job_type: prefs.job_type || [],
          preferred_locations: prefs.preferred_locations || [],
          salary_min: prefs.salary_min ?? 0,
          salary_max: prefs.salary_max ?? 0,
        });
      } catch (error) {
        console.error(error);
      }
    }
    loadProfile();
  }, []);

  // Close the skill suggestions when clicking anywhere outside the input box.
  useEffect(() => {
    if (!skillDropdownOpen) return;
    const onDown = (e: MouseEvent) => {
      if (skillBoxRef.current && !skillBoxRef.current.contains(e.target as Node)) {
        setSkillDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [skillDropdownOpen]);

  // Suggestions for the current text: known skills first (canonical spelling),
  // plus a "add as typed" row so custom skills are still possible.
  const skillOptions: SkillOption[] = useMemo(() => {
    const q = skillInput.trim();
    if (!q) return [];

    const options: SkillOption[] = getSkillSuggestions(q, formData.tech_stack).map((s) => ({
      label: s,
      value: s,
    }));

    const alreadyAdded = formData.tech_stack.some((t) => t.toLowerCase() === q.toLowerCase());
    const isKnownExact = !!findCatalogSkill(q);
    if (!alreadyAdded && !isKnownExact) {
      options.push({ label: q, value: q, custom: true });
    }
    return options;
  }, [skillInput, formData.tech_stack]);

  // Flags the Tech stack card and brings it into view.
  const flagMissingTechStack = () => {
    setTechStackError("Add at least one skill before saving. Recruiters match you on your tech stack.");
    setSaveError("Tech stack is required. Add at least one skill.");
    techStackSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Focus after the smooth scroll has had a moment to land.
    window.setTimeout(() => skillInputRef.current?.focus({ preventScroll: true }), 450);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaveError("");

    // While locked the tech stack can't change, so it's left out entirely.
    // Otherwise anything typed in the skill box but not yet added still counts.
    const pendingSkill = locked ? "" : skillInput.trim();
    const finalTechStack = locked
      ? profile.tech_stack || []
      : pendingSkill
      ? normalizeSkillList([...formData.tech_stack, pendingSkill])
      : formData.tech_stack;

    if (!locked && finalTechStack.length === 0) {
      flagMissingTechStack();
      return;
    }

    setTechStackError("");
    setSaving(true);
    try {
      const parsedTechStack = autoApplyForm.preferred_tech_stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tech_stack: _omit, ...withoutStack } = formData;
      const payload = locked ? withoutStack : { ...formData, tech_stack: finalTechStack };

      await Promise.all([
        updateProfile(payload),
        saveAutoApplyPreferences({
          min_similarity_score: autoApplyForm.min_similarity_score,
          preferred_tech_stack: parsedTechStack,
          job_type: autoApplyForm.job_type,
          preferred_locations: autoApplyForm.preferred_locations,
          salary_min: autoApplyForm.salary_min,
          salary_max: autoApplyForm.salary_max,
        }),
      ]);

      // Live and pending tech stacks can now differ, so take the server's
      // version instead of merging the payload locally.
      const refreshed = await getMyProfile();
      setProfile(refreshed);
      setFormData((f) => ({
        ...f,
        tech_stack: refreshed.pending_tech_stack ?? refreshed.tech_stack ?? [],
      }));

      setSalaryRange({ min: autoApplyForm.salary_min, max: autoApplyForm.salary_max });
      setMatchPrefsSummary({
        minScore: autoApplyForm.min_similarity_score,
        techStack: parsedTechStack,
        jobTypes: autoApplyForm.job_type,
        locations: autoApplyForm.preferred_locations,
      });
      setSkillInput("");
      setSkillDropdownOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      // Show the server's message so a 423 lock error is readable.
      setSaveError(error instanceof Error ? error.message : "Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        current_role: profile.current_role || "",
        years_experience: profile.years_experience || 0,
        linkedin_url: profile.linkedin_url || "",
        job_status: profile.job_status || "not_looking",
        tech_stack: profile.pending_tech_stack ?? profile.tech_stack ?? [],
        remote_ok: profile.remote_ok || false,
        notice_period_days: profile.notice_period_days ?? 0,
      });
    }
    if (matchPrefsSummary) {
      setAutoApplyForm({
        min_similarity_score: matchPrefsSummary.minScore,
        preferred_tech_stack: matchPrefsSummary.techStack.join(", "),
        job_type: matchPrefsSummary.jobTypes,
        preferred_locations: matchPrefsSummary.locations,
        salary_min: salaryRange?.min ?? 0,
        salary_max: salaryRange?.max ?? 0,
      });
    }
    setSkillInput("");
    setSkillDropdownOpen(false);
    setSkillActiveIndex(0);
    setTechStackError("");
    setSaveError("");
    setIsEditing(false);
  };

  const handleDisconnectGithub = async () => {
    await disconnectGithub();
    setProfile((p) => (p ? { ...p, github_username: undefined } : p));
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const handlePhotoClick = () => {
    if (avatarUploading) return;
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setAvatarError("");

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setAvatarError("Use a JPEG, PNG, or WEBP image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setAvatarError("Image must be under 200kb");
      e.target.value = "";
      return;
    }

    setAvatarUploading(true);
    try {
      const uploadedUrl = await uploadProfilePhoto(file);
      setProfile({ ...profile, avatar_url: uploadedUrl });
    } catch (error) {
      console.error(error);
      setAvatarError("Upload failed. Try again.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleResumeClick = () => {
    if (resumeUploading || locked) return;
    resumeInputRef.current?.click();
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setResumeError("");

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError("Use a PDF or DOCX file");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      setResumeError("Resume must be under 100kb");
      e.target.value = "";
      return;
    }

    setResumeUploading(true);
    try {
      await uploadResume(file);
      // upload_resume awaits parsing before returning. For a verified user the
      // result is staged as pending_resume_*, so the live resume is unchanged
      // until the next verification completes.
      const refreshed = await getMyProfile();
      setProfile(refreshed);
    } catch (error) {
      console.error(error);
      // Show the server's message so a 423 lock or a parse failure is readable.
      setResumeError(error instanceof Error ? error.message : "Upload failed. Try again.");
    } finally {
      setResumeUploading(false);
      e.target.value = "";
    }
  };

  const handleToggleAutoApply = async () => {
    if (!autoApply || autoApplyToggling) return;
    setAutoApplyToggling(true);
    const next = !autoApply.is_enabled;
    try {
      await toggleAutoApply(next);
      setAutoApply({ ...autoApply, is_enabled: next });
    } catch (error) {
      console.error(error);
    } finally {
      setAutoApplyToggling(false);
    }
  };

  const toggleJobType = (type: string) => {
    setAutoApplyForm((prev) => ({
      ...prev,
      job_type: prev.job_type.includes(type)
        ? prev.job_type.filter((t) => t !== type)
        : [...prev.job_type, type],
    }));
  };

  // Adds a skill to formData.tech_stack. Known skills are normalised to their
  // canonical spelling ("pyt" → "Python", "nodejs" → "Node.js"); unknown skills
  // are kept exactly as typed. Case-insensitive dedupe.
  const addSkill = (raw?: string) => {
    if (locked) return;
    const skill = resolveSkill(raw ?? skillInput);
    if (!skill) return;
    if (!formData.tech_stack.some((t) => t.toLowerCase() === skill.toLowerCase())) {
      setFormData((prev) => ({ ...prev, tech_stack: [...prev.tech_stack, skill] }));
    }
    // A skill is in now, so the "missing" warning no longer applies.
    setTechStackError("");
    setSaveError("");
    setSkillInput("");
    setSkillActiveIndex(0);
    setSkillDropdownOpen(false);
  };

  const removeSkill = (skill: string) => {
    if (locked) return;
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((t) => t !== skill),
    });
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const hasOptions = skillDropdownOpen && skillOptions.length > 0;

    if (e.key === "ArrowDown") {
      if (skillOptions.length === 0) return;
      e.preventDefault();
      setSkillDropdownOpen(true);
      setSkillActiveIndex((i) => (i + 1) % skillOptions.length);
    } else if (e.key === "ArrowUp") {
      if (skillOptions.length === 0) return;
      e.preventDefault();
      setSkillDropdownOpen(true);
      setSkillActiveIndex((i) => (i - 1 + skillOptions.length) % skillOptions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hasOptions) {
        const picked = skillOptions[Math.min(skillActiveIndex, skillOptions.length - 1)];
        addSkill(picked.value);
      } else {
        addSkill();
      }
    } else if (e.key === "Tab") {
      // Tab accepts the highlighted known suggestion without leaving the field.
      if (hasOptions) {
        const picked = skillOptions[Math.min(skillActiveIndex, skillOptions.length - 1)];
        if (picked && !picked.custom) {
          e.preventDefault();
          addSkill(picked.value);
        }
      }
    } else if (e.key === "Escape") {
      if (skillDropdownOpen) {
        e.preventDefault();
        setSkillDropdownOpen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full md:flex bg-[#FAF6F0] overflow-x-hidden">
        <DeveloperNavbar />
        <div className="w-full md:flex-1 md:min-w-0 md:flex md:justify-center px-4 py-12">
          <div className="w-full max-w-2xl md:mx-auto min-w-0 animate-pulse">
            <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden mb-4">
              <div className="h-28 bg-orange-100/60" />
              <div className="px-8 pb-8">
                <div className="w-24 h-24 rounded-3xl bg-gray-100 -mt-12 border-4 border-white" />
                <div className="h-5 w-1/3 bg-gray-100 rounded-full mt-4" />
                <div className="h-3 w-1/4 bg-gray-100 rounded-full mt-3" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
              ))}
            </div>
            <div className="h-40 bg-white rounded-[24px] border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full md:flex bg-[#FAF6F0] overflow-x-hidden">
        <DeveloperNavbar />
        <div className="w-full md:flex-1 md:min-w-0 flex items-center justify-center min-h-[calc(100vh-68px)] md:min-h-screen">
          <p className="text-gray-400 font-medium">Profile not found.</p>
        </div>
      </div>
    );
  }

  const initials = (formData.name || profile.name || "??")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const badgeCounts = badges.reduce((acc, b) => {
    acc[b.badge_key] = (acc[b.badge_key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Profile strength: how many of the key profile items are filled in.
  const strengthChecks = [
    { label: "Photo", done: !!profile.avatar_url },
    { label: "Bio", done: !!profile.bio },
    { label: "City", done: !!profile.city },
    { label: "Current role", done: !!profile.current_role },
    { label: "Skills", done: (profile.tech_stack?.length ?? 0) > 0 },
    { label: "Resume", done: !!profile.resume_url },
    { label: "GitHub", done: !!profile.github_username },
    { label: "LinkedIn", done: !!profile.linkedin_url },
    { label: "Verified score", done: profile.trust_score != null },
  ];
  const strengthDone = strengthChecks.filter((c) => c.done).length;
  const strength = Math.round((strengthDone / strengthChecks.length) * 100);
  const missing = strengthChecks.filter((c) => !c.done).map((c) => c.label);

  const hasPendingChanges = !!profile.pending_tech_stack || !!profile.pending_resume_url;

  // Verified before, and the 7-day lock is over: changes are allowed, but they
  // only go live once the next verification is completed.
  const windowOpen = profile.trust_score != null && !locked;

  return (
    <div className="min-h-screen w-full md:flex bg-[#FAF6F0] overflow-x-hidden">
      <DeveloperNavbar />
      <ConfirmModal state={confirm} onClose={() => setConfirm(CONFIRM_CLOSED)} />
      <ShareBadgeModal
        badge={sharedBadge}
        isOpen={Boolean(sharedBadge)}
        onClose={() => setSharedBadge(null)}
      />

      <div className="w-full md:flex-1 md:min-w-0 md:flex md:justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl md:mx-auto min-w-0">
          {/* ── Hero ── */}
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden mb-4">
            {/* Banner */}
            <div className="relative h-24 sm:h-28 bg-gradient-to-r from-[#F2754A] via-[#F59A6B] to-[#FFB347]">
              <div
                aria-hidden
                className="absolute -right-8 -top-10 w-44 h-44 rounded-full bg-white/10"
              />
              <div
                aria-hidden
                className="absolute right-24 -bottom-12 w-32 h-32 rounded-full bg-white/10"
              />
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white/95 text-[#F2754A] hover:bg-white transition-colors shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit profile
                </button>
              )}
              {isEditing && (
                <span className="absolute top-4 right-4 px-3.5 py-2 rounded-full text-xs font-bold bg-white/25 text-white">
                  Editing profile
                </span>
              )}
            </div>

            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              {/* Avatar overlapping the banner */}
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 -mt-10 sm:-mt-12 rounded-3xl border-4 border-white bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center overflow-hidden cursor-pointer group shadow-md"
                onClick={handlePhotoClick}
                title="Change profile photo"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name || "Profile photo"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-black text-2xl">{initials}</span>
                )}

                {avatarUploading ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {avatarError && (
                <p className="text-xs font-semibold text-[#D8452F] mt-2">{avatarError}</p>
              )}

              <div className="flex items-start justify-between gap-4 mt-4">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Name</label>
                        <input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={inputCls}
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">
                          Current role
                        </label>
                        <input
                          value={formData.current_role}
                          onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                          className={inputCls}
                          placeholder="e.g. Senior Frontend Engineer"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2
                        className="text-xl sm:text-2xl font-bold text-gray-900 truncate"
                        style={{ fontFamily: "var(--font-fraunces, serif)" }}
                      >
                        {profile.name || "Unnamed Developer"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {profile.current_role || "Developer"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3.5">
                        {profile.city && (
                          <Pill>
                            <MapPin className="w-3 h-3" />
                            {profile.city}
                          </Pill>
                        )}
                        {profile.years_experience != null && (
                          <Pill>
                            <Briefcase className="w-3 h-3" />
                            {profile.years_experience}y exp
                          </Pill>
                        )}
                        {profile.notice_period_days != null && (
                          <Pill>
                            <Clock className="w-3 h-3" />
                            {noticePeriodLabel(profile.notice_period_days)}
                          </Pill>
                        )}
                        <Pill>{jobStatusLabel(profile.job_status)}</Pill>
                        {profile.remote_ok && <Pill tone="orange">Remote OK</Pill>}
                        {streak && streak.current_streak_days > 0 && (
                          <Pill tone="orange">
                            <Flame className="w-3 h-3" />
                            {streak.current_streak_days}-day streak
                          </Pill>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {!isEditing && profile.trust_score != null && (
                  <ScoreRing score={profile.trust_score} />
                )}
              </div>

              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">City</label>
                    <CitySelect
                      mode="single"
                      value={formData.city}
                      onChange={(v) => setFormData({ ...formData, city: v as string })}
                      placeholder="Select city"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.years_experience || ""}
                      onWheel={preventWheelChange}
                      onChange={(e) =>
                        setFormData({ ...formData, years_experience: Number(e.target.value) })
                      }
                      className={inputCls}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Notice period (days)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.notice_period_days || ""}
                      onWheel={preventWheelChange}
                      onChange={(e) =>
                        setFormData({ ...formData, notice_period_days: Number(e.target.value) })
                      }
                      className={inputCls}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="mt-5 pt-5 border-t border-gray-50">
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Job search status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, job_status: opt.value })}
                        className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-colors ${
                          formData.job_status === opt.value
                            ? "bg-[#F2754A] text-white border-[#F2754A]"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Controls whether jobs show up in your feed and auto-apply.
                  </p>

                  <div className="flex items-center justify-between gap-4 mt-5 p-4 rounded-2xl bg-gray-50/70">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Open to remote roles</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Include remote jobs in your feed and auto-apply matches.
                      </p>
                    </div>
                    <Toggle
                      checked={formData.remote_ok}
                      onChange={() => setFormData({ ...formData, remote_ok: !formData.remote_ok })}
                      label="Toggle remote roles"
                    />
                  </div>
                </div>
              )}

              {isEditing ? (
                <div className="mt-5">
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className={inputCls + " resize-none"}
                    placeholder="Tell recruiters about yourself…"
                  />
                </div>
              ) : (
                profile.bio && (
                  <p className="text-sm text-gray-500 leading-relaxed mt-5 pt-5 border-t border-gray-50">
                    {profile.bio}
                  </p>
                )
              )}
            </div>
          </div>

          {/* ── Quick stats ── */}
          {!isEditing && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatTile
                icon={Shield}
                label="Antyl Score"
                value={profile.trust_score != null ? profile.trust_score : "–"}
                hint={profile.trust_score != null ? "out of 100" : "Not verified yet"}
              />
              <StatTile
                icon={Flame}
                label="Day streak"
                value={streak ? streak.current_streak_days : 0}
                hint={streak ? `Longest ${streak.longest_streak_days} days` : undefined}
              />
              <StatTile
                icon={Award}
                label="Badges"
                value={badges.length}
                hint={`${Object.keys(badgeCounts).length} unique`}
              />
              {autoApply ? (
                <StatTile
                  icon={Zap}
                  label="Auto-applied today"
                  value={`${autoApply.used}/${autoApply.limit}`}
                  hint={autoApply.is_enabled ? "Auto-apply is on" : "Auto-apply is off"}
                />
              ) : (
                <StatTile
                  icon={Briefcase}
                  label="Experience"
                  value={profile.years_experience ?? 0}
                  hint="years"
                />
              )}
            </div>
          )}

          {/* ── Profile strength ── */}
          {!isEditing && strength < 100 && (
            <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-7 mb-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Profile strength</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    A complete profile gets better matches and more recruiter views.
                  </p>
                </div>
                <span
                  className="text-2xl font-bold text-[#F2754A] tabular-nums"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {strength}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-orange-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F2754A] to-[#FFB347] transition-all duration-700"
                  style={{ width: `${strength}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs font-semibold text-gray-400">Still to add:</span>
                {missing.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ── Score history ── */}
          {history.length > 0 && (
            <SectionCard
              icon={TrendingUp}
              title="Score history"
              subtitle="How your Antyl Score has changed"
            >
              <ScoreHistoryChart data={history} />
            </SectionCard>
          )}

          {/* ── Tech stack (your own skills) ── */}
          {(isEditing || (profile.tech_stack && profile.tech_stack.length > 0)) && (
            <SectionCard
              icon={Code2}
              title="Tech stack"
              subtitle="Skills shown to recruiters"
              sectionRef={techStackSectionRef}
              highlight={isEditing && !locked && !!techStackError}
              action={
                locked ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-full px-2.5 py-1 flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    Locked · {lockLabel}
                  </span>
                ) : isEditing ? (
                  <span className="text-[11px] font-bold text-[#F2754A] bg-orange-50 rounded-full px-2.5 py-1 flex-shrink-0">
                    Required
                  </span>
                ) : undefined
              }
            >
              {locked && (
                <div className="flex items-start gap-3 mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      Your tech stack is locked
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Your Antyl Score is based on the skills you verified, so they can&apos;t change
                      between verifications. You can edit them again in {lockLabel}
                      {unlockDateLabel ? ` (on ${unlockDateLabel})` : ""}, when your next
                      verification opens.
                    </p>
                  </div>
                </div>
              )}

              {windowOpen && (
                <div className="flex items-start gap-3 mb-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
                  <div className="w-8 h-8 rounded-xl bg-white border border-orange-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-[#F2754A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      Your verification window is open
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Update your skills now, then{" "}
                      <a href="/verification" className="font-bold text-[#F2754A] hover:underline">
                        complete verification
                      </a>{" "}
                      to apply them and refresh your score. Until you finish, your current score and
                      skills stay as they are, and nothing is lost if you leave halfway.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.tech_stack : profile.tech_stack || []).map((tech) => (
                  <span
                    key={tech}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#D9582F] bg-orange-50 rounded-full px-3 py-1.5"
                  >
                    {tech}
                    {isEditing && !locked && (
                      <button
                        type="button"
                        onClick={() => removeSkill(tech)}
                        className="text-[#F2754A]/60 hover:text-[#E0533D]"
                        aria-label={`Remove ${tech}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && formData.tech_stack.length === 0 && (
                  <p className="text-xs text-gray-400">No skills added yet.</p>
                )}
              </div>

              {!isEditing && profile.pending_tech_stack && (
                <p className="text-xs text-gray-400 mt-3">
                  Pending: {profile.pending_tech_stack.join(", ")}. Applies after you complete
                  verification.
                </p>
              )}

              {isEditing && locked && (
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1 min-w-0">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      disabled
                      className={`${inputCls} pl-10 bg-gray-50 cursor-not-allowed`}
                      placeholder={`Adding skills opens in ${lockLabel}`}
                      aria-label="Adding skills is locked"
                    />
                  </div>
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 rounded-full text-sm font-bold bg-gray-100 text-gray-300 cursor-not-allowed flex-shrink-0 self-start"
                  >
                    Add
                  </button>
                </div>
              )}

              {isEditing && !locked && (
                <div className="flex gap-2 mt-4">
                  {/* Input + autocomplete dropdown */}
                  <div ref={skillBoxRef} className="relative flex-1 min-w-0">
                    <input
                      ref={skillInputRef}
                      value={skillInput}
                      onChange={(e) => {
                        setSkillInput(e.target.value);
                        setSkillActiveIndex(0);
                        setSkillDropdownOpen(true);
                      }}
                      onFocus={() => {
                        if (skillInput.trim()) setSkillDropdownOpen(true);
                      }}
                      onKeyDown={handleSkillKeyDown}
                      className={`${inputCls} ${
                        techStackError ? "!border-[#E0533D] focus:!ring-[#E0533D]/15" : ""
                      }`}
                      placeholder="Type a skill, e.g. Pyt → Python"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={skillDropdownOpen && skillOptions.length > 0}
                      aria-controls="skill-suggestions"
                      aria-autocomplete="list"
                      aria-invalid={!!techStackError}
                    />

                    {skillDropdownOpen && skillOptions.length > 0 && (
                      <ul
                        id="skill-suggestions"
                        role="listbox"
                        className="absolute left-0 right-0 top-full mt-2 z-20 max-h-64 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-lg py-1.5"
                      >
                        {skillOptions.map((opt, i) => {
                          const active = i === skillActiveIndex;
                          return (
                            <li
                              key={`${opt.custom ? "custom" : "skill"}-${opt.value}`}
                              role="option"
                              aria-selected={active}
                              // onMouseDown (not onClick) so the input doesn't blur first
                              onMouseDown={(e) => {
                                e.preventDefault();
                                addSkill(opt.value);
                              }}
                              onMouseEnter={() => setSkillActiveIndex(i)}
                              className={`flex items-center justify-between gap-3 px-3.5 py-2 mx-1.5 rounded-xl cursor-pointer text-sm transition-colors ${
                                active ? "bg-orange-50" : "bg-transparent"
                              } ${opt.custom ? "border-t border-gray-50 rounded-t-none" : ""}`}
                            >
                              {opt.custom ? (
                                <span className="flex items-center gap-2 min-w-0 text-gray-500">
                                  <Plus className="w-3.5 h-3.5 text-[#F2754A] flex-shrink-0" />
                                  <span className="truncate">
                                    Add{" "}
                                    <span className="font-bold text-gray-800">
                                      &ldquo;{opt.label}&rdquo;
                                    </span>{" "}
                                    as a custom skill
                                  </span>
                                </span>
                              ) : (
                                <span
                                  className={`font-semibold truncate ${
                                    active ? "text-[#D9582F]" : "text-gray-800"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                              )}
                              {active && !opt.custom && (
                                <span className="text-[10px] font-bold text-[#F2754A]/70 flex-shrink-0">
                                  Enter
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // If the dropdown has a highlighted suggestion, use it; otherwise add as typed.
                      if (skillOptions.length > 0) {
                        const picked = skillOptions[Math.min(skillActiveIndex, skillOptions.length - 1)];
                        addSkill(picked.value);
                      } else {
                        addSkill();
                      }
                    }}
                    className="px-5 py-2.5 rounded-full text-sm font-bold bg-orange-50 text-[#F2754A] hover:bg-orange-100 transition-colors flex-shrink-0 self-start"
                  >
                    Add
                  </button>
                </div>
              )}

              {isEditing && !locked && techStackError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 mt-3 text-xs font-semibold text-[#D8452F]"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                  <span>{techStackError}</span>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Verification ── */}
          <section className="rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm p-6 sm:p-7 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-orange-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#F2754A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  {profile.trust_score != null
                    ? `Antyl Score: ${profile.trust_score}/100`
                    : "Not verified yet"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasPendingChanges
                    ? "You have changes waiting. Complete verification to apply them."
                    : profile.trust_score != null
                    ? "Re-verify every 7 days to keep your score fresh"
                    : "Verify your skills to unlock matching and the leaderboard"}
                </p>
              </div>
              <a
                href="/verification"
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-sm shadow-orange-100"
              >
                {profile.trust_score != null ? "Re-verify" : "Start verification"}
              </a>
            </div>
          </section>

          {/* ── Auto-apply & match preferences (salary range lives here too) ── */}
          {autoApply && (
            <SectionCard
              icon={Zap}
              title="Auto-apply & match preferences"
              subtitle={`${autoApply.used}/${autoApply.limit} auto-applied today, resets midnight IST`}
              action={
                <Toggle
                  checked={autoApply.is_enabled}
                  onChange={handleToggleAutoApply}
                  disabled={autoApplyToggling}
                  label="Toggle auto-apply"
                />
              }
            >
              <div
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  autoApply.is_enabled ? "bg-orange-50" : "bg-gray-50"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    autoApply.is_enabled ? "bg-[#F2754A]" : "bg-gray-300"
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    autoApply.is_enabled ? "text-[#D9582F]" : "text-gray-500"
                  }`}
                >
                  {autoApply.is_enabled ? "Actively applying for you" : "Turned off"}
                </p>
              </div>

              {!isEditing ? (
                <>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* {matchPrefsSummary && matchPrefsSummary.minScore != null && (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                        Min match: {matchPrefsSummary.minScore}%
                      </span>
                    )} */}
                    {matchPrefsSummary?.jobTypes.map((t) => (
                      <Pill key={t}>{t.replace("_", " ")}</Pill>
                    ))}
                    {matchPrefsSummary?.locations.map((loc) => (
                      <Pill key={loc}>
                        <MapPin className="w-3 h-3" />
                        {loc}
                      </Pill>
                    ))}
                    {matchPrefsSummary &&
                      matchPrefsSummary.jobTypes.length === 0 &&
                      matchPrefsSummary.locations.length === 0 && (
                        <p className="text-xs text-gray-400">
                          No job type or location preferences set. Tap Edit profile to add some.
                        </p>
                      )}
                  </div>

                  {matchPrefsSummary && matchPrefsSummary.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchPrefsSummary.techStack.map((tech) => (
                        <span key={tech} className="text-xs font-semibold text-[#F2754A] bg-orange-50 rounded-full px-2.5 py-1">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {salaryRange && (
                    <div className="mt-4 p-4 rounded-2xl bg-gray-50/70">
                      <p className="text-xs font-semibold text-gray-400">Salary range</p>
                      <p className="text-base font-bold text-gray-800 mt-0.5">
                        {formatSalary(salaryRange.min)} – {formatSalary(salaryRange.max)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-5 pt-5 border-t border-gray-50 space-y-6">
                  {/* <div>
                    <EditSectionHeader
                      title={`Minimum match score (${autoApplyForm.min_similarity_score}%)`}
                      subtitle="Only apply to jobs scoring this or higher"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={autoApplyForm.min_similarity_score}
                      onChange={(e) =>
                        setAutoApplyForm({ ...autoApplyForm, min_similarity_score: Number(e.target.value) })
                      }
                      className="w-full accent-[#F2754A]"
                    />
                  </div> */}

                  {/* <div>
                    <EditSectionHeader title="Preferred tech stack to match" subtitle="Comma-separated — used to score job matches" />
                    <input
                      value={autoApplyForm.preferred_tech_stack}
                      onChange={(e) => setAutoApplyForm({ ...autoApplyForm, preferred_tech_stack: e.target.value })}
                      className={inputCls}
                      placeholder="Python, React, PostgreSQL"
                    />
                  </div> */}

                  <div>
                    <EditSectionHeader
                      title="Job type"
                      subtitle="Leave all unselected to match any job type"
                    />
                    <div className="flex flex-wrap gap-2">
                      {JOB_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleJobType(type)}
                          className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-colors capitalize ${
                            autoApplyForm.job_type.includes(type)
                              ? "bg-[#F2754A] text-white border-[#F2754A]"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <EditSectionHeader
                      title="Preferred locations"
                      subtitle="Remote jobs always match regardless of location"
                    />
                    <CitySelect
                      mode="multi"
                      value={autoApplyForm.preferred_locations}
                      onChange={(v) =>
                        setAutoApplyForm({ ...autoApplyForm, preferred_locations: v as string[] })
                      }
                      placeholder="Select cities"
                    />
                  </div>

                  <div>
                    <EditSectionHeader
                      title="Salary range"
                      subtitle="Only apply to jobs within this range — eg: ₹15 LPA"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                          Minimum
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold select-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={autoApplyForm.salary_min || ""}
                            onWheel={preventWheelChange}
                            onChange={(e) =>
                              setAutoApplyForm({ ...autoApplyForm, salary_min: Number(e.target.value) })
                            }
                            placeholder="0"
                            className={inputCls + " pl-8"}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                          Maximum
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold select-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={autoApplyForm.salary_max || ""}
                            onWheel={preventWheelChange}
                            onChange={(e) =>
                              setAutoApplyForm({ ...autoApplyForm, salary_max: Number(e.target.value) })
                            }
                            placeholder="0"
                            className={inputCls + " pl-8"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Streak & Badges ── */}
          {(streak || badges.length > 0) && (
            <SectionCard icon={Award} title="Streak & badges" subtitle="Tap a badge to share it">
              {streak && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/70 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-[#F2754A]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {streak.current_streak_days} day{streak.current_streak_days === 1 ? "" : "s"}{" "}
                      streak
                    </p>
                    <p className="text-xs text-gray-500">
                      Longest: {streak.longest_streak_days} days · {streak.days_to_week_bonus} days
                      to next bonus
                    </p>
                  </div>
                </div>
              )}

              {badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(badgeCounts).map(([key, count]) => {
                    const meta = badgeCatalog[key];
                    if (!meta) return null;

                    const badgeRecord = badges.find((b) => b.badge_key === key);
                    const rank = resolveBadgeRank(
                      badgeRecord?.metadata as Record<string, unknown> | undefined
                    );
                    const fieldLabel = resolveBadgeFieldLabel(
                      badgeRecord?.metadata as Record<string, unknown> | undefined
                    );

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setSharedBadge({
                            badgeKey: key,
                            label: meta.label,
                            description: meta.description,
                            image: meta.image,
                            color: meta.color,
                            rank,
                            fieldLabel,
                          })
                        }
                        className="group relative flex flex-col items-center text-center gap-2 rounded-2xl border border-gray-100 p-3 transition-transform hover:-translate-y-0.5 hover:shadow-sm"
                        style={{ backgroundColor: `${meta.color}14` }}
                      >
                        <div className="absolute right-2 top-2 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 scale-90">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#F2754A] shadow-sm">
                            <Share2 className="h-3 w-3" />
                          </span>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white/60">
                          <img src={meta.image} alt={meta.label} className="h-full w-full object-contain" />
                        </div>
                        <div className="w-full">
                          <p className="text-xs font-bold text-gray-800">{meta.label}</p>
                          {count > 1 && <p className="text-[10px] text-gray-400">×{count}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No badges yet - keep your streak going!</p>
              )}
            </SectionCard>
          )}

          {/* ── Resume ── */}
          <SectionCard
            icon={FileText}
            title="Resume"
            subtitle={profile.resume_url ? "Parsed from your uploaded file" : "PDF or DOCX, up to 100kb"}
            action={
              <div className="flex items-center gap-2 flex-shrink-0">
                {profile.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F2754A] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleResumeClick}
                  disabled={resumeUploading || locked}
                  title={locked ? `Locked for ${lockLabel}` : undefined}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {locked ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {locked
                    ? `Locked · ${lockLabel}`
                    : resumeUploading
                    ? "Uploading…"
                    : profile.resume_url
                    ? "Reupload"
                    : "Upload"}
                </button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </div>
            }
          >
            {locked && (
              <div className="flex items-start gap-3 mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800">Resume uploads are locked</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Your score is based on the resume you verified with. You can upload a new one in{" "}
                    {lockLabel}
                    {unlockDateLabel ? ` (on ${unlockDateLabel})` : ""}, when your next
                    verification opens.
                  </p>
                </div>
              </div>
            )}

            {windowOpen && !profile.pending_resume_url && (
              <p className="flex items-start gap-2 text-xs text-gray-500 bg-orange-50 rounded-2xl px-3.5 py-2.5 mb-4 leading-relaxed">
                <Info className="w-4 h-4 text-[#F2754A] flex-shrink-0 mt-px" />
                <span>
                  A new resume is applied only after you complete verification. Until then your
                  current resume and score stay as they are.
                </span>
              </p>
            )}

            {resumeError && (
              <p className="text-xs font-semibold text-[#D8452F] mb-4">{resumeError}</p>
            )}

            {profile.pending_resume_url && (
              <p className="text-xs font-semibold text-[#D9582F] bg-orange-50 rounded-2xl px-3.5 py-2.5 mb-4">
                New resume uploaded. It replaces your current one once you complete verification.
              </p>
            )}

            {profile.resume_parsed_data ? (
              <>
                {profile.resume_parsed_data.work_history &&
                  profile.resume_parsed_data.work_history.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-gray-500 mb-3">Experience</p>
                      <div className="space-y-2.5">
                        {profile.resume_parsed_data.work_history.map((job, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/70"
                          >
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900">{job.role}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {job.company} · {job.duration}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {profile.resume_parsed_data.education &&
                  profile.resume_parsed_data.education.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3">Education</p>
                      <div className="space-y-2.5">
                        {profile.resume_parsed_data.education.map((edu, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/70"
                          >
                            <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900">{edu.degree}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {edu.institution} · {edu.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <p className="text-xs text-gray-400">No resume uploaded yet.</p>
            )}
          </SectionCard>

          {/* ── Links ── */}
          <SectionCard icon={Link2} title="Links" subtitle="Where recruiters can find you">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50/70">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <GitHubIcon className="w-4 h-4 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">GitHub</p>
                    <GitHubLink username={profile.github_username || undefined} />
                  </div>
                </div>

                {profile.github_username ? (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirm({
                        open: true,
                        title: "Disconnect GitHub?",
                        description:
                          "Your repositories will no longer be used for verification. Your existing Antyl Score stays as-is until you next re-verify.",
                        cta: "Disconnect",
                        danger: true,
                        onConfirm: handleDisconnectGithub,
                      })
                    }
                    className="text-xs font-bold text-[#D8452F] bg-[#E0533D]/10 hover:bg-[#E0533D]/20 px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                  >
                    Disconnect
                  </button>
                ) : (
                  <a
                    href="/onboarding/github"
                    className="text-xs font-bold text-[#F2754A] hover:underline flex-shrink-0"
                  >
                    Connect →
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/70">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400">LinkedIn</p>
                  {isEditing ? (
                    <input
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className={inputCls + " mt-1"}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  ) : (
                    <LinkedInLink url={profile.linkedin_url} />
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Unified save/cancel bar — appears once, covers every section above ── */}
          {isEditing && (
            <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur rounded-[24px] border border-gray-100 shadow-lg p-4 sm:p-5 mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#F2754A] text-white hover:bg-[#e0623a] disabled:opacity-50 transition-colors shadow-md shadow-orange-100"
              >
                {saving ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              {saveError && (
                <span className="text-xs font-semibold text-[#D8452F] ml-1">{saveError}</span>
              )}
            </div>
          )}

          {/* ── Danger zone (collapsible) ── */}
          <div className="bg-white rounded-[24px] border border-[#E0533D]/20 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setDangerZoneOpen((v) => !v)}
              aria-expanded={dangerZoneOpen}
              className="w-full flex items-center justify-between gap-2 p-6 sm:p-7 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E0533D]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#E0533D]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#D8452F]">Danger zone</p>
                  <p className="text-xs text-gray-400">Account deletion</p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#E0533D]/60 transition-transform duration-200 flex-shrink-0 ${
                  dangerZoneOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                dangerZoneOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2 border-t border-[#E0533D]/10">
                  <div className="flex items-center justify-between gap-4 mt-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Delete account</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Permanently removes your profile and all data.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          open: true,
                          title: "Delete account?",
                          description:
                            "This action cannot be undone. Your profile, score, and all data will be permanently erased.",
                          cta: "Delete account",
                          danger: true,
                          onConfirm: handleDeleteAccount,
                        })
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-[#D8452F] bg-[#E0533D]/10 hover:bg-[#E0533D]/20 px-3.5 py-2 rounded-full transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}