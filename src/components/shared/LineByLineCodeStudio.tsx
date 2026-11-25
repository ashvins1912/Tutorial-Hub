import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Table2,
  XCircle,
} from 'lucide-react';
import {
  annotateCodeLineByLine,
  type AnnotatedCodeLine,
  type CodeLineRole,
  type LineByLinePatternBlueprint,
} from '../../data/dsaLineByLineMasteryData';
import { CopyButton } from '../ui';

export type StudioCodeLanguage = 'python' | 'typescript' | 'javascript' | 'java';

const LANG_LABEL: Record<StudioCodeLanguage, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  java: 'Java',
};

const ROLE_META: Record<
  CodeLineRole,
  { label: string; textClass: string }
> = {
  setup: {
    label: 'Setup & State',
    textClass: 'text-sky-600 dark:text-sky-400',
  },
  guard: {
    label: 'Boundary Guard',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  invariant: {
    label: 'Loop / Invariant',
    textClass: 'text-indigo-600 dark:text-indigo-400',
  },
  branch: {
    label: 'Decision Branch',
    textClass: 'text-violet-600 dark:text-violet-400',
  },
  mutation: {
    label: 'State Update',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  return: {
    label: 'Return Result',
    textClass: 'text-teal-600 dark:text-teal-400',
  },
};

export interface LineByLineCodeStudioProps {
  /** Full 20-pattern blueprint with Python/TS/Java rich annotations, dry-run trace, and understanding check */
  blueprint?: LineByLinePatternBlueprint;
  /** Lightweight mode: raw multi-language code strings auto-annotated line by line */
  rawCodeByLang?: Partial<Record<StudioCodeLanguage, string>>;
  /** Lightweight mode: single raw code snippet */
  rawCode?: string;
  /** Language for single rawCode mode or default selected language */
  initialLanguage?: StudioCodeLanguage;
  /** Pre-annotated lines if caller already prepared them */
  annotatedLines?: AnnotatedCodeLine[];
  title?: string;
  subtitle?: string;
  contextHint?: string;
  compact?: boolean;
  defaultView?: 'inspector' | 'ledger' | 'dryrun';
  onQuizPassed?: () => void;
}

export const LineByLineCodeStudio: React.FC<LineByLineCodeStudioProps> = ({
  blueprint,
  rawCodeByLang,
  rawCode,
  initialLanguage,
  annotatedLines,
  title,
  subtitle,
  contextHint,
  compact = false,
  defaultView = 'inspector',
  onQuizPassed,
}) => {
  const availableLanguages = useMemo<StudioCodeLanguage[]>(() => {
    if (blueprint) return ['python', 'typescript', 'java'];
    if (rawCodeByLang) {
      const order: StudioCodeLanguage[] = ['python', 'typescript', 'javascript', 'java'];
      return order.filter((lang) => Boolean(rawCodeByLang[lang]));
    }
    return [initialLanguage ?? 'python'];
  }, [blueprint, rawCodeByLang, initialLanguage]);

  const [language, setLanguage] = useState<StudioCodeLanguage>(
    initialLanguage && availableLanguages.includes(initialLanguage)
      ? initialLanguage
      : availableLanguages[0] ?? 'python'
  );
  const [viewMode, setViewMode] = useState<'inspector' | 'ledger' | 'dryrun'>(defaultView);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  // Dry-run state (blueprint mode)
  const [dryStepIdx, setDryStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Understanding check quiz state (blueprint mode)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const resetKey = blueprint?.id ?? title ?? rawCode?.slice(0, 32) ?? 'studio';

  useEffect(() => {
    const nextLang =
      initialLanguage && availableLanguages.includes(initialLanguage)
        ? initialLanguage
        : availableLanguages[0] ?? 'python';
    setLanguage(nextLang);
    setSelectedIdx(0);
    setDryStepIdx(0);
    setIsPlaying(false);
    setSelectedChoice(null);
    if (!blueprint && viewMode === 'dryrun') {
      setViewMode('inspector');
    }
  }, [resetKey, initialLanguage]);

  const lines = useMemo<AnnotatedCodeLine[]>(() => {
    if (blueprint) {
      if (language === 'typescript') return blueprint.code.typescript;
      if (language === 'java') return blueprint.code.java;
      return blueprint.code.python;
    }
    if (annotatedLines && annotatedLines.length > 0) {
      return annotatedLines;
    }
    if (rawCodeByLang) {
      const codeStr = rawCodeByLang[language] ?? rawCodeByLang[availableLanguages[0]] ?? '';
      return annotateCodeLineByLine(codeStr, language, contextHint ?? title);
    }
    if (rawCode) {
      return annotateCodeLineByLine(rawCode, language, contextHint ?? title);
    }
    return [];
  }, [blueprint, annotatedLines, rawCodeByLang, rawCode, language, availableLanguages, contextHint, title]);

  const safeIdx = Math.min(selectedIdx, Math.max(0, lines.length - 1));
  const activeLine = lines[safeIdx];

  const dryRunSteps = blueprint?.dryRun.steps ?? [];
  const activeDryStep = dryRunSteps[Math.min(dryStepIdx, Math.max(0, dryRunSteps.length - 1))];

  // Auto-advance dry-run playback
  useEffect(() => {
    if (!isPlaying || dryRunSteps.length === 0) return;
    const timer = window.setInterval(() => {
      setDryStepIdx((prev) => {
        if (prev >= dryRunSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => window.clearInterval(timer);
  }, [isPlaying, dryRunSteps.length]);

  const rawCopyText = useMemo(() => lines.map((l) => l.code).join('\n'), [lines]);

  const handleStepLine = (delta: number) => {
    setSelectedIdx((prev) => {
      const next = prev + delta;
      if (next < 0) return 0;
      if (next >= lines.length) return lines.length - 1;
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStepLine(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStepLine(-1);
    }
  };

  // Determine which line number is highlighted in the code panel
  const highlightedLineNo =
    viewMode === 'dryrun' && activeDryStep ? activeDryStep.lineNo : activeLine?.lineNo ?? 1;

  // For dry-run mode, always display Python lines because dryRun steps map to Python lineNo
  const displayLines =
    viewMode === 'dryrun' && blueprint ? blueprint.code.python : lines;

  const quiz = blueprint?.understandingCheck;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Top Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {(title || blueprint) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {title ?? `${blueprint?.title} · Line-by-Line Implementation`}
              </h3>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {displayLines.length} lines
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div
            role="tablist"
            aria-label="Code explanation view mode"
            className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'inspector'}
              onClick={() => {
                setIsPlaying(false);
                setViewMode('inspector');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'inspector'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Line Inspector</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'ledger'}
              onClick={() => {
                setIsPlaying(false);
                setViewMode('ledger');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'ledger'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table2 className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Full Ledger</span>
            </button>
            {blueprint && dryRunSteps.length > 0 && (
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'dryrun'}
                onClick={() => {
                  setViewMode('dryrun');
                  setLanguage('python');
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'dryrun'
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Play className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Dry-Run Trace</span>
              </button>
            )}
          </div>

          {/* Language Switcher (hidden only if single language or locked to Python in dryrun) */}
          {availableLanguages.length > 1 && viewMode !== 'dryrun' && (
            <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    setSelectedIdx(0);
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    language === lang
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {LANG_LABEL[lang]}
                </button>
              ))}
            </div>
          )}

          <CopyButton
            text={rawCopyText}
            label="Copy"
            copiedLabel="Copied"
            ariaLabel="Copy implementation code"
            size="xs"
          />
        </div>
      </div>

      {/* VIEW 1 & 3: INTERACTIVE CODE STAGE + INSPECTOR OR DRY-RUN DECK */}
      {(viewMode === 'inspector' || viewMode === 'dryrun') && (
        <div
          className={`grid grid-cols-1 ${
            compact ? 'lg:grid-cols-12' : 'xl:grid-cols-12'
          } divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800`}
        >
          {/* Left: Clickable Code Stage */}
          <div
            className={`${compact ? 'lg:col-span-7' : 'xl:col-span-7'} bg-slate-950 text-slate-100 flex flex-col`}
            tabIndex={0}
            onKeyDown={viewMode === 'inspector' ? handleKeyDown : undefined}
            aria-label="Interactive code lines. Click any line or use Up and Down arrow keys to inspect."
          >
            <div className="px-3.5 py-2 border-b border-slate-800/90 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <span>
                {viewMode === 'dryrun'
                  ? 'Python Trace · Active execution line highlighted'
                  : `${LANG_LABEL[language]} · Click any line or step through`}
              </span>
              {viewMode === 'inspector' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStepLine(-1)}
                    disabled={safeIdx === 0}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-35 whitespace-nowrap shrink-0"
                    aria-label="Previous line"
                  >
                    <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                    <span>Prev</span>
                  </button>
                  <span className="tabular-nums text-slate-400">
                    {safeIdx + 1}/{lines.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepLine(1)}
                    disabled={safeIdx >= lines.length - 1}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-35 whitespace-nowrap shrink-0"
                    aria-label="Next line"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <div className="py-2.5 overflow-x-auto font-mono text-xs leading-6 flex-1">
              {displayLines.map((item, idx) => {
                const isSelected = item.lineNo === highlightedLineNo;
                const hasTrap = Boolean(item.bugTrap);
                return (
                  <button
                    key={`${item.lineNo}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (viewMode === 'inspector') {
                        setSelectedIdx(idx);
                      } else {
                        const matchStep = dryRunSteps.findIndex((s) => s.lineNo === item.lineNo);
                        if (matchStep >= 0) {
                          setIsPlaying(false);
                          setDryStepIdx(matchStep);
                        }
                      }
                    }}
                    className={`w-full text-left px-3.5 flex items-baseline gap-3 transition-colors ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-100 font-semibold'
                        : 'text-slate-300 hover:bg-slate-900/90'
                    }`}
                  >
                    <span
                      className={`w-6 text-right select-none shrink-0 tabular-nums ${
                        isSelected ? 'text-sky-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {item.lineNo}
                    </span>
                    <span className="whitespace-pre flex-1">{item.code || ' '}</span>
                    {hasTrap && (
                      <AlertTriangle
                        className="w-3 h-3 text-amber-400 shrink-0 self-center"
                        aria-label="Contains common interview bug trap"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Focused Line Dissection OR Dry-Run Variable Watch */}
          <div className={`${compact ? 'lg:col-span-5' : 'xl:col-span-5'} p-4 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4`}>
            {viewMode === 'inspector' && activeLine && (
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      Line {activeLine.lineNo}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                    <span className={`font-semibold ${ROLE_META[activeLine.role].textClass}`}>
                      {ROLE_META[activeLine.role].label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {activeLine.complexityImpact}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    What This Line Does
                  </p>
                  <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
                    {activeLine.whatItDoes}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Why It Exists · Invariant
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeLine.whyItExists}
                  </p>
                </div>

                {activeLine.bugTrap && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Common Bug Trap</span>
                    </div>
                    <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                      {activeLine.bugTrap}
                    </p>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'dryrun' && blueprint && activeDryStep && (
              <div className="space-y-3.5">
                <div className="pb-2.5 border-b border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {blueprint.dryRun.problemTitle}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                      Step {activeDryStep.step} / {dryRunSteps.length}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Input: {blueprint.dryRun.sampleInput} → Expected: {blueprint.dryRun.expectedOutput}
                  </p>
                </div>

                {/* Playback Controls */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (dryStepIdx >= dryRunSteps.length - 1) setDryStepIdx(0);
                      setIsPlaying((p) => !p);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{dryStepIdx >= dryRunSteps.length - 1 ? 'Replay' : 'Play'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setDryStepIdx((s) => Math.max(0, s - 1));
                    }}
                    disabled={dryStepIdx === 0}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setDryStepIdx((s) => Math.min(dryRunSteps.length - 1, s + 1));
                    }}
                    disabled={dryStepIdx >= dryRunSteps.length - 1}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
                  >
                    <span>Step</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setDryStepIdx(0);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                    aria-label="Reset dry-run trace"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Live Variable Watch Table */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Live State Watch</span>
                    <span className="tabular-nums">Executing Line {activeDryStep.lineNo}</span>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-xs">
                    {Object.entries(activeDryStep.variables).map(([varName, varVal]) => (
                      <div
                        key={varName}
                        className="px-3 py-1.5 flex items-baseline justify-between gap-3 bg-white dark:bg-slate-900"
                      >
                        <span className="text-sky-700 dark:text-sky-400 font-semibold shrink-0">
                          {varName}
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 text-right tabular-nums break-all">
                          {varVal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    What Happened on This Step
                  </p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {activeDryStep.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Quick legend footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
              <span>
                {viewMode === 'inspector'
                  ? 'Tip: Use ↑ / ↓ arrows to step line by line.'
                  : 'Click Step or Play to trace state transitions.'}
              </span>
              {viewMode === 'inspector' && lines.some((l) => l.bugTrap) && (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                  <span>Trap markers</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPLETE SIDE-BY-SIDE LINE-BY-LINE LEDGER */}
      {viewMode === 'ledger' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-2 pl-4 pr-2 w-10 font-mono">#</th>
                <th className="py-2 px-3 w-[44%]">Code Line ({LANG_LABEL[language]})</th>
                <th className="py-2 px-3">Line-by-Line Explanation (What · Why · Cost)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {lines.map((line) => (
                <tr
                  key={line.lineNo}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 align-top"
                >
                  <td className="py-2.5 pl-4 pr-2 font-mono tabular-nums text-slate-400 dark:text-slate-500">
                    {line.lineNo}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] bg-slate-950/95 text-slate-100 whitespace-pre overflow-x-auto">
                    {line.code || ' '}
                  </td>
                  <td className="py-2.5 px-3 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                      <span className={`font-semibold ${ROLE_META[line.role].textClass}`}>
                        {ROLE_META[line.role].label}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {line.complexityImpact}
                      </span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                      <strong className="font-semibold">What:</strong> {line.whatItDoes}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong className="font-semibold">Why:</strong> {line.whyItExists}
                    </p>
                    {line.bugTrap && (
                      <p className="inline-flex items-start gap-1.5 text-amber-800 dark:text-amber-300 pt-0.5 leading-relaxed">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          <strong className="font-semibold">Bug Trap:</strong> {line.bugTrap}
                        </span>
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* UNDERSTANDING VERIFICATION CHECK (Blueprint Mode) */}
      {quiz && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
            <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <span>Line-Level Understanding Check</span>
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {quiz.question}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quiz.options.map((opt, idx) => {
              const isPicked = selectedChoice === idx;
              const isCorrect = idx === quiz.correctIndex;
              const answered = selectedChoice !== null;

              let buttonStyle =
                'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-sky-400 dark:hover:border-sky-500';
              if (answered && isCorrect) {
                buttonStyle =
                  'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100';
              } else if (answered && isPicked && !isCorrect) {
                buttonStyle =
                  'border-rose-500 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedChoice(idx);
                    if (idx === quiz.correctIndex && onQuizPassed) {
                      onQuizPassed();
                    }
                  }}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors flex items-start gap-2 ${buttonStyle}`}
                >
                  <span className="font-mono text-[11px] font-semibold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="leading-relaxed flex-1">{opt}</span>
                  {answered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  {answered && isPicked && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
          {selectedChoice !== null && (
            <div
              className={`rounded-lg border px-3 py-2 text-xs leading-relaxed flex items-start gap-2 ${
                selectedChoice === quiz.correctIndex
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : 'border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              {selectedChoice === quiz.correctIndex ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div>
                <strong className="font-semibold">
                  {selectedChoice === quiz.correctIndex ? 'Correct: ' : 'Review the Invariant: '}
                </strong>
                {quiz.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
