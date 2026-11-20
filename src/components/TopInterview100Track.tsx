import { useMemo, useState } from 'react';
import { useAccountState } from '../hooks/useAccountState';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { ExternalLink, Search, Target, Trophy, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { topInterview100Url, type Top100Difficulty } from '../data/topInterview100';

type Status = 'Not started' | 'In progress' | 'Solved';
type Progress = Record<number, { status: Status; notes: string }>;
export function TopInterview100Track() {
  const {
    data: { problems: TOP_INTERVIEW_100, categories: TOP_INTERVIEW_100_CATEGORIES },
  } = useAsyncCatalog('top-interview-100');
  const [progress, setProgress] = useAccountState<Progress>('top-interview-100-progress', {});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [difficulty, setDifficulty] = useState<'All' | Top100Difficulty>('All');
  const [status, setStatus] = useState<'All' | Status>('All');
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [showStudyGuide, setShowStudyGuide] = useState(true);
  const completed = TOP_INTERVIEW_100.filter((problem) => progress[problem.number]?.status === 'Solved').length;
  const inProgress = TOP_INTERVIEW_100.filter((problem) => progress[problem.number]?.status === 'In progress').length;
  const filtered = useMemo(() => TOP_INTERVIEW_100.filter((problem) => {
    const q = query.trim().toLowerCase();
    return (!q || `${problem.title} ${problem.category} ${problem.number}`.toLowerCase().includes(q))
      && (category === 'All categories' || problem.category === category)
      && (difficulty === 'All' || problem.difficulty === difficulty)
      && (status === 'All' || (progress[problem.number]?.status ?? 'Not started') === status);
  }), [TOP_INTERVIEW_100, query, category, difficulty, status, progress]);
  const update = (number: number, patch: Partial<Progress[number]>) => {
    const current = progress[number] ?? { status: 'Not started' as Status, notes: '' };
    const next = { ...progress, [number]: { ...current, ...patch } };
    setProgress(next);
  };
  const active = TOP_INTERVIEW_100.find((problem) => problem.number === activeNumber);

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-slate-950 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300"><Target className="h-4 w-4" /> Interview preparation track</span><span className="rounded-full border border-white/20 px-3 py-1 text-xs">100 curated questions</span></div>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Top Interview 100</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">A focused practice path across 14 topic groups. Build pattern recognition, implement independently in Java, and record what you learned from each problem.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/15 bg-white/5 p-4"><div className="text-xs text-slate-400">Solved</div><div className="mt-1 text-2xl font-bold tabular-nums">{completed}<span className="text-sm text-slate-400"> / 100</span></div></div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-4"><div className="text-xs text-slate-400">In progress</div><div className="mt-1 text-2xl font-bold tabular-nums">{inProgress}</div></div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-4"><div className="text-xs text-slate-400">Completion</div><div className="mt-1 text-2xl font-bold tabular-nums">{Math.round(completed / 100 * 100)}%</div></div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: (completed / 100 * 100) + '%' }} /></div>
      </div>
      <div className="p-5">
        <button type="button" onClick={() => setShowStudyGuide((value) => !value)} className="flex w-full items-center justify-between text-left"><span className="flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4 text-sky-600" /> Recommended solving workflow</span>{showStudyGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
        {showStudyGuide && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['1. Understand','Restate inputs, outputs, constraints and edge cases.'],['2. Derive','Write brute force first, then identify the bottleneck and pattern.'],['3. Implement','Code the optimal approach in Java without copying a solution.'],['4. Reflect','Record invariant, complexity, failed attempt and one variation.']].map(([title, body]) => <div key={title} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs font-bold">{title}</div><p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{body}</p></div>)}</div>}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(140px,190px))]">
        <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search problem, topic or number..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option>All categories</option>{TOP_INTERVIEW_100_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as 'All' | Top100Difficulty)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="All">All difficulties</option><option>Easy</option><option>Medium</option></select>
        <select value={status} onChange={(event) => setStatus(event.target.value as 'All' | Status)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="All">All progress</option><option>Not started</option><option>In progress</option><option>Solved</option></select>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>Showing {filtered.length} of 100 problems</span><span className="inline-flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> {completed} solved</span></div>
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-3">
        {TOP_INTERVIEW_100_CATEGORIES.filter((item) => category === 'All categories' || category === item).map((group) => {
          const problems = filtered.filter((problem) => problem.category === group);
          if (!problems.length) return null;
          return <div key={group} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800"><h2 className="text-sm font-bold">{group}</h2><span className="text-xs tabular-nums text-slate-400">{problems.filter((problem) => progress[problem.number]?.status === 'Solved').length}/{problems.length} solved</span></div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">{problems.map((problem) => {
              const current = progress[problem.number]?.status ?? 'Not started';
              return <div key={problem.number} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="w-7 shrink-0 text-xs tabular-nums text-slate-400">#{problem.number}</span>
                <button type="button" onClick={() => setActiveNumber(problem.number)} className="min-w-0 flex-1 text-left"><span className="text-sm font-semibold hover:text-sky-600">{problem.title}</span><span className="ml-2 text-[10px] text-slate-400">{problem.difficulty}</span></button>
                <select aria-label={`Progress for ${problem.title}`} value={current} onChange={(event) => update(problem.number, { status: event.target.value as Status })} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"><option>Not started</option><option>In progress</option><option>Solved</option></select>
                <a href={topInterview100Url(problem.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline dark:text-sky-300">LeetCode <ExternalLink className="h-3 w-3" /></a>
              </div>;
            })}</div>
          </div>;
        })}
        {filtered.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">No problems match these filters.</div>}
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
        {active ? <>
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Problem #{active.number} · {active.category}</div>
          <h2 className="mt-2 text-lg font-bold">{active.title}</h2>
          <a href={topInterview100Url(active.slug)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline dark:text-sky-300">Open problem <ExternalLink className="h-3 w-3" /></a>
          <label className="mt-5 block text-xs font-semibold">Learning notes<textarea value={progress[active.number]?.notes ?? ''} onChange={(event) => update(active.number, { notes: event.target.value })} rows={5} placeholder="Pattern, key invariant, brute force, optimal idea, complexity, edge cases..." className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950" /></label>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs font-bold">Before marking solved</div><ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400"><li>• Explain why the chosen pattern applies.</li><li>• State the invariant or recurrence.</li><li>• Give time and auxiliary-space complexity.</li><li>• Test boundary cases and one variation.</li></ul></div>
        </> : <div className="py-8 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-bold">Choose a problem</h2><p className="mt-1 text-xs text-slate-500">Select any question to keep focused notes beside the list.</p></div>}
      </aside>
    </div>
    <p className="text-center text-[11px] text-slate-400">Your progress and notes are saved in this browser only. The LeetCode links open the corresponding problem pages.</p>
  </div>;
}
