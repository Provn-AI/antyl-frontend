export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://antyl.org";

// The image renderer needs absolute URLs, so "/badge-1.png" becomes a full link.
export function assetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const MASCOT_PATH = "/preonboarding_1_image.png";