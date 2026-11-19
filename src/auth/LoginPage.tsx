import { useState, type FormEvent } from 'react';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage('');
    setError('');
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage('Account created. Check your email to confirm your address, then sign in.');
        } else {
          setMessage('Your account is ready. Welcome to PatternForge.');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    if (!supabase) return;
    setBusy(true);
    setError('');
    try {
      // Match Pharma: use the current browser host/path, never a hard-coded
      // production origin or a stale localhost build-time environment value.
      const redirectTo = window.location.origin + window.location.pathname;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in could not be started.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between p-14 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-900 via-slate-950 to-slate-950">
        <div className="flex items-center gap-3 text-xl font-bold"><Activity className="text-sky-400" /> PatternForge DSA</div>
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-300 mb-5">Train your problem-solving brain</p>
          <h1 className="text-5xl font-bold leading-tight">From understanding a pattern to mastering the solution.</h1>
          <p className="mt-6 text-lg text-slate-300">Your DSA workspace, learning progress, spaced repetition and interview preparation — together in one place.</p>
        </div>
        <p className="text-sm text-slate-500">A focused learning environment for consistent progress.</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 font-bold text-xl mb-10"><Activity className="text-sky-400" /> PatternForge DSA</div>
          <div className="mb-8">
            <p className="text-sm font-semibold text-sky-400 mb-3">YOUR LEARNING SPACE</p>
            <h2 className="text-3xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="text-slate-400 mt-2">{mode === 'login' ? 'Sign in to continue your learning journey.' : 'Create an account to save your learning progress.'}</p>
          </div>
          {!isSupabaseConfigured ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the Render environment before using authentication.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && <label className="block text-sm text-slate-300">Full name<input required value={fullName} onChange={e => setFullName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-sky-500" placeholder="Your name" /></label>}
              <label className="block text-sm text-slate-300"><span className="flex items-center gap-2"><Mail size={15}/> Email address</span><input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-sky-500" placeholder="you@example.com" /></label>
              <label className="block text-sm text-slate-300"><span className="flex items-center gap-2"><LockKeyhole size={15}/> Password</span><span className="mt-2 flex rounded-xl border border-slate-700 bg-slate-900 focus-within:border-sky-500"><input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(v => !v)} className="px-4 text-slate-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
              {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
              {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
              <button disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17}/></button>
              <div className="flex items-center gap-3 py-1"><div className="h-px flex-1 bg-slate-800"/><span className="text-xs text-slate-500">OR</span><div className="h-px flex-1 bg-slate-800"/></div>
              <button type="button" disabled={busy} onClick={googleSignIn} className="w-full rounded-xl border border-slate-700 px-4 py-3 font-medium hover:bg-slate-900 disabled:opacity-60">Continue with Google</button>
            </form>
          )}
          <p className="mt-7 text-center text-sm text-slate-400">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="font-semibold text-sky-400 hover:text-sky-300">{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
          <p className="mt-8 text-center text-xs text-slate-600">Your password is handled securely by Supabase Auth.</p>
        </div>
      </section>
    </main>
  );
}
