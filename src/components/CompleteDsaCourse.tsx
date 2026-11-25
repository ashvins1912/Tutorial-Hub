import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, GraduationCap } from 'lucide-react';
import { type DsaLesson } from '../data/dsaCompleteLessons';
import { MatrixProblemBank } from './MatrixProblemBank';
import { DpLearningLab } from './DpLearningLab';
import { useAccountState } from '../hooks/useAccountState';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { CatalogSearchInput } from './ui';

type SectionKey = 'keyTerms' | 'learningOutcomes' | 'prerequisites' | 'concepts' | 'deepDive' | 'recognition' | 'method' | 'workedExample' | 'traceExercises' | 'implementationSteps' | 'codeExamples' | 'correctness' | 'complexity' | 'pitfalls' | 'practice' | 'assessment' | 'realWorldApplications' | 'interviewChecks' | 'revisionPrompts';

const sectionMeta: { key: SectionKey; title: string; intro: string }[] = [
  { key: 'keyTerms', title: 'Key terms in plain words', intro: 'Learn each term with a short definition and a concrete example before moving into the deeper explanation.' },
  { key: 'learningOutcomes', title: 'What you will be able to do', intro: 'Observable outcomes that define when this topic is understood.' },
  { key: 'prerequisites', title: 'Prerequisites and foundations', intro: 'What to know first, with a clear bridge back when needed.' },
  { key: 'concepts', title: 'Concepts to understand', intro: 'Learn the vocabulary and mechanics before memorising templates.' },
  { key: 'deepDive', title: 'Topic deep dive', intro: 'Build from intuition to underlying mechanics, assumptions and variations.' },
  { key: 'recognition', title: 'When should I use this?', intro: 'Recognise the problem signals and the assumptions that make the technique valid.' },
  { key: 'method', title: 'How to derive a solution', intro: 'A repeatable reasoning process from the direct approach to a justified algorithm.' },
  { key: 'workedExample', title: 'Worked example', intro: 'Follow the reasoning step by step; trace the state on paper before coding.' },
  { key: 'traceExercises', title: 'Predict and trace', intro: 'Try each state transition before checking the explanation.' },
  { key: 'implementationSteps', title: 'Implementation guide', intro: 'Translate the reasoning into safe, maintainable code.' },
  { key: 'codeExamples', title: 'Code examples and walkthroughs', intro: 'Study language-specific implementations and why each important line exists.' },
  { key: 'correctness', title: 'Correctness and invariants', intro: 'Understand why the algorithm works, not just that it passes examples.' },
  { key: 'complexity', title: 'Time and space complexity', intro: 'Know what is counted and why the bound follows.' },
  { key: 'pitfalls', title: 'Common mistakes', intro: 'Use these as a pre-submit checklist.' },
  { key: 'practice', title: 'Practice ladder', intro: 'Move from guided fundamentals to independent transfer.' },
  { key: 'assessment', title: 'Knowledge and application assessment', intro: 'Demonstrate the outcomes on fresh questions and constraints.' },
  { key: 'realWorldApplications', title: 'Engineering applications', intro: 'Connect the topic to real software and data workflows.' },
  { key: 'interviewChecks', title: 'Interview readiness checks', intro: 'Answer these without reading the lesson.' },
  { key: 'revisionPrompts', title: 'Revision and long-term retention', intro: 'Use retrieval prompts and spaced review to retain the skill.' },
];

