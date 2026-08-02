const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export interface Badge {
  badge_key: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

export interface BadgeCatalogEntry {
  label: string;
  description: string;
  icon: string;
  color: string;
  image: string;
}

export async function getMyBadges() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/developer/badges/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { badges: [] as Badge[], catalog: {} as Record<string, BadgeCatalogEntry> };
  const data = await res.json();
  return data as { badges: Badge[]; catalog: Record<string, BadgeCatalogEntry> };
}