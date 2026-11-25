import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, Code2, Lightbulb, RotateCcw } from 'lucide-react';
import { useAccountState } from '../hooks/useAccountState';
import { DP_PRACTICE_PROBLEMS } from '../data/dpPracticeProblems';
import { DP_GUIDED_LESSONS } from '../data/dpGuidedLessons';

const stages = ['Understand the question', 'Define the state', 'Write the transition', 'Set base cases', 'Choose calculation order', 'Code and test', 'Analyse complexity'];
export function DpLearningLab() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stair, setStair] = useState(6);
  const [showAnswer, setShowAnswer] = useState(false);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [completed, setCompleted] = useAccountState<string[]>(
    'dp-practice-completed',
    [],
    'patternforge-dp-practice-v1'
  );
  const [filter, setFilter] = useState('All');
  const [problemSearch, setProblemSearch] = useState('');
  const validProblemNames = useMemo(() => new Set(DP_PRACTICE_PROBLEMS.map((problem) => problem.name)), []);
  const completedSet = useMemo(() => new Set(completed.filter((name) => validProblemNames.has(name))), [completed, validProblemNames]);
  const doneCount = completedSet.size;
  const lesson = DP_GUIDED_LESSONS[lessonIndex];
  const fib = useMemo(() => { const a = [1, 1]; for (let i = 2; i <= stair; i++) a.push(a[i - 1] + a[i - 2]); return a.slice(0, stair + 1); }, [stair]);
  const groups = ['All', 'Warm-up', 'Core', 'Challenge', 'Advanced'];
  const visibleProblems = useMemo(() => {
    const query = problemSearch.trim().toLowerCase();
    return DP_PRACTICE_PROBLEMS.filter((problem) =>
      (filter === 'All' || problem.level === filter) &&
      (!query || [problem.name, problem.goal, problem.statement, problem.example, problem.hint, problem.level].join(' ').toLowerCase().includes(query))
    );
  }, [filter, problemSearch]);
  const toggle = (item: string) =>
    setCompleted((old) => (old.includes(item) ? old.filter((x) => x !== item) : [...new Set([...old, item])]));
  return <section className="space-y-5">
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300"><Lightbulb className="h-4 w-4" /> Interactive DP learning path</div>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Understand DP one decision at a time</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Do not memorise a list of formulas. Learn one repeatable recipe: state → choices → recurrence → base cases → order → complexity. Start with tiny examples, then increase the pattern difficulty.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-4">{['1. Describe a smaller question','2. Reuse its answer','3. Combine smaller answers','4. Build the final answer'].map((x) => <div key={x} className="rounded-lg bg-white/10 p-3 text-xs font-semibold">{x}</div>)}</div>
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-indigo-600">See the answers grow</div><h3 className="mt-1 text-lg font-bold">Climbing stairs visualiser</h3></div><button type="button" onClick={() => setStair(6)} className="inline-flex min-h-11 items-center gap-2 px-3 text-xs text-slate-500"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div>
        <p className="mt-2 text-sm text-slate-500">Each stair can be reached from the previous one or two stairs. Move the slider and inspect how every answer reuses earlier answers.</p>
        <input aria-label="Number of stairs" type="range" min="1" max="10" value={stair} onChange={(e) => setStair(Number(e.target.value))} className="mt-4 w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-slate-500"><span>1 stair</span><strong>{stair} stairs</strong><span>10 stairs</span></div>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">{fib.map((v, i) => <div key={i} className={i === stair ? 'rounded-xl border-2 border-indigo-500 bg-indigo-50 p-3 text-center dark:bg-indigo-950' : 'rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700'}><div className="text-[10px] text-slate-400">dp[{i}]</div><div className="mt-1 text-lg font-bold tabular-nums">{v}</div></div>)}</div>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{stair <= 1 ? `Base case: dp[${stair}] = 1 way.` : `For ${stair} stairs: dp[${stair}] = dp[${stair - 1}] + dp[${stair - 2}] = ${fib[stair]} ways.`}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">The DP recipe</div><h3 className="mt-1 text-lg font-bold">Ask these 7 questions</h3>
        <ol className="mt-4 space-y-3">{stages.map((s, i) => <li key={s} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{i + 1}</span><span>{s}</span></li>)}</ol>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">If you cannot explain what dp[i] means in one sentence, stop. Do not start coding yet.</p>
      </article>
    </div>

    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Guided lessons · {lessonIndex + 1} of {DP_GUIDED_LESSONS.length}</div><h3 className="mt-1 text-xl font-bold">{lesson.title}</h3></div><div className="flex gap-2"><button type="button" disabled={lessonIndex === 0} onClick={() => { setLessonIndex((x) => x - 1); setShowAnswer(false); }} className="min-h-11 rounded-lg border px-3 py-2 text-sm disabled:opacity-30"><ChevronLeft className="inline h-4 w-4" /> Back</button><button type="button" disabled={lessonIndex === DP_GUIDED_LESSONS.length - 1} onClick={() => { setLessonIndex((x) => x + 1); setShowAnswer(false); }} className="min-h-11 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-30">Next <ChevronRight className="inline h-4 w-4" /></button></div></div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{lesson.idea}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{[['State', lesson.state],['Transition / recurrence', lesson.recurrence],['Base cases', lesson.base],['Evaluation order', lesson.order],['Complexity', lesson.complexity]].map(([title, body]) => <div key={title} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">{title}</h4><p className="mt-2 text-sm leading-relaxed">{body}</p></div>)}</div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold dark:border-slate-700"><Code2 className="h-4 w-4" /> Java example</div><pre tabIndex={0} aria-label={`Java code example for ${lesson.title}`} className="overflow-x-auto bg-slate-950 p-4 text-xs leading-relaxed text-emerald-200"><code>{lesson.java}</code></pre></div>
      <div className="mt-4 rounded-xl border border-indigo-200 p-4 dark:border-indigo-900"><div className="flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4 text-indigo-600" /> Check your understanding</div><p className="mt-2 text-sm">{lesson.checkpoint}</p><button type="button" onClick={() => setShowAnswer((x) => !x)} aria-expanded={showAnswer} aria-controls="dp-lesson-hint" className="mt-3 min-h-11 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">{showAnswer ? 'Hide hint' : 'Show hint'}</button><div id="dp-lesson-hint" hidden={!showAnswer}>{showAnswer ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Trace the recurrence with a tiny input (0, 1, 2 or 3). Write down exactly what each state means, which earlier states it reads, and why those states are ready before this one.</p> : null}</div></div>
      <div className="mt-4 flex flex-wrap gap-2">{DP_GUIDED_LESSONS.map((x, i) => <button key={x.title} type="button" onClick={() => { setLessonIndex(i); setShowAnswer(false); }} aria-label={x.title} aria-pressed={i === lessonIndex} aria-current={i === lessonIndex ? 'step' : undefined} className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold ${i === lessonIndex ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{i + 1}</button>)}</div>
    </article>

    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Practice roadmap</div><h3 className="mt-1 text-xl font-bold">{DP_PRACTICE_PROBLEMS.length} problems in learning order</h3><p className="mt-1 text-xs text-slate-500">Solve in order. Mark complete only after you can derive the state and recurrence without hints.</p></div><span className="text-sm font-bold tabular-nums">{doneCount}/{DP_PRACTICE_PROBLEMS.length}</span></div>
      <div className="mt-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(g)}
            aria-pressed={filter === g}
            className={
              filter === g
                ? 'min-h-11 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white'
                : 'min-h-11 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-300'
            }
          >
            {g}
          </button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Search dynamic programming practice problems</span>
        <input type="search" value={problemSearch} onChange={(event) => setProblemSearch(event.target.value)} placeholder="Search problems, goals, examples or hints…" aria-label="Search dynamic programming practice problems" className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>
      <div className="mt-4 space-y-2">
        {visibleProblems.length === 0 ? <p role="status" className="rounded-lg border border-dashed p-4 text-sm text-slate-500">No DP problems match this search and level. Clear the search or choose All.</p> : null}
        {visibleProblems.map((problem, problemIndex) => {
          const isDone = completedSet.has(problem.name);
          const isOpen = expandedProblem === problem.name;
          const panelId = 'dp-practice-details-' + problemIndex;
          return <article key={problem.name} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3 p-3">
              <button
                type="button"
                onClick={() => toggle(problem.name)}
                aria-pressed={isDone}
                aria-label={isDone ? 'Mark ' + problem.name + ' incomplete' : 'Mark ' + problem.name + ' complete'}
                className={isDone ? 'flex h-11 w-11 items-center justify-center text-emerald-500' : 'flex h-11 w-11 items-center justify-center text-slate-300'}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{problem.name}</span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">· {problem.level}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{problem.goal}</p>
              </div>
              <button type="button" onClick={() => setExpandedProblem(isOpen ? null : problem.name)} aria-expanded={isOpen} aria-controls={panelId} aria-label={isOpen ? 'Hide details for ' + problem.name : 'Show details for ' + problem.name} className="min-h-11 shrink-0 rounded-md border px-3 py-2 text-xs font-semibold text-indigo-600 dark:border-slate-700 dark:text-indigo-300">
                {isOpen ? 'Hide' : 'Details'}
              </button>
            </div>
            <div id={panelId} hidden={!isOpen} className="space-y-2 border-t border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/40">
              {isOpen ? <>
                <p><span className="font-semibold">Problem:</span> {problem.statement}</p>
                <p className="break-words"><span className="font-semibold">Example:</span> {problem.example}</p>
                <p><span className="font-semibold">Hint:</span> {problem.hint}</p>
              </> : null}
            </div>
          </article>;
        })}
      </div>
    </article>
  </section>;
}
