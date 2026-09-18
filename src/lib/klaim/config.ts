/**
 * Centralised KLAIM configuration, sourced from environment variables so the
 * backend team can change deployment URLs without touching frontend code.
 */

function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

const PLACEHOLDER_HOSTS = [
  "example.com",
  "your-real-klaim-url",
  "your-klaim-url",
];

/** Base URL of the deployed KLAIM API (trailing slash stripped). */
export const KLAIM_API_URL = readEnv(
  "VITE_KLAIM_API_URL",
  "https://klaim-api.example.com",
).replace(/\/+$/, "");

/** Demo user DID used when creating verification requests. */
export const DEMO_DID = readEnv("VITE_DEMO_DID", "did:identipi:demo-user-001");

/** Verifier identifier for this relying application. */
export const VERIFIER_ID = readEnv("VITE_VERIFIER_ID", "quickdrop-demo");

/** Polling interval (ms) while a verification request is active. */
export const POLL_INTERVAL_MS = 4000;

/** True when the API URL still points at a placeholder (not yet configured). */
export const IS_API_CONFIGURED = !PLACEHOLDER_HOSTS.some((h) =>
  KLAIM_API_URL.toLowerCase().includes(h),
);

/**
 * Mock mode simulates the full KLAIM verification lifecycle locally, with no
 * network calls. It lets us demo the entire QuickDrop flow before the real
 * KLAIM backend URL is available.
 *
 * Enabled when either:
 *   - VITE_KLAIM_MOCK=true is set explicitly, OR
 *   - the API URL is still a placeholder (so the demo works out of the box).
 *
 * To use the REAL backend: set a real VITE_KLAIM_API_URL and leave
 * VITE_KLAIM_MOCK unset (or set it to "false").
 */
const MOCK_FLAG = readEnv("VITE_KLAIM_MOCK", "").toLowerCase();
export const USE_MOCK =
  MOCK_FLAG === "true" || (MOCK_FLAG !== "false" && !IS_API_CONFIGURED);

/**
 * How the mock run should end. Lets you demo happy path or failure screens.
 * One of: "verified" | "denied" | "credential_invalid" | "payment_failed"
 */
export const MOCK_OUTCOME = readEnv("VITE_KLAIM_MOCK_OUTCOME", "verified");
