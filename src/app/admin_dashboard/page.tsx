"use client";

import { useEffect, useState } from "react";
import { fetchAdminMetrics, adminLogout, DashboardMetrics } from "@/lib/adminDashboard";
import LoginForm from "./_components/LoginForm";
import MetricCard from "./_components/MetricCard";

export default function AdminDashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  async function loadMetrics() {
    const data = await fetchAdminMetrics();
    if (data) {
      setMetrics(data);
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
    setChecked(true);
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  if (!checked) return null;

  if (!authenticated) {
    return <LoginForm onSuccess={loadMetrics} />;
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Antyl Dashboard</h1>
          <button
            onClick={async () => {
              await adminLogout();
              setAuthenticated(false);
            }}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Developers" today={metrics.developers.today} total={metrics.developers.total} trend={metrics.developers.trend_7d} />
          <MetricCard label="Recruiters" today={metrics.recruiters.today} total={metrics.recruiters.total} trend={metrics.recruiters.trend_7d} funnel={metrics.recruiter_funnel} />
          <MetricCard label="Jobs Posted" today={metrics.jobs.today} total={metrics.jobs.total} trend={metrics.jobs.trend_7d} />
          <MetricCard label="Candidates Matched" today={metrics.matches.today} total={metrics.matches.total} trend={metrics.matches.trend_7d} />
        </div>
      </div>
    </div>
  );
}