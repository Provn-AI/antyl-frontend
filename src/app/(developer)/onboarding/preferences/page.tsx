"use client";

import {
  useState,
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import {
  getAutoApplyPreferences,
  saveAutoApplyPreferences,
  toggleAutoApply,
} from "@/services/autoapply.service";

export default function PreferencesPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [isEnabled, setIsEnabled] =
    useState(false);

  const [techStack, setTechStack] =
    useState("");

  const [locations, setLocations] =
    useState("");

  const [salaryMin, setSalaryMin] =
    useState(0);

  const [salaryMax, setSalaryMax] =
    useState(0);

  const [jobTypes, setJobTypes] =
    useState("");

  const [threshold, setThreshold] =
    useState(70);

  useEffect(() => {
    const load = async () => {
      try {
        const prefs =
          await getAutoApplyPreferences();

        setThreshold(
          prefs.min_similarity_score
        );

        setSalaryMin(
          prefs.salary_min
        );

        setSalaryMax(
          prefs.salary_max
        );

        setTechStack(
          prefs.preferred_tech_stack.join(
            ", "
          )
        );

        setLocations(
          prefs.preferred_locations.join(
            ", "
          )
        );

        setJobTypes(
          prefs.job_type.join(", ")
        );
      } catch (error) {
        console.error(error);
      }
    };

    void load();
  }, []);

  const handleSave =
    async () => {
      try {
        setLoading(true);

        await saveAutoApplyPreferences({
          preferred_tech_stack:
            techStack
              .split(",")
              .map((x) =>
                x.trim()
              ),

          preferred_locations:
            locations
              .split(",")
              .map((x) =>
                x.trim()
              ),

          job_type:
            jobTypes
              .split(",")
              .map((x) =>
                x.trim()
              ),

          salary_min:
            salaryMin,

          salary_max:
            salaryMax,

          min_similarity_score:
            threshold,
        });

        await toggleAutoApply(
          isEnabled
        );

        router.push(
          "/verification"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to save preferences."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Auto Apply Preferences
      </h1>

      <div className="space-y-5">

        <input
          value={techStack}
          onChange={(e) =>
            setTechStack(
              e.target.value
            )
          }
          placeholder="React, Next.js, Python"
          className="border rounded p-3 w-full"
        />

        <input
          value={locations}
          onChange={(e) =>
            setLocations(
              e.target.value
            )
          }
          placeholder="Bangalore, Remote"
          className="border rounded p-3 w-full"
        />

        <input
          type="number"
          value={salaryMin}
          onChange={(e) =>
            setSalaryMin(
              Number(
                e.target.value
              )
            )
          }
          placeholder="Minimum Salary"
          className="border rounded p-3 w-full"
        />

        <input
          type="number"
          value={salaryMax}
          onChange={(e) =>
            setSalaryMax(
              Number(
                e.target.value
              )
            )
          }
          placeholder="Maximum Salary"
          className="border rounded p-3 w-full"
        />

        <input
          value={jobTypes}
          onChange={(e) =>
            setJobTypes(
              e.target.value
            )
          }
          placeholder="Full Time, Remote"
          className="border rounded p-3 w-full"
        />

        {/* FE-026 */}
        <div>
          <label className="font-medium">
            Match Threshold: {threshold}%
          </label>

          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) =>
              setThreshold(
                Number(
                  e.target.value
                )
              )
            }
            className="w-full"
          />

          <p className="text-sm text-gray-500 mt-2">
            Auto apply only to jobs
            above this similarity
            score.
          </p>
        </div>

        {/* FE-027 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) =>
              setIsEnabled(
                e.target.checked
              )
            }
          />

          <span>
            Enable Auto Apply
          </span>
        </div>

        <button
          disabled={loading}
          onClick={handleSave}
          className="px-6 py-3 bg-black text-white rounded"
        >
          {loading
            ? "Saving..."
            : "Continue"}
        </button>
      </div>
    </div>
  );
}