import { useMemo, useState } from 'react';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
};
type PracticeTask = { title: string; instructions: string; expectedOutcome: string };
type TraceStep = { title: string; explanation: string; values: number[]; active: number[]; variables: Record<string, string | number> };

export function binarySearchTrace(values: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let left = 0, right = values.length - 1;
  while (left <= right && steps.length < 100) {
    const mid = Math.floor(left + (right - left) / 2);
    steps.push({ title: 'Compare the middle value', explanation: `Compare ${values[mid]} at index ${mid} with target ${target}.`, values: [...values], active: [mid], variables: { left, mid, right, target } });
    if (values[mid] === target) {
      steps.push({ title: 'Target found', explanation: `The target is at index ${mid}. Binary search stops.`, values: [...values], active: [mid], variables: { result: mid, comparisons: steps.length } });
      return steps;
    }
    if (values[mid] < target) {
      left = mid + 1;
      steps.push({ title: 'Discard the left half', explanation: 'The middle value is smaller, so continue in the right half.', values: [...values], active: [left, right].filter((i) => i >= 0 && i < values.length), variables: { left, right, target } });
    } else {
      right = mid - 1;
      steps.push({ title: 'Discard the right half', explanation: 'The middle value is larger, so continue in the left half.', values: [...values], active: [left, right].filter((i) => i >= 0 && i < values.length), variables: { left, right, target } });
    }
  }
  steps.push({ title: 'Target not found', explanation: 'The search interval is empty. Return -1.', values: [...values], active: [], variables: { result: -1, comparisons: steps.filter((s) => s.title === 'Compare the middle value').length } });
  return steps;
}

export function bubbleSortTrace(values: number[]): TraceStep[] {
  const result = [...values];
  const steps: TraceStep[] = [{ title: 'Initial array', explanation: 'Compare adjacent values and swap them when they are out of order.', values: [...result], active: [], variables: { pass: 0, swaps: 0 } }];
  let swaps = 0;
  for (let pass = 0; pass < result.length - 1 && steps.length < 100; pass++) {
    let changed = false;
    for (let index = 0; index < result.length - pass - 1 && steps.length < 100; index++) {
      const before = [...result];
      const shouldSwap = result[index] > result[index + 1];
      if (shouldSwap) { [result[index], result[index + 1]] = [result[index + 1], result[index]]; swaps++; changed = true; }
      steps.push({ title: shouldSwap ? 'Swap adjacent values' : 'Keep adjacent values', explanation: shouldSwap ? `${before[index]} is greater than ${before[index + 1]}, so swap them.` : `${before[index]} is not greater than ${before[index + 1]}, so keep the order.`, values: [...result], active: [index, index + 1], variables: { pass: pass + 1, comparisons: steps.length, swaps } });
    }
    if (!changed) break;
  }
  steps.push({ title: 'Array sorted', explanation: 'No more adjacent swaps are required.', values: [...result], active: [], variables: { swaps, result: 'sorted' } });
  return steps;
}

export function parseInput(raw: string): number[] {
  const values = raw.split(',').map((part) => Number(part.trim()));
  if (!values.length || values.some((value) => !Number.isFinite(value))) throw new Error('Enter comma-separated finite numbers.');
  if (values.length > 24) throw new Error('Use at most 24 values for a readable trace.');
  return values;
}

export function LearningRuntime({ jobId, quiz, practiceTasks = [] }: { jobId: string; quiz: QuizQuestion[]; practiceTasks?: PracticeTask[] }) {
  const [algorithm, setAlgorithm] = useState<'binary-search' | 'bubble-sort'>('binary-search');
  const [rawValues, setRawValues] = useState('2, 5, 8, 12, 16, 23, 38');
  const [target, setTarget] = useState('16');
  const [traceIndex, setTraceIndex] = useState(0);
  const [traceError, setTraceError] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

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
  const current = trace[traceIndex];
  const isCorrect = (question: QuizQuestion, answer: string) => {
    const expected = (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]).map((value) => String(value).trim().toLowerCase()).sort();
    const actual = answer.split('|').filter(Boolean).map((value) => value.trim().toLowerCase()).sort();
    return expected.length === actual.length && expected.every((value, index) => value === actual[index]);
  };

  const submitQuiz = () => { setSubmitted(true); setAttempts((value) => value + 1); };

  return <section className="space-y-4" aria-label="Interactive learning runtime">
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-semibold">Algorithm trace lab</h4><p className="text-[11px] text-slate-500">Deterministic, built-in simulations. No generated source code is executed.</p></div><span className="text-[10px] rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-1">Step-by-step</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-[11px] text-slate-500">Algorithm<select className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-2 text-xs text-slate-900 dark:text-slate-100" value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as typeof algorithm); setTraceIndex(0); setTraceError(''); }}><option value="binary-search">Binary search</option><option value="bubble-sort">Bubble sort</option></select></label>
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
      {quiz.map((question, index) => <fieldset key={index} disabled={submitted} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2"><legend className="px-1 text-xs font-semibold">{index + 1}. {question.question}</legend>{question.options.map((option, optionIndex) => <label key={optionIndex} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="radio" name={`quiz-${jobId}-${index}`} checked={answers[index] === option} onChange={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [index]: option }))} className="mt-0.5"/>{option}</label>)}{submitted && <div className="rounded bg-slate-50 dark:bg-slate-950 p-2 text-[11px]"><strong>{isCorrect(question, answers[index] || '') ? 'Correct' : 'Review this answer'}</strong><p className="mt-1 text-slate-500">Answer: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}. {question.explanation}</p></div>}</fieldset>)}
      {!submitted ? <button type="button" disabled={quiz.some((_, index) => !answers[index])} onClick={submitQuiz} className="rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-40">Submit answers</button> : <div className="space-y-2"><p className="text-sm font-semibold">Score: {score} / {quiz.length} ({accuracy}%)</p><p className="text-xs text-slate-500">Suggested next difficulty: <strong className="capitalize">{nextLevel}</strong>. {accuracy >= 80 ? 'Move to a harder practice set.' : accuracy >= 50 ? 'Review missed explanations, then try an intermediate set.' : 'Revisit the lesson fundamentals before retrying.'}</p><button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-lg border px-4 py-2 text-xs">Retry quiz</button></div>}
    </div>}

    {practiceTasks.length > 0 && <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2"><h4 className="text-sm font-semibold">Practice checklist</h4>{practiceTasks.map((task, index) => <details key={index} className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3"><summary className="cursor-pointer text-xs font-semibold">{task.title}</summary><p className="mt-2 text-xs text-slate-500">{task.instructions}</p><p className="mt-1 text-xs text-slate-500">Expected outcome: {task.expectedOutcome}</p></details>)}</div>}
    <p className="text-[10px] text-slate-500">Runtime progress is currently held in this browser session; cross-device account progress and isolated execution of arbitrary Java/JavaScript/Python code require a separately configured persistence service and sandbox.</p>
  </section>;
}
