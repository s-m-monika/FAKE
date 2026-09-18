import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { DEMO_DID } from "./klaim/config";

/** Minimal, non-sensitive profile captured during onboarding (demo only). */
export interface PartnerProfile {
  fullName: string;
  mobile: string;
  city: string;
}

interface OnboardingState {
  profile: PartnerProfile | null;
  requestId: string | null;
  /** DID used for the verification request (configurable demo DID). */
  userDid: string;
  setProfile: (profile: PartnerProfile) => void;
  setRequestId: (id: string | null) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const value = useMemo<OnboardingState>(
    () => ({
      profile,
      requestId,
      userDid: DEMO_DID,
      setProfile,
      setRequestId,
      reset: () => {
        setProfile(null);
        setRequestId(null);
      },
    }),
    [profile, requestId],
  );

  return createElement(OnboardingContext.Provider, { value }, children);
}

export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}
