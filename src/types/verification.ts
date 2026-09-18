/**
 * Types describing the KLAIM verification contract, from QuickDrop's perspective.
 *
 * QuickDrop is a *relying application*. It never implements KLAIM logic — it only
 * models the request/response shapes it sends to and receives from the KLAIM API.
 */

/** Claim identifiers QuickDrop requests from KLAIM. */
export type ClaimKey = "identity_verified" | "age_over_18" | "license_valid";

/** All lifecycle states the KLAIM backend may report for a verification request. */
export type VerificationStatus =
  | "CREATED"
  | "PENDING_CONSENT"
  | "CONSENT_GRANTED"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_SETTLED"
  | "VERIFYING"
  | "PROOF_GENERATED"
  | "VERIFIED"
  | "DENIED"
  | "PAYMENT_FAILED"
  | "CREDENTIAL_INVALID"
  | "VERIFICATION_FAILED";

/** Body sent to POST /api/verification-requests. */
export interface CreateVerificationRequestBody {
  verifierId: string;
  userDid: string;
  claims: ClaimKey[];
}

/** Response from POST /api/verification-requests. */
export interface CreateVerificationResponse {
  requestId: string;
  status: VerificationStatus;
}

/** Response from GET /api/verification-requests/:id. */
export interface VerificationStatusResponse {
  requestId: string;
  status: VerificationStatus;
  claims?: Partial<Record<ClaimKey, boolean>>;
  proofId?: string;
  txId?: string;
}

/** Terminal states — once reached, QuickDrop stops polling. */
export const TERMINAL_STATUSES: VerificationStatus[] = [
  "VERIFIED",
  "DENIED",
  "PAYMENT_FAILED",
  "CREDENTIAL_INVALID",
  "VERIFICATION_FAILED",
];

export function isTerminalStatus(status: VerificationStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** Failure states (a subset of terminal states) that are not a successful VERIFIED. */
export function isFailureStatus(status: VerificationStatus): boolean {
  return (
    status === "DENIED" ||
    status === "PAYMENT_FAILED" ||
    status === "CREDENTIAL_INVALID" ||
    status === "VERIFICATION_FAILED"
  );
}

/**
 * Friendly, user-facing label for each backend status.
 * Keeps technical/backend terminology out of the UI.
 */
export const STATUS_LABELS: Record<VerificationStatus, string> = {
  CREATED: "Verification request created",
  PENDING_CONSENT: "Waiting for authorization",
  CONSENT_GRANTED: "Authorization received",
  PAYMENT_REQUIRED: "Preparing verification",
  PAYMENT_SETTLED: "Verification in progress",
  VERIFYING: "Verifying credentials",
  PROOF_GENERATED: "Finalizing verification",
  VERIFIED: "Verification complete",
  DENIED: "Verification denied",
  PAYMENT_FAILED: "Verification payment failed",
  CREDENTIAL_INVALID: "Credential could not be verified",
  VERIFICATION_FAILED: "Verification failed",
};

/** Human-readable label for each claim key, used across screens. */
export const CLAIM_LABELS: Record<ClaimKey, string> = {
  identity_verified: "Identity",
  age_over_18: "Age eligibility",
  license_valid: "Driving licence",
};

/** The three claims QuickDrop requests for delivery-partner onboarding. */
export const QUICKDROP_CLAIMS: ClaimKey[] = [
  "identity_verified",
  "age_over_18",
  "license_valid",
];

/**
 * Ordered stepper stages shown on the status screen. Each backend status maps to
 * a stage index so the UI can render completed / active / upcoming steps.
 */
export interface ProgressStep {
  key: string;
  label: string;
}

export const PROGRESS_STEPS: ProgressStep[] = [
  { key: "created", label: "Verification request created" },
  { key: "consent", label: "Waiting for your authorization" },
  { key: "credential", label: "Credential verification" },
  { key: "proof", label: "Proof generation" },
  { key: "complete", label: "Verification complete" },
];

/**
 * Returns the index of the *active* step (0-based) for a given status.
 * Steps before this index are considered complete.
 */
export function stepIndexForStatus(status: VerificationStatus): number {
  switch (status) {
    case "CREATED":
      return 1; // request created; now waiting on authorization
    case "PENDING_CONSENT":
      return 1;
    case "CONSENT_GRANTED":
    case "PAYMENT_REQUIRED":
    case "PAYMENT_SETTLED":
    case "VERIFYING":
      return 2; // credential verification
    case "PROOF_GENERATED":
      return 3; // proof generation
    case "VERIFIED":
      return 5; // all steps complete
    // Failure states: freeze progress where it broke.
    case "DENIED":
      return 1;
    case "PAYMENT_FAILED":
      return 2;
    case "CREDENTIAL_INVALID":
    case "VERIFICATION_FAILED":
      return 2;
    default:
      return 0;
  }
}
