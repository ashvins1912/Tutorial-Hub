import { useMemo, useRef, useState } from 'react';
import { buildDomainScenario, DEFAULT_DOMAIN_SCENARIO_INPUTS, type DomainScenarioInputs } from './domainPredictionScenarios';
import { chooseDomainPrediction, createDomainSimulatorSession, previousDomainStep, revealDomainPrediction } from './domainSimulatorSession';
import type { DomainLessonSimulator } from './domainSimulatorContract';

function ScenarioControls({ scenario, inputs, onChange }: { scenario: DomainLessonSimulator['scenario']; inputs: DomainScenarioInputs; onChange: (next: DomainScenarioInputs) => void }) {
  const numberField = (label: string, value: number, min: number, max: number, step: number, update: (value: number) => DomainScenarioInputs) =>
    <label className="grid gap-1 text-xs text-slate-700 dark:text-slate-300"><span>{label}</span><input type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={(event) => { const next = Number(event.target.value); if (Number.isFinite(next) && next >= min && next <= max) onChange(update(next)); }} className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"/></label>;
  const toggle = (label: string, checked: boolean, update: (checked: boolean) => DomainScenarioInputs) =>
    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"><input type="checkbox" checked={checked} onChange={(event) => onChange(update(event.target.checked))} className="size-4 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"/><span>{label}</span></label>;

  return <details className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
    <summary className="cursor-pointer text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Adjust scenario assumptions</summary>
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {scenario === 'database-query-plan' && <>
        {numberField('Table rows', inputs.database.rowCount, 1_000, 100_000_000, 1_000, (value) => ({ ...inputs, database: { ...inputs.database, rowCount: value } }))}
        {numberField('Predicate selectivity (%)', inputs.database.selectivityPct, 0.01, 100, 0.01, (value) => ({ ...inputs, database: { ...inputs.database, selectivityPct: value } }))}
        {toggle('B-tree index available', inputs.database.hasIndex, (value) => ({ ...inputs, database: { ...inputs.database, hasIndex: value, coveringIndex: value && inputs.database.coveringIndex } }))}
        {toggle('Index covers projected columns', inputs.database.coveringIndex, (value) => ({ ...inputs, database: { ...inputs.database, coveringIndex: value, hasIndex: value || inputs.database.hasIndex } }))}
      </>}
      {scenario === 'system-capacity' && <>
        {numberField('Incoming requests / second', inputs.system.incomingRps, 1, 1_000_000, 10, (value) => ({ ...inputs, system: { ...inputs.system, incomingRps: value } }))}
        {numberField('API Gateway capacity (RPS)', inputs.system.gatewayCapacity, 1, 1_000_000, 10, (value) => ({ ...inputs, system: { ...inputs.system, gatewayCapacity: value } }))}
        {numberField('Order Service capacity (RPS)', inputs.system.orderCapacity, 1, 1_000_000, 10, (value) => ({ ...inputs, system: { ...inputs.system, orderCapacity: value } }))}
        {numberField('Inventory Service capacity (RPS)', inputs.system.inventoryCapacity, 1, 1_000_000, 10, (value) => ({ ...inputs, system: { ...inputs.system, inventoryCapacity: value } }))}
      </>}
      {scenario === 'concurrency-lost-update' && <>
        {numberField('Initial balance', inputs.concurrency.initialBalance, 1, 1_000_000, 1, (value) => ({ ...inputs, concurrency: { ...inputs.concurrency, initialBalance: value } }))}
        {numberField('T1 withdrawal', inputs.concurrency.firstWithdrawal, 0, 1_000_000, 1, (value) => ({ ...inputs, concurrency: { ...inputs.concurrency, firstWithdrawal: value } }))}
        {numberField('T2 withdrawal', inputs.concurrency.secondWithdrawal, 0, 1_000_000, 1, (value) => ({ ...inputs, concurrency: { ...inputs.concurrency, secondWithdrawal: value } }))}
      </>}
      {scenario === 'cloud-pipeline-gate' && <>
        {toggle('Secret scanner detects a credential', inputs.cloud.secretDetected, (value) => ({ ...inputs, cloud: { ...inputs.cloud, secretDetected: value } }))}
        {toggle('Automated tests pass', inputs.cloud.testsPass, (value) => ({ ...inputs, cloud: { ...inputs.cloud, testsPass: value } }))}
        {toggle('Vulnerability policy scan passes', inputs.cloud.vulnerabilityScanPass, (value) => ({ ...inputs, cloud: { ...inputs.cloud, vulnerabilityScanPass: value } }))}
        {toggle('Artifact signature and provenance are valid', inputs.cloud.signatureValid, (value) => ({ ...inputs, cloud: { ...inputs.cloud, signatureValid: value } }))}
      </>}
    </div>
    <p className="mt-3 text-[10px] text-slate-500">Changing assumptions recalculates the deterministic teaching model. These values are not production telemetry.</p>
  </details>;
}

