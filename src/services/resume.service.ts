const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export async function uploadResume(file: File) {
  const token = localStorage.getItem("access_token");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_URL}/developer/resume`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail || "Resume upload failed"
    );
  }

  return data;
}

export async function getResumeStatus() {
  const token = localStorage.getItem("access_token");

  const res = await fetch(
    `${API_URL}/developer/resume/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail || "Failed to fetch status"
    );
  }

  return data;
}