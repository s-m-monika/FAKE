/**
 * Local mock of the KLAIM API.
 *
 * This simulates the KLAIM verification lifecycle entirely in the browser so the
 * QuickDrop UI can be demoed before the real backend URL is available. It does
 * NOT implement any real KLAIM logic (no consent, payment, credential, or proof
 * logic) — it just returns canned status transitions on a timeline, exactly the
 * shape the real API would return.
 *
 * Swap it out by setting a real VITE_KLAIM_API_URL and VITE_KLAIM_MOCK=false.
 */

import { MOCK_OUTCOME } from "./config";
import type {
  CreateVerificationResponse,
  VerificationStatus,
  VerificationStatusResponse,
} from "../../types/verification";

/** Timeline entry: after `atMs` from creation, the request is in `status`. */
interface TimelineStep {
  atMs: number;
  status: VerificationStatus;
}

/** Happy path: advances through the lifecycle then lands on VERIFIED. */
const VERIFIED_TIMELINE: TimelineStep[] = [
  { atMs: 0, status: "PENDING_CONSENT" },
  { atMs: 6000, status: "CONSENT_GRANTED" },
  { atMs: 9000, status: "PAYMENT_REQUIRED" },
  { atMs: 12000, status: "PAYMENT_SETTLED" },
  { atMs: 15000, status: "VERIFYING" },
  { atMs: 19000, status: "PROOF_GENERATED" },
  { atMs: 22000, status: "VERIFIED" },
];

/** User denies consent early. */
const DENIED_TIMELINE: TimelineStep[] = [
  { atMs: 0, status: "PENDING_CONSENT" },
  { atMs: 8000, status: "DENIED" },
];

/** Payment never settles. */
const PAYMENT_FAILED_TIMELINE: TimelineStep[] = [
  { atMs: 0, status: "PENDING_CONSENT" },
  { atMs: 6000, status: "CONSENT_GRANTED" },
  { atMs: 9000, status: "PAYMENT_REQUIRED" },
  { atMs: 13000, status: "PAYMENT_FAILED" },
];

/** Credential can't be verified. */
const CREDENTIAL_INVALID_TIMELINE: TimelineStep[] = [
  { atMs: 0, status: "PENDING_CONSENT" },
  { atMs: 6000, status: "CONSENT_GRANTED" },
  { atMs: 9000, status: "PAYMENT_REQUIRED" },
  { atMs: 12000, status: "PAYMENT_SETTLED" },
  { atMs: 15000, status: "VERIFYING" },
  { atMs: 19000, status: "CREDENTIAL_INVALID" },
];

function timelineForOutcome(outcome: string): TimelineStep[] {
  switch (outcome.toLowerCase()) {
    case "denied":
      return DENIED_TIMELINE;
    case "payment_failed":
      return PAYMENT_FAILED_TIMELINE;
    case "credential_invalid":
      return CREDENTIAL_INVALID_TIMELINE;
    case "verified":
    default:
      return VERIFIED_TIMELINE;
  }
}

interface MockRequest {
  requestId: string;
  createdAt: number;
  timeline: TimelineStep[];
}

const store = new Map<string, MockRequest>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve the current status for a request based on elapsed time. */
function currentStep(req: MockRequest): TimelineStep {
  const elapsed = Date.now() - req.createdAt;
  let current = req.timeline[0];
  for (const step of req.timeline) {
    if (elapsed >= step.atMs) current = step;
  }
  return current;
}

export async function mockCreateVerificationRequest(
  _userDid: string,
): Promise<CreateVerificationResponse> {
  await delay(600); // simulate a little latency
  const requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  store.set(requestId, {
    requestId,
    createdAt: Date.now(),
    timeline: timelineForOutcome(MOCK_OUTCOME),
  });
  return { requestId, status: "PENDING_CONSENT" };
}

export async function mockGetVerificationStatus(
  requestId: string,
): Promise<VerificationStatusResponse> {
  await delay(300);
  const req = store.get(requestId);

  // If the app was reloaded (store lost), rehydrate a fresh timeline so the
  // demo keeps working instead of erroring.
  const active =
    req ??
    (() => {
      const created: MockRequest = {
        requestId,
        createdAt: Date.now(),
        timeline: timelineForOutcome(MOCK_OUTCOME),
      };
      store.set(requestId, created);
      return created;
    })();

  const step = currentStep(active);

  const base: VerificationStatusResponse = {
    requestId,
    status: step.status,
  };

  if (step.status === "VERIFIED") {
    base.claims = {
      identity_verified: true,
      age_over_18: true,
      license_valid: true,
    };
    base.proofId = `proof-${requestId.replace("REQ-", "")}`;
    base.txId = `ALG-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  return base;
}
