"use client";

import { useMemo, useState } from "react";
import { Star, Clock, Gauge, Check } from "lucide-react";

export interface Repository {
  id: string;
  github_repo_id: number;
  name: string;
  language: string | null;
  stars: number;
  last_synced_at: string;
  complexity_score?: number | null;
}

interface RepositoryListProps {
  repos?: Repository[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  pageSize?: number;
}

export default function RepositoryList({
  repos = [],
  selectedIds = [],
  onToggleSelect,
  pageSize = 5,
}: RepositoryListProps) {
  const [page, setPage] = useState(1);

  const sortedRepos = useMemo(() => {
    return [...repos].sort(
      (a, b) =>
        new Date(b.last_synced_at).getTime() -
        new Date(a.last_synced_at).getTime()
    );
  }, [repos]);

  const totalPages = Math.max(1, Math.ceil(sortedRepos.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleRepos = sortedRepos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (repos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No repositories found
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {visibleRepos.map((repo) => {
          const isSelected = selectedIds.includes(repo.id);

          return (
            <button
              key={repo.id}
              type="button"
              onClick={() => onToggleSelect?.(repo.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                isSelected
                  ? "border-[#F2754A] bg-orange-50"
                  : "border-gray-100 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {repo.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {repo.language || "Unknown language"}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    isSelected
                      ? "bg-[#F2754A] border-[#F2754A]"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 rounded-full px-2.5 py-1">
                  <Star className="w-3 h-3" />
                  {repo.stars}
                </span>

                <span className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 rounded-full px-2.5 py-1">
                  <Clock className="w-3 h-3" />
                  Updated{" "}
                  {new Date(repo.last_synced_at).toLocaleDateString()}
                </span>

                {repo.complexity_score !== null &&
                  repo.complexity_score !== undefined && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#F2754A] bg-orange-50 rounded-full px-2.5 py-1">
                      <Gauge className="w-3 h-3" />
                      Complexity {repo.complexity_score}
                    </span>
                  )}
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                  p === currentPage
                    ? "bg-[#F2754A] text-white"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}