type LessonProgress = Record<string, string[]>;
function SectionList({ lesson, section }: { lesson: DsaLesson; section: SectionKey }) {
  if (section === 'keyTerms') {
    return <div className="grid gap-3 sm:grid-cols-2">{(lesson.keyTerms ?? []).map((item) => (
      <article key={item.term} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.term}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{item.definition}</p>
        {item.example ? <p className="mt-2 rounded-md bg-white px-3 py-2 text-xs leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-400"><span className="font-semibold">Example:</span> {item.example}</p> : null}
      </article>
    ))}</div>;
  }
  if (section === 'codeExamples') {
    return <div className="space-y-4">{(lesson.codeExamples ?? []).map((example, exampleIndex) => {
      const codeLines = example.code.split('\n');
      return <article key={example.title} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"><h4 className="text-sm font-semibold">{example.title}</h4><span className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">{example.language}</span></div>
        <div className="border-b border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-center justify-between px-4 pt-3"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Code walkthrough</span><span className="text-[11px] text-slate-400">Read the line numbers with the explanation</span></div>
          <pre tabIndex={0} aria-label={`${example.language} code example: ${example.title}`} aria-describedby={`dsa-code-explanation-${lesson.id}-${exampleIndex}`} className="overflow-x-auto p-4 text-sm leading-6 text-slate-800 dark:text-slate-200"><code>{codeLines.map((line, index) => <span key={index} className="flex min-w-max"><span aria-hidden="true" className="mr-4 inline-block w-6 shrink-0 select-none text-right text-slate-400">{index + 1}</span><span>{line || ' '}{'\n'}</span></span>)}</code></pre>
        </div>
        <div id={`dsa-code-explanation-${lesson.id}-${exampleIndex}`} className="border-t border-slate-100 bg-sky-50/60 p-4 dark:border-slate-700 dark:bg-sky-950/20"><h5 className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">What the code is doing</h5><p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{example.explanation}</p><p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Study tip: predict the next state, trace the variables, then explain why each update is safe before changing the code.</p></div>
      </article>;
    })}</div>;
  }
  if (section === 'practice') {
    return <div className="grid gap-3 sm:grid-cols-2">{lesson.practice.map((item, index) => (
      <article key={item.task} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-sky-700 dark:text-sky-300">{item.level}</span><span className="text-[11px] text-slate-400">Exercise {index + 1}</span></div>
        <h4 className="mt-2 text-sm font-semibold">{item.task}</h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.goal}</p>
      </article>
    ))}</div>;
  }
  const values = (lesson[section] ?? []) as string[];
  if (values.length === 0) return null;
  return <ol className="space-y-2.5">{values.map((value, index) => (
    <li key={`${section}-${index}`} className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800">{index + 1}</span>
      <span>{value}</span>
    </li>
  ))}</ol>;
}

