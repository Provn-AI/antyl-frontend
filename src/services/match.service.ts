const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getToken() {
  return localStorage.getItem(
    "access_token"
  );
}

export async function getMatches() {
  const token =
    getToken();

  const res = await fetch(
    `${API_URL}/match`,
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
      "Failed to load matches"
    );
  }

  return data.matches;
}

export async function updatePipelineStage(
  matchId: string,
  stage: string
) {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${API_URL}/match/${matchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify({
        stage,
      }),
    }
  );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to update stage"
    );
  }

  return data.match;
}

