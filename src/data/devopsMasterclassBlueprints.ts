import type { DevOpsDfdGraph } from './devopsCloudCurriculumData';

export interface FivePartMasterclassSpec {
  id: string;
  section: 'section-2' | 'section-3' | 'section-4';
  code: string;
  title: string;
  subtitle: string;
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
    configSnippet: string;
  };
  cloudVsInHouse: {
    aws: string;
    gcp: string;
    azure: string;
    inHouse: string;
  };
  dfd: DevOpsDfdGraph;
  simulatorStoryboard: {
    controls: string[];
    stateTransitions: string[];
    failureInjections: string[];
    visualAnimations: string;
  };
}

export interface SimulatorEngineBlueprint {
  id: string;
  code: string;
  title: string;
  purpose: string;
  uiControls: string[];
  states: string[];
  events: string[];
  failureInjections: string[];
  stateMachinePseudocode: string;
}

/* ========================================================================== */
/* SECTION 2: ENVIRONMENT PROGRESSION STRATEGY (5-PART SPECIFICATION)         */
/* ========================================================================== */
export const SECTION2_ENV_FIVE_PART: FivePartMasterclassSpec[] = [
  {
    id: 'env-local-preview',
    section: 'section-2',
    code: '2.1',
    title: 'Local Workstation & Ephemeral PR Preview',
    subtitle: 'Disposable per-Pull-Request sandboxes that spin up on PR open and self-destruct on merge.',
    plainEnglish: {
      whatItIs:
        'An isolated mini-copy of your application created automatically for every Pull Request so reviewers can click and test changes live before merging.',
      problemSolved:
        'Eliminates "works on my laptop" surprises and removes bottlenecks where ten engineers fight over a single shared DEV server.',
      whatBreaksIfSkipped:
        'Broken UI layouts, invalid container environment variables, and API regressions merge into trunk undetected and block every other developer.',
    },
    actionMechanics: {
      inputs: ['Pull Request branch SHA', 'Ephemeral Helm/Kustomize values', 'Synthetic seed data fixtures'],
      automatedTriggers: ['PR Opened / Synchronized -> Create namespace pr-<id> + wildcard TLS ingress', 'PR Closed / Merged -> Prune namespace & DNS record'],
      outputs: ['Live HTTPS preview URL (pr-412.preview.internal)', 'Automated PR comment with preview link & Terraform plan diff'],
      configTitle: 'argocd-pr-preview-appset.yaml',
      configSnippet: `apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: pr-ephemeral-previews
spec:
  generators:
    - pullRequest:
        github: { owner: acme, repo: checkout-api }
        requeueAfterSeconds: 60
  template:
    metadata:
      name: "checkout-pr-{{number}}"
    spec:
      destination:
        namespace: "preview-pr-{{number}}"
      syncPolicy:
        automated: { prune: true, selfHeal: true }`,
    },
    cloudVsInHouse: {
      aws: 'AWS Amplify Hosting Previews or EKS + ArgoCD ApplicationSet on EC2 Spot / Fargate Spot.',
      gcp: 'Cloud Run revision tagged URLs (pr-412---api.a.run.app) scaling to zero when idle.',
      azure: 'Azure Static Web Apps preview environments or AKS Virtual Nodes with scale-to-zero KEDA.',
      inHouse: 'Self-hosted GitLab Review Apps + local k3s/RKE2 cluster with wildcard Traefik DNS and automatic TTL namespace reaper.',
    },
    dfd: {
      id: 'dfd-env-preview',
      title: 'Ephemeral PR Preview Lifecycle Flow',
      subtitle: 'PR Event -> Ephemeral Namespace -> Synthetic Seed -> Auto-Destroy on Merge',
      level: 'Section 2.1',
      nodes: [
        { id: 'pr', label: 'Pull Request', sublabel: 'PR #412 Open', x: 80, y: 120, zone: 'dev' },
        { id: 'ci', label: 'CI Builder', sublabel: 'Tag pr-412', x: 260, y: 120, zone: 'ci' },
        { id: 'appset', label: 'ApplicationSet', sublabel: 'Create Namespace', x: 450, y: 120, zone: 'cloud' },
        { id: 'ns', label: 'preview-pr-412', sublabel: 'Seeded Fixtures', x: 645, y: 120, zone: 'cloud' },
        { id: 'reap', label: 'Auto-Prune', sublabel: 'Destroy on Close', x: 810, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'pr', to: 'ci', label: 'Webhook', protocol: 'HTTPS' },
        { id: 'e2', from: 'ci', to: 'appset', label: 'Push Image', protocol: 'OCI' },
        { id: 'e3', from: 'appset', to: 'ns', label: 'Provision', protocol: 'K8s API' },
        { id: 'e4', from: 'ns', to: 'reap', label: 'PR Merged', protocol: 'GC Prune' },
      ],
      steps: [
        {
          id: 's1',
          title: 'PR Opens & Builds Candidate Image',
          activeNodeIds: ['pr', 'ci'],
          activeEdgeIds: ['e1'],
          detail: 'Opening a PR triggers an isolated build tagged strictly for preview without touching shared branches.',
          latencyLabel: '45s build',
        },
        {
          id: 's2',
          title: 'Provision Ephemeral Namespace & Ingress',
          activeNodeIds: ['ci', 'appset', 'ns'],
          activeEdgeIds: ['e2', 'e3'],
          detail: 'ArgoCD ApplicationSet creates preview-pr-412 with synthetic database fixtures and zero customer PII.',
          latencyLabel: '18s boot',
        },
        {
          id: 's3',
          title: 'Automatic Teardown on Merge/Close',
          activeNodeIds: ['ns', 'reap'],
          activeEdgeIds: ['e4'],
          detail: 'Once merged, prune=true garbage-collects pods, PVCs, and DNS records so cloud costs return to $0.',
          latencyLabel: '$0 idle',
        },
      ],
      mermaidCode: `flowchart LR
  PR[Pull Request #412] -->|Webhook| CI[Build Candidate OCI Image]
  CI --> APPSET[ArgoCD PR ApplicationSet]
  APPSET -->|Create Namespace + TLS URL| NS[preview-pr-412 + Synthetic Seed]
  NS -->|PR Merged or Closed| REAP[Auto-Prune Namespace & Reclaim Cost]`,
    },
    simulatorStoryboard: {
      controls: ['Open PR #412 button', 'Merge & Reap button', 'Toggle Scale-to-Zero Idle'],
      stateTransitions: ['IDLE -> PROVISIONING -> PREVIEW_LIVE -> PRUNING -> DESTROYED'],
      failureInjections: ['Orphaned namespace leak when prune=false causes non-prod bill spike'],
      visualAnimations: 'Ephemeral namespace box expands with live HTTPS URL, then dissolves cleanly back to zero pods on merge.',
    },
  },
  {
    id: 'env-dev-qa-staging-prod',
    section: 'section-2',
    code: '2.2',
    title: 'DEV -> QA/UAT -> STAGING -> PROD Immutable Promotion',
    subtitle: 'Build once, pin the SHA-256 digest, and promote strictly through automated security, contract, and load gates.',
    plainEnglish: {
      whatItIs:
        'A conveyor belt of progressively stricter environments where the exact same verified binary advances from integration testing to production without ever being recompiled.',
      problemSolved:
        'Prevents environment drift where code works in DEV but crashes in PROD due to rebuilt dependencies or missing staging load tests.',
      whatBreaksIfSkipped:
        'Rebuilding images per environment introduces untested upstream package updates right before production, causing unpredictable runtime outages.',
    },
    actionMechanics: {
      inputs: ['Immutable signed image digest (sha256:...)', 'Per-environment Kustomize overlay', 'Externalized runtime secrets'],
      automatedTriggers: ['DEV pass -> Promote digest to QA/UAT', 'E2E + DAST pass -> Open GitOps PR to STAGING', 'Load + Chaos pass -> Progressive Canary in PROD'],
      outputs: ['Auditable Git commit history per environment promotion', 'Guaranteed byte-for-byte parity between STAGING and PROD'],
      configTitle: 'kustomize-promotion-structure.yaml',
      configSnippet: `# GitOps Repository Layout (Build Once, Promote Digest)
clusters/
  dev/kustomization.yaml       # images: [{ name: api, digest: sha256:9f82a1... }]
  qa/kustomization.yaml        # Promoted after Pact + Trivy pass
  staging/kustomization.yaml   # Promoted after Playwright E2E + OWASP ZAP
  prod/kustomization.yaml      # Promoted after k6 2x Peak Load + Approval`,
    },
    cloudVsInHouse: {
      aws: 'AWS CodePipeline multi-stage promotion across separate AWS Accounts (Dev/Staging/Prod OU) via KMS cross-account ECR.',
      gcp: 'Google Cloud Deploy declarative DeliveryPipeline advancing identical releases across GKE/Cloud Run targets.',
      azure: 'Azure Pipelines Environments with branch control checks, exclusive locks, and multi-stage approval gates.',
      inHouse: 'ArgoCD + Kargo / GitLab CI promoting exact SHA-256 digests across isolated Harbor projects and cluster namespaces.',
    },
    dfd: {
      id: 'dfd-env-promotion',
      title: 'Immutable Artifact Environment Promotion Flow',
      subtitle: 'Single Signed Digest advancing across DEV -> QA -> STAGING -> PROD',
      level: 'Section 2.2',
      nodes: [
        { id: 'reg', label: 'Signed Digest', sublabel: 'Build Once SHA', x: 75, y: 120, zone: 'sec' },
        { id: 'dev', label: 'DEV', sublabel: 'Contract + CVE', x: 250, y: 120, zone: 'ci' },
        { id: 'qa', label: 'QA / UAT', sublabel: 'E2E + DAST', x: 430, y: 120, zone: 'sec' },
        { id: 'stg', label: 'STAGING', sublabel: '2x Load + Chaos', x: 615, y: 120, zone: 'ops' },
        { id: 'prod', label: 'PRODUCTION', sublabel: 'Canary + SLOs', x: 795, y: 120, zone: 'cloud' },
      ],
      edges: [
        { id: 'e1', from: 'reg', to: 'dev', label: 'Auto Sync', protocol: 'GitOps' },
        { id: 'e2', from: 'dev', to: 'qa', label: 'Tests Green', protocol: 'Promote SHA' },
        { id: 'e3', from: 'qa', to: 'stg', label: 'E2E + ZAP Pass', protocol: 'GitOps PR' },
        { id: 'e4', from: 'stg', to: 'prod', label: 'Load SLO OK', protocol: 'Signed Gate' },
      ],
      steps: [
        {
          id: 's1',
          title: 'DEV Continuous Contract & Security Gate',
          activeNodeIds: ['reg', 'dev'],
          activeEdgeIds: ['e1'],
          detail: 'Signed image deploys automatically to DEV; contract tests and Trivy CVE checks validate cross-service compatibility.',
          latencyLabel: 'Auto 2m',
        },
        {
          id: 's2',
          title: 'QA/UAT Anonymized E2E & DAST Probing',
          activeNodeIds: ['dev', 'qa'],
          activeEdgeIds: ['e2'],
          detail: 'Exact same SHA promotes to QA where Playwright user journeys and OWASP ZAP run against anonymized datasets.',
          latencyLabel: 'Auto 6m',
        },
        {
          id: 's3',
          title: 'STAGING Production-Parity Load & Chaos Drill',
          activeNodeIds: ['qa', 'stg'],
          activeEdgeIds: ['e3'],
          detail: 'k6 load tests verify p99 latency under 2x traffic and validate expand-contract DB migrations on prod-sized tables.',
          latencyLabel: '12m Load Gate',
        },
        {
          id: 's4',
          title: 'PROD Progressive Canary Promotion',
          activeNodeIds: ['stg', 'prod'],
          activeEdgeIds: ['e4'],
          detail: 'Production pulls the already-proven immutable digest and rolls it out incrementally with SLO rollback protection.',
          latencyLabel: 'Zero Rebuild',
        },
      ],
      mermaidCode: `flowchart LR
  SHA[(Immutable sha256 Digest)] --> DEV[DEV: Contract + Trivy]
  DEV -->|Auto Promote| QA[QA/UAT: E2E + OWASP ZAP]
  QA -->|GitOps PR| STG[STAGING: 2x Load + Chaos Parity]
  STG -->|Cosign + SLO Gate| PROD[PROD: Canary Progressive Rollout]`,
    },
    simulatorStoryboard: {
      controls: ['Promote Digest Step Button', 'Toggle Staging Load Regression', 'Inspect Env Secrets Isolation'],
      stateTransitions: ['BUILT -> IN_DEV -> IN_QA -> IN_STAGING -> PROD_CANARY -> PROD_LIVE'],
      failureInjections: ['Staging p99 latency spikes to 650ms during 2x load test, locking Production promotion'],
      visualAnimations: 'A single sealed SHA-256 badge travels across all 4 gates without mutating; failing gates turn amber/red and hold downstream locks.',
    },
  },
];

