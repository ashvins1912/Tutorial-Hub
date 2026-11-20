import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiFetch';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { useSprintStore } from '../../store/useSprintStore';

interface ResetEligibility {
  canReset: boolean;
  lastResetAt: string | null;
  nextEligibleAt: string | null;
  daysRemaining: number;
  resetCount: number;
}

const LOCAL_RESET_META_KEY = 'patternforge_monthly_reset_meta_v1';
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

function readLocalEligibility(): ResetEligibility {
  try {
    const raw = window.localStorage.getItem(LOCAL_RESET_META_KEY);
    if (!raw) {
      return { canReset: true, lastResetAt: null, nextEligibleAt: null, daysRemaining: 0, resetCount: 0 };
    }
    const parsed = JSON.parse(raw) as { lastResetAt?: string | null; resetCount?: number };
    const lastResetAt = parsed.lastResetAt ?? null;
    const resetCount = Number(parsed.resetCount ?? 0);
    if (!lastResetAt) {
      return { canReset: true, lastResetAt: null, nextEligibleAt: null, daysRemaining: 0, resetCount };
    }
    const nextMs = new Date(lastResetAt).getTime() + COOLDOWN_MS;
    const diff = nextMs - Date.now();
    const canReset = Number.isNaN(nextMs) || diff <= 0;
    return {
      canReset,
      lastResetAt,
      nextEligibleAt: Number.isNaN(nextMs) ? null : new Date(nextMs).toISOString(),
      daysRemaining: canReset ? 0 : Math.ceil(diff / (24 * 60 * 60 * 1000)),
      resetCount,
    };
  } catch {
    return { canReset: true, lastResetAt: null, nextEligibleAt: null, daysRemaining: 0, resetCount: 0 };
  }
}

