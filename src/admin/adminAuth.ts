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