/* ========================================================================== */
/* SECTION 3: DEPLOYMENT & ROLLOUT TECHNIQUES (5-PART SPECIFICATION)          */
/* ========================================================================== */
export const SECTION3_ROLLOUT_FIVE_PART: FivePartMasterclassSpec[] = [
  {
    id: 'recreate',
    section: 'section-3',
    code: '3.1',
    title: 'Recreate Deployment Strategy',
    subtitle: 'Full teardown of v1 instances followed by clean boot of v2 instances (deliberate maintenance window).',
    plainEnglish: {
      whatItIs:
        'Stopping every running copy of the old version completely, waiting until zero traffic is served, and then starting the new version.',
      problemSolved:
        'Guarantees that v1 and v2 never run side-by-side when legacy software holds exclusive locks on files, hardware, or breaking DB schemas.',
      whatBreaksIfSkipped:
        'Running two incompatible versions of a non-backward-compatible monolith concurrently corrupts shared state or crashes with lock contention.',
    },
    actionMechanics: {
      inputs: ['Target container digest v2', 'Scheduled maintenance banner window'],
      automatedTriggers: ['Controller scales v1 ReplicaSet to 0 -> Waits for graceful SIGTERM drain -> Scales v2 ReplicaSet to N'],
      outputs: ['100% clean v2 state after brief downtime window', 'Zero transient extra compute cost'],
      configTitle: 'deployment-recreate.yaml',
      configSnippet: `apiVersion: apps/v1
kind: Deployment
metadata: { name: nightly-ledger-worker }
spec:
  replicas: 3
  strategy:
    type: Recreate # Terminates all v1 pods completely before booting v2`,
    },
    cloudVsInHouse: {
      aws: 'ECS Deployment minimumHealthyPercent=0 or EC2 Auto Scaling instance replacement.',
      gcp: 'GKE Deployment strategy.type=Recreate or Compute Engine Managed Instance Group recreate.',
      azure: 'AKS Recreate Deployment or VM Scale Set manual stop-and-start upgrade.',
      inHouse: 'systemd stop && deploy && start via Ansible, Docker Compose down/up, or kubeadm Recreate strategy.',
    },
    dfd: {
      id: 'dfd-rollout-recreate',
      title: 'Recreate Teardown & Cold-Boot Flow',
      subtitle: 'Drain v1 -> Maintenance Downtime -> Boot v2 -> Resume Traffic',
      level: 'Section 3.1',
      nodes: [
        { id: 'lb', label: 'Load Balancer', sublabel: '503 Maint Window', x: 80, y: 120, zone: 'cloud' },
        { id: 'ctrl', label: 'Orchestrator', sublabel: 'Scale v1 -> 0', x: 270, y: 120, zone: 'ci' },
        { id: 'v1', label: 'Old Stack v1', sublabel: 'SIGTERM Drain', x: 470, y: 60, zone: 'sec' },
        { id: 'v2', label: 'New Stack v2', sublabel: 'Cold Boot', x: 470, y: 185, zone: 'cloud' },
        { id: 'db', label: 'Exclusive DB', sublabel: 'Schema Migration', x: 760, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'ctrl', to: 'v1', label: 'Terminate All', protocol: 'SIGTERM' },
        { id: 'e2', from: 'ctrl', to: 'db', label: 'Breaking DDL', protocol: 'SQL Lock' },
        { id: 'e3', from: 'ctrl', to: 'v2', label: 'Start v2', protocol: 'Cold Boot' },
        { id: 'e4', from: 'lb', to: 'v2', label: 'Resume 100%', protocol: 'HTTP Ready' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Graceful Shutdown of All v1 Pods',
          activeNodeIds: ['ctrl', 'v1', 'lb'],
          activeEdgeIds: ['e1'],
          detail: 'All v1 pods terminate to zero; external load balancer serves a maintenance page during the brief window.',
          latencyLabel: 'Downtime Start',
        },
        {
          id: 's2',
          title: 'Exclusive Schema Migration',
          activeNodeIds: ['ctrl', 'db'],
          activeEdgeIds: ['e2'],
          detail: 'With zero live writers, breaking database DDL runs cleanly without version mismatch errors.',
          latencyLabel: 'Exclusive Lock',
        },
        {
          id: 's3',
          title: 'Boot v2 & Reopen Load Balancer',
          activeNodeIds: ['ctrl', 'v2', 'lb'],
          activeEdgeIds: ['e3', 'e4'],
          detail: 'Once v2 readiness probes pass, the Load Balancer resumes routing 100% traffic to the new release.',
          latencyLabel: '15s - 5m MTTR',
        },
      ],
      mermaidCode: `flowchart LR
  CTRL[Orchestrator] -->|1. Scale to 0| V1[Old v1 Pods Terminated]
  CTRL -->|2. Exclusive DDL Window| DB[(Database)]
  CTRL -->|3. Boot Clean Fleet| V2[New v2 Pods Ready]
  LB[Load Balancer] -->|4. Resume 100% Traffic| V2`,
    },
    simulatorStoryboard: {
      controls: ['Trigger Recreate Deploy button', 'Adjust Boot Latency Slider'],
      stateTransitions: ['V1_SERVING -> DRAINING_V1 -> DOWNTIME_MAINT -> BOOTING_V2 -> V2_SERVING'],
      failureInjections: ['v2 crash during cold boot extends customer downtime until manual v1 redeploy'],
      visualAnimations: 'All v1 bars empty to 0%, red maintenance banner flashes, then v2 pods illuminate and reconnect.',
    },
  },
  {
    id: 'rolling',
    section: 'section-3',
    code: '3.2',
    title: 'Ramped / Rolling Update (maxSurge & Probes)',
    subtitle: 'Gradual pod-by-pod replacement gated by HTTP readiness probes and zero-unavailable quotas.',
    plainEnglish: {
      whatItIs:
        'Swapping out old servers one batch at a time—booting a new healthy v2 pod before retiring an old v1 pod—so customers never experience downtime.',
      problemSolved:
        'Delivers zero-downtime upgrades without paying 2x infrastructure cost for a full duplicate environment.',
      whatBreaksIfSkipped:
        'Omitting readiness probes or preStop drain hooks causes the Load Balancer to send requests to booting or dying pods, spiking HTTP 502 errors.',
    },
    actionMechanics: {
      inputs: ['maxSurge: 25%', 'maxUnavailable: 0', 'readinessProbe (/healthz/ready) + preStop sleep 5s'],
      automatedTriggers: ['Boot N surge v2 pods -> Wait for readinessProbe=200 -> Remove N v1 pods from Service endpoints -> Repeat until 100% v2'],
      outputs: ['Zero dropped in-flight requests', 'Automatic pause if new pods fail readiness checks'],
      configTitle: 'k8s-rolling-update-probes.yaml',
      configSnippet: `spec:
  replicas: 8
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 25%, maxUnavailable: 0 }
  template:
    spec:
      containers:
        - name: api
          lifecycle:
            preStop: { exec: { command: ["sh", "-c", "sleep 5"] } }
          readinessProbe:
            httpGet: { path: /healthz/ready, port: 8080 }`,
    },
    cloudVsInHouse: {
      aws: 'EKS RollingUpdate, ECS Rolling Update (min 100% / max 200%), or EC2 Auto Scaling Instance Refresh.',
      gcp: 'GKE RollingUpdate Deployment or Managed Instance Group Rolling Update with maxSurge.',
      azure: 'AKS RollingUpdate Deployment or VMSS Rolling Upgrade Policy with Application Health Extension.',
      inHouse: 'Kubernetes kubeadm/RKE2 RollingUpdate or Ansible serial: 25% batch rolling updates behind HAProxy health checks.',
    },
    dfd: {
      id: 'dfd-rollout-rolling',
      title: 'Ramped Rolling Update Wave Flow',
      subtitle: 'Surge v2 -> Readiness Probe Pass -> Drain v1 -> Repeat Wave',
      level: 'Section 3.2',
      nodes: [
        { id: 'lb', label: 'Service / LB', sublabel: 'Ready Endpoints', x: 80, y: 120, zone: 'cloud' },
        { id: 'v1', label: 'v1 Pods (6->0)', sublabel: 'preStop Drain', x: 310, y: 60, zone: 'ops' },
        { id: 'v2', label: 'v2 Surge (+2)', sublabel: 'Booting Wave', x: 310, y: 185, zone: 'cloud' },
        { id: 'probe', label: 'Readiness Probe', sublabel: 'GET /healthz', x: 560, y: 185, zone: 'sec' },
        { id: 'db', label: 'Shared DB', sublabel: 'Expand-Contract', x: 785, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'lb', to: 'v1', label: 'Active v1', protocol: 'HTTP/2' },
        { id: 'e2', from: 'v2', to: 'probe', label: 'Health Check', protocol: '200 OK' },
        { id: 'e3', from: 'lb', to: 'v2', label: 'Add Endpoint', protocol: 'Ready' },
        { id: 'e4', from: 'v1', to: 'db', label: 'Compatible R/W', protocol: 'SQL' },
        { id: 'e5', from: 'v2', to: 'db', label: 'Compatible R/W', protocol: 'SQL' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Surge Batch of v2 Pods Boots',
          activeNodeIds: ['v2', 'probe'],
          activeEdgeIds: ['e2'],
          detail: 'Kubernetes creates 2 surge v2 pods (25% of 8) while keeping all 8 v1 pods serving 100% live traffic.',
          latencyLabel: 'maxSurge 25%',
        },
        {
          id: 's2',
          title: 'Readiness Probe Adds v2 & Drains v1',
          activeNodeIds: ['lb', 'v2', 'v1'],
          activeEdgeIds: ['e3', 'e1'],
          detail: 'Once /healthz/ready returns 200 OK, Service endpoints register v2 and gracefully deregister 2 v1 pods via preStop sleep.',
          latencyLabel: '0 Dropped Req',
        },
        {
          id: 's3',
          title: 'Dual-Version DB Expand-Contract Compatibility',
          activeNodeIds: ['v1', 'v2', 'db'],
          activeEdgeIds: ['e4', 'e5'],
          detail: 'Both v1 and v2 execute queries concurrently against the shared database until the final wave finishes.',
          latencyLabel: 'Zero Downtime',
        },
      ],
      mermaidCode: `flowchart LR
  LB[Load Balancer / K8s Service] -->|Drain Gradually| V1[v1 Pods]
  V2[v2 Surge Pods] -->|HTTP 200 OK| PROBE{Readiness Probe}
  PROBE -->|Register Ready| LB
  V1 --> DB[(Shared Expand-Contract DB)]
  V2 --> DB`,
    },
    simulatorStoryboard: {
      controls: ['maxSurge Slider', 'Toggle Readiness Probe Failure'],
      stateTransitions: ['WAVE_1 (6v1/2v2) -> WAVE_2 (4v1/4v2) -> WAVE_3 (2v1/6v2) -> COMPLETE (8v2)'],
      failureInjections: ['Broken /healthz/ready stalls rollout automatically at Wave 1, keeping 100% v1 capacity online'],
      visualAnimations: 'Pod slots transition green wave-by-wave as health check ticks pass.',
    },
  },
  {
    id: 'blue-green',
    section: 'section-3',
    code: '3.3',
    title: 'Blue-Green Atomic Cutover',
    subtitle: 'Full parallel Green (v2) stack smoke-tested in isolation before an instant 1-second Load Balancer flip.',
    plainEnglish: {
      whatItIs:
        'Maintaining two full-size production stacks—Blue (live) and Green (new)—verifying Green privately, then flipping the router switch instantly.',
      problemSolved:
        'Eliminates mixed v1/v2 API responses during rollout and provides the fastest possible rollback (flip switch back to warm Blue in < 2 seconds).',
      whatBreaksIfSkipped:
        'Running destructive DB column drops before Blue is decommissioned makes instant rollback crash Blue with missing-column SQL errors.',
    },
    actionMechanics: {
      inputs: ['Full-capacity Green ReplicaSet', 'Private previewService smoke-test suite', 'scaleDownDelaySeconds: 600'],
      automatedTriggers: ['Deploy Green behind preview endpoint -> Run synthetic smoke tests -> Flip activeService selector Blue -> Green'],
      outputs: ['Instant atomic cutover', 'Warm Blue standby retained 10 minutes for 1-click instant rollback'],
      configTitle: 'argo-rollouts-bluegreen.yaml',
      configSnippet: `spec:
  strategy:
    blueGreen:
      activeService: payments-live
      previewService: payments-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 600 # Keep Blue warm 10m for instant flip-back`,
    },
    cloudVsInHouse: {
      aws: 'AWS CodeDeploy Blue/Green on ECS/ALB Target Groups or Route 53 weighted alias flip.',
      gcp: 'GKE Argo Rollouts Blue-Green or Cloud Run revision traffic switch (0% -> 100% instant).',
      azure: 'Azure App Service Deployment Slots (Staging -> Production VIP swap) or AKS Argo Rollouts.',
      inHouse: 'HAProxy backend switch (use_backend green_pool) or NGINX/Traefik Ingress service swap on bare-metal RKE2.',
    },
    dfd: {
      id: 'dfd-rollout-bluegreen',
      title: 'Blue-Green Atomic Load Balancer Cutover',
      subtitle: 'Verify Green Preview -> Atomic LB Flip -> Keep Blue Warm for Rollback',
      level: 'Section 3.3',
      nodes: [
        { id: 'lb', label: 'L7 Router / ALB', sublabel: 'Atomic Switch', x: 85, y: 120, zone: 'cloud' },
        { id: 'blue', label: 'Blue Stack (v1)', sublabel: 'Warm Standby', x: 360, y: 55, zone: 'dev' },
        { id: 'green', label: 'Green Stack (v2)', sublabel: '100% Live Target', x: 360, y: 190, zone: 'cloud' },
        { id: 'smoke', label: 'Preview Smoke', sublabel: 'Pre-Cutover QA', x: 600, y: 190, zone: 'sec' },
        { id: 'db', label: 'Expand-Contract', sublabel: 'Backward Safe DB', x: 785, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'smoke', to: 'green', label: 'Verify Preview', protocol: 'Synthetic' },
        { id: 'e2', from: 'lb', to: 'green', label: 'Flip 100% Live', protocol: 'Atomic LB' },
        { id: 'e3', from: 'lb', to: 'blue', label: 'Rollback Path', protocol: '< 2s Flip' },
        { id: 'e4', from: 'green', to: 'db', label: 'Dual-Safe SQL', protocol: 'TLS' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Private Smoke Verification on Green Preview',
          activeNodeIds: ['smoke', 'green'],
          activeEdgeIds: ['e1'],
          detail: 'QA scripts hit the internal preview URL while 100% of live customers remain safely on Blue.',
          latencyLabel: 'Zero User Impact',
        },
        {
          id: 's2',
          title: 'Atomic Load Balancer Switch to Green',
          activeNodeIds: ['lb', 'green', 'db'],
          activeEdgeIds: ['e2', 'e4'],
          detail: 'Target Group / Service selector updates atomically, routing 100% traffic cleanly to Green.',
          latencyLabel: '< 2s Cutover',
        },
        {
          id: 's3',
          title: 'Instant Warm Standby Rollback Safety Net',
          activeNodeIds: ['lb', 'blue'],
          activeEdgeIds: ['e3'],
          detail: 'If Green exhibits production errors, flipping the router back to warm Blue restores service in under 2 seconds.',
          latencyLabel: '< 2s Rollback',
        },
      ],
      mermaidCode: `flowchart LR
  SMOKE[Synthetic Smoke Suite] -->|Pre-Cutover Pass| GREEN[Green Stack v2]
  LB[ALB / Cloud LB / HAProxy] -.->|Warm Rollback < 2s| BLUE[Blue Stack v1]
  LB -->|Atomic 100% Switch| GREEN
  GREEN --> DB[(Backward-Compatible DB)]
  BLUE --> DB`,
    },
    simulatorStoryboard: {
      controls: ['Flip Live Target (Blue <-> Green)', 'Inject Post-Cutover Error'],
      stateTransitions: ['BLUE_LIVE -> GREEN_PREVIEW_TEST -> GREEN_LIVE -> INSTANT_ROLLBACK_BLUE'],
      failureInjections: ['Inject 500 error spike right after cutover triggers automatic 1.4s flip back to warm Blue'],
      visualAnimations: 'Single traffic pipe snaps cleanly from Blue track to Green track (and snaps back instantly on rollback).',
    },
  },
  {
    id: 'canary',
    section: 'section-3',
    code: '3.4',
    title: 'Canary Release & Automated Canary Analysis (ACA)',
    subtitle: 'Progressive 1% -> 5% -> 25% -> 50% -> 100% traffic ramp guarded by continuous Prometheus/CloudWatch SLO checks.',
    plainEnglish: {
      whatItIs:
        'Exposing a new release to only 1% of live users first, measuring error rates and latency automatically, and halting instantly if anything looks abnormal.',
      problemSolved:
        'Caps the blast radius of unknown production edge-cases to a tiny fraction of traffic while keeping infrastructure overhead near 1.05x.',
      whatBreaksIfSkipped:
        'A subtle bug missed by staging tests hits 100% of paying customers simultaneously instead of just 1%.',
    },
    actionMechanics: {
      inputs: ['Weighted L7 traffic router (ALB / Envoy / Istio)', 'Prometheus / CloudWatch SLO queries', 'Step pause schedule'],
      automatedTriggers: ['Route 1% -> Evaluate 5xx & p99 -> Advance 5% -> 25% -> 50% -> 100% OR Abort to 0% on SLO breach'],
      outputs: ['Statistically validated production rollout', 'Zero-human autonomous rollback on regression'],
      configTitle: 'argo-canary-steps.yaml',
      configSnippet: `spec:
  strategy:
    canary:
      steps:
        - setWeight: 1
        - pause: { duration: 2m }
        - setWeight: 5
        - analysis: { templates: [{ templateName: slo-guard }] }
        - setWeight: 25
        - setWeight: 50`,
    },
    cloudVsInHouse: {
      aws: 'AWS CodeDeploy Canary (Canary10Percent5Minutes), ALB weighted target groups, or EKS + Argo Rollouts.',
      gcp: 'Cloud Deploy Canary verification on GKE / Cloud Run traffic splitting (--to-revisions=v2=5,v1=95).',
      azure: 'AKS + Flagger / Argo Rollouts or Azure Container Apps revision traffic weights.',
      inHouse: 'Argo Rollouts or Flagger controlling NGINX / Envoy / Cilium Gateway API weights backed by Prometheus PromQL.',
    },
    dfd: {
      id: 'dfd-rollout-canary',
      title: 'Progressive Canary & Automated Analysis Loop',
      subtitle: 'Weighted Ingress -> Compare v1 vs v2 Golden Signals -> Promote or Auto-Abort',
      level: 'Section 3.4',
      nodes: [
        { id: 'lb', label: 'Weighted Ingress', sublabel: '95% v1 / 5% v2', x: 80, y: 120, zone: 'cloud' },
        { id: 'v1', label: 'Stable v1', sublabel: 'Baseline Metrics', x: 320, y: 55, zone: 'cloud' },
        { id: 'v2', label: 'Canary v2', sublabel: '5% Slice', x: 320, y: 185, zone: 'sec' },
        { id: 'prom', label: 'SLO Analyzer', sublabel: 'PromQL / CW', x: 565, y: 120, zone: 'ops' },
        { id: 'argo', label: 'Rollout Engine', sublabel: 'Promote / Abort', x: 785, y: 120, zone: 'sec' },
      ],
      edges: [
        { id: 'e1', from: 'lb', to: 'v1', label: '95% Safe', protocol: 'HTTP/2' },
        { id: 'e2', from: 'lb', to: 'v2', label: '5% Canary', protocol: 'HTTP/2' },
        { id: 'e3', from: 'v2', to: 'prom', label: '5xx & p99', protocol: 'OTLP' },
        { id: 'e4', from: 'prom', to: 'argo', label: 'Pass/Fail', protocol: 'ACA Eval' },
        { id: 'e5', from: 'argo', to: 'lb', label: 'Adjust Weight', protocol: 'API' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Route Small 5% Slice to Canary',
          activeNodeIds: ['lb', 'v1', 'v2'],
          activeEdgeIds: ['e1', 'e2'],
          detail: '95% of users remain untouched on v1 while 5% exercise the new v2 code path with real production inputs.',
          latencyLabel: '5% Blast Cap',
        },
        {
          id: 's2',
          title: 'Automated Canary Analysis Evaluates SLOs',
          activeNodeIds: ['v2', 'prom', 'argo'],
          activeEdgeIds: ['e3', 'e4'],
          detail: 'Controller compares Canary 5xx error rate and p99 latency against strict error-budget rules.',
          latencyLabel: '30s Interval',
        },
        {
          id: 's3',
          title: 'Promote Next Step or Auto-Abort to 0%',
          activeNodeIds: ['argo', 'lb'],
          activeEdgeIds: ['e5'],
          detail: 'Healthy telemetry steps weight up to 25% -> 50% -> 100%; any breach snaps weight back to 0% autonomously.',
          latencyLabel: '< 4s Abort',
        },
      ],
      mermaidCode: `flowchart LR
  LB[Weighted Ingress / ALB] -->|95%| V1[Stable v1]
  LB -->|5%| V2[Canary v2]
  V2 -->|Metrics| PROM[Prometheus / CloudWatch]
  PROM -->|SLO Pass -> Ramp / Fail -> Abort| ARGO[Argo Rollouts]
  ARGO -->|Update Weights| LB`,
    },
    simulatorStoryboard: {
      controls: ['Traffic Weight Slider (0-100%)', 'Inject 500 Spike / OOMKill', 'Toggle Auto-Rollback Guard'],
      stateTransitions: ['CANARY_1% -> CANARY_5% -> CANARY_25% -> PROMOTED_100% (or ABORTED_0%)'],
      failureInjections: ['Inject 8.4% 500 error rate triggers automatic abort back to 0% in 3.1s'],
      visualAnimations: 'Split horizontal traffic bar narrows v2 slice to 0% immediately when SLO meter turns red.',
    },
  },
  {
    id: 'shadow',
    section: 'section-3',
    code: '3.5',
    title: 'Shadow / Dark Launch (Async Traffic Mirroring)',
    subtitle: 'Forks a live copy of real production HTTP traffic to v2 while silently discarding v2 responses.',
    plainEnglish: {
      whatItIs:
        'Letting the new version quietly process real production requests in the background without ever showing its response to real customers.',
      problemSolved:
        'Tests rewritten engines, ML models, or database migrations under authentic production payload complexity with literally 0% user-facing risk.',
      whatBreaksIfSkipped:
        'Forgetting to isolate or stub side-effects (emails, Stripe charges, Kafka writes) in the shadow deployment causes duplicate customer charges!',
    },
    actionMechanics: {
      inputs: ['Service mesh mirror rule (Envoy / Istio)', 'Shadow-mode side-effect stubbing flag', 'Response diff comparator'],
      automatedTriggers: ['Envoy serves customer from v1 -> Fires async non-blocking copy to v2 -> Logs latency & payload diff'],
      outputs: ['Production-grade performance profile & diff report with zero customer latency impact'],
      configTitle: 'envoy-istio-shadow-mirror.yaml',
      configSnippet: `http:
  - route:
      - destination: { host: search-api, subset: v1 }
        weight: 100
    mirror:
      host: search-api
      subset: v2-shadow
    mirrorPercentage: { value: 25.0 }`,
    },
    cloudVsInHouse: {
      aws: 'AWS App Mesh / EKS with Istio or Envoy Gateway HTTPRequestMirrorFilter.',
      gcp: 'GCP Traffic Director / Cloud Service Mesh URL Map requestMirrorPolicy.',
      azure: 'AKS Istio Service Mesh add-on VirtualService traffic mirroring.',
      inHouse: 'NGINX ngx_http_mirror_module, Envoy Proxy, or Istio running on bare-metal Kubernetes.',
    },
    dfd: {
      id: 'dfd-rollout-shadow',
      title: 'Asynchronous Shadow Traffic Mirroring Flow',
      subtitle: '100% Live Response from v1 + Async Fire-and-Forget Copy to v2 Shadow',
      level: 'Section 3.5',
      nodes: [
        { id: 'user', label: 'Live Users', sublabel: '100% Served by v1', x: 75, y: 120, zone: 'dev' },
        { id: 'envoy', label: 'Envoy / Istio', sublabel: 'Async Mirror 25%', x: 265, y: 120, zone: 'cloud' },
        { id: 'v1', label: 'Prod Stack v1', sublabel: 'Real Response', x: 515, y: 55, zone: 'cloud' },
        { id: 'v2', label: 'Shadow v2', sublabel: 'Side-Effects Stubbed', x: 515, y: 190, zone: 'sec' },
        { id: 'diff', label: 'Diff Telemetry', sublabel: 'Discard Response', x: 775, y: 190, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'user', to: 'envoy', label: 'Live Req', protocol: 'HTTPS' },
        { id: 'e2', from: 'envoy', to: 'v1', label: '100% Sync', protocol: 'HTTP/2' },
        { id: 'e3', from: 'envoy', to: 'v2', label: '25% Async Copy', protocol: 'Mirror' },
        { id: 'e4', from: 'v2', to: 'diff', label: 'Compare & Drop', protocol: 'OTel Diff' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Primary Request Served Synchronously by v1',
          activeNodeIds: ['user', 'envoy', 'v1'],
          activeEdgeIds: ['e1', 'e2'],
          detail: 'Every customer receives their response strictly from Stable v1 with zero added tail latency.',
          latencyLabel: '0ms User Impact',
        },
        {
          id: 's2',
          title: 'Async Fork to Side-Effect-Isolated Shadow v2',
          activeNodeIds: ['envoy', 'v2', 'diff'],
          activeEdgeIds: ['e3', 'e4'],
          detail: 'Envoy duplicates 25% of payloads asynchronously to v2 (with payment/email side-effects stubbed), compares outputs, and discards the response.',
          latencyLabel: 'Zero Blast Radius',
        },
      ],
      mermaidCode: `flowchart LR
  USER[Live Users] --> ENVOY[Envoy / Istio Proxy]
  ENVOY -->|100% Sync Live Response| V1[Production v1]
  ENVOY -.->|25% Async Copy| V2[Shadow v2 - Side Effects Stubbed]
  V2 -->|Log Latency & Diff, Discard Response| DIFF[Telemetry Comparator]`,
    },
    simulatorStoryboard: {
      controls: ['Mirror Percentage Slider (0-100%)', 'Toggle Side-Effect Guard (Dry-Run vs Unsafe)'],
      stateTransitions: ['MIRROR_OFF -> SHADOW_OBSERVING -> DIFF_VERIFIED -> READY_FOR_CANARY'],
      failureInjections: ['Shadow v2 crashes at 500ms—customer response stays 40ms 200 OK via v1'],
      visualAnimations: 'Solid blue packets return from v1 to users while dashed ghost packets flow into v2 and terminate in diff logs.',
    },
  },
  {
    id: 'ab-flags',
    section: 'section-3',
    code: '3.6',
    title: 'A/B Testing & Runtime Feature Flags',
    subtitle: 'Decouples dark code deployment from dynamic cohort-based feature activation and sub-second kill switches.',
    plainEnglish: {
      whatItIs:
        'Shipping new code turned OFF behind a runtime switch so product or ops teams can turn features on for specific cohorts—or kill them in 1 second without redeploying.',
      problemSolved:
        'Eliminates stressful release nights by separating infrastructure deployment (boring, continuous) from business launch (instant flag toggle).',
      whatBreaksIfSkipped:
        'Leaving dead feature flags unpruned creates exponential code-path complexity and surprise interactions months later.',
    },
    actionMechanics: {
      inputs: ['OpenFeature / LaunchDarkly / Unleash SDK', 'User context (user_id, region, plan)', 'Flag evaluation rules'],
      automatedTriggers: ['Edge SDK caches rule updates over SSE -> Evaluates flag locally in < 1ms -> Emits conversion & error metrics'],
      outputs: ['Cohort-targeted rollout (e.g., 10% Mumbai beta)', 'Instant < 1s kill-switch rollback without touching K8s'],
      configTitle: 'openfeature-cohort-flag.ts',
      configSnippet: `const variant = await openFeatureClient.getStringValue(
  'checkout-layout-experiment',
  'control',
  { targetingKey: user.id, region: 'ap-south-1', tier: 'pro' }
);
return variant === 'express-v2' ? renderExpressCheckout() : renderControl();`,
    },
    cloudVsInHouse: {
      aws: 'AWS AppConfig Feature Flags with Lambda/CloudWatch automated rollback validators.',
      gcp: 'Firebase Remote Config / Cloud Run + OpenFeature SDK backed by edge CDN rules.',
      azure: 'Azure App Configuration Feature Management with targeted percentage filters.',
      inHouse: 'Self-hosted Unleash, Flagsmith, or Flipt with OpenFeature SDKs and Redis edge cache.',
    },
    dfd: {
      id: 'dfd-rollout-flags',
      title: 'Runtime Feature Flag & Kill-Switch Flow',
      subtitle: 'Flag Control Plane -> Local SDK Cache (< 1ms) -> Cohort Branching',
      level: 'Section 3.6',
      nodes: [
        { id: 'cp', label: 'Flag Control Plane', sublabel: 'AppConfig / Unleash', x: 80, y: 120, zone: 'sec' },
        { id: 'sdk', label: 'In-Process SDK', sublabel: '< 1ms Local Eval', x: 300, y: 120, zone: 'ci' },
        { id: 'ctrl', label: 'Control Path (A)', sublabel: '90% Cohort', x: 560, y: 55, zone: 'cloud' },
        { id: 'var', label: 'Variant Path (B)', sublabel: '10% Beta Cohort', x: 560, y: 190, zone: 'cloud' },
        { id: 'ana', label: 'Experiment Metrics', sublabel: 'Kill-Switch Guard', x: 790, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'cp', to: 'sdk', label: 'SSE Rule Push', protocol: 'Stream' },
        { id: 'e2', from: 'sdk', to: 'ctrl', label: 'flag=false', protocol: 'In-Mem' },
        { id: 'e3', from: 'sdk', to: 'var', label: 'flag=true', protocol: 'In-Mem' },
        { id: 'e4', from: 'var', to: 'ana', label: 'Conversion/Err', protocol: 'Event' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Sub-Second Rule Streaming to Local SDK',
          activeNodeIds: ['cp', 'sdk'],
          activeEdgeIds: ['e1'],
          detail: 'Control plane streams JSON targeting rules over SSE into memory so requests never block on external network calls.',
          latencyLabel: '< 1ms Eval',
        },
        {
          id: 's2',
          title: 'Deterministic Cohort Routing & Instant Kill Switch',
          activeNodeIds: ['sdk', 'ctrl', 'var', 'ana'],
          activeEdgeIds: ['e2', 'e3', 'e4'],
          detail: 'Consistent hashing routes beta users to Variant B; toggling the kill-switch disables Variant B globally in < 1 second.',
          latencyLabel: '< 1s Kill',
        },
      ],
      mermaidCode: `flowchart LR
  CP[Flag Control Plane: AppConfig / Unleash] -->|SSE Push| SDK[In-Memory OpenFeature SDK]
  SDK -->|90% Control| A[Control Experience A]
  SDK -->|10% Targeted Cohort| B[Variant Experience B]
  B -->|Telemetry| ANA[Conversion & Error Analytics]`,
    },
    simulatorStoryboard: {
      controls: ['Target Cohort Selector', 'Emergency Kill-Switch Toggle'],
      stateTransitions: ['DARK_LAUNCH (0%) -> INTERNAL_STAFF -> BETA_10% -> GA_100% (or KILLED_0%)'],
      failureInjections: ['Checkout error spikes in Variant B -> Operator flips kill-switch -> Instant recovery with 0 pod restarts'],
      visualAnimations: 'Single deployed binary branches traffic visually inside the app box without spinning up new pods.',
    },
  },
];

