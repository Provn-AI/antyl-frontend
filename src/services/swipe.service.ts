const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export async function swipeJob(
  jobId: string,
  direction: "left" | "right"
) {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${API_URL}/swipe`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        job_id: jobId,
        direction,
      }),
    }
  );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Swipe failed"
    );
  }

  return data;
}