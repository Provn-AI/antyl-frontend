"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { getBookmarks } from "@/services/bookmark.service";
import DeveloperNavbar from "../components/DeveloperNavbar";

interface BookmarkItem {
  bookmark_id: string;
  job_id: string;
  job_title: string;
  already_applied: boolean;
  created_at: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <DeveloperNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <p className="text-sm text-gray-400 font-medium">Loading bookmarks…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0]">
      <DeveloperNavbar />
      <div className="px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>

          {bookmarks.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center">
              <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">You have not saved any jobs yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((b) => (
                <Link
                  key={b.bookmark_id}
                  href={`/feed?job=${b.job_id}`}
                  className="block bg-white rounded-[20px] border border-gray-100 shadow-sm p-5 hover:border-[#F2754A] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{b.job_title}</p>
                    {b.already_applied && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Applied
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Saved {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}