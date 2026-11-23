import { useEffect, useMemo, useState } from 'react';
import { SystemDesignLearningAcademy as SystemDesignLearningAcademyBase } from './SystemDesignLearningAcademy';
import { SystemDesignMasterRoadmap as SystemDesignMasterRoadmapBase } from './SystemDesignMasterRoadmap';
import { SystemPlayground as SystemPlaygroundBase } from './system-playground/SystemPlayground';
import { DatabaseVisualAnimator as DatabaseVisualAnimatorBase } from './database/DatabaseVisualAnimator';
import { SystemDfdSimulator as SystemDfdSimulatorBase } from './system-design/SystemDfdSimulator';
import { RealWorldArchitecturesAndInterviewLab as RealWorldArchitecturesAndInterviewLabBase } from './system-design/RealWorldArchitecturesAndInterviewLab';
import { InteractiveSystemMermaidFlows as InteractiveSystemMermaidFlowsBase } from './system-design/InteractiveSystemMermaidFlows';
import { FrontierLlmArchitectureLab as FrontierLlmArchitectureLabBase } from './system-design/FrontierLlmArchitectureLab';
import {
  ArchitectureExplainerSidebar,
  type ActiveArchitecturePayload,
} from './system-design/ArchitectureExplainerSidebar';
import { VISUAL_FLOW_SCENARIOS } from '../data/databaseVisualData';
import { SYSTEM_DFD_PATTERNS } from '../data/systemDfdLibraryData';
import { REAL_WORLD_SYSTEM_BLUEPRINTS } from '../data/realWorldSystemBlueprintsData';
import { getBlueprintDeepSpec } from '../data/realWorldBlueprintMermaidDfdData';
import { SYSTEM_DESIGN_MERMAID_BLUEPRINTS } from '../data/systemDesignMermaidFlowsData';
import {
  FRONTIER_LLM_PLATFORMS,
  type FrontierLlmPlatformId,
} from '../data/llmFrontierArchitectureData';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { useSystemStore } from '../store/useSystemStore';
import { withStudioBoundary } from './hoc';
import { SegmentedTabBar } from './ui';
import { TopicBridgeBar } from './shared/TopicBridgeBar';
import { LiveTrafficFlowSimulator } from './shared/LiveTrafficFlowSimulator';
import {
  buildTrafficTopologyFromPlayground,
  LIVE_TRAFFIC_PRESETS,
  parseMermaidToTrafficTopology,
  type TrafficTopology,
} from '../utils/liveTrafficTopology';

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
const SystemDfdSimulator = withStudioBoundary(SystemDfdSimulatorBase, {
  studioName: 'Interactive System Design DFD Simulator',
});
const RealWorldArchitecturesAndInterviewLab = withStudioBoundary(
  RealWorldArchitecturesAndInterviewLabBase,
  {
    studioName: 'Real-World Blueprints, Protocols & Mock Interview Lab',
  }
);
const InteractiveSystemMermaidFlows = withStudioBoundary(InteractiveSystemMermaidFlowsBase, {
  studioName: 'Interactive System Design Mermaid Flows',
});
const FrontierLlmArchitectureLab = withStudioBoundary(FrontierLlmArchitectureLabBase, {
  studioName: 'ChatGPT, Gemini & Claude Architecture Internals Lab',
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
  ArrowRight,
  CheckCircle2,
  Code2,
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
  X,
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

const SCENARIO_TO_DFD_PATTERN: Record<string, string> = {
  'url-shortener': 'bloom-url-shortener',
  'social-feed': 'cache-aside-read',
  'distributed-rate-limiter': 'rate-limiter-gateway',
  'realtime-chat': 'realtime-chat-fanout',
};

export interface SystemDesignStudioProps {
  onOpenLabProblem?: (problemId: string) => void;
}

export function SystemDesignStudio({ onOpenLabProblem }: SystemDesignStudioProps) {
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);

  const {
    data: {
      scenarios: SYSTEM_SCENARIOS,
      components: SYSTEM_COMPONENTS,
      layers: SYSTEM_LAYERS,
    },
  } = useAsyncCatalog('system-design-scenarios');
  const [subTab, setSubTab] = useState<
    | 'mermaid-flows'
    | 'llm-internals'
    | 'real-world-interview'
    | 'playground'
    | 'dfd-simulator'
    | 'db-dfd'
    | 'roadmap'
    | 'builder'
    | 'animations'
    | 'probabilistic'
    | 'academy'
  >('mermaid-flows');
  const [selectedDfdPatternId, setSelectedDfdPatternId] = useState<string>(SYSTEM_DFD_PATTERNS[0].id);
  const [selectedDbFlowId, setSelectedDbFlowId] = useState<string>(VISUAL_FLOW_SCENARIOS[0].id);
  const [selectedMermaidArchId, setSelectedMermaidArchId] = useState<string>(
    SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0].id
  );
  const [selectedLlmPlatformId, setSelectedLlmPlatformId] =
    useState<FrontierLlmPlatformId>('chatgpt');
  const [selectedRealWorldId, setSelectedRealWorldId] = useState<string>(
    REAL_WORLD_SYSTEM_BLUEPRINTS[0].id
  );
  const [explainerOpen, setExplainerOpen] = useState<boolean>(false);
  const [explainTriggerCount, setExplainTriggerCount] = useState<number>(0);
  const [showLiveTrafficWidget, setShowLiveTrafficWidget] = useState<boolean>(true);
  const [flowSimActive, setFlowSimActive] = useState<boolean>(false);
  const [flowSimSignal, setFlowSimSignal] = useState<number>(0);
  const [flowSimStepIdx, setFlowSimStepIdx] = useState<number>(0);

  const playgroundNodes = useSystemStore((s) => s.nodes);
  const playgroundEdges = useSystemStore((s) => s.edges);
  const playgroundBlueprintId = useSystemStore((s) => s.activeBlueprintId);
  const playgroundBaseRps = useSystemStore((s) => s.baseEntryRps);
  const playgroundIsSimulating = useSystemStore((s) => s.isSimulating);
  const togglePlaygroundSimulation = useSystemStore((s) => s.toggleSimulation);
  const highlightPlaygroundNodes = useSystemStore((s) => s.highlightNodes);

  const [roadmapExternalModuleId, setRoadmapExternalModuleId] = useState<string | null>(null);
  const [academyExternalTarget, setAcademyExternalTarget] = useState<{
    categoryId: string;
    topicId: string;
  } | null>(null);
  const [scenarioId, setScenarioId] = useState(SYSTEM_SCENARIOS[0].id);

  const scenario = SYSTEM_SCENARIOS.find((s) => s.id === scenarioId) ?? SYSTEM_SCENARIOS[0];
  const matchedScenarioDfd =
    SYSTEM_DFD_PATTERNS.find((p) => p.id === (SCENARIO_TO_DFD_PATTERN[scenario.id] ?? 'cache-aside-read')) ??
    SYSTEM_DFD_PATTERNS[0];

  const handleOpenDfdPattern = (patternId: string) => {
    setSelectedDfdPatternId(patternId);
    setSubTab('dfd-simulator');
  };

  const handleOpenRoadmapModule = (moduleId: string) => {
    setRoadmapExternalModuleId(moduleId);
    setSubTab('roadmap');
  };

  const handleOpenAcademyTopic = (categoryId: string, topicId: string) => {
    setAcademyExternalTarget({ categoryId, topicId });
    setSubTab('academy');
  };

  const handleOpenDbFlow = (flowId: string) => {
    setSelectedDbFlowId(flowId);
    setSubTab('db-dfd');
  };

  const handleOpenProblem = (problemId: string) => {
    if (onOpenLabProblem) {
      onOpenLabProblem(problemId);
      return;
    }
    selectProblem(problemId);
    setActiveView('workspace');
  };

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

  const activeArchitecture = useMemo<ActiveArchitecturePayload>(() => {
    if (subTab === 'llm-internals') {
      const platform =
        FRONTIER_LLM_PLATFORMS.find((p) => p.id === selectedLlmPlatformId) ??
        FRONTIER_LLM_PLATFORMS[0];
      return {
        id: `llm:${platform.id}`,
        architectureTitle: `${platform.name} (${platform.vendor}) — Inference & Token-Streaming Architecture`,
        sourceWorkspace: 'ChatGPT, Gemini & Claude Internals',
        domain: platform.flagshipStack,
        scaleContext: `${platform.contextAndCacheSpec.split('.')[0]} · ${platform.streamingProtocolSpec.split('.')[0]}`,
        summary: platform.formalDefinition,
        components: [
          `Hardware Fabric: ${platform.hardwareFabric}`,
          `Tokenizer: ${platform.tokenizerSpec}`,
          `Context & KV Cache: ${platform.contextAndCacheSpec}`,
          `Client Streaming Protocol: ${platform.streamingProtocolSpec}`,
          `Safety & Tooling: ${platform.safetyAndToolingSpec}`,
        ],
        connections: platform.flowSteps.map(
          (st) =>
            `Hop ${st.step} [${st.layer} · ${st.latencyMs}ms] ${st.phase}: ${st.summary} — ${st.internalLogic}`
        ),
        mermaidDiagram: platform.buildArchitectureMermaid(null, []),
      };
    }

    if (subTab === 'mermaid-flows') {
      const arch =
        SYSTEM_DESIGN_MERMAID_BLUEPRINTS.find((b) => b.id === selectedMermaidArchId) ??
        SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0];
      return {
        id: `mermaid:${arch.id}`,
        architectureTitle: arch.name,
        sourceWorkspace: 'Interactive Mermaid Flows',
        domain: arch.domain,
        scaleContext: arch.scaleTarget,
        summary: arch.summary,
        components: arch.nodes.map(
          (n) => `${n.label} [${n.layer}] (${n.tech}) — ${n.role} (Algorithms: ${n.keyAlgorithms.join(', ')})`
        ),
        connections: arch.nodes.flatMap((n) =>
          n.connections.map((c) => `${n.label} (${c.direction} -> ${c.peer}, ${c.protocol}): ${c.detail}`)
        ),
        mermaidDiagram: arch.expandedFullMermaid,
      };
    }

    if (subTab === 'real-world-interview') {
      const bp =
        REAL_WORLD_SYSTEM_BLUEPRINTS.find((b) => b.id === selectedRealWorldId) ??
        REAL_WORLD_SYSTEM_BLUEPRINTS[0];
      const deepSpec = getBlueprintDeepSpec(bp);
      return {
        id: `realworld:${bp.id}`,
        architectureTitle: bp.title,
        sourceWorkspace: 'Real-World Blueprints & Mock Interview',
        domain: bp.domain,
        scaleContext: bp.scaleBadge,
        summary: `${deepSpec.formalDefinition} ${bp.architectureSummary}`,
        components: [
          ...bp.dfdNodes.map((n) => `${n.label}: ${n.sublabel}`),
          ...bp.dbTables.map((t) => `DB Table ${t.tableName} (${t.engine}, shard/partition: ${t.partitionOrShardKey})`),
        ],
        connections: bp.dfdSteps.map(
          (st) => `Step ${st.step} [${st.packetLabel}] — ${st.title}: ${st.technicalDetail}`
        ),
        mermaidDiagram: deepSpec.systemDfdMermaid,
      };
    }

    if (subTab === 'dfd-simulator') {
      const pat =
        SYSTEM_DFD_PATTERNS.find((p) => p.id === selectedDfdPatternId) ?? SYSTEM_DFD_PATTERNS[0];
      return {
        id: `dfd:${pat.id}`,
        architectureTitle: pat.title,
        sourceWorkspace: 'System DFD Simulator',
        domain: pat.category,
        scaleContext: `${pat.difficulty} · ${pat.fastPathLabel} vs. ${pat.deepPathLabel}`,
        summary: `${pat.plainEnglishSummary} ${pat.standardDefinition}`,
        components: pat.nodes.map((n) => `${n.label} [${n.tier}]: ${n.sublabel}`),
        connections: [...pat.fastPathSteps, ...pat.deepPathSteps].map(
          (st) => `Step ${st.step} [${st.packetLabel}] ${st.title}: ${st.plainEnglish}`
        ),
      };
    }

    if (subTab === 'playground') {
      const nodeLabelById = new Map(
        playgroundNodes.map((n) => [n.id, `${n.data.label} (${n.data.componentType})`])
      );
      return {
        id: `playground:${playgroundBlueprintId ?? 'custom'}:${playgroundNodes.length}:${playgroundEdges.length}`,
        architectureTitle: playgroundBlueprintId
          ? `Live Playground — ${playgroundBlueprintId.replace(/-/g, ' ')}`
          : 'Live Traffic Playground Custom Topology',
        sourceWorkspace: 'Live Traffic Playground',
        scaleContext: `${playgroundNodes.length} nodes · ${playgroundEdges.length} edges`,
        summary:
          'Interactive user-wired distributed system topology running live traffic and bottleneck simulation.',
        components: playgroundNodes.map(
          (n) => `${n.data.label} (${n.data.componentType}, ${n.data.replicas} replicas)`
        ),
        connections: playgroundEdges.map((e) => {
          const src = nodeLabelById.get(e.source) ?? e.source;
          const dst = nodeLabelById.get(e.target) ?? e.target;
          return `${src} -> ${dst}`;
        }),
      };
    }

    if (subTab === 'db-dfd') {
      const dbFlow =
        VISUAL_FLOW_SCENARIOS.find((f) => f.id === selectedDbFlowId) ?? VISUAL_FLOW_SCENARIOS[0];
      return {
        id: `db-dfd:${dbFlow.id}`,
        architectureTitle: dbFlow.title,
        sourceWorkspace: 'DB DFD & Animations',
        domain: dbFlow.category,
        scaleContext: `${dbFlow.algorithmName} (${dbFlow.complexity})`,
        summary: `${dbFlow.simpleSummary} ${dbFlow.standardDefinition}`,
        components: dbFlow.nodes.map((n) => `${n.label} [${n.kind}]: ${n.sublabel}`),
        connections: dbFlow.steps.map(
          (st) => `Step ${st.stepNumber} [${st.metricTag}] ${st.title}: ${st.algorithmDetail}`
        ),
      };
    }

    const placedBlocks = placedIds
      .map((id) => SYSTEM_COMPONENTS.find((c) => c.id === id))
      .filter((c): c is SystemComponentBlock => Boolean(c));

    return {
      id: `scenario:${scenario.id}:${placedIds.join(',')}`,
      architectureTitle: scenario.title,
      sourceWorkspace:
        subTab === 'animations'
          ? 'System Animations'
          : subTab === 'builder'
            ? 'Tier Estimator & Builder'
            : 'System Design Studio',
      domain: scenario.companyFrequency,
      scaleContext: `${dauMillions}M DAU · ${readWriteRatio}:1 R/W · ${latencyBudgetMs}ms SLA (${consistencyMode})`,
      summary: scenario.summary,
      components: placedBlocks.map((b) => `${b.name} [${b.layer}]: ${b.role}`),
      connections: scenario.animationSteps.map(
        (st) => `Step ${st.step} (${st.latencyMs}ms) ${st.title} [${st.activeNodes.join(' -> ')}]: ${st.packetNote}`
      ),
    };
  }, [
    subTab,
    selectedLlmPlatformId,
    selectedMermaidArchId,
    selectedRealWorldId,
    selectedDfdPatternId,
    selectedDbFlowId,
    playgroundNodes,
    playgroundEdges,
    playgroundBlueprintId,
    scenario,
    placedIds,
    SYSTEM_COMPONENTS,
    dauMillions,
    readWriteRatio,
    latencyBudgetMs,
    consistencyMode,
  ]);

  // Dynamically derive a Live Traffic Topology from whichever architectural pattern is currently selected
  const syncedTrafficTopology = useMemo<TrafficTopology>(() => {
    if (subTab === 'llm-internals') {
      const llmPreset = LIVE_TRAFFIC_PRESETS.find((p) => p.id === 'llm-token-streaming');
      if (activeArchitecture.mermaidDiagram) {
        const parsed = parseMermaidToTrafficTopology(
          activeArchitecture.mermaidDiagram,
          activeArchitecture.architectureTitle,
          'system-design',
          activeArchitecture.scaleContext
        );
        if (parsed) return parsed;
      }
      return llmPreset ?? LIVE_TRAFFIC_PRESETS[0];
    }

    if (subTab === 'playground') {
      const pg = buildTrafficTopologyFromPlayground(
        playgroundNodes,
        playgroundEdges,
        activeArchitecture.architectureTitle,
        playgroundBaseRps
      );
      if (pg) return pg;
    }

    if (subTab === 'db-dfd') {
      return (
        LIVE_TRAFFIC_PRESETS.find((p) => p.id === 'db-pgbouncer-shards') ??
        LIVE_TRAFFIC_PRESETS[0]
      );
    }

    if (activeArchitecture.mermaidDiagram) {
      const parsed = parseMermaidToTrafficTopology(
        activeArchitecture.mermaidDiagram,
        activeArchitecture.architectureTitle,
        'system-design',
        activeArchitecture.scaleContext
      );
      if (parsed) return parsed;
    }

    if (subTab === 'dfd-simulator') {
      const pat =
        SYSTEM_DFD_PATTERNS.find((p) => p.id === selectedDfdPatternId) ?? SYSTEM_DFD_PATTERNS[0];
      if (pat.category.toLowerCase().includes('event') || pat.id.includes('kafka') || pat.id.includes('saga')) {
        return LIVE_TRAFFIC_PRESETS.find((p) => p.id === 'event-driven-kafka') ?? LIVE_TRAFFIC_PRESETS[0];
      }
      if (pat.id.includes('multi-region') || pat.id.includes('geo')) {
        return LIVE_TRAFFIC_PRESETS.find((p) => p.id === 'multi-region-active-active') ?? LIVE_TRAFFIC_PRESETS[0];
      }
    }

    return LIVE_TRAFFIC_PRESETS[0];
  }, [
    subTab,
    activeArchitecture,
    playgroundNodes,
    playgroundEdges,
    playgroundBaseRps,
    selectedDfdPatternId,
  ]);

  const flowSimHops = useMemo<
    { id: string; label: string; badge: string; detail: string }[]
  >(() => {
    if (subTab === 'llm-internals') {
      const platform =
        FRONTIER_LLM_PLATFORMS.find((p) => p.id === selectedLlmPlatformId) ??
        FRONTIER_LLM_PLATFORMS[0];
      return platform.flowSteps.map((st) => ({
        id: st.nodeId,
        label: st.phase,
        badge: `${st.layer} · ${st.latencyMs}ms`,
        detail: `${st.summary} (${st.internalLogic})`,
      }));
    }
    if (subTab === 'mermaid-flows') {
      const arch =
        SYSTEM_DESIGN_MERMAID_BLUEPRINTS.find((b) => b.id === selectedMermaidArchId) ??
        SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0];
      return arch.walkthroughOrder.map((nodeId) => {
        const node = arch.nodes.find((n) => n.id === nodeId);
        return {
          id: nodeId,
          label: node?.label ?? nodeId,
          badge: node ? `${node.layer} · ${node.latencyBudget}` : 'Hop',
          detail: node?.role ?? 'Traversing architecture hop.',
        };
      });
    }
    if (subTab === 'real-world-interview') {
      const bp =
        REAL_WORLD_SYSTEM_BLUEPRINTS.find((b) => b.id === selectedRealWorldId) ??
        REAL_WORLD_SYSTEM_BLUEPRINTS[0];
      return bp.dfdSteps.map((st) => ({
        id: `rw-${st.step}`,
        label: st.title,
        badge: st.packetLabel,
        detail: st.technicalDetail,
      }));
    }
    if (subTab === 'dfd-simulator') {
      const pat =
        SYSTEM_DFD_PATTERNS.find((p) => p.id === selectedDfdPatternId) ?? SYSTEM_DFD_PATTERNS[0];
      return pat.fastPathSteps.map((st) => ({
        id: `dfd-${st.step}`,
        label: st.title,
        badge: st.packetLabel,
        detail: st.plainEnglish,
      }));
    }
    if (subTab === 'db-dfd') {
      const dbFlow =
        VISUAL_FLOW_SCENARIOS.find((f) => f.id === selectedDbFlowId) ?? VISUAL_FLOW_SCENARIOS[0];
      return dbFlow.steps.map((st) => ({
        id: `db-${st.stepNumber}`,
        label: st.title,
        badge: st.metricTag,
        detail: st.algorithmDetail,
      }));
    }
    if (subTab === 'playground' && playgroundNodes.length > 0) {
      return playgroundNodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        badge: `${n.data.componentType} · ${n.data.replicas}x`,
        detail: `Routing live simulated traffic across ${n.data.label} (${n.data.componentType}).`,
      }));
    }
    return scenario.animationSteps.map((st) => ({
      id: `sc-${st.step}`,
      label: st.title,
      badge: `${st.latencyMs}ms`,
      detail: st.packetNote,
    }));
  }, [
    subTab,
    selectedLlmPlatformId,
    selectedMermaidArchId,
    selectedRealWorldId,
    selectedDfdPatternId,
    selectedDbFlowId,
    playgroundNodes,
    scenario,
  ]);

  useEffect(() => {
    setFlowSimStepIdx(0);
  }, [subTab, activeArchitecture.id]);

  useEffect(() => {
    if (!flowSimActive || flowSimHops.length === 0) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setFlowSimStepIdx((prev) => (prev + 1) % flowSimHops.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [flowSimActive, flowSimHops.length]);

  const activeSimHop = flowSimHops[flowSimStepIdx] ?? flowSimHops[0];

  useEffect(() => {
    if (subTab !== 'playground') return;
    if (flowSimActive && activeSimHop) {
      highlightPlaygroundNodes([activeSimHop.id]);
    } else {
      highlightPlaygroundNodes([]);
    }
  }, [subTab, flowSimActive, activeSimHop, highlightPlaygroundNodes]);

  const handleTriggerSimulateDataFlow = () => {
    if (flowSimActive) {
      setFlowSimActive(false);
      if (subTab === 'playground') {
        if (playgroundIsSimulating) togglePlaygroundSimulation();
        highlightPlaygroundNodes([]);
      }
      if (subTab === 'animations') setAnimPlaying(false);
      return;
    }
    setFlowSimStepIdx(0);
    setFlowSimActive(true);
    setFlowSimSignal((prev) => prev + 1);
    if (subTab === 'playground' && !playgroundIsSimulating) {
      togglePlaygroundSimulation();
    }
    if (subTab === 'animations') {
      setAnimStep(0);
      setAnimPlaying(true);
    }
  };

  const handleOpenExplainArchitecture = () => {
    setExplainerOpen(true);
    setExplainTriggerCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Studio Mode Switcher */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              SYSTEM DESIGN &amp; PROBABILISTIC STRUCTURES LAB
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Build, Stress-Test &amp; Animate Production Architectures
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
            <button
              type="button"
              onClick={() => setShowLiveTrafficWidget((v) => !v)}
              aria-pressed={showLiveTrafficWidget}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                showLiveTrafficWidget
                  ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-sky-500'
              }`}
            >
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              {showLiveTrafficWidget ? 'Hide Traffic Visualizer' : 'Live Traffic Visualizer'}
            </button>

            <button
              type="button"
              onClick={handleTriggerSimulateDataFlow}
              aria-pressed={flowSimActive}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                flowSimActive
                  ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'
              }`}
            >
              {flowSimActive ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {flowSimActive ? 'Stop Data Flow' : 'Simulate Data Flow'}
            </button>

            <button
              type="button"
              onClick={handleOpenExplainArchitecture}
              aria-expanded={explainerOpen}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Explain Architecture
            </button>
          </div>
        </div>

        <SegmentedTabBar
          ariaLabel="System Design Studio modes"
          activeTab={subTab}
          onChange={setSubTab}
          wrap
          tabs={[
            {
              id: 'mermaid-flows',
              label: 'Interactive Mermaid Flows',
              count: SYSTEM_DESIGN_MERMAID_BLUEPRINTS.length,
            },
            {
              id: 'llm-internals',
              label: 'ChatGPT, Gemini & Claude Internals',
              count: FRONTIER_LLM_PLATFORMS.length,
            },
            {
              id: 'real-world-interview',
              label: 'Real-World Blueprints & Mock Interview',
              count: REAL_WORLD_SYSTEM_BLUEPRINTS.length,
            },
            { id: 'dfd-simulator', label: 'System DFD Simulator', count: SYSTEM_DFD_PATTERNS.length },
            { id: 'playground', label: 'Live Traffic Playground' },
            { id: 'db-dfd', label: 'DB DFD & Animations', count: VISUAL_FLOW_SCENARIOS.length },
            { id: 'roadmap', label: 'Master Roadmap & Algos' },
            { id: 'builder', label: 'Tier Estimator' },
            { id: 'animations', label: 'System Animations' },
            { id: 'probabilistic', label: 'Probabilistic Lab' },
            { id: 'academy', label: 'Deep Academy' },
          ]}
        />

        {/* Active Request Path Highlight Strip (Driven by 'Simulate Data Flow') */}
        {flowSimActive && activeSimHop && (
          <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                  Live Request Path Trace
                </span>
                <span aria-hidden="true" className="text-slate-400">
                  ·
                </span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {activeArchitecture.architectureTitle}
                </span>
                <span className="font-mono tabular-nums text-[11px] text-sky-700 dark:text-sky-400">
                  Hop {flowSimStepIdx + 1} / {flowSimHops.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setFlowSimStepIdx((prev) => (prev + 1) % Math.max(1, flowSimHops.length))
                  }
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500"
                >
                  Next Hop
                </button>
                <button
                  type="button"
                  onClick={() => setFlowSimStepIdx(0)}
                  aria-label="Restart request path trace"
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-slate-600 dark:text-slate-300 hover:border-sky-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSimulateDataFlow}
                  aria-label="Close request path trace"
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-slate-600 dark:text-slate-300 hover:border-sky-500"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {flowSimHops.map((hop, idx) => {
                const isActive = idx === flowSimStepIdx;
                const isVisited = idx < flowSimStepIdx;
                return (
                  <div key={`${hop.id}-${idx}`} className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFlowSimStepIdx(idx)}
                      className={`rounded-md border px-2 py-1 text-[11px] font-mono transition-colors ${
                        isActive
                          ? 'border-sky-600 bg-sky-600 text-white font-semibold'
                          : isVisited
                            ? 'border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}. {hop.label}
                    </button>
                    {idx < flowSimHops.length - 1 && (
                      <ArrowRight
                        className={`w-3 h-3 shrink-0 ${
                          isVisited || isActive
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-slate-700 dark:text-slate-200 leading-5">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeSimHop.label}:
                </span>{' '}
                {activeSimHop.detail}
              </div>
              <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400 shrink-0">
                {activeSimHop.badge}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Live Traffic Visualization & Failover Simulator Widget (Synced to Active Pattern) */}
      {showLiveTrafficWidget && (
        <LiveTrafficFlowSimulator
          topology={syncedTrafficTopology}
          domain="system-design"
          compact
          allowPresetSwitcher
          heading="Live Traffic Visualization & Failover Simulator"
        />
      )}

      {/* Mode 00A: Interactive Expandable & Clickable Mermaid.js Architecture Flows */}
      {subTab === 'mermaid-flows' && (
        <InteractiveSystemMermaidFlows
          onActiveBlueprintChange={setSelectedMermaidArchId}
          externalSimulateSignal={flowSimSignal}
        />
      )}

      {/* Mode 00B: Frontier LLM Systems — ChatGPT, Google Gemini & Anthropic Claude Internals + Token Streaming */}
      {subTab === 'llm-internals' && (
        <FrontierLlmArchitectureLab
          externalSimulateSignal={flowSimSignal}
          onActivePlatformChange={setSelectedLlmPlatformId}
        />
      )}

      {/* Mode 00: 16 Real-World Production Blueprints (DB Design + Animated DFD), Webhooks/WebSockets/Enqueue Lab & 45-Min Mock Interview */}
      {subTab === 'real-world-interview' && (
        <RealWorldArchitecturesAndInterviewLab onActiveBlueprintChange={setSelectedRealWorldId} />
      )}

      {/* Mode 0A: Interactive System Design DFD Simulator with SVG Animation Engine & Bidirectional Links */}
      {subTab === 'dfd-simulator' && (
        <SystemDfdSimulator
          selectedPatternId={selectedDfdPatternId}
          onSelectPatternId={setSelectedDfdPatternId}
          onOpenRoadmapModule={handleOpenRoadmapModule}
          onOpenAcademyTopic={handleOpenAcademyTopic}
          onOpenDbFlow={handleOpenDbFlow}
          onOpenLabProblem={handleOpenProblem}
        />
      )}

      {/* Mode 0: Full Interactive React Flow System Design Playground & Live Traffic Simulator */}
      {subTab === 'playground' && <SystemPlayground />}

      {/* Mode 0B: Interactive Database DFD Visualizations, Animations & Plain-English Explanations */}
      {subTab === 'db-dfd' && (
        <DatabaseVisualAnimator
          selectedFlowId={selectedDbFlowId}
          onSelectFlowId={setSelectedDbFlowId}
        />
      )}

      {subTab !== 'mermaid-flows' &&
        subTab !== 'llm-internals' &&
        subTab !== 'real-world-interview' &&
        subTab !== 'dfd-simulator' &&
        subTab !== 'playground' &&
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
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  Est. Avg: {evaluation.estimatedQps.toLocaleString()} QPS · Peak:{' '}
                  {evaluation.estimatedPeakQps.toLocaleString()} QPS · Storage: {evaluation.dailyStorageGb} GB/day
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenDfdPattern(matchedScenarioDfd.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:border-sky-500 whitespace-nowrap"
                >
                  Simulate in DFD
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
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
            {/* Bidirectional Bridge to Deep DFD Simulator & Coding Problems */}
            <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sky-800 dark:text-sky-300">
                  Deepen This Architecture:
                </span>
                {matchedScenarioDfd.linkedAlgorithms.map((algo) => (
                  <button
                    key={algo.algoId}
                    type="button"
                    onClick={() => openAlgorithm(algo.algoId, 'mental')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:border-indigo-500 transition-colors"
                  >
                    <Cpu className="w-3 h-3 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    {algo.label}
                  </button>
                ))}
                {matchedScenarioDfd.linkedProblems.map((prob) => (
                  <button
                    key={prob.problemId}
                    type="button"
                    onClick={() => handleOpenProblem(prob.problemId)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-800 dark:text-slate-200 hover:border-amber-500 transition-colors"
                  >
                    <Code2 className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    #{prob.number} {prob.title}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleOpenDfdPattern(matchedScenarioDfd.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold whitespace-nowrap"
              >
                Open {matchedScenarioDfd.shortTitle} DFD Simulator
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Mode 0: System Design & Distributed Algorithms Master Roadmap */}
      {subTab === 'roadmap' && (
        <SystemDesignMasterRoadmap
          externalModuleId={roadmapExternalModuleId}
          onConsumeExternalModule={() => setRoadmapExternalModuleId(null)}
          onOpenDfdPattern={handleOpenDfdPattern}
          onOpenLabProblem={handleOpenProblem}
        />
      )}

      {/* Mode 3: Probabilistic Data Structures Lab */}
      {subTab === 'probabilistic' && <ProbabilisticLab />}

      {/* Mode 4: Deep System Design Learning Academy */}
      {subTab === 'academy' && (
        <SystemDesignLearningAcademy
          externalTarget={academyExternalTarget}
          onConsumeExternalTarget={() => setAcademyExternalTarget(null)}
          onOpenDfdPattern={handleOpenDfdPattern}
          onOpenLabProblem={handleOpenProblem}
        />
      )}

      <TopicBridgeBar studioId="system-design" />

      <ArchitectureExplainerSidebar
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        architecture={activeArchitecture}
        requestTriggerCount={explainTriggerCount}
      />
    </div>
  );
}
