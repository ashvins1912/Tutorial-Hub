import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cloud,
  GitBranch,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Wrench,
  XCircle,
} from 'lucide-react';
import { CLI_OUTAGE_SCENARIOS } from '../../data/devopsCloudCurriculumData';
import { SegmentedTabBar } from '../ui';

type SimulatorId = 'gatekeeper' | 'rollout' | 'scaling' | 'gitops' | 'cli';

interface PipelineStageDef {
  id: string;
  name: string;
  tool: string;
  faultKey?: 'secretLeak' | 'unitFail' | 'highCve' | 'unsignedImage';
  passDetail: string;
  failDetail: string;
  remediation: string;
}

const PIPELINE_STAGES: PipelineStageDef[] = [
  {
    id: 'precommit',
    name: '1. Pre-Commit & Secret Scan',
    tool: 'Gitleaks + Ruff',
    faultKey: 'secretLeak',
    passDetail: '0 hardcoded secrets detected across 14 changed files; commit signature verified.',
    failDetail: 'BLOCKED: AWS_SECRET_ACCESS_KEY matched regex entropy rule in src/config/payments.ts:42.',
    remediation: 'Remove hardcoded key, rotate credential immediately, and load via AWS/GCP Secrets Manager.',
  },
  {
    id: 'build',
    name: '2. Ephemeral Build & SBOM',
    tool: 'BuildKit + Syft',
    passDetail: 'Multi-stage distroless image built (18.4 MB) with CycloneDX SBOM attached.',
    failDetail: 'Build failed.',
    remediation: 'Check Dockerfile build layer dependencies.',
  },
  {
    id: 'unit',
    name: '3. Unit & Contract Suite',
    tool: 'Testcontainers + Pact',
    faultKey: 'unitFail',
    passDetail: '312 unit tests + 28 API contract assertions passed (89.4% branch coverage).',
    failDetail: 'BLOCKED: CheckoutTaxCalculatorTest.handlesZeroVat() failed (expected 100.00, got 118.00).',
    remediation: 'Fix tax exemption regression and re-run local test suite before pushing.',
  },
  {
    id: 'cve',
    name: '4. SAST & Container CVE Gate',
    tool: 'Semgrep + Trivy',
    faultKey: 'highCve',
    passDetail: '0 Critical / 0 High CVEs found across OS and language dependencies.',
    failDetail: 'BLOCKED: CVE-2025-4102 (CRITICAL) detected in base image libssl3 3.0.11.',
    remediation: 'Upgrade base image digest to distroless/static-debian12:nonroot@sha256:9f41... and rebuild.',
  },
  {
    id: 'sign',
    name: '5. Cosign & Admission Verify',
    tool: 'Sigstore + OPA',
    faultKey: 'unsignedImage',
    passDetail: 'OIDC keyless Cosign signature verified by OPA cluster admission controller.',
    failDetail: 'BLOCKED: Image digest missing valid Cosign attestation; OPA Admission Controller rejected Pod.',
    remediation: 'Enable keyless Cosign signing step in CI pipeline before pushing to ECR / Artifact Registry.',
  },
  {
    id: 'deploy',
    name: '6. Promote to Production',
    tool: 'ArgoCD GitOps',
    passDetail: 'Signed sha256 digest promoted cleanly to Production Canary rollout.',
    failDetail: 'Promotion locked until upstream DevSecOps gates turn green.',
    remediation: 'Resolve failing upstream security or test gate.',
  },
];

