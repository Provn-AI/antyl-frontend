"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, CalendarDays, Clock, ArrowRight, CalendarClock } from "lucide-react";
import { getBlogArchive, BlogSummary } from "@/services/weeklyQuestion.service";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    getBlogArchive(PAGE_SIZE, 0)
      .then((data) => {
        if (!alive) return;
        setBlogs(data.blogs);
        setTotal(data.total);
      })
      .catch((err) => {
        console.error(err);
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const data = await getBlogArchive(PAGE_SIZE, blogs.length);
      setBlogs((prev) => {
        const seen = new Set(prev.map((b) => b.id));
        return [...prev, ...data.blogs.filter((b) => !seen.has(b.id))];
      });
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [blogs.length]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-56 bg-white rounded-[28px] border border-gray-100" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-[#F2754A]" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Could not load the roundups</h2>
        <p className="text-sm text-gray-400">There was a connection problem. Please try again.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-5 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
        >
          Try again
        </button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-5">
          <CalendarClock className="w-7 h-7 text-[#F2754A]" />
        </div>
        <h2
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          Nothing here yet
        </h2>
        <p className="text-gray-400 max-w-sm mx-auto">
          Check back Monday - the first community roundup will land here.
        </p>
      </div>
    );
  }

  const [latest, ...older] = blogs;

  return (
    <div className="space-y-8">
      {/* Latest */}
      <Link
        href={`/developer/blog/${latest.id}`}
        className="group relative block bg-gradient-to-br from-orange-50 via-orange-50/40 to-white rounded-[28px] border border-orange-100/60 shadow-sm overflow-hidden px-6 sm:px-10 py-8 sm:py-10 hover:shadow-md transition-shadow"
      >
        <div aria-hidden className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-[#F2754A]/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F2754A] bg-white border border-orange-100 px-3 py-1.5 rounded-full mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Latest
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight break-words"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            {latest.title}
          </h2>
          <p className="mt-3 text-gray-600 leading-relaxed break-words">{latest.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(latest.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {latest.read_minutes} min read
            </span>
            <span className="ml-auto flex items-center gap-1 text-[#F2754A] font-bold group-hover:gap-2 transition-all">
              Read <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>

      {/* Older */}
      {older.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-900 mb-3 px-1">Past roundups</h3>
          <div className="space-y-3">
            {older.map((b) => (
              <Link
                key={b.id}
                href={`/developer/blog/${b.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-6 py-5 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <h4
                  className="text-lg font-bold text-gray-900 break-words group-hover:text-[#F2754A] transition-colors"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {b.title}
                </h4>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-2 break-words">
                  {b.excerpt}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {formatDate(b.published_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {b.read_minutes} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {blogs.length < total && (
        <div className="text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-[#F2754A] bg-white border border-orange-100 hover:bg-orange-50 transition-colors disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}