import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  GitBranch,
  Layers,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Server,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  CLIENT_TOKEN_STREAMING_STAGES,
  FRONTIER_LLM_PLATFORMS,
  LLM_INTERNAL_ALGORITHMS,
  PLATFORM_COMPARISON_ROWS,
  type FrontierLlmPlatformId,
  type LlmInternalAlgorithmSpec,
} from '../../data/llmFrontierArchitectureData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { CopyButton } from '../ui';

interface FrontierLlmArchitectureLabProps {
  externalSimulateSignal?: number;
  onActivePlatformChange?: (platformId: FrontierLlmPlatformId) => void;
}

type AlgoCategoryFilter = 'All' | LlmInternalAlgorithmSpec['category'];

const ALGO_CATEGORIES: AlgoCategoryFilter[] = [
  'All',
  'Tokenization & Position',
  'Transformer & Attention',
  'Serving & GPU Memory',
  'Decoding & Client Stream',
];

export const FrontierLlmArchitectureLab: React.FC<FrontierLlmArchitectureLabProps> = ({
  externalSimulateSignal,
  onActivePlatformChange,
}) => {
  const [platformId, setPlatformId] = useState<FrontierLlmPlatformId>('chatgpt');
  const [diagramMode, setDiagramMode] = useState<'dfd' | 'sequence'>('dfd');
  const [showCompareMatrix, setShowCompareMatrix] = useState<boolean>(false);

  // Live Data Flow & Token-Float Simulation state
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Internal Algorithms Explorer state
  const [algoCategory, setAlgoCategory] = useState<AlgoCategoryFilter>('All');
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(LLM_INTERNAL_ALGORITHMS[0].id);

  const activePlatform = useMemo(
    () => FRONTIER_LLM_PLATFORMS.find((p) => p.id === platformId) ?? FRONTIER_LLM_PLATFORMS[0],
    [platformId]
  );

  useEffect(() => {
    onActivePlatformChange?.(platformId);
  }, [platformId, onActivePlatformChange]);

  // Reset hop cursor when switching between ChatGPT / Gemini / Claude
  useEffect(() => {
    setStepIdx(0);
  }, [platformId]);

  // Respond immediately to the System Design Studio header "Simulate Data Flow" trigger
  useEffect(() => {
    if (!externalSimulateSignal) return;
    setDiagramMode('dfd');
    setStepIdx(0);
    setIsSimulating(true);
  }, [externalSimulateSignal]);

  // Simulation playback loop
  useEffect(() => {
    if (!isSimulating) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % activePlatform.flowSteps.length);
    }, 1850);
    return () => window.clearInterval(timer);
  }, [isSimulating, activePlatform.flowSteps.length]);

  const activeHop = activePlatform.flowSteps[stepIdx] ?? activePlatform.flowSteps[0];

  const visitedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < stepIdx; i++) {
      ids.add(activePlatform.flowSteps[i].nodeId);
    }
    return Array.from(ids);
  }, [activePlatform.flowSteps, stepIdx]);

  const cumulativeLatencyMs = useMemo(
    () =>
      activePlatform.flowSteps
        .slice(0, stepIdx + 1)
        .reduce((sum, h) => sum + h.latencyMs, 0),
    [activePlatform.flowSteps, stepIdx]
  );

  const streamedTokensSoFar = useMemo(
    () =>
      activePlatform.flowSteps
        .slice(0, stepIdx + 1)
        .map((h) => h.streamedTokenChunk)
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [activePlatform.flowSteps, stepIdx]
  );

  const dynamicMermaid = useMemo(
    () =>
      diagramMode === 'dfd'
        ? activePlatform.buildArchitectureMermaid(activeHop.nodeId, visitedNodeIds)
        : activePlatform.sequenceMermaid,
    [diagramMode, activePlatform, activeHop.nodeId, visitedNodeIds]
  );

  const filteredAlgos = useMemo(
    () =>
      algoCategory === 'All'
        ? LLM_INTERNAL_ALGORITHMS
        : LLM_INTERNAL_ALGORITHMS.filter((a) => a.category === algoCategory),
    [algoCategory]
  );

  const activeAlgo = useMemo(
    () =>
      filteredAlgos.find((a) => a.id === selectedAlgoId) ??
      filteredAlgos[0] ??
      LLM_INTERNAL_ALGORITHMS[0],
    [filteredAlgos, selectedAlgoId]
  );

  return (
    <div className="space-y-6">
      {/* Top Studio Header & Platform Switcher */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Frontier LLM Serving Architecture · ChatGPT, Google Gemini &amp; Anthropic Claude
            </p>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              How Frontier AI Systems Work Internally — Algorithms, GPU/TPU Serving &amp; Client Token Streaming
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Trace a live prompt from browser HTTP/2 SSE connection through BPE/SentencePiece tokenization, RoPE, FlashAttention, Sparse MoE, PagedAttention KV-Cache, Continuous Batching, and Speculative Decoding back into floating client token chunks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCompareMatrix((v) => !v)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors shrink-0 self-start ${
              showCompareMatrix
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-sky-500'
            }`}
          >
            {showCompareMatrix ? 'Hide Side-by-Side Comparison' : 'Compare ChatGPT vs Gemini vs Claude'}
          </button>
        </div>

        {/* 3 Frontier Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FRONTIER_LLM_PLATFORMS.map((platform) => {
            const active = platform.id === activePlatform.id;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setPlatformId(platform.id)}
                className={`p-4 rounded-xl border text-left transition-colors space-y-1.5 ${
                  active
                    ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {platform.vendor}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {platform.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 line-clamp-2">
                  {platform.flagshipStack}
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Side-by-Side Architectural Comparison Table */}
        {showCompareMatrix && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <th className="p-3">Architecture Dimension</th>
                  <th className="p-3 text-sky-700 dark:text-sky-400">ChatGPT (OpenAI)</th>
                  <th className="p-3 text-emerald-700 dark:text-emerald-400">Google Gemini</th>
                  <th className="p-3 text-amber-700 dark:text-amber-400">Anthropic Claude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {PLATFORM_COMPARISON_ROWS.map((row) => (
                  <tr key={row.dimension} className="bg-white dark:bg-slate-900">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {row.dimension}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{row.chatgpt}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{row.gemini}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{row.claude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* LIVE REQUEST DATA-FLOW & TOKEN-FLOAT SIMULATOR */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
              Live Request Path &amp; Client Token-Float Visualizer
            </p>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {activePlatform.name} — Step {activeHop.step}/{activePlatform.flowSteps.length}: {activeHop.phase}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setDiagramMode('dfd')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  diagramMode === 'dfd'
                    ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Architecture DFD
              </button>
              <button
                type="button"
                onClick={() => setDiagramMode('sequence')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  diagramMode === 'sequence'
                    ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Token Sequence
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSimulating((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 text-white text-xs font-semibold transition-colors"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Pause Flow' : 'Simulate Data Flow'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSimulating(false);
                setStepIdx((prev) => (prev - 1 + activePlatform.flowSteps.length) % activePlatform.flowSteps.length);
              }}
              aria-label="Previous flow step"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSimulating(false);
                setStepIdx((prev) => (prev + 1) % activePlatform.flowSteps.length);
              }}
              aria-label="Next flow step"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSimulating(false);
                setStepIdx(0);
              }}
              aria-label="Reset simulation"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Interactive Diagram + Live Client Token-Float Telemetry */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8">
            <FlightMermaidViewer
              title={`${activePlatform.vendor} Serving Topology (Active Node: ${activeHop.nodeId})`}
              subtitle="Blue = Active Request Hop · Emerald = Completed Path Hops · Click any hop below to inspect."
              mermaidCode={dynamicMermaid}
            />
          </div>

          {/* Right Panel: Active Hop Deep Inspection & Live Client Token-Float Stream */}
          <div className="xl:col-span-4 space-y-3">
            <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-semibold text-sky-700 dark:text-sky-400">
                  HOP {activeHop.step} · {activeHop.layer}
                </span>
                <span className="tabular-nums text-slate-600 dark:text-slate-400">
                  +{activeHop.latencyMs}ms (Total {cumulativeLatencyMs}ms)
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {activeHop.phase}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeHop.internalLogic}
              </p>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-[11px] font-mono text-slate-800 dark:text-slate-200 break-all">
                {activeHop.wireSample}
              </div>
            </div>

            {/* Live Client Token-Float Viewport */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  CLIENT TOKEN STREAM VIEWPORT
                </span>
                <span className="tabular-nums text-slate-500">
                  {streamedTokensSoFar.length} chunk(s)
                </span>
              </div>

              {streamedTokensSoFar.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 py-3">
                  Waiting for TTFT (Prefill + KV-Cache load)... Advance to Step 6+ to watch tokens float across SSE into the browser!
                </p>
              ) : (
                <div className="space-y-2.5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs leading-relaxed text-slate-900 dark:text-slate-100 font-medium">
                    {streamedTokensSoFar.map((t) => t.tokenText).join('')}
                    {isSimulating && (
                      <span className="inline-block w-1.5 h-3.5 bg-sky-500 align-middle ml-0.5" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {streamedTokensSoFar.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 tabular-nums"
                      >
                        &ldquo;{t.tokenText.trim()}&rdquo; #{t.tokenId} ({t.logprob})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clickable 8-Hop Timeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {activePlatform.flowSteps.map((hop, idx) => {
            const isCurrent = idx === stepIdx;
            const isDone = idx < stepIdx;
            return (
              <button
                key={hop.step}
                type="button"
                onClick={() => {
                  setIsSimulating(false);
                  setStepIdx(idx);
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                    : isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                  <span className="font-semibold text-sky-700 dark:text-sky-400">#{hop.step}</span>
                  <span className="text-slate-500">{hop.latencyMs}ms</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-2">
                  {hop.phase}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PLATFORM ARCHITECTURE SPECIFICATION BREAKDOWN */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Complete System Definition &amp; Production Infrastructure
          </p>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {activePlatform.name} — Internal Subsystem Design
          </h4>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          {activePlatform.formalDefinition}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-mono text-[10px] uppercase text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Hardware &amp; Interconnect Fabric
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activePlatform.hardwareFabric}
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Tokenizer &amp; Multimodal Input
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activePlatform.tokenizerSpec}
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-mono text-[10px] uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Context Window &amp; KV-Cache
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activePlatform.contextAndCacheSpec}
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-mono text-[10px] uppercase text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Client Streaming Wire Protocol
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activePlatform.streamingProtocolSpec}
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 md:col-span-2">
            <div className="font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              Safety Guardrails, Grounding &amp; Agentic Tooling
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {activePlatform.safetyAndToolingSpec}
            </p>
          </div>
        </div>
      </section>

      {/* 10 COMPLETE INTERNAL ALGORITHMS & IMPLEMENTATION LOGIC */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Complete Under-the-Hood Algorithms ({LLM_INTERNAL_ALGORITHMS.length} Core Mechanisms)
            </p>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Formal Definitions, Step-by-Step Algorithmic Logic &amp; Production Implementation
            </h4>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALGO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setAlgoCategory(cat)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  algoCategory === cat
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Algorithm List */}
          <div className="lg:col-span-4 space-y-2">
            {filteredAlgos.map((algo) => {
              const selected = algo.id === activeAlgo.id;
              return (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setSelectedAlgoId(algo.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-colors ${
                    selected
                      ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                    <span className="text-sky-700 dark:text-sky-400 font-semibold">
                      #{String(algo.number).padStart(2, '0')} · {algo.category}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {algo.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {algo.bottleneckType}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detailed Algorithm Spec & Code */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {activeAlgo.number}. {activeAlgo.name}
                </h5>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300">
                  {activeAlgo.bottleneckType}
                </span>
              </div>

              <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                Complexity &amp; Impact: {activeAlgo.complexity}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-400">
                    Plain-English Mental Model
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeAlgo.plainEnglish}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                  <div className="font-mono text-[10px] uppercase text-sky-700 dark:text-sky-400">
                    Formal Technical Definition
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeAlgo.formalDefinition}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Step-by-Step Algorithmic Logic
                </div>
                <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeAlgo.stepByStepLogic.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-400 shrink-0">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <strong>Production Deployment:</strong> {activeAlgo.usedBy}
              </div>
            </div>

            {/* Copyable Reference Implementation */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Reference Implementation Logic
                </span>
                <CopyButton text={activeAlgo.implementationCode} label="Copy Code" />
              </div>
              <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-950/[0.02] dark:bg-slate-950 overflow-x-auto">
                <code>{activeAlgo.implementationCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CLIENTS CONNECT & HOW TOKENS FLOAT FROM GPU TO BROWSER DOM */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            End-to-End Wire-to-DOM Token Streaming Blueprint
          </p>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            How Clients Connect &amp; How Tokens Float in Real Time (6 Production Stages)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CLIENT_TOKEN_STREAMING_STAGES.map((st) => (
            <div
              key={st.stage}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-sky-700 dark:text-sky-400">STAGE {st.stage}</span>
                <span className="text-slate-500">{st.protocolLayer}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {st.title}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {st.whatHappens}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-2">
                <Terminal className="w-3 h-3 inline mr-1 text-emerald-600 dark:text-emerald-400" />
                {st.engineeringDetail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
