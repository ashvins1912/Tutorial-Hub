import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  GitBranch,
  HelpCircle,
  Link2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type {
  DeepTopicContent,
  LinkedCodingProblem,
  TopicGraphLinkage,
} from '../../../core/schema/deepTopic.types';
import { useAccountState } from '../../../hooks/useAccountState';

const STORAGE_KEY = 'patternforge_solved_mutations_v1';

function normalizeCode(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/['"`]/g, '')
    .replace(/;+$/g, '');
}

function validateBlank(
  value: string,
  expected: string,
  acceptedKeywords: string[],
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const normInput = normalizeCode(trimmed);
  const normExpected = normalizeCode(expected);
  if (normInput === normExpected) return true;
  if (acceptedKeywords.length > 0) {
    const lower = trimmed.toLowerCase();
    return acceptedKeywords.every((kw) => lower.includes(kw.toLowerCase()));
  }
  return false;
}

/** Deterministic shuffle so chips stay stable per problem while mixing distractors */
function buildChipBank(problem: LinkedCodingProblem): string[] {
  const all = Array.from(
    new Set([
      ...problem.activeRecallChallenge.correctMissingLines,
      ...problem.activeRecallChallenge.distractorLines,
    ]),
  );
  // Deterministic lightweight permutation based on problemId + string length
  const seed = problem.problemId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return all
    .map((line, i) => ({
      line,
      rank: ((seed + i * 31 + line.length * 17) % 97) / 97,
    }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.line);
}

const DIFF_TEXT: Record<LinkedCodingProblem['difficulty'], string> = {
  Easy: 'text-emerald-700 dark:text-emerald-400',
  Medium: 'text-amber-700 dark:text-amber-400',
  Hard: 'text-rose-700 dark:text-rose-400',
  System: 'text-indigo-700 dark:text-indigo-400',
};

interface ProblemMutationGraphProps {
  topicId: string;
  deepTopic: DeepTopicContent;
  linkage: TopicGraphLinkage;
  mode: 'active-recall' | 'mutation-ladder';
  selectedProblemId?: string | null;
  onSelectTopic?: (topicId: string) => void;
  onOpenProblemTrainer: (slug: string) => void;
  onPracticeProblem?: (problemId: string) => void;
  onJumpToSolutions?: () => void;
  onSolvedMutation?: () => void;
}

export function ProblemMutationGraph({
  topicId,
  deepTopic,
  linkage,
  mode,
  selectedProblemId,
  onSelectTopic,
  onOpenProblemTrainer,
  onPracticeProblem,
  onJumpToSolutions,
  onSolvedMutation,
}: ProblemMutationGraphProps) {
  const problems = deepTopic.problemMutationLadder;
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [solvedIds, setSolvedIds] = useAccountState<string[]>(
    'mutation-graph-solved',
    [],
    STORAGE_KEY
  );
  const [blankInputs, setBlankInputs] = useState<string[]>([]);
  const [focusedBlankIdx, setFocusedBlankIdx] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [checkResult, setCheckResult] = useState<{
    checked: boolean;
    perBlank: boolean[];
    allCorrect: boolean;
  } | null>(null);

  useEffect(() => {
    if (selectedProblemId) {
      const idx = problems.findIndex((p) => p.problemId === selectedProblemId);
      setActiveProblemIdx(idx >= 0 ? idx : 0);
    } else {
      setActiveProblemIdx(0);
    }
  }, [topicId, selectedProblemId, problems]);

  const activeProblem = problems[activeProblemIdx] ?? problems[0];

  useEffect(() => {
    if (!activeProblem) return;
    const count = activeProblem.activeRecallChallenge.correctMissingLines.length;
    setBlankInputs(Array(count).fill(''));
    setFocusedBlankIdx(0);
    setRevealedHints({});
    setCheckResult(null);
  }, [activeProblem?.problemId]);

  const chipBank = useMemo(
    () => (activeProblem ? buildChipBank(activeProblem) : []),
    [activeProblem],
  );

  if (!activeProblem) return null;

  const challenge = activeProblem.activeRecallChallenge;
  const solvedCountInTopic = problems.filter((p) => solvedIds.includes(p.problemId)).length;

  const handleChipClick = (chip: string) => {
    setBlankInputs((prev) => {
      const next = [...prev];
      const targetIdx =
        focusedBlankIdx >= 0 && focusedBlankIdx < next.length
          ? focusedBlankIdx
          : Math.max(
              0,
              next.findIndex((v) => !v.trim()),
            );
      next[targetIdx] = chip;
      return next;
    });
    setFocusedBlankIdx((prev) =>
      prev + 1 < challenge.correctMissingLines.length ? prev + 1 : prev,
    );
    setCheckResult(null);
  };

  const handleVerify = () => {
    const perBlank = challenge.correctMissingLines.map((expected, idx) =>
      validateBlank(
        blankInputs[idx] ?? '',
        expected,
        challenge.acceptedKeywordsPerBlank[idx] ?? [],
      ),
    );
    const allCorrect = perBlank.every(Boolean);
    setCheckResult({ checked: true, perBlank, allCorrect });
    if (allCorrect) {
      setSolvedIds((prev) =>
        prev.includes(activeProblem.problemId) ? prev : [...prev, activeProblem.problemId]
      );
      onSolvedMutation?.();
    }
  };

  const handleRevealSolution = () => {
    setBlankInputs([...challenge.correctMissingLines]);
    setCheckResult({
      checked: true,
      perBlank: challenge.correctMissingLines.map(() => true),
      allCorrect: true,
    });
  };

  const handleReset = () => {
    setBlankInputs(Array(challenge.correctMissingLines.length).fill(''));
    setFocusedBlankIdx(0);
    setCheckResult(null);
  };

  // =========================================================================
  // MODE 1: ACTIVE RECALL — FADED CODE / INVARIANT BUILDER (TAB 3)
  // =========================================================================
  if (mode === 'active-recall') {
    const templateLines = challenge.codeTemplateWithBlanks.split('\n');

    return (
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-400">
              <Code2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>ACTIVE RECALL · FADED INVARIANT BUILDER</span>
            </div>
            <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
              Reconstruct the Missing Core Lines Before Reading Full Code
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[65ch] leading-relaxed">
              Type directly into each blank slot or click a logic chip below (watch out for subtle off-by-one and invariant distractors).
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {solvedCountInTopic}/{problems.length} Mutations Solved
          </span>
        </div>

        {/* Problem Mutation Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {problems.map((prob, idx) => {
            const active = idx === activeProblemIdx;
            const solved = solvedIds.includes(prob.problemId);
            return (
              <button
                key={prob.problemId}
                type="button"
                onClick={() => setActiveProblemIdx(idx)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {solved && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {idx === 0 ? 'BASE' : `M${idx}`}
                </span>
                <span>{prob.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Problem Context Strip */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className={`font-semibold ${DIFF_TEXT[activeProblem.difficulty]}`}>
              {activeProblem.difficulty}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400">
              {activeProblem.solutions.optimal.complexity}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              {activeProblem.companyTags.join(', ')}
            </span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-medium">
            {challenge.prompt}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mutation Delta: </span>
            {activeProblem.mutationFromPrevious}
          </p>
        </div>

        {/* Interactive Faded Code Surface */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 p-4 overflow-x-auto space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>
              {challenge.language.toUpperCase()} · Fill {challenge.correctMissingLines.length} invariant lines
            </span>
            <span>Active Slot: BLANK_{focusedBlankIdx + 1}</span>
          </div>
          {templateLines.map((line, lineIdx) => {
            const blankMatch = line.match(/___BLANK_(\d+)___/);
            if (!blankMatch) {
              return (
                <div key={lineIdx} className="flex items-start gap-3 leading-6 whitespace-pre">
                  <span className="w-5 text-right text-slate-600 select-none tabular-nums shrink-0">
                    {lineIdx + 1}
                  </span>
                  <span className="text-slate-200">{line}</span>
                </div>
              );
            }

            const blankNum = Number(blankMatch[1]) - 1;
            const [before, after] = line.split(blankMatch[0]);
            const isFocused = focusedBlankIdx === blankNum;
            const status = checkResult?.checked
              ? checkResult.perBlank[blankNum]
                ? 'correct'
                : 'wrong'
              : 'idle';

            return (
              <div key={lineIdx} className="flex items-center gap-3 leading-6 py-0.5">
                <span className="w-5 text-right text-sky-400 font-bold select-none tabular-nums shrink-0">
                  {lineIdx + 1}
                </span>
                <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
                  {before && <span className="whitespace-pre text-slate-200">{before}</span>}
                  <input
                    type="text"
                    value={blankInputs[blankNum] ?? ''}
                    onFocus={() => setFocusedBlankIdx(blankNum)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBlankInputs((prev) => {
                        const next = [...prev];
                        next[blankNum] = val;
                        return next;
                      });
                      setCheckResult(null);
                    }}
                    placeholder={`Type or click chip for BLANK_${blankNum + 1}`}
                    aria-label={`Blank ${blankNum + 1}`}
                    className={`flex-1 min-w-[220px] rounded-md border px-2.5 py-1 font-mono text-xs bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none ${
                      status === 'correct'
                        ? 'border-emerald-500 ring-1 ring-emerald-500/40'
                        : status === 'wrong'
                          ? 'border-rose-500 ring-1 ring-rose-500/40'
                          : isFocused
                            ? 'border-sky-400 ring-1 ring-sky-400/40'
                            : 'border-slate-700'
                    }`}
                  />
                  {after && <span className="whitespace-pre text-slate-200">{after}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Click-to-Snap Logic Chip Bank */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>LOGIC CHIP BANK (CLICK TO INSERT INTO BLANK_{focusedBlankIdx + 1})</span>
            <span>Includes bug distractors</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chipBank.map((chip, idx) => {
              const alreadyPlaced = blankInputs.some((v) => v.trim() === chip.trim());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className={`px-2.5 py-1.5 rounded-lg border font-mono text-[11px] text-left transition-colors ${
                    alreadyPlaced
                      ? 'border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Per-Blank Hints */}
        <div className="flex flex-wrap items-center gap-2">
          {challenge.hintsPerBlank.map((hint, idx) => (
            <div key={idx} className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }))
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                {revealedHints[idx] ? `Hide Hint #${idx + 1}` : `Hint for BLANK_${idx + 1}`}
              </button>
              {revealedHints[idx] && (
                <p className="text-[11px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 rounded px-2.5 py-1">
                  {hint}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleVerify}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Verify Invariant Lines
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleRevealSolution}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-500 transition-colors"
          >
            Reveal Answer
          </button>
        </div>

        {/* Verification Feedback Banner */}
        {checkResult?.checked && (
          <div
            className={`rounded-lg border p-3.5 space-y-2 text-xs ${
              checkResult.allCorrect
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30'
                : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold">
                {checkResult.allCorrect ? (
                  <>
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-emerald-900 dark:text-emerald-200">
                      Invariant Verified — Logic Locked In!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle
                      className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-rose-900 dark:text-rose-200">
                      Check highlighted slot(s) — watch for invariant order or boundary traps.
                    </span>
                  </>
                )}
              </div>

              {checkResult.allCorrect && onJumpToSolutions && (
                <button
                  type="button"
                  onClick={onJumpToSolutions}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  Inspect Full Multi-Language Code
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            {checkResult.allCorrect && (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold">Optimal Invariant: </span>
                {activeProblem.blankPageSteps.step4_optimalInvariant}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  // =========================================================================
  // MODE 2: BIDIRECTIONAL ALGORITHM GRAPH & PROBLEM MUTATION LADDER (TAB 4)
  // =========================================================================
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            <GitBranch className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>BIDIRECTIONAL ALGORITHM-TO-PROBLEM DNA GRAPH</span>
          </div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            Problem Mutation Ladder &amp; Connected Knowledge Graph
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[65ch] leading-relaxed">
            See how one core invariant mutates from a Base Problem into Hard &amp; System-Scale interview questions—and jump directly to prerequisite or next-level algorithms.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          {solvedCountInTopic}/{problems.length} Verified
        </span>
      </div>

      {/* Layer 1: Bidirectional Topic Graph Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Prerequisites */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            <ArrowLeft className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>PREREQUISITES</span>
          </div>
          {linkage.prerequisites.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Foundational entry point — no prerequisites required.
            </p>
          ) : (
            <div className="space-y-2">
              {linkage.prerequisites.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectTopic?.(node.id)}
                  className="w-full text-left rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 hover:border-sky-500 transition-colors space-y-0.5"
                >
                  <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center justify-between gap-1">
                    <span>{node.title}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {node.reason}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sibling Invariants */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            <Link2 className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>SIBLING PATTERNS</span>
          </div>
          {linkage.siblingTopics.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standalone specialized invariant.
            </p>
          ) : (
            <div className="space-y-2">
              {linkage.siblingTopics.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectTopic?.(node.id)}
                  className="w-full text-left rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 hover:border-sky-500 transition-colors space-y-0.5"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-1">
                    <span>{node.title}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0 text-slate-400" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {node.sharedInvariant}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next-Level Unlocks */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
            <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>NEXT-LEVEL MUTATIONS</span>
          </div>
          {linkage.nextLevelUnlocks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capstone architecture module.
            </p>
          ) : (
            <div className="space-y-2">
              {linkage.nextLevelUnlocks.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectTopic?.(node.id)}
                  className="w-full text-left rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 hover:border-emerald-500 transition-colors space-y-0.5"
                >
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-1">
                    <span>{node.title}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {node.progressionTwist}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer 2: Core Algorithm DNA Strip */}
      <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/30 p-3 space-y-1">
        <div className="text-[11px] font-mono font-bold text-sky-800 dark:text-sky-300">
          SHARED INVARIANT DNA ACROSS ALL MUTATIONS BELOW
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
          {deepTopic.visualBlueprint.invariantCondition}
        </p>
      </div>

      {/* Layer 3: Connected Problem Mutation Tree */}
      <div className="space-y-2">
        {problems.map((prob, idx) => {
          const solved = solvedIds.includes(prob.problemId);
          return (
            <Fragment key={prob.problemId}>
              {idx > 0 && (
                <div className="flex items-center gap-2 pl-4 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <ArrowDown className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                  <span className="font-semibold text-sky-800 dark:text-sky-300">
                    Mutation Twist:
                  </span>
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    {prob.mutationFromPrevious}
                  </span>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3.5 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                        {idx === 0 ? 'BASE' : `LVL ${idx + 1}`}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {prob.title}
                      </span>
                      {solved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span className={`font-semibold ${DIFF_TEXT[prob.difficulty]}`}>
                        {prob.difficulty}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{prob.solutions.optimal.complexity}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans">{prob.companyTags.join(', ')}</span>
                    </div>
                    {idx === 0 && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {prob.mutationFromPrevious}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {onPracticeProblem && (
                      <button
                        type="button"
                        onClick={() => onPracticeProblem(prob.problemId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
                      >
                        <Code2 className="w-3 h-3" aria-hidden="true" />
                        Recall Drill
                      </button>
                    )}
                    {prob.trainerSlug && (
                      <button
                        type="button"
                        onClick={() => onOpenProblemTrainer(prob.trainerSlug!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-[11px] font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 transition-colors"
                      >
                        Open Trainer
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
