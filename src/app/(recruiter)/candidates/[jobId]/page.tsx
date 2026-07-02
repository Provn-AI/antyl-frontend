"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  getJobCandidates,
  saveCandidateNote,
} from "@/services/recruiter-job.service";
import { updateCandidateStatus } from "@/services/update-candidate.service";
import {
  MapPin,
  Briefcase,
  Zap,
  MousePointer,
  ChevronRight,
  X,
  FileText,
  GraduationCap,
  Building2,
  SlidersHorizontal,
  CheckCircle,
  SkipForward,
  StickyNote,
} from "lucide-react";

interface Candidate {
  application_id: string;
  developer_id: string;
  name: string;
  current_role: string;
  city?: string;
  bio?: string;
  trust_score: number;
  years_experience?: number;
  tech_stack?: string[];
  resume_url?: string | null;
  resume_parsed_data?: {
    education?: { degree: string; institution: string }[];
    work_history?: { role: string; company: string; duration: string }[];
  };
  similarity_score: number;
  status: string;
  applied_via: string;
  applied_at: string;
  note?: string | null;
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const radius = size / 2 - 4;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#F2754A" :
    score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="3.5" className="fill-none stroke-gray-100" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth="3.5"
          fill="none" stroke={color} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-gray-900">{score}</span>
      </div>
    </div>
  );
}

// ── Match bar ─────────────────────────────────────────────────────────────────
function MatchBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#F2754A" :
    score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  sent:      { label: "Applied",   color: "text-gray-500",    bg: "bg-gray-100"   },
  viewed:    { label: "Viewed",    color: "text-blue-600",    bg: "bg-blue-50"    },
  matched:   { label: "Matched",   color: "text-emerald-600", bg: "bg-emerald-50" },
  interview: { label: "Interview", color: "text-violet-600",  bg: "bg-violet-50"  },
  rejected:  { label: "Rejected",  color: "text-red-500",     bg: "bg-red-50"     },
};

