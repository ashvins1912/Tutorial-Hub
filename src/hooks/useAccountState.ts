import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { apiFetch } from '../lib/apiFetch';
import { useAuth } from '../auth/AuthContext';

/**
 * Account-scoped JSON state persisted in the database via /api/user-state/:stateKey.
 * Strictly isolated per authenticated user ID:
 * - Resets immediately to fallback on user switch or sign-out.
 * - Never imports untrusted browser localStorage from previous accounts into a fresh sign-up.
 * - Only writes to the database after an explicit user state update (dirty tracking),
 *   so newly created accounts remain 100% empty until the user actually makes progress.
 */
export function useAccountState<T>(
  stateKey: string,
  fallback: T,
  _legacyLocalStorageKey?: string
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [value, setRawValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const isDirtyRef = useRef(false);

  const setValue: Dispatch<SetStateAction<T>> = useCallback((next) => {
    isDirtyRef.current = true;
    setRawValue(next);
  }, []);

  useEffect(() => {
    let active = true;
    isDirtyRef.current = false;
    setRawValue(fallbackRef.current);
    setLoaded(false);
    setRemoteAvailable(false);

    if (!userId) {
      setLoaded(true);
      return () => {
        active = false;
      };
    }

    apiFetch(`/api/user-state/${encodeURIComponent(stateKey)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load account learning state.');
        const payload = await response.json();
        if (!active) return;

        if (payload.value !== null && payload.value !== undefined) {
          setRawValue(payload.value as T);
        } else {
          setRawValue(fallbackRef.current);
        }

        setRemoteAvailable(true);
        setLoaded(true);
      })
      .catch(() => {
        if (active) {
          setRawValue(fallbackRef.current);
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [stateKey, userId]);

  useEffect(() => {
    if (!loaded || !remoteAvailable || !userId || !isDirtyRef.current) return;
    const timeout = window.setTimeout(() => {
      void apiFetch(`/api/user-state/${encodeURIComponent(stateKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
        .then((res) => {
          if (res.ok && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('patternforge:db-sync', { detail: { stateKey } }));
          }
        })
        .catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [stateKey, value, loaded, remoteAvailable, userId]);

  return [value, setValue, loaded];
}
