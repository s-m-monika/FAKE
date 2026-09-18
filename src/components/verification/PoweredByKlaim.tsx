import { ShieldIcon } from "../ui/icons";

/** Small, secondary chip indicating KLAIM provides the verification. */
export function PoweredByKlaim() {
  return (
    <span className="powered">
      <ShieldIcon size={15} />
      Powered by <strong>KLAIM</strong>
    </span>
  );
}
