/**
 * KLAIM API client.
 *
 * The single place where QuickDrop talks to the KLAIM verification service.
 * UI components must never call `fetch` directly — they use these functions.
 *
 * QuickDrop is a relying application: it creates a verification request and
 * polls for its status. It does NOT implement any verification, consent,
 * payment, or proof logic — that lives inside KLAIM.
 */

import { KLAIM_API_URL, USE_MOCK, VERIFIER_ID } from "./config";
import type {
  CreateVerificationResponse,
  VerificationStatusResponse,
} from "../../types/verification";
import { QUICKDROP_CLAIMS } from "../../types/verification";
import {
  mockCreateVerificationRequest,
  mockGetVerificationStatus,
} from "./mock";

/** Categorised error kinds so the UI can show the right friendly message. */
export type KlaimErrorKind = "network" | "client" | "server" | "unknown";

/** Error thrown by the KLAIM client. Never contains raw backend payloads. */
export class KlaimApiError extends Error {
  readonly kind: KlaimErrorKind;
  readonly status?: number;

  constructor(kind: KlaimErrorKind, message: string, status?: number) {
    super(message);
    this.name = "KlaimApiError";
    this.kind = kind;
    this.status = status;
  }

  /** A short, user-facing message that never leaks internals. */
  get friendlyMessage(): string {
    switch (this.kind) {
      case "network":
        return "Unable to connect to KLAIM. Please try again.";
      case "server":
        return "KLAIM verification service is temporarily unavailable. Please try again.";
      case "client":
        return "We couldn't process this verification request. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
}

const REQUEST_TIMEOUT_MS = 15000;

/** Wraps fetch with a timeout and normalised error handling. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${KLAIM_API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    // Network failure, DNS error, CORS block, or timeout/abort.
    throw new KlaimApiError("network", "Network request to KLAIM failed.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const kind: KlaimErrorKind = response.status >= 500 ? "server" : "client";
    throw new KlaimApiError(
      kind,
      `KLAIM responded with status ${response.status}.`,
      response.status,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new KlaimApiError("unknown", "KLAIM returned an unexpected response.");
  }
}

/**
 * Create a new verification request.
 *
 * POST /api/verification-requests
 */
export async function createVerificationRequest(
  userDid: string,
): Promise<CreateVerificationResponse> {
  if (USE_MOCK) return mockCreateVerificationRequest(userDid);
  return request<CreateVerificationResponse>("/api/verification-requests", {
    method: "POST",
    body: JSON.stringify({
      verifierId: VERIFIER_ID,
      userDid,
      claims: QUICKDROP_CLAIMS,
    }),
  });
}

/**
 * Fetch the current status of a verification request.
 *
 * GET /api/verification-requests/:id
 */
export async function getVerificationStatus(
  requestId: string,
): Promise<VerificationStatusResponse> {
  if (USE_MOCK) return mockGetVerificationStatus(requestId);
  return request<VerificationStatusResponse>(
    `/api/verification-requests/${encodeURIComponent(requestId)}`,
  );
}
