import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ChevronRight,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  SYSTEM_DESIGN_MERMAID_BLUEPRINTS,
  type ArchMermaidNodeDetail,
} from '../../data/systemDesignMermaidFlowsData';
import type { FlightNodeData } from '../../data/flightSimulatorData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';

interface InteractiveSystemMermaidFlowsProps {
  onActiveBlueprintChange?: (archId: string) => void;
}

export const InteractiveSystemMermaidFlows: React.FC<InteractiveSystemMermaidFlowsProps> = ({
  onActiveBlueprintChange,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [archId, setArchId] = useState<string>(SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0].id);
  const [expandedFull, setExpandedFull] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0].nodes[4]?.id ??
      SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0].nodes[0].id
  );
  const [walkIdx, setWalkIdx] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    onActiveBlueprintChange?.(archId);
  }, [archId, onActiveBlueprintChange]);

  const activeArch = useMemo(
    () =>
      SYSTEM_DESIGN_MERMAID_BLUEPRINTS.find((a) => a.id === archId) ??
      SYSTEM_DESIGN_MERMAID_BLUEPRINTS[0],
    [archId]
  );

  // Map blueprint nodes into FlightNodeData shape so FlightMermaidViewer attaches real SVG click handlers!
  const clickableNodes: FlightNodeData[] = useMemo(
    () =>
      activeArch.nodes.map((n, idx) => ({
        id: n.id,
        type:
          n.layer === 'Database'
            ? 'postgresql'
            : n.layer === 'Edge'
              ? 'api-gateway'
              : n.layer === 'Cache & Queue'
                ? 'redis-cache'
                : 'order-worker',
        label: n.label,
        x: idx * 100,
        y: 0,
        techStack: n.tech,
        replicas: 2,
      })),
    [activeArch]
  );

  const selectedNode: ArchMermaidNodeDetail = useMemo(
    () =>
      activeArch.nodes.find((n) => n.id === selectedNodeId) ??
      activeArch.nodes[0],
    [activeArch, selectedNodeId]
  );

  useEffect(() => {
    const dbDefault =
      activeArch.nodes.find((n) => n.layer === 'Database') ?? activeArch.nodes[0];
    setSelectedNodeId(dbDefault.id);
    setWalkIdx(0);
    setIsAnimating(false);
  }, [activeArch.id]);

  useEffect(() => {
    if (!isAnimating || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setWalkIdx((prev) => {
        const next = (prev + 1) % activeArch.walkthroughOrder.length;
        const targetId = activeArch.walkthroughOrder[next];
        if (targetId) setSelectedNodeId(targetId);
        return next;
      });
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isAnimating, prefersReducedMotion, activeArch.walkthroughOrder]);

  const handleSelectNode = (nodeId: string) => {
    setIsAnimating(false);
    setSelectedNodeId(nodeId);
    const idx = activeArch.walkthroughOrder.indexOf(nodeId);
    if (idx >= 0) setWalkIdx(idx);
  };

  return (
    <div className="space-y-5">
      {/* Architecture Selector & Expand / Animate Controls */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <GitBranch className="w-3.5 h-3.5" aria-hidden="true" />
                Interactive System Design Mermaid Flows
              </span>
              <span aria-hidden="true">·</span>
              <span>Click Any Mermaid Node to Expand Database &amp; Component Connections</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              {activeArch.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              {activeArch.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setExpandedFull((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                expandedFull
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-sky-500'
              }`}
            >
              {expandedFull ? (
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {expandedFull ? 'Collapse to Overview Flow' : 'Expand Full DB & Component Flow'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isAnimating) {
                  const first = activeArch.walkthroughOrder[walkIdx] ?? activeArch.nodes[0].id;
                  setSelectedNodeId(first);
                }
                setIsAnimating((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 whitespace-nowrap"
            >
              {isAnimating ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isAnimating ? 'Pause Flow Walk' : 'Animate Request Flow'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAnimating(false);
                setWalkIdx(0);
                setSelectedNodeId(activeArch.walkthroughOrder[0] ?? activeArch.nodes[0].id);
              }}
              aria-label="Reset request walkthrough"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 4 Common Production Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SYSTEM_DESIGN_MERMAID_BLUEPRINTS.map((arch) => {
            const active = arch.id === activeArch.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => setArchId(arch.id)}
                className={`text-left rounded-xl border p-3 transition-colors space-y-1 ${
                  active
                    ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  {arch.domain}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {arch.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {arch.scaleTarget}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split: Clickable Architecture Mermaid Flow + Animated Expanding Component/DB Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-7 space-y-4">
          <FlightMermaidViewer
            title={
              expandedFull
                ? `${activeArch.name} — Expanded Subgraph & DB Internals Flow`
                : `${activeArch.name} — Click Any Node to Expand Internals`
            }
            subtitle={`Scale Profile: ${activeArch.scaleTarget} · Click directly on rendered Mermaid boxes or use the component selector below.`}
            mermaidCode={expandedFull ? activeArch.expandedFullMermaid : activeArch.overviewMermaid}
            nodes={clickableNodes}
            selectedNodeId={selectedNode.id}
            onSelectNodeId={handleSelectNode}
          />

          {/* Quick Interactive Component Strip (Synced with Mermaid Clicks & Request Walkthrough) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Click Any Component or Database Node to Reveal Internal Connections
              </span>
              <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {activeArch.nodes.length} nodes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {activeArch.nodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const isDb = node.layer === 'Database' || node.layer === 'Cache & Queue';
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleSelectNode(node.id)}
                    className={`text-left rounded-lg border px-3 py-2.5 transition-colors flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {isDb ? (
                          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                        ) : (
                          <Cpu className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                        )}
                        <span>{node.layer}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {node.label}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-sky-600 dark:text-sky-400 translate-x-0.5'
                          : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animated Expanded Component & Database Deep-Dive Panel */}
        <div className="xl:col-span-5">
          <AnimatePresence mode="wait">
            <motion.aside
              key={`${activeArch.id}-${selectedNode.id}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 sticky top-20"
            >
              <div className="space-y-1 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                    Expanded {selectedNode.layer} Internals
                  </span>
                  <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                    Budget: {selectedNode.latencyBudget}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  {selectedNode.label}
                </h3>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {selectedNode.tech}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-5 pt-1">
                  {selectedNode.role}
                </p>
              </div>

              {/* Expanded Node-Level / Database-Level Internal Mermaid Flow */}
              <FlightMermaidViewer
                compact
                title={`${selectedNode.label} — Internal Engine Flow (Mermaid)`}
                subtitle="Reveals internal data structures, concurrency control, caching, or replication mechanics."
                mermaidCode={selectedNode.expandedMermaid}
              />

              {/* Key Algorithms Used Inside This Component */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Core Algorithms &amp; Primitives
                </div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-5">
                  {selectedNode.keyAlgorithms.join(' · ')}
                </div>
              </div>

              {/* Detailed Component & Database Connections Table */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Detailed Component &amp; Database Connections
                </div>
                <div className="space-y-2">
                  {selectedNode.connections.map((conn) => (
                    <div
                      key={`${conn.direction}-${conn.peer}`}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                          <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
                            {conn.direction}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          <span>{conn.peer}</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {conn.protocol}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        {conn.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
