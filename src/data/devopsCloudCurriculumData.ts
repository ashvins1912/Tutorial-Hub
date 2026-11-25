export interface DevOpsDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  zone: 'dev' | 'ci' | 'sec' | 'cloud' | 'ops';
}

export interface DevOpsDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  protocol: string;
}

export interface DevOpsDfdStep {
  id: string;
  title: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  detail: string;
  latencyLabel: string;
}

export interface DevOpsDfdGraph {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  nodes: DevOpsDfdNode[];
  edges: DevOpsDfdEdge[];
  steps: DevOpsDfdStep[];
  mermaidCode: string;
}

export interface CloudDomainRow {
  domain: string;
  coreFunctionality: string;
  awsEquivalent: string;
  gcpEquivalent: string;
  inHouseEquivalent: string;
  architectureNote: string;
}

export interface SdlcPipelineModule {
  id: string;
  code: string;
  title: string;
  stageSummary: string;
  plainEnglish: {
    whatItIs: string;
    problemSolved: string;
    whatBreaksIfSkipped: string;
  };
  actionMechanics: {
    inputs: string[];
    automatedTriggers: string[];
    outputs: string[];
    configTitle: string;
    configLanguage: string;
    configSnippet: string;
  };
  implementations: {
    aws: string;
    gcp: string;
    inHouse: string;
  };
  dfd: DevOpsDfdGraph;
  simulatorStoryboard: {
    controls: string[];
    failureInjections: string[];
    visualTransitions: string;
  };
}

export interface EnvironmentStage {
  id: string;
  order: number;
  name: string;
  shortName: string;
  purpose: string;
  promotionTrigger: string;
  dataPolicy: string;
  testingGates: string[];
  approvalControl: string;
  infraSizing: string;
}

export interface DeploymentStrategy {
  id: string;
  code: string;
  name: string;
  summary: string;
  downtime: string;
  infraCost: string;
  rollbackSpeed: string;
  complexity: 'Low' | 'Medium' | 'High';
  dbSchemaStrategy: string;
  bestFor: string;
  avoidWhen: string;
  configTitle: string;
  configSnippet: string;
}

export interface HybridAirGapPattern {
  id: string;
  title: string;
  summary: string;
  architectureFlow: string;
  securityBoundary: string;
  tooling: string;
}

export interface CliCommandStep {
  id: string;
  command: string;
  aliases?: string[];
  hint: string;
  output: string;
  insight: string;
  resolvesOutage?: boolean;
}

export interface CliOutageScenario {
  id: string;
  title: string;
  environment: string;
  severity: string;
  symptom: string;
  objective: string;
  steps: CliCommandStep[];
}

export const DEVOPS_CLOUD_MAPPING_MATRIX: CloudDomainRow[] = [
  {
    domain: 'Source & CI/CD',
    coreFunctionality: 'Version control, ephemeral build pipelines, automated test & release orchestration',
    awsEquivalent: 'CodeCommit / GitHub, CodeBuild, CodePipeline',
    gcpEquivalent: 'Cloud Source Repos / GitHub, Cloud Build, Cloud Deploy',
    inHouseEquivalent: 'Self-Hosted GitLab CI, Jenkins + Ephemeral Agents, Gitea Actions',
    architectureNote: 'Prefer OIDC short-lived federation tokens over static long-lived CI IAM keys across all three environments.',
  },
  {
    domain: 'Containers & Registry',
    coreFunctionality: 'Immutable OCI image storage, vulnerability indexing, and serverless container execution',
    awsEquivalent: 'Amazon ECR, Amazon ECS, AWS Fargate',
    gcpEquivalent: 'Artifact Registry, Cloud Run',
    inHouseEquivalent: 'Harbor Registry, Docker / containerd, Podman, Nomad',
    architectureNote: 'Pin production workloads by immutable SHA-256 image digest rather than mutable :latest tags.',
  },
  {
    domain: 'Kubernetes Orchestration',
    coreFunctionality: 'Container scheduling, self-healing ReplicaSets, autoscaling, and zero-downtime rollouts',
    awsEquivalent: 'Amazon EKS + Karpenter / Cluster Autoscaler',
    gcpEquivalent: 'Google Kubernetes Engine (GKE Standard / Autopilot)',
    inHouseEquivalent: 'kubeadm, Rancher RKE2, k3s, Red Hat OpenShift',
    architectureNote: 'Managed control planes remove etcd quorum and certificate rotation toil; bare-metal requires explicit HA etcd design.',
  },
  {
    domain: 'IaC & Configuration',
    coreFunctionality: 'Declarative infrastructure provisioning, drift detection, and immutable server configuration',
    awsEquivalent: 'AWS CloudFormation, AWS CDK, Terraform / OpenTofu',
    gcpEquivalent: 'Infrastructure Manager, Terraform / OpenTofu',
    inHouseEquivalent: 'Terraform (vSphere/Proxmox), Ansible, Packer, SaltStack',
    architectureNote: 'Always isolate Terraform state per environment with remote state locking (S3+DynamoDB, GCS, or Consul/Postgres).',
  },
  {
    domain: 'Observability & AIOps',
    coreFunctionality: 'Golden signals metrics, centralized structured logs, distributed tracing, and SLO burn alerts',
    awsEquivalent: 'Amazon CloudWatch, AWS X-Ray, Amazon Managed Prometheus',
    gcpEquivalent: 'Cloud Logging, Cloud Monitoring, Cloud Trace',
    inHouseEquivalent: 'Prometheus + Thanos, Grafana, Loki, OpenTelemetry + Jaeger/Tempo',
    architectureNote: 'Instrument once with OpenTelemetry SDKs so telemetry pipelines remain portable across AWS, GCP, and bare metal.',
  },
  {
    domain: 'Security (DevSecOps)',
    coreFunctionality: 'Least-privilege IAM, dynamic secrets rotation, SAST/DAST, SBOM, and CVE image scanning',
    awsEquivalent: 'AWS IAM, Secrets Manager, KMS, Amazon Inspector',
    gcpEquivalent: 'Cloud IAM, Secret Manager, Cloud KMS, Artifact Analysis',
    inHouseEquivalent: 'HashiCorp Vault, Trivy, Cosign/Sigstore, OPA Gatekeeper, Falco',
    architectureNote: 'Enforce admission control policies so unsigned images or images with Critical CVEs cannot be scheduled.',
  },
  {
    domain: 'Networking & Ingress',
    coreFunctionality: 'L4/L7 load balancing, DNS routing, TLS termination, and service-to-service mTLS mesh',
    awsEquivalent: 'ALB / NLB, Route 53, AWS WAF, VPC Lattice / App Mesh',
    gcpEquivalent: 'Cloud Load Balancing, Cloud DNS, Cloud Armor, Traffic Director',
    inHouseEquivalent: 'HAProxy, NGINX / Traefik Ingress, MetalLB, Keepalived (VRRP), Cilium / Istio',
    architectureNote: 'Bare-metal Kubernetes lacks a cloud LB API; pair MetalLB (BGP/L2) with redundant HAProxy/Keepalived VIPs.',
  },
];

