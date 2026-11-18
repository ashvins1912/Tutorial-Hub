import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { BigTechProblem, CodeLanguage } from '../../types/dsa';
import { RubricResult, useSprintStore } from '../../store/useSprintStore';

interface HowToIdentifyTrainerProps {
  problem: BigTechProblem;
  onBack: () => void;
}

type PitchCardId = 'brute' | 'bottleneck' | 'optimal';

export function HowToIdentifyTrainer({ problem, onBack }: HowToIdentifyTrainerProps) {
  const submitRubricResult = useSprintStore((s) => s.submitRubricResult);
  const activeSprintTaskContext = useSprintStore((s) => s.activeSprintTaskContext);

  const [revealedTriggers, setRevealedTriggers] = useState<string[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [pitchOrder, setPitchOrder] = useState<PitchCardId[]>([]);
  const [lang, setLang] = useState<CodeLanguage>('python');
  const [copied, setCopied] = useState(false);

  const pitchCards = useMemo(
    () => [
      {
        id: 'bottleneck' as const,
        title: 'Redundant Work Bottleneck',
        detail: `${problem.interviewSolutionLadder.bruteForcePitch.bottleneck} (${problem.interviewSolutionLadder.bruteForcePitch.time})`,
      },
      {
        id: 'optimal' as const,
        title: `Optimal ${problem.primaryPattern}`,
        detail: `${problem.interviewSolutionLadder.optimalPitch.explanation} (${problem.interviewSolutionLadder.optimalPitch.time}, ${problem.interviewSolutionLadder.optimalPitch.space})`,
      },
      {
        id: 'brute' as const,
        title: 'Brute Force Baseline',
        detail: `${problem.interviewSolutionLadder.bruteForcePitch.explanation} (${problem.interviewSolutionLadder.bruteForcePitch.time})`,
      },
    ],
    [problem]
  );

  const toggleTrigger = (trigger: string) => {
    setRevealedTriggers((prev) =>
      prev.includes(trigger) ? prev : [...prev, trigger]
    );
  };

  const toggleQuestion = (q: string) => {
    setAskedQuestions((prev) => (prev.includes(q) ? prev : [...prev, q]));
  };

  const handleSelectPitchCard = (id: PitchCardId) => {
    if (pitchOrder.includes(id)) return;
    setPitchOrder((prev) => [...prev, id]);
  };

  const pitchComplete = pitchOrder.length === 3;
  const pitchIsOrderedCorrectly =
    pitchOrder[0] === 'brute' && pitchOrder[1] === 'bottleneck' && pitchOrder[2] === 'optimal';

  const criticalQuestionsAsked = problem.interviewSolutionLadder.clarifyingQuestions.filter(
    (cq) => cq.isCritical && askedQuestions.includes(cq.question)
  ).length;
  const totalCritical = problem.interviewSolutionLadder.clarifyingQuestions.filter(
    (cq) => cq.isCritical
  ).length;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(problem.solutions[lang]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard restriction
    }
  };

  const handleEvaluateRubric = async () => {
    const clarifyScore = totalCritical
      ? Math.min(100, Math.round((criticalQuestionsAsked / totalCritical) * 100))
      : 100;
    const identifyScore = Math.min(
      100,
      Math.round(
        (revealedTriggers.length / Math.max(1, problem.howToIdentify.keywordTriggers.length)) * 100
      )
    );
    const invariantScore = pitchIsOrderedCorrectly ? 96 : pitchComplete ? 78 : 65;
    const twistScore = 88;
    const overallScore = Math.round(
      clarifyScore * 0.25 + identifyScore * 0.25 + invariantScore * 0.3 + twistScore * 0.2
    );
    const verdict: RubricResult['verdict'] =
      overallScore >= 88 ? 'Strong Hire' : overallScore >= 72 ? 'Hire' : 'Lean Hire';

    await submitRubricResult({
      problemSlug: problem.slug,
      clarifyScore: Math.max(60, clarifyScore),
      identifyScore: Math.max(65, identifyScore),
      invariantScore,
      twistScore,
      overallScore,
      verdict,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Problem Summary */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back
          </button>

          {activeSprintTaskContext && (
            <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
              ACTIVE SPRINT · DAY {activeSprintTaskContext.dayNumber} · {activeSprintTaskContext.taskType.toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              #{problem.number}
            </span>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {problem.title}
            </h2>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-sky-700 dark:text-sky-400">{problem.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>{problem.topicCategory}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">{problem.promptSummary}</p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Constraints: {problem.constraintsText}
          </p>
        </div>

        {activeSprintTaskContext?.twistConstraint && (
          <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200">
            <strong>Active Sprint Constraint / Recall Twist: </strong>
            {activeSprintTaskContext.twistConstraint}
          </div>
        )}
      </div>

      {/* Step 1: Read & Decode Keyword Triggers + Eliminator Rule */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
              STEP 1 · READ & IDENTIFY DECODER
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Click Prompt Trigger Clues to Eliminate Wrong Patterns
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {revealedTriggers.length} / {problem.howToIdentify.keywordTriggers.length} triggers unlocked
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {problem.howToIdentify.keywordTriggers.map((trigger) => {
            const active = revealedTriggers.includes(trigger);
            return (
              <button
                key={trigger}
                type="button"
                onClick={() => toggleTrigger(trigger)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                }`}
              >
                {active ? '✓ ' : '+ '}&ldquo;{trigger}&rdquo;
              </button>
            );
          })}
        </div>

        {revealedTriggers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/40 dark:bg-rose-950/20 space-y-1">
              <div className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                Eliminator Rule (Why Competing Patterns Fail)
              </div>
              <p className="text-slate-700 dark:text-slate-300">{problem.howToIdentify.eliminatorRule}</p>
            </div>
            <div className="p-3.5 rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/20 space-y-1">
              <div className="font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                Candidate Mental Model Question
              </div>
              <p className="text-slate-700 dark:text-slate-300">{problem.howToIdentify.mentalModelQuestion}</p>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Clarifying Questions Simulator */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
              STEP 2 · INTERVIEWER EDGE-CASE CLARIFICATION
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Select Critical Questions Before Touching Code
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            Critical asked: {criticalQuestionsAsked}/{totalCritical}
          </span>
        </div>

        <div className="space-y-2.5">
          {problem.interviewSolutionLadder.clarifyingQuestions.map((cq) => {
            const asked = askedQuestions.includes(cq.question);
            return (
              <div
                key={cq.question}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                    {cq.question}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleQuestion(cq.question)}
                    disabled={asked}
                    className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 ${
                      asked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800'
                    }`}
                  >
                    {asked ? 'Asked' : 'Ask Interviewer'}
                  </button>
                </div>

                {asked && (
                  <div className="text-xs text-slate-700 dark:text-slate-300 pl-5 border-t border-slate-200 dark:border-slate-800 pt-2">
                    <strong className={cq.isCritical ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}>
                      [{cq.isCritical ? 'CRITICAL SIGNAL' : 'STANDARD CHECK'}]{' '}
                    </strong>
                    {cq.interviewerAnswer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: 30-Second Pitch Builder (Order Brute -> Bottleneck -> Optimal) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
              STEP 3 · 30-SECOND PITCH BUILDER
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Click Cards in Big Tech Verbal Pitch Order: Brute Baseline → Bottleneck → Optimal
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setPitchOrder([])}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset Order
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pitchCards.map((card) => {
            const rank = pitchOrder.indexOf(card.id);
            const selected = rank >= 0;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectPitchCard(card.id)}
                className={`text-left p-4 rounded-xl border transition-colors space-y-1.5 ${
                  selected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {card.title}
                  </span>
                  <span className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                    {selected ? `#${rank + 1}` : 'Select'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{card.detail}</p>
              </button>
            );
          })}
        </div>

        {pitchComplete && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-2 ${
              pitchIsOrderedCorrectly
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                : 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong>{pitchIsOrderedCorrectly ? 'PASS · Crisp Senior Pitch Sequence: ' : 'REORDER TIP: '}</strong>
              {pitchIsOrderedCorrectly
                ? `Core Invariant locked: ${problem.interviewSolutionLadder.optimalPitch.invariant}`
                : 'Always anchor on Brute Force first, pinpoint the exact redundant Bottleneck, then introduce the Optimal structure.'}
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Worked Multi-Language Optimal Reference */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">
              STEP 4 · INVARIANT-CLEAN OPTIMAL REFERENCE
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Time: <strong className="font-mono text-slate-900 dark:text-slate-100">{problem.interviewSolutionLadder.optimalPitch.time}</strong> · Space:{' '}
              <strong className="font-mono text-slate-900 dark:text-slate-100">{problem.interviewSolutionLadder.optimalPitch.space}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['python', 'js', 'java'] as CodeLanguage[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                  lang === l
                    ? 'border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {l === 'js' ? 'JavaScript' : l.toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
          {problem.solutions[lang]}
        </pre>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleEvaluateRubric}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
          >
            Score Big Tech Interview Rubric
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
