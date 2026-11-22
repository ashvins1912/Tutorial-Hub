import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Pause,
  Play,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CopyButton } from '../ui';

export type PlaygroundTargetEnv = 'aws' | 'gcp' | 'in-house';
export type PlaygroundTechnique =
  | 'recreate'
  | 'rolling'
  | 'blue-green'
  | 'canary'
  | 'shadow'
  | 'ab-flags';
export type PlaygroundFaultMode = 'healthy' | 'cve-block' | 'runtime-5xx';

export interface PlaygroundConceptNode {
  id: string;
  label: string;
  stageNum: string;
  x: number;
  y: number;
  w: number;
  h: number;
  accent: 'sky' | 'indigo' | 'amber' | 'emerald' | 'slate';
  tools: Record<PlaygroundTargetEnv, string>;
  plainEnglish: string;
  problemSolved: string;
  whatBreaksIfSkipped: string;
  configTitle: string;
  configSnippet: string;
  relatedTarget: {
    tab: 'simulators' | 'sdlc-pipeline' | 'rollouts-envs' | 'cloud-vs-onprem' | 'master-dfds';
    itemId?: string;
    label: string;
  };
}

interface PlaygroundStep {
  id: string;
  title: string;
  phaseLabel: string;
  activeNodes: string[];
  activePaths: string[];
  narration: string;
  podProgress: number; // 0..1 visual progression for rollout fleet
}

