/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_KLAIM_API_URL: string;
  readonly VITE_DEMO_DID: string;
  readonly VITE_VERIFIER_ID: string;
  readonly VITE_KLAIM_MOCK: string;
  readonly VITE_KLAIM_MOCK_OUTCOME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
