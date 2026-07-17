const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export async function swipeJob(
  jobId: string,
  direction: "left" | "right"
) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/swipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      job_id: jobId,
      direction,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.detail || "Swipe failed") as Error & {
      status?: number;
    };
    error.status = res.status;
    throw error;
  }

  return data;
}

export interface SwipeStatus {
  used: number;
  limit: number;
  remaining: number;
}

export async function getSwipeStatus(): Promise<SwipeStatus> {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/swipe/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch swipe status");
  }

  return data;
}