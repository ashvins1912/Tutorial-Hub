import { supabase } from './supabase';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Authorization') && supabase) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.access_token) headers.set('Authorization', `Bearer ${data.session.access_token}`);
  }
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, { ...init, headers, credentials: init.credentials || 'same-origin' });
}

/** Retry GET/HEAD once with a newly refreshed Supabase access token on 401. */
export async function apiFetchWithFreshSession(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = (init.method || 'GET').toUpperCase();
  const response = await apiFetch(input, init);
  if (response.status !== 401 || !supabase || !['GET', 'HEAD'].includes(method)) return response;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) return response;

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${data.session.access_token}`);
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, { ...init, headers, credentials: init.credentials || 'same-origin' });
}