function clearLocalLearningStorage(preserveMeta: { lastResetAt: string; resetCount: number }) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith('patternforge_') &&
        k !== 'patternforge_theme' &&
        k !== LOCAL_RESET_META_KEY &&
        k !== 'patternforge_solver_saved_pulled_v1'
      ) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      window.localStorage.removeItem(k);
    }
    window.localStorage.setItem(LOCAL_RESET_META_KEY, JSON.stringify(preserveMeta));
  } catch {
    // ignore storage errors
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface MonthlyLearningResetCardProps {
  onResetComplete: () => Promise<void> | void;
}

export const MonthlyLearningResetCard: React.FC<MonthlyLearningResetCardProps> = ({
  onResetComplete,
}) => {
  const resetPatternStore = usePatternForgeStore((s) => s.resetForUser);
  const fetchBrainProfile = usePatternForgeStore((s) => s.fetchBrainProfile);
  const resetSprintStore = useSprintStore((s) => s.resetForUser);

  const [eligibility, setEligibility] = useState<ResetEligibility>(() => readLocalEligibility());
  const [modalOpen, setModalOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadEligibility = useCallback(async () => {
    try {
      const res = await apiFetch('/api/profile/reset-eligibility');
      if (res.ok) {
        const data = (await res.json()) as ResetEligibility;
        setEligibility(data);
        if (data.lastResetAt) {
          window.localStorage.setItem(
            LOCAL_RESET_META_KEY,
            JSON.stringify({ lastResetAt: data.lastResetAt, resetCount: data.resetCount })
          );
        }
      }
    } catch {
      setEligibility(readLocalEligibility());
    }
  }, []);

  useEffect(() => {
    void loadEligibility();
  }, [loadEligibility]);

  const handleConfirmReset = async () => {
    if (!acknowledged || confirmText.trim().toUpperCase() !== 'RESET') return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await apiFetch('/api/profile/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = (await res.json()) as ResetEligibility & {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        if (typeof data.daysRemaining === 'number') {
          setEligibility({
            canReset: Boolean(data.canReset),
            lastResetAt: data.lastResetAt ?? null,
            nextEligibleAt: data.nextEligibleAt ?? null,
            daysRemaining: data.daysRemaining,
            resetCount: data.resetCount ?? eligibility.resetCount,
          });
        }
        throw new Error(data.error || 'Could not reset learning progress.');
      }

      const nowIso = data.lastResetAt ?? new Date().toISOString();
      const nextCount = data.resetCount ?? eligibility.resetCount + 1;
      clearLocalLearningStorage({ lastResetAt: nowIso, resetCount: nextCount });
      resetPatternStore();
      resetSprintStore();
      await fetchBrainProfile();
      await onResetComplete();

      setEligibility({
        canReset: false,
        lastResetAt: nowIso,
        nextEligibleAt: data.nextEligibleAt ?? new Date(Date.now() + COOLDOWN_MS).toISOString(),
        daysRemaining: data.daysRemaining || 30,
        resetCount: nextCount,
      });
      setModalOpen(false);
      setAcknowledged(false);
      setConfirmText('');
      setFeedback({
        kind: 'success',
        text:
          data.message ||
          'Learning level reset to Noob (0 XP). Your next monthly reset will unlock in 30 days.',
      });
      window.dispatchEvent(new CustomEvent('patternforge:db-sync'));
    } catch (err) {
      setFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to complete learning reset.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextUnlockPreview = formatDate(new Date(Date.now() + COOLDOWN_MS).toISOString());

  return (
    <>
      <section className="rounded-xl border border-amber-200 dark:border-amber-900/70 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>LEARNING LEVEL RESET · ONCE PER MONTH LIMIT</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Restart Your Learning &amp; Mastery Journey From Level 0
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Reset your rank back to <strong>Noob (0 XP)</strong>, clear solved/in-progress problem statuses, mastered curriculum topics, spaced-repetition queue, and sprint history so you can re-earn every milestone fresh. To protect learning integrity, you can perform this reset <strong>only once every 30 days</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                {eligibility.canReset
                  ? 'Status: Reset Available (1 per 30 days)'
                  : `Cooldown Active: ${eligibility.daysRemaining} day(s) remaining (Unlocks ${formatDate(eligibility.nextEligibleAt)})`}
              </span>
              {eligibility.lastResetAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Last reset: {formatDate(eligibility.lastResetAt)}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setAcknowledged(false);
              setConfirmText('');
              setModalOpen(true);
            }}
            disabled={!eligibility.canReset}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              eligibility.canReset
                ? 'border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/70'
                : 'border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {eligibility.canReset
              ? 'Reset Learning Level'
              : `Locked (${eligibility.daysRemaining}d left)`}
          </button>
        </div>

        {feedback && (
          <div
            className={`rounded-lg border px-3.5 py-2.5 text-xs font-medium flex items-center gap-2 ${
              feedback.kind === 'success'
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
            }`}
          >
            {feedback.kind === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}
      </section>

      {/* High-Clarity Warning Confirmation Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="monthly-reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="monthly-reset-modal-title"
                    className="text-base font-bold text-slate-900 dark:text-slate-100"
                  >
                    Warning: Reset Learning Level (Once-Per-Month Action)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Please review carefully before confirming.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close warning dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-xl border border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30 p-3.5 space-y-2 text-xs text-rose-950 dark:text-rose-200">
              <p className="font-semibold">
                You can perform a learning reset ONLY ONCE EVERY 30 DAYS (once a month).
              </p>
              <p className="leading-relaxed">
                If you proceed now, your next reset will be locked until{' '}
                <strong className="font-mono">{nextUnlockPreview}</strong>. The following progress will be permanently cleared so you can restart learning from scratch:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Rank tier reset to <strong>Noob</strong> and Total XP reset to <strong>0</strong></li>
                <li>All Solved &amp; In-Progress problem statuses across Problem Bank &amp; Curriculum</li>
                <li>Mastered curriculum modules, topic quizzes, and 5-Stage Lab checkpoints</li>
                <li>Spaced-repetition review queue, active sprint progress, and saved race replays</li>
              </ul>
              <p className="text-[11px] text-rose-800 dark:text-rose-300">
                Your account profile, theme preference, and saved pulled problems remain intact.
              </p>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 accent-rose-600"
              />
              <span>
                I understand this action resets my learning progress to zero and can only be done{' '}
                <strong>once per month (30 days)</strong>.
              </span>
            </label>

            <label className="block space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Type <code className="font-mono font-bold text-rose-600 dark:text-rose-400">RESET</code> to confirm:
              </span>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type RESET"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </label>

            {feedback?.kind === 'error' && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {feedback.text}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmReset()}
                disabled={submitting || !acknowledged || confirmText.trim().toUpperCase() !== 'RESET'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Confirm Monthly Reset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
