import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/ui/Shell";
import { PwaPrompts } from "./components/ui/PwaPrompts";
import { OnboardingProvider } from "./lib/onboardingStore";
import { ActivityProvider } from "./lib/activityStore";
import { Landing } from "./pages/Landing";
import { BasicInfo } from "./pages/BasicInfo";
import { VerifyIntro } from "./pages/VerifyIntro";
import { VerificationStatus } from "./pages/VerificationStatus";
import { Success } from "./pages/Success";
import { Failure } from "./pages/Failure";
import { VerifierNew } from "./pages/verifier/VerifierNew";
import { VerifierDashboard } from "./pages/verifier/VerifierDashboard";
import { VerifierActivity } from "./pages/verifier/VerifierActivity";

export default function App() {
  return (
    <OnboardingProvider>
      <ActivityProvider>
        <Shell>
          <Routes>
            {/* Consumer onboarding flow */}
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding/details" element={<BasicInfo />} />
            <Route path="/onboarding/verify" element={<VerifyIntro />} />
            <Route path="/onboarding/status" element={<VerificationStatus />} />
            <Route path="/onboarding/success" element={<Success />} />
            <Route path="/onboarding/failure" element={<Failure />} />

            {/* Verifier tool: create + track + activity */}
            <Route path="/verifier" element={<VerifierNew />} />
            <Route path="/verifier/activity" element={<VerifierActivity />} />
            <Route path="/verifier/:id" element={<VerifierDashboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
        <PwaPrompts />
      </ActivityProvider>
    </OnboardingProvider>
  );
}
