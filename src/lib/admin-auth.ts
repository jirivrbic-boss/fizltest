const ADMIN_SESSION_KEY = "fizl_admin_session";
const ADMIN_PASSWORD = "Jirka123";

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession(): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}
