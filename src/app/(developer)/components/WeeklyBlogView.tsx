"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getActiveBlog } from "@/services/weeklyQuestion.service";

interface WeeklyBlog {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

export default function WeeklyBlogView() {
  const [blog, setBlog] = useState<WeeklyBlog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveBlog()
      .then(setBlog)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm py-24 text-center">
        <div
          className="w-8 h-8 rounded-full border-[3px] border-gray-200 mx-auto animate-spin"
          style={{ borderTopColor: "#F2754A" }}
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-7 h-7 text-[#F2754A]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nothing here yet
        </h2>
        <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
          Check back Monday - this week community roundup will land here,
          fresh for 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-8 py-10">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#F2754A] bg-orange-50 px-3 py-1 rounded-full mb-4">
        <Sparkles className="w-3 h-3" />
        This week
      </span>
      <h1
        className="text-3xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: "var(--font-fraunces, serif)" }}
      >
        {blog.title}
      </h1>
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
        {blog.content}
      </div>
    </div>
  );
}