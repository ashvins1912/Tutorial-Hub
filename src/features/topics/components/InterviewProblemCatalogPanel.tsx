import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiFetch } from '../../../lib/apiFetch';
import { BookOpen, Brain, CheckCircle2, Code2, Compass, FlaskConical, Loader2, Search, Sparkles } from 'lucide-react';

type StageKey='understand'|'visualize'|'implement'|'practice'|'master';
type ProblemRecord={
  slug:string; title:string; topicId:string; topic:string; difficulty:string;
  contentStatus:string; catalogStatus:string; statement?:string;
  examples?:Array<{input:string;output:string;explanation?:string}>;
  constraints?:string[];
  stages?:Record<string,any>;
  authoringMetadata?:{status?:string;missingEvidence?:string[];sourcePolicy?:string;sourceReferences?:string[];qualityChecks?:Record<string,boolean>};
  source?:{kind?:string;reference?:string};
};
const TOPICS=[
  ['arrays','Arrays'],['strings','Strings'],['two-pointers','Two Pointers'],['sliding-window','Sliding Window'],
  ['hashing','Hashing'],['binary-search','Binary Search'],['linked-lists','Linked Lists'],['stack-queue','Stack and Queue'],
  ['binary-trees','Binary Trees'],['bst','Binary Search Tree'],['heaps','Heap / Priority Queue'],
  ['backtracking','Recursion and Backtracking'],['dynamic-programming','Dynamic Programming'],['graphs','Graph Algorithms'],
  ['greedy','Greedy'],['trie','Trie'],['bit-manipulation','Bit Manipulation'],['intervals','Intervals'],
  ['prefix-sum','Prefix Sum and Difference Array'],['sorting','Sorting'],
  ['advanced-data-structures','Advanced Data Structures'],['mathematics','Mathematical Algorithms']
] as const;
const STAGES:{id:StageKey;label:string;icon:any;description:string}[]=[
  {id:'understand',label:'01 Understand',icon:BookOpen,description:'Concept, recognition signals, prerequisites, and invariant'},
  {id:'visualize',label:'02 Visualize',icon:Compass,description:'Diagram model, animation sequence, and trace walkthrough'},
  {id:'implement',label:'03 Implement',icon:Code2,description:'Brute force → better → optimal, pseudocode, and language checklist'},
  {id:'practice',label:'04 Practice',icon:FlaskConical,description:'Progressive hints, edge cases, and test-design ladder'},
  {id:'master',label:'05 Master',icon:Brain,description:'Correctness proof, complexity, interview follow-ups, and revision'}
];
function TextList({items}:{items?:any[]}) {
  if(!items?.length)return <p className="text-xs text-slate-500">Not authored yet.</p>;
  return <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">{items.map((item,i)=><li key={i}>{typeof item==='string'?item:JSON.stringify(item)}</li>)}</ul>;
}
function Panel({title,children}:{title:string;children:ReactNode}) {
  return <section className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2"><h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h4>{children}</section>;
}
function AnimationSequence({steps}:{steps:string[]}) {
  const [activeStep,setActiveStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{
    if(!playing||steps.length<2)return;
    const timer=window.setInterval(()=>setActiveStep(current=>current>=steps.length-1?0:current+1),1200);
    return()=>window.clearInterval(timer);
  },[playing,steps.length]);
  const move=(next:number)=>{setPlaying(false);setActiveStep(Math.max(0,Math.min(steps.length-1,next)));};
  return <Panel title="Problem-specific animation">
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={()=>setPlaying(value=>!value)} disabled={steps.length<2} className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">{playing?'Pause':'Play animation'}</button>
      <button type="button" onClick={()=>move(0)} className="rounded-md border px-3 py-1.5 text-xs">Restart</button>
      <button type="button" onClick={()=>move(activeStep-1)} disabled={activeStep===0} className="rounded-md border px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
      <button type="button" onClick={()=>move(activeStep+1)} disabled={activeStep>=steps.length-1} className="rounded-md border px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
      <span className="ml-auto text-xs tabular-nums text-slate-500">Step {steps.length?activeStep+1:0} / {steps.length}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{width:steps.length?((activeStep+1)/steps.length*100)+'%':'0%'}}/></div>
    <div className="min-h-20 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed transition-all duration-300 dark:border-sky-900 dark:bg-sky-950/40">{steps[activeStep]??'No animation steps authored yet.'}</div>
    <ol className="space-y-1 text-xs">{steps.map((step,index)=><li key={index} className={`rounded-md px-2 py-1.5 transition-colors ${index===activeStep?'bg-sky-100 font-semibold text-sky-900 dark:bg-sky-900/50 dark:text-sky-100':'text-slate-500'}`}><button type="button" onClick={()=>move(index)} className="w-full text-left">{index+1}. {step}</button></li>)}</ol>
  </Panel>;
}

