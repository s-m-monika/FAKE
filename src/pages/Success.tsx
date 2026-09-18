import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ClaimRow } from "../components/verification/ClaimRow";
import { CheckIcon, ShieldIcon } from "../components/ui/icons";
import { getVerificationResult } from "../lib/klaim/api";
import { useOnboarding } from "../lib/onboardingStore";
import {
  CLAIM_LABELS,
  normalizeResult,
  QUICKDROP_CLAIMS,
  type NormalizedResult,
} from "../types/verification";

export function Success() {
  const navigate = useNavigate();
  const { requestId, profile, reset } = useOnboarding();
  const [result, setResult] = useState<NormalizedResult | null>(null);

  useEffect(() => {
    if (!requestId) {
      navigate("/", { replace: true });
      return;
    }
    // Fetch the final result once, to display claims / proof / tx metadata.
    // Per the KLAIM contract this comes from the dedicated /result endpoint.
    let active = true;
    getVerificationResult(requestId)
      .then((res) => {
        if (active) setResult(normalizeResult(res));
      })
      .catch(() => {
        /* Non-fatal: we still show the verified confirmation. */
      });
    return () => {
      active = false;
    };
  }, [requestId, navigate]);

  const claims = result?.claims ?? {};

  function handleContinue() {
    reset();
    navigate("/", { replace: true });
  }

  return (
    <div className="card">
      <div className="result-hero">
        <span className="result-badge result-badge--success">
          <CheckIcon size={38} strokeWidth={3} />
        </span>
        <h1 className="title" style={{ marginTop: 0 }}>
          You're verified
        </h1>
        <p className="subtitle" style={{ marginTop: 6 }}>
          {profile?.fullName ? `${profile.fullName}, your` : "Your"} QuickDrop
          partner verification is complete.
        </p>
      </div>

      <div className="claims">
        {QUICKDROP_CLAIMS.map((key) => (
          <ClaimRow
            key={key}
            label={CLAIM_LABELS[key]}
            verified={claims[key] !== false}
          />
        ))}
      </div>

      {requestId && (
        <div className="meta-block">
          <span className="meta-block__label">Verification ID</span>
          <span className="meta-block__value">{requestId}</span>
        </div>
      )}

      {result?.proofId && (
        <div className="meta-block">
          <span className="meta-block__label">Proof ID</span>
          <span className="meta-block__value">{result.proofId}</span>
        </div>
      )}

      {result?.txId && (
        <div className="meta-block">
          <span className="meta-block__label">Settlement transaction</span>
          <span className="meta-block__value">{result.txId}</span>
        </div>
      )}

      <div className="privacy-note" style={{ display: "flex", gap: 10 }}>
        <ShieldIcon size={18} className="" />
        <span>
          Verified securely through KLAIM. Your underlying identity documents
          were not shared with QuickDrop.
        </span>
      </div>

      <div style={{ marginTop: 22 }}>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
}
