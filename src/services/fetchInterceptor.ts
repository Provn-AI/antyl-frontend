"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let patched = false;

export function initFetchInterceptor() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const originalFetch = window.fetch;

  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const res = await originalFetch(...args);

    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;

    // Only act on calls to our own backend, and skip the auth endpoints themselves
    if (
      res.status === 401 &&
      url.startsWith(API_URL) &&
      !url.includes("/auth/")
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return res;
  };
}