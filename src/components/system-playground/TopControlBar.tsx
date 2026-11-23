import React from 'react';
import {
  Activity,
  BookOpen,
  FileText,
  Maximize2,
  Minimize2,
  PanelLeft,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';
import { useSystemStore } from '../../store/useSystemStore';
import { formatRps } from './iconMap';

interface TopControlBarProps {
  onSelectBlueprint: (id: string) => void;
  onClearCanvas: () => void;
  onToggleMobilePalette: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showExplanation: boolean;
  onToggleExplanation: () => void;
  showTrafficWidget: boolean;
  onToggleTrafficWidget: () => void;
}

// Logarithmic mapping so slider moves smoothly across 100 RPS -> 1,000,000 RPS
const MIN_LOG = Math.log10(100); // 2
const MAX_LOG = Math.log10(1_000_000); // 6

function rpsToSlider(rps: number): number {
  const clamped = Math.max(100, Math.min(1_000_000, rps));
  return Math.round(((Math.log10(clamped) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 1000);
}

function sliderToRps(sliderVal: number): number {
  const ratio = Math.max(0, Math.min(1, sliderVal / 1000));
  const raw = Math.pow(10, MIN_LOG + ratio * (MAX_LOG - MIN_LOG));
  if (raw < 1000) return Math.round(raw / 50) * 50;
  if (raw < 10_000) return Math.round(raw / 500) * 500;
  if (raw < 100_000) return Math.round(raw / 1000) * 1000;
  return Math.round(raw / 5000) * 5000;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  onSelectBlueprint,
  onClearCanvas,
  onToggleMobilePalette,
  isFullscreen,
  onToggleFullscreen,
  showExplanation,
  onToggleExplanation,
  showTrafficWidget,
  onToggleTrafficWidget,
}) => {
  const { data: BLUEPRINT_LIST } = useAsyncCatalog('system-design-blueprints');
  const activeBlueprintId = useSystemStore((s) => s.activeBlueprintId);
  const isSimulating = useSystemStore((s) => s.isSimulating);
  const baseEntryRps = useSystemStore((s) => s.baseEntryRps);
  const spikeMultiplier = useSystemStore((s) => s.spikeMultiplier);
  const summary = useSystemStore((s) => s.summary);
  const auditReport = useSystemStore((s) => s.auditReport);
  const showWalkthrough = useSystemStore((s) => s.showWalkthrough);

  const toggleSimulation = useSystemStore((s) => s.toggleSimulation);
  const setBaseEntryRps = useSystemStore((s) => s.setBaseEntryRps);
  const toggleTrafficSpike = useSystemStore((s) => s.toggleTrafficSpike);
  const openAuditModal = useSystemStore((s) => s.openAuditModal);
  const resetChaosStates = useSystemStore((s) => s.resetChaosStates);
  const setShowWalkthrough = useSystemStore((s) => s.setShowWalkthrough);

  const isSpiking = spikeMultiplier > 1;
  const effectiveRps = Math.round(baseEntryRps * spikeMultiplier);
  const grade = auditReport?.grade ?? 'A';
  const issueCount = auditReport?.findings.length ?? 0;

  const gradeColorClass =
    grade === 'S' || grade === 'A'
      ? 'text-emerald-300'
      : grade === 'B' || grade === 'C'
        ? 'text-amber-300'
        : 'text-rose-300';

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-100">
      {/* Left: Palette Toggle (Mobile) + Blueprint Selector */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleMobilePalette}
          aria-label="Open component palette"
          className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200 hover:border-sky-500 whitespace-nowrap shrink-0"
        >
          <PanelLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Nodes</span>
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="blueprint-selector" className="sr-only">
            Load System Architecture Blueprint
          </label>
          <select
            id="blueprint-selector"
            value={activeBlueprintId ?? '__blank__'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '__blank__') onClearCanvas();
              else onSelectBlueprint(val);
            }}
            className="max-w-[235px] sm:max-w-[290px] rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-sky-500"
          >
            <optgroup label={`Real-World System Blueprints (${BLUEPRINT_LIST.length})`}>
              {BLUEPRINT_LIST.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Custom Topology">
              <option value="__blank__">Blank Canvas (Start From Scratch)</option>
            </optgroup>
          </select>

          {activeBlueprintId && (
            <>
              <button
                type="button"
                onClick={() => setShowWalkthrough(!showWalkthrough)}
                title="Toggle step-by-step tier walkthrough"
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  showWalkthrough
                    ? 'border-sky-500/60 bg-sky-500/15 text-sky-300'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Guide</span>
              </button>

              <button
                type="button"
                onClick={onToggleExplanation}
                title="Open complete architecture explanation, scale math, algorithms & chaos playbook"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  showExplanation
                    ? 'border-emerald-500/70 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-sky-500 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Architecture Spec</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleTrafficWidget}
            aria-pressed={showTrafficWidget}
            title="Toggle synchronized animated packet flow, bottleneck & failover simulator"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              showTrafficWidget
                ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-sky-500 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Packet Flow</span>
          </button>
        </div>
      </div>

      {/* Center: Play/Pause + Logarithmic Traffic Generator + 10x Spike + Live Summary */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={toggleSimulation}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            isSimulating
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Simulate</span>
            </>
          )}
        </button>

        {/* Traffic Slider */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
          <label
            htmlFor="traffic-rps-slider"
            className="text-[11px] text-slate-400 whitespace-nowrap"
          >
            Ingress
          </label>
          <input
            id="traffic-rps-slider"
            type="range"
            min={0}
            max={1000}
            value={rpsToSlider(baseEntryRps)}
            onChange={(e) => setBaseEntryRps(sliderToRps(Number(e.target.value)))}
            aria-label="Ingress requests per second"
            className="w-24 sm:w-32 accent-sky-500 cursor-pointer"
          />
          <span className="text-xs font-mono tabular-nums font-semibold text-sky-300 min-w-[66px] text-right">
            {formatRps(effectiveRps)}/s
          </span>
        </div>

        {/* 10x Traffic Spike Toggle */}
        <button
          type="button"
          onClick={toggleTrafficSpike}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            isSpiking
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
          }`}
        >
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isSpiking ? '10x Spike Active' : '10x Traffic Spike'}</span>
        </button>

        {/* Live Aggregate Telemetry (Clean unboxed tabular strip) */}
        <div className="hidden xl:flex items-center gap-3 px-2 text-xs font-mono tabular-nums text-slate-300 border-l border-slate-800 pl-3">
          <span className="flex items-center gap-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>OK</span>
            <strong className="text-slate-100">{formatRps(summary.totalDeliveredRps)}/s</strong>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>
            <span className="text-slate-400">Avg </span>
            <strong className={summary.avgLatencyMs > 150 ? 'text-amber-400' : 'text-slate-100'}>
              {summary.avgLatencyMs}ms
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>
            <span className="text-slate-400">Err </span>
            <strong
              className={
                summary.globalErrorRatePct > 5
                  ? 'text-rose-400'
                  : summary.globalErrorRatePct > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }
            >
              {summary.globalErrorRatePct}%
            </strong>
          </span>
        </div>
      </div>

      {/* Right: Audit Design + Reset Chaos + Fullscreen */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={openAuditModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Audit Design</span>
          <span className={`font-mono tabular-nums pl-1 border-l border-indigo-400/50 ${gradeColorClass}`}>
            {grade}
            {issueCount > 0 ? ` (${issueCount})` : ''}
          </span>
        </button>

        <button
          type="button"
          onClick={resetChaosStates}
          title="Restore all nodes to ONLINE and stop traffic spike"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Heal All</span>
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit expanded workspace' : 'Expand playground workspace'}
          aria-label={isFullscreen ? 'Exit expanded workspace' : 'Expand playground workspace'}
          className="p-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};
