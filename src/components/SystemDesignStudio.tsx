import { useEffect, useState } from 'react';
import { SystemDesignLearningAcademy as SystemDesignLearningAcademyBase } from './SystemDesignLearningAcademy';
import { SystemDesignMasterRoadmap as SystemDesignMasterRoadmapBase } from './SystemDesignMasterRoadmap';
import { SystemPlayground as SystemPlaygroundBase } from './system-playground/SystemPlayground';
import { DatabaseVisualAnimator as DatabaseVisualAnimatorBase } from './database/DatabaseVisualAnimator';
import { VISUAL_FLOW_SCENARIOS } from '../data/databaseVisualData';
import { withStudioBoundary } from './hoc';
import { SegmentedTabBar } from './ui';
import { TopicBridgeBar } from './shared/TopicBridgeBar';

const SystemDesignLearningAcademy = withStudioBoundary(SystemDesignLearningAcademyBase, {
  studioName: 'System Design Deep Academy',
});
const SystemDesignMasterRoadmap = withStudioBoundary(SystemDesignMasterRoadmapBase, {
  studioName: 'System Design Master Roadmap',
});
const SystemPlayground = withStudioBoundary(SystemPlaygroundBase, {
  studioName: 'Live Traffic Playground',
});
const DatabaseVisualAnimator = withStudioBoundary(DatabaseVisualAnimatorBase, {
  studioName: 'Database DFD Visualization & Animations',
});
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
  Activity,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  Copy,
  Cpu,
  Database,
  Filter,
  Globe,
  GripVertical,
  Layers,
  LayoutGrid,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Scale,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  evaluateSystemArchitecture,
  SystemComponentBlock,
  SystemLayerId,
} from '../data/systemDesignData';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';

interface ComponentVisualMeta {
  icon: LucideIcon;
  categoryLabel: string;
  tileClass: string;
  labelClass: string;
}

const LAYER_VISUALS: Record<
  SystemLayerId,
  { icon: LucideIcon; tileClass: string; labelClass: string; shortTag: string }
> = {
  edge: {
    icon: Scale,
    tileClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    labelClass: 'text-sky-700 dark:text-sky-400',
    shortTag: 'Edge & Load Balancing',
  },
  compute: {
    icon: Server,
    tileClass:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    labelClass: 'text-indigo-700 dark:text-indigo-400',
    shortTag: 'Compute & API Tier',
  },
  cache_async: {
    icon: Zap,
    tileClass:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    labelClass: 'text-amber-700 dark:text-amber-400',
    shortTag: 'Caching & Async Layer',
  },
  storage: {
    icon: Database,
    tileClass:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    labelClass: 'text-emerald-700 dark:text-emerald-400',
    shortTag: 'Database & Sharding',
  },
};

const COMPONENT_VISUALS: Record<string, ComponentVisualMeta> = {
  cdn: {
    icon: Globe,
    categoryLabel: 'Edge CDN',
    tileClass: LAYER_VISUALS.edge.tileClass,
    labelClass: LAYER_VISUALS.edge.labelClass,
  },
  'load-balancer': {
    icon: Scale,
    categoryLabel: 'Load Balancer',
    tileClass: LAYER_VISUALS.edge.tileClass,
    labelClass: LAYER_VISUALS.edge.labelClass,
  },
  'rate-limiter': {
    icon: ShieldCheck,
    categoryLabel: 'Rate Limiter',
    tileClass: LAYER_VISUALS.edge.tileClass,
    labelClass: LAYER_VISUALS.edge.labelClass,
  },
  'api-gateway': {
    icon: Server,
    categoryLabel: 'API Compute',
    tileClass: LAYER_VISUALS.compute.tileClass,
    labelClass: LAYER_VISUALS.compute.labelClass,
  },
  'websocket-gw': {
    icon: Radio,
    categoryLabel: 'Realtime Gateway',
    tileClass: LAYER_VISUALS.compute.tileClass,
    labelClass: LAYER_VISUALS.compute.labelClass,
  },
  'redis-cache': {
    icon: Zap,
    categoryLabel: 'Caching Layer',
    tileClass: LAYER_VISUALS.cache_async.tileClass,
    labelClass: LAYER_VISUALS.cache_async.labelClass,
  },
  'bloom-filter': {
    icon: Filter,
    categoryLabel: 'Probabilistic Filter',
    tileClass: LAYER_VISUALS.cache_async.tileClass,
    labelClass: LAYER_VISUALS.cache_async.labelClass,
  },
  'kafka-queue': {
    icon: Workflow,
    categoryLabel: 'Message Queue',
    tileClass: LAYER_VISUALS.cache_async.tileClass,
    labelClass: LAYER_VISUALS.cache_async.labelClass,
  },
  'primary-db': {
    icon: Database,
    categoryLabel: 'Primary Database',
    tileClass: LAYER_VISUALS.storage.tileClass,
    labelClass: LAYER_VISUALS.storage.labelClass,
  },
  'read-replicas': {
    icon: Copy,
    categoryLabel: 'Read Replicas',
    tileClass: LAYER_VISUALS.storage.tileClass,
    labelClass: LAYER_VISUALS.storage.labelClass,
  },
  'consistent-sharding': {
    icon: LayoutGrid,
    categoryLabel: 'Database Sharding',
    tileClass: LAYER_VISUALS.storage.tileClass,
    labelClass: LAYER_VISUALS.storage.labelClass,
  },
};

