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

export async function getMyProfile() {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${API_URL}/developer/profile/me`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to load profile"
    );
  }

  return data.profile;
}

export async function getDeveloperProfile(
  userId: string
) {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${API_URL}/developer/profile/${userId}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.detail ||
      "Failed to load profile"
    );
  }

  return data.profile;
}

export async function getVerificationHistory() {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${
      process.env
        .NEXT_PUBLIC_API_URL
    }/developer/verification/history`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const data =
    await res.json();

  return data.history || [];
}
export async function disconnectGithub() {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${
      process.env
        .NEXT_PUBLIC_API_URL
    }/developer/github/disconnect`,
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return res.json();
}

export async function deleteAccount() {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const res = await fetch(
    `${
      process.env
        .NEXT_PUBLIC_API_URL
    }/developer/account`,
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return res.json();
}


