import { Suspense } from "react";
import GithubCallbackClient from "./GitHubCallbackClient";

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        Connecting GitHub...
      </div>
    }>
      <GithubCallbackClient />
    </Suspense>
  );
}