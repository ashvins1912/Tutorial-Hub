import { create } from 'zustand';
import {
  addEdge,
  type Connection,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import { BLUEPRINTS } from '../data/blueprints';
import { COMPONENT_CATALOG_MAP } from '../data/componentCatalog';
import {
  selectBundleData,
  useContentBootstrapStore,
} from './useContentBootstrapStore';
import { analyzeArchitecture } from '../engine/architectureJudge';
import {
  runSimulationTick,
  traceSingleRequest,
  type SimulationTickResult,
} from '../engine/simulationEngine';
import {
  createEmptyMetrics,
  type AuditAutoFixAction,
  type AuditReport,
  type ComponentType,
  type NodeConfig,
  type NodeStatus,
  type RequestTraceResult,
  type SystemEdge,
  type SystemNode,
} from '../types/system';

export interface SystemStoreState {
  nodes: SystemNode[];
  edges: SystemEdge[];
  activeBlueprintId: string | null;
  selectedNodeId: string | null;

  // Simulation controls
  isSimulating: boolean;
  baseEntryRps: number;
  spikeMultiplier: number;
  tickCount: number;
  summary: SimulationTickResult['summary'];

  // Walkthrough, Audit & Request Tracer
  showWalkthrough: boolean;
  activeWalkthroughStep: number;
  isAuditModalOpen: boolean;
  auditReport: AuditReport | null;
  highlightedNodeIds: string[];
  lastTraceResult: RequestTraceResult | null;
  isTraceModalOpen: boolean;

  // React Flow handlers
  onNodesChange: OnNodesChange<SystemNode>;
  onEdgesChange: OnEdgesChange<SystemEdge>;
  onConnect: (connection: Connection) => void;

  // Graph mutations
  loadBlueprint: (blueprintId: string) => void;
  clearCanvas: () => void;
  addNodeFromCatalog: (type: ComponentType, position: { x: number; y: number }, customLabel?: string) => string;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, patch: Partial<NodeConfig>) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  resetChaosStates: () => void;

  // Simulation actions
  setBaseEntryRps: (rps: number) => void;
  toggleTrafficSpike: () => void;
  toggleSimulation: () => void;
  runTick: () => void;

  // Walkthrough & Highlighting
  setShowWalkthrough: (open: boolean) => void;
  setActiveWalkthroughStep: (idx: number) => void;
  highlightNodes: (nodeIds: string[]) => void;

  // Architecture Judge & Tracer
  openAuditModal: () => void;
  closeAuditModal: () => void;
  refreshAudit: () => AuditReport;
  applyAutoFix: (action: AuditAutoFixAction) => void;
  runRequestTrace: (targetNodeId: string) => void;
  closeTraceModal: () => void;
}

function cloneBlueprintGraph(blueprintId: string): {
  nodes: SystemNode[];
  edges: SystemEdge[];
  recommendedEntryRps: number;
} {
  const catalogBlueprints = selectBundleData(
    useContentBootstrapStore.getState(),
    'system-design-blueprints'
  );
  const bp =
    catalogBlueprints.find((item) => item.id === blueprintId) ?? BLUEPRINTS[blueprintId];
  if (!bp) {
    return { nodes: [], edges: [], recommendedEntryRps: 5_000 };
  }
  const nodes: SystemNode[] = bp.nodes.map((n) => ({
    ...n,
    position: { ...n.position },
    data: {
      ...n.data,
      config: { ...n.data.config },
      metrics: createEmptyMetrics(),
      impact: { ...n.data.impact, bestPractices: [...n.data.impact.bestPractices] },
      mockPayloads: { ...n.data.mockPayloads },
      isHighlighted: false,
    },
  }));
  const edges: SystemEdge[] = bp.edges.map((e) => ({
    ...e,
    data: e.data ? { ...e.data } : undefined,
  }));
  return { nodes, edges, recommendedEntryRps: bp.recommendedEntryRps };
}