function getComponentVisual(comp: SystemComponentBlock): ComponentVisualMeta {
  return (
    COMPONENT_VISUALS[comp.id] ?? {
      icon: LAYER_VISUALS[comp.layer].icon,
      categoryLabel: LAYER_VISUALS[comp.layer].shortTag,
      tileClass: LAYER_VISUALS[comp.layer].tileClass,
      labelClass: LAYER_VISUALS[comp.layer].labelClass,
    }
  );
}

function DraggableSysComponent({
  comp,
  isPlaced,
  onQuickAdd,
}: {
  comp: SystemComponentBlock;
  isPlaced: boolean;
  onQuickAdd: (c: SystemComponentBlock) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: comp.id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 40 : undefined,
      }
    : undefined;

  const visual = getComponentVisual(comp);
  const Icon = visual.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border p-2.5 transition-colors select-none ${
        isDragging
          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 shadow-lg opacity-90'
          : isPlaced
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-400'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          {...listeners}
          {...attributes}
          className="flex items-start gap-2 cursor-grab active:cursor-grabbing flex-1 min-w-0"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" aria-hidden="true" />
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${visual.tileClass}`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className={`text-[10px] font-mono font-semibold ${visual.labelClass}`}>
              {visual.categoryLabel}
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {comp.name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {comp.role}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onQuickAdd(comp)}
          disabled={isPlaced}
          title={isPlaced ? 'Already placed' : 'Add to architecture'}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-600 disabled:opacity-35 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function LayerDropZone({
  layer,
  components,
  onRemove,
}: {
  layer: { id: SystemLayerId; title: string; subtitle: string };
  components: SystemComponentBlock[];
  onRemove: (id: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `sys-layer-${layer.id}`,
    data: { layerId: layer.id },
  });

  const layerVisual = LAYER_VISUALS[layer.id];
  const LayerIcon = layerVisual.icon;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-4 transition-colors ${
        isOver
          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${layerVisual.tileClass}`}
          >
            <LayerIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
              {layer.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{layer.subtitle}</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
          {components.length} active
        </span>
      </div>

      {components.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          Drop {layer.title.split('.')[1]?.trim()} blocks here
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {components.map((comp) => {
            const compVis = getComponentVisual(comp);
            const CompIcon = compVis.icon;
            return (
              <div
                key={comp.id}
                className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${compVis.tileClass}`}
                  >
                    <CompIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[10px] font-mono font-semibold leading-none ${compVis.labelClass}`}>
                      {compVis.categoryLabel}
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {comp.name}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(comp.id)}
                  aria-label={`Remove ${comp.name}`}
                  className="text-slate-400 hover:text-rose-600 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Probabilistic Data Structures — Interactive Bloom Filter Lab
function ProbabilisticLab() {
  const [bits, setBits] = useState<number[]>(() => new Array(16).fill(0));
  const [insertedKeys, setInsertedKeys] = useState<string[]>([]);
  const [inputKey, setInputKey] = useState('user_42');
  const [queryKey, setQueryKey] = useState('user_42');
  const [lastHashes, setLastHashes] = useState<number[]>([]);

  const computeHashes = (key: string): number[] => {
    let h1 = 0;
    let h2 = 5381;
    let h3 = 7;
    for (let i = 0; i < key.length; i++) {
      const ch = key.charCodeAt(i);
      h1 = (h1 * 31 + ch) % 16;
      h2 = (h2 * 33 + ch) % 16;
      h3 = (h3 * 17 + ch * (i + 1)) % 16;
    }
    return Array.from(new Set([Math.abs(h1), Math.abs(h2), Math.abs(h3)]));
  };

  const handleInsert = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    const hashes = computeHashes(trimmed);
    setBits((prev) => {
      const next = [...prev];
      hashes.forEach((h) => (next[h] = 1));
      return next;
    });
    if (!insertedKeys.includes(trimmed)) {
      setInsertedKeys((prev) => [...prev, trimmed]);
    }
    setLastHashes(hashes);
    setQueryKey(trimmed);
  };

  const queryHashes = queryKey.trim() ? computeHashes(queryKey.trim()) : [];
  const allBitsSet = queryHashes.length > 0 && queryHashes.every((h) => bits[h] === 1);
  const actuallyInserted = insertedKeys.includes(queryKey.trim());
  const isFalsePositive = allBitsSet && !actuallyInserted;

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              PROBABILISTIC DATA STRUCTURES · INTERACTIVE BLOOM FILTER (m = 16 bits, k = 3 hashes)
            </p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Zero False Negatives · Sub-Millisecond Membership Guard
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setBits(new Array(16).fill(0));
              setInsertedKeys([]);
              setLastHashes([]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Bit Array
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
            <label htmlFor="bf-insert" className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              1. Insert Key into Bloom Filter
            </label>
            <div className="flex gap-2">
              <input
                id="bf-insert"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                placeholder="e.g. short_abc12"
              />
              <button
                type="button"
                onClick={handleInsert}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Hash & Insert
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Inserted set ({insertedKeys.length}): {insertedKeys.join(', ') || 'None yet'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
            <label htmlFor="bf-query" className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              2. Query Key Existence (Test False Positives!)
            </label>
            <input
              id="bf-query"
              type="text"
              value={queryKey}
              onChange={(e) => setQueryKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
              placeholder="Try unseen key like admin_99"
            />
            <div className="text-xs font-mono">
              {queryKey.trim() === '' ? (
                <span className="text-slate-400">Enter a key to test bit positions</span>
              ) : !allBitsSet ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  DEFINITELY NOT PRESENT (100% Certain — 0 DB calls needed)
                </span>
              ) : isFalsePositive ? (
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  FALSE POSITIVE! Bits [{queryHashes.join(', ')}] collided with prior inserts
                </span>
              ) : (
                <span className="text-sky-700 dark:text-sky-400 font-semibold">
                  PROBABLY PRESENT (Bits [{queryHashes.join(', ')}] all = 1)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 16-bit Array Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
          {bits.map((bit, idx) => {
            const isQueryHit = queryHashes.includes(idx);
            const isLastInsert = lastHashes.includes(idx);
            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-center font-mono ${
                  isQueryHit
                    ? bit === 1
                      ? 'border-sky-500 bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-100'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    : isLastInsert
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : bit === 1
                        ? 'border-slate-400 dark:border-slate-600 bg-slate-200/70 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="text-[10px] text-slate-400">{idx}</div>
                <div className="text-sm font-bold">{bit}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Companion Probabilistic Algorithms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: 'HyperLogLog (HLL)',
            problem: 'Count unique visitors (Cardinality) in 1.5 KB RAM',
            mechanism: 'Hashes items to binary and tracks longest run of leading zeros across buckets (2^maxZero estimate).',
            usedBy: 'Redis PFADD · BigQuery APPROX_COUNT_DISTINCT · Cloud monitoring',
          },
          {
            name: 'Count-Min Sketch',
            problem: 'Heavy-hitter frequency tracking in unbounded streams',
            mechanism: 'A d x w 2D counter grid with d hash functions; queries return min(row[h_i(x)]) to bound over-counting.',
            usedBy: 'Network packet inspection · Trending hashtags · DDoS detection',
          },
          {
            name: 'Reservoir Sampling (Algorithm R)',
            problem: 'Uniformly sample K items from an infinite stream of unknown length N',
            mechanism: 'Keep first K items; for item i > K, pick random j in [0..i] and replace reservoir[j] if j < K (prob K/i).',
            usedBy: 'A/B log sampling · Random Linked List Node (LC 382)',
          },
        ].map((card) => (
          <div
            key={card.name}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5"
          >
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {card.name}
            </h4>
            <p className="text-xs font-medium text-sky-700 dark:text-sky-400">{card.problem}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {card.mechanism}
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              {card.usedBy}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemDesignStudio() {
  const {
    data: {
      scenarios: SYSTEM_SCENARIOS,
      components: SYSTEM_COMPONENTS,
      layers: SYSTEM_LAYERS,
    },
  } = useAsyncCatalog('system-design-scenarios');
  const [subTab, setSubTab] = useState<
    'playground' | 'roadmap' | 'db-dfd' | 'builder' | 'animations' | 'probabilistic' | 'academy'
  >('playground');
  const [selectedDbFlowId, setSelectedDbFlowId] = useState<string>(VISUAL_FLOW_SCENARIOS[0].id);
  const [scenarioId, setScenarioId] = useState(SYSTEM_SCENARIOS[0].id);

  const scenario = SYSTEM_SCENARIOS.find((s) => s.id === scenarioId) ?? SYSTEM_SCENARIOS[0];

  // Builder state
  const [dauMillions, setDauMillions] = useState(scenario.defaultDauMillions);
  const [readWriteRatio, setReadWriteRatio] = useState(scenario.defaultReadWriteRatio);
  const [latencyBudgetMs, setLatencyBudgetMs] = useState(scenario.defaultLatencyBudgetMs);
  const [consistencyMode, setConsistencyMode] = useState<'availability' | 'strong-consistency'>('availability');
  const [placedIds, setPlacedIds] = useState<string[]>(['api-gateway', 'primary-db']);
  const [layerWarning, setLayerWarning] = useState<string | null>(null);

  // Animation state
  const [animStep, setAnimStep] = useState(0);
  const [animPlaying, setAnimPlaying] = useState(false);
  const [animSpeedMs, setAnimSpeedMs] = useState(1800);

  const handleSelectScenario = (id: string) => {
    const next = SYSTEM_SCENARIOS.find((s) => s.id === id) ?? SYSTEM_SCENARIOS[0];
    setScenarioId(id);
    setDauMillions(next.defaultDauMillions);
    setReadWriteRatio(next.defaultReadWriteRatio);
    setLatencyBudgetMs(next.defaultLatencyBudgetMs);
    setPlacedIds(['api-gateway', 'primary-db']);
    setLayerWarning(null);
    setAnimStep(0);
    setAnimPlaying(false);
  };

  useEffect(() => {
    if (!animPlaying) return;
    const timer = window.setInterval(() => {
      setAnimStep((prev) => (prev + 1) % scenario.animationSteps.length);
    }, animSpeedMs);
    return () => window.clearInterval(timer);
  }, [animPlaying, animSpeedMs, scenario.animationSteps.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const comp = SYSTEM_COMPONENTS.find((c) => c.id === String(active.id));
    const targetLayer = over.data.current?.layerId as SystemLayerId | undefined;
    if (!comp || !targetLayer) return;

    if (comp.layer !== targetLayer) {
      setLayerWarning(
        `${comp.name} operates in "${SYSTEM_LAYERS.find((l) => l.id === comp.layer)?.title}", not "${SYSTEM_LAYERS.find((l) => l.id === targetLayer)?.title}".`
      );
      return;
    }
    setLayerWarning(null);
    if (!placedIds.includes(comp.id)) {
      setPlacedIds((prev) => [...prev, comp.id]);
    }
  };

  const handleQuickAdd = (comp: SystemComponentBlock) => {
    setLayerWarning(null);
    if (!placedIds.includes(comp.id)) {
      setPlacedIds((prev) => [...prev, comp.id]);
    }
  };

  const evaluation = evaluateSystemArchitecture(
    scenario,
    { dauMillions, readWriteRatio, latencyBudgetMs, consistencyMode },
    placedIds
  );

  const currentAnimFrame = scenario.animationSteps[animStep] ?? scenario.animationSteps[0];

  return (
    <div className="space-y-6">
      {/* Studio Mode Switcher */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
            SYSTEM DESIGN & PROBABILISTIC STRUCTURES LAB
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Build, Stress-Test & Animate Production Architectures
          </h2>
        </div>

        <SegmentedTabBar
          ariaLabel="System Design Studio modes"
          activeTab={subTab}
          onChange={setSubTab}
          wrap
          tabs={[
            { id: 'playground', label: 'Live Traffic Playground' },
            { id: 'db-dfd', label: 'DB DFD & Animations', count: VISUAL_FLOW_SCENARIOS.length },
            { id: 'roadmap', label: 'Master Roadmap & Algos' },
            { id: 'builder', label: 'Tier Estimator' },
            { id: 'animations', label: 'System Animations' },
            { id: 'probabilistic', label: 'Probabilistic Lab' },
            { id: 'academy', label: 'Deep Academy' },
          ]}
        />
      </div>

      {/* Mode 0: Full Interactive React Flow System Design Playground & Live Traffic Simulator */}
      {subTab === 'playground' && <SystemPlayground />}

      {/* Mode 0B: Interactive Database DFD Visualizations, Animations & Plain-English Explanations */}
      {subTab === 'db-dfd' && (
        <DatabaseVisualAnimator
          selectedFlowId={selectedDbFlowId}
          onSelectFlowId={setSelectedDbFlowId}
        />
      )}

      {subTab !== 'playground' &&
        subTab !== 'db-dfd' &&
        subTab !== 'probabilistic' &&
        subTab !== 'academy' &&
        subTab !== 'roadmap' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SYSTEM_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc.id)}
              className={`p-4 rounded-xl border text-left transition-colors ${
                sc.id === scenario.id
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                {sc.companyFrequency}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {sc.title}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mode 1: Interactive Drag-and-Drop System Builder with Live Requirements Feedback */}
      {subTab === 'builder' && (
        <div className="space-y-5">
          {/* Interactive Traffic & Requirement Inputs */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                User Scale & SLA Inputs (Back-of-the-Envelope Estimator)
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Est. Avg: {evaluation.estimatedQps.toLocaleString()} QPS · Peak:{' '}
                {evaluation.estimatedPeakQps.toLocaleString()} QPS · Storage: {evaluation.dailyStorageGb} GB/day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="flex justify-between font-mono mb-1">
                  <label htmlFor="sys-dau">Daily Active Users</label>
                  <span className="font-semibold text-sky-700 dark:text-sky-400">{dauMillions}M</span>
                </div>
                <input
                  id="sys-dau"
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={dauMillions}
                  onChange={(e) => setDauMillions(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <label htmlFor="sys-rw">Read : Write Ratio</label>
                  <span className="font-semibold text-sky-700 dark:text-sky-400">{readWriteRatio}:1</span>
                </div>
                <input
                  id="sys-rw"
                  type="range"
                  min={1}
                  max={150}
                  step={5}
                  value={readWriteRatio}
                  onChange={(e) => setReadWriteRatio(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <label htmlFor="sys-lat">Max Latency SLA</label>
                  <span className="font-semibold text-sky-700 dark:text-sky-400">{latencyBudgetMs} ms</span>
                </div>
                <input
                  id="sys-lat"
                  type="range"
                  min={15}
                  max={120}
                  step={5}
                  value={latencyBudgetMs}
                  onChange={(e) => setLatencyBudgetMs(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <span className="font-mono block mb-1">CAP Priority</span>
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setConsistencyMode('availability')}
                    className={`flex-1 py-1 rounded text-[11px] font-semibold ${
                      consistencyMode === 'availability'
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100'
                        : 'text-slate-500'
                    }`}
                  >
                    High Availability
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsistencyMode('strong-consistency')}
                    className={`flex-1 py-1 rounded text-[11px] font-semibold ${
                      consistencyMode === 'strong-consistency'
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100'
                        : 'text-slate-500'
                    }`}
                  >
                    Strong Consistency
                  </button>
                </div>
              </div>
            </div>
          </div>

          {layerWarning && (
            <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{layerWarning}</span>
            </div>
          )}

          {/* 3-Column Drag & Drop Builder + Live Evaluator */}
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Component Palette */}
              <div className="lg:col-span-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 space-y-2.5">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Building Blocks
                </h4>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {SYSTEM_COMPONENTS.map((comp) => (
                    <DraggableSysComponent
                      key={comp.id}
                      comp={comp}
                      isPlaced={placedIds.includes(comp.id)}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </div>

              {/* Architecture Layers Canvas */}
              <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Your Architecture Canvas
                  </h4>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLayerWarning(null);
                        setPlacedIds(
                          Array.from(
                            new Set([
                              ...scenario.requiredComponents.map((r) => r.id),
                              ...scenario.recommendedComponents.map((r) => r.id),
                            ])
                          )
                        );
                      }}
                      className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                    >
                      Load Reference Architecture
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlacedIds([])}
                      className="text-xs font-mono text-slate-500 hover:text-rose-600 whitespace-nowrap"
                    >
                      Clear Canvas
                    </button>
                  </div>
                </div>

                {/* Visual Component Category Legend */}
                <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                  {[
                    { icon: Scale, label: 'Load Balancer', cls: LAYER_VISUALS.edge.labelClass },
                    { icon: Server, label: 'API Compute', cls: LAYER_VISUALS.compute.labelClass },
                    { icon: Zap, label: 'Caching Layer', cls: LAYER_VISUALS.cache_async.labelClass },
                    { icon: LayoutGrid, label: 'Database Sharding', cls: LAYER_VISUALS.storage.labelClass },
                  ].map((item) => {
                    const LegendIcon = item.icon;
                    return (
                      <span key={item.label} className={`inline-flex items-center gap-1 ${item.cls}`}>
                        <LegendIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.label}
                      </span>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  {SYSTEM_LAYERS.map((layer, idx) => (
                    <div key={layer.id} className="space-y-1.5">
                      <LayerDropZone
                        layer={layer}
                        components={SYSTEM_COMPONENTS.filter(
                          (c) => c.layer === layer.id && placedIds.includes(c.id)
                        )}
                        onRemove={(id) => setPlacedIds((prev) => prev.filter((x) => x !== id))}
                      />
                      {idx < SYSTEM_LAYERS.length - 1 && (
                        <div className="flex justify-center py-0.5 text-slate-300 dark:text-slate-700">
                          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-Time System Requirements & Improvement Analyzer */}
              <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    System Diagnostic Report
                  </h4>
                  <span
                    className={`text-xs font-mono font-bold ${
                      evaluation.status === 'OPTIMAL'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : evaluation.status === 'NEEDS_IMPROVEMENT'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {evaluation.scorePct}% · {evaluation.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  {evaluation.checks.map((chk) => (
                    <div
                      key={chk.label}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold">
                        <span className="text-slate-900 dark:text-slate-100">{chk.label}</span>
                        <span
                          className={`font-mono ${
                            chk.passed
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {chk.passed ? 'PASS' : 'MISSING'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        {chk.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {evaluation.improvements.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                    <div className="text-xs font-mono font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      RECOMMENDED IMPROVEMENTS
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {evaluation.improvements.map((imp) => (
                        <li key={imp}>• {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </DndContext>
        </div>
      )}

      {/* Mode 2: Interactive SVG System DFD & Packet Flow Simulator */}
      {subTab === 'animations' && (() => {
        const scenarioNodes = SYSTEM_COMPONENTS.filter(
          (c) =>
            scenario.requiredComponents.some((r) => r.id === c.id) ||
            scenario.recommendedComponents.some((r) => r.id === c.id) ||
            scenario.animationSteps.some((st) => st.activeNodes.includes(c.id))
        );
        const layerOrder: SystemLayerId[] = ['edge', 'compute', 'cache_async', 'storage'];
        const layerLabels: Record<SystemLayerId, string> = {
          edge: '1. Edge & Routing',
          compute: '2. API & Compute',
          cache_async: '3. Cache & Async',
          storage: '4. Database & Shards',
        };
        const positioned = scenarioNodes.map((node) => {
          const colIdx = layerOrder.indexOf(node.layer);
          const peersInCol = scenarioNodes.filter((n) => n.layer === node.layer);
          const rowIdx = peersInCol.findIndex((n) => n.id === node.id);
          const colX = 28 + colIdx * 218;
          const totalH = peersInCol.length * 74 + Math.max(0, peersInCol.length - 1) * 16;
          const startY = Math.max(48, (270 - totalH) / 2 + 16);
          const rowY = startY + rowIdx * 90;
          return { node, x: colX, y: rowY, w: 178, h: 64, colIdx };
        });

        const dfdLinks: { from: typeof positioned[number]; to: typeof positioned[number]; active: boolean }[] = [];
        for (let i = 0; i < layerOrder.length - 1; i++) {
          const srcNodes = positioned.filter((p) => p.colIdx === i);
          const dstNodes = positioned.filter((p) => p.colIdx === i + 1);
          srcNodes.forEach((s) => {
            dstNodes.forEach((d) => {
              const bothActive =
                currentAnimFrame.activeNodes.includes(s.node.id) &&
                currentAnimFrame.activeNodes.includes(d.node.id);
              dfdLinks.push({ from: s, to: d, active: bothActive });
            });
          });
        }

        const totalLatency =
          scenario.animationSteps[scenario.animationSteps.length - 1]?.latencyMs ||
          currentAnimFrame.latencyMs ||
          1;
        const latencyPct = Math.min(100, Math.round((currentAnimFrame.latencyMs / totalLatency) * 100));

        return (
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono text-sky-700 dark:text-sky-400">
                  Interactive System Architecture DFD · {scenario.title}
                </p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Step {currentAnimFrame.step}/{scenario.animationSteps.length}: {currentAnimFrame.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {currentAnimFrame.packetNote}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold mr-1 tabular-nums">
                  Elapsed: {currentAnimFrame.latencyMs} ms ({latencyPct}%)
                </span>
                <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-0.5 text-[11px] font-mono">
                  {[
                    { label: '0.5×', ms: 2800 },
                    { label: '1×', ms: 1800 },
                    { label: '2×', ms: 950 },
                  ].map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => setAnimSpeedMs(sp.ms)}
                      className={`px-2 py-1 rounded ${
                        animSpeedMs === sp.ms
                          ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAnimPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
                >
                  {animPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {animPlaying ? 'Pause DFD' : 'Animate Flow'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnimPlaying(false);
                    setAnimStep((s) => (s + 1) % scenario.animationSteps.length);
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Next Hop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnimPlaying(false);
                    setAnimStep(0);
                  }}
                  aria-label="Reset animation to step 1"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Step Scrubber Timeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {scenario.animationSteps.map((st, idx) => {
                const isCurr = idx === animStep;
                const isPast = idx < animStep;
                return (
                  <button
                    key={st.step}
                    type="button"
                    onClick={() => {
                      setAnimPlaying(false);
                      setAnimStep(idx);
                    }}
                    className={`rounded-lg border p-2.5 text-left transition-colors ${
                      isCurr
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40'
                        : isPast
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>Step {st.step}</span>
                      <span>{st.latencyMs} ms</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {st.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Layered SVG Data Flow Diagram (Edge -> Compute -> Cache/Async -> Storage) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 overflow-x-auto">
              <svg
                viewBox="0 0 900 310"
                className="w-full min-w-[720px] h-auto"
                role="img"
                aria-label={`Animated request flow DFD for ${scenario.title}`}
              >
                <defs>
                  <marker
                    id="sys-dfd-arrow-muted"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-300 dark:fill-slate-700" />
                  </marker>
                  <marker
                    id="sys-dfd-arrow-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
                  </marker>
                </defs>

                {/* Tier Swimlane Headers */}
                {layerOrder.map((layerId, i) => (
                  <g key={layerId}>
                    <rect
                      x={18 + i * 218}
                      y={10}
                      width={198}
                      height={286}
                      rx={10}
                      className="fill-white/60 dark:fill-slate-900/40 stroke-slate-200 dark:stroke-slate-800"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={117 + i * 218}
                      y={28}
                      textAnchor="middle"
                      className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono font-semibold"
                    >
                      {layerLabels[layerId]}
                    </text>
                  </g>
                ))}

                {/* Directional DFD Edges */}
                {dfdLinks.map((lnk, idx) => {
                  const x1 = lnk.from.x + lnk.from.w;
                  const y1 = lnk.from.y + lnk.from.h / 2;
                  const x2 = lnk.to.x - 4;
                  const y2 = lnk.to.y + lnk.to.h / 2;
                  const pathD = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
                  return (
                    <g key={idx}>
                      <path
                        d={pathD}
                        fill="none"
                        strokeWidth={lnk.active ? 2.6 : 1.2}
                        className={
                          lnk.active
                            ? 'stroke-sky-600 dark:stroke-sky-400'
                            : 'stroke-slate-300 dark:stroke-slate-700'
                        }
                        markerEnd={
                          lnk.active ? 'url(#sys-dfd-arrow-active)' : 'url(#sys-dfd-arrow-muted)'
                        }
                      />
                      {lnk.active && (
                        <circle r={4.5} className="fill-sky-500 dark:fill-sky-300">
                          <animateMotion dur="1.1s" repeatCount="indefinite" path={pathD} />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Architecture Nodes */}
                {positioned.map(({ node, x, y, w, h }) => {
                  const active = currentAnimFrame.activeNodes.includes(node.id);
                  const vis = getComponentVisual(node);
                  return (
                    <g key={node.id}>
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        rx={10}
                        strokeWidth={active ? 2.4 : 1.2}
                        className={
                          active
                            ? 'fill-sky-600 dark:fill-sky-500 stroke-sky-700 dark:stroke-sky-300'
                            : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                        }
                      />
                      <text
                        x={x + 12}
                        y={y + 20}
                        className={`text-[9px] font-mono font-semibold ${
                          active
                            ? 'fill-sky-100 dark:fill-slate-900'
                            : 'fill-slate-500 dark:fill-slate-400'
                        }`}
                      >
                        {vis.categoryLabel}
                      </text>
                      <text
                        x={x + 12}
                        y={y + 39}
                        className={`text-[12px] font-semibold ${
                          active
                            ? 'fill-white dark:fill-slate-950'
                            : 'fill-slate-900 dark:fill-slate-100'
                        }`}
                      >
                        {node.name.length > 22 ? `${node.name.slice(0, 21)}…` : node.name}
                      </text>
                      <text
                        x={x + 12}
                        y={y + 54}
                        className={`text-[9px] font-mono ${
                          active
                            ? 'fill-sky-100 dark:fill-slate-900'
                            : 'fill-slate-500 dark:fill-slate-400'
                        }`}
                      >
                        {active ? 'ACTIVE HOP' : 'STANDBY'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Plain-English + Standard Architect Explanation & Active Node Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  What Happens at This Hop (Plain English)
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentAnimFrame.packetNote}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Active Components &amp; Latency Budget
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Active nodes:{' '}
                  <span className="font-mono text-sky-700 dark:text-sky-400">
                    {currentAnimFrame.activeNodes.join(' → ')}
                  </span>
                  . Cumulative end-to-end latency is{' '}
                  <span className="font-mono font-semibold tabular-nums">
                    {currentAnimFrame.latencyMs} ms
                  </span>{' '}
                  against the scenario SLA budget of{' '}
                  <span className="font-mono font-semibold tabular-nums">
                    {scenario.defaultLatencyBudgetMs} ms
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {scenarioNodes.map((node) => {
                const active = currentAnimFrame.activeNodes.includes(node.id);
                const nodeVisual = getComponentVisual(node);
                const NodeIcon = nodeVisual.icon;
                return (
                  <div
                    key={node.id}
                    className={`p-4 rounded-xl border transition-all ${
                      active
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${nodeVisual.tileClass}`}
                        >
                          <NodeIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <span className={`text-[11px] font-mono font-semibold truncate ${nodeVisual.labelClass}`}>
                          {nodeVisual.categoryLabel}
                        </span>
                      </div>
                      {active && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {node.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{node.role}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Mode 0: System Design & Distributed Algorithms Master Roadmap */}
      {subTab === 'roadmap' && <SystemDesignMasterRoadmap />}

      {/* Mode 3: Probabilistic Data Structures Lab */}
      {subTab === 'probabilistic' && <ProbabilisticLab />}

      {/* Mode 4: Deep System Design Learning Academy */}
      {subTab === 'academy' && <SystemDesignLearningAcademy />}

      <TopicBridgeBar studioId="system-design" />
    </div>
  );
}