export function DomainPredictionSimulator({ simulator, onComplete }: { simulator: DomainLessonSimulator; onComplete?: (attempt: { simulatorId: string; scenario: DomainLessonSimulator['scenario']; answeredPredictions: number }) => Promise<boolean> }) {
  const [session, setSession] = useState(createDomainSimulatorSession);
  const completionSent = useRef(false);
  const [completionStatus, setCompletionStatus] = useState('');
  const [inputs, setInputs] = useState<DomainScenarioInputs>(() => ({
    database: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.database },
    system: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.system },
    concurrency: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.concurrency },
    cloud: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.cloud },
  }));
  const frames = useMemo(() => buildDomainScenario(simulator.scenario, inputs), [simulator.scenario, inputs]);
  const frame = frames[session.step];
  const prediction = frame?.prediction;
  const resetSession = () => { completionSent.current = false; setCompletionStatus(''); setSession(createDomainSimulatorSession()); };
  const reset = () => { resetSession(); setInputs({ database: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.database }, system: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.system }, concurrency: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.concurrency }, cloud: { ...DEFAULT_DOMAIN_SCENARIO_INPUTS.cloud } }); };

  return <section className="space-y-3 rounded-xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900" data-domain-simulator={simulator.id} aria-labelledby={`domain-simulator-title-${simulator.id}`}>
    <header>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`domain-simulator-title-${simulator.id}`} className="text-sm font-semibold">{simulator.title}</h3>
        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{simulator.scenario.replaceAll('-', ' ')}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{simulator.description}</p>
      <p className="mt-1 text-[10px] text-slate-500">Objective links: {simulator.objectiveIds.join(' · ')}</p>
      <p className="mt-1 text-[10px] text-slate-500">Simulator completion is recorded separately; prediction correctness does not count toward quiz mastery.</p>
      <ScenarioControls scenario={simulator.scenario} inputs={inputs} onChange={(next) => { setInputs(next); resetSession(); }}/>
    </header>
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-2"><strong className="text-xs">{frame.title}</strong><span className="text-[10px] text-slate-500">Step {session.step + 1} / {frames.length}</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-label="Scenario progress" aria-valuemin={1} aria-valuemax={frames.length} aria-valuenow={session.step + 1}><div className="h-full rounded-full bg-indigo-600" style={{ width: `${((session.step + 1) / frames.length) * 100}%` }}/></div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{frame.detail}</p>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{frame.metrics.map((metric) => <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900"><dt className="text-[10px] text-slate-500">{metric.label}</dt><dd className="mt-1 text-xs font-semibold">{metric.value}</dd></div>)}</dl>
    </div>
    {session.feedback && <div role="status" aria-live="polite" className={`rounded-lg p-3 text-xs ${session.feedback.correct ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'}`}>
      <strong>{session.feedback.correct ? 'Correct prediction' : 'Review the domain outcome'}</strong>
      <p className="mt-1">Your prediction: {session.feedback.answer}</p><p className="mt-1">Expected: {session.feedback.expected}</p>
      <p className="mt-1">{session.feedback.rationale}</p>
    </div>}
    {prediction ? <fieldset className="space-y-2 rounded-lg border border-indigo-200 p-3 dark:border-indigo-900">
      <legend className="px-1 text-xs font-semibold">Predict the domain-specific outcome</legend>
      <p className="text-xs text-slate-600 dark:text-slate-300">{prediction.prompt}</p>
      {prediction.options.map((option, index) => <label key={option} className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
        <input type="radio" name={`domain-prediction-${simulator.id}-${session.step}`} checked={session.choice === option} onChange={() => setSession((current) => chooseDomainPrediction(current, option))} className="mt-0.5 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"/>
        <span>{String.fromCharCode(65 + index)}. {option}</span>
      </label>)}
    </fieldset> : <div role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><strong>Scenario complete.</strong> You answered {session.answeredPredictions} prediction checkpoints and got {session.correctPredictions} correct. This is separate simulator-completion evidence, not quiz mastery. {completionStatus}</div>}
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" disabled={session.step === 0} onClick={() => setSession(previousDomainStep)}>Previous</button>
      {prediction && <button type="button" className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" disabled={!session.choice} onClick={async () => { const next = revealDomainPrediction(session, prediction, frames.length - 1); setSession(next); if (next.step === frames.length - 1 && !completionSent.current) { completionSent.current = true; if (onComplete) { const saved = await onComplete({ simulatorId: simulator.id, scenario: simulator.scenario, answeredPredictions: next.answeredPredictions }); setCompletionStatus(saved ? 'Completion saved to your account progress.' : 'Completion could not be saved. You can retry by resetting the scenario.'); } } }}>Check prediction & reveal</button>}
      <button type="button" className="rounded-lg border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onClick={reset}>Reset scenario</button>
    </div>
    <p className="text-[10px] text-slate-500">Deterministic teaching model. It does not execute SQL, schedule real threads, provision cloud resources or replace production measurements. Reduced-motion mode is respected because the scenario uses no forced animation.</p>
  </section>;
}
