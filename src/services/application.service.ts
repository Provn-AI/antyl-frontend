const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export async function getAutoApplyLog() {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/autoapply/log`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to load applications"
    );
  }

  return data.applications;
}

export async function withdrawApplication(
  applicationId: string
) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/application/${applicationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to withdraw application"
    );
  }

  return data;
}

export async function getApplications() {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/applications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to load applications"
    );
  }

  return data.applications;
}

export interface TodayApplication {
  application_id: string;
  developer_name: string | null;
  job_title: string | null;
  applied_at: string;
}

export async function getApplicationsToday(): Promise<TodayApplication[]> {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/recruiter/applications/today`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to load today's applications"
    );
  }

  return data.applications;
}