import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Code2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { renderMermaidToSvgElement } from '../../utils/mermaidRenderer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton } from '../ui';

interface MermaidNodeDoc {
  id: string;
  title: string;
  phase: string;
  boundary: string;
  whatThisDoes: string;
  whatBreaksIfSkipped: string;
  awsTool: string;
  gcpTool: string;
  inHouseTool: string;
  configTitle: string;
  configSnippet: string;
  sdlcModuleId: string;
}

const LEVEL1_MERMAID_CODE = `flowchart LR
  subgraph DevZone["1. Developer Boundary"]
    GIT["Git Repo + Pre-Commit Gitleaks"]
  end
  subgraph CIZone["2. Ephemeral CI Factory"]
    RUN["Stateless BuildKit Runner"]
    SCAN["SAST + Trivy CVE + SBOM"]
  end
  subgraph TrustZone["3. Supply Chain & Secrets"]
    REG[("Immutable OCI Registry + Cosign")]
    VAULT[("Vault / Cloud Secrets Manager")]
  end
  subgraph ProdZone["4. Zero-Trust Production Cluster"]
    OPA{"OPA / Binary Auth Admission"}
    K8S["GitOps ArgoCD + EKS / GKE / RKE2"]
    OBS["OTel + Prometheus SLO Guard"]
  end

  GIT -->|"Signed SHA Webhook"| RUN
  RUN -->|"Distroless OCI Tar"| SCAN
  SCAN -->|"0 Critical CVEs"| REG
  RUN -.->|"OIDC JWT Exchange"| VAULT
  REG -->|"Pull sha256 Digest"| OPA
  OPA -->|"Signature Verified"| K8S
  VAULT -->|"RAM tmpfs Lease"| K8S
  K8S -->|"Golden Signals"| OBS
  OBS -.->|"Auto-Rollback if 5xx > 1%"| K8S`;

