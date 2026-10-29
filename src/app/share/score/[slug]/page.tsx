import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicScore } from "@/services/developer.service";
import { SITE_URL } from "@/lib/shareAssests";
import { ScoreCardView } from "@/components/ScoreCardView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getPublicScore(slug);

  if (!s) return { title: "Antyl" };

  const title = `${s.name ?? "A developer"} scored ${s.trust_score}/100 on Antyl`;
  const description = s.top_skills.length
    ? `Verified from real code and GitHub work. Top skills: ${s.top_skills.join(", ")}.`
    : "Verified from real code and GitHub work.";

  // og:image comes automatically from ./opengraph-image.tsx
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

  const badges = s.badges ?? [];

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md">
        <ScoreCardView score={s.trust_score} name={s.name} role={s.current_role} />

        {s.top_skills.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {s.top_skills.map((skill) => (
              <span key={skill} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#F2754A]">
                {skill}
              </span>
            ))}
          </div>
        )}

        {badges.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {badges.map((b) => (
              <div
                key={b.key}
                className="flex items-center gap-2 rounded-full border bg-white py-1.5 pl-1.5 pr-3"
                style={{ borderColor: b.color }}
              >
                <img src={b.image} alt="" className="h-7 w-7 object-contain" />
                <span className="text-xs font-bold text-gray-700">
                  {b.label}
                  {b.count > 1 ? ` ×${b.count}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 text-center text-xs text-gray-400">Verified from real code and GitHub work.</p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-block rounded-2xl bg-[#F2754A] px-5 py-3 text-sm font-bold text-white hover:bg-[#e0623a]"
          >
            Get your Antyl score
          </Link>
        </div>
      </div>
    </main>
  );
}