const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ResumeEvaluation {
  score: number;
  breakdown: {
    skills_clarity: number;
    project_depth: number;
    verifiability: number;
  };
  resume_filename: string;
}

export async function evaluateResume(
  file: File
): Promise<ResumeEvaluation> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/waitlist/evaluate`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to evaluate resume");
  }

  return data as ResumeEvaluation;
}

export interface WaitlistSubmitPayload {
  name: string;
  email: string;
  mobile: string;
  score: number;
  resume_filename?: string;
}

export async function submitWaitlist(
  payload: WaitlistSubmitPayload
) {
  const res = await fetch(`${API_URL}/waitlist/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to join waitlist");
  }

  return data;
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/waitlist/count`);
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}