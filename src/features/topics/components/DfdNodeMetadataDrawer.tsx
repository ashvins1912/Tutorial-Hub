import { useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  Clock,
  HardDrive,
  PanelRightClose,
  Pin,
  PinOff,
  X,
} from 'lucide-react';
import type { CurriculumDfdGraph, CurriculumDfdNode } from '../types';

export type DfdDrawerMode = 'docked' | 'overlay';

interface DfdNodeMetadataDrawerProps {
  graph: CurriculumDfdGraph;
  node: CurriculumDfdNode;
  open: boolean;
  mode: DfdDrawerMode;
  onSelectNode: (nodeId: string) => void;
  onChangeMode: (mode: DfdDrawerMode) => void;
  onClose: () => void;
}

const KIND_LABELS: Record<CurriculumDfdNode['kind'], string> = {
  'external-input': 'External Input Entity',
  process: 'Core Process Stage',
  'data-store': 'Auxiliary Data Store',
  'external-output': 'Output Sink Entity',
};

export function DfdNodeMetadataDrawer({
  graph,
  node,
  open,
  mode,
  onSelectNode,
  onChangeMode,
  onClose,
}: DfdNodeMetadataDrawerProps) {
  const currentIdx = Math.max(
    0,
    graph.nodes.findIndex((n) => n.id === node.id),
  );
  const prevNode = currentIdx > 0 ? graph.nodes[currentIdx - 1] : null;
  const nextNode = currentIdx < graph.nodes.length - 1 ? graph.nodes[currentIdx + 1] : null;

  // Close overlay presentation on Escape (explicit overlay mode or responsive < 2xl overlay)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (mode === 'overlay' || window.innerWidth < 1536) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, mode, onClose]);

  if (!open) return null;

  const drawerBody = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">{node.code}</span>
              <span aria-hidden="true">·</span>
              <span>{KIND_LABELS[node.kind]}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Node {currentIdx + 1} of {graph.nodes.length}
              </span>
            </div>
            <h2 className="text-base font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
              {node.label}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {graph.topicTitle} · {graph.tier}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onChangeMode(mode === 'docked' ? 'overlay' : 'docked')}
              title={
                mode === 'docked'
                  ? 'Switch to floating overlay drawer'
                  : 'Pin as persistent side drawer'
              }
              aria-label={
                mode === 'docked'
                  ? 'Switch to floating overlay drawer'
                  : 'Pin as persistent side drawer'
              }
              className="hidden 2xl:inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-sky-500 transition-colors whitespace-nowrap"
            >
              {mode === 'docked' ? (
                <>
                  <PinOff className="w-3.5 h-3.5" aria-hidden="true" />
                  Overlay
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5" aria-hidden="true" />
                  Pin Side
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close DFD node metadata drawer"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mode === 'docked' ? (
                <PanelRightClose className="w-4 h-4" aria-hidden="true" />
              ) : (
                <X className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Segmented Node Quick Switcher */}
        <div
          role="tablist"
          aria-label="Curriculum DFD Nodes"
          className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950"
        >
          {graph.nodes.map((item) => {
            const active = item.id === node.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectNode(item.id)}
                className={`flex-1 px-2 py-1 rounded-md font-mono text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Metadata Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Primary 2x1 Complexity Grid: Time Complexity & Space Complexity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              <span>Time Complexity</span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums break-words">
              {node.timeComplexity}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <HardDrive
                className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <span>Space Complexity</span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums break-words">
              {node.spaceComplexity}
            </div>
          </div>
        </div>

        {/* Input & Output Specification Section */}
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <ArrowDownToLine
                  className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Input</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                From: {node.upstreamLabels.join(', ')}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-200 leading-relaxed break-words">
              {node.input}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                <ArrowUpFromLine
                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Output</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                To: {node.downstreamLabels.join(', ')}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-200 leading-relaxed break-words">
              {node.output}
            </p>
          </div>
        </div>

        {/* Stage Mechanics & Invariant */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Stage Mechanics &amp; Invariant
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {node.stageMechanics}
          </p>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Invariant: </span>
            {node.invariantNote}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Optimization: </span>
            {node.bottleneckNote}
          </div>
        </div>

        {/* Curriculum Complexity Tier Comparison (Fetched from CurriculumTopic.solutions) */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Curriculum Complexity Progression
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {graph.inputConstraint}
            </span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <th className="py-1.5 pr-2 font-medium">Tier</th>
                <th className="py-1.5 pr-2 font-medium">Time</th>
                <th className="py-1.5 font-medium">Space</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px] tabular-nums">
              <tr>
                <td className="py-1.5 pr-2 font-semibold text-rose-700 dark:text-rose-400">Brute</td>
                <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300">{graph.bruteTime}</td>
                <td className="py-1.5 text-slate-700 dark:text-slate-300">{graph.bruteSpace}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 font-semibold text-amber-700 dark:text-amber-400">Better</td>
                <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300">{graph.betterTime}</td>
                <td className="py-1.5 text-slate-700 dark:text-slate-300">{graph.betterSpace}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2 font-semibold text-emerald-700 dark:text-emerald-400">
                  Optimal
                </td>
                <td className="py-1.5 pr-2 font-semibold text-slate-900 dark:text-slate-100">
                  {graph.optimalTime}
                </td>
                <td className="py-1.5 font-semibold text-slate-900 dark:text-slate-100">
                  {graph.optimalSpace}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Edge Cases */}
        {node.edgeCases.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Critical Edge Cases
            </div>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {node.edgeCases.map((edgeCase, idx) => (
                <li key={idx} className="leading-relaxed">
                  · {edgeCase}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Prev / Next Node Traversal */}
      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-950/70">
        <button
          type="button"
          disabled={!prevNode}
          onClick={() => prevNode && onSelectNode(prevNode.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Prev Node
        </button>

        <button
          type="button"
          disabled={!nextNode}
          onClick={() => nextNode && onSelectNode(nextNode.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          Next Node
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  // Persistent Docked Side-Drawer on 2XL desktop; responsive overlay on narrower screens
  if (mode === 'docked') {
    return (
      <>
        {/* 2XL Persistent Side-Drawer Rail */}
        <aside
          aria-label="DFD Node Specification Drawer"
          className="hidden 2xl:block w-[360px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <div className="sticky top-16 h-[calc(100vh-4rem)]">{drawerBody}</div>
        </aside>

        {/* Below 2XL: Graceful Slide-Over Overlay Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${node.label} DFD Node Specifications`}
          className="2xl:hidden fixed inset-0 z-50 flex justify-end"
        >
          <div
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl">
            {drawerBody}
          </div>
        </div>
      </>
    );
  }

  // Explicit Floating Overlay Mode (all viewports)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${node.label} DFD Node Specifications`}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl">
        {drawerBody}
      </div>
    </div>
  );
}
