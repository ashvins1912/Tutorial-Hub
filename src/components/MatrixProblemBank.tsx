import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Code2, Search } from 'lucide-react';
import { MATRIX_PROBLEMS, type MatrixGroup, type MatrixLevel } from '../data/matrixProblems';
import { useAccountState } from '../hooks/useAccountState';

const groups: Array<'All' | MatrixGroup> = ['All', 'Traversal', 'Transformation', 'Search', 'Prefix Sum', 'Grid BFS/DFS', 'Backtracking', 'Dynamic Programming', 'Optimization'];
const levels: Array<'All' | MatrixLevel> = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function MatrixProblemBank() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<(typeof groups)[number]>('All');
  const [level, setLevel] = useState<(typeof levels)[number]>('All');
  const [expanded, setExpanded] = useState<string[]>(['m08', 'm12', 'm15', 'm17', 'm22', 'm27', 'm34']);
  const [completed, setCompleted] = useAccountState<string[]>(
    'matrix-problems-completed',
    [],
    'patternforge-matrix-problem-progress-v1'
  );
  const filtered = useMemo(() => MATRIX_PROBLEMS.filter((problem) => {
    const matchesQuery = !query.trim() || [problem.title, problem.prompt, problem.approach, problem.group].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (group === 'All' || problem.group === group) && (level === 'All' || problem.level === level);
  }), [query, group, level]);
  const done = completed.length;
  const toggleDone = (id: string) => setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleExpanded = (id: string) => setExpanded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400"><Code2 className="h-4 w-4" /> Matrix practice lab</div><h3 className="mt-2 text-xl font-bold">42 2D Array & Matrix Problems</h3><p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">A progressive problem set from row/column traversal to prefix sums, grid graph search and matrix optimisation. Open a problem to see the intended approach and Java implementation hints.</p></div>
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-right dark:bg-slate-800"><div className="text-xs text-slate-500">Marked solved</div><div className="text-2xl font-bold tabular-nums">{done}<span className="text-sm text-slate-400"> / 42</span></div></div>
    </div>
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px_160px]">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search matrix problems..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950" /></div>
      <select value={group} onChange={(event) => setGroup(event.target.value as (typeof groups)[number])} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">{groups.map((item) => <option key={item} value={item}>{item === 'All' ? 'All patterns' : item}</option>)}</select>
      <select value={level} onChange={(event) => setLevel(event.target.value as (typeof levels)[number])} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">{levels.map((item) => <option key={item} value={item}>{item === 'All' ? 'All levels' : item}</option>)}</select>
    </div>
    <div className="flex items-center justify-between text-xs text-slate-500"><span>Showing {filtered.length} of {MATRIX_PROBLEMS.length} problems</span><span>Solved status is synced to your account database.</span></div>
    <div className="space-y-2">
      {filtered.map((problem) => {
        const isOpen = expanded.includes(problem.id);
        const isDone = completed.includes(problem.id);
        return <article key={problem.id} className={`overflow-hidden rounded-xl border ${isDone ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-start gap-3 p-3 sm:p-4">
            <button type="button" onClick={() => toggleDone(problem.id)} aria-label={isDone ? 'Mark unsolved' : 'Mark solved'} className={`mt-0.5 shrink-0 ${isDone ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}`}>{isDone ? <CheckCircle2 className="h-5 w-5" /> : <span className="block h-5 w-5 rounded-full border-2 border-current" />}</button>
            <button type="button" onClick={() => toggleExpanded(problem.id)} aria-expanded={isOpen} className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-2"><span className={`text-sm font-semibold ${isDone ? 'text-slate-400 line-through' : ''}`}>{problem.title}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{problem.level}</span><span className="text-[10px] text-sky-600 dark:text-sky-400">{problem.group}</span></div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{problem.prompt}</p>
            </button>
            <button type="button" onClick={() => toggleExpanded(problem.id)} aria-label={isOpen ? 'Collapse problem' : 'Expand problem'} className="mt-1 text-slate-400">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
          </div>
          {isOpen && <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:grid-cols-2">
            <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommended approach</div><p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{problem.approach}</p></div>
            <div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Complexity target</div><p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{problem.complexity}</p></div>
            <div className="sm:col-span-2"><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400"><Code2 className="h-3.5 w-3.5" /> Java implementation hint</div><code className="mt-1 block whitespace-normal rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{problem.javaHint}</code></div>
          </div>}
        </article>;
      })}
      {filtered.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">No matching matrix problems. Try another search or filter.</div>}
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-500"><BookOpen className="h-4 w-4" /> Recommended sequence: traversal → transformation → search → prefix sums → BFS/DFS → DP and optimisation.</div>
  </section>;
}