export const SDLC_PIPELINE_MODULES: SdlcPipelineModule[] = [
  {
    id: 'plan-code',
    code: '1.1',
    title: 'Plan & Code (Trunk-Based Dev & Pre-Commit)',
    stageSummary: 'Short-lived feature branches, pre-commit secret scanning, static linting, and automated PR validation.',
    plainEnglish: {
      whatItIs:
        'The developer workstation and Git workflow layer that validates code hygiene, formatting, and secret safety before a single line merges into the shared trunk.',
      problemSolved:
        'Eliminates painful weeks-long merge conflicts, leaked API credentials in Git history, and trivial formatting debates during code review.',
      whatBreaksIfSkipped:
        'Long-lived branches diverge into integration hell, hardcoded cloud keys get pushed to remote repositories within seconds, and broken builds stall the entire team.',
    },
    actionMechanics: {
      inputs: ['Developer commits on short-lived feature branch (< 24h)', 'Branch protection ruleset', 'Pre-commit hook definitions'],
      automatedTriggers: ['git commit -> pre-commit Gitleaks + ESLint/Ruff', 'Pull Request opened -> Required CI status checks + CODEOWNERS review'],
      outputs: ['Cryptographically signed commit (GPG/SSH)', 'Verified Pull Request ready for squash-merge to main'],
      configTitle: '.pre-commit-config.yaml',
      configLanguage: 'yaml',
      configSnippet: `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks:
      - id: gitleaks
        name: Block hardcoded secrets before commit
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.4
    hooks:
      - id: ruff
        args: [--fix]
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: check-yaml
      - id: no-commit-to-branch
        args: [--branch, main]`,
    },
    implementations: {
      aws: 'GitHub Enterprise / AWS CodeCommit with AWS CodeBuild PR webhook triggers and Amazon CodeGuru Reviewer.',
      gcp: 'GitHub / Cloud Source Repositories triggering Cloud Build pull-request checks with Binary Authorization attestations.',
      inHouse: 'Self-hosted GitLab EE or Gitea with local pre-commit framework, Gitleaks, SonarQube Community, and mandatory CODEOWNERS merge rules.',
    },
    dfd: {
      id: 'dfd-plan-code',
      title: 'Plan & Code Guardrails Flow',
      subtitle: 'Local hooks + PR gatekeeping before trunk integration',
      level: 'Stage 1.1',
      nodes: [
        { id: 'ide', label: 'Developer IDE', sublabel: 'Feature Branch', x: 75, y: 120, zone: 'dev' },
        { id: 'hooks', label: 'Pre-Commit', sublabel: 'Lint + Gitleaks', x: 245, y: 120, zone: 'sec' },
        { id: 'git', label: 'Git Remote', sublabel: 'PR / CODEOWNERS', x: 430, y: 120, zone: 'ci' },
        { id: 'prci', label: 'PR Check Runner', sublabel: 'Fast Unit + Diff', x: 615, y: 120, zone: 'ci' },
        { id: 'main', label: 'Protected Trunk', sublabel: 'Signed Merge', x: 790, y: 120, zone: 'cloud' },
      ],
      edges: [
        { id: 'e1', from: 'ide', to: 'hooks', label: 'git commit', protocol: 'Local Hook' },
        { id: 'e2', from: 'hooks', to: 'git', label: 'git push', protocol: 'SSH/HTTPS' },
        { id: 'e3', from: 'git', to: 'prci', label: 'PR Webhook', protocol: 'HTTPS POST' },
        { id: 'e4', from: 'prci', to: 'main', label: 'Status Green', protocol: 'Merge Gate' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Local Pre-Commit Secret & Lint Scan',
          activeNodeIds: ['ide', 'hooks'],
          activeEdgeIds: ['e1'],
          detail: 'Before the commit object is written, Gitleaks inspects staged diffs for AWS/GCP keys and regex entropy leaks.',
          latencyLabel: '0.8s local',
        },
        {
          id: 's2',
          title: 'Signed Push & Pull Request Creation',
          activeNodeIds: ['hooks', 'git'],
          activeEdgeIds: ['e2'],
          detail: 'Clean commits push to a short-lived branch and automatically request review from CODEOWNERS.',
          latencyLabel: '1.2s push',
        },
        {
          id: 's3',
          title: 'Ephemeral PR Validation Checks',
          activeNodeIds: ['git', 'prci'],
          activeEdgeIds: ['e3'],
          detail: 'Webhook spawns a clean stateless runner to verify compilation, unit tests, and IaC plan diffs.',
          latencyLabel: '42s CI',
        },
        {
          id: 's4',
          title: 'Protected Trunk Squash-Merge',
          activeNodeIds: ['prci', 'main'],
          activeEdgeIds: ['e4'],
          detail: 'With required reviews and green checks satisfied, Git merges atomically into main and kicks off CD.',
          latencyLabel: 'Atomic merge',
        },
      ],
      mermaidCode: `flowchart LR
  IDE[Developer Workstation] -->|git commit| HOOKS{Pre-Commit: Gitleaks + Lint}
  HOOKS -->|Secret Found| BLOCK[Commit Rejected Locally]
  HOOKS -->|Clean| PR[Git Pull Request + CODEOWNERS]
  PR -->|Webhook| CI[Ephemeral PR Check Runner]
  CI -->|All Checks Pass| TRUNK[(Protected main Branch)]`,
    },
    simulatorStoryboard: {
      controls: ['Toggle Secret Leak Injection', 'Commit & Open PR button', 'Branch Protection strictness switch'],
      failureInjections: ['Inject AWS_SECRET_ACCESS_KEY in diff', 'Skip lint formatting check'],
      visualTransitions: 'Packet leaves IDE -> hits Pre-Commit shield -> turns red & bounces back with exact line number when secret is detected.',
    },
  },
  {
    id: 'build-package',
    code: '1.2',
    title: 'Build & Package (CI, Multi-Stage Docker, SBOM & Cosign)',
    stageSummary: 'Ephemeral build runners, layer caching, minimal distroless images, CycloneDX SBOM, and cryptographic signing.',
    plainEnglish: {
      whatItIs:
        'The automated factory that turns source code into a deterministic, tamper-proof, minimal container image with a full ingredient list (SBOM) and cryptographic signature.',
      problemSolved:
        'Eliminates "works on my machine" drift, bloated 1.2GB container images full of build tools, and supply-chain tampering.',
      whatBreaksIfSkipped:
        'Production containers ship compilers and shells attackers exploit, uncached builds take 20+ minutes, and zero-day dependency audits (like Log4Shell) take days instead of seconds.',
    },
    actionMechanics: {
      inputs: ['Immutable Git commit SHA', 'Multi-stage Dockerfile', 'BuildKit cache mount'],
      automatedTriggers: ['Merge to main or tag push -> Ephemeral runner spins up cleanly and self-destructs after build'],
      outputs: ['Distroless OCI image digest (sha256:...)', 'SPDX/CycloneDX SBOM JSON', 'Cosign keyless signature attached in registry'],
      configTitle: 'Dockerfile (Multi-Stage Distroless)',
      configLanguage: 'dockerfile',
      configSnippet: `# Stage 1: Deterministic Builder (never shipped to prod)
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

# Stage 2: Minimal Non-Root Runtime (~18MB, no shell/curl)
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /out/api /api
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/api"]`,
    },
    implementations: {
      aws: 'AWS CodeBuild ephemeral Linux/ARM64 fleets + ECR pull-through cache + AWS Signer for container signing.',
      gcp: 'Cloud Build with Kaniko/BuildKit caching + Artifact Registry + Binary Authorization attestor signing.',
      inHouse: 'GitLab Runner / Jenkins Kubernetes plugin spinning ephemeral BuildKit pods + Syft (SBOM) + Cosign + Harbor.',
    },
    dfd: {
      id: 'dfd-build-package',
      title: 'Deterministic CI Build & Signing Flow',
      subtitle: 'Ephemeral runner -> Multi-stage build -> SBOM -> Cosign',
      level: 'Stage 1.2',
      nodes: [
        { id: 'src', label: 'Git Commit SHA', sublabel: 'Immutable Ref', x: 75, y: 120, zone: 'dev' },
        { id: 'runner', label: 'Ephemeral Runner', sublabel: 'BuildKit + Cache', x: 250, y: 120, zone: 'ci' },
        { id: 'sbom', label: 'Syft SBOM', sublabel: 'CycloneDX BOM', x: 430, y: 120, zone: 'sec' },
        { id: 'cosign', label: 'Cosign Signer', sublabel: 'OIDC Keyless Sig', x: 610, y: 120, zone: 'sec' },
        { id: 'reg', label: 'OCI Registry', sublabel: 'sha256 Digest', x: 790, y: 120, zone: 'cloud' },
      ],
      edges: [
        { id: 'e1', from: 'src', to: 'runner', label: 'Checkout SHA', protocol: 'Git TLS' },
        { id: 'e2', from: 'runner', to: 'sbom', label: 'OCI Layer Tar', protocol: 'BuildKit' },
        { id: 'e3', from: 'sbom', to: 'cosign', label: 'Image + SBOM', protocol: 'Attestation' },
        { id: 'e4', from: 'cosign', to: 'reg', label: 'Push Signed', protocol: 'OCI API' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Clean Ephemeral Runner Checkout',
          activeNodeIds: ['src', 'runner'],
          activeEdgeIds: ['e1'],
          detail: 'A fresh isolated VM/pod checks out the exact commit SHA and mounts remote BuildKit layer caches.',
          latencyLabel: '14s cached',
        },
        {
          id: 's2',
          title: 'Multi-Stage Compile & SBOM Generation',
          activeNodeIds: ['runner', 'sbom'],
          activeEdgeIds: ['e2'],
          detail: 'Binary compiles in Stage 1 and copies into distroless Stage 2; Syft extracts every OS and package dependency into CycloneDX.',
          latencyLabel: '22s build',
        },
        {
          id: 's3',
          title: 'Cryptographic Keyless Signing',
          activeNodeIds: ['sbom', 'cosign'],
          activeEdgeIds: ['e3'],
          detail: 'Cosign exchanges the runner OIDC JWT for a short-lived Fulcio certificate and signs the exact sha256 image digest.',
          latencyLabel: '2.1s sign',
        },
        {
          id: 's4',
          title: 'Immutable Registry Storage',
          activeNodeIds: ['cosign', 'reg'],
          activeEdgeIds: ['e4'],
          detail: 'Image manifest, SBOM attestation, and signature land atomically in ECR, Artifact Registry, or Harbor.',
          latencyLabel: '3.4s push',
        },
      ],
      mermaidCode: `flowchart LR
  GIT[(Git Commit SHA)] --> RUNNER[Ephemeral BuildKit Runner]
  RUNNER -->|Multi-Stage Distroless| SBOM[Generate CycloneDX SBOM]
  SBOM --> SIGN[Cosign OIDC Keyless Signature]
  SIGN -->|Push Digest + Attestation| REG[(ECR / Artifact Registry / Harbor)]`,
    },
    simulatorStoryboard: {
      controls: ['Toggle Layer Cache (Cold vs Warm)', 'Toggle SBOM + Cosign Gate'],
      failureInjections: ['Missing cryptographic signature causes admission controller rejection'],
      visualTransitions: 'Image shrinks from 840MB builder layer to 18MB distroless artifact with cryptographic seal attached.',
    },
  },
  {
    id: 'test-verify',
    code: '1.3',
    title: 'Test & Verify (DevSecOps Quality & CVE Gates)',
    stageSummary: 'Parallel unit/integration tests, SAST, container CVE scanning (Trivy), DAST, and hard quality gates.',
    plainEnglish: {
      whatItIs:
        'The automated security and reliability checkpoint that attacks your own code and container image before customers or adversaries ever see it.',
      problemSolved:
        'Catches logic regressions, SQL injections, vulnerable OpenSSL base packages, and broken API contracts automatically on every build.',
      whatBreaksIfSkipped:
        'Critical CVEs ship silently to production, broken database migrations corrupt customer records, and security reviews become manual 2-week release bottlenecks.',
    },
    actionMechanics: {
      inputs: ['Compiled OCI artifact', 'Ephemeral Testcontainers DB', 'Trivy CVE database + Semgrep SAST rules'],
      automatedTriggers: ['Post-build parallel fan-out -> Unit + Contract + SAST + Trivy CVE + Ephemeral DAST'],
      outputs: ['SARIF security reports', 'Code coverage + p95 latency benchmark', 'Signed Pass/Fail promotion gate'],
      configTitle: 'github-devsecops-gate.yaml',
      configLanguage: 'yaml',
      configSnippet: `jobs:
  security-and-quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Static Analysis (SAST)
        uses: returntocorp/semgrep-action@v1
        with:
          config: p/owasp-top-ten
      - name: Container CVE Scan (Fail on Critical/High)
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: "\${{ env.REGISTRY }}/\${{ env.IMAGE }}@\${{ needs.build.outputs.digest }}"
          severity: CRITICAL,HIGH
          exit-code: "1"
          ignore-unfixed: true`,
    },
    implementations: {
      aws: 'CodeBuild parallel fan-out + Amazon Inspector ECR continuous scanning + AWS Security Hub SARIF aggregation.',
      gcp: 'Cloud Build concurrent steps + Artifact Analysis on-demand/continuous CVE scanning + Security Command Center.',
      inHouse: 'Self-hosted GitLab CI / Jenkins parallel stages running Semgrep, Trivy, OWASP ZAP (DAST), and SonarQube Quality Gates.',
    },
    dfd: {
      id: 'dfd-test-verify',
      title: 'DevSecOps Verification Fan-Out',
      subtitle: 'Parallel Unit + SAST + Trivy CVE + DAST promotion gate',
      level: 'Stage 1.3',
      nodes: [
        { id: 'img', label: 'Candidate Image', sublabel: 'Staging Digest', x: 75, y: 120, zone: 'ci' },
        { id: 'unit', label: 'Unit + Contract', sublabel: 'Testcontainers', x: 265, y: 55, zone: 'ci' },
        { id: 'sast', label: 'SAST + Trivy', sublabel: 'OWASP & CVEs', x: 265, y: 185, zone: 'sec' },
        { id: 'dast', label: 'Ephemeral DAST', sublabel: 'OWASP ZAP Probe', x: 500, y: 120, zone: 'sec' },
        { id: 'gate', label: 'Policy Gate', sublabel: 'OPA / Pass-Fail', x: 760, y: 120, zone: 'cloud' },
      ],
      edges: [
        { id: 'e1', from: 'img', to: 'unit', label: 'Run Suite', protocol: 'Parallel' },
        { id: 'e2', from: 'img', to: 'sast', label: 'Scan Layers', protocol: 'Trivy/SARIF' },
        { id: 'e3', from: 'unit', to: 'dast', label: 'Spin Ephemeral', protocol: 'HTTP Test' },
        { id: 'e4', from: 'sast', to: 'gate', label: 'CVE Report', protocol: 'SARIF' },
        { id: 'e5', from: 'dast', to: 'gate', label: 'Probe Pass', protocol: 'Policy Eval' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Parallel Test & Vulnerability Fan-Out',
          activeNodeIds: ['img', 'unit', 'sast'],
          activeEdgeIds: ['e1', 'e2'],
          detail: 'Unit/integration suites spin disposable Postgres/Redis containers while Semgrep and Trivy scan ASTs and image layers concurrently.',
          latencyLabel: '38s parallel',
        },
        {
          id: 's2',
          title: 'Ephemeral Environment DAST Probing',
          activeNodeIds: ['unit', 'dast'],
          activeEdgeIds: ['e3'],
          detail: 'Application boots in a sandbox namespace and OWASP ZAP probes live HTTP endpoints for auth bypasses and XSS/SSRF flaws.',
          latencyLabel: '54s DAST',
        },
        {
          id: 's3',
          title: 'Zero-Critical Policy Gate Evaluation',
          activeNodeIds: ['sast', 'dast', 'gate'],
          activeEdgeIds: ['e4', 'e5'],
          detail: 'OPA verifies 0 Critical CVEs, >= 80% critical path coverage, and clean DAST before signing the release promotion token.',
          latencyLabel: '0.4s OPA',
        },
      ],
      mermaidCode: `flowchart LR
  IMG[Candidate Container Digest] --> UNIT[Unit & Testcontainers Suite]
  IMG --> SCAN[Semgrep SAST + Trivy CVE Scan]
  UNIT --> DAST[Ephemeral Sandbox + OWASP ZAP]
  SCAN --> GATE{DevSecOps Quality Gate}
  DAST --> GATE
  GATE -->|0 Critical CVEs & Tests Green| PROMOTE[Approved for Staging/Prod]
  GATE -->|Policy Breach| FAIL[Block Pipeline & Alert Slack]`,
    },
    simulatorStoryboard: {
      controls: ['Toggle High CVE in Base Image', 'Toggle Unit Test Failure'],
      failureInjections: ['CVE-2025-XXXX Critical OpenSSL vulnerability', 'Checkout tax calculation assertion mismatch'],
      visualTransitions: 'Parallel tracks fan out -> failing track turns crimson with CVE/line details -> downstream Production deploy stays locked.',
    },
  },
  {
    id: 'artifact-secrets',
    code: '1.4',
    title: 'Artifact & Secret Management (Immutable Registry + Vault)',
    stageSummary: 'Digest-pinned registries, zero static credentials, dynamic short-lived DB leases, and External Secrets Operator.',
    plainEnglish: {
      whatItIs:
        'Separating what runs (immutable versioned artifacts) from who is allowed to connect (short-lived runtime secrets injected securely into memory).',
      problemSolved:
        'Keeps database passwords out of Docker images and source control when secrets are injected securely at runtime. Immutable, versioned artifacts make rollback more reproducible, but a full rollback also depends on compatible configuration, database migrations, external state and available dependencies.',
      whatBreaksIfSkipped:
        'A leaked .env file compromises production databases for months, and overwriting :latest tags makes emergency rollbacks impossible to reproduce.',
    },
    actionMechanics: {
      inputs: ['Signed container digest', 'Workload identity JWT (IRSA / Workload Identity / ServiceAccount)'],
      automatedTriggers: ['Pod startup -> External Secrets Operator / CSI Driver fetches memory-mounted secrets with TTL rotation'],
      outputs: ['Immutable artifact retention policy', 'Audited, auto-rotating runtime credentials in tmpfs (never on disk)'],
      configTitle: 'external-secret.yaml (K8s External Secrets Operator)',
      configLanguage: 'yaml',
      configSnippet: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: payments-db-credentials
  namespace: prod-payments
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: cloud-vault-backend
    kind: ClusterSecretStore
  target:
    name: payments-db-secret
    creationPolicy: Owner
  dataFrom:
    - extract:
        key: prod/payments/postgres-dynamic-lease`,
    },
    implementations: {
      aws: 'Amazon ECR (immutable tag mutability disabled) + AWS Secrets Manager + KMS + EKS Pod Identity / IRSA.',
      gcp: 'Artifact Registry (immutable tags + VPC Service Controls) + GCP Secret Manager + GKE Workload Identity Federation.',
      inHouse: 'Harbor Registry (signed replication) + HashiCorp Vault (Kubernetes Auth + Dynamic PostgreSQL Engine) + Sealed Secrets / SOPS.',
    },
    dfd: {
      id: 'dfd-artifact-secrets',
      title: 'Zero-Static-Secret Runtime Injection Flow',
      subtitle: 'OIDC Workload Identity -> Vault/Secrets Manager -> tmpfs memory mount',
      level: 'Stage 1.4',
      nodes: [
        { id: 'pod', label: 'K8s Workload Pod', sublabel: 'ServiceAccount JWT', x: 75, y: 120, zone: 'cloud' },
        { id: 'oidc', label: 'OIDC / IAM', sublabel: 'Token Verification', x: 260, y: 120, zone: 'sec' },
        { id: 'vault', label: 'Secrets Manager', sublabel: 'Vault / AWS / GCP', x: 455, y: 120, zone: 'sec' },
        { id: 'reg', label: 'Immutable Registry', sublabel: 'ECR / AR / Harbor', x: 455, y: 215, zone: 'ci' },
        { id: 'db', label: 'Prod Database', sublabel: 'Dynamic Lease TTL', x: 765, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'pod', to: 'oidc', label: 'Present JWT', protocol: 'OIDC' },
        { id: 'e2', from: 'oidc', to: 'vault', label: 'Short-Lived Role', protocol: 'mTLS' },
        { id: 'e3', from: 'vault', to: 'pod', label: 'tmpfs Secret', protocol: 'CSI Mount' },
        { id: 'e4', from: 'reg', to: 'pod', label: 'Pull sha256', protocol: 'OCI HTTPS' },
        { id: 'e5', from: 'pod', to: 'db', label: 'Auth + Rotate', protocol: 'TLS 1.3' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Pull Immutable Signed Artifact',
          activeNodeIds: ['reg', 'pod'],
          activeEdgeIds: ['e4'],
          detail: 'Kubelet pulls the exact immutable digest from ECR/Artifact Registry/Harbor after verifying Cosign signature.',
          latencyLabel: '1.9s pull',
        },
        {
          id: 's2',
          title: 'Workload Identity Exchange (Zero Static Keys)',
          activeNodeIds: ['pod', 'oidc', 'vault'],
          activeEdgeIds: ['e1', 'e2'],
          detail: 'Pod exchanges its projected Kubernetes JWT via OIDC Federation for a least-privilege role scoped to one secret path.',
          latencyLabel: '45ms IAM',
        },
        {
          id: 's3',
          title: 'Dynamic Lease Injection into RAM (tmpfs)',
          activeNodeIds: ['vault', 'pod', 'db'],
          activeEdgeIds: ['e3', 'e5'],
          detail: 'Vault/Secrets Manager provisions a 1-hour database credential mounted only in RAM and automatically rotates it before expiry.',
          latencyLabel: '1h TTL lease',
        },
      ],
      mermaidCode: `flowchart LR
  REG[(Immutable Registry)] -->|Pull sha256 Digest| POD[Workload Pod]
  POD -->|Projected JWT| OIDC[IAM / OIDC Federation]
  OIDC -->|Least-Privilege Scope| VAULT[Secrets Manager / HashiCorp Vault]
  VAULT -->|Inject in RAM tmpfs| POD
  POD -->|Short-Lived Dynamic Lease| DB[(Production Database)]`,
    },
    simulatorStoryboard: {
      controls: ['Simulate Secret Rotation', 'Revoke IAM Scope'],
      failureInjections: ['IAM Policy Deny on secret path triggers crash-safe startup hold'],
      visualTransitions: 'Short-lived token flashes green -> rotates credentials seamlessly without restarting traffic.',
    },
  },
  {
    id: 'release-deploy',
    code: '1.5',
    title: 'Release & Deploy (CD, Terraform IaC & Pull-Based GitOps)',
    stageSummary: 'Declarative GitOps reconciliation (ArgoCD/Flux) vs push pipelines, Terraform remote state locking, and drift healing.',
    plainEnglish: {
      whatItIs:
        'An automated control loop inside your cluster that constantly compares live production infrastructure against Git and heals any unauthorized drift.',
      problemSolved:
        'Eliminates manual SSH "ClickOps" edits, brittle push-pipeline cluster admin credentials, and snowflake servers that nobody dares reboot.',
      whatBreaksIfSkipped:
        'Engineers make manual hotfixes in the AWS/GCP console at 2 AM, configuration silently diverges from Git, and the next deployment accidentally wipes critical production settings.',
    },
    actionMechanics: {
      inputs: ['Declarative Helm/Kustomize manifests in GitOps repo', 'Terraform HCL modules + locked remote state'],
      automatedTriggers: ['CI updates image digest in GitOps repo -> ArgoCD/Flux polls or receives webhook -> Reconciles cluster state'],
      outputs: ['Synced Kubernetes Deployment/Rollout', 'Zero-drift audit log tied to exact Git commit'],
      configTitle: 'argocd-application.yaml (Self-Healing GitOps)',
      configLanguage: 'yaml',
      configSnippet: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: checkout-service-prod
  namespace: argocd
spec:
  project: production
  source:
    repoURL: https://git.internal/platform/gitops-fleet.git
    targetRevision: main
    path: clusters/prod-us-east/checkout
  destination:
    server: https://kubernetes.default.svc
    namespace: checkout
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true`,
    },
    implementations: {
      aws: 'Terraform/CloudFormation + AWS CodePipeline or EKS Blueprints with ArgoCD / Flux GitOps controller.',
      gcp: 'Cloud Deploy progressive delivery pipelines + Config Sync (Anthos/GKE GitOps) + Infrastructure Manager.',
      inHouse: 'Self-hosted ArgoCD or Flux v2 inside RKE2/kubeadm clusters + Terraform/OpenTofu + Ansible for bare-metal OS layers.',
    },
    dfd: {
      id: 'dfd-release-deploy',
      title: 'Pull-Based GitOps Reconciliation Loop',
      subtitle: 'Git Source of Truth -> ArgoCD Controller -> Live Cluster Self-Heal',
      level: 'Stage 1.5',
      nodes: [
        { id: 'gitops', label: 'GitOps Repo', sublabel: 'Desired State', x: 75, y: 120, zone: 'dev' },
        { id: 'tf', label: 'Terraform Plan', sublabel: 'Locked Remote State', x: 260, y: 205, zone: 'ci' },
        { id: 'argo', label: 'ArgoCD / Flux', sublabel: 'Pull Reconciler', x: 350, y: 100, zone: 'cloud' },
        { id: 'k8s', label: 'Cluster API', sublabel: 'Admission + Apply', x: 585, y: 100, zone: 'cloud' },
        { id: 'prod', label: 'Live Workloads', sublabel: 'Drift Monitored', x: 790, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'gitops', to: 'argo', label: 'Pull Manifests', protocol: 'Git HTTPS' },
        { id: 'e2', from: 'gitops', to: 'tf', label: 'HCL Modules', protocol: 'State Lock' },
        { id: 'e3', from: 'argo', to: 'k8s', label: 'Apply Diff', protocol: 'K8s API' },
        { id: 'e4', from: 'k8s', to: 'prod', label: 'Rollout Pods', protocol: 'Controller' },
        { id: 'e5', from: 'prod', to: 'argo', label: 'Watch Drift', protocol: 'Informer' },
      ],
      steps: [
        {
          id: 's1',
          title: 'GitOps Controller Pulls Desired State',
          activeNodeIds: ['gitops', 'argo', 'tf'],
          activeEdgeIds: ['e1', 'e2'],
          detail: 'Cluster-local ArgoCD pulls manifests outbound over HTTPS—CI never needs inbound cluster-admin credentials.',
          latencyLabel: '3s sync poll',
        },
        {
          id: 's2',
          title: 'Declarative Diff & Admission Validation',
          activeNodeIds: ['argo', 'k8s', 'prod'],
          activeEdgeIds: ['e3', 'e4'],
          detail: 'ArgoCD computes the live vs desired diff and applies updated image digests and HPA limits cleanly.',
          latencyLabel: '4.5s apply',
        },
        {
          id: 's3',
          title: 'Continuous Drift Detection & Self-Healing',
          activeNodeIds: ['prod', 'argo', 'k8s'],
          activeEdgeIds: ['e5', 'e3'],
          detail: 'If someone manually runs kubectl edit in prod, the informer flags OutOfSync and selfHeal reverts it back to Git automatically.',
          latencyLabel: '< 5s heal',
        },
      ],
      mermaidCode: `flowchart LR
  GIT[(GitOps Desired State Repo)] -->|Outbound Pull| ARGO[ArgoCD / Flux Controller]
  ARGO -->|Apply Verified Diff| API[Kubernetes API Server]
  API --> LIVE[Production Workloads]
  LIVE -->|Continuous Watch| ARGO
  ARGO -->|Manual Tamper Detected -> selfHeal| API`,
    },
    simulatorStoryboard: {
      controls: ['Tamper Production Config (Manual SSH/kubectl edit)', 'Toggle selfHeal Auto-Reconcile'],
      failureInjections: ['Reduce prod replicas 6 -> 1', 'Downgrade TLS 1.3 -> 1.0', 'Open SSH port 22'],
      visualTransitions: 'Cluster status shifts Synced -> OutOfSync (Drift Alert) -> GitOps controller pulses and overwrites live state back to Git.',
    },
  },
  {
    id: 'operate-observe',
    code: '1.6',
    title: 'Operate, Observe & Self-Heal (SLOs, OTel & Auto-Rollback)',
    stageSummary: 'Metrics/Logs/Traces via OpenTelemetry, multi-window SLO error-budget alerts, and automated canary rollbacks.',
    plainEnglish: {
      whatItIs:
        'The nervous system of production: collecting golden signals (latency, traffic, errors, saturation) and triggering automated rollbacks before users even tweet about an outage.',
      problemSolved:
        'Turns blind 3 AM guesswork into pinpointed distributed trace diagnostics and protects reliability budgets automatically.',
      whatBreaksIfSkipped:
        'Memory leaks silently OOMKill pods one by one, bad releases burn 100% of monthly error budgets in minutes, and Mean Time to Recovery (MTTR) stretches into hours.',
    },
    actionMechanics: {
      inputs: ['OpenTelemetry Metrics/Traces/Logs', 'SLI/SLO burn-rate rules (99.95% availability)', 'Argo Rollouts AnalysisTemplate'],
      automatedTriggers: ['5xx error rate > 1% OR p99 > 400ms for 2 min -> Auto-abort rollout + Shift 100% traffic to stable + Page on-call'],
      outputs: ['Automated rollback in < 10 seconds', 'Correlated trace_id + structured JSON log snapshot for blameless postmortem'],
      configTitle: 'argo-analysis-template.yaml (Automated Canary Analysis)',
      configLanguage: 'yaml',
      configSnippet: `apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: slo-error-budget-guard
spec:
  metrics:
    - name: http-5xx-error-rate
      interval: 30s
      successCondition: result[0] < 0.01
      failureLimit: 2
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{status=~"5..",version="canary"}[2m]))
            /
            sum(rate(http_requests_total{version="canary"}[2m]))`,
    },
    implementations: {
      aws: 'CloudWatch Container Insights + AWS X-Ray + Amazon Managed Grafana + CloudWatch Alarms triggering CodeDeploy auto-rollback.',
      gcp: 'Cloud Monitoring SLOs + Cloud Logging + Cloud Trace + Cloud Deploy / GKE Gateway automated rollback triggers.',
      inHouse: 'OpenTelemetry Collector -> Prometheus/Thanos + Grafana Loki + Jaeger/Tempo + Alertmanager + Argo Rollouts/Flagger.',
    },
    dfd: {
      id: 'dfd-operate-observe',
      title: 'Telemetry & Self-Healing Feedback Loop',
      subtitle: 'OTel Collector -> Prometheus SLO Guard -> Automated Rollback',
      level: 'Stage 1.6',
      nodes: [
        { id: 'app', label: 'Prod Pods', sublabel: 'OTel SDK Emit', x: 75, y: 120, zone: 'cloud' },
        { id: 'otel', label: 'OTel Collector', sublabel: 'Metrics/Logs/Traces', x: 260, y: 120, zone: 'ops' },
        { id: 'prom', label: 'Prometheus / CW', sublabel: 'SLO Burn Rules', x: 455, y: 120, zone: 'ops' },
        { id: 'rollout', label: 'Rollout Guard', sublabel: 'Argo / Flagger', x: 635, y: 120, zone: 'sec' },
        { id: 'lb', label: 'Ingress / ALB', sublabel: 'Shift 100% Stable', x: 805, y: 120, zone: 'cloud' },
      ],
      edges: [
        { id: 'e1', from: 'app', to: 'otel', label: 'OTLP gRPC', protocol: 'gRPC' },
        { id: 'e2', from: 'otel', to: 'prom', label: 'Time-Series', protocol: 'Remote Write' },
        { id: 'e3', from: 'prom', to: 'rollout', label: '5xx > 1% Breach', protocol: 'PromQL Alert' },
        { id: 'e4', from: 'rollout', to: 'lb', label: 'Abort Canary', protocol: 'Weight=0%' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Structured Golden Signals Collection',
          activeNodeIds: ['app', 'otel'],
          activeEdgeIds: ['e1'],
          detail: 'Every pod streams latency histograms, error counters, and trace spans to the vendor-neutral OpenTelemetry Collector.',
          latencyLabel: '10s scrape',
        },
        {
          id: 's2',
          title: 'Multi-Window SLO Burn-Rate Evaluation',
          activeNodeIds: ['otel', 'prom'],
          activeEdgeIds: ['e2'],
          detail: 'Prometheus / CloudWatch evaluates Canary vs Stable 5xx rates and p99 latency across sliding 2-minute windows.',
          latencyLabel: '30s eval',
        },
        {
          id: 's3',
          title: 'Automated Rollback & Traffic Drain',
          activeNodeIds: ['prom', 'rollout', 'lb'],
          activeEdgeIds: ['e3', 'e4'],
          detail: 'Upon two consecutive SLO breaches, Argo Rollouts automatically zeroes Canary weight at the ALB/Ingress and preserves trace logs.',
          latencyLabel: '< 6s MTTR',
        },
      ],
      mermaidCode: `flowchart LR
  PODS[Production Pods] -->|OTLP gRPC| OTEL[OpenTelemetry Collector]
  OTEL --> PROM[Prometheus / CloudWatch / Cloud Monitoring]
  PROM -->|SLO Error Rate > 1%| GUARD[Argo Rollouts / Flagger]
  GUARD -->|Auto-Rollback Weight=0%| INGRESS[ALB / Cloud LB / Envoy Ingress]`,
    },
    simulatorStoryboard: {
      controls: ['Canary Weight Slider (0-100%)', 'Inject 500 Errors (8.4%)', 'Inject OOMKill Memory Leak'],
      failureInjections: ['Simulated payment gateway timeout spiking Canary 5xx above 1% SLO threshold'],
      visualTransitions: 'SLO gauge crosses threshold -> Alert fires -> Traffic router snaps Canary to 0% and drains back to Stable v1.',
    },
  },
];

