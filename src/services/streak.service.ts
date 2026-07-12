const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export interface StreakSummary {
  current_streak_days: number;
  longest_streak_days: number;
  cycle_day_count: number;
  days_to_week_bonus: number;
  days_to_month_bonus: number;
}

export async function pingStreak() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/developer/streak/ping`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.streak as StreakSummary | null;
}

export async function getMyStreak() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/developer/streak/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.streak as StreakSummary | null;
}