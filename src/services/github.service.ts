const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getAuthToken() {
  return localStorage.getItem("access_token");
}

export async function exchangeGithubCode(
  code: string
) {
  const res = await fetch(
    `${API_URL}/developer/github/exchange`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail || "Failed to exchange code"
    );
  }

  return data;
}

export async function connectGithub(
  githubAccessToken: string
) {
  const token = getAuthToken();

  const res = await fetch(
    `${API_URL}/developer/github/connect`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        access_token: githubAccessToken,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail || "Failed to connect GitHub"
    );
  }

  return data;
}