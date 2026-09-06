"use client";

import { useEffect, useState } from "react";
import { fetchAdminMetrics, adminLogout, DashboardMetrics } from "@/lib/adminDashboard";
import LoginForm from "./_components/LoginForm";
import MetricCard from "./_components/MetricCard";
import MonthlyLineChart from "./_components/MonthlyLineChart";
import CompanyBarChart from "./_components/CompanyBarChart";
import CandidateMetricsSection from "./_components/CandidateMetricsSection";

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
  if (!authenticated) return <LoginForm onSuccess={loadMetrics} />;
  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
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

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recruiters — Growth</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MonthlyLineChart title="Recruiter signups per month" data={metrics.recruiter_monthly_users} />
            <MonthlyLineChart title="Jobs posted per month" data={metrics.jobs_monthly} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Live jobs right now</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{metrics.live_jobs}</p>
            </div>
            <CompanyBarChart data={metrics.jobs_per_company} />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Candidates</h2>
          <CandidateMetricsSection data={metrics.candidate_metrics} />
        </div>
      </div>
    </div>
  );
}