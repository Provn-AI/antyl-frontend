"use client";

import BlogList from "@/app/(developer)/components/BlogList";

export default function RecruiterBlogPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6">
        <p
          className="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-1"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          Weekly roundup
        </p>
        <p className="text-gray-400 text-sm">
          The community&apos;s highlights, fresh every Monday. Every past edition lives here too.
        </p>
      </div>

      <BlogList basePath="/recruiter_blog" />
    </div>
  );
}