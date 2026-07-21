"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";

import OnboardingStepper from "@/components/developer/OnboardingStepper";
import {
  getAutoApplyPreferences,
  saveAutoApplyPreferences,
  toggleAutoApply,
} from "@/services/autoapply.service";

const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Remote",
  "Hybrid",
  "On-site",
];



// ─── Tag input ────────────────────────────────────────────────────────────────

interface TagInputProps {
  label: string;
  hint?: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagInput({ label, hint, placeholder, tags, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = [...tags];
    for (const p of parts) {
      if (!next.includes(p)) next.push(p);
    }
    onChange(next);
    setDraft("");
  };

  const removeTag = (tag: string) =>
    onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}

      <div className="min-h-[48px] flex flex-wrap gap-2 items-center border border-gray-200 bg-white rounded-2xl px-3 py-2.5 focus-within:border-[#F2754A] transition-colors">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-orange-50 text-[#F2754A] text-xs font-semibold rounded-full px-2.5 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-orange-700 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              if (draft.trim()) addTag(draft);
            }
            if (e.key === "Backspace" && !draft && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) addTag(draft);
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [threshold, setThreshold] = useState(70);

  useEffect(() => {
    const load = async () => {
      try {
        const prefs = await getAutoApplyPreferences();
        setThreshold(prefs.min_similarity_score);
        setSalaryMin(prefs.salary_min);
        setSalaryMax(prefs.salary_max);
        setTechStack(prefs.preferred_tech_stack);
        setLocations(prefs.preferred_locations);
        setJobTypes(prefs.job_type);
      } catch (error) {
        console.error(error);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveAutoApplyPreferences({
        preferred_tech_stack: techStack,
        preferred_locations: locations,
        job_type: jobTypes,
        salary_min: salaryMin,
        salary_max: salaryMax,
        min_similarity_score: threshold,
      });
      await toggleAutoApply(isEnabled);
      router.push("/verification");
    } catch (error) {
      console.error(error);
      alert("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const thresholdLabel =
    threshold >= 85
      ? "Very selective — only near-perfect matches"
      : threshold >= 70
      ? "Balanced — good quality matches"
      : threshold >= 50
      ? "Broad — more applications, varied fit"
      : "Open — apply to almost everything";

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo */}
        <h1
          className="text-2xl font-bold mb-8"
          style={{
            color: "#F2754A",
            fontFamily: "var(--font-fraunces, serif)",
          }}
        >
          Antyl
        </h1>

        <OnboardingStepper currentStep={4} />
        
        <button
          type="button"
          onClick={() => router.push("/onboarding/github")}
          className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mt-6"
        >
          ← Back
        </button>
        
        <div className="mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Set your preferences
          </h2>
          <p className="text-gray-400 mb-8">
            Tell us what you are looking for — we will use this to match and
            optionally auto-apply on your behalf.
          </p>

          {/* ── Section: What you work with ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <TagInput
              label="Tech stack"
              hint="Press Enter or comma to add each item."
              placeholder="React, Node.js, Python…"
              tags={techStack}
              onChange={setTechStack}
            />

            

            <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Job types
  </label>

  <p className="text-xs text-gray-400 mb-2">
    Select from available options.
  </p>

  <div className="flex flex-wrap gap-2">
    {[
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
      "Freelance",
      "Remote",
      "Hybrid",
      "On-site",
    ].map((type) => {
      const selected = jobTypes.includes(type);

      return (
        <button
          key={type}
          type="button"
          onClick={() => {
            if (selected) {
              setJobTypes(jobTypes.filter((t) => t !== type));
            } else {
              setJobTypes([...jobTypes, type]);
            }
          }}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            selected
              ? "bg-orange-50 text-[#F2754A] border border-[#F2754A]"
              : "bg-white text-gray-600 border border-gray-200 hover:border-[#F2754A]"
          }`}
        >
          {type}
        </button>
      );
    })}
  </div>
</div>
          </div>

          {/* ── Section: Salary ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Salary range{" "}
              <span className="text-gray-400 font-normal">Eg: (₹ 15 LPA)</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Minimum",
                  value: salaryMin,
                  setter: setSalaryMin,
                },
                {
                  label: "Maximum",
                  value: salaryMax,
                  setter: setSalaryMax,
                },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={value || ""}
                      onChange={(e) => setter(Number(e.target.value))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-2xl pl-7 pr-3 py-3 text-sm font-semibold text-gray-800 placeholder:text-gray-300 outline-none focus:border-[#F2754A] transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section: Match threshold ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-700">
                Match threshold
              </p>
              <span className="text-sm font-bold text-[#F2754A]">
                {threshold}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">{thresholdLabel}</p>

            {/* Custom styled range */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #F2754A ${threshold}%, #E5E7EB ${threshold}%)`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400 font-semibold mt-2">
  <span>Open</span>
  <span>Selective</span>
</div>
          </div>

          {/* ── Section: Auto Apply toggle ── */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-[#F2754A]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Enable Auto Apply
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Antyl will apply to matching jobs automatically.
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => setIsEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  isEnabled ? "bg-[#F2754A]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ── CTA ── */}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-5 py-3.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-100"
          >
            {loading ? "Saving…" : "Save & continue"}
          </button>
        </div>
      </div>
    </div>
  );
}