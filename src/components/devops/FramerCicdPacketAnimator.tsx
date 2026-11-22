import React, { useEffect, useReducer } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  GitCommitHorizontal,
  Pause,
  Play,
  Rocket,
  RotateCcw,
  Terminal,
  Wrench,
  XCircle,
} from 'lucide-react';

export type PipelineNodeId = 'git-push' | 'build' | 'registry' | 'deploy';
export type NodeRunStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped';
export type CicdFaultInjection = 'none' | 'build-fail' | 'registry-auth' | 'deploy-crashloop';

interface NodeLogSpec {
  id: PipelineNodeId;
  label: string;
  subtitle: string;
  toolLabel: string;
  durationMs: number;
  runnerHost: string;
  artifactMeta: string;
  successLogs: string[];
  failureLogs?: string[];
  failureRemediation?: string;
}

const PIPELINE_NODES: NodeLogSpec[] = [
  {
    id: 'git-push',
    label: 'Git Push',
    subtitle: 'Signed Commit & Gitleaks',
    toolLabel: 'GitHub / GitLab Hook',
    durationMs: 420,
    runnerHost: 'dev-laptop -> git.internal',
    artifactMeta: 'commit: a94f2c1 · branch: main (GPG verified)',
    successLogs: [
      '[00:00.08] pre-commit: running gitleaks v8.21.2 on 9 staged files...',
      '[00:00.24] gitleaks: 0 hardcoded secrets found (entropy check clean).',
      '[00:00.38] git push origin main -> webhook dispatched (202 Accepted).',
    ],
  },
  {
    id: 'build',
    label: 'Build & Scan',
    subtitle: 'Distroless + SBOM + Trivy',
    toolLabel: 'BuildKit + Syft + Trivy',
    durationMs: 1180,
    runnerHost: 'ephemeral-runner-us-east-4f9a',
    artifactMeta: 'image: 18.4 MB distroless · SBOM: cyclonedx.json',
    successLogs: [
      '[00:01.10] buildkit: cache HIT on go.mod layer (saved 41s).',
      '[00:02.04] docker build: Stage 2 distroless/static-debian12:nonroot built (18.4 MB).',
      '[00:02.45] syft: generated 42-package CycloneDX SBOM attestation.',
      '[00:02.88] trivy: 0 CRITICAL, 0 HIGH CVEs found. Exit code 0.',
    ],
    failureLogs: [
      '[00:01.10] buildkit: compiled binary successfully.',
      '[00:02.12] trivy: CRITICAL CVE-2025-4102 detected in libssl3 3.0.11.',
      '[00:02.14] ERROR: Quality gate failed (exit code 1). Halting pipeline.',
    ],
    failureRemediation: 'Bump base image digest to distroless/static-debian12:nonroot@sha256:9f41... and re-push.',
  },
  {
    id: 'registry',
    label: 'OCI Registry',
    subtitle: 'Cosign Sign & Digest Pin',
    toolLabel: 'ECR / Artifact Reg / Harbor',
    durationMs: 680,
    runnerHost: 'registry.prod.internal:443',
    artifactMeta: 'digest: sha256:81f0b9e442c1a9... (Cosign signed)',
    successLogs: [
      '[00:03.05] oidc: exchanged runner JWT for short-lived registry push token (TTL 15m).',
      '[00:03.44] oci-push: uploaded 3 immutable layers -> sha256:81f0b9e442c1a9.',
      '[00:03.71] cosign: attached keyless Fulcio signature + Rekor transparency log entry.',
    ],
    failureLogs: [
      '[00:03.05] oidc: presenting runner JWT to AWS IAM / ECR...',
      '[00:03.22] ERROR: AccessDeniedException: ecr:PutImage denied by IAM trust policy.',
      '[00:03.23] Pipeline halted before artifact mutation.',
    ],
    failureRemediation: 'Verify OIDC sub claim in IAM Role trust policy allows repo:org/checkout:ref:refs/heads/main.',
  },
  {
    id: 'deploy',
    label: 'GitOps Deploy',
    subtitle: 'ArgoCD Canary + SLO Guard',
    toolLabel: 'EKS / GKE / RKE2 Cluster',
    durationMs: 920,
    runnerHost: 'argocd-controller · prod-us-east-1',
    artifactMeta: 'rollout: v2.14.2 · 100% healthy (p99: 42ms)',
    successLogs: [
      '[00:04.01] argocd: detected new immutable digest sha256:81f0b9e442c1a9 in GitOps repo.',
      '[00:04.28] opa-gatekeeper: verified Cosign signature & non-root securityContext.',
      '[00:04.66] argo-rollouts: Canary 5% -> 25% -> 100% (5xx = 0.02% < 1.0% SLO).',
      '[00:04.92] SYNCED: Production traffic promoted cleanly with 0 dropped requests.',
    ],
    failureLogs: [
      '[00:04.01] argocd: synced Deployment checkout-api (v2.14.2).',
      '[00:04.41] kubelet: container checkout-api terminated (Reason: OOMKilled, Exit Code 137).',
      '[00:04.60] STATUS: CrashLoopBackOff (Restarts: 3).',
      '[00:04.85] argo-rollouts: SLO breach detected -> auto-aborted Canary back to 100% v2.14.1.',
    ],
    failureRemediation: 'Inspect heap profile, raise container memory limit from 512Mi -> 1Gi, or keep auto-rollback on v2.14.1.',
  },
];

