# QuickDrop

QuickDrop is a fictional delivery/gig platform used to demonstrate **KLAIM**, a
privacy-first identity verification API. This repository is the **QuickDrop
delivery-partner onboarding frontend** — a *relying application* that is a
**client of the KLAIM API**.

QuickDrop never receives a user's underlying identity documents. It asks KLAIM
to verify specific claims and displays only the result:

```json
{ "identity_verified": true, "age_over_18": true, "license_valid": true }
```

> **Scope:** This app implements only the QuickDrop side. It does **not**
> implement KLAIM, Idina, the user wallet/PWA, ZKP, x402, Algorand, or MCP.
> Those are owned by other team members. QuickDrop only calls the KLAIM REST API.

---

## Tech stack

- Vite + React 18 + TypeScript
- React Router (client-side routing)
- Framer Motion (subtle screen transitions)
- No CSS framework — a small hand-rolled design system in `src/styles/global.css`

## User journey

```
Landing → Basic details → Verify with KLAIM → Status (polling) → Success / Failure
```

1. **Landing** — brand intro, "Start Onboarding".
2. **Basic Information** — demo-only name / mobile / city (no KYC, no documents).
3. **Verification Introduction** — shows the three claims, "Verify with KLAIM".
4. **Create request** — `POST /api/verification-requests`, stores `requestId`.
5. **Verification Status** — polls `GET /api/verification-requests/:id` every
   ~4s, renders a friendly stepper, stops at a terminal state.
6. **Success** — shows verified claims + `Verification ID`, optional `Proof ID`
   and settlement transaction. Never displays raw identity data.
7. **Failure / Denial** — friendly retry screen; no stack traces or raw errors.

## Project structure

```
src/
├── components/
│   ├── ui/            Button, Shell, icons
│   └── verification/  ClaimRow, Stepper, PoweredByKlaim
├── pages/             Landing, BasicInfo, VerifyIntro, VerificationStatus, Success, Failure
├── lib/
│   ├── klaim/         api.ts (KLAIM client), config.ts (env)
│   ├── onboardingStore.ts       flow state (profile + requestId)
│   └── useVerificationPolling.ts status polling with cleanup
├── types/
│   └── verification.ts  status enums, claim keys, UI status mapping
└── styles/global.css
```

All KLAIM network calls live in `src/lib/klaim/api.ts`. UI components never
call `fetch` directly.

## Environment configuration

The KLAIM API URL is **never hardcoded**. Copy `.env.example` to `.env`:

```bash
VITE_KLAIM_API_URL=https://klaim-api-xxxxx.run.app
VITE_DEMO_DID=did:identipi:demo-user-001
VITE_VERIFIER_ID=quickdrop-demo
```

The backend team can change the deployment URL by setting `VITE_KLAIM_API_URL`
at build time — no code changes needed.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build locally
```

## Deployment

The output is a static SPA in `dist/`. Deploy to any static host. SPA
rewrites (all routes → `index.html`) are already configured:

- **Vercel** — `vercel.json` present. Set env vars in the project settings,
  then `vercel --prod`.
- **Netlify** — `public/_redirects` present. Build command `npm run build`,
  publish directory `dist`. Set env vars in site settings.
- **Cloud Run / static bucket** — serve `dist/` behind a server that rewrites
  unknown routes to `index.html`.

### Deployment checklist

1. Get `VITE_KLAIM_API_URL` (and demo DID) from the KLAIM backend owner.
2. Set the env vars in the host's build configuration.
3. `npm run build` and deploy `dist/`.
4. Open the deployed URL and run the flow end-to-end.
5. Confirm the browser can reach the KLAIM API (check the Network tab) and that
   **CORS** allows the deployed origin — the KLAIM API must send
   `Access-Control-Allow-Origin` for the QuickDrop domain.
6. Share the final public URL with the team.

## Privacy & UX rules honoured

- Collects/displays **no** Aadhaar, PAN, DOB, address, document images, raw
  credentials, private keys, or wallet secrets.
- Never claims "verified" until KLAIM returns `status = VERIFIED`.
- Backend status codes are mapped to friendly labels; raw API responses and
  stack traces are never shown to users.
- Polling stops at terminal states and the timer is cleaned up on unmount.
