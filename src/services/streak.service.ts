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

// Shared across every caller in the page. If React Strict Mode or two
// components call pingStreak() at nearly the same time, they all get the
// same promise and only one request is sent.
let inflightPing: Promise<StreakSummary | null> | null = null;

async function doPing(): Promise<StreakSummary | null> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/developer/streak/ping`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.streak as StreakSummary | null;
}

export function pingStreak(): Promise<StreakSummary | null> {
  if (!inflightPing) {
    inflightPing = doPing().finally(() => {
      // Keep the cached promise briefly so a remount right after the
      // first call (Strict Mode, auth redirect) reuses it.
      setTimeout(() => {
        inflightPing = null;
      }, 5000);
    });
  }
  return inflightPing;
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