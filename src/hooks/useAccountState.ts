import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { apiFetch } from '../lib/apiFetch';

/**
 * Account-scoped JSON state persisted in the database via /api/user-state/:stateKey.
 * If an optional legacyLocalStorageKey is supplied and the DB does not yet have a value,
 * any existing browser-local progress is promoted to the database once and cleared locally.
 */
export function useAccountState<T>(
  stateKey: string,
  fallback: T,
  legacyLocalStorageKey?: string
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setRemoteAvailable(false);

    apiFetch(`/api/user-state/${encodeURIComponent(stateKey)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load account learning state.');
        const payload = await response.json();
        if (!active) return;

        if (payload.value !== null && payload.value !== undefined) {
          setValue(payload.value as T);
          // Clean up legacy localStorage once DB is authoritative
          if (legacyLocalStorageKey && typeof window !== 'undefined') {
            try {
              window.localStorage.removeItem(legacyLocalStorageKey);
            } catch {
              // ignore storage errors
            }
          }
        } else if (legacyLocalStorageKey && typeof window !== 'undefined') {
          // One-time migration from legacy browser localStorage -> Database
          let migrated: T | null = null;
          try {
            const raw = window.localStorage.getItem(legacyLocalStorageKey);
            if (raw) {
              migrated = JSON.parse(raw) as T;
            }
          } catch {
            migrated = null;
          }
          if (migrated !== null) {
            setValue(migrated);
            try {
              window.localStorage.removeItem(legacyLocalStorageKey);
            } catch {
              // ignore
            }
          } else {
            setValue(fallbackRef.current);
          }
        } else {
          setValue(fallbackRef.current);
        }

        setRemoteAvailable(true);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [stateKey, legacyLocalStorageKey]);

  useEffect(() => {
    if (!loaded || !remoteAvailable) return;
    const timeout = window.setTimeout(() => {
      void apiFetch(`/api/user-state/${encodeURIComponent(stateKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
        .then(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('patternforge:db-sync', { detail: { stateKey } }));
          }
        })
        .catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [stateKey, value, loaded, remoteAvailable]);

  return [value, setValue, loaded];
}
