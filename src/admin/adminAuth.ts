const ADMIN_KEY = "mky_admin_auth";

/**
 * Authenticate against the backend.
 * On success the PHP session is established (httpOnly cookie) and
 * the localStorage flag is set as a UI hint.
 */
export async function adminLogin(
  username: string,
  password: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",          // send/receive session cookie
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem(ADMIN_KEY, "1");
      return true;
    }
  } catch {
    // Network error — fall through to return false
  }
  localStorage.removeItem(ADMIN_KEY);
  return false;
}

/**
 * Destroy the server-side session and clear the local flag.
 * Fire-and-forget is intentional: navigate away immediately.
 */
export function adminLogout(): void {
  localStorage.removeItem(ADMIN_KEY);
  fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "logout" }),
  }).catch(() => { /* ignore — session expires on its own anyway */ });
}

/**
 * UI-only check (localStorage flag).
 * Actual protection is enforced server-side by admin-auth.php.
 */
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "1";
}

/**
 * Server-verified session check. Confirms the PHP session cookie is
 * still valid (not just the localStorage hint) and keeps the hint in
 * sync — clearing it if the server says the session is gone/expired.
 */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/login", { credentials: "include" });
    const data = await res.json();
    const loggedIn = res.ok && !!data.loggedIn;
    if (loggedIn) {
      localStorage.setItem(ADMIN_KEY, "1");
    } else {
      localStorage.removeItem(ADMIN_KEY);
    }
    return loggedIn;
  } catch {
    return false;
  }
}
