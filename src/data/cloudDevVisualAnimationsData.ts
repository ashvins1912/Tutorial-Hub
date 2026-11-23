export interface CloudVisualStage {
  step: number;
  title: string;
  activeNodeId: string;
  plainEnglish: string;
  runtimeState: string;
  metricBadge: string;
}

export interface CloudChapterVisualSpec {
  chapterId: string;
  formalDefinition: string;
  coreAlgorithmTitle: string;
  coreAlgorithmCode: string;
  deepImplementationNotes: string[];
  stages: CloudVisualStage[];
  buildMermaid: (activeNodeId: string | null, visitedNodeIds: string[]) => string;
}

function withActiveHighlight(
  baseMermaid: string,
  activeNodeId: string | null,
  visitedNodeIds: string[]
): string {
  const lines: string[] = [];
  for (const vid of visitedNodeIds) {
    if (vid !== activeNodeId && new RegExp(`\\b${vid}\\b`).test(baseMermaid)) {
      lines.push(`  style ${vid} fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px`);
    }
  }
  if (activeNodeId && new RegExp(`\\b${activeNodeId}\\b`).test(baseMermaid)) {
    lines.push(
      `  style ${activeNodeId} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`
    );
  }
  return lines.length > 0 ? `${baseMermaid}\n${lines.join('\n')}` : baseMermaid;
}

