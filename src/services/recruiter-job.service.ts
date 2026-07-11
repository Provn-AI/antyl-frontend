const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createJob(payload: {
  title: string;
  description: string;
  required_tech_stack: string[];
  experience_level: string;          // ← changed from number to string
  salary_min: number;
  salary_max: number;
  job_type: string;
  location: string;
  is_remote: boolean;
  min_score: number;
  max_score: number;
}) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to create job");
  }

  return data;
}

export async function getRecruiterJobs() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load jobs");
  }

  return data.jobs;
}

export async function updateJobStatus(jobId: string, status: string) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/jobs/${jobId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to update job");
  }

  return data;
}

export async function getJobCandidates(jobId: string) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/jobs/${jobId}/candidates`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load candidates");
  }

  return data.candidates;
}

export async function getJob(jobId: string) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load job");
  }

  return data.job;
}

export async function updateJob(jobId: string, payload: Record<string, unknown>) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/jobs/${jobId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to update job");
  }

  return data.job;
}

export async function saveCandidateNote(
  developerId: string,
  jobId: string,
  note: string
) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/recruiter/candidate/note`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      developer_id: developerId,
      job_id: jobId,
      note,
    }),
  });

  return res.json();
}

export async function autofillJob(title: string, context?: string) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/ai/autofill-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, context }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Auto-fill failed");
  return data;
}

export async function trackResumeViewed(applicationId: string) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${API_URL}/recruiter/candidate/${applicationId}/resume-viewed`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) console.error("Failed to track resume view");
}