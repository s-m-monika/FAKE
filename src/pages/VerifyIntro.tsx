import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { PoweredByKlaim } from "../components/verification/PoweredByKlaim";
import { ArrowRightIcon, HashIcon, InfoIcon } from "../components/ui/icons";
import { createVerificationRequest, KlaimApiError } from "../lib/klaim/api";
import { DEMO_DID, USE_MOCK } from "../lib/klaim/config";
import { useOnboarding } from "../lib/onboardingStore";

export function VerifyIntro() {
  const navigate = useNavigate();
  const { profile, setRequestId } = useOnboarding();

  // Prefill with the configured demo DID; the user can adjust it.
  const [didInput, setDidInput] = useState(DEMO_DID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If someone lands here without completing step 1, send them back.
  useEffect(() => {
    if (!profile) navigate("/onboarding/details", { replace: true });
  }, [profile, navigate]);

  const trimmed = didInput.trim();
  const canContinue = trimmed.length > 0 && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      // Create the verification request. KLAIM mints the REQ-<id>; we store it
      // and the status screen polls it, then fetches the final result.
      const res = await createVerificationRequest(trimmed);
      setRequestId(res.requestId);
      navigate("/onboarding/status");
    } catch (err) {
      setError(
        err instanceof KlaimApiError
          ? err.friendlyMessage
          : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="step-indicator" aria-label="Onboarding progress">
        <span className="step-pill">
          <span className="step-pill__num">1</span>
          Your details
        </span>
        <span className="step-connector" aria-hidden="true" />
        <span className="step-pill step-pill--active">
          <span className="step-pill__num">2</span>
          Verify identity
        </span>
      </div>

      <h1 className="title" style={{ marginTop: 0 }}>
        Verify your identity
      </h1>
      <p className="subtitle">
        Confirm the decentralized identifier (DID) linked to your KLAIM identity
        wallet. We'll send a verification request you can approve from your
        wallet.
      </p>

      {USE_MOCK && (
        <div className="banner banner--info" style={{ marginTop: 18 }}>
          <strong>Demo mode.</strong> KLAIM responses are simulated locally so
          you can preview the full flow. Set a real{" "}
          <code>VITE_KLAIM_API_URL</code> to connect to the live service.
        </div>
      )}

      {error && (
        <div className="banner banner--error" style={{ marginTop: 18 }}>
          {error}
        </div>
      )}

      <div className="field" style={{ marginTop: 22 }}>
        <label className="field__label" htmlFor="did">
          Your DID
        </label>
        <div className="input-icon">
          <span className="input-icon__icon">
            <HashIcon size={18} />
          </span>
          <input
            id="did"
            className="input"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="e.g. did:identipi:demo-user-001"
            value={didInput}
            onChange={(e) => setDidInput(e.target.value)}
          />
        </div>
      </div>

      <div className="help-box">
        <span className="help-box__icon">
          <InfoIcon size={17} />
        </span>
        <div>
          <div className="help-box__title">What happens next?</div>
          <p className="help-box__text">
            KLAIM sends a request to your identity wallet. You approve it there,
            and QuickDrop only receives the verified result — never your
            documents.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Button type="submit" disabled={!canContinue} loading={submitting}>
          {submitting ? "Sending request…" : "Verify with KLAIM"}
          {!submitting && <ArrowRightIcon size={18} />}
        </Button>
        <button
          type="button"
          className="link-back"
          onClick={() => navigate(-1)}
          disabled={submitting}
        >
          ← Back
        </button>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <PoweredByKlaim />
      </div>
    </form>
  );
}
