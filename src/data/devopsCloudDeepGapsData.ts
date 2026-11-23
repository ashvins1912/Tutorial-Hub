export type DevOpsDeepTopicCategory =
  | 'Kubernetes & Scaling'
  | 'Networking & Mesh'
  | 'IaC & Reliability'
  | 'Security & FinOps';

export interface DeepVisualStep {
  step: number;
  nodeId: string;
  label: string;
  metricBadge: string;
  summary: string;
  internalsDetail: string;
  stateSnapshot: string;
}

export interface DevOpsCloudDeepTopic {
  id: string;
  title: string;
  category: DevOpsDeepTopicCategory;
  difficulty: 'Senior' | 'Staff';
  plainEnglish: string;
  formalDefinition: string;
  whyGapMatters: string;
  awsMapping: string;
  gcpMapping: string;
  openSourceMapping: string;
  steps: DeepVisualStep[];
  buildMermaid: (activeNodeId: string | null, visitedNodeIds: string[]) => string;
  productionSnippetTitle: string;
  productionSnippet: string;
  failureModes: { symptom: string; rootCause: string; mitigation: string }[];
}

function buildHighlightedMermaid(
  baseLines: string[],
  allNodeIds: string[],
  activeNodeId: string | null,
  visitedNodeIds: string[]
): string {
  const styles: string[] = [];
  for (const id of visitedNodeIds) {
    if (allNodeIds.includes(id) && id !== activeNodeId) {
      styles.push(`  style ${id} fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px`);
    }
  }
  if (activeNodeId && allNodeIds.includes(activeNodeId)) {
    styles.push(`  style ${activeNodeId} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`);
  }
  return [...baseLines, ...styles].join('\n');
}

