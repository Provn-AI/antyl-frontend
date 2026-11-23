// Free/personal mailbox providers. Recruiters must sign up with a company
// email, so these are rejected at SIGNUP only (login is never checked).
const PERSONAL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.in", "yahoo.co.in", "yahoo.co.uk", "ymail.com", "rocketmail.com",
  "outlook.com", "outlook.in", "hotmail.com", "hotmail.co.in", "hotmail.co.uk",
  "live.com", "live.in", "msn.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "aol.com", "gmx.com", "gmx.net", "mail.com", "yandex.com", "yandex.ru",
  "rediffmail.com", "tutanota.com", "tuta.io", "hey.com", "qq.com", "163.com",
]);

export function isPersonalEmail(email: string): boolean {
  // Local-testing escape hatch: set this in .env.local ONLY (never in
  // production env vars) so you can create recruiter test accounts with gmail.
  if (process.env.NEXT_PUBLIC_ALLOW_PERSONAL_RECRUITER_EMAIL === "true") {
    return false;
  }
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return PERSONAL_DOMAINS.has(domain);
}