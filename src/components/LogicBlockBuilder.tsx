import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  GripVertical,
  Lock,
  Play,
  Plus,
  Trash2,
  Unlock,
  Wand2,
} from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';
import { CodeLanguage, LogicBlock, PipelineSlotId, ProblemDefinition } from '../types/dsa';
import { ActiveRecallCodeEditor } from './ActiveRecallCodeEditor';

const RECALL_UNLOCKED_STORAGE_KEY = 'patternforge_logic_recall_unlocked_v1';

function readUnlockedRecallProblems(): string[] {
  try {
    const raw = window.localStorage.getItem(RECALL_UNLOCKED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeUnlockedRecallProblems(ids: string[]) {
  try {
    window.localStorage.setItem(RECALL_UNLOCKED_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

/**
 * Builds the full optimal code template string and selects 2-3 critical
 * line indices (from init, loop, and update blocks) for Active Recall.
 */
function buildOptimalRecallSpec(problem: ProblemDefinition, lang: CodeLanguage) {
  const sig = problem.functionSignature[lang];
  const slotOrder: PipelineSlotId[] = ['init', 'loop', 'update'];
  const allLines: string[] = [sig.header];
  const blankIndices: number[] = [];
  const hints: string[] = [];

  const isSubstantiveLine = (line: string) => {
    const t = line.trim();
    return t.length >= 6 && t !== '{' && t !== '}' && !t.startsWith('//') && !t.startsWith('#');
  };

  for (const slotId of slotOrder) {
    const block = problem.blocks.find((b) => b.mode === 'optimal' && b.targetSlot === slotId);
    if (!block) continue;
    const blockLines = block.code[lang];
    const startIdx = allLines.length;
    allLines.push(...blockLines);

    // Pick the single most meaningful line in this block for Active Recall
    const candidateOffsets = blockLines
      .map((line, offset) => ({ line, offset }))
      .filter(({ line }) => isSubstantiveLine(line));

    if (candidateOffsets.length > 0 && blankIndices.length < 3) {
      // Prefer the core operation line (second substantive line if available in update, otherwise first)
      const chosen =
        slotId === 'update' && candidateOffsets.length > 1
          ? candidateOffsets[Math.min(1, candidateOffsets.length - 1)]
          : candidateOffsets[0];
      blankIndices.push(startIdx + chosen.offset);
      hints.push(`${block.label} — ${block.summary}`);
    }
  }

  for (const fLine of sig.footer.split('\n')) {
    allLines.push(fLine);
  }

  const distractorLines = problem.blocks
    .filter((b) => b.mode === 'distractor')
    .flatMap((b) => b.code[lang])
    .filter(isSubstantiveLine)
    .slice(0, 2);

  return {
    codeTemplate: allLines.join('\n'),
    blankIndices,
    hints,
    distractorLines,
  };
}

const SLOTS: { id: PipelineSlotId; title: string; prompt: string }[] = [
  { id: 'init', title: 'Piece 1: Initialize State', prompt: 'Drop variables or data structures here' },
  { id: 'loop', title: 'Piece 2: Traversal & Condition', prompt: 'Drop loop structure here' },
  { id: 'update', title: 'Piece 3: Update Result', prompt: 'Drop check & mutation logic here' },
];

function DraggablePaletteBlock({
  block,
  isPlaced,
  onQuickAdd,
  onHover,
}: {
  block: LogicBlock;
  isPlaced: boolean;
  onQuickAdd: (block: LogicBlock) => void;
  onHover: (id: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 40 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
      className={`group rounded-lg border p-3 transition-colors select-none ${
        isDragging
          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 shadow-lg opacity-90'
          : isPlaced
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          {...listeners}
          {...attributes}
          className="flex items-start gap-2 cursor-grab active:cursor-grabbing flex-1 min-w-0"
        >
          <GripVertical className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {block.category}
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug mt-0.5">
              {block.label}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onQuickAdd(block)}
          title="Snap into matching slot"
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-400 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pl-6 leading-relaxed">
        {block.summary}
      </p>
    </div>
  );
}

function PipelineDropSlot({
  slot,
  placedBlock,
  isStepping,
  onRemove,
  onHover,
}: {
  slot: { id: PipelineSlotId; title: string; prompt: string };
  placedBlock: LogicBlock | null;
  isStepping: boolean;
  onRemove: () => void;
  onHover: (id: string | null) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slot.id}`,
    data: { slotId: slot.id },
  });

  return (
    <div
      ref={setNodeRef}
      onMouseEnter={() => placedBlock && onHover(placedBlock.id)}
      onMouseLeave={() => onHover(null)}
      className={`rounded-xl border p-4 transition-colors ${
        isStepping
          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400/40'
          : isOver
            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
            : placedBlock
              ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
          {slot.title}
        </span>
        {placedBlock ? (
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
            SNAPPED
          </span>
        ) : (
          <span className="text-[11px] font-mono text-slate-400">EMPTY SLOT</span>
        )}
      </div>

      {placedBlock ? (
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {placedBlock.label}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {placedBlock.summary}
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${placedBlock.label}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
          {slot.prompt}
        </div>
      )}
    </div>
  );
}

export function LogicBlockBuilder() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const activeLanguage = usePatternForgeStore((s) => s.activeLanguage);
  const compareAllLanguages = usePatternForgeStore((s) => s.compareAllLanguages);
  const hoveredBlockId = usePatternForgeStore((s) => s.hoveredBlockId);
  const steppingSlot = usePatternForgeStore((s) => s.steppingSlot);
  const distractorAlert = usePatternForgeStore((s) => s.distractorAlert);

  const setPipelineMode = usePatternForgeStore((s) => s.setPipelineMode);
  const placeBlockInSlot = usePatternForgeStore((s) => s.placeBlockInSlot);
  const removeBlockFromSlot = usePatternForgeStore((s) => s.removeBlockFromSlot);
  const autoFillCurrentPipeline = usePatternForgeStore((s) => s.autoFillCurrentPipeline);
  const clearDistractorAlert = usePatternForgeStore((s) => s.clearDistractorAlert);
  const setActiveLanguage = usePatternForgeStore((s) => s.setActiveLanguage);
  const setCompareAllLanguages = usePatternForgeStore((s) => s.setCompareAllLanguages);
  const setHoveredBlockId = usePatternForgeStore((s) => s.setHoveredBlockId);
  const setSteppingSlot = usePatternForgeStore((s) => s.setSteppingSlot);
  const setCurrentStage = usePatternForgeStore((s) => s.setCurrentStage);

  const [stepFeedback, setStepFeedback] = useState<string | null>(null);
  const [unlockedRecallIds, setUnlockedRecallIds] = useState<string[]>(() =>
    readUnlockedRecallProblems(),
  );

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const mode = progress.pipelineMode;
  const currentPlaced = progress.placedBlocks[mode];
  const isOptimalUnlocked = unlockedRecallIds.includes(problem.id);

  const optimalRecallSpec = useMemo(
    () => buildOptimalRecallSpec(problem, activeLanguage),
    [problem, activeLanguage],
  );

  const handleUnlockOptimalRecall = () => {
    setUnlockedRecallIds((prev) => {
      if (prev.includes(problem.id)) return prev;
      const next = [...prev, problem.id];
      writeUnlockedRecallProblems(next);
      return next;
    });
  };

  const handleRelockOptimalRecall = () => {
    setUnlockedRecallIds((prev) => {
      const next = prev.filter((id) => id !== problem.id);
      writeUnlockedRecallProblems(next);
      return next;
    });
  };

  // Shuffle distractors and valid blocks cleanly in recall mode or normal order
  const paletteBlocks = problem.blocks.filter(
    (b) => b.mode === mode || b.mode === 'distractor'
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const slotId = over.data.current?.slotId as PipelineSlotId | undefined;
    if (slotId) {
      placeBlockInSlot(slotId, String(active.id));
    }
  };

  const getBlockById = (id: string | null) =>
    id ? problem.blocks.find((b) => b.id === id) ?? null : null;

  const isPipelineComplete = Boolean(currentPlaced.init && currentPlaced.loop && currentPlaced.update);

  const handleRunPieceStep = () => {
    const order: PipelineSlotId[] = ['init', 'loop', 'update'];
    const curIdx = steppingSlot ? order.indexOf(steppingSlot) : -1;
    const nextSlot = order[(curIdx + 1) % order.length];
    const blk = getBlockById(currentPlaced[nextSlot]);
    setSteppingSlot(nextSlot);
    setHoveredBlockId(blk?.id ?? null);
    setStepFeedback(
      blk
        ? `Stepping ${nextSlot.toUpperCase()}: ${blk.label}`
        : `Slot ${nextSlot.toUpperCase()} is empty — snap a block first.`
    );
  };

  const renderCodePanel = (lang: CodeLanguage) => {
    const sig = problem.functionSignature[lang];
    const slotBlocks: { slotId: PipelineSlotId; block: LogicBlock | null }[] = [
      { slotId: 'init', block: getBlockById(currentPlaced.init) },
      { slotId: 'loop', block: getBlockById(currentPlaced.loop) },
      { slotId: 'update', block: getBlockById(currentPlaced.update) },
    ];

    let lineNum = 1;

    return (
      <div
        key={lang}
        className="rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden"
      >
        <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            {lang === 'java' ? 'Solution.java' : lang === 'js' ? 'solution.js' : 'solution.py'}
          </span>
          <span>{mode === 'brute' ? problem.bruteBigO : problem.targetBigO}</span>
        </div>
        <div className="p-3.5 font-mono text-xs leading-6 overflow-x-auto">
          <div className="flex gap-3 text-slate-400">
            <span className="w-5 text-right select-none text-slate-600">{lineNum++}</span>
            <pre>{sig.header}</pre>
          </div>

          {slotBlocks.map(({ slotId, block }) => {
            if (!block) {
              return (
                <div key={slotId} className="flex gap-3 text-slate-600 italic">
                  <span className="w-5 text-right select-none">{lineNum++}</span>
                  <pre>{`  /* [ ${slotId.toUpperCase()} block pending ] */`}</pre>
                </div>
              );
            }
            const isHighlighted = hoveredBlockId === block.id || steppingSlot === slotId;
            return block.code[lang].map((line, idx) => (
              <div
                key={`${block.id}-${idx}`}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                className={`flex gap-3 px-1 -mx-1 rounded transition-colors ${
                  isHighlighted ? 'bg-sky-500/20 text-sky-200' : 'text-slate-100'
                }`}
              >
                <span className="w-5 text-right select-none text-slate-500">{lineNum++}</span>
                <pre>{line}</pre>
              </div>
            ));
          })}

          {sig.footer.split('\n').map((fLine, idx) => (
            <div key={`footer-${idx}`} className="flex gap-3 text-slate-400">
              <span className="w-5 text-right select-none text-slate-600">{lineNum++}</span>
              <pre>{fLine}</pre>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode & Controls Header */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setPipelineMode('brute')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'brute'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tier 1: Brute Force ({problem.bruteBigO})
            </button>
            <button
              type="button"
              onClick={() => setPipelineMode('optimal')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                mode === 'optimal'
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tier 2: Optimal ({problem.targetBigO})
            </button>
          </div>
          {!progress.bottleneckSolved && mode === 'optimal' && (
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Tip: Diagnosing the Stage 4 Bottleneck reveals why Optimal works.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!progress.isRecallMode && (
            <button
              type="button"
              onClick={autoFillCurrentPipeline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
              Assemble Hint
            </button>
          )}
          <button
            type="button"
            onClick={handleRunPieceStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            Step Piece
          </button>
          <button
            type="button"
            onClick={() => setCurrentStage(4)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            Run Race Mode
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {distractorAlert && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold">FLAWED BLOCK REJECTED: </span>
              {distractorAlert.reason}
            </div>
          </div>
          <button
            type="button"
            onClick={clearDistractorAlert}
            className="font-mono font-semibold text-rose-700 dark:text-rose-300 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column DnD Workspace: Palette | Pipeline Canvas | Synchronized Code Viewer */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Panel: Categorized Block Palette */}
          <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Logic Block Palette
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drag blocks (or click +) into the 3 pipeline pieces. Watch out for distractor traps.
              </p>
            </div>
            <div className="space-y-2.5">
              {paletteBlocks.map((block) => {
                const isPlaced = Object.values(currentPlaced).includes(block.id);
                return (
                  <DraggablePaletteBlock
                    key={block.id}
                    block={block}
                    isPlaced={isPlaced}
                    onHover={setHoveredBlockId}
                    onQuickAdd={(b) => placeBlockInSlot(b.targetSlot, b.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Center Panel: Modular Pipeline Canvas */}
          <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Modular Pipeline Canvas
              </h3>
              {isPipelineComplete && (
                <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  COMPLETE
                </span>
              )}
            </div>

            {stepFeedback && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
                {stepFeedback}
              </div>
            )}

            <div className="space-y-3">
              {SLOTS.map((slot) => (
                <PipelineDropSlot
                  key={slot.id}
                  slot={slot}
                  placedBlock={getBlockById(currentPlaced[slot.id])}
                  isStepping={steppingSlot === slot.id}
                  onRemove={() => removeBlockFromSlot(slot.id)}
                  onHover={setHoveredBlockId}
                />
              ))}
            </div>
          </div>

          {/* Right Panel: Synchronized Multi-Language Code Viewer (Active Recall Gated in Optimal Mode) */}
          <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {mode === 'optimal' && !isOptimalUnlocked
                    ? 'Optimal Active Recall Gate'
                    : 'Synchronized Code'}
                </h3>
              </div>

              {mode === 'optimal' && isOptimalUnlocked ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRelockOptimalRecall}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 whitespace-nowrap shrink-0"
                  >
                    <Lock className="w-3 h-3" aria-hidden="true" />
                    Re-lock Recall
                  </button>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() => setCompareAllLanguages(!compareAllLanguages)}
                    className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    {compareAllLanguages ? 'Single Tab View' : 'Compare All 3'}
                  </button>
                </div>
              ) : mode === 'brute' ? (
                <button
                  type="button"
                  onClick={() => setCompareAllLanguages(!compareAllLanguages)}
                  className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                >
                  {compareAllLanguages ? 'Single Tab View' : 'Compare All 3'}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 dark:text-amber-400">
                  <Lock className="w-3 h-3" aria-hidden="true" />
                  Fill {optimalRecallSpec.blankIndices.length} lines
                </span>
              )}
            </div>

            {(!compareAllLanguages || (mode === 'optimal' && !isOptimalUnlocked)) && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['python', 'js', 'java'] as CodeLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLanguage(lang)}
                    className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      activeLanguage === lang
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {lang === 'python' ? 'Python' : lang === 'js' ? 'JavaScript' : 'Java'}
                  </button>
                ))}
              </div>
            )}

            {mode === 'optimal' && !isOptimalUnlocked ? (
              <ActiveRecallCodeEditor
                codeTemplate={optimalRecallSpec.codeTemplate}
                blankIndices={optimalRecallSpec.blankIndices}
                languageLabel={
                  activeLanguage === 'java'
                    ? 'Solution.java'
                    : activeLanguage === 'js'
                      ? 'solution.js'
                      : 'solution.py'
                }
                complexityLabel={problem.targetBigO}
                hints={optimalRecallSpec.hints}
                distractorLines={optimalRecallSpec.distractorLines}
                resetKey={`${problem.id}-${activeLanguage}`}
                isUnlocked={isOptimalUnlocked}
                onUnlockOptimal={handleUnlockOptimalRecall}
                onRelock={handleRelockOptimalRecall}
              />
            ) : (
              <>
                {mode === 'optimal' && isOptimalUnlocked && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/25 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <Unlock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Active Recall verified — Optimal solution unlocked across all 3 languages.</span>
                  </div>
                )}

                <div className="space-y-3">
                  {compareAllLanguages ? (
                    <>
                      {renderCodePanel('python')}
                      {renderCodePanel('js')}
                      {renderCodePanel('java')}
                    </>
                  ) : (
                    renderCodePanel(activeLanguage)
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hover any block or code line to synchronize highlighting across Java, JavaScript, and Python.
                </p>
              </>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
