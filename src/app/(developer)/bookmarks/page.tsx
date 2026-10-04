"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
  Briefcase,
  Clock,
} from "lucide-react";
import { getBookmarks } from "@/services/bookmark.service";
import DeveloperNavbar from "../components/DeveloperNavbar";

interface BookmarkItem {
  bookmark_id: string;
  job_id: string;
  job_title: string;
  already_applied: boolean;
  created_at: string;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "to_apply", label: "To apply" },
  { key: "applied", label: "Applied" },
] as const;
type Filter = typeof FILTERS[number]["key"];
type SortKey = "newest" | "oldest";

const EMPTY_COPY: Record<Filter, { title: string; body: string }> = {
  all:      { title: "No saved jobs yet",       body: "Bookmark jobs from your feed and they will be kept here for later." },
  to_apply: { title: "Nothing left to apply to", body: "Every job you saved has already been applied to." },
  applied:  { title: "No applied jobs here",    body: "Saved jobs you apply to will show up in this tab." },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_TINTS = ["#F2754A", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

function tintFor(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

// First visible letter or digit; skips spaces and stray symbols so the avatar
// never renders blank. Returns null if there is none.
function initialOf(title?: string) {
  const match = title?.match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-5 animate-pulse flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3.5 w-2/3 bg-gray-100 rounded-full" />
        <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
      </div>
      <div className="h-6 w-16 bg-gray-100 rounded-full" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const counts: Record<Filter, number> = {
    all: bookmarks.length,
    to_apply: bookmarks.filter((b) => !b.already_applied).length,
    applied: bookmarks.filter((b) => b.already_applied).length,
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...bookmarks]
      .filter((b) => {
        if (q && !b.job_title.toLowerCase().includes(q)) return false;
        if (filter === "to_apply") return !b.already_applied;
        if (filter === "applied") return b.already_applied;
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sort === "newest" ? diff : -diff;
      });
  }, [bookmarks, filter, sort, query]);

  return (
    <div className="min-h-screen w-full md:flex bg-[#FAF6F0]">
      <style>{`
        @keyframes bmFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .bm-card { animation: bmFadeUp 0.4s ease both; }
        @media (prefers-reduced-motion: reduce) { .bm-card { animation: none; } }
      `}</style>

      <DeveloperNavbar />

      <div className="md:flex-1 md:min-w-0 flex justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-1"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Saved Jobs
            </h1>
            <p className="text-gray-400 text-sm">
              {loading
                ? "Loading your saved jobs…"
                : bookmarks.length === 0
                ? "Jobs you bookmark will be kept here."
                : `${counts.all} saved, ${counts.to_apply} still to apply to.`}
            </p>
          </div>

          {/* Search + tabs + sort (hidden when there is nothing saved) */}
          {!loading && bookmarks.length > 0 && (
            <>
              <div className="relative mb-4">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your saved jobs by title"
                  aria-label="Search saved jobs by title"
                  className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-800 placeholder:text-gray-400 placeholder:font-normal outline-none focus:border-[#F2754A] focus:ring-4 focus:ring-orange-100 transition"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex gap-1.5 sm:gap-2">
                  {FILTERS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilter(tab.key)}
                      className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                        filter === tab.key
                          ? "bg-[#F2754A] text-white shadow-md shadow-orange-100"
                          : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full ${
                          filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {counts[tab.key]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-100 rounded-full p-0.5 flex-shrink-0">
                  {([
                    { key: "newest", label: "Newest" },
                    { key: "oldest", label: "Oldest" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSort(opt.key)}
                      aria-pressed={sort === opt.key}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        sort === opt.key ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-6 h-6 text-[#F2754A]" />
              </div>
              {query ? (
                <>
                  <p className="text-sm font-bold text-gray-700">No matching saved jobs</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Nothing in this tab matches &ldquo;{query}&rdquo;.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-700">{EMPTY_COPY[filter].title}</p>
                  <p className="text-xs text-gray-400 mt-1">{EMPTY_COPY[filter].body}</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((b, index) => {
                const tint = tintFor(b.job_title);
                return (
                  <Link
                    key={b.bookmark_id}
                    href={`/feed?job=${b.job_id}`}
                    className="bm-card group flex items-center gap-4 bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 sm:p-5 transition hover:border-[#F2754A]/60 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
                    style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold"
                      style={{ background: `${tint}1A`, color: tint }}
                    >
                      {initialOf(b.job_title) ?? <Briefcase className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{b.job_title}</p>
                      <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 mt-1.5">
                        {b.already_applied ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Applied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-[#D9582F] bg-orange-50 rounded-full px-2.5 py-1">
                            <Bookmark className="w-3 h-3" />
                            Not applied yet
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1 text-xs text-gray-400"
                          title={new Date(b.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        >
                          <Clock className="w-3 h-3" />
                          Saved {timeAgo(b.created_at)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-[#F2754A]" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}