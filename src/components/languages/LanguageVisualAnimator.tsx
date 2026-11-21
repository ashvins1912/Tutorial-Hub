import { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  LANGUAGE_VISUAL_FLOWS,
  type LangDfdEdge,
  type LangDfdNode,
  type LangTrack,
} from '../../data/languagesTutorialData';
import { CopyButton, SegmentedTabBar } from '../ui';

interface LanguageVisualAnimatorProps {
  selectedFlowId: string;
  onSelectFlowId: (id: string) => void;
  languageFilter: 'all' | LangTrack;
}

const NODE_W = 132;
const NODE_H = 54;

function getEdgePoints(from: LangDfdNode, to: LangDfdNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: from.x + ux * (NODE_W * 0.5),
    y1: from.y + uy * (NODE_H * 0.5),
    x2: to.x - ux * (NODE_W * 0.5 + 4),
    y2: to.y - uy * (NODE_H * 0.5 + 4),
  };
}

export function LanguageVisualAnimator({
  selectedFlowId,
  onSelectFlowId,
  languageFilter,
}: LanguageVisualAnimatorProps) {
  const visibleFlows = useMemo(
    () =>
      languageFilter === 'all'
        ? LANGUAGE_VISUAL_FLOWS
        : LANGUAGE_VISUAL_FLOWS.filter((f) => f.language === languageFilter),
    [languageFilter]
  );

  const flow = useMemo(
    () => visibleFlows.find((f) => f.id === selectedFlowId) ?? visibleFlows[0] ?? LANGUAGE_VISUAL_FLOWS[0],
    [visibleFlows, selectedFlowId]
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(2200);
  const [packetProgress, setPacketProgress] = useState(0);
  const [diagramView, setDiagramView] = useState<'animated-svg' | 'ascii-dfd'>('animated-svg');

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [flow.id]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        if (prev + 1 >= flow.steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, flow.steps.length]);

  useEffect(() => {
    let rafId = 0;
    const startTs = performance.now();
    const duration = Math.max(900, speedMs * 0.72);
    const tick = (now: number) => {
      setPacketProgress(((now - startTs) % duration) / duration);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [stepIdx, speedMs, flow.id]);

  const currentStep = flow.steps[stepIdx] ?? flow.steps[0];
  const nodeMap = useMemo(() => {
    const map = new Map<string, LangDfdNode>();
    flow.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [flow.nodes]);

  const packetEdge: LangDfdEdge | undefined = currentStep.packetEdgeId
    ? flow.edges.find((e) => e.id === currentStep.packetEdgeId)
    : undefined;

  const packetCoords = useMemo(() => {
    if (!packetEdge) return null;
    const fromNode = nodeMap.get(packetEdge.from);
    const toNode = nodeMap.get(packetEdge.to);
    if (!fromNode || !toNode) return null;
    const { x1, y1, x2, y2 } = getEdgePoints(fromNode, toNode);
    return {
      x: x1 + (x2 - x1) * packetProgress,
      y: y1 + (y2 - y1) * packetProgress,
    };
  }, [packetEdge, nodeMap, packetProgress]);

  const fullAscii = `Level-0 Context DFD:\n${flow.asciiDfd.level0}\n\nLevel-1 Runtime Flow:\n${flow.asciiDfd.level1}`;

  return (
    <div className="space-y-6">
      {/* Flow Selector Strip */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${
          visibleFlows.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-6'
        }`}
      >
        {visibleFlows.map((item) => {
          const active = item.id === flow.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFlowId(item.id)}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <span
                  className={
                    item.language === 'python'
                      ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                      : 'font-semibold text-amber-700 dark:text-amber-400'
                  }
                >
                  {item.language === 'python' ? 'Python 3.13+' : 'Java 21+'}
                </span>
                <span className="text-slate-500 dark:text-slate-400">{item.level}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                {item.shortTitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Visual Stage Card */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">{flow.category}</span>
              <span aria-hidden="true">·</span>
              <span>{flow.level}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{flow.algorithmName}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {flow.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">{flow.tagline}</p>
          </div>

          <SegmentedTabBar<'animated-svg' | 'ascii-dfd'>
            ariaLabel="Diagram visualization mode"
            activeTab={diagramView}
            onChange={setDiagramView}
            size="xs"
            tabs={[
              { id: 'animated-svg', label: 'Animated SVG', icon: Play },
              { id: 'ascii-dfd', label: 'Level-0 & Level-1 DFD', shortLabel: 'ASCII DFD', icon: FileText },
            ]}
          />
        </div>

        {/* Standard Definition & Complexity Callout */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 text-xs space-y-1">
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Standard Technical Definition:{' '}
            </span>
            <span className="text-slate-700 dark:text-slate-300 leading-5">
              {flow.standardDefinition}
            </span>
          </div>
          <div className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
            Runtime &amp; Complexity: {flow.complexity}
          </div>
        </div>

        {/* Interactive Two-Zone Sandbox: Diagram (Left 7) + Step Narration & Controls (Right 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Animated SVG or ASCII DFD */}
          <div className="lg:col-span-7 space-y-4">
            {diagramView === 'animated-svg' ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4">
                <svg
                  viewBox="0 0 670 250"
                  role="img"
                  aria-label={flow.title}
                  className="w-full h-auto max-h-[280px]"
                >
                  <defs>
                    <marker
                      id="lang-arrow-muted"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                    <marker
                      id="lang-arrow-active"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {flow.edges.map((edge) => {
                    const from = nodeMap.get(edge.from);
                    const to = nodeMap.get(edge.to);
                    if (!from || !to) return null;
                    const { x1, y1, x2, y2 } = getEdgePoints(from, to);
                    const isActive = currentStep.activeEdgeIds.includes(edge.id);
                    const mx = (x1 + x2) / 2;
                    const my = (y1 + y2) / 2 - 8;
                    return (
                      <g key={edge.id}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isActive ? '#0284c7' : '#94a3b8'}
                          strokeWidth={isActive ? 2.5 : 1.5}
                          strokeDasharray={isActive ? '6 4' : undefined}
                          markerEnd={isActive ? 'url(#lang-arrow-active)' : 'url(#lang-arrow-muted)'}
                          opacity={isActive ? 1 : 0.5}
                        />
                        <text
                          x={mx}
                          y={my}
                          textAnchor="middle"
                          className={`text-[10px] font-mono ${
                            isActive
                              ? 'fill-sky-700 dark:fill-sky-300 font-semibold'
                              : 'fill-slate-500 dark:fill-slate-400'
                          }`}
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {flow.nodes.map((node) => {
                    const isActive = currentStep.activeNodeIds.includes(node.id);
                    return (
                      <g key={node.id}>
                        <rect
                          x={node.x - NODE_W / 2}
                          y={node.y - NODE_H / 2}
                          width={NODE_W}
                          height={NODE_H}
                          rx="10"
                          strokeWidth={isActive ? 2.2 : 1.2}
                          className={
                            isActive
                              ? 'fill-sky-50 dark:fill-sky-950/90 stroke-sky-600 dark:stroke-sky-400'
                              : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                          }
                        />
                        <text
                          x={node.x}
                          y={node.y - 4}
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-slate-900 dark:fill-slate-100"
                        >
                          {node.label}
                        </text>
                        <text
                          x={node.x}
                          y={node.y + 13}
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                        >
                          {node.sublabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Animated Traveling Packet */}
                  {packetCoords && (
                    <g transform={`translate(${packetCoords.x}, ${packetCoords.y})`}>
                      <circle r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                      {currentStep.packetLabel && (
                        <text
                          y="-11"
                          textAnchor="middle"
                          className="text-[10px] font-mono font-bold fill-sky-700 dark:fill-sky-300"
                        >
                          {currentStep.packetLabel}
                        </text>
                      )}
                    </g>
                  )}
                </svg>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Standard Level-0 &amp; Level-1 Data Flow Blueprint
                  </span>
                  <CopyButton text={fullAscii} label="Copy DFD" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
                  {fullAscii}
                </pre>
              </div>
            )}

            {/* Playback & Speed Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (stepIdx >= flow.steps.length - 1) setStepIdx(0);
                    setIsPlaying((v) => !v);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      {stepIdx >= flow.steps.length - 1 ? 'Replay' : 'Play Animation'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx((p) => Math.max(0, p - 1));
                  }}
                  disabled={stepIdx === 0}
                  aria-label="Previous step"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx((p) => Math.min(flow.steps.length - 1, p + 1));
                  }}
                  disabled={stepIdx >= flow.steps.length - 1}
                  aria-label="Next step"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(0);
                  }}
                  aria-label="Reset animation"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Speed:</span>
                {[
                  { label: 'Slow', ms: 3200 },
                  { label: 'Normal', ms: 2200 },
                  { label: 'Fast', ms: 1300 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSpeedMs(opt.ms)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                      speedMs === opt.ms
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Step-by-Step Simple English & Technical Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-sky-700 dark:text-sky-400">
                <span className="font-semibold">
                  Step {currentStep.stepNumber} of {flow.steps.length}
                </span>
                <span className="tabular-nums">
                  {Math.round(((stepIdx + 1) / flow.steps.length) * 100)}%
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {currentStep.title}
              </h3>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  In Simple English
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
                  {currentStep.plainEnglish}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                  Under the Hood (Runtime Mechanics)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                  {currentStep.technicalDetail}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {currentStep.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
                  >
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{m.label}</div>
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Selector Pills */}
            <div className="grid grid-cols-2 gap-2">
              {flow.steps.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(idx);
                  }}
                  className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                    idx === stepIdx
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 font-semibold text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="truncate">{s.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
