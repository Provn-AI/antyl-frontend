"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getBlogById, BlogFull } from "@/services/weeklyQuestion.service";
import BlogArticle from "./BlogArticle";

export default function BlogDetailView({ id }: { id: string }) {
  const [blog, setBlog] = useState<BlogFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    getBlogById(id)
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
  }, [id, attempt]);

  const back = (
    <Link
      href="/developer/blog"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#F2754A] transition-colors mb-5"
    >
      <ArrowLeft className="w-4 h-4" />
      All roundups
    </Link>
  );

  if (loading) {
    return (
      <>
        {back}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="px-6 sm:px-10 pt-10 pb-8 bg-orange-50/60">
            <div className="h-6 w-24 bg-white rounded-full mb-5" />
            <div className="h-8 w-4/5 bg-white rounded-full" />
          </div>
          <div className="px-6 sm:px-10 py-8 space-y-3.5">
            <div className="h-3.5 w-full bg-gray-100 rounded-full" />
            <div className="h-3.5 w-11/12 bg-gray-100 rounded-full" />
            <div className="h-3.5 w-4/5 bg-gray-100 rounded-full" />
          </div>
        </div>
      </>
    );
  }

  if (failed) {
    return (
      <>
        {back}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-[#F2754A]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Could not load this roundup</h2>
          <p className="text-sm text-gray-400">There was a connection problem. Please try again.</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="mt-5 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        {back}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm px-6 py-16 text-center">
          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Roundup not found
          </h2>
          <p className="text-gray-400">It may have been removed or is not available for your account.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {back}
      <BlogArticle blog={blog} />
    </>
  );
}