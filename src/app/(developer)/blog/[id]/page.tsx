"use client";

import { useParams } from "next/navigation";
import DeveloperNavbar from "../../components/DeveloperNavbar";
import BlogDetailView from "../../components/BlogDetailView";

export default function DeveloperBlogDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="min-h-screen w-full md:flex bg-[#FAF6F0] overflow-x-hidden">
      <DeveloperNavbar />

      <div className="w-full md:flex-1 md:min-w-0 md:flex md:justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl md:mx-auto min-w-0">
          <BlogDetailView id={params.id} />
        </div>
      </div>
    </div>
  );
}