// ── Drawer section ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // EN-013: resume now opens in a same-page modal (iframe) instead of a new
  // browser tab (target="_blank"). This URL drives that modal — it can be
  // opened either straight from the candidate list card or from inside the
  // candidate drawer.
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // BUG-FIX: skip now persists to the backend (status -> "rejected") instead
  // of only removing the candidate from local state. This toast lets the
  // recruiter undo an accidental skip within a short window.
  const [skippedCandidate, setSkippedCandidate] = useState<Candidate | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // BUG-FIX: success animation shown when a candidate is marked "Interested"
  // before the drawer closes, so it's visually clear they moved to the pipeline.
  const [matchSuccessName, setMatchSuccessName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobCandidates(jobId);
        setCandidates(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId]);

  const filtered = candidates.filter((c) => c.trust_score >= minScore);

  const handleSaveNote = async () => {
    if (!selected) return;
    setNoteSaving(true);
    try {
      await saveCandidateNote(selected.developer_id, jobId, note);
      setNoteSaved(true);

      // BUG-FIX: reflect the saved note back into list + drawer immediately
      // instead of waiting for a refetch, so the preview on the card updates.
      setCandidates((prev) =>
        prev.map((c) =>
          c.application_id === selected.application_id ? { ...c, note } : c
        )
      );
      setSelected((prev) => (prev ? { ...prev, note } : prev));

      setTimeout(() => setNoteSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setNoteSaving(false);
    }
  };

  // BUG-FIX: skip now persists via updateCandidateStatus instead of only
  // updating local state, which is why skipped candidates were reappearing
  // after a refresh. Also stores the original candidate so it can be undone.
  const handleSkip = async () => {
    if (!selected) return;
    const candidate = selected; // keep original status/data for undo
    setSelected(null);
    setCandidates((prev) => prev.filter((c) => c.application_id !== candidate.application_id));

    try {
      await updateCandidateStatus(candidate.application_id, "rejected");
    } catch (err) {
      console.error(err);
      // rollback the optimistic removal if the API call failed
      setCandidates((prev) => [candidate, ...prev]);
      return;
    }

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setSkippedCandidate(candidate);
    undoTimerRef.current = setTimeout(() => setSkippedCandidate(null), 5000);
  };

  const handleUndoSkip = async () => {
    if (!skippedCandidate) return;
    const candidate = skippedCandidate;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setSkippedCandidate(null);

    try {
      await updateCandidateStatus(candidate.application_id, candidate.status);
      setCandidates((prev) => [candidate, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading candidates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">

        {/* Logo */}
        <h1
          className="text-2xl font-bold mb-10"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Candidates</h2>
            <p className="text-sm text-gray-400 mt-1">
              {filtered.length} of {candidates.length} shown
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-colors ${
              showFilters
                ? "bg-[#F2754A] text-white border-[#F2754A] shadow-md shadow-orange-100"
                : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {minScore > 0 && (
              <span className="w-2 h-2 rounded-full bg-white/60" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Minimum Antyl Score</p>
              <span className="text-sm font-black text-[#F2754A]">{minScore}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${minScore}%`,
                  background: "linear-gradient(90deg, #F2754A, #FFB347)",
                }}
              />
            </div>
            <input
              type="range" min={0} max={100} value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full opacity-0 h-0"
              style={{ marginTop: -6 }}
            />
            {/* visible range input layered */}
            <input
              type="range" min={0} max={100} value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-[#F2754A] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-300 font-semibold mt-1">
              <span>0</span><span>100</span>
            </div>
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">No candidates match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const status = STATUS[c.status] ?? STATUS.sent;
              return (
                // NOTE: switched from <button> to <div role="button"> here so
                // we can nest the resume icon <button> inside without invalid
                // button-in-button HTML. Keyboard accessibility (Enter/Space)
                // is preserved via onKeyDown.
                <div
                  key={c.application_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setSelected(c); setNote(c.note ?? ""); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(c);
                      setNote(c.note ?? "");
                    }
                  }}
                  className="w-full text-left bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6 hover:border-[#F2754A] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-100">
                      <span className="text-white font-black text-sm">
                        {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{c.name}</p>

                        {/* EN-013: resume icon button next to the name — only
                            rendered when a resume exists, hidden otherwise. */}
                        {c.resume_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setResumeUrl(c.resume_url!);
                            }}
                            title="View resume"
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0 text-[11px] font-bold"
                          >
                            <FileText className="w-3 h-3" />
                            View resume
                          </button>
                        )}

                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{c.current_role}</p>

                      <div className="mt-2.5">
                        <MatchBar score={c.similarity_score} />
                      </div>

                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {c.city && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <MapPin className="w-3 h-3" />{c.city}
                          </span>
                        )}
                        {c.years_experience != null && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                            <Briefcase className="w-3 h-3" />{c.years_experience}y
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                          {c.applied_via === "auto" ? <Zap className="w-3 h-3 text-[#F2754A]" /> : <MousePointer className="w-3 h-3" />}
                          {c.applied_via === "auto" ? "Auto" : "Manual"}
                        </span>
                      </div>

                      {/* BUG-FIX: small note preview on the card, only shown
                          when a note exists for this candidate. */}
                      {c.note && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 italic truncate">
                          <StickyNote className="w-3 h-3 flex-shrink-0" />
                          {c.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ScoreRing score={c.trust_score} />
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F2754A] transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Candidate drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full sm:w-[480px] h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-l-[32px] shadow-2xl flex flex-col overflow-hidden">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Candidate profile
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Hero */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-100">
                  <span className="text-white font-black text-lg">
                    {selected.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{selected.current_role}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.city && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                        <MapPin className="w-3 h-3" />{selected.city}
                      </span>
                    )}
                    {selected.years_experience != null && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                        <Briefcase className="w-3 h-3" />{selected.years_experience}y exp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Antyl Score</p>
                  <p className="text-3xl font-black text-[#F2754A]">{selected.trust_score}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Match</p>
                  <p className="text-3xl font-black text-gray-900">{selected.similarity_score}%</p>
                </div>
              </div>

              {/* Bio */}
              {selected.bio && (
                <Section title="About">
                  <p className="text-sm text-gray-600 leading-relaxed">{selected.bio}</p>
                </Section>
              )}

              {/* Tech stack */}
              {selected.tech_stack && selected.tech_stack.length > 0 && (
                <Section title="Tech stack">
                  <div className="flex flex-wrap gap-2">
                    {selected.tech_stack.map((skill) => (
                      <span key={skill} className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Education */}
              {selected.resume_parsed_data?.education?.length ? (
                <Section title="Education">
                  <div className="space-y-3">
                    {selected.resume_parsed_data.education.map((edu, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{edu.degree}</p>
                          <p className="text-xs text-gray-400">{edu.institution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              {/* Work history */}
              {selected.resume_parsed_data?.work_history?.length ? (
                <Section title="Work history">
                  <div className="space-y-3">
                    {selected.resume_parsed_data.work_history.map((work, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{work.role}</p>
                          <p className="text-xs text-gray-500">{work.company}</p>
                          <p className="text-xs text-gray-400">{work.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              {/* Resume — EN-013: opens the same-page modal instead of
                  navigating to a new browser tab. */}
              {selected.resume_url && (
                <Section title="Resume">
                  <button
                    type="button"
                    onClick={() => setResumeUrl(selected.resume_url!)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#F2754A] hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View resume
                  </button>
                </Section>
              )}

              {/* Notes */}
              <Section title="Recruiter notes">
                <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Internal notes about this candidate…"
                    className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-gray-800 placeholder:text-gray-300 outline-none resize-none"
                  />
                  <div className="flex justify-end px-3 pb-3">
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      disabled={noteSaving || !note.trim()}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 ${
                        noteSaved
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-[#F2754A] text-white hover:bg-[#e0623a]"
                      }`}
                    >
                      {noteSaved ? "✓ Saved" : noteSaving ? "Saving…" : "Save note"}
                    </button>
                  </div>
                </div>
              </Section>
            </div>

            {/* Drawer footer */}
            <div className="flex gap-3 px-6 py-5 border-t border-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!selected) return;
                  const candidateName = selected.name;
                  try {
                    await updateCandidateStatus(selected.application_id, "matched");
                    // BUG-FIX: play the success animation over the drawer
                    // first, then close + refetch once it's done.
                    setMatchSuccessName(candidateName);
                    setTimeout(async () => {
                      setMatchSuccessName(null);
                      setSelected(null);
                      const data = await getJobCandidates(jobId);
                      setCandidates(data);
                    }, 1300);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
              >
                <CheckCircle className="w-4 h-4" />
                Interested
              </button>
            </div>

            {/* BUG-FIX: success animation overlay — covers just the drawer
                (not the whole screen) so it reads as "this candidate moved
                to your pipeline" rather than a generic full-page state. */}
            {matchSuccessName && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm">
                <div className="match-success-ring w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path
                      d="M10 21l6 6 14-14"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="match-success-check"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">Moved to your pipeline</p>
                  <p className="text-sm text-gray-400 mt-0.5">{matchSuccessName} is now in Matched</p>
                </div>
                <style jsx>{`
                  .match-success-ring {
                    animation: match-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                  }
                  .match-success-check {
                    stroke-dasharray: 30;
                    stroke-dashoffset: 30;
                    animation: match-draw 0.4s 0.15s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                  }
                  @keyframes match-pop {
                    0% { transform: scale(0.4); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                  @keyframes match-draw {
                    to { stroke-dashoffset: 0; }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Resume modal (EN-013) ──
          Renders the resume inline via an iframe on top of everything else
          (including the drawer, hence z-[60]) instead of opening a new tab. */}
      {resumeUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={() => setResumeUrl(null)}
        >
          <div
            className="relative w-full max-w-3xl h-[85vh] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 flex-shrink-0">
              <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FileText className="w-4 h-4 text-[#F2754A]" />
                Resume
              </p>
              <button
                type="button"
                onClick={() => setResumeUrl(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <iframe
              src={resumeUrl}
              title="Candidate resume"
              className="flex-1 w-full border-0"
            />
          </div>
        </div>
      )}

      {/* ── Undo-skip toast ──
          BUG-FIX: gives the recruiter a way to reverse an accidental skip.
          Auto-dismisses after 5s (see undoTimerRef in handleSkip). */}
      {skippedCandidate && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-4 bg-gray-900 text-white rounded-full pl-5 pr-2 py-2.5 shadow-2xl">
          <span className="text-sm font-semibold">
            Skipped {skippedCandidate.name}
          </span>
          <button
            type="button"
            onClick={handleUndoSkip}
            className="text-sm font-bold text-[#F2754A] hover:text-[#ff8a5e] px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => {
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
              setSkippedCandidate(null);
            }}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}