import { supabase } from './supabase';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const existingAuthorization = headers.get('Authorization');

  // Always attach the latest Supabase access token unless caller explicitly
  // supplied credentials. This keeps API requests aligned with auto-refresh.
  if (!existingAuthorization && supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.access_token) {
      headers.set('Authorization', `Bearer ${data.session.access_token}`);
    }
  }

  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers, credentials: init.credentials || 'same-origin' });
}

/**
 * Wrap state-changing authenticated requests with one retry after refreshing
 * Supabase's client session. The API still validates every bearer token.
 * Use only for idempotent requests; do not automatically replay writes.
 */
export async function apiFetchWithFreshSession(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await apiFetch(input, init);
  if (response.status !== 401 || !supabase || init.method && !['GET', 'HEAD'].includes(init.method.toUpperCase())) {
    return response;
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) return response;

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, headers, credentials: init.credentials || 'same-origin' });
}