export const DEVOPS_CLOUD_DEEP_TOPICS: DevOpsCloudDeepTopic[] = [
  {
    id: 'k8s-scheduling-autoscaling-probes',
    title: 'Kubernetes Scheduler, Probes & Multi-Layer Autoscaling (HPA / VPA / KEDA / Karpenter)',
    category: 'Kubernetes & Scaling',
    difficulty: 'Staff',
    plainEnglish:
      'Follow a Pod from `Pending` through Filter/Score scheduling, Containerd image pull, Startup/Readiness/Liveness probes, and event-driven KEDA + Karpenter node autoscaling.',
    formalDefinition:
      'Declarative container orchestration reconciling desired replica state via kube-scheduler predicate filtering & priority scoring, kubelet lifecycle probes, and decoupled Pod-level (HPA/KEDA) + Node-level (Karpenter) control loops.',
    whyGapMatters:
      'Most outages during traffic spikes come from misconfigured readiness probes, CPU throttling from tight limits, or waiting 4 minutes for slow node groups when HPA triggers.',
    awsMapping: 'Amazon EKS + Karpenter + AWS Load Balancer Controller',
    gcpMapping: 'GKE Autopilot / Node Auto-Provisioning + Cloud Monitoring HPA',
    openSourceMapping: 'kube-scheduler + KEDA + Metrics Server + Vertical Pod Autoscaler',
    steps: [
      {
        step: 1,
        nodeId: 'API',
        label: 'Kube-APIServer & etcd Persist',
        metricBadge: '12ms · Watch Event',
        summary: 'Deployment controller creates a Pending Pod spec in etcd and notifies kube-scheduler via informer watch.',
        internalsDetail: 'Admission webhooks validate PodSecurity, LimitRange defaults, and inject sidecar specs before persisting.',
        stateSnapshot: 'phase=Pending · assignedNode=null · replicas=3->6',
      },
      {
        step: 2,
        nodeId: 'SCHED',
        label: 'Filter & Score Node Binding',
        metricBadge: '4ms · Topology Spread',
        summary: 'kube-scheduler filters out nodes lacking CPU/RAM/taints and scores candidates for AZ spread & bin-packing.',
        internalsDetail: 'If no node fits, Pod stays Unschedulable—triggering Karpenter to provision a right-sized EC2/GCE VM in ~35s.',
        stateSnapshot: 'feasibleNodes=4/12 · topScore=node-az2 (92pts)',
      },
      {
        step: 3,
        nodeId: 'KUBELET',
        label: 'Kubelet Pull & Cgroups Sandbox',
        metricBadge: '1.8s · CNI + OverlayFS',
        summary: 'Kubelet creates Pod network namespace (CNI IP), mounts tmpfs secrets, pulls OCI layers, and sets Linux cgroup v2 quotas.',
        internalsDetail: 'Memory limit sets OOMKill ceiling; CPU requests guarantee shares while CPU limits enforce CFS bandwidth throttling.',
        stateSnapshot: 'containerd=running · ip=10.24.4.19 · cgroup.mem=512Mi',
      },
      {
        step: 4,
        nodeId: 'PROBES',
        label: 'Startup -> Readiness -> Liveness Probes',
        metricBadge: 'Ready Gate · 0% 5xx',
        summary: 'Traffic is withheld from Service Endpoints until ReadinessProbe passes; LivenessProbe restarts wedged processes.',
        internalsDetail: 'Always pair `preStop: sleep 5` with `terminationGracePeriodSeconds` so kube-proxy/Ingress drains connections before SIGTERM.',
        stateSnapshot: 'startup=OK · readiness=PASS -> EndpointSlice ADDED',
      },
      {
        step: 5,
        nodeId: 'SCALE',
        label: 'KEDA Event Scaling + Karpenter Node Fit',
        metricBadge: 'Kafka Lag -> +8 Pods',
        summary: 'KEDA scales pods directly on Kafka consumer lag or HTTP RPS while Karpenter dynamically launches Spot/On-Demand nodes.',
        internalsDetail: 'Decouples pod scaling from slow 60s CPU averaging, cutting flash-sale scale-out lag from minutes to seconds.',
        stateSnapshot: 'kafkaLag=14,200 · desiredReplicas=14 · node=c7g.2xlarge',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  API["1. kube-apiserver + etcd"] -->|"Informer Watch"| SCHED["2. kube-scheduler (Filter & Score)"]',
          '  SCHED -->|"Bind Pod"| KUBELET["3. Kubelet + containerd + CNI"]',
          '  KUBELET -->|"HTTP /healthz"| PROBES["4. Startup / Readiness / Liveness"]',
          '  PROBES -->|"Add Endpoint"| SVC["5. Service / Ingress Traffic"]',
          '  SCALE["KEDA / HPA + Karpenter"] -.->|"Scale Replicas & Nodes"| API',
        ],
        ['API', 'SCHED', 'KUBELET', 'PROBES', 'SVC', 'SCALE'],
        active,
        visited
      ),
    productionSnippetTitle: 'keda-karpenter-probe-guard.yaml',
    productionSnippet: `readinessProbe:
  httpGet: { path: /readyz, port: 8080 }
  periodSeconds: 5
  failureThreshold: 2
lifecycle:
  preStop:
    exec: { command: ["/bin/sh", "-c", "sleep 5"] }
---
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
spec:
  minReplicaCount: 3
  maxReplicaCount: 40
  triggers:
    - type: kafka
      metadata: { topic: orders.created, lagThreshold: "500" }`,
    failureModes: [
      {
        symptom: '502 Bad Gateway bursts during rolling deploys',
        rootCause: 'Pod exits immediately on SIGTERM while Ingress/kube-proxy still routes in-flight packets to its IP.',
        mitigation: 'Add `preStop: sleep 5` hook and drain keep-alive HTTP connections gracefully.',
      },
      {
        symptom: 'High P99 latency even at 40% average CPU',
        rootCause: 'Tight `limits.cpu` triggers Linux CFS quota throttling every 100ms period.',
        mitigation: 'Set accurate `requests.cpu` and avoid overly low `limits.cpu` on latency-sensitive services.',
      },
    ],
  },
  {
    id: 'service-mesh-mtls-ebpf',
    title: 'Service Mesh (Istio / Cilium eBPF), Zero-Trust mTLS & L7 Circuit Breaking',
    category: 'Networking & Mesh',
    difficulty: 'Staff',
    plainEnglish:
      'See how east-west microservice calls get automatic mutual TLS identity, short-lived SPIFFE certificates, L7 retries, and eBPF kernel-level network policies with zero app-code changes.',
    formalDefinition:
      'An infrastructure-layer east-west traffic fabric intercepting pod sockets via Envoy sidecars or Cilium eBPF programs to enforce SPIFFE X.509 mTLS identity, L7 resilience policies, and golden-signal telemetry.',
    whyGapMatters:
      'Flat cluster networks allow lateral movement if a single pod is compromised, and hand-rolling TLS rotation + retries inside 40 microservices creates inconsistent failure cascades.',
    awsMapping: 'AWS App Mesh / VPC Lattice + EKS Cilium CNI',
    gcpMapping: 'Cloud Service Mesh (Anthos / Managed Istio) + GKE Dataplane V2 (Cilium)',
    openSourceMapping: 'Istio Ambient Mesh / Linkerd + Cilium eBPF + SPIRE',
    steps: [
      {
        step: 1,
        nodeId: 'SPIRE',
        label: 'SPIFFE / SPIRE Workload Identity',
        metricBadge: 'TTL 1h · Auto-Rotate',
        summary: 'Control plane attests pod ServiceAccount & namespace and mints a short-lived X.509 SVID (`spiffe://cluster/ns/pay/sa/checkout`).',
        internalsDetail: 'Private keys live exclusively in memory and rotate hourly before expiration without restarting containers.',
        stateSnapshot: 'svid=spiffe://prod/ns/pay/sa/checkout · certExp=58m',
      },
      {
        step: 2,
        nodeId: 'EBPF',
        label: 'eBPF / Sidecar Socket Interception',
        metricBadge: '<0.3ms · Kernel Hook',
        summary: 'Outbound plain TCP from Checkout Pod is intercepted transparently by Cilium eBPF / Envoy proxy at the socket layer.',
        internalsDetail: 'Ambient / Cilium eBPF eliminates per-pod sidecar memory overhead (~60MB/pod) by running shared node-level L4 ztunnel + eBPF maps.',
        stateSnapshot: 'sock_ops=intercepted · bypassIptables=true',
      },
      {
        step: 3,
        nodeId: 'MTLS',
        label: 'Mutual TLS 1.3 Handshake & L7 AuthZ',
        metricBadge: 'Zero-Trust · Deny-Default',
        summary: 'Both client and server verify each other’s SPIFFE certificates and evaluate L7 AuthorizationPolicy (`POST /v1/debit` only).',
        internalsDetail: 'Blocks lateral attacks even if an attacker gains shell access inside an unrelated frontend pod.',
        stateSnapshot: 'tls=1.3 · peerVerified=true · policy=ALLOW_POST_DEBIT',
      },
      {
        step: 4,
        nodeId: 'CB',
        label: 'Outlier Ejection & Retry Budget',
        metricBadge: 'EWMA · 5xx Eject 30s',
        summary: 'Mesh proxy tracks per-endpoint 5xx rates, ejects sick pods automatically, and caps retries at 20% to prevent retry storms.',
        internalsDetail: 'Pairs per-attempt timeouts with jittered backoff so transient network blips stay invisible to callers.',
        stateSnapshot: 'healthyPods=5/6 · ejected=ledger-pod-4 · retryBudget=18%',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  SPIRE["1. SPIRE / Istiod CA (X.509 SVID)"] -.->|"1h Cert Push"| EBPF["2. Checkout Socket (eBPF / Envoy)"]',
          '  EBPF -->|"TLS 1.3 mTLS"| MTLS["3. Ledger Peer AuthZ Policy"]',
          '  MTLS -->|"EWMA + Outlier Eject"| CB["4. L7 Circuit Breaker & Retry Budget"]',
          '  CB -->|"Authorized Call"| TARGET["5. Ledger Service Container"]',
        ],
        ['SPIRE', 'EBPF', 'MTLS', 'CB', 'TARGET'],
        active,
        visited
      ),
    productionSnippetTitle: 'istio-zero-trust-authz-cb.yaml',
    productionSnippet: `apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: ledger-allow-checkout, namespace: payments }
spec:
  selector: { matchLabels: { app: ledger } }
  rules:
    - from: [{ source: { principals: ["cluster.local/ns/payments/sa/checkout"] } }]
      to: [{ operation: { methods: ["POST"], paths: ["/v1/debit"] } }]`,
    failureModes: [
      {
        symptom: 'Retry storm multiplies load 10x across 4 microservice hops',
        rootCause: 'Every hop retries 3 times independently (3^4 = 81x amplification) during a DB slowdown.',
        mitigation: 'Enforce mesh-level retry budgets (<=20% active requests) and only retry idempotent calls at the outermost safe hop.',
      },
    ],
  },
  {
    id: 'terraform-iac-state-dag-drift',
    title: 'Terraform / OpenTofu IaC State Locking, DAG Execution & Drift Reconciliation',
    category: 'IaC & Reliability',
    difficulty: 'Senior',
    plainEnglish:
      'Trace how Infrastructure-as-Code prevents two engineers from corrupting cloud infra simultaneously via remote state locking, dependency DAG topological planning, and scheduled drift detection.',
    formalDefinition:
      'Declarative infrastructure convergence executing a directed acyclic graph (DAG) diff between HCL desired configuration, encrypted remote state backend, and live cloud provider APIs under distributed mutex locks.',
    whyGapMatters:
      'Manual console hotfixes ("ClickOps") create silent state drift that breaks the next automated deploy or accidentally destroys production databases on plan apply.',
    awsMapping: 'S3 Encrypted Remote State + S3 Native/DynamoDB Lock + AWS Proton',
    gcpMapping: 'GCS Remote State (Built-in Object Generation Lock) + Infrastructure Manager',
    openSourceMapping: 'OpenTofu / Terraform + Atlantis / Spacelift + Driftctl',
    steps: [
      {
        step: 1,
        nodeId: 'LOCK',
        label: 'Acquire Remote State Lock',
        metricBadge: 'Mutex · Zero Race',
        summary: 'CI runner acquires an atomic lease lock in DynamoDB / GCS before reading `terraform.tfstate` so concurrent PRs serialize safely.',
        internalsDetail: 'State file is encrypted at rest with KMS and versioned so corrupted state can be rolled back.',
        stateSnapshot: 'lockId=9f2a-4c11 · holder=gha-run-882 · encrypted=KMS',
      },
      {
        step: 2,
        nodeId: 'REFRESH',
        label: 'Live Cloud API Refresh & Drift Diff',
        metricBadge: 'Detect ClickOps',
        summary: 'Terraform queries AWS/GCP APIs to refresh real-world attributes and flags any out-of-band manual firewall or IAM edits.',
        internalsDetail: 'If someone manually opened port 22 on a Security Group, plan immediately shows `~ ingress` reverting it to Git truth.',
        stateSnapshot: 'driftDetected=1 (sg-prod-db ingress port 22) · plan=+1 ~1 -0',
      },
      {
        step: 3,
        nodeId: 'DAG',
        label: 'Build Resource Dependency DAG',
        metricBadge: 'Parallel Apply · 10x',
        summary: 'Constructs a topological DAG (`VPC -> Subnets -> RDS / EKS -> IAM Policies`) to create independent resources concurrently.',
        internalsDetail: '`lifecycle { prevent_destroy = true }` and `create_before_destroy = true` block accidental DB deletion and zero-downtime swaps.',
        stateSnapshot: 'dagNodes=42 · maxParallelism=10 · preventDestroy=ON',
      },
      {
        step: 4,
        nodeId: 'APPLY',
        label: 'Signed Plan Apply & Atomic State Commit',
        metricBadge: 'Audit Trail · Release Lock',
        summary: 'Applies the exact reviewed `.tfplan` artifact after PR approval, commits new state version, and releases the remote lock.',
        internalsDetail: 'Never run blind `apply -auto-approve` on unpinned plans; save `plan -out=prod.tfplan` so reviewed changes match applied changes.',
        stateSnapshot: 'applied=2 · stateSerial=189 · lock=RELEASED',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  LOCK["1. Acquire Remote State Lock"] -->|"Read KMS tfstate"| REFRESH["2. Refresh Live Cloud APIs"]',
          '  REFRESH -->|"Compute Diff"| DAG["3. Topological Resource DAG Plan"]',
          '  DAG -->|"PR Approved .tfplan"| APPLY["4. Apply + Commit State + Unlock"]',
          '  DRIFT["Scheduled Drift Cron"] -.->|"Slack Alert on ClickOps"| REFRESH',
        ],
        ['LOCK', 'REFRESH', 'DAG', 'APPLY', 'DRIFT'],
        active,
        visited
      ),
    productionSnippetTitle: 'backend-and-lifecycle-guard.tf',
    productionSnippet: `terraform {
  backend "s3" {
    bucket       = "acme-prod-tfstate"
    key          = "network/vpc.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}
resource "aws_db_instance" "ledger" {
  lifecycle { prevent_destroy = true }
}`,
    failureModes: [
      {
        symptom: 'Monolithic 800-resource state takes 25 minutes per plan & huge blast radius',
        rootCause: 'All VPC, EKS, RDS, and IAM resources live inside one giant root Terraform state file.',
        mitigation: 'Split state by blast radius & change frequency: `network/`, `data-tier/`, `compute/`, `apps/`.',
      },
    ],
  },
  {
    id: 'cloud-vpc-networking-privatelink',
    title: 'Cloud VPC Networking: CIDR Subnets, Anycast Global LB, NAT & PrivateLink',
    category: 'Networking & Mesh',
    difficulty: 'Senior',
    plainEnglish:
      'Trace an HTTPS packet across Anycast Global Load Balancing, Public vs. Private VPC subnets, Route Tables, NAT Gateways, and PrivateLink endpoints that keep database/S3 traffic off the public internet.',
    formalDefinition:
      'Software-defined virtual private cloud routing partitioning CIDR blocks into public ingress, private compute, and isolated data tiers governed by stateful Security Groups, stateless NACLs, and private service endpoints.',
    whyGapMatters:
      'Misconfigured NAT Gateways cause surprise $20K/month data-transfer bills when pods pull S3/ECR traffic over the internet instead of VPC Gateway Endpoints, and putting DBs in public subnets invites instant compromise.',
    awsMapping: 'VPC + ALB + NAT Gateway + VPC Gateway/Interface Endpoints (PrivateLink) + Transit Gateway',
    gcpMapping: 'Global VPC + Cloud Load Balancing (Anycast) + Cloud NAT + Private Service Connect',
    openSourceMapping: 'BGP MetalLB + Cilium + WireGuard + HAProxy / Envoy',
    steps: [
      {
        step: 1,
        nodeId: 'GLB',
        label: 'Anycast Global LB & Cloud WAF',
        metricBadge: '<18ms Edge TLS',
        summary: 'User connects to nearest Anycast PoP; TLS 1.3 terminates at edge and WAF strips SQLi/DDoS before entering the cloud backbone.',
        internalsDetail: 'Traffic rides private fiber backbone from edge PoP to regional VPC instead of congested public internet hops.',
        stateSnapshot: 'edgePop=bom-01 · tls=1.3 · waf=PASS',
      },
      {
        step: 2,
        nodeId: 'PUB',
        label: 'Public Subnet Ingress (ALB / IGW)',
        metricBadge: '10.0.1.0/24 · AZ-Spread',
        summary: 'Public subnets host ONLY Load Balancers & NAT Gateways with route `0.0.0.0/0 -> Internet Gateway (IGW)`.',
        internalsDetail: 'Application servers and databases NEVER receive public IPv4 addresses.',
        stateSnapshot: 'subnet=pub-az1 · sg=allow-443-only',
      },
      {
        step: 3,
        nodeId: 'PRIV',
        label: 'Private App Subnet (No Public IP)',
        metricBadge: '10.0.16.0/20 · Pod CIDR',
        summary: 'ALB forwards requests over private RFC-1918 IPs to EKS/GKE pods inside private subnets guarded by Security Group chaining.',
        internalsDetail: 'Security Group rules allow ingress ONLY from `sg-alb`, never `0.0.0.0/0`.',
        stateSnapshot: 'podIp=10.0.19.44 · sgIngress=sg-alb:8080',
      },
      {
        step: 4,
        nodeId: 'LINK',
        label: 'PrivateLink / Gateway Endpoint vs. NAT',
        metricBadge: '$0 Egress · Private Fiber',
        summary: 'Pods reach S3, ECR, KMS, and partner SaaS via VPC Endpoints / PrivateLink—bypassing costly NAT Gateway per-GB charges.',
        internalsDetail: 'Only third-party external APIs (e.g., Stripe webhooks) exit through zonal NAT Gateways with static Elastic IPs.',
        stateSnapshot: 's3Route=vpce-gateway ($0/GB) · externalRoute=nat-az1',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  GLB["1. Anycast Global LB + WAF"] -->|"Cloud Backbone"| PUB["2. Public Subnet (ALB / IGW)"]',
          '  PUB -->|"SG Chain :8080"| PRIV["3. Private App Subnet (EKS / GKE)"]',
          '  PRIV -->|"Private Fiber ($0 NAT)"| LINK["4. VPC Endpoint / PrivateLink (S3 / KMS)"]',
          '  PRIV -->|"Isolated Data Subnet"| DB[("5. Private RDS / Cloud SQL")]',
        ],
        ['GLB', 'PUB', 'PRIV', 'LINK', 'DB'],
        active,
        visited
      ),
    productionSnippetTitle: 'vpc-privatelink-zero-nat-tax.tf',
    productionSnippet: `# Eliminate NAT Gateway data-processing charges for S3 & DynamoDB
resource "aws_vpc_endpoint" "s3_gateway" {
  vpc_id            = aws_vpc.prod.id
  service_name      = "com.amazonaws.ap-south-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.private[*].id
}`,
    failureModes: [
      {
        symptom: 'Unexpected $15K/month NAT Gateway bill',
        rootCause: 'Kubernetes pods pulling container images (ECR) and reading Parquet datasets from S3 routed through NAT Gateway ($0.045/GB) instead of VPC Endpoints.',
        mitigation: 'Attach S3 Gateway Endpoint ($0/hr) and ECR Interface Endpoints in private route tables.',
      },
    ],
  },
  {
    id: 'otel-tracing-slo-burn-rate',
    title: 'Observability Correlation: OpenTelemetry Tracing, Logs, Metrics & Multi-Window SLO Burn Rates',
    category: 'IaC & Reliability',
    difficulty: 'Staff',
    plainEnglish:
      'Watch a single `traceparent` ID link frontend latency, gateway logs, microservice spans, and slow SQL queries—and see why Google SRE multi-window burn-rate alerts eliminate pager fatigue.',
    formalDefinition:
      'Unified telemetry correlation propagating W3C TraceContext headers across distributed boundaries to join high-cardinality traces, structured JSON logs, and Prometheus exemplars into error-budget burn-rate alerting.',
    whyGapMatters:
      'Paging on "CPU > 80%" causes 3 AM false alarms when users are happy, while missing silent 2% checkout errors that burn an entire month’s 99.9% SLO error budget in 36 hours.',
    awsMapping: 'AWS Distro for OTel (ADOT) + X-Ray + Amazon Managed Prometheus & Grafana',
    gcpMapping: 'Cloud Trace + Cloud Monitoring SLO Burn-Rate Policies + Cloud Logging',
    openSourceMapping: 'OpenTelemetry Collector + Tempo/Jaeger + Prometheus + Loki + Grafana',
    steps: [
      {
        step: 1,
        nodeId: 'CTX',
        label: 'W3C traceparent Header Injection',
        metricBadge: 'traceId=4bf92f...',
        summary: 'Edge Gateway generates a 128-bit Trace ID and passes `traceparent: 00-<traceId>-<spanId>-01` through every HTTP/gRPC & Kafka header.',
        internalsDetail: 'Structured JSON logs automatically inject `trace_id` and `span_id` so one click jumps from a log line to the exact flamegraph.',
        stateSnapshot: 'traceId=4bf92f35 · span=edge-gw · sampled=tail',
      },
      {
        step: 2,
        nodeId: 'COL',
        label: 'OTel Collector & Tail-Based Sampling',
        metricBadge: '100% Errors · 2% OK',
        summary: 'OTel Collector buffers traces briefly to keep 100% of slow (>500ms) or 5xx error traces while sampling routine 200 OK traffic at 2%.',
        internalsDetail: 'Cuts observability storage bills by 90% without ever dropping the exact trace needed to debug an outage.',
        stateSnapshot: 'keptErrors=100% · keptSlow=100% · okSample=2%',
      },
      {
        step: 3,
        nodeId: 'EXEMP',
        label: 'Metrics -> Exemplars -> Trace Jump',
        metricBadge: 'P99 Spike -> SQL Span',
        summary: 'Prometheus latency histograms attach Trace ID exemplars directly onto P99 chart dots so engineers jump straight to the slow PostgreSQL lock.',
        internalsDetail: 'Eliminates manual timestamp matching across 4 separate dashboards during high-stress incidents.',
        stateSnapshot: 'p99=840ms · exemplar=4bf92f35 · culprit=FOR UPDATE lock',
      },
      {
        step: 4,
        nodeId: 'SLO',
        label: 'Multi-Window Error-Budget Burn Rate',
        metricBadge: '99.9% SLO · 14.4x Burn',
        summary: 'Pages on-call ONLY when both a 1-hour AND 5-minute window confirm 14.4x error-budget burn (2% monthly budget lost in 1 hour).',
        internalsDetail: 'Short blips auto-heal without waking engineers; real user-impacting outages page within 2 minutes.',
        stateSnapshot: 'slo=99.9% · budgetRem=88.4% · burnRate=14.4x -> PAGE',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  CTX["1. W3C traceparent Propagation"] -->|"OTLP gRPC"| COL["2. OTel Collector (Tail Sampling)"]',
          '  COL -->|"Metrics + Exemplars"| EXEMP["3. Prometheus + Tempo + Loki"]',
          '  EXEMP -->|"5m & 1h Windows"| SLO["4. Multi-Window SLO Burn-Rate Alert"]',
          '  SLO -->|"Burn > 14.4x"| PAGE["5. On-Call Page + Flamegraph Link"]',
        ],
        ['CTX', 'COL', 'EXEMP', 'SLO', 'PAGE'],
        active,
        visited
      ),
    productionSnippetTitle: 'slo-multi-window-burn-rate.yaml',
    productionSnippet: `# Page if 2% of 30-day 99.9% error budget burns in 1h (14.4x burn)
- alert: CheckoutHighErrorBudgetBurn
  expr: |
    (job:http_5xx_ratio:rate1h > (14.4 * 0.001))
    and
    (job:http_5xx_ratio:rate5m > (14.4 * 0.001))
  labels: { severity: page }`,
    failureModes: [
      {
        symptom: 'High-cardinality Prometheus label explosion OOM-kills monitoring',
        rootCause: 'Putting unbounded `user_id`, `order_id`, or raw URL paths as Prometheus metric labels creates millions of time series.',
        mitigation: 'Keep metric labels low-cardinality (`route_template`, `status_class`); put high-cardinality IDs in traces & structured logs.',
      },
    ],
  },
  {
    id: 'multi-region-dr-chaos',
    title: 'Multi-Region Active-Active DR (RPO/RTO), Failover Drills & Chaos Engineering',
    category: 'IaC & Reliability',
    difficulty: 'Staff',
    plainEnglish:
      'Simulate an entire cloud region blacking out: watch Global DNS health checks drain the dead region, Global DB promote a cross-region replica within RPO < 1s, and steady-state chaos drills verify resilience.',
    formalDefinition:
      'Geo-redundant disaster recovery balancing Recovery Point Objective (RPO — max data loss) and Recovery Time Objective (RTO — max downtime) via active-active or warm-standby replication verified by continuous chaos fault injection.',
    whyGapMatters:
      'An untested DR runbook is a rumor. Single-region architectures with untested backups routinely suffer 6-hour outages when an AWS/GCP control plane or fiber cut takes down one region.',
    awsMapping: 'Route53 ARC + Aurora Global Database + DynamoDB Global Tables + AWS FIS',
    gcpMapping: 'Cloud Spanner Multi-Region + Global Load Balancer + Cloud DNS Routing Policies',
    openSourceMapping: 'CockroachDB Geo-Partitioning + Chaos Mesh / LitmusChaos',
    steps: [
      {
        step: 1,
        nodeId: 'HEALTH',
        label: 'Multi-Region Synthetic Health Probe',
        metricBadge: 'us-east-1 DOWN',
        summary: 'Independent control-plane probes detect 3 consecutive health failures in Region A without relying on Region A’s own API.',
        internalsDetail: 'Critical SRE rule: never place failover orchestration inside the same region that might fail!',
        stateSnapshot: 'regionA=UNHEALTHY · regionB=HEALTHY · rtoClock=00:08s',
      },
      {
        step: 2,
        nodeId: 'DNS',
        label: 'Global Traffic Drain & Anycast Shift',
        metricBadge: 'RTO < 30s · 100% B',
        summary: 'Global Anycast LB / Route53 Application Recovery Controller shifts 100% of ingress traffic away from Region A to Region B.',
        internalsDetail: 'Pre-scaled warm capacity in Region B absorbs the doubled traffic immediately without waiting for cold VM boot.',
        stateSnapshot: 'trafficA=0% · trafficB=100% · warmHeadroom=OK',
      },
      {
        step: 3,
        nodeId: 'DBPROM',
        label: 'Cross-Region DB Promotion (RPO < 1s)',
        metricBadge: 'WAL Lag 180ms',
        summary: 'Region B storage replica promotes to primary writer (or Spanner/CockroachDB Raft quorum elects a surviving regional leader automatically).',
        internalsDetail: 'Fencing token prevents split-brain writes if Region A suddenly regains partial connectivity.',
        stateSnapshot: 'newPrimary=eu-west-1 · rpoDataLoss=0.18s · fencedOld=true',
      },
      {
        step: 4,
        nodeId: 'CHAOS',
        label: 'GameDay Chaos & Blameless Postmortem',
        metricBadge: 'Steady-State Verified',
        summary: 'Teams run scheduled AZ blackhole & DB latency injections in production with automatic abort triggers to verify SLO invariants continuously.',
        internalsDetail: 'Every incident produces action items with owners & automated regression chaos tests.',
        stateSnapshot: 'blastRadius=1AZ · autoAbort=p99>400ms · status=PASS',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  HEALTH["1. Independent Health Probe"] -->|"Region A Down"| DNS["2. Global Anycast / ARC Drain"]',
          '  DNS -->|"100% Traffic -> Region B"| DBPROM["3. Promote Region B Primary + Fence A"]',
          '  DBPROM -->|"RPO < 1s / RTO < 60s"| SERVE["4. Steady-State Traffic Restored"]',
          '  CHAOS["Chaos Mesh / AWS FIS Drills"] -.->|"Verify Monthly"| HEALTH',
        ],
        ['HEALTH', 'DNS', 'DBPROM', 'SERVE', 'CHAOS'],
        active,
        visited
      ),
    productionSnippetTitle: 'chaos-mesh-az-blackhole.yaml',
    productionSnippet: `apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata: { name: gameday-az-latency-drill }
spec:
  action: delay
  mode: fixed-percent
  value: "10"
  selector: { labelSelectors: { app: checkout-api } }
  delay: { latency: "180ms", jitter: "30ms" }
  duration: "5m"`,
    failureModes: [
      {
        symptom: 'Region failover succeeds, then crashes Region B in 90 seconds',
        rootCause: 'Region B only ran 20% baseline replicas and cloud quota limits blocked rapid autoscaling during the doubled load.',
        mitigation: 'Maintain N+1 regional headroom (or pre-approved capacity reservations) and run quarterly regional traffic shift drills.',
      },
    ],
  },
  {
    id: 'finops-spot-graceful-eviction',
    title: 'FinOps Cloud Cost Engineering, Rightsizing & Spot/Preemptible Graceful Eviction',
    category: 'Security & FinOps',
    difficulty: 'Senior',
    plainEnglish:
      'Cut cloud compute spend by 60–75% safely using Spot/Preemptible VMs paired with 2-minute interruption handlers, PodDisruptionBudgets, multi-family instance diversification, and ARM Graviton/Tau.',
    formalDefinition:
      'Continuous cloud financial engineering optimizing unit economics ($/1M requests) through resource rightsizing, ARM architecture migration, storage lifecycle tiering, and interruption-safe Spot compute orchestration.',
    whyGapMatters:
      'Over-provisioned Kubernetes requests (15% actual CPU utilization) and unlifecycle-tiered S3/log buckets routinely waste 40–60% of engineering cloud budgets.',
    awsMapping: 'EC2 Spot + Karpenter Consolidation + Graviton4 + Savings Plans + S3 Intelligent-Tiering',
    gcpMapping: 'GKE Spot VMs + Committed Use Discounts (CUDs) + Cloud Storage Autoclass',
    openSourceMapping: 'OpenCost / Kubecost + Goldilocks VPA + Karpenter',
    steps: [
      {
        step: 1,
        nodeId: 'METRIC',
        label: 'Unit Cost Attribution (OpenCost)',
        metricBadge: '$0.04 / 100K Req',
        summary: 'Labels every namespace, pod, and storage bucket by team/service to expose idle CPU/RAM requests and cross-AZ data transfer.',
        internalsDetail: 'Cross-AZ traffic inside a K8s cluster ($0.02/GB) often exceeds compute cost if Topology Aware Routing is disabled.',
        stateSnapshot: 'idleCpuWaste=54% · crossAzTraffic=18TB/mo',
      },
      {
        step: 2,
        nodeId: 'NOTICE',
        label: '2-Minute Spot Interruption Notice',
        metricBadge: 'T-120s Signal',
        summary: 'Cloud provider emits a 2-minute Spot reclamation webhook (`EC2 Instance Rebalance` / `GCE Preemption`) to node termination handler.',
        internalsDetail: 'Stateless web/worker pools run 70% Spot across 6+ diverse instance families (`c7g`, `c6i`, `m7g`) to prevent simultaneous eviction.',
        stateSnapshot: 'node=spot-c7g-04 · signal=RECLAIM_IN_120S',
      },
      {
        step: 3,
        nodeId: 'DRAIN',
        label: 'Cordon + PDB-Safe Drain + Replacement',
        metricBadge: '0 Dropped Requests',
        summary: 'Controller cordons the node, launches a replacement Spot/On-Demand node immediately, and drains pods respecting `PodDisruptionBudget`.',
        internalsDetail: 'Never run stateful single-replica databases or long non-checkpointed jobs on Spot instances.',
        stateSnapshot: 'pdbMinAvailable=80% · drainedPods=12/12 · 5xx=0',
      },
      {
        step: 4,
        nodeId: 'TIER',
        label: 'Storage Lifecycle & Bin-Packing Consolidation',
        metricBadge: '-62% Monthly Spend',
        summary: 'Karpenter consolidates underutilized nodes automatically while S3/GCS lifecycle rules move 30-day logs to Glacier/Archive.',
        internalsDetail: 'Combines 1-year Savings Plans/CUDs for steady baseline (40%) + Spot for elastic bursts (60%).',
        stateSnapshot: 'monthlyBill=$48K->$18.2K · unitCost=-62%',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  METRIC["1. OpenCost Unit Attribution"] -->|"Rightsize + ARM"| NOTICE["2. Spot 2-Min Reclaim Notice"]',
          '  NOTICE -->|"Cordon + Launch Replacement"| DRAIN["3. PDB-Safe Graceful Pod Drain"]',
          '  DRAIN -->|"Zero 5xx"| TIER["4. Karpenter Consolidation + Storage Tiering"]',
        ],
        ['METRIC', 'NOTICE', 'DRAIN', 'TIER'],
        active,
        visited
      ),
    productionSnippetTitle: 'pdb-and-topology-aware-finops.yaml',
    productionSnippet: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: checkout-pdb }
spec:
  minAvailable: 80%
  selector: { matchLabels: { app: checkout } }
---
# Keep K8s service traffic inside the same Availability Zone ($0 cross-AZ fee)
metadata:
  annotations:
    service.kubernetes.io/topology-mode: Auto`,
    failureModes: [
      {
        symptom: 'All Spot nodes reclaimed together during a regional capacity crunch',
        rootCause: 'NodePool pinned to only 1 instance type (`m6i.xlarge`) in 1 Availability Zone.',
        mitigation: 'Diversify across 6+ instance families & generations across 3 AZs with automatic On-Demand fallback.',
      },
    ],
  },
  {
    id: 'supply-chain-slsa-falco',
    title: 'Software Supply Chain Security (SLSA L3, SBOM, Cosign) & Runtime eBPF (Falco)',
    category: 'Security & FinOps',
    difficulty: 'Staff',
    plainEnglish:
      'Protect every byte from developer commit to running Linux kernel: keyless OIDC image signing, immutable SBOM provenance, Admission verification, and eBPF Falco alerts if a container spawns a surprise shell.',
    formalDefinition:
      'End-to-end cryptographic artifact provenance (SLSA Level 3 + CycloneDX SBOM + Sigstore Cosign) coupled with kernel-level eBPF runtime syscall intrusion detection.',
    whyGapMatters:
      'Modern attacks target CI build pipelines and transitive npm/Maven dependencies (SolarWinds/Log4j/XZ). Without signed provenance and runtime syscall monitoring, compromised binaries pass perimeter firewalls unnoticed.',
    awsMapping: 'AWS Signer + Amazon Inspector SBOM + GuardDuty Runtime Monitoring',
    gcpMapping: 'Binary Authorization + Artifact Analysis + Security Command Center',
    openSourceMapping: 'Sigstore Cosign + Syft/Grype + Kyverno + Falco eBPF',
    steps: [
      {
        step: 1,
        nodeId: 'SBOM',
        label: 'Isolated Hermetic Build + SBOM Attestation',
        metricBadge: 'SLSA L3 · CycloneDX',
        summary: 'Ephemeral CI builds a distroless image (`no bash, no curl`), generates a complete CycloneDX SBOM, and pins dependencies by SHA-256.',
        internalsDetail: 'If a new zero-day CVE drops tomorrow, querying your SBOM catalog tells you every affected service in 3 seconds.',
        stateSnapshot: 'image=checkout@sha256:9f2b... · pkgs=142 · shell=NONE',
      },
      {
        step: 2,
        nodeId: 'SIGN',
        label: 'Keyless OIDC Cosign Cryptographic Sign',
        metricBadge: 'Rekor Transparency Log',
        summary: 'CI exchanges its OIDC JWT for a 10-minute Fulcio certificate, signs the image digest, and records immutable proof in Rekor.',
        internalsDetail: 'Zero long-lived signing keys stored in CI secrets that attackers could exfiltrate.',
        stateSnapshot: 'issuer=github-oidc · rekorEntry=#948210 · verified=true',
      },
      {
        step: 3,
        nodeId: 'ADMIT',
        label: 'Cluster Admission Gate (Kyverno / Binary Auth)',
        metricBadge: 'Reject Unsigned',
        summary: 'Before any Pod starts, Kubernetes admission verifies the Cosign signature, non-root UID, and read-only root filesystem.',
        internalsDetail: 'Even a leaked `kubectl` credential cannot deploy a rogue unsigned container image.',
        stateSnapshot: 'signature=VALID · runAsNonRoot=true · readOnlyRootFs=true',
      },
      {
        step: 4,
        nodeId: 'FALCO',
        label: 'Runtime eBPF Syscall Detection (Falco)',
        metricBadge: 'Kernel Watch · <1ms',
        summary: 'eBPF probe watches Linux syscalls (`execve`, `openat`, `connect`) and auto-quarantines any pod reading `/etc/shadow` or opening reverse shells.',
        internalsDetail: 'Defense-in-depth catches zero-day RCE exploits that bypassed static CVE scanning.',
        stateSnapshot: 'ebpfProbe=ACTIVE · rule=UnexpectedShellSpawn -> ISOLATE',
      },
    ],
    buildMermaid: (active, visited) =>
      buildHighlightedMermaid(
        [
          'flowchart LR',
          '  SBOM["1. Hermetic Distroless Build + SBOM"] -->|"SHA-256 Digest"| SIGN["2. Keyless OIDC Cosign + Rekor"]',
          '  SIGN -->|"Verify Digest & Attestation"| ADMIT["3. K8s Admission Gate (Kyverno)"]',
          '  ADMIT -->|"Non-Root Read-Only Pod"| FALCO["4. Runtime eBPF Syscall Guard (Falco)"]',
        ],
        ['SBOM', 'SIGN', 'ADMIT', 'FALCO'],
        active,
        visited
      ),
    productionSnippetTitle: 'hardened-pod-security-context.yaml',
    productionSnippet: `securityContext:
  runAsNonRoot: true
  runAsUser: 65532
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities: { drop: ["ALL"] }
  seccompProfile: { type: RuntimeDefault }`,
    failureModes: [
      {
        symptom: 'Compromised container downloads crypto-miner via `curl` and writes to `/tmp`',
        rootCause: 'Base image shipped full Debian/Ubuntu utilities as root with writable filesystem.',
        mitigation: 'Use distroless/scratch images, drop `ALL` Linux capabilities, set `readOnlyRootFilesystem: true`, and monitor syscalls with Falco.',
      },
    ],
  },
];
