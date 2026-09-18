import { useCallback, useEffect, useRef, useState } from "react";
import { getVerificationStatus, KlaimApiError } from "./klaim/api";
import { POLL_INTERVAL_MS } from "./klaim/config";
import {
  isTerminalStatus,
  type VerificationStatusResponse,
} from "../types/verification";

interface PollingState {
  data: VerificationStatusResponse | null;
  error: KlaimApiError | null;
  loading: boolean;
  /** Manually trigger a status fetch (used by the "Refresh Status" button). */
  refresh: () => void;
}

/**
 * Polls GET /api/verification-requests/:id at a fixed interval until a terminal
 * state is reached, then stops. Cleans up the timer on unmount or id change.
 */
export function useVerificationPolling(
  requestId: string | null,
): PollingState {
  const [data, setData] = useState<VerificationStatusResponse | null>(null);
  const [error, setError] = useState<KlaimApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(true);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchStatus = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const result = await getVerificationStatus(requestId);
      if (!activeRef.current) return;
      setData(result);
      setError(null);

      // Schedule the next poll only if still active.
      if (!isTerminalStatus(result.status)) {
        clearTimer();
        timerRef.current = setTimeout(fetchStatus, POLL_INTERVAL_MS);
      } else {
        clearTimer();
      }
    } catch (err) {
      if (!activeRef.current) return;
      // Keep the last known status on screen; surface a transient error and
      // keep retrying at the poll interval (network blips shouldn't stop us).
      setError(
        err instanceof KlaimApiError
          ? err
          : new KlaimApiError("unknown", "Unexpected error."),
      );
      clearTimer();
      timerRef.current = setTimeout(fetchStatus, POLL_INTERVAL_MS);
    } finally {
      if (activeRef.current) setLoading(false);
    }
  }, [requestId]);

  const refresh = useCallback(() => {
    clearTimer();
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    activeRef.current = true;
    if (requestId) {
      void fetchStatus();
    }
    return () => {
      activeRef.current = false;
      clearTimer();
    };
  }, [requestId, fetchStatus]);

  return { data, error, loading, refresh };
}
