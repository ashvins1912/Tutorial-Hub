import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Database,
  GitBranch,
  Pause,
  Play,
  RotateCcw,
  Terminal,
  X,
} from 'lucide-react';
import {
  DB_QUERY_DATA_FLOW_SCENARIOS,
  matchScenarioForCustomSql,
} from '../../data/dbQueryDataFlowData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { CopyButton, SegmentedTabBar } from '../ui';

interface DbQueryDataFlowOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbQueryDataFlowOverlay: React.FC<DbQueryDataFlowOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>(DB_QUERY_DATA_FLOW_SCENARIOS[0].id);
  const [customSql, setCustomSql] = useState<string>('');
  const [diagramMode, setDiagramMode] = useState<'flowchart' | 'sequence'>('flowchart');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const activeScenario = useMemo(
    () =>
      DB_QUERY_DATA_FLOW_SCENARIOS.find((s) => s.id === selectedId) ??
      DB_QUERY_DATA_FLOW_SCENARIOS[0],
    [selectedId]
  );

  useEffect(() => {
    setStepIdx(0);
  }, [activeScenario.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % activeScenario.steps.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [isOpen, isPlaying, prefersReducedMotion, activeScenario.steps.length]);

  const activeStep =
    activeScenario.steps[Math.min(stepIdx, activeScenario.steps.length - 1)];

  const liveMermaidCode = useMemo(() => {
    if (diagramMode === 'sequence') return activeScenario.sequenceMermaid;
    return activeScenario.buildFlowchartMermaid(stepIdx);
  }, [activeScenario, diagramMode, stepIdx]);

  const handleTraceCustomSql = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = matchScenarioForCustomSql(customSql);
    setSelectedId(matched.id);
    setStepIdx(0);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Database Query Data Flow Propagation Overlay"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            {/* Sticky Overlay Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                    <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
                    Database Query &amp; Command Data Flow Overlay
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Live Step-Highlighted Mermaid.js Propagation Across Architecture Layers</span>
                </div>
                <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  End-to-End Query Execution &amp; Storage Propagation Tracer
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Data Flow overlay"
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-400 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Custom SQL Command Classifier + Preset Command Picker */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    1. Choose a Database Query / Command Flow
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DB_QUERY_DATA_FLOW_SCENARIOS.map((sc) => {
                      const active = sc.id === activeScenario.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(sc.id);
                            setIsPlaying(true);
                          }}
                          className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                            active
                              ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                            {sc.category}
                          </div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                            {sc.commandLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form
                  onSubmit={handleTraceCustomSql}
                  className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5"
                >
                  <label
                    htmlFor="custom-sql-flow-input"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Or Paste Any SQL / DB Command to Trace
                  </label>
                  <input
                    id="custom-sql-flow-input"
                    type="text"
                    value={customSql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    placeholder="e.g. UPDATE accounts ..., ORDER BY embedding <=> $1, GROUP BY..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Auto-routes to matching OLTP, ACID/CDC, Vector, LSM, OLAP, or ARIES flow.
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 whitespace-nowrap shrink-0"
                    >
                      Trace
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Active SQL Command Preview + Playback Bar */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900">
                  <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
                    <Database className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                    Executed Command · {activeScenario.category}
                  </div>
                  <CopyButton text={activeScenario.sqlOrCommand} label="Copy SQL" />
                </div>
                <pre className="p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto leading-5">
                  {activeScenario.sqlOrCommand}
                </pre>
              </div>

              {/* Playback Controls + Diagram View Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    {isPlaying ? 'Pause Propagation' : 'Play Propagation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIdx(
                        (prev) =>
                          (prev - 1 + activeScenario.steps.length) %
                          activeScenario.steps.length
                      );
                    }}
                    aria-label="Previous propagation layer"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIdx((prev) => (prev + 1) % activeScenario.steps.length);
                    }}
                    aria-label="Next propagation layer"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                  >
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIdx(0);
                    }}
                    aria-label="Reset propagation"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 text-slate-700 dark:text-slate-300 hover:border-sky-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 ml-1">
                    Hop {stepIdx + 1}/{activeScenario.steps.length} · Cumulative:{' '}
                    <strong className="text-sky-700 dark:text-sky-400">
                      {activeStep.cumulativeMs.toFixed(1)} ms
                    </strong>
                  </span>
                </div>

                <SegmentedTabBar<'flowchart' | 'sequence'>
                  ariaLabel="Mermaid diagram style"
                  activeTab={diagramMode}
                  onChange={setDiagramMode}
                  size="xs"
                  tabs={[
                    { id: 'flowchart', label: 'Layer Flowchart (Live Highlight)' },
                    { id: 'sequence', label: 'Sequence Diagram' },
                  ]}
                />
              </div>

              {/* Live Mermaid.js Propagation View */}
              <FlightMermaidViewer
                title={
                  diagramMode === 'flowchart'
                    ? `Layer-by-Layer Propagation — Active: ${activeStep.layer}`
                    : `End-to-End Sequence Diagram — ${activeScenario.category}`
                }
                subtitle={activeScenario.summary}
                mermaidCode={liveMermaidCode}
              />

              {/* Interactive Layer Step Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeScenario.steps.map((st, idx) => {
                  const isCurrent = idx === stepIdx;
                  const isPassed = idx < stepIdx;
                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setStepIdx(idx);
                      }}
                      className={`text-left rounded-xl border p-3 transition-colors space-y-1 ${
                        isCurrent
                          ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                          : isPassed
                            ? 'border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/40 dark:bg-emerald-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                        <span className="font-semibold text-sky-700 dark:text-sky-400">
                          {st.step}. {st.layer}
                        </span>
                        <span className="tabular-nums text-slate-500 dark:text-slate-400">
                          +{st.latencyMs.toFixed(1)} ms
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {st.title}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-4">
                        {st.detail}
                      </p>
                      <div className="pt-1 font-mono text-[10.5px] text-slate-700 dark:text-slate-300 truncate">
                        {st.artifact}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
