const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "developer" | "recruiter"
}

// ── Send OTP ──────────────────────────────────
// signup page: sendOtp(email, "signup")
// login page:  sendOtp(email, "login")

export async function sendOtp(
  email: string,
  mode: "signup" | "login"
): Promise<void> {
  const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login"

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Failed to send OTP")
}

// ── Verify OTP ────────────────────────────────

export async function verifyOtp(
  email: string,
  token: string,
  role?: "developer" | "recruiter"
): Promise<{ user: AuthUser; access_token: string }> {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, role }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || "Invalid OTP. Please try again.")

  localStorage.setItem("access_token", data.access_token)
  localStorage.setItem("refresh_token", data.refresh_token)
  localStorage.setItem("user", JSON.stringify(data.user))

  return data
}

// ── Helpers ───────────────────────────────────

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

export function logout(): void {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
  window.location.href = "/login"
}