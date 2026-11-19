import { supabase } from './supabase';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const existingAuthorization = headers.get('Authorization');

  // Match the API's existing bearer-token contract. Fetch the current session
  // for every request so Supabase's automatic refresh is reflected, rather
  // than retaining a possibly stale JWT from the OAuth callback.
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