export const ENVIRONMENT_PROGRESSION_STAGES: EnvironmentStage[] = [
  {
    id: 'local-preview',
    order: 1,
    name: 'Local & Ephemeral PR Preview',
    shortName: 'LOCAL / PR',
    purpose: 'Rapid inner-loop development and isolated per-Pull-Request review environments that auto-destroy on merge.',
    promotionTrigger: 'Every Pull Request commit triggers an ephemeral namespace (pr-412.preview.internal).',
    dataPolicy: '100% synthetic seeded fixtures (Faker / Testcontainers); zero customer PII allowed.',
    testingGates: ['Pre-commit Gitleaks + Linter', 'Fast unit tests (< 90s)', 'Terraform plan preview comment'],
    approvalControl: 'Automated CI pass + 1 peer reviewer approval via CODEOWNERS.',
    infraSizing: 'Scale-to-zero / Spot instances (0.25 vCPU, 256Mi RAM) — destroyed immediately on PR close.',
  },
  {
    id: 'dev',
    order: 2,
    name: 'Development Integration',
    shortName: 'DEV',
    purpose: 'Continuous integration target where all merged trunk commits verify cross-service contracts and event schemas.',
    promotionTrigger: 'Automatic on every squash-merge to main via GitOps.',
    dataPolicy: 'Synthetic integration datasets refreshed nightly; sandbox payment/SMS stubs.',
    testingGates: ['SAST + Trivy Container CVE scan', 'Cross-service Pact contract tests', 'Database migration dry-run'],
    approvalControl: 'Fully automated continuous deployment (zero manual clicks).',
    infraSizing: 'Shared multi-tenant non-prod cluster; single-AZ Spot/Preemptible nodes.',
  },
  {
    id: 'qa-uat',
    order: 3,
    name: 'QA & User Acceptance Testing',
    shortName: 'QA / UAT',
    purpose: 'Automated E2E browser journeys, API security probing (DAST), and product stakeholder sign-off.',
    promotionTrigger: 'Automatic promotion of green DEV digest or release-candidate tag.',
    dataPolicy: 'Anonymized & tokenized dataset mimicking production cardinality without raw PII.',
    testingGates: ['Playwright/Cypress E2E suite', 'OWASP ZAP DAST active scan', 'Accessibility & schema backward-compatibility tests'],
    approvalControl: 'Automated E2E + optional QA/Product sign-off for regulated releases.',
    infraSizing: 'Dedicated namespace with realistic replica counts (2+ pods) to catch distributed race conditions.',
  },
  {
    id: 'staging',
    order: 4,
    name: 'Staging / Pre-Production Mirror',
    shortName: 'STAGING',
    purpose: 'Exact topology parity with Production to validate load testing, failover drills, and expand-contract DB migrations.',
    promotionTrigger: 'GitOps PR bumping exact signed sha256 image digest from QA -> Staging.',
    dataPolicy: 'Production-scale scrubbed snapshot + masked traffic replay (shadowing) for query plan verification.',
    testingGates: ['k6 / Locust load test at 2x peak RPS', 'Chaos fault injection (kill 1 AZ)', 'Verify zero slow-query regressions'],
    approvalControl: 'Automated load-SLO check + Change Advisory / Release Lead approval for high-risk DB migrations.',
    infraSizing: 'Identical IaC module to Prod (multi-AZ, same TLS/WAF rules, scaled 50-100% capacity during load windows).',
  },
  {
    id: 'prod',
    order: 5,
    name: 'Production',
    shortName: 'PROD',
    purpose: 'Live customer-facing environment guarded by progressive rollouts, strict admission policies, and SLO auto-rollback.',
    promotionTrigger: 'Signed GitOps commit promoting the exact Staging-verified immutable digest (never rebuilt!).',
    dataPolicy: 'Encrypted at rest (KMS) & in transit (mTLS), strict RBAC audit logs, automated point-in-time backups.',
    testingGates: ['Cosign signature + Binary Authorization verify', 'Progressive Canary (1% -> 5% -> 25% -> 50% -> 100%)', 'Synthetic post-deploy canary probes'],
    approvalControl: 'Zero-touch automated rollout with automated SLO rollback; Break-glass IAM requires dual-party approval + ticket.',
    infraSizing: 'Multi-AZ High Availability, Horizontal Pod Autoscaler + Cluster Autoscaler / Karpenter, multi-region DR plan.',
  },
];

