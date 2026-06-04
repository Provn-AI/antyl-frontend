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