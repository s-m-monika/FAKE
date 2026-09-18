import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Stepper } from "../../components/verification/Stepper";
import { ClaimRow } from "../../components/verification/ClaimRow";
import { PoweredByKlaim } from "../../components/verification/PoweredByKlaim";
import { AlertIcon, CheckIcon, ShieldIcon } from "../../components/ui/icons";
import { getVerificationResult, KlaimApiError } from "../../lib/klaim/api";
import { VERIFIER_POLL_INTERVAL_MS } from "../../lib/klaim/config";
import { useVerificationPolling } from "../../lib/useVerificationPolling";
import { useActivity } from "../../lib/activityStore";
import {
  CLAIM_LABELS,
  isFailureStatus,
  normalizeResult,
  stepIndexForStatus,
  STATUS_LABELS,
  type ClaimKey,
  type NormalizedResult,
  type VerificationStatus,
} from "../../types/verification";

export function VerifierDashboard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const requestId = id ?? null;

  const { get, patch } = useActivity();
  const record = requestId ? get(requestId) : undefined;

  const { data, error, loading, refresh } = useVerificationPolling(
    requestId,
    VERIFIER_POLL_INTERVAL_MS,
  );

  const [result, setResult] = useState<NormalizedResult | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);

  const status: VerificationStatus = data?.status ?? record?.status ?? "CREATED";
  const failed = isFailureStatus(status);

  // Keep the persisted activity record in sync with the latest status.
  useEffect(() => {
    if (requestId && data?.status && data.status !== record?.status) {
      patch(requestId, { status: data.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, data?.status]);

  // When VERIFIED, fetch the final result once and store it on the record.
  useEffect(() => {
    if (status !== "VERIFIED" || !requestId || result) return;
    let active = true;
    getVerificationResult(requestId)
      .then((res) => {
        if (!active) return;
        const norm = normalizeResult(res);
        setResult(norm);
        patch(requestId, { status: "VERIFIED", result: norm });
      })
      .catch((err) => {
        if (!active) return;
        setResultError(
          err instanceof KlaimApiError
            ? err.friendlyMessage
            : "Could not load the verification result.",
        );
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, requestId]);

  if (!requestId) {
    navigate("/verifier", { replace: true });
    return null;
  }

  const requestedClaims: ClaimKey[] = record?.claims ?? [];
  const activeIndex = stepIndexForStatus(status);

  return (
    <div className="card">
      <p className="eyebrow">KLAIM Verification</p>
      <h1 className="title" style={{ marginTop: 8 }}>
        {status === "VERIFIED"
          ? "Verification complete"
          : failed
            ? "Verification not completed"
            : "Tracking verification"}
      </h1>
      <p className="subtitle">
        {status === "VERIFIED"
          ? "The user approved and KLAIM returned a verified result."
          : failed
            ? STATUS_LABELS[status] + "."
            : "Waiting for the user to approve this request in their KLAIM wallet. This view updates automatically."}
      </p>

      <div className="meta-block">
        <span className="meta-block__label">Request ID</span>
        <span className="meta-block__value">{requestId}</span>
      </div>
      {record?.userDid && (
        <div className="meta-block">
          <span className="meta-block__label">User DID</span>
          <span className="meta-block__value">{record.userDid}</span>
        </div>
      )}

      {!failed && status !== "VERIFIED" && (
        <>
          <Stepper activeIndex={activeIndex} />
          <p className="progress-caption">
            <strong>{STATUS_LABELS[status]}.</strong>{" "}
            {status === "PENDING_CONSENT" || status === "CREATED"
              ? "The user must approve this in their KLAIM wallet."
              : "You can leave this open — it refreshes automatically."}
          </p>
        </>
      )}

      {failed && (
        <div className="result-hero" style={{ marginTop: 8 }}>
          <span className="result-badge result-badge--danger">
            <AlertIcon size={34} />
          </span>
          <p className="subtitle" style={{ marginTop: 0 }}>
            {STATUS_LABELS[status]}.
          </p>
        </div>
      )}

      {status === "VERIFIED" && (
        <>
          <div className="result-hero" style={{ marginTop: 8 }}>
            <span className="result-badge result-badge--success">
              <CheckIcon size={34} strokeWidth={3} />
            </span>
          </div>
          <div className="claims">
            {(requestedClaims.length > 0
              ? requestedClaims
              : (Object.keys(result?.claims ?? {}) as ClaimKey[])
            ).map((key) => (
              <ClaimRow
                key={key}
                label={CLAIM_LABELS[key] ?? key}
                verified={result?.claims?.[key] !== false}
              />
            ))}
          </div>

          {result?.proofId && (
            <div className="meta-block">
              <span className="meta-block__label">
                Proof ID{result.engine ? ` · ${result.engine}` : ""}
              </span>
              <span className="meta-block__value">{result.proofId}</span>
            </div>
          )}

          {result?.txId && (
            <div className="meta-block">
              <span className="meta-block__label">
                Settlement transaction
                {result.network ? ` · ${result.network}` : ""}
                {result.amount != null ? ` · ${result.amount}` : ""}
              </span>
              <span className="meta-block__value">{result.txId}</span>
              {result.explorerUrl && (
                <a
                  className="explorer-link"
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Algorand explorer →
                </a>
              )}
            </div>
          )}

          <div className="privacy-note" style={{ display: "flex", gap: 10 }}>
            <ShieldIcon size={18} className="" />
            <span>
              Verified through KLAIM. The user's underlying documents were never
              shared with QuickDrop.
            </span>
          </div>
        </>
      )}

      {resultError && (
        <div className="banner banner--error" style={{ marginTop: 16 }}>
          {resultError}
        </div>
      )}

      {error && status !== "VERIFIED" && !failed && (
        <div className="banner banner--info" style={{ marginTop: 16 }}>
          Having trouble reaching KLAIM. Retrying automatically…
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        {!failed && status !== "VERIFIED" && (
          <Button variant="ghost" onClick={refresh} loading={loading}>
            Refresh
          </Button>
        )}
        <Button
          variant={status === "VERIFIED" || failed ? "primary" : "ghost"}
          onClick={() => navigate("/verifier/activity")}
        >
          View activity
        </Button>
      </div>

      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          className="link-back"
          onClick={() => navigate("/verifier")}
        >
          ← New verification
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
        <PoweredByKlaim />
      </div>
    </div>
  );
}
