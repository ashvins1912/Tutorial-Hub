import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Gauge,
  GitBranch,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  EngineAnalysisResult,
  SupportedCodeLanguage,
} from '../../core/knowledge-base/types';
import type { UniversalCatalogMatchBundle } from '../../core/engine/catalogStrategyBridge';
import { getAlgorithmTutorGuide } from '../../data/algorithmTutorGuides';
import { getAlgorithmUpgradeSpec } from '../../data/algorithmUpgradeLadders';
import type { AlgorithmDetailTab } from '../../store/usePatternForgeStore';
import { apiFetch } from '../../lib/apiFetch';
import { OptimizationCheckerPanel } from './OptimizationCheckerPanel';

interface GuidedStep {
  index: number;
  code: string;
  title: string;
  headline: string;
  body: string;
  analogy: string;
  checkpointPrompt: string;
  bullets: string[];
}

interface TranscriptEntry {
  id: string;
  role: 'tutor' | 'student';
  stepLabel: string;
  text: string;
}

interface GeminiCoachPayload {
  explanation: string;
  analogy: string;
  optimizedAlgorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  keyInvariant: string;
  codeSnippet: string;
  checkpointQuestion: string;
}

export interface GuidedLogicBuilderPanelProps {
  problemTitle: string;
  problemStatement: string;
  sourceBadge?: string;
  sourceUrl?: string;
  examples?: string[];
  constraints?: string[];
  analysis: EngineAnalysisResult;
  catalogMatches: UniversalCatalogMatchBundle;
  codeLang: SupportedCodeLanguage;
  onChangeCodeLang: (lang: SupportedCodeLanguage) => void;
  onOpenAlgorithm?: (algoId: string, tab?: AlgorithmDetailTab) => void;
  onOpenCurriculumTopic?: (topicId: string) => void;
}

