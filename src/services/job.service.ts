const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";


export interface Job {
  id: string;
  title: string;
  description?: string;

  location: string;
  job_type: string;
  is_remote: boolean;

  salary_min: number;
  salary_max: number;

  required_tech_stack: string[];

  similarity_score: number;

  company_name?: string;
  industry?: string;
  company_logo?: string;
  company_website?: string;
  company_about?: string;
  company_location?: string;
  remote_policy?: string;
}

export async function getJobFeed() {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${API_URL}/jobs/feed`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
        "Failed to fetch jobs"
    );
  }

  return data.jobs;
}