export const DEPLOYMENT_STRATEGIES: DeploymentStrategy[] = [
  {
    id: 'recreate',
    code: '3.1',
    name: 'Recreate',
    summary: 'Terminates all v1 instances completely before booting v2 instances. Simple and cheap, but incurs deliberate downtime.',
    downtime: 'Yes (15s - 5m)',
    infraCost: '1.0x (Lowest)',
    rollbackSpeed: 'Slow (Redeploy v1)',
    complexity: 'Low',
    dbSchemaStrategy: 'A maintenance window can permit a coordinated breaking schema change only when all old clients/workers are stopped and rollback/data-compatibility is planned. Recreate prevents old and new pods from overlapping during the rollout, but it does not by itself make database changes safe or reversible.',
    bestFor: 'Internal batch workers, non-prod DEV environments, or legacy monoliths holding exclusive file locks.',
    avoidWhen: 'Any customer-facing API or SLA > 99.5% where dropped connections are unacceptable.',
    configTitle: 'k8s-recreate-strategy.yaml',
    configSnippet: `spec:
  replicas: 4
  strategy:
    type: Recreate # Terminates all v1 pods before creating v2`,
  },
  {
    id: 'rolling',
    code: '3.2',
    name: 'Ramped / Rolling Update',
    summary: 'Incrementally replaces v1 pods with v2 pods using maxSurge and maxUnavailable, gated by HTTP readiness probes.',
    downtime: 'Zero (with probes)',
    infraCost: '1.25x transient',
    rollbackSpeed: 'Medium (30s - 2m)',
    complexity: 'Low',
    dbSchemaStrategy: 'Mandatory Expand-Contract (v1 and v2 read/write the same DB simultaneously during rollout).',
    bestFor: 'Default Kubernetes stateless microservices where gradual replacement without doubling infra cost is ideal.',
    avoidWhen: 'You need instant 1-second traffic cutback or strict isolation preventing mixed v1/v2 API responses.',
    configTitle: 'k8s-rolling-update.yaml',
    configSnippet: `spec:
  replicas: 8
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # Spin up to 2 new pods ahead
      maxUnavailable: 0    # Never drop below 8 ready pods
  template:
    spec:
      containers:
        - name: api
          readinessProbe:
            httpGet: { path: /healthz/ready, port: 8080 }
            periodSeconds: 5`,
  },
  {
    id: 'blue-green',
    code: '3.3',
    name: 'Blue-Green Deployment',
    summary: 'Runs full-capacity Green (v2) stack alongside live Blue (v1), runs smoke tests, then flips the Load Balancer atomically.',
    downtime: 'Zero',
    infraCost: '2.0x during switch',
    rollbackSpeed: 'Instant (< 2s LB flip)',
    complexity: 'Medium',
    dbSchemaStrategy: 'Use an Expand-Contract migration so both blue and green versions can operate during the overlap. Rollback still requires compatible data writes, migration sequencing and validation; a traffic switch alone cannot undo a destructive schema change.',
    bestFor: 'High-stakes stateful cutovers, regulatory releases requiring pre-cutover smoke verification, and instant rollback guarantees.',
    avoidWhen: 'Massive compute fleets where temporarily doubling cluster capacity (2x cost) is prohibitive.',
    configTitle: 'argo-blue-green.yaml',
    configSnippet: `spec:
  strategy:
    blueGreen:
      activeService: checkout-live
      previewService: checkout-preview
      autoPromotionEnabled: false   # Hold until smoke tests pass
      scaleDownDelaySeconds: 600    # Keep Blue warm 10m for instant rollback`,
  },
  {
    id: 'canary',
    code: '3.4',
    name: 'Canary Release (Progressive Delivery)',
    summary: 'Routes a tiny live traffic slice (1% -> 5% -> 25% -> 50% -> 100%) to v2 while Automated Canary Analysis guards SLOs.',
    downtime: 'Zero',
    infraCost: '1.05x - 1.2x',
    rollbackSpeed: 'Instant (< 5s weight=0)',
    complexity: 'High',
    dbSchemaStrategy: 'Strict Expand-Contract + dual-write compatibility across both v1 and v2 traffic slices.',
    bestFor: 'High-traffic consumer platforms (fintech, quick-commerce, SaaS) minimizing blast radius to < 1% of users.',
    avoidWhen: 'Very low traffic services (< 5 req/sec) where 1% traffic produces too few samples for statistical SLO confidence.',
    configTitle: 'argo-canary-rollout.yaml',
    configSnippet: `spec:
  strategy:
    canary:
      analysis:
        templates: [{ templateName: slo-error-budget-guard }]
      steps:
        - setWeight: 1
        - pause: { duration: 2m }
        - setWeight: 5
        - pause: { duration: 5m }
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }`,
  },
  {
    id: 'shadow',
    code: '3.5',
    name: 'Shadow / Dark Launch',
    summary: 'Asynchronously mirrors real production HTTP requests to v2 while discarding v2 responses—zero customer impact.',
    downtime: 'Zero',
    infraCost: '1.5x - 2.0x',
    rollbackSpeed: 'N/A (No live user traffic)',
    complexity: 'High',
    dbSchemaStrategy: 'v2 MUST stub or isolate side effects (payments, emails, DB writes) so mirrored requests never double-charge users!',
    bestFor: 'Benchmarking rewritten services, new search ranking models, or database engine migrations under real prod payloads.',
    avoidWhen: 'Write-heavy transactional endpoints without idempotent side-effect isolation.',
    configTitle: 'istio-traffic-mirror.yaml',
    configSnippet: `http:
  - route:
      - destination: { host: pricing-svc, subset: v1-stable }
        weight: 100
    mirror:
      host: pricing-svc
      subset: v2-shadow
    mirrorPercentage:
      value: 25.0 # Async copy 25% of prod traffic; responses discarded`,
  },
  {
    id: 'ab-flags',
    code: '3.6',
    name: 'A/B Testing & Feature Flags',
    summary: 'Decouples code deployment from feature release using dynamic runtime flags targeted by user cohort, header, or geo.',
    downtime: 'Zero',
    infraCost: '1.0x',
    rollbackSpeed: 'Instant (< 1s flag kill-switch)',
    complexity: 'Medium',
    dbSchemaStrategy: 'Both code paths coexist cleanly in one binary; prune stale flags every sprint to avoid combinatorial tech debt.',
    bestFor: 'Product experiments, regional rollouts (e.g., Mumbai beta users), and instant feature kill-switches without redeploying.',
    avoidWhen: 'Deep infrastructure changes (kernel upgrades, runtime migrations) that cannot be branched at application code level.',
    configTitle: 'feature-flag-guard.ts',
    configSnippet: `const useNewRanking = await flagClient.getBooleanValue(
  'checkout-instant-eta-v2',
  false,
  { targetingKey: user.id, region: user.city, tier: user.plan }
);
return useNewRanking ? computeInstantEtaV2(cart) : computeLegacyEta(cart);`,
  },
];

