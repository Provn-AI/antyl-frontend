import { Suspense } from "react";
import GithubCallbackClient from "./GitHubCallbackClient";

function CallbackFallback() {
  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-sm p-10 text-center">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "#F2754A", fontFamily: "var(--font-fraunces, serif)" }}
        >
          Antyl
        </h1>
        <p className="text-gray-400">Connecting GitHub...</p>
      </div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <GithubCallbackClient />
    </Suspense>
  );
}