export interface DemoRequestPayload {
  name: string;
  work_email: string;
  company: string;
  phone?: string;
  team_size?: string;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function submitDemoRequest(payload: DemoRequestPayload) {
  const res = await fetch(`${API_BASE_URL}/api/demo-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to submit demo request");
  }

  return res.json();
}