export const HYBRID_AIRGAPPED_BLUEPRINT: HybridAirGapPattern[] = [
  {
    id: 'offline-registry',
    title: 'Air-Gapped OCI Bundle & Harbor Replication',
    summary: 'Defense, banking, and hospital networks physically prohibit outbound internet pulls from production clusters.',
    architectureFlow: 'Connected DMZ Scanner -> Trivy + Cosign Verify -> Export OCI Tarball (oras/skopeo) -> Unidirectional Diode / Bastion -> Internal Harbor Registry.',
    securityBoundary: 'Zero outbound 0.0.0.0/0 egress from production subnets; admission controller rejects any image outside registry.internal.',
    tooling: 'Harbor Proxy Cache, Skopeo / ORAS, Zarf, Cosign offline transparency bundle.',
  },
  {
    id: 'gitops-bundle',
    title: 'Multi-Cloud & Bare-Metal Unified GitOps',
    summary: 'Run identical Kubernetes workloads across AWS EKS, GCP GKE, and On-Premise RKE2 using Kustomize overlays.',
    architectureFlow: 'Base Manifests (Deployment/Service) -> Overlays (/aws-eks, /gcp-gke, /onprem-dc1) -> Per-Cluster ArgoCD Pull Agent.',
    securityBoundary: 'Each cluster pulls only its own encrypted branch/directory via cluster-scoped deploy keys + External Secrets backend.',
    tooling: 'ArgoCD ApplicationSets, Kustomize, External Secrets Operator, OpenTelemetry Collector.',
  },
  {
    id: 'cloud-bursting',
    title: 'Hybrid Traffic Bursting & Private Interconnect',
    summary: 'Serve baseline predictable traffic cheaply on owned bare-metal servers, bursting flash-sale spikes seamlessly to AWS/GCP.',
    architectureFlow: 'Global DNS / Anycast -> Primary On-Prem HAProxy/MetalLB (up to 80% CPU) -> Spillover Weight over Direct Connect / Cloud Interconnect -> Cloud EKS/Cloud Run.',
    securityBoundary: 'Dedicated private L2/BGP link (AWS Direct Connect / GCP Cloud Interconnect) with mTLS mesh across sites.',
    tooling: 'Route 53 / Cloud DNS Weighted Routing, Cilium ClusterMesh, HAProxy, AWS Direct Connect / GCP Interconnect.',
  },
];

