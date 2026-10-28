import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicScore } from "@/services/developer.service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://antyl.org";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getPublicScore(slug);

  if (!s) return { title: "Antyl" };

  const title = `${s.name ?? "A developer"} scored ${s.trust_score}/100 on Antyl`;
  const description = s.top_skills.length
    ? `Verified from real code and GitHub work. Top skills: ${s.top_skills.join(", ")}.`
    : "Verified from real code and GitHub work.";

  // og:image is injected automatically by ./opengraph-image.tsx
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: { title, description, type: "profile", url: `/share/score/${slug}`, siteName: "Antyl" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedScorePage({ params }: Props) {
  const { slug } = await params;
  const s = await getPublicScore(slug);
  if (!s) notFound();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] via-[#fff5ee] to-[#fff3dd] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-orange-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(242,117,74,0.12)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Antyl Score</p>

        <div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-[#F2754A]">
          <span className="text-5xl font-black text-gray-900">{s.trust_score}</span>
        </div>

        <h1 className="mt-5 text-2xl font-black text-gray-900">{s.name}</h1>
        {s.current_role && <p className="text-sm text-gray-500">{s.current_role}</p>}

        {s.top_skills.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {s.top_skills.map((skill) => (
              <span key={skill} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#F2754A]">
                {skill}
              </span>
            ))}
          </div>
        )}

        <p className="mt-5 text-xs text-gray-400">Verified from real code and GitHub work.</p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-2xl bg-[#F2754A] px-5 py-3 text-sm font-bold text-white hover:bg-[#e0623a]"
        >
          Get your Antyl score
        </Link>
      </div>
    </main>
  );
}