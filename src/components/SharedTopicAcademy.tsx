import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Code2, Eye, GraduationCap, Search, Target } from 'lucide-react';
import { SHARED_TOPIC_LESSONS, SHARED_TOPIC_PROBLEMS, type SharedProblem } from '../data/sharedTopicAcademy';

const PROGRESS_KEY = 'patternforge-shared-topic-mastery-v1';
const SOLVED_KEY = 'patternforge-shared-topic-solved-v1';
function readRecord<T,>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) || 'null') as T || fallback; } catch { return fallback; }
}
type Mastery = Record<string, boolean>;
type Solved = Record<string, boolean>;

export function SharedTopicAcademy() {
  const [activeTopicId, setActiveTopicId] = useState(SHARED_TOPIC_LESSONS[0].id);
  const [activeProblem, setActiveProblem] = useState<SharedProblem | null>(null);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('All tracks');
  const [difficulty, setDifficulty] = useState('All');
  const [step, setStep] = useState(0);
  const [mastery, setMastery] = useState<Mastery>(() => readRecord(PROGRESS_KEY, {}));
  const [solved, setSolved] = useState<Solved>(() => readRecord(SOLVED_KEY, {}));
  const topic = SHARED_TOPIC_LESSONS.find(item => item.id === activeTopicId) ?? SHARED_TOPIC_LESSONS[0];
  const topicProblems = useMemo(() => SHARED_TOPIC_PROBLEMS.filter(problem => problem.topicId === topic.id), [topic.id]);
  const filteredProblems = topicProblems.filter(problem =>
    (!search || `${problem.title} ${problem.category} ${problem.number}`.toLowerCase().includes(search.toLowerCase()))
    && (source === 'All tracks' || problem.source === source)
    && (difficulty === 'All' || problem.difficulty === difficulty));
  const masteredCount = Object.values(mastery).filter(Boolean).length;
  const solvedCount = Object.values(solved).filter(Boolean).length;
  const setMastered = (value: boolean) => {
    const next = { ...mastery, [topic.id]: value }; setMastery(next);
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  };
  const setProblemSolved = (problem: SharedProblem, value: boolean) => {
    const next = { ...solved, [problem.id]: value }; setSolved(next);
    window.localStorage.setItem(SOLVED_KEY, JSON.stringify(next));
  };
  const currentStep = topic.demo.steps[step];
  const topicSolved = topicProblems.filter(problem => solved[problem.id]).length;

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300"><GraduationCap className="h-4 w-4" /> Unified DSA curriculum</div>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Learn the pattern. Then solve every variation.</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">A shared teaching layer for LeetCode 75 and Top Interview 100. Study each algorithm topic once, see how it works, then practise all matching questions from both lists.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/15 bg-white/5 p-4"><div className="text-xs text-slate-400">Topic lessons</div><div className="mt-1 text-2xl font-bold">{SHARED_TOPIC_LESSONS.length}</div></div>
        <div className="rounded-xl border border-white/15 bg-white/5 p-4"><div className="text-xs text-slate-400">Questions across both tracks</div><div className="mt-1 text-2xl font-bold">{SHARED_TOPIC_PROBLEMS.length}</div></div>
        <div className="rounded-xl border border-white/15 bg-white/5 p-4"><div className="text-xs text-slate-400">Problems marked solved</div><div className="mt-1 text-2xl font-bold">{solvedCount}</div></div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-sky-400" style={{width: (masteredCount / SHARED_TOPIC_LESSONS.length * 100) + '%'}} /></div>
      <p className="mt-2 text-xs text-slate-400">{masteredCount} of {SHARED_TOPIC_LESSONS.length} topics marked mastered</p>
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
        <div className="flex items-center justify-between px-2 py-2"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic curriculum</h2><span className="text-xs text-slate-400">{SHARED_TOPIC_LESSONS.length}</span></div>
        <div className="max-h-[72vh] space-y-1 overflow-y-auto">
          {SHARED_TOPIC_LESSONS.map((item,index) => {
            const count=SHARED_TOPIC_PROBLEMS.filter(problem=>problem.topicId===item.id).length;
            return <button key={item.id} type="button" onClick={()=>{setActiveTopicId(item.id);setActiveProblem(null);setStep(0);}} className={`w-full rounded-xl border p-3 text-left ${activeTopicId===item.id?'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40':'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <div className="flex items-center gap-2"><span className="text-[10px] text-slate-400">{String(index+1).padStart(2,'0')}</span><span className="min-w-0 flex-1 text-xs font-semibold">{item.title}</span>{mastery[item.id]&&<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/>}</div>
              <div className="mt-1 pl-6 text-[10px] text-slate-400">{count} practice entries</div>
            </button>;
          })}
        </div>
      </aside>

      <main className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">{topic.family}</div><h2 className="mt-2 text-2xl font-bold">{topic.title}</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{topic.summary}</p></div><BookOpen className="h-7 w-7 text-sky-500"/></div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><h3 className="text-xs font-bold uppercase tracking-wide">When to recognise this pattern</h3><ul className="mt-3 space-y-2">{topic.recognize.map(item=><li key={item} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500"/>{item}</li>)}</ul></div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><h3 className="text-xs font-bold uppercase tracking-wide">Derive the solution</h3><ol className="mt-3 space-y-2">{topic.derive.map((item,index)=><li key={item} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-200">{index+1}</span>{item}</li>)}</ol></div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20"><h3 className="text-xs font-bold text-amber-800 dark:text-amber-300">Brute-force baseline</h3><p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{topic.bruteForce}</p></div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"><h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Optimised approach</h3><p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{topic.optimal}</p></div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="text-xs font-bold uppercase tracking-wide">Complexity model</h3><p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{topic.complexity}</p></div>
          <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="text-xs font-bold uppercase tracking-wide">Java pattern template</h3><pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-100"><code>{topic.javaPattern}</code></pre><p className="mt-2 text-[10px] text-slate-400">Template for the technique, not a complete accepted solution for every problem.</p></div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><h3 className="text-xs font-bold uppercase tracking-wide">Common mistakes to avoid</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2">{topic.pitfalls.map(item=><li key={item} className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">• {item}</li>)}</ul></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><div><div className="text-sm font-bold">Topic mastery</div><p className="mt-1 text-[11px] text-slate-500">Mark mastered after you can explain the invariant and solve a fresh variation.</p></div><button type="button" onClick={()=>setMastered(!mastery[topic.id])} className={`rounded-lg px-4 py-2 text-xs font-semibold ${mastery[topic.id]?'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300':'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'}`}>{mastery[topic.id]?'Mastered ✓':'Mark topic mastered'}</button></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-sky-600"/><h3 className="text-base font-bold">Step-by-step visual walkthrough</h3></div><p className="mt-1 text-xs text-slate-500">Advance through the algorithm trace and watch the active values/pointers change.</p></div><span className="text-xs tabular-nums text-slate-400">Step {step+1}/{topic.demo.steps.length}</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{topic.demo.values.map((value,index)=><div key={index} className={`flex h-14 min-w-14 items-center justify-center rounded-xl border text-sm font-bold tabular-nums transition-all ${currentStep.active.includes(index)?'border-sky-500 bg-sky-100 text-sky-900 ring-2 ring-sky-200 dark:bg-sky-900/50 dark:text-sky-100':'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800'}`}>{value}</div>)}</div>
          <div className="mt-4 rounded-xl bg-sky-50 p-4 dark:bg-sky-950/30"><div className="text-xs font-bold text-sky-800 dark:text-sky-300">{currentStep.label}</div><p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{currentStep.detail}</p></div>
          <div className="mt-4 flex items-center justify-between"><button type="button" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-40 dark:border-slate-700">Previous</button><button type="button" onClick={()=>setStep(s=>s+1<topic.demo.steps.length?s+1:0)} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-sky-500 dark:text-slate-950">{step===topic.demo.steps.length-1?'Replay walkthrough':'Next step'}</button></div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-bold">Practice problems for {topic.title}</h3><p className="mt-1 text-xs text-slate-500">{topicProblems.length} entries · {topicSolved} marked solved</p></div><div className="flex items-center gap-2 text-xs text-slate-500"><Code2 className="h-4 w-4"/> {filteredProblems.length} shown</div></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3"><label className="relative sm:col-span-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search problems..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs dark:border-slate-700 dark:bg-slate-950"/></label><select value={source} onChange={e=>setSource(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"><option>All tracks</option><option>LeetCode 75</option><option>Top Interview 100</option></select><select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">{filteredProblems.map(problem=><div key={problem.id} className="flex flex-wrap items-center gap-3 px-5 py-3"><span className="w-7 text-[10px] text-slate-400">#{problem.number}</span><div className="min-w-0 flex-1"><button type="button" onClick={()=>setActiveProblem(problem)} className="text-left text-xs font-semibold hover:text-sky-600">{problem.title}</button><div className="mt-1 text-[10px] text-slate-400">{problem.source} · {problem.category} · {problem.difficulty}</div></div><label className="flex items-center gap-1.5 text-[10px] text-slate-500"><input type="checkbox" checked={!!solved[problem.id]} onChange={e=>setProblemSolved(problem,e.target.checked)}/> Solved</label><a href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-sky-700 hover:underline dark:text-sky-300">Open problem ↗</a></div>)}</div>
          {filteredProblems.length===0&&<p className="p-8 text-center text-xs text-slate-500">No problems match these filters for this topic.</p>}
        </section>
        {activeProblem&&<section className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-sky-950/20"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Selected practice question · {activeProblem.source}</div><h3 className="mt-1 text-lg font-bold">{activeProblem.title}</h3><p className="mt-1 text-xs text-slate-500">Use the lesson above to derive your own brute-force and optimal Java implementations.</p></div><button type="button" onClick={()=>setActiveProblem(null)} className="text-xs text-slate-500 underline">Close</button></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-white p-3 text-xs dark:bg-slate-900"><strong>Step 1</strong><p className="mt-1 text-slate-500">Restate constraints and edge cases.</p></div><div className="rounded-lg bg-white p-3 text-xs dark:bg-slate-900"><strong>Step 2</strong><p className="mt-1 text-slate-500">Explain why this topic's pattern applies.</p></div><div className="rounded-lg bg-white p-3 text-xs dark:bg-slate-900"><strong>Step 3</strong><p className="mt-1 text-slate-500">Implement and test a brute-force baseline.</p></div><div className="rounded-lg bg-white p-3 text-xs dark:bg-slate-900"><strong>Step 4</strong><p className="mt-1 text-slate-500">Optimise, prove the invariant and analyse complexity.</p></div></div></section>}
      </main>
    </div>
  </div>;
}