export const MASTER_DEVOPS_DFDS: DevOpsDfdGraph[] = [
  {
    id: 'master-level-0',
    title: 'Diagram 1: Level 0 — DevOps Infinite Feedback Loop',
    subtitle: 'End-to-end closed loop from developer commit through production telemetry back into backlog prioritization',
    level: 'Level 0 Overview',
    nodes: [
      { id: 'plan', label: 'Plan & Code', sublabel: 'Git + Pre-Commit', x: 90, y: 120, zone: 'dev' },
      { id: 'ci', label: 'CI Build & Scan', sublabel: 'OCI + SBOM + CVE', x: 270, y: 55, zone: 'ci' },
      { id: 'reg', label: 'Artifact & Vault', sublabel: 'Signed + Dynamic', x: 470, y: 55, zone: 'sec' },
      { id: 'cd', label: 'GitOps Deploy', sublabel: 'Canary / Blue-Green', x: 675, y: 120, zone: 'cloud' },
      { id: 'obs', label: 'Observe & Heal', sublabel: 'SLOs -> Auto-Rollback', x: 410, y: 205, zone: 'ops' },
    ],
    edges: [
      { id: 'e1', from: 'plan', to: 'ci', label: 'PR / Trunk Push', protocol: 'Git' },
      { id: 'e2', from: 'ci', to: 'reg', label: 'Push Signed Digest', protocol: 'OCI' },
      { id: 'e3', from: 'reg', to: 'cd', label: 'Pull Verified Image', protocol: 'GitOps' },
      { id: 'e4', from: 'cd', to: 'obs', label: 'OTel Golden Signals', protocol: 'OTLP' },
      { id: 'e5', from: 'obs', to: 'plan', label: 'SLO Feedback & RCA', protocol: 'Feedback' },
    ],
    steps: [
      {
        id: 'l0-1',
        title: 'Commit Enters Automated CI Factory',
        activeNodeIds: ['plan', 'ci'],
        activeEdgeIds: ['e1'],
        detail: 'Pre-commit verified code merges to trunk, triggering ephemeral runners for compilation, unit tests, and SAST/CVE checks.',
        latencyLabel: '2.5 min CI',
      },
      {
        id: 'l0-2',
        title: 'Immutable Artifact Signed & Stored',
        activeNodeIds: ['ci', 'reg'],
        activeEdgeIds: ['e2'],
        detail: 'Distroless image receives CycloneDX SBOM + Cosign signature and lands in ECR / Artifact Registry / Harbor.',
        latencyLabel: 'Immutable SHA',
      },
      {
        id: 'l0-3',
        title: 'GitOps Progressive Rollout to Prod',
        activeNodeIds: ['reg', 'cd'],
        activeEdgeIds: ['e3'],
        detail: 'ArgoCD/Flux pulls the new digest, binds dynamic Vault/Secrets Manager leases, and starts a Canary or Blue-Green rollout.',
        latencyLabel: 'Zero Downtime',
      },
      {
        id: 'l0-4',
        title: 'Observability Closes the Loop',
        activeNodeIds: ['cd', 'obs', 'plan'],
        activeEdgeIds: ['e4', 'e5'],
        detail: 'OpenTelemetry metrics verify SLO health (or trigger instant rollback) and feed latency/error insights back into sprint planning.',
        latencyLabel: 'Continuous Loop',
      },
    ],
    mermaidCode: `flowchart LR
  PLAN[Plan & Code: Trunk + Pre-Commit] -->|PR Merge| CI[CI Build, Test & CVE Scan]
  CI -->|Signed sha256 + SBOM| REG[(Registry & Vault Secrets)]
  REG -->|Pull-Based GitOps| CD[Progressive Deploy: Canary / Blue-Green]
  CD -->|Metrics, Logs, Traces| OBS[Observability & SLO Auto-Heal]
  OBS -->|Error Budgets & Insights| PLAN`,
  },
  {
    id: 'master-level-1-cicd',
    title: 'Diagram 2: Level 1 — CI/CD & DevSecOps Security Pipeline',
    subtitle: 'Explicit security boundaries across Git, ephemeral runners, scanners, Vault, OCI registry, and K8s admission control',
    level: 'Level 1 Security',
    nodes: [
      { id: 'git', label: 'Git + Gitleaks', sublabel: 'Signed Commits', x: 75, y: 125, zone: 'dev' },
      { id: 'run', label: 'Ephemeral Runner', sublabel: 'BuildKit + Tests', x: 245, y: 125, zone: 'ci' },
      { id: 'sec', label: 'SAST / Trivy', sublabel: 'Cosign + SBOM', x: 425, y: 65, zone: 'sec' },
      { id: 'vault', label: 'Secrets Vault', sublabel: 'OIDC Short-Lived', x: 425, y: 195, zone: 'sec' },
      { id: 'k8s', label: 'Admission + K8s', sublabel: 'OPA Verify + Run', x: 720, y: 125, zone: 'cloud' },
    ],
    edges: [
      { id: 'e1', from: 'git', to: 'run', label: 'Immutable SHA', protocol: 'Webhook' },
      { id: 'e2', from: 'run', to: 'sec', label: 'Scan & Sign', protocol: 'SARIF/Cosign' },
      { id: 'e3', from: 'run', to: 'vault', label: 'OIDC Token', protocol: 'No Static Keys' },
      { id: 'e4', from: 'sec', to: 'k8s', label: 'Signed Digest', protocol: 'OPA Gate' },
      { id: 'e5', from: 'vault', to: 'k8s', label: 'tmpfs Secrets', protocol: 'CSI Driver' },
    ],
    steps: [
      {
        id: 'l1-1',
        title: 'Untrusted Commit Enters Isolated Runner',
        activeNodeIds: ['git', 'run'],
        activeEdgeIds: ['e1'],
        detail: 'Runner boots fresh with zero persistent state and builds the container image deterministically.',
        latencyLabel: 'Isolated VM',
      },
      {
        id: 'l1-2',
        title: 'Dual Security Boundary: Scan + OIDC Secret Exchange',
        activeNodeIds: ['run', 'sec', 'vault'],
        activeEdgeIds: ['e2', 'e3'],
        detail: 'Trivy & Semgrep enforce 0 Critical CVEs while Vault issues short-lived OIDC tokens—no hardcoded secrets exist in CI.',
        latencyLabel: 'Zero Static Keys',
      },
      {
        id: 'l1-3',
        title: 'Cluster Admission Verifies Signature & Mounts Secrets',
        activeNodeIds: ['sec', 'vault', 'k8s'],
        activeEdgeIds: ['e4', 'e5'],
        detail: 'Kyverno/OPA rejects unsigned images; approved pods receive memory-only credentials via CSI Secrets Store.',
        latencyLabel: 'Enforced Trust',
      },
    ],
    mermaidCode: `flowchart LR
  subgraph DevZone[Developer Boundary]
    GIT[Git Repo + Gitleaks]
  end
  subgraph CIZone[Ephemeral CI Boundary]
    RUN[Stateless BuildKit Runner]
    SCAN[Semgrep SAST + Trivy CVE + Cosign]
  end
  subgraph ProdZone[Zero-Trust Production Boundary]
    VAULT[Vault / AWS & GCP Secret Manager]
    OPA{OPA / Binary Auth Admission}
    K8S[EKS / GKE / Bare-Metal Cluster]
  end
  GIT --> RUN --> SCAN -->|Signed Digest| OPA --> K8S
  VAULT -->|Dynamic RAM Lease| K8S`,
  },
  {
    id: 'master-cloud-vs-onprem',
    title: 'Diagram 3: Cloud (AWS/GCP) vs. In-House Traffic Routing',
    subtitle: 'Comparing managed elastic cloud load balancers against self-hosted HAProxy, Keepalived VRRP, and MetalLB',
    level: 'Infra Comparison',
    nodes: [
      { id: 'dns', label: 'Global DNS', sublabel: 'Route53 / Cloud DNS', x: 80, y: 125, zone: 'dev' },
      { id: 'cloudlb', label: 'AWS ALB / GCP LB', sublabel: 'Managed WAF + TLS', x: 320, y: 60, zone: 'cloud' },
      { id: 'cloudscale', label: 'EKS / GKE / Run', sublabel: 'Elastic Auto-Scale', x: 660, y: 60, zone: 'cloud' },
      { id: 'onpremlb', label: 'HAProxy + VRRP', sublabel: 'MetalLB BGP VIP', x: 320, y: 195, zone: 'ops' },
      { id: 'baremetal', label: 'Bare-Metal Nodes', sublabel: 'Fixed Rack Capacity', x: 660, y: 195, zone: 'ops' },
    ],
    edges: [
      { id: 'e1', from: 'dns', to: 'cloudlb', label: 'Cloud Route', protocol: 'Anycast HTTPS' },
      { id: 'e2', from: 'cloudlb', to: 'cloudscale', label: 'Target Group', protocol: 'Auto-Scale' },
      { id: 'e3', from: 'dns', to: 'onpremlb', label: 'DC VIP', protocol: 'BGP / VRRP' },
      { id: 'e4', from: 'onpremlb', to: 'baremetal', label: 'L7 Backend', protocol: 'Fixed Pool' },
    ],
    steps: [
      {
        id: 'l3-1',
        title: 'Cloud Path: Managed L7 Edge & Elastic Auto-Scaling',
        activeNodeIds: ['dns', 'cloudlb', 'cloudscale'],
        activeEdgeIds: ['e1', 'e2'],
        detail: 'AWS ALB or GCP Global Load Balancer terminates TLS + WAF at edge, while Karpenter/GKE Autopilot provisions extra compute nodes in ~45s during spikes.',
        latencyLabel: 'Elastic Scale',
      },
      {
        id: 'l3-2',
        title: 'In-House Path: Self-Managed HAProxy, Keepalived & MetalLB',
        activeNodeIds: ['dns', 'onpremlb', 'baremetal'],
        activeEdgeIds: ['e3', 'e4'],
        detail: 'Active/Passive HAProxy pairs hold a floating VIP via Keepalived VRRP and route into MetalLB Kubernetes Services on fixed physical rack servers.',
        latencyLabel: 'Predictable CapEx',
      },
      {
        id: 'l3-3',
        title: 'Traffic Spike Divergence',
        activeNodeIds: ['cloudscale', 'baremetal'],
        activeEdgeIds: ['e2', 'e4'],
        detail: 'At 5x flash traffic, Cloud scales pods + nodes automatically (higher OpEx); Bare-Metal caps at rack CPU ceiling unless weighted DNS bursts excess load to Cloud.',
        latencyLabel: 'Hybrid Burst',
      },
    ],
    mermaidCode: `flowchart LR
  DNS[Global DNS: Route 53 / Cloud DNS] -->|Cloud Traffic| CLB[AWS ALB / GCP Global LB + WAF]
  CLB --> EKS[EKS / GKE / Cloud Run Auto-Scaling Pool]
  DNS -->|On-Prem VIP| VRRP[Keepalived VRRP + HAProxy + MetalLB]
  VRRP --> METAL[On-Premise Bare-Metal RKE2/kubeadm Rack]`,
  },
  {
    id: 'master-canary-rollback',
    title: 'Diagram 4: Canary Rollback Telemetry Loop',
    subtitle: 'How Prometheus / CloudWatch feeds Argo Rollouts to cut bad canary traffic back to 0% automatically',
    level: 'Self-Healing CD',
    nodes: [
      { id: 'ingress', label: 'Ingress / ALB', sublabel: 'Split 95% / 5%', x: 80, y: 125, zone: 'cloud' },
      { id: 'v1', label: 'Stable v1 Pods', sublabel: '95% Healthy', x: 325, y: 60, zone: 'cloud' },
      { id: 'v2', label: 'Canary v2 Pods', sublabel: '5% Error Spike', x: 325, y: 195, zone: 'sec' },
      { id: 'prom', label: 'Prometheus / CW', sublabel: '5xx = 8.4% > 1%', x: 575, y: 195, zone: 'ops' },
      { id: 'argo', label: 'Argo Rollouts', sublabel: 'Auto-Rollback', x: 775, y: 125, zone: 'sec' },
    ],
    edges: [
      { id: 'e1', from: 'ingress', to: 'v1', label: '95% Traffic', protocol: 'HTTP/2' },
      { id: 'e2', from: 'ingress', to: 'v2', label: '5% Canary', protocol: 'HTTP/2' },
      { id: 'e3', from: 'v2', to: 'prom', label: 'Emit 500s', protocol: 'Metrics' },
      { id: 'e4', from: 'prom', to: 'argo', label: 'SLO Breach', protocol: 'Query Fail' },
      { id: 'e5', from: 'argo', to: 'ingress', label: 'Reset 100/0', protocol: 'Rollback' },
    ],
    steps: [
      {
        id: 'l4-1',
        title: 'Weighted Traffic Split (95% Stable / 5% Canary)',
        activeNodeIds: ['ingress', 'v1', 'v2'],
        activeEdgeIds: ['e1', 'e2'],
        detail: 'Ingress/ALB exposes only 5% of live requests to v2 so 95% of customers remain completely unaffected.',
        latencyLabel: '5% Blast Radius',
      },
      {
        id: 'l4-2',
        title: 'Automated Canary Analysis Detects 5xx Spike',
        activeNodeIds: ['v2', 'prom', 'argo'],
        activeEdgeIds: ['e3', 'e4'],
        detail: 'Prometheus queries report 8.4% HTTP 500s on Canary vs 0.04% on Stable, immediately failing the AnalysisRun.',
        latencyLabel: '30s Detection',
      },
      {
        id: 'l4-3',
        title: 'Autonomous Rollback to 100% Stable v1',
        activeNodeIds: ['argo', 'ingress', 'v1'],
        activeEdgeIds: ['e5', 'e1'],
        detail: 'Argo Rollouts updates Ingress weights to 100% v1 / 0% v2 and scales down the faulty Canary ReplicaSet without human intervention.',
        latencyLabel: '< 4s Recovery',
      },
    ],
    mermaidCode: `flowchart LR
  LB[Ingress / AWS ALB / GCP LB] -->|95% Weight| V1[Stable v1 Pods]
  LB -->|5% Canary Weight| V2[Canary v2 Pods]
  V2 -->|5xx Error Rate 8.4%| PROM[Prometheus / CloudWatch]
  PROM -->|SLO Threshold > 1% Breached| ARGO[Argo Rollouts Controller]
  ARGO -->|Abort & Set Canary Weight = 0%| LB`,
  },
];

