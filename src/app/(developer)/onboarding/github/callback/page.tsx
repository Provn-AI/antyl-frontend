"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  exchangeGithubCode,
  connectGithub,
} from "@/services/github.service";

export default function GithubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const run = async () => {
      try {
        const code =
          searchParams.get("code");

        if (!code) {
          throw new Error(
            "No GitHub code received."
          );
        }

        const exchangeResult =
          await exchangeGithubCode(code);

        await connectGithub(
          exchangeResult.access_token
        );

        router.replace(
          "/onboarding/github"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to connect GitHub."
        );

        router.replace(
          "/onboarding/github"
        );
      }
    };

    void run();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Connecting GitHub...
    </div>
  );
}