function createNodeInstance(
  type: ComponentType,
  position: { x: number; y: number },
  customLabel?: string,
): SystemNode {
  const catalogComponents = selectBundleData(
    useContentBootstrapStore.getState(),
    'system-design-components'
  );
  const catalog =
    catalogComponents.find((item) => item.type === type) ?? COMPONENT_CATALOG_MAP[type];
  const uniqueId = `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: uniqueId,
    type: 'systemNode',
    position,
    data: {
      componentType: type,
      category: catalog.category,
      label: customLabel ?? catalog.name,
      subtitle: catalog.shortSubtitle,
      status: 'ONLINE',
      config: { ...catalog.defaultConfig },
      metrics: createEmptyMetrics(),
      impact: {
        ...catalog.impact,
        bestPractices: [...catalog.impact.bestPractices],
      },
      mockPayloads: { ...catalog.mockPayloads },
      isHighlighted: false,
    },
  };
}

// Bootstrap default UPI Real-Time Payment System with initial simulation tick + audit
const initialUpi = cloneBlueprintGraph('upi-payment-system');
const initialTick = runSimulationTick(
  initialUpi.nodes,
  initialUpi.edges,
  initialUpi.recommendedEntryRps,
  1,
);
const initialAudit = analyzeArchitecture(
  initialTick.nodes,
  initialTick.edges,
  initialUpi.recommendedEntryRps,
);

export const useSystemStore = create<SystemStoreState>((set, get) => ({
  nodes: initialTick.nodes,
  edges: initialTick.edges,
  activeBlueprintId: 'upi-payment-system',
  selectedNodeId: null,

  isSimulating: true,
  baseEntryRps: initialUpi.recommendedEntryRps,
  spikeMultiplier: 1,
  tickCount: 1,
  summary: initialTick.summary,

  showWalkthrough: true,
  activeWalkthroughStep: 0,
  isAuditModalOpen: false,
  auditReport: initialAudit,
  highlightedNodeIds: [],
  lastTraceResult: null,
  isTraceModalOpen: false,

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: changes.applyTo(state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: changes.applyTo(state.edges),
    }));
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    set((state) => {
      const nextEdges = addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${Date.now().toString(36)}`,
          type: 'animatedTraffic',
          animated: true,
          data: {
            activeRps: 0,
            droppedRps: 0,
            packetSpeedMs: 1400,
            healthColor: '#10b981',
            status: 'IDLE',
          },
        },
        state.edges,
      );
      const tick = runSimulationTick(
        state.nodes,
        nextEdges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * state.spikeMultiplier,
        ),
      };
    });
  },

  loadBlueprint: (blueprintId) => {
    const cloned = cloneBlueprintGraph(blueprintId);
    const tick = runSimulationTick(cloned.nodes, cloned.edges, cloned.recommendedEntryRps, 1);
    const audit = analyzeArchitecture(tick.nodes, tick.edges, cloned.recommendedEntryRps);
    set({
      nodes: tick.nodes,
      edges: tick.edges,
      activeBlueprintId: blueprintId,
      selectedNodeId: null,
      baseEntryRps: cloned.recommendedEntryRps,
      spikeMultiplier: 1,
      tickCount: 1,
      summary: tick.summary,
      showWalkthrough: true,
      activeWalkthroughStep: 0,
      highlightedNodeIds: [],
      auditReport: audit,
      lastTraceResult: null,
      isTraceModalOpen: false,
    });
  },

  clearCanvas: () => {
    const clientNode = createNodeInstance('client', { x: 80, y: 220 }, 'Client Traffic');
    const tick = runSimulationTick([clientNode], [], 5_000, 1);
    set({
      nodes: tick.nodes,
      edges: [],
      activeBlueprintId: null,
      selectedNodeId: null,
      baseEntryRps: 5_000,
      spikeMultiplier: 1,
      tickCount: 1,
      summary: tick.summary,
      showWalkthrough: false,
      activeWalkthroughStep: 0,
      highlightedNodeIds: [],
      auditReport: analyzeArchitecture(tick.nodes, [], 5_000),
      lastTraceResult: null,
      isTraceModalOpen: false,
    });
  },

  addNodeFromCatalog: (type, position, customLabel) => {
    const newNode = createNodeInstance(type, position, customLabel);
    set((state) => {
      const nextNodes = [...state.nodes, newNode];
      const tick = runSimulationTick(
        nextNodes,
        state.edges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        selectedNodeId: newNode.id,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * state.spikeMultiplier,
        ),
      };
    });
    return newNode.id;
  },

  deleteNode: (nodeId) => {
    set((state) => {
      const nextNodes = state.nodes.filter((n) => n.id !== nodeId);
      const nextEdges = state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      const tick = runSimulationTick(
        nextNodes,
        nextEdges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * state.spikeMultiplier,
        ),
      };
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => {
      const nextEdges = state.edges.filter((e) => e.id !== edgeId);
      const tick = runSimulationTick(
        state.nodes,
        nextEdges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * state.spikeMultiplier,
        ),
      };
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  updateNodeConfig: (nodeId, patch) => {
    set((state) => {
      const nextNodes = state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                config: { ...n.data.config, ...patch },
              },
            }
          : n,
      );
      const tick = runSimulationTick(
        nextNodes,
        state.edges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * state.spikeMultiplier,
        ),
      };
    });
  },

  updateNodeStatus: (nodeId, status) => {
    set((state) => {
      const nextNodes = state.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                status,
              },
            }
          : n,
      );
      const tick = runSimulationTick(
        nextNodes,
        state.edges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * state.spikeMultiplier,
        ),
      };
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
      ),
    }));
  },

  resetChaosStates: () => {
    set((state) => {
      const nextNodes = state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, status: 'ONLINE' as NodeStatus, isHighlighted: false },
      }));
      const tick = runSimulationTick(nextNodes, state.edges, state.baseEntryRps, 1);
      return {
        nodes: tick.nodes,
        edges: tick.edges,
        spikeMultiplier: 1,
        highlightedNodeIds: [],
        summary: tick.summary,
        auditReport: analyzeArchitecture(tick.nodes, tick.edges, state.baseEntryRps),
      };
    });
  },

  setBaseEntryRps: (rps) => {
    const clamped = Math.max(100, Math.min(1_000_000, Math.round(rps)));
    set((state) => {
      const tick = runSimulationTick(
        state.nodes,
        state.edges,
        clamped,
        state.spikeMultiplier,
      );
      return {
        baseEntryRps: clamped,
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
      };
    });
  },

  toggleTrafficSpike: () => {
    set((state) => {
      const nextMult = state.spikeMultiplier === 1 ? 10 : 1;
      const tick = runSimulationTick(state.nodes, state.edges, state.baseEntryRps, nextMult);
      return {
        spikeMultiplier: nextMult,
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        auditReport: analyzeArchitecture(
          tick.nodes,
          tick.edges,
          state.baseEntryRps * nextMult,
        ),
      };
    });
  },

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  runTick: () => {
    const state = get();
    if (!state.isSimulating) return;
    // Slight organic +/-3% traffic jitter so live metrics feel real without jarring jumps
    const jitter = 0.98 + ((state.tickCount * 17) % 5) * 0.01;
    const tick = runSimulationTick(
      state.nodes,
      state.edges,
      Math.round(state.baseEntryRps * jitter),
      state.spikeMultiplier,
    );
    set({
      nodes: tick.nodes,
      edges: tick.edges,
      summary: tick.summary,
      tickCount: state.tickCount + 1,
    });
  },

  setShowWalkthrough: (open) => {
    if (!open) {
      set((state) => ({
        showWalkthrough: false,
        highlightedNodeIds: [],
        nodes: state.nodes.map((n) => ({ ...n, data: { ...n.data, isHighlighted: false } })),
      }));
    } else {
      set({ showWalkthrough: true });
    }
  },

  setActiveWalkthroughStep: (idx) => {
    const state = get();
    const bp = state.activeBlueprintId ? BLUEPRINTS[state.activeBlueprintId] : null;
    const step = bp?.architecturalWalkthrough[idx];
    const highlightSet = new Set(step?.highlightNodeIds ?? []);
    set({
      activeWalkthroughStep: idx,
      highlightedNodeIds: Array.from(highlightSet),
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: highlightSet.has(n.id) },
      })),
    });
  },

  highlightNodes: (nodeIds) => {
    const setIds = new Set(nodeIds);
    set((state) => ({
      highlightedNodeIds: nodeIds,
      selectedNodeId: nodeIds.length === 1 ? nodeIds[0] : state.selectedNodeId,
      nodes: state.nodes.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: setIds.has(n.id) },
      })),
    }));
  },

  openAuditModal: () => {
    const state = get();
    const report = analyzeArchitecture(
      state.nodes,
      state.edges,
      state.baseEntryRps * state.spikeMultiplier,
    );
    set({ auditReport: report, isAuditModalOpen: true });
  },

  closeAuditModal: () => set({ isAuditModalOpen: false }),

  refreshAudit: () => {
    const state = get();
    const report = analyzeArchitecture(
      state.nodes,
      state.edges,
      state.baseEntryRps * state.spikeMultiplier,
    );
    set({ auditReport: report });
    return report;
  },

  applyAutoFix: (action) => {
    set((state) => {
      let nextNodes = [...state.nodes];
      let nextEdges = [...state.edges];

      if (action.type === 'UPDATE_CONFIG' && action.targetNodeId && action.configPatch) {
        nextNodes = nextNodes.map((n) =>
          n.id === action.targetNodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  config: { ...n.data.config, ...action.configPatch },
                },
              }
            : n,
        );
      } else if (
        action.type === 'ADD_NODE_BETWEEN' &&
        action.sourceNodeId &&
        action.targetNodeId &&
        action.newComponentType
      ) {
        const src = nextNodes.find((n) => n.id === action.sourceNodeId);
        const dst = nextNodes.find((n) => n.id === action.targetNodeId);
        if (src && dst) {
          const midPos = {
            x: Math.round((src.position.x + dst.position.x) / 2),
            y: Math.round((src.position.y + dst.position.y) / 2) - 40,
          };
          const inserted = createNodeInstance(action.newComponentType, midPos, action.newLabel);
          nextNodes.push(inserted);

          // Remove direct edge and re-wire source -> inserted -> target
          nextEdges = nextEdges.filter(
            (e) => !(e.source === src.id && e.target === dst.id),
          );
          nextEdges.push(
            {
              id: `e-fix-${src.id}-${inserted.id}`,
              source: src.id,
              target: inserted.id,
              type: 'animatedTraffic',
              animated: true,
              data: {
                activeRps: 0,
                droppedRps: 0,
                packetSpeedMs: 1200,
                healthColor: '#10b981',
                status: 'IDLE',
              },
            },
            {
              id: `e-fix-${inserted.id}-${dst.id}`,
              source: inserted.id,
              target: dst.id,
              type: 'animatedTraffic',
              animated: true,
              data: {
                activeRps: 0,
                droppedRps: 0,
                packetSpeedMs: 1200,
                healthColor: '#10b981',
                status: 'IDLE',
              },
            },
          );
        }
      } else if (
        action.type === 'ADD_ATTACHED_NODE' &&
        action.sourceNodeId &&
        action.newComponentType
      ) {
        const anchor = nextNodes.find((n) => n.id === action.sourceNodeId);
        if (anchor) {
          const pos = {
            x: anchor.position.x + 20,
            y: anchor.position.y + 185,
          };
          const added = createNodeInstance(action.newComponentType, pos, action.newLabel);
          nextNodes.push(added);
          nextEdges.push({
            id: `e-fix-${anchor.id}-${added.id}`,
            source: anchor.id,
            target: added.id,
            type: 'animatedTraffic',
            animated: true,
            data: {
              activeRps: 0,
              droppedRps: 0,
              packetSpeedMs: 1400,
              healthColor: '#10b981',
              status: 'IDLE',
            },
          });
        }
      }

      const tick = runSimulationTick(
        nextNodes,
        nextEdges,
        state.baseEntryRps,
        state.spikeMultiplier,
      );
      const report = analyzeArchitecture(
        tick.nodes,
        tick.edges,
        state.baseEntryRps * state.spikeMultiplier,
      );

      return {
        nodes: tick.nodes,
        edges: tick.edges,
        summary: tick.summary,
        auditReport: report,
      };
    });
  },

  runRequestTrace: (targetNodeId) => {
    const state = get();
    const result = traceSingleRequest(state.nodes, state.edges, targetNodeId);
    if (result) {
      set({
        lastTraceResult: result,
        isTraceModalOpen: true,
      });
    }
  },

  closeTraceModal: () => set({ isTraceModalOpen: false }),
}));
