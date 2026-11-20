import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Code2, Eye, GraduationCap, Search, Target } from 'lucide-react';
import { type SharedProblem } from '../data/sharedTopicAcademy';
import { useAccountState } from '../hooks/useAccountState';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';

type Mastery = Record<string, boolean>;
type Solved = Record<string, boolean>;
interface LeetCodeProblemDetails {
  slug: string; questionId: string; title: string; difficulty: string;
  contentHtml: string; exampleTestcases: string; hints: string[];
  javaSnippet: string | null; topics: string[];
}

export function SharedTopicAcademy() {
  const {
    data: { lessons: SHARED_TOPIC_LESSONS, problems: SHARED_TOPIC_PROBLEMS },
  } = useAsyncCatalog('shared-topic-academy');
  const [activeTopicId, setActiveTopicId] = useState(SHARED_TOPIC_LESSONS[0].id);
  const [activeProblem, setActiveProblem] = useState<SharedProblem | null>(null);
  const [leetcodeDetails, setLeetcodeDetails] = useState<LeetCodeProblemDetails | null>(null);
  const [leetcodeLoading, setLeetcodeLoading] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('All tracks');
  const [difficulty, setDifficulty] = useState('All');
  const [step, setStep] = useState(0);
  const [labStage, setLabStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [company, setCompany] = useState('Google');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({ recognition: 3, correctness: 3, complexity: 3, communication: 3, edgeCases: 3 });
  const [identifiedSignals, setIdentifiedSignals] = useState<string[]>([]);
  const [mastery, setMastery] = useAccountState<Mastery>('shared-topic-mastery', {});
  const [solved, setSolved] = useAccountState<Solved>('shared-topic-solved', {});
  useEffect(() => {
    if (!activeProblem) {
      setLeetcodeDetails(null);
      setLeetcodeError(null);
      setLeetcodeLoading(false);
      return;
    }
    const controller = new AbortController();
    setLeetcodeDetails(null);
    setLeetcodeError(null);
    setLeetcodeLoading(true);
    fetch(`/api/leetcode/problem/${encodeURIComponent(activeProblem.slug)}`, { signal: controller.signal })
      .then(async response => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Could not load the LeetCode statement.');
        return payload.problem as LeetCodeProblemDetails;
      })
      .then(details => setLeetcodeDetails(details))
      .catch(error => {
        if (error.name !== 'AbortError') setLeetcodeError(error.message || 'Could not load the LeetCode statement.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLeetcodeLoading(false);
      });
    return () => controller.abort();
  }, [activeProblem?.slug]);

  const topic = SHARED_TOPIC_LESSONS.find(item => item.id === activeTopicId) ?? SHARED_TOPIC_LESSONS[0];
  const topicProblems = useMemo(() => SHARED_TOPIC_PROBLEMS.filter(problem => problem.topicId === topic.id), [SHARED_TOPIC_PROBLEMS, topic.id]);
  const filteredProblems = topicProblems.filter(problem =>
    (!search || `${problem.title} ${problem.category} ${problem.number}`.toLowerCase().includes(search.toLowerCase()))
    && (source === 'All tracks' || problem.source === source)
    && (difficulty === 'All' || problem.difficulty === difficulty));
  const masteredCount = Object.values(mastery).filter(Boolean).length;
  const solvedCount = Object.values(solved).filter(Boolean).length;
  const setMastered = (value: boolean) => {
    const next = { ...mastery, [topic.id]: value }; setMastery(next);
  };
  const setProblemSolved = (problem: SharedProblem, value: boolean) => {
    const next = { ...solved, [problem.id]: value }; setSolved(next);
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
        {activeProblem&&<section className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-900 dark:bg-sky-950/20">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wide text-sky-700">Five-stage problem mastery lab · {activeProblem.source}</div><h3 className="mt-1 text-lg font-bold">#{activeProblem.number} {activeProblem.title}</h3><p className="mt-1 text-xs text-slate-500">A guided workflow attached to this exact problem. Complete each stage before moving to the next.</p></div><button type="button" onClick={()=>setActiveProblem(null)} className="text-xs text-slate-500 underline">Close lab</button></div>
          <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h4 className="text-sm font-bold">Problem statement, examples & constraints</h4><p className="mt-1 text-[11px] text-slate-500">Loaded for this exact problem from LeetCode's problem data.</p></div>
              {leetcodeDetails && <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">LeetCode #{leetcodeDetails.questionId} · {leetcodeDetails.difficulty}</span>}
            </div>
            {leetcodeLoading && <p className="mt-3 text-xs text-slate-500">Loading the official problem statement…</p>}
            {leetcodeError && <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{leetcodeError} <a className="ml-1 font-semibold underline" href={`https://leetcode.com/problems/${activeProblem.slug}/`} target="_blank" rel="noreferrer">Open LeetCode ↗</a></div>}
            {leetcodeDetails && <>
              <div className="mt-3 flex flex-wrap gap-1">{leetcodeDetails.topics.map(tag=><span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tag}</span>)}</div>
              <iframe title={`${activeProblem.title} problem statement`} sandbox="" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font:14px/1.65 system-ui,sans-serif;color:#334155;margin:0;padding:12px;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;padding:10px;border-radius:8px}code{font-family:ui-monospace,monospace}img{max-width:100%;height:auto}table{border-collapse:collapse;max-width:100%}td,th{border:1px solid #cbd5e1;padding:6px}a{color:#0284c7}</style></head><body>${leetcodeDetails.contentHtml}</body></html>`} className="mt-3 h-[440px] w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700" />
              {leetcodeDetails.exampleTestcases && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold">Raw example test cases</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-[11px] dark:bg-slate-800">{leetcodeDetails.exampleTestcases}</pre></details>}
              {leetcodeDetails.javaSnippet && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold">LeetCode Java starter signature</summary><pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-[11px] text-sky-100">{leetcodeDetails.javaSnippet}</pre></details>}
              {leetcodeDetails.hints.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold">LeetCode hints</summary><ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">{leetcodeDetails.hints.map((hint,index)=><li key={index}>{hint}</li>)}</ol></details>}
            </>}
          </section>
          <nav aria-label="Problem mastery stages" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{[{id:1,label:'1. Understand'},{id:2,label:'2. Identify'},{id:3,label:'3. Build'},{id:4,label:'4. Optimise'},{id:5,label:'5. Company rubric'}].map(item=><button key={item.id} type="button" onClick={()=>setLabStage(item.id as 1|2|3|4|5)} className={`rounded-lg border px-2 py-2 text-[11px] font-semibold ${labStage===item.id?'border-sky-500 bg-sky-600 text-white':'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>{item.label}</button>)}</nav>
          <div className="mt-4 rounded-xl bg-white p-4 dark:bg-slate-900">
            {labStage===1&&<div><h4 className="text-sm font-bold">Understand the problem</h4><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Before coding {activeProblem.title}, write down the input shape, expected output, constraints, duplicates, empty input and boundary cases. Identify what must be returned and whether order or in-place mutation matters.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800"><strong>Source & category</strong><p className="mt-1 text-slate-500">{activeProblem.source} · {activeProblem.category}</p></div><div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800"><strong>Difficulty</strong><p className="mt-1 text-slate-500">{activeProblem.difficulty}</p></div></div><p className="mt-3 text-xs text-slate-500">Learning prompt: explain the problem in one sentence without using the title's words.</p></div>}
            {labStage===2&&<div><h4 className="text-sm font-bold">Identification trainer · recognise the pattern</h4><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Select the signals that genuinely appear in this problem. Compare your reasoning with the topic recognition guide.</p><div className="mt-3 space-y-2">{topic.recognize.map(signal=><label key={signal} className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700"><input type="checkbox" checked={identifiedSignals.includes(signal)} onChange={e=>setIdentifiedSignals(old=>e.target.checked?[...old,signal]:old.filter(x=>x!==signal))}/><span>{signal}</span></label>)}</div><div className="mt-3 rounded-lg bg-sky-50 p-3 text-xs text-sky-900 dark:bg-sky-950/40 dark:text-sky-200"><strong>Topic recognition guide:</strong> {topic.summary}</div><p className="mt-2 text-[11px] text-slate-500">{identifiedSignals.length} recognition signals selected. Explain why each one applies before continuing.</p></div>}
            {labStage===3&&<div><h4 className="text-sm font-bold">Build the algorithm</h4><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Derive the solution instead of memorising it. Work through these steps for {activeProblem.title}:</p><ol className="mt-3 list-decimal space-y-2 pl-5 text-xs text-slate-600 dark:text-slate-300">{topic.derive.map(item=><li key={item}>{item}</li>)}</ol><div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><strong className="text-xs">Java pattern reference</strong><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[11px] text-slate-600 dark:text-slate-300">{topic.javaPattern}</pre></div><p className="mt-2 text-[11px] text-amber-700 dark:text-amber-300">This is a reusable topic template, not a claimed accepted solution for this individual problem. Validate the problem-specific implementation and tests.</p></div>}
            {labStage===4&&<div><h4 className="text-sm font-bold">Optimise, prove and test</h4><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-rose-200 p-3 dark:border-rose-900"><strong className="text-xs">Brute-force baseline</strong><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{topic.bruteForce}</p></div><div className="rounded-lg border border-emerald-200 p-3 dark:border-emerald-900"><strong className="text-xs">Optimal direction</strong><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{topic.optimal}</p></div></div><p className="mt-3 text-xs"><strong>Complexity:</strong> {topic.complexity}</p><div className="mt-3"><strong className="text-xs">Pitfalls checklist</strong><ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">{topic.pitfalls.map(p=><li key={p}>{p}</li>)}</ul></div></div>}
            {labStage===5&&<div><h4 className="text-sm font-bold">Company interview rubric</h4><p className="mt-1 text-xs text-slate-500">Self-assess this problem using a consistent interview scorecard. These are practice criteria, not official company hiring rubrics.</p><select value={company} onChange={e=>setCompany(e.target.value)} className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">{['Google','Meta','Amazon','Microsoft','Apple'].map(name=><option key={name}>{name}</option>)}</select><div className="mt-3 space-y-3">{[{id:'recognition',label:'Pattern identification'},{id:'correctness',label:'Correctness and invariant'},{id:'complexity',label:'Time/space complexity'},{id:'communication',label:'Communication and trade-offs'},{id:'edgeCases',label:'Edge cases and testing'}].map(metric=><label key={metric.id} className="flex flex-wrap items-center justify-between gap-2 text-xs"><span>{metric.label}</span><select value={rubricScores[metric.id]} onChange={e=>setRubricScores(old=>({...old,[metric.id]:Number(e.target.value)}))} className="rounded border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}/5</option>)}</select></label>)}</div><div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800"><strong>{company} practice score: {Object.values(rubricScores).reduce((a,b)=>a+b,0)}/25</strong><p className="mt-1 text-slate-500">Use this as a personal practice benchmark. It is not an official company-specific scoring model.</p></div></div>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><a href={`https://leetcode.com/problems/${activeProblem.slug}/`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-sky-700 underline dark:text-sky-300">Open original problem ↗</a><div className="flex gap-2"><button type="button" disabled={labStage===1} onClick={()=>setLabStage(s=>(s-1) as 1|2|3|4|5)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-40 dark:border-slate-700">Previous stage</button><button type="button" onClick={()=>setLabStage(s=>(s===5?1:(s+1) as 1|2|3|4|5))} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-sky-500 dark:text-slate-950">{labStage===5?'Restart lab':'Next stage'}</button></div></div>
        </section>}
      </main>
    </div>
  </div>;
}
