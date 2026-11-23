const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

// "Senior Backend Engineer" + id 3f9a2b1c-... -> "senior-backend-engineer-3f9a2b1c"
export function jobSlug(job: { id: string; title: string }): string {
  return `${slugify(job.title) || "job"}-${job.id.slice(0, 8).toLowerCase()}`;
}

// Accepts the new slug format and also a full UUID (old links, notifications).
export function findJobBySlug<T extends { id: string }>(
  jobs: T[],
  slug: string
): T | undefined {
  const s = decodeURIComponent(slug).toLowerCase();
  if (UUID_RE.test(s)) return jobs.find((j) => j.id.toLowerCase() === s);
  const short = s.slice(-8);
  return jobs.find((j) => j.id.toLowerCase().startsWith(short));
}