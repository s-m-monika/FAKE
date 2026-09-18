import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useActivity } from "../../lib/activityStore";
import {
  isFailureStatus,
  STATUS_LABELS,
  type VerificationStatus,
} from "../../types/verification";

function badgeClass(status: VerificationStatus): string {
  if (status === "VERIFIED") return "pill pill--success";
  if (isFailureStatus(status)) return "pill pill--danger";
  return "pill pill--pending";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function VerifierActivity() {
  const navigate = useNavigate();
  const { records, clear } = useActivity();

  return (
    <div className="card">
      <p className="eyebrow">QuickDrop Verifier</p>
      <h1 className="title" style={{ marginTop: 8 }}>
        Verification activity
      </h1>
      <p className="subtitle">
        Every verification request you've created, with its latest outcome.
      </p>

      {records.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No verifications yet.</p>
        </div>
      ) : (
        <div className="activity-list">
          {records.map((r) => (
            <button
              type="button"
              key={r.requestId}
              className="activity-item"
              onClick={() =>
                navigate(`/verifier/${encodeURIComponent(r.requestId)}`)
              }
            >
              <div className="activity-item__top">
                <span className="activity-item__id">{r.requestId}</span>
                <span className={badgeClass(r.status)}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <div className="activity-item__did">{r.userDid}</div>
              <div className="activity-item__meta">
                <span>{r.claims.join(", ")}</span>
                <span className="muted">{formatDate(r.createdAt)}</span>
              </div>
              {r.result?.txId && (
                <div className="activity-item__tx">tx: {r.result.txId}</div>
              )}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <Button onClick={() => navigate("/verifier")}>
          New verification
        </Button>
        {records.length > 0 && (
          <button
            type="button"
            className="link-back"
            onClick={clear}
            style={{ marginTop: 12 }}
          >
            Clear activity
          </button>
        )}
      </div>
    </div>
  );
}
