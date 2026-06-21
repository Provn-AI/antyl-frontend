"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";

import ResumeUpload from "@/components/developer/ResumeUpload";
import OnboardingStepper from "@/components/developer/OnboardingStepper";
import { uploadResume } from "@/services/resume.service";

export default function ResumePage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleContinue = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setSubmitError("");

      const result = await uploadResume(file);

      localStorage.setItem("resume_job_id", result.job_id);
      router.push("/onboarding/resume/parsing");
    } catch (error) {
      console.error(error);
      setSubmitError("We couldn't upload your resume. Please try again.");
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

        {/* Card */}
        <div className="bg-white rounded-[24px] shadow-sm p-8 sm:p-10 mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Upload your resume
          </h2>
          <p className="text-gray-400 mb-8">
            We will pull your experience and skills automatically — you can
            review and edit everything before your profile goes live.
          </p>

          <ResumeUpload onFileSelect={setFile} />

          {submitError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              disabled={!file || loading}
              onClick={handleContinue}
              className="px-8 py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg, #F2754A 0%, #F8B36B 100%)",
              }}
            >
              {loading ? "Uploading..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}