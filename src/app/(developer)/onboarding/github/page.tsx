"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import GithubConnect from "@/components/developer/GithubConnect";
import RepositoryList, {
  Repository,
} from "@/components/developer/RepositoryList";
import RepoSelection from "@/components/developer/RepoSelection";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export default function GithubPage() {
  const router = useRouter();

  const [connected, setConnected] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] =
    useState(false);

  const fetchRepos = async () => {
    try {
      setLoadingRepos(true);

      const token =
        localStorage.getItem("access_token");

      const res = await fetch(
        `${API_URL}/developer/github/repos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Failed to fetch repositories"
        );
      }

      setRepos(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch repositories.");
    } finally {
      setLoadingRepos(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        GitHub Verification
      </h1>

      <GithubConnect
        connected={connected}
        onConnected={async () => {
          setConnected(true);
          await fetchRepos();
        }}
        onDisconnected={() => {
          setConnected(false);
          setRepos([]);
        }}
      />

      {loadingRepos && (
        <p className="mt-6 text-gray-500">
          Loading repositories...
        </p>
      )}

      {repos.length > 0 && (
        <>
          <div className="mt-8">
            <RepositoryList repos={repos} />
          </div>

          <RepoSelection
            repos={repos}
            onSuccess={() =>
              router.push(
                "/onboarding/preferences"
                )
            }
          />
        </>
      )}
    </div>
  );
}