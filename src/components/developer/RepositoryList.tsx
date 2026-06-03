"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export interface Repository {
  id: string;
  name: string;
  language: string | null;
  stars: number;
  last_updated: string;
  complexity_score?: number | null;
}

interface RepositoryListProps {
  repos?: Repository[];
}

export default function RepositoryList({
  repos = [],
}: RepositoryListProps) {
  return (
    <>
      <style>{`
        .repo-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .repo-card {
          background: white;
          border: 1.5px solid #E8E4DF;
          border-radius: 16px;
          padding: 16px;
          transition: border-color 0.15s ease;
        }

        .repo-card:hover {
          border-color: #FFB347;
        }

        .repo-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .repo-name {
          font-size: 15px;
          font-weight: 700;
          color: #1A1A1A;
          font-family: 'DM Sans', sans-serif;
        }

        .repo-language {
          font-size: 12px;
          color: #B0A89E;
          margin-top: 4px;
          font-family: 'DM Sans', sans-serif;
        }

        .repo-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .repo-pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: #F5F3F0;
          font-size: 12px;
          color: #666;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
        }

        .complexity {
          background: #FFF5F2;
          color: #FF6B4D;
        }

        .empty {
          text-align: center;
          padding: 2rem;
          color: #B0A89E;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="repo-list">
        {repos.length === 0 ? (
          <div className="empty">
            No repositories found
          </div>
        ) : (
          repos.map((repo) => (
            <div
              key={repo.id}
              className="repo-card"
            >
              <div className="repo-top">
                <div>
                  <div className="repo-name">
                    {repo.name}
                  </div>

                  <div className="repo-language">
                    {repo.language ||
                      "Unknown Language"}
                  </div>
                </div>
              </div>

              <div className="repo-stats">
                <span className="repo-pill">
                  ⭐ {repo.stars}
                </span>

                <span className="repo-pill">
                  Updated{" "}
                  {new Date(
                    repo.last_updated
                  ).toLocaleDateString()}
                </span>

                {repo.complexity_score !==
                  null &&
                  repo.complexity_score !==
                    undefined && (
                    <span className="repo-pill complexity">
                      Complexity{" "}
                      {repo.complexity_score}
                    </span>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}