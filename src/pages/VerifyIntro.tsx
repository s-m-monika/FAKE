import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { PoweredByKlaim } from "../components/verification/PoweredByKlaim";
import { ArrowRightIcon, HashIcon, InfoIcon } from "../components/ui/icons";
import { USE_MOCK } from "../lib/klaim/config";
import { useOnboarding } from "../lib/onboardingStore";

export function VerifyIntro() {
  const navigate = useNavigate();
  const { profile, setRequestId } = useOnboarding();

  const [didInput, setDidInput] = useState("");

  // If someone lands here without completing step 1, send them back.
  useEffect(() => {
    if (!profile) navigate("/onboarding/details", { replace: true });
  }, [profile, navigate]);

  const trimmed = didInput.trim();
  const canContinue = trimmed.length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    // Feed the entered value into the existing verification flow.
    // The status screen polls this via the existing KLAIM integration.
    setRequestId(trimmed);
    navigate("/onboarding/status");
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="step-indicator" aria-label="Onboarding progress">
        <span className="step-pill">
          <span className="step-pill__num">1</span>
          Verify Identity
        </span>
        <span className="step-connector" aria-hidden="true" />
        <span className="step-pill step-pill--active">
          <span className="step-pill__num">2</span>
          Enter DID
        </span>
      </div>

      <h1 className="title" style={{ marginTop: 0 }}>
        Enter your DID
      </h1>
      <p className="subtitle">
        Please enter the decentralized identifier (DID) you received from
        QuickDrop. This helps us fetch your verification details securely.
      </p>

      {USE_MOCK && (
        <div className="banner banner--info" style={{ marginTop: 18 }}>
          <strong>Demo mode.</strong> KLAIM responses are simulated locally so
          you can preview the full flow. Set a real{" "}
          <code>VITE_KLAIM_API_URL</code> to connect to the live service.
        </div>
      )}

      <div className="field" style={{ marginTop: 22 }}>
        <label className="field__label" htmlFor="did">
          DID
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
            autoFocus
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
          <div className="help-box__title">Where can I find this?</div>
          <p className="help-box__text">
            Your DID is shared with you by QuickDrop when you start the
            verification process.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Button type="submit" disabled={!canContinue}>
          Continue
          <ArrowRightIcon size={18} />
        </Button>
        <button type="button" className="link-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <PoweredByKlaim />
      </div>
    </form>
  );
}
