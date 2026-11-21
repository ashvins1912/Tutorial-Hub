import React, { useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Trophy } from 'lucide-react';
import {
  withAccountSyncedState,
  withAsyncCatalog,
  type InjectedAccountStateProps,
  type InjectedCatalogProps,
} from '../hoc';
import { CatalogSearchInput, TrackProgressHeader } from '../ui';

export type TrackProblemStatus = 'Not started' | 'In progress' | 'Solved';
export type TrackProgressMap = Record<number, { status: TrackProblemStatus; notes: string }>;

export interface CuratedTrackProblemItem {
  number: number;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
}

export type CuratedTrackBundleKey = 'leetcode-75' | 'top-interview-100';

export interface CuratedProblemTrackConfig {
  bundleKey: CuratedTrackBundleKey;
  accountStateKey: string;
  title: string;
  countSummary: string;
  description: string;
  difficulties: string[];
  buildExternalUrl: (slug: string) => string;
}

type CuratedTrackInnerProps = {
  config: CuratedProblemTrackConfig;
} & InjectedCatalogProps<CuratedTrackBundleKey> &
  InjectedAccountStateProps<TrackProgressMap>;

const CuratedProblemTrackInner: React.FC<CuratedTrackInnerProps> = ({
  config,
  catalog,
  accountState: progress,
  setAccountState: setProgress,
}) => {
  const problemsList = catalog.problems as CuratedTrackProblemItem[];
  const categoriesList = catalog.categories as string[];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [status, setStatus] = useState<'All' | TrackProblemStatus>('All');
  const [activeNumber, setActiveNumber] = useState<number | null>(null);

  const totalCount = problemsList.length || 1;
  const completed = problemsList.filter((p) => progress[p.number]?.status === 'Solved').length;
  const inProgress = problemsList.filter((p) => progress[p.number]?.status === 'In progress').length;
  const completionPct = Math.round((completed / totalCount) * 100);

  const filtered = useMemo(
    () =>
      problemsList.filter((problem) => {
        const q = query.trim().toLowerCase();
        return (
          (!q || `${problem.title} ${problem.category} ${problem.number}`.toLowerCase().includes(q)) &&
          (category === 'All categories' || problem.category === category) &&
          (difficulty === 'All' || problem.difficulty === difficulty) &&
          (status === 'All' || (progress[problem.number]?.status ?? 'Not started') === status)
        );
      }),
    [problemsList, query, category, difficulty, status, progress]
  );

  const update = (number: number, patch: Partial<TrackProgressMap[number]>) => {
    const current = progress[number] ?? {
      status: 'Not started' as TrackProblemStatus,
      notes: '',
    };
    setProgress({ ...progress, [number]: { ...current, ...patch } });
  };

  const active = problemsList.find((problem) => problem.number === activeNumber);

  return (
    <div className="space-y-5">
      <TrackProgressHeader
        countSummary={config.countSummary}
        title={config.title}
        description={config.description}
        progressPercent={completionPct}
        stats={[
          { label: 'Solved', value: completed, suffix: ` / ${problemsList.length}` },
          { label: 'In progress', value: inProgress },
          { label: 'Completion', value: `${completionPct}%` },
        ]}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(140px,190px))]">
          <CatalogSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search problem, topic or number..."
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option>All categories</option>
            {categoriesList.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            aria-label="Filter by difficulty"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="All">All difficulties</option>
            {config.difficulties.map((diff) => (
              <option key={diff}>{diff}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'All' | TrackProblemStatus)}
            aria-label="Filter by progress status"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="All">All progress</option>
            <option>Not started</option>
            <option>In progress</option>
            <option>Solved</option>
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono tabular-nums">
            Showing {filtered.length} of {problemsList.length} problems
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> {completed} solved
          </span>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3">
          {categoriesList
            .filter((item) => category === 'All categories' || category === item)
            .map((group) => {
              const groupProblems = filtered.filter((problem) => problem.category === group);
              if (!groupProblems.length) return null;
              const groupSolved = groupProblems.filter(
                (problem) => progress[problem.number]?.status === 'Solved'
              ).length;
              return (
                <div
                  key={group}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <h2 className="text-sm font-bold">{group}</h2>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {groupSolved}/{groupProblems.length} solved
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {groupProblems.map((problem) => {
                      const current = progress[problem.number]?.status ?? 'Not started';
                      return (
                        <div
                          key={problem.number}
                          className="flex flex-wrap items-center gap-3 px-4 py-3"
                        >
                          <span className="w-8 shrink-0 text-xs font-mono tabular-nums text-slate-400">
                            #{problem.number}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveNumber(problem.number)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="text-sm font-semibold hover:text-sky-600 dark:hover:text-sky-400">
                              {problem.title}
                            </span>
                            <span className="ml-2 text-[11px] text-slate-400">
                              · {problem.difficulty}
                            </span>
                          </button>
                          <select
                            aria-label={`Progress for ${problem.title}`}
                            value={current}
                            onChange={(event) =>
                              update(problem.number, {
                                status: event.target.value as TrackProblemStatus,
                              })
                            }
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                          >
                            <option>Not started</option>
                            <option>In progress</option>
                            <option>Solved</option>
                          </select>
                          <a
                            href={config.buildExternalUrl(problem.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline dark:text-sky-300 whitespace-nowrap"
                          >
                            LeetCode <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
              No problems match these filters.
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
          {active ? (
            <>
              <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400">
                Problem #{active.number} · {active.category}
              </div>
              <h2 className="mt-2 text-lg font-bold">{active.title}</h2>
              <a
                href={config.buildExternalUrl(active.slug)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline dark:text-sky-300"
              >
                Open problem <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <label className="mt-5 block text-xs font-semibold">
                Learning notes
                <textarea
                  value={progress[active.number]?.notes ?? ''}
                  onChange={(event) => update(active.number, { notes: event.target.value })}
                  rows={5}
                  placeholder="Pattern, key invariant, brute force, optimal idea, complexity, edge cases..."
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="text-xs font-bold">Before marking solved</div>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <li>• Explain why the chosen pattern applies.</li>
                  <li>• State the invariant or recurrence.</li>
                  <li>• Give time and auxiliary-space complexity.</li>
                  <li>• Test boundary cases and one variation.</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-bold">Choose a problem</h2>
              <p className="mt-1 text-xs text-slate-500">
                Select any question to keep focused notes beside the list.
              </p>
            </div>
          )}
        </aside>
      </div>
      <p className="text-center text-[11px] text-slate-400">
        Progress and reflection notes sync automatically to your account database.
      </p>
    </div>
  );
};

/**
 * Factory creating a fully DB-synced, catalog-hydrated study track component
 * composed via `withAsyncCatalog` and `withAccountSyncedState`.
 */
export function createCuratedProblemTrack(config: CuratedProblemTrackConfig): React.FC {
  const SyncedWithCatalog = withAsyncCatalog(
    withAccountSyncedState<TrackProgressMap, CuratedTrackInnerProps>(CuratedProblemTrackInner, {
      stateKey: config.accountStateKey,
      initialValue: {},
    }),
    config.bundleKey
  );

  const TrackView: React.FC = () => <SyncedWithCatalog config={config} />;
  TrackView.displayName = `CuratedProblemTrack(${config.bundleKey})`;
  return TrackView;
}
