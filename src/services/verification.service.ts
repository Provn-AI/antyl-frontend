const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export async function startVerification() {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/verification/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to start verification");
  }

  return data;
}

export async function getVerificationSession(sessionId: string) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/verification/session/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load session");
  }

  return data;
}

export async function saveAnswer(
  sessionId: string,
  questionIndex: number,
  answer: string,
  timeTakenSeconds: number
) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/verification/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        question_index: questionIndex,
        answer,
        time_taken_seconds: timeTakenSeconds,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to save answer");
  }

  return data;
}

export async function completeVerification(sessionId: string) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/verification/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to complete verification");
  }

  return data;
}

export async function getVerificationScore() {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/verification/score`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch score");
  }

  return data;
}

export async function getVerificationCooldown() {
  const token = getToken();

  const res = await fetch(
    `${API_URL}/developer/verification/cooldown`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch cooldown");
  }

  return data;
}