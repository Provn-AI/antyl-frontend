"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Briefcase,
  Trash2,
  ExternalLink,
  Shield,
  AlertTriangle,
  Code2,
  Pencil,
  Save,
  X,
  FileText,
  Flame,
  Zap,
  ChevronDown,
  Upload,
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
  AutoApplyStatus,
} from "@/services/developer.service";
import { getMyBadges, Badge, BadgeCatalogEntry } from "@/services/badge.service";
import { getMyStreak, StreakSummary } from "@/services/streak.service";
import ScoreHistoryChart from "@/components/verification/ScoreHistoryChart";
import DeveloperNavbar from "../components/DeveloperNavbar";
import { BadgeIcon } from "../components/BadgeIcon";
import CitySelect from "@/components/citySelect";


// ── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  name?: string;
  bio?: string;
  city?: string;
  current_role?: string;
  years_experience?: number;
  tech_stack?: string[];
  trust_score?: number;
  github_username?: string;
  linkedin_url?: string;
  resume_url?: string;
  avatar_url?: string;
  job_status?: string;
  remote_ok?: boolean;
  resume_parsed_data?: {
    work_history?: { company: string; role: string; duration: string }[];
    education?: { degree: string; institution: string; year: string }[];
  };
}

interface SalaryRange {
  min: number;
  max: number;
}

const JOB_STATUS_OPTIONS = [
  { value: "actively_looking", label: "Actively looking" },
  // { value: "open_to_opportunities", label: "Open to opportunities" },
  { value: "not_looking", label: "Not looking" },
];

function jobStatusLabel(value: string | undefined) {
  return JOB_STATUS_OPTIONS.find((o) => o.value === value)?.label || "Not set";
}

function formatSalary(n: number) {
  return `₹${n.toLocaleString("en-IN")} LPA`;
}

// ── Mini score ring ───────────────────────────────────────────────────────────

function MiniScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} strokeWidth="5" className="fill-none stroke-orange-100" />
        <circle
          cx="32" cy="32" r={radius} strokeWidth="5"
          fill="none" stroke="url(#miniGrad)" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F2754A" />
            <stop offset="100%" stopColor="#FFB347" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-gray-900">{score}</span>
      </div>
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
  open: false, title: "", description: "", cta: "",
  onConfirm: async () => {},
};

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[24px] border border-gray-100 shadow-xl p-6">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${state.danger ? "bg-red-50" : "bg-orange-50"}`}>
          <AlertTriangle className={`w-5 h-5 ${state.danger ? "text-red-500" : "text-[#F2754A]"}`} />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{state.title}</h3>
        <p className="text-sm text-gray-400 mb-6">{state.description}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button type="button" disabled={busy}
            onClick={async () => { setBusy(true); try { await state.onConfirm(); } finally { setBusy(false); onClose(); } }}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold text-white transition-colors disabled:opacity-50 ${state.danger ? "bg-red-500 hover:bg-red-600" : "bg-[#F2754A] hover:bg-[#e0623a]"}`}>
            {busy ? "…" : state.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LinkedIn link ─────────────────────────────────────────────────────────────

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

// ── Input style ───────────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#F2754A] transition-colors bg-white";

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
  });

  // Text box for adding a new skill to the tech stack while editing.
  const [skillInput, setSkillInput] = useState("");

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [autoApply, setAutoApply] = useState<AutoApplyStatus | null>(null);
  const [autoApplyToggling, setAutoApplyToggling] = useState(false);
  const [salaryRange, setSalaryRange] = useState<SalaryRange | null>(null);

  // Danger zone starts collapsed so destructive actions aren't front-and-center.
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);

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
          tech_stack: profileData.tech_stack || [],
          remote_ok: profileData.remote_ok || false,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
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
      } catch (error) {
        console.error(error);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
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
        tech_stack: profile.tech_stack || [],
        remote_ok: profile.remote_ok || false,
      });
    }
    setSkillInput("");
    setIsEditing(false);
  };

  const handleDisconnectGithub = async () => {
    await disconnectGithub();
    setProfile((p) => p ? { ...p, github_username: undefined } : p);
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
    if (resumeUploading) return;
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
      // upload_resume awaits parsing before returning, so the profile's
      // resume_parsed_data / resume_url should already be up to date
      const refreshed = await getMyProfile();
      setProfile(refreshed);
    } catch (error) {
      console.error(error);
      setResumeError("Upload failed. Try again.");
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

  // Adds the current skillInput to formData.tech_stack (case-insensitive dedupe).
  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (formData.tech_stack.some((t) => t.toLowerCase() === skill.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setFormData({ ...formData, tech_stack: [...formData.tech_stack, skill] });
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((t) => t !== skill),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <p className="text-gray-400 font-medium">Profile not found.</p>
        </div>
      </div>
    );
  }

  const initials = (formData.name || profile.name || "??")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const badgeCounts = badges.reduce((acc, b) => {
    acc[b.badge_key] = (acc[b.badge_key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0]">
      <DeveloperNavbar />
      <ConfirmModal state={confirm} onClose={() => setConfirm(CONFIRM_CLOSED)} />

      <div className="px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">

          {/* ── Hero card ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-100 relative overflow-hidden cursor-pointer group"
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
                  <span className="text-white font-black text-lg">{initials}</span>
                )}

                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  </div>
                )}

                {!avatarUploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Pencil className="w-4 h-4 text-white" />
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

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="mb-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Name</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputCls}
                      placeholder="Your name"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {profile.name || "Unnamed Developer"}
                  </h2>
                )}

                {isEditing ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Current role</label>
                    <input
                      value={formData.current_role}
                      onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {profile.current_role || "Developer"}
                  </p>
                )}

                {!isEditing && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.city && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                        <MapPin className="w-3 h-3" />{profile.city}
                      </span>
                    )}
                    {profile.years_experience != null && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                        <Briefcase className="w-3 h-3" />{profile.years_experience}y exp
                      </span>
                    )}
                    {streak && streak.current_streak_days > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#F2754A] bg-orange-50 rounded-full px-2.5 py-1">
                        <Flame className="w-3 h-3" />
                        {streak.current_streak_days}-day streak
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                      {jobStatusLabel(profile.job_status)}
                    </span>
                    {profile.remote_ok && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#F2754A] bg-orange-50 rounded-full px-2.5 py-1">
                        Remote OK
                      </span>
                    )}
                  </div>
                )}

                {isEditing && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Experience (years)</label>
                      <input
                        type="number"
                        value={formData.years_experience || ""}
                        onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                        className={inputCls}
                        placeholder="3"
                      />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Job search status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {JOB_STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, job_status: opt.value })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                            formData.job_status === opt.value
                              ? "bg-[#F2754A] text-white border-[#F2754A]"
                              : "bg-white text-gray-500 border-gray-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Controls whether jobs show up in your feed and auto-apply.
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Open to remote roles</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Include remote jobs in your feed and auto-apply matches.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, remote_ok: !formData.remote_ok })}
                        role="switch"
                        aria-checked={formData.remote_ok}
                        aria-label="Toggle remote roles"
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                          formData.remote_ok ? "bg-[#F2754A]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                            formData.remote_ok ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && profile.trust_score != null && (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <MiniScoreRing score={profile.trust_score} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                </div>
              )}
            </div>

            {avatarError && (
              <p className="text-xs font-semibold text-red-500 mt-3">{avatarError}</p>
            )}

            {isEditing ? (
              <div className="mt-4">
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

            <div className="flex gap-2 mt-5 pt-5 border-t border-gray-50">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-orange-50 text-[#F2754A] hover:bg-orange-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#F2754A] text-white hover:bg-[#e0623a] disabled:opacity-50 transition-colors shadow-md shadow-orange-100"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Score history ── */}
          {history.length > 0 && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Score history
              </p>
              <ScoreHistoryChart data={history} />
            </div>
          )}

          {/* ── Tech stack ── */}
          {(isEditing || (profile.tech_stack && profile.tech_stack.length > 0)) && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Tech stack
              </p>

              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.tech_stack : profile.tech_stack || []).map((tech) => (
                  <span
                    key={tech}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5"
                  >
                    {tech}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(tech)}
                        className="text-gray-400 hover:text-red-500"
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

              {isEditing && (
                <div className="flex gap-2 mt-4">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className={inputCls}
                    placeholder="e.g. Rust, Kubernetes, GraphQL"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2.5 rounded-full text-sm font-bold bg-orange-50 text-[#F2754A] hover:bg-orange-100 transition-colors flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Verification ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Verification
            </p>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#F2754A]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">
                  {profile.trust_score != null
                    ? `Antyl Score: ${profile.trust_score}/100`
                    : "Not verified yet"}
                </p>
                <p className="text-xs text-gray-400">
                  {profile.trust_score != null
                    ? "Re-verify every 7 days to keep your score fresh"
                    : "Verify your skills to unlock matching and the leaderboard"}
                </p>
              </div>
            </div>

            <a href="/verification"
              className="inline-block mt-4 text-xs font-bold text-[#F2754A] hover:underline"
            >
              {profile.trust_score != null ? "Re-verify →" : "Start verification →"}
            </a>
          </div>

          {/* ── Auto-apply ── */}
          {autoApply && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Auto-apply
                </p>
                <button
                  type="button"
                  onClick={handleToggleAutoApply}
                  disabled={autoApplyToggling}
                  role="switch"
                  aria-checked={autoApply.is_enabled}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                    autoApply.is_enabled ? "bg-[#F2754A]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      autoApply.is_enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#F2754A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {autoApply.is_enabled ? "Actively applying for you" : "Turned off"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {autoApply.used}/{autoApply.limit} auto-applied today · resets midnight IST
                  </p>
                </div>
              </div>

              {salaryRange && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Salary range</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">
                      {formatSalary(salaryRange.min)} – {formatSalary(salaryRange.max)}
                    </p>
                  </div>
                  <a
                    href="/settings/auto-apply"
                    aria-label="Edit salary range"
                    title="Edit salary range"
                    className="w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-[#F2754A] transition-colors flex-shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <a
                href="/settings/auto-apply"
                className="inline-block mt-4 text-xs font-bold text-[#F2754A] hover:underline"
              >
                Edit match preferences →
              </a>
            </div>
          )}

          {/* ── Streak & Badges ── */}
          {(streak || badges.length > 0) && (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Streak & Badges
              </p>

              {streak && (
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-50">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-[#F2754A]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {streak.current_streak_days} day{streak.current_streak_days === 1 ? "" : "s"} streak
                    </p>
                    <p className="text-xs text-gray-400">
                      Longest: {streak.longest_streak_days} days · {streak.days_to_week_bonus} days to next bonus
                    </p>
                  </div>
                </div>
              )}

              {badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(badgeCounts).map(([key, count]) => {
                    const meta = badgeCatalog[key];
                    if (!meta) return null;
                    return (
                      <div key={key} className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl bg-gray-50">
                        <div className="w-14 h-14 flex items-center justify-center">
                          <img
                            src={meta.image}
                            alt={meta.label}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-800">{meta.label}</p>
                        {count > 1 && <p className="text-[10px] text-gray-400">×{count}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No badges yet - keep your streak going!</p>
              )}
            </div>
          )}

          {/* ── Resume ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Resume
              </p>
              <div className="flex items-center gap-2">
                {profile.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F2754A] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View PDF
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleResumeClick}
                  disabled={resumeUploading}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {resumeUploading ? "Uploading…" : profile.resume_url ? "Reupload" : "Upload resume"}
                </button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </div>
            </div>

            {resumeError && (
              <p className="text-xs font-semibold text-red-500 mb-4">{resumeError}</p>
            )}

            {profile.resume_parsed_data ? (
              <>
                {profile.resume_parsed_data.work_history && profile.resume_parsed_data.work_history.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                      Experience
                    </p>
                    <div className="space-y-3">
                      {profile.resume_parsed_data.work_history.map((job, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{job.role}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{job.company} · {job.duration}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.resume_parsed_data.education && profile.resume_parsed_data.education.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                      Education
                    </p>
                    <div className="space-y-3">
                      {profile.resume_parsed_data.education.map((edu, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{edu.degree}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{edu.institution} · {edu.year}</p>
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
          </div>

          {/* ── Links ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Links
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                    <GitHubIcon className="w-4 h-4 text-black" />
                  </div>
                  <div>
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
                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <a href="/onboarding/github"
                    className="text-xs font-bold text-[#F2754A] hover:underline"
                  >
                    Connect →
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                    <LinkedInIcon className="w-4 h-4 text-[#0A66C2]" />
                  </div>
                  <div className="flex-1">
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
            </div>
          </div>

          {/* ── Danger zone (collapsible) ── */}
          <div className="bg-white rounded-[24px] border border-red-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setDangerZoneOpen((v) => !v)}
              aria-expanded={dangerZoneOpen}
              className="w-full flex items-center justify-between gap-2 p-6 sm:p-8 text-left"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                </div>
                <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                  Danger zone
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-red-300 transition-transform duration-200 flex-shrink-0 ${
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
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-red-50">
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Delete account</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Permanently removes your profile and all data.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirm({
                        open: true,
                        title: "Delete account?",
                        description: "This action cannot be undone. Your profile, score, and all data will be permanently erased.",
                        cta: "Delete account",
                        danger: true,
                        onConfirm: handleDeleteAccount,
                      })}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full transition-colors flex-shrink-0"
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