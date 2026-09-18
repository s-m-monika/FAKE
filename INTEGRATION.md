# QuickDrop ↔ KLAIM Integration Status

QuickDrop is a **relying client** of the KLAIM verification API. It talks only to
Danish's KLAIM API; it does not call Omkar's protocol service directly.

Deployed QuickDrop origin: `https://quickdrop-atnwarjo4q-el.a.run.app`

---

## Locked contract (confirmed with Omkar)

| Item | Value | Status in QuickDrop |
| --- | --- | --- |
| Demo DID | `did:identipi:demo-user-001` | Already the `VITE_DEMO_DID` default ✅ |
| Claim IDs | `identity_verified`, `age_over_18`, `license_valid` | Already hardcoded in `QUICKDROP_CLAIMS` ✅ |
| Create endpoint | `POST /api/verification-requests` | Client implemented ✅ |
| Status endpoint | `GET /api/verification-requests/:id` → `{ status }` | Client polls this ✅ |
| Result endpoint | `GET /api/verification-requests/:id/result` → `{ status, claims, proofId, txId }` | Client + Success screen use this ✅ |
| Request ID | KLAIM mints `REQ-<id>` on create | See "open decision" below |

> **Contract update (Omkar):** status and result are **two separate calls** —
> poll `GET /:id` for `status`, then call `GET /:id/result` for
> `{ claims, proofId, txId }`. QuickDrop now does exactly this
> (`getVerificationStatus` + `getVerificationResult`).

## What is real vs. simulated (Omkar's half of the pipeline)

- **Payment + settlement: REAL, on-chain.** Verification completes only after a
  real USDC transfer settles on Algorand Testnet via GoPlausible. Live example:
  0.01 USDC, txId `3GERT4YDE7VASAP4IOUGRBZLUPAFLHCYDVFMAD6JMCVDZNWIONBA`
  (confirmed on Lora). Invariant "no settlement → no verification" is enforced.
- **Credential behind the claim: synthetic demo credential.** Not a real
  DigiLocker document (DigiLocker is out of scope for the hackathon).
- **ZKP: honest local abstraction**, labelled `engine=local`. Midnight-compatible
  but not a live Midnight circuit. Do not call it a real ZK proof.
- **Privacy: REAL.** Only the boolean claim + `proofId` + `txId` are returned.
  No DOB / Aadhaar / PAN / address / document ever leaves KLAIM.

**One-line framing for the demo:** real money movement + real verification logic
+ privacy-preserving output, on a *simulated identity document*.

---

## ✅ LIVE against the real KLAIM API

- KLAIM API: `https://klaim-api-atnwarjo4q-el.a.run.app`
- CORS: QuickDrop origin `https://quickdrop-atnwarjo4q-el.a.run.app` is allowlisted
  (preflight returns the correct `Access-Control-Allow-Origin`). ✅
- Full lifecycle verified live (dev adapters on, `KLAIM_DEV_ADAPTERS=true`):
  `PENDING_CONSENT → PAYMENT_REQUIRED → PAYMENT_SETTLED → VERIFIED`, and
  `GET /:id/result` returns claims all-true + `proofId` + `proof {engine:local}`.
- QuickDrop rebuilt with `VITE_KLAIM_API_URL=<live>` and `VITE_KLAIM_MOCK=false`,
  deployed as Cloud Run revision `quickdrop-00002-4k6`.
- Note: the live result payload returns `proofId` + a nested `proof` object;
  `txId` is not present (settlement uses dev adapter). QuickDrop shows `txId`
  only if present, so this renders cleanly.

### Reality caveat (for honest demo framing)
Deployed with `KLAIM_DEV_ADAPTERS=true`: consent/settle/verify are driven by dev
endpoints and the proof is `engine=local` (not a live Midnight circuit).
Omkar's real on-chain settlement (real USDC on Algorand) is proven separately
but may not yet be wired into every path. State the demo as: real API + real
lifecycle + privacy-preserving output; settlement/proof via dev adapters.

## (historical) Still needed to switch QuickDrop from mock → real (all from Danish)

1. Live KLAIM API base URL (e.g. `https://klaim-api-xxxxx.run.app`).
2. CORS enabled for origin `https://quickdrop-atnwarjo4q-el.a.run.app`
   (`Access-Control-Allow-Origin`). Most common integration failure if missing.
3. Confirmation `POST /api/verification-requests` and
   `GET /api/verification-requests/:id` are live and return
   `{ status, claims, proofId, txId }`.
4. Confirmation Danish's KLAIM API is deployed AND wired to Omkar's protocol
   endpoints (payment / settlement / proof), so an end-to-end run actually works.
5. A test `requestId` (or confirmation the create flow mints one) to run one real
   end-to-end verification.

## Open decision on QuickDrop's side (blocks the real run)

Step 2 currently asks the user to **type an existing DID / Request ID**. But
KLAIM **mints** the `requestId` on create. For the real demo, pick:

- **(A) QuickDrop creates the request** (recommended — matches KLAIM minting
  `REQ-<id>`): Step 2 calls `createVerificationRequest(did)`, KLAIM returns
  `REQ-<id>`, QuickDrop polls it. User just clicks "Verify".
- **(B) Keep manual entry**: only works if the request was created elsewhere
  first and the user pastes that `REQ-<id>`.

## Flip-to-real procedure (once #1–#5 are supplied)

```powershell
gcloud builds submit --config cloudbuild.yaml --project klaim-509005 `
  --substitutions=_VITE_KLAIM_API_URL=https://REAL-KLAIM-URL,_VITE_KLAIM_MOCK=false

gcloud run deploy quickdrop `
  --image=asia-south1-docker.pkg.dev/klaim-509005/quickdrop/quickdrop:latest `
  --region=asia-south1 --allow-unauthenticated --port=8080 --project=klaim-509005
```
