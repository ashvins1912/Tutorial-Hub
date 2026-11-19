import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Code2,
  Copy,
  Cpu,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Wrench,
  XCircle,
} from 'lucide-react';
import type { CurriculumTopic } from '../types';
import { CURRICULUM_TOPICS } from '../data/curriculumIndex';
import { getDeepTopicBlueprint } from '../data/deepTopicBlueprints';
import { algorithmGraphService } from '../../../core/engine/AlgorithmGraphService';
import type { SupportedSolutionLanguage } from '../../../core/schema/deepTopic.types';
import { ConstraintDecoderWidget } from './ConstraintDecoderWidget';
import { BlankPageProtocolWidget } from './BlankPageProtocolWidget';
import { ProblemMutationGraph } from './ProblemMutationGraph';
import { MutationLadderVisualizer } from './MutationLadderVisualizer';
import { TopicExpertisePlaybook } from './TopicExpertisePlaybook';
import { CurriculumDfdVisualizer } from './CurriculumDfdVisualizer';

type ProgressiveTabId = 'intuition' | 'dryrun' | 'recall' | 'solutions';

const PROGRESSIVE_TABS: {
  id: ProgressiveTabId;
  step: string;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'intuition', step: '01', label: 'Intuition & Visual Map', shortLabel: 'Intuition' },
  { id: 'dryrun', step: '02', label: 'Dry-Run & State Lab', shortLabel: 'Dry-Run' },
  { id: 'recall', step: '03', label: 'Build the Logic', shortLabel: 'Build Logic' },
  { id: 'solutions', step: '04', label: 'Code, Traps & Ladder', shortLabel: 'Code & Ladder' },
];

interface TheoryMentalModelPaneProps {
  topic: CurriculumTopic;
  isMastered: boolean;
  onToggleMastered: () => void;
  onOpenDeepLink: () => void;
  onOpenProblemTrainer: (slug: string) => void;
  onSelectTopic?: (topicId: string) => void;
  onFocusPlaygroundTab?: (tab: 'visualizer' | 'dfd' | 'recursion-lab' | 'logic-builder' | 'code') => void;
  selectedDfdNodeId?: string | null;
  onSelectDfdNode?: (nodeId: string) => void;
}

