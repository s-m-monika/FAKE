import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/ui/Shell";
import { PwaPrompts } from "./components/ui/PwaPrompts";
import { OnboardingProvider } from "./lib/onboardingStore";
import { Landing } from "./pages/Landing";
import { BasicInfo } from "./pages/BasicInfo";
import { VerifyIntro } from "./pages/VerifyIntro";
import { VerificationStatus } from "./pages/VerificationStatus";
import { Success } from "./pages/Success";
import { Failure } from "./pages/Failure";

export default function App() {
  return (
    <OnboardingProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding/details" element={<BasicInfo />} />
          <Route path="/onboarding/verify" element={<VerifyIntro />} />
          <Route path="/onboarding/status" element={<VerificationStatus />} />
          <Route path="/onboarding/success" element={<Success />} />
          <Route path="/onboarding/failure" element={<Failure />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
      <PwaPrompts />
    </OnboardingProvider>
  );
}
