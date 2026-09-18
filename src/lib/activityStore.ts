import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ClaimKey,
  NormalizedResult,
  VerificationStatus,
} from "../types/verification";

/**
 * A single verification the verifier has created, persisted so the activity
 * page survives reloads. QuickDrop is the verifier's window into requests it
 * created — this is that log.
 */
export interface ActivityRecord {
  requestId: string;
  userDid: string;
  claims: ClaimKey[];
  status: VerificationStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /** Populated once the request reaches VERIFIED. */
  result?: NormalizedResult;
}

const STORAGE_KEY = "quickdrop.activity.v1";

interface ActivityState {
  records: ActivityRecord[];
  /** Insert a new record (or replace one with the same requestId). */
  upsert: (record: ActivityRecord) => void;
  /** Patch fields on an existing record by requestId. */
  patch: (requestId: string, patch: Partial<ActivityRecord>) => void;
  get: (requestId: string) => ActivityRecord | undefined;
  clear: () => void;
}

const ActivityContext = createContext<ActivityState | null>(null);

function load(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityRecord[]) : [];
  } catch {
    return [];
  }
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<ActivityRecord[]>(load);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      /* storage unavailable (private mode / quota) — non-fatal */
    }
  }, [records]);

  const upsert = useCallback((record: ActivityRecord) => {
    setRecords((prev) => {
      const without = prev.filter((r) => r.requestId !== record.requestId);
      // Newest first.
      return [record, ...without];
    });
  }, []);

  const patch = useCallback(
    (requestId: string, patchData: Partial<ActivityRecord>) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.requestId === requestId
            ? { ...r, ...patchData, updatedAt: new Date().toISOString() }
            : r,
        ),
      );
    },
    [],
  );

  const get = useCallback(
    (requestId: string) => records.find((r) => r.requestId === requestId),
    [records],
  );

  const clear = useCallback(() => setRecords([]), []);

  const value = useMemo<ActivityState>(
    () => ({ records, upsert, patch, get, clear }),
    [records, upsert, patch, get, clear],
  );

  return createElement(ActivityContext.Provider, { value }, children);
}

export function useActivity(): ActivityState {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return ctx;
}
