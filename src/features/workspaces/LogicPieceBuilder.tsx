import React, { useMemo, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Blocks,
  CheckCircle2,
  GripVertical,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import {
  LOGIC_BUILDER_CHALLENGES,
  type LogicPiece,
  type PieceValidationResult,
  validateLogicPieceOrder,
} from '../../core/step-generators/workspaceGenerators';

interface DraggablePieceRowProps {
  piece: LogicPiece;
  index: number;
  total: number;
  status: 'neutral' | 'correct' | 'error';
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const DraggablePieceRow: React.FC<DraggablePieceRowProps> = ({
  piece,
  index,
  total,
  status,
  onMoveUp,
  onMoveDown,
}) => {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: piece.id,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: piece.id,
  });

  const combinedRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={combinedRef}
      style={dragStyle}
      className={`rounded-lg border p-3 transition-colors flex items-start gap-3 ${
        isDragging
          ? 'opacity-75 shadow-lg border-indigo-500 bg-indigo-50 dark:bg-indigo-950/80 z-20 relative'
          : isOver
            ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30'
            : status === 'correct'
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
              : status === 'error'
                ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        aria-label={`Drag block ${index + 1}`}
        className="mt-0.5 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-mono tabular-nums font-semibold text-slate-500 dark:text-slate-400">
            Slot {index + 1} · {piece.role}
          </span>
          {status === 'correct' && (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">✓ Aligned</span>
          )}
          {status === 'error' && (
            <span className="text-rose-700 dark:text-rose-400 font-semibold">✗ Out of Order</span>
          )}
        </div>
        <pre className="text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-950/70 rounded px-2.5 py-2 border border-slate-200/80 dark:border-slate-800">
          {piece.code}
        </pre>
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label="Move block up"
          className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label="Move block down"
          className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

interface LogicPieceBuilderProps {
  initialChallengeId?: string;
}

export const LogicPieceBuilder: React.FC<LogicPieceBuilderProps> = ({
  initialChallengeId = 'piece-sliding-window',
}) => {
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const challenge = useMemo(
    () =>
      LOGIC_BUILDER_CHALLENGES.find((c) => c.id === challengeId) ??
      LOGIC_BUILDER_CHALLENGES[0],
    [challengeId],
  );

  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    challenge.pieces.map((p) => p.id),
  );
  const [validation, setValidation] = useState<PieceValidationResult | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const pieceMap = useMemo(
    () => new Map(challenge.pieces.map((p) => [p.id, p])),
    [challenge],
  );

  const switchChallenge = (nextId: string) => {
    const next =
      LOGIC_BUILDER_CHALLENGES.find((c) => c.id === nextId) ?? LOGIC_BUILDER_CHALLENGES[0];
    setChallengeId(next.id);
    setOrderedIds(next.pieces.map((p) => p.id));
    setValidation(null);
  };

  const swapPositions = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= orderedIds.length || fromIdx === toIdx) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setValidation(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      swapPositions(oldIndex, newIndex);
    }
  };

  const handleVerify = () => {
    setValidation(validateLogicPieceOrder(challenge, orderedIds));
  };

  const handleShuffle = () => {
    setOrderedIds(challenge.pieces.map((p) => p.id));
    setValidation(null);
  };

  const handleAutoSolve = () => {
    const sorted = [...challenge.pieces]
      .sort((a, b) => a.correctOrder - b.correctOrder)
      .map((p) => p.id);
    setOrderedIds(sorted);
    setValidation(validateLogicPieceOrder(challenge, sorted));
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Blocks className="w-3.5 h-3.5" />
            <span>Complete in Pieces · Logic Assembly Mode</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {challenge.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1">
          {LOGIC_BUILDER_CHALLENGES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => switchChallenge(c.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                challenge.id === c.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {c.id === 'piece-sliding-window'
                ? 'Sliding Window'
                : c.id === 'piece-ngram-pipeline'
                  ? 'N-Gram Pipeline'
                  : 'Invariant Proof'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {challenge.prompt} Drag and drop blocks (or use ↑/↓ controls) into exact invariant execution order.
        </p>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="space-y-2">
            {orderedIds.map((id, idx) => {
              const piece = pieceMap.get(id);
              if (!piece) return null;
              let status: 'neutral' | 'correct' | 'error' = 'neutral';
              if (validation) {
                status = piece.correctOrder === idx ? 'correct' : 'error';
              }
              return (
                <DraggablePieceRow
                  key={id}
                  piece={piece}
                  index={idx}
                  total={orderedIds.length}
                  status={status}
                  onMoveUp={() => swapPositions(idx, idx - 1)}
                  onMoveDown={() => swapPositions(idx, idx + 1)}
                />
              );
            })}
          </div>
        </DndContext>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleVerify}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify Invariant Order</span>
            </button>
            <button
              type="button"
              onClick={handleAutoSolve}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Show Canonical Order</span>
            </button>
            <button
              type="button"
              onClick={handleShuffle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Reset Scrambled</span>
            </button>
          </div>
          {validation && (
            <span className="text-xs font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-300">
              {validation.correctCount} / {validation.totalCount} slots aligned
            </span>
          )}
        </div>

        {validation && (
          <div
            className={`rounded-lg border p-3 text-xs font-medium flex items-start gap-2 ${
              validation.isCorrect
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
            }`}
          >
            {validation.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{validation.feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
