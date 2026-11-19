import { useEffect, useState } from 'react';
import { apiFetch, apiFetchWithFreshSession } from '../lib/apiFetch';
import { useAuth } from './AuthContext';
import { LoginPage } from './LoginPage';
import App from '../App';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { useSprintStore } from '../store/useSprintStore';

const PENDING_INVITE_STORAGE_KEY = 'pf_pending_invite_code';

function captureInviteCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite')?.trim().toUpperCase();
    if (code && code.length >= 4) {
      window.sessionStorage.setItem(PENDING_INVITE_STORAGE_KEY, code);
      params.delete('invite');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
      return code;
    }
    return window.sessionStorage.getItem(PENDING_INVITE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthGate() {
  const { user, session, loading, configured, signOut } = useAuth();
  const [profileReady, setProfileReady] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Capture any ?invite=CODE query param before login/signup redirects
  useEffect(() => {
    captureInviteCodeFromUrl();
  }, []);

  useEffect(() => {
    let active = true;
    setProfileReady(false);
    setProfileError('');
    usePatternForgeStore.getState().resetForUser();
    useSprintStore.getState().resetForUser();

    if (!session?.access_token) return () => { active = false; };

    // Keep Supabase as the session authority. Verify the current user before
    // loading any user-scoped learning state.
    apiFetchWithFreshSession('/api/auth/me')
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          const code = payload.code ? ` (${payload.code})` : '';
          throw new Error((payload.message || 'Unable to initialize your account.') + code);
        }

        const pendingCode = captureInviteCodeFromUrl();
        let inviteMessage: string | null = null;
        if (pendingCode) {
          try {
            const acceptRes = await apiFetch('/api/community/invites/accept', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inviteCode: pendingCode }),
            });
            const acceptPayload = await acceptRes.json().catch(() => ({}));
            if (acceptRes.ok && acceptPayload.message) {
              inviteMessage = acceptPayload.message;
            }
          } catch {
            // Non-blocking: user can still redeem invite inside Community tab
          } finally {
            try {
              window.sessionStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
            } catch {
              // ignore
            }
          }
        }

        if (!active) return;

        const check = payload.freshAccountCheck;
        if (inviteMessage) {
          usePatternForgeStore.getState().setPromotionToast(inviteMessage);
        } else if (check?.autoAcceptedInvites > 0) {
          usePatternForgeStore
            .getState()
            .setPromotionToast(
              `Welcome! ${check.autoAcceptedInvites} pending community invitation${check.autoAcceptedInvites > 1 ? 's' : ''} connected automatically.`
            );
        } else if (check?.isNewAccount && !check?.hasProgress) {
          usePatternForgeStore
            .getState()
            .setPromotionToast(
              'Welcome to PatternForge DSA! Your fresh account starts at 0 XP with clean progress tracking.'
            );
        }

        setProfileReady(true);
      })
      .catch((error) => {
        if (active) setProfileError(error instanceof Error ? error.message : 'Account setup failed.');
      });

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">
        Restoring your secure session…
      </div>
    );
  }
  if (!configured || !user) return <LoginPage />;
  if (profileError) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
        <div className="max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-7">
          <h1 className="text-xl font-bold">Account setup unavailable</h1>
          <p className="mt-3 text-sm text-slate-300">{profileError}</p>
          <p className="mt-3 text-xs text-slate-500">
            Check the Render MongoDB connection and confirm the frontend and backend use the same
            Supabase project URL and matching API keys.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950"
          >
            Retry
          </button>
          <button onClick={() => void signOut()} className="ml-3 text-sm text-slate-400">
            Sign out
          </button>
        </div>
      </main>
    );
  }
  if (!profileReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">
        Preparing your learning profile…
      </div>
    );
  }
  // Keying App by user.id guarantees zero stale React state leaks across account switches
  return <App key={user.id} />;
}