interface FsmState {
  phase: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  activeIndex: number; // 0..3
  selectedNodeId: PipelineNodeId;
  fault: CicdFaultInjection;
  nodeStatuses: Record<PipelineNodeId, NodeRunStatus>;
  runCount: number;
}

type FsmAction =
  | { type: 'START' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'ADVANCE_TICK' }
  | { type: 'STEP_MANUAL' }
  | { type: 'RESET' }
  | { type: 'SELECT_NODE'; nodeId: PipelineNodeId }
  | { type: 'SET_FAULT'; fault: CicdFaultInjection };

const INITIAL_STATUSES: Record<PipelineNodeId, NodeRunStatus> = {
  'git-push': 'idle',
  build: 'idle',
  registry: 'idle',
  deploy: 'idle',
};

const initialState: FsmState = {
  phase: 'idle',
  activeIndex: -1,
  selectedNodeId: 'git-push',
  fault: 'none',
  nodeStatuses: { ...INITIAL_STATUSES },
  runCount: 0,
};

function isFaultAtNode(fault: CicdFaultInjection, nodeId: PipelineNodeId): boolean {
  return (
    (fault === 'build-fail' && nodeId === 'build') ||
    (fault === 'registry-auth' && nodeId === 'registry') ||
    (fault === 'deploy-crashloop' && nodeId === 'deploy')
  );
}

function advancePipeline(state: FsmState): FsmState {
  const nextIndex = state.activeIndex + 1;
  if (nextIndex >= PIPELINE_NODES.length) {
    return { ...state, phase: 'completed' };
  }

  const nextStatuses = { ...state.nodeStatuses };
  // Complete previous node if it was running
  if (state.activeIndex >= 0) {
    const prevId = PIPELINE_NODES[state.activeIndex].id;
    if (nextStatuses[prevId] === 'running') {
      nextStatuses[prevId] = 'success';
    }
  }

  const currentNode = PIPELINE_NODES[nextIndex];
  if (isFaultAtNode(state.fault, currentNode.id)) {
    nextStatuses[currentNode.id] = 'failed';
    for (let i = nextIndex + 1; i < PIPELINE_NODES.length; i += 1) {
      nextStatuses[PIPELINE_NODES[i].id] = 'skipped';
    }
    return {
      ...state,
      phase: 'failed',
      activeIndex: nextIndex,
      selectedNodeId: currentNode.id,
      nodeStatuses: nextStatuses,
    };
  }

  nextStatuses[currentNode.id] = 'running';

  // If this was the final node and no fault, mark running first; next tick completes it
  return {
    ...state,
    activeIndex: nextIndex,
    selectedNodeId: currentNode.id,
    nodeStatuses: nextStatuses,
  };
}