const LEVEL1_NODE_DOCS: MermaidNodeDoc[] = [
  {
    id: 'GIT',
    title: 'Git Repo & Pre-Commit Gitleaks',
    phase: 'Phase 1.1 · Plan & Code',
    boundary: 'Developer Boundary -> CI Trigger',
    whatThisDoes:
      'Validates formatting, branch protection, CODEOWNERS approvals, and scans staged diffs locally with Gitleaks before any commit enters the shared trunk.',
    whatBreaksIfSkipped:
      'Hardcoded AWS/GCP credentials leak into Git history within seconds and broken code stalls every teammate on main.',
    awsTool: 'GitHub / AWS CodeCommit + CodeBuild PR Hooks',
    gcpTool: 'GitHub / Cloud Source Repos + Cloud Build Triggers',
    inHouseTool: 'Self-Hosted GitLab EE / Gitea + Gitleaks',
    configTitle: '.pre-commit-config.yaml',
    configSnippet: `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks: [{ id: gitleaks }]`,
    sdlcModuleId: 'plan-code',
  },
  {
    id: 'RUN',
    title: 'Stateless Ephemeral BuildKit Runner',
    phase: 'Phase 1.2 · Build & Package',
    boundary: 'Isolated Ephemeral CI Sandbox',
    whatThisDoes:
      'Spins up a clean, short-lived VM/pod per build, compiles binaries inside a multi-stage distroless Docker build (~18MB), and self-destructs immediately after completion.',
    whatBreaksIfSkipped:
      'Long-lived shared Jenkins servers accumulate stale files, cache poisoning, and cross-project secret leaks.',
    awsTool: 'AWS CodeBuild Ephemeral Fleets',
    gcpTool: 'Google Cloud Build + Kaniko Cache',
    inHouseTool: 'GitLab Runner / Jenkins K8s Ephemeral Pods',
    configTitle: 'Dockerfile (Multi-Stage Distroless)',
    configSnippet: `FROM golang:1.23-alpine AS builder
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/api /api
ENTRYPOINT ["/api"]`,
    sdlcModuleId: 'build-package',
  },
  {
    id: 'SCAN',
    title: 'DevSecOps Gate (SAST + Trivy CVE + SBOM)',
    phase: 'Phase 1.3 · Test & Verify',
    boundary: 'Automated Security & Quality Gate',
    whatThisDoes:
      'Runs unit/contract suites, Semgrep static analysis, CycloneDX SBOM generation, and Trivy container vulnerability scanning in parallel, failing the build on any Critical/High CVE.',
    whatBreaksIfSkipped:
      'Critical base-image CVEs and SQL injection flaws deploy silently to customer traffic.',
    awsTool: 'Amazon Inspector + Security Hub SARIF',
    gcpTool: 'Artifact Analysis + Security Command Center',
    inHouseTool: 'Trivy + Semgrep + Syft + OWASP ZAP',
    configTitle: 'trivy-gate.yaml',
    configSnippet: `trivy image --severity CRITICAL,HIGH --exit-code 1 \\
  registry.internal/checkout@sha256:81f0b9e`,
    sdlcModuleId: 'test-verify',
  },
  {
    id: 'REG',
    title: 'Immutable OCI Registry + Cosign Signature',
    phase: 'Phase 1.4 · Artifact Management',
    boundary: 'Tamper-Proof Supply Chain Boundary',
    whatThisDoes:
      'Stores the compiled container image pinned by immutable SHA-256 digest alongside its keyless OIDC Cosign cryptographic signature and SBOM attestation.',
    whatBreaksIfSkipped:
      'Mutable :latest tags overwrite history, making emergency rollbacks non-reproducible and opening supply-chain tampering vectors.',
    awsTool: 'Amazon ECR (Immutable Tags) + AWS Signer',
    gcpTool: 'Artifact Registry + Binary Authorization',
    inHouseTool: 'Harbor Registry + Cosign / Sigstore',
    configTitle: 'cosign-sign.sh',
    configSnippet: `cosign sign --yes \\
  registry.internal/checkout@sha256:81f0b9e442c1a9`,
    sdlcModuleId: 'artifact-secrets',
  },
  {
    id: 'VAULT',
    title: 'Vault / Cloud Secrets Manager (OIDC Dynamic Leases)',
    phase: 'Phase 1.4 · Secret Management',
    boundary: 'Zero-Static-Credentials Identity Boundary',
    whatThisDoes:
      'Exchanges short-lived Kubernetes ServiceAccount OIDC JWTs for dynamic 1-hour database credentials mounted exclusively in RAM (tmpfs), never written to Git or disk.',
    whatBreaksIfSkipped:
      'Long-lived static DB passwords baked into containers or .env files lead to full-account compromise when leaked.',
    awsTool: 'AWS Secrets Manager + KMS + EKS Pod Identity',
    gcpTool: 'GCP Secret Manager + Workload Identity Federation',
    inHouseTool: 'HashiCorp Vault + External Secrets Operator',
    configTitle: 'external-secret.yaml',
    configSnippet: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
spec:
  refreshInterval: 1h
  dataFrom: [{ extract: { key: prod/payments/db } }]`,
    sdlcModuleId: 'artifact-secrets',
  },
  {
    id: 'OPA',
    title: 'OPA / Binary Authorization Admission Gate',
    phase: 'Phase 1.5 · Cluster Admission Security',
    boundary: 'Production Cluster Entry Guard',
    whatThisDoes:
      'Inspects every Pod creation request at the Kubernetes API server and strictly rejects unsigned images, root containers, or images pulled from untrusted public registries.',
    whatBreaksIfSkipped:
      'A compromised CI step or manual kubectl run could deploy unverified or malicious containers directly into production.',
    awsTool: 'EKS + Kyverno / OPA Gatekeeper + AWS Signer',
    gcpTool: 'GKE Binary Authorization Attestor Policy',
    inHouseTool: 'OPA Gatekeeper / Kyverno Policy Engine',
    configTitle: 'kyverno-verify-cosign.yaml',
    configSnippet: `verifyImages:
  - imageReferences: ["registry.internal/*"]
    attestors:
      - entries: [{ keyless: { issuer: "https://token.actions.githubusercontent.com" } }]`,
    sdlcModuleId: 'release-deploy',
  },
  {
    id: 'K8S',
    title: 'GitOps Controller (ArgoCD) & Production Cluster',
    phase: 'Phase 1.5 · Release & Deploy (CD)',
    boundary: 'Pull-Based Self-Healing Runtime',
    whatThisDoes:
      'Continuously pulls declarative manifests from Git, orchestrates progressive Canary or Blue-Green rollouts, and automatically heals unauthorized manual drift back to Git truth.',
    whatBreaksIfSkipped:
      'Push-based pipelines require exposing cluster-admin credentials outside the VPC and manual console edits cause silent drift.',
    awsTool: 'Amazon EKS + ArgoCD / CodeDeploy',
    gcpTool: 'GKE + Cloud Deploy / Config Sync',
    inHouseTool: 'RKE2 / kubeadm + ArgoCD / Flux v2',
    configTitle: 'argocd-sync-policy.yaml',
    configSnippet: `syncPolicy:
  automated:
    prune: true
    selfHeal: true`,
    sdlcModuleId: 'release-deploy',
  },
  {
    id: 'OBS',
    title: 'OpenTelemetry & Prometheus SLO Auto-Rollback Guard',
    phase: 'Phase 1.6 · Operate, Observe & Self-Heal',
    boundary: 'Closed-Loop Reliability Telemetry',
    whatThisDoes:
      'Aggregates metrics, structured logs, and distributed traces; evaluates multi-window SLO burn rates and triggers automated Canary rollback to 0% if 5xx errors exceed 1.0%.',
    whatBreaksIfSkipped:
      'Bad releases degrade user checkout silently for hours and engineers debug outages blind without correlated trace IDs.',
    awsTool: 'CloudWatch Container Insights + AWS X-Ray',
    gcpTool: 'Cloud Monitoring SLOs + Cloud Trace + Logging',
    inHouseTool: 'OpenTelemetry + Prometheus + Grafana + Jaeger',
    configTitle: 'argo-slo-analysis.yaml',
    configSnippet: `metrics:
  - name: http-5xx-rate
    successCondition: result[0] < 0.01
    failureLimit: 2`,
    sdlcModuleId: 'operate-observe',
  },
];

export interface MermaidLevel1DfdViewerProps {
  onOpenSdlcModule?: (moduleId: string) => void;
}

export const MermaidLevel1DfdViewer: React.FC<MermaidLevel1DfdViewerProps> = ({
  onOpenSdlcModule,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string>('SCAN');
  const [showSource, setShowSource] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [showLiveTraffic, setShowLiveTraffic] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  const prefersReducedMotion = useReducedMotion();

  // Keep Mermaid theme synchronized with Light / Dark mode toggles
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Render Mermaid.js Level 1 DFD into SVG and bind clickable node handlers
  useEffect(() => {
    let cancelled = false;
    const host = containerRef.current;
    if (!host) return;

    const renderDiagram = async () => {
      try {
        setRenderError(null);
        const importedSvg = await renderMermaidToSvgElement(LEVEL1_MERMAID_CODE, {
          idPrefix: `l1-${uniqueId}`,
          isDark,
          maxHeight: '340px',
          flowchartPadding: 14,
        });
        if (cancelled || !containerRef.current) return;

        containerRef.current.replaceChildren(importedSvg);

        // Attach accessible click & keyboard handlers to every Mermaid node
        const nodeElements = containerRef.current.querySelectorAll<SVGGElement>('.node');
        const validIds = LEVEL1_NODE_DOCS.map((d) => d.id);

        nodeElements.forEach((el) => {
          const domId = el.id || '';
          const matchedId = validIds.find(
            (nid) =>
              domId.includes(`-${nid}-`) ||
              domId.endsWith(`-${nid}`) ||
              domId === nid
          );
          if (!matchedId) return;

          el.style.cursor = 'pointer';
          el.setAttribute('role', 'button');
          el.setAttribute('tabindex', '0');
          el.setAttribute('data-dfd-node', matchedId);
          el.setAttribute(
            'aria-label',
            `Inspect ${LEVEL1_NODE_DOCS.find((d) => d.id === matchedId)?.title ?? matchedId}`
          );

          const activate = () => setSelectedId(matchedId);
          el.addEventListener('click', activate);
          el.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter' || evt.key === ' ') {
              evt.preventDefault();
              activate();
            }
          });
        });
      } catch (err) {
        if (!cancelled) {
          setRenderError(err instanceof Error ? err.message : 'Mermaid render failed');
        }
      }
    };

    void renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [isDark, uniqueId]);

  // Visually highlight currently selected Mermaid node
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    const nodes = host.querySelectorAll<SVGGElement>('[data-dfd-node]');
    nodes.forEach((el) => {
      const nid = el.getAttribute('data-dfd-node');
      const shape = el.querySelector<SVGElement>('rect, polygon, path, circle');
      if (!shape) return;
      if (nid === selectedId) {
        shape.style.stroke = '#0284c7';
        shape.style.strokeWidth = '3px';
      } else {
        shape.style.stroke = '';
        shape.style.strokeWidth = '';
      }
    });
  }, [selectedId, isDark]);

  const activeDoc = useMemo(
    () => LEVEL1_NODE_DOCS.find((d) => d.id === selectedId) ?? LEVEL1_NODE_DOCS[0],
    [selectedId]
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Live Mermaid.js Engine · Level 1 CI/CD &amp; DevSecOps Data Flow Diagram
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
            Interactive Mermaid.js Level 1 CI/CD DFD
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Rendered live with Mermaid.js. <span className="font-semibold text-slate-900 dark:text-slate-200">Click any node directly inside the diagram</span> (or choose a phase chip below) to open its contextual &quot;What this does&quot; documentation card.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowLiveTraffic((v) => !v)}
            aria-pressed={showLiveTraffic}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              showLiveTraffic
                ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:border-sky-500'
            }`}
          >
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            {showLiveTraffic ? 'Hide Live Traffic' : 'Live Traffic Flow'}
          </button>

          <button
            type="button"
            onClick={() => setShowSource((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showSource
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
            {showSource ? 'Hide Mermaid Source' : 'View Mermaid Source'}
          </button>
        </div>
      </div>

      {showLiveTraffic && (
        <LiveTrafficFlowSimulator
          mermaidCode={LEVEL1_MERMAID_CODE}
          mermaidTitle="Level 1 CI/CD & Production DevSecOps Pipeline"
          domain="devops"
          compact
          allowPresetSwitcher={false}
          heading="CI/CD & Production Mermaid Live Traffic Simulator"
        />
      )}

      {/* Live Mermaid.js Rendered Canvas */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 overflow-x-auto">
        {renderError ? (
          <div className="text-xs text-rose-600 dark:text-rose-400 font-mono p-4">
            Mermaid diagram could not render: {renderError}
          </div>
        ) : (
          <div ref={containerRef} className="min-w-[760px] flex items-center justify-center" />
        )}
      </div>

      {/* Quick Phase Selector Bar (Keyboard-friendly mirror of diagram nodes) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
          Inspect Node:
        </span>
        {LEVEL1_NODE_DOCS.map((doc) => {
          const active = doc.id === selectedId;
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedId(doc.id)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {doc.id}: {doc.title.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Contextual "What This Does" Documentation Tooltip Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDoc.id}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/30 dark:bg-sky-950/20 p-4 sm:p-5"
        >
          <div className="lg:col-span-7 space-y-3 text-xs leading-relaxed">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                  What This Does · {activeDoc.phase}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {activeDoc.boundary}
              </span>
            </div>

            <h4 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
              {activeDoc.title}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">{activeDoc.whatThisDoes}</p>

            <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/25 p-3">
              <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                What Breaks If Skipped
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-1">{activeDoc.whatBreaksIfSkipped}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                <div className="text-amber-700 dark:text-amber-400 font-semibold">AWS</div>
                <div className="text-slate-600 dark:text-slate-300 mt-0.5">{activeDoc.awsTool}</div>
              </div>
              <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                <div className="text-sky-700 dark:text-sky-400 font-semibold">GCP</div>
                <div className="text-slate-600 dark:text-slate-300 mt-0.5">{activeDoc.gcpTool}</div>
              </div>
              <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2">
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">In-House</div>
                <div className="text-slate-600 dark:text-slate-300 mt-0.5">{activeDoc.inHouseTool}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                <span className="text-[11px] font-mono text-slate-300">{activeDoc.configTitle}</span>
                <CopyButton text={activeDoc.configSnippet} label="Copy" />
              </div>
              <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed flex-1">
                {activeDoc.configSnippet}
              </pre>
            </div>

            {onOpenSdlcModule && (
              <button
                type="button"
                onClick={() => onOpenSdlcModule(activeDoc.sdlcModuleId)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Open Full 5-Part Module Spec</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Optional Copyable Mermaid.js Source Panel */}
      {showSource && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-300">level1-cicd-dfd.mmd (Mermaid.js)</span>
            <CopyButton text={LEVEL1_MERMAID_CODE} label="Copy Mermaid" />
          </div>
          <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            {LEVEL1_MERMAID_CODE}
          </pre>
        </div>
      )}
    </div>
  );
};
