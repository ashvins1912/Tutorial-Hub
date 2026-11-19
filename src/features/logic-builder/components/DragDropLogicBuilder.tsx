import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  Unlock,
} from 'lucide-react';
import type { CurriculumTopic, LogicBlockItem } from '../../topics/types';
import {
  scrambleLogicBlocks,
  validateLogicAssembly,
} from '../engine/logicValidator';

interface DragDropLogicBuilderProps {
  topic: CurriculumTopic;
  onUnlockOptimal: () => void;
}

export function DragDropLogicBuilder({
  topic,
  onUnlockOptimal,
}: DragDropLogicBuilderProps) {
  const scrambledPool = useMemo(
    () => scrambleLogicBlocks(topic.logicBlocks),
    [topic.logicBlocks]
  );

  const [slots, setSlots] = useState<(string | null)[]>(() =>
    new Array(topic.logicBlocks.length).fill(null)
  );
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSlots(new Array(topic.logicBlocks.length).fill(null));
    setDraggedBlockId(null);
    setChecked(false);
  }, [topic.id, topic.logicBlocks.length]);

  const byId = useMemo(
    () => new Map<string, LogicBlockItem>(topic.logicBlocks.map((b) => [b.id, b])),
    [topic.logicBlocks]
  );

  const placedSet = useMemo(
    () => new Set(slots.filter((id): id is string => id !== null)),
    [slots]
  );

  const availableBlocks = useMemo(
    () => scrambledPool.filter((b) => !placedSet.has(b.id)),
    [scrambledPool, placedSet]
  );

  const validation = useMemo(
    () => validateLogicAssembly(topic.logicBlocks, slots),
    [topic.logicBlocks, slots]
  );

  const placeIntoSlot = (slotIdx: number, blockId: string) => {
    setSlots((prev) => {
      const next = prev.map((id) => (id === blockId ? null : id));
      next[slotIdx] = blockId;
      return next;
    });
    setChecked(true);
  };

  const placeInNextEmptySlot = (blockId: string) => {
    const emptyIdx = slots.findIndex((s) => s === null);
    if (emptyIdx === -1) return;
    placeIntoSlot(emptyIdx, blockId);
  };

  const removeFromSlot = (slotIdx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  const swapSlots = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= slots.length) return;
    setSlots((prev) => {
      const next = [...prev];
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next;
    });
    setChecked(true);
  };

  const handleAutoSolve = () => {
    const ordered = [...topic.logicBlocks]
      .sort((a, b) => a.correctOrder - b.correctOrder)
      .map((b) => b.id);
    setSlots(ordered);
    setChecked(true);
  };

  const handleReset = () => {
    setSlots(new Array(topic.logicBlocks.length).fill(null));
    setChecked(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Complete in Pieces — Assemble Execution Invariants
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Drag blocks into execution order (or tap a block to place it in the next slot).
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleAutoSolve}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            Show Order
          </button>
        </div>
      </div>

      {/* Execution Slots */}
      <div className="space-y-2.5">
        {slots.map((blockId, idx) => {
          const block = blockId ? byId.get(blockId) : null;
          const fb = validation.slotFeedback[idx];
          const showCorrect = checked && block && fb.isCorrect;
          const showError = checked && block && !fb.isCorrect;

          return (
            <div
              key={idx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || draggedBlockId;
                if (id) placeIntoSlot(idx, id);
                setDraggedBlockId(null);
              }}
              className={`rounded-xl border p-3 transition-colors ${
                showCorrect
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                  : showError
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                    : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      Step {idx + 1}
                    </span>
                    {block && (
                      <>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span className="font-semibold text-sky-700 dark:text-sky-400">
                          {block.role}
                        </span>
                        <span aria-hidden="true" className="text-slate-400">·</span>
                        <span className="text-slate-800 dark:text-slate-200 font-sans font-semibold">
                          {block.label}
                        </span>
                      </>
                    )}
                  </div>

                  {block ? (
                    <pre className="text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5">
                      {block.snippet}
                    </pre>
                  ) : (
                    <div className="text-xs text-slate-400 dark:text-slate-500 py-1">
                      Drop logic piece #{idx + 1} here
                    </div>
                  )}
                </div>

                {block && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => swapSlots(idx, idx - 1)}
                      disabled={idx === 0}
                      aria-label={`Move step ${idx + 1} up`}
                      className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800"
                    >
                      <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => swapSlots(idx, idx + 1)}
                      disabled={idx === slots.length - 1}
                      aria-label={`Move step ${idx + 1} down`}
                      className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800"
                    >
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromSlot(idx)}
                      className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {showError && fb.hint && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{fb.hint}</span>
                </div>
              )}

              {showCorrect && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Invariant holds at position {idx + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrambled Piece Bank */}
      {availableBlocks.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
            Scrambled Algorithm Blocks ({availableBlocks.length} remaining)
          </div>
          <div className="grid grid-cols-1 gap-2">
            {availableBlocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => {
                  setDraggedBlockId(block.id);
                  e.dataTransfer.setData('text/plain', block.id);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-start justify-between gap-3 cursor-grab active:cursor-grabbing hover:border-sky-400 dark:hover:border-sky-600 transition-colors"
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <GripVertical
                    className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <span className="font-mono text-sky-700 dark:text-sky-400 mr-2">
                        {block.role}
                      </span>
                      {block.label}
                    </div>
                    <code className="block text-[11px] font-mono text-slate-600 dark:text-slate-300 break-words">
                      {block.snippet}
                    </code>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => placeInNextEmptySlot(block.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
                >
                  Place
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation & Unlock Banner */}
      {validation.isValid ? (
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Logic Invariants Verified ({validation.correctCount}/{validation.totalCount})
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Every base case, loop invariant, and pruning step is in exact execution order.
            </p>
          </div>

          <button
            type="button"
            onClick={onUnlockOptimal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-emerald-800 dark:hover:bg-emerald-400 transition-colors whitespace-nowrap"
          >
            <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
            Inspect Full Optimal Code
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            Progress: {validation.correctCount} / {validation.totalCount} correctly placed
          </span>
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
          >
            Validate Assembly
          </button>
        </div>
      )}
    </div>
  );
}