function fsmReducer(state: FsmState, action: FsmAction): FsmState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        phase: 'running',
        activeIndex: 0,
        selectedNodeId: 'git-push',
        runCount: state.runCount + 1,
        nodeStatuses: {
          'git-push': 'running',
          build: 'idle',
          registry: 'idle',
          deploy: 'idle',
        },
      };
    case 'TOGGLE_PAUSE':
      if (state.phase === 'running') return { ...state, phase: 'paused' };
      if (state.phase === 'paused') return { ...state, phase: 'running' };
      return state;
    case 'ADVANCE_TICK': {
      if (state.phase !== 'running') return state;
      if (state.activeIndex === PIPELINE_NODES.length - 1) {
        const lastId = PIPELINE_NODES[state.activeIndex].id;
        return {
          ...state,
          phase: 'completed',
          nodeStatuses: { ...state.nodeStatuses, [lastId]: 'success' },
        };
      }
      return advancePipeline(state);
    }
    case 'STEP_MANUAL': {
      if (state.phase === 'idle' || state.phase === 'completed' || state.phase === 'failed') {
        return {
          ...state,
          phase: 'paused',
          activeIndex: 0,
          selectedNodeId: 'git-push',
          runCount: state.runCount + 1,
          nodeStatuses: {
            'git-push': 'running',
            build: 'idle',
            registry: 'idle',
            deploy: 'idle',
          },
        };
      }
      if (state.activeIndex === PIPELINE_NODES.length - 1) {
        const lastId = PIPELINE_NODES[state.activeIndex].id;
        return {
          ...state,
          phase: 'completed',
          nodeStatuses: { ...state.nodeStatuses, [lastId]: 'success' },
        };
      }
      return { ...advancePipeline(state), phase: advancePipeline(state).phase === 'failed' ? 'failed' : 'paused' };
    }
    case 'RESET':
      return {
        ...state,
        phase: 'idle',
        activeIndex: -1,
        nodeStatuses: { ...INITIAL_STATUSES },
      };
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId };
    case 'SET_FAULT':
      return {
        ...state,
        fault: action.fault,
        phase: 'idle',
        activeIndex: -1,
        nodeStatuses: { ...INITIAL_STATUSES },
      };
    default:
      return state;
  }
}

const NODE_ICONS: Record<PipelineNodeId, React.ComponentType<{ className?: string }>> = {
  'git-push': GitCommitHorizontal,
  build: Wrench,
  registry: Box,
  deploy: Rocket,
};

