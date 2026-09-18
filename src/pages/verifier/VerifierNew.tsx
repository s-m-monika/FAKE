import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { PoweredByKlaim } from "../../components/verification/PoweredByKlaim";
import {
  ArrowRightIcon,
  CheckIcon,
  HashIcon,
  InfoIcon,
} from "../../components/ui/icons";
import { createVerificationRequest, KlaimApiError } from "../../lib/klaim/api";
import { DEMO_DID, USE_MOCK } from "../../lib/klaim/config";
import { useActivity } from "../../lib/activityStore";
import {
  CLAIM_LABELS,
  QUICKDROP_CLAIMS,
  type ClaimKey,
} from "../../types/verification";

/**
 * Verifier-facing screen: paste a user's DID, pick which claims to request,
 * and create a KLAIM verification request. QuickDrop then tracks it by polling.
 */
export function VerifierNew() {
  const navigate = useNavigate();
  const { upsert } = useActivity();

  const [did, setDid] = useState(DEMO_DID);
  const [selected, setSelected] = useState<Set<ClaimKey>>(
    () => new Set(QUICKDROP_CLAIMS),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedDid = did.trim();
  const canSubmit = trimmedDid.length > 0 && selected.size > 0 && !submitting;

  function toggleClaim(key: ClaimKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    // Preserve the canonical claim order.
    const claims = QUICKDROP_CLAIMS.filter((c) => selected.has(c));

    try {
      const res = await createVerificationRequest(trimmedDid, claims);
      const now = new Date().toISOString();
      upsert({
        requestId: res.requestId,
        userDid: trimmedDid,
        claims,
        status: res.status,
        createdAt: now,
        updatedAt: now,
      });
      navigate(`/verifier/${encodeURIComponent(res.requestId)}`);
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
      <p className="eyebrow">QuickDrop Verifier</p>
      <h1 className="title" style={{ marginTop: 8 }}>
        Request a verification
      </h1>
      <p className="subtitle">
        Enter the user's DID and choose the claims to verify. KLAIM sends the
        request to the user's identity wallet for approval.
      </p>

      {USE_MOCK && (
        <div className="banner banner--info" style={{ marginTop: 18 }}>
          <strong>Demo mode.</strong> KLAIM responses are simulated locally.
        </div>
      )}

      {error && (
        <div className="banner banner--error" style={{ marginTop: 18 }}>
          {error}
        </div>
      )}

      <div className="field" style={{ marginTop: 22 }}>
        <label className="field__label" htmlFor="did">
          User DID
        </label>
        <div className="input-icon">
          <span className="input-icon__icon">
            <HashIcon size={18} />
          </span>
          <input
            id="did"
            className="input"
            type="text"
            autoComplete="off"
            placeholder="e.g. did:identipi:demo-user-001"
            value={did}
            onChange={(e) => setDid(e.target.value)}
          />
        </div>
      </div>

      <p className="field__label" style={{ marginBottom: 12 }}>
        Claims to verify
      </p>
      <div className="claims" style={{ margin: 0 }}>
        {QUICKDROP_CLAIMS.map((key) => {
          const on = selected.has(key);
          return (
            <button
              type="button"
              key={key}
              className={`claim claim--selectable ${on ? "claim--on" : ""}`}
              onClick={() => toggleClaim(key)}
              aria-pressed={on}
            >
              <span className={`checkbox ${on ? "checkbox--on" : ""}`}>
                {on && <CheckIcon size={14} />}
              </span>
              <span className="claim__label">{CLAIM_LABELS[key]}</span>
              <span className="claim__meta" style={{ marginLeft: "auto" }}>
                {key}
              </span>
            </button>
          );
        })}
      </div>

      {selected.size === 0 && (
        <p className="field__error" style={{ marginTop: 10 }}>
          Select at least one claim.
        </p>
      )}

      <div className="help-box" style={{ marginTop: 18 }}>
        <span className="help-box__icon">
          <InfoIcon size={17} />
        </span>
        <div>
          <div className="help-box__title">How verification works</div>
          <p className="help-box__text">
            The user approves this request in their own KLAIM wallet. QuickDrop
            only receives the verified result — never the underlying documents.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Button type="submit" disabled={!canSubmit} loading={submitting}>
          {submitting ? "Creating request…" : "Request verification"}
          {!submitting && <ArrowRightIcon size={18} />}
        </Button>
      </div>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
        <PoweredByKlaim />
      </div>
    </form>
  );
}
