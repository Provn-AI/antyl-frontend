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
  linkedin_url?: string; 
  job_status?: string; 
  resume_parsed_data?: {
    work_history?: { company: string; role: string; duration: string; }[];
    education?: { degree: string; institution: string; year: string; }[];
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

export async function uploadProfilePhoto(file: File) {

  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/developer/profile/photo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload photo");
  }

  const data = await res.json();
  return data.profile.avatar_url as string;
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


export interface AutoApplyStatus {
  is_enabled: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export async function getAutoApplyStatus(): Promise<AutoApplyStatus> {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/autoapply/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load auto-apply status");
  }

  return data;
}

export async function toggleAutoApply(isEnabled: boolean) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/autoapply/toggle`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_enabled: isEnabled }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to update auto-apply");
  }

  return data;
}

export interface AutoApplyPreferences {
  is_enabled?: boolean;
  min_similarity_score: number;
  preferred_tech_stack: string[];
  job_type: string[];
  preferred_locations: string[];
}

export async function getAutoApplyPreferences(): Promise<AutoApplyPreferences> {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/autoapply/preferences`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to load preferences");
  }

  return data.preferences;
}

export async function saveAutoApplyPreferences(
  payload: Omit<AutoApplyPreferences, "is_enabled">
) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_URL}/developer/autoapply/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to save preferences");
  }

  return data.preferences;
}