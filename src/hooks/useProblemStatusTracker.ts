import { useCallback, useMemo } from 'react';
import { useAccountState } from './useAccountState';

export type ProblemStatus = 'unattempted' | 'in-progress' | 'solved';
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

const STATUS_MAP_KEY = 'problem-status-map';
const STATUS_MAP_LOCAL_KEY = 'patternforge_problem_status_map_v1';

interface UseProblemStatusTrackerOptions {
  /** Existing solved IDs/slugs from legacy stores so solved history stays synced */
  legacySolvedIds?: readonly string[];
  /** Optional callback to keep legacy solved array synchronized when status toggles */
  onSyncLegacySolved?: (id: string, isSolved: boolean) => void;
}

export function useProblemStatusTracker(options?: UseProblemStatusTrackerOptions) {
  const [statusMap, setStatusMap] = useAccountState<Record<string, ProblemStatus>>(
    STATUS_MAP_KEY,
    {},
    STATUS_MAP_LOCAL_KEY
  );

  const legacySolvedSet = useMemo(
    () => new Set(options?.legacySolvedIds ?? []),
    [options?.legacySolvedIds]
  );

  const getStatus = useCallback(
    (id: string): ProblemStatus => {
      const explicit = statusMap[id];
      if (explicit === 'solved' || explicit === 'in-progress') return explicit;
      if (legacySolvedSet.has(id)) return 'solved';
      return 'unattempted';
    },
    [statusMap, legacySolvedSet]
  );

  const setStatus = useCallback(
    (id: string, nextStatus: ProblemStatus) => {
      setStatusMap((prev) => {
        if (nextStatus === 'unattempted') {
          if (!(id in prev)) return prev;
          const copy = { ...prev };
          delete copy[id];
          return copy;
        }
        if (prev[id] === nextStatus) return prev;
        return { ...prev, [id]: nextStatus };
      });
      options?.onSyncLegacySolved?.(id, nextStatus === 'solved');
    },
    [setStatusMap, options]
  );

  const cycleStatus = useCallback(
    (id: string) => {
      const current = getStatus(id);
      const next: ProblemStatus =
        current === 'unattempted'
          ? 'in-progress'
          : current === 'in-progress'
            ? 'solved'
            : 'unattempted';
      setStatus(id, next);
    },
    [getStatus, setStatus]
  );

  const markInProgressIfUnattempted = useCallback(
    (id: string) => {
      if (getStatus(id) === 'unattempted') {
        setStatus(id, 'in-progress');
      }
    },
    [getStatus, setStatus]
  );

  return {
    statusMap,
    getStatus,
    setStatus,
    cycleStatus,
    markInProgressIfUnattempted,
  };
}
