export const AUTH_COOKIE = "pt_auth";

/**
 * Deterministic session token derived from the passcode, so the proxy can
 * validate the cookie without a session store. Rotating PASSCODE logs
 * every device out.
 */
export async function authToken(): Promise<string> {
  const passcode = process.env.PASSCODE;
  if (!passcode) throw new Error("PASSCODE env var is not set");
  const data = new TextEncoder().encode(`pokertracker-v1:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
