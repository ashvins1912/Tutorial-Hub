import { useState } from 'react';
import { Check, Copy, FileCode2, X } from 'lucide-react';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';
import { CodeLanguage } from '../../types/dsa';

export function PatternTemplateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    data: { goldenTemplates: GOLDEN_PATTERN_TEMPLATES },
  } = useAsyncCatalog('academy-resources');
  const [selectedId, setSelectedId] = useState(GOLDEN_PATTERN_TEMPLATES[0].id);
  const [lang, setLang] = useState<CodeLanguage>('python');
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const active =
    GOLDEN_PATTERN_TEMPLATES.find((t) => t.id === selectedId) ?? GOLDEN_PATTERN_TEMPLATES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.templates[lang]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard fallback ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="AlgoMaster Golden Pattern Templates"
    >
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              ALGOMASTER GOLDEN TEMPLATES · WHEN TO USE & CODE SKELETONS
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Core Pattern Skeleton Library
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Golden Templates"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* Pattern Selector Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 space-y-1.5 overflow-y-auto max-h-[68vh]">
            {GOLDEN_PATTERN_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedId(tpl.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                  tpl.id === active.id
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100 font-semibold'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div>{tpl.name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{tpl.tier}</div>
              </button>
            ))}
          </div>

          {/* Detail & Skeleton Code */}
          <div className="md:col-span-8 p-6 space-y-5 overflow-y-auto max-h-[68vh]">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {active.name}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Rank Focus: {active.tier}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
              <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                WHEN TO USE IT (3-SIGNAL CHECKLIST)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {active.whenToUse.map((rule) => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {(['python', 'js', 'java'] as CodeLanguage[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                        lang === l
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {l === 'python' ? 'Python' : l === 'js' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Template'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
                {active.templates[lang]}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                3 MUST-SOLVE PRACTICE PROBLEMS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {active.mustSolve.map((item) => (
                  <div
                    key={item.title}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.sheet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
