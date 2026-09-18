import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

/**
 * Handles PWA lifecycle UX, kept fully separate from the onboarding UI:
 *  - "Install app" button (Add to Home Screen) when the browser offers it.
 *  - "New version available" reload prompt when the service worker updates.
 *
 * Rendered as a fixed, dismissible toast in the corner. It does not alter any
 * routes, API logic, or existing screens.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaPrompts() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<
    ((reload?: boolean) => Promise<void>) | null
  >(null);

  // Register the service worker and listen for updates.
  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });
    setUpdateSW(() => update);
  }, []);

  // Capture the install prompt so we can trigger it from our own button.
  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstallEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (needRefresh) {
    return (
      <div className="pwa-toast" role="status">
        <span className="pwa-toast__text">A new version is available.</span>
        <div className="pwa-toast__actions">
          <button
            className="pwa-toast__btn pwa-toast__btn--primary"
            onClick={() => updateSW?.(true)}
          >
            Reload
          </button>
          <button
            className="pwa-toast__btn"
            onClick={() => setNeedRefresh(false)}
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  if (installEvent) {
    return (
      <div className="pwa-toast" role="status">
        <span className="pwa-toast__text">Install QuickDrop on your device</span>
        <div className="pwa-toast__actions">
          <button
            className="pwa-toast__btn pwa-toast__btn--primary"
            onClick={handleInstall}
          >
            Install
          </button>
          <button
            className="pwa-toast__btn"
            onClick={() => setInstallEvent(null)}
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  return null;
}
