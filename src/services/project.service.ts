const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export interface CreateProjectPayload {
  project_name: string;
  role: string;
  tech_used: string;
  problem_solved: string;
  outcome: string;
  metrics: string;
  live_url?: string;
}

export async function createProject(
  payload: CreateProjectPayload
) {
  const token =
    localStorage.getItem("access_token");

  const res = await fetch(
    `${API_URL}/developer/projects`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
        "Failed to create project"
    );
  }

  return data;
}

export async function deleteProject(
  projectId: string
) {
  const token =
    localStorage.getItem("access_token");

  const res = await fetch(
    `${API_URL}/developer/projects/${projectId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      "Failed to delete project"
    );
  }
}