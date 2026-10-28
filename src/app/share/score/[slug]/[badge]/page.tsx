import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicBadge } from "@/services/developer.service";
import { SITE_URL, MASCOT_PATH } from "@/lib/shareAssests";

type Props = { params: Promise<{ slug: string; badge: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, badge } = await params;
  const d = await getPublicBadge(slug, badge);
  if (!d) return { title: "Antyl" };

  const title = `${d.name ?? "A developer"} earned the ${d.badge.label} badge on Antyl`;
  const description = d.badge.description;

  // og:image comes automatically from ./opengraph-image.tsx
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/share/badge/${slug}/${badge}`,
      siteName: "Antyl",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedBadgePage({ params }: Props) {
  const { slug, badge } = await params;
  const d = await getPublicBadge(slug, badge);
  if (!d) notFound();

  const b = d.badge;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] via-[#fff5ee] to-[#fff3dd] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-orange-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(242,117,74,0.12)]">
        <img src={MASCOT_PATH} alt="" className="mx-auto h-20 w-auto object-contain" />

        <div
          className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-[32px] border-2 border-white"
          style={{
            background: `linear-gradient(135deg, ${b.color}22 0%, ${b.color}44 100%)`,
            boxShadow: `0 12px 26px ${b.color}44, 0 0 0 4px ${b.color}20`,
          }}
        >
          <img src={b.image} alt={b.label} className="h-20 w-20 object-contain" />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Badge earned</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900">{b.label}</h1>
        <p className="mt-2 text-sm text-gray-500">{b.description}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
          {b.rank != null && (
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[#F2754A]">Rank #{b.rank}</span>
          )}
          {b.field_label && (
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-gray-500">{b.field_label}</span>
          )}
          {b.count > 1 && (
            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-gray-500">Earned ×{b.count}</span>
          )}
        </div>

        <p className="mt-5 text-sm font-bold text-gray-800">{d.name}</p>
        {d.current_role && <p className="text-xs text-gray-400">{d.current_role}</p>}

        <Link
          href="/"
          className="mt-6 inline-block rounded-2xl bg-[#F2754A] px-5 py-3 text-sm font-bold text-white hover:bg-[#e0623a]"
        >
          Earn your own badges on Antyl
        </Link>
      </div>
    </main>
  );
}