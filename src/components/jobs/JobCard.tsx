"use client";

import { useState } from "react";
import { Heart, MapPin, Briefcase, X, Check, Building2, AlignCenter } from "lucide-react";

import JobDetailModal from "./JobDetailModal";
import { bookmarkJob, unbookmarkJob } from "@/services/bookmark.service";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    location: string;
    job_type: string;
    is_remote: boolean;
    salary_min: number;
    salary_max: number;
    required_tech_stack: string[];
    similarity_score: number;
    company_name?: string;
    industry?: string;
    company_logo?: string;
    company_website?: string;
    company_about?: string;
    company_location?: string;
    remote_policy?: string;
  };
  onApply?: () => void;
}

function getMatchConfig(score: number) {
  if (score >= 80) return { color: "text-emerald-600", bg: "bg-emerald-50", bar: "#10b981" };
  if (score >= 60) return { color: "text-[#F2754A]",   bg: "bg-orange-50",  bar: "#F2754A" };
  return               { color: "text-gray-400",        bg: "bg-gray-100",   bar: "#d1d5db" };
}

function getInitial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function formatSalary(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  if (!job) return null;

  const match = getMatchConfig(job.similarity_score);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarking) return;
    try {
      setBookmarking(true);
      if (saved) { await unbookmarkJob(job.id); setSaved(false); }
      else       { await bookmarkJob(job.id);   setSaved(true);  }
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-100 rounded-[32px] shadow-xl overflow-hidden cursor-pointer select-none active:scale-[0.98] transition-transform"
      >
        {/* ── Header gradient ── */}
        <div
          className="relative px-6 pt-6 pb-14"
          style={{ background: "linear-gradient(135deg, #F2754A 0%, #FFB347 100%)" }}
        >
          {/* Match badge — top left */}
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${match.bg} ${match.color}`}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: match.bar }} />
            {job.similarity_score}% match
          </div>

          {/* Bookmark — top right */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            disabled={bookmarking}
            aria-label={saved ? "Remove bookmark" : "Save job"}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <Heart
              className="w-4 h-4"
              fill={saved ? "#fff" : "none"}
              stroke="#fff"
            />
          </button>

          {/* Company avatar */}
          <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company_name} className="w-10 h-10 object-contain rounded-xl" />
            ) : (
              <span className="text-xl font-black text-[#F2754A]">
                {getInitial(job.company_name || job.title)}
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pt-10 pb-5">

          {/* Company info */}
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <p className="text-xs font-semibold text-gray-400 truncate">
              {job.company_name || "Company"}{job.industry ? ` · ${job.industry}` : ""}
            </p>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-gray-900 leading-tight mb-3">
            {job.title}
          </h3>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
              <MapPin className="w-3 h-3" />
              {job.is_remote ? "Remote" : job.location || "TBD"}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
              <Briefcase className="w-3 h-3" />
              {job.job_type.replace("_", " ")}
            </span>
          </div>

          {/* Salary */}
          <p className="text-2xl font-black text-gray-900 mb-1">
            ₹{formatSalary(job.salary_min)}
            <span className="text-gray-300 mx-1 font-light">–</span>
            ₹{formatSalary(job.salary_max)}
            <span className="text-sm font-semibold text-gray-400 ml-1">/ yr</span>
          </p>

          {/* Match bar */}
          <div className="flex items-center gap-2 mb-5 mt-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${job.similarity_score}%`, background: match.bar }}
              />
            </div>
            <span className={`text-xs font-bold tabular-nums ${match.color}`}>
              {job.similarity_score}%
            </span>
          </div>

          {/* Tech tags — max 4, then +N */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.required_tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[11px] font-semibold text-gray-600"
              >
                {tech}
              </span>
            ))}
            {job.required_tech_stack.length > 4 && (
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[11px] font-semibold text-[#F2754A]">
                +{job.required_tech_stack.length - 4}
              </span>
            )}
          </div>

          {/* Swipe hint footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
           
            </div>

            <p
  className="text-[11px] font-semibold text-gray-300"
  style={{ textAlign: "center" }}
>
  Tap card for details
</p>

            
            </div>
          </div>
    


      <JobDetailModal
        job={job}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={async () => { onApply?.(); }}
      />
    </>
  );
}