export function CompleteDsaCourse() {
  const {
    data: { lessons: DSA_COMPLETE_LESSONS, steps: DSA_LESSON_STEPS },
  } = useAsyncCatalog('dsa-complete-lessons');
  const [activeId, setActiveId] = useState(DSA_COMPLETE_LESSONS[0].id);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<SectionKey[]>(['keyTerms', 'recognition', 'method', 'workedExample']);
  const [progress, setProgress] = useAccountState<LessonProgress>('dsa-course-progress', {});
  const active = DSA_COMPLETE_LESSONS.find((lesson) => lesson.id === activeId) ?? DSA_COMPLETE_LESSONS[0];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DSA_COMPLETE_LESSONS;
    const searchableText = (lesson: DsaLesson) => [
      lesson.title, lesson.promise, lesson.mentalModel,
      ...(lesson.keyTerms ?? []).flatMap((item) => [item.term, item.definition, item.example]),
      ...(lesson.concepts ?? []), ...(lesson.deepDive ?? []), ...(lesson.recognition ?? []), ...(lesson.method ?? []),
      ...(lesson.workedExample ?? []), ...(lesson.traceExercises ?? []), ...(lesson.implementationSteps ?? []),
      ...(lesson.correctness ?? []), ...(lesson.complexity ?? []), ...(lesson.pitfalls ?? []),
      ...(lesson.learningOutcomes ?? []), ...(lesson.prerequisites ?? []), ...(lesson.interviewChecks ?? []),
      ...(lesson.assessment ?? []), ...(lesson.realWorldApplications ?? []), ...(lesson.revisionPrompts ?? []),
      ...(lesson.practice ?? []).flatMap((item) => [item.task, item.goal, item.level]),
      ...(lesson.codeExamples ?? []).flatMap((item) => [item.title, item.language, item.code, item.explanation]),
    ].join(' ').toLowerCase();
    return DSA_COMPLETE_LESSONS.filter((lesson) => searchableText(lesson).includes(q));
  }, [DSA_COMPLETE_LESSONS, search]);
  const validStepSet = new Set<string>(DSA_LESSON_STEPS);
  const validProgressFor = (lessonId: string) => {
    const stored = progress[lessonId];
    const steps = Array.isArray(stored) ? stored : [];
    return [...new Set(steps.filter((step) => typeof step === 'string' && validStepSet.has(step)))];
  };
  const doneCount = DSA_COMPLETE_LESSONS.filter((lesson) => validProgressFor(lesson.id).length === DSA_LESSON_STEPS.length).length;
  const activeCompletedSteps = validProgressFor(active.id);
  const toggleStep = (step: string) => {
    if (!validStepSet.has(step)) return;
    const current = activeCompletedSteps;
    const next = current.includes(step) ? current.filter((item) => item !== step) : [...current, step];
    const updated = { ...progress, [active.id]: next };
    setProgress(updated);
  };
  const toggleSection = (key: SectionKey) => setExpanded((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  return <div className="space-y-5">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300"><GraduationCap className="h-4 w-4" /> DSA Academy · {DSA_COMPLETE_LESSONS.length} modules</div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Learn to solve, not memorise</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">Each module takes you from mental model to recognition, derivation, worked reasoning, complexity, pitfalls and independent practice. Mark a learning step only after you can perform it without copying.</p>
          </div>
          <div className="min-w-44 rounded-xl border border-white/15 bg-white/10 p-4">
            <div className="text-xs text-slate-300">Modules self-marked complete</div>
            <div className="mt-1 text-3xl font-bold tabular-nums">{doneCount}<span className="text-base text-slate-400"> / {DSA_COMPLETE_LESSONS.length}</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-sky-400" style={{ width: (doneCount / DSA_COMPLETE_LESSONS.length * 100) + '%' }} /></div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-4 sm:p-5">
        {['Understand the idea', 'Recognise the pattern', 'Derive and prove it', 'Solve new variations'].map((item, index) => <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">{index + 1}</span>{item}</div>)}
      </div>
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
        <CatalogSearchInput value={search} onChange={setSearch} placeholder="Find a module or concept..." />
        <div className="mt-3 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><span>Learning path</span><span>{filtered.length} / {DSA_COMPLETE_LESSONS.length}</span></div>
        <div className="mt-2 max-h-[65vh] space-y-1 overflow-y-auto">
          {filtered.map((lesson) => {
            const count = validProgressFor(lesson.id).length;
            const selected = active.id === lesson.id;
            return <button key={lesson.id} type="button" onClick={() => setActiveId(lesson.id)} aria-pressed={selected} className={`w-full rounded-xl border p-3 text-left transition-colors ${selected ? 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{lesson.title}</span>{count === DSA_LESSON_STEPS.length ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <span className="text-[10px] tabular-nums text-slate-400">{count}/{DSA_LESSON_STEPS.length}</span>}</div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{lesson.promise}</p>
            </button>;
          })}
          {filtered.length === 0 && <p className="p-4 text-center text-xs text-slate-500">No matching module.</p>}
        </div>
      </aside>

      <div className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="max-w-3xl"><div className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">Module {DSA_COMPLETE_LESSONS.findIndex((item) => item.id === active.id) + 1} of {DSA_COMPLETE_LESSONS.length}</div><h2 className="mt-2 text-2xl font-bold">{active.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{active.promise}</p>
              {active.sourcePages?.length ? <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">Source notes: PDF page{active.sourcePages.length > 1 ? "s" : ""} {active.sourcePages.join(", ")}</p> : null}</div><BookOpen className="h-7 w-7 text-sky-500" /></div>
          <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/30"><div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">Mental model</div><p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{active.mentalModel}</p></div>
        </section>

        {sectionMeta.filter((meta) => meta.key === 'codeExamples' ? Boolean(active.codeExamples?.length) : Boolean((active[meta.key] as unknown[] | undefined)?.length)).map((meta) => {
          const isOpen = expanded.includes(meta.key);
          return <section key={meta.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button type="button" onClick={() => toggleSection(meta.key)} aria-expanded={isOpen} aria-controls={`dsa-section-${meta.key}`} className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"><div><h3 className="text-sm font-bold sm:text-base">{meta.title}</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{meta.intro}</p></div>{isOpen ? <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" /> : <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />}</button>
            <div id={`dsa-section-${meta.key}`} hidden={!isOpen} className="border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5">{isOpen ? <SectionList lesson={active} section={meta.key} /> : null}</div>
          </section>;
        })}

        {active.id === 'dynamic-programming' && <DpLearningLab />}
        {active.id === 'two-dimensional-arrays' && <MatrixProblemBank />}\n\n        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Your mastery checklist</h3><p className="mt-1 text-xs text-slate-500">Complete all eight steps through independent work, not by simply reading.</p></div><span className="text-sm font-bold tabular-nums">{activeCompletedSteps.length}/{DSA_LESSON_STEPS.length}</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: (activeCompletedSteps.length / DSA_LESSON_STEPS.length * 100) + '%' }} /></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{DSA_LESSON_STEPS.map((step) => { const checked = activeCompletedSteps.includes(step); return <button key={step} type="button" onClick={() => toggleStep(step)} aria-pressed={checked} className="flex items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"><span className={checked ? 'text-emerald-500' : 'text-slate-300'}>{checked ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}</span><span className={`text-xs leading-relaxed ${checked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{step}</span></button>; })}</div>
          <p className="mt-3 text-[11px] text-slate-400">Progress is stored locally in this browser. It is a self-assessment, not an externally graded result.</p>
        </section>
      </div>
    </div>
  </div>;
}
