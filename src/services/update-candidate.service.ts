const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";


export async function updateCandidateStatus(
  applicationId: string,
  status: string
) {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${API_URL}/recruiter/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  return res.json();
}