function StageContent({problem,stage}:{problem:ProblemRecord;stage:StageKey}) {
  const data=problem.stages?.[stage]??{};
  if(stage==='understand')return <div className="grid md:grid-cols-2 gap-3">
    <Panel title="Core concept"><p className="text-sm leading-relaxed">{data.concept}</p><p className="text-sm mt-2">{data.problemGoal}</p></Panel>
    <Panel title="Recognition signals"><TextList items={data.recognitionSignals}/></Panel>
    <Panel title="Prerequisites"><TextList items={data.prerequisites}/></Panel>
    <Panel title="Invariant"><p className="text-sm leading-relaxed">{data.invariant}</p></Panel>
    <Panel title="Clarify before coding"><TextList items={data.clarifyBeforeCoding}/></Panel>
    <Panel title="Source verification"><p className="text-xs leading-relaxed">{data.sourceVerification}</p></Panel>
  </div>;
  if(stage==='visualize')return <div className="space-y-3">
    <Panel title="Hand-drawn model / diagram"><pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono bg-slate-50 dark:bg-slate-950 rounded-md p-3">{data.diagram}</pre><p className="text-xs text-slate-500">{data.diagramNotation}</p></Panel>
    <AnimationSequence steps={data.animationSteps??[]}/>
    <Panel title="Trace walkthrough"><p className="text-sm leading-relaxed">{data.traceWalkthrough}</p></Panel>
  </div>;
  if(stage==='implement')return <div className="space-y-3">
    <div className="grid md:grid-cols-3 gap-3">
      <Panel title="A. Brute force"><p className="text-sm">{data.bruteForce?.idea}</p><p className="text-xs text-amber-600 mt-2">{data.bruteForce?.bottleneck}</p></Panel>
      <Panel title="B. Better"><p className="text-sm">{data.better?.idea}</p><p className="text-xs text-slate-500 mt-2">{data.better?.upgrade}</p></Panel>
      <Panel title="C. Optimal pattern"><p className="text-sm">{data.optimal?.idea}</p><p className="text-xs text-slate-500 mt-2">{data.optimal?.invariant}</p></Panel>
    </div>
    <Panel title="Pseudocode"><pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed">{data.pseudocode}</pre></Panel>
    <div className="grid md:grid-cols-3 gap-3">
      <Panel title="Java solution"><pre className="whitespace-pre-wrap overflow-x-auto text-xs font-mono leading-relaxed">{data.java}</pre></Panel>
      <Panel title="JavaScript solution"><pre className="whitespace-pre-wrap overflow-x-auto text-xs font-mono leading-relaxed">{data.javascript}</pre></Panel>
      <Panel title="Python solution"><pre className="whitespace-pre-wrap overflow-x-auto text-xs font-mono leading-relaxed">{data.python}</pre></Panel>
    </div>
    <Panel title="Dry-run checklist"><TextList items={data.dryRunChecklist}/></Panel>
    <p className="text-xs text-amber-700 dark:text-amber-400">{data.languageStatus==='blueprint-not-submission'?'These are implementation blueprints, not verified accepted submissions. Problem-specific executable code remains to be authored and tested.':data.languageStatus==='verified-submissions'?'Java, JavaScript and Python submissions are included and exercised by the batch test suite.':''}</p>
  </div>;
  if(stage==='practice')return <div className="grid md:grid-cols-2 gap-3">
    <Panel title="Progressive hints"><TextList items={data.hints}/></Panel>
    <Panel title="Edge-case checklist"><TextList items={data.edgeCases}/></Panel>
    <Panel title="Test-design ladder"><TextList items={data.testDesign}/></Panel>
    <Panel title="Official examples and constraints"><div className="space-y-3">{(problem.examples??[]).map((example,i)=><div key={i} className="text-xs space-y-1"><b>Example {i+1}</b><p><b>Input:</b> {example.input}</p><p><b>Output:</b> {example.output}</p>{example.explanation&&<p><b>Explanation:</b> {example.explanation}</p>}</div>)}</div><ul className="list-disc pl-5 text-xs space-y-1">{(problem.constraints??[]).map((constraint,i)=><li key={i}>{constraint}</li>)}</ul><p className="text-xs text-amber-700 dark:text-amber-400">{data.validationNote}</p></Panel><Panel title="Executable regression cases"><TextList items={(data.testCases??[]).map((test:any)=>test.input+" → "+test.expected)}/></Panel>
  </div>;
  return <div className="space-y-3">
    <Panel title="Correctness proof strategy"><p className="text-sm leading-relaxed">{data.proof}</p></Panel>
    <div className="grid md:grid-cols-2 gap-3">
      <Panel title="Complexity"><p className="text-sm"><b>Time:</b> {data.timeComplexity}</p><p className="text-sm mt-1"><b>Space:</b> {data.spaceComplexity}</p><p className="text-xs text-slate-500 mt-2">{data.complexityDerivation}</p></Panel>
      <Panel title="Invariant"><p className="text-sm">{data.invariant}</p></Panel>
      <Panel title="Correctness checklist"><TextList items={data.correctnessChecklist}/></Panel>
      <Panel title="Common pitfalls"><TextList items={data.pitfalls}/></Panel>
      <Panel title="Interview follow-ups"><TextList items={data.interviewFollowUps}/></Panel>
      <Panel title="Mastery gate"><TextList items={data.masteryGate}/><p className="text-xs text-slate-500">Target score: {data.targetScore}%</p></Panel>
    </div>
    <Panel title="Knowledge-check quiz">{(data.quiz??[]).map((q:any,i:number)=><div key={i} className="border-b last:border-0 border-slate-100 dark:border-slate-800 py-2"><p className="text-sm font-semibold">{i+1}. {q.question}</p><details className="mt-1 text-xs"><summary className="cursor-pointer text-sky-600">Reveal reasoning</summary><p className="mt-2 text-slate-600 dark:text-slate-300">{q.answer}</p></details></div>)}</Panel>
    <Panel title="Spaced revision"><div className="flex flex-wrap gap-2">{(data.revisionDays??[1,3,7,14,30]).map((day:number)=><span key={day} className="rounded-full border px-3 py-1 text-xs">Day {day}</span>)}</div></Panel>
  </div>;
}

