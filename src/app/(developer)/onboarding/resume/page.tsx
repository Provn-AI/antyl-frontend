"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ResumeUpload from "@/components/developer/ResumeUpload";
import OnboardingStepper from "@/components/developer/OnboardingStepper";
import { uploadResume } from "@/services/resume.service";

export default function ResumePage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

const handleContinue = async () => {
  if (!file) return;

  try {
    setLoading(true);

    const result = await uploadResume(file);

    localStorage.setItem(
      "resume_job_id",
      result.job_id
    );

    router.push("/onboarding/resume/parsing");
  } catch (error) {
    console.error(error);
    alert("Failed to upload resume.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-2xl mx-auto p-8">
      <OnboardingStepper currentStep={2} />

      <h1 className="text-3xl font-bold mb-6">
        Upload Your Resume
      </h1>

      <ResumeUpload onFileSelect={setFile} />

      <button
        disabled={!file || loading}
        onClick={handleContinue}
        className="mt-6 px-6 py-3 rounded-lg bg-black text-white disabled:opacity-50"
        >
        {loading ? "Uploading..." : "Continue"}
    </button>
    </div>
  );
}