export const CLI_OUTAGE_SCENARIOS: CliOutageScenario[] = [
  {
    id: 'crashloop-oom',
    title: 'Incident 01: Production Checkout CrashLoopBackOff (OOMKilled)',
    environment: 'AWS EKS (prod-us-east-1)',
    severity: 'SEV-1',
    symptom: 'Customers report intermittent 502 Bad Gateway errors on /api/checkout after release v2.14.0.',
    objective: 'Inspect failing pods, diagnose the root cause via describe/logs, and roll back cleanly.',
    steps: [
      {
        id: 's1',
        command: 'kubectl get pods -n prod-checkout',
        aliases: ['kubectl get pods', 'k get pods'],
        hint: 'List running pods in the prod-checkout namespace to spot crash loops.',
        output: `NAME                                READY   STATUS             RESTARTS      AGE
checkout-api-6f9c7b8d4-2k9lm        0/1     CrashLoopBackOff   5 (38s ago)   4m
checkout-api-6f9c7b8d4-8v2qp        0/1     OOMKilled          4 (51s ago)   4m
checkout-api-5b4d8a1c9-9x4zt        1/1     Running            0             6d`,
        insight: 'Notice the new ReplicaSet (6f9c7b8d4) is cycling between OOMKilled and CrashLoopBackOff while 1 old pod stays Running.',
      },
      {
        id: 's2',
        command: 'kubectl describe pod checkout-api-6f9c7b8d4-8v2qp -n prod-checkout',
        aliases: ['kubectl describe pod', 'describe pod'],
        hint: 'Inspect pod events and container exit code to confirm memory exhaustion.',
        output: `Containers:
  checkout-api:
    Image:          123456789012.dkr.ecr.us-east-1.amazonaws.com/checkout@sha256:9f82a1...
    Limits:         memory: 512Mi
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
Events:
  Warning  BackOff  12s (x9 over 3m)  kubelet  Back-off restarting failed container`,
        insight: 'Exit Code 137 confirms the Linux kernel OOM killer terminated the container when heap exceeded its 512Mi cgroup limit.',
      },
      {
        id: 's3',
        command: 'kubectl rollout undo deployment/checkout-api -n prod-checkout',
        aliases: ['kubectl rollout undo', 'rollout undo'],
        hint: 'Immediately roll back the deployment to the last known healthy revision.',
        output: `deployment.apps/checkout-api rolled back
Waiting for deployment "checkout-api" rollout to finish: 3 of 3 updated replicas are available...
deployment "checkout-api" successfully rolled back to revision 41 (v2.13.9).`,
        insight: 'Mitigation first! Production traffic is restored in < 8 seconds; next, inspect heap profiles from v2.14.0 in Staging.',
        resolvesOutage: true,
      },
    ],
  },
  {
    id: 'iam-secrets-denied',
    title: 'Incident 02: Cloud Run / EKS Secret AccessDeniedException',
    environment: 'AWS + GCP Hybrid Payments',
    severity: 'SEV-2',
    symptom: 'New billing-worker service fails to start with "AccessDeniedException: secretsmanager:GetSecretValue".',
    objective: 'Verify active workload identity, inspect secret access policy, and verify the least-privilege fix.',
    steps: [
      {
        id: 's1',
        command: 'aws sts get-caller-identity',
        aliases: ['sts get-caller-identity', 'whoami'],
        hint: 'Confirm which IAM role the workload pod is assuming via IRSA / Pod Identity.',
        output: `{
  "UserId": "AROA4EXAMPLE:eks-billing-worker",
  "Account": "482910384712",
  "Arn": "arn:aws:sts::482910384712:assumed-role/eks-billing-worker-role/pod-01"
}`,
        insight: 'Pod is correctly assuming eks-billing-worker-role via OIDC—no static IAM keys involved.',
      },
      {
        id: 's2',
        command: 'aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::482910384712:role/eks-billing-worker-role --action-names secretsmanager:GetSecretValue',
        aliases: ['aws iam simulate-principal-policy', 'iam simulate'],
        hint: 'Simulate IAM evaluation to locate the missing permission or KMS decrypt boundary.',
        output: `EvaluationResults:
  Action: secretsmanager:GetSecretValue
  Resource: arn:aws:secretsmanager:us-east-1:482910384712:secret:prod/billing/db-*
  Decision: implicitDeny
  MissingPolicy: kms:Decrypt on arn:aws:kms:us-east-1:482910384712:key/mrk-9a81f`,
        insight: 'Classic cloud gotcha: the role had Secrets Manager read access, but lacked kms:Decrypt on the customer-managed KMS key!',
      },
      {
        id: 's3',
        command: 'terraform apply -target=aws_iam_role_policy.billing_kms_decrypt -auto-approve',
        aliases: ['terraform apply', 'tf apply'],
        hint: 'Apply the IaC least-privilege KMS decrypt permission scoped strictly to the billing key.',
        output: `aws_iam_role_policy.billing_kms_decrypt: Creating...
aws_iam_role_policy.billing_kms_decrypt: Creation complete after 2s
Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
[Verify] billing-worker-7c4d9: Ready 1/1 — DB pool connected via dynamic secret lease.`,
        insight: 'Fixed declaratively through Terraform instead of manual AWS Console ClickOps, preserving zero-drift compliance.',
        resolvesOutage: true,
      },
    ],
  },
  {
    id: 'terraform-drift',
    title: 'Incident 03: Unauthorized Manual Firewall Edit (Terraform & GitOps Drift)',
    environment: 'GCP GKE + Cloud Armor (europe-west1)',
    severity: 'SEV-2',
    symptom: 'Security scanner alerts that port 22 (SSH) was opened to 0.0.0.0/0 on the production VPC firewall.',
    objective: 'Detect the out-of-band console change with terraform plan and reconcile production back to Git truth.',
    steps: [
      {
        id: 's1',
        command: 'gcloud compute firewall-rules list --filter="name~prod"',
        aliases: ['gcloud compute firewall-rules list', 'gcloud firewall'],
        hint: 'Query live GCP firewall rules to confirm the unauthorized rule.',
        output: `NAME                    NETWORK   DIRECTION  ALLOW       SOURCE_RANGES
prod-allow-https-lb     prod-vpc  INGRESS    tcp:443     130.211.0.0/22,35.191.0.0/16
prod-temp-ssh-debug     prod-vpc  INGRESS    tcp:22      0.0.0.0/0   <-- DRIFT`,
        insight: 'Someone created prod-temp-ssh-debug manually via the web console during debugging and left SSH open to the internet.',
      },
      {
        id: 's2',
        command: 'terraform plan -refresh-only',
        aliases: ['terraform plan', 'tf plan'],
        hint: 'Compare live GCP infrastructure state against the version-controlled Terraform state.',
        output: `Note: Objects have changed outside of Terraform

  # google_compute_firewall.prod_ssh_guard has changed
  ~ source_ranges = [
      - "35.235.240.0/20" # IAP Zero-Trust Tunnel Only
      + "0.0.0.0/0"       # Public Internet (Unauthorized)
    ]

Plan: 0 to add, 1 to change, 0 to destroy.`,
        insight: 'Terraform pinpoints the exact attribute drift (IAP range overwritten with 0.0.0.0/0) while locking remote state.',
      },
      {
        id: 's3',
        command: 'terraform apply -auto-approve',
        aliases: ['terraform apply', 'tf apply'],
        hint: 'Enforce the Git source of truth and close public SSH immediately.',
        output: `google_compute_firewall.prod_ssh_guard: Modifying...
google_compute_firewall.prod_ssh_guard: Modifications complete after 3s
Apply complete! Resources: 0 added, 1 changed, 0 destroyed.
[Audit] Public SSH 0.0.0.0/0 closed. IAP Zero-Trust tunnel restored.`,
        insight: 'Infrastructure is back in sync with Git; enable Cloud Audit Log alerts + GCP Org Policy to prevent future console edits.',
        resolvesOutage: true,
      },
    ],
  },
  {
    id: 'canary-abort',
    title: 'Incident 04: Broken Canary v3.2 Spiking 5xx Errors',
    environment: 'On-Premise RKE2 + Argo Rollouts',
    severity: 'SEV-1',
    symptom: '5% Canary traffic on orders-service shows 9.2% HTTP 500 error rate; p99 latency jumped from 48ms to 890ms.',
    objective: 'Inspect the live Argo Rollout status, verify Prometheus error metrics, and abort the canary cleanly.',
    steps: [
      {
        id: 's1',
        command: 'kubectl argo rollouts get rollout orders-service -n prod',
        aliases: ['argo rollouts get', 'get rollout'],
        hint: 'Inspect current Canary weight, ReplicaSets, and AnalysisRun state.',
        output: `Name:            orders-service
Strategy:        Canary (Step: 2/7 — SetWeight: 5%)
Status:          Degraded (AnalysisRun Failed: http-5xx-error-rate = 9.2% > 1.0%)
Replicas:
  Stable (v3.1): 19/19 Ready  (95% traffic, 0.03% 5xx)
  Canary (v3.2):  1/1  Ready  ( 5% traffic, 9.20% 5xx)`,
        insight: 'Canary limited blast radius to just 5% of orders while 95% stayed completely healthy on v3.1.',
      },
      {
        id: 's2',
        command: 'kubectl argo rollouts abort orders-service -n prod',
        aliases: ['argo rollouts abort', 'abort rollout'],
        hint: 'Abort the degraded Canary immediately to shift 100% traffic back to Stable v3.1.',
        output: `rollout 'orders-service' aborted
[Ingress] Updated backend weights: orders-v3.1 = 100%, orders-v3.2 = 0%
[ScaleDown] Terminating Canary ReplicaSet orders-service-v3.2 (1 -> 0)
[SLO Guard] Global 5xx error rate recovered to 0.03% in 3.2s.`,
        insight: 'Aborting a Canary updates the L7 Ingress/Envoy weights instantaneously without waiting for new pods to boot.',
        resolvesOutage: true,
      },
    ],
  },
];
