"use client";

import { useParams } from "next/navigation";
import BlogDetailView from "@/app/(developer)/components/BlogDetailView";

export default function RecruiterBlogDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <BlogDetailView id={params.id} basePath="/recruiter_blog" />
    </div>
  );
}