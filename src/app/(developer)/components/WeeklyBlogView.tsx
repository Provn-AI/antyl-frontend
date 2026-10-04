"use client";

import { useEffect, useState } from "react";
import { Sparkles, CalendarDays, Clock, CalendarClock } from "lucide-react";
import { getActiveBlog } from "@/services/weeklyQuestion.service";

interface WeeklyBlog {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Light formatting for plain-text content: blank lines separate blocks,
// "#" / "##" / "###" lines become headings, "-" / "*" lines become bullet
// lists and "1." lines become numbered lists. Anything else is a paragraph
// (single line breaks inside a paragraph are kept).
function renderContent(content: string) {
  const blocks = content.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  return blocks.map((block, i) => {
    const lines = block.split("\n");

    const heading = lines.length === 1 ? block.match(/^#{1,3}\s+(.+)$/) : null;
    if (heading) {
      return (
        <h2
          key={i}
          className="text-xl sm:text-2xl font-bold text-gray-900 mt-9 mb-3 break-words"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {heading[1]}
        </h2>
      );
    }

    if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
      return (
        <ul key={i} className="my-5 space-y-2.5">
          {lines.map((l, j) => (
            <li key={j} className="flex items-start gap-3 text-gray-600 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2754A] mt-2.5 flex-shrink-0" />
              <span className="break-words min-w-0">{l.replace(/^\s*[-*•]\s+/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      return (
        <ol key={i} className="my-5 space-y-2.5">
          {lines.map((l, j) => (
            <li key={j} className="flex items-start gap-3 text-gray-600 leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-orange-50 text-[#F2754A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {j + 1}
              </span>
              <span className="break-words min-w-0">{l.replace(/^\s*\d+[.)]\s+/, "")}</span>
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p
        key={i}
        className={`whitespace-pre-line break-words leading-relaxed my-5 first:mt-0 ${
          i === 0 ? "text-lg text-gray-700" : "text-[15px] sm:text-base text-gray-600"
        }`}
      >
        {block}
      </p>
    );
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WeeklyBlogView() {
  const [blog, setBlog] = useState<WeeklyBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    getActiveBlog()
      .then((data) => {
        if (alive) setBlog(data);
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

  if (loading) {
    return (
      <div className="w-full min-w-0 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden animate-pulse">
        <div className="px-6 sm:px-10 pt-10 pb-8 bg-orange-50/60">
          <div className="h-6 w-24 bg-white rounded-full mb-5" />
          <div className="h-8 w-4/5 bg-white rounded-full mb-3" />
          <div className="h-8 w-2/5 bg-white rounded-full" />
        </div>
        <div className="px-6 sm:px-10 py-8 space-y-3.5">
          <div className="h-3.5 w-full bg-gray-100 rounded-full" />
          <div className="h-3.5 w-11/12 bg-gray-100 rounded-full" />
          <div className="h-3.5 w-4/5 bg-gray-100 rounded-full" />
          <div className="h-3.5 w-full bg-gray-100 rounded-full mt-6" />
          <div className="h-3.5 w-3/4 bg-gray-100 rounded-full" />
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="w-full min-w-0 bg-white rounded-[28px] border border-gray-100 shadow-sm px-6 sm:px-8 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-[#F2754A]" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Could not load this week&apos;s roundup</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          There was a connection problem. Please try again.
        </p>
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

  if (!blog) {
    return (
      <div className="relative w-full min-w-0 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden px-6 sm:px-8 py-16 sm:py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-orange-50 blur-3xl opacity-80"
        />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-5">
            <CalendarClock className="w-7 h-7 text-[#F2754A]" />
          </div>
          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Nothing here yet
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto leading-relaxed break-words">
            Check back Monday - this week community roundup will land here,
            fresh for 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="w-full min-w-0 bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <header className="relative px-6 sm:px-10 pt-9 sm:pt-11 pb-7 sm:pb-8 bg-gradient-to-br from-orange-50 via-orange-50/40 to-white border-b border-orange-100/60 overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-[#F2754A]/10"
        />
        <div
          aria-hidden
          className="absolute right-20 -bottom-14 w-32 h-32 rounded-full bg-[#FFB347]/15"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F2754A] bg-white border border-orange-100 px-3 py-1.5 rounded-full mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            This week
          </span>

          <h1
            className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight break-words"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 text-xs font-semibold text-gray-500">
            <span
              className="flex items-center gap-1.5"
              title={new Date(blog.published_at).toLocaleString("en-IN")}
            >
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {new Date(blog.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              <span className="text-gray-400 font-medium">({timeAgo(blog.published_at)})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {readingTime(blog.content)} min read
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="px-6 sm:px-10 py-8 sm:py-10">
        <div className="max-w-none">{renderContent(blog.content)}</div>

        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#F2754A]" />
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            That&apos;s this week&apos;s roundup. A new one lands every Monday.
          </p>
        </div>
      </div>
    </article>
  );
}