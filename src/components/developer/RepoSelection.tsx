"use client";

import { useState } from "react";
import type { Repository } from "./RepositoryList";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

interface RepoSelectionProps {
  repos: Repository[];
  onSuccess?: () => void;
}

const MAX_SELECTION = 5;

export default function RepoSelection({
  repos,
  onSuccess,
}: RepoSelectionProps) {
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleRepo = (repoId: string) => {
    const isSelected =
      selectedRepos.includes(repoId);

    if (isSelected) {
      setSelectedRepos((prev) =>
        prev.filter((id) => id !== repoId)
      );
      return;
    }

    if (
      selectedRepos.length >= MAX_SELECTION
    ) {
      return;
    }

    setSelectedRepos((prev) => [
      ...prev,
      repoId,
    ]);
  };

  const saveSelection = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      const res = await fetch(
        `${API_URL}/developer/github/select`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            repo_ids: selectedRepos,
            })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Failed to save selection"
        );
      }

      alert(
        "Repositories selected successfully."
      );

      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert(
        "Failed to save repository selection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .repo-select-wrapper {
          margin-top: 24px;
        }

        .repo-select-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:16px;
        }

        .repo-select-title {
          font-size:15px;
          font-weight:700;
          color:#1A1A1A;
          font-family:'DM Sans',sans-serif;
        }

        .repo-counter {
          font-size:13px;
          font-weight:600;
          color:#FF6B4D;
          font-family:'DM Sans',sans-serif;
        }

        .repo-option {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:14px;
          border:1.5px solid #E8E4DF;
          border-radius:14px;
          margin-bottom:10px;
          background:#fff;
          cursor:pointer;
          transition:all .15s ease;
        }

        .repo-option:hover {
          border-color:#FFB347;
        }

        .repo-option.selected {
          border-color:#FF6B4D;
          background:#FFF5F2;
        }

        .repo-option.disabled {
          opacity:.45;
          cursor:not-allowed;
        }

        .repo-name {
          font-size:14px;
          font-weight:700;
          color:#1A1A1A;
          font-family:'DM Sans',sans-serif;
        }

        .repo-meta {
          font-size:12px;
          color:#B0A89E;
          margin-top:4px;
          font-family:'DM Sans',sans-serif;
        }

        .checkbox {
          width:20px;
          height:20px;
          border-radius:6px;
          border:1.5px solid #E8E4DF;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
        }

        .checkbox.selected {
          background:linear-gradient(
            135deg,
            #FF6B4D,
            #FFB347
          );
          border:none;
        }

        .save-btn {
          width:100%;
          margin-top:18px;
          border:none;
          border-radius:50px;
          padding:14px;
          font-weight:700;
          cursor:pointer;
          color:white;
          background:linear-gradient(
            90deg,
            #FF6B4D,
            #FFB347
          );
          box-shadow:
            0 4px 20px rgba(255,107,77,0.25);
        }

        .save-btn:disabled {
          opacity:.5;
          cursor:not-allowed;
        }
      `}</style>

      <div className="repo-select-wrapper">
        <div className="repo-select-header">
          <div className="repo-select-title">
            Select repositories for verification
          </div>

          <div className="repo-counter">
            {selectedRepos.length}/5 selected
          </div>
        </div>

        {repos.map((repo) => {
          const isSelected =
            selectedRepos.includes(repo.id);

          const limitReached =
            selectedRepos.length >=
            MAX_SELECTION;

          const disabled =
            !isSelected && limitReached;

          return (
            <div
              key={repo.id}
              className={`repo-option ${
                isSelected ? "selected" : ""
              } ${
                disabled ? "disabled" : ""
              }`}
              onClick={() => {
                if (!disabled) {
                  toggleRepo(repo.id);
                }
              }}
            >
              <div>
                <div className="repo-name">
                  {repo.name}
                </div>

                <div className="repo-meta">
                  {repo.language ??
                    "Unknown"} • ⭐{" "}
                  {repo.stars}
                </div>
              </div>

              <div
                className={`checkbox ${
                  isSelected
                    ? "selected"
                    : ""
                }`}
              >
                {isSelected && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <polyline
                      points="1.5,5 4,7.5 8.5,2.5"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}

        <button
          className="save-btn"
          onClick={saveSelection}
          disabled={
            loading ||
            selectedRepos.length === 0
          }
        >
          {loading
            ? "Saving..."
            : "Confirm Selection"}
        </button>
      </div>
    </>
  );
}