export const GuidedLogicBuilderPanel: React.FC<GuidedLogicBuilderPanelProps> = ({
  problemTitle,
  problemStatement,
  sourceBadge,
  sourceUrl,
  examples = [],
  constraints = [],
  analysis,
  catalogMatches,
  codeLang,
  onChangeCodeLang,
  onOpenAlgorithm,
  onOpenCurriculumTopic,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSimplerAnalogy, setShowSimplerAnalogy] = useState(false);
  const [showOptimalCode, setShowOptimalCode] = useState(false);
  const [showOptimizationChecker, setShowOptimizationChecker] = useState(true);
  const [studentInput, setStudentInput] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCoaching, setAiCoaching] = useState<GeminiCoachPayload | null>(null);

  const primaryAlgoMatch = catalogMatches.matchedAlgorithms[0] ?? null;
  const primaryAlgo = primaryAlgoMatch?.algorithm ?? null;
  const primaryTopic = catalogMatches.matchedTopics[0]?.topic ?? null;
  const primaryCombo = catalogMatches.matchedCombos[0] ?? null;
  const topStrategy = analysis.topStrategy;

  const tutorGuide = useMemo(
    () => (primaryAlgo ? getAlgorithmTutorGuide(primaryAlgo.id) : null),
    [primaryAlgo]
  );
  const upgradeSpec = useMemo(
    () => (primaryAlgo ? getAlgorithmUpgradeSpec(primaryAlgo) : null),
    [primaryAlgo]
  );

  const steps: GuidedStep[] = useMemo(() => {
    const constraintList =
      constraints.length > 0
        ? constraints.slice(0, 4)
        : analysis.deconstruction.constraints.length > 0
          ? analysis.deconstruction.constraints.map((c) => `${c.raw} → max budget ${c.ceiling}`)
          : [`Derived time ceiling: ${analysis.deconstruction.hardestCeiling}`];

    const signalPhrases = [
      ...analysis.deconstruction.triggerPhrases.slice(0, 4),
      ...(primaryAlgoMatch?.matchedTerms ?? []),
    ];
    const uniqueSignals = Array.from(new Set(signalPhrases)).slice(0, 6);

    const bruteTitle = upgradeSpec?.brute.label ?? topStrategy?.strategy.approaches[0]?.title ?? 'Exhaustive Enumeration';
    const bruteTime = upgradeSpec?.brute.time ?? topStrategy?.strategy.approaches[0]?.timeComplexity ?? 'O(N^2)';
    const bruteBottleneck =
      upgradeSpec?.brute.bottleneckOrWin ??
      topStrategy?.strategy.approaches[0]?.keyInsight ??
      'Recomputes overlapping states or scans every pair without pruning.';

    const optimalName = primaryAlgo?.name ?? topStrategy?.strategy.name ?? 'Structured Invariant Strategy';
    const optimalTime = primaryAlgo?.timeComplexity ?? topStrategy?.strategy.optimalTime ?? analysis.deconstruction.hardestCeiling;
    const optimalSpace = primaryAlgo?.spaceComplexity ?? topStrategy?.strategy.optimalSpace ?? 'O(N)';

    const invariantText =
      primaryAlgo?.loopInvariant ??
      primaryTopic?.solutions.optimal.intuition ??
      topStrategy?.strategy.mentalModel ??
      'Maintain a single monotonic or memoized state invariant at every iteration.';

    const edgeCases = [
      ...(primaryAlgo?.whenItFails ? [primaryAlgo.whenItFails] : []),
      ...(tutorGuide?.avoidWhen ? [`Avoid when: ${tutorGuide.avoidWhen}`] : []),
      ...(topStrategy?.pitfallWarnings.slice(0, 2) ?? []),
    ].slice(0, 4);

    return [
      {
        index: 0,
        code: '01',
        title: 'Deconstruct Signals & Constraints',
        headline: `Read the problem ceiling (${analysis.deconstruction.hardestCeiling}) before writing code.`,
        body: `First isolate what the input gives you, what the output demands, and which complexity classes are eliminated by the bounds. Detected domain: ${analysis.deconstruction.primaryDomain.replace(/_/g, ' ')}.`,
        analogy:
          'Think of constraints as a speed limit sign: if N <= 10^5, an O(N^2) nested loop would perform 10^10 operations (~100 seconds) and time out. That single check eliminates half the wrong ideas in 5 seconds.',
        checkpointPrompt: 'Do you see why the constraints force a tighter time ceiling?',
        bullets: [
          ...constraintList.map((c) => `Constraint: ${c}`),
          uniqueSignals.length > 0
            ? `Pattern trigger signals spotted: ${uniqueSignals.join(', ')}`
            : 'Focus on the exact relationship between consecutive elements or state transitions.',
        ],
      },
      {
        index: 1,
        code: '02',
        title: 'Brute-Force Baseline & Bottleneck',
        headline: `Start from ${bruteTitle} (${bruteTime}) and pinpoint the wasted work.`,
        body: `Never jump straight to tricks. First confirm the naive baseline produces the exact right answer, then name the exact repeated work that slows it down: ${bruteBottleneck}`,
        analogy:
          'Optimizing without naming the brute-force bottleneck is like tuning a car engine without knowing whether the parking brake is still on. Once you name the redundant scan or repeated subproblem, the right data structure becomes obvious.',
        checkpointPrompt: 'Clear on what exact redundant computation we need to eliminate?',
        bullets: [
          `Naive Baseline: ${bruteTitle} (${bruteTime})`,
          `Bottleneck to eliminate: ${bruteBottleneck}`,
          upgradeSpec
            ? `Intermediate upgrade step: ${upgradeSpec.better.label} (${upgradeSpec.better.time}) — ${upgradeSpec.better.approach}`
            : `Target complexity jump: ${bruteTime} → ${optimalTime}`,
        ],
      },
      {
        index: 2,
        code: '03',
        title: 'Optimal Algorithm & Power Combos',
        headline: `Select ${optimalName} (${optimalTime} time · ${optimalSpace} space).`,
        body: primaryAlgo
          ? `${primaryAlgo.tagline} ${primaryAlgo.coreIdea}`
          : topStrategy?.strategy.mentalModel ?? 'Choose the minimal data structure that maintains the needed query in O(1) or O(log N).',
        analogy:
          tutorGuide?.simpleAnalogy ??
          'Each algorithm is simply a memory-for-time trade or a monotonicity guarantee that lets us throw away impossible candidates in bulk.',
        checkpointPrompt: primaryCombo
          ? `Notice how combining algorithms (${primaryCombo.title}) can push optimization even further. Ready for the exact invariant?`
          : `Ready to lock down the exact loop invariant for ${optimalName}?`,
        bullets: [
          `Primary Match: ${optimalName} (${optimalTime} time, ${optimalSpace} space)`,
          ...(catalogMatches.matchedAlgorithms.slice(1, 3).map(
            (m) => `Alternative / Companion: ${m.algorithm.name} (${m.algorithm.timeComplexity}) — ${m.algorithm.tagline}`
          )),
          ...(primaryCombo
            ? [`Power Combination Option: ${primaryCombo.title} — ${primaryCombo.synergyOutput}`]
            : []),
        ],
      },
      {
        index: 3,
        code: '04',
        title: 'Loop Invariant & Edge-Case Shield',
        headline: 'Prove correctness before typing a single line of final code.',
        body: `Core Invariant: ${invariantText}`,
        analogy:
          tutorGuide?.interviewScript30s ??
          'Trace 3 small steps by hand (normal case, single-element case, duplicate/negative case). If the invariant stays true after each step, your code will not fail hidden judge tests.',
        checkpointPrompt: 'Ready to inspect the clean optimal implementation and test your understanding?',
        bullets:
          edgeCases.length > 0
            ? edgeCases.map((e) => `Guardrail: ${e}`)
            : [
                'Verify empty input, single element, and all-equal / already-sorted inputs.',
                'Check integer overflow, off-by-one inclusive vs. exclusive bounds, and visited marking order.',
              ],
      },
      {
        index: 4,
        code: '05',
        title: 'Produce Optimized Solution & Code',
        headline: `Production template for ${optimalName} (${optimalTime} · ${optimalSpace}).`,
        body: `You have verified the constraints, isolated the brute-force bottleneck, locked the optimal algorithm, and verified edge cases. Compare the optimal template below or invoke the Deep AI Coach for a tailored solution specific to this exact problem statement.`,
        analogy:
          'In interviews, narrating Steps 1–4 before writing Step 5 signals senior-level engineering clarity — interviewers often approve the solution before you even finish typing.',
        checkpointPrompt: 'Review the optimal implementation below or ask a follow-up question.',
        bullets: [
          `Complexity Achieved: ${optimalTime} Time · ${optimalSpace} Space`,
          primaryTopic
            ? `Linked Curriculum Track: #${String(primaryTopic.order).padStart(2, '0')} ${primaryTopic.title}`
            : 'Practice dry-running this template on the first example input.',
        ],
      },
    ];
  }, [
    analysis,
    constraints,
    primaryAlgo,
    primaryAlgoMatch,
    primaryCombo,
    primaryTopic,
    topStrategy,
    tutorGuide,
    upgradeSpec,
    catalogMatches.matchedAlgorithms,
  ]);

  // Reset coaching session cleanly whenever problem changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setCompletedSteps([]);
    setShowSimplerAnalogy(false);
    setShowOptimalCode(false);
    setAiCoaching(null);
    setAiError(null);
    setTranscript([
      {
        id: 'init',
        role: 'tutor',
        stepLabel: 'Step 01 · Start',
        text: `Loaded "${problemTitle}". Let's build the logic together step by step. Read Step 01 and click "OK, I Understand → Proceed" when ready, or ask a doubt anytime.`,
      },
    ]);
  }, [problemTitle, problemStatement]);

  const activeStep = steps[currentStepIdx] ?? steps[0];

  const handleUnderstandProceed = () => {
    setCompletedSteps((prev) => (prev.includes(currentStepIdx) ? prev : [...prev, currentStepIdx]));
    setShowSimplerAnalogy(false);

    const nextIdx = Math.min(steps.length - 1, currentStepIdx + 1);
    setTranscript((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        role: 'student',
        stepLabel: `Step ${activeStep.code}`,
        text: 'OK, I understand. Proceed to the next step.',
      },
      {
        id: `t-${Date.now() + 1}`,
        role: 'tutor',
        stepLabel: `Step ${steps[nextIdx].code}`,
        text:
          nextIdx === currentStepIdx
            ? 'All 5 logic-building steps completed! You can inspect the optimal code below or jump into the Algorithm Studio visualizer.'
            : `Great! Moving to Step ${steps[nextIdx].code}: ${steps[nextIdx].title} — ${steps[nextIdx].headline}`,
      },
    ]);

    if (nextIdx === steps.length - 1) {
      setShowOptimalCode(true);
    }
    setCurrentStepIdx(nextIdx);
  };

  const handleRequestSimpler = () => {
    setShowSimplerAnalogy(true);
    setTranscript((prev) => [
      ...prev,
      {
        id: `s-hint-${Date.now()}`,
        role: 'student',
        stepLabel: `Step ${activeStep.code}`,
        text: 'Can you explain this step simpler with an analogy?',
      },
      {
        id: `t-hint-${Date.now() + 1}`,
        role: 'tutor',
        stepLabel: `Analogy · Step ${activeStep.code}`,
        text: activeStep.analogy,
      },
    ]);
  };

  const handleJumpToOptimal = () => {
    setCompletedSteps([0, 1, 2, 3]);
    setCurrentStepIdx(4);
    setShowOptimalCode(true);
    setTranscript((prev) => [
      ...prev,
      {
        id: `s-opt-${Date.now()}`,
        role: 'student',
        stepLabel: 'Optimal Solution',
        text: 'Show me the optimized algorithm and production code.',
      },
      {
        id: `t-opt-${Date.now() + 1}`,
        role: 'tutor',
        stepLabel: 'Step 05 · Optimal',
        text: `Unlocked optimal solution: ${primaryAlgo?.name ?? topStrategy?.strategy.name ?? 'Optimal Strategy'} (${primaryAlgo?.timeComplexity ?? topStrategy?.strategy.optimalTime ?? 'Optimal'}).`,
      },
    ]);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = studentInput.trim();
    if (!raw) return;
    setStudentInput('');

    const lower = raw.toLowerCase();
    // Natural "ok / understood / yes / next / got it" confirmation advances automatically
    if (/^(ok|okay|yes|yep|got it|understood|understand|next|proceed|clear|makes sense)\b/.test(lower)) {
      handleUnderstandProceed();
      return;
    }

    let reply = '';
    if (lower.includes('brute') || lower.includes('slow') || lower.includes('tle') || lower.includes('why')) {
      reply = steps[1].body;
    } else if (lower.includes('edge') || lower.includes('trap') || lower.includes('bug') || lower.includes('fail')) {
      reply = `${steps[3].body} Watch out for: ${steps[3].bullets.join(' | ')}`;
    } else if (lower.includes('code') || lower.includes('optim') || lower.includes('solut')) {
      setShowOptimalCode(true);
      setCurrentStepIdx(4);
      reply = `Optimal approach is ${primaryAlgo?.name ?? topStrategy?.strategy.name} (${primaryAlgo?.timeComplexity ?? topStrategy?.strategy.optimalTime}). I've unlocked Step 05 with the clean template below.`;
    } else if (lower.includes('combo') || lower.includes('combine') || lower.includes('better')) {
      reply = primaryCombo
        ? `Power Combination: ${primaryCombo.title} — ${primaryCombo.synergyOutput} Flow: ${primaryCombo.architectureFlow}`
        : `You can combine ${primaryAlgo?.name ?? 'this core algorithm'} with preprocessing (sorting, prefix sums, or hash indexing) to keep per-step updates O(1) or O(log N).`;
    } else {
      reply = `${activeStep.analogy} Core invariant to remember: ${
        primaryAlgo?.loopInvariant ?? primaryTopic?.solutions.optimal.intuition ?? topStrategy?.strategy.mentalModel ?? activeStep.headline
      }`;
    }

    setTranscript((prev) => [
      ...prev,
      { id: `s-q-${Date.now()}`, role: 'student', stepLabel: `Step ${activeStep.code}`, text: raw },
      { id: `t-q-${Date.now() + 1}`, role: 'tutor', stepLabel: 'Logic Engine', text: reply },
    ]);
  };

  const handleAskDeepAiCoach = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await apiFetch('/api/solver/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle,
          problemStatement,
          stepLabel: `${activeStep.code}: ${activeStep.title}`,
          userFeedback: studentInput.trim() || 'Produce a clear step-by-step intuition, optimal algorithm, and clean code for this exact problem.',
          matchedAlgorithms: catalogMatches.matchedAlgorithms.map((m) => m.algorithm.name),
          language: codeLang,
        }),
      });
      const data = (await res.json()) as { coaching?: GeminiCoachPayload; error?: string };
      if (!res.ok || !data.coaching) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setAiCoaching(data.coaching);
      setShowOptimalCode(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Deep AI Coach unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const optimalCodeBlock = useMemo(() => {
    if (primaryAlgo) {
      const algoLang: 'python' | 'java' | 'js' = codeLang === 'typescript' ? 'js' : codeLang;
      return primaryAlgo.templates[algoLang];
    }
    return topStrategy?.strategy.approaches[2]?.code[codeLang] ?? '// Select or paste a problem to generate template code.';
  }, [primaryAlgo, topStrategy, codeLang]);

  return (
    <div className="space-y-4">
      {/* Header & Step Progress Stepper */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              Guided Logic Builder · Step {currentStepIdx + 1} of {steps.length}
              {sourceBadge ? ` · Source: ${sourceBadge}` : ''}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {problemTitle}
            </h3>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Open Original Problem Page</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOptimizationChecker((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                showOptimizationChecker
                  ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{showOptimizationChecker ? 'Hide Checker' : 'Optimization Checker'}</span>
            </button>
            <button
              type="button"
              onClick={handleJumpToOptimal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Produce Optimal Solution</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStepIdx(0);
                setCompletedSteps([]);
                setShowSimplerAnalogy(false);
                setShowOptimalCode(false);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 5-Step Progress Strip */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {steps.map((step) => {
            const isCurrent = step.index === currentStepIdx;
            const isDone = completedSteps.includes(step.index);
            return (
              <button
                key={step.code}
                type="button"
                onClick={() => setCurrentStepIdx(step.index)}
                className={`text-left px-2.5 py-2 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-slate-900 dark:text-white'
                    : isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                  <span>{step.code}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] font-semibold truncate mt-0.5">{step.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Interactive Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            STEP {activeStep.code} · {activeStep.title.toUpperCase()}
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {completedSteps.length}/{steps.length} understood
          </span>
        </div>

        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeStep.headline}</h4>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{activeStep.body}</p>

        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          {activeStep.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold mt-0.5">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {examples.length > 0 && currentStepIdx === 0 && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1">
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Imported Sample Example
            </div>
            <pre className="text-[11px] font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {examples[0]}
            </pre>
          </div>
        )}

        {showSimplerAnalogy && (
          <div className="rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Simple Real-World Analogy</span>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
              {activeStep.analogy}
            </p>
          </div>
        )}

        {/* Checkpoint Feedback Controls (OK / Understand -> Proceed) */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {activeStep.checkpointPrompt}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUnderstandProceed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {currentStepIdx < steps.length - 1
                  ? 'OK, I Understand → Proceed'
                  : 'Mark Logic Complete'}
              </span>
              {currentStepIdx < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleRequestSimpler}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-amber-500 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Explain Simpler (Analogy)</span>
            </button>

            <button
              type="button"
              onClick={handleAskDeepAiCoach}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Generating Deep AI Guide...' : 'Deep AI Optimal Solution'}</span>
            </button>
          </div>

          {/* Student Feedback / Doubt Input */}
          <form onSubmit={handleSubmitFeedback} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              placeholder='Type "ok" to proceed, or ask a doubt (e.g. "why not brute force?", "what edge case breaks this?")'
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* AI Error Notice (transparent, never fabricated) */}
        {aiError && (
          <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
            {aiError}
          </div>
        )}
      </div>

      {/* Inline Algorithmic Optimization Checker */}
      {showOptimizationChecker && (
        <OptimizationCheckerPanel
          compact
          problemTitle={problemTitle}
          analysis={analysis}
          catalogMatches={catalogMatches}
          onOpenAlgorithm={onOpenAlgorithm}
          onJumpToOptimalCode={handleJumpToOptimal}
        />
      )}

      {/* Matched Algorithms (from all 94) + Curriculum Topics (from all 22) + Power Combos */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <GitBranch className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Matched Algorithms (94-Algo Studio) &amp; Curriculum Tracks (22 Topics)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {catalogMatches.matchedAlgorithms.length} algorithms · {catalogMatches.matchedTopics.length} topics · {catalogMatches.matchedCombos.length} combos
          </span>
        </div>

        {catalogMatches.matchedAlgorithms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {catalogMatches.matchedAlgorithms.slice(0, 4).map((match) => (
              <div
                key={match.algorithm.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 flex flex-col justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>
                      {match.masterNumber ? `Master #${String(match.masterNumber).padStart(2, '0')} · ` : ''}
                      {match.algorithm.category}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      {match.algorithm.timeComplexity}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {match.algorithm.name}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {match.algorithm.tagline}
                  </p>
                </div>

                {onOpenAlgorithm && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => onOpenAlgorithm(match.algorithm.id, 'mental')}
                      className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      <span>Visualize</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <button
                      type="button"
                      onClick={() => onOpenAlgorithm(match.algorithm.id, 'upgrade-trace')}
                      className="text-indigo-700 dark:text-indigo-400 hover:underline"
                    >
                      DFD &amp; Combos
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <button
                      type="button"
                      onClick={() => onOpenAlgorithm(match.algorithm.id, 'practice')}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Practice Lab
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Applicable Algorithm Power Combinations */}
        {catalogMatches.matchedCombos.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Synergistic Algorithm Combinations (Produce Stronger Output)
            </div>
            {catalogMatches.matchedCombos.map((combo) => (
              <div
                key={combo.id}
                className="rounded-lg border border-indigo-200/80 dark:border-indigo-900/70 bg-indigo-50/40 dark:bg-indigo-950/20 px-3 py-2 text-xs space-y-0.5"
              >
                <div className="font-semibold text-slate-900 dark:text-white">
                  {combo.title} · <span className="font-mono text-indigo-700 dark:text-indigo-400">{combo.interviewUseCase}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {combo.synergyOutput} ({combo.architectureFlow})
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Linked Curriculum Tracks */}
        {catalogMatches.matchedTopics.length > 0 && onOpenCurriculumTopic && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Curriculum Tracks:
            </span>
            {catalogMatches.matchedTopics.map((mt) => (
              <button
                key={mt.topic.id}
                type="button"
                onClick={() => onOpenCurriculumTopic(mt.topic.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500"
              >
                <span>
                  #{String(mt.topic.order).padStart(2, '0')} {mt.topic.shortTitle}
                </span>
                <ArrowUpRight className="w-3 h-3 text-sky-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Optimal Solution Code Output (Deterministic + Optional Gemini Deep Output) */}
      {(showOptimalCode || currentStepIdx === 4 || aiCoaching) && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {aiCoaching
                    ? `Deep AI Optimized Solution · ${aiCoaching.optimizedAlgorithm}`
                    : `Optimized Template · ${primaryAlgo?.name ?? topStrategy?.strategy.name ?? 'Best Match'}`}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {aiCoaching
                    ? `${aiCoaching.timeComplexity} · ${aiCoaching.spaceComplexity}`
                    : `${primaryAlgo?.timeComplexity ?? topStrategy?.strategy.optimalTime ?? ''} · ${primaryAlgo?.spaceComplexity ?? topStrategy?.strategy.optimalSpace ?? ''}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              {(['python', 'typescript', 'java'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onChangeCodeLang(lang)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                    codeLang === lang
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : 'Java'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3">
            {aiCoaching && (
              <div className="rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 p-3 space-y-1.5 text-xs">
                <div className="font-semibold text-sky-900 dark:text-sky-200">
                  Invariant: {aiCoaching.keyInvariant}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {aiCoaching.explanation}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Analogy: {aiCoaching.analogy}
                </p>
              </div>
            )}

            <pre className="rounded-lg bg-slate-950 text-slate-100 p-4 text-xs font-mono leading-relaxed overflow-x-auto border border-slate-800">
              {aiCoaching ? aiCoaching.codeSnippet : optimalCodeBlock}
            </pre>
          </div>
        </div>
      )}

      {/* Interactive Feedback Log */}
      {transcript.length > 1 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Guided Coaching Session Log</span>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {transcript.slice(-6).map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg px-3 py-2 text-xs ${
                  msg.role === 'student'
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ml-6'
                    : 'bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 mr-6 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                  {msg.role === 'student' ? 'You' : 'Tutor'} · {msg.stepLabel}
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
