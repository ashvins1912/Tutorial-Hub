import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { apiFetch } from '../lib/apiFetch';

/**
 * Account-scoped JSON state persisted by the API. State is not written until
 * the server has confirmed the signed-in user's existing value.
 */
export function useAccountState<T>(
  stateKey: string,
  fallback: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const [remoteAvailable, setRemoteAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setRemoteAvailable(false);
    apiFetch(`/api/user-state/${encodeURIComponent(stateKey)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load account learning state.');
        const payload = await response.json();
        if (!active) return;
        setValue(payload.value === null || payload.value === undefined ? fallback : payload.value as T);
        setRemoteAvailable(true);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, [stateKey]);

  useEffect(() => {
    if (!loaded || !remoteAvailable) return;
    const timeout = window.setTimeout(() => {
      void apiFetch(`/api/user-state/${encodeURIComponent(stateKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [stateKey, value, loaded, remoteAvailable]);

  return [value, setValue, loaded];
}
