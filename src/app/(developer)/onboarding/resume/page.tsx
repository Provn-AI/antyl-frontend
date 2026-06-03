"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ResumeUpload from "@/components/developer/ResumeUpload";
import OnboardingStepper from "@/components/developer/OnboardingStepper";

export default function ResumePage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);

  const handleContinue = () => {
    if (!file) return;

    // TODO: uploadResume(file)

    router.push("/onboarding/resume/parsing");
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <OnboardingStepper currentStep={2} />

      <h1 className="text-3xl font-bold mb-6">
        Upload Your Resume
      </h1>

      <ResumeUpload onFileSelect={setFile} />

      <button
        disabled={!file}
        onClick={handleContinue}
        className="mt-6 px-6 py-3 rounded-lg bg-black text-white disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}