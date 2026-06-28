const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function bookmarkJob(jobId: string) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/bookmark`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      job_id: jobId,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to bookmark");
  }

  return data;
}

export async function unbookmarkJob(jobId: string) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/bookmark/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to remove bookmark");
  }

  return data;
}

export async function getBookmarks() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/bookmarks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch bookmarks");
  }

  return data.bookmarks;
}