export const FramerCicdPacketAnimator: React.FC = () => {
  const [state, dispatch] = useReducer(fsmReducer, initialState);
  const prefersReducedMotion = useReducedMotion();

  // Auto-advance timer when FSM is running
  useEffect(() => {
    if (state.phase !== 'running') return;
    const ms = prefersReducedMotion ? 500 : 1250;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'ADVANCE_TICK' });
    }, ms);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.activeIndex, prefersReducedMotion]);

  const selectedSpec =
    PIPELINE_NODES.find((n) => n.id === state.selectedNodeId) ?? PIPELINE_NODES[0];
  const selectedStatus = state.nodeStatuses[selectedSpec.id];

  const activeLogs =
    selectedStatus === 'failed' && selectedSpec.failureLogs
      ? selectedSpec.failureLogs
      : selectedStatus === 'success' || selectedStatus === 'running'
        ? selectedSpec.successLogs
        : selectedStatus === 'skipped'
          ? ['[SKIPPED] Upstream pipeline stage failed — promotion gate remains locked.']
          : ['[IDLE] Click "Trigger Git Push" to stream live execution logs for this stage.'];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-5">
      {/* Header + Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Framer Motion FSM Packet Visualizer · Git Push -&gt; Build -&gt; Registry -&gt; Deploy
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
            Animated CI/CD Packet Flow &amp; Node Log Inspector
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Run the state-machine pipeline to watch animated packets travel between stages. Click any pipeline node at any time to inspect live runner logs, exit codes, and artifact metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'START' })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            Trigger Git Push
          </button>
          {(state.phase === 'running' || state.phase === 'paused') && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
            >
              {state.phase === 'running' ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  Resume
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: 'STEP_MANUAL' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Fault Injection Selector */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Pipeline Fault Mode:</span>
        {(
          [
            { id: 'none', label: 'Clean Release' },
            { id: 'build-fail', label: 'Fail Build (Critical CVE)' },
            { id: 'registry-auth', label: 'Fail Registry (IAM Denied)' },
            { id: 'deploy-crashloop', label: 'Fail Deploy (CrashLoopBackOff)' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => dispatch({ type: 'SET_FAULT', fault: item.id })}
            className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors whitespace-nowrap ${
              state.fault === item.id
                ? item.id === 'none'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Framer Motion Packet-Flow Pipeline Track */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-[1fr_56px_1fr_56px_1fr_56px_1fr] items-center">
          {PIPELINE_NODES.map((node, idx) => {
            const Icon = NODE_ICONS[node.id];
            const status = state.nodeStatuses[node.id];
            const isSelected = state.selectedNodeId === node.id;
            const isOutgoingFlowActive =
              idx < PIPELINE_NODES.length - 1 &&
              (state.nodeStatuses[node.id] === 'success' ||
                (state.phase === 'running' && state.activeIndex === idx));

            const statusLabel =
              status === 'running'
                ? 'IN PROGRESS'
                : status === 'success'
                  ? 'PASSED'
                  : status === 'failed'
                    ? 'FAILED'
                    : status === 'skipped'
                      ? 'LOCKED'
                      : 'IDLE';

            return (
              <React.Fragment key={node.id}>
                <motion.button
                  type="button"
                  onClick={() => dispatch({ type: 'SELECT_NODE', nodeId: node.id })}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  animate={
                    status === 'failed' && !prefersReducedMotion
                      ? { x: [0, -4, 4, -2, 2, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.35 }}
                  className={`text-left rounded-xl border p-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-sky-500 ${
                    status === 'failed'
                      ? 'border-rose-400 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40'
                      : status === 'success'
                        ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : status === 'running'
                          ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  } ${isSelected ? 'ring-2 ring-sky-500/70' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon className="w-4 h-4 text-slate-700 dark:text-slate-200 shrink-0" aria-hidden="true" />
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        status === 'failed'
                          ? 'text-rose-700 dark:text-rose-300'
                          : status === 'success'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : status === 'running'
                              ? 'text-sky-700 dark:text-sky-300'
                              : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {node.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {node.subtitle}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    <span>{node.durationMs}ms</span>
                    <span className={isSelected ? 'text-sky-700 dark:text-sky-300 font-semibold' : ''}>
                      {isSelected ? 'Viewing Logs' : 'Inspect ->'}
                    </span>
                  </div>
                </motion.button>

                {/* Animated Packet Connector between stages */}
                {idx < PIPELINE_NODES.length - 1 && (
                  <div className="relative flex items-center justify-center h-6">
                    <div
                      className={`h-0.5 w-full ${
                        isOutgoingFlowActive
                          ? 'bg-sky-500 dark:bg-sky-400'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    {isOutgoingFlowActive && !prefersReducedMotion && (
                      <motion.span
                        aria-hidden="true"
                        className="absolute left-0 h-2.5 w-2.5 rounded-full bg-sky-600 dark:bg-sky-400 border border-white dark:border-slate-950"
                        initial={{ x: 0, opacity: 0.4 }}
                        animate={{ x: 46, opacity: [0.4, 1, 0.4] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Click-Driven Node Status Metadata & Live Logs Drawer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedSpec.id}-${selectedStatus}`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span className="font-semibold text-slate-100">{selectedSpec.label} Logs</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{selectedSpec.runnerHost}</span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="text-slate-400">{selectedSpec.artifactMeta}</span>
              <span className="text-slate-600">·</span>
              <span
                className={
                  selectedStatus === 'failed'
                    ? 'text-rose-400 font-semibold'
                    : selectedStatus === 'success'
                      ? 'text-emerald-400 font-semibold'
                      : selectedStatus === 'running'
                        ? 'text-sky-400 font-semibold'
                        : 'text-slate-400'
                }
              >
                {selectedStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-4 font-mono text-xs space-y-1.5 leading-relaxed">
            {activeLogs.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes('ERROR') || line.includes('CRITICAL') || line.includes('CrashLoopBackOff')
                    ? 'text-rose-400'
                    : line.includes('SYNCED') || line.includes('Exit code 0')
                      ? 'text-emerald-400'
                      : 'text-slate-200'
                }
              >
                {line}
              </div>
            ))}
          </div>

          {selectedStatus === 'failed' && selectedSpec.failureRemediation && (
            <div className="px-4 py-2.5 border-t border-rose-900/60 bg-rose-950/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
              <span>
                <span className="font-semibold">Remediation:</span> {selectedSpec.failureRemediation}
              </span>
            </div>
          )}

          {state.phase === 'completed' && selectedStatus === 'success' && (
            <div className="px-4 py-2 border-t border-emerald-900/60 bg-emerald-950/35 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Pipeline Run #{Math.max(1, state.runCount)} succeeded end-to-end with zero policy violations.</span>
            </div>
          )}

          {selectedStatus === 'failed' && !selectedSpec.failureRemediation && (
            <div className="px-4 py-2 border-t border-rose-900/60 bg-rose-950/40 text-xs text-rose-200 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
              <span>Stage halted. Inspect logs above.</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
