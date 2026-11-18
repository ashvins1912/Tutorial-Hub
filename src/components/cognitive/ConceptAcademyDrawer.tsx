import { useState } from 'react';
import { BookOpen, CheckSquare, ExternalLink, GraduationCap, Square, X } from 'lucide-react';
import { TOPIC_RESOURCES } from '../../data/academyResources';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';
import { PROBLEMS } from '../../data/problems';

export function ConceptAcademyDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const resource =
    TOPIC_RESOURCES.find((r) => r.topicId === problem.patternId || r.topicId === problem.topicQuizId) ??
    TOPIC_RESOURCES[0];

  const [tab, setTab] = useState<'checklist' | 'lectures' | 'blueprint'>('checklist');
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs" role="dialog" aria-modal="true" aria-label="Concept Academy Guide">
      <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
                INSTITUTIONAL ACADEMY · {resource.tier.toUpperCase()}
              </p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                {resource.topicTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Concept Academy"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { id: 'checklist', label: '100% Sub-Concepts' },
                { id: 'lectures', label: 'MIT / Sheets / Visuals' },
                { id: 'blueprint', label: 'Analytical Blueprint' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  tab === t.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'checklist' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify you understand every foundational sub-concept so there are zero knowledge gaps.
              </p>
              {resource.coverageChecklist.map((item) => {
                const isDone = Boolean(checked[item.subConcept]);
                return (
                  <button
                    key={item.subConcept}
                    type="button"
                    onClick={() =>
                      setChecked((prev) => ({ ...prev, [item.subConcept]: !prev[item.subConcept] }))
                    }
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-left hover:border-sky-400 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {item.subConcept}{' '}
                          <span className="text-[11px] font-mono text-slate-400 font-normal">
                            · {item.isCore ? 'Core' : 'Extension'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {item.intuitionSummary}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'lectures' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2.5">
                <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {resource.curatedLinks.academicLecture.institution} ·{' '}
                  {resource.curatedLinks.academicLecture.courseCode}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {resource.curatedLinks.academicLecture.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Lecturer: {resource.curatedLinks.academicLecture.professor}
                </div>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pt-1">
                  {resource.curatedLinks.academicLecture.watchForBullets.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
                <a
                  href={resource.curatedLinks.academicLecture.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline pt-1"
                >
                  Open University Lecture
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5">
                <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  VISUAL EXPLAINER · {resource.curatedLinks.visualExplainer.educator}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {resource.curatedLinks.visualExplainer.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {resource.curatedLinks.visualExplainer.bestFor}
                </p>
                <a
                  href={resource.curatedLinks.visualExplainer.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline pt-1"
                >
                  Open Visual Guide
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-2">
                <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  BEST FREE SHEETS & ROADMAPS
                </div>
                <div className="space-y-2">
                  {resource.curatedLinks.sheetsAndRoadmaps.map((sheet) => (
                    <a
                      key={sheet.platform}
                      href={sheet.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {sheet.platform}
                        </span>
                        <span className="mx-1.5 text-slate-400">·</span>
                        <span className="text-slate-600 dark:text-slate-400">{sheet.title}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'blueprint' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 mb-1">
                  CONSTRAINT-TO-PATTERN RULE
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {resource.analyticalBlueprint.constraintRule}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  CORE LOOP INVARIANT
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {resource.analyticalBlueprint.loopInvariant}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="text-xs font-mono font-semibold text-rose-700 dark:text-rose-400 mb-1">
                  REDUNDANT WORK TO ELIMINATE
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {resource.analyticalBlueprint.bottleneckPattern}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
