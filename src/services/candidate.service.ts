const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getToken() {
  return localStorage.getItem(
    "access_token"
  );
}

export async function getCandidates(
  jobId: string
) {
  const token =
    getToken();

  const res = await fetch(
    `${API_URL}/recruiter/jobs/${jobId}/candidates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
        "Failed to load candidates"
    );
  }

  return data.candidates;
}