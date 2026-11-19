import { useEffect, useState } from 'react';
import { NotebookPen, Save, X } from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { PROBLEMS } from '../../data/problems';
import { apiFetch } from '../../lib/apiFetch';

export function ScratchpadDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const [note, setNote] = useState('');
  const [savedLabel, setSavedLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setNote('');
    apiFetch(`/api/cognitive/notes/${encodeURIComponent(problem.id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load note.');
        const data = await response.json();
        if (active) setNote(data?.note ?? '');
      })
      .catch(() => {
        if (active) setSavedLabel('Unable to load saved note');
      });
    return () => { active = false; };
  }, [open, problem.id]);

  if (!open) return null;

  const handleSave = async () => {
    try {
      const response = await apiFetch('/api/cognitive/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, note }),
      });
      if (!response.ok) throw new Error('Unable to save note.');
      setSavedLabel('Saved to your account');
    } catch {
      setSavedLabel('Save failed — please retry');
      return;
    }
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
