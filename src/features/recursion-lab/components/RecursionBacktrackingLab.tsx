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
  CheckCircle2,
  GripVertical,
  Layers,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import {
  BlockBucket,
  BUILDING_BLOCKS_CHALLENGES,
  BuildingBlockItem,
} from '../data/recursionLabData';
import { RecursionBacktrackingVisualizer } from './RecursionBacktrackingVisualizer';
import { CallStackVisualizer } from './CallStackVisualizer';
import { VisualSandbox } from '../../../components/VisualSandbox';

export { RecursionBacktrackingVisualizer } from './RecursionBacktrackingVisualizer';
export { CallStackVisualizer } from './CallStackVisualizer';

function DraggableLogicCard({
  block,
  assignedBucket,
  checked,
  onQuickAssign,
}: {
  block: BuildingBlockItem;
  assignedBucket?: BlockBucket;
  checked: boolean;
  onQuickAssign: (blockId: string, bucket: BlockBucket) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 40 : undefined }
    : undefined;

  const isCorrect = checked && assignedBucket === block.correctBucket;
  const isWrong = checked && assignedBucket !== undefined && assignedBucket !== block.correctBucket;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border p-2.5 text-xs transition-colors select-none ${
        isDragging
          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 shadow-lg opacity-90'
          : isCorrect
            ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/25'
            : isWrong
              ? 'border-rose-400 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/25'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-slate-400 mt-0.5 shrink-0"
          title="Drag block to bucket"
        >
          <GripVertical className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{block.label}</span>
            {isCorrect && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            )}
            {isWrong && (
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
            )}
          </div>
          <code className="block font-mono text-[11px] text-sky-800 dark:text-sky-300 bg-slate-100 dark:bg-slate-950 rounded px-2 py-1 overflow-x-auto">
            {block.code}
          </code>

          {!assignedBucket && (
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onQuickAssign(block.id, 'base-case')}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:border-amber-500 whitespace-nowrap"
              >
                → Base / Prune
              </button>
              <button
                type="button"
                onClick={() => onQuickAssign(block.id, 'recursive-step')}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:border-sky-500 whitespace-nowrap"
              >
                → Recursive Step
              </button>
            </div>
          )}

          {checked && assignedBucket && (
            <p
              className={`text-[11px] leading-snug pt-0.5 ${
                isCorrect
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {block.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BucketDropZone({
  id,
  title,
  subtitle,
  blocks,
  checked,
  onUnassign,
  onQuickAssign,
}: {
  id: BlockBucket;
  title: string;
  subtitle: string;
  blocks: BuildingBlockItem[];
  checked: boolean;
  onUnassign: (blockId: string) => void;
  onQuickAssign: (blockId: string, bucket: BlockBucket) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-3.5 space-y-2.5 min-h-[170px] transition-colors ${
        isOver
          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
          {blocks.length} placed
        </span>
      </div>

      {blocks.length === 0 ? (
        <div className="py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          Drag blocks here or use quick-assign buttons
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="relative">
              <DraggableLogicCard
                block={block}
                assignedBucket={id}
                checked={checked}
                onQuickAssign={onQuickAssign}
              />
              <button
                type="button"
                onClick={() => onUnassign(block.id)}
                className="mt-1 text-[10px] font-mono text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              >
                Remove from bucket
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecursionBacktrackingLab({
  onOpenCurriculumModule,
  activeCurriculumTopicId,
}: {
  onOpenCurriculumModule?: (topicId: 'backtracking' | 'recursion-divide-conquer') => void;
  activeCurriculumTopicId?: string;
}) {
  const [section, setSection] = useState<'call-stack' | 'tree-board' | 'blocks'>('call-stack');

  // Building blocks challenge state
  const [challengeId, setChallengeId] = useState<string>(BUILDING_BLOCKS_CHALLENGES[0].id);
  const [assignments, setAssignments] = useState<Record<string, BlockBucket>>({});
  const [checked, setChecked] = useState(false);

  const challenge = useMemo(
    () =>
      BUILDING_BLOCKS_CHALLENGES.find((c) => c.id === challengeId) ??
      BUILDING_BLOCKS_CHALLENGES[0],
    [challengeId]
  );

  // Deterministic interleaved order so base cases and recursive steps are mixed
  const shuffledBlocks = useMemo(() => {
    const base = challenge.blocks.filter((b) => b.correctBucket === 'base-case');
    const rec = challenge.blocks.filter((b) => b.correctBucket === 'recursive-step');
    const mixed: BuildingBlockItem[] = [];
    const maxLen = Math.max(base.length, rec.length);
    for (let i = 0; i < maxLen; i++) {
      if (rec[i]) mixed.push(rec[i]);
      if (base[i]) mixed.push(base[i]);
    }
    return mixed;
  }, [challenge]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const bucket = String(over.id) as BlockBucket;
    if (bucket !== 'base-case' && bucket !== 'recursive-step') return;
    setAssignments((prev) => ({ ...prev, [String(active.id)]: bucket }));
    setChecked(false);
  };

  const handleQuickAssign = (blockId: string, bucket: BlockBucket) => {
    setAssignments((prev) => ({ ...prev, [blockId]: bucket }));
    setChecked(false);
  };

  const handleUnassign = (blockId: string) => {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
    setChecked(false);
  };

  const handleSwitchChallenge = (id: string) => {
    setChallengeId(id);
    setAssignments({});
    setChecked(false);
  };

  const unassignedBlocks = shuffledBlocks.filter((b) => !assignments[b.id]);
  const baseBucketBlocks = challenge.blocks.filter((b) => assignments[b.id] === 'base-case');
  const recBucketBlocks = challenge.blocks.filter((b) => assignments[b.id] === 'recursive-step');

  const placedCount = Object.keys(assignments).length;
  const correctCount = challenge.blocks.filter(
    (b) => assignments[b.id] === b.correctBucket
  ).length;
  const allPlaced = placedCount === challenge.blocks.length;

  return (
    <div className="space-y-4">
      {/* Sub-mode Toggle: Call Stack Visualizer vs Tree & Board Visualizer vs Building Blocks Challenge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 w-fit">
          <button
            type="button"
            onClick={() => setSection('call-stack')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'call-stack'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
            Call Stack Visualizer
          </button>
          <button
            type="button"
            onClick={() => setSection('tree-board')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'tree-board'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
            SVG Tree & Board Lab
          </button>
          <button
            type="button"
            onClick={() => setSection('blocks')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'blocks'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            Building Blocks Challenge
          </button>
        </div>
      </div>

      {section === 'call-stack' ? (
        <VisualSandbox curriculumModuleId={activeCurriculumTopicId ?? 'backtracking'} />
      ) : section === 'tree-board' ? (
        <RecursionBacktrackingVisualizer
          onOpenCurriculumModule={onOpenCurriculumModule}
          activeCurriculumTopicId={activeCurriculumTopicId}
        />
      ) : (
        /* Building Blocks Drag-and-Drop Challenge */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {BUILDING_BLOCKS_CHALLENGES.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleSwitchChallenge(ch.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                    challenge.id === ch.id
                      ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAssignments({});
                  setChecked(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Reset
              </button>
              <button
                type="button"
                onClick={() => setChecked(true)}
                disabled={placedCount === 0}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
              >
                Check Classification ({placedCount}/{challenge.blocks.length})
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">{challenge.subtitle}</p>

          {checked && (
            <div
              className={`rounded-xl border p-3 text-xs font-medium flex items-center justify-between gap-2 ${
                allPlaced && correctCount === challenge.blocks.length
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
              }`}
            >
              <span>
                {allPlaced && correctCount === challenge.blocks.length
                  ? `Perfect! All ${challenge.blocks.length} Base Case & Recursive Step blocks classified accurately.`
                  : `Score: ${correctCount} / ${challenge.blocks.length} correct. Review highlighted cards below to fix any misplaced guards or undo steps.`}
              </span>
            </div>
          )}

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {/* Unassigned Pool */}
            {unassignedBlocks.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                  Unassigned Building Blocks ({unassignedBlocks.length} remaining) — Drag into either bucket below
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unassignedBlocks.map((block) => (
                    <DraggableLogicCard
                      key={block.id}
                      block={block}
                      checked={false}
                      onQuickAssign={handleQuickAssign}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Two Target Buckets: Base Case vs Recursive Step */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BucketDropZone
                id="base-case"
                title="1. Base Cases & Pruning Guards"
                subtitle="Stopping conditions, leaf snapshots, and invalid-branch cutoffs"
                blocks={baseBucketBlocks}
                checked={checked}
                onUnassign={handleUnassign}
                onQuickAssign={handleQuickAssign}
              />
              <BucketDropZone
                id="recursive-step"
                title="2. Recursive Steps & State Undo"
                subtitle="Choose candidate, push recursive frame, and pop/unchoose on unwind"
                blocks={recBucketBlocks}
                checked={checked}
                onUnassign={handleUnassign}
                onQuickAssign={handleQuickAssign}
              />
            </div>
          </DndContext>
        </div>
      )}
    </div>
  );
}