/* ========================================================================== */
/* SECTION 4: CLOUD VS IN-HOUSE ARCHITECTURE (5-PART SPECIFICATION)           */
/* ========================================================================== */
export const SECTION4_CLOUD_VS_INHOUSE_FIVE_PART: FivePartMasterclassSpec[] = [
  {
    id: 'arch-managed-cloud',
    section: 'section-4',
    code: '4.1',
    title: 'Managed Cloud-Native Stack (AWS / GCP / Azure)',
    subtitle: 'Elastic control planes, managed Kubernetes/Serverless, OIDC workload identity, and pay-as-you-go OpEx.',
    plainEnglish: {
      whatItIs:
        'Renting fully managed building blocks (load balancers, Kubernetes control planes, secret vaults, registries) from cloud providers so engineers focus on product instead of racking servers.',
      problemSolved:
        'Eliminates 6-week hardware procurement cycles, datacenter power/cooling overhead, and manual HA etcd cluster maintenance.',
      whatBreaksIfSkipped:
        'Unbounded autoscaling without budget alerts, FinOps right-sizing, or VPC egress monitoring can trigger shocking 10x monthly cloud bills.',
    },
    actionMechanics: {
      inputs: ['Terraform / OpenTofu HCL modules', 'OIDC Workload Identity bindings', 'HPA + Karpenter / GKE Autopilot autoscaling policies'],
      automatedTriggers: ['CPU/RPS spike -> Cloud LB distributes load -> Karpenter provisions right-sized Spot/On-Demand nodes in ~45s'],
      outputs: ['Multi-AZ 99.99% resilient platform', 'Automated cloud-native patch management'],
      configTitle: 'terraform-eks-gke-baseline.tf',
      configSnippet: `resource "aws_eks_cluster" "prod" {
  name     = "prod-us-east-1"
  role_arn = aws_iam_role.eks_cluster.arn
  vpc_config {
    subnet_ids              = module.vpc.private_subnets
    endpoint_private_access = true
    endpoint_public_access  = false
  }
}`,
    },
    cloudVsInHouse: {
      aws: 'CodePipeline + ECR + EKS/Fargate + ALB/WAF + Secrets Manager + CloudWatch/X-Ray.',
      gcp: 'Cloud Build/Deploy + Artifact Registry + GKE/Cloud Run + Global LB/Cloud Armor + Secret Manager + Cloud Ops.',
      azure: 'Azure DevOps/GitHub + ACR + AKS/Container Apps + Application Gateway + Key Vault + Azure Monitor.',
      inHouse: 'Contrast: Cloud removes control-plane ops toil in exchange for ongoing OpEx and shared-responsibility vendor coupling.',
    },
    dfd: {
      id: 'dfd-arch-cloud',
      title: 'Managed Cloud-Native Elastic Architecture',
      subtitle: 'Edge WAF/ALB -> Private EKS/GKE -> Managed Secrets & Multi-AZ DB',
      level: 'Section 4.1',
      nodes: [
        { id: 'edge', label: 'Edge DNS + WAF', sublabel: 'Route53 / Armor', x: 80, y: 120, zone: 'sec' },
        { id: 'lb', label: 'Managed L7 LB', sublabel: 'ALB / Cloud LB', x: 265, y: 120, zone: 'cloud' },
        { id: 'k8s', label: 'EKS / GKE / Run', sublabel: 'Elastic Auto-Scale', x: 470, y: 120, zone: 'cloud' },
        { id: 'sec', label: 'Managed KMS/Vault', sublabel: 'OIDC Identity', x: 470, y: 210, zone: 'sec' },
        { id: 'obs', label: 'Cloud Ops / OTel', sublabel: 'Multi-AZ Metrics', x: 765, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'edge', to: 'lb', label: 'Clean TLS', protocol: 'Anycast' },
        { id: 'e2', from: 'lb', to: 'k8s', label: 'Elastic Pool', protocol: 'mTLS' },
        { id: 'e3', from: 'sec', to: 'k8s', label: 'Short JWT', protocol: 'OIDC' },
        { id: 'e4', from: 'k8s', to: 'obs', label: 'Golden Signals', protocol: 'OTLP' },
      ],
      steps: [
        {
          id: 's1',
          title: 'Global Edge Filtering & L7 Termination',
          activeNodeIds: ['edge', 'lb'],
          activeEdgeIds: ['e1'],
          detail: 'Managed WAF drops DDoS/SQLi at the edge while managed L7 load balancers auto-scale TLS termination.',
          latencyLabel: 'Edge < 12ms',
        },
        {
          id: 's2',
          title: 'Elastic Private Compute & OIDC Secrets',
          activeNodeIds: ['lb', 'k8s', 'sec', 'obs'],
          activeEdgeIds: ['e2', 'e3', 'e4'],
          detail: 'Workloads run inside private subnets with zero static keys and scale node pools dynamically on traffic spikes.',
          latencyLabel: '45s Node Scale',
        },
      ],
      mermaidCode: `flowchart LR
  EDGE[Cloud DNS + WAF] --> LB[Managed ALB / Cloud LB]
  LB --> COMPUTE[EKS / GKE / Cloud Run Elastic Pool]
  SECRETS[Cloud Secrets Manager + OIDC] --> COMPUTE
  COMPUTE --> OBS[CloudWatch / Cloud Monitoring + OTel]`,
    },
    simulatorStoryboard: {
      controls: ['RPS Load Spike Slider (2K -> 24K)', 'Toggle Multi-AZ Failover'],
      stateTransitions: ['BASELINE_4_PODS -> SCALING_OUT -> PEAK_24_PODS -> SCALING_IN'],
      failureInjections: ['AZ-1 outage automatically drains via ALB health checks to AZ-2/AZ-3 with 0% packet loss'],
      visualAnimations: 'Pod squares spawn dynamically as traffic rises while CPU stays comfortably below 80%.',
    },
  },
  {
    id: 'arch-inhouse-baremetal',
    section: 'section-4',
    code: '4.2',
    title: 'In-House / On-Premise Bare-Metal Architecture',
    subtitle: 'Full hardware ownership with HAProxy, Keepalived VRRP, MetalLB, RKE2/kubeadm, Harbor, and HashiCorp Vault.',
    plainEnglish: {
      whatItIs:
        'Building and running your own private cloud inside owned datacenter racks using open-source equivalents for every managed cloud service.',
      problemSolved:
        'Delivers predictable low unit cost at steady high scale, strict data sovereignty, and zero cloud egress fees.',
      whatBreaksIfSkipped:
        'Deploying bare-metal Kubernetes without redundant Keepalived VIPs, MetalLB BGP, and 3-node etcd quorum creates single points of hardware failure.',
    },
    actionMechanics: {
      inputs: ['Physical rack servers (PXE/Ansible provisioned)', 'Keepalived VRRP floating VIP', 'MetalLB BGP/L2 pool + Harbor + Vault'],
      automatedTriggers: ['Primary HAProxy dies -> Keepalived shifts VIP to standby in < 1s -> MetalLB routes L4 to RKE2 Ingress pods'],
      outputs: ['Sovereign, zero-egress-fee cluster', 'Predictable fixed CapEx footprint'],
      configTitle: 'metallb-bgp-pool.yaml',
      configSnippet: `apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: dc1-prod-vip-pool
  namespace: metallb-system
spec:
  addresses:
    - 10.42.100.10-10.42.100.50`,
    },
    cloudVsInHouse: {
      aws: 'Replaces AWS ALB/NLB, ECR, EKS, Secrets Manager, and CloudWatch.',
      gcp: 'Replaces Cloud LB, Artifact Registry, GKE, Secret Manager, and Cloud Monitoring.',
      azure: 'Replaces App Gateway, ACR, AKS, Key Vault, and Azure Monitor.',
      inHouse: 'GitLab CI + Harbor + RKE2/kubeadm + HAProxy/Keepalived/MetalLB + HashiCorp Vault + Prometheus/Grafana/Loki/Jaeger.',
    },
    dfd: {
      id: 'dfd-arch-inhouse',
      title: 'In-House Bare-Metal Sovereign Datacenter Stack',
      subtitle: 'Keepalived VRRP VIP -> HAProxy -> MetalLB -> RKE2 Rack + Harbor & Vault',
      level: 'Section 4.2',
      nodes: [
        { id: 'vrrp', label: 'Keepalived VRRP', sublabel: 'Floating DC VIP', x: 80, y: 120, zone: 'ops' },
        { id: 'hap', label: 'HAProxy + Traefik', sublabel: 'TLS + L7 Routing', x: 265, y: 120, zone: 'ops' },
        { id: 'rke', label: 'Bare-Metal RKE2', sublabel: 'MetalLB + 3x etcd', x: 475, y: 120, zone: 'cloud' },
        { id: 'harbor', label: 'Harbor + Vault', sublabel: 'Local Signed OCI', x: 475, y: 210, zone: 'sec' },
        { id: 'prom', label: 'Prom + Grafana', sublabel: 'Loki + Jaeger', x: 765, y: 120, zone: 'ops' },
      ],
      edges: [
        { id: 'e1', from: 'vrrp', to: 'hap', label: 'Active VIP', protocol: 'VRRP < 1s' },
        { id: 'e2', from: 'hap', to: 'rke', label: 'MetalLB BGP', protocol: 'L4/L7' },
        { id: 'e3', from: 'harbor', to: 'rke', label: 'Pull + Lease', protocol: 'Internal LAN' },
        { id: 'e4', from: 'rke', to: 'prom', label: 'Scrape/OTLP', protocol: 'LAN' },
      ],
      steps: [
        {
          id: 's1',
          title: 'HA Floating VIP Failover (Keepalived + HAProxy)',
          activeNodeIds: ['vrrp', 'hap'],
          activeEdgeIds: ['e1'],
          detail: 'Two physical HAProxy nodes share a floating VIP over VRRP; if node A loses power, node B assumes traffic in under 1 second.',
          latencyLabel: '< 1s VIP Failover',
        },
        {
          id: 's2',
          title: 'Local Sovereign Execution & Telemetry',
          activeNodeIds: ['hap', 'rke', 'harbor', 'prom'],
          activeEdgeIds: ['e2', 'e3', 'e4'],
          detail: 'RKE2 pulls images from local Harbor, mounts dynamic Vault leases, and streams telemetry to self-hosted Prometheus/Loki with $0 egress.',
          latencyLabel: '$0 Egress Fee',
        },
      ],
      mermaidCode: `flowchart LR
  VRRP[Keepalived VRRP Floating VIP] --> HAP[HAProxy / NGINX Ingress]
  HAP -->|MetalLB BGP| RKE[Bare-Metal Kubernetes RKE2 / kubeadm]
  HV[Harbor Registry + HashiCorp Vault] --> RKE
  RKE --> OBS[Prometheus + Grafana + Loki + Jaeger]`,
    },
    simulatorStoryboard: {
      controls: ['RPS Load Spike Slider', 'Kill Primary HAProxy Node button'],
      stateTransitions: ['RACK_NOMINAL -> RACK_SATURATED_100% -> HTTP_503_QUEUE_DROP'],
      failureInjections: ['Traffic > 10,000 RPS hits fixed rack ceiling and drops 503s unless Hybrid Cloud Bursting is turned on'],
      visualAnimations: 'Rack slots fill up to R10; exceeding rack ceiling lights crimson 503 counter.',
    },
  },
  {
    id: 'arch-hybrid-airgap',
    section: 'section-4',
    code: '4.3',
    title: 'Hybrid Cloud Bursting & Air-Gapped Regulated Sync',
    subtitle: 'Private BGP Direct Connect bursting plus offline OCI tarball replication for zero-egress environments.',
    plainEnglish: {
      whatItIs:
        'Combining owned on-premise datacenters with cloud regions—either bursting flash-sale traffic to the cloud over private fiber, or syncing signed offline bundles into air-gapped secure networks.',
      problemSolved:
        'Lets regulated banks, hospitals, and high-scale enterprises enjoy low baseline bare-metal costs without sacrificing flash-peak elasticity or strict compliance.',
      whatBreaksIfSkipped:
        'Air-gapped clusters fail deployments immediately if Helm charts or container base layers attempt to pull dependencies from public internet registries.',
    },
    actionMechanics: {
      inputs: ['Signed OCI bundle (skopeo / zarf)', 'AWS Direct Connect / GCP Cloud Interconnect BGP session', 'Kustomize multi-cluster GitOps overlays'],
      automatedTriggers: ['On-prem CPU > 80% -> Global DNS spills excess weight to Cloud EKS/GKE', 'DMZ scan passes -> Signed OCI tarball replicates into offline Harbor'],
      outputs: ['Zero-egress compliance in secure zones', 'Seamless peak absorption without buying idle hardware'],
      configTitle: 'skopeo-airgap-mirror.sh',
      configSnippet: `# 1. Verify signature & export OCI archive in connected DMZ
cosign verify registry.dmz/payments@sha256:81f0b9e...
skopeo copy docker://registry.dmz/payments@sha256:81f0b9e oci-archive:payments-v2.tar

# 2. Import inside Air-Gapped Harbor Registry (zero internet egress)
skopeo copy oci-archive:payments-v2.tar docker://harbor.airgap.internal/prod/payments@sha256:81f0b9e`,
    },
    cloudVsInHouse: {
      aws: 'AWS Direct Connect + AWS Outposts / EKS Anywhere with Route 53 weighted failover.',
      gcp: 'GCP Dedicated Interconnect + GKE Enterprise (Anthos) Config Sync across on-prem & cloud.',
      azure: 'Azure ExpressRoute + Azure Arc-enabled Kubernetes unified GitOps management.',
      inHouse: 'Cilium ClusterMesh + Harbor air-gap replication + Skopeo / ORAS / Zarf offline bundle pipelines.',
    },
    dfd: {
      id: 'dfd-arch-hybrid',
      title: 'Hybrid Burst & Air-Gapped Artifact Sync Flow',
      subtitle: 'DMZ Scan -> Offline Harbor Diode + Direct Connect Cloud Burst Spillover',
      level: 'Section 4.3',
      nodes: [
        { id: 'dmz', label: 'Connected DMZ', sublabel: 'Trivy + Cosign', x: 80, y: 120, zone: 'sec' },
        { id: 'tar', label: 'Signed Bundle', sublabel: 'Skopeo / Zarf', x: 270, y: 120, zone: 'ci' },
        { id: 'air', label: 'Air-Gap Harbor', sublabel: '0.0.0.0/0 Blocked', x: 475, y: 60, zone: 'sec' },
        { id: 'dc', label: 'On-Prem Rack', sublabel: 'Baseline 10K RPS', x: 475, y: 190, zone: 'ops' },
        { id: 'burst', label: 'Cloud Burst Pool', sublabel: 'Direct Connect', x: 770, y: 190, zone: 'cloud' },
      ],
      edges: [
        { id: 'e1', from: 'dmz', to: 'tar', label: 'Verify & Pack', protocol: 'OCI Tar' },
        { id: 'e2', from: 'tar', to: 'air', label: 'Unidirectional', protocol: 'Air-Gap Sync' },
        { id: 'e3', from: 'air', to: 'dc', label: 'Internal Pull', protocol: 'LAN TLS' },
        { id: 'e4', from: 'dc', to: 'burst', label: 'Spillover > 80%', protocol: 'BGP Interconnect' },
      ],
      steps: [
        {
          id: 's1',
          title: 'DMZ Verification & Signed Offline Bundle Creation',
          activeNodeIds: ['dmz', 'tar', 'air'],
          activeEdgeIds: ['e1', 'e2'],
          detail: 'Only Trivy-clean, Cosign-verified digests are packaged via Skopeo/Zarf and imported into the air-gapped internal Harbor registry.',
          latencyLabel: 'Zero Internet Egress',
        },
        {
          id: 's2',
          title: 'Private Direct Connect Burst on Flash Traffic',
          activeNodeIds: ['air', 'dc', 'burst'],
          activeEdgeIds: ['e3', 'e4'],
          detail: 'Baseline load executes cheaply on-premise while flash-sale overflow spills transparently to AWS/GCP over private L2 interconnect.',
          latencyLabel: '0% Dropped 503',
        },
      ],
      mermaidCode: `flowchart LR
  DMZ[DMZ Scanner: Trivy + Cosign] -->|Skopeo / Zarf OCI Tar| AIR[(Air-Gapped Harbor Registry)]
  AIR -->|Zero Internet Egress| ONPREM[On-Prem Bare-Metal Baseline]
  ONPREM -->|Traffic > 80% via Direct Connect / Interconnect| CLOUD[Cloud EKS / GKE Burst Pool]`,
    },
    simulatorStoryboard: {
      controls: ['Enable Hybrid Cloud Bursting Toggle', 'RPS Traffic Slider (2K -> 24K)'],
      stateTransitions: ['ONPREM_ONLY -> BURST_THRESHOLD_80% -> HYBRID_SPILLOVER_ACTIVE -> DRAIN_BACK_ONPREM'],
      failureInjections: ['Disabling Hybrid Burst above 10,000 RPS immediately shows dropped HTTP 503 packets'],
      visualAnimations: 'Overflow requests divert over a clean blue interconnect line into newly spawned Cloud Burst pods (C1..C14).',
    },
  },
];

