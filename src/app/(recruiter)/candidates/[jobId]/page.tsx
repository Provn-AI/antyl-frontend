"use client";

import { useEffect, useState } from "react";
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
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleSkip = () => {
    if (!selected) return;
    setCandidates((prev) => prev.filter((c) => c.application_id !== selected.application_id));
    setSelected(null);
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
                <button
                  key={c.application_id}
                  type="button"
                  onClick={() => { setSelected(c); setNote(""); }}
                  className="w-full text-left bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 sm:p-6 hover:border-[#F2754A] transition-all group"
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
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ScoreRing score={c.trust_score} />
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F2754A] transition-colors" />
                    </div>
                  </div>
                </button>
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

              {/* Resume */}
              {selected.resume_url && (
                <Section title="Resume">
                  <a
                    href={selected.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#F2754A] hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View resume
                  </a>
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
                  try {
                    await updateCandidateStatus(selected.application_id, "matched");
                    setSelected(null);
                    const data = await getJobCandidates(jobId);
                    setCandidates(data);
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
          </div>
        </div>
      )}
    </div>
  );
}