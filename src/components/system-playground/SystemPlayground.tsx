import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChevronLeft, ChevronRight, Cpu, Database, Flame, Layers, ShieldAlert, X } from 'lucide-react';
import { CATEGORY_META } from '../../data/componentCatalog';
import { PLAYGROUND_ARCHITECTURE_EXPLANATIONS } from '../../data/realWorldPlaygroundBlueprints';
import { useAsyncCatalog } from '../../hooks/useAsyncCatalog';
import { useSystemStore } from '../../store/useSystemStore';
import type { ComponentType, SystemNode } from '../../types/system';
import { AnimatedTrafficEdge } from './AnimatedTrafficEdge';
import { AuditModal } from './AuditModal';
import { CustomSystemNode } from './CustomSystemNode';
import { InspectorDrawer } from './InspectorDrawer';
import { RequestTracerModal } from './RequestTracerModal';
import { SidebarPalette } from './SidebarPalette';
import { TopControlBar } from './TopControlBar';

const nodeTypes: NodeTypes = {
  systemNode: CustomSystemNode,
};

const edgeTypes: EdgeTypes = {
  animatedTraffic: AnimatedTrafficEdge,
};

function PlaygroundWorkspaceInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { data: blueprintsList } = useAsyncCatalog('system-design-blueprints');
  useAsyncCatalog('system-design-components');

  const nodes = useSystemStore((s) => s.nodes);
  const edges = useSystemStore((s) => s.edges);
  const activeBlueprintId = useSystemStore((s) => s.activeBlueprintId);
  const isSimulating = useSystemStore((s) => s.isSimulating);
  const showWalkthrough = useSystemStore((s) => s.showWalkthrough);
  const activeWalkthroughStep = useSystemStore((s) => s.activeWalkthroughStep);

  const onNodesChange = useSystemStore((s) => s.onNodesChange);
  const onEdgesChange = useSystemStore((s) => s.onEdgesChange);
  const onConnect = useSystemStore((s) => s.onConnect);
  const loadBlueprint = useSystemStore((s) => s.loadBlueprint);
  const clearCanvas = useSystemStore((s) => s.clearCanvas);
  const addNodeFromCatalog = useSystemStore((s) => s.addNodeFromCatalog);
  const selectNode = useSystemStore((s) => s.selectNode);
  const runTick = useSystemStore((s) => s.runTick);
  const setShowWalkthrough = useSystemStore((s) => s.setShowWalkthrough);
  const setActiveWalkthroughStep = useSystemStore((s) => s.setActiveWalkthroughStep);
  const highlightNodes = useSystemStore((s) => s.highlightNodes);

  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  // 500ms high-frequency simulation tick loop
  useEffect(() => {
    if (!isSimulating) return;
    const timer = window.setInterval(() => {
      runTick();
    }, 500);
    return () => window.clearInterval(timer);
  }, [isSimulating, runTick]);

  // Fit viewport nicely when switching blueprints
  const triggerFitView = useCallback(() => {
    window.setTimeout(() => {
      void fitView({ padding: 0.18, duration: 320 });
    }, 40);
  }, [fitView]);

  useEffect(() => {
    triggerFitView();
  }, [triggerFitView]);

  const handleSelectBlueprint = useCallback(
    (id: string) => {
      loadBlueprint(id);
      triggerFitView();
    },
    [loadBlueprint, triggerFitView],
  );

  const handleClearCanvas = useCallback(() => {
    clearCanvas();
    triggerFitView();
  }, [clearCanvas, triggerFitView]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/systemforge-component') as ComponentType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNodeFromCatalog(type, {
        x: Math.round(position.x - 115),
        y: Math.round(position.y - 45),
      });
    },
    [screenToFlowPosition, addNodeFromCatalog],
  );

  const handleQuickAdd = useCallback(
    (type: ComponentType) => {
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const offset = (nodes.length % 6) * 28;
      if (bounds) {
        const pos = screenToFlowPosition({
          x: bounds.left + bounds.width * 0.45 + offset,
          y: bounds.top + bounds.height * 0.42 + offset,
        });
        addNodeFromCatalog(type, { x: Math.round(pos.x), y: Math.round(pos.y) });
      } else {
        addNodeFromCatalog(type, { x: 260 + offset, y: 200 + offset });
      }
    },
    [nodes.length, screenToFlowPosition, addNodeFromCatalog],
  );

  const handleFocusNodes = useCallback(
    (nodeIds: string[]) => {
      highlightNodes(nodeIds);
      if (nodeIds.length > 0) {
        window.setTimeout(() => {
          void fitView({
            nodes: nodeIds.map((id) => ({ id })),
            padding: 0.45,
            duration: 380,
          });
        }, 40);
      }
    },
    [highlightNodes, fitView],
  );

  const activeBlueprint = activeBlueprintId
    ? blueprintsList.find((bp) => bp.id === activeBlueprintId) ?? null
    : null;
  const activeExplanation = activeBlueprintId
    ? PLAYGROUND_ARCHITECTURE_EXPLANATIONS[activeBlueprintId] ?? null
    : null;
  const walkthroughSteps = activeBlueprint?.architecturalWalkthrough ?? [];
  const currentWalkthrough = walkthroughSteps[activeWalkthroughStep] ?? null;

  const miniMapNodeColor = useCallback((node: SystemNode) => {
    if (node.data.status === 'OFFLINE' || node.data.metrics.isOverloaded) return '#ef4444';
    if (node.data.status === 'DEGRADED') return '#f59e0b';
    return CATEGORY_META[node.data.category]?.accentHex ?? '#38bdf8';
  }, []);

  const containerClass = useMemo(
    () =>
      isFullscreen
        ? 'fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100'
        : 'rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden flex flex-col h-[calc(100vh-14.5rem)] min-h-[640px] shadow-xl',
    [isFullscreen],
  );

  return (
    <div className={containerClass}>
      <TopControlBar
        onSelectBlueprint={handleSelectBlueprint}
        onClearCanvas={handleClearCanvas}
        onToggleMobilePalette={() => setMobilePaletteOpen((v) => !v)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          setIsFullscreen((v) => !v);
          triggerFitView();
        }}
        showExplanation={showExplanation}
        onToggleExplanation={() => setShowExplanation((v) => !v)}
      />

      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Left Palette */}
        <SidebarPalette
          onQuickAdd={handleQuickAdd}
          isOpenMobile={mobilePaletteOpen}
          onCloseMobile={() => setMobilePaletteOpen(false)}
        />

        {/* Center Interactive React Flow Canvas */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 relative min-w-0 h-full bg-slate-950"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => selectNode(node.id)}
            onPaneClick={() => selectNode(null)}
            className="dark"
            fitView
            minZoom={0.25}
            maxZoom={1.75}
            defaultEdgeOptions={{ type: 'animatedTraffic', animated: true }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1.2}
              color="#1e293b"
            />
            <Controls
              position="bottom-right"
              className="!bg-slate-900 !border-slate-700 !rounded-xl !shadow-lg [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-200 [&>button:hover]:!bg-slate-800"
            />
            <MiniMap
              position="top-right"
              pannable
              zoomable
              nodeColor={miniMapNodeColor}
              maskColor="rgba(2, 6, 23, 0.72)"
              className="hidden md:block !bg-slate-900/95 !border !border-slate-800 !rounded-xl"
            />
          </ReactFlow>

          {/* Dismissible Blueprint Architectural Walkthrough Banner (Bottom-Left) */}
          {showWalkthrough && activeBlueprint && currentWalkthrough && (
            <div className="absolute bottom-3 left-3 z-20 max-w-md w-[calc(100%-5.5rem)] sm:w-auto rounded-xl border border-slate-700/90 bg-slate-900/95 backdrop-blur-sm p-3.5 shadow-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-sky-400 flex items-center gap-1.5">
                    <span>{activeBlueprint.shortName}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Step {currentWalkthrough.step}/{walkthroughSteps.length}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{currentWalkthrough.tier}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mt-0.5">
                    {currentWalkthrough.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWalkthrough(false)}
                  aria-label="Dismiss architectural walkthrough"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentWalkthrough.description}
              </p>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleFocusNodes(currentWalkthrough.highlightNodeIds)}
                  className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                >
                  Highlight Tier on Canvas
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={activeWalkthroughStep <= 0}
                    onClick={() => {
                      const nextIdx = Math.max(0, activeWalkthroughStep - 1);
                      setActiveWalkthroughStep(nextIdx);
                    }}
                    aria-label="Previous walkthrough step"
                    className="p-1 rounded-md border border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={activeWalkthroughStep >= walkthroughSteps.length - 1}
                    onClick={() => {
                      const nextIdx = Math.min(walkthroughSteps.length - 1, activeWalkthroughStep + 1);
                      setActiveWalkthroughStep(nextIdx);
                    }}
                    aria-label="Next walkthrough step"
                    className="p-1 rounded-md border border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtle Hint when no node is selected */}
          <div className="pointer-events-none hidden sm:flex absolute top-3 left-3 z-10 items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/85 border border-slate-800 text-[11px] text-slate-400">
            <span>Click any node to configure replicas, inject chaos, or trace JSON packets</span>
          </div>
        </div>

        {/* Full Real-World Architecture Explanation Side Panel */}
        {showExplanation && activeBlueprint && activeExplanation && (
          <aside className="hidden lg:flex w-[360px] xl:w-[400px] shrink-0 border-l border-slate-800 bg-slate-900/95 flex-col min-h-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-start justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-sky-400">
                  {activeExplanation.domain}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug">
                  {activeBlueprint.name}
                </h3>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {activeBlueprint.scaleTag}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                aria-label="Close architecture explanation panel"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
              {/* Formal Definition & Why */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                  Formal Definition &amp; Design Rationale
                </div>
                <p className="text-slate-200">{activeExplanation.formalDefinition}</p>
                <p className="text-slate-400">{activeExplanation.whyThisArchitectureExists}</p>
              </div>

              {/* Request Flow Path */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-1">
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  End-to-End Request Flow
                </div>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                  {activeExplanation.requestFlowSummary}
                </p>
              </div>

              {/* Capacity & Scale Math */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 space-y-1">
                <div className="text-[11px] font-mono text-sky-400 font-semibold">
                  Capacity &amp; Scale Math
                </div>
                <p className="text-slate-300 font-mono tabular-nums text-[11px] leading-relaxed">
                  {activeExplanation.capacityAndScaleMath}
                </p>
              </div>

              {/* Core Named Algorithms */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                  Core Algorithms &amp; Primitives
                </div>
                <div className="space-y-2">
                  {activeExplanation.coreAlgorithms.map((alg) => (
                    <div
                      key={alg.name}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 space-y-0.5"
                    >
                      <div className="font-semibold text-slate-100">{alg.name}</div>
                      <div className="text-slate-400">{alg.role}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database & Sharding */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  Database, Caching &amp; Sharding
                </div>
                <p className="text-slate-300">{activeExplanation.databaseAndShardingStrategy}</p>
              </div>

              {/* Critical Bottlenecks */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                  Critical Production Bottlenecks
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                  {activeExplanation.criticalBottlenecks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Chaos & Failure Playbook */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                  Live Chaos &amp; Failure Playbook
                </div>
                <div className="space-y-2">
                  {activeExplanation.failureAndChaosPlaybook.map((item) => (
                    <div
                      key={item.trigger}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 space-y-0.5"
                    >
                      <div className="font-mono text-[11px] font-semibold text-amber-300">
                        Try: {item.trigger}
                      </div>
                      <div className="text-slate-300">{item.systemResponse}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Click-to-Focus Architectural Tiers */}
              {walkthroughSteps.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-300">
                    Focus Tiers on Live Canvas
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {walkthroughSteps.map((st, idx) => (
                      <button
                        key={st.step}
                        type="button"
                        onClick={() => {
                          setActiveWalkthroughStep(idx);
                          handleFocusNodes(st.highlightNodeIds);
                        }}
                        className="text-left rounded-lg border border-slate-800 bg-slate-950/70 hover:border-sky-500 px-2.5 py-2 transition-colors"
                      >
                        <div className="text-[11px] font-mono text-sky-400">
                          Tier {st.step} · {st.tier}
                        </div>
                        <div className="text-xs font-medium text-slate-100 mt-0.5">
                          {st.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Right Node Inspector & Chaos Drawer */}
        <InspectorDrawer />
      </div>

      {/* Modals */}
      <AuditModal onFocusNodes={handleFocusNodes} />
      <RequestTracerModal />
    </div>
  );
}

export const SystemPlayground: React.FC = () => {
  return (
    <ReactFlowProvider>
      <PlaygroundWorkspaceInner />
    </ReactFlowProvider>
  );
};
