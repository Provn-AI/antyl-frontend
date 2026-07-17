const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DailyTrend {
  date: string;
  label: string;
  auto: number;
  manual: number;
  total: number;
}

export interface WeeklyTrend {
  label: string;
  auto: number;
  manual: number;
  total: number;
}

export interface ApplicationDashboard {
  weekly_trend: DailyTrend[];
  monthly_trend: WeeklyTrend[];
  total_applications_this_week: number;
  total_applications_this_month: number;
  status_breakdown: Record<string, number>;
  avg_match_score: number;
}

export async function getApplicationDashboard(): Promise<ApplicationDashboard> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/developer/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load dashboard");
  return data;
}