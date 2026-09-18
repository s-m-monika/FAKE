import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ScooterIcon, ShieldIcon } from "../components/ui/icons";

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, var(--brand-400), var(--accent-500))",
            color: "#fff",
            boxShadow: "0 12px 28px rgba(34,197,94,0.3)",
          }}
        >
          <ScooterIcon size={30} />
        </span>
      </div>

      <p className="eyebrow center">QuickDrop Partners</p>
      <h1 className="title center">Become a Delivery Partner</h1>
      <p className="subtitle center">
        Deliver when you want. Earn on your schedule. Complete a quick,
        privacy-first verification and start delivering with QuickDrop.
      </p>

      <div className="claims">
        <Highlight text="Flexible hours — you choose when to work" />
        <Highlight text="Weekly payouts, straight to your account" />
        <Highlight text="Your ID documents are never shared with QuickDrop" />
      </div>

      <Button onClick={() => navigate("/onboarding/details")}>
        Start Onboarding
      </Button>

      <p className="muted center mt-24">
        Takes about 2 minutes. Verification is handled securely by KLAIM.
      </p>
    </div>
  );
}

function Highlight({ text }: { text: string }) {
  return (
    <div className="claim">
      <span className="claim__icon">
        <ShieldIcon size={16} />
      </span>
      <div className="claim__label">{text}</div>
    </div>
  );
}
