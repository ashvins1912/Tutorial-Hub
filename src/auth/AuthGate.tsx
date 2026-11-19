import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';
import App from '../App';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { useSprintStore } from '../store/useSprintStore';

export function AuthGate() {
  const { user, session, loading, configured, signOut } = useAuth();
  const [profileReady, setProfileReady] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let active = true;
    setProfileReady(false);
    setProfileError('');
    usePatternForgeStore.getState().resetForUser();
    useSprintStore.getState().resetForUser();
    if (!session?.access_token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).then(async response => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Unable to initialize your account.');
      if (active) setProfileReady(true);
    }).catch(error => {
      if (active) setProfileError(error instanceof Error ? error.message : 'Account setup failed.');
    });
    return () => { active = false; };
  }, [session?.access_token]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">Restoring your secure session…</div>;
  if (!configured || !user) return <LoginPage />;
  if (profileError) return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <div className="max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-7">
        <h1 className="text-xl font-bold">Account setup unavailable</h1>
        <p className="mt-3 text-sm text-slate-300">{profileError}</p>
        <p className="mt-3 text-xs text-slate-500">Check MongoDB connectivity and the Supabase server environment variables in Render.</p>
        <button onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950">Retry</button>
        <button onClick={() => void signOut()} className="ml-3 text-sm text-slate-400">Sign out</button>
      </div>
    </main>
  );
  if (!profileReady) return <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">Preparing your learning profile…</div>;
  return <App />;
}
