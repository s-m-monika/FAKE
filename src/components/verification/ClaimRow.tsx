import { CheckIcon } from "../ui/icons";

interface ClaimRowProps {
  label: string;
  /** Optional secondary line, e.g. "We'll confirm you're over 18". */
  meta?: string;
  /** When true, shows the "Verified" status on the right. */
  verified?: boolean;
}

/** A single requested/verified claim row. Never displays raw document data. */
export function ClaimRow({ label, meta, verified }: ClaimRowProps) {
  return (
    <div className="claim">
      <span className="claim__icon">
        <CheckIcon size={16} />
      </span>
      <div>
        <div className="claim__label">{label}</div>
        {meta && <div className="claim__meta">{meta}</div>}
      </div>
      {verified && <span className="claim__status">Verified</span>}
    </div>
  );
}
