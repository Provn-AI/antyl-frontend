const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export interface LeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
  previous_rank: number | null;
  developer_profiles: {
    name: string;
    avatar_url: string | null;
    current_role: string;
  };
}

export interface MyRank {
  field_of_work: string;
  field_label: string;
  user_id?: string;
  score?: number;
  rank?: number;
  previous_rank?: number | null;
  overall?: {
    rank: number;
    previous_rank: number | null;
    score: number;
  } | null;
}

export interface LeaderboardField {
  key: string;
  label: string;
  count: number;
}

export async function getLeaderboard(field?: string) {
  const token = localStorage.getItem("access_token");
  const url = field
    ? `${API_URL}/developer/leaderboard?field=${encodeURIComponent(field)}`
    : `${API_URL}/developer/leaderboard`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load leaderboard");

  return data as { field: string; label: string; entries: LeaderboardEntry[] };
}

export async function getMyRank() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/leaderboard/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load your rank");

  return data.rank as MyRank;
}

// Returns only boards that have members, already ordered:
// "All Developers" first, "Other" last.
export async function getLeaderboardFields() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/leaderboard/fields`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load fields");

  return data.fields as LeaderboardField[];
}