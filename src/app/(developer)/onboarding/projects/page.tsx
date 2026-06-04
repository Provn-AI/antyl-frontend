"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProjectCaseStudyForm, {
  ProjectCaseStudy,
} from "@/components/developer/ProjectCaseStudyForm";

import {
  createProject,
} from "@/services/project.service";

import OnboardingStepper from "@/components/developer/OnboardingStepper";

export default function ProjectsPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [project, setProject] =
    useState<ProjectCaseStudy>({
      projectName: "",
      role: "",
      techUsed: "",
      problemSolved: "",
      outcome: "",
      metrics: "",
      liveUrl: "",
    });

  const handleContinue =
    async () => {
      try {
        setLoading(true);

        await createProject({
          project_name:
            project.projectName,
          role: project.role,
          tech_used:
            project.techUsed,
          problem_solved:
            project.problemSolved,
          outcome:
            project.outcome,
          metrics:
            project.metrics,
          live_url:
            project.liveUrl,
        });

        router.push(
          "/onboarding/preferences"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to save project."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <OnboardingStepper currentStep={5} />

      <h1 className="text-3xl font-bold mb-6">
        Project Case Study
      </h1>

      <ProjectCaseStudyForm
        value={project}
        onChange={setProject}
      />

      <button
        onClick={handleContinue}
        disabled={
          loading ||
          !project.projectName
        }
        className="mt-6 px-6 py-3 rounded-lg bg-black text-white disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : "Continue"}
      </button>
    </div>
  );
}