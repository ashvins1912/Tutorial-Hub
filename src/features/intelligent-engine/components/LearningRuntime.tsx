import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../lib/apiFetch';
import { CodeExecutionLab } from './CodeExecutionLab';
import { binarySearchTrace, bubbleSortTrace, parseInput } from './learningAlgorithms';

export function LearningRuntime({ jobId, quiz, practiceTasks = [] }: { jobId: string; quiz: QuizQuestion[]; practiceTasks?: PracticeTask[] }) {
  const [algorithm, setAlgorithm] = useState<'binary-search' | 'bubble-sort'>('binary-search');
  const [rawValues, setRawValues] = useState('2, 5, 8, 12, 16, 23, 38');
  const [target, setTarget] = useState('16');
  const [traceIndex, setTraceIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const [progressStatus, setProgressStatus] = useState('Loading saved progress…');
  const [completedPracticeIds, setCompletedPracticeIds] = useState<string[]>([]);
  const [masterySummary, setMasterySummary] = useState<{ bestScore: number; masteryLevel: string } | null>(null);

  useEffect(() => {
    let active = true;
    setProgressReady(false);
    setProgressStatus('Loading saved progress…');
    setAlgorithm('binary-search'); setRawValues('2, 5, 8, 12, 16, 23, 38'); setTarget('16'); setTraceIndex(0);
    setAttempts(0); setAnswers({}); setSubmitted(false); setCompletedPracticeIds([]); setMasterySummary(null);
    apiFetch('/api/learning-progress/' + encodeURIComponent(jobId))
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 503 ? 'Database persistence is unavailable.' : 'Could not load saved progress.');
        const payload = await response.json() as { progress?: { algorithm?: string; input?: string; target?: string; currentStep?: number; attempts?: number; lastScore?: number | null; bestScore?: number; masteryLevel?: string; lastAnswers?: Record<string, string>; completedPracticeIds?: string[] } | null };
        if (!active) return;
        const saved = payload.progress;
        if (saved) {
          if (saved.algorithm === 'binary-search' || saved.algorithm === 'bubble-sort') setAlgorithm(saved.algorithm);
          if (typeof saved.input === 'string') setRawValues(saved.input);
          if (typeof saved.target === 'string') setTarget(saved.target);
          setTraceIndex(typeof saved.currentStep === 'number' ? saved.currentStep : 0);
          setAttempts(saved.attempts || 0);
          setAnswers(saved.lastAnswers || {});
          setSubmitted(saved.lastScore !== null && saved.lastScore !== undefined);
          setCompletedPracticeIds(saved.completedPracticeIds || []);
          setMasterySummary({ bestScore: saved.bestScore || 0, masteryLevel: saved.masteryLevel || 'beginner' });
        }
        setProgressStatus(saved ? 'Saved progress restored' : 'New learning session');
      })
      .catch((error) => { if (active) setProgressStatus(error instanceof Error ? error.message : 'Progress unavailable'); })
      .finally(() => { if (active) setProgressReady(true); });
    return () => { active = false; };
  }, [jobId]);
  const trace = useMemo(() => {
    try {
      const values = parseInput(rawValues);
      if (algorithm === 'binary-search') {
        if (values.some((value, index) => index > 0 && values[index - 1] > value)) throw new Error('Binary search requires ascending sorted input.');
        const parsedTarget = Number(target);
        if (!Number.isFinite(parsedTarget)) throw new Error('Enter a finite numeric search target.');
        return binarySearchTrace(values, parsedTarget);
      }
      return bubbleSortTrace(values);
    } catch { return []; }
  }, [algorithm, rawValues, target]);
  const score = quiz.reduce((sum, question, index) => {
    const expected = (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]).map((value) => String(value).trim().toLowerCase()).sort();
    const actual = (answers[index] || '').split('|').filter(Boolean).map((value) => value.trim().toLowerCase()).sort();
    return sum + (expected.length === actual.length && expected.every((value, i) => value === actual[i]) ? 1 : 0);
  }, 0);
  const accuracy = quiz.length ? Math.round((score / quiz.length) * 100) : 0;
  const nextLevel = accuracy >= 80 ? 'advanced' : accuracy >= 50 ? 'intermediate' : 'beginner';
  const current = trace[Math.min(traceIndex, Math.max(0, trace.length - 1))] || { title: '', explanation: '', values: [], active: [], variables: {} };
  useEffect(() => { if (trace.length && traceIndex >= trace.length) setTraceIndex(trace.length - 1); }, [trace.length, traceIndex]);
  useEffect(() => {
    if (!progressReady) return;
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch('/api/learning-progress/' + encodeURIComponent(jobId), {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ algorithm, input: rawValues, target, currentStep: Math.min(traceIndex, 100), completedPracticeIds }),
        });
        if (!response.ok) throw new Error('Save failed');
        setProgressStatus('Progress saved');
      } catch { setProgressStatus('Progress not saved — check your connection'); }
    }, 700);
    return () => clearTimeout(timer);
  }, [progressReady, jobId, algorithm, rawValues, target, traceIndex, completedPracticeIds]);

  const isCorrect = (question: QuizQuestion, answer: string) => {
    const expected = (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]).map((value) => String(value).trim().toLowerCase()).sort();
    const actual = answer.split('|').filter(Boolean).map((value) => value.trim().toLowerCase()).sort();
    return expected.length === actual.length && expected.every((value, index) => value === actual[index]);
  };

  const submitQuiz = async () => {
    setSubmitted(true);
    try {
      const response = await apiFetch('/api/learning-progress/' + encodeURIComponent(jobId), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizAttempt: { score, total: quiz.length, answers } }) });
      if (!response.ok) throw new Error('Quiz progress could not be saved.');
      const payload = await response.json() as { progress?: { attempts?: number; bestScore?: number; masteryLevel?: string } };
      setAttempts(payload.progress?.attempts ?? attempts + 1);
      setMasterySummary({ bestScore: payload.progress?.bestScore ?? accuracy, masteryLevel: payload.progress?.masteryLevel ?? nextLevel });
      setProgressStatus('Quiz result saved');
    } catch { setAttempts((value) => value + 1); setProgressStatus('Quiz completed, but saving failed'); }
  };

  return <section className="space-y-4" aria-label="Interactive learning runtime">
    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>{progressStatus}</span>{masterySummary && <span>Best score: {masterySummary.bestScore}% · Mastery: <strong className="capitalize">{masterySummary.masteryLevel}</strong></span>}</div>
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-semibold">Algorithm trace lab</h4><p className="text-[11px] text-slate-500">Deterministic, built-in simulations. No generated source code is executed.</p></div><span className="text-[10px] rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-1">Step-by-step</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-[11px] text-slate-500">Algorithm<select className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-2 text-xs text-slate-900 dark:text-slate-100" value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as typeof algorithm); setTraceIndex(0); }}><option value="binary-search">Binary search</option><option value="bubble-sort">Bubble sort</option></select></label>
        <label className="text-[11px] text-slate-500">Input values (comma-separated)<input className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-2 text-xs text-slate-900 dark:text-slate-100" value={rawValues} onChange={(event) => { setRawValues(event.target.value); setTraceIndex(0); }} /></label>
      </div>
      {algorithm === 'binary-search' && <label className="block text-[11px] text-slate-500">Target value<input className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-2 text-xs text-slate-900 dark:text-slate-100" value={target} onChange={(event) => { setTarget(event.target.value); setTraceIndex(0); }} /></label>}
      {!trace.length ? <p role="alert" className="text-xs text-rose-600">Check the input. Binary search requires sorted ascending values.</p> : <>
        <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">{current.values.map((value, index) => <div key={index} className={`min-w-9 rounded-lg border px-2 py-2 text-center text-xs font-semibold ${current.active.includes(index) ? 'border-sky-500 bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100' : 'border-slate-200 dark:border-slate-700'}`}><span className="block text-[9px] font-normal text-slate-500">{index}</span>{value}</div>)}</div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3"><strong className="text-xs">{current.title}</strong><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{current.explanation}</p><div className="mt-2 flex flex-wrap gap-2">{Object.entries(current.variables).map(([key, value]) => <span key={key} className="rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 text-[10px]"><b>{key}</b>: {value}</span>)}</div></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40" disabled={traceIndex === 0} onClick={() => setTraceIndex((value) => value - 1)}>Previous</button><button type="button" className="rounded-lg bg-sky-600 px-3 py-2 text-xs text-white disabled:opacity-40" disabled={traceIndex >= trace.length - 1} onClick={() => setTraceIndex((value) => value + 1)}>Next step</button><button type="button" className="rounded-lg border px-3 py-2 text-xs" onClick={() => setTraceIndex(0)}>Reset</button><span className="ml-auto text-[10px] text-slate-500">Step {traceIndex + 1} / {trace.length}</span></div>
      </>}
    </div>

    {quiz.length > 0 && <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-semibold">Adaptive knowledge check</h4><p className="text-[11px] text-slate-500">Submit your choices to see explanations and a suggested next difficulty.</p></div><span className="text-[10px] text-slate-500">{attempts} attempt{attempts === 1 ? '' : 's'}</span></div>
      {quiz.map((question, index) => <fieldset key={index} disabled={submitted} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2"><legend className="px-1 text-xs font-semibold">{index + 1}. {question.question}</legend>{question.options.map((option, optionIndex) => { const multi = Array.isArray(question.correctAnswer) && question.correctAnswer.length > 1; const selectedOptions = (answers[index] || '').split('|').filter(Boolean); return <label key={optionIndex} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"><input type={multi ? 'checkbox' : 'radio'} name={`quiz-${jobId}-${index}`} checked={selectedOptions.includes(option)} onChange={() => setAnswers((currentAnswers) => { const current = (currentAnswers[index] || '').split('|').filter(Boolean); const next = multi ? (current.includes(option) ? current.filter((value) => value !== option) : [...current, option]) : [option]; return { ...currentAnswers, [index]: next.join('|') }; })} className="mt-0.5"/>{option}</label>; })}{submitted && <div className="rounded bg-slate-50 dark:bg-slate-950 p-2 text-[11px]"><strong>{isCorrect(question, answers[index] || '') ? 'Correct' : 'Review this answer'}</strong><p className="mt-1 text-slate-500">Answer: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}. {question.explanation}</p></div>}</fieldset>)}
      {!submitted ? <button type="button" disabled={quiz.some((_, index) => !answers[index])} onClick={submitQuiz} className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40">Submit answers</button> : <div className="space-y-2"><p className="text-sm font-semibold">Score: {score} / {quiz.length} ({accuracy}%)</p><p className="text-xs text-slate-500">Suggested next difficulty: <strong className="capitalize">{nextLevel}</strong>. {accuracy >= 80 ? 'Move to a harder practice set.' : accuracy >= 50 ? 'Review missed explanations, then try an intermediate set.' : 'Revisit the lesson fundamentals before retrying.'}</p><button type="button" onClick={() => { setAnswers({}); setSubmitted(false); void apiFetch('/api/learning-progress/' + encodeURIComponent(jobId), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resetQuiz: true }) }).then((response) => { if (!response.ok) throw new Error('Reset failed'); setProgressStatus('Ready for another attempt'); }).catch(() => setProgressStatus('Quiz reset locally; saved history remains unchanged')); }} className="rounded-lg border px-4 py-2 text-xs">Retry quiz</button></div>}
    </div>}

    {practiceTasks.length > 0 && <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2"><h4 className="text-sm font-semibold">Practice checklist</h4>{practiceTasks.map((task, index) => <div key={index} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3"><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={completedPracticeIds.includes("task-" + index)} onChange={(event) => setCompletedPracticeIds((currentIds) => event.target.checked ? [...currentIds, "task-" + index] : currentIds.filter((id) => id !== "task-" + index))}/>{task.title}</label><p className="mt-2 text-xs text-slate-500">{task.instructions}</p><p className="mt-1 text-xs text-slate-500">Expected outcome: {task.expectedOutcome}</p></div>)}</div>}
    <CodeExecutionLab />
    <p className="text-[10px] text-slate-500">Progress is saved to your authenticated account when the database is configured. Code runs only through the separately configured isolated Judge0 service; this application server never evaluates submitted code.</p>
  </section>;
}