export function InterviewProblemCatalogPanel(){
  const [topicId,setTopicId]=useState<string>('arrays');
  const [query,setQuery]=useState('');
  const [problems,setProblems]=useState<ProblemRecord[]>([]);
  const [selectedSlug,setSelectedSlug]=useState('');
  const [stage,setStage]=useState<StageKey>('understand');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [apiUnavailable,setApiUnavailable]=useState(false);
  const [reference,setReference]=useState<any>(null);
  const [referenceLoading,setReferenceLoading]=useState(false);
  const [referenceError,setReferenceError]=useState('');
  const selected=useMemo(()=>problems.find(p=>p.slug===selectedSlug)??problems[0],[problems,selectedSlug]);
  useEffect(()=>{setReference(null);setReferenceError('');},[selectedSlug]);
  const loadOfficialReference=async()=>{
    if(!selected)return;
    setReferenceLoading(true);setReferenceError('');
    const sourceSlug=selected.title.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    try{const response=await apiFetch('/api/leetcode/problem/'+sourceSlug);if(!response.ok)throw new Error('No LeetCode source was found for this title.');const payload=await response.json();setReference(payload.problem);}
    catch(e){setReferenceError(e instanceof Error?e.message:'Unable to load the official reference.');}
    finally{setReferenceLoading(false);}
  };

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      setLoading(true);setError('');setApiUnavailable(false);
      try{
        const params=new URLSearchParams({topicId,page:'1',limit:'100'});
        if(query.trim())params.set('q',query.trim());
        const response=await apiFetch(`/api/interview-problems?${params.toString()}`);
        if(!response.ok)throw new Error(response.status===503?'MongoDB problem catalog is unavailable.':'Unable to load interview problems.');
        const payload=await response.json();
        if(!active)return;
        const rows:ProblemRecord[]=payload.problems??[];
        setProblems(rows);
        setSelectedSlug((current)=>rows.some(p=>p.slug===current)?current:(rows[0]?.slug??''));
      }catch(e){if(active){setProblems([]);setError(e instanceof Error?e.message:'Problem catalog request failed.');setApiUnavailable(true);}}
      finally{if(active)setLoading(false);}
    };
    void load();
    return()=>{active=false;};
  },[topicId,query]);

  return <section className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-sky-500"/><h2 className="text-base font-bold">293-Question Interview Master Bank</h2></div><p className="text-xs text-slate-500 mt-1">Topic-first lessons with five stages, source-verification flags, and spaced revision.</p></div>
      <span className="text-xs rounded-full border px-2.5 py-1 text-slate-500">22 topics · 293 questions</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,0.7fr)_minmax(220px,1fr)] gap-3">
      <label className="text-xs font-semibold text-slate-500">Topic
        <select value={topicId} onChange={e=>setTopicId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2.5 text-sm">
          {TOPICS.map(([id,label])=><option key={id} value={id}>{label}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-500">Search questions
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3"><Search className="w-4 h-4 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search within selected topic..." className="w-full bg-transparent py-2.5 text-sm outline-none"/></div>
      </label>
    </div>
    {error&&<div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">{error}{apiUnavailable?' The app can still use the existing curriculum, but this catalog requires a connected MongoDB API.':''}</div>}
    {loading?<div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin"/>Loading topic questions...</div>:<div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.6fr)] gap-4">
      <div className="max-h-[560px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="px-3 py-2 text-xs text-slate-500">{problems.length} questions in {TOPICS.find(t=>t[0]===topicId)?.[1]}</div>
        {problems.map(problem=><button key={problem.slug} onClick={()=>setSelectedSlug(problem.slug)} className={`w-full text-left px-3 py-3 transition-colors ${selected?.slug===problem.slug?'bg-sky-50 dark:bg-sky-950/40':'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}>
          <span className="block text-sm font-semibold">{problem.title}</span><span className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500"><span>{problem.difficulty}</span><span>·</span><span>{problem.contentStatus}</span></span>
        </button>)}
        {!problems.length&&!error&&<p className="p-4 text-sm text-slate-500">No matching questions.</p>}
      </div>
      {selected?<div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-lg font-bold">{selected.title}</h3><p className="text-xs text-slate-500 mt-1">{selected.topic} · {selected.difficulty} · {selected.slug}</p></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${selected.contentStatus==='validated'?'border-emerald-300 text-emerald-700 dark:text-emerald-300':'border-amber-300 text-amber-700 dark:text-amber-300'}`}>{selected.contentStatus==='validated'?'Validated':selected.authoringMetadata?.status??'Draft lesson'}</span></div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 space-y-2"><p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Problem statement</p><p className="text-sm leading-relaxed">{selected.statement??'Problem statement awaiting source verification.'}</p>{selected.source?.reference&&<a className="text-xs text-sky-600 underline" href={selected.source.reference} target="_blank" rel="noreferrer">Verify original LeetCode statement ↗</a>}</div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold">Official source lookup</p><p className="text-[11px] text-slate-500">Optional LeetCode statement, sample tests, hints and Java starter code when a matching slug exists.</p></div><button onClick={()=>void loadOfficialReference()} disabled={referenceLoading} className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 text-xs font-semibold disabled:opacity-50">{referenceLoading?"Loading source...":"Fetch LeetCode reference"}</button></div>
          {referenceError&&<p className="text-xs text-amber-700">{referenceError}</p>}
          {reference&&<div className="space-y-2 text-xs"><p className="font-semibold">{reference.title} · #{reference.questionId} · {reference.difficulty}</p><a className="text-sky-600 underline" href={"https://leetcode.com/problems/"+reference.slug+"/"} target="_blank" rel="noreferrer">Open original problem</a><details><summary className="cursor-pointer font-semibold">Statement text</summary><pre className="mt-2 whitespace-pre-wrap text-xs">{String(reference.contentHtml??"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/\s+/g," ").trim()}</pre></details><details><summary className="cursor-pointer font-semibold">Official sample test input</summary><pre className="mt-2 whitespace-pre-wrap">{reference.exampleTestcases||"No sample tests returned."}</pre></details><Panel title="LeetCode hints"><TextList items={reference.hints}/></Panel></div>}
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">{STAGES.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>setStage(item.id)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${stage===item.id?'bg-sky-600 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}><Icon className="w-3.5 h-3.5"/>{item.label}</button>;})}</div>
        <p className="text-xs text-slate-500">{STAGES.find(s=>s.id===stage)?.description}</p>
        <StageContent problem={selected} stage={stage}/>
        <div className={`rounded-lg border p-3 text-xs ${selected.contentStatus==='validated'?'border-emerald-200 text-emerald-800 dark:border-emerald-900 dark:text-emerald-200':'border-amber-200 text-amber-800 dark:border-amber-900 dark:text-amber-200'}`}><b>Content quality:</b> {selected.contentStatus==='validated'?'Source, examples, constraints, three language submissions, executable tests, animation, proof and complexity checks passed.':'This lesson remains a draft until all source and executable quality gates pass.'} {(selected.authoringMetadata?.missingEvidence??[]).length} evidence items remain.</div>
      </div>:<div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">Select a problem to open its five-stage lesson.</div>}
    </div>}
  </section>;
}
