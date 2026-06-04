const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export interface CreateProfilePayload {
  name: string;
  city: string;
  current_role: string;
  bio: string;
}

export async function createProfile(
  payload: CreateProfilePayload
) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(
    `${API_URL}/developer/profile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail || "Failed to create profile"
    );
  }

  return data;
}

export interface UpdateProfilePayload {
  name?: string;
  city?: string;
  current_role?: string;
  bio?: string;

  years_experience?: number;

  tech_stack?: string[];

  resume_parsed_data?: {
    work_history?: {
      company: string;
      role: string;
      duration: string;
    }[];

    education?: {
      degree: string;
      institution: string;
      year: string;
    }[];
  };
}

export async function updateProfile(
  payload: UpdateProfilePayload
) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(
    `${API_URL}/developer/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail || "Failed to update profile"
    );
  }

  return data;
}