/* ========================================================================== */
/* SECTION 6: INTERACTIVE SIMULATOR ENGINE DESIGN & STATE MACHINE PSEUDOCODE  */
/* ========================================================================== */
export const SECTION6_SIMULATOR_ENGINE_BLUEPRINTS: SimulatorEngineBlueprint[] = [
  {
    id: 'engine-gatekeeper',
    code: '6.1',
    title: 'Simulator Engine 1: The Pipeline Gatekeeper FSM',
    purpose: 'Deterministic stage-by-stage CI/CD runner with toggleable security & quality failure injectors and downstream promotion locks.',
    uiControls: [
      '4 Fault Injection Toggles (secretLeak, unitFail, highCve, unsignedImage)',
      'Primary CTA: Commit & Run Pipeline (disabled while RUNNING)',
      'Reset Pipeline button',
      '6-Stage animated horizontal progress track + Remediation Diagnostic Box',
    ],
    states: ['IDLE', 'RUNNING_STAGE[0..5]', 'BLOCKED_AT_GATE(stageId)', 'PROMOTED_TO_PROD'],
    events: ['TOGGLE_FAULT(key)', 'COMMIT_RUN', 'TICK_STAGE_ADVANCE', 'RESET'],
    failureInjections: [
      'secretLeak -> Halts at Stage 1 (Gitleaks regex entropy rule)',
      'unitFail -> Halts at Stage 3 (Testcontainers assertion mismatch)',
      'highCve -> Halts at Stage 4 (Trivy CRITICAL CVE exit-code 1)',
      'unsignedImage -> Halts at Stage 5 (OPA Cosign admission rejection)',
    ],
    stateMachinePseudocode: `type GateState =
  | { status: 'IDLE' }
  | { status: 'RUNNING'; stageIdx: number }
  | { status: 'BLOCKED'; stageIdx: number; reason: string; remediation: string }
  | { status: 'PROMOTED'; digest: string };

function pipelineReducer(state: GateState, event: GateEvent, faults: FaultFlags): GateState {
  if (event.type === 'RESET') return { status: 'IDLE' };
  if (event.type === 'COMMIT_RUN') return { status: 'RUNNING', stageIdx: 0 };

  if (event.type === 'TICK_STAGE_ADVANCE' && state.status === 'RUNNING') {
    const stage = STAGES[state.stageIdx];
    if (stage.faultKey && faults[stage.faultKey]) {
      return { status: 'BLOCKED', stageIdx: state.stageIdx, reason: stage.failDetail, remediation: stage.remediation };
    }
    const next = state.stageIdx + 1;
    return next >= STAGES.length
      ? { status: 'PROMOTED', digest: 'sha256:81f0b9e442c1a9...' }
      : { status: 'RUNNING', stageIdx: next };
  }
  return state;
}`,
  },
  {
    id: 'engine-rollout',
    code: '6.2',
    title: 'Simulator Engine 2: Live Canary & Blue-Green Traffic Controller FSM',
    purpose: 'Models weighted L7 routing, atomic Blue-Green target swaps, synthetic 5xx/OOM fault injection, and autonomous SLO rollback.',
    uiControls: [
      'Mode Switcher (Canary Progressive vs Blue-Green Cutover)',
      'Canary Weight Slider (0% - 100%) + Step Preset Chips (0, 1, 5, 25, 50, 100%)',
      'Fault Selector (Healthy v2, Inject 500 Errors 8.4%, Inject OOMKill)',
      'Automated SLO Rollback Guard Checkbox (abort when v2 5xx > 1.0%)',
    ],
    states: ['STABLE_100', 'CANARY_ACTIVE(weight)', 'BLUE_GREEN_SWAPPED', 'SLO_BREACH_DETECTED', 'AUTO_ROLLED_BACK'],
    events: ['SET_WEIGHT(w)', 'FLIP_STACK(blue|green)', 'INJECT_FAULT(type)', 'SLO_EVAL_TICK'],
    failureInjections: [
      'errors500 -> Sets v2 5xx = 8.4%, triggers ACA breach within 1.5s, snaps traffic back to 100% v1',
      'oomKill -> Sets v2 p99 = 920ms & 5xx = 4.9%, aborts rollout and drains Canary ReplicaSet',
    ],
    stateMachinePseudocode: `interface RolloutState {
  mode: 'canary' | 'blue-green';
  v2Weight: number;          // 0..100
  fault: 'none' | 'errors500' | 'oomKill';
  autoRollback: boolean;
  lastAuditEvent: string | null;
}

function evaluateSloGuard(state: RolloutState): RolloutState {
  const v2ErrorRate = state.fault === 'errors500' ? 8.4 : state.fault === 'oomKill' ? 4.9 : 0.04;
  const sloBreached = state.v2Weight > 0 && v2ErrorRate > 1.0;

  if (sloBreached && state.autoRollback) {
    return {
      ...state,
      v2Weight: 0,
      fault: 'none',
      lastAuditEvent: \`SLO Breach (\${v2ErrorRate}% > 1.0%) -> Auto-aborted v2 to 0% in 3.1s\`,
    };
  }
  return state;
}`,
  },
  {
    id: 'engine-scaling',
    code: '6.3',
    title: 'Simulator Engine 3: Cloud Elastic vs. Bare-Metal Capacity Engine',
    purpose: 'Computes side-by-side queuing, CPU saturation, HTTP 503 overflow drops, hourly cloud OpEx, and Direct Connect Hybrid Burst spillover.',
    uiControls: [
      'Incoming Traffic RPS Slider (2,000 - 24,000 req/sec)',
      'Hybrid Cloud Bursting Toggle (Direct Connect / Cloud Interconnect)',
      'Live KPI Tiles (Active Pods, CPU%, Est. Cost/hr, Dropped HTTP 503/s)',
      'Dynamic Pod Grid (Cloud Elastic Pool vs Fixed R1..R10 Rack + C1..Cn Burst)',
    ],
    states: ['BASELINE_FIT', 'CLOUD_AUTOSCALING', 'ONPREM_SATURATED_503', 'HYBRID_BURST_PROTECTED'],
    events: ['SET_RPS(rps)', 'TOGGLE_HYBRID_BURST(enabled)'],
    failureInjections: [
      'RPS > 10,000 with Hybrid Burst OFF -> Bare-Metal hits 100% CPU and drops (RPS - 10,000) HTTP 503/s',
      'Enabling Hybrid Burst -> Spawns ceil(overflow / 1000) Cloud Burst pods and drops 503s to 0',
    ],
    stateMachinePseudocode: `function computeCapacitySnapshot(rps: number, hybridBurst: boolean) {
  const POD_CAP_RPS = 1000;
  const ONPREM_MAX_PODS = 10; // Fixed physical rack = 10,000 RPS

  const cloudPods = Math.max(4, Math.ceil(rps / POD_CAP_RPS));
  const overflowRps = Math.max(0, rps - ONPREM_MAX_PODS * POD_CAP_RPS);

  return {
    cloud: { pods: cloudPods, dropped503: 0, hourlyUsd: +(cloudPods * 0.14 + 0.45).toFixed(2) },
    onPrem: {
      cpuPct: Math.min(100, Math.round((rps / (ONPREM_MAX_PODS * POD_CAP_RPS)) * 100)),
      dropped503: hybridBurst ? 0 : overflowRps,
      burstCloudPods: hybridBurst && overflowRps > 0 ? Math.ceil(overflowRps / POD_CAP_RPS) : 0,
    },
  };
}`,
  },
  {
    id: 'engine-gitops',
    code: '6.4',
    title: 'Simulator Engine 4: GitOps Configuration Drift & Self-Healing Reconciler',
    purpose: 'Compares desired Git manifest state against live cluster mutations and executes automated or manual reconciliation loops.',
    uiControls: [
      '4 Manual Tamper Buttons (Scale Replicas 6->1, TLS 1.3->1.0, Open Port 22, Swap :latest)',
      'ArgoCD selfHeal Toggle (Auto-Reconcile vs Paused Alert-Only)',
      'Manual Reconcile Now CTA (visible when drifted & selfHeal paused)',
      'Live Git vs Cluster YAML Diff View + Reconciliation Audit Stream',
    ],
    states: ['SYNCED', 'OUT_OF_SYNC_DRIFT', 'RECONCILING_SELF_HEAL'],
    events: ['MANUAL_TAMPER(patch)', 'TOGGLE_SELF_HEAL', 'RECONCILE_TICK', 'MANUAL_SYNC'],
    failureInjections: [
      'Unauthorized Console/SSH edits immediately flip cluster status to OUT_OF_SYNC_DRIFT',
      'With selfHeal=true, informer timer overwrites live cluster back to DESIRED_GIT_STATE in 1.8s',
    ],
    stateMachinePseudocode: `function gitOpsReconcileLoop(desired: ClusterSpec, live: ClusterSpec, selfHeal: boolean) {
  const diffs = diffSpecs(desired, live);
  if (diffs.length === 0) return { syncStatus: 'SYNCED', live };

  if (selfHeal) {
    return {
      syncStatus: 'SYNCED',
      live: { ...desired }, // Overwrite unauthorized drift with Git truth
      auditLog: \`[ArgoCD selfHeal] Reconciled \${diffs.length} drifted field(s) back to Git commit\`,
    };
  }
  return { syncStatus: 'OUT_OF_SYNC', live, diffs };
}`,
  },
];