const CONCEPT_NODES: PlaygroundConceptNode[] = [
  {
    id: 'git',
    label: '1. Git & Pre-Commit',
    stageNum: 'Stage 1',
    x: 24,
    y: 36,
    w: 158,
    h: 66,
    accent: 'sky',
    tools: {
      aws: 'GitHub / CodeCommit + Gitleaks',
      gcp: 'GitHub / CSR + Pre-Commit',
      'in-house': 'GitLab CE/EE + Gitleaks',
    },
    plainEnglish:
      'Every code change starts on a short-lived feature branch where local hooks scan for hardcoded secrets and lint violations before the commit even leaves the laptop.',
    problemSolved:
      'Stops leaked cloud keys and broken syntax at second zero instead of discovering them in production.',
    whatBreaksIfSkipped:
      'Leaked IAM keys get scraped by bots in minutes and long-lived branches devolve into merge conflicts.',
    configTitle: '.pre-commit-config.yaml',
    configSnippet: `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks: [{ id: gitleaks }]`,
    relatedTarget: { tab: 'sdlc-pipeline', itemId: 'plan-code', label: 'Open Module 1.1: Plan & Code' },
  },
  {
    id: 'ci-build',
    label: '2. Ephemeral CI Build',
    stageNum: 'Stage 2',
    x: 218,
    y: 36,
    w: 164,
    h: 66,
    accent: 'indigo',
    tools: {
      aws: 'CodeBuild + BuildKit + Signer',
      gcp: 'Cloud Build + Kaniko + SBOM',
      'in-house': 'GitLab Runner + Syft + Cosign',
    },
    plainEnglish:
      'A disposable stateless build runner compiles the app inside a multi-stage distroless Docker image (~18MB), generates an SBOM ingredient list, and cryptographically signs the digest.',
    problemSolved:
      'Eliminates "works on my machine" drift and ships minimal non-root images with zero shell attack surface.',
    whatBreaksIfSkipped:
      'Bloated 1GB containers ship compilers into production and untrusted images can be tampered with mid-pipeline.',
    configTitle: 'Dockerfile (Multi-Stage)',
    configSnippet: `FROM golang:1.23-alpine AS builder
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/api /api
ENTRYPOINT ["/api"]`,
    relatedTarget: { tab: 'sdlc-pipeline', itemId: 'build-package', label: 'Open Module 1.2: Build & SBOM' },
  },
  {
    id: 'sec-gate',
    label: '3. DevSecOps Gate',
    stageNum: 'Stage 3',
    x: 418,
    y: 36,
    w: 164,
    h: 66,
    accent: 'amber',
    tools: {
      aws: 'Inspector + Semgrep + Tests',
      gcp: 'Artifact Analysis + OWASP ZAP',
      'in-house': 'Trivy + Semgrep + Testcontainers',
    },
    plainEnglish:
      'Automated quality and security scanners execute unit/contract tests, static analysis (SAST), and container CVE scanning in parallel before approving promotion.',
    problemSolved:
      'Catches SQL injections, logic regressions, and critical OS CVEs automatically on every single commit.',
    whatBreaksIfSkipped:
      'Vulnerable OpenSSL packages or broken checkout logic silently enter production without warning.',
    configTitle: 'trivy-security-gate.yaml',
    configSnippet: `- uses: aquasecurity/trivy-action@0.28.0
  with:
    image-ref: "\${{ env.IMAGE }}@\${{ env.SHA }}"
    severity: CRITICAL,HIGH
    exit-code: "1"`,
    relatedTarget: { tab: 'sdlc-pipeline', itemId: 'test-verify', label: 'Open Module 1.3: DevSecOps Gates' },
  },
  {
    id: 'registry-vault',
    label: '4. Registry & Vault',
    stageNum: 'Stage 4',
    x: 618,
    y: 36,
    w: 164,
    h: 66,
    accent: 'amber',
    tools: {
      aws: 'Amazon ECR + Secrets Manager',
      gcp: 'Artifact Registry + Secret Mgr',
      'in-house': 'Harbor + HashiCorp Vault',
    },
    plainEnglish:
      'Stores the immutable signed image digest (sha256) separately from dynamic short-lived runtime credentials injected into pod memory via OIDC workload identity.',
    problemSolved:
      'Zero static passwords in Git or images, plus 100% deterministic rollbacks because digests never overwrite.',
    whatBreaksIfSkipped:
      'Overwriting mutable :latest tags breaks emergency rollbacks and leaked .env files compromise databases.',
    configTitle: 'external-secret.yaml',
    configSnippet: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
spec:
  refreshInterval: 1h
  dataFrom: [{ extract: { key: prod/db-lease } }]`,
    relatedTarget: { tab: 'sdlc-pipeline', itemId: 'artifact-secrets', label: 'Open Module 1.4: Registry & Vault' },
  },
  {
    id: 'gitops',
    label: '5. GitOps Controller',
    stageNum: 'Stage 5',
    x: 816,
    y: 36,
    w: 160,
    h: 66,
    accent: 'emerald',
    tools: {
      aws: 'ArgoCD on EKS + CodePipeline',
      gcp: 'Cloud Deploy + Config Sync',
      'in-house': 'ArgoCD / Flux v2 Pull Agent',
    },
    plainEnglish:
      'A pull-based reconciliation loop inside the cluster watches the GitOps repository and continuously heals any manual production drift back to Git truth.',
    problemSolved:
      'Eliminates manual SSH ClickOps edits and removes inbound cluster-admin keys from external CI runners.',
    whatBreaksIfSkipped:
      '2 AM console hotfixes diverge from Git and get wiped out unexpectedly on the next deployment.',
    configTitle: 'argocd-selfheal.yaml',
    configSnippet: `syncPolicy:
  automated:
    prune: true
    selfHeal: true`,
    relatedTarget: { tab: 'sdlc-pipeline', itemId: 'release-deploy', label: 'Open Module 1.5: GitOps & CD' },
  },
  {
    id: 'router',
    label: '6. L7 Router & Ingress',
    stageNum: 'Traffic Layer',
    x: 24,
    y: 190,
    w: 178,
    h: 74,
    accent: 'sky',
    tools: {
      aws: 'AWS ALB + Route 53 + WAF',
      gcp: 'Cloud Global LB + Cloud Armor',
      'in-house': 'HAProxy + Keepalived + MetalLB',
    },
    plainEnglish:
      'Terminates TLS, blocks WAF attacks, and controls exact traffic weights—powering Rolling drains, atomic Blue-Green flips, Canary percentages, and Shadow mirroring.',
    problemSolved:
      'Decouples pod startup from customer exposure so traffic only shifts onto verified healthy backends.',
    whatBreaksIfSkipped:
      'Users hit half-booted pods (HTTP 502) and rollbacks require slow full-fleet redeploys instead of 1-second weight flips.',
    configTitle: 'weighted-ingress-route.yaml',
    configSnippet: `routes:
  - destination: { service: api-v1, weight: 95 }
  - destination: { service: api-v2, weight: 5 }`,
    relatedTarget: { tab: 'cloud-vs-onprem', label: 'Open Sec 4: Cloud vs In-House Matrix' },
  },
  {
    id: 'fleet-v1',
    label: '7A. Stable Fleet (v1)',
    stageNum: 'Baseline Pods',
    x: 268,
    y: 152,
    w: 224,
    h: 64,
    accent: 'emerald',
    tools: {
      aws: 'Amazon EKS / Fargate v1',
      gcp: 'GKE Autopilot / Cloud Run v1',
      'in-house': 'RKE2 / kubeadm Bare-Metal v1',
    },
    plainEnglish:
      'The proven production version serving existing customer traffic with healthy readiness probes and warm connection pools.',
    problemSolved:
      'Acts as your instant safety net during Rolling, Blue-Green, Canary, and Shadow releases.',
    whatBreaksIfSkipped:
      'Destroying v1 too early (like Recreate or zero scaleDownDelay) eliminates instant rollback options.',
    configTitle: 'readiness-drain.yaml',
    configSnippet: `lifecycle:
  preStop: { exec: { command: ["sh", "-c", "sleep 5"] } }
readinessProbe:
  httpGet: { path: /healthz/ready, port: 8080 }`,
    relatedTarget: { tab: 'rollouts-envs', itemId: 'rolling', label: 'Open Sec 3: Rollout Techniques' },
  },
  {
    id: 'fleet-v2',
    label: '7B. Candidate Fleet (v2)',
    stageNum: 'New Release',
    x: 268,
    y: 236,
    w: 224,
    h: 64,
    accent: 'indigo',
    tools: {
      aws: 'EKS / ECS Candidate v2',
      gcp: 'GKE / Cloud Run Revision v2',
      'in-house': 'RKE2 Candidate ReplicaSet v2',
    },
    plainEnglish:
      'The new immutable container digest undergoing progressive traffic verification (or asynchronous shadow mirroring) while sharing backward-compatible DB schemas.',
    problemSolved:
      'Validates real-world production behavior while bounding blast radius to 0%–5% until proven healthy.',
    whatBreaksIfSkipped:
      'Big-bang releases expose 100% of users simultaneously to untested edge cases.',
    configTitle: 'argo-canary-rollout.yaml',
    configSnippet: `strategy:
  canary:
    steps:
      - setWeight: 5
      - pause: { duration: 5m }
      - setWeight: 25`,
    relatedTarget: { tab: 'rollouts-envs', itemId: 'canary', label: 'Open Sec 3: Canary & Blue-Green' },
  },
  {
    id: 'observability',
    label: '8. OTel & SLO Guard',
    stageNum: 'Self-Heal Loop',
    x: 564,
    y: 190,
    w: 204,
    h: 74,
    accent: 'emerald',
    tools: {
      aws: 'CloudWatch + X-Ray + Alarms',
      gcp: 'Cloud Monitoring + Trace SLOs',
      'in-house': 'Prometheus + Grafana + OTel',
    },
    plainEnglish:
      'Collects golden signals (latency, traffic, errors, saturation) via OpenTelemetry and triggers Automated Canary Analysis rollbacks if 5xx error rate breaches 1.0%.',
    problemSolved:
      'Detects silent regressions within seconds and automatically restores 100% Stable traffic faster than any human on-call response.',
    whatBreaksIfSkipped:
      'Memory leaks and silent 500 spikes burn monthly SLO budgets before anyone notices.',
    configTitle: 'slo-analysis-guard.yaml',
    configSnippet: `metrics:
  - name: http-5xx-error-rate
    successCondition: result[0] < 0.01
    failureLimit: 2`,
    relatedTarget: { tab: 'sdlc-pipeline', itemId: 'operate-observe', label: 'Open Module 1.6: Observe & Self-Heal' },
  },
  {
    id: 'db-layer',
    label: '9. Expand-Contract DB',
    stageNum: 'Data Layer',
    x: 816,
    y: 190,
    w: 160,
    h: 74,
    accent: 'slate',
    tools: {
      aws: 'Amazon RDS / Aurora Multi-AZ',
      gcp: 'Cloud SQL / AlloyDB HA',
      'in-house': 'Patroni PostgreSQL HA Cluster',
    },
    plainEnglish:
      'Zero-downtime releases require backward-compatible Expand-Contract schema migrations so both v1 and v2 pods can safely read/write the database at the same time.',
    problemSolved:
      'Ensures rolling back from v2 to v1 never crashes with missing-column or renamed-table SQL exceptions.',
    whatBreaksIfSkipped:
      'Dropping or renaming columns in the same deploy breaks live v1 pods immediately and makes rollback impossible.',
    configTitle: 'expand-contract-migration.sql',
    configSnippet: `-- Step 1 (Expand): Add nullable new column (v1 & v2 both safe)
ALTER TABLE orders ADD COLUMN eta_seconds INT;
-- Step 2 (Backfill + Dual Write), Step 3 (Contract in later release)`,
    relatedTarget: { tab: 'master-dfds', label: 'Open Sec 5-6: Master DFDs & FSM' },
  },
];

const TECHNIQUE_META: Record<
  PlaygroundTechnique,
  {
    name: string;
    shortLabel: string;
    downtime: string;
    cost: string;
    rollback: string;
    summary: string;
    defaultV2Weight: number;
  }
> = {
  recreate: {
    name: 'Recreate',
    shortLabel: '3.1 Recreate',
    downtime: 'Yes (Maint Window)',
    cost: '1.0x',
    rollback: 'Slow (Redeploy)',
    summary: 'Terminates all v1 pods completely before booting v2. Brief maintenance downtime, zero concurrent v1/v2 overlap.',
    defaultV2Weight: 100,
  },
  rolling: {
    name: 'Rolling Update',
    shortLabel: '3.2 Rolling',
    downtime: 'Zero',
    cost: '1.25x',
    rollback: 'Medium (~45s)',
    summary: 'Replaces v1 pods in waves using maxSurge=25% and maxUnavailable=0, gated by HTTP /healthz/ready probes.',
    defaultV2Weight: 50,
  },
  'blue-green': {
    name: 'Blue-Green',
    shortLabel: '3.3 Blue-Green',
    downtime: 'Zero',
    cost: '2.0x peak',
    rollback: 'Instant (< 2s)',
    summary: 'Runs full Green (v2) stack alongside Blue (v1), runs private smoke tests, then flips the Load Balancer atomically.',
    defaultV2Weight: 100,
  },
  canary: {
    name: 'Canary (ACA)',
    shortLabel: '3.4 Canary',
    downtime: 'Zero',
    cost: '1.1x',
    rollback: 'Instant (< 4s)',
    summary: 'Routes a small 5%->25%->100% live slice to v2 while Prometheus/CloudWatch SLO checks guard against errors.',
    defaultV2Weight: 25,
  },
  shadow: {
    name: 'Shadow / Dark Launch',
    shortLabel: '3.5 Shadow',
    downtime: 'Zero',
    cost: '1.8x',
    rollback: 'N/A (0% Live)',
    summary: 'Serves 100% of users from Stable v1 while asynchronously mirroring real payloads to side-effect-stubbed Shadow v2.',
    defaultV2Weight: 0,
  },
  'ab-flags': {
    name: 'A/B & Feature Flags',
    shortLabel: '3.6 Feature Flags',
    downtime: 'Zero',
    cost: '1.0x',
    rollback: 'Instant (< 1s)',
    summary: 'Deploys dark code inside a single fleet and activates Variant B for targeted user cohorts via < 1ms in-memory flags.',
    defaultV2Weight: 15,
  },
};

function buildPlaygroundSteps(
  technique: PlaygroundTechnique,
  faultMode: PlaygroundFaultMode,
  targetEnv: PlaygroundTargetEnv
): PlaygroundStep[] {
  const envLabel = targetEnv === 'aws' ? 'AWS' : targetEnv === 'gcp' ? 'GCP' : 'In-House';
  const techName = TECHNIQUE_META[technique].name;

  const baseSteps: PlaygroundStep[] = [
    {
      id: 'step-commit',
      title: '1. Commit & Pre-Commit Secret Scan',
      phaseLabel: 'Plan & Code',
      activeNodes: ['git', 'ci-build'],
      activePaths: ['p-git-ci'],
      narration:
        'Developer commits feature branch; Gitleaks and Ruff verify zero hardcoded credentials locally before pushing to trigger an ephemeral CI runner.',
      podProgress: 0,
    },
    {
      id: 'step-build',
      title: '2. Multi-Stage Distroless Build, SBOM & Cosign',
      phaseLabel: 'CI Factory',
      activeNodes: ['ci-build', 'sec-gate'],
      activePaths: ['p-ci-sec'],
      narration: `Stateless ${envLabel} runner compiles a minimal 18MB distroless container, attaches CycloneDX SBOM, and hands off to parallel DevSecOps gates.`,
      podProgress: 0,
    },
  ];

  if (faultMode === 'cve-block') {
    return [
      ...baseSteps,
      {
        id: 'step-blocked',
        title: '3. BLOCKED at DevSecOps Gate (Critical CVE Detected)',
        phaseLabel: 'Security Halt',
        activeNodes: ['sec-gate'],
        activePaths: [],
        narration:
          'Trivy detected CVE-2025-4102 (CRITICAL) in base image libssl3. Promotion to Registry, GitOps, and Production is strictly locked until patched!',
        podProgress: 0,
      },
    ];
  }

  const midSteps: PlaygroundStep[] = [
    {
      id: 'step-sec-pass',
      title: '3. DevSecOps Gate Passed -> Immutable Registry & Vault',
      phaseLabel: 'Supply Chain',
      activeNodes: ['sec-gate', 'registry-vault', 'gitops'],
      activePaths: ['p-sec-reg', 'p-reg-gitops'],
      narration:
        '0 Critical CVEs & all 312 unit/contract tests pass. Signed sha256 digest lands in the immutable registry and triggers pull-based GitOps reconciliation.',
      podProgress: 0.25,
    },
    {
      id: 'step-rollout',
      title: `4. Execute ${techName} Rollout on ${envLabel} Fleet`,
      phaseLabel: `${techName} Live`,
      activeNodes: ['gitops', 'router', 'fleet-v1', 'fleet-v2', 'db-layer'],
      activePaths:
        technique === 'recreate'
          ? ['p-gitops-v2', 'p-router-v2', 'p-v2-db']
          : ['p-gitops-v2', 'p-router-v1', 'p-router-v2', 'p-v1-db', 'p-v2-db'],
      narration:
        technique === 'recreate'
          ? 'Recreate scales Stable v1 pods down to 0 (brief maintenance banner), runs exclusive DB migration, then cold-boots Candidate v2.'
          : technique === 'rolling'
            ? 'Rolling Update boots +2 surge v2 pods, waits for /healthz/ready=200, then gracefully drains v1 pods wave-by-wave with zero dropped requests.'
            : technique === 'blue-green'
              ? 'Full Green (v2) fleet passes private smoke checks; Load Balancer performs an atomic < 2s cutover while keeping Blue (v1) warm.'
              : technique === 'canary'
                ? 'Weighted Ingress sends 25% live traffic to Canary v2 while 75% stays protected on Stable v1; both share Expand-Contract DB schemas.'
                : technique === 'shadow'
                  ? 'Stable v1 serves 100% of live customer responses while Envoy mirrors an async copy of production payloads to side-effect-stubbed Shadow v2.'
                  : 'Single deployed binary evaluates in-memory OpenFeature cohort rules in < 1ms, enabling Variant B for 15% beta users with zero extra pods.',
      podProgress: 0.7,
    },
  ];

  if (faultMode === 'runtime-5xx') {
    return [
      ...baseSteps,
      ...midSteps,
      {
        id: 'step-rollback',
        title: '5. SLO Breach (5xx = 8.4%) -> Autonomous Self-Healing Rollback',
        phaseLabel: 'Auto-Rollback',
        activeNodes: ['fleet-v2', 'observability', 'router', 'fleet-v1'],
        activePaths: ['p-v2-obs', 'p-obs-router', 'p-router-v1'],
        narration:
          technique === 'shadow'
            ? 'Shadow v2 threw 8.4% 500 errors in the background—0 real users were impacted! Observability halts promotion before Canary ever starts.'
            : 'OpenTelemetry/Prometheus detects v2 5xx rate = 8.4% (> 1.0% SLO budget) and instructs the L7 Router to snap 100% traffic back to Stable v1 in < 4s.',
        podProgress: 0,
      },
    ];
  }

  return [
    ...baseSteps,
    ...midSteps,
    {
      id: 'step-verified',
      title: `5. SLOs Nominal (0.03% 5xx) — ${techName} Verified`,
      phaseLabel: 'Healthy Prod',
      activeNodes: ['fleet-v2', 'observability', 'router', 'db-layer'],
      activePaths: ['p-router-v2', 'p-v2-obs', 'p-v2-db'],
      narration:
        'OpenTelemetry metrics confirm p99 = 44ms and 5xx = 0.03%. Release is locked in as the new verified production baseline with zero drift.',
      podProgress: 1,
    },
  ];
}

interface PathDef {
  id: string;
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  dashed?: boolean;
  isRollback?: boolean;
}

const VIRTUAL_PATHS: PathDef[] = [
  { id: 'p-git-ci', d: 'M 182 69 L 218 69', x1: 182, y1: 69, x2: 218, y2: 69 },
  { id: 'p-ci-sec', d: 'M 382 69 L 418 69', x1: 382, y1: 69, x2: 418, y2: 69 },
  { id: 'p-sec-reg', d: 'M 582 69 L 618 69', x1: 582, y1: 69, x2: 618, y2: 69 },
  { id: 'p-reg-gitops', d: 'M 782 69 L 816 69', x1: 782, y1: 69, x2: 816, y2: 69 },
  { id: 'p-gitops-v2', d: 'M 896 102 L 896 128 L 380 128 L 380 236', x1: 896, y1: 118, x2: 380, y2: 236 },
  { id: 'p-router-v1', d: 'M 202 214 L 268 184', x1: 202, y1: 214, x2: 268, y2: 184 },
  { id: 'p-router-v2', d: 'M 202 240 L 268 268', x1: 202, y1: 240, x2: 268, y2: 268 },
  { id: 'p-v1-db', d: 'M 492 174 L 816 206', x1: 492, y1: 174, x2: 816, y2: 206 },
  { id: 'p-v2-db', d: 'M 492 278 L 816 244', x1: 492, y1: 278, x2: 816, y2: 244 },
  { id: 'p-v2-obs', d: 'M 492 254 L 564 234', x1: 492, y1: 254, x2: 564, y2: 234 },
  { id: 'p-obs-router', d: 'M 666 264 L 666 322 L 112 322 L 112 264', x1: 666, y1: 322, x2: 112, y2: 264, isRollback: true },
];

const ACCENT_STROKE: Record<PlaygroundConceptNode['accent'], string> = {
  sky: '#0284c7',
  indigo: '#4f46e5',
  amber: '#d97706',
  emerald: '#059669',
  slate: '#475569',
};

export interface DevOpsVisualPlaygroundProps {
  onNavigateRelated: (
    tab: 'simulators' | 'sdlc-pipeline' | 'rollouts-envs' | 'cloud-vs-onprem' | 'master-dfds',
    itemId?: string
  ) => void;
}

export const DevOpsVisualPlayground: React.FC<DevOpsVisualPlaygroundProps> = ({
  onNavigateRelated,
}) => {
  const [technique, setTechnique] = useState<PlaygroundTechnique>('canary');
  const [targetEnv, setTargetEnv] = useState<PlaygroundTargetEnv>('aws');
  const [faultMode, setFaultMode] = useState<PlaygroundFaultMode>('healthy');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('router');
  const [packetT, setPacketT] = useState<number>(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const steps = useMemo(
    () => buildPlaygroundSteps(technique, faultMode, targetEnv),
    [technique, faultMode, targetEnv]
  );

  // Clamp step index when scenario changes
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(true);
  }, [technique, faultMode, targetEnv]);

  // Auto-advance step playback
  useEffect(() => {
    if (!isPlaying || steps.length <= 1) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [isPlaying, steps.length]);

  // Smooth packet pulse animation
  useEffect(() => {
    if (prefersReducedMotion || !isPlaying) {
      setPacketT(0.5);
      return;
    }
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1350;
      last = now;
      setPacketT((prev) => (prev + dt) % 1);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, prefersReducedMotion]);

  const activeStep = steps[Math.min(stepIdx, steps.length - 1)];
  const selectedNode = useMemo(
    () => CONCEPT_NODES.find((n) => n.id === selectedNodeId) ?? CONCEPT_NODES[0],
    [selectedNodeId]
  );
  const techInfo = TECHNIQUE_META[technique];

  // Visual pod counts for v1 / v2 mini-cluster inside nodes 7A and 7B
  const { v1Pods, v2Pods, v1TrafficLabel, v2TrafficLabel } = useMemo(() => {
    const p = activeStep.podProgress;
    if (activeStep.id === 'step-rollback') {
      return {
        v1Pods: 4,
        v2Pods: technique === 'shadow' ? 2 : 0,
        v1TrafficLabel: '100% Live',
        v2TrafficLabel: technique === 'shadow' ? 'Shadow Aborted' : '0% Aborted',
      };
    }
    if (p === 0) {
      return { v1Pods: 4, v2Pods: 0, v1TrafficLabel: '100% Live', v2TrafficLabel: '0% Idle' };
    }
    if (technique === 'recreate') {
      return p < 0.8
        ? { v1Pods: 0, v2Pods: 2, v1TrafficLabel: '0% Drained', v2TrafficLabel: 'Booting (Maint)' }
        : { v1Pods: 0, v2Pods: 4, v1TrafficLabel: '0% Terminated', v2TrafficLabel: '100% Live' };
    }
    if (technique === 'rolling') {
      return p < 0.8
        ? { v1Pods: 2, v2Pods: 2, v1TrafficLabel: '50% Draining', v2TrafficLabel: '50% Surge Ready' }
        : { v1Pods: 0, v2Pods: 4, v1TrafficLabel: '0% Retired', v2TrafficLabel: '100% Live' };
    }
    if (technique === 'blue-green') {
      return p < 0.8
        ? { v1Pods: 4, v2Pods: 4, v1TrafficLabel: 'Blue 100% Live', v2TrafficLabel: 'Green Smoke QA' }
        : { v1Pods: 4, v2Pods: 4, v1TrafficLabel: 'Blue Warm 0%', v2TrafficLabel: 'Green 100% Live' };
    }
    if (technique === 'canary') {
      return p < 0.8
        ? { v1Pods: 3, v2Pods: 1, v1TrafficLabel: '75% Stable', v2TrafficLabel: '25% Canary' }
        : { v1Pods: 0, v2Pods: 4, v1TrafficLabel: '0% Replaced', v2TrafficLabel: '100% Promoted' };
    }
    if (technique === 'shadow') {
      return { v1Pods: 4, v2Pods: 2, v1TrafficLabel: '100% Sync Live', v2TrafficLabel: '25% Async Mirror' };
    }
    return { v1Pods: 4, v2Pods: 4, v1TrafficLabel: '85% Control A', v2TrafficLabel: '15% Flag Variant B' };
  }, [activeStep, technique]);

  const isFaultActive = activeStep.id === 'step-blocked' || activeStep.id === 'step-rollback';

  return (
    <div className="space-y-5">
      {/* Control Toolbar: Deployment Technique + Infra Target + Chaos Faults */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
              Interactive Virtual DevOps &amp; Deployment Playground
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Select a deployment technique and cloud/on-prem stack, run the live animated pipeline, and <span className="font-semibold text-slate-900 dark:text-slate-200">click any node in the diagram</span> to open its concept guide, production YAML, and related studio lessons.
            </p>
          </div>

          {/* Target Infrastructure Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
            {(
              [
                { id: 'aws', label: 'AWS Cloud', icon: Cloud },
                { id: 'gcp', label: 'GCP Cloud', icon: Cloud },
                { id: 'in-house', label: 'In-House Bare-Metal', icon: Server },
              ] as const
            ).map((env) => {
              const Icon = env.icon;
              const active = targetEnv === env.id;
              return (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => setTargetEnv(env.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {env.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Deployment Technique Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(TECHNIQUE_META) as PlaygroundTechnique[]).map((key) => {
            const item = TECHNIQUE_META[key];
            const active = technique === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTechnique(key)}
                className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap truncate">
                  {item.shortLabel}
                </div>
                <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {item.downtime} · {item.cost}
                </div>
              </button>
            );
          })}
        </div>

        {/* Playback + Chaos Injection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors whitespace-nowrap"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx((prev) => (prev - 1 + steps.length) % steps.length);
              }}
              aria-label="Previous animation step"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx((prev) => (prev + 1) % steps.length);
              }}
              aria-label="Next animation step"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setStepIdx(0);
                setIsPlaying(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Restart
            </button>
          </div>

          {/* Scenario Fault Mode */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Scenario:</span>
            {(
              [
                { id: 'healthy', label: 'Healthy Rollout' },
                { id: 'cve-block', label: 'Inject Critical CVE (Block CI)' },
                { id: 'runtime-5xx', label: 'Inject 500 Spike (Auto-Rollback)' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setFaultMode(mode.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                  faultMode === mode.id
                    ? mode.id === 'healthy'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: Left Interactive Virtual Stage (65%) + Right Concept Inspector (35%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* LEFT ZONE: Virtual Live Animated Architecture Canvas */}
        <div className="xl:col-span-8 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
          {/* Active Step Status Strip */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b ${
              isFaultActive
                ? 'border-rose-200 dark:border-rose-900/70 bg-rose-50/70 dark:bg-rose-950/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isFaultActive ? (
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              ) : activeStep.id === 'step-verified' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeStep.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
              <span>{techInfo.name}</span>
              <span aria-hidden="true">·</span>
              <span>
                Step {stepIdx + 1}/{steps.length}
              </span>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="p-3 sm:p-4 bg-slate-50/40 dark:bg-slate-950/70 overflow-x-auto flex-1 flex items-center">
            <svg
              viewBox="0 0 1000 355"
              className="w-full min-w-[740px] h-auto"
              role="img"
              aria-label={`Virtual DevOps playground running ${techInfo.name} on ${targetEnv}: ${activeStep.title}`}
            >
              <defs>
                <marker id="pg-arrow-idle" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                </marker>
                <marker id="pg-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
                </marker>
                <marker id="pg-arrow-rollback" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
                </marker>
              </defs>

              {/* Subtle Zone Divider Labels */}
              <text x="24" y="22" className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500">
                CI / DEVSECOPS SUPPLY CHAIN (CLICK ANY NODE TO INSPECT CONCEPT)
              </text>
              <line x1="24" y1="126" x2="976" y2="126" stroke="#cbd5e1" strokeDasharray="4 4" strokeOpacity={0.6} />
              <text x="24" y="143" className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500">
                RUNTIME DEPLOYMENT &amp; SELF-HEALING TELEMETRY ({targetEnv.toUpperCase()} · {techInfo.name.toUpperCase()})
              </text>

              {/* Animated Pathways */}
              {VIRTUAL_PATHS.map((p) => {
                const isActive = activeStep.activePaths.includes(p.id);
                const isShadowMirror = technique === 'shadow' && p.id === 'p-router-v2';
                const strokeColor = isActive
                  ? p.isRollback
                    ? '#dc2626'
                    : '#0284c7'
                  : '#cbd5e1';
                const markerId = isActive
                  ? p.isRollback
                    ? 'pg-arrow-rollback'
                    : 'pg-arrow-active'
                  : 'pg-arrow-idle';

                const px = p.x1 + (p.x2 - p.x1) * packetT;
                const py = p.y1 + (p.y2 - p.y1) * packetT;

                return (
                  <g key={p.id}>
                    <path
                      d={p.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isActive ? 2.6 : 1.4}
                      strokeDasharray={isShadowMirror || !isActive ? '5 4' : undefined}
                      markerEnd={`url(#${markerId})`}
                    />
                    {isActive && (
                      <circle
                        cx={px}
                        cy={py}
                        r={4.5}
                        fill={p.isRollback ? '#dc2626' : '#0284c7'}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                );
              })}

              {/* Rollback Loop Caption */}
              <text
                x="390"
                y="340"
                textAnchor="middle"
                className={`text-[10px] font-mono ${
                  activeStep.id === 'step-rollback'
                    ? 'fill-rose-600 dark:fill-rose-400 font-semibold'
                    : 'fill-slate-400 dark:fill-slate-500'
                }`}
              >
                {activeStep.id === 'step-rollback'
                  ? 'AUTO-ROLLBACK TRIGGERED: SLO 5xx > 1.0% -> SHIFTING 100% TRAFFIC BACK TO STABLE v1'
                  : 'Self-Healing Feedback Loop (Observability -> L7 Ingress / Rollout Controller)'}
              </text>

              {/* Clickable Concept Nodes */}
              {CONCEPT_NODES.map((node) => {
                const isActive = activeStep.activeNodes.includes(node.id);
                const isSelected = node.id === selectedNodeId;
                const isBlockedNode = activeStep.id === 'step-blocked' && node.id === 'sec-gate';
                const isFaultyV2 = activeStep.id === 'step-rollback' && node.id === 'fleet-v2';

                const strokeColor =
                  isBlockedNode || isFaultyV2
                    ? '#dc2626'
                    : isSelected
                      ? '#0284c7'
                      : isActive
                        ? ACCENT_STROKE[node.accent]
                        : '#94a3b8';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedNodeId(node.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${node.label}`}
                    className="cursor-pointer focus:outline-none"
                  >
                    <rect
                      width={node.w}
                      height={node.h}
                      rx={8}
                      className={
                        isSelected
                          ? 'fill-sky-50/90 dark:fill-sky-950/60'
                          : isBlockedNode || isFaultyV2
                            ? 'fill-rose-50 dark:fill-rose-950/60'
                            : 'fill-white dark:fill-slate-900'
                      }
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.6 : isActive ? 2.1 : 1.1}
                    />
                    <text
                      x={10}
                      y={18}
                      className="text-[10.5px] font-semibold fill-slate-900 dark:fill-slate-100"
                    >
                      {node.label}
                    </text>
                    <text
                      x={10}
                      y={34}
                      className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400"
                    >
                      {node.tools[targetEnv].slice(0, 27)}
                    </text>

                    {/* Live Pod Mini-Bars inside Fleet v1 & Fleet v2 */}
                    {node.id === 'fleet-v1' && (
                      <g transform="translate(10, 42)">
                        {[0, 1, 2, 3].map((pIdx) => (
                          <rect
                            key={pIdx}
                            x={pIdx * 18}
                            y={0}
                            width={13}
                            height={12}
                            rx={2.5}
                            fill={pIdx < v1Pods ? '#059669' : '#e2e8f0'}
                          />
                        ))}
                        <text x={80} y={10} className="text-[9.5px] font-mono font-semibold fill-emerald-700 dark:fill-emerald-400">
                          {v1TrafficLabel}
                        </text>
                      </g>
                    )}

                    {node.id === 'fleet-v2' && (
                      <g transform="translate(10, 42)">
                        {[0, 1, 2, 3].map((pIdx) => (
                          <rect
                            key={pIdx}
                            x={pIdx * 18}
                            y={0}
                            width={13}
                            height={12}
                            rx={2.5}
                            fill={
                              pIdx < v2Pods
                                ? isFaultyV2
                                  ? '#dc2626'
                                  : '#4f46e5'
                                : '#e2e8f0'
                            }
                          />
                        ))}
                        <text
                          x={80}
                          y={10}
                          className={`text-[9.5px] font-mono font-semibold ${
                            isFaultyV2
                              ? 'fill-rose-700 dark:fill-rose-400'
                              : 'fill-indigo-700 dark:fill-indigo-400'
                          }`}
                        >
                          {v2TrafficLabel}
                        </text>
                      </g>
                    )}

                    {/* Click Hint Tag on non-fleet nodes */}
                    {node.id !== 'fleet-v1' && node.id !== 'fleet-v2' && (
                      <text
                        x={10}
                        y={node.h - 10}
                        className={`text-[8.5px] font-mono ${
                          isSelected
                            ? 'fill-sky-700 dark:fill-sky-300 font-semibold'
                            : 'fill-slate-400 dark:fill-slate-500'
                        }`}
                      >
                        {isSelected ? 'Inspecting Concept ->' : 'Click to inspect'}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Narration + Step Timeline Footer */}
          <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeStep.narration}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {steps.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIdx(idx);
                  }}
                  className={`px-2.5 py-1 rounded-md border text-xs transition-colors whitespace-nowrap ${
                    idx === stepIdx
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {idx + 1}. {st.phaseLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT ZONE: Click-to-Inspect Related Information Panel */}
        <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  Concept Inspector · {selectedNode.stageNum}
                </div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedNode.label}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {targetEnv.toUpperCase()}: {selectedNode.tools[targetEnv]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeId('git')}
                aria-label="Reset inspector to Stage 1"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title="Jump back to Stage 1"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Plain-English Breakdown */}
            <div className="space-y-2.5 text-xs leading-relaxed">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">How It Works</div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedNode.plainEnglish}</p>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Problem Solved</div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedNode.problemSolved}</p>
              </div>
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-2.5">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  What Breaks If Skipped
                </div>
                <p className="text-slate-700 dark:text-slate-300 mt-1">{selectedNode.whatBreaksIfSkipped}</p>
              </div>
            </div>

            {/* Active Tooling Across All 3 Stacks */}
            <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px]">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Cloud vs. In-House Mapping
              </div>
              <div className="font-mono space-y-1 text-slate-600 dark:text-slate-400">
                <div><span className="text-amber-700 dark:text-amber-400 font-semibold">AWS:</span> {selectedNode.tools.aws}</div>
                <div><span className="text-sky-700 dark:text-sky-400 font-semibold">GCP:</span> {selectedNode.tools.gcp}</div>
                <div><span className="text-emerald-700 dark:text-emerald-400 font-semibold">On-Prem:</span> {selectedNode.tools['in-house']}</div>
              </div>
            </div>

            {/* Production Config Snippet */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
                <span className="text-[11px] font-mono text-slate-300">{selectedNode.configTitle}</span>
                <CopyButton text={selectedNode.configSnippet} label="Copy" />
              </div>
              <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {selectedNode.configSnippet}
              </pre>
            </div>
          </div>

          {/* Open Related Studio Module CTA */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
            <button
              type="button"
              onClick={() =>
                onNavigateRelated(selectedNode.relatedTarget.tab, selectedNode.relatedTarget.itemId)
              }
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
            >
              <span>{selectedNode.relatedTarget.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <div className="flex flex-wrap gap-1">
              {CONCEPT_NODES.map((n, i) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`px-2 py-1 rounded border text-[11px] font-mono tabular-nums transition-colors ${
                    n.id === selectedNodeId
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }`}
                  title={n.label}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
