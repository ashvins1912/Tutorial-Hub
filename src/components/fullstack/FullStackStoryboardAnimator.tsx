import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Cpu,
  Database,
  FileText,
  Layers,
  Network,
  Pause,
  Play,
  RotateCcw,
  Server,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  ASCII_MEMORY_LAYOUT,
  FOUNDATIONAL_MENTAL_MODEL,
  LEVEL0_MERMAID,
  LEVEL1_MERMAID,
  STORYBOARD_FRAMES,
} from '../../data/fullStackArchitectureData';
import { CopyButton, SegmentedTabBar } from '../ui';

const PIPELINE_STAGES = [
  { id: 'edge', label: 'Edge Proxy', sub: 'Nginx / Envoy', x: 58 },
  { id: 'framework', label: 'App Framework', sub: 'FastAPI / WebFlux', x: 186 },
  { id: 'database', label: 'PG + Redis', sub: 'PgBouncer / WAL', x: 314 },
  { id: 'vector', label: 'Vector DB', sub: 'HNSW / AVX-512', x: 442 },
  { id: 'engine', label: 'vLLM Engine', sub: 'PagedAttention', x: 570 },
  { id: 'gpu', label: 'GPU HBM3', sub: 'Tensor Cores', x: 698 },
];

export function FullStackStoryboardAnimator() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(2100);
  const [blueprintTab, setBlueprintTab] = useState<'level1-mermaid' | 'level0-mermaid' | 'ascii-memory'>('level1-mermaid');

  const frame = STORYBOARD_FRAMES[frameIdx] ?? STORYBOARD_FRAMES[0];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setFrameIdx((prev) => {
        if (prev + 1 >= STORYBOARD_FRAMES.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs]);

  const activeBlueprintText =
    blueprintTab === 'level1-mermaid'
      ? `\`\`\`mermaid\n${LEVEL1_MERMAID}\n\`\`\``
      : blueprintTab === 'level0-mermaid'
        ? `\`\`\`mermaid\n${LEVEL0_MERMAID}\n\`\`\``
        : ASCII_MEMORY_LAYOUT;

  return (
    <div className="space-y-6">
      {/* Section 1: Foundational Definitions & First-Principles Mental Model */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div>
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Section 01 · First-Principles Mental Model
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {FOUNDATIONAL_MENTAL_MODEL.topic}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs leading-5">
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300">
              Plain-English Definition
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              {FOUNDATIONAL_MENTAL_MODEL.plainEnglish}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Rigorous Systems &amp; Mathematical Definition
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {FOUNDATIONAL_MENTAL_MODEL.rigorousDefinition}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Real-World Physical Analogy
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {FOUNDATIONAL_MENTAL_MODEL.realWorldAnalogy}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1">
            <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Where the Analogy Breaks Down + The Engineering &ldquo;Why&rdquo;
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              {FOUNDATIONAL_MENTAL_MODEL.whereAnalogyBreaksDown}{' '}
              <strong className="text-slate-900 dark:text-slate-100">Why this architecture exists:</strong>{' '}
              {FOUNDATIONAL_MENTAL_MODEL.engineeringWhy}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Synchronized 9-Frame Full-Stack Execution Storyboard */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
              Section 02 · Frame-by-Frame Synchronized Execution Storyboard ({STORYBOARD_FRAMES.length} Frames)
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Watch Network Sockets, Event Loops, GPU VRAM &amp; PostgreSQL Mutate Together
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (frameIdx >= STORYBOARD_FRAMES.length - 1) setFrameIdx(0);
                setIsPlaying((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  Pause Storyboard
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  {frameIdx >= STORYBOARD_FRAMES.length - 1 ? 'Replay T+0ms' : 'Play Storyboard'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setFrameIdx((i) => Math.max(0, i - 1));
              }}
              disabled={frameIdx === 0}
              aria-label="Previous frame"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setFrameIdx((i) => Math.min(STORYBOARD_FRAMES.length - 1, i + 1));
              }}
              disabled={frameIdx >= STORYBOARD_FRAMES.length - 1}
              aria-label="Next frame"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setFrameIdx(0);
              }}
              aria-label="Reset storyboard"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <select
              aria-label="Playback speed"
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-700 dark:text-slate-200"
            >
              <option value={3200}>Slow</option>
              <option value={2100}>Normal</option>
              <option value={1200}>Fast</option>
            </select>
          </div>
        </div>

        {/* SVG Horizontal Full-Stack Pipeline */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4">
          <svg
            viewBox="0 0 760 100"
            role="img"
            aria-label="End-to-End Full-Stack Request Pipeline"
            className="w-full h-auto max-h-[108px]"
          >
            {PIPELINE_STAGES.slice(0, -1).map((stage, i) => {
              const next = PIPELINE_STAGES[i + 1];
              const lit = stage.id === frame.activeStageId || next.id === frame.activeStageId;
              return (
                <line
                  key={`link-${stage.id}`}
                  x1={stage.x + 54}
                  y1={50}
                  x2={next.x - 54}
                  y2={50}
                  stroke={lit ? '#0284c7' : '#94a3b8'}
                  strokeWidth={lit ? 2.5 : 1.5}
                  strokeDasharray={lit ? '5 4' : undefined}
                />
              );
            })}
            {PIPELINE_STAGES.map((stage) => {
              const active = stage.id === frame.activeStageId;
              return (
                <g key={stage.id}>
                  <rect
                    x={stage.x - 54}
                    y={20}
                    width={108}
                    height={60}
                    rx={10}
                    strokeWidth={active ? 2.2 : 1.2}
                    className={
                      active
                        ? 'fill-sky-50 dark:fill-sky-950 stroke-sky-600 dark:stroke-sky-400'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                    }
                  />
                  <text
                    x={stage.x}
                    y={46}
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-slate-900 dark:fill-slate-100"
                  >
                    {stage.label}
                  </text>
                  <text
                    x={stage.x}
                    y={62}
                    textAnchor="middle"
                    className="text-[9.5px] font-mono fill-slate-500 dark:fill-slate-400"
                  >
                    {stage.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Clickable Frame Scrubber Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {STORYBOARD_FRAMES.map((item, idx) => {
            const active = idx === frameIdx;
            return (
              <button
                key={item.frame}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setFrameIdx(idx);
                }}
                className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-[10px] font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  F{item.frame} · {item.timestamp}
                </div>
                <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5">
                  {item.phase}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Frame Narration + 4 Synchronized Subsystem State Boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-sky-700 dark:text-sky-400">
                [Frame {frame.frame}: {frame.timestamp}] · {frame.phase}
              </span>
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                {frameIdx + 1}/{STORYBOARD_FRAMES.length}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
              {frame.title}
            </h3>
            <div className="space-y-1 text-xs leading-5">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                Simple English
              </div>
              <p className="text-slate-700 dark:text-slate-300">{frame.plainEnglish}</p>
            </div>
            <div className="space-y-1 text-xs leading-5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="font-semibold text-sky-700 dark:text-sky-400">
                Systems &amp; Wire-Level Mechanics
              </div>
              <p className="text-slate-600 dark:text-slate-400">{frame.technicalDetail}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {frame.metrics.map((m) => (
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

          {/* Synchronized 4-Layer Hardware & Software State Box */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: 'Network / Socket / SSE Buffer',
                value: frame.stateBoxes.networkSocket,
                icon: Network,
              },
              {
                label: 'Web Framework & Event Loop / Thread Pool',
                value: frame.stateBoxes.frameworkLoop,
                icon: Server,
              },
              {
                label: 'GPU VRAM / Tensor Cores / KV-Cache',
                value: frame.stateBoxes.gpuVram,
                icon: Cpu,
              },
              {
                label: 'DB Pool / Buffer Pool / Vector / WAL',
                value: frame.stateBoxes.dbStorage,
                icon: Database,
              },
            ].map((box) => {
              const Icon = box.icon;
              return (
                <div
                  key={box.label}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-sky-400">
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{box.label}</span>
                  </div>
                  <p className="font-mono text-xs leading-5 text-slate-200">{box.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mermaid Level-0 / Level-1 DFDs & ASCII GPU Memory Layout */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Mermaid.js Architecture DFDs &amp; GPU VRAM Memory Layout
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Copy-ready Mermaid.js diagrams and PagedAttention HBM3 memory block layouts for architecture RFCs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedTabBar<'level1-mermaid' | 'level0-mermaid' | 'ascii-memory'>
              ariaLabel="Architecture diagram format"
              activeTab={blueprintTab}
              onChange={setBlueprintTab}
              size="xs"
              tabs={[
                { id: 'level1-mermaid', label: 'Level-1 DFD (Mermaid)', shortLabel: 'Level-1', icon: FileText },
                { id: 'level0-mermaid', label: 'Level-0 Context', shortLabel: 'Level-0' },
                { id: 'ascii-memory', label: 'HBM3 VRAM Layout', shortLabel: 'VRAM Layout' },
              ]}
            />
            <CopyButton text={activeBlueprintText} label="Copy" copiedLabel="Copied" size="xs" />
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
          {activeBlueprintText}
        </pre>
      </section>
    </div>
  );
}