export const CLOUD_CHAPTER_VISUAL_SPECS: Record<string, CloudChapterVisualSpec> = {
  /* =============================== DOCKER =============================== */
  'docker-01-internals': {
    chapterId: 'docker-01-internals',
    formalDefinition:
      'A Linux container is an isolated host OS process enforced by Kernel Namespaces (PID, NET, MNT, UTS, IPC, USER), Cgroups v2 resource limits (CPU CFS quota & memory OOM boundary), and a Copy-on-Write OverlayFS union mount stacking immutable OCI image layers beneath a thin ephemeral writable layer.',
    coreAlgorithmTitle: 'OverlayFS Copy-on-Write (CoW) Layer Resolution + Cgroup v2 Quota',
    coreAlgorithmCode: `# How Linux Kernel isolates a container process on containerd startup:
clone(CLONE_NEWPID | CLONE_NEWNET | CLONE_NEWNS | CLONE_NEWUTS)
mount -t overlay overlay \\
  -o lowerdir=/oci/layer3:/oci/layer2:/oci/base,upperdir=/rw/upper,workdir=/rw/work \\
  /container/rootfs
echo "50000 100000" > /sys/fs/cgroup/pod_a/cpu.max   # 0.5 vCPU CFS quota
echo "536870912"    > /sys/fs/cgroup/pod_a/memory.max # 512 MiB hard OOM limit`,
    deepImplementationNotes: [
      'Containers share the host Linux kernel—eliminating Guest OS boot overhead so startup takes ~50 ms instead of 30 seconds for a VM.',
      'OverlayFS resolves reads top-down from `upperdir` through read-only `lowerdir` layers; modifying a file triggers a single Copy-Up into `upperdir`.',
      'Exceeding `memory.max` triggers Linux OOMKiller (Exit Code 137), whereas exceeding `cpu.max` smoothly throttles CFS scheduling slices.',
    ],
    stages: [
      { step: 1, title: 'OCI Image Layers Pulled & Verified', activeNodeId: 'OCI', plainEnglish: 'containerd pulls immutable SHA-256 content-addressed image tar layers and caches them locally.', runtimeState: 'lowerdir = base:deps:app (read-only shared across 20 containers)', metricBadge: 'SHA-256 Verified' },
      { step: 2, title: 'OverlayFS Union Mount', activeNodeId: 'OVL', plainEnglish: 'Linux mounts read-only image layers under a thin writable upperdir so the app sees one unified root filesystem.', runtimeState: 'Merged /rootfs ready · CoW copy-up armed', metricBadge: '0 MB Duplicated' },
      { step: 3, title: 'Namespaces Isolation Applied', activeNodeId: 'NS', plainEnglish: 'Kernel clones PID, NET, and MNT namespaces so the app sees itself as PID 1 with its own virtual eth0 IP.', runtimeState: 'veth0 <-> docker0 bridge · Isolated PID 1', metricBadge: '~15 ms Setup' },
      { step: 4, title: 'Cgroups v2 Resource Enforcement', activeNodeId: 'CG', plainEnglish: 'Kernel attaches CPU quota and hard memory limits so one noisy container cannot starve host neighbors.', runtimeState: 'cpu.max = 500m · memory.max = 512Mi · Running', metricBadge: 'Exit 137 Guard' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  CLI["Docker CLI"] -->|"gRPC"| CT["containerd + runc"]
  CT -->|"Pull SHA256"| OCI[("Immutable OCI Layers")]
  OCI -->|"lowerdir + upperdir"| OVL["OverlayFS Union Rootfs"]
  OVL -->|"clone() Syscall"| NS["Linux Namespaces: PID NET MNT"]
  NS -->|"Resource Guard"| CG["Cgroups v2 CPU & Memory Quota"]
  CG -->|"Isolated Process"| APP["Container PID 1 App"]`,
        active,
        visited
      ),
  },
  'docker-02-multistage-compose': {
    chapterId: 'docker-02-multistage-compose',
    formalDefinition:
      'Multi-stage Dockerfiles decouple heavy build-time SDKs from minimal production runtime images via content-addressed BuildKit DAG caching, while Docker Compose provisions an isolated user-defined bridge network with embedded DNS (`127.0.0.11`) and healthcheck-ordered service startup.',
    coreAlgorithmTitle: 'BuildKit Content-Addressable DAG Layer Cache + Compose Healthcheck Wait',
    coreAlgorithmCode: `# BuildKit executes independent stages in parallel & hashes each instruction + inputs:
# Hash(COPY pom.xml) unchanged -> 100% cache hit on RUN mvn dependency:go-offline!
services:
  api:
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }`,
    deepImplementationNotes: [
      'Ordering `COPY lockfile` + `RUN install` BEFORE `COPY src/` ensures 1-line code edits rebuild in ~4 seconds instead of re-downloading 300 MB of dependencies.',
      'Stage 2 (`FROM distroless` or `slim`) copies only compiled artifacts, cutting image size by 85–92% and removing gcc, curl, and bash.',
      'Compose embedded DNS resolves `postgres:5432` and `redis:6379` automatically across the bridge subnet without hardcoded host IPs.',
    ],
    stages: [
      { step: 1, title: 'Stage 1 Builder Compiles Binary/Deps', activeNodeId: 'BLD', plainEnglish: 'BuildKit caches lockfile dependency layers and compiles the production binary or virtualenv.', runtimeState: 'Cache HIT on lockfile · Rebuilt only src/ layer (3.8s)', metricBadge: 'BuildKit DAG' },
      { step: 2, title: 'Stage 2 Distroless Runtime Copy', activeNodeId: 'RUN', plainEnglish: 'Only the compiled binary is copied into a tiny non-root runtime image with zero build tools.', runtimeState: '980 MB -> 74 MB (-92% size) · UID 10001 nonroot', metricBadge: '74 MB Final' },
      { step: 3, title: 'Compose Bridge & Embedded DNS', activeNodeId: 'NET', plainEnglish: 'Docker Compose boots Postgres & Redis first, verifies healthchecks, and registers DNS service names.', runtimeState: '127.0.0.11 resolves api -> postgres:5432 & redis:6379', metricBadge: 'Health Gated' },
      { step: 4, title: 'Live Local Microservices Traffic', activeNodeId: 'DB', plainEnglish: 'API container connects over the isolated bridge with persistent named volumes preserving DB data.', runtimeState: 'Named volume pgdata mounted · Live traffic healthy', metricBadge: 'Zero Host Drift' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  SRC["Source + Lockfile"] -->|"Cached Lock Layer"| BLD["Stage 1: BuildKit Compiler"]
  BLD -->|"COPY --from=builder"| RUN["Stage 2: Non-Root Slim/Distroless"]
  RUN -->|"Compose Bridge DNS"| NET["API Container :8000"]
  NET -->|"redis:6379"| RED[("Redis Cache")]
  NET -->|"postgres:5432"| DB[("Postgres + Named Volume")]`,
        active,
        visited
      ),
  },
  'docker-03-security-supply-chain': {
    chapterId: 'docker-03-security-supply-chain',
    formalDefinition:
      'Defense-in-depth container security combines BuildKit ephemeral secret mounts (`--mount=type=secret`), read-only root filesystems, Linux capability dropping (`cap_drop: ALL`), Trivy CVE + CycloneDX SBOM attestation, and keyless Cosign cryptographic digest signing.',
    coreAlgorithmTitle: 'BuildKit Tmpfs Secret Mount + Cosign Rekor Transparency Verification',
    coreAlgorithmCode: `# Secrets exist ONLY in RAM tmpfs during this single RUN step — never baked into image layers!
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci --omit=dev
# Verify keyless OIDC signature against immutable SHA-256 digest before prod deploy:
cosign verify --certificate-identity-regexp "github.com/org/repo" \\
  registry.internal/api@sha256:9f2c...`,
    deepImplementationNotes: [
      'Using `ARG` or `ENV` for tokens leaves plaintext secrets permanently visible in `docker history` even if deleted in a later `RUN rm`.',
      'Dropping all Linux capabilities (`ALL`) and setting `readOnlyRootFilesystem: true` neutralizes 95% of post-exploitation container breakouts.',
      'Pinning deployments to `@sha256:` digests + OPA/Kyverno Cosign verification guarantees no tampered `:latest` image can ever enter production.',
    ],
    stages: [
      { step: 1, title: 'BuildKit RAM Secret Mount', activeNodeId: 'SEC', plainEnglish: 'Private registry credentials mount transiently in RAM during `RUN` and vanish before the layer commits.', runtimeState: '0 secrets in docker history · Non-root UID 10001', metricBadge: 'Zero Leak' },
      { step: 2, title: 'SBOM + Trivy CVE Gate', activeNodeId: 'SCAN', plainEnglish: 'Syft generates a CycloneDX software bill of materials and Trivy blocks any Critical/High CVEs.', runtimeState: '0 Critical CVEs · SBOM attached to OCI manifest', metricBadge: 'SLSA L3' },
      { step: 3, title: 'Cosign OIDC Keyless Signing', activeNodeId: 'SIGN', plainEnglish: 'CI signs the immutable SHA-256 digest via Fulcio/Rekor transparency log without storing long-lived private keys.', runtimeState: 'Digest sha256:9f2c signed & logged in Rekor', metricBadge: 'Tamper-Proof' },
      { step: 4, title: 'Hardened Runtime Admission', activeNodeId: 'ADM', plainEnglish: 'Cluster verifies Cosign signature and launches pod with read-only rootfs, seccomp, and `cap_drop: ALL`.', runtimeState: 'Signature OK · ReadOnlyRootFS · Seccomp Active', metricBadge: 'Zero-Trust' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  SEC["BuildKit tmpfs Secret Mount"] -->|"Immutable Tar"| SCAN["Syft SBOM + Trivy CVE Gate"]
  SCAN -->|"0 Critical CVEs"| SIGN["Cosign Keyless OIDC Sign"]
  SIGN -->|"Push @sha256"| REG[("OCI Registry + Attestation")]
  REG -->|"Admission Verify"| ADM["Hardened Pod: Non-Root + ReadOnlyFS"]`,
        active,
        visited
      ),
  },

  /* ============================= KUBERNETES ============================= */
  'k8s-01-architecture-workloads': {
    chapterId: 'k8s-01-architecture-workloads',
    formalDefinition:
      'Kubernetes is a declarative control-loop orchestrator where `kube-apiserver` persists desired state in `etcd` (Raft consensus), `kube-scheduler` binds Pods via Filter/Score plugins, and `kubelet` reconciles container lifecycles using Startup, Readiness, and Liveness probes.',
    coreAlgorithmTitle: 'K8s Declarative Level-Triggered Reconciliation Loop + Probe State Machine',
    coreAlgorithmCode: `// Controller Reconciliation Loop (Deployment -> ReplicaSet -> Pods)
for event := range watchEtcd("deployments") {
  desired := event.Spec.Replicas
  actual  := countReadyPods(event.Selector)
  if actual < desired { createPod(event.Template) }
  if actual > desired { drainAndTerminateOldestPod() }
  // Readiness fail -> strip IP from EndpointSlice (0 dropped traffic!)
  // Liveness fail  -> SIGTERM + restart container with backoff
}`,
    deepImplementationNotes: [
      'Never point a Liveness probe at an external database—if Postgres blips, K8s will simultaneously restart every healthy API pod into a crash storm.',
      'Readiness probes remove unready pods from Service EndpointSlices cleanly; pair with `preStop: sleep 5` to drain in-flight connections before `SIGTERM`.',
      'Always set `requests` equal to realistic baseline usage (drives scheduling) and `memory limits` to prevent host-wide OOM.',
    ],
    stages: [
      { step: 1, title: 'Declarative Apply -> API Server & etcd', activeNodeId: 'API', plainEnglish: '`kubectl apply` authenticates, passes admission webhooks, and persists desired replicas into Raft-backed etcd.', runtimeState: 'Deployment desired=3 persisted in etcd', metricBadge: 'Raft Quorum' },
      { step: 2, title: 'Scheduler Filter & Bin-Pack Score', activeNodeId: 'SCH', plainEnglish: 'kube-scheduler filters nodes with enough CPU/RAM and scores them for multi-AZ topology spread.', runtimeState: 'Pod bound to Worker Node AZ-2 (Score: 94/100)', metricBadge: 'Multi-AZ Spread' },
      { step: 3, title: 'Kubelet Starts Pod + Probes', activeNodeId: 'KUB', plainEnglish: 'kubelet pulls image via containerd, passes Startup & Readiness checks, and opens traffic.', runtimeState: 'Readiness /readyz 200 OK · Added to EndpointSlice', metricBadge: 'Zero-Downtime' },
      { step: 4, title: 'Self-Healing Watch Loop', activeNodeId: 'CTL', plainEnglish: 'If any pod crashes or fails probes, the controller immediately strips its endpoint and spawns a replacement.', runtimeState: 'Unhealthy pod isolated -> Replica replaced in 3.2s', metricBadge: 'Self-Healing' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  DEV["kubectl / ArgoCD"] -->|"HTTPS YAML"| API["kube-apiserver"]
  API <-->|"Raft Persist"| ETCD[("etcd State Store")]
  API -->|"Watch Unscheduled"| SCH["kube-scheduler: Filter & Score"]
  API -->|"Reconcile Replicas"| CTL["Controller Manager"]
  SCH -->|"Bind Pod"| KUB["Worker kubelet + Probes"]
  KUB -->|"Ready IP"| EP["Service EndpointSlice"]`,
        active,
        visited
      ),
  },
  'k8s-02-networking-services-ingress': {
    chapterId: 'k8s-02-networking-services-ingress',
    formalDefinition:
      'Kubernetes assigns every Pod a routable IP via CNI (Cilium eBPF/Calico), abstracts ephemeral Pod IPs behind stable ClusterIP virtual IPs and CoreDNS (`svc.ns.svc.cluster.local`), and terminates external TLS/L7 routing at Ingress or Gateway API HTTPRoutes.',
    coreAlgorithmTitle: 'Cilium eBPF O(1) Service Map Lookup vs. iptables O(N) Chain Walk',
    coreAlgorithmCode: `# External Request -> Cloud L7 LB -> Gateway API HTTPRoute -> ClusterIP eBPF Map -> Pod
# CoreDNS resolves: orders-api.prod.svc.cluster.local -> 10.96.14.22 (ClusterIP)
# Cilium eBPF BPF_MAP_TYPE_HASH performs O(1) DNAT directly in Linux socket layer:
#   10.96.14.22:80 -> 10.244.2.19:8080 (Ready Pod in local AZ via Topology Aware Routing)`,
    deepImplementationNotes: [
      'Traditional `kube-proxy` iptables chains degrade linearly O(N) past ~5,000 Services; Cilium eBPF uses O(1) kernel hash maps directly at the socket hook.',
      'Gateway API (`Gateway` + `HTTPRoute`) replaces annotation-heavy Ingress with role-oriented weighted canary splits, header matching, and cross-namespace TLS.',
      'Default-deny `NetworkPolicy` restricts east-west traffic so a compromised frontend pod cannot scan internal database ports.',
    ],
    stages: [
      { step: 1, title: 'External TLS & L7 Gateway API', activeNodeId: 'ING', plainEnglish: 'Cloud Load Balancer forwards HTTPS into Gateway API, which terminates TLS and evaluates path/weight rules.', runtimeState: 'HTTPRoute /api/v1 -> 90% v1 / 10% canary-v2', metricBadge: 'L7 Gateway API' },
      { step: 2, title: 'CoreDNS Service Discovery', activeNodeId: 'DNS', plainEnglish: 'Internal pods resolve `orders.prod.svc.cluster.local` to a stable virtual ClusterIP in <1 ms.', runtimeState: 'CoreDNS cache hit -> 10.96.14.22', metricBadge: '<1 ms Lookup' },
      { step: 3, title: 'eBPF / kube-proxy EndpointSlice DNAT', activeNodeId: 'SVC', plainEnglish: 'Kernel eBPF rewrites destination ClusterIP to a healthy Ready Pod IP in the same AZ (saving cross-AZ cost).', runtimeState: 'O(1) eBPF DNAT -> 10.244.2.19:8080 (Same AZ)', metricBadge: 'O(1) eBPF' },
      { step: 4, title: 'NetworkPolicy Zero-Trust Guard', activeNodeId: 'POD', plainEnglish: 'Cilium enforces L3/L4/L7 NetworkPolicy before packet enters the target container namespace.', runtimeState: 'Policy ALLOW app=gateway -> app=orders:8080', metricBadge: 'mTLS Verified' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  USR["Internet Client"] -->|"HTTPS TLS 1.3"| ING["Ingress / Gateway API HTTPRoute"]
  ING -->|"Lookup"| DNS["CoreDNS Cluster Resolver"]
  ING -->|"ClusterIP VIP"| SVC["eBPF / kube-proxy EndpointSlice"]
  SVC -->|"NetworkPolicy OK"| POD["Ready Pod AZ-1 :8080"]
  SVC -.->|"Failover Same-Pool"| POD2["Ready Pod AZ-2 :8080"]`,
        active,
        visited
      ),
  },
  'k8s-03-config-secrets-autoscaling': {
    chapterId: 'k8s-03-config-secrets-autoscaling',
    formalDefinition:
      'Production K8s resilience decouples configuration via External Secrets Operator (syncing AWS/GCP Secrets Manager into RAM tmpfs), scales pods with HPA/KEDA (`desired = ceil(current * metric / target)`), scales nodes via Karpenter, and guarantees availability during upgrades with PodDisruptionBudgets (PDB).',
    coreAlgorithmTitle: 'Kubernetes HPA Scaling Formula + Stabilization Window Anti-Thrashing',
    coreAlgorithmCode: `# Exact HPA v2 Control Formula (evaluated every 15s by kube-controller-manager):
desiredReplicas = ceil(currentReplicas * (currentMetricValue / desiredMetricValue))
# Example: 4 pods at 92% CPU vs 65% target -> ceil(4 * 92 / 65) = 6 pods immediately
# Scale-down waits stabilizationWindowSeconds (300s) to prevent flapping during spiky traffic!`,
    deepImplementationNotes: [
      'Never commit base64 Kubernetes Secrets to Git—External Secrets Operator pulls short-lived credentials from KMS/Vault via OIDC Workload Identity.',
      'CPU-based HPA reacts too slowly for queue consumers; use KEDA to scale directly on Kafka consumer lag or SQS queue depth.',
      'Always define a `PodDisruptionBudget` (`minAvailable: 2` or `maxUnavailable: 1`) so node upgrades never evict all replicas simultaneously.',
    ],
    stages: [
      { step: 1, title: 'External Secrets Sync (Zero Git Secrets)', activeNodeId: 'ESO', plainEnglish: 'External Secrets Operator authenticates via OIDC and syncs rotated DB passwords into memory-backed K8s Secrets.', runtimeState: 'Secret synced from Cloud Secrets Manager (rotated 1h)', metricBadge: 'OIDC Sync' },
      { step: 2, title: 'Metrics / Queue Depth Collected', activeNodeId: 'MET', plainEnglish: 'Metrics Server & Prometheus/KEDA expose real-time pod CPU, RPS, and Kafka lag every 15 seconds.', runtimeState: 'Pod CPU 92% > 65% target · Queue lag 4,200 msgs', metricBadge: '15s Control Loop' },
      { step: 3, title: 'HPA / KEDA Scales Pods + Karpenter Node', activeNodeId: 'HPA', plainEnglish: 'HPA computes `ceil(4 * 92/65) = 6` replicas; if Pending, Karpenter provisions a right-sized Spot/On-Demand node in ~40s.', runtimeState: 'Replicas 4 -> 6 · Stabilization scale-down 300s', metricBadge: 'Auto-Scaled' },
      { step: 4, title: 'PDB Guards Rolling Evictions', activeNodeId: 'PDB', plainEnglish: 'During node drains or Spot interruptions, PodDisruptionBudget enforces `minAvailable: 2` to prevent downtime.', runtimeState: 'Drain blocked until replacement Ready (0% 5xx)', metricBadge: 'Zero Downtime' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  KMS[("AWS/GCP Secrets Manager")] -->|"OIDC Sync"| ESO["External Secrets Operator"]
  MET["Metrics Server / KEDA Lag"] -->|"15s Loop"| HPA["HPA / KEDA Autoscaler"]
  HPA -->|"Scale 4 -> 6"| DEP["Deployment Replicas"]
  ESO -->|"RAM tmpfs Mount"| DEP
  DEP -->|"Pending Pod"| KARP["Karpenter Node Provisioner"]
  PDB["PodDisruptionBudget"] -.->|"Guards Node Drain"| DEP`,
        active,
        visited
      ),
  },

  /* =============================== AWS DEV =============================== */
  'aws-01-iam-compute': {
    chapterId: 'aws-01-iam-compute',
    formalDefinition:
      'AWS IAM enforces default-deny least-privilege access using short-lived STS credentials assumed via OIDC/IRSA (never static access keys), routing workloads across Lambda (event bursts), ECS Fargate (zero-node containers), and EKS (full K8s control plane).',
    coreAlgorithmTitle: 'AWS IAM Policy Evaluation Order + SigV4 Request Signing',
    coreAlgorithmCode: `# Exact AWS IAM Evaluation Algorithm (Short-Circuits on First Explicit Deny!):
1. Explicit DENY in SCP / Permission Boundary / Resource Policy / Identity Policy -> DENY
2. Check Organization SCP allows action (if applicable)
3. Check Identity Policy OR Resource Policy has Explicit ALLOW -> ALLOW
4. Otherwise -> IMPLICIT DENY (Default Zero-Trust)
# SDK signs every API call with short-lived STS token via HMAC-SHA256 (SigV4)`,
    deepImplementationNotes: [
      'Explicit DENY always overrides Explicit ALLOW—making Organization SCPs the ultimate safety guardrail against accidental public buckets.',
      'Choose Lambda for spiky/event-driven handlers (<15 min), ECS Fargate for low-ops steady microservices, and EKS when you need multi-cloud K8s or custom operators.',
      'Use Lambda SnapStart (Java) or Provisioned Concurrency to eliminate cold-start p99 spikes on latency-sensitive APIs.',
    ],
    stages: [
      { step: 1, title: 'OIDC / IRSA STS Token Exchange', activeNodeId: 'STS', plainEnglish: 'Pod or Lambda assumes an IAM Role via STS and receives temporary 1-hour credentials with zero hardcoded keys.', runtimeState: 'STS AssumeRoleWithWebIdentity -> Temp Key + SessionToken', metricBadge: 'Zero Static Keys' },
      { step: 2, title: 'IAM Policy Evaluation Engine', activeNodeId: 'IAM', plainEnglish: 'AWS evaluates Explicit Deny -> SCP -> Identity/Resource Allow before permitting any API call.', runtimeState: 'SigV4 Valid · Least-Privilege s3:GetObject ALLOWED', metricBadge: 'Default Deny' },
      { step: 3, title: 'ALB / API Gateway Traffic Dispatch', activeNodeId: 'ALB', plainEnglish: 'Incoming HTTPS routes to Lambda (bursty), ECS Fargate (containers), or EKS pods across multiple AZs.', runtimeState: 'Multi-AZ Routing · Health Probes Green', metricBadge: 'Multi-AZ HA' },
      { step: 4, title: 'Private VPC Endpoint Data Access', activeNodeId: 'CMP', plainEnglish: 'Compute talks to S3/DynamoDB over AWS PrivateLink VPC Endpoints without paying NAT Gateway egress fees.', runtimeState: 'VPC Gateway Endpoint active · 0 Internet hops', metricBadge: 'Zero NAT Tax' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  USR["Client App"] -->|"HTTPS"| ALB["API Gateway / AWS ALB"]
  ALB -->|"Route"| CMP["Lambda / ECS Fargate / EKS"]
  CMP -->|"AssumeRole OIDC"| STS["AWS STS Temp Credentials"]
  STS -->|"SigV4 Eval"| IAM{"IAM Policy Engine"}
  IAM -->|"PrivateLink"| DATA[("S3 / DynamoDB / Aurora")]`,
        active,
        visited
      ),
  },
  'aws-02-s3-dynamodb-rds': {
    chapterId: 'aws-02-s3-dynamodb-rds',
    formalDefinition:
      'High-scale AWS data architectures bypass app servers for binary uploads via S3 Presigned URLs, deliver single-digit-millisecond key-value access on DynamoDB (partition-key consistent hashing + conditional writes), and run ACID relational workloads on Multi-AZ Aurora with RDS Proxy connection pooling.',
    coreAlgorithmTitle: 'Direct-to-S3 Presigned URL + DynamoDB Single-Table Composite Key & OCC',
    coreAlgorithmCode: `// 1. Offload 500 MB uploads directly from browser -> S3 (0 bytes through API RAM!)
const putUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), { expiresIn: 300 });
// 2. DynamoDB Optimistic Concurrency Control (Prevent Lost Updates):
await ddb.send(new UpdateItemCommand({
  TableName: "Orders", Key: { PK: { S: "TENANT#42" }, SK: { S: "ORD#901" } },
  UpdateExpression: "SET #st = :paid, ver = ver + :one",
  ConditionExpression: "ver = :expectedVer" // Atomic compare-and-swap!
}));`,
    deepImplementationNotes: [
      'Streaming user uploads through Lambda/ECS wastes memory and bandwidth; Presigned URLs let browsers upload directly to S3 with 11-nines durability.',
      'DynamoDB single-table design collocates related entities under one Partition Key (`PK = TENANT#42`) so 1 `Query` fetches an entire aggregate in <5 ms without joins.',
      'Place RDS Proxy in front of Aurora PostgreSQL whenever Lambda connects, preventing 5,000 concurrent Lambdas from exhausting `max_connections`.',
    ],
    stages: [
      { step: 1, title: 'Presigned S3 Direct Upload', activeNodeId: 'S3', plainEnglish: 'API signs a 5-minute S3 URL; client uploads media straight to S3, triggering an S3 Event notification.', runtimeState: 'Direct Browser -> S3 PUT · 0 MB API RAM used', metricBadge: '99.999999999% Dur' },
      { step: 2, title: 'DynamoDB Partition Hash Lookup', activeNodeId: 'DDB', plainEnglish: 'API queries DynamoDB by composite `PK + SK` with optimistic `ConditionExpression` in <4 ms.', runtimeState: 'Single-digit ms read · Partition evenly hashed', metricBadge: '<4 ms p99' },
      { step: 3, title: 'RDS Proxy Multiplexes Connections', activeNodeId: 'PRX', plainEnglish: 'RDS Proxy pools thousands of Lambda/Fargate sockets onto a bounded Aurora connection pool.', runtimeState: '2,400 Lambda sockets -> 60 Aurora backends', metricBadge: 'Pool Protected' },
      { step: 4, title: 'Aurora Distributed Storage Quorum', activeNodeId: 'AUR', plainEnglish: 'Aurora writes redo logs to 6 storage copies across 3 AZs (4/6 quorum), enabling <30s Multi-AZ failover.', runtimeState: '4/6 Quorum ACK · Shared storage replica lag <10ms', metricBadge: '3-AZ Quorum' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  CLI["Web / Mobile Client"] -->|"Presigned PUT"| S3[("Amazon S3 + CloudFront")]
  CLI -->|"REST / gRPC"| API["Compute: Lambda / Fargate"]
  API -->|"PK + SK <4ms"| DDB[("DynamoDB On-Demand")]
  API -->|"Pooled SQL"| PRX["Amazon RDS Proxy"]
  PRX -->|"4/6 Storage Quorum"| AUR[("Aurora Multi-AZ Primary & Replica")]`,
        active,
        visited
      ),
  },
  'aws-03-event-driven-sqs-sns-observability': {
    chapterId: 'aws-03-event-driven-sqs-sns-observability',
    formalDefinition:
      'Resilient AWS event-driven architectures pair SNS topic fan-out with durable SQS queues (Visibility Timeout leases + Dead-Letter Queues), EventBridge schema routing, and OpenTelemetry/X-Ray distributed trace correlation in CloudWatch.',
    coreAlgorithmTitle: 'SNS Fan-Out -> SQS Partial Batch Failure Reporting + DLQ Redrive',
    coreAlgorithmCode: `// AWS Lambda SQS Handler with ReportBatchItemFailures (Never reprocess 9 good messages!)
export const handler = async (event: SQSEvent) => {
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const record of event.Records) {
    try { await processIdempotently(record.messageId, JSON.parse(record.body)); }
    catch { batchItemFailures.push({ itemIdentifier: record.messageId }); }
  }
  return { batchItemFailures }; // Only failed IDs retry -> maxReceiveCount routes to DLQ
};`,
    deepImplementationNotes: [
      'Always enable `ReportBatchItemFailures` on SQS Lambda triggers—otherwise 1 poison message in a batch of 10 retries all 9 already-succeeded messages.',
      'Set SQS Visibility Timeout to at least 6× your Lambda timeout so in-flight messages never become visible twice to another consumer.',
      'Attach a CloudWatch Alarm on `ApproximateNumberOfMessagesVisible > 0` for every Dead-Letter Queue (DLQ) so silent drops never go unnoticed.',
    ],
    stages: [
      { step: 1, title: 'SNS Topic Fan-Out Broadcast', activeNodeId: 'SNS', plainEnglish: 'Order service publishes 1 event to SNS; filter policies fan it out simultaneously to Billing, Email, and Analytics SQS queues.', runtimeState: '1 Publish -> 3 Decoupled Subscriber Queues', metricBadge: 'Fan-Out Pattern' },
      { step: 2, title: 'SQS Buffering & Visibility Lease', activeNodeId: 'SQS', plainEnglish: 'SQS absorbs 10× traffic spikes and leases batches to consumers with a 6× Visibility Timeout.', runtimeState: 'Queue Depth 12,400 · BatchSize=10 · Zero drop', metricBadge: 'Spike Absorbed' },
      { step: 3, title: 'Idempotent Worker + DLQ Guard', activeNodeId: 'DLQ', plainEnglish: 'Poison-pill messages failing 3 times move automatically to the Dead-Letter Queue for safe inspection & redrive.', runtimeState: 'Partial batch failures isolated · DLQ alarm armed', metricBadge: 'DLQ Protected' },
      { step: 4, title: 'X-Ray & CloudWatch OTel Trace', activeNodeId: 'OBS', plainEnglish: 'W3C Traceparent headers stitch API -> SNS -> SQS -> Worker -> DB into one waterfall trace.', runtimeState: 'Trace ID stitched · EMF structured JSON metrics', metricBadge: 'Full Traceability' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  SVC["Order Microservice"] -->|"Publish Event"| SNS["Amazon SNS Fan-Out Topic"]
  SNS -->|"Filter Policy"| SQS["Amazon SQS Standard / FIFO"]
  SQS -->|"Batch + Lease"| WRK["Lambda / ECS Consumers"]
  SQS -.->|"maxReceiveCount > 3"| DLQ[("SQS Dead-Letter Queue")]
  WRK -->|"W3C Trace + EMF"| OBS["CloudWatch + AWS X-Ray / OTel"]`,
        active,
        visited
      ),
  },

  /* =============================== GCP DEV =============================== */
  'gcp-01-iam-cloudrun-gke': {
    chapterId: 'gcp-01-iam-cloudrun-gke',
    formalDefinition:
      'GCP enforces hierarchical IAM across Organization -> Folder -> Project -> Resource using keyless Workload Identity Federation (OIDC), serving containerized APIs via Cloud Run (Knative request-concurrency scale-to-zero revisions) or GKE Autopilot (managed hardened Kubernetes).',
    coreAlgorithmTitle: 'Cloud Run Knative Concurrency Autoscaler + Immutable Revision Traffic Split',
    coreAlgorithmCode: `# Cloud Run computes exact container count from concurrent requests (not just 1 req/instance!):
desiredInstances = ceil(concurrentInFlightRequests / containerConcurrency) # e.g. 80 reqs/pod
# Instant zero-downtime canary & rollback via immutable revisions:
gcloud run services update-traffic orders-api \\
  --to-revisions=orders-api-00042=90,orders-api-00043=10`,
    deepImplementationNotes: [
      'Never export JSON Service Account key files (`GOOGLE_APPLICATION_CREDENTIALS`)—use Workload Identity Federation (GitHub OIDC / GKE WIF) for short-lived federated tokens.',
      'Unlike single-request FaaS, one Cloud Run container handles 80–250 concurrent async requests, slashing cold starts and cost.',
      'Set `--min-instances=1` on latency-critical Cloud Run services to keep 1 warm instance ready at all times.',
    ],
    stages: [
      { step: 1, title: 'Global Anycast Load Balancer', activeNodeId: 'GLB', plainEnglish: 'Google Global External LB terminates TLS at Google edge PoPs and routes across a single global Anycast IP.', runtimeState: 'Anycast IP -> Cloud Armor WAF -> Nearest Region', metricBadge: 'Global Anycast' },
      { step: 2, title: 'Cloud Run Revision Split / GKE', activeNodeId: 'RUN', plainEnglish: 'Cloud Run routes 90% to stable revision and 10% to canary, scaling concurrency up/down in seconds.', runtimeState: 'Concurrency 80/inst · Autoscaling 1 -> 14 pods', metricBadge: 'Scale-to-Zero' },
      { step: 3, title: 'Workload Identity OIDC Exchange', activeNodeId: 'WIF', plainEnglish: 'Metadata server issues short-lived OAuth2 tokens bound to the attached Service Account with zero JSON key files.', runtimeState: 'Short-lived OIDC token minted (0 key files)', metricBadge: 'Keyless IAM' },
      { step: 4, title: 'Private Service Connect Data Plane', activeNodeId: 'DATA', plainEnglish: 'Services reach Cloud SQL, GCS, and BigQuery over private Google backbone routes.', runtimeState: 'Private VPC Access · Zero public DB IP', metricBadge: 'Private Backbone' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  USR["Global User"] -->|"Anycast HTTPS"| GLB["Cloud Load Balancing + Cloud Armor"]
  GLB -->|"90/10 Revision Split"| RUN["Cloud Run / GKE Autopilot"]
  RUN -->|"Metadata OIDC"| WIF["Workload Identity Federation"]
  WIF -->|"Least-Privilege IAM"| DATA[("GCS / Cloud SQL / BigQuery")]`,
        active,
        visited
      ),
  },
  'gcp-02-storage-sql-bigquery': {
    chapterId: 'gcp-02-storage-sql-bigquery',
    formalDefinition:
      'GCP’s developer data plane combines Google Cloud Storage V4 Signed URLs for object streaming, Cloud SQL Auth Proxy (automatic IAM + mTLS tunneling) for PostgreSQL/MySQL OLTP, Firestore for real-time mobile sync, and BigQuery Capacitor columnar serverless analytics.',
    coreAlgorithmTitle: 'BigQuery Partition & Cluster Pruning + Cloud SQL Auth Proxy mTLS',
    coreAlgorithmCode: `-- BigQuery Serverless Columnar Query: ALWAYS filter on Partition + Cluster keys!
-- Cuts bytes scanned from 12 TB ($75) down to 180 MB ($0.001) via Capacitor metadata pruning:
SELECT tenant_id, COUNT(*) AS orders, SUM(amount_cents) AS rev
FROM \`prod.analytics.order_events\`
WHERE event_date BETWEEN '2026-11-01' AND '2026-11-23'  -- Partition Pruning!
  AND tenant_id = 'acme_corp'                          -- Cluster Block Pruning!
GROUP BY tenant_id;`,
    deepImplementationNotes: [
      'Cloud SQL Auth Proxy auto-rotates ephemeral TLS certificates and authenticates via IAM—never whitelist `0.0.0.0/0` on your Cloud SQL firewall.',
      'BigQuery charges per byte scanned; always partition tables by date, cluster by high-cardinality filter keys, and never run `SELECT *` in production.',
      'Use BigQuery Storage Write API (gRPC streaming) instead of legacy streaming inserts for higher throughput and exactly-once offsets.',
    ],
    stages: [
      { step: 1, title: 'GCS V4 Signed URL Direct Transfer', activeNodeId: 'GCS', plainEnglish: 'Clients upload large files straight to Cloud Storage via V4 Signed URLs without proxying bytes through Cloud Run.', runtimeState: 'Direct GCS PUT · Dual-Region 99.999999999% durability', metricBadge: 'Direct Upload' },
      { step: 2, title: 'Cloud SQL Auth Proxy mTLS Tunnel', activeNodeId: 'SQL', plainEnglish: 'Sidecar Auth Proxy establishes an IAM-authenticated mTLS tunnel into Regional HA Cloud SQL PostgreSQL.', runtimeState: 'mTLS auto-rotated · Regional HA standby synced', metricBadge: 'Zero Static Certs' },
      { step: 3, title: 'Firestore Real-Time Client Sync', activeNodeId: 'FS', plainEnglish: 'Mobile/Web SDKs subscribe to Firestore document snapshots with offline persistence and multi-region replication.', runtimeState: 'WebChannel push latency <40 ms · Offline cache OK', metricBadge: 'Live Snapshots' },
      { step: 4, title: 'BigQuery Columnar Analytics Pruning', activeNodeId: 'BQ', plainEnglish: 'OLTP events stream via Datastream/PubSub into partitioned & clustered BigQuery Capacitor tables.', runtimeState: 'Pruned 99.8% bytes · Serverless slots autoscaled', metricBadge: 'Petabyte OLAP' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  CLI["Web / Mobile Client"] -->|"V4 Signed URL"| GCS[("Cloud Storage Bucket")]
  CLI -->|"HTTPS"| APP["Cloud Run / GKE Service"]
  APP -->|"Auth Proxy mTLS"| SQL[("Cloud SQL Regional HA")]
  APP -->|"Realtime Sync"| FS[("Cloud Firestore")]
  SQL -.->|"Datastream CDC"| BQ[("BigQuery Columnar OLAP")]`,
        active,
        visited
      ),
  },
  'gcp-03-pubsub-eventarc-observability': {
    chapterId: 'gcp-03-pubsub-eventarc-observability',
    formalDefinition:
      'GCP decouples microservices with globally replicated Cloud Pub/Sub (at-least-once / exactly-once subscriptions + dead-letter topics + ordering keys), Cloud Tasks for rate-controlled HTTP dispatch, and Cloud Trace / Cloud Logging correlated by W3C Traceparent.',
    coreAlgorithmTitle: 'Pub/Sub Ack-Deadline Lease Extension + Cloud Tasks Rate-Limited Dispatch',
    coreAlgorithmCode: `// Idempotent Pub/Sub Push Receiver on Cloud Run (HTTP 2xx = ACK, 4xx/5xx = NACK + Backoff)
app.post("/pubsub/orders", async (req, res) => {
  const msgId = req.body.message.messageId;
  const payload = JSON.parse(Buffer.from(req.body.message.data, "base64").toString());
  // Dedup on messageId (at-least-once delivery guarantee!)
  if (await alreadyProcessed(msgId)) return res.status(204).send();
  await handleOrderEvent(payload);
  await markProcessed(msgId);
  res.status(204).send(); // 2xx ACKs message; errors auto-retry with exponential backoff -> DLT
});`,
    deepImplementationNotes: [
      'Pick Pub/Sub for many-to-many event fan-out and analytics streaming; pick Cloud Tasks when the publisher needs explicit per-queue rate limits, scheduled delays, and target HTTP control.',
      'Pub/Sub push subscriptions deliver straight to private Cloud Run endpoints authenticated via Google-signed OIDC JWTs.',
      'Emit single-line structured JSON logs containing `logging.googleapis.com/trace` so Cloud Logging automatically groups every log line under its distributed Cloud Trace span.',
    ],
    stages: [
      { step: 1, title: 'Global Pub/Sub Topic Ingestion', activeNodeId: 'PS', plainEnglish: 'Publisher appends events to a globally durable Pub/Sub topic with optional Ordering Keys.', runtimeState: 'Replicated across 3 zones · Latency <15 ms', metricBadge: 'Global Durable' },
      { step: 2, title: 'Eventarc / Push Subscription Delivery', activeNodeId: 'SUB', plainEnglish: 'Pub/Sub pushes OIDC-authenticated HTTP requests directly to Cloud Run (scaling workers automatically).', runtimeState: 'OIDC JWT verified · Ack deadline 30s', metricBadge: 'OIDC Push' },
      { step: 3, title: 'Dead-Letter Topic & Cloud Tasks Throttle', activeNodeId: 'DLT', plainEnglish: 'Repeated failures route to a Dead-Letter Topic after 5 attempts; Cloud Tasks rate-limits third-party webhooks.', runtimeState: 'Max 50 req/s enforced · Poison msgs in DLT', metricBadge: 'Rate Protected' },
      { step: 4, title: 'Cloud Trace & Structured Logging', activeNodeId: 'OBS', plainEnglish: 'Cloud Trace correlates every pub/sub hop with Cloud Logging JSON entries and SLO Burn Alerts.', runtimeState: 'W3C Traceparent linked · SLO 99.95% green', metricBadge: 'OTel Native' },
    ],
    buildMermaid: (active, visited) =>
      withActiveHighlight(
        `flowchart LR
  PUB["Producer Service"] -->|"Publish Event"| PS["Cloud Pub/Sub Global Topic"]
  PS -->|"OIDC Push / Pull"| SUB["Cloud Run / GKE Subscriber"]
  PS -.->|"Max Attempts > 5"| DLT[("Dead-Letter Topic")]
  SUB -->|"Rate-Limited Dispatch"| TSK["Cloud Tasks Queue"]
  SUB -->|"Structured JSON + OTel"| OBS["Cloud Trace & Monitoring SLOs"]`,
        active,
        visited
      ),
  },
};

export const AWS_VS_GCP_MERMAID = `flowchart LR
  subgraph AWS["AWS Developer Production Stack"]
    A_LB["CloudFront + AWS ALB"] --> A_CMP["Lambda / Fargate / EKS"]
    A_CMP --> A_Q["SNS + SQS + DLQ"]
    A_CMP --> A_DB[("S3 + DynamoDB + Aurora")]
  end
  subgraph GCP["GCP Developer Production Stack"]
    G_LB["Global Anycast LB + Cloud Armor"] --> G_CMP["Cloud Run / GKE Autopilot"]
    G_CMP --> G_Q["Pub/Sub + Cloud Tasks"]
    G_CMP --> G_DB[("GCS + Cloud SQL + BigQuery")]
  end`;
