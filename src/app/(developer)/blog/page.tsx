"use client";

import DeveloperNavbar from "../components/DeveloperNavbar";
import WeeklyBlogView from "../components/WeeklyBlogView";

export default function DeveloperBlogPage() {
  return (
    <div className="min-h-screen w-full md:flex bg-[#FAF8F5] overflow-x-hidden">
      <DeveloperNavbar />

      <div className="w-full md:flex-1 md:min-w-0 md:flex md:justify-center px-4 py-10">
        <div className="w-full max-w-2xl md:mx-auto min-w-0">
          <WeeklyBlogView />
        </div>
      </div>
    </div>
  );
}