export function TheoryMentalModelPane({
  topic,
  isMastered,
  onToggleMastered,
  onOpenDeepLink,
  onOpenProblemTrainer,
  onSelectTopic,
  onFocusPlaygroundTab,
  selectedDfdNodeId = null,
  onSelectDfdNode,
}: TheoryMentalModelPaneProps) {
  const [activeTab, setActiveTab] = useState<ProgressiveTabId>('intuition');
  const [selectedRecallProblemId, setSelectedRecallProblemId] = useState<string | null>(null);

  // Tab 2 Dry-Run interactive stepper state
  const [dryRunStep, setDryRunStep] = useState(0);
  const [dryRunPlaying, setDryRunPlaying] = useState(false);

  // Tab 4 Multi-Language Solution viewer state
  const [solutionLang, setSolutionLang] = useState<SupportedSolutionLanguage>('typescript');
  const [solutionTier, setSolutionTier] = useState<'brute' | 'optimal' | 'compare'>('compare');
  const [solutionProblemIdx, setSolutionProblemIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const blueprint = useMemo(() => getDeepTopicBlueprint(topic), [topic]);
  const deepTopic = useMemo(() => algorithmGraphService.getDeepTopic(topic.id), [topic.id]);
  const linkage = useMemo(() => algorithmGraphService.getTopicLinkage(topic.id), [topic.id]);

  // Reset stage state whenever user switches curriculum topic
  useEffect(() => {
    setActiveTab('intuition');
    setSelectedRecallProblemId(null);
    setDryRunStep(0);
    setDryRunPlaying(false);
    setSolutionProblemIdx(0);
    setCopiedKey(null);
  }, [topic.id]);

  // Auto-advance Dry-Run walkthrough when playing
  const totalDrySteps = deepTopic?.visualBlueprint.stepByStepFlow.length ?? 1;
  useEffect(() => {
    if (!dryRunPlaying) return;
    const timer = window.setInterval(() => {
      setDryRunStep((prev) => {
        if (prev >= totalDrySteps - 1) {
          setDryRunPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => window.clearInterval(timer);
  }, [dryRunPlaying, totalDrySteps]);

  const tiers = [topic.solutions.brute, topic.solutions.better, topic.solutions.optimal];
  const currentTabIndex = PROGRESSIVE_TABS.findIndex((t) => t.id === activeTab);
  const isRecursionModule =
    topic.id === 'recursion-divide-conquer' || topic.id === 'backtracking';

  const activeSolutionProblem =
    deepTopic?.problemMutationLadder[solutionProblemIdx] ??
    deepTopic?.problemMutationLadder[0];

  const handleCopyCode = (key: string, text: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 1600);
  };

  if (!deepTopic) return null;

  return (
    <div className="space-y-4">
      {/* Compact Topic Header Card */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="text-sky-700 dark:text-sky-400 font-semibold">{topic.tier}</span>
              <span aria-hidden="true">·</span>
              <span>{deepTopic.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                {deepTopic.difficultyLevel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Topic {String(topic.order).padStart(2, '0')} of {CURRICULUM_TOPICS.length}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {topic.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[65ch]">
              {topic.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleMastered}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                isMastered
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {isMastered ? (
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Circle className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isMastered ? 'Topic Mastered' : 'Mark Mastered'}
            </button>

            {topic.deepLink && (
              <button
                type="button"
                onClick={onOpenDeepLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 transition-colors whitespace-nowrap"
              >
                {topic.deepLink.label}
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* 4-Stage Progressive Disclosure Tab Bar */}
        <nav
          aria-label="Topic Mastery Stages"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800"
        >
          {PROGRESSIVE_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                    : 'border-transparent bg-slate-100/70 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="font-mono text-[10px] tabular-nums opacity-80">{tab.step}</span>
                <span className="truncate">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* =================================================================== */}
      {/* TAB 1: INTUITION & VISUAL MAP                                       */}
      {/* =================================================================== */}
      {activeTab === 'intuition' && (
        <div className="space-y-4">
          <ConstraintDecoderWidget topicId={topic.id} guide={blueprint.constraintGuide} />

          {/* 30-Second ELI5 Intuition + When / When NOT to Use */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>30-SECOND MENTAL MODEL</span>
              </div>
              <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                Real-World Analogy &amp; Golden Rule
              </h2>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-w-[65ch]">
                {deepTopic.intuition.realWorldAnalogy}
              </p>
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/30 p-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="font-mono font-bold text-sky-800 dark:text-sky-300">
                  CORE RULE:{' '}
                </span>
                {deepTopic.intuition.oneSentenceRule}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* When to Use */}
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>When to Use This Pattern</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {deepTopic.intuition.whenToUse.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When NOT to Use */}
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                  <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>When NOT to Use (Anti-Patterns)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {deepTopic.intuition.whenNotToUse.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-rose-700 dark:text-rose-400 shrink-0">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Compact Visual Flow & Data Flow Blueprint */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-400">
              <Cpu className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>DATA FLOW &amp; INVARIANT BLUEPRINT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  INPUTS
                </div>
                {deepTopic.visualBlueprint.inputs.map((inp, i) => (
                  <div key={i} className="text-slate-800 dark:text-slate-200 font-medium">
                    {inp}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  STATE VARIABLES
                </div>
                {deepTopic.visualBlueprint.stateVariables.map((sv, i) => (
                  <div key={i} className="font-mono text-[11px] text-sky-800 dark:text-sky-300">
                    {sv}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  OUTPUTS
                </div>
                {deepTopic.visualBlueprint.outputs.map((out, i) => (
                  <div key={i} className="text-slate-800 dark:text-slate-200 font-medium">
                    {out}
                  </div>
                ))}
              </div>
            </div>

            {onSelectDfdNode && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <CurriculumDfdVisualizer
                  topic={topic}
                  selectedNodeId={selectedDfdNodeId}
                  onSelectNode={onSelectDfdNode}
                  variant="compact"
                  onOpenFullDfdTab={
                    onFocusPlaygroundTab ? () => onFocusPlaygroundTab('dfd') : undefined
                  }
                />
              </div>
            )}

            {/* Bidirectional Quick Jump Strip */}
            {(linkage.prerequisites.length > 0 || linkage.nextLevelUnlocks.length > 0) && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                {linkage.prerequisites.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      Prereq:
                    </span>
                    {linkage.prerequisites.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelectTopic?.(p.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}
                {linkage.nextLevelUnlocks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                      Unlocks →
                    </span>
                    {linkage.nextLevelUnlocks.slice(0, 2).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => onSelectTopic?.(n.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/30 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 transition-colors"
                      >
                        {n.title}
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Interactive Clickable Mutation Ladder Graph (Base Problem -> Twist 1 -> Twist 2) */}
          <MutationLadderVisualizer
            topicId={topic.id}
            deepTopic={deepTopic}
            onPracticeProblem={(probId) => {
              setSelectedRecallProblemId(probId);
              setActiveTab('recall');
            }}
            onOpenProblemTrainer={onOpenProblemTrainer}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: DRY-RUN & STATE LAB                                          */}
      {/* =================================================================== */}
      {activeTab === 'dryrun' && (
        <div className="space-y-4">
          {/* Interactive Step-by-Step State Walkthrough */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                  <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>INTERACTIVE STATE &amp; INVARIANT WALKTHROUGH</span>
                </div>
                <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                  Trace Every Step Before Writing Line 1
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                Step {dryRunStep + 1} / {totalDrySteps}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDryRunPlaying(false);
                    setDryRunStep((s) => Math.max(0, s - 1));
                  }}
                  disabled={dryRunStep === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:border-sky-500 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (dryRunStep >= totalDrySteps - 1) setDryRunStep(0);
                    setDryRunPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
                >
                  {dryRunPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      Play Trace
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDryRunPlaying(false);
                    setDryRunStep((s) => Math.min(totalDrySteps - 1, s + 1));
                  }}
                  disabled={dryRunStep >= totalDrySteps - 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:border-sky-500 transition-colors"
                >
                  Next
                  <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDryRunPlaying(false);
                    setDryRunStep(0);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors"
                  aria-label="Reset walkthrough"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {onFocusPlaygroundTab && (
                <button
                  type="button"
                  onClick={() =>
                    onFocusPlaygroundTab(isRecursionModule ? 'recursion-lab' : 'visualizer')
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 transition-colors"
                >
                  Open Interactive Canvas
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Step List */}
            <ol className="space-y-2">
              {deepTopic.visualBlueprint.stepByStepFlow.map((stepText, idx) => {
                const isCurrent = idx === dryRunStep;
                const isVisited = idx < dryRunStep;
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        setDryRunPlaying(false);
                        setDryRunStep(idx);
                      }}
                      className={`w-full text-left flex items-start gap-3 rounded-lg border p-3 text-xs leading-relaxed transition-colors ${
                        isCurrent
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100 font-medium'
                          : isVisited
                            ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/15 text-slate-700 dark:text-slate-300'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-mono font-bold tabular-nums shrink-0 mt-0.5 text-sky-700 dark:text-sky-400">
                        {isVisited ? '✓' : isCurrent ? '→' : `${idx + 1}.`}
                      </span>
                      <span>{stepText}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Live Variable Watch Panel */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                <span>LIVE VARIABLE WATCH · SAMPLE INPUT: {blueprint.blankPageDrill.tinyInput}</span>
                <span className="text-sky-400">INVARIANT ACTIVE</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {deepTopic.visualBlueprint.stateVariables.map((v, i) => (
                  <code
                    key={i}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300"
                  >
                    {v}
                  </code>
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="font-mono text-sky-400 font-semibold">Invariant Check: </span>
                {deepTopic.visualBlueprint.invariantCondition}
              </p>
            </div>
          </section>

          {/* Pattern Identification Clues */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div>
              <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                Pattern Identification Signals
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structural clues in unseen problem statements that confirm this invariant.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topic.patternClues.map((clue, idx) => (
                <div key={idx} className="py-3 first:pt-1 last:pb-0 space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {clue.signal}
                  </div>
                  <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                    Constraint Signal: {clue.constraintHint}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-[65ch]">
                    {clue.whyItMatches}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: "BUILD THE LOGIC" (ACTIVE RECALL)                            */}
      {/* =================================================================== */}
      {activeTab === 'recall' && (
        <div className="space-y-4">
          <BlankPageProtocolWidget
            topicId={topic.id}
            drill={blueprint.blankPageDrill}
            coreInvariant={blueprint.coreInvariant}
            constraintSummary={`${blueprint.constraintGuide.inputBound} → Target ${blueprint.constraintGuide.expectedComplexity}`}
          />

          <ProblemMutationGraph
            topicId={topic.id}
            deepTopic={deepTopic}
            linkage={linkage}
            mode="active-recall"
            selectedProblemId={selectedRecallProblemId}
            onSelectTopic={onSelectTopic}
            onOpenProblemTrainer={onOpenProblemTrainer}
            onJumpToSolutions={() => setActiveTab('solutions')}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: MULTI-LANGUAGE SOLUTIONS, BUG TRAPS & MUTATION LADDER        */}
      {/* =================================================================== */}
      {activeTab === 'solutions' && (
        <div className="space-y-4">
          {/* Brute -> Better -> Optimal Trade-off Table */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                  Brute Force → Better → Optimal Progression
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exact time &amp; space bottlenecks eliminated at each refinement tier.
                </p>
              </div>
              {onFocusPlaygroundTab && (
                <button
                  type="button"
                  onClick={() => onFocusPlaygroundTab('code')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
                >
                  Open Full 3-Tier Code
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Tier</th>
                    <th className="py-2 pr-3 font-semibold">Approach</th>
                    <th className="py-2 pr-3 font-semibold">Time</th>
                    <th className="py-2 font-semibold">Space</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {tiers.map((t) => (
                    <tr key={t.tier} className="align-top">
                      <td className="py-2.5 pr-3 font-mono font-semibold whitespace-nowrap">
                        <span
                          className={
                            t.tier === 'brute'
                              ? 'text-rose-700 dark:text-rose-400'
                              : t.tier === 'better'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                          }
                        >
                          {t.tier === 'brute' ? 'Brute' : t.tier === 'better' ? 'Better' : 'Optimal'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200 font-medium">
                        {t.title}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {t.timeComplexity}
                      </td>
                      <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {t.spaceComplexity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Multi-Language Side-by-Side Brute vs Optimal Viewer */}
          {activeSolutionProblem && (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                    <Code2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>MULTI-LANGUAGE BRUTE → OPTIMAL SOLUTIONS</span>
                  </div>
                  <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                    {activeSolutionProblem.title}
                  </h2>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {(['typescript', 'python', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSolutionLang(lang)}
                      className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors ${
                        solutionLang === lang
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {lang === 'typescript' ? 'TS' : lang === 'python' ? 'Python' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem & View Mode Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {deepTopic.problemMutationLadder.map((prob, idx) => (
                    <button
                      key={prob.problemId}
                      type="button"
                      onClick={() => setSolutionProblemIdx(idx)}
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                        idx === solutionProblemIdx
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {idx === 0 ? 'Base' : `M${idx}`}: {prob.title}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {(
                    [
                      { id: 'compare', label: 'Side-by-Side' },
                      { id: 'brute', label: 'Brute' },
                      { id: 'optimal', label: 'Optimal' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSolutionTier(mode.id)}
                      className={`px-2 py-1 rounded border transition-colors ${
                        solutionTier === mode.id
                          ? 'border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-600 text-white font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Panels */}
              <div
                className={`grid gap-3 ${
                  solutionTier === 'compare' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {(solutionTier === 'compare' || solutionTier === 'brute') && (
                  <div className="rounded-lg border border-rose-200 dark:border-rose-900/70 bg-slate-950 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-rose-950/50 border-b border-rose-900/60 text-[11px] font-mono">
                      <span className="font-semibold text-rose-300">
                        Brute Force · {activeSolutionProblem.solutions.bruteForce.complexity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCode(
                            'brute',
                            activeSolutionProblem.solutions.bruteForce.code[solutionLang],
                          )
                        }
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                      >
                        {copiedKey === 'brute' ? (
                          <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy className="w-3 h-3" aria-hidden="true" />
                        )}
                        {copiedKey === 'brute' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 overflow-x-auto text-[11px] leading-5 font-mono text-slate-200">
                      <code>{activeSolutionProblem.solutions.bruteForce.code[solutionLang]}</code>
                    </pre>
                  </div>
                )}

                {(solutionTier === 'compare' || solutionTier === 'optimal') && (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-slate-950 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-950/50 border-b border-emerald-900/60 text-[11px] font-mono">
                      <span className="font-semibold text-emerald-300">
                        Optimal · {activeSolutionProblem.solutions.optimal.complexity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCode(
                            'optimal',
                            activeSolutionProblem.solutions.optimal.code[solutionLang],
                          )
                        }
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                      >
                        {copiedKey === 'optimal' ? (
                          <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy className="w-3 h-3" aria-hidden="true" />
                        )}
                        {copiedKey === 'optimal' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 overflow-x-auto text-[11px] leading-5 font-mono text-slate-200">
                      <code>{activeSolutionProblem.solutions.optimal.code[solutionLang]}</code>
                    </pre>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Bug Prevention Lab */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
                <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>BUG PREVENTION LAB</span>
              </div>
              <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
                High-Frequency Interview Bugs &amp; Exact Fixes
              </h2>
            </div>

            <div className="space-y-3">
              {deepTopic.bugPreventionLab.map((entry, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <AlertTriangle
                      className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{entry.trapTitle}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="rounded-md border border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 space-y-1">
                      <div className="font-bold text-rose-800 dark:text-rose-300">
                        ✕ Broken Logic
                      </div>
                      <code className="block text-rose-950 dark:text-rose-200 break-words">
                        {entry.brokenLogic}
                      </code>
                    </div>
                    <div className="rounded-md border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 space-y-1">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">
                        ✓ Fixed Logic
                      </div>
                      <code className="block text-emerald-950 dark:text-emerald-200 break-words">
                        {entry.fixedLogic}
                      </code>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-[65ch]">
                    {entry.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bidirectional Algorithm Graph & Problem Mutation Tree */}
          <ProblemMutationGraph
            topicId={topic.id}
            deepTopic={deepTopic}
            linkage={linkage}
            mode="mutation-ladder"
            onSelectTopic={onSelectTopic}
            onOpenProblemTrainer={onOpenProblemTrainer}
            onPracticeProblem={(probId) => {
              setSelectedRecallProblemId(probId);
              setActiveTab('recall');
            }}
          />

          {/* Mastery Playbook Self-Audit */}
          <TopicExpertisePlaybook
            topic={topic}
            isMastered={isMastered}
            onToggleMastered={onToggleMastered}
          />
        </div>
      )}

      {/* Progressive Stage Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={currentTabIndex <= 0}
          onClick={() => {
            if (currentTabIndex > 0) setActiveTab(PROGRESSIVE_TABS[currentTabIndex - 1].id);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:border-sky-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {currentTabIndex > 0 ? PROGRESSIVE_TABS[currentTabIndex - 1].label : 'Start'}
        </button>

        {currentTabIndex < PROGRESSIVE_TABS.length - 1 ? (
          <button
            type="button"
            onClick={() => setActiveTab(PROGRESSIVE_TABS[currentTabIndex + 1].id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
          >
            Next: {PROGRESSIVE_TABS[currentTabIndex + 1].label}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleMastered}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {isMastered ? 'Mastered ✓' : 'Complete Topic Mastery'}
          </button>
        )}
      </div>
    </div>
  );
}
