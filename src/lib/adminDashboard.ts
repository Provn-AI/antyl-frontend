const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://antyl-backend.onrender.com";

export interface MetricBlock {
  today: number;
  total: number;
  trend_7d: { date: string; count: number }[];
}

export interface RecruiterFunnel {
  total_applications: number;
  shortlisted: number;
  interviews: number;
  hired: number;
  shortlist_rate: number;
  interview_rate: number;
  hire_rate: number;
}

export interface DashboardMetrics {
  developers: MetricBlock;
  recruiters: MetricBlock;
  jobs: MetricBlock;
  matches: MetricBlock;
  recruiter_funnel: RecruiterFunnel;
}

export async function adminLogin(username: string, password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.ok;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchAdminMetrics(): Promise<DashboardMetrics | null> {
  const res = await fetch(`${API_BASE}/api/admin/metrics`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}