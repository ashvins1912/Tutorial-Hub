import { useMemo, useState } from 'react';
import { buildDomainScenario } from './domainPredictionScenarios';
import type { DomainLessonSimulator } from './domainSimulatorContract';

export function DomainPredictionSimulator({ simulator }: { simulator: DomainLessonSimulator }) {
  const frames = useMemo(() => buildDomainScenario(simulator.scenario), [simulator.scenario]);
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string; expected: string; rationale: string } | null>(null);
  const frame = frames[step];
  const prediction = frame?.prediction;

  const advance = () => {
    if (!prediction || !choice) return;
    setFeedback({ correct: choice === prediction.correctOption, answer: choice, expected: prediction.correctOption, rationale: prediction.rationale });
    setChoice('');
    setStep((current) => Math.min(current + 1, frames.length - 1));
  };

  return <section className="rounded-xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900 space-y-3" data-domain-simulator={simulator.id} aria-label={simulator.title}>
    <header>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{simulator.title}</h4>
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{simulator.scenario.replaceAll('-', ' ')}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{simulator.description}</p>
      <p className="mt-1 text-[10px] text-slate-500">Objective links: {simulator.objectiveIds.join(' · ')}</p>
    </header>
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-2"><strong className="text-xs">{frame.title}</strong><span className="text-[10px] text-slate-500">Step {step + 1} / {frames.length}</span></div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{frame.detail}</p>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{frame.metrics.map((metric) => <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"><dt className="text-[10px] text-slate-500">{metric.label}</dt><dd className="mt-1 text-xs font-semibold">{metric.value}</dd></div>)}</dl>
    </div>
    {feedback && <div role="status" className={`rounded-lg p-3 text-xs ${feedback.correct ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
      <strong>{feedback.correct ? 'Correct prediction' : 'Review the domain outcome'}</strong>
      <p className="mt-1">Your prediction: {feedback.answer}</p><p className="mt-1">Expected: {feedback.expected}</p>
      <p className="mt-1">{feedback.rationale}</p>
    </div>}
    {prediction ? <fieldset className="space-y-2 rounded-lg border border-indigo-200 p-3 dark:border-indigo-900">
      <legend className="px-1 text-xs font-semibold">Predict the domain-specific outcome</legend>
      <p className="text-xs text-slate-600 dark:text-slate-300">{prediction.prompt}</p>
      {prediction.options.map((option) => <label key={option} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
        <input type="radio" name={`domain-prediction-${simulator.id}-${step}`} checked={choice === option} onChange={() => setChoice(option)} className="mt-0.5" />
        <span>{option}</span>
      </label>)}
    </fieldset> : <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><strong>Scenario complete.</strong> Review the final assumptions and compare them with a real execution plan, trace, load test or pipeline configuration.</div>}
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40" disabled={step === 0} onClick={() => { setStep((value) => value - 1); setChoice(''); setFeedback(null); }}>Previous</button>
      {prediction && <button type="button" className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40" disabled={!choice} onClick={advance}>Check prediction & reveal</button>}
      <button type="button" className="rounded-lg border px-3 py-2 text-xs" onClick={() => { setStep(0); setChoice(''); setFeedback(null); }}>Reset scenario</button>
    </div>
    <p className="text-[10px] text-slate-500">Deterministic teaching model. It does not execute SQL, schedule real threads, provision cloud resources or replace production measurements.</p>
  </section>;
}
