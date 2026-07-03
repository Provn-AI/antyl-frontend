const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "developer" | "recruiter"
}

// ── Send OTP ──────────────────────────────────
// signup page: sendOtp(email, "signup", role)
// login page:  sendOtp(email, "login")

export async function sendOtp(
  email: string,
  mode: "signup" | "login",
  role?: "developer" | "recruiter"
): Promise<void> {
  const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login"

  const body: Record<string, string> = { email }
  if (mode === "signup" && role) {
    body.role = role
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

// ── Refresh token ─────────────────────────────
// Call this when a request returns 401 to silently get a new access token.

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refresh_token = localStorage.getItem("refresh_token")
    if (!refresh_token) return null

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    })

    if (!res.ok) {
      // Refresh token is invalid/expired — force logout
      logout()
      return null
    }

    const data = await res.json()
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("refresh_token", data.refresh_token)
    return data.access_token
  } catch {
    logout()
    return null
  }
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

export function isLoggedIn(): boolean {
  return !!getStoredToken() && !!getStoredUser()
}

export function logout(): void {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user")
  window.location.href = "/"
}