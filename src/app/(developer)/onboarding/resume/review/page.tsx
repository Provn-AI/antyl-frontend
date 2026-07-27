"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Sparkles, Pencil } from "lucide-react";
import WorkHistoryTimeline from "@/components/developer/WorkHistoryTimeline";
import OnboardingStepper from "@/components/developer/OnboardingStepper";
import { updateProfile, getMyProfile } from "@/services/developer.service";

interface WorkHistoryItem {
  company: string;
  role: string;
  duration: string;
  autoFilled: boolean;
}

interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  autoFilled: boolean;
}

function FieldBadge({ autoFilled }: { autoFilled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
        autoFilled
          ? "bg-orange-50 text-[#F2754A]"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {autoFilled ? (
        <>
          <Sparkles className="w-3 h-3" />
          Auto-filled
        </>
      ) : (
        <>
          <Pencil className="w-3 h-3" />
          Edited
        </>
      )}
    </span>
  );
}

export default function ResumeReviewPage() {
  const router = useRouter();

  const [yearsExperience, setYearsExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function loadParsedResume() {
      try {
        const profile = await getMyProfile();
        const parsed = profile.resume_parsed_data;

        if (!parsed) return;

        setYearsExperience(String(parsed.years_experience || 0));
        setSkills((parsed.skills || []).join(", "));

        setWorkHistory(
          (parsed.work_history || []).map((item: WorkHistoryItem) => ({
            ...item,
            autoFilled: true,
          }))
        );

        setEducation(
          (parsed.education || []).map((item: EducationItem) => ({
            ...item,
            autoFilled: true,
          }))
        );
      } catch (error) {
        console.error(error);
        setLoadError(
          "We couldn't load your parsed resume data. You can still fill this in manually."
        );
      }
    }

    loadParsedResume();
  }, []);

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = {
      ...updated[index],
      [field]: value,
      autoFilled: false,
    };
    setEducation(updated);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setSaveError("");

      await updateProfile({
        years_experience: Number(yearsExperience),

        tech_stack: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        resume_parsed_data: {
          work_history: workHistory.map((item) => ({
            company: item.company,
            role: item.role,
            duration: item.duration,
          })),

          education: education.map((item) => ({
            degree: item.degree,
            institution: item.institution,
            year: item.year,
          })),
        },
      });

      router.push("/onboarding/github");
    } catch (error) {
      console.error(error);
      setSaveError("We couldn't save your changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo */}
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>

        <OnboardingStepper currentStep={2} />

        <div className="mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Review your resume data
          </h2>
          <p className="text-gray-400 mb-8">
            We have pulled this from your resume - check it over and fix
            anything that is off before continuing.
          </p>

          {loadError && (
            <div className="flex items-center gap-2 text-sm text-red-500 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Experience */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">
              Years of experience
            </h3>

            <input
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="e.g. 4"
              className="w-full border border-gray-200 rounded-full px-5 py-3 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors"
            />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Skills</h3>

            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, FastAPI, PostgreSQL..."
              className="w-full border border-gray-200 rounded-2xl px-5 py-3 min-h-[120px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#F2754A] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              Separate each skill with a comma.
            </p>
          </div>

          {/* Work history */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Work history</h3>
            <WorkHistoryTimeline
              workHistory={workHistory}
              setWorkHistory={setWorkHistory}
            />
          </div>

          {/* Education */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Education</h3>

            {education.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-6">
                No education found. Add details manually if needed.
              </div>
            ) : (
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-2xl p-5 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-900">
                        Education #{index + 1}
                      </span>
                      <FieldBadge autoFilled={edu.autoFilled} />
                    </div>

                    <div className="space-y-3">
                      <input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(index, "degree", e.target.value)
                        }
                        placeholder="Degree"
                        className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white focus:outline-none focus:border-[#F2754A] transition-colors"
                      />

                      <input
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(index, "institution", e.target.value)
                        }
                        placeholder="Institution"
                        className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white focus:outline-none focus:border-[#F2754A] transition-colors"
                      />

                      <input
                        value={edu.year}
                        onChange={(e) =>
                          updateEducation(index, "year", e.target.value)
                        }
                        placeholder="Year"
                        className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 bg-white focus:outline-none focus:border-[#F2754A] transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {saveError && (
            <div className="flex items-center gap-2 text-sm text-red-500 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleConfirm}
            className="w-full px-6 py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
            }}
          >
            {loading ? "Saving..." : "Confirm & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}