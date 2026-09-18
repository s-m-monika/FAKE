import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Stepper } from "../components/verification/Stepper";
import { PoweredByKlaim } from "../components/verification/PoweredByKlaim";
import { useOnboarding } from "../lib/onboardingStore";
import { useVerificationPolling } from "../lib/useVerificationPolling";
import {
  isFailureStatus,
  STATUS_LABELS,
  stepIndexForStatus,
  type VerificationStatus,
} from "../types/verification";

export function VerificationStatus() {
  const navigate = useNavigate();
  const { requestId } = useOnboarding();

  const { data, error, loading, refresh } = useVerificationPolling(requestId);

  // Guard: no active request → back to intro.
  useEffect(() => {
    if (!requestId) navigate("/onboarding/verify", { replace: true });
  }, [requestId, navigate]);

  // On terminal states, route to the right result screen.
  useEffect(() => {
    const status = data?.status;
    if (!status) return;
    if (status === "VERIFIED") {
      navigate("/onboarding/success", { replace: true });
    } else if (isFailureStatus(status)) {
      navigate("/onboarding/failure", {
        replace: true,
        state: { status },
      });
    }
  }, [data?.status, navigate]);

  const status: VerificationStatus = data?.status ?? "CREATED";
  const activeIndex = stepIndexForStatus(status);
  const friendly = STATUS_LABELS[status];

  return (
    <div className="card">
      <p className="eyebrow">KLAIM Verification</p>
      <h1 className="title">Verifying your eligibility</h1>
      <p className="subtitle">
        Your verification request has been sent. Approve it from your KLAIM
        identity wallet to continue.
      </p>

      {requestId && (
        <div className="meta-block">
          <span className="meta-block__label">DID</span>
          <span className="meta-block__value">{requestId}</span>
        </div>
      )}

      <Stepper activeIndex={activeIndex} />

      <p className="progress-caption">
        <strong>{friendly}.</strong>{" "}
        {status === "PENDING_CONSENT" || status === "CREATED"
          ? "Please approve the request from your KLAIM identity wallet."
          : "You can leave this page open — we'll update automatically."}
      </p>

      {error && (
        <div className="banner banner--info" style={{ marginTop: 16 }}>
          Having trouble reaching KLAIM. Retrying automatically…
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button variant="ghost" onClick={refresh} loading={loading}>
          Refresh Status
        </Button>
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <PoweredByKlaim />
      </div>
    </div>
  );
}
