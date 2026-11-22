import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Pause,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  DEPLOYMENT_STRATEGIES,
  DEVOPS_CLOUD_MAPPING_MATRIX,
  ENVIRONMENT_PROGRESSION_STAGES,
  HYBRID_AIRGAPPED_BLUEPRINT,
  MASTER_DEVOPS_DFDS,
  SDLC_PIPELINE_MODULES,
  type DevOpsDfdGraph,
  type DevOpsDfdNode,
} from '../../data/devopsCloudCurriculumData';
import {
  SECTION2_ENV_FIVE_PART,
  SECTION3_ROLLOUT_FIVE_PART,
  SECTION4_CLOUD_VS_INHOUSE_FIVE_PART,
  SECTION6_SIMULATOR_ENGINE_BLUEPRINTS,
  type FivePartMasterclassSpec,
} from '../../data/devopsMasterclassBlueprints';
import { withStudioBoundary } from '../hoc';
import { CopyButton, SegmentedTabBar } from '../ui';
import { DevOpsInteractiveSimulators } from './DevOpsInteractiveSimulators';
import { DevOpsVisualPlayground } from './DevOpsVisualPlayground';

type StudioTab =
  | 'playground'
  | 'simulators'
  | 'sdlc-pipeline'
  | 'rollouts-envs'
  | 'cloud-vs-onprem'
  | 'master-dfds';

const ZONE_ACCENT: Record<
  DevOpsDfdNode['zone'],
  { stroke: string; fillLight: string; fillDark: string; text: string }
> = {
  dev: { stroke: '#0284c7', fillLight: '#f0f9ff', fillDark: '#0c4a6e', text: 'Developer' },
  ci: { stroke: '#4f46e5', fillLight: '#eef2ff', fillDark: '#312e81', text: 'CI Factory' },
  sec: { stroke: '#d97706', fillLight: '#fffbeb', fillDark: '#78350f', text: 'DevSecOps' },
  cloud: { stroke: '#059669', fillLight: '#ecfdf5', fillDark: '#064e3b', text: 'Runtime' },
  ops: { stroke: '#475569', fillLight: '#f8fafc', fillDark: '#1e293b', text: 'Observability' },
};

