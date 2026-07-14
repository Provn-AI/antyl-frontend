"use client";

import DeveloperNavbar from "../components/DeveloperNavbar";
import WeeklyBlogView from "../components/WeeklyBlogView";

export default function DeveloperBlogPage() {
  return (
    <>
      <DeveloperNavbar />
      <div className="min-h-screen w-full bg-[#FAF8F5] px-4 py-10">
        <div className="w-full max-w-2xl mx-auto">
          <WeeklyBlogView />
        </div>
      </div>
    </>
  );
}