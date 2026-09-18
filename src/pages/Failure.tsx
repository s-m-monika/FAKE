import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { AlertIcon } from "../components/ui/icons";
import { useOnboarding } from "../lib/onboardingStore";
import type { VerificationStatus } from "../types/verification";

interface FailureLocationState {
  status?: VerificationStatus;
}

export function Failure() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setRequestId } = useOnboarding();

  const status = (location.state as FailureLocationState | null)?.status;
  const isDenial = status === "DENIED";

  const heading = isDenial
    ? "Verification not completed"
    : "We couldn't complete verification";

  const body = isDenial
    ? "You denied the KLAIM verification request. You can try again whenever you're ready."
    : "Something went wrong while processing your verification. No documents were shared. Please try again.";

  function handleRetry() {
    // Clear the old request and return to the verification intro to start fresh.
    setRequestId(null);
    navigate("/onboarding/verify", { replace: true });
  }

  return (
    <div className="card">
      <div className="result-hero">
        <span className="result-badge result-badge--danger">
          <AlertIcon size={38} />
        </span>
        <h1 className="title" style={{ marginTop: 0 }}>
          {heading}
        </h1>
        <p className="subtitle" style={{ marginTop: 6 }}>
          {body}
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={handleRetry}>Try Again</Button>
      </div>

      <div style={{ marginTop: 12 }}>
        <Button variant="ghost" onClick={() => navigate("/")}>
          Back to start
        </Button>
      </div>
    </div>
  );
}
