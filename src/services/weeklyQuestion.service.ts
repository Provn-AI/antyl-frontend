const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
}

export async function getActiveQuestion() {
  const res = await fetch(`${API_URL}/weekly-question/active`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  return data.question || null;
}

export async function answerQuestion(
  questionId: string,
  selectedOption: string | null,
  otherText: string | null
) {
  const res = await fetch(
    `${API_URL}/weekly-question/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selected_option: selectedOption,
        other_text: otherText,
      }),
    }
  );
  return res.json();
}

export async function dismissQuestion(questionId: string) {
  const res = await fetch(
    `${API_URL}/weekly-question/${questionId}/dismiss`,
    {
      method: "POST",
      headers: authHeaders(),
    }
  );
  return res.json();
}

export async function getActiveBlog() {
  const res = await fetch(`${API_URL}/weekly-blog/active`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  return data.blog || null;
}

// ── Admin panel ──

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/admin/weekly-question/check`, {
      headers: authHeaders(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.is_admin);
  } catch {
    return false;
  }
}

export async function getWeekStatus(audience: "developer" | "recruiter") {
  const res = await fetch(
    `${API_URL}/admin/weekly-question/status/${audience}`,
    { headers: authHeaders() }
  );
  return res.json();
}

export async function postWeeklyQuestion(
  audience: "developer" | "recruiter",
  questionText: string,
  options: string[]
) {
  const res = await fetch(`${API_URL}/admin/weekly-question/post`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audience,
      question_text: questionText,
      options,
    }),
  });
  return res.json();
}