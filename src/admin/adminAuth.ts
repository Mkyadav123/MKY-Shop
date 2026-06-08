const ADMIN_KEY = "mky_admin_auth";

const CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export function adminLogin(
  username: string,
  password: string
): boolean {
  if (
    username === CREDENTIALS.username &&
    password === CREDENTIALS.password
  ) {
    localStorage.setItem(ADMIN_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "1";
}
