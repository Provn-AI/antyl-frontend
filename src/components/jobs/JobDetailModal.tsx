"use client";

import { useState } from "react";
import {
  X, MapPin, Briefcase, IndianRupee, Code2,
  Building2, Globe, CheckCircle2,
} from "lucide-react";
import type { Job } from "@/services/job.service";

interface JobDetailModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => Promise<void> | void;
}

function formatSalary(n: number) {
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000)   return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

function getInitial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function JobDetailModal({ job, open, onClose, onApply }: JobDetailModalProps) {
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);

  if (!open || !job) return null;

  const handleApply = async () => {
    if (applying || applied) return;
    try {
      setApplying(true);
      await onApply?.(job.id);
      setApplied(true);
      setTimeout(onClose, 900);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white sm:rounded-[32px] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gradient header ── */}
        <div
          className="relative px-6 pt-6 pb-14 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #F2754A 0%, #FFB347 100%)" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <h2 className="text-xl font-black text-white leading-tight pr-10 mb-1">
            {job.title}
          </h2>

          <div className="flex items-center gap-3 text-white/80 text-xs font-semibold flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.is_remote ? "Remote" : job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {job.job_type?.replace("_", " ")}
            </span>
          </div>

          {/* Company avatar floating */}
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

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 space-y-6">

          {/* Company card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="font-bold text-gray-900">{job.company_name || "Company"}</p>
            {job.industry && (
              <p className="text-xs font-semibold text-gray-400 mt-0.5">{job.industry}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3">
              {job.company_location && (
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <MapPin className="w-3 h-3" />{job.company_location}
                </span>
              )}
              {job.remote_policy && (
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <Globe className="w-3 h-3" />{job.remote_policy}
                </span>
              )}
              {job.company_website && (
                <a
                  href={job.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs font-semibold text-[#F2754A] hover:underline"
                >
                  <Globe className="w-3 h-3" />
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Salary */}
          <Section title="Salary" icon={<IndianRupee className="w-3.5 h-3.5 text-[#F2754A]" />}>
            <p className="text-2xl font-black text-gray-900">
              ₹{formatSalary(job.salary_min)}
              <span className="text-gray-300 mx-2 font-light">–</span>
              ₹{formatSalary(job.salary_max)}
              <span className="text-sm font-semibold text-gray-400 ml-1">/ yr</span>
            </p>
          </Section>

          {/* Tech stack */}
          {job.required_tech_stack?.length > 0 && (
            <Section title="Tech stack" icon={<Code2 className="w-3.5 h-3.5 text-[#F2754A]" />}>
              <div className="flex flex-wrap gap-2">
                {job.required_tech_stack.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Description */}
          {job.description && (
            <Section title="About the role" icon={<Briefcase className="w-3.5 h-3.5 text-[#F2754A]" />}>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
            </Section>
          )}

          {/* About company */}
          {job.company_about && (
            <Section title="About the company" icon={<Building2 className="w-3.5 h-3.5 text-[#F2754A]" />}>
              <p className="text-sm text-gray-600 leading-relaxed">{job.company_about}</p>
            </Section>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full py-3.5 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={applying || applied}
            className="flex-1 rounded-full py-3.5 text-sm font-bold text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)" }}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Applied
              </>
            ) : applying ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Applying…
              </>
            ) : (
              "Apply now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}