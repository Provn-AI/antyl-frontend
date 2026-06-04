"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkHistoryTimeline from "@/components/developer/WorkHistoryTimeline";
import { updateProfile } from "@/services/developer.service";

export default function ResumeReviewPage() {
  const router = useRouter();

  const [yearsExperience, setYearsExperience] = useState("4");

  const [skills, setSkills] = useState(
    "React, Next.js, TypeScript, Python"
  );

  const [workHistory, setWorkHistory] = useState([
    {
      company: "Siemens Healthineers",
      role: "AI Engineer",
      duration: "2024 - Present",
      autoFilled: true,
    },
  ]);

  const [education, setEducation] = useState([
    {
      degree: "B.Tech CSE",
      institution: "CHRIST University",
      year: "2024",
      autoFilled: true,
    },
  ]);

  const updateWorkHistory = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...workHistory];
    updated[index] = {
      ...updated[index],
      [field]: value,
      autoFilled: false,
    };
    setWorkHistory(updated);
  };

  const updateEducation = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...education];
    updated[index] = {
      ...updated[index],
      [field]: value,
      autoFilled: false,
    };
    setEducation(updated);
  };

  const [loading, setLoading] = useState(false);

const handleConfirm = async () => {
  try {
    setLoading(true);

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
    alert("Failed to save resume data.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">
        Review Your Resume Data
      </h1>

      <p className="text-gray-500 mb-8">
        Verify the information extracted from your resume.
      </p>

      {/* Experience */}
      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Years of Experience
        </h2>

        <input
          value={yearsExperience}
          onChange={(e) =>
            setYearsExperience(e.target.value)
          }
          className="border rounded-lg px-4 py-2 w-full"
        />
      </div>

      {/* Skills */}
      <div className="border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Skills
        </h2>

        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full min-h-[120px]"
        />
      </div>
        <WorkHistoryTimeline
        workHistory={workHistory}
        setWorkHistory={setWorkHistory}
        />
      {/* Education */}
      <div className="border rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Education
        </h2>

        {education.map((edu, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between mb-3">
              <span className="font-medium">
                Education #{index + 1}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  edu.autoFilled
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {edu.autoFilled
                  ? "Auto Filled"
                  : "Edited"}
              </span>
            </div>

            <input
              value={edu.degree}
              onChange={(e) =>
                updateEducation(
                  index,
                  "degree",
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-2 w-full mb-3"
            />

            <input
              value={edu.institution}
              onChange={(e) =>
                updateEducation(
                  index,
                  "institution",
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-2 w-full mb-3"
            />

            <input
              value={edu.year}
              onChange={(e) =>
                updateEducation(
                  index,
                  "year",
                  e.target.value
                )
              }
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>
        ))}
      </div>

      <button
        disabled={loading}
        onClick={handleConfirm}
        className="px-6 py-3 rounded-lg bg-black text-white disabled:opacity-50"
        >
        {loading
            ? "Saving..."
            : "Confirm & Continue"}
        </button>
    </div>
  );
}