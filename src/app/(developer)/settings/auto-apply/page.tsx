"use client";

import { useEffect, useState } from "react";
import { Zap, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import DeveloperNavbar from "../../components/DeveloperNavbar";
import {
  getAutoApplyPreferences,
  saveAutoApplyPreferences,
  AutoApplyPreferences,
} from "@/services/developer.service";

const JOB_TYPES = ["full_time", "part_time", "contract", "internship"];

const inputCls =
  "w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-[#F2754A] transition-colors bg-white";

export default function AutoApplySettingsPage() {
  const [prefs, setPrefs] = useState<AutoApplyPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [minScore, setMinScore] = useState(70);
  const [techStack, setTechStack] = useState("");
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAutoApplyPreferences();
        setPrefs(data);
        setMinScore(data.min_similarity_score ?? 70);
        setTechStack((data.preferred_tech_stack || []).join(", "));
        setJobTypes(data.job_type || []);
        setLocations((data.preferred_locations || []).join(", "));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleJobType = (type: string) => {
    setJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveAutoApplyPreferences({
        min_similarity_score: minScore,
        preferred_tech_stack: techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        job_type: jobTypes,
        preferred_locations: locations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F2754A] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0]">
      <DeveloperNavbar />

      <div className="px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F2754A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auto-apply preferences</h1>
              <p className="text-sm text-gray-400">
                Up to 10 matching jobs applied for automatically each day
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Minimum match score ({minScore}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-[#F2754A]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only apply to jobs scoring this or higher
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Preferred tech stack
              </label>
              <input
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className={inputCls}
                placeholder="Python, React, PostgreSQL"
              />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Job type
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleJobType(type)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                      jobTypes.includes(type)
                        ? "bg-[#F2754A] text-white border-[#F2754A]"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Leave all unselected to match any job type
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Preferred locations
              </label>
              <input
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                className={inputCls}
                placeholder="Bengaluru, Mumbai"
              />
              <p className="text-xs text-gray-400 mt-1">
                Comma-separated. Remote jobs always match regardless of location.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#F2754A] text-white hover:bg-[#e0623a] disabled:opacity-50 transition-colors shadow-md shadow-orange-100"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save preferences"}
              </button>
              {saved && (
                <span className="text-xs font-semibold text-green-600">Saved ✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}