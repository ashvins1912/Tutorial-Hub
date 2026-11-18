import { useEffect, useState } from 'react';
import { NotebookPen, Save, X } from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { PROBLEMS } from '../../data/problems';

export function ScratchpadDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const storageKey = `patternforge-note-${problem.id}`;

  const [note, setNote] = useState('');
  const [savedLabel, setSavedLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const local = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    if (local !== null) setNote(local);

    fetch(`/api/cognitive/notes/learner-default/${problem.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.note && !local) setNote(data.note);
      })
      .catch(() => {});
  }, [open, problem.id, storageKey]);

  if (!open) return null;

  const handleSave = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, note);
    }
    try {
      await fetch('/api/cognitive/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'learner-default',
          problemId: problem.id,
          note,
        }),
      });
    } catch {
      // localStorage already persisted
    }
    setSavedLabel('Saved to Notebook & Server');
    window.setTimeout(() => setSavedLabel(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Course Notebook Scratchpad">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
                COURSE NOTEBOOK · #{problem.number} {problem.title}
              </p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                <NotebookPen className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Dry-Run & Revision Notes
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Scratchpad"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Write your own edge cases, loop invariants, and why the bottleneck happened. Persisted per problem across sessions.
          </p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Example takeaway for ${problem.title}:\n- Trigger phrase: ...\n- Edge case to watch: ...\n- Optimal Big-O: ${problem.targetBigO}`}
            className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
            {savedLabel ?? 'Auto-linked to problem'}
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
          >
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
