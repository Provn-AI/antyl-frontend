const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export interface AutoApplyPreferences {
  preferred_tech_stack: string[];
  salary_min: number;
  salary_max: number;
  job_type: string[];
  preferred_locations: string[];
  min_similarity_score: number;
}

export async function getAutoApplyPreferences() {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/autoapply/preferences`,
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
        "Failed to load preferences"
    );
  }

  return data.preferences;
}

export async function saveAutoApplyPreferences(
  payload: AutoApplyPreferences
) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/autoapply/preferences`,
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
        "Failed to save preferences"
    );
  }

  return data;
}

export async function toggleAutoApply(
  is_enabled: boolean
) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/autoapply/toggle`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_enabled,
      }),
    }
  );

  return res.json();
}