/* -------------------------------------------------------------------------- */
/* Reusable Animated SVG DFD Player + Mermaid Source Export                   */
/* -------------------------------------------------------------------------- */
const DevOpsAnimatedDfd: React.FC<{ graph: DevOpsDfdGraph }> = ({ graph }) => {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showMermaid, setShowMermaid] = useState<boolean>(false);
  const [packetT, setPacketT] = useState<number>(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    setStepIdx(0);
    setPacketT(0);
  }, [graph.id]);

  // Step auto-advance when playing
  useEffect(() => {
    if (!isPlaying || graph.steps.length <= 1) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % graph.steps.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [isPlaying, graph.steps.length]);

  // Smooth rAF packet pulse along active edges
  useEffect(() => {
    if (prefersReducedMotion || !isPlaying) {
      setPacketT(0.5);
      return;
    }
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1400;
      last = now;
      setPacketT((prev) => (prev + dt) % 1);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, prefersReducedMotion]);

  const activeStep = graph.steps[Math.min(stepIdx, graph.steps.length - 1)];
  const nodeMap = useMemo(() => {
    const map = new Map<string, DevOpsDfdNode>();
    for (const n of graph.nodes) map.set(n.id, n);
    return map;
  }, [graph.nodes]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
      {/* Header + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">{graph.level}</span>
            <span aria-hidden="true">·</span>
            <span>Step {stepIdx + 1} of {graph.steps.length}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{activeStep.latencyLabel}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {graph.title}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause diagram animation' : 'Play diagram animation'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => (prev - 1 + graph.steps.length) % graph.steps.length);
            }}
            aria-label="Previous step"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => (prev + 1) % graph.steps.length);
            }}
            aria-label="Next step"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setStepIdx(0);
              setIsPlaying(true);
            }}
            aria-label="Reset diagram"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowMermaid((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showMermaid
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-sky-500'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
            {showMermaid ? 'Hide Mermaid' : 'Mermaid DFD'}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="p-4 bg-slate-50/40 dark:bg-slate-950/60 overflow-x-auto">
        <svg
          viewBox="0 0 880 250"
          className="w-full min-w-[680px] h-auto max-h-[270px]"
          role="img"
          aria-label={`${graph.title}: ${activeStep.title}`}
        >
          <defs>
            <marker
              id={`arrow-idle-${graph.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <marker
              id={`arrow-active-${graph.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
            </marker>
          </defs>

          {/* Edges */}
          {graph.edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;

            const isActive = activeStep.activeEdgeIds.includes(edge.id);
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.hypot(dx, dy) || 1;
            const padStart = 66;
            const padEnd = 68;
            const sx = from.x + (dx / dist) * Math.min(padStart, dist * 0.35);
            const sy = from.y + (dy / dist) * Math.min(28, dist * 0.35);
            const ex = to.x - (dx / dist) * Math.min(padEnd, dist * 0.35);
            const ey = to.y - (dy / dist) * Math.min(28, dist * 0.35);

            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;

            const px = sx + (ex - sx) * packetT;
            const py = sy + (ey - sy) * packetT;

            return (
              <g key={edge.id}>
                <line
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke={isActive ? '#0284c7' : '#cbd5e1'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={isActive ? undefined : '4 4'}
                  markerEnd={`url(#${isActive ? `arrow-active-${graph.id}` : `arrow-idle-${graph.id}`})`}
                />
                <rect
                  x={mx - 44}
                  y={my - 12}
                  width={88}
                  height={18}
                  rx={4}
                  className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth={0.8}
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  className={`text-[9.5px] font-mono ${
                    isActive
                      ? 'fill-sky-700 dark:fill-sky-300 font-semibold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {edge.label}
                </text>
                {isActive && (
                  <circle cx={px} cy={py} r={4.5} fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const isActive = activeStep.activeNodeIds.includes(node.id);
            const accent = ZONE_ACCENT[node.zone];
            return (
              <g key={node.id} transform={`translate(${node.x - 66}, ${node.y - 28})`}>
                <rect
                  width={132}
                  height={56}
                  rx={8}
                  className={
                    isActive
                      ? 'fill-white dark:fill-slate-900'
                      : 'fill-white/90 dark:fill-slate-900/75'
                  }
                  stroke={isActive ? accent.stroke : '#94a3b8'}
                  strokeWidth={isActive ? 2.2 : 1.1}
                />
                <text
                  x={66}
                  y={24}
                  textAnchor="middle"
                  className="text-[11px] font-semibold fill-slate-900 dark:fill-slate-100"
                >
                  {node.label}
                </text>
                <text
                  x={66}
                  y={41}
                  textAnchor="middle"
                  className="text-[9.5px] font-mono fill-slate-500 dark:fill-slate-400"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step Narrator + Stepper Selector */}
      <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Step {stepIdx + 1}: {activeStep.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {activeStep.detail}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {graph.steps.map((st, idx) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(idx);
              }}
              className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                idx === stepIdx
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {idx + 1}. {st.title.split(' ').slice(0, 3).join(' ')}
            </button>
          ))}
        </div>

        {showMermaid && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Mermaid.js Source</span>
              <CopyButton text={graph.mermaidCode} label="Copy Mermaid" />
            </div>
            <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {graph.mermaidCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Reusable 5-Part Masterclass Specification Card (Sections 2, 3 & 4)         */
/* -------------------------------------------------------------------------- */
const FivePartSpecPanel: React.FC<{
  spec: FivePartMasterclassSpec;
  onLaunchSimulators: () => void;
}> = ({ spec, onLaunchSimulators }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
      <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
        Module {spec.code} · Strict 5-Part Masterclass Specification
      </div>
      <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
        {spec.title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{spec.subtitle}</p>
    </div>

    {/* Part 1: Plain-English Definition */}
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        1. Plain-English Definition (Beginner)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-1">
          <div className="font-semibold text-slate-900 dark:text-slate-100">What It Is</div>
          <p className="text-slate-600 dark:text-slate-400">{spec.plainEnglish.whatItIs}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-1">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Problem Solved</div>
          <p className="text-slate-600 dark:text-slate-400">{spec.plainEnglish.problemSolved}</p>
        </div>
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-1">
          <div className="font-semibold text-rose-900 dark:text-rose-300">What Breaks If Skipped</div>
          <p className="text-slate-700 dark:text-slate-300">{spec.plainEnglish.whatBreaksIfSkipped}</p>
        </div>
      </div>
    </div>

    {/* Part 2: Action Components & Production Config */}
    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        2. Action Components &amp; Execution Mechanics (Intermediate)
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Inputs</div>
          <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
            {spec.actionMechanics.inputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Automated Triggers</div>
          <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
            {spec.actionMechanics.automatedTriggers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Verified Outputs</div>
          <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
            {spec.actionMechanics.outputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
          <span className="text-xs font-mono text-slate-300">{spec.actionMechanics.configTitle}</span>
          <CopyButton text={spec.actionMechanics.configSnippet} label="Copy Config" />
        </div>
        <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {spec.actionMechanics.configSnippet}
        </pre>
      </div>
    </div>

    {/* Part 3: Cloud (AWS / GCP / Azure) vs In-House */}
    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        3. Cloud (AWS / GCP / Azure) vs. In-House Implementation (Advanced)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs leading-relaxed">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
          <div className="font-semibold text-amber-700 dark:text-amber-400">AWS</div>
          <p className="text-slate-600 dark:text-slate-400">{spec.cloudVsInHouse.aws}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
          <div className="font-semibold text-sky-700 dark:text-sky-400">GCP</div>
          <p className="text-slate-600 dark:text-slate-400">{spec.cloudVsInHouse.gcp}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
          <div className="font-semibold text-indigo-700 dark:text-indigo-400">Azure</div>
          <p className="text-slate-600 dark:text-slate-400">{spec.cloudVsInHouse.azure}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
          <div className="font-semibold text-emerald-700 dark:text-emerald-400">In-House / On-Premise</div>
          <p className="text-slate-600 dark:text-slate-400">{spec.cloudVsInHouse.inHouse}</p>
        </div>
      </div>
    </div>

    {/* Part 4: Animated DFD + Mermaid.js */}
    <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        4. Data Flow Diagram (Animated SVG + Mermaid.js)
      </h4>
      <DevOpsAnimatedDfd graph={spec.dfd} />
    </div>

    {/* Part 5: Interactive Simulator Storyboard */}
    <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          5. Interactive Simulator &amp; Animation Storyboard
        </h4>
        <button
          type="button"
          onClick={onLaunchSimulators}
          className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
        >
          Open Live Sandbox -&gt;
        </button>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-200">UI Controls:</span>{' '}
          {spec.simulatorStoryboard.controls.join(' · ')}
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-200">State Transitions:</span>{' '}
          <span className="font-mono">{spec.simulatorStoryboard.stateTransitions.join(' · ')}</span>
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-200">Failure Injections:</span>{' '}
          {spec.simulatorStoryboard.failureInjections.join(' · ')}
        </p>
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-200">Visual Animation:</span>{' '}
          {spec.simulatorStoryboard.visualAnimations}
        </p>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main DevOps & Cloud Engineering Studio                                     */
/* -------------------------------------------------------------------------- */
const DevOpsCloudStudioInner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('playground');
  const [selectedSdlcId, setSelectedSdlcId] = useState<string>(SDLC_PIPELINE_MODULES[0].id);
  const [selectedEnvSpecId, setSelectedEnvSpecId] = useState<string>(SECTION2_ENV_FIVE_PART[0].id);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('canary');
  const [selectedArchSpecId, setSelectedArchSpecId] = useState<string>(SECTION4_CLOUD_VS_INHOUSE_FIVE_PART[0].id);
  const [selectedMasterDfdId, setSelectedMasterDfdId] = useState<string>(MASTER_DEVOPS_DFDS[0].id);
  const [selectedEngineId, setSelectedEngineId] = useState<string>(SECTION6_SIMULATOR_ENGINE_BLUEPRINTS[0].id);
  const [matrixFilter, setMatrixFilter] = useState<string>('');

  const handleNavigateRelated = (
    tab: 'simulators' | 'sdlc-pipeline' | 'rollouts-envs' | 'cloud-vs-onprem' | 'master-dfds',
    itemId?: string
  ) => {
    if (tab === 'sdlc-pipeline' && itemId) {
      setSelectedSdlcId(itemId);
    } else if (tab === 'rollouts-envs' && itemId) {
      setSelectedStrategyId(itemId);
    }
    setActiveTab(tab);
  };

  const activeSdlc = useMemo(
    () => SDLC_PIPELINE_MODULES.find((m) => m.id === selectedSdlcId) ?? SDLC_PIPELINE_MODULES[0],
    [selectedSdlcId]
  );

  const activeEnvSpec = useMemo(
    () => SECTION2_ENV_FIVE_PART.find((e) => e.id === selectedEnvSpecId) ?? SECTION2_ENV_FIVE_PART[0],
    [selectedEnvSpecId]
  );

  const activeStrategy = useMemo(
    () => DEPLOYMENT_STRATEGIES.find((s) => s.id === selectedStrategyId) ?? DEPLOYMENT_STRATEGIES[0],
    [selectedStrategyId]
  );

  const activeRolloutSpec = useMemo(
    () => SECTION3_ROLLOUT_FIVE_PART.find((r) => r.id === selectedStrategyId) ?? SECTION3_ROLLOUT_FIVE_PART[0],
    [selectedStrategyId]
  );

  const activeArchSpec = useMemo(
    () => SECTION4_CLOUD_VS_INHOUSE_FIVE_PART.find((a) => a.id === selectedArchSpecId) ?? SECTION4_CLOUD_VS_INHOUSE_FIVE_PART[0],
    [selectedArchSpecId]
  );

  const activeMasterDfd = useMemo(
    () => MASTER_DEVOPS_DFDS.find((d) => d.id === selectedMasterDfdId) ?? MASTER_DEVOPS_DFDS[0],
    [selectedMasterDfdId]
  );

  const activeEngineSpec = useMemo(
    () => SECTION6_SIMULATOR_ENGINE_BLUEPRINTS.find((e) => e.id === selectedEngineId) ?? SECTION6_SIMULATOR_ENGINE_BLUEPRINTS[0],
    [selectedEngineId]
  );

  const filteredMatrix = useMemo(() => {
    const q = matrixFilter.trim().toLowerCase();
    if (!q) return DEVOPS_CLOUD_MAPPING_MATRIX;
    return DEVOPS_CLOUD_MAPPING_MATRIX.filter(
      (row) =>
        row.domain.toLowerCase().includes(q) ||
        row.coreFunctionality.toLowerCase().includes(q) ||
        row.awsEquivalent.toLowerCase().includes(q) ||
        row.gcpEquivalent.toLowerCase().includes(q) ||
        row.inHouseEquivalent.toLowerCase().includes(q)
    );
  }, [matrixFilter]);

  return (
    <section className="space-y-6">
      {/* Studio Header */}
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>AWS · GCP · In-House Bare-Metal</span>
          <span aria-hidden="true">·</span>
          <span>6 SDLC Modules</span>
          <span aria-hidden="true">·</span>
          <span>6 Rollout Strategies</span>
          <span aria-hidden="true">·</span>
          <span>5 Live Simulators &amp; CLI Sandbox</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
          DevOps &amp; Cloud Engineering Studio
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Master end-to-end SDLC automation, DevSecOps quality gates, progressive rollout strategies, GitOps self-healing, and AWS vs. GCP vs. On-Premise architecture through live interactive simulators, animated Data Flow Diagrams, and hands-on outage drills.
        </p>
      </div>

      {/* Primary Studio Navigation */}
      <SegmentedTabBar
        ariaLabel="DevOps and Cloud Studio Sections"
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'playground', label: 'Virtual Playground' },
          { id: 'simulators', label: '5 Live Simulators & CLI' },
          { id: 'sdlc-pipeline', label: 'Sec 1: SDLC Pipeline (6)' },
          { id: 'rollouts-envs', label: 'Sec 2-3: Envs & Rollouts' },
          { id: 'cloud-vs-onprem', label: 'Sec 4: Cloud vs In-House' },
          { id: 'master-dfds', label: 'Sec 5-6: DFDs & Engine' },
        ]}
      />

      {/* TAB 0: Interactive Virtual DevOps Automation & Deployment Playground */}
      {activeTab === 'playground' && (
        <DevOpsVisualPlayground onNavigateRelated={handleNavigateRelated} />
      )}

      {/* TAB 1: 5 Interactive Simulators */}
      {activeTab === 'simulators' && <DevOpsInteractiveSimulators />}

      {/* TAB 2: 6-Phase End-to-End SDLC Pipeline (5-Part Curriculum Blueprint) */}
      {activeTab === 'sdlc-pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Phase Sidebar */}
          <aside className="lg:col-span-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              End-to-End SDLC Automation Phases
            </p>
            {SDLC_PIPELINE_MODULES.map((mod) => {
              const active = mod.id === activeSdlc.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedSdlcId(mod.id)}
                  className={`w-full text-left rounded-lg border p-3.5 transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Phase {mod.code}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {mod.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {mod.stageSummary}
                  </p>
                </button>
              );
            })}
          </aside>

          {/* 5-Part Structured Module Viewer */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  Module {activeSdlc.code} · 5-Part Principal Architect Specification
                </div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {activeSdlc.title}
                </h2>
              </div>

              {/* Part 1: Plain-English Definition */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  1. Plain-English Definition (Beginner)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">What It Is</div>
                    <p className="text-slate-600 dark:text-slate-400">{activeSdlc.plainEnglish.whatItIs}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Problem Solved</div>
                    <p className="text-slate-600 dark:text-slate-400">{activeSdlc.plainEnglish.problemSolved}</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 space-y-1">
                    <div className="font-semibold text-rose-900 dark:text-rose-300">What Breaks If Skipped</div>
                    <p className="text-slate-700 dark:text-slate-300">{activeSdlc.plainEnglish.whatBreaksIfSkipped}</p>
                  </div>
                </div>
              </div>

              {/* Part 2: Action Components & Production Config */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  2. Action Components &amp; Execution Mechanics (Intermediate)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Inputs</div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                      {activeSdlc.actionMechanics.inputs.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Automated Triggers</div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                      {activeSdlc.actionMechanics.automatedTriggers.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Verified Outputs</div>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                      {activeSdlc.actionMechanics.outputs.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-300">
                      {activeSdlc.actionMechanics.configTitle}
                    </span>
                    <CopyButton text={activeSdlc.actionMechanics.configSnippet} label="Copy Config" />
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    {activeSdlc.actionMechanics.configSnippet}
                  </pre>
                </div>
              </div>

              {/* Part 3: Cloud (AWS / GCP) vs In-House */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  3. Cloud (AWS &amp; GCP) vs. In-House Implementation (Advanced)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                    <div className="font-semibold text-amber-700 dark:text-amber-400">AWS Managed</div>
                    <p className="text-slate-600 dark:text-slate-400">{activeSdlc.implementations.aws}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                    <div className="font-semibold text-sky-700 dark:text-sky-400">GCP Managed</div>
                    <p className="text-slate-600 dark:text-slate-400">{activeSdlc.implementations.gcp}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">In-House / On-Premise</div>
                    <p className="text-slate-600 dark:text-slate-400">{activeSdlc.implementations.inHouse}</p>
                  </div>
                </div>
              </div>

              {/* Part 4: Live Animated DFD + Mermaid Source */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  4. Interactive Data Flow Diagram (Animated SVG + Mermaid.js)
                </h3>
                <DevOpsAnimatedDfd graph={activeSdlc.dfd} />
              </div>

              {/* Part 5: Interactive Simulator Storyboard */}
              <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    5. Simulator Mechanics &amp; Failure Transitions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('simulators')}
                    className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    Launch Interactive Sandbox -&gt;
                  </button>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Controls:</span>{' '}
                    {activeSdlc.simulatorStoryboard.controls.join(' · ')}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Fault Injections:</span>{' '}
                    {activeSdlc.simulatorStoryboard.failureInjections.join(' · ')}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">Visual Transition:</span>{' '}
                    {activeSdlc.simulatorStoryboard.visualTransitions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Rollout Strategies & Dev -> Prod Environment Progression */}
      {activeTab === 'rollouts-envs' && (
        <div className="space-y-8">
          {/* Section 2: Environment Progression Pipeline */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                Environment Progression Strategy (Build Once, Promote Immutable Digest)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Never rebuild container artifacts per environment. Compile once in CI, pin the SHA-256 digest, and promote strictly through automated quality and security gates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {ENVIRONMENT_PROGRESSION_STAGES.map((env) => (
                <div
                  key={env.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-sky-700 dark:text-sky-400">0{env.order}. {env.shortName}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {env.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {env.purpose}
                    </p>
                  </div>
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Data:</span> {env.dataPolicy}</p>
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Approval:</span> {env.approvalControl}</p>
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Sizing:</span> {env.infraSizing}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2: 5-Part Masterclass Deep Dive */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-2">
                {SECTION2_ENV_FIVE_PART.map((spec) => {
                  const active = spec.id === activeEnvSpec.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setSelectedEnvSpecId(spec.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        active
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {spec.code} · {spec.title}
                    </button>
                  );
                })}
              </div>
              <FivePartSpecPanel spec={activeEnvSpec} onLaunchSimulators={() => setActiveTab('simulators')} />
            </div>
          </div>

          {/* Section 3: 6 Deployment & Rollout Strategies Matrix + Config Inspector */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                Deployment &amp; Rollout Strategies Comparison Matrix
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click any rollout pattern below to inspect its database schema compatibility rules (Expand-Contract) and production Kubernetes / Istio manifest.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">Strategy</th>
                    <th className="py-3 px-4 font-semibold">Downtime</th>
                    <th className="py-3 px-4 font-semibold">Infra Cost</th>
                    <th className="py-3 px-4 font-semibold">Rollback Speed</th>
                    <th className="py-3 px-4 font-semibold">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {DEPLOYMENT_STRATEGIES.map((strat) => {
                    const selected = strat.id === activeStrategy.id;
                    return (
                      <tr
                        key={strat.id}
                        onClick={() => setSelectedStrategyId(strat.id)}
                        className={`cursor-pointer transition-colors ${
                          selected
                            ? 'bg-sky-50/70 dark:bg-sky-950/35'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          <span className="font-mono text-sky-700 dark:text-sky-400 mr-1.5">{strat.code}</span>
                          {strat.name}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">{strat.downtime}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">{strat.infraCost}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">{strat.rollbackSpeed}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{strat.complexity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Strategy Detail Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5">
              <div className="lg:col-span-6 space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Strategy {activeStrategy.code}
                  </span>
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                    {activeStrategy.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {activeStrategy.summary}
                  </p>
                </div>
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">DB Schema Rule:</span>{' '}
                    {activeStrategy.dbSchemaStrategy}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Best For:</span>{' '}
                    {activeStrategy.bestFor}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-rose-700 dark:text-rose-400">Avoid When:</span>{' '}
                    {activeStrategy.avoidWhen}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-300">{activeStrategy.configTitle}</span>
                  <CopyButton text={activeStrategy.configSnippet} label="Copy YAML" />
                </div>
                <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed flex-1">
                  {activeStrategy.configSnippet}
                </pre>
              </div>
            </div>

            {/* Full 5-Part Masterclass Spec for Selected Rollout Strategy */}
            <FivePartSpecPanel spec={activeRolloutSpec} onLaunchSimulators={() => setActiveTab('simulators')} />
          </div>
        </div>
      )}

      {/* TAB 4: AWS vs GCP vs In-House Matrix + Hybrid & Air-Gapped */}
      {activeTab === 'cloud-vs-onprem' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  Multi-Cloud (AWS &amp; GCP) vs. In-House Service Mapping
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Side-by-side mapping of every core DevOps domain across AWS managed services, GCP managed services, and self-hosted bare-metal tools.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={matrixFilter}
                  onChange={(e) => setMatrixFilter(e.target.value)}
                  placeholder="Filter services (e.g. EKS, Vault, Harbor)..."
                  aria-label="Filter DevOps service mapping matrix"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">DevOps Domain</th>
                    <th className="py-3 px-4 font-semibold">AWS Equivalent</th>
                    <th className="py-3 px-4 font-semibold">GCP Equivalent</th>
                    <th className="py-3 px-4 font-semibold">In-House / On-Premise</th>
                    <th className="py-3 px-4 font-semibold">Architect Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredMatrix.map((row) => (
                    <tr key={row.domain} className="align-top">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{row.domain}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px]">
                          {row.coreFunctionality}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-800 dark:text-amber-300">{row.awsEquivalent}</td>
                      <td className="py-3.5 px-4 font-mono text-sky-800 dark:text-sky-300">{row.gcpEquivalent}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-800 dark:text-emerald-300">{row.inHouseEquivalent}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[240px] leading-relaxed">
                        {row.architectureNote}
                      </td>
                    </tr>
                  ))}
                  {filteredMatrix.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No services matched "{matrixFilter}". Try searching for EKS, GKE, Terraform, Vault, or HAProxy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hybrid & Air-Gapped Enterprise Blueprints */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                Hybrid Cloud &amp; Air-Gapped Enterprise Topologies
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Proven patterns for regulated banks, defense networks, and high-throughput platforms balancing on-premise CapEx with cloud elasticity.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {HYBRID_AIRGAPPED_BLUEPRINT.map((pat) => (
                <div
                  key={pat.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-3 text-xs leading-relaxed"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{pat.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{pat.summary}</p>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1.5">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Flow:</span> {pat.architectureFlow}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Security Boundary:</span> {pat.securityBoundary}
                    </p>
                    <p className="font-mono text-[11px] text-sky-700 dark:text-sky-400 pt-1">
                      {pat.tooling}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: 5-Part Masterclass Architecture Deep-Dive */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                Section 4: Cloud vs. In-House 5-Part Architectural Specifications
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select an infrastructure track below to inspect its complete 5-part blueprint, Terraform/MetalLB/Skopeo manifests, animated DFD, and Mermaid.js code.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SECTION4_CLOUD_VS_INHOUSE_FIVE_PART.map((spec) => {
                const active = spec.id === activeArchSpec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setSelectedArchSpecId(spec.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {spec.code} · {spec.title}
                  </button>
                );
              })}
            </div>
            <FivePartSpecPanel spec={activeArchSpec} onLaunchSimulators={() => setActiveTab('simulators')} />
          </div>
        </div>
      )}

      {/* TAB 5: Section 5 (Master DFDs + Mermaid.js) & Section 6 (Simulator Engine Design & FSM Pseudocode) */}
      {activeTab === 'master-dfds' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                Section 5: Master Data Flow Diagrams (Animated SVG + Mermaid.js)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Inspect all 4 core system architecture diagrams interactively or toggle Mermaid DFD inside the viewer to copy syntax-checked Mermaid.js code.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MASTER_DEVOPS_DFDS.map((dfd) => {
                const active = dfd.id === activeMasterDfd.id;
                return (
                  <button
                    key={dfd.id}
                    type="button"
                    onClick={() => setSelectedMasterDfdId(dfd.id)}
                    className={`text-left rounded-lg border p-3.5 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                      {dfd.level}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {dfd.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {dfd.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            <DevOpsAnimatedDfd graph={activeMasterDfd} />
          </div>

          {/* Section 6: Interactive Simulator Engine Design & State Machine Pseudocode */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  Section 6: Interactive Simulator Engine Design &amp; State Machine Pseudocode
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Frontend engineering blueprint detailing UI controls, finite states, chaos fault injections, and reducer pseudocode powering each sandbox simulator.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('simulators')}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                Test Live Simulators -&gt;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SECTION6_SIMULATOR_ENGINE_BLUEPRINTS.map((eng) => {
                const active = eng.id === activeEngineSpec.id;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setSelectedEngineId(eng.id)}
                    className={`text-left rounded-lg border p-3.5 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                      Engine {eng.code}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {eng.title}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5">
              <div className="lg:col-span-5 space-y-4 text-xs leading-relaxed">
                <div>
                  <span className="font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Blueprint {activeEngineSpec.code}
                  </span>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {activeEngineSpec.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{activeEngineSpec.purpose}</p>
                </div>

                <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">UI Controls</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                    {activeEngineSpec.uiControls.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">FSM States &amp; Events</div>
                  <p className="font-mono text-[11px] text-sky-800 dark:text-sky-300">
                    States: {activeEngineSpec.states.join(' -> ')}
                  </p>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    Events: {activeEngineSpec.events.join(' · ')}
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="font-semibold text-rose-800 dark:text-rose-300">Chaos / Failure Injections</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                    {activeEngineSpec.failureInjections.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-300">
                    {activeEngineSpec.id}-fsm.ts (State Machine Pseudocode)
                  </span>
                  <CopyButton text={activeEngineSpec.stateMachinePseudocode} label="Copy Pseudocode" />
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed flex-1">
                  {activeEngineSpec.stateMachinePseudocode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export const DevOpsCloudStudio = withStudioBoundary(DevOpsCloudStudioInner, {
  studioName: 'DevOps & Cloud Engineering Studio',
});