/* -------------------------------------------------------------------------- */
/* 1. Pipeline Gatekeeper Simulator                                           */
/* -------------------------------------------------------------------------- */
const PipelineGatekeeperSim: React.FC = () => {
  const [faults, setFaults] = useState({
    secretLeak: false,
    unitFail: false,
    highCve: true,
    unsignedImage: false,
  });
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [failedIdx, setFailedIdx] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!running) return;
    const stepMs = prefersReducedMotion ? 80 : 520;
    const timer = window.setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= PIPELINE_STAGES.length) {
        setRunning(false);
        setCompleted(true);
        return;
      }
      const stage = PIPELINE_STAGES[nextIdx];
      setCurrentIdx(nextIdx);
      if (stage.faultKey && faults[stage.faultKey]) {
        setFailedIdx(nextIdx);
        setRunning(false);
        return;
      }
      if (nextIdx === PIPELINE_STAGES.length - 1) {
        setRunning(false);
        setCompleted(true);
      }
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [running, currentIdx, faults, prefersReducedMotion]);

  const startPipeline = () => {
    setFailedIdx(null);
    setCompleted(false);
    setCurrentIdx(-1);
    setRunning(true);
  };

  const resetPipeline = () => {
    setRunning(false);
    setCurrentIdx(-1);
    setFailedIdx(null);
    setCompleted(false);
  };

  const toggleFault = (key: keyof typeof faults) => {
    resetPipeline();
    setFaults((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const failedStage = failedIdx !== null ? PIPELINE_STAGES[failedIdx] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
            01. CI/CD Pipeline Gatekeeper Simulator
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Inject realistic security or test regressions and commit code to watch automated DevSecOps gates block bad builds before they ever reach production.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startPipeline}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            {running ? 'Running Pipeline...' : 'Commit & Run Pipeline'}
          </button>
          <button
            type="button"
            onClick={resetPipeline}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Fault Injection Controls */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Failure Injectors (toggle one or more, or turn all off for a clean production promotion)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              { key: 'secretLeak', label: 'Inject Hardcoded API Key', stage: 'Stage 1 · Gitleaks' },
              { key: 'unitFail', label: 'Break Unit Test Assertion', stage: 'Stage 3 · Testcontainers' },
              { key: 'highCve', label: 'Critical CVE in Base Image', stage: 'Stage 4 · Trivy Scan' },
              { key: 'unsignedImage', label: 'Missing Cosign Signature', stage: 'Stage 5 · OPA Admission' },
            ] as const
          ).map((item) => {
            const active = faults[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleFault(item.key)}
                aria-pressed={active}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  active
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      active ? 'text-rose-700 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {active ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.stage}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Pipeline Stage Track */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isFailed = failedIdx === idx;
          const isPassed =
            (failedIdx === null && idx <= currentIdx) ||
            (failedIdx !== null && idx < failedIdx);
          const isActive = running && idx === currentIdx + 1;
          const isBlocked = failedIdx !== null && idx > failedIdx;

          const statusText = isFailed
            ? 'Blocked'
            : isPassed
              ? 'Passed'
              : isActive
                ? 'Evaluating'
                : isBlocked
                  ? 'Locked'
                  : 'Queued';

          return (
            <div
              key={stage.id}
              className={`rounded-lg border p-3.5 transition-colors flex flex-col justify-between gap-2 ${
                isFailed
                  ? 'border-rose-400 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40'
                  : isPassed
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : isActive
                      ? 'border-sky-400 dark:border-sky-600 bg-sky-50/70 dark:bg-sky-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {stage.tool}
                  </span>
                  {isFailed ? (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  ) : isActive ? (
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-spin shrink-0" aria-hidden="true" />
                  ) : null}
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {stage.name}
                </p>
              </div>
              <p
                className={`text-xs font-mono font-semibold ${
                  isFailed
                    ? 'text-rose-700 dark:text-rose-300'
                    : isPassed
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isActive
                        ? 'text-sky-700 dark:text-sky-300'
                        : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {statusText}
              </p>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Output Panel */}
      {failedStage ? (
        <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/25 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Pipeline Halted at {failedStage.name}</span>
          </div>
          <p className="text-xs font-mono text-rose-900 dark:text-rose-200">
            {failedStage.failDetail}
          </p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Remediation:</span> {failedStage.remediation}
          </p>
        </div>
      ) : completed ? (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/25 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>All 6 DevSecOps Gates Passed — Artifact Promoted to Production</span>
          </div>
          <p className="text-xs font-mono text-emerald-900 dark:text-emerald-200">
            Digest: registry.internal/checkout@sha256:81f0b9e442c1a9... · 0 Critical CVEs · Cosign Verified
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-xs text-slate-600 dark:text-slate-400">
          Toggle failure injectors above and select <span className="font-semibold text-slate-900 dark:text-slate-200">Commit & Run Pipeline</span> to observe stage-by-stage verification and gate blocking.
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Live Canary & Blue-Green Rollout Controller                             */
/* -------------------------------------------------------------------------- */
const RolloutControllerSim: React.FC = () => {
  const [mode, setMode] = useState<'canary' | 'blue-green'>('canary');
  const [canaryWeight, setCanaryWeight] = useState<number>(25);
  const [activeStack, setActiveStack] = useState<'blue' | 'green'>('blue');
  const [fault, setFault] = useState<'none' | 'errors500' | 'oomKill'>('none');
  const [autoRollbackEnabled, setAutoRollbackEnabled] = useState<boolean>(true);
  const [rollbackLog, setRollbackLog] = useState<string | null>(null);

  const v2Weight = mode === 'canary' ? canaryWeight : activeStack === 'green' ? 100 : 0;
  const v1Weight = 100 - v2Weight;

  const v2ErrorRate = fault === 'errors500' ? 8.4 : fault === 'oomKill' ? 4.9 : 0.04;
  const v2P99Ms = fault === 'oomKill' ? 920 : fault === 'errors500' ? 410 : 44;
  const v1ErrorRate = 0.03;
  const v1P99Ms = 42;

  const blendedErrorRate = Number(((v1Weight * v1ErrorRate + v2Weight * v2ErrorRate) / 100).toFixed(2));
  const sloBreached = v2Weight > 0 && v2ErrorRate > 1.0;

  useEffect(() => {
    if (!sloBreached || !autoRollbackEnabled) return;
    const timer = window.setTimeout(() => {
      if (mode === 'canary') {
        setCanaryWeight(0);
        setRollbackLog(
          `Automated Canary Analysis aborted v2 (${fault === 'errors500' ? '5xx = 8.4%' : 'OOMKill 4.9%'} > 1.0% SLO). Traffic snapped back to 100% Stable v1 in 3.1s.`
        );
      } else {
        setActiveStack('blue');
        setRollbackLog(
          `Health probe alarm triggered on Green v2 (${fault === 'errors500' ? '5xx = 8.4%' : 'OOMKill 4.9%'}). Load Balancer flipped back to warm Blue v1 in 1.4s.`
        );
      }
      setFault('none');
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [sloBreached, autoRollbackEnabled, mode, fault]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
            02. Live Canary & Blue-Green Rollout Controller
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Shift live customer traffic between Stable (v1) and Candidate (v2), inject production faults, and watch Automated Canary Analysis protect your SLO error budget.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('canary');
              setRollbackLog(null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'canary'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Canary Progressive
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('blue-green');
              setRollbackLog(null);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === 'blue-green'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Blue-Green Cutover
          </button>
        </div>
      </div>

      {/* Control Deck + Live Traffic Split Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          {mode === 'canary' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="canary-weight-slider" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Canary v2 Traffic Weight
                </label>
                <span className="text-sm font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  {canaryWeight}% v2
                </span>
              </div>
              <input
                id="canary-weight-slider"
                type="range"
                min={0}
                max={100}
                step={1}
                value={canaryWeight}
                onChange={(e) => {
                  setCanaryWeight(Number(e.target.value));
                  setRollbackLog(null);
                }}
                className="w-full accent-sky-600"
              />
              <div className="flex flex-wrap gap-1.5">
                {[0, 1, 5, 25, 50, 100].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      setCanaryWeight(step);
                      setRollbackLog(null);
                    }}
                    className={`px-2.5 py-1 rounded-md border text-xs font-mono tabular-nums transition-colors ${
                      canaryWeight === step
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {step}%
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Load Balancer Atomic Cutover Target
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStack('blue');
                    setRollbackLog(null);
                  }}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    activeStack === 'blue'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Blue (v1 Stable)</p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {activeStack === 'blue' ? '100% LIVE' : 'Warm Standby'}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStack('green');
                    setRollbackLog(null);
                  }}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    activeStack === 'green'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Green (v2 Candidate)</p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {activeStack === 'green' ? '100% LIVE' : 'Preview Ready'}
                  </p>
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2.5">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Runtime Fault Injection (on v2)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setFault('none');
                  setRollbackLog(null);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  fault === 'none'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Healthy v2
              </button>
              <button
                type="button"
                onClick={() => {
                  setFault('errors500');
                  setRollbackLog(null);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  fault === 'errors500'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Inject 500 Errors (8.4%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFault('oomKill');
                  setRollbackLog(null);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  fault === 'oomKill'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Inject Memory Leak (OOM)
              </button>
            </div>

            <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRollbackEnabled}
                onChange={(e) => setAutoRollbackEnabled(e.target.checked)}
                className="rounded border-slate-300 accent-sky-600"
              />
              <span>Enable Automated SLO Rollback Guard (abort if v2 5xx &gt; 1.0%)</span>
            </label>
          </div>
        </div>

        {/* Visual Split & Telemetry Panel */}
        <div className="lg:col-span-7 space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Live L7 Ingress / ALB Traffic Distribution
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Blended 5xx: {blendedErrorRate}% · SLO Cap: 1.00%
            </span>
          </div>

          {/* Traffic Bar */}
          <div className="space-y-1.5">
            <div className="h-6 w-full rounded-md overflow-hidden flex border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              {v1Weight > 0 && (
                <div
                  style={{ width: `${v1Weight}%` }}
                  className="bg-sky-600 dark:bg-sky-500 text-white text-[11px] font-mono font-semibold flex items-center justify-center transition-all duration-300 overflow-hidden"
                >
                  {v1Weight >= 12 ? `v1 ${v1Weight}%` : ''}
                </div>
              )}
              {v2Weight > 0 && (
                <div
                  style={{ width: `${v2Weight}%` }}
                  className={`${
                    sloBreached ? 'bg-rose-600' : 'bg-emerald-600 dark:bg-emerald-500'
                  } text-white text-[11px] font-mono font-semibold flex items-center justify-center transition-all duration-300 overflow-hidden`}
                >
                  {v2Weight >= 12 ? `v2 ${v2Weight}%` : ''}
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span>Stable v1: {v1Weight}%</span>
              <span>Candidate v2: {v2Weight}%</span>
            </div>
          </div>

          {/* Side-by-side Replica Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Stable v1 ({mode === 'blue-green' ? 'Blue' : 'Baseline'})
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  NOMINAL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                <div>5xx Rate: {v1ErrorRate}%</div>
                <div>p99: {v1P99Ms} ms</div>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 space-y-1.5 ${
                sloBreached
                  ? 'border-rose-400 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Candidate v2 ({mode === 'blue-green' ? 'Green' : 'Canary'})
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    sloBreached
                      ? 'text-rose-700 dark:text-rose-300'
                      : v2Weight === 0
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {sloBreached ? 'SLO BREACH' : v2Weight === 0 ? 'IDLE (0%)' : 'HEALTHY'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                <div>5xx Rate: {v2ErrorRate}%</div>
                <div>p99: {v2P99Ms} ms</div>
              </div>
            </div>
          </div>

          {rollbackLog ? (
            <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>{rollbackLog}</span>
            </div>
          ) : sloBreached ? (
            <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 p-3 text-xs text-rose-900 dark:text-rose-200">
              {autoRollbackEnabled
                ? 'Argo Rollouts AnalysisRun failed (5xx > 1.0%) — initiating autonomous rollback to 100% Stable v1...'
                : 'Auto-Rollback is disabled! Live users routed to v2 are experiencing active production errors.'}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Cloud vs. On-Premise Auto-Scaling & Failover                            */
/* -------------------------------------------------------------------------- */
const CloudVsOnPremScalingSim: React.FC = () => {
  const [rps, setRps] = useState<number>(6000);
  const [hybridBurst, setHybridBurst] = useState<boolean>(false);

  const cloudCapacityPerPod = 1000;
  const cloudPods = Math.max(4, Math.ceil(rps / cloudCapacityPerPod));
  const cloudCpuPct = Math.min(82, Math.round((rps / (cloudPods * cloudCapacityPerPod)) * 75));
  const cloudDroppedRps = 0;
  const cloudHourlyCost = (cloudPods * 0.14 + 0.45).toFixed(2);

  const onPremMaxPods = 10; // Fixed physical rack ceiling = 10,000 RPS
  const onPremMaxRps = onPremMaxPods * 1000;
  const onPremHandledRps = Math.min(rps, onPremMaxRps);
  const overflowRps = Math.max(0, rps - onPremMaxRps);
  const onPremCpuPct = Math.min(100, Math.round((rps / onPremMaxRps) * 100));
  const onPremDroppedRps = hybridBurst ? 0 : overflowRps;
  const burstCloudPods = hybridBurst && overflowRps > 0 ? Math.ceil(overflowRps / cloudCapacityPerPod) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
            03. Cloud Auto-Scaling vs. On-Premise Bare-Metal Load Spike
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Drag the incoming traffic slider from steady baseline to flash-sale peak to compare elastic AWS EKS / GCP Cloud Run scaling against fixed physical rack capacity.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={hybridBurst}
            onChange={(e) => setHybridBurst(e.target.checked)}
            className="rounded border-slate-300 accent-sky-600"
          />
          <span>Enable Hybrid Cloud Bursting (Direct Connect / Interconnect)</span>
        </label>
      </div>

      {/* Traffic Slider */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="traffic-rps-slider" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Incoming Production Traffic Load
          </label>
          <span className="text-sm font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
            {rps.toLocaleString()} req/sec
          </span>
        </div>
        <input
          id="traffic-rps-slider"
          type="range"
          min={2000}
          max={24000}
          step={1000}
          value={rps}
          onChange={(e) => setRps(Number(e.target.value))}
          className="w-full accent-sky-600"
        />
        <div className="flex justify-between text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
          <span>2,000 RPS (Baseline)</span>
          <span>10,000 RPS (Rack Ceiling)</span>
          <span>24,000 RPS (Flash Sale Peak)</span>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cloud Column */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Cloud Elastic (AWS EKS / GCP Cloud Run)
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              0 DROPPED (200 OK)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
            <div className="rounded-md bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200/70 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Active Pods</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{cloudPods}</div>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200/70 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Avg CPU</div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{cloudCpuPct}%</div>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200/70 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Est. Rate</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">${cloudHourlyCost}/hr</div>
            </div>
          </div>

          {/* Pod Grid Visualization */}
          <div className="space-y-1.5">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Karpenter / GKE Autopilot Node Pool ({cloudPods} scheduled pods)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: cloudPods }).map((_, i) => (
                <span
                  key={i}
                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-[10px] font-mono tabular-nums text-sky-800 dark:text-sky-300"
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            HPA + Karpenter provisions extra compute automatically as RPS rises, maintaining sub-50ms latency with elastic pay-per-second OpEx ({cloudDroppedRps} failed req/s).
          </p>
        </div>

        {/* On-Premise Column */}
        <div
          className={`rounded-lg border p-4 space-y-4 ${
            onPremDroppedRps > 0
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                In-House Bare-Metal (HAProxy + MetalLB)
              </span>
            </div>
            <span
              className={`text-xs font-mono font-semibold ${
                onPremDroppedRps > 0
                  ? 'text-rose-700 dark:text-rose-300'
                  : hybridBurst && overflowRps > 0
                    ? 'text-sky-700 dark:text-sky-300'
                    : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {onPremDroppedRps > 0
                ? `${onPremDroppedRps.toLocaleString()} HTTP 503/s`
                : hybridBurst && overflowRps > 0
                  ? `BURSTING +${burstCloudPods} CLOUD PODS`
                  : 'WITHIN RACK CAP'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
            <div className="rounded-md bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200/70 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Fixed Rack</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{onPremMaxPods} max</div>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200/70 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Rack CPU</div>
              <div
                className={`text-base font-bold mt-0.5 ${
                  onPremCpuPct >= 95 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {onPremCpuPct}%
              </div>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200/70 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400">Served On-Prem</div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {onPremHandledRps.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Physical Rack Slots (10 fixed servers){burstCloudPods > 0 ? ` + ${burstCloudPods} Cloud Burst Pods` : ''}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: onPremMaxPods }).map((_, i) => {
                const saturated = rps > onPremMaxRps;
                return (
                  <span
                    key={i}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded border text-[10px] font-mono tabular-nums ${
                      saturated && !hybridBurst
                        ? 'border-rose-400 dark:border-rose-700 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    R{i + 1}
                  </span>
                );
              })}
              {Array.from({ length: burstCloudPods }).map((_, i) => (
                <span
                  key={`burst-${i}`}
                  className="inline-flex h-6 px-1.5 items-center justify-center rounded border border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-[10px] font-mono text-sky-800 dark:text-sky-300"
                >
                  C{i + 1}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            {onPremDroppedRps > 0
              ? `Physical rack hit 100% CPU at 10,000 RPS; HAProxy connection queues overflowed, dropping ${onPremDroppedRps.toLocaleString()} req/s with HTTP 503. Enable Hybrid Cloud Bursting above to spill excess load cleanly.`
              : hybridBurst && overflowRps > 0
                ? `Baseline 10,000 RPS runs cheaply on owned bare metal while ${overflowRps.toLocaleString()} overflow RPS spills transparently over Direct Connect to Cloud.`
                : 'Predictable baseline load fits comfortably inside fixed bare-metal CapEx with lowest unit cost per request.'}
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. GitOps Configuration Drift & Self-Healing Simulator                     */
/* -------------------------------------------------------------------------- */
interface GitOpsConfigState {
  replicas: number;
  tlsMinVersion: string;
  sshPort22Open: boolean;
  imageRef: string;
}

const DESIRED_GIT_STATE: GitOpsConfigState = {
  replicas: 6,
  tlsMinVersion: 'TLS 1.3',
  sshPort22Open: false,
  imageRef: 'checkout@sha256:81f0b9e',
};

const GitOpsDriftSim: React.FC = () => {
  const [liveState, setLiveState] = useState<GitOpsConfigState>(DESIRED_GIT_STATE);
  const [selfHeal, setSelfHeal] = useState<boolean>(true);
  const [events, setEvents] = useState<string[]>([
    '[Synced] Production cluster matches Git commit main@a49c21d.',
  ]);

  const driftedFields = useMemo(() => {
    const diffs: string[] = [];
    if (liveState.replicas !== DESIRED_GIT_STATE.replicas) {
      diffs.push(`replicas: ${liveState.replicas} (expected ${DESIRED_GIT_STATE.replicas})`);
    }
    if (liveState.tlsMinVersion !== DESIRED_GIT_STATE.tlsMinVersion) {
      diffs.push(`tls_min: ${liveState.tlsMinVersion} (expected ${DESIRED_GIT_STATE.tlsMinVersion})`);
    }
    if (liveState.sshPort22Open !== DESIRED_GIT_STATE.sshPort22Open) {
      diffs.push(`port_22_ssh: OPEN 0.0.0.0/0 (expected CLOSED)`);
    }
    if (liveState.imageRef !== DESIRED_GIT_STATE.imageRef) {
      diffs.push(`image: ${liveState.imageRef} (expected ${DESIRED_GIT_STATE.imageRef})`);
    }
    return diffs;
  }, [liveState]);

  const isDrifted = driftedFields.length > 0;

  useEffect(() => {
    if (!isDrifted || !selfHeal) return;
    const timer = window.setTimeout(() => {
      setLiveState(DESIRED_GIT_STATE);
      setEvents((prev) => [
        `[ArgoCD selfHeal] Drift reconciled in 2.4s -> Overwrote live cluster back to Git commit main@a49c21d.`,
        ...prev.slice(0, 4),
      ]);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [isDrifted, selfHeal]);

  const injectTamper = (patch: Partial<GitOpsConfigState>, description: string) => {
    setLiveState((prev) => ({ ...prev, ...patch }));
    setEvents((prev) => [`[Manual Tamper] ${description}`, ...prev.slice(0, 4)]);
  };

  const reconcileNow = () => {
    setLiveState(DESIRED_GIT_STATE);
    setEvents((prev) => [
      `[Manual Sync] Operator triggered ArgoCD Sync -> Live state restored to Git truth.`,
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
            04. GitOps Configuration Drift & Self-Healing Sandbox
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Simulate unauthorized manual SSH / Console edits in production and observe how ArgoCD / Flux detects OutOfSync drift and reconciles back to Git truth.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={selfHeal}
              onChange={(e) => setSelfHeal(e.target.checked)}
              className="rounded border-slate-300 accent-sky-600"
            />
            <span>ArgoCD selfHeal: {selfHeal ? 'Enabled' : 'Paused'}</span>
          </label>
          {!selfHeal && isDrifted && (
            <button
              type="button"
              onClick={reconcileNow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Reconcile Now
            </button>
          )}
        </div>
      </div>

      {/* Tamper Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => injectTamper({ replicas: 1 }, 'kubectl scale deployment/checkout --replicas=1')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-rose-400"
        >
          <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          Tamper: Scale Replicas 6 -&gt; 1
        </button>
        <button
          type="button"
          onClick={() => injectTamper({ tlsMinVersion: 'TLS 1.0' }, 'Console edit: Ingress TLS downgraded to TLS 1.0')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-rose-400"
        >
          <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          Tamper: Downgrade TLS 1.3 -&gt; 1.0
        </button>
        <button
          type="button"
          onClick={() => injectTamper({ sshPort22Open: true }, 'Console edit: Firewall opened TCP:22 to 0.0.0.0/0')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-rose-400"
        >
          <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          Tamper: Open SSH Port 22
        </button>
        <button
          type="button"
          onClick={() => injectTamper({ imageRef: 'checkout:latest (mutable!)' }, 'kubectl set image checkout=checkout:latest')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-rose-400"
        >
          <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          Tamper: Swap Digest to :latest
        </button>
      </div>

      {/* Git vs Live Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Desired State (Git main@a49c21d)
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Source of Truth</span>
          </div>
          <pre className="rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
{`replicas: ${DESIRED_GIT_STATE.replicas}
tls_min_version: "${DESIRED_GIT_STATE.tlsMinVersion}"
firewall_port_22: "CLOSED"
image: "${DESIRED_GIT_STATE.imageRef}"`}
          </pre>
        </div>

        <div
          className={`rounded-lg border p-4 space-y-2.5 transition-colors ${
            isDrifted
              ? 'border-amber-400 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Live Production Cluster State
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                isDrifted
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isDrifted ? (selfHeal ? 'OUT OF SYNC -> HEALING...' : 'OUT OF SYNC (DRIFT)') : 'SYNCED'}
            </span>
          </div>
          <pre className="rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
{`replicas: ${liveState.replicas}
tls_min_version: "${liveState.tlsMinVersion}"
firewall_port_22: "${liveState.sshPort22Open ? 'OPEN 0.0.0.0/0' : 'CLOSED'}"
image: "${liveState.imageRef}"`}
          </pre>
        </div>
      </div>

      {/* Audit Reconciliation Log */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-3.5 space-y-1">
        <p className="text-[11px] font-mono text-slate-400">GitOps Reconciliation Audit Stream</p>
        {events.map((line, i) => (
          <p key={i} className="text-xs font-mono leading-relaxed text-slate-200">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. Interactive DevOps CLI Outage Sandbox                                   */
/* -------------------------------------------------------------------------- */
interface TerminalEntry {
  command: string;
  output: string;
  insight?: string;
  isError?: boolean;
}

const DevOpsCliSandbox: React.FC = () => {
  const [scenarioId, setScenarioId] = useState<string>(CLI_OUTAGE_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [resolved, setResolved] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const scenario = useMemo(
    () => CLI_OUTAGE_SCENARIOS.find((s) => s.id === scenarioId) ?? CLI_OUTAGE_SCENARIOS[0],
    [scenarioId]
  );

  const expectedStep = scenario.steps[Math.min(stepIndex, scenario.steps.length - 1)];

  const selectScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
    setResolved(false);
    setHistory([]);
    setInputVal('');
  };

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    const normalized = trimmed.toLowerCase();
    const matchedStep = scenario.steps.find(
      (step) =>
        step.command.toLowerCase() === normalized ||
        step.aliases?.some((a) => normalized.includes(a.toLowerCase()))
    );

    if (matchedStep) {
      const idx = scenario.steps.findIndex((s) => s.id === matchedStep.id);
      setHistory((prev) => [
        ...prev,
        { command: trimmed, output: matchedStep.output, insight: matchedStep.insight },
      ]);
      if (matchedStep.resolvesOutage) {
        setResolved(true);
        setStepIndex(scenario.steps.length - 1);
      } else if (idx >= stepIndex) {
        setStepIndex(Math.min(idx + 1, scenario.steps.length - 1));
      }
    } else {
      setHistory((prev) => [
        ...prev,
        {
          command: trimmed,
          output: `Command not matched for this drill. Suggested next command:\n  ${expectedStep.command}`,
          isError: true,
        },
      ]);
    }
    setInputVal('');
    window.setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 30);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-slate-100">
            05. Live DevOps Outage CLI Sandbox (kubectl · terraform · aws · gcloud)
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Diagnose real AWS EKS, GCP GKE, IAM, Terraform drift, and Canary outage scenarios directly in an interactive terminal—type commands or click guided step chips.
          </p>
        </div>
        <button
          type="button"
          onClick={() => selectScenario(scenario.id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Reset Incident
        </button>
      </div>

      {/* Incident Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {CLI_OUTAGE_SCENARIOS.map((item) => {
          const active = item.id === scenario.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectScenario(item.id)}
              className={`text-left rounded-lg border p-3 transition-colors ${
                active
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/35'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>{item.severity}</span>
                <span className="truncate">{item.environment}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                {item.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Incident Brief + Interactive Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-700 dark:text-rose-400 font-semibold">{scenario.severity}</span>
              <span className="text-slate-500 dark:text-slate-400">{scenario.environment}</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{scenario.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Symptom:</span> {scenario.symptom}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Objective:</span> {scenario.objective}
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Guided Runbook Commands (click to run)
            </p>
            <div className="space-y-2">
              {scenario.steps.map((step, idx) => {
                const isNext = !resolved && idx === stepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => executeCommand(step.command)}
                    className={`w-full text-left rounded-md border p-2.5 transition-colors ${
                      isNext
                        ? 'border-sky-400 dark:border-sky-600 bg-sky-50/70 dark:bg-sky-950/35'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Step {idx + 1}
                      </span>
                      <ArrowRight className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                    </div>
                    <code className="block mt-1 text-[11px] font-mono text-slate-900 dark:text-slate-100 break-all">
                      $ {step.command}
                    </code>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{step.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {resolved && (
            <div className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Incident Resolved! Production SLOs restored cleanly.</span>
            </div>
          )}
        </div>

        {/* Terminal Shell */}
        <div className="lg:col-span-8 flex flex-col rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden min-h-[380px]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-400">
            <span className="inline-flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              ops-bastion · {scenario.environment}
            </span>
            <span>{resolved ? 'STATUS: MITIGATED' : 'STATUS: ACTIVE INCIDENT'}</span>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[420px] font-mono text-xs">
            <div className="text-slate-400">
              Connected to incident sandbox. Type a command below (or click a guided runbook step on the left). Type <span className="text-slate-200">clear</span> to reset terminal output.
            </div>
            {history.map((entry, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="text-sky-400">$ {entry.command}</div>
                <pre
                  className={`whitespace-pre-wrap leading-relaxed ${
                    entry.isError ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {entry.output}
                </pre>
                {entry.insight && (
                  <div className="rounded border border-sky-900/70 bg-sky-950/40 px-3 py-2 text-sky-200 font-sans text-xs">
                    <span className="font-semibold">SRE Insight:</span> {entry.insight}
                  </div>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCommand(inputVal);
            }}
            className="flex items-center gap-2 border-t border-slate-800 bg-slate-900/70 px-3 py-2.5"
          >
            <span className="font-mono text-xs text-sky-400 shrink-0">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={expectedStep.command}
              aria-label="Enter DevOps CLI command"
              className="flex-1 bg-transparent font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 transition-colors whitespace-nowrap"
            >
              Run
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Combined Interactive Simulators Hub                                        */
/* -------------------------------------------------------------------------- */
export const DevOpsInteractiveSimulators: React.FC = () => {
  const [activeSim, setActiveSim] = useState<SimulatorId>('gatekeeper');

  return (
    <div className="space-y-6">
      <SegmentedTabBar
        ariaLabel="Interactive DevOps Simulators"
        activeTab={activeSim}
        onChange={setActiveSim}
        tabs={[
          { id: 'gatekeeper', label: '1. Pipeline Gatekeeper' },
          { id: 'rollout', label: '2. Canary & Blue-Green' },
          { id: 'scaling', label: '3. Cloud vs On-Prem Spike' },
          { id: 'gitops', label: '4. GitOps Drift & Heal' },
          { id: 'cli', label: '5. Live CLI Outage Lab' },
        ]}
      />

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 sm:p-6">
        {activeSim === 'gatekeeper' && <PipelineGatekeeperSim />}
        {activeSim === 'rollout' && <RolloutControllerSim />}
        {activeSim === 'scaling' && <CloudVsOnPremScalingSim />}
        {activeSim === 'gitops' && <GitOpsDriftSim />}
        {activeSim === 'cli' && <DevOpsCliSandbox />}
      </div>
    </div>
  );
};
