import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Code2, Compass, GraduationCap, Lightbulb, ListChecks, Play, RotateCcw, Search, Target } from 'lucide-react';
import { AI_ENGINEERING_CURRICULUM, getAcademyCounts, type AcademyLesson } from '../data/aiEngineeringCurriculum';
import { apiFetch } from '../../../lib/apiFetch';

type Tab = 'learn' | 'visual' | 'code' | 'quiz' | 'project';
type ProgressState = { completed: string[]; quizCorrect: string[] };

function emptyProgress(): ProgressState {
  return { completed: [], quizCorrect: [] };
}

export function AIEngineeringAcademy() {
  const counts = getAcademyCounts();
  const [progress, setProgress] = useState<ProgressState>(emptyProgress);
  const [progressStatus, setProgressStatus] = useState('Loading account progress…');
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [phaseId, setPhaseId] = useState(AI_ENGINEERING_CURRICULUM[0].id);
  const [lessonId, setLessonId] = useState(AI_ENGINEERING_CURRICULUM[0].modules[0].lessons[0].id);
  const [tab, setTab] = useState<Tab>('learn');
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>(['python']);
  const [activeStep, setActiveStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProgress = async () => {
      try {
        const response = await apiFetch('/api/ai-academy/progress');
        if (!response.ok) {
          if (active) setProgressStatus(response.status === 401 ? 'Sign in to sync your AI Academy progress across devices.' : response.status === 503 ? 'Account progress storage is unavailable. Your progress has not been saved.' : 'Could not load account progress.');
          return;
        }
        const payload = await response.json();
        if (!active) return;
        setProgress({
          completed: Array.isArray(payload.progress?.completed) ? payload.progress.completed : [],
          quizCorrect: Array.isArray(payload.progress?.quizPassed) ? payload.progress.quizPassed : [],
        });
        setProgressStatus('Progress synced to your account.');
      } catch {
        if (active) setProgressStatus('Unable to reach progress service. Sign in and retry when the service is available.');
      }
    };
    void loadProgress();
    return () => { active = false; };
  }, []);

  const phase = AI_ENGINEERING_CURRICULUM.find((item) => item.id === phaseId) ?? AI_ENGINEERING_CURRICULUM[0];
  const allLessons = AI_ENGINEERING_CURRICULUM.flatMap((p) => p.modules.flatMap((m) => m.lessons));
  const lesson = allLessons.find((item) => item.id === lessonId) ?? allLessons[0];
  const total = allLessons.length;
  const completion = Math.round((progress.completed.length / total) * 100);
  const filteredModules = useMemo(() => phase.modules.map((module) => ({
    ...module,
    lessons: module.lessons.filter((item) => `${item.title} ${item.why} ${module.title}`.toLowerCase().includes(search.toLowerCase()))
  })).filter((module) => module.lessons.length > 0), [phase, search]);

  const selectLesson = (next: AcademyLesson) => {
    setLessonId(next.id);
    setTab('learn');
    setActiveStep(0);
    setAnswer(null);
    setSubmitted(false);
    setQuizResult(null);
  };
  const markComplete = async () => {
    if (progress.completed.includes(lesson.id)) return;
    try {
      const response = await apiFetch('/api/ai-academy/progress/' + encodeURIComponent(lesson.id), {
        method: 'PUT', body: JSON.stringify({ action: 'complete' }),
      });
      if (!response.ok) {
        setProgressStatus(response.status === 401 ? 'Sign in to save lesson completion to your account.' : 'Could not save completion. Please retry.');
        return;
      }
      setProgress((old) => ({ ...old, completed: old.completed.includes(lesson.id) ? old.completed : [...old.completed, lesson.id] }));
      setProgressStatus('Lesson completion saved to your account.');
    } catch { setProgressStatus('Progress service unavailable. Completion was not saved.'); }
  };
  const submitQuiz = async () => {
    if (answer === null || submitted) return;
    try {
      const response = await apiFetch('/api/ai-academy/progress/' + encodeURIComponent(lesson.id), {
        method: 'PUT', body: JSON.stringify({ action: 'quiz', answer }),
      });
      if (!response.ok) {
        setProgressStatus(response.status === 401 ? 'Sign in to save quiz mastery to your account.' : 'Could not submit quiz. Please retry.');
        return;
      }
      const payload = await response.json();
      const correct = payload.grading?.correct === true;
      setQuizResult(correct);
      setSubmitted(true);
      if (payload.grading?.passed) setProgress((old) => ({ ...old, quizCorrect: old.quizCorrect.includes(lesson.id) ? old.quizCorrect : [...old.quizCorrect, lesson.id] }));
      setProgressStatus(correct ? 'Quiz result verified and saved to your account.' : 'Quiz attempt saved. Review the explanation and try again.');
    } catch { setProgressStatus('Quiz service unavailable. Your answer was not saved.'); }
  };
  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'learn', label: 'Understand', icon: BookOpen }, { id: 'visual', label: 'Visual flow', icon: Compass },
    { id: 'code', label: 'Code', icon: Code2 }, { id: 'quiz', label: 'Quiz', icon: CircleHelp }, { id: 'project', label: 'Apply', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-sky-700 dark:text-sky-300"><GraduationCap className="w-4 h-4"/> ZERO TO PRO · AI ENGINEERING ACADEMY</div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Learn AI by understanding how it works.</h1>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">A practical path from Python and mathematics to machine learning, neural networks, RAG, agents and production AI. Every lesson connects intuition, worked examples, code, visual flow and a real engineering task.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-[220px]">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3"><div className="text-xl font-bold">{counts.phases}</div><div className="text-[11px] text-slate-500">Phases</div></div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3"><div className="text-xl font-bold">{counts.modules}</div><div className="text-[11px] text-slate-500">Modules</div></div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 col-span-2 sm:col-span-1"><div className="text-xl font-bold">{counts.lessons}</div><div className="text-[11px] text-slate-500">Detailed lessons</div></div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500" role="status">{progressStatus}</div>
          <div className="mt-5 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
            <div className="flex justify-between text-xs font-semibold mb-2"><span>Learning progress</span><span>{progress.completed.length}/{total} lessons · {completion}%</span></div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${completion}%` }}/></div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
          {AI_ENGINEERING_CURRICULUM.map((item, index) => {
            const count = item.modules.reduce((sum, module) => sum + module.lessons.length, 0);
            const done = item.modules.flatMap((module) => module.lessons).filter((l) => progress.completed.includes(l.id)).length;
            return <button key={item.id} type="button" onClick={() => { setPhaseId(item.id); setLessonId(item.modules[0].lessons[0].id); setSearch(''); setExpandedModules([item.modules[0].id]); setTab('learn'); }} className={`text-left rounded-xl border p-3 transition-colors ${phaseId === item.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-slate-500">PHASE 0{index + 1}</span><span className="text-[11px] text-slate-500">{done}/{count}</span></div>
              <div className="font-semibold text-sm mt-1">{item.title.split('· ')[1]}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-4">{item.subtitle}</div>
            </button>;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[310px_minmax(0,1fr)] gap-4 items-start">
          <aside className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm">{phase.title}</div>
              <p className="text-xs text-slate-500 mt-1 leading-5">{phase.outcome}</p>
              <div className="relative mt-3"><Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a lesson..." className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs outline-none focus:border-sky-500"/></div>
            </div>
            <div className="max-h-[650px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredModules.map((module) => <div key={module.id}>
                <button type="button" onClick={() => setExpandedModules((old) => old.includes(module.id) ? old.filter((id) => id !== module.id) : [...old, module.id])} className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <span className="min-w-0"><span className="block text-xs font-semibold">{module.title}</span><span className="block text-[10px] text-slate-500 mt-1">{module.outcome}</span></span>
                  {expandedModules.includes(module.id) ? <ChevronDown className="w-4 h-4 shrink-0"/> : <ChevronRight className="w-4 h-4 shrink-0"/>}
                </button>
                {expandedModules.includes(module.id) && <div className="pb-2 px-2 space-y-1">{module.lessons.map((item) => <button key={item.id} type="button" onClick={() => selectLesson(item)} className={`w-full flex items-start gap-2 text-left rounded-lg p-2.5 text-xs ${lessonId === item.id ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  {progress.completed.includes(item.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0"/> : <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 mt-0.5"/>}
                  <span className="leading-5">{item.title}</span>
                </button>)}</div>}
              </div>)}
              {filteredModules.length === 0 && <div className="p-5 text-xs text-slate-500">No matching lessons in this phase.</div>}
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><div className="flex flex-wrap gap-2 items-center text-[11px] text-slate-500"><span>{phase.title}</span><span>·</span><span>{lesson.level}</span><span>·</span><span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3"/>{lesson.duration}</span></div><h2 className="text-xl sm:text-2xl font-bold mt-2">{lesson.title}</h2></div>
                <button type="button" onClick={markComplete} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${progress.completed.includes(lesson.id) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950'}`}><CheckCircle2 className="w-4 h-4"/>{progress.completed.includes(lesson.id) ? 'Completed' : 'Mark complete'}</button>
              </div>
              <div className="mt-4 flex gap-1 overflow-x-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                {tabs.map(({id,label,icon:Icon}) => <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap ${tab === id ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}><Icon className="w-3.5 h-3.5"/>{label}</button>)}
              </div>

              {tab === 'learn' && <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900 p-4"><div className="text-[11px] font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300 mb-1">Why this matters</div><p className="text-sm leading-6">{lesson.why}</p></div>
                <div><h3 className="font-bold text-sm flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500"/>Simple mental model</h3><p className="text-sm text-slate-600 dark:text-slate-300 leading-6 mt-2">{lesson.analogy}</p></div>
                <div><h3 className="font-bold text-sm">How it actually works</h3><p className="text-sm text-slate-600 dark:text-slate-300 leading-7 mt-2 whitespace-pre-line">{lesson.explanation}</p></div>
                <div><h3 className="font-bold text-sm mb-2">Remember these rules</h3><ul className="space-y-2">{lesson.keyPoints.map((point) => <li key={point} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 leading-6"><span className="text-sky-600">•</span>{point}</li>)}</ul></div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"><h3 className="font-bold text-sm mb-2">Worked example</h3><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{lesson.workedExample}</p></div>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 p-4"><h3 className="font-bold text-sm mb-2">Common mistakes</h3><ul className="list-disc pl-5 text-sm space-y-1 text-slate-700 dark:text-slate-300">{lesson.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>}

              {tab === 'visual' && <div className="mt-5 space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300">Select each stage to inspect what enters, what leaves and what can go wrong. This is an interactive pipeline model, not a static screenshot.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">{lesson.steps.map((step,index) => <button key={step.title} type="button" onClick={() => setActiveStep(index)} className={`text-left rounded-xl border p-3 ${activeStep === index ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40' : 'border-slate-200 dark:border-slate-700'}`}><div className="text-[10px] font-bold text-slate-500">STEP {index+1}</div><div className="text-sm font-semibold mt-1">{step.title}</div><div className="text-xs text-slate-500 mt-1 leading-5">{step.detail}</div></button>)}</div>
                <div className="flex justify-center"><Play className="w-4 h-4 text-sky-600"/></div>
                <div className="rounded-xl border border-sky-200 dark:border-sky-900 p-4 space-y-3"><div className="font-bold">{lesson.steps[activeStep]?.title}</div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><div><div className="text-[10px] font-bold uppercase text-slate-500">Input</div><p className="text-sm mt-1">{lesson.steps[activeStep]?.input}</p></div><div><div className="text-[10px] font-bold uppercase text-slate-500">Output</div><p className="text-sm mt-1">{lesson.steps[activeStep]?.output}</p></div><div><div className="text-[10px] font-bold uppercase text-rose-600">Failure mode</div><p className="text-sm mt-1">{lesson.steps[activeStep]?.failure}</p></div></div><div className="flex justify-between"><button type="button" onClick={() => setActiveStep((s) => Math.max(0,s-1))} disabled={activeStep===0} className="text-xs font-semibold disabled:opacity-30">← Previous</button><span className="text-[11px] text-slate-500">{activeStep+1} / {lesson.steps.length}</span><button type="button" onClick={() => setActiveStep((s) => Math.min(lesson.steps.length-1,s+1))} disabled={activeStep===lesson.steps.length-1} className="text-xs font-semibold disabled:opacity-30">Next →</button></div></div>
              </div>}

              {tab === 'code' && <div className="mt-5 space-y-3"><div className="flex items-center justify-between gap-2"><div><h3 className="font-bold text-sm">Implementation example</h3><p className="text-xs text-slate-500 mt-1">Read, run and modify this in a Python notebook. The academy does not execute untrusted code in the browser.</p></div><button type="button" onClick={() => { void navigator.clipboard?.writeText(lesson.code).then(() => setCopied(true)).catch(() => setCopied(false)); }} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold">{copied ? 'Copied' : 'Copy code'}</button></div><pre className="overflow-x-auto rounded-xl bg-slate-950 text-slate-100 p-4 text-xs leading-6"><code>{lesson.code}</code></pre><div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">Suggested free environment: Google Colab or Kaggle Notebooks. Install only the libraries used in the lesson.</div></div>}

              {tab === 'quiz' && <div className="mt-5 max-w-3xl space-y-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300"><ListChecks className="w-4 h-4"/> Check your reasoning</div><h3 className="text-base font-semibold leading-7">{lesson.question.prompt}</h3><div className="space-y-2">{lesson.question.options.map((option,index) => <button key={option} type="button" disabled={submitted} onClick={() => setAnswer(index)} className={`w-full text-left rounded-lg border p-3 text-sm ${submitted && index === lesson.question.answer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : answer === index ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>{String.fromCharCode(65+index)}. {option}</button>)}</div><button type="button" disabled={answer===null || submitted} onClick={submitQuiz} className="rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 px-4 py-2.5 text-xs font-bold disabled:opacity-40">Submit answer</button>{submitted && <div className={`rounded-xl p-4 text-sm leading-6 ${quizResult ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}><div className="font-bold mb-1">{quizResult ? 'Correct — verified by the server.' : 'Not quite. Review the explanation.'}</div>{lesson.question.explanation}</div>}</div>}

              {tab === 'project' && <div className="mt-5 space-y-4"><div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 p-4"><div className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-2">Practical task</div><p className="text-sm leading-7">{lesson.project}</p></div><div><h3 className="font-bold text-sm mb-2">Definition of done</h3><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300"><li>□ I can explain the approach without reading the lesson.</li><li>□ I can implement the core steps and test normal and edge cases.</li><li>□ I can describe at least one failure mode and how I would detect it.</li><li>□ I can explain when I would choose a different approach.</li></ul></div><button type="button" onClick={markComplete} className="rounded-lg bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold">Mark lesson complete</button></div>}
            </section>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>Quiz mastery: {progress.quizCorrect.includes(lesson.id) ? 'Passed' : 'Not passed yet'} · Lesson progress is saved in this browser.</span><button type="button" onClick={() => { setAnswer(null); setSubmitted(false); setQuizResult(null); setActiveStep(0); setTab('learn'); setCopied(false); }} className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"><RotateCcw className="w-3.5 h-3.5"/> Reset lesson view</button></div>
          </main>
        </div>
      </div>
    </div>
  );
}
