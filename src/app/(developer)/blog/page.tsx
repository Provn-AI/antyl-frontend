"use client";

import DeveloperNavbar from "../components/DeveloperNavbar";
import WeeklyBlogView from "../components/WeeklyBlogView";

export default function DeveloperBlogPage() {
  return (
    <div className="min-h-screen w-full md:flex bg-[#FAF6F0] overflow-x-hidden">
      <DeveloperNavbar />

      <div className="w-full md:flex-1 md:min-w-0 md:flex md:justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl md:mx-auto min-w-0">
          {/* Page header */}
          <div className="mb-6">
            <p
              className="text-xl sm:text-2xl font-bold text-gray-900 truncate mb-1"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Weekly roundup
            </p>
            <p className="text-gray-400 text-sm">
              The community&apos;s highlights, fresh every Monday.
            </p>
          </div>

          <WeeklyBlogView />
        </div>
      </div>
    </div>
  );
}