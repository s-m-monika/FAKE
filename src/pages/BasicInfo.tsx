import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useOnboarding } from "../lib/onboardingStore";

const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
];

interface FieldErrors {
  fullName?: string;
  mobile?: string;
}

export function BasicInfo() {
  const navigate = useNavigate();
  const { profile, setProfile } = useOnboarding();

  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [mobile, setMobile] = useState(profile?.mobile ?? "");
  const [city, setCity] = useState(profile?.city ?? CITIES[0]);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const next: FieldErrors = {};
    if (fullName.trim().length < 2) {
      next.fullName = "Please enter your full name.";
    }
    // Demo-friendly mobile check: 10 digits, optional country code.
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 10) {
      next.mobile = "Enter a valid mobile number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setProfile({ fullName: fullName.trim(), mobile: mobile.trim(), city });
    navigate("/onboarding/verify");
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <p className="eyebrow">Step 1 of 2</p>
      <h1 className="title">Create your delivery partner profile</h1>
      <p className="subtitle">
        Just a few basics to get started. We'll verify your eligibility in the
        next step.
      </p>

      <div style={{ marginTop: 24 }}>
        <div className="field">
          <label className="field__label" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            className={`input ${errors.fullName ? "input--error" : ""}`}
            type="text"
            autoComplete="name"
            placeholder="e.g. Aarav Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && <p className="field__error">{errors.fullName}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="mobile">
            Mobile Number
          </label>
          <input
            id="mobile"
            className={`input ${errors.mobile ? "input--error" : ""}`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="e.g. 98765 43210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          {errors.mobile && <p className="field__error">{errors.mobile}</p>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="city">
            City
          </label>
          <select
            id="city"
            className="select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit">Continue</Button>

      <p className="muted center mt-24">
        We only collect basic contact details. No identity documents here.
      </p>
    </form>
  );
}
