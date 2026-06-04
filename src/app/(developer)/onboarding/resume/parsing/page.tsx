"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getResumeStatus } from "@/services/resume.service";

const messages = [
  "Uploading resume...",
  "Extracting work history...",
  "Extracting education...",
  "Analyzing skills...",
  "Preparing your profile...",
];

export default function ResumeParsingPage() {
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
  const progressInterval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 95) return 95;
      return prev + 2;
    });
  }, 400);

  const messageInterval = setInterval(() => {
    setMessageIndex((prev) =>
      prev < messages.length - 1 ? prev + 1 : prev
    );
  }, 3000);

  const pollInterval = setInterval(async () => {
    try {
      const status = await getResumeStatus();

      if (status.status === "completed") {
        setProgress(100);

        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearInterval(pollInterval);

        router.push("/onboarding/resume/review");
      }

      if (status.status === "failed") {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
        clearInterval(pollInterval);

        alert("Resume parsing failed.");
      }
    } catch (error) {
      console.error(error);
    }
  }, 3000);

  return () => {
    clearInterval(progressInterval);
    clearInterval(messageInterval);
    clearInterval(pollInterval);
  };
}, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-4">
        Parsing Your Resume
      </h1>

      <p className="text-gray-500 mb-8">
        {messages[messageIndex]}
      </p>

      <div className="w-full max-w-md bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-sm text-gray-500">
  Processing your resume...
</p>
    </div>
  );
}