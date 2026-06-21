"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

import GithubConnect from "@/components/developer/GithubConnect";
import RepositoryList, {
  Repository,
} from "@/components/developer/RepositoryList";
import OnboardingStepper from "@/components/developer/OnboardingStepper";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MAX_SELECTION = 5;

export default function GithubPage() {
  const router = useRouter();

  const [connected, setConnected] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchRepos = async () => {
    try {
      setLoadingRepos(true);
      setFetchError("");

      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/developer/github/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch repositories");
      }

      setRepos(data);
    } catch (error) {
      console.error(error);
      setFetchError("We couldn't load your repositories. Please try again.");
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    const loadRepos = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      setConnected(true);
      await fetchRepos();
    };

    loadRepos();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_SELECTION) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("access_token");

      // Map selected string IDs back to github_repo_ids for the API
      const selectedRepoIds = repos
        .filter((r) => selectedIds.includes(r.id))
        .map((r) => r.github_repo_id);

      const res = await fetch(`${API_URL}/developer/github/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ repo_ids: selectedRepoIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save selection");
      }

      router.push("/onboarding/preferences");
    } catch (error) {
      console.error(error);
      alert("Failed to save repository selection.");
    } finally {
      setSaving(false);
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

        <OnboardingStepper currentStep={3} />

        <div className="mt-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify your GitHub
          </h2>
          <p className="text-gray-400 mb-8">
            Connecting GitHub lets us verify real shipped code — it is what
            powers your Antyl Score.
          </p>

          <GithubConnect
            connected={connected}
            onConnected={async () => {
              setConnected(true);
              await fetchRepos();
            }}
            onDisconnected={() => {
              setConnected(false);
              setRepos([]);
              setSelectedIds([]);
            }}
          />

          {loadingRepos && (
            <div className="flex items-center gap-2 text-gray-500 mt-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading repositories...</span>
            </div>
          )}

          {fetchError && !loadingRepos && (
            <div className="flex items-center gap-2 text-sm text-red-500 mt-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {repos.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3 mt-6">
                <p className="text-sm font-semibold text-gray-700">
                  Select up to {MAX_SELECTION} repositories for verification
                </p>
                <span className="text-sm font-semibold text-[#F2754A]">
                  {selectedIds.length}/{MAX_SELECTION} selected
                </span>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
                <RepositoryList
                  repos={repos}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || selectedIds.length === 0}
                className="w-full mt-5 py-3.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-100"
              >
                {saving ? "Saving..." : "Confirm Selection"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}